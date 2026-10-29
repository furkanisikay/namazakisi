package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/** Telefon ikizi: `src/core/dil/__tests__/rakam.test.ts` (eşleme nöbetçisi orada). */
class RakamTest {
    @Test
    fun ulkeyeGoreDilVarsayilani() {
        assertEquals("arab", RakamKarari.sistem("ar", TvRakam("SA")))
        assertEquals("latn", RakamKarari.sistem("ar", TvRakam("MA")))
        assertEquals("arabext", RakamKarari.sistem("fa", TvRakam("IR")))
        assertEquals("arabext", RakamKarari.sistem("ps", null))
        assertEquals("arab", RakamKarari.sistem("ckb", TvRakam("IQ")))
        assertEquals("beng", RakamKarari.sistem("bn", TvRakam("IN")))
    }

    @Test
    fun acikSecimUlkeyiEzerGecersizSecimYokSayilir() {
        assertEquals("latn", RakamKarari.sistem("fa", TvRakam("IR", mapOf("fa" to "latn"))))
        assertEquals("arab", RakamKarari.sistem("ar", TvRakam("MA", mapOf("ar" to "arab"))))
        // Farsçada Doğu Arap rakamı geçersiz: ülke/dil varsayılanına düşer.
        assertEquals("arabext", RakamKarari.sistem("fa", TvRakam("IR", mapOf("fa" to "arab"))))
        // Başka dilin seçimi TV dilini etkilemez.
        assertEquals("arabext", RakamKarari.sistem("fa", TvRakam(null, mapOf("ar" to "latn"))))
    }

    @Test
    fun yerelRakamiOlmayanDilDaimaBati() {
        assertEquals("latn", RakamKarari.sistem("tr", TvRakam("SA", mapOf("tr" to "arab"))))
        assertEquals("latn", RakamKarari.sistem("ur", TvRakam("PK")))
        assertEquals("latn", RakamKarari.sistem("ug", TvRakam("CN")))
    }

    @Test
    fun yukCozumuVeGidisDonus() {
        val r = RakamKarari.coz(JSONObject("""{"u":"MA","s":{"ar":"arab","fa":"arab","bn":"latn","xx":"latn"}}"""))!!
        assertEquals(TvRakam("MA", mapOf("ar" to "arab", "bn" to "latn")), r)
        assertEquals(r, RakamKarari.coz(JSONObject(RakamKarari.yaz(r))))
        assertNull(RakamKarari.coz(JSONObject("""{"u":"ma"}""")))
        assertNull(RakamKarari.coz(null))
    }

    @Test
    fun cizimKenariCevirirVeNormallestirir() {
        assertEquals("۰۵:۴۲", rakamlariYerellestir("05:42", RakamKarari.sifir("arabext")))
        assertEquals("٠٥:٤٢", rakamlariYerellestir("05:42", RakamKarari.sifir("arab")))
        // Kaynağın `%d`'si cihaz yerel ayarıyla yerel rakam gelebilir; Batı seçiminde 0-9 olur.
        assertEquals("5 dk önce", rakamlariYerellestir("۵ dk önce", '0'))
        assertEquals("٥ د", rakamlariYerellestir("۵ د", RakamKarari.sifir("arab")))
        assertEquals("Fajr 05:42", rakamlariYerellestir("Fajr 05:42", '0'))
    }
}
