package com.furkanisikay.namazakisi.tv.veri

import android.os.Handler
import android.os.Looper
import com.furkanisikay.namazakisi.tv.cekirdek.EslemeProtokolu
import java.io.ByteArrayOutputStream
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket
import java.security.SecureRandom

/**
 * Eşleştirme ekranı açıkken yerel ağda dinleyen tek amaçlı, tek seferlik sunucu.
 *
 * - Yalnız ekran görünürken yaşar (`baslat`/`durdur` ekranın yaşam döngüsüne bağlı);
 *   uygulama arka plandayken hiçbir port açık kalmaz.
 * - Her açılışta yeni rastgele 64 bit anahtar → QR'ı görmeyen (aynı ağdaki başka biri)
 *   konum yazamaz. İlk kabul edilen istekten sonra sunucu kapanır.
 * - İstek boyutu `ISTEK_AZAMI_BAYT` ile, bağlantı süresi 5 sn ile sınırlı.
 */
class EslemeSunucusu(
    private val kabulEdildi: (ad: String, lat: Double, lng: Double) -> Unit,
    private val baglandi: () -> Unit,
) {
    private val ana = Handler(Looper.getMainLooper())
    @Volatile private var soket: ServerSocket? = null
    @Volatile private var bitti = false

    var anahtar: String = ""
        private set

    /** Dinlemeye başlar; QR metnini döner. Yerel ağ adresi yoksa `null` (TV ağa bağlı değil). */
    fun baslat(): String? {
        durdur()
        val adres = yerelIpv4() ?: return null
        val rastgele = ByteArray(8).also { SecureRandom().nextBytes(it) }
        anahtar = EslemeProtokolu.anahtarOlustur(rastgele)
        val s = try {
            ServerSocket().apply {
                reuseAddress = true
                bind(InetSocketAddress(0))
            }
        } catch (e: Exception) {
            return null
        }
        soket = s
        bitti = false
        Thread({ dinle(s, anahtar) }, "tv-esleme").apply { isDaemon = true }.start()
        return EslemeProtokolu.qrMetni(adres, s.localPort, anahtar)
    }

    fun durdur() {
        bitti = true
        try {
            soket?.close()
        } catch (_: Exception) {
        }
        soket = null
    }

    private fun dinle(s: ServerSocket, beklenen: String) {
        while (!bitti && !s.isClosed) {
            val baglanti = try {
                s.accept()
            } catch (e: Exception) {
                return
            }
            baglanti.use { if (isle(it, beklenen)) return }
        }
    }

    /** Döner: kabul edildi mi (sunucu kapanır). */
    private fun isle(b: Socket, beklenen: String): Boolean {
        b.soTimeout = 5000
        val giris = b.getInputStream()
        val tampon = ByteArrayOutputStream()
        var baslikSonu = -1
        val parca = ByteArray(1024)
        try {
            while (baslikSonu < 0 && tampon.size() < EslemeProtokolu.ISTEK_AZAMI_BAYT) {
                val n = giris.read(parca)
                if (n < 0) break
                tampon.write(parca, 0, n)
                baslikSonu = baslikSonunuBul(tampon.toByteArray())
            }
            if (baslikSonu < 0) return yanitla(b, null)
            val tum = tampon.toByteArray()
            val uzunluk = EslemeProtokolu.basligiCoz(String(tum, 0, baslikSonu, Charsets.ISO_8859_1))
                ?: return yanitla(b, null)
            ana.post(baglandi)
            val govde = ByteArrayOutputStream().apply { write(tum, baslikSonu + 4, tum.size - baslikSonu - 4) }
            while (govde.size() < uzunluk) {
                val n = giris.read(parca)
                if (n < 0) break
                govde.write(parca, 0, n)
            }
            if (govde.size() < uzunluk) return yanitla(b, null)
            val metin = String(govde.toByteArray(), 0, uzunluk, Charsets.UTF_8)
            val sonuc = EslemeProtokolu.govdeyiDogrula(metin, beklenen)
            yanitla(b, sonuc)
            if (sonuc is EslemeProtokolu.Sonuc.Kabul && !bitti) {
                bitti = true
                ana.post { kabulEdildi(sonuc.ad, sonuc.lat, sonuc.lng) }
                return true
            }
            return false
        } catch (e: Exception) {
            return false
        }
    }

    private fun yanitla(b: Socket, sonuc: EslemeProtokolu.Sonuc?): Boolean {
        try {
            b.getOutputStream().apply {
                write(EslemeProtokolu.yanit(sonuc).toByteArray(Charsets.UTF_8))
                flush()
            }
        } catch (_: Exception) {
        }
        return false
    }

    private fun baslikSonunuBul(b: ByteArray): Int {
        for (i in 0..b.size - 4) {
            if (b[i] == '\r'.code.toByte() && b[i + 1] == '\n'.code.toByte() &&
                b[i + 2] == '\r'.code.toByte() && b[i + 3] == '\n'.code.toByte()
            ) return i
        }
        return -1
    }

    companion object {
        /** Kablolu ya da kablosuz ilk özel IPv4 adresi (telefon da yalnız bu aralığa gönderir). */
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

        fun ozelMi(adres: String): Boolean {
            val o = adres.split('.').mapNotNull { it.toIntOrNull() }
            if (o.size != 4 || o.any { it !in 0..255 }) return false
            return o[0] == 10 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && o[1] in 16..31)
        }
    }
}
