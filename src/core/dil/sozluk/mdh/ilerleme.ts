import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Kauswag',
  kilma: {
    baslik: 'Porsyentu nu sambayang',
    haftalik: 'Uman simana',
    aylik: 'Uman ulan',
    donemErisim: 'Timpu nu porsyentu nu sambayang',
    hesaplaniyor: 'Pedkwenta su porsyentu nu sambayang nu',
    bosBaslik: 'Da pan rekord',
    bosAciklama: 'Mailay sya amayka tandaan nu su manga sambayang nu.',
    yuzde: '{n}%',
    kilinan: 'Nasambayang',
    oran: 'Porsyentu',
    enIyiGun: 'Pinakamapya a gay',
    haftaHedefi: 'Target sa simana ini',
    hedefAlt: cogul({ one: 'Sunud sa target nu kasunud-sunud: {n} sambayang uman gay', other: 'Sunud sa target nu kasunud-sunud: {n} sambayang uman gay' }),
    kilinanNamaz: 'Nasambayang',
    hedefeUlasan: 'Gay a nakasampay sa target',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Gay a aden sambayang',
    vakitVakit: 'Uman sambayang',
    yuzdeErisim: '{ad}: {n} porsyentu',
  },
  rozetler: {
    baslik: 'Level endu manga badge',
    seviye: 'Level {n}',
    puan: 'Puntus',
    kalanErisim: cogul({ one: '{n} puntus pan taman sa level a {rank}', other: '{n} puntus pan taman sa level a {rank}' }),
    enYuksek: 'Lu kanu den sa pinakamatag-as a level',
    kalan: cogul({ one: '{n} puntus pan taman sa {rank}', other: '{n} puntus pan taman sa {rank}' }),
    kilinanErisim: cogul({ one: '{n} sambayang a nasambayang', other: '{n} sambayang a nasambayang' }),
    namaz: cogul({ one: 'sambayang', other: 'sambayang' }),
    rozetErisim: '{n} kanu {toplam} a badge i nakwa',
    rozet: cogul({ one: 'badge', other: 'badge' }),
  },
};
