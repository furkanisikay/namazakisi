import AppIntents
import SwiftUI
import WidgetKit

// KONTROL MERKEZI "KILDIM" KONTROLU (iOS 18 ControlWidget) — Android hizli ayar kutusu
// (`kildim/KildimKutusuServisi`) ikizi. Kontrol Merkezi'ne, kilit ekranina ve Eylem
// dugmesine eklenebilir.
//
// Yalniz bu uzantida derlenir (WidgetBundle'da `if #available(iOS 18.0, *)`).
// Durum `WidgetKarari.kontrolDurumu` (saf, pod kopyasi; Linux testi `test/main.swift` §6):
// Siri "Kildim" ile ayni karar.
//
// EYLEM = `KildimDugmesiIntent` (LiveActivityIntent): sistem onu UYGULAMA SURECINDE
// calistirir → kuyruga yazan ile JS koprusu ayni kilidi paylasir (uzanti surecinden
// App Group'a yazmak uygulamanin kuyruk bosaltmasiyla yarisirdi). Dokunusta karar
// `WidgetKarari.dugmeKarari` ile YENIDEN degerlendirilir (cizim bayat olabilir);
// `requiresAuthentication` kilit ekranindan/Eylem dugmesinden kayit yazmadan once kilidi
// actirir (Android "kilit ekrani salt okunur" kararinin ikizi). Aday yoksa intent bos
// tarih/vakitle kurulur → `gecersiz`, hicbir sey yazilmaz.
//
// TAZELEME: JS veriyi yazinca `CanliEtkinlikKoprusu.widgetlariTazele` kontrolleri de
// yeniden yukler; dokunustan sonra intent ayni seyi yapar. Kontrol Merkezi her acilista
// `currentValue()`'yu yeniden sorar.
@available(iOS 18.0, *)
struct NamazKildimKontrolu: ControlWidget {
    static let tur = "NamazKildimKontrolu"

    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: Self.tur, provider: KildimKontrolSaglayici()) { durum in
            ControlWidgetButton(action: KildimDugmesiIntent(tarih: durum.tarih, vakit: durum.vakit)) {
                Label(durum.baslik, systemImage: Self.sembol(durum.tur))
            }
        }
        // Dinamik metin: interpolasyonla anahtar "%@" olur, deger aynen gosterilir (yerellestirme
        // tablosu aranmaz) → kontrol galerisinde de arayuz dili (W5).
        .displayName("\(WidgetMetin.m.kontrolAdi)")
        .description("\(WidgetMetin.m.kontrolAciklama)")
    }

    static func sembol(_ tur: WidgetKontrolDurumu.Tur) -> String {
        switch tur {
        case .kilinabilir: return "checkmark.circle"
        case .kilindi: return "checkmark.circle.fill"
        case .vakitYok: return "moon.stars"
        }
    }
}

@available(iOS 18.0, *)
struct KildimKontrolSaglayici: ControlValueProvider {
    var previewValue: WidgetKontrolDurumu {
        let vm = WidgetMetin.vm
        return WidgetKontrolDurumu(
            tur: .kilinabilir, baslik: VakitMetinleri.bicim(vm.kontrolKildim, ["ad": vm.ad("ogle")]), tarih: "", vakit: ""
        )
    }

    func currentValue() async throws -> WidgetKontrolDurumu {
        let depo = SiriDeposu.varsayilan
        return WidgetKarari.kontrolDurumu(
            vakitler: depo.cizelge()?.vakitler,
            kilinanlar: depo.kilinanlar(),
            bekleyenler: depo.bekleyenler(),
            simdiMs: SiriDeposu.simdiMs(),
            dil: WidgetMetin.dil
        )
    }
}
