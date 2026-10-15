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
 * dogru ayara goturmektir.
 *
 * IZIN ISTENMEZ: `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` Play'in kabul edilen
 * kullanim listesinde degil; yalniz ayar EKRANI acilir (izin gerektirmez).
 *
 * HEDEF "Kisitlanmamis" (Unrestricted) pil ayaridir, Samsung'un "Asla uyumayan
 * uygulamalar" listesi DEGIL: o liste Android'in pil muafiyetinden AYRI bir
 * Samsung durumudur ve okunamaz (listeye eklenen uygulama "Optimize edilmis"
 * gorunmeye devam eder → uyari karti hic kaybolmazdi). "Kisitlanmamis" ise
 * `isIgnoringBatteryOptimizations` ile dogrulanir ve One UI'da bu uygulamalar
 * uyutma listelerine hic dusmez. Ayar Android 12+ uygulama bilgisindeki "Pil"
 * sayfasinda — Samsung dahil her cihazda ayni yol.
 *
 * ZINCIR (her adim ActivityNotFoundException'a karsi korunur, cagri ASLA cokmez):
 *   1. Uygulama ayrintilari (Pil satiri buradan acilir).
 *   2. ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS (tum uygulamalar listesi).
 */
object PilAyarlari {
    private const val ETIKET = "PilAyarlari"

    fun samsungMu(): Boolean = Build.MANUFACTURER.equals("samsung", ignoreCase = true)

    fun muafMi(context: Context): Boolean? = try {
        (context.getSystemService(Context.POWER_SERVICE) as? PowerManager)
            ?.isIgnoringBatteryOptimizations(context.packageName)
    } catch (e: Exception) {
        Log.w(ETIKET, "Pil durumu okunamadi: ${e.message}")
        null
    }

    /** @return acilan ekran: "uygulama" | "pil" | null (hicbiri acilamadi) */
    fun ac(aktivite: Activity): String? {
        if (dene(aktivite, Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", aktivite.packageName, null)))) return "uygulama"
        if (dene(aktivite, Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))) return "pil"
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
