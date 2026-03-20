package com.furkanisikay.namazakisi

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class PlayStoreGuncellemePackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return try {
            listOf(PlayStoreGuncellemeModulu(reactContext))
        } catch (e: Throwable) {
            // Play Store modülü başlatılamazsa uygulamayı çökertme
            // JS tarafı PlayStoreGuncelleme null olacak, graceful fallback devreye girer
            emptyList()
        }
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
