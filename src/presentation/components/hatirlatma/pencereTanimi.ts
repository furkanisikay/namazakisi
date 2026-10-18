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
 * vakti, nafile ve cuma (`ekHatirlatmaPencereTanimi`) ayni bilesenden beslenir.
 *
 * RENK NOTU: adim renkleri temada TOKEN OLARAK YOK (temada nazik/uyari/sert/acil
 * olcegi bulunmuyor) ve KASTEN hardcoded'dir; eski ekrandaki degerlerle birebir
 * aynidir. Yalniz DEKORATIF kullanilir (ikon cipi + sol serit); govde metni daima
 * `renkler.metin`/`renkler.metinIkincil` ile cizilir. En yakin token'a zorlamak
 * (AGENTS.md kontrast tuzagi) yanlis olurdu: `durum.uyari` = #FFC107 sari-amber.
 */
import type {
    AlarmKapsami,
    MuhafizVakti,
    SeviyeAyari,
    SeviyeKademe,
    UyariKanallari,
    VakitMuhafizAyari,
} from '../../../core/muhafiz/matrisTipleri';
import {
    ACIL_TON_UST_DK,
    etkinKademe,
    vakitUyariPlaniOlustur,
    type UyariPlani,
} from '../../../core/muhafiz/motorAdaptoru';
import { MUHAFIZ_MAKS_ADIM } from '../../../core/muhafiz/matrisTipleri';
import type { EsikSinirlari } from '../../../core/muhafiz/esikSinirlari';
import type { PencereYonu } from '../../../core/muhafiz/pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from '../../../core/muhafiz/pencereTipleri';
import { kanalAcikMi } from '../../../core/muhafiz/kanalKumesi';
import { anonsMetniniCoz, anonsSablonlari } from '../../../core/muhafiz/anonsMetni';
import {
    ANONS_SOZLUKLERI,
    anonsCoz,
    anonsMetniDoluMu,
    type AnonsBaglami,
    type HatirlatmaYuzeyi,
    type YerTutucu,
} from '../../../core/hatirlatma/anonsYerTutucu';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';
import {
    ANDROID_YETENEKLERI,
    type PlatformYetenekleri,
} from '../../../core/muhafiz/ios/platformYetenekleri';
import {
    NAFILE_MAKS_ADIM,
    NAFILE_TEKRAR_MAX_DK,
    NAFILE_TEKRAR_MIN_DK,
    NAFILE_VARSAYILAN_TEKRAR_DK,
} from '../../../core/nafile/nafileTipleri';

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

/**
 * TON secicinin kisa etiketleri (issue #274). Kademe artik bir SIRA degil,
 * hatirlatmanin TONUdur; liste "N. hatirlatma · Ton" der.
 */
export const TON_ETIKETLERI: Record<SeviyeKademe, string> = {
    nazik: 'Nazik',
    uyari: 'Uyarı',
    sert: 'Sert',
    acil: 'Acil',
};

/** Muhafizin dort TONU (renk/ikon) — seviye no 1..4 sirasinda; serit ve onizleme renkleri. */
export const MUHAFIZ_ADIM_BILGILERI: AdimBilgisi[] = [
    SEVIYE_BILGILERI.nazik,
    SEVIYE_BILGILERI.uyari,
    SEVIYE_BILGILERI.sert,
    SEVIYE_BILGILERI.acil,
];

/**
 * "NASIL" bölümünün iki ANA anahtarı (birleşik hatırlatma modülü §3.3).
 *
 * Eskiden dört kartlı tek seçimdi (Kapalı / Bildirim / Sesli anons / İkisi de) — iki
 * bağımsız evet/hayır sorusunun dört bileşimi (NN/g: bağımsız seçenek = anahtar). Veri
 * modeli DEĞİŞMEDİ (`UyariKanallari` zaten küme): anahtarların ürettiği kümeler eski
 * dört kartın ürettikleriyle birebir aynıdır (`{bildirim}`, `{sesli}`, `{bildirim,sesli}`
 * + bağımsız titreşim/alarm). "Kapalı" artık kanal değil, listedeki adım anahtarıdır.
 */
export type AnaKanal = 'bildirim' | 'sesli';

export const BILDIRIM_ETIKETI = 'Bildirim';
export const BILDIRIM_ACIKLAMASI = 'Ekranda bildirim olarak gelir.';
export const SESLI_ETIKETI = 'Sesli okuma';
export const SESLI_ACIKLAMASI = 'Telefonunuz hatırlatmayı sesli okur.';
/** Son açık ana kanalın anahtarı devre dışıyken altında yazılan neden. */
export const SON_KANAL_NOTU = 'Bu hatırlatmayı kapatmak için listedeki anahtarı kullanın.';

