import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Pêşketin',
  kilma: {
    baslik: 'Rêjeya nimêjê',
    haftalik: 'Heftane',
    aylik: 'Mehane',
    donemErisim: 'Heyama rêjeya nimêjê',
    hesaplaniyor: 'Rêjeya nimêja we tê hesabkirin',
    bosBaslik: 'Hîn tomar tune',
    bosAciklama: 'Gava hûn nimêjên xwe nîşan bikin, li vir xuya dibe.',
    yuzde: '%{n}',
    kilinan: 'Hatin kirin',
    oran: 'Rêje',
    enIyiGun: 'Roja herî baş',
    haftaHedefi: 'Armanca vê heftiyê',
    hedefAlt: cogul({ one: 'Li gorî armanca zincîra we: rojê {n} nimêj', other: 'Li gorî armanca zincîra we: rojê {n} nimêj' }),
    kilinanNamaz: 'Nimêjên hatine kirin',
    hedefeUlasan: 'Rojên gihîştine armancê',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Rojên bi nimêj',
    vakitVakit: 'Li gorî nimêjê',
    yuzdeErisim: '{ad}: ji sedî {n}',
  },
  rozetler: {
    baslik: 'Ast û nîşan',
    seviye: 'Asta {n}',
    puan: 'Pûan',
    kalanErisim: cogul({ one: '{n} pûan heta asta {rank}', other: '{n} pûan heta asta {rank}' }),
    enYuksek: 'Hûn di asta herî bilind de ne',
    kalan: cogul({ one: '{n} pûan heta {rank}', other: '{n} pûan heta {rank}' }),
    kilinanErisim: cogul({ one: '{n} nimêj hate kirin', other: '{n} nimêj hatin kirin' }),
    namaz: cogul({ one: 'nimêj', other: 'nimêj' }),
    rozetErisim: '{n} ji {toplam} nîşanan hatin bidestxistin',
    rozet: cogul({ one: 'nîşan', other: 'nîşan' }),
  },
};
