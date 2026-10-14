import Foundation
import WatchConnectivity
import WidgetKit

// APPLE WATCH ↔ IPHONE BAGLANTISI — saat tarafi (issue #285).
//
//  - iPhone → saat: `updateApplicationContext` ("son durum"; kuyruk degil). Yuk Wear OS
//    saatine giden yukun AYNISIDIR; `SaatDeposu.yeniYukuIsle` yalniz gecerli yuku saklar.
//  - saat → iPhone: "Kildim" (`SaatIletisi.kildimIletisi`). Telefon erisilebilirse
//    `sendMessage` (iPhone uygulamasini arka planda uyandirir, aninda islenir), degilse
//    `transferUserInfo` (kuyruklu, sistem teslimi garanti eder). Telefon ayni tarih+vakit
//    iki kez gelirse kuyrukta TEK tutar.
//  - Gonderilen "Kildim" yuk onu tasiyana kadar IYIMSER gosterilir (`SaatBekleyen`).
//
// Her degisiklikten sonra komplikasyonlar tazelenir (`reloadAllTimelines`).
final class SaatBaglantisi: NSObject, ObservableObject, WCSessionDelegate, @unchecked Sendable {
    static let paylasilan = SaatBaglantisi()

    /// Gorunumleri yeniden cizdirmek icin sayac (degeri anlamsiz).
    @Published private(set) var yenileme = 0

    private let depo = SaatDeposu.varsayilan
    private let kilit = NSLock()
    /// Oturum etkinlesmeden once istenen iletiler (etkinlesince gonderilir).
    private var bekleyenIletiler: [[String: Any]] = []

    func baslat() {
        guard WCSession.isSupported() else { return }
        let oturum = WCSession.default
        if oturum.delegate !== self { oturum.delegate = self }
        if oturum.activationState != .activated { oturum.activate() }
    }

    /// Arka plan gorevi: oturum etkinlesip bekleyen teslimler bitene kadar (en cok ~10 sn).
    func bekleyenTeslimleriBekle() async {
        baslat()
        for _ in 0..<40 {
            let oturum = WCSession.default
            if oturum.activationState == .activated && !oturum.hasContentPending { break }
            try? await Task.sleep(nanoseconds: 250_000_000)
        }
    }

    /**
     * "Kildim": karar dokunus aninda YENIDEN degerlendirilir (onay penceresi acikken vakit
     * degismis olabilir — Siri ve iPhone widget'iyla ayni kural). Yalniz hala ayni vaktin
     * adayi ise isaretlenir.
     * - Returns: isaretlendi mi
     */
    @discardableResult
    func kildim(beklenen: SiriVakitAni) -> Bool {
        guard let yuk = depo.yuk() else { return false }
        let karar = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: depo.bekleyenler(), simdiMs: SaatDeposu.simdiMs()).kildim
        guard case .aday(let vakit, let kayitVakti, _) = karar, vakit == beklenen else { return false }
        let ms = SaatDeposu.simdiMs()
        depo.bekleyenEkle(SaatBekleyen(tarih: vakit.tarih, vakit: kayitVakti, ms: ms))
        gonder(SaatIletisi.kildimIletisi(tarih: vakit.tarih, vakit: kayitVakti, ms: ms))
        WidgetCenter.shared.reloadAllTimelines()
        degisti()
        return true
    }

    // MARK: - Ic

    private func gonder(_ ileti: [String: Any]) {
        let oturum = WCSession.default
        guard oturum.activationState == .activated else {
            kilit.lock()
            bekleyenIletiler.append(ileti)
            kilit.unlock()
            baslat()
            return
        }
        if oturum.isReachable {
            oturum.sendMessage(ileti, replyHandler: { _ in }, errorHandler: { _ in
                // Anlik teslim olmadi → kuyruklu teslime dus (telefon tekrar gelirse tekil tutar).
                WCSession.default.transferUserInfo(ileti)
            })
        } else {
            oturum.transferUserInfo(ileti)
        }
    }

    private func yukuIsle(_ baglam: [String: Any]) {
        guard let json = SaatIletisi.yukJson(baglam) else { return }
        if depo.yeniYukuIsle(json, simdiMs: SaatDeposu.simdiMs()) {
            WidgetCenter.shared.reloadAllTimelines()
            degisti()
        }
    }

    private func degisti() {
        DispatchQueue.main.async { self.yenileme &+= 1 }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        guard activationState == .activated else { return }
        // Uygulama kapaliyken gelmis son yuk.
        yukuIsle(session.receivedApplicationContext)
        kilit.lock()
        let iletiler = bekleyenIletiler
        bekleyenIletiler.removeAll()
        kilit.unlock()
        for ileti in iletiler { gonder(ileti) }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        yukuIsle(applicationContext)
    }
}
