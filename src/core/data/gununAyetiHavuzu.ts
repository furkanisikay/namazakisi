/**
 * ÜRETİLMİŞ DOSYA — elle düzenleme; `node scripts/icerik/gunun-ayeti-uret.js`.
 *
 * "Günün ayeti" havuzu. Seçim ve eleme kuralları üreticidedir; nöbetçi
 * `__tests__/gununAyetiHavuzu.test.ts` kuralları bu veride yeniden doğrular.
 *
 * Arapça: Tanzil Quran Text (Uthmani), Tanzil Project — CC BY 3.0. Metin birebirdir,
 * DEĞİŞTİRİLEMEZ; gösterildiği yerde kaynak (Tanzil Project) ve https://tanzil.net
 * bağlantısı verilir.
 * Mealler: QuranEnc (quranenc.com). Metinler değiştirilmeden ve kesilmeden alınır;
 * ekranda yayımcı ve sürümle birlikte gösterilir.
 */
export interface GununAyetiKaydi {
  /** "sûre:ayet" */
  ref: string;
  sure: number;
  ayet: number;
  /** Tanzil Uthmani, birebir. */
  ar: string;
  /** QuranEnc mealleri, birebir. */
  mealler: { tr: string; en: string };
}

export interface MealKunyesi {
  anahtar: string;
  surum: string;
  /** QuranEnc başlığı (yayımcı son " - " sonrası). */
  baslik: string;
}

export const GUNUN_AYETI_KAYNAKLARI: {
  readonly ar: { ad: 'Tanzil'; surum: string; url: 'https://tanzil.net' };
  readonly mealler: Readonly<Record<'tr' | 'en', MealKunyesi>>;
} = {
  "ar": {
    "ad": "Tanzil",
    "surum": "1.1",
    "url": "https://tanzil.net"
  },
  "mealler": {
    "tr": {
      "anahtar": "turkish_rwwad",
      "surum": "1.0.4",
      "baslik": "Rowwad Translation Center"
    },
    "en": {
      "anahtar": "english_saheeh",
      "surum": "1.1.2",
      "baslik": "Noor International Center"
    }
  }
};

