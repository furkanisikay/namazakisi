package com.furkanisikay.namazakisi.alarm

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.BildirimKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari
import com.furkanisikay.namazakisi.cekirdek.NafileKildimKurallari
import com.furkanisikay.namazakisi.kildim.NafileKildimIsleyici
import com.furkanisikay.namazakisi.kildim.BildirimKildimIsleyici
import com.furkanisikay.namazakisi.kildim.KildimKuyrugu
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.wear.SaatUyandirmaHaberi
import expo.modules.notifications.service.delegates.ExpoSchedulingDelegate

/**
 * Alarm düğmelerinin (bildirim + tam ekran etkinliği) ORTAK gövdesi (issue #74).
 *
 * "Kıldım" YENİ BİR YOL KURMAZ: bildirimdeki eylemin native işleyicisine
 * (#299 `BildirimKildimIsleyici`) devreder — vaktin kalan
 * planı (expo tetikleri, TTS anonsları, diğer alarmlar) aynı kurallarla iptal edilir,
 * kayıt aynı kuyruktan yazılır, JS aynı yoldan haber alır. Expo zamanlayıcısı
 * `NotificationsService` dışında `ExpoSchedulingDelegate(context)` ile kullanılır
 * (aynı mağaza + aynı alarm intent'i).
 */
object MuhafizAlarmEylemleri {
    private const val TAG = "MuhafizAlarm"

    fun uygula(context: Context, eylem: String, hamYuk: String) {
        val yuk = MuhafizAlarmKurallari.yukCoz(hamYuk) ?: return
        // Her eylemde ilk iş sesi kesmek: bildirim kalkınca insistent ses durur.
        MuhafizAlarmBildirimi.kaldir(context, yuk.kimlik)
        MuhafizAlarmAlici.susturmayiIptalEt(context, yuk.kimlik)
        // Saat W3: bu bir uyandırmaysa saatteki titreşim de dursun (saatte kapatınca
        // telefon yedeğinin iptaliyle simetrik). Uyandırma değilse hiçbir şey yapmaz.
        try {
            SaatUyandirmaHaberi.telefondaKapandi(context, yuk.kimlik)
        } catch (e: Exception) {
            Log.w(TAG, "Saate haber verilemedi", e)
        }
        when (eylem) {
            MuhafizAlarmAlici.EYLEM_KILDIM -> kildim(context, yuk)
            // ERTELE YOK (sahip kararı 2026-10-19): eski bildirimin "Ertele"si yalnız susturur.
            MuhafizAlarmAlici.EYLEM_KAPAT, MuhafizAlarmAlici.ESKI_EYLEM_ERTELE -> Unit // Yalnız susar; vaktin planı sürer.
        }
    }

    private fun kildim(context: Context, yuk: MuhafizAlarmKurallari.Yuk) {
        // Bilgi alarmı (cuma/camiye gitme/takvim): düğme çizilmez; eski/elle gelen yayına
        // karşı kapı — FARZ öğle ASLA yazılmaz.
        if (!MuhafizAlarmKurallari.kildimDugmesiVarMi(yuk)) return
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
}
