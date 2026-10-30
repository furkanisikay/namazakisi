#!/usr/bin/env node
/**
 * "Günün ayeti" havuzunu üretir → `src/core/data/gununAyetiHavuzu.ts`.
 *
 * Kaynaklar (sahip kararı 2026-10-24):
 * - Meal: QuranEnc (`turkish_rwwad`, `english_saheeh`). Metin DEĞİŞTİRİLMEZ ve KESİLMEZ;
 *   ekranda yayımcı + sürüm yazılır. Yeniden koşunca en son sürüm ve metin gelir.
 * - Arapça: Tanzil Uthmani metni, birebir (değiştirmek yasak; kaynak "Tanzil Project" ve
 *   tanzil.net bağlantısı gösterilir — CC BY 3.0).
 *
 * Aday listesi (`ADAYLAR`) elle seçilir; havuza girme kuralları MEKANİKTİR ve burada uygulanır
 * (nöbetçi: `src/core/data/__tests__/gununAyetiHavuzu.test.ts` aynı kuralları üretilmiş veride
 * yeniden doğrular). Elenen her aday gerekçesiyle konsola yazılır.
 *
 * Kullanım:
 *   node scripts/icerik/gunun-ayeti-uret.js
 *   node scripts/icerik/gunun-ayeti-uret.js --onbellek <dizin>   # indirmeleri dizinde sakla/yeniden kullan
 */
'use strict';
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..', '..');
const HEDEF = path.join(KOK, 'src', 'core', 'data', 'gununAyetiHavuzu.ts');

/** QuranEnc 403 döner: her istekte tarayıcı benzeri User-Agent ŞART. */
const BASLIKLAR = { 'User-Agent': 'Mozilla/5.0 (namazakisi icerik uretici)' };

