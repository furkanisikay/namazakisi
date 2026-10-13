package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.util.TimeZone

/**
 * Asistan (AppFunctions, issue #94) kararları — iOS Siri'nin (issue #279) ortak
 * fikstürüyle kilitli: `modules/expo-siri-kisayollari/test/siri-ornek.json`'u JS
 * (`siriKarari.test.ts`), Swift (`test/main.swift`) ve bu test AYNI beklenenlerle
 * doğrular. Biri değişip ötekiler değişmezse burası kırılır.
 */
class AsistanKarariTest {

    private val istanbul = TimeZone.getTimeZone("Europe/Istanbul")
    private val saat: (Long) -> String = { saatMetni(it, istanbul) }

    /** Fikstür `android/app/src/test` dışında: çalışma dizininden yukarı doğru aranır. */
    private fun fikstur(): JSONObject {
        var dizin: File? = File(System.getProperty("user.dir")).absoluteFile
        while (dizin != null) {
            val f = File(dizin, "modules/expo-siri-kisayollari/test/siri-ornek.json")
            if (f.isFile) return JSONObject(f.readText())
            dizin = dizin.parentFile
        }
        throw IllegalStateException("siri-ornek.json bulunamadı")
    }

    private fun vakitler(j: JSONObject): List<VakitAni> {
        val d = j.getJSONArray("vakitler")
        return (0 until d.length()).map { i ->
            val o = d.getJSONObject(i)
            VakitAni(o.getString("vakit"), o.getLong("ms"), o.getString("tarih"))
        }
    }

    private fun kilinanlar(o: JSONObject): Map<String, Set<String>> =
        o.keys().asSequence().associateWith { t ->
            val d = o.getJSONArray(t)
            (0 until d.length()).map { d.getString(it) }.toSet()
        }

    @Test
    fun ortakFiksturBirebirTutar() {
        val j = fikstur()
        assertEquals("Europe/Istanbul", j.getString("saatDilimi"))
        val v = vakitler(j)
        val durumlar = j.getJSONArray("durumlar")
        assertTrue(durumlar.length() >= 10)
        for (i in 0 until durumlar.length()) {
            val d = durumlar.getJSONObject(i)
            val ad = d.getString("ad")
            val simdi = d.getLong("simdiMs")
            val bugun = d.getString("bugun")
            val bek = d.getJSONArray("bekleyenler")
            val bekleyenler = (0 until bek.length()).map {
                val o = bek.getJSONObject(it)
                kildimKimligi(o.getString("tarih"), o.getString("vakit"))
            }.toSet()
            val durum = VakitCizelgesi.durumHesapla(v, simdi)
            val kildim = KildimDurumKarari.hesapla(durum, kilinanlar(d.getJSONObject("kilinanlar")), bekleyenler)
            val b = d.getJSONObject("beklenen")

            assertEquals(ad, b.getString("siradakiMetni"), AsistanKarari.siradakiNamazMetni(durum, kildim, bugun, saat))

            val karar = AsistanKarari.kildimKarari(durum, kildim)
            val bk = b.getJSONObject("kildim")
            when (bk.getString("tur")) {
                "aday" -> {
                    val a = karar as AsistanKarari.KildimKarari.Aday
                    assertEquals(ad, bk.getString("tarih"), a.vakit.tarih)
                    assertEquals(ad, bk.getString("kayitVakti"), a.kayitVakti)
                    assertEquals(ad, bk.getString("ad"), a.ad)
                    assertEquals(ad, b.getString("onayMetni"), AsistanKarari.onayMetni(a.ad))
                }
                "zatenKilindi" -> assertEquals(ad, bk.getString("ad"), (karar as AsistanKarari.KildimKarari.ZatenKilindi).ad)
                "vakitYok" -> {
                    val s = (karar as AsistanKarari.KildimKarari.VakitYok).siradaki
                    if (bk.isNull("siradaki")) assertNull(ad, s)
                    else assertEquals(ad, bk.getJSONObject("siradaki").getString("vakit"), s!!.kod)
                }
                else -> throw AssertionError("bilinmeyen tür: $ad")
            }
            assertEquals(ad, b.getString("kildimMetni"), AsistanKarari.kildimMetni(karar, bugun, saat))
        }
    }

