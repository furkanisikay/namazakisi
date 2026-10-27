import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Napredak',
  kilma: {
    baslik: 'Stopa klanjanja',
    haftalik: 'Sedmično',
    aylik: 'Mjesečno',
    donemErisim: 'Period stope klanjanja',
    hesaplaniyor: 'Izračunava se Vaša stopa klanjanja',
    bosBaslik: 'Još nema zapisa',
    bosAciklama: 'Pojavljuje se ovdje kako označavate svoje namaze.',
    yuzde: '{n} %',
    kilinan: 'Klanjano',
    oran: 'Stopa',
    enIyiGun: 'Najbolji dan',
    haftaHedefi: 'Cilj ove sedmice',
    hedefAlt: cogul({
      one: 'Prema Vašem cilju niza: {n} vakat dnevno',
      few: 'Prema Vašem cilju niza: {n} vakta dnevno',
      other: 'Prema Vašem cilju niza: {n} vakata dnevno',
    }),
    kilinanNamaz: 'Klanjani namazi',
    hedefeUlasan: 'Dani s ispunjenim ciljem',
    ayYil: '{ay} {yil}.',
    namazKilinanGun: 'Dani s klanjanim namazom',
    vakitVakit: 'Po vaktima',
    yuzdeErisim: '{ad}: {n} posto',
  },
  rozetler: {
    baslik: 'Nivo i značke',
    seviye: 'Nivo {n}',
    puan: 'Bodovi',
    kalanErisim: cogul({
      one: 'Do nivoa {rank} preostao je {n} bod',
      few: 'Do nivoa {rank} preostala su {n} boda',
      other: 'Do nivoa {rank} preostalo je {n} bodova',
    }),
    enYuksek: 'Na najvišem ste nivou',
    kalan: cogul({ one: '{rank}: još {n} bod', few: '{rank}: još {n} boda', other: '{rank}: još {n} bodova' }),
    kilinanErisim: cogul({ one: 'Klanjan {n} namaz', few: 'Klanjana {n} namaza', other: 'Klanjano {n} namaza' }),
    namaz: cogul({ one: 'namaz', few: 'namaza', other: 'namaza' }),
    rozetErisim: 'Osvojeno {n} od {toplam} znački',
    rozet: cogul({ one: 'značka', few: 'značke', other: 'znački' }),
  },
};
