package expo.modules.countdownnotification

import android.content.Context
import expo.modules.countdownnotification.cekirdek.Rakam

/**
 * Uygulamanın ARAYÜZ dili (dil kodu: "tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn") — JS
 * etkin dil değişince yazar; uygulama modülü (widget, bildirim, alarm) ve diğer yerel
 * modüller aynı tercih dosyasını okur. Sesli okuma dilinden (`AnonsKonusucu`, BCP-47)
 * AYRIDIR: ses motoru başka dile düşebilir. Uygulama hiç açılmadıysa (JS yazmadı) Türkçe.
 *
 * Aynı dosyada kullanıcının seçtiği VAKİT ADI TAKIMI da durur ([TERCIH_VAKIT_ADLARI], JSON;
 * okuyan uygulama modülü `cekirdek/VakitAdlari`). Yoksa her yüzey dil tablosunu kullanır.
 * RAKAM SİSTEMİ de buradadır ([TERCIH_RAKAM_SISTEMI]: "arab" Doğu Arap, "beng" Bengalce; yoksa Batı).
 */
object ArayuzDili {
    const val TERCIH_DOSYASI = "namazakisi_dil"
    const val TERCIH_KOD = "kod"
    const val TERCIH_VAKIT_ADLARI = "vakit_adlari"
    const val TERCIH_RAKAM_SISTEMI = "rakam_sistemi"
    const val VARSAYILAN = "tr"

    fun kaydet(context: Context, kod: String) {
        val temiz = kod.trim().ifEmpty { VARSAYILAN }
        context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
            .edit().putString(TERCIH_KOD, temiz).apply()
    }

    /**
     * Vakit adı takımını yazar; `null` ya da boş dize anahtarı SİLER (tablo adlarına dönülür).
     * İçerik burada doğrulanmaz: okuyan taraf bozuk JSON'da tabloya düşer.
     */
    fun vakitAdlariniKaydet(context: Context, json: String?) {
        val duzen = context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE).edit()
        if (json.isNullOrBlank()) duzen.remove(TERCIH_VAKIT_ADLARI) else duzen.putString(TERCIH_VAKIT_ADLARI, json)
        duzen.apply()
    }

    /** Rakam sistemini yazar; `null` ya da boş dize anahtarı SİLER (Batı rakamı). */
    fun rakamSisteminiKaydet(context: Context, kod: String?) {
        val duzen = context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE).edit()
        if (kod.isNullOrBlank()) duzen.remove(TERCIH_RAKAM_SISTEMI) else duzen.putString(TERCIH_RAKAM_SISTEMI, kod.trim())
        duzen.apply()
    }

    fun oku(context: Context): String = try {
        context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
            .getString(TERCIH_KOD, VARSAYILAN) ?: VARSAYILAN
    } catch (_: Exception) {
        VARSAYILAN
    }

    /** Ham rakam kaydı ("arab", "beng" ya da null); yorumu `cekirdek/Rakam.sistem` yapar (yalnız dilin kendi sistemi). */
    fun rakamKaydi(context: Context): String? = try {
        context.applicationContext.getSharedPreferences(TERCIH_DOSYASI, Context.MODE_PRIVATE)
            .getString(TERCIH_RAKAM_SISTEMI, null)
    } catch (_: Exception) {
        null
    }

    /** Görünen metnin sıfır rakamı: Arapçada "arab" → '٠', Bengalcede "beng" → '০', aksi halde '0' (metin aynen). */
    fun rakamSifiri(context: Context): Char = Rakam.sifir(oku(context), rakamKaydi(context))
}
