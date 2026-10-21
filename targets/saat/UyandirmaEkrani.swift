import SwiftUI
import WatchKit

// SESSIZ UYANDIRMA EKRANI (#285 yeniden tasarim). Bilek titrerken uygulama acilinca
// (sistem alarm uyarisindaki "Ac") ya da uygulama zaten acikken gosterilir. Iki dugme:
// "Kildim" ve "Kapat". ERTELE YOK (sahip karari 2026-10-19).
//
// Dil ana ekranla AYNI: vaktin tonu (sabah safak moru, teheccud gece mavisi) zemine
// ustten dogan isik olarak dusar; ikon ton daireli, saat SF Rounded. Hareket yalniz olayla:
// ekran acilinca ikonun etrafindan TEK bir halka dalgasi yayilir (titresimle ayni an) ve
// ikon bir kez seker; "Animasyonlari azalt" acikken hic oynamaz. 41 mm'de kaydirmadan sigar.
struct UyandirmaEkrani: View {
    let kayit: SaatUyandirmaKaydi
    @EnvironmentObject private var uyandirici: SaatUyandirici
    @Environment(\.accessibilityReduceMotion) private var hareketAzalt
    @State private var seke = 0
    @State private var dalga = false

    private var ikon: String { kayit.nafile ? "moon.stars.fill" : "sunrise.fill" }
    private var ad: String { kayit.nafile ? "Teheccüd" : "Sabah" }
    private var ton: Color { SaatGorunum.renk(kayit.nafile ? "yatsi" : "sabah") }

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .stroke(ton.opacity(dalga ? 0 : 0.7), lineWidth: 2)
                        .scaleEffect(dalga ? 1.9 : 1)
                    Circle()
                        .fill(ton.opacity(0.25))
                    Image(systemName: ikon)
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(ton)
                        .font(.system(size: 20, weight: .semibold))
                        .symbolEffect(.bounce, value: seke)
                }
                .frame(width: 40, height: 40)
                .accessibilityHidden(true)
                Text(ad)
                    .font(.headline)
                    .lineLimit(1)
                Text(Date(), style: .time)
                    .font(.system(size: 32, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Label {
                    Text(SaatDeposu.saatMetni(kayit.sonMs)).monospacedDigit()
                } icon: {
                    Image(systemName: kayit.nafile ? "sun.horizon.fill" : "hourglass.bottomhalf.filled")
                }
                .font(.footnote)
                .foregroundStyle(.secondary)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(kayit.nafile ? "İmsak \(SaatDeposu.saatMetni(kayit.sonMs))" : "Vaktin sonu \(SaatDeposu.saatMetni(kayit.sonMs))")
                HStack(spacing: 6) {
                    Button {
                        uyandirici.kildim()
                    } label: {
                        Label("Kıldım", systemImage: "checkmark")
                            .font(.headline)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                            .frame(maxWidth: .infinity)
                    }
                    .tint(ton)
                    .buttonStyle(.borderedProminent)
                    .accessibilityLabel("\(ad) namazını kıldım olarak işaretleyin")
                    Button {
                        uyandirici.kapat()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.body.weight(.semibold))
                    }
                    .frame(width: 52)
                    .accessibilityLabel("Uyandırmayı kapatın")
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, 2)
        }
        // Tam ekran kapagin sistem "X"i uyandirmayi cevapsiz kapatirdi: kapatmanin tek yolu
        // "Kapat" (telefonun yedegini de susturur). Zemin: vaktin isigi ustten.
        .background(
            ZStack {
                Color.black
                RadialGradient(colors: [ton.opacity(0.45), .clear], center: .top, startRadius: 0, endRadius: 220)
            }
            .ignoresSafeArea()
        )
        .toolbar(.hidden, for: .navigationBar)
        .interactiveDismissDisabled()
        .onAppear {
            guard !hareketAzalt else { return }
            seke += 1
            withAnimation(.easeOut(duration: 1.2)) { dalga = true }
        }
    }
}
