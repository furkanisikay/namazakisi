/**
 * Takvim çakışması uyarısı ayarları — SAF (issue #291; ortak hatırlatma yüzeyleri plan §5.4).
 *
 * Kullanıcının DİĞER takvimlerindeki bir etkinlik bir vaktin kalanını
 * kaplıyorsa önceden uyarılır. Başka takvimleri okumak bir kapsam genişlemesidir
 * → VARSAYILAN KAPALI ve açmak AÇIK RIZA ister.
 *
 * ORTAK MODEL (nafile #273 / cuma / camiye gitme deseni): `{ aktif, adimlar }` — en fazla 3
 * adım, her adımın eşiği ("etkinlikten kaç dk önce"), sıklığı (tekrar = AYNI uyarının yeniden
 * teslimi) ve kanalları (bildirim / sesli anons / titreşim / gerçek alarm + kapsamı / ses).
 * Yön SABİT (çakışmanın çapasına kalan süre), ton YOK.
 *
 * GÖÇ ŞEKLE BAKAR, bayrağa değil: `adimlar` dizisi yoksa kayıt eskidir ve eski `oncedenDk`'dan
 * TEK adım kurulur — eski kayıt BİREBİR aynı planı üretir (nöbetçi:
 * `TakvimCakismaServisi.kayitOynat.test.ts`). İdempotent.
 *
 * TÜREV ALAN: `oncedenDk` ilk kronolojik adımdan (etkinlikten en uzak) türetilip diske
 * YAZILMAYA DEVAM EDER — eski sürüm bu yedeği açarsa çalışır.
 *
 * ÜÇ AYRI RIZA, hepsi UYDURULAMAZ:
 *  - `rizaZamani` (takvim okuma): yalnız kullanıcı açıklama modalını EKRANDA görüp
 *    "Kabul ediyorum" dediğinde yazılır. Normalize, rıza kaydı olmayan "açık" ayarı
 *    KAPALI'ya indirir. Kapatmak yalnız BUNU siler.
 *  - `sesliOnayi`, `alarmOnayi`: bu yüzeyin KENDİ kaydı (muhafız/nafile/diğer yüzeylerinki
 *    taşınmaz); yalnız ekranda onaylanınca yazılır, göç ya da varsayılan yazamaz.
 *
 * GİZLİLİK: etkinlik ADI varsayılan olarak bildirimde GÖSTERİLMEZ
 * ("Takvimindeki bir etkinlik"): bildirim kilit ekranında, bilekliklerde ve
 * bildirim geçmişinde görünür; toplantı adı orada kişisel veri sızıntısıdır.
 * Kullanıcı isterse `baslikGoster` ile açar. Sesli anonsa ve gerçek alarm ekranına ad
 * HİÇBİR KOŞULDA girmez (`takvimCakismaPlani`).
 */
import type { SeviyeAyari } from '../muhafiz/matrisTipleri';
import { adimlariNormalize, ekAdim, EK_HATIRLATMA_MAKS_ADIM, type AdimKisitlari } from '../hatirlatma/adimDizisi';

export interface TakvimCakismaAyarlari {
    /** Özelliğin ana anahtarı — VARSAYILAN KAPALI. */
    aktif: boolean;
    /** Etkinlik adı bildirimde gösterilsin mi? (varsayılan: hayır) */
    baslikGoster: boolean;
    /** Açık rızanın verildiği an (ISO). Yoksa özellik açılamaz. */
    rizaZamani?: string;
    /** 1..3 adım, KRONOLOJİK (eşik azalan = etkinlikten en uzak önce), eşik tekil. */
    adimlar: SeviyeAyari[];
    /** Sesli anons rızası — bu yüzeyin KENDİ kaydı. */
    sesliOnayi?: boolean;
    /** Gerçek alarm rızası — bu yüzeyin KENDİ kaydı. */
    alarmOnayi?: boolean;
    /** TÜREV (ilk adımın eşiği): eski sürüm yedeği açarsa çalışsın diye yazılır. */
    oncedenDk: number;
}

export const TAKVIM_CAKISMA_ONCE_MIN_DK = 10;
export const TAKVIM_CAKISMA_ONCE_MAX_DK = 120;
export const TAKVIM_CAKISMA_ONCE_ADIM_DK = 5;
/** Tekrar aralığı (cuma ile aynı gerekçe: dakika dakika uyarmak gürültüdür). */
export const TAKVIM_CAKISMA_TEKRAR_MIN_DK = 5;
export const TAKVIM_CAKISMA_TEKRAR_MAX_DK = 60;
export const TAKVIM_CAKISMA_VARSAYILAN_TEKRAR_DK = 10;
const TAKVIM_CAKISMA_VARSAYILAN_ONCE_DK = 30;

/** Takvim çakışmasının adım kısıtları (ortak adım dizisi `core/hatirlatma/adimDizisi.ts`). */
export const TAKVIM_CAKISMA_ADIM_KISITLARI: AdimKisitlari = {
    maksAdim: EK_HATIRLATMA_MAKS_ADIM,
    tekrarMinDk: TAKVIM_CAKISMA_TEKRAR_MIN_DK,
    tekrarMaxDk: TAKVIM_CAKISMA_TEKRAR_MAX_DK,
    esikMinDk: TAKVIM_CAKISMA_ONCE_MIN_DK,
    esikMaxDk: TAKVIM_CAKISMA_ONCE_MAX_DK,
    esikAdimDk: TAKVIM_CAKISMA_ONCE_ADIM_DK,
};

