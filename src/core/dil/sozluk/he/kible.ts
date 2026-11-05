import type { Sozluk } from '../tr';

/** Kadran harfleri İbrani pusula kısaltmaları: צ(פון), מז(רח), ד(רום), מע(רב). Kâbe "הכעבה" (he.wikipedia). */
export const kible: Sozluk['kible'] = {
  baslik: 'קיבלה',
  yon: {
    hizali: 'אתם פונים לכיוון הקיבלה',
    arkada: 'הקיבלה מאחוריכם, הסתובבו',
    sagda: 'הקיבלה {derece}° מימינכם',
    solda: 'הקיבלה {derece}° משמאלכם',
  },
  harf: { kuzey: 'צ', dogu: 'מז', guney: 'ד', bati: 'מע' },
  sekme: {
    pusula: 'מצפן',
    pusulaErisim: 'מצב מצפן',
    pusulaAciklama: 'כשסימן הכעבה מגיע לחריץ שלמעלה, אתם פונים לכיוון הקיבלה.',
    kamera: 'מצלמה',
    kameraErisim: 'מצב מצלמה',
    kameraAciklama: 'החזיקו את הטלפון זקוף; סימן הכעבה יופיע בכיוון הקיבלה.',
  },
  sayfa: {
    baslatiliyor: 'המצפן מופעל…',
    izinKapali: 'הרשאת המיקום כבויה; כדי למצוא את הכיוון נדרש המיקום שלכם.',
  },
  hata: {
    izinGerekli: 'כדי למצוא את כיוון הקיבלה נדרשת הרשאת מיקום.',
    konumServisi: 'אין גישה לשירותי המיקום. בדקו את הגדרות המיקום במכשיר.',
    baslatilamadi: 'לא ניתן היה להפעיל את שירות הקיבלה.',
  },
  pusula: {
    ufuk: 'אופק',
    konumAliniyor: 'המיקום שלכם מתקבל…',
    hazirlaniyor: 'המצפן בהכנה…',
    kuzeydenAci: 'הקיבלה ב-{derece}° מהצפון',
    kabeUzakta: 'הכעבה במרחק {mesafe}',
    kuzeydenSaatYonu: 'מהצפון בכיוון השעון',
    kuzeyden: '{derece}° מהצפון',
    kabeUzaktaKuzeyden: 'הכעבה במרחק {mesafe}, {derece}° מהצפון',
    pusulaErisim: 'מצפן קיבלה. {cumle}',
    pusulaYok: 'אין מצפן במכשיר הזה; אנחנו מציגים את הכיוון ביחס לצפון.',
    kayiyorsa: 'אם הכיוון זז, הניעו את הטלפון באוויר בצורת 8.',
    kamerayla: 'צפייה במצלמה',
  },
  kamera: {
    pusulayiKullanin: 'שימוש במצפן',
    kullanilamiyorBaslik: 'תצוגת המצלמה לא זמינה בטלפון הזה',
    kullanilamiyorMetin:
      'החיישנים בטלפון לא נותנים כיוון אמין כשהוא מוחזק זקוף. המצפן ממשיך להציג את הכיוון הנכון.',
    izinBaslik: 'צפייה בקיבלה דרך המצלמה',
    izinMetin:
      'כשמחזיקים את הטלפון זקוף ומסתכלים סביב, סימן הכעבה מופיע בכיוון הקיבלה. לשם כך נדרשת הרשאת מצלמה; התמונה לא נשמרת ולא יוצאת מהטלפון.',
    kamerayiAcin: 'הפעלת המצלמה',
    izinKapaliBaslik: 'הרשאת המצלמה כבויה',
    izinKapaliMetin: 'לתצוגת המצלמה אפשר להפעיל את הרשאת המצלמה בהגדרות. המצפן פועל גם בלעדיה.',
    ayarlariAcin: 'פתיחת ההגדרות',
    acilamadiBaslik: 'לא ניתן היה לפתוח את המצלמה',
    acilamadiMetin: 'המצלמה לא זמינה כרגע. אפשר למצוא את כיוון הקיבלה בעזרת המצפן.',
    hesaplaniyor: 'הכיוון בחישוב…',
    dikTutun: 'החזיקו את הטלפון זקוף',
  },
  kalibrasyon: {
    tesekkurErisim: 'תודה, הכיוון מדויק יותר עכשיו',
    tesekkur: 'תודה, הכיוון מדויק יותר עכשיו ✓',
    baslik: 'כיול המצפן',
    sallayin: 'הניעו את הטלפון באוויר בצורת 8.',
    metal: 'התרחקו מחפצי מתכת ומכיסויים מגנטיים.',
    dogruluk: 'דיוק',
    simdiDegil: 'לא עכשיו',
  },
};
