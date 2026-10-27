/**
 * ÜRETİLMİŞ DOSYA — elle düzenleme; `node scripts/icerik/ayet-mealleri-uret.js`.
 * Kaynak: QuranEnc (quranenc.com). Metinler değiştirilmeden ve kesilmeden alınır;
 * ekranda yayımcı ve sürümle birlikte gösterilir (`ayetKunyesi`).
 */
export interface MealKaynagi {
  /** QuranEnc çeviri anahtarı. */
  anahtar: string;
  surum: string;
  baslik: string;
  /** "sûre:ayet" → meal (birebir). */
  ayetler: Readonly<Record<string, string>>;
}

export const AYET_MEALLERI: Readonly<Record<string, MealKaynagi>> = {
  "en": {
    "anahtar": "english_saheeh",
    "surum": "1.1.2",
    "baslik": "English Translation - Noor International Center",
    "ayetler": {
      "2:153": "O you who have believed, seek help through patience and prayer. Indeed, Allāh is with the patient.",
      "2:238": "Maintain with care the [obligatory] prayers and [in particular] the middle [i.e., ʿaṣr] prayer and stand before Allāh, devoutly obedient.",
      "4:103": "And when you have completed the prayer, remember Allāh standing, sitting, or [lying] on your sides. But when you become secure, re-establish [regular] prayer. Indeed, prayer has been decreed upon the believers a decree of specified times.",
      "11:114": "And establish prayer at the two ends of the day and at the approach of the night. Indeed, good deeds do away with misdeeds. That is a reminder for those who remember.",
      "29:45": "Recite, [O Muḥammad], what has been revealed to you of the Book and establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allāh is greater. And Allāh knows that which you do.",
      "62:9": "O you who have believed, when [the adhān] is called for the prayer on the day of Jumuʿah [Friday], then proceed to the remembrance of Allāh and leave trade. That is better for you, if you only knew."
    }
  },
  "id": {
    "anahtar": "indonesian_affairs",
    "surum": "1.0.1",
    "baslik": "Indonesian Translation - Ministry of Religious Affairs",
    "ayetler": {
      "2:153": "Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Sungguh, Allah beserta orang-orang yang sabar.",
      "4:103": "Selanjutnya, apabila kamu telah menyelesaikan salat(mu), ingatlah Allah ketika kamu berdiri, pada waktu duduk dan ketika berbaring. Kemudian, apabila kamu telah merasa aman, maka laksanakanlah salat itu (sebagaimana biasa). Sungguh, salat itu adalah kewajiban yang ditentukan waktunya bagi orang-orang yang beriman.",
      "11:114": "Dan laksanakanlah salat pada kedua ujung siang (pagi dan petang) dan pada bagian permulaan malam. Perbuatan-perbuatan baik itu menghapus kesalahan-kesalahan. Itulah peringatan bagi orang-orang yang selalu mengingat (Allah).",
      "29:45": "Bacalah Kitab (Al-Qur`an) yang telah diwahyukan kepadamu (Muhammad) dan laksanakanlah salat. Sesungguhnya salat itu mencegah dari (perbuatan) keji dan mungkar. Dan (ketahuilah) mengingat Allah (salat) itu lebih besar (keutamaannya dari ibadah yang lain). Allah mengetahui apa yang kamu kerjakan.",
      "62:9": "Wahai orang-orang yang beriman! Apabila telah diseru untuk melaksanakan salat pada hari Jumat, maka segeralah kamu mengingat Allah dan tinggalkanlah jual beli. Yang demikian itu lebih baik bagimu jika kamu mengetahui."
    }
  },
  "de": {
    "anahtar": "german_bubenheim",
    "surum": "1.1.4",
    "baslik": "German Translation - Frank Bubenheim",
    "ayetler": {
      "2:153": "O die ihr glaubt, sucht Hilfe in der Standhaftigkeit und im Gebet! Allah ist mit den Standhaften.",
      "2:238": "Haltet die Gebete ein, und (besonders) das mittlere Gebet, und steht demütig ergeben vor Allah.",
      "4:103": "Wenn ihr das Gebet vollzogen habt, dann gedenkt Allahs stehend, sitzend und auf der Seite (liegend). Wenn ihr in Ruhe seid, dann verrichtet das Gebet (wie üblich). Das Gebet ist den Gläubigen zu bestimmten Zeiten vorgeschrieben.",
      "11:114": "Und verrichte das Gebet an beiden Enden des Tages und in Stunden der Nacht. Die guten Taten lassen die bösen Taten vergehen. Das ist eine Ermahnung für diejenigen, die (Allahs) gedenken.",
      "29:45": "Verlies, was dir vom Buch (als Offenbarung) eingegeben wird, und verrichte das Gebet. Gewiß, das Gebet hält davon ab, das Schändliche und das Verwerfliche (zu tun). Und das Gedenken Allahs ist wahrlich größer. Und Allah weiß, was ihr macht.",
      "62:9": "O die ihr glaubt, wenn zum Gebet gerufen wird am Freitag, dann eilt zu Allahs Gedenken und laßt das Kaufgeschäft. Das ist besser für euch, wenn ihr wißt."
    }
  },
  "fr": {
    "anahtar": "french_rashid",
    "surum": "1.0.3",
    "baslik": "French Translation - Rachid Maach",
    "ayetler": {
      "2:153": "Vous qui croyez ! Armez-vous de patience et aidez-vous de la prière. Allah est avec ceux qui font preuve de constance.",
      "4:103": "Une fois la prière accomplie, vous pouvez invoquer le nom d’Allah, debout, assis ou allongés sur le côté. Et lorsque vous vous retrouvez en sécurité, accomplissez la prière de façon normale. La prière doit être observée par les croyants à des heures déterminées.",
      "29:45": "Récite ce qui t’est révélé du Livre et veille à l’accomplissement de la prière. La prière détourne, en effet, des actes abominables et condamnables. Rien n’est plus méritoire que l’invocation du nom d’Allah. Le Seigneur connaît parfaitement vos œuvres."
    }
  },
  "bs": {
    "anahtar": "bosnian_rwwad",
    "surum": "2.0.4",
    "baslik": "Bosnian Translation - Rowwad Translation Centre",
    "ayetler": {
      "2:153": "O vi koji vjerujete, tražite sebi pomoć u strpljivosti i namazu! Allah je, doista, uz strpljive.",
      "2:238": "Čuvajte namaze, naročito srednji namaz, i pred Allahom ponizno stojte!",
      "4:103": "A kada namaz završite, Allaha spominjite, i stojeći, i sjedeći, i ležeći na bokovima. A kada budete sigurni, namaz obavljajte u potpunosti; namaz je, uistinu, propisan vjernicima u određenim vremenskim razmacima.",
      "11:114": "I uspostavljaj namaz početkom i krajem dana, i u prvim časovima noći! Dobra djela zaista poništavaju hrđava. To je opomena za one koji se opomene prisjećaju.",
      "29:45": "Kazuj Knjigu koja ti se objavljuje i obavljaj namaz – namaz, zaista, odvraća od razvrata i od svega što je ružno, a sigurno je spominjanje Allaha veće! – A Allah zna šta radite.",
      "62:9": "O vi koji vjerujete, kad u petak na namaz budete pozvani, požurite na spominjanje Allaha i kupoprodaju ostavite, to vam je bolje, ako znate!"
    }
  },
  "ru": {
    "anahtar": "russian_rwwad",
    "surum": "1.0.1",
    "baslik": "Russian Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "О вы, которые уверовали! Ищите помощи посредством терпения и молитвы. Воистину, Аллах — с терпеливыми.",
      "2:238": "Оберегайте молитвы и [особенно] срединную молитву, и стойте перед Аллахом благоговейно.",
      "4:103": "Когда вы завершите молитву, то поминайте Аллаха стоя, сидя и лёжа на боках, а когда обретёте спокойствие, то совершайте молитву должным образом. Воистину, молитва для верующих — предписание в установленное время.",
      "11:114": "Выстаивай молитву в начале и в конце дня, а также в близкие часы ночи. Воистину, добрые дела стирают дурные. Это — напоминание для поминающих.",
      "29:45": "Читай же то, что внушено тебе из Писания, и выстаивай молитву. Воистину, молитва удерживает от мерзости и предосудительного, а поминание Аллаха — превыше [всего]. И Аллах знает всё, что вы совершаете.",
      "62:9": "О вы, которые уверовали! Когда прозвучит призыв на молитву в день пятницы, устремляйтесь к поминанию Аллаха и оставьте торговлю. Это лучше для вас, если бы вы только знали."
    }
  },
  "ms": {
    "anahtar": "malay_basumayyah",
    "surum": "1.0.0",
    "baslik": "Malay Translation - Abdullah Basumayyah",
    "ayetler": {
      "2:153": "Wahai sekalian orang-orang yang beriman! Mintalah pertolongan (untuk menghadapi susah payah dalam menyempurnakan sesuatu perintah Tuhan) dengan bersabar dan dengan (mengerjakan) sembahyang; kerana sesungguhnya Allah menyertai (menolong) orang-orang yang sabar",
      "2:238": "Peliharalah kamu (kerjakanlah dengan tetap dan sempurna pada waktunya) segala sembahyang fardu, khasnya sembahyang Wusta (sembahyang Asar), dan berdirilah kerana Allah (dalam sembahyang kamu) dengan taat dan khusyuk.",
      "4:103": "Kemudian apabila kamu telah selesai mengerjakan sembahyang, maka hendaklah kamu menyebut dan mengingati Allah semasa kamu berdiri atau duduk, dan semasa kamu berbaring. Kemudian apabila kamu telah merasa tenteram (berada dalam keadaan aman) maka dirikanlah sembahyang itu (dengan sempurna sebagaimana biasa). Sesungguhnya sembahyang itu adalah satu ketetapan yang diwajibkan atas orang-orang yang beriman, yang tertentu waktunya.",
      "11:114": "Dan dirikanlah sembahyang (wahai Muhammad, engkau dan umatmu), pada dua bahagian siang (pagi dan petang), dan pada waktu-waktu yang berhampiran dengannya dari waktu malam. Sesungguhnya amal-amal kebajikan (terutama sembahyang) itu menghapuskan kejahatan. Perintah-perintah Allah yang demikian adalah menjadi peringatan bagi orang-orang yang mahu beringat.",
      "29:45": "Bacalah serta ikutlah (wahai Muhammad) akan apa yang diwahyukan kepadamu dari Al-Quran, dan dirikanlah sembahyang (dengan tekun); sesungguhnya sembahyang itu mencegah dari perbuatan yang keji dan mungkar; dan sesungguhnya mengingati Allah adalah lebih besar (faedahnya dan kesannya); dan (ingatlah) Allah mengetahui akan apa yang kamu kerjakan.",
      "62:9": "Wahai orang-orang yang beriman! Apabila diserukan azan (bang) untuk mengerjakan sembahyang pada hari Jumaat, maka segeralah kamu pergi (ke masjid) untuk mengingati Allah (dengan mengerjakan sembahyang jumaat) dan tinggalkanlah berjual-beli (pada saat itu); yang demikian adalah baik bagi kamu, jika kamu mengetahui (hakikat yang sebenarnya),"
    }
  },
  "ur": {
    "anahtar": "urdu_junagarhi",
    "surum": "1.1.3",
    "baslik": "Urdu Translation - Muhammad Junagarhi",
    "ayetler": {
      "2:153": "اے ایمان والو! صبر اور نماز کے ذریعہ مدد چاہو، اللہ تعالی صبر والوں کا ساتھ دیتا ہے۔",
      "2:238": "نمازوں کی حفاﻇت کرو، بالخصوص درمیان والی نماز کی اور اللہ تعالیٰ کے لئے باادب کھڑے رہا کرو۔",
      "4:103": "پھر جب تم نماز ادا کر چکو تو اٹھتے بیٹھتے اور لیٹے اللہ تعالیٰ کا ذکر کرتے رہو اور جب اطمینان پاؤ تو نماز قائم کرو! یقیناً نماز مومنوں پر مقرره وقتوں پر فرض ہے۔",
      "11:114": "دن کے دونوں سروں میں نماز برپا رکھ اور رات کی کئی ساعتوں میں بھی ، یقیناً نیکیاں برائیوں کو دور کر دیتی ہیں۔ یہ نصیحت ہے نصیحت پکڑنے والوں کے لئے.",
      "29:45": "جو کتاب آپ کی طرف وحی کی گئی ہے اسے پڑھئے اور نماز قائم کریں، یقیناً نماز بے حیائی اور برائی سے روکتی ہے، بیشک اللہ کا ذکر بہت بڑی چیز ہے، تم جو کچھ کر رہے ہو اس سے اللہ خبردار ہے.",
      "62:9": "اے وه لوگو جو ایمان ﻻئے ہو! جمعہ کے دن نماز کی اذان دی جائے تو تم اللہ کے ذکر کی طرف دوڑ پڑو اور خرید وفروخت چھوڑ دو ۔ یہ تمہارے حق میں بہت ہی بہتر ہے اگر تم جانتے ہو."
    }
  },
  "es": {
    "anahtar": "spanish_montada_latin",
    "surum": "1.0.1",
    "baslik": "Spanish Translation (Latin American) - issued by Noor International",
    "ayetler": {
      "2:153": "¡Oh, creyentes!, busquen ayuda en la paciencia y en el salat. En verdad, Al-lah está con los pacientes.",
      "4:103": "Y, una vez finalizado el salat, glorifiquen a Al-lah de pie, sentados o recostados. Pero, cuando estén a salvo, recen a Al-lah (como Él les ha ordenado, con devoción y recogimiento y respetando todas las obligaciones). En verdad, los rezos han sido prescritos a unas horas determinadas.",
      "29:45": "Recita (¡oh, Muhammad!) lo que te ha sido revelado del Libro (el Corán; obra según él y transmítelo a los demás) y realiza el salat. En verdad, (la práctica constante) del salat evita (que el hombre caiga en) la inmoralidad y en las malas acciones. Y glorificar a Al-lah (dentro y fuera del salat) es más importante (que el resto de las buenas acciones). Y Al-lah sabe lo que hacen.",
      "62:9": "¡Oh, creyentes!, cuando se efectúe la llamada del rezo en congregación del viernes (salatul yumu’ah), apresúrense a glorificar a Al-lah y dejen sus negocios. Esto es mejor para ustedes; ¡si supieran!"
    }
  },
  "nl": {
    "anahtar": "dutch_center",
    "surum": "2.0.10",
    "baslik": "Dutch Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "O gij die gelooft! Zoek hulp in geduld en gebed. Waarlijk. Allah is met de geduldigen.",
      "2:238": "Behoed nauw de gebeden en speciaal het middelste gebed. En sta in gehoorzaamheid voor Allah.",
      "4:103": "Als jullie met het gebed klaar zijn, gedenkt Allah dan staand, zittend en liggend op jullie zijden, maar als jullie buiten gevaar zijn, verricht de gebeden dan correct. Waarlijk, het gebed is de gelovigen op verplichte tijden opgelegd.",
      "11:114": "En verricht het gebed perfect aan de twee uiteinden (dus de vijf verplichte gebeden) van de dag en in wat uren van de nacht. Waarlijk, de goede daden verwijderen de slechte daden. Dat is een advies voor degenen die denken.",
      "29:45": "Reciteer wat aan jouw van het Boek is geopenbaard en verricht je gebeden perfect. Voorwaar, het gebed weerhoudt van onzedelijkheid en slechte zaken en het gedenken (dhikr) van Allah is voorwaar groter. En Allah weet wat jullie doen.",
      "62:9": "O jullie die geloven! Wanneer de oproep voor het gebed op de djoemah (vrijdag) wordt afgeroepen, haast jullie dan voor de gedenking van Allah en laat je (wereldse) zaken, dat is beter voor jullie als jullie het maar wisten!"
    }
  },
  "sq": {
    "anahtar": "albanian_nahi",
    "surum": "1.1.0",
    "baslik": "Albanian Translation - Hassan Nahi",
    "ayetler": {
      "2:153": "O besimtarë! Kërkoni ndihmë për veten nëpërmjet durimit dhe namazit! Në të vërtetë, Allahu është me të duruarit.",
      "4:103": "Pasi të kryeni namazin, përmendeni Allahun duke qëndruar në këmbë, ulur ose të shtrirë. Kur të jeni jashtë rrezikut, atëherë faleni namazin të plotë, sepse namazi është detyrë për besimtarët në kohë të caktuar.",
      "11:114": "Fale namazin në mëngjes e mbrëmje dhe në një kohë të natës, sepse veprat e mira i shlyejnë veprat e këqija. Kjo këshillë vlen për ata që i pranojnë këshillat.",
      "29:45": "Lexo (o Muhamed) atë që të është zbritur ty prej Librit (Kuranit) dhe fale namazin! Vërtet që namazi të ruan nga shthurja dhe nga çdo vepër e shëmtuar dhe vërtet që përmendja e Allahut është më e madhe! Allahu di gjithçka që ju bëni.",
      "62:9": "O besimtarë, kur të thirreni për (të falur) namazin (e xhumasë) në ditën e premte, nxitoni për ta përmendur Allahun dhe pezulloni tregtinë! Kjo, që ta dini, është më mirë për ju!"
    }
  },
  "hi": {
    "anahtar": "hindi_omari",
    "surum": "1.1.5",
    "baslik": "Hindi Translation - Azizul Haq Al-Omari",
    "ayetler": {
      "2:153": "ऐ ईमान वालो! धैर्य तथा नमाज़ के साथ मदद प्राप्त करो। निःसंदेह अल्लाह धैर्य रखने वालों के साथ है।",
      "4:103": "फिर जब तुम नमाज़ पूरी कर लो, तो खड़े और बैठे और लेटे (प्रत्येक स्थिति में) अल्लाह को याद करते रहो और जब तुम भयमुक्त हो जाओ, तो (पहले की तरह) नमाज़ क़ायम करो। निःसंदेह नमाज़ ईमान वालों पर निर्धारित समय पर फ़र्ज़ की गई है।"
    }
  },
  "bn": {
    "anahtar": "bengali_zakaria",
    "surum": "1.1.1",
    "baslik": "Bengali Translation - Abu Bakr Zakaria",
    "ayetler": {
      "2:153": "হে ঈমানদারগণ ! তোমরা সাহায্য চাও সবর ও সালাতের মাধ্যমে। নিশ্চয় আল্লাহ্‌ সবরকারীদের সাথে আছেন।",
      "2:238": "তোমরা সালাতের প্রতি যত্নবান হবে, বিশেষত মধ্যবর্তী সালাতের এবং আল্লাহ্‌র উদ্দেশ্যে তোমরা দাঁড়াবে বিনীতভাবে;",
      "4:103": "অতঃপর যখন তোমরা সালাত সমাপ্ত করবে তখন দাঁড়িয়ে, বসে এবং শুয়ে আল্লাহকে স্মরণ করবে, অতঃপর যখন তোমরা নিরাপদ হবে তখন যথাযথ সালাত কায়েম করবে; নির্ধারিত সময়ে সালাত কায়েম করা মুমিনদের জন্য অবশ্য কর্তব্য।",
      "11:114": "আর আপনি সালাত কায়েম করুন দিনের দু প্রান্তভাগে ও রাতের প্রথমাংশে। নিশ্চয় সৎকাজ অসৎ কাজকে মিটিয়ে দেয়। উপদেশ গ্রহণকারীদের জন্য এটা এক উপদেশ।",
      "29:45": "আপনি তেলাওয়াত করুন কিতাব থেকে যা আপনার প্রতি ওহী করা হয় এবং সালাত কায়েম করুন। নিশ্চয় সালাত বিরত রাখে অশ্লীল ও মন্দ কাজ থেকে। আর আল্লাহর স্মরণই তো সর্বশ্রেষ্ঠ। তোমরা যা কর আল্লাহ্ তা জানেন।",
      "62:9": "হে ঈমানদারগণ! জুমু’আর দিনে যখন সালাতের জন্য ডাকা হয় তখন তোমরা আল্লাহর স্বরণে ধাবিত হও এবং কেনা-বেচা ত্যাগ কর, এটাই তোমাদের জন্য সর্বোত্তম, যদি তোমরা জানতে।"
    }
  }
};
