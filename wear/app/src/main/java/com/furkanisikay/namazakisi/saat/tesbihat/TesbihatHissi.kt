package com.furkanisikay.namazakisi.saat.tesbihat

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat
import com.furkanisikay.namazakisi.saat.cekirdek.TesbihatHaptik

/**
 * Tesbihat dokunuş hissi (issue #293): her sayımda kısa tık, her 33'te belirgin çift
 * vuruş, 100'de bitiş deseni, geri almada iki hafif vuruş. Desenler `TesbihatHaptik`'te
 * (saf) — muhafız kanal desenleriyle (`MuhafizBildirimci.DESEN_*`) karıştırılmaz.
 *
 * Titreşim motoru yoksa ya da kullanıcı sistemde dokunuş titreşimini kapattıysa
 * `vibrate` sessizce hiçbir şey yapmaz; sayım yine çalışır.
 */
class TesbihatHissi(context: Context) {
    private val titresim: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        context.getSystemService(VibratorManager::class.java)?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Vibrator::class.java)
    }

    fun ver(olay: Tesbihat.Olay) {
        val v = titresim?.takeIf { it.hasVibrator() } ?: return
        val etki = when (olay) {
            Tesbihat.Olay.YOK -> return
            Tesbihat.Olay.TIK -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
            Tesbihat.Olay.GERI_ALINDI -> dalga(v, TesbihatHaptik.GERI_AL_DESENI, GUCLU / 2)
            Tesbihat.Olay.FAZ_TAMAM -> dalga(v, TesbihatHaptik.FAZ_DESENI, GUCLU)
            Tesbihat.Olay.BITTI -> dalga(v, TesbihatHaptik.BITIS_DESENI, GUCLU)
        }
        // Önceki desen sürerken hızlı dokunuş: yeni his eskisinin yerine geçer.
        v.cancel()
        v.vibrate(etki)
    }

    private fun dalga(v: Vibrator, desen: LongArray, genlik: Int): VibrationEffect =
        if (v.hasAmplitudeControl()) {
            // Bekleme dilimleri 0, titreşim dilimleri `genlik` — "güçlü" gerçekten güçlü olsun.
            VibrationEffect.createWaveform(desen, IntArray(desen.size) { if (it % 2 == 1) genlik else 0 }, -1)
        } else {
            VibrationEffect.createWaveform(desen, -1)
        }

    private companion object {
        const val GUCLU = 255
    }
}
