package expo.modules.camigeofence.cekirdek

import kotlin.math.max
import kotlin.math.min

/**
 * Camideyim kararı — KARAR BURADA VERİLİR (süreç ölüyken de, `goAsync()` içinde).
 * JS ikizi `src/core/cami/camiKarar.ts`; ikisi ortak `cami-karar-tablosu.json`
 * fikstürüyle sınanır (CamiKararTest ↔ camiKarar.test.ts).
 */
object CamiKarar {

    /** Çakışmada en geç başlayan pencere kazanır. */
    fun kapiPenceresiniBul(simdiMs: Long, pencereler: List<KapiPenceresi>): KapiPenceresi? {
        var bulunan: KapiPenceresi? = null
        for (p in pencereler) {
            if (simdiMs >= p.bas && simdiMs <= p.son && (bulunan == null || p.bas > bulunan.bas)) bulunan = p
        }
        return bulunan
    }

    /** Konum İSTENMEDEN önce sorulur: false ise hassas ölçüm hiç alınmaz (pil). */
    fun kapiGectiMi(simdiMs: Long, vakitKapisiAcik: Boolean, pencereler: List<KapiPenceresi>): Boolean =
        !vakitKapisiAcik || kapiPenceresiniBul(simdiMs, pencereler) != null

    fun karar(
        simdiMs: Long,
        vakitKapisiAcik: Boolean,
        pencereler: List<KapiPenceresi>,
        konum: OlculenKonum?,
        adaylar: List<IzlenenYer>,
        haric: Set<String>,
    ): CamiKarari {
        val pencere = kapiPenceresiniBul(simdiMs, pencereler)
        if (vakitKapisiAcik && pencere == null) return CamiKarari("vakitDisi")
        fun zaman(sonuc: String, yerId: String? = null, mesafeM: Long? = null) =
            CamiKarari(sonuc, yerId, pencere?.vakit, pencere?.tarih, pencere?.cuma, mesafeM)

        if (konum == null || konum.lat.isNaN() || konum.lng.isNaN()) return zaman("konumYok")
        if (!(konum.dogrulukM >= 0) || konum.dogrulukM > CamiSabitleri.AZAMI_DOGRULUK_M) return zaman("supheli")

        var enYakinId: String? = null
        var enYakin = Double.POSITIVE_INFINITY
        for (yer in adaylar) {
            if (yer.id in haric) continue
            val u = Geometri.alanDisiUzaklikM(yer, konum.lat, konum.lng)
            if (enYakinId == null || u < enYakin) {
                enYakinId = yer.id
                enYakin = u
            }
        }
        if (enYakinId != null && enYakin == 0.0) return zaman("camide", enYakinId)
        return if (enYakinId != null) zaman("disarida", enYakinId, Math.round(enYakin)) else zaman("disarida")
    }

    fun camideBitisMs(girisMs: Long, cuma: Boolean): Long =
        girisMs + (if (cuma) CamiSabitleri.CAMIDE_CUMA_AZAMI_DK else CamiSabitleri.CAMIDE_AZAMI_DK) * CamiSabitleri.DAKIKA_MS

    fun yenilemeYaricapiM(kinciMesafeM: Double?): Double {
        if (kinciMesafeM == null || kinciMesafeM.isNaN() || kinciMesafeM.isInfinite()) return CamiSabitleri.YENILEME_MAX_M
        return min(
            CamiSabitleri.YENILEME_MAX_M,
            max(CamiSabitleri.YENILEME_MIN_M, Math.round(kinciMesafeM - CamiSabitleri.YENILEME_ICERI_PAY_M).toDouble()),
        )
    }

