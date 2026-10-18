package com.furkanisikay.namazakisi.saat.cekirdek

import org.json.JSONArray
import org.json.JSONObject

/**
 * Telefon → saat YÜK SÖZLEŞMESİ (issue #269) — telefon tarafının aynası:
 * `src/core/wear/wearYuku.ts`. İki taraf AYNI örnek dosyayı kabul eder
 * (`src/test/resources/ornek-yuk.json`); şema tek taraflı değiştirilemez.
 *
 * Sürüm 2 (issue #280): `muhafiz` = telefonun motoruyla üretilmiş HAZIR plan.
 * Saat yalnız sıradaki alarmı kurar, ikinci bir motor YOKTUR. Sürüm 1 yükü
 * (eski telefon) okunmaya devam eder; planı boş sayılır.
 */
const val DESTEKLENEN_YUK_SURUMU = 2

/** Vakit başına en fazla hatırlatma (telefonda `MUHAFIZ_MAKS_ADIM`, issue #274). */
const val MAKS_ADIM = 6

/** Sözleşme sırası; `gunes` görüntülenir ama asla "kılınmış" olmaz. */
val VAKITLER = listOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")

data class Kerahat(val surukDk: Int, val istivaDk: Int, val gurubDk: Int)

data class Gun(
    val tarih: String,
    /** vakit → giriş anı (epoch ms) */
    val vakitler: Map<String, Long>,
    val kilinan: Set<String>,
)

/** Telefonun planladığı tek bir muhafız uyarısı (kimlik telefondaki bildirimle AYNI). */
data class PlanKaydi(
    val id: String,
    /** Tetik anı (epoch ms) */
    val ms: Long,
    /** Vaktin ait olduğu gün — gece yarısından sonra süren yatsı DÜNE aittir. */
    val tarih: String,
    val vakit: String,
    /** 1 nazik · 2 uyarı · 3 sert · 4 acil */
    val seviye: Int,
    val baslik: String,
    val govde: String,
    /** Kullanıcının açtığı belirgin titreşim */
    val titresim: Boolean,
    /** Acil ton → acil kanal + CATEGORY_ALARM */
    val acil: Boolean,
    /**
     * Adımın vaktin içindeki KRONOLOJİK sırası (0'dan; telefonda
     * `UyariPlani.adimIndeks`) — issue #274. Ton artık sırayı ima etmez (geri
     * gidebilir), "vaktin son adımı" ancak bununla bulunur. Eski telefon yükünde
     * yoktur (null) → `SonDakikalar` ardışık-ton gruplamasına düşer.
     * EKLEMELİ opsiyonel alan: eski saat yok sayar, sürüm ARTIRILMAZ.
     */
    val adim: Int? = null,
    /**
     * ÇÖZÜLMÜŞ sesli anons cümlesi (saat W3, fikir 9) — yalnız adımın sesli kanalı
     * açıkken. Saat telefon yanında değilken (ya da kullanıcı "saatte" seçtiyse) bunu
     * kendi hoparlöründen okur. EKLEMELİ opsiyonel alan.
     */
    val anons: String? = null,
)

/**
 * Saatte SESSİZ UYANDIRMA (saat W3, fikir 2): sabahın gerçek alarm tetiği ya da
 * teheccüd uyandırması. Kimlik telefondaki alarmla AYNI — saat kapatınca telefon
 * yedeğini bununla iptal eder. Yalnız kullanıcı "saat"/"ikisi" seçtiyse yükte yer alır.
 */
data class UyandirmaKaydi(
    val id: String,
    /** Özgün tetik anı (epoch ms) */
    val ms: Long,
    /** Bu andan sonra çalınmaz (vakit / pencere sonu) */
    val sonMs: Long,
    val tarih: String,
    /** "imsak" (farz: Kıldım = sabah kaydı) | "teheccud" (nafile: Kıldım FARZ YAZMAZ) */
    val tur: String,
    val baslik: String,
    val govde: String,
) {
    val nafile: Boolean get() = tur == "teheccud"
}

/** Muhafız anonsunun yeri (saat W3, fikir 9) — telefondaki `AnonsYeri`. */
object AnonsYerleri {
    const val OTOMATIK = "otomatik"
    const val TELEFON = "telefon"
    const val SAAT = "saat"
    val HEPSI = setOf(OTOMATIK, TELEFON, SAAT)
}

