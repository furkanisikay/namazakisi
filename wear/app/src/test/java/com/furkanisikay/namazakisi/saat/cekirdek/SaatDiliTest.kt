package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Çekirdek metinlerinin dili (W5): Türkçe varsayılan DEĞİŞMEDİ (eski testler aynı), İngilizce
 * karşılıklar JS sözlüğüyle (`src/core/dil/sozluk/en`) aynı terimleri kullanır.
 */
class SaatDiliTest {
    private val dk = 60_000L
    private val vakitler = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")
    private val yuk = (YukCozucu.coz(
        javaClass.classLoader!!.getResource("ornek-yuk.json")!!.readText()
    ) as CozumSonucu.Basarili).yuk
    private val bugun = yuk.gunler[1]
    private fun v(ad: String) = bugun.vakitler.getValue(ad)
    private val turkceHarf = Regex("[çğıöşüÇĞİÖŞÜ]")

    @Test
    fun turkceTabloEskiAdlarlaAyni_desteklenmeyenDilTurkceyeDuser() {
        for (v in vakitler) assertEquals(VakitHesabi.ADLAR[v], SaatDiliTr.vakitAdi(v))
        assertSame(SaatDiliTr, saatDili("tr"))
        assertSame(SaatDiliEn, saatDili("en"))
        assertSame(SaatDiliTr, saatDili("xx"))
        // Varsayılan parametre Türkçedir: açık "tr" ile aynı sonuç.
        assertEquals(KalanSure.gosterim("ogle", "ikindi"), KalanSure.gosterim("ogle", "ikindi", "tr"))
        assertEquals(AnaEkranKarari.kur(yuk, v("ogle") + 10 * dk, bugun.tarih, emptySet()),
            AnaEkranKarari.kur(yuk, v("ogle") + 10 * dk, bugun.tarih, emptySet(), "tr"))
    }

    @Test
    fun ingilizceVakitAdlariTerimSozlugunden() {
        assertEquals(
            listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"),
            vakitler.map { VakitHesabi.ad(it, "en") },
        )
    }

    @Test
    fun ingilizceKalanSureEtiketleri() {
        val c = KalanSure.gosterim("ogle", "ikindi", "en")
        assertEquals(KalanSure.Mod.CIKIS, c.mod)
        assertEquals("Dhuhr", c.kisaBaslik)
        assertEquals("Dhuhr ends in", c.uzunBaslik)
        assertEquals("Time left until Dhuhr ends", c.aciklama)
        val g = KalanSure.gosterim("gunes", "ogle", "en")
        assertEquals(KalanSure.Mod.GIRIS, g.mod)
        assertEquals("Dhuhr", g.kisaBaslik)
        assertEquals("Dhuhr in", g.uzunBaslik)
        assertEquals("Time left until Dhuhr", g.aciklama)
        // Sabah güneşte çıkar: güneş namaz adı gibi görünmez.
        assertEquals("Fajr ends in", KalanSure.gosterim("imsak", "gunes", "en").uzunBaslik)
    }

    /** SHORT_TEXT başlığı ~7 karakter taşır ("Maghrib", "Sunrise"); saat sızmaz. */
    @Test
    fun ingilizceKisaBasliklarYediKarakteriAsmaz() {
        val saat = Regex("""\d{1,2}:\d{2}""")
        for (onceki in vakitler + listOf<String?>(null)) {
            for (siradaki in vakitler) {
                val g = KalanSure.gosterim(onceki, siradaki, "en")
                assertTrue("$onceki→$siradaki: ${g.kisaBaslik}", g.kisaBaslik.length <= 7)
                for (m in listOf(g.kisaBaslik, g.uzunBaslik, g.aciklama)) assertFalse(m, saat.containsMatchIn(m))
                assertTrue(VakitSiniri.cikisSaati(onceki, siradaki, "00:00", "en").kisaBaslik.length <= 7)
            }
            if (onceki != null) assertTrue(VakitSiniri.siradaki(onceki, "00:00", "en").kisaBaslik.length <= 7)
        }
    }

