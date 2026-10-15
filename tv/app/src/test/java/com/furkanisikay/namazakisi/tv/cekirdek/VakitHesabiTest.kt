package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

/**
 * Telefon ↔ TV hesap paritesi. Fikstür telefonun adhan JS yolundan üretilir
 * (`scripts/tv/tv-verisi-uret.js`) ve jest `TvVakitParitesi.test.ts` aynı dosyayı
 * telefonun servisiyle doğrular → iki taraf aynı dosyaya kilitli.
 */
class VakitHesabiTest {
    private fun fikstur(): JSONObject {
        val akis = javaClass.classLoader!!.getResourceAsStream("vakit-fiksturu.json")
        return JSONObject(akis.bufferedReader(Charsets.UTF_8).readText())
    }

    @Test
    fun telefonlaAyniVakitler() {
        val ornekler = fikstur().getJSONArray("ornekler")
        assertTrue(ornekler.length() >= 30)
        for (i in 0 until ornekler.length()) {
            val o = ornekler.getJSONObject(i)
            val tarih = LocalDate.parse(o.getString("tarih"))
            val v = VakitHesabi.hesapla(o.getDouble("lat"), o.getDouble("lng"), tarih)
            val beklenen = o.getJSONObject("vakitler")
            for (vakit in Vakit.entries) {
                assertEquals(
                    "${o.getString("il")} ${o.getString("tarih")} ${vakit.kod}",
                    beklenen.getLong(vakit.kod),
                    v.saat(vakit),
                )
            }
        }
    }

    @Test
    fun kerahatSabitleriVePencereleriTelefonlaAyni() {
        val f = fikstur()
        val k = f.getJSONObject("kerahat")
        assertEquals(k.getInt("surukDk"), Kerahat.SURUK_DK)
        assertEquals(k.getInt("istivaDk"), Kerahat.ISTIVA_DK)
        assertEquals(k.getInt("gurubDk"), Kerahat.GURUB_DK)

        val ornekler = f.getJSONArray("ornekler")
        for (i in 0 until ornekler.length()) {
            val o = ornekler.getJSONObject(i)
            val v = VakitHesabi.hesapla(o.getDouble("lat"), o.getDouble("lng"), LocalDate.parse(o.getString("tarih")))
            val beklenen = o.getJSONArray("kerahat")
            val pencereler = Kerahat.pencereler(v)
            assertEquals(beklenen.length(), pencereler.size)
            for (j in pencereler.indices) {
                val b = beklenen.getJSONObject(j)
                assertEquals(b.getString("tur"), pencereler[j].tur.kod)
                assertEquals(b.getLong("baslangic"), pencereler[j].baslangic)
                assertEquals(b.getLong("bitis"), pencereler[j].bitis)
            }
        }
    }

    @Test
    fun ilListesi81IlVeIstanbulDogru() {
        val akis = javaClass.classLoader!!.getResourceAsStream("iller.json")
        val iller = IlListesi.coz(akis.bufferedReader(Charsets.UTF_8).readText())
        assertEquals(81, iller.size)
        assertEquals(81, iller.map { it.plaka }.toSet().size)
        val istanbul = IlListesi.bul(iller, "34")!!
        assertEquals("İstanbul", istanbul.ad)
        assertEquals(null, IlListesi.bul(iller, null))
        assertEquals(null, IlListesi.bul(iller, "99"))
    }
}
