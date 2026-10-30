import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Horumarka',
  kilma: {
    baslik: 'Heerka tukashada',
    haftalik: 'Toddobaadle',
    aylik: 'Bille',
    donemErisim: 'Muddada heerka tukashada',
    hesaplaniyor: 'Heerka tukashadaada waa la xisaabinayaa',
    bosBaslik: 'Weli diiwaan ma jiro',
    bosAciklama: 'Halkan ayuu ka muuqan doonaa marka aad calaamadeyso salaadahaaga.',
    yuzde: '{n}%',
    kilinan: 'La tukaday',
    oran: 'Heerka',
    enIyiGun: 'Maalinta ugu fiican',
    haftaHedefi: 'Hadafka toddobaadkan',
    hedefAlt: cogul({ one: 'Iyadoo lagu salaynayo hadafka taxanahaaga: {n} salaad maalintii', other: 'Iyadoo lagu salaynayo hadafka taxanahaaga: {n} salaadood maalintii' }),
    kilinanNamaz: 'Salaadaha la tukaday',
    hedefeUlasan: 'Maalmaha hadafka la gaaray',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Maalmaha salaadda la tukaday',
    vakitVakit: 'Salaad salaad',
    yuzdeErisim: '{ad}: {n} boqolkiiba',
  },
  rozetler: {
    baslik: 'Heerka iyo calaamadaha',
    seviye: 'Heerka {n}',
    puan: 'Dhibcaha',
    kalanErisim: cogul({ one: '{n} dhibic ayaa ka hartay heerka {rank}', other: '{n} dhibcood ayaa ka hartay heerka {rank}' }),
    enYuksek: 'Waxaad joogtaa heerka ugu sarreeya',
    kalan: cogul({ one: '{n} dhibic ilaa {rank}', other: '{n} dhibcood ilaa {rank}' }),
    kilinanErisim: cogul({ one: '{n} salaad ayaa la tukaday', other: '{n} salaadood ayaa la tukaday' }),
    namaz: cogul({ one: 'salaad', other: 'salaadood' }),
    rozetErisim: '{n} ka mid ah {toplam} calaamadood ayaa la helay',
    rozet: cogul({ one: 'calaamad', other: 'calaamadood' }),
  },
};
