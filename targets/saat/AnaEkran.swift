import SwiftUI
import WatchKit

// APPLE WATCH ANA EKRANI (issue #285; #285 cilasi ile yeniden duzenlendi).
//
// Imza ogesi TEK: ust karttaki BUYUK geri sayim ve altindaki ince vakit cubugu (vaktin
// ne kadarinin gectigi). Geri kalan sakin: vakit satirlari, tesbihat, kible, kurulu
// uyandirma. Kurallar (hatirlatma ekranlariyla ayni): az yazi; noktali ayrac yok (saat
// yanina ikon); buyuk okunur sure; hareket YALNIZ olayla ("Kildim" onayinda tik bir kez
// seker, "Animasyonlari azalt" acikken oynamaz); Digital Crown listeyi kaydirir; 41 mm'e
// sigsin diye her satir `lineLimit` + `minimumScaleFactor`.
//
// Karar iPhone widget'iyla AYNI saf koddan (`SaatKarari` → `WidgetKarari`/`VakitKarari`);
// kalan sureyi ve cubugu sistem cizer (`Text(timerInterval:)`, `ProgressView(timerInterval:)`)
// → dakikalik yeniden cizim disinda kare dongusu yok. Metinler arayuz kaydindadir (kibar
// "siz"); ibadete cagri dili hatirlatma bildirimlerindedir (telefonun planindan).

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

    /// Vakit cubugu icin guvenli aralik (giris → cikis).
    static func vakitAraligi(_ girisMs: Int64, _ cikisMs: Int64) -> ClosedRange<Date> {
        tarih(min(girisMs, cikisMs))...tarih(max(girisMs, cikisMs))
    }
}

struct AnaEkran: View {
    @EnvironmentObject private var baglanti: SaatBaglantisi
    @EnvironmentObject private var uyandirici: SaatUyandirici
    @Environment(\.scenePhase) private var sahne
    /// Yalniz simulator kare cekimi (`SaatSimulatorTohumu`) acar; cihazda daima false.
    @State private var tesbihatAcik = false

    var body: some View {
        // Yalniz simulator kare cekimi: kible dogrudan KOK ekran olarak acilir (acilista
        // gezinme itmesiyle acilan kible karesi acilis ekraninda kaliyordu).
        if SaatSimulatorTohumu.acilisEkrani == .kible {
            NavigationStack {
                KibleEkrani(konum: SaatDeposu.varsayilan.yuk()?.konum)
            }
        } else {
            anaGorunum
        }
    }

    private var anaGorunum: some View {
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
        .fullScreenCover(isPresented: uyandirmaAcik) {
            if let kayit = uyandirici.calan ?? SaatSimulatorTohumu.uyandirmaKaydi() {
                UyandirmaEkrani(kayit: kayit)
                    .environmentObject(uyandirici)
            }
        }
        .onAppear {
            switch SaatSimulatorTohumu.acilisEkrani {
            case .tesbihat: tesbihatAcik = true
            default: break
            }
        }
        .onChange(of: sahne) { _, yeni in
            guard yeni == .active else { return }
            baglanti.baslat()
            SaatHatirlatici.paylasilan.izinIste()
            SaatHatirlatici.paylasilan.tazele()
            // watchOS: akilli alarm oturumu YALNIZ etkin uygulamada kurulabilir.
            uyandirici.kur()
        }
    }

    private var uyandirmaAcik: Binding<Bool> {
        Binding(
            get: { uyandirici.calan != nil || SaatSimulatorTohumu.acilisEkrani == .uyandirma },
            set: { _ in }
        )
    }

    @ViewBuilder
    private func icerik(simdi: Date, yenileme: Int) -> some View {
        let depo = SaatDeposu.varsayilan
        if let yuk = depo.yuk() {
            DurumListesi(
                yuk: yuk,
                durum: SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: depo.bekleyenler(), simdiMs: SaatDeposu.simdiMs(simdi)),
                simdi: simdi,
                surumYeni: depo.surumYeniMi(),
                kuruluUyandirma: uyandirici.kurulu
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
            BilgiKarti(
                ikon: surumYeni ? "arrow.down.app" : "iphone",
                metin: surumYeni
                    ? "Saatinizdeki Namaz Akışı'nı güncelleyin."
                    : "Vakitler iPhone'unuzdan gelir. iPhone'unuzda Namaz Akışı'nı bir kez açın."
            )
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
    let kuruluUyandirma: SaatUyandirmaKaydi?

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
                UstKart(yuk: yuk, durum: durum, simdi: simdi)
            }
            if !durum.satirlar.isEmpty {
                Section {
                    ForEach(durum.satirlar, id: \.ms) { satir in
                        VakitSatiri(satir: satir)
                            .id(satir.ms)
                            .listRowBackground(
                                satir.aktif
                                    ? AnyView(RoundedRectangle(cornerRadius: 12).fill(SaatGorunum.yesil.opacity(0.22)))
                                    : nil
                            )
                    }
                }
            }
            Section {
                if let u = kuruluUyandirma {
                    Label {
                        Text(SaatDeposu.saatMetni(u.ms)).monospacedDigit()
                    } icon: {
                        Image(systemName: u.nafile ? "moon.zzz.fill" : "alarm.fill").foregroundStyle(SaatGorunum.yesil)
                    }
                    .accessibilityLabel("Sessiz uyandırma \(SaatDeposu.saatMetni(u.ms))")
                }
                NavigationLink {
                    TesbihatEkrani()
                } label: {
                    Label("Tesbihat", systemImage: "circle.dotted")
                }
                NavigationLink {
                    KibleEkrani(konum: yuk.konum)
                } label: {
                    Label("Kıble", systemImage: "location.north.circle")
                }
            }
            if surumYeni {
                Label("Saatinizdeki Namaz Akışı'nı güncelleyin", systemImage: "arrow.down.app")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Label(yuk.konumAdi, systemImage: "location.fill")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .accessibilityLabel("Konum: \(yuk.konumAdi)")
        }
    }
}

