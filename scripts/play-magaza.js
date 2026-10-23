#!/usr/bin/env node
/**
 * Google Play magaza kaydini okur/yazar (Android Publisher API).
 *
 * Kullanim:
 *   node scripts/play-magaza.js oku
 *   node scripts/play-magaza.js yaz [--gorseller <klasor>] [--tablet <klasor>]
 *   node scripts/play-magaza.js aab-yukle --dosya <aab> --kanal <kanal> [--ad <surum adi>]
 *   node scripts/play-magaza.js gorseller --json <dosya>
 *
 * `gorseller`: SALT OKUR. Magazadaki CANLI kareleri (telefon, Wear OS, TV, one cikan
 * gorsel) ve kanallardaki surumleri JSON'a yazar; README'deki kareler bununla
 * magazayla esit tutulur (scripts/belge-gorselleri.js). Edit acilir, okunur, silinir.
 *
 * `aab-yukle`: saat (Wear OS) ve TV paketlerini AYNI uygulama kaydinin form faktoru
 * kanallarina yukler. Kanal adi `<onek>:<kanal>` bicimindedir (Play Developer API,
 * "Form factor tracks": wear, tv, automotive) → `wear:internal`, `tv:internal`.
 * Telefon AAB'si normalde EAS submit ile gider; EAS derleyemezse (ucretsiz plan
 * kotasi) expo-build.yml GitHub'da derleyip bu yoldan `--kanal internal` ile yukler.
 * Sürüm adi versionName olmali ("0.42.0"): `uretime-al` ve `tv-ekle` ona dayanir.
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

/** AAB yukleme: ayri upload host'u, ikili govde. Yanit { versionCode, sha256 }. */
function paketYukle(editId, dosya) {
    const veri = fs.readFileSync(dosya);
    return istekGonder(
        {
            method: 'POST',
            host: 'androidpublisher.googleapis.com',
            path: '/upload/androidpublisher/v3/applications/' + PAKET + '/edits/' + editId + '/bundles?uploadType=media',
            headers: {
                Authorization: 'Bearer ' + api.jeton,
                'Content-Type': 'application/octet-stream',
                'Content-Length': veri.length,
            },
        },
        veri
    );
}

/**
 * docs/app-store/surum-notlari.md icinden `#### <surum>` basligindaki kod
 * blogunu okur. Notlarin tek dogru kaynagi o dosya: magazaya elle yazilan not
 * repoda iz birakmaz ve bir sonraki surumde uslup kayar.
 */
