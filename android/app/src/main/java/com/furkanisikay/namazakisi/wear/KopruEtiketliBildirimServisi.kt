package com.furkanisikay.namazakisi.wear

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.furkanisikay.namazakisi.cekirdek.ErtelemeKurallari
import com.furkanisikay.namazakisi.kildim.BildirimErteleIsleyici
import com.furkanisikay.namazakisi.kildim.BildirimKildimIsleyici
import expo.modules.notifications.notifications.model.Notification
import expo.modules.notifications.notifications.model.NotificationBehaviorRecord
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.delegates.ExpoPresentationDelegate
import expo.modules.notifications.service.delegates.SharedPreferencesNotificationsStore
import expo.modules.notifications.service.interfaces.PresentationDelegate

/**
 * Muhafız bildirimlerine Wear OS KÖPRÜ ETİKETİ basan expo-notifications alt sınıfı
 * (issue #280 — çift bildirim).
 *
 * Saat uygulaması telefonun HAZIR muhafız planını kendi alarmlarıyla kurar; telefon
 * bağlıyken aynı uyarı köprüyle de gelirse bilekte İKİ KEZ görünür. Saat tarafı
 * `BridgingManager` ile YALNIZ bu etiketi dışlar (`saat/veri/KopruAyari.kt`) — diğer
 * bütün bildirimler (vakit girdi, sayaçlar, cuma…) köprülenmeye devam eder. Köprüyü
 * tümden kapatmak (`notificationBridgeMode=NO_BRIDGING`) bu yüzden SEÇİLMEDİ.
 *
 * NEDEN ALT SINIF: expo-notifications `WearableExtender`'ı JS'e açmaz. Paket, olayları
 * `findDesignatedBroadcastReceiver` ile bulduğu EN YÜKSEK öncelikli alıcıya gönderir
 * (kendi alıcısı `priority=-1`); manifestte `priority=0` ile kaydedilen bu sınıf
 * sunumu devralır, geri kalan her şey (zamanlama, yanıt, kategori) üst sınıfta kalır —
 * tek istisna muhafız "Kıldım" eylemidir (issue #299, [onReceiveNotificationResponse]).
 * BOOT/MY_PACKAGE_REPLACED kurulum eylemleri BİLEREK burada dinlenmez — expo'nun
 * kendi alıcısı yapar, iki kez kurulmasın.
 *
 * Etiket yalnız muhafız PLAN kimliklerine (`muhafiz_..._seviye_N_dk_K`,
 * `anonsKimligi.ts`) basılır; aynı uzaydaki erteleme ve yatış/muhasebe
 * bildirimleri saatte kurulmadığı için köprülenir. Saat tarafında dışlama ancak saatin kendi planı VE bildirim izni varken
 * açılır; yoksa köprü bildirimi tek uyarı olarak kalır.
 *
 * GÜNCELLEME GEÇİŞİ (Fable incelemesi, YÜKSEK): expo tetik PendingIntent'ini tasarlanan
 * alıcının bileşeniyle ve istek kodu = bileşen sınıf adının hash'iyle kurar. Bu sınıf
 * gelince yeni alarmlar BİZİM bileşenimizi hedefler; güncelleme ÖNCESİ kurulmuş alarmlar
 * ise expo'nun `NotificationsService` bileşenini. expo iptali de yeni bileşenle yaptığı için
 * eski alarm HİÇ iptal edilemez ve aynı kimlikli yeniden planlama yanında ikinci bir alarm
 * olarak kalırdı → cuma'da dört haftaya kadar çift bildirim. Bu yüzden: (a) iptal
 * olaylarında eski bileşenli tetik de iptal edilir; (b) `EskiExpoAlarmTemizleyici`
 * MY_PACKAGE_REPLACED'da bekleyen her istek için eski tetiği siler (uygulama hiç
 * açılmasa da). Alarmlar yeniden başlatmada zaten silinir.
 *
 * CİHAZDA DOĞRULANACAK: alıcı seçiminin önceliğe göre yapıldığı.
 */
class KopruEtiketliBildirimServisi : NotificationsService() {
    override fun getPresentationDelegate(context: Context): PresentationDelegate =
        KopruEtiketliSunucu(context)

    /**
     * Muhafız "Kıldım" eylemi NATIVE işlenir (issue #299, `BildirimKildimIsleyici`).
     *
     * BİLİNÇLİ KARAR — işlenen eylemde `super` ÇAĞRILMAZ: üst sınıf yanıtı JS'e üç
     * yoldan daha verirdi (headless `MUHAFIZ_BILDIRIM_YANITI` görevi, ön plandaki yanıt
     * dinleyicisi, açılıştaki `getLastNotificationResponseAsync`). JS bu eylemi yalnız
     * "kıldım" için dinler; kuyruk öğesi aynı gövdeyi (`kildimAksiyonunuIsle`) zaten
     * çalıştırdığı için o yollar yalnız ÇİFT işleme üretirdi. Eylem `opensAppToForeground:
     * false` olduğu için üst sınıfın uygulamayı açma dalı da zaten çalışmıyordu.
     * Gövdeye dokunma ve diğer bildirimler değişmeden üst sınıfa gider; native yol
     * başarısızsa (kuyruğa yazılamadı) da üst sınıfa düşülür → eski davranış.
     */
    override fun onReceiveNotificationResponse(context: Context, intent: Intent) {
        val islendi = try {
            val zamanlama = getSchedulingDelegate(context)
            // "Ertele" (issue #289) da AYNI gerekçeyle native işlenir: erteleme JS'i
            // beklemeden kurulmalı, aradaki uyarılar susmalı.
            BildirimKildimIsleyici.isle(context, intent, zamanlama) ||
                BildirimErteleIsleyici.isle(context, intent, zamanlama)
        } catch (_: Exception) {
            false
        }
        if (!islendi) super.onReceiveNotificationResponse(context, intent)
    }

