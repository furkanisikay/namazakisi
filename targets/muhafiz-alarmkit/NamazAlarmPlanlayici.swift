import Foundation
import UserNotifications
internal import ExpoMuhafizAlarmKit
internal import ExpoSiriKisayollari
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

    func iptalEt(_ kimlikler: [String], _ calaniDurdur: Bool, _ tamam: @escaping () -> Void) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            NamazAlarmCekirdegi.iptalEt(kimlikler, calaniDurdur: calaniDurdur)
            tamam()
            return
        }
        #endif
        AlarmDeposu.varsayilan.sil(kimlikler)
        tamam()
    }

    func canliUuidler(_ tamam: @escaping ([String]?, [String]) -> Void) {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            let durum = NamazAlarmCekirdegi.canliAlarmlar()
            tamam(durum?.canli, durum?.calan ?? [])
            return
        }
        #endif
        tamam([], [])
    }
}

#if canImport(AlarmKit)

@available(iOS 26.0, *)
enum NamazAlarmCekirdegi {
    /// Uygulamanin yesil tonu (tema `birincil`, #4CAF50) — alarm ekraninda uygulamayi tanitir.
    static let renk = Color(red: 0.298, green: 0.686, blue: 0.314)

    static func simdiMs() -> Int64 {
        return Int64((Date().timeIntervalSince1970 * 1000).rounded())
    }

    /// Sistem "Durdur" dugmesinin etiketi (namazi KILINDI SAYMAZ; iOS 26.1+ sistem kendi
    /// etiketini cizer). Ingilizce JS `hatirlatma.iosDurdur` ("you can stop it") ile ayni fiil.
    static func durdurEtiketi(_ dil: String) -> String {
        return durdurEtiketleri[ArayuzDili.coz(dil)] ?? "Durdur"
    }

    /// Dil tablosu (sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo; cevrilmemis dil Ingilizce kopya).
    static let durdurEtiketleri: [String: String] = [
        "tr": "Durdur",
        "en": "Stop",
        // id
        "id": "Hentikan",
        "de": "Beenden",
        // fr
        "fr": "Arrêter",
        // bs
        "bs": "Zaustavite",
        // ru
        "ru": "Остановить",
        // ms
        "ms": "Hentikan",
        // ar
        "ar": "إيقاف",
        // ur
        "ur": "روکیں",
        // es
        "es": "Detener",
        // nl
        "nl": "Stoppen",
        // sq
        "sq": "Ndalo",
        // hi
        "hi": "रोकें",
        // bn
        "bn": "থামান",
        // fa
        "fa": "توقف",
        // ps
        "ps": "ودروئ",
        // ckb
        "ckb": "وەستاندن",
        // ug
        "ug": "توختىتىش",
        // az
        "az": "Dayandır",
        // uz (Latin)
        "uz": "Toʻxtatish",
        // kk
        "kk": "Тоқтату",
        // ky
        "ky": "Токтотуу",
        // tg
        "tg": "Қатъ кардан",
        // ÇEVİRİ: sw
        "sw": "Stop",
        // ÇEVİRİ: ha
        "ha": "Stop",
        // ÇEVİRİ: am
        "am": "Stop",
        // ÇEVİRİ: om
        "om": "Stop",
        // ÇEVİRİ: so
        "so": "Stop",
        // ÇEVİRİ: ff
        "ff": "Stop",
        // ÇEVİRİ: yo
        "yo": "Stop",
    ]

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
        // namazi KILINDI SAYMAZ. Ikinci dugme daima "Kildim": ERTELE YOK (sahip karari
        // 2026-10-19, eski #289) — erteleyen kisi unutur, son dakikada yetismez.
        //
        // BILGI alarmi (cuma, camiye gitme, takvim — `AlarmKurallari.alarmTuru`) vakit GIRMEDEN
        // calar: ikinci dugme YOK (yalniz sistemin "Durdur"u); "Kildim" FARZ'i yazardi.
        let bilgiMi = AlarmKurallari.alarmTuru(kayit.kimlik) == "bilgi"
        // Dugme etiketleri UYGULAMANIN arayuz dilinde (W5; baslik gibi JS'in plan dilinde) —
        // interpolasyon hilesiyle (asagida) yerellestirme tablosunda aranmaz. Dil degisince JS
        // planlari yeniden kurar, alarmlar yeni etiketle yenilenir.
        let metin = VakitMetinleri.dil(SiriDeposu.varsayilan.arayuzDili())
        let kildimDegeri: String.LocalizationValue = "\(metin.kildim)"
        let durdurDegeri: String.LocalizationValue = "\(Self.durdurEtiketi(metin.dil))"
        let ikinciDugme: AlarmButton? = bilgiMi
            ? nil
            : AlarmButton(text: LocalizedStringResource(kildimDegeri), textColor: .white, systemImageName: "checkmark")
        // Baslik DINAMIK metindir: `LocalizedStringResource(stringLiteral:)` onu bir
        // YERELLESTIRME ANAHTARI sayardi. Interpolasyonla anahtar "%@" olur, deger aynen
        // gosterilir (yerellestirme tablosunda karsiligi aranmaz).
        // Basligin rakamlari secilen sistemle (Arapcada "arab" → Dogu Arap, Bengalcede "beng" →
        // Bengalce); kayit Bati kalir.
        let baslik = RakamSistemi.cevir(
            kayit.baslik,
            sistem: RakamSistemi.etkin(dil: metin.dil, kayitli: SiriDeposu.varsayilan.rakamSistemi())
        )
        let baslikDegeri: String.LocalizationValue = "\(baslik)"
        let ikinciDavranis: AlarmPresentation.Alert.SecondaryButtonBehavior? = bilgiMi ? nil : .custom
        let alert = AlarmPresentation.Alert(
            title: LocalizedStringResource(baslikDegeri),
            stopButton: AlarmButton(text: LocalizedStringResource(durdurDegeri), textColor: .white, systemImageName: "stop.fill"),
            secondaryButton: ikinciDugme,
            secondaryButtonBehavior: ikinciDavranis
        )
        let nitelikler = AlarmAttributes<NamazAlarmVerisi>(
            presentation: AlarmPresentation(alert: alert),
            metadata: NamazAlarmVerisi(kimlik: kayit.kimlik),
            tintColor: renk
        )
        // Açık if/else: varoluşsal tipe yükseltme üçlü `? :` ile derlenmeyebilir.
        let ikinciNiyet: (any LiveActivityIntent)?
        if bilgiMi {
            ikinciNiyet = nil
        } else {
            ikinciNiyet = NamazAlarmKildimIntent(kimlik: kayit.kimlik)
        }
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

