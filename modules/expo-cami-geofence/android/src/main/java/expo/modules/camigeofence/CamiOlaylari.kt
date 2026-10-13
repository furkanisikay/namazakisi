package expo.modules.camigeofence

/**
 * Native → JS olay köprüsü. Modül örneği yaşarken (uygulama açık) dinleyici
 * kuruludur; değilse olay düşer — JS açılışta durumu zaten diskten okur.
 */
object CamiOlaylari {
    @Volatile
    var dinleyici: ((tur: String) -> Unit)? = null

    fun yay(tur: String) {
        try {
            dinleyici?.invoke(tur)
        } catch (_: Throwable) {
            // JS köprüsü kapanıyor olabilir; durum diskte.
        }
    }
}
