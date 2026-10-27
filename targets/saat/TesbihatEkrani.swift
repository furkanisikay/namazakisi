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
    /// Cizim anindaki dil (W5). Zikir adlari ve tehlil o dilin Musluman toplulugunun yaygin
    /// okunusuyla (ceviri degil; `Tesbihat.Faz.ad(dil:)`, bilinmeyen dil Turkce).
    private var m: SaatMetinleri { SaatDili.metin }

    var body: some View {
        VStack(spacing: 4) {
            sayac
                .contentShape(Rectangle())
                .onTapGesture { say() }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(Tesbihat.kisaMetin(durum, dil: SaatDili.kod))
                .accessibilityHint(m.saymaIpucu)
                .accessibilityAddTraits(.isButton)
                .accessibilityAction { say() }
            if durum.tamamMi {
                Button(m.yenidenBaslayin) { kaydet(Tesbihat.Durum()) }
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
                .accessibilityLabel(m.sonSayimiGeriAlin)
                .disabled(durum.toplam == 0)
            }
        }
        .navigationTitle(m.tesbihat)
        .containerBackground(TesbihatRenk.ton.opacity(0.22).gradient, for: .tabView)
        .onAppear {
            durum = SaatDeposu.varsayilan.tesbihatOku(simdiMs: SaatDeposu.simdiMs())
        }
    }

    private var sayac: some View {
        VStack(spacing: 2) {
            ZStack {
                Circle()
                    .stroke(TesbihatRenk.ton.opacity(0.25), lineWidth: 9)
                Circle()
                    .trim(from: 0, to: CGFloat(durum.tamamMi ? 1 : durum.fazIlerlemesi))
                    .stroke(durum.tamamMi ? SaatGorunum.yesil : TesbihatRenk.ton, style: StrokeStyle(lineWidth: 9, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.easeOut(duration: 0.15), value: durum.toplam)
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
            Text(durum.tamamMi ? Samimiyet.kabulDuasi(SaatDili.kod) : durum.faz.ad(dil: SaatDili.kod))
                .font(.headline)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            if durum.tamamMi {
                Text(Tesbihat.tehlilMetni(dil: SaatDili.kod))
                    .font(.caption2)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .minimumScaleFactor(0.5)
            } else {
                // Dort faz noktasi (tamamlanan dolu, suren halka): toplam ilerleme rakamsiz okunur.
                HStack(spacing: 5) {
                    ForEach(Tesbihat.Faz.allCases, id: \.rawValue) { f in
                        Circle()
                            .fill(f.rawValue < durum.faz.rawValue ? TesbihatRenk.ton : Color.clear)
                            .overlay(Circle().stroke(TesbihatRenk.ton.opacity(f == durum.faz ? 1 : 0.5), lineWidth: 1.5))
                            .frame(width: 7, height: 7)
                    }
                }
                .accessibilityHidden(true)
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

enum TesbihatRenk {
    /// Tesbihatin tonu (nane yesili): vakit renklerinden ve "kilindi" yesilinden ayrisir. Dekoratif.
    static let ton = Color(red: 0.35, green: 0.85, blue: 0.75)
}
