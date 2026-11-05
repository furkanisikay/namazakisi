import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Enkulaakulana',
  kilma: {
    baslik: 'Omuwendo gw’okusaala',
    haftalik: 'Buli wiiki',
    aylik: 'Buli mwezi',
    donemErisim: 'Ekiseera ky’omuwendo gw’okusaala',
    hesaplaniyor: 'Omuwendo gwo ogw’okusaala gubalibwa',
    bosBaslik: 'Tewannabaawo biwandiiko',
    bosAciklama: 'Birabika wano ng’oteeka obubonero ku sswala zo.',
    yuzde: '{n}%',
    kilinan: 'Ezisaaliddwa',
    oran: 'Omuwendo',
    enIyiGun: 'Olunaku olusinga',
    haftaHedefi: 'Ekigendererwa kya wiiki eno',
    hedefAlt: cogul({ one: 'Okusinziira ku kigendererwa ky’omuddiriŋŋanwa gwo: esswala {n} buli lunaku', other: 'Okusinziira ku kigendererwa ky’omuddiriŋŋanwa gwo: esswala {n} buli lunaku' }),
    kilinanNamaz: 'Esswala ezisaaliddwa',
    hedefeUlasan: 'Ennaku ezatuuka ku kigendererwa',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Ennaku ezaasaalibwamu',
    vakitVakit: 'Okusinziira ku sswala',
    yuzdeErisim: '{ad}: ebitundu {n} ku kikumi',
  },
  rozetler: {
    baslik: 'Omutendera n’emidaali',
    seviye: 'Omutendera {n}',
    puan: 'Obubonero',
    kalanErisim: cogul({ one: 'Akabonero {n} okutuuka ku mutendera gwa {rank}', other: 'Obubonero {n} okutuuka ku mutendera gwa {rank}' }),
    enYuksek: 'Oli ku mutendera ogusinga waggulu',
    kalan: cogul({ one: 'Akabonero {n} okutuuka ku {rank}', other: 'Obubonero {n} okutuuka ku {rank}' }),
    kilinanErisim: cogul({ one: 'Esswala {n} esaaliddwa', other: 'Esswala {n} zisaaliddwa' }),
    namaz: cogul({ one: 'esswala', other: 'esswala' }),
    rozetErisim: 'Emidaali {n} ku {toplam} gifunye',
    rozet: cogul({ one: 'omudaali', other: 'emidaali' }),
  },
};
