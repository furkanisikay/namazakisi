import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ілгерілеу',
  kilma: {
    baslik: 'Оқу деңгейі',
    haftalik: 'Апталық',
    aylik: 'Айлық',
    donemErisim: 'Оқу деңгейінің кезеңі',
    hesaplaniyor: 'Оқу деңгейіңіз есептелуде',
    bosBaslik: 'Әзірге жазба жоқ',
    bosAciklama: 'Намаздарыңызды белгілеген сайын осында көрінеді.',
    yuzde: '{n}%',
    kilinan: 'Оқылған',
    oran: 'Үлес',
    enIyiGun: 'Ең жақсы күн',
    haftaHedefi: 'Осы аптаның мақсаты',
    hedefAlt: cogul({ one: 'Серия мақсатыңызға қарай: күніне {n} намаз', other: 'Серия мақсатыңызға қарай: күніне {n} намаз' }),
    kilinanNamaz: 'Оқылған намаз',
    hedefeUlasan: 'Мақсатқа жеткен күн',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Намаз оқылған күн',
    vakitVakit: 'Уақыт бойынша',
    yuzdeErisim: '{ad}: {n} пайыз',
  },
  rozetler: {
    baslik: 'Деңгей және төсбелгілер',
    seviye: '{n}-деңгей',
    puan: 'Ұпай',
    kalanErisim: cogul({ one: '{rank} деңгейіне {n} ұпай қалды', other: '{rank} деңгейіне {n} ұпай қалды' }),
    enYuksek: 'Сіз ең жоғары деңгейдесіз',
    kalan: cogul({ one: '{rank} үшін {n} ұпай қалды', other: '{rank} үшін {n} ұпай қалды' }),
    kilinanErisim: cogul({ one: '{n} намаз оқылды', other: '{n} намаз оқылды' }),
    namaz: cogul({ one: 'намаз', other: 'намаз' }),
    rozetErisim: '{toplam} төсбелгіден {n} алынды',
    rozet: cogul({ one: 'төсбелгі', other: 'төсбелгі' }),
  },
};
