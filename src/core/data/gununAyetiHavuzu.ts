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
  /**
   * QuranEnc mealleri, birebir. Türkçe ve İngilizce her kayıtta var; diğer diller yalnız
   * meal sığıyor ve dipnot işareti taşımıyorsa (o dilin havuzu meali olan kayıtlardır).
   */
  mealler: { readonly tr: string; readonly en: string } & Readonly<Partial<Record<MealDili, string>>>;
}

export type MealDili = 'tr' | 'en' | 'id' | 'de' | 'fr' | 'bs' | 'ru' | 'ms';

export interface MealKunyesi {
  anahtar: string;
  surum: string;
  /** QuranEnc başlığı (yayımcı son " - " sonrası). */
  baslik: string;
}

export const GUNUN_AYETI_KAYNAKLARI: {
  readonly ar: { ad: 'Tanzil'; surum: string; url: 'https://tanzil.net' };
  readonly mealler: Readonly<Record<MealDili, MealKunyesi>>;
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
    },
    "id": {
      "anahtar": "indonesian_affairs",
      "surum": "1.0.1",
      "baslik": "Ministry of Religious Affairs"
    },
    "de": {
      "anahtar": "german_bubenheim",
      "surum": "1.1.4",
      "baslik": "Frank Bubenheim"
    },
    "fr": {
      "anahtar": "french_rashid",
      "surum": "1.0.3",
      "baslik": "Rachid Maach"
    },
    "bs": {
      "anahtar": "bosnian_rwwad",
      "surum": "2.0.4",
      "baslik": "Rowwad Translation Centre"
    },
    "ru": {
      "anahtar": "russian_rwwad",
      "surum": "1.0.1",
      "baslik": "Rowwad Translation Center"
    },
    "ms": {
      "anahtar": "malay_basumayyah",
      "surum": "1.0.0",
      "baslik": "Abdullah Basumayyah"
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
      "en": "It is You we worship and You we ask for help.",
      "id": "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.",
      "de": "Dir allein dienen wir, und zu Dir allein flehen wir um Hilfe.",
      "fr": "C’est Toi seul que nous adorons et de Toi seul que nous implorons aide.",
      "bs": "Samo Tebe obožavamo i samo od Tebe pomoć tražimo!",
      "ru": "Тебе одному мы поклоняемся, и Тебя одного просим о помощи.",
      "ms": "Engkaulah sahaja (Ya Allah) Yang Kami sembah, dan kepada Engkaulah sahaja kami memohon pertolongan."
    }
  },
  {
    "ref": "2:107",
    "sure": 2,
    "ayet": 107,
    "ar": "أَلَمْ تَعْلَمْ أَنَّ ٱللَّهَ لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَمَا لَكُم مِّن دُونِ ٱللَّهِ مِن وَلِىٍّ وَلَا نَصِيرٍ",
    "mealler": {
      "tr": "Bilmez misin ki, göklerin ve yerin hükümranlığı Allah’ındır. Sizin için Allah’tan başka ne bir dost, ne de bir yardımcı vardır.",
      "en": "Do you not know that to Allāh belongs the dominion of the heavens and the earth and [that] you have not besides Allāh any protector or any helper?",
      "id": "Tidakkah kamu tahu bahwa Allah memiliki kerajaan langit dan bumi? Dan tidak ada bagimu pelindung dan penolong selain Allah.",
      "de": "Weißt du denn nicht, daß Allah es ist, Der die Herrschaft über die Himmel und die Erde hat, und daß ihr außer Allah weder Schutzherrn noch Helfer habt?",
      "fr": "Ne sais-tu pas qu’Allah règne en Maître absolu sur les cieux et la terre ? Vous n’avez d’autre soutien et d’autre protecteur qu’Allah.",
      "bs": "Zar ti ne znaš da Allahu pripada vlast i na nebesima i na Zemlji i da, osim Allaha, ni zaštitnika ni pomagača nemate?!"
    }
  },
  {
    "ref": "2:153",
    "sure": 2,
    "ayet": 153,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Sabrederek ve namaz kılarak Allah'tan yardım dileyin! Şüphesiz ki Allah, sabredenlerle beraberdir.",
      "en": "O you who have believed, seek help through patience and prayer. Indeed, Allāh is with the patient.",
      "id": "Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Sungguh, Allah beserta orang-orang yang sabar.",
      "de": "O die ihr glaubt, sucht Hilfe in der Standhaftigkeit und im Gebet! Allah ist mit den Standhaften.",
      "fr": "Vous qui croyez ! Armez-vous de patience et aidez-vous de la prière. Allah est avec ceux qui font preuve de constance.",
      "bs": "O vi koji vjerujete, tražite sebi pomoć u strpljivosti i namazu! Allah je, doista, uz strpljive.",
      "ru": "О вы, которые уверовали! Ищите помощи посредством терпения и молитвы. Воистину, Аллах — с терпеливыми."
    }
  },
  {
    "ref": "2:168",
    "sure": 2,
    "ayet": 168,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ كُلُوا۟ مِمَّا فِى ٱلْأَرْضِ حَلَٰلًا طَيِّبًا وَلَا تَتَّبِعُوا۟ خُطُوَٰتِ ٱلشَّيْطَٰنِ إِنَّهُۥ لَكُمْ عَدُوٌّ مُّبِينٌ",
    "mealler": {
      "tr": "Ey insanlar! Yeryüzündeki temiz ve helal şeylerden yiyin. Şeytan'ın adımlarına uymayın! Zira o sizin için apaçık bir düşmandır.",
      "en": "O mankind, eat from whatever is on earth [that is] lawful and good and do not follow the footsteps of Satan. Indeed, he is to you a clear enemy.",
      "id": "Wahai manusia! Makanlah dari (makanan) yang halal dan baik yang terdapat di bumi, dan janganlah kamu mengikuti langkah-langkah setan. Sungguh, setan itu musuh yang nyata bagimu.",
      "de": "O ihr Menschen! Eßt von dem, was es auf der Erde gibt, als etwas Erlaubtem und Gutem, und folgt nicht den Fußstapfen des Satans! Er ist euch ein deutlicher Feind.",
      "bs": "O ljudi, jedite od onoga što ima na Zemlji, što je dozvoljeno i lijepo, i ne slijedite šejtanove stope! On vam je, zaista, neprijatelj očevidni.",
      "ru": "О люди! Ешьте из того, что на земле, дозволенное и благое, и не следуйте по стопам шайтана. Воистину, он для вас — явный враг.",
      "ms": "Wahai sekalian manusia! Makanlah dari apa yang ada di bumi yang halal lagi baik, dan janganlah kamu ikut jejak langkah Syaitan; kerana sesungguhnya Syaitan itu ialah musuh yang terang nyata bagi kamu."
    }
  },
  {
    "ref": "2:172",
    "sure": 2,
    "ayet": 172,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُلُوا۟ مِن طَيِّبَٰتِ مَا رَزَقْنَٰكُمْ وَٱشْكُرُوا۟ لِلَّهِ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Size verdiğimiz rızıkların temiz olanlarından yiyin ve eğer sadece Allah'a ibadet ediyorsanız, O'na şükredin.",
      "en": "O you who have believed, eat from the good [i.e., lawful] things which We have provided for you and be grateful to Allāh if it is [indeed] Him that you worship.",
      "id": "Wahai orang-orang yang beriman! Makanlah dari rezeki yang baik yang Kami berikan kepada kamu dan bersyukurlah kepada Allah, jika kamu hanya menyembah kepada-Nya.",
      "de": "O die ihr glaubt, eßt von den guten Dingen, mit denen Wir euch versorgt haben, und seid Allah dankbar, wenn ihr Ihm (allein) dient!",
      "fr": "Vous qui croyez ! Nourrissez-vous des aliments purs et sains que Nous vous avons attribués et montrez-vous reconnaissants envers Allah, si c’est Lui que vous adorez.",
      "bs": "O vi koji vjerujete, jedite dobra kojim smo vas opskrbili i Allahu zahvaljujte, ako, doista, samo Njemu ibadet činite.",
      "ru": "О вы, которые уверовали! Ешьте из благих даров, которыми Мы наделили вас, и благодарите Аллаха, если вы поклоняетесь только Ему.",
      "ms": "Wahai orang-orang yang beriman! Makanlah dari benda-benda yang baik (yang halal) yang telah Kami berikan kepada kamu, dan bersyukurlah kepada Allah, jika betul kamu hanya beribadat kepadanya."
    }
  },
  {
    "ref": "2:208",
    "sure": 2,
    "ayet": 208,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱدْخُلُوا۟ فِى ٱلسِّلْمِ كَآفَّةً وَلَا تَتَّبِعُوا۟ خُطُوَٰتِ ٱلشَّيْطَٰنِ إِنَّهُۥ لَكُمْ عَدُوٌّ مُّبِينٌ",
    "mealler": {
      "tr": "Ey iman edenler! Hep birden İslam dinine tümüyle eksiksiz girin, Şeytan'ın adımlarına uymayın! O sizin apaçık düşmanınızdır.",
      "en": "O you who have believed, enter into Islām completely [and perfectly] and do not follow the footsteps of Satan. Indeed, he is to you a clear enemy.",
      "id": "Wahai orang-orang yang beriman! Masuklah ke dalam Islam secara keseluruhan, dan janganlah kamu ikuti langkah-langkah setan. Sungguh, ia musuh yang nyata bagimu.",
      "de": "O die ihr glaubt, tretet allesamt in den Islam ein und folgt nicht den Fußstapfen des Satans! Er ist euch ja ein deutlicher Feind.",
      "fr": "Vous qui croyez ! Adhérez pleinement à l’islam. Gardez-vous de suivre les suggestions de Satan, votre ennemi déclaré.",
      "bs": "O vi koji vjerujete, uđite u islam potpuno i ne idite stopama šejtanovim; on vam je, doista, neprijatelj otvoreni!",
      "ru": "О вы, которые уверовали! Войдите в покорность (ислам) всецело и не следуйте по стопам шайтана. Воистину, он для вас — явный враг."
    }
  },
  {
    "ref": "2:263",
    "sure": 2,
    "ayet": 263,
    "ar": "قَوْلٌ مَّعْرُوفٌ وَمَغْفِرَةٌ خَيْرٌ مِّن صَدَقَةٍ يَتْبَعُهَآ أَذًى وَٱللَّهُ غَنِىٌّ حَلِيمٌ",
    "mealler": {
      "tr": "Güzel söz ve bağışlama, arkasından incitme gelen sadakadan daha iyidir. Allah çok zengindir, Halim'dir.",
      "en": "Kind speech and forgiveness are better than charity followed by injury. And Allāh is Free of need and Forbearing.",
      "de": "Freundliche Worte und Vergebung sind besser als ein Almosen, dem Beleidigungen nachfolgen. Allah ist Unbedürftig und Nachsichtig.",
      "bs": "Lijepa riječ i oprost vredniji su od sadake popraćene vrijeđanjem. A Allah je neovisan i Onaj Koji ne žuri s kaznom.",
      "ru": "Доброе слово и прощение лучше пожертвования, сопровождаемого причинением обиды. Аллах — богатый, сдержанный."
    }
  },
  {
    "ref": "2:268",
    "sure": 2,
    "ayet": 268,
    "ar": "ٱلشَّيْطَٰنُ يَعِدُكُمُ ٱلْفَقْرَ وَيَأْمُرُكُم بِٱلْفَحْشَآءِ وَٱللَّهُ يَعِدُكُم مَّغْفِرَةً مِّنْهُ وَفَضْلًا وَٱللَّهُ وَٰسِعٌ عَلِيمٌ",
    "mealler": {
      "tr": "Şeytan sizi fakirlikle korkutur ve size cimriliği telkin eder. Allah ise, size mağfiretini ve bolluk vadediyor. Allah her şeyi kuşatandır ve her şeyi bilendir.",
      "en": "Satan threatens you with poverty and orders you to immorality, while Allāh promises you forgiveness from Him and bounty. And Allāh is all-Encompassing and Knowing.",
      "id": "Setan menjanjikan (menakut-nakuti) kemiskinan kepadamu dan menyuruh kamu berbuat keji (kikir), sedangkan Allah menjanjikan ampunan dan karunia-Nya kepadamu. Dan Allah Mahaluas, Maha Mengetahui.",
      "de": "Der Satan verspricht euch Armut und befiehlt euch Schändliches. Allah aber verspricht euch Vergebung von Sich aus und Huld. Allah ist Allumfassend und Allwissend.",
      "bs": "Šejtan vas plaši siromaštvom i navodi vas na zlo, a Allah vam obećava oprost i dobro. Allah je neizmjerno darežljiv i Onaj Koji sve zna.",
      "ru": "Шайтан устрашает вас бедностью и повелевает вам мерзость, а Аллах обещает вам прощение и Свою щедрость. Аллах — объемлющий, знающий."
    }
  },
  {
    "ref": "2:277",
    "sure": 2,
    "ayet": 277,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَأَقَامُوا۟ ٱلصَّلَوٰةَ وَءَاتَوُا۟ ٱلزَّكَوٰةَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
    "mealler": {
      "tr": "Şüphesiz iman edenler, salih amel işleyenler, namazı dosdoğru kılanlar ve zekâtı verenler için Rableri katında mükâfatları vardır. Onlara korku yoktur. Onlar, mahzun da olmayacaklardır.",
      "en": "Indeed, those who believe and do righteous deeds and establish prayer and give zakāh will have their reward with their Lord, and there will be no fear concerning them, nor will they grieve.",
      "bs": "Doista će oni koji vjeruju, i dobra djela čine, i namaz obavljaju, i zekat daju, imati nagradu u Gospodara svoga. Za njih nema straha i oni ne treba da se žaloste!",
      "ru": "Воистину, те, которые уверовали, совершали праведные деяния, выстаивали молитву и выплачивали закят, — для них их награда у их Господа, и не будет над ними страха, и они не опечалятся."
    }
  },
  {
    "ref": "3:5",
    "sure": 3,
    "ayet": 5,
    "ar": "إِنَّ ٱللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَىْءٌ فِى ٱلْأَرْضِ وَلَا فِى ٱلسَّمَآءِ",
    "mealler": {
      "tr": "Allah’a yer ve gökte olanlardan hiçbir şey gizli kalmaz.",
      "en": "Indeed, from Allāh nothing is hidden in the earth nor in the heaven.",
      "id": "Bagi Allah tidak ada sesuatu pun yang tersembunyi di bumi dan di langit.",
      "de": "Vor Allah ist nichts verborgen, weder auf der Erde noch im Himmel.",
      "fr": "Rien, sur terre ou dans le ciel, n’échappe à Allah.",
      "bs": "Allahu, doista, ništa nije skriveno, ni na Zemlji, ni na nebu.",
      "ru": "Воистину, Аллах — не скроется от Него ничто на земле, ни на небе.",
      "ms": "Sesungguhnya Allah tidak tersembunyi kepadaNya sesuatu pun yang ada di bumi dan juga yang ada di langit."
    }
  },
  {
    "ref": "3:6",
    "sure": 3,
    "ayet": 6,
    "ar": "هُوَ ٱلَّذِى يُصَوِّرُكُمْ فِى ٱلْأَرْحَامِ كَيْفَ يَشَآءُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    "mealler": {
      "tr": "Ana rahminde size dilediği gibi şekil veren O’dur. Kendinden başka (ibadete layık hak) ilah olmayan, Aziz ve Hakim olan O’dur.",
      "en": "It is He who forms you in the wombs however He wills. There is no deity except Him, the Exalted in Might, the Wise.",
      "id": "Dialah yang membentuk kamu dalam rahim menurut yang Dia kehendaki. Tidak ada tuhan selain Dia. Yang Mahaperkasa, Mahabijaksana.",
      "de": "Er ist es, Der euch im Mutterleib gestaltet, wie Er will. Es gibt keinen Gott außer Ihm, dem Allmächtigen und Allweisen.",
      "fr": "C’est Lui qui vous forme à Son gré dans les matrices de vos mères. Il n’est de divinité en droit d’être adorée que Lui, le Tout-Puissant, l’infiniment Sage.",
      "bs": "On je Onaj Koji vas oblikuje u matericama kako On hoće; nema drugog boga osim Njega, Silnog i Mudrog.",
      "ru": "Он — Тот, Кто придаёт вам облик в утробах, как пожелает. Нет божества, кроме Него, Он — Могущественный, Мудрый.",
      "ms": "Dia lah yang membentuk rupa kamu dalam rahim (ibu kamu) sebagaimana yang dikehendakiNya. Tiada Tuhan (yang berhak disembah) melainkan Dia, Yang Maha Kuasa, lagi Maha Bijaksana."
    }
  },
  {
    "ref": "3:96",
    "sure": 3,
    "ayet": 96,
    "ar": "إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِى بِبَكَّةَ مُبَارَكًا وَهُدًى لِّلْعَٰلَمِينَ",
    "mealler": {
      "tr": "İnsanlar için (mabed olarak) kurulan ilk ev şüphesiz Mekke'deki mübarek ve âlemlere hidayet kaynağı olan (Kâbe) dir.",
      "en": "Indeed, the first House [of worship] established for mankind was that at Bakkah [i.e., Makkah] - blessed and a guidance for the worlds.",
      "de": "Das erste (Gottes)haus, das für die Menschen gegründet wurde, ist wahrlich dasjenige in Bakka, als ein gesegnetes (Haus) und eine Rechtleitung für die Weltenbewohner.",
      "ru": "Воистину, первый Дом, который был возведён для людей, — тот, что в Бекке, как благословение и руководство для миров.",
      "ms": "Sesungguhnya Rumah Ibadat yang mula-mula dibina untuk manusia (beribadat kepada Tuhannya) ialah Baitullah yang di Makkah yang berkat dan (dijadikan) petunjuk hidayah bagi umat manusia."
    }
  },
  {
    "ref": "3:102",
    "sure": 3,
    "ayet": 102,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ حَقَّ تُقَاتِهِۦ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’tan gerektiği gibi sakının ve yalnızca Müslümanlar olarak can verin.",
      "en": "O you who have believed, fear Allāh as He should be feared and do not die except as Muslims [in submission to Him].",
      "id": "Wahai orang-orang yang beriman! Bertakwalah kepada Allah sebenar-benar takwa kepada-Nya dan janganlah kamu mati kecuali dalam keadaan Muslim.",
      "de": "O die ihr glaubt, fürchtet Allah in gebührender Furcht und sterbt ja nicht anders denn als (Allah) Ergebene!",
      "fr": "Vous qui croyez ! Craignez Allah comme Il le mérite et demeurez-Lui entièrement soumis jusqu’à la mort.",
      "bs": "O vi koji vjerujete, bojte se Allaha istinskom bogobojaznošću i nipošto ne umirite osim kao muslimani!",
      "ru": "О вы, которые уверовали! Бойтесь Аллаха должным образом и не умирайте иначе как будучи мусульманами.",
      "ms": "Wahai orang-orang yang beriman! Bertaqwalah kamu kepada Allah dengan sebenar-benar taqwa, dan jangan sekali-kali kamu mati melainkan dalam keadaan Islam."
    }
  },
  {
    "ref": "3:109",
    "sure": 3,
    "ayet": 109,
    "ar": "وَلِلَّهِ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ وَإِلَى ٱللَّهِ تُرْجَعُ ٱلْأُمُورُ",
    "mealler": {
      "tr": "Göklerde ve yerde ne varsa Allah’ındır. Bütün işler ancak Allah’a döndürülür.",
      "en": "To Allāh belongs whatever is in the heavens and whatever is on the earth. And to Allāh will [all] matters be returned.",
      "id": "Dan milik Allahlah apa yang ada di langit dan apa yang ada di bumi, dan hanya kepada Allah segala urusan dikembalikan.",
      "de": "Allah gehört (alles), was in den Himmeln und was auf der Erde ist, und zu Allah werden (all) die Angelegenheiten zurückgebracht.",
      "fr": "A Allah appartient tout ce qui se trouve dans les cieux et sur la terre. Et c’est à Allah que tout doit revenir.",
      "bs": "Allahu pripada sve što je na nebesima i što je na Zemlji, i Allahu se sve vraća.",
      "ru": "Аллаху принадлежит всё, что в небесах, и всё, что на земле, и к Аллаху возвращаются дела.",
      "ms": "Dan bagi Allah jualah hak milik segala yang ada di langit dan yang ada di bumi, dan kepada Allah jualah dikembalikan segala urusan."
    }
  },
  {
    "ref": "3:138",
    "sure": 3,
    "ayet": 138,
    "ar": "هَٰذَا بَيَانٌ لِّلنَّاسِ وَهُدًى وَمَوْعِظَةٌ لِّلْمُتَّقِينَ",
    "mealler": {
      "tr": "Bu (Kur’an), insanlar için bir açıklama, Takvâ sahipleri için bir hidayet ve öğüttür.",
      "en": "This [Qur’ān] is a clear statement to [all] the people and a guidance and instruction for those conscious of Allāh.",
      "id": "Inilah (Al-Qur`an) suatu keterangan yang jelas untuk semua manusia, dan menjadi petunjuk serta pelajaran bagi orang-orang yang bertakwa.",
      "de": "Dies ist eine klare Darlegung für die Menschen und eine Rechtleitung und Ermahnung für die Gottesfürchtigen.",
      "fr": "Voilà un exposé clair de la vérité, une sûre direction et une exhortation pour quiconque craint le Seigneur.",
      "bs": "To je objašnjenje ljudima, i uputa i pouka za one koji se Allaha boje.",
      "ru": "Это — разъяснение для людей, руководство и назидание для богобоязненных.",
      "ms": "(Al-Quran) ini ialah penerangan kepada seluruh umat manusia, dan petunjuk serta pengajaran bagi orang-orang yang (hendak) bertaqwa."
    }
  },
  {
    "ref": "3:160",
    "sure": 3,
    "ayet": 160,
    "ar": "إِن يَنصُرْكُمُ ٱللَّهُ فَلَا غَالِبَ لَكُمْ وَإِن يَخْذُلْكُمْ فَمَن ذَا ٱلَّذِى يَنصُرُكُم مِّنۢ بَعْدِهِۦ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ",
    "mealler": {
      "tr": "Allah size yardım ederse, kimse size galip gelemez. Eğer sizi yardımsız bırakırsa, ondan sonra size kim yardım edebilir? Müminler, ancak Allah’a tevekkül etsinler.",
      "en": "If Allāh should aid you, no one can overcome you; but if He should forsake you, who is there that can aid you after Him? And upon Allāh let the believers rely.",
      "fr": "Si Allah vous porte secours, nul ne pourra vous vaincre. Mais s’Il vous abandonne, qui donc après cela pourra vous secourir ? C’est à Allah seul que doivent s’en remettre les croyants.",
      "bs": "Ako vas Allah pomogne, niko vas pobijediti neće; a ako vas napusti, pa ko je taj koji vam, osim Njega, može pomoći?! Pa, na Allaha neka se zato oslanjaju vjernici!",
      "ru": "Если Аллах поможет вам, то никто не одолеет вас, а если Он оставит вас без помощи, то кто же поможет вам после Него? На Аллаха пусть уповают верующие."
    }
  },
  {
    "ref": "4:26",
    "sure": 4,
    "ayet": 26,
    "ar": "يُرِيدُ ٱللَّهُ لِيُبَيِّنَ لَكُمْ وَيَهْدِيَكُمْ سُنَنَ ٱلَّذِينَ مِن قَبْلِكُمْ وَيَتُوبَ عَلَيْكُمْ وَٱللَّهُ عَلِيمٌ حَكِيمٌ",
    "mealler": {
      "tr": "Allah size (hükümlerini) açıklamak, sizden öncekilerin yollarına hidayet etmek ve tevbenizi kabul buyurmak ister. Allah her şeyi bilendir, hikmet sahibidir",
      "en": "Allāh wants to make clear to you [the lawful from the unlawful] and guide you to the [good] practices of those before you and to accept your repentance. And Allāh is Knowing and Wise.",
      "de": "Allah will euch Klarheit geben und euch rechtleiten nach den Gesetzmäßigkeiten derer, die vor euch waren, und eure Reue annehmen. Allah ist Allwissend und Allweise.",
      "fr": "Allah entend vous exposer Ses lois, vous indiquer la voie suivie par vos devanciers et accepter votre repentir. Allah est Omniscient et infiniment Sage.",
      "bs": "Allah vam želi objasniti i uputiti vas putevima kojima su išli oni prije vas i oprostiti vam. Allah je Onaj Koji sve zna i mudar je.",
      "ru": "Аллах желает разъяснить вам и повести вас путями тех, которые были до вас, и принять ваше покаяние. Аллах — знающий, мудрый."
    }
  },
  {
    "ref": "4:27",
    "sure": 4,
    "ayet": 27,
    "ar": "وَٱللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ وَيُرِيدُ ٱلَّذِينَ يَتَّبِعُونَ ٱلشَّهَوَٰتِ أَن تَمِيلُوا۟ مَيْلًا عَظِيمًا",
    "mealler": {
      "tr": "Allah, sizin tevbenizi kabul etmek istiyor. Şehvetlerine uyanlar ise sizin büyük bir sapıklığa düşmenizi istiyorlar.",
      "en": "Allāh wants to accept your repentance, but those who follow [their] passions want you to digress [into] a great deviation.",
      "id": "Dan Allah hendak menerima tobatmu, sedang orang-orang yang mengikuti keinginannya menghendaki agar kamu berpaling sejauh-jauhnya (dari kebenaran).",
      "de": "Und Allah will eure Reue annehmen; diejenigen aber, die den Begierden folgen, wollen, daß ihr (vom rechten Weg) völlig abweicht.",
      "fr": "Allah entend vous guider vers le repentir, tandis que ceux qui suivent aveuglément leurs passions voudraient que vous vous écartiez dangereusement du droit chemin.",
      "bs": "Allah vam želi oprostiti, a oni koji se za strastima svojim povode žele da daleko skrenete.",
      "ru": "Аллах желает принять ваше покаяние, а те, которые следуют страстям, желают, чтобы вы отклонились от истины самым пагубным образом."
    }
  },
  {
    "ref": "4:31",
    "sure": 4,
    "ayet": 31,
    "ar": "إِن تَجْتَنِبُوا۟ كَبَآئِرَ مَا تُنْهَوْنَ عَنْهُ نُكَفِّرْ عَنكُمْ سَيِّـَٔاتِكُمْ وَنُدْخِلْكُم مُّدْخَلًا كَرِيمًا",
    "mealler": {
      "tr": "Size yasaklananların büyüklerinden kaçınırsanız, sizin kusurlarınızı (küçük günahlarınızı) örteriz ve sizi onurlu bir makama (Cennet'e) girdiririz.",
      "en": "If you avoid the major sins which you are forbidden, We will remove from you your lesser sins and admit you to a noble entrance [into Paradise].",
      "id": "Jika kamu menjauhi dosa-dosa besar di antara dosa-dosa yang dilarang mengerjakannya, niscaya Kami hapus kesalahan-kesalahanmu dan akan Kami masukkan kamu ke tempat yang mulia (surga).",
      "de": "Wenn ihr die schwerwiegenden (Dinge) meidet, die euch verboten sind, tilgen Wir euch eure bösen Taten und gewähren euch auf eine ehrenvolle Weise Eingang (in den Paradiesgarten).",
      "fr": "Si vous évitez les péchés les plus graves qui vous sont interdits, Nous effacerons vos péchés véniels et vous réserverons un digne accueil au Paradis.",
      "bs": "Ako se budete klonili velikih grijeha koji su vam zabranjeni, Mi ćemo pokriti vaša loša djela i u divno mjesto vas uvesti.",
      "ru": "Если вы будете избегать великих грехов, которые вам запрещены, Мы искупим ваши дурные деяния и введём вас в почётное место.",
      "ms": "Jika kamu menjauhkan dosa-dosa besar yang dilarang kamu melakukannya, Kami akan ampunkan kesalahan-kesalahan (dosa kecil) kamu, dan kami akan masukkan kamu ke tempat yang mulia (syurga)."
    }
  },
  {
    "ref": "4:40",
    "sure": 4,
    "ayet": 40,
    "ar": "إِنَّ ٱللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ وَإِن تَكُ حَسَنَةً يُضَٰعِفْهَا وَيُؤْتِ مِن لَّدُنْهُ أَجْرًا عَظِيمًا",
    "mealler": {
      "tr": "Şüphesiz Allah, zerre miktarı kadar bile haksızlık yapmaz. Bir iyilik olursa onu kat kat artırır ve kendi katından büyük bir mükâfat verir.",
      "en": "Indeed, Allāh does not do injustice, [even] as much as an atom's weight; while if there is a good deed, He multiplies it and gives from Himself a great reward.",
      "de": "Allah tut gewiß nicht im Gewicht eines Stäubchens Unrecht. Und wenn es eine gute Tat ist, vervielfacht Er sie und gibt von Sich aus großartigen Lohn.",
      "fr": "Allah, en vérité, ne lèse en rien Ses serviteurs, décuplant au contraire le salaire de leurs œuvres et leur accordant de surcroît, par un effet de Sa grâce, une immense récompense.",
      "bs": "Zaista Allah ni trunku nepravde ne čini, pa ako to bude dobro djelo, On će ga umnogostručiti i od Sebe nagradu veliku dati.",
      "ru": "Воистину, Аллах не поступит несправедливо даже на вес пылинки. И если это будет благо — Он приумножит его и дарует от Себя великую награду."
    }
  },
  {
    "ref": "4:87",
    "sure": 4,
    "ayet": 87,
    "ar": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ لَيَجْمَعَنَّكُمْ إِلَىٰ يَوْمِ ٱلْقِيَٰمَةِ لَا رَيْبَ فِيهِ وَمَنْ أَصْدَقُ مِنَ ٱللَّهِ حَدِيثًا",
    "mealler": {
      "tr": "Allah’tan başka hak ilah yoktur. Kendisinde hiçbir şüphe olmayan kıyamet gününde sizleri elbette bir araya getirecektir. Allah’tan daha doğru sözlü kim vardır?",
      "en": "Allāh - there is no deity except Him. He will surely assemble you for [account on] the Day of Resurrection, about which there is no doubt. And who is more truthful than Allāh in statement.",
      "id": "Allah, tidak ada tuhan (yang berhak disembah) selain Dia. Dia pasti akan mengumpulkan kamu pada hari Kiamat yang tidak diragukan kejadiannya. Siapakah yang lebih benar perkataan(nya) daripada Allah?",
      "de": "Allah - es gibt keinen Gott außer Ihm. Er wird euch ganz gewiß zum Tag der Auferstehung versammeln, an dem es keinen Zweifel gibt. Und wer ist wahrhaftiger als Allah in der Aussage?",
      "fr": "Allah - il n’est de divinité digne d’être adorée que Lui - vous rassemblera sans l’ombre d’un doute le Jour, inéluctable, de la résurrection. Est-il parole plus véridique que celle d’Allah ?",
      "bs": "Allah, osim Koga drugoga boga nema, sigurno će vas sakupiti na Sudnjem danu, u što nema nimalo sumnje, a čiji je govor istinitiji od Allahovog?!",
      "ru": "Аллах — нет божества, кроме Него. Он непременно соберёт вас ко Дню воскресения, нет в том сомнения. А кто же правдивее Аллаха в речи?"
    }
  },
  {
    "ref": "4:134",
    "sure": 4,
    "ayet": 134,
    "ar": "مَّن كَانَ يُرِيدُ ثَوَابَ ٱلدُّنْيَا فَعِندَ ٱللَّهِ ثَوَابُ ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ وَكَانَ ٱللَّهُ سَمِيعًۢا بَصِيرًا",
    "mealler": {
      "tr": "Kim dünya mükâfatını isterse, bilsin ki dünyanın da, ahiretin de mükâfatı Allah'ın katındadır. Allah herşeyi, işitendir, görendir.",
      "en": "Whoever desires the reward of this world - then with Allāh is the reward of this world and the Hereafter. And ever is Allāh Hearing and Seeing.",
      "id": "Barang siapa menghendaki pahala di dunia maka ketahuilah bahwa di sisi Allah ada pahala dunia dan akhirat. Dan Allah Maha Mendengar, Maha Melihat.",
      "de": "Wer immer die Belohnung des Diesseits will, so ist bei Allah die Belohnung des Diesseits und des Jenseits. Allah ist Allhörend und Allsehend.",
      "fr": "Que celui qui convoite la récompense de ce bas monde sache que c’est Allah qui détient la récompense terrestre et celle de l’au-delà. Allah entend tout et voit tout.",
      "bs": "Onaj koji želi nagradu ovoga svijeta, pa u Allaha je nagrada i ovoga i onoga svijeta; Allah je Onaj Koji sve čuje i Onaj Koji sve vidi.",
      "ru": "Кто желает награды этого мира, то у Аллаха — награда и этого мира, и Последней жизни. Аллах всегда был [и пребудет] слышащим, видящим."
    }
  },
  {
    "ref": "4:148",
    "sure": 4,
    "ayet": 148,
    "ar": "لَّا يُحِبُّ ٱللَّهُ ٱلْجَهْرَ بِٱلسُّوٓءِ مِنَ ٱلْقَوْلِ إِلَّا مَن ظُلِمَ وَكَانَ ٱللَّهُ سَمِيعًا عَلِيمًا",
    "mealler": {
      "tr": "Allah kötü sözün açıkça söylenmesini sevmez; ancak haksızlığa uğrayan başka. Allah her şeyi işitendir, bilendir.",
      "en": "Allāh does not like the public mention of evil except by one who has been wronged. And ever is Allāh Hearing and Knowing.",
      "de": "Allah liebt nicht den laut vernehmbaren Gebrauch von bösen Worten, außer durch jemanden, dem Unrecht zugefügt worden ist. Allah ist Allhörend und Allwissend.",
      "bs": "Allah ne voli da se o zlu glasno govori, to može samo onaj kome je nepravda učinjena. A Allah je Onaj Koji sve čuje i Onaj Koji sve zna.",
      "ru": "Аллах не любит произнесения дурных слов вслух, кроме как от того, с кем поступили несправедливо. Аллах всегда был [и пребудет] слышащим, знающим."
    }
  },
  {
    "ref": "5:9",
    "sure": 5,
    "ayet": 9,
    "ar": "وَعَدَ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ عَظِيمٌ",
    "mealler": {
      "tr": "Allah, iman edip salih amel işleyenlere mağfiret ve büyük bir mükâfat olduğunu vadetmiştir.",
      "en": "Allāh has promised those who believe and do righteous deeds [that] for them there is forgiveness and great reward.",
      "id": "Allah telah menjanjikan kepada orang-orang yang beriman dan beramal saleh, (bahwa) mereka akan mendapat ampunan dan pahala yang besar.",
      "de": "Allah hat denen, die glauben und rechtschaffene Werke tun, versprochen, daß es für sie Vergebung und großartigen Lohn geben wird.",
      "fr": "Allah a promis à ceux qui croient et accomplissent de bonnes œuvres Son pardon et une immense récompense.",
      "bs": "Allah je onima koji vjeruju i dobra djela čine obećao oprost i nagradu veliku;",
      "ru": "Аллах обещал тем, кто уверовал и совершал праведные деяния: для них — прощение и великая награда.",
      "ms": "Allah menjanjikan kepada orang-orang yang beriman dan beramal soleh, mereka akan beroleh keampunan dan pahala yang besar."
    }
  },
  {
    "ref": "5:35",
    "sure": 5,
    "ayet": 35,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَٱبْتَغُوٓا۟ إِلَيْهِ ٱلْوَسِيلَةَ وَجَٰهِدُوا۟ فِى سَبِيلِهِۦ لَعَلَّكُمْ تُفْلِحُونَ",
    "mealler": {
      "tr": "Ey İman edenler! Allah’tan sakının/takvalı olun. O’na (yakınlaştıracak ibadetlerle) vesile/yol arayın ve yolunda cihat edin ki, kurtuluşa eresiniz.",
      "en": "O you who have believed, fear Allāh and seek the means [of nearness] to Him and strive in His cause that you may succeed.",
      "id": "Wahai orang-orang yang beriman! Bertakwalah kepada Allah dan carilah wasilah (jalan) untuk mendekatkan diri kepada-Nya, dan berjihadlah (berjuanglah) di jalan-Nya, agar kamu beruntung.",
      "de": "O die ihr glaubt, fürchtet Allah und trachtet nach einem Mittel zu Ihm und müht euch auf Seinem Weg ab, auf daß es euch wohl ergehen möge!",
      "fr": "Vous qui croyez ! Craignez Allah, cherchez à vous rapprocher de Lui et luttez pour Sa cause afin de faire votre bonheur et votre salut.",
      "bs": "O vi koji vjerujete, Allaha se bojte i tražite ono što će vas Njemu približiti, i na putu Njegovu se borite da biste uspjeli.",
      "ru": "О вы, которые уверовали! Бойтесь Аллаха, ищите средства приблизиться к Нему и усердствуйте на Его пути, — быть может, вы преуспеете."
    }
  },
  {
    "ref": "5:40",
    "sure": 5,
    "ayet": 40,
    "ar": "أَلَمْ تَعْلَمْ أَنَّ ٱللَّهَ لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يُعَذِّبُ مَن يَشَآءُ وَيَغْفِرُ لِمَن يَشَآءُ وَٱللَّهُ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "mealler": {
      "tr": "Bilmez misin ki göklerin ve yerin mülkü Allah'ındır? Allah, dilediğine azap eder, dilediğini ise bağışlar. Allah’ın her şeye gücü yeter.",
      "en": "Do you not know that to Allāh belongs the dominion of the heavens and the earth? He punishes whom He wills and forgives whom He wills, and Allāh is over all things competent.",
      "id": "Tidakkah kamu tahu, bahwa Allah memiliki seluruh kerajaan langit dan bumi, Dia menyiksa siapa yang Dia kehendaki dan mengampuni siapa yang Dia kehendaki. Allah Mahakuasa atas segala sesuatu.",
      "de": "Weißt du nicht, daß Allah die Herrschaft über die Himmel und die Erde gehört? Er straft, wen Er will, und vergibt, wem Er will. Und Allah hat zu allem die Macht.",
      "fr": "Ne sais-tu pas qu’Allah règne en Maître absolu sur les cieux et la terre, qu’Il châtie qui Il veut et pardonne à qui Il veut, et qu’Il a pouvoir sur toute chose ?",
      "bs": "Ti sigurno znaš da samo Allah ima vlast na nebesima i na Zemlji. On patnji podvrgava onoga koga hoće, a prašta onome kome hoće. Allah nad svime ima moć.",
      "ru": "Разве ты не знаешь, что Аллах — Ему принадлежит владычество небес и земли? Он подвергает наказанию, кого пожелает, и прощает, кому пожелает. Аллах всемогущ над всем сущим."
    }
  },
  {
    "ref": "5:87",
    "sure": 5,
    "ayet": 87,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُحَرِّمُوا۟ طَيِّبَٰتِ مَآ أَحَلَّ ٱللَّهُ لَكُمْ وَلَا تَعْتَدُوٓا۟ إِنَّ ٱللَّهَ لَا يُحِبُّ ٱلْمُعْتَدِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’ın size helâl kıldığı temiz şeyleri haram kılmayın ve haddi aşmayın. Çünkü Allah, haddi aşanları sevmez.",
      "en": "O you who have believed, do not prohibit the good things which Allāh has made lawful to you and do not transgress. Indeed, Allāh does not like transgressors.",
      "de": "O die ihr glaubt, verbietet nicht die guten Dinge, die Allah euch erlaubt hat. und übertretet nicht! Allah liebt nicht die Übertreter.",
      "bs": "O vi koji vjerujete, ne zabranjujte sebi ono što je lijepo, što je Allah dozvolio, samo ne prelazite granicu! Zaista Allah ne voli one koji granicu prelaze.",
      "ru": "О вы, которые уверовали! Не объявляйте запретными блага, которые Аллах сделал для вас дозволенными, и не преступайте границы. Воистину, Аллах не любит преступающих границы."
    }
  },
  {
    "ref": "5:91",
    "sure": 5,
    "ayet": 91,
    "ar": "إِنَّمَا يُرِيدُ ٱلشَّيْطَٰنُ أَن يُوقِعَ بَيْنَكُمُ ٱلْعَدَٰوَةَ وَٱلْبَغْضَآءَ فِى ٱلْخَمْرِ وَٱلْمَيْسِرِ وَيَصُدَّكُمْ عَن ذِكْرِ ٱللَّهِ وَعَنِ ٱلصَّلَوٰةِ فَهَلْ أَنتُم مُّنتَهُونَ",
    "mealler": {
      "tr": "Şeytan, içki ve kumarla, ancak aranıza düşmanlık ve kin sokmak; sizi Allah’ı anmaktan ve namazdan alıkoymak ister. Artık vazgeçiyor musunuz?",
      "en": "Satan only wants to cause between you animosity and hatred through intoxicants and gambling and to avert you from the remembrance of Allāh and from prayer. So will you not desist?",
      "de": "Der Satan will (ja) zwischen euch nur Feindschaft und Haß säen durch berauschenden Trank und Glücksspiel und euch vom Gedenken Allahs und vom Gebet abhalten. Werdet ihr (damit) nun wohl aufhören?",
      "fr": "Satan ne cherche, à travers les boissons alcoolisées et les jeux de hasard, qu’à semer parmi vous haine et animosité et à vous détourner d’Allah et de la prière. Allez-vous donc y renoncer ?",
      "bs": "Šejtan želi pomoću opojnih pića i kocke unijeti među vas neprijateljstvo i mržnju i od sjećanja na Allaha i obavljanja namaza odvratiti vas. Pa, hoćete li se okaniti?",
      "ru": "Воистину, шайтан хочет лишь посеять между вами вражду и ненависть через вино и азартные игры и отвратить вас от поминания Аллаха и от молитвы. Так прекратите ли вы?"
    }
  },
  {
    "ref": "5:98",
    "sure": 5,
    "ayet": 98,
    "ar": "ٱعْلَمُوٓا۟ أَنَّ ٱللَّهَ شَدِيدُ ٱلْعِقَابِ وَأَنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ",
    "mealler": {
      "tr": "Bilin ki, Allah’ın cezası çetindir ve Allah çok bağışlayandır, çok merhamet edendir.",
      "en": "Know that Allāh is severe in penalty and that Allāh is Forgiving and Merciful.",
      "id": "Ketahuilah, bahwa Allah sangat keras siksaan-Nya dan bahwa Allah Maha Pengampun, Maha Penyayang.",
      "de": "Wisset, daß Allah streng im Bestrafen, daß Allah (aber auch) Allvergebend und Barmherzig ist.",
      "fr": "Sachez qu’Allah est implacable lorsqu’Il décide de châtier, mais qu’Il est aussi Très Clément et Très Miséricordieux.",
      "bs": "Znajte da Allah strogo kažnjava, ali i da je Onaj Koji oprašta grijehe i milostiv je.",
      "ru": "Знайте, что Аллах суров в возмездии, и что Аллах — прощающий, милующий."
    }
  },
  {
    "ref": "5:120",
    "sure": 5,
    "ayet": 120,
    "ar": "لِلَّهِ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَمَا فِيهِنَّ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌۢ",
    "mealler": {
      "tr": "Göklerin, yerin ve içindekilerin mülkü Allah’a aittir. O her şeye kadirdir.",
      "en": "To Allāh belongs the dominion of the heavens and the earth and whatever is within them. And He is over all things competent.",
      "id": "Milik Allah kerajaan langit dan bumi dan apa yang ada di dalamnya; dan Dia Mahakuasa atas segala sesuatu.",
      "de": "Allah gehört die Herrschaft über die Himmel und die Erde und das, was in ihnen ist. Und Er hat zu allem die Macht.",
      "fr": "Allah règne en Maître absolu sur les cieux, la terre et tout ce qui s’y trouve. Et Il a pouvoir sur toute chose.",
      "bs": "Allahova je vlast na nebesima i na Zemlji i nad onim što je na njima; On nad svime ima moć.",
      "ru": "Аллаху принадлежит власть над небесами и землёй, и всем, что в них, и Он всемогущ над всем сущим.",
      "ms": "Allah jualah yang menguasai alam langit dan bumi serta segala yang ada padanya; dan Dia lah jua yang Maha Kuasa atas tiap-tiap sesuatu."
    }
  },
  {
    "ref": "6:102",
    "sure": 6,
    "ayet": 102,
    "ar": "ذَٰلِكُمُ ٱللَّهُ رَبُّكُمْ لَآ إِلَٰهَ إِلَّا هُوَ خَٰلِقُ كُلِّ شَىْءٍ فَٱعْبُدُوهُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ وَكِيلٌ",
    "mealler": {
      "tr": "İşte bu, Rabbiniz Allah’tır. Ondan başka (hak) ilah yoktur. Her şeyin yaratıcısıdır. O’na ibadet edin. O, her şey üzerinde vekildir.",
      "en": "That is Allāh, your Lord; there is no deity except Him, the Creator of all things, so worship Him. And He is Disposer of all things.",
      "id": "Itulah Allah, Tuhan kamu; tidak ada tuhan selain Dia; Pencipta segala sesuatu, maka sembahlah Dia; Dialah Pemelihara segala sesuatu.",
      "de": "Dies ist doch Allah, euer Herr. Es gibt keinen Gott außer Ihm, dem Schöpfer von allem. So dient Ihm! Er ist Sachwalter über alles.",
      "fr": "Tel est Allah, votre Seigneur. Il n’est de divinité digne d’être adorée que Lui. Adorez donc Allah qui est le Créateur de tout ce qui existe et qui veille à toute chose.",
      "bs": "To vam je Allah, Gospodar vaš, nema drugog boga osim Njega, Stvoritelja svega; zato Njemu ibadet činite; On nad svime bdi.",
      "ru": "Таков Аллах, ваш Господь! Нет божества, кроме Него, Творец всего сущего. Так поклоняйтесь же Ему. Он — попечитель над всем сущим."
    }
  },
  {
    "ref": "6:117",
    "sure": 6,
    "ayet": 117,
    "ar": "إِنَّ رَبَّكَ هُوَ أَعْلَمُ مَن يَضِلُّ عَن سَبِيلِهِۦ وَهُوَ أَعْلَمُ بِٱلْمُهْتَدِينَ",
    "mealler": {
      "tr": "Doğrusu Rabbin, yolundan kimin saptığını daha iyi bilir. Hidayete ermiş olanları da en iyi O bilir.",
      "en": "Indeed, your Lord is most knowing of who strays from His way, and He is most knowing of the [rightly] guided.",
      "id": "Sesungguhnya Tuhanmu, Dialah yang lebih mengetahui siapa yang tersesat dari jalan-Nya, dan Dia lebih mengetahui orang-orang yang mendapat petunjuk.",
      "de": "Gewiß, dein Herr kennt sehr wohl, wer von Seinem Weg abirrt, und Er kennt sehr wohl die Rechtgeleiteten.",
      "fr": "Ton Seigneur sait parfaitement qui s’écarte de Sa voie et qui suit le droit chemin.",
      "bs": "Zaista Gospodar tvoj najbolje zna one koji su skrenuli s Njegova puta i On najbolje zna one koji su na Pravom putu.",
      "ru": "Воистину, твой Господь — Он лучше знает тех, кто сбивается с Его пути, Он лучше знает и следующих верным путём.",
      "ms": "Sesungguhnya Tuhanmu, Dia lah yang lebih mengetahui akan sesiapa yang sesat dari jalannya, dan Dia lah yang lebih mengetahui akan orang-orang yang mendapat petunjuk."
    }
  },
  {
    "ref": "7:3",
    "sure": 7,
    "ayet": 3,
    "ar": "ٱتَّبِعُوا۟ مَآ أُنزِلَ إِلَيْكُم مِّن رَّبِّكُمْ وَلَا تَتَّبِعُوا۟ مِن دُونِهِۦٓ أَوْلِيَآءَ قَلِيلًا مَّا تَذَكَّرُونَ",
    "mealler": {
      "tr": "Rabbinizden size indirilmiş olana uyun, Onun dışında dost edindiklerinize uymayın. Ne kadar az öğüt alıyorsunuz!",
      "en": "Follow, [O mankind], what has been revealed to you from your Lord and do not follow other than Him any allies. Little do you remember.",
      "id": "Ikutilah apa yang diturunkan kepadamu dari Tuhanmu, dan janganlah kamu ikuti selain Dia sebagai pemimpin. Sedikit sekali kamu mengambil pelajaran.",
      "de": "Folgt dem, was zu euch von eurem Herrn herabgesandt worden ist, und folgt außer Ihm keinen (anderen) Schutzherren! Wie wenig ihr bedenkt!",
      "bs": "Slijedite ono što vam se od Gospodara vašeg objavljuje i pored Njega ne slijedite druge kao zaštitnike! A kako se vi malo prisjećate i pouku primate?!",
      "ru": "Следуйте тому, что ниспослано вам от вашего Господа, и не следуйте покровителям помимо Него. Как же мало вы внимаете напоминанию!"
    }
  },
  {
    "ref": "7:201",
    "sure": 7,
    "ayet": 201,
    "ar": "إِنَّ ٱلَّذِينَ ٱتَّقَوْا۟ إِذَا مَسَّهُمْ طَٰٓئِفٌ مِّنَ ٱلشَّيْطَٰنِ تَذَكَّرُوا۟ فَإِذَا هُم مُّبْصِرُونَ",
    "mealler": {
      "tr": "Takvâ sahiplerine şeytandan bir vesvese geldiğinde iyice düşünürler. Bakarsın ki onlar görüp bilmişler bile.",
      "en": "Indeed, those who fear Allāh - when an impulse touches them from Satan, they remember [Him] and at once they have insight.",
      "de": "Diejenigen, die gottesfürchtig sind, - wenn ihnen eine Anwandlung vom Satan widerfährt, bedenken sie, und da werden sie sogleich einsichtig.",
      "fr": "Lorsque les pieux croyants sont tentés par Satan, ils se souviennent d’Allah et aussitôt redeviennent clairvoyants.",
      "bs": "Doista, oni koji se Allaha boje, čim ih dodirne sablazan šejtanska, sjete se, i postanu razboriti,",
      "ru": "Воистину, те, которые богобоязненны, когда их коснётся наущение от шайтана, — вспоминают [Аллаха], и вот — они прозревают.",
      "ms": "Sesungguhnya orang-orang yang bertaqwa, apabila mereka disentuh oleh sesuatu imbasan hasutan dari Syaitan, mereka ingat (kepada ajaran Allah) maka dengan itu mereka nampak (jalan yang benar)."
    }
  },
  {
    "ref": "7:206",
    "sure": 7,
    "ayet": 206,
    "ar": "إِنَّ ٱلَّذِينَ عِندَ رَبِّكَ لَا يَسْتَكْبِرُونَ عَنْ عِبَادَتِهِۦ وَيُسَبِّحُونَهُۥ وَلَهُۥ يَسْجُدُونَ",
    "mealler": {
      "tr": "Doğrusu Rabbinin katında olanlar, O'na ibadet etmekten büyüklenmezler, O'nu tenzih ederler ve yalnız O'na secde ederler",
      "en": "Indeed, those who are near your Lord [i.e., the angels] are not prevented by arrogance from His worship, and they exalt Him, and to Him they prostrate.",
      "de": "Diejenigen, die bei deinem Herrn sind, sind nicht zu hochmütig dazu, Ihm zu dienen; sie preisen Ihn und werfen sich vor Ihm nieder.",
      "fr": "Les anges qui se tiennent auprès de ton Seigneur ne refusent jamais par fierté de L’adorer. Ils ne cessent de célébrer Sa gloire et Sa sainteté et, devant Lui, de se prosterner.",
      "bs": "Oni koji su kod Gospodara tvoga, doista ne zaziru da Mu ibadet čine; samo Njega hvale i samo Njemu na sedždu padaju.",
      "ru": "Воистину, те, которые у твоего Господа, — они не превозносятся над поклонением Ему, прославляют Его и падают пред Ним ниц.",
      "ms": "Sesungguhnya mereka (malaikat) yang ada di sisi Tuhanmu tidak bersikap angkuh (ingkar) daripada beribadat kepadaNya, dan mereka pula bertasbih bagiNya, dan kepadaNyalah jua mereka sujud."
    }
  },
  {
    "ref": "9:116",
    "sure": 9,
    "ayet": 116,
    "ar": "إِنَّ ٱللَّهَ لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يُحْىِۦ وَيُمِيتُ وَمَا لَكُم مِّن دُونِ ٱللَّهِ مِن وَلِىٍّ وَلَا نَصِيرٍ",
    "mealler": {
      "tr": "Göklerin ve yerin mülkü elbette Allah’ındır. Dirilten ve öldüren O’dur. Sizin Allah’tan başka bir veliniz ve yardımcınız yoktur.",
      "en": "Indeed, to Allāh belongs the dominion of the heavens and the earth; He gives life and causes death. And you have not besides Allāh any protector or any helper.",
      "id": "Sesungguhnya Allah memiliki kekuasaan langit dan bumi. Dia menghidupkan dan mematikan. Tidak ada pelindung dan penolong bagimu selain Allah.",
      "de": "Allah hat die Herrschaft über die Himmel und die Erde. Er macht lebendig und läßt sterben. Ihr habt außer Allah weder Schutzherrn noch Helfer.",
      "fr": "Allah règne en Maître absolu sur les cieux et la terre. Il donne la vie et la mort. Vous n’avez d’autre soutien et protecteur que le Seigneur.",
      "bs": "Zaista je Allahova vlast na nebesima i na Zemlji, On život i smrt daje, i vi osim Allaha nemate ni zaštitnika ni pomagača.",
      "ru": "Воистину, Аллах — Ему принадлежит владычество небес и земли. Он оживляет и умерщвляет. И нет у вас, помимо Аллаха, ни покровителя, ни помощника."
    }
  },
  {
    "ref": "9:119",
    "sure": 9,
    "ayet": 119,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَكُونُوا۟ مَعَ ٱلصَّٰدِقِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’a karşı gelmekten sakının ve sâdıklarla beraber olun.",
      "en": "O you who have believed, fear Allāh and be with those who are true.",
      "id": "Wahai orang-orang yang beriman! Bertakwalah kepada Allah, dan bergabunglah kamu bersama dengan orang-orang yang benar.",
      "de": "O ihr, die ihr glaubt, fürchtet Allah und seid mit den Wahrhaftigen!",
      "fr": "Vous qui croyez ! Craignez Allah et comportez-vous en hommes véridiques et sincères !",
      "bs": "O vi koji vjerujete, bojte se Allaha i budite s onima koji su iskreni!",
      "ru": "О вы, которые уверовали! Бойтесь Аллаха и будьте с правдивыми.",
      "ms": "Wahai orang-orang yang beriman! Bertaqwalah kamu kepada Allah, dan hendaklah kamu berada bersama-sama orang-orang yang benar."
    }
  },
  {
    "ref": "9:128",
    "sure": 9,
    "ayet": 128,
    "ar": "لَقَدْ جَآءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُم بِٱلْمُؤْمِنِينَ رَءُوفٌ رَّحِيمٌ",
    "mealler": {
      "tr": "Andolsun ki size, içinizden sizin sıkıntıya uğramanız kendisine ağır gelen, size düşkün, Müminlere şefkatli ve merhametli bir rasûl gelmiştir.",
      "en": "There has certainly come to you a Messenger from among yourselves. Grievous to him is what you suffer; [he is] concerned over you [i.e., your guidance] and to the believers is kind and merciful.",
      "fr": "Voilà que vous est venu un Messager issu de vous, à la fois sensible à vos souffrances, désireux de vous voir embrasser la foi et plein de compassion et de miséricorde envers les croyants.",
      "bs": "Došao vam je Poslanik, jedan od vas, teško mu je što ćete na muke udariti, jedva čeka da Pravim putem pođete, a prema vjernicima je milosrdan i milostiv.",
      "ru": "Действительно, к вам пришёл Посланник из вас самих. Ему тягостны ваши страдания; он заботится о вас, а к верующим — сострадателен и милосерден."
    }
  },
  {
    "ref": "10:6",
    "sure": 10,
    "ayet": 6,
    "ar": "إِنَّ فِى ٱخْتِلَٰفِ ٱلَّيْلِ وَٱلنَّهَارِ وَمَا خَلَقَ ٱللَّهُ فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ لَـَٔايَٰتٍ لِّقَوْمٍ يَتَّقُونَ",
    "mealler": {
      "tr": "Gece ile gündüzün birbiri ardınca gelişinde, Allah’ın göklerde ve yerde yarattığı şeylerde sakınan bir toplum için ayetler/deliller vardır.",
      "en": "Indeed, in the alternation of the night and the day and [in] what Allāh has created in the heavens and the earth are signs for a people who fear Allāh.",
      "id": "Sesungguhnya pada pergantian malam dan siang, dan pada apa yang diciptakan Allah di langit dan di bumi, pasti terdapat tanda-tanda (kebesaran-Nya) bagi orang-orang yang bertakwa.",
      "de": "Gewiß, in dem Unterschied von Nacht und Tag und in dem, was Allah in den Himmeln und auf der Erde erschaffen hat, sind wahrlich Zeichen für Leute, die gottesfürchtig sind.",
      "fr": "Dans l’alternance du jour et de la nuit, et dans tout ce qu’Allah a créé dans les cieux et sur la terre, il est des signes suffisamment clairs pour des hommes qui craignent leur Seigneur.",
      "bs": "U smjeni noći i dana i u onom što je Allah na nebesima i na Zemlji stvorio, zaista, postoje znakovi za ljude koji se Allahove kazne čuvaju.",
      "ru": "Воистину, в чередовании ночи и дня, и в том, что Аллах сотворил на небесах и на земле, — ясные знамения для людей, которые богобоязненны."
    }
  },
  {
    "ref": "10:44",
    "sure": 10,
    "ayet": 44,
    "ar": "إِنَّ ٱللَّهَ لَا يَظْلِمُ ٱلنَّاسَ شَيْـًٔا وَلَٰكِنَّ ٱلنَّاسَ أَنفُسَهُمْ يَظْلِمُونَ",
    "mealler": {
      "tr": "Şüphesiz ki Allah insanlara hiçbir şekilde zulmetmez, fakat insanlar kendilerine zulmederler.",
      "en": "Indeed, Allāh does not wrong the people at all, but it is the people who are wronging themselves.",
      "id": "Sesungguhnya Allah tidak menzalimi manusia sedikit pun, tetapi manusia itulah yang menzalimi dirinya sendiri.",
      "de": "Gewiß, Allah fügt den Menschen kein Unrecht zu, sondern die Menschen fügen sich selbst Unrecht zu.",
      "fr": "Allah ne lèse en rien les hommes qui, en réalité, se lèsent eux-mêmes.",
      "bs": "Allah, zaista, nikakvu nepravdu ne čini ljudima, ljudi je sami sebi čine.",
      "ru": "Воистину, Аллах не поступает с людьми несправедливо, но они поступают несправедливо с самими собой.",
      "ms": "Sesungguhnya Allah tidak menganiaya manusia sedikitpun, akan tetapi manusia jualah yang menganiaya diri mereka sendiri."
    }
  },
  {
    "ref": "10:55",
    "sure": 10,
    "ayet": 55,
    "ar": "أَلَآ إِنَّ لِلَّهِ مَا فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ أَلَآ إِنَّ وَعْدَ ٱللَّهِ حَقٌّ وَلَٰكِنَّ أَكْثَرَهُمْ لَا يَعْلَمُونَ",
    "mealler": {
      "tr": "Bilesiniz ki, göklerdeki her şey, yerdeki her şey Allah’ındır. Yine bilesiniz ki, Allah’ın vaadi haktır. Fakat onların çoğu bunu bilmez.",
      "en": "Unquestionably, to Allāh belongs whatever is in the heavens and the earth. Unquestionably, the promise of Allāh is truth, but most of them do not know.",
      "id": "Ketahuilah sesungguhnya milik Allahlah apa yang ada di langit dan di bumi. Bukankah janji Allah itu benar? Tetapi kebanyakan mereka tidak mengetahui.",
      "de": "Sicherlich, Allah gehört (alles), was in den Himmeln und auf der Erde ist. Sicherlich, Allahs Versprechen ist wahr. Aber die meisten von ihnen wissen nicht.",
      "fr": "C’est à Allah, en vérité, qu’appartient tout ce qui se trouve dans les cieux et sur la terre. La promesse d’Allah s’accomplira inéluctablement, mais la plupart des hommes n’en sont pas conscients.",
      "bs": "Zasigurno, Allahovo je sve što je na nebesima i na Zemlji! Zasigurno, Allahovo obećanje je istinito, ali većina njih ne zna.",
      "ru": "Знайте же: воистину, Аллаху принадлежит всё, что в небесах и на земле! Знайте же: воистину, обещание Аллаха — истина, однако большинство из них не знает!",
      "ms": "Ingatlah! Sesungguhnya segala yang ada di langit dan di bumi adalah kepunyaan Allah. Awaslah! Sesungguhnya janji Allah itu adalah benar, tetapi kebanyakan manusia tidak mengetahui."
    }
  },
  {
    "ref": "10:56",
    "sure": 10,
    "ayet": 56,
    "ar": "هُوَ يُحْىِۦ وَيُمِيتُ وَإِلَيْهِ تُرْجَعُونَ",
    "mealler": {
      "tr": "Dirilten ve öldüren O’dur. O’na döndürüleceksiniz!",
      "en": "He gives life and causes death, and to Him you will be returned.",
      "id": "Dialah yang menghidupkan dan mematikan, dan hanya kepada-Nyalah kamu dikembalikan.",
      "de": "Er macht lebendig und läßt sterben. Und zu Ihm werdet ihr zurückgebracht.",
      "fr": "C’est Lui qui donne la vie et la mort et c’est à Lui que vous serez tous ramenés.",
      "bs": "On život i smrt daje i Njemu ćete se vratiti.",
      "ru": "Он оживляет и умерщвляет, и к Нему вы будете возвращены.",
      "ms": "Dia lah yang menghidupkan dan yang mematikan, dan kepadaNyalah kamu akan dikembalikan untuk menerima balasan."
    }
  },
  {
    "ref": "10:57",
    "sure": 10,
    "ayet": 57,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ قَدْ جَآءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَآءٌ لِّمَا فِى ٱلصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    "mealler": {
      "tr": "Ey insanlar! Rabbinizden size bir öğüt, göğüslerdeki (şüphe ve sıkıntılar) için bir şifa ve Müminler için bir hidayet ve rahmet gelmiştir.",
      "en": "O mankind, there has come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers.",
      "id": "Wahai manusia! Sungguh, telah datang kepadamu pelajaran (Al-Qur`an) dari Tuhanmu, penyembuh bagi penyakit yang ada dalam dada, dan petunjuk serta rahmat bagi orang yang beriman.",
      "de": "O ihr Menschen, zu euch ist nunmehr eine Ermahnung von eurem Herrn gekommen und eine Heilung für das, was in den Brüsten ist, eine Rechtleitung und Barmherzigkeit für die Gläubigen.",
      "bs": "O ljudi, već vam je stigla Opomena od Gospodara vašega, i lijek za vaša srca, i uputa i milost vjernicima.",
      "ru": "О люди! К вам уже пришло назидание от вашего Господа и исцеление от того, что в сердцах, а также руководство, и милость для верующих."
    }
  },
  {
    "ref": "11:23",
    "sure": 11,
    "ayet": 23,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَأَخْبَتُوٓا۟ إِلَىٰ رَبِّهِمْ أُو۟لَٰٓئِكَ أَصْحَٰبُ ٱلْجَنَّةِ هُمْ فِيهَا خَٰلِدُونَ",
    "mealler": {
      "tr": "İman edip, salih ameller işleyen ve Rablerine gönülden bağlananlara gelince, işte onlar cennetliklerdir. Onlar orada ebedî kalacaklardır.",
      "en": "Indeed, they who have believed and done righteous deeds and humbled themselves to their Lord - those are the companions of Paradise; they will abide eternally therein.",
      "id": "Sesungguhnya orang-orang yang beriman, mengerjakan kebajikan dan merendahkan diri kepada Tuhan, mereka itu penghuni surga, mereka kekal di dalamnya.",
      "de": "Gewiß, diejenigen, die glauben und rechtschaffene Werke tun und sich vor ihrem Herrn demütigen, das sind die Insassen des (Paradies)gartens. Ewig werden sie darin bleiben.",
      "fr": "Quant à ceux qui croient, accomplissent de bonnes œuvres et sont humblement soumis à leur Seigneur, ils sont promis au Paradis où ils demeureront éternellement.",
      "bs": "A oni koji budu vjerovali, Allahu pokorni i dobra djela činili, oni će stanovnici Dženneta biti; u njemu će vječno boraviti.",
      "ru": "Воистину, те, которые уверовали, совершали праведные деяния и были смиренны пред своим Господом, такие — обитатели Рая, они пребудут в нём вечно.",
      "ms": "Sesungguhnya orang-orang yang beriman dan mengerjakan amal yang soleh, serta tunduk taat menunaikan ibadat kepada Tuhan mereka dengan khusyuk, mereka itulah ahli Syurga, mereka kekal di dalamnya."
    }
  },
  {
    "ref": "11:56",
    "sure": 11,
    "ayet": 56,
    "ar": "إِنِّى تَوَكَّلْتُ عَلَى ٱللَّهِ رَبِّى وَرَبِّكُم مَّا مِن دَآبَّةٍ إِلَّا هُوَ ءَاخِذٌۢ بِنَاصِيَتِهَآ إِنَّ رَبِّى عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
    "mealler": {
      "tr": "Şüphesiz ben, benim de sizin de Rabbiniz olan Allah’a tevekkül ettim. Hareket eden ne kadar canlı varsa hepsinin alnından tutan O’dur. Benim Rabbim gerçekten dosdoğru bir yol üzeredir.",
      "en": "Indeed, I have relied upon Allāh, my Lord and your Lord. There is no creature but that He holds it by its forelock [i.e., controls it]. Indeed, my Lord is on a path [that is] straight.",
      "de": "Ich verlasse mich auf Allah, meinen Herrn und euren Herrn. Es gibt kein Tier, das Er nicht an seiner Stirnlocke hielte. Gewiß, mein Herr befindet sich auf einem geraden Weg.",
      "fr": "Je m’en remets pour ma part à Allah, mon Seigneur et le vôtre. Il n’est pas de créature qu’Il ne tienne en Son pouvoir. Mon Seigneur est toute justice.",
      "bs": "ja se uzdam u Allaha, u moga i vašeg Gospodara! Sve živo samo je Njemu potčinjeno; Gospodar moj je, zaista, na putu pravome.\"",
      "ru": "Воистину, я уповаю на Аллаха, моего Господа и вашего Господа. Нет ни одного живого существа, которого Он не держал бы за чуб. Воистину, мой Господь — на прямом пути."
    }
  },
  {
    "ref": "13:10",
    "sure": 13,
    "ayet": 10,
    "ar": "سَوَآءٌ مِّنكُم مَّنْ أَسَرَّ ٱلْقَوْلَ وَمَن جَهَرَ بِهِۦ وَمَنْ هُوَ مُسْتَخْفٍۭ بِٱلَّيْلِ وَسَارِبٌۢ بِٱلنَّهَارِ",
    "mealler": {
      "tr": "(O’na göre) içinizden sözü gizleyen ile açığa vuran, geceleyin gizlenenle gündüz ortaya çıkan birdir.",
      "en": "It is the same [to Him] concerning you whether one conceals [his] speech or publicizes it and whether one is hidden by night or conspicuous [among others] by day.",
      "id": "Sama saja (bagi Allah), siapa di antaramu yang merahasiakan ucapannya dan siapa yang berterus terang dengannya; dan siapa yang bersembunyi pada malam hari dan yang berjalan pada siang hari.",
      "de": "Es ist gleich, ob jemand von euch seine Worte geheimhält oder sie laut vernehmbar äußert und ob jemand sich bei Nacht verbirgt oder bei Tag offen hervortritt.",
      "fr": "Nulle différence pour Lui entre celui parmi vous qui parle tout bas et celui qui s’exprime à haute voix, entre celui qui se dissimule à la faveur de la nuit et celui qui agit au grand jour.",
      "bs": "Za Njega je jednak onaj od vas koji tiho govori i onaj koji to glasno čini, onaj koji se noću skriva i onaj koji po danu hodi.",
      "ru": "Равны перед Ним и тот из вас, кто скрывает речь, и тот, кто произносит её вслух; и тот, кто таится ночью, и тот, кто свободно движется днём.",
      "ms": "Sama sahaja kepadaNya: sesiapa di antara kamu yang merahsiakan kata-katanya dalam hati dan yang menyatakannya; juga yang bersembunyi pada waktu malam dan yang keluar berjalan pada waktu siang."
    }
  },
  {
    "ref": "13:26",
    "sure": 13,
    "ayet": 26,
    "ar": "ٱللَّهُ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ وَفَرِحُوا۟ بِٱلْحَيَوٰةِ ٱلدُّنْيَا وَمَا ٱلْحَيَوٰةُ ٱلدُّنْيَا فِى ٱلْـَٔاخِرَةِ إِلَّا مَتَٰعٌ",
    "mealler": {
      "tr": "Allah, rızkı dilediğine bol verir, (dilediğine de) kısar. Onlar ise dünya hayatı ile sevinmektedirler. Hâlbuki dünya hayatı, ahiretin yanında çok az bir geçimliktir.",
      "en": "Allāh extends provision for whom He wills and restricts [it]. And they rejoice in the worldly life, while the worldly life is not, compared to the Hereafter, except [brief] enjoyment.",
      "de": "Allah gewährt die Versorgung großzügig, wem Er will, und bemißt auch. Und sie sind froh über das diesseitige Leben; aber das diesseitige Leben (zählt) im Jenseits nur als (vergänglicher) Nießbrauch.",
      "bs": "Kome hoće, Allah daje opskrbu u obilju, i uskraćuje. Oni se raduju životu na ovom svijetu, a život na ovom svijetu prema onome samo je prolazno uživanje.",
      "ru": "Аллах расширяет удел, кому пожелает, и ограничивает [его]. И они обрадовались мирской жизни, а мирская жизнь по сравнению с Последней — лишь пользование [благами]."
    }
  },
  {
    "ref": "14:24",
    "sure": 14,
    "ayet": 24,
    "ar": "أَلَمْ تَرَ كَيْفَ ضَرَبَ ٱللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِى ٱلسَّمَآءِ",
    "mealler": {
      "tr": "Görmedin mi, Allah güzel bir sözü nasıl misal getirdi? (Güzel bir söz), kökü sağlam, dalları göğe yükselen bir ağaç gibidir.",
      "en": "Have you not considered how Allāh presents an example, [making] a good word like a good tree, whose root is firmly fixed and its branches [high] in the sky?",
      "de": "Siehst du nicht, wie Allah ein Gleichnis von einem guten Wort geprägt hat? (Es ist) wie ein guter Baum, dessen Wurzeln fest sitzen und dessen Zweige in den Himmel (reichen).",
      "bs": "Zar ne vidiš kako Allah navodi primjer – lijepa je riječ kao lijepo drvo: korijen mu je čvrsto u zemlji, a grane prema nebu.",
      "ru": "Разве ты не видишь, как Аллах приводит в пример благое слово? Оно подобно благому дереву: корень его прочен, а ветви — в небе."
    }
  },
  {
    "ref": "14:52",
    "sure": 14,
    "ayet": 52,
    "ar": "هَٰذَا بَلَٰغٌ لِّلنَّاسِ وَلِيُنذَرُوا۟ بِهِۦ وَلِيَعْلَمُوٓا۟ أَنَّمَا هُوَ إِلَٰهٌ وَٰحِدٌ وَلِيَذَّكَّرَ أُو۟لُوا۟ ٱلْأَلْبَٰبِ",
    "mealler": {
      "tr": "Bu Kur’an; kendisiyle uyarılsınlar, Allah’ın ancak tek ilâh olduğunu bilsinler ve akıl sahipleri düşünüp öğüt alsınlar diye insanlara bir bildiridir.",
      "en": "This [Qur’ān] is notification for the people that they may be warned thereby and that they may know that He is but one God and that those of understanding will be reminded.",
      "de": "Dies ist eine Botschaft an die Menschen, damit sie dadurch gewarnt werden und damit sie wissen, daß Er nur ein Einziger Gott ist, und damit diejenigen bedenken, die Verstand besitzen.",
      "fr": "Voilà un message adressé aux hommes afin qu’ils soient mis en garde, qu’ils sachent qu’Allah est la seule divinité digne d’être adorée et que les hommes doués de raison en tirent des leçons.",
      "bs": "Ovo je obznana ljudima, i da njome budu opomenuti, i da znaju da je samo On Jedan Bog, i da prime pouku oni koji razum imaju!",
      "ru": "Это — послание людям, чтобы они были им предостережены, и чтобы знали, что лишь Он — единственный Бог, и чтобы вняли назиданию обладатели разума."
    }
  },
  {
    "ref": "15:9",
    "sure": 15,
    "ayet": 9,
    "ar": "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَٰفِظُونَ",
    "mealler": {
      "tr": "Kur’an’ı şüphesiz biz indirdik. O’nu koruyacak olan da şüphesiz biziz.",
      "en": "Indeed, it is We who sent down the message [i.e., the Qur’ān], and indeed, We will be its guardian.",
      "de": "Gewiß, Wir sind es, die Wir die Ermahnung offenbart haben, und Wir werden wahrlich ihr Hüter sein.",
      "bs": "Mi, uistinu, Kur’an objavljujemo i zaista ćemo Mi nad njim bdjeti!",
      "ru": "Воистину, Мы ниспослали Напоминание, и, воистину, Мы его непременно оберегаем.",
      "ms": "Sesungguhnya Kamilah yang menurunkan Al-Quran, dan Kamilah yang memelihara dan menjaganya."
    }
  },
  {
    "ref": "15:86",
    "sure": 15,
    "ayet": 86,
    "ar": "إِنَّ رَبَّكَ هُوَ ٱلْخَلَّٰقُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Elbette Rabbin, her şeyi yaratandır, her şeyi bilendir.",
      "en": "Indeed, your Lord - He is the Knowing Creator.",
      "id": "Sungguh, Tuhanmu, Dialah Yang Maha Pencipta, Maha Mengetahui.",
      "de": "Dein Herr ist der Allerschaffer und der Allwissende.",
      "fr": "Ton Seigneur, en vérité, est le Créateur de toute chose, l’Omniscient.",
      "bs": "Gospodar tvoj sve stvara i On je Sveznajući.",
      "ru": "Воистину, твой Господь — Он непрестанно Творящий, Знающий.",
      "ms": "Sesungguhnya Tuhanmu, Dia lah yang menciptakan sekalian makhluk, lagi Yang Maha Mengetahui (akan hal mereka)."
    }
  },
  {
    "ref": "16:3",
    "sure": 16,
    "ayet": 3,
    "ar": "خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ بِٱلْحَقِّ تَعَٰلَىٰ عَمَّا يُشْرِكُونَ",
    "mealler": {
      "tr": "Gökleri ve yeri hak ile yarattı ve müşriklerin şirk koşmalarından çok yücedir/yüksektedir.",
      "en": "He created the heavens and earth in truth. High is He above what they associate with Him.",
      "id": "Dia menciptakan langit dan bumi dengan kebenaran. Mahatinggi Allah dari apa yang mereka persekutukan.",
      "de": "Er hat die Himmel und die Erde in Wahrheit erschaffen. Erhaben ist Er über das, was sie (Ihm) beigesellen.",
      "fr": "Il a créé les cieux et la terre selon une sagesse infinie. Il est bien au-dessus de tous les faux dieux qu’ils peuvent Lui associer.",
      "bs": "On je s Istinom nebesa i Zemlju stvorio, neka je On vrlo visoko iznad onoga što Mu pridružuju.",
      "ru": "Он сотворил небеса и землю с истиной. Превыше Он того, что они придают Ему в сотоварищи.",
      "ms": "Ia menciptakan langit dan bumi dengan cara yang sungguh layak dan berhikmat; Maha Tinggilah Ia dari perbuatan syirik yang mereka lakukan."
    }
  },
  {
    "ref": "16:10",
    "sure": 16,
    "ayet": 10,
    "ar": "هُوَ ٱلَّذِىٓ أَنزَلَ مِنَ ٱلسَّمَآءِ مَآءً لَّكُم مِّنْهُ شَرَابٌ وَمِنْهُ شَجَرٌ فِيهِ تُسِيمُونَ",
    "mealler": {
      "tr": "Sizin için gökten bir su indiren O'dur. O sudan içersiniz ve hayvanları otlatacağınız bitkileri de onunla yetiştirirsiniz.",
      "en": "It is He who sends down rain from the sky; from it is drink and from it is foliage in which you pasture [animals].",
      "id": "Dialah yang telah menurunkan air (hujan) dari langit untuk kamu, sebagiannya menjadi minuman dan sebagiannya (menyuburkan) tumbuhan, padanya kamu menggembalakan ternakmu.",
      "de": "Er ist es, Der vom Himmel Wasser herabkommen läßt; davon habt ihr zu trinken, und davon (wachsen) Bäume, unter denen ihr (euer Vieh) frei weiden laßt.",
      "fr": "C’est Lui qui fait descendre du ciel cette eau dont vous vous abreuvez et qui fait pousser par elle une végétation qui sert de pâturage à vos bestiaux.",
      "bs": "On spušta s neba vodu koju pijete i kojom se natapa rastinje kojim stoku napasate.",
      "ru": "Он — Тот, Кто ниспослал с неба воду: вам от неё — питьё, и от неё — растения, на которых вы выпасаете [скот]."
    }
  },
  {
    "ref": "16:11",
    "sure": 16,
    "ayet": 11,
    "ar": "يُنۢبِتُ لَكُم بِهِ ٱلزَّرْعَ وَٱلزَّيْتُونَ وَٱلنَّخِيلَ وَٱلْأَعْنَٰبَ وَمِن كُلِّ ٱلثَّمَرَٰتِ إِنَّ فِى ذَٰلِكَ لَـَٔايَةً لِّقَوْمٍ يَتَفَكَّرُونَ",
    "mealler": {
      "tr": "Allah, onunla size ekinler, zeytin ve hurma ağaçları, üzüm ve her türlü ürünü yetiştirir. Düşünen bir toplum için bunda ayetler vardır.",
      "en": "He causes to grow for you thereby the crops, olives, palm trees, grapevines, and of all the fruits. Indeed in that is a sign for a people who give thought.",
      "de": "Er läßt euch damit Getreide wachsen, und Ölbäume, Palmen, Rebstöcke und von allen Früchten. Darin ist wahrlich ein Zeichen für Leute, die nachdenken.",
      "fr": "Par elle encore, Il fait pousser pour vous céréales, oliviers, dattiers, vignes et toutes variétés d’arbres fruitiers. Voilà bien un signe pour des hommes capables de le méditer.",
      "bs": "On čini da vam pomoću nje raste žito, i masline, i palme, i grožđe, i svakovrsni plodovi – to je, zaista, dokaz za ljude koji razmišljaju.",
      "ru": "Ею Он взращивает для вас посевы, маслины, пальмы, виноград и всякие плоды. Воистину, в этом — знамение для людей, которые размышляют."
    }
  },
  {
    "ref": "16:22",
    "sure": 16,
    "ayet": 22,
    "ar": "إِلَٰهُكُمْ إِلَٰهٌ وَٰحِدٌ فَٱلَّذِينَ لَا يُؤْمِنُونَ بِٱلْـَٔاخِرَةِ قُلُوبُهُم مُّنكِرَةٌ وَهُم مُّسْتَكْبِرُونَ",
    "mealler": {
      "tr": "Sizin ilâhınız tek bir ilâhtır. Ahirete iman etmeyenlerin kalpleri bunu inkâr etmekte, kendileri de büyüklük taslamaktadırlar.",
      "en": "Your god is one God. But those who do not believe in the Hereafter - their hearts are disapproving, and they are arrogant.",
      "id": "Tuhan kamu adalah Tuhan Yang Maha Esa. Maka orang yang tidak beriman kepada akhirat, hati mereka mengingkari (keesaan Allah), dan mereka adalah orang yang sombong.",
      "de": "Euer Gott ist ein Einziger Gott. Diejenigen aber, die nicht an das Jenseits glauben, deren Herzen weisen (es) ab, und sie verhalten sich hochmütig.",
      "fr": "Votre véritable Dieu est un dieu unique. Vérité que renient les cœurs pétris d’orgueil de ceux qui ne croient pas en l’autre vie.",
      "bs": "Vaš Bog je – jedan Bog! Srca onih koji u onaj svijet ne vjeruju, poriču, oni se ohološću razmeću.",
      "ru": "Ваш Бог — Бог Единственный. А те, которые не веруют в Последнюю жизнь, — их сердца отвергают [это], и они проявляют высокомерие."
    }
  },
  {
    "ref": "16:48",
    "sure": 16,
    "ayet": 48,
    "ar": "أَوَلَمْ يَرَوْا۟ إِلَىٰ مَا خَلَقَ ٱللَّهُ مِن شَىْءٍ يَتَفَيَّؤُا۟ ظِلَٰلُهُۥ عَنِ ٱلْيَمِينِ وَٱلشَّمَآئِلِ سُجَّدًا لِّلَّهِ وَهُمْ دَٰخِرُونَ",
    "mealler": {
      "tr": "Allah’ın yarattığı şeylerin gölgelerinin zillet ve tevazu ile boyun eğerek durmadan sağa sola dönüp Allah’a secde ettiklerini görmüyorlar mı?",
      "en": "Have they not considered what things Allāh has created? Their shadows incline to the right and to the left, prostrating to Allāh, while they [i.e., those creations] are humble.",
      "id": "Dan apakah mereka tidak memperhatikan suatu benda yang diciptakan Allah, bayang-bayangnya berbolak-balik ke kanan dan ke kiri, dalam keadaan sujud kepada Allah, dan mereka (bersikap) rendah hati.",
      "de": "Haben sie nicht auf (all) die Dinge gesehen, die Allah erschaffen hat, wie sich ihre Schatten nach rechts und links wenden, indem sie sich demütigend vor Allah niederwerfen?",
      "fr": "Ne voient-ils pas les ombres de toutes choses créées par Allah s’étirer sur la droite et sur la gauche, se prosternant à leur manière, humblement soumises à leur Seigneur ?",
      "bs": "Zar oni ne vide da sve ono što je Allah stvorio sad desno, sad lijevo, pruža sjene svoje Allahu sedždu čineći i da je sve to pokorno?",
      "ru": "Неужели они не видели то, что сотворил Аллах? Их тени склоняются вправо и влево, падая ниц перед Аллахом, тогда как сами [эти творения] смиренны?"
    }
  },
  {
    "ref": "16:79",
    "sure": 16,
    "ayet": 79,
    "ar": "أَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ مُسَخَّرَٰتٍ فِى جَوِّ ٱلسَّمَآءِ مَا يُمْسِكُهُنَّ إِلَّا ٱللَّهُ إِنَّ فِى ذَٰلِكَ لَـَٔايَٰتٍ لِّقَوْمٍ يُؤْمِنُونَ",
    "mealler": {
      "tr": "Gök boşluğunda, boyun eğdirilmiş kuşları görmüyorlar mı? Onları, Allah’tan başka kimse tutmuyor. İşte bunda da iman eden bir toplum için ayetler/işaretler vardır.",
      "en": "Do they not see the birds controlled in the atmosphere of the sky? None holds them up except Allāh. Indeed in that are signs for a people who believe.",
      "de": "Haben sie nicht auf die Vögel gesehen, die im Luftraum des Himmels dienstbar gemacht worden sind? Nur Allah hält sie (oben). Darin sind wahrlich Zeichen für Leute, die glauben.",
      "fr": "Ne voient-ils pas les oiseaux voler entre ciel et terre par le pouvoir du Seigneur qui, seul, les maintient en l’air ? Voilà, pour des hommes qui ont la foi, des signes suffisamment clairs.",
      "bs": "Zar oni ne vide kako ptice u prostranstvu nebeskom bez muke lete, njih samo Allah drži. To su, zaista, dokazi ljudima koji budu vjerovali.",
      "ru": "Разве они не видели птиц, покорных в воздухе небес? Не удерживает их никто, кроме Аллаха. Воистину, в этом — знамения для людей, которые веруют."
    }
  },
  {
    "ref": "16:90",
    "sure": 16,
    "ayet": 90,
    "ar": "إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَٰنِ وَإِيتَآئِ ذِى ٱلْقُرْبَىٰ وَيَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ وَٱلْبَغْىِ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ",
    "mealler": {
      "tr": "Şüphesiz Allah; adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder; hayâsızlığı, fenalık ve azgınlığı da yasaklar. O, düşünüp tutasınız diye size öğüt veriyor.",
      "en": "Indeed, Allāh orders justice and good conduct and giving [help] to relatives and forbids immorality and bad conduct and oppression. He admonishes you that perhaps you will be reminded.",
      "de": "Allah gebietet Gerechtigkeit, gütig zu sein und den Verwandten zu geben; Er verbietet das Schändliche, das Verwerfliche und die Gewalttätigkeit. Er ermahnt euch, auf daß ihr bedenken möget.",
      "bs": "Allah zahtijeva da se svačije pravo poštuje, dobro čini, i da se bližnjima udjeljuje, a razvrat i sve što je odvratno i nasilje zabranjuje – da pouku primite, On vas savjetuje."
    }
  },
  {
    "ref": "16:96",
    "sure": 16,
    "ayet": 96,
    "ar": "مَا عِندَكُمْ يَنفَدُ وَمَا عِندَ ٱللَّهِ بَاقٍ وَلَنَجْزِيَنَّ ٱلَّذِينَ صَبَرُوٓا۟ أَجْرَهُم بِأَحْسَنِ مَا كَانُوا۟ يَعْمَلُونَ",
    "mealler": {
      "tr": "Sizin yanınızdaki tükenir, Allah katında olan ise kalıcıdır. Elbette sabredenlere, yapmakta olduklarının en güzeliyle mükâfatlarını vereceğiz.",
      "en": "Whatever you have will end, but what Allāh has is lasting. And We will surely give those who were patient their reward according to the best of what they used to do.",
      "de": "Was bei euch ist, geht zu Ende; was aber bei Allah ist, ist bleibend. Wir werden denjenigen, die standhaft sind, ganz gewiß mit ihrem Lohn das Beste vergelten von dem, was sie taten.",
      "bs": "Ono što je u vas – prolazno je, a ono što je u Allaha – vječno je. One koji su trpjeli Mi ćemo, sigurno, nagraditi mnogostrukom nagradom za ono što su činili.",
      "ru": "То, что у вас, иссякает, а то, что у Аллаха — остаётся. И Мы непременно воздадим тем, которые были терпеливы, их награду — по наилучшему из того, что они совершали."
    }
  },
  {
    "ref": "16:128",
    "sure": 16,
    "ayet": 128,
    "ar": "إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ",
    "mealler": {
      "tr": "Şüphesiz Allah, korkup, sakınanlar ve iyilik yapanlarla beraberdir.",
      "en": "Indeed, Allāh is with those who fear Him and those who are doers of good.",
      "id": "Sungguh, Allah beserta orang-orang yang bertakwa dan orang-orang yang berbuat kebaikan.",
      "de": "Gewiß, Allah ist mit denjenigen, die gottesfürchtig sind und Gutes tun.",
      "fr": "Allah, en vérité, est avec ceux qui fuient le péché et ne cessent de faire le bien.",
      "bs": "Allah je zaista na strani onih koji se Njega boje i koji dobra djela čine.",
      "ru": "Воистину, Аллах — с теми, которые богобоязненны, и с теми, которые добродетельны.",
      "ms": "Sesungguhnya Allah beserta orang-orang yang bertaqwa, dan orang-orang yang berusaha memperbaiki amalannya."
    }
  },
  {
    "ref": "17:22",
    "sure": 17,
    "ayet": 22,
    "ar": "لَّا تَجْعَلْ مَعَ ٱللَّهِ إِلَٰهًا ءَاخَرَ فَتَقْعُدَ مَذْمُومًا مَّخْذُولًا",
    "mealler": {
      "tr": "Allah ile birlikte bir başka ilah edinme! Yoksa, kınanmış ve terkedilmiş olursun.",
      "en": "Do not make [as equal] with Allāh another deity and [thereby] become censured and forsaken.",
      "id": "Janganlah engkau mengadakan tuhan yang lain di samping Allah, nanti engkau menjadi tercela dan terhina.",
      "de": "Setze neben Allah keinen anderen Gott, sonst wirst du gescholten und im Stich gelassen dasitzen.",
      "fr": "Garde-toi d’associer d’autres divinités à Allah, car tu serais à jamais réprouvé et abandonné.",
      "bs": "Ne stavljaj uz Allaha nekog drugog boga da ne bi osudu zaslužio i bez podrške ostao.",
      "ru": "Не устанавливай наряду с Аллахом другого бога, иначе останешься порицаемым, покинутым.",
      "ms": "Janganlah engkau adakan tuhan yang lain bersama Allah (dalam ibadatmu), kerana akibatnya engkau akan tinggal dalam keadaan tercela dan kecewa dari mendapat pertolongan."
    }
  },
  {
    "ref": "17:30",
    "sure": 17,
    "ayet": 30,
    "ar": "إِنَّ رَبَّكَ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ إِنَّهُۥ كَانَ بِعِبَادِهِۦ خَبِيرًۢا بَصِيرًا",
    "mealler": {
      "tr": "Rabbin dilediği kimsenin rızkını genişletir ve (dilediği kimsenin de) daraltır. Şüphesiz ki O, kullarından haberdardır, (onları) çok iyi görür.",
      "en": "Indeed, your Lord extends provision for whom He wills and restricts [it]. Indeed He is ever, concerning His servants, Aware and Seeing.",
      "id": "Sungguh, Tuhanmu melapangkan rezeki bagi siapa yang Dia kehendaki dan membatasi (bagi siapa yang Dia kehendaki); sungguh, Dia Maha Mengetahui, Maha Melihat hamba-hamba-Nya.",
      "de": "Gewiß, dein Herr gewährt die Versorgung großzügig, wem Er will, und bemißt auch. Gewiß, Er kennt und sieht Seine Diener wohl.",
      "fr": "Ton Seigneur dispense Ses faveurs à qui Il veut, comblant certaines de Ses créatures, accordant aux autres avec mesure. Il connaît parfaitement Ses serviteurs dont aucun secret ne Lui échappe.",
      "bs": "Gospodar tvoj pruža obilnu opskrbu onom kome hoće, a i ograničava je, jer zna i vidi robove Svoje.",
      "ru": "Воистину, твой Господь увеличивает удел кому пожелает и ограничивает его. Воистину, Он всегда был [и пребудет] о Своих рабах сведущим, видящим."
    }
  },
  {
    "ref": "17:66",
    "sure": 17,
    "ayet": 66,
    "ar": "رَّبُّكُمُ ٱلَّذِى يُزْجِى لَكُمُ ٱلْفُلْكَ فِى ٱلْبَحْرِ لِتَبْتَغُوا۟ مِن فَضْلِهِۦٓ إِنَّهُۥ كَانَ بِكُمْ رَحِيمًا",
    "mealler": {
      "tr": "Denizde lütfunu arayasınız diye gemileri sizin için yürüten Rabbinizdir. Çünkü O, size çok merhamet eder.",
      "en": "It is your Lord who drives the ship for you through the sea that you may seek of His bounty. Indeed, He is ever, to you, Merciful.",
      "id": "Tuhanmulah yang melayarkan kapal-kapal di lautan untukmu, agar kamu mencari karunia-Nya. Sungguh, Dia Maha Penyayang terhadapmu.",
      "de": "Euer Herr ist es, der für euch die Schiffe auf dem Meer sanft bewegt, damit ihr nach etwas von Seiner Huld trachtet. Gewiß, Er ist zu euch Barmherzig.",
      "fr": "C’est votre Seigneur qui, pour vous, fait voguer en mer les vaisseaux à bord desquels vous partez à la recherche de Ses faveurs. Il est, envers vous, Très Miséricordieux.",
      "bs": "Gospodar vaš, vas radi, pokreće lađe po moru da biste tražili Njegove blagodati, jer je On prema vama milostiv.",
      "ru": "Ваш Господь — Тот, Кто движет для вас корабли по морю, чтобы вы искали от Его щедрот. Воистину, Он всегда [был и пребудет] к вам милующим.",
      "ms": "Tuhan kamulah yang menjalankan untuk kamu kapal-kapal di laut, supaya kamu dapat mencari rezeki dari limpah kurniaNya; sesungguhnya Ia adalah Maha Mengasihani kepada kamu."
    }
  },
  {
    "ref": "18:7",
    "sure": 18,
    "ayet": 7,
    "ar": "إِنَّا جَعَلْنَا مَا عَلَى ٱلْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا",
    "mealler": {
      "tr": "İnsanların hangisi daha güzel amel işleyecek diye imtihan etmek için yeryüzünde bulunanları, oranın süsü yaptık.",
      "en": "Indeed, We have made that which is on the earth adornment for it that We may test them [as to] which of them is best in deed.",
      "id": "Sesungguhnya Kami telah menjadikan apa yang ada di bumi sebagai perhiasan baginya, untuk Kami menguji mereka, siapakah di antaranya yang terbaik perbuatannya.",
      "de": "Gewiß, Wir haben (alles), was auf der Erde ist, zu einem Schmuck für sie gemacht, um sie zu prüfen (und festzustellen), wer von ihnen die besten Taten begeht.",
      "fr": "Nous avons, en vérité, fait de ce que porte la terre une parure pour cette dernière afin de mettre les hommes à l’épreuve et de voir qui d’entre eux accomplira les œuvres les plus méritoires.",
      "bs": "Sve što je na Zemlji Mi smo kao ukras njoj stvorili da iskušamo ljude ko će od njih bolje postupati,",
      "ru": "Воистину, Мы сделали всё, что на земле, украшением для неё, чтобы испытать их — кто из них лучше по деяниям.",
      "ms": "Sesungguhnya Kami telah jadikan apa yang ada di muka bumi sebagai perhiasan baginya, kerana kami hendak menguji mereka, siapakah di antaranya yang lebih baik amalnya."
    }
  },
  {
    "ref": "18:30",
    "sure": 18,
    "ayet": 30,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا",
    "mealler": {
      "tr": "Gerçek şu ki, iman edip salih ameller yapanlara gelince, elbette biz iyi iş yapanların ecrini zayi etmeyiz.",
      "en": "Indeed, those who have believed and done righteous deeds - indeed, We will not allow to be lost the reward of any who did well in deeds.",
      "id": "Sungguh, mereka yang beriman dan mengerjakan kebajikan, Kami benar-benar tidak akan menyia-nyiakan pahala orang yang mengerjakan perbuatan yang baik itu.",
      "de": "Diejenigen, die glauben und rechtschaffene Werke tun - gewiß, Wir lassen den Lohn derer nicht verlorengehen, die die besten Taten begehen.",
      "fr": "Quant à ceux qui croient et accomplissent de bonnes œuvres, qu’ils sachent que Nous ne laisserons jamais se perdre la récompense de ceux qui font le bien.",
      "bs": "One koji budu vjerovali i dobra djela činili – a Mi, doista, ne uništavamo nagradu onome koji je dobra djela činio –",
      "ru": "Воистину, те, которые уверовали и совершали праведные деяния, —Мы не дадим пропасть награде тех, кто поступает добродетельно.",
      "ms": "Sebenarnya orang-orang yang beriman dan beramal soleh sudah tetap Kami tidak akan menghilangkan pahala orang-orang yang berusaha memperbaiki amalnya."
    }
  },
  {
    "ref": "19:40",
    "sure": 19,
    "ayet": 40,
    "ar": "إِنَّا نَحْنُ نَرِثُ ٱلْأَرْضَ وَمَنْ عَلَيْهَا وَإِلَيْنَا يُرْجَعُونَ",
    "mealler": {
      "tr": "Arza ve üzerindekilere elbet biz mirasçı oluruz ve yalnız bize döndürülürler.",
      "en": "Indeed, it is We who will inherit the earth and whoever is on it, and to Us they will be returned.",
      "de": "Gewiß, Wir sind es, die Wir die Erde und (all die,) die auf ihr sind, erben werden. Und zu Uns werden sie zurückgebracht.",
      "fr": "C’est Nous qui hériterons de la terre et de ceux qui la peuplent, c’est à Nous qu’ils seront tous ramenés.",
      "bs": "Mi ćemo Zemlju i one koji žive na njoj naslijediti i Nama će se oni vratiti.",
      "ru": "Воистину, Мы унаследуем землю и тех, кто на ней, и к Нам они будут возвращены.",
      "ms": "Sesungguhnya Kamilah yang mewarisi bumi dan segala makhluk yang ada di atasnya; dan kepada Kamilah mereka akan dikembalikan."
    }
  },
  {
    "ref": "19:67",
    "sure": 19,
    "ayet": 67,
    "ar": "أَوَلَا يَذْكُرُ ٱلْإِنسَٰنُ أَنَّا خَلَقْنَٰهُ مِن قَبْلُ وَلَمْ يَكُ شَيْـًٔا",
    "mealler": {
      "tr": "İnsan, daha önce hiçbir şey değilken kendisini yarattığımızı hiç düşünmüyor mu?",
      "en": "Does man not remember that We created him before, while he was nothing?",
      "id": "Dan tidakkah manusia itu memikirkan bahwa sesungguhnya Kami telah menciptakannya dahulu, padahal (sebelumnya) dia belum berwujud sama sekali?",
      "de": "Gedenkt der Mensch denn nicht, daß Wir ihn zuvor erschaffen haben, da er (noch) nichts war?",
      "fr": "L’homme ne se souvient-il pas que Nous l’avons, avant cela, tiré du néant ?",
      "bs": "A zar se čovjek ne sjeća da smo ga još prije stvorili, a da nije bio ništa?",
      "ru": "Неужели человек не вспомнит, что Мы сотворили его прежде, тогда как прежде он был ничем?",
      "ms": "Patutkah manusia itu berkata demikian dan tidak memikirkan bahawa Kami telah menciptakan dia dahulu sedang ia pada masa itu belum ada sebarang apapun?"
    }
  },
  {
    "ref": "19:93",
    "sure": 19,
    "ayet": 93,
    "ar": "إِن كُلُّ مَن فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ إِلَّآ ءَاتِى ٱلرَّحْمَٰنِ عَبْدًا",
    "mealler": {
      "tr": "Göklerde ve yerde kim varsa hepsi Rahman’ın huzuruna ancak kul olarak gelir.",
      "en": "There is no one in the heavens and earth but that he comes to the Most Merciful as a servant.",
      "id": "Tidak ada seorang pun di langit dan di bumi, melainkan akan datang kepada (Allah) Yang Maha Pengasih sebagai seorang hamba.",
      "de": "Niemand in den Himmeln und auf der Erde wird zum Allerbarmer anders denn als Diener kommen (können).",
      "fr": "Tous les êtres qui peuplent les cieux et la terre se présenteront en toute soumission devant le Tout Miséricordieux.",
      "bs": "Svi će, i oni na nebesima i oni na Zemlji, kao robovi u Milostivog tražiti utočište!",
      "ru": "Нет никого в небесах и на земле, кто не предстанет пред Всемилостивым как раб.",
      "ms": "Tidak ada sesiapapun di langit dan di bumi melainkan ia akan datang kepada (Allah) Ar-Rahman, sebagai hamba."
    }
  },
  {
    "ref": "20:6",
    "sure": 20,
    "ayet": 6,
    "ar": "لَهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ وَمَا بَيْنَهُمَا وَمَا تَحْتَ ٱلثَّرَىٰ",
    "mealler": {
      "tr": "Göklerde, yerde ve ikisinin arasında ve toprağın altında olan her şey O’nundur.",
      "en": "To Him belongs what is in the heavens and what is on the earth and what is between them and what is under the soil.",
      "id": "Milik-Nyalah apa yang ada di langit, apa yang ada di bumi, apa yang ada di antara keduanya, dan apa yang ada di bawah tanah.",
      "de": "Ihm gehört (alles), was in den Himmeln und was auf der Erde ist und was dazwischen und was unter dem (feuchten) Erdreich ist.",
      "fr": "Il possède tout ce qui se trouve dans les cieux, sur la terre et entre eux, ainsi que ce qui se trouve sous terre.",
      "bs": "Njegovo je što je na nebesima i na Zemlji i što je između njih i što je pod zemljom!",
      "ru": "Ему принадлежит всё, что в небесах, всё, что на земле, всё, что между ними, и всё, что под землёй.",
      "ms": "Dia lah jua yang memiliki segala yang ada di langit dan yang ada di bumi serta yang ada di antara keduanya dan juga yang ada di bawah tanah basah di perut bumi."
    }
  },
  {
    "ref": "20:8",
    "sure": 20,
    "ayet": 8,
    "ar": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ لَهُ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ",
    "mealler": {
      "tr": "Allah odur ki Ondan başka (hak) ilâh yoktur. En güzel isimler yalnız Onundur.",
      "en": "Allāh - there is no deity except Him. To Him belong the best names.",
      "id": "(Dialah) Allah, tidak ada tuhan selain Dia, yang mempunyai nama-nama yang terbaik.",
      "de": "Allah - es gibt keinen Gott außer Ihm. Sein sind die schönsten Namen.",
      "fr": "Il est le vrai Dieu et la seule divinité digne d’être adorée. Il possède les noms les plus sublimes.",
      "bs": "Allah, drugog boga osim Njega nema, najljepša imena ima!",
      "ru": "Аллах — нет божества, кроме Него. У Него — самые прекрасные имена.",
      "ms": "Allah! Tiada Tuhan yang berhak disembah melainkan Dia, bagiNyalah segala nama yang baik."
    }
  },
  {
    "ref": "20:55",
    "sure": 20,
    "ayet": 55,
    "ar": "مِنْهَا خَلَقْنَٰكُمْ وَفِيهَا نُعِيدُكُمْ وَمِنْهَا نُخْرِجُكُمْ تَارَةً أُخْرَىٰ",
    "mealler": {
      "tr": "Sizi topraktan yarattık, sizi oraya döndüreceğiz ve sizi bir kere daha oradan çıkaracağız.",
      "en": "From it [i.e., the earth] We created you, and into it We will return you, and from it We will extract you another time.",
      "id": "Darinya (tanah) itulah Kami menciptakan kamu dan kepadanyalah Kami akan mengembalikan kamu dan dari sanalah Kami akan mengeluarkan kamu pada waktu yang lain.",
      "de": "Aus ihr haben Wir euch erschaffen, und in sie bringen Wir euch zurück, und aus ihr bringen Wir euch ein anderes Mal hervor.",
      "fr": "Nous vous avons créés de cette terre où Nous vous ferons retourner et dont Nous vous ferons sortir une nouvelle fois.",
      "bs": "Od zemlje vas stvaramo i u nju vas vraćamo i iz nje ćemo vas po drugi put izvesti.",
      "ru": "Из неё Мы сотворили вас, и в неё вернём вас, и из неё выведем вас ещё раз».",
      "ms": "Dari bumilah Kami ciptakan kamu, dan ke dalamnya Kami akan mengembalikan kamu, dan daripadanya pula Kami akan mengeluarkan kamu sekali lagi."
    }
  },
  {
    "ref": "21:19",
    "sure": 21,
    "ayet": 19,
    "ar": "وَلَهُۥ مَن فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَمَنْ عِندَهُۥ لَا يَسْتَكْبِرُونَ عَنْ عِبَادَتِهِۦ وَلَا يَسْتَحْسِرُونَ",
    "mealler": {
      "tr": "Göklerde ve yerde kim varsa Allah'ındır. O’nun katındakiler, O'na ibadet hususunda kibirlenmez ve yorulmazlar.",
      "en": "To Him belongs whoever is in the heavens and the earth. And those near Him [i.e., the angels] are not prevented by arrogance from His worship, nor do they tire.",
      "id": "Dan milik-Nya siapa yang di langit dan di bumi. Dan (malaikat-malaikat) yang di sisi-Nya, tidak mempunyai rasa angkuh untuk menyembah-Nya dan tidak (pula) merasa letih.",
      "de": "Ihm gehört, wer in den Himmeln und auf der Erde ist. Und diejenigen, die bei Ihm sind, sind weder zu hochmütig, Ihm zu dienen, noch werden sie (dessen) müde.",
      "fr": "Il est le Maître de tous les êtres qui peuplent les cieux et la terre. Les anges qui se trouvent auprès de Lui ne refusent jamais par orgueil de L’adorer et ne se lassent jamais de Le vénérer.",
      "bs": "Njegovo je ono što je na nebesima i na Zemlji! A oni koji su kod Njega ne zaziru da Ga obožavaju i ne zamaraju se.",
      "ru": "Ему принадлежат все, кто в небесах и на земле. И те, кто у Него, не превозносятся над поклонением Ему и не устают."
    }
  },
  {
    "ref": "21:22",
    "sure": 21,
    "ayet": 22,
    "ar": "لَوْ كَانَ فِيهِمَآ ءَالِهَةٌ إِلَّا ٱللَّهُ لَفَسَدَتَا فَسُبْحَٰنَ ٱللَّهِ رَبِّ ٱلْعَرْشِ عَمَّا يَصِفُونَ",
    "mealler": {
      "tr": "Eğer yerde ve gökte Allah’tan başka ilâhlar olsaydı, kesinlikle ikisinin de düzeni bozulurdu. Demek ki, Arş’ın Rabbi Allah, onların vasfettiği sıfatlardan münezzeh ve yücedir.",
      "en": "Had there been within them [i.e., the heavens and earth] gods besides Allāh, they both would have been ruined. So exalted is Allāh, Lord of the Throne, above what they describe.",
      "id": "Seandainya pada keduanya (di langit dan di bumi) ada tuhan-tuhan selain Allah, tentu keduanya telah binasa. Mahasuci Allah yang memiliki Arasy, dari apa yang mereka sifatkan.",
      "de": "Wenn es in ihnen beiden andere Götter als Allah gäbe, gerieten sie (beide) wahrlich ins Verderben. Preis sei Allah, dem Herrn des Thrones! (Erhaben ist Er) über das, was sie (Ihm) zuschreiben.",
      "fr": "S’il se trouvait au ciel ou sur terre d’autres divinités qu’Allah, tous deux seraient livrés au chaos. Gloire donc à Allah, Maître du Trône, que leurs blasphèmes ne sauraient atteindre !",
      "bs": "Da Zemljom i nebesima upravljaju drugi bogovi, a ne Allah, poremetili bi se. Pa neka je uzvišen Allah, Gospodar Arša, od onog što Mu pripisuju!",
      "ru": "Если бы на небесах и земле были боги, кроме Аллаха, то они непременно разрушились бы. Пречист Аллах, Господь Трона, превыше того, что они Ему приписывают!"
    }
  },
  {
    "ref": "21:30",
    "sure": 21,
    "ayet": 30,
    "ar": "أَوَلَمْ يَرَ ٱلَّذِينَ كَفَرُوٓا۟ أَنَّ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَٰهُمَا وَجَعَلْنَا مِنَ ٱلْمَآءِ كُلَّ شَىْءٍ حَىٍّ أَفَلَا يُؤْمِنُونَ",
    "mealler": {
      "tr": "Kâfirler, görmez mi ki gökler ve yer birleşik iken onları (biz) ayırdık ve her şeye sudan hayat verdik. Hâlâ iman etmezler mi?",
      "en": "Have those who disbelieved not considered that the heavens and the earth were a joined entity, and then We separated them and made from water every living thing? Then will they not believe?",
      "bs": "Zar ne znaju nevjernici da su nebesa i Zemlja bili jedna cjelina, pa smo ih Mi raskomadali, i da Mi od vode sve živo stvaramo? I zar neće vjerovati?",
      "ru": "Неужели те, которые отвергли веру, не видели, что небеса и земля были единым целым, а Мы разъединили их и создали из воды всё живое? Неужели они не уверуют?"
    }
  },
  {
    "ref": "21:35",
    "sure": 21,
    "ayet": 35,
    "ar": "كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ وَنَبْلُوكُم بِٱلشَّرِّ وَٱلْخَيْرِ فِتْنَةً وَإِلَيْنَا تُرْجَعُونَ",
    "mealler": {
      "tr": "Her nefis ölümü tadıcıdır. Biz sizi şer ve hayırla imtihan olmak üzere deneriz. Sonunda bize döndürüleceksiniz.",
      "en": "Every soul will taste death. And We test you with evil and with good as trial; and to Us you will be returned.",
      "id": "Setiap yang bernyawa akan merasakan mati. Kami akan menguji kamu dengan keburukan dan kebaikan sebagai cobaan. Dan kamu akan dikembalikan hanya kepada Kami.",
      "de": "Jede Seele wird den Tod kosten. Und Wir prüfen euch mit Schlechtem und Gutem als Versuchung. Und zu Uns werdet ihr zurückgebracht.",
      "bs": "Svako živo biće smrt će okusiti! Mi vas stavljamo na kušnju i u zlu i u dobru i Nama ćete se vratiti.",
      "ru": "Каждая душа вкусит смерть. Мы подвергаем вас испытанию злом и добром, и к Нам вы будете возвращены.",
      "ms": "Tiap-tiap diri akan merasai mati, dan Kami menguji kamu dengan kesusahan dan kesenangan sebagai cubaan; dan kepada Kamilah kamu semua akan dikembalikan."
    }
  },
  {
    "ref": "22:14",
    "sure": 22,
    "ayet": 14,
    "ar": "إِنَّ ٱللَّهَ يُدْخِلُ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ جَنَّٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَٰرُ إِنَّ ٱللَّهَ يَفْعَلُ مَا يُرِيدُ",
    "mealler": {
      "tr": "Muhakkak ki Allah, iman edip salih ameller işleyenleri içinden ırmaklar akan cennetlere koyacaktır. Şüphesiz Allah, dilediğini yapar.",
      "en": "Indeed, Allāh will admit those who believe and do righteous deeds to gardens beneath which rivers flow. Indeed, Allāh does what He intends.",
      "id": "(Sungguh), Allah akan memasukkan orang-orang yang beriman dan mengerjakan kebajikan ke dalam surga-surga yang mengalir di bawahnya sungai-sungai. Sungguh, Allah berbuat apa yang Dia kehendaki.",
      "de": "Gewiß, Allah läßt diejenigen, die glauben und rechtschaffene Werke tun, in Gärten eingehen, durcheilt von Bächen. Gewiß, Allah tut, was Er will.",
      "fr": "Quant aux croyants qui accomplissent de bonnes œuvres, Allah les admettra dans des jardins traversés de rivières. Allah agit toujours comme Il l’entend.",
      "bs": "Allah će one koji vjeruju i čine dobra djela, zaista, uvesti u džennetske bašče kroz koje rijeke teku. – Allah radi ono što hoće!",
      "ru": "Воистину, Аллах введёт тех, которые уверовали и совершали праведные деяния, в сады, внизу которых текут реки. Воистину, Аллах вершит то, что пожелает.",
      "ms": "Sesungguhnya Allah akan memasukkan orang-orang yang beriman dan beramal soleh ke dalam Syurga yang mengalir di bawahnya beberapa sungai; sesungguhnya Allah melakukan apa yang ditentukanNya."
    }
  },
  {
    "ref": "22:38",
    "sure": 22,
    "ayet": 38,
    "ar": "إِنَّ ٱللَّهَ يُدَٰفِعُ عَنِ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ ٱللَّهَ لَا يُحِبُّ كُلَّ خَوَّانٍ كَفُورٍ",
    "mealler": {
      "tr": "Hiç şüphesiz Allah, iman edenleri savunur. Gerçekten Allah, hain ve nankör olan kimseyi sevmez.",
      "en": "Indeed, Allāh defends those who have believed. Indeed, Allāh does not like everyone treacherous and ungrateful.",
      "id": "Sesungguhnya Allah membela orang yang beriman. Sungguh, Allah tidak menyukai setiap orang yang berkhianat dan kufur nikmat.",
      "de": "Gewiß, Allah verteidigt diejenigen, die glauben. Gewiß, Allah liebt keinen undankbaren Verräter.",
      "fr": "Allah protégera toujours les croyants contre leurs ennemis. Allah n’aime pas les hommes sans fidélité et sans foi.",
      "bs": "Allah, doista, štiti vjernike, Allah sigurno ne voli nijednog izdajnika, nezahvalnika.",
      "ru": "Воистину, Аллах защищает тех, которые уверовали. Воистину, Аллах не любит всякого вероломного, неблагодарного.",
      "ms": "Sesungguhnya Allah membela orang-orang yang beriman; sesungguhnya Allah tidak suka kepada tiap-tiap seorang yang khianat, lagi tidak bersyukur."
    }
  },
  {
    "ref": "22:64",
    "sure": 22,
    "ayet": 64,
    "ar": "لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ وَإِنَّ ٱللَّهَ لَهُوَ ٱلْغَنِىُّ ٱلْحَمِيدُ",
    "mealler": {
      "tr": "Göklerdeki her şey, yerdeki her şey O’nundur. Şüphesiz Allah, hiç bir şeye ihtiyacı olmayandır, elbette övgüye lâyıktır.",
      "en": "To Him belongs what is in the heavens and what is on the earth. And indeed, Allāh is the Free of need, the Praiseworthy.",
      "id": "Milik-Nyalah apa yang ada di langit dan apa yang ada di bumi. Dan Allah benar-benar Mahakaya, Maha Terpuji.",
      "de": "Ihm gehört (alles), was in den Himmeln und was auf der Erde ist; Allah ist wahrlich der Unbedürftige und Lobenswürdige.",
      "fr": "Il possède tout ce qui se trouve dans les cieux et sur la terre. Allah, en vérité, est Celui qui peut parfaitement se passer des hommes et qui est digne de toutes les louanges.",
      "bs": "Njegovo je ono što je na nebesima i ono što je na Zemlji! Allah, doista, nije ni o kome ovisan, i On je Hvaljeni.",
      "ru": "Ему принадлежит всё, что в небесах, и всё, что на земле. И воистину, Аллах — Он Богатый, Достохвальный.",
      "ms": "Segala yang ada di langit dan di bumi adalah kepunyaanNya. Dan sesungguhnya Allah, Dia lah jua Yang Maha Kaya, lagi Maha Terpuji."
    }
  },
  {
    "ref": "22:75",
    "sure": 22,
    "ayet": 75,
    "ar": "ٱللَّهُ يَصْطَفِى مِنَ ٱلْمَلَٰٓئِكَةِ رُسُلًا وَمِنَ ٱلنَّاسِ إِنَّ ٱللَّهَ سَمِيعٌۢ بَصِيرٌ",
    "mealler": {
      "tr": "Allah, meleklerden de rasûller seçer, insanlardan da. Şüphesiz Allah, hakkıyla işitendir, hakkıyla görendir.",
      "en": "Allāh chooses from the angels messengers and from the people. Indeed, Allāh is Hearing and Seeing.",
      "id": "Allah memilih para utusan(-Nya) dari malaikat dan dari manusia. Sesungguhnya Allah Maha Mendengar, Maha Melihat.",
      "de": "Allah erwählt Sich aus den Engeln Gesandte, und (auch) aus den Menschen. Gewiß, Allah ist Allhörend und Allsehend.",
      "fr": "Allah choisit des messagers parmi les anges et les hommes. Allah entend tout et voit tout.",
      "bs": "Allah odabire poslanike među melekima i ljudima. – Allah sve čuje i sve vidi.",
      "ru": "Аллах избирает посланников из числа ангелов и из числа людей. Воистину, Аллах — слышащий, видящий.",
      "ms": "Allah memilih utusan-utusanNya dari malaikat dan dari manusia; sesungguhnya Allah Maha Mendengar, lagi Maha Mengetahui."
    }
  },
  {
    "ref": "22:77",
    "sure": 22,
    "ayet": 77,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱرْكَعُوا۟ وَٱسْجُدُوا۟ وَٱعْبُدُوا۟ رَبَّكُمْ وَٱفْعَلُوا۟ ٱلْخَيْرَ لَعَلَّكُمْ تُفْلِحُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Rüku edin, secde edin, Rabbinize ibadet edin, hayır işleyin ki kurtuluşa eresiniz.",
      "en": "O you who have believed, bow and prostrate and worship your Lord and do good - that you may succeed.",
      "id": "Wahai orang-orang yang beriman! Rukuklah, sujudlah, dan sembahlah Tuhanmu; dan berbuatlah kebaikan, agar kamu beruntung.",
      "de": "O die ihr glaubt, verbeugt euch, werft euch nieder und dient eurem Herrn und tut das Gute, auf daß es euch wohl ergehen möge!",
      "fr": "Vous qui croyez ! Inclinez-vous et prosternez-vous en prière. Vouez à votre Seigneur un culte exclusif et sincère et faites le bien dans l’espoir de faire votre bonheur et votre salut.",
      "bs": "O vjernici, pred Allahom se sagibajte i čelima po tlu padajte, Gospodara svog obožavajte i dobra djela činite da biste postigli ono što želite.",
      "ru": "О вы, которые уверовали! Кланяйтесь и падайте ниц, поклоняйтесь своему Господу и совершайте добро, — быть может, вы преуспеете."
    }
  },
  {
    "ref": "24:44",
    "sure": 24,
    "ayet": 44,
    "ar": "يُقَلِّبُ ٱللَّهُ ٱلَّيْلَ وَٱلنَّهَارَ إِنَّ فِى ذَٰلِكَ لَعِبْرَةً لِّأُو۟لِى ٱلْأَبْصَٰرِ",
    "mealler": {
      "tr": "Allah, gece ve gündüzü çevirip birbirinin ardından getirir. Doğrusu basiret sahibi olanlar için bunda ibretler vardır.",
      "en": "Allāh alternates the night and the day. Indeed in that is a lesson for those who have vision.",
      "id": "Allah mempergantikan malam dan siang. Sungguh pada yang demikian itu, pasti terdapat pelajaran bagi orang-orang yang mempunyai penglihatan (yang tajam).",
      "de": "Allah läßt Nacht und Tag sich abwechseln. Darin ist wahrlich eine Lehre für diejenigen, die Einsicht besitzen.",
      "fr": "Allah fait alterner le jour et la nuit. Voilà bien une preuve de Sa toute-puissance pour des esprits pleins de clairvoyance.",
      "bs": "On čini da noć i dan naizmjenice nastupaju i u tome je, doista, pouka za one koji pameti imaju.",
      "ru": "Аллах чередует ночь и день. Воистину, в этом — поучительный пример для обладающих зрением.",
      "ms": "Allah menukarkan malam dan siang silih berganti; sesungguhnya yang demikian mengandungi pelajaran yang mendatangkan iktibar bagi orang-orang yang celik mata hatinya berfikir."
    }
  },
  {
    "ref": "24:46",
    "sure": 24,
    "ayet": 46,
    "ar": "لَّقَدْ أَنزَلْنَآ ءَايَٰتٍ مُّبَيِّنَٰتٍ وَٱللَّهُ يَهْدِى مَن يَشَآءُ إِلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ",
    "mealler": {
      "tr": "Andolsun, biz apaçık ayetler indirdik. Allah, dilediği kimseyi dosdoğru yola hidayet eder (yöneltir).",
      "en": "We have certainly sent down distinct verses. And Allāh guides whom He wills to a straight path.",
      "id": "Sungguh, Kami telah menurunkan ayat-ayat yang memberi penjelasan. Dan Allah memberi petunjuk siapa yang Dia kehendaki ke jalan yang lurus.",
      "de": "Wir haben ja Zeichen hinabgesandt, die (alles) klar machen. Und Allah leitet, wen Er will, zu einem geraden Weg.",
      "fr": "Nous avons, en vérité, révélé des versets d’une grande clarté. Allah met cependant qui Il veut sur le droit chemin.",
      "bs": "Mi objavljujemo ajete jasne. A Allah ukazuje na Pravi put onom kome On hoće.",
      "ru": "Действительно, Мы ниспослали разъясняющие аяты. А Аллах наставляет, кого пожелает, к прямому пути."
    }
  },
  {
    "ref": "24:51",
    "sure": 24,
    "ayet": 51,
    "ar": "إِنَّمَا كَانَ قَوْلَ ٱلْمُؤْمِنِينَ إِذَا دُعُوٓا۟ إِلَى ٱللَّهِ وَرَسُولِهِۦ لِيَحْكُمَ بَيْنَهُمْ أَن يَقُولُوا۟ سَمِعْنَا وَأَطَعْنَا وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
    "mealler": {
      "tr": "Aralarında hüküm verilmek üzere Allah’a ve Rasûlüne çağrılan Müminlerin sözü sadece; “İşittik ve itaat ettik”dir. İşte asıl bunlar kurtuluşa erenlerdir.",
      "en": "The only statement of the [true] believers when they are called to Allāh and His Messenger to judge between them is that they say, \"We hear and we obey.\" And those are the successful.",
      "bs": "Kad se vjernici Allahu i Poslaniku Njegovu pozovu da im presudi, samo reknu: “Slušamo i pokoravamo se!” Oni će uspjeti.",
      "ru": "Воистину, слово верующих, когда их призывают к Аллаху и Его Посланнику, чтобы он рассудил между ними, — лишь то, что они говорят: «Мы услышали и повиновались». И такие и есть преуспевшие."
    }
  },
  {
    "ref": "25:61",
    "sure": 25,
    "ayet": 61,
    "ar": "تَبَارَكَ ٱلَّذِى جَعَلَ فِى ٱلسَّمَآءِ بُرُوجًا وَجَعَلَ فِيهَا سِرَٰجًا وَقَمَرًا مُّنِيرًا",
    "mealler": {
      "tr": "Gökte yıldızlar/gezegenler yaratan ve orada bir kandil (Güneş) ve aydınlatıcı bir Ay var eden (Allah) çok yücedir.",
      "en": "Blessed is He who has placed in the sky great stars and placed therein a [burning] lamp and luminous moon.",
      "id": "Mahasuci Allah yang menjadikan di langit gugusan bintang-bintang dan Dia juga menjadikan padanya matahari dan bulan yang bersinar.",
      "de": "Segensreich ist Derjenige, Der im Himmel Türme gesetzt und darin einen Lichtkörper und einen leuchtenden Mond gesetzt hat!",
      "bs": "Neka je uzvišen Onaj Koji je na nebu sazviježđa stvorio i na njemu dao svjetiljku i Mjesec koji sija.",
      "ru": "Благословен Тот, Кто создал в небе созвездия, и создал в нём светоч и сияющую луну.",
      "ms": "Maha Berkat Tuhan yang telah menjadikan di langit, tempat-tempat peredaran bintang, dan menjadikan padanya matahari serta bulan yang menerangi."
    }
  },
  {
    "ref": "26:220",
    "sure": 26,
    "ayet": 220,
    "ar": "إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Şüphesiz O; hakkıyla işitendir, hakkıyla bilendir.",
      "en": "Indeed, He is the Hearing, the Knowing.",
      "id": "Sungguh, Dia Maha Mendengar, Maha Mengetahui.",
      "de": "Er ist ja der Allhörende und Allwissende.",
      "fr": "Il est Celui qui entend tout et sait tout.",
      "bs": "jer On, doista, sve čuje i sve zna.",
      "ru": "Воистину, Он — Слышащий, Знающий.",
      "ms": "Sesungguhnya Dia lah jua yang Maha Mendengar, lagi Maha Mengetahui."
    }
  },
  {
    "ref": "27:86",
    "sure": 27,
    "ayet": 86,
    "ar": "أَلَمْ يَرَوْا۟ أَنَّا جَعَلْنَا ٱلَّيْلَ لِيَسْكُنُوا۟ فِيهِ وَٱلنَّهَارَ مُبْصِرًا إِنَّ فِى ذَٰلِكَ لَـَٔايَٰتٍ لِّقَوْمٍ يُؤْمِنُونَ",
    "mealler": {
      "tr": "Bizim geceyi o vakitte dinlensinler diye yarattığımızı, gündüzü de aydınlık kıldığımızı görmediler mi? İşte bunda iman eden bir toplum için ayetler/deliller vardır.",
      "en": "Do they not see that We made the night that they may rest therein and the day giving sight? Indeed in that are signs for a people who believe.",
      "de": "Sehen sie nicht, daß Wir die Nacht gemacht haben, damit sie in ihr ruhen, und den Tag hell? Darin sind wahrlich Zeichen für Leute, die glauben.",
      "fr": "Ne voient-ils pas que Nous avons établi l’obscurité de la nuit pour leur repos et la lumière du jour pour leurs activités. Voilà des signes suffisamment clairs pour des hommes de foi.",
      "bs": "Zar nisu vidjeli da smo učinili noć da u njoj otpočinu, a dan vidnim? To su, zaista, dokazi za narod koji vjeruje.",
      "ru": "Неужели они не видят, что Мы сделали ночь, чтобы они могли обрести в ней покой, и день — позволяющим видеть? Воистину, в этом — знамения для людей, которые веруют."
    }
  },
  {
    "ref": "27:89",
    "sure": 27,
    "ayet": 89,
    "ar": "مَن جَآءَ بِٱلْحَسَنَةِ فَلَهُۥ خَيْرٌ مِّنْهَا وَهُم مِّن فَزَعٍ يَوْمَئِذٍ ءَامِنُونَ",
    "mealler": {
      "tr": "Kim iyilik getirirse ona ondan daha hayırlısı vardır. Ve onlar o gün, korkudan güvendedirler.",
      "en": "Whoever comes [at Judgement] with a good deed will have better than it, and they, from the terror of that Day, will be safe.",
      "id": "Barangsiapa membawa kebaikan, maka dia memperoleh (balasan) yang lebih baik daripadanya, sedang mereka merasa aman dari kejutan (yang dahsyat) pada hari itu.",
      "de": "Wer mit einer guten Tat kommt, wird etwas Besseres als sie erhalten. Und sie sind vor (jedem) Schrecken an jenem Tag in Sicherheit.",
      "fr": "Ceux qui se présenteront avec de bonnes œuvres recevront une récompense bien supérieure et seront, ce Jour-là, préservés de toute frayeur.",
      "bs": "Ko učini dobro djelo, dobit će veliku nagradu za njega i bit će straha na Sudnjem danu pošteđen.",
      "ru": "Кто явится с добрым деянием, тому будет [воздано] лучшим, чем оно, и они в тот день будут в безопасности от ужаса."
    }
  },
  {
    "ref": "28:83",
    "sure": 28,
    "ayet": 83,
    "ar": "تِلْكَ ٱلدَّارُ ٱلْـَٔاخِرَةُ نَجْعَلُهَا لِلَّذِينَ لَا يُرِيدُونَ عُلُوًّا فِى ٱلْأَرْضِ وَلَا فَسَادًا وَٱلْعَٰقِبَةُ لِلْمُتَّقِينَ",
    "mealler": {
      "tr": "İşte ahiret yurdu. Biz, onu yeryüzünde büyüklük taslamayan ve bozgunculuk çıkarmayanlara has kılarız. Sonuç, Allah’a karşı gelmekten sakınanlarındır.",
      "en": "That home of the Hereafter We assign to those who do not desire exaltedness upon the earth or corruption. And the [best] outcome is for the righteous.",
      "de": "Das ist die jenseitige Wohnstätte. Wir bestimmen sie für diejenigen, die weder Überheblichkeit auf der Erde noch Unheil begehren. Und das (gute) Ende gehört den Gottesfürchtigen.",
      "fr": "Nous destinons cette demeure dernière à ceux qui ne cherchent ni à s’élever sur terre, ni à commettre le péché. Ce sont en effet ceux qui craignent le Seigneur qui connaîtront une fin heureuse.",
      "bs": "Taj drugi svijet dat ćemo onima koji se ne žele na Zemlji oholiti i nered činiti, a one koji se Allaha boje čeka sretan kraj.",
      "ru": "Ту Последнюю обитель Мы предназначаем тем, кто не желает ни превознесения на земле, ни беззакония. А благой итог — для богобоязненных."
    }
  },
  {
    "ref": "29:2",
    "sure": 29,
    "ayet": 2,
    "ar": "أَحَسِبَ ٱلنَّاسُ أَن يُتْرَكُوٓا۟ أَن يَقُولُوٓا۟ ءَامَنَّا وَهُمْ لَا يُفْتَنُونَ",
    "mealler": {
      "tr": "İnsanlar; “İman ettik.” demekle, bir imtihana tabi tutulmadan bırakılacaklarını mı sanıyorlar?",
      "en": "Do the people think that they will be left to say, \"We believe\" and they will not be tried?",
      "id": "Apakah manusia mengira bahwa mereka akan dibiarkan hanya dengan mengatakan, \"Kami telah beriman,\" dan mereka tidak diuji?",
      "de": "Meinen die Menschen, daß sie in Ruhe gelassen werden, (nur) weil sie sagen: „Wir glauben, ohne daß sie geprüft werden?",
      "fr": "Les hommes pensent-ils que Nous les laisserons affirmer qu’ils croient sans éprouver leur foi ?",
      "bs": "Misle li ljudi da će biti ostavljeni na miru ako kažu: “Mi vjerujemo!”, i da u iskušenje neće biti dovedeni?",
      "ru": "Неужели люди полагали, что их оставят только за то, что они скажут: «Мы уверовали», тогда как они не будут подвергнуты испытанию?",
      "ms": "Patutkah manusia menyangka bahawa mereka akan dibiarkan dengan hanya berkata: “Kami beriman”, sedang mereka tidak diuji (dengan sesuatu cubaan)?"
    }
  },
  {
    "ref": "29:5",
    "sure": 29,
    "ayet": 5,
    "ar": "مَن كَانَ يَرْجُوا۟ لِقَآءَ ٱللَّهِ فَإِنَّ أَجَلَ ٱللَّهِ لَـَٔاتٍ وَهُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Kim Allah’a kavuşmayı umarsa, şüphesiz Allah’ın belirlediği süre gelecektir. O her şeyi işitendir, bilendir.",
      "en": "Whoever should hope for the meeting with Allāh - indeed, the term [decreed by] Allāh is coming. And He is the Hearing, the Knowing.",
      "id": "Barang siapa mengharap pertemuan dengan Allah, maka sesungguhnya waktu (yang dijanjikan) Allah pasti datang. Dan Dia Yang Maha Mendengar, Maha Mengetahui.",
      "de": "Wer die Begegnung mit Allah erwartet-, so wird Allahs Frist sicher kommen. Und Er ist der Allhörende und Allwissende.",
      "fr": "Que celui qui espère rencontrer Allah sache que le terme fixé par Allah arrivera inéluctablement. Il est Celui qui entend tout et sait tout.",
      "bs": "A ko se nada susretu s Allahom, pa od Allaha određeno vrijeme će doći, a On je Svečujući i Sveznajući!",
      "ru": "Тот, кто надеется на встречу с Аллахом, [пусть знает:] воистину, срок Аллаха непременно наступит. И Он — Слышащий, Знающий."
    }
  },
  {
    "ref": "29:19",
    "sure": 29,
    "ayet": 19,
    "ar": "أَوَلَمْ يَرَوْا۟ كَيْفَ يُبْدِئُ ٱللَّهُ ٱلْخَلْقَ ثُمَّ يُعِيدُهُۥٓ إِنَّ ذَٰلِكَ عَلَى ٱللَّهِ يَسِيرٌ",
    "mealler": {
      "tr": "Allah'ın yaratmayı nasıl başlattığını sonra onu yeniden nasıl gerçekleştirdiğini görmediler mi? Şüphesiz bu, Allah'a göre kolaydır.",
      "en": "Have they not considered how Allāh begins creation and then repeats it? Indeed that, for Allāh, is easy.",
      "id": "Dan apakah mereka tidak memperhatikan bagaimana Allah memulai penciptaan (makhluk), kemudian Dia mengulanginya (kembali). Sungguh, yang demikian itu mudah bagi Allah.",
      "de": "Haben sie denn nicht gesehen, wie Allah die Schöpfung am Anfang macht und sie hierauf wiederholt? Gewiß, das ist für Allah ein leichtes.",
      "fr": "Ne savent-ils pas qu’Allah, qui est à l’origine de la Création, est capable de la recommencer ? Voilà qui, pour Allah, est si aisé.",
      "bs": "Zar oni ne vide kako Allah započinje stvaranje?! On će to opet učiniti; Allahu je to, zaista, lahko.",
      "ru": "Неужели они не видят, как Аллах создаёт творение впервые, а затем воссоздаёт его ? Воистину, это для Аллаха легко."
    }
  },
  {
    "ref": "29:41",
    "sure": 29,
    "ayet": 41,
    "ar": "مَثَلُ ٱلَّذِينَ ٱتَّخَذُوا۟ مِن دُونِ ٱللَّهِ أَوْلِيَآءَ كَمَثَلِ ٱلْعَنكَبُوتِ ٱتَّخَذَتْ بَيْتًا وَإِنَّ أَوْهَنَ ٱلْبُيُوتِ لَبَيْتُ ٱلْعَنكَبُوتِ لَوْ كَانُوا۟ يَعْلَمُونَ",
    "mealler": {
      "tr": "Allah’tan başka veliler edinenlerin durumu kendine yuva yapan örümceğin durumuna benzer. Evlerin en dayanıksızı ise şüphesiz örümcek evidir. Keşke bilselerdi!",
      "en": "The example of those who take allies other than Allāh is like that of the spider who takes [i.e., constructs] a home. And indeed, the weakest of homes is the home of the spider, if they only knew.",
      "id": "Perumpamaan orang-orang yang mengambil pelindung selain Allah adalah seperti laba-laba yang membuat rumah. Dan sesungguhnya rumah yang paling lemah ialah rumah laba-laba, sekiranya mereka mengetahui.",
      "bs": "Oni koji, mimo Allaha, zaštitnike uzimaju slični su pauku koji sebi isplete kuću – a najslabija je kuća, uistinu, paukova kuća, neka znaju!",
      "ru": "Притча о тех, которые взяли себе помимо Аллаха покровителей, подобна притче о пауке, который свил себе дом, — тогда как, воистину, самый непрочный из домов — дом паука, если бы они только знали."
    }
  },
  {
    "ref": "29:44",
    "sure": 29,
    "ayet": 44,
    "ar": "خَلَقَ ٱللَّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ بِٱلْحَقِّ إِنَّ فِى ذَٰلِكَ لَـَٔايَةً لِّلْمُؤْمِنِينَ",
    "mealler": {
      "tr": "Allah, gökleri ve yeri hak olarak yarattı. Şüphesiz bunda iman etmekte olanlar için bir ayet vardır.",
      "en": "Allāh created the heavens and the earth in truth. Indeed in that is a sign for the believers.",
      "de": "Allah hat die Himmel und die Erde in Wahrheit erschaffen. Darin ist wahrlich ein Zeichen für die Gläubigen.",
      "fr": "Allah a créé les cieux et la terre selon une sagesse infinie. Voilà assurément un signe pour les croyants.",
      "bs": "Allah je nebesa i Zemlju s razlogom stvorio; to je, doista, pouka onima koji vjeruju.",
      "ru": "Аллах сотворил небеса и землю с истиной. Воистину, в этом — знамение для верующих.",
      "ms": "Allah mencipta langit dan bumi dengan cara yang layak dan berhikmat; sesungguhnya yang demikian itu mengandungi satu tanda (yang membuktikan kebijaksanaan Allah) bagi orang-orang yang beriman."
    }
  },
  {
    "ref": "29:56",
    "sure": 29,
    "ayet": 56,
    "ar": "يَٰعِبَادِىَ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ أَرْضِى وَٰسِعَةٌ فَإِيَّٰىَ فَٱعْبُدُونِ",
    "mealler": {
      "tr": "Ey iman eden kullarım! Şüphesiz ki benim arzım (yeryüzü) geniştir. O halde, ancak bana ibadet edin.",
      "en": "O My servants who have believed, indeed My earth is spacious, so worship only Me.",
      "id": "Wahai hamba-hamba-Ku yang beriman! Sungguh, bumi-Ku luas, maka sembahlah Aku (saja).",
      "de": "O Meine Diener, die ihr glaubt, gewiß, Meine Erde ist weit. So dient Mir, ja, allein Mir.",
      "bs": "O robovi Moji koji vjerujete, Moja je Zemlja prostrana, zato samo Meni ibadet činite!",
      "ru": "О Мои рабы, которые уверовали! Воистину, Моя земля обширна, так поклоняйтесь же только Мне."
    }
  },
  {
    "ref": "29:57",
    "sure": 29,
    "ayet": 57,
    "ar": "كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ ثُمَّ إِلَيْنَا تُرْجَعُونَ",
    "mealler": {
      "tr": "Her nefis ölümü tadacaktır. Sonra da bize döndürüleceksiniz.",
      "en": "Every soul will taste death. Then to Us will you be returned.",
      "id": "Setiap yang bernyawa akan merasakan mati. Kemudian hanya kepada Kami kamu dikembalikan.",
      "de": "Jede Seele wird den Tod kosten. Hierauf werdet ihr zu Uns zurückgebracht.",
      "bs": "Svako će živo biće smrt okusiti, i Nama ćete se poslije vratiti.",
      "ru": "Каждая душа непременно вкусит смерть, затем к Нам вы будете возвращены.",
      "ms": "Tiap-tiap diri (sudah tetap) akan merasai mati, kemudian kamu akan dikembalikan kepada Kami (untuk menerima balasan)."
    }
  },
  {
    "ref": "29:62",
    "sure": 29,
    "ayet": 62,
    "ar": "ٱللَّهُ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ مِنْ عِبَادِهِۦ وَيَقْدِرُ لَهُۥٓ إِنَّ ٱللَّهَ بِكُلِّ شَىْءٍ عَلِيمٌ",
    "mealler": {
      "tr": "Allah, kullarından dilediğine bol verir ve (dilediğine) kısar. Şüphesiz Allah, her şeyi hakkıyla bilendir.",
      "en": "Allāh extends provision for whom He wills of His servants and restricts for him. Indeed Allāh is, of all things, Knowing.",
      "id": "Allah melapangkan rezeki bagi orang yang Dia kehendaki di antara hamba-hamba-Nya, dan Dia (pula) yang membatasi baginya. Sungguh, Allah Maha Mengetahui segala sesuatu.",
      "de": "Allah gewährt die Versorgung großzügig, wem von Seinen Dienern Er will, und bemißt ihm auch. Gewiß, Allah weiß über alles Bescheid.",
      "fr": "Allah dispense Ses faveurs à qui Il veut parmi Ses serviteurs, comblant certaines de Ses créatures, accordant aux autres avec mesure. Allah, en vérité, a une parfaite connaissance de toute chose.",
      "bs": "Allah u izobilju daje hranu onom kome hoće od robova Svojih, a nekom i uskraćuje. – Allah, zaista, zna sve.",
      "ru": "Аллах увеличивает удел тому, кому пожелает из Своих рабов, и ограничивает его. Воистину, Аллах — знающий обо всём сущем.",
      "ms": "Allah memewahkan rezeki bagi sesiapa yang dikehendakiNya di antara hamba-hambaNya dan menyempitkan (rezeki itu) baginya; sesungguhnya Allah Maha Mengetahui akan tiap-tiap sesuatu."
    }
  },
  {
    "ref": "30:11",
    "sure": 30,
    "ayet": 11,
    "ar": "ٱللَّهُ يَبْدَؤُا۟ ٱلْخَلْقَ ثُمَّ يُعِيدُهُۥ ثُمَّ إِلَيْهِ تُرْجَعُونَ",
    "mealler": {
      "tr": "Allah yaratmayı ilk olarak başlatır, sonra onu yeniden gerçekleştirir. Sonra O'na döndürülürsünüz.",
      "en": "Allāh begins creation; then He will repeat it; then to Him you will be returned.",
      "id": "Allah yang memulai penciptaan (makhluk), kemudian mengulanginya kembali; kemudian kepada-Nya kamu dikembalikan.",
      "de": "Allah macht die Schöpfung am Anfang und wiederholt sie hierauf. Dann werdet ihr zu Ihm zurückgebracht.",
      "fr": "Allah est à l’origine de la Création qu’Il recommencera. C’est à Lui alors que vous serez ramenés.",
      "bs": "Allah je počeo stvaranje, zatim ga ponavlja i na kraju Njemu ćete se vratiti.",
      "ru": "Аллах создаёт творение впервые, а затем воссоздаёт его, а потом к Нему вы будете возвращены.",
      "ms": "Allah memulakan kejadian sekalian makhluk, kemudian Ia mengembalikannya (hidup semula pada hari kiamat), kemudian kepadaNyalah kamu akan dikembalikan (untuk menerima balasan)."
    }
  },
  {
    "ref": "31:26",
    "sure": 31,
    "ayet": 26,
    "ar": "لِلَّهِ مَا فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ إِنَّ ٱللَّهَ هُوَ ٱلْغَنِىُّ ٱلْحَمِيدُ",
    "mealler": {
      "tr": "Göklerlerde ve yerde olanlar Allah’ındır. Muhakkak Allah Ganî'dir, Hamîd'dir.",
      "en": "To Allāh belongs whatever is in the heavens and earth. Indeed, Allāh is the Free of need, the Praiseworthy.",
      "id": "Milik Allah lah apa yang di langit dan di bumi. Sesungguhnya Allah, Dialah Yang Mahakaya, Maha Terpuji.",
      "de": "Allah gehört, was in den Himmeln und auf der Erde ist. Gewiß, Allah ist der Unbedürftige und Lobenswürdige.",
      "fr": "A Allah appartient tout ce qui se trouve dans les cieux et sur la terre. Allah, en vérité, peut se passer de toute chose et Il est digne de toute louange.",
      "bs": "Allahovo je sve na nebesima i na Zemlji! Allah je, uistinu, neovisan i hvale dostojan.",
      "ru": "Аллаху принадлежит всё, что в небесах и на земле. Воистину, Аллах — Он Богатый, Достохвальный.",
      "ms": "Allah jua yang memiliki segala yang ada di langit dan di bumi; sesungguhnya Allah Dia lah jua yang Maha Kaya, lagi sentiasa Terpuji."
    }
  },
  {
    "ref": "32:15",
    "sure": 32,
    "ayet": 15,
    "ar": "إِنَّمَا يُؤْمِنُ بِـَٔايَٰتِنَا ٱلَّذِينَ إِذَا ذُكِّرُوا۟ بِهَا خَرُّوا۟ سُجَّدًا وَسَبَّحُوا۟ بِحَمْدِ رَبِّهِمْ وَهُمْ لَا يَسْتَكْبِرُونَ",
    "mealler": {
      "tr": "Bizim ayetlerimize ancak, kendilerine bu ayetlerle öğüt verildiği zaman secdeye kapanan, kibirlenmeksizin Rablerine hamt ederek tespih edenler iman ederler.",
      "en": "Only those believe in Our verses who, when they are reminded by them, fall down in prostration and exalt [Allāh] with praise of their Lord, and they are not arrogant.",
      "de": "Nur diejenigen glauben an Unsere Zeichen, die, wenn sie damit ermahnt werden, ehrerbietig niederfallen und ihren Herrn lobpreisen und sich nicht hochmütig verhalten.",
      "fr": "Seuls croient vraiment en Nos versets ceux qui, lorsqu’ils leur sont rappelés, tombent à terre prosternés et célèbrent, par les louanges, la gloire de leur Seigneur en toute humilité,",
      "bs": "U Naše riječi vjeruju samo oni koji, kad se njima opomenu, licem na tlo padaju i koji Gospodara svog veličaju i hvale i koji se ne ohole.",
      "ru": "Воистину, в Наши знамения веруют лишь те, которые, когда напоминают им о них, падают, преклоняясь ниц, и прославляют своего Господа хвалой, не превозносясь."
    }
  },
  {
    "ref": "33:54",
    "sure": 33,
    "ayet": 54,
    "ar": "إِن تُبْدُوا۟ شَيْـًٔا أَوْ تُخْفُوهُ فَإِنَّ ٱللَّهَ كَانَ بِكُلِّ شَىْءٍ عَلِيمًا",
    "mealler": {
      "tr": "Bir şeyi açığa vursanız da gizleseniz de şüphesiz Allah, her şeyi hakkıyla bilendir.",
      "en": "Whether you reveal a thing or conceal it, indeed Allāh is ever, of all things, Knowing.",
      "id": "Jika kamu menyatakan sesuatu atau menyembunyikannya, maka sesungguhnya Allah Maha Mengetahui segala sesuatu.",
      "de": "Ob ihr etwas offenlegt oder verbergt, gewiß, Allah weiß über alles Bescheid.",
      "fr": "Que vous révéliez vos intentions ou que vous les dissimuliez, Allah a une parfaite connaissance de toute chose.",
      "bs": "Iznosili vi o tome šta u javnost ili to u sebi krili – pa, Allah sve zna.",
      "ru": "Если вы сделаете что-либо явно или тайно — то, воистину, Аллах всегда был [и пребудет] знающим обо всём сущем.",
      "ms": "(Awasilah keadaan-keadaan kamu, kerana) jika kamu nyatakan sesuatu atau kamu sembunyikan dia, maka sesungguhnya Allah sentiasa Mengetahui akan segala-galanya."
    }
  },
  {
    "ref": "33:56",
    "sure": 33,
    "ayet": 56,
    "ar": "إِنَّ ٱللَّهَ وَمَلَٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ صَلُّوا۟ عَلَيْهِ وَسَلِّمُوا۟ تَسْلِيمًا",
    "mealler": {
      "tr": "Şüphesiz Allah ve melekleri Nebi’ye salat ederler. Ey Müminler siz de ona salat ve selam edin.",
      "en": "Indeed, Allāh confers blessing upon the Prophet, and His angels [ask Him to do so]. O you who have believed, ask [Allāh to confer] blessing upon him and ask [Allāh to grant him] peace.",
      "de": "Gewiß, Allah und Seine Engel sprechen den Segen über den Propheten. O die ihr glaubt, sprecht den Segen über ihn und grüßt ihn mit gehörigem Gruß.",
      "fr": "Allah et Ses anges bénissent le Prophète. Vous qui croyez ! Bénissez-le et saluez-le vous aussi !",
      "bs": "Zaista, Allah i meleci Njegovi blagosiljaju Vjerovjesnika. O vi koji vjerujete, blagosiljajte ga i vi i njemu selam šaljite!",
      "ru": "Воистину, Аллах и Его ангелы благословляют Пророка. О вы, которые уверовали! Благословляйте его и приветствуйте его должным приветствием."
    }
  },
  {
    "ref": "33:70",
    "sure": 33,
    "ayet": 70,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَقُولُوا۟ قَوْلًا سَدِيدًا",
    "mealler": {
      "tr": "Ey iman edenler! Allah’tan sakının ve doğru söz söyleyin.",
      "en": "O you who have believed, fear Allāh and speak words of appropriate justice.",
      "id": "Wahai orang-orang yang beriman! Bertakwalah kamu kepada Allah dan ucapkanlah perkataan yang benar,",
      "de": "O die ihr glaubt, fürchtet Allah und sagt treffende Worte,",
      "fr": "Vous qui croyez ! Craignez Allah ! Tenez des propos justes !",
      "bs": "O vjernici, bojte se Allaha i govorite samo istinu,",
      "ru": "О вы, которые уверовали! Бойтесь Аллаха и говорите правильное слово —",
      "ms": "Wahai orang-orang yang beriman, bertaqwalah kepada Allah, dan katakanlah perkataan yang tepat - benar (dalam segala perkara),"
    }
  },
  {
    "ref": "34:2",
    "sure": 34,
    "ayet": 2,
    "ar": "يَعْلَمُ مَا يَلِجُ فِى ٱلْأَرْضِ وَمَا يَخْرُجُ مِنْهَا وَمَا يَنزِلُ مِنَ ٱلسَّمَآءِ وَمَا يَعْرُجُ فِيهَا وَهُوَ ٱلرَّحِيمُ ٱلْغَفُورُ",
    "mealler": {
      "tr": "Allah; yere gireni, yerden çıkanı; gökten ineni ve oraya yükseleni bilir. O; çok merhametlidir, çok bağışlayıcıdır.",
      "en": "He knows what penetrates into the earth and what emerges from it and what descends from the heaven and what ascends therein. And He is the Merciful, the Forgiving.",
      "id": "Dia mengetahui apa yang masuk ke dalam bumi, apa yang keluar darinya, apa yang turun dari langit dan apa yang naik kepadanya. Dan Dialah Yang Maha Penyayang, Maha Pengampun.",
      "de": "Er weiß, was in die Erde eindringt und was aus ihr herauskommt, was vom Himmel herabkommt und was dorthin aufsteigt. Und Er ist der Barmherzige und Allvergebende.",
      "fr": "Il sait ce qui pénètre dans la terre et ce qui en sort, ce qui descend du ciel et ce qui y monte. Il est le Très Miséricordieux, le Très Clément.",
      "bs": "On zna šta u zemlju ulazi, a šta iz nje izlazi, i šta se s neba spušta, a šta se na njega uspinje; On je samilostan i On prašta grijehe.",
      "ru": "Он знает, что проникает в землю и что выходит из неё, и что нисходит с неба и что возносится в него, и Он — Милующий, Прощающий.",
      "ms": "Ia mengetahui apa yang masuk ke bumi serta apa yang keluar daripadanya, dan apa yang turun dari langit serta apa yang naik kepadanya; dan Dia lah jua yang Maha Mengasihani, lagi Maha Pengampun."
    }
  },
  {
    "ref": "35:2",
    "sure": 35,
    "ayet": 2,
    "ar": "مَّا يَفْتَحِ ٱللَّهُ لِلنَّاسِ مِن رَّحْمَةٍ فَلَا مُمْسِكَ لَهَا وَمَا يُمْسِكْ فَلَا مُرْسِلَ لَهُۥ مِنۢ بَعْدِهِۦ وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    "mealler": {
      "tr": "Allah'ın insanlara açtığı rahmeti tutacak yoktur. O'nun tuttuğunu da ondan sonra salacak yoktur. O; mutlak güç sahibidir, hüküm ve hikmet sahibidir.",
      "en": "Whatever Allāh grants to people of mercy - none can withhold it; and whatever He withholds - none can release it thereafter. And He is the Exalted in Might, the Wise.",
      "de": "Was Allah den Menschen an Barmherzigkeit auftut, das kann keiner zurückhalten. Und was Er zurückhält, das kann keiner nach Ihm freigeben. Und Er ist der Allmächtige und Allweise.",
      "bs": "Milost koju Allah podari ljudima niko ne može uskratiti, a ono što On uskrati niko ne može, poslije Njega, dati; On je silan i mudar.",
      "ru": "То, что Аллах откроет людям из Своей милости, никто не удержит. А то, что Он удержит, никто после Него не пошлёт. Он — Могущественный, Мудрый."
    }
  },
  {
    "ref": "35:5",
    "sure": 35,
    "ayet": 5,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ إِنَّ وَعْدَ ٱللَّهِ حَقٌّ فَلَا تَغُرَّنَّكُمُ ٱلْحَيَوٰةُ ٱلدُّنْيَا وَلَا يَغُرَّنَّكُم بِٱللَّهِ ٱلْغَرُورُ",
    "mealler": {
      "tr": "Ey insanlar! Şüphe yok ki Allah’ın vaadi haktır. O halde sakın sizi dünya hayatı aldatmasın ve çok aldatıcı da sakın sizi Allah ile aldatmasın.",
      "en": "O mankind, indeed the promise of Allāh is truth, so let not the worldly life delude you and be not deceived about Allāh by the Deceiver [i.e., Satan].",
      "id": "Wahai manusia! Sungguh, janji Allah itu benar, maka janganlah kehidupan dunia memperdayakan kamu dan janganlah (setan) yang pandai menipu, memperdayakan kamu tentang Allah.",
      "de": "O ihr Menschen, gewiß, Allahs Versprechen ist wahr. So soll euch das diesseitige Leben nicht täuschen, und nicht täuschen soll euch hinsichtlich Allahs der Täuscher.",
      "fr": "Ô hommes ! La promesse d’Allah s’accomplira inéluctablement. Ne vous laissez donc pas abuser par cette vie et ne vous laissez pas tromper, au sujet du Seigneur, par l’infâme séducteur.",
      "bs": "O ljudi, Allahova prijetnja je zaista istina, pa neka vas nikako život na ovom svijetu ne zaslijepi i neka vas šejtan u Allaha ne pokoleba.",
      "ru": "О люди! Воистину, обещание Аллаха истинно. Так пусть же не обольстит вас мирская жизнь, и пусть не обольстит вас в отношении Аллаха обольститель."
    }
  },
  {
    "ref": "35:6",
    "sure": 35,
    "ayet": 6,
    "ar": "إِنَّ ٱلشَّيْطَٰنَ لَكُمْ عَدُوٌّ فَٱتَّخِذُوهُ عَدُوًّا إِنَّمَا يَدْعُوا۟ حِزْبَهُۥ لِيَكُونُوا۟ مِنْ أَصْحَٰبِ ٱلسَّعِيرِ",
    "mealler": {
      "tr": "Şüphe yok ki Şeytan; sizin düşmanınızdır, siz de onu düşman sayın. O, kendi taraftarlarını ancak ateş ehlinden olmaya çağırır.",
      "en": "Indeed, Satan is an enemy to you; so take him as an enemy. He only invites his party to be among the companions of the Blaze.",
      "id": "Sungguh, setan itu musuh bagimu, maka perlakukanlah ia sebagai musuh, karena sesungguhnya setan itu hanya mengajak golongannya agar mereka menjadi penghuni neraka yang menyala-nyala.",
      "de": "Gewiß, der Satan ist euch ein Feind; so nehmt ihn euch zum Feind. Er ruft ja seine Anhängerschaft nur dazu auf, zu den Insassen der Feuerglut zu gehören.",
      "fr": "En vérité, Satan est votre ennemi juré. Traitez-le donc comme tel ! Il ne poursuit qu’un seul dessein : tromper ses partisans afin de les faire entrer dans les flammes de l’Enfer.",
      "bs": "Šejtan je, uistinu, vaš neprijatelj, pa ga takvim i smatrajte! On poziva pristaše svoje da budu stanovnici u Vatri.",
      "ru": "Воистину, шайтан — ваш враг, так относитесь же к нему как к врагу. Воистину, он призывает своих сторонников лишь для того, чтобы они оказались обитателями пылающего огня.",
      "ms": "Sesungguhnya Syaitan adalah musuh bagi kamu, maka jadikanlah dia musuh (yang mesti dijauhi tipu dayanya); sebenarnya dia hanyalah mengajak golongannya supaya menjadi dari penduduk neraka."
    }
  },
  {
    "ref": "35:15",
    "sure": 35,
    "ayet": 15,
    "ar": "يَٰٓأَيُّهَا ٱلنَّاسُ أَنتُمُ ٱلْفُقَرَآءُ إِلَى ٱللَّهِ وَٱللَّهُ هُوَ ٱلْغَنِىُّ ٱلْحَمِيدُ",
    "mealler": {
      "tr": "Ey insanlar! Allah'a muhtaç olanlar sizlersiniz. Allah zengin ve övülmeye lâyık olandır.",
      "en": "O mankind, you are those in need of Allāh, while Allāh is the Free of need, the Praiseworthy.",
      "id": "Wahai manusia! Kamulah yang memerlukan Allah; dan Allah Dialah Yang Mahakaya (tidak memerlukan apa pun), Maha Terpuji.",
      "de": "O ihr Menschen, ihr seid es, die Allahs bedürftig sind; Allah aber ist der Unbedürftige und Lobenswürdige.",
      "fr": "Ô hommes ! C’est vous qui avez besoin d’Allah qui, pour Sa part, peut parfaitement se passer de vous et qui est digne de toute louange.",
      "bs": "O ljudi, vi ste siromasi, vi trebate Allaha, a Allah je nezavisan i hvale dostojan.",
      "ru": "О люди! Вы — нуждающиеся в Аллахе, а Аллах, — Он Богатый, Достохвальный."
    }
  },
  {
    "ref": "35:16",
    "sure": 35,
    "ayet": 16,
    "ar": "إِن يَشَأْ يُذْهِبْكُمْ وَيَأْتِ بِخَلْقٍ جَدِيدٍ",
    "mealler": {
      "tr": "Allah dilerse sizi yok eder ve yerinize yeni bir halk getirir.",
      "en": "If He wills, He can do away with you and bring forth a new creation.",
      "id": "Jika Dia menghendaki, niscaya Dia membinasakan kamu dan mendatangkan makhluk yang baru (untuk menggantikan kamu).",
      "de": "Wenn Er will, läßt Er euch vergehen und bringt eine neue Schöpfung.",
      "fr": "Il pourrait, s’Il le voulait, vous faire disparaître et vous remplacer par de nouvelles créatures.",
      "bs": "Ako On hoće, uklonit će vas i nova stvorenja dovesti.",
      "ru": "Если Он пожелает, Он погубит вас и приведёт [на ваше место] новое творение.",
      "ms": "Jika Ia mahu, nescaya Ia membinasakan kamu dan mendatangkan makhluk yang baharu."
    }
  },
  {
    "ref": "35:27",
    "sure": 35,
    "ayet": 27,
    "ar": "أَلَمْ تَرَ أَنَّ ٱللَّهَ أَنزَلَ مِنَ ٱلسَّمَآءِ مَآءً فَأَخْرَجْنَا بِهِۦ ثَمَرَٰتٍ مُّخْتَلِفًا أَلْوَٰنُهَا وَمِنَ ٱلْجِبَالِ جُدَدٌۢ بِيضٌ وَحُمْرٌ مُّخْتَلِفٌ أَلْوَٰنُهَا وَغَرَابِيبُ سُودٌ",
    "mealler": {
      "tr": "Allah’ın gökten su indirdiğini ve onunla çeşitli renklerde ürünler çıkardığımızı görmüyor musun? Dağlardan (geçen) beyaz, kırmızı, değişik renklerde ve simsiyah yollar (yaptık).",
      "en": "Do you not see that Allāh sends down rain from the sky, and We produce thereby fruits of varying colors? And in the mountains are tracts, white and red of varying shades and [some] extremely black.",
      "bs": "Zar ne znaš da Allah s neba spušta vodu i da Mi pomoću nje stvaramo plodove različitih vrsta? A postoje brda bijelih i crvenih staza, različitih boja, i sasvim crnih.",
      "ru": "Разве ты не видишь, что Аллах ниспослал с неба воду, и Мы взрастили ею плоды различных цветов? И в горах есть полосы — белые и красные, различных оттенков, и чёрные, как смоль."
    }
  },
  {
    "ref": "35:38",
    "sure": 35,
    "ayet": 38,
    "ar": "إِنَّ ٱللَّهَ عَٰلِمُ غَيْبِ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ إِنَّهُۥ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    "mealler": {
      "tr": "Allah, göklerin ve yerin gaybını bilendir. O, kalplerin içinde ne varsa onu da hakkıyla bilendir.",
      "en": "Indeed, Allāh is Knower of the unseen [aspects] of the heavens and earth. Indeed, He is Knowing of that within the breasts.",
      "id": "Sungguh, Allah mengetahui yang gaib (tersembunyi) di langit dan di bumi. Sungguh, Dia Maha Mengetahui segala isi hati.",
      "de": "Gewiß, Allah ist der Kenner des Verborgenen der Himmel und der Erde; gewiß, Er weiß über das Innerste der Brüste Bescheid.",
      "fr": "Allah connaît aussi bien les mystères des cieux et de la terre que les secrets des cœurs.",
      "bs": "Allah sigurno zna tajne nebesa i Zemlje, On dobro zna sve što grudi kriju.",
      "ru": "Воистину, Аллах — знающий сокровенное небес и земли. Воистину, Он — знающий то, что таится в сердцах.",
      "ms": "Sesungguhnya Allah mengetahui segala rahsia di langit dan di bumi; sesungguhnya Ia mengetahui akan segala (isi hati) yang terkandung di dalam dada."
    }
  },
  {
    "ref": "36:12",
    "sure": 36,
    "ayet": 12,
    "ar": "إِنَّا نَحْنُ نُحْىِ ٱلْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا۟ وَءَاثَٰرَهُمْ وَكُلَّ شَىْءٍ أَحْصَيْنَٰهُ فِىٓ إِمَامٍ مُّبِينٍ",
    "mealler": {
      "tr": "Muhakkak biz ölüleri diriltiriz. Onların ileri gönderdiklerini de, geride bıraktıklarını (izlerini) da yazarız. Biz, her şeyi apaçık bir kitapta (Levh-i Mahfûz'da) sayıp yazmışızdır.",
      "en": "Indeed, it is We who bring the dead to life and record what they have put forth and what they left behind, and all things We have enumerated in a clear register.",
      "de": "Gewiß, Wir sind es, Die Wir die Toten wieder lebendig machen. Und Wir schreiben auf, was sie vorausgeschickt haben und (auch) ihre Spuren. Alles haben Wir in einem deutlichen Verzeichnis erfaßt.",
      "bs": "Mi, zaista, mrtve oživljavamo i Mi bilježimo ono što su uradili i tragove koje iza sebe ostave; sve smo Mi to u Knjizi jasnoj pobrojali.",
      "ru": "Воистину, Мы оживляем мёртвых и записываем то, что они совершили прежде, и их следы. И всё Мы подсчитали в ясном Писании."
    }
  },
  {
    "ref": "36:40",
    "sure": 36,
    "ayet": 40,
    "ar": "لَا ٱلشَّمْسُ يَنۢبَغِى لَهَآ أَن تُدْرِكَ ٱلْقَمَرَ وَلَا ٱلَّيْلُ سَابِقُ ٱلنَّهَارِ وَكُلٌّ فِى فَلَكٍ يَسْبَحُونَ",
    "mealler": {
      "tr": "Ne Güneş Ay'a yetişebilir, ne de gece gündüzü geçebilir. Her biri bir yörüngede yüzmektedir.",
      "en": "It is not allowable [i.e., possible] for the sun to reach the moon, nor does the night overtake the day, but each, in an orbit, is swimming.",
      "id": "Tidaklah mungkin bagi matahari mengejar bulan dan malam pun tidak dapat mendahului siang. Masing-masing beredar pada garis edarnya.",
      "de": "Weder ziemt es der Sonne, den Mond einzuholen, noch wird die Nacht dem Tag zuvorkommen; alle laufen in einer (jeweils eigenen) Umlaufbahn.",
      "fr": "Le soleil ne saurait rattraper la lune, ni la nuit devancer le jour. Chaque astre décrit une orbite bien déterminée.",
      "bs": "Niti Sunce može dostići Mjesec niti noć može prestići dan, svi oni u svemiru plove.",
      "ru": "Ни солнцу не подобает догонять луну, ни ночь не опережает день. И каждый из них плывёт по своему небосводу."
    }
  },
  {
    "ref": "36:81",
    "sure": 36,
    "ayet": 81,
    "ar": "أَوَلَيْسَ ٱلَّذِى خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ بِقَٰدِرٍ عَلَىٰٓ أَن يَخْلُقَ مِثْلَهُم بَلَىٰ وَهُوَ ٱلْخَلَّٰقُ ٱلْعَلِيمُ",
    "mealler": {
      "tr": "Gökleri ve yeri yaratan onların bir benzerini yaratmaya güç yetiremez mi? Evet, elbette kadirdir. O hakkıyla yaratıcıdır ve her şeyi bilir.",
      "en": "Is not He who created the heavens and the earth Able to create the likes of them? Yes, [it is so]; and He is the Knowing Creator.",
      "id": "Dan bukankah (Allah) yang menciptakan langit dan bumi, mampu menciptakan kembali yang serupa itu (jasad mereka yang sudah hancur)? Benar, dan Dia Maha Pencipta, Maha Mengetahui.",
      "de": "Hat nicht Derjenige, Der die Himmel und die Erde erschaffen hat, (auch) die Macht, ihresgleichen zu erschaffen? Ja doch! Und Er ist der Allerschaffer und Allwissende.",
      "fr": "Celui qui a créé les cieux et la terre n’est-Il pas capable de créer d’autres hommes comme eux ? Si, car Il est le Créateur de toute chose, l’Omniscient !",
      "bs": "Zar Onaj Koji je stvorio nebesa i Zemlju nije kadar stvoriti njima slične? Jest, On sve stvara i On je Sveznajući.",
      "ru": "Неужели Тот, Кто сотворил небеса и землю, не способен сотворить подобных им? Отнюдь! Он — Многотворящий, Знающий!"
    }
  },
  {
    "ref": "36:82",
    "sure": 36,
    "ayet": 82,
    "ar": "إِنَّمَآ أَمْرُهُۥٓ إِذَآ أَرَادَ شَيْـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ",
    "mealler": {
      "tr": "Bir şeyi dilediği zaman, O'nun emri yalnızca: 'Ol!' demesidir. O da hemen oluverir.",
      "en": "His command is only when He intends a thing that He says to it, \"Be,\" and it is.",
      "id": "Sesungguhnya urusan-Nya apabila Dia menghendaki sesuatu Dia hanya berkata kepadanya, \"Jadilah!\" Maka jadilah sesuatu itu.",
      "de": "Sein Befehl, wenn Er etwas will, ist, dazu nur zu sagen: ,Sei!’, und so ist es.",
      "fr": "Il Lui suffit, lorsqu’Il veut une chose, de dire : « Sois ! » et celle-ci s’accomplit.",
      "bs": "Kad nešto hoće, On samo za to rekne: “Budi!”, i ono bude.",
      "ru": "Воистину, Его повеление, когда Он желает чего-либо, — лишь сказать ему: «Будь!» — и оно бывает.",
      "ms": "Sesungguhnya keadaan kekuasaanNya apabila Ia menghendaki adanya sesuatu, hanyalah Ia berfirman kepada (hakikat) benda itu: “Jadilah engkau!”. Maka ia terus menjadi."
    }
  },
  {
    "ref": "37:180",
    "sure": 37,
    "ayet": 180,
    "ar": "سُبْحَٰنَ رَبِّكَ رَبِّ ٱلْعِزَّةِ عَمَّا يَصِفُونَ",
    "mealler": {
      "tr": "Üstünlük (izzet) sahibi Rabbin onların nitelemelerinden münezzehtir.",
      "en": "Exalted is your Lord, the Lord of might, above what they describe.",
      "id": "Mahasuci Tuhanmu, Tuhan Yang Mahaperkasa dari sifat yang mereka katakan.",
      "de": "Preis sei deinem Herrn, dem Herrn der Macht! (Erhaben ist Er) über das, was sie (Ihm) zuschreiben.",
      "fr": "Gloire à ton Seigneur Tout-Puissant que leurs blasphèmes ne sauraient atteindre !",
      "bs": "Uzvišen je Gospodar tvoj, Gospodar dostojanstva, u odnosu na ono kako ga opisuju!",
      "ru": "Пречист твой Господь, Господь величия, от того, что они приписывают!",
      "ms": "Akuilah kesucian Tuhanmu, - Tuhan yang mempunyai keagungan dan kekuasaan, - dari apa yang mereka katakan!"
    }
  },
  {
    "ref": "39:52",
    "sure": 39,
    "ayet": 52,
    "ar": "أَوَلَمْ يَعْلَمُوٓا۟ أَنَّ ٱللَّهَ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ إِنَّ فِى ذَٰلِكَ لَـَٔايَٰتٍ لِّقَوْمٍ يُؤْمِنُونَ",
    "mealler": {
      "tr": "Allah’ın, rızkı dilediğine bol verdiğini ve (dilediğine) kıstığını bilmezler mi? Bunda iman eden bir toplum için elbette ibretler vardır.",
      "en": "Do they not know that Allāh extends provision for whom He wills and restricts [it]? Indeed in that are signs for a people who believe.",
      "de": "Wissen sie denn nicht, daß Allah die Versorgung großzügig gewährt, wem Er will, und auch bemißt? Darin sind wahrlich Zeichen für Leute, die glauben.",
      "bs": "Kako ne znaju da Allah daje obilje onom kome hoće, i da ga uskraćuje – to su, zaista, pouke narodu koji vjeruje.",
      "ru": "Неужели они не знали, что Аллах увеличивает удел, кому пожелает, и ограничивает? Воистину, в этом — знамения для людей, которые веруют."
    }
  },
  {
    "ref": "39:62",
    "sure": 39,
    "ayet": 62,
    "ar": "ٱللَّهُ خَٰلِقُ كُلِّ شَىْءٍ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ وَكِيلٌ",
    "mealler": {
      "tr": "Allah her şeyin yaratıcısıdır. O her şeye vekildir.",
      "en": "Allāh is the Creator of all things, and He is, over all things, Disposer of affairs.",
      "id": "Allah pencipta segala sesuatu dan Dia Maha Pemelihara atas segala sesuatu.",
      "de": "Allah ist der Schöpfer von allem, und Er ist Sachwalter über alles.",
      "fr": "Allah est le Créateur de tout ce qui existe. Il veille à toute chose",
      "bs": "Allah je Stvoritelj svega i On upravlja svim.",
      "ru": "Аллах — Творец всего сущего, и Он попечитель над всем сущим.",
      "ms": "Allah Yang Menciptakan tiap-tiap sesuatu, dan Dia lah Yang Mentadbirkan serta menguasai segala-galanya."
    }
  },
  {
    "ref": "39:63",
    "sure": 39,
    "ayet": 63,
    "ar": "لَّهُۥ مَقَالِيدُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَٱلَّذِينَ كَفَرُوا۟ بِـَٔايَٰتِ ٱللَّهِ أُو۟لَٰٓئِكَ هُمُ ٱلْخَٰسِرُونَ",
    "mealler": {
      "tr": "Göklerin ve yerin anahtarları O’nundur. Allah’ın ayetlerini inkâr edenler var ya, işte onlar ziyana uğrayanların ta kendileridir.",
      "en": "To Him belong the keys of the heavens and the earth. And they who disbelieve in the verses of Allāh - it is those who are the losers.",
      "id": "Milik-Nyalah kunci-kunci (perbendaharaan) langit dan bumi. Dan orang-orang yang kafir terhadap ayat-ayat Allah, mereka itulah orang yang rugi.",
      "de": "Ihm gehören die Schlüssel der Himmel und der Erde. Diejenigen, die Allahs Zeichen verleugnen, das sind die Verlierer.",
      "bs": "U Njega su ključevi nebesa i Zemlje! A oni koji u Allahove dokaze ne vjeruju, oni će biti izgubljeni!",
      "ru": "Ему принадлежат ключи небес и земли. Те, которые отвергли знамения Аллаха — такие и есть потерпевшие убыток."
    }
  },
  {
    "ref": "40:19",
    "sure": 40,
    "ayet": 19,
    "ar": "يَعْلَمُ خَآئِنَةَ ٱلْأَعْيُنِ وَمَا تُخْفِى ٱلصُّدُورُ",
    "mealler": {
      "tr": "Allah, gözlerin hain bakışını ve kalplerin gizlediğini bilir.",
      "en": "He knows that which deceives the eyes and what the breasts conceal.",
      "de": "Er kennt die verräterischen Augen und weiß, was die Brüste verbergen.",
      "fr": "Allah connaît aussi bien les regards furtifs que le secret des cœurs.",
      "bs": "On zna poglede koji kriomice u ono što je zabranjeno gledaju, a i ono što grudi kriju.",
      "ru": "Знает Он и предательский взгляд, и то, что таится в сердцах.",
      "ms": "Allah mengetahui pengkhianatan (penyelewengan dan ketiadaan jujur) pandangan mata seseorang, serta mengetahui akan apa yang tersembunyi di dalam hati."
    }
  },
  {
    "ref": "40:39",
    "sure": 40,
    "ayet": 39,
    "ar": "يَٰقَوْمِ إِنَّمَا هَٰذِهِ ٱلْحَيَوٰةُ ٱلدُّنْيَا مَتَٰعٌ وَإِنَّ ٱلْـَٔاخِرَةَ هِىَ دَارُ ٱلْقَرَارِ",
    "mealler": {
      "tr": "\"Ey halkım! Şüphesiz bu dünya hayatı geçicidir, ama ahiret, doğrusu işte o, kalınacak yurttur.\"",
      "en": "O my people, this worldly life is only [temporary] enjoyment, and indeed, the Hereafter - that is the home of [permanent] settlement.",
      "id": "Wahai kaumku! Sesungguhnya kehidupan dunia ini hanyalah kesenangan (sementara) dan sesungguhnya akhirat itulah negeri yang kekal.",
      "de": "O mein Volk, dieses irdische Leben ist nur Nießbrauch; das Jenseits aber ist die Wohnstätte zum (bleibenden) Aufenthalt.",
      "fr": "Mon peuple ! Cette vie n’est que jouissance éphémère. Seule la demeure de l’au-delà est éternelle.",
      "bs": "O narode moj, život na ovom svijetu samo je prolazno uživanje, a onaj je svijet, zaista, Kuća vječna.",
      "ru": "О народ мой! Воистину, эта мирская жизнь — лишь временное пользование. И воистину, Последняя жизнь — это обитель вечного пребывания.",
      "ms": "“Wahai kaumku! Sesungguhnya kehidupan dunia ini hanyalah kesenangan (untuk sementara waktu sahaja), dan sesungguhnya hari akhirat itulah sahaja negeri yang kekal."
    }
  },
  {
    "ref": "40:57",
    "sure": 40,
    "ayet": 57,
    "ar": "لَخَلْقُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ أَكْبَرُ مِنْ خَلْقِ ٱلنَّاسِ وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يَعْلَمُونَ",
    "mealler": {
      "tr": "Elbette göklerin ve yerin yaratılması insanların yaratılmasından daha büyüktür. Ancak insanların çoğu bilmezler.",
      "en": "The creation of the heavens and earth is greater than the creation of mankind, but most of the people do not know.",
      "id": "Sungguh, penciptaan langit dan bumi itu lebih besar daripada penciptaan manusia, akan tetapi kebanyakan manusia tidak mengetahui.",
      "de": "Wahrlich die Erschaffung der Himmel und der Erde ist größer als die Erschaffung der Menschen. Aber die meisten Menschen wissen nicht.",
      "bs": "Stvaranje nebesa i Zemlje sigurno je veće nego stvaranje roda ljudskog, ali većina ljudi ne zna.",
      "ru": "Безусловно, сотворение небес и земли больше, чем сотворение людей, однако большинство людей не знает."
    }
  },
  {
    "ref": "40:59",
    "sure": 40,
    "ayet": 59,
    "ar": "إِنَّ ٱلسَّاعَةَ لَـَٔاتِيَةٌ لَّا رَيْبَ فِيهَا وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يُؤْمِنُونَ",
    "mealler": {
      "tr": "Elbette kıyamet mutlaka gelecektir. Bunda hiç şüphe yoktur ama insanların çoğu iman etmezler.",
      "en": "Indeed, the Hour is coming - no doubt about it - but most of the people do not believe.",
      "id": "Sesungguhnya hari Kiamat pasti akan datang, tidak ada keraguan tentangnya, akan tetapi kebanyakan manusia tidak beriman.",
      "de": "Gewiß, die Stunde kommt bestimmt, an ihr gibt es keinen Zweifel. Aber die meisten Menschen glauben nicht.",
      "fr": "L’Heure sonnera inéluctablement, mais la plupart des hommes ne croient pas en son avènement.",
      "bs": "Doći će Čas oživljenja, u to nema nimalo sumnje, ali većina ljudi neće da vjeruje.",
      "ru": "Воистину, Час безусловно настанет, в этом нет сомнения, однако большинство людей не верует.",
      "ms": "Sesungguhnya hari kiamat tetap akan datang, tidak ada sebarang syak tentang kedatangannya; akan tetapi kebanyakan manusia tidak beriman (akan hakikat itu)."
    }
  },
  {
    "ref": "40:62",
    "sure": 40,
    "ayet": 62,
    "ar": "ذَٰلِكُمُ ٱللَّهُ رَبُّكُمْ خَٰلِقُ كُلِّ شَىْءٍ لَّآ إِلَٰهَ إِلَّا هُوَ فَأَنَّىٰ تُؤْفَكُونَ",
    "mealler": {
      "tr": "İşte her şeyin yaratıcısı olan Rabbiniz Allah! O’ndan başka hiçbir ilâh yoktur. Durum bu iken, nasıl oluyor da (haktan) döndürülüyorsunuz?",
      "en": "That is Allāh, your Lord, Creator of all things; there is no deity except Him, so how are you deluded?",
      "id": "Demikianlah Allah, Tuhanmu, Pencipta segala sesuatu, tidak ada tuhan (yang berhak disembah) selain Dia; maka bagaimanakah kamu dapat dipalingkan?",
      "de": "Dies ist doch Allah, euer Herr, der Schöpfer von allem. Es gibt keinen Gott außer Ihm. Wie laßt ihr euch also abwendig machen?",
      "fr": "Tel est Allah, votre Seigneur, Créateur de toute chose. Il n’est de divinité digne d’être adorée que Lui. Comment pouvez-vous encore vous détourner ?",
      "bs": "To vam je, eto, Allah, Gospodar vaš, Stvoritelj svega, drugog boga osim Njega nema, pa kuda se onda odmećete?",
      "ru": "Таков Аллах, ваш Господь, Творец всего сущего! Нет божества, кроме Него. Так как же вы можете быть настолько отвращены от истины?!"
    }
  },
  {
    "ref": "41:8",
    "sure": 41,
    "ayet": 8,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ لَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ",
    "mealler": {
      "tr": "Şüphesiz iman edip salih ameller işleyenler için ise kesintisiz bir mükâfat vardır.",
      "en": "Indeed, those who believe and do righteous deeds - for them is a reward uninterrupted.",
      "id": "Sesungguhnya orang-orang yang beriman dan mengerjakan kebajikan, mereka mendapat pahala yang tidak ada putus-putusnya.\"",
      "de": "Gewiß, diejenigen, die glauben und rechtschaffene Werke tun, für sie wird es einen Lohn geben, der nicht aufhört.",
      "fr": "Quant à ceux qui croient et accomplissent de bonnes œuvres, leur est réservée une récompense dont ils ne seront jamais privés.",
      "bs": "One koji vjeruju i dobra djela čine zbilja čeka nagrada neprekidna.”",
      "ru": "Воистину, те, которые уверовали и совершали праведные деяния, — для них неиссякаемая награда.",
      "ms": "Sesungguhnya orang-orang yang beriman dan mengerjakan amal yang soleh, mereka beroleh balasan pahala yang tidak putus-putus."
    }
  },
  {
    "ref": "41:46",
    "sure": 41,
    "ayet": 46,
    "ar": "مَّنْ عَمِلَ صَٰلِحًا فَلِنَفْسِهِۦ وَمَنْ أَسَآءَ فَعَلَيْهَا وَمَا رَبُّكَ بِظَلَّٰمٍ لِّلْعَبِيدِ",
    "mealler": {
      "tr": "Kim salih amel işlerse kendisi içindir. Kim de kötülük yaparsa kendi aleyhinedir. Rabbin, kullara asla zulmedici değildir.",
      "en": "Whoever does righteousness - it is for his [own] soul; and whoever does evil [does so] against it. And your Lord is not ever unjust to [His] servants.",
      "de": "Wer rechtschaffen handelt, der (tut es) zu seinem eigenen Vorteil, und wer Böses tut, der (tut es) zu seinem eigenen Nachteil. Und dein Herr ist keiner, der den Dienern Unrecht zufügt.",
      "fr": "Quiconque fait le bien, le fera dans son seul intérêt et quiconque commet le mal, en subira seul les effets. Car Allah n’est jamais injuste envers Ses serviteurs.",
      "bs": "Ko čini dobro, u svoju korist čini, a ko radi zlo, na svoju štetu radi. – A Gospodar tvoj nije nepravedan prema robovima Svojim.",
      "ru": "Кто совершил праведное дело, тот поступил во благо себе, а кто совершил зло, тот поступил во вред себе. И твой Господь вовсе не поступает несправедливо со Своими рабами."
    }
  },
  {
    "ref": "42:12",
    "sure": 42,
    "ayet": 12,
    "ar": "لَهُۥ مَقَالِيدُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يَبْسُطُ ٱلرِّزْقَ لِمَن يَشَآءُ وَيَقْدِرُ إِنَّهُۥ بِكُلِّ شَىْءٍ عَلِيمٌ",
    "mealler": {
      "tr": "Göklerin ve yerin anahtarları O’nundur. O, dilediğine rızkını bol bol verir ve dilediğine de daraltır. Çünkü O, her şeyi bilendir.",
      "en": "To Him belong the keys of the heavens and the earth. He extends provision for whom He wills and restricts [it]. Indeed He is, of all things, Knowing.",
      "id": "Milik-Nyalah perbendaharaan langit dan bumi; Dia melapangkan rezeki dan membatasinya bagi siapa yang Dia kehendaki. Sungguh, Dia Maha Mengetahui segala sesuatu.",
      "de": "Ihm gehören die Schlüssel der Himmel und der Erde. Er gewährt die Versorgung großzügig, wem Er will, und bemißt auch. Gewiß, Er weiß über alles Bescheid.",
      "bs": "U Njega su ključevi nebesa i Zemlje, On daje opskrbu u izobilju kome hoće, a i uskraćuje; On, uistinu, zna sve.",
      "ru": "Ему принадлежат ключи небес и земли. Он увеличивает удел кому пожелает, и ограничивает. Воистину, Он — знающий обо всём сущем."
    }
  },
  {
    "ref": "42:17",
    "sure": 42,
    "ayet": 17,
    "ar": "ٱللَّهُ ٱلَّذِىٓ أَنزَلَ ٱلْكِتَٰبَ بِٱلْحَقِّ وَٱلْمِيزَانَ وَمَا يُدْرِيكَ لَعَلَّ ٱلسَّاعَةَ قَرِيبٌ",
    "mealler": {
      "tr": "Allah hak ile kitabı ve mizanı indirendir. Ne bilirsin, saat/kıyamet belki de yakındır.",
      "en": "It is Allāh who has sent down the Book in truth and [also] the balance [i.e., justice]. And what will make you perceive? Perhaps the Hour is near.",
      "id": "Allah yang menurunkan kitab (Al-Qur`an) dengan (membawa) kebenaran dan neraca (keadilan). Dan tahukah kamu, boleh jadi hari Kiamat itu sudah dekat?",
      "de": "Allah ist es, Der das Buch mit der Wahrheit herabgesandt hat, und (auch) die Waage. Was läßt dich wissen? Vielleicht ist die Stunde nahe.",
      "bs": "Allah je Onaj Koji je Knjigu s Istinom i Mjerilo objavio! A šta ti znaš – možda je Čas kijameta blizu!",
      "ru": "Аллах — Тот, Кто ниспослал Писание с истиной и весы. А откуда тебе знать — быть может, Час уже близок?"
    }
  },
  {
    "ref": "43:3",
    "sure": 43,
    "ayet": 3,
    "ar": "إِنَّا جَعَلْنَٰهُ قُرْءَٰنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ",
    "mealler": {
      "tr": "Biz onu anlayasınız diye Arapça Kur’an kıldık.",
      "en": "Indeed, We have made it an Arabic Qur’ān that you might understand.",
      "id": "Kami menjadikan Al-Qur`an dalam bahasa Arab agar kamu mengerti.",
      "de": "Wir haben es ja zu einem arabischen Qur’an gemacht, auf daß ihr begreifen möget;",
      "fr": "Nous avons révélé le Livre sous forme d’une récitation en langue arabe afin que vous en compreniez la signification.",
      "bs": "Mi je objavljujemo kao Kur’an na arapskom jeziku da biste razumjeli,",
      "ru": "Воистину, Мы сделали его Кораном на арабском языке — быть может, вы уразумеете.",
      "ms": "Sesungguhnya Kami jadikan Kitab itu sebagai Quran yang diturunkan dengan bahasa Arab, supaya kamu (menggunakan akal) memahaminya."
    }
  },
  {
    "ref": "43:82",
    "sure": 43,
    "ayet": 82,
    "ar": "سُبْحَٰنَ رَبِّ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ رَبِّ ٱلْعَرْشِ عَمَّا يَصِفُونَ",
    "mealler": {
      "tr": "Göklerin ve yerin Rabbi, arşın Rabbi onların vasıflandırmalarından münezzehtir.",
      "en": "Exalted is the Lord of the heavens and the earth, Lord of the Throne, above what they describe.",
      "id": "Mahasuci Tuhan pemilik langit dan bumi, Tuhan pemilik Arasy, dari apa yang mereka sifatkan itu.\"",
      "de": "Preis sei dem Herrn der Himmel und der Erde, dem Herrn des Thrones! (Erhaben ist Er) über das, was sie (Ihm) zuschreiben.",
      "fr": "Gloire au Seigneur des cieux et de la terre, Seigneur du Trône que leurs blasphèmes ne sauraient toucher !",
      "bs": "Neka je slavljen i uzvišen Gospodar nebesa i Zemlje, i Gospodar Arša, od onoga kako Ga oni opisuju!",
      "ru": "Преславен Господь небес и земли, Господь Трона, от того, что они приписывают!",
      "ms": "Maha Suci Allah Tuhan yang menciptakan langit dan bumi, - tuhan yang mempunyai Arasy (yang melambangkan kebesarannya), - (Maha Sucilah Ia) dari apa yang mereka katakan itu."
    }
  },
  {
    "ref": "44:8",
    "sure": 44,
    "ayet": 8,
    "ar": "لَآ إِلَٰهَ إِلَّا هُوَ يُحْىِۦ وَيُمِيتُ رَبُّكُمْ وَرَبُّ ءَابَآئِكُمُ ٱلْأَوَّلِينَ",
    "mealler": {
      "tr": "O’ndan başka (hak) ilah yoktur. Diriltir ve öldürür. Sizin de Rabbiniz, sizden önceki atalarınızın da Rabbidir.",
      "en": "There is no deity except Him; He gives life and causes death. [He is] your Lord and the Lord of your first forefathers.",
      "id": "Tidak ada tuhan (yang berhak disembah) selain Dia, Dia yang menghidupkan dan mematikan. (Dialah) Tuhanmu dan Tuhan nenek moyangmu dahulu.",
      "de": "Es gibt keinen Gott außer Ihm. Er macht lebendig und läßt sterben, (Er), euer Herr und der Herr eurer Vorväter.",
      "fr": "Il n’est de divinité digne d’être adorée que Lui. Il donne la vie et la mort. Il est votre Seigneur et celui de vos ancêtres les plus éloignés.",
      "bs": "drugog boga osim Njega nema; On život i smrt daje – Gospodar vaš i Gospodar vaših predaka davnih!",
      "ru": "Нет божества, кроме Него. Он оживляет и умерщвляет, ваш Господь и Господь ваших праотцов.",
      "ms": "Tiada Tuhan yang berhak disembah melainkan Dia; Dia lah Yang menghidupkan dan Yang mematikan; (Dia lah jua) Tuhan kamu dan Tuhan datuk nenek kamu yang telah lalu."
    }
  },
  {
    "ref": "45:3",
    "sure": 45,
    "ayet": 3,
    "ar": "إِنَّ فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ لَـَٔايَٰتٍ لِّلْمُؤْمِنِينَ",
    "mealler": {
      "tr": "Şüphesiz göklerde ve yerde iman edenler için ayetler vardır.",
      "en": "Indeed, within the heavens and earth are signs for the believers.",
      "id": "Sungguh, pada langit dan bumi benar-benar terdapat tanda-tanda (kebesaran Allah) bagi orang-orang mukmin.",
      "de": "In den Himmeln und auf der Erde sind wahrlich Zeichen für die Gläubigen.",
      "fr": "Il est dans les cieux et sur la terre bien des signes pour les croyants.",
      "bs": "Na nebesima i na Zemlji, zaista, postoje znakovi za vjernike.",
      "ru": "Воистину, в небесах и на земле — знамения для верующих.",
      "ms": "Sesungguhnya pada langit dan bumi terdapat tanda-tanda (yang membuktikan kekuasaan Allah) bagi orang-orang yang beriman."
    }
  },
  {
    "ref": "45:12",
    "sure": 45,
    "ayet": 12,
    "ar": "ٱللَّهُ ٱلَّذِى سَخَّرَ لَكُمُ ٱلْبَحْرَ لِتَجْرِىَ ٱلْفُلْكُ فِيهِ بِأَمْرِهِۦ وَلِتَبْتَغُوا۟ مِن فَضْلِهِۦ وَلَعَلَّكُمْ تَشْكُرُونَ",
    "mealler": {
      "tr": "İçinde emri ile gemiler akıp gitsin, O’nun lütfunu arayasınız ve şükredesiniz diye Allah denizleri sizin hizmetinize vermiştir.",
      "en": "It is Allāh who subjected to you the sea so that ships may sail upon it by His command and that you may seek of His bounty; and perhaps you will be grateful.",
      "id": "Allah lah yang menundukkan laut untukmu agar kapal-kapal dapat berlayar di atasnya dengan perintah-Nya, dan agar kamu dapat mencari sebagian karunia-Nya, dan agar kamu bersyukur.",
      "de": "Allah ist es, Der euch das Meer dienstbar gemacht hat, damit die Schiffe darauf auf Seinen Befehl fahren und damit ihr nach etwas von Seiner Huld trachtet, und auf daß ihr dankbar sein möget.",
      "fr": "C’est Allah qui vous a soumis la mer sur laquelle, par Sa volonté, voguent des vaisseaux à bord desquels vous partez en quête de Ses faveurs. Peut-être Lui en serez-vous reconnaissants !",
      "bs": "Allah je Onaj Koji vam je potčinio more da bi lađe, odredbom Njegovom, po njemu plovile, da biste mogli tražiti blagodati Njegove i da biste bili zahvalni.",
      "ru": "Аллах — Тот, Кто подчинил вам море, чтобы по Его велению корабли плыли по нему, и чтобы вы искали из Его щедрости — быть может, вы будете благодарны.",
      "ms": "Allah yang memudahkan laut bagi kegunaan kamu, supaya kapal-kapal belayar padanya dengan perintahNya, dan supaya kamu mencari rezeki dari limpah kurniaNya, dan juga supaya kamu bersyukur."
    }
  },
  {
    "ref": "45:15",
    "sure": 45,
    "ayet": 15,
    "ar": "مَنْ عَمِلَ صَٰلِحًا فَلِنَفْسِهِۦ وَمَنْ أَسَآءَ فَعَلَيْهَا ثُمَّ إِلَىٰ رَبِّكُمْ تُرْجَعُونَ",
    "mealler": {
      "tr": "Kim salih amel yaparsa kendisi içindir. Kim de kötülük yaparsa o da kendi aleyhinedir. Sonunda Rabbinize döndürüleceksiniz.",
      "en": "Whoever does a good deed - it is for himself; and whoever does evil - it is against it [i.e., the self or soul]. Then to your Lord you will be returned.",
      "id": "Barangsiapa mengerjakan kebajikan, maka itu untuk dirinya sendiri, dan barangsiapa mengerjakan kejahatan, maka itu akan menimpa dirinya sendiri; kemudian kepada Tuhanmu kamu dikembalikan.",
      "de": "Wer rechtschaffen handelt, der (tut es) zu seinem eigenen Vorteil, und wer Böses tut, der (tut es) zu seinem eigenen Nachteil. Hierauf werdet ihr zu eurem Herrn zurückgebracht.",
      "fr": "Quiconque fait le bien, le fera dans son seul intérêt et quiconque commet le mal, en subira seul les effets. Puis c’est à votre Seigneur que vous serez tous ramenés.",
      "bs": "Onaj koji čini dobro – sebi ga čini, a onaj koji čini zlo – protiv sebe radi; a na kraju ćete se Gospodaru svome vratiti.",
      "ru": "Кто совершал праведное — себе во благо, а кто совершал дурное — себе во вред. Затем к своему Господу вы будете возвращены."
    }
  },
  {
    "ref": "45:20",
    "sure": 45,
    "ayet": 20,
    "ar": "هَٰذَا بَصَٰٓئِرُ لِلنَّاسِ وَهُدًى وَرَحْمَةٌ لِّقَوْمٍ يُوقِنُونَ",
    "mealler": {
      "tr": "Bu (Kur’an), insanlar için basiret ve iyice bilen bir toplum için hidayet ve rahmettir.",
      "en": "This [Qur’ān] is enlightenment for mankind and guidance and mercy for a people who are certain [in faith].",
      "id": "(Al-Qur`an) ini adalah pedoman bagi manusia, petunjuk dan rahmat bagi kaum yang meyakini.",
      "de": "Dies sind einsichtbringende Zeichen für die Menschen und Rechtleitung und Barmherzigkeit für Leute, die überzeugt sind.",
      "fr": "Voici un livre propre à éclairer les hommes, à assurer leur salut et plein de miséricorde pour ceux qui croient fermement.",
      "bs": "Ovaj Kur’an putokaz je ljudima, i uputa i milost onima koji čvrsto vjeruju.",
      "ru": "Это — наглядные доводы для людей, верное руководство и милость для людей, которые убеждены.",
      "ms": "Al-Quran ini menjadi panduan-panduan yang membuka matahati manusia, dan menjadi hidayah petunjuk serta membawa rahmat bagi kaum yang meyakini (kebenarannya)."
    }
  },
  {
    "ref": "46:3",
    "sure": 46,
    "ayet": 3,
    "ar": "مَا خَلَقْنَا ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ وَمَا بَيْنَهُمَآ إِلَّا بِٱلْحَقِّ وَأَجَلٍ مُّسَمًّى وَٱلَّذِينَ كَفَرُوا۟ عَمَّآ أُنذِرُوا۟ مُعْرِضُونَ",
    "mealler": {
      "tr": "Biz; gökleri, yeri ve ikisi arasında bulunanları ancak hak ile ve belli bir süre için yarattık. Buna rağmen kâfirler yine de uyarıldıkları şeylerden yüz çevirmektedirler.",
      "en": "We did not create the heavens and earth and what is between them except in truth and [for] a specified term. But those who disbelieve, from that of which they are warned, are turning away.",
      "fr": "Nous n’avons créé les cieux, la terre et ce qui se trouve entre eux que pour une juste raison et un terme déjà fixé. Les mécréants restent cependant sourds à Nos avertissements.",
      "bs": "Mi smo nebesa i Zemlju, i ono što je između njih, samo s Istinom stvorili i do roka određenog, ali oni koji ne vjeruju okreću se od onoga čime upozoravani budu.",
      "ru": "Мы сотворили небеса и землю, и то, что между ними, не иначе как с истиной и на назначенный срок. А те, которые отвергли веру, отворачиваются от того, в чём они были предостережены."
    }
  },
  {
    "ref": "46:33",
    "sure": 46,
    "ayet": 33,
    "ar": "أَوَلَمْ يَرَوْا۟ أَنَّ ٱللَّهَ ٱلَّذِى خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ وَلَمْ يَعْىَ بِخَلْقِهِنَّ بِقَٰدِرٍ عَلَىٰٓ أَن يُحْـِۧىَ ٱلْمَوْتَىٰ بَلَىٰٓ إِنَّهُۥ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "mealler": {
      "tr": "Görmediler mi ki gökleri ve yeri yaratan ve bunları yaratmakla yorulmayan Allah, ölüleri diriltmeye de güç yetirir? Evet, şüphesiz O her şeye güç yetirendir.",
      "en": "Do they not see that Allāh, who created the heavens and earth and did not fail in their creation, is able to give life to the dead? Yes. Indeed, He is over all things competent.",
      "fr": "Ne savent-ils pas qu’Allah, qui a créé sans aucune peine les cieux et la terre, est en mesure de ressusciter les morts ? Il est pourtant capable de toute chose.",
      "bs": "Zar ne znaju da je Allah – Koji je nebesa i Zemlju stvorio i Koji se nije nimalo umorio dok ih je stvarao – moćan oživiti mrtve? Jest, On sve može.",
      "ru": "Неужели они не видят, что Аллах, Который сотворил небеса и землю и не утомился их сотворением, способен оживить мёртвых? Напротив! Воистину, Он всемогущ над всем сущим."
    }
  },
  {
    "ref": "47:7",
    "sure": 47,
    "ayet": 7,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن تَنصُرُوا۟ ٱللَّهَ يَنصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ",
    "mealler": {
      "tr": "Ey İman edenler! Eğer Allah’a yardım ederseniz, O da size yardım edecek ve ayaklarınızı sabit kılacaktır.",
      "en": "O you who have believed, if you support Allāh, He will support you and plant firmly your feet.",
      "id": "Wahai orang-orang yang beriman! Jika kamu menolong (agama) Allah, niscaya Dia akan menolongmu dan meneguhkan kedudukanmu.",
      "de": "O die ihr glaubt, wenn ihr Allah(s Sache) helft, hilft Er euch und festigt eure Füße.",
      "fr": "Vous qui croyez ! Si vous soutenez la cause d’Allah, Il raffermira vos pas, vous permettant de triompher de vos ennemis.",
      "bs": "O vjernici, ako Allaha pomognete, i On će vama pomoći i korake vaše učvrstiti.",
      "ru": "О вы, которые уверовали! Если вы поможете Аллаху — Он поможет вам и укрепит ваши стопы.",
      "ms": "Wahai orang-orang yang beriman, kalau kamu membela (ugama) Allah nescaya Allah membela kamu (untuk mencapai kemenangan) dan meneguhkan tapak pendirian kamu."
    }
  },
  {
    "ref": "47:33",
    "sure": 47,
    "ayet": 33,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَطِيعُوا۟ ٱللَّهَ وَأَطِيعُوا۟ ٱلرَّسُولَ وَلَا تُبْطِلُوٓا۟ أَعْمَٰلَكُمْ",
    "mealler": {
      "tr": "Ey iman edenler! Allah’a itaat edin, Peygamber'e itaat edin ve amellerinizi boşa çıkarmayın.",
      "en": "O you who have believed, obey Allāh and obey the Messenger and do not invalidate your deeds.",
      "id": "Wahai orang-orang yang beriman! Taatlah kepada Allah dan taatlah kepada Rasul, dan janganlah kamu merusakkan segala amalmu!",
      "de": "O die ihr glaubt, gehorcht Allah und gehorcht dem Gesandten und macht eure Werke nicht zunichte.",
      "fr": "Vous qui croyez ! Obéissez à Allah et obéissez au Messager ! Ne rendez pas vaines vos œuvres !",
      "bs": "O vjernici, pokoravajte se Allahu i pokoravajte se Poslaniku, i ne ništite djela svoja!",
      "ru": "О вы, которые уверовали! Повинуйтесь Аллаху и повинуйтесь Посланнику, и не делайте тщетными свои деяния.",
      "ms": "Wahai orang-orang yang beriman! Taatlah kamu kepada Allah dan taatlah kepada Rasul Allah, dan janganlah kamu batalkan amal-amal kamu!"
    }
  },
  {
    "ref": "47:36",
    "sure": 47,
    "ayet": 36,
    "ar": "إِنَّمَا ٱلْحَيَوٰةُ ٱلدُّنْيَا لَعِبٌ وَلَهْوٌ وَإِن تُؤْمِنُوا۟ وَتَتَّقُوا۟ يُؤْتِكُمْ أُجُورَكُمْ وَلَا يَسْـَٔلْكُمْ أَمْوَٰلَكُمْ",
    "mealler": {
      "tr": "Dünya hayatı ancak bir oyun ve eğlencedir. Eğer iman eder ve takvalı olursanız size mükâfatınızı verir ve sizden mallarınızı istemez.",
      "en": "[This] worldly life is only amusement and diversion. And if you believe and fear Allāh, He will give you your rewards and not ask you for your properties.",
      "id": "Sesungguhnya kehidupan dunia itu hanyalah permainan dan senda gurau. Jika kamu beriman serta bertakwa, Allah akan memberikan pahala kepadamu, dan Dia tidak akan meminta hartamu.",
      "de": "Das diesseitige Leben ist nur Spiel und Zerstreuung. Wenn ihr glaubt und gottesfürchtig seid, wird Er euch euren Lohn geben und von euch nicht euren (gesamten) Besitz verlangen.",
      "fr": "Cette vie n’est que jeu et vanité. Mais si vous avez la foi et craignez Allah, Il vous accordera la récompense que vous méritez sans pour autant exiger vos biens en totalité.",
      "bs": "Život na ovom svijetu je samo igra i zabava! A ako budete vjerovali i grijehe izbjegavali, On će vas nagraditi i imanja vaša od vas neće tražiti.",
      "ru": "Воистину, мирская жизнь — лишь игра и забава. Но если вы уверуете и будете богобоязненны, Он дарует вам ваши награды и не потребует от вас вашего имущества."
    }
  },
  {
    "ref": "48:28",
    "sure": 48,
    "ayet": 28,
    "ar": "هُوَ ٱلَّذِىٓ أَرْسَلَ رَسُولَهُۥ بِٱلْهُدَىٰ وَدِينِ ٱلْحَقِّ لِيُظْهِرَهُۥ عَلَى ٱلدِّينِ كُلِّهِۦ وَكَفَىٰ بِٱللَّهِ شَهِيدًا",
    "mealler": {
      "tr": "Bütün dinlerden üstün kılmak üzere, Peygamberini hidayet ve hak din ile gönderen O'dur. Şahit olarak Allah yeter.",
      "en": "It is He who sent His Messenger with guidance and the religion of truth to manifest it over all religion. And sufficient is Allāh as Witness.",
      "id": "Dialah yang mengutus Rasul-Nya dengan membawa petunjuk dan agama yang benar, agar dimenangkan-Nya terhadap semua agama. Dan cukuplah Allah sebagai saksi.",
      "de": "Er ist es, Der Seinen Gesandten mit der Rechtleitung und der Religion der Wahrheit gesandt hat, um ihr die Oberhand über alle Religion zu geben. Und Allah genügt als Zeuge.",
      "bs": "On je poslao Poslanika Svog s Uputom i vjerom istinitom da bi je uzdigao iznad svih vjera. A Allah je dovoljan Svjedok!",
      "ru": "Он — Тот, Кто послал Своего посланника с верным руководством и религией истины, чтобы возвысить её над всеми религиями. Достаточно Аллаха в качестве свидетеля."
    }
  },
  {
    "ref": "49:6",
    "sure": 49,
    "ayet": 6,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن جَآءَكُمْ فَاسِقٌۢ بِنَبَإٍ فَتَبَيَّنُوٓا۟ أَن تُصِيبُوا۟ قَوْمًۢا بِجَهَٰلَةٍ فَتُصْبِحُوا۟ عَلَىٰ مَا فَعَلْتُمْ نَٰدِمِينَ",
    "mealler": {
      "tr": "Ey iman edenler! Eğer bir fasık size bir haber getirirse onun doğruluğunu araştırın. Yoksa bilmeden bir topluluğa kötülük edersiniz de sonra yaptığınıza pişman olursunuz.",
      "en": "O you who have believed, if there comes to you a disobedient one with information, investigate, lest you harm a people out of ignorance and become, over what you have done, regretful.",
      "fr": "Vous qui croyez ! Si un homme sans moralité vous apporte une nouvelle, assurez-vous de sa véracité, de crainte de porter préjudice à des innocents sans le vouloir et ensuite de le regretter.",
      "bs": "O vjernici, ako vam nekakav nepošten čovjek donese kakvu vijest, dobro je provjerite, da u neznanju nekom zlo ne učinite, pa da se zbog onog što ste učinili pokajete.",
      "ru": "О вы, которые уверовали! Если к вам придёт нечестивец с вестью, то удостоверьтесь, чтобы по неведению не нанести вред людям, и чтобы потом не сожалеть о содеянном."
    }
  },
  {
    "ref": "49:10",
    "sure": 49,
    "ayet": 10,
    "ar": "إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا۟ بَيْنَ أَخَوَيْكُمْ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُرْحَمُونَ",
    "mealler": {
      "tr": "Müminler ancak kardeştirler. Öyleyse kardeşlerinizin arasını düzeltin ve Allah’tan sakının ki, merhamet olunasınız.",
      "en": "The believers are but brothers, so make settlement between your brothers. And fear Allāh that you may receive mercy.",
      "id": "Sesungguhnya orang-orang mukmin itu bersaudara, karena itu damaikanlah antara kedua saudaramu (yang berselisih) dan bertakwalah kepada Allah agar kamu mendapat rahmat.",
      "de": "Die Gläubigen sind doch Brüder. So stiftet Frieden zwischen euren beiden Brüdern und fürchtet Allah, auf daß ihr Erbarmen finden möget.",
      "fr": "En réalité, les croyants sont des frères. Réconciliez donc vos frères ! Craignez Allah de manière à être touchés par Sa grâce !",
      "bs": "Vjernici su samo braća, zato pomirite vaša dva brata i bojte se Allaha da bi vam se milost ukazala.",
      "ru": "Воистину, верующие — лишь братья. Так примиряйте же ваших братьев и бойтесь Аллаха — быть может, вы будете помилованы.",
      "ms": "Sebenarnya orang-orang yang beriman itu adalah bersaudara, maka damaikanlah di antara dua saudara kamu (yang bertelingkah) itu; dan bertaqwalah kepada Allah supaya kamu beroleh rahmat."
    }
  },
  {
    "ref": "49:18",
    "sure": 49,
    "ayet": 18,
    "ar": "إِنَّ ٱللَّهَ يَعْلَمُ غَيْبَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَٱللَّهُ بَصِيرٌۢ بِمَا تَعْمَلُونَ",
    "mealler": {
      "tr": "Allah, şüphesiz göklerin ve yerin gaybını bilir. Allah, yapmakta olduğunuz amelleri hakkıyla görendir.",
      "en": "Indeed, Allāh knows the unseen [aspects] of the heavens and the earth. And Allāh is Seeing of what you do.",
      "id": "Sungguh, Allah mengetahui apa yang gaib di langit dan di bumi. Dan Allah Maha Melihat apa yang kamu kerjakan.",
      "de": "Gewiß, Allah kennt das Verborgene der Himmel und der Erde. Und Allah sieht wohl, was ihr tut.",
      "fr": "Allah seul connaît les mystères des cieux et de la terre et Il voit parfaitement ce que vous faites.",
      "bs": "Allah, sigurno, zna tajne nebesa i Zemlje i Allah dobro vidi ono što radite.”",
      "ru": "Воистину, Аллах знает сокровенное небес и земли. Аллах — видящий то, что вы совершаете.",
      "ms": "“Sesungguhnya Allah mengetahui segala rahsia langit dan bumi, dan Allah Maha Melihat akan segala yang kamu kerjakan”."
    }
  },
  {
    "ref": "50:6",
    "sure": 50,
    "ayet": 6,
    "ar": "أَفَلَمْ يَنظُرُوٓا۟ إِلَى ٱلسَّمَآءِ فَوْقَهُمْ كَيْفَ بَنَيْنَٰهَا وَزَيَّنَّٰهَا وَمَا لَهَا مِن فُرُوجٍ",
    "mealler": {
      "tr": "Üzerlerindeki göğe hiç bakmıyorlar mı? Onu nasıl bina ettik, nasıl süsledik? Onda bir çatlak da yoktur.",
      "en": "Have they not looked at the heaven above them - how We structured it and adorned it and [how] it has no rifts?",
      "id": "Maka tidakkah mereka memperhatikan langit yang ada di atas mereka, bagaimana cara Kami membangunnya dan menghiasinya, dan tidak terdapat retak-retak sedikit pun?",
      "de": "Schauen sie denn nicht zum Himmel über ihnen, wie Wir ihn aufgebaut und geschmückt haben, und daß er keine Spalten hat?",
      "fr": "Ne voient-ils pas le ciel au-dessus d’eux, comme Nous l’avons édifié, paré d’étoiles et créé sans faille ?",
      "bs": "A zašto ne pogledaju nebo iznad sebe – kako smo ga sazdali i ukrasili i kako u njemu nema nereda!?",
      "ru": "Неужели они не смотрели на небо над собой, как Мы воздвигли его и украсили, и нет в нём никаких расщелин?"
    }
  },
  {
    "ref": "50:18",
    "sure": 50,
    "ayet": 18,
    "ar": "مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ",
    "mealler": {
      "tr": "İnsan hiçbir söz söylemez ki, yanında gözetleyen yazmaya hazır bir melek bulunmasın.",
      "en": "He [i.e., man] utters no word except that with him is an observer prepared [to record].",
      "id": "Tidak ada suatu kata yang diucapkannya melainkan ada di sisinya malaikat pengawas yang selalu siap (mencatat).",
      "de": "Kein Wort äußert er, ohne daß bei ihm ein Beobachter bereit wäre.",
      "fr": "Il ne prononce, en effet, aucun mot sans avoir à ses côtés un ange prêt à le consigner.",
      "bs": "on ne izusti ni jednu riječ, a da pored njega nije prisutan onaj koji bdije.",
      "ru": "Он не произнесёт ни единого слова, без того чтобы при нём не был бдительный наблюдатель.",
      "ms": "Tidak ada sebarang perkataan yang dilafazkannya (atau perbuatan yang dilakukannya) melainkan ada di sisinya malaikat pengawas yang sentiasa sedia (menerima dan menulisnya)."
    }
  },
  {
    "ref": "54:49",
    "sure": 54,
    "ayet": 49,
    "ar": "إِنَّا كُلَّ شَىْءٍ خَلَقْنَٰهُ بِقَدَرٍ",
    "mealler": {
      "tr": "Biz her şeyi bir kaderle yarattık.",
      "en": "Indeed, all things We created with predestination.",
      "id": "Sungguh, Kami menciptakan segala sesuatu menurut ukuran.",
      "de": "Gewiß, Wir haben alles in (bestimmtem) Maß erschaffen.",
      "fr": "Nous avons créé toute chose selon un décret préalable.",
      "bs": "Mi, doista, sve s određenjem stvaramo",
      "ru": "Воистину, всё сущее Мы сотворили по предопределению.",
      "ms": "Sesungguhnya Kami menciptakan tiap-tiap sesuatu menurut takdir (yang telah ditentukan)."
    }
  },
  {
    "ref": "55:60",
    "sure": 55,
    "ayet": 60,
    "ar": "هَلْ جَزَآءُ ٱلْإِحْسَٰنِ إِلَّا ٱلْإِحْسَٰنُ",
    "mealler": {
      "tr": "İyiliğin karşılığı iyilikten başkası olabilir mi?",
      "en": "Is the reward for good [anything] but good?",
      "id": "Tidak ada balasan untuk kebaikan selain kebaikan (pula).",
      "de": "Ist der Lohn des Guten nicht ebenfalls das Gute?",
      "fr": "Y aurait-il d’autre récompense pour ceux qui font le bien que l’éternelle félicité ?",
      "bs": "Zar za dobro učinjeno djelo nagrada može biti nešto drugo do dobro?!",
      "ru": "Разве может быть воздаяние за добродетель иным, кроме добродетели?",
      "ms": "Bukankah tidak ada balasan bagi amal yang baik - melainkan balasan yang baik juga?"
    }
  },
  {
    "ref": "55:78",
    "sure": 55,
    "ayet": 78,
    "ar": "تَبَٰرَكَ ٱسْمُ رَبِّكَ ذِى ٱلْجَلَٰلِ وَٱلْإِكْرَامِ",
    "mealler": {
      "tr": "Azamet ve ikram sahibi Rabbinin adı ne yücedir.",
      "en": "Blessed is the name of your Lord, Owner of Majesty and Honor.",
      "id": "Mahasuci nama Tuhanmu Pemilik Keagungan dan Kemuliaan.",
      "de": "Segensreich ist der Name deines Herrn, Besitzer der Erhabenheit und Ehre!",
      "fr": "Béni soit le nom de ton Seigneur, Dieu de majesté et de générosité.",
      "bs": "Neka je uzvišeno ime Gospodara tvoga, Veličanstvenog i Plemenitog!",
      "ru": "Благословенно имя твоего Господа, Обладателя величия и щедрости.",
      "ms": "Maha Sucilah nama Tuhanmu yang mempunyai Kebesaran dan Kemuliaan."
    }
  },
  {
    "ref": "56:77",
    "sure": 56,
    "ayet": 77,
    "ar": "إِنَّهُۥ لَقُرْءَانٌ كَرِيمٌ",
    "mealler": {
      "tr": "Şüphesiz bu, değerli bir Kur'an'dır.",
      "en": "Indeed, it is a noble Qur’ān.",
      "id": "dan (ini) sesungguhnya Al-Qur`an yang sangat mulia,",
      "de": "Das ist wahrlich ein ehrwürdiger Qur’an",
      "fr": "que le Coran est une sublime récitation,",
      "bs": "On je, zaista, Kur’an plemeniti",
      "ru": "Воистину, это — благородный Коран,",
      "ms": "Bahawa sesungguhnya (yang dibacakan kepada kamu) itu ialah Al-Quran yang mulia, (yang sentiasa memberi ajaran dan pimpinan),"
    }
  },
  {
    "ref": "57:2",
    "sure": 57,
    "ayet": 2,
    "ar": "لَهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ يُحْىِۦ وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
    "mealler": {
      "tr": "Göklerin ve yerin mülkü O’nundur. O; diriltir, öldürür. O, her şeye gücü yetendir.",
      "en": "His is the dominion of the heavens and earth. He gives life and causes death, and He is over all things competent.",
      "id": "Milik-Nyalah kerajaan langit dan bumi, Dia menghidupkan dan mematikan, dan Dia Mahakuasa atas segala sesuatu.",
      "de": "Ihm gehört die Herrschaft der Himmel und der Erde. Er macht lebendig und läßt sterben. Und Er hat zu allem die Macht.",
      "fr": "Il règne en Maître absolu sur les cieux et la terre. Il donne la vie et la mort, et Il a pouvoir sur toute chose.",
      "bs": "Njegova je vlast na nebesima i na Zemlji; On život i smrt daje, i On nad svime ima moć.",
      "ru": "Ему принадлежит владычество небес и земли. Он оживляет и умерщвляет, и Он — всемогущ над всем сущим.",
      "ms": "Dia lah sahaja yang menguasai dan memiliki langit dan bumi; Ia menghidupkan dan mematikan; dan Ia Maha Kuasa atas tiap-tiap sesuatu."
    }
  },
  {
    "ref": "57:5",
    "sure": 57,
    "ayet": 5,
    "ar": "لَّهُۥ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَإِلَى ٱللَّهِ تُرْجَعُ ٱلْأُمُورُ",
    "mealler": {
      "tr": "Göklerin ve yerin mülkü O’nundur. Bütün işler Allah’a döner.",
      "en": "His is the dominion of the heavens and earth. And to Allāh are returned [all] matters.",
      "id": "Milik-Nyalah kerajaan langit dan bumi. Dan hanya kepada Allah segala urusan dikembali­kan.",
      "de": "Ihm gehört die Herrschaft der Himmel und der Erde. Und zu Allah werden die Angelegenheiten zurückgebracht.",
      "fr": "Il règne en Maître absolu sur les cieux et la terre, et c’est à Allah que tout doit revenir.",
      "bs": "Njegova je vlast na nebesima i na Zemlji, i Allahu će se sve vratiti!",
      "ru": "Ему принадлежит владычество небес и земли, к Аллаху возвращаются все дела.",
      "ms": "Dia lah sahaja yang menguasai dan memiliki langit dan bumi; dan kepada Allah jualah dikembalikan segala urusan."
    }
  },
  {
    "ref": "57:6",
    "sure": 57,
    "ayet": 6,
    "ar": "يُولِجُ ٱلَّيْلَ فِى ٱلنَّهَارِ وَيُولِجُ ٱلنَّهَارَ فِى ٱلَّيْلِ وَهُوَ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    "mealler": {
      "tr": "Geceyi gündüze katar, gündüzü de geceye katar. O, kalplerde olan her şeyi bilir.",
      "en": "He causes the night to enter the day and causes the day to enter the night, and He is Knowing of that within the breasts.",
      "id": "Dia memasukkan malam ke dalam siang dan memasukkan siang ke dalam malam. Dan Dia Maha Mengetahui segala isi hati.",
      "de": "Er läßt die Nacht in den Tag eindringen und läßt den Tag in die Nacht eindringen. Und Er weiß über das Innerste der Brüste Bescheid.",
      "fr": "Il fait pénétrer la nuit dans le jour et le jour dans la nuit, et Il sait parfaitement ce que renferment les cœurs.",
      "bs": "On uvodi noć u dan i dan u noć, i On zna što se u grudima skriva.",
      "ru": "Он вводит ночь в день и вводит день в ночь. Он — знающий то, что таится в сердцах."
    }
  },
  {
    "ref": "57:9",
    "sure": 57,
    "ayet": 9,
    "ar": "هُوَ ٱلَّذِى يُنَزِّلُ عَلَىٰ عَبْدِهِۦٓ ءَايَٰتٍۭ بَيِّنَٰتٍ لِّيُخْرِجَكُم مِّنَ ٱلظُّلُمَٰتِ إِلَى ٱلنُّورِ وَإِنَّ ٱللَّهَ بِكُمْ لَرَءُوفٌ رَّحِيمٌ",
    "mealler": {
      "tr": "Sizi karanlıklardan aydınlığa çıkarmak için kuluna apaçık ayetler indiren O’dur. Şüphesiz Allah, size karşı çok şefkatli, çok merhametlidir.",
      "en": "It is He who sends down upon His Servant [Muḥammad (ﷺ)] verses of clear evidence that He may bring you out from darknesses into the light. And indeed, Allāh is to you Kind and Merciful.",
      "de": "Er ist es, Der Seinem Diener klare Zeichen offenbart, damit Er euch aus den Finsternissen ins Licht hinausbringt. Und Allah ist wahrlich mit euch Gnädig und Barmherzig.",
      "fr": "C’est Lui qui révèle à Son serviteur des versets parfaitement clairs afin de vous tirer des ténèbres vers la lumière. Allah est, envers vous, toute bonté et toute miséricorde.",
      "bs": "On robu Svome objavljuje jasne ajete da bi vas iz tmina na svjetlo izveo – a Allah je, uistinu, prema vama milosrdan i milostiv.",
      "ru": "Он — Тот, Кто ниспосылает Своему рабу ясные знамения, чтобы вывести вас из тьмы к свету. И воистину, Аллах к вам — сострадательный, милующий."
    }
  },
  {
    "ref": "57:18",
    "sure": 57,
    "ayet": 18,
    "ar": "إِنَّ ٱلْمُصَّدِّقِينَ وَٱلْمُصَّدِّقَٰتِ وَأَقْرَضُوا۟ ٱللَّهَ قَرْضًا حَسَنًا يُضَٰعَفُ لَهُمْ وَلَهُمْ أَجْرٌ كَرِيمٌ",
    "mealler": {
      "tr": "Şüphesiz ki sadaka veren erkeklerle sadaka veren kadınlar ve Allah’a güzel bir borç verenler var ya, (verdikleri) onlara kat kat ödenir. Ayrıca onlara çok değerli bir mükâfat da vardır.",
      "en": "Indeed, the men who practice charity and the women who practice charity and [they who] have loaned Allāh a goodly loan - it will be multiplied for them, and they will have a noble reward.",
      "de": "Gewiß, denjenigen Männern, die Almosen geben und denjenigen Frauen, die Almosen geben und (damit) ein gutes Darlehen geben, wird es vervielfacht werden; und für sie wird es trefflichen Lohn geben.",
      "fr": "Les hommes et les femmes qui, par leurs aumônes, font à Allah un prêt sincère obtiendront en retour une récompense décuplée et une généreuse rétribution.",
      "bs": "Onima koji milostinju i zekat budu udjeljivali i onima koje je budu udjeljivale, i koji drage volje Allahu zajam budu davali – mnogostruko će se vratiti i njih čeka nagrada divna.",
      "ru": "Воистину, делающим пожертвования мужчинам и делающим пожертвования женщинам, и тем, кто дал Аллаху благой заём, будет приумножено, и для них — щедрая награда."
    }
  },
  {
    "ref": "58:21",
    "sure": 58,
    "ayet": 21,
    "ar": "كَتَبَ ٱللَّهُ لَأَغْلِبَنَّ أَنَا۠ وَرُسُلِىٓ إِنَّ ٱللَّهَ قَوِىٌّ عَزِيزٌ",
    "mealler": {
      "tr": "Allah: “Andolsun ki ben ve rasullerim mutlaka galip geleceğim” diye yazmıştır. Şüphesiz Allah; çok kuvvetlidir, çok güçlüdür.",
      "en": "Allāh has written [i.e., decreed], \"I will surely overcome, I and My messengers.\" Indeed, Allāh is Powerful and Exalted in Might.",
      "id": "Allah telah menetapkan, \"Aku dan rasul-rasul-Ku pasti menang.\" Sungguh, Allah Mahakuat, Mahaperkasa.",
      "de": "Allah hat (vor)geschrieben: Siegen werde Ich ganz gewiß, (Ich) und Meine Gesandten. Gewiß, Allah ist Stark und Allmächtig.",
      "fr": "Allah a décrété : « Je triompherai assurément, ainsi que Mes Messagers. » Allah est Fort et Tout-Puissant.",
      "bs": "Allah je zapisao: \"Ja i poslanici Moji sigurno ćemo pobijediti!\" Allah je, zaista, moćan i silan.",
      "ru": "Аллах предначертал: «Я непременно одержу верх — Я и Мои посланники!» Воистину, Аллах — сильный, могущественный.",
      "ms": "Allah telah menetapkan: “Sesungguhnya Aku dan Rasul-rasulKu tetap mengalahkan (golongan yang menentang)”. Sesungguhnya Allah Maha Kuat, lagi Maha kuasa."
    }
  },
  {
    "ref": "59:18",
    "sure": 59,
    "ayet": 18,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ وَٱتَّقُوا۟ ٱللَّهَ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا تَعْمَلُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Allah'tan korkup sakının. Herkes yarın için neyi takdim edip gönderdiğine baksın. Allah’tan sakının. Çünkü Allah, tüm yaptıklarınızdan haberdardır.",
      "en": "O you who have believed, fear Allāh. And let every soul look to what it has put forth for tomorrow - and fear Allāh. Indeed, Allāh is Aware of what you do.",
      "de": "O die ihr glaubt, fürchtet Allah. Und eine jede Seele schaue, was sie für morgen vorausschickt. Und fürchtet Allah; gewiß, Allah ist Kundig dessen, was ihr tut.",
      "fr": "Vous qui croyez ! Craignez Allah et que chacun considère les œuvres qu’il a accomplies pour le salut de son âme. Craignez Allah qui est parfaitement informé de ce que vous faites.",
      "bs": "O vi koji vjerujete, Allaha se bojte, i neka svaki čovjek gleda šta je za sutra pripremio, i Allaha se bojte. Allah, zaista, u potpunosti zna ono što radite.",
      "ru": "О вы, которые уверовали! Бойтесь Аллаха, и пусть каждая душа посмотрит, что она приготовила на завтра. И бойтесь Аллаха. Воистину, Аллах — сведущий о том, что вы совершаете."
    }
  },
  {
    "ref": "59:20",
    "sure": 59,
    "ayet": 20,
    "ar": "لَا يَسْتَوِىٓ أَصْحَٰبُ ٱلنَّارِ وَأَصْحَٰبُ ٱلْجَنَّةِ أَصْحَٰبُ ٱلْجَنَّةِ هُمُ ٱلْفَآئِزُونَ",
    "mealler": {
      "tr": "Cehennem ehli ile Cennet ehli bir değildir. Cennet ehli; onlar, kurtulacak olanlardır.",
      "en": "Not equal are the companions of the Fire and the companions of Paradise. The companions of Paradise - they are the attainers [of success].",
      "id": "Tidak sama para penghuni neraka dengan para penghuni surga; para penghuni surga itulah orang-orang yang memperoleh kemenangan.",
      "de": "Nicht gleich sind die Insassen des (Höllen)feuers und die Insassen des (Paradies)gartens. Die Insassen des (Paradies)gartens sind die Erfolgreichen.",
      "fr": "Les damnés de l’Enfer ne sont en rien comparables aux élus du Paradis. Seuls les élus du Paradis ont gagné leur salut.",
      "bs": "Nisu jednaki stanovnici Džehennema i stanovnici Dženneta; stanovnici Dženneta baš su uspješni.",
      "ru": "Не равны обитатели адского огня и обитатели Рая. Обитатели Рая — они и есть преуспевшие.",
      "ms": "Tidaklah sama ahli neraka dan ahli Syurga; ahli Syurgalah orang-orang yang beroleh kemenangan (mendapat segala yang diingini)."
    }
  },
  {
    "ref": "59:21",
    "sure": 59,
    "ayet": 21,
    "ar": "لَوْ أَنزَلْنَا هَٰذَا ٱلْقُرْءَانَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُۥ خَٰشِعًا مُّتَصَدِّعًا مِّنْ خَشْيَةِ ٱللَّهِ وَتِلْكَ ٱلْأَمْثَٰلُ نَضْرِبُهَا لِلنَّاسِ لَعَلَّهُمْ يَتَفَكَّرُونَ",
    "mealler": {
      "tr": "Biz bu Kur’an’ı bir dağın üzerine indirseydik, onun Allah korkusundan baş eğerek parça parça olduğunu görürdün. İşte biz, bu örnekleri insanlar düşünsünler diye veriyoruz.",
      "en": "If We had sent down this Qur’ān upon a mountain, you would have seen it humbled and splitting from fear of Allāh. And these examples We present to the people that perhaps they will give thought.",
      "bs": "Da ovaj Kur'an kakvom brdu objavimo, ti bi vidio kako je strahopoštovanja puno i kako bi se od straha pred Allahom raspalo. Takve primjere navodimo ljudima da bi razmislili.",
      "ru": "Если бы Мы ниспослали этот Коран на гору, ты увидел бы её смиренной и раскалывающейся от страха перед Аллахом. Эти притчи Мы приводим людям — быть может, они поразмыслят."
    }
  },
  {
    "ref": "61:2",
    "sure": 61,
    "ayet": 2,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Yapmayacağınız şeyi ne diye söylersiniz?",
      "en": "O you who have believed, why do you say what you do not do?",
      "id": "Wahai orang-orang yang beriman! Mengapa kamu mengatakan sesuatu yang tidak kamu kerjakan?",
      "de": "O die ihr glaubt, warum sagt ihr, was ihr nicht tut?",
      "fr": "Vous qui croyez ! Pourquoi vos paroles ne sont-elles pas suivies d’actes ?",
      "bs": "O vi koji vjerujete, zašto govorite ono što ne činite?!",
      "ru": "О вы, которые уверовали! Почему вы говорите то, чего не делаете?",
      "ms": "Wahai orang-orang yang beriman! Mengapa kamu memperkatakan apa yang kamu tidak melakukannya!"
    }
  },
  {
    "ref": "61:3",
    "sure": 61,
    "ayet": 3,
    "ar": "كَبُرَ مَقْتًا عِندَ ٱللَّهِ أَن تَقُولُوا۟ مَا لَا تَفْعَلُونَ",
    "mealler": {
      "tr": "Yapmayacağınız şeyleri söylemeniz, Allah katında büyük gazap gerektiren bir iştir.",
      "en": "Greatly hateful in the sight of Allāh is that you say what you do not do.",
      "id": "(Itu) sangatlah dibenci di sisi Allah jika kamu mengatakan apa-apa yang tidak kamu kerjakan.",
      "de": "Welch schwerwiegende Abscheu erregt es bei Allah, daß ihr sagt, was ihr nicht tut.",
      "fr": "Allah a en horreur l’attitude des hommes qui ne traduisent pas leurs paroles en actes.",
      "bs": "Kako samo Allah prezire da govorite ono što ne činite!",
      "ru": "Велика ненависть Аллаха к тому, что вы говорите то, чего не делаете!",
      "ms": "Amat besar kebenciannya di sisi Allah - kamu memperkatakan sesuatu yang kamu tidak melakukannya."
    }
  },
  {
    "ref": "63:9",
    "sure": 63,
    "ayet": 9,
    "ar": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُلْهِكُمْ أَمْوَٰلُكُمْ وَلَآ أَوْلَٰدُكُمْ عَن ذِكْرِ ٱللَّهِ وَمَن يَفْعَلْ ذَٰلِكَ فَأُو۟لَٰٓئِكَ هُمُ ٱلْخَٰسِرُونَ",
    "mealler": {
      "tr": "Ey iman edenler! Mallarınız ve çocuklarınız sizi Allah’ın zikrinden alıkoymasın. Kim bunu yaparsa, işte onlar hüsrana uğrayacaklardır.",
      "en": "O you who have believed, let not your wealth and your children divert you from the remembrance of Allāh. And whoever does that - then those are the losers.",
      "id": "Wahai orang-orang yang beriman! Janganlah harta bendamu dan anak-anakmu melalaikan kamu dari mengingat Allah. Dan barangsiapa berbuat demikian, maka mereka itulah orang-orang yang rugi.",
      "de": "O die ihr glaubt, nicht ablenken sollen euch euer Besitz und eure Kinder von Allahs Gedenken. Diejenigen, die dies tun, das sind die Verlierer.",
      "fr": "Vous qui croyez ! Ne laissez pas vos biens et vos enfants vous détourner du souvenir d’Allah. Ceux qui se laissent ainsi distraire sont perdus.",
      "bs": "O vi koji vjerujete, neka vas imanja vaša i djeca vaša ne zabave od spominjanja Allaha. A oni koji to učine, pravi su gubitnici.",
      "ru": "О вы, которые уверовали! Пусть ни ваше имущество, ни ваши дети не отвлекают вас от поминания Аллаха. А кто поступит так, такие — они и есть потерпевшие убыток."
    }
  },
  {
    "ref": "64:2",
    "sure": 64,
    "ayet": 2,
    "ar": "هُوَ ٱلَّذِى خَلَقَكُمْ فَمِنكُمْ كَافِرٌ وَمِنكُم مُّؤْمِنٌ وَٱللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
    "mealler": {
      "tr": "Sizi yaratan O’dur. Sizden bir kısmınız kâfir, bir kısmınız Mümindir. Allah, tüm yaptıklarınızı görendir.",
      "en": "It is He who created you, and among you is the disbeliever, and among you is the believer. And Allāh, of what you do, is Seeing.",
      "id": "Dialah yang menciptakan kamu, lalu di antara kamu ada yang kafir dan di antara kamu (juga) ada yang mukmin. Dan Allah Maha Melihat apa yang kamu kerjakan.",
      "de": "Er ist es, Der euch erschaffen hat. So gibt es unter euch Ungläubige und gibt es unter euch Gläubige, und was ihr tut, sieht Allah wohl.",
      "bs": "On je Onaj Koji vas stvara, pa ima među vama i nevjernika, a ima među vama i vjernika. Sve što vi radite Allah dobro vidi.",
      "ru": "Он — Тот, Кто сотворил вас: и среди вас есть отвергший веру, и среди вас есть верующий. И Аллах — видящий то, что вы совершаете."
    }
  },
  {
    "ref": "64:4",
    "sure": 64,
    "ayet": 4,
    "ar": "يَعْلَمُ مَا فِى ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ وَيَعْلَمُ مَا تُسِرُّونَ وَمَا تُعْلِنُونَ وَٱللَّهُ عَلِيمٌۢ بِذَاتِ ٱلصُّدُورِ",
    "mealler": {
      "tr": "Göklerde ve yerde olanları bilir. Gizlediklerinizi ve açığa vurduklarınızı da bilir. Allah kalplerde olanı hakkıyla bilendir.",
      "en": "He knows what is within the heavens and earth and knows what you conceal and what you declare. And Allāh is Knowing of that within the breasts.",
      "id": "Dia mengetahui apa yang ada di langit dan di bumi, dan mengetahui apa yang kamu rahasiakan dan apa yang kamu nyatakan. Dan Allah Maha Mengetahui segala isi hati.",
      "de": "Er weiß, was in den Himmeln und auf der Erde ist, und Er weiß, was ihr geheimhaltet und was ihr offenlegt. Und Allah weiß über das Innerste der Brüste Bescheid.",
      "bs": "On zna šta na nebesima i na Zemlji postoji i zna šta krijete i šta pokazujete! Allah dobro zna šta grudi kriju.",
      "ru": "Он знает всё, что на небесах и на земле, и знает, что вы скрываете и что объявляете открыто. Аллах — знающий то, что таится в сердцах."
    }
  },
  {
    "ref": "64:11",
    "sure": 64,
    "ayet": 11,
    "ar": "مَآ أَصَابَ مِن مُّصِيبَةٍ إِلَّا بِإِذْنِ ٱللَّهِ وَمَن يُؤْمِنۢ بِٱللَّهِ يَهْدِ قَلْبَهُۥ وَٱللَّهُ بِكُلِّ شَىْءٍ عَلِيمٌ",
    "mealler": {
      "tr": "Hiçbir musibet, Allah’ın izni olmadıkça isabet etmez. Kim, Allah’a iman ederse Allah onun kalbine hidayet verir. Allah, her şeyi bilir.",
      "en": "No disaster strikes except by permission of Allāh. And whoever believes in Allāh - He will guide his heart. And Allāh is Knowing of all things.",
      "de": "Kein Unglück trifft (jemanden), außer mit Allahs Erlaubnis. Und wer an Allah glaubt, dessen Herz leitet Er recht. Und Allah weiß über alles Bescheid.",
      "bs": "Nikakva nevolja ne pogađa osim s Allahovom dozvolom! A ko u Allaha vjeruje, On će uputiti njegovo srce, a Allah sve dobro zna.",
      "ru": "Никакое бедствие не постигает [никого] иначе как с дозволения Аллаха. А кто верует в Аллаха, тому Он наставляет сердце. Аллах — знающий обо всём."
    }
  },
  {
    "ref": "64:13",
    "sure": 64,
    "ayet": 13,
    "ar": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ",
    "mealler": {
      "tr": "Allah, O’ndan başka (hak) bir ilah yoktur. O halde Müminler yalnız Allah’a tevekkül etsinler.",
      "en": "Allāh - there is no deity except Him. And upon Allāh let the believers rely.",
      "id": "(Dialah) Allah, tidak ada tuhan selain Dia. Dan hendaklah orang-orang mukmin bertawakal kepada Allah.",
      "de": "Allah - es gibt keinen Gott außer Ihm. Und auf Allah sollen sich die Gläubigen verlassen.",
      "fr": "Allah ! Il n’est de divinité digne d’être adorée que Lui. Que les croyants s’en remettent donc uniquement à Allah !",
      "bs": "Samo je Allah Bog, i neka se vjernici samo u Allaha pouzdaju!",
      "ru": "Аллах — нет божества, кроме Него. Так пусть же на Аллаха уповают верующие.",
      "ms": "Allah, tiada Tuhan melainkan Dia; dan dengan yang demikian, kepada Allah jualah orang-orang yang beriman wajib berserah diri."
    }
  },
  {
    "ref": "64:15",
    "sure": 64,
    "ayet": 15,
    "ar": "إِنَّمَآ أَمْوَٰلُكُمْ وَأَوْلَٰدُكُمْ فِتْنَةٌ وَٱللَّهُ عِندَهُۥٓ أَجْرٌ عَظِيمٌ",
    "mealler": {
      "tr": "Mallarınız da, evlatlarınız da sizin için ancak bir imtihandır. Allah katında ise büyük ecir vardır.",
      "en": "Your wealth and your children are but a trial, and Allāh has with Him a great reward.",
      "id": "Sesungguhnya hartamu dan anak-anakmu hanyalah cobaan (bagimu), dan di sisi Allah pahala yang besar.",
      "de": "Euer Besitz und eure Kinder sind nur eine Versuchung; Allah aber - bei Ihm gibt es großartigen Lohn.",
      "fr": "Vos biens et vos enfants ne sont pour vous que tentation et épreuve, tandis qu’auprès d’Allah se trouve une immense récompense.",
      "bs": "Imanja vaša i djeca vaša samo su iskušenje, a u Allaha je nagrada velika.",
      "ru": "Воистину, ваше имущество и ваши дети — лишь испытание. А у Аллаха — великая награда.",
      "ms": "Sesungguhnya harta benda kamu dan anak-anak kamu itu hanyalah menjadi ujian, dan di sisi Allah jualah pahala yang besar."
    }
  },
  {
    "ref": "64:18",
    "sure": 64,
    "ayet": 18,
    "ar": "عَٰلِمُ ٱلْغَيْبِ وَٱلشَّهَٰدَةِ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    "mealler": {
      "tr": "Gizliyi de, açığı da bilendir, Azîzdir, Hakîmdir.",
      "en": "Knower of the unseen and the witnessed, the Exalted in Might, the Wise.",
      "id": "Yang Mengetahui yang gaib dan yang nyata. Yang Mahaperkasa, Mahabijaksana.",
      "de": "(Er ist) der Kenner des Verborgenen und des Offenbaren, der Allmächtige und Allweise.",
      "fr": "Il connaît le monde visible comme le monde invisible. Il est le Tout-Puissant, l’infiniment Sage.",
      "bs": "Poznavatelj onoga što je čulima nedokučivo i onoga što je pojavno, Silni i Mudri.",
      "ru": "Знающий сокровенное и явное, Могущественный, Мудрый.",
      "ms": "Dia lah yang mengetahui segala yang ghaib dan yang nyata, (dan Dia lah jua) yang Maha Kuasa, lagi Maha Bijaksana."
    }
  },
  {
    "ref": "67:12",
    "sure": 67,
    "ayet": 12,
    "ar": "إِنَّ ٱلَّذِينَ يَخْشَوْنَ رَبَّهُم بِٱلْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ",
    "mealler": {
      "tr": "Görmediği halde Rablerinden korkup çekinen kimseler için de elbette bir bağışlanma ve büyük bir ödül vardır.",
      "en": "Indeed, those who fear their Lord unseen will have forgiveness and great reward.",
      "id": "Sesungguhnya orang-orang yang takut kepada Tuhannya yang tidak terlihat oleh mereka, mereka memperoleh ampunan dan pahala yang besar.",
      "de": "Gewiß, diejenigen, die ihren Herrn im Verborgenen fürchten, für sie wird es Vergebung und großen Lohn geben.",
      "fr": "Quant à ceux qui, loin des regards, craignent leur Seigneur, ils obtiendront Son pardon et seront généreusement récompensés.",
      "bs": "Onima koji se Gospodara svoga boje i kad ih niko ne vidi – pripada oprost i nagrada velika!",
      "ru": "Воистину, те, которые страшатся своего Господа втайне, — для них прощение и большая награда.",
      "ms": "Sesungguhnya orang-orang yang takut (melanggar hukum) Tuhannya semasa mereka tidak dilihat orang dan semasa mereka tidak melihat azab Tuhan, mereka beroleh keampunan dan pahala yang besar."
    }
  },
  {
    "ref": "67:19",
    "sure": 67,
    "ayet": 19,
    "ar": "أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ صَٰٓفَّٰتٍ وَيَقْبِضْنَ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَٰنُ إِنَّهُۥ بِكُلِّ شَىْءٍۭ بَصِيرٌ",
    "mealler": {
      "tr": "Üstlerinde kanatlarını açarak ve kapayarak uçan kuşları görmediler mi? Onları Rahman'dan başkası tutmuyor. Doğrusu O, her şeyi görendir.",
      "en": "Do they not see the birds above them with wings outspread and [sometimes] folded in? None holds them [aloft] except the Most Merciful. Indeed He is, of all things, Seeing.",
      "de": "Sehen sie denn nicht auf die Vögel über ihnen, wie sie ihre Flügel ausgebreitet halten und einziehen? Nur der Allerbarmer hält sie. Gewiß, Er sieht alles wohl.",
      "fr": "N’ont-ils pas observé, au-dessus d’eux, les oiseaux planant dans les airs ou battant des ailes ? Seul le Tout Miséricordieux les maintient en l’air, Lui qui connaît parfaitement Sa création.",
      "bs": "Zar oni ne vide ptice iznad sebe kako raširenih krila lete, a i skupljaju ih? Samo ih Svemilosni drži; On, zaista, sve dobro vidi.",
      "ru": "Разве они не видят птиц над собой, распростёрших и складывающих крылья? Не удерживает их никто, кроме Всемилостивого. Воистину, Он видит всё сущее."
    }
  },
  {
    "ref": "68:34",
    "sure": 68,
    "ayet": 34,
    "ar": "إِنَّ لِلْمُتَّقِينَ عِندَ رَبِّهِمْ جَنَّٰتِ ٱلنَّعِيمِ",
    "mealler": {
      "tr": "Şüphesiz Allah’a karşı gelmekten sakınanlar için Rableri katında Naîm Cennetleri vardır.",
      "en": "Indeed, for the righteous with their Lord are the Gardens of Pleasure.",
      "id": "Sungguh, bagi orang-orang yang bertakwa (disediakan) surga yang penuh kenikmatan di sisi Tuhannya.",
      "de": "Gewiß, für die Gottesfürchtigen wird es bei ihrem Herrn die Gärten der Wonne geben.",
      "fr": "A ceux qui craignent Allah sont promis, auprès de leur Seigneur, les jardins des délices.",
      "bs": "Za one koji se budu bojali Allaha bit će, zaista, dženneti uživanja u Gospodara njihova,\n malim slovom je pisano i u štampama",
      "ru": "Воистину, для богобоязненных у их Господа — сады блаженства!",
      "ms": "Sesungguhnya orang-orang yang bertaqwa, disediakan bagi mereka taman-taman Syurga yang penuh nikmat, di sisi Tuhan mereka."
    }
  },
  {
    "ref": "73:19",
    "sure": 73,
    "ayet": 19,
    "ar": "إِنَّ هَٰذِهِۦ تَذْكِرَةٌ فَمَن شَآءَ ٱتَّخَذَ إِلَىٰ رَبِّهِۦ سَبِيلًا",
    "mealler": {
      "tr": "Şüphesiz bunlar bir öğüttür. Kim dilerse Rabbine ulaştıran bir yol tutar.",
      "en": "Indeed, this is a reminder, so whoever wills may take to his Lord a way.",
      "id": "Sungguh, ini adalah peringatan. Barangsiapa menghendaki, niscaya dia mengambil jalan (yang lurus) kepada Tuhannya.",
      "de": "Gewiß, dies ist eine Erinnerung; wer nun will, (der) nimmt (so diesen) einen Weg zu seinem Herrn.",
      "fr": "Voici une exhortation. Que celui qui le veut suive donc la voie de son Seigneur !",
      "bs": "Ovo je, doista, pouka; i ko hoće, put ka Gospodaru svome prihvatit će!",
      "ru": "Воистину, это — напоминание. И кто пожелает, изберёт путь к своему Господу."
    }
  },
  {
    "ref": "75:40",
    "sure": 75,
    "ayet": 40,
    "ar": "أَلَيْسَ ذَٰلِكَ بِقَٰدِرٍ عَلَىٰٓ أَن يُحْـِۧىَ ٱلْمَوْتَىٰ",
    "mealler": {
      "tr": "Bunu yapanın ölüleri diriltmeye gücü yetmez mi?",
      "en": "Is not that [Creator] Able to give life to the dead?",
      "id": "Bukankah (Allah yang berbuat) demikian berkuasa (pula) menghidupkan orang mati?",
      "de": "Hat dieser (Gott) nicht die Macht, die Toten wieder lebendig zu machen?",
      "fr": "Celui qui a pu créer cet être n’est-Il pas capable de ressusciter les morts ?!",
      "bs": "i zar Taj nije kadar mrtve oživjeti?!",
      "ru": "Неужели Тот, [Кто] это сделал, не способен оживить мёртвых?",
      "ms": "Adakah (Tuhan yang menjadikan semuanya) itu - tidak berkuasa menghidupkan orang-orang yang mati? (Tentulah berkuasa)!"
    }
  },
  {
    "ref": "76:3",
    "sure": 76,
    "ayet": 3,
    "ar": "إِنَّا هَدَيْنَٰهُ ٱلسَّبِيلَ إِمَّا شَاكِرًا وَإِمَّا كَفُورًا",
    "mealler": {
      "tr": "Biz ona yolu gösterdik. İster şükreder, ister kâfir olur.",
      "en": "Indeed, We guided him to the way, be he grateful or be he ungrateful.",
      "id": "Sungguh, Kami telah menunjukkan kepadanya jalan yang lurus; ada yang bersyukur dan ada pula yang kufur.",
      "de": "Wir haben ihn ja den (rechten) Weg geleitet, ob er nun dankbar oder undankbar sein mag.",
      "bs": "Mi mu na Pravi put ukazujemo, pa ili je zahvalan ili nezahvalan.",
      "ru": "Воистину, Мы указали ему путь: [и он] либо благодарный, либо неблагодарный."
    }
  },
  {
    "ref": "78:6",
    "sure": 78,
    "ayet": 6,
    "ar": "أَلَمْ نَجْعَلِ ٱلْأَرْضَ مِهَٰدًا",
    "mealler": {
      "tr": "Yeri bir döşek kılmadık mı?",
      "en": "Have We not made the earth a resting place?",
      "id": "Bukankah Kami telah menjadikan bumi sebagai hamparan,",
      "de": "Haben Wir nicht die Erde zu einer Lagerstatt gemacht",
      "fr": "N’avons-Nous pas fait de la terre une vaste étendue",
      "bs": "Zar Zemlju posteljom nismo učinili,",
      "ru": "Разве Мы не сделали землю ложем,",
      "ms": "(Mengapa kamu ragu-ragukan kekuasaan Kami menghidupkan semula orang-orang yang telah mati?) Bukankah Kami telah menjadikan bumi (terbentang luas) sebagai hamparan?"
    }
  },
  {
    "ref": "85:11",
    "sure": 85,
    "ayet": 11,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ لَهُمْ جَنَّٰتٌ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَٰرُ ذَٰلِكَ ٱلْفَوْزُ ٱلْكَبِيرُ",
    "mealler": {
      "tr": "İman edip salih ameller işleyenlere gelince; onlara içinden ırmaklar akan Cennetler vardır. İşte bu büyük başarıdır.",
      "en": "Indeed, those who have believed and done righteous deeds will have gardens beneath which rivers flow. That is the great attainment.",
      "id": "Sungguh, orang-orang yang beriman dan mengerjakan kebajikan, mereka akan mendapat surga yang mengalir di bawahnya sungai-sungai, itulah kemenangan yang agung.",
      "de": "Gewiß, diejenigen, die glauben und rechtschaffene Werke tun, für sie wird es Gärten geben, durcheilt von Bächen; das ist der große Erfolg.",
      "fr": "Quant à ceux qui croient et accomplissent de bonnes œuvres, leur sont réservés des jardins traversés de rivières. Voilà le bonheur suprême.",
      "bs": "Zaista, onima koji su vjerovali i radili dobra djela pripadaju bašče džennetske, kroz koje rijeke teku, a to je uspjeh veliki.",
      "ru": "Воистину, те, которые уверовали и совершали праведные деяния, — для них сады, внизу которых текут реки. Это — великий успех.",
      "ms": "Sesungguhnya orang-orang yang beriman dan beramal soleh, mereka akan beroleh Syurga yang mengalir di bawahnya beberapa sungai; yang demikian itu ialah kemenangan yang besar."
    }
  },
  {
    "ref": "85:13",
    "sure": 85,
    "ayet": 13,
    "ar": "إِنَّهُۥ هُوَ يُبْدِئُ وَيُعِيدُ",
    "mealler": {
      "tr": "İlkin var eden, sonra yeniden dirilten O'dur.",
      "en": "Indeed, it is He who originates [creation] and repeats.",
      "id": "Sungguh, Dialah yang memulai penciptaan (makhluk) dan yang menghidupkannya (kembali).",
      "de": "Gewiß, Er macht den Anfang und läßt wiederkehren.",
      "fr": "C’est Lui qui est à l’origine de la Création qu’Il recommencera.",
      "bs": "On ni iz čega stvara, i ponovo će to učiniti;",
      "ru": "Воистину, Он начинает [творение], а затем повторяет его.",
      "ms": "Sesungguhnya Dia lah yang menciptakan (sekalian makhluk) pada mulanya, dan yang mengembalikannya (hidup semula sesudah mati)."
    }
  },
  {
    "ref": "86:4",
    "sure": 86,
    "ayet": 4,
    "ar": "إِن كُلُّ نَفْسٍ لَّمَّا عَلَيْهَا حَافِظٌ",
    "mealler": {
      "tr": "Üzerinde gözetleyici/koruyucu bulunmayan hiç bir nefis (kimse) yoktur.",
      "en": "There is no soul but that it has over it a protector.",
      "id": "setiap orang pasti ada penjaganya.",
      "de": "Es gibt keine Seele, über der nicht ein Hüter (eingesetzt) ist.",
      "bs": "Nema čovjeka nad kojim neko ne bdije.",
      "ru": "Нет ни одной души, над которой не поставлен хранитель.",
      "ms": "Tiada sesuatu diri juapun melainkan ada malaikat yang menjaga (keadaannya serta menyimpan catitan mengenai segala bawaannya)."
    }
  },
  {
    "ref": "89:14",
    "sure": 89,
    "ayet": 14,
    "ar": "إِنَّ رَبَّكَ لَبِٱلْمِرْصَادِ",
    "mealler": {
      "tr": "Muhakkak Rabbin gözetlemededir.",
      "en": "Indeed, your Lord is in observation.",
      "id": "sungguh, Tuhanmu benar-benar mengawasi.",
      "de": "Gewiß, dein Herr wartet ja (auf sie).",
      "fr": "Ton Seigneur observe les hommes attentivement.",
      "bs": "a Gospodar tvoj je, zaista, u zasjedi.",
      "ru": "Воистину, твой Господь — в засаде.",
      "ms": "Sesungguhnya Tuhanmu tetap mengawas dan membalas, (terutama balasan akhirat)"
    }
  },
  {
    "ref": "90:8",
    "sure": 90,
    "ayet": 8,
    "ar": "أَلَمْ نَجْعَل لَّهُۥ عَيْنَيْنِ",
    "mealler": {
      "tr": "Biz, ona iki göz vermedik mi?",
      "en": "Have We not made for him two eyes?",
      "id": "Bukankah Kami telah menjadikan untuknya sepasang mata,",
      "de": "Haben Wir ihm nicht zwei Augen gemacht,",
      "fr": "Ne l’avons-Nous pas doté de deux yeux,",
      "bs": "Zar mu nismo dali oka dva,",
      "ru": "Разве Мы не создали ему два глаза,",
      "ms": "(Mengapa manusia terpedaya dan bermegah-megah?) Tidakkah Kami telah menjadikan baginya: dua mata (untuk ia memerhatikan kekuasaan dan kekayaan Kami?) -"
    }
  },
  {
    "ref": "92:4",
    "sure": 92,
    "ayet": 4,
    "ar": "إِنَّ سَعْيَكُمْ لَشَتَّىٰ",
    "mealler": {
      "tr": "Şüphesiz sizin çabalarınız elbette çeşit çeşittir.",
      "en": "Indeed, your efforts are diverse.",
      "id": "Sungguh, usahamu memang beraneka macam.",
      "de": "Euer Bemühen ist wahrlich verschieden.",
      "fr": "Vous poursuivez, par vos œuvres, des buts éloignés.",
      "bs": "vaš trud je, zaista, različit.",
      "ru": "Воистину, ваши усилия различны.",
      "ms": "Sesungguhnya amal usaha kamu adalah berbagai-bagai keadaannya."
    }
  },
  {
    "ref": "94:5",
    "sure": 94,
    "ayet": 5,
    "ar": "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    "mealler": {
      "tr": "Şüphesiz her zorlukla beraber bir kolaylık vardır.",
      "en": "For indeed, with hardship [will be] ease [i.e., relief].",
      "id": "Maka sesungguhnya bersama kesulitan ada kemudahan,",
      "de": "Also gewiß, mit der Erschwernis ist Erleichterung,",
      "fr": "Sache qu’il n’est d’épreuve qui ne soit suivie d’une délivrance.",
      "bs": "Pa, zaista, s mukom je olakšanje,",
      "ru": "Воистину, с трудностью — облегчение.",
      "ms": "Oleh itu, maka (tetapkanlah kepercayaanmu) bahawa sesungguhnya tiap-tiap kesukaran disertai kemudahan,"
    }
  },
  {
    "ref": "94:6",
    "sure": 94,
    "ayet": 6,
    "ar": "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    "mealler": {
      "tr": "Gerçekten güçlükle beraber bir kolaylık vardır.",
      "en": "Indeed, with hardship [will be] ease.",
      "id": "sesungguhnya bersama kesulitan ada kemudahan.",
      "de": "gewiß, mit der Erschwernis ist Erleichterung.",
      "fr": "Oui, il n’est pas d’épreuve qui ne soit suivie d’une délivrance.",
      "bs": "zaista, s mukom je olakšanje!",
      "ru": "Воистину, с трудностью — облегчение.",
      "ms": "(Sekali lagi ditegaskan): bahawa sesungguhnya tiap-tiap kesukaran disertai kemudahan."
    }
  },
  {
    "ref": "95:8",
    "sure": 95,
    "ayet": 8,
    "ar": "أَلَيْسَ ٱللَّهُ بِأَحْكَمِ ٱلْحَٰكِمِينَ",
    "mealler": {
      "tr": "Allah, hükmedenlerin en iyi hükmedeni değil midir?",
      "en": "Is not Allāh the most just of judges?",
      "id": "Bukankah Allah Hakim yang paling adil?",
      "de": "Ist nicht Allah der Weiseste derjenigen, die richten?",
      "fr": "Allah n’est-Il pas le plus équitable et le plus sage des juges ?",
      "bs": "Zar Allah nije sudija najpravedniji?!",
      "ru": "Разве Аллах — не Наимудрейший из судящих?",
      "ms": "Bukankah Allah (yang demikian kekuasaanNya) seadil-adil Hakim?"
    }
  },
  {
    "ref": "96:8",
    "sure": 96,
    "ayet": 8,
    "ar": "إِنَّ إِلَىٰ رَبِّكَ ٱلرُّجْعَىٰٓ",
    "mealler": {
      "tr": "Şüphesiz dönüş yalnızca Rabbine olacaktır.",
      "en": "Indeed, to your Lord is the return.",
      "id": "Sungguh, hanya kepada Tuhanmulah tempat kembali(mu).",
      "de": "Gewiß, zu deinem Herrn wird die Rückkehr sein.",
      "fr": "oubliant qu’il fera retour à ton Seigneur.",
      "bs": "a Gospodaru tvome će se, doista, svi vratiti!",
      "ru": "Воистину, к твоему Господу — возвращение.",
      "ms": "(Ingatlah) sesungguhnya kepada Tuhanmu lah tempat kembali (untuk menerima balasan)."
    }
  },
  {
    "ref": "97:3",
    "sure": 97,
    "ayet": 3,
    "ar": "لَيْلَةُ ٱلْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
    "mealler": {
      "tr": "Kadir Gecesi bin aydan daha hayırlıdır.",
      "en": "The Night of Decree is better than a thousand months.",
      "id": "Malam kemuliaan itu lebih baik daripada seribu bulan.",
      "de": "Die Nacht der Bestimmung ist besser als tausend Monate.",
      "bs": "Noć Kadr bolja je od hiljadu mjeseci;",
      "ru": "Ночь предопределения лучше тысячи месяцев.",
      "ms": "Malam Lailatul-Qadar lebih baik daripada seribu bulan."
    }
  },
  {
    "ref": "98:7",
    "sure": 98,
    "ayet": 7,
    "ar": "إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ أُو۟لَٰٓئِكَ هُمْ خَيْرُ ٱلْبَرِيَّةِ",
    "mealler": {
      "tr": "Şüphesiz, iman edip salih ameller işleyenler var ya; işte onlar yaratıkların en hayırlısıdırlar.",
      "en": "Indeed, they who have believed and done righteous deeds - those are the best of creatures.",
      "id": "Sungguh, orang-orang yang beriman dan mengerjakan kebajikan, mereka itulah sebaik-baik makhluk.",
      "de": "Gewiß, diejenigen aber, die glauben und rechtschaffene Werke tun, das sind die besten Geschöpfe.",
      "fr": "Quant à ceux qui croient et accomplissent de bonnes œuvres, ce sont les êtres les plus nobles de l’humanité.",
      "bs": "A oni koji vjeruju i čine dobra djela – oni su, zbilja, najbolja stvorenja.",
      "ru": "Воистину, те, которые уверовали и совершали праведные деяния, — такие и есть лучшие из созданий.",
      "ms": "Seungguhnya orang-orang yang beriman dan beramal soleh, mereka itulah sebaik-baik makhluk."
    }
  }
];
