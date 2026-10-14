package com.furkanisikay.namazakisi.tv.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

class PanoDurumuTest {
    private val ist = ZoneId.of("Europe/Istanbul")
    private val lat = 41.0082
    private val lng = 28.9784

    private fun an(s: String): Long = LocalDateTime.parse(s).atZone(ist).toInstant().toEpochMilli()

    private fun durum(s: String) = PanoHesabi.hesapla(an(s), ist) { VakitHesabi.hesapla(lat, lng, it) }

    @Test
    fun ogledenSonraAktifIkindiSiradakiAksam() {
        // 2026-10-13 İstanbul: ikindi ~15:5x, akşam ~18:3x.
        val d = durum("2026-10-13T16:30:00")
        assertEquals(Vakit.IKINDI, d.aktif)
        assertEquals(Vakit.AKSAM, d.siradaki)
        assertEquals(d.vakitler.aksam, d.siradakiMs)
        assertEquals(d.siradakiMs - an("2026-10-13T16:30:00"), d.kalanMs)
        assertFalse(d.cuma)
    }

    @Test
    fun geceYarisindanSonraImsakOncesiAktifYatsiSiradakiBugununImsaki() {
        val d = durum("2026-10-14T02:00:00")
        assertEquals(LocalDate.parse("2026-10-14"), d.tarih)
        assertEquals(Vakit.YATSI, d.aktif)
        assertEquals(Vakit.IMSAK, d.siradaki)
        assertEquals(d.vakitler.imsak, d.siradakiMs)
    }

    @Test
    fun yatsidanSonraSiradakiYarininImsaki() {
        val d = durum("2026-10-13T23:30:00")
        assertEquals(Vakit.YATSI, d.aktif)
        assertEquals(Vakit.IMSAK, d.siradaki)
        val yarin = VakitHesabi.hesapla(lat, lng, LocalDate.parse("2026-10-14"))
        assertEquals(yarin.imsak, d.siradakiMs)
    }

    @Test
    fun vaktinGirdigiAnAktifOlur() {
        val v = VakitHesabi.hesapla(lat, lng, LocalDate.parse("2026-10-13"))
        val d = PanoHesabi.hesapla(v.ogle, ist) { VakitHesabi.hesapla(lat, lng, it) }
        assertEquals(Vakit.OGLE, d.aktif)
        assertEquals(Vakit.IKINDI, d.siradaki)
    }

    @Test
    fun cumaGunuOgleCumaDiyeOkunur() {
        val d = durum("2026-10-16T10:00:00") // Cuma
        assertTrue(d.cuma)
        assertEquals("Cuma", d.gorunenAd(Vakit.OGLE))
        assertEquals("İkindi", d.gorunenAd(Vakit.IKINDI))
        assertEquals("Öğle", durum("2026-10-15T10:00:00").gorunenAd(Vakit.OGLE))
    }

    @Test
    fun kerahatSinirlariIkiUctaDahil() {
        val v = VakitHesabi.hesapla(lat, lng, LocalDate.parse("2026-10-13"))
        val f = { ms: Long -> PanoHesabi.hesapla(ms, ist) { VakitHesabi.hesapla(lat, lng, it) } }
        assertEquals(Kerahat.Tur.SURUK, f(v.gunes).kerahat?.tur)
        assertEquals(Kerahat.Tur.SURUK, f(v.gunes + 20 * 60_000L).kerahat?.tur)
        assertNull(f(v.gunes + 20 * 60_000L + 1).kerahat)
        assertNull(f(v.gunes - 1).kerahat)
        assertEquals(Kerahat.Tur.ISTIVA, f(v.ogle - 5 * 60_000L).kerahat?.tur)
        assertEquals(Kerahat.Tur.ISTIVA, f(v.ogle).kerahat?.tur)
        assertEquals(Kerahat.Tur.GURUB, f(v.aksam - 20 * 60_000L).kerahat?.tur)
        assertNull(f(v.aksam + 1).kerahat)
        // Sıradaki kerahat: öğleden önce istiva, akşamdan sonra yok.
        assertEquals(Kerahat.Tur.ISTIVA, f(v.gunes + 60 * 60_000L).siradakiKerahat?.tur)
        assertNull(f(v.aksam + 1).siradakiKerahat)
    }

    @Test
    fun bicimler() {
        assertEquals("05:09", Bicim.geriSayim(309_999))
        assertEquals("2:05:09", Bicim.geriSayim(2 * 3_600_000L + 309_000))
        assertEquals("00:00", Bicim.geriSayim(-5))
        assertEquals("13 Ekim 2026, Salı", Bicim.tarih(LocalDate.parse("2026-10-13")))
        assertEquals("16 Ekim 2026, Cuma", Bicim.tarih(LocalDate.parse("2026-10-16")))
        assertEquals("16:30", Bicim.saat(an("2026-10-13T16:30:07"), ist))
        assertEquals("07", Bicim.saniye(an("2026-10-13T16:30:07"), ist))
    }

    @Test
    fun kaydirmaSekizDakikadaDoner() {
        assertEquals(0 to 0, Kaydirma.ofset(0))
        assertEquals(Kaydirma.ofset(0), Kaydirma.ofset(8 * 60_000L))
        assertEquals(6 to 0, Kaydirma.ofset(60_000L))
        // Bir dakika içinde sabit kalır.
        assertEquals(Kaydirma.ofset(60_000L), Kaydirma.ofset(119_999L))
    }
}
