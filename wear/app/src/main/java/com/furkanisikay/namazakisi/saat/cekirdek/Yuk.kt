package com.furkanisikay.namazakisi.saat.cekirdek

import org.json.JSONObject

/**
 * Telefon → saat YÜK SÖZLEŞMESİ (issue #269) — telefon tarafının aynası:
 * `src/core/wear/wearYuku.ts`. İki taraf AYNI örnek dosyayı kabul eder
 * (`src/test/resources/ornek-yuk.json`); şema tek taraflı değiştirilemez.
 */
const val DESTEKLENEN_YUK_SURUMU = 1

/** Sözleşme sırası; `gunes` görüntülenir ama asla "kılınmış" olmaz. */
val VAKITLER = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")

data class Kerahat(val surukDk: Int, val istivaDk: Int, val gurubDk: Int)

data class Gun(
    val tarih: String,
    /** vakit → giriş anı (epoch ms) */
    val vakitler: Map<String, Long>,
    val kilinan: Set<String>,
)

data class Yuk(
    val surum: Int,
    val konumAdi: String,
    val kerahat: Kerahat,
    val gunler: List<Gun>,
)

sealed class CozumSonucu {
    data class Basarili(val yuk: Yuk) : CozumSonucu()
    /** Telefon daha yeni bir şema gönderdi — saat eski veriyi göstermeye devam eder. */
    data class SurumYeni(val surum: Int) : CozumSonucu()
    data object Gecersiz : CozumSonucu()
}

object YukCozucu {
    private val TARIH = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun coz(json: String?): CozumSonucu {
        if (json.isNullOrBlank()) return CozumSonucu.Gecersiz
        return try {
            val o = JSONObject(json)
            val surum = o.getInt("surum")
            if (surum > DESTEKLENEN_YUK_SURUMU) return CozumSonucu.SurumYeni(surum)
            val k = o.getJSONObject("kerahatDk")
            val kerahat = Kerahat(k.getInt("suruk"), k.getInt("istiva"), k.getInt("gurub"))
            val dizi = o.getJSONArray("gunler")
            if (dizi.length() == 0) return CozumSonucu.Gecersiz
            val gunler = (0 until dizi.length()).map { i ->
                val g = dizi.getJSONObject(i)
                val tarih = g.getString("tarih")
                require(TARIH.matches(tarih))
                val v = g.getJSONObject("vakitler")
                val vakitler = VAKITLER.associateWith { v.getLong(it) }
                val kd = g.getJSONArray("kilinan")
                val kilinan = (0 until kd.length()).map { kd.getString(it) }.toSet()
                require(kilinan.all { it in VAKITLER && it != "gunes" })
                Gun(tarih, vakitler, kilinan)
            }.sortedBy { it.tarih }
            CozumSonucu.Basarili(Yuk(surum, o.getString("konumAdi"), kerahat, gunler))
        } catch (_: Exception) {
            CozumSonucu.Gecersiz
        }
    }
}
