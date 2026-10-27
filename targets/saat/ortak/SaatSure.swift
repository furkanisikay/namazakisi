import Foundation

/**
 * Geri sayimin GORUNEN bicimi — birimli parcalar (Apple Watch, #363 ile ayni dil).
 * JS `src/core/utils/kalanSureParcalari.ts`, Wear `AnaEkranKarari.sayac`, TV
 * `Bicim.kalanParcalari` ikizi — SAF (yalniz Foundation):
 *  - bir saat ve ustu: "1 sa 9 dk" (saniye yok)
 *  - bir saatin alti:  "9 dk 05 sn" (saniye iki haneli → satir oynamaz)
 *  - bir dakikanin alti: "42 sn"
 * Sonuk (her zaman acik) ekranda saniye yazilmaz: "9 dk" (ekran dakikada bir tazelenir).
 */
public struct SaatSureParcasi: Equatable {
    public let sayi: String
    public let birim: String

    public init(_ sayi: String, _ birim: String) {
        self.sayi = sayi
        self.birim = birim
    }
}

/// Sure metinleri — dil basina bir ornek (JS `sozluk/<dil>/sure.ts` ikizi: `kisa` birimleri ve
/// `saat/dakika/saniye` cogullari). Cogul kaliplari CLDR kategorisi ("one", "few", "many",
/// "other"; `CogulKurali`) → kalip, yer tutucu `{n}`; eksik kategori "other"a duser.
/// Duzen: sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn; cevrilmemis dil Ingilizce kopya
/// (`// ÇEVİRİ: <kod>`).
public struct SaatSureMetinleri: Equatable {
    public let birimSa: String
    public let birimDk: String
    public let birimSn: String
    public let saat: [String: String]
    public let dakika: [String: String]
    public let saniye: [String: String]

    public static let tr = SaatSureMetinleri(
        birimSa: "sa", birimDk: "dk", birimSn: "sn",
        saat: ["one": "{n} saat", "other": "{n} saat"],
        dakika: ["one": "{n} dakika", "other": "{n} dakika"],
        saniye: ["one": "{n} saniye", "other": "{n} saniye"]
    )

    public static let en = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hour", "other": "{n} hours"],
        dakika: ["one": "{n} minute", "other": "{n} minutes"],
        saniye: ["one": "{n} second", "other": "{n} seconds"]
    )


    // id — Endonezce (beta); CLDR yalniz "other" (JS `sozluk/id/sure.ts`)
    public static let id = SaatSureMetinleri(
        birimSa: "j", birimDk: "mnt", birimSn: "dtk",
        saat: ["other": "{n} jam"],
        dakika: ["other": "{n} menit"],
        saniye: ["other": "{n} detik"]
    )


    // de — Almanca (beta): JS `sozluk/de/sure.ts`
    public static let de = SaatSureMetinleri(
        birimSa: "Std.", birimDk: "Min.", birimSn: "Sek.",
        saat: ["one": "{n} Stunde", "other": "{n} Stunden"],
        dakika: ["one": "{n} Minute", "other": "{n} Minuten"],
        saniye: ["one": "{n} Sekunde", "other": "{n} Sekunden"]
    )


    // fr
    public static let fr = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} heure", "many": "{n} d’heures", "other": "{n} heures"],
        dakika: ["one": "{n} minute", "many": "{n} de minutes", "other": "{n} minutes"],
        saniye: ["one": "{n} seconde", "many": "{n} de secondes", "other": "{n} secondes"]
    )


    // bs
    public static let bs = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} sat", "few": "{n} sata", "other": "{n} sati"],
        dakika: ["one": "{n} minuta", "few": "{n} minute", "other": "{n} minuta"],
        saniye: ["one": "{n} sekunda", "few": "{n} sekunde", "other": "{n} sekundi"]
    )


    // ru
    public static let ru = SaatSureMetinleri(
        birimSa: "ч", birimDk: "мин", birimSn: "с",
        saat: ["one": "{n} час", "few": "{n} часа", "many": "{n} часов", "other": "{n} часа"],
        dakika: ["one": "{n} минута", "few": "{n} минуты", "many": "{n} минут", "other": "{n} минуты"],
        saniye: ["one": "{n} секунда", "few": "{n} секунды", "many": "{n} секунд", "other": "{n} секунды"]
    )


    // ms
    public static let ms = SaatSureMetinleri(
        birimSa: "j", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} jam", "other": "{n} jam"],
        dakika: ["one": "{n} minit", "other": "{n} minit"],
        saniye: ["one": "{n} saat", "other": "{n} saat"]
    )


    // ar — Arapça (beta): JS `sozluk/ar/sure.ts` birebir (3–10 çoğul, diğerleri rakamla tekil)
    public static let ar = SaatSureMetinleri(
        birimSa: "س", birimDk: "د", birimSn: "ث",
        saat: ["zero": "{n} ساعة", "one": "{n} ساعة", "two": "{n} ساعة", "few": "{n} ساعات", "many": "{n} ساعة", "other": "{n} ساعة"],
        dakika: ["zero": "{n} دقيقة", "one": "{n} دقيقة", "two": "{n} دقيقة", "few": "{n} دقائق", "many": "{n} دقيقة", "other": "{n} دقيقة"],
        saniye: ["zero": "{n} ثانية", "one": "{n} ثانية", "two": "{n} ثانية", "few": "{n} ثوانٍ", "many": "{n} ثانية", "other": "{n} ثانية"]
    )


    // ur
    public static let ur = SaatSureMetinleri(
        birimSa: "گھنٹے", birimDk: "منٹ", birimSn: "سیکنڈ",
        saat: ["one": "{n} گھنٹہ", "other": "{n} گھنٹے"],
        dakika: ["one": "{n} منٹ", "other": "{n} منٹ"],
        saniye: ["one": "{n} سیکنڈ", "other": "{n} سیکنڈ"]
    )

    // es — İspanyolca (beta): JS `sozluk/es/sure.ts` birebir (one = 1, many = milyonlar "{n} de …")
    public static let es = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hora", "other": "{n} horas", "many": "{n} de horas"],
        dakika: ["one": "{n} minuto", "other": "{n} minutos", "many": "{n} de minutos"],
        saniye: ["one": "{n} segundo", "other": "{n} segundos", "many": "{n} de segundos"]
    )

    // ÇEVİRİ: nl
    public static let nl = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hour", "other": "{n} hours"],
        dakika: ["one": "{n} minute", "other": "{n} minutes"],
        saniye: ["one": "{n} second", "other": "{n} seconds"]
    )

    // ÇEVİRİ: sq
    public static let sq = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hour", "other": "{n} hours"],
        dakika: ["one": "{n} minute", "other": "{n} minutes"],
        saniye: ["one": "{n} second", "other": "{n} seconds"]
    )

    // ÇEVİRİ: hi
    public static let hi = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hour", "other": "{n} hours"],
        dakika: ["one": "{n} minute", "other": "{n} minutes"],
        saniye: ["one": "{n} second", "other": "{n} seconds"]
    )

    // ÇEVİRİ: bn
    public static let bn = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hour", "other": "{n} hours"],
        dakika: ["one": "{n} minute", "other": "{n} minutes"],
        saniye: ["one": "{n} second", "other": "{n} seconds"]
    )

    public static let tablo: [String: SaatSureMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
    ]

    public static func dil(_ kod: String?) -> SaatSureMetinleri { tablo[ArayuzDili.coz(kod)] ?? tr }
}

