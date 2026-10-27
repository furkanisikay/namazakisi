import Foundation

/**
 * APPLE WATCH ARAYUZ METINLERI (W5) — SAF (yalniz Foundation).
 *
 * Saat uygulamasi ve komplikasyon uzantisi (ikisi de `ortak/`'i derler) metni CIZIM aninda
 * buradan secer. Dil telefondan gelir: `SaatKoprusu` uygulama baglamina yukun KARDESI olarak
 * dil kodunu koyar (`SaatIletisi.dil`), `SaatBaglantisi` onu `SaatDeposu.diliYaz` ile saklar.
 * Eski telefon dil gondermezse Turkce (o telefonun plan metinleri de Turkcedir).
 *
 * Vakit adlari, "Kıldım", kabul duasi `VakitMetinleri`'ndedir (pod kopyasi); Kible ve sure
 * metinleri `Kible`/`SaatSure`'de dil parametresiyle. Ingilizce karsiliklar JS sozlugunden
 * (`src/core/dil/sozluk/en`), terimler `docs/ajan/coklu-dil.md` terim sozlugunden.
 * Arayuz kaydi: Turkcede kibar "siz", Ingilizcede notr ("please" yok).
 * Yer tutucular: `{ad}`, `{saat}`, `{dua}`, `{durum}`, `{derece}` — `VakitMetinleri.bicim`.
 */
public struct SaatMetinleri: Equatable {
    public let dil: String

    // Simdi sayfasi
    public let saatiGuncelleyin: String
    public let iphonedaBirKezAcin: String
    public let veriEski: String
    public let isaretle: String
    public let vazgec: String
    public let kilindiErisim: String
    public let cikisaKalan: String
    public let giriseKalan: String
    public let cikisSaat: String
    public let girisSaat: String
    public let siradakiErisim: String
    public let kildimErisim: String
    public let sessizUyandirma: String
    public let guncelleyin: String

    // Bugun sayfasi
    public let bugun: String
    public let noktaErisim: String
    public let kilindiKucuk: String
    public let kilinmadiKucuk: String
    public let durumSimdi: String
    public let durumGecti: String
    public let durumSirada: String

    // Kible
    public let kible: String
    public let kibleKonumYok: String
    public let pusulaHazirlaniyor: String
    public let sekizCizin: String
    public let kuzeyHarfi: String
    public let kuzeyeCevirin: String
    public let kuzeydenErisim: String

    // Tesbihat
    public let tesbihat: String
    public let saymaIpucu: String
    public let yenidenBaslayin: String
    public let sonSayimiGeriAlin: String
    /// Okunuslar (CEVIRI DEGIL): zikir adlari, tehlil ve kunye o dilin Musluman toplulugunun
    /// yaygin yazimiyla (sahip karari 2026-10-25). `Tesbihat.Faz.ad(dil:)`.
    public let zikirSubhanallah: String
    public let zikirElhamdulillah: String
    public let zikirAllahuEkber: String
    public let zikirTehlil: String
    public let tehlilMetni: String
    public let tesbihatKaynagi: String

    // Sessiz uyandirma
    public let teheccud: String
    public let imsakSaat: String
    public let vaktinSonu: String
    public let uyandirmayiKapatin: String

    // Komplikasyon
    public let komplikasyonAdi: String
    public let komplikasyonAciklama: String
    public let vaktiCikisErisim: String
    public let kilindiBaslik: String
    public let siradaki: String
    public let komplikasyonVeriEski: String
    public let vakitlerIphonedan: String

    public static let tr = SaatMetinleri(
        dil: "tr",
        saatiGuncelleyin: "Saatinizdeki Namaz Akışı'nı güncelleyin.",
        iphonedaBirKezAcin: "Vakitler iPhone'unuzdan gelir. iPhone'unuzda Namaz Akışı'nı bir kez açın.",
        veriEski: "Vakitleri güncellemek için iPhone'unuzda Namaz Akışı'nı açın.",
        isaretle: "İşaretle",
        vazgec: "Vazgeç",
        kilindiErisim: "{ad} kılındı. {dua}",
        cikisaKalan: "Çıkışa kalan süre",
        giriseKalan: "Girişe kalan süre",
        cikisSaat: "Çıkış {saat}",
        girisSaat: "Giriş {saat}",
        siradakiErisim: "Sıradaki {ad}, {saat}",
        kildimErisim: "{ad} namazını kıldım olarak işaretleyin",
        sessizUyandirma: "Sessiz uyandırma {saat}",
        guncelleyin: "Güncelleyin",
        bugun: "Bugün",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "kılındı",
        kilinmadiKucuk: "kılınmadı",
        durumSimdi: "Şimdi",
        durumGecti: "Geçti",
        durumSirada: "Sırada",
        kible: "Kıble",
        kibleKonumYok: "Kıble için konum gerekir. iPhone'unuzda Namaz Akışı'nı açıp konumunuzu ayarlayın; saat bir dakika içinde alır.",
        pusulaHazirlaniyor: "Pusula hazırlanıyor",
        sekizCizin: "Saatinizi sekiz çizerek çevirin",
        kuzeyHarfi: "K",
        kuzeyeCevirin: "Saatinizi kuzeye çevirin, oku izleyin",
        kuzeydenErisim: "Kıble kuzeyden saat yönünde {derece} derece",
        tesbihat: "Tesbihat",
        saymaIpucu: "Saymak için dokunun ya da Digital Crown'u çevirin; ters yöne çevirmek geri alır",
        yenidenBaslayin: "Yeniden başlayın",
        sonSayimiGeriAlin: "Son sayımı geri alın",
        zikirSubhanallah: "Sübhânallah",
        zikirElhamdulillah: "Elhamdülillâh",
        zikirAllahuEkber: "Allâhü ekber",
        zikirTehlil: "Lâ ilâhe illallâh",
        tehlilMetni: "Lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehü'l-mülkü ve lehü'l-hamdü ve hüve alâ külli şey'in kadîr",
        tesbihatKaynagi: "Müslim, Mesâcid 146",
        teheccud: "Teheccüd",
        imsakSaat: "İmsak {saat}",
        vaktinSonu: "Vaktin sonu {saat}",
        uyandirmayiKapatin: "Uyandırmayı kapatın",
        komplikasyonAdi: "Namaz vakti",
        komplikasyonAciklama: "İçinde bulunulan vakit ve çıkışına kalan süre.",
        vaktiCikisErisim: "{ad} vakti, çıkış {saat}",
        kilindiBaslik: "{ad} kılındı",
        siradaki: "Sıradaki",
        komplikasyonVeriEski: "Vakitleri güncellemek için iPhone'da uygulamayı açın",
        vakitlerIphonedan: "Vakitler iPhone'unuzdan gelir"
    )

