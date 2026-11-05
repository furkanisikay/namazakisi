// Sebuano (Latin; uygulama kodu `ceb`, Android kaynağı `values-b+ceb`): `buyuk` elle yazılır (`toUpperCase` YASAK).
import type { Sozluk } from '../tr';

/**
 * Vakit adları: meal (QuranEnc `bisayan_rwwad`) yalnız Fajr ve Maghrib'i Arapça verir; Dhuhr, Asr
 * ve Isha Filipince (`fil`) dizisine paralel kuruldu (ana oturum kararı, türetildi). Güneş doğuşu
 * "pagsubang sa adlaw" (QE 20:130). Arapça adlar özel addır, cümle içinde de büyük harfle başlar.
 * Namaz "Salah" (isim), kılmak "mag-ampo" (QE 2:43, 2:127); "Kıldım" = "Nag-ampo ko" ve durum
 * "Nakaampo na" (gündelik "Nakaampo na ka?" kalıbı) türetildi; "naampo" kullanılmaz ("ampoon" = bir şey
 * için dua etmek), namaz nesne olunca "nahimo" ("nahimo nga Salah"). Kerahat vakti karşılığı
 * DOĞRULANMADI ("makruh" alıntısı). Yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Pagsubang sa adlaw', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'FAJR', gunes: 'PAGSUBANG SA ADLAW', ogle: 'DHUHR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Fajr', gunes: 'pagsubang sa adlaw', ogle: 'Dhuhr', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Fajr',
  cuma: "Jum'ah",
  cumaKucuk: "Jum'ah",
  gunesDogusu: 'Pagsubang sa adlaw',
  gunesDogusuKucuk: 'pagsubang sa adlaw',
  durum: { kilindi: 'Nakaampo na', vaktiGeldi: 'Oras na', girmedi: 'Dili pa oras', gecti: 'Wala makaampo' },
  durumKucuk: { kilindi: 'nakaampo na', vaktiGeldi: 'oras na', girmedi: 'dili pa oras', gecti: 'wala makaampo' },
  eylem: { kildim: 'Nag-ampo ko', kilindi: 'Nakaampo na' },
  kerahatVakti: 'Makruh nga oras',
  isaretle: 'Markahi nga nakaampo na',
  geriAlEtiketi: '{durum}, i-tap aron bawion',
  geriAlindi: 'Gikuha ang marka',
};
