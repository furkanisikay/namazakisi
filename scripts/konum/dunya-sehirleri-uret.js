#!/usr/bin/env node
/**
 * Dünya şehirleri varlık dosyasını üretir: assets/konum/dunya.bin (UTF-8 metin, sekmeyle ayrılmış).
 *
 * Kaynak: GeoNames (https://www.geonames.org), CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
 * Değiştirildi: Türkiye çıkarıldı (il/ilçe seçici OSM tablosunu kullanır), koordinatlar 3 ondalığa
 * yuvarlandı, nüfus binlik, yalnız gerekli alanlar alındı. OSM (ODbL) verisinden AYRI dosyadır.
 *
 * Kullanım (indirme: https://download.geonames.org/export/dump/):
 *   node scripts/konum/dunya-sehirleri-uret.js <cities15000.txt> <cities5000.txt> <countryInfo.txt> <admin1CodesASCII.txt>
 *
 * Biçim (satır başına bir kayıt, ilk satırlar başlık bölümleri):
 *   #S <tz1>\t<tz2>…          saat dilimleri (satırlar indeksle başvurur)
 *   #B <ülke>.<kod>\t<ad>…     yönetim bölgesi adları (ASCII)
 *   ad\tascii\tlat\tlng\tülke\tbölgeKodu\ttzIndeksi\tnüfusBin
 *   (ascii, ad ile aynıysa boştur)
 *
 * Kapsam: cities15000 (Türkiye hariç) + 15.000 altı nüfuslu küçük ülkeler için cities5000'den
 * en kalabalık şehirler (ülke başına en az 10 kayıt) + her ülkenin başkenti.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const [c15, c5, ulkeDosyasi, bolgeDosyasi] = process.argv.slice(2);
if (!c15 || !c5 || !ulkeDosyasi || !bolgeDosyasi) {
  console.error('Kullanım: dunya-sehirleri-uret.js <cities15000> <cities5000> <countryInfo> <admin1CodesASCII>');
  process.exit(1);
}

const HARIC = new Set(['TR']);
const ULKE_BASINA_EN_AZ = 10;

function satirlar(dosya) {
  return fs.readFileSync(dosya, 'utf8').split('\n').filter((s) => s && !s.startsWith('#'));
}

function sehirOku(dosya) {
  return satirlar(dosya).map((s) => {
    const a = s.split('\t');
    return {
      id: a[0], ad: a[1], ascii: a[2], lat: +a[4], lng: +a[5], kod: a[7],
      ulke: a[8], bolge: a[10], nufus: +a[14] || 0, tz: a[17],
    };
  }).filter((s) => s.ulke && s.tz && !HARIC.has(s.ulke) && Number.isFinite(s.lat) && Number.isFinite(s.lng));
}

const buyuk = sehirOku(c15);
const kucuk = sehirOku(c5);
const secilen = new Map(buyuk.map((s) => [s.id, s]));

const ulkeSayisi = new Map();
for (const s of buyuk) ulkeSayisi.set(s.ulke, (ulkeSayisi.get(s.ulke) || 0) + 1);
const kucukUlkeye = new Map();
for (const s of kucuk) {
  if (!kucukUlkeye.has(s.ulke)) kucukUlkeye.set(s.ulke, []);
  kucukUlkeye.get(s.ulke).push(s);
}
for (const [ulke, liste] of kucukUlkeye) {
  const eksik = ULKE_BASINA_EN_AZ - (ulkeSayisi.get(ulke) || 0);
  if (eksik <= 0) continue;
  liste.sort((a, b) => b.nufus - a.nufus).filter((s) => !secilen.has(s.id)).slice(0, eksik)
    .forEach((s) => secilen.set(s.id, s));
}
// Başkentler (PPLC) daima.
for (const s of kucuk) if (s.kod === 'PPLC' && !secilen.has(s.id)) secilen.set(s.id, s);

const ulkeler = new Set(satirlar(ulkeDosyasi).map((s) => s.split('\t')[0]));
const sehirler = [...secilen.values()].filter((s) => ulkeler.has(s.ulke))
  .sort((a, b) => (a.ulke < b.ulke ? -1 : a.ulke > b.ulke ? 1 : b.nufus - a.nufus));

const bolgeAdlari = new Map();
for (const s of satirlar(bolgeDosyasi)) {
  const [kod, , ascii] = s.split('\t');
  bolgeAdlari.set(kod, ascii);
}

const tzListesi = [...new Set(sehirler.map((s) => s.tz))].sort();
const tzIndeks = new Map(tzListesi.map((t, i) => [t, i]));
const kullanilanBolgeler = new Map();
for (const s of sehirler) {
  const anahtar = `${s.ulke}.${s.bolge}`;
  if (s.bolge && bolgeAdlari.has(anahtar)) kullanilanBolgeler.set(anahtar, bolgeAdlari.get(anahtar));
}

const temiz = (t) => t.replace(/[\t\n\r]/g, ' ').trim();
const cikti = [];
cikti.push('#S ' + tzListesi.join('\t'));
cikti.push('#B ' + [...kullanilanBolgeler].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, ad]) => `${k}\t${temiz(ad)}`).join('\t'));
for (const s of sehirler) {
  const anahtar = `${s.ulke}.${s.bolge}`;
  cikti.push([
    temiz(s.ad),
    s.ascii === s.ad ? '' : temiz(s.ascii),
    s.lat.toFixed(3),
    s.lng.toFixed(3),
    s.ulke,
    kullanilanBolgeler.has(anahtar) ? s.bolge : '',
    tzIndeks.get(s.tz),
    Math.round(s.nufus / 1000),
  ].join('\t'));
}

const hedef = path.join(__dirname, '..', '..', 'assets', 'konum', 'dunya.bin');
fs.mkdirSync(path.dirname(hedef), { recursive: true });
fs.writeFileSync(hedef, cikti.join('\n') + '\n', 'utf8');
const ulkeBasina = new Set(sehirler.map((s) => s.ulke)).size;
console.log(`${sehirler.length} şehir, ${ulkeBasina} ülke, ${tzListesi.length} saat dilimi, ${kullanilanBolgeler.size} bölge → ${hedef} (${(fs.statSync(hedef).size / 1024).toFixed(0)} KB)`);
