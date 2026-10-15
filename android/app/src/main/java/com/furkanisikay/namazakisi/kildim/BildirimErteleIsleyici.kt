package com.furkanisikay.namazakisi.kildim

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.LifecycleState
import com.furkanisikay.namazakisi.alarm.MuhafizAlarmZamanlayici
import com.furkanisikay.namazakisi.cekirdek.BildirimKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.ErtelemeKurallari
import com.furkanisikay.namazakisi.wear.KopruEtiketliBildirimServisi
import expo.modules.countdownnotification.AnonsZamanlayici
import expo.modules.notifications.notifications.model.NotificationContent
import expo.modules.notifications.notifications.enums.NotificationPriority
import expo.modules.notifications.notifications.model.NotificationRequest
import expo.modules.notifications.notifications.triggers.DateTrigger
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.interfaces.SchedulingDelegate
import org.json.JSONObject

/**
 * Muhafız bildirimindeki "10/20 dk ertele" — NATIVE (issue #289).
 *
 * "Kıldım" ile AYNI gerekçe (issue #299): uygulama kapalıyken ve Samsung uyku
 * kısıtındayken JS headless görevi dakikalarca gecikebilir; erteleme ise TAM o
 * anda kurulmalı ve aradaki uyarıları susturmalı. Bu yüzden JS beklenmez:
 *  1. basılan bildirim kaldırılır;
 *  2. yeni an = min(şimdi + süre, `erteleSinirMs`) (sınır: çıkış − 3 dk, ikindide
 *     gurub kerahati — JS hesaplar, `data`da gelir). Sınıra < 1 dk kaldıysa
 *     ertelenmez, bildirim yalnız kapanır;
 *  3. içerik KOPYALANIR (aynı gövde, aynı kanal → aynı ses/ton/aciliyet), başlık
 *     basış anının kalan süresiyle yeniden yazılır, kategori yeni ana göre seçilir;
 *     kimlik `muhafiz_<tarih>_vakit_<vakit>_ertele` (vakit başına tek erteleme) →
 *     "Kıldım" önek iptali onu DA kapsar. Tetik expo'nun zamanlayıcısıyla (tam alarm,
 *     muhafız uyarılarıyla aynı yol) kurulur;
 *  4. hedef ana kadarki planlı muhafız tetikleri ve sesli anonsları iptal edilir.
 *     JS'in bir sonraki planlama turu da aynı aralığa uyarı kurmaz
 *     (`etkinErtelemeler`, kopyanın `ertelemeHedefMs` alanından).
 *
 * İşlenemeyen yanıtta (eski içerik, eksik veri) `false` döner → üst sınıf JS
 * yoluna devreder (`MuhafizErtelemeServisi`).
 *
 *  5. JS'e HABER verilir ([jsBildir]): ön plan muhafızı (banner/ses/anons) ve saatin
 *     hazır planı ertelemeyi ancak böyle öğrenir. Yoksa uygulama açıkken ön plan
 *     native'in az önce iptal ettiği anonsu AYNI kimlikle yeniden kurardı.
 */
object BildirimErteleIsleyici {
    private const val TAG = "BildirimErtele"
    private const val VARSAYILAN_KANAL = "muhafiz"

    /** Uygulama AÇIKKEN yayılan olay — JS `MUHAFIZ_ERTELENDI_OLAYI` ile AYNI. */
    const val OLAY_ADI = "MuhafizErtelendi"