/** Bu ana kanal adımın SON açık ana kanalı mı? (kapatılamaz — kapatmanın yeri liste anahtarı) */
export function sonAcikAnaKanalMi(kanallar: UyariKanallari | undefined, kanal: AnaKanal): boolean {
    const diger: AnaKanal = kanal === 'bildirim' ? 'sesli' : 'bildirim';
    return kanalAcikMi(kanallar, kanal) && !kanalAcikMi(kanallar, diger);
}

/**
 * Ana kanal anahtarını uygular (SAF). Kurallar:
 * - SON açık ana kanal kapatılamaz → AYNI referans döner (adımın aç/kapa'sı liste anahtarıdır;
 *   `seviyeyiKapat` + `oncekiKanallar` hafızası orada).
 * - Bildirim kapanınca TİTREŞİM de düşer (titreşim bildirimin alt özelliğidir; ekranda da
 *   yalnız bildirim açıkken görünür). Gerçek ALARM kalır (sesli açık → tekrarlar okunur).
 * - Kapalı kanal ANAHTAR SİLİNEREK yazılır: üretilen küme eski çiplerin kümeleriyle ve
 *   `kanallarNormalize` çıktısıyla birebir aynı kalsın.
 */
export function kanalAnahtariniUygula(
    mevcut: UyariKanallari | undefined,
    kanal: AnaKanal,
    acik: boolean
): UyariKanallari {
    const temel: UyariKanallari = { ...(mevcut ?? {}) };
    if (acik) {
        if (kanalAcikMi(temel, kanal)) return mevcut ?? temel;
        return { ...temel, [kanal]: true };
    }
    if (!kanalAcikMi(temel, kanal) || sonAcikAnaKanalMi(temel, kanal)) return mevcut ?? temel;
    const sonuc: UyariKanallari = {};
    if (kanal !== 'bildirim' && kanalAcikMi(temel, 'bildirim')) sonuc.bildirim = true;
    if (kanal !== 'sesli' && kanalAcikMi(temel, 'sesli')) sonuc.sesli = true;
    if (kanal !== 'bildirim' && kanalAcikMi(temel, 'titresim')) sonuc.titresim = true;
    if (kanalAcikMi(temel, 'alarm')) sonuc.alarm = true;
    return sonuc;
}

/**
 * "Gelişmiş" bölümü açık mı başlar? Adımda bu bölümdeki bir ayar varsayılandan farklıysa
 * (tekrar, nazik olmayan ton, gerçek alarm) — gizli bir seçim kapalı başlığın altında kalmasın.
 */
export function gelismisAcikBaslarMi(
    seviye: SeviyeAyari,
    tanim: Pick<PencereTanimi, 'tonSecilebilir' | 'yon'>
): boolean {
    return (
        seviye.siklik !== 'birkez' ||
        (tanim.tonSecilebilir === true && etkinKademe(seviye, tanim.yon) !== 'nazik') ||
        kanalAcikMi(seviye.kanallar, 'alarm')
    );
}

/** "Gelişmiş" başlığının özeti ("her 5 dk · Uyarı tonu · Gerçek alarm açık"); hepsi varsayılansa ''. */
export function gelismisOzetiOlustur(
    seviye: SeviyeAyari,
    tanim: Pick<PencereTanimi, 'tonSecilebilir' | 'yon'>
): string {
    const parcalar: string[] = [];
    if (seviye.siklik !== 'birkez') parcalar.push(`her ${seviye.siklik.herDk} dk`);
    if (tanim.tonSecilebilir === true) {
        const ton = etkinKademe(seviye, tanim.yon);
        if (ton !== 'nazik') parcalar.push(`${TON_ETIKETLERI[ton]} tonu`);
    }
    if (kanalAcikMi(seviye.kanallar, 'alarm')) parcalar.push('Gerçek alarm açık');
    return parcalar.join(' · ');
}

/** Titresim anahtarinin ekran metinleri (kibar "siz"). */
export const TITRESIM_ETIKETI = 'Titreşim';
export const TITRESIM_ACIKLAMASI = 'Uyarı gelince cihazınız da titrer.';

/** Gercek alarm anahtarinin ekran metinleri (issue #74, kibar "siz"). */
export const ALARM_ETIKETI = 'Gerçek alarm';
export const ALARM_ACIKLAMASI =
    'Bu adımın ilk hatırlatmasında telefonunuzun alarmı çalar; tekrarlar normal bildirimle gelir.';

/** Alarm kapsamı seçimi (issue #74 — "Yalnız ilk uyarıda" / "Her uyarıda"). */
export const ALARM_KAPSAMI_SECENEKLERI: { kapsam: AlarmKapsami; etiket: string; ikon: string }[] = [
    { kapsam: 'ilk', etiket: 'Yalnız ilk uyarıda', ikon: 'dot-circle' },
    { kapsam: 'hepsi', etiket: 'Her uyarıda', ikon: 'redo' },
];

/** Alarm anahtarının açıklaması seçilen kapsamı söyler (sessiz sapma yok). */
export const alarmAciklamasiOlustur = (kapsam: AlarmKapsami | undefined): string =>
    kapsam === 'hepsi'
        ? 'Bu adımın her hatırlatmasında telefonunuzun alarmı çalar.'
        : ALARM_ACIKLAMASI;

