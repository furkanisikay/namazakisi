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

    /**
     * `simdi`den başlayıp en fazla [ufukMs] ileriye uzanan aralıklar.
     *
     * Varsayılan ufuk YÜKÜN TAMAMIDIR (8 gün ≈ 48 girdi): telefonun arka plan
     * görevi OEM tarafından öldürülürse ya da uygulama günlerce açılmazsa saatte
     * veri durur ama çizelge kısa bir ufukta biterse tile boşalır, komplikasyon
     * geçmiş bir geri sayımda "0 dk"da donar (Fable incelemesi).
     */
    fun araliklar(yuk: Yuk, simdi: Long, ufukMs: Long = Long.MAX_VALUE): List<Aralik> {
        val tum = VakitHesabi.tumVakitler(yuk)
        val sonuc = mutableListOf<Aralik>()
        var onceki: VakitHesabi.VakitAni? = tum.lastOrNull { it.ms <= simdi }
        var bas = simdi
        for (v in tum) {
            if (v.ms <= simdi) continue
            if (ufukMs != Long.MAX_VALUE && v.ms - simdi > ufukMs) break
            sonuc += Aralik(bas, v.ms, v, onceki)
            onceki = v
            bas = v.ms
        }
        return sonuc
    }
}
