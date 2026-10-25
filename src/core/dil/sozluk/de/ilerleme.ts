import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Fortschritt',
  kilma: {
    baslik: 'Gebetsquote',
    haftalik: 'Wöchentlich',
    aylik: 'Monatlich',
    donemErisim: 'Zeitraum der Gebetsquote',
    hesaplaniyor: 'Ihre Gebetsquote wird berechnet',
    bosBaslik: 'Noch keine Einträge',
    bosAciklama: 'Erscheint hier, sobald Sie Ihre Gebete markieren.',
    yuzde: '{n} %',
    kilinan: 'Gebetet',
    oran: 'Quote',
    enIyiGun: 'Bester Tag',
    haftaHedefi: 'Ziel dieser Woche',
    hedefAlt: cogul({ one: 'Nach Ihrem Serienziel: {n} Gebet pro Tag', other: 'Nach Ihrem Serienziel: {n} Gebete pro Tag' }),
    kilinanNamaz: 'Verrichtete Gebete',
    hedefeUlasan: 'Tage im Ziel',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Tage mit Gebet',
    vakitVakit: 'Nach Gebet',
    yuzdeErisim: '{ad}: {n} Prozent',
  },
  rozetler: {
    baslik: 'Stufe und Abzeichen',
    seviye: 'Stufe {n}',
    puan: 'Punkte',
    kalanErisim: cogul({ one: 'Noch {n} Punkt bis zur Stufe {rank}', other: 'Noch {n} Punkte bis zur Stufe {rank}' }),
    enYuksek: 'Sie haben die höchste Stufe erreicht',
    kalan: cogul({ one: 'Noch {n} Punkt bis {rank}', other: 'Noch {n} Punkte bis {rank}' }),
    kilinanErisim: cogul({ one: '{n} Gebet verrichtet', other: '{n} Gebete verrichtet' }),
    namaz: cogul({ one: 'Gebet', other: 'Gebete' }),
    rozetErisim: '{n} von {toplam} Abzeichen erhalten',
    rozet: cogul({ one: 'Abzeichen', other: 'Abzeichen' }),
  },
};
