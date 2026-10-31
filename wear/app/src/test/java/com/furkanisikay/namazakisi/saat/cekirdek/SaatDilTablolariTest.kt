package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Native dil tablosu nöbetçisi (`docs/ajan/coklu-dil.md > Native dil tabloları`): on dokuz dilin
 * her nesnesi kendi kodunu taşır ve her metin Türkçeyle AYNI yer tutucuları (parametreleri)
 * kullanır. Arayüz anahtar kümesini derleyici garanti eder; burada çevirmen bir parametreyi
 * (ör. `$ad`) düşürmesin diye işaretçi değerlerle çağrılır.
 */
class SaatDilTablolariTest {
    private val kodlar = listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi")
    private val isaretciler = listOf("<AD>", "<SAAT>", "<SURE>", "<S>", "<D>", "987", "986", "985")

    private fun metinler(d: SaatDili): Map<String, String> = linkedMapOf(
        "saatSesli" to d.saatSesli(987),
        "dakikaSesli" to d.dakikaSesli(987),
        "sesliBirlesik" to d.sesliBirlesik("<S>", "<D>"),
        "cikisaUzun" to d.cikisaUzun("<AD>"),
        "cikisaAciklama" to d.cikisaAciklama("<AD>"),
        "giriseAciklama" to d.giriseAciklama("<AD>"),
        "cikisUzun" to d.cikisUzun("<AD>", "<SAAT>"),
        "cikisAciklama" to d.cikisAciklama("<AD>", "<SAAT>"),
        "girisUzun" to d.girisUzun("<AD>", "<SAAT>"),
        "girisAciklama" to d.girisAciklama("<AD>", "<SAAT>"),
        "siradakiUzun" to d.siradakiUzun("<AD>", "<SAAT>"),
        "siradakiAciklama" to d.siradakiAciklama("<AD>", "<SAAT>"),
        "sayacAciklamasiCikis" to d.sayacAciklamasi("<AD>", KalanSure.Mod.CIKIS, "<SURE>"),
        "sayacAciklamasiGiris" to d.sayacAciklamasi("<AD>", KalanSure.Mod.GIRIS, "<SURE>"),
        "sonDakikaEki" to d.sonDakikaEki(987),
        "bugunEki" to d.bugunEki(986, 985),
        "acilAdSatiri" to d.acilAdSatiri("<AD>", 987),
        "dugmeAciklamasi" to d.dugmeAciklamasi("<AD>"),
        "onaySorusuSatirlari" to d.onaySorusuSatirlari("<AD>").toList().joinToString(" "),
        "kibleTaraftaSag" to d.kibleTarafta(987, true),
        "kibleTaraftaSol" to d.kibleTarafta(987, false),
        "donusSag" to d.donus(987, true),
        "donusSol" to d.donus(987, false),
        "namazModuAcikBitis" to d.namazModuAcikBitis("<SAAT>"),
        "vaktiCikiyor" to d.vaktiCikiyor("<AD>"),
    )

    private fun sabitler(d: SaatDili): List<String> =
        listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi").flatMap { listOf(d.vakitAdi(it), d.giriseKisa(it), d.giriseUzun(it)) } +
            listOf(
                d.birimSa, d.birimDk, d.birimSn, d.birDakikadanAzKisa, d.birDakikadanAzSesli, d.cikisBasligi,
                d.girisBasligi, d.altYazi(KalanSure.Mod.CIKIS), d.altYazi(KalanSure.Mod.GIRIS), d.kilindiEki,
                d.vakitDegisti, d.kabulDuasi, d.kibleHizali, d.kibleArkada, d.donusArkada, d.namazModuAcik,
                d.namazModuKapandi, d.namazModuTelefondaAcin, d.telefonaUlasilamadi, d.namazModuAcilamadi,
                d.camiKaydedildi, d.camiBirDahaSorulmaz, d.camiSayilmaz, d.soruGecersiz, d.islemYapilamadi,
                d.hoparlorYokBilgi, d.motorYokBilgi, d.sesYokBilgi, d.otomatikYerAciklamasi, d.saatYerAciklamasi,
                d.hoparlorYok, d.sesCalisti, d.motorYok, d.sesYok, d.sesCalinamadi, d.tesbihatTamamlandi, d.toplam,
                d.zikirSubhanallah, d.zikirElhamdulillah, d.zikirAllahuEkber, d.zikirTehlil, d.tehlilMetni,
                d.tesbihatKaynagi,
            )

