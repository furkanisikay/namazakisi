package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.text.DecimalFormatSymbols
import java.util.Locale

/**
 * Telefonun native yüzeyleri kullanıcının SEÇTİĞİ rakamı yalnız yerel rakamlı arayüzde (Arapça,
 * Bengalce) ve yalnız dilin KENDİ sistemiyle uygular (`Rakam.kt`); çekirdek Batı rakamıyla
 * üretmeye devam eder, diğer dillerde çıktı birebir aynı.
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
        // Yerel rakamsız dilde kayıt yok sayılır (dil değişimiyle yazım yarışı olsa bile).
        for (dil in listOf("tr", "en", "id", "in", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "ug", "", null)) {
            assertEquals("$dil", Rakam.LATN, Rakam.sistem(dil, "arab"))
            assertEquals("$dil", Rakam.LATN, Rakam.sistem(dil, "beng"))
            assertEquals("$dil", Rakam.LATN, Rakam.sistem(dil, "arabext"))
            assertEquals("$dil", '0', Rakam.sifir(dil, "arab"))
            assertEquals("$dil", '0', Rakam.sifir(dil, "beng"))
        }
        // Başka dilin yerel sistemi geçersiz: Arapçada "beng", Bengalcede "arab" → Batı.
        assertEquals(Rakam.LATN, Rakam.sistem("ar", "beng"))
        assertEquals(Rakam.LATN, Rakam.sistem("bn", "arab"))
    }

    @Test
    fun bengalcedeBengKaydiBengalceRakamVerir() {
        assertEquals(Rakam.BENG, Rakam.sistem("bn", "beng"))
        assertEquals(Rakam.BENG, Rakam.sistem("bn-BD", " beng "))
        assertEquals(Rakam.BENG, Rakam.sistem("bn_IN", "beng"))
        assertEquals('০', Rakam.sifir("bn", "beng"))
        assertEquals(Rakam.LATN, Rakam.sistem("bn", null))
        assertEquals(Rakam.LATN, Rakam.sistem("bn", "latn"))
        assertEquals('0', Rakam.sifir("bn", "latn"))
        assertTrue(Rakam.yerelRakamli("bn") && Rakam.yerelRakamli("ar-SA"))
        assertFalse(Rakam.yerelRakamli("ur") || Rakam.yerelRakamli("hi") || Rakam.yerelRakamli("tr") || Rakam.yerelRakamli(null))
        assertEquals("আসর ১৫:৪২", rakamlariYerellestir("আসর 15:42", Rakam.sifir("bn", "beng")))
        assertEquals("০১২৩৪৫৬৭৮৯", rakamlariYerellestir("0123456789", Rakam.BENG_SIFIR))
    }

    @Test
    fun farscaPestucaFarsSoraniDoguArapRakamiVerir() {
        // Farsça ve Peştuca "arabext" (۰ U+06F0), Soranî "arab" (٠ U+0660); başka sistemin kaydı Batı.
        assertEquals(Rakam.ARABEXT, Rakam.sistem("fa", "arabext"))
        assertEquals(Rakam.ARABEXT, Rakam.sistem("fa-IR", " arabext "))
        assertEquals(Rakam.ARABEXT, Rakam.sistem("ps_AF", "arabext"))
        assertEquals(Rakam.ARAB, Rakam.sistem("ckb", "arab"))
        assertEquals(Rakam.ARAB, Rakam.sistem("ckb-IQ", "arab"))
        assertEquals(Rakam.LATN, Rakam.sistem("fa", "arab"))
        assertEquals(Rakam.LATN, Rakam.sistem("ps", "beng"))
        assertEquals(Rakam.LATN, Rakam.sistem("ckb", "arabext"))
        assertEquals(Rakam.LATN, Rakam.sistem("ar", "arabext"))
        assertEquals(Rakam.LATN, Rakam.sistem("fa", null))
        assertEquals(Rakam.LATN, Rakam.sistem("ckb", "latn"))
        assertEquals(Rakam.ARABEXT_SIFIR, Rakam.sifir("fa", "arabext"))
        assertEquals(Rakam.ARABEXT_SIFIR, Rakam.sifir("ps", "arabext"))
        assertEquals(Rakam.DOGU_SIFIR, Rakam.sifir("ckb", "arab"))
        assertEquals('0', Rakam.sifir("fa", "latn"))
        assertTrue(Rakam.yerelRakamli("fa") && Rakam.yerelRakamli("ps-AF") && Rakam.yerelRakamli("ckb"))
        assertFalse(Rakam.yerelRakamli("ug"))
        assertEquals("۰۱۲۳۴۵۶۷۸۹", rakamlariYerellestir("0123456789", Rakam.ARABEXT_SIFIR))
        assertEquals("۰۵:۳۰", rakamlariEsitle("٠٥:٣٠", Rakam.ARABEXT_SIFIR))
        assertEquals("fa-u-nu-arabext", Rakam.yerelEtiketi("fa", "arabext"))
        assertEquals("fa-u-nu-latn", Rakam.yerelEtiketi("fa", "arab"))
        assertEquals("ps-u-nu-arabext", Rakam.yerelEtiketi("ps", "arabext"))
        assertEquals("ckb-u-nu-arab", Rakam.yerelEtiketi("ckb", "arab"))
        assertEquals("ckb-u-nu-latn", Rakam.yerelEtiketi("ckb", null))
        assertEquals("ug", Rakam.yerelEtiketi("ug", "arabext"))
        // JDK CLDR: çıplak fa/ps Fars, ckb Doğu Arap rakamı yazar → Batı seçene uzantı ŞART.
        assertEquals('۰', DecimalFormatSymbols.getInstance(Locale.forLanguageTag("fa")).zeroDigit)
        assertEquals('٠', DecimalFormatSymbols.getInstance(Locale.forLanguageTag("ckb")).zeroDigit)
        assertEquals("۵", String.format(Locale.forLanguageTag("fa-u-nu-arabext"), "%d", 5))
        assertEquals("5", String.format(Locale.forLanguageTag(Rakam.yerelEtiketi("ps", null)), "%d", 5))
        assertEquals("٥", String.format(Locale.forLanguageTag(Rakam.yerelEtiketi("ckb", "arab")), "%d", 5))
        assertEquals("ckb", Locale.forLanguageTag("ckb-u-nu-arab").language)
    }

    @Test
    fun yerelEtiketiYalnizArapcadaUzantiTasir() {
        assertEquals("ar-u-nu-arab", Rakam.yerelEtiketi("ar", "arab"))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", null))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", "latn"))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", "beng"))
        assertEquals("bn-u-nu-beng", Rakam.yerelEtiketi("bn", "beng"))
        assertEquals("bn-u-nu-latn", Rakam.yerelEtiketi("bn", null))
        assertEquals("bn-u-nu-latn", Rakam.yerelEtiketi("bn", "arab"))
        // Diğer diller AYNEN (Endonezce "id" → Android "in" eşlemesi bozulmasın).
        for (dil in listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "ug")) {
            assertEquals(dil, Rakam.yerelEtiketi(dil, "arab"))
            assertEquals(dil, Rakam.yerelEtiketi(dil, "beng"))
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
        // Bengalce: CLDR varsayılanı Bengalce rakam → Batı seçen kullanıcı için uzantı ŞART.
        assertEquals('০', DecimalFormatSymbols.getInstance(Locale.forLanguageTag("bn")).zeroDigit)
        assertEquals('০', DecimalFormatSymbols.getInstance(Locale.forLanguageTag(Rakam.yerelEtiketi("bn", "beng"))).zeroDigit)
        assertEquals('0', DecimalFormatSymbols.getInstance(Locale.forLanguageTag(Rakam.yerelEtiketi("bn", null))).zeroDigit)
        assertEquals("৫", String.format(Locale.forLanguageTag("bn-u-nu-beng"), "%d", 5))
        assertEquals("5", String.format(Locale.forLanguageTag("bn-u-nu-latn"), "%d", 5))
        assertEquals("bn", Locale.forLanguageTag("bn-u-nu-latn").language)
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
        // bn-BD cihazda TextClock Bengalce yazar: Batı seçene Batı, Bengalce seçene Bengalce.
        assertEquals("05:30", rakamlariEsitle("০৫:৩০", '0'))
        assertEquals("০৫:৩০", rakamlariEsitle("05:30", Rakam.BENG_SIFIR))
        val beng = "০৫:৩০"
        assertSame(beng, rakamlariEsitle(beng, Rakam.BENG_SIFIR))
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
        // Yerel rakam yalnız çizimde üretilir; tabloya/kaynağa yazılırsa Batı rakamı seçen
        // (Mağrip, Batı seçen Bengalce) kullanıcı karışık rakam görür. Çalışma dizini `android/app` (Gradle birim testi).
        val dosyalar = (File("src/main/java/com/furkanisikay/namazakisi/cekirdek").listFiles().orEmpty().toList() +
            File("src/main/res").listFiles().orEmpty().filter { it.name.startsWith("values") }
                .flatMap { d -> d.listFiles().orEmpty().filter { it.name.endsWith(".xml") } })
            .filter { it.name != "Rakam.kt" }
        assertTrue(dosyalar.size > 10)
        for (f in dosyalar) {
            val dogu = f.readText().filter { it in '٠'..'٩' || it in '۰'..'۹' || it in '০'..'৯' }
            assertEquals("${f.path} yerel rakam taşıyor", "", dogu)
        }
    }
}
