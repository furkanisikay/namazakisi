#!/usr/bin/env node
/**
 * Calisan Android emulatorunde uygulamayi dolasip magaza karelerini ceker.
 *
 * Kullanim:
 *   node scripts/android-ekranlari-cek.js <cikis-klasoru> --paket <bundleId>
 *
 * iOS hattinin ikizi; fark yalnizca ARAClarda:
 *   erisilebilirlik agaci  -> `uiautomator dump` (content-desc + bounds)
 *   dokunma                -> `adb shell input tap`
 *   kare                   -> `adb exec-out screencap -p`
 *
 * Dokunma hedefleri KOORDINAT DEGIL erisilebilirlik etiketiyle bulunur:
 * duzen degisince koordinat tabanli betik sessizce yanlis yere basar.
 * React Native'in `accessibilityLabel`'i Android'de `content-desc` olur, yani
 * etiketler iOS ile AYNIdir.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cikis = process.argv[2];
const paketArg = process.argv.indexOf('--paket');
const PAKET = paketArg >= 0 ? process.argv[paketArg + 1] : null;
if (!cikis || !PAKET) {
    console.error('Kullanim: android-ekranlari-cek.js <cikis> --paket <bundleId>');
    process.exit(1);
}
const agacDizin = path.join(cikis, 'agac');
fs.mkdirSync(agacDizin, { recursive: true });

const adb = (...args) => execFileSync('adb', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const adbIkili = (...args) => execFileSync('adb', args, { maxBuffer: 64 * 1024 * 1024 });
const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

let adimNo = 0;

/**
 * uiautomator XML'ini duz ogelere cevirir.
 * `bounds` biciminde gelir: [x1,y1][x2,y2] (PIKSEL, iOS'taki nokta DEGIL).
 */
function agacOku() {
    let xml = '';
    try {
        adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml');
        xml = adb('shell', 'cat', '/sdcard/ui.xml');
    } catch (e) {
        return { ogeler: [], hata: String(e.message).split(/\r?\n/)[0] };
    }
    const ogeler = [];
    const dugum = /<node\b([^>]*)\/?>/g;
    let m;
    while ((m = dugum.exec(xml))) {
        const nitelik = {};
        const n = /([a-zA-Z-]+)="([^"]*)"/g;
        let a;
        while ((a = n.exec(m[1]))) nitelik[a[1]] = a[2];
        const b = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/.exec(nitelik.bounds || '');
        if (!b) continue;
        const x1 = +b[1];
        const y1 = +b[2];
        const x2 = +b[3];
        const y2 = +b[4];
        ogeler.push({
            etiket: [nitelik['content-desc'], nitelik.text].filter(Boolean).join(' | '),
            sinif: nitelik.class || '',
            tiklanabilir: nitelik.clickable === 'true',
            x: x1,
            y: y1,
            w: x2 - x1,
            h: y2 - y1,
        });
    }
    return { ogeler, hata: null };
}

/** Agaci dolana kadar bekler ve artifacta yazar (iOS hattindaki ayni ders). */
async function agac(ad, { enAz = 5, denemeSayisi = 10 } = {}) {
    adimNo += 1;
    let sonuc = { ogeler: [], hata: 'deneme yok' };
    for (let i = 0; i < denemeSayisi; i++) {
        sonuc = agacOku();
        if (sonuc.ogeler.length >= enAz) break;
        await bekle(1500);
    }
    if (sonuc.hata) console.error(`  agac alinamadi (${ad}): ${sonuc.hata}`);
    else if (sonuc.ogeler.length < enAz) console.error(`  agac ZAYIF (${ad}): ${sonuc.ogeler.length} oge`);
    fs.writeFileSync(
        path.join(agacDizin, `${String(adimNo).padStart(2, '0')}-${ad}.json`),
        JSON.stringify(sonuc.ogeler, null, 1),
        'utf8'
    );
    return sonuc.ogeler;
}

const alan = (o) => o.w * o.h;

function bul(ogeler, kalip, { yalnizTiklanabilir = false } = {}) {
    let aday = ogeler.filter((o) => alan(o) > 0 && kalip.test(o.etiket));
    if (yalnizTiklanabilir) {
        const t = aday.filter((o) => o.tiklanabilir);
        if (t.length) aday = t;
    }
    // Kucuk cerceveli oge gercekten tiklanabilir olandir.
    aday.sort((a, b) => alan(a) - alan(b));
    return aday[0] || null;
}

