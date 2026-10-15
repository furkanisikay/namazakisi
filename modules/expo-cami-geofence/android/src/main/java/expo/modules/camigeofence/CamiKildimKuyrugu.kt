package expo.modules.camigeofence

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * "Kıldınız mı? → Kıldım" isteklerinin KALICI kuyruğu (Wear `WearKildimKuyrugu`
 * deseninin aynısı). Kayıt JS'in işidir (`BildirimServisi` yolu, tek doğru kaynak
 * AsyncStorage); native yalnız isteği saklar. JS üç yoldan boşaltır: headless
 * görev, ön plana geliş + canlı olay, 15 dk'lık arka plan görevi.
 *
 * Kimlik "<tarih>_<vakit>" → aynı vakit iki kez gelirse tek öğe. Zehirli öğe
 * [MAKS_DENEME] başarısızlıktan sonra düşer.
 */
object CamiKildimKuyrugu {
    private const val DOSYA = "namazakisi_cami_kildim"
    private const val ANAHTAR = "kuyruk"
    const val MAKS_DENEME = 5
    private val VAKITLER = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")
    private val TARIH = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun gecerliMi(tarih: String?, vakit: String?): Boolean =
        tarih != null && vakit != null && TARIH.matches(tarih) && vakit in VAKITLER

    @Synchronized
    fun ekle(ctx: Context, tarih: String, vakit: String): Boolean {
        if (!gecerliMi(tarih, vakit)) return false
        val d = oku(ctx)
        val id = "${tarih}_$vakit"
        for (i in 0 until d.length()) if (d.getJSONObject(i).optString("id") == id) return true
        d.put(JSONObject().put("id", id).put("tarih", tarih).put("vakit", vakit).put("deneme", 0))
        yaz(ctx, d)
        return true
    }

    @Synchronized
    fun tumu(ctx: Context): String = oku(ctx).toString()

    @Synchronized
    fun tamamlandi(ctx: Context, id: String) {
        val d = oku(ctx)
        val y = JSONArray()
        for (i in 0 until d.length()) d.getJSONObject(i).let { if (it.optString("id") != id) y.put(it) }
        yaz(ctx, y)
    }

    @Synchronized
    fun basarisiz(ctx: Context, id: String) {
        val d = oku(ctx)
        val y = JSONArray()
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            if (o.optString("id") == id) {
                val deneme = o.optInt("deneme", 0) + 1
                if (deneme >= MAKS_DENEME) continue
                o.put("deneme", deneme)
            }
            y.put(o)
        }
        yaz(ctx, y)
    }

    private fun oku(ctx: Context): JSONArray = try {
        JSONArray(ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).getString(ANAHTAR, "[]") ?: "[]")
    } catch (_: Exception) {
        JSONArray()
    }

    private fun yaz(ctx: Context, d: JSONArray) {
        ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).edit().putString(ANAHTAR, d.toString()).apply()
    }
}
