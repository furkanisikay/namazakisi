import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'কিবলা',
  yon: {
    hizali: 'আপনি কিবলামুখী আছেন',
    arkada: 'কিবলা আপনার পেছনে, ঘুরে দাঁড়ান',
    sagda: 'কিবলা আপনার ডানে {derece}°',
    solda: 'কিবলা আপনার বামে {derece}°',
  },
  harf: { kuzey: 'উ', dogu: 'পূ', guney: 'দ', bati: 'প' },
  sekme: {
    pusula: 'কম্পাস',
    pusulaErisim: 'কম্পাস মোড',
    pusulaAciklama: 'কাবার চিহ্ন ওপরের খাঁজে পৌঁছালে আপনি কিবলামুখী।',
    kamera: 'ক্যামেরা',
    kameraErisim: 'ক্যামেরা মোড',
    kameraAciklama: 'ফোন সোজা করে ধরুন; কিবলার দিকে কাবার চিহ্ন দেখা যাবে।',
  },
  sayfa: {
    baslatiliyor: 'কম্পাস চালু হচ্ছে…',
    izinKapali: 'অবস্থানের অনুমতি বন্ধ; দিক খুঁজতে আপনার অবস্থান প্রয়োজন।',
  },
  hata: {
    izinGerekli: 'কিবলার দিক খুঁজতে অবস্থানের অনুমতি প্রয়োজন।',
    konumServisi: 'অবস্থান সেবায় পৌঁছানো যাচ্ছে না। ডিভাইসের অবস্থান সেটিংস যাচাই করুন।',
    baslatilamadi: 'কিবলা সেবা চালু করা যায়নি।',
  },
  pusula: {
    ufuk: 'দিগন্ত',
    konumAliniyor: 'আপনার অবস্থান নেওয়া হচ্ছে…',
    hazirlaniyor: 'কম্পাস প্রস্তুত হচ্ছে…',
    kuzeydenAci: 'উত্তর থেকে কিবলা {derece}°',
    kabeUzakta: 'কাবা {mesafe} দূরে',
    kuzeydenSaatYonu: 'উত্তর থেকে ঘড়ির কাঁটার দিকে',
    kuzeyden: 'উত্তর থেকে {derece}°',
    kabeUzaktaKuzeyden: 'কাবা {mesafe} দূরে, উত্তর থেকে {derece}°',
    pusulaErisim: 'কিবলা কম্পাস। {cumle}',
    pusulaYok: 'এই ডিভাইসে কম্পাস নেই; উত্তরের সাপেক্ষে দিক দেখানো হচ্ছে।',
    kayiyorsa: 'দিক সরে গেলে ফোনটি বাতাসে 8 আকারে ঘোরান।',
    kamerayla: 'ক্যামেরায় দেখুন',
  },
  kamera: {
    pusulayiKullanin: 'কম্পাস ব্যবহার করুন',
    kullanilamiyorBaslik: 'এই ফোনে ক্যামেরা দৃশ্য উপলব্ধ নয়',
    kullanilamiyorMetin:
      'সোজা করে ধরলে আপনার ফোনের সেন্সর নির্ভরযোগ্য দিক দেয় না। কম্পাস তবুও সঠিক দিক দেখায়।',
    izinBaslik: 'ক্যামেরায় কিবলা দেখুন',
    izinMetin:
      'ফোন সোজা করে ধরে চারপাশে দেখুন; কিবলার দিকে কাবার চিহ্ন দেখা যাবে। এর জন্য ক্যামেরার অনুমতি লাগে; ছবি রেকর্ড হয় না এবং কখনো আপনার ফোনের বাইরে যায় না।',
    kamerayiAcin: 'ক্যামেরা চালু করুন',
    izinKapaliBaslik: 'ক্যামেরার অনুমতি বন্ধ',
    izinKapaliMetin: 'ক্যামেরা দৃশ্যের জন্য সেটিংসে ক্যামেরার অনুমতি দিতে পারেন। কম্পাস এটি ছাড়াই কাজ করে।',
    ayarlariAcin: 'সেটিংস খুলুন',
    acilamadiBaslik: 'ক্যামেরা খোলা যায়নি',
    acilamadiMetin: 'ক্যামেরা এখন উপলব্ধ নয়। কম্পাস দিয়ে কিবলা খুঁজে নিতে পারেন।',
    hesaplaniyor: 'দিক খোঁজা হচ্ছে…',
    dikTutun: 'ফোন সোজা করে ধরুন',
  },
  kalibrasyon: {
    tesekkurErisim: 'ধন্যবাদ, দিক এখন আরও নির্ভুল',
    tesekkur: 'ধন্যবাদ, দিক এখন আরও নির্ভুল ✓',
    baslik: 'কম্পাস ক্যালিব্রেট করুন',
    sallayin: 'ফোনটি বাতাসে 8 আকারে ঘোরান।',
    metal: 'ধাতব বস্তু ও চুম্বকযুক্ত কভার থেকে দূরে সরুন।',
    dogruluk: 'নির্ভুলতা',
    simdiDegil: 'এখন নয়',
  },
};
