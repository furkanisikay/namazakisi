package expo.modules.countdownnotification.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Test

/** Uygulama modülündeki `RakamTest`'in ikizi: sayaç/Live Update metinleri seçimi yalnız Arapçada uygular. */
class RakamTest {
    @Test
    fun yalnizArapcaVeArabKaydiDoguRakamiVerir() {
        assertEquals('٠', Rakam.sifir("ar", "arab"))
        assertEquals('0', Rakam.sifir("ar", null))
        assertEquals('0', Rakam.sifir("ar", "latn"))
        for (dil in listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "bn", null)) {
            assertEquals("$dil", '0', Rakam.sifir(dil, "arab"))
        }
        assertEquals("ar-u-nu-arab", Rakam.yerelEtiketi("ar", "arab"))
        assertEquals("ar-u-nu-latn", Rakam.yerelEtiketi("ar", null))
        assertEquals("tr", Rakam.yerelEtiketi("tr", "arab"))
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
