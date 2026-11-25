#!/usr/bin/env node
/**
 * App Store Connect'te bir surumu gonderime hazirlar ve incelemeye gonderir.
 *
 * Kullanim (her adim ayri cagrilir; geri alinmasi zor olan gonderim bilincli
 * olarak ayri bir adimdir):
 *   node scripts/app-store-surum.js durum              [--surum X.Y.Z]
 *   node scripts/app-store-surum.js surum-hazirla      [--surum X.Y.Z]
 *   node scripts/app-store-surum.js build-bagla        [--surum X.Y.Z] [--bekle 45]
 *   node scripts/app-store-surum.js incelemeye-gonder  [--surum X.Y.Z]
 *   node scripts/app-store-surum.js diller             [--surum X.Y.Z]
 *   node scripts/app-store-surum.js birincil-dil
 *   node scripts/app-store-surum.js ulkeler | ulkeler-ac
 *
 * --surum verilmezse app.json'daki surum kullanilir.
 *
 * surum-hazirla: duzenlenebilir bir surum varsa surum adini esitler, yoksa yeni
 *   surum acar (releaseType onceki surumden). "Yenilikler" metnini
 *   docs/app-store/surum-notlari.md > ## App Store > #### X.Y.Z kod blogundan
 *   yazar. Inceleme iletisim bilgisi yeni surume TASINMAZ; onceki surumunkini
 *   kopyalar (degerler loga YAZILMAZ — depo herkese acik).
 * build-bagla: o surumun en yeni build'i VALID olana kadar bekler, ihracat
 *   uyumlulugunu (usesNonExemptEncryption=false) yazar ve surume baglar.
 * incelemeye-gonder: eksik var mi denetler, sonra reviewSubmission olusturup
 *   gonderir.
 *
 * diller: butun mağaza dillerinin kaydini (ad, alt baslik, gizlilik adresi; aciklama, anahtar
 *   kelime, promosyon, yenilikler) duzenlenebilir surume yazar. Turkce kaynak
 *   magaza-metinleri.md, digerleri docs/app-store/app-store-kayitlari/<dil>.json.
 * birincil-dil: birincil dili BIRINCIL_YEREL'e alir; o yerelde ekran goruntusu yoksa durur.
 * ulkeler: ulke erisimini okur. ulkeler-ac: kapali butun ulkeleri acar.
 *
 * Kimlik bilgileri: scripts/asc-istemci.js.
 */
const fs = require('fs');
const path = require('path');
const { APP, api, hata, kimlikDenetle } = require('./asc-istemci');

const KOK = path.join(__dirname, '..');
const DUZENLENEBILIR = ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY'];
const INCELEME_ALANLARI = [
    'contactFirstName',
    'contactLastName',
    'contactPhone',
    'contactEmail',
    'demoAccountName',
    'demoAccountPassword',
    'demoAccountRequired',
    'notes',
];

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

function argumanlar() {
    const argv = process.argv.slice(2);
    const deger = (ad, varsayilan) => {
        const i = argv.indexOf('--' + ad);
        return i >= 0 && argv[i + 1] ? argv[i + 1] : varsayilan;
    };
    const appJson = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));
    return {
        islem: argv.find((a) => !a.startsWith('--')) || 'durum',
        surum: deger('surum', '') || appJson.expo.version,
        bekleDk: Number(deger('bekle', '45')),
    };
}

