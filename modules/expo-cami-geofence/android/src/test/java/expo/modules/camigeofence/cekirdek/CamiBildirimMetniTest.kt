package expo.modules.camigeofence.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * "Camidesiniz" bildirim başlığı Samsung Rutinler anahtar kelimesidir (issue #278).
 * Önek değişirse kullanıcıların kurduğu rutinler sessizce çalışmaz.
 */
class CamiBildirimMetniTest {
    @Test
    fun baslikSabitOnekleBaslar() {
        assertEquals("Camidesiniz", CamiSabitleri.CAMIDESINIZ_BASLIK_ONEKI)
        assertEquals("Camidesiniz · Kare Camii", CamiSabitleri.camidesinizBasligi("Kare Camii"))
        assertEquals("Camidesiniz · Cami", CamiSabitleri.camidesinizBasligi(" "))
        assertTrue(CamiSabitleri.camidesinizBasligi("Mescit").startsWith(CamiSabitleri.CAMIDESINIZ_BASLIK_ONEKI))
    }
}
