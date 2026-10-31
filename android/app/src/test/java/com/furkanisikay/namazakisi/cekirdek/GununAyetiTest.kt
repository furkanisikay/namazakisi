package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Günün ayeti saf kararları. Fikstür `gunun-ayeti-ornek.json` yük şeması v1'dir
 * (`docs/ajan/gunun-ayeti.md`); JS üreticisi (`gununAyetiPlani`) aynı alanları yazar.
 */
class GununAyetiTest {

    private val ham: String =
        requireNotNull(javaClass.classLoader?.getResource("gunun-ayeti-ornek.json")) { "ornek dosya yok" }.readText()
    private val yuk: GununAyetiYuku = requireNotNull(GununAyetiKurallari.coz(ham))

    // --- Meal yazı tipi ------------------------------------------------------------------

    @Test
    fun geezMealSistemYazitipineDuser() {
        // Noto Serif'te Ge'ez yok (Amharca, amharic_sadiq 2:153).
        assertFalse(GununAyetiKurallari.mealSerifMi("እናንተ ያመናችሁ ሆይ! በመታገስና በሶላት ተረዱ፡፡"))
        // Latin genişletilmiş harfler ve birleşik ton işaretleri Noto Serif'te var.
        assertTrue(GununAyetiKurallari.mealSerifMi("Gerçekten güçlükle beraber bir kolaylık vardır."))
        assertTrue(GununAyetiKurallari.mealSerifMi("Yã ku waɗanda suka yi ĩmãni! Ku ci ku sha daga mãsu dãɗin abin da Muka azurta ku."))
        assertTrue(GununAyetiKurallari.mealSerifMi("Heey mon gomɗimɓe (goongɗinɓe), wallitoree muññaare (muñal) e juulde."))
        assertTrue(GununAyetiKurallari.mealSerifMi("Ẹ̀yin tí ẹ gbàgbọ́ ní òdodo, ẹ fi sùúrù àti ìrun kíkí tọrọ oore (lọ́dọ̀ Allāhu)."))
    }

    @Test
    fun asyaYazilariSistemYazitipineDuserVietnamcaSerifKalir() {
        // 2:153 — chinese_suliman, tamil_omar, malayalam_kunhi, thai_rwwad, korean_rwwad (Noto Serif'te yok).
        assertFalse(GununAyetiKurallari.mealSerifMi("归信的人们啊！你们当借坚忍和拜功，而求佑助。"))
        assertFalse(GununAyetiKurallari.mealSerifMi("நம்பிக்கையாளர்களே! பொறுமை இன்னும் தொழுகையின் மூலம் உதவி கோருங்கள்."))
        assertFalse(GununAyetiKurallari.mealSerifMi("സത്യവിശ്വാസികളെ, നിങ്ങള്‍ സഹനവും നമസ്കാരവും മുഖേന സഹായം തേടുക."))
        assertFalse(GununAyetiKurallari.mealSerifMi("โอ้บรรดาผู้ศรัทธาทั้งหลาย จงขอการช่วยเหลือด้วยความอดทนและการละหมาด"))
        assertFalse(GununAyetiKurallari.mealSerifMi("믿는 자들이여! 인내심과 예배로써 (하나님께) 도움을 요청하라."))
        // Yalnız CJK noktalaması bile serifsiz sayılır (Latin noktalamayla karışmasın).
        assertFalse(GununAyetiKurallari.mealSerifMi("Allah，"))
        // vietnamese_rwwad: Latin + yığılmış ses işaretleri (U+1EA0–1EF9) Noto Serif'te var.
        assertTrue(GununAyetiKurallari.mealSerifMi("Hỡi những người có đức tin, các ngươi hãy cầu xin sự giúp đỡ (của Allah) bằng lòng kiên nhẫn và lễ nguyện Salah."))
    }

    // --- Yük çözümü -------------------------------------------------------------------

    @Test
    fun yukSozlesmesiCozulur() {
        assertEquals(1, yuk.surum)
        assertEquals("tr", yuk.dil)
        assertEquals("GÜNÜN AYETİ", yuk.metin.etiket)
        assertEquals("Açın", yuk.metin.acin)
        assertEquals("Arapça: Tanzil", yuk.metin.arapcaKaynagi)
        // Başlangıcı olmayan kayıt atlanır, kalanlar başlangıca göre sıralanır.
        assertEquals(listOf("2026-10-24", "2026-10-25", "2026-10-26"), yuk.plan.map { it.gun })
        val ilk = yuk.plan.first()
        assertEquals("94:6", ilk.ref)
        assertEquals("İnşirâh 94:6", ilk.kisaKunye)
        assertEquals("Gerçekten güçlükle beraber bir kolaylık vardır.", ilk.meal)
        assertEquals("Rowwad Translation Center, QuranEnc 1.0.4", ilk.mealKaynagi)
        assertEquals(1_792_826_580_000L, ilk.baslangicMs)
    }

