// Makedonca Kiril: `buyuk` elle yazılır (`toUpperCase` YASAK; ѓ ќ ѕ џ љ њ ј → Ѓ Ќ Ѕ Џ Љ Њ Ј).
import type { Sozluk } from '../tr';

/**
 * Makedonca vakit adları HadeethEnc mk ve QuranEnc `macedonian_group`'tan (Boşnakçayla ortak):
 * сабах · изгрејсонце · пладне · икиндија · акшам · јација; cuma "џума" (HadeethEnc "џума намаз").
 * Çizelgedeki sabah satırı (fecir) da kaynaklı "Сабах" (mk kaynakta ayrı fecir adı yok). Vakit adı
 * cümle içinde küçük harf. "Kıldım" kaynaklı aorist "Клањав" (HadeethEnc mk 10945, cinsiyetsiz);
 * "Kılındı" kişisiz "Клањано" (bs "Klanjano" emsali) — türetildi. Kerahat "мекрух време" (sr emsali,
 * mk kaynakta terim yok, DOĞRULANMADI).
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Сабах', gunes: 'Изгрејсонце', ogle: 'Пладне', ikindi: 'Икиндија', aksam: 'Акшам', yatsi: 'Јација' },
  buyuk: { imsak: 'САБАХ', gunes: 'ИЗГРЕЈСОНЦЕ', ogle: 'ПЛАДНЕ', ikindi: 'ИКИНДИЈА', aksam: 'АКШАМ', yatsi: 'ЈАЦИЈА' },
  kucuk: { imsak: 'сабах', gunes: 'изгрејсонце', ogle: 'пладне', ikindi: 'икиндија', aksam: 'акшам', yatsi: 'јација' },
  imsakVakti: 'Сабах',
  cuma: 'Џума',
  cumaKucuk: 'џума',
  gunesDogusu: 'Изгрејсонце',
  gunesDogusuKucuk: 'изгрејсонце',
  durum: { kilindi: 'Клањано', vaktiGeldi: 'Настапи времето', girmedi: 'Уште не е време', gecti: 'Не е клањано' },
  durumKucuk: { kilindi: 'клањано', vaktiGeldi: 'настапи времето', girmedi: 'уште не е време', gecti: 'не е клањано' },
  /** "Клањав" aorist 1. tekil, cinsiyetsiz (HadeethEnc mk); durum etiketi kişisiz "Клањано". */
  eylem: { kildim: 'Клањав', kilindi: 'Клањано' },
  kerahatVakti: 'Мекрух време',
  isaretle: 'Означете како клањано',
  geriAlEtiketi: '{durum}, допрете за поништување',
  geriAlindi: 'Ознаката е отстранета',
};
