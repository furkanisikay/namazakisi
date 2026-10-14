// Android TV namaz vakitleri panosu (issue #286) — BAGIMSIZ Gradle koku.
// wear/'in ikizi: android/ (React Native + Expo) yapilandirmasina BILINCLI olarak
// dahil edilmez. EAS `:app:bundleRelease` settings'teki tum projeleri yapilandirir;
// Compose/Kotlin surumlerini RN'in Kotlin surumune kilitlemek release hattini kirardi.
// react-native-tvos da KULLANILMAZ: config eklentisi prebuild'de calisir ve depodaki
// android/ dizini ile cakisir (AGENTS.md "android-build.yml PREBUILD CALISTIRMAZ").
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "namazakisi-tv"
include(":app")
