package expo.modules.countdownnotification.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Test

/**
 * Uygulama modülündeki `RakamTest`'in ikizi: sayaç/Live Update metinleri seçimi yalnız yerel
 * rakamlı dilde (Arapça, Bengalce, Farsça, Peştuca, Soranî) ve yalnız dilin kendi sistemiyle uygular.
 */
class RakamTest {
    @Test
    fun yalnizArapcaVeArabKaydiDoguRakamiVerir() {
        assertEquals('٠', Rakam.sifir("ar", "arab"))
        assertEquals('0', Rakam.sifir("ar", null))
        assertEquals('0', Rakam.sifir("ar", "latn"))
        assertEquals('0', Rakam.sifir("ar", "beng"))
        for (dil in listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "ug", "az", "uz", "kk", "ky", "tg", null)) {
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
