package com.furkanisikay.namazakisi.tv.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Native dil tablosu nöbetçisi (`docs/ajan/coklu-dil.md > Native dil tabloları`): on dokuz dilin
 * her nesnesi kendi kodunu taşır, ay/gün listeleri tam ve her metin Türkçeyle AYNI
 * parametreleri kullanır (işaretçi değerlerle çağrılır).
 */
class TvDilTablolariTest {
    private val kodlar = listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "pt", "it", "sv", "uk", "ro", "hr", "sr", "el", "ku", "tk", "tt", "sd", "pl", "ja", "gu", "bg", "mk", "fil", "te", "kn", "mr", "pa", "as", "ne", "si", "km", "he", "ka", "lt", "mg", "lg", "rw", "rn", "ln", "dag", "mos", "aa", "mdh", "ak", "ceb", "nqo")
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
        assertEquals("دقيقة واحدة", TvDiliAr.dakikaSesli(1))
        assertEquals("دقيقتان", TvDiliAr.dakikaSesli(2))
        assertEquals("11 دقيقة", TvDiliAr.dakikaSesli(11))
        assertEquals("1 گھنٹہ", TvDiliUr.saatSesli(1))
        assertEquals("3 گھنٹے", TvDiliUr.saatSesli(3))
    }

    @Test
    fun avrupaDalgasiCogulKategorileri() {
        val sayilar = listOf(0, 1, 2, 5, 11, 19, 20, 21, 101, 120)
        // CLDR ro (JS `cogul.ts > rumence`): 1 tekil; 0 ve …01–…19 (1 hariç) few; gerisi other.
        assertEquals(
            listOf("few", "one", "few", "few", "few", "few", "other", "other", "few", "other"),
            sayilar.map { TvDiliRo.cogulKategorisi(it) },
        )
        // uk = rusca (gerisi many); hr, sr = bosnakca (gerisi other).
        assertEquals(
            listOf("many", "one", "few", "many", "many", "many", "many", "one", "one", "many"),
            sayilar.map { TvDiliUk.cogulKategorisi(it) },
        )
        for (kategori in listOf(TvDiliHr::cogulKategorisi, TvDiliSr::cogulKategorisi)) {
            assertEquals(
                listOf("other", "one", "few", "other", "other", "other", "other", "one", "one", "other"),
                sayilar.map { kategori(it) },
            )
        }
    }

    @Test
    fun dalga11CogulKategorileri() {
        val sayilar = listOf(0, 1, 2, 4, 5, 12, 14, 21, 22, 25, 104, 111)
        // CLDR pl (JS `cogul.ts > lehce`): 1 tekil; …2–4 (…12–14 hariç) few; gerisi many.
        assertEquals(
            listOf("many", "one", "few", "few", "many", "many", "many", "many", "few", "many", "few", "many"),
            sayilar.map { TvDiliPl.cogulKategorisi(it) },
        )
        // CLDR mk (JS `cogul.ts > makedonca`): son hanesi 1 (11 hariç) tekil; gerisi other.
        assertEquals(
            listOf("other", "one", "other", "other", "other", "other", "other", "one", "other", "other", "other", "other"),
            sayilar.map { TvDiliMk.cogulKategorisi(it) },
        )
        // ja ve tt yalnız other: sesli süre her sayıda çoğul kalıp.
        for (dil in listOf(TvDiliJa, TvDiliTt)) assertEquals(dil.saatSesli(1).removePrefix("1"), dil.saatSesli(2).removePrefix("2"))
    }

    @Test
    fun dalga12CogulKategorileri() {
        // CLDR fil (JS `cogul.ts > filipince`): son hanesi 4, 6, 9 OLMAYAN tekil (0 dahil).
        val sayilar = listOf(0, 1, 2, 3, 4, 5, 6, 9, 10, 14, 21, 104)
        assertEquals(
            listOf("one", "one", "one", "one", "other", "one", "other", "other", "one", "other", "one", "other"),
            sayilar.map { TvDiliFil.cogulKategorisi(it) },
        )
        // km yalnız other: sesli süre her sayıda çoğul kalıp.
        assertEquals(TvDiliKm.saatSesli(1).removePrefix("1"), TvDiliKm.saatSesli(2).removePrefix("2"))
        assertSame(TvDiliFil, tvDili("tl"))
    }

    @Test
    fun dalga13CogulKategorileri() {
        // CLDR he (JS `cogul.ts > ibranice`): 1 one, 2 two, gerisi other.
        assertEquals(listOf("other", "one", "two", "other", "other"), listOf(0, 1, 2, 3, 20).map { TvDiliHe.cogulKategorisi(it) })
        // CLDR lt (JS `cogul.ts > litvanca`): …1 one, …2–9 few (…11–19 hariç), gerisi other.
        assertEquals(
            listOf("other", "one", "few", "few", "other", "other", "other", "one", "few", "other"),
            listOf(0, 1, 2, 9, 10, 11, 19, 21, 22, 111).map { TvDiliLt.cogulKategorisi(it) },
        )
        // Sebuano Filipince kuralı.
        assertEquals(listOf("one", "one", "other", "other", "one"), listOf(0, 1, 4, 14, 21).map { TvDiliCeb.cogulKategorisi(it) })
        // mg, ln, ak 0 ve 1 tekil: 0'da tekil kalıp. Sayının yeri dile göre değişir (ln "ngonga 1"): rakamı yerinde soy.
        for (dil in listOf(TvDiliMg, TvDiliLn, TvDiliAk)) assertEquals(dil.saatSesli(1).replace("1", "#"), dil.saatSesli(0).replace("0", "#"))
        // CLDR dışı (rw, rn, dag, mos, aa, mdh) ve nqo yalnız other: sesli süre her sayıda çoğul kalıp.
        // Sayı başta ya da sonda olabilir (Kinyarwanda "amasaha 1": birim önce).
        for (dil in listOf(TvDiliRw, TvDiliRn, TvDiliDag, TvDiliMos, TvDiliAa, TvDiliMdh, TvDiliNqo)) {
            assertEquals(dil.saatSesli(1).replace("1", "#"), dil.saatSesli(2).replace("2", "#"))
        }
        // İbranice kaynak dizini values-iw: cihazdan gelen "iw" de İbranice tabloyu seçer.
        assertSame(TvDiliHe, tvDili("iw"))
    }
}
