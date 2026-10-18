package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject

/**
 * Saat → telefon KOMUTLARI ve telefon → saat Camideyim/Namaz modu DURUMU (saat W3) — SAF,
 * `android.*` import etmez (JVM testi `SaatKomutKurallariTest`).
 *
 * Saat tarafının aynası `wear/.../cekirdek/TelefonKomutu.kt`; iki taraf AYNI fikstürü
 * (`wear/app/src/test/resources/saat-komut-ornekleri.json`) kabul eder. Yollar iki tarafta
 * SABİTTİR; telefonun manifest filtresi (`WearDinleyiciServisi`) ve saatinki
 * (`TelefonDinleyiciServisi`) bu yolları ayrıca listeler — yol eklersen filtreye de ekle.
 *
 * Komutlar `MessageClient.sendRequest` (RPC) ile gelir, cevap aynı turda döner: saat
 * sessiz başarısızlık göstermez. Saatin değerlerine GÜVENİLMEZ: bitiş burada kenetlenir.
 */
object SaatKomutKurallari {
    const val NAMAZ_MODU_YOLU = "/namazakisi/namazmodu"
    const val CAMI_CEVAP_YOLU = "/namazakisi/cami/cevap"
    const val UYANDIRMA_KAPANDI_YOLU = "/namazakisi/uyandirma/kapandi"
    const val CAMI_DURUM_YOLU = "/namazakisi/camidurum"

    /** Bilekten açılan Namaz modu en fazla bu kadar sürer (vaktin sonu daha erkense o). */
    const val SAAT_MODU_AZAMI_MS = 30 * 60_000L

    /** Namaz modu kaynak adı (`NamazModu.ac`). */
    const val KAYNAK = "saat"

    private val TARIH = Regex("""^\d{4}-\d{2}-\d{2}$""")
    private val VAKITLER = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")

    data class ModIstegi(val ac: Boolean, val tur: String, val bitisMs: Long)

    /**
     * `{"islem":"ac","tarih":…,"vakit":…,"bitisMs":…}` | `{"islem":"kapat"}`.
     * Tur `saat:<tarih>_<vakit>`; vakit yoksa/geçersizse `saat:<takvimGünü>_serbest`
     * (`IzlemeKarari.camiTuru`'nun serbest biçimi). Bitiş `min(istenen, şimdi + 30 dk)`;
     * geçmişe düşen istek reddedilir (null) — mod süresiz/geçmiş bitişle AÇILMAZ.
     */
    fun namazModuIstegi(json: String?, simdiMs: Long, takvimGunu: String): ModIstegi? {
        val o = nesne(json) ?: return null
        return when (o.optString("islem")) {
            "kapat" -> ModIstegi(false, "", 0L)
            "ac" -> {
                val tarih = o.optString("tarih").takeIf { TARIH.matches(it) }
                val vakit = o.optString("vakit").takeIf { it in VAKITLER }
                val tur = if (tarih != null && vakit != null) "$KAYNAK:${tarih}_$vakit" else "$KAYNAK:${takvimGunu}_serbest"
                val ust = simdiMs + SAAT_MODU_AZAMI_MS
                val istenen = if (o.has("bitisMs")) o.optLong("bitisMs", ust) else ust
                val bitis = minOf(istenen, ust)
                if (bitis <= simdiMs) null else ModIstegi(true, tur, bitis)
            }
            else -> null
        }
    }

    data class CamiCevabi(val cevap: String, val yerId: String)

    /** `{"cevap":"evet"|"hayir"|"camiDegil","yerId":…}` — yer kimliği ZORUNLU (bayat cevap ayıklansın). */
    fun camiCevabi(json: String?): CamiCevabi? {
        val o = nesne(json) ?: return null
        val cevap = o.optString("cevap").takeIf { it == "evet" || it == "hayir" || it == "camiDegil" } ?: return null
        val yer = o.optString("yerId").takeIf { it.isNotEmpty() } ?: return null
        return CamiCevabi(cevap, yer)
    }

    data class UyandirmaIstegi(val id: String, val islem: String) {
        val nafile: Boolean get() = id.startsWith("nafile_")
    }

    /**
     * `{"id":…,"islem":"kapat"|"ertele"|"kildim"}` — kimlik YALNIZ uyandırma kimliği olabilir
     * (sabahın muhafız kimliği ya da teheccüd nafile kimliği): saat başka bir planı susturamaz.
     */
    fun uyandirmaIstegi(json: String?): UyandirmaIstegi? {
        val o = nesne(json) ?: return null
        val islem = o.optString("islem").takeIf { it == "kapat" || it == "ertele" || it == "kildim" } ?: return null
        val id = o.optString("id")
        val gecerli = Regex("""^muhafiz_\d{4}-\d{2}-\d{2}_vakit_imsak_seviye_[1-4]_dk_\d+$""").matches(id) ||
            Regex("""^nafile_\d{4}-\d{2}-\d{2}_teheccud_\d+$""").matches(id)
        return if (gecerli) UyandirmaIstegi(id, islem) else null
    }

    /** Cevap gövdesi: `{"sonuc":…}` (+ açıldıysa `bitisMs`). */
    fun cevap(sonuc: String, bitisMs: Long? = null): String =
        JSONObject().put("sonuc", sonuc).apply { if (bitisMs != null) put("bitisMs", bitisMs) }.toString()

    data class CamideBilgisi(val yerId: String, val ad: String, val bitisMs: Long)
    data class SoruBilgisi(val yerId: String, val ad: String, val bitisMs: Long)

    /**
     * Saate giden DURUM (`/namazakisi/camidurum`) — ana yükten AYRI ve küçük (ana yük her
     * değişimde "yeni" olmasın). Yalnız GÖSTERİM içindir; saat kopya tutmaz, komut yollar.
     * Alanlar yoksa `null` yazılır (anahtar kümesi sabit).
     */
    fun durumJson(camide: CamideBilgisi?, soru: SoruBilgisi?, modBitisMs: Long?): String =
        JSONObject()
            .put("camide", camide?.let { JSONObject().put("yerId", it.yerId).put("ad", it.ad).put("bitisMs", it.bitisMs) } ?: JSONObject.NULL)
            .put("soru", soru?.let { JSONObject().put("yerId", it.yerId).put("ad", it.ad).put("bitisMs", it.bitisMs) } ?: JSONObject.NULL)
            .put("modBitisMs", modBitisMs ?: JSONObject.NULL)
            .toString()

    private fun nesne(json: String?): JSONObject? = try {
        if (json.isNullOrBlank()) null else JSONObject(json)
    } catch (_: Exception) {
        null
    }
}
