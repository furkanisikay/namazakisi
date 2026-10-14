package com.furkanisikay.namazakisi.tv.cekirdek

import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Panonun bir andaki hâli — SAF (android import etmez), zaman ve saat dilimi enjekte.
 *
 * @property tarih gösterilen TAKVİM günü (vakit listesi bu günündür; gece yarısından
 *   sonra imsak girene dek liste yeni günü gösterir, aktif vakit yine dünün yatsısıdır).
 * @property aktif şu an içinde bulunulan vakit; imsak öncesi [Vakit.YATSI] (dünün yatsısı).
 * @property siradaki girişi beklenen vakit; yatsıdan sonra YARININ imsakı.
 */
data class PanoDurumu(
    val tarih: LocalDate,
    val vakitler: GunlukVakitler,
    val aktif: Vakit,
    val siradaki: Vakit,
    val siradakiMs: Long,
    val kalanMs: Long,
    val cuma: Boolean,
    val kerahat: Kerahat.Pencere?,
    val siradakiKerahat: Kerahat.Pencere?,
) {
    /** Cuma günü öğle satırı "Cuma" diye okunur (telefondaki `namazGorunenAdi` gibi; salt görünüm). */
    fun gorunenAd(vakit: Vakit): String = if (cuma && vakit == Vakit.OGLE) "Cuma" else vakit.ad
}

object PanoHesabi {
    fun hesapla(
        simdiMs: Long,
        bolge: ZoneId,
        vakitleriHesapla: (LocalDate) -> GunlukVakitler,
    ): PanoDurumu {
        val bugun = Instant.ofEpochMilli(simdiMs).atZone(bolge).toLocalDate()
        val v = vakitleriHesapla(bugun)
        val sirali = v.sirali()

        val aktif = sirali.lastOrNull { it.second <= simdiMs }?.first ?: Vakit.YATSI
        val sonraki = sirali.firstOrNull { it.second > simdiMs }
        val (siradaki, siradakiMs) = sonraki
            ?: (Vakit.IMSAK to vakitleriHesapla(bugun.plusDays(1)).imsak)

        return PanoDurumu(
            tarih = bugun,
            vakitler = v,
            aktif = aktif,
            siradaki = siradaki,
            siradakiMs = siradakiMs,
            kalanMs = (siradakiMs - simdiMs).coerceAtLeast(0),
            cuma = bugun.dayOfWeek == DayOfWeek.FRIDAY,
            kerahat = Kerahat.aktif(v, simdiMs),
            siradakiKerahat = Kerahat.siradaki(v, simdiMs),
        )
    }
}
