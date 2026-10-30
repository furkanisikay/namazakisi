import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ривожланиш',
  kilma: {
    baslik: 'Намоз кўрсаткичи',
    haftalik: 'Ҳафталик',
    aylik: 'Ойлик',
    donemErisim: 'Намоз кўрсаткичи даври',
    hesaplaniyor: 'Намоз кўрсаткичингиз ҳисобланмоқда',
    bosBaslik: 'Ҳали ёзувлар йўқ',
    bosAciklama: 'Намозларингизни белгилаганингиз сари шу ерда кўринади.',
    yuzde: '{n}%',
    kilinan: 'Ўқилган',
    oran: 'Кўрсаткич',
    enIyiGun: 'Энг яхши кун',
    haftaHedefi: 'Шу ҳафта мақсади',
    hedefAlt: cogul({ one: 'Кетма-кетлик мақсадингизга кўра: кунига {n} намоз', other: 'Кетма-кетлик мақсадингизга кўра: кунига {n} намоз' }),
    kilinanNamaz: 'Ўқилган намозлар',
    hedefeUlasan: 'Мақсадга етилган кунлар',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Намоз ўқилган кунлар',
    vakitVakit: 'Вақтлар бўйича',
    yuzdeErisim: '{ad}: {n} фоиз',
  },
  rozetler: {
    baslik: 'Даража ва нишонлар',
    seviye: '{n}-даража',
    puan: 'Балл',
    kalanErisim: cogul({ one: '{rank} даражасигача {n} балл қолди', other: '{rank} даражасигача {n} балл қолди' }),
    enYuksek: 'Энг юқори даражадасиз',
    kalan: cogul({ one: '{rank} учун {n} балл қолди', other: '{rank} учун {n} балл қолди' }),
    kilinanErisim: cogul({ one: '{n} намоз ўқилган', other: '{n} намоз ўқилган' }),
    namaz: cogul({ one: 'намоз', other: 'намоз' }),
    rozetErisim: '{toplam} нишондан {n} таси қўлга киритилган',
    rozet: cogul({ one: 'нишон', other: 'нишон' }),
  },
};
