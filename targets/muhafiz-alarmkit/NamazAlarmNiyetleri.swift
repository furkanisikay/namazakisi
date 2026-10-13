import Foundation
#if canImport(AlarmKit)
import AppIntents

// MUHAFIZ GERCEK ALARMI DUGMELERI — AlarmKit intent'leri (issue #74).
//
// ANA UYGULAMA HEDEFINE derlenir (`plugins/withMuhafizAlarmKit.js`): AlarmKit dugmeye
// basilinca intent'i UYGULAMANIN SURECINDE calistirir (`LiveActivityIntent`; gerekirse
// uygulamayi arka planda baslatir) ve intent'i ancak ana hedefin `Metadata.appintents`'inde
// bulabilir. Kisayollar uygulamasinda GORUNMEZLER (`isDiscoverable = false`): yalniz
// alarm ekraninin dugmeleridir. Is mantigi `NamazAlarmCekirdegi`'nde.

/// Sistem "Durdur": yalniz susturur, namazi KILINDI SAYMAZ.
@available(iOS 26.0, *)
struct NamazAlarmDurdurIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Namaz alarmını durdur"
    static let isDiscoverable: Bool = false
    static let openAppWhenRun: Bool = false

    @Parameter(title: "Alarm")
    var kimlik: String

    init() {
        self.kimlik = ""
    }

    init(kimlik: String) {
        self.kimlik = kimlik
    }

    func perform() async throws -> some IntentResult {
        _ = NamazAlarmCekirdegi.kapat(kimlik)
        return .result()
    }
}

/// "10 dk ertele" — sinira kadar tek bir yeni alarm (issue #289 kurallari).
@available(iOS 26.0, *)
struct NamazAlarmErteleIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Namaz alarmını ertele"
    static let isDiscoverable: Bool = false
    static let openAppWhenRun: Bool = false

    @Parameter(title: "Alarm")
    var kimlik: String

    init() {
        self.kimlik = ""
    }

    init(kimlik: String) {
        self.kimlik = kimlik
    }

    func perform() async throws -> some IntentResult {
        await NamazAlarmCekirdegi.ertele(kimlik)
        return .result()
    }
}

/// "Kıldım" — ortak Kildim kuyruguna yazar, vaktin kalan uyarilarini iptal eder.
@available(iOS 26.0, *)
struct NamazAlarmKildimIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Namazı kıldım"
    static let isDiscoverable: Bool = false
    static let openAppWhenRun: Bool = false

    @Parameter(title: "Alarm")
    var kimlik: String

    init() {
        self.kimlik = ""
    }

    init(kimlik: String) {
        self.kimlik = kimlik
    }

    func perform() async throws -> some IntentResult {
        await NamazAlarmCekirdegi.kildim(kimlik)
        return .result()
    }
}

#endif
