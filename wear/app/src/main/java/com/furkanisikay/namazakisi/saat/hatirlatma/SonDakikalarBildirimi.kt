package com.furkanisikay.namazakisi.saat.hatirlatma

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.wear.ongoing.OngoingActivity
import androidx.wear.ongoing.Status
import com.furkanisikay.namazakisi.saat.R
import android.os.Build
import android.os.Bundle
import com.furkanisikay.namazakisi.saat.cekirdek.CanliGosterim
import com.furkanisikay.namazakisi.saat.cekirdek.CanliIkon
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite

/**
 * "Son dakikalar" (issue #281): vaktin KILINMAMIŞ son penceresinde kadranda
 * dokunulabilir sayaç (Ongoing Activity). Pencere `SonDakikalar`'dan (saf) gelir.
 *
 * - Sayaç SİSTEM tarafından çizilir: bildirimde `setWhen` + geri sayan chronometer,
 *   Ongoing durumunda `TimerPart` (elapsedRealtime tabanı!). Saniyelik güncelleme YOK.
 * - Vakit bitince `setTimeoutAfter` bildirimi kendisi kaldırır (alarm gerekmez);
 *   kılınınca `Hatirlatici.tazele` → `guncelle` kaldırır.
 * - Kanal sessizdir (LOW): uyarıyı muhafız bildirimi zaten verdi, sayaç yalnız gösterir.
 *
 * Now Bar seçimi (issue #282 ikinci aşama): ne gösterileceğine `CanliGosterim` karar
 * verir — telefonla AYNI kullanıcı seçimi (vakit başına "son dakikalar" + iftar,
 * sahur, cuma, nafile, seri dilimleri), aynı anda TEK sayaç.
 *
 * Live Update: Wear OS 6 (API 36) ve sonrasında bildirime öne çıkarma isteği
 * (`android.requestPromotedOngoing`) eklenir; standart şablon + ongoing + başlık +
 * renklendirme yok + kanal MIN değil şartları zaten sağlanır.
 *
 * CİHAZDA DOĞRULANACAK: Galaxy Watch Now Bar'da ve kadrandaki Ongoing simgesinde
 * görünürlük (emülatörde Ongoing simgesi kadrana bağlı); Wear OS'un öne çıkarma
 * isteğini Now Bar'a taşıyıp taşımadığı DOĞRULANMADI (zararsız: desteklemeyen
 * sistem ekstrayı yok sayar).
 */
object SonDakikalarBildirimi {
    private const val KANAL = "son_dakikalar"
    private const val ETIKET = "son_dakikalar"
    private const val BILDIRIM_NO = 4802

    /** API 36 SDK'sında sabit olarak yok (telefondaki `CanliGuncelleme.kt` ile aynı dize). */
    private const val EKSTRA_ONE_CIKAR = "android.requestPromotedOngoing"
    private const val API_36 = 36

    /** Vakit dışı öğelerin VURGU RENGİ: o öğenin bağlı olduğu vakit (ikon `CanliIkon`'dan). */
    private val OGE_RENK_VAKTI = mapOf(
        "iftar" to "aksam",
        "sahur" to "imsak",
        "cuma" to "ogle",
        "kusluk" to "gunes",
        "evvabin" to "aksam",
        "teheccud" to "yatsi",
        "seri" to "yatsi",
    )

    fun guncelle(context: Context, yuk: Yuk?, bekleyen: Set<String>, simdi: Long) {
        val pencere = CanliGosterim.aktif(yuk, bekleyen, simdi, context.getString(R.string.dil_kodu))
        if (pencere == null || !MuhafizBildirimci.bildirimIzniVar(context)) {
            kaldir(context)
            return
        }
        goster(context, pencere, simdi)
    }

    fun kaldir(context: Context) {
        NotificationManagerCompat.from(context).cancel(ETIKET, BILDIRIM_NO)
    }

    private fun vurguRengi(p: CanliGosterim.Gosterim): Long =
        if (p.sonDakikalar) SaatPaleti.ACIL else SaatPaleti.vakitRengi(p.vakit ?: OGE_RENK_VAKTI[p.oge])

