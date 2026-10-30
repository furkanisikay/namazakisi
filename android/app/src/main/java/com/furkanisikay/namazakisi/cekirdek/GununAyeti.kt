package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject

/**
 * Günün ayeti (#380 widget, #381 duvar kâğıdı) — SAF kararlar (JVM testi: GununAyetiTest,
 * fikstür `src/test/resources/gunun-ayeti-ornek.json`).
 *
 * TEK BEYİN JS'tedir (`src/core/icerik/gununAyeti.ts`): ayeti o seçer, namaz vaktini o hesaplar,
 * metinleri etkin dilde o çözer ve 14 günlük planı yazar (yük şeması v1, `docs/ajan/gunun-ayeti.md`).
 * Native yalnız `baslangicMs <= şimdi` olan SON kaydı çizer; plan biterse son kayıtta kalır.
 * Burada Android yok: ölçüm (StaticLayout) Android katmanında yapılır, sonuçları buraya sayı
 * olarak verilir.
 */

/** Yükün yerelleşmiş sabit metinleri (JS etkin dilde yazar; native çeviri taşımaz). */
data class AyetMetinleri(
    val etiket: String,
    val sigmiyor: String,
    val acin: String,
    val arapcaKaynagi: String,
)

/** Planın bir günü. [meal] null olabilir (meali olmayan dil): o zaman yalnız Arapça çizilir. */
data class AyetKaydi(
    val gun: String,
    val baslangicMs: Long,
    val ref: String,
    val ar: String,
    val meal: String?,
    val kisaKunye: String,
    val mealKaynagi: String?,
)

enum class DuvarYeri(val kod: String) {
    KILIT("kilit"), ANA("ana"), IKISI("ikisi");

    companion object {
        fun coz(kod: String?): DuvarYeri = values().firstOrNull { it.kod == kod } ?: KILIT
    }
}

enum class DuvarZemini(val kod: String) {
    GECE("gece"), KAGIT("kagit"), PALET("palet");

    companion object {
        fun coz(kod: String?): DuvarZemini = values().firstOrNull { it.kod == kod } ?: GECE
    }
}

/** Duvar kâğıdının hangi ekran için çizildiği (yer `ikisi` ise iki ayrı görsel çizilir). */
enum class DuvarEkrani { KILIT, ANA }

data class DuvarAyari(
    val acik: Boolean = false,
    val yer: DuvarYeri = DuvarYeri.KILIT,
    val zemin: DuvarZemini = DuvarZemini.GECE,
    val arapca: Boolean = false,
    /** ARGB. */
    val paletRenk: Int = VARSAYILAN_PALET,
) {
    /** Bu ayarla çizilecek görseller (sıra: önce ana ekran, kilit EN SON — bkz. `DuvarKagidiUygulayici`). */
    fun ekranlar(): List<DuvarEkrani> = when (yer) {
        DuvarYeri.KILIT -> listOf(DuvarEkrani.KILIT)
        DuvarYeri.ANA -> listOf(DuvarEkrani.ANA)
        DuvarYeri.IKISI -> listOf(DuvarEkrani.ANA, DuvarEkrani.KILIT)
    }

    companion object {
        /** `#2E7D32` — uygulamanın ana yeşili (JS yazmazsa). */
        const val VARSAYILAN_PALET: Int = 0xFF2E7D32.toInt()
    }
}

data class GununAyetiYuku(
    val surum: Int,
    val dil: String,
    val metin: AyetMetinleri,
    /** `baslangicMs`'e göre artan sırada. */
    val plan: List<AyetKaydi>,
    val duvar: DuvarAyari,
)

object GununAyetiKurallari {
    /** Okunabilen en yüksek şema sürümü. Daha yüksek sürüm de okunur (alanlar yalnız EKLENİR). */
    const val SURUM = 1

    /**
     * Meal Noto Serif'le mi çizilir? Ge'ez (Etiyopya) yazısı Noto Serif'te YOK → Amharca meal
     * sistem yazı tipiyle çizilir (serif Latin noktalama + sistemden düşen Ge'ez harfi karışmasın).
     * Hausa/Fula kancalı harfleri (ɓ ɗ ƙ ƴ) ve Yoruba ton işaretleri Noto Serif'te var (cmap denetlendi).
     * Swift ikizi `GununAyetiKarari.mealSerifMi`. Cihazda DOĞRULANMADI.
     */
    fun mealSerifMi(meal: String): Boolean = meal.none { it.code in 0x1200..0x139F || it.code in 0x2D80..0x2DDF || it.code in 0xAB00..0xAB2F }

