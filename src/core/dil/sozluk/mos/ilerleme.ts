import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Taoor-kẽnde',
  kilma: {
    baslik: 'Pʋʋsg sõore',
    haftalik: 'Semeen',
    aylik: 'Kiuugu',
    donemErisim: 'Pʋʋsg sõorã wakato',
    hesaplaniyor: 'D sõdda y pʋʋsg sõorã',
    bosBaslik: 'Gʋlsg ka be ye',
    bosAciklama: 'Y sã n gʋls y pʋʋs-rãmbã, a na n puk ka.',
    yuzde: '{n}%',
    kilinan: 'Pʋʋsa',
    oran: 'Sõore',
    enIyiGun: 'Raar sẽn yɩɩd sõma',
    haftaHedefi: 'Semeen-kãngã raabo',
    hedefAlt: cogul({ one: 'Y kellgã raabo: {n} pʋʋsg raar fãa', other: 'Y kellgã raabo: {n} pʋʋsg raar fãa' }),
    kilinanNamaz: 'Pʋʋs-rãmb sẽn pʋʋsa',
    hedefeUlasan: 'Rasem sẽn ta raabã',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Rasem sẽn tar pʋʋsgo',
    vakitVakit: 'Pʋʋsg fãa',
    yuzdeErisim: '{ad}: {n} pursã',
  },
  rozetler: {
    baslik: 'Zĩig la kɩba',
    seviye: 'Zĩig {n}',
    puan: 'Sõore',
    kalanErisim: cogul({ one: '{n} sõor n kell tɩ y ta {rank} zĩigã', other: '{n} sõor n kell tɩ y ta {rank} zĩigã' }),
    enYuksek: 'Y bee zĩig sẽn yɩɩd fãa',
    kalan: cogul({ one: '{n} sõor n kell n tãag {rank}', other: '{n} sõor n kell n tãag {rank}' }),
    kilinanErisim: cogul({ one: '{n} pʋʋsg sẽn pʋʋsa', other: '{n} pʋʋsg sẽn pʋʋsa' }),
    namaz: cogul({ one: 'pʋʋsgo', other: 'pʋʋsgo' }),
    rozetErisim: 'Y paama kɩba {n} {toplam} pʋgẽ',
    rozet: cogul({ one: 'kɩbga', other: 'kɩba' }),
  },
};
