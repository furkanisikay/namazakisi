import ExpoModulesCore
import UIKit

/**
 * Apple Watch oturumunu uygulama ACILIR ACILMAZ etkinlestirir (issue #285).
 *
 * Saatten gelen "Kildim" iletisi iPhone uygulamasini arka planda baslatabilir; ileti
 * JS (ve dolayisiyla Expo modulu) yuklenmeden teslim edilir, delege o anda hazir
 * olmalidir. Info.plist anahtari yoksa (saat bayragi kapali) `baslat()` hicbir sey yapmaz.
 * Kayit: `expo-module.config.json > ios.appDelegateSubscribers`.
 */
public class SaatAppDelegateAboneligi: ExpoAppDelegateSubscriber {
    public func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        SaatKoprusu.paylasilan.baslat()
        return true
    }
}
