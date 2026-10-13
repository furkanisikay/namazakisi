package expo.modules.camigeofence.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Sözleşme nöbetçisi: JS (`src/core/cami/__tests__/camiKarar.test.ts`) AYNI
 * `cami-karar-tablosu.json`'u doğrular. Karar burada (native) verilir; JS ikizi
 * yalnız ekran/önizleme içindir — ikisi ayrışırsa bir taraf kırılır.
 */
class CamiKararTest {
    private val tablo = JSONObject(
        String(javaClass.classLoader!!.getResource("cami-karar-tablosu.json")!!.readBytes(), Charsets.UTF_8)
    )

    private fun nullable(o: JSONObject, ad: String): Long? = if (o.isNull(ad)) null else o.getLong(ad)

    @Test
    fun kararTablosu() {
        val vakalar = tablo.getJSONArray("kararlar")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            val konum = v.optJSONObject("konum")?.let { OlculenKonum(it.getDouble("lat"), it.getDouble("lng"), it.getDouble("dogrulukM")) }
            val adaylar = (0 until v.getJSONArray("adaylar").length()).mapNotNull { IzlenenYer.coz(v.getJSONArray("adaylar").getJSONObject(it)) }
            val haric = (0 until v.getJSONArray("haric").length()).map { v.getJSONArray("haric").getString(it) }.toSet()
            val sonuc = CamiKarar.karar(
                v.getLong("simdiMs"),
                v.getBoolean("vakitKapisiAcik"),
                KapiPenceresi.listeCoz(v.getJSONArray("pencereler")),
                konum,
                adaylar,
                haric,
            )
            val b = v.getJSONObject("beklenen")
            val ad = v.getString("ad")
            assertEquals(ad, b.getString("sonuc"), sonuc.sonuc)
            assertEquals(ad, if (b.has("yerId")) b.getString("yerId") else null, sonuc.yerId)
            assertEquals(ad, if (b.has("vakit")) b.getString("vakit") else null, sonuc.vakit)
            assertEquals(ad, if (b.has("tarih")) b.getString("tarih") else null, sonuc.tarih)
            assertEquals(ad, if (b.has("cuma")) b.getBoolean("cuma") else null, sonuc.cuma)
            assertEquals(ad, if (b.has("mesafeM")) b.getLong("mesafeM") else null, sonuc.mesafeM)
        }
    }

    @Test
    fun yenilemeTablosu() {
        val vakalar = tablo.getJSONArray("yenileme")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            assertEquals(
                v.getString("ad"),
                v.getString("beklenen"),
                CamiKarar.yenilemeKarari(v.getLong("simdiMs"), nullable(v, "sonYenilemeMs"), nullable(v, "konumZamaniMs")),
            )
        }
    }

    @Test
    fun yaricapTablosu() {
        val vakalar = tablo.getJSONArray("yaricap")
        for (i in 0 until vakalar.length()) {
            val v = vakalar.getJSONObject(i)
            val k = if (v.isNull("kinciMesafeM")) null else v.getDouble("kinciMesafeM")
            assertEquals(v.getDouble("beklenen"), CamiKarar.yenilemeYaricapiM(k), 0.0)
        }
    }

    @Test
    fun kapiPencereleriJsIleAyniSekildeOkunur() {
        // Pencereleri JS hesaplar ve native'e gönderir; Kotlin yalnız okur ve sorgular.
        val pencereler = KapiPenceresi.listeCoz(tablo.getJSONObject("kapi").getJSONArray("beklenen"))
        assertEquals(10, pencereler.size)
        val cuma = pencereler.first { it.cuma }
        assertEquals("ogle", cuma.vakit)
        assertEquals(180 * CamiSabitleri.DAKIKA_MS, cuma.son - cuma.bas)
        assertEquals(cuma, CamiKarar.kapiPenceresiniBul(cuma.bas + 1, pencereler))
    }

    @Test
    fun ustSure() {
        assertEquals(90 * CamiSabitleri.DAKIKA_MS, CamiKarar.camideBitisMs(0, false))
        assertEquals(150 * CamiSabitleri.DAKIKA_MS, CamiKarar.camideBitisMs(0, true))
    }

    @Test
    fun secimHaricAtlarFavoriEkler() {
        val osm = listOf(
            CamiKaydi("osm:n1", "1", 41.001, 29.0, 0.0, null),
            CamiKaydi("osm:n2", "2", 41.002, 29.0, 0.0, null),
            CamiKaydi("osm:n3", "3", 41.003, 29.0, 0.0, null),
        )
        val yerler = mapOf(
            "osm:n1" to YerKaydi("haric", null, null, null, null, false),
            "osm:w9" to YerKaydi("favori", null, "Uzak", 39.9, 32.8, false),
        )
        val (izlenen, kinci) = CamiKarar.izlenecekleriSec(41.0, 29.0, osm, yerler, 2)
        assertEquals(listOf("osm:n2", "osm:n3", "osm:w9"), izlenen.map { it.id })
        assertEquals(333.6, kinci!!, 0.1)
    }
}
