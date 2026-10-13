#!/usr/bin/env node
/**
 * OZELLIK TURU (iOS): yeni ekranlarin kareleri — magaza turundan AYRI.
 *
 * Kullanim:
 *   node scripts/simulator-ozellik-cek.js <cikis-klasoru> --udid <UDID> --bundle <bundleId> [--tema acik|koyu]
 *
 * Her bolum uygulamayi TEMIZ ACILISTAN baslatir ve kendi tohumunu yazar
 * (`ozellik-tohum-verisi.js` varyantlari): bir bolum yarida kalsa da sonrakiler
 * cekilir, acik kalan bir sheet sekme cubugunu ortmez.
 *
 * Android'e ozgu ekranlar (Now Bar, Camideyim, Otomasyon, Kildim uygulamalari,
 * bileklik karti) iOS'ta YOK — burada aranmaz.
 *
 * Eksik kare hata DEGILDIR (bir bolumun dusmesi digerlerini durdurmasin); cikis
 * kodu yalniz HIC kare yoksa 1 olur. Eksikleri `ozellik-kare-ozeti.js` listeler
 * (beklenen liste bu dosyadaki `cek('…')` cagrilarindan cikarilir — kare adini
 * degisken/sablonla YAZMA, ozet onu goremez).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { idbOlustur } = require('./simulator-idb');

const cikis = process.argv[2];
const arg = (ad) => {
    const i = process.argv.indexOf(`--${ad}`);
    return i >= 0 ? process.argv[i + 1] : null;
};
const UDID = arg('udid');
const BUNDLE = arg('bundle');
const TEMA = arg('tema') || 'acik';
if (!cikis || !BUNDLE) {
    console.error('Kullanim: simulator-ozellik-cek.js <cikis> --udid <UDID> --bundle <bundleId> [--tema acik|koyu]');
    process.exit(1);
}
fs.mkdirSync(cikis, { recursive: true });

const s = idbOlustur({ cikis, udid: UDID, bundle: BUNDLE });
const { agac, dokun, getir, kaydirarakDokun, asagiKaydir, bul, bekle, cek } = s;


const KAPATILACAK =
    /^(İzin Ver|Allow|Allow While Using App|Uygulamayı Kullanırken İzin Ver|Allow Once|Bir Kez İzin Ver|Devam Et|Kapat|Tamam|Anladım|OK)$/i;
const SEKME = (ad) => new RegExp(`^${ad}(,|$)`, 'i');

/** Uygulamayi kapat → tohumu yaz → ac → acilis katmanlarini kapat. */
async function temizAcilis(varyant) {
    try {
        s.simctl('terminate', UDID || 'booted', BUNDLE);
    } catch {
        /* zaten kapali olabilir */
    }
    await bekle(1500);
    const kap = s.simctl('get_app_container', UDID || 'booted', BUNDLE, 'data').trim();
    execFileSync(
        'node',
        [path.join(__dirname, 'simulator-tohumla.js'), kap, BUNDLE, '--varyant', varyant, '--tema', TEMA],
        { stdio: 'inherit' }
    );
    s.simctl('launch', UDID || 'booted', BUNDLE);
    await bekle(8000);
    for (let tur = 0; tur < 4; tur++) {
        const katman = await agac(`${varyant}-katman-${tur}`);
        if (!(await dokun(katman, KAPATILACAK, `acilis katmani ${tur + 1}`, { bekle: 2000 }))) break;
    }
}

async function ayarlaraGit() {
    const a = await agac('ayarlar-sekmesi');
    return dokun(a, SEKME('Ayarlar'), 'ayarlar sekmesi', { bekle: 2500 });
}

/** Bolumu calistirir; hata digerlerini durdurmaz. */
async function bolum(ad, fn) {
    console.log(`\n=== ${ad} ===`);
    try {
        await fn();
    } catch (e) {
        console.error(`UYARI: bolum dustu (${ad}): ${e.message}`);
    }
}

