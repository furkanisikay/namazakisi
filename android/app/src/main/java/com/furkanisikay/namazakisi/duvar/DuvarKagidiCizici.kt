package com.furkanisikay.namazakisi.duvar

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextDirectionHeuristics
import android.text.TextPaint
import com.furkanisikay.namazakisi.cekirdek.AyetKaydi
import com.furkanisikay.namazakisi.cekirdek.CisimTuru
import com.furkanisikay.namazakisi.cekirdek.DuvarEkrani
import com.furkanisikay.namazakisi.cekirdek.DuvarKagidiKurallari
import com.furkanisikay.namazakisi.cekirdek.DuvarRenkleri
import com.furkanisikay.namazakisi.cekirdek.DuvarTasarimi
import com.furkanisikay.namazakisi.cekirdek.DuvarZemini
import com.furkanisikay.namazakisi.cekirdek.GokSahnesi
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku
import com.furkanisikay.namazakisi.cekirdek.Kutu
import com.furkanisikay.namazakisi.cekirdek.SusTuru
import com.furkanisikay.namazakisi.cekirdek.YaziHizasi
import com.furkanisikay.namazakisi.rakamSifiri
import com.furkanisikay.namazakisi.rakamla
import com.furkanisikay.namazakisi.widget.AyetYazitipleri

/**
 * Günün ayeti duvar kâğıdı çizicisi (#381) — ekran çözünürlüğünde tek `Bitmap`.
 *
 * Sıra: yazı yerleşimi ÖNCE hesaplanır (gök cismi ve fotoğraf okunurluğu yazı kutusuna bakar),
 * sonra zemin (düz renk / vakit göğü / fotoğraf + karartma) → süs → (fotoğrafta yazı arkası perde)
 * → yazı. Yazı bloğu (gövde + atıf) `DuvarTasarimi.yaziYerlesimi` ile izinli banda konur: merkez
 * `duvar.yazi.kilitY/anaY` ya da `VARSAYILAN_MERKEZ`; hiçbir banda sığmazsa yazı %6 adımlarla
 * ×0,6'ya kadar küçülür, yine sığmazsa Arapça düşer ve küçültme baştan dener. Meal kesilmez;
 * künye `kisaKunye` OLDUĞU GİBİ (büyük harfe ÇEVRİLMEZ), ATIF satırı her görselde ZORUNLU.
 * Tasarım tuvali 412 px genişliğe göre ölçeklenir (gök/süs ölçüleri ekran kesri, tuval 330).
 */
object DuvarKagidiCizici {
    private const val YILDIZ_BOYUTU = 22f
    private const val SUS_BOYUTU = 420f
    private const val YAN_BOSLUK = 30f
    private const val EN_KUCUK_CARPAN = 0.6f
    private const val CARPAN_ADIMI = 0.06f
    /** Gök ve süs ölçülerinin tasarım tuvali genişliği (sözleşme 330×700). */
    private const val TUVAL = 330f
    /** Gök ve fotoğraf zemininde yıldız süsünün yeri (gece zemininin yeri). */
    private const val GOK_YILDIZ_X = 0.855f
    private const val GOK_YILDIZ_Y = 0.878f

