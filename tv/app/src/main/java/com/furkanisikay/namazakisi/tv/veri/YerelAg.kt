package com.furkanisikay.namazakisi.tv.veri

import java.net.Inet4Address
import java.net.NetworkInterface

/** TV'nin yerel ağ adresi ve "yerel mi" kapısı (telefon da yalnız özel IPv4'e gönderir). */
object YerelAg {
    /** Kablolu ya da kablosuz ilk özel IPv4 adresi; yoksa `null` (TV ağa bağlı değil). */
    fun yerelIpv4(): String? = try {
        NetworkInterface.getNetworkInterfaces()?.toList().orEmpty()
            .filter { it.isUp && !it.isLoopback && !it.isVirtual }
            .sortedBy { if (it.name.startsWith("eth") || it.name.startsWith("wlan")) 0 else 1 }
            .flatMap { it.inetAddresses.toList() }
            .filterIsInstance<Inet4Address>()
            .map { it.hostAddress.orEmpty() }
            .firstOrNull { ozelMi(it) }
    } catch (e: Exception) {
        null
    }

    /** Katı: 0–255, başta sıfır yok, işaret yok (denetim D-06; telefon `ozelIpv4Mu` ikizi). */
    private val KATI = Regex("^(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$")

    fun ozelMi(adres: String): Boolean {
        if (!KATI.matches(adres)) return false
        val o = adres.split('.').map { it.toInt() }
        return o[0] == 10 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && o[1] in 16..31)
    }
}
