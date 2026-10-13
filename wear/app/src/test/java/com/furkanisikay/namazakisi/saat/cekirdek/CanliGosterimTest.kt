package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Now Bar seçimi saatte (issue #282 ikinci aşama): telefonla AYNI seçim, aynı anda
 * TEK canlı sayaç. Ortak örnek yükte `canli` alanı JS testiyle birlikte doğrulanır.
 */
class CanliGosterimTest {
    private val dk = 60_000L
    private val ornek = (YukCozucu.coz(
        javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
    ) as CozumSonucu.Basarili).yuk
    private val bugun = ornek.gunler[1]
    private fun v(ad: String) = bugun.vakitler.getValue(ad)

    private fun kayit(vakit: String, ms: Long) = PlanKaydi(
        id = "muhafiz_${bugun.tarih}_vakit_${vakit}_$ms", ms = ms, tarih = bugun.tarih, vakit = vakit,
        seviye = 1, baslik = "b", govde = "g", titresim = false, acil = false, adim = 0,
    )

    private fun pencere(oge: String, bas: Long, bitis: Long, oncelik: Int, vakit: String? = null) =
        CanliPencere(oge, "B $oge", oge, bas, bitis, oncelik, vakit?.let { bugun.tarih }, vakit)

    /** İkindi son dakikaları (muhafız planından) + iftar dilimi. */
    private fun yuk(secim: CanliSecim?) = ornek.copy(
        plan = listOf(kayit("ikindi", v("aksam") - 20 * dk)),
        canli = secim,
    )

    private val hepsiAcik = mapOf("imsak" to true, "ogle" to true, "ikindi" to true, "aksam" to true, "yatsi" to true)

    @Test
    fun ornekYukunCanliAlaniCozulur() {
        val c = ornek.canli!!
        assertFalse(c.vakitler.getValue("ogle"))
        assertEquals(listOf("iftar", "ogle"), c.pencereler.map { it.oge })
        assertEquals("ogle", c.pencereler[1].vakit)
        assertNull(c.pencereler[0].tarih)
    }

    @Test
    fun secimYoksaEskiDavranisSonDakikalarGosterilir() {
        val g = CanliGosterim.aktif(yuk(null), emptySet(), v("aksam") - 10 * dk)!!
        assertTrue(g.sonDakikalar)
        assertEquals("ikindi", g.vakit)
        assertNull(CanliGosterim.sonrakiSinir(yuk(null), v("aksam") - 10 * dk))
    }

    @Test
    fun vakitSecimiKapaliysaSonDakikalarGosterilmez() {
        val y = yuk(CanliSecim(hepsiAcik + ("ikindi" to false), emptyList()))
        assertNull(CanliGosterim.aktif(y, emptySet(), v("aksam") - 10 * dk))
    }

    @Test
    fun ayniAndaTekSayacVakitIftariYener() {
        val iftar = pencere("iftar", v("imsak"), v("aksam"), 2)
        val y = yuk(CanliSecim(hepsiAcik, listOf(iftar)))
        assertEquals("iftar", CanliGosterim.aktif(y, emptySet(), v("ogle"))!!.oge)
        // İkindinin son 20 dk'sı: vakit (öncelik 1) kazanır
        assertTrue(CanliGosterim.aktif(y, emptySet(), v("aksam") - 10 * dk)!!.sonDakikalar)
        // İkindi kılındıysa iftar geri gelir
        val bekleyen = setOf(VakitHesabi.kimlik(bugun.tarih, "ikindi"))
        assertEquals("iftar", CanliGosterim.aktif(y, bekleyen, v("aksam") - 10 * dk)!!.oge)
    }

    @Test
    fun kilinmisVaktinPencereDilimiGosterilmez() {
        val ogle = pencere("ogle", v("ogle"), v("ikindi"), 1, vakit = "ogle")
        val y = yuk(CanliSecim(hepsiAcik, listOf(ogle)))
        assertEquals("ogle", CanliGosterim.aktif(y, emptySet(), v("ogle") + dk)!!.vakit)
        val bekleyen = setOf(VakitHesabi.kimlik(bugun.tarih, "ogle"))
        assertNull(CanliGosterim.aktif(y, bekleyen, v("ogle") + dk))
    }

    @Test
    fun zincirDilimSinirlarindaUyanir() {
        val cuma = pencere("cuma", v("ogle") - 60 * dk, v("ogle"), 4)
        val y = yuk(CanliSecim(hepsiAcik, listOf(cuma)))
        assertEquals(v("ogle") - 60 * dk, CanliGosterim.sonrakiSinir(y, v("gunes")))
        assertEquals(v("ogle"), CanliGosterim.sonrakiSinir(y, v("ogle") - 30 * dk))
        // Son dakikaların bitişi de sınırdır (altındaki dilim yeniden gösterilsin)
        assertEquals(v("aksam"), CanliGosterim.sonrakiSinir(y, v("aksam") - 10 * dk))
    }

    @Test
    fun zincirCanliSinirPlandanOnceyseOraKurulur() {
        val kurulan = mutableListOf<Pair<Long, String>>()
        val kurucu = object : AlarmKurucu {
            override fun kesinKurulabilirMi() = true
            override fun kesinKur(ms: Long, kimlik: String) { kurulan += ms to kimlik }
            override fun yaklasikKur(ms: Long, kimlik: String) { kurulan += ms to kimlik }
            override fun iptal() { kurulan += -1L to "iptal" }
        }
        val z = ZincirYoneticisi(kurucu)
        val k = kayit("ikindi", 1_000L)
        z.kur(k, 500L)
        z.kur(k, 2_000L)
        z.kur(null, 700L)
        z.kur(null, null)
        assertEquals(
            listOf(500L to ZincirYoneticisi.CANLI_KIMLIK, 1_000L to k.id, 700L to ZincirYoneticisi.CANLI_KIMLIK, -1L to "iptal"),
            kurulan,
        )
    }
}
