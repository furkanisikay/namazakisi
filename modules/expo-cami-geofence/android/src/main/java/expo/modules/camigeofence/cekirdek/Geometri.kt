package expo.modules.camigeofence.cekirdek

import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/** JS ikizi: `src/core/cami/geometri.ts`. */
object Geometri {
    const val DUNYA_YARICAPI_M = 6_371_008.8

    private fun rad(d: Double) = Math.toRadians(d)

    fun mesafeM(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val p1 = rad(lat1)
        val p2 = rad(lat2)
        val dp = p2 - p1
        val dl = rad(lng2 - lng1)
        val s1 = sin(dp / 2)
        val s2 = sin(dl / 2)
        val h = s1 * s1 + cos(p1) * cos(p2) * s2 * s2
        return 2 * DUNYA_YARICAPI_M * asin(min(1.0, sqrt(h)))
    }

    private fun yerelXy(lat0: Double, lng0: Double, lat: Double, lng: Double): DoubleArray =
        doubleArrayOf(rad(lng - lng0) * cos(rad(lat0)) * DUNYA_YARICAPI_M, rad(lat - lat0) * DUNYA_YARICAPI_M)

    /** Poligon: [enlem, boylam] çiftleri, kapalı kabul edilir. */
    fun noktaPoligondaMi(lat: Double, lng: Double, poligon: List<DoubleArray>): Boolean {
        if (poligon.size < 3) return false
        val lat0 = poligon[0][0]
        val lng0 = poligon[0][1]
        val p = yerelXy(lat0, lng0, lat, lng)
        var icinde = false
        var j = poligon.size - 1
        for (i in poligon.indices) {
            val a = yerelXy(lat0, lng0, poligon[i][0], poligon[i][1])
            val b = yerelXy(lat0, lng0, poligon[j][0], poligon[j][1])
            if ((a[1] > p[1]) != (b[1] > p[1]) &&
                p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]
            ) {
                icinde = !icinde
            }
            j = i
        }
        return icinde
    }

    fun poligonaUzaklikM(lat: Double, lng: Double, poligon: List<DoubleArray>): Double {
        if (poligon.isEmpty()) return Double.POSITIVE_INFINITY
        val lat0 = poligon[0][0]
        val lng0 = poligon[0][1]
        val p = yerelXy(lat0, lng0, lat, lng)
        var enKisa = Double.POSITIVE_INFINITY
        for (i in poligon.indices) {
            val a = yerelXy(lat0, lng0, poligon[i][0], poligon[i][1])
            val bb = poligon[(i + 1) % poligon.size]
            val b = yerelXy(lat0, lng0, bb[0], bb[1])
            val dx = b[0] - a[0]
            val dy = b[1] - a[1]
            val uz2 = dx * dx + dy * dy
            val t = if (uz2 == 0.0) 0.0 else max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / uz2))
            enKisa = min(enKisa, hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy)))
        }
        return enKisa
    }

    /** JS `etkinOlcek`: [1, 3], büyük binada `ALAN_MAX_M / yarıçap` ile kısılır; geçersiz → 1. */
    fun etkinOlcek(olcek: Double?, yaricapM: Double): Double {
        if (olcek == null || olcek.isNaN() || olcek.isInfinite() || olcek <= CamiSabitleri.OLCEK_MIN) return CamiSabitleri.OLCEK_MIN
        val ust = if (yaricapM > 0) max(CamiSabitleri.OLCEK_MIN, min(CamiSabitleri.OLCEK_MAX, CamiSabitleri.ALAN_MAX_M / yaricapM)) else CamiSabitleri.OLCEK_MAX
        return min(olcek, ust)
    }

    /** JS `poligonuOlcekle`: merkezden k katı, yerel metre izdüşümünde (enlem düzeltmeli). */
    fun poligonuOlcekle(poligon: List<DoubleArray>, lat0: Double, lng0: Double, k: Double): List<DoubleArray> {
        if (!(k > 1.0) || k.isInfinite()) return poligon.map { doubleArrayOf(it[0], it[1]) }
        val cosLat = max(1e-9, cos(rad(lat0)))
        return poligon.map {
            val xy = yerelXy(lat0, lng0, it[0], it[1])
            doubleArrayOf(
                lat0 + Math.toDegrees(xy[1] * k / DUNYA_YARICAPI_M),
                lng0 + Math.toDegrees(xy[0] * k / (DUNYA_YARICAPI_M * cosLat)),
            )
        }
    }

    fun alanYaricapiM(ozelAlanM: Double?, yaricapM: Double, ozelOlcek: Double? = null): Double {
        if (ozelAlanM != null && ozelAlanM > 0) return ozelAlanM
        return if (yaricapM > 0) yaricapM * etkinOlcek(ozelOlcek, yaricapM) else CamiSabitleri.VARSAYILAN_ALAN_M
    }

    /** JS `etkinPoligon`: daire seçildiyse null; poligon varsa ölçek uygulanmış hâli. */
    fun etkinPoligon(yer: IzlenenYer): List<DoubleArray>? {
        val ozel = yer.ozelAlanM
        if (ozel != null && ozel > 0) return null
        val pol = yer.poligon ?: return null
        if (pol.size < 3) return null
        val k = etkinOlcek(yer.ozelOlcek, yer.yaricapM)
        return if (k > CamiSabitleri.OLCEK_MIN) poligonuOlcekle(pol, yer.lat, yer.lng, k) else pol
    }

    /** Alanın DIŞINDAKİ uzaklık (m); içindeyse 0. Kural sırası JS ile birebir. */
    fun alanDisiUzaklikM(yer: IzlenenYer, lat: Double, lng: Double): Double {
        val merkez = mesafeM(lat, lng, yer.lat, yer.lng)
        val ozel = yer.ozelAlanM
        if (ozel != null && ozel > 0) return max(0.0, merkez - ozel)
        val pol = etkinPoligon(yer)
        if (pol != null) {
            if (noktaPoligondaMi(lat, lng, pol)) return 0.0
            return max(0.0, poligonaUzaklikM(lat, lng, pol) - CamiSabitleri.POLIGON_TAMPON_M)
        }
        return max(0.0, merkez - alanYaricapiM(null, yer.yaricapM))
    }
}
