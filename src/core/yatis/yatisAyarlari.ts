/**
 * Yatış hatırlatması + gün sonu muhasebesi AYARI — tip, kısıtlar, normalize + GÖÇ (SAF;
 * issue #290, ortak hatırlatma yüzeyleri plan §5.3).
 *
 * Yatış artık nafile (#273) / cuma deseninde ortak modeli konuşur: `{ aktif, adimlar }` +
 * yatışa özgü alanlar (`saat`, `dakika`, `yatsiHatirlatmasi`, `muhasebe`). Her adımın eşiği
 * ("yatışa kaç dk kala"), sıklığı ve kanalları (bildirim / sesli anons / titreşim / gerçek
 * alarm + kapsamı / ses) muhafızla AYNI koddan. Yön SABİT (yatışa kalan süre; pencerenin
 * başı yoktur), ton YOK.
 *
 * GÖÇ ŞEKLE BAKAR, bayrağa değil: `adimlar` dizisi yoksa kayıt eskidir ve eski `onceDk`'dan
 * TEK adım kurulur — eski kayıt BİREBİR aynı planı üretir (nöbetçi:
 * `YatisHatirlatmaServisi.kayitOynat.test.ts`). İdempotent.
 *
 * TÜREV ALAN: `onceDk` ilk kronolojik adımdan (yatıştan en uzak) türetilip diske YAZILMAYA
 * DEVAM EDER — eski sürüm bu yedeği açarsa çalışır.
 *
 * RIZALAR (`sesliOnayi`, `alarmOnayi`) bu yüzeyin KENDİ kaydıdır (muhafız/nafile/cumanınki
 * taşınmaz) ve yalnız ekranda onaylanınca yazılır; göç ya da varsayılan UYDURAMAZ.
 *
 * VARSAYILAN KAPALI. Bozuk/eksik alan varsayılana düşer: bozuk bir "önce" değeri (0, NaN)
 * yatış anının kendisine ya da geçmişe kurulan bildirim demek olurdu.
 */
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import { adimlariNormalize, ekAdim, EK_HATIRLATMA_MAKS_ADIM, type AdimKisitlari } from '../hatirlatma/adimDizisi';

export interface YatisAyarlari {
    /** Özelliğin ana anahtarı — VARSAYILAN KAPALI. */
    aktif: boolean;
    /** Her zamanki yatış saati (0–23) ve dakikası. */
    saat: number;
    dakika: number;
    /** Yatsı kılınmadıysa hatırlat. */
    yatsiHatirlatmasi: boolean;
    /** Gün sonu muhasebesi (eksik vakitler). */
    muhasebe: boolean;
    /** 1..3 adım, KRONOLOJİK (eşik azalan = yatıştan en uzak önce), eşik tekil. */
    adimlar: SeviyeAyari[];
    /** Sesli anons rızası — bu yüzeyin KENDİ kaydı. */
    sesliOnayi?: boolean;
    /** Gerçek alarm rızası — bu yüzeyin KENDİ kaydı. */
    alarmOnayi?: boolean;
    /** TÜREV (ilk adımın eşiği): eski sürüm yedeği açarsa çalışsın diye yazılır. */
    onceDk: number;
}

export const YATIS_ONCE_MIN_DK = 5;
export const YATIS_ONCE_MAX_DK = 120;
export const YATIS_ONCE_ADIM_DK = 5;
export const YATIS_DAKIKA_ADIM = 5;
/** Tekrar aralığı (cuma ile aynı gerekçe: dakika dakika uyarmak gürültüdür). */
export const YATIS_TEKRAR_MIN_DK = 5;
export const YATIS_TEKRAR_MAX_DK = 60;
export const YATIS_VARSAYILAN_TEKRAR_DK = 10;
const YATIS_VARSAYILAN_ONCE_DK = 30;

/**
 * Seçilebilir yatış saatleri: 20:00 – 02:55. Daha geç saat TR yazında imsağı
 * (~03:15) geçebilir; o anda "yatsıyı kıl" demek yanlıştır (vakit çıkmıştır).
 */
export const YATIS_SAATLERI: readonly number[] = [20, 21, 22, 23, 0, 1, 2];

/** Yatışın adım kısıtları (ortak adım dizisi `core/hatirlatma/adimDizisi.ts`). */
export const YATIS_ADIM_KISITLARI: AdimKisitlari = {
    maksAdim: EK_HATIRLATMA_MAKS_ADIM,
    tekrarMinDk: YATIS_TEKRAR_MIN_DK,
    tekrarMaxDk: YATIS_TEKRAR_MAX_DK,
    esikMinDk: YATIS_ONCE_MIN_DK,
    esikMaxDk: YATIS_ONCE_MAX_DK,
    esikAdimDk: YATIS_ONCE_ADIM_DK,
};