    /**
     * Yükü çözer. Bozuk/eksik yük `null` (widget "uygulamayı açın" der, çökmez). Zorunlu alanı
     * eksik plan kaydı atlanır; hiç geçerli kayıt kalmazsa `null`.
     */
    fun coz(ham: String?): GununAyetiYuku? {
        if (ham.isNullOrBlank()) return null
        return try {
            val o = JSONObject(ham)
            val surum = o.optInt("v", 0)
            if (surum < 1) return null
            val m = o.optJSONObject("metin") ?: return null
            val metin = AyetMetinleri(
                etiket = m.optString("etiket"),
                sigmiyor = m.optString("sigmiyor"),
                acin = m.optString("acin"),
                arapcaKaynagi = m.optString("arapcaKaynagi"),
            )
            val dizi = o.optJSONArray("plan") ?: return null
            val plan = (0 until dizi.length()).mapNotNull { i -> dizi.optJSONObject(i)?.let(::kaydiCoz) }
                .sortedBy { it.baslangicMs }
            if (plan.isEmpty()) return null
            val d = o.optJSONObject("duvar")
            val duvar = if (d == null) DuvarAyari() else DuvarAyari(
                acik = d.optBoolean("acik", false),
                yer = DuvarYeri.coz(d.optString("yer")),
                zemin = DuvarZemini.coz(d.optString("zemin")),
                arapca = d.optBoolean("arapca", false),
                paletRenk = renkCoz(d.optString("paletRenk")) ?: DuvarAyari.VARSAYILAN_PALET,
            )
            GununAyetiYuku(surum, MetinDili.coz(o.optString("dil")), metin, plan, duvar)
        } catch (_: Exception) {
            null
        }
    }

    private fun kaydiCoz(o: JSONObject): AyetKaydi? {
        if (!o.has("baslangicMs")) return null
        val ar = metinVeyaNull(o, "ar") ?: return null
        val ref = metinVeyaNull(o, "ref") ?: return null
        return AyetKaydi(
            gun = o.optString("gun"),
            baslangicMs = o.getLong("baslangicMs"),
            ref = ref,
            ar = ar,
            meal = metinVeyaNull(o, "meal"),
            kisaKunye = metinVeyaNull(o, "kisaKunye") ?: ref,
            mealKaynagi = metinVeyaNull(o, "mealKaynagi"),
        )
    }

    /** JSON `null` ve boş dize → null (Android org.json `optString` null için "null" döndürür). */
    private fun metinVeyaNull(o: JSONObject, ad: String): String? =
        if (!o.has(ad) || o.isNull(ad)) null else o.optString(ad).trim().ifEmpty { null }

    /** `baslangicMs <= şimdi` olan SON kayıt; hiçbiri başlamadıysa ilk kayıt (saat geri alınmış olabilir). */
    fun gecerliKayit(plan: List<AyetKaydi>, simdiMs: Long): AyetKaydi? =
        plan.lastOrNull { it.baslangicMs <= simdiMs } ?: plan.firstOrNull()

    /** Bir sonraki gün sınırı (şimdiden SONRA başlayan ilk kayıt); plan bittiyse `null` (alarm yok). */
    fun sonrakiSinirMs(plan: List<AyetKaydi>, simdiMs: Long): Long? =
        plan.asSequence().map { it.baslangicMs }.filter { it > simdiMs }.minOrNull()

    /** "#RRGGBB" / "#AARRGGBB" → ARGB; tanınmazsa `null`. */
    fun renkCoz(metin: String?): Int? {
        val h = metin?.trim()?.removePrefix("#") ?: return null
        val deger = h.toLongOrNull(16) ?: return null
        return when (h.length) {
            6 -> (0xFF000000L or deger).toInt()
            8 -> deger.toInt()
            else -> null
        }
    }

