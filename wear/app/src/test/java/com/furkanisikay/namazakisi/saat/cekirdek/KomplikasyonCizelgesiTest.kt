package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Komplikasyon zaman çizelgesi kuralları + "vaktin çıkışına kalan" etiketleri.
 *
 * Kütüphane veri sınıfları (ComplicationData) JVM'de kurulamaz (android stub'ları) →
 * tür yerine dize ile modellenir; kural aynı: tüm girdiler varsayılanla AYNI türde.
 */
class KomplikasyonCizelgesiTest {
    private data class Veri(val tur: String, val metin: String)

    /**
     * REGRESYON (v0.37.0 çökmesi): varsayılan "veri yok" iken SHORT_TEXT girdiler
     * kütüphanenin doğrulamasından geçmez (`IllegalArgumentException`, süreç ölür).
     * Bu kütüphane kuralının modelidir: NO_DATA varsayılanla dolu girdi geçersizdir.
     */
    private fun kutuphaneyeUygun(plan: KomplikasyonCizelgesi.Plan<Veri>): Boolean {
        val v = plan.varsayilan ?: return plan.girdiler.isEmpty()
        return plan.girdiler.all { it.veri.tur == v.tur && it.baslangic < it.bitis }
    }

    @Test
    fun eskiKurulumKutuphaneKuralinaAykiriydi() {
        // Eski KomplikasyonOrtak.cizelge: varsayılan NO_DATA + SHORT_TEXT girdiler.
        val eski = KomplikasyonCizelgesi.Plan(
            Veri("NO_DATA", ""),
            listOf(KomplikasyonCizelgesi.Girdi(0L, 10L, Veri("SHORT_TEXT", "12:00"))),
        )
        assertTrue(!kutuphaneyeUygun(eski))
    }

    @Test
    fun girdilerVarsayilanlaAyniTurdeKalir() {
        val plan = KomplikasyonCizelgesi.kur(
            Veri("SHORT_TEXT", "—"),
            listOf(
                Triple(0L, 10L, Veri("SHORT_TEXT", "a")),
                Triple(10L, 20L, Veri("RANGED_VALUE", "b")),
                Triple(20L, 30L, null),
                Triple(30L, 40L, Veri("SHORT_TEXT", "c")),
            ),
        ) { it.tur }
        assertTrue(kutuphaneyeUygun(plan))
        assertEquals(listOf("a", "c"), plan.girdiler.map { it.veri.metin })
    }

    @Test
    fun bosVeyaTersAralikAtilir() {
        val plan = KomplikasyonCizelgesi.kur(
            Veri("SHORT_TEXT", "—"),
            listOf(Triple(10L, 10L, Veri("SHORT_TEXT", "a")), Triple(20L, 15L, Veri("SHORT_TEXT", "b"))),
        ) { it.tur }
        assertTrue(plan.girdiler.isEmpty())
    }

    @Test
    fun turDesteklenmiyorsaCizelgeTamamenBos() {
        val plan = KomplikasyonCizelgesi.kur<Veri, String>(
            null,
            listOf(Triple(0L, 10L, Veri("SHORT_TEXT", "a"))),
        ) { it.tur }
        assertNull(plan.varsayilan)
        assertTrue(plan.girdiler.isEmpty())
    }

    @Test
    fun teslimDenemeleriKisalarakYalnizVarsayilanaIner() {
        assertEquals(listOf(186, KomplikasyonCizelgesi.KISA_CIZELGE, 0), KomplikasyonCizelgesi.denemeBoyutlari(186))
        assertEquals(listOf(10, 0), KomplikasyonCizelgesi.denemeBoyutlari(10))
        assertEquals(listOf(0), KomplikasyonCizelgesi.denemeBoyutlari(0))
    }

    /** Gerçek yükle: vakit komplikasyonunun çizelgesi tüm aralıkları geçerli kurar. */
    @Test
    fun ornekYukunCizelgesiGecerli() {
        val yuk = (YukCozucu.coz(
            javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
        ) as CozumSonucu.Basarili).yuk
        val ilk = VakitHesabi.tumVakitler(yuk).first().ms
        val araliklar = ZamanCizelgesi.araliklar(yuk, ilk - 60_000L)
        val plan = KomplikasyonCizelgesi.kur(
            Veri("SHORT_TEXT", "—"),
            araliklar.map { Triple(it.baslangic, it.bitis, Veri("SHORT_TEXT", it.siradaki.vakit)) },
        ) { it.tur }
        assertEquals(araliklar.size, plan.girdiler.size)
        assertTrue(kutuphaneyeUygun(plan))
    }

    /** Tile tavanı: en yakın N aralık, kesintisiz; tavan tazeliğin çok üstünde. */
    @Test
    fun tileTavaniEnYakinAraliklariKesintisizVerir() {
        val yuk = (YukCozucu.coz(
            javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
        ) as CozumSonucu.Basarili).yuk
        val ilk = VakitHesabi.tumVakitler(yuk).first().ms
        val tum = ZamanCizelgesi.araliklar(yuk, ilk - 60_000L)
        val kesik = ZamanCizelgesi.araliklar(yuk, ilk - 60_000L, maksGirdi = 5)
        assertEquals(tum.take(5), kesik)
        kesik.zipWithNext { a, b -> assertEquals(a.bitis, b.baslangic) }
        // 6 sınır/gün: tavanın kapsadığı süre tazelik aralığının en az 8 katı olmalı.
        val kapsamMs = ZamanCizelgesi.TILE_MAKS_GIRDI / 6 * 24L * 60 * 60 * 1000
        assertTrue(kapsamMs >= 8 * ZamanCizelgesi.TILE_TAZELIK_MS)
    }

