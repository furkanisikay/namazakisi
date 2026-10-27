package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.text.DecimalFormatSymbols
import java.util.Locale

/**
 * Telefonun native yüzeyleri kullanıcının SEÇTİĞİ rakamı yalnız Arapça arayüzde uygular
 * (`Rakam.kt`); çekirdek Batı rakamıyla üretmeye devam eder, diğer dillerde çıktı birebir aynı.
 */
class RakamTest {
    @Test
    fun yalnizArapcaVeArabKaydiDoguRakamiVerir() {
        assertEquals(Rakam.ARAB, Rakam.sistem("ar", "arab"))
        assertEquals(Rakam.ARAB, Rakam.sistem("ar-SA", " arab "))
        assertEquals('٠', Rakam.sifir("ar", "arab"))
        // Kayıt yok / latn / bozuk → Batı.
        assertEquals(Rakam.LATN, Rakam.sistem("ar", null))
        assertEquals(Rakam.LATN, Rakam.sistem("ar", "latn"))
        assertEquals(Rakam.LATN, Rakam.sistem("ar", "ARAB"))
        assertEquals('0', Rakam.sifir("ar", null))
        // Arapça dışı dilde kayıt yok sayılır (dil değişimiyle yazım yarışı olsa bile).
        for (dil in listOf("tr", "en", "id", "in", "de", "fr", "bs", "ru", "ms", "ur", "", null)) {
            assertEquals("$dil", Rakam.LATN, Rakam.sistem(dil, "arab"))
            assertEquals("$dil", '0', Rakam.sifir(dil, "arab"))
        }
    }

    @Test
    fun yerelEtiketiYalnizArapcadaUzantiTasir() {
        assertEquals("ar-u-nu-arab", Rakam.yerelEtiketi("ar", "arab"))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", null))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", "latn"))
        // Diğer diller AYNEN (Endonezce "id" → Android "in" eşlemesi bozulmasın).
        for (dil in listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur")) {
            assertEquals(dil, Rakam.yerelEtiketi(dil, "arab"))
        }
    }

    @Test
    fun uzantiliYerelAyarKaynakBicimlemesiniSecimeGoreYapar() {
        // `getString(id, Int)` = `String.format(yapılandırmaYerelAyarı, …)`: `%d` seçimi izler.
        assertEquals('٠', DecimalFormatSymbols.getInstance(Locale.forLanguageTag(Rakam.yerelEtiketi("ar", "arab"))).zeroDigit)
        assertEquals('0', DecimalFormatSymbols.getInstance(Locale.forLanguageTag(Rakam.yerelEtiketi("ar", null))).zeroDigit)
        assertEquals("٥", String.format(Locale.forLanguageTag("ar-u-nu-arab"), "%d", 5))
        assertEquals("5", String.format(Locale.forLanguageTag("ar-u-nu-latn"), "%d", 5))
        assertEquals("ar", Locale.forLanguageTag("ar-u-nu-arab").language)
    }

    @Test
    fun yalnizAsciiRakamlarCevrilir() {
        val s = Rakam.DOGU_SIFIR
        assertEquals("٠٥:٥٥", rakamlariYerellestir("05:55", s))
        assertEquals("النهاية ١٥:٤٢", rakamlariYerellestir("النهاية 15:42", s))
        assertEquals("التالية: العصر · ١٥:٤٢", rakamlariYerellestir("التالية: العصر · 15:42", s))
        assertEquals("١ س ٥ د", rakamlariYerellestir("1 س 5 د", s))
        assertEquals("--:--", rakamlariYerellestir("--:--", s))
        assertEquals("", rakamlariYerellestir("", s))
        // İdempotent: zaten Doğu rakamı olan metin aynen kalır.
        assertEquals("١٢:٠٩", rakamlariYerellestir(rakamlariYerellestir("12:09", s), s))
    }

    @Test
    fun batiRakamindaMetinAynenDoner() {
        // Türkçe ve diğer dillerde çıktı birebir aynı (aynı nesne).
        val metin = "Çıkış 15:42"
        assertSame(metin, rakamlariYerellestir(metin, '0'))
        assertSame(metin, rakamlariYerellestir(metin, Rakam.sifir("tr", "arab")))
        val rakamsiz = "العصر"
        assertSame(rakamsiz, rakamlariYerellestir(rakamsiz, Rakam.DOGU_SIFIR))
        assertEquals("1 sa 5 dk", rakamlariYerellestir("1 sa 5 dk", Rakam.sifir("ar", null)))
    }

    @Test
    fun sistemBicimiSeciliRakamaEsitlenir() {
        // `TextClock` cihaz yerel ayarıyla yazar: ar-SA cihazda Batı seçen kullanıcıya da
        // Doğu rakamı gelir → Arapça arayüzde seçilen diziye eşitlenir.
        assertEquals("05:30", rakamlariEsitle("٠٥:٣٠", '0'))
        assertEquals("٠٥:٣٠", rakamlariEsitle("05:30", Rakam.DOGU_SIFIR))
        assertEquals("٠٥:٣٠", rakamlariEsitle("۰۵:۳۰", Rakam.DOGU_SIFIR))
        val ayni = "05:30"
        assertSame(ayni, rakamlariEsitle(ayni, '0'))
        val dogu = "٠٥:٣٠"
        assertSame(dogu, rakamlariEsitle(dogu, Rakam.DOGU_SIFIR))
    }

    @Test
    fun cekirdekMetniBatiRakamiylaUretilir() {
        // Dönüşüm yalnız çizim kenarında: çekirdek Arapçada da Batı rakamı yazar.
        val saat = saatMetni(0L, java.util.TimeZone.getTimeZone("UTC"))
        assertEquals("00:00", saat)
        assertEquals("٠٠:٠٠", rakamlariYerellestir(saat, Rakam.DOGU_SIFIR))
    }

    @Test
    fun cekirdekVeArapcaKaynaklarDoguRakamiTasimaz() {
        // Doğu rakamı yalnız çizimde üretilir; tabloya/kaynağa yazılırsa Batı rakamı seçen
        // (Mağrip) kullanıcı karışık rakam görür. Çalışma dizini `android/app` (Gradle birim testi).
        val dosyalar = (File("src/main/java/com/furkanisikay/namazakisi/cekirdek").listFiles().orEmpty().toList() +
            File("src/main/res").listFiles().orEmpty().filter { it.name.startsWith("values") }
                .flatMap { d -> d.listFiles().orEmpty().filter { it.name.endsWith(".xml") } })
            .filter { it.name != "Rakam.kt" }
        assertTrue(dosyalar.size > 10)
        for (f in dosyalar) {
            val dogu = f.readText().filter { it in '٠'..'٩' || it in '۰'..'۹' }
            assertEquals("${f.path} Doğu rakamı taşıyor", "", dogu)
        }
    }
}
