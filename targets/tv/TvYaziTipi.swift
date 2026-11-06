import SwiftUI

// N'KO YAZI TIPI KAPISI (Apple TV panosu). tvOS'ta sistem N'Ko yazi tipi YOK ve uygulamanin
// kaydettigi yazi tipi (`UIAppFonts`) sistemin yedek listesine kendiliginden GIRMEZ: N'Ko
// metni kutu (tofu) olarak cizilir. Kapi cihaz dili N'Ko DEGILSE bugunku sistem yazi tipini
// BIREBIR dondurur; N'Ko ise ayni boyda paketteki Noto Sans NKo'yu (eklenti `withNamazTV` →
// Resources + `UIAppFonts`, tek kaynak `assets/fonts/NotoSansNKo-Regular.ttf`, lisans
// `assets/fonts/OFL.txt`). Pano yalniz sabit boy kullanir (10 adim uzaktan okunur, Dynamic
// Type yok); `monospacedDigit` cagri yerindeki zincirde kalir. Dil `TvDili.cihaz`. Cihazda
// DOGRULANMADI.
enum TvYaziTipi {
    /// Yazi tipinin PostScript adi (`name` tablosu nameID 6, fontTools ile dogrulandi).
    static let nkoAdi = "NotoSansNKo-Regular"

    static var nkoMu: Bool { TvDili.cihaz == "nqo" }

    /// Sabit boy: `.system(size:weight:design:)` karsiligi (`fixedSize`: sistemdeki gibi olceklenmez).
    static func boy(_ boyut: CGFloat, agirlik: Font.Weight = .regular, tasarim: Font.Design = .default) -> Font {
        if nkoMu {
            return Font.custom(nkoAdi, fixedSize: boyut).weight(agirlik)
        }
        return Font.system(size: boyut, weight: agirlik, design: tasarim)
    }
}
