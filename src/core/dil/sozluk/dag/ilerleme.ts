import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Tooni chaŋbu',
  kilma: {
    baslik: 'Jiŋli puhibu kalinli',
    haftalik: 'Dabsa ayopɔin',
    aylik: 'Goli',
    donemErisim: 'Jiŋli puhibu kalinli saha',
    hesaplaniyor: 'Yi jiŋli puhibu kalinli kalindi',
    bosBaslik: 'Sabbu kani pumpɔŋɔ',
    bosAciklama: 'Di ni yi kpe yi yi dalim yi jiŋa.',
    yuzde: '{n}%',
    kilinan: 'Puhiya',
    oran: 'Kalinli',
    enIyiGun: 'Dabsili din gari zaa',
    haftaHedefi: 'Dabsa ayopɔin ŋɔ yɛltɔɣa',
    hedefAlt: cogul({ one: 'Di doli yi dolibu yɛltɔɣa: jiŋli {n} dabsili kam', other: 'Di doli yi dolibu yɛltɔɣa: jiŋli {n} dabsili kam' }),
    kilinanNamaz: 'Jiŋa din puhi',
    hedefeUlasan: 'Dabsa din paai yɛltɔɣa',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Dabsa bɛ ni puhi jiŋli',
    vakitVakit: 'Jiŋli kam',
    yuzdeErisim: '{ad}: {n} pɛsɛnti',
  },
  rozetler: {
    baslik: 'Daraja mini baajinima',
    seviye: 'Daraja {n}',
    puan: 'Maaki',
    kalanErisim: cogul({ one: 'Maaki {n} n-ti paai {rank} daraja', other: 'Maaki {n} n-ti paai {rank} daraja' }),
    enYuksek: 'Yi paai daraja din gari zaa',
    kalan: cogul({ one: 'Maaki {n} n-ti paai {rank}', other: 'Maaki {n} n-ti paai {rank}' }),
    kilinanErisim: cogul({ one: 'Jiŋa {n} din puhi', other: 'Jiŋa {n} din puhi' }),
    namaz: cogul({ one: 'jiŋa', other: 'jiŋa' }),
    rozetErisim: 'Yi nya baaji {n} {toplam} puuni',
    rozet: cogul({ one: 'baajinima', other: 'baajinima' }),
  },
};
