package com.furkanisikay.namazakisi.cekirdek

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Test
import java.util.TimeZone

/**
 * Saf kararların İNGİLİZCE metinleri (W5). Türkçe çıktı mevcut testler ve ortak fikstürlerle
 * kilitlidir; burada `dil = "en"` dalı denetlenir. Terimler `docs/ajan/coklu-dil.md` terim
 * sözlüğü ve JS `src/core/dil/sozluk/en` ile aynıdır (Fajr, Dhuhr, "Prayed", "May Allah
 * accept it"…).
 */
class IngilizceMetinlerTest {

    private val en = MetinDili.EN
    private val istanbul = TimeZone.getTimeZone("Europe/Istanbul")
    private val saat: (Long) -> String = { saatMetni(it, istanbul) }

    // 2026-06-21, İstanbul (UTC+3). Öğle 13:11, ikindi 17:05; ertesi günün sabahı.
    private val ogle = VakitAni(VakitKodlari.OGLE, 1_782_036_660_000L, "2026-06-21")
    private val ikindi = VakitAni(VakitKodlari.IKINDI, 1_782_050_700_000L, "2026-06-21")
    private val yarinSabah = VakitAni(VakitKodlari.SABAH, 1_782_094_200_000L, "2026-06-22")

    /** İngilizce metinde Türkçe harf, "please", "prostrate" ve ünlem olmamalı. */
    private fun temizMi(metin: String) {
        assertFalse(metin, Regex("[çğıöşüÇĞİÖŞÜ]").containsMatchIn(metin))
        assertFalse(metin, Regex("(?i)please|prostrate").containsMatchIn(metin))
        assertFalse(metin, metin.contains('!'))
    }

    @Test
    fun dilKoduCozulur() {
        assertEquals(MetinDili.EN, MetinDili.coz("en"))
        assertEquals(MetinDili.EN, MetinDili.coz("en-US"))
        assertEquals(MetinDili.EN, MetinDili.coz("en_GB"))
        assertEquals(MetinDili.TR, MetinDili.coz("tr"))
        assertEquals(MetinDili.TR, MetinDili.coz(null))
        assertEquals(MetinDili.TR, MetinDili.coz(""))
        // Tablosu olmayan dil Türkçeye düşer (uygulama hiç açılmamışkenki varsayılan).
        assertEquals(MetinDili.TR, MetinDili.coz("ar"))
    }

