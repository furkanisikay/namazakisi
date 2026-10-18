package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Aktif günün BEŞ FARZ vaktinin durumu (issue #281) — SAF, JVM testli.
 *
 * "Bugün" tile'ı ile günlük ilerleme / gün dağılımı komplikasyonlarının ORTAK
 * kaynağıdır; üçü de aynı soruyu sorar ("bugün kaç vakit kılındı, hangisi kaldı?")
 * ve ayrı ayrı hesaplasalardı bilekte iki yüzey farklı sayı gösterebilirdi.
 * Güneş farz değildir → listede yoktur (paydası daima 5).
 */
object GunDurumu {
    const val FARZ_SAYISI = 5

    enum class Hal {
        /** Telefonda kılındı ya da saatte işaretlenip onay bekliyor. */
        KILINDI,

        /** Vakti girdi, kılınmadı. */
        KALAN,

        /** Vakti henüz girmedi. */
        GIRMEDI,
    }

    data class Ozet(val tarih: String, val satirlar: List<VakitHesabi.Satir>) {
        val kilinanSayisi: Int get() = satirlar.count { it.kilindi }
        val haller: List<Hal> get() = satirlar.map { halBul(it) }
    }

    fun halBul(satir: VakitHesabi.Satir): Hal = when {
        satir.kilindi -> Hal.KILINDI
        satir.girdi -> Hal.KALAN
        else -> Hal.GIRMEDI
    }

    fun ozet(yuk: Yuk, simdi: Long, bugun: String, bekleyen: Set<String>): Ozet? {
        // `satirlar` zaten yalnız namaz döner (güneş `VakitHesabi.namazMi` ile düşer).
        val satirlar = VakitHesabi.satirlar(yuk, simdi, bugun, bekleyen)
        if (satirlar.size != FARZ_SAYISI) return null
        return Ozet(satirlar.first().tarih, satirlar)
    }

    data class Aralik(val baslangic: Long, val bitis: Long, val ozet: Ozet)

    /**
     * Zaman çizelgesi: durum yalnız VAKİT SINIRLARINDA değişir (vakit girer; imsakta
     * aktif gün bir sonrakine geçer). Kılınmışlık yük/iyimser işaretle değişir ve o
     * anda yüzeyler zaten yeniden kurulur — çizelgenin onu öngörmesi gerekmez.
     *
     * `tarihBul` = epoch ms → yerel takvim günü (`YYYY-MM-DD`); enjekte edilir ki
     * test saat dilimine bağlı kalmasın.
     */
    fun cizelge(
        yuk: Yuk,
        simdi: Long,
        bekleyen: Set<String>,
        tarihBul: (Long) -> String,
        maksGirdi: Int = Int.MAX_VALUE,
    ): List<Aralik> {
        val sinirlar = VakitHesabi.tumVakitler(yuk).map { it.ms }.filter { it > simdi }.distinct()
        val sonuc = mutableListOf<Aralik>()
        var bas = simdi
        for (sinir in sinirlar) {
            if (sonuc.size >= maksGirdi) break
            ozet(yuk, bas, tarihBul(bas), bekleyen)?.let { sonuc += Aralik(bas, sinir, it) }
            bas = sinir
        }
        return sonuc
    }

    /**
     * Metin yedeği (eski Wear OS'ta ağırlıklı öğe türü yok): ● kılındı, ◐ vakti
     * girdi kılınmadı, ○ henüz girmedi. Beş karakter kısa metin sınırına (7) sığar.
     */
    fun noktalar(ozet: Ozet): String = ozet.haller.joinToString("") {
        when (it) {
            Hal.KILINDI -> "●"
            Hal.KALAN -> "◐"
            Hal.GIRMEDI -> "○"
        }
    }
}
