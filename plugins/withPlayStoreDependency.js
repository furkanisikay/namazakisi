/**
 * Expo Config Plugin — Play Store In-App Update Dependency
 *
 * expo prebuild --clean her calistiginda android/app/build.gradle'i
 * sifirdan olusturur. Bu plugin, PlayStoreGuncellemeModulu.kt icin
 * gereken Google Play In-App Update bagimliligini otomatik olarak ekler.
 */

const { withAppBuildGradle } = require('@expo/config-plugins');

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
