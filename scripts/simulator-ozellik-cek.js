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
    /^(İzin Ver|Allow|Allow While Using App|Uygulamayı Kullanırken İzin Ver|Allow Once|Bir Kez İzin Ver|Devam Et|Devam edin|Continue|Kapat|Close|Tamam|Anladım|Got it|OK)$/i;
/**
 * Ana ekran capasi — Maestro akislariyla AYNI: header'daki seri dugmesi ("Seri: N gün";
 * toparlanma modunda "Toparlanma modu: …"). Kible Dalga 4'ten beri sekmedir.
 */
const ANA_EKRAN_CAPASI = /^(Seri|Toparlanma modu): /i;

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
    // Sade gorunumde seri dugmesi (ve sekme cubugu) yoktur → capa beklenmez.
    if (varyant !== 'sade') {
        for (let i = 0; i < 10 && !bul(await agac(`${varyant}-capa-${i}`), ANA_EKRAN_CAPASI); i++) await bekle(1500);
    }
}

async function ayarlaraGit() {
    const a = await agac('ayarlar-sekmesi');
    return dokun(a, SEKME('Ayarlar'), 'ayarlar sekmesi', { bekle: 2500 });
}

/** Ayarlar > Hatirlatmalar (tek hatirlatma sayfasi). */
async function hatirlatmalaraGit(etiket) {
    if (!(await ayarlaraGit())) return false;
    return kaydirarakDokun(/^Hatırlatmalar\./i, 'hatirlatmalar satiri', etiket, { bekle: 3000 });
}