    @Test
    fun ingilizceVakitSiniriVeSiradakiNamaz() {
        val c = VakitSiniri.cikisSaati("ogle", "ikindi", "15:42", "en")
        assertEquals("Ends", c.kisaBaslik)
        assertEquals("15:42", c.kisaMetin)
        assertEquals("Dhuhr ends 15:42", c.uzunMetin)
        val g = VakitSiniri.cikisSaati("gunes", "ogle", "13:05", "en")
        assertEquals("Begins", g.kisaBaslik)
        assertEquals("Dhuhr begins 13:05", g.uzunMetin)
        val s = VakitSiniri.siradaki("ikindi", "15:42", "en")
        assertEquals("Asr", s.kisaBaslik)
        assertEquals("Next: Asr 15:42", s.uzunMetin)
    }

    @Test
    fun ingilizceAnaEkran() {
        val g = AnaEkranKarari.kur(yuk, v("ogle") + 10 * dk, bugun.tarih, emptySet(), "en")!!
        assertEquals("Dhuhr", g.adSatiri)
        assertEquals("until it ends", g.altYazi)
        assertTrue(g.aciklama, g.aciklama.startsWith("Dhuhr ends in "))
        assertTrue(g.sayac.parcalar.map { it.birim }.all { it in setOf("h", "min", "s") })

        val acil = AnaEkranKarari.kur(yuk, v("ikindi") - 10 * dk, bugun.tarih, emptySet(), "en")!!
        assertEquals("Dhuhr · last 15 min", acil.adSatiri)
        assertTrue(acil.aciklama.contains("last 15 minutes"))

        val giris = AnaEkranKarari.kur(yuk, v("gunes") + 30 * dk, bugun.tarih, emptySet(), "en")!!
        assertEquals("until it begins", giris.altYazi)
        assertTrue(giris.aciklama.startsWith("Dhuhr begins in "))

        assertEquals("Mark Dhuhr as prayed", AnaEkranKarari.dugmeAciklamasi("Dhuhr", "en"))
        assertEquals("Have you prayed Asr?", AnaEkranKarari.onaySorusu("Asr", "en"))
        val (ilk, ikinci) = AnaEkranKarari.onaySorusuSatirlari("Asr", "en")
        assertEquals(AnaEkranKarari.onaySorusu("Asr", "en"), "$ilk $ikinci")
        assertEquals("May Allah accept it", AnaEkranKarari.kabulDuasi("en"))
        // Türkçe sabitler aynı kaldı (eski çağıranlar ve testler).
        assertEquals(AnaEkranKarari.KABUL_DUASI, AnaEkranKarari.kabulDuasi())
        assertEquals(AnaEkranKarari.VAKIT_DEGISTI, AnaEkranKarari.vakitDegisti())
    }

    @Test
    fun ingilizceSureMetinleri() {
        assertEquals("<1 min", VakitHesabi.kalanMetni(30_000L, "en"))
        assertEquals("12 min", VakitHesabi.kalanMetni(12 * dk, "en"))
        assertEquals("2 h", VakitHesabi.kalanMetni(120 * dk, "en"))
        assertEquals("1 h 12 min", VakitHesabi.kalanMetni(72 * dk, "en"))
        assertEquals("less than 1 minute", VakitHesabi.kalanSesliMetni(30_000L, "en"))
        assertEquals("1 minute", VakitHesabi.kalanSesliMetni(dk, "en"))
        assertEquals("1 hour", VakitHesabi.kalanSesliMetni(60 * dk, "en"))
        assertEquals("1 hour 58 minutes", VakitHesabi.kalanSesliMetni(118 * dk, "en"))
        assertEquals("2 hours 1 minute", VakitHesabi.kalanSesliMetni(121 * dk, "en"))
        // Türkçe değişmedi.
        assertEquals("1 sa 12 dk", VakitHesabi.kalanMetni(72 * dk))
        assertEquals("1 saat 58 dakika", VakitHesabi.kalanSesliMetni(118 * dk))
    }

