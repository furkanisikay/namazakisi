package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Native dil tablosu nöbetçisi (`docs/ajan/coklu-dil.md > Native dil tabloları`): her dilin
 * bloğu Türkçeyle AYNI alanları ve her alan AYNI yer tutucu kümesini taşır; kod → blok
 * eşlemesi ve Endonezce "in" takma adı. Türkçe çıktı fikstür testlerinde kilitlidir.
 */
class CekirdekMetinleriTest {
    private val diller = listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn")
    private val yerTutucu = Regex("""\{\w+\}""")

    private fun alanlar(m: CekirdekMetinleri): Map<String, String> =
        CekirdekMetinleri::class.java.declaredFields
            .filter { it.type == String::class.java && !java.lang.reflect.Modifier.isStatic(it.modifiers) }
            .associate { f -> f.isAccessible = true; f.name to (f.get(m) as String) }

    @Test
    fun desteklenenDillerTabloSirasiyla() {
        assertEquals(diller, MetinDili.DESTEKLENENLER)
    }

    @Test
    fun herDilinBlokuKendiKodunuTasir() {
        for (d in diller) {
            assertEquals(d, MetinDili.metinler(d).dil)
            assertEquals(d, MetinDili.coz("$d-XX"))
        }
        assertSame(CEKIRDEK_TR, MetinDili.metinler("xx"))
        assertSame(CEKIRDEK_TR, MetinDili.metinler(null))
    }

    @Test
    fun endonezceEskiKoduId() {
        // java.util.Locale "id"yi "in"e çevirir; Android cihaz dili "in" gelebilir.
        assertEquals("id", MetinDili.coz("in"))
        assertEquals("id", MetinDili.coz("in_ID"))
        assertSame(CEKIRDEK_ID, MetinDili.metinler("in-ID"))
    }

    @Test
    fun herBlokTurkceyleAyniAlanVeYerTutucular() {
        val tr = alanlar(CEKIRDEK_TR)
        assertTrue(tr.size > 50)
        for (d in diller) {
            val m = alanlar(MetinDili.metinler(d))
            assertEquals(d, tr.keys, m.keys)
            for ((ad, metin) in tr) {
                val beklenen = yerTutucu.findAll(metin).map { it.value }.toSortedSet()
                val gercek = yerTutucu.findAll(m.getValue(ad)).map { it.value }.toSortedSet()
                assertEquals("$d.$ad", beklenen, gercek)
                assertTrue("$d.$ad boş", m.getValue(ad).isNotBlank())
            }
        }
    }

    @Test
    fun turkceBlokEskiSabitlerleAyni() {
        assertEquals(KilitEkraniKarari.KAPAK_IPUCU, CEKIRDEK_TR.kapakIpucu)
        assertEquals(KildimOnayMetni.KABUL_DUASI, CEKIRDEK_TR.kabulDuasi)
        assertEquals(AsistanKarari.KONUM_YOK_METNI, CEKIRDEK_TR.konumYok)
        assertEquals(AsistanKarari.VERI_ESKI_METNI, CEKIRDEK_TR.veriEski)
        assertEquals(AsistanKarari.VAKIT_DEGISTI_METNI, CEKIRDEK_TR.vakitDegisti)
        assertEquals(AracKarari.KONUM_YOK_METNI, CEKIRDEK_TR.aracKonumYok)
        assertEquals(AracKarari.CAMI_YOK_METNI, CEKIRDEK_TR.aracCamiYok)
    }

    @Test
    fun bicimTekGecisteDoldurur() {
        assertEquals("Öğle · 12:00", MetinDili.bicim("{ad} · {saat}", "ad" to "Öğle", "saat" to "12:00"))
        // Değer başka bir yer tutucu taşısa da yeniden işlenmez; bilinmeyen yer tutucu kalır.
        assertEquals("{saat} · 12:00 {x}", MetinDili.bicim("{ad} · {saat} {x}", "ad" to "{saat}", "saat" to "12:00"))
        assertEquals("$1 \\", MetinDili.bicim("{ad}", "ad" to "$1 \\"))
    }
}
