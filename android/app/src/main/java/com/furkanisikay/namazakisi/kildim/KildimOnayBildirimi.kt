package com.furkanisikay.namazakisi.kildim

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.arayuzDili
import com.furkanisikay.namazakisi.dildeBaglam
import com.furkanisikay.namazakisi.cekirdek.BildirimKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.KildimOnayMetni

/**
 * Bildirimdeki "Kıldım"dan sonra kısa, SESSİZ teşekkür: "Öğle · Allah kabul etsin".
 *
 * Bildirim gölgesinde dokunulan uyarı kaybolurken yerine 5 sn'lik sakin bir satır çıkar ve
 * kendiliğinden kalkar (`setTimeoutAfter`). Ses/titreşim/heads-up YOK: kanal `kildim_onay`
 * IMPORTANCE_LOW. Kanal adı `muhafiz_` ile BAŞLAMAZ — muhafız kanal çöp toplaması
 * (`MuhafizKanallari.copleriTopla`) `muhafiz_*` olup listede olmayanı siler.
 * `setLocalOnly(true)`: saate köprülenmez (saat kendi onay animasyonunu gösterir; bileğe
 * ikinci bir titreşim gitmesin). Bildirim izni yoksa ya da herhangi bir hata olursa sessizce
 * vazgeçilir — işaretleme zaten kuyruğa yazılmıştır. Metin ve kanal adı UYGULAMANIN arayüz
 * dilindedir (`arayuzDili` / `dildeBaglam`).
 */
object KildimOnayBildirimi {
    private const val TAG = "KildimOnay"
    const val KANAL_ID = "kildim_onay"
    private const val NUMARA = 7_299

    fun goster(context: Context, v: BildirimKildimKurallari.Vakit) {
        try {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && !nm.areNotificationsEnabled()) return
            val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                kanaliGarantile(context, nm)
                Notification.Builder(context, KANAL_ID).setTimeoutAfter(KildimOnayMetni.GORUNME_MS)
            } else {
                @Suppress("DEPRECATION")
                Notification.Builder(context).setPriority(Notification.PRIORITY_LOW)
            }
            val dil = context.arayuzDili()
            val bildirim = builder
                .setSmallIcon(R.drawable.ic_qs_kildim)
                .setContentTitle(KildimOnayMetni.baslik(v.vakit, dil))
                .setContentText(KildimOnayMetni.govde(v.vakit, dil))
                .setOnlyAlertOnce(true)
                .setAutoCancel(true)
                .setLocalOnly(true)
                .setShowWhen(false)
                .setCategory(Notification.CATEGORY_STATUS)
                .build()
            nm.notify("${KANAL_ID}_${v.tarih}_${v.vakit}", NUMARA, bildirim)
            // API < 26'da setTimeoutAfter yok: kalırsa da zararsız (otomatik kapanır dokununca).
        } catch (e: Exception) {
            Log.w(TAG, "Kildim onayi gosterilemedi", e)
        }
    }

    /**
     * Kanal yoksa kurar; varsa yalnız AD/AÇIKLAMA arayüz diline göre güncellenir
     * (`createNotificationChannel` var olan kanalda ses/önem ayarına dokunmaz; önemi
     * yalnız düşürebilir, burada aynı değer verilir).
     */
    private fun kanaliGarantile(context: Context, nm: NotificationManager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val m = context.dildeBaglam()
        val ad = m.getString(R.string.kildim_onay_kanal_adi)
        val aciklama = m.getString(R.string.kildim_onay_kanal_aciklama)
        val mevcut = nm.getNotificationChannel(KANAL_ID)
        if (mevcut != null && mevcut.name?.toString() == ad && mevcut.description == aciklama) return
        val kanal = NotificationChannel(
            KANAL_ID,
            ad,
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = aciklama
            setSound(null, null)
            enableVibration(false)
            setShowBadge(false)
        }
        nm.createNotificationChannel(kanal)
    }
}
