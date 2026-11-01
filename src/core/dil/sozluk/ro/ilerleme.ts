import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Progres',
  kilma: {
    baslik: 'Rata rugăciunilor',
    haftalik: 'Săptămânal',
    aylik: 'Lunar',
    donemErisim: 'Perioada ratei rugăciunilor',
    hesaplaniyor: 'Se calculează rata rugăciunilor',
    bosBaslik: 'Încă nu există înregistrări',
    bosAciklama: 'Apare aici pe măsură ce marcați rugăciunile.',
    yuzde: '{n}%',
    kilinan: 'Efectuate',
    oran: 'Rată',
    enIyiGun: 'Cea mai bună zi',
    haftaHedefi: 'Obiectivul săptămânii',
    hedefAlt: cogul({
      one: 'După obiectivul seriei: {n} rugăciune pe zi',
      few: 'După obiectivul seriei: {n} rugăciuni pe zi',
      other: 'După obiectivul seriei: {n} de rugăciuni pe zi',
    }),
    kilinanNamaz: 'Rugăciuni efectuate',
    hedefeUlasan: 'Zile cu obiectiv atins',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Zile cu rugăciune',
    vakitVakit: 'Pe rugăciuni',
    yuzdeErisim: '{ad}: {n} la sută',
  },
  rozetler: {
    baslik: 'Nivel și insigne',
    seviye: 'Nivelul {n}',
    puan: 'Puncte',
    kalanErisim: cogul({
      one: '{n} punct până la nivelul {rank}',
      few: '{n} puncte până la nivelul {rank}',
      other: '{n} de puncte până la nivelul {rank}',
    }),
    enYuksek: 'Sunteți la cel mai înalt nivel',
    kalan: cogul({ one: '{n} punct până la {rank}', few: '{n} puncte până la {rank}', other: '{n} de puncte până la {rank}' }),
    kilinanErisim: cogul({ one: '{n} rugăciune efectuată', few: '{n} rugăciuni efectuate', other: '{n} de rugăciuni efectuate' }),
    namaz: cogul({ one: 'rugăciune', few: 'rugăciuni', other: 'de rugăciuni' }),
    rozetErisim: '{n} din {toplam} insigne obținute',
    rozet: cogul({ one: 'insignă', few: 'insigne', other: 'de insigne' }),
  },
};
