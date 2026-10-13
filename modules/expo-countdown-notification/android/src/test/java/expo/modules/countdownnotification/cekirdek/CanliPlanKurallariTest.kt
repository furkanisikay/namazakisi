package expo.modules.countdownnotification.cekirdek

import expo.modules.countdownnotification.cekirdek.CanliPlanKurallari.Karar
import expo.modules.countdownnotification.cekirdek.CanliPlanKurallari.PlanOlayi
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Plan sözleşmesi — JS `canliSayacPlani.test.ts` aynı fikstürü ÜRETİR, burada çözülür. */
class CanliPlanKurallariTest {
    private val k = CanliPlanKurallari
    private val fikstur: String =
        javaClass.classLoader!!.getResource("canli-plan-ornegi.json")!!.readText()

    @Test
    fun ortakFiksturCozulur() {
        val plan = k.planiCoz(fikstur)
        assertEquals(4, plan.size)
        val ilk = plan.first { it.id == "iftar_sayac_2026-10-16" && it.eylem == "oneCikar" }
        assertEquals("sayac", ilk.kaynak)
        assertEquals("iftar", ilk.tema)
        assertEquals(33_600_000L, ilk.hedefMs)
        assertEquals(listOf(CanliGuncellemeKurallari.Bolum(770, false)), ilk.ek!!.bolumler)
        val ikindi = plan.first { it.id == "sayac_2026-10-16_ikindi" }
        assertEquals("2026-10-16", ikindi.ek!!.kildimTarih)
        assertEquals("ikindi", ikindi.ek!!.kildimVakit)
        // Kronolojik: gizleme (1. saat) ikindi sayacından (8. saat) önce gelir.
        assertEquals("gizle", plan[1].eylem)
        assertEquals("canli_sayac_kusluk_2026-10-16", plan[1].id)
    }

    @Test
    fun gidisDonusKayipsiz() {
        val plan = k.planiCoz(fikstur)
        assertEquals(plan, k.planiCoz(k.planJsonu(plan)))
    }

    @Test
    fun bozukOlayAtlanirPlanReddedilmez() {
        val json = """[{"anMs":1,"id":"a","eylem":"oneCikar","kaynak":"sayac","hedefMs":10},
            {"anMs":2,"id":"","eylem":"gizle"},{"anMs":3,"id":"b","eylem":"uydurma"},
            {"anMs":4,"id":"c","eylem":"normal","kaynak":"x","hedefMs":10},
            {"anMs":5,"id":"d","eylem":"oneCikar","kaynak":"nowBar","hedefMs":5},"bozuk"]"""
        assertEquals(listOf("a"), k.planiCoz(json).map { it.id })
        assertTrue(k.planiCoz("{").isEmpty())
        assertTrue(k.planiCoz(null).isEmpty())
    }

    @Test
    fun izinYoksaSayacSiradanNowBarGizli() {
        val sayac = PlanOlayi(0, "s", "oneCikar", "sayac", 10)
        val nowBar = PlanOlayi(0, "n", "oneCikar", "nowBar", 10)
        assertEquals(Karar.ONE_CIKAR, k.karar(sayac, true))
        assertEquals(Karar.NORMAL, k.karar(sayac, false))
        assertEquals(Karar.GIZLE, k.karar(nowBar, false))
        assertEquals(Karar.NORMAL, k.karar(sayac.copy(eylem = "normal"), true))
        assertEquals(Karar.GIZLE, k.karar(PlanOlayi(0, "g", "gizle"), true))
    }

    @Test
    fun vadesiGelenlerHerKimliginSonuncusu() {
        val plan = listOf(
            PlanOlayi(10, "a", "oneCikar", "sayac", 100),
            PlanOlayi(20, "b", "oneCikar", "nowBar", 100),
            PlanOlayi(20, "a", "normal", "sayac", 100),
            PlanOlayi(30, "c", "oneCikar", "sayac", 35),
            PlanOlayi(50, "b", "gizle"),
        )
        // İlk kurulum: şu anki hâl (a sıradan, b öne çıkmış; c'nin hedefi geçti)
        val ilk = k.vadesiGelenler(plan, Long.MIN_VALUE, 40)
        assertEquals(listOf("a" to "normal", "b" to "oneCikar"), ilk.map { it.id to it.eylem })
        // Alarm 50'de: yalnız (40, 50] aralığı
        assertEquals(listOf("b" to "gizle"), k.vadesiGelenler(plan, 40, 50).map { it.id to it.eylem })
        assertEquals(50L, k.sonrakiAlarm(plan, 40))
        assertNull(k.sonrakiAlarm(plan, 50))
    }

    @Test
    fun kimlikDusunceIleridekiOlaylariDaGider() {
        val plan = listOf(PlanOlayi(10, "a", "normal", "sayac", 100), PlanOlayi(20, "a", "oneCikar", "sayac", 100))
        assertTrue(k.kimligiDusur(plan, "a").isEmpty())
        assertEquals(setOf("x"), k.kaldirilacaklar(setOf("x", "a"), setOf("a")))
    }
}
