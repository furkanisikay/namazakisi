package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONArray
import org.json.JSONObject

/**
 * Günün ayeti duvar kâğıdı TASARIM SÖZLEŞMESİNİN Kotlin ikizi — SAF (JVM testi: DuvarTasarimiTest,
 * örnek `src/test/resources/duvar-tasarim-ornek.json`).
 *
 * Tek kaynak JS'tedir (`src/core/icerik/duvarTasarimi.ts`): vakit gökleri VERİDİR ve yükle gelir
 * (`yuk.sahneler`), burada sanat yeniden tanımlanmaz. Buradaki kurallar (gök seçimi, yazı
 * yerleşimi, gök cismi yeri, okunurluk) ve ayar normalizasyonu JS ile BİREBİR aynı olmalıdır;
 * eşlik örnek dosyayla denetlenir. Koordinatlar ekran kesri (x genişlik, y yükseklik; yarıçap ve
 * kalınlık genişlik kesri). Kurallar `Double` ile hesaplanır (JS sayılarıyla aynı sonuç).
 */

enum class DuvarGogu(val kod: String) {
    IMSAK("imsak"), KUSLUK("kusluk"), IKINDI("ikindi"), AKSAM("aksam"), YATSI("yatsi");

    companion object {
        fun coz(kod: String?): DuvarGogu? = values().firstOrNull { it.kod == kod }
    }
}

enum class YaziHizasi(val kod: String) {
    BAS("bas"), ORTA("orta"), SON("son");

    companion object {
        fun coz(kod: Any?): YaziHizasi = values().firstOrNull { it.kod == kod } ?: ORTA
    }
}

enum class YaziTipi(val kod: String) {
    KLASIK("klasik"), ZARIF("zarif"), SADE("sade");

    companion object {
        fun coz(kod: Any?): YaziTipi = values().firstOrNull { it.kod == kod } ?: KLASIK
    }
}

enum class SusTuru(val kod: String) {
    YILDIZ("yildiz"), MIHRAP("mihrap"), GIRIH("girih"), YOK("yok");

    companion object {
        fun coz(kod: Any?): SusTuru = values().firstOrNull { it.kod == kod } ?: YILDIZ
    }
}

/** Yazı bloğunun DİKEY MERKEZİ (ekran kesri; `null` = ekranın varsayılanı), boyut çarpanı, hiza, tip. */
data class DuvarYaziAyari(
    val kilitY: Double? = null,
    val anaY: Double? = null,
    val olcek: Double = 1.0,
    val hiza: YaziHizasi = YaziHizasi.ORTA,
    val tip: YaziTipi = YaziTipi.KLASIK,
)

data class DuvarSusAyari(val tur: SusTuru = SusTuru.YILDIZ, val belirginlik: Double = 0.5)

/** Fotoğraf zemini: [dosya] uygulamanın kendi kopyasının adı (`filesDir/duvar/<ad>`). */
data class DuvarFotoAyari(
    val dosya: String? = null,
    val karartma: Double = 0.4,
    val bulaniklik: Double = 0.15,
    val x: Double = 0.5,
    val y: Double = 0.5,
    val yakinlik: Double = 1.0,
    val okunurluk: Boolean = true,
)

// --- Gök sahnesi (veri) ---------------------------------------------------------------------

data class Nokta(val x: Double, val y: Double)

data class RenkDuragi(val konum: Double, val renk: Int)

enum class CisimTuru { GUNES, HILAL }

/**
 * Gök cismi. Hilal: (x, y, r) dairesinden (x+kesX, y+kesY, kesR) dairesi çıkarılır — kesX ve kesR
 * GENİŞLİK, kesY YÜKSEKLİK kesridir. [konumlar] sıralı adaylardır ([DuvarTasarimi.cisimKonumuSec]).
 */
data class GokCismi(
    val tur: CisimTuru,
    val konumlar: List<Nokta>,
    val r: Double,
    val renk: Int,
    val opaklik: Double,
    val kesX: Double = 0.0,
    val kesY: Double = 0.0,
    val kesR: Double = 0.0,
    val isimaR: Double? = null,
    val isimaRenk: Int? = null,
    val isimaOpaklik: Double? = null,
)

data class Yildiz(val x: Double, val y: Double, val r: Double, val opaklik: Double)

/** Cisimden ekran dışına uzanan huzme: başı cismin merkezi, ucu (x, y). */
data class Huzme(val x: Double, val y: Double, val kalinlik: Double, val renk: Int, val opaklik: Double)

data class Cokgen(val noktalar: List<Nokta>, val renk: Int, val opaklik: Double)

