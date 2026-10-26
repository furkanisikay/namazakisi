import Foundation

// APPLE TV PANOSU — saf durum, kerahat, bicim (Android TV `cekirdek/{PanoDurumu,Kerahat,Bicim,
// Kaydirma,IlListesi}.kt` ikizi). Zaman ve saat dilimi ENJEKTE edilir; SwiftUI import ETMEZ.
// Kural degisirse iki dil BIRLIKTE degisir (testler: Kotlin `PanoDurumuTest`, Swift
// `targets/tv/test/main.swift`).

/// PANO DILI (W5, Android TV `TvDili.kt` ikizi): TV CIHAZIN dilini izler. Cekirdek dili
/// PARAMETRE alir (varsayilan "tr" — mevcut testler degismez); desteklenmeyen dil Turkceye
/// duser. Ingilizce karsiliklar telefonun JS sozlugunden (`sozluk/en`) ve Android TV ile
/// BIREBIR ayni.
public enum TvDili {
    public static let varsayilan = "tr"
    /// Tablo duzeni sirasiyla (tr, en, id, de, fr, bs, ru, ms, ar, ur).
    public static let desteklenenler = ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur"]

    /// "en", "en-US", "de_DE" → kok kod; desteklenmeyen → "tr". Eski Endonezce kodu "in" → "id".
    public static func coz(_ kod: String?) -> String {
        guard let kod, !kod.isEmpty else { return varsayilan }
        var dil = String(kod.split(whereSeparator: { $0 == "-" || $0 == "_" }).first ?? "")
        if dil == "in" { dil = "id" }
        return desteklenenler.contains(dil) ? dil : varsayilan
    }

    /// Cihazin ilk tercih ettigi dil (tvOS Ayarlar > Genel > Dil).
    public static var cihaz: String { coz(Locale.preferredLanguages.first) }

    /// `{anahtar}` yer tutucularini doldurur.
    public static func bicim(_ sablon: String, _ degerler: [String: String]) -> String {
        var sonuc = sablon
        for (anahtar, deger) in degerler { sonuc = sonuc.replacingOccurrences(of: "{\(anahtar)}", with: deger) }
        return sonuc
    }
}

/// Pano cekirdek metinleri — dil basina bir ornek (Android TV `TvDili.kt` nesneleri ikizi).
/// Anahtarlar `TvVakit` / `TvKerahat.Tur` ham degerleridir. Yer tutucular `{gun}`, `{ay}`,
/// `{yil}`, `{gunAdi}`. Duzen: sira tr, en, id, de, fr, bs, ru, ms, ar, ur; cevrilmemis dil Ingilizce
/// kopya (`// ÇEVİRİ: <kod>`). Nobetci: `targets/tv/test/main.swift` §4c.
public struct TvPanoMetinleri: Equatable {
    public let vakitAdlari: [String: String]
    public let cuma: String
    /// Ocak..Aralik ve Pazartesi..Pazar (haftaGunu 1 = Pazartesi).
    public let aylar: [String]
    public let gunler: [String]
    public let tarih: String
    public let kerahatAdlari: [String: String]
    public let kerahatAciklamalari: [String: String]

    public static let tr = TvPanoMetinleri(
        vakitAdlari: ["imsak": "İmsak", "gunes": "Güneş", "ogle": "Öğle", "ikindi": "İkindi", "aksam": "Akşam", "yatsi": "Yatsı"],
        cuma: "Cuma",
        aylar: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
        gunler: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
        tarih: "{gun} {ay} {yil}, {gunAdi}",
        kerahatAdlari: ["suruk": "Güneş doğuşu", "istiva": "İstiva", "gurub": "Güneş batışı"],
        kerahatAciklamalari: [
            "suruk": "Güneş iyice yükselene kadar namaz kılınması mekruhtur.",
            "istiva": "Güneş tam tepedeyken namaz kılınması mekruhtur.",
            "gurub": "Güneş batarken namaz kılınması mekruhtur.",
        ]
    )

