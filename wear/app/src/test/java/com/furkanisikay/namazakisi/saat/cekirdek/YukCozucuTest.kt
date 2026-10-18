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
        // Adım sırası (issue #274) — eklemeli opsiyonel alan.
        assertEquals(listOf(0, 3), yuk.plan.map { it.adim })
        // Kıble konumu (saat W2) — eklemeli opsiyonel alan, 1 ondalık.
        assertEquals(Konum(41.0, 29.0), yuk.konum)
    }

    @Test
    fun konumOpsiyonelVeGevsekDogrulanir() {
        // Eski telefon: alan yok → yük geçerli, konum null.
        val eski = org.json.JSONObject(ornek())
        eski.remove("konum")
        assertEquals(null, (YukCozucu.coz(eski.toString()) as CozumSonucu.Basarili).yuk.konum)
        // Bozuk konum YÜKÜ düşürmez, yalnız kıble düşer (JS `wearKonumuCoz` ile aynı).
        val bozuklar = listOf<Any>(
            org.json.JSONObject("""{"lat":"41","lng":29}"""),
            org.json.JSONObject("""{"lat":91,"lng":29}"""),
            org.json.JSONObject("""{"lat":41,"lng":181}"""),
            org.json.JSONObject("""{"lat":0,"lng":0}"""),
            org.json.JSONObject("""{"lat":41}"""),
            "x",
            org.json.JSONObject.NULL,
        )
        for (bozuk in bozuklar) {
            val o = org.json.JSONObject(ornek())
            o.put("konum", bozuk)
            val s = YukCozucu.coz(o.toString())
            assertTrue("konum=$bozuk yükü düşürmemeli", s is CozumSonucu.Basarili)
            assertEquals("konum=$bozuk", null, (s as CozumSonucu.Basarili).yuk.konum)
        }
        assertEquals(Konum(-33.9, 151.2), YukCozucu.konumCoz(org.json.JSONObject("""{"lat":-33.9,"lng":151.2}""")))
    }

    @Test
    fun canliAlaniOpsiyonelVeKatiDogrulanir() {
        // Eklemeli opsiyonel alan (issue #282): yoksa null, sürüm değişmez.
        val o = org.json.JSONObject(ornek())
        o.remove("canli")
        assertEquals(null, (YukCozucu.coz(o.toString()) as CozumSonucu.Basarili).yuk.canli)
        // Varsa tam doğrulanır: tek bozuk dilim tüm yükü reddeder (JS ile aynı).
        val bozuk = org.json.JSONObject(ornek())
        bozuk.getJSONObject("canli").getJSONArray("pencereler").getJSONObject(1).put("vakit", "gunes")
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(bozuk.toString()))
        val tersSure = org.json.JSONObject(ornek())
        val p0 = tersSure.getJSONObject("canli").getJSONArray("pencereler").getJSONObject(0)
        p0.put("bitis", p0.getLong("bas"))
        assertEquals(CozumSonucu.Gecersiz, YukCozucu.coz(tersSure.toString()))
    }

    @Test
    fun adimSirasiOpsiyonelVeDogrulanir() {
        val eski = org.json.JSONObject(ornek())
        val dizi = eski.getJSONArray("muhafiz")
        for (i in 0 until dizi.length()) dizi.getJSONObject(i).remove("adim")
        val s = YukCozucu.coz(eski.toString())
        assertTrue("eski telefon yükü (adim yok) okunur", s is CozumSonucu.Basarili)
        assertEquals(listOf<Int?>(null, null), (s as CozumSonucu.Basarili).yuk.plan.map { it.adim })

        for (bozuk in listOf<Any>(6, -1, 1.5, "1")) {
            val o = org.json.JSONObject(ornek())
            o.getJSONArray("muhafiz").getJSONObject(0).put("adim", bozuk)
            assertEquals("adim=$bozuk", CozumSonucu.Gecersiz, YukCozucu.coz(o.toString()))
        }
    }

    @Test
    fun saatW3AlanlariOpsiyonelVeKatiDogrulanir() {
        val yuk = (YukCozucu.coz(ornek()) as CozumSonucu.Basarili).yuk
        // Anons (fikir 9): yalnız sesli adımda; diğer kayıtta yok.
        assertEquals(listOf(null, "İkindi vaktinin çıkmasına 3 dakika kaldı. Hemen namaza dur."), yuk.plan.map { it.anons })
        assertEquals(AnonsYerleri.OTOMATIK, yuk.anonsYeri)
        // Uyandırma (fikir 2): kronolojik, tür ayrımı.
        assertEquals(listOf("teheccud", "imsak"), yuk.uyandirma.map { it.tur })
        assertTrue(yuk.uyandirma[0].nafile && !yuk.uyandirma[1].nafile)

        // Eski telefon: üç alan da yok → yük geçerli, saat eski davranışta.
        val eski = org.json.JSONObject(ornek())
        eski.remove("uyandirma")
        eski.remove("anonsYeri")
        eski.getJSONArray("muhafiz").getJSONObject(1).remove("anons")
        val e = (YukCozucu.coz(eski.toString()) as CozumSonucu.Basarili).yuk
        assertEquals(emptyList<UyandirmaKaydi>(), e.uyandirma)
        assertEquals(null, e.anonsYeri)

        // Bozuk değerler TÜM yükü reddeder (JS ile aynı katılık).
        val bozuklar = listOf<(org.json.JSONObject) -> Unit>(
            { it.put("anonsYeri", "ikisi") },
            { it.getJSONArray("muhafiz").getJSONObject(0).put("anons", 5) },
            { it.getJSONArray("uyandirma").getJSONObject(0).put("tur", "kusluk") },
            { it.getJSONArray("uyandirma").getJSONObject(0).put("sonMs", 1L) },
            { it.getJSONArray("uyandirma").getJSONObject(1).put("tarih", "13.10.2026") },
            { it.put("uyandirma", "x") },
        )
        for ((i, boz) in bozuklar.withIndex()) {
            val o = org.json.JSONObject(ornek())
            boz(o)
            assertEquals("bozuk #$i", CozumSonucu.Gecersiz, YukCozucu.coz(o.toString()))
        }
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
