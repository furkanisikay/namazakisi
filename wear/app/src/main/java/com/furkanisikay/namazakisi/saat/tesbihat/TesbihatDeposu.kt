package com.furkanisikay.namazakisi.saat.tesbihat

import android.content.Context
import androidx.core.content.edit
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat

/**
 * Tesbihat oturumunun kalıcı durumu (issue #293): ekran kapanıp süreç ölse de
 * kaldığı yerden sürer. Tek tamsayı + son dokunuş anı; eskime kararı `Tesbihat.yukle`'de.
 *
 * Yedeklemeye/telefona GİRMEZ (bilinçli): oturum dakikalıktır ve bileğe özgüdür.
 */
class TesbihatDeposu(context: Context) {
    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun oku(simdi: Long): Tesbihat.Durum =
        Tesbihat.yukle(prefs.getInt(TOPLAM, 0), prefs.getLong(SON_DOKUNUS, 0L), simdi)

    /** Her dokunuşta çağrılır; `apply` diske eşzamansız yazar (dokunuşu bekletmez). */
    fun yaz(durum: Tesbihat.Durum, simdi: Long) {
        prefs.edit {
            putInt(TOPLAM, durum.toplam)
            putLong(SON_DOKUNUS, simdi)
        }
    }

    private companion object {
        const val PREFS = "saat_tesbihat"
        const val TOPLAM = "toplam"
        const val SON_DOKUNUS = "son_dokunus_ms"
    }
}
