import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Напредак',
  kilma: {
    baslik: 'Стопа клањања',
    haftalik: 'Недељно',
    aylik: 'Месечно',
    donemErisim: 'Период стопе клањања',
    hesaplaniyor: 'Израчунава се ваша стопа клањања',
    bosBaslik: 'Још нема записа',
    bosAciklama: 'Појављује се овде како означавате своје намазе.',
    yuzde: '{n}%',
    kilinan: 'Клањано',
    oran: 'Стопа',
    enIyiGun: 'Најбољи дан',
    haftaHedefi: 'Циљ ове недеље',
    hedefAlt: cogul({
      one: 'Према вашем циљу низа: {n} намаз дневно',
      few: 'Према вашем циљу низа: {n} намаза дневно',
      other: 'Према вашем циљу низа: {n} намаза дневно',
    }),
    kilinanNamaz: 'Клањани намази',
    hedefeUlasan: 'Дани са испуњеним циљем',
    ayYil: '{ay} {yil}.',
    namazKilinanGun: 'Дани са клањаним намазом',
    vakitVakit: 'По временима намаза',
    yuzdeErisim: '{ad}: {n} одсто',
  },
  rozetler: {
    baslik: 'Ниво и значке',
    seviye: 'Ниво {n}',
    puan: 'Бодови',
    kalanErisim: cogul({
      one: 'До нивоа {rank} преостао је {n} бод',
      few: 'До нивоа {rank} преостала су {n} бода',
      other: 'До нивоа {rank} преостало је {n} бодова',
    }),
    enYuksek: 'На највишем сте нивоу',
    kalan: cogul({ one: '{rank}: још {n} бод', few: '{rank}: још {n} бода', other: '{rank}: још {n} бодова' }),
    kilinanErisim: cogul({ one: 'Клањан {n} намаз', few: 'Клањана {n} намаза', other: 'Клањано {n} намаза' }),
    namaz: cogul({ one: 'намаз', few: 'намаза', other: 'намаза' }),
    rozetErisim: 'Освојено {n} од {toplam} значки',
    rozet: cogul({ one: 'значка', few: 'значке', other: 'значки' }),
  },
};
