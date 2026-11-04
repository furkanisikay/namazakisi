#!/usr/bin/env node
/**
 * Bildirim ve içerik havuzlarında geçen ayetlerin meallerini QuranEnc'ten indirip
 * `src/core/data/ayetMealleri.ts`'e yazar. QuranEnc koşulları: metin DEĞİŞTİRİLMEZ ve
 * KESİLMEZ, yayımcı + kaynak + sürüm belirtilir, en son sürüme güncellenir → bu betik
 * yeniden koşulunca sürüm ve metin tazelenir.
 *
 * Kullanım: node scripts/icerik/ayet-mealleri-uret.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Dil → QuranEnc çeviri anahtarı (Türkçe havuz kendi doğrulanmış metnini taşır). Günün ayeti
 * üreticisiyle aynı seçim; gerekçe `docs/ajan/gunun-ayeti.md > Meal kaynakları`.
 */
const MEALLER = {
  en: 'english_saheeh',
  id: 'indonesian_affairs',
  de: 'german_bubenheim',
  fr: 'french_rashid',
  bs: 'bosnian_rwwad',
  ru: 'russian_rwwad',
  ms: 'malay_basumayyah',
  ur: 'urdu_junagarhi',
  es: 'spanish_garcia',
  nl: 'dutch_center',
  sq: 'albanian_nahi',
  hi: 'hindi_omari',
  bn: 'bengali_zakaria',
  fa: 'persian_ih',
  ps: 'pashto_rwwad',
  ckb: 'kurdish_bamoki',
  ug: 'uyghur_saleh',
  // Orta Asya (dalga 7). Özbekçe ve Kazakça mealler KİRİLDİR: Latin alfabe seçilince çalışma anında
  // çevrilir (`core/dil/yazi.ts > kirildenLatine`), veri Kiril kalır.
  az: 'azeri_musayev',
  uz: 'uzbek_rwwad',
  kk: 'kazakh_altai',
  ky: 'kyrgyz_hakimov',
  tg: 'tajik_arifi',
  // Afrika (dalga 8). sw: `swahili_rwwad` (barawani her ayete "[153]" ekler); om: `oromo_ababor`
  // (rwwad havuzu 159'a düşüyor); ff: `fulani_rwwad` = Pular (Gine, Fuuta Jallon), Latin.
  sw: 'swahili_rwwad',
  ha: 'hausa_gummi',
  am: 'amharic_sadiq',
  om: 'oromo_ababor',
  so: 'somali_yacob',
  ff: 'fulani_rwwad',
  yo: 'yoruba_mikail',
  // Doğu ve Güney Asya (dalga 9). zh: `chinese_suliman` (metni `chinese_makin` = Ma Jian ile neredeyse
  // aynı, noktalaması düzeltilmiş güncel baskı; havuz ikisinde de 186); ta: `tamil_omar` (`tamil_baqavi` her ayete "153." ekler, havuz 121);
  // ko: `korean_rwwad` (çeviri TAMAMLANMAMIŞ: 63 havuz ayeti boş → elenir; `korean_hamid` sözcük içi
  // boşluk ve imla hatası taşır: "하나 님", "너회").
  zh: 'chinese_suliman',
  ta: 'tamil_omar',
  ml: 'malayalam_kunhi',
  th: 'thai_rwwad',
  ko: 'korean_rwwad',
  vi: 'vietnamese_rwwad',
  // Avrupa (dalga 10); her dilde QuranEnc'te tek çeviri var (`*_mokhtasar` tefsirdir, meal değil).
  // pt: `portuguese_nasr` Brezilya Portekizcesidir (arayüz Avrupa normu; meal metni değiştirilmez);
  // sr: `serbian_rwwad` KİRİL (arayüzle aynı yazı).
  pt: 'portuguese_nasr',
  it: 'italian_rwwad',
  sv: 'swedish_rwwad',
  uk: 'ukrainian_yakubovych',
  ro: 'romanian_project',
  hr: 'croatian_rwwad',
  sr: 'serbian_rwwad',
  el: 'greek_rwwad',
  // Dalga 11 (sahip kararı 2026-11-02). Meali olan dört dil; ja: `japanese_saeedsato` sözlük işareti
  // olarak sözcük sonuna "*" koyar ("アッラー*") → Japoncada yalnız "*" silinir (`YILDIZ_SILINEN`).
  // MEALSİZ beş dil (günün ayeti yalnız Arapça + künye; `MEALLER`'e GİRMEZ): ku (QuranEnc'te Latin harfli
  // Kurmancî meal yok; `kurmanji_ismail` Arap harfli Behdinan Kurmancîsidir, alınmaz), tk, tt, sd, pl
  // (QuranEnc'te hiç meal yok; Tanzil mealleri "yalnız ticari olmayan kullanım" lisansıyla kullanılmaz).
  ja: 'japanese_saeedsato',
  gu: 'gujarati_omari',
  bg: 'bulgarian_translation',
  mk: 'macedonian_group',
  // Dalga 12 (sahip kararları 2026-11-04). Meali olan sekiz dil; te ve mr not numarası silinir (`NOT_NUMARASI_SILINEN`;
  // mr cümle sonuna yapışık Devanagari rakamı, `CUMLE_SONU_NOTU_SILINEN`), mr ve ne baştaki ayet numarası silinir.
  // kn: `kannada_hamza` (`kannada_bashir` havuzu daha büyük ama Kannada metne karışmış Latin-1 harfleri taşır:
  // "ದುಷ್ಪೆçÃರಣೆ"); km: `khmer_rwwad` (`khmer_cambodia` sözcük içi boşluk, bozuk coeng sırası ve ASCII nokta
  // taşır). MEALSİZ: pa
  // (QuranEnc'teki tek Pencapça meal `punjabi_arif` Gurmuki yazılıdır; uygulama Pencapçası yalnız Şahmuki → alınmaz).
  fil: 'tagalog_rwwad',
  te: 'telugu_muhammad',
  kn: 'kannada_hamza',
  mr: 'marathi_ansari',
  as: 'assamese_rafeeq',
  ne: 'nepali_central',
  si: 'sinhalese_mahir',
  km: 'khmer_rwwad',
  // Dalga 13 (kapalı iskelet, 2026-11-04). Hepsinde meal VAR (QuranEnc, tarayıcı benzeri User-Agent).
  he: 'hebrew_darussalam',
  ka: 'georgian_rwwad',
  lt: 'lithuanian_rwwad',
  mg: 'malagasy_rwwad',
  lg: 'luganda_foundation',
  rw: 'kinyarwanda_assoc',
  rn: 'ikirundi_gehiti',
  ln: 'lingala_zakaria',
  dag: 'dagbani_ghatubo',
  mos: 'moore_rwwad',
  aa: 'afar_hamza',
  mdh: 'maguindanao_rwwad',
  ak: 'asante_harun',
  ceb: 'bisayan_rwwad',
  nqo: 'ankobambara_dayyan',
};