    /**
     * Widget'ın tek satırlık künyesi: "İnşirâh 94:6 · Rowwad Translation Center, QuranEnc 1.0.4"
     * (+ " · Arapça: Tanzil" Arapça görünüyorsa). Satır sonda kesilebilir; tamamı erişilebilirlik
     * metnindedir ve uygulamadaki sayfadadır.
     */
    fun widgetKunyesi(k: AyetKaydi, metin: AyetMetinleri, mealGorunuyor: Boolean, arapcaGorunuyor: Boolean): String =
        listOfNotNull(
            k.kisaKunye,
            k.mealKaynagi?.takeIf { mealGorunuyor && k.meal != null },
            metin.arapcaKaynagi.takeIf { arapcaGorunuyor && it.isNotBlank() },
        ).joinToString(" · ")

    /**
     * Duvar kâğıdının ATIF satırı — her görselde ZORUNLU (QuranEnc şartı): meal kaynağı, Arapça
     * görünüyorsa " · <Arapça kaynağı>". Meal yoksa yalnız Arapça kaynağı.
     */
    fun atifSatiri(k: AyetKaydi, metin: AyetMetinleri, arapcaGorunuyor: Boolean): String =
        listOfNotNull(
            k.mealKaynagi?.takeIf { k.meal != null },
            metin.arapcaKaynagi.takeIf { (arapcaGorunuyor || k.meal == null) && it.isNotBlank() },
        ).joinToString(" · ")

    /** Ekran okuyucu metni: etiket, meal (yoksa Arapça), künye — tamamı, kesmesiz. */
    fun erisimMetni(k: AyetKaydi, metin: AyetMetinleri): String =
        listOfNotNull(
            metin.etiket.takeIf { it.isNotBlank() },
            k.meal ?: k.ar,
            widgetKunyesi(k, metin, mealGorunuyor = true, arapcaGorunuyor = k.meal == null),
        ).fold("") { birikim, parca ->
            when {
                birikim.isEmpty() -> parca
                // Meal zaten noktalamayla bitiyorsa ikinci nokta eklenmez ("vardır.. İnşirâh").
                birikim.last() in ".!?…" -> "$birikim $parca"
                else -> "$birikim. $parca"
            }
        }

    /** Duvar kâğıdında Arapça satır çizilsin mi? Meal yoksa Arapça tek içeriktir (ayardan bağımsız). */
    fun duvardaArapca(k: AyetKaydi, ayar: DuvarAyari): Boolean = ayar.arapca || k.meal == null

    /**
     * Duvar kâğıdı İMZASI: bu değişmedikçe görsel yeniden yazılmaz. Yük her açılışta, konum
     * değişiminde ve arka plan turunda yeniden yazılır; her yazımda `setBitmap` kilit ekranını
     * titretir ve Material You renklerini yeniden türetirdi.
     */
    fun duvarImzasi(k: AyetKaydi, metin: AyetMetinleri, ayar: DuvarAyari): String =
        listOf(
            k.gun, k.ref, k.ar, k.meal.orEmpty(), k.kisaKunye, k.mealKaynagi.orEmpty(), metin.arapcaKaynagi,
            ayar.yer.kod, ayar.zemin.kod, ayar.arapca.toString(), Integer.toHexString(ayar.paletRenk),
        ).joinToString("\u0001").hashCode().let { Integer.toHexString(it) }
}

// --- Widget düzeni ------------------------------------------------------------------------

/** Boyut sınıfı (dp'den): 4×1 şerit, 2×2 kare, 4×2 orta, 4×3 büyük. */
enum class AyetBoyutu { SERIT, KARE, ORTA, BUYUK }

/** Widget örneğinin kare boyuttaki içeriği (yapılandırma ekranı seçer). */
enum class AyetIcerigi(val kod: String) {
    MEAL("meal"), HAT("hat");

    companion object {
        fun coz(kod: String?): AyetIcerigi = values().firstOrNull { it.kod == kod } ?: MEAL
    }
}

enum class AyetDuzeni {
    /** Arapça satır (resim) + meal + künye. */
    ARAPCA_MEAL,
    /** Yalnız meal + künye. */
    MEAL,
    /** Yalnız Arapça (hat) + künye. */
    HAT,
    /** "Bugünün ayeti bu boyuta sığmıyor. Okumak için dokunun." kartı. */
    DOKUNUN,
}

