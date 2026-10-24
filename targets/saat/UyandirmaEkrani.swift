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
    /// Cizim anindaki dil (W5, telefondan gelir).
    private var m: SaatMetinleri { SaatDili.metin }
    private var vm: VakitMetinleri { SaatDili.vakit }
    private var ad: String { kayit.nafile ? m.teheccud : vm.ad("sabah") }
    private var ton: Color { SaatGorunum.renk(kayit.nafile ? "yatsi" : "sabah") }

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                // Ikon + ad TEK satir (41 mm'de iki dugme de kaydirmadan gorunsun — kanitlandi).
                HStack(spacing: 6) {
                    ZStack {
                        Circle()
                            .stroke(ton.opacity(dalga ? 0 : 0.7), lineWidth: 2)
                            .scaleEffect(dalga ? 1.9 : 1)
                        Circle()
                            .fill(ton.opacity(0.25))
                        Image(systemName: ikon)
                            .symbolRenderingMode(.hierarchical)
                            .foregroundStyle(ton)
                            .font(.system(size: 15, weight: .semibold))
                            .symbolEffect(.bounce, value: seke)
                    }
                    .frame(width: 30, height: 30)
                    .accessibilityHidden(true)
                    Text(ad)
                        .font(.headline)
                        .lineLimit(1)
                }
                Text(Date(), style: .time)
                    .font(.system(size: 30, weight: .semibold, design: .rounded))
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
                .accessibilityLabel(m.bicim(kayit.nafile ? m.imsakSaat : m.vaktinSonu, ["saat": SaatDeposu.saatMetni(kayit.sonMs)]))
                HStack(spacing: 6) {
                    Button {
                        uyandirici.kildim()
                    } label: {
                        Label(vm.kildim, systemImage: "checkmark")
                            .font(.headline)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                            .frame(maxWidth: .infinity)
                    }
                    .tint(ton)
                    .buttonStyle(.borderedProminent)
                    .accessibilityLabel(m.bicim(m.kildimErisim, ["ad": ad]))
                    Button {
                        uyandirici.kapat()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.body.weight(.semibold))
                    }
                    .frame(width: 52)
                    .accessibilityLabel(m.uyandirmayiKapatin)
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
