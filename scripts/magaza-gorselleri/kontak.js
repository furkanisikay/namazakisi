#!/usr/bin/env node
/**
 * Kontak sayfasi: bir setin magazaya giden gorsellerini (ust duzeydeki NN-*.png) tek
 * bir PNG'de yan yana dizer — gozden gecirme icin. magaza-disi/ ve one-cikan dahil edilmez.
 *
 * Kullanim: node scripts/magaza-gorselleri/kontak.js <set-klasoru> <cikis.png> [kolon]
 *           node scripts/magaza-gorselleri/kontak.js --hepsi <pazarlama-klasoru>
 */
const fs = require('fs');
const path = require('path');
const { ciz, dosyaUrl, pngBoyutu } = require('./cizici');

function kontak(klasor, hedef, kolon = 5) {
    const dosyalar = fs
        .readdirSync(klasor)
        .filter((f) => /^\d\d-.*\.png$/i.test(f))
        .sort();
    if (!dosyalar.length) return false;
    const ornek = pngBoyutu(path.join(klasor, dosyalar[0]));
    const gen = 2400;
    const kol = Math.min(kolon, dosyalar.length);
    const hucre = gen / kol;
    const yh = (hucre - 16) * (ornek.yuk / ornek.gen) + 64;
    const satir = Math.ceil(dosyalar.length / kol);
    const yuk = Math.ceil(satir * yh + 90);
    const html =
        `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#E9EEE9;font-family:'Segoe UI',system-ui,sans-serif;width:${gen}px">` +
        `<div style="padding:24px 16px 8px;font-size:34px;font-weight:700;color:#12301B">${path.basename(klasor)} · ${dosyalar.length} görsel · ${ornek.gen}×${ornek.yuk}</div>` +
        `<div style="display:flex;flex-wrap:wrap">${dosyalar
            .map(
                (f) =>
                    `<div style="width:${hucre}px;padding:8px;box-sizing:border-box"><div style="font-size:22px;color:#4A5F50;margin-bottom:6px">${f}</div>` +
                    `<img src="${dosyaUrl(path.join(klasor, f))}" style="width:100%;display:block;border-radius:8px"></div>`
            )
            .join('')}</div></body></html>`;
    ciz(html, hedef, gen, yuk);
    return true;
}

if (require.main === module) {
    const a = process.argv.slice(2);
    if (a[0] === '--hepsi' && a[1]) {
        for (const d of fs.readdirSync(a[1], { withFileTypes: true }))
            if (d.isDirectory()) kontak(path.join(a[1], d.name), path.join(a[1], `kontak-${d.name}.png`));
    } else if (a[0] && a[1]) {
        kontak(a[0], a[1], Number(a[2] || 5));
    } else {
        console.error('Kullanim: kontak.js <set-klasoru> <cikis.png> [kolon] | --hepsi <pazarlama>');
        process.exit(1);
    }
}

module.exports = { kontak };
