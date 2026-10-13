import Foundation
#if canImport(ActivityKit)
import ActivityKit
#endif
#if canImport(WidgetKit)
import WidgetKit
#endif

/**
 * CANLI ETKINLIK + WIDGET KOPRUSU (issue #295) — uygulama surecinde.
 *
 * Android Now Bar planlayicisinin aksine iOS'ta ZAMANLANMIS baslatma YOKTUR: canli
 * etkinlik ancak uygulama ON PLANDAYKEN `Activity.request` ile baslar (arka planda
 * baslatmak push-to-start ister, bunun icin sunucumuz yok). Bu yuzden JS her one
 * gelişte ve her degisiklikte "su an hangi etkinlik gorunmeli?" sorusunu cevaplar
 * (`src/core/sayac/iosCanliEtkinlik.ts`) ve buraya ISTENEN durumu verir; kopru
 * mevcut etkinlikleri ona esitler (baslat / guncelle / bitir). Bitis sistemdedir:
 * `staleDate = hedef`, uygulama acilmasa da sayac hedefte durur.
 */
public enum CanliEtkinlikKoprusu {
    /// JS'in gonderdigi istenen etkinlik (`IosCanliEtkinlik` ile ayni alanlar).
    struct Istek: Decodable {
        let id: String
        let baslik: String
        let ad: String
        let baslangicMs: Int64
        let hedefMs: Int64
        let tema: String
        let kildimTarih: String?
        let kildimVakit: String?
    }

    /// Bu build canli etkinlik tasiyor mu? Widget uzantisi (bayrak) kapaliysa
    /// `NSSupportsLiveActivities` yazilmaz → `false` (JS ekrani gostermez).
    public static var destekleniyor: Bool {
        guard #available(iOS 16.2, *) else { return false }
        return (Bundle.main.object(forInfoDictionaryKey: "NSSupportsLiveActivities") as? Bool) == true
    }

    /// Kullanici Ayarlar > Namaz Akışı > Canli Etkinlikler'i kapatmis olabilir.
    public static func izinAcik() -> Bool {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *), destekleniyor {
            return ActivityAuthorizationInfo().areActivitiesEnabled
        }
        #endif
        return false
    }

    /// Mevcut etkinlikleri istenene esitler. Sonuc: `baslatildi` | `guncellendi` | `ayni` |
    /// `bitirildi` | `yok` | `izinYok` | `desteklenmiyor` | `hata`. ASLA firlatmaz.
    public static func esitle(json: String?) async -> String {
        #if canImport(ActivityKit)
        guard #available(iOS 16.2, *), destekleniyor else { return "desteklenmiyor" }
        var istek: Istek? = nil
        if let json, let veri = json.data(using: .utf8) {
            istek = try? JSONDecoder().decode(Istek.self, from: veri)
        }
        return await esitleIc(istek, simdiMs: Int64((Date().timeIntervalSince1970 * 1000).rounded()))
        #else
        return "desteklenmiyor"
        #endif
    }

    #if canImport(ActivityKit)
    @available(iOS 16.2, *)
    private static func esitleIc(_ istek: Istek?, simdiMs: Int64) async -> String {
        let gecerli = istek.flatMap { $0.hedefMs > simdiMs ? $0 : nil }
        var eslesen: Activity<NamazCanliNitelikleri>? = nil
        var bitirilen = 0
        for etkinlik in Activity<NamazCanliNitelikleri>.activities {
            let canli = etkinlik.activityState == .active || etkinlik.activityState == .stale
            if canli, eslesen == nil, let g = gecerli, etkinlik.attributes.kimlik == g.id {
                eslesen = etkinlik
                continue
            }
            // Ayni anda TEK etkinlik (Android "tek one cikan" kurali).
            await etkinlik.end(nil, dismissalPolicy: .immediate)
            bitirilen += 1
        }
        guard let g = gecerli else { return bitirilen > 0 ? "bitirildi" : "yok" }

        let durum = NamazCanliNitelikleri.ContentState(
            baslik: g.baslik,
            ad: g.ad,
            baslangicMs: g.baslangicMs,
            hedefMs: g.hedefMs,
            tema: g.tema,
            kildimTarih: g.kildimTarih,
            kildimVakit: g.kildimVakit
        )
        let icerik = ActivityContent(
            state: durum,
            staleDate: Date(timeIntervalSince1970: TimeInterval(g.hedefMs) / 1000)
        )
        if let mevcut = eslesen {
            if mevcut.content.state == durum { return "ayni" }
            await mevcut.update(icerik)
            return "guncellendi"
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return "izinYok" }
        do {
            _ = try Activity.request(
                attributes: NamazCanliNitelikleri(kimlik: g.id),
                content: icerik,
                pushType: nil
            )
            return "baslatildi"
        } catch {
            return "hata"
        }
    }
    #endif

    /// Widget zaman cizelgelerini tazeler (veri yazildiginda). Uygulama on plandayken
    /// sistem butcesine sayilmaz.
    public static func widgetlariTazele() {
        #if canImport(WidgetKit)
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        #endif
    }
}
