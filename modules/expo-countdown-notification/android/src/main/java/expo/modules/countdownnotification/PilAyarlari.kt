package expo.modules.countdownnotification

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log

/**
 * Pil kisiti teshisi ve ayar ekranina yonlendirme (Samsung + genel Android).
 *
 * NEDEN: Samsung One UI, ~3 gun acilmayan uygulamayi "uyuyan", ~16 gun acilmayani
 * "derin uyuyan" listesine alir; job/alarm/bildirim kisitlanir. Bu uygulamanin
 * asil kullanicisi uygulamayi ACMADAN yalniz bildirimle yasayan kisidir — tam da
 * bu esiklere en cok maruz kalan. Gelistiricinin yapabilecegi tek sey kullaniciyi
 * dogru listeye ("Asla uyumayan uygulamalar") goturmektir.
 *
 * IZIN ISTENMEZ: `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` Play'in kabul edilen
 * kullanim listesinde degil; yalniz ayar EKRANI acilir (izin gerektirmez).
 *
 * ZINCIR (her adim ActivityNotFoundException'a karsi korunur — One UI surumune
 * gore Samsung ekrani degisebilir, cagri ASLA cokmemeli):
 *   1. Samsung: com.samsung.android.lool / ACTION_OPEN_CHECKABLE_LISTACTIVITY,
 *      activity_type=2 ("Asla uyumayan") — Samsung'un resmi belgesi
 *      (developer.samsung.com/mobile/app-management.html).
 *   2. ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS (tum uygulamalar listesi).
 *   3. Uygulama ayrintilari (pil satiri buradan da acilir).
 */
object PilAyarlari {
    private const val ETIKET = "PilAyarlari"
    private const val SAMSUNG_PAKET = "com.samsung.android.lool"
    private const val SAMSUNG_EYLEM = "com.samsung.android.sm.ACTION_OPEN_CHECKABLE_LISTACTIVITY"
    private const val SAMSUNG_ASLA_UYUMAYAN = 2

    fun samsungMu(): Boolean = Build.MANUFACTURER.equals("samsung", ignoreCase = true)

    fun muafMi(context: Context): Boolean? = try {
        (context.getSystemService(Context.POWER_SERVICE) as? PowerManager)
            ?.isIgnoringBatteryOptimizations(context.packageName)
    } catch (e: Exception) {
        Log.w(ETIKET, "Pil durumu okunamadi: ${e.message}")
        null
    }

    /** @return acilan ekran: "samsung" | "pil" | "uygulama" | null (hicbiri acilamadi) */
    fun ac(aktivite: Activity): String? {
        if (samsungMu() && dene(aktivite, Intent(SAMSUNG_EYLEM).apply {
                setPackage(SAMSUNG_PAKET)
                putExtra("activity_type", SAMSUNG_ASLA_UYUMAYAN)
            })) return "samsung"
        if (dene(aktivite, Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))) return "pil"
        if (dene(aktivite, Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", aktivite.packageName, null)))) return "uygulama"
        return null
    }

    /**
     * `resolveActivity` KULLANILMAZ: Android 11+ paket gorunurlugu yuzunden
     * <queries> bildirilmemis paketler icin null doner ve Samsung ekrani hic
     * denenmezdi. `startActivity` gorunurluk istemez; yoksa ActivityNotFound atar.
     */
    private fun dene(aktivite: Activity, intent: Intent): Boolean = try {
        aktivite.startActivity(intent)
        true
    } catch (e: ActivityNotFoundException) {
        false
    } catch (e: SecurityException) {
        // Bazi OEM ekranlari dis cagriya kapali olabilir.
        Log.w(ETIKET, "Ayar ekrani acilamadi: ${e.message}")
        false
    }
}