    @Test
    fun jsonNullMealNullOlur() {
        val k = yuk.plan.last()
        assertNull(k.meal)
        assertNull(k.mealKaynagi)
        assertEquals("Nahl 16:128", k.kisaKunye)
    }

    @Test
    fun duvarAyariCozulur() {
        val d = yuk.duvar
        assertTrue(d.acik)
        assertEquals(DuvarYeri.IKISI, d.yer)
        assertEquals(DuvarZemini.PALET, d.zemin)
        assertFalse(d.arapca)
        assertEquals(0xFF2E7D32.toInt(), d.paletRenk)
        // İkisi: önce ana ekran, sonra kilit — son yazılan kilit görseli kendi görseli olarak kalır.
        assertEquals(listOf(DuvarEkrani.ANA, DuvarEkrani.KILIT), d.ekranlar())
    }

    @Test
    fun bozukYukNullDoner() {
        assertNull(GununAyetiKurallari.coz(null))
        assertNull(GununAyetiKurallari.coz(""))
        assertNull(GununAyetiKurallari.coz("{bozuk"))
        assertNull(GununAyetiKurallari.coz("""{"v":0,"metin":{},"plan":[]}"""))
        // Geçerli kayıt kalmazsa null.
        assertNull(GununAyetiKurallari.coz("""{"v":1,"metin":{},"plan":[{"gun":"x"}]}"""))
    }

    @Test
    fun eksikDuvarVeTanimsizKodlarVarsayilana() {
        val o = JSONObject(ham)
        o.remove("duvar")
        assertEquals(DuvarAyari(), GununAyetiKurallari.coz(o.toString())?.duvar)
        val d = JSONObject().put("acik", true).put("yer", "tavan").put("zemin", "mor").put("paletRenk", "yesil")
        o.put("duvar", d)
        val c = requireNotNull(GununAyetiKurallari.coz(o.toString())).duvar
        assertEquals(DuvarYeri.KILIT, c.yer)
        assertEquals(DuvarZemini.GECE, c.zemin)
        assertEquals(DuvarAyari.VARSAYILAN_PALET, c.paletRenk)
    }

    @Test
    fun ileriSurumOkunur() {
        val o = JSONObject(ham).put("v", 2).put("yeniAlan", "x")
        assertNotNull(GununAyetiKurallari.coz(o.toString()))
    }

    @Test
    fun renkCozulur() {
        assertEquals(0xFF2E7D32.toInt(), GununAyetiKurallari.renkCoz("#2E7D32"))
        assertEquals(0x802E7D32.toInt(), GununAyetiKurallari.renkCoz("#802E7D32"))
        assertNull(GununAyetiKurallari.renkCoz("#12345"))
        assertNull(GununAyetiKurallari.renkCoz(null))
    }

    // --- Gün seçimi ve sınır ------------------------------------------------------------

    @Test
    fun fiksturDurumlari() {
        val durumlar = JSONObject(ham).getJSONArray("durumlar")
        assertTrue(durumlar.length() >= 5)
        for (i in 0 until durumlar.length()) {
            val o = durumlar.getJSONObject(i)
            val ad = o.getString("ad")
            val simdi = o.getLong("simdiMs")
            assertEquals(ad, o.getString("gun"), GununAyetiKurallari.gecerliKayit(yuk.plan, simdi)?.gun)
            val beklenen = if (o.isNull("sonrakiSinirMs")) null else o.getLong("sonrakiSinirMs")
            assertEquals(ad, beklenen, GununAyetiKurallari.sonrakiSinirMs(yuk.plan, simdi))
        }
    }

    @Test
    fun bosPlan() {
        assertNull(GununAyetiKurallari.gecerliKayit(emptyList(), 0L))
        assertNull(GununAyetiKurallari.sonrakiSinirMs(emptyList(), 0L))
    }

    // --- Metin satırları ---------------------------------------------------------------

