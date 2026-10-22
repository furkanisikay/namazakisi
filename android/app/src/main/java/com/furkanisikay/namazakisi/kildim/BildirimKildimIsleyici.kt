package com.furkanisikay.namazakisi.kildim

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.BildirimKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.wear.KopruEtiketliBildirimServisi
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici
import expo.modules.countdownnotification.AnonsZamanlayici
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.interfaces.SchedulingDelegate

/**
 * Muhafız bildirimindeki "Kıldım" — NATIVE ilk adım (issue #299).
 *
 * Eskiden yanıt yalnız JS'e gidiyordu (`MUHAFIZ_BILDIRIM_YANITI` headless görevi). Samsung
 * uyku kısıtında o görev dakikalarca gecikebiliyor, bu arada vaktin kalan muhafız
 * alarmları ve TTS anonsu çalmaya DEVAM ediyordu ("kıldım dedim, hâlâ bağırıyor").
 * Artık `KopruEtiketliBildirimServisi.onReceiveNotificationResponse` buraya devreder ve
 * JS'i beklemeden:
 *  1. öğeyi ortak kalıcı `KildimKuyrugu`'na yazar (kaynak `bildirim`) — işaretleme
 *     JS'in ayağa kalkmasına bağlı değildir, kuyruk üç yoldan boşalır;
 *  2. o vaktin bekleyen muhafız tetiklerini (expo mağazası + güncelleme öncesi eski
 *     bileşenli tetik) ve TTS anons alarmlarını iptal eder;
 *  3. vaktin gösterilen bildirimlerini kaldırır, widget/hızlı ayarlar kutusunu tazeler;
 *  4. JS'i uyandırır (ön planda olay, değilse headless);
 *  5. (yalnız bildirim eylemi) dokunulan uyarının yerine 5 sn'lik sessiz teşekkür gösterir
 *     (`KildimOnayBildirimi`, "Öğle · Allah kabul etsin") — dokunuşun işe yaradığı görünsün.
 *
 * Her adım kendi try/catch'indedir: biri patlarsa diğerleri yine çalışır. Kuyruğa
 * yazılamadıysa `false` döner ve çağıran expo'nun olağan yoluna (JS görevi) düşer —
 * işaretleme hiçbir durumda kaybolmaz.
 */
object BildirimKildimIsleyici {
    private const val TAG = "BildirimKildim"

    /** @return yanıt burada işlendiyse true (expo'nun olağan yanıt yolu ÇAĞRILMAMALI). */
    fun isle(context: Context, intent: Intent, zamanlama: SchedulingDelegate): Boolean {
        val vakit = try {
            val yanit = NotificationsService.getNotificationResponseFromBroadcastIntent(intent)
            BildirimKildimKurallari.kildimYaniti(
                yanit.actionIdentifier,
                yanit.notification?.notificationRequest?.identifier,
            )
        } catch (_: Exception) {
            null
        } ?: return false
        if (!vakitIsle(context, vakit, zamanlama)) return false
        // Dokunulan uyarının yerine 5 sn'lik sessiz teşekkür ("Öğle · Allah kabul etsin").
        // Yalnız BİLDİRİM yolunda: gerçek alarm ekranı kendi onayını gösterir.
        KildimOnayBildirimi.goster(context, vakit)
        return true
    }

    /**
     * Vakit kimliği çözülmüş bir "Kıldım"ın ORTAK gövdesi — bildirim eylemi ve gerçek
     * alarm (issue #74, `alarm/MuhafizAlarmEylemleri`) AYNI yoldan geçer: kuyruk +
     * tetik/anons/alarm iptali + gösterilenleri kaldırma + widget + JS uyandırma.
     *
     * @return kuyruğa yazılamadıysa false (çağıran kendi yedeğine düşer).
     */
    fun vakitIsle(context: Context, vakit: BildirimKildimKurallari.Vakit, zamanlama: SchedulingDelegate): Boolean {
        if (!KildimKuyrugu.ekle(context, vakit.tarih, vakit.vakit, KildimKuyruguKurallari.KAYNAK_BILDIRIM)) {
            return false
        }
        // Gerçek alarmlar (issue #74, bekleyen + çalan) `KildimKuyrugu.ekle` içinde
        // susturuldu (`MuhafizAlarmTemizligi.vaktiSustur`) — her kuyruk kaynağı aynı yoldan.
        tetikleriIptalEt(context, vakit, zamanlama)
        anonslariIptalEt(context, vakit)
        gosterilenleriKaldir(context, vakit)
        try {
            WidgetGuncelleyici.tumunuGuncelle(context)
        } catch (e: Exception) {
            Log.w(TAG, "Widget tazelenemedi", e)
        }
        KildimKuyrugu.jsUyandir(context)
        return true
    }

    private fun tetikleriIptalEt(context: Context, v: BildirimKildimKurallari.Vakit, zamanlama: SchedulingDelegate) {
        try {
            val kimlikler = BildirimKildimKurallari.iptalEdilecekler(
                zamanlama.getAllScheduledNotifications().map { it.identifier },
                v,
            )
            if (kimlikler.isEmpty()) return
            // Güncelleme ÖNCESİ expo bileşeniyle kurulmuş alarm yeni bileşenle iptal EDİLEMEZ.
            kimlikler.forEach { KopruEtiketliBildirimServisi.eskiExpoTetiginiIptalEt(context, it) }
            zamanlama.removeScheduledNotifications(kimlikler)
        } catch (e: Exception) {
            Log.w(TAG, "Muhafiz tetikleri iptal edilemedi; JS kuyrugu tamamlayacak", e)
        }
    }

    private fun anonslariIptalEt(context: Context, v: BildirimKildimKurallari.Vakit) {
        try {
            AnonsZamanlayici.eslesenleriIptalEt(context) { BildirimKildimKurallari.buVakteAitMi(it, v) }
        } catch (e: Exception) {
            Log.w(TAG, "Anons alarmlari iptal edilemedi", e)
        }
    }

    /** expo bildirimi etiket = kimlik ile gösterir (`ExpoPresentationDelegate.notify(tag, id)`). */
    private fun gosterilenleriKaldir(context: Context, v: BildirimKildimKurallari.Vakit) {
        try {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            nm.activeNotifications
                .filter { sbn -> sbn.tag?.let { BildirimKildimKurallari.buVakteAitMi(it, v) } == true }
                .forEach { sbn -> nm.cancel(sbn.tag, sbn.id) }
        } catch (e: Exception) {
            Log.w(TAG, "Gosterilen bildirimler kaldirilamadi", e)
        }
    }
}
