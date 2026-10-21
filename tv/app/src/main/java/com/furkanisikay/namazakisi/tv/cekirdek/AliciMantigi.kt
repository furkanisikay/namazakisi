package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject

/**
 * Cihaz ağı ALICISININ karar mantığı — soketten bağımsız, SAF (JVM testinde koşar). TV bugün
 * alıcı-only'dir; tablet gibi çift yönlü cihazlar aynı mantığı kullanacak.
 *
 * Yollar (yalnız POST):
 * - `/esle`        sırla şifreli `{cihaz, ist}` → 202; kumanda onayı istenir.
 * - `/esle-durum`  düz `{ist}` → sırla şifreli `{durum, u?, k?, tvAdi?}`.
 * - `/esitle`      üye zarfı `{v,u,n,iv,ct}` → 200 `{}`.
 * Yanlış anahtar, bilinmeyen üye, tekrar (n ≤ son görülen) ve bozuk gövde AYNI yanıtı alır:
 * gövdesiz 403 (üye kimliği ya da hata türü sızmasın). Hız sınırı çağıranda (`HizSiniri`).
 */
interface UyeDeposuArayuzu {
    fun anahtar(uye: String): ByteArray?
    fun sonN(uye: String): Long
    fun sonNYaz(uye: String, n: Long)
    /** Anahtarı güvenli saklar. Saklanamazsa (Keystore yok) `false` → eşleşme REDDEDİLİR, düz saklamaya düşülmez. */
    fun uyeEkle(uye: String, anahtar: ByteArray, cihazAdi: String): Boolean
    fun uyeSil(uye: String)
    /** Geçerli mesaj: ham yük metni + an. */
    fun mesajYaz(uye: String, yukMetni: String, simdiMs: Long)
}

data class Yanit(val kod: Int, val govde: String = "") {
    companion object {
        val SESSIZ_RED = Yanit(403)
        val BOZUK = Yanit(400)
    }
}

class AliciMantigi(
    private val aliciKimlik: String,
    private val aliciAdi: () -> String,
    private val depo: UyeDeposuArayuzu,
    private val saat: () -> Long,
    private val rastgele: (Int) -> ByteArray,
) {
    enum class OnayDurumu { BEKLIYOR, ONAY, RED }

    private class Oturum(val sir: ByteArray) {
        var istek: String? = null
        var cihazAdi: String? = null
        var istekMs: Long = 0
        var durum: OnayDurumu = OnayDurumu.BEKLIYOR
        var uye: String? = null
        var anahtar: ByteArray? = null
    }

    @Volatile private var oturum: Oturum? = null

    /** Keystore anahtarı saklayamadıysa ekran bunu SÖYLER (sessiz düşüş yok). */
    @Volatile var anahtarSaklanamadi: Boolean = false
        private set

    /** Kumanda onayı bekleyen cihaz adı (ekran diyaloğu bunu gösterir). */
    var onayBekleyen: String? = null
        private set

    /** Eşleştirme ekranı açılınca: yeni geçici sır. Döner: QR için base64url sır. */
    @Synchronized
    fun eslesmeyiAc(): String {
        val o = Oturum(rastgele(32))
        oturum = o
        onayBekleyen = null
        return CihazKanali.b64UrlYaz(o.sir)
    }

    @Synchronized
    fun eslesmeyiKapat() {
        oturum = null
        onayBekleyen = null
    }

    val eslesmeAcik: Boolean get() = oturum != null

    /** Kumanda kararı. Onayda üyeye özel anahtar ÜRETİLİR ve depoya yazılır. */
    @Synchronized
    fun karar(evet: Boolean): String? {
        val o = oturum ?: return null
        if (o.istek == null || o.durum != OnayDurumu.BEKLIYOR) return null
        onayBekleyen = null
        if (!evet) {
            o.durum = OnayDurumu.RED
            return null
        }
        val uye = rastgele(8).joinToString("") { "%02x".format(it.toInt() and 0xff) }
        val anahtar = rastgele(32)
        if (!depo.uyeEkle(uye, anahtar, o.cihazAdi ?: "Telefon")) {
            o.durum = OnayDurumu.RED
            anahtarSaklanamadi = true
            return null
        }
        o.uye = uye
        o.anahtar = anahtar
        o.durum = OnayDurumu.ONAY
        return uye
    }

    /** Onay telefona ulaştı mı (ulaştıysa ekran yeni QR üretir). */
    @Volatile var onayTeslimEdildi: Boolean = false
        private set

    @Synchronized
    fun isle(yol: String, govde: String): Yanit = when (yol) {
        "/esle" -> esle(govde)
        "/esle-durum" -> esleDurum(govde)
        "/esitle" -> esitle(govde)
        else -> Yanit.SESSIZ_RED
    }

    private fun esle(govde: String): Yanit {
        val o = oturum ?: return Yanit.SESSIZ_RED
        val z = json(govde) ?: return Yanit.SESSIZ_RED
        val duz = CihazKanali.coz(o.sir, z.optString("iv"), CihazKanali.esleIstekAad(aliciKimlik), z.optString("ct"))
            ?: return Yanit.SESSIZ_RED
        val icerik = json(duz) ?: return Yanit.SESSIZ_RED
        val ist = icerik.optString("ist")
        if (!ist.matches(Regex("^[0-9a-f]{16}$"))) return Yanit.SESSIZ_RED
        // 3 dakikada yanıtlanmayan bekleyen istek düşer (kumanda başında kimse yoksa ekran kilitlenmesin).
        if (o.istek != null && o.durum == OnayDurumu.BEKLIYOR && saat() - o.istekMs > 180_000) {
            o.istek = null
            onayBekleyen = null
        }
        // Aynı oturumda ikinci, FARKLI bir istek beklemedeyken kabul edilmez (diyaloğu ele geçirme yok).
        if (o.istek != null && o.istek != ist && o.durum == OnayDurumu.BEKLIYOR) return Yanit(409)
        if (o.istek == null) {
            o.istek = ist
            o.cihazAdi = EslemeProtokolu.adiTemizle(icerik.optString("cihaz")).ifEmpty { "Telefon" }.take(40)
            o.istekMs = saat()
            onayBekleyen = o.cihazAdi
        }
        return Yanit(202, "{\"durum\":\"bekliyor\"}")
    }

    private fun esleDurum(govde: String): Yanit {
        val o = oturum ?: return Yanit.SESSIZ_RED
        val ist = json(govde)?.optString("ist") ?: return Yanit.SESSIZ_RED
        if (ist != o.istek) return Yanit.SESSIZ_RED
        val ic = JSONObject()
        when (o.durum) {
            OnayDurumu.BEKLIYOR -> ic.put("durum", "bekliyor")
            OnayDurumu.RED -> ic.put("durum", "red")
            OnayDurumu.ONAY -> {
                ic.put("durum", "onay").put("u", o.uye).put("k", CihazKanali.b64(o.anahtar!!)).put("tvAdi", aliciAdi())
                onayTeslimEdildi = true
            }
        }
        val iv = rastgele(12)
        val ct = CihazKanali.sifrele(o.sir, iv, CihazKanali.esleYanitAad(aliciKimlik, ist), ic.toString())
        return Yanit(200, JSONObject().put("iv", CihazKanali.b64(iv)).put("ct", ct).toString())
    }

    /** Ekran onayın teslimini gördükten sonra çağırır: yeni sır, yeni QR. */
    @Synchronized
    fun oturumuYenile(): String {
        onayTeslimEdildi = false
        return eslesmeyiAc()
    }

    private fun esitle(govde: String): Yanit {
        val z = json(govde) ?: return Yanit.SESSIZ_RED
        if (z.optInt("v", -1) != CihazKanali.SURUM) return Yanit.SESSIZ_RED
        val uye = z.optString("u")
        val n = z.optLong("n", -1)
        val anahtar = depo.anahtar(uye) ?: return Yanit.SESSIZ_RED
        if (n <= depo.sonN(uye)) return Yanit.SESSIZ_RED
        val duz = CihazKanali.coz(anahtar, z.optString("iv"), CihazKanali.kanalAad(aliciKimlik, uye, n), z.optString("ct"))
            ?: return Yanit.SESSIZ_RED
        val yuk = CihazYukuCozucu.coz(duz) ?: return Yanit.SESSIZ_RED
        depo.sonNYaz(uye, n)
        if (yuk.sil) {
            depo.uyeSil(uye)
            return Yanit(200, "{}")
        }
        depo.mesajYaz(uye, duz, saat())
        return Yanit(200, "{}")
    }

    private fun json(s: String): JSONObject? = try {
        JSONObject(s)
    } catch (e: Exception) {
        null
    }
}

