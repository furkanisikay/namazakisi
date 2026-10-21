import SwiftUI
import WatchKit

// APPLE WATCH ANA EKRANI (#285 yeniden tasarim — watchOS 10 dili).
//
// Dikey sayfali `TabView` (Digital Crown sayfalar arasinda gezer):
//   1. Simdi    — vakte gore renk tonu, geri sayimi ceviren ilerleme HALKASI, buyuk "Kildim".
//                 Kilinca halka kapanir + tik cizilir + tek haptik (tek olay, tek sahne).
//   2. Bugun    — 24 saatlik gun KADRANI: bes vakit penceresi yay, girisleri nokta,
//                 kilinan dolu; taçla vakte odaklanma (saat + durum ortada).
//   3. Kible    — Kabe isareti, ±5° yesil hiza.
//   4. Tesbihat — Digital Crown ile sayim.
//
// Gorsel dil: her vakit TEK renk tonu (dekoratif; metin daima sistem rengi), SF Symbols
// hiyerarsik, sayilar SF Rounded. Sayfa zemini vaktin tonuyla hafif boyanir
// (`containerBackground(for: .tabView)`). Her zaman acik ekranda (`isLuminanceReduced`)
// sonuk varyant: dugme yok, renkler kisik, saniye yok. Hareket YALNIZ olayla baslar.
//
// Karar iPhone widget'iyla AYNI saf koddan (`SaatKarari` → `WidgetKarari`/`VakitKarari`);
// geri sayimi sistem cizer (`Text(timerInterval:)`). Arayuz metni kibar "siz".

enum SaatGorunum {
    /// Uygulamanin birincil yesili (#4CAF50) — "kilindi" durumunun rengi. Dekoratif.
    static let yesil = Color(red: 0x4C / 255.0, green: 0xAF / 255.0, blue: 0x50 / 255.0)

    /// Vaktin renk tonu (gunun isigi): sabah safak moru, ogle gunes altini, ikindi kehribar,
    /// aksam gun batimi mercani, yatsi gece mavisi. YALNIZ dekoratif (halka, ikon, zemin).
    static func renk(_ kod: String) -> Color {
        switch kod {
        case "sabah": return Color(red: 0.62, green: 0.56, blue: 1.00)
        case "ogle": return Color(red: 1.00, green: 0.78, blue: 0.27)
        case "ikindi": return Color(red: 1.00, green: 0.62, blue: 0.27)
        case "aksam": return Color(red: 1.00, green: 0.44, blue: 0.38)
        case "yatsi": return Color(red: 0.42, green: 0.55, blue: 1.00)
        default: return Color(red: 1.00, green: 0.82, blue: 0.48)
        }
    }

    static func ikon(_ kod: String) -> String {
        switch kod {
        case "sabah": return "sunrise.fill"
        case "ogle": return "sun.max.fill"
        case "ikindi": return "sun.haze.fill"
        case "aksam": return "sunset.fill"
        case "yatsi": return "moon.stars.fill"
        default: return "sun.horizon.fill"
        }
    }

    static func tarih(_ ms: Int64) -> Date {
        SaatDeposu.tarih(ms)
    }

    /// `Text(timerInterval:)` icin GUVENLI aralik: alt sinir ust siniri gecerse (saat
    /// ileri alindi, bayat girdi) `ClosedRange` cokertirdi.
    static func aralik(_ simdi: Date, _ hedefMs: Int64) -> ClosedRange<Date> {
        let hedef = tarih(hedefMs)
        return min(simdi, hedef)...hedef
    }

    /// Gecen kesir [0, 1] (bas → bitis); bozuk aralikta 0.
    static func gecen(_ basMs: Int64, _ bitisMs: Int64, simdi: Date) -> Double {
        guard bitisMs > basMs else { return 0 }
        let k = Double(SaatDeposu.simdiMs(simdi) - basMs) / Double(bitisMs - basMs)
        return min(max(k, 0), 1)
    }
}

enum SaatSayfa: Hashable {
    case simdi, bugun, kible, tesbihat
}

struct AnaEkran: View {
    @EnvironmentObject private var baglanti: SaatBaglantisi
    @EnvironmentObject private var uyandirici: SaatUyandirici
    @Environment(\.scenePhase) private var sahne
    @State private var sayfa: SaatSayfa = SaatSimulatorTohumu.acilisSayfasi

    var body: some View {
        NavigationStack {
            TimelineView(.everyMinute) { baglam in
                sayfalar(simdi: baglam.date, yenileme: baglanti.yenileme)
            }
        }
        .fullScreenCover(isPresented: uyandirmaAcik) {
            if let kayit = uyandirici.calan ?? SaatSimulatorTohumu.uyandirmaKaydi() {
                UyandirmaEkrani(kayit: kayit)
                    .environmentObject(uyandirici)
            }
        }
        .onChange(of: sahne) { _, yeni in
            guard yeni == .active else { return }
            baglanti.baslat()
            SaatHatirlatici.paylasilan.izinIste()
            SaatHatirlatici.paylasilan.tazele()
            // watchOS: akilli alarm oturumu YALNIZ etkin uygulamada kurulabilir.
            uyandirici.kur()
        }
    }

