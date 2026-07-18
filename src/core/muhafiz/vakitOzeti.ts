/**
 * Vakit satiri (Katman 1) dinamik ozeti — spec 3 "Her satirda dinamik ozet".
 *
 * SAF: store'a/UI'a bagimli degil. Ozet KALICI DEGIL, ayarlardan turetilir.
 */
import type { VakitMuhafizAyari } from './matrisTipleri';

/**
 * Ornek ciktilar:
 *   "Sadece bildirim · 45 dk kala başlar"
 *   "Sesli + bildirim · 60 dk kala başlar"
 *   "Kapalı"
 */
export function vakitOzetiOlustur(vakitAyari: VakitMuhafizAyari): string {
  const aktifler = vakitAyari.seviyeler.filter((s) => s.mod !== 'sessiz');
  if (aktifler.length === 0) return 'Kapalı';

  const bildirimVar = aktifler.some((s) => s.mod === 'bildirim' || s.mod === 'ikisi');
  const sesliVar = aktifler.some((s) => s.mod === 'sesli' || s.mod === 'ikisi');

  const modOzeti = bildirimVar && sesliVar
    ? 'Sesli + bildirim'
    : sesliVar
      ? 'Sadece sesli anons'
      : 'Sadece bildirim';

  const enErkenEsik = Math.max(...aktifler.map((s) => s.esikDk));
  return `${modOzeti} · ${enErkenEsik} dk kala başlar`;
}

/** Vakitte kac adim aktif (sessiz olmayan)? Rozet icin. */
export function aktifSeviyeSayisi(vakitAyari: VakitMuhafizAyari): number {
  return vakitAyari.seviyeler.filter((s) => s.mod !== 'sessiz').length;
}
