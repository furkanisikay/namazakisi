import SwiftUI

// N'KO YAZI TIPI KAPISI (Apple Watch uygulamasi VE komplikasyon uzantisi; eklenti
// `withNamazSaat` bu dizini iki hedefe de kopyalar). `ortak/` saf kalir (yalniz Foundation,
// CI'da ciplak `swiftc` ile derlenir), SwiftUI kodu bu yuzden burada.
// watchOS'ta sistem N'Ko yazi tipi YOK ve uygulamanin kaydettigi yazi tipi (`UIAppFonts`)
// sistemin yedek listesine kendiliginden GIRMEZ: N'Ko metni kutu (tofu) olarak cizilir. Kapi
// dil N'Ko DEGILSE bugunku sistem yazi tipini BIREBIR dondurur; N'Ko ise ayni stil/boyda
// paketteki Noto Sans NKo'yu (Resources + `UIAppFonts`, tek kaynak
// `assets/fonts/NotoSansNKo-Regular.ttf`, lisans `assets/fonts/OFL.txt`). Agirlik ve
// `monospacedDigit` cagri yerindeki zincirde kalir; yalniz SF Symbol cizen
// `Image(systemName:)` kapidan GECMEZ. Dil telefondan gelir (`SaatDili.kod`), CIZIM aninda
// okunur. Cihazda DOGRULANMADI.
enum SaatYaziTipi {
    /// Yazi tipinin PostScript adi (`name` tablosu nameID 6, fontTools ile dogrulandi).
    static let nkoAdi = "NotoSansNKo-Regular"

    static var nkoMu: Bool { SaatDili.kod == "nqo" }

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

    /// watchOS metin stillerinin "Large" icerik boyundaki punto degeri: `relativeTo:` olceginin
    /// tabani (Apple HIG watchOS Dynamic Type tablosu; iOS degerleri saatte buyuk kalirdi).
    /// Cihazda DOGRULANMADI.
    private static func tabanBoyu(_ stil: Font.TextStyle) -> CGFloat {
        switch stil {
        case .largeTitle: return 36
        case .title: return 34
        case .title2: return 27
        case .title3: return 19
        case .headline: return 16
        case .body: return 16
        case .callout: return 16
        case .subheadline: return 15
        case .footnote: return 13
        case .caption: return 15
        case .caption2: return 14
        default: return 16
        }
    }
}

extension View {
    /// Kok gorunume (saat `WindowGroup` icerigi, tam ekran sunum, komplikasyon): `.font`
    /// VERMEYEN metin (duz `Text`, `Label`) ortamdan N'Ko yazi tipini (govde stili) alsin.
    /// YALNIZ N'Ko'da ortami degistirir; aksi halde `self` (gorunum birebir). Kendi yazi tipini
    /// ortamin USTUNE koyan sistem stilleri (gauge etiketi, `widgetLabel`) icin `Text.nkoYaziTipi(_:)`.
    @ViewBuilder
    func nkoVarsayilanYaziTipi() -> some View {
        if SaatYaziTipi.nkoMu {
            environment(\.font, SaatYaziTipi.stil(.body))
        } else {
            self
        }
    }
}

extension Text {
    /// Sistemin cizdigi etiket (gauge `label:`, kose komplikasyonunun `widgetLabel`'i): ortam
    /// yazi tipi stilin/sistemin kendi yazi tipine yenilir, bu yuzden N'Ko'da yazi tipi `Text`'in
    /// KENDISINE yazilir. Donus tipi `Text` kalir (`widgetLabel` yalniz Text/Gauge/ProgressView
    /// cizer); N'Ko degilse `self` (birebir).
    func nkoYaziTipi(_ stil: Font.TextStyle) -> Text {
        SaatYaziTipi.nkoMu ? font(SaatYaziTipi.stil(stil)) : self
    }
}
