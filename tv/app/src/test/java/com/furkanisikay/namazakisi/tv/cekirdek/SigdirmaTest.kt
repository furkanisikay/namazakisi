package com.furkanisikay.namazakisi.tv.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SigdirmaTest {
    /** Genişliği boyla doğru orantılı sahte etiket (px = harf × boy × 0,6). */
    private fun genislik(harf: Int, boy: Float) = harf * boy * 0.6f

    /** "Sil" ve "Geri" ORTAK boy alır: uzun etiketin sığdığı boy kısa etikete de verilir. */
    @Test
    fun ortakBoyEnUzunEtiketeGoreSecilir() {
        val tusIci = 100f // sahte ölçü: 9 harflik etiket 24'te sığmaz, 5 harflik sığar
        val etiketler = listOf(5, 9) // ör. "நீக்கு" ve "பின்செல்"
        val ortak = Sigdirma.enBuyukSiganBoy(24f, 14f) { b -> etiketler.all { genislik(it, b) <= tusIci } }
        val kisaTekBasina = Sigdirma.enBuyukSiganBoy(24f, 14f) { b -> genislik(5, b) <= tusIci }
        assertEquals(24f, kisaTekBasina, 0f)
        assertTrue("uzun etiket küçültmeyi zorlar", ortak < kisaTekBasina)
        assertTrue(genislik(9, ortak) <= tusIci)
        assertTrue("bir adım büyüğü sığmaz", genislik(9, ortak + 1f) > tusIci)
    }

    /** Türkçe/İngilizce kısa etikette boy değişmez (görünüm korunur). */
    @Test
    fun siganEtiketBuyukKalir() {
        assertEquals(24f, Sigdirma.enBuyukSiganBoy(24f, 14f) { true }, 0f)
    }

    @Test
    fun hicbiriSigmazsaEnKucuk() {
        assertEquals(14f, Sigdirma.enBuyukSiganBoy(24f, 14f) { false }, 0f)
    }

    @Test
    fun olceklerTabaniAsmaz() {
        assertEquals(1f, Sigdirma.olcekler(0.66f).first(), 0f)
        assertEquals(0.66f, Sigdirma.olcekler(0.66f).last(), 0f)
        assertTrue(Sigdirma.olcekler(0.6f).zipWithNext().all { (a, b) -> a > b })
        // Taban tablonun altındaysa en küçük ölçeğe kadar iner, boş liste dönmez.
        assertEquals(0.6f, Sigdirma.olcekler(0.1f).last(), 0f)
        assertEquals(listOf(0.6f), Sigdirma.olcekler(2f))
    }
}