/**
 * Denenecek bir düzen. Sığma ÖLÇÜMLE verilir: Android katmanı bu adayı gerçek yazı boyutuyla
 * (sistem yazı ölçeği dahil) `StaticLayout`'la ölçüp [AyetOlcumu] döndürür.
 */
data class AyetAdayi(
    val duzen: AyetDuzeni,
    /** 4×3'ün büyük yazısı ve tarih satırı. */
    val buyukYazi: Boolean = false,
    val enFazlaArapcaSatir: Int = 0,
    val enFazlaMealSatir: Int = Int.MAX_VALUE,
)

/** Bir adayın ölçümü (px). */
data class AyetOlcumu(
    val gerekenYukseklikPx: Int,
    val kullanilabilirYukseklikPx: Int,
    val arapcaSatir: Int = 0,
    val mealSatir: Int = 0,
)

object AyetDuzenSecici {
    /** Bu yükseklikten kısa widget şerittir (4×1). */
    const val SERIT_UST_YUKSEKLIK_DP = 100f
    /** Bu genişlikten dar widget karedir (2×2); eşik namaz widget'ının geniş eşiğiyle aynı. */
    const val ORTA_MIN_GENISLIK_DP = WidgetDuzenSecici.GENIS_MIN_GENISLIK_DP
    /** 4×3 (telefonda hücre ~110 dp yüksek → 4×2 ≈ 220, 4×3 ≈ 330). */
    const val BUYUK_MIN_YUKSEKLIK_DP = 260f

    fun boyut(genislikDp: Float, yukseklikDp: Float): AyetBoyutu = when {
        yukseklikDp < SERIT_UST_YUKSEKLIK_DP -> AyetBoyutu.SERIT
        genislikDp < ORTA_MIN_GENISLIK_DP -> AyetBoyutu.KARE
        yukseklikDp >= BUYUK_MIN_YUKSEKLIK_DP -> AyetBoyutu.BUYUK
        else -> AyetBoyutu.ORTA
    }

    /**
     * Sırayla denenecek düzenler; hiçbiri sığmazsa [AyetDuzeni.DOKUNUN]. Meal "…" ile KESİLMEZ.
     * - 4×2: Arapça (en çok iki satır) + meal → yalnız meal.
     * - 4×3: büyük yazı + tarih (Arapça ≤3 satır) → büyük yalnız meal → 4×2 yazısıyla aynı iki adım.
     * - 2×2: meal; "hat" seçiliyse yalnız Arapça (sığmazsa kısaltma yerine "dokunun").
     * - 4×1: iki satır meal, Arapça YOK.
     * - Meal yoksa (meali olmayan dil) her boyutta yalnız Arapça; şeritte tek satır sığarsa.
     */
    fun adaylar(boyut: AyetBoyutu, icerik: AyetIcerigi, mealVar: Boolean): List<AyetAdayi> {
        if (!mealVar) {
            return when (boyut) {
                AyetBoyutu.SERIT -> listOf(AyetAdayi(AyetDuzeni.HAT, enFazlaArapcaSatir = 1))
                AyetBoyutu.KARE -> listOf(AyetAdayi(AyetDuzeni.HAT, enFazlaArapcaSatir = 3))
                AyetBoyutu.ORTA -> listOf(AyetAdayi(AyetDuzeni.HAT, enFazlaArapcaSatir = 3))
                AyetBoyutu.BUYUK -> listOf(
                    AyetAdayi(AyetDuzeni.HAT, buyukYazi = true, enFazlaArapcaSatir = 4),
                    AyetAdayi(AyetDuzeni.HAT, enFazlaArapcaSatir = 4),
                )
            }
        }
        return when (boyut) {
            AyetBoyutu.SERIT -> listOf(AyetAdayi(AyetDuzeni.MEAL, enFazlaMealSatir = 2))
            AyetBoyutu.KARE -> if (icerik == AyetIcerigi.HAT) {
                listOf(AyetAdayi(AyetDuzeni.HAT, enFazlaArapcaSatir = 3))
            } else {
                listOf(AyetAdayi(AyetDuzeni.MEAL))
            }
            AyetBoyutu.ORTA -> listOf(
                AyetAdayi(AyetDuzeni.ARAPCA_MEAL, enFazlaArapcaSatir = 2),
                AyetAdayi(AyetDuzeni.MEAL),
            )
            AyetBoyutu.BUYUK -> listOf(
                AyetAdayi(AyetDuzeni.ARAPCA_MEAL, buyukYazi = true, enFazlaArapcaSatir = 3),
                AyetAdayi(AyetDuzeni.MEAL, buyukYazi = true),
                AyetAdayi(AyetDuzeni.ARAPCA_MEAL, enFazlaArapcaSatir = 2),
                AyetAdayi(AyetDuzeni.MEAL),
            )
        }
    }

