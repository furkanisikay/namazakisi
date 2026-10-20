package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Telefon ↔ TV eşleştirme sözleşmesi. Jest `src/core/tv/__tests__/tvEsleme.test.ts` aynı
 * fikstürü telefon ikiziyle doğrular → iki dil tek dosyaya kilitli.
 */
class EslemeTest {
    private val f: JSONObject by lazy {
        val akis = javaClass.classLoader!!.getResourceAsStream("esleme-ornekleri.json")
        JSONObject(akis.bufferedReader(Charsets.UTF_8).readText())
    }

    @Test
    fun kodlarTelefonlaAyni() {
        val dizi = f.getJSONArray("kodlar")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val ad = o.getString("ad")
            assertEquals(ad, o.getString("kod"), EslemeKodu.kodla(o.getDouble("lat"), o.getDouble("lng")))
            val c = EslemeKodu.coz(o.getString("kod"))!!
            assertEquals(ad, o.getDouble("cozulenLat"), c.first, 1e-9)
            assertEquals(ad, o.getDouble("cozulenLng"), c.second, 1e-9)
        }
    }

    @Test
    fun bolgeDisiKodlanmaz() {
        val dizi = f.getJSONArray("bolgeDisi")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            assertNull(o.getString("ad"), EslemeKodu.kodla(o.getDouble("lat"), o.getDouble("lng")))
        }
    }

    @Test
    fun gecersizKodlarReddedilir() {
        val dizi = f.getJSONArray("gecersizKodlar")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            assertNull(o.getString("neden"), EslemeKodu.coz(o.getString("kod")))
        }
    }

    @Test
    fun herTekHaneHatasiYakalanir() {
        val kod = EslemeKodu.kodla(41.0082, 28.9784)!!
        for (i in kod.indices) for (r in '0'..'9') {
            if (r == kod[i]) continue
            val bozuk = kod.substring(0, i) + r + kod.substring(i + 1)
            assertNotEquals(bozuk, 0, EslemeKodu.dammAraDurumu(bozuk))
        }
    }

    @Test
    fun koddanGelenAdEnYakinIldir() {
        val iller = listOf(Il("34", "İstanbul", 41.0082, 28.9784), Il("42", "Konya", 37.8746, 32.4932))
        val (lat, lng) = EslemeKodu.coz("1684892")!!
        assertEquals("İstanbul", EslemeKodu.konumAdi(iller, lat, lng))
        val (blat, blng) = EslemeKodu.coz("2603341")!!
        assertEquals(EslemeKodu.GENEL_AD, EslemeKodu.konumAdi(iller, blat, blng))
    }

    @Test
    fun qrMetniTelefonunCozdugeBicimde() {
        val ilk = f.getJSONArray("qrGecerli").getJSONObject(0)
        assertEquals(
            ilk.getString("metin"),
            EslemeProtokolu.qrMetni(ilk.getString("adres"), ilk.getInt("port"), ilk.getString("anahtar")),
        )
        assertEquals("0001ff7f80aa10fe", EslemeProtokolu.anahtarOlustur(
            byteArrayOf(0, 1, -1, 127, -128, -86, 16, -2),
        ))
    }

    @Test
    fun istekDogrulamasi() {
        val anahtar = f.getString("istekAnahtari")
        val gecerli = f.getJSONArray("istekGecerli")
        for (i in 0 until gecerli.length()) {
            val o = gecerli.getJSONObject(i)
            val s = EslemeProtokolu.govdeyiDogrula(o.getString("govde"), anahtar)
            assertEquals(EslemeProtokolu.Sonuc.Kabul(o.getString("ad"), o.getDouble("lat"), o.getDouble("lng")), s)
        }
        val gecersiz = f.getJSONArray("istekGecersiz")
        for (i in 0 until gecersiz.length()) {
            val o = gecersiz.getJSONObject(i)
            assertEquals(EslemeProtokolu.Sonuc.Red(o.getString("hata")), EslemeProtokolu.govdeyiDogrula(o.getString("govde"), anahtar))
        }
    }

    @Test
    fun adAzamiUzunluk() {
        assertEquals(60, EslemeProtokolu.adiTemizle("İ".repeat(80)).length)
    }

    @Test
    fun baslikYalnizPostEsleKabulEder() {
        assertEquals(42, EslemeProtokolu.basligiCoz("POST /esle HTTP/1.1\r\nHost: x\r\ncontent-length: 42"))
        assertNull(EslemeProtokolu.basligiCoz("GET /esle HTTP/1.1\r\nContent-Length: 42"))
        assertNull(EslemeProtokolu.basligiCoz("POST /baska HTTP/1.1\r\nContent-Length: 42"))
        assertNull(EslemeProtokolu.basligiCoz("POST /esle HTTP/1.1\r\nHost: x"))
        assertNull(EslemeProtokolu.basligiCoz("POST /esle HTTP/1.1\r\nContent-Length: 99999"))
    }

    @Test
    fun yanitBicimi() {
        val y = EslemeProtokolu.yanit(EslemeProtokolu.Sonuc.Kabul("a", 1.0, 1.0))
        assertTrue(y.startsWith("HTTP/1.1 200 OK\r\n"))
        assertTrue(y.endsWith("\r\n\r\n{\"ok\":true}"))
        assertTrue(EslemeProtokolu.yanit(EslemeProtokolu.Sonuc.Red("anahtar")).startsWith("HTTP/1.1 403"))
    }
}
