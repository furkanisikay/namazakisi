#!/usr/bin/env node
/**
 * CHANGELOG.md'den belirtilen (veya en son) versiyonun notlarını çıkarır.
 * Kullanım:
 *   node scripts/extract-changelog.js           → en son versiyon
 *   node scripts/extract-changelog.js 0.15.0    → belirli versiyon
 */

const fs = require('fs');
const path = require('path');

const version = process.argv[2];
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
const notes = lines
  .slice(target.index + 1, nextIndex)
  .join('\n')
  .trim();

process.stdout.write(notes);
