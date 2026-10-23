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
  VERSIYON: '0.70.1',
  ACIKLAMA: 'Günlük namaz takip uygulaması',
  GITHUB_REPO: 'furkanisikay/namazakisi',
  DESTEK_EPOSTA: 'support@furkanisikay.com',
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

// ==================== KAZA DEFTERI SABITLERI ====================

export const KAZA_SABITLERI = {
  /** Motivasyon önerileri için kaza/vakit senaryoları */
  MOTIVASYON_SENARYOLARI: [1, 2, 3, 5, 10] as const,
  /** Varsayılan günlük kaza hedefi */
  VARSAYILAN_GUNLUK_HEDEF: 3,
  /** Mekruh vakit toleransı (dakika) — güneş doğuş/batışından önce/sonra */
  MEKRUH_TOLERANS_DK: 20,
  /**
   * İstiva (güneş tam tepede) kerahati: öğle girişinden önceki dakika.
   * İkizi Android TV panosunda (`tv/.../cekirdek/Kerahat.kt`); fikstür ikisini kilitler.
   */
  ISTIVA_TOLERANS_DK: 5,
  /** Tempo hesabı için kullanılan gün sayısı */
  TEMPO_HESAP_GUNLERI: 7,
} as const;

// AsyncStorage anahtarlari
export const DEPOLAMA_ANAHTARLARI = {
  NAMAZ_VERILERI: 'namaz_verileri',
  // Gun-bazli namaz kayitlari (Faz 1): namaz_gun_<tarih>. Migrasyon eski tek-blob'dan tasir,
  // eski blob SILINMEZ (veri-kaybi riski yok). NAMAZ_GUN_MIGRASYON bayragi gocun bir kez calismasini saglar.
  NAMAZ_GUN_ONEK: 'namaz_gun_',
  // ONEMLI: bu anahtar NAMAZ_GUN_ONEK ('namaz_gun_') ile BASLAMAMALI; yoksa
  // onEkiOlanAnahtarlar('namaz_gun_') bayragi gun-anahtari sanip listeye katar.
  NAMAZ_GUN_MIGRASYON: '@namaz_akisi/namaz_gun_migrasyon_tamam',
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
  // Son TAM muhafiz kurulumunun kaydi (parmak izi + kurulan kimlikler; denetim D-02):
  // 15 dk turu girdiler degismediyse yeniden kurmaz. Cihaza ozgu → yedeklemeye GIRMEZ.
  MUHAFIZ_PLAN_KAYDI: '@namaz_akisi/muhafiz_plan_kaydi',
  // iOS anons kliplerinin son kullanim gunleri (GC icin). CIHAZA OZGUDUR — dosyalar
  // bu cihazin Library/Sounds'unda yasar; yedekleme beyaz listesine GIRMEZ.
  IOS_ANONS_KLIP_KULLANIMI: '@namaz_akisi/ios_anons_klip_kullanimi',
  // Vakit Bildirim Ayarları
  VAKIT_BILDIRIM_AYARLARI: 'vakit_bildirim_ayarlari',
  // "Vakit girdi" bildiriminin vakit başına sesi (content:// URI + ad). CİHAZA ÖZGÜDÜR:
  // MediaStore kimliği başka cihazda BAŞKA bir dosyayı gösterebilir → yedekleme beyaz
  // listesine GİRMEZ (yanlış ses çalmaktansa yeni cihazda varsayılan ses).
  VAKIT_BILDIRIM_SESLERI: '@namaz_akisi/vakit_bildirim_sesleri',
  // Cuma namazı hatırlatması (issue #173) — varsayılan KAPALI
  CUMA_HATIRLATMA_AYARLARI: 'cuma_hatirlatma_ayarlari',
  // Yatış saatine göre yatsı hatırlatması + gün sonu muhasebesi (issue #290).
  // Yedekleme beyaz listesinde (YedeklemeServisi + YedekBirlestirmeServisi).
  YATIS_HATIRLATMA_AYARLARI: 'yatis_hatirlatma_ayarlari',
  // "Camide kılacağım" — yürüme süresine göre erken hatırlatma (issue #292).
  // Varsayılan KAPALI; yedeklenir (beyaz listenin ÜÇ yerinde de).
  CAMIYE_GIT_AYARLARI: 'camiye_git_ayarlari',
  // Takvim çakışması uyarısı (issue #291) — varsayılan KAPALI, açık rıza ister.
  // Yedeklenir (beyaz listenin ÜÇ yerinde de). Takvim VERİSİ hiç saklanmaz.
  TAKVIM_CAKISMA_AYARLARI: 'takvim_cakisma_ayarlari',
  // Nafile namaz vakitleri (issue #77) — varsayılan KAPALI
  NAFILE_AYARLARI: 'nafile_ayarlari',
  // Now Bar ve canlı sayaçlar seçimi (issue #282 ikinci aşama) — yedeklenir
  NOW_BAR_AYARLARI: 'now_bar_ayarlari',
  // Sayaç servislerinin Now Bar planlayıcısına bildirdiği pencereler. Mutlak zaman
  // taşır, cihaza özgüdür → yedeklemeye GİRMEZ.
  CANLI_SAYAC_KAYNAKLARI: '@namaz_akisi/canli_sayac_kaynaklari',
  // Planlayıcının saate (Wear OS) giden çıktısı; WearSenkronServisi okur. Yedeklenmez.
  CANLI_SAAT_VERISI: '@namaz_akisi/canli_saat_verisi',
  // Bu telefonda bir Wear OS saati EN AZ BİR KEZ bağlı görüldü mü ('1'). Görülmediyse saat
  // yükü hiç kurulmaz (denetim D-08). Cihaza özgü, yedeklenmez.
  WEAR_SAAT_GORULDU: '@namaz_akisi/wear_saat_goruldu',
  // Saate son gönderilen yükün özeti + anı ({ ozet, ms }): süreç ölse de aynı yük yeniden
  // gönderilmesin (headless 15 dk turu her seferinde taze süreç olabilir). Yedeklenmez.
  WEAR_SON_YUK_OZETI: '@namaz_akisi/wear_son_yuk_ozeti',
  // Now Bar YEDEĞİ için kullanıcının verdiği son "yeniden dene" anı (ms). Cihaza özgü, yedeklenmez.
  CANLI_YEDEK_YENI_DENEME: '@namaz_akisi/canli_yedek_yeni_deneme',
  // Nafile "Kıldım" (issue #273): o günün o nafilesinin kalan hatırlatmaları
  // yeniden planlanmasın diye { 'YYYY-MM-DD': NafileTuru[] }. Kayıt/puan/seri
  // DEĞİLDİR, yalnız susturma hafızası; birkaç günde budanır. Cihaza özgü →
  // yedeklemeye GİRMEZ.
  NAFILE_KILINAN: '@namaz_akisi/nafile_kilinan',
  // Bildirim "Kıldım" yanıtının son işlenen kimliği. Yanıt hem arka plan görevine
  // (Android, uygulama kapalıyken) hem açılışta getLastNotificationResponseAsync'e
  // düşer; bellek-içi koruma headless süreçte sıfırlandığı için tekilleştirme diskte.
  // Cihaza özgü → yedeklemeye GİRMEZ.
  ISLENMIS_BILDIRIM_YANITI: '@namaz_akisi/islenmis_bildirim_yaniti',
  // Vakit Sayacı Ayarları
  VAKIT_SAYAC_AYARLARI: 'vakit_sayac_ayarlari',
  // İftar Sayacı Ayarları
  IFTAR_SAYAC_AYARLARI: 'iftar_sayac_ayarlari',
  // Sahur Sayacı Ayarları
  SAHUR_SAYAC_AYARLARI: 'sahur_sayac_ayarlari',
  // Konum sistemi
  KONUM_AYARLARI: '@namaz_akisi/konum_ayarlari',
  // Kaza Defteri
  KAZA_DURUMU: '@namaz_akisi/kaza_durumu',
  KAZA_TEMPO_GECMIS: '@namaz_akisi/kaza_tempo_gecmis',
  // Kaza Defteri 2.0 — değişmez hareket defteri, AYLIK anahtarlar:
  // `kaza_hareket_<YYYY-MM>` (ay = hareketin `zaman`ının UTC ayı; iki cihaz aynı
  // hareketi aynı anahtara koysun). ÖNEMLİ: başka HİÇBİR anahtar bu önekle
  // BAŞLAMAMALI (`onEkiOlanAnahtarlar` onu ay sanır). Yedeklenir + eşitlenir.
  KAZA_HAREKET_ONEK: 'kaza_hareket_',
  // Defter ayarları (günlük hedef, toplamı gizle) — YEDEKLENİR (beyaz listenin üç yeri).
  // Otomatik ekleme ayarı burada DEĞİL, defterdedir (`otoAyar` hareketi; iki cihaz aynı
  // izdüşümü hesaplasın diye eşitlenir).
  KAZA_AYARLARI: 'kaza_defteri_ayarlari',
  // Eski KAZA_DURUMU → defter göçü bir kez (bayrak). Ham KAZA_DURUMU SİLİNMEZ.
  KAZA_DEFTERI_GOCU: '@namaz_akisi/kaza_defteri_gocu',
  // Son otomatik tarama anı (ISO) — yalnız ekrandaki "son tarama" çipi; cihaza özgü.
  KAZA_SON_TARAMA: '@namaz_akisi/kaza_son_tarama',
  // Kısa cihaz kimliği (hareketlerde kaynak gösterimi + sıralama eşitlik bozucu).
  // Cihaza özgü → yedeklemeye GİRMEZ.
  CIHAZ_KIMLIGI: '@namaz_akisi/cihaz_kimligi',
  // Ortak mezhep ayarı (seferîlik kartı + kaza defterinde vitir). Namaz vakti
  // hesabına DOKUNMAZ. YEDEKLENİR (beyaz listenin üç yeri).
  MEZHEP_AYARI: 'mezhep_ayari',
  // "Her farzla bir kaza" önerisi (issue #294) — ayar YEDEKLENİR (beyaz listenin
  // ÜÇ yerinde); sorulma hafızası cihaza özgü, tek günlük → yedeklemeye GİRMEZ.
  KAZA_ONERI_AYARLARI: 'kaza_oneri_ayarlari',
  KAZA_ONERI_KAYDI: '@namaz_akisi/kaza_oneri_kaydi',
  // Sade görünüm (issue #295) — YEDEKLENİR (beyaz listenin ÜÇ yerinde).
  SADE_GORUNUM_AYARLARI: 'sade_gorunum_ayarlari',
  // iPhone "Namazda sessiz" kurulum rehberinde tamamlandı işaretli adımlar. Yalnız ekran
  // kolaylığıdır (Odak'ın gerçek durumu okunamaz); cihaza özgü → yedeklemeye GİRMEZ.
  IOS_SESSIZ_KURULUM: '@namaz_akisi/ios_sessiz_kurulum',
  // Tablet ev ekranı modu — cihaza özgü (o tablet mutfakta duruyor), YEDEKLENMEZ.
  EV_EKRANI_AYARI: '@namaz_akisi/ev_ekrani_ayari',
  // "Hatırlatmaları bu cihazda kur" (tek beyin): ana telefon mu, ikinci cihaz mı.
  // Cihaza özgü → YEDEKLENMEZ (yedek ikinci cihaza dönünce telefonun rolünü taşımasın).
  CIHAZ_ROLU: '@namaz_akisi/cihaz_rolu',
  // TEK RIZA (sade tasarım, Dalga 3): sesli okuma + gerçek alarm onayı BİR KEZ, tüm
  // hatırlatmalar için. Eski yüzey kayıtlarından bir kez göç eder (`core/hatirlatma/rizalar`).
  // YEDEKLENİR (beyaz listenin ÜÇ yerinde).
  HATIRLATMA_RIZALARI: 'hatirlatma_rizalari',
  // Tek anahtarla kapatılan hatırlatmanın kapatılmadan ÖNCEKİ seçimi (sade tasarım,
  // Dalga 3): açınca geri gelsin. Ekran hafızası, cihaza özgü → yedeklemeye GİRMEZ.
  // `vakitGirince`: beş vakit seçimi; `namazVakitlerinde`: Namaz modu cuma/vakit tetikleri.
  KAPATMA_ONCESI_SECIM: '@namaz_akisi/kapatma_oncesi_secim',
  // Kıble ekranında son seçilen görünüm ('pusula' | 'kamera'). Ekran hafızası, cihaza
  // özgü (kamera izni cihaza bağlı) → yedeklemeye GİRMEZ.
  KIBLE_MODU: '@namaz_akisi/kible_modu',
  // Seferîlik bilgi kartı (issue #296) — ayar (kart açık, mezhep, ikamet yeri)
  // YEDEKLENİR (beyaz listenin ÜÇ yerinde); "bu yolculukta kapattım" hafızası
  // cihaza özgü → yedeklemeye GİRMEZ.
  SEFERILIK_AYARLARI: 'seferilik_ayarlari',
  SEFERILIK_KART_HAFIZASI: '@namaz_akisi/seferilik_kart_hafizasi',
  /** Ana ekran izin onarım bandında "Şimdi değil" anları ({tür: ms}); cihaza özgü, yedeklenmez. */
  KURULUM_ONARIM_ERTELEME: '@namaz_akisi/kurulum_onarim_erteleme',
  // Saat (Wear OS) iş bölümü (saat W3): uyandırma ve sesli anons NEREDE — saat
  // eşleşmesine bağlı, cihaza özgü → yedeklemeye GİRMEZ (Camideyim gibi).
  SAAT_AYARLARI: '@namaz_akisi/saat_ayarlari',
  // Kurulum sihirbazi
  ILK_KURULUM_TAMAMLANDI: '@namaz_akisi/ilk_kurulum_tamamlandi',
  // Takvim entegrasyonu
  TAKVIM_AYARLARI: '@namaz_akisi/takvim_ayarlari',
  // Son başarılı "Takvime ekleyin"deki ayarların özeti (`core/takvim/aktarimOzeti`) —
  // "bekleyen değişiklik" bandı için. Cihaza özgü (takvim etkinlikleri bu cihazda) →
  // yedeklemeye GİRMEZ.
  TAKVIM_SON_AKTARIM: '@namaz_akisi/takvim_son_aktarim',
  // Yeni özellik duyuruları (görülen/kapatılan)
  GORULEN_OZELLIKLER: '@namaz_akisi/gorulen_ozellikler',
  // Puan defteri (karma türev/defter modeli) — yol-bağımlı bonus puanı kalıcı tutulur.
  // null/yok = ilk çalışma (migrasyon: eski toplamPuan - eski tabanPuan).
  BONUS_PUAN: '@namaz_akisi/bonus_puan',
  // Tanı/sorun bildir sistemi
  TANI_HATIRLATMA_ACIK: '@namaz_akisi/tani_hatirlatma_acik',
  /** Son dışa aktarma zamanı (ISO). Cihaza özgü eylem geçmişi — YEDEĞE GİRMEZ. */
  SON_DISA_AKTARMA: '@namaz_akisi/son_disa_aktarma',
  /**
   * Cihazlar arası eşitleme durumu (issue #288): açık mı, sağlayıcı, son etiket/özet,
   * son eşitleme. Cihaza özgü → YEDEĞE GİRMEZ. Parola/anahtar burada DEĞİL,
   * `expo-secure-store`'dadır.
   */
  ESITLEME_DURUMU: '@namaz_akisi/esitleme_durumu',
  /** Otomatik eşitleme tercihleri (sıklık, yalnız Wi-Fi, yalnız şarjda) — cihaza özgü, yedeklenmez. */
  ESITLEME_TERCIHLERI: '@namaz_akisi/esitleme_tercihleri',
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
 *
 * DİKKAT — konum takibi OLAY TABANLIDIR (geofence): alanların yalnız ikisi
 * motoru besler. Bir geofence yalnızca merkez + yarıçap alır; periyodik uyanma
 * diye bir şey yoktur.
 *  - `mesafe`   → izlenen bölgenin YARIÇAPI (aktif olarak kullanılır)
 *  - `dogruluk` → çıkış olayında/onarımda alınan tek seferlik sabitlemenin
 *                 hassasiyeti (aktif olarak kullanılır)
 *  - `zaman`, `duraklatma` → ESKİ periyodik yolun kalıntısı; motora İLETİLMEZ.
 *    Silinmediler çünkü diskteki profil şeması ve testler bu şekli bekliyor;
 *    yeni koddan okumayın, "ne sıklıkla kontrol edilir" sorusunun cevabı
 *    değiller.
 */
export interface TakipProfilKonfigurasyonu {
  /** İzlenen bölgenin yaricapi (metre) */
  mesafe: number;
  /** ESKİ periyodik yolun zaman araligi (saniye) — geofence yolunda KULLANILMAZ */
  zaman: number;
  /** Konum dogruluk seviyesi (expo-location Accuracy enum degeri) */
  dogruluk: number; // Location.Accuracy degerine karsilik gelir
  /** ESKİ periyodik yolun iOS duraklatma bayragi — geofence yolunda KULLANILMAZ */
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
    // Gün sonu muhasebesi (issue #290). Muhafızda ERTELE YOK (sahip kararı 2026-10-19).
    KAZAYA_EKLE: 'kazaya_ekle_action',
    INCELE: 'incele_action',
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
    SAHUR_SAYAC: 'sahur_sayac_',
    SERI_SAYAC: 'seri_sayac_',
  },
  // Bildirim Kanallari
  KANALLAR: {
    VARSAYILAN: 'default',
    MUHAFIZ: 'muhafiz',
    MUHAFIZ_ACIL: 'muhafiz_acil',
    VAKIT_BILDIRIM: 'vakit_bildirim',
    VAKIT_SAYAC: 'vakit_sayac_v2',
    IFTAR_SAYAC: 'iftar_sayac_v2',
    SAHUR_SAYAC: 'sahur_sayac_v2',
    SERI_SAYAC: 'seri_sayac',
    // Otomatik konum degisikligi bilgisi: SESSIZ (LOW). Genel kanal MAX + sesli, bilgi mesaji icin fazla.
    KONUM: 'konum',
    // Teheccüd uyandırması: alarm ses kullanımı (sessiz modu deler). Servis kanalı
    // YOKSA oluşturur; mevcut kanala ses yazmaya kalkışmaz (AGENTS.md).
    NAFILE_UYANDIRMA: 'nafile_uyandirma',
  },
} as const;

