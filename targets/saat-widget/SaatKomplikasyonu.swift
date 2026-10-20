import SwiftUI
import WidgetKit

// APPLE WATCH KOMPLIKASYONU (issue #285): dairesel, kose, dikdortgen ve satir ici.
//
// Girdiler YALNIZ vakit sinirlarinda (`WidgetKarari.sinirlar`); kalan sureyi ve ilerlemeyi
// sistem cizer (`Text(timerInterval:)`, `ProgressView(timerInterval:)`) → dakikalik
// tazeleme yok, WidgetKit butcesi harcanmaz. Komplikasyon SALT OKUNUR: dokununca saat
// uygulamasi acilir ("Kildim" oradadir).

struct SaatGirdisi: TimelineEntry {
    let date: Date
    /// nil → iPhone henuz veri gondermedi.
    let gorunum: WidgetGorunumu?
    let veriEski: Bool

    static func bos(_ tarih: Date) -> SaatGirdisi {
        SaatGirdisi(date: tarih, gorunum: nil, veriEski: false)
    }
}

struct SaatSaglayici: TimelineProvider {
    func placeholder(in context: Context) -> SaatGirdisi {
        Self.ornek()
    }

    func getSnapshot(in context: Context, completion: @escaping (SaatGirdisi) -> Void) {
        if context.isPreview {
            completion(Self.ornek())
            return
        }
        completion(Self.girdiler(simdi: Date()).girdiler.first ?? .bos(Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SaatGirdisi>) -> Void) {
        let sonuc = Self.girdiler(simdi: Date())
        let politika: TimelineReloadPolicy = sonuc.sonSinir.map { .after($0) } ?? .never
        completion(Timeline(entries: sonuc.girdiler, policy: politika))
    }

    static func girdiler(simdi: Date) -> (girdiler: [SaatGirdisi], sonSinir: Date?) {
        let depo = SaatDeposu.varsayilan
        guard let yuk = depo.yuk() else { return ([.bos(simdi)], nil) }
        let vakitler = yuk.vakitAnlari
        let kilinanlar = yuk.kilinanlar
        let bekleyenler = depo.bekleyenler().map { SiriBekleyenKildim(tarih: $0.tarih, vakit: $0.vakit) }
        let simdiMs = SaatDeposu.simdiMs(simdi)
        let sinirlar = WidgetKarari.sinirlar(vakitler, simdiMs: simdiMs)

        func girdi(_ ms: Int64) -> SaatGirdisi {
            let g = WidgetKarari.gorunum(vakitler: vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyenler, simdiMs: ms)
            return SaatGirdisi(date: SaatDeposu.tarih(ms), gorunum: g, veriEski: g.aktif == nil && g.sonraki == nil)
        }

        let liste = [girdi(simdiMs)] + sinirlar.map { girdi($0) }
        return (liste, sinirlar.last.map { SaatDeposu.tarih($0) })
    }

    /// Galeri onizlemesi: sabit, gercekci bir ogle vakti.
    static func ornek() -> SaatGirdisi {
        let simdiMs = SaatDeposu.simdiMs()
        let saat: Int64 = 3_600_000
        let ogle = SiriVakitAni(vakit: "ogle", ms: simdiMs - saat, tarih: "2026-01-01")
        let ikindi = SiriVakitAni(vakit: "ikindi", ms: simdiMs + 2 * saat, tarih: ogle.tarih)
        return SaatGirdisi(
            date: Date(),
            gorunum: WidgetGorunumu(aktif: ogle, bitisMs: ikindi.ms, kilindi: false, sonraki: ikindi, gunTarihi: ogle.tarih),
            veriEski: false
        )
    }
}

enum KomplikasyonMetin {
    /// Dekoratif yesil (#4CAF50); metin sistem rengidir.
    static let yesil = Color(red: 0x4C / 255.0, green: 0xAF / 255.0, blue: 0x50 / 255.0)

