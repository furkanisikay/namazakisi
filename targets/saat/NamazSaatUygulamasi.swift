import SwiftUI
import WatchKit

// APPLE WATCH UYGULAMASI GIRIS NOKTASI (issue #285).
//
// Saat ikinci motor KURMAZ: vakitler ve hazir muhafiz plani iPhone'da hesaplanir, Wear OS
// saatine giden yukun aynisi WatchConnectivity ile gelir (`SaatBaglantisi`). Saat plani
// telefonla AYNI kimlikle yerel bildirim olarak kurar (`SaatHatirlatici`) — watchOS ikisini
// tekillestirir, telefon uzaktayken bilek calar. Sessiz uyandirma `SaatUyandirici`'dadir.
// Hedef `plugins/withNamazSaat.js` ile prebuild'de kurulur (bayrakli, varsayilan KAPALI).
@main
struct NamazSaatUygulamasi: App {
    /// Akilli alarm oturumu icin yeniden baslatma `handle(_:)` buraya gelir.
    @WKApplicationDelegateAdaptor(NamazSaatUygulamaDelegesi.self) private var delege

    init() {
        // Yalniz simulatorde (magaza kareleri); cihazda hicbir sey yapmaz.
        SaatSimulatorTohumu.uygula(SaatDeposu.varsayilan)
        SaatHatirlatici.paylasilan.baslat()
        SaatBaglantisi.paylasilan.baslat()
    }

    var body: some Scene {
        WindowGroup {
            AnaEkran()
                .environmentObject(SaatBaglantisi.paylasilan)
                .environmentObject(SaatUyandirici.paylasilan)
        }
        // Uygulama kapaliyken gelen yuk (telefonda vakit/kilinmislik degisti): sistem
        // saati arka planda uyandirir; teslim bitene kadar beklenir ki komplikasyonlar
        // uygulama hic acilmadan tazelensin.
        .backgroundTask(.watchConnectivity) {
            await SaatBaglantisi.paylasilan.bekleyenTeslimleriBekle()
        }
    }
}
