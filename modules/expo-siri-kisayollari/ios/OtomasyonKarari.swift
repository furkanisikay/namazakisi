import Foundation

// KISAYOLLAR OTOMASYON DEGERLERI — Android otomasyon degiskenlerinin (#278) iOS ikizi.
//
// Tasker/MacroDroid eklentisi `%vakit %vakitkodu %kalandk` degiskenlerini ve
// "vakit kilindi mi" kosulunu verir. Kisayollar'da bunlarin karsiligi DEGER DONDUREN
// eylemlerdir: kullanici "Eger … ise" bloguyla dallanir. Uc eylem ana hedefte
// (`targets/siri-kisayollari/NamazOtomasyonIntentleri.swift`), karar burada.
//
// Otomasyon TETIGI ("vakit girdi" olayi) iOS'ta YOKTUR: ucuncu taraf uygulama Kisayollar'a
// kisisel otomasyon tetigi tanimlayamaz. Belgedeki yedek yol: "Gunun saati" tetigi +
// bu eylemler.
//
// SAF: yalniz Foundation (Linux swiftc ile test edilir, `test/main.swift` §7).

public struct SiradakiVakitDegeri: Equatable {
    /// Widget kodu (`sabah`, `ogle` …) — Android `%vakitkodu` ile ayni uzay.
    public let kod: String
    /// Gorunen ad ("Sabah", "Öğle" …).
    public let ad: String
    public let girisMs: Int64
    /// Girise kalan tam dakika, YUKARI yuvarlanir (59 sn kala "1" der, "0" demez).
    public let kalanDk: Int
}

public enum OtomasyonKarari {
    /// Siradaki kilinabilir vakit; cizelge biterse `nil` (veri eski, uygulama acilmali).
    public static func siradakiVakit(_ vakitler: [SiriVakitAni], simdiMs: Int64) -> SiradakiVakitDegeri? {
        guard let s = VakitKarari.aktifVakitBul(vakitler, simdiMs: simdiMs).sonraki else { return nil }
        let fark = max(Int64(0), s.ms - simdiMs)
        let kalan = Int((fark + 59_999) / 60_000)
        return SiradakiVakitDegeri(kod: s.vakit, ad: VakitKarari.gorunenAd(s.vakit), girisMs: s.ms, kalanDk: kalan)
    }

    /// "Su anki vakit kilindi mi?" — `true`/`false`; kilinacak vakit yoksa (gunes→ogle arasi,
    /// cizelge yok) `nil`. Android otomasyon kosulunun "bilinmiyor"u ile ayni anlam.
    public static func simdikiVakitKilindiMi(
        vakitler: [SiriVakitAni],
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64
    ) -> Bool? {
        switch VakitKarari.kildimKarari(
            vakitler: vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyenler, simdiMs: simdiMs
        ) {
        case .aday: return false
        case .zatenKilindi: return true
        case .vakitYok: return nil
        }
    }
}
