import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Api runtunan Anda menyala',
    enUzun: cogul({ other: 'Runtunan terpanjang: {n} hari' }),
    gunBuyuk: cogul({ other: 'HARI' }),
    sonrakiHedef: 'Target berikutnya: hari ke-{hedef} ({durum})',
    kalanGun: cogul({ other: '{n} hari lagi' }),
    tamamlandi: 'Tercapai!',
    paylasErisim: 'Bagikan pencapaian Anda',
    paylasBuyuk: 'BAGIKAN PENCAPAIAN ANDA',
  },

  hedefler: {
    ilk_adim: { ad: 'Minggu Pertama', aciklama: 'Salat 7 hari tanpa terputus', cumle: 'Minggu pertama' },
    aliskanlik_ustasi: { ad: 'Ahli Kebiasaan', aciklama: '21 hari - masa membentuk kebiasaan', cumle: 'Ahli kebiasaan' },
    kararlilik: { ad: 'Keteguhan', aciklama: '60 hari tanpa terputus', cumle: 'Keteguhan' },
    efsane: { ad: 'Legenda', aciklama: '90 hari - keteguhan luar biasa', cumle: 'Legenda' },
  },

  /** Klasik derece adları, transliterasyonla (çeviri değil). */
  seviyeler: ['Mubtadi', 'Thalib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Langkah Pertama', aciklama: 'Anda menyelesaikan minggu pertama!', kosul: 'Runtunan 7 hari' },
    aliskanlik_ustasi: {
      ad: 'Ahli Kebiasaan',
      aciklama: '21 hari - masa membentuk kebiasaan selesai!',
      kosul: 'Runtunan 21 hari',
    },
    kararlilik: { ad: 'Teguh', aciklama: 'Anda salat 60 hari tanpa terputus!', kosul: 'Runtunan 60 hari' },
    efsane: { ad: 'Legenda', aciklama: '90 hari - Anda menunjukkan keteguhan luar biasa!', kosul: 'Runtunan 90 hari' },
    toparlanma_ustasi: {
      ad: 'Ahli Pemulihan',
      aciklama: 'Anda menyelesaikan mode pemulihan 3 kali!',
      kosul: '3 kali pemulihan',
    },
    mukemmeliyetci: { ad: 'Sempurna', aciklama: 'Anda salat 5/5 selama 30 hari!', kosul: '30 hari salat 5/5' },
    yuz_namaz: { ad: '100 Salat', aciklama: 'Anda telah menunaikan total 100 salat!', kosul: 'Menunaikan 100 salat' },
    bin_namaz: { ad: '1000 Salat', aciklama: 'Anda telah menunaikan total 1000 salat!', kosul: 'Menunaikan 1000 salat' },
  },

  rozetSeviyeleri: { bronz: 'PERUNGGU', gumus: 'PERAK', altin: 'EMAS', elmas: 'BERLIAN' },

  gunBitis: {
    erken: 'Untuk yang tidur lebih awal',
    varsayilan: 'Bawaan - di kebanyakan tempat sebelum Subuh',
    gec: 'Untuk yang tidur larut',
  },

  kutlama: {
    rozetEklendi: '🏅 Ditambahkan ke koleksi lencana Anda',
    paylasin: 'Bagikan',
    rozetBaslik: 'Semoga istikamah',
    rozetMesaj: 'Anda memperoleh lencana "{ad}".',
    hedefBaslik: cogul({ other: '{n} hari' }),
    hedefMesaj: 'Anda menyelesaikan target "{ad}". Semoga istikamah.',
    seviyeBaslik: 'Level baru Anda',
    yeniRank: 'Peringkat baru: {rank}',
    seviyeMesaj: 'Kini Anda melanjutkan sebagai "{rank}". Semoga istikamah.',
    toparlanmaBaslik: 'Runtunan Anda kembali',
    toparlanmaMesaj: cogul({ other: 'Runtunan {n} hari Anda berlanjut dari tempat terakhir. Semoga Allah memberi keteguhan.' }),
    enUzunBaslik: 'Runtunan terpanjang Anda',
    enUzunMesaj: cogul({ other: '{n} hari; runtunan terpanjang Anda sejauh ini. Semoga istikamah.' }),
  },

  sekme: {
    hataOkunamadi: 'Catatan lampau Anda tidak dapat dibaca saat ini.',
    yenidenErisim: 'Coba muat ulang data runtunan',
    yenidenDeneyin: 'Coba lagi',
    yukleniyor: 'Memuat data runtunan Anda...',
    gunlukSeri: 'hari beruntun',
    rekor: 'rekor',
    sozErisim: '{metin} Sumber: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Target berikutnya',
    tumu: 'Anda telah meraih semua lencana',
    kalan: cogul({ other: '{n} hari lagi menuju lencana {ad}' }),
    tumuErisim: 'Anda telah meraih semua lencana: tasbih terisi penuh.',
    erisim: 'Lencana {ad}: {n} dari {hedef} hari selesai.',
  },

  gok: {
    gunHarfleri: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ other: '{n} hari mencapai target' }),
    besVakit: cogul({ other: '{n} hari dengan lima waktu lengkap' }),
    dondurulmus: cogul({ other: '{n} hari dibekukan' }),
    mevcutSeri: cogul({ other: 'Runtunan saat ini {n} hari.' }),
  },

  hedefAyar: {
    azalt: 'Kurangi',
    deger: 'Nilai',
    artir: 'Tambah',
    esik: cogul({ other: '{n} waktu' }),
    sifirlaBaslik: 'Atur ulang runtunan',
    sifirlaMesaj: 'Semua data runtunan Anda (runtunan, lencana, poin) akan diatur ulang. Tindakan ini tidak dapat dibatalkan. Lanjutkan?',
    sifirla: 'Atur ulang',
    iptal: 'Batal',
    basarili: 'Selesai',
    sifirlandi: 'Data runtunan Anda telah diatur ulang.',
    hedefAyarlari: 'PENGATURAN TARGET',
    tamGunEsigi: 'Ambang hari lengkap',
    tamGunAciklama: 'Menentukan jumlah minimum salat per hari agar hari itu dihitung dalam runtunan',
    sifirlama: 'ATUR ULANG',
    verileriSifirla: 'Atur ulang data runtunan',
    verileriSifirlaAlt: 'Menghapus semua data runtunan, lencana, dan poin',
  },

  rozetKarti: {
    erisim: 'Lencana {ad}, {durum}',
    kazanildi: 'diperoleh',
    kilitli: 'terkunci',
  },

  toparlanma: {
    kartBaslik: 'MODE PEMULIHAN',
    kartAltBaslik: 'Anda dapat memperoleh kembali runtunan Anda',
    kartMesaj: 'Anda dapat melanjutkan runtunan {vurgu} Anda dari tempat terakhir.',
    oncekiGun: cogul({ other: '{n} hari' }),
    ilerleme: '{tamam}/{hedef} hari selesai',
    kalan: cogul({ other: 'Lengkapi lima waktu selama {n} hari lagi, dan runtunan Anda berlanjut dari tempat terakhir.' }),
    bugun: 'Lengkapi hari ini, dan runtunan Anda berlanjut dari tempat terakhir.',
    uyari: 'Hari-hari ini cukup diselesaikan berturut-turut; jika ada hari yang terlewat di antaranya, pemulihan dimulai lagi.',
    kapatErisim: 'Tutup detail pemulihan',
    anladim: 'Mengerti',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Bagikan pencapaian',
    hazirDegilBaslik: 'Gambar belum siap',
    hazirDegilMesaj: 'Gambar belum siap. Coba lagi dalam beberapa detik.',
    olusturulamadiBaslik: 'Gambar tidak dapat dibuat',
    olusturulamadiMesaj: 'Terjadi kesalahan saat membuat gambar. Coba lagi.',
    kullanilamiyorBaslik: 'Berbagi tidak tersedia',
    kullanilamiyorMesaj: 'Fitur berbagi tidak tersedia di perangkat ini.',
    kapat: 'Tutup',
    hikaye: 'Tambahkan ke cerita Anda',
    platformlar: 'Dapat dibagikan di Instagram, WhatsApp, dan lainnya.',
    tamam: 'OK',
    seriEnUzun: cogul({ other: 'Runtunan Terpanjang Saya: {n} Hari' }),
    seriZincir: cogul({ other: 'HARI TANPA MEMUTUS RANTAI!' }),
    seriSoz: '"Langkah kecil setiap hari, ketenangan besar di jiwa. 🔥"',
    rozetYeni: 'SAYA MEMPEROLEH LENCANA BARU!',
    rozetSozleri: [
      'Hari ini saya melangkah baik untuk diri sendiri! 🌟',
      'Saya terus melangkah dengan tekad; lencana ini milik saya! 💪',
      'Saya meraih berkah pagi! 🌅',
      'Saya ikut dalam alur yang menyejukkan jiwa ini! ✨',
      'Langkah kecil membawa ketenangan besar. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'SAYA MEMPEROLEH LENCANA BARU!',
      hedef_tamamlandi: 'TARGET SAYA TERCAPAI!',
      seviye_atlandi: 'NAIK LEVEL!',
      toparlanma_tamamlandi: 'KEMBALI DI JALUR!',
      en_uzun_seri: 'REKOR BARU!',
      varsayilan: 'PENCAPAIAN!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Semoga Allah menjadikannya istikamah. 🤲', 'Langkah kecil membawa ketenangan besar. 🍃', 'Semoga Allah memberi kita semua keteguhan. 🌱'],
      hedef_tamamlandi: ['Langkah kecil membawa ketenangan besar. 🍃', 'Semoga istikamah. 🤲', 'Satu langkah lagi setiap hari. 🌱'],
      seviye_atlandi: [
        'Setiap hari sedikit lebih jauh; semoga Allah memudahkan. 🍃',
        'Semoga istikamah. 🤲',
        'Perjalanan berlanjut. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Yang penting bukan jatuhnya, tetapi bangkitnya. 🔄',
        'Semoga Allah memberi keteguhan. 🤲',
        'Dengan sabar, setiap jalan dapat ditempuh. 🌱',
      ],
      en_uzun_seri: [
        'Langkah kecil setiap hari, ketenangan besar di hati. 🍃',
        'Semoga istikamah. 🤲',
        'Semoga Allah memberi kita semua keteguhan. 🌱',
      ],
    },
  },
};