// MARK: - Ust kart (aktif vakit / siradaki + Kildim)

private struct UstKart: View {
    let yuk: SaatYuku
    let durum: SaatEkranDurumu
    let simdi: Date
    @EnvironmentObject private var baglanti: SaatBaglantisi
    @Environment(\.accessibilityReduceMotion) private var hareketAzalt
    @State private var onayAcik = false
    @State private var onay = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            if durum.veriEski {
                Label("iPhone'unuzda Namaz Akışı'nı açın", systemImage: "arrow.clockwise")
                    .font(.footnote)
                    .lineLimit(3)
            } else if let aktif = durum.gorunum.aktif, let bitis = durum.gorunum.bitisMs, !durum.gorunum.kilindi {
                baslik(aktif.vakit, VakitKarari.gorunenAd(aktif.vakit))
                buyukSure(SaatGorunum.aralik(simdi, bitis), etiket: "Çıkışa kalan süre")
                ProgressView(timerInterval: SaatGorunum.vakitAraligi(aktif.ms, bitis), countsDown: false) {
                    EmptyView()
                } currentValueLabel: {
                    EmptyView()
                }
                .tint(SaatGorunum.yesil)
                .accessibilityHidden(true)
                saatSatiri("hourglass.bottomhalf.filled", bitis, etiket: "Çıkış")
                kildimDugmesi
            } else {
                if let aktif = durum.gorunum.aktif, durum.gorunum.kilindi {
                    Label {
                        Text(VakitKarari.gorunenAd(aktif.vakit)).lineLimit(1)
                    } icon: {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(SaatGorunum.yesil)
                            .symbolEffect(.bounce, value: onay)
                    }
                    .font(.footnote.weight(.semibold))
                    .accessibilityLabel("\(VakitKarari.gorunenAd(aktif.vakit)) kılındı")
                }
                if let s = durum.gorunum.sonraki {
                    baslik(s.vakit, VakitKarari.gorunenAd(s.vakit))
                    buyukSure(SaatGorunum.aralik(simdi, s.ms), etiket: "Girişe kalan süre")
                    saatSatiri("arrow.right.circle.fill", s.ms, etiket: "Giriş")
                }
            }
        }
        .padding(.vertical, 2)
        .animation(hareketAzalt ? nil : .snappy(duration: 0.3), value: durum.gorunum.kilindi)
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

    private func baslik(_ kod: String, _ ad: String) -> some View {
        Label {
            Text(ad).lineLimit(1).minimumScaleFactor(0.7)
        } icon: {
            Image(systemName: SaatGorunum.ikon(kod)).foregroundStyle(SaatGorunum.yesil)
        }
        .font(.headline)
    }

    /// Imza ogesi: tek bakista okunan buyuk sure (41 mm'de olceklenir, kesilmez).
    private func buyukSure(_ aralik: ClosedRange<Date>, etiket: String) -> some View {
        Text(timerInterval: aralik, countsDown: true)
            .font(.system(size: 40, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .lineLimit(1)
            .minimumScaleFactor(0.55)
            .accessibilityLabel(etiket)
    }

    /// Saat + anlamini veren ikon (noktali ayrac yerine).
    private func saatSatiri(_ ikon: String, _ ms: Int64, etiket: String) -> some View {
        Label {
            Text(SaatDeposu.saatMetni(ms)).monospacedDigit()
        } icon: {
            Image(systemName: ikon)
        }
        .font(.footnote)
        .foregroundStyle(.secondary)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(etiket) \(SaatDeposu.saatMetni(ms))")
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
            onay += 1
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
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Spacer(minLength: 4)
            Text(SaatDeposu.saatMetni(satir.ms))
                .monospacedDigit()
                .fontWeight(satir.aktif ? .semibold : .regular)
                .lineLimit(1)
            Image(systemName: satir.kilindi ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(satir.kilindi ? SaatGorunum.yesil : Color.secondary)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            "\(satir.ad), \(SaatDeposu.saatMetni(satir.ms))\(satir.aktif ? ", şu anki vakit" : ""), \(satir.kilindi ? "kılındı" : "kılınmadı")"
        )
    }
}
