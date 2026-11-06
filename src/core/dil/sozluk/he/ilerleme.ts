import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'התקדמות',
  kilma: {
    baslik: 'שיעור ביצוע',
    haftalik: 'שבועי',
    aylik: 'חודשי',
    donemErisim: 'תקופת שיעור הביצוע',
    hesaplaniyor: 'שיעור הביצוע שלכם בחישוב',
    bosBaslik: 'אין עדיין רשומות',
    bosAciklama: 'יופיע כאן כשתסמנו את התפילות שלכם.',
    yuzde: '{n}%',
    kilinan: 'בוצעו',
    oran: 'שיעור',
    enIyiGun: 'היום הטוב ביותר',
    haftaHedefi: 'היעד של השבוע',
    hedefAlt: cogul({ one: 'לפי יעד הרצף שלכם: תפילה אחת ביום', two: 'לפי יעד הרצף שלכם: שתי תפילות ביום', other: 'לפי יעד הרצף שלכם: {n} תפילות ביום' }),
    kilinanNamaz: 'תפילות שבוצעו',
    hedefeUlasan: 'ימים שעמדו ביעד',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'ימים עם תפילה',
    vakitVakit: 'לפי תפילה',
    yuzdeErisim: '{ad}: {n} אחוז',
  },
  rozetler: {
    baslik: 'רמה ותגים',
    seviye: 'רמה {n}',
    puan: 'נקודות',
    kalanErisim: cogul({ one: 'נותרה נקודה אחת לרמת {rank}', two: 'נותרו {n} נקודות לרמת {rank}', other: 'נותרו {n} נקודות לרמת {rank}' }),
    enYuksek: 'אתם ברמה הגבוהה ביותר',
    kalan: cogul({ one: 'עוד נקודה אחת עד {rank}', two: 'עוד {n} נקודות עד {rank}', other: 'עוד {n} נקודות עד {rank}' }),
    kilinanErisim: cogul({ one: 'תפילה אחת בוצעה', two: '{n} תפילות בוצעו', other: '{n} תפילות בוצעו' }),
    namaz: cogul({ one: 'תפילה', two: 'תפילות', other: 'תפילות' }),
    rozetErisim: 'הושגו {n} מתוך {toplam} תגים',
    rozet: cogul({ one: 'תג', two: 'תגים', other: 'תגים' }),
  },
};
