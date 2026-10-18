package com.furkanisikay.namazakisi.wear

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.SaatKomutKurallari
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.camigeofence.CamiDepo
import expo.modules.camigeofence.NamazModu

/**
 * Camideyim / Namaz modu durumunu saate yazar (saat W3, fikir 1 + 5).
 *
 * ANA YÜKTEN AYRI küçük DataItem (`/namazakisi/camidurum`): ana yük her değişimde
 * "yeni" sayılıp saatin bütün yüzeylerini tazelemesin. Saat yalnız GÖSTERİR; gerçek
 * native depodur (`CamiDepo`, `NamazModu`), saat kopya tutmaz.
 *
 * Tetikler: modülün "dürtme" yayını (`SaatDurumYayini` → [SaatDurumAlicisi]; camide hâli,
 * soru ve mod kaynağı her yazıldığında), JS'in saat gönderimi (`WearSenkronModulu
 * .camiDurumunuTazele`: açılış, konum yayması, 15 dk görevi) ve saat komutları.
 * Aynı içerik ikinci kez YAZILMAZ (süreç önbelleği); Play Hizmetleri yoksa sessizce geçer.
 */
object SaatDurumu {
    private const val TAG = "SaatDurumu"

    @Volatile
    private var sonYazilan: String? = null

    /** @param bitti iş bitince (yazım tamamlandı ya da gerek yok) çağrılır. */
    fun gonder(context: Context, bitti: () -> Unit = {}) {
        val ctx = context.applicationContext
        try {
            if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(ctx) != ConnectionResult.SUCCESS) {
                bitti()
                return
            }
            val camide = CamiDepo.camide(ctx)
            val soru = CamiDepo.soru(ctx)
            val json = SaatKomutKurallari.durumJson(
                camide?.let { SaatKomutKurallari.CamideBilgisi(it.yerId, it.ad, it.bitisMs) },
                soru?.let { SaatKomutKurallari.SoruBilgisi(it.yer.id, it.yer.ad, it.bitisMs) },
                NamazModu.aktifBitisMs(ctx),
            )
            if (json == sonYazilan) {
                bitti()
                return
            }
            val istek = PutDataMapRequest.create(SaatKomutKurallari.CAMI_DURUM_YOLU).apply {
                dataMap.putString("durum", json)
            }.asPutDataRequest().setUrgent()
            Wearable.getDataClient(ctx).putDataItem(istek)
                .addOnSuccessListener { sonYazilan = json }
                .addOnFailureListener { e -> Log.w(TAG, "Saate durum yazilamadi", e) }
                .addOnCompleteListener { bitti() }
        } catch (e: Throwable) {
            Log.w(TAG, "Saat durumu hazirlanamadi", e)
            bitti()
        }
    }
}

/**
 * Modülün paket-kapsamlı "durum değişti" yayını (`expo.modules.camigeofence.SaatDurumYayini`;
 * eylem adı iki yerde SABİT). Ek okunmaz — durum depodan okunur. Dışa kapalı.
 */
class SaatDurumAlicisi : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != EYLEM) return
        val sonuc = goAsync()
        SaatDurumu.gonder(context) {
            try {
                sonuc.finish()
            } catch (_: Exception) {
                // zaten bitti
            }
        }
    }

    companion object {
        const val EYLEM = "com.furkanisikay.namazakisi.SAAT_DURUMU"
    }
}
