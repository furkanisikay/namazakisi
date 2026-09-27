#!/usr/bin/env node
/**
 * Google Play magaza kaydini okur/yazar (Android Publisher API).
 *
 * Kullanim:
 *   node scripts/play-magaza.js oku
 *   node scripts/play-magaza.js yaz [--gorseller <klasor>]
 *
 * Kimlik: GOOGLE_SERVICE_ACCOUNT ortam degiskeni (service account JSON icerigi).
 * Anahtar icerigi asla yazdirilmaz.
 *
 * Metinler tek dogru kaynaktan gelir: docs/app-store/magaza-metinleri.md
 * (Play bolumu). Buraya elle metin GOMME.
 *
 * NOT: Play'de bir duzenleme (edit) acilir, degisiklikler ona yazilir ve
 * `commit` ile yayina alinir. `commit` cagrilmazsa hicbir sey degismez —
 * `oku` modu bu yuzden edit'i `delete` ile kapatir.
 */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const PAKET = process.env.PLAY_PAKET || 'com.furkanisikay.namazakisi';
const DIL = 'tr-TR';

const ham = process.env.GOOGLE_SERVICE_ACCOUNT;
if (!ham) {
    console.error('GOOGLE_SERVICE_ACCOUNT ortam degiskeni gerekli.');
    process.exit(1);
}
let SA;
try {
    SA = JSON.parse(ham);
} catch {
    console.error('GOOGLE_SERVICE_ACCOUNT gecerli bir JSON degil.');
    process.exit(1);
}

function istekGonder(secenek, govde) {
    return new Promise((coz, reddet) => {
        const r = https.request(secenek, (res) => {
            const parcalar = [];
            res.on('data', (c) => parcalar.push(c));
            res.on('end', () => {
                const metin = Buffer.concat(parcalar).toString('utf8');
                let j = null;
                try {
                    j = metin ? JSON.parse(metin) : null;
                } catch {
                    j = metin;
                }
                coz({ kod: res.statusCode, j });
            });
        });
        r.on('error', reddet);
        if (govde) r.write(govde);
        r.end();
    });
}

/** Service account JWT -> OAuth2 erisim jetonu. */
async function jeton() {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const simdi = Math.floor(Date.now() / 1000);
    const bas = b64({ alg: 'RS256', typ: 'JWT' });
    const govde = b64({
        iss: SA.client_email,
        scope: 'https://www.googleapis.com/auth/androidpublisher',
        aud: 'https://oauth2.googleapis.com/token',
        iat: simdi,
        exp: simdi + 3600,
    });
    const imza = crypto.sign('sha256', Buffer.from(bas + '.' + govde), SA.private_key).toString('base64url');
    const veri = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: bas + '.' + govde + '.' + imza,
    }).toString();
    const r = await istekGonder(
        {
            method: 'POST',
            host: 'oauth2.googleapis.com',
            path: '/token',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(veri) },
        },
        veri
    );
    if (r.kod >= 300 || !r.j || !r.j.access_token) throw new Error('jeton alinamadi: ' + r.kod);
    return r.j.access_token;
}

function api(tur, yol, govde, ekBaslik = {}) {
    const veri = govde ? (typeof govde === 'string' ? govde : JSON.stringify(govde)) : undefined;
    return istekGonder(
        {
            method: tur,
            host: 'androidpublisher.googleapis.com',
            path: '/androidpublisher/v3/applications/' + PAKET + yol,
            headers: {
                Authorization: 'Bearer ' + api.jeton,
                ...(veri ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(veri) } : {}),
                ...ekBaslik,
            },
        },
        veri
    );
}

/** Gorsel yukleme ayri bir host (upload) ve ikili govde ister. */
function gorselYukle(editId, tur, dosya) {
    const veri = fs.readFileSync(dosya);
    return istekGonder(
        {
            method: 'POST',
            host: 'androidpublisher.googleapis.com',
            path:
                '/upload/androidpublisher/v3/applications/' +
                PAKET +
                '/edits/' +
                editId +
                '/listings/' +
                DIL +
                '/' +
                tur +
                '?uploadType=media',
            headers: {
                Authorization: 'Bearer ' + api.jeton,
                'Content-Type': 'image/png',
                'Content-Length': veri.length,
            },
        },
        veri
    );
}