/** Dil → QuranEnc çeviri anahtarı. Seçim gerekçesi: `docs/ajan/gunun-ayeti.md > Meal kaynakları`. */
const MEALLER = {
  tr: 'turkish_rwwad',
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

/**
 * Liste API'sinde görünmeyen çevirilerin QuranEnc başlığı (sitedeki kartta yazdığı gibi).
 * Sürüm her zaman `translations/updates` ucundan okunur.
 */
const LISTEDE_OLMAYAN_BASLIKLAR = {
  russian_rwwad: 'Russian Translation - Rowwad Translation Center',
  malay_basumayyah: 'Malay Translation - Abdullah Basumayyah',
  bengali_zakaria: 'Bengali Translation - Abu Bakr Zakaria',
  // QuranEnc Kürtçeyi "ku" diliyle listeler; uygulamanın kodu Soranî "ckb" → dil listesinde bulunmaz.
  kurdish_bamoki: 'Kurdish Translation - Muhammad Salih Bamoki',
  // QuranEnc Kazakçayı liste API'sinde vermez (`translations/list/kk` boş); sitedeki kartın başlığı.
  kazakh_altai: 'Kazakh Translation - Khalifa Altai',
};

const TANZIL_URL = 'https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&agree=true';

/** Kural 1: her dilde meal en fazla bu kadar karakter. */
const AZAMI_UZUNLUK = 200;

/**
 * Kural 5: vakte özgü ayetler genel havuza girmez (AGENTS.md fıkıh kuralı); İsrâ 17/79 hiç
 * kullanılmaz. Sabah/akşam tesbihi ve gece ibadeti ayetleri de vakte bağlıdır.
 */
const VAKTE_OZGU = [
  '2:238', '3:17', '3:41', '4:103', '7:205', '11:114', '17:78', '17:79', '19:11', '20:130',
  '24:58', '30:17', '30:18', '33:42', '38:18', '40:55', '48:9', '50:39', '50:40', '51:17',
  '51:18', '52:48', '52:49', '62:9', '62:10', '73:2', '73:3', '73:4', '73:6', '73:20',
  '76:25', '76:26',
];

/**
 * Aday ayetler [sûre, ayet]. Ölçüt: tek başına okununca eksiksiz bir hatırlatma; savaş,
 * hukuk hükmü (miras, boşanma, ceza), adı anılan bir topluluğu kınama, gruba yönelik tehdit
 * ve anlamı öncesindeki kıssaya bağlı ayet YOK. "De ki:" ile başlayan ayetler (Peygamber'e
 * söyletilen hitap) bilinçli olarak seçilmedi; listede olanlar kuralların işlediğini göstermek
 * içindir. Kurallara takılan bilinen güzel ayetler de listede kalır (log kuralları belgeler).
 */
const ADAYLAR = [
  // Allah'ın isimleri, sıfatları ve tevhid
  [1, 5], [2, 107], [5, 40], [6, 117], [16, 3], [16, 22], [33, 54], [39, 63], [54, 49], [58, 21], [3, 5], [3, 6], [3, 109], [4, 87], [5, 120], [6, 102], [9, 116], [10, 55],
  [10, 56], [13, 10], [15, 86], [17, 22], [20, 6], [20, 8], [21, 19], [21, 22], [22, 62],
  [22, 64], [26, 220], [31, 26], [34, 1], [34, 2], [35, 38], [36, 82], [37, 180], [39, 62],
  [40, 19], [40, 62], [42, 9], [42, 12], [43, 82], [44, 8], [49, 18], [55, 78], [57, 2],
  [57, 3], [57, 5], [57, 6], [59, 22], [59, 23], [59, 24], [64, 4], [64, 13], [64, 18],
  [67, 1], [85, 13], [89, 14], [95, 8], [112, 1], [112, 2], [112, 3], [112, 4], [2, 255],
  // Rahmet, umut, tövbe ve bağışlanma
  [2, 186], [2, 263], [2, 268], [3, 133], [3, 135], [4, 26], [4, 27], [4, 31], [4, 40],
  [4, 110], [5, 9], [5, 98], [6, 54], [7, 56], [7, 156], [9, 128], [10, 57], [11, 90],
  [12, 87], [15, 49], [16, 18], [16, 128], [20, 82], [25, 70], [35, 2], [39, 53],
  [40, 7], [42, 25], [57, 9], [66, 8], [67, 12], [71, 10], [93, 3], [94, 5], [94, 6],
  // Sabır, tevekkül ve imtihan
  [2, 153], [2, 155], [2, 156], [2, 214], [2, 286], [3, 139], [3, 160], [3, 173], [3, 200],
  [8, 46], [11, 56], [11, 115], [16, 96], [16, 127], [18, 7], [21, 35], [29, 2],
  [29, 69], [31, 31], [39, 10], [40, 44], [57, 22], [57, 23], [64, 11], [64, 15],
  [65, 3], [20, 46], [12, 86], [29, 57],
  // Şükür, nimetler ve kâinattaki ayetler (tefekkür)
  [2, 152], [2, 172], [3, 190], [3, 191], [6, 1], [10, 6], [14, 7], [14, 24], [14, 34],
  [16, 10], [16, 11], [16, 48], [16, 53], [16, 79], [17, 66], [17, 70], [21, 30], [24, 44],
  [25, 61], [27, 86], [46, 3], [29, 19], [29, 44], [29, 62], [30, 11], [30, 21], [30, 22], [35, 27],
  [36, 12], [36, 40], [36, 81], [40, 57], [45, 3], [45, 12], [45, 13], [46, 33],
  [50, 6], [51, 21], [55, 13], [55, 26], [55, 27], [55, 60], [67, 2], [67, 19], [75, 40],
  [76, 1], [76, 3], [78, 6], [90, 8], [13, 26], [17, 30], [39, 52], [22, 75],
  // Zikir, dua ve ibadet
  [1, 6], [2, 201], [2, 238], [3, 8], [7, 23], [7, 55], [7, 180], [7, 201], [7, 206],
  [13, 28], [14, 38], [14, 40], [14, 41], [17, 24], [17, 79], [17, 80], [20, 25], [20, 114],
  [21, 83], [21, 87], [22, 77], [23, 1], [23, 2], [25, 74], [28, 24], [29, 45], [32, 15],
  [33, 41], [33, 56], [40, 60], [50, 16], [51, 56], [62, 9], [63, 9], [73, 8], [87, 14],
  [87, 15], [96, 19], [97, 1], [97, 3], [2, 45], [15, 99], [73, 20],
  // Güzel ahlak, adalet, kardeşlik ve sorumluluk
  [2, 168], [2, 177], [2, 208], [2, 277], [3, 92], [3, 102], [3, 134], [4, 36], [4, 58],
  [4, 134], [4, 135], [4, 148], [5, 2], [5, 8], [5, 35], [5, 87], [5, 91], [7, 31], [7, 199],
  [9, 119], [16, 90], [16, 97], [16, 125], [17, 23], [17, 36], [17, 37], [17, 53], [18, 30],
  [24, 51], [25, 63], [28, 77], [31, 17], [31, 18], [31, 19], [33, 21], [33, 70], [41, 34],
  [41, 46], [42, 40], [45, 15], [46, 13], [47, 7], [47, 33], [49, 6], [49, 10], [49, 11],
  [49, 12], [49, 13], [57, 18], [59, 9], [61, 2], [61, 3], [76, 8], [76, 9], [99, 7],
  [99, 8], [10, 9], [11, 23], [98, 7], [41, 8], [22, 14], [22, 38], [8, 53], [35, 6], [7, 3],
  // İlim ve Kur'an
  [3, 138], [14, 52], [15, 9], [17, 82], [24, 46], [29, 41], [35, 28], [39, 9],
  [45, 20], [54, 17], [58, 11], [59, 21], [73, 19], [96, 1], [3, 96], [43, 3], [48, 28],
  [56, 77],
  // Ahiret, ölüm ve hesap
  [3, 185], [10, 44], [18, 46], [19, 40], [40, 59], [19, 67], [19, 93], [20, 55], [21, 1], [22, 1],
  [23, 115], [27, 89], [28, 83], [29, 5], [29, 56], [29, 64], [31, 33], [35, 5], [35, 15],
  [35, 16], [40, 39], [42, 17], [47, 36], [50, 18], [57, 20], [57, 21], [59, 18], [59, 20],
  [64, 2], [68, 34], [85, 11], [86, 4], [87, 17], [89, 27], [89, 28], [92, 4], [93, 4],
  [96, 8], [103, 1], [103, 2], [103, 3],
];

const ref = (sure, ayet) => `${sure}:${ayet}`;

/**
 * Bir adayı kurallardan geçirir; elenme gerekçelerini döner (boş dizi = havuza girer).
 * Kural 3 ve 4 bilinçli olarak tutucudur: emin olunamayan aday elenir.
 */
/** Kural 1 ve 2 tek meal için: sığar ve dipnot işareti / baştaki ayet numarası taşımaz. */
/**
 * Not numarası silinen diller (sahip kararı 2026-10-26, Urduca; Bengalce 2026-10-27; Kırgızca 2026-10-30): mealde
 * ayetlerin çoğu "[1]" / "[১]" (Bengalce rakam) gibi dipnot numarası taşır; dipnot gösterilmediği
 * için yalnız numara silinir, meal sözcükleri birebir kalır. Diğer dillerde numaralı meal alınmaz
 * (`mealUygun`). `ayet-mealleri-uret.js` aynı kümeyi ve deseni kullanır.
 */
const NOT_NUMARASI_SILINEN = new Set(['ur', 'bn', 'ky']);
/** Dipnot numarası, herhangi bir yazının rakamıyla ("[12]", "[১২]", "[१२]"); `\p{Nd}` + `u`. */
// Köşeli ayraç içinde görünmez biçim karakteri olabilir (bengali_zakaria 3:96 "[\u200c১]").
const NOT_NUMARASI = /\s*\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]/gu;
/**
 * Ayet numarası silinen diller (sahip kararı 2026-10-27): mealin HER ayeti baştaki "153. " ya da
 * sondaki "(153)" numarasını taşır; numara çeviri değil işarettir, silinir (künye ayeti zaten
 * yazar). Yalnız bu kümede: başka dilde numaralı meal eskisi gibi alınmaz.
 */