    public static let en = SaatMetinleri(
        dil: "en",
        saatiGuncelleyin: "Update Namaz Akışı on your watch.",
        iphonedaBirKezAcin: "Prayer times come from your iPhone. Open Namaz Akışı on your iPhone once.",
        veriEski: "Open Namaz Akışı on your iPhone to update prayer times.",
        isaretle: "Mark",
        vazgec: "Cancel",
        kilindiErisim: "{ad} prayed. {dua}",
        cikisaKalan: "Time left until it ends",
        giriseKalan: "Time left until it begins",
        cikisSaat: "Ends {saat}",
        girisSaat: "Begins {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        kildimErisim: "Mark {ad} as prayed",
        sessizUyandirma: "Silent wake-up {saat}",
        guncelleyin: "Update",
        bugun: "Today",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "prayed",
        kilinmadiKucuk: "not prayed",
        durumSimdi: "Now",
        durumGecti: "Passed",
        durumSirada: "Upcoming",
        kible: "Qibla",
        kibleKonumYok: "The Qibla needs your location. Open Namaz Akışı on your iPhone and set your location; the watch gets it within a minute.",
        pusulaHazirlaniyor: "Preparing the compass…",
        sekizCizin: "Move your watch in a figure 8",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Turn your watch to north and follow the arrow",
        kuzeydenErisim: "The Qibla is {derece} degrees clockwise from north",
        tesbihat: "Tasbih",
        saymaIpucu: "Tap or turn the Digital Crown to count; turn it the other way to undo",
        yenidenBaslayin: "Start again",
        sonSayimiGeriAlin: "Undo the last count",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir",
        tesbihatKaynagi: "Muslim, Masajid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Prayer time ends {saat}",
        uyandirmayiKapatin: "Dismiss the wake-up",
        komplikasyonAdi: "Prayer time",
        komplikasyonAciklama: "The current prayer time and the time left until it ends.",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        komplikasyonVeriEski: "Open the app on your iPhone to update prayer times",
        vakitlerIphonedan: "Prayer times come from your iPhone"
    )


    // id — Endonezce (beta); terimler JS `sozluk/id` (kible, nafile, vakit)
    public static let id = SaatMetinleri(
        dil: "id",
        saatiGuncelleyin: "Perbarui Namaz Akışı di jam tangan Anda.",
        iphonedaBirKezAcin: "Waktu salat berasal dari iPhone Anda. Buka Namaz Akışı di iPhone Anda sekali.",
        veriEski: "Buka Namaz Akışı di iPhone Anda untuk memperbarui waktu salat.",
        isaretle: "Tandai",
        vazgec: "Batal",
        kilindiErisim: "{ad} ditunaikan. {dua}",
        cikisaKalan: "Sisa waktu hingga berakhir",
        giriseKalan: "Sisa waktu hingga masuk",
        cikisSaat: "Berakhir {saat}",
        girisSaat: "Masuk {saat}",
        siradakiErisim: "Berikutnya {ad}, {saat}",
        kildimErisim: "Tandai salat {ad} sudah ditunaikan",
        sessizUyandirma: "Pembangun senyap {saat}",
        guncelleyin: "Perbarui",
        bugun: "Hari ini",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "ditunaikan",
        kilinmadiKucuk: "belum ditunaikan",
        durumSimdi: "Sekarang",
        durumGecti: "Lewat",
        durumSirada: "Berikutnya",
        kible: "Kiblat",
        kibleKonumYok: "Kiblat memerlukan lokasi Anda. Buka Namaz Akışı di iPhone Anda dan atur lokasi Anda; jam tangan menerimanya dalam satu menit.",
        pusulaHazirlaniyor: "Menyiapkan kompas…",
        sekizCizin: "Gerakkan jam tangan Anda membentuk angka 8",
        kuzeyHarfi: "U",
        kuzeyeCevirin: "Arahkan jam tangan Anda ke utara dan ikuti panah",
        kuzeydenErisim: "Kiblat {derece} derajat searah jarum jam dari utara",
        tesbihat: "Tasbih",
        saymaIpucu: "Ketuk atau putar Digital Crown untuk menghitung; putar ke arah sebaliknya untuk membatalkan",
        yenidenBaslayin: "Mulai lagi",
        sonSayimiGeriAlin: "Batalkan hitungan terakhir",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la syarika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli syai'in qadir",
        tesbihatKaynagi: "HR. Muslim, Masajid 146",
        teheccud: "Tahajud",
        imsakSaat: "Subuh {saat}",
        vaktinSonu: "Waktu salat berakhir {saat}",
        uyandirmayiKapatin: "Matikan pembangun",
        komplikasyonAdi: "Waktu salat",
        komplikasyonAciklama: "Waktu salat saat ini dan sisa waktu hingga berakhir.",
        vaktiCikisErisim: "Waktu {ad}, berakhir {saat}",
        kilindiBaslik: "{ad} ditunaikan",
        siradaki: "Berikutnya",
        komplikasyonVeriEski: "Buka aplikasi di iPhone untuk memperbarui waktu salat",
        vakitlerIphonedan: "Waktu salat berasal dari iPhone Anda"
    )


