package com.furkanisikay.namazakisi.tv.cekirdek

import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Telefonun gösterdiği 7 haneli konum kodu (ağsız yedek yol). Telefon ikizi
 * `src/core/tv/eslemeKodu.ts`; ikisi de `esleme-ornekleri.json`'u kabul eder.
 *
 * 6 hane gövde (0,1° ızgara, enlem [20, 60), boylam [-20, 60), satır × 800 + sütun) + 1 Damm
 * kontrol hanesi. Hesap mikroderece tamsayılarıyla yapılır (kayan nokta sınır tuzağı).
 */
object EslemeKodu {
    const val UZUNLUK = 7
    private const val ENLEM_TABANI = 20_000_000L
    private const val BOYLAM_TABANI = -20_000_000L
    private const val HUCRE = 100_000L
    private const val SATIR = 400L
    private const val SUTUN = 800L

    private val DAMM = arrayOf(
        intArrayOf(0, 3, 1, 7, 5, 9, 8, 6, 4, 2),
        intArrayOf(7, 0, 9, 2, 1, 5, 4, 8, 6, 3),
        intArrayOf(4, 2, 0, 6, 8, 7, 1, 3, 5, 9),
        intArrayOf(1, 7, 5, 0, 9, 8, 3, 4, 2, 6),
        intArrayOf(6, 1, 2, 3, 0, 4, 5, 9, 7, 8),
        intArrayOf(3, 6, 7, 4, 2, 0, 9, 5, 8, 1),
        intArrayOf(5, 8, 6, 9, 7, 2, 0, 1, 3, 4),
        intArrayOf(8, 9, 4, 5, 3, 6, 2, 0, 1, 7),
        intArrayOf(9, 4, 3, 8, 6, 1, 7, 2, 0, 5),
        intArrayOf(2, 5, 8, 1, 4, 3, 6, 7, 9, 0),
    )

    fun dammAraDurumu(rakamlar: String): Int {
        var durum = 0
        for (c in rakamlar) durum = DAMM[durum][c - '0']
        return durum
    }

    fun kodla(lat: Double, lng: Double): String? {
        if (!lat.isFinite() || !lng.isFinite()) return null
        val satir = Math.floorDiv(Math.round(lat * 1e6) - ENLEM_TABANI, HUCRE)
        val sutun = Math.floorDiv(Math.round(lng * 1e6) - BOYLAM_TABANI, HUCRE)
        if (satir !in 0 until SATIR || sutun !in 0 until SUTUN) return null
        val govde = (satir * SUTUN + sutun).toString().padStart(6, '0')
        return govde + dammAraDurumu(govde)
    }

    /** Kodu hücre merkezine çözer; hatalı kod (eksik hane, kontrol hanesi, ayrılmış aralık) `null`. */
    fun coz(kod: String): Pair<Double, Double>? {
        if (kod.length != UZUNLUK || kod.any { it !in '0'..'9' }) return null
        if (dammAraDurumu(kod) != 0) return null
        val govde = kod.substring(0, 6).toLong()
        if (govde >= SATIR * SUTUN) return null
        val satir = govde / SUTUN
        val sutun = govde % SUTUN
        return Pair(
            (ENLEM_TABANI + satir * HUCRE + HUCRE / 2) / 1e6,
            (BOYLAM_TABANI + sutun * HUCRE + HUCRE / 2) / 1e6,
        )
    }

    /**
     * Koddan gelen konumun adı: TV'de ilçe verisi yok → en yakın il (75 km içinde), yoksa
     * genel ad. Uydurma ilçe adı YAZILMAZ.
     */
    fun konumAdi(iller: List<Il>, lat: Double, lng: Double): String {
        val enYakin = iller.minByOrNull { mesafeKm(lat, lng, it.lat, it.lng) } ?: return GENEL_AD
        return if (mesafeKm(lat, lng, enYakin.lat, enYakin.lng) <= YAKIN_KM) enYakin.ad else GENEL_AD
    }

    const val GENEL_AD = "Telefonunuzdaki konum"
    private const val YAKIN_KM = 75.0

    fun mesafeKm(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val r = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)
        val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLng / 2).pow(2)
        return 2 * r * asin(sqrt(a))
    }
}