    @Test
    fun widgetKunyesi() {
        val k = yuk.plan.first()
        assertEquals(
            "İnşirâh 94:6 · Rowwad Translation Center, QuranEnc 1.0.4",
            GununAyetiKurallari.widgetKunyesi(k, yuk.metin, mealGorunuyor = true, arapcaGorunuyor = false),
        )
        assertEquals(
            "İnşirâh 94:6 · Rowwad Translation Center, QuranEnc 1.0.4 · Arapça: Tanzil",
            GununAyetiKurallari.widgetKunyesi(k, yuk.metin, mealGorunuyor = true, arapcaGorunuyor = true),
        )
        assertEquals(
            "İnşirâh 94:6 · Arapça: Tanzil",
            GununAyetiKurallari.widgetKunyesi(k, yuk.metin, mealGorunuyor = false, arapcaGorunuyor = true),
        )
    }

    @Test
    fun atifHerGorseldeVar() {
        val k = yuk.plan.first()
        assertEquals("Rowwad Translation Center, QuranEnc 1.0.4", GununAyetiKurallari.atifSatiri(k, yuk.metin, false))
        assertEquals(
            "Rowwad Translation Center, QuranEnc 1.0.4 · Arapça: Tanzil",
            GununAyetiKurallari.atifSatiri(k, yuk.metin, true),
        )
        // Meal yoksa Arapça tek içeriktir: kaynağı ayardan bağımsız yazılır.
        val mealsiz = yuk.plan.last()
        assertEquals("Arapça: Tanzil", GununAyetiKurallari.atifSatiri(mealsiz, yuk.metin, false))
        assertTrue(GununAyetiKurallari.duvardaArapca(mealsiz, DuvarAyari(arapca = false)))
        assertFalse(GununAyetiKurallari.duvardaArapca(k, DuvarAyari(arapca = false)))
    }

    @Test
    fun kisaKunyeOlduguGibiKalir() {
        // toUpperCase YOK: "İnşirâh" Türkçe dışı yerel ayarda "INŞIRÂH" olurdu.
        val k = yuk.plan.first()
        assertTrue(GununAyetiKurallari.erisimMetni(k, yuk.metin).contains("İnşirâh 94:6"))
        assertEquals(
            "GÜNÜN AYETİ. Gerçekten güçlükle beraber bir kolaylık vardır. İnşirâh 94:6 · Rowwad Translation Center, QuranEnc 1.0.4",
            GununAyetiKurallari.erisimMetni(k, yuk.metin),
        )
    }

    @Test
    fun duvarImzasiYalnizIcerikVeAyarlaDegisir() {
        val k = yuk.plan.first()
        val a = GununAyetiKurallari.duvarImzasi(k, yuk.metin, yuk.duvar)
        assertEquals(a, GununAyetiKurallari.duvarImzasi(k.copy(baslangicMs = 1L), yuk.metin, yuk.duvar))
        assertEquals(a, GununAyetiKurallari.duvarImzasi(k, yuk.metin, yuk.duvar.copy(acik = false)))
        assertNotEquals(a, GununAyetiKurallari.duvarImzasi(yuk.plan[1], yuk.metin, yuk.duvar))
        assertNotEquals(a, GununAyetiKurallari.duvarImzasi(k, yuk.metin, yuk.duvar.copy(zemin = DuvarZemini.GECE)))
        assertNotEquals(a, GununAyetiKurallari.duvarImzasi(k, yuk.metin, yuk.duvar.copy(arapca = true)))
        assertNotEquals(a, GununAyetiKurallari.duvarImzasi(k, yuk.metin.copy(arapcaKaynagi = "Arabic: Tanzil"), yuk.duvar))
    }

    // --- Widget düzeni -----------------------------------------------------------------

    @Test
    fun boyutSiniflari() {
        assertEquals(AyetBoyutu.SERIT, AyetDuzenSecici.boyut(300f, 70f))
        assertEquals(AyetBoyutu.KARE, AyetDuzenSecici.boyut(170f, 170f))
        assertEquals(AyetBoyutu.ORTA, AyetDuzenSecici.boyut(320f, 200f))
        assertEquals(AyetBoyutu.BUYUK, AyetDuzenSecici.boyut(320f, 300f))
        // Dar ve uzun: kare düzeni (genişlik belirleyici).
        assertEquals(AyetBoyutu.KARE, AyetDuzenSecici.boyut(150f, 400f))
    }

    private fun olcum(gereken: Int, ar: Int = 0, meal: Int = 0, kullanilabilir: Int = 500) =
        AyetOlcumu(gereken, kullanilabilir, ar, meal)

