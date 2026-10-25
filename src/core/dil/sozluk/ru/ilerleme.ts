import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Progress',
  kilma: {
    baslik: 'Prayer rate',
    haftalik: 'Weekly',
    aylik: 'Monthly',
    donemErisim: 'Prayer rate period',
    hesaplaniyor: 'Calculating your prayer rate',
    bosBaslik: 'No records yet',
    bosAciklama: 'Appears here as you mark your prayers.',
    yuzde: '{n}%',
    kilinan: 'Prayed',
    oran: 'Rate',
    enIyiGun: 'Best day',
    haftaHedefi: "This week's goal",
    hedefAlt: cogul({ one: 'Based on your streak goal: {n} prayer a day', few: 'Based on your streak goal: {n} prayers a day', many: 'Based on your streak goal: {n} prayers a day', other: 'Based on your streak goal: {n} prayers a day' }),
    kilinanNamaz: 'Prayers prayed',
    hedefeUlasan: 'Days on target',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Days with prayer',
    vakitVakit: 'By prayer',
    yuzdeErisim: '{ad}: {n} percent',
  },
  rozetler: {
    baslik: 'Level and badges',
    seviye: 'Level {n}',
    puan: 'Points',
    kalanErisim: cogul({ one: '{n} point to the {rank} level', few: '{n} points to the {rank} level', many: '{n} points to the {rank} level', other: '{n} points to the {rank} level' }),
    enYuksek: "You're at the highest level",
    kalan: cogul({ one: '{n} point to {rank}', few: '{n} points to {rank}', many: '{n} points to {rank}', other: '{n} points to {rank}' }),
    kilinanErisim: cogul({ one: '{n} prayer prayed', few: '{n} prayers prayed', many: '{n} prayers prayed', other: '{n} prayers prayed' }),
    namaz: cogul({ one: 'prayer', few: 'prayers', many: 'prayers', other: 'prayers' }),
    rozetErisim: '{n} of {toplam} badges earned',
    rozet: cogul({ one: 'badge', few: 'badges', many: 'badges', other: 'badges' }),
  },
};
