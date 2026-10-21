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

    /** Birimli süre parçası: iri rakam + küçük birim ("18" + "dk"). */
    data class SureParcasi(val sayi: String, val birim: String)

    /**
     * Panodaki geri sayımın GÖRÜNEN biçimi — birimli, saatle karışmaz.
     * Eski "18:25" (18 dk 25 sn) duvar saatinin yanında saat gibi okunuyordu.
     *  - bir saat ve üstü: "1 sa 16 dk" (saniye yok; saatlerce saniye saymak gürültü)
     *  - bir saatin altı: "18 dk 05 sn" (saniye iki haneli → satır oynamaz)
     *  - bir dakikanın altı: "42 sn"
     * Saniye AŞAĞI yuvarlanır (kalan 59,9 sn → "59 sn"); sıfırda "0 sn".
     */
    fun kalanParcalari(kalanMs: Long): List<SureParcasi> {
        val toplamSn = (kalanMs.coerceAtLeast(0) / 1000).toInt()
        val sa = toplamSn / 3600
        val dk = (toplamSn % 3600) / 60
        val sn = toplamSn % 60
        return when {
            sa > 0 -> listOf(SureParcasi("$sa", "sa"), SureParcasi("$dk", "dk"))
            dk > 0 -> listOf(SureParcasi("$dk", "dk"), SureParcasi(iki(sn), "sn"))
            else -> listOf(SureParcasi("$sn", "sn"))
        }
    }

    /** Ekran okuyucu metni, DAKİKA çözünürlüklü: "1 saat 16 dakika", "18 dakika", "1 dakikadan az". */
    fun kalanSesli(kalanMs: Long): String {
        val toplamDk = (kalanMs.coerceAtLeast(0) / 60_000).toInt()
        val sa = toplamDk / 60
        val dk = toplamDk % 60
        return when {
            sa > 0 && dk > 0 -> "$sa saat $dk dakika"
            sa > 0 -> "$sa saat"
            dk > 0 -> "$dk dakika"
            else -> "1 dakikadan az"
        }
    }

    /** Şu anki vaktin geçen kısmı [0,1] (başlangıç→sıradaki); geçersiz aralıkta 0. */
    fun ilerleme(baslangicMs: Long, bitisMs: Long, simdiMs: Long): Float {
        if (bitisMs <= baslangicMs) return 0f
        return ((simdiMs - baslangicMs).toFloat() / (bitisMs - baslangicMs)).coerceIn(0f, 1f)
    }

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
