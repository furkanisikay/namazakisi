#!/usr/bin/env node
/**
 * README ve kullaniciya donuk belgelerdeki DEGISEN bilgileri kaynak dosyalardan uretir.
 *
 * Kullanim:
 *   node scripts/belgeleri-guncelle.js            # bolgeleri yeniden yazar
 *   node scripts/belgeleri-guncelle.js --kontrol  # yazmaz; isaretler bozuksa ya da
 *                                                 # betik patlarsa exit 1, icerik farki
 *                                                 # yalniz UYARI (otomasyon kapatir)
 *
 * Belgelerde yalniz isaretli bolgeler degisir; aradaki elle yazilmis anlatima dokunulmaz:
 *
 *   <!-- OTOMATIK:BASLA ad -->
 *   ...bu arayi betik yazar, ELLE DUZENLEMEYIN...
 *   <!-- OTOMATIK:BITIR ad -->
 *
 * Kaynaklar (CEVRIMDISI — ag kullanmaz):
 *   package.json                       surum, teknoloji surumleri
 *   app.json                           paket kimligi, iOS widget / Apple Watch bayraklari
 *   eas.json                           App Store uygulama kimligi (ascAppId)
 *   src/core/constants/YeniOzellikler.ts  ozellik listesi (baslik + ozet + platform)
 *   docs/ekran-goruntuleri/manifest.json  kareler ve magazadaki surumler
 *                                         (scripts/belge-gorselleri.js yazar)
 *
 * Tamamen uretilen dosya: docs/ekran-goruntuleri/README.md (tam galeri).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { KOK, GORSEL_KLASORU, MANIFEST, GRUPLAR } = require('./belge-gorsel-gruplari');

const isaret = (tur, ad) => `<!-- OTOMATIK:${tur} ${ad} -->`;

const oku = (goreli) => fs.readFileSync(path.join(KOK, goreli), 'utf8');
const json = (goreli) => JSON.parse(oku(goreli));

// ---------------------------------------------------------------- veri

/** YeniOzellikler.ts'i TS derleyicisiyle CommonJS'e cevirip calistirir (regex YOK). */
function yeniOzellikleriOku() {
    const ts = require('typescript');
    const kaynak = oku('src/core/constants/YeniOzellikler.ts');
    const { outputText } = ts.transpileModule(kaynak, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    });
    const modul = { exports: {} };
    vm.runInNewContext(outputText, { module: modul, exports: modul.exports, require: () => ({}) });
    const liste = modul.exports.YENI_OZELLIKLER;
    if (!Array.isArray(liste) || !liste.length) throw new Error('YENI_OZELLIKLER okunamadi');
    return liste;
}

function eklentiBayragi(app, ad) {
    const p = (app.expo.plugins || []).find((x) => Array.isArray(x) && x[0] === ad);
    return !!(p && p[1] && p[1].etkin);
}

function veriTopla() {
    const pkg = json('package.json');
    const app = json('app.json');
    const eas = json('eas.json');
    let manifest = { gruplar: {}, magaza: {} };
    if (fs.existsSync(MANIFEST)) manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    const ascAppId = (((eas.submit || {}).production || {}).ios || {}).ascAppId || (((eas.submit || {}).testflight || {}).ios || {}).ascAppId;
    const paket = app.expo.android.package;
    return {
        surum: pkg.version,
        bagimlilik: (ad) => String((pkg.dependencies || {})[ad] || (pkg.devDependencies || {})[ad] || '').replace(/^[\^~]/, ''),
        paket,
        playUrl: `https://play.google.com/store/apps/details?id=${paket}`,
        appStoreUrl: `https://apps.apple.com/tr/app/id${ascAppId}`,
        iosWidget: eklentiBayragi(app, './plugins/withNamazWidget'),
        appleWatch: eklentiBayragi(app, './plugins/withNamazSaat'),
        ozellikler: yeniOzellikleriOku(),
        manifest,
    };
}

// ---------------------------------------------------------------- uretim

const URETILDI = '<!-- Bu sayfa scripts/belgeleri-guncelle.js ile üretilir; elle düzenlemeyin (kaynak: scripts/belge-gorsel-gruplari.js + manifest.json). -->';

