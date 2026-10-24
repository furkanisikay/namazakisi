import { cogul } from '../../tipler';

/** Hatırlatma düzeyi (Kapalı · Hafif · Normal · Yoğun) ve ortak hatırlatma parçaları. */
export const hatirlatma = {
  duzeyAdlari: { kapali: 'Kapalı', hafif: 'Hafif', normal: 'Normal', yogun: 'Yoğun' },
  fark: {
    dahaAz: 'daha az uyarı',
    dahaCok: 'daha çok uyarı',
    dahaErken: 'daha erken başlar',
    dahaGec: 'daha geç başlar',
    sesliEk: '+ sesli okuma',
    sesliYok: 'sesli okumasız',
  },
  ozel: {
    ad: 'Kendi ayarınız',
    secili: 'Vakit vakit siz ayarladınız',
    geri: 'Kaydettiğiniz ayara dönün',
    cumle: 'Her vakit sizin ayarladığınız gibi hatırlatılır.',
  },
  cumle: {
    kapali: 'Vakit çıkmadan hatırlatma gelmez.',
    sesliVar: 'Son dakikada sesli okur.',
    sesliYok: 'Sesli okuma yok.',
    birKez: 'Çıkmadan {dk} dk önce bir kez hatırlatır. {ses}',
    coklu: cogul({ one: 'Çıkmadan {dk} dk önce başlar, {n} uyarı. {ses}', other: 'Çıkmadan {dk} dk önce başlar, {n} uyarı. {ses}' }),
  },
  sesliBilgi: {
    alarm: "Sesli okuma alarm gibidir: sessiz modda ve Rahatsız Etmeyin'de de duyulur.",
    bildirim: 'Sesli okuma bildirim sesiyle çalar; telefon sessizdeyken duyulmaz.',
  },
  kisa: {
    yok: 'Hatırlatma yok',
    uyari: cogul({ one: 'Vakit başına {n} uyarı', other: 'Vakit başına {n} uyarı' }),
    uyariSesli: cogul({ one: 'Vakit başına {n} uyarı, sesli', other: 'Vakit başına {n} uyarı, sesli' }),
  },
  secici: {
    eskiAciklama: 'Önceki ayarınız',
    eskiGuncelle: 'Yeni öneriyi uygulayın',
    eskiKullaniliyor: 'Önceki {duzey} ayarınız kullanılıyor.',
    eskiGuncelleEtiket: '{eylem}: güncel {duzey} düzey',
    eskiGuncelleEtiketFark: '{eylem}: güncel {duzey} düzey, {fark}',
    erisimEtiketi: 'Hatırlatma düzeyi',
  },
  onizleme: {
    vakitCikar: 'Vakit çıkar',
    hatirlatmaYok: 'Hatırlatma yok',
    dk: '{dk} dk',
  },
} as const;
