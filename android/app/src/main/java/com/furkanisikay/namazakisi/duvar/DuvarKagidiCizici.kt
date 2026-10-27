package com.furkanisikay.namazakisi.duvar

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextDirectionHeuristics
import android.text.TextPaint
import com.furkanisikay.namazakisi.cekirdek.AyetKaydi
import com.furkanisikay.namazakisi.cekirdek.DuvarEkrani
import com.furkanisikay.namazakisi.cekirdek.DuvarKagidiKurallari
import com.furkanisikay.namazakisi.cekirdek.DuvarRenkleri
import com.furkanisikay.namazakisi.cekirdek.DuvarZemini
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku
import com.furkanisikay.namazakisi.rakamSifiri
import com.furkanisikay.namazakisi.rakamla
import com.furkanisikay.namazakisi.widget.AyetYazitipleri

/**
 * Günün ayeti duvar kâğıdı çizicisi (#381) — ekran çözünürlüğünde tek `Bitmap`.
 *
 * Yerleşim tasarım tuvalinden (412 px genişlik, ölçeklenir): metin BANDI kilit ekranında
 * %36–%80 (üst %33 saat/bildirim, alt %17 parmak izi/kısayol — hiçbir metin oraya girmez), ana
 * ekranda %9–%34 ve küçük yazı (`DuvarKagidiKurallari.bant`). Meal Noto Serif, Arapça Amiri
 * Quran (`duvar.arapca` ya da meal yoksa), künye `kisaKunye` OLDUĞU GİBİ (büyük harfe ÇEVRİLMEZ:
 * `toUpperCase` Türkçe "i"yi bozar), ATIF satırı (meal kaynağı + Arapça gösteriliyorsa Arapça
 * kaynağı) her görselde ZORUNLU. Sığmazsa yazı küçülür; en küçükte de sığmazsa Arapça düşer;
 * meal kesilmez.
 */
object DuvarKagidiCizici {
    private const val YILDIZ_BOYUTU = 22f
    private const val SUS_BOYUTU = 420f
    private const val YAN_BOSLUK = 30f
    private const val EN_KUCUK_CARPAN = 0.6f
    private const val CARPAN_ADIMI = 0.06f

    /** Görseli çizer. Çağıran `recycle()` eder. */
    fun ciz(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        ekran: DuvarEkrani,
        genislik: Int,
        yukseklik: Int,
    ): Bitmap {
        val bmp = Bitmap.createBitmap(genislik, yukseklik, Bitmap.Config.ARGB_8888)
        val tuval = Canvas(bmp)
        val renk = DuvarKagidiKurallari.renkler(yuk.duvar)
        tuval.drawColor(renk.zemin)
        val s = genislik / DuvarKagidiKurallari.TASARIM_GENISLIGI
        susCiz(tuval, renk, yuk.duvar.zemin, genislik, yukseklik, s)

        val (ustOran, altOran) = DuvarKagidiKurallari.bant(ekran)
        val bantUst = yukseklik * ustOran
        val bantAlt = yukseklik * altOran
        val icGenislik = maxOf(1, Math.round(genislik - 2 * YAN_BOSLUK * s))
        val olcek = s * DuvarKagidiKurallari.yaziOlcegi(ekran)

        val arapca = GununAyetiKurallari.duvardaArapca(kayit, yuk.duvar)
        // Sığana kadar küçült; Arapça ile en küçük boyutta da sığmazsa Arapçayı düşürüp
        // küçültmeyi baştan yine dene (Arapçasız blok da dar kilit bandını aşabilir).
        fun sigdir(arapcaIle: Boolean): Blok {
            var b = blokKur(context, yuk, kayit, renk, arapcaIle, olcek, s, icGenislik, 1f)
            var carpan = 1f
            while (b.yukseklik > bantAlt - bantUst && carpan > EN_KUCUK_CARPAN) {
                carpan -= CARPAN_ADIMI
                b = blokKur(context, yuk, kayit, renk, arapcaIle, olcek, s, icGenislik, carpan)
            }
            return b
        }
        val ilk = sigdir(arapca)
        val blok = if (ilk.yukseklik > bantAlt - bantUst && arapca && kayit.meal != null) sigdir(false) else ilk

        // Kilit ekranında blok bandın ortasında, atıf bandın altında; ana ekranda üstten başlar.
        val x = (genislik - icGenislik) / 2f
        val atifY = bantAlt - blok.atif.height
        val ortaAlan = (atifY - bantUst - blok.atifBoslugu).coerceAtLeast(0f)
        var y = if (ekran == DuvarEkrani.KILIT) {
            bantUst + ((ortaAlan - blok.govdeYuksekligi) / 2f).coerceAtLeast(0f)
        } else {
            bantUst
        }
        for (parca in blok.parcalar) {
            y += parca.ustBosluk
            parca.ciz(tuval, x, y, icGenislik)
            y += parca.yukseklik
        }
        if (ekran == DuvarEkrani.ANA) {
            // Ana ekranda atıf, künyenin hemen altında (simgelerden uzak).
            y += blok.atifBoslugu
            yerlesimCiz(tuval, blok.atif, x, y)
        } else {
            yerlesimCiz(tuval, blok.atif, x, atifY)
        }
        return bmp
    }

