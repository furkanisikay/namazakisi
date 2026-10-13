package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * "Son dakikalar" (issue #281) — kadranda dokunulabilir sayacın (Ongoing Activity)
 * NE ZAMAN görüneceği. SAF, JVM testli.
 *
 * Kural: yalnız KILINMAMIŞ bir vaktin SON penceresinde. Google'ın Ongoing Activity
 * politikası sürekli bir "sonraki vakit" kartına izin vermez → pencere telefonun
 * muhafız planından türetilir (saatte ikinci motor YOK, AGENTS.md):
 *
 *  - Vaktin zamanca SON adımı ilk tetiklendiği an pencereyi açar (issue #274).
 *    "En sert adım" (en yüksek seviye) DEĞİL: ton artık sırayı ima etmez ve geri
 *    gidebilir (sert → nazik); en sert adım vaktin başına düşerse pencere saatler
 *    önce açılırdı. Son adım yükteki `adim` alanından (kronolojik sıra) bulunur;
 *    eski telefon yükünde alan yoksa kayıtlar zamana göre dizilir ve SONDAN geriye
 *    aynı tonu taşıyan ardışık kayıtlar tek adım sayılır (yaklaşık). Giriş yönlü
 *    vakitte son adım saatlerce sürebilir, bu yüzden açılış en erken
 *    `çıkış − TAVAN_MS`'dir ("son dakikalar" adı gereği).
 *  - Açılış her zaman BİR PLAN KAYDININ anına düşer: saat zinciri yalnız plan
 *    kayıtlarında uyanır (aynı anda tek alarm); kaydı olmayan bir anda başlayan
 *    pencere ancak bir sonraki kayıtta görünürdü. Tavandan sonra hiç kayıt yoksa
 *    pencere yoktur.
 *  - Kapanış vaktin çıkışıdır (bir sonraki vaktin girişi; yatsı → ertesi imsak).
 *
 * Muhafız kapalıysa plan boştur → sayaç da yoktur (bilinçli: kullanıcı
 * hatırlatma istemiyorsa kadranına da bir şey konmaz).
 */
object SonDakikalar {
    /** Pencere en fazla bu kadar önce açılır. */
    const val TAVAN_MS = 60 * 60_000L

    data class Pencere(
        val tarih: String,
        val vakit: String,
        val bas: Long,
        /** Vaktin çıkışı — sayaç buraya sayar. */
        val bitis: Long,
    ) {
        val ad: String get() = VakitHesabi.ADLAR[vakit] ?: vakit
    }

    private val SONRAKI = mapOf("imsak" to "gunes", "ogle" to "ikindi", "ikindi" to "aksam", "aksam" to "yatsi")

    /** Vaktin çıkışı; yük o anı bilmiyorsa (son günün yatsısı) null. */
    fun cikis(yuk: Yuk, tarih: String, vakit: String): Long? {
        val idx = yuk.gunler.indexOfFirst { it.tarih == tarih }
        if (idx < 0) return null
        val gun = yuk.gunler[idx]
        SONRAKI[vakit]?.let { return gun.vakitler[it] }
        if (vakit != "yatsi") return null
        val ertesi = yuk.gunler.getOrNull(idx + 1) ?: return null
        return ertesi.vakitler["imsak"]
    }

    fun pencereler(yuk: Yuk): List<Pencere> =
        yuk.plan.groupBy { it.tarih to it.vakit }.mapNotNull { (anahtar, kayitlar) ->
            val (tarih, vakit) = anahtar
            val bitis = cikis(yuk, tarih, vakit) ?: return@mapNotNull null
            val enErken = maxOf(sonAdiminIlkTetigi(kayitlar), bitis - TAVAN_MS)
            val bas = kayitlar.filter { it.ms in enErken until bitis }.minOfOrNull { it.ms }
                ?: return@mapNotNull null
            Pencere(tarih, vakit, bas, bitis)
        }.sortedBy { it.bas }

    /** Bir vaktin kayıtlarında zamanca SON adımın ilk tetik anı. */
    internal fun sonAdiminIlkTetigi(kayitlar: List<PlanKaydi>): Long {
        val sirali = kayitlar.sortedBy { it.ms }
        val son = sirali.last()
        if (sirali.all { it.adim != null }) {
            // Kronolojik sıra = zaman sırası → en büyük `adim` son adımdır.
            val sonAdim = sirali.maxOf { it.adim!! }
            return sirali.first { it.adim == sonAdim }.ms
        }
        // Eski yük: sondan geriye aynı tonlu ardışık kayıtlar tek adım.
        var i = sirali.lastIndex
        while (i > 0 && sirali[i - 1].seviye == son.seviye) i--
        return sirali[i].ms
    }

    /** Şu an açık olan pencere (kılınmışsa yok). */
    fun aktif(yuk: Yuk?, bekleyen: Set<String>, simdi: Long): Pencere? {
        if (yuk == null) return null
        return pencereler(yuk).firstOrNull {
            simdi >= it.bas && simdi < it.bitis &&
                !AlarmZinciri.kilinmisMi(yuk, bekleyen, it.tarih, it.vakit)
        }
    }
}
