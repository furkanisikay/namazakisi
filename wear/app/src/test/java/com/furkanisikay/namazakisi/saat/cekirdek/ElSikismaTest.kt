package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger

/** NÖBETÇİ (inceleme bulgusu 6): TTS kurucu/onInit yarışında konuşma TAM bir kez başlar. */
class ElSikismaTest {
    @Test
    fun ikinciOlayBirKezIsaretlenir() {
        val e = ElSikisma()
        assertFalse(e.isaretle())
        assertTrue(e.isaretle())
        assertFalse(e.isaretle())
    }

    @Test
    fun esZamanliIkiOlaydaTamBirKazanan() {
        val havuz = Executors.newFixedThreadPool(2)
        repeat(200) {
            val e = ElSikisma()
            val kazanan = AtomicInteger(0)
            val basla = CountDownLatch(1)
            val bitti = CountDownLatch(2)
            repeat(2) {
                havuz.execute {
                    basla.await()
                    if (e.isaretle()) kazanan.incrementAndGet()
                    bitti.countDown()
                }
            }
            basla.countDown()
            bitti.await()
            assertEquals(1, kazanan.get())
        }
        havuz.shutdown()
    }

    @Test
    fun zamanAsimiTelefonlaAyni() {
        // Telefondaki AnonsReceiver zaman aşımı (14 sn) ile aynı; 9 sn soğuk TTS'i kesiyordu.
        assertEquals(14_000L, ElSikisma.ANONS_ZAMAN_ASIMI_MS)
    }
}
