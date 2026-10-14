#!/usr/bin/env node
/**
 * `uiautomator dump` XML'inde metni ya da content-desc'i desene uyan ILK dugumun
 * merkezini yazar ("x y"); bulunamazsa cikis kodu 1.
 *
 * Kullanim: node scripts/saat/ui-merkez.js <dump.xml> <regex>
 *
 * Saat (Wear) ve TV hatlari bunu kullanir. Telefon hattinda `uiautomator dump`
 * KULLANILAMAZ (saniyelik geri sayim "idle" durumu hic olusturmaz — AGENTS.md);
 * saatin ana ekrani 30 sn'de bir, TV panosu ise yalniz dakikada bir cizildigi icin
 * dump orada calisir.
 */
'use strict';

const fs = require('fs');

const [dosya, desen] = process.argv.slice(2);
if (!dosya || !desen) {
    console.error('Kullanim: ui-merkez.js <dump.xml> <regex>');
    process.exit(2);
}

let xml = '';
try {
    xml = fs.readFileSync(dosya, 'utf8');
} catch {
    process.exit(1);
}

const re = new RegExp(desen);
const coz = (s) =>
    s
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

for (const m of xml.matchAll(/<node\b[^>]*>/g)) {
    const etiket = m[0];
    const al = (ad) => {
        const r = etiket.match(new RegExp(`\\b${ad}="([^"]*)"`));
        return r ? coz(r[1]) : '';
    };
    if (!re.test(al('text')) && !re.test(al('content-desc'))) continue;
    const b = al('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!b) continue;
    const [x1, y1, x2, y2] = b.slice(1).map(Number);
    if (x2 <= x1 || y2 <= y1) continue;
    console.log(`${Math.round((x1 + x2) / 2)} ${Math.round((y1 + y2) / 2)}`);
    process.exit(0);
}
process.exit(1);
