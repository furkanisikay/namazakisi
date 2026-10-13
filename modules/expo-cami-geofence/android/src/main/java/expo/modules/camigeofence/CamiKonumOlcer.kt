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

/**
 * TEK hassas konum ölçümü (Fable: DWELL başına bir `getCurrentLocation`,
 * HIGH_ACCURACY, 15 sn tavan). Önbellekteki eski konum KABUL EDİLMEZ
 * (`maxUpdateAgeMillis = 0`): metre düzeyindeki karar bayat konumla verilemez.
 *
 * Geri çağrı TAM BİR KEZ çalışır (sonuç, hata ya da zaman aşımı); `goAsync()`
 * penceresi buna bağlıdır.
 */
object CamiKonumOlcer {
    fun izinVarMi(ctx: Context): Boolean =
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED

    @SuppressLint("MissingPermission")
    fun olc(ctx: Context, sonuc: (Location?) -> Unit) {
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
            val istek = CurrentLocationRequest.Builder()
                .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                .setDurationMillis(CamiSabitleri.OLCUM_ZAMAN_ASIMI_MS)
                .setMaxUpdateAgeMillis(0)
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
