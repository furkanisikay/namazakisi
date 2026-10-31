package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SigdirmaTest {
    /**
     * Sahte ölçüm: metin [harf] karakter, karakter başına boy × 0,55 px; satır başına sözcük
     * sınırında kırılır (sözcükler [sozcukHarf]).
     */
    private fun sigar(sozcukHarf: List<Int>, genislik: Float): (Float, Int) -> Boolean = { boy, satir ->
        val k = boy * 0.55f
        if (sozcukHarf.any { it * k > genislik }) {
            false
        } else {
            var satirlar = 1
            var dolu = 0f
            for (s in sozcukHarf) {
                val w = s * k
                val ek = if (dolu == 0f) w else dolu + k + w
                if (ek <= genislik) dolu = ek else { satirlar++; dolu = w }
            }
            satirlar <= satir
        }
    }

    /** Kısa dua (Türkçe "Allah kabul etsin") tek satırda tam boy kalır: görünüm değişmez. */
    @Test
    fun kisaMetinTekSatirTamBoy() {
        val k = Sigdirma.karar(14f, 9.8f, enCokSatir = 2, tekSatirTabani = 11.9f, sigar = sigar(listOf(5, 5, 5), 140f))
        assertEquals(Sigdirma.Karar(14f, 1), k)
    }

    /**
     * Uzun dua (Tamilce "அல்லாஹ் ஏற்றுக்கொள்வானாக", ~24 karakter) tek satırda tabanın altına
     * inmek yerine İKİ satıra sarılır ve "…" ile kesilmez.
     */
    @Test
    fun uzunMetinIkiSatiraSarilir() {
        val sozcukler = listOf(7, 16)
        val k = Sigdirma.karar(14f, 9.8f, enCokSatir = 2, tekSatirTabani = 11.9f, sigar = sigar(sozcukler, 134f))
        assertEquals(2, k.satir)
        assertTrue("okunur boyda", k.boy >= 9.8f)
        assertTrue(sigar(sozcukler, 134f)(k.boy, 2))
    }

    /** Tek satır kipinde (varsayılan) eski davranış: tabana kadar küçülür. */
    @Test
    fun tekSatirKipiEskiDavranis() {
        val k = Sigdirma.karar(14f, 8.4f, sigar = { b, _ -> b <= 10f })
        assertEquals(Sigdirma.Karar(10f, 1), k)
        assertEquals(Sigdirma.Karar(8.4f, 1), Sigdirma.karar(14f, 8.4f, sigar = { _, _ -> false }))
    }

    @Test
    fun hicbiriSigmazsaEnKucukVeEnCokSatir() {
        assertEquals(Sigdirma.Karar(9.8f, 2), Sigdirma.karar(14f, 9.8f, enCokSatir = 2, tekSatirTabani = 11.9f) { _, _ -> false })
    }

    @Test
    fun kirisMerkezdeCapTepedeSifir() {
        assertEquals(200f, Sigdirma.kiris(100f, 0f), 1e-3f)
        assertEquals(0f, Sigdirma.kiris(100f, 100f), 0f)
        assertEquals(0f, Sigdirma.kiris(100f, 140f), 0f)
        assertEquals(160f, Sigdirma.kiris(100f, 60f), 1e-3f) // 2·√(100²−60²)
    }

    /**
     * Halkanın tepesine yakın satır, sütuna sığsa da halkaya değer: 454 px yuvarlak saatte
     * (2 px/dp) zikir adının üst kenarı ~78 px'te → güvenli genişlik eski %82'lik kutudan
     * (≈261 px) DAR. Merkeze yakın satır geniş kalır.
     */
    @Test
    fun tepeSatiriDarMerkezSatiriGenis() {
        val r = Sigdirma.halkaIcYaricapi(454f, kalinlik = 12f, kenarPay = 10f)
        assertEquals(184.6f, r, 0.01f) // (454 − 2·(10 + 26,4)) / 2 − 6
        val tepe = Sigdirma.guvenliGenislik(r, merkezY = 227f, ust = 78f, alt = 112f, pay = 8f)
        val orta = Sigdirma.guvenliGenislik(r, merkezY = 227f, ust = 200f, alt = 254f, pay = 8f)
        assertTrue("tepe $tepe < 261", tepe < 261f)
        assertTrue("orta $orta > tepe", orta > tepe)
        // Üst ve alt simetrik: en dar nokta merkezden en uzak kenar.
        assertEquals(
            Sigdirma.guvenliGenislik(r, 227f, 78f, 112f, 8f),
            Sigdirma.guvenliGenislik(r, 227f, 342f, 376f, 8f),
            1e-3f,
        )
    }

    @Test
    fun genislikOlcegi() {
        assertEquals(1f, Sigdirma.genislikOlcegi(100, 120), 0f)
        assertEquals(1f, Sigdirma.genislikOlcegi(0, 120), 0f)
        assertEquals(0.8f, Sigdirma.genislikOlcegi(150, 120), 1e-6f)
    }
}
