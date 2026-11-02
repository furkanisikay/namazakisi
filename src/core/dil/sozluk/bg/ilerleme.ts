import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Напредък',
  kilma: {
    baslik: 'Дял изпълнени',
    haftalik: 'Седмично',
    aylik: 'Месечно',
    donemErisim: 'Период за дела изпълнени намази',
    hesaplaniyor: 'Изчислява се делът изпълнени намази',
    bosBaslik: 'Още няма записи',
    bosAciklama: 'Ще се появи тук, когато отбелязвате намазите си.',
    yuzde: '{n}%',
    kilinan: 'Изпълнени',
    oran: 'Дял',
    enIyiGun: 'Най-добър ден',
    haftaHedefi: 'Цел за седмицата',
    hedefAlt: cogul({ one: 'Според целта на серията: {n} намаз на ден', other: 'Според целта на серията: {n} намаза на ден' }),
    kilinanNamaz: 'Изпълнени намази',
    hedefeUlasan: 'Дни с изпълнена цел',
    ayYil: '{ay} {yil} г.',
    namazKilinanGun: 'Дни с намаз',
    vakitVakit: 'По намази',
    yuzdeErisim: '{ad}: {n} процента',
  },
  rozetler: {
    baslik: 'Ниво и значки',
    seviye: 'Ниво {n}',
    puan: 'Точки',
    kalanErisim: cogul({ one: '{n} точка до ниво {rank}', other: '{n} точки до ниво {rank}' }),
    enYuksek: 'Достигнали сте най-високото ниво',
    kalan: cogul({ one: '{n} точка до {rank}', other: '{n} точки до {rank}' }),
    kilinanErisim: cogul({ one: '{n} изпълнен намаз', other: '{n} изпълнени намаза' }),
    namaz: cogul({ one: 'намаз', other: 'намаза' }),
    rozetErisim: 'Спечелени значки: {n} от {toplam}',
    rozet: cogul({ one: 'значка', other: 'значки' }),
  },
};
