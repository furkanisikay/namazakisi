package expo.modules.tvesleme

import android.content.Context
import android.content.res.Configuration
import java.util.Locale

/**
 * Uygulamanın ARAYÜZ dilinde kaynak çözen bağlam (QR tarayıcı metinleri).
 *
 * Uygulama dili cihaz dilinden farklı olabilir; aktivite cihaz dilinde açılır → metinler
 * `getString` ile BU bağlamdan çözülür. Dil kodunu JS yazar: tercih dosyası
 * `namazakisi_dil` / `kod` (yazan: expo-countdown-notification `ArayuzDili`; modüller arası
 * bağımlılık olmasın diye burada aynı dosya okunur). Değer yoksa Türkçe.
 */
internal fun Context.dildeBaglam(): Context = try {
    val kod = applicationContext.getSharedPreferences("namazakisi_dil", Context.MODE_PRIVATE)
        .getString("kod", null)?.trim().takeUnless { it.isNullOrEmpty() } ?: "tr"
    val yapi = Configuration(resources.configuration)
    // Pencapça (yalnız Şahmuki) kaynağı `values-b+pa+Arab`: çıplak "pa" Gurmuki betiğe çözülür, o dizini seçmez.
    yapi.setLocale(Locale.forLanguageTag(if (kod == "pa") "pa-Arab" else kod))
    createConfigurationContext(yapi)
} catch (_: Exception) {
    this
}
