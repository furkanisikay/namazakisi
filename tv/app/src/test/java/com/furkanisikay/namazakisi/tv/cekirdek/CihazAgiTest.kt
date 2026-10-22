package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.ZoneId
import java.util.Base64

/**
 * Cihaz ağı alıcısı. Kanal fikstürü BAĞIMSIZ Python ile üretildi; telefon (`@noble/ciphers`)
 * aynı dosyayı `src/core/cihazAgi/__tests__/cihazAgi.test.ts`'te doğrular → JS'in şifrelediğini
 * Kotlin çözer, Kotlin'in şifrelediğini JS çözer (ikisi de aynı bayt dizisini üretir).
 */
class CihazAgiTest {
    private val f: JSONObject by lazy {
        JSONObject(javaClass.classLoader!!.getResourceAsStream("esitleme-ornekleri.json").bufferedReader(Charsets.UTF_8).readText())
    }
    private val anahtar get() = Base64.getDecoder().decode(f.getString("anahtar"))
    private val sir get() = Base64.getUrlDecoder().decode(f.getString("sir"))

    @Test
    fun kanalFiksturuBaytBaytAyni() {
        for ((ad, k) in listOf("kanal" to anahtar, "esleIstek" to sir, "esleYanit" to sir)) {
            val v = f.getJSONObject(ad)
            val iv = Base64.getDecoder().decode(v.getString("iv"))
            assertEquals(ad, v.getString("ct"), CihazKanali.sifrele(k, iv, v.getString("aad"), v.getString("duz")))
            assertEquals(ad, v.getString("duz"), CihazKanali.coz(k, v.getString("iv"), v.getString("aad"), v.getString("ct")))
        }
        assertEquals(f.getJSONObject("kanal").getString("aad"), CihazKanali.kanalAad(f.getString("tvKimlik"), f.getString("uye"), 7))
        assertEquals(f.getJSONObject("esleIstek").getString("aad"), CihazKanali.esleIstekAad(f.getString("tvKimlik")))
    }

    @Test
    fun kararliPortTelefonlaAyni() {
        val p = f.getJSONObject("kararliPort")
        for (k in p.keys()) assertEquals(p.getInt(k), AgProtokolu.kararliPort(k))
    }

    @Test
    fun ozelIpv4KatiTelefonlaAyni() {
        val ip = f.getJSONObject("ozelIpv4")
        val g = ip.getJSONArray("gecerli")
        for (i in 0 until g.length()) assertTrue(g.getString(i), com.furkanisikay.namazakisi.tv.veri.YerelAg.ozelMi(g.getString(i)))
        val r = ip.getJSONArray("gecersiz")
        for (i in 0 until r.length()) assertTrue("'${r.getString(i)}'", !com.furkanisikay.namazakisi.tv.veri.YerelAg.ozelMi(r.getString(i)))
    }

    @Test
    fun redlerCozulmez() {
        val r = f.getJSONArray("redler")
        for (i in 0 until r.length()) {
            val v = r.getJSONObject(i)
            assertNull(v.getString("neden"), CihazKanali.coz(anahtar, v.getString("iv"), v.getString("aad"), v.getString("ct")))
        }
        assertNull(CihazKanali.coz(anahtar, "!!", "x", "y"))
    }

    @Test
    fun yukCozulur() {
        val y = CihazYukuCozucu.coz(f.getJSONObject("kanal").getString("duz"))
        val d = y!!.durum!!
        assertEquals("Kadıköy, İstanbul", d.ad)
        assertEquals(setOf("imsak", "ogle"), d.kilinan["2026-10-20"])
        assertTrue(d.durumumSayilsin && d.tvHatirlat && d.cumaAktif)
        assertEquals(25, d.cumaCikisDk)
        assertNull(CihazYukuCozucu.coz("{\"v\":1}"))
        val bozuk = CihazYukuCozucu.coz("{\"v\":2,\"durum\":{\"konum\":{\"lat\":0,\"lng\":0},\"kilinan\":{\"x\":[\"imsak\"],\"2026-10-21\":[\"gunes\",\"ogle\"]}}}")!!.durum!!
        assertNull(bozuk.lat)
        assertEquals(setOf("2026-10-21"), bozuk.kilinan.keys)
        assertEquals(setOf("ogle"), bozuk.kilinan["2026-10-21"])
    }

