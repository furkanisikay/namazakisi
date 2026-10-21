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
}