    private val aday = AsistanKarari.KildimKarari.Aday(VakitAni("sabah", 0L, "2026-06-21"), "imsak", "Sabah")

    @Test
    fun ilkCagriYazmazSoruDoner() {
        val adim = AsistanKarari.kildimAdimi(aday, null)
        adim as AsistanKarari.KildimAdimi.OnayIste
        assertEquals("Sabah namazı kılındı olarak işaretlensin mi?", adim.soru)
        // Onay kimliği kuyruk kimliğidir ve KAYIT kodunu taşır (`sabah` değil `imsak`).
        assertEquals("2026-06-21_imsak", adim.aday.onayKimligi)
        assertTrue(AsistanKarari.kildimAdimi(aday, "  ") is AsistanKarari.KildimAdimi.OnayIste)
    }

    @Test
    fun eslesenOnayIsaretler() {
        val adim = AsistanKarari.kildimAdimi(aday, "2026-06-21_imsak")
        assertEquals(aday, (adim as AsistanKarari.KildimAdimi.Isaretle).aday)
    }

    @Test
    fun aradaVakitDegistiyseIsaretlemez() {
        // Kullanıcı sabahı onayladı ama asistan cevabı geldiğinde vakit öğleye dönmüş.
        val ogle = AsistanKarari.KildimKarari.Aday(VakitAni("ogle", 0L, "2026-06-21"), "ogle", "Öğle")
        assertSame(AsistanKarari.KildimAdimi.VakitDegisti, AsistanKarari.kildimAdimi(ogle, "2026-06-21_imsak"))
        // Dünün yatsısı ile bugünün yatsısı da ayrı vakittir.
        val yatsi = AsistanKarari.KildimKarari.Aday(VakitAni("yatsi", 0L, "2026-06-22"), "yatsi", "Yatsı")
        assertSame(AsistanKarari.KildimAdimi.VakitDegisti, AsistanKarari.kildimAdimi(yatsi, "2026-06-21_yatsi"))
    }

    @Test
    fun yazilacakBirSeyYoksaOnayKimligiYokSayilir() {
        val k = AsistanKarari.KildimKarari.ZatenKilindi("Öğle")
        assertEquals(AsistanKarari.KildimAdimi.Bilgi(k), AsistanKarari.kildimAdimi(k, "2026-06-21_ogle"))
        val y = AsistanKarari.KildimKarari.VakitYok(null)
        assertEquals(AsistanKarari.KildimAdimi.Bilgi(y), AsistanKarari.kildimAdimi(y, null))
    }

    @Test
    fun kalanDakikaYukariYuvarlanir() {
        assertEquals(1, AsistanKarari.kalanDakika(1_000, 0))
        assertEquals(1, AsistanKarari.kalanDakika(60_000, 0))
        assertEquals(2, AsistanKarari.kalanDakika(60_001, 0))
        assertEquals(0, AsistanKarari.kalanDakika(0, 0))
        assertEquals(0, AsistanKarari.kalanDakika(0, 5_000))
    }

    @Test
    fun isoZamanYerelSaatVeOfsetTasir() {
        // Fikstürdeki 2026-06-21 öğle girişi: 13:11 İstanbul.
        assertEquals("2026-06-21T13:11:00+03:00", AsistanKarari.isoZaman(1782036660000, istanbul))
        assertEquals("2026-06-21", AsistanKarari.takvimGunu(1782036660000, istanbul))
        assertEquals("2026-06-21T10:11:00Z", AsistanKarari.isoZaman(1782036660000, TimeZone.getTimeZone("UTC")))
    }
}
