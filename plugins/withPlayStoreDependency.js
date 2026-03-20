/**
 * Expo Config Plugin — Play Store In-App Update Dependency
 *
 * expo prebuild --clean her calistiginda android/app/build.gradle'i
 * sifirdan olusturur. Bu plugin, PlayStoreGuncellemeModulu.kt icin
 * gereken Google Play In-App Update bagimliligini otomatik olarak ekler.
 *
 * Not: EAS build'lerde android/ klasoru prebuild ile yeniden olusturulmaz,
 * commit'teki build.gradle kullanilir. Bu plugin sadece android-build.yml
 * CI akisindaki `expo prebuild --clean` icin gereklidir.
 */

// @expo/config-plugins, Expo SDK'nin transitif bagimliligidır.
// Global eas-cli fallback modunda bulunamayabilir; bu durumda plugin
// no-op olarak calisir (EAS build'lerde dep zaten build.gradle'da mevcuttur).
let withAppBuildGradle;
try {
  ({ withAppBuildGradle } = require('@expo/config-plugins'));
} catch (e) {
  // Fallback: @expo/config-plugins bulunamadi (ornegin global eas-cli context).
  // EAS build'lerde android/ klasoru commit'ten kullanildiginda bu sorun olmaz.
  module.exports = function withPlayStoreDependency(config) { return config; };
  return; // CommonJS module wrapper icinde gecerlidir
}

const PLAY_DEPS = `
    // Play Store In-App Updates (PlayStoreGuncellemeModulu.kt)
    implementation("com.google.android.play:app-update:2.1.0")
    implementation("com.google.android.play:app-update-ktx:2.1.0")`;

module.exports = function withPlayStoreDependency(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes('app-update-ktx')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        /implementation\("com\.facebook\.react:react-android"\)/,
        `implementation("com.facebook.react:react-android")${PLAY_DEPS}`
      );
    }
    return mod;
  });
};