function rozetler(v) {
    const kod = (s) => encodeURIComponent(s).replace(/-/g, '--');
    // Wear OS / TV yalniz Play'de URETIM kanalindaysa (manifest, play-magaza.js gorseller) rozete girer.
    const pm = (v.manifest.magaza || {}).googlePlay || {};
    const platformlar = ['Android', 'iOS']
        .concat(pm.wear === 'uretim' ? ['Wear OS'] : [])
        .concat(pm.tv === 'uretim' ? ['Android TV'] : [])
        .concat(v.appleWatch ? ['watchOS'] : []);
    return [
        `![Sürüm](https://img.shields.io/badge/${kod('sürüm')}-${kod(v.surum)}-2e7d32.svg)`,
        '![Lisans](https://img.shields.io/badge/license-GPLv3-blue.svg)',
        `![Platform](https://img.shields.io/badge/platform-${kod(platformlar.join(' | '))}-lightgrey.svg)`,
        '![Çevrimdışı](https://img.shields.io/badge/mode-Offline%20First-green.svg)',
    ].join(' ');
}

function magazaSurumleri(v) {
    const m = v.manifest.magaza || {};
    const parca = [];
    if (m.googlePlay && m.googlePlay.uretim) parca.push(`Google Play: **${m.googlePlay.uretim}**`);
    if (m.appStore && m.appStore.surum) parca.push(`App Store: **${m.appStore.surum}**`);
    return parca;
}

function magaza(v) {
    const surumler = magazaSurumleri(v);
    return [
        '<p>',
        `  <a href="${v.playUrl}"><img alt="Google Play'den edinin" height="60" src="https://play.google.com/intl/en_us/badges/static/images/badges/tr_badge_web_generic.png"></a>`,
        `  <a href="${v.appStoreUrl}"><img alt="App Store'dan indirin" height="40" src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/tr-tr"></a>`,
        '</p>',
        '',
        `Kaynak koddaki sürüm: **${v.surum}**` + (surumler.length ? ` · Mağazada: ${surumler.join(' · ')}` : ''),
    ].join('\n');
}

const KELIMELER = {
    kildim: 'kıldım', onayi: 'onayı', gorunum: 'görünüm', seridi: 'şeridi', muhafiz: 'muhafız', adim: 'adım',
    butce: 'bütçe', karti: 'kartı', siniri: 'sınırı', ayarlari: 'ayarları', yatis: 'yatış', kible: 'kıble',
    teheccud: 'teheccüd', uygulamalari: 'uygulamaları', nasil: 'nasıl', seferilik: 'seferîlik', secimi: 'seçimi',
    onizleme: 'önizleme', akis: 'akış', bugun: 'bugün', istatistik: 'istatistik', zinciri: 'zinciri',
    git: 'git', ekrani: 'ekranı', ozel: 'özel', gun: 'gün', guc: 'güç', ayarlar: 'ayarlar', rehberi: 'rehberi',
};

/** "07-muhafiz-zaman-seridi.webp" → "Muhafız zaman şeridi". */
function karAltyazisi(dosya) {
    const kok = dosya.replace(/\.webp$/, '').replace(/^\d+-?/, '');
    if (!kok) return '';
    const s = kok
        .split('-')
        .map((k) => KELIMELER[k] || k)
        .join(' ');
    return s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
}

function grupKareleri(v, grup, kok, { altyazi = false } = {}) {
    const g = (v.manifest.gruplar || {})[grup.id];
    const ogeler = ((g && g.ogeler) || []).filter((o) => fs.existsSync(path.join(GORSEL_KLASORU, grup.klasor, o.dosya)));
    if (!ogeler.length) return null;
    const hucre = (o, i) => {
        // Magaza kareleri ad tasimaz (Play yalniz sira verir): altyazi yok, alt metni genel.
        const yazi = karAltyazisi(o.dosya);
        const alt = yazi || `${grup.baslik} ekran görüntüsü ${i + 1}`;
        const img = `<img src="${kok}/${grup.klasor}/${o.dosya}" width="${grup.gosterim}" alt="${alt}" title="${alt}">`;
        if (!altyazi) return img;
        return `<td align="center">${img}${yazi ? `<br><sub>${yazi}</sub>` : ''}</td>`;
    };
    if (!altyazi) return '<p>\n' + ogeler.map((o, i) => '  ' + hucre(o, i)).join('\n') + '\n</p>';
    const sutun = grup.gosterim >= 300 ? 2 : grup.gosterim >= 200 ? 3 : 4;
    const satirlar = [];
    for (let i = 0; i < ogeler.length; i += sutun) {
        satirlar.push('  <tr>' + ogeler.slice(i, i + sutun).map((o, j) => hucre(o, i + j)).join('') + '</tr>');
    }
    return '<table>\n' + satirlar.join('\n') + '\n</table>';
}

