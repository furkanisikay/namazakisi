package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.TimeZone

class WidgetGorunumuTest {

    private val ist = TimeZone.getTimeZone("Europe/Istanbul")
    private val saat: (Long) -> String = { saatMetni(it, ist) }

    private val ogle = VakitAni("ogle", 1782036660000L, "2026-06-21") // 13:11
    private val ikindiGirisi = 1782051060000L // 17:11
    private val kilinabilirOgle = VakitDurumu(ogle, ikindiGirisi, VakitAni("ikindi", ikindiGirisi, "2026-06-21"))

    @Test
    fun duzenBoyutaGoreSecilir() {
        assertEquals(WidgetDuzeni.KUCUK, WidgetDuzenSecici.sec(57f, 57f))
        assertEquals(WidgetDuzeni.KUCUK, WidgetDuzenSecici.sec(300f, 60f)) // geniş ama alçak
        assertEquals(WidgetDuzeni.ORTA, WidgetDuzenSecici.sec(130f, 130f))
        assertEquals(WidgetDuzeni.GENIS, WidgetDuzenSecici.sec(260f, 120f))
    }

    @Test
    fun ayarGidisDonusKorunur() {
        val a = WidgetAyari(WidgetZemini.KOYU, 60, SureGosterimi.BITIS, false)
        assertEquals(a, WidgetAyari.coz(a.kodla()))
    }

    @Test
    fun bozukAyarVarsayilanaDuser() {
        assertEquals(WidgetAyari(), WidgetAyari.coz(null))
        assertEquals(WidgetAyari(), WidgetAyari.coz("bozuk"))
        assertEquals(WidgetAyari.MIN_OPAKLIK, WidgetAyari.coz("acik|0|kalan|1").opaklik)
    }

    @Test
    fun seffafZemindeAlfaSifir() {
        assertEquals(0, WidgetAyari(zemin = WidgetZemini.SEFFAF, opaklik = 100).zeminAlfasi())
        assertEquals(255, WidgetAyari(opaklik = 100).zeminAlfasi())
        assertEquals(128, WidgetAyari(opaklik = 50).zeminAlfasi())
    }

    @Test
    fun kildimDurumOnceligiKilindiBekliyorKilinabilir() {
        val kilinan = mapOf("2026-06-21" to setOf("ogle"))
        val bekleyen = setOf("2026-06-21_ogle")
        assertEquals(KildimDurumu.KILINDI, KildimDurumKarari.hesapla(kilinabilirOgle, kilinan, bekleyen))
        assertEquals(KildimDurumu.BEKLIYOR, KildimDurumKarari.hesapla(kilinabilirOgle, emptyMap(), bekleyen))
        assertEquals(KildimDurumu.KILINABILIR, KildimDurumKarari.hesapla(kilinabilirOgle, emptyMap(), emptySet()))
        assertEquals(KildimDurumu.YOK, KildimDurumKarari.hesapla(VakitDurumu(null, null, ogle), emptyMap(), emptySet()))
    }

    @Test
    fun sabahBekleyeniImsakKimligiyleEslesir() {
        val sabah = VakitDurumu(VakitAni("sabah", 1L, "2026-06-21"), 2L, null)
        assertEquals(KildimDurumu.BEKLIYOR, KildimDurumKarari.hesapla(sabah, emptyMap(), setOf("2026-06-21_imsak")))
    }

    @Test
    fun yalnizSuAnkiVakitIsaretlenebilir() {
        assertTrue(KildimDurumKarari.dokunusGecerliMi(kilinabilirOgle, "2026-06-21", "ogle"))
        // Ekran kapalıyken bayatlamış çizim: dokunuş eski vakti işaretleyemez.
        assertFalse(KildimDurumKarari.dokunusGecerliMi(kilinabilirOgle, "2026-06-21", "sabah"))
        assertFalse(KildimDurumKarari.dokunusGecerliMi(kilinabilirOgle, "2026-06-20", "ogle"))
        assertFalse(KildimDurumKarari.dokunusGecerliMi(VakitDurumu(null, null, ogle), "2026-06-21", "ogle"))
    }

    @Test
    fun kutuKilinabilirVakitteDokunulabilirVeCikisiYazar() {
        val g = KutuGorunumKarari.hesapla(kilinabilirOgle, KildimDurumu.KILINABILIR, saat)
        assertEquals("Öğle", g.etiket)
        assertEquals("Çıkış 17:11", g.altEtiket)
        assertEquals(KutuDurumu.PASIF, g.durum)
        assertTrue(g.tiklanabilir)
    }

    @Test
    fun kutuKilindiysaAktif() {
        val g = KutuGorunumKarari.hesapla(kilinabilirOgle, KildimDurumu.KILINDI, saat)
        assertEquals(KutuDurumu.AKTIF, g.durum)
        assertFalse(g.tiklanabilir)
    }

    @Test
    fun kutuGunesOgleArasindaSiradakiniGosterirDokunulamaz() {
        val g = KutuGorunumKarari.hesapla(VakitDurumu(null, null, ogle), KildimDurumu.YOK, saat)
        assertEquals("Öğle", g.etiket)
        assertEquals("Giriş 13:11", g.altEtiket)
        assertEquals(KutuDurumu.KULLANILAMAZ, g.durum)
        assertFalse(g.tiklanabilir)
    }

    @Test
    fun kutuVeriYoksaUygulamayiAcmayiSoyler() {
        val g = KutuGorunumKarari.hesapla(VakitDurumu(null, null, null), KildimDurumu.YOK, saat)
        assertEquals(KutuDurumu.KULLANILAMAZ, g.durum)
        assertEquals("Uygulamayı açın", g.altEtiket)
    }

    @Test
    fun gorunenAdlarSabitHaritadan() {
        assertEquals("İkindi", VakitKodlari.gorunenAd("ikindi"))
        assertEquals("imsak", VakitKodlari.kuyrukVakti("sabah"))
        assertEquals("sabah", VakitKodlari.widgetKodu("imsak"))
        assertEquals(null, VakitKodlari.kuyrukVakti("gunes"))
    }
}