/** Telefonun Now Bar zaman çizelgesinden öne çıkan bir dilim (issue #282 ikinci aşama). */
data class CanliPencere(
    val oge: String,
    val baslik: String,
    /** Kısa durum metni ("İftar") */
    val ad: String,
    val bas: Long,
    val bitis: Long,
    /** Küçük sayı kazanır (vakit 1 … seri 6) */
    val oncelik: Int,
    /** Yalnız vakit öğelerinde (kılınmışlık + "Kıldım") */
    val tarih: String? = null,
    val vakit: String? = null,
)

/**
 * Now Bar kullanıcı seçimi (issue #282): saat AYNI seçime uyar. EKLEMELİ opsiyonel
 * alan — yoksa (eski telefon) `null` ve saat eski davranışında kalır.
 */
data class CanliSecim(
    /** Vakit başına: saat kendi "son dakikalar" sayacını göstersin mi? */
    val vakitler: Map<String, Boolean>,
    val pencereler: List<CanliPencere>,
)

/**
 * Kıble için YAKLAŞIK konum (saat yenileme W2). Telefon 1 ondalığa yuvarlar (≈ 11 km;
 * kıbleye etkisi ≈ 0,1°). EKLEMELİ opsiyonel alan: eski telefonda yoktur, sürüm 2 kalır.
 */
data class Konum(val lat: Double, val lng: Double)

data class Yuk(
    val surum: Int,
    val konumAdi: String,
    val kerahat: Kerahat,
    val gunler: List<Gun>,
    /** Kronolojik muhafız planı; v1 yükünde ve muhafız kapalıyken boş. */
    val plan: List<PlanKaydi> = emptyList(),
    /** Now Bar seçimi (opsiyonel, issue #282). */
    val canli: CanliSecim? = null,
    /** Kıble konumu (opsiyonel; bozuksa yalnız bu alan null — bkz. `YukCozucu.konumCoz`). */
    val konum: Konum? = null,
    /** Saatte sessiz uyandırma (opsiyonel, saat W3); kronolojik. Yoksa boş. */
    val uyandirma: List<UyandirmaKaydi> = emptyList(),
    /** Muhafız anonsunun yeri (opsiyonel, saat W3). Yoksa (eski telefon) saat konuşmaz. */
    val anonsYeri: String? = null,
)

sealed class CozumSonucu {
    data class Basarili(val yuk: Yuk) : CozumSonucu()
    /** Telefon daha yeni bir şema gönderdi — saat eski veriyi göstermeye devam eder. */
    data class SurumYeni(val surum: Int) : CozumSonucu()
    data object Gecersiz : CozumSonucu()
}

object YukCozucu {
    private val TARIH = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun coz(json: String?): CozumSonucu {
        if (json.isNullOrBlank()) return CozumSonucu.Gecersiz
        return try {
            val o = JSONObject(json)
            val surum = o.getInt("surum")
            if (surum > DESTEKLENEN_YUK_SURUMU) return CozumSonucu.SurumYeni(surum)
            val k = o.getJSONObject("kerahatDk")
            val kerahat = Kerahat(k.getInt("suruk"), k.getInt("istiva"), k.getInt("gurub"))
            val dizi = o.getJSONArray("gunler")
            if (dizi.length() == 0) return CozumSonucu.Gecersiz
            val gunler = (0 until dizi.length()).map { i ->
                val g = dizi.getJSONObject(i)
                val tarih = g.getString("tarih")
                require(TARIH.matches(tarih))
                val v = g.getJSONObject("vakitler")
                val vakitler = VAKITLER.associateWith { v.getLong(it) }
                val kd = g.getJSONArray("kilinan")
                val kilinan = (0 until kd.length()).map { kd.getString(it) }.toSet()
                require(kilinan.all { it in VAKITLER && it != "gunes" })
                Gun(tarih, vakitler, kilinan)
            }.sortedBy { it.tarih }
            val plan = if (surum >= 2) planiCoz(o.getJSONArray("muhafiz")) else emptyList()
            val canli = if (o.has("canli")) canliCoz(o.getJSONObject("canli")) else null
            val uyandirma = if (o.has("uyandirma")) uyandirmaCoz(o.getJSONArray("uyandirma")) else emptyList()
            val anonsYeri = if (o.has("anonsYeri")) o.getString("anonsYeri").also { require(it in AnonsYerleri.HEPSI) } else null
            CozumSonucu.Basarili(
                Yuk(surum, o.getString("konumAdi"), kerahat, gunler, plan, canli, konumCoz(o.opt("konum")), uyandirma, anonsYeri),
            )
        } catch (_: Exception) {
            CozumSonucu.Gecersiz
        }
    }

