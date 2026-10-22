package com.furkanisikay.namazakisi.tv.veri

import android.content.Context
import android.content.pm.ApplicationInfo
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.furkanisikay.namazakisi.tv.cekirdek.AgProtokolu
import com.furkanisikay.namazakisi.tv.cekirdek.AliciMantigi
import com.furkanisikay.namazakisi.tv.cekirdek.HizSiniri
import com.furkanisikay.namazakisi.tv.cekirdek.Yanit
import java.io.ByteArrayOutputStream
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.security.SecureRandom
import java.util.concurrent.Executors
import java.util.concurrent.Semaphore

/**
 * Cihaz ağı alıcı sunucusu (TV). Yalnız İHTİYAÇ VARKEN açıktır (pil + saldırı yüzeyi):
 * pano görünür VE eşleşik üye varsa, ya da eşleştirme ekranı açıksa. Aynı pencerede mDNS
 * (`_namazakisi._tcp`, TXT `i=<tvKimlik>`) yayınlanır → telefon adres değişince TV'yi bulur.
 *
 * Kapılar: yalnız yerel ağ / geri döngü (adb forward) istemcisi; eşzamanlı ≤ 3 bağlantı;
 * başlık + gövde ≤ 8 KB; 5 sn okuma süresi; IP başına artan bekleme (`HizSiniri`).
 * Yanlış anahtar / bilinmeyen üye / tekrar: GÖVDESİZ 403.
 */
class TvSunucusu(context: Context, val depo: UyeDeposu) {
    private val baglam = context.applicationContext
    private val ana = Handler(Looper.getMainLooper())
    private val rastgele = SecureRandom()
    val mantik = AliciMantigi(depo.tvKimlik, { depo.tvAdi() }, depo, { System.currentTimeMillis() }) { n ->
        ByteArray(n).also { rastgele.nextBytes(it) }
    }
    private val hiz = HizSiniri { System.currentTimeMillis() }
    private val islem = Executors.newFixedThreadPool(3)
    private val kapasite = Semaphore(3)
    @Volatile private var soket: ServerSocket? = null
    @Volatile private var nsdKaydi: NsdManager.RegistrationListener? = null

    /** Bir istek işlendi (ekran onay diyaloğunu / üye listesini tazelesin). Ana thread. */
    @Volatile var olay: (() -> Unit)? = null

    val port: Int get() = soket?.localPort ?: 0
    val acik: Boolean get() = soket != null

    @Synchronized
    fun ac(): Boolean {
        if (soket != null) return true
        return try {
            // KARARLI port (kimlikten): TV yeniden başlayınca iPhone (mDNS keşfi yok) eski adrese
            // ulaşabilsin. Port doluysa sistem seçer (Android telefon NSD ile yine bulur).
            val tercih = AgProtokolu.kararliPort(depo.tvKimlik)
            val s = try {
                ServerSocket().apply {
                    reuseAddress = true
                    bind(InetSocketAddress(tercih))
                }
            } catch (_: Exception) {
                ServerSocket().apply {
                    reuseAddress = true
                    bind(InetSocketAddress(0))
                }
            }
            soket = s
            Thread({ dinle(s) }, "cihaz-agi").apply { isDaemon = true }.start()
            nsdYayinla(s.localPort)
            true
        } catch (e: Exception) {
            Log.w(ETIKET, "Sunucu acilamadi: ${e.javaClass.simpleName}")
            false
        }
    }

    @Synchronized
    fun kapat() {
        nsdDurdur()
        try {
            soket?.close()
        } catch (_: Exception) {
        }
        soket = null
    }

    private fun dinle(s: ServerSocket) {
        while (!s.isClosed) {
            val b = try {
                s.accept()
            } catch (e: Exception) {
                return
            }
            if (!kapasite.tryAcquire()) {
                try { b.close() } catch (_: Exception) {}
                continue
            }
            islem.execute {
                try {
                    b.use { isle(it) }
                } finally {
                    kapasite.release()
                }
            }
        }
    }

