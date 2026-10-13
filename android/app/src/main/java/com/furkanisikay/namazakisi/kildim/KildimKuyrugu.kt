package com.furkanisikay.namazakisi.kildim

import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.LifecycleState
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.cekirdek.KuyrukOgesi
import org.json.JSONArray
import org.json.JSONObject

/**
 * Uygulama DIŞINDAN gelen "Kıldım" isteklerinin KALICI kuyruğu (issue #269 → #275/#276).
 *
 * Kaynaklar: Wear OS saati, ana ekran widget'ı, hızlı ayarlar kutusu, "Şu anki
 * vakti kıldım" kısayolu. JS o an çalışmıyor olabilir; öğe burada bekler ve JS
 * ÜÇ yoldan boşaltır (headless görev, ön plana geliş, 15 dk'lık arka plan
 * görevi) — doğruluk hiçbirine tek başına bağlı değildir. JS tarafı:
 * `src/domain/services/KildimKuyruguServisi.ts` → `BildirimServisi.kildimAksiyonunuIsle`
 * (bildirimdeki "Kıldım" ile AYNI gövde).
 *
 * DEPOLAMA ESKİ ANAHTARDA KALIR (`namazakisi_wear` / `kildim_kuyrugu`): kuyruk
 * eskiden yalnız saat içindi; güncellemeden önce kuyruğa düşmüş öğeler kaybolmasın.
 * Eski öğelerde `kaynak` alanı yoktur → `wear` sayılır.
 *
 * Kurallar (kimlik, zehirli öğe) SAF `KildimKuyruguKurallari`'ndadır (JVM testli).
 */
object KildimKuyrugu {
    private const val TAG = "KildimKuyrugu"
    private const val PREFS = "namazakisi_wear"
    private const val ANAHTAR = "kildim_kuyrugu"

    /** Uygulama AÇIKKEN (ReactContext RESUMED) yayılan olay — JS `KILDIM_KUYRUGU_OLAYI`. */
    const val OLAY_ADI = "KildimKuyruguGeldi"

    /** @return öğe geçerliyse (yeni ya da zaten kuyrukta) true. */
    @Synchronized
    fun ekle(context: Context, tarih: String?, vakit: String?, kaynak: String): Boolean {
        val mevcut = oku(context)
        val yeni = KildimKuyruguKurallari.ekle(mevcut, tarih, vakit, kaynak) ?: return false
        if (yeni !== mevcut) yaz(context, yeni)
        return true
    }

    @Synchronized
    fun tumu(context: Context): String = jsonaCevir(oku(context)).toString()

    @Synchronized
    fun bekleyenKimlikler(context: Context): Set<String> = KildimKuyruguKurallari.bekleyenKimlikler(oku(context))

    @Synchronized
    fun tamamlandi(context: Context, id: String) {
        yaz(context, KildimKuyruguKurallari.tamamlandi(oku(context), id))
    }

    /** @return öğe zehirli sayılıp DÜŞÜRÜLDÜYSE true (widget'taki iyimser "bekliyor" geri alınmalı). */
    @Synchronized
    fun basarisiz(context: Context, id: String): Boolean {
        val yeni = KildimKuyruguKurallari.basarisiz(oku(context), id)
        yaz(context, yeni)
        return yeni.none { it.id == id }
    }

    /**
     * JS'i uyandırır: ön plandaysa olay yayar (headless görev ön planda çökerdi),
     * değilse headless görevi başlatmaya ÇALIŞIR. `startService` arka plan kısıtına
     * takılabilir — HATA DEĞİL: öğe kuyrukta kalır, ön plan / 15 dk görevi boşaltır.
     * Foreground service bilinçli olarak KULLANILMAZ (AGENTS.md).
     */
    fun jsUyandir(context: Context) {
        val uygulama = context.applicationContext
        val baglam: ReactContext? = try {
            (uygulama as? ReactApplication)?.reactHost?.currentReactContext
        } catch (_: Throwable) {
            null
        }
        if (baglam != null && baglam.lifecycleState == LifecycleState.RESUMED) {
            try {
                baglam.emitDeviceEvent(OLAY_ADI, null)
                return
            } catch (e: Throwable) {
                Log.w(TAG, "On plan olayi yayilamadi", e)
            }
        }
        try {
            uygulama.startService(Intent(uygulama, KildimGorevServisi::class.java))
        } catch (e: Exception) {
            Log.i(TAG, "Headless gorev baslatilamadi, kuyrukta bekleyecek", e)
        }
    }

    private fun oku(context: Context): List<KuyrukOgesi> = try {
        val ham = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ANAHTAR, "[]") ?: "[]"
        val dizi = JSONArray(ham)
        (0 until dizi.length()).mapNotNull { i ->
            val o = dizi.optJSONObject(i) ?: return@mapNotNull null
            val id = o.optString("id")
            if (id.isEmpty()) return@mapNotNull null
            KuyrukOgesi(
                id = id,
                tarih = o.optString("tarih"),
                vakit = o.optString("vakit"),
                kaynak = o.optString("kaynak", KildimKuyruguKurallari.KAYNAK_WEAR),
                deneme = o.optInt("deneme", 0),
            )
        }
    } catch (_: Exception) {
        emptyList()
    }

    private fun jsonaCevir(liste: List<KuyrukOgesi>): JSONArray = JSONArray().apply {
        liste.forEach {
            put(
                JSONObject()
                    .put("id", it.id)
                    .put("tarih", it.tarih)
                    .put("vakit", it.vakit)
                    .put("kaynak", it.kaynak)
                    .put("deneme", it.deneme)
            )
        }
    }

    private fun yaz(context: Context, liste: List<KuyrukOgesi>) {
        // commit (senkron): widget alıcısı goAsync'siz kısa ömürlüdür; JS öğeyi hemen okuyabilmeli.
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString(ANAHTAR, jsonaCevir(liste).toString()).commit()
    }
}
