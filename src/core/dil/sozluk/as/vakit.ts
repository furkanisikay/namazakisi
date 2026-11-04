import type { Sozluk } from '../tr';

/**
 * Assamca vakit adları (HadeethEnc as ve IslamHouse as, TEK yazım sabit): ফজৰ · সূৰ্যোদয় ·
 * জোহৰ · আছৰ (আচৰ DEĞİL: "আচৰণ" ile karışır) · মাগৰিব · ঈশ্বা; cuma জুমুআ. Bengal-Assam
 * yazısında büyük/küçük yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı
 * (`imsakVakti`) fecir adıdır. Assam harfleri ৰ (U+09F0) ve ৱ (U+09F1); Bengalce র/ব yazılmaz.
 * Terimler: namaz নামাজ (mealin ছালাত'ı yalnız ayet metninde) · Kıldım "নামাজ পঢ়িছোঁ"
 * (HadeethEnc 10945) · Kılındı "পঢ়া হ’ল" (türetildi) · vakit ওৱাক্ত · kaza কাজা · nafile নফল ·
 * kerahat মাকৰূহ সময় · kıble কিবলা · cami মছজিদ · ezan আজান · abdest অজু · seri ধাৰাবাহিকতা ·
 * Namaz Muhafızı নামাজ প্ৰহৰী · hesap yöntemi হিচাপ পদ্ধতি · kuşluk চাশত · teheccüd তাহাজ্জুদ ·
 * vitir ৱিতৰ · seferîlik ছফৰ (মুছাফিৰ) · kasr কছৰ · Camideyim মছজিদত আছোঁ · Kaza Defteri কাজা খাতা.
 * Hitap: আপুনি + saygı emri (‑ক); ibadete çağrıda da aynı zamir, kısa emir.
 * Rakam: sözlükte daima Batı rakamı (0-9); Bengal-Assam rakamına dönüşüm çizimde yapılır.
 * Kesme işareti tek biçim ’ (U+2019): হ’ল, ফ’ন.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ফজৰ', gunes: 'সূৰ্যোদয়', ogle: 'জোহৰ', ikindi: 'আছৰ', aksam: 'মাগৰিব', yatsi: 'ঈশ্বা' },
  buyuk: { imsak: 'ফজৰ', gunes: 'সূৰ্যোদয়', ogle: 'জোহৰ', ikindi: 'আছৰ', aksam: 'মাগৰিব', yatsi: 'ঈশ্বা' },
  kucuk: { imsak: 'ফজৰ', gunes: 'সূৰ্যোদয়', ogle: 'জোহৰ', ikindi: 'আছৰ', aksam: 'মাগৰিব', yatsi: 'ঈশ্বা' },
  imsakVakti: 'ফজৰ',
  cuma: 'জুমুআ',
  cumaKucuk: 'জুমুআ',
  gunesDogusu: 'সূৰ্যোদয়',
  gunesDogusuKucuk: 'সূৰ্যোদয়',
  durum: { kilindi: 'পঢ়া হ’ল', vaktiGeldi: 'ওৱাক্ত হ’ল', girmedi: 'এতিয়াও ওৱাক্ত হোৱা নাই', gecti: 'পঢ়া নহ’ল' },
  durumKucuk: { kilindi: 'পঢ়া হ’ল', vaktiGeldi: 'ওৱাক্ত হ’ল', girmedi: 'এতিয়াও ওৱাক্ত হোৱা নাই', gecti: 'পঢ়া নহ’ল' },
  eylem: { kildim: 'নামাজ পঢ়িছোঁ', kilindi: 'পঢ়া হ’ল' },
  kerahatVakti: 'মাকৰূহ সময়',
  isaretle: 'পঢ়া হ’ল বুলি চিহ্নিত কৰক',
  geriAlEtiketi: '{durum}, ঘূৰাই আনিবলৈ টিপক',
  geriAlindi: 'চিহ্ন আঁতৰোৱা হ’ল',
};
