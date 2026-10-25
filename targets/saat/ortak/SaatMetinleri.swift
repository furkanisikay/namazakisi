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


    // ÇEVİRİ: id
    public static let id = SaatMetinleri(
        dil: "id",
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


    // ÇEVİRİ: de
    public static let de = SaatMetinleri(
        dil: "de",
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


    // ÇEVİRİ: fr
    public static let fr = SaatMetinleri(
        dil: "fr",
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


    // ÇEVİRİ: bs
    public static let bs = SaatMetinleri(
        dil: "bs",
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


    // ÇEVİRİ: ru
    public static let ru = SaatMetinleri(
        dil: "ru",
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


    // ÇEVİRİ: ms
    public static let ms = SaatMetinleri(
        dil: "ms",
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

    /// Dil kodu → tablo (sira tr, en, id, de, fr, bs, ru, ms; cevrilmemis dil Ingilizce kopya,
    /// `// ÇEVİRİ: <kod>` satiriyla baslar).
    public static let tablo: [String: SaatMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
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
