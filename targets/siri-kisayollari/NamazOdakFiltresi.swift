import AppIntents
import ExpoSiriKisayollari

// ODAK FILTRESI (issue #279) — Android "Namaz modu"nun iOS karsiligi.
//
// Uygulama Odak modu OLUSTURAMAZ ve Odagin acik olup olmadigini SORAMAZ. Tek yol bu
// filtredir: kullanici Ayarlar > Odak > (ör. "Namaz") > Odak Filtreleri'nden
// "Namaz Akışı"ni ekler ve "Hatirlatmalari sessiz ver"i acar. Odak ACILINCA ve
// KAPANINCA sistem `perform()`'u cagirir (gerekirse uygulamayi arka planda baslatarak);
// kapanista parametre varsayilana (bos) doner → `sessiz: false` yazilir.
//
// Deger `SiriDeposu`'na yazilir; JS muhafiz/nafile planlayicisi (`IosMuhafizTeslimcisi`)
// her turda okur ve sessizken bildirimleri `passive` kurar
// (`src/core/muhafiz/ios/odakFiltresi.ts` — 3 saatlik sure tavani dahil). Uygulama
// aciksa olay ile hemen yeniden planlanir.
//
// Parametre OPSIYONELDIR ve varsayilani YOKTUR: varsayilan `true` olsaydi, kapanista
// sistemin varsayilan degerle cagirmasi hatirlatmalari kalici olarak susturabilirdi.
@available(iOS 16.0, *)
struct NamazOdakFiltresi: SetFocusFilterIntent {
    static let title: LocalizedStringResource = "Namaz hatırlatmaları"
    static let description = IntentDescription(
        "Bu Odak açıkken namaz hatırlatmalarının ekranı yakmadan ve ses çıkarmadan gelmesini sağlar."
    )

    @Parameter(title: "Hatırlatmaları sessiz ver")
    var sessizVer: Bool?

    var displayRepresentation: DisplayRepresentation {
        let baslik: LocalizedStringResource = sessizVer == true
            ? "Hatırlatmalar sessiz gelir"
            : "Hatırlatmalar her zamanki gibi"
        return DisplayRepresentation(title: baslik)
    }

    func perform() async throws -> some IntentResult {
        SiriDeposu.varsayilan.odakYaz(sessiz: sessizVer == true, simdiMs: SiriDeposu.simdiMs())
        return .result()
    }
}