    /** @return yanıt burada işlendiyse true (expo'nun olağan yanıt yolu ÇAĞRILMAMALI). */
    fun isle(context: Context, intent: Intent, zamanlama: SchedulingDelegate): Boolean {
        val yanit = try {
            NotificationsService.getNotificationResponseFromBroadcastIntent(intent)
        } catch (_: Exception) {
            return false
        }
        val sureDk = ErtelemeKurallari.eylemSuresiDk(yanit.actionIdentifier) ?: return false
        val istek = yanit.notification?.notificationRequest ?: return false
        val kimlik = istek.identifier ?: return false
        val vakit = BildirimKildimKurallari.vakitCoz(kimlik) ?: return false
        val icerik = istek.content as? NotificationContent ?: return false
        val govde = icerik.body ?: return false
        val sinirMs = govde.optLong("erteleSinirMs", 0L)
        val cikisMs = govde.optLong("cikisMs", 0L)
        if (sinirMs <= 0L || cikisMs <= 0L) return false

        gosterileniKaldir(context, kimlik)

        val simdi = System.currentTimeMillis()
        val hedef = ErtelemeKurallari.hedefHesapla(simdi, sureDk, sinirMs)
        if (hedef == null) {
            // Sınır geçti: ertelenecek zaman yok. Bildirim kapandı, plan sürer.
            Log.i(TAG, "Sinir gecti, ertelenmedi: $kimlik")
            return true
        }

        try {
            val yeniGovde = JSONObject(govde.toString()).put("ertelemeHedefMs", hedef)
            val baslik = ErtelemeKurallari.baslik(govde.optString("ertelemeBasligi", ""), cikisMs, hedef)
                ?: icerik.title
            val kanal = istek.trigger?.getNotificationChannel()
                ?: govde.optString("kanalId", "").ifEmpty { VARSAYILAN_KANAL }
            val yeniIcerik = NotificationContent.Builder()
                .setTitle(baslik)
                .setText(icerik.text)
                .setSubtitle(icerik.subText)
                .setBody(yeniGovde)
                .setPriority(icerik.priority)
                .setAutoDismiss(icerik.isAutoDismiss)
                .setSticky(icerik.isSticky)
                .setCategoryId(ErtelemeKurallari.kategori(hedef, sinirMs))
                .apply {
                    icerik.vibrationPattern?.let { setVibrationPattern(it) }
                    icerik.color?.let { setColor(it) }
                }
                .build()
            val ertelemeKimligi = ErtelemeKurallari.kimlik(vakit.tarih, vakit.vakit)
            // Güncelleme öncesi bileşenle kurulmuş aynı kimlikli eski tetik varsa (olamaz
            // ama ucuz) yanında ikinci alarm kalmasın.
            KopruEtiketliBildirimServisi.eskiExpoTetiginiIptalEt(context, ertelemeKimligi)
            zamanlama.scheduleNotification(NotificationRequest(ertelemeKimligi, yeniIcerik, DateTrigger(kanal, hedef)))
            araliktakileriSustur(context, zamanlama, vakit, cikisMs, hedef)
            Log.i(TAG, "${vakit.vakit} (${vakit.tarih}) $sureDk dk ertelendi")
            jsBildir(context)
        } catch (e: Exception) {
            // Bildirim kapandı ama erteleme kurulamadı: planlı uyarılar sürer (sessiz
            // kayıp değil). JS yoluna düşmek aynı veriyle aynı hatayı tekrarlardı.
            Log.w(TAG, "Erteleme kurulamadi: $kimlik", e)
        }
        return true
    }

    /**
     * GERÇEK ALARMDAN "10 dk ertele" (issue #74). Alarm bildirimi bir expo isteği
     * DEĞİLDİR (native `setAlarmClock` + kendi bildirimimiz) → içerik expo yanıtından
     * değil, alarm yükünden kurulur; geri kalan her şey bildirim ertelemesiyle AYNIDIR:
     * aynı kimlik (`..._ertele`, vakit başına tek erteleme), aynı fıkhi sınır
     * (`erteleSinirMs`, JS hesaplar), aynı başlık şablonu, aynı susturma ve aynı JS
     * haberi. Ertelenen kopya bir NORMAL muhafız bildirimidir (alarm tekrar çalmaz):
     * JS'in bir sonraki planlama turu ertelemeyi bekleyen bildirimlerdeki kopyadan
     * öğrenir (`etkinErtelemeler`) — kopya native bir alarm olsaydı JS onu göremez ve
     * susturulan aralığa yeniden uyarı kurardı.
     *
     * @param veri alarm yükündeki muhafız `data` nesnesi (`cikisMs`, `erteleSinirMs`,
     *   `ertelemeBasligi` dahil). @param kanal ertelenen kopyanın NORMAL kanalı.
     * @return ertelendiyse true; sınır geçtiyse/veri eksikse false (alarm yine kapanır).
     */
    fun alarmdanErtele(
        context: Context,
        zamanlama: SchedulingDelegate,
        kimlik: String,
        sureDk: Long,
        baslik: String,
        metin: String,
        veri: JSONObject,
        kanal: String,
        seviye: Int,
    ): Boolean {
        val vakit = BildirimKildimKurallari.vakitCoz(kimlik) ?: return false
        val sinirMs = veri.optLong("erteleSinirMs", 0L)
        val cikisMs = veri.optLong("cikisMs", 0L)
        if (sinirMs <= 0L || cikisMs <= 0L) return false
        val hedef = ErtelemeKurallari.hedefHesapla(System.currentTimeMillis(), sureDk, sinirMs) ?: return false
        return try {
            val yeniGovde = JSONObject(veri.toString()).put("ertelemeHedefMs", hedef).put("kanalId", kanal)
            val yeniBaslik = ErtelemeKurallari.baslik(veri.optString("ertelemeBasligi", ""), cikisMs, hedef) ?: baslik
            val icerik = NotificationContent.Builder()
                .setTitle(yeniBaslik)
                .setText(metin)
                .setBody(yeniGovde)
                .setPriority(if (seviye >= 3) NotificationPriority.MAX else NotificationPriority.HIGH)
                .setAutoDismiss(true)
                .setCategoryId(ErtelemeKurallari.kategori(hedef, sinirMs))
                .build()
            val ertelemeKimligi = ErtelemeKurallari.kimlik(vakit.tarih, vakit.vakit)
            KopruEtiketliBildirimServisi.eskiExpoTetiginiIptalEt(context, ertelemeKimligi)
            zamanlama.scheduleNotification(NotificationRequest(ertelemeKimligi, icerik, DateTrigger(kanal, hedef)))
            araliktakileriSustur(context, zamanlama, vakit, cikisMs, hedef)
            Log.i(TAG, "${vakit.vakit} (${vakit.tarih}) alarmdan $sureDk dk ertelendi")
            jsBildir(context)
            true
        } catch (e: Exception) {
            Log.w(TAG, "Alarm ertelenemedi: $kimlik", e)
            false
        }
    }

