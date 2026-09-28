/**
 * Özel gün (seri dondurma) vurgusu — "Özel Gün Başlat" ve "Modu Başlat" gibi
 * dolu butonların zemini, ilgili ikon ve başlıkların rengi.
 *
 * Temada pembe token YOK; bu yüzden tek yerde sabit olarak tutulur (AGENTS.md:
 * "Token ≠ en yakın görünen renk"). `renkler.birincil`'e bağlamak yanlış olurdu:
 * beyaz metin varsayılan birincil yeşil (#4CAF50) üstünde yalnız 2,78:1 verir
 * (WCAG AA 4,5:1 altı). #D81B60 beyaz metinle 4,95:1 → AA geçer.
 */
export const OZEL_GUN_RENGI = '#D81B60';
