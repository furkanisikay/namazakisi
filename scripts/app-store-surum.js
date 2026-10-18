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

    // "Yenilikler" — notu yalniz Turkce var; baska dil cikarsa durup soyle.
    const locs = await yerellestirmeler(hedef.id);
    for (const l of locs) {
        if (!l.attributes.locale.startsWith('tr')) {
            throw new Error(l.attributes.locale + ' yerellestirmesi icin not metni yok; surum-notlari.md\'ye ekleyin.');
        }
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
    for (const l of await yerellestirmeler(hedef.id)) {
        if (!l.attributes.whatsNew) eksik.push(l.attributes.locale + ' yenilikler metni');
        const ekran = await ekranSayilari(l.id);
        if (!Object.values(ekran).some((n) => n > 0)) eksik.push(l.attributes.locale + ' ekran goruntuleri');
    }
    if (eksik.length) throw new Error('Eksik: ' + eksik.join(', '));

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

(async () => {
    kimlikDenetle();
    const a = argumanlar();
    const islemler = {
        durum,
        'surum-hazirla': surumHazirla,
        'build-bagla': buildBagla,
        'incelemeye-gonder': incelemeyeGonder,
    };
    const f = islemler[a.islem];
    if (!f) throw new Error('Bilinmeyen islem: ' + a.islem + ' (' + Object.keys(islemler).join(', ') + ')');
    await f(a);
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