/** surum-notlari.md > ## App Store > #### X.Y.Z altindaki ilk kod blogu. */
function surumNotu(surum) {
    const md = fs.readFileSync(path.join(KOK, 'docs/app-store/surum-notlari.md'), 'utf8');
    const bolum = md.split(/^## /m).find((b) => b.startsWith('App Store'));
    if (!bolum) throw new Error('surum-notlari.md icinde "## App Store" bolumu yok.');
    const parcalar = bolum.split(/^#### /m);
    const blok = parcalar.find((p) => p.split('\n')[0].trim() === surum);
    if (!blok) throw new Error('surum-notlari.md > ## App Store altinda "#### ' + surum + '" yok.');
    const m = blok.match(/```[^\n]*\n([\s\S]*?)```/);
    if (!m || !m[1].trim()) throw new Error('#### ' + surum + ' altinda kod blogu (not metni) yok.');
    const metin = m[1].trim();
    if (metin.length > 4000) throw new Error('Not 4000 karakteri asiyor (' + metin.length + ').');
    return metin;
}

async function surumler() {
    const r = await api('GET', '/v1/apps/' + APP + '/appStoreVersions?filter[platform]=IOS&limit=20');
    if (r.kod >= 300) hata('surumler okunamadi', r);
    return r.j.data.sort((a, b) => (b.attributes.createdDate || '').localeCompare(a.attributes.createdDate || ''));
}

async function incelemeDetayi(surumId) {
    const r = await api('GET', '/v1/appStoreVersions/' + surumId + '/appStoreReviewDetail');
    if (r.kod === 404 || (r.kod < 300 && !r.j.data)) return null;
    if (r.kod >= 300) hata('inceleme detayi okunamadi', r);
    return r.j.data;
}

async function yerellestirmeler(surumId) {
    const r = await api('GET', '/v1/appStoreVersions/' + surumId + '/appStoreVersionLocalizations');
    if (r.kod >= 300) hata('yerellestirmeler okunamadi', r);
    return r.j.data;
}

async function surumBuildi(surumId) {
    const r = await api('GET', '/v1/appStoreVersions/' + surumId + '/build');
    if (r.kod === 404 || (r.kod < 300 && !r.j.data)) return null;
    if (r.kod >= 300) hata('surum build\'i okunamadi', r);
    return r.j.data;
}

async function buildler(surum) {
    let yol = '/v1/builds?filter[app]=' + APP + '&sort=-uploadedDate&limit=10&include=preReleaseVersion';
    if (surum) yol += '&filter[preReleaseVersion.version]=' + encodeURIComponent(surum);
    const r = await api('GET', yol);
    if (r.kod >= 300) hata('build\'ler okunamadi', r);
    const surumAdi = {};
    (r.j.included || []).forEach((x) => {
        if (x.type === 'preReleaseVersions') surumAdi[x.id] = x.attributes.version;
    });
    return r.j.data.map((b) => ({
        id: b.id,
        surum: surumAdi[(((b.relationships || {}).preReleaseVersion || {}).data || {}).id] || '?',
        numara: b.attributes.version,
        durum: b.attributes.processingState,
        sifreleme: b.attributes.usesNonExemptEncryption,
        suresiDoldu: b.attributes.expired,
        yuklendi: b.attributes.uploadedDate,
    }));
}

/** iPad 13" (2064x2752 / 2048x2732) setinin ASC adi. */
const IPAD_EKRAN_TIPI = 'APP_IPAD_PRO_3GEN_129';

/** Uygulama iPad'de calisiyor mu (app.json > expo.ios.supportsTablet)? */
function ipadDestekleniyor() {
    const app = JSON.parse(fs.readFileSync(path.join(KOK, 'app.json'), 'utf8'));
    return !!(app.expo && app.expo.ios && app.expo.ios.supportsTablet);
}

async function ekranSayilari(locId) {
    const r = await api('GET', '/v1/appStoreVersionLocalizations/' + locId + '/appScreenshotSets');
    if (r.kod >= 300) hata('ekran setleri okunamadi', r);
    const sonuc = {};
    for (const s of r.j.data) {
        const g = await api('GET', '/v1/appScreenshotSets/' + s.id + '/appScreenshots');
        sonuc[s.attributes.screenshotDisplayType] = (g.j.data || []).length;
    }
    return sonuc;
}

/** Inceleme detayinda hangi alanlar dolu — DEGERLER yazilmaz. */
function doluAlanlar(detay) {
    if (!detay) return 'YOK';
    return INCELEME_ALANLARI.filter((a) => {
        const v = detay.attributes[a];
        return v !== null && v !== undefined && v !== '';
    }).join(', ');
}

async function durum(a) {
    console.log('Uygulama ' + APP + ', hedef surum ' + a.surum);
    const sv = await surumler();
    console.log('\nApp Store surumleri:');
    sv.slice(0, 6).forEach((s) =>
        console.log(
            '  ' +
                s.attributes.versionString.padEnd(8) +
                ' ' +
                (s.attributes.appStoreState || '').padEnd(24) +
                ' release=' +
                s.attributes.releaseType +
                ' ' +
                (s.attributes.createdDate || '').slice(0, 10)
        )
    );
    for (const s of sv.slice(0, 2)) {
        console.log('\nSurum ' + s.attributes.versionString + ' (' + s.attributes.appStoreState + '):');
        const b = await surumBuildi(s.id);
        console.log('  bagli build: ' + (b ? b.attributes.version + ' ' + b.attributes.processingState : 'YOK'));
        console.log('  inceleme detayi (dolu alanlar): ' + doluAlanlar(await incelemeDetayi(s.id)));
        for (const l of await yerellestirmeler(s.id)) {
            const ekran = await ekranSayilari(l.id);
            console.log(
                '  ' +
                    l.attributes.locale +
                    ': whatsNew=' +
                    (l.attributes.whatsNew ? l.attributes.whatsNew.length + ' kr' : 'bos') +
                    ', ekran=' +
                    JSON.stringify(ekran)
            );
        }
    }
    console.log('\nSon build\'ler:');
    (await buildler()).forEach((b) =>
        console.log(
            '  ' +
                b.surum.padEnd(8) +
                ' #' +
                b.numara +
                ' ' +
                b.durum +
                ' sifreleme=' +
                b.sifreleme +
                (b.suresiDoldu ? ' (suresi doldu)' : '') +
                ' ' +
                (b.yuklendi || '').slice(0, 16)
        )
    );
    const rs = await api('GET', '/v1/reviewSubmissions?filter[app]=' + APP + '&filter[platform]=IOS&limit=5');
    if (rs.kod < 300) {
        console.log('\nInceleme gonderimleri:');
        rs.j.data.forEach((x) =>
            console.log('  ' + x.id + ' ' + x.attributes.state + ' ' + (x.attributes.submittedDate || '').slice(0, 16))
        );
    }
}

async function duzenlenebilirSurum(sv) {
    return sv.find((s) => DUZENLENEBILIR.includes(s.attributes.appStoreState));
}

async function surumHazirla(a) {
    const not = surumNotu(a.surum);
    const sv = await surumler();
    const onceki = sv.find((s) => !DUZENLENEBILIR.includes(s.attributes.appStoreState));
    let hedef = await duzenlenebilirSurum(sv);

    if (hedef && hedef.attributes.versionString !== a.surum) {
        const r = await api('PATCH', '/v1/appStoreVersions/' + hedef.id, {
            data: { type: 'appStoreVersions', id: hedef.id, attributes: { versionString: a.surum } },
        });
        if (r.kod >= 300) hata('surum adi guncellenemedi', r);
        console.log('Duzenlenebilir surum ' + hedef.attributes.versionString + ' -> ' + a.surum);
        hedef = r.j.data;
    } else if (!hedef) {
        const attributes = { platform: 'IOS', versionString: a.surum };
        if (onceki && onceki.attributes.releaseType) attributes.releaseType = onceki.attributes.releaseType;
        const r = await api('POST', '/v1/appStoreVersions', {
            data: {
                type: 'appStoreVersions',
                attributes,
                relationships: { app: { data: { type: 'apps', id: APP } } },
            },
        });
        if (r.kod >= 300) hata('surum acilamadi', r);
        hedef = r.j.data;
        console.log('Yeni surum acildi: ' + a.surum + ' (release=' + hedef.attributes.releaseType + ')');
    } else {
        console.log('Surum ' + a.surum + ' zaten duzenlenebilir durumda (' + hedef.attributes.appStoreState + ').');
    }

    // "Yenilikler": Turkce surum-notlari.md'den, digerleri kayit dosyasindan (diller islemi).
    const locs = await yerellestirmeler(hedef.id);
    const dilNotu = yerelNotlari(not);
    for (const l of locs) {
        const not = dilNotu[l.attributes.locale];
        if (!not) throw new Error(l.attributes.locale + ' yerellestirmesi icin not metni yok (surum-notlari.md ya da app-store-kayitlari).');
        if (l.attributes.whatsNew === not) {
            console.log('  ' + l.attributes.locale + ': not zaten guncel');
            continue;
        }
        const r = await api('PATCH', '/v1/appStoreVersionLocalizations/' + l.id, {
            data: { type: 'appStoreVersionLocalizations', id: l.id, attributes: { whatsNew: not } },
        });
        if (r.kod >= 300) hata(l.attributes.locale + ' notu yazilamadi', r);
        console.log('  ' + l.attributes.locale + ': not yazildi (' + not.length + ' kr)');
    }

    // Inceleme iletisim bilgisi yeni surume tasinmaz → oncekinden kopyala.
    const mevcut = await incelemeDetayi(hedef.id);
    if (mevcut) {
        console.log('  inceleme detayi var (dolu: ' + doluAlanlar(mevcut) + ')');
    } else {
        const kaynakSurum = sv.find((s) => s.id !== hedef.id);
        const kaynak = kaynakSurum && (await incelemeDetayi(kaynakSurum.id));
        if (!kaynak) throw new Error('Onceki surumde inceleme iletisim bilgisi yok; sahibinden alin (uydurmayin).');
        const attributes = {};
        INCELEME_ALANLARI.forEach((k) => {
            const v = kaynak.attributes[k];
            if (v !== null && v !== undefined && v !== '') attributes[k] = v;
        });
        const r = await api('POST', '/v1/appStoreReviewDetails', {
            data: {
                type: 'appStoreReviewDetails',
                attributes,
                relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: hedef.id } } },
            },
        });
        if (r.kod >= 300) hata('inceleme detayi kopyalanamadi', r);
        console.log(
            '  inceleme detayi ' + kaynakSurum.attributes.versionString + ' surumunden kopyalandi (' + Object.keys(attributes).join(', ') + ')'
        );
    }

    for (const l of locs) console.log('  ' + l.attributes.locale + ' ekranlari: ' + JSON.stringify(await ekranSayilari(l.id)));
}

