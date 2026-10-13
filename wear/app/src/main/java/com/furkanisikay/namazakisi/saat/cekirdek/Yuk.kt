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
)

data class Yuk(
    val surum: Int,
    val konumAdi: String,
    val kerahat: Kerahat,
    val gunler: List<Gun>,
    /** Kronolojik muhafız planı; v1 yükünde ve muhafız kapalıyken boş. */
    val plan: List<PlanKaydi> = emptyList(),
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
            CozumSonucu.Basarili(Yuk(surum, o.getString("konumAdi"), kerahat, gunler, plan))
        } catch (_: Exception) {
            CozumSonucu.Gecersiz
        }
    }

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
            )
        }.sortedBy { it.ms }
}
