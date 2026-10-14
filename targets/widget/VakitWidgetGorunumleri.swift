import AppIntents
import SwiftUI
import UIKit
import WidgetKit

// iOS VAKIT WIDGET'I (issue #295): kilit ekrani aksesuarlari, StandBy ve ana ekran.
//
// KILIT EKRANI VE STANDBY SALT OKUNURDUR (Android #295 karari): "Kildim" dugmesi yalniz
// ana ekranda (`systemSmall`/`systemMedium`) ve yalniz konteyner arka plani gorunurken
// cizilir — StandBy ve iPad kilit ekrani `showsWidgetContainerBackground == false` verir.
// Her yuzeyde `widgetURL` uygulamayi acar.
//
// Kalan sure ve ilerleme SISTEM tarafindan cizilir (`Text(timerInterval:)`,
// `ProgressView(timerInterval:)`); zaman cizelgesi yalniz vakit sinirlarinda girdi tasir.
// Metinler arayuz kaydindadir (kibar/notr; ibadete cagri degil).

enum WidgetSabitleri {
    static let tur = "NamazVakitWidget"
    static let acilis = URL(string: "namazakisi://")
    /// Uygulamanin birincil yesili (tema `birincil` / splash #4CAF50). Yalniz ikon/cubuk
    /// gibi DEKORATIF ogelerde; metin daima sistem `primary`/`secondary` (kontrast).
    static let yesil = Color(red: 0x4C / 255.0, green: 0xAF / 255.0, blue: 0x50 / 255.0)
}

enum WidgetMetin {
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

    /// `HH:mm` (cihaz saat dilimi). Hal eki EKLENMEZ ("Çıkış 16:00").
    static func saat(_ ms: Int64) -> String {
        SiriDeposu.saatBicimleyici()(ms)
    }
}

struct NamazVakitWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: WidgetSabitleri.tur, provider: VakitSaglayici()) { girdi in
            VakitWidgetGorunumu(girdi: girdi)
        }
        .configurationDisplayName("Namaz vakti")
        .description("İçinde bulunulan vakit, çıkışına kalan süre ve günün vakitleri.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .systemSmall, .systemMedium])
    }
}

struct VakitWidgetGorunumu: View {
    let girdi: VakitGirdisi
    @Environment(\.widgetFamily) private var aile

    var body: some View {
        icerik
            .widgetURL(WidgetSabitleri.acilis)
            .widgetArkaplani(aile)
    }

    @ViewBuilder private var icerik: some View {
        switch aile {
        case .accessoryInline: SatirIciGorunum(girdi: girdi)
        case .accessoryCircular: DaireselGorunum(girdi: girdi)
        case .accessoryRectangular: DikdortgenGorunum(girdi: girdi)
        case .systemMedium: OrtaGorunum(girdi: girdi)
        default: KucukGorunum(girdi: girdi)
        }
    }
}

// MARK: - Bos / eski veri

private struct VeriYokGorunumu: View {
    let eski: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: "location.slash")
                .foregroundStyle(WidgetSabitleri.yesil)
            Text(eski ? "Vakitleri güncellemek için uygulamayı açın" : "Konumunuzu ayarlamak için uygulamayı açın")
                .font(.caption)
                .foregroundStyle(.secondary)
                .minimumScaleFactor(0.7)
        }
    }
}

// MARK: - Kilit ekrani: satir ici

private struct SatirIciGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs {
            if g.kilindi, let s = g.sonraki {
                Text("\(WidgetMetin.ad(aktif.vakit)) kılındı · \(WidgetMetin.ad(s.vakit)) \(WidgetMetin.saat(s.ms))")
            } else {
                Label("\(WidgetMetin.ad(aktif.vakit)) · çıkış \(WidgetMetin.saat(bitis))", systemImage: WidgetMetin.ikon(aktif.vakit))
            }
        } else if let s = girdi.gorunum?.sonraki {
            Label("Sıradaki \(WidgetMetin.ad(s.vakit)) \(WidgetMetin.saat(s.ms))", systemImage: WidgetMetin.ikon(s.vakit))
        } else {
            Text("Namaz Akışı")
        }
    }
}

// MARK: - Kilit ekrani: dairesel (vaktin gecen kismi + kalan sure)

