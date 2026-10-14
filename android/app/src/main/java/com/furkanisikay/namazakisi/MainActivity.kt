package com.furkanisikay.namazakisi

import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.graphics.Point
import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper
import com.furkanisikay.namazakisi.kildim.KildimDerinBaglantiKaydi

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
    yonKilidiniUygula()
    // `namazakisi://kildim` başlatanı (issue #299): getReferrer() yalnız BU AN geçerli.
    KildimDerinBaglantiKaydi.yakala(this, intent)
  }

  override fun onNewIntent(intent: Intent) {
    // super'den ÖNCE: sistem getReferrer()'ı yalnız onNewIntent çağrısı boyunca yeni
    // intent'e göre verir; JS bağlantı olayını super içinde alır.
    KildimDerinBaglantiKaydi.yakala(this, intent)
    super.onNewIntent(intent)
  }

  /**
   * Katla/aç, döndürme ve pencere boyutu değişimleri manifestteki `configChanges`
   * ile burada karşılanır — Activity YENİDEN YARATILMAZ (pager ve geri sayım
   * durumu korunur, issue #283). Bu yüzden yön kilidi onCreate'te bir kez değil,
   * her yapılandırma değişiminde yeniden değerlendirilir: Fold'un iç ekranında
   * açılıp kapak ekranına geçen uygulama telefonda yine dikeye kilitlenmeli.
   */
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    yonKilidiniUygula()
  }

  /**
   * Telefonda (en küçük genişlik < 600 dp) dikey kilit korunur; tablet ve
   * katlanabilir iç ekranında (≥ 600 dp) yön serbest bırakılır. Android 16
   * (API 36) bu ekranlarda kilidi zaten yok sayıyor; burada niyeti açıkça
   * belirtip eski sürümlerde de aynı davranışı veriyoruz. Manifest varsayılanı
   * `portrait` kalır (açılışta telefonda yön zıplaması olmasın).
   */
  private fun yonKilidiniUygula() {
    val istenen = if (enKucukEkranGenisligiDp() >= BUYUK_EKRAN_EN_KUCUK_GENISLIK_DP) {
      ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
    } else {
      ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
    // Aynı değeri yeniden yazmak gereksiz bir yeniden düzen tetikleyebilir.
    if (requestedOrientation != istenen) {
      requestedOrientation = istenen
    }
  }

  /**
   * Ekranın (pencerenin DEĞİL) en küçük kenarı, dp. `Configuration.smallestScreenWidthDp`
   * KULLANILMAZ: manifest `portrait` iken yatay tablette sistem uygulamayı dar bir
   * dikey kutuya alır (letterbox) ve yapılandırma o KUTUYU anlatır (< 600 dp) — karar
   * "telefon" çıkar, kilit hiç açılmaz, uygulama tablette ortada dar kalır (özellik
   * turu tablet karesinde yakalandı). En büyük pencere ölçüsü kutudan bağımsızdır ve
   * katla/aç ile değişir.
   */
  private fun enKucukEkranGenisligiDp(): Int {
    val (genislik, yukseklik) = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val sinir = windowManager.maximumWindowMetrics.bounds
      sinir.width() to sinir.height()
    } else {
      val boyut = Point()
      @Suppress("DEPRECATION")
      windowManager.defaultDisplay.getRealSize(boyut)
      boyut.x to boyut.y
    }
    return (minOf(genislik, yukseklik) / resources.displayMetrics.density).toInt()
  }

  private companion object {
    /** Material "orta" pencere sınıfının alt sınırı (JS: `ORTA_KIRILIM_DP`). */
    const val BUYUK_EKRAN_EN_KUCUK_GENISLIK_DP = 600
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
