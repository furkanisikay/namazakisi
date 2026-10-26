import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'پیش رفت',
  kilma: {
    baslik: 'نماز کی شرح',
    haftalik: 'ہفتہ وار',
    aylik: 'ماہانہ',
    donemErisim: 'نماز کی شرح کی مدت',
    hesaplaniyor: 'آپ کی نماز کی شرح کا حساب ہو رہا ہے',
    bosBaslik: 'ابھی کوئی ریکارڈ نہیں',
    bosAciklama: 'نمازوں پر نشان لگانے کے ساتھ یہاں نظر آئے گی۔',
    yuzde: '{n}%',
    kilinan: 'ادا شدہ',
    oran: 'شرح',
    enIyiGun: 'بہترین دن',
    haftaHedefi: 'اس ہفتے کا ہدف',
    hedefAlt: cogul({ one: 'آپ کے تسلسل کے ہدف کے مطابق: روزانہ {n} نماز', other: 'آپ کے تسلسل کے ہدف کے مطابق: روزانہ {n} نمازیں' }),
    kilinanNamaz: 'ادا شدہ نمازیں',
    hedefeUlasan: 'ہدف پورا کرنے والے دن',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'نماز والے دن',
    vakitVakit: 'نماز وار',
    yuzdeErisim: '{ad}: {n} فیصد',
  },
  rozetler: {
    baslik: 'درجہ اور بیج',
    seviye: 'درجہ {n}',
    puan: 'پوائنٹس',
    kalanErisim: cogul({ one: '{rank} درجے تک {n} پوائنٹ باقی', other: '{rank} درجے تک {n} پوائنٹس باقی' }),
    enYuksek: 'آپ سب سے اونچے درجے پر ہیں',
    kalan: cogul({ one: '{rank} تک {n} پوائنٹ باقی', other: '{rank} تک {n} پوائنٹس باقی' }),
    kilinanErisim: cogul({ one: '{n} نماز ادا کی گئی', other: '{n} نمازیں ادا کی گئیں' }),
    namaz: cogul({ one: 'نماز', other: 'نمازیں' }),
    rozetErisim: '{toplam} میں سے {n} بیج حاصل کیے',
    rozet: cogul({ one: 'بیج', other: 'بیج' }),
  },
};
