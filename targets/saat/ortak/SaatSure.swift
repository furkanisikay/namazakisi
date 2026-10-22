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
    public static func parcalar(kalanMs: Int64, saniyesiz: Bool = false) -> [SaatSureParcasi] {
        let toplam = max(kalanMs, 0) / 1000
        let sa = toplam / 3600
        let dk = (toplam % 3600) / 60
        let sn = toplam % 60
        if sa > 0 { return [SaatSureParcasi(String(sa), "sa"), SaatSureParcasi(String(dk), "dk")] }
        if saniyesiz { return [SaatSureParcasi(String(max(dk, sn > 0 ? 1 : 0)), "dk")] }
        if dk > 0 { return [SaatSureParcasi(String(dk), "dk"), SaatSureParcasi(sn < 10 ? "0\(sn)" : String(sn), "sn")] }
        return [SaatSureParcasi(String(sn), "sn")]
    }

    /// Ekran okuyucu: "1 saat 9 dakika", "9 dakika 5 saniye", "42 saniye".
    public static func sesli(kalanMs: Int64, saniyesiz: Bool = false) -> String {
        let adlar = ["sa": "saat", "dk": "dakika", "sn": "saniye"]
        return parcalar(kalanMs: kalanMs, saniyesiz: saniyesiz)
            .map { "\(Int($0.sayi) ?? 0) \(adlar[$0.birim] ?? $0.birim)" }
            .joined(separator: " ")
    }
}
