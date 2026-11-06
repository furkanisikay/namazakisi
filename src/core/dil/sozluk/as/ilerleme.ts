import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'অগ্ৰগতি',
  kilma: {
    baslik: 'নামাজ পঢ়াৰ হাৰ',
    haftalik: 'সাপ্তাহিক',
    aylik: 'মাহেকীয়া',
    donemErisim: 'নামাজ পঢ়াৰ হাৰৰ সময়সীমা',
    hesaplaniyor: 'আপোনাৰ নামাজ পঢ়াৰ হাৰ গণনা কৰা হৈছে',
    bosBaslik: 'এতিয়াও কোনো ৰেকৰ্ড নাই',
    bosAciklama: 'আপুনি নামাজ চিহ্নিত কৰাৰ লগে লগে ইয়াত দেখা পাব।',
    yuzde: '{n}%',
    kilinan: 'পঢ়া হ’ল',
    oran: 'হাৰ',
    enIyiGun: 'সৰ্বোত্তম দিন',
    haftaHedefi: 'এই সপ্তাহৰ লক্ষ্য',
    hedefAlt: cogul({ one: 'আপোনাৰ ধাৰাবাহিকতাৰ লক্ষ্য অনুসৰি: দিনে {n} ওৱাক্ত', other: 'আপোনাৰ ধাৰাবাহিকতাৰ লক্ষ্য অনুসৰি: দিনে {n} ওৱাক্ত' }),
    kilinanNamaz: 'পঢ়া নামাজ',
    hedefeUlasan: 'লক্ষ্যত উপনীত দিন',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'নামাজ পঢ়া দিন',
    vakitVakit: 'ওৱাক্ত অনুসৰি',
    yuzdeErisim: '{ad}: {n} শতাংশ',
  },
  rozetler: {
    baslik: 'স্তৰ আৰু বেজ',
    seviye: 'স্তৰ {n}',
    puan: 'পইণ্ট',
    kalanErisim: cogul({ one: '{rank} স্তৰলৈ {n} পইণ্ট বাকী', other: '{rank} স্তৰলৈ {n} পইণ্ট বাকী' }),
    enYuksek: 'আপুনি সৰ্বোচ্চ স্তৰত আছে',
    kalan: cogul({ one: '{rank} পাবলৈ {n} পইণ্ট বাকী', other: '{rank} পাবলৈ {n} পইণ্ট বাকী' }),
    kilinanErisim: cogul({ one: '{n} ওৱাক্ত নামাজ পঢ়া হ’ল', other: '{n} ওৱাক্ত নামাজ পঢ়া হ’ল' }),
    namaz: cogul({ one: 'নামাজ', other: 'নামাজ' }),
    rozetErisim: '{toplam}টা বেজৰ ভিতৰত {n}টা লাভ কৰা হ’ল',
    rozet: cogul({ one: 'বেজ', other: 'বেজ' }),
  },
};
