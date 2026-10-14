import SwiftUI
import WatchKit

// TESBIHAT SAYACI (issue #285, Wear #293 ikizi). Saatte BAGIMSIZDIR: telefona, yuke ve
// yedege girmez. Durum tek tamsayidir (`Tesbihat.Durum`); her dokunusta saatin deposuna
// yazilir, 90 dk'dan eski oturum acilista sifirdan baslar.
//
// Sayim: ekrana dokunma ya da Digital Crown. Taç `TacBiriktirici`'den gecer (ayni yonde
// esik, olay basina en cok bir sayim, iki sayim arasi >= 120 ms) — ham donusu dogrudan
// sayima baglamak hizli savurusta cift sayardi.
struct TesbihatEkrani: View {
    @State private var durum = Tesbihat.Durum()
    @State private var tac: Double = 0
    @State private var biriktirici = TacBiriktirici(esik: 1.0)

    var body: some View {
        VStack(spacing: 4) {
            sayac
                .contentShape(Rectangle())
                .onTapGesture { say() }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Tesbihat.kisaMetin(durum))
                .accessibilityHint("Saymak için dokunun ya da Digital Crown'u çevirin")
                .accessibilityAddTraits(.isButton)
                .accessibilityAction { say() }
            if durum.tamamMi {
                Button("Yeniden başlayın") { kaydet(Tesbihat.Durum()) }
                    .tint(SaatGorunum.yesil)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .focusable()
        .digitalCrownRotation(
            $tac,
            from: -1_000_000,
            through: 1_000_000,
            by: 1,
            sensitivity: .low,
            isContinuous: true,
            isHapticFeedbackEnabled: false
        )
        .onChange(of: tac) { eski, yeni in
            if biriktirici.olay(yeni - eski, zamanMs: SaatDeposu.simdiMs()) { say() }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    geriAl()
                } label: {
                    Image(systemName: "arrow.uturn.backward")
                }
                .accessibilityLabel("Son sayımı geri alın")
                .disabled(durum.toplam == 0)
            }
        }
        .navigationTitle("Tesbihat")
        .onAppear {
            durum = SaatDeposu.varsayilan.tesbihatOku(simdiMs: SaatDeposu.simdiMs())
        }
    }

    private var sayac: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(Color.secondary.opacity(0.3), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: CGFloat(durum.fazIlerlemesi))
                    .stroke(SaatGorunum.yesil, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text("\(durum.fazSayisi)")
                        .font(.system(size: 32, weight: .semibold, design: .rounded))
                        .monospacedDigit()
                    Text("/ \(durum.faz.hedef)")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 92, height: 92)
            Text(durum.faz.ad)
                .font(.headline)
            if durum.tamamMi {
                Text(Tesbihat.tehlilMetni)
                    .font(.caption2)
                    .multilineTextAlignment(.center)
                    .lineLimit(4)
                    .minimumScaleFactor(0.6)
            } else {
                Text("\(durum.toplam)/\(Tesbihat.toplamHedef)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func say() {
        let sonuc = Tesbihat.say(durum)
        guard sonuc.olay != .yok else { return }
        kaydet(sonuc.durum)
        hisset(sonuc.olay)
    }

    private func geriAl() {
        let sonuc = Tesbihat.geriAl(durum)
        guard sonuc.olay != .yok else { return }
        kaydet(sonuc.durum)
        hisset(sonuc.olay)
    }

    private func kaydet(_ yeni: Tesbihat.Durum) {
        durum = yeni
        SaatDeposu.varsayilan.tesbihatYaz(yeni, simdiMs: SaatDeposu.simdiMs())
    }

    private func hisset(_ olay: Tesbihat.Olay) {
        let cihaz = WKInterfaceDevice.current()
        switch olay {
        case .tik: cihaz.play(.click)
        case .fazTamam: cihaz.play(.success)
        case .bitti: cihaz.play(.notification)
        case .geriAlindi: cihaz.play(.directionDown)
        case .yok: break
        }
    }
}
