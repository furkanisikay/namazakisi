package com.furkanisikay.namazakisi.wear

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.SaatKomutKurallari
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.Wearable
import java.util.concurrent.TimeUnit

/**
 * Telefon → saat: "bu uyandırma telefonda susturuldu" (saat W3, inceleme bulgusu 7).
 * Saatte kapatınca telefon yedeğini iptal ediyordu, tersi yoktu: "ikisi" seçiliyken ya da
 * yedek çaldığında telefonda "Kapat"a basan kişinin bileği titremeye devam ediyordu.
 *
 * Yalnız uyandırma kimliklerinde (`SaatKomutKurallari.uyandirmaKimligiMi`), bağlı her
 * düğüme tek yönlü mesaj. Saat yoksa / Wear API yoksa sessizce geçer (asla fırlatmaz).
 * ARKA PLAN iş parçacığından çağrılmalıdır (alarm eylemleri `goAsync` yürütücüsünde koşar).
 */
object SaatUyandirmaHaberi {
    private const val TAG = "SaatUyandirmaHaberi"
    private const val ZAMAN_ASIMI_SN = 3L

    fun telefondaKapandi(context: Context, kimlik: String) {
        if (!SaatKomutKurallari.uyandirmaKimligiMi(kimlik)) return
        try {
            val ctx = context.applicationContext
            val dugumler = Tasks.await(Wearable.getNodeClient(ctx).connectedNodes, ZAMAN_ASIMI_SN, TimeUnit.SECONDS)
            val govde = kimlik.toByteArray(Charsets.UTF_8)
            dugumler.forEach { d ->
                try {
                    Tasks.await(
                        Wearable.getMessageClient(ctx).sendMessage(d.id, SaatKomutKurallari.TELEFONDA_KAPANDI_YOLU, govde),
                        ZAMAN_ASIMI_SN,
                        TimeUnit.SECONDS,
                    )
                } catch (e: Exception) {
                    Log.i(TAG, "Saate iletilemedi", e)
                }
            }
        } catch (e: Exception) {
            Log.i(TAG, "Bagli saat yok ya da Wear API yok", e)
        }
    }
}
