import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Πρόοδος',
  kilma: {
    baslik: 'Ποσοστό προσευχής',
    haftalik: 'Εβδομαδιαία',
    aylik: 'Μηνιαία',
    donemErisim: 'Περίοδος ποσοστού προσευχής',
    hesaplaniyor: 'Υπολογισμός του ποσοστού προσευχής',
    bosBaslik: 'Δεν υπάρχουν ακόμη καταγραφές',
    bosAciklama: 'Εμφανίζεται εδώ καθώς σημειώνετε τις προσευχές σας.',
    yuzde: '{n}%',
    kilinan: 'Τελέστηκαν',
    oran: 'Ποσοστό',
    enIyiGun: 'Καλύτερη ημέρα',
    haftaHedefi: 'Στόχος εβδομάδας',
    hedefAlt: cogul({ one: 'Με βάση τον στόχο σερί: {n} προσευχή την ημέρα', other: 'Με βάση τον στόχο σερί: {n} προσευχές την ημέρα' }),
    kilinanNamaz: 'Τελεσμένες προσευχές',
    hedefeUlasan: 'Ημέρες εντός στόχου',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Ημέρες με προσευχή',
    vakitVakit: 'Ανά προσευχή',
    yuzdeErisim: '{ad}: {n} τοις εκατό',
  },
  rozetler: {
    baslik: 'Επίπεδο και διακριτικά',
    seviye: 'Επίπεδο {n}',
    puan: 'Πόντοι',
    kalanErisim: cogul({ one: '{n} πόντος έως το επίπεδο {rank}', other: '{n} πόντοι έως το επίπεδο {rank}' }),
    enYuksek: 'Βρίσκεστε στο υψηλότερο επίπεδο',
    kalan: cogul({ one: '{n} πόντος έως {rank}', other: '{n} πόντοι έως {rank}' }),
    kilinanErisim: cogul({ one: 'Τελέστηκε {n} προσευχή', other: 'Τελέστηκαν {n} προσευχές' }),
    namaz: cogul({ one: 'προσευχή', other: 'προσευχές' }),
    rozetErisim: 'Κερδήθηκαν {n} από {toplam} διακριτικά',
    rozet: cogul({ one: 'διακριτικό', other: 'διακριτικά' }),
  },
};
