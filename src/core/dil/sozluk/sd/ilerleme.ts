import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'ترقي',
  kilma: {
    baslik: 'نماز جي شرح',
    haftalik: 'هفتيوار',
    aylik: 'مهينيوار',
    donemErisim: 'نماز جي شرح جو عرصو',
    hesaplaniyor: 'اوهان جي نماز جي شرح جو حساب ٿي رهيو آهي',
    bosBaslik: 'اڃا ڪو رڪارڊ ناهي',
    bosAciklama: 'جيئن جيئن اوهان نمازن تي نشان لڳائيندا، هتي ظاهر ٿيندو.',
    yuzde: '{n}%',
    kilinan: 'پڙهيل',
    oran: 'شرح',
    enIyiGun: 'بهترين ڏينهن',
    haftaHedefi: 'هن هفتي جو مقصد',
    hedefAlt: cogul({ one: 'اوهان جي تسلسل جي مقصد موجب: روزانو {n} نماز', other: 'اوهان جي تسلسل جي مقصد موجب: روزانو {n} نمازون' }),
    kilinanNamaz: 'پڙهيل نمازون',
    hedefeUlasan: 'مقصد تائين پهتل ڏينهن',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'نماز وارا ڏينهن',
    vakitVakit: 'نماز موجب',
    yuzdeErisim: '{ad}: {n} سيڪڙو',
  },
  rozetler: {
    baslik: 'سطح ۽ بيج',
    seviye: 'سطح {n}',
    puan: 'پوائنٽ',
    kalanErisim: cogul({ one: '{rank} سطح تائين {n} پوائنٽ', other: '{rank} سطح تائين {n} پوائنٽ' }),
    enYuksek: 'اوهان سڀ کان مٿانهين سطح تي آهيو',
    kalan: cogul({ one: '{rank} تائين {n} پوائنٽ', other: '{rank} تائين {n} پوائنٽ' }),
    kilinanErisim: cogul({ one: '{n} نماز پڙهي وئي', other: '{n} نمازون پڙهيون ويون' }),
    namaz: cogul({ one: 'نماز', other: 'نمازون' }),
    rozetErisim: '{toplam} مان {n} بيج حاصل ٿيا',
    rozet: cogul({ one: 'بيج', other: 'بيج' }),
  },
};
