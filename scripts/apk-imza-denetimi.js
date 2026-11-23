#!/usr/bin/env node
/**
 * GitHub Release APK'sının imza sertifikasını denetler (android-build.yml).
 *
 * Kullanım: node scripts/apk-imza-denetimi.js <apk> <depodaki debug.keystore>
 * Çıkış: 0 = APK depodaki debug anahtarından BAŞKA bir sertifikayla imzalı (yayınlanabilir)
 *        3 = debug anahtarıyla imzalı (herkes aynı anahtarla "güncelleme" üretebilir → YAYINLAMA)
 *        4 = imza okunamadı (doğrulanamayan APK yayınlanmaz)
 *
 * APK sertifikası dosyanın KENDİSİNDEN okunur (APK Signing Block, şema v2/v3/v3.1): `apksigner`
 * çıktı biçimine ve SDK kurulumuna bağlı kalmaz. Debug parmak izi sabit yazılmaz; depodaki
 * debug.keystore'dan `keytool -exportcert` ile o an hesaplanır.
 * Nöbetçi: `src/__tests__/apkImzaDenetimi.test.ts`.
 */
const crypto = require('crypto');
const fs = require('fs');
const { execFileSync } = require('child_process');

const IMZA_BLOGU_SIHRI = 'APK Sig Block 42';
const SEMALAR = { 0x7109871a: 'v2', 0xf05368c0: 'v3', 0x1b93ad61: 'v3.1' };
const EOCD_IMZASI = 0x06054b50;

/** Uzunluk önekli (uint32 LE) alanı okur; taşarsa fırlatır. */
function uzunlukOnekli(tampon, konum) {
    if (konum + 4 > tampon.length) throw new Error('kesik alan');
    const n = tampon.readUInt32LE(konum);
    const son = konum + 4 + n;
    if (son > tampon.length) throw new Error('alan taşıyor');
    return { veri: tampon.subarray(konum + 4, son), sonraki: son };
}

/** ZIP "end of central directory" kaydının konumu (sondan geriye; yorum ≤ 64 KiB). */
function eocdKonumu(tampon) {
    const alt = Math.max(0, tampon.length - 22 - 0xffff);
    for (let i = tampon.length - 22; i >= alt; i--) {
        if (tampon.readUInt32LE(i) === EOCD_IMZASI) return i;
    }
    return -1;
}

/**
 * APK'nın imzacı sertifikalarının SHA-256 parmak izleri (küçük harf hex, tekrarsız).
 * İmza bloğu yoksa (yalnız v1 imza ya da imzasız) boş dizi.
 * @param {Buffer} apk
 * @returns {string[]}
 */
function apkSertifikaParmakIzleri(apk) {
    const eocd = eocdKonumu(apk);
    if (eocd < 0) return [];
    const merkezDizin = apk.readUInt32LE(eocd + 16);
    if (merkezDizin < 32 || merkezDizin > apk.length) return [];
    if (apk.toString('latin1', merkezDizin - 16, merkezDizin) !== IMZA_BLOGU_SIHRI) return [];
    const boyut = Number(apk.readBigUInt64LE(merkezDizin - 24));
    const baslangic = merkezDizin - boyut - 8;
    if (!Number.isSafeInteger(boyut) || boyut < 24 || baslangic < 0) return [];
    // Blok: [boyut u64][kimlik-değer çiftleri][boyut u64][sihir 16]; çiftler ilk u64'ten sonra başlar.
    const ciftler = apk.subarray(baslangic + 8, merkezDizin - 24);
    const izler = new Set();
    let k = 0;
    while (k + 12 <= ciftler.length) {
        const n = Number(ciftler.readBigUInt64LE(k));
        if (!Number.isSafeInteger(n) || n < 4 || k + 8 + n > ciftler.length) break;
        const kimlik = ciftler.readUInt32LE(k + 8);
        const deger = ciftler.subarray(k + 12, k + 8 + n);
        k += 8 + n;
        if (!SEMALAR[kimlik]) continue;
        try {
            const imzacilar = uzunlukOnekli(deger, 0).veri;
            let p = 0;
            while (p < imzacilar.length) {
                const imzaci = uzunlukOnekli(imzacilar, p);
                p = imzaci.sonraki;
                const imzaliVeri = uzunlukOnekli(imzaci.veri, 0).veri;
                const ozetler = uzunlukOnekli(imzaliVeri, 0);
                const sertifikalar = uzunlukOnekli(imzaliVeri, ozetler.sonraki).veri;
                let s = 0;
                while (s < sertifikalar.length) {
                    const sertifika = uzunlukOnekli(sertifikalar, s);
                    s = sertifika.sonraki;
                    izler.add(crypto.createHash('sha256').update(sertifika.veri).digest('hex'));
                }
            }
        } catch {
            return []; // Bozuk blok: doğrulanamadı say.
        }
    }
    return [...izler];
}

/** PEM sertifikanın (keytool -exportcert -rfc) DER gövdesinin SHA-256'sı; çözülemezse `null`. */
function pemParmakIzi(pem) {
    const m = /-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/.exec(pem);
    if (!m) return null;
    const der = Buffer.from(m[1].replace(/\s+/g, ''), 'base64');
    return der.length > 0 ? crypto.createHash('sha256').update(der).digest('hex') : null;
}

/**
 * @param {string[]} apkIzleri
 * @param {string | null} debugIzi
 * @returns {0 | 3 | 4}
 */
function imzaKarari(apkIzleri, debugIzi) {
    if (!debugIzi || apkIzleri.length === 0) return 4;
    return apkIzleri.includes(debugIzi) ? 3 : 0;
}

module.exports = { apkSertifikaParmakIzleri, pemParmakIzi, imzaKarari };

if (require.main === module) {
    const [apkYolu, debugKeystore] = process.argv.slice(2);
    if (!apkYolu || !debugKeystore) {
        console.error('Kullanım: apk-imza-denetimi.js <apk> <debug.keystore>');
        process.exit(4);
    }
    let debugIzi = null;
    try {
        const pem = execFileSync(
            'keytool',
            ['-exportcert', '-rfc', '-keystore', debugKeystore, '-storepass', 'android', '-alias', 'androiddebugkey'],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
        );
        debugIzi = pemParmakIzi(pem);
    } catch (e) {
        console.log(`::warning::debug.keystore sertifikası okunamadı: ${String(e.stderr || e.message).trim().slice(0, 300)}`);
    }
    let apkIzleri = [];
    try {
        apkIzleri = apkSertifikaParmakIzleri(fs.readFileSync(apkYolu));
    } catch (e) {
        console.log(`::warning::APK okunamadı: ${e.message}`);
    }
    const kod = imzaKarari(apkIzleri, debugIzi);
    // Parmak izleri gizli değildir (sertifika APK'nın içindedir); tanı için yazılır.
    console.log(`APK imza sertifikası SHA-256: ${apkIzleri.join(', ') || 'bulunamadı'}`);
    console.log(`Depodaki debug anahtarı SHA-256: ${debugIzi || 'bulunamadı'}`);
    if (kod === 3) console.log('::warning::APK depodaki herkese açık debug anahtarıyla imzalı');
    else if (kod === 4) console.log('::warning::APK imzası doğrulanamadı');
    else console.log('✅ APK imzası debug anahtarı değil');
    process.exit(kod);
}
