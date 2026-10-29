/**
 * "Ozellik turu" ekran goruntuleri icin tohum verisi.
 *
 * Magaza tohumunun (`magaza-tohum-verisi.js`) USTUNE kurulur ve onu DEGISTIRMEZ:
 * magaza kareleri birebir ayni kalmali. Ozellik turu yeni ekranlarin DOLU
 * gorunmesi icin ek anahtarlar yazar (nafile acik, yatis acik, camiye git acik,
 * cuma acik, kaza onerisi acik...). Now Bar bilincli olarak YAZILMAZ: ekran
 * varsayilan secimi gostersin.
 *
 * Varyantlar (her akis kendi varyantini dosyasinin basindaki `# tohum:` satiriyla
 * secer; hat her akistan ONCE yeniden tohumlar):
 *   - `ozellik`: varsayilan zengin tohum.
 *   - `sade`   : ozellik + sade gorunum ACIK (ana ekran yerine tek ekran).
 *   - `kildim` : ozellik + o anki vakit KILINMAMIS (samimiyet karesi: Kıldım → dua).
 *   - `butce`  : ozellik + YOGUN hatirlatmalar — bildirim siniri kartinin
 *                gorunmesi icin. Android'de kart yalniz 400+ bekleyen bildirimde
 *                cikar (iOS'ta daima). Sayi gunun saatine baglidir: muhafiz
 *                yalniz bugunu kurar ve gecen vakitler sayilmaz. Cuma (4 hafta,
 *                periyodik), nafile (3 gun, Android payi 60) ve camiye gitme
 *                (7 gun) gunun saatinden bagimsiz bir taban saglar; yatsinin son
 *                saati imsaga kadar bekledigi icin muhafiz da hep ~120 ekler.
 *
 * Tema: `acik` | `koyu` — `tema_tercihleri` (TemaContext) ACIKCA yazilir; sistem
 * temasina birakilmaz, yoksa emulator/simulatorun gorunumu kareyi belirler.
 *
 * Anahtar adlari ve sekiller `src/core/constants/UygulamaSabitleri.ts` +
 * ilgili normalize fonksiyonlarina baglidir; nobetci test
 * (`src/core/types/__tests__/ozellikTohumu.test.ts`) her degerin uygulamanin
 * kendi normalizasyonundan DEGISMEDEN gectigini dogrular — betik TS'yi
 * yukleyemedigi icin ayrisma ancak orada yakalanir.
 */
const { tohumVerisi, gun } = require('./magaza-tohum-verisi');

const VARYANTLAR = ['ozellik', 'sade', 'butce', 'ses', 'esitleme', 'kildim', 'dunya', 'jakim', 'baku'];

/** `dunya*` varyantlarinin konumu: Kuala Lumpur, elle secilmis dunya sehri. */
const DUNYA_KONUMU = {
    konumModu: 'manuel',
    seciliSehirId: '',
    seciliIlId: null,
    seciliIlceId: null,
    seciliIlAdi: 'Kuala Lumpur',
    seciliIlceAdi: '',
    gpsAdres: null,
    koordinatlar: { lat: 3.1412, lng: 101.6865 },
    sonGpsGuncellemesi: null,
    akilliTakipAktif: false,
    takipHassasiyeti: 'dengeli',
    ulkeKodu: 'MY',
    dunyaSehri: { ad: 'Kuala Lumpur', ulke: 'MY', bolge: 'Kuala Lumpur', saatDilimi: 'Asia/Kuala_Lumpur' },
};

/** `baku` varyantinin konumu: Baki (Azerbaycan; iki takvim esit secenek, varsayilan yok). */
const BAKU_KONUMU = {
    ...DUNYA_KONUMU,
    seciliIlAdi: 'Bakı',
    koordinatlar: { lat: 40.4093, lng: 49.8671 },
    ulkeKodu: 'AZ',
    dunyaSehri: { ad: 'Bakı', ulke: 'AZ', bolge: 'Bakı', saatDilimi: 'Asia/Baku' },
};

/** `ses` varyantindaki OLU URI: "kendi dosyamiz" olarak kayitli ama MediaStore satiri yok. */
const OLU_SES_URI = 'content://media/external_primary/audio/media/999999';
const TEMALAR = ['acik', 'koyu'];

/** Nafile adimi — `nafileAdimlari.nafileAdimi` ile AYNI sekil (normalize degistirmesin). */
const nafileAdimi = (esikDk, siklik = 'birkez') => ({
    kademe: 'nazik',
    kanallar: { bildirim: true },
    esikDk,
    siklik,
    bildirimSesi: 'varsayilan',
    acilKanal: false,
    anonsMetni: '',
});

