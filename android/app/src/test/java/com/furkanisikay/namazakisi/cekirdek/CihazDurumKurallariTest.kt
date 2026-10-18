package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CihazDurumKurallariTest {
    @Test
    fun wearApiYoksaYok() {
        assertEquals(CihazDurumKurallari.SAAT_YOK, CihazDurumKurallari.saatDurumu(true, 3))
        assertEquals(CihazDurumKurallari.SAAT_YOK, CihazDurumKurallari.saatDurumu(true, null))
    }

    @Test
    fun dugumSayisinaGore() {
        assertEquals(CihazDurumKurallari.SAAT_ESLI_DEGIL, CihazDurumKurallari.saatDurumu(false, 0))
        assertEquals(CihazDurumKurallari.SAAT_ESLI, CihazDurumKurallari.saatDurumu(false, 1))
    }

    @Test
    fun okunamazsaBilinmiyor() {
        assertNull(CihazDurumKurallari.saatDurumu(false, null))
        assertNull(CihazDurumKurallari.saatDurumu(false, -1))
    }

    @Test
    fun widgetEkli() {
        assertFalse(CihazDurumKurallari.widgetEkliMi(emptyList()))
        assertFalse(CihazDurumKurallari.widgetEkliMi(listOf(0, 0, 0)))
        assertTrue(CihazDurumKurallari.widgetEkliMi(listOf(0, 2, 0)))
    }
}
