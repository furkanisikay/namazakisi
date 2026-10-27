package com.furkanisikay.namazakisi.saat.cekirdek

import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat.Durum
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat.Faz
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat.Olay
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Tesbihat sayacı (issue #293): 33-33-33 (+1), geri alma, sıfırlama, eskime, taç. */
class TesbihatTest {

    private fun saydir(n: Int, bas: Durum = Durum()): Pair<Durum, List<Olay>> {
        var d = bas
        val olaylar = mutableListOf<Olay>()
        repeat(n) {
            val s = Tesbihat.say(d)
            d = s.durum
            olaylar += s.olay
        }
        return d to olaylar
    }

    @Test
    fun yuzDokunusSirasiVeOlaylari() {
        val (son, olaylar) = saydir(100)
        assertTrue(son.tamamMi)
        assertEquals(100, son.toplam)
        // Faz geçişi tam olarak 33., 66. ve 99. dokunuşta; bitiş 100.'de.
        val gecisler = olaylar.withIndex().filter { it.value == Olay.FAZ_TAMAM }.map { it.index + 1 }
        assertEquals(listOf(33, 66, 99), gecisler)
        assertEquals(Olay.BITTI, olaylar.last())
        assertEquals(96, olaylar.count { it == Olay.TIK })
    }

    @Test
    fun fazlarVeFazIciSayi() {
        assertEquals(Faz.SUBHANALLAH, Durum(0).faz)
        assertEquals(0, Durum(0).fazSayisi)
        assertEquals(Faz.SUBHANALLAH, Durum(32).faz)
        assertEquals(32, Durum(32).fazSayisi)
        assertEquals(Faz.ELHAMDULILLAH, Durum(33).faz)
        assertEquals(0, Durum(33).fazSayisi)
        assertEquals(Faz.ALLAHU_EKBER, Durum(66).faz)
        assertEquals(Faz.TEHLIL, Durum(99).faz)
        assertEquals(0, Durum(99).fazSayisi)
        // Tamamken son faz dolu görünür.
        assertEquals(Faz.TEHLIL, Durum(100).faz)
        assertEquals(1f, Durum(100).fazIlerlemesi)
        assertEquals("Elhamdülillâh · 12/33", Tesbihat.kisaMetin(Durum(45)))
    }

    @Test
    fun tamamkenSaymakHicbirSeyDegistirmez() {
        val s = Tesbihat.say(Durum(100))
        assertEquals(Olay.YOK, s.olay)
        assertEquals(100, s.durum.toplam)
    }

    @Test
    fun geriAlmaSonDokunusuGeriAlirVeFazSinirindanGeriGecer() {
        assertEquals(Durum(32), Tesbihat.geriAl(Durum(33)).durum)
        assertEquals(Faz.SUBHANALLAH, Tesbihat.geriAl(Durum(33)).durum.faz)
        assertEquals(Olay.GERI_ALINDI, Tesbihat.geriAl(Durum(33)).olay)
        // Bitişten de geri alınabilir (100. dokunuş yanlışsa).
        assertEquals(Durum(99), Tesbihat.geriAl(Durum(100)).durum)
        // Sıfırda geri alma etkisiz.
        assertEquals(Olay.YOK, Tesbihat.geriAl(Durum(0)).olay)
        assertEquals(Durum(0), Tesbihat.geriAl(Durum(0)).durum)
    }

    @Test
    fun geriAlinanFazGecisiYenidenSayilincaYineGucluTitresir() {
        val geri = Tesbihat.geriAl(Durum(33)).durum
        assertEquals(Olay.FAZ_TAMAM, Tesbihat.say(geri).olay)
    }

    @Test
    fun sifirla() {
        assertEquals(Durum(0), Tesbihat.sifirla())
    }

    @Test
    fun yuklemeEskimeVeBozukKayit() {
        val simdi = 10_000_000L
        assertEquals(Durum(45), Tesbihat.yukle(45, simdi - 60_000L, simdi))
        // Eşik dahil korunur, aşınca sıfırdan.
        assertEquals(Durum(45), Tesbihat.yukle(45, simdi - Tesbihat.ESKIME_MS, simdi))
        assertEquals(Durum(0), Tesbihat.yukle(45, simdi - Tesbihat.ESKIME_MS - 1, simdi))
        // Saat geri alındı: süre ölçülemez → korunur.
        assertEquals(Durum(45), Tesbihat.yukle(45, simdi + 3_600_000L, simdi))
        // Bozuk değerler.
        assertEquals(Durum(0), Tesbihat.yukle(-3, simdi, simdi))
        assertEquals(Durum(0), Tesbihat.yukle(101, simdi, simdi))
        assertEquals(Durum(0), Tesbihat.yukle(0, simdi, simdi))
    }

    @Test
    fun surekliEtkinlikYalnizYarimOturumda() {
        assertFalse(Tesbihat.suruyorMu(Durum(0)))
        assertTrue(Tesbihat.suruyorMu(Durum(1)))
        assertTrue(Tesbihat.suruyorMu(Durum(99)))
        assertFalse(Tesbihat.suruyorMu(Durum(100)))
    }

    @Test(expected = IllegalArgumentException::class)
    fun aralikDisiDurumKurulamaz() {
        Durum(101)
    }

    @Test
    fun tehlilMetniDiyanetYazimi() {
        assertTrue(Tesbihat.TEHLIL_METNI.startsWith("Lâ ilâhe illallâhü vahdehû"))
        assertTrue(Tesbihat.TEHLIL_METNI.endsWith("alâ külli şey'in kadîr"))
        assertEquals("Müslim, Mesâcid 146", Tesbihat.KAYNAK)
        // Varsayılan dil Türkçe: dil parametreli yollar eski sabitlerle aynı.
        assertEquals(Tesbihat.TEHLIL_METNI, Tesbihat.tehlilMetni())
        assertEquals(Tesbihat.KAYNAK, Tesbihat.kaynak("tr"))
        assertEquals("Sübhânallah", Faz.SUBHANALLAH.ad)
        assertEquals("Lâ ilâhe illallâh", Faz.TEHLIL.ad("tr"))
    }

    /** Okunuşlar dile göre (sahip kararı 2026-10-25): çeviri değil, o dilin yaygın yazımı. */
    @Test
    fun okunuslarDileGore() {
        for (kod in listOf("tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur")) {
            for (f in Faz.entries) assertTrue("$kod $f", f.ad(kod).isNotBlank())
            assertTrue(kod, Tesbihat.tehlilMetni(kod).isNotBlank())
            assertTrue(kod, Tesbihat.kaynak(kod).isNotBlank())
        }
        assertEquals("Alhamdulillah · 12/33", Tesbihat.kisaMetin(Durum(45), "en"))
        assertEquals("Soubhanallah", Faz.SUBHANALLAH.ad("fr"))
        assertEquals("Allahuakbar", Faz.ALLAHU_EKBER.ad("ms"))
        assertEquals("HR. Muslim, Masajid 146", Tesbihat.kaynak("id"))
        assertEquals("HR. Muslim, Masajid 146", Tesbihat.kaynak("in"))
        assertEquals("Muslim, Masadschid 146", Tesbihat.kaynak("de"))
        assertEquals(Tesbihat.tehlilMetni("en"), Tesbihat.tehlilMetni("de"))
        assertEquals(Tesbihat.tehlilMetni("id"), Tesbihat.tehlilMetni("ms"))
        // Rusça Kiril yazılır.
        val kiril = Regex("^[\\u0400-\\u04FF0-9 ,.'-]+$")
        for (f in Faz.entries) assertTrue(f.ad("ru"), kiril.matches(f.ad("ru")))
        assertTrue(kiril.matches(Tesbihat.tehlilMetni("ru")))
        assertTrue(kiril.matches(Tesbihat.kaynak("ru")))
        // Bilinmeyen dil Türkçeye düşer.
        for (f in Faz.entries) assertEquals(f.ad("tr"), f.ad("xx"))
        assertEquals(Tesbihat.TEHLIL_METNI, Tesbihat.tehlilMetni("xx"))
        assertEquals(Tesbihat.KAYNAK, Tesbihat.kaynak("xx"))
        assertEquals(Tesbihat.kisaMetin(Durum(45)), Tesbihat.kisaMetin(Durum(45), "xx"))
    }

    // --- Taç / çerçeve ---------------------------------------------------------

    private val SAY = TacBiriktirici.Adim.SAY
    private val GERI = TacBiriktirici.Adim.GERI_AL
    private val YOK = TacBiriktirici.Adim.YOK

    @Test
    fun tacEsikDolunacaSayar() {
        val t = TacBiriktirici(esikPiksel = 10f)
        assertEquals(YOK, t.olay(4f, 0))
        assertEquals(YOK, t.olay(4f, 10))
        assertEquals(SAY, t.olay(4f, 20))
        // Birikim atıldı: hemen ardından küçük hareket adım üretmez.
        assertEquals(YOK, t.olay(4f, 400))
    }

    @Test
    fun tekBuyukSavurusTekSayim() {
        val t = TacBiriktirici(esikPiksel = 10f)
        assertEquals(SAY, t.olay(95f, 0))
        // Kalan 85 piksel taşınmaz.
        assertEquals(YOK, t.olay(1f, 500))
    }

    @Test
    fun tersYonSaymazGeriAlir() {
        // REGRESYON (sahip geri bildirimi): eskiden ters yön de SAYIYORDU.
        val t = TacBiriktirici(esikPiksel = 10f)
        assertEquals(GERI, t.olay(-12f, 0))
        assertEquals(SAY, t.olay(12f, 500))
        assertEquals(YOK, t.olay(-4f, 1_000))
        assertEquals(GERI, t.olay(-7f, 1_010)) // birikim -11
    }

    @Test
    fun yonDegisinceBirikimSifirlanir() {
        val t = TacBiriktirici(esikPiksel = 10f)
        assertEquals(YOK, t.olay(8f, 0))
        assertEquals(YOK, t.olay(-3f, 10))
        assertEquals(YOK, t.olay(-6f, 20))
        // -11: önceki +8 taşınmadı (yoksa -1 olurdu ve hiçbir şey olmazdı); ters yön GERİ ALIR.
        assertEquals(GERI, t.olay(-2f, 30))
    }

    @Test
    fun titreyenElIleriGeriHicbirSeyUretmez() {
        val t = TacBiriktirici(esikPiksel = 10f)
        var z = 0L
        repeat(40) { i -> assertEquals(YOK, t.olay(if (i % 2 == 0) 6f else -6f, z)); z += 15 }
    }

    @Test
    fun ciftSayimAraligiIcindekiAdimYutulur() {
        val t = TacBiriktirici(esikPiksel = 10f, enAzAralikMs = 120)
        assertEquals(SAY, t.olay(10f, 1_000))
        assertEquals(YOK, t.olay(10f, 1_050))
        assertEquals(SAY, t.olay(10f, 1_200))
    }

    @Test
    fun aralikIkiYondeDeGecerli() {
        // Sayımdan hemen sonra ters savuruş (ör. bezelin geri yaylanması) geri almaz.
        val t = TacBiriktirici(esikPiksel = 10f, enAzAralikMs = 120)
        assertEquals(SAY, t.olay(10f, 1_000))
        assertEquals(YOK, t.olay(-10f, 1_060))
        assertEquals(GERI, t.olay(-10f, 1_300))
    }

    @Test
    fun sifirVeNaNYokSayilir() {
        val t = TacBiriktirici(esikPiksel = 10f)
        assertEquals(YOK, t.olay(0f, 0))
        assertEquals(YOK, t.olay(Float.NaN, 0))
        assertEquals(SAY, t.olay(10f, 0))
    }

    // --- Haptik ----------------------------------------------------------------

    @Test
    fun desenlerBirbirindenAyrilirVeGucSirasiTutar() {
        val faz = TesbihatHaptik.FAZ_DESENI
        val bitis = TesbihatHaptik.BITIS_DESENI
        assertNotEquals(faz.toList(), bitis.toList())
        assertNotEquals(faz.toList(), TesbihatHaptik.GERI_AL_DESENI.toList())
        val tik = TesbihatHaptik.TIK_MS
        val geri = TesbihatHaptik.titresimSuresi(TesbihatHaptik.GERI_AL_DESENI)
        val fazSure = TesbihatHaptik.titresimSuresi(faz)
        val bitisSure = TesbihatHaptik.titresimSuresi(bitis)
        // Sayım < faz < bitiş: 33'ler ve bitiş ekrana bakmadan ayırt edilsin.
        assertTrue(tik < fazSure)
        assertTrue(geri < fazSure)
        assertTrue(fazSure < bitisSure)
    }

    // --- Tile kısayolu -----------------------------------------------------------

    @Test
    fun tileTesbihatKisayoluYalnizYapilacakIsYokken() {
        assertTrue(BugunTileKarari.tesbihatKisayoluGoster(onayVar = false, kalanVar = false))
        assertFalse(BugunTileKarari.tesbihatKisayoluGoster(onayVar = true, kalanVar = false))
        assertFalse(BugunTileKarari.tesbihatKisayoluGoster(onayVar = false, kalanVar = true))
    }
}
