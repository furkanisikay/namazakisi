package com.furkanisikay.namazakisi.tv.cekirdek

import com.furkanisikay.namazakisi.tv.cekirdek.Bicim.SureParcasi
import org.junit.Assert.assertEquals
import org.junit.Test

class BicimTest {
    private val sn = 1_000L
    private val dk = 60 * sn
    private val sa = 60 * dk

    @Test
    fun saatVeUstuSaatDakikaGosterir() {
        assertEquals(listOf(SureParcasi("1", "sa"), SureParcasi("16", "dk")), Bicim.kalanParcalari(sa + 16 * dk + 59 * sn))
        assertEquals(listOf(SureParcasi("2", "sa"), SureParcasi("0", "dk")), Bicim.kalanParcalari(2 * sa))
    }

    /** Eski "18:25" duvar saati gibi okunuyordu: birim ZORUNLU, saniye iki haneli. */
    @Test
    fun saatinAltiDakikaSaniyeGosterir() {
        assertEquals(listOf(SureParcasi("18", "dk"), SureParcasi("25", "sn")), Bicim.kalanParcalari(18 * dk + 25 * sn))
        assertEquals(listOf(SureParcasi("5", "dk"), SureParcasi("05", "sn")), Bicim.kalanParcalari(5 * dk + 5 * sn + 900))
    }

    @Test
    fun dakikaninAltiYalnizSaniye() {
        assertEquals(listOf(SureParcasi("42", "sn")), Bicim.kalanParcalari(42 * sn))
        assertEquals(listOf(SureParcasi("0", "sn")), Bicim.kalanParcalari(-5_000))
    }

    @Test
    fun sesliMetinDakikaCozunurluklu() {
        assertEquals("1 saat 16 dakika", Bicim.kalanSesli(sa + 16 * dk + 40 * sn))
        assertEquals("2 saat", Bicim.kalanSesli(2 * sa + 30 * sn))
        assertEquals("18 dakika", Bicim.kalanSesli(18 * dk + 25 * sn))
        assertEquals("1 dakikadan az", Bicim.kalanSesli(42 * sn))
    }

    @Test
    fun ilerlemeKenetli() {
        assertEquals(0.25f, Bicim.ilerleme(0, 100, 25), 1e-6f)
        assertEquals(0f, Bicim.ilerleme(0, 100, -10), 1e-6f)
        assertEquals(1f, Bicim.ilerleme(0, 100, 500), 1e-6f)
        assertEquals(0f, Bicim.ilerleme(100, 100, 100), 1e-6f)
    }

    @Test
    fun kisaBirimliSatirBuyukSayaclaAyniBicim() {
        assertEquals("5 sa 2 dk", Bicim.kalanKisa(5 * sa + 2 * dk + 59 * sn))
        assertEquals("18 dk 05 sn", Bicim.kalanKisa(18 * dk + 5 * sn))
        assertEquals("42 sn", Bicim.kalanKisa(42 * sn))
    }

    @Test
    fun sayiBirimBosluguDildenGelir() {
        // JS `sure.birimli` / `sure.parcali` ikizi: boşluklu dil eski biçimde, Çince bitişik.
        val en = tvDili("en")
        assertEquals(" " to " ", en.birimAyirici to en.parcaAyirici)
        assertEquals("5 h 2 min", Bicim.kalanKisa(5 * sa + 2 * dk, "en"))
        assertEquals("1 hour 16 minutes", Bicim.kalanSesli(sa + 16 * dk, "en"))
        val zh = tvDili("zh")
        assertEquals("" to "", zh.birimAyirici to zh.parcaAyirici)
        assertEquals("5${zh.birimSa}2${zh.birimDk}", Bicim.kalanKisa(5 * sa + 2 * dk, "zh"))
        assertEquals("18${zh.birimDk}05${zh.birimSn}", Bicim.kalanKisa(18 * dk + 5 * sn, "zh"))
        assertEquals(zh.saatSesli(1) + zh.dakikaSesli(16), Bicim.kalanSesli(sa + 16 * dk, "zh"))
    }
}