    @Test
    fun ortaArapcaIkiSatiriAsarsaYalnizMeal() {
        val adaylar = AyetDuzenSecici.adaylar(AyetBoyutu.ORTA, AyetIcerigi.MEAL, mealVar = true)
        val sigan = AyetDuzenSecici.sec(adaylar) { a ->
            if (a.duzen == AyetDuzeni.ARAPCA_MEAL) olcum(300, ar = 3, meal = 2) else olcum(200, meal = 2)
        }
        assertEquals(AyetDuzeni.MEAL, sigan.duzen)
        val arapcali = AyetDuzenSecici.sec(adaylar) { olcum(300, ar = 2, meal = 2) }
        assertEquals(AyetDuzeni.ARAPCA_MEAL, arapcali.duzen)
    }

    @Test
    fun sigmayanDuzenDokununKartinaIner() {
        val adaylar = AyetDuzenSecici.adaylar(AyetBoyutu.KARE, AyetIcerigi.MEAL, mealVar = true)
        assertEquals(listOf(AyetDuzeni.MEAL), adaylar.map { it.duzen })
        val secim = AyetDuzenSecici.sec(adaylar) { olcum(600, meal = 8) }
        assertEquals(AyetDuzeni.DOKUNUN, secim.duzen)
    }

    @Test
    fun seritIkiSatirMealArapcaYok() {
        val adaylar = AyetDuzenSecici.adaylar(AyetBoyutu.SERIT, AyetIcerigi.HAT, mealVar = true)
        assertEquals(listOf(AyetDuzeni.MEAL), adaylar.map { it.duzen })
        assertEquals(AyetDuzeni.MEAL, AyetDuzenSecici.sec(adaylar) { olcum(100, meal = 2) }.duzen)
        // Yükseklik yetse de üçüncü satır "dokunun" kartına indirir.
        assertEquals(AyetDuzeni.DOKUNUN, AyetDuzenSecici.sec(adaylar) { olcum(100, meal = 3) }.duzen)
    }

    @Test
    fun hatSigmazsaKisaltmaYerineDokunun() {
        val adaylar = AyetDuzenSecici.adaylar(AyetBoyutu.KARE, AyetIcerigi.HAT, mealVar = true)
        assertEquals(listOf(AyetDuzeni.HAT), adaylar.map { it.duzen })
        assertEquals(AyetDuzeni.DOKUNUN, AyetDuzenSecici.sec(adaylar) { olcum(100, ar = 4) }.duzen)
        assertEquals(AyetDuzeni.HAT, AyetDuzenSecici.sec(adaylar) { olcum(100, ar = 3) }.duzen)
    }

    @Test
    fun buyukOnceBuyukYaziSonraKucukYazi() {
        val adaylar = AyetDuzenSecici.adaylar(AyetBoyutu.BUYUK, AyetIcerigi.MEAL, mealVar = true)
        assertEquals(
            listOf(AyetDuzeni.ARAPCA_MEAL, AyetDuzeni.MEAL, AyetDuzeni.ARAPCA_MEAL, AyetDuzeni.MEAL),
            adaylar.map { it.duzen },
        )
        assertEquals(listOf(true, true, false, false), adaylar.map { it.buyukYazi })
        // Büyük yazılar sığmaz, küçük Arapçalı sığar.
        val secim = AyetDuzenSecici.sec(adaylar) { a -> if (a.buyukYazi) olcum(900) else olcum(400, ar = 2, meal = 4) }
        assertEquals(AyetAdayi(AyetDuzeni.ARAPCA_MEAL, enFazlaArapcaSatir = 2), secim)
    }

    @Test
    fun mealYoksaHerBoyuttaYalnizArapca() {
        for (b in AyetBoyutu.values()) {
            val adaylar = AyetDuzenSecici.adaylar(b, AyetIcerigi.MEAL, mealVar = false)
            assertTrue(b.name, adaylar.isNotEmpty())
            assertTrue(b.name, adaylar.all { it.duzen == AyetDuzeni.HAT })
        }
        val serit = AyetDuzenSecici.adaylar(AyetBoyutu.SERIT, AyetIcerigi.MEAL, mealVar = false)
        assertEquals(1, serit.single().enFazlaArapcaSatir)
    }

    @Test
    fun olcumTembelSiganBulununcaDurur() {
        val adaylar = AyetDuzenSecici.adaylar(AyetBoyutu.BUYUK, AyetIcerigi.MEAL, mealVar = true)
        var sayac = 0
        AyetDuzenSecici.sec(adaylar) { sayac++; olcum(100, ar = 1, meal = 1) }
        assertEquals(1, sayac)
    }

