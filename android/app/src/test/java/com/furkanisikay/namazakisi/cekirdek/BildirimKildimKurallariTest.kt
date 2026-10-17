package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** NÖBETÇİ (issue #299): bildirimdeki "Kıldım" yalnız O VAKTİN uyarılarını native olarak susturur. */
class BildirimKildimKurallariTest {
    private val k = BildirimKildimKurallari
    private val ogle = BildirimKildimKurallari.Vakit("2026-10-13", "ogle")

    @Test
    fun kildimYanitiKimliktenCozulur() {
        assertEquals(ogle, k.kildimYaniti("kildim_action", "muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_25"))
        // Gece yarısını aşan yatsı: kimlik vaktin GERÇEK gününü (dün) taşır.
        assertEquals(
            BildirimKildimKurallari.Vakit("2026-10-12", "yatsi"),
            k.kildimYaniti("kildim_action", "muhafiz_2026-10-12_vakit_yatsi_seviye_4_dk_3"),
        )
    }

    @Test
    fun baskaEylemVeBaskaBildirimNativeIslenmez() {
        // Gövdeye dokunma (uygulamayı açar) expo'nun olağan yoluna kalır.
        assertNull(k.kildimYaniti("expo.modules.notifications.actions.DEFAULT", "muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_25"))
        assertNull(k.kildimYaniti(null, "muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_25"))
        assertNull(k.kildimYaniti("kildim_action", null))
        assertNull(k.kildimYaniti("kildim_action", "sayac_2026-10-13_ogle"))
        assertNull(k.kildimYaniti("kildim_action", "vakit_ogle_2026-10-13"))
        // Bilinmeyen vakit (güneş muhafızda planlanmaz) ve bozuk tarih.
        assertNull(k.kildimYaniti("kildim_action", "muhafiz_2026-10-13_vakit_gunes_seviye_1_dk_5"))
        assertNull(k.kildimYaniti("kildim_action", "muhafiz_13-10-2026_vakit_ogle_seviye_1_dk_5"))
    }

    @Test
    fun yalnizAyniVaktinKimlikleriIptalEdilir() {
        val tumu = listOf(
            "muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45",
            "muhafiz_2026-10-13_vakit_ogle_seviye_4_dk_1",
            "muhafiz_2026-10-13_vakit_ikindi_seviye_1_dk_45", // başka vakit
            "muhafiz_2026-10-12_vakit_ogle_seviye_1_dk_45", // başka gün
            "cuma_2026-10-16", // muhafız dışı
            "muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45", // tekrar
        )
        assertEquals(
            listOf("muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45", "muhafiz_2026-10-13_vakit_ogle_seviye_4_dk_1"),
            k.iptalEdilecekler(tumu, ogle),
        )
    }

    @Test
    fun onekPaylasanVakitAdiKomsuyuSusturmaz() {
        assertTrue(k.buVakteAitMi("muhafiz_2026-10-13_vakit_ogle", ogle))
        assertFalse(k.buVakteAitMi("muhafiz_2026-10-13_vakit_oglen_seviye_1_dk_5", ogle))
    }

    @Test
    fun onekJsIleAyni() {
        // JS: `${MUHAFIZ}${tarih}${VAKIT}${vakit}` (ArkaplanMuhafizServisi.vakitBildirimleriniIptalEt).
        assertEquals("muhafiz_2026-10-13_vakit_ogle", k.vaktinOneki(ogle))
    }

    @Test
    fun ekHatirlatmaKimlikleriDogruCozulur() {
        // Ortak hatırlatma yüzeyleri (plan §4.6): yatış tekrar tetiği (`_<k>` eki) yatsıya
        // çözülür (native Kıldım hepsini kapsar); cuma/camiye gitme/takvim FARZ'a ÇÖZÜLMEZ.
        assertEquals(
            BildirimKildimKurallari.Vakit("2026-10-13", "yatsi"),
            BildirimKildimKurallari.vakitCoz("muhafiz_2026-10-13_vakit_yatsi_yatis_15"),
        )
        assertNull(BildirimKildimKurallari.vakitCoz("cuma_hatirlatma_2026-10-16"))
        assertNull(BildirimKildimKurallari.vakitCoz("cuma_hatirlatma_2026-10-16_30"))
        assertNull(BildirimKildimKurallari.vakitCoz("camiye_git_2026-10-13_ogle"))
        assertNull(BildirimKildimKurallari.vakitCoz("takvim_cakisma_2026-10-13_ogle"))
    }
}
