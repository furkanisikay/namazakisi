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
  }
};
