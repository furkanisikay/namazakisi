package com.furkanisikay.namazakisi.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.Layout
import android.text.StaticLayout
import android.text.TextDirectionHeuristics
import android.text.TextPaint
import android.util.Log
import android.util.SizeF
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.RemoteViews
import com.furkanisikay.namazakisi.MainActivity
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.cekirdek.AyetAdayi
import com.furkanisikay.namazakisi.cekirdek.AyetBoyutu
import com.furkanisikay.namazakisi.cekirdek.AyetDuzenSecici
import com.furkanisikay.namazakisi.cekirdek.AyetDuzeni
import com.furkanisikay.namazakisi.cekirdek.AyetIcerigi
import com.furkanisikay.namazakisi.cekirdek.AyetKaydi
import com.furkanisikay.namazakisi.cekirdek.AyetOlcumu
import com.furkanisikay.namazakisi.cekirdek.DuvarAyari
import com.furkanisikay.namazakisi.cekirdek.DuvarKagidiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku
import com.furkanisikay.namazakisi.cekirdek.WidgetAyari
import com.furkanisikay.namazakisi.cekirdek.WidgetZemini
import com.furkanisikay.namazakisi.dildeBaglam
import java.text.DateFormat
import java.util.Calendar
import java.util.Locale

/**
 * Günün ayeti widget'ının çizicisi (#380). Kararlar saf `cekirdek/AyetDuzenSecici`'de; burası
 * ÖLÇER (StaticLayout, gerçek yazı boyutu + sistem yazı ölçeği) ve RemoteViews kurar.
 *
 * - BOYUT: API 31+'da widget'ın GERÇEK boyutları (`OPTION_APPWIDGET_SIZES`, dikey/yatay) için
 *   ayrı ayrı ölçülüp `RemoteViews(Map<SizeF, RemoteViews>)` verilir; öncesinde dikey/yatay çifti
 *   (`RemoteViews(yatay, dikey)`). Yeniden boyutlandırmada `onAppWidgetOptionsChanged` yeniden çizer.
 * - ÖLÇÜM ile XML aynı sayıları kullanır: yazı boyutu ve boşluklar KODDA verilir
 *   (`setTextViewTextSize`, `setViewPadding`), düzen XML'inde değil. Meal `TextView`'ü başlatıcının
 *   `sans-serif` ailesiyle çizilir (XML'de açıkça; başlatıcı teması fontu değiştirmesin) →
 *   ölçüm de aynı aileyle.
 * - ARAPÇA satır beyaz bir resimdir (Amiri Quran), rengi tint ile verilir: Material You / gece
 *   modu başlatıcıda çözülür, tek resim her palete uyar. Resim bütçesi (ekran × 4 × 1,5 bayt) boyut
 *   sayısına bölünür; aşan aday "sığmıyor" sayılır.
 * - Meal ASLA "…" ile kesilmez: sığmayan düzen bir alt adaya, en sonda "dokunun" kartına iner.
 */
object GununAyetiCizici {
    private const val TAG = "GununAyetiCizici"
    const val DERIN_BAGLANTI = "namazakisi://gunun-ayeti"
    private const val ISTEK_KODU = 0x41594554 // "AYET"

    /** `widget_ayet.xml > ayet_yildiz` ile aynı. */
    private const val YILDIZ_DP = 14f
    /** Ölçüm ile başlatıcının yuvarlaması arasındaki pay. */
    private const val GUVENLIK_PAYI_DP = 4f
    private const val TARIH_BOSLUGU_DP = 2f
    private const val ARAPCA_SATIR_CARPANI = 1.05f
    /** Boyut bilinmiyorsa (yerleşimden önce) 4×2 varsayılır. */
    private const val VARSAYILAN_GENISLIK_DP = 300f
    private const val VARSAYILAN_YUKSEKLIK_DP = 180f
    /** API 31+ boyut haritası en çok 16 girdi alır; dikey/yatay için birkaçı yeter. */
    private const val EN_FAZLA_BOYUT = 4

    /** Düzenlerdeki `android:fontFamily="sans-serif"` ile aynı. */
    private val SANS: Typeface = Typeface.create("sans-serif", Typeface.NORMAL)
    private val SANS_KALIN: Typeface = Typeface.create("sans-serif", Typeface.BOLD)

