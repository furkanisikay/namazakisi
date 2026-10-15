package expo.modules.camigeofence

import android.content.Context
import android.util.Log
import expo.modules.camigeofence.cekirdek.CamiVerisi

/**
 * Paketlenmiş `camiler/tr.bin` (ODbL) — tembel yüklenir, süreç boyunca önbellekte.
 * Dosya yoksa ya da bozuksa `null`: kullanıcının kendi yerleri ve favoriler yine
 * izlenir, yalnız OSM camileri olmaz.
 */
object CamiVeriKaynagi {
    private const val YOL = "camiler/tr.bin"

    @Volatile
    private var veri: CamiVerisi? = null

    @Volatile
    private var denendi = false

    @Synchronized
    fun al(ctx: Context): CamiVerisi? {
        if (denendi) return veri
        denendi = true
        veri = try {
            ctx.assets.open(YOL).use { CamiVerisi.coz(it.readBytes()) }
        } catch (e: Exception) {
            Log.i("CamiVeriKaynagi", "Cami verisi yok: ${e.message}")
            null
        }
        return veri
    }
}
