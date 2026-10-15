package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Test

/** NÖBETÇİ: API 31+'da `setWindow` ≥10 dk'ya genişler → izin varsa tam alarm. */
class SinirAlarmiTest {
    @Test
    fun api31OncesiDaimaTam() {
        assertEquals(SinirAlarmi.Yontem.TAM, SinirAlarmi.yontem(30, tamAlarmIzniVar = false))
        assertEquals(SinirAlarmi.Yontem.TAM, SinirAlarmi.yontem(24, tamAlarmIzniVar = false))
    }

    @Test
    fun api31SonrasiIzneBagli() {
        assertEquals(SinirAlarmi.Yontem.TAM, SinirAlarmi.yontem(31, tamAlarmIzniVar = true))
        assertEquals(SinirAlarmi.Yontem.TAM, SinirAlarmi.yontem(36, tamAlarmIzniVar = true))
        assertEquals(SinirAlarmi.Yontem.PENCERE, SinirAlarmi.yontem(31, tamAlarmIzniVar = false))
    }
}
