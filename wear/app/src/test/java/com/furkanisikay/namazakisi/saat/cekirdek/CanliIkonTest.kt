package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class CanliIkonTest {
    @Test
    fun sonDakikalardaKumSaatliVakitSimgesi() {
        for (v in CanliIkon.CIKIYOR_VAKITLERI) assertEquals("cikiyor_$v", CanliIkon.anahtar(v, v, sonDakikalar = true))
        // Güneş farz değildir: "çıkıyor" simgesi yok, kendi simgesi.
        assertEquals("vakit_gunes", CanliIkon.anahtar("gunes", "gunes", sonDakikalar = true))
    }

    @Test
    fun vakitDisiOgelerAnlamliSimgeAlir() {
        assertEquals("cami", CanliIkon.anahtar("cuma", null, false))
        assertEquals("seri", CanliIkon.anahtar("seri", null, false))
        assertEquals("teheccud", CanliIkon.anahtar("teheccud", null, false))
        assertEquals("vakit_aksam", CanliIkon.anahtar("iftar", null, false))
        assertEquals("vakit_imsak", CanliIkon.anahtar("sahur", null, false))
        assertEquals("vakit_gunes", CanliIkon.anahtar("kusluk", null, false))
        assertEquals("vakit_aksam", CanliIkon.anahtar("evvabin", null, false))
        assertEquals("vakit_ogle", CanliIkon.anahtar("ogle", "ogle", false))
        assertEquals("vakit_yatsi", CanliIkon.anahtar("bilinmeyen", null, false))
    }

    @Test
    fun muhafizAcilUyarisiKumSaatli() {
        assertEquals("cikiyor_ikindi", CanliIkon.muhafiz("ikindi", acil = true))
        assertEquals("vakit_ikindi", CanliIkon.muhafiz("ikindi", acil = false))
    }

    /** Her anahtarın drawable dosyası VAR (eşleme `R.drawable` adına yapılır; eksik dosya derlemede değil çalışmada patlardı). */
    @Test
    fun herAnahtarinDrawableDosyasiVar() {
        val anahtarlar = CanliIkon.CIKIYOR_VAKITLERI.map { "cikiyor_$it" } +
            listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi").map { "vakit_$it" } +
            listOf("cami", "seri", "teheccud")
        for (a in anahtarlar) {
            assertTrue("eksik: ic_$a.xml", File("src/main/res/drawable/ic_$a.xml").exists())
        }
    }
}