    // ---- Alıcı uçtan uca (bellekte depo, telefonu taklit eden şifreli istemci) ----

    private class BellekDepo : UyeDeposuArayuzu {
        val anahtarlar = mutableMapOf<String, ByteArray>()
        val n = mutableMapOf<String, Long>()
        val mesajlar = mutableMapOf<String, String>()
        override fun anahtar(uye: String) = anahtarlar[uye]
        override fun sonN(uye: String) = n[uye] ?: 0L
        override fun sonNYaz(uye: String, n: Long) { this.n[uye] = n }
        override fun uyeEkle(uye: String, anahtar: ByteArray, cihazAdi: String): Boolean { anahtarlar[uye] = anahtar; return true }
        override fun uyeSil(uye: String) { anahtarlar.remove(uye); n.remove(uye) }
        override fun mesajYaz(uye: String, yukMetni: String, simdiMs: Long) { mesajlar[uye] = yukMetni }
    }

    private var sayac = 0
    private fun rastgele(n: Int) = ByteArray(n) { (it * 31 + (sayac++)).toByte() }

    @Test
    fun eslesmeVeEsitlemeUctanUca() {
        val depo = BellekDepo()
        var saat = 1_000_000L
        val m = AliciMantigi("0123456789abcdef", { "Salon TV" }, depo, { saat }, ::rastgele)
        // Eşleştirme ekranı kapalıyken her şey sessiz 403.
        assertEquals(403, m.isle("/esle", "{}").kod)

        val sir = Base64.getUrlDecoder().decode(m.eslesmeyiAc())
        val iv = ByteArray(12) { 1 }
        val istek = JSONObject().put("cihaz", "Furkan'ın telefonu").put("ist", "a1b2c3d4e5f60718").toString()
        val govde = JSONObject().put("v", 2).put("iv", CihazKanali.b64(iv))
            .put("ct", CihazKanali.sifrele(sir, iv, CihazKanali.esleIstekAad("0123456789abcdef"), istek)).toString()
        // Yanlış sırla şifrelenmiş istek sessizce reddedilir.
        val yanlis = JSONObject(govde).put("ct", CihazKanali.sifrele(ByteArray(32), iv, CihazKanali.esleIstekAad("0123456789abcdef"), istek)).toString()
        assertEquals(403, m.isle("/esle", yanlis).kod)

        assertEquals(202, m.isle("/esle", govde).kod)
        assertEquals("Furkan'ın telefonu", m.onayBekleyen)
        // Onay gelmeden: bekliyor.
        assertEquals("bekliyor", durumOku(m, sir).getString("durum"))
        // Başka bir istek kimliğiyle ikinci eşleştirme denemesi diyaloğu ele geçiremez.
        val baska = JSONObject(govde).put("ct", CihazKanali.sifrele(sir, iv, CihazKanali.esleIstekAad("0123456789abcdef"),
            JSONObject(istek).put("ist", "ffffffffffffffff").toString())).toString()
        assertEquals(409, m.isle("/esle", baska).kod)

        val uye = m.karar(true)!!
        val onay = durumOku(m, sir)
        assertEquals("onay", onay.getString("durum"))
        assertEquals(uye, onay.getString("u"))
        assertEquals("Salon TV", onay.getString("tvAdi"))
        assertTrue(m.onayTeslimEdildi)
        val k = Base64.getDecoder().decode(onay.getString("k"))

        // Üye kanalı: n kesin artan, tekrar reddedilir.
        val yuk = "{\"v\":2,\"durum\":{\"kilinan\":{},\"ozelGun\":false,\"tvHatirlat\":true,\"durumumSayilsin\":true,\"cuma\":{\"aktif\":false,\"cikisDk\":null},\"ramazan\":false}}"
        assertEquals(200, m.isle("/esitle", zarf(k, uye, 5, yuk)).kod)
        assertEquals(yuk, depo.mesajlar[uye])
        assertEquals(403, m.isle("/esitle", zarf(k, uye, 5, yuk)).kod)
        assertEquals(403, m.isle("/esitle", zarf(k, uye, 4, yuk)).kod)
        assertEquals(200, m.isle("/esitle", zarf(k, uye, 9, yuk)).kod)
        // Başka üyenin kimliğiyle / yanlış anahtarla: sessiz 403 (gövdesiz).
        val red = m.isle("/esitle", zarf(ByteArray(32) { 9 }, uye, 10, yuk))
        assertEquals(403, red.kod)
        assertEquals("", red.govde)
        assertEquals(403, m.isle("/esitle", zarf(k, "0000000000000000", 11, yuk)).kod)

        // Kaldırma telefondan: anahtar alıcıda silinir.
        assertEquals(200, m.isle("/esitle", zarf(k, uye, 12, "{\"v\":2,\"sil\":true}")).kod)
        assertNull(depo.anahtar(uye))
        assertEquals(403, m.isle("/esitle", zarf(k, uye, 13, yuk)).kod)

        // Yeni oturum: eski sır geçersiz.
        val yeniSir = Base64.getUrlDecoder().decode(m.oturumuYenile())
        assertTrue(!yeniSir.contentEquals(sir))
        assertEquals(403, m.isle("/esle", govde).kod)
    }

