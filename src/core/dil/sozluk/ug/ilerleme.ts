import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'ئىلگىرىلەش',
  kilma: {
    baslik: 'ناماز ئوقۇش نىسبىتى',
    haftalik: 'ھەپتىلىك',
    aylik: 'ئايلىق',
    donemErisim: 'ناماز ئوقۇش نىسبىتىنىڭ مەزگىلى',
    hesaplaniyor: 'ناماز ئوقۇش نىسبىتىڭىز ھېسابلىنىۋاتىدۇ',
    bosBaslik: 'تېخى خاتىرە يوق',
    bosAciklama: 'نامازلىرىڭىزنى بەلگىلىگەنسېرى بۇ يەردە كۆرۈنىدۇ.',
    yuzde: '%{n}',
    kilinan: 'ئوقۇلغان',
    oran: 'نىسبەت',
    enIyiGun: 'ئەڭ ياخشى كۈن',
    haftaHedefi: 'بۇ ھەپتىنىڭ نىشانى',
    hedefAlt: cogul({ one: 'ئۇدا كۈن نىشانىڭىزغا كۆرە: كۈنىگە {n} ۋاخ', other: 'ئۇدا كۈن نىشانىڭىزغا كۆرە: كۈنىگە {n} ۋاخ' }),
    kilinanNamaz: 'ئوقۇلغان ناماز',
    hedefeUlasan: 'نىشانغا يەتكەن كۈن',
    ayYil: '{yil}-يىلى {ay}',
    namazKilinanGun: 'ناماز ئوقۇلغان كۈن',
    vakitVakit: 'ۋاخ بويىچە',
    yuzdeErisim: '{ad}: پىرسەنت {n}',
  },
  rozetler: {
    baslik: 'دەرىجە ۋە بەلگىلەر',
    seviye: '{n}-دەرىجە',
    puan: 'نومۇر',
    kalanErisim: cogul({ one: '{rank} دەرىجىسىگە {n} نومۇر قالدى', other: '{rank} دەرىجىسىگە {n} نومۇر قالدى' }),
    enYuksek: 'ئەڭ يۇقىرى دەرىجىدە تۇرۇۋاتىسىز',
    kalan: cogul({ one: '{rank} ئۈچۈن {n} نومۇر قالدى', other: '{rank} ئۈچۈن {n} نومۇر قالدى' }),
    kilinanErisim: cogul({ one: '{n} ناماز ئوقۇلدى', other: '{n} ناماز ئوقۇلدى' }),
    namaz: cogul({ one: 'ناماز', other: 'ناماز' }),
    rozetErisim: '{toplam} بەلگىدىن {n} سى قولغا كەلتۈرۈلدى',
    rozet: cogul({ one: 'بەلگە', other: 'بەلگە' }),
  },
};
