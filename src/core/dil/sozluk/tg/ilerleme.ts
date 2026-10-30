import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Пешрафт',
  kilma: {
    baslik: 'Сатҳи хондан',
    haftalik: 'Ҳафтаина',
    aylik: 'Моҳона',
    donemErisim: 'Давраи сатҳи хондан',
    hesaplaniyor: 'Сатҳи хондани Шумо ҳисоб карда мешавад',
    bosBaslik: 'Ҳанӯз сабте нест',
    bosAciklama: 'Вақте ки намозҳоятонро қайд мекунед, дар ин ҷо пайдо мешавад.',
    yuzde: '{n}%',
    kilinan: 'Хондашуда',
    oran: 'Сатҳ',
    enIyiGun: 'Беҳтарин рӯз',
    haftaHedefi: 'Ҳадафи ин ҳафта',
    hedefAlt: cogul({ one: 'Мувофиқи ҳадафи силсилаи Шумо: {n} намоз дар як рӯз', other: 'Мувофиқи ҳадафи силсилаи Шумо: {n} намоз дар як рӯз' }),
    kilinanNamaz: 'Намозҳои хондашуда',
    hedefeUlasan: 'Рӯзҳои ба ҳадаф расида',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Рӯзҳои бо намоз',
    vakitVakit: 'Аз рӯи вақтҳо',
    yuzdeErisim: '{ad}: {n} фоиз',
  },
  rozetler: {
    baslik: 'Сатҳ ва нишонҳо',
    seviye: 'Сатҳи {n}',
    puan: 'Хол',
    kalanErisim: cogul({ one: 'То сатҳи {rank} {n} хол монд', other: 'То сатҳи {rank} {n} хол монд' }),
    enYuksek: 'Шумо дар сатҳи баландтарин ҳастед',
    kalan: cogul({ one: 'То {rank} {n} хол монд', other: 'То {rank} {n} хол монд' }),
    kilinanErisim: cogul({ one: '{n} намоз хонда шуд', other: '{n} намоз хонда шуд' }),
    namaz: cogul({ one: 'намоз', other: 'намоз' }),
    rozetErisim: '{n} аз {toplam} нишон ба даст омад',
    rozet: cogul({ one: 'нишон', other: 'нишон' }),
  },
};