    @Test
    fun kumandaReddi() {
        val m = AliciMantigi("0123456789abcdef", { "TV" }, BellekDepo(), { 0L }, ::rastgele)
        val sir = Base64.getUrlDecoder().decode(m.eslesmeyiAc())
        val iv = ByteArray(12)
        val g = JSONObject().put("v", 2).put("iv", CihazKanali.b64(iv)).put(
            "ct",
            CihazKanali.sifrele(sir, iv, CihazKanali.esleIstekAad("0123456789abcdef"), "{\"cihaz\":\"X\",\"ist\":\"a1b2c3d4e5f60718\"}"),
        ).toString()
        assertEquals(202, m.isle("/esle", g).kod)
        assertNull(m.karar(false))
        assertEquals("red", durumOku(m, sir).getString("durum"))
    }

    private fun durumOku(m: AliciMantigi, sir: ByteArray): JSONObject {
        val y = m.isle("/esle-durum", "{\"ist\":\"a1b2c3d4e5f60718\"}")
        assertEquals(200, y.kod)
        val o = JSONObject(y.govde)
        val duz = CihazKanali.coz(sir, o.getString("iv"), CihazKanali.esleYanitAad("0123456789abcdef", "a1b2c3d4e5f60718"), o.getString("ct"))
        assertNotNull(duz)
        return JSONObject(duz!!)
    }

    private var ivSayac = 0
    private fun zarf(k: ByteArray, uye: String, n: Long, duz: String): String {
        val iv = ByteArray(12) { (ivSayac++).toByte() }
        return JSONObject().put("v", 2).put("u", uye).put("n", n).put("iv", CihazKanali.b64(iv))
            .put("ct", CihazKanali.sifrele(k, iv, CihazKanali.kanalAad("0123456789abcdef", uye, n), duz)).toString()
    }

    @Test
    fun hizSiniriArtanBekleme() {
        var saat = 0L
        val h = HizSiniri { saat }
        assertTrue(h.izinVar("1.1.1.1"))
        h.basarisiz("1.1.1.1")
        assertTrue(!h.izinVar("1.1.1.1"))
        saat += 1_001
        assertTrue(h.izinVar("1.1.1.1"))
        repeat(10) { h.basarisiz("1.1.1.1") }
        saat += 59_000
        assertTrue(!h.izinVar("1.1.1.1"))
        saat += 1_001
        assertTrue(h.izinVar("1.1.1.1"))
        assertTrue(h.izinVar("2.2.2.2"))
    }

