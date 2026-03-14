#!/usr/bin/env node
/**
 * CHANGELOG.md'den belirtilen (veya en son) versiyonun notlarını çıkarır
 * ve uygulama içi güncelleme ekranıyla aynı formata dönüştürür.
 *
 * Kullanım:
 *   node scripts/extract-changelog.js           → en son versiyon
 *   node scripts/extract-changelog.js 0.15.0    → belirli versiyon
 *   node scripts/extract-changelog.js --raw     → ham metin (formatsız)
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const rawMode = args.includes('--raw');
const version = args.find(a => !a.startsWith('--'));

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const content = fs.readFileSync(changelogPath, 'utf8');
const lines = content.split('\n');

// ## [x.y.z] satırlarını bul
const versionRegex = /^## \[(\d+\.\d+\.\d+)\]/;
const starts = [];
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(versionRegex);
  if (match) starts.push({ index: i, version: match[1] });
}

if (starts.length === 0) {
  process.stderr.write('CHANGELOG versiyonu bulunamadı\n');
  process.exit(1);
}

let target;
if (version) {
  target = starts.find(s => s.version === version);
  if (!target) {
    process.stderr.write(`${version} versiyonu CHANGELOG'da bulunamadı\n`);
    process.exit(1);
  }
} else {
  target = starts[0];
}

const nextIndex = starts.find(s => s.index > target.index)?.index ?? lines.length;
const ham = lines
  .slice(target.index + 1, nextIndex)
  .join('\n')
  .trim();

if (rawMode) {
  process.stdout.write(ham);
  process.exit(0);
}

// GuncellemeServisi.degisiklikNotlariniDuzenle ile aynı formatlama mantığı
// Türkçe CHANGELOG başlıklarını da destekler
function formatla(hamMetin) {
  if (!hamMetin) return '';

  const satirlar = hamMetin.split('\n');
  const yeniOzellikler = [];
  const hatalar = [];
  let aktifBolum = null;

  const gereksizPatternler = [
    /^merge pull request/i,
    /^merge pr/i,
    /^pr bot/i,
  ];

  const bolumTespitEt = (satir) => {
    const alt = satir.toLowerCase();
    if (!alt.startsWith('###')) return null;
    // İngilizce ve Türkçe başlıklar
    if (alt.includes('added') || alt.includes('yeni özellik') || alt.includes('eklendi')) return 'added';
    if (alt.includes('fixed') || alt.includes('hata') || alt.includes('düzeltildi')) return 'fixed';
    if (alt.includes('changed') || alt.includes('refactor') || alt.includes('değiştirildi')) return 'changed';
    return null;
  };

  for (const satir of satirlar) {
    const temizSatir = satir.trim();

    const tespit = bolumTespitEt(temizSatir);
    if (tespit !== null) {
      aktifBolum = tespit;
      continue;
    }

    if (temizSatir.startsWith('-') || temizSatir.startsWith('*')) {
      // PR referanslarını temizle: "özellik eklendi (#63)" → "özellik eklendi"
      const icerik = temizSatir.substring(1).trim().replace(/\s*\(#\d+\)\s*$/, '');
      if (!icerik) continue;

      const gereksizMi = gereksizPatternler.some(p => p.test(icerik));
      if (gereksizMi) continue;

      if (aktifBolum === 'added') {
        yeniOzellikler.push(icerik);
      } else if (aktifBolum === 'fixed') {
        hatalar.push(icerik);
      }
    }
  }

  const parcalar = [];

  if (yeniOzellikler.length > 0) {
    parcalar.push('Yeni Özellikler:');
    yeniOzellikler.forEach(o => parcalar.push(`• ${o}`));
  }

  if (hatalar.length > 0) {
    if (parcalar.length > 0) parcalar.push('');
    parcalar.push('Hatalar giderildi:');
    hatalar.forEach(h => parcalar.push(`• ${h}`));
  }

  const sonuc = parcalar.join('\n').trim();

  // Fallback: hiç eşleşme yoksa ham metni temizle
  if (!sonuc) {
    return hamMetin
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 500);
  }

  return sonuc.slice(0, 500);
}

process.stdout.write(formatla(ham));
