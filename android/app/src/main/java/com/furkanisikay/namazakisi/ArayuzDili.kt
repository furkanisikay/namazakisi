package com.furkanisikay.namazakisi

import android.content.Context
import android.content.res.Configuration
import android.text.Spanned
import android.text.SpannableStringBuilder
import com.furkanisikay.namazakisi.cekirdek.Rakam
import com.furkanisikay.namazakisi.cekirdek.VakitAdlari
import com.furkanisikay.namazakisi.cekirdek.rakamlariYerellestir
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
     * Arayüzün rakam sistemi: "arab" (Doğu Arap rakamı) ya da anahtar yok (Batı). JS ÇÖZÜLMÜŞ
     * değeri yazar (`DilServisi > rakamSisteminiBildir`); yalnız Arapça arayüzde uygulanır
     * (`cekirdek/Rakam`).
     */
    const val TERCIH_RAKAM_SISTEMI = "rakam_sistemi"

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

    /** Ham rakam kaydı ("arab" ya da null); yorumu `Rakam.sistem` yapar. */
    fun rakamKaydi(context: Context): String? = try {
        (context.applicationContext ?: context)
            .getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
            .getString(TERCIH_RAKAM_SISTEMI, null)
    } catch (_: Exception) {
        null
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
// Arapçada etiket `-u-nu-<sistem>` taşır (`Rakam.yerelEtiketi`): kaynak `%d`'si ve tarih
// biçimleyicileri kullanıcının seçtiği rakamla yazar; diğer dillerde etiket aynen.
fun Context.dildeBaglam(): Context = try {
    val yapilandirma = Configuration(resources.configuration)
    yapilandirma.setLocale(Locale.forLanguageTag(Rakam.yerelEtiketi(arayuzDili(), ArayuzDili.rakamKaydi(this))))
    createConfigurationContext(yapilandirma)
} catch (_: Exception) {
    this
}

/**
 * Çizim kenarının sıfır rakamı: Arapça arayüzde "arab" seçiliyse '٠', aksi halde '0'
 * (Türkçe dahil diğer dillerde metin aynen kalır). Bir çizim turunda BİR KEZ okunur.
 */
fun Context.rakamSifiri(): Char = Rakam.sifir(arayuzDili(), ArayuzDili.rakamKaydi(this))

/**
 * Görünen metnin ASCII rakamlarını [sifir] dizisine çevirir (`cekirdek/rakamlariYerellestir`).
 * Biçimli metinde (Spanned) uzunluk korunarak yerinde değiştirilir, biçim kaybolmaz. '0'da
 * ya da rakamsız metinde AYNI nesne döner. Yalnız GÖRÜNEN metne uygula: kimlik, veri, sesli
 * okuma ve erişilebilirlik açıklaması Batı rakamıyla kalır.
 */
fun CharSequence.rakamla(sifir: Char): CharSequence {
    if (sifir == '0' || none { it in '0'..'9' }) return this
    if (this !is Spanned) return rakamlariYerellestir(toString(), sifir)
    val sb = SpannableStringBuilder(this)
    val fark = sifir - '0'
    for (i in 0 until sb.length) {
        val c = sb[i]
        if (c in '0'..'9') sb.replace(i, i + 1, (c + fark).toString())
    }
    return sb
}

fun String.rakamla(sifir: Char): String = rakamlariYerellestir(this, sifir)
