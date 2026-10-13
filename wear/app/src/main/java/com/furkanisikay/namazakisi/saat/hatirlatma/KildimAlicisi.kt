package com.furkanisikay.namazakisi.saat.hatirlatma

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.furkanisikay.namazakisi.saat.veri.Senkron
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Saat bildirimindeki "Kıldım" (issue #280). Uygulamadaki "Kıldım" ile AYNI yol:
 * `Senkron.kildimGonder` yerel kalan alarmları HEMEN iptal eder (zincir yeniden
 * kurulur, bildirim kaldırılır) ve kalıcı Data Layer kuyruğuyla telefona bildirir —
 * telefon uzaktaysa bağlanınca iletilir.
 */
class KildimAlicisi : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val tarih = intent.getStringExtra(TARIH) ?: return
        val vakit = intent.getStringExtra(VAKIT) ?: return
        val sonuc = goAsync()
        CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
            try {
                // Data Layer yazımı yerelde biter, yine de goAsync penceresini (~10 sn) aşma.
                withTimeoutOrNull(8_000L) { Senkron.kildimGonder(context.applicationContext, tarih, vakit) }
            } finally {
                sonuc.finish()
            }
        }
    }

    companion object {
        const val TARIH = "tarih"
        const val VAKIT = "vakit"
    }
}
