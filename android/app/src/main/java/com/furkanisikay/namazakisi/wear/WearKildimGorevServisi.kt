package com.furkanisikay.namazakisi.wear

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

/**
 * Saatten gelen "Kıldım" kuyruğunu JS'te boşaltan headless görev (issue #269).
 * Görev adı `index.ts > AppRegistry.registerHeadlessTask('WearKildim', …)` ile AYNI.
 *
 * `allowedInForeground = true` ZORUNLU: ReactContext RESUMED iken izin verilmeyen
 * görev `HeadlessJsTaskContext` içinde IllegalStateException fırlatır (uygulama
 * açıkken saatten işaretleme = çökme). Dinleyici zaten ön planda olay yayıp bu
 * servisi başlatmaz; bayrak yarış durumuna karşı ikinci kilittir.
 */
class WearKildimGorevServisi : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig =
        HeadlessJsTaskConfig(GOREV_ADI, Arguments.createMap(), ZAMAN_ASIMI_MS, true)

    companion object {
        const val GOREV_ADI = "WearKildim"
        private const val ZAMAN_ASIMI_MS = 30_000L
    }
}
