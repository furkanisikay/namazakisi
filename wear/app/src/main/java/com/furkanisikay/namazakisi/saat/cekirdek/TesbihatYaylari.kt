package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Tesbihat halkasının ÜÇ YAYI (Sübhânallah · Elhamdülillâh · Allâhü ekber) — SAF.
 *
 * Kişi 100'ün neresinde ve hangi tesbihte olduğunu aynı anda görür. Doluluk ve parlama
 * yalnız `Tesbihat.Durum.toplam`'dan türer (ikinci durum tutulmaz; geri alma da aynı
 * kuraldan geçer).
 */
object TesbihatYaylari {
    const val YAY_SAYISI = 3

    /** Parlama kodu: 100. sayımda üç yay birlikte parlar. */
    const val HEPSI = YAY_SAYISI

    /** Her yayın doluluğu [0,1]. */
    fun doluluk(d: Tesbihat.Durum): List<Float> = (0 until YAY_SAYISI).map { i ->
        (d.toplam - i * Tesbihat.FAZ_HEDEFI).coerceIn(0, Tesbihat.FAZ_HEDEFI).toFloat() / Tesbihat.FAZ_HEDEFI
    }

    /**
     * İleri sayımda bu adımda biten yay: 33 → 0, 66 → 1, 99 → 2, 100 → [HEPSI].
     * Geri almada ya da sınır geçilmediyse null (parlama yok).
     */
    fun parlayan(onceki: Int, yeni: Int): Int? {
        if (yeni != onceki + 1) return null
        if (yeni >= Tesbihat.TOPLAM) return HEPSI
        if (yeni % Tesbihat.FAZ_HEDEFI != 0) return null
        return (yeni / Tesbihat.FAZ_HEDEFI - 1).takeIf { it in 0 until YAY_SAYISI }
    }
}
