import CoreLocation
import SwiftUI
import WatchKit

// KIBLE (Apple Watch, #285 cilasi; Wear W2 ikizi). Aci telefonun yaklasik konumundan
// (`SaatYuku.konum`, ~11 km) SAF `Kible.aci` ile hesaplanir; yon CoreLocation pusulasindan.
//
// Pusula: `CLLocationManager.startUpdatingHeading()` (watchOS 2+, `headingAvailable` olan
// saatlerde — Series 5 ve sonrasi). Konum IZNI ISTENMEZ: saat konumu telefondan bilir.
// `trueHeading` gecerliyse (konum servisi acik) gercek kuzey kullanilir, degilse manyetik
// kuzey — Turkiye'de fark 5-7°; ekran bunu "yaklaşık" diye soyler. Pusulanin izin isteyip
// istemedigi ve dogrulugu cihazda DOGRULANMADI.
//
// Hareket: ok yalniz SENSOR OLAYIYLA doner (en kisa yay, asmasiz yay animasyonu); ekran
// gorunmezken pusula durur. Hizaya giriste TEK titresim (histerezis — cikis 15°).
final class SaatPusulasi: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var yon: Double?
    @Published private(set) var dogrulukDusuk = false
    @Published private(set) var gercekKuzey = false
    let destekleniyor: Bool

    private let yonetici = CLLocationManager()

    override init() {
        destekleniyor = CLLocationManager.headingAvailable() || SaatSimulatorTohumu.kibleYonu != nil
        super.init()
        yonetici.delegate = self
        yonetici.headingFilter = 2
    }

    func baslat() {
        if let sabit = SaatSimulatorTohumu.kibleYonu {
            // Gorunum guncellemesi icinde yayin yapma: bir sonraki turda yaz.
            DispatchQueue.main.async {
                self.yon = sabit
                self.gercekKuzey = true
            }
            return
        }
        guard CLLocationManager.headingAvailable() else { return }
        yonetici.startUpdatingHeading()
    }

    func durdur() {
        yonetici.stopUpdatingHeading()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        let gercek = newHeading.trueHeading >= 0
        let deger = gercek ? newHeading.trueHeading : newHeading.magneticHeading
        DispatchQueue.main.async {
            self.gercekKuzey = gercek
            self.dogrulukDusuk = newHeading.headingAccuracy < 0 || newHeading.headingAccuracy > 25
            self.yon = deger
        }
    }
}

struct KibleEkrani: View {
    let konum: SaatKonum?
    @StateObject private var pusula = SaatPusulasi()
    @State private var cizimAcisi: Double = 0
    @State private var hizali = false
    @Environment(\.accessibilityReduceMotion) private var hareketAzalt

    private var kibleAcisi: Double? {
        konum.map { Kible.aci(enlem: $0.lat, boylam: $0.lng) }
    }

    var body: some View {
        Group {
            if let kibleAcisi {
                if pusula.destekleniyor {
                    pusulaGorunumu(kibleAcisi)
                } else {
                    sabitAci(kibleAcisi)
                }
            } else {
                BilgiKarti(ikon: "location.slash", metin: "Kıble için iPhone'unuzda konumunuzu ayarlayın.")
            }
        }
        .navigationTitle("Kıble")
        .onAppear { pusula.baslat() }
        .onDisappear { pusula.durdur() }
        .onChange(of: pusula.yon) { _, yeni in
            guard let yeni, let kibleAcisi else { return }
            let hedef = Kible.hedefAcisi(kibleAcisi: kibleAcisi, yon: yeni)
            let h = Kible.hiza(oncekiHizali: hizali, hedef: hedef)
            if h.titret { WKInterfaceDevice.current().play(.success) }
            hizali = h.hizali
            let yeniCizim = Kible.enKisaYol(onceki: cizimAcisi, yeni: hedef)
            if hareketAzalt {
                cizimAcisi = yeniCizim
            } else {
                withAnimation(.spring(response: 0.35, dampingFraction: 1.0)) { cizimAcisi = yeniCizim }
            }
        }
    }

    private func pusulaGorunumu(_ kibleAcisi: Double) -> some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .stroke(hizali ? SaatGorunum.yesil : Color.secondary.opacity(0.35), lineWidth: hizali ? 4 : 2)
                // Ust ortadaki sabit isaret: saatin baktigi yon.
                Capsule()
                    .fill(Color.primary)
                    .frame(width: 3, height: 10)
                    .offset(y: -50)
                // Kabe oku: kiblenin saate gore acisi.
                Image(systemName: "location.north.fill")
                    .font(.system(size: 34, weight: .semibold))
                    .foregroundStyle(hizali ? SaatGorunum.yesil : Color.primary)
                    .rotationEffect(.degrees(cizimAcisi))
                    .opacity(pusula.yon == nil ? 0.3 : 1)
            }
            .frame(width: 110, height: 110)
            .accessibilityHidden(true)

            if pusula.yon == nil {
                Text("Pusula hazırlanıyor")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            } else if hizali {
                Label("Kıble yönündesiniz", systemImage: "checkmark.circle.fill")
                    .font(.headline)
                    .foregroundStyle(SaatGorunum.yesil)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            } else {
                Text(Kible.donusMetni(Kible.hedefAcisi(kibleAcisi: kibleAcisi, yon: pusula.yon ?? 0)))
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                    .lineLimit(1)
            }
            if pusula.dogrulukDusuk {
                Label("Saatinizi sekiz çizerek çevirin", systemImage: "arrow.triangle.2.circlepath")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            pusula.yon.map { Kible.erisimMetni(Kible.hedefAcisi(kibleAcisi: kibleAcisi, yon: $0), hizali: hizali) }
                ?? "Pusula hazırlanıyor"
        )
    }

    /// Pusulasiz saat: yalniz aci (kuzeyden saat yonunde).
    private func sabitAci(_ aci: Double) -> some View {
        VStack(spacing: 6) {
            Image(systemName: "location.north.line.fill")
                .font(.title2)
                .foregroundStyle(SaatGorunum.yesil)
                .rotationEffect(.degrees(aci))
                .accessibilityHidden(true)
            Text("\(Int(aci.rounded()))°")
                .font(.system(size: 36, weight: .semibold, design: .rounded))
                .monospacedDigit()
            Label("Kuzeyden saat yönünde", systemImage: "safari")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .minimumScaleFactor(0.7)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Kıble kuzeyden saat yönünde \(Int(aci.rounded())) derece")
    }
}

/// Ortak kucuk bilgi karti (veri yok / desteklenmiyor).
struct BilgiKarti: View {
    let ikon: String
    let metin: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: ikon)
                .font(.title2)
                .foregroundStyle(SaatGorunum.yesil)
                .accessibilityHidden(true)
            Text(metin)
                .font(.footnote)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.7)
        }
        .padding(.horizontal, 6)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