    /** Görseli çizer. Çağıran `recycle()` eder. [simdiMs] vakte uyan göğün anı. */
    fun ciz(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        ekran: DuvarEkrani,
        genislik: Int,
        yukseklik: Int,
        simdiMs: Long = System.currentTimeMillis(),
    ): Bitmap {
        val w = genislik
        val h = yukseklik
        val ayar = yuk.duvar
        val gok = GununAyetiKurallari.etkinGok(ayar, kayit, simdiMs)
        val sahne = gok?.let { yuk.sahneler[it] }
        val foto = if (ayar.zemin == DuvarZemini.FOTO) DuvarFotoZemini.hazirla(context, ayar, w, h) else null
        try {
            val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            val tuval = Canvas(bmp)
            val s = w / DuvarKagidiKurallari.TASARIM_GENISLIGI
            val icGenislik = maxOf(1, Math.round(w - 2 * YAN_BOSLUK * s))
            val x = (w - icGenislik) / 2f

            // 1) Yerleşim (renkten bağımsız ölçüm).
            val duzZemin = if (ayar.zemin.duzMu) ayar.zemin else DuvarZemini.GECE
            var renk: DuvarRenkleri = when {
                sahne != null -> DuvarKagidiKurallari.yaziRenkleri(sahne.metin, sahne.gradyan.firstOrNull()?.renk ?: Color.BLACK)
                foto != null -> DuvarKagidiKurallari.yaziRenkleri(DuvarTasarimi.ACIK_METIN, Color.BLACK)
                else -> DuvarKagidiKurallari.renkler(ayar.copy(zemin = duzZemin))
            }
            val duzen = duzenBul(context, yuk, kayit, ekran, h, s, icGenislik, renk)
            val kutu = duzen.blok.kutu(x, duzen.ustPx, icGenislik)

            // 2) Zemin.
            when {
                sahne != null -> gokCiz(tuval, sahne, kutu, w, h)
                foto != null -> {
                    tuval.drawBitmap(foto, 0f, 0f, null)
                    val karartma = Math.round(255 * ayar.foto.karartma).toInt().coerceIn(0, 255)
                    if (karartma > 0) tuval.drawColor(Color.argb(karartma, 0, 0, 0))
                }
                else -> tuval.drawColor(renk.zemin)
            }

            // 3) Fotoğrafta okunurluk: yazı kutusunun ortalama parlaklığına göre renk + perde.
            var perde: Pair<Int, Double>? = null
            if (sahne == null && foto != null && ayar.foto.okunurluk) {
                val ortalama = DuvarFotoZemini.ortalamaParlaklik(bmp, Rect().also { kutu.roundOut(it) })
                val karar = DuvarTasarimi.okunurlukKarari(ortalama)
                renk = DuvarKagidiKurallari.yaziRenkleri(karar.metin, Color.BLACK)
                if (karar.perdeOpakligi > 0) perde = karar.perde to karar.perdeOpakligi
            }

            // 4) Süs (yazı renginde; yıldız düz zeminde kendi süs renginde).
            val zeminTuru = if (sahne != null || foto != null) null else duzZemin
            susCiz(tuval, ayar.sus.tur, ayar.sus.belirginlik.toFloat(), renk, zeminTuru, kutu, w, h, s)

            // 5) Perde ve yazı.
            perde?.let { (p, o) -> perdeCiz(tuval, kutu, p, o, w) }
            val blok = blokKur(context, yuk, kayit, renk, duzen.arapca, duzen.olcek, s, icGenislik, duzen.carpan)
            blok.ciz(tuval, x, duzen.ustPx, icGenislik)
            return bmp
        } finally {
            foto?.recycle()
        }
    }

    // --- Yerleşim ------------------------------------------------------------------------------

    private class Duzen(val blok: Blok, val arapca: Boolean, val carpan: Float, val olcek: Float, val ustPx: Float)

    private fun duzenBul(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        ekran: DuvarEkrani,
        h: Int,
        s: Float,
        icGenislik: Int,
        renk: DuvarRenkleri,
    ): Duzen {
        val yazi = yuk.duvar.yazi
        val olcek = s * DuvarKagidiKurallari.yaziOlcegi(ekran) * yazi.olcek.toFloat()
        val bantlar = DuvarTasarimi.IZINLI_BANTLAR.getValue(ekran)
        val merkez = (if (ekran == DuvarEkrani.KILIT) yazi.kilitY else yazi.anaY)
            ?: DuvarTasarimi.VARSAYILAN_MERKEZ.getValue(ekran)

        // Sığana kadar küçült; Arapça ile en küçük boyutta da sığmazsa Arapçayı düşürüp
        // küçültmeyi baştan yine dene (Arapçasız blok da dar kilit bandını aşabilir).
        // Hiçbiri sığmazsa son denenen (en küçük) blok en geniş bandın üstüne yaslanır; taşsa da çizilir.
        val genis = bantlar.maxByOrNull { it.alt - it.ust } ?: bantlar.first()
        lateinit var son: Duzen
        fun yerlestir(arapcaIle: Boolean): Duzen? {
            var carpan = 1f
            while (true) {
                val b = blokKur(context, yuk, kayit, renk, arapcaIle, olcek, s, icGenislik, carpan)
                val yer = DuvarTasarimi.yaziYerlesimi(merkez, b.yukseklik.toDouble() / h, bantlar)
                if (yer != null) return Duzen(b, arapcaIle, carpan, olcek, (yer.ust * h).toFloat())
                son = Duzen(b, arapcaIle, carpan, olcek, (genis.ust * h).toFloat())
                if (carpan <= EN_KUCUK_CARPAN) return null
                carpan -= CARPAN_ADIMI
            }
        }
        val arapca = GununAyetiKurallari.duvardaArapca(kayit, yuk.duvar)
        return yerlestir(arapca) ?: (if (arapca && kayit.meal != null) yerlestir(false) else null) ?: son
    }

