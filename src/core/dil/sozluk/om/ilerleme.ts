import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Guddina',
  kilma: {
    baslik: 'Sadarkaa salaataa',
    haftalik: 'Torbanitti',
    aylik: "Ji'aan",
    donemErisim: 'Yeroo sadarkaa salaataa',
    hesaplaniyor: 'Sadarkaan salaataa keessanii herregamaa jira',
    bosBaslik: 'Ammallee galmeen hin jiru',
    bosAciklama: "Akkuma salaata keessan mallatteessitaniin asitti mul'ata.",
    yuzde: '{n}%',
    kilinan: 'Salaatame',
    oran: 'Sadarkaa',
    enIyiGun: 'Guyyaa caalu',
    haftaHedefi: 'Galma torban kanaa',
    hedefAlt: cogul({ one: "Galma walitti fufiinsa keessan irratti hundaa'e: guyyaatti salaata {n}", other: "Galma walitti fufiinsa keessan irratti hundaa'e: guyyaatti salaata {n}" }),
    kilinanNamaz: 'Salaata salaatame',
    hedefeUlasan: 'Guyyoota galma gahan',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Guyyoota salaanni itti salaatame',
    vakitVakit: 'Akka yeroo salaataatti',
    yuzdeErisim: '{ad}: dhibbeentaa {n}',
  },
  rozetler: {
    baslik: 'Sadarkaafi mallattoolee',
    seviye: 'Sadarkaa {n}',
    puan: 'Qabxii',
    kalanErisim: cogul({ one: 'Hanga sadarkaa {rank}tti qabxii {n}', other: 'Hanga sadarkaa {rank}tti qabxii {n}' }),
    enYuksek: 'Sadarkaa isa olaanaa irra jirtu',
    kalan: cogul({ one: 'Hanga {rank}tti qabxii {n}', other: 'Hanga {rank}tti qabxii {n}' }),
    kilinanErisim: cogul({ one: 'Salaata {n} salaatame', other: 'Salaata {n} salaatame' }),
    namaz: cogul({ one: 'salaata', other: 'salaata' }),
    rozetErisim: 'Mallattoolee {toplam} keessaa {n} argatameera',
    rozet: cogul({ one: 'mallattoo', other: 'mallattoolee' }),
  },
};
