import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'زبان · Language',
  aciklama: 'ایپ کی زبان منتخب کریں۔ اطلاعات اور بلند آواز میں پڑھائی بھی اسی زبان میں ہوگی۔',
  grup: 'ایپ کی زبان',
  dilAdlari: { tr: 'ترکی', en: 'انگریزی', id: 'انڈونیشیائی', de: 'جرمن', fr: 'فرانسیسی', bs: 'بوسنیائی', ru: 'روسی', ms: 'مالے', ar: 'عربی', ur: 'اردو', es: 'Spanish', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bengali' },
  cihazDili: 'آلے کی زبان',
  cihazDiliKullaniliyor: 'اس وقت {ad}',
  cihazDiliDesteklenmiyor: 'آپ کے آلے کی زبان ابھی دستیاب نہیں؛ ترکی استعمال ہو رہی ہے۔',
  beta: 'بیٹا',
  betaAciklama: '{ad} · بیٹا',
  notlar: {
    beta: 'بیٹا تراجم کا جائزہ لیا جا رہا ہے؛ کچھ عبارتوں میں خامی ہو سکتی ہے۔',
    vakit: 'زبان نماز کے اوقات کے حساب کو نہیں بدلتی۔',
    nass: 'ترکی کے علاوہ دیگر زبانوں میں صرف آیات کے تراجم دکھائے جاتے ہیں؛ احادیث کے متن ترکی ماخذ سے آتے ہیں، اس لیے نہیں دکھائے جاتے۔',
  },
  ozelAnons: {
    baslik: 'آپ کی لکھی ہوئی بلند خوانی کی عبارتیں',
    govde: cogul({
      one: 'آپ کی لکھی ہوئی {n} بلند خوانی کی عبارت پچھلی زبان میں ہے۔ کیا اسے نئی زبان کی تیار عبارت سے بدل دیا جائے؟',
      other: 'آپ کی لکھی ہوئی {n} بلند خوانی کی عبارتیں پچھلی زبان میں ہیں۔ کیا انہیں نئی زبان کی تیار عبارتوں سے بدل دیا جائے؟',
    }),
    degistir: 'تیار عبارت سے بدلیں',
    koru: 'جیسی ہے ویسی رہنے دیں',
    degisti: cogul({ one: '{n} عبارت بدل دی گئی۔', other: '{n} عبارتیں بدل دی گئیں۔' }),
  },
  vakitAdlari: {
    baslik: 'نمازوں کے نام',
    aciklama: 'منتخب کریں کہ نمازوں کے نام کس طرح لکھے جائیں۔',
    otomatik: 'ملک کے مطابق',
    otomatikAciklama: 'آپ کے مقام کے ملک میں رائج نام استعمال ہوتے ہیں۔',
    takimlar: { temel: 'عربی نام', diyanetDe: 'Diyanet (جرمن)', turkce: 'ترکی نام', magrip: 'شمالی افریقی املا', cezayir: 'الجزائری املا' },
  },
  kaydedilemedi: 'زبان محفوظ نہیں ہو سکی۔ دوبارہ کوشش کریں۔',
  sihirbazBaglantisi: 'زبان · Language',
  sihirbazBaglantisiAciklama: 'ایپ کی زبان بدلیں',
};
