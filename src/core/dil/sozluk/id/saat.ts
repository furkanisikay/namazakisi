import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Di ponsel',
    telefonAciklama: 'Alarm Subuh dan pembangun Tahajud berbunyi di ponsel Anda.',
    saatBaslik: 'Di jam tangan, tanpa suara',
    saatAciklama:
      'Hanya pergelangan tangan Anda yang bergetar, sehingga orang yang tidur di samping Anda tidak terbangun. Jika tidak Anda matikan di jam tangan, ponsel Anda berbunyi sebagai cadangan {dk} menit kemudian. Jika Namaz Akışı tidak ada di jam tangan Anda atau belum diperbarui, ponsel Anda berbunyi {dk} menit terlambat setiap pagi.',
    saatAciklamaIos:
      'Hanya pergelangan tangan Anda yang bergetar, sehingga orang yang tidur di samping Anda tidak terbangun. Jika tidak Anda matikan di jam tangan, iPhone Anda berbunyi sebagai cadangan {dk} menit kemudian.',
    ikisiBaslik: 'Di keduanya',
    ikisiAciklama: 'Jam tangan dan ponsel berbunyi bersamaan; mematikannya di jam tangan juga membungkam ponsel.',
    ikisiAciklamaIos: 'Jam tangan dan iPhone berbunyi bersamaan; mematikannya di jam tangan juga membungkam iPhone.',
  },
  anons: {
    otomatikBaslik: 'Di ponsel, di jam tangan jika ponsel jauh',
    otomatikAciklama:
      'Saat ponsel ada di dekat Anda, ponsel yang membacakan dan jam tangan sengaja diam (agar dua perangkat tidak membacakan kalimat yang sama). Saat ponsel jauh, jam tangan yang membacakan.',
    saatBaslik: 'Hanya di jam tangan',
    saatAciklama:
      'Jam tangan selalu membacakan dan ponsel diam. Saat jam tangan diisi daya, tidak terhubung ke ponsel, atau tidak memiliki Namaz Akışı, bacaan sama sekali tidak terdengar; jika tidak menginginkannya, gunakan pilihan pertama.',
    telefonBaslik: 'Hanya di ponsel',
    telefonAciklama: 'Jam tangan Anda tidak pernah berbicara.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Jika Namaz Akışı terpasang di Apple Watch Anda, tugas dibagi dengan iPhone Anda. Di sini Anda memilih di mana pembangun berbunyi.',
    giris:
      'Jika Namaz Akışı terpasang di jam tangan Anda, tugas dibagi dengan ponsel Anda. Di sini Anda memilih di mana pembangun berbunyi dan di mana pengumuman suara terdengar.',
    uyandirmaBaslik: 'Di mana pembangun berbunyi?',
    uyandirmaNotu:
      'Pembangun adalah alarm sungguhan yang Anda aktifkan untuk Subuh di pengingat "Sebelum waktu berakhir" dan pembangun Tahajud yang Anda aktifkan di Salat sunah.',
    uyandirmaNotuIos:
      'watchOS hanya dapat memasang alarm senyap saat aplikasi jam tangan terbuka: buka Namaz Akışı di jam tangan Anda sekali sehari, dan pembangun berikutnya dipasang saat itu. Saat jam tangan diisi daya atau aplikasi belum dibuka, cadangan di iPhone Anda yang berbunyi.',
    uyandirmaNotuAndroid: 'Jam tangan Anda tidak berbunyi saat diisi daya; ponsel Anda yang berbunyi.',
    muhafizAyarlari: 'Buka pengaturan "Sebelum waktu berakhir"',
    nafileAyarlari: 'Buka pengaturan salat sunah',
    bilektenBaslik: 'Yang dapat Anda lakukan dari pergelangan tangan',
    bilektenIos: [
      'Saat iPhone jauh, pengingat berbunyi di jam tangan Anda; keduanya tidak berbunyi bersamaan.',
      'Anda menandai salat yang sudah ditunaikan dari pergelangan tangan; iPhone mencatatnya.',
      'Anda menghitung tasbih dengan Digital Crown dan menemukan kiblat di jam tangan Anda.',
    ],
    anonsBaslik: 'Di mana pembacaan suara dilakukan?',
    anonsNotu:
      'Hanya pengingat dengan pembacaan suara aktif yang dibacakan. Dua perangkat tidak membacakan kalimat yang sama bersamaan. Jam tangan Anda juga diam saat Anda di masjid atau Mode salat aktif. Jika jam tangan tidak memiliki pengeras suara, mesin pembaca teks, atau suara dalam bahasa aplikasi, jam tangan hanya bergetar. Anda dapat langsung mencoba suara jam tangan dengan "Coba suara" di aplikasi jam tangan Namaz Akışı.',
    bilekten: [
      'Anda dapat mengaktifkan dan menonaktifkan Mode salat dengan tombol di jam tangan (hingga akhir waktu salat, paling lama 30 menit).',
      'Saat di masjid, jam tangan Anda menampilkan statusnya; Anda menjawab "Ini bukan masjid" dan "Apakah Anda di masjid?" dari pergelangan tangan.',
      'Layar yang tidak muat di jam tangan (Catatan Qada, Di masjid, pengaturan) dibuka di ponsel Anda dengan "Buka di ponsel".',
    ],
    namazModuNotu: 'Untuk mengaktifkan Mode salat dari jam tangan, aktifkan dulu sekali di ponsel Anda.',
    namazModuAyarlari: 'Buka pengaturan Mode salat',
  },
  sayfa: {
    akilliSaat: 'Jam tangan pintar',
    appleWatchOzet: 'Di mana pembangun berbunyi',
    saatOzet: 'Di mana pembangun berbunyi dan pembacaan suara',
    canliEtkinlikler: 'Aktivitas Langsung',
    canliSayaclar: 'Hitung mundur langsung',
    geriSayim: 'Hitung mundur',
    gelismisErisim: 'Lanjutan. Otomatisasi dan aplikasi yang menandai Sudah salat',
    gelismis: 'Lanjutan',
    otomasyonlar: 'Otomatisasi',
    otomasyonBaslik: 'Gunakan dengan otomatisasi',
    otomasyonOzet: 'Rutinitas Samsung, Tasker, MacroDroid',
    kildimBaslik: 'Aplikasi yang menandai Sudah salat',
    kildimOzet: 'Aplikasi yang Anda izinkan',
  },
};
