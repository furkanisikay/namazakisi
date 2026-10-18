package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Bağımsız hatırlatma zinciri (issue #280): yalnız SIRADAKİ alarm kurulur, çalınca
 * gösterilir ve sonraki kurulur; kılınma (telefonda ya da saatte) kalan uyarıları
 * anında susturur; yeniden başlatma/saat değişimi zinciri baştan kurar.
 */
class AlarmZinciriTest {
    private val dk = 60_000L
    private val t0 = 1_791_800_000_000L

    private fun kayit(tarih: String, vakit: String, dakika: Long, seviye: Int = 1, acil: Boolean = false) = PlanKaydi(
        id = "muhafiz_${tarih}_vakit_${vakit}_seviye_${seviye}_dk_$dakika",
        ms = t0 + dakika * dk,
        tarih = tarih,
        vakit = vakit,
        seviye = seviye,
        baslik = "b",
        govde = "g",
        titresim = false,
        acil = acil,
    )

    private val dun = "2026-10-11"
    private val bugun = "2026-10-12"

    private fun yuk(plan: List<PlanKaydi>, kilinanBugun: Set<String> = emptySet(), surum: Int = 2) = Yuk(
        surum = surum,
        konumAdi = "x",
        kerahat = Kerahat(20, 5, 20),
        gunler = listOf(
            Gun(dun, VAKITLER.associateWith { 0L }, emptySet()),
            Gun(bugun, VAKITLER.associateWith { 0L }, kilinanBugun),
        ),
        plan = plan,
    )

    private val plan = listOf(
        kayit(dun, "yatsi", 10),
        kayit(bugun, "ogle", 20),
        kayit(bugun, "ogle", 30, seviye = 4, acil = true),
        kayit(bugun, "ikindi", 40),
    )

    /** Sahte AlarmManager — kurulan son alarmı ve türünü kaydeder. */
    private class SahteKurucu(var kesinIzin: Boolean = true) : AlarmKurucu {
        val olaylar = mutableListOf<String>()
        override fun kesinKurulabilirMi() = kesinIzin
        override fun kesinKur(ms: Long, kimlik: String) { olaylar += "kesin:$kimlik" }
        override fun yaklasikKur(ms: Long, kimlik: String) { olaylar += "yaklasik:$kimlik" }
        override fun iptal() { olaylar += "iptal" }
    }

    @Test
    fun siradakiSimdidenSonrakiEnErkenKayittir() {
        assertEquals(plan[0], AlarmZinciri.siradaki(yuk(plan), emptySet(), t0))
        assertEquals(plan[1], AlarmZinciri.siradaki(yuk(plan), emptySet(), t0 + 10 * dk))
        assertNull(AlarmZinciri.siradaki(yuk(plan), emptySet(), t0 + 40 * dk))
        assertNull(AlarmZinciri.siradaki(null, emptySet(), t0))
    }

    @Test
    fun telefondaKilinanVakitAtlanir() {
        val y = yuk(plan, kilinanBugun = setOf("ogle"))
        assertEquals(plan[3], AlarmZinciri.siradaki(y, emptySet(), t0 + 15 * dk))
    }

    @Test
    fun saatteIsaretlenenVakitHemenSusar() {
        // Telefon uzakta: onay gelmeden bekleyen kimlik zinciri o vakitten geçirir.
        val bekleyen = setOf(VakitHesabi.kimlik(bugun, "ogle"))
        assertEquals(plan[3], AlarmZinciri.siradaki(yuk(plan), bekleyen, t0 + 15 * dk))
        // Gece yarısı sonrası yatsı DÜNE aittir.
        assertEquals(plan[1], AlarmZinciri.siradaki(yuk(plan), setOf("${dun}_yatsi"), t0))
    }

    @Test
    fun tetiklenenGosterilirVeSonrakiKurulur() {
        val k = AlarmZinciri.tetiklendi(yuk(plan), emptySet(), t0 + 20 * dk, 0L)
        assertEquals(plan[1], k.goster)
        assertEquals(plan[2], k.sonraki)
    }

    @Test
    fun gecikmeyleBirikenlerdenYalnizSonuncusuGosterilir() {
        val k = AlarmZinciri.tetiklendi(yuk(plan), emptySet(), t0 + 31 * dk, 0L)
        assertEquals(plan[2], k.goster)
        assertEquals(plan[3], k.sonraki)
    }

    @Test
    fun cokEskiTetikVeAyniKayitIkinciKezGosterilmez() {
        // Saat kapalıydı: tolerans dışı → gürültü yapma, sıradakini kur.
        val seyrek = listOf(plan[1], plan[3])
        val eski = AlarmZinciri.tetiklendi(yuk(seyrek), emptySet(), t0 + 20 * dk + AlarmZinciri.GECIKME_TOLERANSI_MS + 1, 0L)
        assertNull(eski.goster)
        assertEquals(plan[3], eski.sonraki)
        // Yeniden başlatma sonrası aynı kayıt tekrar çalmaz.
        val tekrar = AlarmZinciri.tetiklendi(yuk(plan), emptySet(), t0 + 21 * dk, plan[1].ms)
        assertNull(tekrar.goster)
    }

    @Test
    fun kilinmisVakitTetiklenseBileGosterilmez() {
        val k = AlarmZinciri.tetiklendi(yuk(plan, kilinanBugun = setOf("ogle")), emptySet(), t0 + 30 * dk, 0L)
        assertNull(k.goster)
        assertEquals(plan[3], k.sonraki)
    }

    @Test
    fun yenidenKurKesinIzinVarsaKesinYoksaYaklasikPlanYoksaIptal() {
        val kurucu = SahteKurucu()
        val zincir = ZincirYoneticisi(kurucu)
        assertEquals(plan[1], zincir.yenidenKur(yuk(plan), emptySet(), t0 + 15 * dk))
        kurucu.kesinIzin = false
        zincir.yenidenKur(yuk(plan), emptySet(), t0 + 15 * dk)
        assertNull(zincir.yenidenKur(yuk(plan), emptySet(), t0 + 50 * dk))
        assertNull(zincir.yenidenKur(null, emptySet(), t0))
        assertEquals(
            listOf("kesin:${plan[1].id}", "yaklasik:${plan[1].id}", "iptal", "iptal"),
            kurucu.olaylar,
        )
    }

    @Test
    fun yenidenBaslatmaSonrasiYalnizGelecekKurulurGecmisCalinmaz() {
        // BOOT_COMPLETED: yeniden kurma gösterim yapmaz, yalnız sıradakini kurar.
        val kurucu = SahteKurucu()
        ZincirYoneticisi(kurucu).yenidenKur(yuk(plan), emptySet(), t0 + 25 * dk)
        assertEquals(listOf("kesin:${plan[2].id}"), kurucu.olaylar)
    }

    @Test
    fun v1YukundePlanYokZincirBos() {
        assertNull(AlarmZinciri.siradaki(yuk(emptyList(), surum = 1), emptySet(), t0))
    }

    @Test
    fun kopruYalnizSaatGosterebiliyorsaDislanir() {
        assertTrue(KopruKarari.muhafizKoprusuDislansinMi(yuk(plan), bildirimIzni = true))
        assertFalse(KopruKarari.muhafizKoprusuDislansinMi(yuk(plan), bildirimIzni = false))
        assertFalse(KopruKarari.muhafizKoprusuDislansinMi(yuk(emptyList(), surum = 1), bildirimIzni = true))
        assertFalse(KopruKarari.muhafizKoprusuDislansinMi(null, bildirimIzni = true))
        // Plan boşsa (telefon planı okuyamadı) köprü dışlanmaz: bilek uyarısız kalmasın.
        assertFalse(KopruKarari.muhafizKoprusuDislansinMi(yuk(emptyList()), bildirimIzni = true))
        // Şarjdayken (saat W3) saat çalmaz → köprü dışlanmaz, telefon esas olur.
        assertFalse(KopruKarari.muhafizKoprusuDislansinMi(yuk(plan), bildirimIzni = true, sarjda = true))
    }

    @Test
    fun sarjdaykenGosterilmezAmaZincirIlerler() {
        val y = yuk(plan)
        val ilk = plan.minBy { it.ms }
        val karar = AlarmZinciri.tetiklendi(y, emptySet(), ilk.ms, 0L, sarjda = true)
        assertEquals(null, karar.goster)
        assertEquals(AlarmZinciri.siradaki(y, emptySet(), ilk.ms), karar.sonraki)
        // Şarjdan çıkınca aynı tetik (tolerans içinde) yine gösterilebilir.
        assertEquals(ilk, AlarmZinciri.tetiklendi(y, emptySet(), ilk.ms, 0L).goster)
    }
}
