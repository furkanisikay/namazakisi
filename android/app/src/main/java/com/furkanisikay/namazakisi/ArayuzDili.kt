package com.furkanisikay.namazakisi

import android.content.Context
import android.content.res.Configuration
import com.furkanisikay.namazakisi.cekirdek.VakitAdlari
import java.util.Locale

/**
 * Uygulamanın ARAYÜZ dili (dil kodu: "tr", "en", "id"…) — telefon uygulama modülündeki TEK okuyucu.
 *
 * İKİZ: `modules/expo-countdown-notification/.../ArayuzDili.kt` (yazan taraf; JS etkin dil
 * değişince yazar). Sabitler orayla AYNI ada ve değere sahiptir; modüle derleme bağımlılığı
 * EKLENMEDİ (uygulama modülü modül sınıflarını görse de dil kaynağı tek dosya + tek anahtar
 * sözleşmesidir). Biri değişirse ikisini birlikte değiştir. Uygulama hiç açılmadıysa
 * (JS yazmadı) Türkçe.
 *
 * Sesli okuma dilinden (`AnonsKonusucu`, BCP-47) AYRIDIR.
 */
object ArayuzDili {
    const val TERCIH_DOSYASI = "namazakisi_dil"
    const val TERCIH_KOD = "kod"
    const val VARSAYILAN = "tr"

    /** Kullanıcının seçtiği vakit adı takımı (JSON, `cekirdek/VakitAdlari`); yoksa dil tablosu. */
    const val TERCIH_VAKIT_ADLARI = "vakit_adlari"

    /**
     * Arayüz dili kodu ("tr", "en", "id", "de"…; `cekirdek/MetinDili.coz` çözer). Okurken
     * vakit adı takımını da tazeler ([VakitAdlari.etkin]): dili okuyan her çizim/metin yolu
     * (widget, bildirim, kısayol, asistan) aynı anda güncel adları alır.
     */
    fun oku(context: Context): String = try {
        val tercih = (context.applicationContext ?: context)
            .getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
        VakitAdlari.etkinYap(tercih.getString(TERCIH_VAKIT_ADLARI, null))
        tercih.getString(TERCIH_KOD, VARSAYILAN)
            ?.trim()
            ?.ifEmpty { VARSAYILAN }
            ?: VARSAYILAN
    } catch (_: Exception) {
        VARSAYILAN
    }
}

/** Uygulamanın arayüz dili kodu ("tr", "en", "id"…); saf `cekirdek/` kararlarına `dil` olarak verilir. */
fun Context.arayuzDili(): String = ArayuzDili.oku(this)

/**
 * Arayüz dilindeki kaynak bağlamı: widget, bildirim, alarm, alıcı ve servis metinleri
 * `getString` ile BURADAN çözülür (uygulama dili cihaz dilinden farklı olabilir; sistemin
 * verdiği bağlam cihaz dilini izler). Etkinlikler `attachBaseContext(newBase.dildeBaglam())`
 * ile bütün kaynaklarını bu dilde alır.
 *
 * Dönen bağlamın `applicationContext`'i YERELLEŞTİRİLMEMİŞ uygulama bağlamıdır: metni bu
 * bağlamdan çöz, başka işleri (PendingIntent, SharedPreferences…) asıl bağlamla yap.
 * Bağlam kurulamazsa (beklenmez) asıl bağlam döner — metin cihaz dilinde çıkar, çökmez.
 */
// Endonezce: JS "id" yazar; `Locale.forLanguageTag("id")` Android'de eski "in" koduna döner ve
// kaynak sistemi `values-in`'i seçer (`values-id` hiç seçilmez — lint `LocaleFolder`).
fun Context.dildeBaglam(): Context = try {
    val yapilandirma = Configuration(resources.configuration)
    yapilandirma.setLocale(Locale.forLanguageTag(arayuzDili()))
    createConfigurationContext(yapilandirma)
} catch (_: Exception) {
    this
}
