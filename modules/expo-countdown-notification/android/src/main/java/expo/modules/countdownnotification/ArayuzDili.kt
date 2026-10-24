package expo.modules.countdownnotification

import android.content.Context

/**
 * Uygulamanın ARAYÜZ dili (dil kodu: "tr", "en") — JS etkin dil değişince yazar; uygulama
 * modülü (widget, bildirim, alarm) ve diğer yerel modüller aynı tercih dosyasını okur.
 * Sesli okuma dilinden (`AnonsKonusucu`, BCP-47) AYRIDIR: ses motoru başka dile düşebilir.
 * Uygulama hiç açılmadıysa (JS yazmadı) Türkçe.
 */
object ArayuzDili {
    const val TERCIH_DOSYASI = "namazakisi_dil"
    const val TERCIH_KOD = "kod"
    const val VARSAYILAN = "tr"

    fun kaydet(context: Context, kod: String) {
        val temiz = kod.trim().ifEmpty { VARSAYILAN }
        context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
            .edit().putString(TERCIH_KOD, temiz).apply()
    }

    fun oku(context: Context): String = try {
        context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
            .getString(TERCIH_KOD, VARSAYILAN) ?: VARSAYILAN
    } catch (_: Exception) {
        VARSAYILAN
    }
}
