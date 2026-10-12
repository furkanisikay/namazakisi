package com.furkanisikay.namazakisi.wear

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Saatten gelen "Kıldım" isteklerinin KALICI kuyruğu (issue #269).
 *
 * Neden kalıcı: saat isteği `WearDinleyiciServisi`'ne gelir ama JS o an
 * çalışmıyor olabilir ve headless görev başlatılması OEM/arka plan kısıtına
 * takılabilir. Öğe burada bekler; JS üç ayrı yoldan (headless görev, ön plana
 * geliş, 15 dk'lık arka plan görevi) boşaltır. Doğruluk hiçbirine tek başına bağlı
 * değildir.
 *
 * Kimlik = "<tarih>_<vakit>" → aynı vakit iki kez gelirse tek öğe kalır.
 * ZEHİRLİ ÖĞE: JS işleyemezse `basarisiz` deneme sayacını artırır; [MAKS_DENEME]
 * aşılınca öğe düşürülür (tek bozuk öğe kuyruğu sonsuza kadar kilitlemesin).
 */
object WearKildimKuyrugu {
    private const val PREFS = "namazakisi_wear"
    private const val ANAHTAR = "kildim_kuyrugu"
    const val MAKS_DENEME = 5

    private val GECERLI_VAKITLER = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")
    private val TARIH_DESENI = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun gecerliMi(tarih: String?, vakit: String?): Boolean =
        tarih != null && vakit != null && TARIH_DESENI.matches(tarih) && vakit in GECERLI_VAKITLER

    @Synchronized
    fun ekle(context: Context, tarih: String, vakit: String): Boolean {
        if (!gecerliMi(tarih, vakit)) return false
        val dizi = oku(context)
        val id = "${tarih}_$vakit"
        for (i in 0 until dizi.length()) {
            if (dizi.getJSONObject(i).optString("id") == id) return true
        }
        dizi.put(JSONObject().put("id", id).put("tarih", tarih).put("vakit", vakit).put("deneme", 0))
        yaz(context, dizi)
        return true
    }

    @Synchronized
    fun tumu(context: Context): String = oku(context).toString()

    @Synchronized
    fun tamamlandi(context: Context, id: String) {
        val dizi = oku(context)
        val yeni = JSONArray()
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            if (o.optString("id") != id) yeni.put(o)
        }
        yaz(context, yeni)
    }

    @Synchronized
    fun basarisiz(context: Context, id: String) {
        val dizi = oku(context)
        val yeni = JSONArray()
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            if (o.optString("id") == id) {
                val deneme = o.optInt("deneme", 0) + 1
                if (deneme >= MAKS_DENEME) continue
                o.put("deneme", deneme)
            }
            yeni.put(o)
        }
        yaz(context, yeni)
    }

    private fun oku(context: Context): JSONArray =
        try {
            JSONArray(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ANAHTAR, "[]") ?: "[]")
        } catch (_: Exception) {
            JSONArray()
        }

    private fun yaz(context: Context, dizi: JSONArray) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(ANAHTAR, dizi.toString()).apply()
    }
}
