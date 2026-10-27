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

    /**
     * Zikir adı (`Tesbihat.Faz.ad(dil)`) o dilin Müslüman topluluğunun yaygın okunuşudur
     * (çeviri değil; en "Alhamdulillah", Türkçe "Elhamdülillâh"); çerçeve metni [dil]'de.
     */
    fun icerik(d: Tesbihat.Durum, dil: String = "tr"): Icerik {
        val m = saatDili(dil)
        val alt = "${d.toplam} / ${Tesbihat.TOPLAM}"
        val ad = d.faz.ad(dil)
        return when {
            d.tamamMi -> Icerik(m.kabulDuasi, null, alt, "${m.tesbihatTamamlandi}. ${m.kabulDuasi}, $alt")
            d.faz == Tesbihat.Faz.TEHLIL -> Icerik(ad, null, alt, "$ad. ${m.toplam} $alt")
            else -> Icerik(
                ad,
                d.fazSayisi.toString(),
                alt,
                "$ad, ${d.fazSayisi} / ${d.faz.hedef}. ${m.toplam} $alt",
            )
        }
    }
}
