package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Sözleşme nöbetçisi (saat W3): saat `TelefonKomutuTest` AYNI fikstürü okur
 * (`wear/app/src/test/resources/saat-komut-ornekleri.json`; test çalışma dizini android/app).
 */
class SaatKomutKurallariTest {
    /** `JSONObject.similar` android.jar taklidinde yok (derleme yolu) → anahtar anahtar karşılaştır. */
    private fun ayni(a: JSONObject, b: JSONObject): Boolean {
        val anahtarlar = a.keys().asSequence().toSet()
        return anahtarlar == b.keys().asSequence().toSet() && anahtarlar.all { a.get(it).toString() == b.get(it).toString() }
    }

    private val fikstur = JSONObject(File("../../wear/app/src/test/resources/saat-komut-ornekleri.json").readText())
    private val simdi = fikstur.getLong("simdiMs")
    private val gun = fikstur.getString("takvimGunu")

    @Test
    fun namazModuIstekleriKenetlenir() {
        val dizi = fikstur.getJSONArray("namazModu")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val istek = SaatKomutKurallari.namazModuIstegi(o.getJSONObject("istek").toString(), simdi, gun)
            when {
                o.optBoolean("gecersiz") -> assertNull("#$i", istek)
                o.optBoolean("kapat") -> assertEquals("#$i", false, istek!!.ac)
                else -> assertEquals("#$i", SaatKomutKurallari.ModIstegi(true, o.getString("tur"), o.getLong("bitisMs")), istek)
            }
        }
    }

    /** NÖBETÇİ (inceleme bulgusu 3): bilekten açılan mod bitişte kendiliğinden kapanır. */
    @Test
    fun acilanModunKapanisAlarmiBitistenSonra() {
        val ac = SaatKomutKurallari.namazModuIstegi(fikstur.getJSONArray("namazModu").getJSONObject(0).getJSONObject("istek").toString(), simdi, gun)!!
        assertEquals(ac.bitisMs + 1_000L, SaatKomutKurallari.kapanisAlarmiMs(ac))
        assertNull(SaatKomutKurallari.kapanisAlarmiMs(SaatKomutKurallari.ModIstegi(false, "", 0L)))
    }

    @Test
    fun durumJsonFiksturleAyni() {
        val d = fikstur.getJSONObject("durum")
        val c = d.getJSONObject("camide")
        val uretilen = SaatKomutKurallari.durumJson(
            SaatKomutKurallari.CamideBilgisi(c.getString("yerId"), c.getString("ad"), c.getLong("bitisMs")),
            null,
            d.getLong("modBitisMs"),
        )
        assertTrue(uretilen, ayni(JSONObject(uretilen), d))
    }

    @Test
    fun uyandirmaYalnizUyandirmaKimligiKabulEder() {
        val imsak = """{"id":"muhafiz_2026-10-13_vakit_imsak_seviye_2_dk_34","islem":"kapat"}"""
        assertEquals("kapat", SaatKomutKurallari.uyandirmaIstegi(imsak)!!.islem)
        val nafile = SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_teheccud_45","islem":"kildim"}""")!!
        assertTrue(nafile.nafile)
        // Öğle muhafızı, kuşluk ve bilinmeyen işlem reddedilir: saat başka planı susturamaz.
        assertNull(SaatKomutKurallari.uyandirmaIstegi("""{"id":"muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_34","islem":"kapat"}"""))
        assertNull(SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_kusluk_45","islem":"kapat"}"""))
        assertNull(SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_teheccud_45","islem":"sil"}"""))
        assertNull(SaatKomutKurallari.uyandirmaIstegi("bozuk"))
    }

    @Test
    fun uyandirmaFiksturuSaatinYazdiginiOkur() {
        assertEquals(fikstur.getLong("yedekGecikmesiDk") * 60_000L, SaatKomutKurallari.YEDEK_GECIKMESI_MS)
        assertEquals(fikstur.getLong("yedekSonPayiMs"), SaatKomutKurallari.YEDEK_SON_PAYI_MS)
        val dizi = fikstur.getJSONArray("uyandirma")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val istek = SaatKomutKurallari.uyandirmaIstegi(o.toString())!!
            assertEquals("#$i", o.getString("islem"), istek.islem)
            // ERTELE YOK: yalnız fikstürdeki eski saat kaydı "eski ertele" sayılır.
            assertEquals("#$i", o.optBoolean("eskiSaat", false), istek.eskiErtele)
        }
    }

    /**
     * NÖBETÇİ — GÖÇ (ertele YOK, 2026-10-19): eski saatin `ertele`'si (hedefli ya da hedefsiz)
     * reddedilmez ama depoya YAZILMAZ → JS turu yedeği özgün anında kurar; güncelleme
     * öncesinden kalan `ertele` kaydı da süzgeçte düşer.
     */
    @Test
    fun eskiErteleDepoyaYazilmazEskiKayitDuser() {
        val hedefsiz = SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_teheccud_45","islem":"ertele"}""")!!
        assertTrue(hedefsiz.eskiErtele)
        val hedefli = SaatKomutKurallari.uyandirmaIstegi(
            """{"id":"nafile_2026-10-12_teheccud_45","islem":"ertele","hedefMs":1000,"sonMs":5000}""",
        )!!
        assertTrue(hedefli.eskiErtele)
        assertEquals(0, JSONObject(SaatKomutKurallari.depoyaYaz(null, hedefli, 100)).length())
        val eskiDepo = """{"nafile_2026-10-12_teheccud_45":{"islem":"ertele","hedefMs":1000,"sonMs":5000},""" +
            """"muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25":{"islem":"kapat","sonMs":9000}}"""
        assertEquals(
            listOf("muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25"),
            SaatKomutKurallari.depoyuSuz(eskiDepo, 300).keys().asSequence().toList(),
        )
        // Eski ertele mevcut kapatma kaydını da SİLMEZ.
        assertTrue(JSONObject(SaatKomutKurallari.depoyaYaz(eskiDepo, hedefli, 300)).has("muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25"))
    }

    /** NÖBETÇİ (inceleme bulgusu 1): cevap kalıcıdır, JS turu okur; ömrü dolan düşer. */
    @Test
    fun depoCevabiSaklarOmruDolaniDusurur() {
        val kapat = SaatKomutKurallari.uyandirmaIstegi(
            """{"id":"nafile_2026-10-12_teheccud_45","islem":"kapat","sonMs":5000}""",
        )!!
        val kildim = SaatKomutKurallari.uyandirmaIstegi(
            """{"id":"muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25","islem":"kildim","sonMs":9000}""",
        )!!
        var depo = SaatKomutKurallari.depoyaYaz(null, kapat, 100)
        depo = SaatKomutKurallari.depoyaYaz(depo, kildim, 200)
        val o = SaatKomutKurallari.depoyuSuz(depo, 300)
        assertEquals("kapat", o.getJSONObject("nafile_2026-10-12_teheccud_45").getString("islem"))
        // "Kıldım" da yedeği bir daha kurdurmaz.
        assertEquals("kapat", o.getJSONObject("muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25").getString("islem"))
        // Pencere bitince (5000) o kayıt düşer, diğeri kalır.
        val sonra = SaatKomutKurallari.depoyuSuz(depo, 6000)
        assertEquals(listOf("muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25"), sonra.keys().asSequence().toList())
        // sonMs'siz (eski saat) kayıt varsayılan ömürle yaşar.
        val eski = SaatKomutKurallari.uyandirmaIstegi("""{"id":"nafile_2026-10-12_teheccud_45","islem":"kapat"}""")!!
        val d2 = SaatKomutKurallari.depoyaYaz(null, eski, 0)
        assertTrue(SaatKomutKurallari.depoyuSuz(d2, SaatKomutKurallari.VARSAYILAN_OMUR_MS - 1).has(eski.id))
        assertTrue(SaatKomutKurallari.depoyuSuz("bozuk", 0).length() == 0)
    }

    @Test
    fun camiCevabiYerKimligiIster() {
        assertEquals(SaatKomutKurallari.CamiCevabi("evet", "osm:n1"), SaatKomutKurallari.camiCevabi("""{"cevap":"evet","yerId":"osm:n1"}"""))
        assertNull(SaatKomutKurallari.camiCevabi("""{"cevap":"evet"}"""))
        assertNull(SaatKomutKurallari.camiCevabi("""{"cevap":"belki","yerId":"x"}"""))
    }

    /** NÖBETÇİ (inceleme bulgusu 7): telefon → saat "susturuldu" yolu fikstürle (saat tarafı da okur) aynı. */
    @Test
    fun telefondaKapandiYoluVeKimlikKapisi() {
        assertEquals(fikstur.getString("telefondaKapandiYolu"), SaatKomutKurallari.TELEFONDA_KAPANDI_YOLU)
        assertTrue(SaatKomutKurallari.uyandirmaKimligiMi("muhafiz_2026-10-12_vakit_imsak_seviye_2_dk_25"))
        assertTrue(!SaatKomutKurallari.uyandirmaKimligiMi("muhafiz_2026-10-12_vakit_ogle_seviye_2_dk_25"))
    }
}