/** Liste API'sinde görünmeyen çevirilerin QuranEnc başlığı (sitedeki kartta yazdığı gibi). */
const LISTEDE_OLMAYAN_BASLIKLAR = {
  russian_rwwad: 'Russian Translation - Rowwad Translation Center',
  malay_basumayyah: 'Malay Translation - Abdullah Basumayyah',
  bengali_zakaria: 'Bengali Translation - Abu Bakr Zakaria',
  // QuranEnc Kürtçeyi "ku" diliyle listeler; uygulamanın kodu Soranî "ckb" → dil listesinde bulunmaz.
  kurdish_bamoki: 'Kurdish Translation - Muhammad Salih Bamoki',
  // QuranEnc Kazakçayı liste API'sinde vermez (`translations/list/kk` boş); sitedeki kartın başlığı.
  kazakh_altai: 'Kazakh Translation - Khalifa Altai',
  // QuranEnc Koreceyi liste API'sinde vermez (`translations/list/ko` boş); sitedeki kartın başlığı.
  korean_rwwad: 'Korean Translation - Rowwad Translation Center',
  // İtalyanca, Ukraynaca ve Yunanca liste API'sinde yok (`translations/list/<dil>` boş); sitedeki kartın başlığı.
  italian_rwwad: 'Italian Translation - Rowwad Translation Center',
  ukrainian_yakubovych: 'Ukrainian Translation - Mikhailo Yakubovych',
  greek_rwwad: 'Greek Translation - Rowwad Translation Center',
  // Bulgarca liste API'sinde yok (`translations/list/bg` boş); QuranEnc kartı çevirmen adı yazmaz.
  bulgarian_translation: 'Bulgarian Translation',
  // Dalga 12: Filipince QuranEnc'te `tl` koduyla listelenir (uygulama kodu `fil` → dil listesinde bulunmaz);
  // Marathi ve Nepalce liste API'sinde yok (`translations/list/mr`, `/ne` boş). Başlıklar sitedeki karttan.
  tagalog_rwwad: 'Filipino Translation (Tagalog) - Rowwad Translation Center',
  marathi_ansari: 'Marathi Translation - Muhammad Shafee‘ Ansari',
  nepali_central: 'Nepali Translation - Ahlul-Hadith Association',
  // Dalga 13: İbranice, Gürcüce, Malgaşça, Luganda ve Dagbani liste API'sinde yok (`translations/list` 2026-11-04);
  // başlıklar sitedeki karttan (Gürcüce kartı çevirmen adı yazmaz).
  hebrew_darussalam: 'Hebrew Translation - Darussalam Association',
  georgian_rwwad: 'Georgian Translation',
  malagasy_rwwad: 'Malagasy Translation - Rowwad Translation Center',
  luganda_foundation: 'Luganda Translation - African Development Foundation',
  dagbani_ghatubo: 'Dagbani Translation - Muhammad Baba Ghutubo',
};

