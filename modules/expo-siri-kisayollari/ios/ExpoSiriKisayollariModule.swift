import ExpoModulesCore
import Foundation

/**
 * SIRI / KISAYOLLAR / ODAK — JS koprusu (issue #279).
 *
 * App Intents'in kendisi BU MODULDE DEGIL, ana uygulama hedefindedir
 * (`targets/siri-kisayollari/*.swift`, `plugins/withSiriKisayollari.js` kopyalar).
 * Sebep: App Intents metadata'si (`Metadata.appintents`) yalnizca intent'i derleyen
 * HEDEF icin cikarilir; bir pod (statik kutuphane) icindeki intent'ler sisteme
 * gorunmez. Intent'ler bu modulun `SiriDeposu`'nu `import ExpoSiriKisayollari` ile
 * kullanir → ayni surec, ayni kilit, ayni `UserDefaults`.
 *
 * Fonksiyon adlari BILINCLI OLARAK Android modulleriyle aynidir:
 *   - `vakitlerKaydet` / `kilinanlarKaydet` ← Android `WidgetVeri` (WidgetServisi aynen kullanir)
 *   - `bekleyenleriAl` / `tamamlandi` / `basarisiz` ← Android `KildimKuyrugu`
 *     (KildimKuyruguServisi aynen kullanir)
 */
public class ExpoSiriKisayollariModule: Module {
    private var gozlemci: NSObjectProtocol?

    public func definition() -> ModuleDefinition {
        Name("ExpoSiriKisayollari")

        Events("onSiriDegisikligi")

        // Intent uygulama ACIKKEN calisirsa (ayni surec) JS hemen haberdar olur;
        // kapaliyken JS acilista/one gelince okur.
        OnCreate {
            self.gozlemci = NotificationCenter.default.addObserver(
                forName: SiriDeposu.degisiklikBildirimi,
                object: nil,
                queue: nil
            ) { [weak self] bildirim in
                let tur = (bildirim.userInfo?["tur"] as? String) ?? ""
                self?.sendEvent("onSiriDegisikligi", ["tur": tur])
            }
        }

        OnDestroy {
            if let g = self.gozlemci {
                NotificationCenter.default.removeObserver(g)
                self.gozlemci = nil
            }
        }

        Function("vakitlerKaydet") { (json: String) in
            SiriDeposu.varsayilan.cizelgeyiYaz(json)
        }

        Function("kilinanlarKaydet") { (json: String) in
            SiriDeposu.varsayilan.kilinanlariYaz(json)
        }

        AsyncFunction("bekleyenleriAl") { () -> String in
            return SiriDeposu.varsayilan.bekleyenleriJson()
        }

        AsyncFunction("tamamlandi") { (id: String) in
            SiriDeposu.varsayilan.tamamlandi(id)
        }

        AsyncFunction("basarisiz") { (id: String) in
            SiriDeposu.varsayilan.basarisiz(id)
        }

        /// Odak filtresinin son durumu (`{"sessiz":Bool,"ms":Int}`); hic calismadiysa nil.
        AsyncFunction("odakDurumuAl") { () -> String? in
            return SiriDeposu.varsayilan.odakJson()
        }

        /// Bekleyen ekran istegini TUKETIR (ör. "kible"); yoksa/bayatsa nil.
        AsyncFunction("ekranIstegiAl") { () -> String? in
            return SiriDeposu.varsayilan.ekranIstegiAl(simdiMs: SiriDeposu.simdiMs())
        }
    }
}
