import groovy.json.JsonSlurper

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

/**
 * Surum adi TELEFONLA birlikte yurur: kaynak `app.json > expo.version` (wear ile ayni).
 *
 * versionCode: Play'deki telefon kodu build aninda atanan `date +%s` zaman
 * damgasidir (expo-build.yml). TV AAB'si ayni uygulama kaydinda BENZERSIZ kod
 * ister → kendi hattinda `-PtvVersionCode=$(date +%s)` verilir (wear'in
 * `-PwearVersionCode` konvansiyonu). Yerelde/PR'da varsayilan 1.
 */
val telefonSurumu: String = run {
    val dosya = rootProject.file("../app.json")
    if (!dosya.exists()) return@run "0.0.0"
    @Suppress("UNCHECKED_CAST")
    val expo = (JsonSlurper().parse(dosya) as Map<String, Any?>)["expo"] as Map<String, Any?>
    expo["version"] as String
}

android {
    namespace = "com.furkanisikay.namazakisi.tv"
    compileSdk = 36

    defaultConfig {
        // Telefonla AYNI applicationId: Play'de ayni uygulama kaydinin "Android TV"
        // form faktoru izine ayri AAB olarak yuklenir (wear ile ayni yol; tek magaza
        // sayfasi, tek puan). Gerekce AGENTS.md "Android TV panosu" bolumunde.
        applicationId = "com.furkanisikay.namazakisi"
        // kotlinx-datetime JVM'de java.time kullanir → 26 alti desugaring isterdi.
        minSdk = 26
        targetSdk = 36
        versionCode = (project.findProperty("tvVersionCode") as String?)?.toInt() ?: 1
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
        // Debug: telefonun debug anahtariyla ayni (wear deseni; tek anahtar dosyasi).
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
    sourceSets {
        // Il listesi ve vakit fiksturu JVM testinde de okunur (tek kaynak: assets).
        getByName("test") {
            resources.srcDir("src/main/assets")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(libs.tv.material)
    implementation(libs.compose.ui)
    implementation(libs.compose.foundation)
    implementation(libs.activity.compose)
    implementation(libs.adhan2)
    implementation(libs.zxing.core)

    testImplementation(libs.junit)
    // Android'in org.json'u JVM birim testinde stub'dir ("Method not mocked") → gercek uygulama.
    testImplementation(libs.org.json)
}
