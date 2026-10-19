package expo.modules.camigeofence.cekirdek

import org.json.JSONArray
import org.json.JSONObject

/** Veri dosyasından okunmuş kayıt (JS: `CamiKaydi`). */
data class CamiKaydi(
    val id: String,
    val ad: String,
    val lat: Double,
    val lng: Double,
    val yaricapM: Double,
    val poligon: List<DoubleArray>?,
)

/** Geofence'i kurulan yer (JS: `IzlenenYer`). */
data class IzlenenYer(
    val id: String,
    val ad: String,
    val lat: Double,
    val lng: Double,
    val yaricapM: Double,
    val poligon: List<DoubleArray>?,
    val ozelAlanM: Double?,
    val kaynak: String,
    val favori: Boolean,
    /** Bina sınırı ölçeği (JS `ozelOlcek`); yoksa özgün sınır. Eski kayıtta alan yoktur. */
    val ozelOlcek: Double? = null,
) {
    fun json(): JSONObject = JSONObject()
        .put("id", id).put("ad", ad).put("lat", lat).put("lng", lng).put("yaricapM", yaricapM)
        .put("poligon", poligon?.let { p -> JSONArray().apply { p.forEach { put(JSONArray().put(it[0]).put(it[1])) } } } ?: JSONObject.NULL)
        .put("ozelAlanM", ozelAlanM ?: JSONObject.NULL)
        .put("kaynak", kaynak).put("favori", favori)
        .also { o -> ozelOlcek?.let { o.put("ozelOlcek", it) } }

    companion object {
        fun coz(o: JSONObject): IzlenenYer? = try {
            IzlenenYer(
                id = o.getString("id"),
                ad = o.optString("ad", ""),
                lat = o.getDouble("lat"),
                lng = o.getDouble("lng"),
                yaricapM = o.optDouble("yaricapM", 0.0),
                poligon = poligonCoz(o.optJSONArray("poligon")),
                ozelAlanM = if (o.isNull("ozelAlanM")) null else o.optDouble("ozelAlanM").takeIf { !it.isNaN() },
                kaynak = o.optString("kaynak", "osm"),
                favori = o.optBoolean("favori", false),
                ozelOlcek = if (!o.has("ozelOlcek") || o.isNull("ozelOlcek")) null else o.optDouble("ozelOlcek").takeIf { !it.isNaN() },
            )
        } catch (_: Exception) {
            null
        }

        fun poligonCoz(a: JSONArray?): List<DoubleArray>? {
            if (a == null || a.length() < 3) return null
            return (0 until a.length()).map { i ->
                val p = a.getJSONArray(i)
                doubleArrayOf(p.getDouble(0), p.getDouble(1))
            }
        }
    }
}

/** Kullanıcının bir yere dair ayarı (JS: `YerKaydi`). */
data class YerKaydi(
    val durum: String,
    val alanM: Double?,
    val ad: String?,
    val lat: Double?,
    val lng: Double?,
    val kendi: Boolean,
    /** Bina sınırı ölçeği (JS `YerKaydi.olcek`); `alanM` varsa yok sayılır. */
    val olcek: Double? = null,
) {
    companion object {
        fun coz(o: JSONObject): YerKaydi = YerKaydi(
            durum = o.optString("durum", "normal").let { if (it == "favori" || it == "haric") it else "normal" },
            alanM = if (o.has("alanM") && !o.isNull("alanM")) o.optDouble("alanM").takeIf { !it.isNaN() } else null,
            ad = if (o.has("ad") && !o.isNull("ad")) o.optString("ad") else null,
            lat = if (o.has("lat") && !o.isNull("lat")) o.optDouble("lat").takeIf { !it.isNaN() } else null,
            lng = if (o.has("lng") && !o.isNull("lng")) o.optDouble("lng").takeIf { !it.isNaN() } else null,
            kendi = o.optBoolean("kendi", false),
            olcek = if (o.has("olcek") && !o.isNull("olcek")) o.optDouble("olcek").takeIf { !it.isNaN() } else null,
        )

        fun haritaCoz(o: JSONObject?): Map<String, YerKaydi> {
            if (o == null) return emptyMap()
            val sonuc = LinkedHashMap<String, YerKaydi>()
            for (anahtar in o.keys()) {
                val deger = o.optJSONObject(anahtar) ?: continue
                sonuc[anahtar] = coz(deger)
            }
            return sonuc
        }
    }
}

/** Vakit kapısı penceresi (JS: `KapiPenceresi`). */
data class KapiPenceresi(
    val bas: Long,
    val son: Long,
    val vakit: String,
    val tarih: String,
    val cuma: Boolean,
) {
    fun json(): JSONObject = JSONObject().put("bas", bas).put("son", son).put("vakit", vakit).put("tarih", tarih).put("cuma", cuma)

    companion object {
        fun listeCoz(a: JSONArray?): List<KapiPenceresi> {
            if (a == null) return emptyList()
            val sonuc = ArrayList<KapiPenceresi>()
            for (i in 0 until a.length()) {
                val o = a.optJSONObject(i) ?: continue
                try {
                    sonuc.add(KapiPenceresi(o.getLong("bas"), o.getLong("son"), o.getString("vakit"), o.getString("tarih"), o.optBoolean("cuma", false)))
                } catch (_: Exception) {
                    // bozuk öğe atlanır
                }
            }
            return sonuc
        }
    }
}

data class OlculenKonum(val lat: Double, val lng: Double, val dogrulukM: Double)

data class CamiKarari(
    val sonuc: String,
    val yerId: String? = null,
    val vakit: String? = null,
    val tarih: String? = null,
    val cuma: Boolean? = null,
    val mesafeM: Long? = null,
)
