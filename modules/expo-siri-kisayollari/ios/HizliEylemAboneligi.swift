import ExpoModulesCore
import UIKit

/**
 * Uygulama simgesi HIZLI EYLEMLERI (simgeye basili tutma) — Android `shortcuts.xml` ikizi.
 *
 * Eylemler statiktir (`app.json > ios.infoPlist.UIApplicationShortcutItems`); tur adi
 * `HizliEylemKarari.ekran` ile ekran istegine cevrilir ve "Kibleyi ac" intent'inin yolundan
 * gecer (`SiriDeposu.ekranIstegiYaz` → JS `useSiriEkranIstegi`). Soguk acilista da calisir:
 * Expo `didFinishLaunching`'den `true` dondugu icin sistem eylemi ayrica bu metoda verir.
 * Kayit: `expo-module.config.json > ios.appDelegateSubscribers`.
 */
public class HizliEylemAboneligi: ExpoAppDelegateSubscriber {
    public func application(
        _ application: UIApplication,
        performActionFor shortcutItem: UIApplicationShortcutItem,
        completionHandler: @escaping (Bool) -> Void
    ) {
        guard let ekran = HizliEylemKarari.ekran(shortcutItem.type) else {
            completionHandler(false)
            return
        }
        SiriDeposu.varsayilan.ekranIstegiYaz(ekran, simdiMs: SiriDeposu.simdiMs())
        completionHandler(true)
    }
}

/// Saf eşleme (Foundation): hızlı eylem türü → JS ekran isteği. Bilinmeyen tür nil.
public enum HizliEylemKarari {
    public static let kibleTuru = "com.furkanisikay.namazakisi.kible"
    public static let kildimTuru = "com.furkanisikay.namazakisi.kildim"

    public static func ekran(_ tur: String) -> String? {
        switch tur {
        case kibleTuru: return "kible"
        case kildimTuru: return "kildim"
        default: return nil
        }
    }
}
