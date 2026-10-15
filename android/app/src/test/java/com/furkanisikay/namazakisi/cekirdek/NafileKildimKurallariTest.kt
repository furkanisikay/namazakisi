package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * NÖBETÇİ (issue #273, #299 deseni): nafile bildirimindeki "Kıldım" yalnız O GÜNÜN O
 * NAFİLESİNİN hatırlatmalarını native olarak susturur; farz kimliklerine dokunmaz.
 */
class NafileKildimKurallariTest {
    private val k = NafileKildimKurallari
    private val kusluk = NafileKildimKurallari.Nafile("2026-10-13", "kusluk")

    @Test
    fun kildimYanitiKimliktenCozulur() {
        assertEquals(kusluk, k.kildimYaniti("kildim_action", "nafile_2026-10-13_kusluk_30"))
        assertEquals(
            NafileKildimKurallari.Nafile("2026-10-12", "teheccud"),
            k.kildimYaniti("kildim_action", "nafile_2026-10-12_teheccud_120"),
        )
        assertEquals(
            NafileKildimKurallari.Nafile("2026-10-13", "evvabin"),
            k.kildimYaniti("kildim_action", "nafile_2026-10-13_evvabin_5"),
        )
    }

    @Test
    fun baskaEylemVeBaskaBildirimNativeIslenmez() {
        assertNull(k.kildimYaniti("expo.modules.notifications.actions.DEFAULT", "nafile_2026-10-13_kusluk_30"))
        assertNull(k.kildimYaniti(null, "nafile_2026-10-13_kusluk_30"))
        assertNull(k.kildimYaniti("kildim_action", null))
        // Farz (muhafız) kimliği bu yola ASLA düşmez — o yol farz kaydı yazar.
        assertNull(k.kildimYaniti("kildim_action", "muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_25"))
        // Bilinmeyen tür, bozuk tarih, eksik parça.
        assertNull(k.kildimYaniti("kildim_action", "nafile_2026-10-13_israk_30"))
        assertNull(k.kildimYaniti("kildim_action", "nafile_13-10-2026_kusluk_30"))
        assertNull(k.kildimYaniti("kildim_action", "nafile_2026-10-13_kusluk"))
        assertNull(k.kildimYaniti("kildim_action", "nafile_2026-10-13_kusluk_"))
    }

    @Test
    fun onekJsIleAyni() {
        // JS `nafileKimlikOneki('2026-10-13', 'kusluk')` = 'nafile_2026-10-13_kusluk_'
        assertEquals("nafile_2026-10-13_kusluk_", k.onek(kusluk))
    }

    @Test
    fun yalnizAyniGununAyniNafilesiIptalEdilir() {
        val tumu = listOf(
            "nafile_2026-10-13_kusluk_30",
            "nafile_2026-10-13_kusluk_10",
            "nafile_2026-10-13_kusluk_30",
            "nafile_2026-10-13_evvabin_20",
            "nafile_2026-10-14_kusluk_30",
            "nafile_2026-10-13_teheccud_60",
            "muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45",
        )
        assertEquals(
            listOf("nafile_2026-10-13_kusluk_30", "nafile_2026-10-13_kusluk_10"),
            k.iptalEdilecekler(tumu, kusluk),
        )
        assertFalse(k.buNafileyeAitMi("nafile_2026-10-13_kuslukx_30", kusluk))
    }

    @Test
    fun kuyrukTekilVeSinirli() {
        val bir = k.ekle(emptyList(), "2026-10-13", "kusluk")!!
        assertEquals(listOf(NafileKildimKurallari.Oge("2026-10-13_kusluk", "2026-10-13", "kusluk", 0)), bir)
        assertSame(bir, k.ekle(bir, "2026-10-13", "kusluk"))
        assertNull(k.ekle(bir, "2026-10-13", "ogle"))
        assertNull(k.ekle(bir, null, "kusluk"))

        var liste: List<NafileKildimKurallari.Oge> = emptyList()
        val tarihler = (0 until 40).map { "2026-%02d-%02d".format(1 + it / 28, 1 + it % 28) }
        for (t in tarihler) liste = k.ekle(liste, t, "teheccud")!!
        assertEquals(NafileKildimKurallari.MAKS_OGE, liste.size)
        // En eskiler düşer, en yeni korunur.
        assertEquals(tarihler.takeLast(NafileKildimKurallari.MAKS_OGE), liste.map { it.tarih })
    }

    @Test
    fun zehirliOgeBesDenemedeDuser() {
        var liste = k.ekle(emptyList(), "2026-10-13", "evvabin")!!
        repeat(NafileKildimKurallari.MAKS_DENEME - 1) { liste = k.basarisiz(liste, "2026-10-13_evvabin") }
        assertEquals(1, liste.size)
        liste = k.basarisiz(liste, "2026-10-13_evvabin")
        assertTrue(liste.isEmpty())
        assertTrue(k.tamamlandi(k.ekle(emptyList(), "2026-10-13", "evvabin")!!, "2026-10-13_evvabin").isEmpty())
    }
}
