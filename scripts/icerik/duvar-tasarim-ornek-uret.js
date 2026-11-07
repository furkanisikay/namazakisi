#!/usr/bin/env node
'use strict';
/**
 * Duvar kâğıdı tasarım sözleşmesinin (`src/core/icerik/duvarTasarimi.ts`) eşlik örneği:
 * `android/app/src/test/resources/duvar-tasarim-ornek.json`. Kotlin (`DuvarTasarimiTest`) ve
 * Swift (siri-kisayollari testi) aynı dosyayı okur; JS nöbetçisi (`duvarTasarimi.test.ts`)
 * dosyanın bu üreticinin çıktısıyla birebir aynı olduğunu denetler.
 *
 * Kullanım: `node scripts/icerik/duvar-tasarim-ornek-uret.js` (sözleşme değişince).
 */
const fs = require('fs');
const path = require('path');
require('sucrase/register');

const KOK = path.join(__dirname, '..', '..');
const CIKTI = path.join(KOK, 'android', 'app', 'src', 'test', 'resources', 'duvar-tasarim-ornek.json');
const { duvarTasarimOrnegi } = require(path.join(KOK, 'src', 'core', 'icerik', 'duvarTasarimOrnegi'));

const icerik = `${JSON.stringify(duvarTasarimOrnegi(), null, 1)}\n`;
const eski = fs.existsSync(CIKTI) ? fs.readFileSync(CIKTI, 'utf8') : null;
if (eski !== icerik) fs.writeFileSync(CIKTI, icerik);
console.log(eski === icerik ? 'değişmedi' : `yazıldı: ${path.relative(KOK, CIKTI)}`);