(async () => {
    await bolum('ana ekran', async () => {
        await temizAcilis('ozellik');
        cek('01-ana-ekran');
        // Nafile zincir satirlari (kusluk sabahin, evvabin aksamin ardinda).
        if (await getir(/nafile-satir-(kusluk|evvabin)|, nafile,/, 'nafile-satiri')) cek('02-ana-nafile-zinciri');
    });

    await bolum('sade gorunum', async () => {
        await temizAcilis('sade');
        await agac('sade');
        cek('03-sade-gorunum');
    });

    await bolum('ayarlar', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        cek('04-ayarlar');
        await asagiKaydir();
        await asagiKaydir();
        cek('05-ayarlar-alt');
    });

    await bolum('muhafiz', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Namaz muhafızı\./i, 'muhafiz satiri', 'muhafiz-satiri', { bekle: 3000 }))) return;
        cek('06-muhafiz');
        let a = await agac('muhafiz');
        if (!(await dokun(a, /sabah vakti hatırlatma/i, 'sabah vakit karti', { bekle: 2500 }))) return;
        if (await getir(/ilk hatırlatma/i, 'serit', { ust: 0.3, alt: 0.55 })) cek('07-muhafiz-zaman-seridi');
        if (!(await kaydirarakDokun(/1\. hatırlatma.*düzenleyin/i, 'ilk adim', 'ilk-adim', { bekle: 3000 }))) return;
        cek('08-adim-detay');
        const anahtar = await getir(/adim-alarm-anahtari/, 'alarm-anahtari', { ust: 0.3, alt: 0.75 });
        cek('09-adim-detay-anahtarlar');
        if (!anahtar) return;
        // `idb ui tap` UISwitch'i toggle ETMEZ: once dokun, olmazsa surukle.
        await dokun(anahtar.ogeler, /adim-alarm-anahtari/, 'alarm anahtari', { bekle: 2000 });
        let onay = bul(await agac('alarm-onay-1'), /^Alarmı açın$/);
        if (!onay) {
            const guncel = bul(await agac('alarm-anahtari-tekrar'), /adim-alarm-anahtari/);
            if (guncel) await s.anahtariSurukle(guncel);
            onay = bul(await agac('alarm-onay-2'), /^Alarmı açın$/);
        }
        if (onay) {
            cek('10-alarm-onay');
            await dokun(await agac('alarm-onay-kapat'), /^Vazgeç$/, 'vazgec');
        } else {
            console.error('  alarm onay modali acilamadi (UISwitch idb ile degismedi)');
        }
    });

    await bolum('bildirim siniri', async () => {
        await temizAcilis('butce');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Namaz muhafızı\./i, 'muhafiz satiri', 'butce-muhafiz', { bekle: 3500 }))) return;
        const kart = await getir(/bildirim-butce-karti/, 'butce-karti', { ust: 0.1, alt: 0.6 });
        cek('11-muhafiz-butce-karti');
        if (!kart) return;
        await dokun(kart.ogeler, /bildirim-butce-karti/, 'butce karti', { bekle: 3000 });
        await agac('bildirim-siniri');
        cek('12-bildirim-siniri-rehberi');
    });

    await bolum('bildirim ayarlari', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Bildirimler\./i, 'bildirimler satiri', 'bildirimler', { bekle: 3000 }))) return;
        cek('13-bildirim-ayarlari');
        if (await getir(/^Cuma hatırlatması$/i, 'cuma', { ust: 0.15, alt: 0.4 })) cek('14-cuma');
        if (await getir(/^Yatış hatırlatması$/i, 'yatis', { ust: 0.15, alt: 0.4 })) cek('15-yatis');
        if (await getir(/^Camide kılacağım hatırlatması$/i, 'camiye-git', { ust: 0.15, alt: 0.4 })) cek('16-camiye-git');
    });

    await bolum('nafile', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Nafile namazlar\./i, 'nafile satiri', 'nafile', { bekle: 3000 }))) return;
        cek('17-nafile');
        if (await getir(/nafile-kart-teheccud|^Teheccüd hatırlatması$/i, 'teheccud', { ust: 0.15, alt: 0.45 })) {
            cek('18-nafile-teheccud');
        }
    });

    await bolum('kaza', async () => {
        await temizAcilis('ozellik');
        const a = await agac('kaza-oncesi');
        if (!(await dokun(a, SEKME('Kaza'), 'kaza sekmesi', { bekle: 3000 }))) return;
        cek('19-kaza');
        if (await getir(/^Her farzdan sonra kaza önerin$/i, 'her-farzla', { ust: 0.3, alt: 0.65 })) cek('20-kaza-her-farzla');
    });

    await bolum('neler yeni', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Neler yeni\./i, 'neler yeni satiri', 'neler-yeni', { bekle: 3000 }))) return;
        cek('21-neler-yeni');
    });

    const kareler = fs.readdirSync(cikis).filter((f) => /\.png$/i.test(f)).sort();
    console.log(`\nToplam ${kareler.length} kare (tema: ${TEMA}): ${kareler.join(', ')}`);
    if (!kareler.length) process.exit(1);
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
