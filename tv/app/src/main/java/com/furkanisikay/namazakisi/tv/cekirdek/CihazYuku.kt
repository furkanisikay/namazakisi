package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject

/**
 * Cihaz ağı yükü — alıcı tarafı (telefon ikizi `src/core/cihazAgi/yuk.ts`). Şekil bozuk alan
 * varsayılana düşer, bilinmeyen alan yok sayılır (ileri uyumluluk). Saf.
 */
data class DurumGoruntusu(
    val ad: String?,
    val lat: Double?,
    val lng: Double?,
    /** Namaz günü (YYYY-MM-DD) → kılınan vakit kodları. */
    val kilinan: Map<String, Set<String>>,
    val ozelGun: Boolean,
    val tvHatirlat: Boolean,
    val durumumSayilsin: Boolean,
    val cumaAktif: Boolean,
    val cumaCikisDk: Int?,
    val ramazan: Boolean,
)

data class CihazOlayi(val id: String, val tur: String, val tarih: String, val vakit: String)

data class CihazYuku(val durum: DurumGoruntusu?, val olaylar: List<CihazOlayi>, val sil: Boolean)

object CihazYukuCozucu {
    private val VAKITLER = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")
    private val TARIH = Regex("^\\d{4}-\\d{2}-\\d{2}$")

    fun coz(duz: String): CihazYuku? {
        val o = try {
            JSONObject(duz)
        } catch (e: Exception) {
            return null
        }
        if (o.optInt("v", -1) != CihazKanali.SURUM) return null
        val d = o.optJSONObject("durum")
        val durum = d?.let { durumCoz(it) }
        val olaylar = mutableListOf<CihazOlayi>()
        o.optJSONArray("olaylar")?.let { dizi ->
            for (i in 0 until minOf(dizi.length(), 200)) {
                val e = dizi.optJSONObject(i) ?: continue
                val id = e.optString("id")
                val tarih = e.optString("tarih")
                val vakit = e.optString("vakit")
                if (id.isNotEmpty() && id.length <= 64 && TARIH.matches(tarih) && vakit in VAKITLER) {
                    olaylar += CihazOlayi(id, e.optString("tur"), tarih, vakit)
                }
            }
        }
        return CihazYuku(durum, olaylar, o.optBoolean("sil", false))
    }

    private fun durumCoz(d: JSONObject): DurumGoruntusu {
        val konum = d.optJSONObject("konum")
        val lat = konum?.optDouble("lat", Double.NaN)?.takeIf { it.isFinite() && it in -90.0..90.0 }
        val lng = konum?.optDouble("lng", Double.NaN)?.takeIf { it.isFinite() && it in -180.0..180.0 }
        val gecerliKonum = lat != null && lng != null && !(lat == 0.0 && lng == 0.0)
        val kilinan = mutableMapOf<String, Set<String>>()
        d.optJSONObject("kilinan")?.let { k ->
            for (gun in k.keys()) {
                if (!TARIH.matches(gun)) continue
                val dizi = k.optJSONArray(gun) ?: continue
                kilinan[gun] = (0 until dizi.length()).map { dizi.optString(it) }.filter { it in VAKITLER }.toSet()
            }
        }
        val cuma = d.optJSONObject("cuma")
        return DurumGoruntusu(
            ad = d.optString("ad").takeIf { it.isNotBlank() }?.let { EslemeProtokolu.adiTemizle(it) },
            lat = if (gecerliKonum) lat else null,
            lng = if (gecerliKonum) lng else null,
            kilinan = kilinan,
            ozelGun = d.optBoolean("ozelGun", false),
            tvHatirlat = d.optBoolean("tvHatirlat", false),
            durumumSayilsin = d.optBoolean("durumumSayilsin", false),
            cumaAktif = cuma?.optBoolean("aktif", false) ?: false,
            cumaCikisDk = cuma?.takeIf { !it.isNull("cikisDk") }?.optInt("cikisDk", -1)?.takeIf { it in 0..240 },
            ramazan = d.optBoolean("ramazan", false),
        )
    }
}