    private fun isle(b: Socket) {
        val ip = (b.inetAddress as? Inet4Address)?.hostAddress ?: return
        if (!yerelMi(ip)) return
        if (!hiz.izinVar(ip)) {
            yanitla(b, Yanit(429))
            return
        }
        b.soTimeout = 5000
        try {
            val giris = b.getInputStream()
            val tampon = ByteArrayOutputStream()
            val parca = ByteArray(1024)
            var son = -1
            while (son < 0 && tampon.size() < 1024 + AgProtokolu.GOVDE_AZAMI) {
                val n = giris.read(parca)
                if (n < 0) break
                tampon.write(parca, 0, n)
                son = baslikSonu(tampon.toByteArray())
            }
            val tum = tampon.toByteArray()
            val istek = if (son >= 0) AgProtokolu.basligiCoz(String(tum, 0, son, Charsets.ISO_8859_1)) else null
            if (istek == null) {
                hiz.basarisiz(ip)
                yanitla(b, Yanit.BOZUK)
                return
            }
            val govde = ByteArrayOutputStream().apply { write(tum, son + 4, tum.size - son - 4) }
            while (govde.size() < istek.uzunluk) {
                val n = giris.read(parca)
                if (n < 0) break
                govde.write(parca, 0, n)
            }
            if (govde.size() < istek.uzunluk) {
                hiz.basarisiz(ip)
                yanitla(b, Yanit.BOZUK)
                return
            }
            val y = mantik.isle(istek.yol, String(govde.toByteArray(), 0, istek.uzunluk, Charsets.UTF_8))
            if (y.kod >= 400) hiz.basarisiz(ip) else hiz.basarili(ip)
            yanitla(b, y)
            if (y.kod < 400) ana.post { olay?.invoke() }
        } catch (e: Exception) {
            hiz.basarisiz(ip)
        }
    }

    private fun yanitla(b: Socket, y: Yanit) {
        try {
            b.getOutputStream().apply {
                write(AgProtokolu.yanitYaz(y).toByteArray(Charsets.UTF_8))
                flush()
            }
        } catch (_: Exception) {
        }
    }

    private fun baslikSonu(b: ByteArray): Int {
        for (i in 0..b.size - 4) {
            if (b[i] == 13.toByte() && b[i + 1] == 10.toByte() && b[i + 2] == 13.toByte() && b[i + 3] == 10.toByte()) return i
        }
        return -1
    }

    private fun yerelMi(ip: String): Boolean = ip.startsWith("127.") || YerelAg.ozelMi(ip)

    // ---- mDNS (NsdManager sistem servisidir: multicast kilidi / yeni izin GEREKMEZ) ----

    private fun nsdYayinla(port: Int) {
        try {
            val nsd = baglam.getSystemService(Context.NSD_SERVICE) as NsdManager
            val bilgi = NsdServiceInfo().apply {
                serviceName = "Namaz Akisi ${depo.tvKimlik.take(4)}"
                serviceType = SERVIS_TURU
                setPort(port)
                setAttribute("i", depo.tvKimlik)
            }
            val dinleyici = object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(info: NsdServiceInfo) {}
                override fun onRegistrationFailed(info: NsdServiceInfo, kod: Int) {
                    Log.w(ETIKET, "mDNS kaydi basarisiz: $kod")
                }
                override fun onServiceUnregistered(info: NsdServiceInfo) {}
                override fun onUnregistrationFailed(info: NsdServiceInfo, kod: Int) {}
            }
            nsd.registerService(bilgi, NsdManager.PROTOCOL_DNS_SD, dinleyici)
            nsdKaydi = dinleyici
        } catch (e: Exception) {
            Log.w(ETIKET, "mDNS yayinlanamadi: ${e.javaClass.simpleName}")
        }
    }

    private fun nsdDurdur() {
        val d = nsdKaydi ?: return
        nsdKaydi = null
        try {
            (baglam.getSystemService(Context.NSD_SERVICE) as NsdManager).unregisterService(d)
        } catch (_: Exception) {
        }
    }

    /** QR metni (v2). Yerel adres yoksa `null`. Hata ayıklanabilir derlemede loga yazılır (kare hattı). */
    fun qrMetni(sir: String): String? {
        val adres = YerelAg.yerelIpv4() ?: return null
        if (!ac()) return null
        val ad = java.net.URLEncoder.encode(depo.tvAdi(), "UTF-8").replace("+", "%20")
        val metin = "namazakisi://tv?v=2&a=$adres&p=$port&i=${depo.tvKimlik}&s=$sir&d=$ad"
        if ((baglam.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) Log.d("TvEsleme", "QR $metin")
        return metin
    }

    companion object {
        const val SERVIS_TURU = "_namazakisi._tcp"
        private const val ETIKET = "CihazAgi"
    }
}
