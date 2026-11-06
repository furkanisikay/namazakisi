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
import com.furkanisikay.namazakisi.saat.ui.yerelRakamla

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
        "yatsi" -> R.drawable.ic_vakit_yatsi
        else -> R.drawable.ic_vakit
    }

    /**
     * `CanliIkon` anahtarı → simge (canlı sayaç, Now Bar, muhafız bildirimi). Açık eşleme
     * (`getIdentifier` DEĞİL: kaynak küçültme adla aranan simgeyi silebilir). Her anahtarın
     * dosyası `CanliIkonTest.herAnahtarinDrawableDosyasiVar` ile korunur.
     */
    fun canliIkonu(anahtar: String): Int = when (anahtar) {
        "cikiyor_imsak" -> R.drawable.ic_cikiyor_imsak
        "cikiyor_ogle" -> R.drawable.ic_cikiyor_ogle
        "cikiyor_ikindi" -> R.drawable.ic_cikiyor_ikindi
        "cikiyor_aksam" -> R.drawable.ic_cikiyor_aksam
        "cikiyor_yatsi" -> R.drawable.ic_cikiyor_yatsi
        "cami" -> R.drawable.ic_cami
        "seri" -> R.drawable.ic_seri
        "teheccud" -> R.drawable.ic_teheccud
        else -> vakitIkonu(anahtar.removePrefix("vakit_"))
    }

    fun monokrom(context: Context, ikon: Int): MonochromaticImage =
        MonochromaticImage.Builder(Icon.createWithResource(context, ikon)).build()

    fun kucukIkon(context: Context, ikon: Int): SmallImage =
        SmallImage.Builder(Icon.createWithResource(context, ikon), SmallImageType.ICON).build()

    /**
     * Düz komplikasyon metni — kadrana giden HER düz metnin tek kapısı. Rakamlar cihaz yerel
     * ayarının rakamıyla yazılır (ar-SA'da "١٥:٤٢", `cekirdek/Rakam.kt`); Context uzantısıdır,
     * servisler içinden `duz(…)` diye çağrılır. `TimeDifferenceComplicationText` sistemce
     * (yerel ayarla) çizilir, buradan geçmez.
     */
    fun Context.duz(metin: String): ComplicationText = PlainComplicationText.Builder(yerelRakamla(metin)).build()

    /** Dokunuş uygulamayı açar (kıldım işaretleme orada / Bugün tile'ında). */
    fun uygulamayiAc(context: Context): PendingIntent = PendingIntent.getActivity(
        context, 0, Intent(context, AnaAktivite::class.java),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
}
