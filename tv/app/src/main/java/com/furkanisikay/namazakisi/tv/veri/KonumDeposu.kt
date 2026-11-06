package com.furkanisikay.namazakisi.tv.veri

import android.content.Context
import com.furkanisikay.namazakisi.tv.cekirdek.Il
import com.furkanisikay.namazakisi.tv.cekirdek.IlListesi
import com.furkanisikay.namazakisi.tv.cekirdek.RakamKarari
import com.furkanisikay.namazakisi.tv.cekirdek.TvHesap
import com.furkanisikay.namazakisi.tv.cekirdek.TvHesapCozucu
import com.furkanisikay.namazakisi.tv.cekirdek.TvRakam
import org.json.JSONObject

/**
 * TV'nin konumu — tek kalıcı ayar. SharedPreferences; yedeklemeye girmez
 * (`allowBackup=false`, telefonla aynı duruş). İki kaynak, SON YAZAN geçerli:
 * - elle seçilen il (`il_plaka`; ekran görüntüsü hattı bu anahtarı tohumluyor, adı korunur),
 * - telefondan aktarılan konum (`tel_*`; QR ya da kodla, issue: TV eşleştirme). Eşleşik telefon
 *   Türkiye dışı bir hesap yöntemi kullanıyorsa o da `tel_hesap`'ta durur; elle il ve 7 haneli
 *   kod Türkiye yoluna döner (kod Türkiye ızgarasıdır). Konumun ülkesi ve telefondaki rakam
 *   seçimleri `tel_rakam`'da (panonun rakam sistemi, `cekirdek/Rakam.kt`).
 *
 * `seciliIl()` panonun ve ekran koruyucunun TEK okuma noktasıdır; ikisi ayrı ayrı okursa
 * pano ile ekran koruyucu farklı şehri gösterir.
 */
class KonumDeposu(context: Context) {
    private val baglam = context.applicationContext
    private val tercihler = baglam.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)

    val iller: List<Il> by lazy {
        baglam.assets.open("iller.json").bufferedReader(Charsets.UTF_8).use { IlListesi.coz(it.readText()) }
    }

    fun seciliPlaka(): String? = tercihler.getString(ANAHTAR_PLAKA, null)

    fun seciliIl(): Il? = telefondanGelen() ?: IlListesi.bul(iller, seciliPlaka())

    /** Telefondan aktarılmış konum varsa (`plaka = "tel"`). */
    fun telefondanGelen(): Il? {
        val ad = tercihler.getString(ANAHTAR_TEL_AD, null) ?: return null
        val lat = tercihler.getString(ANAHTAR_TEL_LAT, null)?.toDoubleOrNull() ?: return null
        val lng = tercihler.getString(ANAHTAR_TEL_LNG, null)?.toDoubleOrNull() ?: return null
        val hesap = tercihler.getString(ANAHTAR_TEL_HESAP, null)?.let {
            try {
                TvHesapCozucu.coz(JSONObject(it))
            } catch (e: Exception) {
                null
            }
        }
        val rakam = tercihler.getString(ANAHTAR_TEL_RAKAM, null)?.let {
            try {
                RakamKarari.coz(JSONObject(it))
            } catch (e: Exception) {
                null
            }
        }
        return Il(PLAKA_TELEFON, ad, lat, lng, hesap, rakam)
    }

    fun kaydet(plaka: String) {
        tercihler.edit()
            .putString(ANAHTAR_PLAKA, plaka)
            .remove(ANAHTAR_TEL_AD).remove(ANAHTAR_TEL_LAT).remove(ANAHTAR_TEL_LNG).remove(ANAHTAR_TEL_HESAP)
            .remove(ANAHTAR_TEL_RAKAM)
            .apply()
    }

    /** Telefondan gelen konumu yazar (çift değer string: Float'a düşüp hassasiyet kaybetmesin). */
    fun telefondanKaydet(ad: String, lat: Double, lng: Double, hesap: TvHesap? = null, rakam: TvRakam? = null) {
        val duzenle = tercihler.edit()
            .putString(ANAHTAR_TEL_AD, ad)
            .putString(ANAHTAR_TEL_LAT, lat.toString())
            .putString(ANAHTAR_TEL_LNG, lng.toString())
            .remove(ANAHTAR_PLAKA)
        if (hesap != null) duzenle.putString(ANAHTAR_TEL_HESAP, TvHesapCozucu.yaz(hesap)) else duzenle.remove(ANAHTAR_TEL_HESAP)
        if (rakam != null) duzenle.putString(ANAHTAR_TEL_RAKAM, RakamKarari.yaz(rakam)) else duzenle.remove(ANAHTAR_TEL_RAKAM)
        duzenle.apply()
    }

    companion object {
        const val PLAKA_TELEFON = "tel"
        private const val DOSYA = "namazakisi_tv"
        private const val ANAHTAR_PLAKA = "il_plaka"
        private const val ANAHTAR_TEL_AD = "tel_ad"
        private const val ANAHTAR_TEL_LAT = "tel_lat"
        private const val ANAHTAR_TEL_LNG = "tel_lng"
        private const val ANAHTAR_TEL_HESAP = "tel_hesap"
        private const val ANAHTAR_TEL_RAKAM = "tel_rakam"
    }
}
