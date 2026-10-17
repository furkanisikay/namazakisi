/**
 * Cuma namazı hatırlatması AYARI — tip, kısıtlar, normalize + GÖÇ (SAF; issue #173,
 * ortak hatırlatma yüzeyleri plan §5.1).
 *
 * Cuma artık nafile (#273) deseninde ortak modeli konuşur: `{ aktif, adimlar }` — en fazla
 * 3 adım, her adımın eşiği ("öğleye kaç dk kala"), sıklığı ve kanalları (bildirim / sesli
 * anons / titreşim / gerçek alarm + kapsamı / ses). Yön SABİT (öğle GİRİŞİNE kalan süre;
 * vakit girdikten sonra cuma için geç olur), ton YOK.
 *
 * GÖÇ ŞEKLE BAKAR, bayrağa değil: `adimlar` dizisi yoksa kayıt eskidir ve eski alanlardan
 * (`oncedenDk`, `siklik`) TEK adım kurulur — eski kayıt BİREBİR aynı planı üretir (nöbetçi:
 * `CumaHatirlatmaServisi.kayitOynat.test.ts`). İdempotent.
 *
 * TÜREV ALANLAR: `oncedenDk` + `siklik` ilk kronolojik adımdan türetilip diske YAZILMAYA
 * DEVAM EDER — eski sürüm bu yedeği açarsa çalışır (nafile `gostergeAktif` deseni).
 *
 * RIZALAR (`sesliOnayi`, `alarmOnayi`) cumanın KENDİ kaydıdır (muhafız/nafileninki
 * taşınmaz) ve yalnız ekranda onaylanınca yazılır; göç ya da varsayılan UYDURAMAZ.
 *
 * Cuma herkese farz-ı ayn değildir → varsayılan KAPALI. Cinsiyet/durum verisi TOPLANMAZ.
 */
import type { SeviyeAyari, Siklik } from '../muhafiz/matrisTipleri';
import {
    adimlariNormalize,
    ekAdim,
    sayiKenetle,
    siklikNormalize as adimSiklikNormalize,
    EK_HATIRLATMA_MAKS_ADIM,
    type AdimKisitlari,
} from '../hatirlatma/adimDizisi';

export const CUMA_ONCEDEN_MIN_DK = 15;
export const CUMA_ONCEDEN_MAX_DK = 180;
export const CUMA_ONCEDEN_ADIM_DK = 15;

/**
 * Tekrar aralığı sınırları. Alt sınır 5 dk (muhafızın 1 dk'sı DEĞİL): cuma hatırlatması
 * "vakit çıkıyor" değil "camiye yetiş" mantığındadır; dakika dakika uyarmak gürültüdür.
 */
export const CUMA_TEKRAR_MIN_DK = 5;
export const CUMA_TEKRAR_MAX_DK = 60;
export const CUMA_VARSAYILAN_TEKRAR_DK = 15;
export const CUMA_VARSAYILAN_ONCEDEN_DK = 60;

/** Cumanın adım kısıtları (ortak adım dizisi `core/hatirlatma/adimDizisi.ts`). */
export const CUMA_ADIM_KISITLARI: AdimKisitlari = {
    maksAdim: EK_HATIRLATMA_MAKS_ADIM,
    tekrarMinDk: CUMA_TEKRAR_MIN_DK,
    tekrarMaxDk: CUMA_TEKRAR_MAX_DK,
    esikMinDk: CUMA_ONCEDEN_MIN_DK,
    esikMaxDk: CUMA_ONCEDEN_MAX_DK,
    esikAdimDk: CUMA_ONCEDEN_ADIM_DK,
};

export interface CumaHatirlatmaAyarlari {
    aktif: boolean;
    /** 1..3 adım, KRONOLOJİK (eşik azalan = öğleden en uzak önce), eşik tekil. */
    adimlar: SeviyeAyari[];
    /** Sesli anons rızası — cumanın KENDİ kaydı. */
    sesliOnayi?: boolean;
    /** Gerçek alarm rızası — cumanın KENDİ kaydı. */
    alarmOnayi?: boolean;
    /** TÜREV (ilk adımın eşiği): eski sürüm yedeği açarsa çalışsın diye yazılır. */
    oncedenDk: number;
    /** TÜREV (ilk adımın sıklığı). */
    siklik: Siklik;
}

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);