public enum SaatSure {
    private enum Tur { case saat, dakika, saniye }

    private static func ham(_ kalanMs: Int64, _ saniyesiz: Bool) -> [(Int64, Tur)] {
        let toplam = max(kalanMs, 0) / 1000
        let sa = toplam / 3600
        let dk = (toplam % 3600) / 60
        let sn = toplam % 60
        if sa > 0 { return [(sa, .saat), (dk, .dakika)] }
        if saniyesiz { return [(max(dk, sn > 0 ? 1 : 0), .dakika)] }
        if dk > 0 { return [(dk, .dakika), (sn, .saniye)] }
        return [(sn, .saniye)]
    }

    /// Kalan sure (ms, negatif → 0) parcalari. Saniye ASAGI yuvarlanir (JS sayaciyla ayni).
    /// Birimler dilde (JS `sozluk/<dil>/sure.ts > kisa`: "sa/dk/sn", "h/min/s").
    public static func parcalar(kalanMs: Int64, saniyesiz: Bool = false, dil: String = ArayuzDili.varsayilan) -> [SaatSureParcasi] {
        let m = SaatSureMetinleri.dil(dil)
        let parcalar = ham(kalanMs, saniyesiz)
        return parcalar.map { (n, tur) in
            switch tur {
            case .saat: return SaatSureParcasi(String(n), m.birimSa)
            case .dakika: return SaatSureParcasi(String(n), m.birimDk)
            // Dakikanin yanindaki saniye iki haneli (satir oynamaz).
            case .saniye: return SaatSureParcasi(parcalar.count > 1 && n < 10 ? "0\(n)" : String(n), m.birimSn)
            }
        }
    }

    /// Ekran okuyucu: "1 saat 9 dakika", "9 dakika 5 saniye", "42 saniye"
    /// (en: "1 hour 9 minutes", "1 minute 1 second" — JS `sure.saat/dakika/saniye` cogullari).
    public static func sesli(kalanMs: Int64, saniyesiz: Bool = false, dil: String = ArayuzDili.varsayilan) -> String {
        let m = SaatSureMetinleri.dil(dil)
        return ham(kalanMs, saniyesiz)
            .map { (n, tur) -> String in
                let kaliplar: [String: String]
                switch tur {
                case .saat: kaliplar = m.saat
                case .dakika: kaliplar = m.dakika
                case .saniye: kaliplar = m.saniye
                }
                return CogulKurali.sec(kaliplar, dil, Int(n))
            }
            .joined(separator: " ")
    }
}
