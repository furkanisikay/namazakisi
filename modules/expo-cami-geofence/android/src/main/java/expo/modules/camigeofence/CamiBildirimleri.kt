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
 * Kanallar yalnız YOKSA oluşturulur (AGENTS.md: mevcut kanala ses yazmaya kalkma);
 * var olan kanalın yalnız ADI etkin dile çekilir.
 *
 * Metin kayıtları: bunlar uygulamanın kullanıcıyla konuşmasıdır (durum + soru),
 * ibadete çağrı değil → kibar "siz" dili. Metinler `res/values/strings.xml` (Türkçe) ve `values-en`'de,
 * uygulamanın ARAYÜZ dilinde çözülür (`dildeBaglam`). "Camidesiniz" başlık öneki
 * her dilde aynıdır (Samsung Rutinler anahtar kelimesi; JS `CAMIDESINIZ_ANAHTAR_KELIMESI`).
 */
object CamiBildirimleri {
    const val KANAL_DURUM = "cami_durum"
    const val KANAL_SORU = "cami_soru"
    const val ID_CAMIDE = 7401
    const val ID_SORU = 7402
    /** Faz 2: güven puanı sınırdayken "Camide misiniz?" (sessiz). */
    const val ID_CAMI_SORU = 7403

    /** Vakit kodu → "kıldınız mı?" sorusundaki namaz adı (kaynak; dil `dildeBaglam`'dan). */
    private val NAMAZ_ADLARI = mapOf(
        "imsak" to R.string.camigeofence_namaz_imsak,
        "ogle" to R.string.camigeofence_namaz_ogle,
        "ikindi" to R.string.camigeofence_namaz_ikindi,
        "aksam" to R.string.camigeofence_namaz_aksam,
        "yatsi" to R.string.camigeofence_namaz_yatsi,
    )

    /**
     * Kanallar YOKSA kurulur (ses/önem bir kez yazılır); VARSA yalnız kullanıcıya
     * görünen adı/açıklaması etkin dile çekilir ([kanaliGarantileVeAdlandir]).
     */
    private fun kanallariGarantile(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val m = ctx.dildeBaglam()
        val durumAd = m.getString(R.string.camigeofence_kanal_durum_ad)
        val durumAciklama = m.getString(R.string.camigeofence_kanal_durum_aciklama)
        nm.kanaliGarantileVeAdlandir(KANAL_DURUM, durumAd, durumAciklama) {
            NotificationChannel(KANAL_DURUM, durumAd, NotificationManager.IMPORTANCE_LOW).apply {
                description = durumAciklama
                setShowBadge(false)
            }
        }
        val soruAd = m.getString(R.string.camigeofence_kanal_soru_ad)
        val soruAciklama = m.getString(R.string.camigeofence_kanal_soru_aciklama)
        nm.kanaliGarantileVeAdlandir(KANAL_SORU, soruAd, soruAciklama) {
            NotificationChannel(KANAL_SORU, soruAd, NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = soruAciklama
            }
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
        val m = ctx.dildeBaglam()
        val govde = m.getString(
            when {
                c.modAcildi && sessiz -> R.string.camigeofence_govde_mod_sessiz
                c.modAcildi -> R.string.camigeofence_govde_mod
                sessiz -> R.string.camigeofence_govde_sessiz
                else -> R.string.camigeofence_govde_normal
            }
        )
        val b = NotificationCompat.Builder(ctx, KANAL_DURUM)
            .setSmallIcon(R.drawable.ic_namaz_modu)
            .setContentTitle(CamiSabitleri.camidesinizBasligi(c.ad))
            .setContentText(govde)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(acilis(ctx))
            .setCategory(NotificationCompat.CATEGORY_STATUS)
        if (c.modAcildi) b.addAction(0, m.getString(R.string.camigeofence_eylem_modu_kapat), eylem(ctx, CamiEylemAlicisi.MODU_KAPAT, 7410))
        b.addAction(0, m.getString(R.string.camigeofence_eylem_cami_degil), eylem(ctx, CamiEylemAlicisi.CAMI_DEGIL, 7411, mapOf(CamiEylemAlicisi.EK_YER to c.yerId, CamiEylemAlicisi.EK_AD to c.ad)))
        gonder(ctx, ID_CAMIDE, b)
    }

    /**
     * Güven puanı sınırda (Faz 2): mod AÇILMADI, kullanıcıya sorulur. Sessiz kanal —
     * namazdaki kişiyi rahatsız etmez; soru süresi dolunca kendiliğinden kalkar.
     */
    fun camideMisiniz(ctx: Context, soru: CamiDepo.Soru, namazModu: Boolean) {
        kanallariGarantile(ctx)
        val m = ctx.dildeBaglam()
        val ad = soru.yer.ad.ifBlank { m.getString(R.string.camigeofence_varsayilan_ad) }
        val b = NotificationCompat.Builder(ctx, KANAL_DURUM)
            .setSmallIcon(R.drawable.ic_namaz_modu)
            .setContentTitle(m.getString(R.string.camigeofence_soru_baslik))
            .setContentText(m.getString(R.string.camigeofence_soru_govde, ad))
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setAutoCancel(true)
            .setContentIntent(acilis(ctx))
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .addAction(
                0,
                m.getString(if (namazModu) R.string.camigeofence_eylem_namaz_modunu_ac else R.string.camigeofence_eylem_evet_camideyim),
                eylem(ctx, CamiEylemAlicisi.SORU_EVET, 7413),
            )
            .addAction(0, m.getString(R.string.camigeofence_eylem_hayir), eylem(ctx, CamiEylemAlicisi.SORU_HAYIR, 7414))
            .addAction(
                0,
                m.getString(R.string.camigeofence_eylem_cami_degil),
                eylem(ctx, CamiEylemAlicisi.CAMI_DEGIL, 7415, mapOf(CamiEylemAlicisi.EK_YER to soru.yer.id, CamiEylemAlicisi.EK_AD to soru.yer.ad)),
            )
        val kalan = soru.bitisMs - System.currentTimeMillis()
        if (kalan > 0) b.setTimeoutAfter(kalan)
        gonder(ctx, ID_CAMI_SORU, b)
    }

    fun kildinizMi(ctx: Context, vakit: String, tarih: String, cuma: Boolean) {
        kanallariGarantile(ctx)
        val namazKaynagi = if (cuma) R.string.camigeofence_namaz_cuma else NAMAZ_ADLARI[vakit] ?: return
        val m = ctx.dildeBaglam()
        val b = NotificationCompat.Builder(ctx, KANAL_SORU)
            .setSmallIcon(R.drawable.ic_namaz_modu)
            .setContentTitle(m.getString(R.string.camigeofence_kildiniz_mi, m.getString(namazKaynagi)))
            .setContentText(m.getString(R.string.camigeofence_kildiniz_mi_govde))
            .setAutoCancel(true)
            .setContentIntent(acilis(ctx))
            .addAction(0, m.getString(R.string.camigeofence_eylem_kildim), eylem(ctx, CamiEylemAlicisi.KILDIM, 7412, mapOf(CamiEylemAlicisi.EK_VAKIT to vakit, CamiEylemAlicisi.EK_TARIH to tarih)))
        gonder(ctx, ID_SORU, b)
    }

    fun kapat(ctx: Context, id: Int) {
        try { NotificationManagerCompat.from(ctx).cancel(id) } catch (_: Exception) { /* yok */ }
    }
}
