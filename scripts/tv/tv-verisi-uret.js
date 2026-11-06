#!/usr/bin/env node
/**
 * Android TV panosu (issue #286) — TV'nin TEK KAYNAKTAN beslenen verisini üretir.
 *
 *  1. `tv/app/src/main/assets/iller.json`  ← `TURKIYE_ILLERI_OFFLINE`
 *     (src/domain/services/TurkiyeKonumServisi.ts; telefonun manuel konum listesi).
 *  2. `tv/app/src/test/resources/vakit-fiksturu.json` ← telefonun hesap yolu
 *     (`adhan` JS, `CalculationMethod.Turkey()`, madhab VERİLMEZ = Şafiî/asr-ı evvel)
 *     + kerahat sabitleri (`KAZA_SABITLERI.MEKRUH_TOLERANS_DK`, `ISTIVA_TOLERANS_DK`).
 *
 *  3. `tv/app/src/test/resources/vakit-fiksturu-dunya.json` ← Türkiye dışı yöntemler: telefonun
 *     `hesapParametreleriOlustur` çıktısı + TV'ye giden özet (`tvHesapOzeti`). TS kaynağı
 *     `sucrase/register` ile doğrudan okunur (kopya mantık yok).
 *
 * İki taraf da kilitli: Kotlin `VakitHesabiTest` fikstürü kendi adhan2 hesabıyla,
 * jest `TvVakitParitesi.test.ts` aynı fikstürü telefonun servisiyle doğrular.
 * Telefon hesabı/kerahat sabiti değişirse bu betiği yeniden koşun:
 *
 *   node scripts/tv/tv-verisi-uret.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { Coordinates, CalculationMethod, PrayerTimes } = require('adhan');

const KOK = path.resolve(__dirname, '..', '..');

// Telefonla AYNI sabitler — jest testi KAZA_SABITLERI ile karşılaştırır.
const KERAHAT = { surukDk: 20, istivaDk: 5, gurubDk: 20 };

function illeriOku() {
  const kaynak = fs.readFileSync(
    path.join(KOK, 'src/domain/services/TurkiyeKonumServisi.ts'),
    'utf8',
  );
  const desen =
    /\{\s*id:\s*(\d+),\s*ad:\s*'([^']+)',\s*plakaKodu:\s*'(\d{2})',\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)\s*\}/g;
  const iller = [];
  let m;
  while ((m = desen.exec(kaynak)) !== null) {
    iller.push({ plaka: m[3], ad: m[2], lat: Number(m[4]), lng: Number(m[5]) });
  }
  if (iller.length !== 81) {
    throw new Error(`81 il bekleniyordu, ${iller.length} bulundu (desen eskidi mi?)`);
  }
  return iller;
}

/** Telefonun `NamazVaktiHesaplayiciServisi.prayerTimesAl` yolunun birebiri. */
function gunlukVakitler(lat, lng, yil, ay, gun) {
  const pt = new PrayerTimes(
    new Coordinates(lat, lng),
    new Date(yil, ay - 1, gun),
    CalculationMethod.Turkey(),
  );
  return {
    imsak: pt.fajr.getTime(),
    gunes: pt.sunrise.getTime(),
    ogle: pt.dhuhr.getTime(),
    ikindi: pt.asr.getTime(),
    aksam: pt.maghrib.getTime(),
    yatsi: pt.isha.getTime(),
  };
}

const DK = 60_000;

function kerahatPencereleri(v) {
  return [
    { tur: 'suruk', baslangic: v.gunes, bitis: v.gunes + KERAHAT.surukDk * DK },
    { tur: 'istiva', baslangic: v.ogle - KERAHAT.istivaDk * DK, bitis: v.ogle },
    { tur: 'gurub', baslangic: v.aksam - KERAHAT.gurubDk * DK, bitis: v.aksam },
  ];
}

function main() {
  const iller = illeriOku();
  const assetYolu = path.join(KOK, 'tv/app/src/main/assets/iller.json');
  fs.writeFileSync(assetYolu, JSON.stringify(iller, null, 1) + '\n');

  // Batı/doğu/kuzey/güney uçları + mevsim dönümleri + artık gün.
  const plakalar = ['34', '06', '65', '22', '30', '57', '07', '25'];
  const tarihler = ['2026-03-20', '2026-06-21', '2026-10-13', '2026-12-21', '2028-02-29'];
  const ornekler = [];
  for (const plaka of plakalar) {
    const il = iller.find((i) => i.plaka === plaka);
    for (const tarih of tarihler) {
      const [yil, ay, gun] = tarih.split('-').map(Number);
      const vakitler = gunlukVakitler(il.lat, il.lng, yil, ay, gun);
      ornekler.push({
        plaka,
        il: il.ad,
        lat: il.lat,
        lng: il.lng,
        tarih,
        vakitler,
        kerahat: kerahatPencereleri(vakitler),
      });
    }
  }
  const fikstur = {
    aciklama:
      'Telefonun adhan JS hesabi (CalculationMethod.Turkey, madhab verilmez). Uretici: scripts/tv/tv-verisi-uret.js',
    kerahat: KERAHAT,
    ornekler,
  };
  const fiksturYolu = path.join(KOK, 'tv/app/src/test/resources/vakit-fiksturu.json');
  fs.writeFileSync(fiksturYolu, JSON.stringify(fikstur, null, 1) + '\n');
  console.log(`iller: ${iller.length}, ornek: ${ornekler.length}`);
  dunyaFiksturu();
}

