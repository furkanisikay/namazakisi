package com.furkanisikay.namazakisi.cekirdek

/**
 * Cihaz durumu köprülerinin SAF kararları (sade tasarım, Dalga 1). Android import ETMEZ;
 * JVM testi `CihazDurumKurallariTest`.
 *
 * JS tarafı (`core/cihaz/durumNotlari.ts`) aynı üç değerli sözleşmeyi kullanır:
 * `null` = bilinmiyor → ekran SUSAR (yanlış uyarı, hiç uyarmamaktan kötüdür).
 */
object CihazDurumKurallari {
    /** Eşli Wear OS saati şu an bağlı. */
    const val SAAT_ESLI = "esli"

    /** Wear API var ama bağlı saat yok. */
    const val SAAT_ESLI_DEGIL = "esliDegil"

    /** Cihazda Play Hizmetleri / Wearable API yok (Huawei, de-Googled). */
    const val SAAT_YOK = "yok"

    /**
     * Saat durumu. Bağlı düğüm sayısı okunamadıysa (geçici hata) `null`.
     *
     * @param wearApiYok Play Hizmetleri yok ya da Wearable API mevcut değil.
     */
    fun saatDurumu(wearApiYok: Boolean, bagliDugumSayisi: Int?): String? = when {
        wearApiYok -> SAAT_YOK
        bagliDugumSayisi == null || bagliDugumSayisi < 0 -> null
        bagliDugumSayisi == 0 -> SAAT_ESLI_DEGIL
        else -> SAAT_ESLI
    }

    /** Sağlayıcı başına eklenmiş widget sayısı → en az bir widget var mı. */
    fun widgetEkliMi(saglayiciBasinaSayi: List<Int>): Boolean = saglayiciBasinaSayi.any { it > 0 }
}
