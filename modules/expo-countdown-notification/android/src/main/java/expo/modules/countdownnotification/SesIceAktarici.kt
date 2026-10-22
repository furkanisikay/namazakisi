package expo.modules.countdownnotification

import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Log
import expo.modules.countdownnotification.cekirdek.SesDosyasiKurallari
import java.io.File
import java.security.MessageDigest

/**
 * "Kendi dosyanizdan secin": kullanicinin dosyasini (ornegin bir ezan kaydi) bildirim
 * sesi yapilabilecek KALICI bir konuma tasir. IZIN ISTEMEZ.
 *
 * NEDEN (Samsung): One UI'nin `ACTION_RINGTONE_PICKER`'i yalniz hazir sistem seslerini
 * gosteriyor, kullanicinin kendi dosyasini eklemeye izin vermiyor.
 *
 * AKIS:
 *  1. `ACTION_OPEN_DOCUMENT` (audio/wildcard) — Storage Access Framework, izin gerektirmez.
 *     Sonuc URI'sinin GECICI okuma izniyle HEMEN okunur; `takePersistableUriPermission`
 *     GEREKMEZ, cunku kaynaga bir daha hic dokunulmaz.
 *  2. Uygulama cache'ine gecici kopya (yalniz dogrulama icin; is bitince silinir) →
 *     bicim, boyut, sure (`MediaMetadataRetriever`) dogrulanir.
 *  3. MediaStore Audio'ya yazilir: `Notifications/NamazAkisi/`, `IS_NOTIFICATION=1`.
 *     Android 10+ (API 29) kendi katkisini izinsiz yazar ve okur.
 *
 * NEDEN MEDIASTORE, FileProvider DEGIL: kanal sesini SISTEM calar (SystemUI). FileProvider
 * URI'si icin `grantUriPermission("com.android.systemui", …)` gerekirdi; bu izin KALICI
 * DEGIL (yeniden baslatmada duser) ve OEM'lerde sesi calan surec farkli olabilir.
 * MediaStore URI'si ise sistem seciciden gelen URI'lerle AYNI turdur (`content://media/…`):
 * sistem her zaman okur, yeniden baslatmadan etkilenmez, `RingtoneManager` adi DB'den
 * cozer (mevcut olu-URI dogrulamasi aynen calisir) ve dosya Samsung'un kendi ses
 * listesinde de gorunur.
 *
 * BEDEL: dosya paylasilan depolamada durur (Bildirimler/NamazAkisi). Uygulama silinirse
 * kalir (artik sahibi biz degiliz); kullanici silerse URI olur ve JS dogrulamasi
 * varsayilana duser.
 */
object SesIceAktarici {
    private const val ETIKET = "SesIceAktarici"

    /** `OnActivityResult` istek kodu ("SES2"). */
    const val ISTEK_KODU = 0x5E52

    data class Sonuc(val uri: String? = null, val ad: String = "", val hata: String? = null) {
        fun harita(): Map<String, Any?> = mapOf("uri" to uri, "ad" to ad, "hata" to hata)
    }

    private const val TERCIH = "namazakisi_ses_ice_aktarim"
    private const val ANAHTAR = "bizim_uriler"

    /** Bu URI bizim MediaStore'a ekledigimiz bir ses mi? (olu-satir denetimi yalniz bunlarda) */
    fun bizimMi(context: Context, uri: String): Boolean = try {
        context.getSharedPreferences(TERCIH, Context.MODE_PRIVATE).getStringSet(ANAHTAR, emptySet())
            ?.contains(uri) == true
    } catch (e: Exception) {
        false
    }

    private fun kaydet(context: Context, uri: String) {
        try {
            val tercih = context.getSharedPreferences(TERCIH, Context.MODE_PRIVATE)
            val yeni = HashSet(tercih.getStringSet(ANAHTAR, emptySet()) ?: emptySet()).apply { add(uri) }
            tercih.edit().putStringSet(ANAHTAR, yeni).apply()
        } catch (e: Exception) {
            Log.w(ETIKET, "Kayit tutulamadi: ${e.message}")
        }
    }

    /** MediaStore'a izinsiz yazma Android 10+ ister. */
    fun destekleniyorMu(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q

    fun seciciIntenti(): Intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "audio/*"
    }

    /** Arka plan thread'inde cagrilir (I/O). Asla firlatmaz. */
    fun iceAktar(context: Context, kaynak: Uri): Sonuc {
        if (!destekleniyorMu()) return Sonuc(hata = "desteklenmiyor")
        val cozucu = context.contentResolver

        var dosyaAdi: String? = null
        var boyut: Long? = null
        try {
            cozucu.query(kaynak, arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE), null, null, null)
                ?.use { c ->
                    if (c.moveToFirst()) {
                        val adIndeks = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        val boyutIndeks = c.getColumnIndex(OpenableColumns.SIZE)
                        if (adIndeks >= 0 && !c.isNull(adIndeks)) dosyaAdi = c.getString(adIndeks)
                        if (boyutIndeks >= 0 && !c.isNull(boyutIndeks)) boyut = c.getLong(boyutIndeks)
                    }
                }
        } catch (e: Exception) {
            Log.w(ETIKET, "Dosya bilgisi okunamadi: ${e.message}")
        }

        val mime = SesDosyasiKurallari.mimeCoz(
            try { cozucu.getType(kaynak) } catch (e: Exception) { null },
            dosyaAdi
        ) ?: return Sonuc(hata = SesDosyasiKurallari.Hata.BICIM.kod)
        if (!SesDosyasiKurallari.boyutGecerliMi(boyut)) return Sonuc(hata = SesDosyasiKurallari.Hata.BOYUT.kod)

