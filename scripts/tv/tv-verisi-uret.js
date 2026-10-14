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
}

main();
