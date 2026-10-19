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
        assertTrue(satirlar.getValue("ogle").isaretlenebilir)
        assertFalse(satirlar.getValue("ikindi").isaretlenebilir)
        assertFalse(satirlar.getValue("ikindi").girdi)
    }

    @Test
    fun gunesNamazDegil_listedeYokSiradakiNamazOgle() {
        // Sabah vakti sürerken: liste beş namaz, güneş satırı yok.
        val sabah = v(bugun, "imsak") + 10 * dk
        val satirlar = VakitHesabi.satirlar(yuk, sabah, bugun.tarih, emptySet())
        assertEquals(listOf("imsak", "ogle", "ikindi", "aksam", "yatsi"), satirlar.map { it.vakit })
        // Sıradaki NAMAZ öğledir; sıradaki SINIR hâlâ güneştir (sabahın çıkışı).
        assertEquals("ogle", VakitHesabi.siradakiNamaz(yuk, sabah)!!.vakit)
        assertEquals("gunes", VakitHesabi.siradaki(yuk, sabah)!!.vakit)
        // Güneş→öğle arasında da sıradaki namaz öğle.
        assertEquals("ogle", VakitHesabi.siradakiNamaz(yuk, v(bugun, "gunes") + dk)!!.vakit)
        assertFalse(VakitHesabi.namazMi("gunes"))
        assertTrue(VakitHesabi.namazMi("imsak"))
    }

    @Test
    fun sabahGunesteCikar_sayilanAnDegismez() {
        val s = VakitHesabi.sayilanAn(yuk, v(bugun, "imsak") + 10 * dk)!!
        assertEquals(KalanSure.Mod.CIKIS, s.mod)
        assertEquals("imsak", s.vakit)
        assertEquals(v(bugun, "gunes"), s.hedef)
    }

    @Test
    fun yalnizNamazCizelgesiGunesiAtlar() {
        val an = v(bugun, "imsak") + 10 * dk
        val namaz = ZamanCizelgesi.araliklar(yuk, an, yalnizNamaz = true)
        assertEquals("ogle", namaz.first().siradaki.vakit)
        assertEquals("imsak", namaz.first().onceki!!.vakit)
        assertTrue(namaz.none { it.siradaki.vakit == "gunes" || it.onceki?.vakit == "gunes" })
        // Varsayılan çizelge (kalan süre) güneşte bölünmeye devam eder.
        assertEquals("gunes", ZamanCizelgesi.araliklar(yuk, an).first().siradaki.vakit)
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

    // --- sayilanAn: ana ekran, tile ve komplikasyonun TEK kuralı ---

    @Test
    fun farzSurerkenVaktinCikisinaSayar() {
        val an = v(bugun, "ogle") + 10 * dk
        val s = VakitHesabi.sayilanAn(yuk, an)!!
        assertEquals(KalanSure.Mod.CIKIS, s.mod)
        assertEquals("ogle", s.vakit)
        assertEquals(bugun.tarih, s.tarih)
        assertEquals(v(bugun, "ogle"), s.baslangic)
        assertEquals(v(bugun, "ikindi"), s.hedef)
        assertEquals(v(bugun, "ikindi") - an, s.kalanMs(an))
        val oran = s.kalanOran(an)
        assertTrue(oran > 0.8f && oran < 1f)
    }

    @Test
    fun gunestenOgleyeOgleninGirisineSayar() {
        val an = v(bugun, "gunes") + 30 * dk
        val s = VakitHesabi.sayilanAn(yuk, an)!!
        assertEquals(KalanSure.Mod.GIRIS, s.mod)
        assertEquals("ogle", s.vakit)
        assertEquals(v(bugun, "gunes"), s.baslangic)
        assertEquals(v(bugun, "ogle"), s.hedef)
        assertFalse("girişe sayarken acil ton yok", s.acilMi(v(bugun, "ogle") - dk))
    }

    @Test
    fun geceYarisindanSonraYatsiDuneAitVeImsakaSayar() {
        val an = v(bugun, "imsak") - 60 * dk
        val s = VakitHesabi.sayilanAn(yuk, an)!!
        assertEquals(KalanSure.Mod.CIKIS, s.mod)
        assertEquals("yatsi", s.vakit)
        assertEquals(dun.tarih, s.tarih)
        assertEquals(v(bugun, "imsak"), s.hedef)
    }

    @Test
    fun yukunIlkAnindaSiradakininGirisineSayarVeYayDolu() {
        val an = v(dun, "imsak") - 10 * dk
        val s = VakitHesabi.sayilanAn(yuk, an)!!
        assertEquals(KalanSure.Mod.GIRIS, s.mod)
        assertEquals("imsak", s.vakit)
        assertNull(s.baslangic)
        assertEquals(1f, s.kalanOran(an), 0f)
    }

    @Test
    fun yukBitinceSayilanAnYok() {
        val son = yuk.gunler.last()
        assertNull(VakitHesabi.sayilanAn(yuk, v(son, "yatsi") + dk))
    }

    @Test
    fun sonOnBesDakikaAcil() {
        val hedef = v(bugun, "ikindi")
        val s = VakitHesabi.sayilanAn(yuk, v(bugun, "ogle") + dk)!!
        assertFalse(s.acilMi(hedef - (SaatPaleti.ACIL_ESIK_DK + 1) * dk))
        assertTrue(s.acilMi(hedef - SaatPaleti.ACIL_ESIK_DK * dk))
        assertTrue(s.acilMi(hedef - dk))
    }

    @Test
    fun kerahatBandiYalnizIkindininSonGurubDakikasi() {
        val ikindi = VakitHesabi.sayilanAn(yuk, v(bugun, "ikindi") + dk)!!
        assertEquals(
            (v(bugun, "aksam") - yuk.kerahat.gurubDk * dk) to v(bugun, "aksam"),
            VakitHesabi.kerahatBandi(yuk, ikindi),
        )
        assertNull(VakitHesabi.kerahatBandi(yuk, VakitHesabi.sayilanAn(yuk, v(bugun, "ogle") + dk)!!))
    }

    @Test
    fun sayilanAnKomplikasyonGosterimiyleAyniModu() {
        // Komplikasyon etiketleri (KalanSure.gosterim) ile ekran AYNI kuralı okumalı.
        for (a in ZamanCizelgesi.araliklar(yuk, v(dun, "imsak") - dk)) {
            val s = VakitHesabi.sayilanAn(a.onceki, a.siradaki)
            val g = KalanSure.gosterim(a.onceki?.vakit, a.siradaki.vakit)
            assertEquals(g.mod, s.mod)
            assertEquals(a.siradaki.ms, s.hedef)
        }
    }

    @Test
    fun kalanSesliMetni() {
        assertEquals("1 dakikadan az", VakitHesabi.kalanSesliMetni(30_000))
        assertEquals("58 dakika", VakitHesabi.kalanSesliMetni(58 * dk))
        assertEquals("2 saat", VakitHesabi.kalanSesliMetni(120 * dk))
        assertEquals("1 saat 58 dakika", VakitHesabi.kalanSesliMetni(118 * dk + 59_000))
    }
}
