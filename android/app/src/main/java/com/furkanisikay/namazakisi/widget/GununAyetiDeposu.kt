package com.furkanisikay.namazakisi.widget

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.AyetIcerigi
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku

/**
 * Günün ayeti yükünün (#380/#381) ve duvar kâğıdı durumunun deposu — widget verisiyle AYNI
 * `SharedPreferences` dosyası (`namazakisi_widget`), ayrı anahtarlar. Yükü JS yazar
 * (`WidgetVeri.gununAyetiKaydet`), widget ve duvar kâğıdı buradan okur. Okuma hatası
 * yüzeyleri kırmaz: `null` → "Uygulamayı açın".
 */
object GununAyetiDeposu {
    private const val TAG = "GununAyetiDeposu"
    const val KEY_YUK = "gunun_ayeti"
    private const val KEY_DUVAR_IMZA = "gunun_ayeti_duvar_imza"
    private const val KEY_DUVAR_HATA = "gunun_ayeti_duvar_hata"
    private const val ICERIK_ONEKI = "ayet_icerik_"

    /** `DuvarKagidi.durum().sonHata` değeri: son deneme yazılamadı. */
    const val HATA_YAZILAMADI = "yazilamadi"

    fun yuk(context: Context): GununAyetiYuku? = try {
        GununAyetiKurallari.coz(prefs(context).getString(KEY_YUK, null))
    } catch (e: Exception) {
        // Kilitli açılışta (LOCKED_BOOT) kimlik bilgisi korumalı depo okunamaz.
        Log.w(TAG, "Gunun ayeti yuku okunamadi", e)
        null
    }

    /** Ham yükü yazar; çözülemeyen yük YAZILMAZ (eski geçerli yük widget'ta kalsın). */
    fun yaz(context: Context, ham: String): Boolean {
        if (GununAyetiKurallari.coz(ham) == null) return false
        return prefs(context).edit().putString(KEY_YUK, ham).commit()
    }

    fun icerik(context: Context, appWidgetId: Int): AyetIcerigi =
        AyetIcerigi.coz(prefs(context).getString(ICERIK_ONEKI + appWidgetId, null))

    fun icerikYaz(context: Context, appWidgetId: Int, icerik: AyetIcerigi) {
        prefs(context).edit().putString(ICERIK_ONEKI + appWidgetId, icerik.kod).apply()
    }

    fun icerikSil(context: Context, appWidgetId: Int) {
        prefs(context).edit().remove(ICERIK_ONEKI + appWidgetId).apply()
    }

    /** Son BAŞARIYLA yazılan duvar kâğıdının imzası (`GununAyetiKurallari.duvarImzasi`). */
    fun duvarImzasi(context: Context): String? = try {
        prefs(context).getString(KEY_DUVAR_IMZA, null)
    } catch (_: Exception) {
        null
    }

    fun duvarBasarili(context: Context, imza: String) {
        prefs(context).edit().putString(KEY_DUVAR_IMZA, imza).remove(KEY_DUVAR_HATA).apply()
    }

    fun duvarBasarisiz(context: Context) {
        prefs(context).edit().putString(KEY_DUVAR_HATA, HATA_YAZILAMADI).apply()
    }

    fun duvarHatasi(context: Context): String? = try {
        prefs(context).getString(KEY_DUVAR_HATA, null)
    } catch (_: Exception) {
        null
    }

    private fun prefs(context: Context) =
        context.getSharedPreferences(WidgetVeriDeposu.PREFS_NAME, Context.MODE_PRIVATE)
}