    private var uyandirmaAcik: Binding<Bool> {
        Binding(
            get: { uyandirici.calan != nil || SaatSimulatorTohumu.acilisEkrani == .uyandirma },
            set: { _ in }
        )
    }

    @ViewBuilder
    private func sayfalar(simdi: Date, yenileme: Int) -> some View {
        let depo = SaatDeposu.varsayilan
        if let yuk = depo.yuk() {
            let durum = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: depo.bekleyenler(), simdiMs: SaatDeposu.simdiMs(simdi))
            TabView(selection: $sayfa) {
                SimdiSayfasi(durum: durum, simdi: simdi, surumYeni: depo.surumYeniMi(), kuruluUyandirma: uyandirici.kurulu)
                    .tag(SaatSayfa.simdi)
                BugunSayfasi(yuk: yuk, durum: durum, simdi: simdi)
                    .tag(SaatSayfa.bugun)
                KibleEkrani(konum: yuk.konum)
                    .tag(SaatSayfa.kible)
                TesbihatEkrani()
                    .tag(SaatSayfa.tesbihat)
            }
            .tabViewStyle(.verticalPage)
        } else {
            BosDurum(surumYeni: depo.surumYeniMi())
        }
    }
}

// MARK: - Veri yok

private struct BosDurum: View {
    let surumYeni: Bool

    var body: some View {
        ScrollView {
            BilgiKarti(
                ikon: surumYeni ? "arrow.down.app" : "iphone",
                metin: surumYeni
                    ? "Saatinizdeki Namaz Akışı'nı güncelleyin."
                    : "Vakitler iPhone'unuzdan gelir. iPhone'unuzda Namaz Akışı'nı bir kez açın."
            )
            .padding(.vertical, 8)
        }
        .navigationTitle("Namaz Akışı")
    }
}

// MARK: - Simdi

/// Halkanin tik isareti (cizilerek gelir).
struct TikSekli: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.minX + r.width * 0.12, y: r.minY + r.height * 0.55))
        p.addLine(to: CGPoint(x: r.minX + r.width * 0.40, y: r.minY + r.height * 0.82))
        p.addLine(to: CGPoint(x: r.minX + r.width * 0.90, y: r.minY + r.height * 0.20))
        return p
    }
}

struct SimdiSayfasi: View {
    let durum: SaatEkranDurumu
    let simdi: Date
    let surumYeni: Bool
    let kuruluUyandirma: SaatUyandirmaKaydi?
    @EnvironmentObject private var baglanti: SaatBaglantisi
    @Environment(\.isLuminanceReduced) private var sistemSonuk
    @Environment(\.accessibilityReduceMotion) private var hareketAzalt
    @State private var onayAcik = false
    /// Tik cizimi (0 → 1). Sayfa zaten kilinmis acilirsa 1 (animasyonsuz).
    @State private var tik: CGFloat = 1

    private var sonuk: Bool { sistemSonuk || SaatSimulatorTohumu.sonuk }

    /// Simdi gosterilen vakit: suren (aktif) ya da yoksa siradaki.
    private var odakKodu: String {
        durum.gorunum.aktif?.vakit ?? durum.gorunum.sonraki?.vakit ?? "ogle"
    }

    private var ton: Color {
        kilindiMi ? SaatGorunum.yesil : SaatGorunum.renk(odakKodu)
    }

    private var kilindiMi: Bool { durum.gorunum.aktif != nil && durum.gorunum.kilindi }

    private var aday: (vakit: SiriVakitAni, ad: String)? {
        if case .aday(let vakit, _, let ad) = durum.kildim { return (vakit, ad) }
        return nil
    }

    var body: some View {
        VStack(spacing: 6) {
            if durum.veriEski {
                BilgiKarti(ikon: "arrow.clockwise", metin: "Vakitleri güncellemek için iPhone'unuzda Namaz Akışı'nı açın.")
            } else {
                halka
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                altSatir
            }
        }
        .padding(.horizontal, 4)
        .navigationTitle(baslik)
        .containerBackground(ton.opacity(sonuk ? 0.08 : 0.28).gradient, for: .tabView)
        .confirmationDialog(VakitKarari.onayMetni(aday?.ad ?? ""), isPresented: $onayAcik, titleVisibility: .visible) {
            Button("İşaretle") { isaretle() }
            Button("Vazgeç", role: .cancel) {}
        }
        .onAppear {
            // Yalniz simulator kare cekimi (cihazda acilisEkrani daima nil).
            switch SaatSimulatorTohumu.acilisEkrani {
            case .onay where aday != nil:
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { onayAcik = true }
            case .kildimDemo where aday != nil:
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { isaretle() }
            default:
                break
            }
        }
    }

    private var baslik: String {
        if let a = durum.gorunum.aktif { return VakitKarari.gorunenAd(a.vakit) }
        if let s = durum.gorunum.sonraki { return VakitKarari.gorunenAd(s.vakit) }
        return "Namaz Akışı"
    }

