package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.TimeZone

/** Android Auto (POI) ekranının saf kararları. */
class AracKarariTest {

    private val istanbul = TimeZone.getTimeZone("Europe/Istanbul")
    private val saat: (Long) -> String = { saatMetni(it, istanbul) }

    // 2026-06-21, İstanbul (UTC+3). Öğle 13:11, ikindi 17:05.
    private val ogle = VakitAni(VakitKodlari.OGLE, 1_782_036_660_000L, "2026-06-21")
    private val ikindi = VakitAni(VakitKodlari.IKINDI, 1_782_050_700_000L, "2026-06-21")

    @Test
    fun kilinmamisAktifVakitteKalanSureYazilir() {
        val durum = VakitDurumu(ogle, ikindi.ms, ikindi)
        // Çıkışa 41 dk 30 sn → yukarı yuvarlanır: 42 dk.
        val simdi = ikindi.ms - (41 * 60_000L + 30_000L)
        assertEquals("Öğle · 42 dk kaldı", AracKarari.baslik(durum, KildimDurumu.KILINABILIR, simdi, saat))
    }

    @Test
    fun kilinmisVakitteSiradakiVakitYazilir() {
        val durum = VakitDurumu(ogle, ikindi.ms, ikindi)
        val beklenen = "Sıradaki İkindi · ${saat(ikindi.ms)}"
        assertEquals(beklenen, AracKarari.baslik(durum, KildimDurumu.KILINDI, ogle.ms + 60_000, saat))
        // Kuyrukta bekleyen işaretleme de "kılındı" sayılır (iyimser durum).
        assertEquals(beklenen, AracKarari.baslik(durum, KildimDurumu.BEKLIYOR, ogle.ms + 60_000, saat))
    }

    @Test
    fun vakitArasindaSiradakiYazilir() {
        val durum = VakitDurumu(null, null, ogle)
        assertEquals("Sıradaki Öğle · ${saat(ogle.ms)}", AracKarari.baslik(durum, KildimDurumu.YOK, ogle.ms - 1, saat))
    }

    @Test
    fun veriYoksaUygulamaAdi() {
        assertEquals(AracKarari.VARSAYILAN_BASLIK, AracKarari.baslik(VakitDurumu(null, null, null), KildimDurumu.YOK, 0, saat))
    }

    @Test
    fun camiSayisiHostSinirinaUyar() {
        assertEquals(6, AracKarari.camiSayisi(null))
        assertEquals(6, AracKarari.camiSayisi(0))
        assertEquals(4, AracKarari.camiSayisi(4))
        assertEquals(AracKarari.AZAMI_CAMI_SAYISI, AracKarari.camiSayisi(100))
    }

    @Test
    fun mesafeBirimleri() {
        assertEquals(AracKarari.Mesafe(10.0, AracKarari.Birim.METRE), AracKarari.mesafe(3.0))
        assertEquals(AracKarari.Mesafe(350.0, AracKarari.Birim.METRE), AracKarari.mesafe(347.0))
        assertEquals(AracKarari.Mesafe(1.2, AracKarari.Birim.KM_ONDALIK), AracKarari.mesafe(1_234.0))
        assertEquals(AracKarari.Mesafe(9.9, AracKarari.Birim.KM_ONDALIK), AracKarari.mesafe(9_940.0))
        assertEquals(AracKarari.Mesafe(13.0, AracKarari.Birim.KM), AracKarari.mesafe(12_600.0))
        assertEquals(AracKarari.Birim.METRE, AracKarari.mesafe(Double.NaN).birim)
    }

    @Test
    fun navigasyonAdresiKoordinatVeEtiketTasir() {
        assertEquals(
            "geo:41.008238,28.978359?q=41.008238,28.978359(Sultan%20Ahmet%20Camii)",
            AracKarari.navigasyonAdresi(41.008238, 28.978359, "Sultan Ahmet Camii"),
        )
        // Türkçe karakter UTF-8 ile kodlanır, parantez etiketi bölmesin diye atılır.
        assertEquals(
            "geo:39.900000,32.850000?q=39.900000,32.850000(Kocatepe%20Camii%20Ankara)",
            AracKarari.navigasyonAdresi(39.9, 32.85, "Kocatepe Camii (Ankara)"),
        )
        assertTrue(AracKarari.navigasyonAdresi(1.0, 2.0, "Şehitlik").endsWith("(%C5%9Eehitlik)"))
        assertEquals("geo:1.000000,2.000000?q=1.000000,2.000000", AracKarari.navigasyonAdresi(1.0, 2.0, "  "))
    }

    @Test
    fun konumSecEnTazeGecerliyiAlir() {
        val eski = AracKarari.KonumAdayi(41.0, 29.0, 1_000)
        val taze = AracKarari.KonumAdayi(39.9, 32.8, 2_000)
        val sifir = AracKarari.KonumAdayi(0.0, 0.0, 9_000)
        val bozuk = AracKarari.KonumAdayi(Double.NaN, 29.0, 9_500)
        assertEquals(taze, AracKarari.konumSec(listOf(eski, sifir, taze, bozuk)))
        assertNull(AracKarari.konumSec(listOf(sifir, bozuk)))
        assertNull(AracKarari.konumSec(emptyList()))
        assertFalse(AracKarari.gecerliMi(91.0, 0.5))
    }

    @Test
    fun tazelemeBirSonrakiDakikaBasinda() {
        val simdi = 1_782_036_660_000L + 12_345
        val t = AracKarari.sonrakiTazelemeMs(simdi)
        assertTrue(t > simdi)
        assertEquals(500L, t % 60_000)
        assertTrue(t - simdi <= 60_500)
    }
}
