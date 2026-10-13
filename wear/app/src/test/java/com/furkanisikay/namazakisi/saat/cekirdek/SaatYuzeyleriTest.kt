package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Issue #281 yüzeyleri: gün durumu (Bugün tile'ı + ilerleme/dağılım
 * komplikasyonları), kerahat çizelgesi, son dakikalar penceresi ve tile'ın iki
 * dokunuşlu onayı.
 */
class SaatYuzeyleriTest {
    private val dk = 60_000L
    private val yuk = (YukCozucu.coz(
        javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
    ) as CozumSonucu.Basarili).yuk
    private val dun = yuk.gunler[0]
    private val bugun = yuk.gunler[1]
    private fun v(g: Gun, ad: String) = g.vakitler.getValue(ad)

    /** Test yükünde günler sıralı; ms → o anın aktif takvim günü (imsak öncesi dahil bugün). */
    private val tarihBul: (Long) -> String = { ms ->
        yuk.gunler.lastOrNull { it.vakitler.getValue("imsak") - 6 * 60 * dk <= ms }?.tarih ?: dun.tarih
    }

    // --- Gün durumu -------------------------------------------------------------

    @Test
    fun gunOzetiBesFarzVeGunesYok() {
        val an = v(bugun, "ogle") + 10 * dk
        val ozet = GunDurumu.ozet(yuk, an, bugun.tarih, emptySet())!!
        assertEquals(5, ozet.satirlar.size)
        assertFalse(ozet.satirlar.any { it.vakit == "gunes" })
        assertEquals(listOf("imsak", "ogle", "ikindi", "aksam", "yatsi"), ozet.satirlar.map { it.vakit })
    }

    @Test
    fun gunOzetiHalleriVeIyimserIsaret() {
        val an = v(bugun, "ogle") + 10 * dk
        val once = GunDurumu.ozet(yuk, an, bugun.tarih, emptySet())!!
        // Örnek yükte bugünün sabahı kılınmış.
        assertEquals(GunDurumu.Hal.KILINDI, once.haller[0])
        assertEquals(GunDurumu.Hal.KALAN, once.haller[1])
        assertEquals(GunDurumu.Hal.GIRMEDI, once.haller[2])
        val sonra = GunDurumu.ozet(yuk, an, bugun.tarih, setOf(VakitHesabi.kimlik(bugun.tarih, "ogle")))!!
        assertEquals(once.kilinanSayisi + 1, sonra.kilinanSayisi)
        assertEquals("●●○○○", GunDurumu.noktalar(sonra))
        assertEquals("●◐○○○", GunDurumu.noktalar(once))
    }

    @Test
    fun gunCizelgesiVakitSinirlarindaDegisir() {
        val an = v(bugun, "ogle") + 10 * dk
        val cizelge = GunDurumu.cizelge(yuk, an, emptySet(), tarihBul)
        assertEquals(an, cizelge[0].baslangic)
        assertEquals(v(bugun, "ikindi"), cizelge[0].bitis)
        for (i in 1 until cizelge.size) assertEquals(cizelge[i - 1].bitis, cizelge[i].baslangic)
        // İkindi girince ikindi KALAN olur.
        assertEquals(GunDurumu.Hal.KALAN, cizelge[1].ozet.haller[2])
        assertEquals(bugun.tarih, cizelge[1].ozet.tarih)
    }

    @Test
    fun gunCizelgesiGirdiSiniriUygulanir() {
        val cizelge = GunDurumu.cizelge(yuk, v(dun, "imsak") - dk, emptySet(), tarihBul, maksGirdi = 4)
        assertEquals(4, cizelge.size)
    }

    // --- Kerahat ----------------------------------------------------------------

    @Test
    fun kerahatCizelgesiVakitHesabiIleAyniKurali() {
        val an = v(bugun, "imsak")
        val cizelge = KerahatCizelgesi.cizelge(yuk, an)
        assertFalse(cizelge[0].icinde)
        assertEquals(v(bugun, "gunes"), cizelge[0].hedefMs)
        assertTrue(cizelge[1].icinde)
        assertEquals(v(bugun, "gunes") + yuk.kerahat.surukDk * dk, cizelge[1].hedefMs)
        for (a in cizelge) {
            val orta = (a.baslangic + a.bitis) / 2
            assertEquals("aralik ${a.baslangic}", a.icinde, VakitHesabi.kerahatMi(yuk, orta))
        }
        for (i in 1 until cizelge.size) assertEquals(cizelge[i - 1].bitis, cizelge[i].baslangic)
    }

    @Test
    fun kerahatIcindeBaslarsaIlkAralikIcindedir() {
        val an = v(bugun, "aksam") - 5 * dk
        val ilk = KerahatCizelgesi.cizelge(yuk, an).first()
        assertTrue(ilk.icinde)
        assertEquals(an, ilk.baslangic)
        assertEquals(v(bugun, "aksam"), ilk.bitis)
    }

    // --- Son dakikalar ----------------------------------------------------------

    private fun kayit(tarih: String, vakit: String, ms: Long, seviye: Int) = PlanKaydi(
        id = "muhafiz_${tarih}_vakit_${vakit}_seviye_${seviye}_$ms",
        ms = ms, tarih = tarih, vakit = vakit, seviye = seviye,
        baslik = "b", govde = "g", titresim = false, acil = seviye >= 3,
    )

    private fun planli(vararg kayitlar: PlanKaydi) = yuk.copy(plan = kayitlar.sortedBy { it.ms })

