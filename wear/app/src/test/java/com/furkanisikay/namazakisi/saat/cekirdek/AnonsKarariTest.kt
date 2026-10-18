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
}
