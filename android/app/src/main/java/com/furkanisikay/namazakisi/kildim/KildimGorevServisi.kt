package com.furkanisikay.namazakisi.kildim

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

/**
 * "Kıldım" kuyruğunu JS'te boşaltan headless görev (issue #269 → #275/#276).
 * Görev adı `index.ts > AppRegistry.registerHeadlessTask('KildimKuyrugu', …)` ile AYNI.
 *
 * `allowedInForeground = true` ZORUNLU: ReactContext RESUMED iken izin verilmeyen
 * görev `HeadlessJsTaskContext` içinde IllegalStateException fırlatır (uygulama
 * açıkken saatten/widget'tan işaretleme = çökme). [KildimKuyrugu.jsUyandir] zaten
 * ön planda olay yayıp bu servisi başlatmaz; bayrak yarış durumuna karşı ikinci kilittir.
 */
class KildimGorevServisi : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig =
        HeadlessJsTaskConfig(
            GOREV_ADI,
            Arguments.createMap(),
            ZAMAN_ASIMI_MS,
            true
        )

    companion object {
        const val GOREV_ADI = "KildimKuyrugu"
        private const val ZAMAN_ASIMI_MS = 30_000L
    }
}
