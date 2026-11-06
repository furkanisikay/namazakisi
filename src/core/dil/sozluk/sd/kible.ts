import type { Sozluk } from '../tr';

/** Pusula yön harfleri Sindhçe yön adlarının tamamı (اتر اوڀر ڏکڻ اولهه): ilk harfleri çakışır (ا). */
export const kible: Sozluk['kible'] = {
  baslik: 'قبلو',
  yon: {
    hizali: 'اوهان جو منهن قبلي ڏانهن آهي',
    arkada: 'قبلو اوهان جي پٺيان آهي، ڦري وڃو',
    sagda: 'قبلو اوهان جي ساڄي پاسي {derece}° تي آهي',
    solda: 'قبلو اوهان جي کاٻي پاسي {derece}° تي آهي',
  },
  harf: { kuzey: 'اتر', dogu: 'اوڀر', guney: 'ڏکڻ', bati: 'اولهه' },
  sekme: {
    pusula: 'قطب نما',
    pusulaErisim: 'قطب نما موڊ',
    pusulaAciklama: 'جڏهن ڪعبي جو نشان مٿي واري ڏنگي تائين پهچي، تڏهن اوهان جو منهن قبلي ڏانهن هوندو.',
    kamera: 'ڪئميرا',
    kameraErisim: 'ڪئميرا موڊ',
    kameraAciklama: 'فون کي سڌو بيٺل جهليو؛ ڪعبي جو نشان قبلي جي رخ ۾ ظاهر ٿيندو.',
  },
  sayfa: {
    baslatiliyor: 'قطب نما شروع ٿي رهيو آهي…',
    izinKapali: 'جڳهه جي اجازت بند آهي؛ رخ ڳولڻ لاءِ اوهان جي جڳهه گهرجي.',
  },
  hata: {
    izinGerekli: 'قبلي جو رخ ڳولڻ لاءِ جڳهه جي اجازت گهرجي.',
    konumServisi: 'جڳهه جون سروسون دستياب ناهن. ڊوائيس جون جڳهه واريون سيٽنگون جانچيو.',
    baslatilamadi: 'قبلي جي سروس شروع نه ٿي سگهي.',
  },
  pusula: {
    ufuk: 'افق',
    konumAliniyor: 'اوهان جي جڳهه معلوم ٿي رهي آهي…',
    hazirlaniyor: 'قطب نما تيار ٿي رهيو آهي…',
    kuzeydenAci: 'قبلو اتر کان {derece}° تي آهي',
    kabeUzakta: 'ڪعبو {mesafe} پري آهي',
    kuzeydenSaatYonu: 'اتر کان ڪلاڪ جي رخ ۾',
    kuzeyden: 'اتر کان {derece}°',
    kabeUzaktaKuzeyden: 'ڪعبو {mesafe} پري آهي، اتر کان {derece}° تي',
    pusulaErisim: 'قبلي جو قطب نما. {cumle}',
    pusulaYok: 'هن ڊوائيس ۾ قطب نما ناهي؛ رخ اتر جي لحاظ کان ڏيکاريو پيو وڃي.',
    kayiyorsa: 'جيڪڏهن رخ هٽي وڃي ته فون کي هوا ۾ 8 جي شڪل ۾ گهمايو.',
    kamerayla: 'ڪئميرا سان ڏسو',
  },
  kamera: {
    pusulayiKullanin: 'قطب نما استعمال ڪريو',
    kullanilamiyorBaslik: 'هن فون تي ڪئميرا وارو ڏيک دستياب ناهي',
    kullanilamiyorMetin:
      'سڌو بيٺل جهلڻ تي اوهان جي فون جا سينسر ڀروسي جوڳو رخ نٿا ڏين. قطب نما اڃا به رخ صحيح ڏيکاري ٿو.',
    izinBaslik: 'قبلو ڪئميرا سان ڏسو',
    izinMetin:
      'فون کي سڌو بيٺل جهليو ۽ چوڌاري ڏسو؛ ڪعبي جو نشان قبلي جي رخ ۾ ظاهر ٿيندو. ان لاءِ ڪئميرا جي اجازت گهرجي؛ تصوير رڪارڊ نه ٿيندي ۽ اوهان جي فون کان ٻاهر نه ويندي.',
    kamerayiAcin: 'ڪئميرا چالو ڪريو',
    izinKapaliBaslik: 'ڪئميرا جي اجازت بند آهي',
    izinKapaliMetin: 'ڪئميرا واري ڏيک لاءِ سيٽنگن ۾ ڪئميرا جي اجازت ڏئي سگهو ٿا. قطب نما ان کان سواءِ به ڪم ڪري ٿو.',
    ayarlariAcin: 'سيٽنگون کوليو',
    acilamadiBaslik: 'ڪئميرا کلي نه سگهي',
    acilamadiMetin: 'ڪئميرا هن وقت دستياب ناهي. قطب نما سان قبلو ڳولي سگهو ٿا.',
    hesaplaniyor: 'رخ ڳولهيو پيو وڃي…',
    dikTutun: 'فون کي سڌو بيٺل جهليو',
  },
  kalibrasyon: {
    tesekkurErisim: 'مهرباني، هاڻي رخ وڌيڪ درست آهي',
    tesekkur: 'مهرباني، هاڻي رخ وڌيڪ درست آهي ✓',
    baslik: 'قطب نما درست ڪريو',
    sallayin: 'فون کي هوا ۾ 8 جي شڪل ۾ گهمايو.',
    metal: 'ڌاتو جي شين ۽ مقناطيسي ڪورن کان پري ٿيو.',
    dogruluk: 'درستي',
    simdiDegil: 'هاڻي نه',
  },
};