async function buildBagla(a) {
    const hedef = await duzenlenebilirSurum(await surumler());
    if (!hedef) throw new Error('Duzenlenebilir surum yok; once surum-hazirla calistirin.');
    if (hedef.attributes.versionString !== a.surum) {
        throw new Error('Duzenlenebilir surum ' + hedef.attributes.versionString + ', beklenen ' + a.surum + '.');
    }

    const bitis = Date.now() + a.bekleDk * 60000;
    let b;
    for (;;) {
        const liste = (await buildler(a.surum)).filter((x) => !x.suresiDoldu);
        b = liste[0];
        if (b && b.durum === 'VALID') break;
        if (b && (b.durum === 'FAILED' || b.durum === 'INVALID')) throw new Error('Build #' + b.numara + ' ' + b.durum);
        if (Date.now() > bitis) {
            throw new Error(
                (b ? 'Build #' + b.numara + ' hala ' + b.durum : a.surum + ' icin ASC\'de build yok') +
                    ' (' +
                    a.bekleDk +
                    ' dk beklendi). TestFlight islemesi bitince yeniden calistirin.'
            );
        }
        console.log('  bekleniyor: ' + (b ? '#' + b.numara + ' ' + b.durum : 'build henuz yok'));
        await bekle(60000);
    }
    console.log('Build #' + b.numara + ' VALID');

    if (b.sifreleme !== false) {
        const r = await api('PATCH', '/v1/builds/' + b.id, {
            data: { type: 'builds', id: b.id, attributes: { usesNonExemptEncryption: false } },
        });
        if (r.kod >= 300) hata('ihracat uyumlulugu yazilamadi', r);
        console.log('  usesNonExemptEncryption=false yazildi');
    }

    const r = await api('PATCH', '/v1/appStoreVersions/' + hedef.id + '/relationships/build', {
        data: { type: 'builds', id: b.id },
    });
    if (r.kod >= 300) hata('build baglanamadi', r);
    console.log('  build #' + b.numara + ' surum ' + a.surum + '\'e baglandi');
}

