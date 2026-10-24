#!/usr/bin/env node
/**
 * Dil çıkarımı CIRCIRI: dosya başına kalan Türkçe SABİT metni sayar.
 *
 * Sayılan: Türkçe harf (çğıöşüÇĞİÖŞÜ) içeren dize sabitleri ve JSX metni. Sayılmayan:
 * yorumlar, `Logger.*`/`console.*`/`throw new Error(` satırları (geliştiriciye gider),
 * `// dil-haric` işaretli satırlar (kullanıcıya görünmeyen kod sabiti; gerekçe aynı satırda),
 * testler, sözlüğün kendisi (`src/core/dil/sozluk/`). Sezgiseldir: Türkçe harfsiz
 * metinleri ("Kaza", "Ayarlar") kaçırır — onları ekran başına "İngilizce çizimde Türkçe
 * yok" testleri yakalar.
 *
 *   node scripts/dil/turkceMetinSay.js          # özet
 *   node scripts/dil/turkceMetinSay.js --yaz    # tavanı bugünkü sayıya indir (yalnız düşer)
 *
 * Metni dosyalar arasında TAŞIMAK (çıkarmak değil) iki testi de kırar ve `--yaz` artanı
 * yükseltmez: JSON'u elle düzenleyin, `toplam` artmamalı.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..', '..');
const TAVAN = path.join(__dirname, 'turkce-metin-tavani.json');
const TR = /[çğıöşüÇĞİÖŞÜ]/;
/**
 * Çevrilmeyen VERİ dosyaları (sayılmaz). Her birinin nedeni: yer adı dilden bağımsızdır
 * (İstanbul İngilizcede de İstanbul) ya da dosya zaten dil başına üretilir. Çevrilecek veri
 * (özel gün adları, "Neler Yeni", arama dizini) burada YOK — sayılır.
 */
const HARIC = new Set([
    'src/core/konum/ilceMerkezleriVerisi.ts', // ilçe adları + koordinat (üretilmiş)
    'src/core/konum/ulkeAdlariVerisi.ts', // CLDR'den dil başına üretilmiş ülke adları
    'src/domain/services/TurkiyeKonumServisi.ts', // 81 il adı + koordinat
]);
const DIZE = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const JSX_METNI = />([^<>{}\n]+)</g;

function dosyalar(dizin, sonuc = []) {
    for (const ad of fs.readdirSync(dizin)) {
        const yol = path.join(dizin, ad);
        const st = fs.statSync(yol);
        if (st.isDirectory()) {
            if (ad === '__tests__' || ad === 'node_modules') continue;
            dosyalar(yol, sonuc);
        } else if (/\.(ts|tsx)$/.test(ad) && !/\.d\.ts$/.test(ad) && !/\.test\.tsx?$/.test(ad)) {
            sonuc.push(yol);
        }
    }
    return sonuc;
}

function say(icerik) {
    let n = 0;
    let blokYorum = false;
    for (let satir of icerik.split('\n')) {
        if (blokYorum) {
            const son = satir.indexOf('*/');
            if (son < 0) continue;
            satir = satir.slice(son + 2);
            blokYorum = false;
        }
        satir = satir.replace(/\/\*.*?\*\//g, '');
        const bas = satir.indexOf('/*');
        if (bas >= 0) {
            blokYorum = true;
            satir = satir.slice(0, bas);
        }
        const t = satir.trim();
        if (t.startsWith('//') || t.startsWith('*')) continue;
        if (/\b(Logger\.\w+|console\.\w+)\(|throw new Error\(/.test(t)) continue;
        // Kullanıcıya görünmeyen Türkçe harfli kod sabiti (arama normalleştirme vb.): satır sonu işareti.
        if (/\/\/\s*dil-haric\b/.test(satir)) continue;
        // Satır sonu yorumunu at (dize içindeki // nadiren Türkçe harf taşır; sezgisel).
        const kod = satir.replace(/\s\/\/.*$/, '');
        for (const m of kod.matchAll(DIZE)) if (TR.test(m[2])) n++;
        for (const m of kod.matchAll(JSX_METNI)) if (TR.test(m[1])) n++;
    }
    return n;
}

function sayim() {
    const sonuc = {};
    for (const yol of dosyalar(path.join(KOK, 'src'))) {
        const goreli = path.relative(KOK, yol).split(path.sep).join('/');
        if (goreli.startsWith('src/core/dil/sozluk/') || HARIC.has(goreli)) continue;
        const n = say(fs.readFileSync(yol, 'utf8'));
        if (n > 0) sonuc[goreli] = n;
    }
    return sonuc;
}

module.exports = { say, sayim, TAVAN, HARIC };

if (require.main === module) {
    const s = sayim();
    const toplam = Object.values(s).reduce((a, b) => a + b, 0);
    if (process.argv.includes('--yaz')) {
        const eski = fs.existsSync(TAVAN) ? JSON.parse(fs.readFileSync(TAVAN, 'utf8')) : null;
        const yeni = {};
        for (const k of Object.keys(s).sort()) {
            yeni[k] = eski && k in eski.dosyalar ? Math.min(eski.dosyalar[k], s[k]) : s[k];
        }
        fs.writeFileSync(TAVAN, JSON.stringify({ toplam: Object.values(yeni).reduce((a, b) => a + b, 0), dosyalar: yeni }, null, 1) + '\n');
    }
    console.log(`Türkçe sabit metin: ${toplam} (${Object.keys(s).length} dosya)`);
}
