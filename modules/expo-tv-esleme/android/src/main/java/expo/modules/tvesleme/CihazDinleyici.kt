package expo.modules.tvesleme

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.util.Log
import expo.modules.tvesleme.cekirdek.DinleyiciKurallari
import java.io.ByteArrayOutputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicLong

/**
 * Cihaz ağı dinleyicisi (telefon ↔ tablet) — YALNIZ ÖN PLANDA açık (JS AppState'e bağlar).
 * Şifre çözme ve karar JS'tedir (tek uygulama; anahtarlar secure-store'da): native yalnız
 * kapıları uygular (yerel eş, ≤ 3 bağlantı, başlık ≤ 1 KB, gövde ≤ 8 KB, 5 sn okuma) ve isteği
 * olayla JS'e verir; JS 8 sn içinde `yanitla` demezse 503.
 *
 * mDNS: `NsdManager.registerService` (sistem servisi → multicast kilidi / yeni izin YOK),
 * tür `_namazakisi._tcp`, TXT `i=<kimlik>` + `t=cihaz` (TV'den ayırt edilsin).
 */
class CihazDinleyici(
    private val baglam: Context,
    private val olay: (Map<String, Any>) -> Unit,
) {
    private var soket: ServerSocket? = null
    private var kayit: NsdManager.RegistrationListener? = null
    private val bekleyenler = ConcurrentHashMap<String, CompletableFuture<Pair<Int, String>>>()
    private val sayac = AtomicLong(0)
    private val kapasite = Semaphore(DinleyiciKurallari.ES_ZAMANLI_AZAMI)

    @Synchronized
    fun baslat(kimlik: String, ad: String, tercihPort: Int): Int {
        soket?.let { return it.localPort }
        // Kararlı port (kimlikten): eş yeniden başlayınca da aynı adreste bulunsun (iOS keşif yapmaz).
        val s = try {
            ServerSocket(tercihPort)
        } catch (_: Exception) {
            ServerSocket(0)
        }
        soket = s
        Thread({ kabulDongusu(s) }, "CihazDinleyici").apply { isDaemon = true }.start()
        nsdYayinla(kimlik, ad, s.localPort)
        return s.localPort
    }

    @Synchronized
    fun durdur() {
        try {
            soket?.close()
        } catch (_: Exception) {
        }
        soket = null
        kayit?.let { d ->
            try {
                (baglam.getSystemService(Context.NSD_SERVICE) as NsdManager).unregisterService(d)
            } catch (_: Exception) {
            }
        }
        kayit = null
        bekleyenler.values.forEach { it.complete(503 to "") }
        bekleyenler.clear()
    }

    fun yanitla(id: String, kod: Int, govde: String) {
        bekleyenler.remove(id)?.complete(DinleyiciKurallari.yanitKodu(kod) to govde)
    }

    private fun kabulDongusu(s: ServerSocket) {
        while (!s.isClosed) {
            val baglanti = try {
                s.accept()
            } catch (_: Exception) {
                break
            }
            if (!kapasite.tryAcquire()) {
                try { baglanti.close() } catch (_: Exception) {}
                continue
            }
            Thread({
                try {
                    isle(baglanti)
                } finally {
                    kapasite.release()
                }
            }, "CihazDinleyiciIstek").apply { isDaemon = true }.start()
        }
    }

    private fun isle(b: Socket) {
        b.use { s ->
            try {
                // İnternetten gelen (port yönlendirmeli) bağlantı hiç okunmaz.
                if (!DinleyiciKurallari.yerelEsMi(s.inetAddress.address)) return
                s.soTimeout = 5000
                val giris = s.getInputStream()
                val tampon = ByteArrayOutputStream()
                val parca = ByteArray(1024)
                var ayrac = -1
                while (ayrac < 0 && tampon.size() < DinleyiciKurallari.BASLIK_AZAMI + DinleyiciKurallari.GOVDE_AZAMI) {
                    val n = giris.read(parca)
                    if (n < 0) break
                    tampon.write(parca, 0, n)
                    ayrac = String(tampon.toByteArray(), Charsets.ISO_8859_1).indexOf("\r\n\r\n")
                }
                if (ayrac < 0 || ayrac > DinleyiciKurallari.BASLIK_AZAMI) return yaz(s, 400, "")
                val ham = tampon.toByteArray()
                val istek = DinleyiciKurallari.baslikCoz(String(ham, 0, ayrac, Charsets.ISO_8859_1))
                    ?: return yaz(s, 400, "")
                val govde = ByteArrayOutputStream().apply { write(ham, ayrac + 4, ham.size - ayrac - 4) }
                while (govde.size() < istek.uzunluk) {
                    val n = giris.read(parca)
                    if (n < 0) break
                    govde.write(parca, 0, n)
                }
                if (govde.size() < istek.uzunluk) return yaz(s, 400, "")
                val metin = String(govde.toByteArray(), 0, istek.uzunluk, Charsets.UTF_8)
                val id = "i${sayac.incrementAndGet()}"
                val gelecek = CompletableFuture<Pair<Int, String>>()
                bekleyenler[id] = gelecek
                olay(mapOf("id" to id, "yol" to istek.yol, "govde" to metin, "ip" to (s.inetAddress.hostAddress ?: "").removePrefix("::ffff:")))
                val (kod, yanit) = try {
                    gelecek.get(8, TimeUnit.SECONDS)
                } catch (_: Exception) {
                    bekleyenler.remove(id)
                    503 to ""
                }
                yaz(s, kod, yanit)
            } catch (e: Exception) {
                Log.w(ETIKET, "Istek islenemedi: ${e.javaClass.simpleName}")
            }
        }
    }

    private fun yaz(s: Socket, kod: Int, govde: String) {
        s.getOutputStream().apply {
            write(DinleyiciKurallari.yanit(kod, govde).toByteArray(Charsets.UTF_8))
            flush()
        }
    }

    private fun nsdYayinla(kimlik: String, ad: String, port: Int) {
        try {
            val nsd = baglam.getSystemService(Context.NSD_SERVICE) as NsdManager
            val bilgi = NsdServiceInfo().apply {
                serviceName = ad.take(40).ifBlank { "Namaz Akışı" }
                serviceType = "_namazakisi._tcp"
                setPort(port)
                setAttribute("i", kimlik)
                setAttribute("t", "cihaz")
            }
            val dinleyici = object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(p0: NsdServiceInfo) {}
                override fun onRegistrationFailed(p0: NsdServiceInfo, kod: Int) {
                    Log.w(ETIKET, "mDNS kaydi basarisiz: $kod")
                }
                override fun onServiceUnregistered(p0: NsdServiceInfo) {}
                override fun onUnregistrationFailed(p0: NsdServiceInfo, kod: Int) {}
            }
            nsd.registerService(bilgi, NsdManager.PROTOCOL_DNS_SD, dinleyici)
            kayit = dinleyici
        } catch (e: Exception) {
            Log.w(ETIKET, "mDNS yayinlanamadi: ${e.javaClass.simpleName}")
        }
    }

    private companion object {
        const val ETIKET = "CihazDinleyici"
    }
}
