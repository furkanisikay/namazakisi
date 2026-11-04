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
  },
  "sw": {
    "anahtar": "swahili_rwwad",
    "surum": "1.0.5",
    "baslik": "Swahili Translation - Rowad Translation Center",
    "ayetler": {
      "2:153": "Enyi mlioamini! Takeni msaada kwa subira na Swala. Hakika, Mwenyezi Mungu yu pamoja na wanaosubiri.",
      "2:238": "Zilindeni Swala, na hasa Swala ya katikati. Na simameni kwa ajili ya Mwenyezi Mungu kwa unyenyekevu.",
      "4:103": "Na mkishamaliza Swala, basi mtajeni Mwenyezi Mungu hali ya kuwa mmesimama, na mkikaa, na kwa mbavu zenu. Na mtakapotulia, basi simamisheni Swala. Kwani, hakika Swala juu ya Waumini ni andiko lililowekewa nyakati maalumu.",
      "11:114": "Na dumisha Swala katika ncha mbili za mchana na nyakati za usiku zilizo karibu na mchana. Hakika mazuri huondoa mabaya. Huu ni ukumbusho kwa wanaokumbuka.",
      "29:45": "Soma yale uliyofunuliwa katika Kitabu, na ushike Swala. Hakika Swala inazuilia mambo machafu na maovu. Na kwa yakini kumdhukuru Mwenyezi Mungu ndilo jambo kubwa kabisa. Na Mwenyezi Mungu anayajua mnayoyatenda.",
      "62:9": "Enyi mlioamini! Ikiadhiniwa kwa ajili ya Sala siku ya Ijumaa, nendeni upesi kwenye utajo wa Mwenyezi Mungu, na wacheni biashara. Hayo ni bora kwenu, lau kama mnajua."
    }
  },
  "ha": {
    "anahtar": "hausa_gummi",
    "surum": "1.2.2",
    "baslik": "Hausa Translation - Abu Bakr Jumi",
    "ayetler": {
      "2:153": "Ya ku waɗan dasuka yi ĩmãni! Ku nẽmi taimako da haƙuri game da salla. Lalle ne, Allah na tãre da mãsu haƙuri.",
      "2:238": "Ku tsare lõkatai a kan sallõli da salla mafificiya. Kuma ku tsayu kuna mãsu ƙanƙan da kai ga Allah.",
      "4:103": "Sa'an nan idan kun ƙãre salla, to ku ambaci Allah tsaye da zaune da a kan sãsanninku. Sa'an nan idan kun natsu, to, ku tsayar da Salla. Lalle ne salla tã kasance a kan mũminai, farilla mai ƙayyadaddun lõkuta.",
      "11:114": "Kuma ka tsai da salla a gẽfe guda biyu na yini da wani yanki daga dare. Lalle ne ayyukan ƙwarai sunã kõre mũnãnan ayyuka. Wancan ne tunãtarwa ga mãsu tunãwa.",
      "29:45": "Ka karanta abin da ake yin wahayi zuwa gare ka daga Littãfi, kuma ka tsayar da salla. Lalle salla tanã hanãwa daga alfãsha da abni ƙyãma, kuma lalle ambaton Allah yafi girma, kuma Allah Yanã sane da abin da kuke aikatãwa.",
      "62:9": "Yã kũ waɗanda suka yi ĩmãni! Idan anyi kirã zuwã ga salla a rãnar Jumu'a, sai ku yi aiki zuwa ga ambaton Allah, kuma ku bar ciniki. Wancan ɗinku ne mafi alhẽri a gare ku idan kun kasance kunã sani."
    }
  },
  "am": {
    "anahtar": "amharic_sadiq",
    "surum": "1.1.2",
    "baslik": "Amharic Translation - Muhammad Sadiq",
    "ayetler": {
      "2:153": "እናንተ ያመናችሁ ሆይ! በመታገስና በሶላት ተረዱ፡፡ አላህ (በእርዳታው) ከታጋሾች ጋር ነውና፡፡",
      "2:238": "በሶላቶች (በተለይ) በመካከለኛይቱም ሶላት ላይ ተጠባበቁ፡፡ ታዛዦች ኾናችሁም ለአላህ ቁሙ፡፡",
      "4:103": "ሶላትንም በፈጸማችሁ ጊዜ ቆማችሁም ተቀምጣችሁም በጎኖቻችሁም ላይ ተጋድማችሁ አላህን አውሱ፡፡ በረጋችሁም ጊዜ ሶላትን (አሟልታችሁ) ስገዱ፡፡ ሶላት በምእምናን ላይ በጊዜያት የተወሰነች ግዴታ ናትና፡፡",
      "11:114": "ሶላትንም በቀን ጫፎች ከሌሊትም ክፍሎች ፈጽም፡፡ መልካም ሥራዎች ኀጢአቶችን ያስወገድዳሉና፡፡ ይህ ለተገሳጮች ግሳጼ ነው፡፡",
      "29:45": "ከመጽሐፍ ወደ አንተ የተወረደውን አንብብ፡፡ ሶላትንም ደንቡን ጠብቀህ ስገድ፡፡ ሶላት ከመጥፎና ከሚጠላ ነገር ሁሉ ትከለክላለችና፡፡ አላህንም ማውሳት ከሁሉ ነገር በላጭ ነው፤ አላህም የምትሠሩትን ሁሉ ያውቃል፡፡",
      "62:9": "እናንተ ያመናችሁ ሆይ! በዐርብ ቀን ለስግደት ጥሪ በተደረገ ጊዜ ወደ አላህ ማውሳት ኺዱ፡፡ መሸጥንም ተዉ፡፡ ይህ የምታውቁ ብትኾኑ ለእናንተ በጣም የተሻለ ነወ፡፡"
    }
  },
  "om": {
    "anahtar": "oromo_ababor",
    "surum": "1.0.3",
    "baslik": "Oromo Translation - Gali Ababor",
    "ayetler": {
      "2:153": "Yaa warra amantan! Obsaafi salaataan gargaarsa barbaadaa. Dhugumatti, Rabbiin warra obsan waliin jira.",
      "2:238": "Salaatowwan irratti,tikfadhaa keessattuu salaatattii giddu galeessaa irratti. Haala Rabbiif ajajamoo taataniin dhaabbadhaa.",
      "4:103": "Yeroo salaata raawwattan, dhaabbataa, taa'aafi cinaachoowwan keessan irra haala taataniin Rabbiin faarsaa. Yeroo tasgabbooftan salaata dhaabaa. Dhugumatti, salaanni mu’uminoota irratti dirqama yeroon isaa murtaa’e ta’eera.",
      "11:114": "Qaccee lamaan guyyaatiifi yeroo halkan irraa ta’e salaata dhaabi, Toltuuwwan hamtuuwwan ni deemsisu, Kun warra gorfamaniif gorsa.",
      "29:45": "(Yaa Muhammad!) kitaaba irraa waan gara kee buufame dubbisi. Salaatas haqa isaa guutii sagadi. salaanni wantoota fokkatoofi jibbamoo ta’an irraa dhorgiti. Zikrii (faaruu) Rabbiitu (waan hunda irra) guddaadha. Rabbiin waan isin hojjattan ni beeka.",
      "62:9": "Yaa warra amantan! Yeroo guyyaa Jimaataa keessatti salaataaf lallabame gara zikrii Rabbii deemaa; gurgurtaa dhiisaa. kanatu isiniif caala Yoo kan beektan taataniif."
    }
  },
  "so": {
    "anahtar": "somali_yacob",
    "surum": "1.0.26",
    "baslik": "Somali Translation - Abdullah Hasan Yaqoub",
    "ayetler": {
      "2:153": "Kuwa (Xaqa) rumeeyoow! Kaalmaysta samirka iyo salaadda. Hubaal! Alle wuxuu la jiraa kuwa samirka badan.",
      "4:103": "Markaad gudataan salaadda, xusa Alle joog iyo fadhi iyo idinkoo u jiifaba dhinacyadiinna, Markase aad nabad degtaan, u ooga salaadda si wanaagsan. Hubaal, salaadda waxay ku tahay mu’miniinta waajib leh waqtiyo go’an.",
      "29:45": "Akhri (Nabi Muxammadow) waxa laguu soo waxyooday oo ka mid ah Kitaabka (Qur’aanka), oogna salaadda. hubaal, salaaddu waxay ka reebtaa (qofka) xumaanta iyo munkarka (falalka la naco). Xusidda Alle baa xaqiiq weyn. Alle wuu Og yahay waxaad sameyneysaan.",
      "62:9": "Kuwa (Xaqa) rumeeyow! Marka la isugu yeedho salaadda maalinta Jimcaha,  u degedga Xusidda Alle, kana taga ganacsiga, sidaas baa idiin khayr badan, haddaad ogtihiin."
    }
  },
  "ff": {
    "anahtar": "fulani_rwwad",
    "surum": "1.0.2",
    "baslik": "Fulani Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "Heey mon gomɗimɓe (goongɗinɓe), wallitoree muññaare (muñal) e juulde. Pellet, Allah Hino Wonndi he muññiiɓe ɓen.",
      "2:238": "Reenee  juulɗe ɗen, e juulde hakkundeere nden. Daranoɗon Alla ko o toƴƴiniiɓe",
      "4:103": "Si on gaynii juulde nde, jaŋtoree Alla e darnnde, e jonɗde e ka hoore baŋŋeeje mon. Si on ndeeƴii, ñiiɓnee juude nde Pellet, juulde nde woni e dow gooɗinɓe ɓefarilla mbo waktu dottaaɗo",
      "11:114": "Ñiiɓnu juulde nde ka seraaji ɗiɗi ñalawma e saa'iiji jemma. Pellet moƴƴi ɗin hino momta bonɗi ɗin. Ɗuum ko waaju wonan´de ɓeen waajitotooɓe.",
      "29:45": "Janngu ɗum ko waayinaa e maaɗa ka deftere, ñiiɓaa e juulde nden. Pellet, juulde nden no haɗa paŋkare e ko añinii. Ko jantagol Alla ngol ɓuri (hu'unde kala) mawnude. Alla no anndi ko ngolloton kon.",
      "62:9": "Ko onon yo gooŋɗinɓe ! Si juulde nden noddinanaama ñalnde Juma, njaccee e jaŋtagol Allah, ngacciton njeengu. Ko ɗuum ɓuri moƴƴannde on, si tawno ko on annduɓe !"
    }
  },
  "yo": {
    "anahtar": "yoruba_mikail",
    "surum": "1.0.9",
    "baslik": "Yoruba Translation - Abu Rahimah Mikael",
    "ayetler": {
      "2:153": "Ẹ̀yin tí ẹ gbàgbọ́ ní òdodo,ẹ fi sùúrù àti ìrun kíkí tọrọ oore (lọ́dọ̀ Allāhu). Dájúdájú Allāhu ń bẹ pẹ̀lú àwọn onísùúrù.",
      "2:238": "Ẹ ṣọ́ àwọn ìrun (wákàtí márààrún) àti (ní pàápàá jùlọ) ìrun ààrin. Kí ẹ sì dúró kírun fún Allāhu ní olùbẹ̀rù Rẹ̀ (láì sì níí sọ̀rọ̀ tó jẹmọ́ tayé lórí ìrun).",
      "4:103": "Nígbà tí ẹ bá parí ìrun, kí ẹ ṣe (gbólóhùn) ìrántí Allāhu ní ìdúró, ìjókòó àti ìdùbúlẹ̀ yín. Nígbà tí ẹ bá sì fọkàn balẹ̀, kí ẹ kírun (ní pípé). Dájúdájú ìrun kíkí jẹ́ ọ̀ran-anyàn tí A fi àkókò sí fún àwọn onígbàgbọ́ òdodo.",
      "62:9": "Ẹ̀yin tí ẹ gbàgbọ́ ní òdodo, nígbà tí wọ́n bá pe ìrun ní ọjọ́ Jum‘ah, ẹ yára lọ síbi ìrántí Allāhu, kí ẹ sì pa kátà-kárà tì. Ìyẹn lóore jùlọ fún yín tí ẹ bá mọ̀."
    }
  },
  "zh": {
    "anahtar": "chinese_suliman",
    "surum": "1.0.8",
    "baslik": "Chinese Translation - Muhammad Suleiman",
    "ayetler": {
      "2:153": "归信的人们啊！你们当借坚忍和拜功，而求佑助。安拉确是与坚忍者同在的。",
      "2:238": "你们当谨守许多拜功，和最中间的拜功，你们当为安拉而服从地立正。",
      "4:103": "当你们完成拜功的时候，你们当站着、坐着、躺着记念安拉。当你们安宁的时候，你们当谨守拜功。拜功对于信士，确是定时的义务。",
      "11:114": "你当在白昼的两端和初更的时候谨守拜功，善行必能消除恶行。这是对于能觉悟者的教诲。",
      "29:45": "你应当宣读启示你的经典，你当谨守拜功，拜功的确能防止丑事和罪恶，而记念安拉确是更大。安拉知道你们的作为。",
      "62:9": "归信的人们啊！当聚礼日召人礼拜的时候，你们应当赶快去记念安拉，放下买卖，那对于你们是更好的，如果你们知道。"
    }
  },
  "ta": {
    "anahtar": "tamil_omar",
    "surum": "1.0.4",
    "baslik": "Tamil Translation - Omar Sharif",
    "ayetler": {
      "2:153": "நம்பிக்கையாளர்களே! பொறுமை இன்னும் தொழுகையின் மூலம் உதவி கோருங்கள். நிச்சயமாக அல்லாஹ் பொறுமையாளர்களுடன் இருக்கிறான்.",
      "2:238": "(எல்லாத்) தொழுகைகளையும், (குறிப்பாக) நடுத்தொழுகையையும் பேணி பாதுகாத்து வழமையாக நிறைவேற்றி வாருங்கள். இன்னும், (தொழுகையில்) அல்லாஹ்விற்குப் பணிந்தவர்களாக நில்லுங்கள்.",
      "4:103": "ஆக, நீங்கள் தொழுகையை முடித்தால் நின்றவர்களாகவும், உட்கார்ந்தவர்களாகவும், உங்கள் விலாக்கள் மீது (படுத்தவர்களாகவு)ம் (நீங்கள் எந்த நிலையில் இருந்தாலும்) அல்லாஹ்வை நினைவு கூர்ந்தவர்களாக இருங்கள். ஆக, (எதிரிகளின் தாக்குதலில் இருந்து) நீங்கள் (பாதுகாப்பு பெற்று) நிம்மதி அடைந்தால் தொழுகையை (முறைப்படி முழுமையாக) நிலைநிறுத்துங்கள். நிச்சயமாகத் தொழுகை நம்பிக்கையாளர்கள் மீது நேரம் குறிக்கப்பட்ட கடமையாக இருக்கிறது.",
      "11:114": "இன்னும், (நபியே!) பகலின் இரு ஓரங்களிலும் (-காலை, மாலையில்), இரவின் ஒரு பகுதியிலும் (ஆக, ஐந்து நேர) தொழுகையை நிலை நிறுத்துவீராக! நிச்சயமாக நன்மைகள் பாவங்களைப் போக்கி விடுகின்றன. (அல்லாஹ்வை) நினைவு கூர்பவர்களுக்கு இது ஒரு நல்லுபதேசமாகும்.",
      "29:45": "இந்த வேதத்திலிருந்து உமக்கு வஹ்யில் எது அறிவிக்கப்பட்டதோ அதை ஓதுவீராக! இன்னும், தொழுகையை நிலை நிறுத்துவீராக! நிச்சயமாக தொழுகை மானக்கேடானவற்றை விட்டும் தீயகாரியங்களை விட்டும் தடுக்கிறது. அல்லாஹ் (உங்களை) நினைவு கூர்வது (நீங்கள் அவனை நினைவு கூர்வதை விட) மிகப் பெரியதாகும். இன்னும், அல்லாஹ் நீங்கள் செய்பவற்றை நன்கறிகிறான்.",
      "62:9": "நம்பிக்கையாளர்களே! ஜுமுஆ தினத்தன்று தொழுகைக்காக அழைக்கப்பட்டால் அல்லாஹ்வின் நினைவின் பக்கம் (வெள்ளிக் கிழமை பிரசங்கத்தை செவியுறுவதன் பக்கம்) நீங்கள் விரையுங்கள்! இன்னும், வியாபாரத்தை விட்டுவிடுங்கள்! நீங்கள் (அதன் நன்மையை) அறிகிறவர்களாக இருந்தால் அதுதான் உங்களுக்கு மிகச் சிறந்ததாகும்."
    }
  },
  "ml": {
    "anahtar": "malayalam_kunhi",
    "surum": "1.0.3",
    "baslik": "Malayalam Translation - Abdul Hamid Haidar and Kunhi Muhammad",
    "ayetler": {
      "2:153": "സത്യവിശ്വാസികളെ, നിങ്ങള്‍ സഹനവും നമസ്കാരവും മുഖേന (അല്ലാഹുവിനോട്‌) സഹായം തേടുക. തീര്‍ച്ചയായും ക്ഷമിക്കുന്നവരോടൊപ്പമാകുന്നു അല്ലാഹു.",
      "4:103": "അങ്ങനെ നമസ്കാരം നിര്‍വഹിച്ചു കഴിഞ്ഞാല്‍ നിങ്ങള്‍ നിന്നു കൊണ്ടും ഇരുന്ന് കൊണ്ടും കിടന്ന് കൊണ്ടും അല്ലാഹുവെ ഓര്‍മിക്കുക. സമാധാനാവസ്ഥയിലായാല്‍ നിങ്ങള്‍ നമസ്കാരം മുറപ്രകാരം തന്നെ നിര്‍വഹിക്കുക. തീര്‍ച്ചയായും നമസ്കാരം സത്യവിശ്വാസികള്‍ക്ക് സമയം നിര്‍ണയിക്കപ്പെട്ട ഒരു നിര്‍ബന്ധബാധ്യതയാകുന്നു.",
      "62:9": "സത്യവിശ്വാസികളേ, വെള്ളിയാഴ്ച നമസ്കാരത്തിന് വിളിക്കപ്പെട്ടാല്‍ അല്ലാഹുവെ പറ്റിയുള്ള സ്മരണയിലേക്ക് നിങ്ങള്‍ വേഗത്തില്‍ വരികയും, വ്യാപാരം ഒഴിവാക്കുകയും ചെയ്യുക. അതാണ് നിങ്ങള്‍ക്ക് ഉത്തമം; നിങ്ങള്‍ കാര്യം മനസ്സിലാക്കുന്നുവെങ്കില്‍."
    }
  },
  "th": {
    "anahtar": "thai_rwwad",
    "surum": "1.0.1",
    "baslik": "Thai Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "โอ้บรรดาผู้ศรัทธาทั้งหลาย จงขอการช่วยเหลือด้วยความอดทนและการละหมาด แท้จริงอัลลอฮ์ทรงอยู่ร่วมกับบรรดาผู้อดทน",
      "2:238": "พวกเจ้าจงให้ความตระหนักต่อการละหมาดทั้งหลายเถิด และการละหมาดที่อยู่กึ่งกลาง และพวกเจ้าจงยืนละหมาดเพื่ออัลลอฮ์อย่างนอบน้อมเถิด",
      "4:103": "ครั้นเมื่อพวกเจ้าเสร็จจากการละหมาดแล้ว ก็จงกล่าวรำลึกถึงอัลลอฮ์ ทั้งในสภาพยืนและนั่งและในสภาพนอนเอกเขนกของพวกเจ้า ครั้นเมื่อพวกเจ้าปลอดภัยแล้ว ก็จงดำรงไว้ซึ่งการละหมาด แท้จริงการละหมาดนั้นเป็นบัญญัติที่ถูกกำหนดเวลาไว้แก่ผู้ศรัทธาทั้งหลาย",
      "11:114": "และเจ้าจงดำรงไว้ซึ่งการละหมาด ตามปลายช่วงทั้งสองของกลางวันและยามต้นจากกลางคืน แท้จริงการดีทั้งหลายย่อมลบล้างความชั่วทั้งหลาย นั่นคือข้อเตือนสำหรับบรรดาผู้ที่รำลึก",
      "29:45": "เจ้าจงอ่านสิ่งที่ถูกวะฮ์ยูแก่เจ้าจากคัมภีร์ และจงดำรงการละหมาด (เพราะ) แท้จริงการละหมาดนั้นจะยับยั้งการกระทำที่ลามกและประพฤติชั่ว และการรำลึกถึงอัลลอฮ์นั้นยิ่งใหญ่กว่า และอัลลอฮ์ทรงรอบรู้สิ่งที่พวกเจ้ากระทำ",
      "62:9": "โอ้บรรดาผู้ศรัทธาเอ๋ย เมื่อได้มีเสียงร้องเรียก (อะซาน) เพื่อทำละหมาดในวันศุกร์ ก็จงรีบเร่งไปสู่การรำลึกถึงอัลลอฮ์ และจงละทิ้งการค้าขายเสีย นั่นเป็นการดีสำหรับพวกเจ้าหากพวกเจ้ารู้"
    }
  },
  "ko": {
    "anahtar": "korean_rwwad",
    "surum": "1.0.11",
    "baslik": "Korean Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "믿는 자들이여! 인내심과 예배로써 (하나님께) 도움을 요청하라. 실로 하나님께서는 인내하는 자들과 함께 하시노라.",
      "2:238": "그대들은 여러 예배들과 중간 예배를 꾸준히 지키고, (예배 시에는) 하나님을 위해 부단히 복종하며 서 있으라.",
      "4:103": "그렇게 그대들이 예배를 종료하였다면 서서, 앉아서, 누워서 하나님을 떠올리라. 그러나 그대들이 평온해졌다면 올바로 예배를 드리라. 실로 예배는 믿는 자들에게 정해진 시간에 실천해야 할 의무로 지정되었노라.",
      "11:114": "그대는 낮의 양 끝자락에 그리고 밤의 어귀에 성실히 예배를 드리라. 실로 선행은 악행을 없애주노라. 이는 기억하는 자들을 위한 떠올림이라.",
      "62:9": "믿는 자들이여! 금요일에 예배를 위한 부름이 울릴 때면 어서 하나님을 떠올리는 곳(마스지드)으로 가되 상거래는 그만두라. 그대들이 알고 있다면 그것이 그대들에게 더 좋은 것이라."
    }
  },
  "vi": {
    "anahtar": "vietnamese_rwwad",
    "surum": "1.0.9",
    "baslik": "Vietnamese Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "Hỡi những người có đức tin, các ngươi hãy cầu xin sự giúp đỡ (của Allah) bằng lòng kiên nhẫn và lễ nguyện Salah. Quả thật, Allah luôn bên cạnh những người kiên nhẫn.",
      "2:238": "Các ngươi hãy giữ gìn và duy trì các lễ nguyện Salah, nhất là cuộc lễ chính giữa (Salah ‘Asr), và các ngươi hãy đứng dâng lễ vì Allah một cách thành tâm cùng với tinh thần đầy sùng kính.",
      "4:103": "Khi các ngươi đã hoàn thành xong lễ nguyện Salah thì các ngươi hãy tụng niệm, tán dương Allah (như được truyền dạy theo Sunnah) trong mọi lúc dù đang đứng, đang ngồi hoặc đang nằm nghiêng một bên. Sau khi các ngươi được bình an (không còn sợ hãi nữa) thì các ngươi hãy thiết lập lễ nguyện Salah (cho thật chu đáo). Quả thật, lễ nguyện Salah đã được ban hành cho những người có đức tin vào giờ giấc ấn định.",
      "11:114": "Ngươi (hỡi Thiên Sứ Muhammad) hãy duy trì các lễ nguyện Salah ở hai đầu của ban ngày và ở một số giờ của ban đêm. Thật vậy, những việc làm thiện tốt giúp loại bỏ những điều xấu. Đó là lời nhắc nhở dành cho những người biết lưu tâm.",
      "29:45": "Ngươi (hỡi Thiên Sứ Muhammad) hãy xướng đọc những điều đã được mặc khải cho Ngươi trong Kinh Sách (Qur’an) và Ngươi hãy chu đáo dâng lễ nguyện Salah. Quả thật, lễ nguyện Salah sẽ ngăn cản mọi điều ô uế và tội lỗi. Và việc tưởng nhớ Allah là điều lớn lao nhất, và Allah biết rõ mọi điều các ngươi làm.",
      "62:9": "Hỡi những người có đức tin! Khi được mời gọi đến lễ nguyện Salah Jumu’ah (vào ngày thứ sáu) thì các ngươi hãy nhanh chân tiến đến với việc tụng niệm Allah và hãy tạm gác lại việc mua bán. Điều đó tốt cho các ngươi nếu các ngươi biết."
    }
  },
  "pt": {
    "anahtar": "portuguese_nasr",
    "surum": "1.4.1",
    "baslik": "Portuguese Translation - Helmi Nasr",
    "ayetler": {
      "2:153": "Ó vós que credes! Implorai ajuda com a paciência e a oração. Por certo, Allah é com os perseverantes.",
      "2:238": "Custodiai as orações e em particular a oração mediana, e levantai-vos sendo devotos a Allah.",
      "4:103": "E, quando houverdes encerrado a oração, lembrai-vos de Allah, estando de pé ou assentados ou deitados. E, quando estiverdes em segurança, cumpri a oração. Por certo, a oração, para os crentes, é prescrição com tempos marcados.",
      "11:114": "E cumpre a oração, nos dois extremos do dia e nas primícias da noite. Por certo, as boas obras fazem ir as más obras. Isso é lembrança para os que se lembram de Allah.",
      "29:45": "Recita, Muhammad, o que te foi revelado do Livro e cumpre a oração. Por certo, a oração coíbe a obscenidade e o reprovável. E, certamente, a lembrança de Allah é maior que isso. E Allah sabe o que engenhais.",
      "62:9": "Ó vós que credes! Quando se chama à oração da Sexta-feira, ide, depressa, para a lembrança de Allah, e deixai a venda. Isto vos é melhor. Se soubésseis!"
    }
  },
  "it": {
    "anahtar": "italian_rwwad",
    "surum": "1.0.2",
    "baslik": "Italian Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "O credenti, sostenetevi con la pazienza e la preghiera: in verità Allāh è con i pazienti.",
      "2:238": "Compiete assiduamente le preghiere, e particolarmente la mediana, e tendete umilmente ad Allāh.",
      "4:103": "Quando finite di pregare, lodate Allāh in piedi, seduti e sui fianchi! Se vi sentite abbastanza sicuri, praticate la preghiera con devozione: in verità la preghiera, per i credenti, è stata sempre un obbligo in momenti stabiliti.",
      "11:114": "E praticate la preghiera con devozione mattina e sera, e parte della notte. In verità le opere buone cancellano quelle cattive. Quello è un monito per i devoti.",
      "29:45": "Recita ciò che ti viene ispirato dal Libro e pratica la preghiera con devozione: in verità la preghiera distoglie dalla nefandezza e dagli atti riprovevoli. E invocare Allāh è l’atto più meritevole, e Allāh sa bene ciò che fate.",
      "62:9": "O credenti! Se viene la chiamata alla preghiera, il giorno del Venerdì, accorrete a pregare Allāh e sospendete gli affari: ciò è meglio per voi, se sapeste!"
    }
  },
  "sv": {
    "anahtar": "swedish_rwwad",
    "surum": "1.0.2",
    "baslik": "Swedish Translation - Rowad Translation",
    "ayetler": {
      "2:153": "Troende! Sök hjälp i tålamod och bön. Gud är säkerligen med de tålmodiga.",
      "2:238": "Slå vakt om bönerna, och särskilt den mittersta, och stå inför Gud i ödmjuk lydnad.",
      "4:103": "När ni har fullbordat bönen, prisa då Gud stående, sittande och liggande. Och när ni åter är trygga, förrätta då bönen fullt ut. Bönen är en föreskriven plikt för de troende, bunden till bestämda tider.",
      "11:114": "Förrätta bönen vid dagens början och vid dess slut, och under delar av natten. Goda gärningar utplånar de onda. Detta är en påminnelse för de som låter sig påminnas.",
      "29:45": "Recitera skriften som har uppenbarats för dig och förrätta bönen. Bönen avhåller från skamlöshet och synder, och att minnas Gud är förvisso det allra största. Gud har full vetskap om era handlingar.",
      "62:9": "Troende! När det kallas till bön på fredagen, skynda då till Guds åminnelse och lägg handeln åt sidan. Detta är bättre för er, om ni bara visste."
    }
  },
  "uk": {
    "anahtar": "ukrainian_yakubovych",
    "surum": "1.0.2",
    "baslik": "Ukrainian Translation - Mikhailo Yakubovych",
    "ayetler": {
      "2:153": "О ви, які увірували! Шукайте допомоги у терпінні та молитві. Воістину, Аллаг — разом із терплячими!",
      "2:238": "Звершуйте молитви належно і, особливо, середню молитву. Стійте ж перед Аллагом смиренними!",
      "4:103": "Коли ви звершите молитву, то згадуйте Аллага — стоячи, сидячи та лежачи. І коли ви опинитеся у безпеці, то звершуйте повну молитву. Воістину, молитва встановлена для віруючих у визначений час.",
      "11:114": "Звершуй молитву на початку й наприкінці дня, а ще в деякі години ночі. Воістину, добрі вчинки видаляють погані. Таке нагадування для тих, хто згадує!",
      "29:45": "Читай те, що було відкрито тобі з Писання, та звершуй молитву. Воістину, молитва стримує від розпусти й неприйнятного! Але згадка Аллага — важливіша, і Він знає те, що ви робите!",
      "62:9": "О ви, які увірували! Коли закликають вас на молитву в п’ятницю, то зверніться до згадування Аллага і полиште справи торгівельні. Це краще для вас, якщо ви розумієте!"
    }
  },
  "ro": {
    "anahtar": "romanian_project",
    "surum": "1.0.4",
    "baslik": "Romanian Translation - Islam4ro.com",
    "ayetler": {
      "2:153": "O, voi, cei care credeţi! Căutaţi ajutor întru răbdare şi Rugăciune. Cu adevărat Allah este cu cei răbdători!",
      "2:238": "Efectuați Rugăciunile [obligatorii] cu sârguință, [în special] Rugăciunea de la mijloc [Asr]! Şi staţi în picioare dinaintea lui Allah, cu supunere!",
      "4:103": "Dacă ați împlinit Rugăciunea [As-Salat], pomeniți Numele lui Allah, stând în picioare, așezați sau întinși pe o parte. Dar când sunteți în pace, atunci împliniți Rugăciunea [As-Salat] [în întregime]. Cu adevărat, Rugăciunea [As-Salat] a fost stabilită pentru dreptcredincioși la timpuri hotărâte.",
      "11:114": "Și împlinește Rugăciunea [As-Salat] la cele două capete ale zilei și la anumite ceasuri din noapte. Cu adevărat, faptele bune le alungă pe cele rele. Aceasta este o reamintire pentru cei care își reamintesc [cugetă și I se supun lui Allah].",
      "29:45": "Recită [o, Mohammed,] ceea ce ți s-a revelat din Carte și împlinește Rugăciunea [As-Salat]! Într-adevăr Rugăciunea [As-Salat] împiedică de la ceea ce este rușinos și de la ceea ce este oprit. Și Pomenirea lui Allah este și mai mare, iar Allah Știe ce faceți voi!",
      "62:9": "O, voi cei care credeți! Când se cheamă la Rugăciune [As-Salat], în ziua de Vineri, grăbiți-vă la Pomenirea lui Allah și lăsați negoțul! Aceasta este mai bine pentru voi, dacă [voiți să] știți."
    }
  },
  "hr": {
    "anahtar": "croatian_rwwad",
    "surum": "1.0.1",
    "baslik": "Croatian Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "O vi koji vjerujete, tražite sebi pomoći u strpljivosti i molitvi! Allah je, doista, uz strpljive.",
      "2:238": "Čuvajte molitve, naročito molitvu u sredini dana, i pred Allahom ponizno stojte!",
      "4:103": "A kada molitvu završite, Allaha spominjite, i stojeći, i sjedeći, i ležeći na bokovima. A kada budete sigurni, klanjajte u potpunosti; molitva je, uistinu, propisana vjernicima u određenim vremenskim razmacima.",
      "11:114": "I klanjaj početkom i krajem dana, i u prvim časovima noći! Dobra djela zaista poništavaju hrđava. To je opomena za one koji se opomene prisjećaju.",
      "29:45": "Kazuj Knjigu koja ti se objavljuje i obavljaj molitvu – molitva, zaista, odvraća od razvrata i od svega što je ružno, a sigurno je spominjanje Allaha veće! – A Allah zna šta radite.",
      "62:9": "O vi koji vjerujete, kad u petak na molitvu budete pozvani, požurite na spominjanje Allaha i kupoprodaju ostavite, to vam je bolje, ako znate!"
    }
  },
  "sr": {
    "anahtar": "serbian_rwwad",
    "surum": "1.0.4",
    "baslik": "Serbian Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "О ви који верујете, тражите себи помоћ у стрпљивости и молитви! Аллах је, заиста, уз стрпљиве.",
      "2:238": "Чувајте молитве, нарочито молитву у средини дана, и пред Аллахом понизно стојте!",
      "4:103": "А када молитву завршите, Аллаха спомињите, и стојећи, и седећи, и лежећи на боковима. А када будете сигурни, молитву обављајте у потпуности; молитва је, уистину, обавезна верницима у одређеним временским периодима.",
      "11:114": "И обављај молитву почетком и крајем дана, и у првим часовима ноћи! Добра дела заиста поништавају рђава. То је опомена за оне којима опомена користи.",
      "29:45": "Казуј Књигу која ти се објављује и обављај молитву - молитва, заиста, одвраћа од разврата и од свега што је ружно; а слављење Бога је сигурно веће! Бог зна шта радите.",
      "62:9": "О ви који верујете, кад у петак на молитву будете позвани, пожурите на слављење Аллаха, и оставите се трговине, то вам је боље, ако знате!"
    }
  },
  "el": {
    "anahtar": "greek_rwwad",
    "surum": "1.0.2",
    "baslik": "Greek Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "Ω, εσείς που πιστεύετε! Να αναζητάτε τη βοήθεια (του Αλλάχ) μέσω της υπομονής και της προσευχής (που σας φέρνει πιο κοντά στον Αλλάχ). Στ’ αλήθεια, ο Αλλάχ είναι με τους υπομονετικούς (υποστηρίζοντας και βοηθώντας τους).",
      "2:238": "Τηρείτε αυστηρά τις (πέντε υποχρεωτικές καθημερινές) προσευχές, και (ειδικά) τη μεσαία προσευχή (Αλ-‘Ασρ). Και σταθείτε (στις προσευχές σας) ενώπιον του Αλλάχ υπάκουοι και ταπεινοί.",
      "4:103": "Όταν τελειώσετε την προσευχή, εξυμνείστε τον Αλλάχ (σ' όλες σας τις καταστάσεις), είτε είστε όρθιοι, είτε καθισμένοι, είτε ξαπλωμένοι πλάγια. Αλλά όταν είστε πάλι ασφαλείς, να τελείτε τις προσευχές (ολοκληρωμένες στις καθορισμένες ώρες τους και με τον ολοκληρωμένο τρόπο). Πράγματι, η προσευχή επιβάλλεται στους πιστούς σε καθορισμένες ώρες.",
      "11:114": "Και τέλεσε την προσευχή στις δύο άκρες της ημέρας (στην αρχή και στο τέλος της) και σε ορισμένες ώρες της νύχτας. Πράγματι, οι καλές πράξεις σβήνουν τις κακές. Αυτή είναι μία υπενθύμιση (και νουθεσία) για όσους θα τη λάβουν υπόψη.",
      "29:45": "Απάγγειλε (ω, Μωχάμμαντ) ό,τι στάλθηκε σε σένα από το Βιβλίο (το Κορ’άν), και τέλεσε την προσευχή. Πράγματι, η προσευχή απαγορεύει κάθε αισχρή πράξη και κάθε απαγορευμένη πράξη (και απομακρύνει τον άνθρωπο απ' αυτές). Και η εξύμνηση προς τον Αλλάχ είναι σπουδαιότερη (από οτιδήποτε άλλο), και ο Αλλάχ γνωρίζει ό,τι κάνετε.",
      "62:9": "Ω, εσείς που πιστεύετε! Όταν γίνεται η κλήση (Αδάν) για την προσευχή της Παρασκευής (Αλ-Τζούμου‘α), σπεύστε για τη μνημόνευση του Αλλάχ (δηλ. για να ακούσετε το κήρυγμα και να τελέσετε την προσευχή). Και αφήστε τις συναλλαγές. Αυτό είναι καλύτερο για σας, αν το γνωρίζετε!"
    }
  },
  "ja": {
    "anahtar": "japanese_saeedsato",
    "surum": "1.0.13",
    "baslik": "Japanese Translation - Saeed Sato",
    "ayetler": {
      "2:153": "信仰する者たちよ、忍耐と礼拝をもって助力とせよ。本当にアッラーは、忍耐ある者たちと共におられるのだから。",
      "2:238": "（ムスリムたちよ、）礼拝を遵守せよ、そして中間の礼拝を。また、アッラーに向かい、恭しく（礼拝に）立つのだ。",
      "4:103": "そしてあなた方が礼拝を終えたならば、立ったまま、座ったまま、横たわったまま、アッラーを唱念せよ。そして安全になったら、（通常通りの形で）礼拝を遵守せよ。本当に礼拝はもとより、信仰者に対して定刻に義務づけられているのだから。",
      "11:114": "また（預言者よ、）昼の両端と夜の一部に、礼拝を遵守せよ。本当に善行は、悪行を駆逐するのだから。それは教訓を得る者たちにとっての、教訓である。",
      "29:45": "あなたに啓典の内から啓示されたものを読誦し、礼拝を遵守せよ。実に礼拝は、醜行と悪事を禁じるのだから。そして、アッラーの唱念こそは（何）より偉大であり、アッラーはあなた方の成すことをご存知なのだ。",
      "62:9": "信仰する者たちよ、合同の日（金曜日）に（合同）礼拝に呼びかけられたらアッラーの唱念に励み、商売（など、あらゆる仕事）を中断するのだ。それがあなた方にとって、より善いのだから。もし、あなた方が（そのことを）知っていたのなら（、そうせよ）。"
    }
  },
  "gu": {
    "anahtar": "gujarati_omari",
    "surum": "1.1.3",
    "baslik": "Gujarati Translation - Rabella Al-Omari",
    "ayetler": {
      "2:153": "હે ઇમાનવાળાઓ! સબર અને નમાજ વડે (અલ્લાહથી) મદદ માંગો, અલ્લાહ તઆલા સબર કરવાવાળાની સાથે છે.",
      "2:238": "નમાઝોની પાબંદી કરો, ખાસ કરીને વચ્ચેની નમાઝની અને અલ્લાહ તઆલા માટે અદબ સાથે ઉભા રહો.",
      "4:103": "પછી જ્યારે તમે નમાઝ પઢતા રહો, ઊભા-ઊભા, બેઠાં-બેઠાં અને સૂતાં-સૂતાં અલ્લાહ તઆલાના નામનું સ્મરણ કરતા રહો અને જ્યારે શાંતિ મળે ત્યારે નમાઝ પાબંદી સાથે પઢો, નિ:શંક નમાઝ ઈમાનવાળાઓ માટે નક્કી કરેલ સમય પર પઢવી જરૂરી છે.",
      "11:114": "દિવસના બન્ને ભાગમાં નમાઝ પઢતા રહો અને રાતના અમુક ભાગમાં પણ, નિ:શંક સદકર્મો દુષ્કર્મોને ખતમ કરી દે છે, આ શિખામણ છે, શિખામણ પ્રાપ્ત કરનારાઓ માટે.",
      "29:45": "(હે નબી!) જે કિતાબ તમારી તરફ વહી કરવામાં આવી છે, તેને પઢો અને નમાઝ પઢતા રહો, નિ:શંક નમાઝ ખરાબ કાર્યો અને અપરાધ કરવાથી રોકે છે, નિ:શંક અલ્લાહનો ઝિકર ખૂબ જ મોટું કાર્ય છે. તમે જે કંઈ પણ કરી રહ્યા છો તેને અલ્લાહ ખૂબ સારી રીતે જાણે છે.",
      "62:9": "હે ઇમાનવાળાઓ! જુમ્અહના દિવસે નમાઝ માટે અઝાન આપવામાં આવે તો તમે અલ્લાહના ઝિકર તરફ ભાગો અને લે-વેચ છોડી દો, આ તમારા માટે ખૂબ જ ઉત્તમ છે, જો તમે જાણતા હોવ."
    }
  },
  "bg": {
    "anahtar": "bulgarian_translation",
    "surum": "1.0.0",
    "baslik": "Bulgarian Translation",
    "ayetler": {
      "2:153": "О вие, които повярвахте! Искайте помощта на Аллах с търпение и намаз! Наистина, Аллах е с търпеливите.",
      "2:238": "Спазвайте молитвите намаз, особено средната молитва намаз и заставайте смирени пред Аллах!",
      "4:103": "И когато завършите молитвата намаз, споменавайте Аллах прави, седнали и на хълбок! А когато сте вън от опасност, изпълнявайте молитвата намаз в цялост! Наистина, за правоверните молитвата намаз е предписание в определено време.",
      "11:114": "И извършвай молитвата намаз в началото и края на деня, и в началото на нощта! Наистина, добрините премахват злините. Това е наставление за поучаващите се.",
      "29:45": "Чети онова, което ти бе разкрито от Книгата, и извършвай намаз! Наистина, молитвата намаз предпазва от покварата и порицаваното. Безусловно, споменаването на Аллах е най-велико, и Аллах знае какво правите.",
      "62:9": "О вие, които повярвахте! Щом се призове за молитвата в петъчния ден, устремете се към споменаването на Аллах и оставете търговията! Това е най-доброто за вас, ако знаете."
    }
  },
  "mk": {
    "anahtar": "macedonian_group",
    "surum": "1.0.1",
    "baslik": "Macedonian Translation - a group of Macedonian scholars",
    "ayetler": {
      "2:153": "О, верници, барајте за себе помош во трпеливоста и во намазот (молитвата)! Аллах навистина е на страната на трпеливите!",
      "2:238": "Чувајте го намазот (молитвата), особено средниот намаз, и пред Аллах понизно стојте.",
      "4:103": "А кога намазот (молитвата) ќе го завршите, Аллах спомнувајте Го, и стоејќи и седејќи и лежејќи. А кога ќе бидете безбедни, намазот во потполност извршувајте го, бидејќи на верниците им е пропишано во одредени временски интервали намазот да го извршуваат.",
      "11:114": "И извршувај го намазот (молитвата) на почетокот и на крајот на денот, и во првите часови на ноќта! Добрите дела навистина ги поништуваат лошите. Тоа е поука за тие што сакаат поука.",
      "29:45": "Кажувај го од Книгата тоа што ти се објавува и извршувај го намазот (молитвата) – намазот навистина одвраќа од развратот и од сè што е лошо; а Аллаховото спомнување на вас е поголемо од вашето спомнување на Него! – А Аллах знае што правите!",
      "62:9": "О, верници, кога во петок на намаз ќе се повика, побрзајте кон спомнувањето на Аллах, и купопродажбата оставете ја, тоа ви е подобро, да знаете!"
    }
  },
  "fil": {
    "anahtar": "tagalog_rwwad",
    "surum": "1.1.4",
    "baslik": "Filipino Translation (Tagalog) - Rowwad Translation Center",
    "ayetler": {
      "2:153": "O mga sumampalataya, magpatulong kayo sa pamamagitan ng pagtitiis at pagdarasal. Tunay na si Allāh ay kasama ng mga nagtitiis.",
      "2:238": "Mangalaga kayo sa mga dasal at [lalo na] sa dasal na pinakagitna. Tumayo kayo kay Allāh bilang mga masunurin.",
      "4:103": "Kaya kapag nagwakas kayo sa pagdarasal ay bumanggit kayo kay Allāh nang nakatayo, o nakaupo, o [nakahiga] sa mga tagiliran ninyo. Kaya kapag napanatag kayo ay magpanatili kayo ng pagdarasal. Tunay na ang pagdarasal, laging para sa mga mananampalataya, ay isang atas na tinakdaan ng panahon.",
      "62:9": "O mga sumampalataya, kapag nanawagan para sa pagdarasal sa araw ng Biyernes ay magmadali kayo sa pag-alaala kay Allāh at iwan ninyo ang pagtitinda. Iyon ay higit na mabuti para sa inyo kung kayo ay nakaaalam."
    }
  },
  "te": {
    "anahtar": "telugu_muhammad",
    "surum": "1.0.7",
    "baslik": "Telugu Translation - Abdurrahim ibn Muhammad",
    "ayetler": {
      "2:153": "ఓ విశ్వాసులారా! సహనం మరియు నమాజ్ ద్వారా సహాయం అర్థించండి. నిశ్చయంగా, అల్లాహ్ సహనం గలవారితో ఉంటాడు.",
      "2:238": "మీరు మీ నమాజ్ లను కాపాడుకోండి మరియు ముఖ్యంగా మధ్య నమాజ్ ను మరియు అల్లాహ్ సన్నిధానంలో వినయవిధేయతలతో నిలబడండి.",
      "4:103": "ఇక నమాజ్ ను పూర్తి చేసిన తరువాత నిలుచున్నా, కూర్చున్నా, పరుండినా అల్లాహ్ ను స్మరిస్తూ ఉండండి. కాని శాంతిభద్రతలు నెలకొన్న తరువాత నమాజ్ ను స్థాపించండి. నిశ్చయంగా, నమాజ్ విశ్వాసులకు నియమిత సమయాలలో పాటించడానికి విధిగా నియమించబడింది.",
      "11:114": "మరియు దినపు చివరి రెండు భాగాల్లోనూ మరియు రాత్రిపూట కొంత భాగంలో కూడా నమాజ్ సలపండి. నిశ్చయంగా, సత్కార్యాలు దుష్కార్యాలను దూరం చేస్తాయి. జ్ఞాపకం ఉంచుకునే వారికి ఇది ఒక ఉపదేశం (జ్ఞాపిక).",
      "29:45": "(ఓ ప్రవక్తా!) నీపై దివ్యజ్ఞానం (వహీ) ద్వారా అవతరింపజేయబడిన గ్రంథాన్ని చదివి వినిపించు మరియు నమాజ్ ను స్థాపించు. నిశ్చయంగా, నమాజ్ అసహ్యకరమైన పనుల నుండి మరియు అధర్మమైన పనుల నుండి నిషేధిస్తుంది. మరియు అల్లాహ్ ధ్యానమే (అన్నిటి కంటే) గొప్పది. మరియు మీరు చేసేదంతా అల్లాహ్ కు బాగా తెలుసు.",
      "62:9": "ఓ విశ్వాసులారా! శుక్రవారం (జుముఅహ్) రోజు నమాజ్ కొరకు పిలుపు ఇవ్వబడినప్పుడు, మీరు మీ వ్యాపారాలను విడిచి అల్లాహ్ స్మరణ వైపునకు పరుగెత్తండి. మీరు తెలుసుకోగలిగితే అది మీకు ఎంతో ఉత్తమమమైనది."
    }
  },
  "kn": {
    "anahtar": "kannada_hamza",
    "surum": "1.0.3",
    "baslik": "Kannada Translation - Hamza Butur",
    "ayetler": {
      "2:153": "ಓ ಸತ್ಯವಿಶ್ವಾಸಿಗಳೇ! ತಾಳ್ಮೆ ಮತ್ತು ನಮಾಝಿನ ಮೂಲಕ (ಅಲ್ಲಾಹನಲ್ಲಿ) ಸಹಾಯ ಬೇಡಿರಿ. ನಿಶ್ಚಯವಾಗಿಯೂ ಅಲ್ಲಾಹು ತಾಳ್ಮೆಯುಳ್ಳವರ ಜೊತೆಗಿದ್ದಾನೆ.",
      "2:238": "ನಮಾಝ್‌ಗಳನ್ನು ಸಂರಕ್ಷಣೆ ಮಾಡಿರಿ. ವಿಶೇಷವಾಗಿ ಮಧ್ಯಮ (ಅಸರ್) ನಮಾಝನ್ನು. ಅಲ್ಲಾಹನ ಮುಂದೆ ವಿಧೇಯತೆಯಿಂದ ನಿಲ್ಲಿರಿ.",
      "4:103": "ನೀವು ನಮಾಝ್ ನಿರ್ವಹಿಸಿದ ಬಳಿಕ ನಿಂತು, ಕುಳಿತು ಮತ್ತು ಪಾರ್ಶ್ವಕ್ಕೆ ಸರಿದು (ಮಲಗಿ) ಅಲ್ಲಾಹನನ್ನು ಸ್ಮರಿಸಿರಿ. ನೀವು ನಿರ್ಭಯರಾಗಿರುವಾಗ, ನಮಾಝನ್ನು ಯಥಾಪ್ರಕಾರ ಸಂಸ್ಥಾಪಿಸಿರಿ. ನಿಶ್ಚಯವಾಗಿಯೂ ನಮಾಝ್ ಸತ್ಯವಿಶ್ವಾಸಿಗಳ ಮೇಲೆ ಸಮಯ ನಿರ್ಣಿತ ಕಡ್ಡಾಯ ಕರ್ಮವಾಗಿದೆ.",
      "11:114": "ಹಗಲಿನ ಎರಡು ತುದಿಗಳಲ್ಲಿ ಮತ್ತು ರಾತ್ರಿಯ ಕೆಲವು ಸಮಯಗಳಲ್ಲಿ ನಮಾಝನ್ನು ಸಂಸ್ಥಾಪಿಸಿರಿ. ನಿಶ್ಚಯವಾಗಿಯೂ ಸತ್ಕರ್ಮಗಳು ದುಷ್ಕರ್ಮಗಳನ್ನು ಅಳಿಸುತ್ತವೆ. ಇದು ಉಪದೇಶ ಸ್ವೀಕರಿಸುವವರಿಗೆ ಒಂದು ಉಪದೇಶವಾಗಿದೆ.",
      "29:45": "ನಿಮಗೆ ದೇವವಾಣಿಯ ಮೂಲಕ ನೀಡಲಾದ ಗ್ರಂಥವನ್ನು ಪಠಿಸಿರಿ ಮತ್ತು ನಮಾಝನ್ನು ಸಂಸ್ಥಾಪಿಸಿರಿ. ನಿಶ್ಚಯವಾಗಿಯೂ ನಮಾಝ್ ಅಶ್ಲೀಲ ಕೃತ್ಯಗಳಿಂದ ಮತ್ತು ದುಷ್ಕರ್ಮಗಳಿಂದ ತಡೆಯುತ್ತದೆ. ಅಲ್ಲಾಹನ ಸ್ಮರಣೆಯು ಅತಿಶ್ರೇಷ್ಠವಾಗಿದೆ. ನೀವು ಮಾಡುತ್ತಿರುವ ಕರ್ಮಗಳನ್ನು ಅಲ್ಲಾಹು ತಿಳಿಯುತ್ತಾನೆ.",
      "62:9": "ಓ ಸತ್ಯವಿಶ್ವಾಸಿಗಳೇ! ಶುಕ್ರವಾರ ನಮಾಝ್‍ಗಾಗಿ ಕರೆಯಲಾದರೆ (ಅಝಾನ್ ನೀಡಲಾದರೆ) ಅಲ್ಲಾಹನ ಸ್ಮರಣೆಯ ಕಡೆಗೆ ಧಾವಿಸಿರಿ ಮತ್ತು ವ್ಯಾಪಾರ-ವ್ಯವಹಾರಗಳನ್ನು ಬಿಟ್ಟುಬಿಡಿ. ಅದು ನಿಮಗೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ನೀವು ತಿಳಿದವರಾಗಿದ್ದರೆ."
    }
  },
  "mr": {
    "anahtar": "marathi_ansari",
    "surum": "1.0.0",
    "baslik": "Marathi Translation - Muhammad Shafee‘ Ansari",
    "ayetler": {
      "2:153": "हे ईमान राखणाऱ्यांनो! धीर-संयम आणि नमाजद्वारे मदत मागा. निःसंशय, अल्लाह धीर-संयम राखणाऱ्यांना साथ देतो.",
      "2:238": "नमाजांचे रक्षण करा, विशेषतः मधल्या नमाजची आणि अल्लाहकरिता नम्रतापूर्वक उभे राहात जा.",
      "4:103": "मग जेव्हा तुम्ही नमाज पढून घ्याल जेव्हा उठता बसता आणि पहुडलेल्या स्थितीत अल्लाहचे स्मरण करीत राहा आणि शांतीपूर्ण स्थिती असेल तर नमाज कायम करा. निःसंशय, नमाज ईमानधारकांवर निश्चित आणि निर्धारीत वेळेवर अदा करणे फर्ज (अनिवार्य) केले गेले आहे.",
      "11:114": "आणि दिवसाच्या दोन्ही किनाऱ्यांवर नमाज कायम राखा, आणि रात्रीच्या काही भागातही. निःसंशय सत्कर्मे वाईट गोष्टींना दूर करतात. हा उपदेश आहे, बोध प्राप्त करणाऱ्यांकरिता.",
      "62:9": "हे ईमान राखणाऱ्या लोकांनो! जुमअः (शुक्रवार) च्या दिवशी नमाजसाठी अजान दिली गेली असता तुम्ही अल्लाहच्या स्मरणाकडे त्वरित येत जा आणि खरेदी - विक्री सोडून द्या हे तुमच्यासाठी अधिक चांगले आहे, जर तुम्ही जाणत असाल."
    }
  },
  "as": {
    "anahtar": "assamese_rafeeq",
    "surum": "1.0.5",
    "baslik": "Assamese Translation - Rafiqul Islam Habibur-Rahman",
    "ayetler": {
      "2:153": "হে ঈমান্দাৰসকল! তোমালোকে ধৈৰ্য্য আৰু ছালাতৰ মাধ্যমত সহায় প্ৰাৰ্থনা কৰা। নিশ্চয় আল্লাহ ধৈৰ্য্যশীলসকলৰ লগত আছে।",
      "2:238": "তোমালোকে ছালাতৰ প্ৰতি যত্নৱান হোৱা, বিশেষকৈ মধ্যৱৰ্তী (আচৰ) ছালাতৰ প্ৰতি, আৰু আল্লাহৰ বাবে বিনিতভাৱে থিয় হোৱা।",
      "4:103": "এতেকে যেতিয়া তোমালোকে ছালাত সমাপ্ত কৰিবা তেতিয়া তোমালোকে থিয় হৈ, বহি আৰু শুই থকা অৱস্থাতো আল্লাহক স্মৰণ কৰিবা, তাৰ পিছত যেতিয়া তোমালোকে নিৰাপদ হ’বা তেতিয়া যথাযথভাৱে ছালাত কায়েম কৰিবা; নিশ্চয় নিৰ্ধাৰিত সময়ত ছালাত কায়েম কৰাটো মুমিনসকলৰ বাবে অৱশ্য কৰ্তব্য।",
      "11:114": "আৰু তুমি ছালাত কায়েম কৰা, দিনৰ দুয়ো প্ৰান্তভাগত আৰু ৰাতিৰ প্ৰথমাংশত। নিশ্চয় সৎকৰ্মই অসৎকৰ্মক দূৰ কৰে। উপদেশ গ্ৰহণকাৰীসকলৰ বাবে এইটো এটা উপদেশ।",
      "29:45": "তোমাৰ প্ৰতি যি কিতাব অহী কৰা হৈছে, তাৰ পৰা তুমি তিলাৱত কৰা আৰু ছালাত কায়েম কৰা। নিশ্চয় ছালাতে অশ্লীল আৰু অসৎকৰ্মৰ পৰা বিৰত ৰাখে। আল্লাহৰ স্মৰণেই হৈছে সৰ্বশ্ৰেষ্ঠ। তোমালোকে যি কৰা আল্লাহে সেয়া জানে।",
      "62:9": "হে ঈমান্দাৰসকল! জুমুআৰ দিনা যেতিয়া ছালাতৰ বাবে আহ্বান কৰা হয়, তেতিয়া তোমালোকে আল্লাহৰ স্মৰণৰ ফালে ধাৱিত হোৱা আৰু বেচা-কিনা বন্ধ কৰা। এইটোৱে তোমালোকৰ বাবে সৰ্বোত্তম, যদি তোমালোকে উপলব্ধি কৰা।"
    }
  },
  "ne": {
    "anahtar": "nepali_central",
    "surum": "1.0.3",
    "baslik": "Nepali Translation - Ahlul-Hadith Association",
    "ayetler": {
      "2:153": "हे आस्थावानहरू, धैर्य र नमाजसित मद्दतको आशा गर्नु । (निःसन्देह) अल्लाह धैर्यवानहरूको साथ दिन्छ ।",
      "2:238": "सबै नमाजहरूलार्इ र विशेष गरी बीचको नमाजलार्इ सुचारु रूपले नियमबद्ध तरिकाले सम्पन्न गर्दैगर र अल्लाहको अगाडि आदर साथ उभिने गर ।",
      "4:103": "तिमीले नमाज पढिसकेपछि उठ्दा, बस्दा र पल्टदा प्रत्येक अवस्थामा अल्लाहलाई याद गर्नेगर । फेरि जब संतुष्ट होऊ तब नमाज पढ्दै गर । निःसन्देह मोमिनहरूलाई निर्धारित समयमा नमाज पढ्नु अनिवार्य छ ।",
      "11:114": "दिनको दुवै भागमा (प्रातः र सन्ध्या) नमाज पढ्ने गर, र रातीको केही बेलामा पनि । निःसन्देह सत्कर्महरूले कुकर्महरूलाई खतम पारिदिन्छन् । यो तिनीहरूको निम्ति पाठ हो जो पाठ स्वीकार गर्नेवाला छन् ।",
      "29:45": "(हे मुहम्मद सल्लल्लाहो अलैहे वसल्लम) त्यस किताबलाई पढ्ने गर्नुस्, जुन तपाईंलाई ‘‘वह्य’’ द्वारा पठाइएको छ, र नमाज कायम गर्नुस् । निःसन्देह नमाजले अश्लीलता र नराम्रो कुराबाट रोक्दछ । र अवश्य अल्लाहको स्मरण गर्नु त अत्यन्त ठूलो कुरो हो । तिमी जे गर्दैछौ अल्लाह जान्दछ ।",
      "62:9": "हे मोमिन्हरू ! जब शुक्रबारको दिन जुम्आको नमाजको निम्ति अजान दिइन्छ, तब तिमी अल्लाहको स्मरणको निम्ति दगुरिहाल र किन्न वा बेच्न छाडिदेऊ । यो तिम्रो निम्ति राम्रो छ यदि तिमीले बुझ्छौ ।"
    }
  },
  "si": {
    "anahtar": "sinhalese_mahir",
    "surum": "1.0.6",
    "baslik": "Sinhalese Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "අහෝ විශ්වාස කළවුනි! නුඹලා ඉවසීම හා සලාතය තුළින් උදව් පතනු. නියත වශයෙන් ම අල්ලාහ් ඉවසිලිවන්තයින් සමඟ ය.",
      "2:238": "සලාතයන් හා මධ්‍යකාල සලාතය මත සුරක්ෂිතව රැඳී සිටිනු. තවද නුඹලා අල්ලාහ්ට යටහත් වූවන් ලෙස නැගී සිටිනු.",
      "4:103": "නුඹලා සලාතය ඉටු කළේ නම් පසුව නුඹලා සිට ගනිමින් ද, වාඩිවෙමින් ද, නුඹලාගේ ඇලපත් මත(ට ඇල) වෙමින් ද අල්ලාහ්ව මෙනෙහි කරනු. නුඹලා සැනසුනමට පත් වූයෙහු නම් දැන් නුඹලා සලාතය (පූර්ණ ව) ඉටු කරනු. සැබැවින් ම සලාතය දේව විශ්වාසවන්තයින් කෙරෙහි කාල නියමයක් වශයෙන් නියම කරනු ලැබූවකි.",
      "11:114": "තවද දහවල් දෙකෙළවරෙහි හා රාත්‍රියෙන් කොටසක නුඹලා සලාතය විධිමත්ව ඉටු කරනු. නියත වශයෙන් ම දැහැමි දෑ නපුරු දෑ පහ කර දමයි. එය මෙනෙහි කරන අයහට මෙනෙහි කිරීමකි.",
      "29:45": "ධර්ම ග්‍රන්ථයෙන් ඔබ වෙත දන්වනු ලැබූ දෑ පාරායනය කරනු. තවද සලාතය විධිමත්ව ඉටු කරනු. නියත වශයෙන් ම සලාතය අශික්ෂිත දැයින් හා පිළිකුල් සහගත දැයින් වළක්වනු ඇත. තවද අල්ලාහ්ව මෙනෙහි කිරීම අතිමහත් ය. තවද අල්ලාහ් නුඹලා සිදු කරන දෑ දනී.",
      "62:9": "අහෝ දේවත්වය විශ්වාස කළවුනි! ජුමුආ (සිකුරාදා) දින සලාතය සඳහා ඇරයුම් කරනු ලැබූ විට අල්ලාහ් මෙනෙහි කිරීම සඳහා යුහුසුලුව යනු. තවද ව්‍යාපාරය නුඹලා අත හැර දමනු. නුඹලා දැන සිටියෙහු නම් එය නුඹලාට යහපත් ය."
    }
  },
  "km": {
    "anahtar": "khmer_rwwad",
    "surum": "1.0.4",
    "baslik": "Khmer Translation - Rowwad Translation Center",
    "ayetler": {
      "2:153": "ឱបណ្តាអ្នកដែលមានជំនឿ! ចូរពួកអ្នកសុំជំនួយ(ពីអល់ឡោះ)ដោយការអត់ធ្មត់ និងការប្រតិបត្តិសឡាត។ ពិតប្រាកដណាស់ អល់ឡោះជាម្ចាស់ទ្រង់ស្ថិតនៅជាមួយបណ្តាអ្នកដែលអត់ធ្មត់។",
      "2:238": "ចូរពួកអ្នកថែរក្សាការសឡាត(ទាំងប្រាំពេល) ជាពិសេសសឡាតមួយដែលស្ថិតនៅកណ្តាលគេ(សឡាតអាសើរ)។ ហើយចូរពួកអ្នកឈរសឡាតចំពោះអល់ឡោះដោយការគោរពតាមប្រកបដោយភាពនឹងនរ។",
      "4:103": "ហើយនៅពេលដែលពួកអ្នក(ឱបណ្តាអ្នកមានជំនឿ)បំពេញកាតព្វកិច្ចសឡាតរួចរាល់ហើយនោះ ចូរពួកអ្នករំឭកទៅចំពោះអល់ឡោះទាំងពេលឈរ ពេលអង្គុយ និងនៅពេលដែលពួកអ្នកទម្រេតខ្លួន។ ហើយនៅពេលដែលពួកអ្នកមានភាពនឹងនរឡើងវិញហើយនោះ ចូរពួកអ្នកប្រតិបត្តិសឡាត(ឱ្យបានពេញលេញដូចធម្មតា)។ ពិតប្រាកដណាស់ការសឡាត គឺជាកាតព្វកិច្ចមួយដែលគេបានដាក់ទៅលើបណ្ដាអ្នកមានជំនឿដោយមានពេលវេលាកំណត់ច្បាស់លាស់។",
      "11:114": "ហើយចូរអ្នក(ឱអ្នកនាំសារមូហាំម៉ាត់)ប្រតិបត្តិសឡាតនៅចុងវេលាទាំងពីរនៃពេលថ្ងៃ (ពេលព្រលឹម និងពេលល្ងាច) និងពេលមួយនៃពេលយប់ផងដែរ។ ជាការពិតណាស់ អំពើល្អវានឹងលុបបំបាត់នូវអំពើអាក្រក់ទាំងឡាយ។ នោះគឺជាការរំឭកមួយសម្រាប់អ្នកដែលនឹករលឹកទាំងឡាយ។",
      "29:45": "ហើយចូរអ្នក(ឱអ្នកនាំសារមូហាំម៉ាត់)សូត្រនូវអ្វីដែលគេបានវ៉ាហ៊ីដល់អ្នកអំពីគម្ពីរ(គួរអាន) និងប្រតិបត្តសឡាតចុះ។ ជាការពិតណាស់ សឡាតអាចហាមឃាត់ពីទង្វើអសីលធម៌ និងអំពើអាក្រក់ទាំងឡាយ។ ហើយការរំឭកទៅចំពោះអល់ឡោះ គឺពិតជាធំធេងបំផុត។ ហើយអល់ឡោះដឹងបំផុតនូវអ្វីដែលពួកអ្នកប្រព្រឹត្ត។",
      "62:9": "ឱបណ្ដាអ្នកដែលមានជំនឿ! នៅពេលដែលគេ(អាហ្សាន)ប្រកាសហៅទៅកាន់ការប្រតិបត្តិសឡាតនៅថ្ងៃសុក្រ ចូរពួកអ្នករួសរាន់ទៅកាន់ការរំលឹកអល់ឡោះ(ស្តាប់ខុតហ្ពះ និងសឡាតជុមអាត់) ហើយចូរពួកអ្នកបោះបង់នូវការលក់ដូរ។ នោះគឺជាការប្រសើរបំផុតសម្រាប់ពួកអ្នក ប្រសិនបើពួកអ្នកបានដឹង។"
    }
  }
};
