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

    /**
     * NÖBETÇİ — ERTELE YOK (sahip kararı 2026-10-19): çalınmış uyandırma aynı kimlikle
     * BİR DAHA çalmaz ve yeni bir ana kaymaz; sıradaki, yükteki bir sonraki tetiktir.
     */
    @Test
    fun calinanUyandirmaYenidenCalmazVeKaymaz() {
        val d = UyandirmaZinciri.Durum(calinan = mapOf(teheccud.id to teheccud.ms))
        for (dk in listOf(1L, 5L, 10L)) {
            assertNull(UyandirmaZinciri.calacak(yuk, emptySet(), d, teheccud.ms + dk * 60_000))
        }
        UyandirmaZinciri.siradaki(yuk, emptySet(), d, teheccud.ms + 1)?.let {
            assertTrue(it.kayit.id != teheccud.id)
            assertEquals(it.kayit.ms, it.ms)
        }
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

    /** NÖBETÇİ (inceleme bulgusu 8): teheccüd Kıldım o gecenin TÜM teheccüd uyandırmalarını kapsar. */
    @Test
    fun teheccudKildimGeceninTumunuKapsar() {
        val tekrar = teheccud.copy(id = teheccud.id.substringBeforeLast('_') + "_5", ms = teheccud.ms + 10 * 60_000)
        val baskaGece = teheccud.copy(id = "nafile_2099-01-01_teheccud_5", tarih = "2099-01-01")
        val y = yuk.copy(uyandirma = yuk.uyandirma + tekrar + baskaGece)
        val kapsam = UyandirmaZinciri.kildimKapsami(y, teheccud)
        assertTrue(teheccud.id in kapsam && tekrar.id in kapsam)
        assertFalse(baskaGece.id in kapsam)
        assertFalse(imsak.id in kapsam)
        // Sabah (farz) yalnız kendisi.
        assertEquals(setOf(imsak.id), UyandirmaZinciri.kildimKapsami(y, imsak))
    }
}
