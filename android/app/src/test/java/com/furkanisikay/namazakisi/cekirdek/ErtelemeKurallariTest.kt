package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `ErtelemeKurallari` — JS `core/muhafiz/erteleme.ts` ile AYNI örnek dosyayı
 * doğrular (`src/test/resources/erteleme-ornekleri.json`). Android'de "Ertele"
 * native işlenir; ikiz ayrışırsa düğme kümesi (JS) ile basışın sonucu (Kotlin)
 * farklı kurala göre çalışır.
 */
class ErtelemeKurallariTest {

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("erteleme-ornekleri.json")) { "ornek dosya yok" }.readText()
    )

    private fun JSONObject.uzunVeyaNull(ad: String): Long? = if (isNull(ad)) null else getLong(ad)

    @Test
    fun secenekVeKategoriJsIleAyni() {
        val d = ornek.getJSONArray("secenekler")
        assertTrue(d.length() >= 5)
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            val ad = o.getString("ad")
            val beklenen = o.getJSONArray("beklenen").let { b -> (0 until b.length()).map { b.getLong(it) } }
            assertEquals(ad, beklenen, ErtelemeKurallari.secenekler(o.getLong("tetikMs"), o.getLong("sinirMs")))
            assertEquals(ad, o.getString("kategori"), ErtelemeKurallari.kategori(o.getLong("tetikMs"), o.getLong("sinirMs")))
        }
    }

    @Test
    fun hedefJsIleAyni() {
        val d = ornek.getJSONArray("hedef")
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(
                o.getString("ad"),
                o.uzunVeyaNull("beklenen"),
                ErtelemeKurallari.hedefHesapla(o.getLong("simdiMs"), o.getLong("sureDk"), o.getLong("sinirMs")),
            )
        }
    }

    @Test
    fun eylemlerJsIleAyni() {
        val d = ornek.getJSONArray("eylemler")
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(o.getString("eylem"), o.uzunVeyaNull("sure"), ErtelemeKurallari.eylemSuresiDk(o.getString("eylem")))
        }
    }

    @Test
    fun kimliklerJsIleAyni() {
        val d = ornek.getJSONArray("kimlikler")
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            val k = o.getString("kimlik")
            assertEquals(k, o.getBoolean("planMi"), ErtelemeKurallari.planKimligiMi(k))
            assertEquals(k, o.uzunVeyaNull("kalanDk"), ErtelemeKurallari.kimliktenKalanDk(k))
            assertEquals(k, o.getBoolean("ertelemeMi"), ErtelemeKurallari.ertelemeKimligiMi(k))
        }
        val e = ornek.getJSONArray("ertelemeKimligi").getJSONObject(0)
        assertEquals(e.getString("kimlik"), ErtelemeKurallari.kimlik(e.getString("tarih"), e.getString("vakit")))
    }

    @Test
    fun ertelemeKimligiKildimOnekiyleEslesir() {
        // Kıldım ertelenmişi de iptal etmeli (aynı vakit öneki).
        val v = BildirimKildimKurallari.Vakit("2026-10-13", "ikindi")
        assertTrue(BildirimKildimKurallari.buVakteAitMi(ErtelemeKurallari.kimlik(v.tarih, v.vakit), v))
        assertEquals(v, BildirimKildimKurallari.vakitCoz(ErtelemeKurallari.kimlik(v.tarih, v.vakit)))
    }

    @Test
    fun sureMetniVeBaslikJsIleAyni() {
        val s = ornek.getJSONArray("sureMetni")
        for (i in 0 until s.length()) {
            val o = s.getJSONObject(i)
            assertEquals(o.getString("metin"), ErtelemeKurallari.sureMetni(o.getLong("dk")))
        }
        val b = ornek.getJSONArray("baslik")
        for (i in 0 until b.length()) {
            val o = b.getJSONObject(i)
            val sonuc = ErtelemeKurallari.baslik(o.getString("sablon"), o.getLong("cikisMs"), o.getLong("hedefMs"))
            if (o.isNull("beklenen")) assertNull(o.getString("ad"), sonuc)
            else assertEquals(o.getString("ad"), o.getString("beklenen"), sonuc)
        }
    }

    @Test
    fun susturmaJsIleAyni() {
        val d = ornek.getJSONArray("susturma")
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(o.getBoolean("beklenen"), ErtelemeKurallari.susturulurMu(o.getLong("tetikMs"), o.getLong("hedefMs")))
        }
    }
}
