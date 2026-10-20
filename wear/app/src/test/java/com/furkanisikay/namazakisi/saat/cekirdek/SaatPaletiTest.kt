package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Metin olarak kullanılan HER renk siyah zemine karşı ≥ 7:1 (WCAG AAA). AGENTS.md
 * "token ≠ en yakın renk" dersi: renk değişirse bu test ölçer, göz değil.
 */
class SaatPaletiTest {
    private fun enAz(renk: Long, zemin: Long, sinir: Double, ad: String) {
        val oran = SaatPaleti.kontrast(renk, zemin)
        assertTrue("$ad kontrastı $oran < $sinir", oran >= sinir)
    }

    @Test
    fun kontrastFormuluBilinenDegerleriVerir() {
        assertEquals(21.0, SaatPaleti.kontrast(0xFFFFFFFFL, 0xFF000000L), 1e-9)
        assertEquals(1.0, SaatPaleti.kontrast(SaatPaleti.EYLEM, SaatPaleti.EYLEM), 1e-9)
    }

    @Test
    fun vakitTonlariSiyahaKarsiEnAzYediyeBir() {
        assertEquals(VAKITLER.toSet(), SaatPaleti.vakitRenkleri.keys)
        SaatPaleti.vakitRenkleri.forEach { (vakit, renk) -> enAz(renk, SaatPaleti.ZEMIN, 7.0, vakit) }
    }

    @Test
    fun metinEylemVeAcilSiyahaKarsiEnAzYediyeBir() {
        enAz(SaatPaleti.METIN, SaatPaleti.ZEMIN, 7.0, "metin")
        enAz(SaatPaleti.METIN2, SaatPaleti.ZEMIN, 7.0, "ikincil metin")
        enAz(SaatPaleti.EYLEM, SaatPaleti.ZEMIN, 7.0, "eylem")
        enAz(SaatPaleti.ACIL, SaatPaleti.ZEMIN, 7.0, "acil")
        // Kerahat sarısı esasen BANT (dekoratif); onay katmanındaki uyarı satırı da bu renktir.
        enAz(SaatPaleti.KERAHAT, SaatPaleti.ZEMIN, 7.0, "kerahat")
        enAz(SaatPaleti.AMBIENT_METIN, SaatPaleti.ZEMIN, 7.0, "ambient metin")
        enAz(SaatPaleti.AMBIENT_IKINCIL, SaatPaleti.ZEMIN, 7.0, "ambient ikincil")
    }

    @Test
    fun eylemDugmesiYazisiOkunur() {
        enAz(SaatPaleti.EYLEM_USTU, SaatPaleti.EYLEM, 7.0, "eylem üstü")
    }

    @Test
    fun aktifSatirZemindeVakitVeDurumMetniOkunur() {
        // Şu anki satır YUZEY2 zeminindedir; vakit tonu "1:58 kaldı" metnini taşır.
        SaatPaleti.vakitRenkleri.forEach { (vakit, renk) -> enAz(renk, SaatPaleti.YUZEY2, 4.5, vakit) }
        enAz(SaatPaleti.METIN, SaatPaleti.YUZEY2, 4.5, "metin")
        enAz(SaatPaleti.METIN2, SaatPaleti.YUZEY, 4.5, "ikincil metin")
    }

    @Test
    fun bilinmeyenVakitMetinRengineDuser() {
        assertEquals(SaatPaleti.METIN, SaatPaleti.vakitRengi("yok"))
        assertEquals(SaatPaleti.METIN, SaatPaleti.vakitRengi(null))
    }

    @Test
    fun kabeGovdesiZemindenAyrilirKusakUstundeBelirgin() {
        // Gövde saf siyah olsaydı işaret boş çerçeveye benzerdi (görsel inceleme).
        assertTrue(SaatPaleti.kontrast(SaatPaleti.KABE, SaatPaleti.ZEMIN) >= 1.3)
        enAz(SaatPaleti.KERAHAT, SaatPaleti.KABE, 3.0, "altın kuşak")
        enAz(SaatPaleti.EYLEM, SaatPaleti.KABE, 3.0, "hizada yeşil kuşak")
    }
}