    // --- Blok ----------------------------------------------------------------------------------

    private class Parca(
        val ustBosluk: Float,
        val yukseklik: Float,
        val yerlesim: StaticLayout?,
        val ciz: (Canvas, Float, Float, Int) -> Unit,
    )

    private class Blok(val parcalar: List<Parca>, val atif: StaticLayout, val atifBoslugu: Float) {
        val govdeYuksekligi: Float = parcalar.sumOf { (it.ustBosluk + it.yukseklik).toDouble() }.toFloat()
        val yukseklik: Float = govdeYuksekligi + atifBoslugu + atif.height

        /** Gövde, hemen altında atıf; [ust] bloğun üst kenarı (px). */
        fun ciz(tuval: Canvas, x: Float, ust: Float, genislik: Int) {
            var y = ust
            for (parca in parcalar) {
                y += parca.ustBosluk
                parca.ciz(tuval, x, y, genislik)
                y += parca.yukseklik
            }
            yerlesimCiz(tuval, atif, x, y + atifBoslugu)
        }

        /** Yazı kutusu (px): satırların gerçek yatay sınırları, bloğun tam yüksekliği. */
        fun kutu(x: Float, ust: Float, genislik: Int): RectF {
            var sol = Float.MAX_VALUE
            var sag = -Float.MAX_VALUE
            fun ekle(l: StaticLayout) {
                for (i in 0 until l.lineCount) {
                    if (l.getLineRight(i) <= l.getLineLeft(i)) continue
                    sol = minOf(sol, x + l.getLineLeft(i))
                    sag = maxOf(sag, x + l.getLineRight(i))
                }
            }
            parcalar.forEach { p -> p.yerlesim?.let { ekle(it) } }
            ekle(atif)
            if (sol > sag) {
                sol = x
                sag = x + genislik
            }
            return RectF(sol, ust, sag, ust + yukseklik)
        }
    }

    private fun hizalama(h: YaziHizasi): Layout.Alignment = when (h) {
        YaziHizasi.BAS -> Layout.Alignment.ALIGN_NORMAL
        YaziHizasi.ORTA -> Layout.Alignment.ALIGN_CENTER
        YaziHizasi.SON -> Layout.Alignment.ALIGN_OPPOSITE
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
        val yazi = yuk.duvar.yazi
        val hiza = hizalama(yazi.hiza)
        val parcalar = ArrayList<Parca>()
        // Meal ve künye seçilen rakamla (Arapçada "arab" → ٠-٩); Arapça ayet ve atıf satırı
        // (kaynak/sürüm) birebir kalır.
        val sifir = context.rakamSifiri()
        val meal = kayit.meal?.rakamla(sifir)
        // Küçük süsler (yıldız, ayraç çizgisi) mealin hizasında: başı mealin yazı yönüne göre.
        val mealRtl = meal != null && TextDirectionHeuristics.FIRSTSTRONG_LTR.isRtl(meal, 0, meal.length)
        fun susX(x: Float, g: Int, yari: Float): Float = when (yazi.hiza) {
            YaziHizasi.ORTA -> x + g / 2f
            YaziHizasi.BAS -> if (mealRtl) x + g - yari else x + yari
            YaziHizasi.SON -> if (mealRtl) x + yari else x + g - yari
        }
        if (arapca) {
            val ar = yerlesim(kayit.ar, boya(AyetYazitipleri.arapca(context), 28f * o, renk.metin), genislik, 1f, hiza, rtl = true)
            parcalar += Parca(0f, ar.height.toFloat(), ar) { t, x, y, _ -> yerlesimCiz(t, ar, x, y) }
            if (meal != null) {
                val cizgiKalinligi = maxOf(1f, s)
                parcalar += Parca(14f * o, cizgiKalinligi, null) { t, x, y, g ->
                    val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = renk.kunye }
                    val orta = susX(x, g, 18f * s)
                    t.drawRect(orta - 18f * s, y, orta + 18f * s, y + cizgiKalinligi, p)
                }
            }
        } else {
            // Mealin üstünde küçük sekiz köşeli yıldız (yalnız Arapça yokken; tasarım).
            val boyut = YILDIZ_BOYUTU * o
            parcalar += Parca(0f, boyut, null) { t, x, y, g ->
                yildizCiz(t, susX(x, g, boyut / 2f), y + boyut / 2f, boyut / 24f, renk.kunye, 1f, 1.6f, daire = false)
            }
        }
        if (meal != null) {
            val yazitipi = AyetYazitipleri.duvarMeali(context, meal, yazi.tip)
            val m = yerlesim(meal, boya(yazitipi, (if (arapca) 17f else 24f) * o, renk.metin), genislik, 1.1f, hiza)
            parcalar += Parca((if (arapca) 14f else 18f) * o, m.height.toFloat(), m) { t, x, y, _ -> yerlesimCiz(t, m, x, y) }
        }
        val kunyeBoyasi = boya(Typeface.create("sans-serif", Typeface.NORMAL), 12f * o, renk.kunye).apply { letterSpacing = 0.04f }
        val kunye = yerlesim(kayit.kisaKunye.rakamla(sifir), kunyeBoyasi, genislik, 1f, hiza)
        parcalar += Parca((if (arapca) 14f else 18f) * o, kunye.height.toFloat(), kunye) { t, x, y, _ -> yerlesimCiz(t, kunye, x, y) }

