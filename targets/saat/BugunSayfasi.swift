import SwiftUI
import WatchKit

// "BUGUN" SAYFASI (#285 yeniden tasarim): 24 saatlik gun kadrani.
//
// Halka gunun tamamidir (gece yarisi tepede). Bes vakit penceresi kendi renginde YAY,
// girisi NOKTA: kilinan vakit DOLU (renk + tik), kilinmamis halka; simdiki an beyaz bir
// isaret. Digital Crown (ya da noktaya dokunma) odagi vakitler arasinda gezdirir; ortada
// odaktaki vaktin adi, BUYUK giris saati ve durumu (Kılındı / Şimdi / Sırada / Geçti).
// Kesirler saf `SaatKadran`'dan; burada yalniz cizim.
//
// Hareket yalniz olayla: odak degisince nokta yayla buyur (tac haptigi sistemden).
// Sonuk ekranda yaylar kisik, isaret ve tac yok.
struct BugunSayfasi: View {
    let yuk: SaatYuku
    let durum: SaatEkranDurumu
    let simdi: Date
    @Environment(\.isLuminanceReduced) private var sistemSonuk
    @Environment(\.accessibilityReduceMotion) private var hareketAzalt
    @State private var tac: Double = -1

    private var sonuk: Bool { sistemSonuk || SaatSimulatorTohumu.sonuk }
    private var satirlar: [SaatVakitSatiri] { durum.satirlar }
    private var dilimler: [SaatKadranDilimi] {
        durum.gorunum.gunTarihi.map { SaatKadran.dilimler(yuk: yuk, tarih: $0) } ?? []
    }

    /// Acilista odak: suren vakit, yoksa siradaki.
    private var varsayilanOdak: Int {
        SaatKadran.indeks(durum.gorunum.aktif?.vakit ?? durum.gorunum.sonraki?.vakit)
    }

    private var odak: Int {
        tac < 0 ? varsayilanOdak : SaatKadran.odak(tac: tac)
    }

