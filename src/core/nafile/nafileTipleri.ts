/**
 * Nafile namaz vakitleri (issue #77) — tipler ve varsayılanlar.
 *
 * Tasarım: docs/superpowers/specs/2026-10-12-nafile-namaz-vakitleri-design.md
 * (Fable incelemesinden geçen nihai hali "Nihai kararlar" bölümündedir).
 */

/** Gündüz/akşam nafileleri — kullanıcı ofsetiyle tek atışlık hatırlatma. */
export type GunduzNafile = 'kusluk' | 'evvabin';

export type NafileTuru = GunduzNafile | 'teheccud';

/**
 * Teheccüd hatırlatmasının hedef anı.
 * - `sonUcteBir`: gecenin son üçte biri (akşam → ertesi imsak; adhan `SunnahTimes` ile birebir)
 * - `imsaktanOnce`: imsaktan N dk önce
 */
export type TeheccudHedefi = 'sonUcteBir' | 'imsaktanOnce';

export interface GunduzHatirlatmaAyari {
    aktif: boolean;
    /** Pencere başından kaç dk sonra hatırlatılsın. */
    ofsetDk: number;
}

export interface TeheccudAyari {
    aktif: boolean;
    hedef: TeheccudHedefi;
    /** `hedef === 'imsaktanOnce'` iken kullanılır. */
    imsaktanOnceDk: number;
    /**
     * Uyandırma: alarm ses kanalı (sessiz modu deler) + 3 dk sonra ikinci hatırlatma.
     * Kapalıyken normal vakit bildirimi kanalından tek bildirim gider.
     */
    uyandirma: boolean;
}

export interface NafileAyarlari {
    /** Ana ekranda nafile şeridi. */
    gostergeAktif: boolean;
    hatirlatmalar: Record<GunduzNafile, GunduzHatirlatmaAyari>;
    teheccud: TeheccudAyari;
    /**
     * Hatırlatmalar yalnız BUGÜN (ve sürmekte olan gece) için kurulsun mu?
     * (issue #298 — iOS 64 bildirim sınırı rehberinin önerisi.) Alan YOKSA
     * `false`: gündüz 3 gün, teheccüd 7 gece ileri kurulur.
     */
    gunuGununeKur?: boolean;
}

export const NAFILE_OFSET_MIN_DK = 5;
export const NAFILE_OFSET_MAX_DK = 120;
export const NAFILE_OFSET_ADIM_DK = 5;

export const TEHECCUD_IMSAK_ONCESI_MIN_DK = 15;
export const TEHECCUD_IMSAK_ONCESI_MAX_DK = 120;
export const TEHECCUD_IMSAK_ONCESI_ADIM_DK = 15;

/**
 * Varsayılanlar: HEPSİ KAPALI (nafile gönüllüdür, ayardan açılır).
 * Kuşluk ofseti 5 dk → pratikte "işrak" (kuşluğun ilk vakti); evvâbîn 15 dk →
 * akşamın farzı ve sünneti kılınmış sayılır.
 */
export const VARSAYILAN_NAFILE_AYARLARI: NafileAyarlari = {
    gostergeAktif: false,
    hatirlatmalar: {
        kusluk: { aktif: false, ofsetDk: 5 },
        evvabin: { aktif: false, ofsetDk: 15 },
    },
    teheccud: {
        aktif: false,
        hedef: 'sonUcteBir',
        imsaktanOnceDk: 60,
        uyandirma: false,
    },
};

/** Görünen adlar (Title Case) — büyük/küçük harf dönüşümü YAPILMAZ (Türkçe İ tuzağı). */
export const NAFILE_ADLARI: Record<NafileTuru, string> = {
    kusluk: 'Kuşluk',
    evvabin: 'Evvâbîn',
    teheccud: 'Teheccüd',
};
