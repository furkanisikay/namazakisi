/**
 * Uygulama genelinde kullanilan sabitler
 * SOLID prensiplerini takip ederek arayuz sabitlerini ayiriyoruz
 */

// Namaz isimleri (Veritabanı ve Kod içinde kullanım için)
// NOT: Veritabanında Türkçe karakterli saklandığı için değerler Türkçe olmalı.
export enum NamazAdi {
  Sabah = 'Sabah',
  Gunes = 'Güneş', // UI ve Vakit hesaplama için gerekli, DB'de yok
  Ogle = 'Öğle',
  Ikindi = 'İkindi',
  Aksam = 'Akşam',
  Yatsi = 'Yatsı',
}

// UI'da gösterilecek isimler (Enum değerleri zaten Türkçe olduğu için birebir aynı olabilir, veya farklı formatlanabilir)
export const NAMAZ_GORUNUM_ISIMLERI: Record<NamazAdi, string> = {
  [NamazAdi.Sabah]: 'Sabah',
  [NamazAdi.Gunes]: 'Güneş',
  [NamazAdi.Ogle]: 'Öğle',
  [NamazAdi.Ikindi]: 'İkindi',
  [NamazAdi.Aksam]: 'Akşam',
  [NamazAdi.Yatsi]: 'Yatsı',
};

// Veritabanı oluşturulurken kullanılan liste (5 Vakit)
// Güneş vakti namaz olarak kılınmadığı/işaretlenmediği için burada yer almaz.
export const NAMAZ_ISIMLERI = [
  NamazAdi.Sabah,
  NamazAdi.Ogle,
  NamazAdi.Ikindi,
  NamazAdi.Aksam,
  NamazAdi.Yatsi,
] as const;

// Uygulama meta verileri
export const UYGULAMA = {
  ADI: 'Namaz Akışı',
  VERSIYON: '0.9.2',
  ACIKLAMA: 'Günlük namaz takip uygulaması',
  GITHUB_REPO: 'furkanisikay/namazakisi',
} as const;

// ==================== GUNCELLEME SISTEMI SABITLERI ====================

/**
 * Guncelleme kontrol kaynaklari
 */
export type GuncellemeKaynagiTipi = 'github' | 'playstore' | 'appstore';

/**
 * Guncelleme kontrol ayarlari
 */
export const GUNCELLEME_SABITLERI = {
  /** Kontroller arasi minimum bekleme suresi (milisaniye) - 6 saat */
  KONTROL_ARALIGI: 6 * 60 * 60 * 1000,
  /** GitHub API zaman asimi (milisaniye) */
  API_ZAMAN_ASIMI: 10000,
  /** Kullanicinin "Sonra" dedikten sonra tekrar gostermeden once bekleme (milisaniye) - 24 saat */
  ERTELEME_SURESI: 24 * 60 * 60 * 1000,
  /** AsyncStorage anahtari */
  DEPOLAMA_ANAHTARI: '@namaz_akisi/guncelleme_durumu',
} as const;

// Renk paleti
export const RENKLER = {
  // Ana renkler
  BIRINCIL: '#4CAF50',
  BIRINCIL_KOYU: '#388E3C',
  BIRINCIL_ACIK: '#C8E6C9',

  // Durum renkleri
  BASARILI: '#4CAF50',
  UYARI: '#FFC107',
  HATA: '#F44336',
  BILGI: '#2196F3',

  // Nötr renkler
  BEYAZ: '#FFFFFF',
  SIYAH: '#000000',
  GRI_ACIK: '#F5F5F5',
  GRI: '#9E9E9E',
  GRI_KOYU: '#616161',

  // Arka plan
  ARKAPLAN: '#FAFAFA',
  KART_ARKAPLAN: '#FFFFFF',
} as const;

