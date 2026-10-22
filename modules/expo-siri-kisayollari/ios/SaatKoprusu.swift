import Foundation
import UserNotifications
import WatchConnectivity

/**
 * APPLE WATCH BAGLANTISI — telefon tarafi (issue #285).
 *
 * YALNIZ saat hedefini tasiyan build'de calisir: `plugins/withNamazSaat.js` ana uygulamanin
 * Info.plist'ine `NamazSaatUygulamasi = YES` yazar; anahtar yoksa (bayrak kapali, bugunku
 * TestFlight hatti) oturum HIC etkinlestirilmez ve her cagri `saatYok` doner.
 *
 *  - Telefon → saat: JS `WearSenkronServisi` Wear OS saatine giden yukun AYNISINI
 *    (`durumGonder`) buraya verir; `updateApplicationContext` ile "son durum" olarak
 *    gider (kuyruk degil — saat yalniz en yenisini gorur). Son yuk bellekte tutulur ve
 *    oturum etkinlesince / saat uygulamasi sonradan kurulunca kendiliginden gonderilir.
 *  - Saat → telefon: "Kildim" iletisi (`SaatIletisi`) ortak kuyruga yazilir
 *    (`SiriDeposu.kildimEkle`, kaynak `saat`) → JS `onSiriDegisikligi('kildim')` ya da
 *    acilista bosaltir. JS calismasa da kuyruga yazmak YETER (kalicidir).
 *
 * Oturum uygulama ACILIR ACILMAZ etkinlestirilir (`SaatAppDelegateAboneligi`): saatten
 * gelen ileti iPhone uygulamasini arka planda baslatabilir ve JS yuklenmeden once teslim
 * edilir; delege o anda hazir olmalidir.
 */
public final class SaatKoprusu: NSObject, WCSessionDelegate, @unchecked Sendable {
    public static let paylasilan = SaatKoprusu()

    /// Ana uygulamanin Info.plist anahtari (saat hedefi bu build'de var mi?).
    public static let plistAnahtari = "NamazSaatUygulamasi"

    private let kilit = NSLock()
    private var sonYuk: String?
    private var basladi = false

    /// Bu build saat uygulamasini tasiyor ve cihaz WatchConnectivity destekliyor mu?
    public static var destekleniyor: Bool {
        guard (Bundle.main.object(forInfoDictionaryKey: plistAnahtari) as? Bool) == true else { return false }
        return WCSession.isSupported()
    }

    /// Idempotent: oturumu bir kez etkinlestirir.
    public func baslat() {
        guard Self.destekleniyor else { return }
        let baslatilacak: Bool = kilitli {
            if basladi { return false }
            basladi = true
            return true
        }
        guard baslatilacak else { return }
        let oturum = WCSession.default
        oturum.delegate = self
        oturum.activate()
    }

    /**
     * JS: Wear yukunu saate gonderir. Sonuc kodu:
     * `gonderildi` | `bekliyor` (oturum henuz etkin degil; etkinlesince gider) |
     * `saatYok` (eslesmis saat ya da saatte uygulama yok; kurulunca gider) | `hata`.
     */
    public func durumGonder(_ json: String) -> String {
        guard Self.destekleniyor else { return "saatYok" }
        baslat()
        kilitli { sonYuk = json }
        return gonderilebilirseGonder()
    }

    // MARK: - Ic

    private func gonderilebilirseGonder() -> String {
        let oturum = WCSession.default
        guard oturum.activationState == .activated else { return "bekliyor" }
        guard oturum.isPaired, oturum.isWatchAppInstalled else { return "saatYok" }
        guard let json: String = kilitli({ sonYuk }) else { return "bekliyor" }
        do {
            try oturum.updateApplicationContext(SaatIletisi.baglam(yukJson: json))
            return "gonderildi"
        } catch {
            NSLog("[NamazSaat] Saate durum gonderilemedi: %@", error.localizedDescription)
            return "hata"
        }
    }

