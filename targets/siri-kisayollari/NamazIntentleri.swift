import AppIntents
import Foundation
internal import ExpoSiriKisayollari

// SIRI / KISAYOLLAR / SPOTLIGHT / EYLEM DUGMESI — App Intents (issue #279).
//
// Bu dosya ANA UYGULAMA HEDEFINE derlenir (`plugins/withSiriKisayollari.js` prebuild'de
// `ios/<Proje>/` altina kopyalar). Uzanti DEGIL: `openAppWhenRun` istemeyen intent'ler
// (siradaki namaz, kildim) uygulama arka planda baslatilarak calisir ve JS'e ihtiyac
// duymaz — veriyi JS onceden `SiriDeposu`'na yazar (WidgetServisi yuku).
//
// Kararlar ve metinler `VakitKarari` (pod, saf Foundation) icindedir; TS ikizi
// `src/core/siri/siriKarari.ts`, ortak fikstur `modules/expo-siri-kisayollari/test/siri-ornek.json`.
// Metinler ARAYUZ kaydindadir (kibar "siz"), ibadete cagri degil.

/// SIRI CEVAP DILI (W5). App Intents'in sabit metinleri (baslik, aciklama, ifade) derleme
/// zamaninda `en.lproj`/`tr.lproj` tablolarindan CIHAZ diliyle cozulur
/// (`plugins/withSiriKisayollari.js` ekler). Dinamik cevap da AYNI dilde olsun diye paketin
/// sectigi yerellestirmeden okunur — uygulamanin kendi dil secimi (`arayuzDili()`) degil:
/// Siri tek konusmada iki dil karistirmasin. Desteklenmeyen dil Turkceye duser.
/// Kullanicinin vakit adi takimi (`VakitAdlari`) yalniz paket dili uygulamanin arayuz diliyle
/// AYNIYSA uygulanir (`VakitMetinleri.dil`); `arayuzDili()` okumasi takimi tazeler.
enum SiriDili {
    static var kod: String {
        _ = SiriDeposu.varsayilan.arayuzDili()
        return ArayuzDili.coz(Bundle.main.preferredLocalizations.first)
    }
    static var metin: VakitMetinleri { VakitMetinleri.dil(kod) }
}

/// "Siradaki namaz ne zaman?" — uygulamayi ACMADAN cevap verir.
@available(iOS 16.0, *)
struct SiradakiNamazIntent: AppIntent {
    static let title: LocalizedStringResource = "Sıradaki namaz"
    static let description = IntentDescription("Sıradaki namaz vaktini ve giriş saatini söyler.")
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let depo = SiriDeposu.varsayilan
        let dil = SiriDili.kod
        guard let cizelge = depo.cizelge(), !cizelge.vakitler.isEmpty else {
            return .result(dialog: "\(SiriDili.metin.konumYok)")
        }
        let simdi = Date()
        let durum = VakitKarari.aktifVakitBul(cizelge.vakitler, simdiMs: SiriDeposu.simdiMs(simdi))
        let metin = VakitKarari.siradakiNamazMetni(
            durum: durum,
            kilinanlar: depo.kilinanlar(),
            bekleyenler: depo.bekleyenler(),
            bugun: SiriDeposu.bugunIso(simdi),
            saat: SiriDeposu.saatBicimleyici(),
            dil: dil
        )
        return .result(dialog: "\(metin)")
    }
}

/// "Su anki vakti kildim" — icinde bulunulan vakti isaretler.
///
/// iOS'ta arka planda JS calismaz: intent ogeyi kalici "Kildim" kuyruguna yazar
/// (Android `KildimKuyrugu` ikizi), uygulama acilinca/one gelince `KildimKuyruguServisi`
/// bildirimdeki "Kildim" ile AYNI govdeden isler. Uygulama aciksa olayla hemen islenir.
/// iOS'ta baslatan bilinemez → guven listesi YOKTUR; Siri/Kisayol kullanicinin kendi
/// eylemidir. Onay sorusu varsayilan olarak acik (vakit siniri yakininda yanlis vakti
/// isaretlememek icin), otomasyon kuran kullanici Kisayollar'da kapatabilir.
@available(iOS 16.0, *)
struct SimdikiVaktiKildimIntent: AppIntent {
    static let title: LocalizedStringResource = "Şu anki vakti kıldım"
    static let description = IntentDescription(
        "İçinde bulunulan vakti kılındı olarak işaretler. Kayıt, uygulama açıldığında takviminize işlenir."
    )
    static let openAppWhenRun: Bool = false

