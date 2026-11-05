import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Nkɔsoɔ',
  kilma: {
    baslik: 'Nyamefrɛ dodoɔ',
    haftalik: 'Nnawɔtwe',
    aylik: 'Bosome',
    donemErisim: 'Berɛ a wɔde bu Nyamefrɛ dodoɔ',
    hesaplaniyor: 'Ɛrebu wo Nyamefrɛ dodoɔ',
    bosBaslik: 'Nsɛm biara nni hɔ',
    bosAciklama: 'Ɛbɛba ha sɛ wokyerɛ wo Nyamefrɛ a.',
    yuzde: '{n}%',
    kilinan: 'Wɔayɛ',
    oran: 'Dodoɔ',
    enIyiGun: 'Da a ɛyɛ papa sen biara',
    haftaHedefi: 'Nnawɔtwe yi botaeɛ',
    hedefAlt: cogul({ one: 'Ɛgyina wo toatoaso botaeɛ so: Nyamefrɛ {n} da biara', other: 'Ɛgyina wo toatoaso botaeɛ so: Nyamefrɛ {n} da biara' }),
    kilinanNamaz: 'Nyamefrɛ a wɔayɛ',
    hedefeUlasan: 'Nna a woduruu botaeɛ',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Nna a woyɛɛ Nyamefrɛ',
    vakitVakit: 'Nyamefrɛ biara',
    yuzdeErisim: '{ad}: ɔha mu {n}',
  },
  rozetler: {
    baslik: 'Gyinabea ne agyiraeɛ',
    seviye: 'Gyinabea {n}',
    puan: 'Akontaa',
    kalanErisim: cogul({ one: 'Akontaa {n} aka ansa na woaduru {rank} gyinabea', other: 'Akontaa {n} aka ansa na woaduru {rank} gyinabea' }),
    enYuksek: 'Woaduru gyinabea a ɛkorɔn sen biara',
    kalan: cogul({ one: 'Akontaa {n} aka akɔ {rank}', other: 'Akontaa {n} aka akɔ {rank}' }),
    kilinanErisim: cogul({ one: 'Nyamefrɛ {n} a wɔayɛ', other: 'Nyamefrɛ {n} a wɔayɛ' }),
    namaz: cogul({ one: 'Nyamefrɛ', other: 'Nyamefrɛ' }),
    rozetErisim: 'Woanya agyiraeɛ {n} wɔ {toplam} mu',
    rozet: cogul({ one: 'agyiraeɛ', other: 'agyiraeɛ' }),
  },
};
