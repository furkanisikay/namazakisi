// Wear OS saat uygulamasi (issue #269) — BAGIMSIZ Gradle koku.
// android/ (React Native + Expo) yapilandirmasina BILINCLI olarak dahil edilmez:
// EAS `:app:bundleRelease` calistirirken settings'teki tum projeleri yapilandirir;
// Compose/Kotlin surumlerini RN'in Kotlin surumune kilitlemek release hattini
// kirma riski tasirdi. Tasarim: docs/superpowers/specs/2026-10-12-wear-os-uyumlulugu-design.md
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
rootProject.name = "namazakisi-wear"
include(":app")