/** Eski `oncedenDk` alanı: güvenli aralığa (bozuk kayıt planlamayı bozmasın). */
const eskiOncedenDk = (deger: unknown): number =>
    sayiKenetle(deger, CUMA_ONCEDEN_MIN_DK, CUMA_ONCEDEN_MAX_DK, CUMA_VARSAYILAN_ONCEDEN_DK);

/**
 * Eski `siklik` alanı: bozuk/eksik değer `'birkez'`e düşer — bozuk bir sayıdan (0, negatif,
 * NaN) periyodik plan üretmek tek cumada yüzlerce bildirim demek olurdu.
 */
const eskiSiklik = (deger: unknown): Siklik => {
    if (deger === 'birkez' || !nesneMi(deger)) return 'birkez';
    const herDk = deger.herDk;
    if (typeof herDk !== 'number' || !Number.isFinite(herDk) || herDk <= 0) return 'birkez';
    return adimSiklikNormalize(deger, CUMA_ADIM_KISITLARI);
};

/** Türev alanları adımlardan yazar (ilk kronolojik adım = öğleden en uzak). */
const tureviYaz = (
    temel: Omit<CumaHatirlatmaAyarlari, 'oncedenDk' | 'siklik'>
): CumaHatirlatmaAyarlari => ({
    ...temel,
    oncedenDk: temel.adimlar[0].esikDk,
    siklik: temel.adimlar[0].siklik,
});

/** Varsayılan ayar (her çağrı YENİ nesne). */
export function varsayilanCumaAyarlari(): CumaHatirlatmaAyarlari {
    return tureviYaz({ aktif: false, adimlar: [ekAdim(CUMA_VARSAYILAN_ONCEDEN_DK)] });
}

/**
 * Ham kaydı (disk, yedek, ekran) güvenli ayara çevirir + eski şekli GÖÇ ETTİRİR.
 * Asla fırlatmaz; nesne olmayan değer varsayılana düşer.
 */
export function cumaAyarlariniNormalize(ham: unknown): CumaHatirlatmaAyarlari {
    if (!nesneMi(ham)) return varsayilanCumaAyarlari();
    const adimlar = Array.isArray(ham.adimlar)
        ? adimlariNormalize(ham.adimlar, 'cikisaDogru', eskiOncedenDk(ham.oncedenDk), CUMA_ADIM_KISITLARI)
        : // GÖÇ: eski tek ofsetli kayıt → TEK adım, yalnız bildirim (bugünkü kanal).
          [ekAdim(eskiOncedenDk(ham.oncedenDk), eskiSiklik(ham.siklik))];
    return tureviYaz({
        aktif: ham.aktif === true,
        adimlar,
        ...(ham.sesliOnayi === true ? { sesliOnayi: true } : {}),
        ...(ham.alarmOnayi === true ? { alarmOnayi: true } : {}),
    });
}

/**
 * Kısmi değişikliği ayara uygular ve normalize eder. Eski alanlarla (`oncedenDk`,
 * `siklik`) gelen değişiklik (eski ekran/thunk çağıranı) İLK adıma yazılır.
 */
export function cumaAyarlariniBirlestir(
    mevcut: CumaHatirlatmaAyarlari,
    degisiklik: Partial<CumaHatirlatmaAyarlari>
): CumaHatirlatmaAyarlari {
    // Mevcut kayıt eski/eksik şekilliyse (yükleme öncesi, eski yedek) önce göçer.
    const temel = Array.isArray(mevcut?.adimlar) && mevcut.adimlar.length > 0 ? mevcut : cumaAyarlariniNormalize(mevcut);
    let adimlar = degisiklik.adimlar ?? temel.adimlar;
    if (!degisiklik.adimlar && (degisiklik.oncedenDk !== undefined || degisiklik.siklik !== undefined)) {
        const [ilk, ...kalan] = adimlar;
        adimlar = [
            {
                ...ilk,
                ...(degisiklik.oncedenDk !== undefined ? { esikDk: degisiklik.oncedenDk } : {}),
                ...(degisiklik.siklik !== undefined ? { siklik: degisiklik.siklik } : {}),
            },
            ...kalan,
        ];
    }
    const { oncedenDk: _o, siklik: _s, ...digerleri } = { ...temel, ...degisiklik };
    return cumaAyarlariniNormalize({ ...digerleri, adimlar });
}
