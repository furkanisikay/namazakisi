/**
 * ORTAK HATIRLATMA BILESENLERININ SOZLESMESI (Faz 3).
 *
 * Kullanicinin acik istegi: "tasarlarken kullanilan arayuz bileseni de her yerde
 * ortak olsun ki hepsi icin ayri ayri ekranlar tasarlamayalim surekli."
 *
 * Bugune kadar hatirlatma ayari yalnizca muhafiz ekraninda vardi ve bileseni
 * (`MuhafizAyarlari/VakitKarti` + `SeviyeDetayModal`) dogrudan `MuhafizVakti`ye
 * baglanmisti. `PencereTanimi` bu bagi kesen tek parametre nesnesidir: kart ve
 * modal artik "bir vakit" degil "bir HATIRLATMA PENCERESI" cizer — muhafizin 5
 * vakti, cuma ve ileride seri ayni bilesenden beslenir.
 *
 * RENK NOTU: adim renkleri temada TOKEN OLARAK YOK (temada nazik/uyari/sert/acil
 * olcegi bulunmuyor) ve KASTEN hardcoded'dir; eski ekrandaki degerlerle birebir
 * aynidir. Yalniz DEKORATIF kullanilir (ikon cipi + sol serit); govde metni daima
 * `renkler.metin`/`renkler.metinIkincil` ile cizilir. En yakin token'a zorlamak
 * (AGENTS.md kontrast tuzagi) yanlis olurdu: `durum.uyari` = #FFC107 sari-amber.
 */
import type {
    MuhafizVakti,
    SeviyeAyari,
    SeviyeKademe,
    UyariKanallari,
} from '../../../core/muhafiz/matrisTipleri';
import type { EsikSinirlari } from '../../../core/muhafiz/esikSinirlari';
import type { PencereYonu } from '../../../core/muhafiz/pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from '../../../core/muhafiz/pencereTipleri';
import { modKanallaraCevir, kanalAcikMi } from '../../../core/muhafiz/kanalKumesi';
import { anonsSablonlari } from '../../../core/muhafiz/anonsMetni';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';

/**
 * CUMLE ICINDE gecen kucuk harfli pencere adlari ("… yatsı bugün 6 sa 40 dk").
 *
 * SABIT HARITA — `VAKIT_ADLARI[...].toLowerCase()` YAZMA: 'İkindi'.toLowerCase()
 * JS'te 'i̇kindi' (i + birlesik nokta) uretir. AGENTS.md'deki toUpperCase tuzaginin
 * ikizidir; yalniz `i`/`İ` iceren sozcukleri bozdugu icin testlerden kolayca kacar.
 */
export const VAKIT_ADLARI_KUCUK: Record<MuhafizVakti, string> = {
    imsak: 'sabah',
    ogle: 'öğle',
    ikindi: 'ikindi',
    aksam: 'akşam',
    yatsi: 'yatsı',
};

export interface AdimBilgisi {
    baslik: string;
    ikon: string;
    renk: string;
}

/** Gorunen adlar spec 8 uyarinca: "Seytanla Mucadele" ekranda "Sert uyari"dir. */
export const SEVIYE_BILGILERI: Record<SeviyeKademe, AdimBilgisi> = {
    nazik: { baslik: 'Nazik hatırlatma', ikon: 'bell', renk: '#4CAF50' },
    uyari: { baslik: 'Uyarı', ikon: 'exclamation-triangle', renk: '#FF9800' },
    sert: { baslik: 'Sert uyarı', ikon: 'fire-alt', renk: '#F44336' },
    acil: { baslik: 'Acil', ikon: 'exclamation-circle', renk: '#D32F2F' },
};

/** Muhafizin dort kademesi — `PencereTanimi.adimBilgileri` varsayilani. */
export const MUHAFIZ_ADIM_BILGILERI: AdimBilgisi[] = [
    SEVIYE_BILGILERI.nazik,
    SEVIYE_BILGILERI.uyari,
    SEVIYE_BILGILERI.sert,
    SEVIYE_BILGILERI.acil,
];