    /// `calaniDurdur == false` (PLANLAMA turu: yeniden planlama, muhafiz kapatma):
    /// o an CALAN alarm ATLANIR — Android kurali "planlama turu calan alarmi
    /// susturmaz". JS secimi zaten haric tutar; burada iptal aninin GUNCEL durumu bir kez
    /// daha uygulanir (okuma ile iptal arasinda calmaya baslayan alarm). Yalniz "Kildim"
    /// `true` gecer: calani once durdurur, sonra iptal eder.
    static func iptalEt(_ kimlikler: [String], calaniDurdur: Bool) {
        let calan = calaniDurdur ? [] : Set(canliAlarmlar()?.calan ?? [])
        let secilen = AlarmKurallari.iptalSecimi(kimlikler: kimlikler, calanUuidler: calan, calaniDurdur: calaniDurdur)
        for kimlik in secilen {
            let id = AlarmKurallari.uuid(kimlik)
            if calaniDurdur { try? AlarmManager.shared.stop(id: id) }
            try? AlarmManager.shared.cancel(id: id)
        }
        AlarmDeposu.varsayilan.sil(secilen)
    }

    /// Sistemde kurulu alarmlar (kucuk harf UUID) ve bunlardan o an CALANLAR; okunamazsa `nil`.
    static func canliAlarmlar() -> (canli: [String], calan: [String])? {
        guard let alarmlar = try? AlarmManager.shared.alarms else { return nil }
        let canli = alarmlar.map { $0.id.uuidString.lowercased() }
        let calan = alarmlar.filter { $0.state == .alerting }.map { $0.id.uuidString.lowercased() }
        return (canli, calan)
    }

    /// Calan alarmi susturur ve kaydini dusurur (durdur / kildim ortak ilk adim).
    static func kapat(_ kimlik: String) -> AlarmKaydi? {
        let id = AlarmKurallari.uuid(kimlik)
        try? AlarmManager.shared.stop(id: id)
        try? AlarmManager.shared.cancel(id: id)
        let kayit = AlarmDeposu.varsayilan.kayit(kimlik)
        AlarmDeposu.varsayilan.sil([kimlik])
        return kayit
    }

    /// "Kildim": ortak "Kildim" kuyruguna yazar (JS kaydi `KildimKuyruguServisi` ile
    /// isler — Siri "Kildim"ı ile ayni govde) ve o vaktin kalan alarmlarini + planli
    /// bildirimlerini HEMEN iptal eder (JS uyanmasa da ses susmali).
    static func kildim(_ kimlik: String) async {
        _ = kapat(kimlik)
        // NAFILE alarmi (issue #74 nafilede de standart yetenek): FARZ kuyruguna ASLA
        // yazilmaz. O nafilenin kalan alarmlari + bildirimleri hemen susar, haber JS'e
        // nafile kuyrugundan gider (`nafileKildimleriniAl`).
        if let n = AlarmKurallari.kimliktenNafile(kimlik) {
            let onek = AlarmKurallari.nafileOneki(tarih: n.tarih, tur: n.tur)
            iptalEt(AlarmDeposu.varsayilan.onekliKimlikler(onek), calaniDurdur: true)
            await bildirimleriKaldir(onek: onek)
            AlarmDeposu.varsayilan.nafileKildimEkle(tarih: n.tarih, tur: n.tur)
            MuhafizAlarmOlaylari.duyur("nafileKildim")
            return
        }
        guard let v = AlarmKurallari.kimliktenVakit(kimlik) else { return }
        SiriDeposu.varsayilan.kildimEkle(tarih: v.tarih, vakit: v.vakit, kaynak: "alarm", simdiMs: SiriDeposu.simdiMs())
        let onek = AlarmKurallari.vakitOneki(tarih: v.tarih, vakit: v.vakit)
        // "Kildim" vaktin CALAN alarmini da susturur (Android `MuhafizAlarmTemizligi` ikizi).
        iptalEt(AlarmDeposu.varsayilan.onekliKimlikler(onek), calaniDurdur: true)
        await bildirimleriKaldir(onek: onek)
        MuhafizAlarmOlaylari.duyur("kildim")
    }

    /// Vaktin bekleyen ve gosterilen TUM muhafiz bildirimleri (plan, yatis...).
    static func bildirimleriKaldir(onek: String) async {
        let merkez = UNUserNotificationCenter.current()
        let bekleyen = await merkez.pendingNotificationRequests().map(\.identifier).filter { $0.hasPrefix(onek) }
        if !bekleyen.isEmpty { merkez.removePendingNotificationRequests(withIdentifiers: bekleyen) }
        let gosterilen = await merkez.deliveredNotifications().map(\.request.identifier).filter { $0.hasPrefix(onek) }
        if !gosterilen.isEmpty { merkez.removeDeliveredNotifications(withIdentifiers: gosterilen) }
    }
}

#endif
