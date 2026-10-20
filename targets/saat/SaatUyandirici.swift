import Foundation
import WatchKit

// BILEKTE SESSIZ UYANDIRMA (#285 cilasi, Wear W3 ikizi) — `WKExtendedRuntimeSession`
// akilli alarm oturumu. Ses YOK, yalniz titresim; kullanici "Kildim" ya da "Kapat" der.
// ERTELE YOK (sahip karari 2026-10-19).
//
// watchOS SINIRLARI (Apple "Using extended runtime sessions"; hepsi belgede yazili):
//  - Oturum YALNIZ uygulama etkinken (`.active`) kurulabilir, en fazla 36 sa ileri ve
//    ayni anda TEK oturum. → `kur()` acilista, one gelislerde ve Kildim/Kapat sonrasi
//    calisir; yuk arka planda gelse de oturum o an KURULAMAZ. Kullanici saat uygulamasini
//    hic acmazsa telefonun +3 dk yedegi calar (iPhone `uyandirmaTelefonMs`).
//  - Sistem uygulamayi yeniden baslatinca `handle(_:)` cagrilir; delege orada atanmazsa
//    oturum biter (`NamazSaatUygulamaDelegesi`).
//  - Oturum basladiginda haptik calinmazsa sistem uyari gosterip oturumlari kapatmayi
//    onerir → oturum basladiysa DAIMA en az bir haptik calinir. Saat sarjdayken de calar:
//    bilekte degildir, kimse kapatmaz, telefonun yedegi esas olur (Wear'daki "sarjda
//    calma" kuralinin iOS karsiligi yedek mekanizmasidir).
//  - Uygulama etkin degilken haptik sistemin alarm uyarisini acar ("Durdur" / "Ac").
//    "Durdur" oturumu bitirir → biz bitirmediysek kullanici kapatti sayilir.
final class SaatUyandirici: NSObject, ObservableObject, WKExtendedRuntimeSessionDelegate, @unchecked Sendable {
    static let paylasilan = SaatUyandirici()

    /// O an titreyen uyandirma (uyandirma ekrani bunu gosterir).
    @Published private(set) var calan: SaatUyandirmaKaydi?
    /// Kurulu (zamanlanmis) siradaki uyandirma — ana ekran "Uyandırma 05:12" der.
    @Published private(set) var kurulu: SaatUyandirmaKaydi?

    private var oturum: WKExtendedRuntimeSession?
    private var kuruluId: String?
    /// Oturumu biz mi bitirdik (Kildim/Kapat/2 dk)? Degilse sistemin "Durdur"u.
    private var kendimizBitirdik = false
    private var calmaBaslangici: Date?

    /// Siradaki uyandirmayi kurar (gerekirse oncekini birakir). YALNIZ uygulama etkinken.
    func kur() {
        DispatchQueue.main.async { self.kurAnaIs() }
    }

    /// Sistem uygulamayi zamanlanmis oturum icin baslatti.
    /// Delege `handle(_:)` icinde ESZAMANLI atanir (atanmazsa sistem oturumu bitirir).
    func devral(_ o: WKExtendedRuntimeSession) {
        o.delegate = self
        oturum = o
    }

    /// Uyandirma ekranindan: farz/teheccud "Kildim".
    func kildim() {
        guard let kayit = calan else { return }
        let depo = SaatDeposu.varsayilan
        if let yuk = depo.yuk() {
            var kume: [String: Int64] = [:]
            for id in SaatUyandirmaKarari.kildimKapsami(yuk: yuk, kayit: kayit) {
                kume[id] = yuk.uyandirma.first { $0.id == id }?.sonMs ?? kayit.sonMs
            }
            depo.uyandirmalariKapat(kume, simdiMs: SaatDeposu.simdiMs())
        }
        if !kayit.nafile {
            // Sabah farzi: ortak Kildim kuyruguna (telefon kaydi yazar).
            SaatBaglantisi.paylasilan.kildimKayit(tarih: kayit.tarih, vakit: "imsak")
        }
        SaatBaglantisi.paylasilan.uyandirmaCevabi(kayit, islem: "kildim")
        bitir()
        WKInterfaceDevice.current().play(.success)
    }

    /// Uyandirma ekranindan: uyandim, kapat (telefonun yedegi de iptal edilir).
    func kapat() {
        guard let kayit = calan else { return }
        SaatDeposu.varsayilan.uyandirmalariKapat([kayit.id: kayit.sonMs], simdiMs: SaatDeposu.simdiMs())
        SaatBaglantisi.paylasilan.uyandirmaCevabi(kayit, islem: "kapat")
        bitir()
    }

    // MARK: - Ic

