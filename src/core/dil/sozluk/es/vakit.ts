import type { Sozluk } from '../tr';

/**
 * İspanyolcada vakit adları (Diyanet ES ile uyumlu, Latin harfli yaygın biçim): Fajr, Salida del sol,
 * Dhuhr, Asr, Maghrib, Isha; cuma "Yumu’a" (kesme işareti hep ’ U+2019, Android kaçışı gerekmez).
 * Vakit adları özel addır, cümle içinde de büyük harfle başlar; yalnız "salida del sol" küçük harflidir.
 * Namaz = "rezo" (eril): durum "Rezado", düğme "Ya recé". Kaza = "qada", nafile = "nafila",
 * kıble = "alquibla". Hitap "usted" (fiil 3. tekil), "tú" yok; "¡…!" ve "por favor" yok.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Salida del sol', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'SALIDA DEL SOL', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'salida del sol', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  /** Çizelgedeki sabah satırı fecrin girişidir (Imsak ihtiyat saati değil). */
  imsakVakti: 'Fajr',
  cuma: 'Yumu’a',
  cumaKucuk: 'Yumu’a',
  gunesDogusu: 'Salida del sol',
  gunesDogusuKucuk: 'salida del sol',
  durum: { kilindi: 'Rezado', vaktiGeldi: 'Es la hora', girmedi: 'Aún no es la hora', gecti: 'No rezado' },
  durumKucuk: { kilindi: 'rezado', vaktiGeldi: 'es la hora', girmedi: 'aún no es la hora', gecti: 'no rezado' },
  eylem: { kildim: 'Ya recé', kilindi: 'Rezado' },
  kerahatVakti: 'Tiempo makruh',
  isaretle: 'Marcar como rezado',
  geriAlEtiketi: '{durum}, toque para deshacer',
  geriAlindi: 'Marca quitada',
};
