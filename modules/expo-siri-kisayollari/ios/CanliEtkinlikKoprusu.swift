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
    /// `NamazAkisiCanliEtkinlikUzantisi` yazilmaz → `false` (JS ekrani gostermez).
    /// `NSSupportsLiveActivities` ARTIK SINYAL DEGIL: AlarmKit (issue #74) icin uzantidan
    /// bagimsiz yazilir (`plugins/withMuhafizAlarmKit.js`); ona bakilsaydi uzantisiz build
    /// cizecek gorunumu olmayan etkinlik baslatirdi.
    public static var destekleniyor: Bool {
        guard #available(iOS 16.2, *) else { return false }
        return (Bundle.main.object(forInfoDictionaryKey: "NamazAkisiCanliEtkinlikUzantisi") as? Bool) == true
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

    /// Esitleme baglami (JS: `CanliEtkinlikSecenegi`). Yoksa eski davranis (on plan, bilinmiyor).
    struct Secenek: Decodable {
        /// Uygulama on planda mi (`AppState === 'active'`)? Arka planda `Activity.request`
        /// BASARISIZ olur (push-to-start ister) → denenmez.
        let onPlanda: Bool?
        /// Su an penceresi suren (kendi basina gecerli) adaylarin kimlikleri; `nil` = bilinmiyor
        /// (ör. konum okunamadi).
        let korunacaklar: [String]?
    }

    /// Mevcut etkinlikleri istenene esitler. Sonuc: `baslatildi` | `guncellendi` | `ayni` |
    /// `bitirildi` | `korundu` | `yok` | `izinYok` | `desteklenmiyor` | `hata`. ASLA firlatmaz.
    public static func esitle(json: String?, secenekJson: String? = nil) async -> String {
        #if canImport(ActivityKit)
        guard #available(iOS 16.2, *), destekleniyor else { return "desteklenmiyor" }
        var istek: Istek? = nil
        if let json, let veri = json.data(using: .utf8) {
            istek = try? JSONDecoder().decode(Istek.self, from: veri)
        }
        var secenek: Secenek? = nil
        if let secenekJson, let veri = secenekJson.data(using: .utf8) {
            secenek = try? JSONDecoder().decode(Secenek.self, from: veri)
        }
        return await esitleIc(
            istek,
            onPlanda: secenek?.onPlanda ?? true,
            korunacaklar: secenek?.korunacaklar.map(Set.init),
            simdiMs: Int64((Date().timeIntervalSince1970 * 1000).rounded())
        )
        #else
        return "desteklenmiyor"
        #endif
    }

    #if canImport(ActivityKit)
    /// SIRA: once istenen etkinlik GOSTERILIR (eslesen guncellenir ya da yenisi istenir),
    /// digerleri ANCAK ondan sonra bitirilir (ayni anda TEK etkinlik — Android "tek one
    /// cikan" kurali). Istenen gosterilemediyse (arka plan, izin yok, request hatasi)
    /// yalniz KENDI BASINA GECERSIZ olanlar bitirilir (`korunacaklar` disi; bilinmiyorsa
    /// yalniz on planda): arka planda (background fetch, konum yaymasi, headless Kildim)
    /// "once bitir, sonra iste" kilit ekranini BOSALTIYORDU — request arka planda basarisiz.
    @available(iOS 16.2, *)
    private static func esitleIc(
        _ istek: Istek?,
        onPlanda: Bool,
        korunacaklar: Set<String>?,
        simdiMs: Int64
    ) async -> String {
        let gecerli = istek.flatMap { $0.hedefMs > simdiMs ? $0 : nil }
        let mevcutlar = Activity<NamazCanliNitelikleri>.activities
        let eslesen = gecerli.flatMap { g in
            mevcutlar.first {
                ($0.activityState == .active || $0.activityState == .stale) && $0.attributes.kimlik == g.id
            }
        }

        var gosterildi: String? = nil
        if let g = gecerli {
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
                if mevcut.content.state == durum {
                    gosterildi = "ayni"
                } else {
                    await mevcut.update(icerik)
                    gosterildi = "guncellendi"
                }
            } else if !onPlanda {
                // Arka planda yeni etkinlik istenmez (basarisiz olur); asagida korunur.
            } else if !ActivityAuthorizationInfo().areActivitiesEnabled {
                return await digerleriniBitir(mevcutlar, korunacaklar: korunacaklar, onPlanda: onPlanda, sonuc: "izinYok")
            } else {
                do {
                    _ = try Activity.request(
                        attributes: NamazCanliNitelikleri(kimlik: g.id),
                        content: icerik,
                        pushType: nil
                    )
                    gosterildi = "baslatildi"
                } catch {
                    return await digerleriniBitir(mevcutlar, korunacaklar: korunacaklar, onPlanda: onPlanda, sonuc: "hata")
                }
            }
        }

        if let sonuc = gosterildi {
            // Istenen ekranda: geri kalan HER etkinlik biter (tek etkinlik kurali).
            for etkinlik in mevcutlar where etkinlik.id != eslesen?.id {
                await etkinlik.end(nil, dismissalPolicy: .immediate)
            }
            return sonuc
        }
        let varsayilan = gecerli == nil ? "yok" : "korundu"
        return await digerleriniBitir(mevcutlar, korunacaklar: korunacaklar, onPlanda: onPlanda, sonuc: varsayilan)
    }

    /// Istenen gosterilemediginde: yalniz kendi basina gecersiz olanlari bitirir.
    @available(iOS 16.2, *)
    private static func digerleriniBitir(
        _ mevcutlar: [Activity<NamazCanliNitelikleri>],
        korunacaklar: Set<String>?,
        onPlanda: Bool,
        sonuc: String
    ) async -> String {
        var bitirilen = 0
        for etkinlik in mevcutlar {
            let bitir = korunacaklar.map { !$0.contains(etkinlik.attributes.kimlik) } ?? onPlanda
            guard bitir else { continue }
            await etkinlik.end(nil, dismissalPolicy: .immediate)
            bitirilen += 1
        }
        if sonuc == "yok" && bitirilen > 0 { return "bitirildi" }
        return sonuc
    }
    #endif

    /// Widget zaman cizelgelerini tazeler (veri yazildiginda). Uygulama on plandayken
    /// sistem butcesine sayilmaz.
    public static func widgetlariTazele() {
        #if canImport(WidgetKit)
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        // Kontrol Merkezi "Kildim" kontrolu (iOS 18 ControlWidget) de ayni veriyi okur.
        if #available(iOS 18.0, *) {
            ControlCenter.shared.reloadAllControls()
        }
        #endif
    }

    /// Yalniz gunun ayeti widget'ini tazeler (vakit widget'i ve kontrol bu yuku okumaz;
    /// `reloadAllTimelines` onlarin WidgetKit butcesini bosuna harcardi).
    public static func gununAyetiWidgetiniTazele() {
        #if canImport(WidgetKit)
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: GununAyetiKarari.widgetTuru)
        }
        #endif
    }
}