    fun sigarMi(aday: AyetAdayi, o: AyetOlcumu): Boolean =
        o.gerekenYukseklikPx <= o.kullanilabilirYukseklikPx &&
            o.arapcaSatir <= aday.enFazlaArapcaSatir &&
            o.mealSatir <= aday.enFazlaMealSatir

    /** İlk sığan aday; hiçbiri sığmazsa "dokunun" kartı. Ölçüm tembeldir (sığan bulununca durur). */
    fun sec(adaylar: List<AyetAdayi>, olc: (AyetAdayi) -> AyetOlcumu): AyetAdayi =
        adaylar.firstOrNull { sigarMi(it, olc(it)) } ?: AyetAdayi(AyetDuzeni.DOKUNUN)
}

// --- Duvar kâğıdı yerleşimi ---------------------------------------------------------------

/** Duvar kâğıdı renkleri (ARGB). */
data class DuvarRenkleri(
    val zemin: Int,
    val metin: Int,
    val kunye: Int,
    val atif: Int,
    /** Arka plandaki silik süsleme (8 köşeli yıldız) rengi; opaklık ayrı. */
    val sus: Int,
    val susOpakligi: Float,
)

/** Ayet widget'ının palet zemini renkleri (ARGB, çalışma anında hesaplanır). */
data class WidgetPaletRenkleri(val zemin: Int, val metin: Int, val ikincil: Int, val vurgu: Int)

object DuvarKagidiKurallari {
    /** Tasarım tuvali 412 px genişlikte çizildi; ölçüler bu genişliğe göre ölçeklenir. */
    const val TASARIM_GENISLIGI = 412f

    /**
     * Metin bandı (ekran yüksekliğinin oranı). Kilit: %64–%82 — Android 14+ büyük kilit saati
     * (bildirim yokken) ekranın ~%28–%62'sini kaplar (emülatör karesi 66 ile ölçüldü), kilit
     * simgesi/parmak izi ~%84'ten başlar; metin ikisinin arasında kalır, sığmazsa küçülür.
     * Ana ekran: simgeler aşağıda olduğu için metin üstte ve küçük.
     */
    fun bant(ekran: DuvarEkrani): Pair<Float, Float> = when (ekran) {
        DuvarEkrani.KILIT -> 0.64f to 0.82f
        DuvarEkrani.ANA -> 0.09f to 0.34f
    }

    /** Ana ekranda yazı kilit ekranındakinin bu oranıdır. */
    fun yaziOlcegi(ekran: DuvarEkrani): Float = if (ekran == DuvarEkrani.ANA) 0.75f else 1f

    fun renkler(ayar: DuvarAyari): DuvarRenkleri = when (ayar.zemin) {
        DuvarZemini.GECE -> DuvarRenkleri(
            zemin = 0xFF14211A.toInt(), metin = 0xFFF1F8E9.toInt(), kunye = 0xFFA5D6A7.toInt(),
            atif = 0xFF81C784.toInt(), sus = 0xFFFFFFFF.toInt(), susOpakligi = 0.08f,
        )
        DuvarZemini.KAGIT -> DuvarRenkleri(
            zemin = 0xFFF3F1EA.toInt(), metin = 0xFF1F2A22.toInt(), kunye = 0xFF2E7D32.toInt(),
            atif = 0xFF4E5B52.toInt(), sus = 0xFF1B5E20.toInt(), susOpakligi = 0.07f,
        )
        DuvarZemini.PALET -> {
            val zemin = okunurPaletZemini(ayar.paletRenk)
            val acikMetin = acikMetinSecilsinMi(zemin)
            val metin = if (acikMetin) 0xFFF1F8E9.toInt() else 0xFF1F2A22.toInt()
            // Künye/atıf: metin rengi zemine biraz karışır (ikincil ton), kontrast ≥ 4.5 korunur.
            val ikincil = ikincilTon(metin, zemin)
            DuvarRenkleri(
                zemin = zemin, metin = metin, kunye = ikincil, atif = ikincil,
                sus = if (acikMetin) 0xFFFFFFFF.toInt() else 0xFF000000.toInt(), susOpakligi = 0.09f,
            )
        }
    }

