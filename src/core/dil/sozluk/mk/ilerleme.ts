import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Напредок',
  kilma: {
    baslik: 'Стапка на клањање',
    haftalik: 'Неделно',
    aylik: 'Месечно',
    donemErisim: 'Период на стапката на клањање',
    hesaplaniyor: 'Се пресметува вашата стапка на клањање',
    bosBaslik: 'Сѐ уште нема записи',
    bosAciklama: 'Се појавува тука додека ги означувате вашите намази.',
    yuzde: '{n}%',
    kilinan: 'Клањано',
    oran: 'Стапка',
    enIyiGun: 'Најдобар ден',
    haftaHedefi: 'Цел за оваа недела',
    hedefAlt: cogul({
      one: 'Според вашата цел за низата: {n} намаз дневно',
      other: 'Според вашата цел за низата: {n} намази дневно',
    }),
    kilinanNamaz: 'Клањани намази',
    hedefeUlasan: 'Денови со исполнета цел',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Денови со клањан намаз',
    vakitVakit: 'По времиња за намаз',
    yuzdeErisim: '{ad}: {n} проценти',
  },
  rozetler: {
    baslik: 'Ниво и значки',
    seviye: 'Ниво {n}',
    puan: 'Поени',
    kalanErisim: cogul({
      one: 'До нивото {rank} остана {n} поен',
      other: 'До нивото {rank} останаа {n} поени',
    }),
    enYuksek: 'Сте на највисокото ниво',
    kalan: cogul({ one: '{rank}: уште {n} поен', other: '{rank}: уште {n} поени' }),
    kilinanErisim: cogul({ one: 'Клањан {n} намаз', other: 'Клањани {n} намази' }),
    namaz: cogul({ one: 'намаз', other: 'намази' }),
    rozetErisim: 'Освоени {n} од {toplam} значки',
    rozet: cogul({ one: 'значка', other: 'значки' }),
  },
};
