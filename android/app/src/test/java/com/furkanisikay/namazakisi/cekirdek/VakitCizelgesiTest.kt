package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * `VakitCizelgesi` — JS `aktifVakitBul` ile AYNI örnek dosyayı doğrular
 * (`src/test/resources/widget-ornek.json`). Biri değişip diğeri değişmezse iki
 * yüzey (uygulama içi derin bağlantı ↔ widget/kutu) farklı vakti işaretler.
 */
class VakitCizelgesiTest {

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("widget-ornek.json")) { "ornek dosya yok" }.readText()
    )

    private val vakitler: List<VakitAni> = ornek.getJSONArray("vakitler").let { d ->
        (0 until d.length()).map { i ->
            val o = d.getJSONObject(i)
            VakitAni(o.getString("vakit"), o.getLong("ms"), o.getString("tarih"))
        }
    }

    @Test
    fun ornekDurumlariJsIleAyniCevabiVerir() {
        val durumlar = ornek.getJSONArray("durumlar")
        assertTrue(durumlar.length() >= 5)
        for (i in 0 until durumlar.length()) {
            val o = durumlar.getJSONObject(i)
            val ad = o.getString("ad")
            val d = VakitCizelgesi.durumHesapla(vakitler, o.getLong("simdiMs"))
            if (o.isNull("aktif")) {
                assertNull(ad, d.aktif)
                assertNull(ad, d.bitisMs)
            } else {
                val a = o.getJSONObject("aktif")
                assertEquals(ad, a.getString("vakit"), d.aktif?.kod)
                assertEquals(ad, a.getString("tarih"), d.aktif?.tarih)
                assertEquals(ad, o.getLong("bitisMs"), d.bitisMs)
            }
            if (o.isNull("sonraki")) {
                assertNull(ad, d.sonraki)
            } else {
                val s = o.getJSONObject("sonraki")
                assertEquals(ad, s.getString("vakit"), d.sonraki?.kod)
                assertEquals(ad, s.getString("tarih"), d.sonraki?.tarih)
            }
        }
    }

    @Test
    fun istekKoduJavaHashCodeIleAyni() {
        val kodlar = ornek.getJSONArray("istekKodlari")
        for (i in 0 until kodlar.length()) {
            val o = kodlar.getJSONObject(i)
            assertEquals(o.getInt("kod"), kildimIstekKodu(o.getString("tarih"), o.getString("vakit")))
        }
    }

    @Test
    fun siralanmamisVeriDeAyniSonucuVerir() {
        val karisik = vakitler.shuffled(java.util.Random(7))
        val simdi = 1782036660000L + 60_000L // öğle girişinden 1 dk sonra
        assertEquals(VakitCizelgesi.durumHesapla(vakitler, simdi), VakitCizelgesi.durumHesapla(karisik, simdi))
    }

    @Test
    fun gosterilecekGunGeceYarisindanSonraDundur() {
        val d = VakitCizelgesi.durumHesapla(vakitler, 1781992800000L)
        assertEquals("2026-06-20", VakitCizelgesi.gosterilecekGun(d))
        assertEquals(
            listOf("sabah", "ogle", "ikindi", "aksam", "yatsi"),
            VakitCizelgesi.gunVakitleri(vakitler, "2026-06-20").map { it.kod },
        )
    }

    @Test
    fun gunesOgleArasindaGosterilenGunSiradakininGunudur() {
        val d = VakitCizelgesi.durumHesapla(vakitler, 1782021600000L)
        assertEquals("2026-06-21", VakitCizelgesi.gosterilecekGun(d))
    }

    @Test
    fun sonrakiSinirBirSonrakiGiristir() {
        assertEquals(1782001440000L, VakitCizelgesi.sonrakiSinirMs(vakitler, 1781992800000L))
        // Tam sınırdayken bir SONRAKİ sınır: aynı anı yeniden kurmak döngü üretirdi.
        assertEquals(1782008700000L, VakitCizelgesi.sonrakiSinirMs(vakitler, 1782001440000L))
        assertNull(VakitCizelgesi.sonrakiSinirMs(vakitler, Long.MAX_VALUE - 1))
    }

    // --- Kabul ölçütü: widget kaynaklı AlarmManager alarmı günde ≤ 12 -------------------

    private val gunMs = 24L * 60 * 60 * 1000

    /** Bir yıllık sentetik çizelge: her gün 6 giriş, mevsimle kayan saatler. */
    private fun yillikCizelge(): List<VakitAni> {
        val baslangic = 1767225600000L // 2026-01-01T00:00Z
        val sonuc = mutableListOf<VakitAni>()
        val kodlar = listOf("sabah", "gunes", "ogle", "ikindi", "aksam", "yatsi")
        val saatler = listOf(5.0, 6.5, 12.2, 15.5, 18.0, 19.5)
        for (g in 0 until 366) {
            val kayma = kotlin.math.sin(g / 366.0 * 2 * Math.PI) * 1.5
            kodlar.forEachIndexed { i, k ->
                val ms = baslangic + g * gunMs + ((saatler[i] + kayma * if (i == 2) 0.1 else 1.0) * 3_600_000).toLong()
                sonuc.add(VakitAni(k, ms, "g$g"))
            }
        }
        return sonuc
    }

    @Test
    fun widgetAlarmiHerGunEnFazla12() {
        val cizelge = yillikCizelge()
        val baslangic = 1767225600000L
        for (g in 0 until 365) {
            val gunBasi = baslangic + g * gunMs
            val alarmlar = VakitCizelgesi.alarmZinciri(cizelge, gunBasi, gunBasi + gunMs)
            assertTrue("gun $g: ${alarmlar.size}", alarmlar.size <= VakitCizelgesi.GUNLUK_ALARM_UST_SINIRI)
            // Gerçek değer: her vakit girişi bir alarm, fazlası değil.
            assertEquals(6, alarmlar.size)
        }
    }

    @Test
    fun ayniAndakiGirislerTekAlarmaIner() {
        val ust = listOf(
            VakitAni("ogle", 1000L, "t"),
            VakitAni("ikindi", 1000L, "t"),
            VakitAni("aksam", 2000L, "t"),
        )
        assertEquals(listOf(1000L, 2000L), VakitCizelgesi.alarmZinciri(ust, 0L, 10_000L))
    }

    @Test
    fun ornekGunlerdeAlarmSayisiSinirAltinda() {
        val gunBasi = 1781902800000L // 2026-06-20 00:00 Europe/Istanbul
        for (g in 0 until 3) {
            val bas = gunBasi + g * gunMs
            val n = VakitCizelgesi.alarmZinciri(vakitler, bas, bas + gunMs).size
            assertTrue(n <= VakitCizelgesi.GUNLUK_ALARM_UST_SINIRI)
        }
    }
}
