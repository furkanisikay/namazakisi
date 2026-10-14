import SwiftUI

// APPLE WATCH UYGULAMASI GIRIS NOKTASI (issue #285).
//
// Saat YALNIZ GOSTERIR: vakitler iPhone'da hesaplanir, Wear OS saatine giden yukun aynisi
// WatchConnectivity ile gelir (`SaatBaglantisi`). Hatirlatma KURULMAZ — iPhone'daki
// muhafiz bildirimleri saate zaten yansir ("Kildim" dugmesiyle birlikte); saatte ikinci
// bir bildirim cift bildirim olurdu. Hedef `plugins/withNamazSaat.js` ile prebuild'de kurulur
// (bayrakli, varsayilan KAPALI).
@main
struct NamazSaatUygulamasi: App {
    init() {
        SaatBaglantisi.paylasilan.baslat()
    }

    var body: some Scene {
        WindowGroup {
            AnaEkran()
                .environmentObject(SaatBaglantisi.paylasilan)
        }
        // Uygulama kapaliyken gelen yuk (telefonda vakit/kilinmislik degisti): sistem
        // saati arka planda uyandirir; teslim bitene kadar beklenir ki komplikasyonlar
        // uygulama hic acilmadan tazelensin.
        .backgroundTask(.watchConnectivity) {
            await SaatBaglantisi.paylasilan.bekleyenTeslimleriBekle()
        }
    }
}
