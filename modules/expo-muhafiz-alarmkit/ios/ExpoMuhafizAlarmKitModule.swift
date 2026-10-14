import ExpoModulesCore
import Foundation

/**
 * Ana hedefteki AlarmKit planlayicisinin sozlesmesi (issue #74).
 *
 * NEDEN BU DOLAYLILIK: AlarmKit alarminin dugmeleri App Intents'tir (`LiveActivityIntent`)
 * ve intent metadata'si (`Metadata.appintents`) yalnizca intent'i derleyen HEDEF icin
 * cikarilir — bir pod (statik kutuphane) icindeki intent'i sistem goremez, dugmeye
 * basildiginda calistiramazdi (Siri deseni, `plugins/withSiriKisayollari.js`). Alarm
 * yapilandirmasi intent ornekleri ister → AlarmKit cagrilari da intent'lerle birlikte
 * ANA HEDEFTE durur (`targets/muhafiz-alarmkit/`). Pod ana hedefi import EDEMEZ; sinifi
 * Objective-C calisma zamaninda adiyla bulur (`@objc(NamazAlarmPlanlayici)`).
 *
 * Sinif yoksa (plugin'siz eski build) ya da iOS < 26 ise her sey "desteklenmiyor"dur ve
 * JS alarm adimini bugunku yoldan (zamana duyarli bildirim + uzun ses) teslim eder.
 */
@objc public protocol MuhafizAlarmPlanlayicisi: NSObjectProtocol {
    init()
    /// "desteklenmiyor" | "belirsiz" | "izinli" | "reddedildi" (JS `AlarmKitDurumu`).
    func durum() -> String
    func izinIste(_ tamam: @escaping (String) -> Void)
    /// `AlarmKaydi` JSON'u; kuruldu mu.
    func planla(_ kayitJson: String, _ tamam: @escaping (Bool) -> Void)
    /// `calaniDurdur == false` (planlama turu): o an CALAN (`alerting`) alarm ATLANIR.
    /// Yalniz "Kildim" `true` gecer ve calani da susturur (`AlarmKurallari.iptalSecimi`).
    func iptalEt(_ kimlikler: [String], _ calaniDurdur: Bool, _ tamam: @escaping () -> Void)
    /// Sistemde HALA kurulu alarmlarin UUID'leri (okunamazsa `nil`, kayit budanmaz) ve
    /// bunlardan o an CALANLARIN UUID'leri.
    func canliUuidler(_ tamam: @escaping ([String]?, [String]) -> Void)
}

/// Ana hedefteki intent'ler JS'e haber verir (uygulama aciksa): `["tur": "ertele"|"kildim"]`.
public enum MuhafizAlarmOlaylari {
    public static let degisiklik = Notification.Name("NamazAkisiAlarmDegisikligi")

    public static func duyur(_ tur: String) {
        NotificationCenter.default.post(name: degisiklik, object: nil, userInfo: ["tur": tur])
    }
}

public class ExpoMuhafizAlarmKitModule: Module {
    private var gozlemci: NSObjectProtocol?

    static func planlayici() -> MuhafizAlarmPlanlayicisi? {
        guard let sinif = NSClassFromString("NamazAlarmPlanlayici") as? MuhafizAlarmPlanlayicisi.Type else {
            return nil
        }
        return sinif.init()
    }

    public func definition() -> ModuleDefinition {
        Name("ExpoMuhafizAlarmKit")

        Events("onAlarmDegisikligi")

        OnCreate {
            self.gozlemci = NotificationCenter.default.addObserver(
                forName: MuhafizAlarmOlaylari.degisiklik,
                object: nil,
                queue: nil
            ) { [weak self] bildirim in
                let tur = (bildirim.userInfo?["tur"] as? String) ?? ""
                self?.sendEvent("onAlarmDegisikligi", ["tur": tur])
            }
        }

        OnDestroy {
            if let g = self.gozlemci {
                NotificationCenter.default.removeObserver(g)
                self.gozlemci = nil
            }
        }

        AsyncFunction("durum") { () -> String in
            return ExpoMuhafizAlarmKitModule.planlayici()?.durum() ?? "desteklenmiyor"
        }

        AsyncFunction("izinIste") { (promise: Promise) in
            guard let p = ExpoMuhafizAlarmKitModule.planlayici() else {
                promise.resolve("desteklenmiyor")
                return
            }
            p.izinIste { promise.resolve($0) }
        }

        AsyncFunction("planla") { (json: String, promise: Promise) in
            guard let p = ExpoMuhafizAlarmKitModule.planlayici() else {
                promise.resolve(false)
                return
            }
            p.planla(json) { promise.resolve($0) }
        }

        AsyncFunction("iptalEt") { (kimlikler: [String], calaniDurdur: Bool, promise: Promise) in
            guard let p = ExpoMuhafizAlarmKitModule.planlayici(), !kimlikler.isEmpty else {
                AlarmDeposu.varsayilan.sil(kimlikler)
                promise.resolve(nil)
                return
            }
            p.iptalEt(kimlikler, calaniDurdur) { promise.resolve(nil) }
        }

        /// Sistemde HALA kurulu alarmlarin kaydi (`[{kimlik, tetikMs, caliyor?}]` JSON).
        AsyncFunction("kayitlar") { (promise: Promise) in
            guard let p = ExpoMuhafizAlarmKitModule.planlayici() else {
                promise.resolve(AlarmDeposu.listeJson(AlarmDeposu.varsayilan.kayitlar()))
                return
            }
            p.canliUuidler { uuidler, calanlar in
                let kalan = AlarmDeposu.varsayilan.buda(canliUuidler: uuidler.map { Set($0) })
                promise.resolve(AlarmDeposu.listeJson(kalan, calanUuidler: Set(calanlar)))
            }
        }
    }
}