/**
 * Not numarası silinen diller ve desen — `gunun-ayeti-uret.js > NOT_NUMARASI_SILINEN` ile AYNI
 * (sahip kararı 2026-10-26, Urduca; Bengalce 2026-10-27; Kırgızca 2026-10-30; Hausa 2026-10-31; Portekizce ve Ukraynaca 2026-11-01; Japonca ve Makedonca 2026-11-02; Telugu ve Marathi 2026-11-04; Bengalce rakam "[১]").
 */
const NOT_NUMARASI_SILINEN = new Set(['ur', 'bn', 'ky', 'ha', 'pt', 'uk', 'ja', 'mk', 'te', 'mr']);
// Köşeli ayraç içinde görünmez biçim karakteri olabilir (bengali_zakaria 3:96 "[\u200c১]").
const NOT_NUMARASI = /\s*\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]/gu;
/** Gömülü numara kalıpları (`gunun-ayeti-uret.js > DIPNOT`, `BASTA_NUMARA`, `SONDA_NUMARA` ile aynı). */
/** Ayet numarası silinen diller (`gunun-ayeti-uret.js > AYET_NUMARASI_SILINEN` ile AYNI). */
/** NFC'ye birleştirilen diller (`gunun-ayeti-uret.js > NFC_DILLER` ile AYNI; gerekçe orada). */
const NFC_DILLER = new Set(['yo', 'fil']);
// Gucaratça (Gucarati rakamı "૨૫૫."), Bulgarca ve Makedonca ("255.") da her ayeti numaralı (sahip kararı 2026-10-27);
// Marathi ("१५३. ") ve Nepalce ("१५३) ") de (dalga 12, aynı karar); dalga 13'te Litvanca ve Afarca ("255. "), Dagbani
// ("255. ", "5.Yaa") ve İbranice ("255 ": noktasız, `NOKTASIZ_AYET_NO_SILINEN`).
const AYET_NUMARASI_SILINEN = new Set(['es', 'ug', 'so', 'gu', 'bg', 'mk', 'mr', 'ne', 'lt', 'dag', 'aa', 'he']);
/**
 * Baştaki ayet numarası noktasız ("255 אללה…") yazılan diller (dalga 13, yalnız İbranice `hebrew_darussalam`):
 * numara ve ardındaki boşluk silinir. Başka dilde noktasız baştaki numara `NUMARALI` ile elenir.
 */
const NOKTASIZ_AYET_NO_SILINEN = new Set(['he']);
const NOKTASIZ_AYET_NO = /^\s*\p{Nd}+\s+/u;
/**
 * Cümle sonuna yapışık not numarası silinen diller (sahip kararı 2026-11-04, yalnız Marathi): `marathi_ansari`
 * dipnot numarasını köşeli ayraçsız, cümle sonu işaretine yapışık yazar ("…देतो.१", "…आहे?१ मुळीच"). Yalnız
 * cümle sonu işaretinden (. ? ! ।) HEMEN sonra gelen rakam silinir, işaret kalır; sözcüğe yapışık ya da boşluktan
 * sonra gelen rakama ("शिकवावे१", "दाखव. १") DOKUNULMAZ — o meal hâlâ rakam taşıdığı için alınmaz.
 */
