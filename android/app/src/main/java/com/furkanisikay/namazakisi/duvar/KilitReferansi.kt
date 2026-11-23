package com.furkanisikay.namazakisi.duvar

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.ExifInterface
import android.net.Uri
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.DuvarOlcumu
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream

/**
 * Kilit ekranı saat alanı ölçümünün Android kısmı (karar JS `saatAlaniBul`'da, piksel karşılaştırması
 * saf `DuvarOlcumu`'da).
 *
 * - **Referans:** kilit görseli her BAŞARILI yazımda 270 px genişliğe küçültülüp (oran korunur)
 *   `filesDir/duvar/son-kilit.png`'ye atomik yazılır (geçici dosya → `renameTo`). Yedeklenmez
 *   (`allowBackup=false`). Kopya yazılamazsa duvar kâğıdı yazımı yine başarılı sayılır.
 * - **Profil:** kullanıcının kilit ekranı görüntüsü (content:// ya da file://) TEK kez okunur, küçülterek
 *   çözülür, EXIF yönü uygulanır; oran referanstan %3'ten fazla farklıysa `oran`. İkisi de
 *   108 × round(108·h/w) boyutuna küçültülüp satır profili çıkarılır.
 */
object KilitReferansi {
    private const val TAG = "KilitReferansi"
    private const val DIZIN = "duvar"
    private const val AD = "son-kilit.png"

    /** Ekran görüntüsünden en çok bu kadar bayt okunur (daha büyüğü ekran görüntüsü değildir). */
    private const val EN_COK_BAYT = 48 * 1024 * 1024

    sealed class Sonuc {
        class Profil(val satirlar: DoubleArray) : Sonuc()

        /** `referans-yok` | `okunamadi` | `oran`. */
        class Hata(val kod: String) : Sonuc()
    }

    fun dosya(context: Context): File = File(File(context.filesDir, DIZIN), AD)

    /** Kilit görselinin küçük kopyasını atomik yazar; hata yalnız loglanır. */
    fun kaydet(context: Context, kilit: Bitmap) {
        try {
            val g = DuvarOlcumu.REFERANS_GENISLIGI
            val y = DuvarOlcumu.referansYuksekligi(kilit.width, kilit.height)
            val kucuk = Bitmap.createScaledBitmap(kilit, g, y, true)
            try {
                val hedef = dosya(context)
                val dizin = hedef.parentFile ?: throw IOException("dizin yok")
                if (!dizin.isDirectory && !dizin.mkdirs()) throw IOException("dizin acilamadi")
                val gecici = File(dizin, "$AD.tmp")
                FileOutputStream(gecici).use { cikis ->
                    if (!kucuk.compress(Bitmap.CompressFormat.PNG, 100, cikis)) throw IOException("png yazilamadi")
                    cikis.fd.sync()
                }
                if (!gecici.renameTo(hedef)) {
                    gecici.delete()
                    throw IOException("yeniden adlandirilamadi")
                }
            } finally {
                if (kucuk !== kilit) kucuk.recycle()
            }
        } catch (e: Throwable) {
            Log.w(TAG, "Kilit referansi yazilamadi", e)
        }
    }

    /** Görüntünün satır profili ya da hata kodu. Arka plan iş parçacığında çağrılır. */
    fun profil(context: Context, uri: String): Sonuc {
        val ref = dosya(context).takeIf { it.isFile } ?: return Sonuc.Hata("referans-yok")
        val referans = BitmapFactory.decodeFile(ref.path) ?: return Sonuc.Hata("referans-yok")
        try {
            val baytlar = try {
                oku(context, uri)
            } catch (e: Exception) {
                Log.w(TAG, "Goruntu okunamadi", e)
                null
            } ?: return Sonuc.Hata("okunamadi")
            val ekran = coz(baytlar) ?: return Sonuc.Hata("okunamadi")
            try {
                if (!DuvarOlcumu.oranUyar(ekran.width, ekran.height, referans.width, referans.height)) return Sonuc.Hata("oran")
                val g = DuvarOlcumu.OLCUM_GENISLIGI
                val y = DuvarOlcumu.olcumYuksekligi(referans.width, referans.height)
                return Sonuc.Profil(DuvarOlcumu.satirProfili(parlaklik(ekran, g, y), parlaklik(referans, g, y), g))
            } finally {
                ekran.recycle()
            }
        } finally {
            referans.recycle()
        }
    }

    /** content:// / file:// (ya da düz yol) → bayt; [EN_COK_BAYT]'ı aşarsa `null`. */
    private fun oku(context: Context, uri: String): ByteArray? {
        val u = Uri.parse(uri)
        val akis: InputStream = if (u.scheme.isNullOrEmpty()) FileInputStream(File(uri)) else context.contentResolver.openInputStream(u) ?: return null
        akis.use { giris ->
            val cikis = ByteArrayOutputStream()
            val tampon = ByteArray(64 * 1024)
            while (true) {
                val n = giris.read(tampon)
                if (n < 0) break
                cikis.write(tampon, 0, n)
                if (cikis.size() > EN_COK_BAYT) return null
            }
            return cikis.toByteArray()
        }
    }

    /** Ölçüme yetecek kadar küçülterek çözer (kısa kenar ≥ 2×108 kalır) ve EXIF yönünü uygular. */
    private fun coz(baytlar: ByteArray): Bitmap? {
        val sinir = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(baytlar, 0, baytlar.size, sinir)
        if (sinir.outWidth <= 0 || sinir.outHeight <= 0) return null
        val kisa = minOf(sinir.outWidth, sinir.outHeight)
        var ornek = 1
        while (kisa / (ornek * 2) >= 2 * DuvarOlcumu.OLCUM_GENISLIGI) ornek *= 2
        val ham = BitmapFactory.decodeByteArray(
            baytlar, 0, baytlar.size,
            BitmapFactory.Options().apply {
                inSampleSize = ornek
                inPreferredConfig = Bitmap.Config.ARGB_8888
            },
        ) ?: return null
        val yon = try {
            ExifInterface(ByteArrayInputStream(baytlar)).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
        } catch (_: Exception) {
            ExifInterface.ORIENTATION_NORMAL
        }
        return DuvarFotoZemini.yonUygula(ham, yon)
    }

    /** [g]×[y]'ye süzgeçli küçültülmüş görselin satır satır parlaklığı. */
    private fun parlaklik(bmp: Bitmap, g: Int, y: Int): DoubleArray {
        val kucuk = Bitmap.createScaledBitmap(bmp, g, y, true)
        try {
            val p = IntArray(g * y)
            kucuk.getPixels(p, 0, g, 0, 0, g, y)
            return DuvarOlcumu.parlaklikDizisi(p)
        } finally {
            if (kucuk !== bmp) kucuk.recycle()
        }
    }
}
