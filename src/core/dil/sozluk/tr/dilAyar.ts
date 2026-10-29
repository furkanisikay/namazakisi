import { cogul } from '../../tipler';

/** Dil seçici sayfası ve dil değişince sorulan "kendi yazdığınız sesli okuma metinleri" sorusu. */
export const dilAyar = {
  /** Başlık her dilde iki dillidir: dili okuyamayan kullanıcı da sayfayı bulur. */
  baslik: 'Dil · Language',
  aciklama: 'Uygulamanın dilini seçin. Bildirimler ve sesli okuma da bu dilde olur.',
  grup: 'Uygulama dili',
  dilAdlari: { tr: 'Türkçe', en: 'İngilizce', id: 'Endonezce', de: 'Almanca', fr: 'Fransızca', bs: 'Boşnakça', ru: 'Rusça', ms: 'Malayca', ar: 'Arapça', ur: 'Urduca', es: 'İspanyolca', nl: 'Felemenkçe', sq: 'Arnavutça', hi: 'Hintçe', bn: 'Bengalce', fa: 'Farsça', ps: 'Peştuca', ckb: 'Orta Kürtçe', ug: 'Uygurca', az: 'Azerbaycan dili', uz: 'Özbekçe', kk: 'Kazakça', ky: 'Kırgızca', tg: 'Tacikçe' },
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
  /** Vakit adı takımı seçimi (`core/dil/vakitTakimlari.ts`); yalnız birden çok takımı olan dilde görünür. */
  vakitAdlari: {
    baslik: 'Vakit adları',
    aciklama: 'Vakitlerin hangi adlarla yazılacağını seçin.',
    otomatik: 'Ülkenize göre',
    otomatikAciklama: 'Konumunuzun ülkesinde yaygın olan adlar kullanılır.',
    takimlar: { temel: 'Arapça adlar', diyanetDe: 'Diyanet (Almanca)', turkce: 'Türkçe adlar', magrip: 'Mağrip yazımı', cezayir: 'Cezayir yazımı', afgan: 'Afganistan adları' },
  },
  /** Alfabe seçimi (`core/dil/yazi.ts`; Ayarlar > Dil, yalnız iki alfabeli dilde: Özbekçe, Kazakça). */
  yazi: {
    baslik: 'Alfabe',
    aciklama: 'Metinlerin hangi alfabeyle yazılacağını seçin.',
    otomatik: 'Ülkenize göre',
    otomatikAciklama: 'Konumunuzun ülkesinde yaygın olan alfabe kullanılır.',
    latin: 'Latin alfabesi',
    kiril: 'Kiril alfabesi',
  },
  kaydedilemedi: 'Dil kaydedilemedi. Lütfen tekrar deneyin.',
  /** Kurulum sihirbazındaki bağlantı (cihaz dili Türkçe değilse görünür). */
  sihirbazBaglantisi: 'Dil · Language',
  sihirbazBaglantisiAciklama: 'Uygulamanın dilini değiştirin',
} as const;
