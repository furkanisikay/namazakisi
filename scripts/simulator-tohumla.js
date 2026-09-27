#!/usr/bin/env node
/**
 * iOS Simulator'deki uygulama kabina AsyncStorage verisi tohumlar.
 *
 * Kullanim:
 *   node scripts/simulator-tohumla.js "<uygulama veri kabi yolu>" <bundleId>
 *   (yol: xcrun simctl get_app_container booted <bundleId> data)
 *
 * DIKKAT — depolama yolu `Documents/` DEGILDIR. @react-native-async-storage iOS'ta
 * `Library/Application Support/<bundleId>/RCTAsyncLocalStorage_V1/manifest.json`
 * kullanir (RNCAsyncStorage.mm > RCTCreateStorageDirectoryPath). Documents'a yazmak
 * SESSIZCE etkisiz kalir: uygulama kurulum sihirbazinda acilir ve kareler bos cikar.
 *
 * Veri `magaza-tohum-verisi.js`'ten gelir — Android hatti da AYNI kaynagi kullanir,
 * yoksa iki magazanin kareleri farkli seri/vakit gosterir.
 */
const fs = require('fs');
const path = require('path');
const { tohumVerisi } = require('./magaza-tohum-verisi');

const kap = process.argv[2];
const bundleId = process.argv[3];
if (!kap || !bundleId) {
    console.error('Kullanim: simulator-tohumla.js <veri kabi yolu> <bundleId>');
    process.exit(1);
}

// Once var olan depolama dizinini ara (surum farklari icin); yoksa kanonik yolu kur.
function depoDizininiBul() {
    const adaylar = [
        path.join(kap, 'Library', 'Application Support', bundleId, 'RCTAsyncLocalStorage_V1'),
        path.join(kap, 'Documents', 'RCTAsyncLocalStorage_V1'),
    ];
    for (const d of adaylar) if (fs.existsSync(d)) return d;
    return adaylar[0];
}

const depo = tohumVerisi();
const dizin = depoDizininiBul();
fs.mkdirSync(dizin, { recursive: true });
fs.writeFileSync(path.join(dizin, 'manifest.json'), JSON.stringify(depo), 'utf8');

console.log(`Tohumlandi: ${Object.keys(depo).length} anahtar -> ${dizin}`);
