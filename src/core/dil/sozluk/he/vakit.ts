// İbranicede büyük/küçük harf yok (`buyuk` = `kucuk` = `adlar`); İbrani harfli, SAĞDAN SOLA.
// Vakit adları he.wikipedia'nın Arapça adları, tanımlıksız (פג'ר · עצר · מגרב · עשאא; geresh ASCII "'");
// "זריחה" ve "ג'ומעה" türetildi. Durum etiketi dişil "תפילה"ya uyar (בוצעה).
import type { Sozluk } from '../tr';

export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: "פג'ר", gunes: 'זריחה', ogle: 'זוהר', ikindi: 'עצר', aksam: 'מגרב', yatsi: 'עשאא' },
  buyuk: { imsak: "פג'ר", gunes: 'זריחה', ogle: 'זוהר', ikindi: 'עצר', aksam: 'מגרב', yatsi: 'עשאא' },
  kucuk: { imsak: "פג'ר", gunes: 'זריחה', ogle: 'זוהר', ikindi: 'עצר', aksam: 'מגרב', yatsi: 'עשאא' },
  imsakVakti: "פג'ר",
  cuma: "ג'ומעה",
  cumaKucuk: "ג'ומעה",
  gunesDogusu: 'זריחה',
  gunesDogusuKucuk: 'זריחה',
  durum: { kilindi: 'בוצעה', vaktiGeldi: 'הגיע הזמן', girmedi: 'עוד לא הגיע', gecti: 'לא בוצעה' },
  durumKucuk: { kilindi: 'בוצעה', vaktiGeldi: 'הגיע הזמן', girmedi: 'עוד לא הגיע', gecti: 'לא בוצעה' },
  eylem: { kildim: 'התפללתי', kilindi: 'בוצעה' },
  kerahatVakti: 'זמן מכרוה',
  isaretle: 'סימון כבוצעה',
  geriAlEtiketi: '{durum}, הקישו לביטול',
  geriAlindi: 'הסימון הוסר',
};
