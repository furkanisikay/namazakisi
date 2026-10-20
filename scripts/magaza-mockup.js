#!/usr/bin/env node
/**
 * Magaza mockup'lari (geriye uyumlu giris). Asil uretici artik
 * scripts/magaza-gorselleri/uret.js: ham kareden PAZARLAMA gorseli (baslik + tek
 * kisa alt satir + cihaz/anlati). Bu betik eski CLI'yi korur ve platformun telefon
 * setini dogrudan <cikis>/ altina yazar; yukleyiciler (ASC ekran-yukle, play-magaza
 * yaz) bu klasoru eskisi gibi okur.
 *
 * Kullanim:
 *   node scripts/magaza-mockup.js <kareler> <cikis> --platform ios|android [--one-cikan] [--kaynak <ek-klasor>]...
 *
 * Ek kaynak (ozellik turu kareleri, saat/TV kareleri) verilirse o kareleri isteyen
 * gorseller de uretilir; verilmezse yalniz ham karesi bulunanlar uretilir.
 */
const { uret } = require('./magaza-gorselleri/uret');
const { PLATFORM_SETI } = require('./magaza-gorselleri/setler');

const argv = process.argv.slice(2);
const konumsal = [];
const ekKaynak = [];
let platform = 'ios';
let oneCikan = false;
for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--platform') platform = argv[++i];
    else if (argv[i] === '--kaynak') ekKaynak.push(argv[++i]);
    else if (argv[i] === '--one-cikan') oneCikan = true;
    else konumsal.push(argv[i]);
}
const [kaynak, cikis] = konumsal;
if (!kaynak || !cikis || !PLATFORM_SETI[platform]) {
    console.error('Kullanim: node scripts/magaza-mockup.js <kareler> <cikis> --platform ios|android [--one-cikan] [--kaynak <klasor>]');
    process.exit(1);
}
const ozet = uret({ kaynak: [kaynak, ...ekKaynak], cikis, set: [PLATFORM_SETI[platform]], duz: true, oneCikan });
for (const [ad, o] of Object.entries(ozet)) {
    console.log(`${ad}: ${o.uretilen.length} gorsel`);
    o.eksik.forEach((e) => console.log('  eksik: ' + e));
}