private struct DaireselGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs, !g.kilindi {
            ProgressView(
                timerInterval: VakitSaglayici.tarih(aktif.ms)...VakitSaglayici.tarih(bitis),
                countsDown: false,
                label: { Text(WidgetMetin.ad(aktif.vakit)) },
                currentValueLabel: {
                    VStack(spacing: 0) {
                        Image(systemName: WidgetMetin.ikon(aktif.vakit)).font(.system(size: 10))
                        Text(timerInterval: girdi.date...VakitSaglayici.tarih(bitis), countsDown: true, showsHours: false)
                            .font(.system(size: 11, weight: .semibold))
                            .monospacedDigit()
                            .multilineTextAlignment(.center)
                            .minimumScaleFactor(0.5)
                    }
                }
            )
            .progressViewStyle(.circular)
            .accessibilityLabel("\(WidgetMetin.ad(aktif.vakit)) vakti, çıkış \(WidgetMetin.saat(bitis))")
        } else if let s = girdi.gorunum?.sonraki {
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Image(systemName: WidgetMetin.ikon(s.vakit)).font(.system(size: 12))
                    Text(WidgetMetin.saat(s.ms))
                        .font(.system(size: 12, weight: .semibold))
                        .monospacedDigit()
                        .minimumScaleFactor(0.6)
                }
            }
            .accessibilityLabel("Sıradaki \(WidgetMetin.ad(s.vakit)), \(WidgetMetin.saat(s.ms))")
        } else {
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: "moon.stars")
            }
        }
    }
}

// MARK: - Kilit ekrani: dikdortgen (vakit adi + geri sayim + cikis saati)

private struct DikdortgenGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs, !g.kilindi {
                Label(WidgetMetin.ad(aktif.vakit), systemImage: WidgetMetin.ikon(aktif.vakit))
                    .font(.headline)
                    .widgetAccentable()
                Text(timerInterval: girdi.date...VakitSaglayici.tarih(bitis), countsDown: true)
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                Text("Çıkış \(WidgetMetin.saat(bitis))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else if let g = girdi.gorunum, let s = g.sonraki {
                if let aktif = g.aktif, g.kilindi {
                    Label("\(WidgetMetin.ad(aktif.vakit)) kılındı", systemImage: "checkmark.circle.fill")
                        .font(.headline)
                        .widgetAccentable()
                } else {
                    Label("Sıradaki", systemImage: "clock")
                        .font(.headline)
                        .widgetAccentable()
                }
                Text("\(WidgetMetin.ad(s.vakit)) \(WidgetMetin.saat(s.ms))")
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                Text(timerInterval: girdi.date...VakitSaglayici.tarih(s.ms), countsDown: true)
                    .font(.caption)
                    .monospacedDigit()
                    .foregroundStyle(.secondary)
            } else {
                VeriYokGorunumu(eski: girdi.veriEski)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Ana ekran / StandBy: kucuk

private struct KucukGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs {
                AktifVakitPaneli(girdi: girdi, aktif: aktif, bitisMs: bitis, kilindi: g.kilindi, sonraki: g.sonraki)
            } else if let s = girdi.gorunum?.sonraki {
                SiradakiPaneli(girdi: girdi, sonraki: s)
            } else {
                VeriYokGorunumu(eski: girdi.veriEski)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

private struct AktifVakitPaneli: View {
    let girdi: VakitGirdisi
    let aktif: SiriVakitAni
    let bitisMs: Int64
    let kilindi: Bool
    let sonraki: SiriVakitAni?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: WidgetMetin.ikon(aktif.vakit))
                    .foregroundStyle(WidgetSabitleri.yesil)
                Text(WidgetMetin.ad(aktif.vakit))
                    .font(.headline)
                    .foregroundStyle(.primary)
                Spacer(minLength: 0)
                if kilindi {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(WidgetSabitleri.yesil)
                        .accessibilityLabel("Kılındı")
                }
            }
            if kilindi, let s = sonraki {
                Text("Sıradaki \(WidgetMetin.ad(s.vakit))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(WidgetMetin.saat(s.ms))
                    .font(.system(.title2, design: .rounded).weight(.semibold))
                    .monospacedDigit()
            } else {
                Text(timerInterval: girdi.date...VakitSaglayici.tarih(bitisMs), countsDown: true)
                    .font(.system(.title2, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                    .minimumScaleFactor(0.6)
                ProgressView(
                    timerInterval: VakitSaglayici.tarih(aktif.ms)...VakitSaglayici.tarih(bitisMs),
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .tint(WidgetSabitleri.yesil)
                Text("Çıkış \(WidgetMetin.saat(bitisMs))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
            if !kilindi, let kayit = VakitKarari.kayitVakti(aktif.vakit) {
                KildimDugmesi(tarih: aktif.tarih, kayitVakti: kayit, ad: WidgetMetin.ad(aktif.vakit))
            }
        }
    }
}

private struct SiradakiPaneli: View {
    let girdi: VakitGirdisi
    let sonraki: SiriVakitAni
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: WidgetMetin.ikon(sonraki.vakit))
                    .foregroundStyle(WidgetSabitleri.yesil)
                Text("Sıradaki")
                    .font(.headline)
            }
            Text("\(WidgetMetin.ad(sonraki.vakit)) \(WidgetMetin.saat(sonraki.ms))")
                .font(.system(.title3, design: .rounded).weight(.semibold))
            Text(timerInterval: girdi.date...VakitSaglayici.tarih(sonraki.ms), countsDown: true)
                .font(.caption)
                .monospacedDigit()
                .foregroundStyle(.secondary)
        }
    }
}

/// "Kildim" — yalniz iOS 17+ ana ekran (etkilesimli widget). Uzanti dagitim hedefi 16.2
/// oldugu icin kapi burada.
private struct KildimDugmesi: View {
    let tarih: String
    let kayitVakti: String
    let ad: String
    var body: some View {
        if #available(iOS 17.0, *) {
            KildimDugmesi17(tarih: tarih, kayitVakti: kayitVakti, ad: ad)
        }
    }
}

