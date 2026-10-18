package expo.modules.googleyetki.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class YetkiKurallariTest {

    @Test
    fun bosSlotHerZamanAlinir() {
        assertTrue(YetkiKurallari.slotDevralinabilirMi(dolu = false, gecenMs = 0))
    }

    @Test
    fun taziDoluSlotMesgulVerir() {
        assertFalse(YetkiKurallari.slotDevralinabilirMi(dolu = true, gecenMs = 60_000))
        assertFalse(YetkiKurallari.slotDevralinabilirMi(dolu = true, gecenMs = YetkiKurallari.BAYAT_SLOT_MS - 1))
    }

    @Test
    fun sonucuGelmeyenSlotOnDakikadaDevralinir() {
        assertTrue(YetkiKurallari.slotDevralinabilirMi(dolu = true, gecenMs = YetkiKurallari.BAYAT_SLOT_MS))
    }

    @Test
    fun durumKodlari() {
        assertEquals("iptal", YetkiKurallari.durumKodu(16))
        assertEquals("cozumGerekli", YetkiKurallari.durumKodu(4))
        assertEquals("agYok", YetkiKurallari.durumKodu(7))
        assertEquals("agYok", YetkiKurallari.durumKodu(15))
        assertEquals("agYok", YetkiKurallari.durumKodu(14))
        assertNull(YetkiKurallari.durumKodu(10)) // DEVELOPER_ERROR → genel hata
        assertNull(YetkiKurallari.durumKodu(null))
    }
}
