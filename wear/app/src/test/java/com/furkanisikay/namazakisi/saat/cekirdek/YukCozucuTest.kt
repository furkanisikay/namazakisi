package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Sözleşme nöbetçisi: JS tarafı (`src/core/wear/__tests__/wearYuku.test.ts`) AYNI
 * `ornek-yuk.json` dosyasını doğrular. Biri değişip diğeri değişmezse bir taraf kırılır.
 */
class YukCozucuTest {
    private fun ornek(): String =
        javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()

    @Test
    fun ortakOrnekDosyaCozulur() {
        val s = YukCozucu.coz(ornek())
        assertTrue(s is CozumSonucu.Basarili)
        val yuk = (s as CozumSonucu.Basarili).yuk
        assertEquals(DESTEKLENEN_YUK_SURUMU, yuk.surum)
        assertEquals("Fatih, İstanbul", yuk.konumAdi)
        assertEquals(Kerahat(20, 5, 20), yuk.kerahat)
        assertEquals(3, yuk.gunler.size)
        assertEquals(setOf("imsak"), yuk.gunler[1].kilinan)
        assertEquals(VAKITLER.toSet(), yuk.gunler[0].vakitler.keys)
    }

    @Test
    fun dahaYeniSurumEskiVeriyiKorumakIcinAyriBildirilir() {
        val json = ornek().replace("\"surum\": 1", "\"surum\": 2")
        assertEquals(CozumSonucu.SurumYeni(2), YukCozucu.coz(json))
    }

    @Test
    fun gunesKilinmisOlamaz() {
        val json = ornek().replace("\"kilinan\": [\n        \"imsak\"\n      ]", "\"kilinan\": [\"gunes\"]")
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(json))
    }

    @Test
    fun bozukGirdiCokmez() {
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(null))
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz("{bozuk"))
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz("""{"surum":1,"konumAdi":"x","kerahatDk":{"suruk":1,"istiva":1,"gurub":1},"gunler":[]}"""))
    }
}