    @Test
    fun sonPencereEnSertAdimlaAcilirCikistaKapanir() {
        val cikis = v(bugun, "aksam")
        val y = planli(
            kayit(bugun.tarih, "ikindi", cikis - 45 * dk, 1),
            kayit(bugun.tarih, "ikindi", cikis - 10 * dk, 3),
            kayit(bugun.tarih, "ikindi", cikis - 3 * dk, 4),
            kayit(bugun.tarih, "ikindi", cikis - 2 * dk, 4),
        )
        val p = SonDakikalar.pencereler(y).single()
        assertEquals(cikis - 3 * dk, p.bas)
        assertEquals(cikis, p.bitis)
        assertNull(SonDakikalar.aktif(y, emptySet(), cikis - 4 * dk))
        assertEquals("ikindi", SonDakikalar.aktif(y, emptySet(), cikis - 3 * dk)!!.vakit)
        assertNull("vakit bitince kalkar", SonDakikalar.aktif(y, emptySet(), cikis))
    }

    @Test
    fun kilinincaSonPencereKalkar() {
        val cikis = v(bugun, "aksam")
        val y = planli(kayit(bugun.tarih, "ikindi", cikis - 5 * dk, 4))
        assertNotNull(SonDakikalar.aktif(y, emptySet(), cikis - dk))
        assertNull(SonDakikalar.aktif(y, setOf(VakitHesabi.kimlik(bugun.tarih, "ikindi")), cikis - dk))
    }

    @Test
    fun girisYonundeUzunAdimTavanaKirpilirVePlanKaydinaOturur() {
        // Yatsı: giriş yönünde en sert adım girişten 30 dk sonra başlar, sabaha kadar
        // her 40 dk tekrar eder → pencere en erken çıkış − 60 dk'daki İLK kayıtta açılır.
        val giris = v(dun, "yatsi")
        val cikis = v(bugun, "imsak")
        val kayitlar = mutableListOf<PlanKaydi>()
        var t = giris + 30 * dk
        while (t < cikis) { kayitlar += kayit(dun.tarih, "yatsi", t, 4); t += 40 * dk }
        val y = planli(*kayitlar.toTypedArray())
        val p = SonDakikalar.pencereler(y).single()
        assertEquals(cikis, p.bitis)
        assertTrue(p.bas >= cikis - SonDakikalar.TAVAN_MS)
        assertTrue("acilis bir plan kaydina oturur", kayitlar.any { it.ms == p.bas })
    }

    @Test
    fun tavandanSonraKayitYoksaPencereYok() {
        val cikis = v(bugun, "aksam")
        val y = planli(kayit(bugun.tarih, "ikindi", cikis - 90 * dk, 4))
        assertTrue(SonDakikalar.pencereler(y).isEmpty())
    }

    @Test
    fun yatsiCikisiErtesiImsakSonGundeBilinmez() {
        assertEquals(v(bugun, "imsak"), SonDakikalar.cikis(yuk, dun.tarih, "yatsi"))
        assertNull(SonDakikalar.cikis(yuk, yuk.gunler.last().tarih, "yatsi"))
        assertEquals(v(bugun, "gunes"), SonDakikalar.cikis(yuk, bugun.tarih, "imsak"))
    }

    @Test
    fun planBossaSonPencereYok() {
        assertNull(SonDakikalar.aktif(yuk.copy(plan = emptyList()), emptySet(), v(bugun, "aksam") - dk))
    }

    // --- Bugün tile'ı: iki dokunuşlu onay ---------------------------------------

    private val kimlik = "2026-10-12_ogle"
    private val hep: (String) -> Boolean = { true }

    @Test
    fun ilkDokunusOnayBekletir() {
        val k = BugunTileKarari.karar(BugunTileKarari.secKimligi(kimlik, 100), null, 1_000, hep)
        assertEquals(BugunTileKarari.Karar.OnayBekle(kimlik, 1_000, 1_000 + BugunTileKarari.ONAY_SURESI_MS), k)
    }

    @Test
    fun sekizSaniyeIcindekiIkinciDokunusIsaretler() {
        val secim = 5_000L
        val id = BugunTileKarari.onayKimligi(kimlik, secim)
        assertEquals(BugunTileKarari.Karar.Isaretle(kimlik), BugunTileKarari.karar(id, null, secim + 7_999, hep))
        assertEquals(BugunTileKarari.Karar.Isaretle(kimlik), BugunTileKarari.karar(id, null, secim + 8_000, hep))
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar(id, null, secim + 8_001, hep))
    }

    @Test
    fun ayniKimlikIkinciKezIslenmez() {
        val id = BugunTileKarari.onayKimligi(kimlik, 5_000)
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar(id, id, 6_000, hep))
        val sec = BugunTileKarari.secKimligi(kimlik, 5_000)
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar(sec, sec, 6_000, hep))
    }

    @Test
    fun isaretlenemeyenVakitVeBozukKimlikYok() {
        val id = BugunTileKarari.onayKimligi(kimlik, 5_000)
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar(id, null, 6_000) { false })
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar("uygulamayi_ac", null, 6_000, hep))
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar("", null, 6_000, hep))
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar(null, null, 6_000, hep))
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar("sil|$kimlik|1", null, 6_000, hep))
    }

    @Test
    fun saatGeriAlinincaOnayGecersiz() {
        val id = BugunTileKarari.onayKimligi(kimlik, 10_000)
        assertEquals(BugunTileKarari.Karar.Yok, BugunTileKarari.karar(id, null, 9_000, hep))
    }
}