    @Test
    fun ingilizceKible() {
        assertEquals("You are facing the Qibla", KibleKarari.erisimMetni(12.0, hizali = true, dil = "en"))
        assertEquals("The Qibla is 40° to your right", KibleKarari.erisimMetni(38.0, false, "en"))
        assertEquals("The Qibla is 90° to your left", KibleKarari.erisimMetni(270.0, false, "en"))
        assertEquals("The Qibla is behind you", KibleKarari.erisimMetni(178.0, false, "en"))
        assertEquals("Right 35°", KibleKarari.donusMetni(33.0, "en"))
        assertEquals("Left 90°", KibleKarari.donusMetni(270.0, "en"))
        assertEquals("Behind you", KibleKarari.donusMetni(178.0, "en"))
    }

    @Test
    fun ingilizceTelefonKomutlariVeSesliOkuma() {
        assertEquals("Prayer mode on · ends 13:40", TelefonKomutu.modMetni("acildi", "13:40", "en"))
        assertEquals("Turn on Prayer mode once on your phone", TelefonKomutu.modMetni("erisimYok", null, "en"))
        assertEquals("Your phone can't be reached", TelefonKomutu.modMetni(TelefonKomutu.ULASILAMADI, null, "en"))
        assertEquals("This place won't count as a mosque again", TelefonKomutu.camiMetni("camiDegil", "tamam", "en"))
        assertEquals("This question is no longer valid", TelefonKomutu.camiMetni("evet", "gecersiz", "en"))
        assertTrue(AnonsKarari.bilgiMetni(AnonsYerleri.SAAT, false, AnonsKarari.SesDurumu.KONUSTU, "en")!!.contains("speaker"))
        assertEquals("The sound worked", AnonsKarari.denemeSonucu(AnonsKarari.SesDurumu.KONUSTU, true, "en"))
    }

    @Test
    fun ingilizceTesbihatAmbient() {
        val tamam = TesbihatAmbient.icerik(Tesbihat.Durum(Tesbihat.TOPLAM), "en")
        assertEquals("May Allah accept it", tamam.baslik)
        assertTrue(tamam.aciklama.startsWith("Tasbih completed. May Allah accept it"))
        val sayim = TesbihatAmbient.icerik(Tesbihat.Durum(45), "en")
        // Zikir adı çeviri değil, İngilizce konuşan Müslümanların yaygın okunuşu.
        assertEquals("Alhamdulillah, 12 / 33. Total 45 / 100", sayim.aciklama)
    }

    /** İngilizce çıktılarda Türkçe harf kalmaz (yarım dil yok). */
    @Test
    fun ingilizceCiktidaTurkceHarfYok() {
        val en = SaatDiliEn
        val metinler = vakitler.map { en.vakitAdi(it) } + listOf(
            en.birDakikadanAzKisa, en.birDakikadanAzSesli, en.cikisBasligi, en.girisBasligi,
            en.altYazi(KalanSure.Mod.CIKIS), en.altYazi(KalanSure.Mod.GIRIS), en.kilindiEki, en.vakitDegisti,
            en.kabulDuasi, en.kibleHizali, en.kibleArkada, en.donusArkada, en.namazModuAcik, en.namazModuKapandi,
            en.namazModuTelefondaAcin, en.telefonaUlasilamadi, en.namazModuAcilamadi, en.camiKaydedildi,
            en.camiBirDahaSorulmaz, en.camiSayilmaz, en.soruGecersiz, en.islemYapilamadi, en.hoparlorYokBilgi,
            en.motorYokBilgi, en.sesYokBilgi, en.otomatikYerAciklamasi, en.saatYerAciklamasi, en.hoparlorYok,
            en.sesCalisti, en.motorYok, en.sesYok, en.sesCalinamadi, en.tesbihatTamamlandi, en.toplam,
            en.zikirSubhanallah, en.zikirElhamdulillah, en.zikirAllahuEkber, en.zikirTehlil, en.tehlilMetni,
            en.tesbihatKaynagi,
        )
        for (m in metinler) assertFalse(m, turkceHarf.containsMatchIn(m))
        assertFalse(turkceHarf.containsMatchIn(en.vaktiCikiyor("Asr")))
        assertFalse(turkceHarf.containsMatchIn(en.onaySorusuSatirlari("Isha").toList().joinToString(" ")))
    }
}
