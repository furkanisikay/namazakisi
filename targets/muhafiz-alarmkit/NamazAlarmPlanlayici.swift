import Foundation
import UserNotifications
import ExpoMuhafizAlarmKit
import ExpoSiriKisayollari
#if canImport(AlarmKit)
import ActivityKit
import AlarmKit
import AppIntents
import SwiftUI
#endif

// MUHAFIZ GERCEK ALARMI — iOS 26 AlarmKit (issue #74).
//
// Bu dosya ANA UYGULAMA HEDEFINE derlenir (`plugins/withMuhafizAlarmKit.js` prebuild'de
// `ios/<Proje>/` altina kopyalar). Alarm dugmeleri App Intents'tir ve intent metadata'si
// yalniz intent'i derleyen hedef icin cikarilir; yapilandirma intent ornekleri istedigi
// icin AlarmKit cagrilari da burada durur. Pod (`ExpoMuhafizAlarmKit`) bu sinifi adiyla
// bulur (`@objc(NamazAlarmPlanlayici)`, `MuhafizAlarmPlanlayicisi` sozlesmesi).
//
// Dagitim hedefi iOS 15.1: AlarmKit/ActivityKit/AppIntents ZAYIF baglanir (plugin) ve her
// AlarmKit dokunusu `#available(iOS 26.0, *)` ardindadir. Eski sistemde sinif vardir ama
// "desteklenmiyor" der → JS alarm adimini zamana duyarli bildirim + uzun sesle teslim eder.

@objc(NamazAlarmPlanlayici)
final class NamazAlarmPlanlayici: NSObject, MuhafizAlarmPlanlayicisi {
    required override init() {
        super.init()
    }

    func durum() -> String {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            return NamazAlarmCekirdegi.durum()
        }
        #endif
        return "desteklenmiyor"
    }

    func izinIste(_ tamam: @escaping (String) -> Void) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            Task { tamam(await NamazAlarmCekirdegi.izinIste()) }
            return
        }
        #endif
        tamam("desteklenmiyor")
    }

    func planla(_ kayitJson: String, _ tamam: @escaping (Bool) -> Void) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *), let kayit = AlarmKaydi.coz(kayitJson) {
            Task { tamam(await NamazAlarmCekirdegi.planla(kayit)) }
            return
        }
        #endif
        tamam(false)
    }

    func iptalEt(_ kimlikler: [String], _ tamam: @escaping () -> Void) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            NamazAlarmCekirdegi.iptalEt(kimlikler)
            tamam()
            return
        }
        #endif
        AlarmDeposu.varsayilan.sil(kimlikler)
        tamam()
    }

    func canliUuidler(_ tamam: @escaping ([String]?) -> Void) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            tamam(NamazAlarmCekirdegi.canliUuidler())
            return
        }
        #endif
        tamam([])
    }
}

#if canImport(AlarmKit)

/// Alarm meta verisi (AlarmKit `AlarmAttributes` ister). Yalniz kimlik tasir; ayrintilar
/// `AlarmDeposu` kaydindadir.
@available(iOS 26.0, *)
struct NamazAlarmVerisi: AlarmMetadata {
    var kimlik: String
}

@available(iOS 26.0, *)
enum NamazAlarmCekirdegi {
    /// Uygulamanin yesil tonu (tema `birincil`, #4CAF50) — alarm ekraninda uygulamayi tanitir.
    static let renk = Color(red: 0.298, green: 0.686, blue: 0.314)

    static func simdiMs() -> Int64 {
        return Int64((Date().timeIntervalSince1970 * 1000).rounded())
    }

    static func durum() -> String {
        switch AlarmManager.shared.authorizationState {
        case .authorized: return "izinli"
        case .denied: return "reddedildi"
        case .notDetermined: return "belirsiz"
        @unknown default: return "desteklenmiyor"
        }
    }

    static func izinIste() async -> String {
        do {
            _ = try await AlarmManager.shared.requestAuthorization()
        } catch {
            // Hata = durum degismedi; asagida okunur.
        }
        return durum()
    }

