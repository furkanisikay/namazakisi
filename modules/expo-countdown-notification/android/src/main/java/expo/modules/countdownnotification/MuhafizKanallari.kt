package expo.modules.countdownnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.util.Log

/**
 * Muhafiz bildirim kanallarini TEMBEL olusturur ve artik kullanilmayanlari toplar.
 *
 * NEDEN NATIVE (expo-notifications DEGIL): expo tarafinin kanal `sound` alani
 * `res/raw` icindeki bir dosya ADI bekler; kullanicinin sectigi `content://` URI'si
 * oradan gecmez. Kanal sesini dogru kurmanin garantili yolu `NotificationChannel`
 * uzerinde dogrudan `setSound(uri, attrs)` cagirmaktir.
 *
 * ANDROID TUZAKLARI (mimarinin sebebi):
 *  - Kanal sesi de TITRESIMI de olusturulduktan SONRA degistirilemez.
 *  - `deleteNotificationChannel` + ayni id ile yeniden olusturma tombstone'a takilir:
 *    Android eski ayarlari diriltir.
 *  → Bu yuzden kanal id'si JS tarafinda (ses + titresim) hash'inden uretilir; girdi
 *    degisince id de degisir, ayni id'nin ayarini degistirme ihtiyaci HIC DOGMAZ.
 *
 * TABAN kanallar (`muhafiz`, `muhafiz_acil`) BURADA olusturulmaz — onlari mevcut
 * JS akisi (BildirimServisi.izinIste) zaten kuruyor ve mevcut kurulumlarda kullanicinin
 * kendi tercihleri (titresim/onem/DND) o kanallarda birikmis durumda. Burasi yalniz
 * hash'li kanallarla ilgilenir (ozel ses VE/VEYA belirgin titresim).
 */
object MuhafizKanallari {
    private const val ETIKET = "MuhafizKanallari"

    /** Taban kanallar: bu modul tarafindan ne olusturulur ne de silinir. */
    private val TABAN_KANALLAR = setOf("muhafiz", "muhafiz_acil")

    /** Paketlenmis varsayilan bildirim sesi (res/raw) — taban kanallarla ayni dosya. */
    private const val VARSAYILAN_SES_ADI = "bildirim"

    // TITRESIM DESENLERI. Ilk ikisi TABAN kanallarin desenleriyle BIREBIR AYNI
    // (BildirimServisi.izinIste): hash'li bir kanal, kullanici titresim istemedigi
    // surece taban kanaldan yalnizca SESIYLE ayrilmali.
    private val DESEN_NORMAL = longArrayOf(0, 500, 200, 500)
    private val DESEN_ACIL = longArrayOf(0, 1000, 500, 1000, 500, 1000)

    // Kullanici TITRESIM kanalini acikca actiginda kullanilan BELIRGIN desenler:
    // ust uste kisa darbeler + kapanista uzun bir darbe — cepteyken fark edilir.
    private val DESEN_BELIRGIN_NORMAL = longArrayOf(0, 400, 150, 400, 150, 400, 150, 700)
    private val DESEN_BELIRGIN_ACIL = longArrayOf(0, 600, 200, 600, 200, 600, 200, 1200)

    private fun yonetici(context: Context): NotificationManager? =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    /**
     * Paketlenmis varsayilan bildirim sesi (res/raw/bildirim.mp3).
     *
     * NEDEN GEREKLI (Faz 6): titresim ekseni "varsayilan ses + hash'li kanal"
     * bilesimini mumkun kildi. Ses hic kurulmasaydi kanal SISTEM varsayilan
     * bildirim sesini calardi; taban kanallar ise `bildirim.mp3` caliyor →
     * kullanici yalnizca titresimi actigi icin sesin degistigini duyardi.
     * Kaynak bulunamazsa (null) kanal sistem varsayilanina duser — sessiz kalmaz.
     */
    private fun paketSesi(context: Context): Uri? = try {
        val kaynakId = context.resources.getIdentifier(
            VARSAYILAN_SES_ADI, "raw", context.packageName
        )
        if (kaynakId != 0) Uri.parse("android.resource://${context.packageName}/$kaynakId") else null
    } catch (e: Exception) {
        Log.w(ETIKET, "Paket sesi cozulemedi: ${e.message}")
        null
    }

