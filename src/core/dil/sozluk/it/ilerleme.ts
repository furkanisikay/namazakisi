import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Progressi',
  kilma: {
    baslik: 'Tasso di preghiera',
    haftalik: 'Settimanale',
    aylik: 'Mensile',
    donemErisim: 'Periodo del tasso di preghiera',
    hesaplaniyor: 'Calcolo del tasso di preghiera in corso',
    bosBaslik: 'Ancora nessun dato',
    bosAciklama: 'Compare qui man mano che segna le preghiere.',
    yuzde: '{n}%',
    kilinan: 'Compiute',
    oran: 'Tasso',
    enIyiGun: 'Giorno migliore',
    haftaHedefi: 'Obiettivo della settimana',
    hedefAlt: cogul({ one: 'In base al suo obiettivo di serie: {n} preghiera al giorno', many: 'In base al suo obiettivo di serie: {n} di preghiere al giorno', other: 'In base al suo obiettivo di serie: {n} preghiere al giorno' }),
    kilinanNamaz: 'Preghiere compiute',
    hedefeUlasan: 'Giorni a obiettivo',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Giorni con preghiera',
    vakitVakit: 'Per orario',
    yuzdeErisim: '{ad}: {n} per cento',
  },
  rozetler: {
    baslik: 'Livello e distintivi',
    seviye: 'Livello {n}',
    puan: 'Punti',
    kalanErisim: cogul({ one: '{n} punto al livello {rank}', many: '{n} di punti al livello {rank}', other: '{n} punti al livello {rank}' }),
    enYuksek: 'Ha raggiunto il livello più alto',
    kalan: cogul({ one: '{n} punto a {rank}', many: '{n} di punti a {rank}', other: '{n} punti a {rank}' }),
    kilinanErisim: cogul({ one: '{n} preghiera compiuta', many: '{n} di preghiere compiute', other: '{n} preghiere compiute' }),
    namaz: cogul({ one: 'preghiera', many: 'preghiere', other: 'preghiere' }),
    rozetErisim: '{n} distintivi ottenuti su {toplam}',
    rozet: cogul({ one: 'distintivo', many: 'distintivi', other: 'distintivi' }),
  },
};
