package com.furkanisikay.namazakisi.widget

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.KildimDurumKarari
import com.furkanisikay.namazakisi.cekirdek.KildimDurumu
import com.furkanisikay.namazakisi.cekirdek.VakitAni
import com.furkanisikay.namazakisi.cekirdek.VakitCizelgesi
import com.furkanisikay.namazakisi.cekirdek.VakitDurumu
import com.furkanisikay.namazakisi.cekirdek.WidgetAyari
import com.furkanisikay.namazakisi.kildim.KildimKuyrugu
import org.json.JSONObject
import java.util.Calendar
import java.util.Locale

/**
 * Widget, hızlı ayarlar kutusu ve kısayolun ORTAK veri okuyucusu (issue #275/#276).
 *
 * Kaynak JS'tir (`src/domain/services/WidgetServisi.ts`): vakitler (dün + 8 gün,
 * her girişte namaz günü `tarih`) ve kılınmışlık. Kuyruktaki "Kıldım"lar iyimser
 * "işaretleniyor" durumunu besler. Okuma hataları widget'ı kırmaz: boş veri →
 * "Uygulamayı açın".
 */
object WidgetVeriDeposu {
    private const val TAG = "WidgetVeriDeposu"
    const val PREFS_NAME = "namazakisi_widget"
    const val KEY_DATA = "widget_data"
    const val KEY_KILINAN = "widget_kilinan"
    private const val AYAR_ONEKI = "ayar_"

    /** Tek anlık görüntü: bütün yüzeyler aynı ana göre karar versin. */
    data class Anlik(
        val simdiMs: Long,
        val vakitler: List<VakitAni>,
        val durum: VakitDurumu,
        val kilinanlar: Map<String, Set<String>>,
        val kildim: KildimDurumu,
    )

    fun anlik(context: Context, simdiMs: Long = System.currentTimeMillis()): Anlik {
        val vakitler = vakitler(context)
        val durum = VakitCizelgesi.durumHesapla(vakitler, simdiMs)
        val kilinanlar = kilinanlar(context)
        val kildim = KildimDurumKarari.hesapla(durum, kilinanlar, KildimKuyrugu.bekleyenKimlikler(context))
        return Anlik(simdiMs, vakitler, durum, kilinanlar, kildim)
    }

    fun vakitler(context: Context): List<VakitAni> = try {
        val ham = prefs(context).getString(KEY_DATA, null)
        if (ham == null) emptyList() else {
            val dizi = JSONObject(ham).getJSONArray("vakitler")
            (0 until dizi.length()).map { i ->
                val o = dizi.getJSONObject(i)
                val ms = o.getLong("ms")
                // Sürüm 1 verisinde `tarih` yoktur (eski uygulama sürümünün yazdığı) →
                // takvim gününe düşülür; yeni sürüm açılınca doğru namaz günü gelir.
                VakitAni(o.getString("vakit"), ms, o.optString("tarih").ifEmpty { takvimGunu(ms) })
            }
        }
    } catch (e: Exception) {
        Log.w(TAG, "Widget vakit verisi okunamadi", e)
        emptyList()
    }

    fun kilinanlar(context: Context): Map<String, Set<String>> = try {
        val ham = prefs(context).getString(KEY_KILINAN, null)
        if (ham == null) emptyMap() else {
            val o = JSONObject(ham)
            o.keys().asSequence().associateWith { tarih ->
                val d = o.optJSONArray(tarih)
                if (d == null) emptySet() else (0 until d.length()).map { d.optString(it) }.toSet()
            }
        }
    } catch (e: Exception) {
        Log.w(TAG, "Widget kilinmislik verisi okunamadi", e)
        emptyMap()
    }

    fun ayar(context: Context, appWidgetId: Int): WidgetAyari =
        WidgetAyari.coz(prefs(context).getString(AYAR_ONEKI + appWidgetId, null))

    fun ayarYaz(context: Context, appWidgetId: Int, ayar: WidgetAyari) {
        prefs(context).edit().putString(AYAR_ONEKI + appWidgetId, ayar.kodla()).apply()
    }

    fun ayarSil(context: Context, appWidgetId: Int) {
        prefs(context).edit().remove(AYAR_ONEKI + appWidgetId).apply()
    }

    private fun takvimGunu(ms: Long): String {
        val c = Calendar.getInstance().apply { timeInMillis = ms }
        // Kimlik: Batı rakamı ŞART (örtük yerel ayar ar-SA cihazda Doğu rakamı yazardı).
        return "%04d-%02d-%02d".format(Locale.ROOT, c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH))
    }

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
}