        val gecici = File(File(context.cacheDir, "ses_ice_aktarim").apply { mkdirs() }, "g_${System.nanoTime()}")
        try {
            // 1) Gecici kopya + icerik izi (boyut bilinmiyorsa sinir burada olculur).
            val ozet = MessageDigest.getInstance("SHA-256")
            var toplam = 0L
            val girdi = cozucu.openInputStream(kaynak) ?: return Sonuc(hata = SesDosyasiKurallari.Hata.BICIM.kod)
            girdi.use { g ->
                gecici.outputStream().use { c ->
                    val tampon = ByteArray(64 * 1024)
                    while (true) {
                        val n = g.read(tampon)
                        if (n < 0) break
                        toplam += n
                        if (toplam > SesDosyasiKurallari.MAKS_BOYUT_BAYT) {
                            return Sonuc(hata = SesDosyasiKurallari.Hata.BOYUT.kod)
                        }
                        ozet.update(tampon, 0, n)
                        c.write(tampon, 0, n)
                    }
                }
            }
            if (toplam == 0L) return Sonuc(hata = SesDosyasiKurallari.Hata.BICIM.kod)

            // 2) Cozulebilir bir ses mi, suresi makul mu?
            val sureMs = sureOlc(gecici)
            SesDosyasiKurallari.sureHatasi(sureMs)?.let { return Sonuc(hata = it.kod) }

            val iz = ozet.digest().joinToString("") { "%02x".format(it) }
            val uzanti = SesDosyasiKurallari.uzantiCoz(mime, dosyaAdi)
            val kayitAdi = SesDosyasiKurallari.kayitAdi(dosyaAdi, iz, uzanti)
            val gorunenAd = SesDosyasiKurallari.gorunenAd(dosyaAdi)
            val goreliYol = "${Environment.DIRECTORY_NOTIFICATIONS}/${SesDosyasiKurallari.KLASOR}/"
            val koleksiyon = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)

            // 3) Ayni icerik daha once eklendiyse ONU kullan (klasorde kopya birikmesin).
            mevcutKayit(context, koleksiyon, kayitAdi, goreliYol)?.let {
                kaydet(context, it.toString())
                return Sonuc(uri = it.toString(), ad = gorunenAd)
            }

            // 4) MediaStore'a yaz: IS_PENDING ile ekle, kopyala, yayinla.
            val degerler = ContentValues().apply {
                put(MediaStore.Audio.Media.DISPLAY_NAME, kayitAdi)
                put(MediaStore.Audio.Media.TITLE, gorunenAd)
                put(MediaStore.Audio.Media.MIME_TYPE, mime)
                put(MediaStore.Audio.Media.RELATIVE_PATH, goreliYol)
                put(MediaStore.Audio.Media.IS_NOTIFICATION, 1)
                put(MediaStore.Audio.Media.IS_PENDING, 1)
            }
            val hedef = cozucu.insert(koleksiyon, degerler) ?: return Sonuc(hata = "yazilamadi")
            try {
                val cikti = cozucu.openOutputStream(hedef, "w") ?: throw IllegalStateException("cikti yok")
                cikti.use { c -> gecici.inputStream().use { it.copyTo(c, 64 * 1024) } }
                cozucu.update(
                    hedef,
                    ContentValues().apply { put(MediaStore.Audio.Media.IS_PENDING, 0) },
                    null,
                    null
                )
            } catch (e: Exception) {
                Log.e(ETIKET, "MediaStore'a yazilamadi: ${e.message}")
                try { cozucu.delete(hedef, null, null) } catch (ignored: Exception) { }
                return Sonuc(hata = "yazilamadi")
            }
            kaydet(context, hedef.toString())
            return Sonuc(uri = hedef.toString(), ad = gorunenAd)
        } catch (e: SecurityException) {
            Log.w(ETIKET, "Dosyaya erisilemedi: ${e.message}")
            return Sonuc(hata = "erisim")
        } catch (e: Exception) {
            Log.e(ETIKET, "Ice aktarim basarisiz: ${e.message}")
            return Sonuc(hata = "yazilamadi")
        } finally {
            gecici.delete()
        }
    }

    private fun sureOlc(dosya: File): Long? {
        val okuyucu = MediaMetadataRetriever()
        return try {
            okuyucu.setDataSource(dosya.absolutePath)
            okuyucu.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
        } catch (e: Exception) {
            Log.w(ETIKET, "Sure okunamadi: ${e.message}")
            null
        } finally {
            try { okuyucu.release() } catch (ignored: Exception) { }
        }
    }

    private fun mevcutKayit(context: Context, koleksiyon: Uri, kayitAdi: String, goreliYol: String): Uri? = try {
        context.contentResolver.query(
            koleksiyon,
            arrayOf(MediaStore.Audio.Media._ID),
            "${MediaStore.Audio.Media.DISPLAY_NAME}=? AND ${MediaStore.Audio.Media.RELATIVE_PATH}=?",
            arrayOf(kayitAdi, goreliYol),
            null
        )?.use { c ->
            if (c.moveToFirst()) ContentUris.withAppendedId(koleksiyon, c.getLong(0)) else null
        }
    } catch (e: Exception) {
        Log.w(ETIKET, "Mevcut kayit aranamadi: ${e.message}")
        null
    }
}
