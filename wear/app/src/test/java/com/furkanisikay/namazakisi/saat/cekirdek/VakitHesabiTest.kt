package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class VakitHesabiTest {
    private val dk = 60_000L
    private val yuk = (YukCozucu.coz(
        javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
    ) as CozumSonucu.Basarili).yuk
    private val dun = yuk.gunler[0]
    private val bugun = yuk.gunler[1]
    private fun v(g: Gun, ad: String) = g.vakitler.getValue(ad)

    @Test
    fun geceYarisindanSonraImsaktanOnceAktifGunDun() {
        val gece = v(bugun, "imsak") - 60 * dk
        assertEquals(dun.tarih, VakitHesabi.aktifGun(yuk, gece, bugun.tarih))
        assertEquals(bugun.tarih, VakitHesabi.aktifGun(yuk, v(bugun, "imsak") + dk, bugun.tarih))
    }

    @Test
    fun siradakiVeSimdikiVakit() {
        val an = v(bugun, "ogle") + 10 * dk
        assertEquals("ikindi", VakitHesabi.siradaki(yuk, an)!!.vakit)
        assertEquals("ogle", VakitHesabi.simdiki(yuk, an)!!.vakit)
        val ilerleme = VakitHesabi.ilerleme(yuk, an)!!
        assertTrue(ilerleme > 0f && ilerleme < 0.2f)
    }

    @Test
    fun satirlarGirmeyenVeGunesIsaretlenemez() {
        val an = v(bugun, "ogle") + 10 * dk
        val satirlar = VakitHesabi.satirlar(yuk, an, bugun.tarih, emptySet()).associateBy { it.vakit }
        assertTrue(satirlar.getValue("imsak").kilindi)
        assertFalse(satirlar.getValue("imsak").isaretlenebilir)
        assertFalse(satirlar.getValue("gunes").isaretlenebilir)
        assertTrue(satirlar.getValue("ogle").isaretlenebilir)
        assertFalse(satirlar.getValue("ikindi").isaretlenebilir)
        assertFalse(satirlar.getValue("ikindi").girdi)
    }

    @Test
    fun saatteIsaretlenenEsitlenirkenKilinmisGorunur() {
        val an = v(bugun, "ogle") + 10 * dk
        val bekleyen = setOf(VakitHesabi.kimlik(bugun.tarih, "ogle"))
        val ogle = VakitHesabi.satirlar(yuk, an, bugun.tarih, bekleyen).first { it.vakit == "ogle" }
        assertTrue(ogle.kilindi)
        assertTrue(ogle.esitleniyor)
        assertFalse(ogle.isaretlenebilir)
    }

    @Test
    fun telefonOnaylayincaBekleyenAyiklanir() {
        val bekleyen = setOf(VakitHesabi.kimlik(bugun.tarih, "imsak"), VakitHesabi.kimlik(bugun.tarih, "ogle"), "1999-01-01_ogle")
        assertEquals(setOf(VakitHesabi.kimlik(bugun.tarih, "ogle")), VakitHesabi.bekleyeniAyikla(yuk, bekleyen))
    }

    @Test
    fun kerahatPencereleriYuktenGelir() {
        assertTrue(VakitHesabi.kerahatMi(yuk, v(bugun, "gunes") + 10 * dk))
        assertTrue(VakitHesabi.kerahatMi(yuk, v(bugun, "ogle") - 3 * dk))
        assertTrue(VakitHesabi.kerahatMi(yuk, v(bugun, "aksam") - 10 * dk))
        assertFalse(VakitHesabi.kerahatMi(yuk, v(bugun, "gunes") + 30 * dk))
    }

    @Test
    fun zamanCizelgesiHerSinirdaBirSonrakineGecer() {
        val an = v(bugun, "ogle") + 10 * dk
        val araliklar = ZamanCizelgesi.araliklar(yuk, an)
        assertEquals("ikindi", araliklar[0].siradaki.vakit)
        assertEquals(an, araliklar[0].baslangic)
        for (i in 1 until araliklar.size) {
            assertEquals(araliklar[i - 1].bitis, araliklar[i].baslangic)
        }
        assertNull(VakitHesabi.siradaki(yuk, Long.MAX_VALUE))
    }

    @Test
    fun kalanMetni() {
        assertEquals("1 dk'dan az", VakitHesabi.kalanMetni(30_000))
        assertEquals("12 dk", VakitHesabi.kalanMetni(12 * dk))
        assertEquals("2 sa", VakitHesabi.kalanMetni(120 * dk))
        assertEquals("1 sa 5 dk", VakitHesabi.kalanMetni(65 * dk))
    }
}
