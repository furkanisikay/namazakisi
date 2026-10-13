/**
 * MUHAFIZ "ERTELE" — SAF kurallar (issue #289).
 *
 * Muhafız bildirimindeki "10 dk ertele" / "20 dk ertele" düğmesi "kapat ve unut"
 * yerine somut bir plan kurar. Fıkhi üst sınır kesindir: ertelenen hatırlatma
 * vaktin ÇIKIŞINDAN 3 dk öncesini ASLA geçmez; ikindide sınır kerahat (güneşin
 * sararması) başlangıcıdır. Geçecekse sınıra çekilir, sınır geçmişse ertelenmez.
 *
 * İKİZ: `android/app/.../cekirdek/ErtelemeKurallari.kt`. Android'de düğme NATIVE
 * işlenir (uygulama kapalıyken JS'i beklemeden); iki taraf AYNI fikstürü kabul
 * eder: `android/app/src/test/resources/erteleme-ornekleri.json`. Bir kural
 * değişirse ÜÇÜNÜ birlikte güncelle.
 *
 * KİMLİK UZAYI: ertelenen kopya `muhafiz_<tarih>_vakit_<vakit>_ertele` taşır →
 * "Kıldım" (native `BildirimKildimKurallari.buVakteAitMi`, JS
 * `vakitBildirimleriniIptalEt`) aynı önekle onu DA iptal eder. Muhafız plan
 * temizliği ise yalnız `_seviye_..._dk_..` kimliklerine dokunur
 * (`muhafizPlanKimligiMi`): yeniden planlama ertelemeyi silmemeli.
 */
import { BILDIRIM_SABITLERI, KAZA_SABITLERI } from '../constants/UygulamaSabitleri';
import type { VakitAdi } from '../types';
import { VAKIT_ADLARI } from '../utils/muhafizMetinYardimcisi';

/** Düğmelerin sunduğu süreler (dk), küçükten büyüğe. */
export const ERTELEME_SURELERI_DK = [10, 20] as const;

/** Ertelenen hatırlatma vaktin çıkışına bu kadar kala sınıra dayanır. */
export const ERTELEME_CIKIS_PAYI_DK = 3;

/**
 * Bir ertelemenin anlamlı sayıldığı en kısa gecikme (dk). Sınıra bundan az
 * kalmışsa düğme hiç sunulmaz: "10 dk ertele"ye basıp 2 dk sonra aynı uyarıyı
 * görmek ertelemenin vaadini bozar.
 */
export const ERTELEME_EN_AZ_DK = 5;

/**
 * Basış anında sınıra bundan az kalmışsa (ms) yeni hatırlatma KURULMAZ; bildirim
 * yalnız kapanır. Bildirim gölgelikte beklerken sınır geçmiş olabilir.
 */
export const ERTELEME_EN_AZ_GECIKME_MS = 60_000;

/**
 * Erteleme süresince muhafızın planlı uyarıları susar; hedef dakikasının
 * hemen ardındaki uyarı da (aynı dakikaya iki bildirim düşmesin) bu pay kadar
 * susturulur.
 */
export const ERTELEME_CAKISMA_PAYI_MS = 60_000;

export const ERTELEME_EYLEMLERI = {
    10: 'ertele_10',
    20: 'ertele_20',
} as const;

/** Kategoriler — sınıra kalan süreye göre düğme kümesi seçilir. */
export const ERTELEME_KATEGORILERI = {
    /** Yalnız "Kıldım" (tarihsel muhafız kategorisi). */
    YOK: BILDIRIM_SABITLERI.KATEGORI.MUHAFIZ,
    /** "Kıldım" + "10 dk ertele" */
    TEK: 'muhafiz_ertele1_category',
    /** "Kıldım" + "10 dk ertele" + "20 dk ertele" */
    IKI: 'muhafiz_ertele2_category',
} as const;

export const ERTELEME_KIMLIK_EKI = '_ertele';

const DK = 60_000;

/**
 * İkindide güneşin sararması (gurub kerahati) başlangıcı.
 *
 * TEK KAYNAK: `KazaHesaplayiciServisi.mekruhVakitKontrolEt` gurub penceresini
 * buradan alır (akşam vakti − `MEKRUH_TOLERANS_DK`). İkindinin çıkışı akşamın
 * girişidir (`muhafizVakitleriniHesapla`: ikindi.cikis = maghrib).
 */