    @Test
    fun baslikYalnizBilinenYollarVe8KB() {
        assertEquals(AgProtokolu.Istek("/esitle", 100), AgProtokolu.basligiCoz("POST /esitle HTTP/1.1\r\nContent-Length: 100"))
        assertNull(AgProtokolu.basligiCoz("POST /esitle HTTP/1.1\r\nContent-Length: 9000"))
        assertNull(AgProtokolu.basligiCoz("GET /esitle HTTP/1.1\r\nContent-Length: 10"))
        assertNull(AgProtokolu.basligiCoz("POST /baska HTTP/1.1\r\nContent-Length: 10"))
    }

    // ---- Sessiz bant (§4.6) ----

    private val bolge = ZoneId.of("Europe/Istanbul")
    private val gun = LocalDate.of(2026, 10, 21)
    private val v = VakitHesabi.hesapla(41.0082, 28.9784, gun)
    private fun pano(simdi: Long) = PanoHesabi.hesapla(simdi, bolge) { VakitHesabi.hesapla(41.0082, 28.9784, it) }
    private fun uye(kilinan: Set<String> = emptySet(), sayilsin: Boolean = true, hatirlat: Boolean = true, ozel: Boolean = false, haber: Long) =
        UyeHali("u1", DurumGoruntusu(null, null, null, mapOf(gun.toString() to kilinan), ozel, hatirlat, sayilsin, false, null, false), haber)

    @Test
    fun kabulBandiYalnizDurumuSayilanlarHepsiKildiysa() {
        val t20 = v.aksam - 20 * 60_000
        // Sayılan tek üye kıldı → dua; kılmadıysa yok.
        assertTrue(EvDurumu.hepsiKildi(pano(t20), listOf(uye(setOf("ikindi"), haber = t20)), t20))
        assertFalse(EvDurumu.hepsiKildi(pano(t20), listOf(uye(haber = t20)), t20))
        // Durumunu açmayan üye sayılmaz: tek başına "hepsi kıldı" doğmaz (kimse sayılmıyor).
        assertFalse(EvDurumu.hepsiKildi(pano(t20), listOf(uye(setOf("ikindi"), sayilsin = false, haber = t20)), t20))
        // Biri kıldı biri kılmadı → yok.
        assertFalse(
            EvDurumu.hepsiKildi(pano(t20), listOf(uye(setOf("ikindi"), haber = t20), uye(haber = t20).copy(uye = "u2")), t20),
        )
        // Pencere dışı → yok.
        val t31 = v.aksam - 31 * 60_000
        assertFalse(EvDurumu.hepsiKildi(pano(t31), listOf(uye(setOf("ikindi"), haber = t31)), t31))
        assertEquals("Allah kabul etsin", EvDurumu.KABUL_DUASI)
    }

    @Test
    fun panoSelamiCumaVeIftar() {
        // 2026-10-21 çarşamba: selam yok; 2026-10-23 cuma öğle: "Hayırlı cumalar".
        val ogle = v.ogle + 60_000
        assertNull(EvDurumu.selam(pano(ogle), emptyList(), ogle))
        val cuma = VakitHesabi.hesapla(41.0082, 28.9784, LocalDate.of(2026, 10, 23))
        val cumaOgle = cuma.ogle + 60_000
        assertEquals("Hayırlı cumalar", EvDurumu.selam(pano(cumaOgle), emptyList(), cumaOgle))
        // Ramazan diyen üye varsa akşam vakti "Hayırlı iftarlar".
        val aksam = v.aksam + 60_000
        val ramazanli = UyeHali("u1", DurumGoruntusu(null, null, null, emptyMap(), false, true, true, false, null, true), aksam)
        assertEquals("Hayırlı iftarlar", EvDurumu.selam(pano(aksam), listOf(ramazanli), aksam))
    }