function surumNotunuOku(surum) {
    const md = fs.readFileSync(path.resolve(__dirname, '..', 'docs/app-store/surum-notlari.md'), 'utf8');
    const baslik = '#### ' + surum;
    const i = md.indexOf(baslik);
    if (i < 0) throw new Error('surum-notlari.md icinde "' + baslik + '" yok');
    const bas = md.indexOf('```', i) + 3;
    const son = md.indexOf('```', bas);
    return md.slice(bas, son).replace(/^[a-z]*\n/, '').trim();
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
    const MODLAR = ['oku', 'yaz', 'surumler', 'uretime-al', 'aab-yukle', 'cihaz-kareleri', 'tv-ekle', 'gorseller'];
    if (!MODLAR.includes(mod)) {
        console.error('Kullanim: play-magaza.js <oku|yaz|surumler|uretime-al|aab-yukle|cihaz-kareleri|tv-ekle|gorseller> [--gorseller <klasor>] [--surum X.Y.Z] [--oran 0.2] [--dosya x.aab --kanal wear:internal]');
        process.exit(1);
    }
    const arg = (ad) => {
        const i = process.argv.indexOf('--' + ad);
        return i >= 0 ? process.argv[i + 1] : null;
    };
    const saltOkur = mod === 'oku' || mod === 'surumler' || mod === 'gorseller';
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
            // Yuklemeden sonra geri okuyup sayilari dogrulamak icin butun gorsel turleri.
            for (const tur of ['phoneScreenshots', 'sevenInchScreenshots', 'tenInchScreenshots', 'tvScreenshots', 'wearScreenshots', 'featureGraphic', 'icon']) {
                const g = await api('GET', '/edits/' + editId + '/listings/' + DIL + '/' + tur);
                const im = (g.j && g.j.images) || [];
                console.log('GORSEL ' + tur + ': ' + im.length + ' adet');
                im.forEach((x) => console.log('  ' + x.url));
            }
            return;
        }

        if (mod === 'gorseller') {
            const hedef = arg('json');
            if (!hedef) throw new Error('--json <dosya> gerekli');
            const sonuc = { gorseller: {}, kanallar: [] };
            for (const tur of ['phoneScreenshots', 'wearScreenshots', 'tvScreenshots', 'featureGraphic']) {
                const g = await api('GET', '/edits/' + editId + '/listings/' + DIL + '/' + tur);
                if (g.kod >= 300) throw new Error(tur + ' okunamadi: ' + g.kod);
                sonuc.gorseller[tur] = ((g.j && g.j.images) || []).map((x) => ({ id: x.id, url: x.url, sha256: x.sha256 }));
            }
            const t = await api('GET', '/edits/' + editId + '/tracks');
            for (const kanal of (t.j && t.j.tracks) || []) {
                for (const r of kanal.releases || []) {
                    sonuc.kanallar.push({ kanal: kanal.track, ad: r.name || null, durum: r.status });
                }
            }
            fs.writeFileSync(hedef, JSON.stringify(sonuc, null, 2));
            console.log('GORSELLER yazildi: ' + hedef + ' | ' + Object.entries(sonuc.gorseller).map(([k, v]) => k + '=' + v.length).join(', '));
            return;
        }

        if (mod === 'surumler') {
            const t = await api('GET', '/edits/' + editId + '/tracks');
            for (const kanal of (t.j && t.j.tracks) || []) {
                console.log('=== KANAL: ' + kanal.track + ' ===');
                for (const r of kanal.releases || []) {
                    const oran = r.userFraction ? ' | oran ' + r.userFraction : '';
                    console.log('  ' + (r.name || '-') + ' | kod ' + (r.versionCodes || []).join(',') + ' | ' + r.status + oran);
                    for (const n of r.releaseNotes || []) {
                        console.log('    [' + n.language + '] (' + n.text.length + '/500)');
                        n.text.split(/\r?\n/).forEach((satir) => console.log('      ' + satir));
                    }
                }
            }
            return;
        }

        if (mod === 'uretime-al') {
            const surum = arg('surum');
            if (!surum) throw new Error('--surum gerekli (ör. 0.28.2)');
            const notlar = surumNotunuOku(surum);
            if (notlar.length > 500) throw new Error('surum notu ' + notlar.length + ' karakter; Play siniri 500');
            // Surum kodu ic test kanalindan bulunur: EAS o kanala yukluyor.
            const ic = await api('GET', '/edits/' + editId + '/tracks/internal');
            const kaynak = ((ic.j && ic.j.releases) || []).find((r) => (r.name || '').includes(surum));
            if (!kaynak) throw new Error(surum + ' ic test kanalinda bulunamadi');
            const oran = arg('oran');
            const surumKaydi = {
                name: surum,
                versionCodes: kaynak.versionCodes,
                // Oran verilirse kademeli yayin (inProgress), verilmezse herkese.
                status: oran ? 'inProgress' : 'completed',
                ...(oran ? { userFraction: Number(oran) } : {}),
                releaseNotes: [{ language: DIL, text: notlar }],
            };
            const u = await api('PUT', '/edits/' + editId + '/tracks/production', {
                track: 'production',
                releases: [surumKaydi],
            });
            if (u.kod >= 300) throw new Error('uretim kanali yazilamadi: ' + u.kod + ' ' + JSON.stringify(u.j).slice(0, 300));
            console.log('URETIM: ' + surum + ' | kod ' + kaynak.versionCodes.join(',') + ' | ' + surumKaydi.status + (oran ? ' ' + oran : ''));
            console.log('NOT (' + notlar.length + '/500):');
            notlar.split(/\r?\n/).forEach((satir) => console.log('  ' + satir));
            const c = await api('POST', '/edits/' + editId + ':commit');
            if (c.kod >= 300) throw new Error('commit basarisiz: ' + c.kod + ' ' + JSON.stringify(c.j).slice(0, 300));
            console.log('YAYINLANDI (uretim kanali commit edildi).');
            return;
        }

        if (mod === 'cihaz-kareleri') {
            // Wear OS / Android TV form faktörü kareleri (Play'in opt-in önkoşulu). Yalnız
            // `wearScreenshots` / `tvScreenshots` değişir; telefon kareleri ve metinler DOKUNULMAZ.
            const hedefler = [
                ['saat', 'wearScreenshots'],
                ['tv', 'tvScreenshots'],
            ];
            let yuklenen = 0;
            for (const [bayrak, tur] of hedefler) {
                const klasor = arg(bayrak);
                if (!klasor || !fs.existsSync(klasor)) continue;
                const kareler = fs
                    .readdirSync(klasor)
                    .filter((f) => /^\d.*\.png$/i.test(f))
                    .sort()
                    .slice(0, 8);
                if (!kareler.length) continue;
                const sil = await api('DELETE', '/edits/' + editId + '/listings/' + DIL + '/' + tur);
                console.log('eski ' + tur + ' silindi:', sil.kod);
                for (const f of kareler) {
                    const r = await gorselYukle(editId, tur, path.join(klasor, f));
                    console.log('  ' + tur + ' ' + f + ' -> ' + r.kod);
                    if (r.kod >= 300) throw new Error(f + ' yuklenemedi: ' + JSON.stringify(r.j).slice(0, 300));
                    yuklenen++;
                }
            }
            if (!yuklenen) throw new Error('yuklenecek kare yok (--saat <klasor> / --tv <klasor>)');
            const c = await api('POST', '/edits/' + editId + ':commit');
            if (c.kod >= 300) throw new Error('commit basarisiz: ' + c.kod + ' ' + JSON.stringify(c.j).slice(0, 300));
            console.log('YAYINLANDI: ' + yuklenen + ' saat/TV karesi');
            return;
        }

        if (mod === 'tv-ekle') {
            // Android TV Play'de AYRI kanal almaz: telefonla AYNI kanalda (internal) yaşar.
            // TV AAB'si, kanaldaki telefon sürümüne EK paket olarak eklenir (leanback
            // required → yalnız TV'ye; telefon paketiyle cihaz kümesi çakışmaz). Önceki TV
            // kodu sürüm adındaki "+TV <kod>" izinden bulunup çıkarılır; telefon
            // gönderimi (EAS submit ya da GitHub yedeğinin `aab-yukle --kanal internal`'ı)
            // sürümü yeniden kurunca iz kaybolur ve TV yeniden eklenir.
            const dosya = arg('dosya');
            const kanal = arg('kanal') || 'internal';
            if (!dosya || !fs.existsSync(dosya)) throw new Error('--dosya gerekli (var olan bir .aab)');
            if (kanal !== 'internal') throw new Error('tv-ekle yalnız internal kanalda çalışır (telefon sürümüne dokunur)');
            const y = await paketYukle(editId, dosya);
            if (y.kod >= 300 || !y.j || !y.j.versionCode) {
                throw new Error('paket yuklenemedi: ' + y.kod + ' ' + JSON.stringify(y.j).slice(0, 300));
            }
            const kod = String(y.j.versionCode);
            const t = await api('GET', '/edits/' + editId + '/tracks/' + kanal);
            if (t.kod >= 300) throw new Error(kanal + ' okunamadi: ' + t.kod + ' ' + JSON.stringify(t.j).slice(0, 300));
            const surumler = (t.j && t.j.releases) || [];
            const hedef = surumler.find((r) => r.status === 'completed');
            if (!hedef) throw new Error(kanal + ' kanalinda tamamlanmis telefon surumu yok; TV eklenmedi');
            const iz = /\s*\+TV (\d+)\s*$/;
            const eskiTv = ((hedef.name || '').match(iz) || [])[1];
            const kodlar = (hedef.versionCodes || []).map(String).filter((k) => k !== eskiTv && k !== kod);
            if (!kodlar.length) throw new Error('telefon surum kodu bulunamadi; TV tek basina birakilmaz');
            const ad = ((hedef.name || '').replace(iz, '') + ' +TV ' + kod).trim().slice(0, 50);
            const yeni = surumler.map((r) => (r === hedef ? { ...r, name: ad, versionCodes: [...kodlar, kod] } : r));
            const u = await api('PUT', '/edits/' + editId + '/tracks/' + kanal, { track: kanal, releases: yeni });
            if (u.kod >= 300) throw new Error(kanal + ' yazilamadi: ' + u.kod + ' ' + JSON.stringify(u.j).slice(0, 300));
            const c = await api('POST', '/edits/' + editId + ':commit');
            if (c.kod >= 300) throw new Error('commit basarisiz: ' + c.kod + ' ' + JSON.stringify(c.j).slice(0, 300));
            console.log('YAYINLANDI: TV ' + kod + ' -> ' + kanal + ' (' + ad + ') kodlar: ' + [...kodlar, kod].join(','));
            return;
        }

        if (mod === 'aab-yukle') {
            const dosya = arg('dosya');
            const kanal = arg('kanal');
            if (!dosya || !fs.existsSync(dosya)) throw new Error('--dosya gerekli (var olan bir .aab)');
            // Form faktoru kanallari (wear:/tv:) ya da YALNIZ telefonun `internal`
            // kanali (expo-build.yml GitHub yedegi; EAS submit ile ayni etki: kanaldaki
            // surum yer degistirir). Telefon production/alpha/beta bu yoldan YAZILMAZ —
            // uretime gecis `uretime-al` ile, internal'daki surumden yapilir.
            if (!/^((wear|tv):[a-z0-9-]+|internal)$/.test(kanal || '')) {
                throw new Error('--kanal wear:<kanal>, tv:<kanal> ya da (telefon) internal olmali');
            }
            const y = await paketYukle(editId, dosya);
            if (y.kod >= 300 || !y.j || !y.j.versionCode) {
                throw new Error('paket yuklenemedi: ' + y.kod + ' ' + JSON.stringify(y.j).slice(0, 300));
            }
            const kod = y.j.versionCode;
            console.log('PAKET yuklendi: kod ' + kod + ' | sha256 ' + String(y.j.sha256 || '').slice(0, 12) + '…');
            const ad = arg('ad');
            const u = await api('PUT', '/edits/' + editId + '/tracks/' + encodeURIComponent(kanal), {
                track: kanal,
                releases: [{ ...(ad ? { name: ad.slice(0, 50) } : {}), versionCodes: [String(kod)], status: 'completed' }],
            });
            if (u.kod >= 300) throw new Error(kanal + ' kanali yazilamadi: ' + u.kod + ' ' + JSON.stringify(u.j).slice(0, 300));
            const c = await api('POST', '/edits/' + editId + ':commit');
            if (c.kod >= 300) throw new Error('commit basarisiz: ' + c.kod + ' ' + JSON.stringify(c.j).slice(0, 300));
            console.log('YAYINLANDI: ' + kanal + ' | kod ' + kod + (ad ? ' | ' + ad : ''));
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
            // Tablet pazarlama gorselleri (2560x1600, 16:10): ayni dosyalar 7" ve 10"
            // tablet setlerine gider (ikisinin boyut sartini da karsilar).
            const ti = process.argv.indexOf('--tablet');
            const tabletKlasor = ti >= 0 ? process.argv[ti + 1] : null;
            if (tabletKlasor && fs.existsSync(tabletKlasor)) {
                const tablet = fs
                    .readdirSync(tabletKlasor)
                    .filter((f) => /^\d.*\.png$/i.test(f))
                    .sort()
                    .slice(0, 8);
                for (const tur of tablet.length ? ['sevenInchScreenshots', 'tenInchScreenshots'] : []) {
                    const sil = await api('DELETE', '/edits/' + editId + '/listings/' + DIL + '/' + tur);
                    console.log('eski ' + tur + ' silindi:', sil.kod);
                    for (const f of tablet) {
                        const r = await gorselYukle(editId, tur, path.join(tabletKlasor, f));
                        console.log('  ' + tur + ' ' + f + ' -> ' + r.kod);
                        if (r.kod >= 300) throw new Error(f + ' yuklenemedi: ' + JSON.stringify(r.j).slice(0, 200));
                    }
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
    } catch (e) {
        // Commit edilmemis edit'i birak: magazada hicbir sey degismez ama
        // bekleyen edit sonraki denemeleri karistirabilir.
        await api('DELETE', '/edits/' + editId).catch(() => {});
        if (mod === 'yaz' && (String(e.message).includes('PERMISSION_DENIED') || String(e.message).includes('403'))) {
            console.error(
                [
                    '',
                    'Servis hesabinin MAGAZA VARLIGI yetkisi yok.',
                    'Play Console > Kullanicilar ve izinler > ' + SA.client_email + ' >',
                    'uygulama izinleri > "Magaza varligini yonet" (Store presence) isaretlenmeli.',
                    'Surum yukleme yetkisi (eas submit) bunun icin YETMEZ.',
                ].join('\n')
            );
        }
        throw e;
    } finally {
        if (saltOkur) await api('DELETE', '/edits/' + editId).catch(() => {});
    }
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
