/**
 * Takvim çakışması uyarısı ayarları — SAF (issue #291).
 *
 * Kullanıcının DİĞER takvimlerindeki bir etkinlik bir vaktin kalanını
 * kaplıyorsa önceden TEK bildirim gönderilir. Başka takvimleri okumak bir
 * kapsam genişlemesidir → VARSAYILAN KAPALI ve açmak AÇIK RIZA ister.
 *
 * RIZA KAYDI UYDURULAMAZ: `rizaZamani` yalnız kullanıcı açıklama modalını
 * EKRANDA görüp "Kabul ediyorum" dediğinde yazılır. Normalize, rıza kaydı
 * olmayan "açık" ayarı KAPALI'ya indirir (bozuk/elle düzenlenmiş kayıt
 * kullanıcının haberi olmadan takvim okumasın).
 *
 * GİZLİLİK: etkinlik ADI varsayılan olarak bildirimde GÖSTERİLMEZ
 * ("Takvimindeki bir etkinlik"): bildirim kilit ekranında, bilekliklerde ve
 * bildirim geçmişinde görünür; toplantı adı orada kişisel veri sızıntısıdır.
 * Kullanıcı isterse `baslikGoster` ile açar.
 */

export interface TakvimCakismaAyarlari {
    /** Özelliğin ana anahtarı — VARSAYILAN KAPALI. */
    aktif: boolean;
    /** Etkinlik başlamadan kaç dk önce uyarılır. */
    oncedenDk: number;
    /** Etkinlik adı bildirimde gösterilsin mi? (varsayılan: hayır) */
    baslikGoster: boolean;
    /** Açık rızanın verildiği an (ISO). Yoksa özellik açılamaz. */
    rizaZamani?: string;
}

export const TAKVIM_CAKISMA_ONCE_MIN_DK = 10;
export const TAKVIM_CAKISMA_ONCE_MAX_DK = 120;
export const TAKVIM_CAKISMA_ONCE_ADIM_DK = 5;

export const VARSAYILAN_TAKVIM_CAKISMA_AYARLARI: TakvimCakismaAyarlari = {
    aktif: false,
    oncedenDk: 30,
    baslikGoster: false,
};

/**
 * Uygulamanın kendi yazdığı namaz etkinliklerinin notu (`TakvimServisi`).
 * Çakışma taramasında bu nottaki etkinlikler HARİÇ tutulur — yoksa uygulama
 * kendi koyduğu "İkindi Namazı" etkinliğini ikindiye engel sanırdı.
 */
export const UYGULAMA_TAKVIM_NOTU = 'Namaz Akışı tarafından oluşturuldu';

const nesneMi = (d: unknown): d is Record<string, unknown> => !!d && typeof d === 'object' && !Array.isArray(d);

const sinirla = (deger: unknown, min: number, max: number, yedek: number): number => {
    if (typeof deger !== 'number' || !Number.isFinite(deger)) return yedek;
    return Math.min(max, Math.max(min, Math.round(deger)));
};

const gecerliIsoMu = (d: unknown): d is string =>
    typeof d === 'string' && d.length > 0 && d.length <= 40 && Number.isFinite(Date.parse(d));

/** Diskten gelen ham değeri güvenli ayara çevirir. ASLA fırlatmaz. */
export function takvimCakismaAyarlariniNormalize(ham: unknown): TakvimCakismaAyarlari {
    const v = VARSAYILAN_TAKVIM_CAKISMA_AYARLARI;
    if (!nesneMi(ham)) return { ...v };
    const sonuc: TakvimCakismaAyarlari = {
        aktif: false,
        oncedenDk: sinirla(ham.oncedenDk, TAKVIM_CAKISMA_ONCE_MIN_DK, TAKVIM_CAKISMA_ONCE_MAX_DK, v.oncedenDk),
        baslikGoster: ham.baslikGoster === true,
    };
    if (gecerliIsoMu(ham.rizaZamani)) sonuc.rizaZamani = ham.rizaZamani;
    // Rıza kaydı yoksa özellik AÇIK sayılmaz (rıza uydurulamaz).
    sonuc.aktif = ham.aktif === true && sonuc.rizaZamani !== undefined;
    return sonuc;
}
