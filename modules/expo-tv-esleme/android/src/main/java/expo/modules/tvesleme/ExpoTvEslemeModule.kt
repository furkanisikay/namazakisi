package expo.modules.tvesleme

import com.google.android.gms.common.moduleinstall.ModuleInstall
import com.google.android.gms.common.moduleinstall.ModuleInstallRequest
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream
import java.net.InetSocketAddress
import java.net.Socket

/**
 * Android TV eşleştirmesi (telefon tarafı) — iki iş:
 *
 * 1. `qrOku`: Google kod tarayıcı (Play hizmetleri). Kamera izni İSTEMEZ; tarama arayüzünü
 *    Play hizmetleri çizer, yalnız okunan metin döner. İptal → `null`. Tarayıcı modülü cihazda
 *    yoksa önce indirilir. Play hizmetleri olmayan cihazda (`TARAYICI_YOK`) ekran kodla
 *    aktarmayı önerir.
 *
 * 2. `gonder`: aynı yerel ağdaki TV'ye ham soketle tek bir HTTP POST. Neden ham soket:
 *    uygulamanın ağ güvenliği yapılandırması düz metin HTTP'ye izin VERMEZ (doğru olan bu)
 *    ve OkHttp/HttpURLConnection o kurala uyar; `java.net.Socket` uymaz. Hedefin yalnız özel
 *    IPv4 olduğu JS'te (`tvQrCoz`) ve burada ikinci kez denetlenir — kötü niyetli bir QR
 *    konumu internete yollatamaz. Yanıt 2 KB ile, süre parametreyle sınırlı.
 */
class ExpoTvEslemeModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoTvEsleme")

        AsyncFunction("qrOku") { promise: Promise ->
            val baglam = appContext.currentActivity ?: appContext.reactContext
            if (baglam == null) {
                promise.reject("TARAYICI_YOK", "Bağlam yok", null)
                return@AsyncFunction
            }
            try {
                val secenek = GmsBarcodeScannerOptions.Builder()
                    .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                    .build()
                val tarayici = GmsBarcodeScanning.getClient(baglam, secenek)
                val baslat = {
                    tarayici.startScan()
                        .addOnSuccessListener { promise.resolve(it.rawValue) }
                        .addOnCanceledListener { promise.resolve(null) }
                        .addOnFailureListener { promise.reject("TARAYICI_YOK", it.message, it) }
                }
                val kurulum = ModuleInstall.getClient(baglam)
                kurulum.areModulesAvailable(tarayici)
                    .addOnSuccessListener { yanit ->
                        if (yanit.areModulesAvailable()) {
                            baslat()
                        } else {
                            kurulum.installModules(ModuleInstallRequest.newBuilder().addApi(tarayici).build())
                                .addOnSuccessListener { baslat() }
                                .addOnFailureListener { promise.reject("TARAYICI_YOK", it.message, it) }
                        }
                    }
                    .addOnFailureListener { promise.reject("TARAYICI_YOK", it.message, it) }
            } catch (e: Throwable) {
                // Play hizmetleri yok (Huawei vb.) ya da sınıf yüklenemedi.
                promise.reject("TARAYICI_YOK", e.message, e)
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