const nesneMi = (d: unknown): d is Record<string, unknown> =>
    !!d && typeof d === 'object' && !Array.isArray(d);
const sayiMi = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const adimaYuvarla = (deger: number, adim: number): number => Math.round(deger / adim) * adim;

/** Eski `onceDk` alanı: güvenli aralığa ve 5'in katına. */
const eskiOnceDk = (deger: unknown): number =>
    sayiMi(deger)
        ? Math.min(YATIS_ONCE_MAX_DK, Math.max(YATIS_ONCE_MIN_DK, adimaYuvarla(deger, YATIS_ONCE_ADIM_DK)))
        : YATIS_VARSAYILAN_ONCE_DK;

const tureviYaz = (temel: Omit<YatisAyarlari, 'onceDk'>): YatisAyarlari => ({
    ...temel,
    onceDk: temel.adimlar[0].esikDk,
});

/** Varsayılan ayar (her çağrı YENİ nesne). */
export function varsayilanYatisAyarlari(): YatisAyarlari {
    return tureviYaz({
        aktif: false,
        saat: 23,
        dakika: 0,
        yatsiHatirlatmasi: true,
        muhasebe: true,
        adimlar: [ekAdim(YATIS_VARSAYILAN_ONCE_DK)],
    });
}

/** Geriye uyumlu sabit (salt okunur kullanım — değiştirmeyin; `varsayilanYatisAyarlari`). */
export const YATIS_VARSAYILAN_AYARLARI: YatisAyarlari = varsayilanYatisAyarlari();

/**
 * Ham kaydı (disk, yedek, ekran) güvenli ayara çevirir + eski şekli GÖÇ ETTİRİR.
 * Asla fırlatmaz; nesne olmayan değer varsayılana düşer.
 */
export function yatisAyarlariniNormalize(ham: unknown): YatisAyarlari {
    const v = varsayilanYatisAyarlari();
    if (!nesneMi(ham)) return v;
    const saat = sayiMi(ham.saat) && YATIS_SAATLERI.includes(Math.round(ham.saat)) ? Math.round(ham.saat) : v.saat;
    const dakika = sayiMi(ham.dakika)
        ? Math.min(55, Math.max(0, adimaYuvarla(ham.dakika, YATIS_DAKIKA_ADIM)))
        : v.dakika;
    const adimlar = Array.isArray(ham.adimlar)
        ? adimlariNormalize(ham.adimlar, 'cikisaDogru', eskiOnceDk(ham.onceDk), YATIS_ADIM_KISITLARI)
        : // GÖÇ: eski tek ofsetli kayıt → TEK adım, yalnız bildirim, tek atış (bugünkü plan).
          [ekAdim(eskiOnceDk(ham.onceDk))];
    return tureviYaz({
        aktif: ham.aktif === true,
        saat,
        dakika,
        yatsiHatirlatmasi: typeof ham.yatsiHatirlatmasi === 'boolean' ? ham.yatsiHatirlatmasi : v.yatsiHatirlatmasi,
        muhasebe: typeof ham.muhasebe === 'boolean' ? ham.muhasebe : v.muhasebe,
        adimlar,
        ...(ham.sesliOnayi === true ? { sesliOnayi: true } : {}),
        ...(ham.alarmOnayi === true ? { alarmOnayi: true } : {}),
    });
}

/**
 * Kısmi değişikliği ayara uygular ve normalize eder. Eski alanla (`onceDk`) gelen değişiklik
 * (eski thunk çağıranı) İLK adıma yazılır.
 */
export function yatisAyarlariniBirlestir(mevcut: YatisAyarlari, degisiklik: Partial<YatisAyarlari>): YatisAyarlari {
    // Mevcut kayıt eski/eksik şekilliyse (yükleme öncesi, eski yedek) önce göçer.
    const temel = Array.isArray(mevcut?.adimlar) && mevcut.adimlar.length > 0 ? mevcut : yatisAyarlariniNormalize(mevcut);
    let adimlar = degisiklik.adimlar ?? temel.adimlar;
    if (!degisiklik.adimlar && degisiklik.onceDk !== undefined) {
        const [ilk, ...kalan] = adimlar;
        adimlar = [{ ...ilk, esikDk: degisiklik.onceDk }, ...kalan];
    }
    const { onceDk: _o, ...digerleri } = { ...temel, ...degisiklik };
    return yatisAyarlariniNormalize({ ...digerleri, adimlar });
}
