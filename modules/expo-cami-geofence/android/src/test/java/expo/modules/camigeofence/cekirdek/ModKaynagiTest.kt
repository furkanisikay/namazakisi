package expo.modules.camigeofence.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * NÖBETÇİ: Rahatsız Etmeyin üst süreden fazla açık KALAMAZ. Üst süre alarmı
 * silinse bile (force-stop, OEM uyku kısıtı) bir sonraki değerlendirme kaynağı
 * düşürür; bitişi bilinmeyen kaynak hiç geçerli sayılmaz.
 */
class ModKaynagiTest {
    private val dk = CamiSabitleri.DAKIKA_MS
    private val t0 = 1_760_000_000_000L

    @Test
    fun bitisOncesiGecerliSonrasiGecersiz() {
        val bitis = t0 + 90 * dk
        assertTrue(ModKaynagi.gecerliMi(t0, bitis))
        assertTrue(ModKaynagi.gecerliMi(bitis - 1, bitis))
        assertFalse(ModKaynagi.gecerliMi(bitis, bitis))
        assertFalse(ModKaynagi.gecerliMi(bitis + 3 * 60 * dk, bitis))
    }

    @Test
    fun bitisiBilinmeyenKaynakGecersiz() {
        assertFalse(ModKaynagi.gecerliMi(t0, null))
        assertFalse(ModKaynagi.gecerliMi(t0, 0L))
        assertFalse(ModKaynagi.gecerliMi(t0, -5L))
    }

    @Test
    fun istenenBitisTavanaKirpilir() {
        assertEquals(t0 + 90 * dk, ModKaynagi.bitisHesapla(t0, t0 + 90 * dk))
        assertEquals(t0 + ModKaynagi.AZAMI_SURE_MS, ModKaynagi.bitisHesapla(t0, t0 + 24 * 60 * dk))
        // Tavan cuma camide üst süresini (150 dk) KESMEZ.
        assertTrue(ModKaynagi.AZAMI_SURE_MS >= CamiSabitleri.CAMIDE_CUMA_AZAMI_DK * dk)
    }

    @Test
    fun yalnizSuresiGecenlerDuser() {
        val kaynaklar = mapOf("cami" to t0 - 1, "plan" to t0 + 10 * dk, "eski" to null)
        assertEquals(setOf("cami", "eski"), ModKaynagi.suresiGecenler(t0, kaynaklar))
        assertEquals(emptySet<String>(), ModKaynagi.suresiGecenler(t0, mapOf("plan" to t0 + dk)))
    }
}
