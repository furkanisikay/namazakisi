/** Saat ayarları (Wear OS / Apple Watch iş bölümü) ve "Saat ve widget" sayfası. */
export const saat = {
  uyandirma: {
    telefonBaslik: 'Telefonda',
    telefonAciklama: 'Sabah alarmı ve teheccüd uyandırması telefonunuzda çalar.',
    saatBaslik: 'Saatte, sessizce',
    saatAciklama:
      'Yalnız bileğiniz titrer, yanınızda uyuyan uyanmaz. Saatte kapatmazsanız telefonunuz {dk} dakika sonra yedek olarak çalar. Saatinizde Namaz Akışı yoksa ya da güncel değilse telefonunuz her sabah {dk} dakika geç çalar.',
    saatAciklamaIos: "Yalnız bileğiniz titrer, yanınızda uyuyan uyanmaz. Saatte kapatmazsanız iPhone'unuz {dk} dakika sonra yedek olarak çalar.",
    ikisiBaslik: 'İkisinde birden',
    ikisiAciklama: 'Saat ve telefon aynı anda çalar; saatte kapatmanız telefonu da susturur.',
    ikisiAciklamaIos: "Saat ve iPhone aynı anda çalar; saatte kapatmanız iPhone'u da susturur.",
  },
  anons: {
    otomatikBaslik: 'Telefonda, uzaktaysa saatte',
    otomatikAciklama:
      'Telefonunuz yanınızdayken okumayı telefonunuz yapar, saatiniz bilerek konuşmaz (iki cihaz aynı cümleyi okumasın). Telefonunuz uzaktayken okumayı saatiniz yapar.',
    saatBaslik: 'Yalnız saatte',
    saatAciklama:
      'Sesli okumayı her zaman saatiniz yapar, telefonunuz konuşmaz. Saatiniz şarjdayken, telefonunuzla bağlantısı yokken ya da saatte Namaz Akışı yoksa okuma hiç duyulmaz; bunu istemiyorsanız ilk seçeneği kullanın.',
    telefonBaslik: 'Yalnız telefonda',
    telefonAciklama: 'Saatiniz hiç konuşmaz.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      "Apple Watch'unuzda Namaz Akışı yüklüyse iPhone'unuzla işleri bölüşür. Burada uyandırmanın nerede çalacağını seçersiniz.",
    giris:
      'Saatinizde Namaz Akışı yüklüyse telefonunuzla işleri bölüşür. Burada uyandırmanın ve sesli anonsun nerede duyulacağını seçersiniz.',
    uyandirmaBaslik: 'Uyandırma nerede çalsın?',
    uyandirmaNotu:
      'Uyandırma, "Vakit çıkmadan" hatırlatmasında sabah vaktine açtığınız gerçek alarm ve Nafile Namazlar\'da açtığınız teheccüd uyandırmasıdır.',
    uyandirmaNotuIos:
      "watchOS sessiz alarmı yalnız saat uygulaması açıkken kurabilir: saatinizde Namaz Akışı'nı günde bir kez açın, sıradaki uyandırma o an kurulur. Saat şarjdayken ya da uygulama açılmadıysa iPhone'unuzun yedeği çalar.",
    uyandirmaNotuAndroid: 'Saatiniz şarjdayken çalmaz; o zaman telefonunuz çalar.',
    muhafizAyarlari: '"Vakit çıkmadan" ayarlarını açın',
    nafileAyarlari: 'Nafile namaz ayarlarını açın',
    bilektenBaslik: 'Bilekten yapabilecekleriniz',
    bilektenIos: [
      'iPhone uzaktayken hatırlatmalar saatinizde çalar; ikisi birden çalmaz.',
      'Kıldığınız namazı bilekten işaretlersiniz; iPhone kaydı alır.',
      'Tesbihatı Digital Crown ile sayar, kıbleyi saatinizde bulursunuz.',
    ],
    anonsBaslik: 'Sesli okuma nerede yapılsın?',
    anonsNotu:
      'Yalnız sesli anonsu açık hatırlatmalar okunur. İki cihaz aynı cümleyi birlikte okumaz. Camideyken ya da Namaz modu açıkken saatiniz de konuşmaz. Saatinizde hoparlör, metin okuma motoru ya da Türkçe ses yoksa saat yalnız titreşir. Saatin sesini Namaz Akışı saat uygulamasındaki "Sesi deneyin" ile hemen deneyebilirsiniz.',
    bilekten: [
      'Namaz modunu saatteki düğmeyle açıp kapatabilirsiniz (vaktin sonuna, en fazla 30 dakika).',
      'Camideyken saatiniz durumu gösterir; "Burası cami değil" ve "Camide misiniz?" sorusunu bilekten cevaplarsınız.',
      'Saate sığmayan ekranları (Kaza Defteri, Camideyim, ayarlar) "Telefonda açın" ile telefonunuzda açarsınız.',
    ],
    namazModuNotu: 'Namaz modunu saatten açabilmek için önce telefonunuzda bir kez açmanız gerekir.',
    namazModuAyarlari: 'Namaz modu ayarlarını açın',
  },
  sayfa: {
    akilliSaat: 'Akıllı saat',
    appleWatchOzet: 'Uyandırma nerede çalsın',
    saatOzet: 'Uyandırma ve sesli okuma nerede',
    canliEtkinlikler: 'Canlı etkinlikler',
    canliSayaclar: 'Canlı sayaçlar',
    geriSayim: 'Geri sayım',
    gelismisErisim: 'Gelişmiş. Otomasyonlar ve Kıldım işaretleyen uygulamalar',
    gelismis: 'Gelişmiş',
    otomasyonlar: 'Otomasyonlar',
    otomasyonBaslik: 'Otomasyonlarla kullanın',
    otomasyonOzet: 'Samsung Rutinler, Tasker, MacroDroid',
    kildimBaslik: 'Kıldım işaretleyen uygulamalar',
    kildimOzet: 'İzin verdiğiniz uygulamalar',
  },
} as const;
