import Foundation

// MAGAZA EKRAN GORUNTULERI ICIN SIMULATOR TOHUMU (issue #285).
//
// App Store Apple Watch kareleri CI'da simulatorde cekilir
// (`.github/workflows/ios-ekran-goruntuleri.yml`, `tur: saat`). Saat veriyi normalde
// iPhone'dan WatchConnectivity ile alir; simulator ciftinde bu teslim zamanlamaya bagli
// ve dogrulanamaz oldugu icin hat ornek yuku (Wear yuk bicimi,
// `scripts/saat-tohum-yuku.js`) baslatma ortamindan verir. `simctl launch`,
// `SIMCTL_CHILD_` onekli degiskenleri uygulamaya gecirir.
//
// Kod YALNIZ simulator derlemesinde vardir (`targetEnvironment(simulator)`): cihaz
// ikilisinde ortam okunmaz, `acilisEkrani` daima nil → uretim davranisi degismez.
enum SaatAcilisEkrani: String {
    case ana, vakitler, onay, tesbihat
}

enum SaatSimulatorTohumu {
    /// Kare cekimi icin acilista gosterilecek ekran (cihazda daima nil).
    static let acilisEkrani: SaatAcilisEkrani? = {
        #if targetEnvironment(simulator)
        guard let ham = ProcessInfo.processInfo.environment["NAMAZ_SAAT_EKRAN"] else { return nil }
        return SaatAcilisEkrani(rawValue: ham)
        #else
        return nil
        #endif
    }()

    /// Ortamdaki ornek yuku ve tesbihat sayisini depoya yazar (cihazda hicbir sey yapmaz).
    static func uygula(_ depo: SaatDeposu) {
        #if targetEnvironment(simulator)
        let ortam = ProcessInfo.processInfo.environment
        let simdi = SaatDeposu.simdiMs()
        if let yuk = ortam["NAMAZ_SAAT_TOHUM_YUK"], !yuk.isEmpty {
            depo.yeniYukuIsle(yuk, simdiMs: simdi)
        }
        if let ham = ortam["NAMAZ_SAAT_TOHUM_TESBIHAT"], let toplam = Int(ham) {
            depo.tesbihatYaz(Tesbihat.Durum(toplam: toplam), simdiMs: simdi)
        }
        #endif
    }
}
