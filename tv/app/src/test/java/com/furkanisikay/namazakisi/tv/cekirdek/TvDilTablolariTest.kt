package com.furkanisikay.namazakisi.tv.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Native dil tablosu nöbetçisi (`docs/ajan/coklu-dil.md > Native dil tabloları`): on dilin
 * her nesnesi kendi kodunu taşır, ay/gün listeleri tam ve her metin Türkçeyle AYNI
 * parametreleri kullanır (işaretçi değerlerle çağrılır).
 */
class TvDilTablolariTest {
    private val kodlar = listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur")
    private val isaretciler = listOf("<AD>", "<AY>", "<GUN>", "987", "2468")

    private fun metinler(d: TvDili): Map<String, String> = linkedMapOf(
        "tarih" to d.tarih(987, "<AY>", 2468, "<GUN>"),
        "saatSesli" to d.saatSesli(987),
        "dakikaSesli" to d.dakikaSesli(987),
        "bant" to d.bant("<AD>", 987L),
    )

    @Test
    fun herDilTabloSirasiylaVeKendiKoduyla() {
        assertEquals(kodlar, TV_DILLERI.map { it.kod })
        for (d in TV_DILLERI) assertSame(d, tvDili(d.kod))
        assertSame(TvDiliId, tvDili("in"))
    }

    @Test
    fun herDilTurkceyleAyniYerTutuculariVeTamListeler() {
        val tr = metinler(TvDiliTr)
        for (d in TV_DILLERI) {
            for ((ad, metin) in metinler(d)) {
                val beklenen = isaretciler.filter { tr.getValue(ad).contains(it) }
                assertEquals("${d.kod}.$ad", beklenen, isaretciler.filter { metin.contains(it) })
            }
            assertEquals(d.kod, 12, d.aylar.size)
            assertEquals(d.kod, 7, d.gunler.size)
            val sabit = Vakit.entries.map { d.vakitAdi(it) } +
                Kerahat.Tur.entries.flatMap { listOf(d.kerahatAdi(it), d.kerahatAciklamasi(it)) } +
                d.aylar + d.gunler + listOf(
                    d.cuma, d.birimSa, d.birimDk, d.birimSn, d.birDakikadanAz, d.kabulDuasi,
                    d.iftarSelami, d.cumaSelami, d.sahuraKalan, d.iftaraKalan,
                )
            for (m in sabit) assertTrue("${d.kod}: boş metin", m.isNotBlank())
        }
    }

    @Test
    fun arapcaCogulAltiKategori() {
        // CLDR ar (JS `cogul.ts > arapca`): 0, 1, 2, …03–…10, …11–…99, kalanı other.
        assertEquals(
            listOf("zero", "one", "two", "few", "few", "many", "many", "other", "other", "few"),
            listOf(0, 1, 2, 3, 10, 11, 99, 100, 102, 103).map { TvDiliAr.cogulKategorisi(it) },
        )
        assertEquals("1 minute", TvDiliAr.dakikaSesli(1))
        assertEquals("2 minutes", TvDiliAr.dakikaSesli(2))
        assertEquals("1 hour", TvDiliUr.saatSesli(1))
        assertEquals("3 hours", TvDiliUr.saatSesli(3))
    }
}
