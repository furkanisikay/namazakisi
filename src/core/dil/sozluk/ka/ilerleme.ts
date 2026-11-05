import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'პროგრესი',
  kilma: {
    baslik: 'ლოცვის მაჩვენებელი',
    haftalik: 'კვირის',
    aylik: 'თვის',
    donemErisim: 'ლოცვის მაჩვენებლის პერიოდი',
    hesaplaniyor: 'ლოცვის მაჩვენებელი გამოითვლება',
    bosBaslik: 'ჩანაწერები ჯერ არ არის',
    bosAciklama: 'აქ გამოჩნდება, როცა ლოცვებს მონიშნავთ.',
    yuzde: '{n}%',
    kilinan: 'შესრულებული',
    oran: 'მაჩვენებელი',
    enIyiGun: 'საუკეთესო დღე',
    haftaHedefi: 'ამ კვირის მიზანი',
    hedefAlt: cogul({ one: 'სერიის მიზნის მიხედვით: დღეში {n} ლოცვა', other: 'სერიის მიზნის მიხედვით: დღეში {n} ლოცვა' }),
    kilinanNamaz: 'შესრულებული ლოცვები',
    hedefeUlasan: 'მიზნის დღეები',
    ayYil: '{ay}, {yil}',
    namazKilinanGun: 'ლოცვის დღეები',
    vakitVakit: 'ლოცვების მიხედვით',
    yuzdeErisim: '{ad}: {n} პროცენტი',
  },
  rozetler: {
    baslik: 'დონე და სამკერდე ნიშნები',
    seviye: 'დონე {n}',
    puan: 'ქულები',
    kalanErisim: cogul({ one: 'დონემდე „{rank}“ დარჩა {n} ქულა', other: 'დონემდე „{rank}“ დარჩა {n} ქულა' }),
    enYuksek: 'უმაღლეს დონეზე ხართ',
    kalan: cogul({ one: '„{rank}“-მდე {n} ქულა', other: '„{rank}“-მდე {n} ქულა' }),
    kilinanErisim: cogul({ one: 'შესრულებულია {n} ლოცვა', other: 'შესრულებულია {n} ლოცვა' }),
    namaz: cogul({ one: 'ლოცვა', other: 'ლოცვა' }),
    rozetErisim: 'მოპოვებულია {n} ნიშანი {toplam}-დან',
    rozet: cogul({ one: 'ნიშანი', other: 'ნიშანი' }),
  },
};