/** magaza-metinleri.md icindeki Play bolumunden metinleri okur. */
function playMetinleri() {
    const md = fs.readFileSync(path.resolve(__dirname, '..', 'docs/app-store/magaza-metinleri.md'), 'utf8');
    const blok = (baslik) => {
        const i = md.indexOf(baslik);
        if (i < 0) throw new Error('bulunamadi: ' + baslik);
        const bas = md.indexOf('```', i) + 3;
        const son = md.indexOf('```', bas);
        return md.slice(bas, son).replace(/^[a-z]*\n/, '').trim();
    };
    return {
        title: blok('#### Play — uygulama adı'),
        shortDescription: blok('#### Play — kısa açıklama'),
        fullDescription: blok('#### Play — tam açıklama'),
    };
}

(async () => {
    const mod = process.argv[2];
    if (mod !== 'oku' && mod !== 'yaz') {
        console.error('Kullanim: play-magaza.js <oku|yaz> [--gorseller <klasor>]');
        process.exit(1);
    }
    api.jeton = await jeton();

    const ekle = await api('POST', '/edits');
    if (ekle.kod >= 300) throw new Error('edit acilamadi: ' + ekle.kod + ' ' + JSON.stringify(ekle.j).slice(0, 300));
    const editId = ekle.j.id;

    try {
        if (mod === 'oku') {
            const l = await api('GET', '/edits/' + editId + '/listings');
            for (const d of (l.j && l.j.listings) || []) {
                console.log('=== DIL: ' + d.language + ' ===');
                console.log('BASLIK      :', d.title);
                console.log('KISA ACIKLAMA (' + (d.shortDescription || '').length + '/80):');
                console.log(d.shortDescription);
                console.log('TAM ACIKLAMA (' + (d.fullDescription || '').length + '/4000):');
                console.log(d.fullDescription);
            }
            for (const tur of ['phoneScreenshots', 'featureGraphic', 'icon']) {
                const g = await api('GET', '/edits/' + editId + '/listings/' + DIL + '/' + tur);
                console.log('GORSEL ' + tur + ': ' + (((g.j && g.j.images) || []).length || 0) + ' adet');
            }
            return;
        }

        const metin = playMetinleri();
        const y = await api('PUT', '/edits/' + editId + '/listings/' + DIL, {
            language: DIL,
            title: metin.title,
            shortDescription: metin.shortDescription,
            fullDescription: metin.fullDescription,
        });
        if (y.kod >= 300) throw new Error('metin yazilamadi: ' + y.kod + ' ' + JSON.stringify(y.j).slice(0, 300));
        console.log('METINLER yazildi:', metin.title, '|', metin.shortDescription.length, 'krk kisa,', metin.fullDescription.length, 'krk tam');

        const gi = process.argv.indexOf('--gorseller');
        if (gi >= 0 && process.argv[gi + 1]) {
            const klasor = process.argv[gi + 1];
            const telefon = fs
                .readdirSync(klasor)
                .filter((f) => /^\d.*\.png$/i.test(f))
                .sort();
            if (telefon.length) {
                // Eskiler silinmezse yenileri ARKASINA eklenir ve magazada karisik sira olur.
                const sil = await api('DELETE', '/edits/' + editId + '/listings/' + DIL + '/phoneScreenshots');
                console.log('eski telefon goruntuleri silindi:', sil.kod);
                for (const f of telefon) {
                    const r = await gorselYukle(editId, 'phoneScreenshots', path.join(klasor, f));
                    console.log('  ' + f + ' -> ' + r.kod);
                    if (r.kod >= 300) throw new Error(f + ' yuklenemedi: ' + JSON.stringify(r.j).slice(0, 200));
                }
            }
            const one = path.join(klasor, 'one-cikan.png');
            if (fs.existsSync(one)) {
                await api('DELETE', '/edits/' + editId + '/listings/' + DIL + '/featureGraphic');
                const r = await gorselYukle(editId, 'featureGraphic', one);
                console.log('  one-cikan.png -> ' + r.kod);
            }
        }

        const commit = await api('POST', '/edits/' + editId + ':commit');
        if (commit.kod >= 300) throw new Error('commit basarisiz: ' + commit.kod + ' ' + JSON.stringify(commit.j).slice(0, 300));
        console.log('YAYINLANDI (edit commit edildi).');
        return;
    } finally {
        if (mod === 'oku') await api('DELETE', '/edits/' + editId);
    }
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
