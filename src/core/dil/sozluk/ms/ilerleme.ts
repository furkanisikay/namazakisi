import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Kemajuan',
  kilma: {
    baslik: 'Kadar solat',
    haftalik: 'Mingguan',
    aylik: 'Bulanan',
    donemErisim: 'Tempoh kadar solat',
    hesaplaniyor: 'Kadar solat anda sedang dikira',
    bosBaslik: 'Belum ada rekod',
    bosAciklama: 'Akan dipaparkan di sini apabila anda menandakan solat anda.',
    yuzde: '{n}%',
    kilinan: 'Ditunaikan',
    oran: 'Kadar',
    enIyiGun: 'Hari terbaik',
    haftaHedefi: 'Sasaran minggu ini',
    hedefAlt: cogul({ other: 'Berdasarkan sasaran rentetan anda: {n} waktu sehari' }),
    kilinanNamaz: 'Solat ditunaikan',
    hedefeUlasan: 'Hari mencapai sasaran',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Hari bersolat',
    vakitVakit: 'Mengikut waktu',
    yuzdeErisim: '{ad}: {n} peratus',
  },
  rozetler: {
    baslik: 'Tahap dan lencana',
    seviye: 'Tahap {n}',
    puan: 'Mata',
    kalanErisim: cogul({ other: '{n} mata lagi ke tahap {rank}' }),
    enYuksek: 'Anda berada di tahap tertinggi',
    kalan: cogul({ other: '{n} mata lagi ke {rank}' }),
    kilinanErisim: cogul({ other: '{n} solat ditunaikan' }),
    namaz: cogul({ other: 'solat' }),
    rozetErisim: '{n} daripada {toplam} lencana diperoleh',
    rozet: cogul({ other: 'lencana' }),
  },
};
