import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Iterambere',
  kilma: {
    baslik: 'Igipimo c’amasengesho',
    haftalik: 'Ku ndwi',
    aylik: 'Ku kwezi',
    donemErisim: 'Igihe c’igipimo c’amasengesho',
    hesaplaniyor: 'Igipimo c’amasengesho canyu kiriko kiraharurwa',
    bosBaslik: 'Nta vyanditswe biraba',
    bosAciklama: 'Bizoboneka ngaha uko mwemeza amasengesho yanyu.',
    yuzde: '{n}%',
    kilinan: 'Ayasenzwe',
    oran: 'Igipimo',
    enIyiGun: 'Umusi mwiza kuruta',
    haftaHedefi: 'Intumbero y’iyi ndwi',
    hedefAlt: cogul({ one: 'Bivanye n’intumbero y’uruhererekane: isengesho {n} ku musi', other: 'Bivanye n’intumbero y’uruhererekane: amasengesho {n} ku musi' }),
    kilinanNamaz: 'Amasengesho yasenzwe',
    hedefeUlasan: 'Imisi yashikije intumbero',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Imisi yasenzwemwo',
    vakitVakit: 'Ku isengesho rimwe rimwe',
    yuzdeErisim: '{ad}: ku ijana {n}',
  },
  rozetler: {
    baslik: 'Intera n’imidari',
    seviye: 'Intera {n}',
    puan: 'Amanota',
    kalanErisim: cogul({ one: 'Inota {n} kugira mushike ku ntera ya {rank}', other: 'Amanota {n} kugira mushike ku ntera ya {rank}' }),
    enYuksek: 'Muri ku ntera yo hejuru kuruta izindi',
    kalan: cogul({ one: 'Inota {n} gushika kuri {rank}', other: 'Amanota {n} gushika kuri {rank}' }),
    kilinanErisim: cogul({ one: 'Isengesho {n} ryasenzwe', other: 'Amasengesho {n} yasenzwe' }),
    namaz: cogul({ one: 'isengesho', other: 'amasengesho' }),
    rozetErisim: 'Imidari {n} kuri {toplam} yaronswe',
    rozet: cogul({ one: 'umudari', other: 'imidari' }),
  },
};