function nafileAyarlari(yogun) {
    const tekrar = yogun ? { herDk: 10 } : 'birkez';
    return {
        // Ana ekranda zincir satirlari (kusluk/evvabin/teheccud) gorunsun.
        // Gosterge nafile BASINADIR; `gostergeAktif` "en az biri" turevidir.
        gostergeAktif: true,
        gosterge: { kusluk: true, evvabin: true, teheccud: true },
        hatirlatmalar: {
            kusluk: {
                aktif: true,
                yon: 'girisindenItibaren',
                adimlar: yogun
                    ? [nafileAdimi(5, tekrar), nafileAdimi(60, tekrar), nafileAdimi(120, tekrar)]
                    : [nafileAdimi(5), nafileAdimi(60)],
            },
            evvabin: {
                aktif: true,
                yon: 'girisindenItibaren',
                adimlar: yogun ? [nafileAdimi(15, tekrar), nafileAdimi(30, tekrar)] : [nafileAdimi(15)],
            },
        },
        teheccud: {
            aktif: true,
            yon: 'girisindenItibaren',
            adimlar: yogun ? [nafileAdimi(5, tekrar), nafileAdimi(30, tekrar)] : [nafileAdimi(5), nafileAdimi(30)],
            pencere: 'sonUcteBir',
            uyandirma: false,
        },
    };
}

/** Yogun muhafiz: vakit basina 6 adim, her dakika, bildirim + sesli anons. */
function yogunMuhafizMatrisi() {
    // Segmentler 10'ar dk: seviye basi butce (min(15, 60/6) = 10) hic seyreltmez,
    // yani her adim her dakika konusur (vakit basina ~59 bildirim + ~59 anons).
    // En buyuk esik 60: Istanbul'da en kisa pencere (aksam ~87 dk) icine sigar.
    const esikler = [60, 50, 40, 30, 20, 10];
    const tonlar = ['nazik', 'nazik', 'uyari', 'uyari', 'sert', 'acil'];
    const vakit = () => ({
        yon: 'cikisaDogru',
        seviyeler: esikler.map((esikDk, i) => ({
            kademe: tonlar[i],
            kanallar: { bildirim: true, sesli: true },
            esikDk,
            siklik: { herDk: 1 },
            bildirimSesi: 'varsayilan',
            acilKanal: false,
            anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.',
        })),
    });
    return { imsak: vakit(), ogle: vakit(), ikindi: vakit(), aksam: vakit(), yatsi: vakit() };
}

/**
 * AsyncStorage anahtar -> ham string deger.
 * @param {{ varyant?: string, tema?: string }} [secenek]
 */
/** Istanbul tohumunda su anki farz vaktinin kayit adi ('Sabah'…'Yatsı'); gunes vaktinde null. */
function suankiVakitAdi(simdi = new Date()) {
    const { Coordinates, CalculationMethod, PrayerTimes } = require('adhan');
    const v = new PrayerTimes(new Coordinates(41.0082, 28.9784), simdi, CalculationMethod.Turkey());
    const sira = [
        ['Yatsı', v.isha],
        ['Akşam', v.maghrib],
        ['İkindi', v.asr],
        ['Öğle', v.dhuhr],
        ['Güneş', v.sunrise],
        ['Sabah', v.fajr],
    ];
    const bulunan = sira.find(([, t]) => t.getTime() <= simdi.getTime());
    if (!bulunan) return 'Yatsı'; // gece yarisindan sonra: dunun yatsisi (kayit dune ait)
    return bulunan[0] === 'Güneş' ? null : bulunan[0];
}