async function dokun(ogeler, kalip, aciklama, secenek = {}) {
    const o = bul(ogeler, kalip, secenek);
    if (!o) {
        console.error(`  BULUNAMADI: ${aciklama}  (${kalip})`);
        return false;
    }
    const x = Math.round(o.x + o.w / 2);
    const y = Math.round(o.y + o.h / 2);
    adb('shell', 'input', 'tap', String(x), String(y));
    console.log(`  dokunuldu: ${aciklama} -> "${o.etiket.slice(0, 70)}" @ ${x},${y}`);
    await bekle(secenek.bekle ?? 1600);
    return true;
}

function cek(ad) {
    const hedef = path.join(cikis, `${ad}.png`);
    fs.writeFileSync(hedef, adbIkili('exec-out', 'screencap', '-p'));
    console.log(`  KARE: ${ad}.png (${(fs.statSync(hedef).size / 1024).toFixed(0)} KB)`);
}

async function yenidenBaslat() {
    try {
        adb('shell', 'am', 'force-stop', PAKET);
    } catch {
        /* zaten kapali olabilir */
    }
    await bekle(1500);
    adb('shell', 'monkey', '-p', PAKET, '-c', 'android.intent.category.LAUNCHER', '1');
    await bekle(7000);
}

/** iOS'taki ayni ders: sekme etiketi ek metin tasiyabilir, tam-dize capasi kirilgan. */
// DIKKAT: sablon dizesinde `\s` yazilirsa `s`ye doner (bilinmeyen kacis); `\\s` sart.
const SEKME = (ad) => new RegExp(`^${ad}(,|$|\\s)`, 'i');

/** Ekran boyutu (piksel). `wm size` "Physical size: 1080x1920" doner. */
const BOYUT = (() => {
    const m = /(\d+)x(\d+)/.exec(adb('shell', 'wm', 'size')) || [null, '1080', '1920'];
    return { gen: +m[1], yuk: +m[2] };
})();

function yukariKaydir(oran = 0.4) {
    const x = String(Math.round(BOYUT.gen / 2));
    const y1 = Math.round(BOYUT.yuk * 0.72);
    const y2 = Math.round(y1 - BOYUT.yuk * oran);
    adb('shell', 'input', 'swipe', x, String(y1), x, String(y2), '450');
}

/**
 * Oge gorunene kadar kaydirir, sonra dokunur.
 * 1080x1920 ekranda (iPhone 6.9"'dan kisa) Ayarlar listesindeki muhafiz satiri
 * ve acilan kartin adimlari alt kenarin altinda kaliyor: agaca girmiyor ya da
 * sekme cubugunun arkasinda duruyor (yasandi: "BULUNAMADI: muhafiz satiri").
 * Oge bulunsa bile merkezi guvenli bandin disindaysa bir kez daha kaydirilir,
 * yoksa dokunus sekme cubuguna gider.
 */
async function kaydirarakDokun(kalip, aciklama, secenek = {}) {
    const ust = BOYUT.yuk * 0.12;
    const alt = BOYUT.yuk * 0.82;
    for (let i = 0; i <= (secenek.enFazlaKaydirma ?? 6); i++) {
        const a = await agac(`${secenek.ad || 'kaydir'}-${i}`);
        const o = bul(a, kalip);
        if (o) {
            const y = o.y + o.h / 2;
            if (y >= ust && y <= alt) return dokun(a, kalip, aciklama, secenek);
        }
        yukariKaydir(0.35);
        await bekle(1300);
    }
    console.error(`  BULUNAMADI (kaydirarak): ${aciklama}  (${kalip})`);
    return false;
}

/**
 * Zaman seridini ekranin orta bandina getirir (GERI BESLEMELI). Sabit mesafeli
 * kaydirma momentumla her kosuda farkli kayiyor (iOS'ta yasandi: serit karenin
 * disinda kaldi). `input swipe` suresi uzun tutulur ki firlatma (fling) olmasin.
 */
async function seridiHizala() {
    const hedef = BOYUT.yuk * 0.42;
    for (let i = 0; i < 5; i++) {
        const a = await agac(`serit-hizala-${i}`);
        const o = bul(a, /ilk hatırlatma/i);
        const fark = o ? o.y + o.h / 2 - hedef : BOYUT.yuk * 0.3;
        if (o && Math.abs(fark) < BOYUT.yuk * 0.06) return true;
        const sinir = (v) => Math.max(BOYUT.yuk * 0.12, Math.min(BOYUT.yuk * 0.88, v));
        const bas = sinir(fark > 0 ? BOYUT.yuk * 0.78 : BOYUT.yuk * 0.3);
        const son = sinir(bas - fark);
        const x = String(Math.round(BOYUT.gen / 2));
        adb('shell', 'input', 'swipe', x, String(Math.round(bas)), x, String(Math.round(son)), '1200');
        await bekle(1500);
    }
    console.error('  UYARI: zaman seridi orta banda getirilemedi');
    return false;
}