    @Test
    fun herDilTabloSirasiylaVeKendiKoduyla() {
        assertEquals(kodlar, SAAT_DILLERI.map { it.kod })
        for (d in SAAT_DILLERI) assertSame(d, saatDili(d.kod))
        // Endonezce kaynak dizini `values-in`; eski kod da aynı tabloya gider.
        assertSame(SaatDiliId, saatDili("in"))
    }

    @Test
    fun herDilTurkceyleAyniYerTutuculari() {
        val tr = metinler(SaatDiliTr)
        for (d in SAAT_DILLERI) {
            for ((ad, metin) in metinler(d)) {
                val beklenen = isaretciler.filter { tr.getValue(ad).contains(it) }
                val gercek = isaretciler.filter { metin.contains(it) }
                assertEquals("${d.kod}.$ad", beklenen, gercek)
            }
            for (m in sabitler(d)) assertTrue("${d.kod}: boş metin", m.isNotBlank())
        }
    }

    @Test
    fun arapcaCogulAltiKategori() {
        // CLDR ar (JS `cogul.ts > arapca`): 0, 1, 2, …03–…10, …11–…99, kalanı other.
        assertEquals(
            listOf("zero", "one", "two", "few", "few", "many", "many", "other", "other", "few"),
            listOf(0L, 1L, 2L, 3L, 10L, 11L, 99L, 100L, 102L, 103L).map { SaatDiliAr.cogulKategorisi(it) },
        )
        // Sesli biçim: tekil ve tesniye sayısız, 3–10 çoğul, 11–99 temyiz tekil.
        assertEquals("دقيقة واحدة", SaatDiliAr.dakikaSesli(1))
        assertEquals("دقيقتان", SaatDiliAr.dakikaSesli(2))
        assertEquals("3 دقائق", SaatDiliAr.dakikaSesli(3))
        assertEquals("11 ساعة", SaatDiliAr.saatSesli(11))
        // Urduca one/other (JS `sozluk/ur/sure.ts`).
        assertEquals("1 گھنٹہ", SaatDiliUr.saatSesli(1))
        assertEquals("3 گھنٹے", SaatDiliUr.saatSesli(3))
    }

    @Test
    fun sayiBirimBoslugu_dildenGelir() {
        // JS `sure.birimli` / `sure.parcali` ikizi: boşluklu dillerde çıktı eski sabit boşluklu
        // biçimle birebir; boşluksuz dil (Çince) bitişik yazar.
        for (k in kodlar.filter { it != "zh" && it != "ko" }) {
            val d = saatDili(k)
            assertEquals(k, " " to " ", d.birimAyirici to d.parcaAyirici)
            assertEquals(k, "1 ${d.birimSa} 12 ${d.birimDk}", VakitHesabi.kalanMetni(72 * 60_000L, k))
            assertEquals(k, "12 ${d.birimDk}", VakitHesabi.kalanMetni(12 * 60_000L, k))
            assertTrue(k, AnaEkranKarari.sayac(3_725_000L, k).let { it.birimBosluklu && it.parcaBosluklu })
        }
        val zh = saatDili("zh")
        assertEquals("" to "", zh.birimAyirici to zh.parcaAyirici)
        assertEquals("1${zh.birimSa}12${zh.birimDk}", VakitHesabi.kalanMetni(72 * 60_000L, "zh"))
        assertEquals("2${zh.birimSa}", VakitHesabi.kalanMetni(120 * 60_000L, "zh"))
        assertEquals(zh.saatSesli(1) + zh.dakikaSesli(5), VakitHesabi.kalanSesliMetni(65 * 60_000L, "zh"))
        val sayac = AnaEkranKarari.sayac(3_725_000L, "zh")
        assertTrue(!sayac.birimBosluklu && !sayac.parcaBosluklu)
        // Korece yalnız sayı–birim bitişik, parçalar boşluklu ("5분", "1시간 5분").
        val ko = saatDili("ko")
        assertEquals("" to " ", ko.birimAyirici to ko.parcaAyirici)
        assertEquals("1${ko.birimSa} 12${ko.birimDk}", VakitHesabi.kalanMetni(72 * 60_000L, "ko"))
        assertEquals("12${ko.birimDk}", VakitHesabi.kalanMetni(12 * 60_000L, "ko"))
        assertEquals(ko.saatSesli(1) + " " + ko.dakikaSesli(5), VakitHesabi.kalanSesliMetni(65 * 60_000L, "ko"))
        val koSayac = AnaEkranKarari.sayac(3_725_000L, "ko")
        assertTrue(!koSayac.birimBosluklu && koSayac.parcaBosluklu)
    }
}
