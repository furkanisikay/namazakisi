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
    "anahtar": "spanish_garcia",
    "surum": "1.0.2",
    "baslik": "Spanish Translation - Isa Garcia",
    "ayetler": {
      "2:153": "¡Oh, creyentes! Busquen ayuda en la paciencia y la oración; que Dios está con los pacientes.",
      "2:238": "Cumplan con la oración prescrita, especialmente la oración de la tarde, y preséntense ante Dios con total devoción.",
      "4:103": "Cuando hayan terminado la oración recuerden a Dios de pie, sentados o recostados. Y cuando estén fuera de peligro hagan la oración [normalmente]. La oración ha sido prescrita a los creyentes para ser realizada en horarios específicos.",
      "11:114": "Observa las oraciones prescritas en los dos extremos del día y durante la noche, pues las obras buenas borran las obras malas. Esto es una exhortación para quienes reflexionan.",
      "62:9": "¡Creyentes! Cuando sea realizado el llamado a la oración del día viernes, acudan al recuerdo de Dios y abandonen el comercio, es lo mejor para ustedes. ¡Si supieran!"
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
  },
  "fa": {
    "anahtar": "persian_ih",
    "surum": "1.1.3",
    "baslik": "Persian Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "ای کسانی که ایمان آورده‌اید، از شکیبایی و نماز یاری بجویید [که] بی‌تردید، الله با شکیبایان است.",
      "2:238": "[ای مسمانان،] بر [ادای] همه نمازها و [به خصوص] نماز عصر کوشا باشید و با فروتنی و فرمانبرداری برای الله به پا خیزید.",
      "4:103": "چون نماز را به پایان رساندید، الله را [در همه حال،] ایستاده و نشسته و بر پهلو خفته [= خوابیده] یاد کنید؛ و هر گاه آرامش یافتید [و ترس از بین رفت]، نماز را [کامل] بر پا دارید [چرا که] بی‌تردید، نماز [فریضه‌ای است که] در اوقات معیّنی بر مؤمنان واجب شده ‌است.",
      "11:114": "و در دو طرف روز [= آغاز و پایان روز] و ساعاتی از شب، نماز بگزار. بی‌تردید، نیکی‌ها بدی‌ها را از بین می‌برد. این [سخن،] پندی است برای پندپذیران.",
      "29:45": "[ای پیامبر،] آنچه را از این کتاب بر تو وحی شده است تلاوت کن و نماز برپا دار. به راستی که نماز، انسان را از گناه و زشتکاری بازمی‌دارد؛ و البته یاد الله [از هر کاری] بالا‌تر است؛ و الله می‌داند که چه می‌کنید.",
      "62:9": "ای کسانی که ایمان آورده‌اید، هنگامی ‌که برای نماز روز جمعه، اذان گفته شد، به سوی [نماز و] ذکرِ الله بشتابید [و درنگ نکنید]، و خرید و فروش را رها کنید. اگر بدانید، این [کاری که به شما دستور داده می‌شود] برایتان بهتر است."
    }
  },
  "ps": {
    "anahtar": "pashto_rwwad",
    "surum": "1.0.1",
    "baslik": "Pashto Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "ای هغو کسانو چې ایمان مو راوړی دی! په صبر او لمانځه سره له (الله) څخه مرسته وغواړئ، بېشکه الله له صبر کوونکو سره دی.",
      "2:238": "د (ټولو) لمونځونو ساتنه وکړئ او (په ځانګړې توګه) د منځني لمانځه (چې د مازدیګر لمونځ دی) او الله تعالی ته په عاجزۍ سره ودرېږئ.",
      "4:103": "نو چې لمونځ ختم كړئ بيا هم په ولاړه، ناسته او اړخ ملاسته الله يادوئ، او كله چې ډاډه شوئ نو بيا (سم پوره) لمونځ كوئ، بې شكه لمونځ په ټاكلو وختو كې پر مومنانو فرض دى.",
      "11:114": "او د ورځې دواړو خواو او د شپې څه شېبو كې لمونځ ترسره كوه بې شکه نيكي بدي له منځه وړي، دا پند اخيستونكو لپاره يوه يادونه ده.",
      "29:45": "لوله هغه كتاب چې تا ته وحى کړل شوى دى او لمونځ ترسره كوه، بې شكه لمونځ له بې حيايي او ناوړه كارونو څخه ايسارول كوي، او د الله يادول ډېر لوى (شى) دى او الله ته هغه څه معلوم دي چې تاسي يې كوئ.",
      "62:9": "اې هغو کسانو چې ايمان يې راوړی كله چې د جمعې ورځې د لمانځه اذان وشي نو د الله يادولو ته ورمنډه كړئ او راکړه ورکړه پرېږدئ، دا درته غوره ده كه تاسو پوهېږئ."
    }
  },
  "ckb": {
    "anahtar": "kurdish_bamoki",
    "surum": "1.1.1",
    "baslik": "Kurdish Translation - Muhammad Salih Bamoki",
    "ayetler": {
      "2:153": "ئەی ئەو کەسانەی کە بڕواتان ھێناوە پشت ببەستن بەخۆڕاگرتن و نوێژ (کردن) بەڕاستی خوا لەگەڵ خۆڕاگرانە",
      "2:238": "ئاگاداری نوێژەکانتان بن وبیانپارێزن وە (بەتایبەتی) نوێژی ناوەڕاست (کە نوێژی عەسرە) وە لە نوێژدا بوەستن بۆ خوا بەمل کەچی و (بێ قسەکردن)",
      "4:103": "ئەمجا کاتێک نوێژەکانتان بەجێ ھێنا ئەوسا یادی خوا بکەن بەپێوە و بەدانیشتنەوە وە لە سەرتەنیشتان (بە پاڵکەوتنەوە) جا ھەر کاتێک دڵ ئارام بوون (و ترستان نەما) ئەو کاتە نوێژەکانتان بە ڕێک و پێکی بکەن بەڕاستی نوێژ ھەمیشە لەسەر باوەڕداران فەرز کراوێکی کات بۆ دیاری کراوە",
      "11:114": "وە نوێژ ئەنجام بدە لەم سەرو ئەوسەری ڕۆژدا (لەبەیانیان و ئێواراندا) و لە بەشێک لەشەودا چونکە بەڕاستی (کردەوە) چاکەکان (کردەوە) خراپەکان لادەبەن ودەیانسڕنەوە ئەوە پەند و ئامۆژگاریە بۆ پەند وەرگران",
      "29:45": "بیخوێنەرەوە ئەو قورئانەی کەوەحی کراوە بۆت وە نوێژ بکەبێگومان نوێژ ڕێگری (نوێژگەر) دەکات لەکاری ناشیرین و ناپەسەند (لەخراپە) وە زیکر و یادی خوا گەورەترە (لەھەموو شتێك) خواش دەزانێت بەھەر کارێك کە ئێوە دەیکەن",
      "62:9": "ئەی ئەوانەی کەباوەڕتان ھێناوە کاتێك کە بانگدرا بۆ نوێژ لە ڕۆژی ھەینیدا بەپەلە بڕۆن بۆ یادی خوا (و نوێژی ھەینی) و واز لەکڕین وفرۆشتن بھێنن، ئائەوە بۆ ئێوە چاکترە ئەگەر بزانن وتێبگەن"
    }
  },
  "ug": {
    "anahtar": "uyghur_saleh",
    "surum": "1.0.2",
    "baslik": "Uyghur Translation - Muhammad Saleh",
    "ayetler": {
      "2:153": "ئى مۆمىنلەر! سەۋر ۋە ناماز ئارقىلىق ياردەم تىلەڭلار. ئاللاھ ھەقىقەتەن سەۋر قىلغۇچىلار بىلەن بىللىدۇر.",
      "2:238": "(بەش) نامازغا بولۇپمۇ نامازدىگەرگە ئەھمىيەت بېرىڭلار (يەنى پۈتۈن شەرتلىرى بىلەن ۋاقتىدا تولۇق ئادا قىلىڭلار). ئاللاھنىڭ ھۇزۇرىدا (يەنى نامازدا) ئىتائەتمەنلىك بىلەن تۇرۇڭلار.",
      "4:103": "نامازنى تۈگەتكىنىڭلاردا ئۆرە تۇرغان، ئولتۇرغان ۋە ياتقان ھالەتتە ئاللاھنى ياد ئېتىڭلار (ئاللاھ سىلەرگە دۈشمىنىڭلارغا قارشى ياردەم بېرىشى مۇمكىن). خاتىرجەم بولغان چېغىڭلاردا نامازنى (پۈتۈن شەرتلىرى بىلەن) مۇكەممەل ئادا قىلىڭلار. شۈبھىسىزكى، ناماز مۆمىنلەرگە ۋاقتى بەلگىلەنگەن (پەرز) پەرز قىلىندى.",
      "11:114": "كۈندۈزنىڭ ئىككى تەرىپىدە (يەنى ئەتىگەندە ۋە كەچقۇرۇن ۋاقىتلىرىدا) ۋە كېچىنىڭ دەسلەپكى ۋاقىتلىرىدا ناماز ئۆتىگىن. شۈبھىسىزكى، ياخشى ئىشلار ئارقىلىق يامان ئىشلار يۇيۇلىدۇ. بۇ چۈشەنگۈچىلەر ئۈچۈن ۋەز ـ نەسىھەتتۇر.",
      "29:45": "(ئى مۇھەممەد!) ساڭا ۋەھىي قىلىنغان كىتابنى (يەنى قۇرئاننى) تىلاۋەت قىلغىن، نامازنى (تەئدىل ئەركان بىلەن) ئوقۇغىن، ناماز ھەقىقەتەن قەبىھ ئىشلاردىن ۋە گۇناھلاردىن توسىدۇ، ئاللاھنى ياد ئېتىش ھەممىدىن (يەنى ئۇنىڭدىن باشقا ھەممە ئىبادەتتىن) ئۇلۇغدۇر، ئاللاھ قىلىۋاتقان (ھەممە) ئىشىڭلارنى بىلىپ تۇرىدۇ.",
      "62:9": "ئى مۆمىنلەر! جۈمە كۈنى جۈمە نامىزىغا ئەزان ئېيتىلسا، ئاللاھنى ياد ئېتىشكە (يەنى جۈمە خۇتبىسىنى ئاڭلاشقا ۋە جۈمە نامىزىنى ئادا قىلىشقا) ئالدىراپ بېرىڭلار، ئېلىم ـ سېتىمنى قويۇپ تۇرۇڭلار، ئەگەر بىلسەڭلار بۇ سىلەر ئۈچۈن ياخشىدۇر."
    }
  },
  "az": {
    "anahtar": "azeri_musayev",
    "surum": "1.0.4",
    "baslik": "Azerbaijani Translation - Ali Khan Musayev",
    "ayetler": {
      "2:153": "Ey iman gətirənlər! Səbir etmək və namaz qılmaqla (Allahdan) kömək diləyin. Həqiqətən, Allah səbir edənlərlədir!",
      "2:238": "Namazları, (xüsisilə) orta namazı qoruyun və Allah üçün müti olaraq (namaza) durun.",
      "4:103": "Namazı bitirdikdən sonra ayaq üstə olanda da, oturanda da, uzananda da Allahı zikr edin. (Düşmənin hücum etməyəcəyindən) arxayın olduqda isə, namazı (lazımi qaydada) qılın. Çünki namaz möminlərə müəyyən vaxtlarda fərz edilmişdir.",
      "11:114": "Gündüzün iki başında (əvvəlində və axırında) və gecənin bəzi saatlarında doğru-düzgün namaz qıl! Həqiqətən, yaxşı işlər pis əməlləri yuyub aparır. Bu, yada salanlar üçün bir xatırlatmadır.",
      "29:45": "Kitabdan sənə vəhy olunanları oxu və namaz qıl. Həqiqətən, namaz (insanı) çirkin və pis işlərdən çəkindirir. Allahı zikr etmək daha əzəmətlidir. Allah nə etdiklərinizi bilir.",
      "62:9": "Ey iman gətirənlər! Cümə günü namaza çağırıldığı zaman Allahı yad etməyə tələsin və alış-verişi buraxın. Bilsəniz, bu sizin üçün nə qədər xeyirlidir!"
    }
  },
  "uz": {
    "anahtar": "uzbek_rwwad",
    "surum": "1.0.4",
    "baslik": "Uzbek Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "Эй мўминлар, сабр қилиш ва намоз ўқиш билан (Аллоҳдан) мадад сўранглар! Албатта, Аллоҳ сабр қилгувчилар билан биргадир.",
      "2:238": "Намозларни ва ўрта намозни муҳофаза этинг. Аллоҳ учун хушуъ билан туринг.",
      "4:103": "Намозни адо этганингиздан сўнг Аллоҳни турганда ҳам, ўтирганда ҳам, ёнбошлаганда ҳам эслангиз. Хотиржам бўлганингизда намозни тўлиқ адо этингиз. Албатта, мўминларга намоз аниқ вақтда (адо этилиши) фарз бўлди.",
      "11:114": "Кундузнинг икки тарафида ва кечанинг бир қисмида намозни тўкис адо этинг. Яхшиликлар ёмонликларни кетказур. Бу қулоқ солувчилар учун бир эслатмадир.",
      "29:45": "Ўзингизга ваҳий қилинган китобни тиловат қилиб беринг. Намозни тўкис адо этинг. Албатта, намоз бузуқлик ва ёмонликдан қайтаради. Албатта, Аллоҳнинг зикри улуғроқдир. Аллоҳ сизлар қилаётган ишларни билиб туради.",
      "62:9": "Эй иймон келтирган зотлар, Жума куни намозга чақирилса, савдони ташлаб, Аллоҳнинг зикрига шошилинглар. Агар биладиган бўлсангизлар, мана шу сизлар учун яхшироқдир."
    }
  },
  "kk": {
    "anahtar": "kazakh_altai",
    "surum": "1.0.0",
    "baslik": "Kazakh Translation - Khalifa Altai",
    "ayetler": {
      "2:153": "Әй мүміндер! Сабыр және намазбенен (Алладан) жәрдем тілеңдер, күдіксіз Алла (Т.) сабыр етушілермен бірге.",
      "2:238": "Намаздарға ондай-ақ орта намазға сақтық істеңдер. Аллаға бой ұсынған түрде тұрыңдар.",
      "4:103": "Қашан намаз өтеп болсаңдар, Алланы; тұрып, отырып және жатқан бойда еске алыңдар. Қашан тынышталсаңдар, онда намазды толық орындаңдар. Өйткені, намаз мүміндерге белгілі уақытта парыз қылынды.",
      "11:114": "(Мұхаммед Ғ.С.) күндіздің екі жағында, (таң және екінді намазы) Түннің күндізге таяу кезінде, (ақшам, жашыйық) намазын толық орында. Шынында жақсылықтар, жамандықтарды жояды. Бұл түсінушілер үшін бір насихат.",
      "29:45": "(Мұхаммед Ғ.С.) Кітаптан саған уахи етілгенді ғана оқы да намазды орында. Күдіксіз намаз; арсыздықтан, жамандықтан тыяды. Әрине Алланы еске алу, аса ірі нәрсе. Сондай-ақ Алла (Т.) не жасағандарыңды біледі.",
      "62:9": "Әй мүміндер! Жұма күні намаз үшін азан айтылған кезде, дереу Алланы еске алуға (намазға) ұмтылыңдар; және сауданы қойыңдар, егер білген болсаңдар, сендер үшін жақсы."
    }
  },
  "ky": {
    "anahtar": "kyrgyz_hakimov",
    "surum": "1.0.2",
    "baslik": "Kyrgyz Translation - Shamsuddin Hakimov",
    "ayetler": {
      "2:153": "Оо, момундар! (диний жана дүйнөлүк ишиңерде) сабыр жана намаз менен кубаттангыла! Албетте, Аллах, сабырдуулар менен бирге.",
      "2:238": "Намаздарга, айрыкча ортолук намазга бекем болгула! Жана (намазда) Аллахка толук моюн сунган абалда тургула.",
      "4:103": "Ал эми, намазды окуп бүткөнүңөрдөн кийин, турган, отурган жана жамбаштап жаткан (бардык) убактыңарда Аллахты зикир кылгыла. Эгер (согуштан) тынч болсоңор намазды толук окугула. Албетте, намаз ыймандуу адамдар үчүн өз убактысында окулуучу парз болду.",
      "11:114": "(Оо, Мухаммад!) Күндүздүн эки тарабында (түшкө чейин жана түштөн кийин) жана түндүн бир бөлүгүндө намаз оку! Чынында жакшылыктар жамандыктарды (күнөөлөрдү) кетирет. Бул – эскерүүчү адамдар үчүн эскертүү.",
      "29:45": "(Оо, Мухаммад!) Өзүңө вахий кылынган Китепти (Куранды адамдарга) окуп бер жана намазды (толук түрдө) тургуз. Чынында, намаз бузук жана жамандык иштерден кайтарат. Аллахты зикир кылуу эң улук нерсе. Аллах силердин эмне жасаганыңарды билип турат.",
      "62:9": "Оо, ыйман келтирген пенделер! Эгер Жума күнү (Жума намазына чакырып) азан айтылчу болсо, тезинен Аллахты эскерүүгө (мечиттерге) шашылгыла жана сооданы (намаз бүткөнгө чейин) токтоткула. Бул өзүңөр үчүн жакшы, эгер билсеңер."
    }
  },
  "tg": {
    "anahtar": "tajik_arifi",
    "surum": "1.0.2",
    "baslik": "Tajiki Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "Эй касоне, ки имон овардаед, аз шикебоиву намоз ёрӣ биҷӯед [ки] бе тардид Аллоҳ таоло бо сабркунандагон аст",
      "2:238": "[Эй мусулмонон] бар [анҷоми] ҳама намозҳо ва [ба хусус] намози аср кӯшо бошед [саъю талош кунед] ва бо фурӯтаниву фармонбардорӣ барои Аллоҳ таоло ба по хезед",
      "4:103": "Пас, чун намозро ба поён расонидед, Аллоҳро [дар ҳама ҳол] истода ва нишаста ва бар паҳлу хуфта [хобида] ёд кунед; ва ҳар гоҳ оромиш ёфтед [ва тарс аз байн рафт], намозро [комил] барпо доред, [чаро ки] бе тардид, намоз [фаризаест, ки] дар авқоти муайяне бар муъминон воҷиб шудааст",
      "11:114": "Ва дар ду тарафи рӯз [оғоз ва поёни рӯз] ва соате аз шаб намоз бигзор. Бе тардид, некиҳо бадиҳоро аз байн мебарад. Ин [сухан] пандест барои пандпазирон",
      "29:45": "[Эй Паёмбар] Он чиро аз ин китоб бар ту ваҳй шудааст, тиловат кун ва намоз барпо дор. Ба ростӣ, ки намоз инсонро аз гуноҳ ва зишткорӣ бозмедорад ва, албатта, ёди Аллоҳ таоло [аз ҳар коре] болотар аст ва Аллоҳ таоло медонад, ки чи мекунед",
      "62:9": "Эй касоне, ки имон овардаед, ҳангоме ки дар рӯзи ҷумъа барои намоз азон гуфта шавад, ба сӯйи [намозу] зикри Аллоҳ таоло бишитобед ва хариду фурӯшро раҳо кунед. Агар бидонед, ин барои шумо беҳтар аст"
    }
  }
};