    /** Hedef ana kadarki planlı muhafız tetiklerini ve sesli anonslarını iptal eder. */
    private fun araliktakileriSustur(
        context: Context,
        zamanlama: SchedulingDelegate,
        v: BildirimKildimKurallari.Vakit,
        cikisMs: Long,
        hedefMs: Long,
    ) {
        val susturulur: (String) -> Boolean = { id ->
            BildirimKildimKurallari.buVakteAitMi(id, v) &&
                ErtelemeKurallari.kimliktenKalanDk(id)?.let { dk ->
                    ErtelemeKurallari.susturulurMu(cikisMs - dk * 60_000L, hedefMs)
                } == true
        }
        try {
            val kimlikler = zamanlama.getAllScheduledNotifications().map { it.identifier }.filter(susturulur)
            if (kimlikler.isNotEmpty()) {
                kimlikler.forEach { KopruEtiketliBildirimServisi.eskiExpoTetiginiIptalEt(context, it) }
                zamanlama.removeScheduledNotifications(kimlikler)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Planli uyarilar susturulamadi", e)
        }
        try {
            // Sesli-yalnız adımın bildirimi hiç planlanmamış olabilir → anonslar KENDİ
            // kayıt defterinden seçilir (Kıldım deseni).
            AnonsZamanlayici.eslesenleriIptalEt(context, susturulur)
        } catch (e: Exception) {
            Log.w(TAG, "Anons alarmlari susturulamadi", e)
        }
        try {
            // Gerçek alarmlar (issue #74) da kendi kayıt defterinden: ertelenen aralığa
            // düşen bir alarm çalsaydı "ertele" yalan söylerdi.
            MuhafizAlarmZamanlayici.eslesenleriIptalEt(context, susturulur)
        } catch (e: Exception) {
            Log.w(TAG, "Gercek alarmlar susturulamadi", e)
        }
    }

    /**
     * JS'e "erteleme kuruldu" der ([KildimKuyrugu.jsUyandir] ikizi): ön plandaysa olay
     * yayar (ön plan muhafızı önbelleğini tazeler, saat yükü süzülür); değilse headless
     * `KildimKuyrugu` görevini `neden=ertele` ile başlatmaya ÇALIŞIR — yalnız saatin
     * planı tazelensin diye (ön plan muhafızı zaten açılışta bekleyenlerden hidrate
     * olur). `startService` arka plan kısıtına takılırsa HATA DEĞİL: saat bir sonraki
     * gönderimde (15 dk görevi, açılış) süzülmüş planı alır.
     */
    private fun jsBildir(context: Context) {
        val uygulama = context.applicationContext
        val baglam: ReactContext? = try {
            (uygulama as? ReactApplication)?.reactHost?.currentReactContext
        } catch (_: Throwable) {
            null
        }
        if (baglam != null && baglam.lifecycleState == LifecycleState.RESUMED) {
            try {
                baglam.emitDeviceEvent(OLAY_ADI, null)
                return
            } catch (e: Throwable) {
                Log.w(TAG, "On plan olayi yayilamadi", e)
            }
        }
        try {
            uygulama.startService(
                Intent(uygulama, KildimGorevServisi::class.java)
                    .putExtra(KildimGorevServisi.EK_NEDEN, KildimGorevServisi.NEDEN_ERTELE)
            )
        } catch (e: Exception) {
            Log.i(TAG, "Headless gorev baslatilamadi; saat sonraki gonderimde suzulur", e)
        }
    }

    /** expo bildirimi etiket = kimlik ile gösterir. */
    private fun gosterileniKaldir(context: Context, kimlik: String) {
        try {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            nm.activeNotifications.filter { it.tag == kimlik }.forEach { nm.cancel(it.tag, it.id) }
        } catch (e: Exception) {
            Log.w(TAG, "Bildirim kaldirilamadi", e)
        }
    }
}