async function incelemeyeGonder(a) {
    const hedef = await duzenlenebilirSurum(await surumler());
    if (!hedef || hedef.attributes.versionString !== a.surum) {
        throw new Error('Gonderilecek duzenlenebilir ' + a.surum + ' surumu yok.');
    }
    const eksik = [];
    const b = await surumBuildi(hedef.id);
    if (!b) eksik.push('bagli build');
    if (!(await incelemeDetayi(hedef.id))) eksik.push('inceleme iletisim bilgisi');
    const birincil = await birincilYerel();
    for (const l of await yerellestirmeler(hedef.id)) {
        if (!l.attributes.whatsNew) eksik.push(l.attributes.locale + ' yenilikler metni');
        // Kendi ekran goruntusu olmayan yerel birincil dilinkini gosterir; zorunlu yalniz birincilde.
        if (l.attributes.locale !== birincil) continue;
        const ekran = await ekranSayilari(l.id);
        if (!Object.values(ekran).some((n) => n > 0)) eksik.push(l.attributes.locale + ' ekran goruntuleri');
        // app.json > ios.supportsTablet acikken Apple iPad 13" setini ZORUNLU tutar;
        // gonderimi biz durdurmazsak App Review kuyruguna girmeden reddedilir.
        if (ipadDestekleniyor() && !(ekran[IPAD_EKRAN_TIPI] > 0)) {
            eksik.push(l.attributes.locale + ' iPad 13" ekran goruntuleri (' + IPAD_EKRAN_TIPI + ')');
        }
    }
    if (eksik.length) throw new Error('Eksik: ' + eksik.join(', '));

    // Reddedilen surum duzeltilip yeniden gonderiliyorsa surum hala ESKI gonderime
    // (UNRESOLVED_ISSUES) baglidir; yeni gonderime eklemek 409 "cannot be reviewed" verir.
    // Apple'in yolu: eski gonderimin ogelerini resolved yap, eski gonderimi yeniden sun.
    const cozulmemis = await api(
        'GET',
        '/v1/reviewSubmissions?filter[app]=' + APP + '&filter[platform]=IOS&filter[state]=UNRESOLVED_ISSUES&limit=5'
    );
    if (cozulmemis.kod >= 300) hata('gonderimler okunamadi', cozulmemis);
    const eski = cozulmemis.j.data[0];
    if (eski) {
        // Onceki denemede acilmis BOS gonderimler kalmasin (iptal edilir).
        const bos = await api(
            'GET',
            '/v1/reviewSubmissions?filter[app]=' + APP + '&filter[platform]=IOS&filter[state]=READY_FOR_REVIEW&limit=5'
        );
        for (const s of (bos.j && bos.j.data) || []) {
            const o = await api('GET', '/v1/reviewSubmissions/' + s.id + '/items');
            if (((o.j && o.j.data) || []).length === 0) {
                await api('PATCH', '/v1/reviewSubmissions/' + s.id, {
                    data: { type: 'reviewSubmissions', id: s.id, attributes: { canceled: true } },
                });
                console.log('  bos gonderim iptal edildi: ' + s.id);
            }
        }
        const ogeler = await api('GET', '/v1/reviewSubmissions/' + eski.id + '/items');
        for (const oge of (ogeler.j && ogeler.j.data) || []) {
            const c = await api('PATCH', '/v1/reviewSubmissionItems/' + oge.id, {
                data: { type: 'reviewSubmissionItems', id: oge.id, attributes: { resolved: true } },
            });
            if (c.kod >= 300) hata('oge cozuldu olarak isaretlenemedi', c);
        }
        const g = await api('PATCH', '/v1/reviewSubmissions/' + eski.id, {
            data: { type: 'reviewSubmissions', id: eski.id, attributes: { submitted: true } },
        });
        if (g.kod >= 300) hata('reddedilen gonderim yeniden sunulamadi', g);
        console.log('Reddedilen gonderim yeniden sunuldu: ' + eski.id + ' -> ' + g.j.data.attributes.state);
        return;
    }

    // Acik (gonderilmemis) bir gonderim varsa onu kullan; yoksa ac.
    const rs = await api(
        'GET',
        '/v1/reviewSubmissions?filter[app]=' + APP + '&filter[platform]=IOS&filter[state]=READY_FOR_REVIEW&limit=5'
    );
    if (rs.kod >= 300) hata('gonderimler okunamadi', rs);
    let gonderim = rs.j.data[0];
    if (!gonderim) {
        const y = await api('POST', '/v1/reviewSubmissions', {
            data: {
                type: 'reviewSubmissions',
                attributes: { platform: 'IOS' },
                relationships: { app: { data: { type: 'apps', id: APP } } },
            },
        });
        if (y.kod >= 300) hata('gonderim acilamadi', y);
        gonderim = y.j.data;
        console.log('Gonderim acildi: ' + gonderim.id);
    } else {
        console.log('Acik gonderim kullaniliyor: ' + gonderim.id);
    }

    const ogeler = await api('GET', '/v1/reviewSubmissions/' + gonderim.id + '/items');
    const zatenVar = ((ogeler.j && ogeler.j.data) || []).length > 0;
    if (!zatenVar) {
        const o = await api('POST', '/v1/reviewSubmissionItems', {
            data: {
                type: 'reviewSubmissionItems',
                relationships: {
                    reviewSubmission: { data: { type: 'reviewSubmissions', id: gonderim.id } },
                    appStoreVersion: { data: { type: 'appStoreVersions', id: hedef.id } },
                },
            },
        });
        if (o.kod >= 300) hata('surum gonderime eklenemedi', o);
        console.log('  surum ' + a.surum + ' gonderime eklendi');
    }

    const g = await api('PATCH', '/v1/reviewSubmissions/' + gonderim.id, {
        data: { type: 'reviewSubmissions', id: gonderim.id, attributes: { submitted: true } },
    });
    if (g.kod >= 300) hata('incelemeye gonderilemedi', g);
    console.log('Incelemeye gonderildi: ' + g.j.data.attributes.state + ' (release=' + hedef.attributes.releaseType + ')');
}

