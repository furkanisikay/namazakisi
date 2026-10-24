@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.furkanisikay.namazakisi.tv.cekirdek

import com.batoulapps.adhan2.CalculationMethod
import com.batoulapps.adhan2.CalculationParameters
import com.batoulapps.adhan2.Coordinates
import com.batoulapps.adhan2.HighLatitudeRule
import com.batoulapps.adhan2.Madhab
import com.batoulapps.adhan2.PrayerAdjustments
import com.batoulapps.adhan2.PrayerTimes
import com.batoulapps.adhan2.data.DateComponents
import com.batoulapps.adhan2.data.TimeComponents
import com.batoulapps.adhan2.internal.SolarTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
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
 * `turkiyeHesapParametreleri()` (= `CalculationMethod.Turkey()`).
 *
 * DİKKAT — madhab: ikindi = ASR-I EVVEL (gölge 1×; adhan'da `Madhab.SHAFI`). Diyanet
 * takvimi ikindiyi asr-ı evvelle verir (DİYK; kaynak notu
 * `docs/superpowers/specs/2026-10-14-ikindi-vakti-asr-i-evvel-kaynak.md`). Telefonun
 * tek kaynağı `turkiyeHesapParametreleri()` (`Turkey()` varsayılanı). Burada
 * `Madhab.HANAFI` (asr-ı sânî) yazmak ikindiyi telefondan ~45 dk sonraya kaydırırdı.
 * Yüksek enlem kuralı da açıkça yazılır: adhan JS varsayılanı `MiddleOfTheNight`,
 * adhan2'nin varsayılanı (null) enleme göre öneri yapar.
 *
 * Telefon Türkiye dışında başka bir yöntem kullanıyorsa yükte `hesap` gelir (`TvHesap`) ve
 * genel yol çalışır: aynı parametreler adhan2'ye verilir; adhan2 0.0.6'da olmayan akşam açısı
 * (Caferî/Tahran) adhan JS'in kuralıyla burada eklenir.
 *
 * Kilit: `VakitHesabiTest` ↔ `vakit-fiksturu.json` (Türkiye) + `vakit-fiksturu-dunya.json`
 * (genel yol) ↔ jest `TvVakitParitesi.test.ts`.
 */
object VakitHesabi {
    private val PARAMETRELER = CalculationMethod.TURKEY.parameters.copy(
        madhab = Madhab.SHAFI,
        highLatitudeRule = HighLatitudeRule.MIDDLE_OF_THE_NIGHT,
    )

    private const val DK_MS = 60_000L

    fun hesapla(lat: Double, lng: Double, tarih: LocalDate, hesap: TvHesap? = null): GunlukVakitler {
        val koordinat = Coordinates(lat, lng)
        val gun = DateComponents(tarih.year, tarih.monthValue, tarih.dayOfMonth)
        val pt = PrayerTimes(koordinat, gun, hesap?.let { parametreler(it, tarih) } ?: PARAMETRELER)
        val aksam = hesap?.aksamAcisi?.let { aci -> aciliAksam(koordinat, gun, aci, hesap, pt.isha.toEpochMilliseconds()) }
        return GunlukVakitler(
            imsak = pt.fajr.toEpochMilliseconds(),
            gunes = pt.sunrise.toEpochMilliseconds(),
            ogle = pt.dhuhr.toEpochMilliseconds(),
            ikindi = pt.asr.toEpochMilliseconds(),
            aksam = aksam ?: pt.maghrib.toEpochMilliseconds(),
            yatsi = pt.isha.toEpochMilliseconds(),
        )
    }

    /** Telefonun `hesapParametreleriOlustur` çıktısının adhan2 karşılığı (düzeltmeler toplam). */
    private fun parametreler(h: TvHesap, tarih: LocalDate): CalculationParameters {
        val ramazanEki = h.ramazan
            ?.takeIf { h.yatsiAraligi > 0 && !tarih.isBefore(it.bas) && !tarih.isAfter(it.son) }
            ?.dk ?: 0
        return CalculationParameters(
            fajrAngle = h.fecrAcisi,
            ishaAngle = h.yatsiAcisi,
            ishaInterval = h.yatsiAraligi + ramazanEki,
            method = if (h.ay) CalculationMethod.MOON_SIGHTING_COMMITTEE else CalculationMethod.OTHER,
            madhab = if (h.sani) Madhab.HANAFI else Madhab.SHAFI,
            highLatitudeRule = h.yuksekEnlem,
            prayerAdjustments = PrayerAdjustments(
                fajr = h.ofset[0], sunrise = h.ofset[1], dhuhr = h.ofset[2],
                asr = h.ofset[3], maghrib = h.ofset[4], isha = h.ofset[5],
            ),
        )
    }

    /**
     * adhan JS `PrayerTimes`: güneş `aci` derece batınca akşam olur — yalnız gün batımından
     * sonra ve yatsıdan önceyse. Sonra akşam düzeltmesi eklenir, en yakın dakikaya yuvarlanır.
     * Yatsı sınırı için düzeltmesiz yatsı = son yatsı − yatsı düzeltmesi (en çok 30 sn sapma,
     * yalnız sınırda etkili).
     */
    private fun aciliAksam(k: Coordinates, gun: DateComponents, aci: Double, h: TvHesap, yatsiMs: Long): Long? {
        val gunes = SolarTime(gun, k)
        val acili = TimeComponents.fromDouble(gunes.timeForSolarAngle(-aci, true))
            ?.dateComponents(gun)?.toInstant(TimeZone.UTC)?.toEpochMilliseconds() ?: return null
        val batim = TimeComponents.fromDouble(gunes.sunset)
            ?.dateComponents(gun)?.toInstant(TimeZone.UTC)?.toEpochMilliseconds() ?: return null
        val yatsiHam = yatsiMs - h.ofset[5] * DK_MS
        if (!(batim < acili && yatsiHam > acili)) return null
        return enYakinDakika(acili + h.ofset[4] * DK_MS)
    }

    /** adhan `roundedMinute` (Nearest): 30 sn ve üstü yukarı. */
    private fun enYakinDakika(ms: Long): Long {
        val sn = Math.floorMod(ms / 1000L, 60L)
        val tabanMs = ms - Math.floorMod(ms, 1000L) - sn * 1000L
        return if (sn >= 30) tabanMs + DK_MS else tabanMs
    }
}
