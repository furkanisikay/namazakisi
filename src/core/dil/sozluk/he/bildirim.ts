import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ התפללתי', kazayaEkle: 'הוספה להשלמות', inceleyin: 'סקירה' },
  kanal: {
    genel: 'התראות כלליות',
    muhafiz: 'שומר התפילה',
    muhafizAciklama: 'תזכורות לזמני תפילה',
    acil: 'תזכורת תפילה דחופה',
    acilAciklama: 'זמן התפילה עומד להסתיים - תזכורות דחופות',
    vakit: 'זמני תפילה',
    vakitAciklama: 'תזכורות שנשלחות כשזמן תפילה מגיע',
    muhafizSes: 'שומר התפילה · {ses}',
    acilSes: 'תזכורת דחופה · {ses}',
    acilSesAciklama: 'זמן התפילה עומד להסתיים — תזכורות דחופות',
    titresimli: '{kanal} · עם רטט',
    alarm: 'מעורר תפילה',
    alarmSes: 'מעורר תפילה · {ses}',
    uygulamaSesi: 'צליל האפליקציה',
    seciliSes: 'הצליל שבחרתם',
  },
  cuma: {
    baslik: "ג'ומעה · נותרו {sure} · התפילה קרובה",
    govdeIlk: 'עוד {sure} עד זוהר. התכוננו וצאו למסגד.',
    govde: 'עוד {sure} עד זוהר. צאו למסגד.',
  },
  camiye: {
    hazirlanBaslik: "{ad} · {dk} דק׳ לאד'אן · התכוננו למסגד",
    hazirlanGovde: "התכוננו כדי להגיע לתפילת {ad} במסגד; צאו בעוד {sonra} דק׳ — האד'אן בעוד {dk} דק׳.",
    yolaCikBaslik: "{ad} · {dk} דק׳ לאד'אן · צאו למסגד",
    yolaCikGovde: "צאו למסגד כדי להגיע לתפילת {ad} — האד'אן בעוד {dk} דק׳.",
  },
  takvim: {
    etkinlikTek: '”{ad}”',
    etkinlikCoklu: cogul({ one: 'אירוע אחד ביומן שלכם', two: 'שני אירועים רצופים ביומן שלכם', other: '{n} אירועים רצופים ביומן שלכם' }),
    etkinlikBir: 'אירוע ביומן שלכם',
    sonAnIkindi: 'הזמן המתאים האחרון לעצר הוא {saat} (אחריו זמן מכרוה)',
    sonAnVakit: 'זמן {kucuk} מסתיים ב-{saat}',
    onceBaslik: '{ad} · אירוע ב-{saat} · התפללו קודם',
    onceGovde: '{etkinlik} נמשך {aralik}; {sonAn}. התפללו {kucuk} לפני שהאירוע מתחיל.',
    kaplarBaslik: '{ad} · אירוע חופף לזמן התפילה',
    kaplarGovde:
      '{etkinlik} נמשך {aralik} וחופף לזמן {kucuk} ({giris}–{son}). תכננו כבר עכשיו הפסקה קצרה כדי להתפלל {kucuk}.',
  },
  yatis: {
    yatsiBaslik: '{ad} · התפללו לפני השינה 🌙',
    yatsiGovde: 'זמן {ad} עדיין נמשך; עמדו לתפילה לפני שתירדמו.',
    ozet: 'היום {kilinan}/5 · {liste} לא סומנו',
    tekOto: 'אם התפללתם, סמנו זאת. {oto}',
    tekKaza: 'אם התפללתם, סמנו זאת; אם לא, הוסיפו אותה ליומן ההשלמות.',
    tekSuruyor: 'אם התפללתם, סמנו זאת. הזמן עדיין נמשך.',
    cokluOto: 'פתחו את האפליקציה כדי לסקור ולסמן את התפילות שהתפללתם. {oto}',
    coklu: 'פתחו את האפליקציה כדי לסקור ולסמן את התפילות שהתפללתם.',
    otoSor: 'אם לא תסמנו, תישאלו על היום הזה ביומן ההשלמות.',
    otoEkle: 'אם לא תסמנו, הן יתווספו להשלמות כשיום התפילה יסתיים.',
  },
  gunSonu: {
    baslik: 'היום לא הושלם · רצף',
    govde: 'אם תסמנו את התפילות שהתפללתם לפני שהיום מסתיים, הרצף שלכם יימשך.',
  },
};
