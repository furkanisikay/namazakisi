import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Framsteg',
  kilma: {
    baslik: 'Bönefrekvens',
    haftalik: 'Vecka',
    aylik: 'Månad',
    donemErisim: 'Period för bönefrekvens',
    hesaplaniyor: 'Beräknar din bönefrekvens',
    bosBaslik: 'Inga registreringar än',
    bosAciklama: 'Visas här när du markerar dina böner.',
    yuzde: '{n} %',
    kilinan: 'Förrättade',
    oran: 'Andel',
    enIyiGun: 'Bästa dag',
    haftaHedefi: 'Veckans mål',
    hedefAlt: cogul({ one: 'Utifrån ditt svitmål: {n} bön om dagen', other: 'Utifrån ditt svitmål: {n} böner om dagen' }),
    kilinanNamaz: 'Förrättade böner',
    hedefeUlasan: 'Dagar med nått mål',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Dagar med bön',
    vakitVakit: 'Per bön',
    yuzdeErisim: '{ad}: {n} procent',
  },
  rozetler: {
    baslik: 'Nivå och märken',
    seviye: 'Nivå {n}',
    puan: 'Poäng',
    kalanErisim: cogul({ one: '{n} poäng till nivån {rank}', other: '{n} poäng till nivån {rank}' }),
    enYuksek: 'Du är på högsta nivån',
    kalan: cogul({ one: '{n} poäng till {rank}', other: '{n} poäng till {rank}' }),
    kilinanErisim: cogul({ one: '{n} bön förrättad', other: '{n} böner förrättade' }),
    namaz: cogul({ one: 'bön', other: 'böner' }),
    rozetErisim: '{n} av {toplam} märken uppnådda',
    rozet: cogul({ one: 'märke', other: 'märken' }),
  },
};