    /// Alarmi kurar. Ayni kimlik yeniden planlanirsa ONCEKININ yerine gecer (ayni UUID).
    static func planla(_ kayit: AlarmKaydi) async -> Bool {
        guard AlarmManager.shared.authorizationState == .authorized else { return false }
        // Gecmis/hemen simdiki tetik kurulmaz (JS de gecmisi elerdi).
        guard kayit.tetikMs > simdiMs() + 1_000 else { return false }

        let id = AlarmKurallari.uuid(kayit.kimlik)
        try? AlarmManager.shared.cancel(id: id)

        // Durdurma dugmesini SISTEM cizer (iOS 26.1+ etiketi degistirilemez) → durdurmak
        // namazi KILINDI SAYMAZ. Ikinci dugme: sinira yer varsa "10 dk ertele", yoksa
        // "Kildim" (bildirimdeki kuralla ayni — `AlarmKurallari.ikincilDugme`).
        let erteleMi = AlarmKurallari.ikincilDugme(tetikMs: kayit.tetikMs, erteleSinirMs: kayit.erteleSinirMs) == "ertele"
        let ikinciDugme = erteleMi
            ? AlarmButton(text: "10 dk ertele", textColor: .white, systemImageName: "clock.arrow.circlepath")
            : AlarmButton(text: "Kıldım", textColor: .white, systemImageName: "checkmark")
        let alert = AlarmPresentation.Alert(
            title: LocalizedStringResource(stringLiteral: kayit.baslik),
            stopButton: AlarmButton(text: "Durdur", textColor: .white, systemImageName: "stop.fill"),
            secondaryButton: ikinciDugme,
            secondaryButtonBehavior: .custom
        )
        let nitelikler = AlarmAttributes<NamazAlarmVerisi>(
            presentation: AlarmPresentation(alert: alert),
            metadata: NamazAlarmVerisi(kimlik: kayit.kimlik),
            tintColor: renk
        )
        let ikinciNiyet: any LiveActivityIntent = erteleMi
            ? NamazAlarmErteleIntent(kimlik: kayit.kimlik)
            : NamazAlarmKildimIntent(kimlik: kayit.kimlik)
        let tarih = Date(timeIntervalSince1970: TimeInterval(kayit.tetikMs) / 1000)
        let yapilandirma = AlarmManager.AlarmConfiguration<NamazAlarmVerisi>.alarm(
            schedule: .fixed(tarih),
            attributes: nitelikler,
            stopIntent: NamazAlarmDurdurIntent(kimlik: kayit.kimlik),
            secondaryIntent: ikinciNiyet,
            sound: .default
        )
        do {
            _ = try await AlarmManager.shared.schedule(id: id, configuration: yapilandirma)
            AlarmDeposu.varsayilan.yaz(kayit)
            return true
        } catch {
            NSLog("%@", "[NamazAlarm] Alarm kurulamadi \(kayit.kimlik): \(error)")
            return false
        }
    }

    static func iptalEt(_ kimlikler: [String]) {
        for kimlik in kimlikler {
            try? AlarmManager.shared.cancel(id: AlarmKurallari.uuid(kimlik))
        }
        AlarmDeposu.varsayilan.sil(kimlikler)
    }

    static func canliUuidler() -> [String]? {
        guard let alarmlar = try? AlarmManager.shared.alarms else { return nil }
        return alarmlar.map { $0.id.uuidString.lowercased() }
    }

    /// Calan alarmi susturur ve kaydini dusurur (durdur / ertele / kildim ortak ilk adim).
    static func kapat(_ kimlik: String) -> AlarmKaydi? {
        let id = AlarmKurallari.uuid(kimlik)
        try? AlarmManager.shared.stop(id: id)
        try? AlarmManager.shared.cancel(id: id)
        let kayit = AlarmDeposu.varsayilan.kayit(kimlik)
        AlarmDeposu.varsayilan.sil([kimlik])
        return kayit
    }