    var body: some View {
        GeometryReader { geo in
            let boyut = min(geo.size.width, geo.size.height)
            ZStack {
                kadran(boyut: boyut)
                merkez
                    .frame(width: boyut * 0.62)
            }
            .frame(width: boyut, height: boyut)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .padding(2)
        .navigationTitle("Bugün")
        .containerBackground(SaatGorunum.renk(odakKodu).opacity(sonuk ? 0.06 : 0.2).gradient, for: .tabView)
        .focusable(!sonuk)
        .digitalCrownRotation(
            Binding(get: { tac < 0 ? Double(varsayilanOdak) : tac }, set: { tac = $0 }),
            from: 0,
            through: Double(SaatKadran.kodlar.count - 1),
            by: 1,
            sensitivity: .low,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .accessibilityElement(children: .contain)
    }

    private var odakKodu: String { SaatKadran.kodlar[odak] }

    // MARK: Kadran

    private func kadran(boyut: CGFloat) -> some View {
        let kalinlik: CGFloat = sonuk ? 4 : 9
        let yaricap = boyut / 2 - 10
        return ZStack {
            Circle()
                .stroke(Color.white.opacity(sonuk ? 0.06 : 0.12), lineWidth: kalinlik)
                .frame(width: yaricap * 2, height: yaricap * 2)
            ForEach(Array(dilimler.enumerated()), id: \.offset) { i, d in
                let kilindi = satirlar.first { $0.kod == d.kod }?.kilindi ?? false
                ForEach(Array(SaatKadran.yaylar(d).enumerated()), id: \.offset) { _, yay in
                    Circle()
                        .trim(from: yay.lowerBound, to: yay.upperBound)
                        .stroke(
                            SaatGorunum.renk(d.kod).opacity(sonuk ? 0.35 : (kilindi ? 1 : (i == odak ? 0.75 : 0.45))),
                            style: StrokeStyle(lineWidth: kalinlik, lineCap: .butt)
                        )
                        .rotationEffect(.degrees(-90))
                        .frame(width: yaricap * 2, height: yaricap * 2)
                }
            }
            // Simdiki an.
            if !sonuk {
                isaret(kesir: SaatKadran.kesir(SaatDeposu.simdiMs(simdi)), yaricap: yaricap)
            }
            // Vakit girisleri: nokta (kilinan dolu).
            ForEach(Array(dilimler.enumerated()), id: \.offset) { i, d in
                nokta(d, secili: i == odak, yaricap: yaricap)
                    .onTapGesture { secAnimasyonlu(i) }
            }
        }
        .frame(width: boyut, height: boyut)
    }

    private func konum(kesir: Double, yaricap: CGFloat) -> CGSize {
        let aci = kesir * 2 * Double.pi - Double.pi / 2
        return CGSize(width: cos(aci) * Double(yaricap), height: sin(aci) * Double(yaricap))
    }

    private func isaret(kesir: Double, yaricap: CGFloat) -> some View {
        Capsule()
            .fill(Color.white)
            .frame(width: 3, height: 16)
            .rotationEffect(.degrees(kesir * 360))
            .offset(konum(kesir: kesir, yaricap: yaricap))
            .accessibilityHidden(true)
    }

    private func nokta(_ d: SaatKadranDilimi, secili: Bool, yaricap: CGFloat) -> some View {
        let satir = satirlar.first { $0.kod == d.kod }
        let kilindi = satir?.kilindi ?? false
        let renk = SaatGorunum.renk(d.kod)
        let cap: CGFloat = secili ? 20 : 13
        return ZStack {
            Circle()
                .fill(kilindi ? renk : Color.black)
            Circle()
                .stroke(renk, lineWidth: secili ? 3 : 2)
            if kilindi && secili {
                Image(systemName: "checkmark")
                    .font(.system(size: 9, weight: .heavy))
                    .foregroundStyle(.black)
            }
        }
        .frame(width: cap, height: cap)
        .opacity(sonuk ? 0.5 : 1)
        .offset(konum(kesir: SaatKadran.kesir(d.basMs), yaricap: yaricap))
        .animation(hareketAzalt ? nil : .spring(response: 0.3, dampingFraction: 0.7), value: secili)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            "\(VakitKarari.gorunenAd(d.kod)), \(SaatDeposu.saatMetni(d.basMs)), \(kilindi ? "kılındı" : "kılınmadı")"
        )
        .accessibilityAddTraits(secili ? [.isButton, .isSelected] : .isButton)
    }

    private func secAnimasyonlu(_ i: Int) {
        tac = Double(i)
    }

    // MARK: Merkez

    private var merkez: some View {
        let kod = odakKodu
        let satir = satirlar.first { $0.kod == kod }
        let dilim = dilimler.first { $0.kod == kod }
        let durumMetni: (String, String, Color) = {
            guard let satir else { return ("", "circle", .secondary) }
            if satir.kilindi { return ("Kılındı", "checkmark.circle.fill", SaatGorunum.yesil) }
            if satir.aktif { return ("Şimdi", "circle.inset.filled", SaatGorunum.renk(kod)) }
            let simdiMs = SaatDeposu.simdiMs(simdi)
            if let dilim, dilim.bitisMs <= simdiMs { return ("Geçti", "exclamationmark.circle", .secondary) }
            return ("Sırada", "clock", .secondary)
        }()
        return VStack(spacing: 1) {
            Image(systemName: SaatGorunum.ikon(kod))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(SaatGorunum.renk(kod))
                .font(.system(size: 16, weight: .semibold))
                .accessibilityHidden(true)
            Text(VakitKarari.gorunenAd(kod))
                .font(.footnote.weight(.semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(satir.map { SaatDeposu.saatMetni($0.ms) } ?? "--:--")
                .font(.system(size: 26, weight: .semibold, design: .rounded))
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Label(durumMetni.0, systemImage: durumMetni.1)
                .font(.caption2)
                .foregroundStyle(durumMetni.2)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .accessibilityElement(children: .combine)
    }
}
