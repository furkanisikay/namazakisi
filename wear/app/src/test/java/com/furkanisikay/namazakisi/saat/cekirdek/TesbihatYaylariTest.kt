package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class TesbihatYaylariTest {
    private fun d(n: Int) = Tesbihat.Durum(n)

    @Test
    fun dolulukFazlaraBolunur() {
        assertEquals(listOf(0f, 0f, 0f), TesbihatYaylari.doluluk(d(0)))
        assertEquals(listOf(21f / 33, 0f, 0f), TesbihatYaylari.doluluk(d(21)))
        assertEquals(listOf(1f, 1f / 33, 0f), TesbihatYaylari.doluluk(d(34)))
        // Tehlil fazında (99) ve tamamda (100) üç yay dolu.
        assertEquals(listOf(1f, 1f, 1f), TesbihatYaylari.doluluk(d(99)))
        assertEquals(listOf(1f, 1f, 1f), TesbihatYaylari.doluluk(d(100)))
    }

    @Test
    fun yalnizBitenYayParlar() {
        assertEquals(0, TesbihatYaylari.parlayan(32, 33))
        assertEquals(1, TesbihatYaylari.parlayan(65, 66))
        assertEquals(2, TesbihatYaylari.parlayan(98, 99))
        assertEquals(TesbihatYaylari.HEPSI, TesbihatYaylari.parlayan(99, 100))
        assertNull(TesbihatYaylari.parlayan(20, 21))
        // Geri alma sınırı geri geçse de parlamaz.
        assertNull(TesbihatYaylari.parlayan(34, 33))
        assertNull(TesbihatYaylari.parlayan(0, 0))
    }
}
