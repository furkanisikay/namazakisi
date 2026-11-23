#!/usr/bin/env node
/**
 * GitHub Release APK'sı için `android/app/build.gradle` imza yaması (yalnız CI derlemesi;
 * dosya derlemeden sonra geri konur, commit'e girmez).
 *
 * Depodaki `release` derleme türü `signingConfigs.debug` kullanır (React Native şablonu) ve
 * `debug.keystore` herkese açıktır. Yama release'i `signingConfigs.release`'e ÇEVİRİR:
 * satır eklemek yetmez — Groovy'de son atama kazanır, alttaki `signingConfigs.debug` satırı
 * yamayı sessizce ezer ve APK yine herkesin elindeki anahtarla imzalanır.
 *
 * Uygulanamazsa FIRLATIR (şablon değiştiyse derleme dursun; sessizce debug imzaya düşmesin).
 * Nöbetçi: `src/__tests__/androidImzaYamasi.test.ts`.
 */
const fs = require('fs');

const IMZA_BLOGU = `
        release {
            storeFile file(project.property('RELEASE_STORE_FILE'))
            storePassword project.property('RELEASE_STORE_PASSWORD')
            keyAlias project.property('RELEASE_KEY_ALIAS')
            keyPassword project.property('RELEASE_KEY_PASSWORD')
        }`;

const RELEASE_DEBUG_IMZASI = /(buildTypes\s*\{[\s\S]*?\n\s*release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/;

/** `buildTypes { … }` bloğunun metni (süslü ayraç sayarak); bulunamazsa `null`. */
function buildTypesBlogu(icerik) {
    const m = /buildTypes\s*\{/.exec(icerik);
    if (!m) return null;
    let derinlik = 0;
    for (let i = m.index + m[0].length - 1; i < icerik.length; i++) {
        if (icerik[i] === '{') derinlik += 1;
        else if (icerik[i] === '}') {
            derinlik -= 1;
            if (derinlik === 0) return icerik.slice(m.index, i + 1);
        }
    }
    return null;
}

/** `buildTypes` içindeki `ad { … }` bloğu; bulunamazsa `null`. */
function turBlogu(buildTypes, ad) {
    const m = new RegExp(`\\n\\s*${ad}\\s*\\{`).exec(buildTypes);
    if (!m) return null;
    let derinlik = 0;
    for (let i = m.index + m[0].length - 1; i < buildTypes.length; i++) {
        if (buildTypes[i] === '{') derinlik += 1;
        else if (buildTypes[i] === '}') {
            derinlik -= 1;
            if (derinlik === 0) return buildTypes.slice(m.index, i + 1);
        }
    }
    return null;
}

/** Release derleme türünün kullandığı imza yapılandırmalarının adları (yorum satırları hariç). */
function releaseImzaAdlari(icerik) {
    const bt = buildTypesBlogu(icerik);
    const release = bt ? turBlogu(bt, 'release') : null;
    if (!release) return [];
    return release
        .split('\n')
        .filter((satir) => !satir.trim().startsWith('//'))
        .map((satir) => /signingConfig\s+signingConfigs\.(\w+)/.exec(satir))
        .filter(Boolean)
        .map((m) => m[1]);
}

/**
 * @param {string} icerik `build.gradle` metni
 * @returns {string} yamalı metin
 * @throws Yama uygulanamadıysa ya da release hâlâ `release` dışında bir imza kullanıyorsa.
 */
function imzaYamasiUygula(icerik) {
    if (!/signingConfigs\s*\{/.test(icerik)) throw new Error('signingConfigs bloğu bulunamadı');
    if (!RELEASE_DEBUG_IMZASI.test(icerik)) throw new Error('buildTypes.release içinde signingConfigs.debug bulunamadı');
    const yamali = icerik
        .replace(/(signingConfigs\s*\{)/, `$1${IMZA_BLOGU}`)
        .replace(RELEASE_DEBUG_IMZASI, '$1signingConfig signingConfigs.release');
    const adlar = releaseImzaAdlari(yamali);
    if (adlar.length !== 1 || adlar[0] !== 'release') {
        throw new Error(`release derlemesi beklenmeyen imza kullanıyor: ${adlar.join(', ') || 'yok'}`);
    }
    return yamali;
}

module.exports = { imzaYamasiUygula, releaseImzaAdlari };

if (require.main === module) {
    const yol = process.argv[2] || 'android/app/build.gradle';
    try {
        fs.writeFileSync(yol, imzaYamasiUygula(fs.readFileSync(yol, 'utf8')));
        console.log('✅ release = signingConfigs.release (yalnız bu derleme)');
    } catch (e) {
        console.error(`::error::build.gradle imza yaması uygulanamadı: ${e.message}`);
        process.exit(1);
    }
}
