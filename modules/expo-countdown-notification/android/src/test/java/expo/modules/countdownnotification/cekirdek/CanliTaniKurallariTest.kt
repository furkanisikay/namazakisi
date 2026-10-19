package expo.modules.countdownnotification.cekirdek

import expo.modules.countdownnotification.cekirdek.CanliTaniKurallari.GosterimKaydi
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CanliTaniKurallariTest {
    private val k = CanliTaniKurallari
    private val kayit = GosterimKaydi(
        zamanMs = 1_000L,
        id = "sayac_2026-10-19_ikindi",
        tema = "vakit",
        kanalId = "canli_sayac",
        kanalOnemi = 3,
        oneCikarilabilir = true,
        izinVar = true,
        oneCikarildi = null,
    )

    @Test
    fun bayrakOkunur() {
        val bayrak = 0x40000
        assertTrue(k.oneCikarildiMi(0x2 or bayrak, bayrak))
        assertFalse(k.oneCikarildiMi(0x2, bayrak))
        // Sabit okunamadıysa (0) asla "öne çıkarıldı" denmez.
        assertFalse(k.oneCikarildiMi(0x2, 0))
    }

    @Test
    fun kayitGidisDonusKayipsiz() {
        assertEquals(kayit, k.kaydiJsondanOku(k.kaydiJsonaCevir(kayit).toString()))
        val tam = kayit.copy(oneCikarildi = false, kanalOnemi = null, hata = "x")
        assertEquals(tam, k.kaydiJsondanOku(k.kaydiJsonaCevir(tam).toString()))
    }

    @Test
    fun bozukKayitNullDoner() {
        assertNull(k.kaydiJsondanOku(null))
        assertNull(k.kaydiJsondanOku("{"))
        assertNull(k.kaydiJsondanOku("""{"id":""}"""))
    }

    @Test
    fun bayrakSonradanIslenir() {
        assertEquals(kayit, k.bayrakIsle(kayit, null))
        assertEquals(true, k.bayrakIsle(kayit, true).oneCikarildi)
    }

    @Test
    fun taniJsonuAlanlari() {
        val o = JSONObject(
            k.taniJsonu(
                sdkInt = 36, sdkTam = 3_600_000, samsung = true, oneUi = "8.0", izinVar = true,
                planOlaySayisi = 3, sonrakiAlarmMs = 5_000L, sonPlanMs = 900L,
                gosterilenler = setOf("b", "a"), sonGosterim = kayit,
                aktifBildirimler = listOf("a" to false, "b" to null),
            )
        )
        assertEquals(36, o.getInt("sdkInt"))
        assertEquals(3_600_000, o.getInt("sdkTam"))
        assertEquals("8.0", o.getString("oneUi"))
        assertEquals(3, o.getInt("planOlaySayisi"))
        assertEquals("a", o.getJSONArray("gosterilenler").getString(0))
        assertEquals("canli_sayac", o.getJSONObject("sonGosterim").getString("kanalId"))
        assertFalse(o.getJSONArray("aktifBildirimler").getJSONObject(0).getBoolean("oneCikarildi"))
        assertTrue(o.getJSONArray("aktifBildirimler").getJSONObject(1).isNull("oneCikarildi"))
        val bos = JSONObject(
            k.taniJsonu(36, null, false, null, null, 0, null, null, emptyList(), null, emptyList())
        )
        assertTrue(bos.isNull("sdkTam"))
        assertTrue(bos.isNull("sonGosterim"))
    }

    @Test
    fun olcumGidisDonusVeTaniAlani() {
        val o = CanliTaniKurallari.Olcum(false, 42L)
        assertEquals(o, k.olcumOku(k.olcumJsonu(o)))
        assertNull(k.olcumOku("{}"))
        assertNull(k.olcumOku("{"))
        val t = JSONObject(
            k.taniJsonu(36, null, true, null, true, 0, null, null, emptyList(), null, emptyList(), true, o)
        )
        assertTrue(t.getBoolean("bayrakOkunabilir"))
        assertEquals(42L, t.getJSONObject("sonOlcum").getLong("olcumMs"))
        assertFalse(t.getJSONObject("sonOlcum").getBoolean("deger"))
        // Varsayılanlar: okunamaz + ölçüm yok (eski çağıran güvenli tarafa düşer).
        val v = JSONObject(k.taniJsonu(36, null, false, null, null, 0, null, null, emptyList(), null, emptyList()))
        assertFalse(v.getBoolean("bayrakOkunabilir"))
        assertTrue(v.isNull("sonOlcum"))
    }

    @Test
    fun oneUiSurumuCozulur() {
        assertEquals("8.0", k.oneUiSurumu("80000"))
        assertEquals("6.1", k.oneUiSurumu("60101"))
        assertEquals("8.5", k.oneUiSurumu("80500"))
        assertNull(k.oneUiSurumu(""))
        assertNull(k.oneUiSurumu(null))
        assertEquals("abc", k.oneUiSurumu("abc"))
    }
}
