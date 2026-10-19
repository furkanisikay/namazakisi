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

    /**
     * Telefon → saat (TEK YÖNLÜ mesaj, saat W3 / inceleme bulgusu 7): telefondaki uyandırma
     * alarmı ("ikisi" ya da saatin yedeği) telefonda Kapat/Kıldım ile susturulunca
     * saatteki titreşim de durur — saatte kapatınca telefonun yedeğinin iptali ile simetrik.
     * Gövde = kimlik (UTF-8).
     */
    const val TELEFONDA_KAPANDI_YOLU = "/namazakisi/uyandirma/telefondaKapandi"

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

    /**
     * Bilekten açılan modun KAPANIŞ anı (inceleme bulgusu 3): bu kaynağın plan zinciri ya da
     * cami üst süresi gibi kendi zamanlaması yok → kapanış alarmı bitişten hemen sonraya
     * kurulur (bitiş anında kaynak zaten geçersizdir; +1 sn saat sapmasına pay). Kapatma
     * isteğinde alarm yok.
     */
    fun kapanisAlarmiMs(istek: ModIstegi): Long? = if (istek.ac) istek.bitisMs + 1_000L else null

    data class CamiCevabi(val cevap: String, val yerId: String)

    /** `{"cevap":"evet"|"hayir"|"camiDegil","yerId":…}` — yer kimliği ZORUNLU (bayat cevap ayıklansın). */
    fun camiCevabi(json: String?): CamiCevabi? {
        val o = nesne(json) ?: return null
        val cevap = o.optString("cevap").takeIf { it == "evet" || it == "hayir" || it == "camiDegil" } ?: return null
        val yer = o.optString("yerId").takeIf { it.isNotEmpty() } ?: return null
        return CamiCevabi(cevap, yer)
    }

    /**
     * Saat uyandırırken telefon yedeğinin gecikmesi ve pencere sonu payı (JS
     * `uyandirmaTelefonMs` ile AYNI kural; sabitler JS `SAAT_YEDEK_GECIKMESI_DK` /
     * `SAAT_YEDEK_SON_PAYI_MS` ile ortak fikstürde kilitli).
     */
    const val YEDEK_GECIKMESI_MS = 3 * 60_000L
    const val YEDEK_SON_PAYI_MS = 30_000L

    /** `sonMs` yoksa (eski saat) kaydın ömrü — en uzun pencere (yatsı) bile buna sığar. */
    const val VARSAYILAN_OMUR_MS = 12 * 60 * 60_000L

    data class UyandirmaIstegi(val id: String, val islem: String, val sonMs: Long? = null) {
        val nafile: Boolean get() = id.startsWith("nafile_")

        /**
         * ERTELE YOK (sahip kararı 2026-10-19, muhafızla aynı): güncelleme öncesi saat hâlâ
         * `ertele` gönderebilir. Anlamı "saatte susturuldu ama kişi uyandığını onaylamadı" →
         * telefon yedeğine DOKUNULMAZ (planlandığı anında çalar), depoya YAZILMAZ ve yeni
         * anına öksüz bir erteleme alarmı KURULMAZ.
         */
        val eskiErtele: Boolean get() = islem == "ertele"
    }

    /**
     * `{"id":…,"islem":"kapat"|"kildim","sonMs"?}` — kimlik YALNIZ uyandırma kimliği olabilir
     * (sabahın muhafız kimliği ya da teheccüd nafile kimliği): saat başka bir planı
     * susturamaz. Eski saatin `ertele`'si (`hedefMs`'li ya da değil) GEÇERLİ sayılır ama
     * yalnız `eskiErtele` olarak işlenir (yedek değişmez); reddedilseydi eski saat
     * kullanıcıya hata gösterirdi.
     */
    fun uyandirmaIstegi(json: String?): UyandirmaIstegi? {
        val o = nesne(json) ?: return null
        val islem = o.optString("islem").takeIf { it == "kapat" || it == "ertele" || it == "kildim" } ?: return null
        val id = o.optString("id")
        if (!uyandirmaKimligiMi(id)) return null
        val son = o.optLong("sonMs", 0L).takeIf { it > 0L }
        return UyandirmaIstegi(id, islem, son)
    }

    /** Uyandırma olabilecek kimlik mi? (sabahın muhafız kimliği ya da teheccüd nafile kimliği) */
    fun uyandirmaKimligiMi(id: String): Boolean =
        Regex("""^muhafiz_\d{4}-\d{2}-\d{2}_vakit_imsak_seviye_[1-4]_dk_\d+$""").matches(id) ||
            Regex("""^nafile_\d{4}-\d{2}-\d{2}_teheccud_\d+$""").matches(id)

    /**
     * Telefonun uyandırma CEVAP deposu (`SaatUyandirmaDeposu`, SharedPreferences) — SAF
     * dönüşümler. Kayıt: kimlik → `{islem:"kapat", sonMs}`. JS planlama turu bunu okur
     * (`saatUyandirmaDurumlariniCoz`): kapatılan yedek yeniden KURULMAZ. Ömrü dolan (`sonMs`
     * geçen) kayıt her yazım/okumada düşer. "kildim" de "kapat" olarak saklanır (yedek artık
     * hiç çalmamalı). Eski `ertele` isteği YAZILMAZ; güncelleme öncesinden kalan `ertele`
     * kaydı da süzgeçte DÜŞER (yedek özgün anına döner — JS ikizi aynı kayıtları atlar).
     */
    fun depoyaYaz(mevcut: String?, istek: UyandirmaIstegi, simdiMs: Long): String {
        val o = depoyuSuz(mevcut, simdiMs)
        if (istek.eskiErtele) return o.toString()
        val kayit = JSONObject()
            .put("islem", "kapat")
            .put("sonMs", istek.sonMs ?: (simdiMs + VARSAYILAN_OMUR_MS))
        o.put(istek.id, kayit)
        return o.toString()
    }

    /** Depodan ömrü dolmamış, biçimi sağlam `kapat` kayıtları. */
    fun depoyuSuz(ham: String?, simdiMs: Long): JSONObject {
        val giris = nesne(ham) ?: return JSONObject()
        val cikis = JSONObject()
        giris.keys().forEach { id ->
            val k = giris.optJSONObject(id) ?: return@forEach
            val son = k.optLong("sonMs", 0L)
            if (son <= simdiMs || k.optString("islem") != "kapat") return@forEach
            cikis.put(id, k)
        }
        return cikis
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