data class GokSahnesi(
    val gradyan: List<RenkDuragi>,
    val yildizlar: List<Yildiz>,
    val cisim: GokCismi?,
    val huzmeler: List<Huzme>,
    /** Ufuk/zemin çokgenleri (en son çizilir). */
    val ufuk: List<Cokgen>,
    /** Yazı rengi; künye ve atıf aynı rengin %72 ve %55 opaklığı. */
    val metin: Int,
)

/** İzinli dikey bant [ust, alt] (ekran kesri). */
data class Bant(val ust: Double, val alt: Double)

/** Kilit ekranında saatin (tarihle birlikte) kapladığı dikey aralık [ust, alt], ekran kesri. JS `SaatAlani`. */
typealias SaatAlani = Bant

data class YaziYeri(val ust: Double, val bant: Bant)

/** Yazı kutusu (ekran kesri): sol, üst, sağ, alt. */
data class Kutu(val x1: Double, val y1: Double, val x2: Double, val y2: Double)

data class OkunurlukKarari(val metin: Int, val perde: Int, val perdeOpakligi: Double)

object DuvarTasarimi {
    /**
     * Android'de yazının girebileceği dikey bantlar (yukarıdan aşağı). Kilit: Android 14+ büyük
     * saat bildirim yokken ~%28–%62, kilit simgesi ~%84'ten başlar; saatin üstündeki ince şerit de
     * kullanılabilir. JS `IZINLI_BANTLAR.android`.
     */
    val IZINLI_BANTLAR: Map<DuvarEkrani, List<Bant>> = mapOf(
        DuvarEkrani.KILIT to listOf(Bant(0.08, 0.26), Bant(0.64, 0.84)),
        DuvarEkrani.ANA to listOf(Bant(0.07, 0.88)),
    )

    // --- Kilit ekranı saat alanı (JS "Kilit ekranı saat alanı") ------------------------------
    // Saatin yerini veren genel API yok: varsayılan tahmindir, kullanıcı kilit ekranı görüntüsünden
    // ölçer (JS `saatAlaniBul`, profil native `DuvarOlcumu.satirProfili`) ya da elle ayarlar.

    /** Ölçülmemişse: Android 14+ büyük saat (emülatör karesi 66). JS `VARSAYILAN_SAAT_ALANI.android`. */
    val VARSAYILAN_SAAT_ALANI: SaatAlani = SaatAlani(0.26, 0.64)

    /** Kilit ekranında yazının dış sınırları (üstte durum çubuğu/tarih, altta kilit simgesi). JS `KILIT_DIS_SINIR.android`. */
    val KILIT_DIS_SINIR: Bant = Bant(0.08, 0.84)

    /** Saatin üstünde/altında kalan şerit bundan inceyse yazıya bant sayılmaz. */
    const val EN_DAR_BANT = 0.05

    /** Saat alanının en az ve en çok yüksekliği. */
    const val SAAT_ALANI_EN_AZ = 0.04
    const val SAAT_ALANI_EN_COK = 0.6

    /** Süs saat alanının içinde bu derinlikten sonra görünmez, dışına bu kadar çıkınca tam görünür. */
    const val SOLMA_IC = 0.05
    const val SOLMA_DIS = 0.0125

    /** JS `Math.round(v * 10000) / 10000` (yarım yukarı; Java `Math.round` da +∞'a yuvarlar). */
    private fun dort(v: Double): Double = Math.round(v * 10000) / 10000.0

    /**
     * Bozuk saat alanı `null` (varsayılan kullanılır); geçerliyse sınırlanır ve 4 haneye yuvarlanır.
     * Geçerli = iki sonlu SAYI taşıyan dizi (JSON dize/boolean sayı değildir). JS `saatAlaniNormalize`.
     */
    fun saatAlaniNormalize(ham: Any?): SaatAlani? {
        val d = ham as? JSONArray ?: return null
        if (d.length() != 2) return null
        val u = sayi(d.opt(0)) ?: return null
        val a = sayi(d.opt(1)) ?: return null
        val ust = minOf(0.9 - SAAT_ALANI_EN_AZ, maxOf(0.0, u))
        val alt = minOf(minOf(0.95, ust + SAAT_ALANI_EN_COK), maxOf(ust + SAAT_ALANI_EN_AZ, a))
        return SaatAlani(dort(ust), dort(alt))
    }

