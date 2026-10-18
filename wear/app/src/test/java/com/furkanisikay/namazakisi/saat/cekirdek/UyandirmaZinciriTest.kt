package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Saat W3 (fikir 2): sessiz uyandırma zinciri — ortak fikstür `ornek-yuk.json`. */
class UyandirmaZinciriTest {
    private val yuk = (YukCozucu.coz(javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()) as CozumSonucu.Basarili).yuk
    private val teheccud = yuk.uyandirma[0]
    private val imsak = yuk.uyandirma[1]

    @Test
    fun siradakiVeCalacakKronolojik() {
        val d = UyandirmaZinciri.Durum()
        assertEquals(teheccud, UyandirmaZinciri.siradaki(yuk, emptySet(), d, teheccud.ms - 1)!!.kayit)
        assertEquals(teheccud, UyandirmaZinciri.calacak(yuk, emptySet(), d, teheccud.ms + 1_000)!!.kayit)
        // Aynı an ikinci kez çalmaz; tolerans dışı da çalmaz.
        val calindi = d.copy(calinan = mapOf(teheccud.id to teheccud.ms))
        assertNull(UyandirmaZinciri.calacak(yuk, emptySet(), calindi, teheccud.ms + 1_000))
        assertNull(UyandirmaZinciri.calacak(yuk, emptySet(), d, teheccud.ms + AlarmZinciri.GECIKME_TOLERANSI_MS + 1))
    }

    @Test
    fun sarjdaCalmazKapatilanVeKilinanAtlanir() {
        val d = UyandirmaZinciri.Durum()
        assertNull(UyandirmaZinciri.calacak(yuk, emptySet(), d, imsak.ms, sarjda = true))
        assertNull(UyandirmaZinciri.calacak(yuk, emptySet(), d.copy(kapatilan = setOf(imsak.id)), imsak.ms))
        // Sabah saatte işaretlendi (bekleyen) → uyandırma düşer; teheccüd (nafile) etkilenmez.
        val bekleyen = setOf(VakitHesabi.kimlik(imsak.tarih, "imsak"))
        assertNull(UyandirmaZinciri.calacak(yuk, bekleyen, d, imsak.ms))
        assertEquals(teheccud, UyandirmaZinciri.calacak(yuk, bekleyen, d, teheccud.ms)!!.kayit)
    }

    @Test
    fun erteleYeniAnaTasirSonaYakinErtelenmez() {
        val hedef = UyandirmaZinciri.erteleHedefi(teheccud, teheccud.ms)!!
        assertEquals(teheccud.ms + UyandirmaZinciri.ERTELEME_MS, hedef)
        val d = UyandirmaZinciri.Durum(ertelenen = mapOf(teheccud.id to hedef), calinan = mapOf(teheccud.id to teheccud.ms))
        assertEquals(hedef, UyandirmaZinciri.siradaki(yuk, emptySet(), d, teheccud.ms + 1)!!.ms)
        assertEquals(teheccud, UyandirmaZinciri.calacak(yuk, emptySet(), d, hedef)!!.kayit)
        // Pencere sonuna 10 dk'dan az kaldıysa ertele sunulmaz.
        assertNull(UyandirmaZinciri.erteleHedefi(teheccud, teheccud.sonMs - 5 * 60_000))
    }

    @Test
    fun ayniKimlikliMuhafizKaydiBastirilir() {
        val plan = PlanKaydi(imsak.id, imsak.ms, imsak.tarih, "imsak", 2, "b", "g", titresim = false, acil = false)
        val y = yuk.copy(plan = listOf(plan))
        assertTrue(imsak.id in UyandirmaZinciri.bastirilanlar(y))
        assertNull(AlarmZinciri.siradaki(y, emptySet(), imsak.ms - 1))
        assertNull(AlarmZinciri.tetiklendi(y, emptySet(), imsak.ms, 0L).goster)
        // Uyandırma listesi yoksa (telefon seçili) eski davranış birebir.
        val eski = y.copy(uyandirma = emptyList())
        assertEquals(plan, AlarmZinciri.siradaki(eski, emptySet(), imsak.ms - 1))
        assertFalse(UyandirmaZinciri.bastirilanlar(eski).isNotEmpty())
    }
}
