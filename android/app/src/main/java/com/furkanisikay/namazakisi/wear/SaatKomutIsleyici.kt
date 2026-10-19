package com.furkanisikay.namazakisi.wear

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.util.Log
import com.furkanisikay.namazakisi.alarm.MuhafizAlarmTemizligi
import com.furkanisikay.namazakisi.cekirdek.NafileKildimKurallari
import com.furkanisikay.namazakisi.cekirdek.SaatKomutKurallari
import com.furkanisikay.namazakisi.kildim.NafileKildimIsleyici
import expo.modules.camigeofence.CamiDepo
import expo.modules.camigeofence.CamiDurumu
import expo.modules.camigeofence.CamiEylemAlicisi
import expo.modules.camigeofence.NamazModu
import expo.modules.countdownnotification.AnonsZamanlayici
import expo.modules.notifications.service.delegates.ExpoSchedulingDelegate
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Saatten gelen KOMUTLAR (saat W3) — `WearDinleyiciServisi.onRequest`'ten çağrılır,
 * cevap aynı turda saate döner (saat sessiz başarısızlık göstermez).
 *
 * Yeni yol AÇILMAZ, var olan native gövdeler çağrılır:
 *  - Namaz modu → `NamazModu.ac(…, "saat", …)` (bitiş KENETLİ, 180 dk tavanı, süresiz yok)
 *    ve kapatma → `CamiEylemAlicisi.MODU_KAPAT` (bildirimdeki "Modu kapat" ile aynı gövde).
 *  - Camideyim cevabı → `CamiDurumu.soruyuKabulEt/Reddet`, `CAMI_DEGIL` (tek doğru kaynak
 *    `CamiDepo`; saat kopya tutmaz).
 *  - Uyandırma kapandı → cevap `SaatUyandirmaDeposu`'na yazılır (JS turu ona uyar) ve
 *    telefondaki YEDEK tam kimlikle iptal edilir; teheccüd "Kıldım"ı
 *    `NafileKildimIsleyici` (FARZ YAZMAZ). ERTELE YOK (sahip kararı 2026-10-19): eski
 *    saatin `ertele`'si yalnız "tamam" alır — yedek planlandığı anında çalar.
 *    Sabahın "Kıldım"ı saatten olağan farz yolundan (DataItem kuyruğu) ayrıca gelir.
 * Kurallar SAF `SaatKomutKurallari`'nda. Asla fırlatmaz.
 */
object SaatKomutIsleyici {
    private const val TAG = "SaatKomut"

    fun isle(context: Context, yol: String, veri: ByteArray?): String {
        val ctx = context.applicationContext
        val metin = veri?.toString(Charsets.UTF_8)
        return try {
            when (yol) {
                SaatKomutKurallari.NAMAZ_MODU_YOLU -> namazModu(ctx, metin)
                SaatKomutKurallari.CAMI_CEVAP_YOLU -> camiCevabi(ctx, metin)
                SaatKomutKurallari.UYANDIRMA_KAPANDI_YOLU -> uyandirmaKapandi(ctx, metin)
                else -> SaatKomutKurallari.cevap("gecersiz")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Saat komutu islenemedi: $yol", e)
            SaatKomutKurallari.cevap("hata")
        }
    }

    private fun namazModu(ctx: Context, metin: String?): String {
        val simdi = System.currentTimeMillis()
        val gun = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(simdi))
        val istek = SaatKomutKurallari.namazModuIstegi(metin, simdi, gun) ?: return SaatKomutKurallari.cevap("gecersiz")
        if (!istek.ac) {
            // Elle kapatma: bu turlarda otomatik yeniden açılmaz; camideyken bildirim de güncellenir.
            ctx.sendBroadcast(Intent(ctx, CamiEylemAlicisi::class.java).setAction(CamiEylemAlicisi.MODU_KAPAT))
            return SaatKomutKurallari.cevap("kapandi")
        }
        val sonuc = NamazModu.ac(ctx, SaatKomutKurallari.KAYNAK, istek.tur, istek.bitisMs, kullaniciIstegi = true)
        // Bitişte KENDİLİĞİNDEN kapansın (inceleme bulgusu 3): bu kaynağın başka zamanlaması yok.
        if (sonuc == "acildi") SaatKomutKurallari.kapanisAlarmiMs(istek)?.let { NamazModu.kapanisAlarmiKur(ctx, it) }
        return SaatKomutKurallari.cevap(sonuc, if (sonuc == "acildi") NamazModu.aktifBitisMs(ctx) else null)
    }

