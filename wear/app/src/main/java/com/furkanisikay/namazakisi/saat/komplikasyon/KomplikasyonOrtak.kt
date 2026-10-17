package com.furkanisikay.namazakisi.saat.komplikasyon

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.MonochromaticImage
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.SmallImage
import androidx.wear.watchface.complications.data.SmallImageType
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.ui.AnaAktivite

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
}
