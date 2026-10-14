import SwiftUI
import WidgetKit
#if canImport(AlarmKit)
import ActivityKit
import AlarmKit

// MUHAFIZ GERCEK ALARMI — AlarmKit canli etkinlik sunumu (issue #74).
//
// AlarmKit alarmi, telefon kullanilirken ve kilit ekraninda bir canli etkinlik olarak
// (Dinamik Ada / kilit ekrani karti) sunulur ve sistem bu sunumu uygulamanin widget
// uzantisindaki `ActivityConfiguration(for: AlarmAttributes<Metadata>.self)` ile eslestirir
// (Apple ornegi "Scheduling an alarm with AlarmKit" ayni deseni kullanir). CALMA ANINDAKI
// alarm ekranini (baslik + durdurma + ikincil dugme) SISTEM cizer; burasi yalniz sistemin
// bizden istedigi canli etkinlik govdesidir. Alarmlarimiz geri sayimsizdir (`.fixed`
// zamanlama, `countdown` sunumu YOK) → Apple'in "geri sayim varsa uzanti ZORUNLU" kurali
// bize dusmez; uzanti (bayrak) kapaliyken de alarm calar. Bu gorunum yalniz uzanti
// aciksa varligi daha zengin gostermek icindir.
//
// Meta veri tipi `NamazAlarmVerisi` ana hedefle AYNI dosyadan kopyalanir
// (`targets/muhafiz-alarmkit/NamazAlarmVerisi.swift`, `plugins/withNamazWidget.js`).
// Dugme YOK: alarmin dugmeleri alarm sunumunda (sistem) ve uygulama surecindeki
// intent'lerde yasar; uzanti onlari tekrar cizerse ayni kayit iki yoldan yazilabilirdi.

@available(iOS 26.0, *)
struct NamazAlarmCanliEtkinlikWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: AlarmAttributes<NamazAlarmVerisi>.self) { context in
            AlarmKilitEkraniGorunumu(
                baslik: context.attributes.presentation.alert.title,
                renk: context.attributes.tintColor
            )
            .widgetURL(WidgetSabitleri.acilis)
        } dynamicIsland: { context in
            let renk = context.attributes.tintColor
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "alarm.fill")
                        .font(.title2)
                        .foregroundStyle(renk)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.presentation.alert.title)
                        .font(.headline)
                        .lineLimit(2)
                }
            } compactLeading: {
                Image(systemName: "alarm.fill")
                    .foregroundStyle(renk)
            } compactTrailing: {
                Image(systemName: "moon.stars.fill")
                    .foregroundStyle(renk)
            } minimal: {
                Image(systemName: "alarm.fill")
                    .foregroundStyle(renk)
            }
        }
    }
}

@available(iOS 26.0, *)
private struct AlarmKilitEkraniGorunumu: View {
    let baslik: LocalizedStringResource
    let renk: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "alarm.fill")
                .font(.title2)
                .foregroundStyle(renk)
                .accessibilityHidden(true)
            Text(baslik)
                .font(.headline)
                .lineLimit(2)
            Spacer(minLength: 0)
        }
        .padding()
    }
}

#endif
