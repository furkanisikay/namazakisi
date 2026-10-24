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

public enum SaatSure {
    /// Kalan sure (ms, negatif → 0) parcalari. Saniye ASAGI yuvarlanir (JS sayaciyla ayni).
    /// Birimler dilde (JS `sozluk/<dil>/sure.ts > kisa`: "sa/dk/sn", "h/min/s").
    public static func parcalar(kalanMs: Int64, saniyesiz: Bool = false, dil: String = ArayuzDili.varsayilan) -> [SaatSureParcasi] {
        let en = ArayuzDili.coz(dil) == "en"
        let birimSa = en ? "h" : "sa"
        let birimDk = en ? "min" : "dk"
        let birimSn = en ? "s" : "sn"
        let toplam = max(kalanMs, 0) / 1000
        let sa = toplam / 3600
        let dk = (toplam % 3600) / 60
        let sn = toplam % 60
        if sa > 0 { return [SaatSureParcasi(String(sa), birimSa), SaatSureParcasi(String(dk), birimDk)] }
        if saniyesiz { return [SaatSureParcasi(String(max(dk, sn > 0 ? 1 : 0)), birimDk)] }
        if dk > 0 { return [SaatSureParcasi(String(dk), birimDk), SaatSureParcasi(sn < 10 ? "0\(sn)" : String(sn), birimSn)] }
        return [SaatSureParcasi(String(sn), birimSn)]
    }

    /// Ekran okuyucu: "1 saat 9 dakika", "9 dakika 5 saniye", "42 saniye"
    /// (en: "1 hour 9 minutes", "1 minute 1 second" — JS `sure.saat/dakika/saniye` cogullari).
    public static func sesli(kalanMs: Int64, saniyesiz: Bool = false, dil: String = ArayuzDili.varsayilan) -> String {
        let en = ArayuzDili.coz(dil) == "en"
        // Kisa birim (iki dilde) → uzun ad.
        let turkce = ["sa": "saat", "dk": "dakika", "sn": "saniye"]
        let ingilizce = ["h": "hour", "min": "minute", "s": "second"]
        return parcalar(kalanMs: kalanMs, saniyesiz: saniyesiz, dil: dil)
            .map { p -> String in
                let n = Int(p.sayi) ?? 0
                if en {
                    let ad = ingilizce[p.birim] ?? p.birim
                    return "\(n) \(ad)\(n == 1 ? "" : "s")"
                }
                return "\(n) \(turkce[p.birim] ?? p.birim)"
            }
            .joined(separator: " ")
    }
}
