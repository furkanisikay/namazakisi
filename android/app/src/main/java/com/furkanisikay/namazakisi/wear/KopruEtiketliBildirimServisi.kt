package com.furkanisikay.namazakisi.wear

import android.content.Context
import androidx.core.app.NotificationCompat
import expo.modules.notifications.notifications.model.Notification
import expo.modules.notifications.notifications.model.NotificationBehaviorRecord
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.delegates.ExpoPresentationDelegate
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
 * sunumu devralır, geri kalan her şey (zamanlama, yanıt, kategori) üst sınıfta kalır.
 * BOOT/MY_PACKAGE_REPLACED kurulum eylemleri BİLEREK burada dinlenmez — expo'nun
 * kendi alıcısı yapar, iki kez kurulmasın.
 *
 * Etiket yalnız `muhafiz_` önekli kimliklere basılır (`anonsKimligi.ts` ile aynı
 * önek). Saat tarafında dışlama ancak saatin kendi planı VE bildirim izni varken
 * açılır; yoksa köprü bildirimi tek uyarı olarak kalır.
 *
 * CİHAZDA DOĞRULANACAK: (1) alıcı seçiminin önceliğe göre yapıldığı, (2) güncelleme
 * öncesi kurulmuş alarmlar expo'nun alıcısını hedeflediği için ilk muhafız yeniden
 * planlamasına kadar etiketsiz gidebilir (her açılışta / 15 dk'da yeniden kurulur).
 */
class KopruEtiketliBildirimServisi : NotificationsService() {
    override fun getPresentationDelegate(context: Context): PresentationDelegate =
        KopruEtiketliSunucu(context)

    private class KopruEtiketliSunucu(context: Context) : ExpoPresentationDelegate(context) {
        override suspend fun createNotification(
            notification: Notification,
            notificationBehavior: NotificationBehaviorRecord?,
        ): android.app.Notification {
            val bildirim = super.createNotification(notification, notificationBehavior)
            val kimlik = notification.notificationRequest?.identifier ?: return bildirim
            if (kimlik.startsWith(MUHAFIZ_ONEKI)) {
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
        private const val MUHAFIZ_ONEKI = "muhafiz_"

        /**
         * Kurulmuş bildirimin ekstralarına `WearableExtender` paketini ekler. Anahtar
         * adlarını elle yazmamak için geçici bir builder'a uygulanıp kopyalanır.
         */
        fun koprulemeEtiketiEkle(context: Context, bildirim: android.app.Notification) {
            val gecici = NotificationCompat.Builder(context, "kopru_etiketi")
            NotificationCompat.WearableExtender()
                .setBridgeTag(MUHAFIZ_KOPRU_ETIKETI)
                .extend(gecici)
            bildirim.extras.putAll(gecici.extras)
        }
    }
}