(async () => {
    await bekle(8000);

    // Acilistaki katmanlar: bildirim/konum izni ve rozet/duyuru modali. "Neler Yeni"
    // modali birden cok sayfa olabildigi icin tur siniri genis tutuldu.
    const KAPATILACAK = /^(İzin Ver|İZİN VER|Allow|ALLOW|While using the app|Uygulamayı kullanırken|Devam Et|Kapat|Tamam|Anladım|OK)$/i;
    for (let tur = 0; tur < 8; tur++) {
        const katman = await agac(`acilis-${tur}`);
        if (!(await dokun(katman, KAPATILACAK, `acilis katmani ${tur + 1}`, { bekle: 2000 }))) break;
    }

    await agac('ana-ekran');
    cek('01-ana-ekran');

    // --- Seri (Istatistik sekmesi acilista Seri alt sekmesinde durur) ---
    let a = await agac('seri-oncesi');
    if (await dokun(a, SEKME('İstatistik'), 'istatistik sekmesi', { bekle: 4000 })) {
        // Gok panelindeki yildizlar SIRAYLA animasyonla belirir; erken cekilen
        // kare haritayi yarim gosterir (iOS'ta yasandi).
        await bekle(6000);
        await agac('seri');
        cek('04-seri');
    }

    // --- Ayarlar -> Muhafiz ---
    a = await agac('ayarlar-oncesi');
    if (await dokun(a, SEKME('Ayarlar'), 'ayarlar sekmesi', { bekle: 2500 })) {
        if (await kaydirarakDokun(/namaz muhafızı/i, 'muhafiz satiri', { ad: 'ayarlar', bekle: 3000 })) {
            // SABAH secilir: listenin son karti acilinca icerik ekran disinda kalir.
            if (!(await kaydirarakDokun(/sabah vakti hatırlatma/i, 'sabah vakit karti', { ad: 'muhafiz', bekle: 2500 }))) {
                await kaydirarakDokun(/vakti hatırlatma ayarları/i, 'herhangi bir vakit karti', { ad: 'muhafiz2', bekle: 2500 });
            }
            // Kart acildiktan SONRA seridi orta banda getir (geri beslemeli).
            await seridiHizala();
            await agac('muhafiz-kart-acik');
            cek('02-muhafiz-zaman-seridi');

            if (await kaydirarakDokun(/adımını düzenleyin/i, 'adim satiri', { ad: 'adim', bekle: 3000 })) {
                // "İkisi de" kanalini sec: sheet sesli anons metni ve "Dinle"
                // dugmesiyle dolar. Yalniz bildirim seciliyken sheet'in alt yarisi
                // BOS kaliyordu ve kare zayif gorunuyordu.
                const sheet = await agac('adim-kanal-oncesi');
                await dokun(sheet, /^İkisi de$/i, 'ikisi de kanali', { bekle: 2500 });
                await agac('adim-detay');
                cek('03-adim-detay');
            }
        }
    }

    // --- Kible EN SONDA (yeniden baslatarak; acik sheet sekme cubugunu kapatir) ---
    await yenidenBaslat();
    for (let tur = 0; tur < 3; tur++) {
        const katman = await agac(`kible-katman-${tur}`);
        if (!(await dokun(katman, KAPATILACAK, `kible oncesi katman ${tur + 1}`, { bekle: 2000 }))) break;
    }
    a = await agac('kible-oncesi');
    if (await dokun(a, /kıble yönünü bul/i, 'kible dugmesi', { bekle: 4000 })) {
        for (let tur = 0; tur < 2; tur++) {
            const katman = await agac(`kible-izin-${tur}`);
            if (!(await dokun(katman, KAPATILACAK, `kible izin ${tur + 1}`, { bekle: 2500 }))) break;
        }
        await agac('kible');
        cek('05-kible');
    }

    const kareler = fs.readdirSync(cikis).filter((f) => /\.png$/i.test(f)).sort();
    console.log(`\nToplam ${kareler.length} kare: ${kareler.join(', ')}`);
    if (!kareler.length) process.exit(1);
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
