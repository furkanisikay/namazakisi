import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Fandrosoana',
  kilma: {
    baslik: "Tahan'ny soalat",
    haftalik: 'Isan-kerinandro',
    aylik: 'Isam-bolana',
    donemErisim: "Vanim-potoanan'ny tahan'ny soalat",
    hesaplaniyor: "Kajiana ny tahan'ny soalatrao",
    bosBaslik: 'Mbola tsy misy firaketana',
    bosAciklama: 'Miseho eto rehefa manamarika ny soalatrao ianao.',
    yuzde: '{n}%',
    kilinan: 'Vita',
    oran: 'Taha',
    enIyiGun: 'Andro tsara indrindra',
    haftaHedefi: "Tanjon'ity herinandro ity",
    hedefAlt: cogul({
      one: "Mifototra amin'ny tanjon'ny tohinao: soalat {n} isan'andro",
      other: "Mifototra amin'ny tanjon'ny tohinao: soalat {n} isan'andro",
    }),
    kilinanNamaz: 'Soalat vita',
    hedefeUlasan: 'Andro nahatratra ny tanjona',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Andro nisy soalat',
    vakitVakit: 'Isaky ny soalat',
    yuzdeErisim: '{ad}: {n} isan-jato',
  },
  rozetler: {
    baslik: 'Ambaratonga sy medaly',
    seviye: 'Ambaratonga {n}',
    puan: 'Isa',
    kalanErisim: cogul({
      one: "{n} isa sisa mankany amin'ny ambaratonga {rank}",
      other: "{n} isa sisa mankany amin'ny ambaratonga {rank}",
    }),
    enYuksek: "Ao amin'ny ambaratonga ambony indrindra ianao",
    kalan: cogul({ one: '{n} isa mankany {rank}', other: '{n} isa mankany {rank}' }),
    kilinanErisim: cogul({ one: 'Soalat {n} vita', other: 'Soalat {n} vita' }),
    namaz: cogul({ one: 'soalat', other: 'soalat' }),
    rozetErisim: "Medaly {n} amin'ny {toplam} no azo",
    rozet: cogul({ one: 'medaly', other: 'medaly' }),
  },
};
