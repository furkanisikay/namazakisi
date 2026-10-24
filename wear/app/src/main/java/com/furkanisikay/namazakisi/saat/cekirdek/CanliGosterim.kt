package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Saatin canlı sayacı (Ongoing Activity) — NE gösterilir? SAF, JVM testli (issue #282).
 *
 * İki kaynak, TEK gösterim (telefondaki "aynı anda tek öne çıkan" kuralının aynası):
 *  - "Son dakikalar" (`SonDakikalar`, muhafız planından): kullanıcı Now Bar'da o
 *    vakti "sayaçla" açık tuttuysa (`CanliSecim.vakitler`). Seçim yoksa (eski
 *    telefon) her vakit eskisi gibi gösterilir.
 *  - Telefonun zaman çizelgesinden gelen dilimler (`CanliSecim.pencereler`): iftar,
 *    sahur, cuma, nafile, seri ve "vakit girince / son N dk" seçilen vakitler.
 *
 * Kazanan: küçük `oncelik` (son dakikalar = vakit = 1), eşitlikte bitişi yakın
 * olan, yine eşitse son dakikalar. Kılınmış vaktin hiçbir dilimi gösterilmez.
 */
object CanliGosterim {
    const val VAKIT_ONCELIGI = 1

    data class Gosterim(
        val baslik: String,
        /** Kısa ad (Ongoing durum metni) */
        val ad: String,
        val bitis: Long,
        /** Yalnız vakit gösteriminde: "Kıldım" eylemi ve ikon */
        val tarih: String?,
        val vakit: String?,
        /** İkon seçimi için öğe ("iftar", "ogle"…) */
        val oge: String,
        /** Muhafız planından gelen "son dakikalar" mı? (başlık "… vakti çıkıyor") */
        val sonDakikalar: Boolean,
    )

    private data class Aday(val g: Gosterim, val oncelik: Int, val sira: Int)

    /** Şu an gösterilecek tek sayaç (yoksa null). */
    fun aktif(yuk: Yuk?, bekleyen: Set<String>, simdi: Long, dil: String = "tr"): Gosterim? {
        if (yuk == null) return null
        val adaylar = mutableListOf<Aday>()
        sonDakikaPencereleri(yuk)
            .filter { simdi >= it.bas && simdi < it.bitis && !AlarmZinciri.kilinmisMi(yuk, bekleyen, it.tarih, it.vakit) }
            .forEach {
                adaylar += Aday(
                    Gosterim(saatDili(dil).vaktiCikiyor(it.ad(dil)), it.ad(dil), it.bitis, it.tarih, it.vakit, it.vakit, true),
                    VAKIT_ONCELIGI,
                    0,
                )
            }
        yuk.canli?.pencereler.orEmpty()
            .filter { simdi >= it.bas && simdi < it.bitis }
            .filter { it.tarih == null || it.vakit == null || !AlarmZinciri.kilinmisMi(yuk, bekleyen, it.tarih, it.vakit) }
            .forEach { adaylar += Aday(Gosterim(it.baslik, it.ad, it.bitis, it.tarih, it.vakit, it.oge, false), it.oncelik, 1) }
        return adaylar.minWithOrNull(compareBy<Aday>({ it.oncelik }, { it.g.bitis }, { it.sira }))?.g
    }

    /** Kullanıcının "sayaçla" açık tuttuğu vakitlerin son dakika pencereleri. */
    fun sonDakikaPencereleri(yuk: Yuk): List<SonDakikalar.Pencere> {
        val secim = yuk.canli?.vakitler
        return SonDakikalar.pencereler(yuk).filter { secim == null || secim[it.vakit] == true }
    }

    /**
     * Gösterimin değişebileceği bir sonraki an (dilim başı/sonu). Yalnız seçim
     * varken (yeni telefon): eski davranışta "son dakikalar" zaten plan kaydında açılır.
     * Son dakikaların BİTİŞİ de sınırdır: altında süren bir dilim (ör. iftar) o an
     * yeniden gösterilmeli.
     */
    fun sonrakiSinir(yuk: Yuk?, simdi: Long): Long? {
        val canli = yuk?.canli ?: return null
        val anlar = canli.pencereler.flatMap { listOf(it.bas, it.bitis) } +
            sonDakikaPencereleri(yuk).map { it.bitis }
        return anlar.filter { it > simdi }.minOrNull()
    }
}
