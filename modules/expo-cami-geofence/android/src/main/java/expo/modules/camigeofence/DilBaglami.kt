package expo.modules.camigeofence

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import androidx.annotation.RequiresApi
import java.util.Locale

/**
 * Uygulamanın ARAYÜZ dilinde kaynak çözen bağlam (bildirim, mod kuralı metinleri).
 *
 * Uygulama dili cihaz dilinden farklı olabilir → metinler `getString` ile BU bağlamdan
 * çözülür; bildirim kurucusuna, PendingIntent'e özgün bağlam verilir. Dil kodunu JS
 * yazar: tercih dosyası `namazakisi_dil` / `kod` (yazan: expo-countdown-notification
 * `ArayuzDili`; modüller arası bağımlılık olmasın diye burada aynı dosya okunur).
 * Değer yoksa (uygulama hiç açılmadı) Türkçe.
 */
internal fun Context.dildeBaglam(): Context = try {
    val kod = applicationContext.getSharedPreferences("namazakisi_dil", Context.MODE_PRIVATE)
        .getString("kod", null)?.trim().takeUnless { it.isNullOrEmpty() } ?: "tr"
    val yapi = Configuration(resources.configuration)
    yapi.setLocale(Locale.forLanguageTag(kod))
    createConfigurationContext(yapi)
} catch (_: Exception) {
    this
}

/**
 * Kanal yoksa [yeni] ile kurar; VARSA yalnız kullanıcıya görünen ADI ve AÇIKLAMAYI
 * etkin dile çeker (dil değişince sistem ayarlarındaki ad eski dilde kalmasın).
 *
 * Güncellemede kanal AYNI kimlik ve MEVCUT önemle yeniden verilir: sistem var olan
 * kanalda yalnız ad/açıklamayı alır, önemi düşürmez (aynı değer), ses/titreşim/rozet
 * gibi alanlara dokunmaz. DND atlama bayrağı da mevcut değeriyle verilir (Rahatsız
 * Etmeyin erişimi olan uygulamada sistem onu da eşitler).
 */
@RequiresApi(Build.VERSION_CODES.O)
internal fun NotificationManager.kanaliGarantileVeAdlandir(
    id: String,
    ad: String,
    aciklama: String,
    yeni: () -> NotificationChannel,
) {
    val mevcut = getNotificationChannel(id)
    if (mevcut == null) {
        createNotificationChannel(yeni())
        return
    }
    if (mevcut.name?.toString() == ad && mevcut.description == aciklama) return
    createNotificationChannel(
        NotificationChannel(id, ad, mevcut.importance).apply {
            description = aciklama
            setBypassDnd(mevcut.canBypassDnd())
        }
    )
}
