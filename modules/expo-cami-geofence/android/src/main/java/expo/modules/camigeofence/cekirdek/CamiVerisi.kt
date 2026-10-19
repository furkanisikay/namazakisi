package expo.modules.camigeofence.cekirdek

import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.zip.CRC32
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToLong

/**
 * `NACM` ikili cami verisi çözücüsü (biçim: `scripts/camiler/BICIM.md`).
 * JS ikizi: `src/core/cami/camiVerisi.ts` — ortak fikstür `ornek-camiler.bin`.
 *
 * Bozuk veride [coz] `null` döner (asla fırlatmaz) → "cami verisi yok" durumu;
 * kullanıcının kendi eklediği yerler ve favoriler yine izlenir.
 */
class CamiVerisi private constructor(
    private val b: ByteBuffer,
    val kayitSayisi: Int,
    val veriZamani: Long,
    private val hucre: Int,
    private val minLat: Int,
    private val minLng: Int,
    private val satir: Int,
    private val sutun: Int,
    private val kayitOf: Int,
    private val poligonOf: Int,
    private val adOf: Int,
    private val izgaraOf: Int,
    private val toplam: Int,
) {
    data class EnYakin(val kayit: CamiKaydi, val mesafeM: Double)

    private fun izgara(i: Int): Int = b.getInt(izgaraOf + i * 4)

    fun kayit(i: Int): CamiKaydi {
        require(i in 0 until kayitSayisi) { "Kayit yok: $i" }
        val o = kayitOf + i * KAYIT
        val latE6 = b.getInt(o)
        val lngE6 = b.getInt(o + 4)
        val idAlt = b.getInt(o + 8).toLong() and 0xFFFFFFFFL
        val idUst = b.get(o + 12).toLong() and 0xFF
        val tur = b.get(o + 13).toInt() and 0xFF
        val kose = b.get(o + 14).toInt() and 0xFF
        val yaricap = b.get(o + 15).toInt() and 0xFF
        val polOf = b.getInt(o + 16).toLong() and 0xFFFFFFFFL
        val adOfset = b.getInt(o + 20).toLong() and 0xFFFFFFFFL

        var ad = ""
        if (adOfset != YOK && adOf + adOfset < toplam) {
            val bas = (adOf + adOfset).toInt()
            val uz = b.get(bas).toInt() and 0xFF
            if (bas + 1 + uz <= toplam) {
                val bayt = ByteArray(uz)
                for (j in 0 until uz) bayt[j] = b.get(bas + 1 + j)
                ad = String(bayt, Charsets.UTF_8)
            }
        }
        var poligon: List<DoubleArray>? = null
        if (polOf != YOK && kose >= 3 && poligonOf + polOf + kose * 4 <= adOf) {
            val bas = (poligonOf + polOf).toInt()
            poligon = (0 until kose).map { j ->
                val p = bas + j * 4
                doubleArrayOf((latE6 + b.getShort(p)) / 1e6, (lngE6 + b.getShort(p + 2)) / 1e6)
            }
        }
        val harf = when (tur) { 1 -> "w"; 2 -> "r"; else -> "n" }
        // Kendini kesen halka (eski üretici çıktısı) dış bürüne onarılır — JS ikiziyle aynı.
        return CamiKaydi("osm:$harf${(idUst shl 32) or idAlt}", ad, latE6 / 1e6, lngE6 / 1e6, yaricap.toDouble(), poligon?.let { Geometri.poligonuOnar(it) })
    }

    /** En yakın K kayıt (mesafeye göre artan). JS `enYakinlar` ile birebir. */
    fun enYakinlar(lat: Double, lng: Double, k: Int, azamiM: Double = CamiSabitleri.ARAMA_AZAMI_M): List<EnYakin> {
        if (k <= 0 || kayitSayisi == 0 || lat.isNaN() || lng.isNaN()) return emptyList()
        val r0 = floor(((lat * 1e6).roundToLong() - minLat).toDouble() / hucre).toInt()
        val c0 = floor(((lng * 1e6).roundToLong() - minLng).toDouble() / hucre).toInt()
        val hucreLatM = (hucre / 1e6) * 111_195.0
        val enKuzey = max(abs(lat), max(abs(minLat / 1e6), abs((minLat + satir.toLong() * hucre) / 1e6)))
        val hucreLngM = hucreLatM * max(0.01, cos(Math.toRadians(min(89.0, enKuzey))))
        val enKucuk = min(hucreLatM, hucreLngM)
        val azamiHalka = ceil(azamiM / enKucuk).toInt() + 1
        val secilen = ArrayList<EnYakin>()

        fun tara(r: Int, c: Int) {
            if (r < 0 || c < 0 || r >= satir || c >= sutun) return
            val h = r * sutun + c
            for (i in izgara(h) until izgara(h + 1)) {
                val o = kayitOf + i * KAYIT
                val m = Geometri.mesafeM(lat, lng, b.getInt(o) / 1e6, b.getInt(o + 4) / 1e6)
                if (m > azamiM) continue
                if (secilen.size < k || m < secilen.last().mesafeM) {
                    var j = secilen.size
                    while (j > 0 && secilen[j - 1].mesafeM > m) j--
                    secilen.add(j, EnYakin(kayit(i), m))
                    if (secilen.size > k) secilen.removeAt(secilen.size - 1)
                }
            }
        }

        for (halka in 0..azamiHalka) {
            if (secilen.size >= k && (halka - 1) * enKucuk > secilen.last().mesafeM) break
            if (halka == 0) {
                tara(r0, c0)
                continue
            }
            for (c in c0 - halka..c0 + halka) {
                tara(r0 - halka, c)
                tara(r0 + halka, c)
            }
            for (r in r0 - halka + 1..r0 + halka - 1) {
                tara(r, c0 - halka)
                tara(r, c0 + halka)
            }
            if (r0 - halka < 0 && r0 + halka >= satir && c0 - halka < 0 && c0 + halka >= sutun) break
        }
        return secilen
    }

    companion object {
        const val SURUM = 1
        private const val BASLIK = 64
        private const val KAYIT = 24
        private const val YOK = 0xFFFFFFFFL

        fun coz(veri: ByteArray): CamiVerisi? = try {
            cozIc(veri)
        } catch (_: Exception) {
            null
        }

        private fun cozIc(veri: ByteArray): CamiVerisi? {
            if (veri.size < BASLIK) return null
            val b = ByteBuffer.wrap(veri).order(ByteOrder.LITTLE_ENDIAN)
            if (veri[0] != 'N'.code.toByte() || veri[1] != 'A'.code.toByte() || veri[2] != 'C'.code.toByte() || veri[3] != 'M'.code.toByte()) return null
            if ((b.getShort(4).toInt() and 0xFFFF) != SURUM || (b.getShort(6).toInt() and 0xFFFF) != KAYIT) return null
            val n = b.getInt(8).toLong() and 0xFFFFFFFFL
            val hucre = b.getInt(12)
            val minLat = b.getInt(16)
            val minLng = b.getInt(20)
            val satir = b.getShort(24).toInt() and 0xFFFF
            val sutun = b.getShort(26).toInt() and 0xFFFF
            val zaman = b.getInt(28).toLong() and 0xFFFFFFFFL
            val kayitOf = b.getInt(32).toLong() and 0xFFFFFFFFL
            val poligonOf = b.getInt(36).toLong() and 0xFFFFFFFFL
            val adOf = b.getInt(40).toLong() and 0xFFFFFFFFL
            val izgaraOf = b.getInt(44).toLong() and 0xFFFFFFFFL
            val toplam = b.getInt(48).toLong() and 0xFFFFFFFFL
            val crc = b.getInt(52).toLong() and 0xFFFFFFFFL

            if (toplam != veri.size.toLong() || hucre <= 0 || satir == 0 || sutun == 0) return null
            val hucreSayisi = satir.toLong() * sutun
            if (izgaraOf != BASLIK.toLong() || izgaraOf + (hucreSayisi + 1) * 4 != kayitOf) return null
            if (kayitOf + n * KAYIT != poligonOf || poligonOf > adOf || adOf > toplam) return null
            val c = CRC32()
            c.update(veri, BASLIK, veri.size - BASLIK)
            if (c.value != crc) return null
            var onceki = 0L
            for (i in 0..hucreSayisi.toInt()) {
                val g = b.getInt((izgaraOf + i * 4).toInt()).toLong() and 0xFFFFFFFFL
                if (g < onceki || g > n) return null
                onceki = g
            }
            if (onceki != n) return null
            return CamiVerisi(
                b, n.toInt(), zaman, hucre, minLat, minLng, satir, sutun,
                kayitOf.toInt(), poligonOf.toInt(), adOf.toInt(), izgaraOf.toInt(), toplam.toInt(),
            )
        }
    }
}