const CUMLE_SONU_NOTU_SILINEN = new Set(['mr']);
const CUMLE_SONU_NOTU = /([.?!।])\p{Nd}+(?![\p{L}\p{M}])/gu;
/**
 * Yıldızı silinen diller (sahip kararı 2026-11-02, yalnız Japonca): `japanese_saeedsato` sözlük işareti
 * olarak sözcük sonuna "*" koyar ("アッラー*"); işaret silinir, metnin geri kalanı (tam genişlik
 * parantezler "（…）" dahil) birebir kalır. Diğer dillerde "*" dipnot işaretidir, meal alınmaz.
 */
const YILDIZ_SILINEN = new Set(['ja']);
const YILDIZ = /\*/g;
/** Latin harf taşıyamayan meal dilleri (`gunun-ayeti-uret.js > LATIN_HARF_BOZUK` ile AYNI). */
const LATIN_HARF_BOZUK = new Set(['te', 'kn', 'mr', 'as', 'ne', 'si', 'km', 'he', 'ka', 'nqo']);
/** Latin harfli dalga 13 meal dilleri ve yabancı harf deseni (`gunun-ayeti-uret.js > YABANCI_HARF_BOZUK` ile AYNI; gerekçe orada). */
const YABANCI_HARF_BOZUK = new Set(['lt', 'mg', 'lg', 'rw', 'rn', 'ln', 'dag', 'mos', 'aa', 'mdh', 'ak', 'ceb']);
const YABANCI_HARF = /[\p{Script=Cyrillic}\p{Script=Hebrew}\p{Cc}]|(?!\ufdfa)(?=\p{Script=Arabic})\p{L}/u;
const NUMARALI = [
  /\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]|\*/u,
  /^\s*\p{Nd}+\s*[.)]?\s/u,
  /\(\p{Nd}+\)\s*[.।]?\s*$/u,
  /\([\p{Cf}\sـ\-–]*\p{Nd}[\p{Nd}\p{Cf}\sـ\-–]*\)/u, // `ARA_NUMARA`: "(24)،", "(ـ18)", "(8ـ10)"
  /[\u00a6\ufffd]/u, // `BOZUK_KARAKTER`: hausa_gummi "¦aki" (Ɗ bozulmuş)
];

/** QuranEnc 403 döner: her istekte tarayıcı benzeri User-Agent ŞART. */
const BASLIKLAR = { 'User-Agent': 'Mozilla/5.0 (namazakisi icerik uretici)' };

/** Havuzlarda geçen ayetler: [sûre, ayet]. Yeni ayet eklerken buraya ekleyip betiği koş. */
const AYETLER = [
  [2, 153], [2, 238], [4, 103], [11, 114], [29, 45], [62, 9],
];

const KOK = path.resolve(__dirname, '..', '..');
const HEDEF = path.join(KOK, 'src', 'core', 'data', 'ayetMealleri.ts');

async function json(url) {
  const yanit = await fetch(url, { headers: BASLIKLAR });
  if (!yanit.ok) throw new Error(`${url} → ${yanit.status}`);
  return yanit.json();
}

/**
 * Sürüm `translations/updates` ucundan (liste API'si bazı çevirileri göstermez); uç
 * belgelenmemiş olduğu için biçimi değişirse ya da listedeki sürümle çelişirse hata verir.
 */
async function kunye(dil, anahtar) {
  const guncel = await json(`https://quranenc.com/api/v1/translations/updates?key=${anahtar}`);
  if (guncel.key !== anahtar || !/^\d+\.\d+\.\d+$/.test(String(guncel.version))) {
    throw new Error(`${anahtar}: updates ucunun yanıtı beklenen biçimde değil`);
  }
  const listede = await json(`https://quranenc.com/api/v1/translations/list/${dil}`)
    .then((l) => l.translations.find((t) => t.key === anahtar))
    .catch(() => null);
  if (listede && listede.version !== guncel.version) {
    throw new Error(`${anahtar}: liste sürümü ${listede.version} ≠ updates sürümü ${guncel.version}`);
  }
  const baslik = listede?.title ?? LISTEDE_OLMAYAN_BASLIKLAR[anahtar];
  if (!baslik) throw new Error(`${anahtar} için başlık yok (LISTEDE_OLMAYAN_BASLIKLAR'a ekleyin)`);
  return { surum: guncel.version, baslik };
}

