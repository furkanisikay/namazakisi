/**
 * Namaz durumunun TEK sözlüğü (sade tasarım, Dalga 1) — SAF.
 *
 * Bugün aynı kavram beş farklı adla görünüyor ("Kılındı / Bekliyor / Vakti Bekleniyor /
 * Vakit Girmedi / Vakti Geldi • Şimdi Kıl"). Yeni ekranlar yalnız buradaki üç durumu
 * ve tek eylem adını kullanır; Dalga 2 mevcut yüzeyleri buna taşır.
 *
 * Renk asla tek başına bilgi taşımaz: her durumun kendi İKONU (şekli) ve METNİ vardır.
 */

import { canli } from '../dil/aktifDil';

export type NamazDurumu = 'kilindi' | 'vaktiGeldi' | 'girmedi' | 'gecti';

export interface NamazDurumuTanimi {
    /** Kullanıcıya görünen ad (sentence case). */
    etiket: string;
    /** FontAwesome5 ikon adı — şekil durumu renkten bağımsız anlatır. */
    ikon: string;
    /** Tema rengi anahtarı (`useRenkler()` alanı). */
    renk: 'basarili' | 'birincil' | 'metinIkincil';
}

/** Görünüm (ikon, renk) sabittir; etiket etkin dilin sözlüğünden gelir (canlı görünüm). */
const GORUNUM: Record<NamazDurumu, Omit<NamazDurumuTanimi, 'etiket'>> = {
    kilindi: { ikon: 'check-circle', renk: 'basarili' },
    vaktiGeldi: { ikon: 'bell', renk: 'birincil' },
    girmedi: { ikon: 'hourglass-start', renk: 'metinIkincil' },
    /** Vakti çıktı ve işaretlenmedi (geçmiş gün ya da bugünün çıkmış vakti). */
    gecti: { ikon: 'minus-circle', renk: 'metinIkincil' },
};

export const NAMAZ_DURUMLARI: Readonly<Record<NamazDurumu, NamazDurumuTanimi>> = canli((s) => ({
    kilindi: { etiket: s.vakit.durum.kilindi, ...GORUNUM.kilindi },
    vaktiGeldi: { etiket: s.vakit.durum.vaktiGeldi, ...GORUNUM.vaktiGeldi },
    girmedi: { etiket: s.vakit.durum.girmedi, ...GORUNUM.girmedi },
    gecti: { etiket: s.vakit.durum.gecti, ...GORUNUM.gecti },
}));

/** Durumun cümle içi küçük hâli (ekran okuyucu; `toLowerCase` Türkçe İ tuzağı → sözlük). */
export const NAMAZ_DURUMLARI_KUCUK: Readonly<Record<NamazDurumu, string>> = canli((s) => s.vakit.durumKucuk);

/** Tek eylem adı: düğme "Kıldım", sonuç "Kılındı" (aksiyon adı akış boyunca sabit). */
export const NAMAZ_EYLEMI: Readonly<{ kildim: string; kilindi: string }> = canli((s) => s.vakit.eylem);

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
