package expo.modules.countdownnotification

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import org.json.JSONObject

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
 *
 * YENIDEN BASLATMA: Android cihaz kapaninca TUM alarmlari siler. Tetik zamani ve
 * cozulmus metin de (id -> {t, m}) saklanir; [AnonsYenidenKurucu] BOOT_COMPLETED /
 * MY_PACKAGE_REPLACED'te [yenidenKur] ile gecmisi atip kalani yeniden kurar.
 * Aksi halde telefon yeniden baslayinca sesli anonslar, uygulama acilana ya da
 * 15 dk'lik arka plan gorevi kosana kadar (Samsung'un uyku kisitinda gunlerce)
 * susardi.
 */
object AnonsZamanlayici {
    private const val ETIKET = "AnonsZamanlayici"
    private const val KAYIT_DOSYASI = "muhafiz_anons_kayit"
    private const val KAYIT_ANAHTARI = "planli_idler"
    private const val DETAY_ANAHTARI = "planli_anons_detay"

    /**
     * Kayit defterinin (id kumesi + detay) TEK kilidi. Okuma-degistir-yaz adimlari
     * farkli thread'lerden gelir: JS `planlaAnons` (expo modul kuyrugu) ile RN
     * `MuhafizAlarm.sahipliIptalEt` (native-modules thread'i) paralel calisir;
     * kilitsiz kayip guncelleme kurulu alarmi kayittan dusurur → iptal/Kıldım onu
     * bulamaz, "hayalet" anons konusur. JVM monitorleri yeniden girilebilir:
     * `eslesenleriIptalEt → iptal → kayittanCikar` ic ice kilit almasi guvenlidir.
     */
    private val kilit = Any()

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

    private fun detayOku(context: Context): JSONObject {
        val ham = context.getSharedPreferences(KAYIT_DOSYASI, Context.MODE_PRIVATE).getString(DETAY_ANAHTARI, null)
        return try { if (ham.isNullOrEmpty()) JSONObject() else JSONObject(ham) } catch (_: Exception) { JSONObject() }
    }

    private fun detayYaz(context: Context, detay: JSONObject) {
        context.getSharedPreferences(KAYIT_DOSYASI, Context.MODE_PRIVATE)
            .edit()
            .putString(DETAY_ANAHTARI, detay.toString())
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
        synchronized(kilit) {
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
                val detay = detayOku(context)
                detay.put(id, JSONObject().put("t", tetikZamanMs).put("m", metin))
                detayYaz(context, detay)
            } catch (e: Exception) {
                Log.e(ETIKET, "Anons alarmi kurulamadi: ${e.message}")
            }
        }
    }

    /**
     * Cihaz yeniden baslayinca / uygulama guncellenince kayitli anonslari yeniden
     * kurar. Gecmis zamanlilar atilir (gec konusan anons yanlis bilgi verir).
     * @return yeniden kurulan anons sayisi
     */
    fun yenidenKur(context: Context): Int = synchronized(kilit) {
        val detay = detayOku(context)
        val simdi = System.currentTimeMillis()
        val gelecek = mutableListOf<Triple<String, Long, String>>()
        detay.keys().forEach { id ->
            try {
                val o = detay.getJSONObject(id)
                val t = o.getLong("t")
                val m = o.getString("m")
                if (t > simdi && m.isNotBlank()) gelecek.add(Triple(id, t, m))
            } catch (_: Exception) { /* bozuk kayit atlanir */ }
        }
        // Temiz sayfa: gecmisler ve bozuklar dusulur, planla() kalanlari yeniden yazar.
        detayYaz(context, JSONObject())
        kayitYaz(context, emptySet())
        gelecek.forEach { (id, t, m) -> planla(context, id, t, m) }
        return gelecek.size
    }

    fun iptal(context: Context, id: String) {
        synchronized(kilit) {
            if (id.isEmpty()) return
            try {
                val alarmYoneticisi = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
                alarmYoneticisi?.cancel(anonsIntenti(context, id, ""))
            } catch (e: Exception) {
                Log.e(ETIKET, "Anons alarmi iptal edilemedi: ${e.message}")
            }
            kayittanCikar(context, id)
        }
    }

    /**
     * Kayıtlı anonslardan [esles] koşuluna uyanların hepsini iptal eder (issue #299:
     * bildirimdeki "Kıldım" o vaktin TÜM anonslarını JS'i beklemeden susturur).
     * Anons bildirimle AYNI kimliği taşır, ama sesli-yalnız adımın bildirimi hiç
     * planlanmamış olabilir → bildirim mağazasından değil, BU kayıttan seçilir.
     * @return iptal edilen kimlikler
     */
    fun eslesenleriIptalEt(context: Context, esles: (String) -> Boolean): List<String> = synchronized(kilit) {
        val secilen = kayitliIdler(context).filter(esles)
        secilen.forEach { iptal(context, it) }
        return secilen
    }

    fun tumunuIptal(context: Context) {
        synchronized(kilit) {
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
            detayYaz(context, JSONObject())
        }
    }

    /**
     * Gelecekte tetiklenecek (BEKLEYEN) anons alarmi sayisi — bildirim sinirı
     * rehberinin olcumu (issue #298). Gecmis/bozuk kayit sayilmaz: alarm ya
     * zaten tetiklendi ya da hic kurulmadi; sistemin havuzunda degiller.
     */
    fun bekleyenSayisi(context: Context): Int = synchronized(kilit) {
        val detay = detayOku(context)
        val simdi = System.currentTimeMillis()
        var sayi = 0
        detay.keys().forEach { id ->
            try {
                if (detay.getJSONObject(id).getLong("t") > simdi) sayi++
            } catch (_: Exception) { /* bozuk kayit sayilmaz */ }
        }
        return sayi
    }

    /** Alarm tetiklendikten sonra kaydi temizler (alarm zaten tuketildi). */
    fun kayittanCikar(context: Context, id: String) {
        synchronized(kilit) {
            val idler = kayitliIdler(context)
            if (idler.remove(id)) kayitYaz(context, idler)
            val detay = detayOku(context)
            if (detay.has(id)) {
                detay.remove(id)
                detayYaz(context, detay)
            }
        }
    }
}