    // --- Vaktin çıkışına kalan ----------------------------------------------------

    /** Saat biçimi ("15:42") — kalan süre yuvasının hiçbir metninde geçmemeli. */
    private val SAAT = Regex("""\d{1,2}:\d{2}""")

    private fun saatYok(g: KalanSure.Gosterim) {
        for (m in listOf(g.kisaBaslik, g.uzunBaslik, g.aciklama)) {
            assertFalse("saat sızdı: $m", SAAT.containsMatchIn(m))
            assertFalse("çıkış saati sızdı: $m", m.contains("çıkış "))
        }
    }

    @Test
    fun farzSurerkenCikisaKalanVeVaktinAdi() {
        val g = KalanSure.gosterim("ogle", "ikindi")
        assertEquals(KalanSure.Mod.CIKIS, g.mod)
        assertEquals("Öğle", g.kisaBaslik)
        assertEquals("Öğle çıkışına", g.uzunBaslik)
        assertEquals("Öğle vaktinin çıkmasına kalan süre", g.aciklama)
    }

    @Test
    fun sabahVaktiGunesteCikar_yatsiImsakta() {
        assertEquals("Sabah", KalanSure.gosterim("imsak", "gunes").kisaBaslik)
        assertEquals("Yatsı", KalanSure.gosterim("yatsi", "imsak").kisaBaslik)
        assertEquals("İkindi çıkışına", KalanSure.gosterim("ikindi", "aksam").uzunBaslik)
    }

    @Test
    fun gunesOgleArasiFarzYok_ogleyeKalan() {
        val g = KalanSure.gosterim("gunes", "ogle")
        assertEquals(KalanSure.Mod.GIRIS, g.mod)
        assertEquals("Öğleye", g.kisaBaslik)
        assertEquals("Öğleye", g.uzunBaslik)
    }

    @Test
    fun sabahtaGunesNamazAdiGibiGorunmez() {
        val sabah = KalanSure.gosterim("imsak", "gunes")
        assertEquals("Sabah çıkışına", sabah.uzunBaslik)
        assertFalse(sabah.aciklama.contains("Güneş"))
    }

    /** SAHİP KARARI: kalan süre yuvası YALNIZ süre taşır — çıkış saati hiçbir türde yok. */
    @Test
    fun kalanSureYuvasindaCikisSaatiYok() {
        val vakitler = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        for (onceki in vakitler + listOf<String?>(null)) {
            for (siradaki in vakitler) saatYok(KalanSure.gosterim(onceki, siradaki))
        }
    }

    @Test
    fun oncekiBilinmiyorsaSiradakininGirisi() {
        val g = KalanSure.gosterim(null, "ikindi")
        assertEquals(KalanSure.Mod.GIRIS, g.mod)
        // "İkindiye" 8 karakter → kısa başlıkta yalnız ad; uzun başlıkta tam hâl.
        assertEquals("İkindi", g.kisaBaslik)
        assertEquals("İkindiye", g.uzunBaslik)
    }

    @Test
    fun kisaBasliklarAltiKarakteriAsmaz_noktaliIKorunur() {
        val vakitler = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        for (onceki in vakitler + listOf<String?>(null)) {
            for (siradaki in vakitler) {
                val b = KalanSure.gosterim(onceki, siradaki).kisaBaslik
                assertTrue("$onceki→$siradaki: $b", b.length <= 6)
                assertTrue(VakitSiniri.cikisSaati(onceki, siradaki, "00:00").kisaBaslik.length <= 6)
            }
            if (onceki != null) assertTrue(VakitSiniri.siradaki(onceki, "00:00").kisaBaslik.length <= 6)
        }
        // toUpperCase/toLowerCase tuzağı: noktalı İ sabit haritadan gelir.
        assertEquals("İkindi", KalanSure.kisaAd("ikindi"))
    }

    // --- Ayrı yuvalar: çıkış saati, sıradaki namaz ------------------------------

    @Test
    fun cikisSaatiYuvasiAyniAniAnlatir() {
        val c = VakitSiniri.cikisSaati("ogle", "ikindi", "15:42")
        assertEquals("Çıkış", c.kisaBaslik)
        assertEquals("15:42", c.kisaMetin)
        assertEquals("Öğle çıkışı 15:42", c.uzunMetin)
        // Güneş→öğle: farz yok → öğlenin girişi; güneş namaz adı gibi görünmez.
        val g = VakitSiniri.cikisSaati("gunes", "ogle", "13:05")
        assertEquals("Giriş", g.kisaBaslik)
        assertEquals("Öğle girişi 13:05", g.uzunMetin)
        assertEquals("Sabah çıkışı 07:01", VakitSiniri.cikisSaati("imsak", "gunes", "07:01").uzunMetin)
    }

    @Test
    fun siradakiNamazYuvasi() {
        val s = VakitSiniri.siradaki("ikindi", "15:42")
        assertEquals("İkindi", s.kisaBaslik)
        assertEquals("15:42", s.kisaMetin)
        assertEquals("Sıradaki: İkindi 15:42", s.uzunMetin)
    }

    /** "Sıradaki namaz" yuvası güneşi atlar: sabah vaktinde sıradaki öğledir. */
    @Test
    fun siradakiNamazCizelgesindeGunesYok() {
        val yuk = (YukCozucu.coz(
            javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
        ) as CozumSonucu.Basarili).yuk
        val ilk = VakitHesabi.tumVakitler(yuk).first().ms
        val araliklar = ZamanCizelgesi.araliklar(yuk, ilk - 60_000L, yalnizNamaz = true)
        assertTrue(araliklar.isNotEmpty())
        assertTrue(araliklar.none { it.siradaki.vakit == "gunes" })
    }
}
