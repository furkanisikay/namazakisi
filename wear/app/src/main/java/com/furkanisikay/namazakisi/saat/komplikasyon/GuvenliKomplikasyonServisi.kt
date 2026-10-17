package com.furkanisikay.namazakisi.saat.komplikasyon

import android.util.Log
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService.ComplicationRequestListener
import androidx.wear.watchface.complications.datasource.ComplicationDataTimeline
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.TimeInterval
import androidx.wear.watchface.complications.datasource.TimelineEntry
import com.furkanisikay.namazakisi.saat.cekirdek.KomplikasyonCizelgesi
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * Tüm komplikasyon kaynaklarının tabanı — çökmeyen zaman çizelgesi.
 *
 * `SuspendingTimelineComplicationDataSourceService` (ktx) KULLANILMAZ: isteği
 * işleyicisiz bir coroutine'de işler; veri kurarken ya da teslimde (kütüphanenin
 * doğrulaması, binder sınırı) fırlayan her istisna uygulama SÜRECİNİ öldürür —
 * komplikasyon servisi ile `AnaAktivite` aynı süreçtedir (v0.37.0 çökmesi, bkz.
 * `KomplikasyonCizelgesi`). Burada:
 *  - varsayılan, istenen türde GERÇEK veridir (`varsayilan`), girdiler aynı türdedir;
 *  - teslim kademelidir: tüm çizelge → kısa çizelge → yalnız varsayılan → NO_DATA;
 *  - hiçbir istisna süreçten dışarı sızmaz.
 */
abstract class GuvenliKomplikasyonServisi : ComplicationDataSourceService() {

    private val kapsam = CoroutineScope(
        SupervisorJob() + Dispatchers.Main.immediate +
            CoroutineExceptionHandler { _, e -> Log.e(TAG, "Komplikasyon istegi coktu", e) },
    )

    /** Çizelge aralıkları: (başlangıç, bitiş, o aralığın verisi — tür desteklenmiyorsa null). */
    protected abstract fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>>

    /**
     * Veri yokken / çizelge tükenince gösterilen, istenen TÜRDE veri ("bekleniyor").
     * Tür desteklenmiyorsa null → yuva NO_DATA alır.
     */
    protected abstract fun varsayilan(tur: ComplicationType): ComplicationData?

    final override fun onComplicationRequest(request: ComplicationRequest, listener: ComplicationRequestListener) {
        kapsam.launch {
            val plan = try {
                KomplikasyonCizelgesi.kur(
                    varsayilan(request.complicationType),
                    araliklar(request.complicationType),
                ) { it.type }
            } catch (e: Exception) {
                Log.e(TAG, "Komplikasyon verisi kurulamadi: ${javaClass.simpleName}", e)
                KomplikasyonCizelgesi.Plan(
                    runCatching { varsayilan(request.complicationType) }.getOrNull(),
                    emptyList(),
                )
            }
            teslimEt(listener, plan)
        }
    }

    private fun teslimEt(
        listener: ComplicationRequestListener,
        plan: KomplikasyonCizelgesi.Plan<ComplicationData>,
    ) {
        val varsayilan = plan.varsayilan
        if (varsayilan != null) {
            for (boyut in KomplikasyonCizelgesi.denemeBoyutlari(plan.girdiler.size)) {
                try {
                    val girdiler = plan.girdiler.take(boyut).map {
                        TimelineEntry(
                            TimeInterval(Instant.ofEpochMilli(it.baslangic), Instant.ofEpochMilli(it.bitis)),
                            it.veri,
                        )
                    }
                    listener.onComplicationDataTimeline(ComplicationDataTimeline(varsayilan, girdiler))
                    return
                } catch (e: Exception) {
                    // Doğrulama ya da binder hatası: hiçbir şey teslim edilmedi → daha kısa dene.
                    Log.w(TAG, "Cizelge teslim edilemedi (${plan.girdiler.size} -> $boyut)", e)
                }
            }
        }
        try {
            listener.onComplicationData(NoDataComplicationData())
        } catch (e: Exception) {
            Log.e(TAG, "Bos veri bile teslim edilemedi", e)
        }
    }

    final override fun getPreviewData(type: ComplicationType): ComplicationData? =
        try {
            onizleme(type)
        } catch (e: Exception) {
            Log.w(TAG, "Onizleme kurulamadi", e)
            null
        }

    protected abstract fun onizleme(type: ComplicationType): ComplicationData?

    override fun onDestroy() {
        kapsam.cancel()
        super.onDestroy()
    }

    private companion object {
        const val TAG = "SaatKomplikasyon"
    }
}
