package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Sözleşme nöbetçisi (saat W3): saat `TelefonKomutuTest` AYNI fikstürü okur
 * (`wear/app/src/test/resources/saat-komut-ornekleri.json`; test çalışma dizini android/app).
 */
class SaatKomutKurallariTest {
    /** `JSONObject.similar` android.jar taklidinde yok (derleme yolu) → anahtar anahtar karşılaştır. */
    private fun ayni(a: JSONObject, b: JSONObject): Boolean {
        val anahtarlar = a.keys().asSequence().toSet()
        return anahtarlar == b.keys().asSequence().toSet() && anahtarlar.all { a.get(it).toString() == b.get(it).toString() }
    }

    private val fikstur = JSONObject(File("../../wear/app/src/test/resources/saat-komut-ornekleri.json").readText())
    private val simdi = fikstur.getLong("simdiMs")
    private val gun = fikstur.getString("takvimGunu")

    @Test
    fun namazModuIstekleriKenetlenir() {
        val dizi = fikstur.getJSONArray("namazModu")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val istek = SaatKomutKurallari.namazModuIstegi(o.getJSONObject("istek").toString(), simdi, gun)
            when {
                o.optBoolean("gecersiz") -> assertNull("#$i", istek)
                o.optBoolean("kapat") -> assertEquals("#$i", false, istek!!.ac)
                else -> assertEquals("#$i", SaatKomutKurallari.ModIstegi(true, o.getString("tur"), o.getLong("bitisMs")), istek)
            }
        }
    }

    @Test
    fun durumJsonFiksturleAyni() {
        val d = fikstur.getJSONObject("durum")
        val c = d.getJSONObject("camide")
        val uretilen = SaatKomutKurallari.durumJson(
            SaatKomutKurallari.CamideBilgisi(c.getString("yerId"), c.getString("ad"), c.getLong("bitisMs")),
            null,
            d.getLong("modBitisMs"),
        )
        assertTrue(uretilen, ayni(JSONObject(uretilen), d))
    }

    @Test
    fun uyandirmaYalnizUyandirmaKimligiKabulEder() {
        val imsak = """{"id":"muhafiz_2026-10-13_vakit_imsak_seviye_2_dk_34","islem":"kapat"}"""
        assertEquals("kapat", SaatKomutKurallari.uyandirmaIstegi(imsak)!!.islem)
        val nafile = SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_teheccud_45","islem":"kildim"}""")!!
        assertTrue(nafile.nafile)
        // Öğle muhafızı, kuşluk ve bilinmeyen işlem reddedilir: saat başka planı susturamaz.
        assertNull(SaatKomutKurallari.uyandirmaIstegi("""{"id":"muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_34","islem":"kapat"}"""))
        assertNull(SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_kusluk_45","islem":"kapat"}"""))
        assertNull(SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_teheccud_45","islem":"sil"}"""))
        assertNull(SaatKomutKurallari.uyandirmaIstegi("bozuk"))
    }

    @Test
    fun camiCevabiYerKimligiIster() {
        assertEquals(SaatKomutKurallari.CamiCevabi("evet", "osm:n1"), SaatKomutKurallari.camiCevabi("""{"cevap":"evet","yerId":"osm:n1"}"""))
        assertNull(SaatKomutKurallari.camiCevabi("""{"cevap":"evet"}"""))
        assertNull(SaatKomutKurallari.camiCevabi("""{"cevap":"belki","yerId":"x"}"""))
    }
}
