package com.furkanisikay.namazakisi.cekirdek

import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Eylem
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Karar
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.KaynakSinifi
import com.furkanisikay.namazakisi.cekirdek.KildimGuvenKurallari.Kayit
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * NÖBETÇİ (issue #299): başka bir uygulama kullanıcı adına SESSİZCE "kıldım" yazamaz;
 * kullanıcının bir kez onayladığı otomasyon ise bir daha manuele düşmez.
 */
class KildimGuvenKurallariTest {
    private val k = KildimGuvenKurallari
    private val biz = "com.furkanisikay.namazakisi"
    private val rutin = "com.samsung.android.app.routines"

    private fun sinif(paket: String?, ek: Boolean = false, anaEkran: Boolean = false, tarayici: Boolean = false) =
        k.siniflandir(paket, ek, biz, anaEkran, tarayici)

    @Test
    fun siniflandirma() {
        assertEquals(KaynakSinifi.KENDI, sinif(biz))
        assertEquals(KaynakSinifi.ANA_EKRAN, sinif("com.sec.android.app.launcher", anaEkran = true))
        assertEquals(KaynakSinifi.TARAYICI, sinif("com.android.chrome", tarayici = true))
        assertEquals(KaynakSinifi.UYGULAMA, sinif(rutin))
        assertEquals(KaynakSinifi.BILINMIYOR, sinif(null))
        assertEquals(KaynakSinifi.BILINMIYOR, sinif(""))
    }

    @Test
    fun uydurulmusReferrerEkineGuvenilmez() {
        // Çağıran EXTRA_REFERRER ile kendini ana ekran ya da izinli uygulama gibi gösterebilir.
        assertEquals(KaynakSinifi.BILINMIYOR, sinif("com.sec.android.app.launcher", ek = true, anaEkran = true))
        assertEquals(KaynakSinifi.BILINMIYOR, sinif(biz, ek = true))
    }

    @Test
    fun anaEkranVeKendimizDogrudan() {
        assertEquals(Eylem.Dogrudan, k.eylem(KaynakSinifi.KENDI, null))
        assertEquals(Eylem.Dogrudan, k.eylem(KaynakSinifi.ANA_EKRAN, null))
        // Ana ekran engellenmiş olsa bile kullanıcının kendi dokunuşudur.
        assertEquals(Eylem.Dogrudan, k.eylem(KaynakSinifi.ANA_EKRAN, Karar.ENGEL))
    }

    @Test
    fun bilinmeyenUygulamaIlkKezSorulur() {
        assertEquals(Eylem.Sor(herZamanSunulur = true, engelSunulur = true), k.eylem(KaynakSinifi.UYGULAMA, null))
    }

    @Test
    fun herZamanSonrasiSessizGecisEngelSonrasiYokSayma() {
        assertEquals(Eylem.Dogrudan, k.eylem(KaynakSinifi.UYGULAMA, Karar.IZIN))
        assertEquals(Eylem.YokSay, k.eylem(KaynakSinifi.UYGULAMA, Karar.ENGEL))
    }

    @Test
    fun tarayiciyaKaliciIzinVerilmez() {
        assertEquals(Eylem.Sor(herZamanSunulur = false, engelSunulur = true), k.eylem(KaynakSinifi.TARAYICI, null))
        // Eski/elle yazılmış bir "izin" kaydı da sayılmaz.
        assertEquals(Eylem.Sor(herZamanSunulur = false, engelSunulur = true), k.eylem(KaynakSinifi.TARAYICI, Karar.IZIN))
        assertEquals(Eylem.YokSay, k.eylem(KaynakSinifi.TARAYICI, Karar.ENGEL))
        assertFalse(k.kaydedilebilirMi(KaynakSinifi.TARAYICI, Karar.IZIN))
        assertTrue(k.kaydedilebilirMi(KaynakSinifi.TARAYICI, Karar.ENGEL))
    }

    @Test
    fun kimligiOlmayanBaslatanaKaliciSecenekSunulmaz() {
        assertEquals(Eylem.Sor(herZamanSunulur = false, engelSunulur = false), k.eylem(KaynakSinifi.BILINMIYOR, null))
        assertFalse(k.kaydedilebilirMi(KaynakSinifi.BILINMIYOR, Karar.IZIN))
        assertFalse(k.kaydedilebilirMi(KaynakSinifi.BILINMIYOR, Karar.ENGEL))
        assertTrue(k.kaydedilebilirMi(KaynakSinifi.UYGULAMA, Karar.IZIN))
    }

    @Test
    fun listeIslemleriVeSiralama() {
        var l = emptyMap<String, Kayit>()
        l = k.kaydet(l, Kayit("net.dinglisch.android.taskerm", Karar.ENGEL, "Tasker", 2))
        l = k.kaydet(l, Kayit(rutin, Karar.IZIN, "Modlar ve Rutinler", 1))
        l = k.kaydet(l, Kayit("com.ornek.b", Karar.IZIN, "bir uygulama", 3))
        assertEquals(listOf("bir uygulama", "Modlar ve Rutinler", "Tasker"), k.sirali(l).map { it.ad })
        // Karar değiştirme aynı paketi ezer.
        l = k.kaydet(l, Kayit(rutin, Karar.ENGEL, "Modlar ve Rutinler", 4))
        assertEquals(3, l.size)
        assertEquals(Karar.ENGEL, l[rutin]?.karar)
        l = k.kaldir(l, rutin)
        assertFalse(l.containsKey(rutin))
    }

    @Test
    fun kalicilikGidisDonusVeBozukKayit() {
        val l = mapOf(rutin to Kayit(rutin, Karar.IZIN, "Modlar ve Rutinler", 1700000000000L))
        assertEquals(l, k.jsondanOku(k.jsonaYaz(l)))
        assertEquals(emptyMap<String, Kayit>(), k.jsondanOku(null))
        assertEquals(emptyMap<String, Kayit>(), k.jsondanOku("bozuk{"))
        assertEquals(emptyMap<String, Kayit>(), k.jsondanOku("[1,2]"))
        val karisik = """{"$rutin":{"k":"izin","a":"R","t":5},"x":{"k":"izin"},"com.a.b":{"k":"belki"},"com.c.d":{"k":"engel"}}"""
        val okunan = k.jsondanOku(karisik)
        assertEquals(setOf(rutin, "com.c.d"), okunan.keys)
        // Ad yoksa paket adı gösterilir.
        assertEquals("com.c.d", okunan["com.c.d"]?.ad)
    }
}
