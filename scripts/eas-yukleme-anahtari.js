#!/usr/bin/env node
/**
 * Play YUKLEME anahtarini EAS kimlik bilgilerinden indirir (saat + TV AAB'leri icin).
 *
 * Neden: telefon AAB'si EAS'te imzalanir ve yukleme anahtari YALNIZ orada durur
 * (GitHub'da keystore secret'i yok). Play App Signing ayni uygulama kaydinin tum
 * form faktorlerinde (telefon, Wear OS, Android TV) AYNI yukleme anahtarini ister →
 * saat/TV paketleri de bu anahtarla imzalanmali.
 *
 * Kullanim (yalniz CI):
 *   EXPO_TOKEN=... node scripts/eas-yukleme-anahtari.js <keystore-yolu>
 *
 * Yapilanlar:
 *   1. EAS GraphQL'den varsayilan Android derleme kimlik bilgisini okur
 *      (eas-cli'nin AndroidKeystoreFragment alanlari: keystore (base64 JKS),
 *      keystorePassword, keyAlias, keyPassword, type, sha256CertificateFingerprint).
 *   2. Sirlari `::add-mask::` ile maskeler — HICBIR sir loga yazilmaz.
 *   3. Keystore'u verilen yola yazar (cagiran $RUNNER_TEMP verir ve is sonunda siler).
 *   4. keytool ile indirilen anahtarin SHA-256 parmak izini EAS'in kaydiyla karsilastirir
 *      (yanlis kimlik bilgisiyle imzalanmis paket Play'de reddedilir; burada erken duser).
 *   5. Gradle ozelliklerini ORG_GRADLE_PROJECT_yukleme* olarak $GITHUB_ENV'e yazar
 *      (komut satirinda -P ile VERILMEZ: surec listesinde gorunurdu).
 */
const fs = require('fs');
const { spawnSync } = require('child_process');

const PROJE = process.env.EAS_PROJE || '@furkanisikay/namazakisi';
const PAKET = process.env.EAS_PAKET || 'com.furkanisikay.namazakisi';

const hedef = process.argv[2];
const jeton = process.env.EXPO_TOKEN;
// Yerel deneme: `~/.expo/state.json > auth.sessionSecret` ile (eas-cli'nin oturum yolu).
const oturum = process.env.EXPO_SESSION;
const envDosyasi = process.env.GITHUB_ENV;
if (!hedef || !(jeton || oturum) || !envDosyasi) {
    console.error('Kullanim: EXPO_TOKEN ve GITHUB_ENV tanimliyken: eas-yukleme-anahtari.js <keystore-yolu>');
    process.exit(1);
}

const SORGU = `query YuklemeAnahtari($proje: String!, $paket: String) {
  app {
    byFullName(fullName: $proje) {
      androidAppCredentials(filter: { applicationIdentifier: $paket }) {
        androidAppBuildCredentialsList {
          isDefault
          androidKeystore {
            type
            keystore
            keystorePassword
            keyAlias
            keyPassword
            sha256CertificateFingerprint
          }
        }
      }
    }
  }
}`;

/** GitHub Actions: degeri loglarda gizler (her satir ayri maskelenir). */
function maskele(deger) {
    for (const satir of String(deger).split(/\r?\n/)) {
        if (satir) console.log('::add-mask::' + satir);
    }
}

/** $GITHUB_ENV'e cok satira dayanikli (sinirlayicili) yazim — degerde '=' / bosluk olabilir. */
function ortamaYaz(ad, deger) {
    const sinir = 'SINIR_' + require('crypto').randomBytes(8).toString('hex');
    fs.appendFileSync(envDosyasi, `${ad}<<${sinir}\n${deger}\n${sinir}\n`);
}

(async () => {
    const yanit = await fetch('https://api.expo.dev/graphql', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            ...(jeton ? { authorization: 'Bearer ' + jeton } : { 'expo-session': oturum }),
        },
        body: JSON.stringify({ query: SORGU, variables: { proje: PROJE, paket: PAKET } }),
    });
    if (!yanit.ok) throw new Error('EAS GraphQL HTTP ' + yanit.status);
    const j = await yanit.json();
    if (j.errors && j.errors.length) {
        // Hata metni sir icermez (alan/izin hatasi); yine de kisa tut.
        throw new Error('EAS GraphQL hatasi: ' + JSON.stringify(j.errors.map((e) => e.message)).slice(0, 300));
    }
    const kimlikler = (j.data && j.data.app && j.data.app.byFullName && j.data.app.byFullName.androidAppCredentials) || [];
    const liste = kimlikler.flatMap((k) => k.androidAppBuildCredentialsList || []);
    const secilen = liste.find((b) => b.isDefault) || (liste.length === 1 ? liste[0] : null);
    const ks = secilen && secilen.androidKeystore;
    if (!ks || !ks.keystore) throw new Error('EAS\'te varsayilan Android keystore bulunamadi (' + liste.length + ' kayit).');

    // ONCE maskele, sonra her sey.
    maskele(ks.keystore);
    maskele(ks.keystorePassword);
    maskele(ks.keyPassword);

    const ikili = Buffer.from(ks.keystore, 'base64');
    fs.writeFileSync(hedef, ikili, { mode: 0o600 });
    const tur = String(ks.type || 'JKS').toLowerCase();

    // Parmak izi denetimi: parola argv'ye degil ortama gider (keytool `:env` destegi).
    const kt = spawnSync(
        'keytool',
        ['-list', '-v', '-keystore', hedef, '-storetype', tur, '-alias', ks.keyAlias, '-storepass:env', 'YUKLEME_KS_PAROLA'],
        { env: { ...process.env, YUKLEME_KS_PAROLA: ks.keystorePassword }, encoding: 'utf8' }
    );
    if (kt.error) throw new Error('keytool calistirilamadi (JDK PATH uzerinde mi?): ' + kt.error.code);
    if (kt.status !== 0) throw new Error('keytool keystore\'u acamadi (cikis ' + kt.status + ').');
    const eslesme = /SHA256:\s*([0-9A-F:]+)/i.exec(kt.stdout || '');
    const okunan = eslesme ? eslesme[1].replace(/:/g, '').toLowerCase() : '';
    const beklenen = String(ks.sha256CertificateFingerprint || '').replace(/:/g, '').toLowerCase();
    if (!okunan || !beklenen || okunan !== beklenen) {
        throw new Error('Keystore parmak izi EAS kaydiyla eslesmedi — imza yapilmayacak.');
    }

    ortamaYaz('ORG_GRADLE_PROJECT_yuklemeKeystore', hedef);
    ortamaYaz('ORG_GRADLE_PROJECT_yuklemeKeystoreTuru', tur);
    ortamaYaz('ORG_GRADLE_PROJECT_yuklemeKeystoreParolasi', ks.keystorePassword);
    ortamaYaz('ORG_GRADLE_PROJECT_yuklemeAnahtarAdi', ks.keyAlias);
    ortamaYaz('ORG_GRADLE_PROJECT_yuklemeAnahtarParolasi', ks.keyPassword);
    // Parmak izi gizli degil (Play Console'da da gorunur); paket denetimi icin.
    ortamaYaz('YUKLEME_SHA256', beklenen);
    console.log('Yukleme anahtari hazir (' + tur + ', SHA-256 ' + beklenen.slice(0, 8) + '…).');
})().catch((e) => {
    try {
        fs.rmSync(hedef, { force: true });
    } catch {
        /* yok say */
    }
    console.error('HATA', e.message);
    process.exitCode = 1;
});