    /**
     * Palet rengi orta tonda (ör. gri) ise ne açık ne koyu metin 4.5:1'i tutar: zemin, tutana
     * kadar %10 adımlarla koyulaştırılır. Uygulamanın yeşili (#2E7D32) olduğu gibi kalır.
     */
    fun okunurPaletZemini(palet: Int): Int {
        var zemin = palet or 0xFF000000.toInt()
        repeat(10) {
            val enIyi = maxOf(kontrastOrani(0xFFF1F8E9.toInt(), zemin), kontrastOrani(0xFF1F2A22.toInt(), zemin))
            if (enIyi >= 4.5) return zemin
            zemin = karistir(zemin, 0xFF000000.toInt(), 0.10f)
        }
        return zemin
    }

    /** Palet zemininde açık (beyaza yakın) metin mi? Kontrastı yüksek olan seçilir. */
    fun acikMetinSecilsinMi(zemin: Int): Boolean =
        kontrastOrani(0xFFF1F8E9.toInt(), zemin) >= kontrastOrani(0xFF1F2A22.toInt(), zemin)

    /** Metni zemine doğru en çok %35 karıştırır; 4.5:1 altına düşmeden durur. */
    fun ikincilTon(metin: Int, zemin: Int): Int {
        var oran = 0.35f
        while (oran > 0f) {
            val aday = karistir(metin, zemin, oran)
            if (kontrastOrani(aday, zemin) >= 4.5) return aday
            oran -= 0.05f
        }
        return metin
    }

    /** Widget'ın palet zemini: palet renginin AÇIK tonu (beyazla %78 karışım; koyu metin okunur). */
    fun acikTon(renk: Int): Int = karistir(renk or 0xFF000000.toInt(), 0xFFFFFFFF.toInt(), 0.78f)

    /**
     * Ayet widget'ının "palet" zemini (tasarım: açık ton, koyu metin). Vurgu (başlık) palet
     * renginin koyu tonudur; 11 sp başlıkta 4.5:1'i tutmazsa metin rengi kullanılır.
     */
    fun widgetPaleti(palet: Int): WidgetPaletRenkleri {
        val zemin = acikTon(palet)
        val metin = 0xFF1B2B22.toInt()
        val ikincil = 0xFF33463A.toInt()
        val koyuTon = karistir(palet or 0xFF000000.toInt(), 0xFF000000.toInt(), 0.45f)
        val vurgu = if (kontrastOrani(koyuTon, zemin) >= 4.5) koyuTon else metin
        return WidgetPaletRenkleri(zemin, metin, ikincil, vurgu)
    }

    /** a'dan b'ye [oran] kadar doğrusal karışım (0 = a, 1 = b); alfa opak. */
    fun karistir(a: Int, b: Int, oran: Float): Int {
        fun kanal(kaydir: Int): Int {
            val x = (a shr kaydir) and 0xFF
            val y = (b shr kaydir) and 0xFF
            return Math.round(x + (y - x) * oran).coerceIn(0, 255)
        }
        return (0xFF shl 24) or (kanal(16) shl 16) or (kanal(8) shl 8) or kanal(0)
    }

    /** WCAG kontrast oranı (JS `core/utils/kontrastOrani.ts` ile aynı formül). */
    fun kontrastOrani(a: Int, b: Int): Double {
        val la = parlaklik(a)
        val lb = parlaklik(b)
        return (maxOf(la, lb) + 0.05) / (minOf(la, lb) + 0.05)
    }

    private fun parlaklik(renk: Int): Double {
        fun kanal(kaydir: Int): Double {
            val c = ((renk shr kaydir) and 0xFF) / 255.0
            return if (c <= 0.03928) c / 12.92 else Math.pow((c + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * kanal(16) + 0.7152 * kanal(8) + 0.0722 * kanal(0)
    }
}
