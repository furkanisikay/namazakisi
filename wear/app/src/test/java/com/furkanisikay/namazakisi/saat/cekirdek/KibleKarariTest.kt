package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class KibleKarariTest {
    @Test
    fun gercekYonSapmayiEkler() {
        assertEquals(5.5, KibleKarari.gercekYon(0.0, 5.5), 1e-12)
        assertEquals(2.0, KibleKarari.gercekYon(356.0, 6.0), 1e-9)
        assertEquals(355.0, KibleKarari.gercekYon(1.0, -6.0), 1e-9)
    }

    @Test
    fun hedefAcisiVeSapmaSarmayiBilir() {
        assertEquals(0.0, KibleKarari.hedefAcisi(152.0, 152.0), 0.0)
        assertEquals(2.0, KibleKarari.hedefAcisi(1.0, 359.0), 1e-9)
        assertEquals(358.0, KibleKarari.hedefAcisi(359.0, 1.0), 1e-9)
        assertEquals(2.0, KibleKarari.sapma(358.0), 1e-9)
        assertEquals(180.0, KibleKarari.sapma(180.0), 0.0)
    }

    @Test
    fun hizayaGirisTelefonlaAyniEsik() {
        // Telefon: hedef < 10 || hedef > 350.
        assertTrue(KibleKarari.hiza(false, 9.99).hizali)
        assertFalse(KibleKarari.hiza(false, 10.0).hizali)
        assertTrue(KibleKarari.hiza(false, 350.01).hizali)
        assertFalse(KibleKarari.hiza(false, 350.0).hizali)
    }

    @Test
    fun histerezisTitremeyiOnler() {
        // Hizadayken 10–15 arası salınım hizayı bozmaz ve yeniden titretmez.
        var h = KibleKarari.hiza(false, 4.0)
        assertTrue(h.hizali && h.titret)
        for (aci in listOf(11.0, 9.0, 14.0, 346.0, 12.0)) {
            h = KibleKarari.hiza(h.hizali, aci)
            assertTrue("$aci hizada kalmalı", h.hizali)
            assertFalse("$aci yeniden titretmemeli", h.titret)
        }
        h = KibleKarari.hiza(h.hizali, 15.01)
        assertFalse(h.hizali)
        assertFalse(h.titret)
        // Çıkış ile giriş arası (10–15) dışarıdan gelince hizalı SAYILMAZ.
        h = KibleKarari.hiza(h.hizali, 12.0)
        assertFalse(h.hizali)
        h = KibleKarari.hiza(h.hizali, 9.0)
        assertTrue(h.hizali && h.titret)
    }

    @Test
    fun egimVeIpucu() {
        assertEquals(0.0, KibleKarari.egim(1.0), 1e-9)
        assertEquals(90.0, KibleKarari.egim(0.0), 1e-9)
        assertEquals(0.0, KibleKarari.egim(1.0000001), 1e-9) // kayan nokta taşması kırpılır
        assertFalse(KibleKarari.egimIpucu(KibleKarari.egim(Math.cos(Math.toRadians(30.0)))))
        assertTrue(KibleKarari.egimIpucu(KibleKarari.egim(Math.cos(Math.toRadians(40.0)))))
    }

    @Test
    fun kalibrasyonKapisi() {
        assertTrue(KibleKarari.kalibrasyonGerekli(KibleKarari.DOGRULUK_DUSUK, null))
        assertTrue(KibleKarari.kalibrasyonGerekli(KibleKarari.DOGRULUK_GUVENILMEZ, 0.1))
        assertFalse(KibleKarari.kalibrasyonGerekli(3, null))
        assertFalse(KibleKarari.kalibrasyonGerekli(3, -1.0)) // bilinmiyor
        assertFalse(KibleKarari.kalibrasyonGerekli(2, 0.3))
        assertTrue(KibleKarari.kalibrasyonGerekli(3, 0.7))
    }

    @Test
    fun erisimMetniOnDerecelikAdimlarla() {
        assertEquals("Kıble yönündesiniz", KibleKarari.erisimMetni(12.0, hizali = true))
        assertEquals("Kıble 40 derece sağınızda", KibleKarari.erisimMetni(38.0, false))
        assertEquals("Kıble 40 derece sağınızda", KibleKarari.erisimMetni(43.0, false))
        assertEquals("Kıble 90 derece solunuzda", KibleKarari.erisimMetni(270.0, false))
        assertEquals("Kıble 10 derece sağınızda", KibleKarari.erisimMetni(11.0, false))
        assertEquals("Kıble arkanızda", KibleKarari.erisimMetni(178.0, false))
    }

    @Test
    fun suzgecSarmadaDolasmaz() {
        val f = KibleKarari.AciSuzgeci(alfa = 0.5)
        assertEquals(359.0, f.ekle(359.0), 1e-9)
        val sonuc = f.ekle(1.0)
        // 359 ile 1'in ortası 0'dır, 180 DEĞİL.
        assertTrue("sonuç=$sonuc", KibleKarari.sapma(sonuc) < 1e-6)
        f.sifirla()
        assertEquals(90.0, f.ekle(90.0), 1e-9)
    }

    @Test
    fun okEnKisaYoldanDoner() {
        assertEquals(361.0, KibleKarari.enKisaYol(359.0, 1.0), 1e-9)
        assertEquals(-1.0, KibleKarari.enKisaYol(1.0, 359.0), 1e-9)
        assertEquals(730.0, KibleKarari.enKisaYol(720.0, 10.0), 1e-9)
    }

    @Test
    fun yonlendirmeYaklastikcaSiklasirHizadaSusar() {
        val uzak = KibleKarari.yonlendirmeAraligiMs(170.0, hizali = false)!!
        val orta = KibleKarari.yonlendirmeAraligiMs(60.0, hizali = false)!!
        val yakin = KibleKarari.yonlendirmeAraligiMs(350.0, hizali = false)!! // 10° solda
        org.junit.Assert.assertTrue(uzak > orta && orta > yakin)
        // Hizada W2'nin tek onayı korunur: sürekli tık YOK.
        org.junit.Assert.assertNull(KibleKarari.yonlendirmeAraligiMs(3.0, hizali = true))
    }

    // --- Uyarlamalı süzgeç (kıble cilası) -------------------------------------------

    @Test
    fun uyarlamaliAlfaSapmaylaBuyur() {
        val a = KibleKarari.UyarlamaliAciSuzgeci
        assertEquals(a.EN_AZ_ALFA, a.alfa(0.0), 1e-12)
        assertEquals(a.EN_AZ_ALFA, a.alfa(a.SAKIN_DERECE), 1e-12)
        assertEquals(a.EN_FAZLA_ALFA, a.alfa(a.HIZLI_DERECE), 1e-12)
        assertEquals(a.EN_FAZLA_ALFA, a.alfa(170.0), 1e-12)
        assertTrue(a.alfa(10.0) > a.alfa(5.0))
    }

    @Test
    fun uyarlamaliSuzgecTitremeyiBastirir() {
        val f = KibleKarari.UyarlamaliAciSuzgeci()
        f.ekle(100.0)
        var enUzak = 0.0
        // ±2° el titremesi: çıktı 100°'den 0,5°'den fazla oynamaz (sabit 0,25 alfa ≈ 1°+ oynatırdı).
        repeat(60) { i ->
            val cikti = f.ekle(if (i % 2 == 0) 102.0 else 98.0)
            enUzak = maxOf(enUzak, KibleKarari.sapma(cikti - 100.0))
        }
        assertTrue("en uzak=$enUzak", enUzak < 0.5)
    }

    @Test
    fun uyarlamaliSuzgecGercekDonusuHizliIzler() {
        val hizli = KibleKarari.UyarlamaliAciSuzgeci()
        val sabit = KibleKarari.AciSuzgeci()
        hizli.ekle(0.0)
        sabit.ekle(0.0)
        var h = 0.0
        var s = 0.0
        repeat(6) {
            h = hizli.ekle(90.0)
            s = sabit.ekle(90.0)
        }
        // 6 örnekte (≈ 0,1 sn) uyarlamalı süzgeç hedefe sabitten daha çok yaklaşır.
        assertTrue("uyarlamali=$h sabit=$s", KibleKarari.sapma(90.0 - h) < KibleKarari.sapma(90.0 - s))
        assertTrue("uyarlamali=$h", KibleKarari.sapma(90.0 - h) < 10.0)
    }

    @Test
    fun uyarlamaliSuzgecSarmadaDolasmaz() {
        val f = KibleKarari.UyarlamaliAciSuzgeci()
        f.ekle(358.0)
        repeat(30) { f.ekle(2.0) }
        val c = f.ekle(2.0)
        // 358 → 2 dönüşü 4°'lik kısa yoldan; 180 civarına uğramaz.
        assertTrue("cikti=$c", KibleKarari.sapma(c - 2.0) < 2.0)
    }

    @Test
    fun donusMetniYonVeBesDerecelikAdim() {
        assertEquals("Sağa 35°", KibleKarari.donusMetni(33.0))
        assertEquals("Sola 90°", KibleKarari.donusMetni(270.0))
        assertEquals("Sağa 5°", KibleKarari.donusMetni(1.0))
        assertEquals("Arkanızda", KibleKarari.donusMetni(178.0))
        assertEquals("Sola 10°", KibleKarari.donusMetni(-11.0))
    }
}
