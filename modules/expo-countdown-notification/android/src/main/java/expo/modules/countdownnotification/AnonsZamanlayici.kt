package expo.modules.countdownnotification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

/**
 * Sesli anons (TTS) alarmlarini planlar ve iptal eder.
 *
 * MIMARI KARARI: Foreground Service KULLANILMAZ.
 * Exact alarm -> [AnonsReceiver] -> `goAsync()` penceresinde TTS konusur.
 * Kisa anons (1-3 sn) bu ~10 sn'lik pencereye rahat sigar; boylece Android 14+
 * `foregroundServiceType` zorunlulugu (mediaPlayback / specialUse) ve buna bagli
 * Play Store inceleme/red riski hic dogmaz. Yeni FGS izni de gerekmez.
 *
 * Planlanan id'ler SharedPreferences'ta tutulur; boylece surec olduruldukten sonra
 * bile "tumunu iptal et" (yeniden planlama oncesi temizlik) calisir.
 */
object AnonsZamanlayici {
    private const val ETIKET = "AnonsZamanlayici"
    private const val KAYIT_DOSYASI = "muhafiz_anons_kayit"
    private const val KAYIT_ANAHTARI = "planli_idler"

    /** CountdownReceiver'in istek kodu araligiyla (id.hashCode + 0) carpismasin diye kaydirilir. */
    private fun istekKodu(id: String): Int = (id.hashCode() and 0x7FFFFFFF) % 1_000_000 + 900_000

    private fun kayitliIdler(context: Context): MutableSet<String> {
        val prefs = context.getSharedPreferences(KAYIT_DOSYASI, Context.MODE_PRIVATE)
        return HashSet(prefs.getStringSet(KAYIT_ANAHTARI, emptySet()) ?: emptySet())
    }

    private fun kayitYaz(context: Context, idler: Set<String>) {
        context.getSharedPreferences(KAYIT_DOSYASI, Context.MODE_PRIVATE)
            .edit()
            .putStringSet(KAYIT_ANAHTARI, HashSet(idler))
            .apply()
    }

    /**
     * Alarm PendingIntent'i. `AlarmManager.cancel` Intent'leri `filterEquals` ile
     * karsilastirir (extras HARIC) -> iptal ederken metni tekrar vermek gerekmez.
     */
    private fun anonsIntenti(context: Context, id: String, metin: String): PendingIntent {
        val intent = Intent(context, AnonsReceiver::class.java).apply {
            action = AnonsReceiver.ACTION_ANONS
            putExtra(AnonsReceiver.EXTRA_ID, id)
            putExtra(AnonsReceiver.EXTRA_METIN, metin)
        }
        return PendingIntent.getBroadcast(
            context,
            istekKodu(id),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun planla(context: Context, id: String, tetikZamanMs: Long, metin: String) {
        if (id.isEmpty() || metin.isBlank()) return
        if (tetikZamanMs <= System.currentTimeMillis()) return

        val alarmYoneticisi = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val pendingIntent = anonsIntenti(context, id, metin)

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmYoneticisi.canScheduleExactAlarms()) {
                    alarmYoneticisi.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, tetikZamanMs, pendingIntent)
                } else {
                    // Tam alarm izni yoksa yaklasik alarm: anons birkac dakika kayabilir
                    // ama tamamen kaybolmaz (bildirim zaten ayrica cikiyor).
                    alarmYoneticisi.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, tetikZamanMs, pendingIntent)
                }
            } else {
                alarmYoneticisi.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, tetikZamanMs, pendingIntent)
            }

            val idler = kayitliIdler(context)
            idler.add(id)
            kayitYaz(context, idler)
        } catch (e: Exception) {
            Log.e(ETIKET, "Anons alarmi kurulamadi: ${e.message}")
        }
    }

    fun iptal(context: Context, id: String) {
        if (id.isEmpty()) return
        try {
            val alarmYoneticisi = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            alarmYoneticisi?.cancel(anonsIntenti(context, id, ""))
        } catch (e: Exception) {
            Log.e(ETIKET, "Anons alarmi iptal edilemedi: ${e.message}")
        }
        kayittanCikar(context, id)
    }

    fun tumunuIptal(context: Context) {
        val idler = kayitliIdler(context)
        try {
            val alarmYoneticisi = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            idler.forEach { id ->
                try {
                    alarmYoneticisi?.cancel(anonsIntenti(context, id, ""))
                } catch (_: Exception) { /* tek tek hata yutulur, digerleri iptal edilsin */ }
            }
        } catch (e: Exception) {
            Log.e(ETIKET, "Anons alarmlari iptal edilemedi: ${e.message}")
        }
        kayitYaz(context, emptySet())
    }

    /** Alarm tetiklendikten sonra kaydi temizler (alarm zaten tuketildi). */
    fun kayittanCikar(context: Context, id: String) {
        val idler = kayitliIdler(context)
        if (idler.remove(id)) kayitYaz(context, idler)
    }
}
