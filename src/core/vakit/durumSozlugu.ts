/**
 * Namaz durumunun TEK sözlüğü (sade tasarım, Dalga 1) — SAF.
 *
 * Bugün aynı kavram beş farklı adla görünüyor ("Kılındı / Bekliyor / Vakti Bekleniyor /
 * Vakit Girmedi / Vakti Geldi • Şimdi Kıl"). Yeni ekranlar yalnız buradaki üç durumu
 * ve tek eylem adını kullanır; Dalga 2 mevcut yüzeyleri buna taşır.
 *
 * Renk asla tek başına bilgi taşımaz: her durumun kendi İKONU (şekli) ve METNİ vardır.
 */

export type NamazDurumu = 'kilindi' | 'vaktiGeldi' | 'girmedi' | 'gecti';

export interface NamazDurumuTanimi {
    /** Kullanıcıya görünen ad (sentence case). */
    etiket: string;
    /** FontAwesome5 ikon adı — şekil durumu renkten bağımsız anlatır. */
    ikon: string;
    /** Tema rengi anahtarı (`useRenkler()` alanı). */
    renk: 'basarili' | 'birincil' | 'metinIkincil';
}

export const NAMAZ_DURUMLARI: Record<NamazDurumu, NamazDurumuTanimi> = {
    kilindi: { etiket: 'Kılındı', ikon: 'check-circle', renk: 'basarili' },
    vaktiGeldi: { etiket: 'Vakti geldi', ikon: 'bell', renk: 'birincil' },
    girmedi: { etiket: 'Henüz girmedi', ikon: 'hourglass-start', renk: 'metinIkincil' },
    /** Vakti çıktı ve işaretlenmedi (geçmiş gün ya da bugünün çıkmış vakti). */
    gecti: { etiket: 'Kılınmadı', ikon: 'minus-circle', renk: 'metinIkincil' },
};

/** Tek eylem adı: düğme "Kıldım", sonuç "Kılındı" (aksiyon adı akış boyunca sabit). */
export const NAMAZ_EYLEMI = { kildim: 'Kıldım', kilindi: 'Kılındı' } as const;

/**
 * Bir vaktin görünen durumu: kılındıysa `kilindi`; vakti ÇIKMIŞSA (geçmiş gün ya da
 * bugünün geçmiş vakti) `gecti` ("Kılınmadı"); vakti girmiş ve sürüyorsa `vaktiGeldi`;
 * girmemişse `girmedi`. Çıkmış vakte "Vakti geldi" demek yanıltıcıydı.
 */
export function namazDurumuSec(kilindi: boolean, vaktiGirdi: boolean, vaktiCikti = false): NamazDurumu {
    if (kilindi) return 'kilindi';
    if (vaktiCikti) return 'gecti';
    return vaktiGirdi ? 'vaktiGeldi' : 'girmedi';
}