    private fun kanaliGarantile(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        val ad = context.getString(R.string.son_dakikalar_kanal_adi)
        val aciklama = context.getString(R.string.son_dakikalar_kanal_aciklama)
        // Var olan kanalda yalnız ad/açıklama (cihaz dili değişince) güncellenir.
        val mevcut = nm.getNotificationChannel(KANAL)
        if (mevcut != null && mevcut.name?.toString() == ad && mevcut.description == aciklama) return
        nm.createNotificationChannel(
            NotificationChannel(KANAL, ad, NotificationManager.IMPORTANCE_LOW).apply {
                description = aciklama
                enableVibration(false)
                setSound(null, null)
            }
        )
    }

    private fun goster(context: Context, p: CanliGosterim.Gosterim, simdi: Long) {
        kanaliGarantile(context)
        // İkon TEK BAŞINA anlam taşır (Now Bar saatte önce yalnız ikonla görünür): çıkan
        // vakitte vaktin simgesi + kum saati, cuma cami, seri alev… (`CanliIkon`, JVM testli).
        val ikon = KomplikasyonOrtak.canliIkonu(CanliIkon.anahtar(p.oge, p.vakit, p.sonDakikalar))
        val ac = PendingIntent.getActivity(
            context, 0, Intent(context, AnaAktivite::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val baslik = p.baslik
        // Saate hal eki EKLENMEZ ("17:43'te" okunuşa göre değişir) — AGENTS.md.
        val govde = context.getString(
            if (p.sonDakikalar) R.string.son_dakikalar_cikis else R.string.son_dakikalar_bitis,
            VakitHesabi.saat(p.bitis),
        )
        val bildirim = NotificationCompat.Builder(context, KANAL)
            .setSmallIcon(ikon)
            // Vurgu rengi: son dakikalarda acil tonu (ana ekrandaki son-dakika rengiyle aynı),
            // değilse vaktin tonu (SaatPaleti). Sistem simgeyi bu renkle boyayabilir — gri
            // zeminde gri simge kalmasın. Renklendirme (setColorized) YOK: Live Update şartı.
            .setColor(SaatPaleti.int(vurguRengi(p)))
            .setContentTitle(baslik)
            .setContentText(govde)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setLocalOnly(true)
            .setWhen(p.bitis)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setTimeoutAfter((p.bitis - simdi).coerceAtLeast(1L))
            .setContentIntent(ac)
        // Live Update (issue #282): Wear OS 6+ (API 36) öne çıkarma isteği.
        if (Build.VERSION.SDK_INT >= API_36) {
            bildirim.addExtras(Bundle().apply { putBoolean(EKSTRA_ONE_CIKAR, true) })
        }
        if (p.tarih != null && p.vakit != null) {
            val kildim = PendingIntent.getBroadcast(
                context,
                "son_${p.tarih}_${p.vakit}".hashCode(),
                Intent(context, KildimAlicisi::class.java)
                    .putExtra(KildimAlicisi.TARIH, p.tarih)
                    .putExtra(KildimAlicisi.VAKIT, p.vakit),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            // Buton etiketi (arayüz) — muhafız bildirimindeki "Kıldım" ile aynı.
            bildirim.addAction(0, context.getString(R.string.kildim), kildim)
        }

        // Ongoing zaman damgaları elapsedRealtime tabanındadır (duvar saati DEĞİL).
        val sifirAni = SystemClock.elapsedRealtime() + (p.bitis - System.currentTimeMillis())
        val durum = Status.Builder()
            .addTemplate("#vakit# · #kalan#")
            .addPart("vakit", Status.TextPart(p.ad))
            .addPart("kalan", Status.TimerPart(sifirAni))
            .build()
        OngoingActivity.Builder(context, ETIKET, BILDIRIM_NO, bildirim)
            .setStaticIcon(ikon)
            .setTouchIntent(ac)
            .setStatus(durum)
            .setTitle(baslik)
            .setContentDescription(
                context.getString(
                    if (p.sonDakikalar) R.string.son_dakikalar_cikis_erisim else R.string.son_dakikalar_kalan_erisim,
                    p.ad,
                )
            )
            .build()
            .apply(context)
        try {
            NotificationManagerCompat.from(context).notify(ETIKET, BILDIRIM_NO, bildirim.build())
        } catch (_: SecurityException) {
            // İzin tam bu arada geri alındıysa sessizce geç.
        }
    }
}
