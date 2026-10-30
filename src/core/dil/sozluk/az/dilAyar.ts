import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Dil · Language',
  aciklama: 'Tətbiqin dilini seçin. Bildirişlər və səsli oxuma da bu dildə olacaq.',
  grup: 'Tətbiqin dili',
  dilAdlari: { tr: 'Türk dili', en: 'İngilis dili', id: 'İndoneziya dili', de: 'Alman dili', fr: 'Fransız dili', bs: 'Bosniya dili', ru: 'Rus dili', ms: 'Malay dili', ar: 'Ərəb dili', ur: 'Urdu dili', es: 'İspan dili', nl: 'Holland dili', sq: 'Alban dili', hi: 'Hind dili', bn: 'Benqal dili', fa: 'Fars dili', ps: 'Puştu dili', ckb: 'Mərkəzi kürdcə', ug: 'Uyğur dili', az: 'Azərbaycan dili', uz: 'Özbək dili', kk: 'Qazax dili', ky: 'Qırğız dili', tg: 'Tacik dili' },
  cihazDili: 'Cihazın dili',
  cihazDiliKullaniliyor: 'Hazırda {ad}',
  cihazDiliDesteklenmiyor: 'Cihazınızın dili hələ mövcud deyil; türk dili istifadə olunur.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta tərcümələr nəzərdən keçirilir; bəzi mətnlərdə qüsurlar ola bilər.',
    vakit: 'Dil namaz vaxtlarının hesablanmasını dəyişmir.',
    nass: 'Türk dilindən başqa dillərdə yalnız ayələrin tərcüməsi göstərilir; hədis mətnləri türkcə mənbədən gəldiyi üçün göstərilmir.',
  },
  ozelAnons: {
    baslik: 'Özünüzün yazdığı səsli oxuma mətnləri',
    govde: cogul({
      one: 'Özünüzün yazdığı {n} səsli oxuma mətni əvvəlki dildə qaldı. Yeni dilin hazır mətni ilə əvəz edilsin?',
      other: 'Özünüzün yazdığı {n} səsli oxuma mətni əvvəlki dildə qaldı. Yeni dilin hazır mətnləri ilə əvəz edilsin?',
    }),
    degistir: 'Hazır mətnlə əvəz edin',
    koru: 'Olduğu kimi saxlayın',
    degisti: cogul({ one: '{n} mətn əvəz edildi.', other: '{n} mətn əvəz edildi.' }),
  },
  vakitAdlari: {
    baslik: 'Vaxtların adları',
    aciklama: 'Vaxtların hansı adlarla yazılacağını seçin.',
    otomatik: 'Ölkənizə görə',
    otomatikAciklama: 'Olduğunuz ölkədə geniş yayılmış adlar istifadə olunur.',
    takimlar: { temel: 'Ərəbcə adlar', diyanetDe: 'Diyanet (alman dilində)', turkce: 'Türkcə adlar', magrip: 'Məğrib yazılışı', cezayir: 'Əlcəzair yazılışı', afgan: 'Əfqanıstan adları' },
  },
  yazi: {
    baslik: 'Əlifba',
    aciklama: 'Mətnlərin hansı əlifba ilə yazılacağını seçin.',
    otomatik: 'Ölkənizə görə',
    otomatikAciklama: 'Olduğunuz ölkədə geniş yayılmış əlifba istifadə olunur.',
    latin: 'Latın əlifbası',
    kiril: 'Kiril əlifbası',
  },
  kaydedilemedi: 'Dil yadda saxlanılmadı. Yenidən cəhd edin.',
  sihirbazBaglantisi: 'Dil · Language',
  sihirbazBaglantisiAciklama: 'Tətbiqin dilini dəyişin',
};
