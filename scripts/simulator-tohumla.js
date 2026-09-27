#!/usr/bin/env node
/**
 * iOS Simulator'deki uygulama kabina AsyncStorage verisi tohumlar.
 *
 * Kullanim:
 *   node scripts/simulator-tohumla.js "<uygulama veri kabi yolu>"
 *   (yol: xcrun simctl get_app_container booted <bundleId> data)
 *
 * Neden: magaza ekran goruntuleri icin uygulamanin kurulum sihirbazini gecmis,
 * konumu ayarlanmis ve gecmisi dolu olmasi gerekir. Sihirbazi dokunarak gecmek
 * kirilgan; AsyncStorage dosyasini dogrudan yazmak deterministik.
 *
 * Konum MANUEL moda alinir — boylece simulatorde konum izni diyalogu cikmaz.
 */
const fs = require('fs');
const path = require('path');

const kap = process.argv[2];
if (!kap) {
    console.error('Uygulama veri kabi yolunu verin.');
    process.exit(1);
}

const gun = (geriDk) => {
    const d = new Date();
    d.setDate(d.getDate() - geriDk);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const TAM_GUN = { Sabah: true, 'Öğle': true, 'İkindi': true, 'Akşam': true, 'Yatsı': true };
// Bugun kismen kilinmis olsun: ana ekranda hem isaretli hem bekleyen vakit gorunsun.
const BUGUN = { Sabah: true, 'Öğle': true, 'İkindi': true };

const KONUM = {
    konumModu: 'manuel',
    seciliSehirId: '34',
    seciliIlId: 34,
    seciliIlceId: null,
    seciliIlAdi: 'İstanbul',
    seciliIlceAdi: '',
    gpsAdres: null,
    koordinatlar: { lat: 41.0082, lng: 28.9784 },
    sonGpsGuncellemesi: null,
    akilliTakipAktif: false,
    takipHassasiyeti: 'dengeli',
};

const depo = {
    '@namaz_akisi/ilk_kurulum_tamamlandi': 'true',
    '@namaz_akisi/konum_ayarlari': JSON.stringify(KONUM),
    // Gun-bazli kayitlar dogrudan yazildigi icin eski blob gocunu ATLA.
    '@namaz_akisi/namaz_gun_migrasyon_tamam': '1',
    namaz_gun_: undefined, // yer tutucu; asagida silinir
};
delete depo['namaz_gun_'];

depo[`namaz_gun_${gun(0)}`] = JSON.stringify(BUGUN);
for (let i = 1; i <= 25; i++) depo[`namaz_gun_${gun(i)}`] = JSON.stringify(TAM_GUN);

const dizin = path.join(kap, 'Documents', 'RCTAsyncLocalStorage_V1');
fs.mkdirSync(dizin, { recursive: true });
fs.writeFileSync(path.join(dizin, 'manifest.json'), JSON.stringify(depo), 'utf8');

console.log(`Tohumlandi: ${Object.keys(depo).length} anahtar -> ${dizin}`);
console.log(`  bugun: ${gun(0)} (kismi), gecmis 25 tam gun`);
