import AppIntents
import Foundation
#if canImport(ActivityKit)
import ActivityKit
#endif
#if canImport(WidgetKit)
import WidgetKit
#endif
#if !NAMAZ_WIDGET_UZANTISI
internal import ExpoSiriKisayollari
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
// HALA kilinacak aday ise kuyruga yazilir (`WidgetKarari.dugmeKarari`). Karar tutmazsa
// (vakit cikti, cizim bayat) etkinlik KAPATILMAZ, yalniz zaman cizelgesi tazelenir:
// kapatmak "bastim, kapandi ama isaretlenmedi" yasatirdi.
//
// KILIT EKRANI: Android'de kilit ekrani SALT OKUNURDUR (`cekirdek/KilitEkraniKarari.kt`;
// kilit acilmadan kayit yazilmaz). Canli etkinlik kilit ekraninda da gorunur ve dugmesi
// orada da basilabilir → `authenticationPolicy = .requiresAuthentication`: cihaz
// kilitliyken sistem once kilidi actirir, `perform()` ancak sonra calisir. Ana ekran
// widget'inda cihaz zaten acik oldugu icin etkisi yoktur; StandBy'da dugme cizilmez.
@available(iOS 17.0, *)
struct KildimDugmesiIntent: LiveActivityIntent {
    static let title: LocalizedStringResource = "Vakti kıldım"
    static let description = IntentDescription("Widget'taki vakti kılındı olarak işaretler.")
    static let openAppWhenRun: Bool = false
    // Kisayollar/Spotlight'ta ayri eylem olarak gorunmesin (Siri'nin kendi "Kildim"i var).
    static let isDiscoverable: Bool = false
    // Kilit ekranindan (canli etkinlik) kayit yazmadan once kilidi actir (Android ikizi).
    static let authenticationPolicy: IntentAuthenticationPolicy = .requiresAuthentication

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
        let simdi = SiriDeposu.simdiMs()
        let karar = WidgetKarari.dugmeKarari(
            tarih: tarih,
            vakit: vakit,
            vakitler: depo.cizelge()?.vakitler,
            kilinanlar: depo.kilinanlar(),
            bekleyenler: depo.bekleyenler(),
            simdiMs: simdi
        )
        if karar == .isaretle {
            depo.kildimEkle(tarih: tarih, vakit: vakit, kaynak: "widget", simdiMs: simdi)
        }
        #if canImport(ActivityKit)
        // Gecersiz kararda etkinlik KALIR (bayat dokunus yazmaz, kapatmaz da).
        if karar != .gecersiz {
            await NamazCanliNitelikleri.kildimIleBitir(tarih: tarih, vakit: vakit)
        }
        #endif
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        // Kontrol Merkezi kontrolu (iOS 18) ayni dugme intent'ini kullanir; yeni durumu cizsin.
        if #available(iOS 18.0, *) {
            ControlCenter.shared.reloadAllControls()
        }
        #endif
        return .result()
    }
}