/** Temiz acilis + Hatirlatmalar + bir satirin ayrinti sayfasi (testID). */
async function ayrintiyaGit(testId, etiket) {
    await temizAcilis('ozellik');
    if (!(await hatirlatmalaraGit(`${etiket}-hub`))) return false;
    return kaydirarakDokun(new RegExp(testId), `${etiket} satiri`, etiket, { bekle: 3000 });
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
        if (await getir(/nafile-satir-(kusluk|evvabin)|, nafile,/, 'nafile-satiri', { ust: 0.15, alt: 0.85 })) cek('02-ana-nafile-zinciri');
    });

    // Samimiyet: o anki vakit kilinmamis tohumla "Kıldım" → dugme duaya doner (Android 19-kabul).
    await bolum('kabul', async () => {
        await temizAcilis('kildim');
        cek('19-kabul-once');
        const ogeler = await agac('kabul');
        if (!(await dokun(ogeler, /vakit-karti-kildim|Kılındı olarak işaretle/, 'kildim dugmesi', { bekle: 900 }))) return;
        // Dua gorunur gorunmez kare: kaza onerisi 1,6 sn sonra acilir.
        cek('19-kabul-sonra');
        const sonra = await agac('kabul-sonra');
        if (bul(sonra, /^Yine de işaretleyin$/)) {
            await dokun(sonra, /^Yine de işaretleyin$/, 'kerahat onayi', { bekle: 900 });
            cek('19-kabul-sonra');
        }
        await bekle(1500);
        cek('19-kabul-yerlesti');
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
        // Ayarlar koku artik kisa; "alt" karesi Yardim sayfasidir.
        if (!(await kaydirarakDokun(/^Yardım\./i, 'yardim satiri', 'yardim', { bekle: 3000 }))) return;
        cek('05-ayarlar-alt');
    });

    await bolum('muhafiz', async () => {
        await temizAcilis('ozellik');
        if (!(await hatirlatmalaraGit('muhafiz-hub'))) return;
        if (!(await kaydirarakDokun(/^Vakit çıkmadan\./i, 'vakit cikmadan satiri', 'muhafiz-satiri', { bekle: 3000 }))) return;
        cek('06-muhafiz');
        // Sabah'in "Ozel" parcasi "Kendim ayarlayayim" katini ve Sabah kartini BIRLIKTE acar.
        // (Sayfanin dibindeki "Kendim ayarlayayim" satiri getir bandinin [0.12, 0.8] altinda
        // kaliyordu: sayfa sona dayandigi icin kaydirilamaz → 07/08 cekilmiyordu.) Yedek yol:
        // eski satir + Sabah kartina dokunus.
        if (!(await kaydirarakDokun(/vakit-duzey-imsak-ozel/, 'sabah ozel parcasi', 'sabah-ozel', { bekle: 2500 }))) {
            if (!(await kaydirarakDokun(/kendim-ayarlayayim|^Kendim ayarlayayım/i, 'kendim ayarlayayim', 'kendim', { bekle: 2000 }))) return;
            if (!(await dokun(await agac('muhafiz'), /sabah vakti hatırlatma/i, 'sabah vakit karti', { bekle: 2500 }))) return;
        }
        if (await getir(/ilk hatırlatma/i, 'serit', { ust: 0.3, alt: 0.55 })) cek('07-muhafiz-zaman-seridi');
        if (!(await kaydirarakDokun(/1\. hatırlatma.*düzenleyin/i, 'ilk adim', 'ilk-adim', { bekle: 3000 }))) return;
        cek('08-adim-detay');
        // Gercek alarm "Nasıl" izgarasindaki karodur (Gelişmiş'i acmak gerekmez).
        const anahtar = await getir(/adim-alarm-anahtari/, 'alarm-anahtari', { ust: 0.3, alt: 0.75 });
        cek('09-adim-detay-anahtarlar');
        // "Tekrarla" AÇIK: aralık seçicisi + canlı cümle; sonra şeritte tekrar tikleri.
        const tekrar = await getir(/adim-tekrar-anahtari|^Tekrarla$/, 'tekrar-anahtari', { ust: 0.25, alt: 0.6 });
        if (tekrar) {
            await dokun(tekrar.ogeler, /adim-tekrar-anahtari|^Tekrarla$/, 'tekrar anahtari', { bekle: 1500 });
            if (!bul(await agac('tekrar-acik-1'), /Tekrar aralığı artır/)) {
                const guncel = bul(await agac('tekrar-anahtari-tekrar'), /adim-tekrar-anahtari|^Tekrarla$/);
                if (guncel) await s.anahtariSurukle(guncel);
            }
            await agac('tekrar-acik');
            cek('44-adim-detay-tekrar-acik');
        }
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
        // Detayı kapat: şeritte tekrar tikleri (tekrar yukarıda açıldıysa).
        if (tekrar && (await dokun(await agac('adim-kapat'), /^Kapat$/, 'detay kapat', { bekle: 2000 }))) {
            if (await getir(/ilk hatırlatma/i, 'serit-tekrar', { ust: 0.3, alt: 0.55 })) cek('45-zaman-seridi-tekrar');
        }
    });

    await bolum('bildirim siniri', async () => {
        await temizAcilis('butce');
        if (!(await hatirlatmalaraGit('butce-hub'))) return;
        const kart = await getir(/bildirim-butce-karti/, 'butce-karti', { ust: 0.1, alt: 0.6 });
        cek('11-muhafiz-butce-karti');
        if (!kart) return;
        await dokun(kart.ogeler, /bildirim-butce-karti/, 'butce karti', { bekle: 3000 });
        await agac('bildirim-siniri');
        cek('12-bildirim-siniri-rehberi');
    });

    await bolum('bildirim ayarlari', async () => {
        // Hatirlatmalar sayfasi + ayrinti sayfalari; her ayrinti temiz acilistan
        // (geri gezinmeye guvenmeden).
        await temizAcilis('ozellik');
        if (!(await hatirlatmalaraGit('hatirlatmalar'))) return;
        cek('13-bildirim-ayarlari');
        if (await ayrintiyaGit('satir-cuma', 'cuma')) cek('14-cuma');
        if (await ayrintiyaGit('satir-yatis', 'yatis')) cek('15-yatis');
        if (await ayrintiyaGit('satir-camiye-git', 'camiye-git')) cek('16-camiye-git');
    });

    await bolum('nafile', async () => {
        await temizAcilis('ozellik');
        if (!(await hatirlatmalaraGit('nafile-hub'))) return;
        if (!(await kaydirarakDokun(/^Nafile namazlar\./i, 'nafile satiri', 'nafile', { bekle: 3000 }))) return;
        cek('17-nafile');
        if (await getir(/nafile-kart-teheccud|^Teheccüd hatırlatması(?: \||$)/i, 'teheccud', { ust: 0.15, alt: 0.45 })) {
            cek('18-nafile-teheccud');
        }
    });

    await bolum('kaza', async () => {
        await temizAcilis('ozellik');
        const a = await agac('kaza-oncesi');
        if (!(await dokun(a, SEKME('Kaza'), 'kaza sekmesi', { bekle: 3000 }))) return;
        cek('19-kaza');
        // "Her farzla bir kaza" Dalga 4'ten beri kokte degil: Diger > Kaza ayarlari.
        if (!(await dokun(await agac('kaza-diger'), /^Diğer: hedef/i, 'kaza diger menusu', { bekle: 2000 }))) return;
        if (!(await dokun(await agac('kaza-diger-acik'), /^Kaza ayarları/i, 'kaza ayarlari', { bekle: 3000 }))) return;
        if (await getir(/^Her farzdan sonra kaza önerin(?: \||$)/i, 'her-farzla', { ust: 0.3, alt: 0.65 })) cek('20-kaza-her-farzla');
    });

    await bolum('neler yeni', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Yardım\./i, 'yardim satiri', 'yardim', { bekle: 3000 }))) return;
        if (!(await kaydirarakDokun(/^Neler yeni\./i, 'neler yeni satiri', 'neler-yeni', { bekle: 3000 }))) return;
        cek('21-neler-yeni');
    });

    await bolum('seferilik', async () => {
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Namaz vakitleri\./i, 'namaz vakitleri satiri', 'namaz-vakitleri', { bekle: 3000 }))) return;
        if (!(await kaydirarakDokun(/^Yolculuk bilgisi\./i, 'yolculuk satiri', 'seferilik', { bekle: 3000 }))) return;
        cek('22-seferilik');
    });

    await bolum('namazda sessiz', async () => {
        // iPhone: Odak + Kisayollar kurulum rehberi (Android'deki Camideyim'in karsiligi).
        await temizAcilis('ozellik');
        if (!(await ayarlaraGit())) return;
        if (!(await kaydirarakDokun(/^Namazda sessiz\./i, 'namazda sessiz satiri', 'namazda-sessiz', { bekle: 4000 }))) return;
        cek('23-namazda-sessiz');
        const tamam = await getir(/adim-odak-tamam|Namaz odağını oluşturun: tamamladım/i, 'odak-tamam', { ust: 0.3, alt: 0.8 });
        if (tamam) {
            await dokun(tamam.ogeler, /adim-odak-tamam|Namaz odağını oluşturun: tamamladım/i, 'odak tamamladim', { bekle: 1500 });
        }
        if (await getir(/cami-osm:|Haritalar’da görün/i, 'camiler', { ust: 0.15, alt: 0.6 })) cek('24-namazda-sessiz-camiler');
        if (await getir(/kisayollari-ac|Kısayollar'ı açın/i, 'kisayollar', { ust: 0.4, alt: 0.85 })) cek('25-namazda-sessiz-vakit');
    });

    const kareler = fs.readdirSync(cikis).filter((f) => /\.png$/i.test(f)).sort();
    console.log(`\nToplam ${kareler.length} kare (tema: ${TEMA}): ${kareler.join(', ')}`);
    if (!kareler.length) process.exit(1);
})().catch((e) => {
    console.error('HATA', e.message);
    process.exit(1);
});
