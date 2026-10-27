package com.furkanisikay.namazakisi.saat.tesbihat

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.wear.ongoing.OngoingActivity
import androidx.wear.ongoing.Status
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat
import com.furkanisikay.namazakisi.saat.hatirlatma.MuhafizBildirimci
import com.furkanisikay.namazakisi.saat.ui.TesbihatAktivite
import com.furkanisikay.namazakisi.saat.ui.yerelRakamla

/**
 * Yarım tesbihat oturumunun kadrandaki dokunulabilir simgesi (Ongoing Activity,
 * issue #293). KULLANICININ BAŞLATTIĞI etkinliktir: ilk sayımdan sonra ekran
 * kapanınca / uygulamadan çıkınca görünür, oturum bitince ya da sıfırlanınca kalkar
 * (Google'ın "sürekli kart" politikasıyla uyumlu — 7/24 değil).
 *
 * Ekran açıkken (aktivite ön plandayken) güncellenmez: her dokunuşta bildirim
 * yayınlamak gereksiz iştir. `TesbihatAktivite.onStop` son durumu yazar.
 * `setTimeoutAfter(ESKIME_MS)`: oturum eskiyince simge de kendiliğinden gider
 * (eski oturum açılışta zaten sıfırdan başlar — `Tesbihat.yukle`).
 *
 * Kanal sessizdir (MIN değil LOW: Ongoing simgesi için bildirimin görünür olması gerekir).
 */
object TesbihatEtkinligi {
    private const val KANAL = "tesbihat"
    private const val ETIKET = "tesbihat"
    private const val BILDIRIM_NO = 4803

    fun guncelle(context: Context, durum: Tesbihat.Durum) {
        if (!Tesbihat.suruyorMu(durum) || !MuhafizBildirimci.bildirimIzniVar(context)) {
            kaldir(context)
            return
        }
        kanaliGarantile(context)
        val ac = PendingIntent.getActivity(
            context, BILDIRIM_NO,
            Intent(context, TesbihatAktivite::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        // Zikir adı cihaz dilinin yaygın okunuşuyla (bilinmeyen dil Türkçe), ekranla aynı.
        val dil = context.getString(R.string.dil_kodu)
        // Görünen sayım ("Sübhânallah 12/33") saatin yerel rakamıyla (`cekirdek/Rakam.kt`).
        val metin = context.yerelRakamla(Tesbihat.kisaMetin(durum, dil))
        val bildirim = NotificationCompat.Builder(context, KANAL)
            .setSmallIcon(R.drawable.ic_tesbihat)
            // Eylem yeşili vurgu: sistem simgeyi boyarsa gri zeminde gri kalmasın.
            .setColor(SaatPaleti.int(SaatPaleti.EYLEM))
            .setContentTitle(context.getString(R.string.tesbihat_adi))
            .setContentText(metin)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setLocalOnly(true)
            .setTimeoutAfter(Tesbihat.ESKIME_MS)
            .setContentIntent(ac)
        val durumMetni = Status.Builder()
            .addTemplate("#faz#")
            .addPart("faz", Status.TextPart(metin))
            .build()
        OngoingActivity.Builder(context, ETIKET, BILDIRIM_NO, bildirim)
            .setStaticIcon(R.drawable.ic_tesbihat)
            .setTouchIntent(ac)
            .setStatus(durumMetni)
            .setTitle(context.getString(R.string.tesbihat_adi))
            .setContentDescription(
                context.getString(R.string.tesbihat_suruyor, durum.faz.ad(dil), durum.fazSayisi, durum.faz.hedef)
            )
            .build()
            .apply(context)
        try {
            NotificationManagerCompat.from(context).notify(ETIKET, BILDIRIM_NO, bildirim.build())
        } catch (_: SecurityException) {
            // İzin tam bu arada geri alındıysa sessizce geç; sayım diskte duruyor.
        }
    }

    fun kaldir(context: Context) {
        NotificationManagerCompat.from(context).cancel(ETIKET, BILDIRIM_NO)
    }

    private fun kanaliGarantile(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        val ad = context.getString(R.string.tesbihat_kanal_adi)
        val aciklama = context.getString(R.string.tesbihat_kanal_aciklama)
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