    static func ad(_ kod: String) -> String {
        kod == "gunes" ? "Güneş" : VakitKarari.gorunenAd(kod)
    }

    static func ikon(_ kod: String) -> String {
        switch kod {
        case "sabah": return "sunrise.fill"
        case "ogle": return "sun.max.fill"
        case "ikindi": return "sun.haze.fill"
        case "aksam": return "sunset.fill"
        case "yatsi": return "moon.stars.fill"
        default: return "clock"
        }
    }

    /// Guvenli aralik: alt sinir ust siniri gecerse `ClosedRange` cokertirdi.
    static func aralik(_ simdi: Date, _ hedefMs: Int64) -> ClosedRange<Date> {
        let hedef = SaatDeposu.tarih(hedefMs)
        return min(simdi, hedef)...hedef
    }
}

struct NamazSaatKomplikasyonu: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "NamazSaatKomplikasyonu", provider: SaatSaglayici()) { girdi in
            KomplikasyonGorunumu(girdi: girdi)
                .containerBackground(for: .widget) { Color.clear }
        }
        .configurationDisplayName("Namaz vakti")
        .description("İçinde bulunulan vakit ve çıkışına kalan süre.")
        .supportedFamilies([.accessoryCircular, .accessoryCorner, .accessoryRectangular, .accessoryInline])
    }
}

struct KomplikasyonGorunumu: View {
    let girdi: SaatGirdisi
    @Environment(\.widgetFamily) private var aile

    var body: some View {
        switch aile {
        case .accessoryInline: SatirIci(girdi: girdi)
        case .accessoryCorner: Kose(girdi: girdi)
        case .accessoryRectangular: Dikdortgen(girdi: girdi)
        default: Dairesel(girdi: girdi)
        }
    }
}

/// Aktif ve kilinmamis vakit varsa onu doner (geri sayim gosterilecek).
private func surenVakit(_ girdi: SaatGirdisi) -> (aktif: SiriVakitAni, bitis: Int64)? {
    guard let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs, !g.kilindi else { return nil }
    return (aktif, bitis)
}

private struct SatirIci: View {
    let girdi: SaatGirdisi

    var body: some View {
        // Noktali ayrac yok: anlam ikonla verilir (kum saati = cikis, ok = siradakinin girisi).
        if let s = surenVakit(girdi) {
            Label {
                Text("\(KomplikasyonMetin.ad(s.aktif.vakit)) \(SaatDeposu.saatMetni(s.bitis))")
            } icon: {
                Image(systemName: "hourglass.bottomhalf.filled")
            }
            .accessibilityLabel("\(KomplikasyonMetin.ad(s.aktif.vakit)) vakti, çıkış \(SaatDeposu.saatMetni(s.bitis))")
        } else if let g = girdi.gorunum, let sonraki = g.sonraki {
            Label {
                Text("\(KomplikasyonMetin.ad(sonraki.vakit)) \(SaatDeposu.saatMetni(sonraki.ms))")
            } icon: {
                Image(systemName: KomplikasyonMetin.ikon(sonraki.vakit))
            }
            .accessibilityLabel("Sıradaki \(KomplikasyonMetin.ad(sonraki.vakit)), \(SaatDeposu.saatMetni(sonraki.ms))")
        } else {
            Text("Namaz Akışı")
        }
    }
}

private struct Dairesel: View {
    let girdi: SaatGirdisi