    // --- Renk -------------------------------------------------------------------------

    /** Renk ya kaynak (API 31+'da başlatıcı çözer) ya da çalışma anında hesaplanmış değer (palet). */
    private sealed class Boya {
        class Kaynak(val id: Int) : Boya()
        class Deger(val renk: Int) : Boya()
    }

    private class Renkler(val zemin: Boya, val metin: Boya, val ikincil: Boya, val vurgu: Boya)

    private fun renkler(ayar: WidgetAyari, yuk: GununAyetiYuku?): Renkler {
        if (ayar.zemin == WidgetZemini.PALET) {
            val w = DuvarKagidiKurallari.widgetPaleti(yuk?.duvar?.paletRenk ?: DuvarAyari.VARSAYILAN_PALET)
            return Renkler(Boya.Deger(w.zemin), Boya.Deger(w.metin), Boya.Deger(w.ikincil), Boya.Deger(w.vurgu))
        }
        val p = WidgetGuncelleyici.PALETLER.getValue(ayar.zemin)
        return Renkler(Boya.Kaynak(p.zemin), Boya.Kaynak(p.metin), Boya.Kaynak(p.ikincil), Boya.Kaynak(p.vurgu))
    }

    private fun metinBoya(context: Context, v: RemoteViews, id: Int, b: Boya) = boya(context, v, id, b, "setTextColor")

    private fun gorselBoya(context: Context, v: RemoteViews, id: Int, b: Boya) = boya(context, v, id, b, "setImageTintList")

