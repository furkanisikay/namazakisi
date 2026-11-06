import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile "תפילת רשות" (QE 17:79), teheccüd "תהאג'וד" (he.wikipedia); דוחא ve אוואבין harf çevirisi (türetildi). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'דוחא', evvabin: 'אוואבין', teheccud: "תהאג'וד" },
  kucuk: { kusluk: 'דוחא', evvabin: 'אוואבין', teheccud: "תהאג'וד" },
  aciklamalar: {
    kusluk:
      'מתחיל כ-45 דקות אחרי הזריחה ונמשך עד 10 דקות לפני זמן זוהר. אשראק הוא הזמן המוקדם ביותר שלו; העדיף ביותר הוא אחרי שחלף הרבע הראשון של היום.',
    evvabin: 'מתפללים אותה אחרי תפילת מגרב, עד זמן עשאא.',
    teheccud: "מתפללים אותה אחרי עשאא, לאחר שינה והתעוררות, עד זמן פג'ר. הזמן העדיף ביותר הוא השליש האחרון של הלילה.",
  },
  bilgiBugun: '{aciklama}\n\nהיום: {bas} – {son}',
  enFaziletli: ' · העדיף ביותר אחרי {saat}',
  sonUcteBir: ' · השליש האחרון {saat}',
  durumAktif: 'הזמן הגיע · סיום {saat}',
  durumNafile: 'רשות · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'זמן דוחא',
    kuslukSuruyor: 'זמן דוחא נמשך; אפשר להתפלל עד {son}.',
    kuslukGirdi: 'זמן דוחא הגיע. רגע טוב לשתי רכעות; הזמן נמשך עד {son}.',
    kuslukBitiyor: cogul({
      one: 'נותרה {n} דקה עד סוף זמן דוחא. רגע טוב לשתי רכעות; הזמן נמשך עד {son}.',
      two: 'נותרו {n} דקות עד סוף זמן דוחא. רגע טוב לשתי רכעות; הזמן נמשך עד {son}.',
      other: 'נותרו {n} דקות עד סוף זמן דוחא. רגע טוב לשתי רכעות; הזמן נמשך עד {son}.',
    }),
    evvabinBaslik: 'אוואבין',
    evvabinSuruyor: 'עדיין יש זמן לאוואבין. זמן עשאא: {son}.',
    evvabinGirdi: 'אחרי תפילת מגרב, רגע טוב לאוואבין. זמן עשאא: {son}.',
    evvabinKalan: cogul({ one: 'נותרה {n} דקה לאוואבין. זמן עשאא: {son}.', two: 'נותרו {n} דקות לאוואבין. זמן עשאא: {son}.', other: 'נותרו {n} דקות לאוואבין. זמן עשאא: {son}.' }),
    teheccudBaslik: "זמן תהאג'וד",
    uyandirSonUcte: "קומו; השליש האחרון של הלילה הגיע. זמן פג'ר: {son}.",
    uyandirKalan: cogul({ one: "קומו; נותרה {n} דקה עד פג'ר. זמן פג'ר: {son}.", two: "קומו; נותרו {n} דקות עד פג'ר. זמן פג'ר: {son}.", other: "קומו; נותרו {n} דקות עד פג'ר. זמן פג'ר: {son}." }),
    sonUcteBaslik: 'השליש האחרון של הלילה',
    sonUcteGovde: "השעות המבורכות ביותר לתהאג'וד. זמן פג'ר: {son}.",
    teheccudKalan: cogul({ one: "נותרה {n} דקה עד פג'ר. זמן טוב לתהאג'וד.", two: "נותרו {n} דקות עד פג'ר. זמן טוב לתהאג'וד.", other: "נותרו {n} דקות עד פג'ר. זמן טוב לתהאג'וד." }),
  },
  uyandirmaKanali: "השכמה לתהאג'וד",
  uyandirmaKanaliAciklama: 'מעיר לתפילת הלילה; מצלצל גם במצב שקט',
};
