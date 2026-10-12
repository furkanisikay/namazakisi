package com.furkanisikay.namazakisi.saat.veri

import android.content.Context
import android.content.SharedPreferences
import com.furkanisikay.namazakisi.saat.cekirdek.CozumSonucu
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.cekirdek.YukCozucu

/**
 * Saatteki tek veri kaynağı: telefondan gelen son geçerli yük + saatte işaretlenip
 * telefonun henüz onaylamadığı "Kıldım"lar (iyimser gösterim).
 *
 * Telefon DAHA YENİ bir şema gönderirse ESKİ yük korunur ve `guncellemeGerekli`
 * yanar (ekran "telefondaki uygulamayı güncelleyin" der) — saat boş kalmaz.
 */
class YukDeposu(context: Context) {
    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun yuk(): Yuk? = (YukCozucu.coz(prefs.getString(YUK, null)) as? CozumSonucu.Basarili)?.yuk

    val guncellemeGerekli: Boolean get() = prefs.getBoolean(GUNCELLEME_GEREKLI, false)

    /** @return yük kabul edildi mi */
    fun kaydet(json: String): Boolean =
        when (val s = YukCozucu.coz(json)) {
            is CozumSonucu.Basarili -> {
                val bekleyen = VakitHesabi.bekleyeniAyikla(s.yuk, bekleyenler())
                prefs.edit()
                    .putString(YUK, json)
                    .putBoolean(GUNCELLEME_GEREKLI, false)
                    .putStringSet(BEKLEYEN, bekleyen)
                    .apply()
                true
            }
            is CozumSonucu.SurumYeni -> {
                prefs.edit().putBoolean(GUNCELLEME_GEREKLI, true).apply()
                false
            }
            CozumSonucu.Gecersiz -> false
        }

    fun bekleyenler(): Set<String> = prefs.getStringSet(BEKLEYEN, emptySet())?.toSet() ?: emptySet()

    fun bekleyenEkle(kimlik: String) {
        prefs.edit().putStringSet(BEKLEYEN, bekleyenler() + kimlik).apply()
    }

    fun dinle(dinleyici: SharedPreferences.OnSharedPreferenceChangeListener) =
        prefs.registerOnSharedPreferenceChangeListener(dinleyici)

    fun birak(dinleyici: SharedPreferences.OnSharedPreferenceChangeListener) =
        prefs.unregisterOnSharedPreferenceChangeListener(dinleyici)

    companion object {
        private const val PREFS = "saat_veri"
        private const val YUK = "yuk"
        private const val BEKLEYEN = "bekleyen"
        private const val GUNCELLEME_GEREKLI = "guncelleme_gerekli"
    }
}
