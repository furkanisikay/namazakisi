import SwiftUI
import WatchKit

// TESBIHAT SAYACI (issue #285, Wear #293 ikizi). Saatte BAGIMSIZDIR: telefona, yuke ve
// yedege girmez. Durum tek tamsayidir (`Tesbihat.Durum`); her dokunusta saatin deposuna
// yazilir, 90 dk'dan eski oturum acilista sifirdan baslar.
//
// Sayim: ekrana dokunma ya da Digital Crown. Taç `TacBiriktirici`'den gecer (ayni yonde
// esik, olay basina en cok bir adim, iki adim arasi >= 120 ms) — ham donusu dogrudan
// sayima baglamak hizli savurusta cift sayardi. YON ANLAMLIDIR: pozitif donus sayar,
// ters donus son sayimi geri alir (eskiden iki yon de sayiyordu).
//
// Tasma: 40/41 mm ekranda halka + baslik + tehlil metni + dugme sigmiyordu. Tamamlaninca
// halka kuculur, tehlil metni en cok 3 satir ve olcekli; yazi boyu buyutulse de
// `minimumScaleFactor` + `lineLimit` metni keser, ekrani tasirmaz.
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
                .accessibilityHint("Saymak için dokunun ya da Digital Crown'u çevirin; ters yöne çevirmek geri alır")
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
            switch biriktirici.olay(yeni - eski, zamanMs: SaatDeposu.simdiMs()) {
            case .say: say()
            case .geriAl: geriAl()
            case .yok: break
            }
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
        VStack(spacing: 2) {
            ZStack {
                Circle()
                    .stroke(Color.secondary.opacity(0.3), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: CGFloat(durum.fazIlerlemesi))
                    .stroke(SaatGorunum.yesil, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                if durum.tamamMi {
                    Image(systemName: "checkmark")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(SaatGorunum.yesil)
                } else {
                    VStack(spacing: 0) {
                        Text("\(durum.fazSayisi)")
                            .font(.system(size: 32, weight: .semibold, design: .rounded))
                            .monospacedDigit()
                            .lineLimit(1)
                            .minimumScaleFactor(0.5)
                        Text("/ \(durum.faz.hedef)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
            }
            .frame(width: durum.tamamMi ? 52 : 92, height: durum.tamamMi ? 52 : 92)
            Text(durum.tamamMi ? "Tamamlandı" : durum.faz.ad)
                .font(.headline)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            if durum.tamamMi {
                Text(Tesbihat.tehlilMetni)
                    .font(.caption2)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .minimumScaleFactor(0.5)
            } else {
                Text("\(durum.toplam)/\(Tesbihat.toplamHedef)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(.horizontal, 4)
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
