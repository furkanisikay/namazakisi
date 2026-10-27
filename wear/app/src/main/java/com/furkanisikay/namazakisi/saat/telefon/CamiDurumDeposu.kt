package com.furkanisikay.namazakisi.saat.telefon

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.wear.ongoing.OngoingActivity
import androidx.wear.ongoing.Status
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.TelefonKomutu
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.hatirlatma.MuhafizBildirimci
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import com.furkanisikay.namazakisi.saat.ui.yerelRakamla

/**
 * Telefondan gelen Camideyim / Namaz modu GÖSTERİM durumu (saat W3, fikir 1 + 5).
 *
 * KOPYA DEĞİLDİR: yalnız telefonun son yazdığı gösterim önbelleğidir (`/namazakisi/camidurum`
 * DataItem'ı). Karar ve kayıt telefonda (`CamiDepo`, `NamazModu`); saat komut yollar.
 * Bitişler geçince gösterilmez (`CamiDurumu.gecerli`), telefonun kapanış haberi gecikse de.
 */
class CamiDurumDeposu(context: Context) {
    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun durum(simdi: Long = System.currentTimeMillis()): TelefonKomutu.CamiDurumu? =
        TelefonKomutu.durumCoz(prefs.getString(DURUM, null))?.gecerli(simdi)

    /** @return içerik değişti mi */
    fun kaydet(json: String): Boolean {
        if (TelefonKomutu.durumCoz(json) == null) return false
        if (prefs.getString(DURUM, null) == json) return false
        prefs.edit().putString(DURUM, json).apply()
        return true
    }

    fun dinle(d: SharedPreferences.OnSharedPreferenceChangeListener) = prefs.registerOnSharedPreferenceChangeListener(d)
    fun birak(d: SharedPreferences.OnSharedPreferenceChangeListener) = prefs.unregisterOnSharedPreferenceChangeListener(d)

    companion object {
        private const val PREFS = "saat_cami"
        private const val DURUM = "durum"
    }
}

/**
 * "Camidesiniz" kadran simgesi (Ongoing Activity, saat W3 fikir 5). Telefonun kararıyla
 * açılır, `setTimeoutAfter(bitiş)` ile KENDİLİĞİNDEN kalkar (sürekli kart değildir —
 * Google politikası). Dokunuş ana ekrandaki Camideyim çipini açar. Sessiz kanal.
 */
object CamideBildirimi {
    private const val KANAL = "camideyim"
    private const val ETIKET = "camideyim"
    private const val BILDIRIM_NO = 4805

    fun guncelle(context: Context, durum: TelefonKomutu.CamiDurumu?) {
        val camide = durum?.camide
        val simdi = System.currentTimeMillis()
        if (camide == null || camide.bitisMs <= simdi || !MuhafizBildirimci.bildirimIzniVar(context)) {
            NotificationManagerCompat.from(context).cancel(ETIKET, BILDIRIM_NO)
            return
        }
        kanaliGarantile(context)
        val ac = PendingIntent.getActivity(
            context, BILDIRIM_NO,
            Intent(context, AnaAktivite::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val metin = context.yerelRakamla(
            durum.modBitisMs?.let { context.getString(R.string.cami_namaz_modu_bitis, VakitHesabi.saat(it)) } ?: camide.ad
        )
        val camidesiniz = context.getString(R.string.camidesiniz)
        val bildirim = NotificationCompat.Builder(context, KANAL)
            .setSmallIcon(R.drawable.ic_cami)
            .setColor(SaatPaleti.int(SaatPaleti.EYLEM))
            .setContentTitle(camidesiniz)
            .setContentText(metin)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setLocalOnly(true)
            .setTimeoutAfter(camide.bitisMs - simdi)
            .setContentIntent(ac)
        OngoingActivity.Builder(context, ETIKET, BILDIRIM_NO, bildirim)
            .setStaticIcon(R.drawable.ic_cami)
            .setTouchIntent(ac)
            .setStatus(Status.Builder().addTemplate("#d#").addPart("d", Status.TextPart(camidesiniz)).build())
            .setTitle(camidesiniz)
            .setContentDescription(context.getString(R.string.cami_erisim, camidesiniz, camide.ad, metin))
            .build()
            .apply(context)
        try {
            NotificationManagerCompat.from(context).notify(ETIKET, BILDIRIM_NO, bildirim.build())
        } catch (_: SecurityException) {
            // İzin geri alındıysa sessizce geç.
        }
    }

    private fun kanaliGarantile(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        val ad = context.getString(R.string.camideyim_kanal_adi)
        val aciklama = context.getString(R.string.camideyim_kanal_aciklama)
        // Var olan kanalda yalnız ad/açıklama (cihaz dili değişince) güncellenir.
        val mevcut = nm.getNotificationChannel(KANAL)
        if (mevcut != null && mevcut.name?.toString() == ad && mevcut.description == aciklama) return
        nm.createNotificationChannel(
            NotificationChannel(KANAL, ad, NotificationManager.IMPORTANCE_LOW).apply {
                description = aciklama
                enableVibration(false)
                setSound(null, null)
            }
        )
    }
}