async function main() {
  const veri = {};
  for (const [dil, anahtar] of Object.entries(MEALLER)) {
    const { surum, baslik } = await kunye(dil, anahtar);
    const ayetler = {};
    for (const [sure, ayet] of AYETLER) {
      const { result } = await json(`https://quranenc.com/api/v1/translation/aya/${anahtar}/${sure}/${ayet}`);
      // Urducada ve Bengalcede yalnız "[1]" / "[১]" türü not numarası silinir (gunun-ayeti-uret.js).
      if (NFC_DILLER.has(dil)) result.translation = result.translation.normalize('NFC');
      if (NOT_NUMARASI_SILINEN.has(dil)) result.translation = result.translation.replace(NOT_NUMARASI, '').trim();
      if (YILDIZ_SILINEN.has(dil)) result.translation = result.translation.replace(YILDIZ, '');
      if (NOKTASIZ_AYET_NO_SILINEN.has(dil)) result.translation = result.translation.replace(NOKTASIZ_AYET_NO, '');
      if (AYET_NUMARASI_SILINEN.has(dil)) {
        result.translation = result.translation
          .replace(/^\s*\p{Nd}+\s*[.)]\s*/u, '')
          .replace(/\s*\(\p{Nd}+\)(\s*[.।]?)\s*$/u, '$1')
          .trim();
      }
      if (CUMLE_SONU_NOTU_SILINEN.has(dil)) result.translation = result.translation.replace(CUMLE_SONU_NOTU, '$1');
      // Baştaki/sondaki boşluk metin değildir (kurdish_bamoki "\n" ile biter).
      result.translation = result.translation.trim();
      // Tamamlanmamış çeviri (korean_rwwad) bazı ayetleri boş verir: o ayet o dilde gösterilmez.
      if (!result.translation) {
        console.log(`  atlandı ${dil} ${sure}:${ayet} (boş meal)`);
        continue;
      }
      // Dipnot işaretli ya da başında ayet numarası olan meal metin değiştirilemeyeceği için
      // ALINMAZ: o ayet o dilde gösterilmez (`nassDili.ayetMeali` null döner).
      // Cümle sonu notu silinen dilde (Marathi) kalan rakam sözcüğe yapışık dipnot numarasıdır.
      if (
        NUMARALI.some((d) => d.test(result.translation)) ||
        (CUMLE_SONU_NOTU_SILINEN.has(dil) && /\p{Nd}/u.test(result.translation)) ||
        // Latin dışı yazılı mealde Latin harf kaynak bozulmasıdır (`gunun-ayeti-uret.js > LATIN_HARF_BOZUK`).
        (LATIN_HARF_BOZUK.has(dil) && /\p{Script=Latin}/u.test(result.translation)) ||
        (YABANCI_HARF_BOZUK.has(dil) && YABANCI_HARF.test(result.translation))
      ) {
        console.log(`  atlandı ${dil} ${sure}:${ayet} (dipnot işareti)`);
        continue;
      }
      ayetler[`${sure}:${ayet}`] = result.translation;
    }
    veri[dil] = { anahtar, surum, baslik, ayetler };
  }
  const govde = `/**
 * ÜRETİLMİŞ DOSYA — elle düzenleme; \`node scripts/icerik/ayet-mealleri-uret.js\`.
 * Kaynak: QuranEnc (quranenc.com). Metinler değiştirilmeden ve kesilmeden alınır;
 * ekranda yayımcı ve sürümle birlikte gösterilir (\`ayetKunyesi\`).
 */
export interface MealKaynagi {
  /** QuranEnc çeviri anahtarı. */
  anahtar: string;
  surum: string;
  baslik: string;
  /** "sûre:ayet" → meal (birebir). */
  ayetler: Readonly<Record<string, string>>;
}

export const AYET_MEALLERI: Readonly<Record<string, MealKaynagi>> = ${JSON.stringify(veri, null, 2)};
`;
  fs.writeFileSync(HEDEF, govde);
  console.log(`${HEDEF} yazıldı (${Object.keys(veri).join(', ')})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
