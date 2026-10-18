package com.furkanisikay.namazakisi.saat.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Sözleşme nöbetçisi (saat W3): telefon `SaatKomutKurallariTest` AYNI
 * `saat-komut-ornekleri.json`'u okur. Biri değişip diğeri değişmezse bir taraf kırılır.
 */
class TelefonKomutuTest {
    /** `JSONObject.similar` android.jar taklidinde yok (derleme yolu) → anahtar anahtar karşılaştır. */
    private fun ayni(a: JSONObject, b: JSONObject): Boolean {
        val anahtarlar = a.keys().asSequence().toSet()
        return anahtarlar == b.keys().asSequence().toSet() && anahtarlar.all { a.get(it).toString() == b.get(it).toString() }
    }

    private fun oku(ad: String) = javaClass.classLoader!!.getResource(ad)!!.readText()
    private val fikstur = JSONObject(oku("saat-komut-ornekleri.json"))
    private val simdi = fikstur.getLong("simdiMs")

    @Test
    fun saatinUrettigiAcIstegiFiksturdekiIlkIstektir() {
        val yuk = (YukCozucu.coz(oku("ornek-yuk.json")) as CozumSonucu.Basarili).yuk
        val uretilen = JSONObject(TelefonKomutu.namazModuAc(yuk, simdi))
        val beklenen = fikstur.getJSONArray("namazModu").getJSONObject(0).getJSONObject("istek")
        assertTrue("$uretilen", ayni(uretilen, beklenen))
    }

    @Test
    fun yukYokkenVakitsizIstekVeTavan() {
        val o = JSONObject(TelefonKomutu.namazModuAc(null, simdi))
        assertEquals("ac", o.getString("islem"))
        assertTrue(!o.has("vakit"))
        assertEquals(simdi + TelefonKomutu.SAAT_MODU_AZAMI_MS, o.getLong("bitisMs"))
    }

    @Test
    fun durumCozulurVeBitisGecinceGosterilmez() {
        val d = TelefonKomutu.durumCoz(fikstur.getJSONObject("durum").toString())!!
        assertEquals("Fatih Camii", d.camide!!.ad)
        assertNull(d.soru)
        assertEquals(1791805000000L, d.modBitisMs)
        assertTrue(d.gecerli(1791805000001L).bos)
        assertNull(TelefonKomutu.durumCoz("bozuk"))
    }

    @Test
    fun cevapMetinleriKibarVeHalEkiYok() {
        assertEquals("Namaz modu açık · bitiş 13:40", TelefonKomutu.modMetni("acildi", "13:40"))
        assertEquals("Telefonunuzda Namaz modunu bir kez açın", TelefonKomutu.modMetni("erisimYok", null))
        assertEquals("Telefonunuzda Namaz modunu bir kez açın", TelefonKomutu.modMetni("kapali", null))
        assertEquals("Telefonunuza ulaşılamadı", TelefonKomutu.modMetni(TelefonKomutu.sonucCoz(null).sonuc, null))
        assertEquals(TelefonKomutu.Sonuc("acildi", 5L), TelefonKomutu.sonucCoz("""{"sonuc":"acildi","bitisMs":5}"""))
        assertEquals("Bu yer bir daha cami sayılmaz", TelefonKomutu.camiMetni("camiDegil", "tamam"))
        assertEquals("Bu soru artık geçerli değil", TelefonKomutu.camiMetni("evet", "gecersiz"))
    }
}
