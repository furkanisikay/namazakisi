package expo.modules.camigeofence

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

/**
 * Camiden çıkış sorusundaki "Kıldım" kuyruğunu JS'te boşaltan headless görev.
 * Görev adı `index.ts > AppRegistry.registerHeadlessTask('CamiKildim', …)` ile AYNI.
 * `allowedInForeground = true` ZORUNLU (Wear dersi: RESUMED iken izinsiz görev çöker).
 */
class CamiKildimGorevServisi : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig =
        HeadlessJsTaskConfig(GOREV_ADI, Arguments.createMap(), ZAMAN_ASIMI_MS, true)

    companion object {
        const val GOREV_ADI = "CamiKildim"
        private const val ZAMAN_ASIMI_MS = 30_000L
    }
}
