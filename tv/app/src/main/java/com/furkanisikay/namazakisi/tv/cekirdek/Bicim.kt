package com.furkanisikay.namazakisi.tv.cekirdek

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Pano metin biçimleri — SAF. Ay/gün adları sabit tablodan gelir (cihazın yerel
 * ayarına ve `Locale("tr")` varlığına bağımlı değil; TV'nin sistem dili İngilizce
 * olsa da pano Türkçe okunur).
 */
object Bicim {
    private val AYLAR = listOf(
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
    )
    private val GUNLER = listOf("Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar")

    private fun iki(n: Int): String = n.toString().padStart(2, '0')

    /** "05:42" */
    fun saat(ms: Long, bolge: ZoneId): String {
        val z = Instant.ofEpochMilli(ms).atZone(bolge)
        return "${iki(z.hour)}:${iki(z.minute)}"
    }

    /** Saniye ayrı çizilir (büyük saatte küçük punto): "07" */
    fun saniye(ms: Long, bolge: ZoneId): String =
        iki(Instant.ofEpochMilli(ms).atZone(bolge).second)

    /** "13 Ekim 2026, Salı" */
    fun tarih(gun: LocalDate): String =
        "${gun.dayOfMonth} ${AYLAR[gun.monthValue - 1]} ${gun.year}, ${GUNLER[gun.dayOfWeek.value - 1]}"

    /**
     * Geri sayım: bir saatten fazlaysa "2:05:09", değilse "05:09".
     * Saniye AŞAĞI yuvarlanır (kalan 59,9 sn → "00:59"); sıfırda "00:00".
     */
    fun geriSayim(kalanMs: Long): String {
        val toplamSn = (kalanMs.coerceAtLeast(0) / 1000).toInt()
        val sa = toplamSn / 3600
        val dk = (toplamSn % 3600) / 60
        val sn = toplamSn % 60
        return if (sa > 0) "$sa:${iki(dk)}:${iki(sn)}" else "${iki(dk)}:${iki(sn)}"
    }
}
