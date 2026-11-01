// Rumencede `buyuk` elle yazılır (`toUpperCase` YASAK); ș ț VİRGÜLLÜ (U+0219/U+021B), çengelli ş ţ değil.
import type { Sozluk } from '../tr';

/**
 * Rumence vakit adları QuranEnc `romanian_project` meali (17:78 dipnotu) ve HadeethEnc ro takımıdır:
 * Fajr, Dhuhr, Asr, Maghrib, Ișa; güneş "răsăritul soarelui" (50:39). Namaz "rugăciune" (cümle ortasında
 * küçük harf; mealin büyük "Rugăciunea"sı arayüze taşınmaz). Vakit adları özel addır, cümle içinde de büyük
 * harfle başlar; yalnız güneş küçük yazılır. Cuma görünen adı "Jumu’ah" (HadeethEnc "Rugăciunea de Vineri
 * (Jumu'ah)"); çizelgedeki sabah satırı fecir adıdır (Imsak değil). "Kıldım" = "M-am rugat" (1. tekil,
 * cinsiyetsiz), "Kılındı" = "Efectuată" (rugăciunea'ya uyar) — türetildi, yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Răsărit', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Ișa' },
  buyuk: { imsak: 'FAJR', gunes: 'RĂSĂRIT', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'IȘA' },
  kucuk: { imsak: 'Fajr', gunes: 'răsărit', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Ișa' },
  imsakVakti: 'Fajr',
  cuma: 'Jumu’ah',
  cumaKucuk: 'Jumu’ah',
  gunesDogusu: 'Răsăritul soarelui',
  gunesDogusuKucuk: 'răsăritul soarelui',
  durum: { kilindi: 'Efectuată', vaktiGeldi: 'A sosit timpul', girmedi: 'Încă nu e timpul', gecti: 'Neefectuată' },
  durumKucuk: { kilindi: 'efectuată', vaktiGeldi: 'a sosit timpul', girmedi: 'încă nu e timpul', gecti: 'neefectuată' },
  eylem: { kildim: 'M-am rugat', kilindi: 'Efectuată' },
  kerahatVakti: 'Timp makruh',
  isaretle: 'Marcați ca efectuată',
  geriAlEtiketi: '{durum}, atingeți pentru a anula',
  geriAlindi: 'Marcaj eliminat',
};
