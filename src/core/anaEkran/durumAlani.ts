/**
 * Ana ekranın TEK durum alanı — hangi uyarı görünür? SAF.
 *
 * Eskiden vakit kartının üstüne beş bant yığılabiliyordu (sade görünüme dönüş,
 * toparlanma, muhafız, kerahat, seferîlik); kullanıcının ilk gördüğü şey asıl iş
 * (şu anki vakit + Kıldım) değil uyarılardı. Artık aynı anda yalnız EN ÖNEMLİ olan
 * görünür, diğerleri "+N daha" işaretinin arkasında bekler.
 *
 * Öncelik (sahip onaylı plan): kerahat > muhafız > toparlanma > seferîlik > diğer.
 * Kerahat en üstte: işaretleme anını doğrudan etkileyen dini bir bilgi.
 */

export type DurumAnahtari = 'kerahat' | 'muhafiz' | 'toparlanma' | 'seferilik' | 'sadeDonus';

export const DURUM_ONCELIGI: readonly DurumAnahtari[] = ['kerahat', 'muhafiz', 'toparlanma', 'seferilik', 'sadeDonus'];

export interface DurumSecimi {
    /** Görünen tek uyarı (yoksa `null` → alan hiç çizilmez). */
    birincil: DurumAnahtari | null;
    /** "+N daha" arkasındakiler, öncelik sırasıyla. */
    gizlenenler: DurumAnahtari[];
}

/** Etkin uyarıları önceliğe göre dizer; sıra girdiden bağımsızdır, tekrarlar atılır. */
export function durumSec(etkinler: readonly DurumAnahtari[]): DurumSecimi {
    const sirali = DURUM_ONCELIGI.filter((a) => etkinler.includes(a));
    return { birincil: sirali[0] ?? null, gizlenenler: sirali.slice(1) };
}
