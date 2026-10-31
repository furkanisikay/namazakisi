// Vietnamcada büyük harf var: `buyuk` ses işaretli büyük harfle ELLE yazılır (`toUpperCase` YASAK; ör. ĐẠI değil sözlükte hazır biçim).
import type { Sozluk } from '../tr';

/**
 * Vakit adları QuranEnc `vietnamese_rwwad` meali ve IslamHouse Vietnamca yazımıyla (harf çevirisi,
 * özel ad: cümle içinde de büyük harfle başlar). Kesme işaretleri tipografik: ‘Asr (U+2018),
 * ‘Isha’ (U+2018…U+2019), Jumu’ah (U+2019). Namaz "Salah" (cầu nguyện = dua, KULLANILMAZ).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fajr', gunes: 'Mặt trời mọc', ogle: 'Zhuhr', ikindi: '‘Asr', aksam: 'Maghrib', yatsi: '‘Isha’' },
  buyuk: { imsak: 'FAJR', gunes: 'MẶT TRỜI MỌC', ogle: 'ZHUHR', ikindi: '‘ASR', aksam: 'MAGHRIB', yatsi: '‘ISHA’' },
  kucuk: { imsak: 'Fajr', gunes: 'mặt trời mọc', ogle: 'Zhuhr', ikindi: '‘Asr', aksam: 'Maghrib', yatsi: '‘Isha’' },
  imsakVakti: 'Fajr',
  cuma: 'Jumu’ah',
  cumaKucuk: 'Jumu’ah',
  gunesDogusu: 'Mặt trời mọc',
  gunesDogusuKucuk: 'mặt trời mọc',
  durum: { kilindi: 'Đã hành lễ', vaktiGeldi: 'Đã vào giờ', girmedi: 'Chưa vào giờ', gecti: 'Chưa hành lễ' },
  durumKucuk: { kilindi: 'đã hành lễ', vaktiGeldi: 'đã vào giờ', girmedi: 'chưa vào giờ', gecti: 'chưa hành lễ' },
  eylem: { kildim: 'Tôi đã hành lễ', kilindi: 'Đã hành lễ' },
  kerahatVakti: 'Thời điểm cấm',
  isaretle: 'Đánh dấu đã hành lễ',
  geriAlEtiketi: '{durum}, chạm để hoàn tác',
  geriAlindi: 'Đã bỏ đánh dấu',
};
