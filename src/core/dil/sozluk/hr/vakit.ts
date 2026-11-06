// Hırvatçada `buyuk` elle yazılır (`toUpperCase` YASAK; č ć đ š ž → Č Ć Đ Š Ž).
import type { Sozluk } from '../tr';

/**
 * Hırvatça vakit adları IZH'nin kullandığı vaktija.eu (Zagreb) takımıdır: Sabah · Izlazak Sunca · Podne ·
 * Ikindija · Akšam · Jacija. Zagreb çizelgesinde "Zora" yok → çizelge satırı (`imsakVakti`) da "Sabah".
 * Vakit adı cümle içinde küçük harfle yazılır; "Sunce" gök cismi adı olarak büyük (vaktija.eu yazımı).
 * "Namaz" Hırvatçada ekmeğe sürülen yiyecek de demektir → tek sözcüklük etiket yerine bileşik kullanılır.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Sabah', gunes: 'Izlazak Sunca', ogle: 'Podne', ikindi: 'Ikindija', aksam: 'Akšam', yatsi: 'Jacija' },
  buyuk: { imsak: 'SABAH', gunes: 'IZLAZAK SUNCA', ogle: 'PODNE', ikindi: 'IKINDIJA', aksam: 'AKŠAM', yatsi: 'JACIJA' },
  kucuk: { imsak: 'sabah', gunes: 'izlazak Sunca', ogle: 'podne', ikindi: 'ikindija', aksam: 'akšam', yatsi: 'jacija' },
  imsakVakti: 'Sabah',
  cuma: 'Džuma',
  cumaKucuk: 'džuma',
  gunesDogusu: 'Izlazak Sunca',
  gunesDogusuKucuk: 'izlazak Sunca',
  durum: { kilindi: 'Klanjano', vaktiGeldi: 'Vrijeme je nastupilo', girmedi: 'Još nije nastupilo', gecti: 'Nije klanjano' },
  durumKucuk: { kilindi: 'klanjano', vaktiGeldi: 'vrijeme je nastupilo', girmedi: 'još nije nastupilo', gecti: 'nije klanjano' },
  /** Hırvatçada 1. tekil geçmiş zaman cinsiyetlidir (klanjao/klanjala sam) → kişisiz edilgen "Klanjano". */
  eylem: { kildim: 'Klanjano', kilindi: 'Klanjano' },
  kerahatVakti: 'Mekruh vrijeme',
  isaretle: 'Označi kao klanjano',
  geriAlEtiketi: '{durum}, dodirnite za poništavanje',
  geriAlindi: 'Oznaka je uklonjena',
};
