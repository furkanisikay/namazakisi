import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Syafi'i" },
  kaynaklar: {
    vatan: 'Tempat asal, tempat tinggal, dan tempat singgah dalam hal status musafir (bahasa Turki)',
    cem: 'Bolehkah salat dijamak (digabung)? (bahasa Turki)',
    baslangic: 'Kapan perjalanan (safar) dimulai? (bahasa Turki)',
    ziyaret: 'Apakah orang yang mengunjungi kota orang tuanya menjadi musafir? (bahasa Turki)',
  },
  bilgiNotu:
    'Ini informasi, bukan fatwa. Apakah Anda terhitung musafir bergantung pada tujuan dan lama perjalanan Anda serta niat Anda.',
  baslik: 'Tampaknya Anda sedang dalam perjalanan',
  mesafeSatiri: 'Anda berada sekitar {km} km (garis lurus) dari tempat tinggal Anda. Informasi yang disampaikan Diyanet menurut mazhab {mezhep}:',
  maddeler: {
    hanefi: [
      'Dalam mazhab Hanafi, jarak perjalanan (safar) sekitar 90 km. Orang yang berniat tinggal kurang dari 15 hari di tempat tujuan terhitung musafir.',
      'Musafir menunaikan salat fardu empat rakaat menjadi dua rakaat (qasar).',
      'Dalam mazhab Hanafi, menggabungkan dua salat (jamak) hanya berlaku saat haji, di Arafah dan Muzdalifah. Diyanet juga menyebutkan bahwa dalam uzur penting seperti perjalanan, seseorang dapat mengikuti pendapat mazhab lain.',
    ],
    safii: [
      "Dalam mazhab Syafi'i, jarak perjalanan juga sekitar 90 km. Jika tinggal di tempat tujuan kurang dari 4 hari, tidak termasuk hari tiba dan hari berangkat, hukum perjalanan tetap berlaku.",
      'Musafir menunaikan salat fardu empat rakaat menjadi dua rakaat (qasar).',
      "Dalam mazhab Syafi'i, perjalanan termasuk uzur yang sah untuk menggabungkan (jamak) Dzuhur dengan Ashar serta Maghrib dengan Isya.",
    ],
  },
  ozetAcik: 'Aktif · {mezhep}',
  ozetKapali: 'Nonaktif',
  baglantiAcilamadi: 'Tautan tidak dapat dibuka. Periksa koneksi internet Anda.',
  ikametGuncellendi: 'Tempat tinggal Anda telah diperbarui',
  ikametKaydedilemedi: 'Tempat tinggal Anda tidak dapat disimpan',
  kartiKapatin: 'Tutup kartu info perjalanan',
  burasiEvimErisim: 'Ini rumah saya, simpan sebagai tempat tinggal saya',
  burasiEvim: 'Ini rumah saya',
  diyanetteOkuyunErisim: 'Baca fatwa Diyanet di browser',
  diyanetteOkuyun: 'Baca di Diyanet',
  sayfa: {
    kayitliKonum: 'Lokasi tersimpan',
    henuzKaydedilmedi: 'Belum disimpan — lokasi pertama Anda dianggap sebagai tempat tinggal',
    buradasiniz: 'Anda sedang berada di sini',
    uzaktasiniz: 'Anda sekarang berada sekitar {km} km (garis lurus)',
    konumBilinmiyor: 'Lokasi Anda belum diketahui; pilih lokasi terlebih dahulu',
    giris:
      'Saat Anda berada sekitar {km} km dari tempat tinggal Anda, kartu info singkat yang merangkum fatwa Diyanet muncul di layar utama. Kartu muncul sekali per perjalanan dan tidak mengirim notifikasi.',
    bilgiKarti: 'Kartu info',
    kartBaslik: 'Kartu info perjalanan',
    gosterilir: 'Ditampilkan di layar utama',
    gosterilmez: 'Tidak ditampilkan',
    mezhepNotu: 'Isi kartu mengikuti mazhab Anda; Anda dapat memilih mazhab di Pengaturan › Waktu salat.',
    ikametYeri: 'Tempat tinggal',
    ikametYapErisim: 'Simpan lokasi Anda saat ini sebagai tempat tinggal',
    ikametYap: 'Jadikan lokasi saat ini tempat tinggal',
    kaynaklar: 'Sumber (Dewan Tinggi Urusan Agama Diyanet)',
    kaynakErisim: '{etiket}. Dibuka di browser',
    /** Turki dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Untuk pertanyaan, Anda dapat menghubungi saluran fatwa Diyanet 190.',
  },
};
