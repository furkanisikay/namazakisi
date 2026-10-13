package expo.modules.camigeofence.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * NÖBETÇİ: 15 dk görevi bayat koordinatla taze merkezi EZMEZ, gereksiz yere
 * yeniden kayıt yapmaz ve periyodik yolda başlangıç DWELL tetiği vermez.
 */
class IzlemeKarariTest {
    // Kadıköy civarı; ~1,1 km kuzeyi ve ~20 km uzağı.
    private val merkez = YenilemeMerkezi(40.990, 29.030, 2000.0, taze = true)
    private val yakinLat = 41.000
    private val yakinLng = 29.030
    private val uzakLat = 41.170
    private val uzakLng = 29.030

    @Test
    fun olayYoluDaimaTazeYeniMerkez() {
        val s = IzlemeKarari.merkezSec(merkez, uzakLat, uzakLng, IzlemeKipi.OLAY, kayitCanli = true)
        assertEquals(uzakLat, s.lat, 0.0)
        assertTrue(s.taze)
        assertFalse(s.mevcutKorundu)
    }

    @Test
    fun bayatKoordinatCanliTazeMerkeziEzmez() {
        // Sıkı döngünün kaynağı: JS her 15 dk'da şehir koordinatını yollar.
        val s = IzlemeKarari.merkezSec(merkez, uzakLat, uzakLng, IzlemeKipi.PERIYODIK, kayitCanli = true)
        assertEquals(merkez.lat, s.lat, 0.0)
        assertTrue(s.taze)
        assertTrue(s.mevcutKorundu)
        // Ayar değişimi (KURULUM) de taze merkezi bayat koordinatla ezmez.
        assertTrue(IzlemeKarari.merkezSec(merkez, uzakLat, uzakLng, IzlemeKipi.KURULUM, kayitCanli = true).mevcutKorundu)
    }

    @Test
    fun bayatMerkezCemberIcindekiKoordinatlaKaydirilmaz() {
        val bayat = merkez.copy(taze = false)
        val s = IzlemeKarari.merkezSec(bayat, yakinLat, yakinLng, IzlemeKipi.PERIYODIK, kayitCanli = true)
        assertTrue(s.mevcutKorundu)
        assertFalse(s.taze)
    }

    @Test
    fun bayatMerkezCemberDisindakiKoordinataTasinir() {
        val bayat = merkez.copy(taze = false)
        val s = IzlemeKarari.merkezSec(bayat, uzakLat, uzakLng, IzlemeKipi.PERIYODIK, kayitCanli = true)
        assertFalse(s.mevcutKorundu)
        assertEquals(uzakLat, s.lat, 0.0)
        assertFalse(s.taze)
    }

    @Test
    fun kayitOlmusseTazelikGecersizYeniKoordinataKurulur() {
        // Force-stop / reboot: kayıt yok → "hâlâ içerdesiniz" garantisi de yok.
        val s = IzlemeKarari.merkezSec(merkez, uzakLat, uzakLng, IzlemeKipi.PERIYODIK, kayitCanli = false)
        assertFalse(s.mevcutKorundu)
        assertFalse(s.taze)
        assertEquals(uzakLat, s.lat, 0.0)
    }

    @Test
    fun merkezYoksaYeniKoordinat() {
        val s = IzlemeKarari.merkezSec(null, yakinLat, yakinLng, IzlemeKipi.PERIYODIK, kayitCanli = true)
        assertEquals(yakinLat, s.lat, 0.0)
        assertFalse(s.mevcutKorundu)
    }

    private fun yer(id: String, alan: Double? = null) = IzlenenYer(id, id, 41.0, 29.0, 20.0, null, alan, "osm", false)

    @Test
    fun imzaSiradanBagimsizAlanaDuyarli() {
        val a = IzlemeKarari.imza(listOf(yer("osm:n1"), yer("osm:n2")))
        assertEquals(a, IzlemeKarari.imza(listOf(yer("osm:n2"), yer("osm:n1"))))
        assertNotEquals(a, IzlemeKarari.imza(listOf(yer("osm:n2"), yer("osm:n1", alan = 140.0))))
        assertNotEquals(a, IzlemeKarari.imza(listOf(yer("osm:n1"))))
    }

    @Test
    fun periyodikYoldaDegisiklikYoksaDokunulmaz() {
        val korundu = MerkezSecimi(merkez.lat, merkez.lng, true, mevcutKorundu = true)
        val imza = listOf("osm:n1|100")
        assertTrue(IzlemeKarari.dokunmaMi(IzlemeKipi.PERIYODIK, true, korundu, imza, imza))
        // Küme değiştiyse, kayıt ölmüşse ya da merkez taşındıysa kurulur.
        assertFalse(IzlemeKarari.dokunmaMi(IzlemeKipi.PERIYODIK, true, korundu, imza, listOf("osm:n2|100")))
        assertFalse(IzlemeKarari.dokunmaMi(IzlemeKipi.PERIYODIK, false, korundu, imza, imza))
        assertFalse(IzlemeKarari.dokunmaMi(IzlemeKipi.PERIYODIK, true, korundu.copy(mevcutKorundu = false), imza, imza))
        // Ayar değişimi daima kurar.
        assertFalse(IzlemeKarari.dokunmaMi(IzlemeKipi.KURULUM, true, korundu, imza, imza))
    }

    @Test
    fun periyodikYoldaBaslangicDwellYok() {
        assertFalse(IzlemeKarari.camiBaslangicDwell(IzlemeKipi.PERIYODIK))
        assertTrue(IzlemeKarari.camiBaslangicDwell(IzlemeKipi.KURULUM))
        assertTrue(IzlemeKarari.camiBaslangicDwell(IzlemeKipi.OLAY))
    }

    @Test
    fun camiTuruKapiKapaliykenGunVeYereBaglidir() {
        assertEquals("cami:2026-10-13_ogle", IzlemeKarari.camiTuru("2026-10-13", "ogle", "2026-10-13", "osm:n1"))
        val bugunA = IzlemeKarari.camiTuru(null, null, "2026-10-13", "osm:n1")
        assertEquals("cami:2026-10-13_serbest_osm:n1", bugunA)
        // Ertesi gün ve başka cami ayrı tur → bir kez elle kapatmak kalıcı susturmaz.
        assertNotEquals(bugunA, IzlemeKarari.camiTuru(null, null, "2026-10-14", "osm:n1"))
        assertNotEquals(bugunA, IzlemeKarari.camiTuru(null, null, "2026-10-13", "osm:w7"))
        assertFalse(bugunA.contains("?"))
    }
}
