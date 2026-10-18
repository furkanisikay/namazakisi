package expo.modules.countdownnotification.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CihazKurallariTest {
    @Test
    fun api36AltindaTamSurumYok() {
        assertNull(CihazKurallari.tamSurum(35) { error("okunmamali") })
    }

    @Test
    fun alanYoksaYutulur() {
        assertNull(CihazKurallari.tamSurum(36) { throw NoSuchFieldError("SDK_INT_FULL") })
    }

    @Test
    fun qpr2Okunur() {
        assertEquals(3600001, CihazKurallari.tamSurum(36) { 3600001 })
        // Anlamsız küçük değer kabul edilmez.
        assertNull(CihazKurallari.tamSurum(36) { 36 })
    }

    @Test
    fun alarmSesi() {
        assertNull(CihazKurallari.alarmSesiAcik(null))
        assertNull(CihazKurallari.alarmSesiAcik(-1))
        assertFalse(CihazKurallari.alarmSesiAcik(0)!!)
        assertTrue(CihazKurallari.alarmSesiAcik(4)!!)
    }
}
