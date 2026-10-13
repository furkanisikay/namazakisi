package com.furkanisikay.namazakisi.saat.hatirlatma

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.wear.ongoing.OngoingActivity
import androidx.wear.ongoing.Status
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.SonDakikalar
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite

/**
 * "Son dakikalar" (issue #281): vaktin KILINMAMIŞ son penceresinde kadranda
 * dokunulabilir sayaç (Ongoing Activity). Pencere `SonDakikalar`'dan (saf) gelir.
 *
 * - Sayaç SİSTEM tarafından çizilir: bildirimde `setWhen` + geri sayan chronometer,
 *   Ongoing durumunda `TimerPart` (elapsedRealtime tabanı!). Saniyelik güncelleme YOK.
 * - Vakit bitince `setTimeoutAfter` bildirimi kendisi kaldırır (alarm gerekmez);
 *   kılınınca `Hatirlatici.tazele` → `guncelle` kaldırır.
 * - Kanal sessizdir (LOW): uyarıyı muhafız bildirimi zaten verdi, sayaç yalnız gösterir.
 *
 * CİHAZDA DOĞRULANACAK: Galaxy Watch Now Bar'da ve kadrandaki Ongoing simgesinde
 * görünürlük (emülatörde Ongoing simgesi kadrana bağlı).
 */
object SonDakikalarBildirimi {
    private const val KANAL = "son_dakikalar"
    private const val ETIKET = "son_dakikalar"
    private const val BILDIRIM_NO = 4802

    fun guncelle(context: Context, yuk: Yuk?, bekleyen: Set<String>, simdi: Long) {
        val pencere = SonDakikalar.aktif(yuk, bekleyen, simdi)
        if (pencere == null || !MuhafizBildirimci.bildirimIzniVar(context)) {
            kaldir(context)
            return
        }
        goster(context, pencere, simdi)
    }

    fun kaldir(context: Context) {
        NotificationManagerCompat.from(context).cancel(ETIKET, BILDIRIM_NO)
    }

    private fun kanaliGarantile(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        if (nm.getNotificationChannel(KANAL) != null) return
        nm.createNotificationChannel(
            NotificationChannel(KANAL, context.getString(R.string.son_dakikalar_kanal_adi), NotificationManager.IMPORTANCE_LOW).apply {
                description = context.getString(R.string.son_dakikalar_kanal_aciklama)
                enableVibration(false)
                setSound(null, null)
            }
        )
    }

    private fun goster(context: Context, p: SonDakikalar.Pencere, simdi: Long) {
        kanaliGarantile(context)
        val ikon = KomplikasyonOrtak.vakitIkonu(p.vakit)
        val ac = PendingIntent.getActivity(
            context, 0, Intent(context, AnaAktivite::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val kildim = PendingIntent.getBroadcast(
            context,
            "son_${p.tarih}_${p.vakit}".hashCode(),
            Intent(context, KildimAlicisi::class.java)
                .putExtra(KildimAlicisi.TARIH, p.tarih)
                .putExtra(KildimAlicisi.VAKIT, p.vakit),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val baslik = "${p.ad} vakti çıkıyor"
        // Saate hal eki EKLENMEZ ("17:43'te" okunuşa göre değişir) — AGENTS.md.
        val govde = "Çıkış: ${VakitHesabi.saat(p.bitis)}"
        val bildirim = NotificationCompat.Builder(context, KANAL)
            .setSmallIcon(ikon)
            .setContentTitle(baslik)
            .setContentText(govde)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setLocalOnly(true)
            .setWhen(p.bitis)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setTimeoutAfter((p.bitis - simdi).coerceAtLeast(1L))
            .setContentIntent(ac)
            // Buton etiketi (arayüz) — muhafız bildirimindeki "Kıldım" ile aynı.
            .addAction(0, "Kıldım", kildim)

        // Ongoing zaman damgaları elapsedRealtime tabanındadır (duvar saati DEĞİL).
        val sifirAni = SystemClock.elapsedRealtime() + (p.bitis - System.currentTimeMillis())
        val durum = Status.Builder()
            .addTemplate("#vakit# · #kalan#")
            .addPart("vakit", Status.TextPart(p.ad))
            .addPart("kalan", Status.TimerPart(sifirAni))
            .build()
        OngoingActivity.Builder(context, ETIKET, BILDIRIM_NO, bildirim)
            .setStaticIcon(ikon)
            .setTouchIntent(ac)
            .setStatus(durum)
            .setTitle(baslik)
            .setContentDescription("${p.ad} vaktinin çıkmasına kalan süre")
            .build()
            .apply(context)
        try {
            NotificationManagerCompat.from(context).notify(ETIKET, BILDIRIM_NO, bildirim.build())
        } catch (_: SecurityException) {
            // İzin tam bu arada geri alındıysa sessizce geç.
        }
    }
}
