import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: cinsiyetsiz 2. çoğul emir (התפללו, עמדו לתפילה), kısa; secde yok.
 * Sıra Türkçe şablonlarla BİREBİR eşleşir. `{yön}` fiildir ("נותרו" / "עברו") ve sayıdan önce gelir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'נותרו', girisindenItibaren: 'עברו' },
  cip: { vakit: 'שם התפילה', sure: 'דקות', yon: 'נותרו / עברו', cuma: "ג'ומעה", yatsi: 'עשאא' },
  sablon: {
    muhafizCikis: [
      'זמן {vakit} מסתיים, נותרו {süre} דקות.',
      'אל תחמיצו את תפילת {vakit}, נותרו {süre} דקות.',
      'הזמן אוזל, נותרו {süre} דקות לתפילת {vakit}.',
    ],
    muhafizGiris: [
      'זמן {vakit} הגיע, עברו {süre} דקות.',
      'אל תדחו את תפילת {vakit}, עברו כבר {süre} דקות.',
      'הזמן מתקדם, עמדו לתפילת {vakit}, עברו {süre} דקות.',
    ],
    nafile: [
      'זמן {vakit}, {yön} {süre} דקות. רגע טוב לשתי רכעות.',
      'זמן {vakit} נמשך. הזדמנות טובה להתפלל שתי רכעות.',
      '{yön} {süre} דקות לזמן {vakit}.',
    ],
    cuma: [
      "נותרו {süre} דקות לתפילת ג'ומעה. התכוננו וצאו למסגד.",
      "זמן ג'ומעה מתקרב, נותרו {süre} דקות.",
      "הגיעו בזמן לחוטבה, נותרו {süre} דקות לג'ומעה.",
    ],
    camiyeGit: [
      'נותרו {süre} דקות לזמן {vakit}. צאו למסגד.',
      'הגיע הזמן ללכת למסגד, עוד {süre} דקות לזמן {vakit}.',
      'צאו למסגד לתפילת {vakit}.',
    ],
    yatis: ['התפללו עשאא לפני השינה.', 'זמן עשאא עדיין נמשך, עמדו לתפילה לפני שתישנו.', 'אל תישנו לפני שתתפללו עשאא.'],
    takvim: [
      'אירוע ביומן שלכם חל בזמן {vakit}.',
      'זמן {vakit} מתנגש עם אירוע; אל תשכחו להתפלל קודם.',
      'בעוד {süre} דקות זמן {vakit} מתנגש עם האירוע שלכם; אל תשכחו את התפילה.',
    ],
  },
  otomatik: {
    cuma: "עוד {sure} עד זמן זוהר לג'ומעה. התכוננו וצאו למסגד.",
    camiyeGiris: 'עוד {sure} לזמן {vakit}.',
    camiyeHazirlan: 'התכוננו וצאו למסגד.',
    camiyeYola: 'צאו למסגד.',
    takvimGiris: 'אירוע ביומן שלכם חל בזמן {vakit}.',
    takvimOnce: 'אל תשכחו להתפלל לפני האירוע.',
    takvimKaplar: 'אל תשכחו לעצור ולהתפלל.',
    yatsi: 'התפללו עשאא לפני השינה.',
    muhasebeTek: 'נראה שתפילת {vakit} לא סומנה היום.',
    muhasebeCoklu: cogul({ one: 'נראה שתפילה אחת לא סומנה היום.', two: 'נראה ששתי תפילות לא סומנו היום.', other: 'נראה ש-{n} תפילות לא סומנו היום.' }),
    geceCapasi: 'שעות השקט מתחילות בעוד {süre} דקות. התפללו {vakit} לפני השינה.',
    kuslukSuruyor: 'זמן דוחא נמשך.',
    kuslukGirdi: 'זמן דוחא הגיע. רגע טוב לשתי רכעות.',
    kuslukBitiyor: cogul({ one: 'נותרה {n} דקה עד סוף זמן דוחא.', two: 'נותרו {n} דקות עד סוף זמן דוחא.', other: 'נותרו {n} דקות עד סוף זמן דוחא.' }),
    evvabinSuruyor: 'עדיין יש זמן לאוואבין.',
    evvabinGirdi: 'זמן אוואבין. רגע טוב לשתי רכעות.',
    evvabinKalan: cogul({ one: 'נותרה {n} דקה לאוואבין.', two: 'נותרו {n} דקות לאוואבין.', other: 'נותרו {n} דקות לאוואבין.' }),
    teheccudSonUcte: "זמן תהאג'וד. השליש האחרון של הלילה הגיע.",
    teheccudKalan: cogul({ one: "זמן תהאג'וד. נותרה {n} דקה עד פג'ר.", two: "זמן תהאג'וד. נותרו {n} דקות עד פג'ר.", other: "זמן תהאג'וד. נותרו {n} דקות עד פג'ר." }),
  },
};
