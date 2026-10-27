package expo.modules.countdownnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import androidx.annotation.RequiresApi
import expo.modules.countdownnotification.cekirdek.Rakam
import java.util.Locale

/**
 * Uygulamanın ARAYÜZ dilinde ([ArayuzDili]) kaynak çözen bağlam.
 *
 * Uygulama dili cihaz dilinden farklı olabilir → native'in kendi ürettiği metinler
 * (eylem düğmeleri, kanal adları, yedek gövde, sayaç öneki) `getString` ile BU bağlamdan
 * çözülür; bildirim kurucusuna, PendingIntent'e ve RemoteViews'e özgün bağlam verilir.
 */
// Yerel rakamlı dilde (Arapça, Bengalce) etiket `-u-nu-<sistem>` taşır (`Rakam.yerelEtiketi`): kaynak biçimlemesi seçilen
// rakamı izler; diğer dillerde etiket aynen.
internal fun Context.dildeBaglam(): Context = try {
    val yapi = Configuration(resources.configuration)
    yapi.setLocale(Locale.forLanguageTag(Rakam.yerelEtiketi(ArayuzDili.oku(this), ArayuzDili.rakamKaydi(this))))
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
 * gibi alanlara dokunmaz. DND atlama bayrağı da mevcut değeriyle verilir.
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
