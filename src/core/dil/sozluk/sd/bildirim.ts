import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ نماز پڙهي ورتي', kazayaEkle: 'قضا ۾ شامل ڪريو', inceleyin: 'جائزو وٺو' },
  kanal: {
    genel: 'عام اطلاع',
    muhafiz: 'نماز محافظ',
    muhafizAciklama: 'نماز جي وقت جون ياددهانيون',
    acil: 'تڪڙي نماز ياددهاني',
    acilAciklama: 'نماز جو وقت ختم ٿيڻ وارو آهي - تڪڙيون ياددهانيون',
    vakit: 'نماز جا وقت',
    vakitAciklama: 'نماز جو وقت ٿيڻ تي موڪليل ياددهانيون',
    muhafizSes: 'نماز محافظ · {ses}',
    acilSes: 'تڪڙي ياددهاني · {ses}',
    acilSesAciklama: 'نماز جو وقت ختم ٿيڻ وارو آهي — تڪڙيون ياددهانيون',
    titresimli: '{kanal} · ٿرٿراهٽ سان',
    alarm: 'نماز الارم',
    alarmSes: 'نماز الارم · {ses}',
    uygulamaSesi: 'ايپ جو آواز',
    seciliSes: 'اوهان جو چونڊيل آواز',
  },
  cuma: {
    baslik: 'جمعو · {sure} باقي · نماز ويجهو آهي',
    govdeIlk: 'ظهر تائين {sure}. تياري ڪريو ۽ مسجد ڏانهن وڃو.',
    govde: 'ظهر تائين {sure}. مسجد ڏانهن وڃو.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · اذان ۾ {dk} منٽ · مسجد لاءِ تياري ڪريو',
    hazirlanGovde: '{ad} جي نماز مسجد ۾ پڙهڻ لاءِ تياري ڪريو؛ {sonra} منٽن ۾ نڪرو — اذان {dk} منٽن ۾.',
    yolaCikBaslik: '{ad} · اذان ۾ {dk} منٽ · مسجد ڏانهن وڃو',
    yolaCikGovde: '{ad} جي نماز مسجد ۾ پڙهڻ لاءِ مسجد ڏانهن وڃو — اذان {dk} منٽن ۾.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'اوهان جي ڪئلينڊر ۾ {n} پروگرام', other: 'اوهان جي ڪئلينڊر ۾ {n} لڳاتار پروگرام' }),
    etkinlikBir: 'اوهان جي ڪئلينڊر جو هڪ پروگرام',
    sonAnIkindi: 'عصر جو آخري مناسب وقت {saat} آهي (ان کان پوءِ مڪروه)',
    sonAnVakit: '{kucuk} جو وقت {saat} تي ختم ٿيندو',
    onceBaslik: '{ad} · {saat} تي پروگرام · پهرين نماز پڙهو',
    onceGovde: '{etkinlik} {aralik} آهي؛ {sonAn}. پروگرام شروع ٿيڻ کان اڳ {kucuk} جي نماز پڙهو.',
    kaplarBaslik: '{ad} · هڪ پروگرام نماز جي وقت کي ڍڪي ٿو',
    kaplarGovde:
      '{etkinlik} {aralik} آهي ۽ {kucuk} جي وقت ({giris}–{son}) کي ڍڪي ٿو. ٿورو وقفو ڪري {kucuk} جي نماز پڙهڻ جي هاڻي ئي رٿا ٺاهيو.',
  },
  yatis: {
    yatsiBaslik: '{ad} · سمهڻ کان اڳ نماز پڙهو 🌙',
    yatsiGovde: '{ad} جو وقت اڃا جاري آهي؛ سمهڻ کان اڳ نماز لاءِ بيهو.',
    ozet: 'اڄ {kilinan}/5 · {liste} تي نشان ناهي',
    tekOto: 'جيڪڏهن پڙهي ورتي آهي ته نشان لڳايو. {oto}',
    tekKaza: 'جيڪڏهن پڙهي ورتي آهي ته نشان لڳايو؛ جيڪڏهن نه پڙهي سگهيا ته قضا رجسٽر ۾ شامل ڪريو.',
    tekSuruyor: 'جيڪڏهن پڙهي ورتي آهي ته نشان لڳايو. نماز جو وقت اڃا جاري آهي.',
    cokluOto: 'پڙهيل نمازن جو جائزو وٺڻ ۽ نشان لڳائڻ لاءِ ايپ کوليو. {oto}',
    coklu: 'پڙهيل نمازن جو جائزو وٺڻ ۽ نشان لڳائڻ لاءِ ايپ کوليو.',
    otoSor: 'جيڪڏهن نشان نه لڳايو ته قضا رجسٽر ۾ هن ڏينهن بابت اوهان کان پڇيو ويندو.',
    otoEkle: 'جيڪڏهن نشان نه لڳايو ته نماز وارو ڏينهن پورو ٿيڻ تي اهي قضا ۾ شامل ٿي وينديون.',
  },
  gunSonu: {
    baslik: 'اڄ پورو ناهي · تسلسل',
    govde: 'جيڪڏهن ڏينهن پورو ٿيڻ کان اڳ پڙهيل نمازن تي نشان لڳايو ته اوهان جو تسلسل جاري رهندو.',
  },
};
