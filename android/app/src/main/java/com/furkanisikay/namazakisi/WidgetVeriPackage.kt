package com.furkanisikay.namazakisi

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.furkanisikay.namazakisi.kildim.KildimGuvenModulu
import com.furkanisikay.namazakisi.kildim.KildimKuyruguModulu

/**
 * Widget + "Kıldım" kuyruğu köprüleri. Kuyruk modülü buraya eklendi (MainApplication'a
 * ayrı paket eklemek yerine) — widget ile aynı özelliğin parçasıdır.
 */
class WidgetVeriPackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(
        WidgetVeriModulu(reactContext),
        KildimKuyruguModulu(reactContext),
        KildimGuvenModulu(reactContext),
    )

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
