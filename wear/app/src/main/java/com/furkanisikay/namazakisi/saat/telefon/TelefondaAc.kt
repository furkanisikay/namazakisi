package com.furkanisikay.namazakisi.saat.telefon

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.wear.remote.interactions.RemoteActivityHelper
import androidx.wear.widget.ConfirmationOverlay
import java.util.concurrent.Executors

/**
 * "Telefonda açın" (saat W3, fikir 4): saate sığmayan ekranı telefondaki uygulamada
 * açar. `RemoteActivityHelper` yalnız `ACTION_VIEW` + `CATEGORY_BROWSABLE` + veri URI'si
 * kabul eder → telefondaki `namazakisi://` derin bağlantıları (MainActivity'nin BROWSABLE
 * filtresi; JS `derinBaglantilar.ts`). Yalnız GEZİNME bağlantısı açılır — `kildim`
 * bağlantısı (eylem) buradan ASLA gönderilmez.
 *
 * Sonuç sistem onay animasyonuyla gösterilir (başarı: "telefonda aç" animasyonu).
 */
object TelefondaAc {
    const val KAZA = "namazakisi://kaza"
    const val KIBLE = "namazakisi://kible"
    const val CAMIDEYIM = "namazakisi://camideyim"
    const val AYARLAR = "namazakisi://ayarlar"

    private val IZINLI = setOf(KAZA, KIBLE, CAMIDEYIM, AYARLAR)
    private val yurutucu = Executors.newSingleThreadExecutor()

    fun ac(activity: Activity, baglanti: String) {
        require(baglanti in IZINLI) { "Yalniz gezinme baglantisi" }
        val niyet = Intent(Intent.ACTION_VIEW, Uri.parse(baglanti)).addCategory(Intent.CATEGORY_BROWSABLE)
        val gelecek = try {
            RemoteActivityHelper(activity, yurutucu).startRemoteActivity(niyet)
        } catch (e: Exception) {
            Log.w("TelefondaAc", "Uzak etkinlik baslatilamadi", e)
            goster(activity, false)
            return
        }
        gelecek.addListener({
            val tamam = try {
                gelecek.get()
                true
            } catch (e: Exception) {
                Log.w("TelefondaAc", "Telefona ulasilamadi", e)
                false
            }
            activity.runOnUiThread { goster(activity, tamam) }
        }, yurutucu)
    }

    private fun goster(activity: Activity, tamam: Boolean) {
        if (activity.isFinishing || activity.isDestroyed) return
        // CharSequence aşırı yüklemesi (String olanı kullanımdan kalktı).
        val mesaj: CharSequence = if (tamam) "Telefonunuzda açıldı" else "Telefonunuza ulaşılamadı"
        ConfirmationOverlay()
            .setType(if (tamam) ConfirmationOverlay.OPEN_ON_PHONE_ANIMATION else ConfirmationOverlay.FAILURE_ANIMATION)
            .setMessage(mesaj)
            .showOn(activity)
    }
}