function ozellikTohumVerisi({ varyant = 'ozellik', tema = 'acik' } = {}) {
    if (!VARYANTLAR.includes(varyant)) throw new Error(`Bilinmeyen tohum varyanti: ${varyant}`);
    if (!TEMALAR.includes(tema)) throw new Error(`Bilinmeyen tema: ${tema}`);
    const yogun = varyant === 'butce';

    const depo = tohumVerisi();

    depo.tema_tercihleri = JSON.stringify({ mod: tema, paletId: 'zumrut' });
    depo.nafile_ayarlari = JSON.stringify(nafileAyarlari(yogun));
    // Ek hatirlatma yuzeyleri ortak modelde (plan 5.1-5.3): adim dizisi. Sekil uygulamanin
    // normalize ciktisiyla AYNI (nobetci ozellikTohumu.test); cumada TUREV `oncedenDk`/`siklik`.
    const cumaAdimi = (esikDk, siklik) => ({
        kademe: 'nazik',
        kanallar: { bildirim: true },
        esikDk,
        siklik,
        bildirimSesi: 'varsayilan',
        acilKanal: false,
        anonsMetni: '',
    });
    depo.yatis_hatirlatma_ayarlari = JSON.stringify({
        aktif: true,
        saat: 23,
        dakika: 0,
        yatsiHatirlatmasi: true,
        muhasebe: true,
        adimlar: [cumaAdimi(45, { herDk: 15 }), cumaAdimi(10, 'birkez')],
        onceDk: 45,
    });
    depo.camiye_git_ayarlari = JSON.stringify({
        aktif: true,
        vakitler: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
        yurumeDk: 12,
        hazirlikDk: 5,
        yurumeKaynagi: 'elle',
        adimlar: [cumaAdimi(30, { herDk: 10 }), cumaAdimi(17, 'birkez')],
    });
    depo.cuma_hatirlatma_ayarlari = JSON.stringify(
        yogun
            ? { aktif: true, adimlar: [cumaAdimi(180, { herDk: 5 })], oncedenDk: 180, siklik: { herDk: 5 } }
            : { aktif: true, adimlar: [cumaAdimi(90, 'birkez'), cumaAdimi(30, 'birkez')], oncedenDk: 90, siklik: 'birkez' }
    );
    // Kaza defteri "Her farzla bir kaza" anahtari acik gorunsun (borc magaza tohumunda).
    depo.kaza_oneri_ayarlari = JSON.stringify({ farzSonrasiOner: true });

    if (varyant === 'ses') {
        // "Vakit girince" sesi: bes vakit acik, sabaha ozel ses. URI emulatorde HER ZAMAN
        // cozulen sistem alarm sesidir (`RingtoneManager` adini verir) → kanal dogrulamasi
        // gecer ve `vakit_bildirim_<hash8>` kanali kurulur (hat `dumpsys` ile doker).
        depo.vakit_bildirim_ayarlari = JSON.stringify({ imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true });
        depo['@namaz_akisi/vakit_bildirim_sesleri'] = JSON.stringify({
            imsak: { bildirimSesi: 'content://settings/system/alarm_alert', sesAdi: 'Sabah ezanı' },
            // OLU URI (kayitli "kendi dosyamiz" ama MediaStore satiri yok): olu-URI
            // dogrulamasinin kaniti — dokumde bunun `vakit_bildirim_<hash8>` kanali
            // CIKMAMALI (ogle taban kanala duser). Kayit: `sesIceAktarimTercihXml`.
            ogle: { bildirimSesi: OLU_SES_URI, sesAdi: 'Silinmiş kayıt' },
        });
    }

    if (varyant === 'kildim') {
        // Samimiyet karesi: o anki vakit KILINMAMIS olsun ki akis "Kıldım"a basip duayi
        // ("Allah kabul etsin") ve gerekiyorsa gun tamam kartini cekebilsin.
        const anahtar = `namaz_gun_${gun(0)}`;
        const bugun = JSON.parse(depo[anahtar] || '{}');
        const suanki = suankiVakitAdi();
        if (suanki) delete bugun[suanki];
        depo[anahtar] = JSON.stringify(bugun);
        // Kare duayi gostersin: kaza onerisi (1,6 sn sonra acilir) bu tohumda KAPALI —
        // yavas emulator/simulatorde dokunus + kare 1,6 sn'yi asip modal duayi ortuyordu.
        depo.kaza_oneri_ayarlari = JSON.stringify({ farzSonrasiOner: false });
    }

    if (varyant === 'dunya' || varyant === 'jakim') {
        // Turkiye disi elle secilmis sehir (Kuala Lumpur). `dunya`: hesap ayari YOK → ana
        // ekranda "bolgenizin takvimi" karti acilir. `jakim`: JAKIM secilmis, kart
        // sorulmus sayilir. Kaza onerisi kapali: iki modal ust uste binmesin.
        depo['@namaz_akisi/konum_ayarlari'] = JSON.stringify(DUNYA_KONUMU);
        depo.kaza_oneri_ayarlari = JSON.stringify({ farzSonrasiOner: false });
        if (varyant === 'jakim') {
            depo.hesap_ayari = JSON.stringify({ profil: 'jakim', secildi: true, sorulanUlkeler: ['MY'] });
        }
    }

    if (varyant === 'baku') {
        // Azerbaycan: hesap ayari YOK → ana ekranda iki takvimi (MWL, QMİ) esit soran kart.
        depo['@namaz_akisi/konum_ayarlari'] = JSON.stringify(BAKU_KONUMU);
        depo.kaza_oneri_ayarlari = JSON.stringify({ farzSonrasiOner: false });
    }

    if (varyant === 'sade') {
        depo.sade_gorunum_ayarlari = JSON.stringify({ aktif: true });
    }

    if (varyant === 'esitleme') {
        // Eşitleme ACIK (Drive) + güç tasarrufu beklemesi: hat cihazı pil tasarrufuna alır
        // ve şarjdan çıkarır (`# hazirlik: guc-tasarrufu`) → açılıştaki otomatik tur ağa
        // çıkmadan "güç tasarrufu" nedeniyle bekler, sayfa bekleme satırını gösterir.
        // Parola/oturum (güvenli depo) tohumlanmaz: elle tur denenmez.
        const iso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        depo['@namaz_akisi/esitleme_durumu'] = JSON.stringify({
            aktif: true,
            saglayici: 'googleDrive',
            sonEtiket: '1',
            sonOzet: 'tohum',
            sonEsitleme: iso,
            sonHata: null,
            sonDeneme: iso,
            sonBekleme: 'gucTasarrufu',
        });
        depo['@namaz_akisi/esitleme_tercihleri'] = JSON.stringify({
            siklik: 'degisince',
            yalnizWifi: true,
            yalnizSarjda: false,
        });
    }

    if (yogun) {
        // `sesliOnayi` BURADA uydurulmuyor: bu bir ekran goruntusu cihazi, kullanici
        // verisi degil. Olmadan yukleme thunk'i sesli hucreleri acmaz ve kart dolmaz.
        // `alarmOnayi` YAZILMAZ: alarm onay modali karesi o kayda bagli.
        depo.muhafiz_ayarlari = JSON.stringify({
            aktif: true,
            yogunluk: 'ozel',
            gelismisMod: false,
            presetGocuYapildi: true,
            sesliOnayi: true,
            matris: yogunMuhafizMatrisi(),
        });
    }

    return depo;
}

