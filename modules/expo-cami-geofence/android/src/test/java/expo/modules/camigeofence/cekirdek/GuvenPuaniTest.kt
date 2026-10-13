package expo.modules.camigeofence.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Sözleşme nöbetçisi: JS (`src/core/cami/__tests__/guvenPuani.test.ts`) AYNI
 * `guven-puani-tablosu.json`'u doğrular. Karar native'de verilir; senaryolar elle
 * yazılmış beklenenlerdir (önünden geçme, trafikte durma, kafe, vakit dışı, cuma, ezan).
 */
class GuvenPuaniTest {
    private val tablo = JSONObject(
        String(javaClass.classLoader!!.getResource("guven-puani-tablosu.json")!!.readBytes(), Charsets.UTF_8)
    )

    @Test
    fun senaryoTablosu() {
        val vakalar = tablo.getJSONArray("senaryolar")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            val ad = v.getString("ad")
            val k = v.getJSONObject("konum")
            val adaylar = (0 until v.getJSONArray("adaylar").length()).mapNotNull { IzlenenYer.coz(v.getJSONArray("adaylar").getJSONObject(it)) }
            val haric = (0 until v.getJSONArray("haric").length()).map { v.getJSONArray("haric").getString(it) }.toSet()
            val r = GuvenPuani.acilisKarari(
                v.getLong("simdiMs"),
                v.getBoolean("vakitKapisiAcik"),
                KapiPenceresi.listeCoz(v.getJSONArray("pencereler")),
                OlculenKonum(k.getDouble("lat"), k.getDouble("lng"), k.getDouble("dogrulukM")),
                if (v.isNull("hizMps")) null else v.getDouble("hizMps"),
                adaylar,
                haric,
                v.getInt("beklemeDk"),
                v.getString("acilisBicimi"),
            )
            val b = v.getJSONObject("beklenen")
            assertEquals(ad, b.getString("sonuc"), r.karar.sonuc)
            assertEquals(ad, b.getString("eylem"), r.eylem)
            if (b.getString("sonuc") == "camide") {
                val g = r.guven!!
                assertEquals(ad, b.getString("zaman"), g.zaman)
                assertEquals(ad, b.getString("yer"), g.yer)
                assertEquals(ad, b.getString("hareket"), g.hareket)
                assertEquals(ad, b.getInt("puan"), g.puan)
                assertEquals(ad, b.getString("guvenKarari"), g.karar)
                assertEquals(ad, if (b.isNull("tavan")) null else b.getString("tavan"), g.tavan)
            } else {
                assertNull(ad, r.guven)
            }
        }
    }

    @Test
    fun hareketTavaniHerPuandaGecerli() {
        val r = GuvenPuani.puanla("cuma", "poligonIci", "hareketli", 1.0, 20)
        assertEquals("sor", r.karar)
        assertEquals("hareketli", r.tavan)
    }

    @Test
    fun acilisBicimi() {
        assertEquals("otomatik", GuvenPuani.bicimiUygula("sor", "otomatik"))
        assertEquals("hicbir", GuvenPuani.bicimiUygula("hicbir", "otomatik"))
        assertEquals("sor", GuvenPuani.bicimiUygula("otomatik", "sorarak"))
        assertEquals("sor", GuvenPuani.bicimiUygula("sor", "akilli"))
    }
}
