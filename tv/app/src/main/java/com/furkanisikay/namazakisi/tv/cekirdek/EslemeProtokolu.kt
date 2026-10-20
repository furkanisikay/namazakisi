package com.furkanisikay.namazakisi.tv.cekirdek

import org.json.JSONObject

/**
 * QR eşleştirme sözleşmesi, TV tarafı (telefon ikizi `src/core/tv/eslemeBaglantisi.ts`).
 *
 * TV ekranda `namazakisi://tv?v=1&a=<ip>&p=<port>&k=<anahtar>` QR'ı gösterir ve yalnız
 * eşleştirme ekranı açıkken o portu dinler. Telefon `POST /esle` ile `{v,k,ad,lat,lng}`
 * yollar. Sunucu, hesap, bulut YOK; veri yalnız evin yerel ağında iki cihaz arasında gider.
 *
 * Saf: Android sınıfı kullanmaz (org.json JVM testinde gerçek kütüphaneyle koşar).
 */
object EslemeProtokolu {
    const val SURUM = 1
    const val YOL = "/esle"
    const val AD_AZAMI = 60
    /** Başlık + gövde üst sınırı; fazlası okunmaz (kötü niyetli büyük istek belleği şişirmesin). */
    const val ISTEK_AZAMI_BAYT = 4096

    fun qrMetni(adres: String, port: Int, anahtar: String): String =
        "namazakisi://tv?v=$SURUM&a=$adres&p=$port&k=$anahtar"

    fun anahtarOlustur(rastgele: ByteArray): String {
        require(rastgele.size == 8) { "8 bayt gerekir" }
        return rastgele.joinToString("") { "%02x".format(it.toInt() and 0xff) }
    }

    sealed class Sonuc {
        data class Kabul(val ad: String, val lat: Double, val lng: Double) : Sonuc()
        data class Red(val hata: String) : Sonuc()
    }

    /** Telefonun gövdesini doğrular. Anahtar tutmazsa "anahtar", şekil bozuksa "veri". */
    fun govdeyiDogrula(govde: String, beklenenAnahtar: String): Sonuc {
        val o = try {
            JSONObject(govde)
        } catch (e: Exception) {
            return Sonuc.Red("veri")
        }
        if (o.optInt("v", -1) != SURUM) return Sonuc.Red("veri")
        if (o.optString("k") != beklenenAnahtar) return Sonuc.Red("anahtar")
        val lat = o.optDouble("lat", Double.NaN)
        val lng = o.optDouble("lng", Double.NaN)
        if (!lat.isFinite() || !lng.isFinite() || lat !in -90.0..90.0 || lng !in -180.0..180.0) return Sonuc.Red("veri")
        // (0,0) telefonda "konum henüz yok" nöbetçisidir: Gine Körfezi'ne göre vakit çizilmesin.
        if (lat == 0.0 && lng == 0.0) return Sonuc.Red("veri")
        val ad = adiTemizle(o.optString("ad"))
        if (ad.isEmpty()) return Sonuc.Red("veri")
        return Sonuc.Kabul(ad, lat, lng)
    }

    /** Denetim karakterlerini atar, kırpar, en çok 60 kod noktası (telefonla aynı kural). */
    fun adiTemizle(ad: String): String {
        val sb = StringBuilder()
        var i = 0
        while (i < ad.length) {
            val kod = ad.codePointAt(i)
            if (kod >= 0x20 && kod != 0x7f) sb.appendCodePoint(kod)
            i += Character.charCount(kod)
        }
        val kirpik = sb.toString().trim()
        val sayi = kirpik.codePointCount(0, kirpik.length)
        return if (sayi <= AD_AZAMI) kirpik else kirpik.substring(0, kirpik.offsetByCodePoints(0, AD_AZAMI)).trim()
    }

    /**
     * Ham HTTP isteğinin başlık bölümünü çözer. Yalnız `POST /esle` kabul edilir;
     * döner: gövde uzunluğu (Content-Length) ya da `null` (yanlış yol/yöntem, uzunluk yok ya da fazla).
     */
    fun basligiCoz(baslik: String): Int? {
        val satirlar = baslik.split("\r\n")
        val ilk = satirlar.firstOrNull()?.split(" ") ?: return null
        if (ilk.size < 2 || ilk[0] != "POST" || ilk[1].substringBefore('?') != YOL) return null
        val uzunluk = satirlar.drop(1)
            .firstOrNull { it.substringBefore(':').trim().equals("content-length", ignoreCase = true) }
            ?.substringAfter(':')?.trim()?.toIntOrNull() ?: return null
        return if (uzunluk in 1..ISTEK_AZAMI_BAYT) uzunluk else null
    }

    fun yanit(sonuc: Sonuc?): String {
        val (durum, govde) = when (sonuc) {
            is Sonuc.Kabul -> "200 OK" to "{\"ok\":true}"
            is Sonuc.Red -> (if (sonuc.hata == "anahtar") "403 Forbidden" else "400 Bad Request") to
                "{\"ok\":false,\"hata\":\"${sonuc.hata}\"}"
            null -> "400 Bad Request" to "{\"ok\":false,\"hata\":\"veri\"}"
        }
        val bayt = govde.toByteArray(Charsets.UTF_8).size
        return "HTTP/1.1 $durum\r\nContent-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: $bayt\r\nConnection: close\r\n\r\n$govde"
    }
}
