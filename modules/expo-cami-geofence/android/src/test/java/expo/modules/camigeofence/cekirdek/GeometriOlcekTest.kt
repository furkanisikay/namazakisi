package expo.modules.camigeofence.cekirdek

import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Sözleşme nöbetçisi: JS (`src/core/cami/__tests__/sinirOlcegi.test.ts`) AYNI
 * `poligon-olcek-ornekleri.json`'u doğrular (beklenenler bağımsız Python ile üretildi).
 */
class GeometriOlcekTest {
    private val fikstur = JSONObject(
        String(javaClass.classLoader!!.getResource("poligon-olcek-ornekleri.json")!!.readBytes(), Charsets.UTF_8)
    )

    private fun poligon(a: JSONArray): List<DoubleArray> =
        (0 until a.length()).map { doubleArrayOf(a.getJSONArray(it).getDouble(0), a.getJSONArray(it).getDouble(1)) }

    @Test
    fun poligonOlceklemeFiksturu() {
        val vakalar = fikstur.getJSONArray("poligonlar")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            val sonuc = Geometri.poligonuOlcekle(poligon(v.getJSONArray("poligon")), v.getDouble("lat"), v.getDouble("lng"), v.getDouble("k"))
            val beklenen = poligon(v.getJSONArray("beklenen"))
            assertEquals(v.getString("ad"), beklenen.size, sonuc.size)
            for (j in beklenen.indices) {
                assertEquals(v.getString("ad"), beklenen[j][0], sonuc[j][0], 1e-7)
                assertEquals(v.getString("ad"), beklenen[j][1], sonuc[j][1], 1e-7)
            }
        }
    }

    @Test
    fun poligonOnarimFiksturu() {
        val vakalar = fikstur.getJSONArray("onarim")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            val pol = poligon(v.getJSONArray("poligon"))
            assertEquals(v.getString("ad"), v.getBoolean("kendiniKeser"), Geometri.kendiniKesiyorMu(pol))
            val sonuc = Geometri.poligonuOnar(pol)
            val beklenen = poligon(v.getJSONArray("beklenen"))
            assertEquals(v.getString("ad"), beklenen.size, sonuc.size)
            for (j in beklenen.indices) {
                assertEquals(v.getString("ad"), beklenen[j][0], sonuc[j][0], 1e-9)
                assertEquals(v.getString("ad"), beklenen[j][1], sonuc[j][1], 1e-9)
            }
        }
    }

    @Test
    fun etkinOlcekFiksturu() {
        val vakalar = fikstur.getJSONArray("etkinOlcek")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            val olcek = if (v.isNull("olcek")) null else v.getDouble("olcek")
            assertEquals("vaka $i", v.getDouble("beklenen"), Geometri.etkinOlcek(olcek, v.getDouble("yaricapM")), 1e-9)
        }
    }

    @Test
    fun olcekDaireyiEzmezVeEskiKayitDegismez() {
        val kare = poligon(fikstur.getJSONArray("poligonlar").getJSONObject(0).getJSONArray("poligon"))
        val yer = IzlenenYer("osm:w1", "Kare", 41.011, 28.972, 29.0, kare, null, "osm", false)
        assertEquals(kare, Geometri.etkinPoligon(yer))
        assertEquals(29.0, Geometri.alanYaricapiM(yer.ozelAlanM, yer.yaricapM, yer.ozelOlcek), 0.0)
        assertEquals(58.0, Geometri.alanYaricapiM(null, 29.0, 2.0), 1e-9)
        assertNull(Geometri.etkinPoligon(yer.copy(ozelAlanM = 40.0, ozelOlcek = 2.0)))
        assertTrue(Geometri.alanDisiUzaklikM(yer, 41.0113148, 28.972) > 0)
        assertEquals(0.0, Geometri.alanDisiUzaklikM(yer.copy(ozelOlcek = 2.0), 41.0113148, 28.972), 0.0)
    }

    @Test
    fun izlenenYerJsonOlcegiTasir() {
        val yer = IzlenenYer("osm:w1", "Kare", 41.011, 28.972, 29.0, null, null, "osm", false, ozelOlcek = 1.5)
        assertEquals(1.5, IzlenenYer.coz(yer.json())!!.ozelOlcek!!, 0.0)
        val eski = IzlenenYer("osm:w1", "Kare", 41.011, 28.972, 29.0, null, null, "osm", false)
        assertTrue(!eski.json().has("ozelOlcek"))
        assertNull(IzlenenYer.coz(eski.json())!!.ozelOlcek)
    }

    @Test
    fun izlemeImzasiOlceksizYerdeDegismez() {
        val eski = IzlenenYer("osm:w1", "Kare", 41.011, 28.972, 29.0, null, null, "osm", false)
        assertEquals(listOf("osm:w1|100"), IzlemeKarari.imza(listOf(eski)))
        assertEquals(listOf("osm:w1|100|o1.5"), IzlemeKarari.imza(listOf(eski.copy(ozelOlcek = 1.5))))
    }

    @Test
    fun izlenecekleriSecOlcegiYalnizPoligondaTasir() {
        val kare = poligon(fikstur.getJSONArray("poligonlar").getJSONObject(0).getJSONArray("poligon"))
        val kayitlar = listOf(
            CamiKaydi("osm:w1", "Kare", 41.011, 28.972, 29.0, kare),
            CamiKaydi("osm:n2", "Nokta", 41.012, 28.973, 0.0, null),
        )
        val yerler = mapOf(
            "osm:w1" to YerKaydi("normal", null, null, null, null, false, 2.0),
            "osm:n2" to YerKaydi("normal", null, null, null, null, false, 2.0),
        )
        val (izlenen, _) = CamiKarar.izlenecekleriSec(41.011, 28.972, kayitlar, yerler)
        assertEquals(2.0, izlenen.first { it.id == "osm:w1" }.ozelOlcek!!, 0.0)
        assertNull(izlenen.first { it.id == "osm:n2" }.ozelOlcek)
    }
}
