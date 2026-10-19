package com.furkanisikay.namazakisi.kildim

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.MuhafizPlanKimligi
import expo.modules.notifications.service.NotificationsService

/**
 * ERTELE YOK (sahip kararı 2026-10-19, eski #289): muhafızın amacı erteleme alışkanlığını
 * önlemektir — erteleyen kişi unutur, son dakikada abdest/mescit yetişmez.
 *
 * Bu nesne YALNIZ GÖÇ içindir: güncelleme ÖNCESİ gösterilmiş bir bildirimde hâlâ "10 dk
 * ertele" düğmesi durabilir. Basılırsa erteleme KURULMAZ, namaz işaretlenmez; yalnız o
 * bildirim kapanır ve yanıt JS'e iletilmez (`super` çağrılmaz). Vaktin planı aynen sürer.
 */
object EskiErteleYaniti {
    private const val TAG = "EskiErtele"

    /** @return eski ertele eylemiyse true (işlendi; expo'nun olağan yolu ÇAĞRILMAMALI). */
    fun isle(context: Context, intent: Intent): Boolean {
        val (eylem, kimlik) = try {
            val yanit = NotificationsService.getNotificationResponseFromBroadcastIntent(intent)
            yanit.actionIdentifier to yanit.notification?.notificationRequest?.identifier
        } catch (_: Exception) {
            return false
        }
        if (!MuhafizPlanKimligi.eskiErteleEylemiMi(eylem)) return false
        if (kimlik != null) {
            try {
                val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                // expo bildirimi etiket = kimlik ile gösterir (`ExpoPresentationDelegate.notify(tag, id)`).
                if (nm != null) {
                    nm.activeNotifications
                        .filter { it.tag == kimlik }
                        .forEach { nm.cancel(it.tag, it.id) }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Eski ertele bildirimi kapatilamadi", e)
            }
        }
        return true
    }
}
