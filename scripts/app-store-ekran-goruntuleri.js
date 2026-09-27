#!/usr/bin/env node
/**
 * App Store Connect'e iPhone ekran goruntulerini yukler.
 *
 * Kullanim:
 *   node scripts/app-store-ekran-goruntuleri.js <klasor> [--tip APP_IPHONE_67] [--dil tr]
 *   node scripts/app-store-ekran-goruntuleri.js --durum
 *
 * Klasordeki .png dosyalari ADA GORE SIRALANIR ve o sirayla yuklenir
 * (01-ana-ekran.png, 02-muhafiz.png ... gibi adlandirin).
 *
 * Kimlik bilgileri ortam degiskenlerinden okunur; anahtar icerigi asla yazdirilmaz:
 *   ASC_KEY_ID          Anahtar kimligi
 *   ASC_KEY_ISSUER_ID   Issuer ID
 *   ASC_API_KEY_PATH    .p8 dosyasinin yolu (veya ASC_API_KEY ile icerigin kendisi)
 *   ASC_APP_ID          Uygulama kimligi (varsayilan: eas.json'daki ascAppId)
 *
 * Neden betik: ASC'nin varlik yukleme akisi uc adimlidir (rezervasyon -> parca
 * yukleme -> MD5 ile onay) ve elle yapilmasi hataya cok acik.
 */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const KID = process.env.ASC_KEY_ID;
const ISS = process.env.ASC_KEY_ISSUER_ID;
const ANAHTAR =
    process.env.ASC_API_KEY || (process.env.ASC_API_KEY_PATH && fs.readFileSync(process.env.ASC_API_KEY_PATH, 'utf8'));
const APP = process.env.ASC_APP_ID || '6813061360';

if (!KID || !ISS || !ANAHTAR) {
    console.error('Eksik ortam degiskeni: ASC_KEY_ID, ASC_KEY_ISSUER_ID ve ASC_API_KEY_PATH (veya ASC_API_KEY) gerekli.');
    process.exit(1);
}

function jwt() {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const simdi = Math.floor(Date.now() / 1000);
    const bas = b64({ alg: 'ES256', kid: KID, typ: 'JWT' });
    const govde = b64({ iss: ISS, iat: simdi, exp: simdi + 600, aud: 'appstoreconnect-v1' });
    const imza = crypto
        .sign('sha256', Buffer.from(bas + '.' + govde), { key: ANAHTAR, dsaEncoding: 'ieee-p1363' })
        .toString('base64url');
    return bas + '.' + govde + '.' + imza;
}

function api(yontem, yol, govde) {
    return new Promise((coz, reddet) => {
        const veri = govde ? JSON.stringify(govde) : undefined;
        const r = https.request(
            {
                method: yontem,
                host: 'api.appstoreconnect.apple.com',
                path: yol,
                headers: {
                    Authorization: 'Bearer ' + jwt(),
                    'Content-Type': 'application/json',
                    ...(veri ? { 'Content-Length': Buffer.byteLength(veri) } : {}),
                },
            },
            (res) => {
                let d = '';
                res.on('data', (c) => (d += c));
                res.on('end', () => {
                    let j = null;
                    try {
                        j = d ? JSON.parse(d) : null;
                    } catch {
                        j = d;
                    }
                    coz({ kod: res.statusCode, j });
                });
            }
        );
        r.on('error', reddet);
        if (veri) r.write(veri);
        r.end();
    });
}

/** Rezervasyonun verdigi imzali adrese ham parcayi yukler (Authorization basligi YOK). */
function parcaYukle(islem, tampon) {
    return new Promise((coz, reddet) => {
        const u = new URL(islem.url);
        const dilim = tampon.subarray(islem.offset, islem.offset + islem.length);
        const basliklar = {};
        (islem.requestHeaders || []).forEach((h) => {
            basliklar[h.name] = h.value;
        });
        basliklar['Content-Length'] = dilim.length;
        const r = https.request(
            { method: islem.method, host: u.host, path: u.pathname + u.search, headers: basliklar },
            (res) => {
                res.resume();
                res.on('end', () => (res.statusCode < 300 ? coz() : reddet(new Error('parca yuklenemedi: ' + res.statusCode))));
            }
        );
        r.on('error', reddet);
        r.write(dilim);
        r.end();
    });
}

function hata(etiket, r) {
    const d = ((r.j && r.j.errors) || []).map((e) => e.detail || e.title).join(' | ');
    throw new Error(etiket + ': ' + r.kod + ' ' + d);
}

