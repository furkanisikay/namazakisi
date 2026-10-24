import AppIntents
import Foundation
import SwiftUI
import UIKit
import UniformTypeIdentifiers
internal import ExpoSiriKisayollari

// "GUNUN AYETI GORSELI" — duvar kagidi icin App Intent (#381 iOS ikizi).
//
// iOS'ta uygulama duvar kagidini DEGISTIREMEZ (genel API yok). Bu eylem bugunun ayetini
// cihaz ekran boyutunda PNG olarak dondurur; kullanici Kisayollar'da "Duvar Kâğıdını
// Ayarla" adimina baglar ve imsaktan sonraki bir saate "Günün Saati" otomasyonu kurar
// (rehber uygulamadaki "Günün ayeti" ayarinda). Veri JS'in App Group'a yazdigi plandir
// (`SiriDeposu.gununAyeti`); kayit secimi widget'la AYNI saf karardan
// (`GununAyetiKarari.gecerliKayit`). Uygulama acilmaz.
//
// ARAPCA CIZILMEZ: duvar kagidinda Arapca varsayilan KAPALI (sahip karari) ve iOS yukun
// `duvar` ayarini yok sayar → ana uygulamaya Arapca font paketlenmez. Meal ekranin
// %36–%80 bandinda (saat ve alt kenar disi), kunye + meal kaynagi satiri ZORUNLU.
// Meal yoksa (meali olmayan dil; bugun tr/en ikisinde de var) govde kisa kunyedir.
// Metinler: etiket ve kunye yukte etkin dilde; hata metinleri cihaz dilinde (`.lproj`).
@available(iOS 16.0, *)
struct GununAyetiGorseliIntent: AppIntent {
    static let title: LocalizedStringResource = "Günün ayeti görseli"
    static let description = IntentDescription(
        "Bugünün ayetini ekranınızın boyutunda bir görsel olarak verir. Kısayollar'da Duvar Kâğıdını Ayarla adımıyla kullanabilirsiniz."
    )
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ReturnsValue<IntentFile> {
        guard let yuk = SiriDeposu.varsayilan.gununAyeti(),
              let kayit = GununAyetiKarari.gecerliKayit(yuk.plan, simdiMs: SiriDeposu.simdiMs()) else {
            throw GununAyetiGorseliHatasi.veriYok
        }
        let metin = yuk.metin
        let png = await MainActor.run { GununAyetiGorseli.png(kayit: kayit, metin: metin) }
        guard let png else { throw GununAyetiGorseliHatasi.cizilemedi }
        return .result(value: IntentFile(data: png, filename: "gunun-ayeti-\(kayit.gun).png", type: .png))
    }
}

@available(iOS 16.0, *)
enum GununAyetiGorseliHatasi: Error, CustomLocalizedStringResourceConvertible {
    /// JS henuz plan yazmadi (uygulama hic acilmadi ya da eski surum).
    case veriYok
    case cizilemedi

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .veriYok: return "Günün ayetini hazırlamak için uygulamayı bir kez açın."
        case .cizilemedi: return "Görsel hazırlanamadı. Biraz sonra yeniden deneyin."
        }
    }
}

@available(iOS 16.0, *)
enum GununAyetiGorseli {
    /// Ekranin dikey piksel boyutunda PNG. `ImageRenderer` ana aktorde calisir.
    @MainActor
    static func png(kayit: GununAyetiKaydi, metin: GununAyetiMetinleri) -> Data? {
        let ekran = etkinEkran()
        // `nativeBounds` yonelimden bagimsiz DIKEY piksel; nokta = piksel / nativeScale.
        let olcek = max(ekran.nativeScale, 1)
        let boyut = CGSize(width: ekran.nativeBounds.width / olcek, height: ekran.nativeBounds.height / olcek)
        guard boyut.width > 0, boyut.height > 0 else { return nil }
        let gorunum = DuvarGorunumu(kayit: kayit, metin: metin, boyut: boyut)
            .environment(\.colorScheme, .dark)
        let cizici = ImageRenderer(content: gorunum)
        cizici.proposedSize = ProposedViewSize(boyut)
        cizici.scale = olcek
        cizici.isOpaque = true
        return cizici.uiImage?.pngData()
    }

    /// Bagli sahnenin ekrani; arka planda (sahne yok) ana ekran.
    @MainActor
    private static func etkinEkran() -> UIScreen {
        let sahne = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        return sahne?.screen ?? UIScreen.main
    }
}

/// Duvar kagidi duzeni: koyu zemin; meal %36–%80 bandinin ortasinda; kunye altinda.
@available(iOS 16.0, *)
private struct DuvarGorunumu: View {
    let kayit: GununAyetiKaydi
    let metin: GununAyetiMetinleri
    let boyut: CGSize

    /// Uygulamanin birincil yesili (#4CAF50), yalniz dekoratif etikette.
    private static let yesil = Color(red: 0x4C / 255.0, green: 0xAF / 255.0, blue: 0x50 / 255.0)

    var body: some View {
        let g = boyut.width
        let y = boyut.height
        ZStack(alignment: .top) {
            LinearGradient(
                colors: [
                    Color(red: 0x0E / 255.0, green: 0x1A / 255.0, blue: 0x16 / 255.0),
                    Color(red: 0x06 / 255.0, green: 0x0C / 255.0, blue: 0x0A / 255.0),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            VStack(spacing: y * 0.022) {
                Text(metin.etiket)
                    .font(.system(size: g * 0.032, weight: .semibold))
                    .tracking(g * 0.004)
                    .foregroundStyle(Self.yesil)
                Text(kayit.meal ?? kayit.kisaKunye)
                    .font(.system(size: g * 0.062, weight: .regular, design: .serif))
                    .lineSpacing(g * 0.012)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white)
                    // Meal KESILMEZ: sigmazsa kuculur (havuz kurali: en cok 200 harf).
                    .minimumScaleFactor(0.4)
                Text(GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: false))
                    .font(.system(size: g * 0.03))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white.opacity(0.72))
                    .minimumScaleFactor(0.6)
            }
            .padding(.horizontal, g * 0.1)
            .frame(width: g, height: y * 0.44)
            .offset(y: y * 0.36)
        }
        .frame(width: g, height: y)
    }
}
