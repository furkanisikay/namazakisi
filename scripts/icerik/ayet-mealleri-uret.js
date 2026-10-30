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
};

/**
 * Not numarası silinen diller ve desen — `gunun-ayeti-uret.js > NOT_NUMARASI_SILINEN` ile AYNI
 * (sahip kararı 2026-10-26, Urduca; Bengalce 2026-10-27; Kırgızca 2026-10-30; Bengalce rakam "[১]").
 */
const NOT_NUMARASI_SILINEN = new Set(['ur', 'bn', 'ky']);
// Köşeli ayraç içinde görünmez biçim karakteri olabilir (bengali_zakaria 3:96 "[\u200c১]").
const NOT_NUMARASI = /\s*\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]/gu;
/** Gömülü numara kalıpları (`gunun-ayeti-uret.js > DIPNOT`, `BASTA_NUMARA`, `SONDA_NUMARA` ile aynı). */
/** Ayet numarası silinen diller (`gunun-ayeti-uret.js > AYET_NUMARASI_SILINEN` ile AYNI). */
const AYET_NUMARASI_SILINEN = new Set(['es', 'ug']);
const NUMARALI = [
  /\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]|\*/u,
  /^\s*\p{Nd}+\s*[.)]\s/u,
  /\(\p{Nd}+\)\s*[.।]?\s*$/u,
  /\([\p{Cf}\sـ\-–]*\p{Nd}[\p{Nd}\p{Cf}\sـ\-–]*\)/u, // `ARA_NUMARA`: "(24)،", "(ـ18)", "(8ـ10)"
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
      if (NOT_NUMARASI_SILINEN.has(dil)) result.translation = result.translation.replace(NOT_NUMARASI, '').trim();
      if (AYET_NUMARASI_SILINEN.has(dil)) {
        result.translation = result.translation
          .replace(/^\s*\p{Nd}+\s*[.)]\s*/u, '')
          .replace(/\s*\(\p{Nd}+\)(\s*[.।]?)\s*$/u, '$1')
          .trim();
      }
      // Baştaki/sondaki boşluk metin değildir (kurdish_bamoki "\n" ile biter).
      result.translation = result.translation.trim();
      // Dipnot işaretli ya da başında ayet numarası olan meal metin değiştirilemeyeceği için
      // ALINMAZ: o ayet o dilde gösterilmez (`nassDili.ayetMeali` null döner).
      if (NUMARALI.some((d) => d.test(result.translation))) {
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
