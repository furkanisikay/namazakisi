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

        AsyncFunction("gonder") { adres: String, port: Int, govde: String, zamanAsimiMs: Int ->
            if (!ozelIpv4Mu(adres) || port !in 1024..65535) throw IllegalArgumentException("Yerel ağ adresi değil")
            val sure = zamanAsimiMs.coerceIn(1000, 15000)
            val bayt = govde.toByteArray(Charsets.UTF_8)
            Socket().use { s ->
                s.connect(InetSocketAddress(adres, port), sure)
                s.soTimeout = sure
                val istek = "POST /esle HTTP/1.1\r\nHost: $adres:$port\r\n" +
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
                if (ayrac < 0) "" else ham.substring(ayrac + 4)
            }
        }
    }

    private fun ozelIpv4Mu(adres: String): Boolean {
        val o = adres.split('.').mapNotNull { it.toIntOrNull() }
        if (o.size != 4 || o.any { it !in 0..255 }) return false
        return o[0] == 10 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && o[1] in 16..31)
    }
}
