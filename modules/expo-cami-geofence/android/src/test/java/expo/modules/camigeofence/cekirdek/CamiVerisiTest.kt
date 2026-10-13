package expo.modules.camigeofence.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Sözleşme nöbetçisi: JS çözücüsü (`src/core/cami/__tests__/camiVerisi.test.ts`)
 * AYNI fikstürü (`ornek-camiler.bin`, SENTETİK) aynı beklenen değerlerle doğrular.
 */
class CamiVerisiTest {
    private fun kaynak(ad: String): ByteArray = javaClass.classLoader!!.getResource(ad)!!.readBytes()
    private val beklenen = JSONObject(String(kaynak("ornek-camiler-beklenen.json"), Charsets.UTF_8))

    @Test
    fun kayitlarBirebirCozulur() {
        val v = CamiVerisi.coz(kaynak("ornek-camiler.bin"))
        assertNotNull(v)
        assertEquals(beklenen.getInt("kayitSayisi"), v!!.kayitSayisi)
        assertEquals(beklenen.getLong("veriZamani"), v.veriZamani)
        val dizi = beklenen.getJSONArray("kayitlar")
        for (i in 0 until dizi.length()) {
            val b = dizi.getJSONObject(i)
            val k = v.kayit(i)
            assertEquals(b.getString("id"), k.id)
            assertEquals(b.getString("ad"), k.ad)
            assertEquals(b.getDouble("lat"), k.lat, 1e-7)
            assertEquals(b.getDouble("lng"), k.lng, 1e-7)
            assertEquals(b.getDouble("yaricapM"), k.yaricapM, 0.0)
            val kose = b.getInt("koseSayisi")
            if (kose == 0) assertNull(k.poligon) else assertEquals(kose, k.poligon!!.size)
        }
    }

    @Test
    fun enYakinKabaKuvvetleAyni() {
        val v = CamiVerisi.coz(kaynak("ornek-camiler.bin"))!!
        val sorgular = beklenen.getJSONArray("sorgular")
        for (i in 0 until sorgular.length()) {
            val s = sorgular.getJSONObject(i)
            val sonuc = v.enYakinlar(s.getDouble("lat"), s.getDouble("lng"), s.getInt("k"), s.getDouble("azamiMesafeM"))
            val b = s.getJSONArray("sonuc")
            assertEquals("sorgu $i", b.length(), sonuc.size)
            for (j in 0 until b.length()) {
                assertEquals(b.getJSONObject(j).getString("id"), sonuc[j].kayit.id)
                assertEquals(b.getJSONObject(j).getDouble("mesafeM"), sonuc[j].mesafeM, 0.6)
            }
        }
    }

    @Test
    fun bozukVeriNullDoner() {
        val saglam = kaynak("ornek-camiler.bin")
        assertNull(CamiVerisi.coz(ByteArray(0)))
        assertNull(CamiVerisi.coz(saglam.copyOf(200)))
        assertNull(CamiVerisi.coz(saglam.copyOf().also { it[0] = 0x58 }))
        assertNull(CamiVerisi.coz(saglam.copyOf().also { it[4] = 9 }))
        assertNull(CamiVerisi.coz(saglam.copyOf().also { it[it.size - 3] = (it[it.size - 3].toInt() xor 0xFF).toByte() }))
        assertNull(CamiVerisi.coz(saglam.copyOf().also { it[48] = (it[48].toInt() xor 1).toByte() }))
    }
}
