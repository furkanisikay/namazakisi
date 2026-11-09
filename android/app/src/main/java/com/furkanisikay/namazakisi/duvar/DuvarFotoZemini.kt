package com.furkanisikay.namazakisi.duvar

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Rect
import android.media.ExifInterface
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.DuvarAyari
import com.furkanisikay.namazakisi.cekirdek.DuvarCizim
import com.furkanisikay.namazakisi.cekirdek.DuvarFotoAyari
import com.furkanisikay.namazakisi.cekirdek.DuvarTasarimi
import com.furkanisikay.namazakisi.cekirdek.DuvarZemini
import java.io.File

/**
 * Duvar kâğıdının fotoğraf zemini (sözleşme `duvar.foto`). Dosya uygulamanın kendi kopyasıdır:
 * `filesDir/duvar/<dosya>` (ad `DuvarTasarimi.fotoAyariCoz` ile süzülür; yol taşınmaz). Dosya
 * yoksa ya da çözülemezse `null` → çizici gece zeminine düşer.
 *
 * Sıra: sınırları oku → EXIF yönü (`android.media.ExifInterface`, yeni bağımlılık yok) → ekran
 * boyutuna yetecek en büyük `inSampleSize` ile çöz → yönü uygula → (x, y) merkezli, [yakinlik]
 * yakınlaştırmalı "cover" kırpma → bulanıklık (kısa kenarın `bulaniklik × %4`'ü yarıçap; küçültülmüş
 * kopyada kutu bulanıklığı, RenderScript YOK). Karartma çizicide uygulanır.
 */
object DuvarFotoZemini {
    private const val TAG = "DuvarFotoZemini"
    private const val DIZIN = "duvar"

    /** Fotoğraf zemini seçiliyse dosyası (var olsun olmasın); değilse `null`. */
    fun dosya(context: Context, ayar: DuvarAyari): File? {
        if (ayar.zemin != DuvarZemini.FOTO) return null
        val ad = ayar.foto.dosya ?: return null
        return File(File(context.filesDir, DIZIN), ad)
    }

    /** İmza için: dosya varsa değişme zamanı, yoksa `null` (gece zeminine düşülecek). */
    fun damga(context: Context, ayar: DuvarAyari): Long? = try {
        dosya(context, ayar)?.takeIf { it.isFile }?.lastModified()
    } catch (_: Exception) {
        null
    }

    /** Ekran boyutunda ([w]×[h]) kırpılmış ve bulanıklaştırılmış zemin; olmazsa `null`. Çağıran `recycle()` eder. */
    fun hazirla(context: Context, ayar: DuvarAyari, w: Int, h: Int): Bitmap? {
        val f = dosya(context, ayar)?.takeIf { it.isFile } ?: return null
        return try {
            hazirla(f, ayar.foto, w, h)
        } catch (e: OutOfMemoryError) {
            Log.e(TAG, "Fotograf icin bellek yetmedi", e)
            null
        } catch (e: Exception) {
            Log.e(TAG, "Fotograf zemini hazirlanamadi", e)
            null
        }
    }

