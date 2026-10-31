import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Napredak',
  kilma: {
    baslik: 'Udio klanjanja',
    haftalik: 'Tjedno',
    aylik: 'Mjesečno',
    donemErisim: 'Razdoblje udjela klanjanja',
    hesaplaniyor: 'Izračunava se udio klanjanja',
    bosBaslik: 'Još nema zapisa',
    bosAciklama: 'Pojavljuje se ovdje kako označavate namaze.',
    yuzde: '{n} %',
    kilinan: 'Klanjano',
    oran: 'Udio',
    enIyiGun: 'Najbolji dan',
    haftaHedefi: 'Cilj ovog tjedna',
    hedefAlt: cogul({
      one: 'Prema cilju niza: {n} namaz dnevno',
      few: 'Prema cilju niza: {n} namaza dnevno',
      other: 'Prema cilju niza: {n} namaza dnevno',
    }),
    kilinanNamaz: 'Klanjani namazi',
    hedefeUlasan: 'Dani s ostvarenim ciljem',
    ayYil: '{ay} {yil}.',
    namazKilinanGun: 'Dani s namazom',
    vakitVakit: 'Po namazima',
    yuzdeErisim: '{ad}: {n} posto',
  },
  rozetler: {
    baslik: 'Razina i značke',
    seviye: 'Razina {n}',
    puan: 'Bodovi',
    kalanErisim: cogul({ one: 'Do razine {rank} {n} bod', few: 'Do razine {rank} {n} boda', other: 'Do razine {rank} {n} bodova' }),
    enYuksek: 'Na najvišoj ste razini',
    kalan: cogul({ one: 'Do razine {rank}: {n} bod', few: 'Do razine {rank}: {n} boda', other: 'Do razine {rank}: {n} bodova' }),
    kilinanErisim: cogul({ one: 'Klanjan {n} namaz', few: 'Klanjana {n} namaza', other: 'Klanjano {n} namaza' }),
    namaz: cogul({ one: 'namaz', few: 'namaza', other: 'namaza' }),
    rozetErisim: 'Osvojeno {n} od {toplam} znački',
    rozet: cogul({ one: 'značka', few: 'značke', other: 'znački' }),
  },
};
