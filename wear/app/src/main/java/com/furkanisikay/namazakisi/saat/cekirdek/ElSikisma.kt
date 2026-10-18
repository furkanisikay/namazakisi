package com.furkanisikay.namazakisi.saat.cekirdek

import java.util.concurrent.atomic.AtomicInteger

/**
 * İki bağımsız olayın İKİNCİSİNİ tam bir kez işaretler (saat W3, inceleme bulgusu 6) — SAF.
 *
 * `TextToSpeech` kurucusu ile `onInit` geri çağrısı yarışır: geri çağrı kurucu dönmeden de
 * gelebilir ve o anda yakalanan değişken hâlâ boştur → anons sessizce düşerdi. Hangisi
 * ikinci gelirse konuşmayı o başlatır; üçüncü bir çağrı (olamaz ama) hiçbir şey yapmaz.
 */
class ElSikisma {
    private val sayac = AtomicInteger(0)

    /** @return bu çağrı ikinci olaysa true (tam bir kez). */
    fun isaretle(): Boolean = sayac.incrementAndGet() == 2

    companion object {
        /** Saat anonsunun tavanı — telefondaki `AnonsReceiver` ile aynı (ANR eşiği 60 sn). */
        const val ANONS_ZAMAN_ASIMI_MS = 14_000L
    }
}