/**
 * Önizlemede GERÇEK ALARM çalan tetiğin etiketi ("Alarm çalar · 13:52"). Saat
 * bilinmiyorsa (pencere yok) yalnız "Alarm çalar". Ekran okuyucu da aynısını okur.
 */
export const alarmOnizlemeEtiketi = (saat?: string): string => (saat ? `Alarm çalar · ${saat}` : 'Alarm çalar');

/** "Her uyarıda" seçiliyken bedeli. iPhone satırı yalnız iOS'ta eklenir. */
export const ALARM_KAPSAMI_NOTU = 'Her alarm tam ekran açılır ve bildirim sınırına sayılır.';
export const IOS_ALARM_KAPSAMI_NOTU =
    "iPhone'da aynı anda kurulabilecek alarm sayısı sınırlıdır; sınırı aşan uyarılar bildirim olarak gelir.";

/** "Akisi onizle" tarama siniri — bir pencerenin en genis halini kapsar (dk). */
export const ONIZLEME_TARAMA_SINIRI_DK = 24 * 60;

/**
 * "Akisi onizle" GIRIS yonu tarama baslangici (dk).
 *
 * Motorda tarama, verilen olcuden cikisa dogru AZALIR ama girise dogru ARTAR →
 * giris yonunde buyuk bir sayi vermek dongunun hic calismamasina yol acar
 * (`baslangic > bitis`). Girisin karsiligi pencerenin BASIDIR; alt sinir
 * `olcuDk >= 1` zaten `seviyeTetiklenirMi`de.
 */
export const ONIZLEME_GIRIS_BASLANGIC_DK = 1;

/**
 * Bir pencerenin BUGUNKU tam plani — "Akisi onizle" ve zaman seridinin TEK kaynagi.
 *
 * Iki yuzey ayni diziyi okur; biri ayri bir cagri kursaydi (or. tarama
 * baslangicini yone gore secmeyi unutsaydi) ekrandaki serit ile onizleme
 * AYRISIRDI — onizlemenin giris yonunde bos gelmesi tam olarak boyle bir
 * ayrismaydi.
 */
