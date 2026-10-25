import type { Sozluk } from '../tr';

/** Fatwa sumber dalam bahasa Turki; label menyatakannya. Tiada bentuk hukum (penyampaian maklumat). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Syafie' },
  kaynaklar: {
    vatan: 'Tempat asal, tempat bermastautin dan tempat tinggal sementara dari segi musafir (dalam bahasa Turki)',
    cem: 'Bolehkah solat dijamakkan? (dalam bahasa Turki)',
    baslangic: 'Bilakah permulaan musafir? (dalam bahasa Turki)',
    ziyaret: 'Adakah orang yang pulang ke kampung ibu bapanya dikira musafir? (dalam bahasa Turki)',
  },
  bilgiNotu:
    'Ini maklumat, bukan hukum. Sama ada anda dikira musafir bergantung pada tujuan dan tempoh perjalanan serta niat anda.',
  baslik: 'Anda nampaknya sedang dalam perjalanan',
  mesafeSatiri: 'Anda berada kira-kira {km} km (jarak lurus) dari tempat bermastautin anda. Maklumat yang disampaikan oleh Diyanet bagi mazhab {mezhep}:',
  maddeler: {
    hanefi: [
      'Dalam mazhab Hanafi, jarak musafir ialah kira-kira 90 km. Orang yang berniat tinggal kurang daripada 15 hari di destinasi dikira musafir.',
      'Musafir menunaikan solat fardu empat rakaat sebanyak dua rakaat (qasar).',
      'Dalam mazhab Hanafi, menghimpunkan dua solat (jamak) hanya ketika haji, di Arafah dan Muzdalifah. Diyanet juga menyatakan bahawa dalam keuzuran besar seperti musafir, pandangan mazhab lain boleh diamalkan.',
    ],
    safii: [
      'Dalam mazhab Syafie juga, jarak musafir ialah kira-kira 90 km. Jika tempoh tinggal di destinasi kurang daripada 4 hari, tidak termasuk hari tiba dan hari bertolak, hukum musafir masih berlaku.',
      'Musafir menunaikan solat fardu empat rakaat sebanyak dua rakaat (qasar).',
      'Dalam mazhab Syafie, musafir ialah keuzuran yang sah untuk menghimpunkan (jamak) Zohor dengan Asar dan Maghrib dengan Isyak.',
    ],
  },
  ozetAcik: 'Hidup · {mezhep}',
  ozetKapali: 'Mati',
  baglantiAcilamadi: 'Pautan tidak dapat dibuka. Semak sambungan internet anda.',
  ikametGuncellendi: 'Tempat bermastautin anda telah dikemas kini',
  ikametKaydedilemedi: 'Tempat bermastautin anda tidak dapat disimpan',
  kartiKapatin: 'Tutup kad maklumat perjalanan',
  burasiEvimErisim: 'Ini rumah saya, simpan sebagai tempat bermastautin saya',
  burasiEvim: 'Ini rumah saya',
  diyanetteOkuyunErisim: 'Baca fatwa Diyanet dalam pelayar',
  diyanetteOkuyun: 'Baca di Diyanet',
  sayfa: {
    kayitliKonum: 'Lokasi tersimpan',
    henuzKaydedilmedi: 'Belum disimpan — lokasi pertama anda dikira sebagai tempat bermastautin',
    buradasiniz: 'Anda berada di sini sekarang',
    uzaktasiniz: 'Anda kini berada kira-kira {km} km (jarak lurus) dari sini',
    konumBilinmiyor: 'Lokasi anda belum diketahui; pilih lokasi dahulu',
    giris:
      'Apabila anda berada kira-kira {km} km dari tempat bermastautin anda, satu kad maklumat ringkas yang merumuskan fatwa Diyanet akan dipaparkan di skrin utama. Kad ini muncul sekali bagi setiap perjalanan dan tidak menghantar pemberitahuan.',
    bilgiKarti: 'Kad maklumat',
    kartBaslik: 'Kad maklumat perjalanan',
    gosterilir: 'Dipaparkan di skrin utama',
    gosterilmez: 'Tidak dipaparkan',
    mezhepNotu: 'Kandungan kad mengikut mazhab anda; anda boleh memilih mazhab di Tetapan › Waktu solat.',
    ikametYeri: 'Tempat bermastautin',
    ikametYapErisim: 'Simpan lokasi semasa anda sebagai tempat bermastautin',
    ikametYap: 'Jadikan lokasi semasa tempat bermastautin',
    kaynaklar: 'Sumber (Majlis Tertinggi Hal Ehwal Agama Diyanet)',
    kaynakErisim: '{etiket}. Dibuka dalam pelayar',
    fetvaHatti: 'Untuk sebarang pertanyaan, anda boleh menghubungi talian fatwa Diyanet 190.',
  },
};
