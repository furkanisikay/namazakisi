package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `MuhafizAlarmKurallari` — gerçek alarm (issue #74). Yük sözleşmesi JS
 * `core/muhafiz/alarmYuku.ts` ile AYNI örnek dosyadan doğrulanır
 * (`src/test/resources/muhafiz-alarm-ornekleri.json`).
 */
class MuhafizAlarmKurallariTest {

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("muhafiz-alarm-ornekleri.json")) { "ornek dosya yok" }.readText()
    )

    @Test
    fun jsYukunuCozer() {
        val yuk = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("yuk").toString())
        assertNotNull(yuk)
        yuk!!
        assertEquals("muhafiz_2026-10-13_vakit_imsak_seviye_1_dk_88", yuk.kimlik)
        assertEquals("imsak", yuk.vakit)
        assertEquals("2026-10-13", yuk.tarih)
        assertEquals("Sabah", yuk.vakitAdi)
        assertEquals(1791000000000L, yuk.tetikMs)
        assertEquals(1791005280000L, yuk.cikisMs)
        assertEquals("namaz_alarm_8e1cdbd8", yuk.alarmKanalId)
        assertEquals("content://media/external/audio/media/12", yuk.sesUri)
        assertEquals("muhafiz_1234abcd", yuk.kanalId)
        assertEquals("muhafiz", yuk.veri.getString("tip"))
    }

    @Test
    fun nafileYukuNafileYolunaGider() {
        // Sahip kararı: gerçek alarm nafilede de standart yetenektir. Kimlik YOLU belirler:
        // Kıldım farz kuyruğuna ASLA gitmemeli (vakit boş).
        val yuk = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("nafile").getJSONObject("yuk").toString())
        assertNotNull(yuk)
        yuk!!
        assertEquals("teheccud", yuk.nafileTuru)
        assertEquals("2026-10-13", yuk.tarih)
        assertEquals("", yuk.vakit)
        assertEquals("Teheccüd", yuk.vakitAdi)
        assertEquals("nafile", yuk.veri.getString("tip"))
        // Muhafız yükünde alan YOK.
        assertNull(MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("yuk").toString())!!.nafileTuru)
    }

    @Test
    fun bilgiYukuYalnizKapatTasir() {
        // Ortak hatırlatma yüzeyleri (plan §4.2): cuma/camiye gitme/takvim vakit GİRMEDEN çalar.
        val yuk = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("bilgi").getJSONObject("yuk").toString())
        assertNotNull(yuk)
        yuk!!
        assertTrue(yuk.bilgi)
        assertNull(yuk.nafileTuru)
        // FARZ kuyruğu boş vakti reddeder; Kıldım düğmesi zaten çizilmez.
        assertEquals("", yuk.vakit)
        assertEquals("2026-10-16", yuk.tarih)
        assertEquals("Cuma", yuk.vakitAdi)
        assertEquals("vakit_bildirim", yuk.kanalId)
        assertFalse(MuhafizAlarmKurallari.kildimDugmesiVarMi(yuk))
        assertFalse(MuhafizAlarmKurallari.otomasyonOlayiDogarMi(yuk))
        // Kuyrukta bekleme kuralı bilgi alarmını kılınmış SAYMAZ (vakit boş).
        assertFalse(MuhafizAlarmKurallari.kuyruktaKilindiMi(yuk.tarih, yuk.vakit, setOf("2026-10-16_ogle")))
    }

    @Test
    fun bilgiAlarmiPencereSonundanSonraCalmaz() {
        // cikisMs = pencere sonu (öğle girişi): tetikKarari DEĞİŞMEDEN geç tetiği atlar.
        val yuk = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("bilgi").getJSONObject("yuk").toString())!!
        assertEquals(
            MuhafizAlarmKurallari.Karar.ATLA,
            MuhafizAlarmKurallari.tetikKarari(yuk.tetikMs, yuk.cikisMs, yuk.cikisMs, 0L),
        )
        assertEquals(
            MuhafizAlarmKurallari.Karar.CAL,
            MuhafizAlarmKurallari.tetikKarari(yuk.tetikMs, yuk.tetikMs + 1000L, yuk.cikisMs, 0L),
        )
    }

    @Test
    fun turAlaniYoksaKimliktenCozulur() {
        // Güncelleme ÖNCESİ kurulmuş alarm (tur alanı yok) bugünkü gibi çözülür.
        val eski = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("yuk").toString())!!
        assertFalse(eski.bilgi)
        assertTrue(MuhafizAlarmKurallari.kildimDugmesiVarMi(eski))
        assertTrue(MuhafizAlarmKurallari.otomasyonOlayiDogarMi(eski))
        // Tür ile kimlik çelişirse (vakit denmiş ama kimlik vakit değil) çalmaz.
        val celiski = JSONObject(ornek.getJSONObject("bilgi").getJSONObject("yuk").toString()).put("tur", "vakit")
        assertNull(MuhafizAlarmKurallari.yukCoz(celiski.toString()))
        // Bilinmeyen tür çalmaz.
        val bilinmeyen = JSONObject(ornek.getJSONObject("yuk").toString()).put("tur", "baska")
        assertNull(MuhafizAlarmKurallari.yukCoz(bilinmeyen.toString()))
        // Nafile yükü otomasyon olayı doğurmaz.
        val nafile = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("nafile").getJSONObject("yuk").toString())!!
        assertFalse(MuhafizAlarmKurallari.otomasyonOlayiDogarMi(nafile))
    }

    @Test
    fun sozlesmeDisiYukReddedilir() {
        val dogru = ornek.getJSONObject("yuk")
        assertNull(MuhafizAlarmKurallari.yukCoz(null))
        assertNull(MuhafizAlarmKurallari.yukCoz("{bozuk"))
        assertNull(MuhafizAlarmKurallari.yukCoz(JSONObject(dogru.toString()).put("surum", 2).toString()))
        // Muhafız kimliği değilse (Kıldım/iptal öneki bulamazdı) çalmaz.
        assertNull(MuhafizAlarmKurallari.yukCoz(JSONObject(dogru.toString()).put("kimlik", "nafile_x").toString()))
        // Alarm kanal uzayı dışındaki kanal (ör. muhafız GC'sinin sildiği) reddedilir.
        assertNull(MuhafizAlarmKurallari.yukCoz(JSONObject(dogru.toString()).put("alarmKanalId", "muhafiz_alarm").toString()))
    }

    @Test
    fun yalnizContentSesiKabulEdilir() {
        val yuk = JSONObject(ornek.getJSONObject("yuk").toString()).put("sesUri", "file:///sdcard/x.mp3")
        assertNull(MuhafizAlarmKurallari.yukCoz(yuk.toString())!!.sesUri)
        val bos = JSONObject(ornek.getJSONObject("yuk").toString()).put("sesUri", JSONObject.NULL)
        assertNull(MuhafizAlarmKurallari.yukCoz(bos.toString())!!.sesUri)
    }

    @Test
    fun kanalKimlikleriAlarmUzayinda() {
        val d = ornek.getJSONArray("kanallar")
        for (i in 0 until d.length()) {
            assertTrue(MuhafizAlarmKurallari.alarmKanaliMi(d.getJSONObject(i).getString("beklenen")))
        }
        // Muhafız kanal uzayı (GC'nin sildiği `muhafiz_*`) ALARM UZAYI DEĞİL.
        assertFalse(MuhafizAlarmKurallari.alarmKanaliMi("muhafiz"))
        assertFalse(MuhafizAlarmKurallari.alarmKanaliMi("muhafiz_alarm"))
        assertFalse(MuhafizAlarmKurallari.KANAL_TABANI.startsWith("muhafiz_"))
    }

    @Test
    fun tetikKarariOrnekleri() {
        val d = ornek.getJSONArray("kararlar")
        assertTrue(d.length() >= 6)
        for (i in 0 until d.length()) {
            val o = d.getJSONObject(i)
            assertEquals(
                o.getString("ad"),
                o.getString("beklenen"),
                MuhafizAlarmKurallari.tetikKarari(
                    o.getLong("tetikMs"),
                    o.getLong("simdiMs"),
                    o.getLong("cikisMs"),
                    o.getLong("camiSessizBitisMs"),
                ).name,
            )
        }
    }

    @Test
    fun eskiYuktekiErtelemeAlaniYokSayilir() {
        // ERTELE YOK (sahip kararı 2026-10-19): güncelleme öncesi kurulmuş alarmın yükü
        // `erteleSinirMs` taşır — yük yine çözülür, alarm çalar.
        val eski = JSONObject(ornek.getJSONObject("yuk").toString()).put("erteleSinirMs", 1791005100000L)
        val yuk = MuhafizAlarmKurallari.yukCoz(eski.toString())
        assertNotNull(yuk)
        assertEquals("muhafiz_2026-10-13_vakit_imsak_seviye_1_dk_88", yuk!!.kimlik)
    }

    @Test
    fun calmaSuresiIkiDakika() {
        assertFalse(MuhafizAlarmKurallari.calmaBittiMi(0L, 119_999L))
        assertTrue(MuhafizAlarmKurallari.calmaBittiMi(0L, 120_000L))
    }

    @Test
    fun yenidenKurulumGecmisleriAtarSiralar() {
        val sonuc = MuhafizAlarmKurallari.yenidenKurulacaklar(mapOf("c" to 300L, "a" to 100L, "b" to 200L, "eski" to 50L), 100L)
        assertEquals(listOf("b", "c"), sonuc)
    }

    @Test
    fun kuyruktaBekleyenVakitAlarmiCalmaz() {
        // Saatten/widget'tan "Kıldım" kuyrukta, JS henüz işlemedi → alarm çalmamalı (M1).
        assertEquals(
            MuhafizAlarmKurallari.Karar.ATLA,
            MuhafizAlarmKurallari.tetikKarari(1_000L, 1_000L, 10_000_000L, 0L, kuyruktaKilindi = true),
        )
        // Kuyruk boşken eski karar BİREBİR.
        assertEquals(
            MuhafizAlarmKurallari.Karar.CAL,
            MuhafizAlarmKurallari.tetikKarari(1_000L, 1_000L, 10_000_000L, 0L, kuyruktaKilindi = false),
        )
    }

    @Test
    fun kuyrukKimligiMuhafizKimligiyleEslesir() {
        val kimlik = "muhafiz_2026-10-13_vakit_imsak_seviye_4_dk_10"
        val yuk = MuhafizAlarmKurallari.yukCoz(
            JSONObject()
                .put("surum", MuhafizAlarmKurallari.YUK_SURUMU)
                .put("kimlik", kimlik)
                .put("tetikMs", 1L)
                .put("alarmKanalId", MuhafizAlarmKurallari.KANAL_TABANI)
                .toString()
        )!!
        // Kuyruk ekleme kuralıyla AYNI kimlik üreticisi (kayıt kodu `imsak`).
        val kuyruk = KildimKuyruguKurallari.ekle(emptyList(), "2026-10-13", "imsak", KildimKuyruguKurallari.KAYNAK_WEAR)!!
        val bekleyen = KildimKuyruguKurallari.bekleyenKimlikler(kuyruk)
        assertTrue(MuhafizAlarmKurallari.kuyruktaKilindiMi(yuk.tarih, yuk.vakit, bekleyen))
        // Komşu gün ve komşu vakit eşleşmez.
        assertFalse(MuhafizAlarmKurallari.kuyruktaKilindiMi("2026-10-12", "imsak", bekleyen))
        assertFalse(MuhafizAlarmKurallari.kuyruktaKilindiMi("2026-10-13", "ogle", bekleyen))
        // Widget kodu `sabah` kuyrukta hiç yoktur (kuyruk reddeder).
        assertFalse(MuhafizAlarmKurallari.kuyruktaKilindiMi("2026-10-13", "sabah", bekleyen))
        assertFalse(MuhafizAlarmKurallari.kuyruktaKilindiMi("", "", bekleyen))
    }

    @Test
    fun kilinmisligaBagliTakvimAlarmiKuyruktaBekleyenVakitteCalmaz() {
        // Takvim çakışması vaktin İÇİNDE çalar: widget/saat/bildirimden "Kıldım" kuyrukta,
        // JS henüz uyanmadı → alarm ÇALMAMALI. Eskiden bilgi alarmında denetim atlanıyordu.
        val yuk = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("takvim").getJSONObject("yuk").toString())!!
        assertTrue(yuk.bilgi)
        assertTrue(yuk.kilinmisligaBagli)
        assertEquals("ogle", yuk.vakit)
        assertEquals("2026-10-16", yuk.tarih)
        // Düğmeler yine yok (bilgi alarmı).
        assertFalse(MuhafizAlarmKurallari.kildimDugmesiVarMi(yuk))
        assertTrue(MuhafizAlarmKurallari.kuyrukDenetlenirMi(yuk))
        val kuyruk = KildimKuyruguKurallari.ekle(emptyList(), "2026-10-16", "ogle", KildimKuyruguKurallari.KAYNAK_WEAR)!!
        val bekleyen = KildimKuyruguKurallari.bekleyenKimlikler(kuyruk)
        assertTrue(MuhafizAlarmKurallari.kuyruktaKilindiMi(yuk.tarih, yuk.vakit, bekleyen))
        // Cuma (kılınmışlığa bağlı DEĞİL) eskisi gibi denetlenmez.
        val cuma = MuhafizAlarmKurallari.yukCoz(ornek.getJSONObject("bilgi").getJSONObject("yuk").toString())!!
        assertFalse(cuma.kilinmisligaBagli)
        assertFalse(MuhafizAlarmKurallari.kuyrukDenetlenirMi(cuma))
        // Bayrak var ama vakit kuyruk biçiminde değilse bağ YOK sayılır.
        val bozuk = JSONObject(ornek.getJSONObject("takvim").getJSONObject("yuk").toString()).put("vakit", "sabah")
        val b = MuhafizAlarmKurallari.yukCoz(bozuk.toString())!!
        assertFalse(b.kilinmisligaBagli)
        assertEquals("", b.vakit)
    }

    @Test
    fun calanAlarmBildirimiEtiketVeNumarayla() {
        val v = BildirimKildimKurallari.Vakit("2026-10-13", "ogle")
        val esles: (String) -> Boolean = { BildirimKildimKurallari.buVakteAitMi(it, v) }
        val n = MuhafizAlarmKurallari.BILDIRIM_NUMARASI
        assertTrue(MuhafizAlarmKurallari.alarmBildirimiMi("muhafiz_2026-10-13_vakit_ogle_seviye_4_dk_10", n, esles))
        // Aynı etiketli expo bildirimi (numara 0) bu yoldan kapatılmaz.
        assertFalse(MuhafizAlarmKurallari.alarmBildirimiMi("muhafiz_2026-10-13_vakit_ogle_seviye_4_dk_10", 0, esles))
        assertFalse(MuhafizAlarmKurallari.alarmBildirimiMi("muhafiz_2026-10-13_vakit_ikindi_seviye_4_dk_10", n, esles))
        assertFalse(MuhafizAlarmKurallari.alarmBildirimiMi(null, n, esles))
        // Önek eşleştiricisi: JS'in uygulama içi "Kıldım" öneki.
        val onek = MuhafizAlarmKurallari.onekEslestirici("muhafiz_2026-10-13_vakit_ogle")
        assertTrue(MuhafizAlarmKurallari.alarmBildirimiMi("muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_25", n, onek))
        assertFalse(MuhafizAlarmKurallari.alarmBildirimiMi("muhafiz_2026-10-14_vakit_ogle_seviye_2_dk_25", n, onek))
        // Boş önek hiçbir şeyi susturmaz.
        assertFalse(MuhafizAlarmKurallari.onekEslestirici("")("muhafiz_2026-10-13_vakit_ogle"))
    }

    @Test
    fun kilitEkranindaKildimKaydiYazilmaz() {
        assertEquals(MuhafizAlarmKurallari.KildimYolu.DOGRUDAN, MuhafizAlarmKurallari.kildimYolu(false, false))
        assertEquals(MuhafizAlarmKurallari.KildimYolu.DOGRUDAN, MuhafizAlarmKurallari.kildimYolu(false, true))
        assertEquals(MuhafizAlarmKurallari.KildimYolu.KILIDI_AC, MuhafizAlarmKurallari.kildimYolu(true, true))
        assertEquals(MuhafizAlarmKurallari.KildimYolu.GIZLE, MuhafizAlarmKurallari.kildimYolu(true, false))
    }
}
