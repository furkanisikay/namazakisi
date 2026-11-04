package expo.modules.countdownnotification.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Test

/**
 * Uygulama modülündeki `RakamTest`'in ikizi: sayaç/Live Update metinleri seçimi yalnız yerel
 * rakamlı dilde (Arapça, Bengalce, Farsça, Peştuca, Soranî, Sindhçe) ve yalnız dilin kendi sistemiyle uygular.
 */
class RakamTest {
    @Test
    fun yalnizArapcaVeArabKaydiDoguRakamiVerir() {
        assertEquals('٠', Rakam.sifir("ar", "arab"))
        assertEquals('0', Rakam.sifir("ar", null))
        assertEquals('0', Rakam.sifir("ar", "latn"))
        assertEquals('0', Rakam.sifir("ar", "beng"))
        for (dil in listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "pt", "it", "sv", "uk", "ro", "hr", "sr", "el", "ku", "tk", "tt", "pl", "ja", "gu", "bg", "mk", "fil", "te", "kn", "si", "km", "he", "ka", "lt", "mg", "lg", "rw", "rn", "ln", "dag", "mos", "aa", "mdh", "ak", "ceb", null)) {
            assertEquals("$dil", '0', Rakam.sifir(dil, "arab"))
            assertEquals("$dil", '0', Rakam.sifir(dil, "beng"))
            assertEquals("$dil", '0', Rakam.sifir(dil, "arabext"))
        }
        assertEquals("ar-u-nu-arab", Rakam.yerelEtiketi("ar", "arab"))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", null))
        assertEquals("tr", Rakam.yerelEtiketi("tr", "arab"))
    }

    @Test
    fun bengalcedeBengKaydiBengalceRakamVerir() {
        assertEquals('০', Rakam.sifir("bn", "beng"))
        assertEquals('০', Rakam.sifir("bn-BD", "beng"))
        assertEquals('0', Rakam.sifir("bn", null))
        assertEquals('0', Rakam.sifir("bn", "latn"))
        assertEquals('0', Rakam.sifir("bn", "arab"))
        assertEquals("bn-u-nu-beng", Rakam.yerelEtiketi("bn", "beng"))
        assertEquals("bn-u-nu-latn", Rakam.yerelEtiketi("bn", null))
        val kisa = CanliGuncellemeKurallari.kisaMetin(65 * 60_000L, "bn")
        assertEquals("15", kisa.filter { it in '0'..'9' })
        assertEquals("১৫", rakamlariYerellestir(kisa, Rakam.BENG_SIFIR).filter { it in '০'..'৯' })
    }

    @Test
    fun dalga12DevanagariBengalceFarsRakamlari() {
        assertEquals('०', Rakam.sifir("mr", "deva"))
        assertEquals('०', Rakam.sifir("ne-NP", "deva"))
        assertEquals('০', Rakam.sifir("as", "beng"))
        assertEquals('۰', Rakam.sifir("pa", "arabext"))
        assertEquals('0', Rakam.sifir("mr", "beng"))
        assertEquals('0', Rakam.sifir("hi", "deva"))
        assertEquals("mr-u-nu-deva", Rakam.yerelEtiketi("mr", "deva"))
        val kisa = CanliGuncellemeKurallari.kisaMetin(65 * 60_000L, "mr")
        assertEquals("१५", rakamlariYerellestir(kisa, Rakam.DEVA_SIFIR).filter { it in '०'..'९' })
    }

    @Test
    fun dalga13NkoRakami() {
        assertEquals('\u07C0', Rakam.sifir("nqo", "nkoo"))
        assertEquals('\u07C0', Rakam.sifir("nqo-GN", "nkoo"))
        assertEquals('0', Rakam.sifir("nqo", "deva"))
        assertEquals('0', Rakam.sifir("he", "nkoo"))
        assertEquals("nqo-u-nu-nkoo", Rakam.yerelEtiketi("nqo", "nkoo"))
        val kisa = CanliGuncellemeKurallari.kisaMetin(65 * 60_000L, "nqo")
        assertEquals("\u07C1\u07C5", rakamlariYerellestir(kisa, Rakam.NKOO_SIFIR).filter { it in '\u07C0'..'\u07C9' })
    }

    @Test
    fun farscaPestucaFarsSoraniDoguArapRakamiVerir() {
        assertEquals('۰', Rakam.sifir("fa", "arabext"))
        assertEquals('۰', Rakam.sifir("ps-AF", "arabext"))
        assertEquals('٠', Rakam.sifir("ckb", "arab"))
        assertEquals('0', Rakam.sifir("fa", "arab"))
        assertEquals('0', Rakam.sifir("ckb", "arabext"))
        assertEquals('0', Rakam.sifir("ps", null))
        assertEquals("fa-u-nu-arabext", Rakam.yerelEtiketi("fa", "arabext"))
        assertEquals("ckb-u-nu-arab", Rakam.yerelEtiketi("ckb", "arab"))
        assertEquals("ps-u-nu-latn", Rakam.yerelEtiketi("ps", "latn"))
        val kisa = CanliGuncellemeKurallari.kisaMetin(65 * 60_000L, "fa")
        assertEquals("15", kisa.filter { it in '0'..'9' })
        assertEquals("۱۵", rakamlariYerellestir(kisa, Rakam.ARABEXT_SIFIR).filter { it in '۰'..'۹' })
    }

    @Test
    fun kisaMetinCizimKenarindaCevrilir() {
        // Çekirdek (`kisaMetin`) Batı rakamıyla üretir; dönüşüm bildirim kurulurken.
        val kisa = CanliGuncellemeKurallari.kisaMetin(65 * 60_000L, "ar")
        assertEquals("1 س 5 د", kisa)
        assertEquals("١ س ٥ د", rakamlariYerellestir(kisa, Rakam.DOGU_SIFIR))
        val tr = CanliGuncellemeKurallari.kisaMetin(12 * 60_000L)
        assertSame(tr, rakamlariYerellestir(tr, Rakam.sifir("tr", "arab")))
    }
}
