package com.furkanisikay.namazakisi.alarm

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.BildirimKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari
import com.furkanisikay.namazakisi.cekirdek.NafileKildimKurallari
import com.furkanisikay.namazakisi.kildim.NafileKildimIsleyici
import com.furkanisikay.namazakisi.kildim.BildirimErteleIsleyici
import com.furkanisikay.namazakisi.kildim.BildirimKildimIsleyici
import com.furkanisikay.namazakisi.kildim.KildimKuyrugu
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import expo.modules.notifications.service.delegates.ExpoSchedulingDelegate

/**
 * Alarm düğmelerinin (bildirim + tam ekran etkinliği) ORTAK gövdesi (issue #74).
 *
 * "Kıldım" ve "Ertele" YENİ BİR YOL KURMAZ: bildirimdeki eylemlerin native işleyicilerine
 * (#299 `BildirimKildimIsleyici`, #289 `BildirimErteleIsleyici`) devreder — vaktin kalan
 * planı (expo tetikleri, TTS anonsları, diğer alarmlar) aynı kurallarla iptal edilir,
 * kayıt aynı kuyruktan yazılır, JS aynı yoldan haber alır. Expo zamanlayıcısı
 * `NotificationsService` dışında `ExpoSchedulingDelegate(context)` ile kullanılır
 * (aynı mağaza + aynı alarm intent'i).
 */
object MuhafizAlarmEylemleri {
    private const val TAG = "MuhafizAlarm"
    private const val ERTELEME_DK = 10L

    fun uygula(context: Context, eylem: String, hamYuk: String) {
        val yuk = MuhafizAlarmKurallari.yukCoz(hamYuk) ?: return
        // Her eylemde ilk iş sesi kesmek: bildirim kalkınca insistent ses durur.
        MuhafizAlarmBildirimi.kaldir(context, yuk.kimlik)
        MuhafizAlarmAlici.susturmayiIptalEt(context, yuk.kimlik)
        when (eylem) {
            MuhafizAlarmAlici.EYLEM_KILDIM -> kildim(context, yuk)
            MuhafizAlarmAlici.EYLEM_ERTELE -> ertele(context, yuk)
            MuhafizAlarmAlici.EYLEM_KAPAT -> Unit // Yalnız susar; vaktin planı sürer.
        }
    }

    private fun kildim(context: Context, yuk: MuhafizAlarmKurallari.Yuk) {
        // NAFİLE alarmı (issue #74 + #273): kendi kuyruğu, kendi iptalleri — FARZ ASLA.
        val nafile = yuk.nafileTuru?.let { NafileKildimKurallari.Nafile(yuk.tarih, it) }
        if (nafile != null) {
            val islendi = try {
                NafileKildimIsleyici.nafileIsle(context, nafile, ExpoSchedulingDelegate(context))
            } catch (e: Exception) {
                Log.w(TAG, "Nafile Kildim native islenemedi", e)
                false
            }
            if (!islendi) Log.w(TAG, "Nafile Kildim kuyruga yazilamadi (${yuk.kimlik})")
            return
        }
        val vakit = BildirimKildimKurallari.vakitCoz(yuk.kimlik) ?: return
        val islendi = try {
            BildirimKildimIsleyici.vakitIsle(context, vakit, ExpoSchedulingDelegate(context))
        } catch (e: Exception) {
            Log.w(TAG, "Kildim native islenemedi", e)
            false
        }
        if (!islendi) {
            // Yedek: en azından kayıt kuyruğa düşsün; plan JS'in sonraki turunda temizlenir.
            if (KildimKuyrugu.ekle(context, vakit.tarih, vakit.vakit, KildimKuyruguKurallari.KAYNAK_BILDIRIM)) {
                KildimKuyrugu.jsUyandir(context)
            }
        }
    }

    private fun ertele(context: Context, yuk: MuhafizAlarmKurallari.Yuk) {
        // Nafile ertelenmez: düğme zaten çizilmez (sınır 0); eski/elle gelen yayına karşı kapı.
        if (yuk.nafileTuru != null) return
        try {
            BildirimErteleIsleyici.alarmdanErtele(
                context,
                ExpoSchedulingDelegate(context),
                yuk.kimlik,
                ERTELEME_DK,
                yuk.baslik,
                yuk.metin,
                yuk.veri,
                yuk.kanalId,
                yuk.seviye,
            )
        } catch (e: Exception) {
            Log.w(TAG, "Alarm ertelenemedi", e)
        }
    }
}