    /**
     * GEVŞEK doğrulama (bilinçli, JS `wearKonumuCoz` ile AYNI kural): `konum` bozuksa
     * YÜK reddedilmez, yalnız konum null olur — kıble ikincildir, vakit gösterimi
     * bir yan alan yüzünden kaybolmamalı (`canli`'nin katılığının tersine).
     */
    fun konumCoz(deger: Any?): Konum? {
        val o = deger as? JSONObject ?: return null
        val lat = o.opt("lat")
        val lng = o.opt("lng")
        // JS `typeof === 'number'`: dize "41" sayı DEĞİL (org.json opt* onu çevirirdi).
        if (lat !is Number || lng !is Number) return null
        val enlem = lat.toDouble()
        val boylam = lng.toDouble()
        if (!enlem.isFinite() || !boylam.isFinite()) return null
        if (enlem !in -90.0..90.0 || boylam !in -180.0..180.0) return null
        if (enlem == 0.0 && boylam == 0.0) return null
        return Konum(enlem, boylam)
    }

    private val CANLI_VAKITLERI = listOf("imsak", "ogle", "ikindi", "aksam", "yatsi")

    /** Opsiyonel `canli`: varsa tam doğrulanır (JS `canliGecerliMi` ile aynı katılık). */
    private fun canliCoz(o: JSONObject): CanliSecim {
        val v = o.getJSONObject("vakitler")
        val vakitler = CANLI_VAKITLERI.associateWith { a -> v.get(a).let { require(it is Boolean); it } }
        val dizi = o.getJSONArray("pencereler")
        val pencereler = (0 until dizi.length()).map { i ->
            val p = dizi.getJSONObject(i)
            val bas = p.getLong("bas")
            val bitis = p.getLong("bitis")
            require(bitis > bas)
            val oncelik = p.get("oncelik").let { require(it is Int); it }
            val tarih = if (p.has("tarih")) p.getString("tarih").also { require(TARIH.matches(it)) } else null
            val vakit = if (p.has("vakit")) p.getString("vakit").also { require(it in CANLI_VAKITLERI) } else null
            CanliPencere(
                oge = p.getString("oge"),
                baslik = p.getString("baslik"),
                ad = p.getString("ad"),
                bas = bas,
                bitis = bitis,
                oncelik = oncelik,
                tarih = tarih,
                vakit = vakit,
            )
        }.sortedBy { it.bas }
        return CanliSecim(vakitler, pencereler)
    }

    /** Opsiyonel `uyandirma`: varsa TAM doğrulanır (JS `wearUyandirmaGecerliMi` ile aynı katılık). */
    private fun uyandirmaCoz(dizi: JSONArray): List<UyandirmaKaydi> =
        (0 until dizi.length()).map { i ->
            val k = dizi.getJSONObject(i)
            val tarih = k.getString("tarih")
            val tur = k.getString("tur")
            val ms = k.getLong("ms")
            val sonMs = k.getLong("sonMs")
            require(TARIH.matches(tarih))
            require(tur == "imsak" || tur == "teheccud")
            require(sonMs > ms)
            UyandirmaKaydi(k.getString("id"), ms, sonMs, tarih, tur, k.getString("baslik"), k.getString("govde"))
        }.sortedBy { it.ms }

    /** Tek bozuk kayıt tüm yükü reddeder (JS `wearYukuGecerliMi` ile aynı katılık). */
    private fun planiCoz(dizi: JSONArray): List<PlanKaydi> =
        (0 until dizi.length()).map { i ->
            val k = dizi.getJSONObject(i)
            val tarih = k.getString("tarih")
            val vakit = k.getString("vakit")
            val seviye = k.getInt("seviye")
            require(TARIH.matches(tarih))
            require(vakit in VAKITLER && vakit != "gunes")
            require(seviye in 1..4)
            // Katı tam sayı (JS `Number.isInteger` ile aynı): `getInt` 1.5'i 1'e yuvarlardı.
            val adim = if (k.has("adim")) k.get("adim").let { require(it is Int); it } else null
            require(adim == null || adim in 0 until MAKS_ADIM)
            PlanKaydi(
                id = k.getString("id"),
                ms = k.getLong("ms"),
                tarih = tarih,
                vakit = vakit,
                seviye = seviye,
                baslik = k.getString("baslik"),
                govde = k.getString("govde"),
                titresim = k.getBoolean("titresim"),
                acil = k.getBoolean("acil"),
                adim = adim,
                // JS `typeof === 'string'`: `getString` sayıyı da dizeye çevirirdi.
                anons = if (k.has("anons")) k.get("anons").let { require(it is String); it } else null,
            )
        }.sortedBy { it.ms }
}
