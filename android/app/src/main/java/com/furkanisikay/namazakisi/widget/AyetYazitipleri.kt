package com.furkanisikay.namazakisi.widget

import android.content.Context
import android.graphics.Typeface
import android.util.Log

/**
 * Pakete gömülü fontlar (`assets/fonts/`, OFL 1.1 — lisans metinleri yanında):
 * - Amiri Quran: Arapça satır (widget'ta RESİM olarak çizilir; RemoteViews pakete gömülü
 *   font kullanamaz) ve duvar kâğıdı.
 * - Noto Serif: duvar kâğıdındaki meal.
 * KFGQPC Uthmanic HAFS özel lisanslıdır, PAKETLENMEZ (`docs/ajan/gunun-ayeti.md`).
 * Yükleme başarısızsa sistem fontuna düşülür (çizim durmaz).
 */
object AyetYazitipleri {
    private const val TAG = "AyetYazitipleri"
    private const val AMIRI = "fonts/AmiriQuran-Regular.ttf"
    private const val NOTO_SERIF = "fonts/NotoSerif-Regular.ttf"

    @Volatile private var amiri: Typeface? = null
    @Volatile private var notoSerif: Typeface? = null

    fun arapca(context: Context): Typeface =
        amiri ?: yukle(context, AMIRI, Typeface.SERIF).also { amiri = it }

    fun meal(context: Context): Typeface =
        notoSerif ?: yukle(context, NOTO_SERIF, Typeface.SERIF).also { notoSerif = it }

    private fun yukle(context: Context, yol: String, yedek: Typeface): Typeface = try {
        Typeface.createFromAsset(context.applicationContext.assets, yol)
    } catch (e: Exception) {
        Log.w(TAG, "Font yuklenemedi: $yol", e)
        yedek
    }
}
