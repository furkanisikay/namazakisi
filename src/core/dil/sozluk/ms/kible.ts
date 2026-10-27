import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Kiblat',
  yon: {
    hizali: 'Anda menghadap kiblat',
    arkada: 'Kiblat di belakang anda, berpusinglah',
    sagda: 'Kiblat {derece}° di sebelah kanan anda',
    solda: 'Kiblat {derece}° di sebelah kiri anda',
  },
  harf: { kuzey: 'U', dogu: 'T', guney: 'S', bati: 'B' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Mod kompas',
    pusulaAciklama: 'Apabila tanda Kaabah sampai ke takuk di bahagian atas, anda sedang menghadap kiblat.',
    kamera: 'Kamera',
    kameraErisim: 'Mod kamera',
    kameraAciklama: 'Pegang telefon secara tegak; tanda Kaabah muncul ke arah kiblat.',
  },
  sayfa: {
    baslatiliyor: 'Memulakan kompas…',
    izinKapali: 'Kebenaran lokasi dimatikan; lokasi anda diperlukan untuk mencari arah.',
  },
  hata: {
    izinGerekli: 'Kebenaran lokasi diperlukan untuk mencari arah kiblat.',
    konumServisi: 'Perkhidmatan lokasi tidak dapat dicapai. Semak tetapan lokasi peranti anda.',
    baslatilamadi: 'Perkhidmatan kiblat tidak dapat dimulakan.',
  },
  pusula: {
    ufuk: 'ufuk',
    konumAliniyor: 'Mendapatkan lokasi anda…',
    hazirlaniyor: 'Menyediakan kompas…',
    kuzeydenAci: 'Kiblat {derece}° dari utara',
    kabeUzakta: 'Kaabah sejauh {mesafe}',
    kuzeydenSaatYonu: 'Ikut arah jam dari utara',
    kuzeyden: '{derece}° dari utara',
    kabeUzaktaKuzeyden: 'Kaabah sejauh {mesafe}, {derece}° dari utara',
    pusulaErisim: 'Kompas kiblat. {cumle}',
    pusulaYok: 'Peranti ini tiada kompas; kami memaparkan arah berdasarkan utara.',
    kayiyorsa: 'Jika arah tersasar, gerakkan telefon anda di udara seperti melukis angka 8.',
    kamerayla: 'Lihat dengan kamera',
  },
  kamera: {
    pusulayiKullanin: 'Gunakan kompas',
    kullanilamiyorBaslik: 'Paparan kamera tidak tersedia pada telefon ini',
    kullanilamiyorMetin:
      'Penderia telefon anda tidak memberikan arah yang boleh dipercayai ketika dipegang tegak. Kompas tetap memaparkan arah dengan betul.',
    izinBaslik: 'Lihat kiblat dengan kamera',
    izinMetin:
      'Pegang telefon anda secara tegak dan lihat sekeliling; tanda Kaabah muncul ke arah kiblat. Ini memerlukan kebenaran kamera; imej tidak dirakam dan tidak keluar dari telefon anda.',
    kamerayiAcin: 'Hidupkan kamera',
    izinKapaliBaslik: 'Kebenaran kamera dimatikan',
    izinKapaliMetin: 'Anda boleh membenarkan akses kamera dalam Tetapan untuk paparan kamera. Kompas berfungsi tanpanya.',
    ayarlariAcin: 'Buka Tetapan',
    acilamadiBaslik: 'Kamera tidak dapat dibuka',
    acilamadiMetin: 'Kamera tidak tersedia buat masa ini. Anda boleh mencari arah kiblat dengan kompas.',
    hesaplaniyor: 'Mencari arah…',
    dikTutun: 'Pegang telefon anda secara tegak',
  },
  kalibrasyon: {
    tesekkurErisim: 'Terima kasih, arah kini lebih tepat',
    tesekkur: 'Terima kasih, arah kini lebih tepat ✓',
    baslik: 'Tentukur kompas',
    sallayin: 'Gerakkan telefon anda di udara seperti melukis angka 8.',
    metal: 'Jauhkan diri daripada objek logam dan sarung bermagnet.',
    dogruluk: 'Ketepatan',
    simdiDegil: 'Bukan sekarang',
  },
};