export const GUNUN_AYETI_HAVUZU: readonly GununAyetiKaydi[] = [
  {
    "ref": "1:5",
    "sure": 1,
    "ayet": 5,
    "ar": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    "mealler": {
      "tr": "Yalnız sana ibadet eder ve yalnız senden yardım dileriz.",
      "en": "It is You we worship and You we ask for help."
    }
  },
  {
    "ref": "2:107",
    "sure": 2,
    "ayet": 107,
    "ar": "أَلَمْ تَعْلَمْ أَنَّ ٱللَّهَ لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَمَا لَكُم مِّن دُونِ ٱللَّهِ مِن وَلِىٍّ وَلَا نَصِيرٍ",
    "mealler": {
      "tr": "Bilmez misin ki, göklerin ve yerin hükümranlığı Allah’ındır. Sizin için Allah’tan başka ne bir dost, ne de bir yardımcı vardır.",
      "en": "Do you not know that to Allāh belongs the dominion of the heavens and the earth and [that] you have not besides Allāh any protector or any helper?"
    }
  },
  {
    "ref": "2:153",
    "sure": 2,
    "ayet": 153,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Sabrederek ve namaz kılarak Allah'tan yardım dileyin! Şüphesiz ki Allah, sabredenlerle beraberdir.",
      "en": "O you who have believed, seek help through patience and prayer. Indeed, Allāh is with the patient."
    }
  },
  {
    "ref": "2:168",
    "sure": 2,
    "ayet": 168,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ كُلُوا۟ مِمَّا فِى ٱلْأَرْضِ حَلَٰلًا طَيِّبًا وَلَا تَتَّبِعُوا۟ خُطُوَٰتِ ٱلشَّيْطَٰنِ إِنَّهُۥ لَكُمْ عَدُوٌّ مُّبِينٌ",
    "mealler": {
      "tr": "Ey insanlar! Yeryüzündeki temiz ve helal şeylerden yiyin. Şeytan'ın adımlarına uymayın! Zira o sizin için apaçık bir düşmandır.",
      "en": "O mankind, eat from whatever is on earth [that is] lawful and good and do not follow the footsteps of Satan. Indeed, he is to you a clear enemy."
    }
  },
  {
    "ref": "2:172",
    "sure": 2,
    "ayet": 172,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُلُوا۟ مِن طَيِّبَٰتِ مَا رَزَقْنَٰكُمْ وَٱشْكُرُوا۟ لِلَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Size verdiğimiz rızıkların temiz olanlarından yiyin ve eğer sadece Allah'a ibadet ediyorsanız, O'na şükredin.",
      "en": "O you who have believed, eat from the good [i.e., lawful] things which We have provided for you and be grateful to Allāh if it is [indeed] Him that you worship."
    }
  },
  {
    "ref": "2:208",
    "sure": 2,
    "ayet": 208,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱدْخُلُوا۟ فِى ٱلسِّلْمِ كَآفَّةً وَلَا تَتَّبِعُوا۟ خُطُوَٰتِ ٱلشَّيْطَٰنِ إِنَّهُۥ لَكُمْ عَدُوٌّ مُّبِينٌ",
    "mealler": {
      "tr": "Ey iman edenler! Hep birden İslam dinine tümüyle eksiksiz girin, Şeytan'ın adımlarına uymayın! O sizin apaçık düşmanınızdır.",
      "en": "O you who have believed, enter into Islām completely [and perfectly] and do not follow the footsteps of Satan. Indeed, he is to you a clear enemy."
    }
  },
  {
    "ref": "2:263",
    "sure": 2,
    "ayet": 263,
    "ar": "قَوْلٌ مَّعْرُوفٌ وَمَغْفِرَةٌ خَيْرٌ مِّن صَدَقَةٍ يَتْبَعُهَآ أَذًى وَٱللَّهُ غَنِىٌّ حَلِيمٌ",
    "mealler": {
      "tr": "Güzel söz ve bağışlama, arkasından incitme gelen sadakadan daha iyidir. Allah çok zengindir, Halim'dir.",
      "en": "Kind speech and forgiveness are better than charity followed by injury. And Allāh is Free of need and Forbearing."
    }
  },
  {
    "ref": "2:268",
    "sure": 2,
    "ayet": 268,
    "ar": "ٱلشَّيْطَٰنُ يَعِدُكُمُ ٱلْفَقْرَ وَيَأْمُرُكُم بِٱلْفَحْشَآءِ وَٱللَّهُ يَعِدُكُم مَّغْفِرَةً مِّنْهُ وَفَضْلًا وَٱللَّهُ وَٰسِعٌ عَلِيمٌ",
    "mealler": {
      "tr": "Şeytan sizi fakirlikle korkutur ve size cimriliği telkin eder. Allah ise, size mağfiretini ve bolluk vadediyor. Allah her şeyi kuşatandır ve her şeyi bilendir.",
      "en": "Satan threatens you with poverty and orders you to immorality, while Allāh promises you forgiveness from Him and bounty. And Allāh is all-Encompassing and Knowing."
    }
  },
  {
    "ref": "2:277",
    "sure": 2,
    "ayet": 277,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَأَقَامُوا۟ ٱلصَّلَوٰةَ وَءَاتَوُا۟ ٱلزَّكَوٰةَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
    "mealler": {
      "tr": "Şüphesiz iman edenler, salih amel işleyenler, namazı dosdoğru kılanlar ve zekâtı verenler için Rableri katında mükâfatları vardır. Onlara korku yoktur. Onlar, mahzun da olmayacaklardır.",
      "en": "Indeed, those who believe and do righteous deeds and establish prayer and give zakāh will have their reward with their Lord, and there will be no fear concerning them, nor will they grieve."
    }
  },
  {
    "ref": "3:5",
    "sure": 3,
    "ayet": 5,
    "ar": "إِنَّ ٱللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَىْءٌ فِى ٱلْأَرْضِ وَلَا فِى ٱلسَّمَآءِ",
    "mealler": {
      "tr": "Allah’a yer ve gökte olanlardan hiçbir şey gizli kalmaz.",
      "en": "Indeed, from Allāh nothing is hidden in the earth nor in the heaven."
    }
  },
  {
    "ref": "3:6",
    "sure": 3,
    "ayet": 6,
    "ar": "هُوَ ٱلَّذِى يُصَوِّرُكُمْ فِى ٱلْأَرْحَامِ كَيْفَ يَشَآءُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    "mealler": {
      "tr": "Ana rahminde size dilediği gibi şekil veren O’dur. Kendinden başka (ibadete layık hak) ilah olmayan, Aziz ve Hakim olan O’dur.",
      "en": "It is He who forms you in the wombs however He wills. There is no deity except Him, the Exalted in Might, the Wise."
    }
  },
  {
    "ref": "3:96",
    "sure": 3,
    "ayet": 96,
    "ar": "إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِى بِبَكَّةَ مُبَارَكًا وَهُدًى لِّلْعَٰلَمِينَ",
    "mealler": {
      "tr": "İnsanlar için (mabed olarak) kurulan ilk ev şüphesiz Mekke'deki mübarek ve âlemlere hidayet kaynağı olan (Kâbe) dir.",
      "en": "Indeed, the first House [of worship] established for mankind was that at Bakkah [i.e., Makkah] - blessed and a guidance for the worlds."
    }
  },
  {
    "ref": "3:102",
    "sure": 3,
    "ayet": 102,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ حَقَّ تُقَاتِهِۦ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’tan gerektiği gibi sakının ve yalnızca Müslümanlar olarak can verin.",
      "en": "O you who have believed, fear Allāh as He should be feared and do not die except as Muslims [in submission to Him]."
    }
  },
  {
    "ref": "3:109",
    "sure": 3,
    "ayet": 109,
    "ar": "وَلِلَّهِ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ وَإِلَى ٱللَّهِ تُرْجَعُ ٱلْأُمُورُ",
    "mealler": {
      "tr": "Göklerde ve yerde ne varsa Allah’ındır. Bütün işler ancak Allah’a döndürülür.",
      "en": "To Allāh belongs whatever is in the heavens and whatever is on the earth. And to Allāh will [all] matters be returned."
    }
  },
  {
    "ref": "3:138",
    "sure": 3,
    "ayet": 138,
    "ar": "هَٰذَا بَيَانٌ لِّلنَّاسِ وَهُدًى وَمَوْعِظَةٌ لِّلْمُتَّقِينَ",
    "mealler": {
      "tr": "Bu (Kur’an), insanlar için bir açıklama, Takvâ sahipleri için bir hidayet ve öğüttür.",
      "en": "This [Qur’ān] is a clear statement to [all] the people and a guidance and instruction for those conscious of Allāh."
    }
  },
  {
    "ref": "3:160",
    "sure": 3,
    "ayet": 160,
    "ar": "إِن يَنصُرْكُمُ ٱللَّهُ فَلَا غَالِبَ لَكُمْ وَإِن يَخْذُلْكُمْ فَمَن ذَا ٱلَّذِى يَنصُرُكُم مِّنۢ بَعْدِهِۦ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ",
    "mealler": {
      "tr": "Allah size yardım ederse, kimse size galip gelemez. Eğer sizi yardımsız bırakırsa, ondan sonra size kim yardım edebilir? Müminler, ancak Allah’a tevekkül etsinler.",
      "en": "If Allāh should aid you, no one can overcome you; but if He should forsake you, who is there that can aid you after Him? And upon Allāh let the believers rely."
    }
  },
  {
    "ref": "4:26",
    "sure": 4,
    "ayet": 26,
    "ar": "يُرِيدُ ٱللَّهُ لِيُبَيِّنَ لَكُمْ وَيَهْدِيَكُمْ سُنَنَ ٱلَّذِينَ مِن قَبْلِكُمْ وَيَتُوبَ عَلَيْكُمْ وَٱللَّهُ عَلِيمٌ حَكِيمٌ",
    "mealler": {
      "tr": "Allah size (hükümlerini) açıklamak, sizden öncekilerin yollarına hidayet etmek ve tevbenizi kabul buyurmak ister. Allah her şeyi bilendir, hikmet sahibidir",
      "en": "Allāh wants to make clear to you [the lawful from the unlawful] and guide you to the [good] practices of those before you and to accept your repentance. And Allāh is Knowing and Wise."
    }
  },
  {
    "ref": "4:27",
    "sure": 4,
    "ayet": 27,
    "ar": "وَٱللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ وَيُرِيدُ ٱلَّذِينَ يَتَّبِعُونَ ٱلشَّهَوَٰتِ أَن تَمِيلُوا۟ مَيْلًا عَظِيمًا",
    "mealler": {
      "tr": "Allah, sizin tevbenizi kabul etmek istiyor. Şehvetlerine uyanlar ise sizin büyük bir sapıklığa düşmenizi istiyorlar.",
      "en": "Allāh wants to accept your repentance, but those who follow [their] passions want you to digress [into] a great deviation."
    }
  },
  {
    "ref": "4:31",
    "sure": 4,
    "ayet": 31,
    "ar": "إِن تَجْتَنِبُوا۟ كَبَآئِرَ مَا تُنْهَوْنَ عَنْهُ نُكَفِّرْ عَنكُمْ سَيِّـَٔاتِكُمْ وَنُدْخِلْكُم مُّدْخَلًا كَرِيمًا",
    "mealler": {
      "tr": "Size yasaklananların büyüklerinden kaçınırsanız, sizin kusurlarınızı (küçük günahlarınızı) örteriz ve sizi onurlu bir makama (Cennet'e) girdiririz.",
      "en": "If you avoid the major sins which you are forbidden, We will remove from you your lesser sins and admit you to a noble entrance [into Paradise]."
    }
  },
  {
    "ref": "4:40",
    "sure": 4,
    "ayet": 40,
    "ar": "إِنَّ ٱللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ وَإِن تَكُ حَسَنَةً يُضَٰعِفْهَا وَيُؤْتِ مِن لَّدُنْهُ أَجْرًا عَظِيمًا",
    "mealler": {
      "tr": "Şüphesiz Allah, zerre miktarı kadar bile haksızlık yapmaz. Bir iyilik olursa onu kat kat artırır ve kendi katından büyük bir mükâfat verir.",
      "en": "Indeed, Allāh does not do injustice, [even] as much as an atom's weight; while if there is a good deed, He multiplies it and gives from Himself a great reward."
    }
  },
  {
    "ref": "4:87",
    "sure": 4,
    "ayet": 87,
    "ar": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ لَيَجْمَعَنَّكُمْ إِلَىٰ يَوْمِ ٱلْقِيَٰمَةِ لَا رَيْبَ فِيهِ وَمَنْ أَصْدَقُ مِنَ ٱللَّهِ حَدِيثًا",
    "mealler": {
      "tr": "Allah’tan başka hak ilah yoktur. Kendisinde hiçbir şüphe olmayan kıyamet gününde sizleri elbette bir araya getirecektir. Allah’tan daha doğru sözlü kim vardır?",
      "en": "Allāh - there is no deity except Him. He will surely assemble you for [account on] the Day of Resurrection, about which there is no doubt. And who is more truthful than Allāh in statement."
    }
  },
  {
    "ref": "4:134",
    "sure": 4,
    "ayet": 134,
    "ar": "مَّن كَانَ يُرِيدُ ثَوَابَ ٱلدُّنْيَا فَعِندَ ٱللَّهِ ثَوَابُ ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ وَكَانَ ٱللَّهُ سَمِيعًۢا بَصِيرًا",
    "mealler": {
      "tr": "Kim dünya mükâfatını isterse, bilsin ki dünyanın da, ahiretin de mükâfatı Allah'ın katındadır. Allah herşeyi, işitendir, görendir.",
      "en": "Whoever desires the reward of this world - then with Allāh is the reward of this world and the Hereafter. And ever is Allāh Hearing and Seeing."
    }
  },
  {
    "ref": "4:148",
    "sure": 4,
    "ayet": 148,
    "ar": "لَّا يُحِبُّ ٱللَّهُ ٱلْجَهْرَ بِٱلسُّوٓءِ مِنَ ٱلْقَوْلِ إِلَّا مَن ظُلِمَ وَكَانَ ٱللَّهُ سَمِيعًا عَلِيمًا",
    "mealler": {
      "tr": "Allah kötü sözün açıkça söylenmesini sevmez; ancak haksızlığa uğrayan başka. Allah her şeyi işitendir, bilendir.",
      "en": "Allāh does not like the public mention of evil except by one who has been wronged. And ever is Allāh Hearing and Knowing."
    }
  },
  {
    "ref": "5:9",
    "sure": 5,
    "ayet": 9,
    "ar": "وَعَدَ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ عَظِيمٌ",
    "mealler": {
      "tr": "Allah, iman edip salih amel işleyenlere mağfiret ve büyük bir mükâfat olduğunu vadetmiştir.",
      "en": "Allāh has promised those who believe and do righteous deeds [that] for them there is forgiveness and great reward."
    }
  },
  {
    "ref": "5:35",
    "sure": 5,
    "ayet": 35,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَٱبْتَغُوٓا۟ إِلَيْهِ ٱلْوَسِيلَةَ وَجَٰهِدُوا۟ فِى سَبِيلِهِۦ لَعَلَّكُمْ تُفْلِحُونَ",
    "mealler": {
      "tr": "Ey İman edenler! Allah’tan sakının/takvalı olun. O’na (yakınlaştıracak ibadetlerle) vesile/yol arayın ve yolunda cihat edin ki, kurtuluşa eresiniz.",
      "en": "O you who have believed, fear Allāh and seek the means [of nearness] to Him and strive in His cause that you may succeed."
    }
  },
  {
    "ref": "5:40",
    "sure": 5,
    "ayet": 40,
    "ar": "أَلَمْ تَعْلَمْ أَنَّ ٱللَّهَ لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يُعَذِّبُ مَن يَشَآءُ وَيَغْفِرُ لِمَن يَشَآءُ وَٱللَّهُ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "mealler": {
      "tr": "Bilmez misin ki göklerin ve yerin mülkü Allah'ındır? Allah, dilediğine azap eder, dilediğini ise bağışlar. Allah’ın her şeye gücü yeter.",
      "en": "Do you not know that to Allāh belongs the dominion of the heavens and the earth? He punishes whom He wills and forgives whom He wills, and Allāh is over all things competent."
    }
  },
  {
    "ref": "5:87",
    "sure": 5,
    "ayet": 87,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُحَرِّمُوا۟ طَيِّبَٰتِ مَآ أَحَلَّ ٱللَّهُ لَكُمْ وَلَا تَعْتَدُوٓا۟ إِنَّ ٱللَّهَ لَا يُحِبُّ ٱلْمُعْتَدِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’ın size helâl kıldığı temiz şeyleri haram kılmayın ve haddi aşmayın. Çünkü Allah, haddi aşanları sevmez.",
      "en": "O you who have believed, do not prohibit the good things which Allāh has made lawful to you and do not transgress. Indeed, Allāh does not like transgressors."
    }
  },
  {
    "ref": "5:91",
    "sure": 5,
    "ayet": 91,
    "ar": "إِنَّمَا يُرِيدُ ٱلشَّيْطَٰنُ أَن يُوقِعَ بَيْنَكُمُ ٱلْعَدَٰوَةَ وَٱلْبَغْضَآءَ فِى ٱلْخَمْرِ وَٱلْمَيْسِرِ وَيَصُدَّكُمْ عَن ذِكْرِ ٱللَّهِ وَعَنِ ٱلصَّلَوٰةِ فَهَلْ أَنتُم مُّنتَهُونَ",
    "mealler": {
      "tr": "Şeytan, içki ve kumarla, ancak aranıza düşmanlık ve kin sokmak; sizi Allah’ı anmaktan ve namazdan alıkoymak ister. Artık vazgeçiyor musunuz?",
      "en": "Satan only wants to cause between you animosity and hatred through intoxicants and gambling and to avert you from the remembrance of Allāh and from prayer. So will you not desist?"
    }
  },
  {
    "ref": "5:98",
    "sure": 5,
    "ayet": 98,
    "ar": "ٱعْلَمُوٓا۟ أَنَّ ٱللَّهَ شَدِيدُ ٱلْعِقَابِ وَأَنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ",
    "mealler": {
      "tr": "Bilin ki, Allah’ın cezası çetindir ve Allah çok bağışlayandır, çok merhamet edendir.",
      "en": "Know that Allāh is severe in penalty and that Allāh is Forgiving and Merciful."
    }
  },
  {
    "ref": "5:120",
    "sure": 5,
    "ayet": 120,
    "ar": "لِلَّهِ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَمَا فِيهِنَّ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌۢ",
    "mealler": {
      "tr": "Göklerin, yerin ve içindekilerin mülkü Allah’a aittir. O her şeye kadirdir.",
      "en": "To Allāh belongs the dominion of the heavens and the earth and whatever is within them. And He is over all things competent."
    }
  },
  {
    "ref": "6:102",
    "sure": 6,
    "ayet": 102,
    "ar": "ذَٰلِكُمُ ٱللَّهُ رَبُّكُمْ لَآ إِلَٰهَ إِلَّا هُوَ خَٰلِقُ كُلِّ شَىْءٍ فَٱعْبُدُوهُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ وَكِيلٌ",
    "mealler": {
      "tr": "İşte bu, Rabbiniz Allah’tır. Ondan başka (hak) ilah yoktur. Her şeyin yaratıcısıdır. O’na ibadet edin. O, her şey üzerinde vekildir.",
      "en": "That is Allāh, your Lord; there is no deity except Him, the Creator of all things, so worship Him. And He is Disposer of all things."
    }
  },
  {
    "ref": "6:117",
    "sure": 6,
    "ayet": 117,
    "ar": "إِنَّ رَبَّكَ هُوَ أَعْلَمُ مَن يَضِلُّ عَن سَبِيلِهِۦ وَهُوَ أَعْلَمُ بِٱلْمُهْتَدِينَ",
    "mealler": {
      "tr": "Doğrusu Rabbin, yolundan kimin saptığını daha iyi bilir. Hidayete ermiş olanları da en iyi O bilir.",
      "en": "Indeed, your Lord is most knowing of who strays from His way, and He is most knowing of the [rightly] guided."
    }
  },
  {
    "ref": "7:3",
    "sure": 7,
    "ayet": 3,
    "ar": "ٱتَّبِعُوا۟ مَآ أُنزِلَ إِلَيْكُم مِّن رَّبِّكُمْ وَلَا تَتَّبِعُوا۟ مِن دُونِهِۦٓ أَوْلِيَآءَ قَلِيلًا مَّا تَذَكَّرُونَ",
    "mealler": {
      "tr": "Rabbinizden size indirilmiş olana uyun, Onun dışında dost edindiklerinize uymayın. Ne kadar az öğüt alıyorsunuz!",
      "en": "Follow, [O mankind], what has been revealed to you from your Lord and do not follow other than Him any allies. Little do you remember."
    }
  },
  {
    "ref": "7:201",
    "sure": 7,
    "ayet": 201,
    "ar": "إِنَّ ٱلَّذِينَ ٱتَّقَوْا۟ إِذَا مَسَّهُمْ طَٰٓئِفٌ مِّنَ ٱلشَّيْطَٰنِ تَذَكَّرُوا۟ فَإِذَا هُم مُّبْصِرُونَ",
    "mealler": {
      "tr": "Takvâ sahiplerine şeytandan bir vesvese geldiğinde iyice düşünürler. Bakarsın ki onlar görüp bilmişler bile.",
      "en": "Indeed, those who fear Allāh - when an impulse touches them from Satan, they remember [Him] and at once they have insight."
    }
  },
  {
    "ref": "7:206",
    "sure": 7,
    "ayet": 206,
    "ar": "إِنَّ ٱلَّذِينَ عِندَ رَبِّكَ لَا يَسْتَكْبِرُونَ عَنْ عِبَادَتِهِۦ وَيُسَبِّحُونَهُۥ وَلَهُۥ يَسْجُدُونَ",
    "mealler": {
      "tr": "Doğrusu Rabbinin katında olanlar, O'na ibadet etmekten büyüklenmezler, O'nu tenzih ederler ve yalnız O'na secde ederler",
      "en": "Indeed, those who are near your Lord [i.e., the angels] are not prevented by arrogance from His worship, and they exalt Him, and to Him they prostrate."
    }
  },
  {
    "ref": "9:116",
    "sure": 9,
    "ayet": 116,
    "ar": "إِنَّ ٱللَّهَ لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يُحْىِۦ وَيُمِيتُ وَمَا لَكُم مِّن دُونِ ٱللَّهِ مِن وَلِىٍّ وَلَا نَصِيرٍ",
    "mealler": {
      "tr": "Göklerin ve yerin mülkü elbette Allah’ındır. Dirilten ve öldüren O’dur. Sizin Allah’tan başka bir veliniz ve yardımcınız yoktur.",
      "en": "Indeed, to Allāh belongs the dominion of the heavens and the earth; He gives life and causes death. And you have not besides Allāh any protector or any helper."
    }
  },
  {
    "ref": "9:119",
    "sure": 9,
    "ayet": 119,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَكُونُوا۟ مَعَ ٱلصَّٰدِقِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’a karşı gelmekten sakının ve sâdıklarla beraber olun.",
      "en": "O you who have believed, fear Allāh and be with those who are true."
    }
  },
  {
    "ref": "9:128",
    "sure": 9,
    "ayet": 128,
    "ar": "لَقَدْ جَآءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُم بِٱلْمُؤْمِنِينَ رَءُوفٌ رَّحِيمٌ",
    "mealler": {
      "tr": "Andolsun ki size, içinizden sizin sıkıntıya uğramanız kendisine ağır gelen, size düşkün, Müminlere şefkatli ve merhametli bir rasûl gelmiştir.",
      "en": "There has certainly come to you a Messenger from among yourselves. Grievous to him is what you suffer; [he is] concerned over you [i.e., your guidance] and to the believers is kind and merciful."
    }
  },
  {
    "ref": "10:6",
    "sure": 10,
    "ayet": 6,
    "ar": "إِنَّ فِى ٱخْتِلَٰفِ ٱلَّيْلِ وَٱلنَّهَارِ وَمَا خَلَقَ ٱللَّهُ فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ لَـَٔايَٰتٍ لِّقَوْمٍ يَتَّقُونَ",
    "mealler": {
      "tr": "Gece ile gündüzün birbiri ardınca gelişinde, Allah’ın göklerde ve yerde yarattığı şeylerde sakınan bir toplum için ayetler/deliller vardır.",
      "en": "Indeed, in the alternation of the night and the day and [in] what Allāh has created in the heavens and the earth are signs for a people who fear Allāh."
    }
  },
  {
    "ref": "10:44",
    "sure": 10,
    "ayet": 44,
    "ar": "إِنَّ ٱللَّهَ لَا يَظْلِمُ ٱلنَّاسَ شَيْـًٔا وَلَٰكِنَّ ٱلنَّاسَ أَنفُسَهُمْ يَظْلِمُونَ",
    "mealler": {
      "tr": "Şüphesiz ki Allah insanlara hiçbir şekilde zulmetmez, fakat insanlar kendilerine zulmederler.",
      "en": "Indeed, Allāh does not wrong the people at all, but it is the people who are wronging themselves."
    }
  },
  {
    "ref": "10:55",
    "sure": 10,
    "ayet": 55,
    "ar": "أَلَآ إِنَّ لِلَّهِ مَا فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ أَلَآ إِنَّ وَعْدَ ٱللَّهِ حَقٌّ وَلَٰكِنَّ أَكْثَرَهُمْ لَا يَعْلَمُونَ",
    "mealler": {
      "tr": "Bilesiniz ki, göklerdeki her şey, yerdeki her şey Allah’ındır. Yine bilesiniz ki, Allah’ın vaadi haktır. Fakat onların çoğu bunu bilmez.",
      "en": "Unquestionably, to Allāh belongs whatever is in the heavens and the earth. Unquestionably, the promise of Allāh is truth, but most of them do not know."
    }
  },
  {
    "ref": "10:56",
    "sure": 10,
    "ayet": 56,
    "ar": "هُوَ يُحْىِۦ وَيُمِيتُ وَإِلَيْهِ تُرْجَعُونَ",
    "mealler": {
      "tr": "Dirilten ve öldüren O’dur. O’na döndürüleceksiniz!",
      "en": "He gives life and causes death, and to Him you will be returned."
    }
  },
  {
    "ref": "10:57",
    "sure": 10,
    "ayet": 57,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ قَدْ جَآءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَآءٌ لِّمَا فِى ٱلصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    "mealler": {
      "tr": "Ey insanlar! Rabbinizden size bir öğüt, göğüslerdeki (şüphe ve sıkıntılar) için bir şifa ve Müminler için bir hidayet ve rahmet gelmiştir.",
      "en": "O mankind, there has come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers."
    }
  },
  {
    "ref": "11:23",
    "sure": 11,
    "ayet": 23,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَأَخْبَتُوٓا۟ إِلَىٰ رَبِّهِمْ أُو۟لَٰٓئِكَ أَصْحَٰبُ ٱلْجَنَّةِ هُمْ فِيهَا خَٰلِدُونَ",
    "mealler": {
      "tr": "İman edip, salih ameller işleyen ve Rablerine gönülden bağlananlara gelince, işte onlar cennetliklerdir. Onlar orada ebedî kalacaklardır.",
      "en": "Indeed, they who have believed and done righteous deeds and humbled themselves to their Lord - those are the companions of Paradise; they will abide eternally therein."
    }
  },
  {
    "ref": "11:56",
    "sure": 11,
    "ayet": 56,
    "ar": "إِنِّى تَوَكَّلْتُ عَلَى ٱللَّهِ رَبِّى وَرَبِّكُم مَّا مِن دَآبَّةٍ إِلَّا هُوَ ءَاخِذٌۢ بِنَاصِيَتِهَآ إِنَّ رَبِّى عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
    "mealler": {
      "tr": "Şüphesiz ben, benim de sizin de Rabbiniz olan Allah’a tevekkül ettim. Hareket eden ne kadar canlı varsa hepsinin alnından tutan O’dur. Benim Rabbim gerçekten dosdoğru bir yol üzeredir.",
      "en": "Indeed, I have relied upon Allāh, my Lord and your Lord. There is no creature but that He holds it by its forelock [i.e., controls it]. Indeed, my Lord is on a path [that is] straight."
    }
  },
  {
    "ref": "13:10",
    "sure": 13,
    "ayet": 10,
    "ar": "سَوَآءٌ مِّنكُم مَّنْ أَسَرَّ ٱلْقَوْلَ وَمَن جَهَرَ بِهِۦ وَمَنْ هُوَ مُسْتَخْفٍۭ بِٱلَّيْلِ وَسَارِبٌۢ بِٱلنَّهَارِ",
    "mealler": {
      "tr": "(O’na göre) içinizden sözü gizleyen ile açığa vuran, geceleyin gizlenenle gündüz ortaya çıkan birdir.",
      "en": "It is the same [to Him] concerning you whether one conceals [his] speech or publicizes it and whether one is hidden by night or conspicuous [among others] by day."
    }
  },
  {
    "ref": "13:26",
    "sure": 13,
    "ayet": 26,
    "ar": "ٱللَّهُ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ وَفَرِحُوا۟ بِٱلْحَيَوٰةِ ٱلدُّنْيَا وَمَا ٱلْحَيَوٰةُ ٱلدُّنْيَا فِى ٱلْـَٔاخِرَةِ إِلَّا مَتَٰعٌ",
    "mealler": {
      "tr": "Allah, rızkı dilediğine bol verir, (dilediğine de) kısar. Onlar ise dünya hayatı ile sevinmektedirler. Hâlbuki dünya hayatı, ahiretin yanında çok az bir geçimliktir.",
      "en": "Allāh extends provision for whom He wills and restricts [it]. And they rejoice in the worldly life, while the worldly life is not, compared to the Hereafter, except [brief] enjoyment."
    }
  },
  {
    "ref": "14:24",
    "sure": 14,
    "ayet": 24,
    "ar": "أَلَمْ تَرَ كَيْفَ ضَرَبَ ٱللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِى ٱلسَّمَآءِ",
    "mealler": {
      "tr": "Görmedin mi, Allah güzel bir sözü nasıl misal getirdi? (Güzel bir söz), kökü sağlam, dalları göğe yükselen bir ağaç gibidir.",
      "en": "Have you not considered how Allāh presents an example, [making] a good word like a good tree, whose root is firmly fixed and its branches [high] in the sky?"
    }
  },
  {
    "ref": "14:52",
    "sure": 14,
    "ayet": 52,
    "ar": "هَٰذَا بَلَٰغٌ لِّلنَّاسِ وَلِيُنذَرُوا۟ بِهِۦ وَلِيَعْلَمُوٓا۟ أَنَّمَا هُوَ إِلَٰهٌ وَٰحِدٌ وَلِيَذَّكَّرَ أُو۟لُوا۟ ٱلْأَلْبَٰبِ",
    "mealler": {
      "tr": "Bu Kur’an; kendisiyle uyarılsınlar, Allah’ın ancak tek ilâh olduğunu bilsinler ve akıl sahipleri düşünüp öğüt alsınlar diye insanlara bir bildiridir.",
      "en": "This [Qur’ān] is notification for the people that they may be warned thereby and that they may know that He is but one God and that those of understanding will be reminded."
    }
  },
  {
    "ref": "15:9",
    "sure": 15,
    "ayet": 9,
    "ar": "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَٰفِظُونَ",
    "mealler": {
      "tr": "Kur’an’ı şüphesiz biz indirdik. O’nu koruyacak olan da şüphesiz biziz.",
      "en": "Indeed, it is We who sent down the message [i.e., the Qur’ān], and indeed, We will be its guardian."
    }
  },
  {
    "ref": "15:86",
    "sure": 15,
    "ayet": 86,
    "ar": "إِنَّ رَبَّكَ هُوَ ٱلْخَلَّٰقُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Elbette Rabbin, her şeyi yaratandır, her şeyi bilendir.",
      "en": "Indeed, your Lord - He is the Knowing Creator."
    }
  },
  {
    "ref": "16:3",
    "sure": 16,
    "ayet": 3,
    "ar": "خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ بِٱلْحَقِّ تَعَٰلَىٰ عَمَّا يُشْرِكُونَ",
    "mealler": {
      "tr": "Gökleri ve yeri hak ile yarattı ve müşriklerin şirk koşmalarından çok yücedir/yüksektedir.",
      "en": "He created the heavens and earth in truth. High is He above what they associate with Him."
    }
  },
  {
    "ref": "16:10",
    "sure": 16,
    "ayet": 10,
    "ar": "هُوَ ٱلَّذِىٓ أَنزَلَ مِنَ ٱلسَّمَآءِ مَآءً لَّكُم مِّنْهُ شَرَابٌ وَمِنْهُ شَجَرٌ فِيهِ تُسِيمُونَ",
    "mealler": {
      "tr": "Sizin için gökten bir su indiren O'dur. O sudan içersiniz ve hayvanları otlatacağınız bitkileri de onunla yetiştirirsiniz.",
      "en": "It is He who sends down rain from the sky; from it is drink and from it is foliage in which you pasture [animals]."
    }
  },
  {
    "ref": "16:11",
    "sure": 16,
    "ayet": 11,
    "ar": "يُنۢبِتُ لَكُم بِهِ ٱلزَّرْعَ وَٱلزَّيْتُونَ وَٱلنَّخِيلَ وَٱلْأَعْنَٰبَ وَمِن كُلِّ ٱلثَّمَرَٰتِ إِنَّ فِى ذَٰلِكَ لَـَٔايَةً لِّقَوْمٍ يَتَفَكَّرُونَ",
    "mealler": {
      "tr": "Allah, onunla size ekinler, zeytin ve hurma ağaçları, üzüm ve her türlü ürünü yetiştirir. Düşünen bir toplum için bunda ayetler vardır.",
      "en": "He causes to grow for you thereby the crops, olives, palm trees, grapevines, and of all the fruits. Indeed in that is a sign for a people who give thought."
    }
  },
  {
    "ref": "16:22",
    "sure": 16,
    "ayet": 22,
    "ar": "إِلَٰهُكُمْ إِلَٰهٌ وَٰحِدٌ فَٱلَّذِينَ لَا يُؤْمِنُونَ بِٱلْـَٔاخِرَةِ قُلُوبُهُم مُّنكِرَةٌ وَهُم مُّسْتَكْبِرُونَ",
    "mealler": {
      "tr": "Sizin ilâhınız tek bir ilâhtır. Ahirete iman etmeyenlerin kalpleri bunu inkâr etmekte, kendileri de büyüklük taslamaktadırlar.",
      "en": "Your god is one God. But those who do not believe in the Hereafter - their hearts are disapproving, and they are arrogant."
    }
  },
  {
    "ref": "16:48",
    "sure": 16,
    "ayet": 48,
    "ar": "أَوَلَمْ يَرَوْا۟ إِلَىٰ مَا خَلَقَ ٱللَّهُ مِن شَىْءٍ يَتَفَيَّؤُا۟ ظِلَٰلُهُۥ عَنِ ٱلْيَمِينِ وَٱلشَّمَآئِلِ سُجَّدًا لِّلَّهِ وَهُمْ دَٰخِرُونَ",
    "mealler": {
      "tr": "Allah’ın yarattığı şeylerin gölgelerinin zillet ve tevazu ile boyun eğerek durmadan sağa sola dönüp Allah’a secde ettiklerini görmüyorlar mı?",
      "en": "Have they not considered what things Allāh has created? Their shadows incline to the right and to the left, prostrating to Allāh, while they [i.e., those creations] are humble."
    }
  },
  {
    "ref": "16:79",
    "sure": 16,
    "ayet": 79,
    "ar": "أَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ مُسَخَّرَٰتٍ فِى جَوِّ ٱلسَّمَآءِ مَا يُمْسِكُهُنَّ إِلَّا ٱللَّهُ إِنَّ فِى ذَٰلِكَ لَـَٔايَٰتٍ لِّقَوْمٍ يُؤْمِنُونَ",
    "mealler": {
      "tr": "Gök boşluğunda, boyun eğdirilmiş kuşları görmüyorlar mı? Onları, Allah’tan başka kimse tutmuyor. İşte bunda da iman eden bir toplum için ayetler/işaretler vardır.",
      "en": "Do they not see the birds controlled in the atmosphere of the sky? None holds them up except Allāh. Indeed in that are signs for a people who believe."
    }
  },
  {
    "ref": "16:90",
    "sure": 16,
    "ayet": 90,
    "ar": "إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَٰنِ وَإِيتَآئِ ذِى ٱلْقُرْبَىٰ وَيَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ وَٱلْبَغْىِ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ",
    "mealler": {
      "tr": "Şüphesiz Allah; adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder; hayâsızlığı, fenalık ve azgınlığı da yasaklar. O, düşünüp tutasınız diye size öğüt veriyor.",
      "en": "Indeed, Allāh orders justice and good conduct and giving [help] to relatives and forbids immorality and bad conduct and oppression. He admonishes you that perhaps you will be reminded."
    }
  },
  {
    "ref": "16:96",
    "sure": 16,
    "ayet": 96,
    "ar": "مَا عِندَكُمْ يَنفَدُ وَمَا عِندَ ٱللَّهِ بَاقٍ وَلَنَجْزِيَنَّ ٱلَّذِينَ صَبَرُوٓا۟ أَجْرَهُم بِأَحْسَنِ مَا كَانُوا۟ يَعْمَلُونَ",
    "mealler": {
      "tr": "Sizin yanınızdaki tükenir, Allah katında olan ise kalıcıdır. Elbette sabredenlere, yapmakta olduklarının en güzeliyle mükâfatlarını vereceğiz.",
      "en": "Whatever you have will end, but what Allāh has is lasting. And We will surely give those who were patient their reward according to the best of what they used to do."
    }
  },
  {
    "ref": "16:128",
    "sure": 16,
    "ayet": 128,
    "ar": "إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ",
    "mealler": {
      "tr": "Şüphesiz Allah, korkup, sakınanlar ve iyilik yapanlarla beraberdir.",
      "en": "Indeed, Allāh is with those who fear Him and those who are doers of good."
    }
  },
  {
    "ref": "17:22",
    "sure": 17,
    "ayet": 22,
    "ar": "لَّا تَجْعَلْ مَعَ ٱللَّهِ إِلَٰهًا ءَاخَرَ فَتَقْعُدَ مَذْمُومًا مَّخْذُولًا",
    "mealler": {
      "tr": "Allah ile birlikte bir başka ilah edinme! Yoksa, kınanmış ve terkedilmiş olursun.",
      "en": "Do not make [as equal] with Allāh another deity and [thereby] become censured and forsaken."
    }
  },
  {
    "ref": "17:30",
    "sure": 17,
    "ayet": 30,
    "ar": "إِنَّ رَبَّكَ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ إِنَّهُۥ كَانَ بِعِبَادِهِۦ خَبِيرًۢا بَصِيرًا",
    "mealler": {
      "tr": "Rabbin dilediği kimsenin rızkını genişletir ve (dilediği kimsenin de) daraltır. Şüphesiz ki O, kullarından haberdardır, (onları) çok iyi görür.",
      "en": "Indeed, your Lord extends provision for whom He wills and restricts [it]. Indeed He is ever, concerning His servants, Aware and Seeing."
    }
  },
  {
    "ref": "17:66",
    "sure": 17,
    "ayet": 66,
    "ar": "رَّبُّكُمُ ٱلَّذِى يُزْجِى لَكُمُ ٱلْفُلْكَ فِى ٱلْبَحْرِ لِتَبْتَغُوا۟ مِن فَضْلِهِۦٓ إِنَّهُۥ كَانَ بِكُمْ رَحِيمًا",
    "mealler": {
      "tr": "Denizde lütfunu arayasınız diye gemileri sizin için yürüten Rabbinizdir. Çünkü O, size çok merhamet eder.",
      "en": "It is your Lord who drives the ship for you through the sea that you may seek of His bounty. Indeed, He is ever, to you, Merciful."
    }
  },
  {
    "ref": "18:7",
    "sure": 18,
    "ayet": 7,
    "ar": "إِنَّا جَعَلْنَا مَا عَلَى ٱلْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا",
    "mealler": {
      "tr": "İnsanların hangisi daha güzel amel işleyecek diye imtihan etmek için yeryüzünde bulunanları, oranın süsü yaptık.",
      "en": "Indeed, We have made that which is on the earth adornment for it that We may test them [as to] which of them is best in deed."
    }
  },
  {
    "ref": "18:30",
    "sure": 18,
    "ayet": 30,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا",
    "mealler": {
      "tr": "Gerçek şu ki, iman edip salih ameller yapanlara gelince, elbette biz iyi iş yapanların ecrini zayi etmeyiz.",
      "en": "Indeed, those who have believed and done righteous deeds - indeed, We will not allow to be lost the reward of any who did well in deeds."
    }
  },
  {
    "ref": "19:40",
    "sure": 19,
    "ayet": 40,
    "ar": "إِنَّا نَحْنُ نَرِثُ ٱلْأَرْضَ وَمَنْ عَلَيْهَا وَإِلَيْنَا يُرْجَعُونَ",
    "mealler": {
      "tr": "Arza ve üzerindekilere elbet biz mirasçı oluruz ve yalnız bize döndürülürler.",
      "en": "Indeed, it is We who will inherit the earth and whoever is on it, and to Us they will be returned."
    }
  },
  {
    "ref": "19:67",
    "sure": 19,
    "ayet": 67,
    "ar": "أَوَلَا يَذْكُرُ ٱلْإِنسَٰنُ أَنَّا خَلَقْنَٰهُ مِن قَبْلُ وَلَمْ يَكُ شَيْـًٔا",
    "mealler": {
      "tr": "İnsan, daha önce hiçbir şey değilken kendisini yarattığımızı hiç düşünmüyor mu?",
      "en": "Does man not remember that We created him before, while he was nothing?"
    }
  },
  {
    "ref": "19:93",
    "sure": 19,
    "ayet": 93,
    "ar": "إِن كُلُّ مَن فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ إِلَّآ ءَاتِى ٱلرَّحْمَٰنِ عَبْدًا",
    "mealler": {
      "tr": "Göklerde ve yerde kim varsa hepsi Rahman’ın huzuruna ancak kul olarak gelir.",
      "en": "There is no one in the heavens and earth but that he comes to the Most Merciful as a servant."
    }
  },
  {
    "ref": "20:6",
    "sure": 20,
    "ayet": 6,
    "ar": "لَهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ وَمَا بَيْنَهُمَا وَمَا تَحْتَ ٱلثَّرَىٰ",
    "mealler": {
      "tr": "Göklerde, yerde ve ikisinin arasında ve toprağın altında olan her şey O’nundur.",
      "en": "To Him belongs what is in the heavens and what is on the earth and what is between them and what is under the soil."
    }
  },
  {
    "ref": "20:8",
    "sure": 20,
    "ayet": 8,
    "ar": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ لَهُ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ",
    "mealler": {
      "tr": "Allah odur ki Ondan başka (hak) ilâh yoktur. En güzel isimler yalnız Onundur.",
      "en": "Allāh - there is no deity except Him. To Him belong the best names."
    }
  },
  {
    "ref": "20:55",
    "sure": 20,
    "ayet": 55,
    "ar": "مِنْهَا خَلَقْنَٰكُمْ وَفِيهَا نُعِيدُكُمْ وَمِنْهَا نُخْرِجُكُمْ تَارَةً أُخْرَىٰ",
    "mealler": {
      "tr": "Sizi topraktan yarattık, sizi oraya döndüreceğiz ve sizi bir kere daha oradan çıkaracağız.",
      "en": "From it [i.e., the earth] We created you, and into it We will return you, and from it We will extract you another time."
    }
  },
  {
    "ref": "21:19",
    "sure": 21,
    "ayet": 19,
    "ar": "وَلَهُۥ مَن فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَمَنْ عِندَهُۥ لَا يَسْتَكْبِرُونَ عَنْ عِبَادَتِهِۦ وَلَا يَسْتَحْسِرُونَ",
    "mealler": {
      "tr": "Göklerde ve yerde kim varsa Allah'ındır. O’nun katındakiler, O'na ibadet hususunda kibirlenmez ve yorulmazlar.",
      "en": "To Him belongs whoever is in the heavens and the earth. And those near Him [i.e., the angels] are not prevented by arrogance from His worship, nor do they tire."
    }
  },
  {
    "ref": "21:22",
    "sure": 21,
    "ayet": 22,
    "ar": "لَوْ كَانَ فِيهِمَآ ءَالِهَةٌ إِلَّا ٱللَّهُ لَفَسَدَتَا فَسُبْحَٰنَ ٱللَّهِ رَبِّ ٱلْعَرْشِ عَمَّا يَصِفُونَ",
    "mealler": {
      "tr": "Eğer yerde ve gökte Allah’tan başka ilâhlar olsaydı, kesinlikle ikisinin de düzeni bozulurdu. Demek ki, Arş’ın Rabbi Allah, onların vasfettiği sıfatlardan münezzeh ve yücedir.",
      "en": "Had there been within them [i.e., the heavens and earth] gods besides Allāh, they both would have been ruined. So exalted is Allāh, Lord of the Throne, above what they describe."
    }
  },
  {
    "ref": "21:30",
    "sure": 21,
    "ayet": 30,
    "ar": "أَوَلَمْ يَرَ ٱلَّذِينَ كَفَرُوٓا۟ أَنَّ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَٰهُمَا وَجَعَلْنَا مِنَ ٱلْمَآءِ كُلَّ شَىْءٍ حَىٍّ أَفَلَا يُؤْمِنُونَ",
    "mealler": {
      "tr": "Kâfirler, görmez mi ki gökler ve yer birleşik iken onları (biz) ayırdık ve her şeye sudan hayat verdik. Hâlâ iman etmezler mi?",
      "en": "Have those who disbelieved not considered that the heavens and the earth were a joined entity, and then We separated them and made from water every living thing? Then will they not believe?"
    }
  },
  {
    "ref": "21:35",
    "sure": 21,
    "ayet": 35,
    "ar": "كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ وَنَبْلُوكُم بِٱلشَّرِّ وَٱلْخَيْرِ فِتْنَةً وَإِلَيْنَا تُرْجَعُونَ",
    "mealler": {
      "tr": "Her nefis ölümü tadıcıdır. Biz sizi şer ve hayırla imtihan olmak üzere deneriz. Sonunda bize döndürüleceksiniz.",
      "en": "Every soul will taste death. And We test you with evil and with good as trial; and to Us you will be returned."
    }
  },
  {
    "ref": "22:14",
    "sure": 22,
    "ayet": 14,
    "ar": "إِنَّ ٱللَّهَ يُدْخِلُ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ جَنَّٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَٰرُ إِنَّ ٱللَّهَ يَفْعَلُ مَا يُرِيدُ",
    "mealler": {
      "tr": "Muhakkak ki Allah, iman edip salih ameller işleyenleri içinden ırmaklar akan cennetlere koyacaktır. Şüphesiz Allah, dilediğini yapar.",
      "en": "Indeed, Allāh will admit those who believe and do righteous deeds to gardens beneath which rivers flow. Indeed, Allāh does what He intends."
    }
  },
  {
    "ref": "22:38",
    "sure": 22,
    "ayet": 38,
    "ar": "إِنَّ ٱللَّهَ يُدَٰفِعُ عَنِ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ ٱللَّهَ لَا يُحِبُّ كُلَّ خَوَّانٍ كَفُورٍ",
    "mealler": {
      "tr": "Hiç şüphesiz Allah, iman edenleri savunur. Gerçekten Allah, hain ve nankör olan kimseyi sevmez.",
      "en": "Indeed, Allāh defends those who have believed. Indeed, Allāh does not like everyone treacherous and ungrateful."
    }
  },
  {
    "ref": "22:64",
    "sure": 22,
    "ayet": 64,
    "ar": "لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ وَإِنَّ ٱللَّهَ لَهُوَ ٱلْغَنِىُّ ٱلْحَمِيدُ",
    "mealler": {
      "tr": "Göklerdeki her şey, yerdeki her şey O’nundur. Şüphesiz Allah, hiç bir şeye ihtiyacı olmayandır, elbette övgüye lâyıktır.",
      "en": "To Him belongs what is in the heavens and what is on the earth. And indeed, Allāh is the Free of need, the Praiseworthy."
    }
  },
  {
    "ref": "22:75",
    "sure": 22,
    "ayet": 75,
    "ar": "ٱللَّهُ يَصْطَفِى مِنَ ٱلْمَلَٰٓئِكَةِ رُسُلًا وَمِنَ ٱلنَّاسِ إِنَّ ٱللَّهَ سَمِيعٌۢ بَصِيرٌ",
    "mealler": {
      "tr": "Allah, meleklerden de rasûller seçer, insanlardan da. Şüphesiz Allah, hakkıyla işitendir, hakkıyla görendir.",
      "en": "Allāh chooses from the angels messengers and from the people. Indeed, Allāh is Hearing and Seeing."
    }
  },
  {
    "ref": "22:77",
    "sure": 22,
    "ayet": 77,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱرْكَعُوا۟ وَٱسْجُدُوا۟ وَٱعْبُدُوا۟ رَبَّكُمْ وَٱفْعَلُوا۟ ٱلْخَيْرَ لَعَلَّكُمْ تُفْلِحُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Rüku edin, secde edin, Rabbinize ibadet edin, hayır işleyin ki kurtuluşa eresiniz.",
      "en": "O you who have believed, bow and prostrate and worship your Lord and do good - that you may succeed."
    }
  },
  {
    "ref": "24:44",
    "sure": 24,
    "ayet": 44,
    "ar": "يُقَلِّبُ ٱللَّهُ ٱلَّيْلَ وَٱلنَّهَارَ إِنَّ فِى ذَٰلِكَ لَعِبْرَةً لِّأُو۟لِى ٱلْأَبْصَٰرِ",
    "mealler": {
      "tr": "Allah, gece ve gündüzü çevirip birbirinin ardından getirir. Doğrusu basiret sahibi olanlar için bunda ibretler vardır.",
      "en": "Allāh alternates the night and the day. Indeed in that is a lesson for those who have vision."
    }
  },
  {
    "ref": "24:46",
    "sure": 24,
    "ayet": 46,
    "ar": "لَّقَدْ أَنزَلْنَآ ءَايَٰتٍ مُّبَيِّنَٰتٍ وَٱللَّهُ يَهْدِى مَن يَشَآءُ إِلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
    "mealler": {
      "tr": "Andolsun, biz apaçık ayetler indirdik. Allah, dilediği kimseyi dosdoğru yola hidayet eder (yöneltir).",
      "en": "We have certainly sent down distinct verses. And Allāh guides whom He wills to a straight path."
    }
  },
  {
    "ref": "24:51",
    "sure": 24,
    "ayet": 51,
    "ar": "إِنَّمَا كَانَ قَوْلَ ٱلْمُؤْمِنِينَ إِذَا دُعُوٓا۟ إِلَى ٱللَّهِ وَرَسُولِهِۦ لِيَحْكُمَ بَيْنَهُمْ أَن يَقُولُوا۟ سَمِعْنَا وَأَطَعْنَا وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
    "mealler": {
      "tr": "Aralarında hüküm verilmek üzere Allah’a ve Rasûlüne çağrılan Müminlerin sözü sadece; “İşittik ve itaat ettik”dir. İşte asıl bunlar kurtuluşa erenlerdir.",
      "en": "The only statement of the [true] believers when they are called to Allāh and His Messenger to judge between them is that they say, \"We hear and we obey.\" And those are the successful."
    }
  },
  {
    "ref": "25:61",
    "sure": 25,
    "ayet": 61,
    "ar": "تَبَارَكَ ٱلَّذِى جَعَلَ فِى ٱلسَّمَآءِ بُرُوجًا وَجَعَلَ فِيهَا سِرَٰجًا وَقَمَرًا مُّنِيرًا",
    "mealler": {
      "tr": "Gökte yıldızlar/gezegenler yaratan ve orada bir kandil (Güneş) ve aydınlatıcı bir Ay var eden (Allah) çok yücedir.",
      "en": "Blessed is He who has placed in the sky great stars and placed therein a [burning] lamp and luminous moon."
    }
  },
  {
    "ref": "26:220",
    "sure": 26,
    "ayet": 220,
    "ar": "إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Şüphesiz O; hakkıyla işitendir, hakkıyla bilendir.",
      "en": "Indeed, He is the Hearing, the Knowing."
    }
  },
  {
    "ref": "27:86",
    "sure": 27,
    "ayet": 86,
    "ar": "أَلَمْ يَرَوْا۟ أَنَّا جَعَلْنَا ٱلَّيْلَ لِيَسْكُنُوا۟ فِيهِ وَٱلنَّهَارَ مُبْصِرًا إِنَّ فِى ذَٰلِكَ لَـَٔايَٰتٍ لِّقَوْمٍ يُؤْمِنُونَ",
    "mealler": {
      "tr": "Bizim geceyi o vakitte dinlensinler diye yarattığımızı, gündüzü de aydınlık kıldığımızı görmediler mi? İşte bunda iman eden bir toplum için ayetler/deliller vardır.",
      "en": "Do they not see that We made the night that they may rest therein and the day giving sight? Indeed in that are signs for a people who believe."
    }
  },
  {
    "ref": "27:89",
    "sure": 27,
    "ayet": 89,
    "ar": "مَن جَآءَ بِٱلْحَسَنَةِ فَلَهُۥ خَيْرٌ مِّنْهَا وَهُم مِّن فَزَعٍ يَوْمَئِذٍ ءَامِنُونَ",
    "mealler": {
      "tr": "Kim iyilik getirirse ona ondan daha hayırlısı vardır. Ve onlar o gün, korkudan güvendedirler.",
      "en": "Whoever comes [at Judgement] with a good deed will have better than it, and they, from the terror of that Day, will be safe."
    }
  },
  {
    "ref": "28:83",
    "sure": 28,
    "ayet": 83,
    "ar": "تِلْكَ ٱلدَّارُ ٱلْـَٔاخِرَةُ نَجْعَلُهَا لِلَّذِينَ لَا يُرِيدُونَ عُلُوًّا فِى ٱلْأَرْضِ وَلَا فَسَادًا وَٱلْعَٰقِبَةُ لِلْمُتَّقِينَ",
    "mealler": {
      "tr": "İşte ahiret yurdu. Biz, onu yeryüzünde büyüklük taslamayan ve bozgunculuk çıkarmayanlara has kılarız. Sonuç, Allah’a karşı gelmekten sakınanlarındır.",
      "en": "That home of the Hereafter We assign to those who do not desire exaltedness upon the earth or corruption. And the [best] outcome is for the righteous."
    }
  },
  {
    "ref": "29:2",
    "sure": 29,
    "ayet": 2,
    "ar": "أَحَسِبَ ٱلنَّاسُ أَن يُتْرَكُوٓا۟ أَن يَقُولُوٓا۟ ءَامَنَّا وَهُمْ لَا يُفْتَنُونَ",
    "mealler": {
      "tr": "İnsanlar; “İman ettik.” demekle, bir imtihana tabi tutulmadan bırakılacaklarını mı sanıyorlar?",
      "en": "Do the people think that they will be left to say, \"We believe\" and they will not be tried?"
    }
  },
  {
    "ref": "29:5",
    "sure": 29,
    "ayet": 5,
    "ar": "مَن كَانَ يَرْجُوا۟ لِقَآءَ ٱللَّهِ فَإِنَّ أَجَلَ ٱللَّهِ لَـَٔاتٍ وَهُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Kim Allah’a kavuşmayı umarsa, şüphesiz Allah’ın belirlediği süre gelecektir. O her şeyi işitendir, bilendir.",
      "en": "Whoever should hope for the meeting with Allāh - indeed, the term [decreed by] Allāh is coming. And He is the Hearing, the Knowing."
    }
  },
  {
    "ref": "29:19",
    "sure": 29,
    "ayet": 19,
    "ar": "أَوَلَمْ يَرَوْا۟ كَيْفَ يُبْدِئُ ٱللَّهُ ٱلْخَلْقَ ثُمَّ يُعِيدُهُۥٓ إِنَّ ذَٰلِكَ عَلَى ٱللَّهِ يَسِيرٌ",
    "mealler": {
      "tr": "Allah'ın yaratmayı nasıl başlattığını sonra onu yeniden nasıl gerçekleştirdiğini görmediler mi? Şüphesiz bu, Allah'a göre kolaydır.",
      "en": "Have they not considered how Allāh begins creation and then repeats it? Indeed that, for Allāh, is easy."
    }
  },
  {
    "ref": "29:41",
    "sure": 29,
    "ayet": 41,
    "ar": "مَثَلُ ٱلَّذِينَ ٱتَّخَذُوا۟ مِن دُونِ ٱللَّهِ أَوْلِيَآءَ كَمَثَلِ ٱلْعَنكَبُوتِ ٱتَّخَذَتْ بَيْتًا وَإِنَّ أَوْهَنَ ٱلْبُيُوتِ لَبَيْتُ ٱلْعَنكَبُوتِ لَوْ كَانُوا۟ يَعْلَمُونَ",
    "mealler": {
      "tr": "Allah’tan başka veliler edinenlerin durumu kendine yuva yapan örümceğin durumuna benzer. Evlerin en dayanıksızı ise şüphesiz örümcek evidir. Keşke bilselerdi!",
      "en": "The example of those who take allies other than Allāh is like that of the spider who takes [i.e., constructs] a home. And indeed, the weakest of homes is the home of the spider, if they only knew."
    }
  },
  {
    "ref": "29:44",
    "sure": 29,
    "ayet": 44,
    "ar": "خَلَقَ ٱللَّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ بِٱلْحَقِّ إِنَّ فِى ذَٰلِكَ لَـَٔايَةً لِّلْمُؤْمِنِينَ",
    "mealler": {
      "tr": "Allah, gökleri ve yeri hak olarak yarattı. Şüphesiz bunda iman etmekte olanlar için bir ayet vardır.",
      "en": "Allāh created the heavens and the earth in truth. Indeed in that is a sign for the believers."
    }
  },
  {
    "ref": "29:56",
    "sure": 29,
    "ayet": 56,
    "ar": "يَٰعِبَادِىَ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ أَرْضِى وَٰسِعَةٌ فَإِيَّٰىَ فَٱعْبُدُونِ",
    "mealler": {
      "tr": "Ey iman eden kullarım! Şüphesiz ki benim arzım (yeryüzü) geniştir. O halde, ancak bana ibadet edin.",
      "en": "O My servants who have believed, indeed My earth is spacious, so worship only Me."
    }
  },
  {
    "ref": "29:57",
    "sure": 29,
    "ayet": 57,
    "ar": "كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ ثُمَّ إِلَيْنَا تُرْجَعُونَ",
    "mealler": {
      "tr": "Her nefis ölümü tadacaktır. Sonra da bize döndürüleceksiniz.",
      "en": "Every soul will taste death. Then to Us will you be returned."
    }
  },
  {
    "ref": "29:62",
    "sure": 29,
    "ayet": 62,
    "ar": "ٱللَّهُ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ مِنْ عِبَادِهِۦ وَيَقْدِرُ لَهُۥٓ إِنَّ ٱللَّهَ بِكُلِّ شَىْءٍ عَلِيمٌ",
    "mealler": {
      "tr": "Allah, kullarından dilediğine bol verir ve (dilediğine) kısar. Şüphesiz Allah, her şeyi hakkıyla bilendir.",
      "en": "Allāh extends provision for whom He wills of His servants and restricts for him. Indeed Allāh is, of all things, Knowing."
    }
  },
  {
    "ref": "30:11",
    "sure": 30,
    "ayet": 11,
    "ar": "ٱللَّهُ يَبْدَؤُا۟ ٱلْخَلْقَ ثُمَّ يُعِيدُهُۥ ثُمَّ إِلَيْهِ تُرْجَعُونَ",
    "mealler": {
      "tr": "Allah yaratmayı ilk olarak başlatır, sonra onu yeniden gerçekleştirir. Sonra O'na döndürülürsünüz.",
      "en": "Allāh begins creation; then He will repeat it; then to Him you will be returned."
    }
  },
  {
    "ref": "31:26",
    "sure": 31,
    "ayet": 26,
    "ar": "لِلَّهِ مَا فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ إِنَّ ٱللَّهَ هُوَ ٱلْغَنِىُّ ٱلْحَمِيدُ",
    "mealler": {
      "tr": "Göklerlerde ve yerde olanlar Allah’ındır. Muhakkak Allah Ganî'dir, Hamîd'dir.",
      "en": "To Allāh belongs whatever is in the heavens and earth. Indeed, Allāh is the Free of need, the Praiseworthy."
    }
  },
  {
    "ref": "32:15",
    "sure": 32,
    "ayet": 15,
    "ar": "إِنَّمَا يُؤْمِنُ بِـَٔايَٰتِنَا ٱلَّذِينَ إِذَا ذُكِّرُوا۟ بِهَا خَرُّوا۟ سُجَّدًا وَسَبَّحُوا۟ بِحَمْدِ رَبِّهِمْ وَهُمْ لَا يَسْتَكْبِرُونَ",
    "mealler": {
      "tr": "Bizim ayetlerimize ancak, kendilerine bu ayetlerle öğüt verildiği zaman secdeye kapanan, kibirlenmeksizin Rablerine hamt ederek tespih edenler iman ederler.",
      "en": "Only those believe in Our verses who, when they are reminded by them, fall down in prostration and exalt [Allāh] with praise of their Lord, and they are not arrogant."
    }
  },
  {
    "ref": "33:54",
    "sure": 33,
    "ayet": 54,
    "ar": "إِن تُبْدُوا۟ شَيْـًٔا أَوْ تُخْفُوهُ فَإِنَّ ٱللَّهَ كَانَ بِكُلِّ شَىْءٍ عَلِيمًا",
    "mealler": {
      "tr": "Bir şeyi açığa vursanız da gizleseniz de şüphesiz Allah, her şeyi hakkıyla bilendir.",
      "en": "Whether you reveal a thing or conceal it, indeed Allāh is ever, of all things, Knowing."
    }
  },
  {
    "ref": "33:56",
    "sure": 33,
    "ayet": 56,
    "ar": "إِنَّ ٱللَّهَ وَمَلَٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ صَلُّوا۟ عَلَيْهِ وَسَلِّمُوا۟ تَسْلِيمًا",
    "mealler": {
      "tr": "Şüphesiz Allah ve melekleri Nebi’ye salat ederler. Ey Müminler siz de ona salat ve selam edin.",
      "en": "Indeed, Allāh confers blessing upon the Prophet, and His angels [ask Him to do so]. O you who have believed, ask [Allāh to confer] blessing upon him and ask [Allāh to grant him] peace."
    }
  },
  {
    "ref": "33:70",
    "sure": 33,
    "ayet": 70,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَقُولُوا۟ قَوْلًا سَدِيدًا",
    "mealler": {
      "tr": "Ey iman edenler! Allah’tan sakının ve doğru söz söyleyin.",
      "en": "O you who have believed, fear Allāh and speak words of appropriate justice."
    }
  },
  {
    "ref": "34:2",
    "sure": 34,
    "ayet": 2,
    "ar": "يَعْلَمُ مَا يَلِجُ فِى ٱلْأَرْضِ وَمَا يَخْرُجُ مِنْهَا وَمَا يَنزِلُ مِنَ ٱلسَّمَآءِ وَمَا يَعْرُجُ فِيهَا وَهُوَ ٱلرَّحِيمُ ٱلْغَفُورُ",
    "mealler": {
      "tr": "Allah; yere gireni, yerden çıkanı; gökten ineni ve oraya yükseleni bilir. O; çok merhametlidir, çok bağışlayıcıdır.",
      "en": "He knows what penetrates into the earth and what emerges from it and what descends from the heaven and what ascends therein. And He is the Merciful, the Forgiving."
    }
  },
  {
    "ref": "35:2",
    "sure": 35,
    "ayet": 2,
    "ar": "مَّا يَفْتَحِ ٱللَّهُ لِلنَّاسِ مِن رَّحْمَةٍ فَلَا مُمْسِكَ لَهَا وَمَا يُمْسِكْ فَلَا مُرْسِلَ لَهُۥ مِنۢ بَعْدِهِۦ وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    "mealler": {
      "tr": "Allah'ın insanlara açtığı rahmeti tutacak yoktur. O'nun tuttuğunu da ondan sonra salacak yoktur. O; mutlak güç sahibidir, hüküm ve hikmet sahibidir.",
      "en": "Whatever Allāh grants to people of mercy - none can withhold it; and whatever He withholds - none can release it thereafter. And He is the Exalted in Might, the Wise."
    }
  },
  {
    "ref": "35:5",
    "sure": 35,
    "ayet": 5,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ إِنَّ وَعْدَ ٱللَّهِ حَقٌّ فَلَا تَغُرَّنَّكُمُ ٱلْحَيَوٰةُ ٱلدُّنْيَا وَلَا يَغُرَّنَّكُم بِٱللَّهِ ٱلْغَرُورُ",
    "mealler": {
      "tr": "Ey insanlar! Şüphe yok ki Allah’ın vaadi haktır. O halde sakın sizi dünya hayatı aldatmasın ve çok aldatıcı da sakın sizi Allah ile aldatmasın.",
      "en": "O mankind, indeed the promise of Allāh is truth, so let not the worldly life delude you and be not deceived about Allāh by the Deceiver [i.e., Satan]."
    }
  },
  {
    "ref": "35:6",
    "sure": 35,
    "ayet": 6,
    "ar": "إِنَّ ٱلشَّيْطَٰنَ لَكُمْ عَدُوٌّ فَٱتَّخِذُوهُ عَدُوًّا إِنَّمَا يَدْعُوا۟ حِزْبَهُۥ لِيَكُونُوا۟ مِنْ أَصْحَٰبِ ٱلسَّعِيرِ",
    "mealler": {
      "tr": "Şüphe yok ki Şeytan; sizin düşmanınızdır, siz de onu düşman sayın. O, kendi taraftarlarını ancak ateş ehlinden olmaya çağırır.",
      "en": "Indeed, Satan is an enemy to you; so take him as an enemy. He only invites his party to be among the companions of the Blaze."
    }
  },
  {
    "ref": "35:15",
    "sure": 35,
    "ayet": 15,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ أَنتُمُ ٱلْفُقَرَآءُ إِلَى ٱللَّهِ وَٱللَّهُ هُوَ ٱلْغَنِىُّ ٱلْحَمِيدُ",
    "mealler": {
      "tr": "Ey insanlar! Allah'a muhtaç olanlar sizlersiniz. Allah zengin ve övülmeye lâyık olandır.",
      "en": "O mankind, you are those in need of Allāh, while Allāh is the Free of need, the Praiseworthy."
    }
  },
  {
    "ref": "35:16",
    "sure": 35,
    "ayet": 16,
    "ar": "إِن يَشَأْ يُذْهِبْكُمْ وَيَأْتِ بِخَلْقٍ جَدِيدٍ",
    "mealler": {
      "tr": "Allah dilerse sizi yok eder ve yerinize yeni bir halk getirir.",
      "en": "If He wills, He can do away with you and bring forth a new creation."
    }
  },
  {
    "ref": "35:27",
    "sure": 35,
    "ayet": 27,
    "ar": "أَلَمْ تَرَ أَنَّ ٱللَّهَ أَنزَلَ مِنَ ٱلسَّمَآءِ مَآءً فَأَخْرَجْنَا بِهِۦ ثَمَرَٰتٍ مُّخْتَلِفًا أَلْوَٰنُهَا وَمِنَ ٱلْجِبَالِ جُدَدٌۢ بِيضٌ وَحُمْرٌ مُّخْتَلِفٌ أَلْوَٰنُهَا وَغَرَابِيبُ سُودٌ",
    "mealler": {
      "tr": "Allah’ın gökten su indirdiğini ve onunla çeşitli renklerde ürünler çıkardığımızı görmüyor musun? Dağlardan (geçen) beyaz, kırmızı, değişik renklerde ve simsiyah yollar (yaptık).",
      "en": "Do you not see that Allāh sends down rain from the sky, and We produce thereby fruits of varying colors? And in the mountains are tracts, white and red of varying shades and [some] extremely black."
    }
  },
  {
    "ref": "35:38",
    "sure": 35,
    "ayet": 38,
    "ar": "إِنَّ ٱللَّهَ عَٰلِمُ غَيْبِ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ إِنَّهُۥ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    "mealler": {
      "tr": "Allah, göklerin ve yerin gaybını bilendir. O, kalplerin içinde ne varsa onu da hakkıyla bilendir.",
      "en": "Indeed, Allāh is Knower of the unseen [aspects] of the heavens and earth. Indeed, He is Knowing of that within the breasts."
    }
  },
  {
    "ref": "36:12",
    "sure": 36,
    "ayet": 12,
    "ar": "إِنَّا نَحْنُ نُحْىِ ٱلْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا۟ وَءَاثَٰرَهُمْ وَكُلَّ شَىْءٍ أَحْصَيْنَٰهُ فِىٓ إِمَامٍ مُّبِينٍ",
    "mealler": {
      "tr": "Muhakkak biz ölüleri diriltiriz. Onların ileri gönderdiklerini de, geride bıraktıklarını (izlerini) da yazarız. Biz, her şeyi apaçık bir kitapta (Levh-i Mahfûz'da) sayıp yazmışızdır.",
      "en": "Indeed, it is We who bring the dead to life and record what they have put forth and what they left behind, and all things We have enumerated in a clear register."
    }
  },
  {
    "ref": "36:40",
    "sure": 36,
    "ayet": 40,
    "ar": "لَا ٱلشَّمْسُ يَنۢبَغِى لَهَآ أَن تُدْرِكَ ٱلْقَمَرَ وَلَا ٱلَّيْلُ سَابِقُ ٱلنَّهَارِ وَكُلٌّ فِى فَلَكٍ يَسْبَحُونَ",
    "mealler": {
      "tr": "Ne Güneş Ay'a yetişebilir, ne de gece gündüzü geçebilir. Her biri bir yörüngede yüzmektedir.",
      "en": "It is not allowable [i.e., possible] for the sun to reach the moon, nor does the night overtake the day, but each, in an orbit, is swimming."
    }
  },
  {
    "ref": "36:81",
    "sure": 36,
    "ayet": 81,
    "ar": "أَوَلَيْسَ ٱلَّذِى خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ بِقَٰدِرٍ عَلَىٰٓ أَن يَخْلُقَ مِثْلَهُم بَلَىٰ وَهُوَ ٱلْخَلَّٰقُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Gökleri ve yeri yaratan onların bir benzerini yaratmaya güç yetiremez mi? Evet, elbette kadirdir. O hakkıyla yaratıcıdır ve her şeyi bilir.",
      "en": "Is not He who created the heavens and the earth Able to create the likes of them? Yes, [it is so]; and He is the Knowing Creator."
    }
  },
  {
    "ref": "36:82",
    "sure": 36,
    "ayet": 82,
    "ar": "إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ",
    "mealler": {
      "tr": "Bir şeyi dilediği zaman, O'nun emri yalnızca: 'Ol!' demesidir. O da hemen oluverir.",
      "en": "His command is only when He intends a thing that He says to it, \"Be,\" and it is."
    }
  },
  {
    "ref": "37:180",
    "sure": 37,
    "ayet": 180,
    "ar": "سُبْحَٰنَ رَبِّكَ رَبِّ ٱلْعِزَّةِ عَمَّا يَصِفُونَ",
    "mealler": {
      "tr": "Üstünlük (izzet) sahibi Rabbin onların nitelemelerinden münezzehtir.",
      "en": "Exalted is your Lord, the Lord of might, above what they describe."
    }
  },
  {
    "ref": "39:52",
    "sure": 39,
    "ayet": 52,
    "ar": "أَوَلَمْ يَعْلَمُوٓا۟ أَنَّ ٱللَّهَ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ إِنَّ فِى ذَٰلِكَ لَـَٔايَٰتٍ لِّقَوْمٍ يُؤْمِنُونَ",
    "mealler": {
      "tr": "Allah’ın, rızkı dilediğine bol verdiğini ve (dilediğine) kıstığını bilmezler mi? Bunda iman eden bir toplum için elbette ibretler vardır.",
      "en": "Do they not know that Allāh extends provision for whom He wills and restricts [it]? Indeed in that are signs for a people who believe."
    }
  },
  {
    "ref": "39:62",
    "sure": 39,
    "ayet": 62,
    "ar": "ٱللَّهُ خَٰلِقُ كُلِّ شَىْءٍ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ وَكِيلٌ",
    "mealler": {
      "tr": "Allah her şeyin yaratıcısıdır. O her şeye vekildir.",
      "en": "Allāh is the Creator of all things, and He is, over all things, Disposer of affairs."
    }
  },
  {
    "ref": "39:63",
    "sure": 39,
    "ayet": 63,
    "ar": "لَّهُۥ مَقَالِيدُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَٱلَّذِينَ كَفَرُوا۟ بِـَٔايَٰتِ ٱللَّهِ أُو۟لَٰٓئِكَ هُمُ ٱلْخَٰسِرُونَ",
    "mealler": {
      "tr": "Göklerin ve yerin anahtarları O’nundur. Allah’ın ayetlerini inkâr edenler var ya, işte onlar ziyana uğrayanların ta kendileridir.",
      "en": "To Him belong the keys of the heavens and the earth. And they who disbelieve in the verses of Allāh - it is those who are the losers."
    }
  },
  {
    "ref": "40:19",
    "sure": 40,
    "ayet": 19,
    "ar": "يَعْلَمُ خَآئِنَةَ ٱلْأَعْيُنِ وَمَا تُخْفِى ٱلصُّدُورُ",
    "mealler": {
      "tr": "Allah, gözlerin hain bakışını ve kalplerin gizlediğini bilir.",
      "en": "He knows that which deceives the eyes and what the breasts conceal."
    }
  },
  {
    "ref": "40:39",
    "sure": 40,
    "ayet": 39,
    "ar": "يَٰقَوْمِ إِنَّمَا هَٰذِهِ ٱلْحَيَوٰةُ ٱلدُّنْيَا مَتَٰعٌ وَإِنَّ ٱلْـَٔاخِرَةَ هِىَ دَارُ ٱلْقَرَارِ",
    "mealler": {
      "tr": "\"Ey halkım! Şüphesiz bu dünya hayatı geçicidir, ama ahiret, doğrusu işte o, kalınacak yurttur.\"",
      "en": "O my people, this worldly life is only [temporary] enjoyment, and indeed, the Hereafter - that is the home of [permanent] settlement."
    }
  },
  {
    "ref": "40:57",
    "sure": 40,
    "ayet": 57,
    "ar": "لَخَلْقُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ أَكْبَرُ مِنْ خَلْقِ ٱلنَّاسِ وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يَعْلَمُونَ",
    "mealler": {
      "tr": "Elbette göklerin ve yerin yaratılması insanların yaratılmasından daha büyüktür. Ancak insanların çoğu bilmezler.",
      "en": "The creation of the heavens and earth is greater than the creation of mankind, but most of the people do not know."
    }
  },
  {
    "ref": "40:59",
    "sure": 40,
    "ayet": 59,
    "ar": "إِنَّ ٱلسَّاعَةَ لَـَٔاتِيَةٌ لَّا رَيْبَ فِيهَا وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يُؤْمِنُونَ",
    "mealler": {
      "tr": "Elbette kıyamet mutlaka gelecektir. Bunda hiç şüphe yoktur ama insanların çoğu iman etmezler.",
      "en": "Indeed, the Hour is coming - no doubt about it - but most of the people do not believe."
    }
  },
  {
    "ref": "40:62",
    "sure": 40,
    "ayet": 62,
    "ar": "ذَٰلِكُمُ ٱللَّهُ رَبُّكُمْ خَٰلِقُ كُلِّ شَىْءٍ لَّآ إِلَٰهَ إِلَّا هُوَ فَأَنَّىٰ تُؤْفَكُونَ",
    "mealler": {
      "tr": "İşte her şeyin yaratıcısı olan Rabbiniz Allah! O’ndan başka hiçbir ilâh yoktur. Durum bu iken, nasıl oluyor da (haktan) döndürülüyorsunuz?",
      "en": "That is Allāh, your Lord, Creator of all things; there is no deity except Him, so how are you deluded?"
    }
  },
  {
    "ref": "41:8",
    "sure": 41,
    "ayet": 8,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ لَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ",
    "mealler": {
      "tr": "Şüphesiz iman edip salih ameller işleyenler için ise kesintisiz bir mükâfat vardır.",
      "en": "Indeed, those who believe and do righteous deeds - for them is a reward uninterrupted."
    }
  },
  {
    "ref": "41:46",
    "sure": 41,
    "ayet": 46,
    "ar": "مَّنْ عَمِلَ صَٰلِحًا فَلِنَفْسِهِۦ وَمَنْ أَسَآءَ فَعَلَيْهَا وَمَا رَبُّكَ بِظَلَّٰمٍ لِّلْعَبِيدِ",
    "mealler": {
      "tr": "Kim salih amel işlerse kendisi içindir. Kim de kötülük yaparsa kendi aleyhinedir. Rabbin, kullara asla zulmedici değildir.",
      "en": "Whoever does righteousness - it is for his [own] soul; and whoever does evil [does so] against it. And your Lord is not ever unjust to [His] servants."
    }
  },
  {
    "ref": "42:12",
    "sure": 42,
    "ayet": 12,
    "ar": "لَهُۥ مَقَالِيدُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ إِنَّهُۥ بِكُلِّ شَىْءٍ عَلِيمٌ",
    "mealler": {
      "tr": "Göklerin ve yerin anahtarları O’nundur. O, dilediğine rızkını bol bol verir ve dilediğine de daraltır. Çünkü O, her şeyi bilendir.",
      "en": "To Him belong the keys of the heavens and the earth. He extends provision for whom He wills and restricts [it]. Indeed He is, of all things, Knowing."
    }
  },
  {
    "ref": "42:17",
    "sure": 42,
    "ayet": 17,
    "ar": "ٱللَّهُ ٱلَّذِىٓ أَنزَلَ ٱلْكِتَٰبَ بِٱلْحَقِّ وَٱلْمِيزَانَ وَمَا يُدْرِيكَ لَعَلَّ ٱلسَّاعَةَ قَرِيبٌ",
    "mealler": {
      "tr": "Allah hak ile kitabı ve mizanı indirendir. Ne bilirsin, saat/kıyamet belki de yakındır.",
      "en": "It is Allāh who has sent down the Book in truth and [also] the balance [i.e., justice]. And what will make you perceive? Perhaps the Hour is near."
    }
  },
  {
    "ref": "43:3",
    "sure": 43,
    "ayet": 3,
    "ar": "إِنَّا جَعَلْنَٰهُ قُرْءَٰنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ",
    "mealler": {
      "tr": "Biz onu anlayasınız diye Arapça Kur’an kıldık.",
      "en": "Indeed, We have made it an Arabic Qur’ān that you might understand."
    }
  },
  {
    "ref": "43:82",
    "sure": 43,
    "ayet": 82,
    "ar": "سُبْحَٰنَ رَبِّ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ رَبِّ ٱلْعَرْشِ عَمَّا يَصِفُونَ",
    "mealler": {
      "tr": "Göklerin ve yerin Rabbi, arşın Rabbi onların vasıflandırmalarından münezzehtir.",
      "en": "Exalted is the Lord of the heavens and the earth, Lord of the Throne, above what they describe."
    }
  },
  {
    "ref": "44:8",
    "sure": 44,
    "ayet": 8,
    "ar": "لَآ إِلَٰهَ إِلَّا هُوَ يُحْىِۦ وَيُمِيتُ رَبُّكُمْ وَرَبُّ ءَابَآئِكُمُ ٱلْأَوَّلِينَ",
    "mealler": {
      "tr": "O’ndan başka (hak) ilah yoktur. Diriltir ve öldürür. Sizin de Rabbiniz, sizden önceki atalarınızın da Rabbidir.",
      "en": "There is no deity except Him; He gives life and causes death. [He is] your Lord and the Lord of your first forefathers."
    }
  },
  {
    "ref": "45:3",
    "sure": 45,
    "ayet": 3,
    "ar": "إِنَّ فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ لَـَٔايَٰتٍ لِّلْمُؤْمِنِينَ",
    "mealler": {
      "tr": "Şüphesiz göklerde ve yerde iman edenler için ayetler vardır.",
      "en": "Indeed, within the heavens and earth are signs for the believers."
    }
  },
  {
    "ref": "45:12",
    "sure": 45,
    "ayet": 12,
    "ar": "ٱللَّهُ ٱلَّذِى سَخَّرَ لَكُمُ ٱلْبَحْرَ لِتَجْرِىَ ٱلْفُلْكُ فِيهِ بِأَمْرِهِۦ وَلِتَبْتَغُوا۟ مِن فَضْلِهِۦ وَلَعَلَّكُمْ تَشْكُرُونَ",
    "mealler": {
      "tr": "İçinde emri ile gemiler akıp gitsin, O’nun lütfunu arayasınız ve şükredesiniz diye Allah denizleri sizin hizmetinize vermiştir.",
      "en": "It is Allāh who subjected to you the sea so that ships may sail upon it by His command and that you may seek of His bounty; and perhaps you will be grateful."
    }
  },
  {
    "ref": "45:15",
    "sure": 45,
    "ayet": 15,
    "ar": "مَنْ عَمِلَ صَٰلِحًا فَلِنَفْسِهِۦ وَمَنْ أَسَآءَ فَعَلَيْهَا ثُمَّ إِلَىٰ رَبِّكُمْ تُرْجَعُونَ",
    "mealler": {
      "tr": "Kim salih amel yaparsa kendisi içindir. Kim de kötülük yaparsa o da kendi aleyhinedir. Sonunda Rabbinize döndürüleceksiniz.",
      "en": "Whoever does a good deed - it is for himself; and whoever does evil - it is against it [i.e., the self or soul]. Then to your Lord you will be returned."
    }
  },
  {
    "ref": "45:20",
    "sure": 45,
    "ayet": 20,
    "ar": "هَٰذَا بَصَٰٓئِرُ لِلنَّاسِ وَهُدًى وَرَحْمَةٌ لِّقَوْمٍ يُوقِنُونَ",
    "mealler": {
      "tr": "Bu (Kur’an), insanlar için basiret ve iyice bilen bir toplum için hidayet ve rahmettir.",
      "en": "This [Qur’ān] is enlightenment for mankind and guidance and mercy for a people who are certain [in faith]."
    }
  },
  {
    "ref": "46:3",
    "sure": 46,
    "ayet": 3,
    "ar": "مَا خَلَقْنَا ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ وَمَا بَيْنَهُمَآ إِلَّا بِٱلْحَقِّ وَأَجَلٍ مُّسَمًّى وَٱلَّذِينَ كَفَرُوا۟ عَمَّآ أُنذِرُوا۟ مُعْرِضُونَ",
    "mealler": {
      "tr": "Biz; gökleri, yeri ve ikisi arasında bulunanları ancak hak ile ve belli bir süre için yarattık. Buna rağmen kâfirler yine de uyarıldıkları şeylerden yüz çevirmektedirler.",
      "en": "We did not create the heavens and earth and what is between them except in truth and [for] a specified term. But those who disbelieve, from that of which they are warned, are turning away."
    }
  },
  {
    "ref": "46:33",
    "sure": 46,
    "ayet": 33,
    "ar": "أَوَلَمْ يَرَوْا۟ أَنَّ ٱللَّهَ ٱلَّذِى خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ وَلَمْ يَعْىَ بِخَلْقِهِنَّ بِقَٰدِرٍ عَلَىٰٓ أَن يُحْـِۧىَ ٱلْمَوْتَىٰ بَلَىٰٓ إِنَّهُۥ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "mealler": {
      "tr": "Görmediler mi ki gökleri ve yeri yaratan ve bunları yaratmakla yorulmayan Allah, ölüleri diriltmeye de güç yetirir? Evet, şüphesiz O her şeye güç yetirendir.",
      "en": "Do they not see that Allāh, who created the heavens and earth and did not fail in their creation, is able to give life to the dead? Yes. Indeed, He is over all things competent."
    }
  },
  {
    "ref": "47:7",
    "sure": 47,
    "ayet": 7,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن تَنصُرُوا۟ ٱللَّهَ يَنصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ",
    "mealler": {
      "tr": "Ey İman edenler! Eğer Allah’a yardım ederseniz, O da size yardım edecek ve ayaklarınızı sabit kılacaktır.",
      "en": "O you who have believed, if you support Allāh, He will support you and plant firmly your feet."
    }
  },
  {
    "ref": "47:33",
    "sure": 47,
    "ayet": 33,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَطِيعُوا۟ ٱللَّهَ وَأَطِيعُوا۟ ٱلرَّسُولَ وَلَا تُبْطِلُوٓا۟ أَعْمَٰلَكُمْ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’a itaat edin, Peygamber'e itaat edin ve amellerinizi boşa çıkarmayın.",
      "en": "O you who have believed, obey Allāh and obey the Messenger and do not invalidate your deeds."
    }
  },
  {
    "ref": "47:36",
    "sure": 47,
    "ayet": 36,
    "ar": "إِنَّمَا ٱلْحَيَوٰةُ ٱلدُّنْيَا لَعِبٌ وَلَهْوٌ وَإِن تُؤْمِنُوا۟ وَتَتَّقُوا۟ يُؤْتِكُمْ أُجُورَكُمْ وَلَا يَسْـَٔلْكُمْ أَمْوَٰلَكُمْ",
    "mealler": {
      "tr": "Dünya hayatı ancak bir oyun ve eğlencedir. Eğer iman eder ve takvalı olursanız size mükâfatınızı verir ve sizden mallarınızı istemez.",
      "en": "[This] worldly life is only amusement and diversion. And if you believe and fear Allāh, He will give you your rewards and not ask you for your properties."
    }
  },
  {
    "ref": "48:28",
    "sure": 48,
    "ayet": 28,
    "ar": "هُوَ ٱلَّذِىٓ أَرْسَلَ رَسُولَهُۥ بِٱلْهُدَىٰ وَدِينِ ٱلْحَقِّ لِيُظْهِرَهُۥ عَلَى ٱلدِّينِ كُلِّهِۦ وَكَفَىٰ بِٱللَّهِ شَهِيدًا",
    "mealler": {
      "tr": "Bütün dinlerden üstün kılmak üzere, Peygamberini hidayet ve hak din ile gönderen O'dur. Şahit olarak Allah yeter.",
      "en": "It is He who sent His Messenger with guidance and the religion of truth to manifest it over all religion. And sufficient is Allāh as Witness."
    }
  },
  {
    "ref": "49:6",
    "sure": 49,
    "ayet": 6,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن جَآءَكُمْ فَاسِقٌۢ بِنَبَإٍ فَتَبَيَّنُوٓا۟ أَن تُصِيبُوا۟ قَوْمًۢا بِجَهَٰلَةٍ فَتُصْبِحُوا۟ عَلَىٰ مَا فَعَلْتُمْ نَٰدِمِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Eğer bir fasık size bir haber getirirse onun doğruluğunu araştırın. Yoksa bilmeden bir topluluğa kötülük edersiniz de sonra yaptığınıza pişman olursunuz.",
      "en": "O you who have believed, if there comes to you a disobedient one with information, investigate, lest you harm a people out of ignorance and become, over what you have done, regretful."
    }
  },
  {
    "ref": "49:10",
    "sure": 49,
    "ayet": 10,
    "ar": "إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا۟ بَيْنَ أَخَوَيْكُمْ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُرْحَمُونَ",
    "mealler": {
      "tr": "Müminler ancak kardeştirler. Öyleyse kardeşlerinizin arasını düzeltin ve Allah’tan sakının ki, merhamet olunasınız.",
      "en": "The believers are but brothers, so make settlement between your brothers. And fear Allāh that you may receive mercy."
    }
  },
  {
    "ref": "49:18",
    "sure": 49,
    "ayet": 18,
    "ar": "إِنَّ ٱللَّهَ يَعْلَمُ غَيْبَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَٱللَّهُ بَصِيرٌۢ بِمَا تَعْمَلُونَ",
    "mealler": {
      "tr": "Allah, şüphesiz göklerin ve yerin gaybını bilir. Allah, yapmakta olduğunuz amelleri hakkıyla görendir.",
      "en": "Indeed, Allāh knows the unseen [aspects] of the heavens and the earth. And Allāh is Seeing of what you do."
    }
  },
  {
    "ref": "50:6",
    "sure": 50,
    "ayet": 6,
    "ar": "أَفَلَمْ يَنظُرُوٓا۟ إِلَى ٱلسَّمَآءِ فَوْقَهُمْ كَيْفَ بَنَيْنَٰهَا وَزَيَّنَّٰهَا وَمَا لَهَا مِن فُرُوجٍ",
    "mealler": {
      "tr": "Üzerlerindeki göğe hiç bakmıyorlar mı? Onu nasıl bina ettik, nasıl süsledik? Onda bir çatlak da yoktur.",
      "en": "Have they not looked at the heaven above them - how We structured it and adorned it and [how] it has no rifts?"
    }
  },
  {
    "ref": "50:18",
    "sure": 50,
    "ayet": 18,
    "ar": "مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ",
    "mealler": {
      "tr": "İnsan hiçbir söz söylemez ki, yanında gözetleyen yazmaya hazır bir melek bulunmasın.",
      "en": "He [i.e., man] utters no word except that with him is an observer prepared [to record]."
    }
  },
  {
    "ref": "54:49",
    "sure": 54,
    "ayet": 49,
    "ar": "إِنَّا كُلَّ شَىْءٍ خَلَقْنَٰهُ بِقَدَرٍ",
    "mealler": {
      "tr": "Biz her şeyi bir kaderle yarattık.",
      "en": "Indeed, all things We created with predestination."
    }
  },
  {
    "ref": "55:60",
    "sure": 55,
    "ayet": 60,
    "ar": "هَلْ جَزَآءُ ٱلْإِحْسَٰنِ إِلَّا ٱلْإِحْسَٰنُ",
    "mealler": {
      "tr": "İyiliğin karşılığı iyilikten başkası olabilir mi?",
      "en": "Is the reward for good [anything] but good?"
    }
  },
  {
    "ref": "55:78",
    "sure": 55,
    "ayet": 78,
    "ar": "تَبَٰرَكَ ٱسْمُ رَبِّكَ ذِى ٱلْجَلَٰلِ وَٱلْإِكْرَامِ",
    "mealler": {
      "tr": "Azamet ve ikram sahibi Rabbinin adı ne yücedir.",
      "en": "Blessed is the name of your Lord, Owner of Majesty and Honor."
    }
  },
  {
    "ref": "56:77",
    "sure": 56,
    "ayet": 77,
    "ar": "إِنَّهُۥ لَقُرْءَانٌ كَرِيمٌ",
    "mealler": {
      "tr": "Şüphesiz bu, değerli bir Kur'an'dır.",
      "en": "Indeed, it is a noble Qur’ān."
    }
  },
  {
    "ref": "57:2",
    "sure": 57,
    "ayet": 2,
    "ar": "لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يُحْىِۦ وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "mealler": {
      "tr": "Göklerin ve yerin mülkü O’nundur. O; diriltir, öldürür. O, her şeye gücü yetendir.",
      "en": "His is the dominion of the heavens and earth. He gives life and causes death, and He is over all things competent."
    }
  },
  {
    "ref": "57:5",
    "sure": 57,
    "ayet": 5,
    "ar": "لَّهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَإِلَى ٱللَّهِ تُرْجَعُ ٱلْأُمُورُ",
    "mealler": {
      "tr": "Göklerin ve yerin mülkü O’nundur. Bütün işler Allah’a döner.",
      "en": "His is the dominion of the heavens and earth. And to Allāh are returned [all] matters."
    }
  },
  {
    "ref": "57:6",
    "sure": 57,
    "ayet": 6,
    "ar": "يُولِجُ ٱلَّيْلَ فِى ٱلنَّهَارِ وَيُولِجُ ٱلنَّهَارَ فِى ٱلَّيْلِ وَهُوَ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    "mealler": {
      "tr": "Geceyi gündüze katar, gündüzü de geceye katar. O, kalplerde olan her şeyi bilir.",
      "en": "He causes the night to enter the day and causes the day to enter the night, and He is Knowing of that within the breasts."
    }
  },
  {
    "ref": "57:9",
    "sure": 57,
    "ayet": 9,
    "ar": "هُوَ ٱلَّذِى يُنَزِّلُ عَلَىٰ عَبْدِهِۦٓ ءَايَٰتٍۭ بَيِّنَٰتٍ لِّيُخْرِجَكُم مِّنَ ٱلظُّلُمَٰتِ إِلَى ٱلنُّورِ وَإِنَّ ٱللَّهَ بِكُمْ لَرَءُوفٌ رَّحِيمٌ",
    "mealler": {
      "tr": "Sizi karanlıklardan aydınlığa çıkarmak için kuluna apaçık ayetler indiren O’dur. Şüphesiz Allah, size karşı çok şefkatli, çok merhametlidir.",
      "en": "It is He who sends down upon His Servant [Muḥammad (ﷺ)] verses of clear evidence that He may bring you out from darknesses into the light. And indeed, Allāh is to you Kind and Merciful."
    }
  },
  {
    "ref": "57:18",
    "sure": 57,
    "ayet": 18,
    "ar": "إِنَّ ٱلْمُصَّدِّقِينَ وَٱلْمُصَّدِّقَٰتِ وَأَقْرَضُوا۟ ٱللَّهَ قَرْضًا حَسَنًا يُضَٰعَفُ لَهُمْ وَلَهُمْ أَجْرٌ كَرِيمٌ",
    "mealler": {
      "tr": "Şüphesiz ki sadaka veren erkeklerle sadaka veren kadınlar ve Allah’a güzel bir borç verenler var ya, (verdikleri) onlara kat kat ödenir. Ayrıca onlara çok değerli bir mükâfat da vardır.",
      "en": "Indeed, the men who practice charity and the women who practice charity and [they who] have loaned Allāh a goodly loan - it will be multiplied for them, and they will have a noble reward."
    }
  },
  {
    "ref": "58:21",
    "sure": 58,
    "ayet": 21,
    "ar": "كَتَبَ ٱللَّهُ لَأَغْلِبَنَّ أَنَا۠ وَرُسُلِىٓ إِنَّ ٱللَّهَ قَوِىٌّ عَزِيزٌ",
    "mealler": {
      "tr": "Allah: “Andolsun ki ben ve rasullerim mutlaka galip geleceğim” diye yazmıştır. Şüphesiz Allah; çok kuvvetlidir, çok güçlüdür.",
      "en": "Allāh has written [i.e., decreed], \"I will surely overcome, I and My messengers.\" Indeed, Allāh is Powerful and Exalted in Might."
    }
  },
  {
    "ref": "59:18",
    "sure": 59,
    "ayet": 18,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ وَٱتَّقُوا۟ ٱللَّهَ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا تَعْمَلُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah'tan korkup sakının. Herkes yarın için neyi takdim edip gönderdiğine baksın. Allah’tan sakının. Çünkü Allah, tüm yaptıklarınızdan haberdardır.",
      "en": "O you who have believed, fear Allāh. And let every soul look to what it has put forth for tomorrow - and fear Allāh. Indeed, Allāh is Aware of what you do."
    }
  },
  {
    "ref": "59:20",
    "sure": 59,
    "ayet": 20,
    "ar": "لَا يَسْتَوِىٓ أَصْحَٰبُ ٱلنَّارِ وَأَصْحَٰبُ ٱلْجَنَّةِ أَصْحَٰبُ ٱلْجَنَّةِ هُمُ ٱلْفَآئِزُونَ",
    "mealler": {
      "tr": "Cehennem ehli ile Cennet ehli bir değildir. Cennet ehli; onlar, kurtulacak olanlardır.",
      "en": "Not equal are the companions of the Fire and the companions of Paradise. The companions of Paradise - they are the attainers [of success]."
    }
  },
  {
    "ref": "59:21",
    "sure": 59,
    "ayet": 21,
    "ar": "لَوْ أَنزَلْنَا هَٰذَا ٱلْقُرْءَانَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُۥ خَٰشِعًا مُّتَصَدِّعًا مِّنْ خَشْيَةِ ٱللَّهِ وَتِلْكَ ٱلْأَمْثَٰلُ نَضْرِبُهَا لِلنَّاسِ لَعَلَّهُمْ يَتَفَكَّرُونَ",
    "mealler": {
      "tr": "Biz bu Kur’an’ı bir dağın üzerine indirseydik, onun Allah korkusundan baş eğerek parça parça olduğunu görürdün. İşte biz, bu örnekleri insanlar düşünsünler diye veriyoruz.",
      "en": "If We had sent down this Qur’ān upon a mountain, you would have seen it humbled and splitting from fear of Allāh. And these examples We present to the people that perhaps they will give thought."
    }
  },
  {
    "ref": "61:2",
    "sure": 61,
    "ayet": 2,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Yapmayacağınız şeyi ne diye söylersiniz?",
      "en": "O you who have believed, why do you say what you do not do?"
    }
  },
  {
    "ref": "61:3",
    "sure": 61,
    "ayet": 3,
    "ar": "كَبُرَ مَقْتًا عِندَ ٱللَّهِ أَن تَقُولُوا۟ مَا لَا تَفْعَلُونَ",
    "mealler": {
      "tr": "Yapmayacağınız şeyleri söylemeniz, Allah katında büyük gazap gerektiren bir iştir.",
      "en": "Greatly hateful in the sight of Allāh is that you say what you do not do."
    }
  },
  {
    "ref": "63:9",
    "sure": 63,
    "ayet": 9,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُلْهِكُمْ أَمْوَٰلُكُمْ وَلَآ أَوْلَٰدُكُمْ عَن ذِكْرِ ٱللَّهِ وَمَن يَفْعَلْ ذَٰلِكَ فَأُو۟لَٰٓئِكَ هُمُ ٱلْخَٰسِرُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Mallarınız ve çocuklarınız sizi Allah’ın zikrinden alıkoymasın. Kim bunu yaparsa, işte onlar hüsrana uğrayacaklardır.",
      "en": "O you who have believed, let not your wealth and your children divert you from the remembrance of Allāh. And whoever does that - then those are the losers."
    }
  },
  {
    "ref": "64:2",
    "sure": 64,
    "ayet": 2,
    "ar": "هُوَ ٱلَّذِى خَلَقَكُمْ فَمِنكُمْ كَافِرٌ وَمِنكُم مُّؤْمِنٌ وَٱللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
    "mealler": {
      "tr": "Sizi yaratan O’dur. Sizden bir kısmınız kâfir, bir kısmınız Mümindir. Allah, tüm yaptıklarınızı görendir.",
      "en": "It is He who created you, and among you is the disbeliever, and among you is the believer. And Allāh, of what you do, is Seeing."
    }
  },
  {
    "ref": "64:4",
    "sure": 64,
    "ayet": 4,
    "ar": "يَعْلَمُ مَا فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَيَعْلَمُ مَا تُسِرُّونَ وَمَا تُعْلِنُونَ وَٱللَّهُ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    "mealler": {
      "tr": "Göklerde ve yerde olanları bilir. Gizlediklerinizi ve açığa vurduklarınızı da bilir. Allah kalplerde olanı hakkıyla bilendir.",
      "en": "He knows what is within the heavens and earth and knows what you conceal and what you declare. And Allāh is Knowing of that within the breasts."
    }
  },
  {
    "ref": "64:11",
    "sure": 64,
    "ayet": 11,
    "ar": "مَآ أَصَابَ مِن مُّصِيبَةٍ إِلَّا بِإِذْنِ ٱللَّهِ وَمَن يُؤْمِنۢ بِٱللَّهِ يَهْدِ قَلْبَهُۥ وَٱللَّهُ بِكُلِّ شَىْءٍ عَلِيمٌ",
    "mealler": {
      "tr": "Hiçbir musibet, Allah’ın izni olmadıkça isabet etmez. Kim, Allah’a iman ederse Allah onun kalbine hidayet verir. Allah, her şeyi bilir.",
      "en": "No disaster strikes except by permission of Allāh. And whoever believes in Allāh - He will guide his heart. And Allāh is Knowing of all things."
    }
  },
  {
    "ref": "64:13",
    "sure": 64,
    "ayet": 13,
    "ar": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ",
    "mealler": {
      "tr": "Allah, O’ndan başka (hak) bir ilah yoktur. O halde Müminler yalnız Allah’a tevekkül etsinler.",
      "en": "Allāh - there is no deity except Him. And upon Allāh let the believers rely."
    }
  },
  {
    "ref": "64:15",
    "sure": 64,
    "ayet": 15,
    "ar": "إِنَّمَآ أَمْوَٰلُكُمْ وَأَوْلَٰدُكُمْ فِتْنَةٌ وَٱللَّهُ عِندَهُۥٓ أَجْرٌ عَظِيمٌ",
    "mealler": {
      "tr": "Mallarınız da, evlatlarınız da sizin için ancak bir imtihandır. Allah katında ise büyük ecir vardır.",
      "en": "Your wealth and your children are but a trial, and Allāh has with Him a great reward."
    }
  },
  {
    "ref": "64:18",
    "sure": 64,
    "ayet": 18,
    "ar": "عَٰلِمُ ٱلْغَيْبِ وَٱلشَّهَٰدَةِ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    "mealler": {
      "tr": "Gizliyi de, açığı da bilendir, Azîzdir, Hakîmdir.",
      "en": "Knower of the unseen and the witnessed, the Exalted in Might, the Wise."
    }
  },
  {
    "ref": "67:12",
    "sure": 67,
    "ayet": 12,
    "ar": "إِنَّ ٱلَّذِينَ يَخْشَوْنَ رَبَّهُم بِٱلْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ",
    "mealler": {
      "tr": "Görmediği halde Rablerinden korkup çekinen kimseler için de elbette bir bağışlanma ve büyük bir ödül vardır.",
      "en": "Indeed, those who fear their Lord unseen will have forgiveness and great reward."
    }
  },
  {
    "ref": "67:19",
    "sure": 67,
    "ayet": 19,
    "ar": "أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ صَٰٓفَّٰتٍ وَيَقْبِضْنَ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَٰنُ إِنَّهُۥ بِكُلِّ شَىْءٍۭ بَصِيرٌ",
    "mealler": {
      "tr": "Üstlerinde kanatlarını açarak ve kapayarak uçan kuşları görmediler mi? Onları Rahman'dan başkası tutmuyor. Doğrusu O, her şeyi görendir.",
      "en": "Do they not see the birds above them with wings outspread and [sometimes] folded in? None holds them [aloft] except the Most Merciful. Indeed He is, of all things, Seeing."
    }
  },
  {
    "ref": "68:34",
    "sure": 68,
    "ayet": 34,
    "ar": "إِنَّ لِلْمُتَّقِينَ عِندَ رَبِّهِمْ جَنَّٰتِ ٱلنَّعِيمِ",
    "mealler": {
      "tr": "Şüphesiz Allah’a karşı gelmekten sakınanlar için Rableri katında Naîm Cennetleri vardır.",
      "en": "Indeed, for the righteous with their Lord are the Gardens of Pleasure."
    }
  },
  {
    "ref": "73:19",
    "sure": 73,
    "ayet": 19,
    "ar": "إِنَّ هَٰذِهِۦ تَذْكِرَةٌ فَمَن شَآءَ ٱتَّخَذَ إِلَىٰ رَبِّهِۦ سَبِيلًا",
    "mealler": {
      "tr": "Şüphesiz bunlar bir öğüttür. Kim dilerse Rabbine ulaştıran bir yol tutar.",
      "en": "Indeed, this is a reminder, so whoever wills may take to his Lord a way."
    }
  },
  {
    "ref": "75:40",
    "sure": 75,
    "ayet": 40,
    "ar": "أَلَيْسَ ذَٰلِكَ بِقَٰدِرٍ عَلَىٰٓ أَن يُحْـِۧىَ ٱلْمَوْتَىٰ",
    "mealler": {
      "tr": "Bunu yapanın ölüleri diriltmeye gücü yetmez mi?",
      "en": "Is not that [Creator] Able to give life to the dead?"
    }
  },
  {
    "ref": "76:3",
    "sure": 76,
    "ayet": 3,
    "ar": "إِنَّا هَدَيْنَٰهُ ٱلسَّبِيلَ إِمَّا شَاكِرًا وَإِمَّا كَفُورًا",
    "mealler": {
      "tr": "Biz ona yolu gösterdik. İster şükreder, ister kâfir olur.",
      "en": "Indeed, We guided him to the way, be he grateful or be he ungrateful."
    }
  },
  {
    "ref": "78:6",
    "sure": 78,
    "ayet": 6,
    "ar": "أَلَمْ نَجْعَلِ ٱلْأَرْضَ مِهَٰدًا",
    "mealler": {
      "tr": "Yeri bir döşek kılmadık mı?",
      "en": "Have We not made the earth a resting place?"
    }
  },
  {
    "ref": "85:11",
    "sure": 85,
    "ayet": 11,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ لَهُمْ جَنَّٰتٌ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَٰرُ ذَٰلِكَ ٱلْفَوْزُ ٱلْكَبِيرُ",
    "mealler": {
      "tr": "İman edip salih ameller işleyenlere gelince; onlara içinden ırmaklar akan Cennetler vardır. İşte bu büyük başarıdır.",
      "en": "Indeed, those who have believed and done righteous deeds will have gardens beneath which rivers flow. That is the great attainment."
    }
  },
  {
    "ref": "85:13",
    "sure": 85,
    "ayet": 13,
    "ar": "إِنَّهُۥ هُوَ يُبْدِئُ وَيُعِيدُ",
    "mealler": {
      "tr": "İlkin var eden, sonra yeniden dirilten O'dur.",
      "en": "Indeed, it is He who originates [creation] and repeats."
    }
  },
  {
    "ref": "86:4",
    "sure": 86,
    "ayet": 4,
    "ar": "إِن كُلُّ نَفْسٍ لَّمَّا عَلَيْهَا حَافِظٌ",
    "mealler": {
      "tr": "Üzerinde gözetleyici/koruyucu bulunmayan hiç bir nefis (kimse) yoktur.",
      "en": "There is no soul but that it has over it a protector."
    }
  },
  {
    "ref": "89:14",
    "sure": 89,
    "ayet": 14,
    "ar": "إِنَّ رَبَّكَ لَبِٱلْمِرْصَادِ",
    "mealler": {
      "tr": "Muhakkak Rabbin gözetlemededir.",
      "en": "Indeed, your Lord is in observation."
    }
  },
  {
    "ref": "90:8",
    "sure": 90,
    "ayet": 8,
    "ar": "أَلَمْ نَجْعَل لَّهُۥ عَيْنَيْنِ",
    "mealler": {
      "tr": "Biz, ona iki göz vermedik mi?",
      "en": "Have We not made for him two eyes?"
    }
  },
  {
    "ref": "92:4",
    "sure": 92,
    "ayet": 4,
    "ar": "إِنَّ سَعْيَكُمْ لَشَتَّىٰ",
    "mealler": {
      "tr": "Şüphesiz sizin çabalarınız elbette çeşit çeşittir.",
      "en": "Indeed, your efforts are diverse."
    }
  },
  {
    "ref": "94:5",
    "sure": 94,
    "ayet": 5,
    "ar": "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    "mealler": {
      "tr": "Şüphesiz her zorlukla beraber bir kolaylık vardır.",
      "en": "For indeed, with hardship [will be] ease [i.e., relief]."
    }
  },
  {
    "ref": "94:6",
    "sure": 94,
    "ayet": 6,
    "ar": "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    "mealler": {
      "tr": "Gerçekten güçlükle beraber bir kolaylık vardır.",
      "en": "Indeed, with hardship [will be] ease."
    }
  },
  {
    "ref": "95:8",
    "sure": 95,
    "ayet": 8,
    "ar": "أَلَيْسَ ٱللَّهُ بِأَحْكَمِ ٱلْحَٰكِمِينَ",
    "mealler": {
      "tr": "Allah, hükmedenlerin en iyi hükmedeni değil midir?",
      "en": "Is not Allāh the most just of judges?"
    }
  },
  {
    "ref": "96:8",
    "sure": 96,
    "ayet": 8,
    "ar": "إِنَّ إِلَىٰ رَبِّكَ ٱلرُّجْعَىٰٓ",
    "mealler": {
      "tr": "Şüphesiz dönüş yalnızca Rabbine olacaktır.",
      "en": "Indeed, to your Lord is the return."
    }
  },
  {
    "ref": "97:3",
    "sure": 97,
    "ayet": 3,
    "ar": "لَيْلَةُ ٱلْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
    "mealler": {
      "tr": "Kadir Gecesi bin aydan daha hayırlıdır.",
      "en": "The Night of Decree is better than a thousand months."
    }
  },
  {
    "ref": "98:7",
    "sure": 98,
    "ayet": 7,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ أُو۟لَٰٓئِكَ هُمْ خَيْرُ ٱلْبَرِيَّةِ",
    "mealler": {
      "tr": "Şüphesiz, iman edip salih ameller işleyenler var ya; işte onlar yaratıkların en hayırlısıdırlar.",
      "en": "Indeed, they who have believed and done righteous deeds - those are the best of creatures."
    }
  }
];
