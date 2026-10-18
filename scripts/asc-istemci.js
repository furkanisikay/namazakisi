/**
 * App Store Connect REST API istemcisi (ortak).
 *
 * Kimlik bilgileri ortam degiskenlerinden okunur; anahtar icerigi asla yazdirilmaz:
 *   ASC_KEY_ID          Anahtar kimligi
 *   ASC_KEY_ISSUER_ID   Issuer ID
 *   ASC_API_KEY_PATH    .p8 dosyasinin yolu (veya ASC_API_KEY ile icerigin kendisi)
 *   ASC_APP_ID          Uygulama kimligi (varsayilan: eas.json'daki ascAppId)
 *
 * Kullananlar: scripts/app-store-ekran-goruntuleri.js, scripts/app-store-surum.js.
 */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

const KID = process.env.ASC_KEY_ID;
const ISS = process.env.ASC_KEY_ISSUER_ID;
const ANAHTAR =
    process.env.ASC_API_KEY || (process.env.ASC_API_KEY_PATH && fs.readFileSync(process.env.ASC_API_KEY_PATH, 'utf8'));
const APP = process.env.ASC_APP_ID || '6813061360';

function kimlikDenetle() {
    if (!KID || !ISS || !ANAHTAR) {
        console.error('Eksik ortam degiskeni: ASC_KEY_ID, ASC_KEY_ISSUER_ID ve ASC_API_KEY_PATH (veya ASC_API_KEY) gerekli.');
        process.exit(1);
    }
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

/** `{ kod, j }` doner; HTTP hatasinda firlatmaz (cagiran `hata` ile karar verir). */
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

function hata(etiket, r) {
    const d = ((r.j && r.j.errors) || []).map((e) => e.detail || e.title).join(' | ');
    throw new Error(etiket + ': ' + r.kod + ' ' + d);
}

module.exports = { APP, api, hata, kimlikDenetle };
