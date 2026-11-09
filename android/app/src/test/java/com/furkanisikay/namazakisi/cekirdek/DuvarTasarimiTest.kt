package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Duvar kâğıdı tasarım sözleşmesinin JS ile EŞLİĞİ. Örnek `duvar-tasarim-ornek.json` JS üreticisinin
 * (`scripts/icerik/duvar-tasarim-ornek-uret.js`, kaynak `src/core/icerik/duvarTasarimi.ts`) çıktısıdır;
 * elle DÜZENLENMEZ. Swift testi aynı dosyayı okur.
 */
class DuvarTasarimiTest {

    private companion object {
        /** `sahneOzetiSureclerArasiKararli` sahnesinin özeti (data class `toString` biçimine bağlı). */
        const val SAHNE_OZETI = "9282e8b6"
    }

    private val ornek: JSONObject = JSONObject(
        requireNotNull(javaClass.classLoader?.getResource("duvar-tasarim-ornek.json")) { "ornek dosya yok" }.readText()
    )
    private val sahneler: Map<DuvarGogu, GokSahnesi> = DuvarTasarimi.sahnelerCoz(ornek.getJSONObject("sahneler"))

    private fun bantlar(d: JSONArray): List<Bant> =
        (0 until d.length()).map { d.getJSONArray(it).let { b -> Bant(b.getDouble(0), b.getDouble(1)) } }

    // --- Sabitler ve sahneler ------------------------------------------------------------------

    @Test
    fun androidSabitleriOrnekleAyni() {
        val b = ornek.getJSONObject("izinliBantlar").getJSONObject("android")
        assertEquals(bantlar(b.getJSONArray("kilit")), DuvarTasarimi.IZINLI_BANTLAR[DuvarEkrani.KILIT])
        assertEquals(bantlar(b.getJSONArray("ana")), DuvarTasarimi.IZINLI_BANTLAR[DuvarEkrani.ANA])
        val m = ornek.getJSONObject("varsayilanMerkez").getJSONObject("android")
        assertEquals(m.getDouble("kilit"), DuvarTasarimi.VARSAYILAN_MERKEZ.getValue(DuvarEkrani.KILIT), 0.0)
        assertEquals(m.getDouble("ana"), DuvarTasarimi.VARSAYILAN_MERKEZ.getValue(DuvarEkrani.ANA), 0.0)
    }

    @Test
    fun besSahneDeCozulur() {
        assertEquals(DuvarGogu.values().toSet(), sahneler.keys)
        val imsak = sahneler.getValue(DuvarGogu.IMSAK)
        assertEquals(4, imsak.gradyan.size)
        assertEquals(CisimTuru.HILAL, imsak.cisim?.tur)
        assertEquals(1, imsak.ufuk.size)
        assertEquals(0xFFFFFFFF.toInt(), imsak.metin)
        val ikindi = sahneler.getValue(DuvarGogu.IKINDI)
        assertEquals(CisimTuru.GUNES, ikindi.cisim?.tur)
        assertEquals(3, ikindi.huzmeler.size)
        assertNotNull(ikindi.cisim?.isimaR)
        assertEquals(0xFF1F2A22.toInt(), sahneler.getValue(DuvarGogu.KUSLUK).metin)
        assertEquals(12, sahneler.getValue(DuvarGogu.YATSI).yildizlar.size)
    }

    @Test
    fun bozukSahneYokSayilir() {
        val o = JSONObject(ornek.getJSONObject("sahneler").toString())
        o.getJSONObject("aksam").put("metin", "kirmizi")
        o.put("kusluk", "x")
        val c = DuvarTasarimi.sahnelerCoz(o)
        assertFalse(c.containsKey(DuvarGogu.AKSAM))
        assertFalse(c.containsKey(DuvarGogu.KUSLUK))
        assertTrue(c.containsKey(DuvarGogu.IMSAK))
        assertTrue(DuvarTasarimi.sahnelerCoz(null).isEmpty())
    }

    // --- Kurallar (örnekle eşlik) ----------------------------------------------------------------

