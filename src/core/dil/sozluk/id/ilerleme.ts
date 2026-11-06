import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const ilerleme: Sozluk['ilerleme'] = {
  baslik: 'Kemajuan',
  kilma: {
    baslik: 'Tingkat salat',
    haftalik: 'Mingguan',
    aylik: 'Bulanan',
    donemErisim: 'Periode tingkat salat',
    hesaplaniyor: 'Tingkat salat Anda sedang dihitung',
    bosBaslik: 'Belum ada catatan',
    bosAciklama: 'Akan muncul di sini saat Anda menandai salat Anda.',
    yuzde: '{n}%',
    kilinan: 'Ditunaikan',
    oran: 'Tingkat',
    enIyiGun: 'Hari terbaik',
    haftaHedefi: 'Target minggu ini',
    hedefAlt: cogul({ other: 'Berdasarkan target runtunan Anda: {n} waktu sehari' }),
    kilinanNamaz: 'Salat ditunaikan',
    hedefeUlasan: 'Hari mencapai target',
    ayYil: '{ay} {yil}',
    namazKilinanGun: 'Hari dengan salat',
    vakitVakit: 'Per waktu salat',
    yuzdeErisim: '{ad}: {n} persen',
  },
  rozetler: {
    baslik: 'Level dan lencana',
    seviye: 'Level {n}',
    puan: 'Poin',
    kalanErisim: cogul({ other: '{n} poin lagi menuju level {rank}' }),
    enYuksek: 'Anda berada di level tertinggi',
    kalan: cogul({ other: '{n} poin lagi menuju {rank}' }),
    kilinanErisim: cogul({ other: '{n} salat ditunaikan' }),
    namaz: cogul({ other: 'salat' }),
    rozetErisim: '{n} dari {toplam} lencana diperoleh',
    rozet: cogul({ other: 'lencana' }),
  },
};
