package com.furkanisikay.namazakisi.saat.hatirlatma

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager

/**
 * Saat şarjda mı? (saat W3, fikir 3) — yapışkan `ACTION_BATTERY_CHANGED` yayınından
 * okunur: izin istemez, alıcı kaydı bırakmaz (`registerReceiver(null, …)`).
 *
 * Takma/çıkarma ANINDA haber alınmaz (`ACTION_POWER_CONNECTED` manifest alıcısına
 * Android 8+'da gelmez); karar zincirin her tetiğinde ve her tazelemede yeniden okunur.
 * Okunamazsa "şarjda değil" (güvenli taraf: saat çalmaya devam eder).
 */
object SarjDurumu {
    fun sarjdaMi(context: Context): Boolean = try {
        val durum = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        (durum?.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0) ?: 0) != 0
    } catch (_: Exception) {
        false
    }
}