export const gurubKerahatiBaslangiciMs = (aksamGirisMs: number): number =>
    aksamGirisMs - KAZA_SABITLERI.MEKRUH_TOLERANS_DK * DK;

/**
 * Ertelenen hatırlatmanın kurulabileceği EN GEÇ an.
 * Genel: çıkış − 3 dk. İkindi: gurub kerahati başlangıcı (hangisi erkense).
 */
export function ertelemeSiniriMs(vakit: VakitAdi, cikisMs: number): number {
    const genel = cikisMs - ERTELEME_CIKIS_PAYI_DK * DK;
    return vakit === 'ikindi' ? Math.min(genel, gurubKerahatiBaslangiciMs(cikisMs)) : genel;
}

/**
 * `tetikMs` anında gösterilecek bildirimde hangi süreler sunulur?
 *
 * Sığan süreler (≤ sınıra kalan) sunulur. Hiçbiri sığmıyor ama sınıra en az
 * `ERTELEME_EN_AZ_DK` varsa en kısa süre TEK seçenek kalır (basışta sınıra
 * çekilir). Daha azsa hiç sunulmaz.
 */
export function ertelemeSecenekleri(tetikMs: number, sinirMs: number): number[] {
    const kalanDk = Math.floor((sinirMs - tetikMs) / DK);
    if (!Number.isFinite(kalanDk) || kalanDk < ERTELEME_EN_AZ_DK) return [];
    const sigan = ERTELEME_SURELERI_DK.filter((s) => s <= kalanDk);
    return sigan.length > 0 ? [...sigan] : [ERTELEME_SURELERI_DK[0]];
}

/** Bildirimin kategorisi (düğme kümesi). */
export function ertelemeKategorisi(tetikMs: number, sinirMs: number): string {
    const n = ertelemeSecenekleri(tetikMs, sinirMs).length;
    if (n >= 2) return ERTELEME_KATEGORILERI.IKI;
    if (n === 1) return ERTELEME_KATEGORILERI.TEK;
    return ERTELEME_KATEGORILERI.YOK;
}

/** Eylem kimliği → süre (dk); ertele eylemi değilse `null`. */
export function eylemSuresiDk(eylem: string | null | undefined): number | null {
    if (eylem === ERTELEME_EYLEMLERI[10]) return 10;
    if (eylem === ERTELEME_EYLEMLERI[20]) return 20;
    return null;
}

/**
 * Basış anında yeni hatırlatmanın anı: `şimdi + süre`, sınırı geçecekse sınır.
 * Sınıra `ERTELEME_EN_AZ_GECIKME_MS`'den az kalmışsa `null` (ertelenmez).
 */
export function ertelemeHedefiHesapla(simdiMs: number, sureDk: number, sinirMs: number): number | null {
    const hedef = Math.min(simdiMs + sureDk * DK, sinirMs);
    return hedef - simdiMs >= ERTELEME_EN_AZ_GECIKME_MS ? hedef : null;
}

/** `muhafiz_<tarih>_vakit_<vakit>_ertele` — vakit başına TEK erteleme (yeniden ertelemek yerine geçer). */
export const ertelemeKimligi = (tarih: string, vakit: string): string =>
    `${BILDIRIM_SABITLERI.ONEKLEME.MUHAFIZ}${tarih}${BILDIRIM_SABITLERI.ONEKLEME.VAKIT}${vakit}${ERTELEME_KIMLIK_EKI}`;

const ERTELEME_DESENI = /^muhafiz_(\d{4}-\d{2}-\d{2})_vakit_([a-z]+)_ertele$/;
const PLAN_DESENI = /^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_seviye_\d+_dk_(-?\d+)$/;

export const ertelemeKimligiMi = (kimlik: string): boolean => ERTELEME_DESENI.test(kimlik);

/** Ertelemenin tarih + vaktini çözer. */
export function ertelemeKimliginiCoz(kimlik: string): { tarih: string; vakit: string } | null {
    const m = ERTELEME_DESENI.exec(kimlik);
    return m ? { tarih: m[1], vakit: m[2] } : null;
}

/**
 * Muhafız PLANININ (seviye/dakika) kimliği mi? Plan temizliği yalnız bunlara
 * dokunur; aynı `muhafiz_` uzayındaki erteleme ve yatış/muhasebe hatırlatmaları
 * başka sahiplere aittir.
 */