    // --- Blok ---------------------------------------------------------------------------

    private class Parca(val ustBosluk: Float, val yukseklik: Float, val ciz: (Canvas, Float, Float, Int) -> Unit)

    private class Blok(val parcalar: List<Parca>, val atif: StaticLayout, val atifBoslugu: Float) {
        val govdeYuksekligi: Float = parcalar.sumOf { (it.ustBosluk + it.yukseklik).toDouble() }.toFloat()
        val yukseklik: Float = govdeYuksekligi + atifBoslugu + atif.height
    }

    private fun blokKur(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        renk: DuvarRenkleri,
        arapca: Boolean,
        olcek: Float,
        s: Float,
        genislik: Int,
        carpan: Float,
    ): Blok {
        val o = olcek * carpan
        val parcalar = ArrayList<Parca>()
        // Meal ve künye seçilen rakamla (Arapçada "arab" → ٠-٩); Arapça ayet ve atıf satırı
        // (kaynak/sürüm) birebir kalır.
        val sifir = context.rakamSifiri()
        val meal = kayit.meal?.rakamla(sifir)
        if (arapca) {
            val ar = yerlesim(kayit.ar, boya(AyetYazitipleri.arapca(context), 28f * o, renk.metin), genislik, 1f, rtl = true)
            parcalar += Parca(0f, ar.height.toFloat()) { t, x, y, _ -> yerlesimCiz(t, ar, x, y) }
            if (meal != null) {
                val cizgiKalinligi = maxOf(1f, s)
                parcalar += Parca(14f * o, cizgiKalinligi) { t, x, y, g ->
                    val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = renk.kunye }
                    val orta = x + g / 2f
                    t.drawRect(orta - 18f * s, y, orta + 18f * s, y + cizgiKalinligi, p)
                }
            }
        } else {
            // Mealin üstünde küçük sekiz köşeli yıldız (yalnız Arapça yokken; tasarım).
            val boyut = YILDIZ_BOYUTU * o
            parcalar += Parca(0f, boyut) { t, x, y, g -> yildizCiz(t, x + g / 2f, y + boyut / 2f, boyut / 24f, renk.kunye, 1f, 1.6f, daire = false) }
        }
        if (meal != null) {
            val m = yerlesim(meal, boya(AyetYazitipleri.meal(context), (if (arapca) 17f else 24f) * o, renk.metin), genislik, 1.1f)
            parcalar += Parca((if (arapca) 14f else 18f) * o, m.height.toFloat()) { t, x, y, _ -> yerlesimCiz(t, m, x, y) }
        }
        val kunyeBoyasi = boya(Typeface.create("sans-serif", Typeface.NORMAL), 12f * o, renk.kunye).apply { letterSpacing = 0.04f }
        val kunye = yerlesim(kayit.kisaKunye.rakamla(sifir), kunyeBoyasi, genislik, 1f)
        parcalar += Parca((if (arapca) 14f else 18f) * o, kunye.height.toFloat()) { t, x, y, _ -> yerlesimCiz(t, kunye, x, y) }

