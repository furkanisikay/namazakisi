#!/usr/bin/env node
/**
 * Maestro akışlarını Türkçe ve İngilizce dışındaki bir dilin kare turuna hazırlar.
 *
 * Akışlar iki dillidir: metin seçicileri "(Türkçe|İngilizce)" alternasyonudur ve iki değer
 * de sözlükte (`src/core/dil/sozluk/{tr,en}`) aynı anahtardan gelir. Bu betik her
 * alternasyon grubunda Türkçe ya da İngilizce değeri sözlük yaprağıyla birebir eşleyip o
 * anahtarın hedef dildeki değerini gruba ekler. Eşleşmeyen grup (başlatıcı, sistem
 * penceresi metni) olduğu gibi kalır ve raporlanır.
 *
 * Kullanım (CI kopyasında, yerinde yazar): node scripts/maestro/akislari-yerellestir.js <dil>
 * Aynı dilde iki kez koşmak zararsızdır (eklenen değer yeniden eklenmez).
 */
'use strict';
require('sucrase/register');
const fs = require('fs');
const path = require('path');

const dil = process.argv[2];
const KOK = path.resolve(__dirname, '..', '..');
const { sozluk } = require(path.join(KOK, 'src', 'core', 'dil', 'aktifDil'));
const { DILLER } = require(path.join(KOK, 'src', 'core', 'dil', 'diller'));

if (!DILLER.some((d) => d.kod === dil)) {
  console.error(`Bilinmeyen dil: ${dil}`);
  process.exit(1);
}
if (dil === 'tr' || dil === 'en') process.exit(0);

/** Sözlüğü "yol → metin" haritasına açar (çoğul nesnelerde her kategori ayrı yaprak). */
function yapraklar(o, yol = '', cikti = new Map()) {
  if (typeof o === 'string') cikti.set(yol, o);
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) if (k !== '__cogul') yapraklar(v, yol ? `${yol}.${k}` : k, cikti);
  }
  return cikti;
}

const kaynak = [yapraklar(sozluk('tr')), yapraklar(sozluk('en'))];
const hedef = yapraklar(sozluk(dil));

/** Metin → onu taşıyan yollar (Türkçe ya da İngilizce). */
const dizin = new Map();
for (const harita of kaynak) {
  for (const [yol, metin] of harita) {
    if (!dizin.has(metin)) dizin.set(metin, new Set());
    dizin.get(metin).add(yol);
  }
}

const kacir = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const coz = (s) => s.replace(/\\(.)/g, '$1');

let degisen = 0;
const eslesmeyen = new Set();

function grubuGenislet(govde) {
  const secenekler = govde.split('|');
  const eklenecek = [];
  let eslesti = false;
  for (const secenek of secenekler) {
    for (const yol of dizin.get(coz(secenek)) ?? []) {
      eslesti = true;
      const karsilik = hedef.get(yol);
      if (!karsilik || /[{}]/.test(karsilik)) continue;
      const k = kacir(karsilik);
      if (!secenekler.includes(k) && !eklenecek.includes(k)) eklenecek.push(k);
    }
  }
  if (!eslesti) eslesmeyen.add(govde);
  return eklenecek.length ? [...secenekler, ...eklenecek].join('|') : govde;
}

function dosyalar(dizinYolu) {
  return fs.readdirSync(dizinYolu, { withFileTypes: true }).flatMap((g) => {
    const tam = path.join(dizinYolu, g.name);
    if (g.isDirectory()) return dosyalar(tam);
    return g.name.endsWith('.yaml') ? [tam] : [];
  });
}

for (const dosya of dosyalar(path.join(KOK, 'scripts', 'maestro'))) {
  const eski = fs.readFileSync(dosya, 'utf8');
  // Yorum satırlarına dokunulmaz; yalnız iç içe olmayan "(a|b)" grupları.
  const yeni = eski
    .split('\n')
    .map((satir) => (/^\s*#/.test(satir) ? satir : satir.replace(/\(([^()]*\|[^()]*)\)/g, (_, g) => `(${grubuGenislet(g)})`)))
    .join('\n');
  if (yeni !== eski) {
    fs.writeFileSync(dosya, yeni);
    degisen++;
  }
}

console.log(`Maestro akışları ${dil} için genişletildi: ${degisen} dosya.`);
if (eslesmeyen.size) {
  console.log('Sözlükte karşılığı bulunmayan gruplar (olduğu gibi kaldı):');
  for (const g of [...eslesmeyen].sort()) console.log(`  (${g})`);
}