// ---------------------------------------------------------------------------
// Dil kayitlari, birincil dil, ulke erisimi
// ---------------------------------------------------------------------------
const { ASC_DILLERI, KAYNAK_YEREL, BIRINCIL_YEREL } = require('./app-store-dilleri');
const { kayitOku, kayitDenetle } = require('./app-store-kayit-denetle');

/** magaza-metinleri.md > #### App Store — <alan> kod blogu. */
function kaynakAlan(baslik) {
    const md = fs.readFileSync(path.join(KOK, 'docs/app-store/magaza-metinleri.md'), 'utf8');
    const i = md.indexOf('#### App Store — ' + baslik + '\n');
    if (i < 0) throw new Error('magaza-metinleri.md icinde "#### App Store — ' + baslik + '" yok');
    const bas = md.indexOf('```', i) + 3;
    return md.slice(bas, md.indexOf('```', bas)).replace(/^[a-z]*\n/, '').trim();
}

/** Yerel -> kayit (Turkce kaynak dahil). whatsNew Turkcede surum notundan gelir. */
function butunKayitlar(turkceNot) {
    const kayitlar = {
        [KAYNAK_YEREL]: {
            name: kaynakAlan('ad'),
            subtitle: kaynakAlan('alt başlık'),
            keywords: kaynakAlan('anahtar kelimeler'),
            promotionalText: kaynakAlan('promosyon metni'),
            description: kaynakAlan('açıklama'),
            whatsNew: turkceNot,
        },
    };
    const hatalar = [];
    for (const [dil, yereller] of Object.entries(ASC_DILLERI)) {
        const { kayit, hata: h } = kayitOku(dil);
        const sorun = h || kayitDenetle(kayit);
        if (sorun.length) hatalar.push(dil + ': ' + sorun.join(' | '));
        else yereller.forEach((y) => (kayitlar[y] = kayit));
    }
    const tr = kayitDenetle(kayitlar[KAYNAK_YEREL]);
    if (tr.length) hatalar.push('tr: ' + tr.join(' | '));
    if (hatalar.length) throw new Error('kayitlar denetimden gecmedi:\n' + hatalar.join('\n'));
    return kayitlar;
}

