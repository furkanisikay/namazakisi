package com.furkanisikay.namazakisi

import android.app.Application
import android.content.res.Configuration
import java.io.File

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

  // Expo SDK 57 şablonu: ReactNativeHost (köprü dönemi) kalktı, ReactHost doğrudan kurulur.
  // Elle eklenen paketler (otomatik bağlanmayan uygulama modülleri) listede KALMALI.
  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(PlayStoreGuncellemePackage())
          add(WidgetVeriPackage())
          add(com.furkanisikay.namazakisi.wear.WearSenkronPackage())
          add(com.furkanisikay.namazakisi.alarm.MuhafizAlarmPackage())
        }
    )
  }

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
