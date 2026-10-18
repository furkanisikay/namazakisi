#!/usr/bin/env node
/**
 * Wear OS saat kıblesi (saat yenileme W2) — telefonun kıble hesabıyla İKİZ fikstür.
 *
 * Telefon kıbleyi `adhan` JS `Qibla(coordinates)` ile hesaplar (`useKible.ts`).
 * Saat adhan2 bağımlılığı EKLEMEDEN aynı formülü `cekirdek/Kible.kt`'de taşır.
 * Bu betik telefonun yoluyla örnek noktaların açısını üretir:
 *
 *   wear/app/src/test/resources/kible-ornekleri.json
 *
 * Kilit iki taraflı: Kotlin `KibleTest` fikstürü kendi formülüyle (1e-9),
 * jest `kibleParitesi.test.ts` aynı fikstürü adhan'dan yeniden hesaplayarak
 * doğrular. Telefon formülü değişirse betiği yeniden koşun:
 *
 *   node scripts/saat/kible-fikstur-uret.js
 *
 * `dejenere: true` nokta (Kâbe'nin kendisi) yalnız "sonlu ve [0, 360)" kontrol
 * edilir: atan2(0, ±ε) iki dilde 0 ya da 180 çıkabilir, anlamlı bir yön yoktur.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { Coordinates, Qibla } = require('adhan');

const KOK = path.resolve(__dirname, '..', '..');
const CIKIS = path.join(KOK, 'wear/app/src/test/resources/kible-ornekleri.json');

const NOKTALAR = [
  { ad: 'İstanbul', lat: 41.0, lng: 29.0 },
  { ad: 'Erzurum', lat: 39.9, lng: 41.3 },
  { ad: 'Van', lat: 38.5, lng: 43.4 },
  { ad: 'İzmir', lat: 38.4, lng: 27.1 },
  { ad: 'Londra', lat: 51.5, lng: -0.1 },
  { ad: 'Cakarta', lat: -6.2, lng: 106.8 },
  { ad: 'Oslo', lat: 59.9, lng: 10.8 },
  { ad: 'Sidney', lat: -33.9, lng: 151.2 },
  { ad: 'New York', lat: 40.7, lng: -74.0 },
  { ad: 'Medine', lat: 24.5, lng: 39.6 },
  { ad: 'Mekke yakını', lat: 21.4, lng: 39.8 },
  { ad: 'Kâbe', lat: 21.4225241, lng: 39.8261818, dejenere: true },
];

function uret() {
  return NOKTALAR.map((n) => ({ ...n, aci: Qibla(new Coordinates(n.lat, n.lng)) }));
}

module.exports = { NOKTALAR, uret };

if (require.main === module) {
  const veri = uret();
  fs.writeFileSync(CIKIS, JSON.stringify(veri, null, 2) + '\n', 'utf8');
  console.log(`kible ornekleri: ${veri.length} nokta -> ${path.relative(KOK, CIKIS)}`);
}
