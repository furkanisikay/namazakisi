import ExpoModulesCore
import Foundation

/**
 * SIRI / KISAYOLLAR / ODAK — JS koprusu (issue #279).
 *
 * App Intents'in kendisi BU MODULDE DEGIL, ana uygulama hedefindedir
 * (`targets/siri-kisayollari/` altindaki Swift dosyalari, `plugins/withSiriKisayollari.js` kopyalar).
 * Sebep: App Intents metadata'si (`Metadata.appintents`) yalnizca intent'i derleyen
 * HEDEF icin cikarilir; bir pod (statik kutuphane) icindeki intent'ler sisteme
 * gorunmez. Intent'ler bu modulun `SiriDeposu`'nu `import ExpoSiriKisayollari` ile
 * kullanir → ayni surec, ayni kilit, ayni `UserDefaults`.
 *
 * Fonksiyon adlari BILINCLI OLARAK Android modulleriyle aynidir:
 *   - `vakitlerKaydet` / `kilinanlarKaydet` ← Android `WidgetVeri` (WidgetServisi aynen kullanir)
 *   - `bekleyenleriAl` / `tamamlandi` / `basarisiz` ← Android `KildimKuyrugu`
 *     (KildimKuyruguServisi aynen kullanir)
 *
 * iOS widget uzantisi ve canli etkinlik (#295) ayni depoyu (App Group) ve ayni yuku
 * kullanir; `canliEtkinlik*` fonksiyonlari `CanliEtkinlikKoprusu`'na devreder.
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

        // Widget (#295) ayni yukten beslenir: her yazimdan sonra zaman cizelgeleri tazelenir.
        Function("vakitlerKaydet") { (json: String) in
            SiriDeposu.varsayilan.cizelgeyiYaz(json)
            CanliEtkinlikKoprusu.widgetlariTazele()
        }

        Function("kilinanlarKaydet") { (json: String) in
            SiriDeposu.varsayilan.kilinanlariYaz(json)
            CanliEtkinlikKoprusu.widgetlariTazele()
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

        /// Canli etkinlik (Live Activity, #295) bu build'de var mi? (Widget uzantisi bayragi.)
        Function("canliEtkinlikDestekli") { () -> Bool in
            return CanliEtkinlikKoprusu.destekleniyor
        }

        /// Kullanici Ayarlar'dan canli etkinlikleri kapatmis mi?
        AsyncFunction("canliEtkinlikIzniAcik") { () -> Bool in
            return CanliEtkinlikKoprusu.izinAcik()
        }

        /// Mevcut canli etkinlikleri ISTENENE esitler (nil = hicbiri). Sonuc kodu doner.
        AsyncFunction("canliEtkinlikEsitle") { (json: String?) async -> String in
            return await CanliEtkinlikKoprusu.esitle(json: json)
        }

        /// Bekleyen ekran istegini TUKETIR (ör. "kible"); yoksa/bayatsa nil.
        AsyncFunction("ekranIstegiAl") { () -> String? in
            return SiriDeposu.varsayilan.ekranIstegiAl(simdiMs: SiriDeposu.simdiMs())
        }
    }
}