    var body: some View {
        if let s = surenVakit(girdi) {
            ProgressView(
                timerInterval: SaatDeposu.tarih(s.aktif.ms)...SaatDeposu.tarih(max(s.aktif.ms, s.bitis)),
                countsDown: false,
                label: { Text(KomplikasyonMetin.ad(s.aktif.vakit)) },
                currentValueLabel: {
                    Text(timerInterval: KomplikasyonMetin.aralik(girdi.date, s.bitis), countsDown: true, showsHours: false)
                        .font(.system(size: 11, weight: .semibold))
                        .monospacedDigit()
                        .multilineTextAlignment(.center)
                        .minimumScaleFactor(0.5)
                }
            )
            .progressViewStyle(.circular)
            .tint(KomplikasyonMetin.yesil)
            .accessibilityLabel("\(KomplikasyonMetin.ad(s.aktif.vakit)) vakti, çıkış \(SaatDeposu.saatMetni(s.bitis))")
        } else if let g = girdi.gorunum, let sonraki = g.sonraki {
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 0) {
                    Image(systemName: KomplikasyonMetin.ikon(sonraki.vakit))
                        .font(.system(size: 11))
                        .widgetAccentable()
                    Text(SaatDeposu.saatMetni(sonraki.ms))
                        .font(.system(size: 12, weight: .semibold))
                        .monospacedDigit()
                        .minimumScaleFactor(0.6)
                }
            }
            .accessibilityLabel("Sıradaki \(KomplikasyonMetin.ad(sonraki.vakit)), \(SaatDeposu.saatMetni(sonraki.ms))")
        } else {
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: "moon.stars")
            }
            .accessibilityLabel("Namaz Akışı")
        }
    }
}

private struct Kose: View {
    let girdi: SaatGirdisi

    var body: some View {
        if let s = surenVakit(girdi) {
            Image(systemName: KomplikasyonMetin.ikon(s.aktif.vakit))
                .font(.title3)
                .widgetAccentable()
                .widgetLabel {
                    Text(timerInterval: KomplikasyonMetin.aralik(girdi.date, s.bitis), countsDown: true)
                        .monospacedDigit()
                }
                .accessibilityLabel("\(KomplikasyonMetin.ad(s.aktif.vakit)) vakti, çıkış \(SaatDeposu.saatMetni(s.bitis))")
        } else if let g = girdi.gorunum, let sonraki = g.sonraki {
            Image(systemName: KomplikasyonMetin.ikon(sonraki.vakit))
                .font(.title3)
                .widgetAccentable()
                .widgetLabel {
                    Text("\(KomplikasyonMetin.ad(sonraki.vakit)) \(SaatDeposu.saatMetni(sonraki.ms))")
                }
        } else {
            Image(systemName: "moon.stars")
                .font(.title3)
        }
    }
}

private struct Dikdortgen: View {
    let girdi: SaatGirdisi

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            if let s = surenVakit(girdi) {
                Label(KomplikasyonMetin.ad(s.aktif.vakit), systemImage: KomplikasyonMetin.ikon(s.aktif.vakit))
                    .font(.headline)
                    .widgetAccentable()
                Text(timerInterval: KomplikasyonMetin.aralik(girdi.date, s.bitis), countsDown: true)
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                Label(SaatDeposu.saatMetni(s.bitis), systemImage: "hourglass.bottomhalf.filled")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .accessibilityLabel("Çıkış \(SaatDeposu.saatMetni(s.bitis))")
            } else if let g = girdi.gorunum, let sonraki = g.sonraki {
                if let aktif = g.aktif, g.kilindi {
                    Label("\(KomplikasyonMetin.ad(aktif.vakit)) kılındı", systemImage: "checkmark.circle.fill")
                        .font(.headline)
                        .widgetAccentable()
                } else {
                    Label("Sıradaki", systemImage: "clock")
                        .font(.headline)
                        .widgetAccentable()
                }
                Text("\(KomplikasyonMetin.ad(sonraki.vakit)) \(SaatDeposu.saatMetni(sonraki.ms))")
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                Text(timerInterval: KomplikasyonMetin.aralik(girdi.date, sonraki.ms), countsDown: true)
                    .font(.caption2)
                    .monospacedDigit()
                    .foregroundStyle(.secondary)
            } else {
                Text(girdi.veriEski
                    ? "Vakitleri güncellemek için iPhone'da uygulamayı açın"
                    : "Vakitler iPhone'unuzdan gelir")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .minimumScaleFactor(0.7)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
