import SwiftUI

// N'KO YAZI TIPI KAPISI (iPhone widget uzantisi: vakit ve gunun ayeti widget'lari, canli
// etkinlik, kilit ekrani). iOS'ta sistem N'Ko yazi tipi YOK ve uzantinin kaydettigi yazi tipi
// (`UIAppFonts`) sistemin yedek listesine kendiliginden GIRMEZ: N'Ko metni sistem yazi tipiyle
// kutu (tofu) olarak cizilir. Kapi arayuz dili N'Ko DEGILSE bugunku sistem yazi tipini BIREBIR
// dondurur; N'Ko ise ayni stil/boyda paketteki Noto Sans NKo'yu (eklenti `withNamazWidget` →
// Resources + `UIAppFonts`, tek kaynak `assets/fonts/NotoSansNKo-Regular.ttf`, lisans
// `assets/fonts/OFL.txt`). Agirlik ve `monospacedDigit` cagri yerindeki zincirde kalir.
// Yalniz SF Symbol cizen `Image(systemName:)` ve Arapca ayet (Amiri Quran) bu kapidan GECMEZ.
// Dil CIZIM aninda okunur (`WidgetMetin.dil`). Cihazda DOGRULANMADI.
enum YaziTipi {
    /// Yazi tipinin PostScript adi (`name` tablosu nameID 6, fontTools ile dogrulandi).
    static let nkoAdi = "NotoSansNKo-Regular"

    static var nkoMu: Bool { WidgetMetin.dil == "nqo" }

    /// Metin stili: `.headline` → `stil(.headline)`, `.system(.title3, design: .rounded)` →
    /// `stil(.title3, tasarim: .rounded)`. N'Ko'da Dynamic Type ile sistem stiliyle ayni oranda buyur.
    static func stil(_ stil: Font.TextStyle, tasarim: Font.Design = .default) -> Font {
        if nkoMu {
            return Font.custom(nkoAdi, size: tabanBoyu(stil), relativeTo: stil)
        }
        return Font.system(stil, design: tasarim)
    }

    /// Sabit boy: `.system(size:weight:design:)` karsiligi. Sistemdeki gibi Dynamic Type ile
    /// BUYUMEZ (`fixedSize`; `custom(_:size:)` govde stiline gore olceklenirdi).
    static func boy(_ boyut: CGFloat, agirlik: Font.Weight = .regular, tasarim: Font.Design = .default) -> Font {
        if nkoMu {
            return Font.custom(nkoAdi, fixedSize: boyut).weight(agirlik)
        }
        return Font.system(size: boyut, weight: agirlik, design: tasarim)
    }

    /// iOS metin stillerinin varsayilan icerik boyundaki (Large) punto degeri: `relativeTo:`
    /// olceginin tabani (Apple HIG iOS Dynamic Type tablosu).
    private static func tabanBoyu(_ stil: Font.TextStyle) -> CGFloat {
        switch stil {
        case .largeTitle: return 34
        case .title: return 28
        case .title2: return 22
        case .title3: return 20
        case .headline: return 17
        case .body: return 17
        case .callout: return 16
        case .subheadline: return 15
        case .footnote: return 13
        case .caption: return 12
        case .caption2: return 11
        default: return 17
        }
    }
}