/**
 * Uygulamanın kendi yazdığı namaz etkinliklerinin notu (`TakvimServisi`).
 * Çakışma taramasında bu nottaki etkinlikler HARİÇ tutulur — yoksa uygulama
 * kendi koyduğu "İkindi Namazı" etkinliğini ikindiye engel sanırdı.
 */
export const UYGULAMA_TAKVIM_NOTU = 'Namaz Akışı tarafından oluşturuldu';

const nesneMi = (d: unknown): d is Record<string, unknown> => !!d && typeof d === 'object' && !Array.isArray(d);

/** Eski `oncedenDk` alanı: güvenli aralığa (yuvarlanır, adıma ÇEKİLMEZ — eski plan birebir). */
const eskiOncedenDk = (deger: unknown): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return TAKVIM_CAKISMA_VARSAYILAN_ONCE_DK;
    return Math.min(TAKVIM_CAKISMA_ONCE_MAX_DK, Math.max(TAKVIM_CAKISMA_ONCE_MIN_DK, Math.round(deger)));
};

const gecerliIsoMu = (d: unknown): d is string =>
    typeof d === 'string' && d.length > 0 && d.length <= 40 && Number.isFinite(Date.parse(d));

const tureviYaz = (temel: Omit<TakvimCakismaAyarlari, 'oncedenDk'>): TakvimCakismaAyarlari => ({
    ...temel,
    oncedenDk: temel.adimlar[0].esikDk,
});

/** Varsayılan ayar (her çağrı YENİ nesne). */
export function varsayilanTakvimCakismaAyarlari(): TakvimCakismaAyarlari {
    return tureviYaz({
        aktif: false,
        baslikGoster: false,
        adimlar: [ekAdim(TAKVIM_CAKISMA_VARSAYILAN_ONCE_DK)],
    });
}

/** Geriye uyumlu sabit (salt okunur kullanım — değiştirmeyin; `varsayilanTakvimCakismaAyarlari`). */
export const VARSAYILAN_TAKVIM_CAKISMA_AYARLARI: TakvimCakismaAyarlari = varsayilanTakvimCakismaAyarlari();

/** Diskten gelen ham değeri güvenli ayara çevirir + eski şekli GÖÇ ETTİRİR. ASLA fırlatmaz. */
export function takvimCakismaAyarlariniNormalize(ham: unknown): TakvimCakismaAyarlari {
    if (!nesneMi(ham)) return varsayilanTakvimCakismaAyarlari();
    const yedekEsik = eskiOncedenDk(ham.oncedenDk);
    const adimlar = Array.isArray(ham.adimlar)
        ? adimlariNormalize(ham.adimlar, 'cikisaDogru', yedekEsik, TAKVIM_CAKISMA_ADIM_KISITLARI)
        : // GÖÇ: eski tek ofsetli kayıt → TEK adım, yalnız bildirim, tek atış (bugünkü plan).
          [ekAdim(yedekEsik)];
    const rizaZamani = gecerliIsoMu(ham.rizaZamani) ? ham.rizaZamani : undefined;
    return tureviYaz({
        // Rıza kaydı yoksa özellik AÇIK sayılmaz (rıza uydurulamaz).
        aktif: ham.aktif === true && rizaZamani !== undefined,
        baslikGoster: ham.baslikGoster === true,
        ...(rizaZamani !== undefined ? { rizaZamani } : {}),
        adimlar,
        ...(ham.sesliOnayi === true ? { sesliOnayi: true } : {}),
        ...(ham.alarmOnayi === true ? { alarmOnayi: true } : {}),
    });
}

/**
 * Kısmi değişikliği ayara uygular ve normalize eder (cuma/yatış ikizi). Eski alanla
 * (`oncedenDk`) gelen değişiklik (eski thunk çağıranı) İLK adıma yazılır. Kapatmak
 * (`aktif: false`) YALNIZ takvim rızasını siler — sesli/alarm rızası ayardır, kalır.
 */
export function takvimCakismaAyarlariniBirlestir(
    mevcut: TakvimCakismaAyarlari,
    degisiklik: Partial<TakvimCakismaAyarlari>
): TakvimCakismaAyarlari {
    // Mevcut kayıt eski/eksik şekilliyse (yükleme öncesi, eski yedek) önce göçer.
    const temel =
        Array.isArray(mevcut?.adimlar) && mevcut.adimlar.length > 0 ? mevcut : takvimCakismaAyarlariniNormalize(mevcut);
    let adimlar = degisiklik.adimlar ?? temel.adimlar;
    if (!degisiklik.adimlar && degisiklik.oncedenDk !== undefined) {
        const [ilk, ...kalan] = adimlar;
        adimlar = [{ ...ilk, esikDk: degisiklik.oncedenDk }, ...kalan];
    }
    const birlesik: Record<string, unknown> = { ...temel, ...degisiklik, adimlar };
    delete birlesik.oncedenDk;
    if (degisiklik.aktif === false) delete birlesik.rizaZamani;
    return takvimCakismaAyarlariniNormalize(birlesik);
}
