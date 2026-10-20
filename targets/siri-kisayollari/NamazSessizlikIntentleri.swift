import AppIntents
import Foundation
internal import ExpoSiriKisayollari

// IPHONE "NAMAZDA SESSIZ" — Kisayollar otomasyonunun soracagi iki intent.
//
// iOS bir uygulamanin sessiz modu ya da Odak'i kendisinin acmasina IZIN VERMEZ;
// "Odak'i ayarla" yalniz Kisayollar'in kendi eylemidir. Kullanici bir otomasyon kurar
// (ornek: "Namaz Akisi acildiginda") ve iki adim ekler:
//   1) Namaz sessizligi            → dogru/yanlis
//   2) Eger dogruysa: Odak'i ayarla (Namaz) · bitisi: "Namaz sessizliginin bitisi"
// Kisayollar'in saat tetikleri sabit saattir, degisen vakitlere uymaz; karar bu yuzden
// uygulamanin kendi vakit cizelgesinden (`SiriDeposu`, widget yuku) verilir.
//
// Karar saf `SessizlikKarari` (pod); TS ikizi `src/core/siri/sessizlikKarari.ts`.
// Ikisi de uygulamayi ACMAZ ve dialog gostermez: otomasyon icinde sessizce deger dondurur.
// Cihazda DOGRULANMADI: "Odak'i ayarla" eyleminin bitis saatini bu intent'in Date
// ciktisindan kabul ettigi.

@available(iOS 16.0, *)
struct NamazSessizligiIntent: AppIntent {
    static let title: LocalizedStringResource = "Namaz sessizliği"
    static let description = IntentDescription(
        "Bir namaz vakti girdikten sonraki ilk dakikalardaysanız doğru döner. Kısayollar'da Odak'ı açmak için kullanılır."
    )
    static let openAppWhenRun: Bool = false

    @Parameter(title: "Süre (dakika)", default: 20, inclusiveRange: (5, 120))
    var dakika: Int

    static var parameterSummary: some ParameterSummary {
        Summary("Vakit girdikten sonraki \(\.$dakika) dakika")
    }

    func perform() async throws -> some IntentResult & ReturnsValue<Bool> {
        let vakitler = SiriDeposu.varsayilan.cizelge()?.vakitler ?? []
        let durum = SessizlikKarari.durum(vakitler, simdiMs: SiriDeposu.simdiMs(), dakika: dakika)
        return .result(value: durum.sessiz)
    }
}

@available(iOS 16.0, *)
struct NamazSessizligiBitisiIntent: AppIntent {
    static let title: LocalizedStringResource = "Namaz sessizliğinin bitişi"
    static let description = IntentDescription(
        "Sessizliğin biteceği saati verir. Şu an sessizlik yoksa şimdiki zamanı verir."
    )
    static let openAppWhenRun: Bool = false

    @Parameter(title: "Süre (dakika)", default: 20, inclusiveRange: (5, 120))
    var dakika: Int

    static var parameterSummary: some ParameterSummary {
        Summary("Vakit girdikten sonraki \(\.$dakika) dakikanın sonu")
    }

    func perform() async throws -> some IntentResult & ReturnsValue<Date> {
        let simdi = Date()
        let vakitler = SiriDeposu.varsayilan.cizelge()?.vakitler ?? []
        let durum = SessizlikKarari.durum(vakitler, simdiMs: SiriDeposu.simdiMs(simdi), dakika: dakika)
        guard let bitis = durum.bitisMs else { return .result(value: simdi) }
        return .result(value: Date(timeIntervalSince1970: TimeInterval(bitis) / 1000))
    }
}