    /**
     * Yazının girebileceği bantlar. Ana ekran sabit ([IZINLI_BANTLAR]); kilit ekranı = dış sınır
     * eksi saat alanı (`null` = [VARSAYILAN_SAAT_ALANI] → [IZINLI_BANTLAR] ile aynı). En az bir bant:
     * iki şerit de dar kalırsa büyüğü (eşitlikte üstteki). JS `izinliBantlar('android', …)`.
     */
    fun izinliBantlar(ekran: DuvarEkrani, saatAlani: SaatAlani?): List<Bant> {
        if (ekran == DuvarEkrani.ANA) return IZINLI_BANTLAR.getValue(DuvarEkrani.ANA)
        val du = KILIT_DIS_SINIR.ust
        val da = KILIT_DIS_SINIR.alt
        val s = saatAlani ?: VARSAYILAN_SAAT_ALANI
        val ustSerit = Bant(du, maxOf(du, minOf(s.ust, da)))
        val altSerit = Bant(minOf(da, maxOf(s.alt, du)), da)
        val bantlar = listOf(ustSerit, altSerit).filter { it.alt - it.ust >= EN_DAR_BANT }
        if (bantlar.isNotEmpty()) return bantlar
        return listOf(if (ustSerit.alt - ustSerit.ust >= altSerit.alt - altSerit.ust) ustSerit else altSerit)
    }

    /**
     * Süsün saat alanında görünürlüğü (0–1): alanın içinde [SOLMA_IC] derinlikten sonra 0, dışına
     * [SOLMA_DIS] çıkınca 1, arası doğrusal; alan yoksa 1. JS `saatSolmasi`.
     */
    fun saatSolmasi(y: Double, saatAlani: SaatAlani?): Double {
        if (saatAlani == null) return 1.0
        val disarida = when {
            y < saatAlani.ust -> saatAlani.ust - y
            y > saatAlani.alt -> y - saatAlani.alt
            else -> -minOf(y - saatAlani.ust, saatAlani.alt - y)
        }
        return minOf(1.0, maxOf(0.0, (disarida + SOLMA_IC) / (SOLMA_IC + SOLMA_DIS)))
    }

    /**
     * [saatSolmasi]'nın kırılma noktaları (0–1 içinde, sıralı, 0 ve 1 dahil): fonksiyon bunların
     * arasında DOĞRUSALDIR, bu noktalardaki değerlerle kurulan doğrusal renk geçişi onu birebir verir.
     * Dar alanda (yükseklik < 2·[SOLMA_IC]) içerideki tepe noktası (orta) da kırılmadır.
     */
    fun saatSolmasiDuraklari(saatAlani: SaatAlani): List<Double> = listOf(
        0.0, 1.0,
        saatAlani.ust - SOLMA_DIS, saatAlani.ust + SOLMA_IC,
        (saatAlani.ust + saatAlani.alt) / 2,
        saatAlani.alt - SOLMA_IC, saatAlani.alt + SOLMA_DIS,
    ).filter { it in 0.0..1.0 }.distinct().sorted()

    /** [y1, y2] dikey aralığı saat alanına değiyor mu? (Mihrap yıldızı değiyorsa çizilmez.) JS `saateDegiyor`. */
    fun saateDegiyor(y1: Double, y2: Double, saatAlani: SaatAlani?): Boolean =
        saatAlani != null && y2 > saatAlani.ust && y1 < saatAlani.alt

    /** Kullanıcı taşımadıysa yazı bloğunun merkezi (eski bant düzeni). JS `VARSAYILAN_MERKEZ.android`. */
    val VARSAYILAN_MERKEZ: Map<DuvarEkrani, Double> = mapOf(DuvarEkrani.KILIT to 0.73, DuvarEkrani.ANA to 0.215)

    /** Yazı kutusunun cisimle kesişme denetiminde kenar payı (genişlik kesri). */
    const val CISIM_PAYI = 0.04

    const val ACIK_METIN: Int = 0xFFFFFFFF.toInt()
    const val KOYU_METIN: Int = 0xFF1F2A22.toInt()

    private val FOTO_ADI = Regex("^duvar-foto-[0-9a-z]{4,40}\\.(jpg|png)$")

    // --- Gök seçimi --------------------------------------------------------------------------

    /**
     * O anın göğü. [v] = imsak, güneş, ikindi, akşam, yatsı (epoch ms): imsak ≤ t < güneş → imsak;
     * güneş ≤ t < ikindi → kuşluk (öğle dahil); ikindi ≤ t < akşam → ikindi; akşam ≤ t < yatsı →
     * akşam; yatsıdan sonra ve imsaktan önce → yatsı.
     */
    fun vaktinGogu(simdiMs: Long, v: List<Long>): DuvarGogu = when {
        simdiMs >= v[0] && simdiMs < v[1] -> DuvarGogu.IMSAK
        simdiMs >= v[1] && simdiMs < v[2] -> DuvarGogu.KUSLUK
        simdiMs >= v[2] && simdiMs < v[3] -> DuvarGogu.IKINDI
        simdiMs >= v[3] && simdiMs < v[4] -> DuvarGogu.AKSAM
        else -> DuvarGogu.YATSI
    }

    /** [simdiMs]'den sonraki ilk gök sınırı; yoksa `null`. */
    fun sonrakiGokSiniri(simdiMs: Long, v: List<Long>): Long? = v.firstOrNull { it > simdiMs }