        val atifMetni = GununAyetiKurallari.atifSatiri(kayit, yuk.metin, arapca)
        val atif = yerlesim(atifMetni, boya(Typeface.create("sans-serif", Typeface.NORMAL), 10f * s * carpan.coerceAtLeast(0.9f), renk.atif), genislik, 1f)
        return Blok(parcalar, atif, 12f * s)
    }

    private fun boya(yazitipi: Typeface, boyutPx: Float, renk: Int) = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        typeface = yazitipi
        textSize = boyutPx
        color = renk
    }

    private fun yerlesim(metin: String, boya: TextPaint, genislik: Int, satirCarpani: Float, rtl: Boolean = false): StaticLayout =
        StaticLayout.Builder.obtain(metin, 0, metin.length, boya, genislik)
            .setAlignment(Layout.Alignment.ALIGN_CENTER)
            .setTextDirection(if (rtl) TextDirectionHeuristics.RTL else TextDirectionHeuristics.FIRSTSTRONG_LTR)
            .setIncludePad(true)
            .setLineSpacing(0f, satirCarpani)
            .setBreakStrategy(Layout.BREAK_STRATEGY_HIGH_QUALITY)
            .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NONE)
            .build()

    private fun yerlesimCiz(tuval: Canvas, y: StaticLayout, x: Float, ust: Float) {
        tuval.save()
        tuval.translate(x, ust)
        y.draw(tuval)
        tuval.restore()
    }

    // --- Süsleme ------------------------------------------------------------------------

    /** Arka plandaki silik büyük yıldız + daire (tasarım tuvalindeki konumlar). Metin değildir. */
    private fun susCiz(tuval: Canvas, renk: DuvarRenkleri, zemin: DuvarZemini, g: Int, y: Int, s: Float) {
        val (ox, oy) = when (zemin) {
            DuvarZemini.GECE -> 0.855f to 0.878f
            DuvarZemini.KAGIT -> 0.097f to 0.64f
            DuvarZemini.PALET -> 0.903f to 0.693f
        }
        val birim = SUS_BOYUTU * s / 24f
        yildizCiz(tuval, g * ox, y * oy, birim, renk.sus, renk.susOpakligi, 0.12f, daire = true)
    }

    /**
     * 24 birimlik çerçevede iki kareden sekiz köşeli yıldız (+ isteğe bağlı r=4.2 daire),
     * merkez ([cx], [cy]), birim [birim] px.
     */
    private fun yildizCiz(tuval: Canvas, cx: Float, cy: Float, birim: Float, renk: Int, opaklik: Float, kalinlik: Float, daire: Boolean) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            color = renk
            alpha = Math.round(255 * opaklik).coerceIn(0, 255)
            strokeWidth = kalinlik * birim
            strokeJoin = Paint.Join.ROUND
        }
        val yari = 7f * birim
        tuval.drawRect(cx - yari, cy - yari, cx + yari, cy + yari, p)
        val kosegen = 9.9f * birim
        val yol = Path().apply {
            moveTo(cx, cy - kosegen)
            lineTo(cx + kosegen, cy)
            lineTo(cx, cy + kosegen)
            lineTo(cx - kosegen, cy)
            close()
        }
        tuval.drawPath(yol, p)
        if (daire) tuval.drawCircle(cx, cy, 4.2f * birim, p)
    }
}
