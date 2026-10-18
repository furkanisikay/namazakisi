package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AnonsKarariTest {
    private val metin = "Öğle vaktinin çıkmasına 10 dakika kaldı."

    @Test
    fun otomatikteYalnizTelefonYakindaYokkenKonusur() {
        assertFalse(AnonsKarari.saatKonusurMu(AnonsYerleri.OTOMATIK, metin, yakindaTelefon = true, hoparlor = true))
        assertTrue(AnonsKarari.saatKonusurMu(AnonsYerleri.OTOMATIK, metin, yakindaTelefon = false, hoparlor = true))
    }

    @Test
    fun saatSeciliyseDaimaTelefonSeciliyseAsla() {
        assertTrue(AnonsKarari.saatKonusurMu(AnonsYerleri.SAAT, metin, yakindaTelefon = true, hoparlor = true))
        assertFalse(AnonsKarari.saatKonusurMu(AnonsYerleri.TELEFON, metin, yakindaTelefon = false, hoparlor = true))
        // Eski telefon (alan yok): eski davranış — saat konuşmaz.
        assertFalse(AnonsKarari.saatKonusurMu(null, metin, yakindaTelefon = false, hoparlor = true))
    }

    @Test
    fun hoparlorYoksaYaDaMetinYoksaKonusmaz() {
        assertFalse(AnonsKarari.saatKonusurMu(AnonsYerleri.SAAT, metin, yakindaTelefon = false, hoparlor = false))
        assertFalse(AnonsKarari.saatKonusurMu(AnonsYerleri.SAAT, " ", yakindaTelefon = false, hoparlor = true))
        assertFalse(AnonsKarari.telefonSorulmaliMi(AnonsYerleri.SAAT, metin))
        assertTrue(AnonsKarari.telefonSorulmaliMi(AnonsYerleri.OTOMATIK, metin))
    }

    /** NÖBETÇİ (inceleme bulgusu 4): camideyken / Namaz modu açıkken saat konuşmaz. */
    @Test
    fun camidekenYaDaModAcikkenKonusmaz() {
        val simdi = 1_000_000L
        val camide = TelefonKomutu.CamiDurumu(TelefonKomutu.CamiDurumu.Yer("osm:n1", "Fatih Camii", simdi + 60_000), null, null)
        val mod = TelefonKomutu.CamiDurumu(null, null, simdi + 60_000)
        val soru = TelefonKomutu.CamiDurumu(null, TelefonKomutu.CamiDurumu.Yer("osm:n1", "Fatih Camii", simdi + 60_000), null)
        assertTrue(AnonsKarari.sessizMi(camide, simdi))
        assertTrue(AnonsKarari.sessizMi(mod, simdi))
        // Yalnız soru (henüz camide değil) ve süresi geçmiş durum susturmaz.
        assertFalse(AnonsKarari.sessizMi(soru, simdi))
        assertFalse(AnonsKarari.sessizMi(mod, simdi + 60_000))
        assertFalse(AnonsKarari.sessizMi(null, simdi))
        assertFalse(AnonsKarari.saatKonusurMu(AnonsYerleri.SAAT, metin, yakindaTelefon = false, hoparlor = true, sessiz = true))
        assertFalse(AnonsKarari.telefonSorulmaliMi(AnonsYerleri.OTOMATIK, metin, sessiz = true))
    }
}