/**
 * Camideyim (yalniz Android) ayarlari AsyncStorage'da DEGIL, native
 * SharedPreferences'tadir (`CamiDepo`: dosya `namazakisi_cami`, anahtar `ayarlar`,
 * JSON dize). Ozellik turu harita ve sinir ayari karelerini alabilsin diye ACIK
 * tohumlanir; sekil `camideyimAyarlariniNormalize`'dan DEGISMEDEN gecmeli
 * (nobetci `ozellikTohumu.test.ts`).
 */
function camideyimNativeAyarlari() {
    return {
        aktif: true,
        beklemeDk: 3,
        vakitKapisi: true,
        namazModu: true,
        sessiz: true,
        kildimSor: true,
        izlemeKapsami: 'yakindakiler',
        acilisBicimi: 'akilli',
        yerler: {},
    };
}

const xmlKacis = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `shared_prefs/namazakisi_cami.xml` icerigi (Android SharedPreferences bicimi). */
function camideyimTercihXml() {
    return [
        "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
        '<map>',
        `    <string name="ayarlar">${xmlKacis(JSON.stringify(camideyimNativeAyarlari()))}</string>`,
        '</map>',
        '',
    ].join('\n');
}

/**
 * `SesIceAktarici` kaydi (native SharedPreferences `namazakisi_ses_ice_aktarim`,
 * StringSet `bizim_uriler`): olu-satir denetimi yalniz bu kumedeki URI'lerde yapilir.
 */
function sesIceAktarimTercihXml() {
    return [
        "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
        '<map>',
        '    <set name="bizim_uriler">',
        `        <string>${OLU_SES_URI}</string>`,
        '    </set>',
        '</map>',
        '',
    ].join('\n');
}

module.exports = {
    ozellikTohumVerisi,
    VARYANTLAR,
    TEMALAR,
    yogunMuhafizMatrisi,
    camideyimNativeAyarlari,
    camideyimTercihXml,
    sesIceAktarimTercihXml,
    OLU_SES_URI,
};

// Hat betigi: `node scripts/ozellik-tohum-verisi.js --ses-xml > /tmp/namazakisi_ses_ice_aktarim.xml`
if (require.main === module && process.argv.includes('--ses-xml')) {
    process.stdout.write(sesIceAktarimTercihXml());
}

// Hat betigi: `node scripts/ozellik-tohum-verisi.js --cami-xml > /tmp/namazakisi_cami.xml`
if (require.main === module && process.argv.includes('--cami-xml')) {
    process.stdout.write(camideyimTercihXml());
}