    // de — Almanca (beta): JS `sozluk/de` (hitap "Sie", "bitte" yok)
    public static let de = SaatMetinleri(
        dil: "de",
        saatiGuncelleyin: "Aktualisieren Sie Namaz Akışı auf Ihrer Uhr.",
        iphonedaBirKezAcin: "Die Gebetszeiten kommen von Ihrem iPhone. Öffnen Sie Namaz Akışı einmal auf Ihrem iPhone.",
        veriEski: "Öffnen Sie Namaz Akışı auf Ihrem iPhone, um die Gebetszeiten zu aktualisieren.",
        isaretle: "Markieren",
        vazgec: "Abbrechen",
        kilindiErisim: "{ad} gebetet. {dua}",
        cikisaKalan: "Verbleibende Zeit bis zum Ende",
        giriseKalan: "Verbleibende Zeit bis zum Beginn",
        cikisSaat: "Endet {saat}",
        girisSaat: "Beginnt {saat}",
        siradakiErisim: "Als Nächstes {ad}, {saat}",
        kildimErisim: "{ad} als gebetet markieren",
        sessizUyandirma: "Lautloses Wecken {saat}",
        guncelleyin: "Aktualisieren",
        bugun: "Heute",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "gebetet",
        kilinmadiKucuk: "nicht gebetet",
        durumSimdi: "Jetzt",
        durumGecti: "Vorbei",
        durumSirada: "Als Nächstes",
        kible: "Qibla",
        kibleKonumYok: "Für die Qibla wird Ihr Standort benötigt. Öffnen Sie Namaz Akışı auf Ihrem iPhone und legen Sie Ihren Standort fest; die Uhr erhält ihn innerhalb einer Minute.",
        pusulaHazirlaniyor: "Kompass wird vorbereitet…",
        sekizCizin: "Bewegen Sie Ihre Uhr in Form einer Acht",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Drehen Sie Ihre Uhr nach Norden und folgen Sie dem Pfeil",
        kuzeydenErisim: "Die Qibla liegt {derece} Grad im Uhrzeigersinn von Norden",
        tesbihat: "Tasbih",
        saymaIpucu: "Zum Zählen tippen oder die Digital Crown drehen; in die andere Richtung drehen macht es rückgängig",
        yenidenBaslayin: "Erneut beginnen",
        sonSayimiGeriAlin: "Letzte Zählung rückgängig machen",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir",
        tesbihatKaynagi: "Muslim, Masadschid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Gebetszeit endet {saat}",
        uyandirmayiKapatin: "Wecken beenden",
        komplikasyonAdi: "Gebetszeit",
        komplikasyonAciklama: "Die aktuelle Gebetszeit und die verbleibende Zeit bis zu ihrem Ende.",
        vaktiCikisErisim: "{ad}-Zeit, endet {saat}",
        kilindiBaslik: "{ad} gebetet",
        siradaki: "Als Nächstes",
        komplikasyonVeriEski: "Öffnen Sie die App auf Ihrem iPhone, um die Gebetszeiten zu aktualisieren",
        vakitlerIphonedan: "Die Gebetszeiten kommen von Ihrem iPhone"
    )


    // fr
    public static let fr = SaatMetinleri(
        dil: "fr",
        saatiGuncelleyin: "Mettez à jour Namaz Akışı sur votre montre.",
        iphonedaBirKezAcin: "Les heures de prière viennent de votre iPhone. Ouvrez une fois Namaz Akışı sur votre iPhone.",
        veriEski: "Ouvrez Namaz Akışı sur votre iPhone pour mettre à jour les heures de prière.",
        isaretle: "Marquer",
        vazgec: "Annuler",
        kilindiErisim: "{ad} accompli. {dua}",
        cikisaKalan: "Temps restant avant la fin",
        giriseKalan: "Temps restant avant le début",
        cikisSaat: "Fin {saat}",
        girisSaat: "Début {saat}",
        siradakiErisim: "Prochaine : {ad}, {saat}",
        kildimErisim: "Marquer {ad} comme accompli",
        sessizUyandirma: "Réveil silencieux {saat}",
        guncelleyin: "Mettre à jour",
        bugun: "Aujourd’hui",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "accomplie",
        kilinmadiKucuk: "non accomplie",
        durumSimdi: "Maintenant",
        durumGecti: "Passée",
        durumSirada: "À venir",
        kible: "Qibla",
        kibleKonumYok: "La Qibla nécessite votre position. Ouvrez Namaz Akışı sur votre iPhone et définissez votre position ; la montre la reçoit en une minute.",
        pusulaHazirlaniyor: "Préparation de la boussole…",
        sekizCizin: "Déplacez votre montre en dessinant un 8",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Tournez votre montre vers le nord et suivez la flèche",
        kuzeydenErisim: "La Qibla est à {derece} degrés du nord, dans le sens horaire",
        tesbihat: "Tasbih",
        saymaIpucu: "Touchez ou tournez la Digital Crown pour compter ; tournez-la dans l’autre sens pour annuler",
        yenidenBaslayin: "Recommencer",
        sonSayimiGeriAlin: "Annuler le dernier compte",
        zikirSubhanallah: "Soubhanallah",
        zikirElhamdulillah: "Alhamdoulillah",
        zikirAllahuEkber: "Allahou akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahou wahdahou la charika lah, lahoul-moulkou wa lahoul-hamdou wa houwa 'ala koulli chay'in qadir",
        tesbihatKaynagi: "Mouslim, Masajid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Fin de l’heure de prière {saat}",
        uyandirmayiKapatin: "Arrêter le réveil",
        komplikasyonAdi: "Heure de prière",
        komplikasyonAciklama: "La prière en cours et le temps restant avant la fin de son heure.",
        vaktiCikisErisim: "{ad}, fin à {saat}",
        kilindiBaslik: "{ad} accompli",
        siradaki: "Prochaine",
        komplikasyonVeriEski: "Ouvrez l’application sur votre iPhone pour mettre à jour les heures de prière",
        vakitlerIphonedan: "Les heures de prière viennent de votre iPhone"
    )


