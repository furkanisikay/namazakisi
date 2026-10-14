import Foundation
#if canImport(AlarmKit)
import AlarmKit

// MUHAFIZ GERCEK ALARMI — AlarmKit meta veri tipi (issue #74).
//
// IKI HEDEFTE derlenir: ana uygulama (`plugins/withMuhafizAlarmKit.js`; alarm bu tiple
// kurulur) ve — widget uzantisi bayragi aciksa — `NamazWidget` uzantisi
// (`plugins/withNamazWidget.js`; `ActivityConfiguration(for: AlarmAttributes<NamazAlarmVerisi>.self)`
// alarmin Dinamik Ada / kilit ekrani sunumunu bu tiple eslestirir). Bu yuzden YALNIZ
// Foundation + AlarmKit kullanir; pod'lara (ExpoMuhafizAlarmKit, ExpoSiriKisayollari)
// dokunmaz — uzanti onlara baglanmaz. Alan eklerken iki hedefin ayni dosyayi derledigini
// unutma: kodlanmis veri iki taraf arasinda tasinir.

/// Alarm meta verisi (AlarmKit `AlarmAttributes` ister). Yalniz kimlik tasir; ayrintilar
/// `AlarmDeposu` kaydindadir.
@available(iOS 26.0, *)
struct NamazAlarmVerisi: AlarmMetadata {
    var kimlik: String
}

#endif
