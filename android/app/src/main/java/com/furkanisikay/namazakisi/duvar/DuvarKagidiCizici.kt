package com.furkanisikay.namazakisi.duvar

import android.content.Context
import android.graphics.Bitmap
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
import com.furkanisikay.namazakisi.cekirdek.DuvarCizim
import com.furkanisikay.namazakisi.cekirdek.DuvarEkrani
import com.furkanisikay.namazakisi.cekirdek.DuvarKagidiKurallari
import com.furkanisikay.namazakisi.cekirdek.DuvarRenkleri
import com.furkanisikay.namazakisi.cekirdek.DuvarTasarimi
import com.furkanisikay.namazakisi.cekirdek.DuvarZemini
import com.furkanisikay.namazakisi.cekirdek.GokSahnesi
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku
import com.furkanisikay.namazakisi.cekirdek.Kutu
import com.furkanisikay.namazakisi.cekirdek.SaatAlani
import com.furkanisikay.namazakisi.cekirdek.SusTuru
import com.furkanisikay.namazakisi.cekirdek.YaziHizasi
import com.furkanisikay.namazakisi.rakamSifiri
import com.furkanisikay.namazakisi.rakamla
import com.furkanisikay.namazakisi.widget.AyetYazitipleri

/**
 * Günün ayeti duvar kâğıdı çizicisi (#381) — ekran çözünürlüğünde tek `Bitmap`.
 *
 * GÖRÜNÜM uygulamadaki düzenleyicinin önizlemesidir (sahip onaylı taslak 2): bütün çizim sayıları
 * `DuvarCizim`'dedir (JS `duvarCizimi.ts` ikizi, eşlik örneğiyle denetlenir); burada sayı YAZILMAZ.
 *
 * Sıra: yazı yerleşimi ÖNCE hesaplanır (gök cismi, mihrap ve fotoğraf okunurluğu yazı kutusuna
 * bakar), sonra zemin (düz renk / vakit göğü / fotoğraf + karartma) → süs → (fotoğrafta yazı arkası
 * perde) → yazı. Yazı kutusu = yazı sütunu (yan paylar arası) × bloğun tam yüksekliği (önizlemeyle
 * aynı). Blok `DuvarTasarimi.yaziYerlesimi` ile izinli banda konur: merkez `duvar.yazi.kilitY/anaY`
 * ya da `VARSAYILAN_MERKEZ`; hiçbir banda sığmazsa yazı %6 adımlarla ×0,6'ya kadar küçülür, yine
 * sığmazsa Arapça düşer ve küçültme baştan dener (önizleme bunu yaklaşık gösterir). Meal kesilmez;
 * künye `kisaKunye` OLDUĞU GİBİ (büyük harfe ÇEVRİLMEZ), ATIF satırı her görselde ZORUNLU.
 */
object DuvarKagidiCizici {
    private const val EN_KUCUK_CARPAN = 0.6f
    private const val CARPAN_ADIMI = 0.06f

