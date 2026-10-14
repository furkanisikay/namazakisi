@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.furkanisikay.namazakisi.tv.cekirdek

import com.batoulapps.adhan2.CalculationMethod
import com.batoulapps.adhan2.Coordinates
import com.batoulapps.adhan2.HighLatitudeRule
import com.batoulapps.adhan2.Madhab
import com.batoulapps.adhan2.PrayerTimes
import com.batoulapps.adhan2.data.DateComponents
import java.time.LocalDate

/**
 * Altı vakit. `kod` telefonun `VakitAdi` anahtar uzayıyla aynıdır.
 * Görünen adlar sabit yazılır (`toUpperCase`/`toLowerCase` Türkçe tuzağı yok).
 */
enum class Vakit(val kod: String, val ad: String) {
    IMSAK("imsak", "İmsak"),
    GUNES("gunes", "Güneş"),
    OGLE("ogle", "Öğle"),
    IKINDI("ikindi", "İkindi"),
    AKSAM("aksam", "Akşam"),
    YATSI("yatsi", "Yatsı"),
}

/** Bir takvim gününün vakitleri (epoch ms, dakikaya yuvarlanmış). */
data class GunlukVakitler(
    val imsak: Long,
    val gunes: Long,
    val ogle: Long,
    val ikindi: Long,
    val aksam: Long,
    val yatsi: Long,
) {
    fun saat(vakit: Vakit): Long = when (vakit) {
        Vakit.IMSAK -> imsak
        Vakit.GUNES -> gunes
        Vakit.OGLE -> ogle
        Vakit.IKINDI -> ikindi
        Vakit.AKSAM -> aksam
        Vakit.YATSI -> yatsi
    }

    fun sirali(): List<Pair<Vakit, Long>> = Vakit.entries.map { it to saat(it) }
}

/**
 * Telefonla AYNI hesap (issue #286). Telefon: `adhan` JS +
 * `CalculationMethod.Turkey()` (`NamazVaktiHesaplayiciServisi.prayerTimesAl`).
 *
 * DİKKAT — madhab: telefonun yapılandırmasında `madhab: 'Hanafi'` alanı DURUR ama
 * hesap yolu onu `PrayerTimes`'a hiç geçirmez → adhan varsayılanı ŞAFİÎ (asr-ı evvel,
 * gölge 1×) kullanılır; Diyanet takvimi de ikindiyi asr-ı evvelle verir. Burada
 * `Madhab.HANAFI` yazmak ikindiyi telefondan ~45 dk sonraya kaydırırdı.
 * Yüksek enlem kuralı da açıkça yazılır: adhan JS varsayılanı `MiddleOfTheNight`,
 * adhan2'nin varsayılanı (null) enleme göre öneri yapar.
 *
 * Kilit: `VakitHesabiTest` ↔ `vakit-fiksturu.json` ↔ jest `TvVakitParitesi.test.ts`.
 */
object VakitHesabi {
    private val PARAMETRELER = CalculationMethod.TURKEY.parameters.copy(
        madhab = Madhab.SHAFI,
        highLatitudeRule = HighLatitudeRule.MIDDLE_OF_THE_NIGHT,
    )

    fun hesapla(lat: Double, lng: Double, tarih: LocalDate): GunlukVakitler {
        val pt = PrayerTimes(
            Coordinates(lat, lng),
            DateComponents(tarih.year, tarih.monthValue, tarih.dayOfMonth),
            PARAMETRELER,
        )
        return GunlukVakitler(
            imsak = pt.fajr.toEpochMilliseconds(),
            gunes = pt.sunrise.toEpochMilliseconds(),
            ogle = pt.dhuhr.toEpochMilliseconds(),
            ikindi = pt.asr.toEpochMilliseconds(),
            aksam = pt.maghrib.toEpochMilliseconds(),
            yatsi = pt.isha.toEpochMilliseconds(),
        )
    }
}