/**
 * IP başına hız sınırı: her başarısız (403/400) istek bekleme süresini ikiye katlar
 * (1 sn → … → 60 sn); başarılı istek sıfırlar. Bekleme içindeki istek hiç işlenmez.
 */
class HizSiniri(private val saat: () -> Long) {
    private data class Kayit(var basarisiz: Int, var serbestMs: Long)
    private val kayitlar = LinkedHashMap<String, Kayit>()

    @Synchronized
    fun izinVar(ip: String): Boolean = (kayitlar[ip]?.serbestMs ?: 0) <= saat()

    @Synchronized
    fun basarisiz(ip: String) {
        val k = kayitlar.getOrPut(ip) { Kayit(0, 0) }
        k.basarisiz = minOf(k.basarisiz + 1, 7)
        k.serbestMs = saat() + minOf(60_000L, 500L shl k.basarisiz)
        if (kayitlar.size > 64) kayitlar.remove(kayitlar.keys.first())
    }

    @Synchronized
    fun basarili(ip: String) {
        kayitlar.remove(ip)
    }
}

/** HTTP başlık çözümü (yalnız POST, bilinen yol, gövde ≤ 8 KB). */
object AgProtokolu {
    const val GOVDE_AZAMI = 8 * 1024
    val YOLLAR = setOf("/esle", "/esle-durum", "/esitle")

    data class Istek(val yol: String, val uzunluk: Int)

    fun basligiCoz(baslik: String): Istek? {
        val satirlar = baslik.split("\r\n")
        val ilk = satirlar.firstOrNull()?.split(" ") ?: return null
        if (ilk.size < 2 || ilk[0] != "POST") return null
        val yol = ilk[1].substringBefore('?')
        if (yol !in YOLLAR) return null
        val uzunluk = satirlar.drop(1)
            .firstOrNull { it.substringBefore(':').trim().equals("content-length", ignoreCase = true) }
            ?.substringAfter(':')?.trim()?.toIntOrNull() ?: return null
        return if (uzunluk in 1..GOVDE_AZAMI) Istek(yol, uzunluk) else null
    }

    fun yanitYaz(y: Yanit): String {
        val durum = when (y.kod) {
            200 -> "200 OK"
            202 -> "202 Accepted"
            400 -> "400 Bad Request"
            409 -> "409 Conflict"
            429 -> "429 Too Many Requests"
            else -> "403 Forbidden"
        }
        val bayt = y.govde.toByteArray(Charsets.UTF_8).size
        return "HTTP/1.1 $durum\r\nContent-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: $bayt\r\nConnection: close\r\n\r\n${y.govde}"
    }
}