    private func kurAnaIs() {
        guard WKApplication.shared().applicationState == .active else { return }
        let depo = SaatDeposu.varsayilan
        let simdi = SaatDeposu.simdiMs()
        let hedef = depo.yuk().flatMap {
            SaatUyandirmaKarari.siradaki(
                yuk: $0, bekleyenler: depo.bekleyenler(), kapatilan: depo.kapatilanUyandirmalar(simdiMs: simdi), simdiMs: simdi
            )
        }
        if let o = oturum {
            switch o.state {
            case .running:
                return // calan alarm planlama yuzunden kesilmez
            case .scheduled:
                if kuruluId == hedef?.id { return }
                kendimizBitirdik = true
                o.invalidate()
            default:
                break
            }
            oturum = nil
        }
        kuruluId = nil
        kurulu = nil
        guard let hedef else { return }
        let yeni = WKExtendedRuntimeSession()
        yeni.delegate = self
        yeni.start(at: SaatDeposu.tarih(hedef.ms))
        oturum = yeni
        kuruluId = hedef.id
        kurulu = hedef
        kendimizBitirdik = false
    }

    private func bitir() {
        DispatchQueue.main.async {
            self.kendimizBitirdik = true
            self.oturum?.invalidate()
            self.calan = nil
            self.kur()
        }
    }

    // MARK: - WKExtendedRuntimeSessionDelegate

    func extendedRuntimeSessionDidStart(_ extendedRuntimeSession: WKExtendedRuntimeSession) {
        let depo = SaatDeposu.varsayilan
        let simdi = SaatDeposu.simdiMs()
        let kayit = depo.yuk().flatMap {
            SaatUyandirmaKarari.calacak(
                yuk: $0, bekleyenler: depo.bekleyenler(), kapatilan: depo.kapatilanUyandirmalar(simdiMs: simdi), simdiMs: simdi
            )
        }
        DispatchQueue.main.async {
            self.calan = kayit
            self.calmaBaslangici = Date()
            self.kendimizBitirdik = false
        }
        guard kayit != nil else {
            // Bu arada kilindi/kapatildi: sistem "haptik calmadi" uyarisi vermesin diye TEK
            // kisa haptik, sonra biter (telefonun yedegi zaten iptal ya da gerekli degil).
            extendedRuntimeSession.notifyUser(hapticType: .click) { _ in 60 }
            DispatchQueue.main.async {
                self.kendimizBitirdik = true
                extendedRuntimeSession.invalidate()
            }
            return
        }
        extendedRuntimeSession.notifyUser(hapticType: .notification) { [weak self] sonraki in
            sonraki.pointee = .notification
            guard let self, let bas = self.calmaBaslangici else { return 2 }
            // En cok 2 dk: sonra telefonun yedegi esas olur.
            if Date().timeIntervalSince(bas) * 1000 >= Double(SaatUyandirmaKarari.calmaSuresiMs) {
                DispatchQueue.main.async {
                    self.kendimizBitirdik = true
                    self.oturum?.invalidate()
                    self.calan = nil
                }
                return 60
            }
            return 2
        }
    }

    func extendedRuntimeSessionWillExpire(_ extendedRuntimeSession: WKExtendedRuntimeSession) {}

    func extendedRuntimeSession(
        _ extendedRuntimeSession: WKExtendedRuntimeSession,
        didInvalidateWith reason: WKExtendedRuntimeSessionInvalidationReason,
        error: Error?
    ) {
        DispatchQueue.main.async {
            if extendedRuntimeSession === self.oturum { self.oturum = nil }
            // Sistemin "Durdur"u: kullanici uyandi → telefonun yedegi de susmali.
            if !self.kendimizBitirdik, let kayit = self.calan {
                SaatDeposu.varsayilan.uyandirmalariKapat([kayit.id: kayit.sonMs], simdiMs: SaatDeposu.simdiMs())
                SaatBaglantisi.paylasilan.uyandirmaCevabi(kayit, islem: "kapat")
            }
            self.calan = nil
            self.kuruluId = nil
            self.kurulu = nil
            self.kendimizBitirdik = false
            if let error { NSLog("[NamazSaat] Uyandirma oturumu bitti: %@", error.localizedDescription) }
        }
    }
}

/// Sistem zamanlanmis akilli alarm oturumu icin uygulamayi baslatinca burasi cagrilir.
final class NamazSaatUygulamaDelegesi: NSObject, WKApplicationDelegate {
    func applicationDidFinishLaunching() {
        SaatHatirlatici.paylasilan.baslat()
    }

    func handle(_ extendedRuntimeSession: WKExtendedRuntimeSession) {
        SaatUyandirici.paylasilan.devral(extendedRuntimeSession)
    }
}
