import SwiftUI
import WatchKit

// SESSIZ UYANDIRMA EKRANI (#285 cilasi). Bilek titrerken uygulama acilinca (sistem
// alarm uyarisindaki "Ac") ya da uygulama zaten acikken gosterilir. Iki dugme: "Kildim"
// ve "Kapat". ERTELE YOK (sahip karari 2026-10-19).
//
// Duzen: buyuk ikon + vakit adi + BUYUK saat; altinda ikonla vaktin sonu (noktali ayrac
// yok). Hareket yalniz olayla: ekran acilinca ikon BIR KEZ seker (titresimle ayni an);
// "Animasyonlari azalt" acikken hic oynamaz. Metin daima sistem rengidir, yesil dekoratif.
struct UyandirmaEkrani: View {
    let kayit: SaatUyandirmaKaydi
    @EnvironmentObject private var uyandirici: SaatUyandirici
    @Environment(\.accessibilityReduceMotion) private var hareketAzalt
    @State private var seke = 0

    private var ikon: String { kayit.nafile ? "moon.stars.fill" : "sunrise.fill" }
    private var ad: String { kayit.nafile ? "Teheccüd" : "Sabah" }

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                Image(systemName: ikon)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(SaatGorunum.yesil)
                    .symbolEffect(.bounce, value: seke)
                    .accessibilityHidden(true)
                Text(ad)
                    .font(.headline)
                    .lineLimit(1)
                Text(Date(), style: .time)
                    .font(.system(size: 40, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Label(SaatDeposu.saatMetni(kayit.sonMs), systemImage: kayit.nafile ? "sun.horizon.fill" : "hourglass.bottomhalf.filled")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .accessibilityLabel(kayit.nafile ? "İmsak \(SaatDeposu.saatMetni(kayit.sonMs))" : "Vaktin sonu \(SaatDeposu.saatMetni(kayit.sonMs))")
                Button {
                    uyandirici.kildim()
                } label: {
                    Label("Kıldım", systemImage: "checkmark")
                        .frame(maxWidth: .infinity)
                }
                .tint(SaatGorunum.yesil)
                .buttonStyle(.borderedProminent)
                .padding(.top, 4)
                .accessibilityLabel("\(ad) namazını kıldım olarak işaretleyin")
                Button {
                    uyandirici.kapat()
                } label: {
                    Label("Kapat", systemImage: "xmark")
                        .frame(maxWidth: .infinity)
                }
                .accessibilityLabel("Uyandırmayı kapatın")
            }
            .padding(.horizontal, 2)
        }
        .onAppear {
            if !hareketAzalt { seke += 1 }
        }
    }
}
