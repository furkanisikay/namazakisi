package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AnaEkranKarariTest {
    private val dk = 60_000L
    private val yuk = (YukCozucu.coz(
        javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
    ) as CozumSonucu.Basarili).yuk
    private val bugun = yuk.gunler[1]
    private fun v(ad: String) = bugun.vakitler.getValue(ad)
    private fun kur(an: Long, bekleyen: Set<String> = emptySet()) =
        AnaEkranKarari.kur(yuk, an, bugun.tarih, bekleyen)!!

    @Test
    fun vakitSurerkenKildimDugmesiVeVakitTonu() {
        val g = kur(v("ogle") + 10 * dk)
        assertEquals(AnaEkranKarari.Dugme.ISARETLE, g.dugme)
        assertEquals("ogle", g.satir!!.vakit)
        assertEquals(SaatPaleti.vakitRengi("ogle"), g.renk)
        assertFalse(g.acil)
        assertEquals("Öğle", g.adSatiri)
        assertEquals("vaktin çıkmasına", g.altYazi)
        assertTrue(g.aciklama.startsWith("Öğle vaktinin çıkmasına "))
        // Noktalar GunDurumu'ndan: Öğle beş farzın ikincisi.
        assertEquals(GunDurumu.FARZ_SAYISI, g.noktalar.size)
        assertEquals(1, g.aktifNokta)
        assertEquals(GunDurumu.ozet(yuk, v("ogle") + 10 * dk, bugun.tarih, emptySet())!!.kilinanSayisi, g.kilinanSayisi)
    }

    @Test
    fun sonOnBesDakikadaAcilVeMetinleBelirtilir() {
        val g = kur(v("ikindi") - 10 * dk)
        assertTrue(g.acil)
        assertEquals(SaatPaleti.ACIL, g.renk)
        assertEquals("Öğle · son 15 dk", g.adSatiri)
        assertTrue(g.aciklama.contains("son 15 dakika"))
    }

    @Test
    fun saatteIsaretlenenVakitYesileDonerAcilOlmaz() {
        val g = kur(v("ikindi") - 5 * dk, setOf(VakitHesabi.kimlik(bugun.tarih, "ogle")))
        assertEquals(AnaEkranKarari.Dugme.ESITLENIYOR, g.dugme)
        assertNull(g.satir)
        assertEquals(SaatPaleti.EYLEM, g.renk)
        assertFalse(g.acil)
        assertTrue(g.aciklama.contains("kılındı"))
    }

    @Test
    fun gunestenOgleyeDugmeYokGiriseSayar() {
        val g = kur(v("gunes") + 30 * dk)
        assertEquals(KalanSure.Mod.GIRIS, g.sayilan.mod)
        assertEquals(AnaEkranKarari.Dugme.YOK, g.dugme)
        assertEquals("vaktin girmesine", g.altYazi)
        assertTrue(g.aciklama.startsWith("Öğle vaktinin girmesine "))
        assertNull(g.aktifNokta)
    }

    @Test
    fun ikindideKerahatBandiYayinSonunda() {
        val g = kur(v("ikindi") + dk)
        val bant = g.kerahatBandi
        assertNotNull(bant)
        val uzunluk = (v("aksam") - v("ikindi")).toFloat()
        assertEquals(1f - yuk.kerahat.gurubDk * dk / uzunluk, bant!!.start, 1e-4f)
        assertEquals(1f, bant.endInclusive, 0f)
        assertNull(kur(v("ogle") + dk).kerahatBandi)
    }

    @Test
    fun sayacBicimi() {
        val p = AnaEkranKarari::Parca
        // Saat ve üstü: saniye YOK, birimler zorunlu ("1:58" saniye sanılabiliyordu).
        assertEquals(AnaEkranKarari.Sayac(listOf(p("1", "sa", false), p("58", "dk", false))), AnaEkranKarari.sayac((118 * 60 + 7) * 1000L))
        // Saatin altı: dakika + (etkileşimli kipte) iki haneli saniye.
        val bes = AnaEkranKarari.sayac(5 * dk + 7_000)
        assertEquals(listOf(p("5", "dk", false), p("07", "sn", true)), bes.parcalar)
        assertEquals(listOf(p("5", "dk", false)), bes.gorunur(saniyeGoster = false))
        assertEquals(1, bes.haneSayisi(saniyeGoster = true))
        assertEquals(listOf(p("0", "dk", false), p("00", "sn", true)), AnaEkranKarari.sayac(-5_000).parcalar)
        assertEquals(4, AnaEkranKarari.sayac((10 * 60 + 59) * dk).haneSayisi(saniyeGoster = true))
    }

    @Test
    fun yukBitinceGorunumYok() {
        assertNull(AnaEkranKarari.kur(yuk, yuk.gunler.last().vakitler.getValue("yatsi") + dk, bugun.tarih, emptySet()))
    }

    @Test
    fun hatSozlesmesiMetinleri() {
        // scripts/saat-kare-hatti.sh bu kalıpları arar.
        assertEquals("Öğle vaktini kıldım olarak işaretleyin", AnaEkranKarari.dugmeAciklamasi("Öğle"))
        assertEquals("İkindi namazını kıldınız mı?", AnaEkranKarari.onaySorusu("İkindi"))
    }

    @Test
    fun onayAcikkenImsakGirerseYatsiIsaretlenmez() {
        // 05:14:50'de yatsı onayı açıldı, 05:15'te imsak girdi, 05:15:05'te basıldı.
        val yarin = yuk.gunler[2]
        val imsak = yarin.vakitler.getValue("imsak")
        assertTrue(AnaEkranKarari.onayGecerliMi(yuk, imsak - 10_000L, yarin.tarih, emptySet(), bugun.tarih, "yatsi"))
        assertFalse(AnaEkranKarari.onayGecerliMi(yuk, imsak + 5_000L, yarin.tarih, emptySet(), bugun.tarih, "yatsi"))
    }

    @Test
    fun onayAcikkenIsaretlenenVakitYenidenYazilmaz() {
        val an = v("ogle") + 10 * dk
        assertTrue(AnaEkranKarari.onayGecerliMi(yuk, an, bugun.tarih, emptySet(), bugun.tarih, "ogle"))
        val bekleyen = setOf(VakitHesabi.kimlik(bugun.tarih, "ogle"))
        assertFalse(AnaEkranKarari.onayGecerliMi(yuk, an, bugun.tarih, bekleyen, bugun.tarih, "ogle"))
    }
}
