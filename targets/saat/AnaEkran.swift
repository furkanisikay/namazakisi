import SwiftUI
import WatchKit

// APPLE WATCH ANA EKRANI (issue #285): aktif/siradaki vakit + kalan sure, gunun bes
// vakti ve "Kildim". Karar iPhone widget'iyla AYNI saf koddan (`SaatKarari` →
// `WidgetKarari`/`VakitKarari`); kalan sureyi sistem cizer (`Text(timerInterval:)`).
// Metinler arayuz kaydindadir (kibar "siz"); ibadete cagri dili hatirlatma
// bildirimlerindedir (iPhone'dan yansir).

enum SaatGorunum {
    /// Uygulamanin birincil yesili (#4CAF50). Yalniz DEKORATIF (ikon, halka, dugme zemini);
    /// metin daima sistem `primary`/`secondary` (kontrast).
    static let yesil = Color(red: 0x4C / 255.0, green: 0xAF / 255.0, blue: 0x50 / 255.0)

    static func ikon(_ kod: String) -> String {
        switch kod {
        case "sabah": return "sunrise.fill"
        case "ogle": return "sun.max.fill"
        case "ikindi": return "sun.haze.fill"
        case "aksam": return "sunset.fill"
        case "yatsi": return "moon.stars.fill"
        default: return "clock"
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
}

struct AnaEkran: View {
    @EnvironmentObject private var baglanti: SaatBaglantisi
    @Environment(\.scenePhase) private var sahne
    /// Yalniz simulator kare cekimi (`SaatSimulatorTohumu`) acar; cihazda daima false.
    @State private var tesbihatAcik = false

    var body: some View {
        NavigationStack {
            // Dakikada bir yeniden degerlendirme: vakit siniri gecince ekran kendiliginden doner.
            TimelineView(.everyMinute) { baglam in
                icerik(simdi: baglam.date, yenileme: baglanti.yenileme)
            }
            .navigationTitle("Namaz Akışı")
            .navigationDestination(isPresented: $tesbihatAcik) {
                TesbihatEkrani()
            }
        }
        .onAppear {
            if SaatSimulatorTohumu.acilisEkrani == .tesbihat { tesbihatAcik = true }
        }
        .onChange(of: sahne) { _, yeni in
            if yeni == .active { baglanti.baslat() }
        }
    }

    @ViewBuilder
    private func icerik(simdi: Date, yenileme: Int) -> some View {
        let depo = SaatDeposu.varsayilan
        if let yuk = depo.yuk() {
            DurumListesi(
                yuk: yuk,
                durum: SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: depo.bekleyenler(), simdiMs: SaatDeposu.simdiMs(simdi)),
                simdi: simdi,
                surumYeni: depo.surumYeniMi()
            )
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
            VStack(spacing: 8) {
                Image(systemName: surumYeni ? "arrow.down.app" : "iphone")
                    .font(.title2)
                    .foregroundStyle(SaatGorunum.yesil)
                    .accessibilityHidden(true)
                Text(surumYeni
                    ? "Saatinizdeki Namaz Akışı'nı güncelleyin."
                    : "Vakitler iPhone'unuzdan gelir. iPhone'unuzda Namaz Akışı'nı bir kez açıp konumunuzu ayarlayın.")
                    .font(.footnote)
                    .multilineTextAlignment(.center)
            }
            .padding(.vertical, 8)
        }
    }
}

// MARK: - Liste

private struct DurumListesi: View {
    let yuk: SaatYuku
    let durum: SaatEkranDurumu
    let simdi: Date
    let surumYeni: Bool

    var body: some View {
        ScrollViewReader { kaydirici in
            liste
                .onAppear {
                    // Yalniz simulator kare cekimi: vakit listesini basa getir.
                    guard SaatSimulatorTohumu.acilisEkrani == .vakitler, let ilk = durum.satirlar.first else { return }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        kaydirici.scrollTo(ilk.ms, anchor: .top)
                    }
                }
        }
    }