/** Türkiye dışı yöntemler: her profil kendi bölgesinde + elle düzeltme/açı + yüksek enlem + Ramazan. */
const DUNYA_ORNEKLERI = [
  { ad: 'Kuala Lumpur', lat: 3.139, lng: 101.687, ayar: { profil: 'jakim' } },
  { ad: 'Jakarta', lat: -6.2, lng: 106.817, ayar: { profil: 'kemenag' } },
  { ad: 'Singapur', lat: 1.29, lng: 103.85, ayar: { profil: 'muis' } },
  { ad: 'Mekke', lat: 21.389, lng: 39.858, ayar: { profil: 'ummulKura' } },
  { ad: 'Kahire', lat: 30.044, lng: 31.236, ayar: { profil: 'misir' } },
  { ad: 'Lahor', lat: 31.558, lng: 74.351, ayar: { profil: 'karachi' } },
  { ad: 'Londra', lat: 51.507, lng: -0.128, ayar: { profil: 'moonsighting' } },
  { ad: 'Oslo', lat: 59.913, lng: 10.752, ayar: { profil: 'mwl' } },
  { ad: 'New York', lat: 40.713, lng: -74.006, ayar: { profil: 'isna' } },
  { ad: 'Toronto', lat: 43.651, lng: -79.383, ayar: { profil: 'kanada' } },
  { ad: 'Dubai', lat: 25.276, lng: 55.296, ayar: { profil: 'dubai' } },
  { ad: 'Doha', lat: 25.286, lng: 51.533, ayar: { profil: 'katar' } },
  { ad: 'Amman', lat: 31.954, lng: 35.911, ayar: { profil: 'urdun' } },
  { ad: 'Saraybosna', lat: 43.856, lng: 18.413, ayar: { profil: 'bosna' } },
  { ad: 'Kazablanka', lat: 33.573, lng: -7.59, ayar: { profil: 'fas' } },
  { ad: 'Tahran', lat: 35.689, lng: 51.389, ayar: { profil: 'tahran' } },
  { ad: 'Necef', lat: 32.0, lng: 44.336, ayar: { profil: 'caferi' } },
  { ad: 'Taşkent', lat: 41.311, lng: 69.24, ayar: { profil: 'mwl', ikindi: 'sani' } },
  { ad: 'Berlin', lat: 52.52, lng: 13.405, ayar: { profil: 'mwl', ofsetler: { imsak: -3, aksam: 2, yatsi: 5 }, aci: { fecr: 15, yatsi: 15 } } },
  { ad: 'İstanbul', lat: 41.008, lng: 28.978, ayar: { profil: 'diyanet', ofsetler: { ogle: 1, ikindi: -2 } } },
];
// Ramazan (Ümmü'l-Kurâ 2026: 18 Şubat–19 Mart), yaz ve kış dönümü.
const DUNYA_TARIHLERI = ['2026-03-01', '2026-06-21', '2026-12-21'];

function dunyaFiksturu() {
  require('sucrase/register/ts');
  const { Coordinates, PrayerTimes } = require('adhan');
  const { hesapParametreleriOlustur } = require('../../src/core/vakit/hesapProfilleri.ts');
  const { tvHesapOzeti } = require('../../src/core/vakit/tvHesapOzeti.ts');
  const ornekler = [];
  for (const o of DUNYA_ORNEKLERI) {
    for (const tarih of DUNYA_TARIHLERI) {
      const [yil, ay, gun] = tarih.split('-').map(Number);
      const gunTarihi = new Date(yil, ay - 1, gun);
      const hesap = tvHesapOzeti(o.ayar, o.lat, gunTarihi);
      if (!hesap) throw new Error(`${o.ad}: özet bekleniyordu`);
      const pt = new PrayerTimes(
        new Coordinates(o.lat, o.lng),
        gunTarihi,
        hesapParametreleriOlustur(o.ayar, { tarih: gunTarihi, enlem: o.lat }),
      );
      ornekler.push({
        ad: o.ad,
        lat: o.lat,
        lng: o.lng,
        tarih,
        ayar: o.ayar,
        hesap,
        vakitler: {
          imsak: pt.fajr.getTime(),
          gunes: pt.sunrise.getTime(),
          ogle: pt.dhuhr.getTime(),
          ikindi: pt.asr.getTime(),
          aksam: pt.maghrib.getTime(),
          yatsi: pt.isha.getTime(),
        },
      });
    }
  }
  const fikstur = {
    aciklama:
      'Telefonun Turkiye disi hesap yolu (hesapParametreleriOlustur) + TV ozeti (tvHesapOzeti). Uretici: scripts/tv/tv-verisi-uret.js',
    ornekler,
  };
  const yol = path.join(KOK, 'tv/app/src/test/resources/vakit-fiksturu-dunya.json');
  fs.writeFileSync(yol, JSON.stringify(fikstur, null, 1) + '\n');
  console.log(`dunya ornek: ${ornekler.length}`);
}

main();
