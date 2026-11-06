// Sırpça KİRİL yazılır (Latin seçenek yok): `buyuk` elle (`toUpperCase` YASAK; ђ ј љ њ ћ џ → Ђ Ј Љ Њ Ћ Џ).
import type { Sozluk } from '../tr';

/**
 * Sırpça vakit adları HadeethEnc sr (Kiril, ekavyen) ve sr.wikipedia "Намаз (ислам)"dan:
 * сабах · излазак сунца · подне · икиндија · акшам · јација. Çizelgedeki sabah satırı (fecir)
 * "Зора" (HadeethEnc "зора"; Boşnakça vaktija emsali). Vakit adı cümle içinde küçük harf.
 * "Kıldım"/"Kılındı" kişisiz edilgen "Клањано" (geçmiş zaman cinsiyetli; bs "Klanjano" emsali) — türetildi.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Сабах', gunes: 'Излазак сунца', ogle: 'Подне', ikindi: 'Икиндија', aksam: 'Акшам', yatsi: 'Јација' },
  buyuk: { imsak: 'САБАХ', gunes: 'ИЗЛАЗАК СУНЦА', ogle: 'ПОДНЕ', ikindi: 'ИКИНДИЈА', aksam: 'АКШАМ', yatsi: 'ЈАЦИЈА' },
  kucuk: { imsak: 'сабах', gunes: 'излазак сунца', ogle: 'подне', ikindi: 'икиндија', aksam: 'акшам', yatsi: 'јација' },
  imsakVakti: 'Зора',
  cuma: 'Џума',
  cumaKucuk: 'џума',
  gunesDogusu: 'Излазак сунца',
  gunesDogusuKucuk: 'излазак сунца',
  durum: { kilindi: 'Клањано', vaktiGeldi: 'Наступило је време', girmedi: 'Још није наступило', gecti: 'Није клањано' },
  durumKucuk: { kilindi: 'клањано', vaktiGeldi: 'наступило је време', girmedi: 'још није наступило', gecti: 'није клањано' },
  /** Cinsiyetsiz kalıp: "клањао/клањала сам" yerine edilgen "Клањано". */
  eylem: { kildim: 'Клањано', kilindi: 'Клањано' },
  kerahatVakti: 'Мекрух време',
  isaretle: 'Означи као клањано',
  geriAlEtiketi: '{durum}, додирните да поништите',
  geriAlindi: 'Ознака уклоњена',
};
