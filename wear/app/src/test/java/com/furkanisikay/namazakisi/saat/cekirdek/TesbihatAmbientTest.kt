package com.furkanisikay.namazakisi.saat.cekirdek

import com.furkanisikay.namazakisi.saat.cekirdek.AmbientKaydirma.Kaydirma
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.abs

/** Tesbihat ambient görünümü (issue #293): burn-in kaydırması ve gösterilen metin. */
class TesbihatAmbientTest {

    @Test
    fun burnInKorumasiYoksaKaydirmaYok() {
        for (adim in 0..20) assertEquals(Kaydirma.YOK, TesbihatAmbient.kaydirma(adim, false, 33))
    }

    @Test
    fun wearOs6veSonrasindaSistemKaydirir_uygulamaKaydirmaz() {
        for (adim in 0..20) {
            assertEquals(Kaydirma.YOK, TesbihatAmbient.kaydirma(adim, true, 36))
            assertEquals(Kaydirma.YOK, TesbihatAmbient.kaydirma(adim, true, 37))
        }
    }

    @Test
    fun kaydirmaGenligiSinirliVeArdArdaAyniYerdeKalmaz() {
        var onceki: Kaydirma? = null
        val gorulen = mutableSetOf<Kaydirma>()
        for (adim in 0 until 27) {
            val k = TesbihatAmbient.kaydirma(adim, true, 30)
            assertTrue(abs(k.xDp) <= TesbihatAmbient.KAYDIRMA_DP)
            assertTrue(abs(k.yDp) <= TesbihatAmbient.KAYDIRMA_DP)
            if (onceki != null) assertNotEquals(onceki, k)
            onceki = k
            gorulen += k
        }
        assertEquals(9, gorulen.size)
        // Giriş anı merkezdedir.
        assertEquals(Kaydirma.YOK, TesbihatAmbient.kaydirma(0, true, 30))
    }

    @Test
    fun negatifAdimPatlamaz() {
        TesbihatAmbient.kaydirma(-1, true, 30)
        TesbihatAmbient.kaydirma(Int.MIN_VALUE, true, 30)
    }

    @Test
    fun icerikFazVeSayiyiGosterir() {
        val i = TesbihatAmbient.icerik(Tesbihat.Durum(45))
        assertEquals("Elhamdülillâh", i.baslik)
        assertEquals("12", i.sayi)
        assertEquals("45 / 100", i.alt)
        assertEquals("Elhamdülillâh, 12 / 33. Toplam 45 / 100", i.aciklama)
    }

    @Test
    fun baslangictaSifirGosterir() {
        val i = TesbihatAmbient.icerik(Tesbihat.Durum(0))
        assertEquals("Sübhânallah", i.baslik)
        assertEquals("0", i.sayi)
    }

    @Test
    fun tehlilVeTamamdaRakamYok() {
        val tehlil = TesbihatAmbient.icerik(Tesbihat.Durum(99))
        assertEquals(Tesbihat.Faz.TEHLIL.ad, tehlil.baslik)
        assertNull(tehlil.sayi)
        assertEquals("99 / 100", tehlil.alt)

        val tamam = TesbihatAmbient.icerik(Tesbihat.Durum(100))
        assertEquals("Allah kabul etsin", tamam.baslik)
        assertNull(tamam.sayi)
        assertEquals("100 / 100", tamam.alt)
    }
}