/** Apple Watch / iPhone widget gibi bayrakla kapali bir yuzeyin gruplari README'ye girmez. */
function grupYayinda(v, grup) {
    if (grup.id === 'apple-watch') return v.appleWatch;
    return true;
}

function ekranGoruntuleri(v, kok, { tamGaleriBaglantisi }) {
    const parca = [];
    for (const grup of GRUPLAR.filter((g) => g.bolum === 'magaza')) {
        const kareler = grupKareleri(v, grup, kok);
        if (kareler) parca.push(`**${grup.baslik}**\n\n${kareler}`);
    }
    const ekler = GRUPLAR.filter((g) => g.bolum !== 'magaza' && grupYayinda(v, g));
    for (const grup of ekler) {
        const kareler = grupKareleri(v, grup, kok);
        if (kareler) parca.push(`<details>\n<summary><b>${grup.baslik}</b></summary>\n\n${kareler}\n\n</details>`);
    }
    if (!parca.length) parca.push('_Ekran görüntüleri henüz üretilmedi._');
    parca.push(
        `Kareler mağazadaki listelerle (Google Play, App Store) ve uygulamanın ekran görüntüsü hatlarıyla otomatik eşitlenir. Altyazılı tam galeri: [${tamGaleriBaglantisi}](${tamGaleriBaglantisi}).`
    );
    return parca.join('\n\n');
}

function platformlar(v) {
    const pm = (v.manifest.magaza || {}).googlePlay || {};
    const formDurumu = (d) => (d === 'uretim' ? 'Google Play\'de yayında' : d === 'test' ? 'Google Play kapalı test' : 'Google Play');
    const as = (v.manifest.magaza || {}).appStore;
    const satirlar = [
        '| Cihaz | Durum |',
        '|---|---|',
        `| 📱 Android telefon, tablet ve katlanabilir | [Google Play](${v.playUrl})${pm.uretim ? ` · ${pm.uretim}` : ''} |`,
        `| 🍏 iPhone | [App Store](${v.appStoreUrl})${as && as.surum ? ` · ${as.surum}` : ''} |`,
        `| ⌚ Wear OS saat | ${formDurumu(pm.wear)} (telefon uygulamasıyla birlikte) |`,
        `| 📺 Android TV | ${formDurumu(pm.tv)} |`,
        `| ⌚ Apple Watch | ${v.appleWatch ? 'App Store (iPhone uygulamasıyla birlikte)' : 'Geliştiriliyor — henüz mağazada değil'} |`,
        `| 🔒 iPhone kilit ekranı, widget ve Dinamik Ada | ${v.iosWidget ? 'App Store' : 'Geliştiriliyor — henüz mağazada değil'} |`,
    ];
    return satirlar.join('\n');
}

const PLATFORM_ADI = { android: 'Android', ios: 'iOS' };

function ozellikYayinda(v, o) {
    if (o.yetenek === 'iosWidget') return v.iosWidget;
    if (o.yetenek === 'appleWatch') return v.appleWatch;
    return Array.isArray(o.platformlar) && o.platformlar.length > 0;
}

function yenilikler(v) {
    const liste = v.ozellikler.filter((o) => ozellikYayinda(v, o));
    const satir = (o) =>
        `- **${o.baslik}** — ${String(o.aciklama).replace(/\s+/g, ' ').trim()} <sub>${o.platformlar.map((p) => PLATFORM_ADI[p] || p).join(' · ')} · ${o.surum}</sub>`;
    const ilk = 8;
    const parca = liste.slice(0, ilk).map(satir);
    if (liste.length > ilk) {
        parca.push('', `<details>\n<summary>Diğer ${liste.length - ilk} özellik</summary>\n`, ...liste.slice(ilk).map(satir), '\n</details>');
    }
    parca.push('', '_Bu liste uygulamadaki "Neler Yeni" ekranının kaynağından (`src/core/constants/YeniOzellikler.ts`) üretilir._');
    return parca.join('\n');
}

