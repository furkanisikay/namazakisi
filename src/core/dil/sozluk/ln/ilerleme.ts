import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Bokoli',
  kilma: {
    baslik: 'Motango ya losambo',
    haftalik: 'Na pɔsɔ',
    aylik: 'Na sanza',
    donemErisim: 'Eleko ya motango ya losambo',
    hesaplaniyor: 'Ezali kotanga motango ya losambo na bino',
    bosBaslik: 'Naino elɔkɔ te',
    bosAciklama: 'Ekomonana awa soki bozali kotia bilembo na losambo na bino.',
    yuzde: '{n}%',
    kilinan: 'Esambelami',
    oran: 'Motango',
    enIyiGun: 'Mokɔlɔ eleki malamu',
    haftaHedefi: 'Mokano ya pɔsɔ oyo',
    hedefAlt: cogul({
      one: 'Na kolanda mokano ya mokoba na bino: losambo {n} na mokɔlɔ',
      other: 'Na kolanda mokano ya mokoba na bino: losambo {n} na mokɔlɔ',
    }),
    kilinanNamaz: 'Losambo esambelami',
    hedefeUlasan: 'Mikɔlɔ mokano ekokisami',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Mikɔlɔ na losambo',
    vakitVakit: 'Na losambo mɔkɔ mɔkɔ',
    yuzdeErisim: '{ad}: {n} na nkama',
  },
  rozetler: {
    baslik: 'Etape mpe bilembo ya lokumu',
    seviye: 'Etape {n}',
    puan: 'Bapwe',
    kalanErisim: cogul({ one: 'Etikali pwe {n} mpɔ na etape {rank}', other: 'Etikali bapwe {n} mpɔ na etape {rank}' }),
    enYuksek: 'Bozali na etape eleki likolo',
    kalan: cogul({ one: 'Pwe {n} tii {rank}', other: 'Bapwe {n} tii {rank}' }),
    kilinanErisim: cogul({ one: 'Losambo {n} esambelami', other: 'Losambo {n} esambelami' }),
    namaz: cogul({ one: 'losambo', other: 'losambo' }),
    rozetErisim: 'Bilembo ya lokumu {n} na {toplam} ezwami',
    rozet: cogul({ one: 'elembo ya lokumu', other: 'bilembo ya lokumu' }),
  },
};
