package expo.modules.camigeofence

import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Camideyim / Namaz modu DURUMU değişti (saat W3, fikir 5) — uygulamaya "dürtme" yayını.
 *
 * Modül uygulama sınıflarını göremez ve Wear Data Layer'a bağımlı değildir →
 * `CamiOtomasyonYayini` deseniyle PAKET-KAPSAMLI açık yayın (`setPackage`). Ek TAŞIMAZ:
 * alıcı (`wear/SaatDurumAlicisi`) gerçeği kendisi `CamiDepo`/`NamazModu`'dan okur, saat
 * KOPYA tutmaz (tek doğru kaynak native SharedPreferences). Eylem adı iki yerde SABİT.
 */
object SaatDurumYayini {
    const val EYLEM = "com.furkanisikay.namazakisi.SAAT_DURUMU"

    fun yay(ctx: Context) {
        try {
            ctx.sendBroadcast(Intent(EYLEM).setPackage(ctx.packageName))
        } catch (e: Exception) {
            Log.w("SaatDurumYayini", "Saat durumu yayini gonderilemedi", e)
        }
    }
}
