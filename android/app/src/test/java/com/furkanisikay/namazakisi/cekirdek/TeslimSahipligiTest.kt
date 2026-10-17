package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `TeslimSahipligi` — JS `core/muhafiz/teslimSahipligi.ts` ile AYNI örnek dosyayı doğrular
 * (`src/test/resources/teslim-sahipligi-ornekleri.json`). İkiz ayrışırsa JS teslimcisinin
 * "kendimiz" saydığı ile native iptalin sildiği farklı olur: muhafız turu yatışın anons ve
 * alarmlarını sessizce silerdi.
 */
class TeslimSahipligiTest {

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("teslim-sahipligi-ornekleri.json")) { "ornek dosya yok" }.readText()
    )

    @Test
    fun ornekJsIleAyni() {
        val liste = ornek.getJSONArray("ornekler")
        assertTrue(liste.length() >= 10)
        for (i in 0 until liste.length()) {
            val o = liste.getJSONObject(i)
            val k = o.getString("kimlik")
            assertEquals(k, o.getBoolean("muhafiz_plan"), TeslimSahipligi.eslesir(TeslimSahipligi.MUHAFIZ_PLAN, k))
            assertEquals(k, o.getBoolean("muhafiz_tumu"), TeslimSahipligi.eslesir(TeslimSahipligi.MUHAFIZ_TUMU, k))
            assertEquals(k, o.getBoolean("yatis"), TeslimSahipligi.eslesir(TeslimSahipligi.YATIS, k))
        }
    }

    @Test
    fun bilinmeyenSahipHicbirSeyleEslesmez() {
        val liste = ornek.getJSONArray("ornekler")
        val sahip = ornek.getString("bilinmeyenSahip")
        for (i in 0 until liste.length()) {
            assertFalse(TeslimSahipligi.eslesir(sahip, liste.getJSONObject(i).getString("kimlik")))
        }
    }

    @Test
    fun muhafizTuruYatisiSilmez() {
        // §4.6 nöbetçisi: plan kimliği yüklemi yatış kimliğini plan SAYMAZ.
        assertFalse(ErtelemeKurallari.planKimligiMi("muhafiz_2026-10-13_vakit_yatsi_yatis"))
        assertFalse(TeslimSahipligi.eslesir(TeslimSahipligi.MUHAFIZ_TUMU, "muhafiz_2026-10-13_vakit_yatsi_yatis_30"))
    }
}
