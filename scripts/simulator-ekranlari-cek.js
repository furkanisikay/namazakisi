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
 * Etiketler kodda dogrulandi:
 *   - Kible dugmesi        "Kıble yönünü bul"        (HomeHeader)
 *   - Seri ekrani          "İstatistik" sekmesi      (IstatistikSayfasi acilista Seri alt sekmesinde)
 *   - Muhafiz satiri       "Namaz muhafızı"          (AyarlarSayfasi)
 *   - Ana anahtar          "Namaz Muhafızı" (Switch) (MuhafizAyarlariSayfasi)
 *   - Vakit karti          "… vakti hatırlatma ayarları" (PencereKarti)
 *   - Adim satiri          "… adımını düzenleyin"    (PencereKarti)
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

/** Erisilebilirlik agacini duz bir listeye cevirir ve artifacta yazar. */
function agac(ad) {
    adimNo += 1;
    let ham = '[]';
    try {
        ham = idb('ui', 'describe-all', '--json');
    } catch (e) {
        console.error(`  agac alinamadi (${ad}): ${String(e.message).split('\n')[0]}`);
    }
    const ogeler = [];
    try {
        const j = JSON.parse(ham);
        if (Array.isArray(j)) ogeler.push(...j);
        else ogeler.push(j);
    } catch {
        // idb bazi surumlerde satir satir JSON verir.
        for (const s of ham.split('\n').map((x) => x.trim()).filter(Boolean)) {
            try {
                const j = JSON.parse(s);
                if (Array.isArray(j)) ogeler.push(...j);
                else ogeler.push(j);
            } catch {
                /* JSON olmayan satirlari yok say */
            }
        }
    }
    fs.writeFileSync(
        path.join(agacDizin, `${String(adimNo).padStart(2, '0')}-${ad}.json`),
        JSON.stringify(ogeler, null, 1),
        'utf8'
    );
    return ogeler;
}

const metin = (o) =>
    [o.AXLabel, o.AXValue, o.AXUniqueId, o.title, o.label]
        .filter((x) => typeof x === 'string' && x)
        .join(' | ');

function cerceve(o) {
    const f = o.frame || o.AXFrame || {};
    return {
        x: f.x ?? (f.origin && f.origin.x) ?? 0,
        y: f.y ?? (f.origin && f.origin.y) ?? 0,
        w: f.width ?? (f.size && f.size.width) ?? 0,
        h: f.height ?? (f.size && f.size.height) ?? 0,
    };
}
const alan = (o) => {
    const c = cerceve(o);
    return c.w * c.h;
};

/**
 * Etiketi kalibla eslesen ogeyi bulur.
 * `tur` verilirse o erisilebilirlik turu YEGLENIR (orn. Switch) — basliktaki ayni
 * metni tasiyan StaticText'e basmayi onler.
 */
function bul(ogeler, kalip, { tur } = {}) {
    let aday = ogeler.filter((o) => (o.frame || o.AXFrame) && alan(o) > 0 && kalip.test(metin(o)));
    if (tur) {
        const turlu = aday.filter((o) => new RegExp(tur, 'i').test(String(o.type || o.AXType || '')));
        if (turlu.length) aday = turlu;
    }
    // Kucuk cerceveli oge gercekten tiklanabilir olandir; tum ekrani kaplayan
    // kapsayiciya basmak sessizce yanlis sonuc verir.
    aday.sort((a, b) => alan(a) - alan(b));
    return aday[0] || null;
}

async function dokun(ogeler, kalip, aciklama, secenek = {}) {
    const o = bul(ogeler, kalip, secenek);
    if (!o) {
        console.error(`  BULUNAMADI: ${aciklama}  (${kalip})`);
        return false;
    }
    const c = cerceve(o);
    const x = Math.round(c.x + c.w / 2);
    const y = Math.round(c.y + c.h / 2);
    idb('ui', 'tap', String(x), String(y));
    console.log(`  dokunuldu: ${aciklama} -> "${metin(o).slice(0, 70)}" @ ${x},${y}`);
    await bekle(secenek.bekle ?? 1600);
    return true;
}

function cek(ad) {
    const hedef = path.join(cikis, `${ad}.png`);
    simctl('io', UDID || 'booted', 'screenshot', hedef);
    console.log(`  KARE: ${ad}.png (${(fs.statSync(hedef).size / 1024).toFixed(0)} KB)`);
}

(async () => {
    await bekle(7000);

    // Bildirim izni diyalogu acilis zincirinde cikar; kapatilmazsa tum kareleri kirletir.
    // "İzin Verme" ile karismamasi icin kalip TAM eslesmedir.
    let a = agac('acilis');
    if (!(await dokun(a, /^(İzin Ver|Allow|Tamam|OK)$/i, 'bildirim izni'))) {
        console.log('  (izin diyalogu yok ya da zaten kapatilmis)');
    }
    await bekle(3000);

    agac('ana-ekran');
    cek('01-ana-ekran');

    // --- Kible ---
    a = agac('kible-oncesi');
    if (await dokun(a, /kıble yönünü bul/i, 'kible dugmesi', { bekle: 3000 })) {
        agac('kible');
        cek('05-kible');
        a = agac('kible-geri');
        if (!(await dokun(a, /^(geri|back|kapat|close|Namaz Akışı)$/i, 'kibleden geri'))) {
            // Geri dugmesi bulunamazsa kenar kaydirma jesti ile don.
            idb('ui', 'swipe', '5', '500', '400', '500');
            await bekle(2000);
        }
    }

    // --- Seri (Istatistik sekmesi acilista Seri alt sekmesinde durur) ---
    a = agac('seri-oncesi');
    if (await dokun(a, /^İstatistik$/i, 'istatistik sekmesi', { bekle: 3500 })) {
        agac('seri');
        cek('04-seri');
    }

    // --- Ayarlar -> Muhafiz ---
    a = agac('ayarlar-oncesi');
    if (await dokun(a, /^Ayarlar$/i, 'ayarlar sekmesi', { bekle: 2500 })) {
        a = agac('ayarlar');
        if (await dokun(a, /namaz muhafızı/i, 'muhafiz satiri', { bekle: 3000 })) {
            // Muhafiz varsayilan olarak KAPALI gelir; ana anahtari ac.
            a = agac('muhafiz');
            await dokun(a, /namaz muhafızı/i, 'muhafiz ana anahtari', { tur: 'switch', bekle: 2500 });

            // Zaman seridi ancak vakit karti acikken gorunur.
            a = agac('muhafiz-acik');
            if (!(await dokun(a, /yatsı vakti hatırlatma/i, 'yatsi vakit karti', { bekle: 2500 }))) {
                await dokun(a, /vakti hatırlatma ayarları/i, 'herhangi bir vakit karti', { bekle: 2500 });
            }
            agac('muhafiz-kart-acik');
            cek('02-muhafiz-zaman-seridi');

            // Adim detayi (bottom sheet). "adımını açın veya kapatın" ANAHTARDIR,
            // ona basmak adimi kapatir — bu yuzden kalip "düzenleyin" ile kesinlestirildi.
            a = agac('adim-oncesi');
            if (await dokun(a, /adımını düzenleyin/i, 'adim satiri', { bekle: 3000 })) {
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
