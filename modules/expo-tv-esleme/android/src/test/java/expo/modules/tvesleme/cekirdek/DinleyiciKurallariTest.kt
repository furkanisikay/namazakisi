package expo.modules.tvesleme.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DinleyiciKurallariTest {
    private val k = DinleyiciKurallari

    @Test
    fun yalnizPostVeBilinenYol() {
        assertEquals(DinleyiciKurallari.Istek("/esitle", 120), k.baslikCoz("POST /esitle HTTP/1.1\r\nHost: x\r\ncontent-length: 120"))
        assertNull(k.baslikCoz("GET /esitle HTTP/1.1\r\nContent-Length: 10"))
        assertNull(k.baslikCoz("POST /baska HTTP/1.1\r\nContent-Length: 10"))
        assertNull(k.baslikCoz("POST /esle HTTP/1.1\r\nHost: x"))
    }

    @Test
    fun govdeSiniri8Kb() {
        assertEquals(8192, k.baslikCoz("POST /esle HTTP/1.1\r\nContent-Length: 8192")?.uzunluk)
        assertNull(k.baslikCoz("POST /esle HTTP/1.1\r\nContent-Length: 8193"))
        assertNull(k.baslikCoz("POST /esle HTTP/1.1\r\nContent-Length: 0"))
    }

    @Test
    fun yalnizYerelEs() {
        fun ip(vararg b: Int) = ByteArray(b.size) { b[it].toByte() }
        assertTrue(k.yerelEsMi(ip(192, 168, 1, 5)))
        assertTrue(k.yerelEsMi(ip(10, 0, 0, 2)))
        assertTrue(k.yerelEsMi(ip(172, 20, 1, 1)))
        assertTrue(k.yerelEsMi(ip(127, 0, 0, 1)))
        assertFalse(k.yerelEsMi(ip(172, 32, 1, 1)))
        assertFalse(k.yerelEsMi(ip(8, 8, 8, 8)))
        // IPv4-eşlemeli IPv6
        assertTrue(k.yerelEsMi(ip(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 192, 168, 0, 9)))
        assertFalse(k.yerelEsMi(ip(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 1, 1, 1, 1)))
        // fe80::/10 ve fc00::/7
        assertTrue(k.yerelEsMi(ip(0xfe, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)))
        assertTrue(k.yerelEsMi(ip(0xfd, 0x12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)))
        assertFalse(k.yerelEsMi(ip(0x20, 0x01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)))
    }

    @Test
    fun yanitKoduSozlesme() {
        assertEquals(403, k.yanitKodu(403))
        assertEquals(503, k.yanitKodu(500))
        assertTrue(k.yanit(200, "{}").startsWith("HTTP/1.1 200 OK\r\n"))
        assertTrue(k.yanit(200, "ğ").contains("Content-Length: 2\r\n"))
    }

    /** Yavaş yazan eş bağlantıyı tutamaz: okuma süresi istek bütçesiyle kenetlenir. */
    @Test
    fun okumaSuresiToplamButceyleSinirli() {
        val sonAn = 100_000L + k.ISTEK_SURESI_MS
        assertEquals(k.TEK_OKUMA_MS, k.okumaSuresi(sonAn, 100_000L))
        assertEquals(1_000, k.okumaSuresi(sonAn, sonAn - 1_000))
        assertEquals(1, k.okumaSuresi(sonAn, sonAn - 1))
        // Bütçe bitti: 0 döner; çağıran kapatır (soTimeout=0 sonsuz bekleme olurdu).
        assertEquals(0, k.okumaSuresi(sonAn, sonAn))
        assertEquals(0, k.okumaSuresi(sonAn, sonAn + 60_000))
        // 4,9 sn'de bir bayt yollayan eş en çok iki okuma yapabilir (eskiden ~9 bin).
        assertTrue(k.ISTEK_SURESI_MS < 2L * k.TEK_OKUMA_MS)
    }
}
