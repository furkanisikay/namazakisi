#!/usr/bin/env node
/**
 * iPad geniş ekran kareleri (dikey + yatay): Bugün, Ayarlar ve Kaza ana-ayrıntı,
 * İlerleme, ev ekranı.
 *
 * Kullanım: node scripts/simulator-ipad-genis.js <udid> <bundle> <.app yolu> <çıkış dizini>
 *
 * Ölçülen tuzaklar:
 * - `simctl openurl` özel şemada SpringBoard onayı açar ("'Namaz Akışı' ile Açılsın mı?")
 *   ve onaylanmazsa sonraki TÜM kareler onun altında kalır (v1'de yaşandı). Onay
 *   düğmesi idb ile bulunup basılır ve kaybolduğu doğrulanır.
 * - Simülatörün yönü `simctl` ile değiştirilemez. Önce Simulator.app açılıp Cmd+→
 *   ile döndürülür; o olmazsa Info.plist'te iPad yönleri YALNIZ yatay yapılıp yeniden
 *   kurulur. İkinci yolda iPadOS 26 uygulamayı DİKEY ekranda yatay bir pencereye
 *   sığdırır (üst/alt siyah bant) — kare yine yatay düzeni gösterir ama gerçek
 *   tam ekran değildir; betik bunu logda söyler.
 * - Yatayda idb koordinatlarının hangi çerçevede geldiği belli değil: dokunuş önce
 *   olduğu gibi, olmazsa iki döndürülmüş adayla denenir ve her denemeden sonra
 *   doğrulanır.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [UDID, BUNDLE, APP, CIKIS] = process.argv.slice(2);
if (!UDID || !BUNDLE || !APP || !CIKIS) {
    console.error('Kullanım: node scripts/simulator-ipad-genis.js <udid> <bundle> <.app> <çıkış>');
    process.exit(2);
}
fs.mkdirSync(CIKIS, { recursive: true });

const calistir = (cmd, args, { sessiz = false } = {}) => {
    try {
        return execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    } catch (e) {
        if (!sessiz) console.error(`  UYARI: ${cmd} ${args.slice(0, 3).join(' ')} başarısız: ${String(e.message).split(/\r?\n/)[0]}`);
        return null;
    }
};
const simctl = (...a) => calistir('xcrun', ['simctl', ...a]);
const idb = (...a) => calistir('idb', [...a, '--udid', UDID], { sessiz: true });
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

function agac() {
    const ham = idb('ui', 'describe-all', '--json');
    if (!ham) return [];
    const ogeler = [];
    const ekle = (j) => (Array.isArray(j) ? ogeler.push(...j) : ogeler.push(j));
    try {
        ekle(JSON.parse(ham));
    } catch {
        for (const s of ham.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
            try {
                ekle(JSON.parse(s));
            } catch {
                /* yok say */
            }
        }
    }
    return ogeler;
}
const metin = (o) =>
    [o.AXLabel, o.AXValue, o.AXUniqueId, o.title, o.label].filter((x) => typeof x === 'string' && x).join(' | ');
function cerceve(o) {
    const f = o.frame || o.AXFrame || {};
    return {
        x: f.x ?? (f.origin && f.origin.x) ?? 0,
        y: f.y ?? (f.origin && f.origin.y) ?? 0,
        w: f.width ?? (f.size && f.size.width) ?? 0,
        h: f.height ?? (f.size && f.size.height) ?? 0,
    };
}
function bul(ogeler, kalip) {
    const aday = ogeler.filter((o) => {
        const c = cerceve(o);
        return c.w * c.h > 0 && kalip.test(metin(o));
    });
    aday.sort((a, b) => cerceve(a).w * cerceve(a).h - cerceve(b).w * cerceve(b).h);
    return aday[0] || null;
}
async function agacDolu(enAz = 2) {
    for (let i = 0; i < 10; i++) {
        const o = agac();
        if (o.length >= enAz) return o;
        await bekle(1500);
    }
    return agac();
}

// iPad Pro 13" mantıksal boyutu (nokta). Döndürülmüş aday koordinatları için.
let EKRAN = { w: 1032, h: 1376 };
function ekranBoyutunuOku(ogeler) {
    const kok = ogeler.find((o) => /Application/i.test(String(o.type || o.role || '')));
    if (kok) {
        const c = cerceve(kok);
        if (c.w > 0 && c.h > 0) EKRAN = { w: Math.min(c.w, c.h), h: Math.max(c.w, c.h) };
    }
}

/** Kalıba uyan öğeye basar; `dogrula()` true dönene kadar döndürülmüş adayları dener. */
async function bas(kalip, dogrula, ad) {
    const ogeler = await agacDolu();
    ekranBoyutunuOku(ogeler);
    const o = bul(ogeler, kalip);
    if (!o) {
        console.error(`  UYARI: "${ad}" bulunamadı`);
        return false;
    }
    const c = cerceve(o);
    const x = c.x + c.w / 2;
    const y = c.y + c.h / 2;
    const adaylar = [
        [x, y],
        [y, EKRAN.h - x],
        [EKRAN.w - y, x],
    ];
    for (const [ax, ay] of adaylar) {
        idb('ui', 'tap', String(Math.round(ax)), String(Math.round(ay)));
        await bekle(2500);
        if (await dogrula()) return true;
    }
    console.error(`  UYARI: "${ad}" dokunuşu doğrulanamadı`);
    return false;
}

const ONAY = /^(Aç|Open)$/;
const onayYok = async () => !bul(await agacDolu(1), ONAY);