// Boyutlar
export const BOYUTLAR = {
  // Padding
  PADDING_KUCUK: 8,
  PADDING_ORTA: 16,
  PADDING_BUYUK: 24,

  // Margin
  MARGIN_KUCUK: 8,
  MARGIN_ORTA: 16,
  MARGIN_BUYUK: 24,

  // Border radius
  YUVARLATMA_KUCUK: 8,
  YUVARLATMA_ORTA: 12,
  YUVARLATMA_BUYUK: 16,

  // Font boyutlari
  FONT_KUCUK: 12,
  FONT_NORMAL: 14,
  FONT_ORTA: 16,
  FONT_BUYUK: 20,
  FONT_BASLIK: 24,
} as const;

// AsyncStorage anahtarlari
export const DEPOLAMA_ANAHTARLARI = {
  NAMAZ_VERILERI: 'namaz_verileri',
  KULLANICI_AYARLARI: 'kullanici_ayarlari',
  SON_SENKRONIZASYON: 'son_senkronizasyon',
  // Seri sistemi anahtarlari
  SERI_DURUMU: 'seri_durumu',
  ROZET_VERILERI: 'rozet_verileri',
  SEVIYE_DURUMU: 'seviye_durumu',
  SERI_AYARLARI: 'seri_ayarlari',
  // Istatistikler
  TOPLAM_KILILAN_NAMAZ: 'toplam_kililan_namaz',
  TOPARLANMA_SAYISI: 'toparlanma_sayisi',
  MUKEMMEL_GUN_SAYISI: 'mukemmel_gun_sayisi',
  // Ozel gun sistemi
  OZEL_GUN_AYARLARI: 'ozel_gun_ayarlari',
  // Muhafiz sistemi
  MUHAFIZ_AYARLARI: 'muhafiz_ayarlari',
  // Vakit Bildirim Ayarları
  VAKIT_BILDIRIM_AYARLARI: 'vakit_bildirim_ayarlari',
  // Vakit Sayacı Ayarları
  VAKIT_SAYAC_AYARLARI: 'vakit_sayac_ayarlari',
  // İftar Sayacı Ayarları
  IFTAR_SAYAC_AYARLARI: 'iftar_sayac_ayarlari',
  // Konum sistemi
  KONUM_AYARLARI: '@namaz_akisi/konum_ayarlari',
} as const;

// Tarih formatlari
export const TARIH_FORMATLARI = {
  ISO: 'yyyy-MM-dd',
  GORUNUM: 'dd MMMM yyyy',
  GUN_ADI: 'EEEE',
  KISA: 'dd/MM/yyyy',
} as const;

// Istatistik periyotlari
export const ISTATISTIK_PERIYOTLARI = {
  HAFTALIK: 7,
  AYLIK: 30,
} as const;

// Performans esikleri
export const PERFORMANS_ESIKLERI = {
  MUKEMMEL: 100,
  COK_IYI: 80,
  IYI: 60,
  ORTA: 40,
} as const;

// Google OAuth ayarlari
// NOT: Bu degerleri Google Cloud Console'dan alin
// https://console.cloud.google.com/apis/credentials
export const GOOGLE_OAUTH = {
  // Expo Go ve web icin
  WEB_CLIENT_ID: '658761433733-maut0baqrkvqbf44qlultmf56qidh0se.apps.googleusercontent.com',
  // Android icin (package: com.furkanisikay.namazakisi)
  ANDROID_CLIENT_ID: 'YOUR_ANDROID_CLIENT_ID',
  // iOS icin (bundle: com.furkanisikay.namazakisi)
  IOS_CLIENT_ID: 'YOUR_IOS_CLIENT_ID',
} as const;

// ==================== SERI SISTEMI SABITLERI ====================

/**
 * Seri hedef gun sayilari
 */
export const SERI_HEDEF_GUNLERI = {
  ILK_HAFTA: 7,
  ALISKANLIK: 21,
  KARARLILIK: 60,
  EFSANE: 90,
} as const;

/**
 * Varsayilan seri ayarlari
 */
export const VARSAYILAN_SERI_AYARLARI = {
  TAM_GUN_ESIGI: 5,
  GUN_BITIS_SAATI: '05:00',
  TOPARLANMA_GUN_SAYISI: 5,
  BILDIRIMLER_AKTIF: true,
} as const;

