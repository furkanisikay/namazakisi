import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'অগ্রগতি',
  kilma: {
    baslik: 'নামাজ পড়ার হার',
    haftalik: 'সাপ্তাহিক',
    aylik: 'মাসিক',
    donemErisim: 'নামাজ পড়ার হারের সময়কাল',
    hesaplaniyor: 'আপনার নামাজ পড়ার হার হিসাব করা হচ্ছে',
    bosBaslik: 'এখনো কোনো রেকর্ড নেই',
    bosAciklama: 'নামাজ চিহ্নিত করতে থাকলে এখানে দেখা যাবে।',
    yuzde: '{n}%',
    kilinan: 'পড়া হয়েছে',
    oran: 'হার',
    enIyiGun: 'সেরা দিন',
    haftaHedefi: 'এই সপ্তাহের লক্ষ্য',
    hedefAlt: cogul({ one: 'আপনার ধারাবাহিকতার লক্ষ্য অনুযায়ী: দিনে {n} ওয়াক্ত', other: 'আপনার ধারাবাহিকতার লক্ষ্য অনুযায়ী: দিনে {n} ওয়াক্ত' }),
    kilinanNamaz: 'পড়া নামাজ',
    hedefeUlasan: 'লক্ষ্য পূরণের দিন',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'নামাজ পড়ার দিন',
    vakitVakit: 'ওয়াক্ত অনুযায়ী',
    yuzdeErisim: '{ad}: {n} শতাংশ',
  },
  rozetler: {
    baslik: 'স্তর ও ব্যাজ',
    seviye: 'স্তর {n}',
    puan: 'পয়েন্ট',
    kalanErisim: cogul({ one: '{rank} স্তরে পৌঁছাতে {n} পয়েন্ট বাকি', other: '{rank} স্তরে পৌঁছাতে {n} পয়েন্ট বাকি' }),
    enYuksek: 'আপনি সর্বোচ্চ স্তরে আছেন',
    kalan: cogul({ one: '{rank} পর্যন্ত {n} পয়েন্ট বাকি', other: '{rank} পর্যন্ত {n} পয়েন্ট বাকি' }),
    kilinanErisim: cogul({ one: '{n} ওয়াক্ত নামাজ পড়া হয়েছে', other: '{n} ওয়াক্ত নামাজ পড়া হয়েছে' }),
    namaz: cogul({ one: 'নামাজ', other: 'নামাজ' }),
    rozetErisim: '{toplam}টির মধ্যে {n}টি ব্যাজ অর্জিত',
    rozet: cogul({ one: 'ব্যাজ', other: 'ব্যাজ' }),
  },
};
