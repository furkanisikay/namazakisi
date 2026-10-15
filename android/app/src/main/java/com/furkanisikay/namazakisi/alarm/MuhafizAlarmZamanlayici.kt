package com.furkanisikay.namazakisi.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari
import org.json.JSONObject

/**
 * Muhafızın GERÇEK ALARMLARINI (issue #74) kurar, iptal eder ve kayıt defterinde tutar.
 *
 * NEDEN `setAlarmClock`: sistem bunu "kullanıcının alarmı" sayar — durum çubuğunda alarm
 * simgesi gösterir, Doze'u ve uygulama bekleme kovalarını deler (exact alarm izni ister;
 * `USE_EXACT_ALARM` / `SCHEDULE_EXACT_ALARM` zaten manifestte). İzin yoksa (12/12L'de
 * kullanıcı kapattıysa) `SecurityException` → `planla` false döner ve JS aynı tetiği
 * NORMAL bildirim olarak kurar (sessiz kayıp yok).
 *
 * FOREGROUND SERVICE YOK (AGENTS.md kararı): ses alarm bildiriminin KANAL sesidir
 * (`USAGE_ALARM`) ve `FLAG_INSISTENT` ile döngüde çalar; bkz. [MuhafizAlarmBildirimi].
 *
 * Kayıt (kimlik → {t: tetik, y: yük}) SharedPreferences'tadır: süreç ölse de "Kıldım" o
 * vaktin alarmlarını bulur (anonslar gibi alarmın da expo mağazasında izi yoktur) ve
 * yeniden başlatmada (Android tüm alarmları siler) [yenidenKur] geleceği geri kurar.
 */
object MuhafizAlarmZamanlayici {
    private const val TAG = "MuhafizAlarm"
    private const val DOSYA = "namazakisi_muhafiz_alarm"
    private const val ANAHTAR = "kayit"

    const val EYLEM_TETIK = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_TETIK"
    private const val SEMA = "namazakisi-alarm"

    private val kilit = Any()

    private fun kayitOku(context: Context): JSONObject {
        val ham = context.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).getString(ANAHTAR, null)
        return try {
            if (ham.isNullOrEmpty()) JSONObject() else JSONObject(ham)
        } catch (_: Exception) {
            JSONObject()
        }
    }

    private fun kayitYaz(context: Context, kayit: JSONObject) {
        context.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).edit().putString(ANAHTAR, kayit.toString()).apply()
    }

    /** Kimliğe özgü tetik intent'i — veri URI'si `filterEquals`'ı tekilleştirir (iptal ekstrasız eşleşir). */
    fun tetikIntenti(context: Context, kimlik: String): PendingIntent {
        val intent = Intent(context, MuhafizAlarmAlici::class.java)
            .setAction(EYLEM_TETIK)
            .setData(Uri.Builder().scheme(SEMA).authority("tetik").appendPath(kimlik).build())
        return PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    /** Durum çubuğundaki alarm simgesine dokununca açılacak ekran (uygulama). */
    private fun gosterIntenti(context: Context): PendingIntent? {
        val acilis = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
        return PendingIntent.getActivity(context, 0, acilis, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    /** Tam alarm kurulabilir mi? (12+ izin; daha eskide daima evet.) */
    fun kurulabilirMi(context: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true
        val am = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return false
        return try {
            am.canScheduleExactAlarms()
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Alarmı kurar ve kaydeder. AYNI kimlik yeniden kurulursa öncekinin YERİNE geçer.
     * @return kurulduysa true; geçmiş zaman, geçersiz yük ya da izin yoksa false.
     */
    fun planla(context: Context, kimlik: String, tetikMs: Long, yuk: String): Boolean {
        if (tetikMs <= System.currentTimeMillis()) return false
        if (MuhafizAlarmKurallari.yukCoz(yuk)?.kimlik != kimlik) return false
        val am = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return false
        if (!kurulabilirMi(context)) return false
        return try {
            am.setAlarmClock(AlarmManager.AlarmClockInfo(tetikMs, gosterIntenti(context)), tetikIntenti(context, kimlik))
            synchronized(kilit) {
                val kayit = kayitOku(context)
                kayit.put(kimlik, JSONObject().put("t", tetikMs).put("y", yuk))
                kayitYaz(context, kayit)
            }
            true
        } catch (e: Exception) {
            Log.w(TAG, "Alarm kurulamadi: $kimlik", e)
            false
        }
    }

    /** Kaydedilmiş yük (tetikte okunur); yoksa null. */
    fun yukAl(context: Context, kimlik: String): String? = synchronized(kilit) {
        kayitOku(context).optJSONObject(kimlik)?.optString("y", "")?.ifEmpty { null }
    }

    /** Tetiklenen alarmın kaydını siler (alarm tüketildi). */
    fun kayittanCikar(context: Context, kimlik: String) {
        synchronized(kilit) {
            val kayit = kayitOku(context)
            if (kayit.has(kimlik)) {
                kayit.remove(kimlik)
                kayitYaz(context, kayit)
            }
        }
    }

    fun iptal(context: Context, kimlik: String) {
        try {
            (context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.cancel(tetikIntenti(context, kimlik))
        } catch (e: Exception) {
            Log.w(TAG, "Alarm iptal edilemedi: $kimlik", e)
        }
        kayittanCikar(context, kimlik)
    }

    /** Koşula uyan kayıtlı alarmların hepsini iptal eder ("Kıldım", ertele, yeniden planlama). */
    fun eslesenleriIptalEt(context: Context, esles: (String) -> Boolean): List<String> {
        val secilen = synchronized(kilit) { kayitOku(context).keys().asSequence().filter(esles).toList() }
        secilen.forEach { iptal(context, it) }
        return secilen
    }

    fun onekliIptalEt(context: Context, onek: String): Int =
        if (onek.isEmpty()) 0 else eslesenleriIptalEt(context) { it.startsWith(onek) }.size

    /** Gelecekte çalacak alarm sayısı (bildirim sınırı rehberinin tanı ölçümü). */
    fun bekleyenSayisi(context: Context): Int {
        val simdi = System.currentTimeMillis()
        val kayit = synchronized(kilit) { kayitOku(context) }
        return kayit.keys().asSequence().count { (kayit.optJSONObject(it)?.optLong("t", 0L) ?: 0L) > simdi }
    }

    /**
     * Yeniden başlatma / güncelleme: Android alarmları siler. Geçmişler atılır (geç çalan
     * alarm yanlış bilgi verir), kalanlar yeniden kurulur. JS açılışta / 15 dk görevinde
     * zaten yeniden planlar; bu yol uygulama hiç açılmazsa da alarmların susmamasını sağlar.
     */
    fun yenidenKur(context: Context): Int {
        val kayit = synchronized(kilit) { kayitOku(context) }
        val tetikler = mutableMapOf<String, Long>()
        kayit.keys().forEach { k -> kayit.optJSONObject(k)?.optLong("t", 0L)?.let { tetikler[k] = it } }
        val kurulacak = MuhafizAlarmKurallari.yenidenKurulacaklar(tetikler, System.currentTimeMillis())
        synchronized(kilit) { kayitYaz(context, JSONObject()) }
        var sayi = 0
        kurulacak.forEach { k ->
            val yuk = kayit.optJSONObject(k)?.optString("y", "") ?: ""
            if (planla(context, k, tetikler[k] ?: 0L, yuk)) sayi++
        }
        return sayi
    }
}
