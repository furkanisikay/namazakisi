import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı isim cümlesidir (emir yok); başlıkta vakit adı ve süre önde, "د" = دقيقة. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ صلّيتُ', kazayaEkle: 'إضافة إلى القضاء', inceleyin: 'مراجعة' },
  kanal: {
    genel: 'إشعارات عامة',
    muhafiz: 'قبل خروج الوقت',
    muhafizAciklama: 'تذكيرات بأوقات الصلاة',
    acil: 'تذكير عاجل بالصلاة',
    acilAciklama: 'وقت الصلاة يوشك أن يخرج - تذكيرات عاجلة',
    vakit: 'إشعارات المواقيت',
    vakitAciklama: 'تذكيرات تُرسل عند دخول وقت الصلاة',
    muhafizSes: 'قبل خروج الوقت · {ses}',
    acilSes: 'تذكير عاجل · {ses}',
    acilSesAciklama: 'وقت الصلاة يوشك أن يخرج — تذكيرات عاجلة',
    titresimli: '{kanal} · مع الاهتزاز',
    alarm: 'منبّه الصلاة',
    alarmSes: 'منبّه الصلاة · {ses}',
    uygulamaSesi: 'صوت التطبيق',
    seciliSes: 'الصوت المختار',
  },
  cuma: {
    baslik: 'الجمعة · {sure} متبقية · الصلاة تقترب',
    govdeIlk: 'بقي {sure} على وقت الظهر. حان وقت الاستعداد والتوجّه إلى المسجد.',
    govde: 'بقي {sure} على وقت الظهر. حان وقت التوجّه إلى المسجد.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} د للأذان · الاستعداد للمسجد',
    hazirlanGovde: 'لإدراك صلاة {ad} في المسجد: الاستعداد الآن، والخروج بعد {sonra} د — الأذان بعد {dk} د.',
    yolaCikBaslik: '{ad} · {dk} د للأذان · إلى المسجد',
    yolaCikGovde: 'حان وقت التوجّه إلى المسجد لإدراك صلاة {ad} — الأذان بعد {dk} د.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({
      zero: '{n} موعد متتالٍ في تقويمك',
      one: 'موعد واحد في تقويمك',
      two: 'موعدان متتاليان في تقويمك',
      few: '{n} مواعيد متتالية في تقويمك',
      many: '{n} موعدًا متتاليًا في تقويمك',
      other: '{n} موعد متتالٍ في تقويمك',
    }),
    etkinlikBir: 'موعد في تقويمك',
    sonAnIkindi: 'آخر وقت مناسب للعصر {saat} (بعده وقت كراهة)',
    sonAnVakit: 'يخرج وقت {kucuk} الساعة {saat}',
    onceBaslik: '{ad} · موعد {saat} · الصلاة أولًا',
    onceGovde: '{etkinlik} من {aralik}؛ {sonAn}. صلاة {kucuk} قبل بدء الموعد.',
    kaplarBaslik: '{ad} · موعد يغطي وقت الصلاة',
    kaplarGovde:
      '{etkinlik} من {aralik} ويغطي وقت {kucuk} ({giris}–{son}). استراحة قصيرة لصلاة {kucuk}: التخطيط لها من الآن.',
  },
  yatis: {
    yatsiBaslik: '{ad} · الصلاة قبل النوم 🌙',
    yatsiGovde: 'وقت {ad} ما زال مستمرًّا؛ الصلاة قبل النوم.',
    ozet: 'اليوم {kilinan}/5 · {liste} دون علامة',
    tekOto: 'عند أدائها: وضع علامة «تمّت». {oto}',
    tekKaza: 'عند أدائها: وضع علامة «تمّت»؛ وإن فاتت: إضافتها إلى سجل القضاء.',
    tekSuruyor: 'عند أدائها: وضع علامة «تمّت». الوقت ما زال مستمرًّا.',
    cokluOto: 'فتح التطبيق لمراجعة الصلوات المؤدّاة ووضع العلامة عليها. {oto}',
    coklu: 'فتح التطبيق لمراجعة الصلوات المؤدّاة ووضع العلامة عليها.',
    otoSor: 'دون وضع علامة، سيُسأل عن هذا اليوم في سجل القضاء.',
    otoEkle: 'دون وضع علامة، ستُضاف إلى القضاء عند انتهاء يوم الصلاة.',
  },
  gunSonu: {
    baslik: 'اليوم لم يكتمل · السلسلة',
    govde: 'وضع علامة على الصلوات المؤدّاة قبل انتهاء اليوم يُبقي السلسلة مستمرة.',
  },
};
