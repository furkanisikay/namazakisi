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
// Simulatorde pusula verisi yoktur ve akilli alarm oturumu tetiklenmez → kible karesi
// sabit yonle (`NAMAZ_SAAT_TOHUM_YON`), uyandirma karesi yukun ilk uyandirma kaydiyla
// (oturumsuz, yalniz gorunum) cizilir.
//
// Kod YALNIZ simulator derlemesinde vardir (`targetEnvironment(simulator)`): cihaz
// ikilisinde ortam okunmaz, `acilisEkrani` daima nil → uretim davranisi degismez.
enum SaatAcilisEkrani: String {
    /// `ana` = Simdi sayfasi, `vakitler` = Bugun kadrani, `kilindi` = Simdi'de suren vakit
    /// kilinmis, `kildimDemo` = Simdi acilir ve 1,5 sn sonra "Kildim" sahnesi kendiliginden
    /// oynar (video icin; onay penceresi atlanir).
    case ana, vakitler, onay, kilindi, kildimDemo, tesbihat, kible, uyandirma
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

    /// Acilista secilecek dikey sayfa (cihazda daima Simdi).
    static var acilisSayfasi: SaatSayfa {
        switch acilisEkrani {
        case .vakitler: return .bugun
        case .kible: return .kible
        case .tesbihat: return .tesbihat
        default: return .simdi
        }
    }

    /// Her zaman acik (sonuk) varyantin karesi: `NAMAZ_SAAT_SONUK=1` (cihazda daima false;
    /// cihazda `isLuminanceReduced` kullanilir).
    static let sonuk: Bool = {
        #if targetEnvironment(simulator)
        return ProcessInfo.processInfo.environment["NAMAZ_SAAT_SONUK"] == "1"
        #else
        return false
        #endif
    }()

    /// Kible karesi icin sabit pusula yonu (derece, cihazda daima nil).
    static let kibleYonu: Double? = {
        #if targetEnvironment(simulator)
        guard let ham = ProcessInfo.processInfo.environment["NAMAZ_SAAT_TOHUM_YON"] else { return nil }
        return Double(ham)
        #else
        return nil
        #endif
    }()

    /// Uyandirma karesi: yukun ilk uyandirma kaydi (cihazda daima nil).
    static func uyandirmaKaydi() -> SaatUyandirmaKaydi? {
        #if targetEnvironment(simulator)
        guard acilisEkrani == .uyandirma else { return nil }
        return SaatDeposu.varsayilan.yuk()?.uyandirma.first
        #else
        return nil
        #endif
    }

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
        // Kareler BAGIMSIZ: onceki acilisin (kilindi / Kildim sahnesi) iyimser isareti silinir.
        depo.bekleyenleriSifirla()
        // "Kilindi" karesi: suren vakit iyimser bekleyen olarak isaretlenir (telefon yok).
        if acilisEkrani == .kilindi, let yuk = depo.yuk(),
           case .aday(_, let kayitVakti, _) = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: simdi).kildim,
           let aktif = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: simdi).gorunum.aktif {
            depo.bekleyenEkle(SaatBekleyen(tarih: aktif.tarih, vakit: kayitVakti, ms: simdi))
        }
        #endif
    }
}
