import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'پیشرفت',
  kilma: {
    baslik: 'نرخ خواندن نماز',
    haftalik: 'هفتگی',
    aylik: 'ماهانه',
    donemErisim: 'بازهٔ نرخ خواندن نماز',
    hesaplaniyor: 'نرخ خواندن نماز شما در حال محاسبه است',
    bosBaslik: 'هنوز ثبتی نیست',
    bosAciklama: 'با علامت زدن نمازهایتان اینجا نمایش داده می‌شود.',
    yuzde: '{n}٪',
    kilinan: 'خوانده‌شده',
    oran: 'نرخ',
    enIyiGun: 'بهترین روز',
    haftaHedefi: 'هدف این هفته',
    hedefAlt: cogul({ one: 'بر اساس هدف زنجیرهٔ شما: روزی {n} نماز', other: 'بر اساس هدف زنجیرهٔ شما: روزی {n} نماز' }),
    kilinanNamaz: 'نمازهای خوانده‌شده',
    hedefeUlasan: 'روزهای رسیده به هدف',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'روزهای همراه با نماز',
    vakitVakit: 'به تفکیک نماز',
    yuzdeErisim: '{ad}: {n} درصد',
  },
  rozetler: {
    baslik: 'سطح و نشان‌ها',
    seviye: 'سطح {n}',
    puan: 'امتیاز',
    kalanErisim: cogul({ one: '{n} امتیاز تا سطح {rank}', other: '{n} امتیاز تا سطح {rank}' }),
    enYuksek: 'در بالاترین سطح هستید',
    kalan: cogul({ one: '{n} امتیاز تا {rank}', other: '{n} امتیاز تا {rank}' }),
    kilinanErisim: cogul({ one: '{n} نماز خوانده شد', other: '{n} نماز خوانده شد' }),
    namaz: cogul({ one: 'نماز', other: 'نماز' }),
    rozetErisim: '{n} نشان از {toplam} نشان به دست آمد',
    rozet: cogul({ one: 'نشان', other: 'نشان' }),
  },
};