    /**
     * Görseli çizer. Çağıran `recycle()` eder. [simdiMs] vakte uyan göğün anı.
     * [hazirFoto]: aynı boyutta birden çok ekran çizilecekse fotoğraf zemini BİR KEZ
     * `DuvarFotoZemini.hazirla` ile hazırlanıp verilir (sahibi çağırandır, burada `recycle` edilmez);
     * verilmezse burada hazırlanıp burada bırakılır.
     */
    fun ciz(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        ekran: DuvarEkrani,
        genislik: Int,
        yukseklik: Int,
        simdiMs: Long = System.currentTimeMillis(),
        hazirFoto: Bitmap? = null,
    ): Bitmap {
        val w = genislik
        val h = yukseklik
        val ayar = yuk.duvar
        val gok = GununAyetiKurallari.etkinGok(ayar, kayit, simdiMs)
        val sahne = gok?.let { yuk.sahneler[it] }
        val kendiFotosu = hazirFoto == null
        val foto = hazirFoto ?: if (ayar.zemin == DuvarZemini.FOTO) DuvarFotoZemini.hazirla(context, ayar, w, h) else null
        try {
            val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            val tuval = Canvas(bmp)
            val s = (w / DuvarCizim.TASARIM_GENISLIGI).toFloat()
            // Yan pay: mihrapta yazı kemerin içinde kalır.
            val x = (DuvarCizim.yaziYanPayi(ayar.sus.tur) * w).toFloat()
            val icGenislik = maxOf(1, Math.round(w - 2 * x))

            // 1) Yerleşim (renkten bağımsız ölçüm).
            val duzZemin = if (ayar.zemin.duzMu) ayar.zemin else DuvarZemini.GECE
            var renk: DuvarRenkleri = when {
                sahne != null -> DuvarKagidiKurallari.yaziRenkleri(sahne.metin, sahne.gradyan.firstOrNull()?.renk ?: Color.BLACK)
                foto != null -> DuvarKagidiKurallari.yaziRenkleri(DuvarTasarimi.ACIK_METIN, Color.BLACK)
                else -> DuvarKagidiKurallari.renkler(ayar.copy(zemin = duzZemin))
            }
            // Saat alanı yalnız kilit ekranında (ölçülmemişse varsayılan); ana ekranda yok.
            val saatAlani = if (ekran == DuvarEkrani.KILIT) ayar.saatAlani ?: DuvarTasarimi.VARSAYILAN_SAAT_ALANI else null
            val duzen = duzenBul(context, yuk, kayit, ekran, saatAlani, h, s, icGenislik, renk)
            val kutu = RectF(x, duzen.ustPx, x + icGenislik, duzen.ustPx + duzen.blok.yukseklik)

            // 2) Zemin.
            when {
                sahne != null -> gokCiz(tuval, sahne, kutu, saatAlani, w, h)
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
            susCiz(tuval, ayar.sus.tur, ayar.sus.belirginlik, renk, zeminTuru, kutu, saatAlani, w, h)

            // 5) Perde ve yazı.
            perde?.let { (p, o) -> perdeCiz(tuval, kutu, p, o, w) }
            val blok = blokKur(context, yuk, kayit, renk, duzen.arapca, s, icGenislik, duzen.carpan)
            blok.ciz(tuval, x, duzen.ustPx, icGenislik)
            return bmp
        } finally {
            if (kendiFotosu) foto?.recycle()
        }
    }

    // --- Yerleşim ------------------------------------------------------------------------------

    private class Duzen(val blok: Blok, val arapca: Boolean, val carpan: Float, val ustPx: Float)

    private fun duzenBul(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        ekran: DuvarEkrani,
        saatAlani: SaatAlani?,
        h: Int,
        s: Float,
        icGenislik: Int,
        renk: DuvarRenkleri,
    ): Duzen {
        val yazi = yuk.duvar.yazi
        val bantlar = DuvarTasarimi.izinliBantlar(ekran, saatAlani)
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
                val b = blokKur(context, yuk, kayit, renk, arapcaIle, s, icGenislik, carpan)
                val yer = DuvarTasarimi.yaziYerlesimi(merkez, b.yukseklik.toDouble() / h, bantlar)
                if (yer != null) return Duzen(b, arapcaIle, carpan, (yer.ust * h).toFloat())
                son = Duzen(b, arapcaIle, carpan, (genis.ust * h).toFloat())
                if (carpan <= EN_KUCUK_CARPAN) return null
                carpan -= CARPAN_ADIMI
            }
        }
        val arapca = GununAyetiKurallari.duvardaArapca(kayit, yuk.duvar)
        return yerlestir(arapca) ?: (if (arapca && kayit.meal != null) yerlestir(false) else null) ?: son
    }

    // --- Blok ----------------------------------------------------------------------------------

    private class Parca(val ustBosluk: Float, val yukseklik: Float, val ciz: (Canvas, Float, Float, Int) -> Unit)

    /** Ölçülmüş metin: [kayma] satırları kendi yüksekliklerinin ortasına oturtur (mutlak satır yüksekliği). */
    private class Metin(val yerlesim: StaticLayout, val yukseklik: Float, val kayma: Float) {
        fun ciz(tuval: Canvas, x: Float, ust: Float) {
            tuval.save()
            tuval.translate(x, ust + kayma)
            yerlesim.draw(tuval)
            tuval.restore()
        }
    }

    private class Blok(val parcalar: List<Parca>) {
        val yukseklik: Float = parcalar.sumOf { (it.ustBosluk + it.yukseklik).toDouble() }.toFloat()

        /** [ust] bloğun üst kenarı (px). */
        fun ciz(tuval: Canvas, x: Float, ust: Float, genislik: Int) {
            var y = ust
            for (parca in parcalar) {
                y += parca.ustBosluk
                parca.ciz(tuval, x, y, genislik)
                y += parca.yukseklik
            }
        }
    }

    private fun hizalama(h: YaziHizasi): Layout.Alignment = when (h) {
        YaziHizasi.BAS -> Layout.Alignment.ALIGN_NORMAL
        YaziHizasi.ORTA -> Layout.Alignment.ALIGN_CENTER
        YaziHizasi.SON -> Layout.Alignment.ALIGN_OPPOSITE
    }

    /**
     * (Arapça | yıldız süsünde küçük yıldız) + meal + künye + atıf. Ölçüler `DuvarCizim` (412 tasarım
     * px) × [s] × kullanıcı ölçeği × küçültme [carpan]; boşluklar önizlemedeki gibi.
     */
    private fun blokKur(
        context: Context,
        yuk: GununAyetiYuku,
        kayit: AyetKaydi,
        renk: DuvarRenkleri,
        arapca: Boolean,
        s: Float,
        genislik: Int,
        carpan: Float,
    ): Blok {
        val yazi = yuk.duvar.yazi
        val o = s * yazi.olcek.toFloat() * carpan
        val hiza = hizalama(yazi.hiza)
        val parcalar = ArrayList<Parca>()
        // Meal ve künye seçilen rakamla (Arapçada "arab" → ٠-٩); Arapça ayet ve atıf satırı
        // (kaynak/sürüm) birebir kalır.
        val sifir = context.rakamSifiri()
        val meal = kayit.meal?.rakamla(sifir)
        // Küçük yıldız mealin hizasında: başı mealin yazı yönüne göre.
        val mealRtl = meal != null && TextDirectionHeuristics.FIRSTSTRONG_LTR.isRtl(meal, 0, meal.length)
        fun susX(x: Float, g: Int, yari: Float): Float = when (yazi.hiza) {
            YaziHizasi.ORTA -> x + g / 2f
            YaziHizasi.BAS -> if (mealRtl) x + g - yari else x + yari
            YaziHizasi.SON -> if (mealRtl) x + yari else x + g - yari
        }
        // Künye ve atıf, yönü bloğun yönünden farklı olsa da (RTL mealin altında Latin kaynak satırı)
        // aynı kenara yaslanır: NORMAL/OPPOSITE satırın kendi yönüne göre çözüldüğü için ters çevrilir.
        val blokRtl = if (meal != null) mealRtl else arapca
        fun satirHizasi(metin: String): Layout.Alignment {
            val satirRtl = TextDirectionHeuristics.FIRSTSTRONG_LTR.isRtl(metin, 0, metin.length)
            if (satirRtl == blokRtl) return hiza
            return when (hiza) {
                Layout.Alignment.ALIGN_NORMAL -> Layout.Alignment.ALIGN_OPPOSITE
                Layout.Alignment.ALIGN_OPPOSITE -> Layout.Alignment.ALIGN_NORMAL
                else -> hiza
            }
        }
        val kucukYildiz = !arapca && yuk.duvar.sus.tur == SusTuru.YILDIZ
        if (arapca) {
            val boyut = DuvarCizim.ARAPCA.toFloat() * o
            val ar = yerlesim(kayit.ar, boya(AyetYazitipleri.arapca(context), boyut, renk.metin), genislik, hiza, rtl = true, satir = boyut * DuvarCizim.ARAPCA_SATIR.toFloat())
            parcalar += Parca(0f, ar.yukseklik) { t, x, y, _ -> ar.ciz(t, x, y) }
        } else if (kucukYildiz) {
            // Yıldız süsünde, Arapça yokken mealin üstünde küçük sekiz köşeli yıldız (daire yok).
            val boyut = DuvarCizim.KUCUK_YILDIZ.toFloat() * o
            parcalar += Parca(0f, boyut) { t, x, y, g ->
                yildizCiz(t, susX(x, g, boyut / 2f), y + boyut / 2f, boyut / 24f, renk.kunye, 1f, DuvarCizim.KUCUK_YILDIZ_KALINLIK.toFloat(), daire = false)
            }
        }
        if (meal != null) {
            val boyut = (if (arapca) DuvarCizim.MEAL_ARAPCALI else DuvarCizim.MEAL).toFloat() * o
            val yazitipi = AyetYazitipleri.duvarMeali(context, meal, yazi.tip)
            val m = yerlesim(meal, boya(yazitipi, boyut, renk.metin), genislik, hiza, satir = boyut * DuvarCizim.MEAL_SATIR.toFloat())
            val ust = when {
                arapca -> DuvarCizim.MEAL_UST_ARAPCALI
                kucukYildiz -> DuvarCizim.MEAL_UST_YILDIZLI
                else -> 0.0
            }
            parcalar += Parca(ust.toFloat() * o, m.yukseklik) { t, x, y, _ -> m.ciz(t, x, y) }
        }
        val kunyeBoyasi = boya(Typeface.create("sans-serif", Typeface.NORMAL), DuvarCizim.KUNYE.toFloat() * o, renk.kunye)
            .apply { letterSpacing = DuvarCizim.KUNYE_HARF_ARALIGI.toFloat() }
        val kunyeMetni = kayit.kisaKunye.rakamla(sifir)
        val kunye = yerlesim(kunyeMetni, kunyeBoyasi, genislik, satirHizasi(kunyeMetni))
        val kunyeUst = if (arapca) DuvarCizim.KUNYE_UST_ARAPCALI else DuvarCizim.KUNYE_UST
        parcalar += Parca(kunyeUst.toFloat() * o, kunye.yukseklik) { t, x, y, _ -> kunye.ciz(t, x, y) }

        // Atıf zorunludur ve okunur kalmalı: kullanıcı ölçeği ×0,9'un altına indirmez (önizleme);
        // native küçültme de ×0,9'da durur.
        val atifMetni = GununAyetiKurallari.atifSatiri(kayit, yuk.metin, arapca)
        val enAz = DuvarCizim.ATIF_EN_AZ_OLCEK.toFloat()
        val atifBoyu = DuvarCizim.ATIF.toFloat() * s * maxOf(enAz, yazi.olcek.toFloat()) * maxOf(enAz, carpan)
        val atif = yerlesim(atifMetni, boya(Typeface.create("sans-serif", Typeface.NORMAL), atifBoyu, renk.atif), genislik, satirHizasi(atifMetni))
        parcalar += Parca(DuvarCizim.ATIF_UST.toFloat() * o, atif.yukseklik) { t, x, y, _ -> atif.ciz(t, x, y) }
        return Blok(parcalar)
    }

    private fun boya(yazitipi: Typeface, boyutPx: Float, renk: Int) = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        typeface = yazitipi
        textSize = boyutPx
        color = renk
    }

    /**
     * `ALIGN_NORMAL`/`OPPOSITE` paragraf yönüne göre çözülür: Arapça (RTL) "baş"ta sağa yaslanır.
     * [satir] verilirse her satır o MUTLAK yükseklikte (önizlemenin `lineHeight`'ı): yazı tipinin
     * doğal satırına fark eklenir, glifler satırın ortasına kaydırılır; verilmezse doğal satır.
     */
    private fun yerlesim(
        metin: String,
        boya: TextPaint,
        genislik: Int,
        hiza: Layout.Alignment,
        rtl: Boolean = false,
        satir: Float? = null,
    ): Metin {
        val fm = boya.fontMetrics
        val ek = if (satir != null) satir - (fm.descent - fm.ascent) else 0f
        val l = StaticLayout.Builder.obtain(metin, 0, metin.length, boya, genislik)
            .setAlignment(hiza)
            .setTextDirection(if (rtl) TextDirectionHeuristics.RTL else TextDirectionHeuristics.FIRSTSTRONG_LTR)
            .setIncludePad(satir == null)
            .setLineSpacing(ek, 1f)
            .setBreakStrategy(Layout.BREAK_STRATEGY_HIGH_QUALITY)
            .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NONE)
            .build()
        return if (satir != null) Metin(l, l.lineCount * satir, ek / 2f) else Metin(l, l.height.toFloat(), 0f)
    }

    // --- Gök --------------------------------------------------------------------------------

    private fun alfa(opaklik: Double): Int = Math.round(255 * opaklik).toInt().coerceIn(0, 255)

    /**
     * Vakit göğü (sözleşme verisi): renk geçişi → yıldızlar → ışıma → huzmeler → cisim → ufuk.
     * Cisim yazı kutusuna ve kilit ekranında saat alanına değmeyen yere konur (`cisimKonumuSec`:
     * ilk boş aday, yoksa saatin hemen üstü/altı); hiçbiri yoksa cisim, ışıması ve huzmeleri çizilmez.
     */
    private fun gokCiz(t: Canvas, sahne: GokSahnesi, kutu: RectF, saatAlani: SaatAlani?, w: Int, h: Int) {
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
            t.drawCircle((y.x * wf).toFloat(), (y.y * hf).toFloat(), maxOf(0.4f, (y.r * wf).toFloat()), yildiz)
        }

        val cisim = sahne.cisim
        val kutuKesir = Kutu((kutu.left / wf).toDouble(), (kutu.top / hf).toDouble(), (kutu.right / wf).toDouble(), (kutu.bottom / hf).toDouble())
        val konum = cisim?.let { DuvarTasarimi.cisimKonumuSec(it, kutuKesir, hf.toDouble() / wf, saatAlani) }
        if (cisim != null && konum != null) {
            val cx = (konum.x * wf).toFloat()
            val cy = (konum.y * hf).toFloat()
            val isimaR = cisim.isimaR
            val isimaRenk = cisim.isimaRenk ?: cisim.renk
            if (isimaR != null && isimaR > 0) {
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

    /** Fotoğrafta yazı arkası perde: kutunun her yanından `PERDE_PAY` taşan, kesin kenarlı yuvarlak dolgu. */
    private fun perdeCiz(t: Canvas, kutu: RectF, renk: Int, opaklik: Double, w: Int) {
        val pay = (DuvarCizim.PERDE_PAY * w).toFloat()
        val r = (DuvarCizim.PERDE_YARICAP * w).toFloat()
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = renk
            alpha = alfa(opaklik)
        }
        t.drawRoundRect(RectF(kutu.left - pay, kutu.top - pay, kutu.right + pay, kutu.bottom + pay), r, r, p)
    }

    // --- Süsleme ------------------------------------------------------------------------------

    /**
     * Süs (metin değil): `yildiz` silik büyük yıldız (düz zeminde kendi yeri ve renginde), `mihrap`
     * yazı kutusunun üstünden dönen kemer, `girih` döşeme desen, `yok` hiçbiri. Opaklık
     * `DuvarCizim.susCarpani(belirginlik)` ile çarpılır (0,5 = ×1, 0 = görünmez).
     */
    private fun susCiz(
        t: Canvas,
        tur: SusTuru,
        belirginlik: Double,
        renk: DuvarRenkleri,
        duzZemin: DuvarZemini?,
        kutu: RectF,
        saatAlani: SaatAlani?,
        w: Int,
        h: Int,
    ) {
        val carpan = DuvarCizim.susCarpani(belirginlik)
        if (tur == SusTuru.YOK || carpan <= 0) return
        when (tur) {
            SusTuru.YOK -> Unit
            SusTuru.YILDIZ -> {
                val k = DuvarCizim.yildizKonumu(duzZemin)
                val birim = (DuvarCizim.YILDIZ_BIRIM * w).toFloat()
                val opaklik = (renk.susOpakligi * carpan).toFloat().coerceIn(0f, 1f)
                yildizCiz(t, (w * k.x).toFloat(), (h * k.y).toFloat(), birim, renk.sus, opaklik, DuvarCizim.YILDIZ_KALINLIK.toFloat(), daire = true)
            }
            SusTuru.MIHRAP -> mihrapCiz(t, kutu.top, renk.metin, carpan, saatAlani, w, h)
            SusTuru.GIRIH -> girihCiz(t, renk.metin, carpan, w, h)
        }
    }

    /**
     * Mihrap: iki kemer (dış + iç) bacakları ekranın altından yükselir, yarım daireleri yazı kutusunun
     * üstünden döner (merkez kutu üstünün `merkezAlti` altında); tepede dolu beş köşeli yıldız. Kemer
     * yatayda ekrana göredir (yazı sütunu `MIHRAP_YAZI_YAN_PAYI` ile içinde kalır).
     *
     * Kilit ekranında ([saatAlani] dolu) kemer saate girerken solar: opaklık y boyunca
     * `saatSolmasi(y)` ile çarpılır. Fonksiyon parça parça doğrusal olduğundan kırılma noktalarında
     * (`saatSolmasiDuraklari`) örneklenmiş dikey `LinearGradient` onu BİREBİR verir. Yıldız saate
     * değiyorsa (çokgenin tepe → en alt köşe aralığı, `saateDegiyor`) hiç çizilmez.
     */
    private fun mihrapCiz(t: Canvas, ust: Float, renk: Int, carpan: Double, saatAlani: SaatAlani?, w: Int, h: Int) {
        val wf = w.toDouble()
        val hf = h.toFloat()
        val duraklar = saatAlani?.let { DuvarTasarimi.saatSolmasiDuraklari(it) }
        for (k in listOf(DuvarCizim.MIHRAP_DIS, DuvarCizim.MIHRAP_IC)) {
            val sol = (k.yanPay * wf).toFloat()
            val sag = (wf - k.yanPay * wf).toFloat()
            val r = (k.r * wf).toFloat()
            val my = ust + (k.merkezAlti * wf).toFloat()
            val cx = (sol + sag) / 2f
            val yol = Path().apply {
                moveTo(sol, h.toFloat())
                lineTo(sol, my)
                arcTo(RectF(cx - r, my - r, cx + r, my + r), 180f, 180f, false)
                lineTo(sag, h.toFloat())
            }
            t.drawPath(yol, Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE
                strokeWidth = (k.kalinlik * wf).toFloat()
                if (duraklar == null) {
                    color = renk
                    alpha = alfa(k.opaklik * carpan)
                } else {
                    // Renk geçişi ekran koordinatında (0 → h): durak konumları ekran kesri.
                    shader = LinearGradient(
                        0f, 0f, 0f, hf,
                        IntArray(duraklar.size) { i ->
                            (renk and 0x00FFFFFF) or (alfa(k.opaklik * carpan * DuvarTasarimi.saatSolmasi(duraklar[i], saatAlani)) shl 24)
                        },
                        FloatArray(duraklar.size) { i -> duraklar[i].toFloat() },
                        Shader.TileMode.CLAMP,
                    )
                }
            })
        }
        val noktalar = DuvarCizim.besKoseliYildiz(
            wf / 2, ust - DuvarCizim.MIHRAP_YILDIZ_UST * wf, DuvarCizim.MIHRAP_YILDIZ_DIS_R * wf, DuvarCizim.MIHRAP_YILDIZ_IC_R * wf,
        )
        // Kapsam = yıldız çokgeninin GERÇEK dikey uzanımı (tepe köşe → en alt köşe), sınır dairesi değil (iOS ile aynı).
        if (DuvarTasarimi.saateDegiyor(noktalar.minOf { it.y } / h, noktalar.maxOf { it.y } / h, saatAlani)) return
        val yildiz = Path()
        noktalar.forEachIndexed { i, n -> if (i == 0) yildiz.moveTo(n.x.toFloat(), n.y.toFloat()) else yildiz.lineTo(n.x.toFloat(), n.y.toFloat()) }
        yildiz.close()
        t.drawPath(yildiz, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = renk
            alpha = alfa(DuvarCizim.MIHRAP_YILDIZ_OPAKLIK * carpan)
        })
    }

    /** Girih: sol üstten döşenen karo; her karoda dört köşeli yıldız (`GIRIH_YOL`) + ortada daire. */
    private fun girihCiz(t: Canvas, renk: Int, carpan: Double, w: Int, h: Int) {
        val karo = (DuvarCizim.GIRIH_KARO * w).toFloat()
        if (karo < 4f) return
        val birim = karo / 48f
        val noktalar = DuvarCizim.girihNoktalari()
        val yildiz = Path()
        val daire = Path()
        var ty = 0f
        while (ty < h) {
            var tx = 0f
            while (tx < w) {
                noktalar.forEachIndexed { i, n ->
                    val px = tx + n.x.toFloat() * birim
                    val py = ty + n.y.toFloat() * birim
                    if (i == 0) yildiz.moveTo(px, py) else yildiz.lineTo(px, py)
                }
                yildiz.close()
                daire.addCircle(tx + 24f * birim, ty + 24f * birim, DuvarCizim.GIRIH_DAIRE_R.toFloat() * birim, Path.Direction.CW)
                tx += karo
            }
            ty += karo
        }
        fun kalem(kalinlik: Double) = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            color = renk
            alpha = alfa(DuvarCizim.GIRIH_OPAKLIK * carpan)
            strokeWidth = kalinlik.toFloat() * birim
        }
        t.drawPath(yildiz, kalem(DuvarCizim.GIRIH_YILDIZ_KALINLIK))
        t.drawPath(daire, kalem(DuvarCizim.GIRIH_DAIRE_KALINLIK))
    }

    /**
     * 24 birimlik çerçevede iki kareden sekiz köşeli yıldız (+ isteğe bağlı daire), merkez ([cx], [cy]),
     * birim [birim] px, çizgi [kalinlik] birim. TEK yol olarak çizilir: kesişimlerde opaklık katlanmaz
     * (önizlemedeki grup opaklığı gibi).
     */
    private fun yildizCiz(tuval: Canvas, cx: Float, cy: Float, birim: Float, renk: Int, opaklik: Float, kalinlik: Float, daire: Boolean) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            color = renk
            alpha = Math.round(255 * opaklik * (Color.alpha(renk) / 255f)).coerceIn(0, 255)
            strokeWidth = kalinlik * birim
            strokeJoin = Paint.Join.ROUND
        }
        val yari = DuvarCizim.YILDIZ_YARI_KENAR.toFloat() * birim
        val kosegen = DuvarCizim.YILDIZ_KOSEGEN.toFloat() * birim
        val yol = Path().apply {
            addRect(cx - yari, cy - yari, cx + yari, cy + yari, Path.Direction.CW)
            moveTo(cx, cy - kosegen)
            lineTo(cx + kosegen, cy)
            lineTo(cx, cy + kosegen)
            lineTo(cx - kosegen, cy)
            close()
            if (daire) addCircle(cx, cy, DuvarCizim.YILDIZ_DAIRE_R.toFloat() * birim, Path.Direction.CW)
        }
        tuval.drawPath(yol, p)
    }
}
