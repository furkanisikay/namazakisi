import { cogul } from '../../tipler';

/**
 * Alan sözlüğü: muhafizAyar — Namaz Muhafızı ve hatırlatma AYAR ekranları (kibar "siz").
 * Ekranda teknik terim yok ("kanal", "ton", "TTS" → "ses", "sertlik", "sesli okuma").
 */
export const muhafizAyar = {
  kapali: 'Kapalı',
  /** Gerçek alarm anahtarının altındaki bilgi satırları (`core/muhafiz/alarmNotlari`). */
  alarmNot: {
    iosAlarmsiz:
      'Gerçek alarm iOS {gerekli} ve üzerinde çalışır. Bu iPhone iOS {surum}; bu adım uzun sesli bir bildirimle gelir ve sessiz anahtarı açıkken duyulmaz.',
    iosNotr: 'Bu adım şu an bildirimle gelir.',
    izinliSes:
      "İlk hatırlatma iPhone'unuzun alarmı olarak, varsayılan alarm sesiyle çalar (bu adım için seçtiğiniz ses kullanılmaz); sessiz anahtarı ve Odak açıkken de duyulur.",
    izinliKildim: 'Alarm ekranında durdurabilir ya da "Kıldım" diyebilirsiniz; "Kıldım" kilit açıkken işaretler.',
    izinliOdak:
      'Uygulamanın Odak filtresiyle hatırlatmaları sessize aldıysanız alarm kurulmaz; filtreyi alarm kurulduktan sonra açtıysanız o alarm bir süre daha çalabilir.',
    belirsiz:
      "Gerçek alarm için iPhone'unuzun bir kez izin vermesi gerekiyor. İzin verilene kadar bu adım uzun sesli bir bildirimle gelir.",
    reddedildi:
      "Alarm izni kapalı; bu adım zamana duyarlı bir bildirim ve yaklaşık 30 saniyelik bir sesle gelir, sessiz anahtarı açıkken duyulmaz. Ayarlar'dan \"Alarmlar\" iznini açabilirsiniz.",
    tamAlarm: 'Tam saatinde alarm kurma izni ("Alarmlar ve hatırlatıcılar") kapalı; bu adım şimdilik normal bildirimle gelir.',
    tamEkran:
      'Kilit ekranında tam ekran açılması için izin gerekiyor. İzin verilmezse alarm ekranın üstünde bildirim olarak çalar.',
  },
  /** Adım/vakit özeti (`core/muhafiz/seviyeOzeti`, `vakitOzeti`) — ekran okuyucu cümlesi. */
  ozet: {
    kanal: { bildirim: 'bildirim', sesli: 'sesli okuma', titresim: 'titreşim', alarm: 'gerçek alarm' },
    esikGiris: 'girişten {dk} dk sonra',
    esikCikis: '{dk} dk kala',
    kanalSesli: '{kanal} ({ses})',
    listeSon: '{bas} ve {son}',
    kapali: 'Kapalı — uyarı almazsınız',
    tekrar: '{govde}; {dk} dakikada bir tekrarlanır',
    vakit: '{bas} başlar: {liste}',
  },
  /** Zaman şeridinin altındaki cümle (`core/muhafiz/zamanSeridi`). */
  serit: {
    bugun: 'Bugün',
    tumKapali: 'Tüm adımlar kapalı — bu vakitte hatırlatma almazsınız.',
    planYok: '{gun} bu vakitte hatırlatma planlanmıyor.',
    toplam: cogul({ one: 'toplam {n} uyarı', other: 'toplam {n} uyarı' }),
    girisTekrarli: 'Vakit girince başlar: ilk hatırlatma {ilk}, kılana kadar {sayi}.',
    girisSon: 'Vakit girince başlar: ilk hatırlatma {ilk}, sonuncusu {son} — {sayi}.',
    tek: '{gun} tek hatırlatma: {ilk}.',
    coklu: '{gun} ilk hatırlatma {ilk}, sonuncusu {son} — {sayi}.',
    sirada: '{cumle} Sıradaki: {saat}.',
    erisim: '{ad} bugün {bas} ile {bit} arasında. {cumle}',
  },
  /** Otomasyon rehberinin cihaza/ayara bağlı notları (`core/otomasyon/rehberNotlari`). */
  rehberNot: {
    genel: '"{vakit}" için Hatırlatmalar\'da "Vakit girince", "{cami}" için Namazda sessiz\'de "Camiye girince" açık olmalı.',
    vakitKapaliBas: 'Vakit bildirimleri kapalı olduğu için "{vakit}" tetiklenmez (Hatırlatmalar\'dan açabilirsiniz)',
    camiKapali: '"Camiye girince" kapalı olduğu için "{cami}" tetiklenmez',
    ayrac: '; ',
    cumle: '{cumle}.',
    oneUi:
      'Bazı One UI sürümlerinde aynı anda yalnız bir bildirimle tetiklenen rutinin çalıştığı bildiriliyor. Birden çok rutin kurduysanız tek rutinde birleştirmeyi deneyin.',
  },
  /** Sesli okuma rıza modalı (`MuhafizAyarlari/SesliOnayModal`). Örnek okunuş Türkçe kalır (TTS). */
  sesliOnay: {
    soyler: 'Yalnızca ayarladığınız adımlarda, kalan ya da geçen süreyi sesli olarak söyler.',
    iosSessiz: "iPhone'da bildirim sesi olarak çalar; sessiz anahtarı açıkken duyulmaz.",
    alarmGibi: 'Alarm gibi davranır: telefonunuz sessizde veya Rahatsız Etmeyin modundayken de duyulur.',
    bildirimDe: 'Bildirim de gönderilir; sesi duymazsanız ekranda izi kalır.',
    baslik: 'Sesli okuma açılsın mı?',
    altBaslik: '{duzey} düzey sesli okuma içerir',
    ornekOkunus: 'ÖRNEK OKUNUŞ',
    dinle: 'Sesli okumayı dinleyin',
    birKez: 'Bu izin bir kez sorulur, tüm hatırlatmalarda geçerlidir.',
    kapatmaNotu: 'Dilediğiniz zaman her hatırlatmanın ayarından kapatabilirsiniz.',
    sessizEtiketi: 'Sesli olmadan uygula',
    sessiz: 'Sesli olmadan',
    acin: 'Sesli okumayı açın',
  },
  /** Vakit çıkmadan (muhafız) ayrıntı sayfası (`screens/MuhafizAyarlariSayfasi`). */
  sayfa: {
    kendiAyariniz: 'Kendi ayarınız kullanılıyor',
    ayriAyarlayin: 'Her vakti ayrı ayarlayın',
    sigmiyor: 'Bu değişiklik sığmıyor',
    neKadar: 'Ne kadar hatırlatalım?',
    herVakit: 'Her vakit için',
    kendimEtiketi: 'Kendim ayarlayayım. {ozet}',
    kendim: 'Kendim ayarlayayım',
    kopyaBaslik: '{ad} ayarları kopyalansın mı?',
    kopyaMesaj:
      '{ad} vaktinin tüm hatırlatmaları diğer vakitlere kopyalanır. Sesli okuma metnine vakit adını elle yazdıysanız, diğer vakitlerde de o ad okunur.',
    tumuneUygula: 'Tümüne uygula',
    vazgec: 'Vazgeç',
  },
  /** Nafile namazlar ayar sayfası (`screens/NafileAyarlariSayfasi`). */
  nafile: {
    kisa: {
      kusluk: 'Güneş yükseldikten sonra, öğleden önce',
      evvabin: 'Akşam namazından sonra, yatsıya kadar',
      teheccud: 'Yatsıdan sonra, imsaka kadar',
    },
    pencereler: { sonUcteBir: 'Son üçte bir', yatsi: 'Yatsıdan' },
    onizlemeOzeti: cogul({ one: 'Bugün {ad} için {n} hatırlatma alırsınız', other: 'Bugün {ad} için {n} hatırlatma alırsınız' }),
    anahtarEtiketi: '{ad} hatırlatması',
    pencere: 'PENCERE',
    pencereEtiketi: 'Teheccüd penceresi: {etiket}',
    uyandirma: 'Uyandırma sesi',
    uyandirmaIos: 'Odak modunu deler. Telefonun sessiz anahtarı açıksa ses çıkmaz.',
    uyandirmaAndroid: 'Alarm sesiyle çalar, sessiz modu deler.',
    uyandirmaEtiketi: 'Teheccüd uyandırması',
    gosterge: 'Ana ekranda göster',
    gostergeAciklama: 'Günlük akışta, vakitlerin arasında',
    gostergeEtiketi: '{ad} ana ekranda gösterilsin',
    sesliAltBaslik: 'Nafile hatırlatmasında sesli okuma',
    kildim: "Bildirimdeki Kıldım'a dokunduğunuzda o günün kalan hatırlatmaları durur. Bu kayıt puana ve seriye karışmaz.",
    giris: 'Kuşluk, evvâbîn ve teheccüd vakitlerini ana ekranda görebilir, namaz hatırlatmasındaki gibi dilediğiniz sıklıkta hatırlatılabilirsiniz.',
    gunduz: 'GÜNDÜZ VE AKŞAM',
    gece: 'GECE',
  },
  /** Ramazan sayaçları (`screens/RamazanAyarlariSayfasi`). */
  ramazan: {
    iftar: 'İftar',
    iftarSayaci: 'İftar Sayacı',
    iftarAciklama: 'Sabahtan akşama iftara kalan süre görünür',
    iftarEtiketi: 'İftar sayacı',
    iftarKalkar: 'Akşam girdikten 10 dakika sonra kendiliğinden kalkar.',
    sahur: 'Sahur',
    sahurSayaci: 'Sahur Sayacı',
    sahurAciklama: 'Yatsıdan imsaka sahura kalan süre görünür',
    sahurEtiketi: 'Sahur sayacı',
    sahurKalkar: 'İmsak girdikten 10 dakika sonra kendiliğinden kalkar.',
    not: 'Sayaç hesaplamaya dayanır; orucunuzu ezanla açın. Esas olan Diyanet takvimidir.',
  },
  /**
   * Otomasyon rehberi (`screens/OtomasyonRehberiSayfasi`). `{kisayol}`, `{olay}`, `{kosul}`,
   * `{eylem}` native etiketlerdir (Android kaynakları, W5'e kadar Türkçe) — çevrilmez, aynen geçer.
   */
  otomasyon: {
    sekmeRutinler: 'Samsung Rutinler',
    sekmeEklenti: 'Tasker · MacroDroid',
    notlarBaslik: 'Bilmeniz gerekenler',
    adimEtiketi: '{n}. adım: {metin}',
    rutinTetikBaslik: 'Vakit girince bir şey yapın',
    rutinTetikAdimlar: [
      'Telefonunuzun Ayarlar > Modlar ve Rutinler > Rutinler bölümünü açın, yeni bir rutin ekleyin.',
      '"Eğer" kısmında "Bildirim alındığında" koşulunu seçin.',
      "Uygulama olarak Namaz Akışı'nı seçin, anahtar kelimeye aşağıdakilerden birini harfiyen yazın.",
      '"Ardından" kısmında istediğiniz eylemi ekleyin (ör. ses modunu titreşime alın).',
    ],
    dilNotu: 'Uygulama dilini değiştirirseniz anahtar kelime de değişir; rutini yeni kelimeyle yeniden kurun.',
    rutinKildimBaslik: 'Rutinden namazı işaretleyin',
    rutinKildimAdimlar: [
      'Rutinin "Ardından" kısmında Uygulamalar bölümünü açın ve bir uygulama eylemi ekleyin.',
      'Namaz Akışı\'nın "{kisayol}" kısayolunu seçin.',
      'Rutin ilk çalıştığında size sorulur. "Her zaman izin ver" derseniz bir daha sorulmaz.',
    ],
    rutinSessiz: 'Namaz Akışı bildirimlerini ya da ilgili bildirim kategorisini sessize alırsanız rutin tetiklenmez.',
    eklentiOlayBaslik: 'Vakit olaylarıyla başlatın',
    eklentiOlayAdimlar: [
      'Tasker\'da yeni bir profil ekleyin: Olay > Eklenti > "{olay}". MacroDroid ve Automate\'te "{kosul}" eklentisini seçin.',
      'Olayı seçin: vakit girdiğinde, vakit çıkıyor ({dk} dk kala) ya da camide olduğunuz algılandığında. İsterseniz tek bir vakti seçebilirsiniz.',
      'İlk eklediğinizde uygulamaya izin vermeniz istenir.',
    ],
    degiskenler: 'KULLANABİLECEĞİNİZ DEĞİŞKENLER',
    degiskenAciklamalari: {
      '%vakit': 'Vaktin adı (ör. Öğle)',
      '%vakitkodu': 'sabah, ogle, ikindi, aksam ya da yatsi',
      '%tarih': 'Namaz günü (YYYY-AA-GG)',
      '%kalandk': 'Vakit çıkıyor: kalan dakika',
      '%cami': 'Camidesiniz: caminin adı',
    },
    eklentiKildimBaslik: 'Namazı işaretleyin',
    eklentiKildimAdimlar: [
      'Göreve eylem ekleyin: Eklenti > "{eylem}".',
      'Eylem çalıştığında o anki vakit kılındı olarak işaretlenir. Vakit yoksa ya da zaten işaretliyse hiçbir şey değişmez.',
    ],
    eklentiNotlar: [
      '"Vakit girdi" olayı ekran kapalıyken birkaç dakika gecikebilir. Tam vaktinde çalışması gerekiyorsa bildirim tetikleyicisini ("{kelime}") kullanın.',
      '"Vakit çıkıyor" namaz muhafızı açıkken ve namaz henüz işaretlenmemişken çalışır.',
      'Bir uygulamayı aşağıdaki listeden engellerseniz ya da kaldırırsanız kurduğunuz eklentiler çalışmaz. Otomasyonu başka bir telefona taşıdığınızda eklentiyi bir kez yeniden düzenleyin.',
    ],
    yalnizAndroid: 'Bu rehber yalnız Android telefonlar içindir.',
    giris:
      "Vakit girince telefonunuzu sessize almak, camiye girince bir şeyi kapatmak ya da namazı tek dokunuşla işaretlemek için Namaz Akışı'nı otomasyon uygulamalarıyla kullanabilirsiniz.",
    guvenListesi: 'Kıldım işaretleyebilen uygulamalar',
    guvenIpucu: 'Otomasyon uygulamalarına verdiğiniz izinleri yönetin',
    guvenAciklama: 'İzin verdiğiniz uygulamaları yönetin',
  },
  /** Kancaların kısa bildirimleri ve bant metinleri (`presentation/hooks`). */
  kanca: {
    tamAlarmAcildi: 'Alarm artık tam saatinde kurulacak',
    iosAlarmAcildi: 'Gerçek alarm artık iPhone alarmı olarak çalacak',
    tamEkranAcildi: 'Alarm artık kilit ekranında tam ekran açılacak',
    ayarAcilamadi: 'Ayar ekranı açılamadı; telefonunuzun Ayarlar bölümünden açabilirsiniz.',
    sigmiyor: 'Bu hatırlatma sığmıyor',
    yerAcildi: cogul({ one: 'Yer açıldı, değişikliğiniz uygulandı · {n} bildirim', other: 'Yer açıldı, değişikliğiniz uygulandı · {n} bildirim' }),
    oneriUygulandi: cogul({ one: '{baslik} · {n} bildirim', other: '{baslik} · {n} bildirim' }),
    duzeyeGecildi: '{ad} düzeye geçildi',
    nowBarKapali: 'Kapalı',
    nowBarAcik: cogul({ one: '{n} öğe açık', other: '{n} öğe açık' }),
    sesDosyasi: {
      bicim: 'Bu dosya ses olarak açılamadı. MP3, M4A, OGG ya da WAV dosyası seçebilirsiniz.',
      boyut: 'Dosya çok büyük. En fazla 20 MB seçebilirsiniz.',
      sure: 'Kayıt çok uzun. En fazla 8 dakikalık bir ses seçebilirsiniz.',
      erisim: 'Dosyaya erişilemedi. Telefonunuzdaki bir dosyayı seçmeyi deneyin.',
      yazilamadi: 'Dosya eklenemedi. Başka bir dosya deneyin.',
      desteklenmiyor: 'Bu telefonda kendi dosyanızı ekleyemezsiniz; telefonun seslerinden seçebilirsiniz.',
    },
    onerilenUygulandi: 'Önerilen ayarlar uygulandı',
  },
  /** Hazır düzeylerin kısa açıklaması (`muhafizSlice` HATIRLATMA_PRESETLERI). */
  preset: { hafif: 'Tek hatırlatma', normal: 'Dengeli', yogun: 'Israrcı' },
  /** Ayar dilimlerinin kullanıcıya görünen hata metinleri (`presentation/store`). */
  hata: { yuklenemedi: 'Ayarlar yüklenemedi', guncellenemedi: 'Ayar güncellenemedi' },
} as const;
