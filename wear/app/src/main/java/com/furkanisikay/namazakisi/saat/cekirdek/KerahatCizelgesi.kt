package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Kerahat komplikasyonunun zaman çizelgesi (issue #281) — SAF.
 *
 * Pencereler `VakitHesabi.kerahatMi` ile AYNI kuraldan türer (güneş + şuruk,
 * öğle − istiva, akşam − gurub; dakikalar yükten gelir) — ikisi ayrışırsa uygulama
 * "kerahat vaktindesiniz" derken kadran "kerahat 12:41'de" der.
 *
 * Kerahat UYARIDIR, engel değildir (AGENTS.md); komplikasyon yalnız bilgi verir.
 */
object KerahatCizelgesi {
    data class Pencere(val bas: Long, val bitis: Long)

    data class Aralik(
        val baslangic: Long,
        val bitis: Long,
        /** Bu aralık bir kerahat penceresinin İÇİ mi? */
        val icinde: Boolean,
        /** İçindeyse pencerenin bitişi, değilse sıradaki pencerenin başı. */
        val hedefMs: Long,
    )

    private const val DK = 60_000L

    fun pencereler(yuk: Yuk): List<Pencere> = yuk.gunler.flatMap { g ->
        val gunes = g.vakitler.getValue("gunes")
        val ogle = g.vakitler.getValue("ogle")
        val aksam = g.vakitler.getValue("aksam")
        listOf(
            Pencere(gunes, gunes + yuk.kerahat.surukDk * DK),
            Pencere(ogle - yuk.kerahat.istivaDk * DK, ogle),
            Pencere(aksam - yuk.kerahat.gurubDk * DK, aksam),
        )
    }.filter { it.bitis > it.bas }.sortedBy { it.bas }

    fun cizelge(yuk: Yuk, simdi: Long): List<Aralik> {
        val sonuc = mutableListOf<Aralik>()
        var imlec = simdi
        for (p in pencereler(yuk)) {
            if (p.bitis <= imlec) continue
            if (p.bas > imlec) {
                sonuc += Aralik(imlec, p.bas, icinde = false, hedefMs = p.bas)
                imlec = p.bas
            }
            sonuc += Aralik(imlec, p.bitis, icinde = true, hedefMs = p.bitis)
            imlec = p.bitis
        }
        return sonuc
    }
}