    @Parameter(title: "Onay iste", default: true)
    var onayIste: Bool

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let depo = SiriDeposu.varsayilan
        let dil = SiriDili.kod
        guard let cizelge = depo.cizelge(), !cizelge.vakitler.isEmpty else {
            return .result(dialog: "\(SiriDili.metin.konumYok)")
        }
        let saat = SiriDeposu.saatBicimleyici()
        let karar = Self.degerlendir(depo: depo, cizelge: cizelge, simdi: Date(), dil: dil)
        guard case let .aday(vakit, kayitVakti, ad) = karar else {
            let metin = VakitKarari.kildimMetni(karar, bugun: SiriDeposu.bugunIso(), saat: saat, dil: dil)
            return .result(dialog: "\(metin)")
        }

        if onayIste {
            try await requestConfirmation(result: .result(dialog: "\(VakitKarari.onayMetni(ad, dil: dil))"))
            // Onay penceresi acikken vakit degismis ya da namaz baska yoldan
            // isaretlenmis olabilir → YENIDEN degerlendir (Android `adayiIsaretle` ikizi).
            let yeni = Self.degerlendir(depo: depo, cizelge: cizelge, simdi: Date(), dil: dil)
            guard case let .aday(yeniVakit, yeniKayit, _) = yeni,
                  yeniVakit.tarih == vakit.tarih, yeniKayit == kayitVakti else {
                if case .aday = yeni {
                    return .result(dialog: "\(SiriDili.metin.vakitDegisti)")
                }
                let metin = VakitKarari.kildimMetni(yeni, bugun: SiriDeposu.bugunIso(), saat: saat, dil: dil)
                return .result(dialog: "\(metin)")
            }
        }

        depo.kildimEkle(tarih: vakit.tarih, vakit: kayitVakti, kaynak: "siri", simdiMs: SiriDeposu.simdiMs())
        let metin = VakitKarari.kildimMetni(karar, bugun: SiriDeposu.bugunIso(), saat: saat, dil: dil)
        return .result(dialog: "\(metin)")
    }

    private static func degerlendir(depo: SiriDeposu, cizelge: SiriCizelge, simdi: Date, dil: String) -> SiriKildimKarari {
        return VakitKarari.kildimKarari(
            vakitler: cizelge.vakitler,
            kilinanlar: depo.kilinanlar(),
            bekleyenler: depo.bekleyenler(),
            simdiMs: SiriDeposu.simdiMs(simdi),
            dil: dil
        )
    }
}

/// "Kibleyi ac" — uygulamayi Kible ekraninda acar.
///
/// Gezinme JS'te yapilir: intent bir EKRAN ISTEGI birakir, `useSiriEkranIstegi` (AppNavigator)
/// gezinme hazir olunca tuketir. Soguk acilista JS henuz yuklenmemistir; dogrudan
/// `namazakisi://kible` acmak olayi dinleyicisiz birakip KAYBEDERDI.
@available(iOS 16.0, *)
struct KibleyiAcIntent: AppIntent {
    static let title: LocalizedStringResource = "Kıbleyi aç"
    static let description = IntentDescription("Uygulamayı Kıble pusulasıyla açar.")
    static let openAppWhenRun: Bool = true

    func perform() async throws -> some IntentResult {
        SiriDeposu.varsayilan.ekranIstegiYaz("kible", simdiMs: SiriDeposu.simdiMs())
        return .result()
    }
}
