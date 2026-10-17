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
const { tohumVerisi } = require('./magaza-tohum-verisi');

const VARYANTLAR = ['ozellik', 'sade', 'butce'];
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

    if (varyant === 'sade') {
        depo.sade_gorunum_ayarlari = JSON.stringify({ aktif: true });
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

module.exports = { ozellikTohumVerisi, VARYANTLAR, TEMALAR, yogunMuhafizMatrisi };
