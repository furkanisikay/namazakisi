import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Di telefon',
    telefonAciklama: 'Penggera Subuh dan kejutan Tahajud berbunyi di telefon anda.',
    saatBaslik: 'Di jam tangan, secara senyap',
    saatAciklama:
      'Hanya pergelangan tangan anda bergetar, jadi orang yang tidur di sebelah anda tidak terjaga. Jika anda tidak mematikannya di jam tangan, telefon anda berbunyi sebagai sandaran {dk} minit kemudian. Jika Namaz Akışı tiada di jam tangan anda atau belum dikemas kini, telefon anda berbunyi {dk} minit lewat setiap pagi.',
    saatAciklamaIos:
      'Hanya pergelangan tangan anda bergetar, jadi orang yang tidur di sebelah anda tidak terjaga. Jika anda tidak mematikannya di jam tangan, iPhone anda berbunyi sebagai sandaran {dk} minit kemudian.',
    ikisiBaslik: 'Di kedua-duanya',
    ikisiAciklama: 'Jam tangan dan telefon berbunyi serentak; mematikannya di jam tangan turut mendiamkan telefon.',
    ikisiAciklamaIos: 'Jam tangan dan iPhone berbunyi serentak; mematikannya di jam tangan turut mendiamkan iPhone.',
  },
  anons: {
    otomatikBaslik: 'Di telefon, di jam tangan jika telefon jauh',
    otomatikAciklama:
      'Apabila telefon ada bersama anda, telefon yang membaca dan jam tangan sengaja berdiam (supaya kedua-dua peranti tidak membaca ayat yang sama). Apabila telefon jauh, jam tangan anda yang membaca.',
    saatBaslik: 'Hanya di jam tangan',
    saatAciklama:
      'Jam tangan anda sentiasa membaca dan telefon berdiam. Ketika jam tangan sedang dicas, tidak bersambung dengan telefon atau tiada Namaz Akışı, tiada apa-apa yang dibaca; jika anda tidak mahu begitu, gunakan pilihan pertama.',
    telefonBaslik: 'Hanya di telefon',
    telefonAciklama: 'Jam tangan anda tidak akan bersuara.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Jika Namaz Akışı dipasang pada Apple Watch anda, ia berkongsi tugas dengan iPhone anda. Di sini anda memilih di mana kejutan berbunyi.',
    giris:
      'Jika Namaz Akışı dipasang pada jam tangan anda, ia berkongsi tugas dengan telefon anda. Di sini anda memilih di mana kejutan berbunyi dan di mana pengumuman dibacakan.',
    uyandirmaBaslik: 'Di mana kejutan patut berbunyi?',
    uyandirmaNotu:
      'Kejutan ialah penggera sebenar yang anda hidupkan untuk Subuh dalam peringatan "Sebelum waktu tamat" dan kejutan Tahajud yang anda hidupkan dalam Solat sunat.',
    uyandirmaNotuIos:
      'watchOS hanya boleh menetapkan penggera senyap ketika aplikasi jam tangan dibuka: buka Namaz Akışı di jam tangan anda sekali sehari dan kejutan seterusnya ditetapkan ketika itu. Ketika jam tangan sedang dicas atau aplikasi tidak dibuka, sandaran iPhone anda yang berbunyi.',
    uyandirmaNotuAndroid: 'Jam tangan anda tidak berbunyi ketika dicas; telefon anda yang berbunyi.',
    muhafizAyarlari: 'Buka tetapan "Sebelum waktu tamat"',
    nafileAyarlari: 'Buka tetapan solat sunat',
    bilektenBaslik: 'Perkara yang boleh anda lakukan dari pergelangan tangan',
    bilektenIos: [
      'Apabila iPhone jauh, peringatan berbunyi di jam tangan anda; kedua-duanya tidak berbunyi serentak.',
      'Anda menandakan solat yang telah ditunaikan dari pergelangan tangan; iPhone anda merekodkannya.',
      'Anda mengira tasbih dengan Digital Crown dan mencari arah kiblat di jam tangan anda.',
    ],
    anonsBaslik: 'Di mana bacaan suara patut berlaku?',
    anonsNotu:
      'Hanya peringatan yang bacaan suaranya dihidupkan akan dibaca. Kedua-dua peranti tidak membaca ayat yang sama bersama-sama. Jam tangan anda juga berdiam ketika anda di masjid atau mod Solat dihidupkan. Jika jam tangan anda tiada pembesar suara, enjin teks ke pertuturan atau suara dalam bahasa aplikasi, ia hanya bergetar. Anda boleh menguji bunyi jam tangan serta-merta dengan "Uji bunyi" dalam aplikasi jam tangan Namaz Akışı.',
    bilekten: [
      'Anda boleh menghidupkan dan mematikan mod Solat dengan butang di jam tangan (hingga akhir waktu, paling lama 30 minit).',
      'Ketika di masjid, jam tangan anda memaparkan statusnya; anda menjawab "Ini bukan masjid" dan "Adakah anda di masjid?" dari pergelangan tangan.',
      'Skrin yang tidak muat di jam tangan (Catatan Qada, Di masjid, tetapan) dibuka di telefon anda dengan "Buka di telefon".',
    ],
    namazModuNotu: 'Untuk menghidupkan mod Solat dari jam tangan, hidupkannya sekali di telefon anda terlebih dahulu.',
    namazModuAyarlari: 'Buka tetapan mod Solat',
  },
  sayfa: {
    akilliSaat: 'Jam tangan pintar',
    appleWatchOzet: 'Di mana kejutan berbunyi',
    saatOzet: 'Di mana kejutan berbunyi dan bacaan suara',
    canliEtkinlikler: 'Aktiviti Langsung',
    canliSayaclar: 'Kiraan detik langsung',
    geriSayim: 'Kiraan detik',
    gelismisErisim: 'Lanjutan. Automasi dan aplikasi yang menandakan Sudah solat',
    gelismis: 'Lanjutan',
    otomasyonlar: 'Automasi',
    otomasyonBaslik: 'Gunakan dengan automasi',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Aplikasi yang menandakan Sudah solat',
    kildimOzet: 'Aplikasi yang anda benarkan',
  },
};