/**
 * Seri renkleri - UI icin
 */
export const SERI_RENKLERI = {
  ATES: '#FF6B35',
  ATES_ACIK: '#FFE4D6',
  TOPARLANMA: '#FFC107',
  TOPARLANMA_ACIK: '#FFF8E1',
  BOZUK: '#F44336',
  BOZUK_ACIK: '#FFEBEE',
} as const;

/**
 * Rozet seviye renkleri
 */
export const ROZET_RENKLERI = {
  BRONZ: '#CD7F32',
  GUMUS: '#C0C0C0',
  ALTIN: '#FFD700',
  ELMAS: '#B9F2FF',
} as const;

// ==================== KONUM TAKIP PROFILLERI ====================

/**
 * Takip hassasiyet profili tipi
 */
export type TakipHassasiyeti = 'pil_dostu' | 'dengeli' | 'hassas';

/**
 * Takip profili konfigurasyonu
 */
export interface TakipProfilKonfigurasyonu {
    /** Minimum mesafe degisikligi (metre) */
    mesafe: number;
    /** Minimum zaman araligi (saniye) */
    zaman: number;
    /** Konum dogruluk seviyesi (expo-location Accuracy enum degeri) */
    dogruluk: number; // Location.Accuracy degerine karsilik gelir
    /** iOS: Hareketsizken guncellemeleri duraklat */
    duraklatma: boolean;
}

/**
 * Takip hassasiyet profilleri
 *
 * Pil Dostu: Minimum batarya tuketimi, sehirler arasi yolculuk icin yeterli
 * Dengeli: Cogu kullanici icin ideal, pil ve hassasiyet dengesi
 * Hassas: Sik hareket edenler icin, daha fazla pil tuketir
 */
export const TAKIP_PROFILLERI: Record<TakipHassasiyeti, TakipProfilKonfigurasyonu> = {
    pil_dostu: {
        mesafe: 10000,  // 10km
        zaman: 1800,    // 30 dakika
        dogruluk: 2,    // Location.Accuracy.Low (hucre kulesi, GPS yok)
        duraklatma: true,
    },
    dengeli: {
        mesafe: 5000,   // 5km
        zaman: 900,     // 15 dakika
        dogruluk: 2,    // Location.Accuracy.Low (hucre kulesi, GPS yok)
        duraklatma: false,
    },
    hassas: {
        mesafe: 2000,   // 2km
        zaman: 300,     // 5 dakika
        dogruluk: 3,    // Location.Accuracy.Balanced (Wi-Fi + hucre kulesi)
        duraklatma: false,
    },
} as const;

/**
 * Varsayilan takip hassasiyeti
 */
export const VARSAYILAN_TAKIP_HASSASIYETI: TakipHassasiyeti = 'dengeli';

// ==================== BILDIRIM SISTEMI SABITLERI ====================

/**
 * Bildirim sistemi sabitleri
 */
export const BILDIRIM_SABITLERI = {
  // Muhafiz aksiyonlari
  AKSIYONLAR: {
    KILDIM: 'kildim_action',
  },
  // Kategoriler
  KATEGORI: {
    MUHAFIZ: 'muhafiz_category',
  },
  // Bildirim ID Onekleri
  ONEKLEME: {
    MUHAFIZ: 'muhafiz_',
    VAKIT: '_vakit_',
    SEVIYE: '_seviye_',
    DAKIKA: '_dk_',
    SAYAC: 'sayac_',
    IFTAR_SAYAC: 'iftar_sayac_',
  },
  // Bildirim Kanallari
  KANALLAR: {
    VARSAYILAN: 'default',
    MUHAFIZ: 'muhafiz',
    MUHAFIZ_ACIL: 'muhafiz_acil',
    VAKIT_BILDIRIM: 'vakit_bildirim',
    VAKIT_SAYAC: 'vakit_sayac_v2',
    IFTAR_SAYAC: 'iftar_sayac_v2',
  },
} as const;

