import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Voortgang',
  kilma: {
    baslik: 'Gebedsscore',
    haftalik: 'Wekelijks',
    aylik: 'Maandelijks',
    donemErisim: 'Periode van de gebedsscore',
    hesaplaniyor: 'Uw gebedsscore wordt berekend',
    bosBaslik: 'Nog geen gegevens',
    bosAciklama: 'Verschijnt hier zodra u uw gebeden markeert.',
    yuzde: '{n}%',
    kilinan: 'Gebeden',
    oran: 'Score',
    enIyiGun: 'Beste dag',
    haftaHedefi: 'Doel van deze week',
    hedefAlt: cogul({ one: 'Volgens uw reeksdoel: {n} gebed per dag', other: 'Volgens uw reeksdoel: {n} gebeden per dag' }),
    kilinanNamaz: 'Verrichte gebeden',
    hedefeUlasan: 'Dagen op doel',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Dagen met gebed',
    vakitVakit: 'Per gebed',
    yuzdeErisim: '{ad}: {n} procent',
  },
  rozetler: {
    baslik: 'Niveau en badges',
    seviye: 'Niveau {n}',
    puan: 'Punten',
    kalanErisim: cogul({ one: 'Nog {n} punt tot niveau {rank}', other: 'Nog {n} punten tot niveau {rank}' }),
    enYuksek: 'U zit op het hoogste niveau',
    kalan: cogul({ one: 'Nog {n} punt tot {rank}', other: 'Nog {n} punten tot {rank}' }),
    kilinanErisim: cogul({ one: '{n} gebed verricht', other: '{n} gebeden verricht' }),
    namaz: cogul({ one: 'gebed', other: 'gebeden' }),
    rozetErisim: '{n} van {toplam} badges behaald',
    rozet: cogul({ one: 'badge', other: 'badges' }),
  },
};
