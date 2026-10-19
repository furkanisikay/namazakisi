/**
 * Kıble ekranı sabitleri.
 *
 * KİSVE RENKLERİ — "ASLA hardcoded renk" kuralının bilinçli istisnası (Seri gök paneli
 * deseni): Kâbe çizimi kisvenin kendisidir (siyah örtü + altın kuşak), temaya göre renk
 * değiştirmesi onu başka bir şeye çevirirdi. YALNIZ dekoratif çizimde kullanılır; hiçbir
 * metin bu renklerde değildir. Koyu temada siyah küp zeminde kaybolmasın diye çizime
 * tema `sinir` renginde ince bir kontur eklenir (KabeSimgesi).
 */
export const KISVE_SIYAHI = '#17171A';
export const KISVE_YUZ_ACIK = '#2A2A30'; // küpün ışık alan yan yüzü
export const KISVE_ALTINI = '#C9A54A';

/** Pusula kadranının ekrana oranı ve 3B eğiminin üst sınırı. */
export const KADRAN_ORANI = 0.78;
/** Telefon tamamen dik olduğunda kadranın yere yatma açısı (derece). */
export const KADRAN_AZAMI_YATIS = 62;
/** RN perspektifi (px): küçük değer abartılı derinlik verir. */
export const KADRAN_PERSPEKTIF = 900;