    public static let en = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sunrise", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Jumu'ah",
        aylar: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        gunler: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Sunrise", "istiva": "Zenith", "gurub": "Sunset"],
        kerahatAciklamalari: [
            "suruk": "Praying is makruh until the sun has risen well.",
            "istiva": "Praying is makruh while the sun is at its zenith.",
            "gurub": "Praying is makruh while the sun is setting.",
        ]
    )


    // id — Endonezce (beta); JS `sozluk/id` (vakit, tarih, anaEkran.kerahat)
    public static let id = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subuh", "gunes": "Terbit", "ogle": "Dzuhur", "ikindi": "Ashar", "aksam": "Maghrib", "yatsi": "Isya"],
        cuma: "Jumat",
        aylar: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
        gunler: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Matahari terbit", "istiva": "Istiwa", "gurub": "Matahari terbenam"],
        kerahatAciklamalari: [
            "suruk": "Menunaikan salat makruh hingga matahari naik cukup tinggi.",
            "istiva": "Menunaikan salat makruh saat matahari tepat di atas kepala.",
            "gurub": "Menunaikan salat makruh saat matahari terbenam.",
        ]
    )


    // de — Almanca (beta): Android TV `TvDiliDe` ikizi
    public static let de = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sonnenaufgang", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Freitagsgebet",
        aylar: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        gunler: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
        tarih: "{gunAdi}, {gun}. {ay} {yil}",
        kerahatAdlari: ["suruk": "Sonnenaufgang", "istiva": "Zenit", "gurub": "Sonnenuntergang"],
        kerahatAciklamalari: [
            "suruk": "Das Gebet ist makruh, bis die Sonne deutlich gestiegen ist.",
            "istiva": "Das Gebet ist makruh, solange die Sonne im Zenit steht.",
            "gurub": "Das Gebet ist makruh, während die Sonne untergeht.",
        ]
    )


    // fr
    public static let fr = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Lever du soleil", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Joumoua",
        aylar: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        gunler: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
        tarih: "{gunAdi} {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Lever du soleil", "istiva": "Zénith", "gurub": "Coucher du soleil"],
        kerahatAciklamalari: [
            "suruk": "Il est makrouh de prier tant que le soleil n’est pas bien levé.",
            "istiva": "Il est makrouh de prier quand le soleil est au zénith.",
            "gurub": "Il est makrouh de prier pendant le coucher du soleil.",
        ]
    )


    // bs
    public static let bs = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Zora", "gunes": "Izlazak sunca", "ogle": "Podne", "ikindi": "Ikindija", "aksam": "Akšam", "yatsi": "Jacija"],
        cuma: "Džuma",
        aylar: ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"],
        gunler: ["ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota", "nedjelja"],
        tarih: "{gunAdi}, {gun}. {ay} {yil}.",
        kerahatAdlari: ["suruk": "Izlazak sunca", "istiva": "Zenit", "gurub": "Zalazak sunca"],
        kerahatAciklamalari: [
            "suruk": "Klanjati je mekruh dok se sunce dobro ne podigne.",
            "istiva": "Klanjati je mekruh dok je sunce u zenitu.",
            "gurub": "Klanjati je mekruh dok sunce zalazi.",
        ]
    )


    // ru
    public static let ru = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Фаджр", "gunes": "Восход", "ogle": "Зухр", "ikindi": "Аср", "aksam": "Магриб", "yatsi": "Иша"],
        cuma: "Джума",
        aylar: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        gunler: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
        tarih: "{gunAdi}, {gun} {ay} {yil} г.",
        kerahatAdlari: ["suruk": "Восход солнца", "istiva": "Зенит", "gurub": "Закат"],
        kerahatAciklamalari: [
            "suruk": "Совершать намаз нежелательно (макрух), пока солнце не поднимется достаточно высоко.",
            "istiva": "Совершать намаз нежелательно (макрух), пока солнце в зените.",
            "gurub": "Совершать намаз нежелательно (макрух), пока солнце заходит.",
        ]
    )


    // ms
    public static let ms = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subuh", "gunes": "Syuruk", "ogle": "Zohor", "ikindi": "Asar", "aksam": "Maghrib", "yatsi": "Isyak"],
        cuma: "Jumaat",
        aylar: ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"],
        gunler: ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Syuruk", "istiva": "Istiwa", "gurub": "Ghurub"],
        kerahatAciklamalari: [
            "suruk": "Solat adalah makruh sehingga matahari naik tinggi.",
            "istiva": "Solat adalah makruh ketika matahari tepat di atas kepala.",
            "gurub": "Solat adalah makruh ketika matahari terbenam.",
        ]
    )


    // ÇEVİRİ: ar
    public static let ar = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sunrise", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Jumu'ah",
        aylar: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        gunler: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Sunrise", "istiva": "Zenith", "gurub": "Sunset"],
        kerahatAciklamalari: [
            "suruk": "Praying is makruh until the sun has risen well.",
            "istiva": "Praying is makruh while the sun is at its zenith.",
            "gurub": "Praying is makruh while the sun is setting.",
        ]
    )


    // ur
    public static let ur = TvPanoMetinleri(
        vakitAdlari: ["imsak": "فجر", "gunes": "طلوعِ آفتاب", "ogle": "ظہر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشاء"],
        cuma: "جمعہ",
        aylar: ["جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون", "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"],
        gunler: ["پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار"],
        tarih: "{gunAdi}، {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "طلوعِ آفتاب", "istiva": "زوال", "gurub": "غروبِ آفتاب"],
        kerahatAciklamalari: [
            "suruk": "سورج اچھی طرح بلند ہونے تک نماز پڑھنا مکروہ ہے۔",
            "istiva": "سورج عین سر پر ہو تو نماز پڑھنا مکروہ ہے۔",
            "gurub": "سورج غروب ہوتے وقت نماز پڑھنا مکروہ ہے۔",
        ]
    )

    public static let tablo: [String: TvPanoMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur,
    ]

    public static func dil(_ kod: String?) -> TvPanoMetinleri { tablo[TvDili.coz(kod)] ?? tr }
}