function teknolojiler(v) {
    const b = v.bagimlilik;
    const expoAna = (b('expo').match(/^\d+/) || [''])[0];
    return [
        `*   **Çekirdek:** React Native ${b('react-native')} + Expo SDK ${expoAna} (bare workflow, New Architecture), TypeScript ${b('typescript')} (strict)`,
        `*   **Durum:** Redux Toolkit ${b('@reduxjs/toolkit')}`,
        '*   **Depolama:** AsyncStorage (yalnız cihazda)',
        `*   **Görünüm:** NativeWind ${b('nativewind')} (TailwindCSS)`,
        `*   **Vakit hesabı:** Adhan.js ${b('adhan')} (Diyanet / Türkiye yöntemi, çevrimdışı)`,
        '*   **Bildirim ve arka plan:** Notifee, Expo Notifications, Expo Task Manager, Expo Calendar',
        '*   **Native:** Kotlin (Android widget, gerçek alarm, Wear OS ve Android TV — Jetpack Compose), Swift (Siri, AlarmKit, WidgetKit, watchOS)',
        `*   **Test:** Jest ${b('jest')} + jest-expo`,
    ].join('\n');
}

function surumSatiri(v) {
    const surumler = magazaSurumleri(v);
    return `Güncel sürüm: **${v.surum}**` + (surumler.length ? ` · Mağazada: ${surumler.join(' · ')}` : '');
}

/** Belge → bolge adi → uretici. Yeni bolge eklemek: burada tanimla + belgeye isaretleri koy. */
function hedefler(v) {
    return [
        {
            dosya: 'README.md',
            bolgeler: {
                rozetler: () => rozetler(v),
                magaza: () => magaza(v),
                'ekran-goruntuleri': () =>
                    ekranGoruntuleri(v, 'docs/ekran-goruntuleri', { tamGaleriBaglantisi: 'docs/ekran-goruntuleri/README.md' }),
                platformlar: () => platformlar(v),
                yenilikler: () => yenilikler(v),
                teknolojiler: () => teknolojiler(v),
            },
        },
        {
            dosya: 'docs/index.md',
            bolgeler: {
                surum: () => surumSatiri(v),
                magaza: () => magaza(v),
                'ekran-goruntuleri': () => {
                    const parca = GRUPLAR.filter((g) => g.bolum === 'magaza')
                        .map((g) => {
                            const k = grupKareleri(v, g, 'ekran-goruntuleri');
                            return k ? `**${g.baslik}**\n\n${k}` : null;
                        })
                        .filter(Boolean);
                    parca.push('[Tüm ekran görüntüleri](ekran-goruntuleri/)');
                    return parca.join('\n\n');
                },
                yenilikler: () => yenilikler(v),
            },
        },
    ];
}

/** docs/ekran-goruntuleri/README.md — tamamen uretilir. */
function galeriSayfasi(v) {
    const parca = [
        '# Namaz Akışı — ekran görüntüleri',
        '',
        URETILDI,
        '',
        surumSatiri(v) + '. Mağaza kareleri Google Play ve App Store\'daki güncel listelerden, diğerleri uygulamanın ekran görüntüsü hatlarından (yalnız ana dala girmiş sürümler) gelir.',
    ];
    const bolumler = [
        ['magaza', 'Mağazalarda'],
        ['uygulama', 'Uygulamanın tüm ekranları'],
        ['cihaz', 'Saat ve TV'],
    ];
    for (const [bolum, baslik] of bolumler) {
        const gruplar = GRUPLAR.filter((g) => g.bolum === bolum && grupYayinda(v, g))
            .map((g) => {
                const k = grupKareleri(v, g, '.', { altyazi: true });
                return k ? `### ${g.baslik}\n\n${k}` : null;
            })
            .filter(Boolean);
        if (gruplar.length) parca.push('', `## ${baslik}`, '', gruplar.join('\n\n'));
    }
    return parca.join('\n') + '\n';
}

// ---------------------------------------------------------------- bolge islemleri