    private func iletiyiIsle(_ ileti: [String: Any]) {
        if let u = SaatIletisi.uyandirmaCoz(ileti) {
            uyandirmaIsle(u)
            return
        }
        guard let kildim = SaatIletisi.kildimCoz(ileti) else { return }
        SiriDeposu.varsayilan.kildimEkle(
            tarih: kildim.tarih,
            vakit: kildim.vakit,
            kaynak: SaatIletisi.kaynak,
            simdiMs: SiriDeposu.simdiMs()
        )
    }

    /**
     * Saat sessiz uyandirmayi kapatti / Kildim dedi (#285 cilasi): telefonun YEDEGI
     * (+3 dk sonraya kurulmus bildirim ya da AlarmKit alarmi) JS'i beklemeden iptal edilir
     * ve kayit kalici yazilir (sonraki planlama turu ayni kimligi YENIDEN kurmasin).
     * Teheccud "Kildim"i farz kuyruguna ASLA girmez — nafile susturma hafizasina.
     */
    private func uyandirmaIsle(_ u: SaatIletisi.Uyandirma) {
        let depo = SiriDeposu.varsayilan
        depo.saatUyandirmaYaz(id: u.id, sonMs: u.sonMs, simdiMs: SiriDeposu.simdiMs())
        if u.islem == "kildim" && u.tur == "teheccud" {
            depo.saatNafileKildimEkle(tarih: u.tarih, tur: "teheccud")
        }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [u.id])
        SaatKoprusu.alarmKitYedeginiIptalEt(u.id)
        depo.saatUyandirmaDuyur()
    }

    /**
     * AlarmKit yedegi ana hedefteki `NamazAlarmPlanlayici`'dadir; bu pod onu import EDEMEZ
     * (ExpoMuhafizAlarmKit deseni). Objective-C calisma zamaninda adiyla bulunur ve
     * `iptalEt(_:_:_:)` (`MuhafizAlarmPlanlayicisi` sozlesmesi) secicisi cagrilir; sinif
     * ya da secici yoksa (eski build, iOS < 26) sessizce gecilir — JS planlama turu
     * kaydi okuyup alarmi yine kaldirir.
     */
    static func alarmKitYedeginiIptalEt(_ id: String) {
        guard let sinif = NSClassFromString("NamazAlarmPlanlayici") as? NSObject.Type else { return }
        let nesne = sinif.init()
        let secici = NSSelectorFromString("iptalEt:::")
        guard nesne.responds(to: secici), let imp = nesne.method(for: secici) else { return }
        typealias Iptal = @convention(c) (AnyObject, Selector, NSArray, Bool, @escaping @convention(block) () -> Void) -> Void
        let cagri = unsafeBitCast(imp, to: Iptal.self)
        // calaniDurdur = true: saatte kapatilan uyandirmanin telefon alarmi CALIYORSA da sussun.
        cagri(nesne, secici, [id] as NSArray, true, {})
    }

    // MARK: - WCSessionDelegate

    public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if activationState == .activated { _ = gonderilebilirseGonder() }
    }

    public func sessionDidBecomeInactive(_ session: WCSession) {}

    /// Kullanici baska bir saate gecti: yeni saat icin oturum yeniden etkinlestirilir (Apple belgesi).
    public func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }

    /// Saat uygulamasi sonradan kuruldu / eslesme degisti → son yuk hemen gitsin.
    public func sessionWatchStateDidChange(_ session: WCSession) {
        _ = gonderilebilirseGonder()
    }

    /// Kuyruklu teslim (`transferUserInfo`) — saat erisilemezken gonderilen "Kildim".
    public func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
        iletiyiIsle(userInfo)
    }

    /// Anlik teslim (`sendMessage`, yanitsiz).
    public func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        iletiyiIsle(message)
    }

    /// Anlik teslim (`sendMessage`, yanitli): saat teslimi dogrulasin diye bos yanit.
    public func session(
        _ session: WCSession,
        didReceiveMessage message: [String: Any],
        replyHandler: @escaping ([String: Any]) -> Void
    ) {
        iletiyiIsle(message)
        replyHandler(["tamam": SaatIletisi.kildimCoz(message) != nil || SaatIletisi.uyandirmaCoz(message) != nil])
    }

    private func kilitli<T>(_ blok: () -> T) -> T {
        kilit.lock()
        defer { kilit.unlock() }
        return blok()
    }
}
