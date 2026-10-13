package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * "Son dakikalar" (issue #281) — kadranda dokunulabilir sayacın (Ongoing Activity)
 * NE ZAMAN görüneceği. SAF, JVM testli.
 *
 * Kural: yalnız KILINMAMIŞ bir vaktin SON penceresinde. Google'ın Ongoing Activity
 * politikası sürekli bir "sonraki vakit" kartına izin vermez → pencere telefonun
 * muhafız planından türetilir (saatte ikinci motor YOK, AGENTS.md):
 *
 *  - Vaktin en sert adımı (plan kayıtlarındaki en yüksek seviye) ilk tetiklendiği an
 *    pencereyi açar. Giriş yönlü vakitte en sert adım saatlerce sürebilir, bu yüzden
 *    açılış en erken `çıkış − TAVAN_MS`'dir ("son dakikalar" adı gereği).
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
            val enSert = kayitlar.maxOf { it.seviye }
            val ilkSert = kayitlar.filter { it.seviye == enSert }.minOf { it.ms }
            val enErken = maxOf(ilkSert, bitis - TAVAN_MS)
            val bas = kayitlar.filter { it.ms in enErken until bitis }.minOfOrNull { it.ms }
                ?: return@mapNotNull null
            Pencere(tarih, vakit, bas, bitis)
        }.sortedBy { it.bas }

    /** Şu an açık olan pencere (kılınmışsa yok). */
    fun aktif(yuk: Yuk?, bekleyen: Set<String>, simdi: Long): Pencere? {
        if (yuk == null) return null
        return pencereler(yuk).firstOrNull {
            simdi >= it.bas && simdi < it.bitis &&
                !AlarmZinciri.kilinmisMi(yuk, bekleyen, it.tarih, it.vakit)
        }
    }
}
