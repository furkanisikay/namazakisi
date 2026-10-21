package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Denetim D-19: saat yükü önbelleksiz ayrıştırılıyor, aynı yük "değişti" sayılıyordu.
 * Sayaçlar ayrıştırma SAYISINI ölçer; çağrı adetleri gerçek çağrı yerlerinden alınmıştır.
 */
class YukOnbellegiTest {
    private fun ornek(ad: String = "ornek-yuk.json"): String =
        javaClass.classLoader!!.getResource(ad)!!.readText()

    private class Sayacli {
        var cozum = 0
        val onbellek = HamCozumOnbellegi { ham ->
            cozum++
            (YukCozucu.coz(ham) as? CozumSonucu.Basarili)?.yuk
        }
    }

    /**
     * `Hatirlatici.tetiklendi` (`depo.yuk()` ×4: köprü kararı, zincir kararı, uyandırma,
     * son dakikalar) + `MuhafizAlarmAlicisi` anons yeri (×1) = 5 okuma.
     */
    private val ALARM_TIKI_OKUMA = 5

    /**
     * Yük gelişi: `Hatirlatici.tazele` (×1) + 2 tile + 9 komplikasyon (`Senkron.yuzeyleriTazele`)
     * ≈ 12 okuma; `kaydet`'in kendi ayrıştırması ayrıca.
     */
    private val YUK_GELISI_OKUMA = 12

    @Test
    fun alarmTikindeYukBirKezAyristirilir() {
        val s = Sayacli()
        val ham = ornek()
        // Önceki davranış: her okuma bir ayrıştırma.
        val onceki = ALARM_TIKI_OKUMA
        repeat(ALARM_TIKI_OKUMA) { s.onbellek.al(ham) }
        assertEquals(1, s.cozum)
        assertTrue(s.cozum < onceki)
        // Süreç sıcakken sonraki tik HİÇ ayrıştırmaz.
        repeat(ALARM_TIKI_OKUMA) { s.onbellek.al(ham) }
        assertEquals(1, s.cozum)
    }

    @Test
    fun kaydedilenYukKonunca_yuzeyOkumalariAyristirmaz() {
        val s = Sayacli()
        val ham = ornek()
        val yuk = (YukCozucu.coz(ham) as CozumSonucu.Basarili).yuk // kaydet'in tek çözümü
        s.onbellek.koy(ham, yuk)
        repeat(YUK_GELISI_OKUMA) { assertSame(yuk, s.onbellek.al(ham)) }
        assertEquals(0, s.cozum)
    }

    @Test
    fun ayniIcerikliFarkliDizeOrnegiDeOnbellektenGelir() {
        val s = Sayacli()
        val ham = ornek()
        s.onbellek.al(ham)
        s.onbellek.al(String(ham.toCharArray())) // farklı örnek, aynı içerik
        assertEquals(1, s.cozum)
    }

    @Test
    fun yeniYukYenidenAyristirilir_eskiyeDonusDe() {
        val s = Sayacli()
        val v2 = ornek()
        val v1 = ornek("ornek-yuk-v1.json")
        s.onbellek.al(v2)
        s.onbellek.al(v1)
        s.onbellek.al(v2)
        assertEquals(3, s.cozum)
    }

    @Test
    fun gecersizVeNullGuvenli() {
        val s = Sayacli()
        assertNull(s.onbellek.al(null))
        assertNull(s.onbellek.al("bozuk"))
        assertNull(s.onbellek.al("bozuk"))
        assertEquals(1, s.cozum) // bozuk sonuç da önbellekte; tekrar denenmez
    }

    @Test
    fun ayniYukBekleyenVeBayrakDegismediyseYazilmaz() {
        val yuk = (YukCozucu.coz(ornek()) as CozumSonucu.Basarili).yuk
        val k = YukKayitKarari.ayniYuk(yuk, emptySet(), guncellemeGerekli = false)
        assertFalse(k.yaz)
    }

    @Test
    fun ayniYukGuncellemeBayraginiSondurur() {
        val yuk = (YukCozucu.coz(ornek()) as CozumSonucu.Basarili).yuk
        assertTrue(YukKayitKarari.ayniYuk(yuk, emptySet(), guncellemeGerekli = true).yaz)
    }

    @Test
    fun ayniYukZatenKilinmisBekleyeniAyiklar() {
        val yuk = (YukCozucu.coz(ornek()) as CozumSonucu.Basarili).yuk
        // ornek-yuk.json: ikinci günün imsak'ı kılınmış → bekleyen düşer, yazım gerekir.
        val kimlik = VakitHesabi.kimlik(yuk.gunler[1].tarih, "imsak")
        val k = YukKayitKarari.ayniYuk(yuk, setOf(kimlik), guncellemeGerekli = false)
        assertTrue(k.yaz)
        assertEquals(emptySet<String>(), k.bekleyen)
    }

    @Test
    fun ayniYukKilinmamisBekleyeniKorurVeYazmaz() {
        val yuk = (YukCozucu.coz(ornek()) as CozumSonucu.Basarili).yuk
        val kimlik = VakitHesabi.kimlik(yuk.gunler[1].tarih, "ogle") // 2. gün: yalnız imsak kılınmış
        val k = YukKayitKarari.ayniYuk(yuk, setOf(kimlik), guncellemeGerekli = false)
        assertFalse(k.yaz)
        assertEquals(setOf(kimlik), k.bekleyen)
    }

    @Test
    fun sonGosterilenGocu() {
        assertEquals(5L, YukKayitKarari.sonGosterilen(yeni = 5L, eski = 9L))
        assertEquals(9L, YukKayitKarari.sonGosterilen(yeni = null, eski = 9L))
        assertEquals(0L, YukKayitKarari.sonGosterilen(yeni = null, eski = null))
    }
}
