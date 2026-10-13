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
        NamazCanliEtkinlikWidget()
    }
}
