package com.furkanisikay.namazakisi.saat.komplikasyon

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import androidx.wear.watchface.complications.datasource.ComplicationDataTimeline
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingTimelineComplicationDataSourceService
import androidx.wear.watchface.complications.datasource.TimeInterval
import androidx.wear.watchface.complications.datasource.TimelineEntry
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.ZamanCizelgesi
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import java.time.Instant
import java.util.concurrent.TimeUnit

/**
 * Kadran komplikasyonu (issue #269): sıradaki vakit + CANLI geri sayım.
 *
 * Geri sayım `TimeDifferenceComplicationText` ile SİSTEM tarafından çizilir —
 * uygulama her dakika uyanmaz. Vakit sınırlarında zaman çizelgesi bir sonraki
 * girdiye geçer. RANGED_VALUE ilerlemesi girdiler arasında statiktir (dinamik
 * değer API 34+; bilinçli bedel).
 */
class VakitKomplikasyonServisi : SuspendingTimelineComplicationDataSourceService() {

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationDataTimeline? {
        val yuk = YukDeposu(this).yuk()
        val simdi = System.currentTimeMillis()
        val araliklar = if (yuk == null) emptyList() else ZamanCizelgesi.araliklar(yuk, simdi)
        // Her aralık AÇIK geçerlilikli bir girdidir; varsayılan "veri yok"tur. Böylece
        // çizelge tükenirse (telefon günlerce veri göndermedi) komplikasyon geçmiş
        // bir geri sayımda donup "0 dk" göstermez, boşalır.
        val girdiler = araliklar.map { a ->
            TimelineEntry(
                TimeInterval(Instant.ofEpochMilli(a.baslangic), Instant.ofEpochMilli(a.bitis)),
                veri(request.complicationType, a, a.baslangic) ?: NoDataComplicationData(),
            )
        }
        return ComplicationDataTimeline(NoDataComplicationData(), girdiler)
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        val ornek = ZamanCizelgesi.Aralik(
            simdi,
            simdi + 72 * 60_000L,
            VakitHesabi.VakitAni("", "ikindi", simdi + 72 * 60_000L),
            VakitHesabi.VakitAni("", "ogle", simdi - 60 * 60_000L),
        )
        return veri(type, ornek, simdi)
    }

    private fun veri(tur: ComplicationType, a: ZamanCizelgesi.Aralik, an: Long): ComplicationData? {
        val geriSayim = TimeDifferenceComplicationText.Builder(
            TimeDifferenceStyle.SHORT_DUAL_UNIT,
            CountDownTimeReference(Instant.ofEpochMilli(a.siradaki.ms)),
        ).setMinimumTimeUnit(TimeUnit.MINUTES).build()
        val aciklama = duz("Sıradaki vakit ${a.siradaki.ad}, ${VakitHesabi.saat(a.siradaki.ms)}")
        val dokunus = PendingIntent.getActivity(
            this, 0, Intent(this, AnaAktivite::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(geriSayim, aciklama)
                    .setTitle(duz(a.siradaki.ad))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(geriSayim, aciklama)
                    .setTitle(duz("${a.siradaki.ad} ${VakitHesabi.saat(a.siradaki.ms)}"))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.RANGED_VALUE -> {
                val bas = a.onceki?.ms ?: a.baslangic
                val uzunluk = (a.siradaki.ms - bas).coerceAtLeast(1L).toFloat()
                val deger = ((an - bas) / uzunluk).coerceIn(0f, 1f)
                RangedValueComplicationData.Builder(deger, 0f, 1f, aciklama)
                    .setText(geriSayim)
                    .setTitle(duz(a.siradaki.ad))
                    .setTapAction(dokunus)
                    .build()
            }
            else -> null
        }
    }

    private fun duz(metin: String): ComplicationText = PlainComplicationText.Builder(metin).build()
}
