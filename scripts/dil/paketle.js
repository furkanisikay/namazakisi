#!/usr/bin/env node
'use strict';
/**
 * İçerik paketleyici: sözlükler ve günün ayeti havuzu dil başına sıkıştırılmış pakete çevrilir.
 * - `src/core/dil/sozluk/<kod>/` → `src/core/dil/paket/<kod>.ts`; diller arası dizin
 *   (`dillerArasi.ts`) ve tembel yükleyici haritası (`index.ts`). Türkçe paketlenmez (doğrudan yüklenir).
 * - `src/core/data/gununAyetiHavuzu.ts` → `src/core/data/ayetPaketi/` (çekirdek + dil başına meal).
 *
 * Neden: 78 sözlük ve 71 meal düz JS olarak Hermes paketinde ~30 MB yer kaplıyor ve açılışta
 * hepsi kuruluyordu. Paketlenince ~7,5 MB kalır, açılışta yalnız etkin dil açılır.
 *
 * Kullanım: `npm run dil:paketle` — bir sözlüğü değiştirdikten sonra ZORUNLU; ayet üreticisi
 * (`scripts/icerik/gunun-ayeti-uret.js`) sonunda kendisi çağırır. Nöbetçi
 * `src/core/dil/__tests__/sozlukPaketi.test.ts` eski paketi yakalar.
 * Çıktı deterministiktir (fflate zlib, düzey 9; JSON anahtar sırası kaynaktaki sıra).
 */
const fs = require('fs');
const path = require('path');
require('sucrase/register');

const KOK = path.join(__dirname, '..', '..');
const DIL = path.join(KOK, 'src', 'core', 'dil');
const CIKTI = path.join(DIL, 'paket');

const { DILLER } = require(path.join(DIL, 'diller'));
const { dillerArasiDizinKur } = require(path.join(DIL, 'dillerArasiDizin'));
const { sozluguPaketle: paketle } = require(path.join(DIL, 'sozlukPaketle'));

const UST = (kaynak) =>
  `/** ÜRETİLMİŞ DOSYA — elle düzenleme. Kaynak: ${kaynak}. Yeniden üret: \`npm run dil:paketle\`. */\n`;

function hamSozluk(kod) {
  const modul = require(path.join(DIL, 'sozluk', kod));
  const s = modul[kod];
  if (!s) throw new Error(`sozluk/${kod} '${kod}' adlı dışa aktarım vermiyor`);
  return s;
}

function yaz(dosya, icerik, dizin = CIKTI) {
  const yol = path.join(dizin, dosya);
  const eski = fs.existsSync(yol) ? fs.readFileSync(yol, 'utf8') : null;
  if (eski !== icerik) fs.writeFileSync(yol, icerik);
  return eski !== icerik;
}

fs.mkdirSync(CIKTI, { recursive: true });
const kodlar = DILLER.map((d) => d.kod).filter((k) => k !== 'tr');
let degisen = 0;
let toplam = 0;
for (const kod of kodlar) {
  const veri = paketle(hamSozluk(kod));
  toplam += veri.length;
  if (yaz(`${kod}.ts`, `${UST(`src/core/dil/sozluk/${kod}/`)}export const veri = '${veri}';\n`)) degisen++;
}
const dizin = paketle(dillerArasiDizinKur(hamSozluk));
toplam += dizin.length;
if (yaz('dillerArasi.ts', `${UST('src/core/dil/dillerArasiDizin.ts')}export const veri = '${dizin}';\n`)) degisen++;

const satirlar = kodlar.map((k) => `  ${/^[a-z]+$/.test(k) ? k : `'${k}'`}: () => require('./${k}').veri,`);
const index = `${UST('scripts/dil/paketle.js')}import type { DilKodu } from '../diller';

/**
 * Dil başına sıkıştırılmış sözlük paketi (zlib + base64). \`require\` fonksiyon içinde: Metro modülü
 * paketler ama YALNIZ çağrılınca çalıştırır — açılışta tek dil açılır.
 */
export const SOZLUK_PAKETLERI: Readonly<Record<Exclude<DilKodu, 'tr'>, () => string>> = {
${satirlar.join('\n')}
};

/** Diller arası dizin paketi (\`dillerArasiDizin.ts\`). */
export const dillerArasiPaketi = (): string => require('./dillerArasi').veri;
`;
if (yaz('index.ts', index)) degisen++;

// Günün ayeti havuzu: çekirdek (referans + Arapça + künyeler) ve dil başına meal haritası (ref → meal).
// Kaynak üretilmiş `gununAyetiHavuzu.ts` (`scripts/icerik/gunun-ayeti-uret.js`); uygulama onu içe AKTARMAZ.
const AYET = path.join(KOK, 'src', 'core', 'data', 'ayetPaketi');
fs.mkdirSync(AYET, { recursive: true });
const { GUNUN_AYETI_HAVUZU, GUNUN_AYETI_KAYNAKLARI } = require(path.join(KOK, 'src', 'core', 'data', 'gununAyetiHavuzu'));
const AYET_UST = UST('src/core/data/gununAyetiHavuzu.ts');
const temel = paketle({
  kaynaklar: GUNUN_AYETI_KAYNAKLARI,
  kayitlar: GUNUN_AYETI_HAVUZU.map(({ ref, sure, ayet, ar }) => ({ ref, sure, ayet, ar })),
});
toplam += temel.length;
if (yaz('temel.ts', `${AYET_UST}export const veri = '${temel}';\n`, AYET)) degisen++;
const mealDilleri = Object.keys(GUNUN_AYETI_KAYNAKLARI.mealler);
for (const dil of mealDilleri) {
  const harita = Object.fromEntries(GUNUN_AYETI_HAVUZU.filter((k) => k.mealler[dil] != null).map((k) => [k.ref, k.mealler[dil]]));
  const veri = paketle(harita);
  toplam += veri.length;
  if (yaz(`${dil}.ts`, `${AYET_UST}export const veri = '${veri}';\n`, AYET)) degisen++;
}
const mealSatirlari = mealDilleri.map((k) => `  ${/^[a-z]+$/.test(k) ? k : `'${k}'`}: () => require('./${k}').veri,`);
const ayetIndex = `${UST('scripts/dil/paketle.js')}/**
 * Günün ayeti paketleri (zlib + base64), tembel: çekirdek (referans, Arapça, künyeler) ve dil
 * başına meal haritası (ref → meal). Yalnız etkin dilin meali açılır.
 */
export const ayetTemelPaketi = (): string => require('./temel').veri;

export const AYET_MEAL_PAKETLERI: Readonly<Record<string, () => string>> = {
${mealSatirlari.join('\n')}
};
`;
if (yaz('index.ts', ayetIndex, AYET)) degisen++;

console.log(`${kodlar.length} dil ve ${mealDilleri.length} meal paketlendi, ${degisen} dosya değişti, toplam ${(toplam / 1e6).toFixed(2)} MB base64`);