    // --- Yerleşim ----------------------------------------------------------------------------

    /**
     * İstenen merkeze EN YAKIN, bloğun SIĞDIĞI bant içi yerleşim (eşitlikte üstteki bant: kesin `<`).
     * Hiçbir banda sığmıyorsa `null` (çizici yazıyı küçültüp yeniden dener).
     */
    fun yaziYerlesimi(istenenMerkez: Double, blokYuksekligi: Double, bantlar: List<Bant>): YaziYeri? {
        var enIyi: YaziYeri? = null
        var enIyiFark = 0.0
        for (b in bantlar) {
            if (b.alt - b.ust < blokYuksekligi) continue
            val ust = minOf(b.alt - blokYuksekligi, maxOf(b.ust, istenenMerkez - blokYuksekligi / 2))
            val fark = Math.abs(ust + blokYuksekligi / 2 - istenenMerkez)
            if (enIyi == null || fark < enIyiFark) {
                enIyi = YaziYeri(ust, b)
                enIyiFark = fark
            }
        }
        return enIyi
    }

    /** Cisim diski (yarıçap [r], genişlik birimi) yazı kutusuna değiyor mu? Kutu yoksa değmez. */
    private fun kutuyaDeger(k: Nokta, r: Double, kutu: Kutu?, oran: Double): Boolean {
        if (kutu == null) return false
        val cx = k.x
        val cy = k.y * oran
        val yakX = minOf(kutu.x2, maxOf(kutu.x1, cx))
        val yakY = minOf(kutu.y2 * oran, maxOf(kutu.y1 * oran, cy))
        val dx = cx - yakX
        val dy = cy - yakY
        return dx * dx + dy * dy <= r * r
    }

    /**
     * Gök cisminin yeri. Sırayla: (1) yazı kutusuna ve saat alanına (tam genişlik dikey aralık;
     * `null` = yok, ör. ana ekran) değmeyen ilk aday; (2) yoksa kutuya değmeyen ilk adayın x'inde,
     * saat alanının hemen ÜSTÜNE (sığmazsa hemen altına) kaydırılmış konum (y 4 haneye yuvarlanır;
     * kutuya değmemeli, ekrandan taşmamalı); (3) hiçbiri olmazsa `null` (cisim, ışıması ve huzmeleri
     * çizilmez). Kesişme: ışımasız disk + [CISIM_PAYI]. [oran] = yükseklik/genişlik. JS `cisimKonumuSec`.
     */
    fun cisimKonumuSec(cisim: GokCismi, kutu: Kutu?, oran: Double, saatAlani: SaatAlani? = null): Nokta? {
        val r = cisim.r + CISIM_PAYI
        val ry = r / oran
        fun saateDeger(y: Double) = saatAlani != null && y + ry > saatAlani.ust && y - ry < saatAlani.alt
        for (k in cisim.konumlar) {
            if (!kutuyaDeger(k, r, kutu, oran) && !saateDeger(k.y)) return k
        }
        if (saatAlani == null) return null
        val temel = cisim.konumlar.firstOrNull { !kutuyaDeger(it, r, kutu, oran) } ?: return null
        for (y in listOf(saatAlani.ust - ry, saatAlani.alt + ry)) {
            val aday = Nokta(temel.x, dort(y))
            if (y - ry >= 0 && y + ry <= 1 && !kutuyaDeger(aday, r, kutu, oran)) return aday
        }
        return null
    }

    // --- Okunurluk ---------------------------------------------------------------------------