    private fun hazirla(dosya: File, a: DuvarFotoAyari, w: Int, h: Int): Bitmap? {
        val sinir = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(dosya.path, sinir)
        if (sinir.outWidth <= 0 || sinir.outHeight <= 0) return null
        val yon = exifYonu(dosya)
        val yanYatik = yon == ExifInterface.ORIENTATION_ROTATE_90 || yon == ExifInterface.ORIENTATION_ROTATE_270 ||
            yon == ExifInterface.ORIENTATION_TRANSPOSE || yon == ExifInterface.ORIENTATION_TRANSVERSE
        val gw = if (yanYatik) sinir.outHeight else sinir.outWidth
        val gh = if (yanYatik) sinir.outWidth else sinir.outHeight
        // Kaynak pikseli başına ekran pikseli; kırpılan bölge ekrana bu oranla büyür.
        val olcek = maxOf(w.toDouble() / gw, h.toDouble() / gh) * a.yakinlik
        var ornek = 1
        while (ornek * 2 <= 1.0 / olcek) ornek *= 2
        val ham = BitmapFactory.decodeFile(
            dosya.path,
            BitmapFactory.Options().apply {
                inSampleSize = ornek
                inPreferredConfig = Bitmap.Config.ARGB_8888
            },
        ) ?: return null
        val yonlu = yonUygula(ham, yon)
        try {
            // Kırpma JS `fotoYerlesimi` ile aynı (eşlik: DuvarTasarimiTest.fotoKirpmasiOrnekle).
            val k = DuvarCizim.fotoKirpmasi(
                yonlu.width.toDouble(), yonlu.height.toDouble(), w.toDouble(), h.toDouble(), a.x, a.y, a.yakinlik,
            )
            val kaynak = Rect(
                Math.round(k.x).toInt(), Math.round(k.y).toInt(),
                Math.round(k.x + k.genislik).toInt().coerceAtMost(yonlu.width), Math.round(k.y + k.yukseklik).toInt().coerceAtMost(yonlu.height),
            )
            val ekran = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
            Canvas(ekran).drawBitmap(yonlu, kaynak, Rect(0, 0, w, h), Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG))
            val yaricap = a.bulaniklik * 0.04 * minOf(w, h)
            if (yaricap < 1.0) return ekran
            val bulanik = bulaniklastir(ekran, yaricap)
            if (bulanik !== ekran) ekran.recycle()
            return bulanik
        } finally {
            yonlu.recycle()
        }
    }

    private fun exifYonu(dosya: File): Int = try {
        ExifInterface(dosya.path).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
    } catch (_: Exception) {
        ExifInterface.ORIENTATION_NORMAL
    }

    /** EXIF yönünü uygular (döndürme/yansıtma); gerekmiyorsa aynı nesne. */
    private fun yonUygula(bmp: Bitmap, yon: Int): Bitmap {
        val m = Matrix()
        when (yon) {
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> m.setScale(-1f, 1f)
            ExifInterface.ORIENTATION_ROTATE_180 -> m.setRotate(180f)
            ExifInterface.ORIENTATION_FLIP_VERTICAL -> { m.setRotate(180f); m.postScale(-1f, 1f) }
            ExifInterface.ORIENTATION_TRANSPOSE -> { m.setRotate(90f); m.postScale(-1f, 1f) }
            ExifInterface.ORIENTATION_ROTATE_90 -> m.setRotate(90f)
            ExifInterface.ORIENTATION_TRANSVERSE -> { m.setRotate(-90f); m.postScale(-1f, 1f) }
            ExifInterface.ORIENTATION_ROTATE_270 -> m.setRotate(-90f)
            else -> return bmp
        }
        val donmus = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true)
        if (donmus !== bmp) bmp.recycle()
        return donmus
    }

    /**
     * Hızlı bulanıklık: görsel yarıçap/6 oranında küçültülür, küçük kopyada üç geçişli kutu
     * bulanıklığı (Gauss yaklaşımı), sonra süzgeçli büyütülür. Döner: yeni bitmap.
     */
    fun bulaniklastir(kaynak: Bitmap, yaricapPx: Double): Bitmap {
        val oran = maxOf(1.0, yaricapPx / 6.0)
        val kw = maxOf(1, Math.round(kaynak.width / oran).toInt())
        val kh = maxOf(1, Math.round(kaynak.height / oran).toInt())
        val kucuk = Bitmap.createScaledBitmap(kaynak, kw, kh, true)
        val r = maxOf(1, Math.round(yaricapPx / oran / 3.0).toInt())
        val p = IntArray(kw * kh)
        kucuk.getPixels(p, 0, kw, 0, 0, kw, kh)
        val gecici = IntArray(p.size)
        repeat(3) {
            kutuGecisi(p, gecici, kw, kh, r, yatay = true)
            kutuGecisi(gecici, p, kw, kh, r, yatay = false)
        }
        val sonuc = Bitmap.createBitmap(kw, kh, Bitmap.Config.ARGB_8888)
        sonuc.setPixels(p, 0, kw, 0, 0, kw, kh)
        if (kucuk !== kaynak) kucuk.recycle()
        val buyuk = Bitmap.createScaledBitmap(sonuc, kaynak.width, kaynak.height, true)
        if (buyuk !== sonuc) sonuc.recycle()
        return buyuk
    }

    /** Tek yönde kayan toplamlı kutu bulanıklığı (kenarlar kenar pikseliyle uzatılır). */
    private fun kutuGecisi(kaynak: IntArray, hedef: IntArray, w: Int, h: Int, r: Int, yatay: Boolean) {
        val uzunluk = if (yatay) w else h
        val satirlar = if (yatay) h else w
        val pencere = 2 * r + 1
        for (s in 0 until satirlar) {
            fun indeks(i: Int): Int {
                val k = i.coerceIn(0, uzunluk - 1)
                return if (yatay) s * w + k else k * w + s
            }
            var a = 0
            var rr = 0
            var g = 0
            var b = 0
            for (i in -r..r) {
                val c = kaynak[indeks(i)]
                a += c ushr 24; rr += (c shr 16) and 255; g += (c shr 8) and 255; b += c and 255
            }
            for (i in 0 until uzunluk) {
                hedef[indeks(i)] = ((a / pencere) shl 24) or ((rr / pencere) shl 16) or ((g / pencere) shl 8) or (b / pencere)
                val cik = kaynak[indeks(i - r)]
                val gir = kaynak[indeks(i + r + 1)]
                a += (gir ushr 24) - (cik ushr 24)
                rr += ((gir shr 16) and 255) - ((cik shr 16) and 255)
                g += ((gir shr 8) and 255) - ((cik shr 8) and 255)
                b += (gir and 255) - (cik and 255)
            }
        }
    }

    /**
     * Çizilmiş tuvalde (karartma dahil) [kutu] bölgesinin ORTALAMA bağıl parlaklığı (WCAG,
     * kanallar doğrusallaştırılarak); ~64×64 noktalı seyrek örnek.
     */
    fun ortalamaParlaklik(bmp: Bitmap, kutu: Rect): Double {
        val sol = kutu.left.coerceIn(0, bmp.width - 1)
        val sag = kutu.right.coerceIn(sol + 1, bmp.width)
        val ust = kutu.top.coerceIn(0, bmp.height - 1)
        val alt = kutu.bottom.coerceIn(ust + 1, bmp.height)
        val adimX = maxOf(1, (sag - sol) / 64)
        val adimY = maxOf(1, (alt - ust) / 64)
        var toplam = 0.0
        var sayi = 0
        var y = ust
        while (y < alt) {
            var x = sol
            while (x < sag) {
                toplam += DuvarTasarimi.bagilParlaklik(bmp.getPixel(x, y))
                sayi++
                x += adimX
            }
            y += adimY
        }
        return if (sayi == 0) 0.0 else toplam / sayi
    }
}
