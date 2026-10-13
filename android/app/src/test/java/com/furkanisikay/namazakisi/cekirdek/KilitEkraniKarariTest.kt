package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * NÖBETÇİ (issue #295): kilit ekranı / hub widget'ı SALT OKUNURDUR — communal ana
 * bilgisayarı yayın niyetini kilit açılmadan işletir, "Kıldım" orada verilmez.
 */
class KilitEkraniKarariTest {
    private val anaEkran = 0x1 // WIDGET_CATEGORY_HOME_SCREEN
    private val kilit = 0x2 // WIDGET_CATEGORY_KEYGUARD
    private val aramaKutusu = 0x4 // WIDGET_CATEGORY_SEARCHBOX

    @Test
    fun kategoriAlgilanir() {
        assertTrue(KilitEkraniKarari.kilitEkraniMi(kilit))
        assertTrue(KilitEkraniKarari.kilitEkraniMi(kilit or anaEkran))
        assertFalse(KilitEkraniKarari.kilitEkraniMi(anaEkran))
        assertFalse(KilitEkraniKarari.kilitEkraniMi(aramaKutusu))
        // Seçenek yoksa (eski başlatıcı) 0 gelir; WIDGET_CATEGORY_UNKNOWN = -1 → ana ekran sayılır.
        assertFalse(KilitEkraniKarari.kilitEkraniMi(0))
        assertFalse(KilitEkraniKarari.kilitEkraniMi(-1))
    }

    @Test
    fun kilitEkranindaKildimNiyetiYok() {
        assertFalse(KilitEkraniKarari.kildimNiyetiVerilsinMi(KildimDurumu.KILINABILIR, kilitEkrani = true))
        assertTrue(KilitEkraniKarari.kildimNiyetiVerilsinMi(KildimDurumu.KILINABILIR, kilitEkrani = false))
        for (d in listOf(KildimDurumu.KILINDI, KildimDurumu.BEKLIYOR, KildimDurumu.YOK)) {
            assertFalse(KilitEkraniKarari.kildimNiyetiVerilsinMi(d, kilitEkrani = false))
        }
    }

    @Test
    fun kilitEkranindaKilinabilirDugmeGizlenirDurumBilgisiKalir() {
        assertFalse(KilitEkraniKarari.dugmeGorunurMu(KildimDurumu.KILINABILIR, veriVar = true, kilitEkrani = true))
        assertTrue(KilitEkraniKarari.dugmeGorunurMu(KildimDurumu.KILINDI, veriVar = true, kilitEkrani = true))
        assertTrue(KilitEkraniKarari.dugmeGorunurMu(KildimDurumu.BEKLIYOR, veriVar = true, kilitEkrani = true))
        assertTrue(KilitEkraniKarari.dugmeGorunurMu(KildimDurumu.KILINABILIR, veriVar = true, kilitEkrani = false))
        assertFalse(KilitEkraniKarari.dugmeGorunurMu(KildimDurumu.KILINABILIR, veriVar = false, kilitEkrani = false))
    }

    @Test
    fun erisimMetniKilitEkranindaIsaretlemeVaadiVermez() {
        assertEquals(
            "İkindi namazı kılınmadı. İşaretlemek için uygulamayı açın",
            KilitEkraniKarari.erisimMetni("İkindi", KildimDurumu.KILINABILIR, kilitEkrani = true),
        )
        // Ana ekran metni Widget 2.0'dakiyle BİREBİR aynı kalır.
        assertEquals(
            "İkindi namazını kılındı olarak işaretleyin",
            KilitEkraniKarari.erisimMetni("İkindi", KildimDurumu.KILINABILIR, kilitEkrani = false),
        )
        assertEquals(
            "İkindi namazı kılındı. Uygulamayı açın",
            KilitEkraniKarari.erisimMetni("İkindi", KildimDurumu.KILINDI, kilitEkrani = true),
        )
    }

    /** NÖBETÇİ (issue #283): Flex Window sağlayıcısı host kategorisinden bağımsız salt okunur. */
    @Test
    fun kapakEkraniSaglayicisiDaimaSaltOkunur() {
        assertTrue(KilitEkraniKarari.saltOkunurMu(anaEkran, kapakEkraniSaglayicisi = true))
        assertTrue(KilitEkraniKarari.saltOkunurMu(0, kapakEkraniSaglayicisi = true))
        assertTrue(KilitEkraniKarari.saltOkunurMu(kilit, kapakEkraniSaglayicisi = false))
        assertFalse(KilitEkraniKarari.saltOkunurMu(anaEkran, kapakEkraniSaglayicisi = false))
        assertFalse(KilitEkraniKarari.saltOkunurMu(0, kapakEkraniSaglayicisi = false))
    }
}
