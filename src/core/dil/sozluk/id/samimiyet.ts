import type { Sozluk } from '../tr';

/**
 * Endonezyalı Müslümanların yerleşik kalıpları (çeviri değil): "Semoga Allah menerimanya",
 * "Taqabbalallahu minna wa minkum", "Semoga diterima di sisi Allah"; selamlarda "Jumat berkah",
 * "Marhaban ya Ramadan", "Selamat Hari Raya". Endonezya'da Isra Mikraj ve Maulid Nabi ulusal
 * tatildir (`selam.ts > KANDIL_ULKELERI`: mirac, mevlid); regaib/berat yalnız Türkiye geleneği
 * ülkelerinde söylenir, burada tip bütünlüğü ve oradaki Endonezce kullanıcı içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'Semoga berkah.',
  kabulDualari: ['Semoga Allah menerimanya', 'Taqabbalallahu minna wa minkum', 'Semoga Allah menerimanya', 'Semoga diterima di sisi Allah'],
  kabulDuasi: 'Semoga Allah menerimanya',
  ekSabah: 'Selamat pagi, semoga berkah',
  ekYatsi: 'Selamat beristirahat',
  tamGunAna: 'Semoga Allah menerimanya',
  tamGunAlt: 'Hari ini Anda telah menunaikan salat lima waktu.',
  kazaKabul: 'Satu qada {vakit} telah dikurangi dari catatan Anda. {dua}.',
  kandilGeceleri: {
    regaib: 'Selamat malam Ragaib',
    mirac: 'Selamat memperingati Isra Mikraj',
    berat: 'Selamat malam Nisfu Syakban',
    mevlid: 'Selamat memperingati Maulid Nabi',
  },
  selamlar: {
    sahur: 'Selamat sahur',
    bayram: 'Selamat Hari Raya',
    iftar: 'Selamat berbuka puasa',
    kadir: 'Semoga meraih berkah Lailatulqadar',
    arefe: 'Selamat menyambut Hari Raya',
    hicriYilbasi: 'Selamat Tahun Baru Hijriah',
    cuma: 'Jumat berkah',
    ramazan: 'Marhaban ya Ramadan',
    sabah: 'Selamat pagi, semoga berkah',
  },
};
