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
        // 41 mm'de KAYDIRMADAN sigar: baslik tek satir (ikon + ad), saat 32 pt, iki dugme
        // yan yana ("Kildim" genis, "Kapat" ikon). ScrollView yalniz cok buyuk yazi boyutu icin.
        ScrollView {
            VStack(spacing: 4) {
                Label {
                    Text(ad).lineLimit(1)
                } icon: {
                    Image(systemName: ikon)
                        .foregroundStyle(SaatGorunum.yesil)
                        .symbolEffect(.bounce, value: seke)
                }
                .font(.headline)
                Text(Date(), style: .time)
                    .font(.system(size: 32, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Label(SaatDeposu.saatMetni(kayit.sonMs), systemImage: kayit.nafile ? "sun.horizon.fill" : "hourglass.bottomhalf.filled")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .accessibilityLabel(kayit.nafile ? "İmsak \(SaatDeposu.saatMetni(kayit.sonMs))" : "Vaktin sonu \(SaatDeposu.saatMetni(kayit.sonMs))")
                HStack(spacing: 6) {
                    Button {
                        uyandirici.kildim()
                    } label: {
                        Label("Kıldım", systemImage: "checkmark")
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                            .frame(maxWidth: .infinity)
                    }
                    .tint(SaatGorunum.yesil)
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
        // "Kapat" (telefonun yedegini de susturur). Zemin opak — alttaki liste parlamasin.
        .background(Color.black.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .interactiveDismissDisabled()
        .onAppear {
            if !hareketAzalt { seke += 1 }
        }
    }
}