    private fun muhafizKanaliMi(id: String): Boolean =
        id == "muhafiz" || id == "muhafiz_acil" ||
            id.startsWith("muhafiz_") || id.startsWith("muhafiz_acil_")

    /**
     * Kanali YOKSA olusturur (varsa dokunmaz — kullanicinin o kanalda yaptigi
     * degisiklikler korunur; zaten sesi degistirmek de mumkun degildir).
     */
    fun garantile(
        context: Context,
        kanalId: String,
        kanalAdi: String,
        aciklama: String,
        sesUri: String?,
        acilMi: Boolean,
        titresim: Boolean = false
    ) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (kanalId.isBlank()) return

        val yonetici = yonetici(context) ?: return

        try {
            // `getNotificationChannel` de try ICINDE: kisitli guvenlik profilleri /
            // ozellestirilmis ROM'larda istisna firlatabiliyor; disarida kalirsa
            // JS tarafindaki per-kanal korumaya ulasmadan yukari kacar.
            if (yonetici.getNotificationChannel(kanalId) != null) return

            // ONEM TABAN KANALLARLA AYNI OLMALI (BildirimServisi.izinIste):
            // `muhafiz_acil` = MAX(5), `muhafiz` = HIGH(4). Bir kademe dusuk verilirse
            // (HIGH/DEFAULT) kullanici ozel ses sectigi anda hatirlatma SESSIZCE
            // zayiflar — normal seviye DEFAULT'a dusunce heads-up bandi hic cikmaz.
            val onem =
                if (acilMi) NotificationManager.IMPORTANCE_MAX else NotificationManager.IMPORTANCE_HIGH
            val kanal = NotificationChannel(kanalId, kanalAdi, onem).apply {
                description = aciklama
                enableVibration(true)
                // TITRESIM DE KANAL OZELLIGIDIR ve kanal kurulduktan sonra
                // DEGISTIRILEMEZ → desen kanal id'sinin girdisidir (JS tarafinda
                // `sesKimligi.muhafizKanalIdOlustur`). Titresim kapaliyken desen
                // taban kanallarinkiyle BIREBIR ayni kalir.
                vibrationPattern = when {
                    titresim && acilMi -> DESEN_BELIRGIN_ACIL
                    titresim -> DESEN_BELIRGIN_NORMAL
                    acilMi -> DESEN_ACIL
                    else -> DESEN_NORMAL
                }
                if (acilMi) setBypassDnd(true)

                // USAGE_NOTIFICATION: bu bir bildirim sesidir (alarm degil) —
                // kullanicinin bildirim ses seviyesi ve sessiz mod tercihine uyar.
                val cozulmusSes =
                    if (!sesUri.isNullOrBlank()) Uri.parse(sesUri) else paketSesi(context)
                if (cozulmusSes != null) {
                    val nitelikler = AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build()
                    setSound(cozulmusSes, nitelikler)
                }
            }
            yonetici.createNotificationChannel(kanal)
        } catch (e: Exception) {
            Log.e(ETIKET, "Kanal olusturulamadi ($kanalId): ${e.message}")
        }
    }

    /**
     * Artik referans verilmeyen HASH'LI muhafiz kanallarini siler.
     *
     * Taban kanallara ve muhafiz disi kanallara DOKUNMAZ. Kullanici bir sesi
     * degistirdiginde eski kanal oksuz kalir; toplanmazsa Android bildirim
     * ayarlarinda olu kanallar birikir.
     */
    fun copleriTopla(context: Context, korunacakIdler: List<String>) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val yonetici = yonetici(context) ?: return

        try {
            val korunacak = korunacakIdler.toSet()
            // `notificationChannels` platform tipi: bildirimler tumden kapaliysa /
            // bazi ROM'larda null donebilir -> `.map` NPE atar. Dis catch onu yutar
            // ama GC sessizce atlanir; acik kontrol niyeti gorunur kilar.
            val kanallar = yonetici.notificationChannels ?: return
            kanallar
                .map { it.id }
                .filter { muhafizKanaliMi(it) && it !in TABAN_KANALLAR && it !in korunacak }
                .forEach { id ->
                    try {
                        yonetici.deleteNotificationChannel(id)
                    } catch (e: Exception) {
                        Log.w(ETIKET, "Kanal silinemedi ($id): ${e.message}")
                    }
                }
        } catch (e: Exception) {
            Log.e(ETIKET, "Kanal cop toplama basarisiz: ${e.message}")
        }
    }
}
