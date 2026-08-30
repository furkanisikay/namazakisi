/**
 * Vakit satiri (Katman 1) dinamik ozeti — spec 3 "Her satirda dinamik ozet".
 *
 * SAF: store'a/UI'a bagimli degil. Ozet KALICI DEGIL, ayarlardan turetilir.
 */
import type { VakitMuhafizAyari } from './matrisTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { esikIfadesi } from './seviyeOzeti';
import { adimKapaliMi, kanalAcikMi } from './kanalKumesi';

/**
 * Ornek ciktilar:
 *   "Sadece bildirim · 45 dk kala başlar"
 *   "Sesli + bildirim · 60 dk kala başlar"
 *   "Sadece bildirim · girişten 5 dk sonra başlar"   (giris yonu)
 *   "Kapalı"
 *
 * YON, "ILK uyari hangi adimda?" sorusunun cevabini TERSINE cevirir: cikista
 * eskalasyon en BUYUK esikten baslar, giriste en KUCUKten (vakit girdikten 5 dk
 * sonra). `Math.max`i oldugu gibi birakmak "45 dk sonra baslar" der ama motor
 * 5. dakikada konusur — ekran ile motor ayrisirdi.
 */
export function vakitOzetiOlustur(vakitAyari: VakitMuhafizAyari): string {
  const aktifler = vakitAyari.seviyeler.filter((s) => !adimKapaliMi(s.kanallar));
  if (aktifler.length === 0) return 'Kapalı';

  const bildirimVar = aktifler.some((s) => kanalAcikMi(s.kanallar, 'bildirim'));
  const sesliVar = aktifler.some((s) => kanalAcikMi(s.kanallar, 'sesli'));

  const kanalOzeti = bildirimVar && sesliVar
    ? 'Sesli + bildirim'
    : sesliVar
      ? 'Sadece sesli anons'
      : 'Sadece bildirim';

  const yon = vakitAyari.yon ?? VARSAYILAN_PENCERE_YONU;
  const esikler = aktifler.map((s) => s.esikDk);
  const ilkEsik = yon === 'girisindenItibaren' ? Math.min(...esikler) : Math.max(...esikler);
  return `${kanalOzeti} · ${esikIfadesi(ilkEsik, yon)} başlar`;
}

/** Vakitte kac adim aktif (en az bir kanali acik)? Rozet icin. */
export function aktifSeviyeSayisi(vakitAyari: VakitMuhafizAyari): number {
  return vakitAyari.seviyeler.filter((s) => !adimKapaliMi(s.kanallar)).length;
}