export function pencerePlaniOlustur(
    ayar: VakitMuhafizAyari,
    tanim: Pick<PencereTanimi, 'yon' | 'pencereUzunluguDk'>
): UyariPlani[] {
    const girisYonu = tanim.yon === 'girisindenItibaren';
    return vakitUyariPlaniOlustur(
        ayar,
        girisYonu ? ONIZLEME_GIRIS_BASLANGIC_DK : ONIZLEME_TARAMA_SINIRI_DK,
        { pencereUzunluguDk: tanim.pencereUzunluguDk }
    );
}

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
    /** Yon degistirilebilir mi? */
    yonSecilebilir: boolean;
    /**
     * Yön SABİTSE (`yonSecilebilir: false`) ekranda yön seçici YERİNE yazılan tek satır
     * gerekçe (ortak hatırlatma yüzeyleri, plan §3.3): istisna sessiz olmaz. Teslimciden
     * geçen her yüzeyde yön sabitken ZORUNLUDUR (nöbetçi `pencereTanimiYetenek.test.ts`).
     */
    yonSabitGerekcesi?: string;
    /**
     * Zaman şeridi cümlesinin gün sözcüğü ("Bugün" yerine "Bu cuma") — pencere bugünün
     * değilse cümle yanlış günü söylemesin.
     */
    seritGunEtiketi?: string;
    /** En fazla kac adim kurulabilir? (muhafiz 6, cuma/nafile 1) */
    maksAdim: number;
    /**
     * Adimlar TON tasir mi? (issue #274 — muhafiz: evet)
     *
     * Evet ise satirin rengi/ikonu adimin TONUNDAN (`SEVIYE_BILGILERI[kademe]`),
     * basligi kronolojik numaradan ("2. hatırlatma") gelir ve detayda ton
     * secici cizilir. Hayir ise (cuma, nafile) `adimBilgileri[indeks]`.
     */
    tonSecilebilir?: boolean;
    /** Pencerenin BUGUNKU uzunlugu (dk) — esik tavani ve giris yonu plani buradan. */
    pencereUzunluguDk?: number;
    adimBilgileri: AdimBilgisi[];
    /** Kanal cipleri (bildirim / sesli anons / ikisi) gosterilsin mi? */
    kanalSecimiVar: boolean;
    /** Bildirim sesi satiri gosterilsin mi? */
    sesSecimiVar: boolean;
    /** Siklik (bir kez / tekrarli) secimi gosterilsin mi? */
    siklikSecimiVar: boolean;
    /**
     * Sesli okuma metni SERBESTÇE yazılabilir mi? HER yüzeyde evet (birleşik hatırlatma
     * modülü — eski "ek yüzeyde/nafilede metin yazılmaz" istisnası KALKTI); değer platform
     * yeteneğinden (`yetenekler.serbestAnonsMetni`) gelir ve iki platformda da `true`dur:
     * iOS'ta metin PLANLAMADA cihazda sentezlenip bildirimin sesi olur (Faz 2). `false` ise
     * editör yerine salt okunur "Telefonunuz şöyle okur" çizilir (geriye uyum).
     */
    anonsMetniDuzenlenebilir: boolean;
    /**
     * BOŞ sesli okuma metninin anlamı (birleşik hatırlatma modülü §3.4):
     * - `true` (ek yüzeyler + nafile): boş = OTOMATİK cümle (yüzeyin bağlamsal cümlesi);
     *   sesli kanal açılırken kutu BOŞ bırakılır.
     * - `false` (muhafız): boş = SESSİZ (teslimci boş metinde TTS planlamaz) → sesli kanal
     *   açılırken kutu yön-uygun şablonla DOLDURULUR (eski davranış birebir).
     */
    bosMetinOtomatik: boolean;
    /**
     * Titresim anahtari gosterilsin mi?
     *
     * iOS'ta HAYIR: bildirim haptigi sistem ayarina baglidir, uygulama adim
     * basina kontrol edemez → hicbir seyi degistirmeyen bir anahtar gostermek
     * kullaniciyi yanlis yonlendirir.
     */
    titresimSecilebilir: boolean;
    /** GERCEK ALARM anahtari gosterilsin mi? (issue #74) */
    alarmSecilebilir: boolean;
    /**
     * Platformun ham yetenekleri.
     *
     * Yukaridaki iki bayrak bunlardan TURETILIR; nesnenin kendisi de tasinir
     * cunku bazi kararlar (ornegin "bu adim sessiz modda duyulur mu") tek bir
     * bayraga indirgenemez ve `AdimNotlari` bunlari okur.
     */
    yetenekler: PlatformYetenekleri;
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
    /** Sesli okuma editöründe çip olarak eklenen yer tutucular (yüzeye özgü, güvenli). */
    anonsYerTutuculari: YerTutucu[];
    /** Editördeki hazır cümleler (yüzeye ve — muhafızda — yöne uygun). */
    anonsSablonlari: string[];
    /**
     * Önizleme çözücüsü: şablonu bu yüzeyin bağlamıyla okunacak cümleye çevirir (adımın
     * eşiği ölçü sayılır). Planlayıcıyla AYNI kural — ekranda duyulan, cihazda okunandır.
     */
    anonsCoz: (sablon: string, seviye: SeviyeAyari) => string;
    /**
     * BOŞ metnin okunacak OTOMATİK cümlesi (yalnız `bosMetinOtomatik` yüzeylerde; yüzeyin
     * plan üreticisinin cümlesiyle aynı kaynak). Muhafızda yoktur (boş = sessiz).
     */
    otomatikAnons?: (seviye: SeviyeAyari) => string;
    /** Editörün altına yazılan yüzeye özgü not (yatış: muhasebe daima otomatik). */
    anonsNotu?: string;
    /**
     * "Akışı önizle"de bir tetiğin GERÇEK metni (ek hatırlatma yüzeyleri, nafile). Verilmezse
     * muhafızın vakit metinleri (`basligiOlustur` / `bildirimGovdesiOlustur` + anons şablonu)
     * kullanılır — nafile/cuma için yanlış olurdu ("Öğle · 25 dk kaldı"). `ilk`: adımın ilk
     * tetiği (nass yalnız ilkinde). `anons` = duyulacak cümle; yoksa `null`.
     */
    onizlemeMetni?: (adim: UyariPlani, ilk: boolean) => { baslik: string; govde: string; anons: string | null };
    /** Önizleme başlığının alt satırı (adet → cümle). Verilmezse vakit dili. */
    onizlemeOzeti?: (adet: number) => string;
    /**
     * Uygulama açıkken ekranda banner çıkıyor mu? (yetenek değil, OLGU:) Nafilenin
     * ön plan banner'ı yoktur → giriş yönündeki "anons bir dakika sonra duyulur"
     * notu yanlış olurdu.
     */
    onPlanBanneriVar: boolean;
    /**
     * Pencerenin BUGUNKU giris ve cikis ANLARI.
     *
     * Zaman seridi saat etiketlerini ve "simdi" imlecini buradan cizer. Yalniz
     * uzunluk (`pencereUzunluguDk`) yetmez: "girisinden 180 dk sonra" ifadesi,
     * kullanici yatsinin 20:30'da girdigini gormeden bir sey anlatmaz.
     * Konum/vakit hesabi yoksa verilmez → serit hic cizilmez (yanlis resim
     * cizmektense cizmemek).
     */
    pencere?: { baslangic: Date; bitis: Date };
}

