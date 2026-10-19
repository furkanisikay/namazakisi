package com.furkanisikay.namazakisi.saat.cekirdek

import org.json.JSONObject

/**
 * Saat → telefon KOMUTLARI ve telefondan gelen Camideyim/Namaz modu DURUMU (saat W3) — SAF.
 *
 * Telefon tarafının aynası: `android/app/.../cekirdek/SaatKomutKurallari.kt`. İki taraf
 * AYNI fikstürü kabul eder (`src/test/resources/saat-komut-ornekleri.json`). Yollar iki
 * tarafta SABİT; ekran metinleri kibar "siz" (arayüz dili).
 *
 * Saat yalnız GÖSTERİR ve KOMUT YOLLAR: Camideyim'in ve Namaz modunun tek doğru kaynağı
 * telefondaki native depodur (`CamiDepo`, `NamazModu`), saat kopya tutmaz.
 */
object TelefonKomutu {
    /** Telefon → saat: telefonda susturulan uyandırma (telefon `SaatKomutKurallari.TELEFONDA_KAPANDI_YOLU`). */
    const val TELEFONDA_KAPANDI_YOLU = "/namazakisi/uyandirma/telefondaKapandi"
    const val NAMAZ_MODU_YOLU = "/namazakisi/namazmodu"
    const val CAMI_CEVAP_YOLU = "/namazakisi/cami/cevap"
    const val UYANDIRMA_KAPANDI_YOLU = "/namazakisi/uyandirma/kapandi"
    const val CAMI_DURUM_YOLU = "/namazakisi/camidurum"

    /** Bilekten açılan mod en fazla bu kadar sürer (telefon da aynı tavanla kenetler). */
    const val SAAT_MODU_AZAMI_MS = 30 * 60_000L

    /** Telefona ulaşılamadı (bağlı telefon yok / istek başarısız) — yerel sonuç kodu. */
    const val ULASILAMADI = "ulasilamadi"

    /**
     * "Namaz modunu açın" isteği: şu an bir vaktin İÇİNDEYSEK (çıkışa sayıyorsak) o vaktin
     * kimliği ve sonu; değilse (güneş → öğle, yük yok) vakitsiz istek — telefon 30 dk'ya
     * kenetler ve "serbest" tur kimliği kurar.
     */
    fun namazModuAc(yuk: Yuk?, simdi: Long): String {
        val o = JSONObject().put("islem", "ac")
        val an = yuk?.let { VakitHesabi.sayilanAn(it, simdi) }
        if (an != null && an.mod == KalanSure.Mod.CIKIS) {
            o.put("tarih", an.tarih).put("vakit", an.vakit).put("bitisMs", minOf(an.hedef, simdi + SAAT_MODU_AZAMI_MS))
        } else {
            o.put("bitisMs", simdi + SAAT_MODU_AZAMI_MS)
        }
        return o.toString()
    }

    fun namazModuKapat(): String = JSONObject().put("islem", "kapat").toString()

    fun camiCevap(cevap: String, yerId: String): String = JSONObject().put("cevap", cevap).put("yerId", yerId).toString()

    /**
     * Uyandırma cevabı (telefon `SaatKomutKurallari.uyandirmaIstegi`): `kapat` | `kildim` +
     * `sonMs` (telefon cevabı pencere sonuna kadar saklar; JS planlama turu kapatılan yedeği
     * yeniden kurmasın). ERTELE YOK (2026-10-19): `ertele` artık üretilmez.
     */
    fun uyandirmaKapandi(id: String, islem: String, sonMs: Long): String =
        JSONObject().put("id", id).put("islem", islem).put("sonMs", sonMs).toString()

    data class Sonuc(val sonuc: String, val bitisMs: Long? = null)

    fun sonucCoz(json: String?): Sonuc = try {
        val o = JSONObject(json ?: "")
        Sonuc(o.getString("sonuc"), if (o.has("bitisMs")) o.getLong("bitisMs") else null)
    } catch (_: Exception) {
        Sonuc(ULASILAMADI)
    }

    /**
     * Namaz modu cevabının bilekteki metni. `saat` = "13:40" biçimli bitiş (çağıran biçimler);
     * saate hal eki EKLENMEZ (okunuşa göre değişir — AGENTS), "bitiş 13:40" yazılır.
     * Telefonda özellik kapalı ya da Rahatsız Etmeyin erişimi yoksa kişi telefonda bir kez
     * açmalı (izin ancak orada verilir).
     */
    fun modMetni(sonuc: String, saat: String?): String = when (sonuc) {
        "acildi" -> if (saat != null) "Namaz modu açık · bitiş $saat" else "Namaz modu açık"
        "kapandi" -> "Namaz modu kapandı"
        "kapali", "erisimYok" -> "Telefonunuzda Namaz modunu bir kez açın"
        ULASILAMADI -> "Telefonunuza ulaşılamadı"
        else -> "Namaz modu açılamadı. Telefonunuzdan deneyin"
    }

    /** Camideyim cevabının bilekteki sonuç metni. */
    fun camiMetni(cevap: String, sonuc: String): String = when (sonuc) {
        "tamam" -> when (cevap) {
            "evet" -> "Camide olduğunuz kaydedildi"
            "hayir" -> "Bu vakitte bir daha sorulmaz"
            else -> "Bu yer bir daha cami sayılmaz"
        }
        ULASILAMADI -> "Telefonunuza ulaşılamadı"
        "gecersiz" -> "Bu soru artık geçerli değil"
        else -> "İşlem yapılamadı. Telefonunuzdan deneyin"
    }

    /** Telefondan gelen gösterim durumu. */
    data class CamiDurumu(
        val camide: Yer?,
        val soru: Yer?,
        /** Namaz modunun bitişi; mod kapalıysa null. */
        val modBitisMs: Long?,
    ) {
        data class Yer(val yerId: String, val ad: String, val bitisMs: Long)

        /** Bitişler geçtiyse gösterilmez (telefonun kapanış haberi gecikse de). */
        fun gecerli(simdi: Long): CamiDurumu = CamiDurumu(
            camide = camide?.takeIf { it.bitisMs > simdi },
            soru = soru?.takeIf { it.bitisMs > simdi },
            modBitisMs = modBitisMs?.takeIf { it > simdi },
        )

        val bos: Boolean get() = camide == null && soru == null && modBitisMs == null
    }

    fun durumCoz(json: String?): CamiDurumu? = try {
        val o = JSONObject(json ?: "")
        fun yer(ad: String): CamiDurumu.Yer? = o.optJSONObject(ad)?.let {
            CamiDurumu.Yer(it.getString("yerId"), it.optString("ad", ""), it.getLong("bitisMs"))
        }
        CamiDurumu(yer("camide"), yer("soru"), if (o.isNull("modBitisMs")) null else o.getLong("modBitisMs"))
    } catch (_: Exception) {
        null
    }
}