    // bs
    public static let bs = SaatMetinleri(
        dil: "bs",
        saatiGuncelleyin: "Ažurirajte Namaz Akışı na satu.",
        iphonedaBirKezAcin: "Vremena dolaze s Vašeg iPhonea. Jednom otvorite Namaz Akışı na iPhoneu.",
        veriEski: "Otvorite Namaz Akışı na iPhoneu da ažurirate vremena.",
        isaretle: "Označite",
        vazgec: "Odustanite",
        kilindiErisim: "{ad}: klanjano. {dua}",
        cikisaKalan: "Preostalo vrijeme do isteka vakta",
        giriseKalan: "Preostalo vrijeme do vakta",
        cikisSaat: "Ističe {saat}",
        girisSaat: "Nastupa {saat}",
        siradakiErisim: "Sljedeći: {ad}, {saat}",
        kildimErisim: "Označite namaz ({ad}) kao klanjan",
        sessizUyandirma: "Nečujno buđenje {saat}",
        guncelleyin: "Ažurirajte",
        bugun: "Danas",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "klanjano",
        kilinmadiKucuk: "nije klanjano",
        durumSimdi: "Sada",
        durumGecti: "Prošlo",
        durumSirada: "Uskoro",
        kible: "Kibla",
        kibleKonumYok: "Za kiblu je potrebna lokacija. Otvorite Namaz Akışı na iPhoneu i podesite svoju lokaciju; sat je dobija u roku od minute.",
        pusulaHazirlaniyor: "Priprema kompasa…",
        sekizCizin: "Pomjerajte sat kao da crtate osmicu",
        kuzeyHarfi: "S",
        kuzeyeCevirin: "Okrenite sat prema sjeveru i pratite strelicu",
        kuzeydenErisim: "Kibla je {derece}° od sjevera u smjeru kazaljke na satu",
        tesbihat: "Tesbih",
        saymaIpucu: "Za brojanje dodirnite ili okrenite Digital Crown; okretanje u suprotnom smjeru poništava",
        yenidenBaslayin: "Počnite ponovo",
        sonSayimiGeriAlin: "Poništite posljednje brojanje",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Elhamdulillah",
        zikirAllahuEkber: "Allahu ekber",
        zikirTehlil: "La ilahe illallah",
        tehlilMetni: "La ilahe illallahu vahdehu la šerike leh, lehul-mulku ve lehul-hamdu ve huve ala kulli šej'in kadir",
        tesbihatKaynagi: "Muslim, Mesadžid 146",
        teheccud: "Tehedžud",
        imsakSaat: "Zora {saat}",
        vaktinSonu: "Kraj vakta {saat}",
        uyandirmayiKapatin: "Ugasite buđenje",
        komplikasyonAdi: "Namasko vrijeme",
        komplikasyonAciklama: "Trenutni vakat i preostalo vrijeme do njegovog isteka.",
        vaktiCikisErisim: "{ad}, ističe u {saat}",
        kilindiBaslik: "{ad}: klanjano",
        siradaki: "Sljedeći",
        komplikasyonVeriEski: "Otvorite aplikaciju na iPhoneu da ažurirate vremena",
        vakitlerIphonedan: "Vremena dolaze s Vašeg iPhonea"
    )


    // ru
    public static let ru = SaatMetinleri(
        dil: "ru",
        saatiGuncelleyin: "Обновите Namaz Akışı на часах.",
        iphonedaBirKezAcin: "Время намазов приходит с iPhone. Один раз откройте Namaz Akışı на iPhone.",
        veriEski: "Откройте Namaz Akışı на iPhone, чтобы обновить время намазов.",
        isaretle: "Отметить",
        vazgec: "Отмена",
        kilindiErisim: "Намаз {ad} совершён. {dua}",
        cikisaKalan: "Осталось до конца времени",
        giriseKalan: "Осталось до начала времени",
        cikisSaat: "Конец {saat}",
        girisSaat: "Начало {saat}",
        siradakiErisim: "Следующий намаз — {ad}, {saat}",
        kildimErisim: "Отметить намаз {ad} как совершённый",
        sessizUyandirma: "Беззвучное пробуждение {saat}",
        guncelleyin: "Обновить",
        bugun: "Сегодня",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "совершён",
        kilinmadiKucuk: "не совершён",
        durumSimdi: "Сейчас",
        durumGecti: "Время вышло",
        durumSirada: "Предстоит",
        kible: "Кибла",
        kibleKonumYok: "Для киблы нужно ваше местоположение. Откройте Namaz Akışı на iPhone и укажите местоположение; часы получат его в течение минуты.",
        pusulaHazirlaniyor: "Подготовка компаса…",
        sekizCizin: "Поводите часами, рисуя восьмёрку",
        kuzeyHarfi: "С",
        kuzeyeCevirin: "Поверните часы на север и следуйте за стрелкой",
        kuzeydenErisim: "Кибла: {derece}° от севера по часовой стрелке",
        tesbihat: "Тасбих",
        saymaIpucu: "Нажмите или поверните Digital Crown, чтобы считать; поворот в обратную сторону отменяет",
        yenidenBaslayin: "Начать заново",
        sonSayimiGeriAlin: "Отменить последний счёт",
        zikirSubhanallah: "Субханаллах",
        zikirElhamdulillah: "Альхамдулиллях",
        zikirAllahuEkber: "Аллаху акбар",
        zikirTehlil: "Ля иляха илляллах",
        tehlilMetni: "Ля иляха илляллаху вахдаху ля шарика лях, ляхуль-мульку ва ляхуль-хамду ва хуа 'аля кулли шай'ин кадир",
        tesbihatKaynagi: "Муслим, Масаджид 146",
        teheccud: "Тахаджуд",
        imsakSaat: "Фаджр {saat}",
        vaktinSonu: "Конец времени {saat}",
        uyandirmayiKapatin: "Выключить пробуждение",
        komplikasyonAdi: "Время намаза",
        komplikasyonAciklama: "Текущий намаз и сколько осталось до конца его времени.",
        vaktiCikisErisim: "Время намаза {ad}, конец в {saat}",
        kilindiBaslik: "{ad} совершён",
        siradaki: "Следующий",
        komplikasyonVeriEski: "Откройте приложение на iPhone, чтобы обновить время намазов",
        vakitlerIphonedan: "Время намазов приходит с iPhone"
    )


