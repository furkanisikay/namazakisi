package com.furkanisikay.namazakisi.kildim

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.NafileKildimKurallari
import com.furkanisikay.namazakisi.wear.KopruEtiketliBildirimServisi
import expo.modules.countdownnotification.AnonsZamanlayici
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.interfaces.SchedulingDelegate

/**
 * Nafile bildirimindeki "Kıldım" — NATIVE ilk adım (issue #273; muhafızın #299 ikizi,
 * `BildirimKildimIsleyici`).
 *
 * Eskiden yanıt yalnız JS'e gidiyordu (`BildirimServisi.yanitiIsle` → `tip:'nafile'`).
 * Samsung uyku kısıtında headless görev dakikalarca gecikebiliyor, bu arada o nafilenin
 * kalan hatırlatmaları ve sesli anonsu çalmaya DEVAM ediyordu. Artık JS'i beklemeden:
 *  1. öğeyi `NafileKildimKuyrugu`'na yazar (FARZ kuyruğuna DEĞİL — nafile kaydı/puanı
 *     yoktur; JS yalnız `NAFILE_KILINAN` susturma hafızasını yazar);
 *  2. o günün o nafilesinin bekleyen expo tetiklerini (+ güncelleme öncesi eski
 *     bileşenli tetik) ve TTS anons alarmlarını iptal eder;
 *  3. gösterilen bildirimlerini kaldırır;
 *  4. JS'i uyandırır (farz kuyruğuyla aynı yol; JS iki kuyruğu birlikte boşaltır).
 *
 * Her adım kendi try/catch'indedir. Kuyruğa yazılamadıysa `false` döner ve çağıran
 * expo'nun olağan yoluna (JS `kildimIsle`) düşer — susturma kaybolmaz. İşlenen eylemde
 * `super` ÇAĞRILMAZ (yanıt JS'e ayrıca gitmez → çift işleme yok).
 */
object NafileKildimIsleyici {
    private const val TAG = "NafileKildim"

    /** @return yanıt burada işlendiyse true (expo'nun olağan yanıt yolu ÇAĞRILMAMALI). */
    fun isle(context: Context, intent: Intent, zamanlama: SchedulingDelegate): Boolean {
        val nafile = try {
            val yanit = NotificationsService.getNotificationResponseFromBroadcastIntent(intent)
            NafileKildimKurallari.kildimYaniti(
                yanit.actionIdentifier,
                yanit.notification?.notificationRequest?.identifier,
            )
        } catch (_: Exception) {
            null
        } ?: return false
        return nafileIsle(context, nafile, zamanlama)
    }

    private fun nafileIsle(context: Context, n: NafileKildimKurallari.Nafile, zamanlama: SchedulingDelegate): Boolean {
        val yazildi = try {
            NafileKildimKuyrugu.ekle(context, n)
        } catch (e: Exception) {
            Log.w(TAG, "Nafile kuyruga yazilamadi; JS yolu isleyecek", e)
            false
        }
        if (!yazildi) return false
        tetikleriIptalEt(context, n, zamanlama)
        anonslariIptalEt(context, n)
        gosterilenleriKaldir(context, n)
        KildimKuyrugu.jsUyandir(context)
        return true
    }

    private fun tetikleriIptalEt(context: Context, n: NafileKildimKurallari.Nafile, zamanlama: SchedulingDelegate) {
        try {
            val kimlikler = NafileKildimKurallari.iptalEdilecekler(
                zamanlama.getAllScheduledNotifications().map { it.identifier },
                n,
            )
            if (kimlikler.isEmpty()) return
            kimlikler.forEach { KopruEtiketliBildirimServisi.eskiExpoTetiginiIptalEt(context, it) }
            zamanlama.removeScheduledNotifications(kimlikler)
        } catch (e: Exception) {
            Log.w(TAG, "Nafile tetikleri iptal edilemedi; JS kuyrugu tamamlayacak", e)
        }
    }

    private fun anonslariIptalEt(context: Context, n: NafileKildimKurallari.Nafile) {
        try {
            AnonsZamanlayici.eslesenleriIptalEt(context) { NafileKildimKurallari.buNafileyeAitMi(it, n) }
        } catch (e: Exception) {
            Log.w(TAG, "Nafile anons alarmlari iptal edilemedi", e)
        }
    }

    /** expo bildirimi etiket = kimlik ile gösterir. */
    private fun gosterilenleriKaldir(context: Context, n: NafileKildimKurallari.Nafile) {
        try {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            nm.activeNotifications
                .filter { sbn -> sbn.tag?.let { NafileKildimKurallari.buNafileyeAitMi(it, n) } == true }
                .forEach { sbn -> nm.cancel(sbn.tag, sbn.id) }
        } catch (e: Exception) {
            Log.w(TAG, "Gosterilen nafile bildirimleri kaldirilamadi", e)
        }
    }
}