export interface KanalCipi {
    id: 'kapali' | 'bildirim' | 'sesli' | 'ikisi';
    etiket: string;
    ikon: string;
    /** Cipe dokunuldugunda hucreye yazilacak KANAL KUMESI. */
    kanallar: UyariKanallari;
}

/**
 * "Nasil uyarsin" cipleri (Faz 2: kanal kumesi).
 *
 * Cipler kumenin bugun kullanilan DORT bilesimini sunar; `titresim` kanali
 * SEMADA ACIK ama ekranda GOSTERILMEZ (Faz 6 / A7 baglayacak) — bu yuzden hicbir
 * cip onu yazmaz ve mevcut secim kontrolu de yalniz bildirim/sesli eksenine bakar.
 */
export const KANAL_CIPLERI: KanalCipi[] = [
    // etiket "Kapalı": bu cip bir ses secimi DEGIL, bir kapatma eylemidir
    // (AdimDetayModal 'kapali' icin seviyeyiKapat() cagirir).
    { id: 'kapali', etiket: 'Kapalı', ikon: 'bell-slash', kanallar: modKanallaraCevir('sessiz') },
    { id: 'bildirim', etiket: 'Bildirim', ikon: 'bell', kanallar: modKanallaraCevir('bildirim') },
    { id: 'sesli', etiket: 'Sesli anons', ikon: 'volume-up', kanallar: modKanallaraCevir('sesli') },
    { id: 'ikisi', etiket: 'İkisi de', ikon: 'bullhorn', kanallar: modKanallaraCevir('ikisi') },
];

/** "Akisi onizle" tarama siniri — bir pencerenin en genis halini kapsar (dk). */
export const ONIZLEME_TARAMA_SINIRI_DK = 24 * 60;

// NOT: "bu adim sesli anons/bildirim sesi calar mi?" kurali BURADA DEGIL —
// `motorAdaptoru` icindeki `sesliAnonsGerekliMi`/`bildirimSesiGerekliMi`'dedir.

/** Tekrarli sikliga gecilirken kullanilan varsayilan aralik. */
export const VARSAYILAN_TEKRAR_DK = 5;
export const TEKRAR_MIN_DK = 1;
export const TEKRAR_MAX_DK = 30;

/** Esik stepper adimi (SayisalSecici sinira otomatik kenetler). */
export const ESIK_ADIM_DK = 5;

/**
 * Bir hatirlatma penceresinin ekranda nasil gorunecegi ve nelerin
 * duzenlenebilecegi. Bilesenler yalniz bunu okur; hicbiri "vakit" varsaymaz.
 */
