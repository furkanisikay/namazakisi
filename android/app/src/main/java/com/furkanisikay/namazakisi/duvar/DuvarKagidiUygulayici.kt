package com.furkanisikay.namazakisi.duvar

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Point
import android.hardware.display.DisplayManager
import android.util.Log
import android.view.Display
import com.furkanisikay.namazakisi.cekirdek.DuvarEkrani
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.widget.GununAyetiDeposu
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Günün ayeti duvar kâğıdını uygular (#381). Ayarlar yükün `duvar` nesnesinden gelir (ayrı
 * depolama YOK); JS yazar (`WidgetVeri.gununAyetiKaydet`).
 *
 * - `WallpaperManager.setBitmap(…, FLAG_LOCK | FLAG_SYSTEM)`, izin `SET_WALLPAPER` (normal izin,
 *   kurulumda sorulmaz). Ön plan servisi, WorkManager, pil muafiyeti, depolama izni YOK.
 * - İDEMPOTENT: görsel yalnız İMZA (gün + metin + duvar ayarı, `GununAyetiKurallari.duvarImzasi`)
 *   son başarılı yazımdan farklıysa yazılır. Yük her açılışta / konum değişiminde / arka plan
 *   turunda yeniden yazılır; her `setBitmap` kilit ekranını titretir ve Material You renklerini
 *   yeniden türetir. [simdiUygula] imzayı yok sayar (kullanıcı istedi).
 * - Mevcut duvar kâğıdı SAKLANMAZ (Android 14+'ta okunamaz) → kapatınca geri yükleme yok; yer
 *   değişince eski ekrandaki görsel kalır.
 * - Hata `sonHata = "yazilamadi"` olarak kaydedilir (`DuvarKagidi.durum`), başarıda silinir.
 * - İş tek arka plan iş parçacığında sıralanır (çizim + yazım ~yüzlerce ms; ana iş parçacığı değil).
 */
object DuvarKagidiUygulayici {
    private const val TAG = "DuvarKagidiUygulayici"
    private const val ONIZLEME_ONEKI = "gunun-ayeti-onizleme-"
    /** Ekran okunamazsa (beklenmez) kullanılan boyut. */
    private const val YEDEK_GENISLIK = 1080
    private const val YEDEK_YUKSEKLIK = 2400
    private const val EN_BUYUK_ONIZLEME = 4096

    private val yurutucu: ExecutorService by lazy { Executors.newSingleThreadExecutor() }

    /** Cihaz duvar kâğıdını destekliyor VE yönetim (iş/okul profili) değiştirmeye izin veriyor mu? */
    fun izinliMi(context: Context): Boolean = try {
        val wm = WallpaperManager.getInstance(context)
        wm.isWallpaperSupported && wm.isSetWallpaperAllowed
    } catch (_: Exception) {
        false
    }

    /** İmza değiştiyse ve duvar kâğıdı açıksa arka planda uygular; [bitince] her durumda çağrılır. */
    fun arkaPlandaGerekirseUygula(context: Context, bitince: (() -> Unit)? = null) {
        val uygulama = context.applicationContext
        try {
            yurutucu.execute {
                try {
                    uygula(uygulama, zorla = false)
                } catch (e: Throwable) {
                    Log.e(TAG, "Duvar kagidi uygulanamadi", e)
                } finally {
                    bitince?.invoke()
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Duvar kagidi isi kuyruga alinamadi", e)
            bitince?.invoke()
        }
    }

    /** Bugünün görselini ŞİMDİ uygular (imza yok sayılır); sonuç arka plan iş parçacığından gelir. */
    fun arkaPlandaSimdiUygula(context: Context, sonuc: (Boolean) -> Unit) {
        val uygulama = context.applicationContext
        yurutucu.execute {
            val basarili = try {
                uygula(uygulama, zorla = true)
            } catch (e: Throwable) {
                Log.e(TAG, "Duvar kagidi uygulanamadi", e)
                false
            }
            sonuc(basarili)
        }
    }

    /**
     * @param zorla true: `duvar.acik` ve imza denetlenmez.
     * @return true: yazıldı ya da yazmaya gerek yoktu; false: yazılamadı (ya da yük yok).
     */
    private fun uygula(context: Context, zorla: Boolean): Boolean {
        val yuk = GununAyetiDeposu.yuk(context) ?: return !zorla
        if (!zorla && !yuk.duvar.acik) return true
        val kayit = GununAyetiKurallari.gecerliKayit(yuk.plan, System.currentTimeMillis()) ?: return false
        val imza = GununAyetiKurallari.duvarImzasi(kayit, yuk.metin, yuk.duvar)
        if (!zorla && imza == GununAyetiDeposu.duvarImzasi(context)) return true
        if (!izinliMi(context)) {
            GununAyetiDeposu.duvarBasarisiz(context)
            return false
        }
        val wm = WallpaperManager.getInstance(context)
        val (genislik, yukseklik) = ekranBoyutu(context)
        return try {
            // Sıra: önce ana ekran, sonra kilit (`DuvarAyari.ekranlar`): kilidin ayrı görseli yokken
            // yalnız FLAG_SYSTEM yazımında sistem eski ortak görseli kilide taşır (AOSP
            // `migrateSystemToLockWallpaperLocked`; cihazda DOĞRULANMADI) — kilit en son yazılınca
            // hangi durumda olursa olsun kendi ayet görselinde kalır.
            for (ekran in yuk.duvar.ekranlar()) {
                val bmp = DuvarKagidiCizici.ciz(context, yuk, kayit, ekran, genislik, yukseklik)
                try {
                    val bayrak = if (ekran == DuvarEkrani.KILIT) WallpaperManager.FLAG_LOCK else WallpaperManager.FLAG_SYSTEM
                    val kimlik = wm.setBitmap(bmp, null, true, bayrak)
                    if (kimlik == 0) throw IllegalStateException("setBitmap 0 dondu: $ekran")
                } finally {
                    bmp.recycle()
                }
            }
            GununAyetiDeposu.duvarBasarili(context, imza)
            true
        } catch (e: Throwable) {
            Log.e(TAG, "Duvar kagidi yazilamadi", e)
            GununAyetiDeposu.duvarBasarisiz(context)
            false
        }
    }

    /**
     * Bugünün görselini mevcut ayarla [genislik]×[yukseklik] PNG olarak önbelleğe çizer (ayar
     * ekranının önizlemesi). Yer `ana` ise ana ekran, değilse kilit ekranı görseli. Eski
     * önizlemeler silinir; dosya adı her seferinde yenidir (görsel önbelleği eski resmi tutmasın).
     */
    fun onizlemeUret(context: Context, genislik: Int, yukseklik: Int): File? {
        if (genislik !in 1..EN_BUYUK_ONIZLEME || yukseklik !in 1..EN_BUYUK_ONIZLEME) return null
        val yuk = GununAyetiDeposu.yuk(context) ?: return null
        val kayit = GununAyetiKurallari.gecerliKayit(yuk.plan, System.currentTimeMillis()) ?: return null
        val ekran = if (yuk.duvar.ekranlar() == listOf(DuvarEkrani.ANA)) DuvarEkrani.ANA else DuvarEkrani.KILIT
        val dizin = context.cacheDir
        dizin.listFiles()?.filter { it.name.startsWith(ONIZLEME_ONEKI) }?.forEach { it.delete() }
        val dosya = File(dizin, "$ONIZLEME_ONEKI${System.currentTimeMillis()}.png")
        val bmp = DuvarKagidiCizici.ciz(context, yuk, kayit, ekran, genislik, yukseklik)
        try {
            FileOutputStream(dosya).use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
        } finally {
            bmp.recycle()
        }
        return dosya
    }

    fun arkaPlandaOnizleme(context: Context, genislik: Int, yukseklik: Int, sonuc: (File?) -> Unit) {
        val uygulama = context.applicationContext
        yurutucu.execute {
            val dosya = try {
                onizlemeUret(uygulama, genislik, yukseklik)
            } catch (e: Throwable) {
                Log.e(TAG, "Onizleme uretilemedi", e)
                null
            }
            sonuc(dosya)
        }
    }

    /** Ekranın GERÇEK boyutu, dikey (genişlik ≤ yükseklik). */
    private fun ekranBoyutu(context: Context): Pair<Int, Int> {
        val p = Point()
        try {
            val ekran = context.getSystemService(DisplayManager::class.java)?.getDisplay(Display.DEFAULT_DISPLAY)
            @Suppress("DEPRECATION")
            ekran?.getRealSize(p)
        } catch (e: Exception) {
            Log.w(TAG, "Ekran boyutu okunamadi", e)
        }
        if (p.x <= 0 || p.y <= 0) {
            val dm = context.resources.displayMetrics
            p.set(dm.widthPixels, dm.heightPixels)
        }
        if (p.x <= 0 || p.y <= 0) p.set(YEDEK_GENISLIK, YEDEK_YUKSEKLIK)
        return minOf(p.x, p.y) to maxOf(p.x, p.y)
    }
}
