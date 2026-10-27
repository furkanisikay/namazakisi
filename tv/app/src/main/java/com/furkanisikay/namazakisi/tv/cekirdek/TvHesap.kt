package com.furkanisikay.namazakisi.tv.cekirdek

import com.batoulapps.adhan2.HighLatitudeRule
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate

/**
 * Telefonun hesap yöntemi (cihaz ağı yükü `durum.hesap`; telefon ikizi
 * `src/core/vakit/tvHesapOzeti.ts`). Profil adı değil ÇÖZÜLMÜŞ parametreler gelir: TV profil
 * tablosu taşımaz. Alan yoksa (dokunulmamış Diyanet ya da eski telefon) TV Türkiye yolunu
 * kullanır. Saf.
 */
data class TvHesap(
    /** Moonsighting Committee (mevsimsel sabah/yatsı); değilse açı tabanlı genel yol. */
    val ay: Boolean,
    val fecrAcisi: Double,
    val yatsiAcisi: Double,
    /** Yatsı = akşam + dk (0 = açıyla). Ramazan eki `ramazan`da. */
    val yatsiAraligi: Int,
    /** Akşam açısı (Caferî/Tahran); null = akşam gün batımında. */
    val aksamAcisi: Double?,
    /** İkindi asr-ı sânî (gölge 2×); false = asr-ı evvel. */
    val sani: Boolean,
    val yuksekEnlem: HighLatitudeRule,
    /** Vakit başına toplam dk düzeltmesi: imsak, güneş, öğle, ikindi, akşam, yatsı. */
    val ofset: List<Int>,
    val ramazan: RamazanEki?,
    /** Dakikaya yukarı yuvarlama (MUIS); false = en yakın. */
    val yukari: Boolean = false,
)

/** Ümmü'l-Kurâ: [bas, son] aralığında (iki uç dahil) yatsı aralığına `dk` eklenir. */
data class RamazanEki(val bas: LocalDate, val son: LocalDate, val dk: Int)

object TvHesapCozucu {
    private val YUKSEK_ENLEM = mapOf(
        "orta" to HighLatitudeRule.MIDDLE_OF_THE_NIGHT,
        "yedide" to HighLatitudeRule.SEVENTH_OF_THE_NIGHT,
        "aci" to HighLatitudeRule.TWILIGHT_ANGLE,
    )

    /** Bozuk ya da sınır dışı alan → null (TV Türkiye yoluna düşer; yanlış vakit göstermez). */
    fun coz(o: JSONObject?): TvHesap? {
        if (o == null) return null
        return try {
            val y = o.getString("y")
            if (y != "ay" && y != "diger") return null
            val f = o.getDouble("f").takeIf { it in 0.0..30.0 } ?: return null
            val i = o.getDouble("i").takeIf { it in 0.0..30.0 } ?: return null
            val ia = o.getInt("ia").takeIf { it in 0..240 } ?: return null
            val ma = if (o.has("ma")) o.getDouble("ma").takeIf { it > 0.0 && it <= 30.0 } ?: return null else null
            val a = o.getString("a")
            if (a != "evvel" && a != "sani") return null
            val k = YUKSEK_ENLEM[o.getString("k")] ?: return null
            val dizi = o.getJSONArray("o")
            if (dizi.length() != 6) return null
            val ofset = (0 until 6).map { dizi.getInt(it) }
            if (ofset.any { it !in -90..90 }) return null
            val ramazan = o.optJSONObject("rmz")?.let { r ->
                val dk = r.getInt("dk").takeIf { it in 0..120 } ?: return null
                RamazanEki(LocalDate.parse(r.getString("b")), LocalDate.parse(r.getString("s")), dk)
            }
            val r = if (o.has("r")) o.getString("r") else null
            if (r != null && r != "yukari") return null
            TvHesap(y == "ay", f, i, ia, ma, a == "sani", k, ofset, ramazan, r == "yukari")
        } catch (e: Exception) {
            null
        }
    }

    /** Kalıcı depolama için telefonun tel biçimine geri yazar (`coz(yaz(h)) == h`). */
    fun yaz(h: TvHesap): String {
        val o = JSONObject()
        o.put("y", if (h.ay) "ay" else "diger")
        o.put("f", h.fecrAcisi)
        o.put("i", h.yatsiAcisi)
        o.put("ia", h.yatsiAraligi)
        h.aksamAcisi?.let { o.put("ma", it) }
        o.put("a", if (h.sani) "sani" else "evvel")
        o.put("k", YUKSEK_ENLEM.entries.first { it.value == h.yuksekEnlem }.key)
        o.put("o", JSONArray(h.ofset))
        if (h.yukari) o.put("r", "yukari")
        h.ramazan?.let { r ->
            o.put("rmz", JSONObject().put("b", r.bas.toString()).put("s", r.son.toString()).put("dk", r.dk))
        }
        return o.toString()
    }
}
