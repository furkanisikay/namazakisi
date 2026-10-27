import Foundation
import UserNotifications
import WatchKit

// APPLE WATCH YEREL HATIRLATMALARI (#285 cilasi) — telefon uzaktayken bilekte uyari.
//
// Saat IKINCI MOTOR KURMAZ: kurulan her bildirim telefonun hazir planindan bir kayittir
// (`SaatYuku.plan`) ve kimligi telefondaki bildirimle BIREBIR aynidir. watchOS ayni kimlikli
// iki bildirimi tekillestirir (Apple: saat, iPhone'un ayni bildirimini bekler; gelirse
// yonlendirme kuralina gore tek cihazda gosterir, gelmezse kendisi calar). "Telefon uzakta
// mi?" tahmini bu yuzden YAPILMAZ — kural Apple'indir. Ayrinti: `SaatHatirlatmaPlani.swift`.
//
// Tazeleme: her yeni yukte, uygulama acilisinda ve "Kildim" sonrasinda (arka planda da
// calisir — bildirim kurmak etkin uygulama istemez, akilli alarmin aksine).
final class SaatHatirlatici: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    static let paylasilan = SaatHatirlatici()

    /// Telefonla AYNI kategori ve eylem kimligi (`BILDIRIM_SABITLERI`): yonlendirilen iPhone
    /// bildirimi de ayni dugmeyle gelir, bir kullanici iki farkli "Kildim" gormez.
    static let kategori = "muhafiz_category"
    static let kildimEylemi = "kildim_action"

    private let merkez = UNUserNotificationCenter.current()
    private let sira = DispatchQueue(label: "namazakisi.saat.hatirlatici")

    /// Uygulama baslarken (delege erken atanmali: bildirim eylemi uygulamayi arka planda acar).
    func baslat() {
        merkez.delegate = self
        kategorileriKur()
    }

    /// "Kildim" eyleminin etiketi arayuz dilindedir (W5); telefondan yeni dil gelince
    /// `SaatBaglantisi` yeniden kurar (kimlikler degismez).
    func kategorileriKur() {
        let baslik = VakitMetinleri.dil(SaatDili.kod).kildim
        let kildim = UNNotificationAction(identifier: Self.kildimEylemi, title: baslik, options: [])
        merkez.setNotificationCategories([
            UNNotificationCategory(identifier: Self.kategori, actions: [kildim], intentIdentifiers: [], options: []),
        ])
    }

    /// Ilk acilista izin sorulur (saatte bildirim izni telefondan ayridir).
    func izinIste() {
        // Simulator kare cekimi: izin penceresi ekrani ortmesin (cihazda acilisEkrani daima nil).
        if SaatSimulatorTohumu.acilisEkrani != nil { return }
        merkez.getNotificationSettings { ayar in
            guard ayar.authorizationStatus == .notDetermined else { return }
            self.merkez.requestAuthorization(options: [.alert, .sound]) { verildi, _ in
                if verildi { self.tazele() }
            }
        }
    }

    /// Bekleyen yerel bildirimleri plana esitler: fazlalari siler, eksikleri kurar.
    func tazele() {
        sira.async { self.esitle() }
    }

    /// Kildim: o vaktin kalan ve gosterilen bildirimleri susar.
    func vaktiSustur(tarih: String, vakit: String) {
        let onek = SaatHatirlatmaPlani.vakitOneki(tarih: tarih, vakit: vakit)
        merkez.getPendingNotificationRequests { bekleyen in
            let ids = bekleyen.map { $0.identifier }.filter { $0.hasPrefix(onek) }
            if !ids.isEmpty { self.merkez.removePendingNotificationRequests(withIdentifiers: ids) }
        }
        merkez.getDeliveredNotifications { gosterilen in
            let ids = gosterilen.map { $0.request.identifier }.filter { $0.hasPrefix(onek) }
            if !ids.isEmpty { self.merkez.removeDeliveredNotifications(withIdentifiers: ids) }
        }
    }

    // MARK: - Ic

    private func esitle() {
        let depo = SaatDeposu.varsayilan
        let secilen: [SaatPlanKaydi]
        if let yuk = depo.yuk() {
            secilen = SaatHatirlatmaPlani.bildirimler(yuk: yuk, bekleyenler: depo.bekleyenler(), simdiMs: SaatDeposu.simdiMs())
        } else {
            secilen = []
        }
        let istenen = Dictionary(secilen.map { ($0.id, $0) }, uniquingKeysWith: { ilk, _ in ilk })
        let bitti = DispatchSemaphore(value: 0)
        merkez.getPendingNotificationRequests { bekleyen in
            let bizim = bekleyen.filter { $0.identifier.hasPrefix(SaatHatirlatmaPlani.kimlikOneki) }
            let mevcut = Set(bizim.map { $0.identifier })
            let silinecek = bizim.map { $0.identifier }.filter { istenen[$0] == nil }
            if !silinecek.isEmpty { self.merkez.removePendingNotificationRequests(withIdentifiers: silinecek) }
            for kayit in secilen where !mevcut.contains(kayit.id) {
                self.merkez.add(Self.istek(kayit)) { hata in
                    if let hata { NSLog("[NamazSaat] Hatirlatma kurulamadi: %@", hata.localizedDescription) }
                }
            }
            bitti.signal()
        }
        _ = bitti.wait(timeout: .now() + 10)
    }

    private static func istek(_ k: SaatPlanKaydi) -> UNNotificationRequest {
        let icerik = UNMutableNotificationContent()
        icerik.title = k.baslik
        icerik.body = k.govde
        icerik.sound = .default
        icerik.categoryIdentifier = kategori
        icerik.threadIdentifier = SaatHatirlatmaPlani.vakitOneki(tarih: k.tarih, vakit: k.vakit)
        icerik.userInfo = ["tip": "muhafiz", "tarih": k.tarih, "vakit": k.vakit]
        // Zamana duyarli seviye saat hedefinde ayri yetki (entitlement) ister; sert/acil ton
        // yine de bilekte normal bildirim olarak gelir (telefondaki ayni kayit Odak'i deler).
        icerik.interruptionLevel = .active
        let an = SaatDeposu.tarih(k.ms)
        let bilesenler = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: an)
        let tetik = UNCalendarNotificationTrigger(dateMatching: bilesenler, repeats: false)
        return UNNotificationRequest(identifier: k.id, content: icerik, trigger: tetik)
    }

    // MARK: - UNUserNotificationCenterDelegate

    /// Uygulama acikken gelen hatirlatma da gorunsun.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }

    /// Saatin KENDI bildirimindeki "Kildim" (yonlendirilen iPhone bildiriminin dugmesi
    /// iPhone uygulamasinda islenir). Vakit kimlikten degil bildirimin yukunden okunur.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        defer { completionHandler() }
        guard response.actionIdentifier == Self.kildimEylemi else { return }
        let bilgi = response.notification.request.content.userInfo
        guard let tarih = bilgi["tarih"] as? String, let vakit = bilgi["vakit"] as? String else { return }
        if SaatBaglantisi.paylasilan.kildimKayit(tarih: tarih, vakit: vakit) {
            WKInterfaceDevice.current().play(.success)
        }
    }
}