public extension TvVakit {
    /// `dil`deki gorunen ad; `ad` Turkcedir.
    func ad(_ dil: String) -> String {
        TvPanoMetinleri.dil(dil).vakitAdlari[rawValue] ?? ad
    }
}

/// Saat dilimine gore yerel takvim gunu ve gun ici saat/dakika/saniye.
public enum TvZaman {
    static func ofsetMs(_ ms: Int64, _ bolge: TimeZone) -> Int64 {
        Int64(bolge.secondsFromGMT(for: Date(timeIntervalSince1970: Double(ms) / 1000))) * 1000
    }

    static func yerelMs(_ ms: Int64, _ bolge: TimeZone) -> Int64 { ms + ofsetMs(ms, bolge) }

    static func bolBas(_ a: Int64, _ b: Int64) -> Int64 {
        let q = a / b
        return (a % b != 0 && (a < 0) != (b < 0)) ? q - 1 : q
    }

    public static func tarih(_ ms: Int64, _ bolge: TimeZone) -> TvTarih {
        TvTarih.gunSayisindan(bolBas(yerelMs(ms, bolge), 86_400_000))
    }

    /// Gun icindeki saniye (0..86399).
    static func gunIciSaniye(_ ms: Int64, _ bolge: TimeZone) -> Int {
        let y = yerelMs(ms, bolge)
        return Int((y - bolBas(y, 86_400_000) * 86_400_000) / 1000)
    }
}

/// Kerahat (mekruh) vakitleri — telefonun kaza ekraniyla AYNI pratik tanim
/// (`KAZA_SABITLERI.MEKRUH_TOLERANS_DK` 20, `ISTIVA_TOLERANS_DK` 5). Sinirlar IKI UCTA da dahil.
public enum TvKerahat {
    public static let surukDk: Int64 = 20
    public static let istivaDk: Int64 = 5
    public static let gurubDk: Int64 = 20
    static let dk: Int64 = 60_000

