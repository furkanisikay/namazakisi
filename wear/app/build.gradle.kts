import groovy.json.JsonSlurper

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

/**
 * Surum adi TELEFONLA birlikte yurur: kaynak `app.json > expo.version` (CI release
 * betigi onu yazar; build.gradle ondan turetilir).
 *
 * versionCode: Play'e giden telefon AAB'sinin kodu build aninda atanan
 * `date +%s` zaman damgasidir (expo-build.yml) — android/app/build.gradle'daki
 * sayi DEGIL. Saat AAB'si ayni uygulama kaydinda BENZERSIZ kod ister → kendi
 * hattinda `-PwearVersionCode=$(date +%s)` verilir (ayni konvansiyon, monoton).
 * Yerelde/PR'da varsayilan 1.
 */
val telefonSurumu: String = run {
    val dosya = rootProject.file("../app.json")
    if (!dosya.exists()) return@run "0.0.0"
    @Suppress("UNCHECKED_CAST")
    val expo = (JsonSlurper().parse(dosya) as Map<String, Any?>)["expo"] as Map<String, Any?>
    expo["version"] as String
}

android {
    namespace = "com.furkanisikay.namazakisi.saat"
    compileSdk = 36

    defaultConfig {
        // Data Layer eslesmesi icin telefonla AYNI applicationId ve AYNI imza sart.
        applicationId = "com.furkanisikay.namazakisi"
        minSdk = 30
        targetSdk = 36
        versionCode = (project.findProperty("wearVersionCode") as String?)?.toInt() ?: 1
        versionName = telefonSurumu
    }

    signingConfigs {
        // Play YUKLEME anahtari = telefonla AYNI (Play App Signing ayni kaydin tum form
        // faktorlerinde ayni yukleme anahtarini ister). Kaynak EAS kimlik bilgileri.
        val yuklemeDosyasi = project.findProperty("yuklemeKeystore") as String?
        if (yuklemeDosyasi != null) {
            create("yukleme") {
                storeFile = file(yuklemeDosyasi)
                storeType = (project.findProperty("yuklemeKeystoreTuru") as String?) ?: "jks"
                storePassword = project.findProperty("yuklemeKeystoreParolasi") as String?
                keyAlias = project.findProperty("yuklemeAnahtarAdi") as String?
                keyPassword = project.findProperty("yuklemeAnahtarParolasi") as String?
            }
        }
        // Debug: telefonun debug anahtariyla AYNI → emulator ciftinde Data Layer calisir.
        getByName("debug") {
            storeFile = rootProject.file("../android/app/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    val yuklemeImzasi = signingConfigs.findByName("yukleme")

    buildTypes {
        release {
            // Yukleme imzasi yalniz Play hattinda verilir (expo-build.yml > saat_tv):
            // anahtar EAS'te, CI onu ORG_GRADLE_PROJECT_yukleme* ozellikleriyle verir.
            // Ozellik yoksa (yerel/PR) bundleRelease IMZASIZ paket uretir, hata vermez.
            if (yuklemeImzasi != null) signingConfig = yuklemeImzasi
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
    testOptions {
        unitTests.isReturnDefaultValues = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(libs.wear.compose.material3)
    implementation(libs.wear.compose.foundation)
    implementation(libs.activity.compose)
    implementation(libs.wear.tiles)
    implementation(libs.wear.protolayout)
    implementation(libs.wear.protolayout.expression)
    implementation(libs.complications.data.source.ktx)
    implementation(libs.play.services.wearable)
    implementation(libs.wear.phone.interactions)
    implementation(libs.wear.ongoing)
    implementation(libs.wear.ambient)
    implementation(libs.concurrent.futures)
    implementation(libs.coroutines.play.services)

    testImplementation(libs.junit)
    // Android'in org.json'u JVM birim testinde stub'dir ("Method not mocked") → gercek uygulama.
    testImplementation(libs.org.json)
}
