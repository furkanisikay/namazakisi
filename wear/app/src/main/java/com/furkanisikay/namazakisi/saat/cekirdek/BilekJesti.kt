package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Bilek jestleri (saat W3, fikir 7) — SAF. Wear OS bileği dışa/içe bükmeyi
 * `KEYCODE_NAVIGATE_NEXT/PREVIOUS` olarak iletir (sallama sistemin geri jestidir).
 *
 * YALNIZ ana ekranın vakit listesinde kullanılır; tesbihata BAĞLANMAZ: kazara bir
 * bükme sayım olurdu (araştırma raporu, fikir 7).
 */
object BilekJesti {
    /** `android.view.KeyEvent.KEYCODE_NAVIGATE_PREVIOUS` (saf kodda sabit kopyası). */
    const val TUS_ONCEKI = 260

    /** `android.view.KeyEvent.KEYCODE_NAVIGATE_NEXT`. */
    const val TUS_SONRAKI = 261

    /** Tuş → yön (+1 sonraki, −1 önceki); jest değilse null. */
    fun yon(tus: Int): Int? = when (tus) {
        TUS_SONRAKI -> 1
        TUS_ONCEKI -> -1
        else -> null
    }

    /** Listede gidilecek öğe: şu anki merkez öğeden bir adım, sınırlarda durur. */
    fun hedef(merkez: Int, adet: Int, yon: Int): Int = if (adet <= 0) 0 else (merkez + yon).coerceIn(0, adet - 1)

    /** Ekrana iletilen istek; `sira` her jestte artar (aynı yön üst üste de tetiklesin). */
    data class Istek(val yon: Int, val sira: Int)
}
