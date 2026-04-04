package com.furkanisikay.namazakisi

import android.app.Application
import android.content.res.Configuration
import java.io.File

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
      this,
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(PlayStoreGuncellemePackage())
              add(WidgetVeriPackage())
            }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    clearStaleNativeStateOnUpgrade()
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  /**
   * Versiyon degistiginde stale native state temizle.
   * notifee SQLite DB schema uyumsuzlugu ve expo-updates stale cache
   * JS bundle yuklenirken std::terminate crash'ine yol acabilir.
   */
  private fun clearStaleNativeStateOnUpgrade() {
    try {
      val prefs = getSharedPreferences("app_upgrade_prefs", MODE_PRIVATE)
      val lastVersionCode = prefs.getInt("last_version_code", -1)
      val currentVersionCode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
        packageManager.getPackageInfo(packageName, 0).longVersionCode.toInt()
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, 0).versionCode
      }

      if (lastVersionCode != currentVersionCode) {
        // notifee SQLite DB temizle (schema uyumsuzlugu crash'e yol acabilir)
        try {
          listOf("notifee.db", "notifee.db-shm", "notifee.db-wal").forEach { name ->
            val f = getDatabasePath(name)
            if (f.exists()) f.delete()
          }
        } catch (_: Throwable) {}

        // expo-updates stale cache temizle (stale bundle JS hatasina yol acabilir)
        try {
          val updatesDir = File(filesDir, "expo-updates")
          if (updatesDir.exists()) updatesDir.deleteRecursively()
        } catch (_: Throwable) {}
      }

      prefs.edit().putInt("last_version_code", currentVersionCode).apply()
    } catch (_: Throwable) {}
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
