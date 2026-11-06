import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Ossiyya',
  kilma: {
    baslik: 'Salat caddo',
    haftalik: 'Malcina ayro',
    aylik: 'Alsa',
    donemErisim: 'Salat caddoh wakti',
    hesaplaniyor: 'Sinni salat caddo cisaabimta',
    bosBaslik: 'Hanna maxco mali',
    bosAciklama: 'Sinni salat abime hayisseenik, ama addal ubbulla.',
    yuzde: '{n}%',
    kilinan: 'Abime',
    oran: 'Caddo',
    enIyiGun: 'Meqe ayro',
    haftaHedefi: 'Ama malcina ayroh hadaf',
    hedefAlt: cogul({ one: 'Sinni gexsoh hadaf elle: ayrol {n} salat', other: 'Sinni gexsoh hadaf elle: ayrol {n} salat' }),
    kilinanNamaz: 'Abime salat',
    hedefeUlasan: 'Hadafal yeggeeye ayro',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Salat abime ayro',
    vakitVakit: 'Salat elle',
    yuzdeErisim: '{ad}: {n} boolok',
  },
  rozetler: {
    baslik: 'Darja kee calaamat',
    seviye: 'Darja {n}',
    puan: 'Nuqta',
    kalanErisim: cogul({ one: '{rank} darjal {n} nuqta raqta', other: '{rank} darjal {n} nuqta raqta' }),
    enYuksek: 'Fayya le darjal tanin',
    kalan: cogul({ one: '{rank} fanah {n} nuqta', other: '{rank} fanah {n} nuqta' }),
    kilinanErisim: cogul({ one: '{n} salat abime', other: '{n} salat abime' }),
    namaz: cogul({ one: 'salat', other: 'salat' }),
    rozetErisim: '{toplam} calaamatak {n} geytinen',
    rozet: cogul({ one: 'calaamat', other: 'calaamat' }),
  },
};
