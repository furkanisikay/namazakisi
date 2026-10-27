import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Kiblat',
  yon: {
    hizali: 'Anda menghadap kiblat',
    arkada: 'Kiblat ada di belakang Anda, berbaliklah',
    sagda: 'Kiblat {derece}° di sebelah kanan Anda',
    solda: 'Kiblat {derece}° di sebelah kiri Anda',
  },
  harf: { kuzey: 'U', dogu: 'T', guney: 'S', bati: 'B' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Mode kompas',
    pusulaAciklama: 'Saat tanda Ka’bah mencapai takik di bagian atas, Anda menghadap kiblat.',
    kamera: 'Kamera',
    kameraErisim: 'Mode kamera',
    kameraAciklama: 'Pegang ponsel tegak; tanda Ka’bah muncul di arah kiblat.',
  },
  sayfa: {
    baslatiliyor: 'Memulai kompas…',
    izinKapali: 'Izin lokasi nonaktif; lokasi Anda diperlukan untuk menemukan arah.',
  },
  hata: {
    izinGerekli: 'Izin lokasi diperlukan untuk menemukan arah kiblat.',
    konumServisi: 'Layanan lokasi tidak dapat diakses. Periksa pengaturan lokasi perangkat Anda.',
    baslatilamadi: 'Layanan kiblat tidak dapat dimulai.',
  },
  pusula: {
    ufuk: 'cakrawala',
    konumAliniyor: 'Mengambil lokasi Anda…',
    hazirlaniyor: 'Menyiapkan kompas…',
    kuzeydenAci: 'Kiblat {derece}° dari utara',
    kabeUzakta: 'Ka’bah berjarak {mesafe}',
    kuzeydenSaatYonu: 'Searah jarum jam dari utara',
    kuzeyden: '{derece}° dari utara',
    kabeUzaktaKuzeyden: 'Ka’bah berjarak {mesafe}, {derece}° dari utara',
    pusulaErisim: 'Kompas kiblat. {cumle}',
    pusulaYok: 'Perangkat ini tidak memiliki kompas; kami menampilkan arah relatif terhadap utara.',
    kayiyorsa: 'Jika arah bergeser, gerakkan ponsel Anda di udara membentuk angka 8.',
    kamerayla: 'Lihat dengan kamera',
  },
  kamera: {
    pusulayiKullanin: 'Gunakan kompas',
    kullanilamiyorBaslik: 'Tampilan kamera tidak tersedia di ponsel ini',
    kullanilamiyorMetin:
      'Sensor ponsel Anda tidak memberikan arah yang andal saat dipegang tegak. Kompas tetap menunjukkan arah dengan benar.',
    izinBaslik: 'Lihat kiblat dengan kamera',
    izinMetin:
      'Pegang ponsel Anda tegak dan lihat sekeliling; tanda Ka’bah muncul di arah kiblat. Untuk itu diperlukan izin kamera; gambar tidak direkam dan tidak keluar dari ponsel Anda.',
    kamerayiAcin: 'Aktifkan kamera',
    izinKapaliBaslik: 'Izin kamera nonaktif',
    izinKapaliMetin: 'Untuk tampilan kamera, Anda dapat mengizinkan akses kamera di Pengaturan. Kompas tetap berfungsi tanpa izin.',
    ayarlariAcin: 'Buka Pengaturan',
    acilamadiBaslik: 'Kamera tidak dapat dibuka',
    acilamadiMetin: 'Kamera saat ini tidak tersedia. Anda dapat menemukan arah kiblat dengan kompas.',
    hesaplaniyor: 'Menghitung arah…',
    dikTutun: 'Pegang ponsel Anda tegak',
  },
  kalibrasyon: {
    tesekkurErisim: 'Terima kasih, arah kini lebih akurat',
    tesekkur: 'Terima kasih, arah kini lebih akurat ✓',
    baslik: 'Kalibrasi kompas',
    sallayin: 'Gerakkan ponsel Anda di udara membentuk angka 8.',
    metal: 'Jauhkan dari benda logam dan casing bermagnet.',
    dogruluk: 'Akurasi',
    simdiDegil: 'Nanti saja',
  },
};
