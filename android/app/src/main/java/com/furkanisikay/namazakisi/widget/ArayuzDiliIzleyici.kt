package com.furkanisikay.namazakisi.widget

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.furkanisikay.namazakisi.ArayuzDili

/**
 * Arayüz dili değişince widget'ları ve hızlı ayarlar kutusunu yeniden çizer.
 *
 * Neden gerekli: widget yükü dil taşımaz ve `WidgetServisi` (JS) içerik aynıysa native'e
 * YAZMAZ (D-21) → dil değişiminden sonra widget bir sonraki vakit sınırına (ya da saatlik
 * onarıma) kadar eski dilde kalırdı. Dili JS yazar (`expo-countdown-notification >
 * ArayuzDili.kaydet`, aynı süreç, aynı `SharedPreferences` örneği) → dinleyici yalnız
 * DEĞER DEĞİŞİNCE tetiklenir (aynı değeri yazmak bildirim üretmez).
 *
 * `SharedPreferences` dinleyiciyi ZAYIF tutar: güçlü başvuru bu nesnede saklanır.
 * `MainApplication.onCreate` süreç başına bir kez kurar.
 */
object ArayuzDiliIzleyici {
    private const val TAG = "ArayuzDiliIzleyici"

    @Volatile
    private var dinleyici: SharedPreferences.OnSharedPreferenceChangeListener? = null

    fun kur(context: Context) {
        if (dinleyici != null) return
        val uygulama = context.applicationContext ?: context
        try {
            val d = SharedPreferences.OnSharedPreferenceChangeListener { _, anahtar ->
                if (anahtar == ArayuzDili.TERCIH_KOD) WidgetGuncelleyici.tumunuGuncelle(uygulama)
            }
            uygulama.getSharedPreferences(ArayuzDili.TERCIH_DOSYASI, Context.MODE_PRIVATE)
                .registerOnSharedPreferenceChangeListener(d)
            dinleyici = d
        } catch (e: Exception) {
            Log.w(TAG, "Dil dinleyicisi kurulamadi", e)
        }
    }
}