    // ms
    public static let ms = SaatMetinleri(
        dil: "ms",
        saatiGuncelleyin: "Kemas kini Namaz Akışı di jam tangan anda.",
        iphonedaBirKezAcin: "Waktu solat datang dari iPhone anda. Buka Namaz Akışı di iPhone anda sekali.",
        veriEski: "Buka Namaz Akışı di iPhone anda untuk mengemas kini waktu solat.",
        isaretle: "Tandakan",
        vazgec: "Batal",
        kilindiErisim: "{ad} ditunaikan. {dua}",
        cikisaKalan: "Baki masa sehingga waktu tamat",
        giriseKalan: "Baki masa sehingga masuk waktu",
        cikisSaat: "Tamat {saat}",
        girisSaat: "Masuk {saat}",
        siradakiErisim: "Seterusnya {ad}, {saat}",
        kildimErisim: "Tandakan solat {ad} sebagai ditunaikan",
        sessizUyandirma: "Kejutan senyap {saat}",
        guncelleyin: "Kemas kini",
        bugun: "Hari ini",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "ditunaikan",
        kilinmadiKucuk: "belum ditunaikan",
        durumSimdi: "Sekarang",
        durumGecti: "Berlalu",
        durumSirada: "Akan datang",
        kible: "Kiblat",
        kibleKonumYok: "Kiblat memerlukan lokasi anda. Buka Namaz Akışı di iPhone anda dan tetapkan lokasi anda; jam tangan menerimanya dalam masa seminit.",
        pusulaHazirlaniyor: "Menyediakan kompas…",
        sekizCizin: "Gerakkan jam tangan anda seperti melukis angka 8",
        kuzeyHarfi: "U",
        kuzeyeCevirin: "Halakan jam tangan anda ke utara dan ikut anak panah",
        kuzeydenErisim: "Kiblat {derece} darjah ikut arah jam dari utara",
        tesbihat: "Tasbih",
        saymaIpucu: "Ketik atau putar Digital Crown untuk mengira; putar ke arah bertentangan untuk membatalkan",
        yenidenBaslayin: "Mula semula",
        sonSayimiGeriAlin: "Batalkan kiraan terakhir",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahuakbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la syarika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli syai'in qadir",
        tesbihatKaynagi: "Riwayat Muslim, Masajid 146",
        teheccud: "Tahajud",
        imsakSaat: "Subuh {saat}",
        vaktinSonu: "Waktu solat tamat {saat}",
        uyandirmayiKapatin: "Matikan kejutan",
        komplikasyonAdi: "Waktu solat",
        komplikasyonAciklama: "Waktu solat semasa dan baki masa sehingga ia tamat.",
        vaktiCikisErisim: "Waktu {ad}, tamat {saat}",
        kilindiBaslik: "{ad} ditunaikan",
        siradaki: "Seterusnya",
        komplikasyonVeriEski: "Buka aplikasi di iPhone anda untuk mengemas kini waktu solat",
        vakitlerIphonedan: "Waktu solat datang dari iPhone anda"
    )


    // ar — Arapça (beta): JS `sozluk/ar` (kible, saat, nafile, vakit); yönetim metni mastar/isim kalıbı
    public static let ar = SaatMetinleri(
        dil: "ar",
        saatiGuncelleyin: "يلزم تحديث Namaz Akışı على ساعتك.",
        iphonedaBirKezAcin: "تصل المواقيت من iPhone. يكفي فتح Namaz Akışı على iPhone مرة واحدة.",
        veriEski: "لتحديث المواقيت: فتح Namaz Akışı على iPhone.",
        isaretle: "وضع العلامة",
        vazgec: "إلغاء",
        kilindiErisim: "صلاة {ad} تمّت. {dua}",
        cikisaKalan: "المتبقي على خروج الوقت",
        giriseKalan: "المتبقي على دخول الوقت",
        cikisSaat: "النهاية {saat}",
        girisSaat: "الدخول {saat}",
        siradakiErisim: "التالية {ad}، {saat}",
        kildimErisim: "وضع علامة «تمّت» على صلاة {ad}",
        sessizUyandirma: "إيقاظ صامت {saat}",
        guncelleyin: "تحديث",
        bugun: "اليوم",
        noktaErisim: "{ad}، {saat}، {durum}",
        kilindiKucuk: "تمّت",
        kilinmadiKucuk: "لم تُؤدَّ",
        durumSimdi: "الآن",
        durumGecti: "مضت",
        durumSirada: "التالية",
        kible: "القبلة",
        kibleKonumYok: "تحديد القبلة يتطلب موقعك. يكفي فتح Namaz Akışı على iPhone وضبط موقعك؛ وتتلقاه الساعة خلال دقيقة.",
        pusulaHazirlaniyor: "جارٍ تجهيز البوصلة…",
        sekizCizin: "تحريك الساعة على شكل الرقم 8",
        kuzeyHarfi: "ش",
        kuzeyeCevirin: "توجيه الساعة نحو الشمال واتّباع السهم",
        kuzeydenErisim: "القبلة {derece} درجة من الشمال باتجاه عقارب الساعة",
        tesbihat: "التسبيح",
        saymaIpucu: "للعدّ: النقر أو تدوير Digital Crown؛ والتدوير في الاتجاه المعاكس يتراجع",
        yenidenBaslayin: "البدء من جديد",
        sonSayimiGeriAlin: "التراجع عن العدّة الأخيرة",
        zikirSubhanallah: "سبحان الله",
        zikirElhamdulillah: "الحمد لله",
        zikirAllahuEkber: "الله أكبر",
        zikirTehlil: "لا إله إلا الله",
        tehlilMetni: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
        tesbihatKaynagi: "صحيح مسلم، المساجد 146",
        teheccud: "التهجد",
        imsakSaat: "الفجر {saat}",
        vaktinSonu: "نهاية الوقت {saat}",
        uyandirmayiKapatin: "إيقاف الإيقاظ",
        komplikasyonAdi: "وقت الصلاة",
        komplikasyonAciklama: "وقت الصلاة الحالي والمتبقي على خروجه.",
        vaktiCikisErisim: "وقت {ad}، النهاية {saat}",
        kilindiBaslik: "{ad} · تمّت",
        siradaki: "التالية",
        komplikasyonVeriEski: "لتحديث المواقيت: فتح التطبيق على iPhone",
        vakitlerIphonedan: "تصل المواقيت من iPhone"
    )


