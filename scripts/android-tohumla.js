#!/usr/bin/env node
/**
 * Android emulatorundeki AsyncStorage veritabanini (RKStorage) tohumlar.
 *
 * Kullanim: node scripts/android-tohumla.js <RKStorage yolu>
 *
 * AsyncStorage Android'de SQLite kullanir: `databases/RKStorage` icindeki
 * `catalystLocalStorage(key, value)` tablosu. Dosya `run-as` ile cekilir,
 * burada yazilir, geri konur (bkz. AGENTS.md emulator recetesi).
 *
 * Node 22+ ile gelen `node:sqlite` kullanilir; harici bagimlilik yok.
 */
const { DatabaseSync } = require('node:sqlite');
const { tohumVerisi } = require('./magaza-tohum-verisi');

const yol = process.argv[2];
if (!yol) {
    console.error('RKStorage dosya yolunu verin.');
    process.exit(1);
}

const db = new DatabaseSync(yol);
// Tablo yoksa uygulama hic calismamis demektir — sessizce bos tohum yazmak
// yerine acikca soyle.
const tablo = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='catalystLocalStorage'")
    .get();
if (!tablo) {
    console.error('catalystLocalStorage tablosu yok — uygulama en az bir kez calistirilmali.');
    process.exit(1);
}

const veri = tohumVerisi();
const yaz = db.prepare('INSERT OR REPLACE INTO catalystLocalStorage (key, value) VALUES (?, ?)');
let n = 0;
for (const [k, v] of Object.entries(veri)) {
    yaz.run(k, v);
    n += 1;
}
// Veriyi ana dosyaya indir: cihaza yalniz ana dosya geri gonderiliyor. WAL'da
// kalan yazim o dosyayla birlikte KAYBOLURDU.
db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
db.exec('PRAGMA journal_mode=DELETE');
const kontrol = db.prepare('SELECT COUNT(*) AS n FROM catalystLocalStorage').get();
db.close();
console.log(`Tohumlandi: ${n} anahtar -> ${yol} (tabloda toplam ${kontrol.n})`);
