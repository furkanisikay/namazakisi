package expo.modules.countdownnotification.cekirdek

import expo.modules.countdownnotification.cekirdek.CanliGuncellemeKurallari.Bolum
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CanliGuncellemeKurallariTest {

    private val k = CanliGuncellemeKurallari

    private fun fikstur(): JSONObject {
        val akis = javaClass.classLoader!!.getResourceAsStream("kisa-metin-ornekleri.json")!!
        return JSONObject(akis.bufferedReader(Charsets.UTF_8).readText())
    }

    @Test
    fun kisaMetinOrtakFiksturuKabulEder() {
        val dizi = fikstur().getJSONArray("kisaMetin")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            assertEquals("kalanMs=${o.getLong("kalanMs")}", o.getString("metin"), k.kisaMetin(o.getLong("kalanMs")))
        }
    }

    @Test
    fun sonrakiTazelemeOrtakFiksturuKabulEder() {
        val dizi = fikstur().getJSONArray("sonrakiTazeleme")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val beklenen: Long? = if (o.isNull("anMs")) null else o.getLong("anMs")
            assertEquals(beklenen, k.sonrakiTazelemeMs(o.getLong("simdiMs"), o.getLong("hedefMs")))
        }
    }

    @Test
    fun tazelemeAninda_kisaMetinGercektenDegisir() {
        // Nöbetçi: tazeleme anı kısa metnin değiştiği AN olmalı — bir ms önce eski, o an yeni.
        val hedef = 30 * 60_000L + 12_345L
        val an = k.sonrakiTazelemeMs(0L, hedef)!!
        assertEquals("31 dk", k.kisaMetin(hedef - (an - 1)))
        assertEquals("30 dk", k.kisaMetin(hedef - an))
    }

    @Test
    fun seriOneCikarilmaz() {
        assertTrue(k.oneCikarilabilirMi("vakit"))
        assertTrue(k.oneCikarilabilirMi("iftar"))
        assertTrue(k.oneCikarilabilirMi("sahur"))
        assertFalse(k.oneCikarilabilirMi("seri"))
        assertFalse(k.oneCikarilabilirMi(""))
    }

    @Test
    fun ilerlemeKistirilir() {
        val b = listOf(Bolum(30, false), Bolum(15, true))
        assertEquals(0, k.ilerleme(0L, 60_000L, b)) // başlangıçtan önce
        assertEquals(10, k.ilerleme(10 * 60_000L + 59_000L, 0L, b))
        assertEquals(45, k.ilerleme(999 * 60_000L, 0L, b))
        assertEquals(0, k.ilerleme(10 * 60_000L, 0L, emptyList()))
    }

    @Test
    fun ekYukBozuksaGuvenliVarsayilan() {
        val bos = k.ekYukuCoz("{bozuk")
        assertEquals(0L, bos.baslangicMs)
        assertTrue(bos.bolumler.isEmpty())
        assertNull(bos.kildimTarih)
        assertFalse(bos.hedefteKaybol)
        assertTrue(k.ekYukuCoz(null).bolumler.isEmpty())
    }

    @Test
    fun ekYukGecerliCozulur() {
        val ek = k.ekYukuCoz(
            """{"baslangicMs":1000,"hedefteKaybol":true,"bolumler":[{"uzunlukDk":30,"vurgulu":false},{"uzunlukDk":15,"vurgulu":true}],"kildim":{"tarih":"2026-10-13","vakit":"ikindi"}}"""
        )
        assertEquals(1000L, ek.baslangicMs)
        assertTrue(ek.hedefteKaybol)
        assertEquals(listOf(Bolum(30, false), Bolum(15, true)), ek.bolumler)
        assertEquals("2026-10-13", ek.kildimTarih)
        assertEquals("ikindi", ek.kildimVakit)
    }

    @Test
    fun gecersizBolumVeKildimAtilir() {
        val ek = k.ekYukuCoz(
            """{"bolumler":[{"uzunlukDk":0,"vurgulu":false}],"kildim":{"tarih":"13.10.2026","vakit":"ikindi"}}"""
        )
        assertTrue(ek.bolumler.isEmpty())
        assertNull(ek.kildimTarih)
        assertNull(ek.kildimVakit)
        // 'gunes' kuyruğa girmez → eylem de eklenmez.
        assertNull(k.ekYukuCoz("""{"kildim":{"tarih":"2026-10-13","vakit":"gunes"}}""").kildimVakit)
    }

    @Test
    fun durumGidisDonus() {
        val d = CanliGuncellemeKurallari.Durum(
            id = "sayac_2026-10-13_ikindi", hedefMs = 123_456L, baslik = "İkindi Namazı", metin = "çıkmak üzere",
            kanalId = "vakit_sayac_v2", kucukIkon = "", tema = "vakit", hedefteKaybol = false,
            baslangicMs = 100L, bolumler = listOf(Bolum(5, true)), kildimTarih = "2026-10-13", kildimVakit = "ikindi",
        )
        assertEquals(d, k.durumuJsondanOku(k.durumuJsonaCevir(d)))
        assertNull(k.durumuJsondanOku("{}"))
        assertNull(k.durumuJsondanOku("bozuk"))
        assertNull(k.durumuJsondanOku(null))
    }
}