/**
 * HATIRLATMA YETENEKLERİNİN STANDARDI — hepsi AÇIK.
 *
 * Sahip kararı: hatırlatma yapısı HER YERDE aynıdır — bir yüzeye sesli anons,
 * alarm ya da tekrar eklenip ötekine eklenmemesi kabul edilmez. Her pencere
 * tanımı bu nesneyi YAYAR; bir yeteneği kapatmak, gerekçesi yanında yazan AÇIK
 * bir istisnadır (yorum zorunlu). Platform yeteneği olmayanlar (iOS'ta ses
 * seçici ve titreşim) `yetenekler`den türetilir — o da
 * istisna değil, cihazın gerçeğidir.
 *
 * Nöbetçi: `pencereTanimi.test.ts > YETENEK STANDARDI`.
 */
export const STANDART_YETENEKLER = {
    yonSecilebilir: true,
    kanalSecimiVar: true,
    sesSecimiVar: true,
    siklikSecimiVar: true,
    alarmSecilebilir: true,
    titresimSecilebilir: true,
    anonsMetniDuzenlenebilir: true,
} as const;

/** Platformun izin verdiği kadarıyla standart yetenekler. */
const platformaGoreStandart = (yetenekler: PlatformYetenekleri) => ({
    ...STANDART_YETENEKLER,
    sesSecimiVar: yetenekler.sesSecici,
    titresimSecilebilir: yetenekler.titresimSecimi,
    anonsMetniDuzenlenebilir: yetenekler.serbestAnonsMetni,
});