function yerelNotlari(turkceNot) {
    const sonuc = {};
    for (const [y, k] of Object.entries(butunKayitlar(turkceNot))) sonuc[y] = k.whatsNew;
    return sonuc;
}

async function birincilYerel() {
    const r = await api('GET', '/v1/apps/' + APP);
    if (r.kod >= 300) hata('uygulama okunamadi', r);
    return r.j.data.attributes.primaryLocale;
}

/** Duzenlenebilir appInfo (ad ve alt baslik yalniz onda yazilir). */
async function duzenlenebilirAppInfo() {
    const r = await api('GET', '/v1/apps/' + APP + '/appInfos');
    if (r.kod >= 300) hata('appInfos okunamadi', r);
    const kapali = ['READY_FOR_DISTRIBUTION', 'READY_FOR_SALE', 'REPLACED_WITH_NEW_INFO'];
    return r.j.data.find((x) => !kapali.includes(x.attributes.state || x.attributes.appStoreState)) || null;
}

async function diller(a) {
    const kayitlar = butunKayitlar(surumNotu(a.surum));
    const hedef = await duzenlenebilirSurum(await surumler());
    if (!hedef || hedef.attributes.versionString !== a.surum) throw new Error('Duzenlenebilir ' + a.surum + ' surumu yok; once surum-hazirla.');
    const info = await duzenlenebilirAppInfo();
    if (!info) throw new Error('Duzenlenebilir appInfo yok (yeni surum acilmamis olabilir).');

    const infoLoc = await api('GET', '/v1/appInfos/' + info.id + '/appInfoLocalizations?limit=200');
    if (infoLoc.kod >= 300) hata('appInfoLocalizations okunamadi', infoLoc);
    const mevcutInfo = Object.fromEntries(infoLoc.j.data.map((x) => [x.attributes.locale, x]));
    const verLoc = await api('GET', '/v1/appStoreVersions/' + hedef.id + '/appStoreVersionLocalizations?limit=200');
    if (verLoc.kod >= 300) hata('surum yerellestirmeleri okunamadi', verLoc);
    const mevcutVer = Object.fromEntries(verLoc.j.data.map((x) => [x.attributes.locale, x]));

    // Adresler dile gore degismez: kaynak yerelden (yoksa ilk kayittan) kopyalanir.
    const ornekInfo = mevcutInfo[KAYNAK_YEREL] || infoLoc.j.data[0];
    const ornekVer = mevcutVer[KAYNAK_YEREL] || verLoc.j.data[0];
    const gizlilik = ornekInfo && ornekInfo.attributes.privacyPolicyUrl;
    const destek = ornekVer && ornekVer.attributes.supportUrl;
    const pazarlama = ornekVer && ornekVer.attributes.marketingUrl;
    if (!destek) throw new Error('Kaynak yerelde destek adresi yok; once App Store Connect\'te doldurun.');

    for (const [yerel, k] of Object.entries(kayitlar)) {
        const infoAlan = { name: k.name, subtitle: k.subtitle, ...(gizlilik ? { privacyPolicyUrl: gizlilik } : {}) };
        let r;
        if (mevcutInfo[yerel]) {
            r = await api('PATCH', '/v1/appInfoLocalizations/' + mevcutInfo[yerel].id, {
                data: { type: 'appInfoLocalizations', id: mevcutInfo[yerel].id, attributes: infoAlan },
            });
        } else {
            r = await api('POST', '/v1/appInfoLocalizations', {
                data: {
                    type: 'appInfoLocalizations',
                    attributes: { locale: yerel, ...infoAlan },
                    relationships: { appInfo: { data: { type: 'appInfos', id: info.id } } },
                },
            });
        }
        if (r.kod >= 300) hata(yerel + ' ad/alt baslik yazilamadi', r);

        const verAlan = {
            description: k.description,
            keywords: k.keywords,
            promotionalText: k.promotionalText,
            whatsNew: k.whatsNew,
            supportUrl: destek,
            ...(pazarlama ? { marketingUrl: pazarlama } : {}),
        };
        // Apple, appInfo'ya yeni yerel eklenince surum yerellestirmesini de kendiliginden acar:
        // yoksa listeyi yeniden oku (POST 409 "already exists" verir).
        if (!mevcutVer[yerel]) {
            const yeniden = await api('GET', '/v1/appStoreVersions/' + hedef.id + '/appStoreVersionLocalizations?limit=200');
            if (yeniden.kod >= 300) hata('surum yerellestirmeleri okunamadi', yeniden);
            const bulunan = yeniden.j.data.find((x) => x.attributes.locale === yerel);
            if (bulunan) mevcutVer[yerel] = bulunan;
        }
        if (mevcutVer[yerel]) {
            r = await api('PATCH', '/v1/appStoreVersionLocalizations/' + mevcutVer[yerel].id, {
                data: { type: 'appStoreVersionLocalizations', id: mevcutVer[yerel].id, attributes: verAlan },
            });
        } else {
            r = await api('POST', '/v1/appStoreVersionLocalizations', {
                data: {
                    type: 'appStoreVersionLocalizations',
                    attributes: { locale: yerel, ...verAlan },
                    relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: hedef.id } } },
                },
            });
        }
        if (r.kod >= 300) hata(yerel + ' surum metni yazilamadi', r);
        console.log('  ' + yerel + ': ' + k.name);
    }
    console.log('DILLER: ' + Object.keys(kayitlar).length + ' yerel yazildi (surum ' + a.surum + ', incelemeye gonderilince yayina girer)');
}