    public enum Tur: String {
        case suruk, istiva, gurub

        public var ad: String {
            switch self {
            case .suruk: return "Güneş doğuşu"
            case .istiva: return "İstiva"
            case .gurub: return "Güneş batışı"
            }
        }

        public var aciklama: String {
            switch self {
            case .suruk: return "Güneş iyice yükselene kadar namaz kılınması mekruhtur."
            case .istiva: return "Güneş tam tepedeyken namaz kılınması mekruhtur."
            case .gurub: return "Güneş batarken namaz kılınması mekruhtur."
            }
        }

        /// `dil`deki ad / aciklama (`ad`/`aciklama` Turkcedir).
        public func ad(_ dil: String) -> String {
            TvPanoMetinleri.dil(dil).kerahatAdlari[rawValue] ?? ad
        }

        public func aciklama(_ dil: String) -> String {
            TvPanoMetinleri.dil(dil).kerahatAciklamalari[rawValue] ?? aciklama
        }
    }

    public struct Pencere: Equatable {
        public let tur: Tur
        public let baslangic: Int64
        public let bitis: Int64
        public func icindeMi(_ simdi: Int64) -> Bool { simdi >= baslangic && simdi <= bitis }
    }

    public static func pencereler(_ v: TvGunlukVakitler) -> [Pencere] {
        [
            Pencere(tur: .suruk, baslangic: v.gunes, bitis: v.gunes + surukDk * dk),
            Pencere(tur: .istiva, baslangic: v.ogle - istivaDk * dk, bitis: v.ogle),
            Pencere(tur: .gurub, baslangic: v.aksam - gurubDk * dk, bitis: v.aksam),
        ]
    }

    public static func aktif(_ v: TvGunlukVakitler, _ simdi: Int64) -> Pencere? {
        pencereler(v).first { $0.icindeMi(simdi) }
    }

    public static func siradaki(_ v: TvGunlukVakitler, _ simdi: Int64) -> Pencere? {
        pencereler(v).first { $0.baslangic > simdi }
    }
}

/// Panonun bir andaki hâli. Gece yarisindan sonra imsak girene dek gosterilen gun DUNDUR
/// (telefonun "aktif gun = dun" kurali); siradaki o an BUGUNUN imsakidir.
public struct TvPanoDurumu: Equatable {
    public let tarih: TvTarih
    public let vakitler: TvGunlukVakitler
    public let aktif: TvVakit
    public let siradaki: TvVakit
    public let siradakiMs: Int64
    public let kalanMs: Int64
    public let cuma: Bool
    public let kerahat: TvKerahat.Pencere?
    public let siradakiKerahat: TvKerahat.Pencere?

    /// Cuma gunu ogle satiri "Cuma" diye okunur (salt gorunum).
    public func gorunenAd(_ v: TvVakit, dil: String = TvDili.varsayilan) -> String {
        if cuma && v == .ogle { return TvPanoMetinleri.dil(dil).cuma }
        return v.ad(dil)
    }
}

public enum TvPanoHesabi {
    public static func hesapla(
        simdiMs: Int64,
        bolge: TimeZone,
        vakitler: (TvTarih) -> TvGunlukVakitler
    ) -> TvPanoDurumu {
        let bugun = TvZaman.tarih(simdiMs, bolge)
        let v = vakitler(bugun)

        if simdiMs < v.imsak {
            let dun = bugun.gunEkle(-1)
            return TvPanoDurumu(
                tarih: dun,
                vakitler: vakitler(dun),
                aktif: .yatsi,
                siradaki: .imsak,
                siradakiMs: v.imsak,
                kalanMs: max(0, v.imsak - simdiMs),
                cuma: dun.haftaGunu == 5,
                kerahat: TvKerahat.aktif(v, simdiMs),
                siradakiKerahat: TvKerahat.siradaki(v, simdiMs)
            )
        }

        let sirali = TvVakit.allCases.map { ($0, v.saat($0)) }
        let aktif = sirali.last { $0.1 <= simdiMs }?.0 ?? .yatsi
        let sonraki = sirali.first { $0.1 > simdiMs }
        let siradaki = sonraki?.0 ?? .imsak
        let siradakiMs = sonraki?.1 ?? vakitler(bugun.gunEkle(1)).imsak
        return TvPanoDurumu(
            tarih: bugun,
            vakitler: v,
            aktif: aktif,
            siradaki: siradaki,
            siradakiMs: siradakiMs,
            kalanMs: max(0, siradakiMs - simdiMs),
            cuma: bugun.haftaGunu == 5,
            kerahat: TvKerahat.aktif(v, simdiMs),
            siradakiKerahat: TvKerahat.siradaki(v, simdiMs)
        )
    }
}

