#!/usr/bin/env node
/**
 * Booted iOS Simulator'de uygulamayi dolasip magaza ekran goruntulerini ceker.
 *
 * Kullanim:
 *   node scripts/simulator-ekranlari-cek.js <cikis-klasoru> [--udid <UDID>]
 *
 * Dokunma hedefleri KOORDINAT DEGIL, erisilebilirlik etiketiyle bulunur
 * (`idb ui describe-all`): ekran duzeni degisince koordinat tabanli betik sessizce
 * yanlis yere basar, etiket tabanli betik ise acikca "bulunamadi" der.
 *
 * Her adimda erisilebilirlik agaci `<cikis>/agac/NN-<ad>.json` icine yazilir —
 * bir adim tutmazsa hangi ogelerin ekranda oldugu oradan gorulur.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cikis = process.argv[2];
if (!cikis) {
    console.error('Cikis klasorunu verin.');
    process.exit(1);
}
const udidArg = process.argv.indexOf('--udid');
const UDID = udidArg >= 0 ? process.argv[udidArg + 1] : null;

const agacDizin = path.join(cikis, 'agac');
fs.mkdirSync(agacDizin, { recursive: true });

const idb = (...args) => {
    const tum = UDID ? ['--udid', UDID, ...args] : args;
    return execFileSync('idb', tum, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
};
const simctl = (...args) =>
    execFileSync('xcrun', ['simctl', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

let adimNo = 0;

/** Erisilebilirlik agacini duz bir listeye cevirir. */
function agac(ad) {
    adimNo += 1;
    let ham = '[]';
    try {
        ham = idb('ui', 'describe-all', '--json');
    } catch (e) {
        console.error(`  agac alinamadi (${ad}): ${e.message.split('\n')[0]}`);
    }
    const satirlar = ham
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    const ogeler = [];
    for (const s of satirlar) {
        try {
            const j = JSON.parse(s);
            if (Array.isArray(j)) ogeler.push(...j);
            else ogeler.push(j);
        } catch {
            /* idb bazen tek buyuk dizi, bazen satir satir verir */
        }
    }
    const dosya = path.join(agacDizin, `${String(adimNo).padStart(2, '0')}-${ad}.json`);
    fs.writeFileSync(dosya, JSON.stringify(ogeler, null, 1), 'utf8');
    return ogeler;
}

function metin(o) {
    return [o.AXLabel, o.AXValue, o.AXUniqueId, o.title, o.label]
        .filter((x) => typeof x === 'string' && x)
        .join(' | ');
}

/** Etiketi kalibla eslesen ilk dokunulabilir ogeyi bulur. */
function bul(ogeler, kalip, { tur } = {}) {
    const aday = ogeler.filter((o) => {
        if (!o.frame && !o.AXFrame) return false;
        if (tur && o.type && !new RegExp(tur, 'i').test(o.type)) return false;
        return kalip.test(metin(o));
    });
    // Kucuk cerceveli (gercekten tiklanabilir) ogeyi yeglemek, tum ekrani kaplayan
    // kapsayici bir ogeye basmaktan daha guvenlidir.
    aday.sort((a, b) => alan(a) - alan(b));
    return aday[0] || null;
}

function cerceve(o) {
    const f = o.frame || o.AXFrame || {};
    const x = f.x ?? (f.origin && f.origin.x) ?? 0;
    const y = f.y ?? (f.origin && f.origin.y) ?? 0;
    const w = f.width ?? (f.size && f.size.width) ?? 0;
    const h = f.height ?? (f.size && f.size.height) ?? 0;
    return { x, y, w, h };
}
const alan = (o) => {
    const c = cerceve(o);
    return c.w * c.h;
};

async function dokun(ogeler, kalip, aciklama) {
    const o = bul(ogeler, kalip);
    if (!o) {
        console.error(`  BULUNAMADI: ${aciklama} (${kalip})`);
        return false;
    }
    const c = cerceve(o);
    const x = Math.round(c.x + c.w / 2);
    const y = Math.round(c.y + c.h / 2);
    idb('ui', 'tap', String(x), String(y));
    console.log(`  dokunuldu: ${aciklama} -> "${metin(o).slice(0, 60)}" @ ${x},${y}`);
    await bekle(1400);
    return true;
}

function cek(ad) {
    const hedef = path.join(cikis, `${ad}.png`);
    simctl('io', UDID || 'booted', 'screenshot', hedef);
    const boyut = fs.statSync(hedef).size;
    console.log(`  KARE: ${ad}.png (${(boyut / 1024).toFixed(0)} KB)`);
}

(async () => {
    await bekle(6000);

    // Bildirim izni diyalogu acilis zincirinde cikar; kapatilmazsa tum kareleri kirletir.
    let a = agac('acilis');
    if (!(await dokun(a, /^(İzin Ver|Allow|Tamam|OK)$/i, 'bildirim izni'))) {
        console.log('  (izin diyalogu yok ya da zaten kapali)');
    }
    await bekle(2500);

    a = agac('ana-ekran');
    cek('01-ana-ekran');

    // --- Kible ---
    a = agac('ana-ekran-2');
    if (await dokun(a, /kıble|kible|qibla|pusula/i, 'kible dugmesi')) {
        await bekle(2500);
        agac('kible');
        cek('05-kible');
        a = agac('kible-2');
        if (!(await dokun(a, /geri|back|kapat|close/i, 'kibleden geri'))) {
            // Geri dugmesi bulunamazsa uygulamayi yeniden baslatmak yerine kaydirma jesti dene.
            idb('ui', 'swipe', '10', '500', '400', '500');
            await bekle(1500);
        }
    }

    // --- Seri / Rozetler sekmesi ---
    a = agac('sekme-oncesi');
    if (await dokun(a, /rozet|seri|başarı/i, 'seri sekmesi')) {
        await bekle(2500);
        agac('seri');
        cek('04-seri');
    }

    // --- Ayarlar -> Muhafiz ---
    a = agac('ayarlar-oncesi');
    if (await dokun(a, /^ayarlar$/i, 'ayarlar sekmesi')) {
        await bekle(2000);
        a = agac('ayarlar');
        if (await dokun(a, /muhafız|muhafiz/i, 'muhafiz satiri')) {
            await bekle(2500);
            a = agac('muhafiz');
            // Muhafiz kapaliysa ana anahtari ac (varsayilan: kapali).
            await dokun(a, /namaz muhafızı|muhafızı aç|muhafiz anahtari/i, 'muhafiz ana anahtari');
            await bekle(1500);
            a = agac('muhafiz-acik');
            // Bir vakit kartini ac: zaman seridi ancak kart acikken gorunur.
            await dokun(a, /yatsı/i, 'yatsi vakit karti');
            await bekle(2000);
            agac('muhafiz-kart-acik');
            cek('02-muhafiz-zaman-seridi');

            // Adim detayi (bottom sheet)
            a = agac('adim-oncesi');
            if (await dokun(a, /dk kala|girişten|adım|nazik|uyarı|sert|acil/i, 'adim satiri')) {
                await bekle(2000);
                agac('adim-detay');
                cek('03-adim-detay');
            }
        }
    }

    const kareler = fs.readdirSync(cikis).filter((f) => /\.png$/i.test(f)).sort();
    console.log(`\nToplam ${kareler.length} kare: ${kareler.join(', ')}`);
    if (!kareler.length) process.exit(1);
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
