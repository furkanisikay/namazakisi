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
 *   - Kible dugmesi   "Kıble yönünü bul"            (HomeHeader)
 *   - Seri ekrani     "İstatistik" sekmesi          (IstatistikSayfasi acilista Seri alt sekmesinde)
 *   - Muhafiz satiri  "Namaz muhafızı"              (AyarlarSayfasi)
 *   - Ana anahtar     "Namaz Muhafızı" (Switch)     (MuhafizAyarlariSayfasi)
 *   - Vakit karti     "… vakti hatırlatma ayarları" (PencereKarti)
 *   - Adim satiri     "… adımını düzenleyin"        (PencereKarti)
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
const arg = (ad) => {
    const i = process.argv.indexOf(`--${ad}`);
    return i >= 0 ? process.argv[i + 1] : null;
};
const UDID = arg('udid');
const BUNDLE = arg('bundle');

const agacDizin = path.join(cikis, 'agac');
fs.mkdirSync(agacDizin, { recursive: true });

// DIKKAT: idb'de `--udid` GLOBAL DEGIL, ALT KOMUT duzeyinde bir secenektir.
// Basa konursa `invalid choice: '<UDID>'` ile patlar ve agac BOS gelir.
const idb = (...args) => {
    const tum = UDID ? [...args, '--udid', UDID] : args;
    return execFileSync('idb', tum, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
};
const simctl = (...args) =>
    execFileSync('xcrun', ['simctl', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

let adimNo = 0;

/** Erisilebilirlik agacini bir kez okur (ham JSON -> duz liste). */
function agacOku() {
    let ham = '[]';
    try {
        ham = idb('ui', 'describe-all', '--json');
    } catch (e) {
        return { ogeler: [], hata: String(e.message).split(/\r?\n/)[0] };
    }
    const ogeler = [];
    const ekle = (j) => (Array.isArray(j) ? ogeler.push(...j) : ogeler.push(j));
    try {
        ekle(JSON.parse(ham));
    } catch {
        // idb bazi surumlerde satir satir JSON verir.
        for (const satir of ham.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
            try {
                ekle(JSON.parse(satir));
            } catch {
                /* JSON olmayan satirlari yok say */
            }
        }
    }
    return { ogeler, hata: null };
}

/**
 * Agaci DOLANA KADAR bekler ve artifacta yazar.
 * Ilk `describe-all` cagrisi companion isinirken BOS doner; bunu "ekranda hicbir
 * oge yok" sanmak, bildirim izni uyarisini kapatmayi atlayip sonraki TUM adimlari
 * bloklar (yasandi).
 */
async function agac(ad, { enAz = 2, denemeSayisi = 10 } = {}) {
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
        const turlu = aday.filter((o) => new RegExp(tur, 'i').test(String(o.type || o.role || '')));
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

/**
 * Uygulamayi yeniden baslatir.
 * Acik bir bottom-sheet'i kapatmaya calismaktan daha guvenilir: sheet ekrani
 * kapladigi icin sekme cubugu erisilemez hale geliyor ve "kapat" dugmesinin
 * etiketi ekrana gore degisiyor.
 */
async function yenidenBaslat() {
    if (!BUNDLE) return false;
    try {
        simctl('terminate', UDID || 'booted', BUNDLE);
    } catch {
        /* zaten kapali olabilir */
    }
    await bekle(1500);
    simctl('launch', UDID || 'booted', BUNDLE);
    await bekle(6000);
    return true;
}

/**
 * Sekme etiketi kalibi.
 * iOS sekme dugmesinin erisilebilirlik etiketine ", tab, N of 5" ekler
 * ("Ayarlar, tab, 5 of 5") — tam-dize capasi (`/^Ayarlar$/`) TUTMAZ.
 */
const SEKME = (ad) => new RegExp(`^${ad}(,|$)`, 'i');

/**
 * Zaman seridini ekranin orta bandina getirir (GERI BESLEMELI).
 * Sabit mesafeli kaydirma momentumla her kosuda farkli kayiyor: bir kosuda
 * serit gorunuyor, digerinde ekranin disina tasiyordu ve 02 karesi seridin
 * kendisini gostermiyordu (yasandi, App Store'a o haliyle yuklendi).
 * Surukleme yavas (`--duration`) yapilir ki fırlatma (fling) olmasin.
 */
async function seridiHizala() {
    for (let i = 0; i < 5; i++) {
        const a = await agac(`serit-hizala-${i}`);
        const kok = a.find((o) => String(o.type || '') === 'Application');
        const yuk = kok ? cerceve(kok).h : 956;
        const hedef = yuk * 0.42;
        const o = bul(a, /ilk hatırlatma/i);
        // Gorunmuyorsa icerik asagida: yukari surukle.
        const fark = o ? cerceve(o).y + cerceve(o).h / 2 - hedef : yuk * 0.3;
        if (o && Math.abs(fark) < yuk * 0.06) return true;
        const sinir = (v) => Math.max(yuk * 0.12, Math.min(yuk * 0.88, v));
        const bas = sinir(fark > 0 ? yuk * 0.78 : yuk * 0.3);
        const son = sinir(bas - fark);
        idb('ui', 'swipe', '220', String(Math.round(bas)), '220', String(Math.round(son)), '--duration', '1.2');
        await bekle(1500);
    }
    console.error('  UYARI: zaman seridi orta banda getirilemedi');
    return false;
}

/**
 * Oge ekranin guvenli bandina gelene kadar yavas kaydirir, sonra dokunur.
 * Alt kenardaki oge sekme cubugunun arkasinda kalabildigi icin yalnizca
 * bulunmasi yetmez (Android hattinda da ayni ders).
 */
async function kaydirarakDokun(kalip, aciklama, ad, secenek = {}) {
    for (let i = 0; i < 6; i++) {
        const a = await agac(`${ad}-${i}`);
        const kok = a.find((o) => String(o.type || '') === 'Application');
        const yuk = kok ? cerceve(kok).h : 956;
        const o = bul(a, kalip);
        if (o) {
            const y = cerceve(o).y + cerceve(o).h / 2;
            if (y > yuk * 0.12 && y < yuk * 0.8) return dokun(a, kalip, aciklama, secenek);
        }
        idb('ui', 'swipe', '220', String(Math.round(yuk * 0.72)), '220', String(Math.round(yuk * 0.4)), '--duration', '1.0');
        await bekle(1500);
    }
    console.error(`  BULUNAMADI (kaydirarak): ${aciklama}  (${kalip})`);
    return false;
}

function cek(ad) {
    const hedef = path.join(cikis, `${ad}.png`);
    simctl('io', UDID || 'booted', 'screenshot', hedef);
    console.log(`  KARE: ${ad}.png (${(fs.statSync(hedef).size / 1024).toFixed(0)} KB)`);
}

(async () => {
    await bekle(7000);

    // Acilista UST USTE katman cikabilir: bildirim izni uyarisi ve rozet/duyuru
    // modali. Tek dongude kapatilir — izin uyarisini yalnizca "modal" kalibiyla
    // aramak onu ekranda birakir ve sonraki TUM adimlari bloklar (yasandi).
    // Konum izni dugmeleri de burada: Kible ekrani acilirken sistem konum
    // uyarisi cikariyor ve kapatilmazsa sayfayi bloklar (yasandi).
    const KAPATILACAK =
        /^(İzin Ver|Allow|Allow While Using App|Uygulamayı Kullanırken İzin Ver|Allow Once|Bir Kez İzin Ver|Devam Et|Kapat|Tamam|Anladım|OK)$/i;
    for (let tur = 0; tur < 5; tur++) {
        const katman = await agac(`acilis-${tur}`);
        if (!(await dokun(katman, KAPATILACAK, `acilis katmani ${tur + 1}`, { bekle: 2000 }))) break;
    }

    await agac('ana-ekran');
    cek('01-ana-ekran');
    let a;

    // --- Seri (Istatistik sekmesi acilista Seri alt sekmesinde durur) ---
    a = await agac('seri-oncesi');
    if (await dokun(a, SEKME('İstatistik'), 'istatistik sekmesi', { bekle: 3500 })) {
        // Gok panelindeki yildizlar SIRAYLA animasyonla belirir; erken cekilen kare
        // haritayi yarim gosterir: baslik "25 günlük seri" derken harita 18'den
        // sonrasini bos birakiyordu (yasandi).
        await bekle(6000);
        await agac('seri');
        cek('04-seri');
    }

    // --- Ayarlar -> Muhafiz ---
    a = await agac('ayarlar-oncesi');
    if (await dokun(a, SEKME('Ayarlar'), 'ayarlar sekmesi', { bekle: 2500 })) {
        a = await agac('ayarlar');
        if (await dokun(a, /namaz muhafızı/i, 'muhafiz satiri', { bekle: 3000 })) {
            // Muhafiz DISKTEN acik tohumlanir (simulator-tohumla.js). Anahtara
            // DOKUNMA: `idb ui tap` UISwitch'i toggle etmiyor, ustelik acik
            // gelen anahtara dokunmak onu KAPATIR.
            // Zaman seridi ancak vakit karti acikken gorunur.
            a = await agac('muhafiz-acik');
            // SABAH secilir, Yatsi DEGIL: Yatsi listenin en altinda ve genisleyen
            // icerigi ekranin disinda kaliyor — zaman seridi gorunmuyor, adim
            // satirlari erisilebilirlik agacina hic girmiyor (yasandi).
            if (!(await dokun(a, /sabah vakti hatırlatma/i, 'sabah vakit karti', { bekle: 2500 }))) {
                await dokun(a, /vakti hatırlatma ayarları/i, 'herhangi bir vakit karti', { bekle: 2500 });
            }
            // Kart acildiktan SONRA kaydir: genisleyen icerik (zaman seridi + 4 adim)
            // ekranin alt kenarinda kaliyor. Adim satiri sekme cubugunun ALTINA
            // dustugu icin dokunus bosa gidiyordu ve 03 karesi 02 ile birebir ayni
            // cikiyordu (yasandi). Kaydirma hem kareyi doldurur hem satiri erisilir yapar.
            await seridiHizala();
            await agac('muhafiz-kart-acik');
            cek('02-muhafiz-zaman-seridi');

            // Adim detayi (bottom sheet). "adımını açın veya kapatın" ANAHTARDIR,
            // ona basmak adimi kapatir — bu yuzden kalip "düzenleyin" ile kesinlestirildi.
            a = await agac('adim-oncesi');
            if (await dokun(a, /adımını düzenleyin/i, 'adim satiri', { bekle: 3000 })) {
                // "İkisi de" kanalini sec: sheet sesli anons metni ve "Dinle"
                // dugmesiyle dolar. Yalniz bildirim seciliyken sheet'in alt yarisi
                // BOS kaliyordu ve kare zayif gorunuyordu.
                const sheet = await agac('adim-kanal-oncesi');
                await dokun(sheet, /^İkisi de$/i, 'ikisi de kanali', { bekle: 2500 });
                await agac('adim-detay');
                cek('03-adim-detay');

                // --- Akis onizleme (06): sheet'i kapat, "… akışını önizleyin" ---
                a = await agac('adim-kapat');
                await dokun(a, /^Kapat$/, 'adim detayini kapat', { bekle: 2000 });
                if (await kaydirarakDokun(/sabah akışını önizleyin/i, 'akis onizleme', 'onizle', { bekle: 3000 })) {
                    await agac('akis-onizleme');
                    cek('06-akis-onizleme');
                }
            }
        }
    }

    // --- Kaza (07) + haftalik istatistik (08) ---
    // Acik bir modal sekme cubugunu ortebildigi icin temiz baslangic.
    await yenidenBaslat();
    for (let tur = 0; tur < 3; tur++) {
        const katman = await agac(`kaza-katman-${tur}`);
        if (!(await dokun(katman, KAPATILACAK, `kaza oncesi katman ${tur + 1}`, { bekle: 2000 }))) break;
    }
    a = await agac('kaza-oncesi');
    if (await dokun(a, SEKME('Kaza'), 'kaza sekmesi', { bekle: 3000 })) {
        await agac('kaza');
        cek('07-kaza');
    }
    a = await agac('istatistik-oncesi');
    if (await dokun(a, SEKME('İstatistik'), 'istatistik sekmesi', { bekle: 3000 })) {
        a = await agac('istatistik-sekmeleri');
        // AYLIK, haftalik degil: haftalik gorunum icinde bulunulan haftayi
        // gosterir ve hafta basinda (pazartesi) yalnizca bugun dolu, "%9 basari"
        // gorunuyordu. Etiket ", Aylık": ikonun bos etiketi virgulle ekleniyor.
        if (await dokun(a, /(^|, )Aylık$/, 'aylik sekmesi', { bekle: 4000 })) {
            await agac('aylik');
            cek('08-istatistik');
        }
    }

    // --- Kible EN SONDA ---
    // Kible tam ekran bir yigin sayfasi; oradan geri donmek yerine uygulamayi
    // yeniden baslatmak daha guvenilir. Bu yuzden en sona alindi: bir aksaklik
    // olursa yalnizca bu kare kaybedilir, muhafiz kareleri degil.
    await yenidenBaslat();
    for (let tur = 0; tur < 3; tur++) {
        const katman = await agac(`kible-katman-${tur}`);
        if (!(await dokun(katman, KAPATILACAK, `kible oncesi katman ${tur + 1}`, { bekle: 2000 }))) break;
    }
    a = await agac('kible-oncesi');
    if (await dokun(a, /kıble yönünü bul/i, 'kible dugmesi', { bekle: 3500 })) {
        // Konum izni is akista verilmis olmali; yine de guvenlik agi.
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
