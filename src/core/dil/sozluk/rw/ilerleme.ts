import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Iterambere',
  kilma: {
    baslik: 'Igipimo cy’iswala',
    haftalik: 'Icyumweru',
    aylik: 'Ukwezi',
    donemErisim: 'Igihe cy’igipimo cy’iswala',
    hesaplaniyor: 'Igipimo cyanyu cy’iswala kiri kubarwa',
    bosBaslik: 'Nta nyandiko ziraboneka',
    bosAciklama: 'Bigaragara hano uko mwemeza iswala zanyu.',
    yuzde: '{n}%',
    kilinan: 'Zasaliwe',
    oran: 'Igipimo',
    enIyiGun: 'Umunsi mwiza kurusha iyindi',
    haftaHedefi: 'Intego y’iki cyumweru',
    hedefAlt: cogul({ one: 'Hashingiwe ku ntego y’uruhererekane rwanyu: iswala {n} ku munsi', other: 'Hashingiwe ku ntego y’uruhererekane rwanyu: iswala {n} ku munsi' }),
    kilinanNamaz: 'Iswala zasaliwe',
    hedefeUlasan: 'Iminsi yageze ku ntego',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Iminsi yasaliwemo',
    vakitVakit: 'Hakurikijwe iswala',
    yuzdeErisim: '{ad}: ijanisha {n}',
  },
  rozetler: {
    baslik: 'Urwego n’imidari',
    seviye: 'Urwego {n}',
    puan: 'Amanota',
    kalanErisim: cogul({ one: 'Amanota {n} ngo mugere ku rwego rwa {rank}', other: 'Amanota {n} ngo mugere ku rwego rwa {rank}' }),
    enYuksek: 'Muri ku rwego rwo hejuru',
    kalan: cogul({ one: 'Amanota {n} ngo mugere kuri {rank}', other: 'Amanota {n} ngo mugere kuri {rank}' }),
    kilinanErisim: cogul({ one: 'Iswala {n} zasaliwe', other: 'Iswala {n} zasaliwe' }),
    namaz: cogul({ one: 'iswala', other: 'iswala' }),
    rozetErisim: 'Imidari {n} kuri {toplam} yabonetse',
    rozet: cogul({ one: 'imidari', other: 'imidari' }),
  },
};