    // --- Duvar kâğıdı yerleşimi ve renk ------------------------------------------------

    @Test
    fun kilitBandiSaatVeParmakIziDisinda() {
        val (ust, alt) = DuvarKagidiKurallari.bant(DuvarEkrani.KILIT)
        // Büyük kilit saati ~%28–%62, kilit simgesi ~%84'ten başlar.
        assertTrue(ust >= 0.64f)
        assertTrue(alt <= 0.83f)
        val (anaUst, anaAlt) = DuvarKagidiKurallari.bant(DuvarEkrani.ANA)
        assertTrue(anaUst < anaAlt && anaAlt <= ust)
        assertTrue(DuvarKagidiKurallari.yaziOlcegi(DuvarEkrani.ANA) < 1f)
    }

    @Test
    fun zeminRenkleriOkunur() {
        for (zemin in DuvarZemini.values()) {
            val paletler = listOf(0xFF2E7D32, 0xFFFFF59D, 0xFF0D47A1, 0xFFFFFFFF, 0xFF777777, 0xFF808080).map { it.toInt() }
            for (palet in paletler) {
                val r = DuvarKagidiKurallari.renkler(DuvarAyari(zemin = zemin, paletRenk = palet))
                val ad = "$zemin ${Integer.toHexString(palet)}"
                // Gece/kâğıt AAA; palet en az AA (yazı büyük: meal tasarımda 24 px).
                val esik = if (zemin == DuvarZemini.PALET) 4.5 else 7.0
                assertTrue(ad, DuvarKagidiKurallari.kontrastOrani(r.metin, r.zemin) >= esik)
                assertTrue(ad, DuvarKagidiKurallari.kontrastOrani(r.kunye, r.zemin) >= 4.5)
                assertTrue(ad, DuvarKagidiKurallari.kontrastOrani(r.atif, r.zemin) >= 4.5)
            }
        }
    }

    @Test
    fun uygulamaYesiliPaletteDegismez() {
        assertEquals(0xFF2E7D32.toInt(), DuvarKagidiKurallari.okunurPaletZemini(0xFF2E7D32.toInt()))
        assertTrue(DuvarKagidiKurallari.acikMetinSecilsinMi(0xFF2E7D32.toInt()))
        assertFalse(DuvarKagidiKurallari.acikMetinSecilsinMi(0xFFFFF59D.toInt()))
    }

    @Test
    fun paletAcikTonuKoyuMetinleOkunur() {
        val paletler = listOf(0xFF2E7D32, 0xFF0D47A1, 0xFFB71C1C, 0xFF000000, 0xFFFFEB3B, 0xFFFFFFFF).map { it.toInt() }
        for (palet in paletler) {
            val ad = Integer.toHexString(palet)
            val ton = DuvarKagidiKurallari.acikTon(palet)
            assertTrue(ad, DuvarKagidiKurallari.kontrastOrani(0xFF1B2B22.toInt(), ton) >= 7.0)
            val w = DuvarKagidiKurallari.widgetPaleti(palet)
            assertEquals(ad, ton, w.zemin)
            assertTrue(ad, DuvarKagidiKurallari.kontrastOrani(w.ikincil, w.zemin) >= 4.5)
            assertTrue(ad, DuvarKagidiKurallari.kontrastOrani(w.vurgu, w.zemin) >= 4.5)
        }
    }

    @Test
    fun karistirmaUclari() {
        assertEquals(0xFF000000.toInt(), DuvarKagidiKurallari.karistir(0xFF000000.toInt(), 0xFFFFFFFF.toInt(), 0f))
        assertEquals(0xFFFFFFFF.toInt(), DuvarKagidiKurallari.karistir(0xFF000000.toInt(), 0xFFFFFFFF.toInt(), 1f))
        assertEquals(21.0, DuvarKagidiKurallari.kontrastOrani(0xFF000000.toInt(), 0xFFFFFFFF.toInt()), 0.01)
    }

    @Test
    fun widgetZeminiPaletKodlanir() {
        val a = WidgetAyari(zemin = WidgetZemini.PALET, opaklik = 80)
        assertEquals(a, WidgetAyari.coz(a.kodla()))
        assertEquals(WidgetZemini.PALET, WidgetZemini.coz("palet"))
        assertEquals(AyetIcerigi.HAT, AyetIcerigi.coz("hat"))
        assertEquals(AyetIcerigi.MEAL, AyetIcerigi.coz(null))
    }
}
