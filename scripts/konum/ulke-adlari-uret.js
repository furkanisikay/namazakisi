#!/usr/bin/env node
/**
 * Ülke adları tablosunu üretir: src/core/konum/ulkeAdlariVerisi.ts — ÜRETİLMİŞ DOSYA.
 *
 * Hermes'te `Intl.DisplayNames` yok; adlar Node'un ICU'sundan (Unicode CLDR, Unicode
 * License v3) derleme anında alınır. Ülke kümesi = assets/konum/dunya.bin'deki ülkeler + TR.
 *
 * Kullanım: node scripts/konum/ulke-adlari-uret.js tr en ar …   (uygulamanın dilleri)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const diller = process.argv.slice(2);
if (!diller.length) {
  console.error('Kullanım: ulke-adlari-uret.js <dil> [<dil> …]');
  process.exit(1);
}
const kok = path.join(__dirname, '..', '..');
const veri = fs.readFileSync(path.join(kok, 'assets', 'konum', 'dunya.bin'), 'utf8');
const ulkeler = new Set(['TR']);
for (const satir of veri.split('\n')) {
  if (!satir || satir.startsWith('#')) continue;
  const kod = satir.split('\t')[4];
  if (/^[A-Z]{2}$/.test(kod)) ulkeler.add(kod);
}
const sirali = [...ulkeler].sort();
const tablo = {};
for (const dil of diller) {
  const dn = new Intl.DisplayNames([dil], { type: 'region', fallback: 'none' });
  tablo[dil] = {};
  for (const kod of sirali) {
    const ad = dn.of(kod);
    if (ad && ad !== kod) tablo[dil][kod] = ad;
  }
}
const satirlar = [
  '/**',
  ' * Ülke adları — ÜRETİLMİŞ DOSYA, ELLE DÜZENLEMEYİN.',
  ' * Üretici: scripts/konum/ulke-adlari-uret.js (kaynak: Unicode CLDR, Node ICU',
  ` * ${process.versions.icu}, Unicode License v3).`,
  ' */',
  'export const ULKE_ADLARI: Readonly<Record<string, Readonly<Record<string, string>>>> = {',
];
for (const dil of diller) {
  satirlar.push(`  ${JSON.stringify(dil)}: {`);
  const ic = Object.entries(tablo[dil]).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  for (let i = 0; i < ic.length; i += 6) satirlar.push('    ' + ic.slice(i, i + 6).join(', ') + ',');
  satirlar.push('  },');
}
satirlar.push('};', '');
const hedef = path.join(kok, 'src', 'core', 'konum', 'ulkeAdlariVerisi.ts');
fs.writeFileSync(hedef, satirlar.join('\n'), 'utf8');
console.log(`${sirali.length} ülke × ${diller.length} dil → ${hedef}`);