    @Test
    fun bantBesSartVeSinirlar() {
        val ikindiSonu = v.aksam
        val t20 = ikindiSonu - 20 * 60_000
        val t31 = ikindiSonu - 31 * 60_000
        assertEquals("İkindi vakti daralıyor · 20 dk", EvDurumu.bant(pano(t20), listOf(uye(haber = t20 - 1000)), t20))
        assertNull("30 dk'dan önce yok", EvDurumu.bant(pano(t31), listOf(uye(haber = t31)), t31))
        assertNull("kılınmışsa yok", EvDurumu.bant(pano(t20), listOf(uye(setOf("ikindi"), haber = t20)), t20))
        assertNull("durumu sayılmasın", EvDurumu.bant(pano(t20), listOf(uye(sayilsin = false, haber = t20)), t20))
        assertNull("TV hatırlatması kapalı", EvDurumu.bant(pano(t20), listOf(uye(hatirlat = false, haber = t20)), t20))
        assertNull("özel gün", EvDurumu.bant(pano(t20), listOf(uye(ozel = true, haber = t20)), t20))
        assertNull("12 saatten eski haber", EvDurumu.bant(pano(t20), listOf(uye(haber = t20 - 12 * 3_600_000L - 1)), t20))
        assertNotNull("tam 12 saat sınırında var", EvDurumu.bant(pano(t20), listOf(uye(haber = t20 - 12 * 3_600_000L)), t20))
        assertNull("hiç haber yok", EvDurumu.bant(pano(t20), listOf(uye(haber = 0)), t20))
        // Olay günlüğüyle gelen kılındı da sayılır.
        val olayli = uye(haber = t20).copy(olayKilinan = mapOf(gun.toString() to setOf("ikindi")))
        assertNull(EvDurumu.bant(pano(t20), listOf(olayli), t20))
        // İki üyeden biri kılmamışsa bant var; metin kişi/sayı içermez.
        assertEquals(
            "İkindi vakti daralıyor · 20 dk",
            EvDurumu.bant(pano(t20), listOf(uye(setOf("ikindi"), haber = t20), uye(haber = t20).copy(uye = "u2")), t20),
        )
        // Güneş vaktinde (farz değil) bant yok.
        val gunes = v.gunes + 60_000
        assertNull(EvDurumu.bant(pano(gunes), listOf(uye(haber = gunes)), gunes))
    }

    @Test
    fun ramazanSayaciVeCuma() {
        val yarin = VakitHesabi.hesapla(41.0082, 28.9784, gun.plusDays(1))
        assertEquals("Sahura kalan", EvDurumu.ramazanSayaci(v, yarin.imsak, v.imsak - 1).baslik)
        assertEquals(EvDurumu.Sayac("İftara kalan", v.aksam), EvDurumu.ramazanSayaci(v, yarin.imsak, v.ogle))
        assertEquals(EvDurumu.Sayac("Sahura kalan", yarin.imsak), EvDurumu.ramazanSayaci(v, yarin.imsak, v.aksam + 1))

        val cuma = LocalDate.of(2026, 10, 23)
        val cv = VakitHesabi.hesapla(41.0082, 28.9784, cuma)
        val simdi = cv.ogle - 2 * 3_600_000L
        val p = PanoHesabi.hesapla(simdi, bolge) { VakitHesabi.hesapla(41.0082, 28.9784, it) }
        val cumaUye = UyeHali("u", DurumGoruntusu(null, null, null, emptyMap(), false, false, false, true, 25, false), simdi)
        assertEquals(cv.ogle - 25 * 60_000L, EvDurumu.cumaCikisMs(p, listOf(cumaUye), simdi))
        assertNull(EvDurumu.cumaCikisMs(pano(v.ogle - 3_600_000), listOf(cumaUye), v.ogle - 3_600_000))
    }
}
