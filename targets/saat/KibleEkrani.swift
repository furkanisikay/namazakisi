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
    @Environment(\.isLuminanceReduced) private var sistemSonuk

    private var sonuk: Bool { sistemSonuk || SaatSimulatorTohumu.sonuk }
    /// Cizim anindaki dil (W5, telefondan gelir).
    private var dil: String { SaatDili.kod }
    private var m: SaatMetinleri { SaatMetinleri.dil(dil) }

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
                BilgiKarti(ikon: "location.slash", metin: m.kibleKonumYok)
            }
        }
        .navigationTitle(m.kible)
        .containerBackground((hizali ? SaatGorunum.yesil : Color.white).opacity(sonuk ? 0.05 : (hizali ? 0.3 : 0.08)).gradient, for: .tabView)
        .onAppear {
            NSLog("[NamazSaat] Kible acildi (konum: %@, pusula: %@)", konum == nil ? "yok" : "var", pusula.destekleniyor ? "var" : "yok")
            pusula.baslat()
        }
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
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(hizali ? SaatGorunum.yesil : Color.secondary.opacity(0.35), lineWidth: hizali ? 4 : 2)
                // Pusula gulu: 30°'de bir cizgi + kuzey ("K"); saatle birlikte doner (gercek pusula hissi).
                PusulaGulu(sonuk: sonuk, kuzey: m.kuzeyHarfi)
                    .rotationEffect(.degrees(-(pusula.yon ?? 0)))
                    .opacity(pusula.yon == nil ? 0.3 : 1)
                // Halkanin tepesinde Kabe isareti: saatin baktigi yon. Ok ona donunce kible.
                KabeIsareti(hizali: hizali)
                    .offset(y: -55)
                // Ok: kiblenin saate gore acisi (0 = tam tepede, Kabe isaretinde).
                Image(systemName: "location.north.fill")
                    .font(.system(size: 34, weight: .semibold))
                    .foregroundStyle(hizali ? SaatGorunum.yesil : Color.primary)
                    .rotationEffect(.degrees(cizimAcisi))
                    .opacity(pusula.yon == nil ? 0.3 : 1)
            }
            .frame(width: 110, height: 110)
            .padding(.top, 8)
            .animation(hareketAzalt ? nil : .easeOut(duration: 0.25), value: hizali)
            .accessibilityHidden(true)

            if pusula.yon == nil {
                Text(m.pusulaHazirlaniyor)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            } else if hizali {
                Label(Kible.erisimMetni(0, hizali: true, dil: dil), systemImage: "checkmark.circle.fill")
                    .font(.headline)
                    .foregroundStyle(SaatGorunum.yesil)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            } else {
                Text(Kible.donusMetni(Kible.hedefAcisi(kibleAcisi: kibleAcisi, yon: pusula.yon ?? 0), dil: dil))
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                    .lineLimit(1)
            }
            // Kible acisi + Kabe'ye uzaklik: ikonla, noktali ayrac yok.
            if let konum, !sonuk {
                HStack(spacing: 8) {
                    Label("\(Int(kibleAcisi.rounded()))°", systemImage: "safari")
                    Label(Kible.mesafeMetni(Kible.mesafeKm(enlem: konum.lat, boylam: konum.lng), dil: dil), systemImage: "location.fill")
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
                .labelStyle(.titleAndIcon)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            }
            if pusula.dogrulukDusuk {
                Label(m.sekizCizin, systemImage: "arrow.triangle.2.circlepath")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            pusula.yon.map { Kible.erisimMetni(Kible.hedefAcisi(kibleAcisi: kibleAcisi, yon: $0), hizali: hizali, dil: dil) }
                ?? m.pusulaHazirlaniyor
        )
    }

    /// Pusulasiz saat: kuzeye gore yon kadrani (N tepede) + aci. Kullanici saati kuzeye
    /// cevirip oku izler; yon yine NET gosterilir.
    private func sabitAci(_ aci: Double) -> some View {
        VStack(spacing: 4) {
            ZStack {
                Circle().stroke(Color.secondary.opacity(0.35), lineWidth: 2)
                Text(m.kuzeyHarfi)
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(.secondary)
                    .offset(y: -40)
                Image(systemName: "location.north.fill")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(SaatGorunum.yesil)
                    .rotationEffect(.degrees(aci))
            }
            .frame(width: 96, height: 96)
            .accessibilityHidden(true)
            Text("\(Int(aci.rounded()))°")
                .font(.system(.title3, design: .rounded).weight(.semibold))
                .monospacedDigit()
            Text(m.kuzeyeCevirin)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.7)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(m.bicim(m.kuzeydenErisim, ["derece": String(Int(aci.rounded()))]))
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

/// Kabe isareti: kup (koyu) + altin kusak. Hizalaninca kenari yesil yanar. Dekoratif.
private struct KabeIsareti: View {
    let hizali: Bool
    private static let altin = Color(red: 0xD4 / 255.0, green: 0xAF / 255.0, blue: 0x37 / 255.0)

    var body: some View {
        RoundedRectangle(cornerRadius: 2.5)
            .fill(Color(white: 0.18))
            .frame(width: 16, height: 16)
            .overlay(
                Rectangle()
                    .fill(Self.altin)
                    .frame(height: 3)
                    .offset(y: -3.5)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 2.5)
                    .stroke(hizali ? SaatGorunum.yesil : Color.white.opacity(0.55), lineWidth: hizali ? 2 : 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 2.5))
            .accessibilityHidden(true)
    }
}

/// Pusula gulu: 12 cizgi (90°'lerde uzun) + kuzey harfi. Saatin yonuyle ters doner.
private struct PusulaGulu: View {
    let sonuk: Bool
    /// Kuzey harfi dilde ("K" / "N").
    let kuzey: String

    var body: some View {
        ZStack {
            ForEach(0..<12, id: \.self) { i in
                Capsule()
                    .fill(Color.white.opacity(i % 3 == 0 ? 0.55 : 0.25))
                    .frame(width: 2, height: i % 3 == 0 ? 8 : 5)
                    .offset(y: -44)
                    .rotationEffect(.degrees(Double(i) * 30))
            }
            Text(kuzey)
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .foregroundStyle(Color.red.opacity(sonuk ? 0.5 : 0.9))
                .offset(y: -32)
        }
        .accessibilityHidden(true)
    }
}
