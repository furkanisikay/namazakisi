import AppIntents
import Foundation
#if canImport(ActivityKit)
import ActivityKit
#endif
#if canImport(WidgetKit)
import WidgetKit
#endif
#if !NAMAZ_WIDGET_UZANTISI
import ExpoSiriKisayollari
#endif

// WIDGET + CANLI ETKINLIK "KILDIM" DUGMESI (issue #295).
//
// Bu dosya IKI hedefte derlenir (`plugins/withNamazWidget.js`): ana uygulama (App Intents
// metadata'si ve gercek calisma) ve widget uzantisi (dugmeyi kurmak icin tipin orada da
// bulunmasi gerekir). Uzantida pod YOKTUR → `SiriDeposu`/`VakitKarari`/
// `NamazCanliNitelikleri` uzantinin kendi kopyalaridir; `NAMAZ_WIDGET_UZANTISI` derleme
// kosulunu eklenti uzanti hedefine yazar.
//
// NEDEN `LiveActivityIntent`: sistem bu turu UYGULAMA SURECINDE calistirir (gerekirse
// arka planda baslatarak). Kuyruga yazan ile JS koprusu ayni surecte, ayni kilitle
// calisir → kayip yazim olmaz; uygulama aciksa `onSiriDegisikligi` olayi kuyrugu hemen
// isletir. Duz `AppIntent` widget uzantisi surecinde calisirdi.
//
// ONAY SORULMAZ (Siri "Kildim"dan farkli, #279): dugme vaktin adini tasir ve dogrudan
// dokunusla basilir; widget'ta diyalog da gosterilemez. Bunun yerine dokunus aninda karar
// YENIDEN degerlendirilir: zaman cizelgesi eski bir vakti cizmis olabilir (Android
// `KildimDurumKarari.dokunusGecerliMi` ikizi) → yalniz dugmenin tasidigi tarih + vakit
// HALA kilinacak aday ise kuyruga yazilir.
@available(iOS 17.0, *)
struct KildimDugmesiIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Vakti kıldım"
    static let description = IntentDescription("Widget'taki vakti kılındı olarak işaretler.")
    static let openAppWhenRun: Bool = false
    // Kisayollar/Spotlight'ta ayri eylem olarak gorunmesin (Siri'nin kendi "Kildim"i var).
    static let isDiscoverable: Bool = false

    /// Namaz gunu ('YYYY-MM-DD').
    @Parameter(title: "Tarih")
    var tarih: String

    /// KAYIT vakit kodu (`imsak`, `ogle`...) — kuyruk `sabah`'i reddeder.
    @Parameter(title: "Vakit")
    var vakit: String

    init() {}

    init(tarih: String, vakit: String) {
        self.tarih = tarih
        self.vakit = vakit
    }

    func perform() async throws -> some IntentResult {
        let depo = SiriDeposu.varsayilan
        if let cizelge = depo.cizelge() {
            let karar = VakitKarari.kildimKarari(
                vakitler: cizelge.vakitler,
                kilinanlar: depo.kilinanlar(),
                bekleyenler: depo.bekleyenler(),
                simdiMs: SiriDeposu.simdiMs()
            )
            if case let .aday(adayVakit, kayitVakti, _) = karar, adayVakit.tarih == tarih, kayitVakti == vakit {
                depo.kildimEkle(tarih: tarih, vakit: vakit, kaynak: "widget", simdiMs: SiriDeposu.simdiMs())
            }
        }
        #if canImport(ActivityKit)
        await NamazCanliNitelikleri.kildimIleBitir(tarih: tarih, vakit: vakit)
        #endif
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        #endif
        return .result()
    }
}
