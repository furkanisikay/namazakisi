package expo.modules.camigeofence

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * "Son algılamalar" olay günlüğü — neden algılandı / neden algılanmadı.
 *
 * Native yazar, JS açılışta okur (`gunlukAl`). Halka tampon: en son [AZAMI] olay.
 * Konum YAZILMAZ (yalnız mesafe/doğruluk metresi ve cami adı): günlük tanı
 * raporuna girebilir (AGENTS.md "loglara hassas veri yazma").
 */
object CamiGunluk {
    private const val DOSYA = "namazakisi_cami_gunluk"
    private const val ANAHTAR = "olaylar"
    private const val AZAMI = 60

    @Synchronized
    fun ekle(ctx: Context, tur: String, ek: Map<String, Any?> = emptyMap()) {
        try {
            val prefs = ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)
            val dizi = try { JSONArray(prefs.getString(ANAHTAR, "[]")) } catch (_: Exception) { JSONArray() }
            val o = JSONObject().put("zamanMs", System.currentTimeMillis()).put("tur", tur)
            for ((k, v) in ek) if (v != null) o.put(k, v)
            dizi.put(o)
            val bas = maxOf(0, dizi.length() - AZAMI)
            val kirpik = JSONArray()
            for (i in bas until dizi.length()) kirpik.put(dizi.get(i))
            prefs.edit().putString(ANAHTAR, kirpik.toString()).apply()
        } catch (_: Exception) {
            // Günlük yazılamazsa algılama yine çalışır.
        }
    }

    @Synchronized
    fun tumu(ctx: Context): String =
        ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).getString(ANAHTAR, "[]") ?: "[]"

    @Synchronized
    fun temizle(ctx: Context) {
        ctx.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).edit().remove(ANAHTAR).apply()
    }
}