    private fun boya(context: Context, v: RemoteViews, id: Int, b: Boya, yontem: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            when (b) {
                is Boya.Kaynak -> v.setColorStateList(id, yontem, b.id)
                is Boya.Deger -> v.setColorStateList(id, yontem, ColorStateList.valueOf(b.renk))
            }
            return
        }
        val renk = when (b) {
            is Boya.Kaynak -> context.getColor(b.id)
            is Boya.Deger -> b.renk
        }
        if (yontem == "setTextColor") v.setTextColor(id, renk) else v.setInt(id, "setColorFilter", renk)
    }

    // --- Giriş --------------------------------------------------------------------------

    /** Bir widget örneğinin görünümü (tüm boyutları için). */
    fun gorunum(
        context: Context,
        yonetici: AppWidgetManager,
        appWidgetId: Int,
        yuk: GununAyetiYuku?,
        simdiMs: Long,
    ): RemoteViews {
        val ayar = WidgetVeriDeposu.ayar(context, appWidgetId)
        val icerik = GununAyetiDeposu.icerik(context, appWidgetId)
        val kayit = yuk?.let { GununAyetiKurallari.gecerliKayit(it.plan, simdiMs) }
        val boyutlar = boyutlar(yonetici.getAppWidgetOptions(appWidgetId))
        val dm = context.resources.displayMetrics
        val butce = (dm.widthPixels.toLong() * dm.heightPixels * 4 * 3 / 2) / boyutlar.size
        val c = Cizim(context, yuk, kayit, ayar, icerik, renkler(ayar, yuk), butce)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return RemoteViews(boyutlar.associateWith { c.ciz(it) })
        }
        // API < 31: boyutlar = [dikey, yatay?]
        val dikey = c.ciz(boyutlar[0])
        val yatay = boyutlar.getOrNull(1)?.let { c.ciz(it) } ?: return dikey
        return RemoteViews(yatay, dikey)
    }

    /**
     * Widget'ın gerçek boyutları (dp). API 31+: `OPTION_APPWIDGET_SIZES`. Öncesi: dikeyde
     * genişlik MIN_WIDTH, yükseklik MAX_HEIGHT; yatayda tersi (`WidgetDuzenSecici` notu).
     */
    private fun boyutlar(secenek: Bundle): List<SizeF> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            @Suppress("DEPRECATION")
            val liste = secenek.getParcelableArrayList<SizeF>(AppWidgetManager.OPTION_APPWIDGET_SIZES)
            val gecerli = liste?.filter { it.width > 0f && it.height > 0f }?.distinct()?.take(EN_FAZLA_BOYUT)
            if (!gecerli.isNullOrEmpty()) return gecerli
        }
        val minG = secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0).toFloat()
        val maxG = secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 0).toFloat()
        val minY = secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0).toFloat()
        val maxY = secenek.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0).toFloat()
        if (minG <= 0f || maxY <= 0f) return listOf(SizeF(VARSAYILAN_GENISLIK_DP, VARSAYILAN_YUKSEKLIK_DP))
        val dikey = SizeF(minG, maxY)
        val yatay = SizeF(maxOf(maxG, minG), if (minY > 0f) minY else maxY)
        return listOf(dikey, yatay).distinct()
    }

    // --- Ölçüler ------------------------------------------------------------------------

    /** Bir adayın ölçüleri (dp/sp). Tasarım tuvalindeki değerler; ölçüm ve çizim AYNI sayıyı kullanır. */
    private data class Olcu(
        val padYatayDp: Float,
        val padUstDp: Float,
        val padAltDp: Float,
        val baslik: Boolean,
        val etiketSp: Float,
        val tarih: Boolean,
        val tarihSp: Float,
        val arapcaDp: Float,
        val mealSp: Float,
        val kunyeSp: Float,
        val ortala: Boolean,
        val boslukDp: Float,
    )

    private fun olcu(boyut: AyetBoyutu, aday: AyetAdayi): Olcu {
        val hat = aday.duzen == AyetDuzeni.HAT
        return when (boyut) {
            AyetBoyutu.SERIT -> Olcu(16f, 8f, 8f, false, 11f, false, 12f, 22f, 14f, 11f, false, 3f)
            AyetBoyutu.KARE -> Olcu(14f, 12f, 12f, true, 11f, false, 12f, 24f, 14f, 11f, hat, 6f)
            AyetBoyutu.ORTA -> Olcu(16f, 14f, 12f, true, 11f, false, 12f, if (hat) 28f else 24f, 15f, 11f, true, 6f)
            AyetBoyutu.BUYUK -> if (aday.buyukYazi) {
                Olcu(18f, 16f, 14f, true, 12f, true, 12f, if (hat) 34f else 30f, 18f, 12f, true, 10f)
            } else {
                Olcu(16f, 14f, 12f, true, 11f, true, 12f, if (hat) 28f else 24f, 15f, 11f, true, 6f)
            }
        }
    }

    /** Ölçülmüş aday: çizim aynı yerleşimi (Arapça) yeniden kullanır. */
    private class Hazirlik(
        val aday: AyetAdayi,
        val olcu: Olcu,
        val arapca: StaticLayout?,
        val mealVar: Boolean,
        val kunye: String,
        val olcum: AyetOlcumu,
    )

    private class Cizim(
        val context: Context,
        val yuk: GununAyetiYuku?,
        val kayit: AyetKaydi?,
        val ayar: WidgetAyari,
        val icerik: AyetIcerigi,
        val renk: Renkler,
        val bitmapButcesi: Long,
    ) {
        private val dm = context.resources.displayMetrics
        private val dokunus: PendingIntent? = dokunusNiyeti(context)
        private val erisim: String = when {
            yuk != null && kayit != null -> GununAyetiKurallari.erisimMetni(kayit, yuk.metin)
            else -> context.dildeBaglam().getString(R.string.widget_uygulamayi_acin)
        }

        fun dp(d: Float): Float = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, d, dm)
        fun sp(s: Float): Float = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, s, dm)
        fun dpi(d: Float): Int = Math.round(dp(d))

        fun ciz(boyut: SizeF): RemoteViews = try {
            cizGuvenli(boyut)
        } catch (e: Throwable) {
            Log.e(TAG, "Ayet widget'i cizilemedi: $boyut", e)
            veriYokKarti(AyetBoyutu.KARE)
        }

        private fun cizGuvenli(boyut: SizeF): RemoteViews {
            val sinif = AyetDuzenSecici.boyut(boyut.width, boyut.height)
            val y = yuk
            val k = kayit
            if (y == null || k == null) return veriYokKarti(sinif)
            val adaylar = AyetDuzenSecici.adaylar(sinif, icerik, mealVar = k.meal != null)
            val hazirliklar = HashMap<AyetAdayi, Hazirlik>()
            val secim = AyetDuzenSecici.sec(adaylar) { aday ->
                hazirla(sinif, boyut, aday, y, k).also { hazirliklar[aday] = it }.olcum
            }
            val h = hazirliklar[secim] ?: return dokununKarti(sinif, y, k)
            return duzenCiz(sinif, h, y, k)
        }

        // --- Ölçüm --------------------------------------------------------------------

        private fun hazirla(sinif: AyetBoyutu, boyut: SizeF, aday: AyetAdayi, y: GununAyetiYuku, k: AyetKaydi): Hazirlik {
            val o = olcu(sinif, aday)
            val icGenislik = maxOf(1, Math.round(dp(boyut.width) - 2 * dp(o.padYatayDp)))
            val arapcaVar = aday.duzen == AyetDuzeni.ARAPCA_MEAL || aday.duzen == AyetDuzeni.HAT
            val mealVar = (aday.duzen == AyetDuzeni.ARAPCA_MEAL || aday.duzen == AyetDuzeni.MEAL) && k.meal != null
            val kunye = GununAyetiKurallari.widgetKunyesi(k, y.metin, mealVar, arapcaVar)

            var gereken = dp(o.padUstDp) + dp(o.padAltDp)
            if (o.baslik) gereken += maxOf(dp(YILDIZ_DP), tekSatirYuksekligi(sp(o.etiketSp), SANS_KALIN))
            if (o.tarih) gereken += dp(TARIH_BOSLUGU_DP) + tekSatirYuksekligi(sp(o.tarihSp), SANS)
            // Gövde: üst + alt boşluk (şeritte yalnız künyenin üstü).
            gereken += if (sinif == AyetBoyutu.SERIT) dp(o.boslukDp) else 2 * dp(o.boslukDp)

            var arapcaSatir = 0
            var arapca: StaticLayout? = null
            if (arapcaVar) {
                val a = arapcaYerlesimi(k.ar, dp(o.arapcaDp), icGenislik)
                arapca = a
                arapcaSatir = a.lineCount
                // Resim bütçesi aşılırsa bu aday sığmaz sayılır (Android 17'de aşım hata atar).
                if (icGenislik.toLong() * a.height * 4 > bitmapButcesi) arapcaSatir = Int.MAX_VALUE
                gereken += a.height
            }
            var mealSatir = 0
            if (mealVar) {
                val m = metinYerlesimi(k.meal.orEmpty(), sp(o.mealSp), SANS, icGenislik)
                mealSatir = m.lineCount
                gereken += m.height
                if (arapcaVar) gereken += dp(o.boslukDp)
            }
            gereken += tekSatirYuksekligi(sp(o.kunyeSp), SANS)
            val kullanilabilir = dp(boyut.height) - dp(GUVENLIK_PAYI_DP)
            return Hazirlik(
                aday, o, arapca, mealVar, kunye,
                AyetOlcumu(Math.ceil(gereken.toDouble()).toInt(), kullanilabilir.toInt(), arapcaSatir, mealSatir),
            )
        }

        private fun metinYerlesimi(metin: String, boyutPx: Float, yazitipi: Typeface, genislik: Int): StaticLayout {
            val boya = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
                textSize = boyutPx
                typeface = yazitipi
            }
            val kurucu = StaticLayout.Builder.obtain(metin, 0, metin.length, boya, genislik)
                .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                .setIncludePad(true)
                .setLineSpacing(0f, 1f)
                .setBreakStrategy(Layout.BREAK_STRATEGY_HIGH_QUALITY)
                .setHyphenationFrequency(Layout.HYPHENATION_FREQUENCY_NONE)
            // TextView (targetSdk ≥ 28) yedek font satır yüksekliğini kullanır; ölçüm de öyle.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) kurucu.setUseLineSpacingFromFallbacks(true)
            return kurucu.build()
        }

        private fun tekSatirYuksekligi(boyutPx: Float, yazitipi: Typeface): Float =
            metinYerlesimi("Ağ", boyutPx, yazitipi, Int.MAX_VALUE / 4).height.toFloat()

        private fun arapcaYerlesimi(ar: String, boyutPx: Float, genislik: Int): StaticLayout {
            val boya = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
                textSize = boyutPx
                typeface = AyetYazitipleri.arapca(context)
                color = Color.WHITE
            }
            return StaticLayout.Builder.obtain(ar, 0, ar.length, boya, genislik)
                .setAlignment(Layout.Alignment.ALIGN_CENTER)
                .setTextDirection(TextDirectionHeuristics.RTL)
                .setIncludePad(true)
                .setLineSpacing(0f, ARAPCA_SATIR_CARPANI)
                .setBreakStrategy(Layout.BREAK_STRATEGY_HIGH_QUALITY)
                .build()
        }

        /** Beyaz Arapça satırı (tint ile renklenir). */
        private fun arapcaResmi(y: StaticLayout): Bitmap {
            val bmp = Bitmap.createBitmap(maxOf(1, y.width), maxOf(1, y.height), Bitmap.Config.ARGB_8888)
            y.draw(Canvas(bmp))
            return bmp
        }

        // --- Çizim --------------------------------------------------------------------

        private fun ortak(v: RemoteViews) {
            gorselBoya(context, v, R.id.ayet_zemin, renk.zemin)
            v.setInt(R.id.ayet_zemin, "setImageAlpha", ayar.zeminAlfasi())
            dokunus?.let { v.setOnClickPendingIntent(R.id.ayet_kok, it) }
            v.setContentDescription(R.id.ayet_kok, erisim)
        }

        private fun baslik(v: RemoteViews, etiket: String, etiketSp: Float) {
            v.setTextViewText(R.id.ayet_etiket, etiket)
            v.setTextViewTextSize(R.id.ayet_etiket, TypedValue.COMPLEX_UNIT_SP, etiketSp)
            metinBoya(context, v, R.id.ayet_etiket, renk.vurgu)
            gorselBoya(context, v, R.id.ayet_yildiz, renk.vurgu)
        }

        private fun duzenCiz(sinif: AyetBoyutu, h: Hazirlik, y: GununAyetiYuku, k: AyetKaydi): RemoteViews {
            val o = h.olcu
            val serit = sinif == AyetBoyutu.SERIT
            val v = RemoteViews(context.packageName, if (serit) R.layout.widget_ayet_serit else R.layout.widget_ayet)
            ortak(v)
            v.setViewPadding(R.id.ayet_icerik, dpi(o.padYatayDp), dpi(o.padUstDp), dpi(o.padYatayDp), dpi(o.padAltDp))
            val hiza = if (o.ortala) Gravity.CENTER_HORIZONTAL else Gravity.START

            if (!serit) {
                v.setViewVisibility(R.id.ayet_baslik, if (o.baslik) View.VISIBLE else View.GONE)
                baslik(v, y.metin.etiket, o.etiketSp)
                val tarih = if (o.tarih) tarihMetni(k.gun, y.dil) else null
                v.setViewVisibility(R.id.ayet_tarih, if (tarih != null) View.VISIBLE else View.GONE)
                if (tarih != null) {
                    v.setTextViewText(R.id.ayet_tarih, tarih)
                    v.setTextViewTextSize(R.id.ayet_tarih, TypedValue.COMPLEX_UNIT_SP, o.tarihSp)
                    v.setViewPadding(R.id.ayet_tarih, 0, dpi(TARIH_BOSLUGU_DP), 0, 0)
                    metinBoya(context, v, R.id.ayet_tarih, renk.ikincil)
                }
                v.setViewPadding(R.id.ayet_govde, 0, dpi(o.boslukDp), 0, dpi(o.boslukDp))
            }

            val arapca = h.arapca
            if (arapca != null) {
                v.setImageViewBitmap(R.id.ayet_arapca, arapcaResmi(arapca))
                gorselBoya(context, v, R.id.ayet_arapca, renk.metin)
                v.setViewVisibility(R.id.ayet_arapca, View.VISIBLE)
            } else {
                v.setViewVisibility(R.id.ayet_arapca, View.GONE)
            }

            if (h.mealVar) {
                v.setTextViewText(R.id.ayet_meal, k.meal)
                v.setTextViewTextSize(R.id.ayet_meal, TypedValue.COMPLEX_UNIT_SP, o.mealSp)
                v.setInt(R.id.ayet_meal, "setGravity", hiza)
                v.setViewPadding(R.id.ayet_meal, 0, if (arapca != null) dpi(o.boslukDp) else 0, 0, 0)
                metinBoya(context, v, R.id.ayet_meal, renk.metin)
                v.setViewVisibility(R.id.ayet_meal, View.VISIBLE)
            } else {
                v.setViewVisibility(R.id.ayet_meal, View.GONE)
            }

            v.setTextViewText(R.id.ayet_kunye, h.kunye)
            v.setTextViewTextSize(R.id.ayet_kunye, TypedValue.COMPLEX_UNIT_SP, o.kunyeSp)
            v.setInt(R.id.ayet_kunye, "setGravity", hiza)
            v.setViewPadding(R.id.ayet_kunye, 0, if (serit) dpi(o.boslukDp) else 0, 0, 0)
            metinBoya(context, v, R.id.ayet_kunye, renk.ikincil)
            return v
        }

        /** "Bugünün ayeti bu boyuta sığmıyor. Okumak için dokunun." — künye + metin + "Açın". */
        private fun dokununKarti(sinif: AyetBoyutu, y: GununAyetiYuku, k: AyetKaydi): RemoteViews {
            val v = kart(sinif)
            if (sinif != AyetBoyutu.SERIT) {
                baslik(v, y.metin.etiket, 11f)
                v.setTextViewText(R.id.ayet_dokunun_acin, y.metin.acin)
                metinBoya(context, v, R.id.ayet_dokunun_acin, renk.vurgu)
            }
            v.setTextViewText(R.id.ayet_dokunun_kunye, k.kisaKunye)
            v.setTextViewText(R.id.ayet_dokunun_metin, y.metin.sigmiyor)
            return v
        }

        /** Yük yoksa (uygulama henüz yazmadı ya da bozuk): "Günün ayeti · Uygulamayı açın". */
        fun veriYokKarti(sinif: AyetBoyutu): RemoteViews {
            val m = context.dildeBaglam()
            val v = kart(sinif)
            if (sinif != AyetBoyutu.SERIT) {
                baslik(v, m.getString(R.string.widget_ayet_adi), 11f)
                v.setViewVisibility(R.id.ayet_dokunun_acin, View.GONE)
                v.setViewVisibility(R.id.ayet_dokunun_ok, View.GONE)
            }
            v.setTextViewText(R.id.ayet_dokunun_kunye, m.getString(R.string.widget_uygulamayi_acin))
            v.setViewVisibility(R.id.ayet_dokunun_metin, View.GONE)
            return v
        }

        private fun kart(sinif: AyetBoyutu): RemoteViews {
            val serit = sinif == AyetBoyutu.SERIT
            val v = RemoteViews(context.packageName, if (serit) R.layout.widget_ayet_dokunun_serit else R.layout.widget_ayet_dokunun)
            ortak(v)
            metinBoya(context, v, R.id.ayet_dokunun_kunye, renk.metin)
            metinBoya(context, v, R.id.ayet_dokunun_metin, renk.ikincil)
            gorselBoya(context, v, R.id.ayet_dokunun_ok, renk.vurgu)
            return v
        }
    }

    /** 4×3'ün tarih satırı: namaz gününün takvim tarihi, yükün dilinde ("24 Ekim 2026"). */
    private fun tarihMetni(gun: String, dil: String): String? = try {
        val p = gun.split('-').map { it.toInt() }
        val c = Calendar.getInstance().apply {
            clear()
            set(p[0], p[1] - 1, p[2])
        }
        DateFormat.getDateInstance(DateFormat.LONG, Locale.forLanguageTag(dil)).format(c.time)
    } catch (_: Exception) {
        null
    }

    /** Dokunuş uygulamada "Günün ayeti" sayfasını açar (açık bileşen: seçim penceresi çıkmaz). */
    private fun dokunusNiyeti(context: Context): PendingIntent? = try {
        val niyet = Intent(Intent.ACTION_VIEW, Uri.parse(DERIN_BAGLANTI))
            .setClass(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        PendingIntent.getActivity(
            context, ISTEK_KODU, niyet, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    } catch (e: Exception) {
        Log.w(TAG, "Dokunus niyeti kurulamadi", e)
        null
    }
}
