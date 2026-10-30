import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ci gabanku',
  kilma: {
    baslik: 'Yawan sallar da aka yi',
    haftalik: 'Na mako',
    aylik: 'Na wata',
    donemErisim: 'Lokacin ƙididdigar salla',
    hesaplaniyor: 'Ana lissafa yawan sallolinku',
    bosBaslik: 'Babu bayanai tukuna',
    bosAciklama: 'Zai bayyana a nan yayin da kuke yin alamar sallolinku.',
    yuzde: '{n}%',
    kilinan: 'An yi',
    oran: 'Kaso',
    enIyiGun: 'Rana mafi kyau',
    haftaHedefi: 'Burin wannan mako',
    hedefAlt: cogul({ one: 'Bisa ga burin jerinku: salla {n} a rana', other: 'Bisa ga burin jerinku: salloli {n} a rana' }),
    kilinanNamaz: 'Sallolin da aka yi',
    hedefeUlasan: 'Kwanakin da aka cimma buri',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Kwanakin da aka yi salla',
    vakitVakit: 'Bisa ga salla',
    yuzdeErisim: '{ad}: kashi {n} cikin ɗari',
  },
  rozetler: {
    baslik: 'Mataki da lambobin yabo',
    seviye: 'Mataki {n}',
    puan: 'Maki',
    kalanErisim: cogul({ one: 'Maki {n} ya rage zuwa matakin {rank}', other: 'Maki {n} sun rage zuwa matakin {rank}' }),
    enYuksek: 'Kuna a mataki mafi girma',
    kalan: cogul({ one: 'Maki {n} zuwa {rank}', other: 'Maki {n} zuwa {rank}' }),
    kilinanErisim: cogul({ one: 'An yi salla {n}', other: 'An yi salloli {n}' }),
    namaz: cogul({ one: 'salla', other: 'salloli' }),
    rozetErisim: 'An sami lamba {n} cikin {toplam}',
    rozet: cogul({ one: 'lamba', other: 'lambobi' }),
  },
};