export interface PencereTanimi {
    /** `'vakit:yatsi'` | `'cuma'` — id/log/test ayrimi icin. */
    kaynak: string;
    /** Kart basligi ("Yatsı", "Cuma namazı"). */
    baslik: string;
    /** Cumle icinde gecen kucuk harfli hali ("yatsı", "cuma namazı"). */
    baslikKucuk: string;
    ikon: string;
    /**
     * Anons/bildirim metinlerinin cozumunde kullanilan VAKIT KIMLIGI.
     * Cuma icin `'ogle'`dir — cuma ogle namazinin YERINE gecer, ayri bir vakit
     * degildir (AGENTS.md: kimlik her yerde `NamazAdi.Ogle`; "Cuma" salt gorunum).
     */
    vakit: MuhafizVakti;
    yon: PencereYonu;
    /** Yon degistirilebilir mi? (muhafiz: evet, cuma/seri: hayir) */
    yonSecilebilir: boolean;
    /** Kac adim (kademe) var? (muhafiz 4, cuma 1) */
    maksAdim: number;
    /** Pencerenin BUGUNKU uzunlugu (dk) — esik tavani ve giris yonu plani buradan. */
    pencereUzunluguDk?: number;
    adimBilgileri: AdimBilgisi[];
    /** Kanal cipleri gosterilsin mi? (cuma tek kanaldan gonderir) */
    kanalSecimiVar: boolean;
    /** Bildirim sesi satiri gosterilsin mi? (cuma kanalin kendi sesini kullanir) */
    sesSecimiVar: boolean;
    esikAdimDk: number;
    /**
     * Tekrar araligi sinirlari + varsayilani.
     *
     * Muhafiz 1 dk'ya kadar inebilir ("vakit cikiyor" akisi); cuma inemez —
     * camiye yetisme hatirlatmasini dakika dakika tekrarlamak faydasiz gurultudur.
     */
    tekrarMinDk: number;
    tekrarMaxDk: number;
    varsayilanTekrarDk: number;
    /** Verilirse komsu-hesabi yerine BU sinirlar kullanilir (cuma: 15–180). */
    esikSinirlari?: EsikSinirlari;
    /** Esik bolumunun basligi; verilmezse yonden turetilir. */
    esikBasligi?: string;
    /** Esik satirinin aciklamasi; verilmezse yonden turetilir. */
    esikAciklamasi?: string;
    /** SayisalSecici erisim etiketi ("Kaç dk kala artır"); verilmezse yonden. */
    esikErisimAdi?: string;
    /** Esik degerinin birimi ("dk kala"); verilmezse yonden turetilir. */
    esikBirimi?: string;
}

/** Yon secicideki iki secenek — kullaniciya donuk kibar "siz" dili. */
export const YON_SECENEKLERI: {
    yon: PencereYonu;
    etiket: string;
    aciklama: string;
    ikon: string;
}[] = [
        {
            yon: 'cikisaDogru',
            etiket: 'Vakit çıkarken',
            aciklama: 'Vaktin sonuna yaklaştıkça hatırlatılırsınız.',
            ikon: 'hourglass-end',
        },
        {
            yon: 'girisindenItibaren',
            etiket: 'Vakit girer girmez',
            aciklama: 'Vakit girdiği andan itibaren, çıkana kadar hatırlatılırsınız.',
            ikon: 'hourglass-start',
        },
    ];

/**
 * Giris yonunun kullaniciya gorunen BEDELI (Faz 1 / B3).
 *
 * Giris yonunde on plan sesli anons PLANLAMAZ (cift konusmayi onleyen sira
 * garantisi tersine doner) → sesi arka plan alarmi verir. Sonuc: uygulama
 * acikken banner ile ses bir dakikaya kadar ayrisabilir. Bu sessiz birakilamaz.
 */
export const GIRIS_SESLI_GECIKME_NOTU =
    'Uygulama açıkken sesli anons, ekrandaki uyarıdan bir dakikaya kadar sonra duyulabilir.';

/** Esik bolumu basligi (yon varsayilani). */
export const esikBasligiOlustur = (yon: PencereYonu): string =>
    yon === 'girisindenItibaren' ? 'GİRİŞTEN NE KADAR SONRA' : 'KAÇ DK KALA';

/** Esik satiri aciklamasi (yon varsayilani). */
export const esikAciklamasiOlustur = (yon: PencereYonu): string =>
    yon === 'girisindenItibaren' ? 'Vakit girdikten sonra' : 'Vaktin çıkmasına';

/** SayisalSecici erisim adi (yon varsayilani). */
export const esikErisimAdiOlustur = (yon: PencereYonu): string =>
    yon === 'girisindenItibaren' ? 'Kaç dk sonra' : 'Kaç dk kala';

/** Esik birimi (yon varsayilani). */
export const esikBirimiOlustur = (yon: PencereYonu): string =>
    yon === 'girisindenItibaren' ? 'dk sonra' : 'dk kala';

