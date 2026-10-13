package com.furkanisikay.namazakisi.saat.hatirlatma

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.PlanKaydi
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite

/**
 * Saatin KENDİ muhafız bildirimleri (issue #280).
 *
 * Kanal = TON × TİTREŞİM; desenler telefondaki `MuhafizKanallari.kt` ile BİREBİR
 * (`DESEN_NORMAL`/`DESEN_ACIL`, kullanıcı belirgin titreşim açtıysa `DESEN_BELIRGIN_*`).
 * Kanal oluşturulduktan sonra deseni değiştirilemez → kanal YOKSA oluşturulur,
 * mevcut kanala yazılmaz (telefondaki ses/titreşim kanalı dersinin aynısı).
 *
 * Etiket VAKİT KÖKÜDÜR (`muhafiz_<tarih>_vakit_<vakit>`): aynı vaktin yeni uyarısı
 * öncekinin YERİNE geçer (bilekte yığılma olmaz) ve "Kıldım" tek iptalle temizler.
 */
object MuhafizBildirimci {
    private const val BILDIRIM_NO = 4801

    private val DESEN_NORMAL = longArrayOf(0, 500, 200, 500)
    private val DESEN_ACIL = longArrayOf(0, 1000, 500, 1000, 500, 1000)
    private val DESEN_BELIRGIN_NORMAL = longArrayOf(0, 400, 150, 400, 150, 400, 150, 700)
    private val DESEN_BELIRGIN_ACIL = longArrayOf(0, 600, 200, 600, 200, 600, 200, 1200)

    private data class Kanal(val id: String, val ad: String, val onem: Int, val desen: LongArray)

    private fun kanal(acil: Boolean, titresim: Boolean): Kanal = when {
        acil && titresim -> Kanal("muhafiz_acil_titresimli", "Acil hatırlatma · Titreşimli", NotificationManager.IMPORTANCE_MAX, DESEN_BELIRGIN_ACIL)
        acil -> Kanal("muhafiz_acil", "Acil hatırlatma", NotificationManager.IMPORTANCE_MAX, DESEN_ACIL)
        titresim -> Kanal("muhafiz_titresimli", "Namaz hatırlatması · Titreşimli", NotificationManager.IMPORTANCE_HIGH, DESEN_BELIRGIN_NORMAL)
        else -> Kanal("muhafiz", "Namaz hatırlatması", NotificationManager.IMPORTANCE_HIGH, DESEN_NORMAL)
    }

    fun vakitEtiketi(tarih: String, vakit: String) = "muhafiz_${tarih}_vakit_$vakit"

    /** Bildirimler gösterilebilir mi? (Wear OS 4+'ta POST_NOTIFICATIONS kurulumda kapalı gelir.) */
    fun bildirimIzniVar(context: Context): Boolean =
        NotificationManagerCompat.from(context).areNotificationsEnabled()

    private fun kanaliGarantile(context: Context, k: Kanal) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        if (nm.getNotificationChannel(k.id) != null) return
        nm.createNotificationChannel(
            NotificationChannel(k.id, k.ad, k.onem).apply {
                description = "Telefon yanınızda değilken de saatinizde gösterilen namaz hatırlatmaları"
                enableVibration(true)
                vibrationPattern = k.desen
            }
        )
    }

    fun goster(context: Context, kayit: PlanKaydi) {
        if (!bildirimIzniVar(context)) return
        val k = kanal(kayit.acil, kayit.titresim)
        kanaliGarantile(context, k)

        val ac = PendingIntent.getActivity(
            context,
            0,
            Intent(context, AnaAktivite::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val etiket = vakitEtiketi(kayit.tarih, kayit.vakit)
        val kildim = PendingIntent.getBroadcast(
            context,
            etiket.hashCode(),
            Intent(context, KildimAlicisi::class.java)
                .putExtra(KildimAlicisi.TARIH, kayit.tarih)
                .putExtra(KildimAlicisi.VAKIT, kayit.vakit),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val bildirim = NotificationCompat.Builder(context, k.id)
            .setSmallIcon(R.drawable.ic_vakit)
            .setContentTitle(kayit.baslik)
            .setContentText(kayit.govde)
            .setStyle(NotificationCompat.BigTextStyle().bigText(kayit.govde))
            .setCategory(if (kayit.acil) NotificationCompat.CATEGORY_ALARM else NotificationCompat.CATEGORY_REMINDER)
            .setPriority(if (kayit.acil) NotificationCompat.PRIORITY_MAX else NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setLocalOnly(true)
            .setContentIntent(ac)
            // İbadet çağrısı kaydı ("sen") değil, buton etiketi — telefondaki bildirimle aynı.
            .addAction(0, "Kıldım", kildim)
            .build()
        try {
            NotificationManagerCompat.from(context).notify(etiket, BILDIRIM_NO, bildirim)
        } catch (_: SecurityException) {
            // İzin tam bu arada geri alındıysa sessizce geç; zincir yine sürer.
        }
    }

    fun vakitBildiriminiKaldir(context: Context, tarih: String, vakit: String) {
        NotificationManagerCompat.from(context).cancel(vakitEtiketi(tarih, vakit), BILDIRIM_NO)
    }

    /** Ekrandaki bildirimlerden, artık kılınmış sayılan vakitlerinkini kaldır. */
    fun kilinmislariKaldir(context: Context, kilinmisMi: (tarih: String, vakit: String) -> Boolean) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        for (sbn in nm.activeNotifications) {
            val etiket = sbn.tag ?: continue
            if (sbn.id != BILDIRIM_NO || !etiket.startsWith("muhafiz_")) continue
            val tarih = etiket.removePrefix("muhafiz_").substringBefore("_vakit_")
            val vakit = etiket.substringAfter("_vakit_")
            if (kilinmisMi(tarih, vakit)) nm.cancel(etiket, BILDIRIM_NO)
        }
    }
}
