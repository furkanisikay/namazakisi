package com.furkanisikay.namazakisi.cekirdek

import org.json.JSONObject

/**
 * "Kıldım" otomasyon GÜVEN LİSTESİ (issue #299) — SAF kurallar
 * (JVM testi: KildimGuvenKurallariTest).
 *
 * Dış girişler (`KildimKisayolActivity`, `namazakisi://kildim` derin bağlantısı)
 * cihazdaki herhangi bir uygulamadan gelebilir. Eskiden ana ekran dışındaki HER
 * istek onay soruyordu → Samsung Rutinler / Tasker ile kurulan otomasyon her
 * seferinde manuele düşüyordu. Yeni model: karar PAKET BAŞINA saklanır.
 *
 *  - Kendi paketimiz ya da ana ekran uygulaması → doğrudan (kullanıcının kendi dokunuşu).
 *  - Kayıtlı "izin" → doğrudan; kayıtlı "engel" → sessizce yok sayılır.
 *  - Kayıt yok → tek seferlik soru: [Her zaman izin ver] [Yalnız bu sefer] [Engelle].
 *  - TARAYICI: "her zaman" SUNULMAZ (kayıt olsa da sayılmaz) — tarayıcıya kalıcı izin,
 *    açtığı HER web sayfasına sessiz işaretleme yetkisi vermek olurdu.
 *  - Başlatan bilinmiyor (referrer yok ya da uydurulabilir `EXTRA_REFERRER` eki var):
 *    kimlik yoktur, karar saklanamaz → yalnız "bu sefer" sorusu.
 */
object KildimGuvenKurallari {

    enum class Karar(val kod: String) {
        IZIN("izin"),
        ENGEL("engel");

        companion object {
            fun koddan(kod: String?): Karar? = values().firstOrNull { it.kod == kod }
        }
    }

    enum class KaynakSinifi { KENDI, ANA_EKRAN, TARAYICI, UYGULAMA, BILINMIYOR }

    sealed class Eylem {
        object Dogrudan : Eylem()
        object YokSay : Eylem()
        /** Kullanıcıya sor; hangi kalıcı seçeneklerin sunulacağı. */
        data class Sor(val herZamanSunulur: Boolean, val engelSunulur: Boolean) : Eylem()
    }

    data class Kayit(val paket: String, val karar: Karar, val ad: String, val zamanMs: Long)

    /**
     * @param referrerEkiVar intent `EXTRA_REFERRER`/`EXTRA_REFERRER_NAME` taşıyor — bunu
     *   ÇAĞIRAN yazar, `getReferrer()` önce ona bakar; varsa başlatana güvenilmez.
     */
    fun siniflandir(
        paket: String?,
        referrerEkiVar: Boolean,
        kendiPaketi: String,
        anaEkranMi: Boolean,
        tarayiciMi: Boolean,
    ): KaynakSinifi = when {
        referrerEkiVar || paket.isNullOrEmpty() -> KaynakSinifi.BILINMIYOR
        paket == kendiPaketi -> KaynakSinifi.KENDI
        anaEkranMi -> KaynakSinifi.ANA_EKRAN
        tarayiciMi -> KaynakSinifi.TARAYICI
        else -> KaynakSinifi.UYGULAMA
    }

    fun eylem(sinif: KaynakSinifi, kayitli: Karar?): Eylem = when (sinif) {
        KaynakSinifi.KENDI, KaynakSinifi.ANA_EKRAN -> Eylem.Dogrudan
        KaynakSinifi.BILINMIYOR -> Eylem.Sor(herZamanSunulur = false, engelSunulur = false)
        KaynakSinifi.TARAYICI ->
            if (kayitli == Karar.ENGEL) Eylem.YokSay else Eylem.Sor(herZamanSunulur = false, engelSunulur = true)
        KaynakSinifi.UYGULAMA -> when (kayitli) {
            Karar.IZIN -> Eylem.Dogrudan
            Karar.ENGEL -> Eylem.YokSay
            null -> Eylem.Sor(herZamanSunulur = true, engelSunulur = true)
        }
    }

    /** Kalıcı karar yazılabilir mi? (Bilinmeyen başlatana ve tarayıcıya "izin" yazılmaz.) */
    fun kaydedilebilirMi(sinif: KaynakSinifi, karar: Karar): Boolean = when (sinif) {
        KaynakSinifi.UYGULAMA -> true
        KaynakSinifi.TARAYICI -> karar == Karar.ENGEL
        else -> false
    }

    fun kaydet(liste: Map<String, Kayit>, kayit: Kayit): Map<String, Kayit> = liste + (kayit.paket to kayit)

    fun kaldir(liste: Map<String, Kayit>, paket: String): Map<String, Kayit> = liste - paket

    /** Ayarlar listesi: önce izinliler, sonra engelliler; her grupta ada göre. */
    fun sirali(liste: Map<String, Kayit>): List<Kayit> =
        liste.values.sortedWith(compareBy<Kayit>({ it.karar.ordinal }, { it.ad.lowercase() }, { it.paket }))

    // --- Kalıcılık biçimi: {"<paket>": {"k": "izin"|"engel", "a": "<ad>", "t": <ms>}} ---

    private val PAKET_DESENI = Regex("""^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$""")

    fun paketGecerliMi(paket: String?): Boolean = paket != null && PAKET_DESENI.matches(paket)

    /** Bozuk/eksik kayıt sessizce düşer; tamamen bozuk metin boş listedir (asla fırlatmaz). */
    fun jsondanOku(ham: String?): Map<String, Kayit> {
        if (ham.isNullOrBlank()) return emptyMap()
        val kok = try {
            JSONObject(ham)
        } catch (_: Exception) {
            return emptyMap()
        }
        val sonuc = LinkedHashMap<String, Kayit>()
        kok.keys().forEach { paket ->
            val o = kok.optJSONObject(paket) ?: return@forEach
            val karar = Karar.koddan(o.optString("k")) ?: return@forEach
            if (!paketGecerliMi(paket)) return@forEach
            val ad = o.optString("a").ifBlank { paket }
            sonuc[paket] = Kayit(paket, karar, ad, o.optLong("t", 0L))
        }
        return sonuc
    }

    fun jsonaYaz(liste: Map<String, Kayit>): String {
        val kok = JSONObject()
        liste.values.forEach {
            kok.put(it.paket, JSONObject().put("k", it.karar.kod).put("a", it.ad).put("t", it.zamanMs))
        }
        return kok.toString()
    }
}
