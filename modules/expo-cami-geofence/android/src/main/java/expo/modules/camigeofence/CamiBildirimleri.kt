package expo.modules.camigeofence

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.camigeofence.cekirdek.CamiSabitleri

/**
 * Camideyim bildirimleri (native — uygulama süreci ölüyken de gösterilir).
 *
 * İki kanal: "Camidesiniz" SESSİZ (IMPORTANCE_LOW; namazdaki kişiyi rahatsız
 * etmez), "kıldınız mı?" sorusu varsayılan önemde (camiden çıkınca gelir).
 * Kanallar yalnız YOKSA oluşturulur (AGENTS.md: mevcut kanala ses yazmaya kalkma).
 *
 * Metin kayıtları: bunlar uygulamanın kullanıcıyla konuşmasıdır (durum + soru),
 * ibadete çağrı değil → kibar "siz" dili.
 */
object CamiBildirimleri {
    const val KANAL_DURUM = "cami_durum"
    const val KANAL_SORU = "cami_soru"
    const val ID_CAMIDE = 7401
    const val ID_SORU = 7402
    /** Faz 2: güven puanı sınırdayken "Camide misiniz?" (sessiz). */
    const val ID_CAMI_SORU = 7403

    private val NAMAZ_ADLARI = mapOf(
        "imsak" to "Sabah namazını",
        "ogle" to "Öğle namazını",
        "ikindi" to "İkindi namazını",
        "aksam" to "Akşam namazını",
        "yatsi" to "Yatsı namazını",
    )

    private fun kanallariGarantile(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(KANAL_DURUM) == null) {
            nm.createNotificationChannel(
                NotificationChannel(KANAL_DURUM, "Camideyim", NotificationManager.IMPORTANCE_LOW).apply {
                    description = "Camide olduğunuz algılandığında sessiz bilgi"
                    setShowBadge(false)
                }
            )
        }
        if (nm.getNotificationChannel(KANAL_SORU) == null) {
            nm.createNotificationChannel(
                NotificationChannel(KANAL_SORU, "Camiden çıkınca", NotificationManager.IMPORTANCE_DEFAULT).apply {
                    description = "Camiden çıkınca namazı işaretlemeniz için soru"
                }
            )
        }
    }

    private fun acilis(ctx: Context): PendingIntent {
        val i = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName) ?: Intent()
        i.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        return PendingIntent.getActivity(ctx, 7400, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun eylem(ctx: Context, eylem: String, kod: Int, ek: Map<String, String?> = emptyMap()): PendingIntent {
        val i = Intent(ctx, CamiEylemAlicisi::class.java).setAction(eylem).setPackage(ctx.packageName)
        ek.forEach { (k, v) -> if (v != null) i.putExtra(k, v) }
        return PendingIntent.getBroadcast(ctx, kod, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun gonder(ctx: Context, id: Int, b: NotificationCompat.Builder) {
        try {
            NotificationManagerCompat.from(ctx).notify(id, b.build())
        } catch (_: SecurityException) {
            // POST_NOTIFICATIONS yoksa sessizce geç; olay günlükte görünür.
        }
    }

    fun camidesiniz(ctx: Context, c: CamiDepo.Camide, sessiz: Boolean) {
        kanallariGarantile(ctx)
        val govde = when {
            c.modAcildi && sessiz -> "Namaz modu açık. Hatırlatmalar sessiz gelecek."
            c.modAcildi -> "Namaz modu açık."
            sessiz -> "Hatırlatmalar sessiz gelecek."
            else -> "Hatırlatmalar her zamanki gibi gelecek."
        }
        val b = NotificationCompat.Builder(ctx, KANAL_DURUM)
            .setSmallIcon(R.drawable.ic_namaz_modu)
            .setContentTitle(CamiSabitleri.camidesinizBasligi(c.ad))
            .setContentText(govde)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(acilis(ctx))
            .setCategory(NotificationCompat.CATEGORY_STATUS)
        if (c.modAcildi) b.addAction(0, "Modu kapat", eylem(ctx, CamiEylemAlicisi.MODU_KAPAT, 7410))
        b.addAction(0, "Burası cami değil", eylem(ctx, CamiEylemAlicisi.CAMI_DEGIL, 7411, mapOf(CamiEylemAlicisi.EK_YER to c.yerId, CamiEylemAlicisi.EK_AD to c.ad)))
        gonder(ctx, ID_CAMIDE, b)
    }

    /**
     * Güven puanı sınırda (Faz 2): mod AÇILMADI, kullanıcıya sorulur. Sessiz kanal —
     * namazdaki kişiyi rahatsız etmez; soru süresi dolunca kendiliğinden kalkar.
     */
    fun camideMisiniz(ctx: Context, soru: CamiDepo.Soru, namazModu: Boolean) {
        kanallariGarantile(ctx)
        val ad = soru.yer.ad.ifBlank { "Cami" }
        val b = NotificationCompat.Builder(ctx, KANAL_DURUM)
            .setSmallIcon(R.drawable.ic_namaz_modu)
            .setContentTitle("Camide misiniz?")
            .setContentText("$ad yakınındasınız. Emin olamadığımız için size soruyoruz.")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setAutoCancel(true)
            .setContentIntent(acilis(ctx))
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .addAction(0, if (namazModu) "Namaz modunu aç" else "Evet, camideyim", eylem(ctx, CamiEylemAlicisi.SORU_EVET, 7413))
            .addAction(0, "Hayır", eylem(ctx, CamiEylemAlicisi.SORU_HAYIR, 7414))
            .addAction(
                0,
                "Burası cami değil",
                eylem(ctx, CamiEylemAlicisi.CAMI_DEGIL, 7415, mapOf(CamiEylemAlicisi.EK_YER to soru.yer.id, CamiEylemAlicisi.EK_AD to soru.yer.ad)),
            )
        val kalan = soru.bitisMs - System.currentTimeMillis()
        if (kalan > 0) b.setTimeoutAfter(kalan)
        gonder(ctx, ID_CAMI_SORU, b)
    }

    fun kildinizMi(ctx: Context, vakit: String, tarih: String, cuma: Boolean) {
        kanallariGarantile(ctx)
        val namaz = if (cuma) "Cuma namazını" else NAMAZ_ADLARI[vakit] ?: return
        val b = NotificationCompat.Builder(ctx, KANAL_SORU)
            .setSmallIcon(R.drawable.ic_namaz_modu)
            .setContentTitle("$namaz kıldınız mı?")
            .setContentText("Tek dokunuşla işaretleyebilirsiniz.")
            .setAutoCancel(true)
            .setContentIntent(acilis(ctx))
            .addAction(0, "Kıldım", eylem(ctx, CamiEylemAlicisi.KILDIM, 7412, mapOf(CamiEylemAlicisi.EK_VAKIT to vakit, CamiEylemAlicisi.EK_TARIH to tarih)))
        gonder(ctx, ID_SORU, b)
    }

    fun kapat(ctx: Context, id: Int) {
        try { NotificationManagerCompat.from(ctx).cancel(id) } catch (_: Exception) { /* yok */ }
    }
}