(async () => {
    const argv = process.argv.slice(2);
    const klasor = argv.find((a) => !a.startsWith('--'));
    const deger = (ad, varsayilan) => {
        const i = argv.indexOf('--' + ad);
        return i >= 0 && argv[i + 1] ? argv[i + 1] : varsayilan;
    };
    const yalnizDurum = argv.includes('--durum');
    const TIP = deger('tip', 'APP_IPHONE_67');
    const DIL = deger('dil', 'tr');

    if (!klasor && !yalnizDurum) {
        console.error('Ekran goruntulerinin bulundugu klasoru verin. --durum ile mevcut durumu listeleyebilirsiniz.');
        process.exit(1);
    }

    const sv = await api('GET', '/v1/apps/' + APP + '/appStoreVersions?limit=10');
    if (sv.kod >= 300) hata('surumler okunamadi', sv);
    const surum = sv.j.data.find((x) => x.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION');
    if (!surum) throw new Error('Gonderime hazirlanan bir surum bulunamadi.');
    console.log('Surum ' + surum.attributes.versionString + ' (' + surum.id + ')');

    const yerel = await api('GET', '/v1/appStoreVersions/' + surum.id + '/appStoreVersionLocalizations');
    if (yerel.kod >= 300) hata('yerellestirmeler okunamadi', yerel);
    const loc = yerel.j.data.find((x) => x.attributes.locale === DIL);
    if (!loc) throw new Error('"' + DIL + '" yerellestirmesi yok.');

    const setler = await api('GET', '/v1/appStoreVersionLocalizations/' + loc.id + '/appScreenshotSets');
    if (setler.kod >= 300) hata('setler okunamadi', setler);
    let set = setler.j.data.find((x) => x.attributes.screenshotDisplayType === TIP);

    if (yalnizDurum) {
        if (!setler.j.data.length) console.log('  (hic set yok)');
        for (const s of setler.j.data) {
            const g = await api('GET', '/v1/appScreenshotSets/' + s.id + '/appScreenshots');
            console.log('  ' + s.attributes.screenshotDisplayType + ': ' + (g.j.data || []).length + ' goruntu');
            (g.j.data || []).forEach((x) =>
                console.log(
                    '    - ' + x.attributes.fileName + ' ' + ((x.attributes.assetDeliveryState || {}).state || '?')
                )
            );
        }
        return;
    }

    if (!set) {
        const y = await api('POST', '/v1/appScreenshotSets', {
            data: {
                type: 'appScreenshotSets',
                attributes: { screenshotDisplayType: TIP },
                relationships: {
                    appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } },
                },
            },
        });
        if (y.kod >= 300) hata('set olusturulamadi', y);
        set = y.j.data;
        console.log('Set olusturuldu: ' + TIP);
    }

    const dosyalar = fs
        .readdirSync(klasor)
        .filter((f) => /\.png$/i.test(f))
        .sort();
    if (!dosyalar.length) throw new Error(klasor + ' icinde .png bulunamadi.');
    console.log(dosyalar.length + ' goruntu yuklenecek: ' + dosyalar.join(', '));

    for (const ad of dosyalar) {
        const tampon = fs.readFileSync(path.join(klasor, ad));
        const rez = await api('POST', '/v1/appScreenshots', {
            data: {
                type: 'appScreenshots',
                attributes: { fileSize: tampon.length, fileName: ad },
                relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: set.id } } },
            },
        });
        if (rez.kod >= 300) hata(ad + ' rezerve edilemedi', rez);
        const kayit = rez.j.data;

        for (const islem of kayit.attributes.uploadOperations || []) await parcaYukle(islem, tampon);

        const ozet = crypto.createHash('md5').update(tampon).digest('hex');
        const onay = await api('PATCH', '/v1/appScreenshots/' + kayit.id, {
            data: { type: 'appScreenshots', id: kayit.id, attributes: { uploaded: true, sourceFileChecksum: ozet } },
        });
        if (onay.kod >= 300) hata(ad + ' onaylanamadi', onay);
        console.log('  ' + ad + ' yuklendi (' + (tampon.length / 1024).toFixed(0) + ' KB)');
    }

    // Apple goruntuleri isler; "COMPLETE" olmasi birkac saniye surer.
    for (let tur = 0; tur < 20; tur++) {
        const g = await api('GET', '/v1/appScreenshotSets/' + set.id + '/appScreenshots');
        const kayitlar = g.j.data || [];
        const bozuk = kayitlar.filter((x) => (x.attributes.assetDeliveryState || {}).state === 'FAILED');
        if (bozuk.length) {
            bozuk.forEach((x) =>
                console.error('  HATA ' + x.attributes.fileName + ': ' + JSON.stringify(x.attributes.assetDeliveryState.errors))
            );
            process.exit(1);
        }
        if (kayitlar.every((x) => (x.attributes.assetDeliveryState || {}).state === 'COMPLETE')) {
            console.log('Tamam: ' + kayitlar.length + ' goruntu islendi.');
            return;
        }
        await new Promise((c) => setTimeout(c, 3000));
    }
    console.log('Yuklendi, isleme devam ediyor. Durumu --durum ile kontrol edin.');
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