/** Yon secicideki iki secenek — kullaniciya donuk kibar "siz" dili. */
export const YON_SECENEKLERI: {
    yon: PencereYonu;
    etiket: string;
    /**
     * Cipin ikinci satiri (<= 3 sozcuk). IKI secenekte de gorunur — kullanici
     * secmeden once farki karsilastirabilsin; eskiden aciklama yalniz SECILI
     * secenek icin ciziliyordu ve diger yonu gormek icin gecis yapmak gerekiyordu.
     */
    kisaAciklama: string;
    aciklama: string;
    /** "?" bilgi modalindaki uzun anlatim. */
    uzunAciklama: string;
    ikon: string;
}[] = [
        {
            yon: 'cikisaDogru',
            etiket: 'Vakit çıkarken',
            kisaAciklama: 'Sona doğru sıklaşır',
            aciklama: 'Vaktin sonuna yaklaştıkça hatırlatılırsınız.',
            uzunAciklama:
                'Vakit boyunca sessiz kalır, sona yaklaşınca hatırlatır. Namazı genelde kılan ama bazen sona bırakanlar için.',
            // Kapi metaforu: cikis kapisi. Kum saati ikonu iki yonde de "zaman
            // geciyor" diyordu, yonu anlatmiyordu.
            ikon: 'sign-out-alt',
        },
        {
            yon: 'girisindenItibaren',
            etiket: 'Vakit girer girmez',
            // "cikana kadar hatirlatilirsiniz" DENMEZ: 'hafif' yogunlukta dort adim
            // da tek atistir, yani vaktin sonuna kadar suren bir tekrar YOKTUR.
            // Metin her yogunlukta dogru olmali.
            kisaAciklama: 'Baştan, kılana kadar',
            aciklama: 'Vakit girdikten sonra, kılana kadar aralıklarla hatırlatılırsınız.',
            uzunAciklama:
                'Vakit girince hemen hatırlatır, kılana kadar peşinizi bırakmaz. Namazı ilk fırsatta kılmak isteyenler için.',
            ikon: 'sign-in-alt',
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
    'Uygulama açıkken sesli anons, ekrandaki uyarıdan en fazla bir dakika sonra duyulur.';

/**
 * Bir adimin gorunumu (renk/ikon) — ton secilebilen pencerede adimin ETKIN
 * tonundan (acil kisitina takilan adim sert gorunur, motorla ayni), aksi halde
 * indeksten.
 */
export function adimBilgisiAl(
    tanim: Pick<PencereTanimi, 'tonSecilebilir' | 'adimBilgileri' | 'yon'>,
    seviye: SeviyeAyari,
    indeks: number
): AdimBilgisi {
    if (tanim.tonSecilebilir) return SEVIYE_BILGILERI[etkinKademe(seviye, tanim.yon)];
    return tanim.adimBilgileri[indeks] ?? tanim.adimBilgileri[0];
}

/** Adim basligi: ton secilebilen pencerede "2. hatırlatma", degilse adim adi. */
export function adimBasligiOlustur(
    tanim: Pick<PencereTanimi, 'tonSecilebilir' | 'adimBilgileri' | 'yon'>,
    seviye: SeviyeAyari,
    indeks: number
): string {
    return tanim.tonSecilebilir ? `${indeks + 1}. hatırlatma` : adimBilgisiAl(tanim, seviye, indeks).baslik;
}

/** Ton notu (issue #274): hatirlatma bir oncekinden YUMUSAKSA ekranda kisa bilgi. */
export const tonGeriNotuOlustur = (numara: number): string =>
    `${numara}. hatırlatma bir öncekinden daha yumuşak. Bilerek seçtiyseniz sorun yok.`;

/** Acil ton cipi devre disiyken altindaki aciklama. */
export const acilTonKisitNotu = (yon: PencereYonu): string =>
    yon === 'girisindenItibaren'
        ? '“Vakit girer girmez” seçeneğinde acil ton kullanılmaz.'
        : `Acil ton yalnız vaktin son ${ACIL_TON_UST_DK} dakikasında seçilebilir.`;

/** Ekleme sinirina ulasildiginda dugmenin yerine cikan metin. */
export const adimSiniriNotu = (maksAdim: number): string =>
    `Bir vakit için en fazla ${maksAdim} hatırlatma kurabilirsiniz.`;
export const ADIM_SINIRI_NOTU = adimSiniriNotu(MUHAFIZ_MAKS_ADIM);

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

/**
 * Muhafizin bir vakti icin pencere tanimi.
 *
 * `yetenekler` VARSAYILAN OLARAK ANDROID'dir → mevcut cagiranlar (ve testler)
 * icin cikti BIREBIR aynidir; nobetci test bunu dogrular. iOS ekrani yetenek
 * nesnesini `usePlatformYetenekleri` ile gecer, boylece `Platform.OS`
 * BILESENLERE HIC SIZMAZ.
 */
export function vakitPencereTanimi(
    vakit: MuhafizVakti,
    yon: PencereYonu = VARSAYILAN_PENCERE_YONU,
    pencereUzunluguDk?: number,
    yetenekler: PlatformYetenekleri = ANDROID_YETENEKLERI,
    pencere?: { baslangic: Date; bitis: Date }
): PencereTanimi {
    return {
        ...platformaGoreStandart(yetenekler),
        kaynak: `vakit:${vakit}`,
        baslik: VAKIT_ADLARI[vakit],
        baslikKucuk: VAKIT_ADLARI_KUCUK[vakit],
        ikon: 'mosque',
        vakit,
        yon,
        maksAdim: MUHAFIZ_MAKS_ADIM,
        tonSecilebilir: true,
        bosMetinOtomatik: false,
        anonsYerTutuculari: ANONS_SOZLUKLERI.muhafiz.yerTutucular,
        anonsSablonlari: anonsSablonlari(yon),
        // Teslimciyle AYNI çözücü (muhafız: `{vakit}` farz vaktinin adı).
        anonsCoz: (sablon, seviye) => anonsMetniniCoz(sablon, vakit, seviye.esikDk, yon),
        onPlanBanneriVar: true,
        pencereUzunluguDk,
        adimBilgileri: MUHAFIZ_ADIM_BILGILERI,
        yetenekler,
        esikAdimDk: ESIK_ADIM_DK,
        tekrarMinDk: TEKRAR_MIN_DK,
        tekrarMaxDk: TEKRAR_MAX_DK,
        varsayilanTekrarDk: VARSAYILAN_TEKRAR_DK,
        pencere,
    };
}

/**
 * Akış önizlemesinin ANONS satırı adımın KENDİ metnini okusun (plan üreticisiyle aynı kural:
 * dolu metin yüzeyin bağlamıyla çözülür, boşsa yüzeyin otomatik cümlesi). Önizleme ile cihazda
 * duyulan ayrışmasın.
 */
function ozelMetinliOnizleme(
    taban: PencereTanimi['onizlemeMetni'],
    baglam: (adim: UyariPlani) => AnonsBaglami,
    okunur = true
): PencereTanimi['onizlemeMetni'] {
    if (!taban) return undefined;
    return (adim, ilk) => {
        const metin = taban(adim, ilk);
        if (!okunur || !anonsMetniDoluMu(adim.anonsMetni)) return metin;
        return { ...metin, anons: anonsCoz(adim.anonsMetni, baglam(adim)) };
    };
}

/**
 * EK HATIRLATMA YÜZEYİ (cuma; sonra camiye gitme, yatış, takvim) için pencere tanımı —
 * ortak hatırlatma yüzeyleri plan §3.3.
 *
 * Yüzey muhafızla AYNI teslimciden geçer (kendi örneği) → STANDART yetenekler AÇIKTIR:
 * kanal çipleri (bildirim / sesli anons / ikisi / kapalı), bildirim sesi, titreşim,
 * gerçek alarm + kapsamı, tekrar, 1..`maksAdim` adım, akış önizlemesi.
 *
 * STANDART İSTİSNALARI (gerekçeli, sahip kararları K3–K4):
 * - YÖN SABİT (K3): her yüzeyin tek anlamlı yönü var (cuma/camiye gitme "vakit GİRMEDEN
 *   önce", yatış "yatıştan önce", takvim "etkinlikten önce"); seçici yerine
 *   `yonSabitGerekcesi` ekranda yazılır.
 * - TON YOK (K4): her adım nazik, acil kanal yok (Rahatsız Etmeyin delinmez).
 * - Ön plan banner'ı yok (olgu): ön plan muhafızı yalnız farz izler.
 *
 * SESLİ OKUMA METNİ her yüzeyde YAZILIR (eski K5 kararı geri alındı): yer tutucular yüzeyin
 * sözlüğünden (`ANONS_SOZLUKLERI[yuzey]` — takvimde etkinlik adı YOK); boş metin =
 * otomatik cümle (`otomatikAnons`). Önizleme de adımın metnini okur (plan üreticisiyle aynı).
 */
export function ekHatirlatmaPencereTanimi(secenekler: {
    kaynak: string;
    /** Sesli okuma sözlüğü (yer tutucular + hazır cümleler). */
    yuzey: Exclude<HatirlatmaYuzeyi, 'muhafiz' | 'nafile'>;
    /** Önizlemede `{vakit}`'in okunduğu ad ("Cuma", "Öğle", "Yatsı"). */
    anonsVakitAdi: string;
    anonsNotu?: string;
    /**
     * Akış önizlemesinde kullanıcının metni okunur mu? (yatış: yalnız yatsı hatırlatmasında —
     * muhasebe daima otomatik cümledir; plan üreticisiyle aynı kural.) Varsayılan `true`.
     */
    ozelMetinOnizlemedeOkunur?: boolean;
    baslik: string;
    baslikKucuk: string;
    ikon: string;
    /** Metin çözümü için vakit kimliği (cuma: 'ogle' — "Cuma" salt görünüm). */
    vakit: MuhafizVakti;
    yonSabitGerekcesi: string;
    adimSayisi: number;
    maksAdim: number;
    esikSinirlari: EsikSinirlari;
    esikAdimDk: number;
    tekrarMinDk: number;
    tekrarMaxDk: number;
    varsayilanTekrarDk: number;
    esikBasligi?: string;
    esikAciklamasi?: string;
    esikErisimAdi?: string;
    esikBirimi?: string;
    pencere?: { baslangic: Date; bitis: Date };
    seritGunEtiketi?: string;
    yetenekler?: PlatformYetenekleri;
    otomatikAnons?: (seviye: SeviyeAyari) => string;
    onizlemeMetni?: PencereTanimi['onizlemeMetni'];
    onizlemeOzeti?: PencereTanimi['onizlemeOzeti'];
}): PencereTanimi {
    const yetenekler = secenekler.yetenekler ?? ANDROID_YETENEKLERI;
    const sozluk = ANONS_SOZLUKLERI[secenekler.yuzey];
    const pencereUzunluguDk = secenekler.pencere
        ? Math.round((secenekler.pencere.bitis.getTime() - secenekler.pencere.baslangic.getTime()) / 60000)
        : undefined;
    const renk = SEVIYE_BILGILERI.nazik.renk;
    const adimBilgileri: AdimBilgisi[] =
        secenekler.adimSayisi > 1
            ? Array.from({ length: secenekler.maksAdim }, (_, i) => ({ baslik: `${i + 1}. hatırlatma`, ikon: 'bell', renk }))
            : [{ baslik: 'Hatırlatma', ikon: 'bell', renk }];
    return {
        ...platformaGoreStandart(yetenekler),
        // İSTİSNALAR — gerekçe fonksiyonun belgesinde (K3–K5).
        yonSecilebilir: false,
        yonSabitGerekcesi: secenekler.yonSabitGerekcesi,
        tonSecilebilir: false,
        bosMetinOtomatik: true,
        onPlanBanneriVar: false,
        kaynak: secenekler.kaynak,
        baslik: secenekler.baslik,
        baslikKucuk: secenekler.baslikKucuk,
        ikon: secenekler.ikon,
        vakit: secenekler.vakit,
        yon: 'cikisaDogru',
        maksAdim: secenekler.maksAdim,
        pencereUzunluguDk,
        adimBilgileri,
        anonsYerTutuculari: sozluk.yerTutucular,
        anonsSablonlari: sozluk.sablonlar,
        anonsCoz: (sablon, seviye) => anonsCoz(sablon, { vakit: secenekler.anonsVakitAdi, sureDk: seviye.esikDk }),
        otomatikAnons: secenekler.otomatikAnons,
        anonsNotu: secenekler.anonsNotu,
        onizlemeMetni: ozelMetinliOnizleme(
            secenekler.onizlemeMetni,
            (adim) => ({ vakit: secenekler.anonsVakitAdi, sureDk: adim.olcuDk }),
            secenekler.ozelMetinOnizlemedeOkunur ?? true
        ),
        onizlemeOzeti: secenekler.onizlemeOzeti,
        yetenekler,
        esikAdimDk: secenekler.esikAdimDk,
        tekrarMinDk: secenekler.tekrarMinDk,
        tekrarMaxDk: secenekler.tekrarMaxDk,
        varsayilanTekrarDk: secenekler.varsayilanTekrarDk,
        esikSinirlari: secenekler.esikSinirlari,
        esikBasligi: secenekler.esikBasligi,
        esikAciklamasi: secenekler.esikAciklamasi,
        esikErisimAdi: secenekler.esikErisimAdi,
        esikBirimi: secenekler.esikBirimi,
        pencere: secenekler.pencere,
        seritGunEtiketi: secenekler.seritGunEtiketi,
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

/**
 * Nafile (kuşluk / evvâbîn / teheccüd) hatırlatması için pencere tanımı
 * (issue #77, #273).
 *
 * Muhafızla AYNI yetenekler (`STANDART_YETENEKLER`): yön, en fazla 3 adım, her
 * adımın eşiği/sıklığı (bir kez ya da 10–60 dk tekrar), kanallar (bildirim /
 * sesli anons / ikisi / kapalı), bildirim sesi, titreşim ve GERÇEK ALARM.
 *
 * STANDART İSTİSNALARI (gerekçeli):
 * - TON YOK: nafile gönüllü ibadettir; "sert/acil" ton ve acil kanal (Rahatsız
 *   Etmeyin'i deler) davet değil ısrar olur (#273 fıkıh kararı).
 * - Ön plan banner'ı yok (olgu, yetenek değil): ön plan muhafızı yalnız farz izler.
 *
 * Sesli okuma metni YAZILIR (eski istisna kalktı): `{vakit}` nafilenin adıdır (muhafız
 * şablonları gibi farz vaktine değil), boş metin = bağlamsal otomatik cümle.
 * `pencere` verilirse zaman şeridi bugünün penceresini çizer.
 */
export function nafilePencereTanimi(secenekler: {
    kaynak: string;
    baslik: string;
    baslikKucuk: string;
    ikon: string;
    yon: PencereYonu;
    adimSayisi: number;
    pencere?: { baslangic: Date; bitis: Date };
    yetenekler?: PlatformYetenekleri;
    otomatikAnons?: (seviye: SeviyeAyari) => string;
    onizlemeMetni?: PencereTanimi['onizlemeMetni'];
    onizlemeOzeti?: PencereTanimi['onizlemeOzeti'];
}): PencereTanimi {
    const pencereUzunluguDk = secenekler.pencere
        ? Math.round((secenekler.pencere.bitis.getTime() - secenekler.pencere.baslangic.getTime()) / 60000)
        : undefined;
    const yetenekler = secenekler.yetenekler ?? ANDROID_YETENEKLERI;
    const renk = SEVIYE_BILGILERI.nazik.renk;
    // Tek adımda "Hatırlatma", birden çokta "N. hatırlatma" (prototip).
    const adimBilgileri: AdimBilgisi[] =
        secenekler.adimSayisi > 1
            ? Array.from({ length: NAFILE_MAKS_ADIM }, (_, i) => ({
                baslik: `${i + 1}. hatırlatma`,
                ikon: 'bell',
                renk,
            }))
            : [{ baslik: 'Hatırlatma', ikon: 'bell', renk }];
    return {
        ...platformaGoreStandart(yetenekler),
        // İSTİSNALAR — gerekçe fonksiyonun belgesinde.
        tonSecilebilir: false,
        bosMetinOtomatik: true,
        onPlanBanneriVar: false,
        kaynak: secenekler.kaynak,
        baslik: secenekler.baslik,
        baslikKucuk: secenekler.baslikKucuk,
        ikon: secenekler.ikon,
        // Metin cozumu icin bir vakit kimligi gerekir; nafile anonsu yer tutucu
        // icermez, deger yalniz tip sozlesmesini doldurur.
        vakit: 'ogle',
        yon: secenekler.yon,
        maksAdim: NAFILE_MAKS_ADIM,
        pencereUzunluguDk,
        adimBilgileri,
        anonsYerTutuculari: ANONS_SOZLUKLERI.nafile.yerTutucular,
        anonsSablonlari: ANONS_SOZLUKLERI.nafile.sablonlar,
        // Planlayıcıyla aynı bağlam: `{vakit}` nafilenin adı, `{süre}` ölçü, `{yön}` yön.
        anonsCoz: (sablon, seviye) =>
            anonsCoz(sablon, { vakit: secenekler.baslik, sureDk: seviye.esikDk, yon: secenekler.yon }),
        otomatikAnons: secenekler.otomatikAnons,
        onizlemeMetni: ozelMetinliOnizleme(secenekler.onizlemeMetni, (adim) => ({
            vakit: secenekler.baslik,
            sureDk: adim.olcuDk,
            yon: secenekler.yon,
        })),
        onizlemeOzeti: secenekler.onizlemeOzeti,
        yetenekler,
        esikAdimDk: ESIK_ADIM_DK,
        tekrarMinDk: NAFILE_TEKRAR_MIN_DK,
        tekrarMaxDk: NAFILE_TEKRAR_MAX_DK,
        varsayilanTekrarDk: NAFILE_VARSAYILAN_TEKRAR_DK,
        pencere: secenekler.pencere,
    };
}