const AYET_NUMARASI_SILINEN = new Set(['es', 'ug']);
const BASTAKI_AYET_NO = /^\s*\p{Nd}+\s*[.)]\s*/u;
const SONDAKI_AYET_NO = /\s*\(\p{Nd}+\)(\s*[.।]?)\s*$/u;
function notNumarasiz(dil, metin) {
  let m = NOT_NUMARASI_SILINEN.has(dil) ? metin.replace(NOT_NUMARASI, '').trim() : metin;
  if (AYET_NUMARASI_SILINEN.has(dil)) m = m.replace(BASTAKI_AYET_NO, '').replace(SONDAKI_AYET_NO, '$1').trim();
  // Baştaki/sondaki boşluk metin değildir (kurdish_bamoki her ayeti "\n" ile bitirir); sözcüklere dokunulmaz.
  return m.trim();
}

/**
 * Metne gömülü numara kalıpları — rakam HER yazıda (`\p{Nd}`: Batı, Devanagari २, Bengalce ১,
 * Gucarati ૨, Arap-Hint ٢…); ASCII `\d` bunları kaçırır. Nöbetçi testteki kural 2 aynı desenler.
 */
const DIPNOT = /\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]|\*/u; // "[915]", "[১]", "*"
const BASTA_NUMARA = /^\s*\p{Nd}+\s*[.)]\s/u; // "153. …", "२. …"
const SONDA_NUMARA = /\(\p{Nd}+\)\s*[.।]?\s*$/u; // "… (153)", "… (१५३)।"
/** Silinemeyen ayet numarası, metnin herhangi bir yerinde: "(24)،", "(ـ18).", "(8ـ10)" (uyghur_saleh). */
const ARA_NUMARA = /\([\p{Cf}\sـ\-–]*\p{Nd}[\p{Nd}\p{Cf}\sـ\-–]*\)/u;

