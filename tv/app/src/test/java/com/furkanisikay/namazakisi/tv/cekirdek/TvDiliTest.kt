package com.furkanisikay.namazakisi.tv.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Test
import java.time.LocalDate
import java.time.ZoneId

/**
 * Pano çekirdek metinlerinin dili (W5): Türkçe varsayılan DEĞİŞMEDİ (eski testler aynı),
 * İngilizce karşılıklar JS sözlüğüyle (`src/core/dil/sozluk/en`) aynı terimleri kullanır.
 */
class TvDiliTest {
    private val sn = 1_000L
    private val dk = 60_000L
    private val sa = 3_600_000L
    private val bolge = ZoneId.of("Europe/Istanbul")
    private val gun = LocalDate.of(2026, 10, 21)
    private val v = VakitHesabi.hesapla(41.0082, 28.9784, gun)
    private fun pano(simdi: Long) = PanoHesabi.hesapla(simdi, bolge) { VakitHesabi.hesapla(41.0082, 28.9784, it) }
    private fun uye(haber: Long, ramazan: Boolean = false) =
        UyeHali("u1", DurumGoruntusu(null, null, null, emptyMap(), false, true, true, false, null, ramazan), haber)
    private val turkceHarf = Regex("[çğıöşüÇĞİÖŞÜ]")

    @Test
    fun turkceTabloEskiMetinlerleAyni_desteklenmeyenDilTurkceyeDuser() {
        for (vakit in Vakit.entries) assertEquals(vakit.ad, vakit.ad("tr"))
        for (t in Kerahat.Tur.entries) {
            assertEquals(t.ad, t.ad("tr"))
            assertEquals(t.aciklama, t.aciklama("tr"))
        }
        assertSame(TvDiliTr, tvDili("tr"))
        assertSame(TvDiliEn, tvDili("en"))
        assertSame(TvDiliTr, tvDili("xx"))
        assertEquals("13 Ekim 2026, Salı", Bicim.tarih(LocalDate.of(2026, 10, 13)))
        assertEquals(Bicim.kalanSesli(sa + 16 * dk), Bicim.kalanSesli(sa + 16 * dk, "tr"))
        assertEquals(EvDurumu.KABUL_DUASI, EvDurumu.kabulDuasi())
    }

    @Test
    fun ingilizceVakitAdlariTerimSozlugunden() {
        assertEquals(
            listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"),
            Vakit.entries.map { it.ad("en") },
        )
        // Cuma günü öğle satırı "Jumu'ah" (JS `vakit.cuma`).
        val cuma = VakitHesabi.hesapla(41.0082, 28.9784, LocalDate.of(2026, 10, 23))
        val p = pano(cuma.ogle + dk)
        assertEquals("Jumu'ah", p.gorunenAd(Vakit.OGLE, "en"))
        assertEquals("Cuma", p.gorunenAd(Vakit.OGLE))
        assertEquals("Asr", p.gorunenAd(Vakit.IKINDI, "en"))
    }

    @Test
    fun ingilizceTarihVeSure() {
        assertEquals("Tuesday, 13 October 2026", Bicim.tarih(LocalDate.of(2026, 10, 13), "en"))
        assertEquals(
            listOf(Bicim.SureParcasi("1", "h"), Bicim.SureParcasi("16", "min")),
            Bicim.kalanParcalari(sa + 16 * dk + 59 * sn, "en"),
        )
        assertEquals("18 min 05 s", Bicim.kalanKisa(18 * dk + 5 * sn, "en"))
        assertEquals("42 s", Bicim.kalanKisa(42 * sn, "en"))
        assertEquals("1 hour 16 minutes", Bicim.kalanSesli(sa + 16 * dk + 40 * sn, "en"))
        assertEquals("2 hours", Bicim.kalanSesli(2 * sa + 30 * sn, "en"))
        assertEquals("1 minute", Bicim.kalanSesli(dk + 30 * sn, "en"))
        assertEquals("less than 1 minute", Bicim.kalanSesli(42 * sn, "en"))
    }

    @Test
    fun ingilizceEvDurumu() {
        val t20 = v.aksam - 20 * dk
        assertEquals("Time for Asr is running short · 20 min", EvDurumu.bant(pano(t20), listOf(uye(t20 - 1000)), t20, "en"))
        assertEquals("May Allah accept it", EvDurumu.kabulDuasi("en"))
        val cuma = VakitHesabi.hesapla(41.0082, 28.9784, LocalDate.of(2026, 10, 23))
        assertEquals("Jumu'ah Mubarak", EvDurumu.selam(pano(cuma.ogle + dk), emptyList(), cuma.ogle + dk, "en"))
        val aksam = v.aksam + dk
        assertEquals("Blessed iftar", EvDurumu.selam(pano(aksam), listOf(uye(aksam, ramazan = true)), aksam, "en"))
    }

    /** Ramazan sayacının kimliği metinden bağımsızdır (simge `SayacTuru`'ndan seçilir). */
    @Test
    fun ramazanSayaciKimligiVeIngilizceBaslik() {
        val yarin = VakitHesabi.hesapla(41.0082, 28.9784, gun.plusDays(1))
        assertEquals(EvDurumu.SayacTuru.SAHUR, EvDurumu.ramazanSayacTuru(v, v.imsak - 1))
        assertEquals(EvDurumu.SayacTuru.IFTAR, EvDurumu.ramazanSayacTuru(v, v.ogle))
        assertEquals(EvDurumu.SayacTuru.SAHUR, EvDurumu.ramazanSayacTuru(v, v.aksam + 1))
        assertEquals(EvDurumu.Sayac("Time left until iftar", v.aksam), EvDurumu.ramazanSayaci(v, yarin.imsak, v.ogle, "en"))
        assertEquals(EvDurumu.Sayac("Time left for suhoor", yarin.imsak), EvDurumu.ramazanSayaci(v, yarin.imsak, v.aksam + 1, "en"))
        // Tür ile başlık aynı kuraldan: iftar başlığı yalnız IFTAR türünde.
        for (an in listOf(v.imsak - 1, v.imsak, v.ogle, v.aksam - 1, v.aksam, v.aksam + 1)) {
            val iftar = EvDurumu.ramazanSayaci(v, yarin.imsak, an).baslik == "İftara kalan"
            assertEquals(iftar, EvDurumu.ramazanSayacTuru(v, an) == EvDurumu.SayacTuru.IFTAR)
        }
    }

    @Test
    fun ingilizceKerahat() {
        assertEquals(listOf("Sunrise", "Zenith", "Sunset"), Kerahat.Tur.entries.map { it.ad("en") })
        for (t in Kerahat.Tur.entries) assertFalse(turkceHarf.containsMatchIn(t.aciklama("en")))
    }

    /** İngilizce çıktılarda Türkçe harf kalmaz (yarım dil yok). */
    @Test
    fun ingilizceCiktidaTurkceHarfYok() {
        val en = TvDiliEn
        val metinler = Vakit.entries.map { en.vakitAdi(it) } + en.aylar + en.gunler + listOf(
            en.cuma, en.birimSa, en.birimDk, en.birimSn, en.birDakikadanAz, en.kabulDuasi, en.iftarSelami,
            en.cumaSelami, en.sahuraKalan, en.iftaraKalan, en.bant("Asr", 5),
        )
        for (m in metinler) assertFalse(m, turkceHarf.containsMatchIn(m))
    }
}