    private fun camiCevabi(ctx: Context, metin: String?): String {
        val c = SaatKomutKurallari.camiCevabi(metin) ?: return SaatKomutKurallari.cevap("gecersiz")
        val soru = CamiDepo.soru(ctx)
        val camide = CamiDepo.camide(ctx)
        // Bayat cevap (soru düştü, başka yere geçildi) uygulanmaz.
        return when (c.cevap) {
            "evet" -> if (soru?.yer?.id == c.yerId && CamiDurumu.soruyuKabulEt(ctx)) tamam() else gecersiz()
            "hayir" -> if (soru?.yer?.id == c.yerId) { CamiDurumu.soruyuReddet(ctx); tamam() } else gecersiz()
            else -> {
                val ad = when {
                    camide != null && camide.yerId == c.yerId -> camide.ad
                    soru != null && soru.yer.id == c.yerId -> soru.yer.ad
                    else -> return gecersiz()
                }
                ctx.sendBroadcast(
                    Intent(ctx, CamiEylemAlicisi::class.java)
                        .setAction(CamiEylemAlicisi.CAMI_DEGIL)
                        .putExtra(CamiEylemAlicisi.EK_YER, c.yerId)
                        .putExtra(CamiEylemAlicisi.EK_AD, ad),
                )
                tamam()
            }
        }
    }

    private fun uyandirmaKapandi(ctx: Context, metin: String?): String {
        val u = SaatKomutKurallari.uyandirmaIstegi(metin) ?: return SaatKomutKurallari.cevap("gecersiz")
        // Eski saatin "10 dk ertele"si (göç): saatte susturuldu ama kişi uyandığını onaylamadı
        // → telefon yedeği planlandığı gibi çalsın; ne depoya yazılır ne yedek taşınır/silinir.
        if (u.eskiErtele) return tamam()
        // Cevap ÖNCE kalıcılaşır: JS planlama turu yedeği bu kayda göre kurar (kapatılanı
        // yeniden kurmaz). Yazılamazsa tur yedeği bir kez daha kurabilir — sessiz kayıp
        // değil, fazladan uyarı.
        try {
            SaatUyandirmaDeposu.yaz(ctx, u)
        } catch (e: Exception) {
            Log.w(TAG, "Uyandirma cevabi kaydedilemedi", e)
        }
        if (u.islem == "kildim" && u.nafile) {
            NafileKildimKurallari.nafileCoz(u.id)?.let { NafileKildimIsleyici.nafileIsle(ctx, it, ExpoSchedulingDelegate(ctx)) }
        }
        yedegiIptalEt(ctx, u.id)
        return tamam()
    }

    /**
     * Telefondaki yedek (gecikmeli) uyandırma — üç biçimden biri olabilir: gerçek alarm
     * (#74), expo bildirimi ya da TTS anons alarmı; "ikisi" seçiliyse o an ÇALIYOR da
     * olabilir. Hepsi TAM kimlikle, her biri kendi try'ında.
     */
    private fun yedegiIptalEt(ctx: Context, id: String) {
        try {
            MuhafizAlarmTemizligi.kimlikSustur(ctx, id)
        } catch (e: Exception) {
            Log.w(TAG, "Yedek alarm susturulamadi", e)
        }
        try {
            KopruEtiketliBildirimServisi.eskiExpoTetiginiIptalEt(ctx, id)
            ExpoSchedulingDelegate(ctx).removeScheduledNotifications(listOf(id))
        } catch (e: Exception) {
            Log.w(TAG, "Yedek bildirim iptal edilemedi", e)
        }
        try {
            AnonsZamanlayici.eslesenleriIptalEt(ctx) { it == id }
        } catch (e: Exception) {
            Log.w(TAG, "Yedek anons iptal edilemedi", e)
        }
        gosterileniKaldir(ctx, id)
    }

    private fun gosterileniKaldir(ctx: Context, id: String) {
        try {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            nm?.activeNotifications?.filter { it.tag == id }?.forEach { nm.cancel(it.tag, it.id) }
        } catch (e: Exception) {
            Log.w(TAG, "Gosterilen yedek kaldirilamadi", e)
        }
    }

    private fun tamam() = SaatKomutKurallari.cevap("tamam")
    private fun gecersiz() = SaatKomutKurallari.cevap("gecersiz")
}
