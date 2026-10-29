package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject

/**
 * Rakam sistemi — panonun görünen sayıları telefonun "ülkeye göre" kararıyla (telefon ikizi
 * `src/core/dil/rakam.ts > rakamSistemiCoz`). SAF.
 *
 * Çözüm sırası telefonla aynı: kullanıcının telefonda bu dil için açık seçimi → konumun ülke
 * varsayılanı → dilin varsayılanı. Dil TV'nin kendi dilidir (`R.string.dil_kodu`; telefonun
 * dili farklı olabilir), ülke telefondan gelen konumun ülkesidir; elle seçilen il Türkiye'dir,
 * eski telefon ülke göndermezse cihazın bölgesi kullanılır.
 *
 * Kural: çekirdek metni Batı rakamıyla ÜRETİR; dönüşüm yalnız çizim kenarında
 * (`ui/YerelRakam`). Eşleme telefonla birebir: yeni dil/sistem `rakam.ts`, iki `Rakam.kt`
 * (uygulama, saat) ve Swift `RakamSistemi` ile birlikte değişir.
 */
data class TvRakam(
    /** Konumun ülkesi (ISO 3166-1 alfa-2, büyük harf); null = bilinmiyor. */
    val ulke: String?,
    /** Telefondaki açık seçimler: dil → `latn` ya da o dilin yerel sistemi. */
    val secimler: Map<String, String> = emptyMap(),
)

object RakamKarari {
    /** Dil → yerel rakam sistemi (`rakam.ts > YEREL_RAKAMLAR`). */
    private val YEREL = mapOf("ar" to "arab", "bn" to "beng", "fa" to "arabext", "ps" to "arabext", "ckb" to "arab")

    /** Dil başına ülke → sistem (`RAKAM_ULKE_VARSAYILANLARI`; Mağrip Batı rakamı yazar). */
    private val ULKE = mapOf("ar" to setOf("DZ", "MA", "TN", "LY", "MR", "EH").associateWith { "latn" })

    private val SIFIR = mapOf("arab" to '٠', "arabext" to '۰', "beng" to '০')
    private val ULKE_KODU = Regex("^[A-Z]{2}$")

    /** Etkin sistem: `latn`, `arab`, `arabext` ya da `beng`. */
    fun sistem(dil: String, tercih: TvRakam?): String {
        val yerel = YEREL[dil] ?: return "latn"
        val secim = tercih?.secimler?.get(dil)
        if (secim != null && (secim == "latn" || secim == yerel)) return secim
        return tercih?.ulke?.let { ULKE[dil]?.get(it) } ?: yerel
    }

    /** Sistemin sıfır rakamı; Batı için '0'. */
    fun sifir(sistem: String): Char = SIFIR[sistem] ?: '0'

    /** Telefon yükündeki `rakam` alanı (`{u, s}`); bozuk alan atlanır, hiçbiri yoksa null. */
    fun coz(o: JSONObject?): TvRakam? {
        if (o == null) return null
        val ulke = o.optString("u").takeIf { ULKE_KODU.matches(it) }
        val secimler = mutableMapOf<String, String>()
        o.optJSONObject("s")?.let { s ->
            for (dil in s.keys()) {
                val sistem = s.optString(dil)
                val yerel = YEREL[dil] ?: continue
                if (sistem == "latn" || sistem == yerel) secimler[dil] = sistem
            }
        }
        return if (ulke == null && secimler.isEmpty()) null else TvRakam(ulke, secimler)
    }

    /** Kalıcı depolama için tel biçimine geri yazar (`coz(yaz(r)) == r`). */
    fun yaz(r: TvRakam): String {
        val o = JSONObject()
        r.ulke?.let { o.put("u", it) }
        if (r.secimler.isNotEmpty()) o.put("s", JSONObject(r.secimler.toSortedMap()))
        return o.toString()
    }
}

/** Yerel rakamlar (Doğu Arap, Fars/Urdu, Bengalce) → Batı; kaynak `%d`'si cihaz yerel ayarıyla gelebilir. */
private fun batiya(metin: String): String {
    if (metin.none { it in '٠'..'٩' || it in '۰'..'۹' || it in '০'..'৯' }) return metin
    val sb = StringBuilder(metin.length)
    for (c in metin) {
        sb.append(
            when (c) {
                in '٠'..'٩' -> '0' + (c - '٠')
                in '۰'..'۹' -> '0' + (c - '۰')
                in '০'..'৯' -> '0' + (c - '০')
                else -> c
            },
        )
    }
    return sb.toString()
}

/**
 * [metin]deki rakamları [sifir]dan başlayan diziye çevirir. Önce yerel rakamlar Batıya
 * normalleşir: Android kaynağındaki `%d` cihaz yerel ayarının rakamıyla biçimlenir (fa cihazda
 * ۵), kullanıcı Batı rakamını seçtiyse o da 0-9 olmalı. '0' ise yalnız normalleşir. İdempotent.
 */
fun rakamlariYerellestir(metin: String, sifir: Char): String {
    val bati = batiya(metin)
    if (sifir == '0' || bati.none { it in '0'..'9' }) return bati
    val fark = sifir - '0'
    val sb = StringBuilder(bati.length)
    for (c in bati) sb.append(if (c in '0'..'9') c + fark else c)
    return sb.toString()
}
