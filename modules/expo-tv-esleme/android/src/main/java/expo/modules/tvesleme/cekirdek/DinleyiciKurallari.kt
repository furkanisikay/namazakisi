package expo.modules.tvesleme.cekirdek

/**
 * Cihaz ağı DİNLEYİCİSİNİN (telefon / tablet; yalnız ön planda) saf kuralları. TV alıcısının
 * (`tv/…/cekirdek/AliciMantigi.kt`) kapılarının ikizi — ayrı Gradle kökleri olduğu için kod
 * paylaşılamaz; sözleşme sabitleri aynı tutulur ve JVM testiyle kilitlenir.
 *
 * Android import ETMEZ (JVM testi koşar).
 */
object DinleyiciKurallari {
    const val GOVDE_AZAMI = 8 * 1024
    const val BASLIK_AZAMI = 1024
    const val ES_ZAMANLI_AZAMI = 3
    val YOLLAR = setOf("/esle", "/esle-durum", "/esitle")

    data class Istek(val yol: String, val uzunluk: Int)

    /** Başlık bloğunu (boş satıra kadar) çözer; yalnız POST + bilinen yol + geçerli uzunluk. */
    fun baslikCoz(baslik: String): Istek? {
        val satirlar = baslik.split("\r\n")
        val ilk = satirlar.firstOrNull()?.split(" ") ?: return null
        if (ilk.size < 3 || ilk[0] != "POST" || !ilk[2].startsWith("HTTP/1.")) return null
        val yol = ilk[1]
        if (yol !in YOLLAR) return null
        val uzunluk = satirlar.drop(1)
            .firstOrNull { it.substringBefore(':').trim().equals("Content-Length", ignoreCase = true) }
            ?.substringAfter(':')?.trim()?.toIntOrNull() ?: return null
        return if (uzunluk in 1..GOVDE_AZAMI) Istek(yol, uzunluk) else null
    }

    /**
     * Eş YEREL mi? (IPv4 özel aralıklar, loopback, IPv4-eşlemeli IPv6, IPv6 link-local/ULA.)
     * `ham` = InetAddress.getAddress() baytları. İnternetten gelen bağlantı (port yönlendirme)
     * hiç okunmadan kapatılır.
     */
    fun yerelEsMi(ham: ByteArray): Boolean {
        val b = ham.map { it.toInt() and 0xff }
        if (b.size == 4) return ipv4Yerel(b)
        if (b.size != 16) return false
        val eslemeli = (0 until 10).all { b[it] == 0 } && b[10] == 0xff && b[11] == 0xff
        if (eslemeli) return ipv4Yerel(b.subList(12, 16))
        if ((0 until 15).all { b[it] == 0 } && b[15] == 1) return true // ::1
        return (b[0] == 0xfe && (b[1] and 0xc0) == 0x80) || (b[0] and 0xfe) == 0xfc
    }

    private fun ipv4Yerel(o: List<Int>): Boolean =
        o[0] == 10 || o[0] == 127 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && o[1] in 16..31)

    fun yanit(kod: Int, govde: String): String {
        val metin = when (kod) {
            200 -> "OK"; 202 -> "Accepted"; 400 -> "Bad Request"; 403 -> "Forbidden"; 409 -> "Conflict"
            413 -> "Payload Too Large"; 503 -> "Service Unavailable"; else -> "Error"
        }
        val bayt = govde.toByteArray(Charsets.UTF_8)
        return "HTTP/1.1 $kod $metin\r\nContent-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: ${bayt.size}\r\nConnection: close\r\n\r\n$govde"
    }

    /** JS'ten gelen yanıt kodu yalnız sözleşmedekiler; başka değer 503'e düşer. */
    fun yanitKodu(kod: Int): Int = if (kod in setOf(200, 202, 400, 403, 409)) kod else 503
}