    private var liste: some View {
        List {
            Section {
                UstKart(durum: durum, simdi: simdi)
            }
            if !durum.satirlar.isEmpty {
                Section("Vakitler") {
                    ForEach(durum.satirlar, id: \.ms) { satir in
                        VakitSatiri(satir: satir)
                            .id(satir.ms)
                    }
                }
            }
            Section {
                NavigationLink {
                    TesbihatEkrani()
                } label: {
                    Label("Tesbihat", systemImage: "circle.dotted")
                }
            }
            if surumYeni {
                Text("Saatinizdeki Namaz Akışı'nı güncelleyin; yeni bilgiler gösterilemiyor.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Label(yuk.konumAdi, systemImage: "location.fill")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .accessibilityLabel("Konum: \(yuk.konumAdi)")
        }
    }
}

// MARK: - Ust kart (aktif vakit / siradaki + Kildim)

private struct UstKart: View {
    let durum: SaatEkranDurumu
    let simdi: Date
    @EnvironmentObject private var baglanti: SaatBaglantisi
    @State private var onayAcik = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if durum.veriEski {
                Label("Vakitleri güncellemek için iPhone'unuzda Namaz Akışı'nı açın.", systemImage: "arrow.clockwise")
                    .font(.footnote)
            } else if let aktif = durum.gorunum.aktif, let bitis = durum.gorunum.bitisMs, !durum.gorunum.kilindi {
                Label(VakitKarari.gorunenAd(aktif.vakit), systemImage: SaatGorunum.ikon(aktif.vakit))
                    .font(.headline)
                    .labelStyle(.titleAndIcon)
                Text(timerInterval: SaatGorunum.aralik(simdi, bitis), countsDown: true)
                    .font(.system(.title2, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                    .accessibilityLabel("Çıkışa kalan süre")
                Text("Çıkış \(SaatDeposu.saatMetni(bitis))")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                kildimDugmesi
            } else {
                if let aktif = durum.gorunum.aktif, durum.gorunum.kilindi {
                    Label("\(VakitKarari.gorunenAd(aktif.vakit)) kılındı", systemImage: "checkmark.circle.fill")
                        .font(.headline)
                }
                if let s = durum.gorunum.sonraki {
                    Text("Sıradaki: \(VakitKarari.gorunenAd(s.vakit))")
                        .font(durum.gorunum.kilindi ? .footnote : .headline)
                    Text(timerInterval: SaatGorunum.aralik(simdi, s.ms), countsDown: true)
                        .font(.system(.title3, design: .rounded).weight(.semibold))
                        .monospacedDigit()
                        .accessibilityLabel("Girişe kalan süre")
                    Text("Giriş \(SaatDeposu.saatMetni(s.ms))")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 2)
        .confirmationDialog(onayMetni, isPresented: $onayAcik, titleVisibility: .visible) {
            Button("İşaretle") { isaretle() }
            Button("Vazgeç", role: .cancel) {}
        }
        .onAppear {
            // Yalniz simulator kare cekimi: onay penceresini ac (cihazda acilisEkrani nil).
            guard SaatSimulatorTohumu.acilisEkrani == .onay, aday != nil else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { onayAcik = true }
        }
    }

    private var aday: (vakit: SiriVakitAni, ad: String)? {
        if case .aday(let vakit, _, let ad) = durum.kildim { return (vakit, ad) }
        return nil
    }

    private var onayMetni: String {
        VakitKarari.onayMetni(aday?.ad ?? "")
    }

    @ViewBuilder private var kildimDugmesi: some View {
        if let aday {
            Button {
                onayAcik = true
            } label: {
                Label("Kıldım", systemImage: "checkmark")
                    .frame(maxWidth: .infinity)
            }
            .tint(SaatGorunum.yesil)
            .buttonStyle(.borderedProminent)
            .padding(.top, 4)
            .accessibilityLabel("\(aday.ad) namazını kıldım olarak işaretleyin")
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

// MARK: - Vakit satiri

private struct VakitSatiri: View {
    let satir: SaatVakitSatiri

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: SaatGorunum.ikon(satir.kod))
                .foregroundStyle(SaatGorunum.yesil)
                .frame(width: 20)
            Text(satir.ad)
                .fontWeight(satir.aktif ? .semibold : .regular)
            Spacer(minLength: 4)
            Text(SaatDeposu.saatMetni(satir.ms))
                .monospacedDigit()
                .fontWeight(satir.aktif ? .semibold : .regular)
            Image(systemName: satir.kilindi ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(satir.kilindi ? SaatGorunum.yesil : Color.secondary)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            "\(satir.ad), \(SaatDeposu.saatMetni(satir.ms))\(satir.aktif ? ", şu anki vakit" : ""), \(satir.kilindi ? "kılındı" : "kılınmadı")"
        )
    }
}
