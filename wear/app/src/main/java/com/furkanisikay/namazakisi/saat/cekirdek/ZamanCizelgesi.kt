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
     *
     * [maksGirdi]: girdi başına tam düzen taşıyan tile'lar için tavan (yanıt boyutu).
     * Tavanlı çağıran, tavanı tazelik aralığının ÇOK üstünde tutmalıdır: her tazelikte
     * çizelge diskteki yükten yeniden kurulur, ufuk kayar.
     */
    fun araliklar(yuk: Yuk, simdi: Long, ufukMs: Long = Long.MAX_VALUE, maksGirdi: Int = Int.MAX_VALUE): List<Aralik> {
        val tum = VakitHesabi.tumVakitler(yuk)
        val sonuc = mutableListOf<Aralik>()
        var onceki: VakitHesabi.VakitAni? = tum.lastOrNull { it.ms <= simdi }
        var bas = simdi
        for (v in tum) {
            if (v.ms <= simdi) continue
            if (sonuc.size >= maksGirdi) break
            if (ufukMs != Long.MAX_VALUE && v.ms - simdi > ufukMs) break
            sonuc += Aralik(bas, v.ms, v, onceki)
            onceki = v
            bas = v.ms
        }
        return sonuc
    }

    /**
     * "Sıradaki vakit" tile'ının girdi tavanı: girdi başına ≈1,2 KB düzen; yükün tamamı
     * (31 gün ≈ 186 girdi) ≈215 KB'lık bir tile yanıtı ediyordu. 24 girdi ≈ 4 gün ≈ 29 KB.
     * Telefon günlerce veri göndermese de risk yok: [TILE_TAZELIK_MS]'de bir çizelge
     * diskteki yükten yeniden kurulur, 4 günlük ufuk tazeliğin 16 katıdır.
     */
    const val TILE_MAKS_GIRDI = 24
    const val TILE_TAZELIK_MS = 6L * 60 * 60 * 1000
}
