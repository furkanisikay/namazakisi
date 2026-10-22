package expo.modules.countdownnotification.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.assertFalse
import org.junit.Test

class SesDosyasiKurallariTest {

    @Test
    fun bildirilenSesTuruKabulEdilir() {
        assertEquals("audio/mpeg", SesDosyasiKurallari.mimeCoz("audio/mpeg", "ezan.mp3"))
        assertEquals("audio/ogg", SesDosyasiKurallari.mimeCoz(" Audio/OGG ", null))
    }

    @Test
    fun sesDisiTurdeUzantiyaBakilir() {
        // Bulut saglayicilari ogg icin `application/ogg` bildirir.
        assertEquals("audio/ogg", SesDosyasiKurallari.mimeCoz("application/ogg", "Ezan.OGG"))
        assertEquals("audio/mpeg", SesDosyasiKurallari.mimeCoz("application/octet-stream", "kayit.mp3"))
        assertNull(SesDosyasiKurallari.mimeCoz("image/png", "resim.png"))
        assertNull(SesDosyasiKurallari.mimeCoz(null, "dosya"))
        assertNull(SesDosyasiKurallari.mimeCoz("audio/", null))
    }

    @Test
    fun uzantiOnceDosyaAdindan() {
        assertEquals("m4a", SesDosyasiKurallari.uzantiCoz("audio/mp4", "ezan.m4a"))
        assertEquals("mp3", SesDosyasiKurallari.uzantiCoz("audio/mpeg", "isimsiz"))
        assertEquals("mp3", SesDosyasiKurallari.uzantiCoz("audio/bilinmeyen", "x.exe"))
    }

    @Test
    fun sinirlar() {
        assertTrue(SesDosyasiKurallari.boyutGecerliMi(null))
        assertTrue(SesDosyasiKurallari.boyutGecerliMi(5_000_000))
        assertFalse(SesDosyasiKurallari.boyutGecerliMi(0))
        assertFalse(SesDosyasiKurallari.boyutGecerliMi(SesDosyasiKurallari.MAKS_BOYUT_BAYT + 1))

        assertEquals(SesDosyasiKurallari.Hata.BICIM, SesDosyasiKurallari.sureHatasi(null))
        assertEquals(SesDosyasiKurallari.Hata.BICIM, SesDosyasiKurallari.sureHatasi(50))
        assertNull(SesDosyasiKurallari.sureHatasi(3 * 60_000L))
        assertEquals(SesDosyasiKurallari.Hata.SURE, SesDosyasiKurallari.sureHatasi(SesDosyasiKurallari.MAKS_SURE_MS + 1))
    }

    @Test
    fun gorunenAdVeKayitAdi() {
        assertEquals("Öğle ezanı", SesDosyasiKurallari.gorunenAd("Öğle ezanı.mp3"))
        assertEquals("a b c", SesDosyasiKurallari.gorunenAd("a/b:c.wav"))
        assertEquals("Ses", SesDosyasiKurallari.gorunenAd(null))
        assertEquals("Ses", SesDosyasiKurallari.gorunenAd("   "))
        assertEquals(60, SesDosyasiKurallari.gorunenAd("x".repeat(100) + ".mp3").length)
        assertEquals(
            "Ezan_0123abcd.mp3",
            SesDosyasiKurallari.kayitAdi("Ezan.mp3", "0123abcdef9999", "mp3")
        )
    }
}
