package com.furkanisikay.namazakisi.saat.cekirdek

import org.json.JSONArray
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Telefonla parite: `kible-ornekleri.json` telefonun `adhan` `Qibla` hesabıyla üretildi
 * (`scripts/saat/kible-fikstur-uret.js`); jest `kibleParitesi.test.ts` aynı dosyayı
 * telefon tarafında doğrular.
 */
class KibleTest {
    private val ornekler: JSONArray =
        JSONArray(javaClass.classLoader!!.getResource("kible-ornekleri.json")!!.readText())

    @Test
    fun telefonunAcisiylaBirebir() {
        var denenen = 0
        for (i in 0 until ornekler.length()) {
            val o = ornekler.getJSONObject(i)
            val aci = Kible.aci(o.getDouble("lat"), o.getDouble("lng"))
            assertTrue("${o.getString("ad")}: sonlu", aci.isFinite())
            assertTrue("${o.getString("ad")}: [0,360)", aci >= 0.0 && aci < 360.0)
            // Kâbe'nin kendisi dejenere: atan2(0, ±ε) iki dilde 0 ya da 180 olabilir.
            if (o.optBoolean("dejenere")) continue
            assertEquals(o.getString("ad"), o.getDouble("aci"), aci, 1e-9)
            denenen++
        }
        assertTrue("en az on nokta karşılaştırılmalı", denenen >= 10)
    }

    @Test
    fun dereceSarmaAdhanIleAyni() {
        assertEquals(0.0, Kible.dereceSar(360.0), 0.0)
        assertEquals(359.0, Kible.dereceSar(-1.0), 0.0)
        assertEquals(10.0, Kible.dereceSar(730.0), 1e-12)
        assertEquals(180.0, Kible.dereceSar(180.0), 0.0)
    }
}
