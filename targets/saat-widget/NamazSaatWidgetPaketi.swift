import SwiftUI
import WidgetKit

// APPLE WATCH KOMPLIKASYONLARI (issue #285) — WidgetKit uzantisi giris noktasi.
//
// Uzanti saat uygulamasinin icine gomulur (`plugins/withNamazSaat.js`); veriyi saat
// uygulamasinin App Group deposundan (`SaatDeposu`) OKUR, hic yazmaz. Karar iPhone
// widget'iyla ayni (`WidgetKarari.gorunum`), zaman cizelgesi yalniz vakit sinirlarinda.
@main
struct NamazSaatWidgetPaketi: WidgetBundle {
    var body: some Widget {
        NamazSaatKomplikasyonu()
    }
}
