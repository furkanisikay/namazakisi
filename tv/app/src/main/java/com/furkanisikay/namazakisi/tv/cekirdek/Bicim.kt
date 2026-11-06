package com.furkanisikay.namazakisi.tv.cekirdek

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * Pano metin biçimleri — SAF. Ay/gün adları ve birimler `TvDili` tablosundan gelir (cihazın
 * `Locale`'ine ve ICU'ya bağımlı değil); dil PARAMETREDİR (varsayılan Türkçe), çağıran
 * `R.string.dil_kodu`'nu verir — pano cihaz dilini izler.
 */
object Bicim {

    private fun iki(n: Int): String = n.toString().padStart(2, '0')

    /** "05:42" */
    fun saat(ms: Long, bolge: ZoneId): String {
        val z = Instant.ofEpochMilli(ms).atZone(bolge)
        return "${iki(z.hour)}:${iki(z.minute)}"
    }

    /** Saniye ayrı çizilir (büyük saatte küçük punto): "07" */
    fun saniye(ms: Long, bolge: ZoneId): String =
        iki(Instant.ofEpochMilli(ms).atZone(bolge).second)

    /** "13 Ekim 2026, Salı" / "Tuesday, 13 October 2026" */
    fun tarih(gun: LocalDate, dil: String = "tr"): String {
        val d = tvDili(dil)
        return d.tarih(gun.dayOfMonth, d.aylar[gun.monthValue - 1], gun.year, d.gunler[gun.dayOfWeek.value - 1])
    }

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
    fun kalanParcalari(kalanMs: Long, dil: String = "tr"): List<SureParcasi> {
        val d = tvDili(dil)
        val toplamSn = (kalanMs.coerceAtLeast(0) / 1000).toInt()
        val sa = toplamSn / 3600
        val dk = (toplamSn % 3600) / 60
        val sn = toplamSn % 60
        return when {
            sa > 0 -> listOf(SureParcasi("$sa", d.birimSa), SureParcasi("$dk", d.birimDk))
            dk > 0 -> listOf(SureParcasi("$dk", d.birimDk), SureParcasi(iki(sn), d.birimSn))
            else -> listOf(SureParcasi("$sn", d.birimSn))
        }
    }

    /** Tek satır birimli süre ("5 sa 2 dk", "18 dk 05 sn", "42 sn") — ikincil satırlar için. */
    fun kalanKisa(kalanMs: Long, dil: String = "tr"): String {
        // Boşluklar dilden (`birimAyirici`/`parcaAyirici`; Çince "5小时2分钟").
        val d = tvDili(dil)
        return kalanParcalari(kalanMs, dil).joinToString(d.parcaAyirici) { "${it.sayi}${d.birimAyirici}${it.birim}" }
    }

    /** Ekran okuyucu metni, DAKİKA çözünürlüklü: "1 saat 16 dakika", "18 dakika", "1 dakikadan az". */
    fun kalanSesli(kalanMs: Long, dil: String = "tr"): String {
        val d = tvDili(dil)
        val toplamDk = (kalanMs.coerceAtLeast(0) / 60_000).toInt()
        val sa = toplamDk / 60
        val dk = toplamDk % 60
        return when {
            sa > 0 && dk > 0 -> "${d.saatSesli(sa)}${d.parcaAyirici}${d.dakikaSesli(dk)}"
            sa > 0 -> d.saatSesli(sa)
            dk > 0 -> d.dakikaSesli(dk)
            else -> d.birDakikadanAz
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
