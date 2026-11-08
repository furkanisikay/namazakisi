package com.furkanisikay.namazakisi.widget

import android.content.Context
import android.graphics.Typeface
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.DuvarTasarimi
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.YaziTipi

/**
 * Pakete gömülü fontlar (`assets/fonts/`, OFL 1.1 — lisans metinleri yanında):
 * - Amiri Quran: Arapça satır (widget'ta RESİM olarak çizilir; RemoteViews pakete gömülü
 *   font kullanamaz) ve duvar kâğıdı.
 * - Noto Serif: duvar kâğıdındaki meal; Noto Serif'in kapsamadığı yazılardaki (Ge'ez, Tamil, Malayalam, Tay, Hangıl, Han) meal sistem
 *   yazı tipiyle (`GununAyetiKurallari.mealSerifMi`).
 * - Amiri (Regular): duvar kâğıdında "Zarif" yazı tipiyle meal; Amiri'nin kapsamadığı yazıda
 *   (Kiril, Yunan, Vietnamca, Afrika Latin harfleri…) klasik kurala iner (`DuvarTasarimi.zarifAmiriMi`).
 * KFGQPC Uthmanic HAFS özel lisanslıdır, PAKETLENMEZ (`docs/ajan/gunun-ayeti.md`).
 * Yükleme başarısızsa sistem fontuna düşülür (çizim durmaz).
 */
object AyetYazitipleri {
    private const val TAG = "AyetYazitipleri"
    private const val AMIRI = "fonts/AmiriQuran-Regular.ttf"
    private const val AMIRI_DUZ = "fonts/Amiri-Regular.ttf"
    private const val NOTO_SERIF = "fonts/NotoSerif-Regular.ttf"

    @Volatile private var amiri: Typeface? = null
    @Volatile private var amiriDuz: Typeface? = null
    @Volatile private var notoSerif: Typeface? = null

    fun arapca(context: Context): Typeface =
        amiri ?: yukle(context, AMIRI, Typeface.SERIF).also { amiri = it }

    fun meal(context: Context, metin: String): Typeface =
        if (!GununAyetiKurallari.mealSerifMi(metin)) Typeface.create("sans-serif", Typeface.NORMAL)
        else notoSerif ?: yukle(context, NOTO_SERIF, Typeface.SERIF).also { notoSerif = it }

    /** Duvar kâğıdı mealinin yazı tipi: klasik = [meal] kuralı, zarif = Amiri (kapsıyorsa), sade = sistem. */
    fun duvarMeali(context: Context, metin: String, tip: YaziTipi): Typeface = when (tip) {
        YaziTipi.KLASIK -> meal(context, metin)
        YaziTipi.SADE -> Typeface.create("sans-serif", Typeface.NORMAL)
        YaziTipi.ZARIF ->
            if (DuvarTasarimi.zarifAmiriMi(metin)) amiriDuz ?: yukle(context, AMIRI_DUZ, Typeface.SERIF).also { amiriDuz = it }
            else meal(context, metin)
    }

    private fun yukle(context: Context, yol: String, yedek: Typeface): Typeface = try {
        Typeface.createFromAsset(context.applicationContext.assets, yol)
    } catch (e: Exception) {
        Log.w(TAG, "Font yuklenemedi: $yol", e)
        yedek
    }
}