async function ac(url) {
    simctl('openurl', UDID, url);
    await bekle(3000);
    if (bul(await agacDolu(1), ONAY)) await bas(ONAY, onayYok, 'Aç onayı');
    await bekle(5000);
}

function kare(ad) {
    const yol = path.join(CIKIS, `${ad}.png`);
    if (simctl('io', UDID, 'screenshot', yol) === null) console.error(`  UYARI: ${ad} çekilemedi`);
    return yol;
}
async function yenidenAc(ms = 14000) {
    simctl('terminate', UDID, BUNDLE);
    await bekle(2000);
    simctl('launch', UDID, BUNDLE);
    await bekle(ms);
    // Önceki turdan kalan onay penceresi (SpringBoard) yeni açılışta da durur.
    if (bul(await agacDolu(1), ONAY)) await bas(ONAY, onayYok, 'kalan Aç onayı');
}

function evEkraniniAc(acik) {
    const kap = (simctl('get_app_container', UDID, BUNDLE, 'data') || '').trim();
    const man = (calistir('find', [kap, '-name', 'manifest.json', '-path', '*RCTAsyncLocalStorage*'], { sessiz: true }) || '')
        .split('\n')
        .filter(Boolean)[0];
    if (!man) {
        console.error('  UYARI: manifest.json yok, ev ekranı karesi atlanır');
        return false;
    }
    const m = JSON.parse(fs.readFileSync(man, 'utf8'));
    m['@namaz_akisi/ev_ekrani_ayari'] = JSON.stringify({ acik });
    fs.writeFileSync(man, JSON.stringify(m));
    return true;
}

async function turCek(onEk) {
    await yenidenAc();
    kare(`${onEk}-01-bugun`);
    await ac('namazakisi://ayarlar');
    kare(`${onEk}-02-ayarlar`);
    // Ana-ayrıntı: listeden başka bir ayrıntıya geçiş (sağ bölme değişmeli).
    const nafile = /^Nafile namazlar/i;
    if (bul(await agacDolu(), nafile)) {
        await bas(nafile, async () => !!bul(await agacDolu(), /^Nafile Namazlar$/), 'Nafile satırı');
        await bekle(3000);
        kare(`${onEk}-03-ayarlar-nafile`);
    } else {
        console.error('  UYARI: Nafile satırı bulunamadı');
    }
    await ac('namazakisi://kaza');
    kare(`${onEk}-04-kaza`);
    await ac('namazakisi://ilerleme');
    kare(`${onEk}-05-ilerleme`);
}

function yataySimulatorleDondur() {
    // GUI oturumu varsa Simulator.app cihazı gerçekten döndürür (Cmd+→ = sağa döndür).
    if (calistir('open', ['-a', 'Simulator', '--args', '-CurrentDeviceUDID', UDID]) === null) return false;
    execFileSync('sleep', ['10']);
    const sonuc = calistir('osascript', [
        '-e', 'tell application "Simulator" to activate',
        '-e', 'delay 2',
        '-e', 'tell application "System Events" to key code 124 using command down',
    ]);
    return sonuc !== null;
}

function plistIleYatay() {
    const pl = path.join(APP, 'Info.plist');
    calistir('/usr/libexec/PlistBuddy', ['-c', 'Delete :UISupportedInterfaceOrientations~ipad', pl], { sessiz: true });
    calistir('/usr/libexec/PlistBuddy', [
        '-c', 'Add :UISupportedInterfaceOrientations~ipad array',
        '-c', 'Add :UISupportedInterfaceOrientations~ipad:0 string UIInterfaceOrientationLandscapeLeft',
        '-c', 'Add :UISupportedInterfaceOrientations~ipad:1 string UIInterfaceOrientationLandscapeRight',
        pl,
    ]);
    simctl('terminate', UDID, BUNDLE);
    simctl('install', UDID, APP);
}

function boyut(f) {
    const c = calistir('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', f], { sessiz: true }) || '';
    const w = Number((c.match(/pixelWidth: (\d+)/) || [])[1] || 0);
    const h = Number((c.match(/pixelHeight: (\d+)/) || [])[1] || 0);
    return { w, h };
}

(async () => {
    evEkraniniAc(false);
    await turCek('dikey');

    let yol = 'simulator';
    if (!yataySimulatorleDondur()) {
        console.error('  Simulator.app döndürülemedi → Info.plist yolu (pencere sığdırma)');
        yol = 'plist';
        plistIleYatay();
    }
    await bekle(4000);
    await turCek('yatay');
    if (evEkraniniAc(true)) {
        await yenidenAc();
        kare('yatay-06-ev-ekrani');
    }
    console.log(`Yatay yolu: ${yol}`);
    // `simctl io screenshot` cihazın dikey çerçevesinde kaydedebilir: gerçek dönüşte
    // (simulator yolu) kare yataya çevrilir; plist yolunda içerik zaten dik durur.
    for (const f of fs.readdirSync(CIKIS).filter((x) => x.startsWith('yatay-') && x.endsWith('.png'))) {
        const tam = path.join(CIKIS, f);
        const { w, h } = boyut(tam);
        if (yol === 'simulator' && w < h) calistir('sips', ['-r', process.env.IPAD_YATAY_ACI || '270', tam], { sessiz: true });
    }
    for (const f of fs.readdirSync(CIKIS).filter((x) => x.endsWith('.png')).sort()) {
        const { w, h } = boyut(path.join(CIKIS, f));
        console.log(`${f} -> ${w}x${h}`);
    }
})();
