package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `MuhafizPlanKimligi` — JS `core/muhafiz/planKimligi.ts` ile AYNI örnek dosyayı
 * doğrular (`src/test/resources/muhafiz-plan-kimligi-ornekleri.json`).
 */
class MuhafizPlanKimligiTest {

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("muhafiz-plan-kimligi-ornekleri.json")) { "ornek dosya yok" }.readText()
    )

    private fun JSONObject.uzunVeyaNull(ad: String): Long? = if (isNull(ad)) null else getLong(ad)

    @Test
    fun kimliklerJsIleAyni() {
        val d = ornek.getJSONArray("kimlikler")
        assertTrue(d.length() >= 5)
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            val k = o.getString("kimlik")
            assertEquals(k, o.getBoolean("planMi"), MuhafizPlanKimligi.planKimligiMi(k))
            assertEquals(k, o.uzunVeyaNull("kalanDk"), MuhafizPlanKimligi.kimliktenKalanDk(k))
            assertEquals(k, o.getBoolean("eskiErtelemeMi"), MuhafizPlanKimligi.eskiErtelemeKimligiMi(k))
        }
    }

    @Test
    fun eskiErteleEylemleriJsIleAyni() {
        val d = ornek.getJSONArray("eylemler")
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(o.getString("eylem"), o.getBoolean("eskiErteleMi"), MuhafizPlanKimligi.eskiErteleEylemiMi(o.getString("eylem")))
        }
        assertEquals(false, MuhafizPlanKimligi.eskiErteleEylemiMi(null))
    }
}
