import type { Sozluk } from '../tr';

/**
 * Ungkapan lazim umat Islam di Malaysia (bukan terjemahan): "Semoga Allah menerimanya",
 * "Taqabbalallahu minna wa minkum", "Salam Jumaat", "Selamat Hari Raya", "Salam Maal Hijrah".
 * Salam malam Raghaib dan Nisfu Syaaban tidak diucapkan untuk MY (`selam.ts > KANDIL_ULKELERI`);
 * teksnya ada untuk kelengkapan jenis.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Semoga diberkati.',
  kabulDualari: ['Semoga Allah menerimanya', 'Taqabbalallahu minna wa minkum', 'Semoga Allah menerimanya', 'Semoga Allah menerima amalan kita'],
  kabulDuasi: 'Semoga Allah menerimanya',
  ekSabah: 'Semoga pagi anda diberkati',
  ekYatsi: 'Semoga malam anda diberkati',
  tamGunAna: 'Semoga Allah menerimanya',
  tamGunAlt: 'Anda telah menunaikan kelima-lima waktu solat hari ini.',
  kazaKabul: 'Satu qada {vakit} telah ditolak daripada catatan qada anda. {dua}.',
  kandilGeceleri: {
    regaib: 'Salam malam Raghaib',
    mirac: 'Salam Israk dan Mikraj',
    berat: 'Salam Nisfu Syaaban',
    mevlid: 'Salam Maulidur Rasul',
  },
  selamlar: {
    sahur: 'Selamat bersahur',
    bayram: 'Selamat Hari Raya',
    iftar: 'Selamat berbuka puasa',
    kadir: 'Salam Lailatulqadar',
    arefe: 'Salam ambang Hari Raya',
    hicriYilbasi: 'Salam Maal Hijrah',
    cuma: 'Salam Jumaat',
    ramazan: 'Salam Ramadan',
    sabah: 'Semoga pagi anda diberkati',
  },
};
