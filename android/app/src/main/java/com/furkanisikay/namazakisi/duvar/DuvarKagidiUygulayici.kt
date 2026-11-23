package com.furkanisikay.namazakisi.duvar

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Point
import android.hardware.display.DisplayManager
import android.util.Log
import android.view.Display
import com.furkanisikay.namazakisi.cekirdek.AyetKaydi
import com.furkanisikay.namazakisi.cekirdek.DuvarEkrani
import com.furkanisikay.namazakisi.cekirdek.DuvarZemini
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku
import com.furkanisikay.namazakisi.widget.GununAyetiDeposu
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Günün ayeti duvar kâğıdını uygular (#381). Ayarlar yükün `duvar` nesnesinden gelir (ayrı
 * depolama YOK); JS yazar (`WidgetVeri.gununAyetiKaydet`).
 *
 * - `WallpaperManager.setBitmap(…, FLAG_LOCK | FLAG_SYSTEM)`, izin `SET_WALLPAPER` (normal izin,
 *   kurulumda sorulmaz). Ön plan servisi, WorkManager, pil muafiyeti, depolama izni YOK.
 * - İDEMPOTENT: görsel yalnız İMZA (gün + metin + duvar ayarı + çizilen gök + fotoğraf dosyası,
 *   `GununAyetiKurallari.duvarImzasi`) son başarılı yazımdan farklıysa yazılır. Yük her açılışta /
 *   konum değişiminde / arka plan turunda yeniden yazılır; her `setBitmap` kilit ekranını titretir
 *   ve Material You renklerini yeniden türetir. [arkaPlandaSimdiUygula] de imzaya uyar; yalnız
 *   sonucu bildirir. Vakte uyan gökte gök sınırı alarmı (`GununAyetiGuncelleyici`) imzayı değiştirir.
 * - Mevcut duvar kâğıdı SAKLANMAZ (Android 14+'ta okunamaz) → kapatınca geri yükleme yok; yer
 *   değişince eski ekrandaki görsel kalır.
 * - Hata `sonHata = "yazilamadi"` olarak kaydedilir (`DuvarKagidi.durum`), başarıda silinir.
 * - Kilit görseli yazılınca küçük kopyası saat alanı ölçümünün referansı olur ([KilitReferansi]).
 * - İş tek arka plan iş parçacığında sıralanır (çizim + yazım ~yüzlerce ms; ana iş parçacığı değil).
 */
object DuvarKagidiUygulayici {
    private const val TAG = "DuvarKagidiUygulayici"
    /** Ekran okunamazsa (beklenmez) kullanılan boyut. */
    private const val YEDEK_GENISLIK = 1080
    private const val YEDEK_YUKSEKLIK = 2400

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

    /**
     * Gerekirse uygular ve SONUCU bildirir (ayar ekranı: açma onayı, yer/zemin değişimi).
     * İmza denetlenir: JS yükü yazınca [arkaPlandaGerekirseUygula] aynı sıralı kuyrukta önce
     * koşar; o başardıysa burada ikinci `setBitmap` olmaz (kilit ekranı iki kez titremez),
     * başaramadıysa imza kaydedilmediği için yeniden denenir.
     */
    fun arkaPlandaSimdiUygula(context: Context, sonuc: (Boolean) -> Unit) {
        val uygulama = context.applicationContext
        yurutucu.execute {
            val basarili = try {
                uygula(uygulama, zorla = false)
            } catch (e: Throwable) {
                Log.e(TAG, "Duvar kagidi uygulanamadi", e)
                false
            }
            sonuc(basarili)
        }
    }

    /**
     * Kilit ekranı görüntüsünün satır profilini ([KilitReferansi.profil]) aynı sıralı kuyrukta
     * çıkarır: devam eden yazım bitmeden eski referansla karşılaştırılmaz. [sonuc] her durumda çağrılır.
     */
    fun arkaPlandaKilitProfili(context: Context, uri: String, sonuc: (KilitReferansi.Sonuc) -> Unit) {
        val uygulama = context.applicationContext
        yurutucu.execute {
            val s = try {
                KilitReferansi.profil(uygulama, uri)
            } catch (e: Throwable) {
                Log.e(TAG, "Kilit ekrani profili cikarilamadi", e)
                KilitReferansi.Sonuc.Hata("okunamadi")
            }
            sonuc(s)
        }
    }

    /**
     * @param zorla true: `duvar.acik` ve imza denetlenmez.
     * @return true: yazıldı ya da yazmaya gerek yoktu; false: yazılamadı (ya da yük yok).
     */
    private fun uygula(context: Context, zorla: Boolean): Boolean {
        val yuk = GununAyetiDeposu.yuk(context) ?: return !zorla
        if (!zorla && !yuk.duvar.acik) return true
        val simdi = System.currentTimeMillis()
        val kayit = GununAyetiKurallari.gecerliKayit(yuk.plan, simdi) ?: return false
        val imza = imza(context, yuk, kayit, simdi)
        if (!zorla && imza == GununAyetiDeposu.duvarImzasi(context)) return true
        if (!izinliMi(context)) {
            GununAyetiDeposu.duvarBasarisiz(context)
            return false
        }
        val wm = WallpaperManager.getInstance(context)
        val (genislik, yukseklik) = ekranBoyutu(context)
        // Fotoğraf zemini iki ekran için BİR KEZ çözülür/kırpılır/bulanıklaştırılır (`yer=ikisi`).
        val foto = if (yuk.duvar.zemin == DuvarZemini.FOTO) DuvarFotoZemini.hazirla(context, yuk.duvar, genislik, yukseklik) else null
        return try {
            // Sıra: önce ana ekran, sonra kilit (`DuvarAyari.ekranlar`): kilidin ayrı görseli yokken
            // yalnız FLAG_SYSTEM yazımında sistem eski ortak görseli kilide taşır (AOSP
            // `migrateSystemToLockWallpaperLocked`; cihazda DOĞRULANMADI) — kilit en son yazılınca
            // hangi durumda olursa olsun kendi ayet görselinde kalır.
            for (ekran in yuk.duvar.ekranlar()) {
                val bmp = DuvarKagidiCizici.ciz(context, yuk, kayit, ekran, genislik, yukseklik, simdi, foto)
                try {
                    val bayrak = if (ekran == DuvarEkrani.KILIT) WallpaperManager.FLAG_LOCK else WallpaperManager.FLAG_SYSTEM
                    val kimlik = wm.setBitmap(bmp, null, true, bayrak)
                    if (kimlik == 0) throw IllegalStateException("setBitmap 0 dondu: $ekran")
                    // Saat alanı ölçümünün referansı (hata yalnız loglanır, yazımı bozmaz).
                    if (ekran == DuvarEkrani.KILIT) KilitReferansi.kaydet(context, bmp)
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
        } finally {
            foto?.recycle()
        }
    }

    /**
     * Görünen her şeyin imzası: içerik + ayar + ŞU AN çizilecek gök (vakte uyan gökte her sınırda
     * değişir) + fotoğrafın adı ve değişme zamanı (dosya yoksa gece zemini sayılır).
     */
    private fun imza(context: Context, yuk: GununAyetiYuku, kayit: AyetKaydi, simdi: Long): String {
        val gok = GununAyetiKurallari.etkinGok(yuk.duvar, kayit, simdi)
        return GununAyetiKurallari.duvarImzasi(
            kayit, yuk.metin, yuk.duvar, gok, gok?.let { yuk.sahneler[it] }, DuvarFotoZemini.damga(context, yuk.duvar),
        )
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