/** Bir mealin elenme gerekçeleri (boş = uygun). */
function mealGerekce(metin) {
  const g = [];
  if (metin.length > AZAMI_UZUNLUK) g.push('uzunluk');
  if (DIPNOT.test(metin)) g.push('dipnot');
  if (BASTA_NUMARA.test(metin)) g.push('basta-numara');
  if (SONDA_NUMARA.test(metin)) g.push('sonda-numara');
  else if (ARA_NUMARA.test(metin)) g.push('ara-numara');
  return g;
}

function mealUygun(metin) {
  return mealGerekce(metin).length === 0;
}

/**
 * Havuzu Türkçe ve İngilizce meal belirler (kural 3 ve 4 bu iki dilin metniyle denetlenir).
 * Diğer dillerin meali kayda yalnız `mealUygun` ise girer; o dilin havuzu meali olan
 * kayıtlardır (`core/icerik/gununAyeti.ts > dilHavuzu`). Ortak kesişim havuzu yarıya
 * indirdiği için (Malayca meal parantez içi tefsirle uzundur) dil başına alt küme seçildi.
 */
function eleme(sure, ayet, tr, en, ar) {
  const gerekce = [];
  // 1 — uzunluk (her iki dilde)
  if (tr.length > AZAMI_UZUNLUK || en.length > AZAMI_UZUNLUK) gerekce.push('1-uzunluk');
  // 2 — dipnot işareti ("[1354]", "*")
  if (DIPNOT.test(tr) || DIPNOT.test(en) || BASTA_NUMARA.test(tr) || BASTA_NUMARA.test(en) || SONDA_NUMARA.test(tr) || SONDA_NUMARA.test(en)) {
    gerekce.push('2-dipnot');
  }
  // 3 — önceki ayetin cümlesinin devamı / kıssaya bağlı anlatım
  const devam =
    // Türkçe: bağlaç/zamir devamı ya da küçük harfle başlama ("\b" Türkçe harfte çalışmaz → açık ayraç)
    /^(Ve|Ki|O|Onlar|Ama|Fakat|Çünkü|Böylece|Hani|Oysa|Bunun sebebi)[\s,;:!]/.test(tr) ||
    /^\((Ve|Ama|Fakat|Çünkü)\)/.test(tr) ||
    /^[a-zçğıöşü]/.test(tr) ||
    // Türkçe: harf, tırnak ya da ayraçla başlamayan ("- Size ...") ve tek tırnaklı alıntı ("'Rabbim! ...''")
    /^[-–—]/.test(tr) ||
    /^'|''/.test(tr) ||
    // İngilizce: küçük harf, bağlaç/ilgi zamiri devamı, kapanan tırnakla başlama
    /^[a-z]/.test(en) ||
    /^(And|So|But|Then|Who|Those who|Except|Until|Or|Nor|Rather|While|That is because)[\s,]/.test(en) ||
    /^No!/.test(en) ||
    /^["”’]/.test(en) ||
    // İngilizce: bitiş noktalaması yok ya da açık kalan tırnak
    !/[.!?]["”’)\]]*$/.test(en) ||
    (en.match(/"/g) || []).length % 2 === 1 ||
    // Türkçe: dengesiz tırnak
    (tr.match(/“/g) || []).length !== (tr.match(/”/g) || []).length ||
    (tr.match(/"/g) || []).length % 2 === 1 ||
    // Kıssa anlatımı: "[Moses] said, ..." / "They said, ..." (söyleyen önceki ayetlerde)
    /^.{0,40}\bsaid\b/.test(en) ||
    /^Said /.test(en);
  if (devam) gerekce.push('3-devam');
  // 4 — yalnız Peygamber'e hitap
  if (
    /O Muḥammad|O Prophet|O Messenger/.test(en) ||
    /Ey (Peygamber|Muhammed|Nebi|Rasûl|Resûl)|Rasûlüm|Resûlüm|Resulüm/.test(tr)
  ) {
    gerekce.push('4-peygambere-hitap');
  }
  // 5 — vakte özgü ayet / İsrâ 17:79
  if (VAKTE_OZGU.includes(ref(sure, ayet))) gerekce.push('5-vakte-ozgu');
  // 6 — Arapça Tanzil'de olmalı. Tanzil (txt) her sûrenin 1. ayetinin başına besmele ekler
  // (Fâtiha ve Tevbe hariç; yazımı da değişir: "بِسْمِ" / "بِّسْمِ"); metin değiştirilemeyeceği
  // için bu ayetler meal ile örtüşmez → elenir.
  if (!ar) gerekce.push('6-arapca-yok');
  else if (sure !== 1 && sure !== 9 && ayet === 1) gerekce.push('6-tanzil-besmele-oneki');
  return gerekce;
}

function onbellekDizini() {
  const i = process.argv.indexOf('--onbellek');
  if (i < 0) return null;
  const dizin = path.resolve(process.argv[i + 1]);
  fs.mkdirSync(dizin, { recursive: true });
  return dizin;
}

async function indir(url, onbellek, ad) {
  const yol = onbellek ? path.join(onbellek, ad) : null;
  if (yol && fs.existsSync(yol)) return fs.readFileSync(yol, 'utf8');
  const yanit = await fetch(url, { headers: BASLIKLAR });
  if (!yanit.ok) throw new Error(`${url} → ${yanit.status}`);
  const metin = await yanit.text();
  if (yol) fs.writeFileSync(yol, metin);
  return metin;
}

/** Tanzil "sure|ayet|metin" dosyası → { "s:a": metin }, başlık yorumundan sürüm. */
function tanzilCoz(metin) {
  const ayetler = {};
  let surum = null;
  for (const satir of metin.split('\n')) {
    if (satir.startsWith('#')) {
      const m = satir.match(/Tanzil Quran Text \(Uthmani, Version ([^)]+)\)/);
      if (m) surum = m[1].trim();
      continue;
    }
    const [s, a, ...geri] = satir.split('|');
    if (!s || !a || !geri.length) continue;
    ayetler[ref(Number(s), Number(a))] = geri.join('|').replace(/\r$/, '');
  }
  if (!surum) throw new Error('Tanzil sürümü başlıkta bulunamadı');
  return { surum, ayetler };
}

/** QuranEnc başlığından yayımcı: "Turkish Translation - Rowwad Translation Center" → "Rowwad Translation Center". */
function yayimci(baslik) {
  const i = baslik.lastIndexOf(' - ');
  return i >= 0 ? baslik.slice(i + 3) : baslik;
}

/**
 * Çevirinin künyesi. Sürüm `translations/updates` ucundan (liste API'si bazı çevirileri
 * göstermez); uç belgelenmemiş olduğu için biçimi değişirse ya da listedeki sürümle
 * çelişirse SESSİZCE geçmez, hata verir.
 */
async function mealKunyesi(dil, anahtar, onbellek) {
  const guncel = JSON.parse(
    await indir(`https://quranenc.com/api/v1/translations/updates?key=${anahtar}`, onbellek, `surum_${anahtar}.json`),
  );
  if (guncel.key !== anahtar || !/^\d+\.\d+\.\d+$/.test(String(guncel.version))) {
    throw new Error(`${anahtar}: updates ucunun yanıtı beklenen biçimde değil: ${JSON.stringify(guncel).slice(0, 200)}`);
  }
  let liste = null;
  try {
    liste = JSON.parse(await indir(`https://quranenc.com/api/v1/translations/list/${dil}`, onbellek, `liste_${dil}.json`));
  } catch {
    liste = null; // Dil listede hiç yok (ru, ms): başlık yedek tablodan.
  }
  const listede = liste?.translations?.find((t) => t.key === anahtar);
  if (listede && listede.version !== guncel.version) {
    throw new Error(`${anahtar}: liste sürümü ${listede.version} ≠ updates sürümü ${guncel.version}`);
  }
  const baslik = listede?.title ?? LISTEDE_OLMAYAN_BASLIKLAR[anahtar];
  if (!baslik) throw new Error(`${anahtar} için başlık yok (LISTEDE_OLMAYAN_BASLIKLAR'a ekleyin)`);
  return { anahtar, surum: guncel.version, baslik: yayimci(baslik) };
}

async function main() {
  const onbellek = onbellekDizini();

  // Aday listesinde tekrar olmasın (seçim hatası erken yakalanır).
  const gorulen = new Set();
  for (const [s, a] of ADAYLAR) {
    const r = ref(s, a);
    if (gorulen.has(r)) throw new Error(`Aday listesinde tekrar: ${r}`);
    gorulen.add(r);
  }

  const tanzil = tanzilCoz(await indir(TANZIL_URL, onbellek, 'tanzil-uthmani.txt'));

  const kunyeler = {};
  /** `ham`: not numarası silinmeden önceki metin (yalnız eleme özeti için). */
  const mealler = { ham: {} };
  const sureler = [...new Set(ADAYLAR.map(([s]) => s))].sort((x, y) => x - y);
  for (const [dil, anahtar] of Object.entries(MEALLER)) {
    kunyeler[dil] = await mealKunyesi(dil, anahtar, onbellek);
    mealler[dil] = {};
    mealler.ham[dil] = {};
    for (const sure of sureler) {
      const { result } = JSON.parse(
        await indir(`https://quranenc.com/api/v1/translation/sura/${anahtar}/${sure}`, onbellek, `${anahtar}_${sure}.json`),
      );
      for (const r of result) {
        mealler[dil][ref(Number(r.sura), Number(r.aya))] = notNumarasiz(dil, r.translation);
        mealler.ham[dil][ref(Number(r.sura), Number(r.aya))] = r.translation;
      }
    }
  }

  const havuz = [];
  const elenen = [];
  for (const [sure, ayet] of ADAYLAR) {
    const r = ref(sure, ayet);
    for (const dil of Object.keys(MEALLER)) {
      if (mealler[dil][r] == null) throw new Error(`${r} için QuranEnc ${dil} meali yok`);
    }
    const tr = mealler.tr[r];
    const en = mealler.en[r];
    const ar = tanzil.ayetler[r];
    const gerekce = eleme(sure, ayet, tr, en, ar);
    if (gerekce.length) {
      elenen.push({ ref: r, gerekce, en });
      continue;
    }
    const ayetMealleri = { tr, en };
    for (const dil of Object.keys(MEALLER)) {
      if (dil !== 'tr' && dil !== 'en' && mealUygun(mealler[dil][r])) ayetMealleri[dil] = mealler[dil][r];
    }
    havuz.push({ ref: r, sure, ayet, ar, mealler: ayetMealleri });
  }
  havuz.sort((x, y) => x.sure - y.sure || x.ayet - y.ayet);
  elenen.sort((x, y) => {
    const [xs, xa] = x.ref.split(':').map(Number);
    const [ys, ya] = y.ref.split(':').map(Number);
    return xs - ys || xa - ya;
  });

  const kaynaklar = {
    ar: { ad: 'Tanzil', surum: tanzil.surum, url: 'https://tanzil.net' },
    mealler: kunyeler,
  };
  const govde = `/**
 * ÜRETİLMİŞ DOSYA — elle düzenleme; \`node scripts/icerik/gunun-ayeti-uret.js\`.
 *
 * "Günün ayeti" havuzu. Seçim ve eleme kuralları üreticidedir; nöbetçi
 * \`__tests__/gununAyetiHavuzu.test.ts\` kuralları bu veride yeniden doğrular.
 *
 * Arapça: Tanzil Quran Text (Uthmani), Tanzil Project — CC BY 3.0. Metin birebirdir,
 * DEĞİŞTİRİLEMEZ; gösterildiği yerde kaynak (Tanzil Project) ve https://tanzil.net
 * bağlantısı verilir.
 * Mealler: QuranEnc (quranenc.com). Metinler değiştirilmeden ve kesilmeden alınır;
 * ekranda yayımcı ve sürümle birlikte gösterilir.
 */
export interface GununAyetiKaydi {
  /** "sûre:ayet" */
  ref: string;
  sure: number;
  ayet: number;
  /** Tanzil Uthmani, birebir. */
  ar: string;
  /**
   * QuranEnc mealleri, birebir. Türkçe ve İngilizce her kayıtta var; diğer diller yalnız
   * meal sığıyor ve dipnot işareti taşımıyorsa (o dilin havuzu meali olan kayıtlardır).
   */
  mealler: { readonly tr: string; readonly en: string } & Readonly<Partial<Record<MealDili, string>>>;
}

export type MealDili = ${Object.keys(MEALLER).map((d) => `'${d}'`).join(' | ')};

export interface MealKunyesi {
  anahtar: string;
  surum: string;
  /** QuranEnc başlığı (yayımcı son " - " sonrası). */
  baslik: string;
}

export const GUNUN_AYETI_KAYNAKLARI: {
  readonly ar: { ad: 'Tanzil'; surum: string; url: 'https://tanzil.net' };
  readonly mealler: Readonly<Record<MealDili, MealKunyesi>>;
} = ${JSON.stringify(kaynaklar, null, 2)};

export const GUNUN_AYETI_HAVUZU: readonly GununAyetiKaydi[] = ${JSON.stringify(havuz, null, 2)};
`;
  fs.writeFileSync(HEDEF, govde);

  const sayac = {};
  for (const e of elenen) for (const g of e.gerekce) sayac[g] = (sayac[g] || 0) + 1;
  console.log('Elenen adaylar:');
  for (const e of elenen) console.log(`  ${e.ref.padEnd(7)} ${e.gerekce.join(', ').padEnd(40)} ${e.en.slice(0, 70)}`);
  console.log('\nKural başına eleme (bir aday birden çok kurala takılabilir):');
  for (const k of Object.keys(sayac).sort()) console.log(`  ${k.padEnd(26)} ${sayac[k]}`);
  console.log(`\nAday: ${ADAYLAR.length}  Havuz: ${havuz.length}  Elenen: ${elenen.length}`);
  // Dil başına eleme özeti: havuzdaki her kayıt adaydır; meal kuralına takılanlar gerekçesiyle.
  console.log('\nDil başına meal elemesi (havuz kaydı → dil havuzu; gerekçe sayıları):');
  for (const dil of Object.keys(MEALLER).filter((d) => d !== 'tr' && d !== 'en')) {
    const sayac2 = {};
    for (const k of havuz) for (const g of mealGerekce(mealler[dil][k.ref])) sayac2[g] = (sayac2[g] || 0) + 1;
    const ham = havuz.filter((k) => /\[[\p{Cf}\s]*\p{Nd}+[\p{Cf}\s]*\]/u.test(mealler.ham[dil][k.ref])).length;
    console.log(
      `  ${dil.padEnd(3)} ${havuz.length} → ${havuz.filter((k) => k.mealler[dil]).length}  ` +
        `${JSON.stringify(sayac2)}  (silinmeden önce not numaralı: ${ham})`,
    );
  }
  console.log(`Dil havuzları: ${Object.keys(MEALLER).map((d) => `${d} ${havuz.filter((k) => k.mealler[d]).length}`).join(', ')}`);
  console.log(
    `Sürümler: Tanzil ${tanzil.surum}; QuranEnc ${Object.entries(kunyeler).map(([d, k]) => `${d} ${k.anahtar} ${k.surum}`).join(', ')}`,
  );
  console.log(`${path.relative(KOK, HEDEF)} yazıldı`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