        // Atıf zorunludur ve okunur kalmalı: kullanıcının yazı boyutundan bağımsız, en az ×0,9.
        val atifMetni = GununAyetiKurallari.atifSatiri(kayit, yuk.metin, arapca)
        val atif = yerlesim(atifMetni, boya(Typeface.create("sans-serif", Typeface.NORMAL), 10f * s * carpan.coerceAtLeast(0.9f), renk.atif), genislik, 1f, hiza)
        return Blok(parcalar, atif, 12f * s)
    }

    private fun boya(yazitipi: Typeface, boyutPx: Float, renk: Int) = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        typeface = yazitipi
        textSize = boyutPx
        color = renk
    }

    /** `ALIGN_NORMAL`/`OPPOSITE` paragraf yönüne göre çözülür: Arapça (RTL) "baş"ta sağa yaslanır. */
    private fun yerlesim(
        metin: String,
        boya: TextPaint,
        genislik: Int,
        satirCarpani: Float,
        hiza: Layout.Alignment,
        rtl: Boolean = false,
    ): StaticLayout =
        StaticLayout.Builder.obtain(metin, 0, metin.length, boya, genislik)
            .setAlignment(hiza)
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

    // --- Gök --------------------------------------------------------------------------------

    private fun alfa(opaklik: Double): Int = Math.round(255 * opaklik).toInt().coerceIn(0, 255)

    /**
     * Vakit göğü (sözleşme verisi): renk geçişi → yıldızlar → ışıma → huzmeler → cisim → ufuk.
     * Cisim yazı kutusuna değmeyen ilk adaya konur (`cisimKonumuSec`); hiçbiri yoksa cisim,
     * ışıması ve huzmeleri çizilmez.
     */
    private fun gokCiz(t: Canvas, sahne: GokSahnesi, kutu: RectF, w: Int, h: Int) {
        val wf = w.toFloat()
        val hf = h.toFloat()
        val duraklar = sahne.gradyan.sortedBy { it.konum }
        when {
            duraklar.size >= 2 -> {
                val p = Paint().apply {
                    shader = LinearGradient(
                        0f, 0f, 0f, hf,
                        IntArray(duraklar.size) { duraklar[it].renk },
                        FloatArray(duraklar.size) { duraklar[it].konum.toFloat().coerceIn(0f, 1f) },
                        Shader.TileMode.CLAMP,
                    )
                }
                t.drawRect(0f, 0f, wf, hf, p)
            }
            duraklar.size == 1 -> t.drawColor(duraklar[0].renk)
            else -> t.drawColor(Color.BLACK)
        }

        val yildiz = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE }
        for (y in sahne.yildizlar) {
            yildiz.alpha = alfa(y.opaklik)
            t.drawCircle((y.x * wf).toFloat(), (y.y * hf).toFloat(), maxOf(0.5f, (y.r * wf).toFloat()), yildiz)
        }

        val cisim = sahne.cisim
        val kutuKesir = Kutu((kutu.left / wf).toDouble(), (kutu.top / hf).toDouble(), (kutu.right / wf).toDouble(), (kutu.bottom / hf).toDouble())
        val konum = cisim?.let { DuvarTasarimi.cisimKonumuSec(it, kutuKesir, hf.toDouble() / wf) }
        if (cisim != null && konum != null) {
            val cx = (konum.x * wf).toFloat()
            val cy = (konum.y * hf).toFloat()
            val isimaR = cisim.isimaR
            val isimaRenk = cisim.isimaRenk
            if (isimaR != null && isimaR > 0 && isimaRenk != null) {
                val r = (isimaR * wf).toFloat()
                val ic = (isimaRenk and 0x00FFFFFF) or (alfa(cisim.isimaOpaklik ?: 1.0) shl 24)
                val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    shader = RadialGradient(cx, cy, r, ic, isimaRenk and 0x00FFFFFF, Shader.TileMode.CLAMP)
                }
                t.drawCircle(cx, cy, r, p)
            }
            for (hz in sahne.huzmeler) {
                val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    style = Paint.Style.STROKE
                    color = hz.renk
                    alpha = alfa(hz.opaklik)
                    strokeWidth = (hz.kalinlik * wf).toFloat()
                    strokeCap = Paint.Cap.BUTT
                }
                t.drawLine(cx, cy, (hz.x * wf).toFloat(), (hz.y * hf).toFloat(), p)
            }
            val disk = Path().apply { addCircle(cx, cy, (cisim.r * wf).toFloat(), Path.Direction.CW) }
            if (cisim.tur == CisimTuru.HILAL) {
                // kesX/kesR genişlik, kesY yükseklik kesri (sözleşme).
                val kes = Path().apply {
                    addCircle(((konum.x + cisim.kesX) * wf).toFloat(), ((konum.y + cisim.kesY) * hf).toFloat(), (cisim.kesR * wf).toFloat(), Path.Direction.CW)
                }
                disk.op(kes, Path.Op.DIFFERENCE)
            }
            val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = cisim.renk
                alpha = alfa(cisim.opaklik)
            }
            t.drawPath(disk, p)
        }

        for (c in sahne.ufuk) {
            if (c.noktalar.size < 3) continue
            val yol = Path()
            c.noktalar.forEachIndexed { i, n ->
                val px = (n.x * wf).toFloat()
                val py = (n.y * hf).toFloat()
                if (i == 0) yol.moveTo(px, py) else yol.lineTo(px, py)
            }
            yol.close()
            t.drawPath(yol, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = c.renk; alpha = alfa(c.opaklik) })
        }
    }

    /** Fotoğrafta yazı arkası yumuşak kenarlı perde; çekirdeği yazı kutusunu tam opaklıkla örter. */
    private fun perdeCiz(t: Canvas, kutu: RectF, renk: Int, opaklik: Double, w: Int) {
        val yumusak = 0.03f * w
        val pay = 2 * yumusak
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = renk
            alpha = alfa(opaklik)
            maskFilter = BlurMaskFilter(yumusak, BlurMaskFilter.Blur.NORMAL)
        }
        t.drawRoundRect(RectF(kutu.left - pay, kutu.top - pay, kutu.right + pay, kutu.bottom + pay), yumusak, yumusak, p)
    }

    // --- Süsleme ------------------------------------------------------------------------------

    /**
     * Süs (metin değil): `yildiz` silik büyük yıldız (düz zeminde bugünkü yerinde ve renginde),
     * `mihrap` yazı kutusunu çevreleyen kemer, `girih` döşeme desen, `yok` hiçbiri. Opaklık
     * `belirginlik`le ölçeklenir (0,5 = bugünkü görünüm).
     */
    private fun susCiz(
        t: Canvas,
        tur: SusTuru,
        belirginlik: Float,
        renk: DuvarRenkleri,
        duzZemin: DuvarZemini?,
        kutu: RectF,
        w: Int,
        h: Int,
        s: Float,
    ) {
        val carpan = 0.5f + belirginlik
        when (tur) {
            SusTuru.YOK -> Unit
            SusTuru.YILDIZ -> {
                val (ox, oy) = when (duzZemin) {
                    DuvarZemini.KAGIT -> 0.097f to 0.64f
                    DuvarZemini.PALET -> 0.903f to 0.693f
                    else -> GOK_YILDIZ_X to GOK_YILDIZ_Y
                }
                val birim = SUS_BOYUTU * s / 24f
                yildizCiz(t, w * ox, h * oy, birim, renk.sus, (renk.susOpakligi * carpan).coerceAtMost(1f), 0.12f, daire = true)
            }
            SusTuru.MIHRAP -> mihrapCiz(t, kutu, renk.metin, carpan, w, h)
            SusTuru.GIRIH -> girihCiz(t, renk.metin, 0.04f + 0.10f * belirginlik, w, h)
        }
    }

    /**
     * Yazı kutusunu çerçeveleyen kemer: dış kemer kutunun 0,06 w dışından, yarım daire tepesi kutunun
     * 0,04 h üstünde, ayaklar ekranın altına iner; iç kemer 0,05 w içeride; tepede küçük yıldız.
     */
    private fun mihrapCiz(t: Canvas, kutu: RectF, renk: Int, carpan: Float, w: Int, h: Int) {
        val kalinlik = 0.0067f * w
        fun kemer(sol: Float, sag: Float, tepe: Float, opaklik: Float) {
            val r = (sag - sol) / 2f
            val yol = Path().apply {
                moveTo(sol, h.toFloat())
                lineTo(sol, tepe + r)
                arcTo(RectF(sol, tepe, sag, tepe + 2 * r), 180f, 180f, false)
                lineTo(sag, h.toFloat())
            }
            t.drawPath(yol, Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE
                color = renk
                alpha = Math.round(255 * opaklik.coerceIn(0f, 1f))
                strokeWidth = kalinlik
                strokeJoin = Paint.Join.ROUND
            })
        }
        val sol = kutu.left - 0.06f * w
        val sag = kutu.right + 0.06f * w
        val tepe = kutu.top - 0.04f * h
        val dis = 0.28f * carpan
        kemer(sol, sag, tepe, dis)
        val ic = 0.05f * w
        if (sag - sol > 2 * ic) kemer(sol + ic, sag - ic, tepe + ic, 0.14f * carpan)
        val birim = 0.003f * w
        yildizCiz(t, (sol + sag) / 2f, tepe, birim, renk, dis.coerceAtMost(1f), kalinlik / birim, daire = false)
    }

    /** Döşeme girih deseni: 48/330 w karo, her karoda sekiz köşeli yıldız + küçük daire. */
    private fun girihCiz(t: Canvas, renk: Int, opaklik: Float, w: Int, h: Int) {
        val karo = 48f / TUVAL * w
        if (karo < 4f) return
        val birim = karo / 24f
        val yari = 7f * birim
        val kosegen = 9.9f * birim
        val daireR = 5f / TUVAL * w
        val yol = Path()
        var cy = karo / 2f
        while (cy - karo / 2f < h) {
            var cx = karo / 2f
            while (cx - karo / 2f < w) {
                yol.addRect(cx - yari, cy - yari, cx + yari, cy + yari, Path.Direction.CW)
                yol.moveTo(cx, cy - kosegen)
                yol.lineTo(cx + kosegen, cy)
                yol.lineTo(cx, cy + kosegen)
                yol.lineTo(cx - kosegen, cy)
                yol.close()
                yol.addCircle(cx, cy, daireR, Path.Direction.CW)
                cx += karo
            }
            cy += karo
        }
        t.drawPath(yol, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            color = renk
            alpha = Math.round(255 * opaklik.coerceIn(0f, 1f))
            strokeWidth = 0.9f / TUVAL * w
            strokeJoin = Paint.Join.ROUND
        })
    }

    /**
     * 24 birimlik çerçevede iki kareden sekiz köşeli yıldız (+ isteğe bağlı r=4.2 daire),
     * merkez ([cx], [cy]), birim [birim] px.
     */
    private fun yildizCiz(tuval: Canvas, cx: Float, cy: Float, birim: Float, renk: Int, opaklik: Float, kalinlik: Float, daire: Boolean) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            color = renk
            alpha = Math.round(255 * opaklik * (Color.alpha(renk) / 255f)).coerceIn(0, 255)
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
