package com.furkanisikay.namazakisi.saat.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.util.Locale

/**
 * Saatin görünen sayıları cihaz yerel ayarının rakamıyla çizilir (`Rakam.kt`); çekirdek metni
 * Batı rakamıyla üretmeye devam eder, Türkçe çıktı birebir aynı kalır.
 */
class RakamTest {
    private fun yerel(etiket: String): Locale = Locale.forLanguageTag(etiket)

    @Test
    fun doguRakamliYerelAyarArapcaHindiSifirVerir() {
        assertEquals('٠', yerelSifir(yerel("ar-SA")))
        assertEquals('٠', yerelSifir(yerel("ar-EG")))
    }

    @Test
    fun bengalceYerelAyarBengalceSifirVerir() {
        // CLDR: bn (BD ve IN) varsayılan rakamı Bengalcedir (`beng`, ০ U+09E6); telefonun
        // Bengalce varsayılanıyla aynı. `-u-nu-latn` tercihi Batıya çevirir.
        assertEquals('০', yerelSifir(yerel("bn-BD")))
        assertEquals('০', yerelSifir(yerel("bn-IN")))
        assertEquals('০', yerelSifir(yerel("bn")))
        assertEquals('0', yerelSifir(yerel("bn-BD-u-nu-latn")))
        assertEquals("০৫:৫৫", rakamlariYerellestir("05:55", yerelSifir(yerel("bn-BD"))))
    }

    @Test
    fun batiRakamliYerelAyarlarSifirVerir() {
        for (etiket in listOf("tr-TR", "tr", "en-US", "en", "ur-PK", "ar-MA", "ar-DZ", "ar-TN", "id-ID", "de-DE", "ru-RU")) {
            assertEquals(etiket, '0', yerelSifir(yerel(etiket)))
        }
    }

    @Test
    fun kullanicininRakamTercihiUzantisiIzlenir() {
        // Ayarlardaki rakam tercihi yerel ayara `-u-nu-` uzantısıyla gelir.
        assertEquals('0', yerelSifir(yerel("ar-SA-u-nu-latn")))
        assertEquals('٠', yerelSifir(yerel("ar-MA-u-nu-arab")))
    }

    @Test
    fun yalnizAsciiRakamlarCevrilir() {
        val sifir = '٠'
        assertEquals("٠٥:٥٥", rakamlariYerellestir("05:55", sifir))
        assertEquals("٧ س ٢٣ د", rakamlariYerellestir("7 س 23 د", sifir))
        assertEquals("يمينًا ١٤٥°", rakamlariYerellestir("يمينًا 145°", sifir))
        assertEquals("/ ٣٣", rakamlariYerellestir("/ 33", sifir))
        assertEquals("صحيح مسلم، المساجد ١٤٦", rakamlariYerellestir("صحيح مسلم، المساجد 146", sifir))
        // Harf, işaret ve zaten yerel rakam olduğu gibi kalır (idempotent).
        assertEquals("القبلة ١٥٢°", rakamlariYerellestir("القبلة ١٥٢°", sifir))
        assertEquals("—", rakamlariYerellestir("—", sifir))
        assertEquals("", rakamlariYerellestir("", sifir))
        // Farsça/Urduca genişletilmiş dizi de ardışıktır.
        assertEquals("۱۲:۰۹", rakamlariYerellestir("12:09", '۰'))
    }

    @Test
    fun batiRakamindaMetinAynenDoner() {
        // Türkçe ve diğer Batı rakamlı yerel ayarlarda çıktı birebir aynı (aynı nesne bile).
        val metin = "Öğle · son 30 dk"
        assertSame(metin, rakamlariYerellestir(metin, '0'))
        assertSame(metin, rakamlariYerellestir(metin, yerelSifir(yerel("tr-TR"))))
        assertEquals("1 sa 16 dk", rakamlariYerellestir(VakitHesabi.kalanMetni(76 * 60_000L), yerelSifir(yerel("tr-TR"))))
        assertEquals("Sağa 35°", rakamlariYerellestir("Sağa 35°", yerelSifir(yerel("tr-TR"))))
    }

    @Test
    fun cekirdekVeKaynakDizgeleriDoguRakamiTasimaz() {
        // Doğu rakamı yalnız çizimde üretilir; tabloya/kaynağa yazılırsa Mağrip (ar-MA)
        // kullanıcısı karışık rakam görür. Çalışma dizini `wear/app` (Gradle birim testi).
        val dosyalar = (File("src/main/java/com/furkanisikay/namazakisi/saat/cekirdek").listFiles().orEmpty().toList() +
            File("src/main/res").listFiles().orEmpty().filter { it.name.startsWith("values") }
                .mapNotNull { File(it, "strings.xml").takeIf(File::exists) })
            .filter { it.name != "Rakam.kt" }
        assertTrue(dosyalar.size > 10)
        for (f in dosyalar) {
            val dogu = f.readText().filter { it in '٠'..'٩' || it in '۰'..'۹' }
            assertEquals("${f.path} Doğu rakamı taşıyor", "", dogu)
        }
    }

    @Test
    fun cekirdekMetniBatiRakamiylaUretilir() {
        // Dönüşüm yalnız çizim kenarında: çekirdek (ve sesli okuma) Arapçada da Batı rakamı yazar.
        assertEquals("1 س 16 د", rakamlariYerellestir(VakitHesabi.kalanMetni(76 * 60_000L, "ar"), '0'))
        assertEquals("116", VakitHesabi.kalanMetni(76 * 60_000L, "ar").filter { it.isDigit() })
    }
}
