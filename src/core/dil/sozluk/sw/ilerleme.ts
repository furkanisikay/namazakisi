import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Maendeleo',
  kilma: {
    baslik: 'Kiwango cha kuswali',
    haftalik: 'Kila wiki',
    aylik: 'Kila mwezi',
    donemErisim: 'Kipindi cha kiwango cha kuswali',
    hesaplaniyor: 'Inakokotoa kiwango chako cha kuswali',
    bosBaslik: 'Bado hakuna kumbukumbu',
    bosAciklama: 'Kitaonekana hapa unapoweka alama kwenye Swala zako.',
    yuzde: '{n}%',
    kilinan: 'Zilizoswaliwa',
    oran: 'Kiwango',
    enIyiGun: 'Siku bora',
    haftaHedefi: 'Lengo la wiki hii',
    hedefAlt: cogul({ one: 'Kulingana na lengo la mfululizo wako: Swala {n} kwa siku', other: 'Kulingana na lengo la mfululizo wako: Swala {n} kwa siku' }),
    kilinanNamaz: 'Swala zilizoswaliwa',
    hedefeUlasan: 'Siku zilizofikia lengo',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Siku zenye Swala',
    vakitVakit: 'Kwa kila Swala',
    yuzdeErisim: '{ad}: asilimia {n}',
  },
  rozetler: {
    baslik: 'Ngazi na beji',
    seviye: 'Ngazi {n}',
    puan: 'Pointi',
    kalanErisim: cogul({ one: 'Pointi {n} hadi ngazi ya {rank}', other: 'Pointi {n} hadi ngazi ya {rank}' }),
    enYuksek: 'Uko kwenye ngazi ya juu kabisa',
    kalan: cogul({ one: 'Pointi {n} hadi {rank}', other: 'Pointi {n} hadi {rank}' }),
    kilinanErisim: cogul({ one: 'Swala {n} imeswaliwa', other: 'Swala {n} zimeswaliwa' }),
    namaz: cogul({ one: 'Swala', other: 'Swala' }),
    rozetErisim: 'Beji {n} kati ya {toplam} zimepatikana',
    rozet: cogul({ one: 'beji', other: 'beji' }),
  },
};
