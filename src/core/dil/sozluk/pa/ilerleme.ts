import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'پیش رفت',
  kilma: {
    baslik: 'نماز دی شرح',
    haftalik: 'ہفتہ وار',
    aylik: 'مہینہ وار',
    donemErisim: 'نماز دی شرح دی مدت',
    hesaplaniyor: 'تہاڈی نماز دی شرح دا حساب ہو رہیا اے',
    bosBaslik: 'اجے کوئی ریکارڈ نہیں',
    bosAciklama: 'نمازاں تے نشان لاؤن دے نال ایتھے نظر آوے گی۔',
    yuzde: '{n}%',
    kilinan: 'ادا ہوئیاں',
    oran: 'شرح',
    enIyiGun: 'سب توں چنگا دن',
    haftaHedefi: 'ایس ہفتے دا ہدف',
    hedefAlt: cogul({ one: 'تہاڈے تسلسل دے ہدف دے مطابق: روزانہ {n} نماز', other: 'تہاڈے تسلسل دے ہدف دے مطابق: روزانہ {n} نمازاں' }),
    kilinanNamaz: 'ادا ہوئیاں نمازاں',
    hedefeUlasan: 'ہدف پورا کرن والے دن',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'نماز والے دن',
    vakitVakit: 'نماز وار',
    yuzdeErisim: '{ad}: {n} فیصد',
  },
  rozetler: {
    baslik: 'درجہ تے بیج',
    seviye: 'درجہ {n}',
    puan: 'پوائنٹ',
    kalanErisim: cogul({ one: '{rank} درجے تک {n} پوائنٹ باقی', other: '{rank} درجے تک {n} پوائنٹ باقی' }),
    enYuksek: 'تسیں سب توں اُچے درجے تے او',
    kalan: cogul({ one: '{rank} تک {n} پوائنٹ باقی', other: '{rank} تک {n} پوائنٹ باقی' }),
    kilinanErisim: cogul({ one: '{n} نماز ادا ہوئی', other: '{n} نمازاں ادا ہوئیاں' }),
    namaz: cogul({ one: 'نماز', other: 'نمازاں' }),
    rozetErisim: '{toplam} وچوں {n} بیج حاصل کیتے',
    rozet: cogul({ one: 'بیج', other: 'بیج' }),
  },
};