    // ur
    public static let ur = SaatMetinleri(
        dil: "ur",
        saatiGuncelleyin: "اپنی گھڑی پر Namaz Akışı اپ ڈیٹ کریں۔",
        iphonedaBirKezAcin: "نماز کے اوقات آپ کے iPhone سے آتے ہیں۔ اپنے iPhone پر Namaz Akışı ایک بار کھولیں۔",
        veriEski: "نماز کے اوقات اپ ڈیٹ کرنے کے لیے اپنے iPhone پر Namaz Akışı کھولیں۔",
        isaretle: "نشان لگائیں",
        vazgec: "منسوخ کریں",
        kilindiErisim: "{ad} ادا شدہ۔ {dua}",
        cikisaKalan: "ختم ہونے میں باقی وقت",
        giriseKalan: "شروع ہونے میں باقی وقت",
        cikisSaat: "اختتام {saat}",
        girisSaat: "آغاز {saat}",
        siradakiErisim: "اگلی نماز {ad}، {saat}",
        kildimErisim: "{ad} پر ادا شدہ کا نشان لگائیں",
        sessizUyandirma: "خاموش جگانا {saat}",
        guncelleyin: "اپ ڈیٹ کریں",
        bugun: "آج",
        noktaErisim: "{ad}، {saat}، {durum}",
        kilindiKucuk: "ادا شدہ",
        kilinmadiKucuk: "ادا نہیں ہوئی",
        durumSimdi: "ابھی",
        durumGecti: "گزر گئی",
        durumSirada: "اگلی",
        kible: "قبلہ",
        kibleKonumYok: "قبلہ کے لیے آپ کا مقام درکار ہے۔ اپنے iPhone پر Namaz Akışı کھول کر اپنا مقام منتخب کریں؛ گھڑی اسے ایک منٹ کے اندر لے لیتی ہے۔",
        pusulaHazirlaniyor: "قطب نما تیار ہو رہا ہے…",
        sekizCizin: "گھڑی کو ہوا میں 8 کی شکل میں گھمائیں",
        kuzeyHarfi: "ش",
        kuzeyeCevirin: "گھڑی کا رخ شمال کی طرف کریں اور تیر کی پیروی کریں",
        kuzeydenErisim: "قبلہ شمال سے گھڑی کی سمت میں {derece} درجے پر ہے",
        tesbihat: "تسبیح",
        saymaIpucu: "گننے کے لیے تھپتھپائیں یا Digital Crown گھمائیں؛ الٹی سمت گھمانے سے آخری گنتی واپس ہو جاتی ہے",
        yenidenBaslayin: "دوبارہ شروع کریں",
        sonSayimiGeriAlin: "آخری گنتی واپس لیں",
        zikirSubhanallah: "سبحان اللہ",
        zikirElhamdulillah: "الحمد للہ",
        zikirAllahuEkber: "اللہ اکبر",
        zikirTehlil: "لا الہ الا اللہ",
        tehlilMetni: "لا الہ الا اللہ وحدہ لا شریک لہ، لہ الملک ولہ الحمد وہو علیٰ کل شیء قدیر",
        tesbihatKaynagi: "صحیح مسلم، کتاب المساجد 146",
        teheccud: "تہجد",
        imsakSaat: "فجر {saat}",
        vaktinSonu: "وقت کا اختتام {saat}",
        uyandirmayiKapatin: "جگانا بند کریں",
        komplikasyonAdi: "نماز کا وقت",
        komplikasyonAciklama: "موجودہ نماز کا وقت اور اس کے ختم ہونے میں باقی وقت۔",
        vaktiCikisErisim: "{ad} کا وقت، اختتام {saat}",
        kilindiBaslik: "{ad} ادا شدہ",
        siradaki: "اگلی",
        komplikasyonVeriEski: "اوقات اپ ڈیٹ کرنے کے لیے iPhone پر ایپ کھولیں",
        vakitlerIphonedan: "نماز کے اوقات آپ کے iPhone سے آتے ہیں"
    )