/** Bolgeleri ayristirir; isaret hatalarini (eksik/fazla/ic ice/eslesmeyen) toplar. */
function bolgeleriAyristir(metin) {
    const hatalar = [];
    const bolgeler = [];
    const desen = /<!-- OTOMATIK:(BASLA|BITIR) ([a-z0-9-]+) -->/g;
    let acik = null;
    for (const m of metin.matchAll(desen)) {
        const [, tur, ad] = m;
        if (tur === 'BASLA') {
            if (acik) hatalar.push(`"${acik.ad}" kapanmadan "${ad}" acilmis`);
            else acik = { ad, icBas: m.index + m[0].length };
        } else if (!acik) hatalar.push(`"${ad}" BITIR isareti BASLA'siz`);
        else if (acik.ad !== ad) {
            hatalar.push(`"${acik.ad}" BASLA isareti "${ad}" BITIR ile kapanmis`);
            acik = null;
        } else {
            bolgeler.push({ ad, icBas: acik.icBas, icSon: m.index });
            acik = null;
        }
    }
    if (acik) hatalar.push(`"${acik.ad}" BASLA isareti kapanmamis`);
    const adlar = bolgeler.map((b) => b.ad);
    adlar.forEach((a, i) => adlar.indexOf(a) !== i && hatalar.push(`"${a}" bolgesi birden fazla`));
    return { bolgeler, hatalar };
}

function bolgeleriDoldur(metin, bolgeler, ureticiler) {
    let sonuc = '';
    let imlec = 0;
    for (const b of [...bolgeler].sort((x, y) => x.icBas - y.icBas)) {
        const uret = ureticiler[b.ad];
        if (!uret) continue; // bilinmeyen bolge: dokunma (kontrol ayrica uyarir)
        sonuc += metin.slice(imlec, b.icBas) + '\n' + uret().trim() + '\n';
        imlec = b.icSon;
    }
    return sonuc + metin.slice(imlec);
}

const lfOku = (yol) => fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n');

/** Tum uretimi bellekte yapar: [{dosya, eski, yeni, hatalar}]. Diske yazmaz. */
function hepsiniUret() {
    const v = veriTopla();
    const sonuclar = [];
    for (const h of hedefler(v)) {
        const yol = path.join(KOK, h.dosya);
        // Windows'ta autocrlf ile CRLF gelebilir; uretim LF uzerinden yapilir.
        const eski = lfOku(yol);
        const { bolgeler, hatalar } = bolgeleriAyristir(eski);
        for (const ad of Object.keys(h.bolgeler)) {
            if (!bolgeler.some((b) => b.ad === ad)) hatalar.push(`"${ad}" bolgesi yok (${isaret('BASLA', ad)} … ${isaret('BITIR', ad)})`);
        }
        for (const b of bolgeler) if (!h.bolgeler[b.ad]) hatalar.push(`"${b.ad}" bolgesinin ureticisi yok`);
        const yeni = hatalar.length ? eski : bolgeleriDoldur(eski, bolgeler, h.bolgeler);
        sonuclar.push({ dosya: h.dosya, eski, yeni, hatalar });
    }
    const galeriYolu = path.join(GORSEL_KLASORU, 'README.md');
    sonuclar.push({
        dosya: path.relative(KOK, galeriYolu).split(path.sep).join('/'),
        eski: fs.existsSync(galeriYolu) ? lfOku(galeriYolu) : '',
        yeni: galeriSayfasi(v),
        hatalar: [],
    });
    return sonuclar;
}

function main() {
    const kontrol = process.argv.includes('--kontrol');
    const sonuclar = hepsiniUret();
    let hata = false;
    for (const s of sonuclar) {
        for (const h of s.hatalar) {
            hata = true;
            console.error(`HATA ${s.dosya}: ${h}`);
        }
        if (s.hatalar.length) continue;
        const farkli = s.eski !== s.yeni;
        if (kontrol) {
            if (farkli) console.warn(`UYARI ${s.dosya}: otomatik bolgeler kaynakla ayrismis (otomasyon kapatacak; yerelde: node scripts/belgeleri-guncelle.js)`);
            else console.log(`tamam ${s.dosya}`);
        } else if (farkli) {
            const yol = path.join(KOK, s.dosya);
            fs.mkdirSync(path.dirname(yol), { recursive: true });
            fs.writeFileSync(yol, s.yeni);
            console.log(`guncellendi ${s.dosya}`);
        } else console.log(`degismedi ${s.dosya}`);
    }
    if (hata) process.exit(1);
}

if (require.main === module) {
    try {
        main();
    } catch (e) {
        console.error('HATA', e.stack || e.message);
        process.exit(1);
    }
}

module.exports = { bolgeleriAyristir, bolgeleriDoldur, hepsiniUret, karAltyazisi };