    override fun onRemoveScheduledNotifications(context: Context, intent: Intent) {
        intent.extras?.getStringArray(NotificationsService.IDENTIFIERS_KEY)?.forEach { eskiExpoTetiginiIptalEt(context, it) }
        super.onRemoveScheduledNotifications(context, intent)
    }

    override fun onRemoveAllScheduledNotifications(context: Context, intent: Intent) {
        tumEskiExpoTetikleriniIptalEt(context)
        super.onRemoveAllScheduledNotifications(context, intent)
    }

    private class KopruEtiketliSunucu(context: Context) : ExpoPresentationDelegate(context) {
        override suspend fun createNotification(
            notification: Notification,
            notificationBehavior: NotificationBehaviorRecord?,
        ): android.app.Notification {
            val bildirim = super.createNotification(notification, notificationBehavior)
            val kimlik = notification.notificationRequest?.identifier ?: return bildirim
            // Yalnız muhafız PLANI: saat yalnız planı kendi kurar. Erteleme (#289)
            // ve yatış/muhasebe (#290) aynı `muhafiz_` uzayında ama saatte YOK →
            // köprüyle gelmeleri gerekir, etiket basılırsa bilekte hiç görünmezlerdi.
            if (ErtelemeKurallari.planKimligiMi(kimlik)) {
                try {
                    koprulemeEtiketiEkle(context, bildirim)
                } catch (_: Exception) {
                    // Etiket basılamazsa bildirim yine gösterilir (en kötü: saatte çift).
                }
            }
            return bildirim
        }
    }

    companion object {
        /** Saat tarafı `KopruAyari.MUHAFIZ_KOPRU_ETIKETI` ile AYNI olmalı. */
        const val MUHAFIZ_KOPRU_ETIKETI = "namazakisi_muhafiz"

        /**
         * Kurulmuş bildirimin ekstralarına `WearableExtender` paketini ekler. Anahtar
         * adlarını elle yazmamak için geçici bir builder'a uygulanıp kopyalanır.
         */
        /** expo'nun KENDİ alıcısının bileşeni — güncelleme öncesi alarmlar bunu hedefler. */
        private const val EXPO_ALICISI = "expo.modules.notifications.service.NotificationsService"

        /**
         * Güncelleme öncesi, expo'nun bileşeniyle kurulmuş tetik alarmını iptal eder.
         * Eşleşme `createNotificationTrigger` ile birebir: eylem + veri URI'si + bileşen +
         * istek kodu (bileşen adının hash'i) + değişebilirlik bayrağı. Yoksa hiçbir şey yapmaz.
         */
        fun eskiExpoTetiginiIptalEt(context: Context, kimlik: String) {
            try {
                val intent = Intent(
                    NotificationsService.NOTIFICATION_EVENT_ACTION,
                    Uri.parse("expo-notifications://notifications/").buildUpon()
                        .appendPath("scheduled").appendPath(kimlik).appendPath("trigger").build(),
                ).setComponent(ComponentName(context.packageName, EXPO_ALICISI))
                val degisebilir = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0
                val pi = PendingIntent.getBroadcast(
                    context,
                    EXPO_ALICISI.hashCode(),
                    intent,
                    PendingIntent.FLAG_NO_CREATE or degisebilir,
                ) ?: return
                (context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.cancel(pi)
                pi.cancel()
            } catch (_: Exception) {
                // En kötü: güncelleme günü bir kerelik çift bildirim.
            }
        }

        fun tumEskiExpoTetikleriniIptalEt(context: Context) {
            try {
                SharedPreferencesNotificationsStore(context).allNotificationRequests
                    .forEach { eskiExpoTetiginiIptalEt(context, it.identifier) }
            } catch (_: Exception) {
                // Mağaza okunamazsa geçiş temizliği atlanır.
            }
        }

        fun koprulemeEtiketiEkle(context: Context, bildirim: android.app.Notification) {
            val gecici = NotificationCompat.Builder(context, "kopru_etiketi")
            NotificationCompat.WearableExtender()
                .setBridgeTag(MUHAFIZ_KOPRU_ETIKETI)
                .extend(gecici)
            bildirim.extras.putAll(gecici.extras)
        }
    }
}

/**
 * Uygulama güncellenince (MY_PACKAGE_REPLACED) güncelleme ÖNCESİ expo bileşeniyle kurulmuş
 * tetik alarmlarını siler; expo'nun kendi alıcısı aynı yayında bekleyen istekleri YENİ
 * bileşenle yeniden kurar. İkisinin sırası önemsizdir: farklı PendingIntent'ler.
 */
class EskiExpoAlarmTemizleyici : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
        KopruEtiketliBildirimServisi.tumEskiExpoTetikleriniIptalEt(context)
    }
}