    // es — İspanyolca (beta); terimler JS sozluk/es (hitap "usted", Kılındı "Rezado")
    public static let es = SaatMetinleri(
        dil: "es",
        saatiGuncelleyin: "Actualice Namaz Akışı en su reloj.",
        iphonedaBirKezAcin: "Las horas de rezo llegan desde su iPhone. Abra Namaz Akışı una vez en su iPhone.",
        veriEski: "Abra Namaz Akışı en su iPhone para actualizar las horas de rezo.",
        isaretle: "Marcar",
        vazgec: "Cancelar",
        kilindiErisim: "{ad} rezado. {dua}",
        cikisaKalan: "Tiempo restante hasta que termine",
        giriseKalan: "Tiempo restante hasta que comience",
        cikisSaat: "Termina {saat}",
        girisSaat: "Comienza {saat}",
        siradakiErisim: "Siguiente {ad}, {saat}",
        kildimErisim: "Marcar {ad} como rezado",
        sessizUyandirma: "Despertador silencioso {saat}",
        guncelleyin: "Actualizar",
        bugun: "Hoy",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "rezado",
        kilinmadiKucuk: "no rezado",
        durumSimdi: "Ahora",
        durumGecti: "Pasado",
        durumSirada: "Próximo",
        kible: "Alquibla",
        kibleKonumYok: "La alquibla necesita su ubicación. Abra Namaz Akışı en su iPhone y establezca su ubicación; el reloj la recibe en un minuto.",
        pusulaHazirlaniyor: "Preparando la brújula…",
        sekizCizin: "Mueva el reloj dibujando un 8",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Gire el reloj hacia el norte y siga la flecha",
        kuzeydenErisim: "La alquibla está a {derece} grados del norte en el sentido de las agujas del reloj",
        tesbihat: "Tasbih",
        saymaIpucu: "Toque o gire la Digital Crown para contar; gírela al revés para deshacer",
        yenidenBaslayin: "Volver a empezar",
        sonSayimiGeriAlin: "Deshacer el último conteo",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir",
        tesbihatKaynagi: "Muslim, Masajid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Fin de la hora del rezo {saat}",
        uyandirmayiKapatin: "Apagar el despertador",
        komplikasyonAdi: "Hora del rezo",
        komplikasyonAciklama: "La hora del rezo actual y el tiempo que falta para que termine.",
        vaktiCikisErisim: "{ad}, termina {saat}",
        kilindiBaslik: "{ad} rezado",
        siradaki: "Próximo",
        komplikasyonVeriEski: "Abra la aplicación en su iPhone para actualizar las horas de rezo",
        vakitlerIphonedan: "Las horas de rezo llegan desde su iPhone"
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl` (hitap "u"; "Kılındı" = "Gebeden")
    public static let nl = SaatMetinleri(
        dil: "nl",
        saatiGuncelleyin: "Werk Namaz Akışı op uw horloge bij.",
        iphonedaBirKezAcin: "De gebedstijden komen van uw iPhone. Open Namaz Akışı één keer op uw iPhone.",
        veriEski: "Open Namaz Akışı op uw iPhone om de gebedstijden bij te werken.",
        isaretle: "Markeren",
        vazgec: "Annuleren",
        kilindiErisim: "{ad} gebeden. {dua}",
        cikisaKalan: "Resterende tijd tot het einde",
        giriseKalan: "Resterende tijd tot het begin",
        cikisSaat: "Eindigt {saat}",
        girisSaat: "Begint {saat}",
        siradakiErisim: "Hierna {ad}, {saat}",
        kildimErisim: "{ad} als gebeden markeren",
        sessizUyandirma: "Stille wekker {saat}",
        guncelleyin: "Bijwerken",
        bugun: "Vandaag",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "gebeden",
        kilinmadiKucuk: "niet gebeden",
        durumSimdi: "Nu",
        durumGecti: "Voorbij",
        durumSirada: "Hierna",
        kible: "Qibla",
        kibleKonumYok: "Voor de qibla is uw locatie nodig. Open Namaz Akışı op uw iPhone en stel uw locatie in; het horloge krijgt die binnen een minuut.",
        pusulaHazirlaniyor: "Kompas wordt voorbereid…",
        sekizCizin: "Beweeg uw horloge in de vorm van een 8",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Draai uw horloge naar het noorden en volg de pijl",
        kuzeydenErisim: "De qibla ligt {derece} graden met de klok mee vanaf het noorden",
        tesbihat: "Tasbih",
        saymaIpucu: "Tik of draai aan de Digital Crown om te tellen; de andere kant op draaien maakt het ongedaan",
        yenidenBaslayin: "Opnieuw beginnen",
        sonSayimiGeriAlin: "De laatste telling ongedaan maken",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir",
        tesbihatKaynagi: "Muslim, Masajid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Gebedstijd eindigt {saat}",
        uyandirmayiKapatin: "De wekker uitzetten",
        komplikasyonAdi: "Gebedstijd",
        komplikasyonAciklama: "De huidige gebedstijd en de resterende tijd tot het einde.",
        vaktiCikisErisim: "{ad}-tijd, eindigt {saat}",
        kilindiBaslik: "{ad} gebeden",
        siradaki: "Hierna",
        komplikasyonVeriEski: "Open de app op uw iPhone om de gebedstijden bij te werken",
        vakitlerIphonedan: "De gebedstijden komen van uw iPhone"
    )

    // ÇEVİRİ: sq
    public static let sq = SaatMetinleri(
        dil: "sq",
        saatiGuncelleyin: "Update Namaz Akışı on your watch.",
        iphonedaBirKezAcin: "Prayer times come from your iPhone. Open Namaz Akışı on your iPhone once.",
        veriEski: "Open Namaz Akışı on your iPhone to update prayer times.",
        isaretle: "Mark",
        vazgec: "Cancel",
        kilindiErisim: "{ad} prayed. {dua}",
        cikisaKalan: "Time left until it ends",
        giriseKalan: "Time left until it begins",
        cikisSaat: "Ends {saat}",
        girisSaat: "Begins {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        kildimErisim: "Mark {ad} as prayed",
        sessizUyandirma: "Silent wake-up {saat}",
        guncelleyin: "Update",
        bugun: "Today",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "prayed",
        kilinmadiKucuk: "not prayed",
        durumSimdi: "Now",
        durumGecti: "Passed",
        durumSirada: "Upcoming",
        kible: "Qibla",
        kibleKonumYok: "The Qibla needs your location. Open Namaz Akışı on your iPhone and set your location; the watch gets it within a minute.",
        pusulaHazirlaniyor: "Preparing the compass…",
        sekizCizin: "Move your watch in a figure 8",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Turn your watch to north and follow the arrow",
        kuzeydenErisim: "The Qibla is {derece} degrees clockwise from north",
        tesbihat: "Tasbih",
        saymaIpucu: "Tap or turn the Digital Crown to count; turn it the other way to undo",
        yenidenBaslayin: "Start again",
        sonSayimiGeriAlin: "Undo the last count",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir",
        tesbihatKaynagi: "Muslim, Masajid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Prayer time ends {saat}",
        uyandirmayiKapatin: "Dismiss the wake-up",
        komplikasyonAdi: "Prayer time",
        komplikasyonAciklama: "The current prayer time and the time left until it ends.",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        komplikasyonVeriEski: "Open the app on your iPhone to update prayer times",
        vakitlerIphonedan: "Prayer times come from your iPhone"
    )

    // hi — Hintçe (beta): JS `sozluk/hi` (kible, saat, nafile, vakit, samimiyet)
    public static let hi = SaatMetinleri(
        dil: "hi",
        saatiGuncelleyin: "अपनी घड़ी पर Namaz Akışı अपडेट करें।",
        iphonedaBirKezAcin: "नमाज़ के वक़्त आपके iPhone से आते हैं। अपने iPhone पर Namaz Akışı एक बार खोलें।",
        veriEski: "नमाज़ के वक़्त अपडेट करने के लिए अपने iPhone पर Namaz Akışı खोलें।",
        isaretle: "निशान लगाएं",
        vazgec: "रद्द करें",
        kilindiErisim: "{ad} पढ़ ली गई। {dua}",
        cikisaKalan: "ख़त्म होने में बाक़ी समय",
        giriseKalan: "शुरू होने में बाक़ी समय",
        cikisSaat: "ख़त्म {saat}",
        girisSaat: "शुरू {saat}",
        siradakiErisim: "अगली नमाज़ {ad}, {saat}",
        kildimErisim: "{ad} पर \"पढ़ ली गई\" का निशान लगाएं",
        sessizUyandirma: "चुपचाप जगाना {saat}",
        guncelleyin: "अपडेट करें",
        bugun: "आज",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "पढ़ ली गई",
        kilinmadiKucuk: "नहीं पढ़ी गई",
        durumSimdi: "अभी",
        durumGecti: "गुज़र गई",
        durumSirada: "अगली",
        kible: "क़िबला",
        kibleKonumYok: "क़िबले के लिए आपकी लोकेशन ज़रूरी है। अपने iPhone पर Namaz Akışı खोलकर अपनी लोकेशन चुनें; घड़ी इसे एक मिनट के अंदर ले लेती है।",
        pusulaHazirlaniyor: "कम्पास तैयार हो रहा है…",
        sekizCizin: "घड़ी को हवा में 8 की शक्ल में घुमाएं",
        kuzeyHarfi: "उ",
        kuzeyeCevirin: "घड़ी को उत्तर की तरफ़ करें और तीर के पीछे चलें",
        kuzeydenErisim: "क़िबला उत्तर से घड़ी की दिशा में {derece} डिग्री पर है",
        tesbihat: "तस्बीह",
        saymaIpucu: "गिनने के लिए टैप करें या Digital Crown घुमाएं; उल्टी तरफ़ घुमाने से आख़िरी गिनती वापस हो जाती है",
        yenidenBaslayin: "दोबारा शुरू करें",
        sonSayimiGeriAlin: "आख़िरी गिनती वापस लें",
        zikirSubhanallah: "सुब्हान अल्लाह",
        zikirElhamdulillah: "अल्हम्दुलिल्लाह",
        zikirAllahuEkber: "अल्लाहु अकबर",
        zikirTehlil: "ला इलाहा इल्लल्लाह",
        tehlilMetni: "ला इलाहा इल्लल्लाहु वह्दहू ला शरीका लहू, लहुल मुल्कु व लहुल हम्दु व हुवा अला कुल्लि शैइन क़दीर",
        tesbihatKaynagi: "सहीह मुस्लिम, किताबुल मसाजिद 146",
        teheccud: "तहज्जुद",
        imsakSaat: "फ़ज्र {saat}",
        vaktinSonu: "वक़्त का अंत {saat}",
        uyandirmayiKapatin: "जगाना बंद करें",
        komplikasyonAdi: "नमाज़ का वक़्त",
        komplikasyonAciklama: "मौजूदा नमाज़ का वक़्त और उसके ख़त्म होने में बाक़ी समय।",
        vaktiCikisErisim: "{ad} का वक़्त, ख़त्म {saat}",
        kilindiBaslik: "{ad} पढ़ ली गई",
        siradaki: "अगली",
        komplikasyonVeriEski: "वक़्त अपडेट करने के लिए iPhone पर ऐप खोलें",
        vakitlerIphonedan: "नमाज़ के वक़्त आपके iPhone से आते हैं"
    )

    // ÇEVİRİ: bn
    public static let bn = SaatMetinleri(
        dil: "bn",
        saatiGuncelleyin: "Update Namaz Akışı on your watch.",
        iphonedaBirKezAcin: "Prayer times come from your iPhone. Open Namaz Akışı on your iPhone once.",
        veriEski: "Open Namaz Akışı on your iPhone to update prayer times.",
        isaretle: "Mark",
        vazgec: "Cancel",
        kilindiErisim: "{ad} prayed. {dua}",
        cikisaKalan: "Time left until it ends",
        giriseKalan: "Time left until it begins",
        cikisSaat: "Ends {saat}",
        girisSaat: "Begins {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        kildimErisim: "Mark {ad} as prayed",
        sessizUyandirma: "Silent wake-up {saat}",
        guncelleyin: "Update",
        bugun: "Today",
        noktaErisim: "{ad}, {saat}, {durum}",
        kilindiKucuk: "prayed",
        kilinmadiKucuk: "not prayed",
        durumSimdi: "Now",
        durumGecti: "Passed",
        durumSirada: "Upcoming",
        kible: "Qibla",
        kibleKonumYok: "The Qibla needs your location. Open Namaz Akışı on your iPhone and set your location; the watch gets it within a minute.",
        pusulaHazirlaniyor: "Preparing the compass…",
        sekizCizin: "Move your watch in a figure 8",
        kuzeyHarfi: "N",
        kuzeyeCevirin: "Turn your watch to north and follow the arrow",
        kuzeydenErisim: "The Qibla is {derece} degrees clockwise from north",
        tesbihat: "Tasbih",
        saymaIpucu: "Tap or turn the Digital Crown to count; turn it the other way to undo",
        yenidenBaslayin: "Start again",
        sonSayimiGeriAlin: "Undo the last count",
        zikirSubhanallah: "Subhanallah",
        zikirElhamdulillah: "Alhamdulillah",
        zikirAllahuEkber: "Allahu akbar",
        zikirTehlil: "La ilaha illallah",
        tehlilMetni: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir",
        tesbihatKaynagi: "Muslim, Masajid 146",
        teheccud: "Tahajjud",
        imsakSaat: "Fajr {saat}",
        vaktinSonu: "Prayer time ends {saat}",
        uyandirmayiKapatin: "Dismiss the wake-up",
        komplikasyonAdi: "Prayer time",
        komplikasyonAciklama: "The current prayer time and the time left until it ends.",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        komplikasyonVeriEski: "Open the app on your iPhone to update prayer times",
        vakitlerIphonedan: "Prayer times come from your iPhone"
    )

    /// Dil kodu → tablo (sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn; cevrilmemis dil Ingilizce kopya,
    /// `// ÇEVİRİ: <kod>` satiriyla baslar).
    public static let tablo: [String: SaatMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
    ]

    /// Dil koduna gore metinler (bilinmeyen → Turkce).
    public static func dil(_ kod: String?) -> SaatMetinleri {
        return tablo[ArayuzDili.coz(kod)] ?? tr
    }

    /// `{anahtar}` yer tutucularini doldurur.
    public func bicim(_ sablon: String, _ degerler: [String: String]) -> String {
        return VakitMetinleri.bicim(sablon, degerler)
    }
}

/// Cizim anindaki dil: saat deposundaki kod (telefondan gelir). Gorunumler her cizimde okur;
/// dil degisince `SaatBaglantisi` yeniden cizdirir ve komplikasyonlari tazeler.
public enum SaatDili {
    public static var kod: String { SaatDeposu.varsayilan.dil() }
    public static var metin: SaatMetinleri { SaatMetinleri.dil(kod) }
    public static var vakit: VakitMetinleri { VakitMetinleri.dil(kod) }
}
