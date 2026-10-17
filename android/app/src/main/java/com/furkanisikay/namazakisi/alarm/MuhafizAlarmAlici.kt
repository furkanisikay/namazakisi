package com.furkanisikay.namazakisi.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari.Karar
import com.furkanisikay.namazakisi.cekirdek.NafileKildimKurallari
import com.furkanisikay.namazakisi.kildim.KildimKuyrugu
import com.furkanisikay.namazakisi.kildim.NafileKildimKuyrugu
import com.furkanisikay.namazakisi.otomasyon.OtomasyonOlaylari
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Gerçek alarmın (issue #74) TEK alıcısı — dışa KAPALI (`exported=false`), açık bileşenle
 * çağrılır. Olaylar:
 *  - TETIK   : `setAlarmClock` çaldı → karar ([MuhafizAlarmKurallari.tetikKarari]) →
 *              çalan alarm ya da normal bildirim; çalıyorsa süre sonunda SUSTUR kurulur.
 *  - SUSTUR  : çalma süresi doldu → bildirim hâlâ duruyorsa sessiz NORMAL bildirime çevrilir.
 *  - KILDIM / ERTELE / KAPAT : bildirim düğmeleri (tam ekran etkinliği aynı gövdeyi çağırır).
 *  - BOOT_COMPLETED / MY_PACKAGE_REPLACED : kayıtlı alarmlar yeniden kurulur.
 *
 * İŞ ANA THREAD'DE YAPILMAZ (M3): "Kıldım" expo mağazasını okuyup yazar, widget'ı tazeler,
 * kuyruğu yazar — disk ve binder çağrıları ana thread'de ANR riskidir. `goAsync()` + tek
 * iş parçacıklı yürütücü (AnonsReceiver deseni):
 * pencere açıkken süreç ve alarm wakelock'u yaşar, `finish()` HER yolda çağrılır. Tek
 * iş parçacığı olayları sıraya koyar (TETIK ile hemen ardından gelen KILDIM yarışmaz).
 */
class MuhafizAlarmAlici : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val uygulama = context.applicationContext ?: context
        val sonuc = try {
            goAsync()
        } catch (_: Exception) {
            null
        }
        try {
            YURUTUCU.execute {
                try {
                    isle(uygulama, intent)
                } finally {
                    try {
                        sonuc?.finish()
                    } catch (_: Exception) {
                        // Pencere zaten kapanmışsa sorun değil.
                    }
                }
            }
        } catch (e: Exception) {
            // Yürütücü reddettiyse (olmamalı) aynı thread'de işle; yine finish et.
            Log.w(TAG, "Yurutucu reddetti, olay ana thread'de isleniyor", e)
            try {
                isle(uygulama, intent)
            } finally {
                try {
                    sonuc?.finish()
                } catch (_: Exception) {
                    // Yok sayılır.
                }
            }
        }
    }

    private fun isle(context: Context, intent: Intent) {
        try {
            when (intent.action) {
                MuhafizAlarmZamanlayici.EYLEM_TETIK -> tetik(context, intent)
                EYLEM_SUSTUR -> sustur(context, intent)
                EYLEM_KILDIM, EYLEM_ERTELE, EYLEM_KAPAT -> {
                    val ham = intent.getStringExtra(EK_YUK) ?: return
                    MuhafizAlarmEylemleri.uygula(context, intent.action ?: return, ham)
                }
                Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED -> {
                    val sayi = MuhafizAlarmZamanlayici.yenidenKur(context)
                    Log.i(TAG, "$sayi alarm yeniden kuruldu")
                }
            }
        } catch (e: Exception) {
            // Bir alıcı istisnası süreci çökertmemeli; en kötü durumda alarm çalmaz.
            Log.e(TAG, "Alarm olayi islenemedi: ${intent.action}", e)
        }
    }

    private fun tetik(context: Context, intent: Intent) {
        val kimlik = intent.data?.lastPathSegment ?: return
        val ham = MuhafizAlarmZamanlayici.yukAl(context, kimlik) ?: return
        MuhafizAlarmZamanlayici.kayittanCikar(context, kimlik)
        val yuk = MuhafizAlarmKurallari.yukCoz(ham) ?: return
        val simdi = System.currentTimeMillis()
        // M1: saat/widget/kutu/kısayol/otomasyon "Kıldım"ı kuyrukta bekliyor ama JS henüz
        // uyanmadıysa (Samsung uyku kısıtı) diskteki kılınmışlık kaydı YOKTUR — native
        // AsyncStorage'ı okumaz, kuyruk yeterli kanıttır.
        val kuyruktaKilindi = try {
            if (yuk.bilgi) {
                false
            } else if (yuk.nafileTuru != null) {
                // Nafile: kendi kuyruğunda bekliyorsa (bildirimden Kıldım, JS henüz uyanmadı).
                NafileKildimKuyrugu.bekliyorMu(context, NafileKildimKurallari.Nafile(yuk.tarih, yuk.nafileTuru))
            } else {
                MuhafizAlarmKurallari.kuyruktaKilindiMi(yuk.tarih, yuk.vakit, KildimKuyrugu.bekleyenKimlikler(context))
            }
        } catch (_: Exception) {
            false
        }
        val karar = MuhafizAlarmKurallari.tetikKarari(yuk.tetikMs, simdi, yuk.cikisMs, camiSessizBitisMs(context), kuyruktaKilindi)
        when (karar) {
            Karar.CAL -> {
                MuhafizAlarmBildirimi.calanGoster(context, yuk, ham, simdi)
                susturmayiKur(context, yuk.kimlik, ham, simdi + MuhafizAlarmKurallari.CALMA_SURESI_MS)
            }
            Karar.BILDIRIM -> MuhafizAlarmBildirimi.normalGoster(context, yuk, ham, sessiz = false)
            Karar.SESSIZ_BILDIRIM -> MuhafizAlarmBildirimi.normalGoster(context, yuk, ham, sessiz = true)
            Karar.ATLA -> Unit
        }
        // L4: alarm o tetiğin muhafız bildiriminin YERİNE geçtiği için "vakit çıkıyor"
        // otomasyon olayı (#278, normalde `KopruEtiketliBildirimServisi`'nde muhafız
        // bildirimi gösterilirken yayılır) burada yayılmalı — yoksa alarmlı adımda olay
        // hiç doğmaz. Kural (çıkışa ≤45 dk, vakit başına ilk) olayın kendi çekirdeğinde.
        // Nafile alarmı farz "vakit çıkıyor" olayı değildir.
        // Bilgi alarmı (cuma/camiye gitme/takvim) vakit girmeden çalar — "vakit çıkıyor" değildir.
        if (karar != Karar.ATLA && MuhafizAlarmKurallari.otomasyonOlayiDogarMi(yuk)) OtomasyonOlaylari.muhafizUyarisi(context, yuk.kimlik)
    }

    private fun sustur(context: Context, intent: Intent) {
        val ham = intent.getStringExtra(EK_YUK) ?: return
        val yuk = MuhafizAlarmKurallari.yukCoz(ham) ?: return
        // Kullanıcı bu arada Kıldım/Ertele/Kapat dediyse bildirim yoktur → dokunma.
        if (!MuhafizAlarmBildirimi.gosteriliyorMu(context, yuk.kimlik)) return
        // İptal ŞART: insistent ses ancak bildirim kalkınca kesin durur; ardından aynı
        // içerik sessiz NORMAL bildirim olarak kalır ("Kıldım" düğmesiyle birlikte).
        MuhafizAlarmBildirimi.kaldir(context, yuk.kimlik)
        MuhafizAlarmBildirimi.normalGoster(context, yuk, ham, sessiz = true)
    }

    companion object {
        private const val TAG = "MuhafizAlarm"

        const val EYLEM_SUSTUR = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_SUSTUR"
        const val EYLEM_KILDIM = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_KILDIM"
        const val EYLEM_ERTELE = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_ERTELE"
        const val EYLEM_KAPAT = "com.furkanisikay.namazakisi.MUHAFIZ_ALARM_KAPAT"
        const val EK_YUK = "yuk"

        /** Bütün alarm olaylarının tek sırası (süreç ömrü boyunca; iş yokken boşta bekler). */
        private val YURUTUCU: ExecutorService = Executors.newSingleThreadExecutor { r ->
            Thread(r, "MuhafizAlarm").apply { isDaemon = true }
        }

        /** Ad/anahtar `expo-cami-geofence` CamiDepo ile AYNI (modüller birbirini import etmez). */
        fun camiSessizBitisMs(context: Context): Long = try {
            context.getSharedPreferences("namazakisi_cami_durum", Context.MODE_PRIVATE).getLong("sessiz_bitis_ms", 0L)
        } catch (_: Exception) {
            0L
        }

        private fun susturmaIntenti(context: Context, kimlik: String, ham: String?): PendingIntent {
            val intent = Intent(context, MuhafizAlarmAlici::class.java)
                .setAction(EYLEM_SUSTUR)
                .setData(Uri.Builder().scheme("namazakisi-alarm").authority("sustur").appendPath(kimlik).build())
            if (ham != null) intent.putExtra(EK_YUK, ham)
            return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        /** Çalma süresinin sonuna tek seferlik susturma. Cihaz zaten uyanık; izin yoksa yaklaşık. */
        fun susturmayiKur(context: Context, kimlik: String, ham: String, anMs: Long) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val pi = susturmaIntenti(context, kimlik, ham)
            try {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
                } else {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
                }
            } catch (e: Exception) {
                // Emniyet ağı: bildirimin `setTimeoutAfter`'ı sesi yine bitirir.
                Log.w(TAG, "Susturma alarmi kurulamadi", e)
            }
        }

        fun susturmayiIptalEt(context: Context, kimlik: String) {
            try {
                (context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.cancel(susturmaIntenti(context, kimlik, null))
            } catch (_: Exception) {
                // Kurulu değilse sorun değil.
            }
        }
    }
}
