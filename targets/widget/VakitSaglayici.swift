import Foundation
import WidgetKit

// ZAMAN CIZELGESI SAGLAYICISI (issue #295).
//
// Veri, uygulamanin JS'te hesaplayip App Group deposuna yazdigi widget yukudur
// (`SiriDeposu`, Android widget'iyla AYNI yuk: dun + 8 gun). Karar saf
// `WidgetKarari`'dadir (TS ikizi `src/core/widget/iosWidgetKarari.ts`, ortak fikstur).
//
// GIRDILER YALNIZ VAKIT SINIRLARINDA: dakikalik girdi YOK. Kalan sureyi ve ilerlemeyi
// sistem cizer (`Text(timerInterval:)`, `ProgressView(timerInterval:)`) → pil ve
// WidgetKit butcesi harcanmaz. Kilinmislik degisince uygulama zaman cizelgelerini
// yeniden yukletir (`CanliEtkinlikKoprusu.widgetlariTazele`).

/// Orta boy widget'in bir satiri.
struct GunSatiri: Identifiable {
    let vakit: SiriVakitAni
    let kilindi: Bool
    var id: Int64 { vakit.ms }
}

struct VakitGirdisi: TimelineEntry {
    let date: Date
    /// nil → uygulama henuz veri yazmadi (konum ayarlanmamis).
    let gorunum: WidgetGorunumu?
    /// Gosterilen namaz gununun bes vakti ve kilinmisliklari (orta boy).
    let gunVakitleri: [GunSatiri]
    /// Veri var ama tukenmis (uygulama uzun suredir acilmadi).
    let veriEski: Bool

    static func bos(_ tarih: Date) -> VakitGirdisi {
        VakitGirdisi(date: tarih, gorunum: nil, gunVakitleri: [], veriEski: false)
    }
}

struct VakitSaglayici: TimelineProvider {
    func placeholder(in context: Context) -> VakitGirdisi {
        Self.ornek()
    }

    func getSnapshot(in context: Context, completion: @escaping (VakitGirdisi) -> Void) {
        if context.isPreview {
            completion(Self.ornek())
            return
        }
        completion(Self.girdiler(simdi: Date()).girdiler.first ?? .bos(Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VakitGirdisi>) -> Void) {
        let sonuc = Self.girdiler(simdi: Date())
        let politika: TimelineReloadPolicy = sonuc.sonSinir.map { .after($0) } ?? .never
        completion(Timeline(entries: sonuc.girdiler, policy: politika))
    }

    static func tarih(_ ms: Int64) -> Date {
        Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
    }

    /// Simdi + gelecekteki vakit sinirlari. Son sinirdan sonra sistem yeniden ister.
    static func girdiler(simdi: Date) -> (girdiler: [VakitGirdisi], sonSinir: Date?) {
        let depo = SiriDeposu.varsayilan
        guard let cizelge = depo.cizelge(), !cizelge.vakitler.isEmpty else {
            return ([.bos(simdi)], nil)
        }
        let kilinanlar = depo.kilinanlar()
        let bekleyenler = depo.bekleyenler()
        let simdiMs = SiriDeposu.simdiMs(simdi)
        let sinirlar = WidgetKarari.sinirlar(cizelge.vakitler, simdiMs: simdiMs)

        func girdi(_ ms: Int64) -> VakitGirdisi {
            let g = WidgetKarari.gorunum(
                vakitler: cizelge.vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyenler, simdiMs: ms
            )
            let gun = g.gunTarihi.map { WidgetKarari.gunVakitleri(cizelge.vakitler, tarih: $0) } ?? []
            return VakitGirdisi(
                date: tarih(ms),
                gorunum: g,
                gunVakitleri: gun.map {
                    GunSatiri(vakit: $0, kilindi: WidgetKarari.kilindiMi($0, kilinanlar: kilinanlar, bekleyenler: bekleyenler))
                },
                veriEski: g.aktif == nil && g.sonraki == nil
            )
        }

        let liste = [girdi(simdiMs)] + sinirlar.map { girdi($0) }
        return (liste, sinirlar.last.map { tarih($0) })
    }

    /// Galeri onizlemesi: sabit, gercekci bir ogle vakti.
    static func ornek() -> VakitGirdisi {
        let simdi = Date()
        let simdiMs = SiriDeposu.simdiMs(simdi)
        let saat: Int64 = 3_600_000
        let ogle = SiriVakitAni(vakit: "ogle", ms: simdiMs - saat, tarih: SiriDeposu.bugunIso(simdi))
        let ikindi = SiriVakitAni(vakit: "ikindi", ms: simdiMs + 2 * saat, tarih: ogle.tarih)
        let gun = [
            SiriVakitAni(vakit: "sabah", ms: simdiMs - 8 * saat, tarih: ogle.tarih),
            ogle,
            ikindi,
            SiriVakitAni(vakit: "aksam", ms: simdiMs + 5 * saat, tarih: ogle.tarih),
            SiriVakitAni(vakit: "yatsi", ms: simdiMs + 6 * saat, tarih: ogle.tarih),
        ]
        return VakitGirdisi(
            date: simdi,
            gorunum: WidgetGorunumu(aktif: ogle, bitisMs: ikindi.ms, kilindi: false, sonraki: ikindi, gunTarihi: ogle.tarih),
            gunVakitleri: gun.map { GunSatiri(vakit: $0, kilindi: $0.vakit == "sabah") },
            veriEski: false
        )
    }
}
