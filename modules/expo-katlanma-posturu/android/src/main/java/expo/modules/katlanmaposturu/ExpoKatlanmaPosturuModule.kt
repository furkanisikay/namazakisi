package expo.modules.katlanmaposturu

import android.app.Activity
import android.util.Log
import android.view.View
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Katlanabilir cihazın postürü (issue #283 — masaüstü postürü).
 *
 * Jetpack WindowManager `WindowInfoTracker.windowLayoutInfo(activity)` akışını
 * dinler ve pencereyi kesen İLK `FoldingFeature`'ı JS'e olay olarak yollar:
 *
 *   { durum: "duz" | "yariAcik", yon: "yatay" | "dikey" | null,
 *     ayirici: Boolean, sinir: { sol, ust, sag, alt } | null }
 *
 * `sinir` dp cinsindendir ve React kök görünümüne (android.R.id.content) GÖRELİDİR:
 * WindowManager sınırı pencereye göre piksel verir; JS ise sayfa konumunu
 * `measureInWindow` ile kök yüzeye göre ölçer (Fabric). Edge-to-edge'de ikisi
 * çakışır; çakışmadığı durumda (kök görünüm pencerenin içinde kaymışsa) fark
 * burada düşülür.
 *
 * Karar (postür → düzen) BURADA DEĞİL, saf JS'tedir (`core/utils/katlanmaPosturu.ts`).
 * Pencereyi kesen katlanma yoksa (telefon, tablet, kapalı Fold'un dış ekranı)
 * "duz" döner. İzleme yalnız JS dinleyici varken çalışır (OnStart/StopObserving).
 */
class ExpoKatlanmaPosturuModule : Module() {

    private val kapsam = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var izleme: Job? = null
    private var izlenenAktivite: Activity? = null
    private var dinleyiciVar = false

    @Volatile
    private var son: Map<String, Any?> = DUZ

    override fun definition() = ModuleDefinition {
        Name("ExpoKatlanmaPosturu")

        Events(OLAY)

        // Yalnız bellekteki alanı okur — JS thread'inde senkron çağrı güvenli.
        Function("sonDurum") { son }

        OnStartObserving {
            kapsam.launch {
                dinleyiciVar = true
                izlemeyiBaslat()
            }
        }

        OnStopObserving {
            kapsam.launch {
                dinleyiciVar = false
                izlemeyiDurdur()
            }
        }

        // configChanges sayesinde katla/aç Activity'yi yeniden yaratmaz; yine de
        // Activity değişirse (sistem öldürüp yeniden kurdu) akış yeni Activity'ye taşınır.
        OnActivityEntersForeground {
            kapsam.launch { if (dinleyiciVar) izlemeyiBaslat() }
        }

        OnActivityDestroys {
            kapsam.launch { izlemeyiDurdur() }
        }

        OnDestroy {
            izleme = null
            izlenenAktivite = null
            kapsam.cancel()
        }
    }

    /** Ana thread'de çağrılır. Aynı Activity zaten izleniyorsa hiçbir şey yapmaz. */
    private fun izlemeyiBaslat() {
        val aktivite = appContext.currentActivity ?: return
        if (izleme?.isActive == true && izlenenAktivite === aktivite) return
        izleme?.cancel()
        izlenenAktivite = aktivite
        izleme = kapsam.launch {
            try {
                WindowInfoTracker.getOrCreate(aktivite)
                    .windowLayoutInfo(aktivite)
                    .collect { bilgi -> yayinla(cevir(aktivite, bilgi)) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                // WindowManager uzantısı olmayan / bozuk cihaz: "düz" kalır, çökmez.
                Log.w(TAG, "Pencere duzeni izlenemedi: ${e.message}")
                yayinla(DUZ)
            }
        }
    }

    private fun izlemeyiDurdur() {
        izleme?.cancel()
        izleme = null
        izlenenAktivite = null
    }

    private fun yayinla(yeni: Map<String, Any?>) {
        if (yeni == son) return
        son = yeni
        try {
            sendEvent(OLAY, yeni)
        } catch (e: Exception) {
            Log.w(TAG, "Postur olayi gonderilemedi: ${e.message}")
        }
    }

    private fun cevir(aktivite: Activity, bilgi: WindowLayoutInfo): Map<String, Any?> {
        val katlanma = bilgi.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
            ?: return DUZ
        val yogunluk = aktivite.resources.displayMetrics.density.takeIf { it > 0f } ?: 1f
        val kok = IntArray(2)
        try {
            aktivite.findViewById<View>(android.R.id.content)?.getLocationInWindow(kok)
        } catch (e: Exception) {
            Log.w(TAG, "Kok gorunum konumu okunamadi: ${e.message}")
            kok[0] = 0
            kok[1] = 0
        }
        val b = katlanma.bounds
        fun dp(px: Int, kaydirma: Int): Double = ((px - kaydirma) / yogunluk).toDouble()
        return mapOf(
            "durum" to if (katlanma.state == FoldingFeature.State.HALF_OPENED) "yariAcik" else "duz",
            "yon" to if (katlanma.orientation == FoldingFeature.Orientation.HORIZONTAL) "yatay" else "dikey",
            "ayirici" to katlanma.isSeparating,
            "sinir" to mapOf(
                "sol" to dp(b.left, kok[0]),
                "ust" to dp(b.top, kok[1]),
                "sag" to dp(b.right, kok[0]),
                "alt" to dp(b.bottom, kok[1]),
            ),
        )
    }

    private companion object {
        const val TAG = "KatlanmaPosturu"
        const val OLAY = "onPosturDegisti"
        val DUZ: Map<String, Any?> = mapOf(
            "durum" to "duz",
            "yon" to null,
            "ayirici" to false,
            "sinir" to null,
        )
    }
}
