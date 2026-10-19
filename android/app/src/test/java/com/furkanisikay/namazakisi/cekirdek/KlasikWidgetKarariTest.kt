package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Klasik (yeşil) widget kararı. Sentetik iki gün: dakika cinsinden, gün başı 0.
 * Namaz günü `tarih` yükten gelir; yatsının gece yarısı sonrası kısmı dünün günüdür.
 */
class KlasikWidgetKarariTest {

    private val dk = 60_000L
    private val gun = 24 * 60 * dk

    private fun gunVakitleri(tarih: String, taban: Long) = listOf(
        VakitAni("sabah", taban + 300 * dk, tarih),
        VakitAni("gunes", taban + 400 * dk, tarih),
        VakitAni("ogle", taban + 780 * dk, tarih),
        VakitAni("ikindi", taban + 990 * dk, tarih),
        VakitAni("aksam", taban + 1160 * dk, tarih),
        VakitAni("yatsi", taban + 1240 * dk, tarih),
    )

    private val vakitler = gunVakitleri("2026-10-18", 0) + gunVakitleri("2026-10-19", gun)

    @Test
    fun sonrakiGirisGunesiAtlamaz() {
        // Sabah vakti içinde: sıradaki giriş güneş (eski widget "güneşe:" yazardı).
        val s = KlasikWidgetKarari.sonrakiGiris(vakitler, gun + 350 * dk)
        assertEquals("gunes", s?.kod)
        assertEquals("güneşe:", KlasikWidgetKarari.yonelmeHali(s!!.kod, buyukHarf = false))
        assertEquals("Güneşe", KlasikWidgetKarari.yonelmeHali(s.kod, buyukHarf = true))
    }

    @Test
    fun veriTukeninceSonrakiYok() {
        assertNull(KlasikWidgetKarari.sonrakiGiris(vakitler, 2 * gun + 1))
    }

    @Test
    fun geceYarisindanSonraListeDununGunudur() {
        // 19 Ekim 01:00 — yatsı sürüyor, liste 18 Ekim'in vakitleri, aktif satır yatsı.
        val satirlar = KlasikWidgetKarari.satirlar(vakitler, gun + 60 * dk)
        assertEquals(6, satirlar.size)
        assertEquals(1240 * dk, satirlar.first { it.kod == "yatsi" }.ms)
        assertEquals(listOf("yatsi"), satirlar.filter { it.aktif }.map { it.kod })
    }

    @Test
    fun gunesOgleArasindaAktifSatirGunes() {
        val satirlar = KlasikWidgetKarari.satirlar(vakitler, gun + 500 * dk)
        assertEquals(gun + 300 * dk, satirlar.first { it.kod == "sabah" }.ms)
        assertEquals(listOf("gunes"), satirlar.filter { it.aktif }.map { it.kod })
    }

    @Test
    fun ilkVakittenOnceAktifSatirYok() {
        // Verinin ilk girişinden önce: gün sıradakinin günü, aktif satır yok.
        val satirlar = KlasikWidgetKarari.satirlar(vakitler, 100 * dk)
        assertEquals(300 * dk, satirlar.first { it.kod == "sabah" }.ms)
        assertEquals(emptyList<String>(), satirlar.filter { it.aktif }.map { it.kod })
    }

    @Test
    fun bosVeriBosSaatler() {
        val satirlar = KlasikWidgetKarari.satirlar(emptyList(), 0)
        assertEquals(6, satirlar.size)
        assertEquals(6, satirlar.count { it.ms == null && !it.aktif })
    }

    @Test
    fun eskiEtiketlerKorunur() {
        assertEquals("İmsak", KlasikWidgetKarari.satirAdi("sabah"))
        assertEquals("İkindi", KlasikWidgetKarari.satirAdi("ikindi"))
        assertEquals("İkindiye", KlasikWidgetKarari.yonelmeHali("ikindi", buyukHarf = true))
        assertEquals("sabaha:", KlasikWidgetKarari.yonelmeHali("sabah", buyukHarf = false))
    }
}