    /** "yenile" | "bayatKonum" | "cokSik" — sıkı döngü koruması (şehir takibi dersinin aynısı). */
    fun yenilemeKarari(simdiMs: Long, sonYenilemeMs: Long?, konumZamaniMs: Long?): String {
        if (sonYenilemeMs != null) {
            val fark = simdiMs - sonYenilemeMs
            if (fark >= 0 && fark < CamiSabitleri.YENILEME_BEKLEMESI_MS) return "cokSik"
        }
        if (konumZamaniMs == null) return "bayatKonum"
        val yas = simdiMs - konumZamaniMs
        if (yas < 0 || yas > CamiSabitleri.KONUM_TAZELIK_MS) return "bayatKonum"
        return "yenile"
    }

    /**
     * Yeniden merkezleme ölçümünün sonucu (denetim D-09): önce `yenilemeKarari`
     * (tazelik + sıklık, JS ikizli), "yenile" ise ayrıca DOĞRULUK — balanced ölçüm
     * kaba konum döndürebilir. Doğruluk bilinmiyorsa (NaN/negatif) güvenli taraf: kaba.
     */
    fun yenilemeOlcumKarari(simdiMs: Long, sonYenilemeMs: Long?, konumZamaniMs: Long?, dogrulukM: Double?): String {
        val karar = yenilemeKarari(simdiMs, sonYenilemeMs, konumZamaniMs)
        if (karar != "yenile") return karar
        if (dogrulukM == null || !(dogrulukM >= 0) || dogrulukM > CamiSabitleri.YENILEME_AZAMI_DOGRULUK_M) return "kabaKonum"
        return "yenile"
    }

    fun geofenceYaricapiM(yer: IzlenenYer): Double =
        max(CamiSabitleri.GEOFENCE_YARICAPI_M, Geometri.alanYaricapiM(yer.ozelAlanM, yer.yaricapM, yer.ozelOlcek) + CamiSabitleri.GEOFENCE_ALAN_PAYI_M)

    /** JS `izlenecekleriSec` ikizi. */
    fun izlenecekleriSec(
        lat: Double,
        lng: Double,
        enYakinOsm: List<CamiKaydi>,
        yerler: Map<String, YerKaydi>,
        k: Int = CamiSabitleri.IZLENEN_CAMI_SAYISI,
        ekKota: Int = CamiSabitleri.EK_YER_KOTASI,
    ): Pair<List<IzlenenYer>, Double?> {
        val izlenenler = ArrayList<IzlenenYer>()
        val eklenen = HashSet<String>()
        var kinci: Double? = null
        for (kayit in enYakinOsm) {
            if (izlenenler.size >= k) break
            val ayar = yerler[kayit.id]
            if (ayar?.durum == "haric") continue
            izlenenler.add(
                IzlenenYer(
                    kayit.id, kayit.ad, kayit.lat, kayit.lng, kayit.yaricapM, kayit.poligon, ayar?.alanM, "osm", ayar?.durum == "favori",
                    // Ölçek yalnız poligonlu kayıtta ve daire seçilmemişken anlamlıdır (JS ile aynı).
                    ozelOlcek = if (ayar?.alanM == null && kayit.poligon != null) ayar?.olcek else null,
                )
            )
            eklenen.add(kayit.id)
            if (izlenenler.size == k) kinci = Geometri.mesafeM(lat, lng, kayit.lat, kayit.lng)
        }
        val ekler = ArrayList<Pair<IzlenenYer, Double>>()
        for ((id, ayar) in yerler) {
            if (id in eklenen || ayar.durum == "haric") continue
            if (!(ayar.kendi || ayar.durum == "favori")) continue
            val yLat = ayar.lat ?: continue
            val yLng = ayar.lng ?: continue
            ekler.add(
                IzlenenYer(id, ayar.ad ?: "", yLat, yLng, 0.0, null, ayar.alanM, if (ayar.kendi) "kendi" else "osm", ayar.durum == "favori") to
                    Geometri.mesafeM(lat, lng, yLat, yLng)
            )
        }
        ekler.sortWith(compareBy<Pair<IzlenenYer, Double>> { it.second }.thenBy { it.first.id })
        ekler.take(ekKota).forEach { izlenenler.add(it.first) }
        return izlenenler to kinci
    }
}
