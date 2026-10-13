package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

class KildimKuyruguKurallariTest {

    private val k = KildimKuyruguKurallari

    @Test
    fun gecerliOgeKaynagiylaEklenir() {
        val l = k.ekle(emptyList(), "2026-10-13", "ogle", k.KAYNAK_WIDGET)!!
        assertEquals(listOf(KuyrukOgesi("2026-10-13_ogle", "2026-10-13", "ogle", "widget", 0)), l)
    }

    @Test
    fun gecersizOgeReddedilir() {
        assertNull(k.ekle(emptyList(), "13.10.2026", "ogle", k.KAYNAK_WIDGET))
        // Widget kodu 'sabah' kuyruğa GİRMEZ: kayıt katmanı 'imsak' bekler.
        assertNull(k.ekle(emptyList(), "2026-10-13", "sabah", k.KAYNAK_WIDGET))
        assertNull(k.ekle(emptyList(), "2026-10-13", "gunes", k.KAYNAK_KUTU))
        assertNull(k.ekle(emptyList(), null, "ogle", k.KAYNAK_KUTU))
        assertNull(k.ekle(emptyList(), "2026-10-13", "ogle", "bilinmeyen"))
    }

    @Test
    fun ayniVakitFarkliKaynaktanTekOgeKalir() {
        val l1 = k.ekle(emptyList(), "2026-10-13", "yatsi", k.KAYNAK_WEAR)!!
        val l2 = k.ekle(l1, "2026-10-13", "yatsi", k.KAYNAK_WIDGET)!!
        assertSame(l1, l2)
        assertEquals("wear", l2.single().kaynak)
    }

    @Test
    fun zehirliOgeBesDenemedeDuser() {
        var l = k.ekle(emptyList(), "2026-10-13", "aksam", k.KAYNAK_KUTU)!!
        repeat(KildimKuyruguKurallari.MAKS_DENEME - 1) { l = k.basarisiz(l, "2026-10-13_aksam") }
        assertEquals(4, l.single().deneme)
        l = k.basarisiz(l, "2026-10-13_aksam")
        assertTrue(l.isEmpty())
    }

    @Test
    fun tamamlananOgeCikar() {
        val l = k.ekle(k.ekle(emptyList(), "2026-10-13", "ogle", k.KAYNAK_WIDGET)!!, "2026-10-13", "ikindi", k.KAYNAK_KUTU)!!
        val sonuc = k.tamamlandi(l, "2026-10-13_ogle")
        assertEquals(setOf("2026-10-13_ikindi"), k.bekleyenKimlikler(sonuc))
        assertFalse(k.gecerliMi("2026-10-13", "imsak "))
        assertTrue(k.gecerliMi("2026-10-13", "imsak"))
    }
}
