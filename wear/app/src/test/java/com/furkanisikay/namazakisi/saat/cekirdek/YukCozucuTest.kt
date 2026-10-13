package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Sözleşme nöbetçisi: JS tarafı (`src/core/wear/__tests__/wearYuku.test.ts`) AYNI
 * `ornek-yuk.json` dosyasını doğrular. Biri değişip diğeri değişmezse bir taraf kırılır.
 */
class YukCozucuTest {
    private fun ornek(ad: String = "ornek-yuk.json"): String =
        javaClass.classLoader!!.getResource(ad)!!.readText()

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
        // v2: hazır muhafız planı (issue #280)
        assertEquals(2, yuk.plan.size)
        val acil = yuk.plan[1]
        assertEquals("muhafiz_2026-10-12_vakit_ikindi_seviye_4_dk_3", acil.id)
        assertEquals("ikindi", acil.vakit)
        assertEquals(4, acil.seviye)
        assertEquals("🚨 3 dk · İKİNDİ VAKTİ ÇIKIYOR", acil.baslik)
        assertTrue(acil.acil && acil.titresim)
        assertTrue(yuk.plan[0].ms < acil.ms)
    }

    @Test
    fun v1YukuOkunmayaDevamEderPlaniBosSayilir() {
        val s = YukCozucu.coz(ornek("ornek-yuk-v1.json"))
        assertTrue(s is CozumSonucu.Basarili)
        val yuk = (s as CozumSonucu.Basarili).yuk
        assertEquals(1, yuk.surum)
        assertEquals(emptyList<PlanKaydi>(), yuk.plan)
        assertEquals(3, yuk.gunler.size)
    }

    @Test
    fun dahaYeniSurumEskiVeriyiKorumakIcinAyriBildirilir() {
        val json = ornek().replace("\"surum\": 2", "\"surum\": 3")
        assertEquals(CozumSonucu.SurumYeni(3), YukCozucu.coz(json))
    }

    @Test
    fun v2PlanAlaniZorunluVeKayitlarDogrulanir() {
        val o = org.json.JSONObject(ornek())
        o.remove("muhafiz")
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(o.toString()))

        val gunesli = org.json.JSONObject(ornek())
        gunesli.getJSONArray("muhafiz").getJSONObject(0).put("vakit", "gunes")
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(gunesli.toString()))

        val seviye = org.json.JSONObject(ornek())
        seviye.getJSONArray("muhafiz").getJSONObject(0).put("seviye", 5)
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(seviye.toString()))
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
