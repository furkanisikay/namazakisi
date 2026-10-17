package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
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

    // --- Vaktin çıkışına kalan ----------------------------------------------------

    @Test
    fun farzSurerkenCikisaKalanVeVaktinAdi() {
        val g = KalanSure.gosterim("ogle", "ikindi", "15:42")
        assertEquals(KalanSure.Mod.CIKIS, g.mod)
        assertEquals("Öğle", g.kisaBaslik)
        assertEquals("Öğle · ^1 kaldı", g.uzunSablon)
        assertTrue(g.aciklama.startsWith("Öğle vaktinin çıkmasına kalan süre"))
    }

    @Test
    fun sabahVaktiGunesteCikar_yatsiImsakta() {
        assertEquals("Sabah", KalanSure.gosterim("imsak", "gunes", "07:01").kisaBaslik)
        assertEquals("Yatsı", KalanSure.gosterim("yatsi", "imsak", "05:40").kisaBaslik)
        assertEquals("İkindi · ^1 kaldı", KalanSure.gosterim("ikindi", "aksam", "18:20").uzunSablon)
    }

    @Test
    fun gunesOgleArasiFarzYok_ogleyeKalan() {
        val g = KalanSure.gosterim("gunes", "ogle", "13:05")
        assertEquals(KalanSure.Mod.GIRIS, g.mod)
        assertEquals("Öğleye", g.kisaBaslik)
        assertEquals("Öğleye ^1", g.uzunSablon)
    }

    @Test
    fun oncekiBilinmiyorsaSiradakininGirisi() {
        val g = KalanSure.gosterim(null, "ikindi", "15:42")
        assertEquals(KalanSure.Mod.GIRIS, g.mod)
        // "İkindiye" 8 karakter → kısa başlıkta yalnız ad; uzun metinde tam hâl.
        assertEquals("İkindi", g.kisaBaslik)
        assertEquals("İkindiye ^1", g.uzunSablon)
    }

    @Test
    fun kisaBasliklarAltiKarakteriAsmaz_noktaliIKorunur() {
        val vakitler = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        for (onceki in vakitler + listOf<String?>(null)) {
            for (siradaki in vakitler) {
                val b = KalanSure.gosterim(onceki, siradaki, "00:00").kisaBaslik
                assertTrue("$onceki→$siradaki: $b", b.length <= 6)
            }
        }
        // toUpperCase/toLowerCase tuzağı: noktalı İ sabit haritadan gelir.
        assertEquals("İkindi", KalanSure.kisaAd("ikindi"))
    }
}
