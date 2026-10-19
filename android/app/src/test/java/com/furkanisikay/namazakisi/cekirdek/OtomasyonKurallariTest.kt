package com.furkanisikay.namazakisi.cekirdek

import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Karar
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.KaynakSinifi
import com.furkanisikay.namazakisi.cekirdek.OtomasyonKurallari.DuzenlemeEylemi
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Tasker / MacroDroid / Automate eklentisi (issue #278). */
class OtomasyonKurallariTest {

    private val k = OtomasyonKurallari
    private val belirtec = "a".repeat(64)
    private val baska = "b".repeat(64)
    private val p = OtomasyonProtokolu

    // --- Protokol dizeleri: belgelerdeki değerlerle AYNI olmalı (host'lar bunları arar) ---

    @Test
    fun protokolDizeleriBelgeyleAyni() {
        assertEquals("com.twofortyfouram.locale.intent.action.FIRE_SETTING", p.AYAR_CALISTIR)
        assertEquals("com.twofortyfouram.locale.intent.action.EDIT_SETTING", p.AYAR_DUZENLE)
        assertEquals("com.twofortyfouram.locale.intent.action.QUERY_CONDITION", p.KOSUL_SORGULA)
        assertEquals("com.twofortyfouram.locale.intent.action.EDIT_CONDITION", p.KOSUL_DUZENLE)
        assertEquals("com.twofortyfouram.locale.intent.action.REQUEST_QUERY", p.SORGU_ISTE)
        assertEquals("com.twofortyfouram.locale.intent.extra.BUNDLE", p.EK_PAKET)
        assertEquals("com.twofortyfouram.locale.intent.extra.BLURB", p.EK_OZET)
        assertEquals("com.twofortyfouram.locale.intent.extra.ACTIVITY", p.EK_ETKINLIK)
        assertEquals(16, p.SONUC_SAGLANDI)
        assertEquals(17, p.SONUC_SAGLANMADI)
        assertEquals(18, p.SONUC_BILINMIYOR)
        assertEquals("net.dinglisch.android.tasker.ACTION_EDIT_EVENT", p.TASKER_OLAY_DUZENLE)
        assertEquals("net.dinglisch.android.tasker.extras.VARIABLES", p.TASKER_DEGISKENLER)
        assertEquals("net.dinglisch.android.tasker.MESSAGE_ID", p.TASKER_MESAJ_KIMLIGI)
    }

    // --- Belirteç ---

    @Test
    fun belirtecYalnizAyniIseEsit() {
        assertTrue(k.belirtecEsitMi(belirtec, belirtec))
        assertFalse(k.belirtecEsitMi(belirtec, baska))
        assertFalse(k.belirtecEsitMi(null, belirtec))
        assertFalse(k.belirtecEsitMi(belirtec, null))
        // Boş/kısa/biçimsiz belirteç asla eşleşmez (boş = boş tuzağı).
        assertFalse(k.belirtecEsitMi("", ""))
        assertFalse(k.belirtecEsitMi("A".repeat(64), "A".repeat(64)))
        assertFalse(k.belirtecEsitMi("a".repeat(63), "a".repeat(63)))
    }

    @Test
    fun yetkiYalnizIzinVeAyniBelirtecle() {
        val a = EklentiAyari.Kildim("net.dinglisch.android.taskerm", belirtec)
        assertTrue(k.yetkiliMi(a, belirtec, Karar.IZIN))
        assertFalse(k.yetkiliMi(a, baska, Karar.IZIN))
        // Kullanıcı engelledi ya da listeden kaldırdı → eski paket geçersiz.
        assertFalse(k.yetkiliMi(a, belirtec, Karar.ENGEL))
        assertFalse(k.yetkiliMi(a, belirtec, null))
        // Pakete hiç belirteç verilmemiş (başka uygulama paket adını uydurdu).
        assertFalse(k.yetkiliMi(a, null, Karar.IZIN))
    }

    @Test
    fun duzenlemeKarariGuvenListesiniIzler() {
        assertEquals(DuzenlemeEylemi.SOR, k.duzenlemeEylemi(KaynakSinifi.UYGULAMA, null))
        assertEquals(DuzenlemeEylemi.KAYDET, k.duzenlemeEylemi(KaynakSinifi.UYGULAMA, Karar.IZIN))
        assertEquals(DuzenlemeEylemi.ENGELLI, k.duzenlemeEylemi(KaynakSinifi.UYGULAMA, Karar.ENGEL))
        // Kimliği bilinmeyen çağırana ve tarayıcıya belirteç verilmez.
        assertEquals(DuzenlemeEylemi.REDDET, k.duzenlemeEylemi(KaynakSinifi.BILINMIYOR, null))
        assertEquals(DuzenlemeEylemi.REDDET, k.duzenlemeEylemi(KaynakSinifi.TARAYICI, Karar.IZIN))
        assertEquals(DuzenlemeEylemi.REDDET, k.duzenlemeEylemi(KaynakSinifi.KENDI, null))
    }

    // --- Paket ↔ model ---

    @Test
    fun kildimPaketiGidisDonus() {
        val a = EklentiAyari.Kildim("com.arlosoft.macrodroid", belirtec)
        assertEquals(a, k.paketOku(k.paketeYaz(a)))
    }

    @Test
    fun kosulPaketiGidisDonus() {
        val a = EklentiAyari.Kosul("net.dinglisch.android.taskerm", belirtec, KosulKipi.OLAY, OtomasyonOlayi.VAKIT_GIRDI, "ogle")
        assertEquals(a, k.paketOku(k.paketeYaz(a)))
        val herhangi = a.copy(vakit = null, kip = KosulKipi.DURUM, olay = OtomasyonOlayi.VAKIT_CIKIYOR)
        assertEquals(herhangi, k.paketOku(k.paketeYaz(herhangi)))
    }

    @Test
    fun gecersizPaketReddedilir() {
        val iyi = k.paketeYaz(EklentiAyari.Kosul("com.a.b", belirtec, KosulKipi.DURUM, OtomasyonOlayi.VAKIT_GIRDI, "ogle"))
        assertNotNull(k.paketOku(iyi))
        assertNull(k.paketOku(null))
        assertNull(k.paketOku(emptyMap()))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_SURUM to "2")))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_PAKET to "bozuk paket")))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_BELIRTEC to "kisa")))
        // Tür sızdırma: String yerine başka bir nesne.
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_BELIRTEC to 42)))
        // Widget kodu dışı vakit ('imsak', 'gunes') reddedilir.
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_VAKIT to "imsak")))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_VAKIT to "gunes")))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_OLAY to "bilinmeyen")))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_TUR to "sil")))
        assertNull(k.paketOku(iyi + (OtomasyonKurallari.A_PAKET to "a.b" + "c".repeat(300))))
    }

    @Test
    fun camideOlayindaVakitSuzgeciYokSayilir() {
        val m = k.paketeYaz(EklentiAyari.Kosul("com.a.b", belirtec, KosulKipi.OLAY, OtomasyonOlayi.CAMIDE, "ogle"))
        val a = k.paketOku(m) as EklentiAyari.Kosul
        assertNull(a.vakit)
    }

    // --- Durum (koşul) değerlendirmesi ---

    private val ogle = VakitAni("ogle", 1_000_000L, "2026-10-13")
    private val aktifOgle = VakitDurumu(ogle, 5_000_000L, null)
    private val vakitYok = VakitDurumu(null, null, ogle)

    private fun kosul(olay: OtomasyonOlayi, vakit: String? = null, kip: KosulKipi = KosulKipi.DURUM) =
        EklentiAyari.Kosul("com.a.b", belirtec, kip, olay, vakit)

    @Test
    fun girdiDurumuAktifVakteGore() {
        val s = k.durumuDegerlendir(kosul(OtomasyonOlayi.VAKIT_GIRDI, "ogle"), aktifOgle, true, null, null, 2_000_000L)
        assertEquals(p.SONUC_SAGLANDI, s.kod)
        assertEquals("Öğle", s.degiskenler[OtomasyonKurallari.D_VAKIT])
        assertEquals("ogle", s.degiskenler[OtomasyonKurallari.D_VAKIT_KODU])
        assertEquals("2026-10-13", s.degiskenler[OtomasyonKurallari.D_TARIH])
        assertEquals(p.SONUC_SAGLANMADI, k.durumuDegerlendir(kosul(OtomasyonOlayi.VAKIT_GIRDI, "aksam"), aktifOgle, true, null, null, 2_000_000L).kod)
        assertEquals(p.SONUC_SAGLANMADI, k.durumuDegerlendir(kosul(OtomasyonOlayi.VAKIT_GIRDI), vakitYok, true, null, null, 2_000_000L).kod)
        // Widget verisi yoksa vakit bilinmez → BİLİNMİYOR (yanlış "hayır" değil).
        assertEquals(p.SONUC_BILINMIYOR, k.durumuDegerlendir(kosul(OtomasyonOlayi.VAKIT_GIRDI), vakitYok, false, null, null, 2_000_000L).kod)
    }

    @Test
    fun cikiyorDurumuOlaylaAyniAnaBagli() {
        val c = kosul(OtomasyonOlayi.VAKIT_CIKIYOR)
        assertEquals(p.SONUC_SAGLANMADI, k.durumuDegerlendir(c, aktifOgle, true, null, null, 4_000_000L).kod)
        val s = k.durumuDegerlendir(c, aktifOgle, true, "2026-10-13_ogle", null, 4_000_000L)
        assertEquals(p.SONUC_SAGLANDI, s.kod)
        assertEquals("16", s.degiskenler[OtomasyonKurallari.D_KALAN_DK])
        // Önceki vaktin olayı sonraki vakitte "çıkıyor" demez.
        assertEquals(p.SONUC_SAGLANMADI, k.durumuDegerlendir(c, aktifOgle, true, "2026-10-13_sabah", null, 4_000_000L).kod)
    }

    @Test
    fun camideDurumuSureyleBiter() {
        val c = kosul(OtomasyonOlayi.CAMIDE)
        val cami = CamideDurumu("Kare Camii", "ogle", "2026-10-13", 3_000_000L)
        val s = k.durumuDegerlendir(c, vakitYok, false, null, cami, 2_000_000L)
        assertEquals(p.SONUC_SAGLANDI, s.kod)
        assertEquals("Kare Camii", s.degiskenler[OtomasyonKurallari.D_CAMI])
        assertEquals("ogle", s.degiskenler[OtomasyonKurallari.D_VAKIT_KODU])
        assertEquals(p.SONUC_SAGLANMADI, k.durumuDegerlendir(c, vakitYok, false, null, cami, 3_000_000L).kod)
        assertEquals(p.SONUC_SAGLANMADI, k.durumuDegerlendir(c, vakitYok, false, null, null, 2_000_000L).kod)
        // Camideyim imsak der, değişken widget kodudur.
        val sabah = k.durumuDegerlendir(c, vakitYok, false, null, cami.copy(vakit = "imsak"), 2_000_000L)
        assertEquals("sabah", sabah.degiskenler[OtomasyonKurallari.D_VAKIT_KODU])
        assertEquals("Sabah", sabah.degiskenler[OtomasyonKurallari.D_VAKIT])
    }

    // --- Olay (Tasker event) değerlendirmesi ---

    @Test
    fun olayYalnizBizimTazeKaydimizlaSaglanir() {
        val o = OtomasyonOlayKaydi(7, OtomasyonOlayi.VAKIT_CIKIYOR, "aksam", "2026-10-13", 1_000L, kalanDk = 45)
        val c = kosul(OtomasyonOlayi.VAKIT_CIKIYOR, kip = KosulKipi.OLAY)
        val s = k.olayiDegerlendir(c, o, 2_000L)
        assertEquals(p.SONUC_SAGLANDI, s.kod)
        assertEquals("45", s.degiskenler[OtomasyonKurallari.D_KALAN_DK])
        assertEquals("Akşam", s.degiskenler[OtomasyonKurallari.D_VAKIT])
        // Kayıt yok (sahte mesaj kimliği), bayat, farklı tür, farklı vakit.
        assertEquals(p.SONUC_SAGLANMADI, k.olayiDegerlendir(c, null, 2_000L).kod)
        assertEquals(p.SONUC_SAGLANMADI, k.olayiDegerlendir(c, o, 1_000L + OtomasyonKurallari.OLAY_OMRU_MS + 1).kod)
        assertEquals(p.SONUC_SAGLANMADI, k.olayiDegerlendir(kosul(OtomasyonOlayi.VAKIT_GIRDI, kip = KosulKipi.OLAY), o, 2_000L).kod)
        assertEquals(p.SONUC_SAGLANMADI, k.olayiDegerlendir(kosul(OtomasyonOlayi.VAKIT_CIKIYOR, "ogle", KosulKipi.OLAY), o, 2_000L).kod)
    }

    // --- Olay üretimi ---

    @Test
    fun girdiOlayiYalnizTazeVeTekKez() {
        assertEquals(ogle, k.girdiOlayi(aktifOgle, ogle.ms + 1_000, null))
        // Aynı vakit ikinci kez (saat değişimi, tekrar tazeleme) olay üretmez.
        assertNull(k.girdiOlayi(aktifOgle, ogle.ms + 1_000, "2026-10-13_ogle"))
        // Cihaz uyurken saatlerce gecikmiş sınır alarmı "vakit girdi" demez.
        assertNull(k.girdiOlayi(aktifOgle, ogle.ms + OtomasyonKurallari.GIRDI_TAZELIK_MS + 1, null))
        // Güneş → öğle arası: kılınabilir vakit yok.
        assertNull(k.girdiOlayi(vakitYok, ogle.ms + 1_000, null))
    }

    @Test
    fun cikiyorOlayiIlkUyaridaVeEsikAltinda() {
        val o = k.cikiyorOlayi("muhafiz_2026-10-13_vakit_imsak_seviye_1_dk_45", null)!!
        assertEquals("sabah", o.vakit) // kayıt `imsak`, eklenti widget kodu `sabah`
        assertEquals(45, o.kalanDk)
        assertEquals("2026-10-13", o.tarih)
        assertNull(k.cikiyorOlayi("muhafiz_2026-10-13_vakit_imsak_seviye_2_dk_25", "2026-10-13_sabah"))
        assertNull(k.cikiyorOlayi("muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_60", null))
        assertNotNull(k.cikiyorOlayi("muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_25", null))
        // Eski erteleme artığı / yatış bildirimleri ve vakit bildirimi olay değildir.
        assertNull(k.cikiyorOlayi("muhafiz_2026-10-13_vakit_ogle_ertele", null))
        assertNull(k.cikiyorOlayi("vakit_bildirim_ogle_2026-10-13", null))
        assertNull(k.cikiyorOlayi("muhafiz_2026-10-13_vakit_ogle_seviye_4_dk_0", null))
    }

    @Test
    fun olayKayitlariBudanir() {
        val l = (1..15).map { OtomasyonOlayKaydi(it, OtomasyonOlayi.VAKIT_GIRDI, "ogle", "2026-10-13", it * 1_000L) }
        val b = k.olaylariBuda(l, 15_000L)
        assertEquals(OtomasyonKurallari.OLAY_KAYIT_SINIRI, b.size)
        assertEquals(15, b.last().mesajId)
        assertTrue(k.olaylariBuda(l, 15_000L + OtomasyonKurallari.OLAY_OMRU_MS + 20_000L).isEmpty())
    }

    // --- Metinler ---

    @Test
    fun ozetVeDegiskenler() {
        assertEquals("Öğle vakti girdiğinde", k.ozet(kosul(OtomasyonOlayi.VAKIT_GIRDI, "ogle", KosulKipi.OLAY)))
        assertEquals("İkindi vakti içindeyken", k.ozet(kosul(OtomasyonOlayi.VAKIT_GIRDI, "ikindi")))
        assertEquals("Vakit çıkıyor (45 dk kala)", k.ozet(kosul(OtomasyonOlayi.VAKIT_CIKIYOR)))
        assertEquals("Şu anki vakti kılındı olarak işaretle", k.ozet(EklentiAyari.Kildim("com.a.b", belirtec)))
        val adlar = k.ilgiliDegiskenler(OtomasyonOlayi.CAMIDE).map { it.substringBefore('\n') }
        assertEquals(listOf("%vakit", "%vakitkodu", "%tarih", "%cami"), adlar)
        // Tasker yerel değişken kuralı: % + küçük harf, en az 3 karakter.
        OtomasyonOlayi.values().flatMap { k.ilgiliDegiskenler(it).toList() }.forEach {
            val ad = it.substringBefore('\n')
            assertTrue(ad, Regex("^%[a-z][a-z0-9]{2,}$").matches(ad))
            assertEquals(ad, 3, it.split('\n').size)
        }
    }

    @Test
    fun ekHatirlatmaKimlikleriVakitCikiyorOlayiDogurmaz() {
        // Ortak hatırlatma yüzeyleri (plan §4.6): yatış/muhasebe `muhafiz_` uzayındadır ama
        // plan kimliği değildir; cuma/camiye gitme/takvim vakit girmeden gelir.
        assertNull(OtomasyonKurallari.cikiyorOlayi("muhafiz_2026-10-13_vakit_yatsi_yatis", null))
        assertNull(OtomasyonKurallari.cikiyorOlayi("muhafiz_2026-10-13_vakit_yatsi_yatis_15", null))
        assertNull(OtomasyonKurallari.cikiyorOlayi("muhafiz_2026-10-13_vakit_ogle_muhasebe", null))
        assertNull(OtomasyonKurallari.cikiyorOlayi("cuma_hatirlatma_2026-10-16_30", null))
    }
}
