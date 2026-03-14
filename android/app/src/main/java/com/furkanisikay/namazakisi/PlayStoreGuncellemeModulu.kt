package com.furkanisikay.namazakisi

import android.app.Activity
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import com.google.android.play.core.ktx.isFlexibleUpdateAllowed

/**
 * Play Store In-App Update native modülü.
 *
 * Exposed @ReactMethod'lar:
 * - kurulumKaynagiGetir(promise): "play_store" | "sideload" | "unknown"
 * - guncellemeDurumunuKontrolEt(promise): { guncellemeMevcut, availableVersionCode }
 * - esnekGuncellemeBaslat(promise): FLEXIBLE update flow başlatır
 * - guncellemeYuklemeyiTamamla(promise): İndirme sonrası uygulamayı yeniden başlatır
 *
 * Olaylar (DeviceEventManagerModule üzerinden):
 * - "PlayStoreInstallStateChanged": { installStatus, bytesDownloaded, totalBytesToDownload }
 */
class PlayStoreGuncellemeModulu(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    companion object {
        const val MODULE_NAME = "PlayStoreGuncelleme"
        const val REQUEST_CODE_UPDATE = 1001
        const val EVENT_INSTALL_STATE = "PlayStoreInstallStateChanged"
    }

    private val appUpdateManager = AppUpdateManagerFactory.create(reactContext)
    private var cachedUpdateInfo: AppUpdateInfo? = null
    private var startUpdatePromise: Promise? = null

    private val installStateListener = InstallStateUpdatedListener { state ->
        val params = Arguments.createMap().apply {
            putInt("installStatus", state.installStatus())
            putLong("bytesDownloaded", state.bytesDownloaded())
            putLong("totalBytesToDownload", state.totalBytesToDownload())
        }
        sendEvent(EVENT_INSTALL_STATE, params)

        if (state.installStatus() == InstallStatus.DOWNLOADED) {
            startUpdatePromise?.resolve("DOWNLOADED")
            startUpdatePromise = null
        } else if (state.installStatus() == InstallStatus.FAILED ||
                   state.installStatus() == InstallStatus.CANCELED) {
            startUpdatePromise?.reject("UPDATE_FAILED", "Install state: ${state.installStatus()}")
            startUpdatePromise = null
        }
    }

    init {
        reactContext.addActivityEventListener(this)
        appUpdateManager.registerListener(installStateListener)
    }

    override fun getName(): String = MODULE_NAME

    override fun onCatalystInstanceDestroy() {
        appUpdateManager.unregisterListener(installStateListener)
        super.onCatalystInstanceDestroy()
    }

    /**
     * Uygulamanın hangi kaynaktan kurulduğunu döner.
     * "play_store" | "sideload" | "unknown"
     */
    @ReactMethod
    fun kurulumKaynagiGetir(promise: Promise) {
        try {
            val packageName = reactApplicationContext.packageName
            val installer: String? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                reactApplicationContext.packageManager
                    .getInstallSourceInfo(packageName)
                    .installingPackageName
            } else {
                @Suppress("DEPRECATION")
                reactApplicationContext.packageManager
                    .getInstallerPackageName(packageName)
            }
            val kaynak = when (installer) {
                "com.android.vending" -> "play_store"
                null -> "unknown"
                else -> "sideload"
            }
            promise.resolve(kaynak)
        } catch (e: Exception) {
            promise.resolve("unknown")
        }
    }

    /**
     * Play Store'da güncelleme var mı kontrol eder.
     * Sonuç: { guncellemeMevcut: Boolean, availableVersionCode: Int }
     * Hata durumunda: { guncellemeMevcut: false, hata: String }
     */
    @ReactMethod
    fun guncellemeDurumunuKontrolEt(promise: Promise) {
        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { info ->
                cachedUpdateInfo = info
                val guncellemeMevcut = info.updateAvailability() ==
                    UpdateAvailability.UPDATE_AVAILABLE &&
                    info.isFlexibleUpdateAllowed
                val result = Arguments.createMap().apply {
                    putBoolean("guncellemeMevcut", guncellemeMevcut)
                    putInt("availableVersionCode", info.availableVersionCode())
                }
                promise.resolve(result)
            }
            .addOnFailureListener { e ->
                // Play Store erişilemez veya network hatası — GitHub fallback için false döner
                val result = Arguments.createMap().apply {
                    putBoolean("guncellemeMevcut", false)
                    putString("hata", e.message ?: "Bilinmeyen hata")
                }
                promise.resolve(result)
            }
    }

    /**
     * FLEXIBLE update flow başlatır.
     * Play Store native bottom sheet açılır, kullanıcı "Güncelle"ye basarsa
     * indirme arka planda devam eder.
     * Promise "DOWNLOADED" ile resolve olunca guncellemeYuklemeyiTamamla çağır.
     */
    @ReactMethod
    fun esnekGuncellemeBaslat(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        val info = cachedUpdateInfo

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity mevcut değil")
            return
        }

        if (info == null) {
            promise.reject("NO_UPDATE_INFO", "Önce guncellemeDurumunuKontrolEt çağırın")
            return
        }

        if (info.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE ||
            !info.isFlexibleUpdateAllowed) {
            promise.reject("UPDATE_NOT_AVAILABLE", "FLEXIBLE güncelleme mevcut değil")
            return
        }

        startUpdatePromise = promise

        appUpdateManager.startUpdateFlow(
            info,
            activity,
            AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build()
        ).addOnFailureListener { e ->
            startUpdatePromise = null
            promise.reject("UPDATE_FLOW_FAILED", e.message ?: "Update flow başlatılamadı")
        }
    }

    /**
     * İndirme tamamlandıktan sonra güncellemeyi uygular.
     * Uygulama yeniden başlar.
     */
    @ReactMethod
    fun guncellemeYuklemeyiTamamla(promise: Promise) {
        appUpdateManager.completeUpdate()
            .addOnSuccessListener { promise.resolve(true) }
            .addOnFailureListener { e ->
                promise.reject("COMPLETE_FAILED", e.message ?: "Güncelleme tamamlanamadı")
            }
    }

    /**
     * Arka planda indirilmiş, kurulmayı bekleyen güncelleme var mı kontrol eder.
     * App öne gelince çağrılır; true ise guncellemeYuklemeyiTamamla çağır.
     */
    @ReactMethod
    fun indirilenGuncellemeVarMi(promise: Promise) {
        appUpdateManager.appUpdateInfo
            .addOnSuccessListener { info ->
                val isDownloaded = info.installStatus() == InstallStatus.DOWNLOADED
                promise.resolve(isDownloaded)
            }
            .addOnFailureListener {
                promise.resolve(false)
            }
    }

    // NativeEventEmitter için gerekli
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    // ---- ActivityEventListener ----

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == REQUEST_CODE_UPDATE) {
            if (resultCode != Activity.RESULT_OK) {
                startUpdatePromise?.reject("UPDATE_CANCELLED", "Kullanıcı güncellemeyi iptal etti")
                startUpdatePromise = null
            }
            // RESULT_OK → FLEXIBLE için indirme arka planda devam eder,
            // installStateListener DOWNLOADED'da promise'ı resolve eder
        }
    }

    override fun onNewIntent(intent: Intent) {}

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
