package com.furkanisikay.namazakisi.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.furkanisikay.namazakisi.duvar.DuvarKagidiUygulayici

/**
 * Günün ayeti yüzeylerini yeniden hesaplatan TEK alıcı (#380/#381), `exported=false`:
 * - planın bir sonraki `baslangicMs`'indeki sınır alarmı ([GununAyetiGuncelleyici.SINIR_EYLEMI]),
 * - sistem olayları: saat / saat dilimi / tarih değişimi, açılış, paket güncellemesi.
 *   Manifest filtresi ikinci kez yazılmaz: `NamazWidgetAlarmAlici` bunları paket içi açık
 *   yayınla buraya iletir ([GununAyetiGuncelleyici.YENIDEN_EYLEMI]).
 *
 * İş kısa tutulur: widget çizimi ana iş parçacığında (ölçüm + küçük resim), duvar kâğıdı
 * `goAsync()` ile arka plan iş parçacığında ve yalnız imza değiştiyse (`DuvarKagidiUygulayici`).
 */
class GununAyetiAlarmAlici : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != GununAyetiGuncelleyici.SINIR_EYLEMI && intent.action != GununAyetiGuncelleyici.YENIDEN_EYLEMI) {
            return
        }
        GununAyetiGuncelleyici.tumunuGuncelle(context)
        val sonuc = try {
            goAsync()
        } catch (e: Exception) {
            Log.w(TAG, "goAsync alinamadi", e)
            null
        }
        DuvarKagidiUygulayici.arkaPlandaGerekirseUygula(context) { sonuc?.finish() }
    }

    private companion object {
        const val TAG = "GununAyetiAlarmAlici"
    }
}
