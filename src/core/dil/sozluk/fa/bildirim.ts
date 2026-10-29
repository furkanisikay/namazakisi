import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı (cuma, مسجد, takvim, عشا) "تو" + emir; işaretleme/muhasebe "شما". */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ خواندم', kazayaEkle: 'افزودن به قضا', inceleyin: 'بررسی' },
  kanal: {
    genel: 'اعلان‌های عمومی',
    muhafiz: 'نگهبان نماز',
    muhafizAciklama: 'یادآوری‌های وقت نماز',
    acil: 'یادآور فوری نماز',
    acilAciklama: 'وقت نماز در حال پایان است - یادآوری‌های فوری',
    vakit: 'اعلان‌های اوقات نماز',
    vakitAciklama: 'یادآوری‌هایی که هنگام رسیدن وقت نماز فرستاده می‌شوند',
    muhafizSes: 'نگهبان نماز · {ses}',
    acilSes: 'یادآور فوری · {ses}',
    acilSesAciklama: 'وقت نماز در حال پایان است — یادآوری‌های فوری',
    titresimli: '{kanal} · با لرزش',
    alarm: 'هشدار نماز',
    alarmSes: 'هشدار نماز · {ses}',
    uygulamaSesi: 'صدای برنامه',
    seciliSes: 'صدای انتخابی شما',
  },
  cuma: {
    baslik: 'جمعه · {sure} مانده · نماز نزدیک است',
    govdeIlk: '{sure} تا ظهر مانده. آماده شو و به مسجد برو.',
    govde: '{sure} تا ظهر مانده. به مسجد برو.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · {dk} دقیقه تا اذان · برای مسجد آماده شو',
    hazirlanGovde: 'برای رسیدن به نماز {ad} در مسجد آماده شو؛ {sonra} دقیقهٔ دیگر راه بیفت — {dk} دقیقه تا اذان.',
    yolaCikBaslik: '{ad} · {dk} دقیقه تا اذان · به مسجد برو',
    yolaCikGovde: 'برای رسیدن به نماز {ad} در مسجد راه بیفت — {dk} دقیقه تا اذان.',
  },
  takvim: {
    etkinlikTek: '«{ad}»',
    etkinlikCoklu: cogul({ one: '{n} رویداد در تقویمت', other: '{n} رویداد پشت‌سرهم در تقویمت' }),
    etkinlikBir: 'رویدادی در تقویمت',
    sonAnIkindi: 'آخرین زمان مناسب برای عصر {saat} است (پس از آن مکروه)',
    sonAnVakit: 'وقت {kucuk} ساعت {saat} تمام می‌شود',
    onceBaslik: '{ad} · رویداد ساعت {saat} · اول نماز بخوان',
    onceGovde: '{etkinlik} در بازهٔ {aralik} برگزار می‌شود؛ {sonAn}. پیش از شروع رویداد نماز {kucuk} را بخوان.',
    kaplarBaslik: '{ad} · رویدادی وقت نماز را می‌پوشاند',
    kaplarGovde:
      '{etkinlik} در بازهٔ {aralik} برگزار می‌شود و وقت {kucuk} ({giris}–{son}) را می‌پوشاند. از همین حالا برای یک وقفهٔ کوتاه و خواندن نماز {kucuk} برنامه بریز.',
  },
  yatis: {
    yatsiBaslik: '{ad} · پیش از خواب بخوان 🌙',
    yatsiGovde: 'وقت {ad} هنوز باقی است؛ پیش از اینکه خوابت ببرد به نماز بایست.',
    ozet: 'امروز {kilinan}/5 · {liste} علامت نخورده',
    tekOto: 'اگر خوانده‌اید، علامت بزنید. {oto}',
    tekKaza: 'اگر خوانده‌اید، علامت بزنید؛ اگر نتوانستید، آن را به دفتر قضا بیفزایید.',
    tekSuruyor: 'اگر خوانده‌اید، علامت بزنید. وقت نماز هنوز باقی است.',
    cokluOto: 'برنامه را باز کنید و نمازهایی را که خوانده‌اید بررسی و علامت بزنید. {oto}',
    coklu: 'برنامه را باز کنید و نمازهایی را که خوانده‌اید بررسی و علامت بزنید.',
    otoSor: 'اگر علامت نزنید، دربارهٔ این روز در دفتر قضا از شما پرسیده می‌شود.',
    otoEkle: 'اگر علامت نزنید، با پایان روز نماز به قضا افزوده می‌شوند.',
  },
  gunSonu: {
    baslik: 'روز کامل نشده · زنجیره',
    govde: 'اگر نمازهایی را که خوانده‌اید پیش از پایان روز علامت بزنید، زنجیره‌تان ادامه می‌یابد.',
  },
};
