package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Kullanıcının seçtiği vakit adı takımı (`vakitAdlariniAyarla`): var → önce takım, yok /
 * boş / bozuk → dil tablosu; asla fırlatmaz. Saf: takım açıkça verilir (`etkin` kullanılmaz).
 */
class VakitAdlariTest {
    private val tam = """
        {"adlar":{"imsak":"Morgengebet","gunes":"Sonnenaufgang","ogle":"Mittagsgebet",
          "ikindi":"Nachmittagsgebet","aksam":"Abendgebet","yatsi":"Nachtgebet"},
         "buyuk":{"ogle":"MITTAGSGEBET"},"kucuk":{"ogle":"mittagsgebet"},
         "cuma":"Freitagsgebet","imsakVakti":"Imsak","gunesDogusu":"Sonnenaufgang"}
    """.trimIndent()

    @Test
    fun takimVarsaOnceTakim() {
        val t = VakitAdlari.coz(tam)!!
        assertEquals("Morgengebet", VakitKodlari.gorunenAd("sabah", "de", t))
        assertEquals("Mittagsgebet", VakitKodlari.gorunenAd("ogle", "de", t))
        assertEquals("Sonnenaufgang", VakitKodlari.gorunenAd("gunes", "de", t))
        assertEquals("Freitagsgebet", t.cuma)
        assertEquals("MITTAGSGEBET", t.buyuk["ogle"])
        assertEquals("mittagsgebet", t.kucuk["ogle"])
        assertEquals("Sonnenaufgang", t.gunesDogusu)
        // Klasik geniş widget'ın sabah satırı `imsakVakti`'dir.
        assertEquals("Imsak", KlasikWidgetKarari.satirAdi("sabah", "de", t))
        assertEquals("Abendgebet", KlasikWidgetKarari.satirAdi("aksam", "de", t))
        // Takım her dilde önce okunur (Türkçe arayüz + "Sabah/Öğle" seçen Almanca kullanıcı da).
        assertEquals("Mittagsgebet", VakitKodlari.gorunenAd("ogle", "tr", t))
        // Bilinmeyen kod aynen döner.
        assertEquals("xyz", VakitKodlari.gorunenAd("xyz", "de", t))
    }

    @Test
    fun takimYoksaDilTablosu() {
        assertNull(VakitAdlari.coz(null))
        assertNull(VakitAdlari.coz(""))
        assertNull(VakitAdlari.coz("   "))
        assertEquals("Öğle", VakitKodlari.gorunenAd("ogle", "tr", null))
        assertEquals("Dhuhr", VakitKodlari.gorunenAd("ogle", "en", null))
        assertEquals("İmsak", KlasikWidgetKarari.satirAdi("sabah", "tr", null))
    }

    @Test
    fun bozukTakimTabloyaDuser_firlatmaz() {
        for (ham in listOf("{", "[]", "null", "42", "\"adlar\"", "{}", """{"adlar":"Sabah"}""",
            """{"adlar":{"ogle":42,"ikindi":null,"aksam":""}}""", """{"adlar":{"bilinmeyen":"X"}}""")) {
            assertNull(ham, VakitAdlari.coz(ham))
        }
        assertEquals("Öğle", VakitKodlari.gorunenAd("ogle", "tr", VakitAdlari.coz("{bozuk")))
    }

    @Test
    fun eksikAlanYalnizOAlandaTabloyaDuser() {
        val t = VakitAdlari.coz("""{"adlar":{"ogle":"  Mittag  ","ikindi":""}}""")
        assertNotNull(t)
        assertEquals("Mittag", VakitKodlari.gorunenAd("ogle", "de", t))
        assertEquals("Asr", VakitKodlari.gorunenAd("ikindi", "en", t))
        assertEquals("Fajr", KlasikWidgetKarari.satirAdi("sabah", "en", t))
    }

    @Test
    fun yonelmeHaliTakimVarkenCekimsizKaliba() {
        val t = VakitAdlari.coz(tam)
        // Türkçe çekim ("öğleye:") kullanıcı adından türetilmez → çekimsiz kalıp.
        assertEquals("Mittagsgebet:", KlasikWidgetKarari.yonelmeHali("ogle", buyukHarf = false, dil = "tr", adlar = t))
        assertEquals("Mittagsgebet in", KlasikWidgetKarari.yonelmeHali("ogle", buyukHarf = true, dil = "de", adlar = t))
        // Takım yokken Türkçe çekim ve İngilizce kalıp aynen.
        assertEquals("öğleye:", KlasikWidgetKarari.yonelmeHali("ogle", buyukHarf = false, dil = "tr", adlar = null))
        assertEquals("Öğleye", KlasikWidgetKarari.yonelmeHali("ogle", buyukHarf = true, dil = "tr", adlar = null))
        assertEquals("Dhuhr in", KlasikWidgetKarari.yonelmeHali("ogle", buyukHarf = true, dil = "en", adlar = null))
    }

    @Test
    fun etkinTakimHamDegismedikceYenidenCozulmez() {
        try {
            VakitAdlari.etkinYap(tam)
            val ilk = VakitAdlari.etkin
            assertEquals("Mittagsgebet", VakitKodlari.gorunenAd("ogle", "de"))
            VakitAdlari.etkinYap(tam)
            assertEquals(true, ilk === VakitAdlari.etkin)
            VakitAdlari.etkinYap("{bozuk")
            assertNull(VakitAdlari.etkin)
            assertEquals("Öğle", VakitKodlari.gorunenAd("ogle"))
        } finally {
            VakitAdlari.etkinYap(null)
        }
    }
}
