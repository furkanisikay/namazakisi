#!/usr/bin/env node
'use strict';
/**
 * Sözlük paketleyici: `src/core/dil/sozluk/<kod>/` kaynaklarını dil başına sıkıştırılmış pakete
 * (`src/core/dil/paket/<kod>.ts`) çevirir; diller arası dizini (`dillerArasi.ts`) ve tembel
 * yükleyici haritasını (`index.ts`) üretir. Türkçe paketlenmez (varsayılan dil, doğrudan yüklenir).
 *
 * Neden: 78 sözlük düz JS olarak Hermes paketinde ~25 MB yer kaplıyor ve açılışta hepsi kuruluyordu.
 * Paketlenince cihazda ~5 MB kalır, açılışta yalnız etkin dil açılır.
 *
 * Kullanım: `npm run sozluk:paketle` (bir sözlüğü değiştirdikten sonra ZORUNLU; nöbetçi
 * `src/core/dil/__tests__/sozlukPaketi.test.ts` eski paketi yakalar).
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
  `/** ÜRETİLMİŞ DOSYA — elle düzenleme. Kaynak: ${kaynak}. Yeniden üret: \`npm run sozluk:paketle\`. */\n`;

function hamSozluk(kod) {
  const modul = require(path.join(DIL, 'sozluk', kod));
  const s = modul[kod];
  if (!s) throw new Error(`sozluk/${kod} '${kod}' adlı dışa aktarım vermiyor`);
  return s;
}

function yaz(dosya, icerik) {
  const yol = path.join(CIKTI, dosya);
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
const index = `${UST('scripts/dil/sozluk-paketle.js')}import type { DilKodu } from '../diller';

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

console.log(`${kodlar.length} dil paketlendi, ${degisen} dosya değişti, toplam ${(toplam / 1e6).toFixed(2)} MB base64`);