    /// "10 dk ertele" (issue #289 kurallari): sinira kadar TEK bir yeni alarm; o ana
    /// kadarki planli uyarilar (alarm + bildirim) susar. JS etkin ertelemeyi alarm
    /// kaydindan okur (`alarmKitErtelemeleri`), yeniden planlama araliga uyari kurmaz.
    static func ertele(_ kimlik: String) async {
        guard let kayit = kapat(kimlik) else { return }
        guard let hedef = AlarmKurallari.ertelemeHedefi(
            simdiMs: simdiMs(),
            sureDk: AlarmKurallari.erteleDk,
            sinirMs: kayit.erteleSinirMs
        ) else { return }

        iptalEt(AlarmDeposu.varsayilan.susturulacaklar(tarih: kayit.tarih, vakit: kayit.vakit, hedefMs: hedef))
        await bildirimleriSustur(tarih: kayit.tarih, vakit: kayit.vakit, cikisMs: kayit.cikisMs, hedefMs: hedef)

        let yeni = AlarmKaydi(
            kimlik: AlarmKurallari.ertelemeKimligi(tarih: kayit.tarih, vakit: kayit.vakit),
            tetikMs: hedef,
            baslik: AlarmKurallari.ertelemeBasligi(
                sablon: kayit.ertelemeBasligi,
                cikisMs: kayit.cikisMs,
                hedefMs: hedef
            ) ?? kayit.baslik,
            vakit: kayit.vakit,
            tarih: kayit.tarih,
            cikisMs: kayit.cikisMs,
            erteleSinirMs: kayit.erteleSinirMs,
            ertelemeBasligi: kayit.ertelemeBasligi
        )
        if !(await planla(yeni)) {
            NSLog("%@", "[NamazAlarm] Ertelenen alarm kurulamadi \(yeni.kimlik)")
        }
        MuhafizAlarmOlaylari.duyur("ertele")
    }

    /// "Kildim": ortak "Kildim" kuyruguna yazar (JS kaydi `KildimKuyruguServisi` ile
    /// isler — Siri "Kildim"ı ile ayni govde) ve o vaktin kalan alarmlarini + planli
    /// bildirimlerini HEMEN iptal eder (JS uyanmasa da ses susmali).
    static func kildim(_ kimlik: String) async {
        _ = kapat(kimlik)
        guard let v = AlarmKurallari.kimliktenVakit(kimlik) else { return }
        SiriDeposu.varsayilan.kildimEkle(tarih: v.tarih, vakit: v.vakit, kaynak: "alarm", simdiMs: SiriDeposu.simdiMs())
        let onek = AlarmKurallari.vakitOneki(tarih: v.tarih, vakit: v.vakit)
        iptalEt(AlarmDeposu.varsayilan.onekliKimlikler(onek))
        await bildirimleriKaldir(onek: onek)
        MuhafizAlarmOlaylari.duyur("kildim")
    }

    /// Erteleme araligindaki PLAN bildirimleri (`_seviye_N_dk_K`, tetik = cikis − K dk).
    static func bildirimleriSustur(tarih: String, vakit: String, cikisMs: Int64, hedefMs: Int64) async {
        let merkez = UNUserNotificationCenter.current()
        let onek = AlarmKurallari.vakitOneki(tarih: tarih, vakit: vakit) + "_"
        let bekleyenler = await merkez.pendingNotificationRequests()
        let susacaklar = bekleyenler.map(\.identifier).filter { id in
            guard id.hasPrefix(onek), let dk = AlarmKurallari.kalanDk(id) else { return false }
            return AlarmKurallari.ertelemedeSusturulurMu(tetikMs: cikisMs - dk * 60_000, hedefMs: hedefMs)
        }
        if !susacaklar.isEmpty { merkez.removePendingNotificationRequests(withIdentifiers: susacaklar) }
    }

    /// Vaktin bekleyen ve gosterilen TUM muhafiz bildirimleri (plan, erteleme...).
    static func bildirimleriKaldir(onek: String) async {
        let merkez = UNUserNotificationCenter.current()
        let bekleyen = await merkez.pendingNotificationRequests().map(\.identifier).filter { $0.hasPrefix(onek) }
        if !bekleyen.isEmpty { merkez.removePendingNotificationRequests(withIdentifiers: bekleyen) }
        let gosterilen = await merkez.deliveredNotifications().map(\.request.identifier).filter { $0.hasPrefix(onek) }
        if !gosterilen.isEmpty { merkez.removeDeliveredNotifications(withIdentifiers: gosterilen) }
    }
}

#endif