    @Test
    fun vakitAdlariTerimSozlugundendir() {
        val adlar = listOf("sabah", "gunes", "ogle", "ikindi", "aksam", "yatsi").map { VakitKodlari.gorunenAd(it, en) }
        assertEquals(listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"), adlar)
        // Varsayılan dil Türkçe kalır.
        assertEquals("Öğle", VakitKodlari.gorunenAd("ogle"))
        // Bilinmeyen kod kimlik olarak döner (çevrilmez).
        assertEquals("cuma", VakitKodlari.gorunenAd("cuma", en))
    }

    @Test
    fun asistanSiradakiNamazMetni() {
        val bugun = "2026-06-21"
        val aktif = VakitDurumu(ogle, ikindi.ms, ikindi)
        assertEquals(
            "It's Dhuhr time now. The next prayer is Asr, at 17:05.",
            AsistanKarari.siradakiNamazMetni(aktif, KildimDurumu.KILINABILIR, bugun, saat, en),
        )
        val ayriCikis = VakitDurumu(ogle, ikindi.ms - 600_000L, ikindi)
        assertEquals(
            "It's Dhuhr time now; it ends at 16:55. The next prayer is Asr, at 17:05.",
            AsistanKarari.siradakiNamazMetni(ayriCikis, KildimDurumu.KILINABILIR, bugun, saat, en),
        )
        // Kılınmış vakit söylenmez; sıradaki yarının sabahıysa "tomorrow".
        assertEquals(
            "The next prayer is Fajr, tomorrow at ${saat(yarinSabah.ms)}.",
            AsistanKarari.siradakiNamazMetni(VakitDurumu(null, null, yarinSabah), KildimDurumu.YOK, bugun, saat, en),
        )
        assertEquals(
            "Prayer time data is out of date. Open the app once to update it.",
            AsistanKarari.siradakiNamazMetni(VakitDurumu(null, null, null), KildimDurumu.YOK, bugun, saat, en),
        )
    }

    @Test
    fun asistanKildimAkisi() {
        val bugun = "2026-06-21"
        val karar = AsistanKarari.kildimKarari(VakitDurumu(ogle, ikindi.ms, ikindi), KildimDurumu.KILINABILIR, en)
        karar as AsistanKarari.KildimKarari.Aday
        assertEquals("Dhuhr", karar.ad)
        // Onay kimliği dilden bağımsızdır (kuyruk kimliği).
        assertEquals("2026-06-21_ogle", karar.onayKimligi)
        val adim = AsistanKarari.kildimAdimi(karar, null, en) as AsistanKarari.KildimAdimi.OnayIste
        assertEquals("Mark Dhuhr as prayed?", adim.soru)
        assertEquals("Dhuhr is marked as prayed. May Allah accept it.", AsistanKarari.kildimMetni(karar, bugun, saat, en))
        assertEquals(
            "Dhuhr is already marked as prayed.",
            AsistanKarari.kildimMetni(AsistanKarari.KildimKarari.ZatenKilindi("Dhuhr"), bugun, saat, en),
        )
        assertEquals(
            "There is no prayer to mark right now. Next is Fajr, starting tomorrow at ${saat(yarinSabah.ms)}.",
            AsistanKarari.kildimMetni(AsistanKarari.KildimKarari.VakitYok(yarinSabah), bugun, saat, en),
        )
        assertEquals(
            "There is no prayer to mark right now.",
            AsistanKarari.kildimMetni(AsistanKarari.KildimKarari.VakitYok(null), bugun, saat, en),
        )
        listOf(
            AsistanKarari.konumYokMetni(en),
            AsistanKarari.veriEskiMetni(en),
            AsistanKarari.vakitDegistiMetni(en),
            adim.soru,
        ).forEach { temizMi(it) }
        // Türkçe sabitler varsayılanla aynı (fikstür kilidi).
        assertEquals(AsistanKarari.KONUM_YOK_METNI, AsistanKarari.konumYokMetni())
        assertEquals(AsistanKarari.VAKIT_DEGISTI_METNI, AsistanKarari.vakitDegistiMetni())
    }

    @Test
    fun hizliAyarlarKutusu() {
        val aktif = VakitDurumu(ogle, ikindi.ms, ikindi)
        val k = KutuGorunumKarari.hesapla(aktif, KildimDurumu.KILINABILIR, saat, en)
        assertEquals("Dhuhr", k.etiket)
        assertEquals("Ends 17:05", k.altEtiket)
        assertEquals("Prayed", KutuGorunumKarari.hesapla(aktif, KildimDurumu.KILINDI, saat, en).altEtiket)
        assertEquals("Marking", KutuGorunumKarari.hesapla(aktif, KildimDurumu.BEKLIYOR, saat, en).altEtiket)
        val ara = KutuGorunumKarari.hesapla(VakitDurumu(null, null, ogle), KildimDurumu.YOK, saat, en)
        assertEquals("Starts 13:11", ara.altEtiket)
        val yok = KutuGorunumKarari.hesapla(VakitDurumu(null, null, null), KildimDurumu.YOK, saat, en)
        assertEquals("Prayer time", yok.etiket)
        assertEquals("Open the app", yok.altEtiket)
        listOf(k, ara, yok).forEach { temizMi(it.etiket + " " + it.altEtiket + " " + it.aciklama) }
    }

    @Test
    fun klasikWidget() {
        assertEquals("Dhuhr in", KlasikWidgetKarari.yonelmeHali("ogle", buyukHarf = false, dil = en))
        assertEquals("Sunrise in", KlasikWidgetKarari.yonelmeHali("gunes", buyukHarf = true, dil = en))
        assertEquals("Fajr", KlasikWidgetKarari.satirAdi("sabah", en))
        assertEquals("Isha", KlasikWidgetKarari.satirAdi("yatsi", en))
    }

    @Test
    fun kilitEkraniVeKapak() {
        assertEquals("Open your phone to mark it", KilitEkraniKarari.kapakIpucu(true, KildimDurumu.KILINABILIR, en))
        assertNull(KilitEkraniKarari.kapakIpucu(false, KildimDurumu.KILINABILIR, en))
        assertEquals(
            "Asr not prayed yet. Open the app to mark it",
            KilitEkraniKarari.erisimMetni("Asr", KildimDurumu.KILINABILIR, kilitEkrani = true, dil = en),
        )
        assertEquals("Mark Asr as prayed", KilitEkraniKarari.erisimMetni("Asr", KildimDurumu.KILINABILIR, kilitEkrani = false, dil = en))
        assertEquals("Open the app", KilitEkraniKarari.erisimMetni("Asr", KildimDurumu.YOK, kilitEkrani = false, dil = en))
        KildimDurumu.values().forEach { temizMi(KilitEkraniKarari.erisimMetni("Asr", it, kilitEkrani = true, kapakEkrani = true, dil = en)) }
    }

    @Test
    fun kildimOnayBildirimi() {
        assertEquals("Fajr · May Allah accept it", KildimOnayMetni.baslik("imsak", en))
        assertEquals("Isha is marked as prayed.", KildimOnayMetni.govde("yatsi", en))
        assertEquals("Prayer · May Allah accept it", KildimOnayMetni.baslik("bilinmeyen", en))
    }

    @Test
    fun aracEkrani() {
        val durum = VakitDurumu(ogle, ikindi.ms, ikindi)
        val simdi = ikindi.ms - (41 * 60_000L + 30_000L)
        assertEquals("Dhuhr · 42 min left", AracKarari.baslik(durum, KildimDurumu.KILINABILIR, simdi, saat, en))
        assertEquals("Next: Asr · 17:05", AracKarari.baslik(durum, KildimDurumu.KILINDI, simdi, saat, en))
        // Uygulama adı marka: her dilde aynı.
        assertEquals(AracKarari.VARSAYILAN_BASLIK, AracKarari.baslik(VakitDurumu(null, null, null), KildimDurumu.YOK, 0, saat, en))
        temizMi(AracKarari.konumYokMetni(en).replace("Namaz Akışı", ""))
        temizMi(AracKarari.camiYokMetni(en))
    }

    @Test
    fun otomasyonEklentisi() {
        val b = "a".repeat(OtomasyonKurallari.BELIRTEC_UZUNLUGU)
        fun kosul(olay: OtomasyonOlayi, vakit: String? = null, kip: KosulKipi = KosulKipi.DURUM) =
            EklentiAyari.Kosul("com.a.b", b, kip, olay, vakit)
        val k = OtomasyonKurallari
        assertEquals("When Dhuhr time begins", k.ozet(kosul(OtomasyonOlayi.VAKIT_GIRDI, "ogle", KosulKipi.OLAY), en))
        assertEquals("While it's Asr time", k.ozet(kosul(OtomasyonOlayi.VAKIT_GIRDI, "ikindi"), en))
        assertEquals("Prayer time is ending (45 min left)", k.ozet(kosul(OtomasyonOlayi.VAKIT_CIKIYOR), en))
        assertEquals("Mark the current prayer as prayed", k.ozet(EklentiAyari.Kildim("com.a.b", b), en))
        // Değişken ADLARI kimliktir: dil değişmez, yalnız etiket/açıklama çevrilir.
        OtomasyonOlayi.values().forEach { olay ->
            assertEquals(
                k.ilgiliDegiskenler(olay).map { it.substringBefore('\n') },
                k.ilgiliDegiskenler(olay, en).map { it.substringBefore('\n') },
            )
            k.ilgiliDegiskenler(olay, en).forEach { assertEquals(it, 3, it.split('\n').size); temizMi(it) }
        }
        // `%vakit` arayüz dilinde, `%vakitkodu` kimlik.
        val s = k.durumuDegerlendir(
            kosul(OtomasyonOlayi.VAKIT_GIRDI, "ogle"), VakitDurumu(ogle, ikindi.ms, ikindi), true, null, null, ogle.ms + 1, en,
        )
        assertEquals(OtomasyonProtokolu.SONUC_SAGLANDI, s.kod)
        assertEquals("Dhuhr", s.degiskenler[OtomasyonKurallari.D_VAKIT])
        assertEquals("ogle", s.degiskenler[OtomasyonKurallari.D_VAKIT_KODU])
        val o = OtomasyonOlayKaydi(7, OtomasyonOlayi.VAKIT_CIKIYOR, "aksam", "2026-10-13", 1_000L, kalanDk = 45)
        val so = k.olayiDegerlendir(kosul(OtomasyonOlayi.VAKIT_CIKIYOR, kip = KosulKipi.OLAY), o, 2_000L, en)
        assertEquals("Maghrib", so.degiskenler[OtomasyonKurallari.D_VAKIT])
    }
}