/** Muhafizin bir vakti icin pencere tanimi. */
export function vakitPencereTanimi(
    vakit: MuhafizVakti,
    yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
    pencereUzunluguDk?: number
): PencereTanimi {
    return {
        kaynak: `vakit:${vakit}`,
        baslik: VAKIT_ADLARI[vakit],
        baslikKucuk: VAKIT_ADLARI_KUCUK[vakit],
        ikon: 'mosque',
        vakit,
        yon,
        yonSecilebilir: true,
        maksAdim: 4,
        pencereUzunluguDk,
        adimBilgileri: MUHAFIZ_ADIM_BILGILERI,
        kanalSecimiVar: true,
        sesSecimiVar: true,
        esikAdimDk: ESIK_ADIM_DK,
        tekrarMinDk: TEKRAR_MIN_DK,
        tekrarMaxDk: TEKRAR_MAX_DK,
        varsayilanTekrarDk: VARSAYILAN_TEKRAR_DK,
    };
}

/**
 * Cuma namazi hatirlatmasi icin pencere tanimi.
 *
 * TEK ADIM + yon secilemez: cuma "vakit cikiyor" degil "camiye yetis"
 * hatirlatmasidir, olcu daima ogle vaktinin girisine kalan suredir. Kanal ve
 * ses de secilemez (mevcut `vakit_bildirim` kanali kullanilir, yeni kanal
 * ACILMAZ) → kart bugunkunden daha karmasik gorunmez, yalnizca "tekrar" kazanir.
 */
export function cumaPencereTanimi(secenekler: {
    esikSinirlari: EsikSinirlari;
    esikAdimDk: number;
    tekrarMinDk: number;
    tekrarMaxDk: number;
    varsayilanTekrarDk: number;
}): PencereTanimi {
    return {
        kaynak: 'cuma',
        baslik: 'Cuma namazı',
        baslikKucuk: 'cuma namazı',
        ikon: 'mosque',
        // Kimlik ogle namazidir; "Cuma" yalnizca gorunen addir.
        vakit: 'ogle',
        yon: 'cikisaDogru',
        yonSecilebilir: false,
        maksAdim: 1,
        adimBilgileri: [{ baslik: 'Hatırlatma', ikon: 'mosque', renk: SEVIYE_BILGILERI.nazik.renk }],
        kanalSecimiVar: false,
        sesSecimiVar: false,
        esikAdimDk: secenekler.esikAdimDk,
        tekrarMinDk: secenekler.tekrarMinDk,
        tekrarMaxDk: secenekler.tekrarMaxDk,
        varsayilanTekrarDk: secenekler.varsayilanTekrarDk,
        esikSinirlari: secenekler.esikSinirlari,
        esikBasligi: 'NE KADAR ÖNCE',
        esikAciklamasi: 'Öğle vaktine',
        esikErisimAdi: 'Ne kadar önce',
        esikBirimi: 'dk kala',
    };
}

/**
 * Yon degisiminden sonra CEVRILEMEYEN bir anons metni kaldi mi?
 *
 * `matrisIslemleri.yonDegisimindeMetniCevir` yalniz havuzdaki bir sablonla
 * BIREBIR eslesen metinleri cevirir; kullanicinin elle yazdigi metne dokunmaz
 * (dokunsaydi emegi kaybolurdu). Bedeli, o metnin yeni yonde ters okunabilmesidir
 * ("son 42 dakika" derken vakit yeni girmistir) → ekran ipucu gostermek zorunda.
 *
 * `{yön}` yer tutuculu metinler iki yonde de dogru okunur → ipucu YANMAZ.
 */
export function cevrilemeyenAnonsVarMi(seviyeler: SeviyeAyari[], yon: PencereYonu): boolean {
    const havuz = anonsSablonlari(yon);
    return seviyeler.some((s) => {
        if (!kanalAcikMi(s.kanallar, 'sesli')) return false;
        const metin = s.anonsMetni ?? '';
        if (metin.length === 0) return false;
        if (metin.includes('{yön}')) return false;
        return !havuz.includes(metin);
    });
}