    /** sRGB bağıl parlaklık (WCAG), ARGB'nin alfası yok sayılır. */
    fun bagilParlaklik(renk: Int): Double {
        fun kanal(c: Int): Double {
            val s = c / 255.0
            return if (s <= 0.03928) s / 12.92 else Math.pow((s + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * kanal((renk shr 16) and 255) + 0.7152 * kanal((renk shr 8) and 255) + 0.0722 * kanal(renk and 255)
    }

    private fun kontrast(a: Double, b: Double): Double = (maxOf(a, b) + 0.05) / (minOf(a, b) + 0.05)

    /**
     * Fotoğraf zemininde (karartma uygulanmış) yazı kutusunun ORTALAMA bağıl parlaklığına göre yazı
     * rengi ve yazı arkası perde. Hedef 4,5:1; açık yazı → siyah perde, koyu yazı → beyaz perde;
     * perde opaklığı hedefi tutturan en küçük değer (0,05 adım, en çok 0,6).
     */
    fun okunurlukKarari(ortalamaParlaklik: Double): OkunurlukKarari {
        val l = minOf(1.0, maxOf(0.0, ortalamaParlaklik))
        val acikla = kontrast(1.0, l)
        val koyuL = bagilParlaklik(KOYU_METIN)
        val koyuyla = kontrast(koyuL, l)
        val acik = acikla >= koyuyla
        val metinL = if (acik) 1.0 else koyuL
        val perdeL = if (acik) 0.0 else 1.0
        var opaklik = 0.0
        while (opaklik < 0.6 - 1e-9) {
            val zemin = l * (1 - opaklik) + perdeL * opaklik
            if (kontrast(metinL, zemin) >= 4.5) break
            opaklik = Math.round((opaklik + 0.05) * 100) / 100.0
        }
        return OkunurlukKarari(
            metin = if (acik) ACIK_METIN else KOYU_METIN,
            perde = if (acik) 0xFF000000.toInt() else 0xFFFFFFFF.toInt(),
            perdeOpakligi = opaklik,
        )
    }

    // --- Ayar normalizasyonu (JS `*AyariNormalize` ile aynı) ---------------------------------

    /** JS `typeof v === 'number' && Number.isFinite(v)`; dize/boolean/null sayı değildir. */
    fun sayi(v: Any?): Double? = (v as? Number)?.toDouble()?.takeIf { it.isFinite() }

    private fun sinirla(v: Any?, alt: Double, ust: Double, varsayilan: Double): Double =
        sayi(v)?.let { minOf(ust, maxOf(alt, it)) } ?: varsayilan

    fun yaziAyariCoz(o: JSONObject?): DuvarYaziAyari {
        val v = DuvarYaziAyari()
        fun yKes(ad: String): Double? = sayi(o?.opt(ad))?.let { minOf(1.0, maxOf(0.0, it)) }
        return DuvarYaziAyari(
            kilitY = yKes("kilitY"),
            anaY = yKes("anaY"),
            olcek = sinirla(o?.opt("olcek"), 0.7, 1.6, v.olcek),
            hiza = YaziHizasi.coz(o?.opt("hiza")),
            tip = YaziTipi.coz(o?.opt("tip")),
        )
    }

    fun susAyariCoz(o: JSONObject?): DuvarSusAyari {
        val v = DuvarSusAyari()
        return DuvarSusAyari(SusTuru.coz(o?.opt("tur")), sinirla(o?.opt("belirginlik"), 0.0, 1.0, v.belirginlik))
    }

    /** Fotoğraf adı yalnız `duvar-foto-<özet>.(jpg|png)`; başka ad (yol dahil) reddedilir. */
    fun fotoAyariCoz(o: JSONObject?): DuvarFotoAyari {
        val v = DuvarFotoAyari()
        val ad = o?.opt("dosya") as? String
        return DuvarFotoAyari(
            dosya = ad?.takeIf { FOTO_ADI.matches(it) },
            karartma = sinirla(o?.opt("karartma"), 0.0, 0.85, v.karartma),
            bulaniklik = sinirla(o?.opt("bulaniklik"), 0.0, 1.0, v.bulaniklik),
            x = sinirla(o?.opt("x"), 0.0, 1.0, v.x),
            y = sinirla(o?.opt("y"), 0.0, 1.0, v.y),
            yakinlik = sinirla(o?.opt("yakinlik"), 1.0, 4.0, v.yakinlik),
            okunurluk = o?.opt("okunurluk") != false,
        )
    }

    /** Plan kaydının `vakitler`'i: tam 5 sonlu sayı (epoch ms), yoksa/bozuksa `null`. */
    fun vakitlerCoz(dizi: JSONArray?): List<Long>? {
        if (dizi == null || dizi.length() != 5) return null
        val v = (0 until 5).map { sayi(dizi.opt(it))?.toLong() ?: return null }
        return v
    }

    /**
     * Sahnenin SÜREÇLER ARASI kararlı özeti (duvar kâğıdı imzası için). Data class `hashCode()`
     * KULLANILMAZ: enum alanı (`CisimTuru`) kimlik hash'i taşır ve her süreçte değişir → her soğuk
     * açılışta duvar kâğıdı yeniden yazılırdı. `toString` enum adını ve sayıları deterministik yazar.
     */
    fun sahneOzeti(sahne: GokSahnesi): String = Integer.toHexString(sahne.toString().hashCode())

    // --- Sahne ayrıştırma --------------------------------------------------------------------

    /** `yuk.sahneler`: bozuk sahne yok sayılır (o gök seçilirse çizici gece zeminine düşer). */
    fun sahnelerCoz(o: JSONObject?): Map<DuvarGogu, GokSahnesi> {
        if (o == null) return emptyMap()
        val sonuc = LinkedHashMap<DuvarGogu, GokSahnesi>()
        for (g in DuvarGogu.values()) {
            val s = o.optJSONObject(g.kod) ?: continue
            try {
                sonuc[g] = sahneCoz(s)
            } catch (_: Exception) {
                // Bozuk sahne: bu gök yok sayılır.
            }
        }
        return sonuc
    }

    private fun zorunluSayi(o: JSONObject, ad: String): Double =
        sayi(o.opt(ad)) ?: throw IllegalArgumentException("sayi yok: $ad")

    private fun zorunluRenk(o: JSONObject, ad: String): Int =
        GununAyetiKurallari.renkCoz(o.opt(ad) as? String) ?: throw IllegalArgumentException("renk yok: $ad")

    private fun noktaCoz(d: JSONArray): Nokta {
        val x = sayi(d.opt(0)) ?: throw IllegalArgumentException("nokta")
        val y = sayi(d.opt(1)) ?: throw IllegalArgumentException("nokta")
        return Nokta(x, y)
    }

    private inline fun <T> diziCoz(d: JSONArray?, oge: (Int) -> T): List<T> =
        if (d == null) emptyList() else (0 until d.length()).map(oge)

    fun sahneCoz(o: JSONObject): GokSahnesi {
        val gradyan = diziCoz(o.optJSONArray("gradyan")) { i ->
            val d = o.getJSONArray("gradyan").getJSONObject(i)
            RenkDuragi(zorunluSayi(d, "konum"), zorunluRenk(d, "renk"))
        }
        val yildizlar = diziCoz(o.optJSONArray("yildizlar")) { i ->
            val d = o.getJSONArray("yildizlar").getJSONObject(i)
            Yildiz(zorunluSayi(d, "x"), zorunluSayi(d, "y"), zorunluSayi(d, "r"), zorunluSayi(d, "opaklik"))
        }
        val c = o.optJSONObject("cisim")
        val cisim = c?.let {
            GokCismi(
                tur = if (it.optString("tur") == "hilal") CisimTuru.HILAL else CisimTuru.GUNES,
                konumlar = diziCoz(it.optJSONArray("konumlar")) { i -> noktaCoz(it.getJSONArray("konumlar").getJSONArray(i)) },
                r = zorunluSayi(it, "r"),
                renk = zorunluRenk(it, "renk"),
                opaklik = zorunluSayi(it, "opaklik"),
                kesX = sayi(it.opt("kesX")) ?: 0.0,
                kesY = sayi(it.opt("kesY")) ?: 0.0,
                kesR = sayi(it.opt("kesR")) ?: 0.0,
                isimaR = sayi(it.opt("isimaR")),
                isimaRenk = GununAyetiKurallari.renkCoz(it.opt("isimaRenk") as? String),
                isimaOpaklik = sayi(it.opt("isimaOpaklik")),
            )
        }
        val huzmeler = diziCoz(o.optJSONArray("huzmeler")) { i ->
            val d = o.getJSONArray("huzmeler").getJSONObject(i)
            Huzme(zorunluSayi(d, "x"), zorunluSayi(d, "y"), zorunluSayi(d, "kalinlik"), zorunluRenk(d, "renk"), zorunluSayi(d, "opaklik"))
        }
        val ufuk = diziCoz(o.optJSONArray("ufuk")) { i ->
            val d = o.getJSONArray("ufuk").getJSONObject(i)
            val n = d.getJSONArray("noktalar")
            Cokgen(diziCoz(n) { j -> noktaCoz(n.getJSONArray(j)) }, zorunluRenk(d, "renk"), zorunluSayi(d, "opaklik"))
        }
        return GokSahnesi(gradyan, yildizlar, cisim, huzmeler, ufuk, zorunluRenk(o, "metin"))
    }

    // --- Yazı tipi ---------------------------------------------------------------------------

    /**
     * Amiri Regular'ın (1.002) KAPSADIĞI aralıklar (fontTools cmap, 2026-11-07): Latin temel + Latin-1
     * + Latin Genişletilmiş-A, birkaç birleşik işaret, Arap blokları, Latin Genişletilmiş Ek'in çeviri
     * yazısı harfleri (ḍ ḥ ṣ ṭ ẓ…) ve genel noktalama. Kiril, Yunan, IPA, Latin Genişletilmiş-B'nin
     * çoğu (ɓ ɗ ƙ) ve Vietnamca yığılmış işaretler YOK.
     */
    private val AMIRI_ARALIKLARI: List<IntRange> = listOf(
        0x0009..0x000D, 0x0020..0x007E, 0x00A0..0x017F, 0x01E6..0x01E7, 0x0237..0x0237,
        0x02BB..0x02BC, 0x02BE..0x02BF, 0x02C6..0x02C7, 0x02D8..0x02DD,
        0x0300..0x0308, 0x030A..0x030A, 0x030C..0x030C, 0x0312..0x0312, 0x0315..0x0315, 0x0325..0x0328,
        0x0600..0x0604, 0x0606..0x06FF, 0x0750..0x077F,
        0x1E02..0x1E03, 0x1E0A..0x1E11, 0x1E1E..0x1E1F, 0x1E24..0x1E25, 0x1E28..0x1E2B, 0x1E40..0x1E41,
        0x1E56..0x1E57, 0x1E60..0x1E63, 0x1E6A..0x1E6F, 0x1E80..0x1E85, 0x1E92..0x1E93, 0x1E96..0x1E97,
        0x1EF2..0x1EF3,
        0x2000..0x2015, 0x2018..0x2022, 0x2024..0x2024, 0x2026..0x2026, 0x2028..0x2030, 0x2032..0x2033,
        0x2038..0x203A, 0x203E..0x203E, 0x2044..0x2044, 0x20AC..0x20AC,
        0xFB50..0xFBC1, 0xFBD3..0xFD3F, 0xFD50..0xFD8F, 0xFD92..0xFDC7, 0xFDF0..0xFDFD, 0xFE70..0xFE72,
        0xFE74..0xFE74, 0xFE76..0xFEFC, 0xFEFF..0xFEFF,
    )

    /**
     * "Zarif" yazı tipinde meal Amiri ile mi çizilir? Bütün karakterleri Amiri'de olmalı; değilse
     * zincir klasik kurala iner (Noto Serif ya da sistem yazı tipi, `GununAyetiKurallari.mealSerifMi`).
     */
    fun zarifAmiriMi(metin: String): Boolean = metin.all { c -> AMIRI_ARALIKLARI.any { c.code in it } }
}

/** Görselin ekrandaki yeri ya da görselden kırpılan bölge (sol, üst, genişlik, yükseklik). */
data class Dikdortgen(val x: Double, val y: Double, val genislik: Double, val yukseklik: Double)

/** Mihrap kemeri (genişlik kesri): bacaklar `yanPay`'dan ekranın altına iner, yarım daire merkezi kutu üstünün `merkezAlti` altında. */
data class MihrapKemeri(val yanPay: Double, val r: Double, val merkezAlti: Double, val kalinlik: Double, val opaklik: Double)

/**
 * Duvar kâğıdı ÇİZİM SAYILARI — tek kaynak JS `src/core/icerik/duvarCizimi.ts` (uygulamadaki
 * düzenleyicinin önizlemesi = sahip onaylı taslak 2). Burada YENİDEN TASARLANMAZ: her sayı örnek
 * dosyanın `cizim` bölümüyle birebir denetlenir (`DuvarTasarimiTest.cizimSabitleriOrnekleAyni`).
 * Birimler: süs/perde genişlik kesri (tuval 330), yazı 412 tasarım px'i (× ekran genişliği / 412).
 */
object DuvarCizim {
    const val TASARIM_GENISLIGI = 412.0
    private const val TUVAL = 330.0

    // --- Yazı (412 tasarım px; satır yüksekliği ve harf aralığı yazı boyunun katı) -----------
    const val MEAL = 24.0
    const val MEAL_ARAPCALI = 17.0
    const val ARAPCA = 28.0
    const val KUNYE = 12.0
    const val ATIF = 10.0
    const val YAN_BOSLUK = 30.0
    const val KUCUK_YILDIZ = 22.0
    const val ARAPCA_SATIR = 2.0
    const val MEAL_SATIR = 1.4
    const val KUNYE_HARF_ARALIGI = 0.04
    const val MEAL_UST_ARAPCALI = 6.0
    const val MEAL_UST_YILDIZLI = 10.0
    const val KUNYE_UST_ARAPCALI = 14.0
    const val KUNYE_UST = 18.0
    const val ATIF_UST = 6.0
    const val ATIF_EN_AZ_OLCEK = 0.9

    // --- Süs ------------------------------------------------------------------------------
    val MIHRAP_YAZI_YAN_PAYI = 84.0 / TUVAL
    val MIHRAP_DIS = MihrapKemeri(58.0 / TUVAL, 107.0 / TUVAL, 54.0 / TUVAL, 2.2 / TUVAL, 0.28)
    val MIHRAP_IC = MihrapKemeri(74.0 / TUVAL, 91.0 / TUVAL, 58.0 / TUVAL, 1.3 / TUVAL, 0.14)
    /** Kemer tepesindeki DOLU beş köşeli yıldız: merkez kutu üstünün `MIHRAP_YILDIZ_UST` yukarısında. */
    val MIHRAP_YILDIZ_UST = 36.0 / TUVAL
    val MIHRAP_YILDIZ_DIS_R = 14.0 / TUVAL
    val MIHRAP_YILDIZ_IC_R = 6.5 / TUVAL
    const val MIHRAP_YILDIZ_OPAKLIK = 0.3

    /** Girih: ekranın sol üstünden döşenen karo; karo içinde 48 birimlik dört köşeli yıldız + daire. */
    val GIRIH_KARO = 48.0 / TUVAL
    const val GIRIH_YOL = "M24 0l6 18 18 6-18 6-6 18-6-18-18-6 18-6z"
    const val GIRIH_DAIRE_R = 5.0
    const val GIRIH_YILDIZ_KALINLIK = 0.9
    const val GIRIH_DAIRE_KALINLIK = 0.7
    const val GIRIH_OPAKLIK = 0.06

    /** Büyük silik yıldız: 24 birimlik çerçeve (iki kare + daire), birim = genişlik × [YILDIZ_BIRIM]. */
    val YILDIZ_BIRIM = 420.0 / TASARIM_GENISLIGI / 24
    const val YILDIZ_YARI_KENAR = 7.0
    const val YILDIZ_KOSEGEN = 9.9
    const val YILDIZ_DAIRE_R = 4.2
    const val YILDIZ_KALINLIK = 0.12
    const val YILDIZ_OPAKLIK = 0.08
    const val KUCUK_YILDIZ_KALINLIK = 1.6

    /** Fotoğraf okunurluk perdesi: yazı kutusunun her yanından taşma ve köşe yarıçapı; kesin kenarlı. */
    val PERDE_PAY = 12.0 / TUVAL
    val PERDE_YARICAP = 18.0 / TUVAL

    /** Süs opaklık çarpanı: belirginlik 0,5'te 1, 0'da görünmez, 1'de iki kat. */
    fun susCarpani(belirginlik: Double): Double = maxOf(0.0, belirginlik) / 0.5

    /** Yazı bloğunun yan payı (genişlik kesri): mihrapta kemerin içine daralır. */
    fun yaziYanPayi(tur: SusTuru): Double = if (tur == SusTuru.MIHRAP) MIHRAP_YAZI_YAN_PAYI else YAN_BOSLUK / TASARIM_GENISLIGI

    /** Büyük yıldızın merkezi (ekran kesri): düz zeminlerde kendi yeri; gök ve fotoğrafta ([zemin] `null`) gecenin yeri. */
    fun yildizKonumu(zemin: DuvarZemini?): Nokta = when (zemin) {
        DuvarZemini.KAGIT -> Nokta(0.097, 0.64)
        DuvarZemini.PALET -> Nokta(0.903, 0.693)
        else -> Nokta(0.855, 0.878)
    }

    /** Beş köşeli yıldızın 10 köşesi (dış/iç sırayla, ilk köşe tepede). JS `besKoseliYildiz`. */
    fun besKoseliYildiz(cx: Double, cy: Double, dis: Double, ic: Double): List<Nokta> = (0 until 10).map { i ->
        val r = if (i % 2 == 0) dis else ic
        val a = -Math.PI / 2 + i * Math.PI / 5
        Nokta(cx + r * Math.cos(a), cy + r * Math.sin(a))
    }

    /** [GIRIH_YOL]'un köşeleri (karo birimi): ilk çift mutlak (`M`), sonrakiler göreli (`l`). */
    fun girihNoktalari(): List<Nokta> {
        val sayilar = Regex("-?\\d+(?:\\.\\d+)?").findAll(GIRIH_YOL).map { it.value.toDouble() }.toList()
        val noktalar = ArrayList<Nokta>()
        var x = 0.0
        var y = 0.0
        for (i in 0 until sayilar.size / 2) {
            x = if (i == 0) sayilar[0] else x + sayilar[2 * i]
            y = if (i == 0) sayilar[1] else y + sayilar[2 * i + 1]
            noktalar += Nokta(x, y)
        }
        return noktalar
    }

    /**
     * Fotoğrafın ekranı KAPLAYAN kırpması (görsel pikseli, sol üst köken): ölçek = max(G/g, Y/y) ×
     * yakınlık, merkez (x·g, y·y), görselin içinde kalacak şekilde kaydırılır. JS `fotoYerlesimi`'nin
     * görsel uzayındaki karşılığı.
     */
    fun fotoKirpmasi(gorselG: Double, gorselY: Double, hedefG: Double, hedefY: Double, x: Double, y: Double, yakinlik: Double): Dikdortgen {
        if (gorselG <= 0 || gorselY <= 0 || hedefG <= 0 || hedefY <= 0) return Dikdortgen(0.0, 0.0, maxOf(0.0, gorselG), maxOf(0.0, gorselY))
        val olcek = maxOf(hedefG / gorselG, hedefY / gorselY) * maxOf(1.0, yakinlik)
        val g = minOf(gorselG, hedefG / olcek)
        val h = minOf(gorselY, hedefY / olcek)
        val sol = minOf(gorselG - g, maxOf(0.0, x * gorselG - g / 2))
        val ust = minOf(gorselY - h, maxOf(0.0, y * gorselY - h / 2))
        return Dikdortgen(sol, ust, g, h)
    }
}
