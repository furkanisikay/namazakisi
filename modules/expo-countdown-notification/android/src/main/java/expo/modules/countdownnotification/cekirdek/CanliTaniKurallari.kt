package expo.modules.countdownnotification.cekirdek

import org.json.JSONArray
import org.json.JSONObject

/**
 * Now Bar / Live Update TANI kayıtlarının SAF kuralları (issue #282, saha raporu:
 * "saatte görünüyor, telefonda görünmüyor"). Android import ETMEZ (yalnız `org.json`).
 *
 * NEDEN: öne çıkarmanın iki ön koşulu (`canPostPromotedNotifications()`,
 * `hasPromotableCharacteristics()`) true olsa bile sistem bildirimi öne ÇIKARMAYABİLİR —
 * üretici (Samsung One UI) ek ölçüt koyabilir. Tek gerçek, gönderilmiş bildirimin
 * `FLAG_PROMOTED_ONGOING` bayrağıdır (sistem yazar, uygulama okuyabilir). Tanı bu
 * yüzden üçünü ayrı ayrı kaydeder; JS (`src/core/sayac/canliTani.ts`) yorumlar.
 */
object CanliTaniKurallari {

    /** Bir gösterimin kaydı. `oneCikarildi` null = bayrak okunamadı (bildirim bulunamadı). */
    data class GosterimKaydi(
        val zamanMs: Long,
        val id: String,
        val tema: String,
        val kanalId: String,
        /** Kanal önemi (`NotificationManager.IMPORTANCE_*`); okunamadıysa null. */
        val kanalOnemi: Int?,
        val oneCikarilabilir: Boolean,
        val izinVar: Boolean,
        val oneCikarildi: Boolean?,
        val hata: String? = null,
    )

    /** Sistemin yazdığı bayrak bildirim bayraklarında var mı? */
    fun oneCikarildiMi(bayraklar: Int, oneCikarmaBayragi: Int): Boolean =
        oneCikarmaBayragi != 0 && (bayraklar and oneCikarmaBayragi) == oneCikarmaBayragi

    fun kaydiJsonaCevir(k: GosterimKaydi): JSONObject = JSONObject()
        .put("zamanMs", k.zamanMs)
        .put("id", k.id)
        .put("tema", k.tema)
        .put("kanalId", k.kanalId)
        .put("kanalOnemi", k.kanalOnemi ?: JSONObject.NULL)
        .put("oneCikarilabilir", k.oneCikarilabilir)
        .put("izinVar", k.izinVar)
        .put("oneCikarildi", k.oneCikarildi ?: JSONObject.NULL)
        .put("hata", k.hata ?: JSONObject.NULL)

    /** Saklanan kaydı okur; bozuksa null (tanı asla fırlatmaz). */
    fun kaydiJsondanOku(ham: String?): GosterimKaydi? {
        if (ham.isNullOrEmpty()) return null
        return try {
            val o = JSONObject(ham)
            val id = o.optString("id", "")
            if (id.isEmpty()) return null
            GosterimKaydi(
                zamanMs = o.optLong("zamanMs", 0L),
                id = id,
                tema = o.optString("tema", ""),
                kanalId = o.optString("kanalId", ""),
                kanalOnemi = if (o.isNull("kanalOnemi") || !o.has("kanalOnemi")) null else o.optInt("kanalOnemi"),
                oneCikarilabilir = o.optBoolean("oneCikarilabilir", false),
                izinVar = o.optBoolean("izinVar", false),
                oneCikarildi = if (o.isNull("oneCikarildi") || !o.has("oneCikarildi")) null else o.optBoolean("oneCikarildi"),
                hata = if (o.isNull("hata") || !o.has("hata")) null else o.optString("hata"),
            )
        } catch (_: Exception) {
            null
        }
    }

    /** Kaydı bayrağın sonradan okunan değeriyle günceller (bildirim gönderimi asenkrondur). */
    fun bayrakIsle(k: GosterimKaydi, oneCikarildi: Boolean?): GosterimKaydi =
        if (oneCikarildi == null) k else k.copy(oneCikarildi = oneCikarildi)

    /**
     * Köprüye giden tanı JSON'u. Alan adları JS `CanliTani` tipiyle kilitlidir
     * (`modules/expo-countdown-notification/src/index.ts`).
     */
    fun taniJsonu(
        sdkInt: Int,
        sdkTam: Int?,
        samsung: Boolean,
        oneUi: String?,
        izinVar: Boolean?,
        planOlaySayisi: Int,
        sonrakiAlarmMs: Long?,
        sonPlanMs: Long?,
        gosterilenler: Collection<String>,
        sonGosterim: GosterimKaydi?,
        aktifBildirimler: List<Pair<String, Boolean?>>,
    ): String = JSONObject()
        .put("sdkInt", sdkInt)
        .put("sdkTam", sdkTam ?: JSONObject.NULL)
        .put("samsung", samsung)
        .put("oneUi", oneUi ?: JSONObject.NULL)
        .put("izinVar", izinVar ?: JSONObject.NULL)
        .put("planOlaySayisi", planOlaySayisi)
        .put("sonrakiAlarmMs", sonrakiAlarmMs ?: JSONObject.NULL)
        .put("sonPlanMs", sonPlanMs ?: JSONObject.NULL)
        .put("gosterilenler", JSONArray().apply { gosterilenler.sorted().forEach { put(it) } })
        .put("sonGosterim", sonGosterim?.let { kaydiJsonaCevir(it) } ?: JSONObject.NULL)
        .put("aktifBildirimler", JSONArray().apply {
            aktifBildirimler.forEach { (id, one) ->
                put(JSONObject().put("id", id).put("oneCikarildi", one ?: JSONObject.NULL))
            }
        })
        .toString()

    /**
     * One UI sürümü sistem özelliği (`ro.build.version.oneui`, ör. "80000" = 8.0) →
     * okunur metin ("8.0"). Biçim tanınmazsa ham değer; boşsa null.
     */
    fun oneUiSurumu(ham: String?): String? {
        val s = ham?.trim().orEmpty()
        if (s.isEmpty() || s == "0") return null
        val n = s.toIntOrNull() ?: return s
        if (n < 10000) return s
        val ana = n / 10000
        val alt = (n % 10000) / 100
        return "$ana.$alt"
    }
}
