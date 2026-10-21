package expo.modules.camigeofence

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import expo.modules.camigeofence.cekirdek.CamiSabitleri
import java.util.concurrent.atomic.AtomicBoolean

/** Ölçümün amacı: önceliği ve kabul edilen önbellek yaşını belirler (denetim D-09). */
enum class OlcumAmaci {
    /** DWELL kararı: metre düzeyi, HIGH_ACCURACY, önbellek YOK (Fable: DWELL başına tek ölçüm). */
    KARAR,

    /**
     * Yenileme çemberini yeniden merkezlemek: ≈100 m yeter → BALANCED_POWER_ACCURACY ve
     * `YENILEME_KONUM_AZAMI_YAS_MS`'e kadar önbellek konumu. Kaba sonuç
     * `CamiKarar.yenilemeOlcumKarari` ile elenir.
     */
    YENILEME,
}

/**
 * TEK konum ölçümü (en fazla 15 sn). `KARAR` amacında önbellekteki eski konum KABUL
 * EDİLMEZ (`maxUpdateAgeMillis = 0`): metre düzeyindeki karar bayat konumla verilemez.
 * `YENILEME` amacında soğuk GPS açılmaz (şehir içi yolculukta her çember çıkışında
 * yüksek doğruluklu ölçüm pili yiyordu).
 *
 * Geri çağrı TAM BİR KEZ çalışır (sonuç, hata ya da zaman aşımı); `goAsync()`
 * penceresi buna bağlıdır — iki amaçta da süre tavanı aynıdır.
 */
object CamiKonumOlcer {
    fun izinVarMi(ctx: Context): Boolean =
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED

    @SuppressLint("MissingPermission")
    fun olc(ctx: Context, amac: OlcumAmaci = OlcumAmaci.KARAR, sonuc: (Location?) -> Unit) {
        val bitti = AtomicBoolean(false)
        val tek: (Location?) -> Unit = { k -> if (bitti.compareAndSet(false, true)) sonuc(k) }
        if (!izinVarMi(ctx)) {
            tek(null)
            return
        }
        val iptal = CancellationTokenSource()
        // Güvenlik ağı: Play Services cevap vermezse pencere yine kapanır.
        Handler(Looper.getMainLooper()).postDelayed({
            iptal.cancel()
            tek(null)
        }, CamiSabitleri.OLCUM_ZAMAN_ASIMI_MS + 1_000)
        try {
            val (oncelik, azamiYas) = when (amac) {
                OlcumAmaci.KARAR -> Priority.PRIORITY_HIGH_ACCURACY to 0L
                OlcumAmaci.YENILEME -> Priority.PRIORITY_BALANCED_POWER_ACCURACY to CamiSabitleri.YENILEME_KONUM_AZAMI_YAS_MS
            }
            val istek = CurrentLocationRequest.Builder()
                .setPriority(oncelik)
                .setDurationMillis(CamiSabitleri.OLCUM_ZAMAN_ASIMI_MS)
                .setMaxUpdateAgeMillis(azamiYas)
                .build()
            LocationServices.getFusedLocationProviderClient(ctx)
                .getCurrentLocation(istek, iptal.token)
                .addOnSuccessListener { tek(it) }
                .addOnFailureListener { tek(null) }
                .addOnCanceledListener { tek(null) }
        } catch (_: Exception) {
            tek(null)
        }
    }
}
