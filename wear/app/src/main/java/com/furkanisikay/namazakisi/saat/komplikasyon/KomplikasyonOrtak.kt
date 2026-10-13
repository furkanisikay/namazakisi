package com.furkanisikay.namazakisi.saat.komplikasyon

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.MonochromaticImage
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.SmallImage
import androidx.wear.watchface.complications.data.SmallImageType
import androidx.wear.watchface.complications.datasource.ComplicationDataTimeline
import androidx.wear.watchface.complications.datasource.TimeInterval
import androidx.wear.watchface.complications.datasource.TimelineEntry
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite
import java.time.Instant

/**
 * Komplikasyon servislerinin ortak parçaları (issue #281).
 *
 * Kadran yuvalarının bir kısmı (bazı Samsung stok kadranları) YALNIZ ikon kabul eder;
 * bu yüzden her vaktin kendi tek renkli simgesi vardır — ikon tek başına da "hangi
 * vakit sırada" sorusunu cevaplar.
 */
object KomplikasyonOrtak {
    fun vakitIkonu(vakit: String): Int = when (vakit) {
        "imsak" -> R.drawable.ic_vakit_imsak
        "gunes" -> R.drawable.ic_vakit_gunes
        "ogle" -> R.drawable.ic_vakit_ogle
        "ikindi" -> R.drawable.ic_vakit_ikindi
        "aksam" -> R.drawable.ic_vakit_aksam
        else -> R.drawable.ic_vakit
    }

    fun monokrom(context: Context, ikon: Int): MonochromaticImage =
        MonochromaticImage.Builder(Icon.createWithResource(context, ikon)).build()

    fun kucukIkon(context: Context, ikon: Int): SmallImage =
        SmallImage.Builder(Icon.createWithResource(context, ikon), SmallImageType.ICON).build()

    fun duz(metin: String): ComplicationText = PlainComplicationText.Builder(metin).build()

    /** Dokunuş uygulamayı açar (kıldım işaretleme orada / Bugün tile'ında). */
    fun uygulamayiAc(context: Context): PendingIntent = PendingIntent.getActivity(
        context, 0, Intent(context, AnaAktivite::class.java),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    /**
     * Her aralık AÇIK geçerlilikli bir girdidir; varsayılan "veri yok"tur. Çizelge
     * tükenirse (telefon günlerce veri göndermedi) yuva eski bir durumda donmaz, boşalır.
     * Girdinin verisi türü desteklemiyorsa da "veri yok"tur (zaman çizelgesi tüm
     * girdilerin aynı türde ya da NoData olmasını şart koşar).
     */
    fun cizelge(girdiler: List<Triple<Long, Long, ComplicationData?>>): ComplicationDataTimeline =
        ComplicationDataTimeline(
            NoDataComplicationData(),
            girdiler.map { (bas, bitis, veri) ->
                TimelineEntry(
                    TimeInterval(Instant.ofEpochMilli(bas), Instant.ofEpochMilli(bitis)),
                    veri ?: NoDataComplicationData(),
                )
            },
        )
}
