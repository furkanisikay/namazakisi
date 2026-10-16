package expo.modules.camigeofence.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AyarEkraniKarariTest {

    @Test
    fun erisimVarkenYonlendirmeYok() {
        assertTrue(AyarEkraniKarari.erisimEkranlari(true).isEmpty())
    }

    @Test
    fun erisimYokkenDndEkraniOnceYedeklerSonra() {
        assertEquals(
            listOf(AyarHedefi.DND_ERISIMI, AyarHedefi.MODLAR, AyarHedefi.UYGULAMA_AYRINTI),
            AyarEkraniKarari.erisimEkranlari(false),
        )
    }

    @Test
    fun samsungdaKuralSayfasiAtlanir() {
        assertEquals(
            listOf(AyarHedefi.MODLAR, AyarHedefi.UYGULAMA_AYRINTI),
            AyarEkraniKarari.modEkranlari(36, "samsung", "kural-1"),
        )
        assertEquals(
            listOf(AyarHedefi.MODLAR, AyarHedefi.UYGULAMA_AYRINTI),
            AyarEkraniKarari.modEkranlari(35, " Samsung ", "kural-1"),
        )
    }

    @Test
    fun digerUreticideApi35ileKuralSayfasiOnce() {
        assertEquals(
            listOf(AyarHedefi.KURAL_AYARI, AyarHedefi.MODLAR, AyarHedefi.UYGULAMA_AYRINTI),
            AyarEkraniKarari.modEkranlari(35, "Google", "kural-1"),
        )
    }

    @Test
    fun eskiApiYaDaKuralsizdaGenelEkran() {
        assertEquals(AyarHedefi.MODLAR, AyarEkraniKarari.modEkranlari(34, "Google", "kural-1").first())
        assertEquals(AyarHedefi.MODLAR, AyarEkraniKarari.modEkranlari(36, "Google", null).first())
        assertEquals(AyarHedefi.MODLAR, AyarEkraniKarari.modEkranlari(36, null, " ").first())
    }

    @Test
    fun guvenlikHatasiErisimVarkenErisimYokDemez() {
        assertEquals("hata", AyarEkraniKarari.guvenlikHatasiSonucu(true))
        assertEquals("erisimYok", AyarEkraniKarari.guvenlikHatasiSonucu(false))
    }
}
