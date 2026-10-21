package expo.modules.tvesleme

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream
import java.net.InetSocketAddress
import java.net.Socket

/**
 * Android TV eşleştirmesi (telefon tarafı) — iki iş:
 *
 * 1. `qrOku`: kendi tarayıcımız (`QrTaramaActivity`: CameraX + ZXing, cihaz içi; ML Kit YOK).
 *    İptal → `null`. Kamera açılamazsa `TARAYICI_YOK` → ekran kodla aktarmayı önerir.
 *
 * 2. `gonder`: aynı yerel ağdaki TV'ye ham soketle tek bir HTTP POST. Neden ham soket:
 *    uygulamanın ağ güvenliği yapılandırması düz metin HTTP'ye izin VERMEZ (doğru olan bu)
 *    ve OkHttp/HttpURLConnection o kurala uyar; `java.net.Socket` uymaz. Hedefin yalnız özel
 *    IPv4 olduğu JS'te (`tvQrCoz`) ve burada ikinci kez denetlenir — kötü niyetli bir QR
 *    konumu internete yollatamaz. Yanıt 2 KB ile, süre parametreyle sınırlı.
 */
class ExpoTvEslemeModule : Module() {
    /** Ana thread (OnActivityResult) ile modül kuyruğu arasında görünür olsun. */
    @Volatile
    private var bekleyenOkuma: Promise? = null

    @Volatile
    private var dinleyici: CihazDinleyici? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoTvEsleme")

        AsyncFunction("qrOku") { promise: Promise ->
            val aktivite = appContext.currentActivity
            if (aktivite == null) {
                promise.reject("TARAYICI_YOK", "Etkinlik yok", null)
                return@AsyncFunction
            }
            // Yeniden-giriş: ikinci çağrı ilk promise'i sahipsiz bırakmasın (SesSecici dersi).
            if (bekleyenOkuma != null) {
                promise.resolve(null)
                return@AsyncFunction
            }
            try {
                bekleyenOkuma = promise
                aktivite.startActivityForResult(QrTaramaActivity.niyet(aktivite), QrTaramaActivity.ISTEK_KODU)
            } catch (e: Exception) {
                bekleyenOkuma = null
                promise.reject("TARAYICI_YOK", e.message, e)
            }
        }

        OnActivityResult { _, payload ->
            if (payload.requestCode != QrTaramaActivity.ISTEK_KODU) return@OnActivityResult
            val promise = bekleyenOkuma ?: return@OnActivityResult
            bekleyenOkuma = null
            try {
                when (payload.resultCode) {
                    android.app.Activity.RESULT_OK -> promise.resolve(payload.data?.getStringExtra(QrTaramaActivity.EKSTRA_METIN))
                    android.app.Activity.RESULT_FIRST_USER -> promise.reject("TARAYICI_YOK", "Kamera açılamadı", null)
                    else -> promise.resolve(null)
                }
            } catch (e: Exception) {
                promise.resolve(null)
            }
        }

        // v1 (yalnız konum, #359): yol sabit `/esle`, yanıt gövdesi döner. Geriye uyum için durur.
        AsyncFunction("gonder") { adres: String, port: Int, govde: String, zamanAsimiMs: Int ->
            istekGonder(adres, port, "/esle", govde, zamanAsimiMs).second
        }

        // Cihaz ağı v2: yol seçilir (`/esle`, `/esle-durum`, `/esitle`), durum kodu + gövde döner
        // (403 = sessiz red: TV bu telefonu kaldırmış ya da anahtar tutmuyor).
        AsyncFunction("istek") { adres: String, port: Int, yol: String, govde: String, zamanAsimiMs: Int ->
            if (yol !in setOf("/esle", "/esle-durum", "/esitle")) throw IllegalArgumentException("Bilinmeyen yol")
            val (kod, yanit) = istekGonder(adres, port, yol, govde, zamanAsimiMs)
            mapOf("kod" to kod, "govde" to yanit)
        }

        // Cihaz ağı dinleyicisi (tablet ↔ telefon): YALNIZ ön planda (JS AppState). Karar ve
        // şifre JS'te; native kapıları uygular ve isteği `onCihazIstegi` olayıyla verir.
        Events("onCihazIstegi")

