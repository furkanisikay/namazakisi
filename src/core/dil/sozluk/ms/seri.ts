import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Rentetan anda sedang menyala',
    enUzun: cogul({ other: 'Rentetan terpanjang: {n} hari' }),
    gunBuyuk: cogul({ other: 'HARI' }),
    sonrakiHedef: 'Sasaran seterusnya: hari ke-{hedef} ({durum})',
    kalanGun: cogul({ other: '{n} hari lagi' }),
    tamamlandi: 'Selesai',
    paylasErisim: 'Kongsi kemajuan anda',
    paylasBuyuk: 'KONGSI KEMAJUAN ANDA',
  },

  hedefler: {
    ilk_adim: { ad: 'Minggu Pertama', aciklama: 'Solat selama 7 hari tanpa terputus', cumle: 'Minggu pertama' },
    aliskanlik_ustasi: { ad: 'Pakar Tabiat', aciklama: '21 hari - tempoh membina tabiat', cumle: 'Pakar tabiat' },
    kararlilik: { ad: 'Keteguhan', aciklama: '60 hari tanpa terputus', cumle: 'Keteguhan' },
    efsane: { ad: 'Lagenda', aciklama: '90 hari - ketekunan luar biasa', cumle: 'Lagenda' },
  },

  /** Nama peringkat klasik, ditransliterasi (bukan diterjemah). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Langkah Pertama', aciklama: 'Anda telah melengkapkan minggu pertama.', kosul: 'Rentetan 7 hari' },
    aliskanlik_ustasi: {
      ad: 'Pakar Tabiat',
      aciklama: '21 hari - tempoh membina tabiat telah selesai.',
      kosul: 'Rentetan 21 hari',
    },
    kararlilik: { ad: 'Teguh', aciklama: 'Anda telah bersolat selama 60 hari tanpa terputus.', kosul: 'Rentetan 60 hari' },
    efsane: { ad: 'Lagenda', aciklama: '90 hari - anda telah menunjukkan ketekunan luar biasa.', kosul: 'Rentetan 90 hari' },
    toparlanma_ustasi: {
      ad: 'Pakar Pemulihan',
      aciklama: 'Anda telah melengkapkan mod pemulihan sebanyak 3 kali.',
      kosul: '3 kali pemulihan',
    },
    mukemmeliyetci: { ad: 'Sempurna', aciklama: 'Anda telah menunaikan 5/5 solat selama 30 hari.', kosul: '30 hari solat 5/5' },
    yuz_namaz: { ad: '100 Solat', aciklama: 'Anda telah menunaikan 100 solat kesemuanya.', kosul: 'Tunaikan 100 solat' },
    bin_namaz: { ad: '1000 Solat', aciklama: 'Anda telah menunaikan 1000 solat kesemuanya.', kosul: 'Tunaikan 1000 solat' },
  },

  rozetSeviyeleri: { bronz: 'GANGSA', gumus: 'PERAK', altin: 'EMAS', elmas: 'BERLIAN' },

  gunBitis: {
    erken: 'Untuk yang tidur awal',
    varsayilan: 'Lalai - sebelum Subuh di kebanyakan tempat',
    gec: 'Untuk yang tidur lewat',
  },

  kutlama: {
    rozetEklendi: '🏅 Ditambah ke koleksi lencana anda',
    paylasin: 'Kongsi',
    rozetBaslik: 'Semoga Allah mengekalkannya',
    rozetMesaj: 'Anda memperoleh lencana "{ad}".',
    hedefBaslik: cogul({ other: '{n} hari' }),
    hedefMesaj: 'Anda telah mencapai sasaran "{ad}". Semoga Allah mengekalkannya.',
    yeniRank: 'Peringkat baharu: {rank}',
    seviyeBaslik: 'Tahap baharu anda',
    seviyeMesaj: 'Anda kini meneruskan sebagai "{rank}". Semoga Allah mengekalkannya.',
    toparlanmaBaslik: 'Rentetan anda kembali',
    toparlanmaMesaj: cogul({ other: 'Rentetan {n} hari anda bersambung dari tempat ia terhenti. Semoga Allah kurniakan istiqamah.' }),
    enUzunBaslik: 'Rentetan terpanjang anda',
    enUzunMesaj: cogul({ other: '{n} hari: rentetan terpanjang anda setakat ini. Semoga Allah mengekalkannya.' }),
  },

  sekme: {
    hataOkunamadi: 'Rekod lepas anda tidak dapat dibaca buat masa ini.',
    yenidenErisim: 'Cuba muatkan semula data rentetan',
    yenidenDeneyin: 'Cuba lagi',
    yukleniyor: 'Memuatkan data rentetan anda...',
    gunlukSeri: 'hari rentetan',
    rekor: 'rekod',
    sozErisim: '{metin} Sumber: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Sasaran seterusnya',
    tumu: 'Anda telah melengkapkan semua lencana',
    kalan: cogul({ other: 'Lencana {ad}: {n} hari lagi' }),
    tumuErisim: 'Anda telah melengkapkan semua lencana: tasbih penuh.',
    erisim: 'Lencana {ad}: {n} daripada {hedef} hari selesai.',
  },

  gok: {
    gunHarfleri: ['I', 'S', 'R', 'K', 'J', 'S', 'A'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ other: '{n} hari mencapai sasaran' }),
    besVakit: cogul({ other: '{n} hari dengan kelima-lima waktu' }),
    dondurulmus: cogul({ other: '{n} hari dibekukan' }),
    mevcutSeri: cogul({ other: 'Rentetan semasa: {n} hari.' }),
  },

  hedefAyar: {
    azalt: 'Kurangkan',
    deger: 'Nilai',
    artir: 'Tambah',
    esik: cogul({ other: '{n} waktu' }),
    sifirlaBaslik: 'Tetapkan semula rentetan',
    sifirlaMesaj: 'Semua data rentetan anda (rentetan, lencana, mata) akan ditetapkan semula. Tindakan ini tidak boleh dibuat asal. Adakah anda mahu meneruskan?',
    sifirla: 'Tetapkan semula',
    iptal: 'Batal',
    basarili: 'Selesai',
    sifirlandi: 'Data rentetan anda telah ditetapkan semula.',
    hedefAyarlari: 'TETAPAN SASARAN',
    tamGunEsigi: 'Ambang hari penuh',
    tamGunAciklama: 'Menetapkan bilangan minimum solat sehari yang diperlukan supaya hari itu dikira dalam rentetan anda',
    sifirlama: 'TETAPKAN SEMULA',
    verileriSifirla: 'Tetapkan semula data rentetan',
    verileriSifirlaAlt: 'Memadam semua data rentetan, lencana dan mata',
  },

  rozetKarti: {
    erisim: 'Lencana {ad}, {durum}',
    kazanildi: 'diperoleh',
    kilitli: 'berkunci',
  },

  toparlanma: {
    kartBaslik: 'MOD PEMULIHAN',
    kartAltBaslik: 'Anda boleh mendapatkan semula rentetan anda',
    kartMesaj: 'Anda boleh meneruskan rentetan {vurgu} anda dari tempat ia terhenti.',
    oncekiGun: cogul({ other: '{n} hari' }),
    ilerleme: '{tamam}/{hedef} hari selesai',
    kalan: cogul({ other: 'Lengkapkan kelima-lima waktu selama {n} hari lagi dan rentetan anda bersambung dari tempat ia terhenti.' }),
    bugun: 'Lengkapkan hari ini dan rentetan anda bersambung dari tempat ia terhenti.',
    uyari: 'Hari-hari itu mesti berturut-turut; jika ada hari yang tertinggal di antaranya, pemulihan bermula semula.',
    kapatErisim: 'Tutup butiran pemulihan',
    anladim: 'Faham',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Kongsi kemajuan anda',
    hazirDegilBaslik: 'Imej belum sedia',
    hazirDegilMesaj: 'Imej belum sedia. Cuba lagi dalam beberapa saat.',
    olusturulamadiBaslik: 'Imej tidak dapat dicipta',
    olusturulamadiMesaj: 'Ralat berlaku semasa mencipta imej. Cuba lagi.',
    kullanilamiyorBaslik: 'Perkongsian tidak tersedia',
    kullanilamiyorMesaj: 'Perkongsian tidak tersedia pada peranti ini.',
    kapat: 'Tutup',
    hikaye: 'Tambah ke cerita anda',
    platformlar: 'Boleh dikongsi di Instagram, WhatsApp dan lain-lain.',
    tamam: 'OK',
    seriEnUzun: cogul({ other: 'Rentetan Terpanjang Saya: {n} Hari' }),
    seriZincir: cogul({ other: 'HARI TANPA MEMUTUSKAN RANTAI' }),
    seriSoz: '"Satu langkah kecil setiap hari, ketenangan besar dalam jiwa. 🔥"',
    rozetYeni: 'SAYA MEMPEROLEH LENCANA BAHARU',
    rozetSozleri: [
      'Hari ini saya mengambil satu langkah yang baik untuk diri sendiri. 🌟',
      'Saya terus berusaha dengan tekad; lencana ini milik saya. 💪',
      'Saya meraih keberkatan pagi. 🌅',
      'Saya turut berada dalam aliran yang menenangkan jiwa ini. ✨',
      'Langkah kecil membawa ketenangan yang besar. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'SAYA MEMPEROLEH LENCANA BAHARU',
      hedef_tamamlandi: 'SAYA MENCAPAI SASARAN',
      seviye_atlandi: 'NAIK TAHAP',
      toparlanma_tamamlandi: 'KEMBALI DI LANDASAN',
      en_uzun_seri: 'REKOD BAHARU',
      varsayilan: 'PENCAPAIAN',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Semoga Tuhanku mengekalkannya. 🤲', 'Langkah kecil membawa ketenangan yang besar. 🍃', 'Semoga Allah kurniakan istiqamah kepada kita semua. 🌱'],
      hedef_tamamlandi: ['Langkah kecil membawa ketenangan yang besar. 🍃', 'Semoga Allah mengekalkannya. 🤲', 'Satu langkah lagi setiap hari. 🌱'],
      seviye_atlandi: [
        'Sedikit demi sedikit setiap hari; semoga Allah permudahkan. 🍃',
        'Semoga Allah mengekalkannya. 🤲',
        'Perjalanan diteruskan. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Yang penting bukan jatuh, tetapi bangkit semula. 🔄',
        'Semoga Allah kurniakan istiqamah. 🤲',
        'Setiap jalan dapat ditempuh dengan sabar. 🌱',
      ],
      en_uzun_seri: [
        'Satu langkah kecil setiap hari, ketenangan besar dalam hati. 🍃',
        'Semoga Allah mengekalkannya. 🤲',
        'Semoga Tuhanku kurniakan istiqamah kepada kita semua. 🌱',
      ],
    },
  },
};
