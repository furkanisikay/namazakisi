import type { Sozluk } from '../tr';

/**
 * Bengalce vakit adları (Bangladeş çizelgelerindeki yaygın biçim, TEK yazım sabit): ফজর ·
 * সূর্যোদয় · যোহর (জোহর DEĞİL) · আসর · মাগরিব · ইশা (এশা DEĞİL); cuma জুমা. Bengal yazısında
 * büyük/küçük yoktur: `buyuk` ve `kucuk` `adlar` ile aynıdır. Çizelge satırı (`imsakVakti`)
 * fecir adıdır, "Imsak" değil. Yazım: নামাজ (নামায değil), কাযা (কাজা değil), ওয়াক্ত.
 * Terimler: Kıldım = "নামাজ পড়েছি" · Kılındı = "পড়া হয়েছে" · kaza কাযা · nafile নফল ·
 * kerahat মাকরূহ সময় · kıble কিবলা · seri ধারাবাহিকতা · Namaz Muhafızı নামাজ প্রহরী ·
 * hesap yöntemi হিসাব পদ্ধতি · kuşluk চাশত · işrak ইশরাক · evvâbîn আউয়াবীন ·
 * teheccüd তাহাজ্জুদ · vitir বিতর · ezan আযান · seferîlik সফর (মুসাফির) · kasr কসর ·
 * Camideyim মসজিদে আছি · Kaza Defteri কাযা খাতা · toparlanma পুনরুদ্ধার.
 * Hitap: আপনি + saygı emri (-উন); ibadete çağrıda da aynı zamir, kısa emir.
 * Rakam: sözlükte daima Batı rakamı (0-9); Bengal rakamına dönüşüm çizimde yapılır.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ফজর', gunes: 'সূর্যোদয়', ogle: 'যোহর', ikindi: 'আসর', aksam: 'মাগরিব', yatsi: 'ইশা' },
  buyuk: { imsak: 'ফজর', gunes: 'সূর্যোদয়', ogle: 'যোহর', ikindi: 'আসর', aksam: 'মাগরিব', yatsi: 'ইশা' },
  kucuk: { imsak: 'ফজর', gunes: 'সূর্যোদয়', ogle: 'যোহর', ikindi: 'আসর', aksam: 'মাগরিব', yatsi: 'ইশা' },
  imsakVakti: 'ফজর',
  cuma: 'জুমা',
  cumaKucuk: 'জুমা',
  gunesDogusu: 'সূর্যোদয়',
  gunesDogusuKucuk: 'সূর্যোদয়',
  durum: { kilindi: 'পড়া হয়েছে', vaktiGeldi: 'ওয়াক্ত হয়েছে', girmedi: 'এখনো ওয়াক্ত হয়নি', gecti: 'পড়া হয়নি' },
  durumKucuk: { kilindi: 'পড়া হয়েছে', vaktiGeldi: 'ওয়াক্ত হয়েছে', girmedi: 'এখনো ওয়াক্ত হয়নি', gecti: 'পড়া হয়নি' },
  eylem: { kildim: 'নামাজ পড়েছি', kilindi: 'পড়া হয়েছে' },
  kerahatVakti: 'মাকরূহ সময়',
  isaretle: 'পড়া হয়েছে হিসেবে চিহ্নিত করুন',
  geriAlEtiketi: '{durum}, ফিরিয়ে নিতে ট্যাপ করুন',
  geriAlindi: 'চিহ্ন সরানো হয়েছে',
};