        AsyncFunction("dinleyiciBaslat") { kimlik: String, ad: String ->
            if (!Regex("^[0-9a-f]{16}$").matches(kimlik)) throw IllegalArgumentException("Kimlik")
            val baglam = appContext.reactContext ?: throw IllegalStateException("Bağlam yok")
            val d = dinleyici ?: CihazDinleyici(baglam) { sendEvent("onCihazIstegi", it) }.also { dinleyici = it }
            d.baslat(kimlik, ad)
        }

        /** Bu cihazın yerel ağ IPv4'ü (QR'a yazılır); Wi-Fi/Ethernet yoksa null. */
        AsyncFunction("yerelAdres") {
            try {
                java.net.NetworkInterface.getNetworkInterfaces().toList()
                    .filter { it.isUp && !it.isLoopback && !it.isVirtual }
                    .sortedBy { if (it.name.startsWith("wlan") || it.name.startsWith("eth")) 0 else 1 }
                    .flatMap { it.inetAddresses.toList() }
                    .firstOrNull { it is java.net.Inet4Address && ozelIpv4Mu(it.hostAddress ?: "") }
                    ?.hostAddress
            } catch (_: Exception) {
                null
            }
        }

        AsyncFunction("dinleyiciDurdur") {
            dinleyici?.durdur()
        }

        AsyncFunction("dinleyiciYanitla") { id: String, kod: Int, govde: String ->
            dinleyici?.yanitla(id, kod, govde)
        }

        OnDestroy {
            dinleyici?.durdur()
        }

        // mDNS keşfi (NsdManager SİSTEM servisidir; multicast kilidi / CHANGE_WIFI_MULTICAST_STATE
        // gerekmez). Yalnız adres düştüğünde ve süre sınırlı çağrılır; her yolda durdurulur.
        AsyncFunction("tvleriBul") { sureMs: Int, promise: Promise ->
            val baglam = appContext.reactContext
            if (baglam == null) {
                promise.resolve(emptyList<Map<String, Any>>())
                return@AsyncFunction
            }
            NsdKesfi(baglam).bul(sureMs.toLong().coerceIn(1000, 15000)) { liste ->
                promise.resolve(liste.map { mapOf("i" to it.kimlik, "adres" to it.adres, "port" to it.port) })
            }
        }
    }

    /** Ham soketle tek HTTP POST; (durum kodu, gövde). */
    private fun istekGonder(adres: String, port: Int, yol: String, govde: String, zamanAsimiMs: Int): Pair<Int, String> {
            if (!ozelIpv4Mu(adres) || port !in 1024..65535) throw IllegalArgumentException("Yerel ağ adresi değil")
            val sure = zamanAsimiMs.coerceIn(1000, 15000)
            val bayt = govde.toByteArray(Charsets.UTF_8)
            if (bayt.size > 8 * 1024) throw IllegalArgumentException("Gövde çok büyük")
            return Socket().use { s ->
                s.connect(InetSocketAddress(adres, port), sure)
                s.soTimeout = sure
                val istek = "POST $yol HTTP/1.1\r\nHost: $adres:$port\r\n" +
                    "Content-Type: application/json; charset=utf-8\r\nContent-Length: ${bayt.size}\r\n" +
                    "Connection: close\r\n\r\n"
                s.getOutputStream().apply {
                    write(istek.toByteArray(Charsets.ISO_8859_1))
                    write(bayt)
                    flush()
                }
                val giris = s.getInputStream()
                val tampon = ByteArrayOutputStream()
                val parca = ByteArray(512)
                while (tampon.size() < 2048) {
                    val n = giris.read(parca)
                    if (n < 0) break
                    tampon.write(parca, 0, n)
                }
                val ham = String(tampon.toByteArray(), Charsets.UTF_8)
                val ayrac = ham.indexOf("\r\n\r\n")
                val kod = ham.substringBefore("\r\n").split(" ").getOrNull(1)?.toIntOrNull() ?: 0
                kod to (if (ayrac < 0) "" else ham.substring(ayrac + 4))
            }
    }

    /** Katı (denetim D-06): `toIntOrNull` "010" ve "+10"u kabul ediyordu; baştaki sıfır/işaret yok. */
    private val katiIpv4 = Regex("^(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$")

    private fun ozelIpv4Mu(adres: String): Boolean {
        if (!katiIpv4.matches(adres)) return false
        val o = adres.split('.').map { it.toInt() }
        return o[0] == 10 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && o[1] in 16..31)
    }
}
