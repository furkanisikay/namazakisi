package com.furkanisikay.namazakisi.saat.cekirdek

import com.furkanisikay.namazakisi.saat.cekirdek.AnonsKarari.SesDurumu
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
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

    // --- Ses durumu ve ekran metinleri (sahip geri bildirimi: "saatte TTS çalışmadı") ---

    @Test
    fun sesDurumuKodlariGidipGelir() {
        for (d in AnonsKarari.SesDurumu.entries) assertEquals(d, AnonsKarari.SesDurumu.coz(d.kod))
        assertEquals(AnonsKarari.SesDurumu.BILINMIYOR, AnonsKarari.SesDurumu.coz(null))
        assertEquals(AnonsKarari.SesDurumu.BILINMIYOR, AnonsKarari.SesDurumu.coz("baska"))
    }

    @Test
    fun bilgiMetniYalnizSaatKonusacakkenVeNedeniSoyler() {
        // Saat bu ayarla hiç konuşmayacak: bilgi satırı yok.
        assertNull(AnonsKarari.bilgiMetni(AnonsYerleri.TELEFON, false, SesDurumu.MOTOR_YOK))
        assertNull(AnonsKarari.bilgiMetni(null, true, SesDurumu.TURKCE_YOK))
        // Konuşabilir ama engel var.
        assertTrue(AnonsKarari.bilgiMetni(AnonsYerleri.SAAT, false, SesDurumu.KONUSTU)!!.contains("hoparlör"))
        assertTrue(AnonsKarari.bilgiMetni(AnonsYerleri.OTOMATIK, true, SesDurumu.MOTOR_YOK)!!.contains("motoru"))
        assertTrue(AnonsKarari.bilgiMetni(AnonsYerleri.OTOMATIK, true, SesDurumu.TURKCE_YOK)!!.contains("Türkçe"))
        // Sorun yok ya da henüz denenmedi: sessiz.
        assertNull(AnonsKarari.bilgiMetni(AnonsYerleri.SAAT, true, SesDurumu.KONUSTU))
        assertNull(AnonsKarari.bilgiMetni(AnonsYerleri.SAAT, true, SesDurumu.BILINMIYOR))
    }

    @Test
    fun otomatikAciklamasiTelefonYanindayKenSaatinSustugunuSoyler() {
        assertTrue(AnonsKarari.yerAciklamasi(AnonsYerleri.OTOMATIK)!!.contains("telefon uzaktayken"))
        assertNull(AnonsKarari.yerAciklamasi(AnonsYerleri.TELEFON))
        assertTrue(AnonsKarari.saatKonusabilir(AnonsYerleri.OTOMATIK))
        assertTrue(AnonsKarari.saatKonusabilir(AnonsYerleri.SAAT))
        assertFalse(AnonsKarari.saatKonusabilir(AnonsYerleri.TELEFON))
        assertFalse(AnonsKarari.saatKonusabilir(null))
    }

    @Test
    fun arayuzMetinleriSenDiliTasimaz() {
        val metinler = listOfNotNull(
            AnonsKarari.yerAciklamasi(AnonsYerleri.OTOMATIK),
            AnonsKarari.DENEME_METNI,
            AnonsKarari.bilgiMetni(AnonsYerleri.SAAT, false, SesDurumu.KONUSTU),
            AnonsKarari.bilgiMetni(AnonsYerleri.SAAT, true, SesDurumu.MOTOR_YOK),
        ) + SesDurumu.entries.map { AnonsKarari.denemeSonucu(it, true) }
        val sen = Regex("(^|\\s)(sen|senin|seni)(\\s|$)", RegexOption.IGNORE_CASE)
        for (m in metinler) assertFalse(m, sen.containsMatchIn(m))
    }
}
