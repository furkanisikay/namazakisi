import { cogul } from '../../tipler';

/** Dil seçici sayfası ve dil değişince sorulan "kendi yazdığınız sesli okuma metinleri" sorusu. */
export const dilAyar = {
  /** Başlık her dilde iki dillidir: dili okuyamayan kullanıcı da sayfayı bulur. */
  baslik: 'Dil · Language',
  aciklama: 'Uygulamanın dilini seçin. Bildirimler ve sesli okuma da bu dilde olur.',
  grup: 'Uygulama dili',
  dilAdlari: { tr: 'Türkçe', en: 'İngilizce', id: 'Endonezce', de: 'Almanca', fr: 'Fransızca', bs: 'Boşnakça', ru: 'Rusça', ms: 'Malayca' },
  cihazDili: 'Cihazın dili',
  cihazDiliKullaniliyor: 'Şu an {ad}',
  cihazDiliDesteklenmiyor: 'Cihazınızın dili henüz yok; Türkçe kullanılıyor.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta çeviriler gözden geçiriliyor; bazı metinler kusurlu olabilir.',
    vakit: 'Dil, namaz vakitlerinin hesabını değiştirmez.',
    nass: 'Türkçe dışındaki dillerde yalnız ayet mealleri gösterilir; hadis metinleri Türkçe kaynaktan geldiği için gösterilmez.',
  },
  ozelAnons: {
    baslik: 'Kendi yazdığınız sesli okuma metinleri',
    govde: cogul({
      one: 'Kendi yazdığınız {n} sesli okuma metni önceki dilde kaldı. Yeni dilin hazır metniyle değiştirilsin mi?',
      other: 'Kendi yazdığınız {n} sesli okuma metni önceki dilde kaldı. Yeni dilin hazır metinleriyle değiştirilsin mi?',
    }),
    degistir: 'Hazır metinle değiştirin',
    koru: 'Olduğu gibi bırakın',
    degisti: cogul({ one: '{n} metin değiştirildi.', other: '{n} metin değiştirildi.' }),
  },
  kaydedilemedi: 'Dil kaydedilemedi. Lütfen tekrar deneyin.',
  /** Kurulum sihirbazındaki bağlantı (cihaz dili Türkçe değilse görünür). */
  sihirbazBaglantisi: 'Dil · Language',
  sihirbazBaglantisiAciklama: 'Uygulamanın dilini değiştirin',
} as const;