    @Test
    fun gokOrnekleri() {
        val g = ornek.getJSONObject("gok")
        val v = DuvarTasarimi.vakitlerCoz(g.getJSONArray("vakitler"))!!
        val ornekler = g.getJSONArray("ornekler")
        assertTrue(ornekler.length() >= 8)
        for (i in 0 until ornekler.length()) {
            val o = ornekler.getJSONObject(i)
            val an = o.getLong("an")
            assertEquals("an=$an", o.getString("gok"), DuvarTasarimi.vaktinGogu(an, v).kod)
            val beklenen = if (o.isNull("sonrakiSinir")) null else o.getLong("sonrakiSinir")
            assertEquals("an=$an", beklenen, DuvarTasarimi.sonrakiGokSiniri(an, v))
        }
    }

    @Test
    fun yerlesimOrnekleri() {
        val tumBantlar = ornek.getJSONObject("izinliBantlar")
        val dizi = ornek.getJSONArray("yerlesim")
        assertEquals(80, dizi.length())
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val b = bantlar(tumBantlar.getJSONObject(o.getString("platform")).getJSONArray(o.getString("ekran")))
            val sonuc = DuvarTasarimi.yaziYerlesimi(o.getDouble("istenen"), o.getDouble("blok"), b)
            val ad = o.toString()
            if (o.isNull("beklenen")) {
                assertNull(ad, sonuc)
            } else {
                val e = o.getJSONObject("beklenen")
                assertNotNull(ad, sonuc)
                assertEquals(ad, e.getDouble("ust"), sonuc!!.ust, 1e-6)
                val eb = e.getJSONArray("bant")
                assertEquals(ad, Bant(eb.getDouble(0), eb.getDouble(1)), sonuc.bant)
            }
        }
    }

    @Test
    fun cisimOrnekleri() {
        val dizi = ornek.getJSONArray("cisim")
        assertEquals(20, dizi.length())
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val cisim = requireNotNull(sahneler.getValue(DuvarGogu.coz(o.getString("gok"))!!).cisim)
            val kutu = if (o.isNull("kutu")) null else o.getJSONArray("kutu").let {
                Kutu(it.getDouble(0), it.getDouble(1), it.getDouble(2), it.getDouble(3))
            }
            val sonuc = DuvarTasarimi.cisimKonumuSec(cisim, kutu, o.getDouble("oran"))
            val beklenen = if (o.isNull("beklenen")) null else o.getJSONArray("beklenen").let { Nokta(it.getDouble(0), it.getDouble(1)) }
            assertEquals(o.toString(), beklenen, sonuc)
        }
    }

    @Test
    fun okunurlukOrnekleri() {
        val dizi = ornek.getJSONArray("okunurluk")
        assertTrue(dizi.length() >= 9)
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val e = o.getJSONObject("beklenen")
            val k = DuvarTasarimi.okunurlukKarari(o.getDouble("parlaklik"))
            val ad = o.toString()
            assertEquals(ad, GununAyetiKurallari.renkCoz(e.getString("metin")), k.metin)
            assertEquals(ad, GununAyetiKurallari.renkCoz(e.getString("perde")), k.perde)
            assertEquals(ad, e.getDouble("perdeOpakligi"), k.perdeOpakligi, 1e-9)
        }
    }

    @Test
    fun normalizeOrnekleri() {
        val dizi = ornek.getJSONArray("normalize")
        assertTrue(dizi.length() >= 2)
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val gercek = ayarJson(GununAyetiKurallari.duvarCoz(o.getJSONObject("ham")))
            ayniMi(o.getJSONObject("beklenen"), gercek, "normalize[$i]")
        }
    }

    /** `DuvarAyari` → JS `DuvarKagidiAyari` biçimi (yalnız karşılaştırma için). */
    private fun ayarJson(a: DuvarAyari): JSONObject = JSONObject()
        .put("acik", a.acik).put("yer", a.yer.kod).put("zemin", a.zemin.kod).put("arapca", a.arapca)
        .put("paletRenk", String.format("#%06X", a.paletRenk and 0xFFFFFF)).put("vakteUysun", a.vakteUysun)
        .put(
            "yazi",
            JSONObject().put("kilitY", a.yazi.kilitY ?: JSONObject.NULL).put("anaY", a.yazi.anaY ?: JSONObject.NULL)
                .put("olcek", a.yazi.olcek).put("hiza", a.yazi.hiza.kod).put("tip", a.yazi.tip.kod),
        )
        .put("sus", JSONObject().put("tur", a.sus.tur.kod).put("belirginlik", a.sus.belirginlik))
        .put(
            "foto",
            JSONObject().put("dosya", a.foto.dosya ?: JSONObject.NULL).put("karartma", a.foto.karartma)
                .put("bulaniklik", a.foto.bulaniklik).put("x", a.foto.x).put("y", a.foto.y)
                .put("yakinlik", a.foto.yakinlik).put("okunurluk", a.foto.okunurluk),
        )

    private fun ayniMi(beklenen: Any?, gercek: Any?, yol: String) {
        when (beklenen) {
            is JSONObject -> {
                assertTrue(yol, gercek is JSONObject)
                val g = gercek as JSONObject
                assertEquals(yol, beklenen.keySet(), g.keySet())
                for (k in beklenen.keySet()) ayniMi(beklenen.get(k), g.get(k), "$yol.$k")
            }
            is Number -> assertEquals(yol, beklenen.toDouble(), (gercek as Number).toDouble(), 1e-12)
            else -> assertEquals(yol, beklenen, gercek)
        }
    }

    // --- Ayrıştırma ---------------------------------------------------------------------------

    @Test
    fun sayiOlmayanAlanVarsayilanaDuserSinirlarUygulanir() {
        val d = GununAyetiKurallari.duvarCoz(
            JSONObject(
                """{"acik":"true","arapca":1,"zemin":"aksam","paletRenk":"#802E7D32","vakteUysun":0,
                   "yazi":{"kilitY":-3,"anaY":"0.5","olcek":0.1,"hiza":"son","tip":"zarif"},
                   "sus":{"tur":"girih","belirginlik":7},
                   "foto":{"dosya":"duvar-foto-abc1.png","karartma":-1,"bulaniklik":"x","x":2,"y":-1,"yakinlik":0.5,"okunurluk":false}}"""
            )
        )
        assertFalse(d.acik)
        assertFalse(d.arapca)
        assertEquals(DuvarZemini.AKSAM, d.zemin)
        assertEquals(DuvarAyari.VARSAYILAN_PALET, d.paletRenk)
        // JS `!== false`: yalnız false kapatır.
        assertTrue(d.vakteUysun)
        assertEquals(DuvarYaziAyari(kilitY = 0.0, anaY = null, olcek = 0.7, hiza = YaziHizasi.SON, tip = YaziTipi.ZARIF), d.yazi)
        assertEquals(DuvarSusAyari(SusTuru.GIRIH, 1.0), d.sus)
        assertEquals(
            DuvarFotoAyari(dosya = "duvar-foto-abc1.png", karartma = 0.0, bulaniklik = 0.15, x = 1.0, y = 0.0, yakinlik = 1.0, okunurluk = false),
            d.foto,
        )
    }

    @Test
    fun fotoAdiYalnizUygulamaKopyasi() {
        fun ad(a: String) = DuvarTasarimi.fotoAyariCoz(JSONObject().put("dosya", a)).dosya
        assertEquals("duvar-foto-1a2b3c.jpg", ad("duvar-foto-1a2b3c.jpg"))
        assertNull(ad("../duvar-foto-1a2b3c.jpg"))
        assertNull(ad("duvar-foto-ABCD.jpg"))
        assertNull(ad("duvar-foto-abc.jpg"))
        assertNull(ad("duvar-foto-abcd.jpeg"))
        assertNull(ad("duvar-foto-abcd.jpg/x"))
    }

    @Test
    fun vakitlerYalnizBesSayiysa() {
        assertEquals(listOf(1L, 2L, 3L, 4L, 5L), DuvarTasarimi.vakitlerCoz(JSONArray("[1,2,3,4,5]")))
        assertNull(DuvarTasarimi.vakitlerCoz(JSONArray("[1,2,3,4]")))
        assertNull(DuvarTasarimi.vakitlerCoz(JSONArray("[1,2,3,4,\"5\"]")))
        assertNull(DuvarTasarimi.vakitlerCoz(null))
    }

    /** Eski fikstüre yeni alanlar eklenmiş yük: plan kaydı vakitleri ve sahneler okunur, bozuk vakit yükü düşürmez. */
    private fun yeniYuk(duvar: JSONObject, bozukVakit: Boolean = false): GununAyetiYuku {
        val ham = JSONObject(
            requireNotNull(javaClass.classLoader?.getResource("gunun-ayeti-ornek.json")).readText()
        )
        val v = ornek.getJSONObject("gok").getJSONArray("vakitler")
        val plan = ham.getJSONArray("plan")
        plan.getJSONObject(0).put("baslangicMs", v.getLong(0)).put("vakitler", if (bozukVakit) JSONArray("[1]") else v)
        for (i in 1 until plan.length()) plan.getJSONObject(i).put("baslangicMs", v.getLong(0) + i * 86_400_000L)
        ham.put("duvar", duvar).put("sahneler", ornek.getJSONObject("sahneler"))
        return requireNotNull(GununAyetiKurallari.coz(ham.toString()))
    }

    private val vakitler: List<Long> get() = DuvarTasarimi.vakitlerCoz(ornek.getJSONObject("gok").getJSONArray("vakitler"))!!

    @Test
    fun yukVakitlerVeSahnelerleCozulur() {
        val y = yeniYuk(JSONObject().put("acik", true).put("zemin", "yatsi"))
        assertEquals(vakitler, y.plan.first().vakitler)
        assertNull(y.plan[1].vakitler)
        assertEquals(5, y.sahneler.size)
        val bozuk = yeniYuk(JSONObject().put("acik", true), bozukVakit = true)
        assertNull(bozuk.plan.first().vakitler)
    }

    // --- Çizilen gök, alarm, imza ----------------------------------------------------------------

    @Test
    fun etkinGokVakteUyar() {
        val y = yeniYuk(JSONObject().put("acik", true).put("zemin", "yatsi"))
        val k = y.plan.first()
        val v = vakitler
        assertEquals(DuvarGogu.KUSLUK, GununAyetiKurallari.etkinGok(y.duvar, k, v[1] + 1))
        assertEquals(DuvarGogu.AKSAM, GununAyetiKurallari.etkinGok(y.duvar, k, v[3]))
        // vakteUysun kapalı ya da vakit yok → seçilen gök.
        assertEquals(DuvarGogu.YATSI, GununAyetiKurallari.etkinGok(y.duvar.copy(vakteUysun = false), k, v[1] + 1))
        assertEquals(DuvarGogu.YATSI, GununAyetiKurallari.etkinGok(y.duvar, k.copy(vakitler = null), v[1] + 1))
        // Gök olmayan zemin.
        assertNull(GununAyetiKurallari.etkinGok(y.duvar.copy(zemin = DuvarZemini.GECE), k, v[1] + 1))
        assertNull(GununAyetiKurallari.etkinGok(y.duvar.copy(zemin = DuvarZemini.FOTO), k, v[1] + 1))
    }

    @Test
    fun alarmGokSinirindaDaKurulur() {
        val y = yeniYuk(JSONObject().put("acik", true).put("zemin", "imsak"))
        val v = vakitler
        val yarin = y.plan[1].baslangicMs
        // Gök sınırı gün sınırından önce: o kurulur.
        assertEquals(v[1], GununAyetiKurallari.sonrakiUyanmaMs(y, v[0] + 1))
        assertEquals(v[4], GununAyetiKurallari.sonrakiUyanmaMs(y, v[3] + 1))
        // Yatsıdan sonra gök sınırı kalmaz → ertesi gün (imsak).
        assertEquals(yarin, GununAyetiKurallari.sonrakiUyanmaMs(y, v[4] + 1))
        // Kapalı / vakte uymayan / düz zemin → yalnız gün sınırı.
        assertEquals(yarin, GununAyetiKurallari.sonrakiUyanmaMs(y.copy(duvar = y.duvar.copy(acik = false)), v[0] + 1))
        assertEquals(yarin, GununAyetiKurallari.sonrakiUyanmaMs(y.copy(duvar = y.duvar.copy(vakteUysun = false)), v[0] + 1))
        assertEquals(yarin, GununAyetiKurallari.sonrakiUyanmaMs(y.copy(duvar = y.duvar.copy(zemin = DuvarZemini.PALET)), v[0] + 1))
        // Plan bitmiş olsa da bugünün gök sınırı kurulur.
        val tekGun = y.copy(plan = listOf(y.plan.first()))
        assertEquals(v[2], GununAyetiKurallari.sonrakiUyanmaMs(tekGun, v[1]))
        assertNull(GununAyetiKurallari.sonrakiUyanmaMs(tekGun, v[4]))
    }

    @Test
    fun imzaGorunenleDegisirYukYazimiylaDegismez() {
        val y = yeniYuk(JSONObject().put("acik", true).put("zemin", "imsak").put("yer", "kilit"))
        val k = y.plan.first()
        val d = y.duvar
        fun imza(a: DuvarAyari, gok: DuvarGogu?, foto: Long? = null) =
            GununAyetiKurallari.duvarImzasi(k, y.metin, a, gok, gok?.let { y.sahneler[it] }, foto)
        val sabah = imza(d, DuvarGogu.IMSAK)
        // Aynı gök: vakteUysun açık/kapalı fark etmez (görünen aynı), yük yeniden yazımı imzayı değiştirmez.
        assertEquals(sabah, imza(d.copy(vakteUysun = false), DuvarGogu.IMSAK))
        assertEquals(sabah, imza(GununAyetiKurallari.duvarCoz(JSONObject().put("acik", true).put("zemin", "imsak")), DuvarGogu.IMSAK))
        // Gök değişince yeniden yazılır.
        assertNotEquals(sabah, imza(d, DuvarGogu.KUSLUK))
        // Sahne yoksa gece sayılır.
        assertEquals(imza(d.copy(zemin = DuvarZemini.GECE), null), GununAyetiKurallari.duvarImzasi(k, y.metin, d, DuvarGogu.IMSAK, null))
        // Yazı ve süs.
        assertNotEquals(sabah, imza(d.copy(yazi = d.yazi.copy(kilitY = 0.2)), DuvarGogu.IMSAK))
        assertNotEquals(sabah, imza(d.copy(yazi = d.yazi.copy(olcek = 1.2)), DuvarGogu.IMSAK))
        assertNotEquals(sabah, imza(d.copy(yazi = d.yazi.copy(hiza = YaziHizasi.BAS)), DuvarGogu.IMSAK))
        assertNotEquals(sabah, imza(d.copy(yazi = d.yazi.copy(tip = YaziTipi.SADE)), DuvarGogu.IMSAK))
        assertNotEquals(sabah, imza(d.copy(sus = DuvarSusAyari(SusTuru.MIHRAP)), DuvarGogu.IMSAK))
        assertNotEquals(sabah, imza(d.copy(sus = d.sus.copy(belirginlik = 0.9)), DuvarGogu.IMSAK))
        // Yalnız kilit çiziliyorsa ana ekranın yazı merkezi görünmez.
        assertEquals(sabah, imza(d.copy(yazi = d.yazi.copy(anaY = 0.5)), DuvarGogu.IMSAK))
        // Fotoğraf: dosya adı, değişme zamanı ve ayarlar; dosya yoksa gece.
        val foto = d.copy(zemin = DuvarZemini.FOTO, foto = DuvarFotoAyari(dosya = "duvar-foto-abcd.jpg"))
        val f1 = imza(foto, null, 100L)
        assertNotEquals(f1, imza(foto, null, 200L))
        assertNotEquals(f1, imza(foto.copy(foto = foto.foto.copy(dosya = "duvar-foto-efgh.jpg")), null, 100L))
        assertNotEquals(f1, imza(foto.copy(foto = foto.foto.copy(karartma = 0.6)), null, 100L))
        assertEquals(imza(d.copy(zemin = DuvarZemini.GECE), null), imza(foto, null, null))
    }

    @Test
    fun sahneOzetiSureclerArasiKararli() {
        // Elle kurulmuş sahne (örnekten değil): özet SABİT bir değer olmalı. Kimlik hash'i (enum
        // `hashCode`) imzaya girerse bu değer koşudan koşuya değişir ve duvar kâğıdı her açılışta
        // yeniden yazılır.
        val s = GokSahnesi(
            gradyan = listOf(RenkDuragi(0.0, 0xFF070C18.toInt()), RenkDuragi(1.0, 0xFF22385A.toInt())),
            yildizlar = listOf(Yildiz(0.1, 0.2, 0.004, 0.9)),
            cisim = GokCismi(CisimTuru.HILAL, listOf(Nokta(0.79, 0.63)), 0.04, 0xFFEDE6CF.toInt(), 0.9, -0.015, -0.004, 0.033),
            huzmeler = emptyList(),
            ufuk = emptyList(),
            metin = 0xFFFFFFFF.toInt(),
        )
        assertEquals(SAHNE_OZETI, DuvarTasarimi.sahneOzeti(s))
        assertNotEquals(SAHNE_OZETI, DuvarTasarimi.sahneOzeti(s.copy(cisim = s.cisim!!.copy(tur = CisimTuru.GUNES))))
    }

    // --- Çizim sayıları (JS `duvarCizimi.ts` = düzenleyici önizlemesi) ---------------------------

    private val cizim: JSONObject get() = ornek.getJSONObject("cizim")

    private fun esit(beklenen: Double, gercek: Double, ad: String) = assertEquals(ad, beklenen, gercek, 1e-12)

    private fun kemer(o: JSONObject, k: MihrapKemeri, ad: String) {
        esit(o.getDouble("yanPay"), k.yanPay, "$ad.yanPay")
        esit(o.getDouble("r"), k.r, "$ad.r")
        esit(o.getDouble("merkezAlti"), k.merkezAlti, "$ad.merkezAlti")
        esit(o.getDouble("kalinlik"), k.kalinlik, "$ad.kalinlik")
        esit(o.getDouble("opaklik"), k.opaklik, "$ad.opaklik")
    }

    @Test
    fun cizimSabitleriOrnekleAyni() {
        val c = cizim
        esit(c.getDouble("tasarimGenisligi"), DuvarCizim.TASARIM_GENISLIGI, "tasarimGenisligi")
        val y = c.getJSONObject("yazi")
        val yazi = mapOf(
            "meal" to DuvarCizim.MEAL, "mealArapcali" to DuvarCizim.MEAL_ARAPCALI, "arapca" to DuvarCizim.ARAPCA,
            "kunye" to DuvarCizim.KUNYE, "atif" to DuvarCizim.ATIF, "yanBosluk" to DuvarCizim.YAN_BOSLUK,
            "kucukYildiz" to DuvarCizim.KUCUK_YILDIZ, "arapcaSatir" to DuvarCizim.ARAPCA_SATIR, "mealSatir" to DuvarCizim.MEAL_SATIR,
            "kunyeHarfAraligi" to DuvarCizim.KUNYE_HARF_ARALIGI, "mealUstArapcali" to DuvarCizim.MEAL_UST_ARAPCALI,
            "mealUstYildizli" to DuvarCizim.MEAL_UST_YILDIZLI, "kunyeUstArapcali" to DuvarCizim.KUNYE_UST_ARAPCALI,
            "kunyeUst" to DuvarCizim.KUNYE_UST, "atifUst" to DuvarCizim.ATIF_UST, "atifEnAzOlcek" to DuvarCizim.ATIF_EN_AZ_OLCEK,
        )
        // Örnekteki her yazı ölçüsü native'de de var (yeni ölçü eklenirse bu test düşer).
        assertEquals(y.keySet(), yazi.keys)
        for ((ad, deger) in yazi) esit(y.getDouble(ad), deger, "yazi.$ad")

        val m = c.getJSONObject("sus").getJSONObject("mihrap")
        esit(m.getDouble("yaziYanPayi"), DuvarCizim.MIHRAP_YAZI_YAN_PAYI, "mihrap.yaziYanPayi")
        kemer(m.getJSONObject("dis"), DuvarCizim.MIHRAP_DIS, "mihrap.dis")
        kemer(m.getJSONObject("ic"), DuvarCizim.MIHRAP_IC, "mihrap.ic")
        val my = m.getJSONObject("yildiz")
        esit(my.getDouble("merkezUstu"), DuvarCizim.MIHRAP_YILDIZ_UST, "mihrap.yildiz.merkezUstu")
        esit(my.getDouble("disR"), DuvarCizim.MIHRAP_YILDIZ_DIS_R, "mihrap.yildiz.disR")
        esit(my.getDouble("icR"), DuvarCizim.MIHRAP_YILDIZ_IC_R, "mihrap.yildiz.icR")
        esit(my.getDouble("opaklik"), DuvarCizim.MIHRAP_YILDIZ_OPAKLIK, "mihrap.yildiz.opaklik")

        val g = c.getJSONObject("sus").getJSONObject("girih")
        esit(g.getDouble("karo"), DuvarCizim.GIRIH_KARO, "girih.karo")
        assertEquals(g.getString("yol"), DuvarCizim.GIRIH_YOL)
        esit(g.getDouble("daireR"), DuvarCizim.GIRIH_DAIRE_R, "girih.daireR")
        esit(g.getDouble("yildizKalinlik"), DuvarCizim.GIRIH_YILDIZ_KALINLIK, "girih.yildizKalinlik")
        esit(g.getDouble("daireKalinlik"), DuvarCizim.GIRIH_DAIRE_KALINLIK, "girih.daireKalinlik")
        esit(g.getDouble("opaklik"), DuvarCizim.GIRIH_OPAKLIK, "girih.opaklik")
        assertEquals(
            listOf(24 to 0, 30 to 18, 48 to 24, 30 to 30, 24 to 48, 18 to 30, 0 to 24, 18 to 18).map { Nokta(it.first.toDouble(), it.second.toDouble()) },
            DuvarCizim.girihNoktalari(),
        )

        val yi = c.getJSONObject("sus").getJSONObject("yildiz")
        esit(yi.getDouble("birim"), DuvarCizim.YILDIZ_BIRIM, "yildiz.birim")
        esit(yi.getDouble("yariKenar"), DuvarCizim.YILDIZ_YARI_KENAR, "yildiz.yariKenar")
        esit(yi.getDouble("kosegen"), DuvarCizim.YILDIZ_KOSEGEN, "yildiz.kosegen")
        esit(yi.getDouble("daireR"), DuvarCizim.YILDIZ_DAIRE_R, "yildiz.daireR")
        esit(yi.getDouble("kalinlik"), DuvarCizim.YILDIZ_KALINLIK, "yildiz.kalinlik")
        esit(yi.getDouble("opaklik"), DuvarCizim.YILDIZ_OPAKLIK, "yildiz.opaklik")
        esit(yi.getDouble("kucukKalinlik"), DuvarCizim.KUCUK_YILDIZ_KALINLIK, "yildiz.kucukKalinlik")
        val konum = yi.getJSONObject("konum")
        fun nokta(ad: String) = konum.getJSONArray(ad).let { Nokta(it.getDouble(0), it.getDouble(1)) }
        assertEquals(nokta("gece"), DuvarCizim.yildizKonumu(DuvarZemini.GECE))
        assertEquals(nokta("kagit"), DuvarCizim.yildizKonumu(DuvarZemini.KAGIT))
        assertEquals(nokta("palet"), DuvarCizim.yildizKonumu(DuvarZemini.PALET))
        assertEquals(nokta("diger"), DuvarCizim.yildizKonumu(null))

        val p = c.getJSONObject("perde")
        esit(p.getDouble("pay"), DuvarCizim.PERDE_PAY, "perde.pay")
        esit(p.getDouble("yaricap"), DuvarCizim.PERDE_YARICAP, "perde.yaricap")
        val yp = c.getJSONObject("yanPay")
        esit(yp.getDouble("mihrap"), DuvarCizim.yaziYanPayi(SusTuru.MIHRAP), "yanPay.mihrap")
        for (t in listOf(SusTuru.YILDIZ, SusTuru.GIRIH, SusTuru.YOK)) esit(yp.getDouble("diger"), DuvarCizim.yaziYanPayi(t), "yanPay.$t")
    }

    @Test
    fun susCarpaniVeBesKoseliYildizOrnekle() {
        val dizi = cizim.getJSONArray("susCarpani")
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            esit(o.getDouble("beklenen"), DuvarCizim.susCarpani(o.getDouble("belirginlik")), "susCarpani ${o.getDouble("belirginlik")}")
        }
        val b = cizim.getJSONObject("besKoseliYildiz")
        val noktalar = DuvarCizim.besKoseliYildiz(b.getDouble("cx"), b.getDouble("cy"), b.getDouble("dis"), b.getDouble("ic"))
        val beklenen = b.getJSONArray("beklenen")
        assertEquals(beklenen.length(), noktalar.size)
        // JS iki ondalığa yuvarlar (SVG noktası).
        for (i in noktalar.indices) {
            assertEquals("x$i", beklenen.getJSONArray(i).getDouble(0), noktalar[i].x, 0.006)
            assertEquals("y$i", beklenen.getJSONArray(i).getDouble(1), noktalar[i].y, 0.006)
        }
    }

    @Test
    fun zeminRenkleriOrnekleAyni() {
        val dizi = cizim.getJSONArray("renkler")
        fun rgb(v: String) = requireNotNull(GununAyetiKurallari.renkCoz(v)) and 0xFFFFFF
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val e = o.getJSONObject("beklenen")
            val zemin = DuvarZemini.coz(o.getString("zemin"))
            val ad = o.toString()
            if (zemin.duzMu) {
                val r = DuvarKagidiKurallari.renkler(DuvarAyari(zemin = zemin, paletRenk = requireNotNull(GununAyetiKurallari.renkCoz(o.getString("paletRenk")))))
                assertEquals(ad, rgb(e.getString("zemin")), r.zemin and 0xFFFFFF)
                assertEquals(ad, rgb(e.getString("metin")), r.metin and 0xFFFFFF)
                assertEquals(ad, rgb(e.getString("kunye")), r.kunye and 0xFFFFFF)
                assertEquals(ad, rgb(e.getString("atif")), r.atif and 0xFFFFFF)
                assertEquals(ad, rgb(e.getString("sus")), r.sus and 0xFFFFFF)
                assertEquals(ad, 1.0, e.getDouble("kunyeOpaklik"), 0.0)
                assertEquals(ad, 1.0, e.getDouble("atifOpaklik"), 0.0)
                assertEquals(ad, e.getDouble("susOpaklik"), r.susOpakligi.toDouble(), 1e-6)
            } else {
                // Gök: yazı sahnenin rengi, künye/atıf/süs aynı rengin sabit opaklıkları.
                val sahne = sahneler.getValue(requireNotNull(zemin.gok))
                assertTrue(ad, e.isNull("zemin"))
                assertEquals(ad, rgb(e.getString("metin")), sahne.metin and 0xFFFFFF)
                assertEquals(ad, e.getDouble("kunyeOpaklik"), DuvarKagidiKurallari.KUNYE_OPAKLIGI.toDouble(), 1e-6)
                assertEquals(ad, e.getDouble("atifOpaklik"), DuvarKagidiKurallari.ATIF_OPAKLIGI.toDouble(), 1e-6)
                assertEquals(ad, e.getDouble("susOpaklik"), DuvarKagidiKurallari.GOK_SUS_OPAKLIGI.toDouble(), 1e-6)
            }
        }
    }

    @Test
    fun fotoKirpmasiOrnekle() {
        val dizi = cizim.getJSONArray("foto")
        assertTrue(dizi.length() >= 4)
        for (i in 0 until dizi.length()) {
            val o = dizi.getJSONObject(i)
            val ekran = o.getJSONArray("ekran")
            val gorsel = o.getJSONArray("gorsel")
            val f = o.getJSONObject("foto")
            val e = o.getJSONObject("beklenen")
            val k = DuvarCizim.fotoKirpmasi(
                gorsel.getDouble(0), gorsel.getDouble(1), ekran.getDouble(0), ekran.getDouble(1),
                f.getDouble("x"), f.getDouble("y"), f.getDouble("yakinlik"),
            )
            // JS ekrandaki görsel yerini verir; görsel pikseli → ekran: ölçek = görselin ekrandaki genişliği / görsel genişliği.
            val olcek = e.getDouble("genislik") / gorsel.getDouble(0)
            val ad = o.toString()
            assertEquals(ad, e.getDouble("sol"), -k.x * olcek, 1e-6)
            assertEquals(ad, e.getDouble("ust"), -k.y * olcek, 1e-6)
            assertEquals(ad, ekran.getDouble(0), k.genislik * olcek, 1e-6)
            assertEquals(ad, ekran.getDouble(1), k.yukseklik * olcek, 1e-6)
            assertEquals(ad, e.getDouble("yukseklik"), gorsel.getDouble(1) * olcek, 1e-6)
        }
    }

    // --- Zarif yazı tipi ----------------------------------------------------------------------

    @Test
    fun zarifAmiriYalnizKapsadigiYazilarda() {
        assertTrue(DuvarTasarimi.zarifAmiriMi("Gerçekten güçlükle beraber bir kolaylık vardır."))
        assertTrue(DuvarTasarimi.zarifAmiriMi("Indeed, with hardship [will be] ease — “Allāh”…"))
        assertTrue(DuvarTasarimi.zarifAmiriMi("Wahrlich, mit der Erschwernis ist Erleichterung. Ça ira, señor."))
        assertTrue(DuvarTasarimi.zarifAmiriMi("پس یقیناً با هر سختی آسانی است"))
        // Kiril, Yunan, Vietnamca yığılmış işaretler, Hausa kancalı harfler Amiri'de yok → klasik kurala iner.
        assertFalse(DuvarTasarimi.zarifAmiriMi("Воістину, після труднощів настає полегшення!"))
        assertFalse(DuvarTasarimi.zarifAmiriMi("Πράγματι, μαζί με κάθε δυσκολία έρχεται ανακούφιση."))
        assertFalse(DuvarTasarimi.zarifAmiriMi("Hỡi những người có đức tin"))
        assertFalse(DuvarTasarimi.zarifAmiriMi("Yã ku waɗanda suka yi ĩmãni"))
        assertFalse(DuvarTasarimi.zarifAmiriMi("归信的人们啊"))
    }
}