    // MARK: Halka

    private var halka: some View {
        let kesir: Double
        let hedefMs: Int64?
        if let a = durum.gorunum.aktif, let b = durum.gorunum.bitisMs {
            kesir = kilindiMi ? 1 : SaatGorunum.gecen(a.ms, b, simdi: simdi)
            hedefMs = kilindiMi ? durum.gorunum.sonraki?.ms : b
        } else {
            kesir = 0
            hedefMs = durum.gorunum.sonraki?.ms
        }
        let kalinlik: CGFloat = sonuk ? 5 : 10
        return ZStack {
            Circle()
                .stroke(ton.opacity(sonuk ? 0.18 : 0.25), lineWidth: kalinlik)
            Circle()
                .trim(from: 0, to: kesir)
                .stroke(ton.opacity(sonuk ? 0.6 : 1), style: StrokeStyle(lineWidth: kalinlik, lineCap: .round))
                .rotationEffect(.degrees(-90))
            if kilindiMi {
                TikSekli()
                    .trim(from: 0, to: tik)
                    .stroke(SaatGorunum.yesil.opacity(sonuk ? 0.6 : 1), style: StrokeStyle(lineWidth: 7, lineCap: .round, lineJoin: .round))
                    .frame(width: 44, height: 36)
                    .accessibilityLabel("\(baslik) kılındı")
            } else {
                VStack(spacing: 0) {
                    Image(systemName: SaatGorunum.ikon(odakKodu))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(ton)
                        .font(.system(size: 18, weight: .semibold))
                        .accessibilityHidden(true)
                    if let hedefMs {
                        Text(timerInterval: SaatGorunum.aralik(simdi, hedefMs), countsDown: true, showsHours: true)
                            .font(.system(size: 30, weight: .semibold, design: .rounded))
                            .monospacedDigit()
                            .lineLimit(1)
                            .minimumScaleFactor(0.5)
                            .padding(.horizontal, 14)
                            .accessibilityLabel(durum.gorunum.aktif != nil ? "Çıkışa kalan süre" : "Girişe kalan süre")
                        Label {
                            Text(SaatDeposu.saatMetni(hedefMs)).monospacedDigit()
                        } icon: {
                            Image(systemName: durum.gorunum.aktif != nil ? "hourglass.bottomhalf.filled" : "arrow.right.circle.fill")
                        }
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel("\(durum.gorunum.aktif != nil ? "Çıkış" : "Giriş") \(SaatDeposu.saatMetni(hedefMs))")
                    }
                }
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .padding(kalinlik / 2)
        .animation(hareketAzalt ? nil : .easeInOut(duration: 0.6), value: kilindiMi)
        .onChange(of: kilindiMi) { eski, yeni in
            guard yeni, !eski else { return }
            // Kilinma ANI: halka kapanir (yukaridaki animasyon), ardindan tik cizilir.
            if hareketAzalt {
                tik = 1
            } else {
                tik = 0
                withAnimation(.easeOut(duration: 0.45).delay(0.35)) { tik = 1 }
            }
        }
    }

    // MARK: Alt satir

    @ViewBuilder
    private var altSatir: some View {
        if kilindiMi {
            // Sonraki vakit, tek satirda: ikon + ad + saat.
            if let s = durum.gorunum.sonraki {
                Label {
                    Text("\(VakitKarari.gorunenAd(s.vakit)) \(SaatDeposu.saatMetni(s.ms))")
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                } icon: {
                    Image(systemName: SaatGorunum.ikon(s.vakit))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(SaatGorunum.renk(s.vakit))
                }
                .font(.footnote.weight(.semibold))
                .accessibilityLabel("Sıradaki \(VakitKarari.gorunenAd(s.vakit)), \(SaatDeposu.saatMetni(s.ms))")
            }
        } else if let aday, !sonuk {
            Button {
                onayAcik = true
            } label: {
                Label("Kıldım", systemImage: "checkmark")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
            }
            .tint(ton)
            .buttonStyle(.borderedProminent)
            .accessibilityLabel("\(aday.ad) namazını kıldım olarak işaretleyin")
        } else if let u = kuruluUyandirma, !sonuk {
            Label {
                Text(SaatDeposu.saatMetni(u.ms)).monospacedDigit()
            } icon: {
                Image(systemName: u.nafile ? "moon.zzz.fill" : "alarm.fill")
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(ton)
            }
            .font(.footnote)
            .accessibilityLabel("Sessiz uyandırma \(SaatDeposu.saatMetni(u.ms))")
        } else if surumYeni, !sonuk {
            Label("Güncelleyin", systemImage: "arrow.down.app")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }

    private func isaretle() {
        guard let aday else { return }
        if baglanti.kildim(beklenen: aday.vakit) {
            WKInterfaceDevice.current().play(.success)
        } else {
            // Onay acikken vakit degisti: yanlis vakit isaretlenmez.
            WKInterfaceDevice.current().play(.failure)
        }
    }
}