export const muhafizPlanKimligiMi = (kimlik: string): boolean => PLAN_DESENI.test(kimlik);

/** Plan kimliğindeki `kalanDk` (tetik = çıkış − kalanDk). Plan kimliği değilse `null`. */
export function kimliktenKalanDk(kimlik: string): number | null {
    const m = PLAN_DESENI.exec(kimlik);
    return m ? Number(m[1]) : null;
}

/** Erteleme süresince susturulacak planlı uyarı mı? */
export const ertelemedeSusturulurMu = (tetikMs: number, hedefMs: number): boolean =>
    tetikMs < hedefMs + ERTELEME_CAKISMA_PAYI_MS;

/** "25 dk" / "1 sa" / "1 sa 5 dk" — Kotlin `sureMetni` ile AYNI. */
export function sureMetni(dk: number): string {
    const d = Math.max(0, Math.floor(dk));
    const sa = Math.floor(d / 60);
    const kalan = d % 60;
    if (sa === 0) return `${kalan} dk`;
    return kalan === 0 ? `${sa} sa` : `${sa} sa ${kalan} dk`;
}

/** Başlık şablonunda süre yer tutucusu (basış anında doldurulur). */
export const ERTELEME_SURE_YER_TUTUCU = '{sure}';

/**
 * Ertelenen kopyanın başlık ŞABLONU. Asıl başlık "45 dk · İkindi vakti" gibi
 * planlama anının dakikasını taşır; ertelenen kopyada bayatlar → süre basış
 * anında `çıkış − hedef`ten doldurulur. İbadete çağrı kaydı ("sen").
 */
export const ertelemeBasligiSablonu = (vakitAdi: string): string =>
    `⏳ ${ERTELEME_SURE_YER_TUTUCU} kaldı · Ertelediğin ${vakitAdi} namazı`;

/** Şablonu doldurur; şablon yoksa `null` (çağıran asıl başlığı korur). */
export function ertelemeBasligiOlustur(sablon: string | null | undefined, cikisMs: number, hedefMs: number): string | null {
    if (!sablon || !sablon.includes(ERTELEME_SURE_YER_TUTUCU)) return null;
    return sablon.split(ERTELEME_SURE_YER_TUTUCU).join(sureMetni((cikisMs - hedefMs) / DK));
}

/**
 * Bekleyen bildirimlerden etkin ertelemeleri toplar: `<tarih>_<vakit>` → hedef ms.
 * Yeniden planlama bu aralıktaki muhafız uyarılarını kurmaz (yoksa 15 dk görevi
 * ya da açılış ertelemenin susturduğu uyarıları geri getirirdi).
 */
export function etkinErtelemeler(
    bekleyenler: ReadonlyArray<{ identifier: string; content?: { data?: unknown } }>
): Record<string, number> {
    const sonuc: Record<string, number> = {};
    for (const b of bekleyenler) {
        const coz = ertelemeKimliginiCoz(b.identifier);
        if (!coz) continue;
        const veri = b.content?.data as { ertelemeHedefMs?: unknown } | undefined;
        const hedef = veri?.ertelemeHedefMs;
        if (typeof hedef !== 'number' || !Number.isFinite(hedef)) continue;
        sonuc[`${coz.tarih}_${coz.vakit}`] = hedef;
    }
    return sonuc;
}

/** Bildirimin `data`sına yazılan erteleme alanları (native ve JS basış yolu okur). */
export interface ErtelemeVerisi {
    /** Vaktin çıkışı (ms) — ertelenen kopyanın başlığındaki "kaldı" süresi buradan. */
    cikisMs: number;
    /** `ertelemeSiniriMs` — hiçbir erteleme bunu geçmez. */
    erteleSinirMs: number;
    /** `ertelemeBasligiSablonu` */
    ertelemeBasligi: string;
}

/** Planlanan muhafız uyarısının kategorisi + `data` ekleri (iki teslimci ortak). */
export function ertelemeTeslimBilgisi(
    vakit: VakitAdi,
    cikisMs: number,
    tetikMs: number
): { kategori: string; veri: ErtelemeVerisi } {
    const erteleSinirMs = ertelemeSiniriMs(vakit, cikisMs);
    return {
        kategori: ertelemeKategorisi(tetikMs, erteleSinirMs),
        veri: { cikisMs, erteleSinirMs, ertelemeBasligi: ertelemeBasligiSablonu(VAKIT_ADLARI[vakit]) },
    };
}