/// Metin bicimleri. Ay/gun adlari sabit tablodan (cihazin `Locale`'ine/ICU'ya bagli degil);
/// dil PARAMETREDIR (varsayilan Turkce), pano cihaz dilini verir (`TvDili.cihaz`).
public enum TvBicim {
    static func iki(_ n: Int) -> String { n < 10 ? "0\(n)" : "\(n)" }

    /// "05:42"
    public static func saat(_ ms: Int64, _ bolge: TimeZone) -> String {
        let s = TvZaman.gunIciSaniye(ms, bolge)
        return "\(iki(s / 3600)):\(iki((s % 3600) / 60))"
    }

    /// "07"
    public static func saniye(_ ms: Int64, _ bolge: TimeZone) -> String {
        iki(TvZaman.gunIciSaniye(ms, bolge) % 60)
    }

    /// "13 Ekim 2026, Salı" / "Tuesday, 13 October 2026"
    public static func tarih(_ g: TvTarih, dil: String = TvDili.varsayilan) -> String {
        let m = TvPanoMetinleri.dil(dil)
        return TvDili.bicim(m.tarih, [
            "gun": String(g.gun), "ay": m.aylar[g.ay - 1], "yil": String(g.yil), "gunAdi": m.gunler[g.haftaGunu - 1],
        ])
    }

    /// "2:05:09" ya da "05:09"; saniye ASAGI yuvarlanir.
    public static func geriSayim(_ kalanMs: Int64) -> String {
        let toplam = Int(max(0, kalanMs) / 1000)
        let sa = toplam / 3600
        let dk = (toplam % 3600) / 60
        let sn = toplam % 60
        return sa > 0 ? "\(sa):\(iki(dk)):\(iki(sn))" : "\(iki(dk)):\(iki(sn))"
    }
}

/// Ekran yanigi korumasi: icerik dakikada bir birkac noktaya kaydirilir (Android `Kaydirma` ikizi).
public enum TvKaydirma {
    static let adimlar: [(Int, Int)] = [(0, 0), (6, 0), (6, 6), (0, 6), (-6, 6), (-6, 0), (-6, -6), (0, -6)]

    public static func ofset(_ simdiMs: Int64) -> (Int, Int) {
        let dakika = TvZaman.bolBas(simdiMs, 60_000)
        var i = Int(dakika % Int64(adimlar.count))
        if i < 0 { i += adimlar.count }
        return adimlar[i]
    }
}

/// Telefonun manuel konum listesindeki bir il (`iller.json`, `TURKIYE_ILLERI_OFFLINE`'dan uretilir).
public struct TvIl: Codable, Equatable, Identifiable {
    public let plaka: String
    public let ad: String
    public let lat: Double
    public let lng: Double
    public var id: String { plaka }
}

public enum TvIlListesi {
    public static func coz(_ veri: Data) -> [TvIl] {
        (try? JSONDecoder().decode([TvIl].self, from: veri)) ?? []
    }

    public static func bul(_ iller: [TvIl], _ plaka: String?) -> TvIl? {
        guard let plaka else { return nil }
        return iller.first { $0.plaka == plaka }
    }
}
