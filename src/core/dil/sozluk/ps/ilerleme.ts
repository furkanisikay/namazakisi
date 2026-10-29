import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'پرمختګ',
  kilma: {
    baslik: 'د ادا کچه',
    haftalik: 'اونیز',
    aylik: 'میاشتنی',
    donemErisim: 'د ادا کچې موده',
    hesaplaniyor: 'ستاسو د ادا کچه حسابېږي',
    bosBaslik: 'لا کوم ریکارډ نشته',
    bosAciklama: 'کله چې خپل لمونځونه نښه کړئ، دلته به ښکاره شي.',
    yuzde: '{n}%',
    kilinan: 'ادا شوي',
    oran: 'کچه',
    enIyiGun: 'غوره ورځ',
    haftaHedefi: 'د دې اونۍ هدف',
    hedefAlt: cogul({ one: 'ستاسو د لړۍ د هدف له مخې: په ورځ کې {n} لمونځ', other: 'ستاسو د لړۍ د هدف له مخې: په ورځ کې {n} لمونځونه' }),
    kilinanNamaz: 'ادا شوي لمونځونه',
    hedefeUlasan: 'هدف ته رسېدلې ورځې',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'د لمانځه ورځې',
    vakitVakit: 'د هر وخت له مخې',
    yuzdeErisim: '{ad}: {n} سلنه',
  },
  rozetler: {
    baslik: 'کچه او نښانونه',
    seviye: 'کچه {n}',
    puan: 'نمرې',
    kalanErisim: cogul({ one: '{rank} کچې ته {n} نمره پاتې ده', other: '{rank} کچې ته {n} نمرې پاتې دي' }),
    enYuksek: 'تاسو په تر ټولو لوړه کچه کې یاست',
    kalan: cogul({ one: '{rank} ته {n} نمره پاتې ده', other: '{rank} ته {n} نمرې پاتې دي' }),
    kilinanErisim: cogul({ one: '{n} لمونځ ادا شو', other: '{n} لمونځونه ادا شول' }),
    namaz: cogul({ one: 'لمونځ', other: 'لمونځونه' }),
    rozetErisim: 'له {toplam} نښانونو څخه {n} ګټل شوي',
    rozet: cogul({ one: 'نښان', other: 'نښانونه' }),
  },
};
