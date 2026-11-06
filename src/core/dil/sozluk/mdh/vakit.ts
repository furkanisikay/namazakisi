// Maguindanaoda `buyuk` elle yazılır (`toUpperCase` YASAK).
import type { Sozluk } from '../tr';

/**
 * Vakit adları QuranEnc `maguindanao_rwwad` 17:78 yazımının kesmesiz biçimi: "sub'h" → Subuh,
 * "dhuhur", "as'r" → Asr (2:238 "su sambayang a Asr"), "maghrib", "isha" (türetildi: kesme
 * arayüzde atıldı). Güneş doğuşu "kasebang nu senang" mealin "güneşin doğuşu" söyleyişinden
 * (6:158 "kasebang nu senang"; vakit adı olarak türetildi). Arapça adlar özel addır, cümle içinde
 * de büyük harfle başlar. Namaz "sambayang", kılmak "edsambayang" (QE 2:43, 5:6). "Kıldım" =
 * "Midsambayang ako": geçmiş zaman "midsambayang" mealde kaynaklı (9:5, 87:15), "ako" ile kişi
 * türetildi; durum "Midsambayang" aynı fiil. Kerahat vakti karşılığı DOĞRULANMADI ("makruh"
 * alıntısı). Yerli okuyucuyla DOĞRULANMADI.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subuh', gunes: 'Kasebang nu senang', ogle: 'Dhuhur', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  buyuk: { imsak: 'SUBUH', gunes: 'KASEBANG NU SENANG', ogle: 'DHUHUR', ikindi: 'ASR', aksam: 'MAGHRIB', yatsi: 'ISHA' },
  kucuk: { imsak: 'Subuh', gunes: 'kasebang nu senang', ogle: 'Dhuhur', ikindi: 'Asr', aksam: 'Maghrib', yatsi: 'Isha' },
  imsakVakti: 'Subuh',
  cuma: "Jum'at",
  cumaKucuk: "Jum'at",
  gunesDogusu: 'Kasebang nu senang',
  gunesDogusuKucuk: 'kasebang nu senang',
  durum: { kilindi: 'Midsambayang', vaktiGeldi: 'Waktu den', girmedi: 'Da pan waktu', gecti: 'Da makasambayang' },
  durumKucuk: { kilindi: 'midsambayang', vaktiGeldi: 'waktu den', girmedi: 'da pan waktu', gecti: 'da makasambayang' },
  eylem: { kildim: 'Midsambayang ako', kilindi: 'Midsambayang' },
  kerahatVakti: 'Waktu a makruh',
  isaretle: 'Tandaan a midsambayang',
  geriAlEtiketi: '{durum}, i-tap para batalen',
  geriAlindi: 'Nakwa su tanda',
};