async function birincilDil() {
    const simdiki = await birincilYerel();
    if (simdiki === BIRINCIL_YEREL) return console.log('Birincil dil zaten ' + BIRINCIL_YEREL);
    // Apple, yayindaki surum dahil acik HER surumde o yerelin gorselini ister (yoksa 409). Yayindaki
    // surum duzenlenemez: yeni dil, onu tasiyan surum yayina ciktiktan sonra birincil yapilir.
    const ACIK = [...DUZENLENEBILIR, 'WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'READY_FOR_SALE'];
    const acik = (await surumler()).filter((s) => ACIK.includes(s.attributes.appStoreState));
    if (!acik.length) throw new Error('Acik surum yok.');
    for (const sv of acik) {
        const ad = sv.attributes.versionString + ' (' + sv.attributes.appStoreState + ')';
        const loc = (await yerellestirmeler(sv.id)).find((l) => l.attributes.locale === BIRINCIL_YEREL);
        const ekran = loc ? await ekranSayilari(loc.id) : {};
        if (!Object.values(ekran).some((n) => n > 0))
            throw new Error(ad + ' surumunde ' + BIRINCIL_YEREL + ' ekran goruntusu yok. Duzenlenebilir surumse ekran-yukle; yayindaysa o yereli tasiyan surum yayina cikinca tekrar deneyin.');
    }
    const r = await api('PATCH', '/v1/apps/' + APP, { data: { type: 'apps', id: APP, attributes: { primaryLocale: BIRINCIL_YEREL } } });
    if (r.kod >= 300) hata('birincil dil degistirilemedi', r);
    console.log('Birincil dil: ' + simdiki + ' -> ' + BIRINCIL_YEREL);
}

async function ulkeErisimi() {
    const r = await api('GET', '/v1/apps/' + APP + '/appAvailabilityV2');
    if (r.kod >= 300) hata('ulke erisimi okunamadi', r);
    const id = r.j.data.id;
    const liste = [];
    let yol = '/v2/appAvailabilities/' + id + '/territoryAvailabilities?limit=200&include=territory';
    while (yol) {
        const t = await api('GET', yol);
        if (t.kod >= 300) hata('ulkeler okunamadi', t);
        t.j.data.forEach((x) => liste.push({ id: x.id, ulke: ((x.relationships || {}).territory || {}).data?.id, acik: x.attributes.available, durum: x.attributes.contentStatuses }));
        yol = t.j.links && t.j.links.next ? t.j.links.next.replace(/^https:\/\/api\.appstoreconnect\.apple\.com/, '') : null;
    }
    return { yeniUlkelerde: r.j.data.attributes.availableInNewTerritories, liste };
}

async function ulkeler() {
    const { yeniUlkelerde, liste } = await ulkeErisimi();
    const acik = liste.filter((x) => x.acik);
    console.log('ULKELER: ' + acik.length + ' acik / ' + liste.length + ' | yeni ulkelerde otomatik: ' + yeniUlkelerde);
    console.log('KAPALI: ' + liste.filter((x) => !x.acik).map((x) => x.ulke + (x.durum && x.durum.length ? '(' + x.durum.join('/') + ')' : '')).join(' '));
}

async function ulkelerAc() {
    const { liste } = await ulkeErisimi();
    let acilan = 0;
    for (const x of liste.filter((u) => !u.acik)) {
        const r = await api('PATCH', '/v1/territoryAvailabilities/' + x.id, {
            data: { type: 'territoryAvailabilities', id: x.id, attributes: { available: true } },
        });
        if (r.kod >= 300) console.log('  ' + x.ulke + ' acilamadi: ' + r.kod + ' ' + JSON.stringify(r.j).slice(0, 160));
        else acilan++;
    }
    console.log('ACILAN: ' + acilan);
    await ulkeler();
}

(async () => {
    kimlikDenetle();
    const a = argumanlar();
    const islemler = {
        durum,
        'surum-hazirla': surumHazirla,
        'build-bagla': buildBagla,
        'incelemeye-gonder': incelemeyeGonder,
        diller,
        'birincil-dil': birincilDil,
        ulkeler,
        'ulkeler-ac': ulkelerAc,
    };
    const f = islemler[a.islem];
    if (!f) throw new Error('Bilinmeyen islem: ' + a.islem + ' (' + Object.keys(islemler).join(', ') + ')');
    await f(a);
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
