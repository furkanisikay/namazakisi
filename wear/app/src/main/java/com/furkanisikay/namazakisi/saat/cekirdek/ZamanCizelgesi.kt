package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Tile ve komplikasyonun ZAMAN ÇİZELGESİ (issue #269) — SAF.
 *
 * Saat yüzeyleri uygulamayı uyandırmadan değişebilmek için önceden kurulmuş
 * girdiler ister: her vakit sınırında "sıradaki vakit" bir sonrakine geçer.
 * Girdi i: [sinir_i, sinir_{i+1}) aralığında sıradaki vakit = sinir_{i+1}.
 */
object ZamanCizelgesi {
    data class Aralik(
        val baslangic: Long,
        val bitis: Long,
        /** Bu aralıktaki sıradaki vakit (= aralığın sonu) */
        val siradaki: VakitHesabi.VakitAni,
        /** Aralığın başındaki vakit (ilerleme hesabı için) */
        val onceki: VakitHesabi.VakitAni?,
    )

    /** `simdi`den başlayıp en fazla [ufukMs] ileriye uzanan aralıklar. */
    fun araliklar(yuk: Yuk, simdi: Long, ufukMs: Long = 48L * 3_600_000L): List<Aralik> {
        val tum = VakitHesabi.tumVakitler(yuk)
        val sonuc = mutableListOf<Aralik>()
        var onceki: VakitHesabi.VakitAni? = tum.lastOrNull { it.ms <= simdi }
        var bas = simdi
        for (v in tum) {
            if (v.ms <= simdi) continue
            if (v.ms - simdi > ufukMs) break
            sonuc += Aralik(bas, v.ms, v, onceki)
            onceki = v
            bas = v.ms
        }
        return sonuc
    }
}
