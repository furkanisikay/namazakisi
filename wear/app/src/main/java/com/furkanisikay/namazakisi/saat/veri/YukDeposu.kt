package com.furkanisikay.namazakisi.saat.veri

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import com.furkanisikay.namazakisi.saat.cekirdek.CozumSonucu
import com.furkanisikay.namazakisi.saat.cekirdek.HamCozumOnbellegi
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.Yuk
import com.furkanisikay.namazakisi.saat.cekirdek.YukCozucu
import com.furkanisikay.namazakisi.saat.cekirdek.YukKayitKarari

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

    /**
     * Sık yazılan küçük anahtarlar AYRI dosyada: aynı dosyada kalsalardı her yazım
     * 90 KB'lık yükü de diske yeniden yazar ve yük dinleyicilerini (ana ekran) boşuna
     * tetiklerdi (denetim D-19).
     */
    private val zincirPrefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(ZINCIR_PREFS, Context.MODE_PRIVATE)

    /** Ham dizeye göre önbellekli: yük değişmedikçe JSON yeniden ayrıştırılmaz. */
    fun yuk(): Yuk? = ONBELLEK.al(prefs.getString(YUK, null))

    val guncellemeGerekli: Boolean get() = prefs.getBoolean(GUNCELLEME_GEREKLI, false)

    /**
     * @return yerel veri DEĞİŞTİ mi (çağıran yalnız `true`da yüzeyleri ve zinciri
     * tazeler). Aynı yük yeniden gelirse ayrıştırılmaz, diske yazılmaz ve `false` döner —
     * yalnız bekleyen "Kıldım" ayıklanırsa ya da güncelleme bayrağı sönerse `true`.
     */
    fun kaydet(json: String): Boolean = synchronized(KILIT) {
        val mevcutHam = prefs.getString(YUK, null)
        if (mevcutHam != null && mevcutHam == json) {
            val mevcut = ONBELLEK.al(mevcutHam)
            if (mevcut != null) {
                val karar = YukKayitKarari.ayniYuk(mevcut, bekleyenler(), guncellemeGerekli)
                if (!karar.yaz) return@synchronized false
                prefs.edit()
                    .putBoolean(GUNCELLEME_GEREKLI, false)
                    .putStringSet(BEKLEYEN, karar.bekleyen)
                    .apply()
                return@synchronized true
            }
        }
        when (val s = YukCozucu.coz(json)) {
            is CozumSonucu.Basarili -> {
                val bekleyen = VakitHesabi.bekleyeniAyikla(s.yuk, bekleyenler())
                // Yazılan dize SharedPreferences'ta aynı örnek olarak döner → sonraki
                // `yuk()` çağrıları ikinci kez ayrıştırmaz.
                ONBELLEK.koy(json, s.yuk)
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
    }

    fun bekleyenler(): Set<String> = prefs.getStringSet(BEKLEYEN, emptySet())?.toSet() ?: emptySet()

    fun bekleyenEkle(kimlik: String) = synchronized(KILIT) {
        prefs.edit().putStringSet(BEKLEYEN, bekleyenler() + kimlik).apply()
    }

    /** Zincirin en son GÖSTERDİĞİ uyarının anı — aynı uyarı iki kez çalınmasın. */
    var sonGosterilenMs: Long
        get() = YukKayitKarari.sonGosterilen(
            yeni = zincirPrefs.takeIf { it.contains(SON_GOSTERILEN) }?.getLong(SON_GOSTERILEN, 0L),
            eski = prefs.takeIf { it.contains(SON_GOSTERILEN) }?.getLong(SON_GOSTERILEN, 0L),
        )
        set(deger) {
            zincirPrefs.edit { putLong(SON_GOSTERILEN, deger) }
            // Eski dosyadaki kopya bir kez silinir (tek seferlik büyük yazım); sonra eski
            // dosyaya bir daha dokunulmaz.
            if (prefs.contains(SON_GOSTERILEN)) prefs.edit { remove(SON_GOSTERILEN) }
        }

    fun dinle(dinleyici: SharedPreferences.OnSharedPreferenceChangeListener) =
        prefs.registerOnSharedPreferenceChangeListener(dinleyici)

    fun birak(dinleyici: SharedPreferences.OnSharedPreferenceChangeListener) =
        prefs.unregisterOnSharedPreferenceChangeListener(dinleyici)

    companion object {
        /**
         * `bekleyen` kümesi UI (saatte işaret) ve binder thread'i (telefondan yük)
         * tarafından oku-değiştir-yaz yapılır; iki yol AYRI `YukDeposu` örneği
         * oluşturduğu için kilit sınıf düzeyindedir — yoksa iyimser tik kaybolurdu.
         */
        private val KILIT = Any()

        /** Süreç düzeyi: depo her çağrıda yeniden kurulur (`YukDeposu(context)`). */
        private val ONBELLEK = HamCozumOnbellegi { ham ->
            (YukCozucu.coz(ham) as? CozumSonucu.Basarili)?.yuk
        }
        private const val PREFS = "saat_veri"
        private const val ZINCIR_PREFS = "saat_zincir"
        private const val YUK = "yuk"
        private const val BEKLEYEN = "bekleyen"
        private const val GUNCELLEME_GEREKLI = "guncelleme_gerekli"
        private const val SON_GOSTERILEN = "son_gosterilen_ms"
    }
}