/// StandBy ve iPad kilit ekrani konteyner arka planini gizler
/// (`showsWidgetContainerBackground == false`) → orada dugme CIZILMEZ (salt okunur).
@available(iOS 17.0, *)
private struct KildimDugmesi17: View {
    let tarih: String
    let kayitVakti: String
    let ad: String
    @Environment(\.showsWidgetContainerBackground) private var konteynerGorunur

    var body: some View {
        if konteynerGorunur {
            Button(intent: KildimDugmesiIntent(tarih: tarih, vakit: kayitVakti)) {
                Label("Kıldım", systemImage: "checkmark")
                    .font(.caption.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .tint(WidgetSabitleri.yesil)
            .accessibilityLabel("\(ad) namazını kıldım")
        }
    }
}

// MARK: - Ana ekran: orta (aktif vakit + gunun bes vakti)

private struct OrtaGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            KucukGorunum(girdi: girdi)
            VStack(alignment: .leading, spacing: 3) {
                ForEach(girdi.gunVakitleri) { satir in
                    let aktifMi = girdi.gorunum?.aktif?.ms == satir.vakit.ms
                    HStack(spacing: 6) {
                        Image(systemName: satir.kilindi ? "checkmark.circle.fill" : "circle")
                            .font(.caption)
                            .foregroundStyle(satir.kilindi ? WidgetSabitleri.yesil : Color.secondary)
                        Text(WidgetMetin.ad(satir.vakit.vakit))
                            .font(.subheadline.weight(aktifMi ? .bold : .regular))
                        Spacer(minLength: 4)
                        Text(WidgetMetin.saat(satir.vakit.ms))
                            .font(.subheadline.weight(aktifMi ? .bold : .regular))
                            .monospacedDigit()
                    }
                    .foregroundStyle(.primary)
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel(
                        "\(WidgetMetin.ad(satir.vakit.vakit)) \(WidgetMetin.saat(satir.vakit.ms))\(satir.kilindi ? ", kılındı" : "")"
                    )
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Arka plan (iOS 17 `containerBackground` zorunlu)

extension View {
    @ViewBuilder
    func widgetArkaplani(_ aile: WidgetFamily) -> some View {
        let aksesuar = aile == .accessoryInline || aile == .accessoryCircular || aile == .accessoryRectangular
        if #available(iOS 17.0, *) {
            if aksesuar {
                containerBackground(for: .widget) { Color.clear }
            } else {
                containerBackground(for: .widget) { Color(.systemBackground) }
            }
        } else if aksesuar {
            self
        } else {
            padding().background(Color(.systemBackground))
        }
    }
}
