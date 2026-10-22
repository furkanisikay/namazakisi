package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Tesbihat sayacının always-on (ambient) görünümü — SAF kararlar, JVM testli (issue #293).
 *
 * Ambient'te ekran kısılır, dokunuş ve taç olayı uygulamaya GELMEZ; kullanıcı yalnız
 * nerede kaldığını görür (o anki faz + sayı). Sayım ambient'ten çıkınca sürer.
 * Burn-in kaydırması ana ekranla ortaktır: `AmbientKaydirma`.
 */
object TesbihatAmbient {
    /** Kaydırma kuralı ana ekranla ORTAK: `AmbientKaydirma` (davranış aynı). */
    const val KAYDIRMA_DP = AmbientKaydirma.KAYDIRMA_DP

    const val SISTEM_KAYDIRMA_API = AmbientKaydirma.SISTEM_KAYDIRMA_API

    fun sistemKaydiriyor(sdk: Int): Boolean = AmbientKaydirma.sistemKaydiriyor(sdk)

    fun kaydirma(adim: Int, burnInKorumasi: Boolean, sdk: Int): AmbientKaydirma.Kaydirma =
        AmbientKaydirma.kaydirma(adim, burnInKorumasi, sdk)

    /**
     * Ambient'te gösterilecek metin. `sayi` null ise büyük rakam çizilmez (tehlil tek
     * sözdür, tamamlanınca da sayılacak bir şey kalmaz).
     */
    data class Icerik(val baslik: String, val sayi: String?, val alt: String, val aciklama: String)

    fun icerik(d: Tesbihat.Durum): Icerik {
        val alt = "${d.toplam} / ${Tesbihat.TOPLAM}"
        return when {
            d.tamamMi -> Icerik(AnaEkranKarari.KABUL_DUASI, null, alt, "Tesbihat tamamlandı. ${AnaEkranKarari.KABUL_DUASI}, $alt")
            d.faz == Tesbihat.Faz.TEHLIL -> Icerik(d.faz.ad, null, alt, "${d.faz.ad}. Toplam $alt")
            else -> Icerik(
                d.faz.ad,
                d.fazSayisi.toString(),
                alt,
                "${d.faz.ad}, ${d.fazSayisi} / ${d.faz.hedef}. Toplam $alt",
            )
        }
    }
}
