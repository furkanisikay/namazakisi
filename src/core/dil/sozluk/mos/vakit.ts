// Moorede `buyuk` elle yazılır (`toUpperCase` YASAK; ɛ ɩ ʋ → Ɛ Ɩ Ʋ, nazal ünlü tildesi korunur).
import type { Sozluk } from '../tr';

/** Vakit adları HadeethEnc mos'tan (Fagir · Wĩntoog pukri · Zafar · Laansar · Magrib · Sãanfo); özel ad, cümle içinde de büyük harfle. */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Fagir', gunes: 'Wĩntoog pukri', ogle: 'Zafar', ikindi: 'Laansar', aksam: 'Magrib', yatsi: 'Sãanfo' },
  buyuk: { imsak: 'FAGIR', gunes: 'WĨNTOOG PUKRI', ogle: 'ZAFAR', ikindi: 'LAANSAR', aksam: 'MAGRIB', yatsi: 'SÃANFO' },
  kucuk: { imsak: 'Fagir', gunes: 'wĩntoog pukri', ogle: 'Zafar', ikindi: 'Laansar', aksam: 'Magrib', yatsi: 'Sãanfo' },
  imsakVakti: 'Fagir',
  cuma: 'Arzũma',
  cumaKucuk: 'Arzũma',
  gunesDogusu: 'Wĩntoog pukri',
  gunesDogusuKucuk: 'wĩntoog pukri',
  durum: { kilindi: 'Pʋʋsa', vaktiGeldi: 'Pʋʋsg wakatã ta', girmedi: 'Wakatã nan ka ta ye', gecti: 'Ka pʋʋs ye' },
  durumKucuk: { kilindi: 'pʋʋsa', vaktiGeldi: 'pʋʋsg wakatã ta', girmedi: 'wakatã nan ka ta ye', gecti: 'ka pʋʋs ye' },
  eylem: { kildim: 'M pʋʋsa', kilindi: 'Pʋʋsa' },
  kerahatVakti: 'Gɩdg wakato',
  isaretle: 'Gʋls-y tɩ y pʋʋsa',
  geriAlEtiketi: '{durum}, dig-y n lebs-a',
  geriAlindi: 'B yika gʋlsgã',
};
