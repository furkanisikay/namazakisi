package expo.modules.tvesleme

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Handler
import android.os.Looper
import java.net.Inet4Address
import java.util.concurrent.atomic.AtomicBoolean

/**
 * `_namazakisi._tcp` hizmetlerini süre sınırlı arar ve çözer (TXT `i` = alıcı kimliği).
 *
 * NsdManager SİSTEM mDNS sunucusunu kullanır → uygulama multicast kilidi almaz, yeni izin
 * gerekmez (Android 17 / targetSdk 37'de `ACCESS_LOCAL_NETWORK` gerekecek — tasarım belgesi).
 * Sonuç bir DOĞRULAMA değildir: çağıran yeni adresi ancak şifreli el sıkışma başarılı olunca
 * kaydeder (tasarım §4.2). Keşif her yolda (`finally` gibi) durdurulur.
 */
internal class NsdKesfi(baglam: Context) {
    data class Bulunan(val kimlik: String, val adres: String, val port: Int)

    private val nsd = baglam.getSystemService(Context.NSD_SERVICE) as NsdManager
    private val ana = Handler(Looper.getMainLooper())

    fun bul(sureMs: Long, bitti: (List<Bulunan>) -> Unit) {
        val bulunanlar = LinkedHashMap<String, Bulunan>()
        val cozulecek = ArrayDeque<NsdServiceInfo>()
        val cozuluyor = AtomicBoolean(false)
        val kapandi = AtomicBoolean(false)

        fun sonrakiniCoz() {
            if (kapandi.get() || !cozuluyor.compareAndSet(false, true)) return
            val bilgi = synchronized(cozulecek) { cozulecek.removeFirstOrNull() }
            if (bilgi == null) {
                cozuluyor.set(false)
                return
            }
            try {
                @Suppress("DEPRECATION")
                nsd.resolveService(bilgi, object : NsdManager.ResolveListener {
                    override fun onResolveFailed(info: NsdServiceInfo, kod: Int) {
                        cozuluyor.set(false)
                        sonrakiniCoz()
                    }

                    override fun onServiceResolved(info: NsdServiceInfo) {
                        val kimlik = info.attributes["i"]?.toString(Charsets.UTF_8)
                        @Suppress("DEPRECATION")
                        val adres = (info.host as? Inet4Address)?.hostAddress
                        if (kimlik != null && adres != null) {
                            synchronized(bulunanlar) { bulunanlar[kimlik] = Bulunan(kimlik, adres, info.port) }
                        }
                        cozuluyor.set(false)
                        sonrakiniCoz()
                    }
                })
            } catch (e: Exception) {
                cozuluyor.set(false)
            }
        }

        val kesif = object : NsdManager.DiscoveryListener {
            override fun onDiscoveryStarted(tur: String) {}
            override fun onDiscoveryStopped(tur: String) {}
            override fun onStartDiscoveryFailed(tur: String, kod: Int) {}
            override fun onStopDiscoveryFailed(tur: String, kod: Int) {}
            override fun onServiceLost(info: NsdServiceInfo) {}
            override fun onServiceFound(info: NsdServiceInfo) {
                synchronized(cozulecek) { cozulecek.addLast(info) }
                sonrakiniCoz()
            }
        }

        try {
            nsd.discoverServices("_namazakisi._tcp", NsdManager.PROTOCOL_DNS_SD, kesif)
        } catch (e: Exception) {
            bitti(emptyList())
            return
        }
        ana.postDelayed({
            kapandi.set(true)
            try {
                nsd.stopServiceDiscovery(kesif)
            } catch (_: Exception) {
            }
            bitti(synchronized(bulunanlar) { bulunanlar.values.toList() })
        }, sureMs)
    }
}
