package com.furkanisikay.namazakisi.saat.komplikasyon

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.MonochromaticImageComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.SmallImageComplicationData
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.Kible
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.ui.KibleAktivite
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import kotlin.math.roundToInt

/**
 * Kıble komplikasyonu (saat yenileme W2): kadrandan tek dokunuşla pusula.
 *
 * SHORT_TEXT "151°" + başlık "Kıble" = KUZEYE GÖRE STATİK açı (yalan değildir: derece
 * gerçek kuzeyden ölçülür). Dönen ok ÇİZİLMEZ — komplikasyon sensör okuyamaz; yön
 * gösteriyormuş gibi bir ok kullanıcıyı yanıltırdı. MONOCHROMATIC_IMAGE / SMALL_IMAGE
 * yalnız ikon yuvaları içindir (statik pusula simgesi). Değer yalnız konumla değişir:
 * zaman çizelgesi YOK, varsayılan = gerçek veri (`GuvenliKomplikasyonServisi` tür kuralı:
 * her desteklenen tür için istenen TÜRDE veri). Yeni yük gelince `Senkron.yuzeyleriTazele`.
 */
class KibleKomplikasyonServisi : GuvenliKomplikasyonServisi() {

    override fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>> = emptyList()

    override fun varsayilan(tur: ComplicationType): ComplicationData? {
        val yuk = YukDeposu(this).yuk()
        val aci = yuk?.konum?.let { (Kible.aci(it.lat, it.lng).roundToInt()) % 360 }
        return veri(tur, aci, yuk?.konumAdi)
    }

    override fun onizleme(type: ComplicationType): ComplicationData? = veri(type, 152, "Fatih, İstanbul")

    private fun veri(tur: ComplicationType, aci: Int?, konumAdi: String?): ComplicationData? {
        val aciklama = if (aci != null) {
            "Kıble kuzeyden $aci derece${konumAdi?.let { ", $it" } ?: ""}. Pusulayı açın"
        } else {
            "Kıble için telefonunuzda konumu açın"
        }
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(duz(if (aci != null) "$aci°" else "—"), duz(aciklama))
                    .setTitle(duz("Kıble"))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, R.drawable.ic_kible))
                    .setTapAction(kibleyiAc(this))
                    .build()
            ComplicationType.MONOCHROMATIC_IMAGE ->
                MonochromaticImageComplicationData.Builder(KomplikasyonOrtak.monokrom(this, R.drawable.ic_kible), duz(aciklama))
                    .setTapAction(kibleyiAc(this))
                    .build()
            ComplicationType.SMALL_IMAGE ->
                SmallImageComplicationData.Builder(KomplikasyonOrtak.kucukIkon(this, R.drawable.ic_kible), duz(aciklama))
                    .setTapAction(kibleyiAc(this))
                    .build()
            else -> null
        }
    }

    private companion object {
        /** Dokunuş pusulayı açar (istek kodu 1: uygulamayı açan niyetten ayrı kalsın). */
        fun kibleyiAc(context: Context): PendingIntent = PendingIntent.getActivity(
            context, 1, Intent(context, KibleAktivite::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
