package com.furkanisikay.namazakisi.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari.Karar

/**
 * Gerçek alarmın (issue #74) TEK alıcısı — dışa KAPALI (`exported=false`), açık bileşenle
 * çağrılır. Olaylar:
 *  - TETIK   : `setAlarmClock` çaldı → karar ([MuhafizAlarmKurallari.tetikKarari]) →
 *              çalan alarm ya da normal bildirim; çalıyorsa süre sonunda SUSTUR kurulur.
 *  - SUSTUR  : çalma süresi doldu → bildirim hâlâ duruyorsa sessiz NORMAL bildirime çevrilir.
 *  - KILDIM / ERTELE / KAPAT : bildirim düğmeleri (tam ekran etkinliği aynı gövdeyi çağırır).
 *  - BOOT_COMPLETED / MY_PACKAGE_REPLACED : kayıtlı alarmlar yeniden kurulur.
 */
class MuhafizAlarmAlici : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        try {
            when (intent.action) {
                MuhafizAlarmZamanlayici.EYLEM_TETIK -> tetik(context, intent)
                EYLEM_SUSTUR -> sustur(context, intent)
                EYLEM_KILDIM, EYLEM_ERTELE, EYLEM_KAPAT -> {
                    val ham = intent.getStringExtra(EK_YUK) ?: return
                    MuhafizAlarmEylemleri.uygula(context, intent.action ?: return, ham)
                }
                Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED -> {
                    val sayi = MuhafizAlarmZamanlayici.yenidenKur(context)
                    Log.i(TAG, "$sayi alarm yeniden kuruldu")
                }
            }
        } catch (e: Exception) {
            // Bir alıcı istisnası süreci çökertmemeli; en kötü durumda alarm çalmaz.
            Log.e(TAG, "Alarm olayi islenemedi: ${intent.action}", e)
        }
    }

    private fun tetik(context: Context, intent: Intent) {
        val kimlik = intent.data?.lastPathSegment ?: return
        val ham = MuhafizAlarmZamanlayici.yukAl(context, kimlik) ?: return
        MuhafizAlarmZamanlayici.kayittanCikar(context, kimlik)
        val yuk = MuhafizAlarmKurallari.yukCoz(ham) ?: return
        val simdi = System.currentTimeMillis()
        when (MuhafizAlarmKurallari.tetikKarari(yuk.tetikMs, simdi, yuk.cikisMs, camiSessizBitisMs(context))) {
            Karar.CAL -> {
                MuhafizAlarmBildirimi.calanGoster(context, yuk, ham, simdi)
                susturmayiKur(context, yuk.kimlik, ham, simdi + MuhafizAlarmKurallari.CALMA_SURESI_MS)
            }
            Karar.BILDIRIM -> MuhafizAlarmBildirimi.normalGoster(context, yuk, ham, sessiz = false)
            Karar.SESSIZ_BILDIRIM -> MuhafizAlarmBildirimi.normalGoster(context, yuk, ham, sessiz = true)
            Karar.ATLA -> Unit
        }
    }

    private fun sustur(context: Context, intent: Intent) {
        val ham = intent.getStringExtra(EK_YUK) ?: return
        val yuk = MuhafizAlarmKurallari.yukCoz(ham) ?: return
        // Kullanıcı bu arada Kıldım/Ertele/Kapat dediyse bildirim yoktur → dokunma.
        if (!MuhafizAlarmBildirimi.gosteriliyorMu(context, yuk.kimlik)) return
        // İptal ŞART: insistent ses ancak bildirim kalkınca kesin durur; ardından aynı
        // içerik sessiz NORMAL bildirim olarak kalır ("Kıldım" düğmesiyle birlikte).
        MuhafizAlarmBildirimi.kaldir(context, yuk.kimlik)
        MuhafizAlarmBildirimi.normalGoster(context, yuk, ham, sessiz = true)
    }

    companion object {
        private const val TAG = "MuhafizAlarm"

        const val EYLEM_SUSTUR = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_SUSTUR"
        const val EYLEM_KILDIM = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_KILDIM"
        const val EYLEM_ERTELE = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_ERTELE"
        const val EYLEM_KAPAT = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_KAPAT"
        const val EK_YUK = "yuk"

        /** Ad/anahtar `expo-cami-geofence` CamiDepo ile AYNI (modüller birbirini import etmez). */
        fun camiSessizBitisMs(context: Context): Long = try {
            context.getSharedPreferences("namazakisi_cami_durum", Context.MODE_PRIVATE).getLong("sessiz_bitis_ms", 0L)
        } catch (_: Exception) {
            0L
        }

        private fun susturmaIntenti(context: Context, kimlik: String, ham: String?): PendingIntent {
            val intent = Intent(context, MuhafizAlarmAlici::class.java)
                .setAction(EYLEM_SUSTUR)
                .setData(Uri.Builder().scheme("namazakisi-alarm").authority("sustur").appendPath(kimlik).build())
            if (ham != null) intent.putExtra(EK_YUK, ham)
            return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        /** Çalma süresinin sonuna tek seferlik susturma. Cihaz zaten uyanık; izin yoksa yaklaşık. */
        fun susturmayiKur(context: Context, kimlik: String, ham: String, anMs: Long) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val pi = susturmaIntenti(context, kimlik, ham)
            try {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
                } else {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
                }
            } catch (e: Exception) {
                // Emniyet ağı: bildirimin `setTimeoutAfter`'ı sesi yine bitirir.
                Log.w(TAG, "Susturma alarmi kurulamadi", e)
            }
        }

        fun susturmayiIptalEt(context: Context, kimlik: String) {
            try {
                (context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.cancel(susturmaIntenti(context, kimlik, null))
            } catch (_: Exception) {
                // Kurulu değilse sorun değil.
            }
        }
    }
}
