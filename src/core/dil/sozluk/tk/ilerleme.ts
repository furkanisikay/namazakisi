import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ösüş',
  kilma: {
    baslik: 'Namaz okamak derejesi',
    haftalik: 'Hepdelik',
    aylik: 'Aýlyk',
    donemErisim: 'Namaz okamak derejesiniň döwri',
    hesaplaniyor: 'Namaz okamak derejäňiz hasaplanýar',
    bosBaslik: 'Entek ýazgy ýok',
    bosAciklama: 'Namazlaryňyzy bellänçäňiz şu ýerde görüner.',
    yuzde: '{n} %',
    kilinan: 'Okalan',
    oran: 'Dereje',
    enIyiGun: 'Iň gowy gün',
    haftaHedefi: 'Şu hepdäniň maksady',
    hedefAlt: cogul({ one: 'Yzygiderlik maksadyňyza görä: günde {n} namaz', other: 'Yzygiderlik maksadyňyza görä: günde {n} namaz' }),
    kilinanNamaz: 'Okalan namazlar',
    hedefeUlasan: 'Maksada ýeten günler',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Namaz okalan günler',
    vakitVakit: 'Wagtlar boýunça',
    yuzdeErisim: '{ad}: göterim {n}',
  },
  rozetler: {
    baslik: 'Dereje we nyşanlar',
    seviye: 'Dereje {n}',
    puan: 'Bal',
    kalanErisim: cogul({ one: '{rank} derejesine {n} bal galdy', other: '{rank} derejesine {n} bal galdy' }),
    enYuksek: 'Iň ýokary derejedesiňiz',
    kalan: cogul({ one: '{rank} üçin {n} bal', other: '{rank} üçin {n} bal' }),
    kilinanErisim: cogul({ one: '{n} namaz okaldy', other: '{n} namaz okaldy' }),
    namaz: cogul({ one: 'namaz', other: 'namaz' }),
    rozetErisim: '{toplam} nyşandan {n} sanysy gazanyldy',
    rozet: cogul({ one: 'nyşan', other: 'nyşan' }),
  },
};
