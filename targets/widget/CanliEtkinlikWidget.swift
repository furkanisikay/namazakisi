import ActivityKit
import AppIntents
import SwiftUI
import UIKit
import WidgetKit

// CANLI ETKINLIK (Live Activity) — kilit ekrani karti + Dinamik Ada (issue #295).
//
// Android Now Bar'in iOS ikizi: hangi ogenin gosterilecegini uygulama secer
// (`src/core/sayac/iosCanliEtkinlik.ts`) ve `Activity.request` ile baslatir
// (`CanliEtkinlikKoprusu`). Bu dosya yalniz CIZER. Geri sayimi ve ilerlemeyi sistem
// cizer; hedefe varinca `staleDate` dolar → kart "Vakit çıktı" der.
//
// "Kildim" yalniz vakit ogesinde ve iOS 17+'da (`KildimDugmesiIntent`,
// `LiveActivityIntent`: uygulama surecinde, Siri kuyruguna yazar).

struct NamazCanliEtkinlikWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NamazCanliNitelikleri.self) { context in
            CanliKilitEkraniGorunumu(durum: context.state, eskidi: context.isStale)
                .activityBackgroundTint(Color(.systemBackground).opacity(0.9))
                .widgetURL(WidgetSabitleri.acilis)
        } dynamicIsland: { context in
            let durum = context.state
            let eskidi = context.isStale
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Label(durum.ad, systemImage: CanliMetin.ikon(durum))
                        .font(.headline)
                        .foregroundStyle(WidgetSabitleri.yesil)
                        .lineLimit(1)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    CanliSayac(durum: durum, eskidi: eskidi)
                        .font(.system(.title3, design: .rounded).weight(.semibold))
                        .frame(maxWidth: 90, alignment: .trailing)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 6) {
                        if !CanliMetin.kabulMu(durum) { CanliIlerleme(durum: durum) }
                        HStack {
                            Text(CanliMetin.altSatir(durum))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Spacer()
                            CanliKildimDugmesi(durum: durum, eskidi: eskidi)
                        }
                    }
                }
            } compactLeading: {
                Image(systemName: CanliMetin.ikon(durum))
                    .foregroundStyle(WidgetSabitleri.yesil)
            } compactTrailing: {
                CanliSayac(durum: durum, eskidi: eskidi)
                    .font(.caption2.weight(.semibold))
                    .frame(maxWidth: 48)
            } minimal: {
                Image(systemName: CanliMetin.ikon(durum))
                    .foregroundStyle(WidgetSabitleri.yesil)
            }
            .widgetURL(WidgetSabitleri.acilis)
            .keylineTint(WidgetSabitleri.yesil)
        }
    }
}

enum CanliMetin {
    static func ikon(_ d: NamazCanliNitelikleri.ContentState) -> String {
        switch d.tema {
        case "kabul": return "checkmark.circle.fill"
        case "cuma": return "building.columns.fill"
        case "nafile": return "sparkles"
        default:
            if let v = d.kildimVakit { return WidgetMetin.ikon(v == "imsak" ? "sabah" : v) }
            return "timer"
        }
    }

    /// Kildim sonrasi son kare (`NamazCanliNitelikleri.kildimIleBitir`): sayac yerine dua.
    static func kabulMu(_ d: NamazCanliNitelikleri.ContentState) -> Bool { d.tema == "kabul" }

    static func hedef(_ d: NamazCanliNitelikleri.ContentState) -> Date {
        VakitSaglayici.tarih(d.hedefMs)
    }

    static func altSatir(_ d: NamazCanliNitelikleri.ContentState) -> String {
        if kabulMu(d) { return "\(d.ad) namazı kılındı" }
        return d.tema == "vakit" ? "Çıkış \(WidgetMetin.saat(d.hedefMs))" : "Bitiş \(WidgetMetin.saat(d.hedefMs))"
    }
}

/// Kalan sure (sistem cizer). Hedef gecmisse sabit metin — `timerInterval` alt siniri
/// ust sinirdan buyuk olamaz.
private struct CanliSayac: View {
    let durum: NamazCanliNitelikleri.ContentState
    let eskidi: Bool
    var body: some View {
        let hedef = CanliMetin.hedef(durum)
        if CanliMetin.kabulMu(durum) {
            Image(systemName: "checkmark")
                .foregroundStyle(WidgetSabitleri.yesil)
                .accessibilityLabel("Kılındı")
        } else if eskidi || hedef <= Date() {
            Text("Bitti")
        } else {
            Text(timerInterval: Date()...hedef, countsDown: true)
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
        }
    }
}

private struct CanliIlerleme: View {
    let durum: NamazCanliNitelikleri.ContentState
    var body: some View {
        let bas = VakitSaglayici.tarih(min(durum.baslangicMs, durum.hedefMs))
        ProgressView(
            timerInterval: bas...CanliMetin.hedef(durum),
            countsDown: false,
            label: { EmptyView() },
            currentValueLabel: { EmptyView() }
        )
        .tint(WidgetSabitleri.yesil)
    }
}

private struct CanliKildimDugmesi: View {
    let durum: NamazCanliNitelikleri.ContentState
    let eskidi: Bool
    var body: some View {
        if #available(iOS 17.0, *) {
            if !eskidi, let tarih = durum.kildimTarih, let vakit = durum.kildimVakit {
                Button(intent: KildimDugmesiIntent(tarih: tarih, vakit: vakit)) {
                    Label("Kıldım", systemImage: "checkmark")
                        .font(.caption.weight(.semibold))
                }
                .tint(WidgetSabitleri.yesil)
                .accessibilityLabel("\(durum.ad) namazını kıldım")
            }
        }
    }
}

private struct CanliKilitEkraniGorunumu: View {
    let durum: NamazCanliNitelikleri.ContentState
    let eskidi: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .center, spacing: 10) {
                Image(systemName: CanliMetin.ikon(durum))
                    .font(.title3)
                    .foregroundStyle(WidgetSabitleri.yesil)
                VStack(alignment: .leading, spacing: 1) {
                    Text(durum.baslik)
                        .font(.headline)
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                    Text(eskidi ? "Vakit çıktı" : CanliMetin.altSatir(durum))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                CanliSayac(durum: durum, eskidi: eskidi)
                    .font(.system(.title2, design: .rounded).weight(.semibold))
                    .foregroundStyle(.primary)
                    .frame(maxWidth: 110, alignment: .trailing)
            }
            if !eskidi && !CanliMetin.kabulMu(durum) {
                HStack(spacing: 10) {
                    CanliIlerleme(durum: durum)
                    CanliKildimDugmesi(durum: durum, eskidi: eskidi)
                }
            }
        }
        .padding(16)
    }
}
