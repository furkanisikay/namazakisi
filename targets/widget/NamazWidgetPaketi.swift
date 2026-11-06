import SwiftUI
import WidgetKit

// iOS WIDGET UZANTISI GIRIS NOKTASI (issue #295).
//
// Tek WidgetKit uzantisi: vakit widget'i (kilit ekrani aksesuarlari, StandBy, ana ekran)
// + canli etkinlik (Dinamik Ada / kilit ekrani geri sayimi). Uzanti hedefi
// `plugins/withNamazWidget.js` ile prebuild'de kurulur; dagitim hedefi iOS 16.2
// (ActivityKit `ActivityContent`/`staleDate` ve kilit ekrani aksesuarlari icin).
@main
struct NamazWidgetPaketi: WidgetBundle {
    var body: some Widget {
        NamazVakitWidget()
        // Gunun ayeti (#380 iOS ikizi): kucuk / orta / buyuk + kilit ekrani dikdortgen.
        GununAyetiWidget()
        NamazCanliEtkinlikWidget()
        // Kontrol Merkezi "Kildim" kontrolu (iOS 18 ControlWidget; Android hizli ayar kutusu ikizi).
        if #available(iOS 18.0, *) {
            NamazKildimKontrolu()
        }
        // Muhafiz gercek alarminin canli etkinlik sunumu (AlarmKit, iOS 26, issue #74).
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            NamazAlarmCanliEtkinlikWidget()
        }
        #endif
    }
}
