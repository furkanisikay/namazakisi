package com.furkanisikay.namazakisi.saat.telefon

import android.content.Context
import android.util.Log
import com.furkanisikay.namazakisi.saat.cekirdek.TelefonKomutu
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Saat → telefon RPC (saat W3): `MessageClient.sendRequest`, cevap aynı turda gelir.
 * Kuyruk YOKTUR (bilerek): Namaz modu ve "cami değil" ANINDA anlamlıdır; telefon yoksa
 * kişiye "Telefonunuza ulaşılamadı" denir, sonra kendiliğinden uygulanmaz.
 *
 * Hedef düğüm: önce YAKINDAKİ (Bluetooth) bağlı düğüm, yoksa ilk bağlı düğüm (bulut).
 */
object TelefonIstemcisi {
    private const val ZAMAN_ASIMI_MS = 8_000L

    suspend fun gonder(context: Context, yol: String, govde: String): TelefonKomutu.Sonuc {
        val app = context.applicationContext
        return try {
            withTimeoutOrNull(ZAMAN_ASIMI_MS) {
                val dugumler = Wearable.getNodeClient(app).connectedNodes.await()
                val hedef = dugumler.firstOrNull { it.isNearby } ?: dugumler.firstOrNull()
                    ?: return@withTimeoutOrNull TelefonKomutu.Sonuc(TelefonKomutu.ULASILAMADI)
                val cevap = Wearable.getMessageClient(app).sendRequest(hedef.id, yol, govde.toByteArray(Charsets.UTF_8)).await()
                TelefonKomutu.sonucCoz(cevap?.toString(Charsets.UTF_8))
            } ?: TelefonKomutu.Sonuc(TelefonKomutu.ULASILAMADI)
        } catch (e: Exception) {
            Log.w("TelefonIstemcisi", "Telefona istek gonderilemedi: $yol", e)
            TelefonKomutu.Sonuc(TelefonKomutu.ULASILAMADI)
        }
    }

    /** Yakında (Bluetooth ile) bağlı bir telefon var mı? Anons yeri kararı için (fikir 9). */
    suspend fun yakindaTelefonVarMi(context: Context): Boolean = try {
        withTimeoutOrNull(3_000L) {
            Wearable.getNodeClient(context.applicationContext).connectedNodes.await().any { it.isNearby }
        } ?: false
    } catch (_: Exception) {
        false
    }
}
