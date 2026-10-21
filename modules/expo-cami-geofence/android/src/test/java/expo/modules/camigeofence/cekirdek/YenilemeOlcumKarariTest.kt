package expo.modules.camigeofence.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Denetim D-09: yenileme çemberinden çıkışta yeniden merkezleme artık BALANCED öncelikli
 * ve önbellek konumunu kabul eder. Sıkı döngü koruması (`yenilemeKarari`) aynen geçerli;
 * üstüne kaba konum elenir.
 */
class YenilemeOlcumKarariTest {
    private val simdi = 1_800_000_000_000L

    @Test
    fun tazelikPayiSozlesmeEsiginiAsmaz() {
        // Kabul edilen en yaşlı önbellek konumu, ölçüm tavanı sonunda bile taze sayılmalı.
        assertTrue(
            CamiSabitleri.YENILEME_KONUM_AZAMI_YAS_MS + CamiSabitleri.OLCUM_ZAMAN_ASIMI_MS < CamiSabitleri.KONUM_TAZELIK_MS,
        )
        val enYasli = simdi - CamiSabitleri.YENILEME_KONUM_AZAMI_YAS_MS
        val geriCagriAni = simdi + CamiSabitleri.OLCUM_ZAMAN_ASIMI_MS
        assertEquals("yenile", CamiKarar.yenilemeOlcumKarari(geriCagriAni, null, enYasli, 40.0))
    }

    @Test
    fun dogrulukTavaniCemberIcPayinaEsit() {
        assertEquals(CamiSabitleri.YENILEME_ICERI_PAY_M, CamiSabitleri.YENILEME_AZAMI_DOGRULUK_M, 0.0)
    }

    @Test
    fun yeterinceDogruKonumYenilenir() {
        assertEquals("yenile", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi - 5_000, 80.0))
        assertEquals("yenile", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi, CamiSabitleri.YENILEME_AZAMI_DOGRULUK_M))
    }

    @Test
    fun kabaYaDaBilinmeyenDogrulukElenir() {
        assertEquals("kabaKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi, 151.0))
        assertEquals("kabaKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi, 900.0))
        assertEquals("kabaKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi, null))
        assertEquals("kabaKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi, Double.NaN))
        assertEquals("kabaKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi, -1.0))
    }

    @Test
    fun tazelikVeSiklikKurallariDogruluktanOnceGelir() {
        // JS ikizli `yenilemeKarari` sonucu değişmeden döner (fikstür sözleşmesi korunur).
        assertEquals("bayatKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, null, 10.0))
        assertEquals("bayatKonum", CamiKarar.yenilemeOlcumKarari(simdi, null, simdi - 10 * 60_000, 10.0))
        assertEquals("cokSik", CamiKarar.yenilemeOlcumKarari(simdi, simdi - 1_000, simdi, 900.0))
    }
}
