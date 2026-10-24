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
import com.batoulapps.adhan2.model.Rounding
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
    ;

    /** [dil]deki görünen ad (`TvDili`); [ad] Türkçedir. */
    fun ad(dil: String): String = tvDili(dil).vakitAdi(this)
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
        if (hesap == null) {
            val pt = PrayerTimes(koordinat, gun, PARAMETRELER)
            return GunlukVakitler(
                imsak = pt.fajr.toEpochMilliseconds(),
                gunes = pt.sunrise.toEpochMilliseconds(),
                ogle = pt.dhuhr.toEpochMilliseconds(),
                ikindi = pt.asr.toEpochMilliseconds(),
                aksam = pt.maghrib.toEpochMilliseconds(),
                yatsi = pt.isha.toEpochMilliseconds(),
            )
        }
        // Genel yol: adhan2 yuvarlamadan hesaplar, yuvarlama adhan JS kuralıyla burada yapılır
        // (JS "yukarı" saniye 0'da da +1 dk ekler, adhan2 eklemez).
        val pt = PrayerTimes(koordinat, gun, parametreler(hesap, tarih))
        val yuvarla = { ms: Long -> jsDakika(ms, hesap.yukari) }
        // Açı tabanlı yolda sabah/yatsı JS aritmetiğiyle (gece kesri milisaniyeye kırpılır);
        // Moonsighting'in mevsimsel sınırı tam saniyedir, adhan2'ninki aynı çıkar.
        val sinir = if (hesap.ay) null else aciliSabahYatsi(koordinat, tarih, hesap, pt.isha.toEpochMilliseconds())
        val imsak = sinir?.first ?: pt.fajr.toEpochMilliseconds()
        val yatsiHam = sinir?.second ?: pt.isha.toEpochMilliseconds()
        val aksam = hesap.aksamAcisi?.let { aci -> aciliAksam(koordinat, gun, aci, hesap, yatsiHam) }
        return GunlukVakitler(
            imsak = yuvarla(imsak),
            gunes = yuvarla(pt.sunrise.toEpochMilliseconds()),
            ogle = yuvarla(pt.dhuhr.toEpochMilliseconds()),
            ikindi = yuvarla(pt.asr.toEpochMilliseconds()),
            aksam = yuvarla(aksam ?: pt.maghrib.toEpochMilliseconds()),
            yatsi = yuvarla(yatsiHam),
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
            rounding = Rounding.NONE,
        )
    }

    /**
     * adhan JS `PrayerTimes`: güneş `aci` derece batınca akşam olur — yalnız gün batımından
     * sonra ve yatsıdan önceyse; sonra akşam düzeltmesi eklenir (yuvarlama çağıranda).
     * `yatsiMs` yuvarlanmamış, düzeltmeli yatsıdır; düzeltme çıkarılınca JS'in ham yatsısı.
     */
    private fun aciliAksam(k: Coordinates, gun: DateComponents, aci: Double, h: TvHesap, yatsiMs: Long): Long? {
        val gunes = SolarTime(gun, k)
        val acili = TimeComponents.fromDouble(gunes.timeForSolarAngle(-aci, true))
            ?.dateComponents(gun)?.toInstant(TimeZone.UTC)?.toEpochMilliseconds() ?: return null
        val batim = TimeComponents.fromDouble(gunes.sunset)
            ?.dateComponents(gun)?.toInstant(TimeZone.UTC)?.toEpochMilliseconds() ?: return null
        val yatsiHam = yatsiMs - h.ofset[5] * DK_MS
        if (!(batim < acili && yatsiHam > acili)) return null
        return acili + h.ofset[4] * DK_MS
    }

    /**
     * adhan JS `roundedMinute`: saniye alanına bakar, milisaniyeyi KORUR (gece kesrinden gelen
     * artık sonuçta kalır). En yakın: 30 sn ve üstü ileri; yukarı: saniye 0'da da +1 dk.
     */
    private fun jsDakika(ms: Long, yukari: Boolean): Long {
        val sn = Math.floorMod(Math.floorDiv(ms, 1000L), 60L)
        val kayma = if (yukari || sn >= 30) 60L - sn else -sn
        return ms + kayma * 1000L
    }

    private fun anMs(gun: DateComponents, saat: Double): Long? =
        TimeComponents.fromDouble(saat)?.dateComponents(gun)?.toInstant(TimeZone.UTC)?.toEpochMilliseconds()

    /**
     * adhan JS'in açı tabanlı sabah/yatsısı + gece kesri sınırı, DÜZELTMELİ (yuvarlamasız).
     * JS: `new Date(gunes + (-kesir * geceSn) * 1000)` → milisaniyeye kırpar; adhan2 tam saniyeye
     * kırptığı için yüksek enlemde (Oslo, Berlin yazın) bir saniyeye kadar ayrışır ve yuvarlama
     * sınırında dakikayı değiştirebilir. Hesaplanamazsa (kutup) null → adhan2 sonucu.
     */
    private fun aciliSabahYatsi(k: Coordinates, tarih: LocalDate, h: TvHesap, adhan2YatsiMs: Long): Pair<Long, Long>? {
        val gun = DateComponents(tarih.year, tarih.monthValue, tarih.dayOfMonth)
        val yarin = tarih.plusDays(1)
        val yarinGun = DateComponents(yarin.year, yarin.monthValue, yarin.dayOfMonth)
        val gunes = SolarTime(gun, k)
        val dogus = anMs(gun, gunes.sunrise) ?: return null
        val batim = anMs(gun, gunes.sunset) ?: return null
        val yarinDogus = anMs(yarinGun, SolarTime(yarinGun, k).sunrise) ?: return null
        val geceSn = (yarinDogus - batim) / 1000.0
        val (sabahKesri, yatsiKesri) = when (h.yuksekEnlem) {
            HighLatitudeRule.MIDDLE_OF_THE_NIGHT -> 1.0 / 2.0 to 1.0 / 2.0
            HighLatitudeRule.SEVENTH_OF_THE_NIGHT -> 1.0 / 7.0 to 1.0 / 7.0
            HighLatitudeRule.TWILIGHT_ANGLE -> h.fecrAcisi / 60.0 to h.yatsiAcisi / 60.0
        }
        val guvenliSabah = (dogus + (-sabahKesri * geceSn) * 1000.0).toLong()
        val sabahAci = anMs(gun, gunes.timeForSolarAngle(-h.fecrAcisi, false))
        val sabah = if (sabahAci == null || guvenliSabah > sabahAci) guvenliSabah else sabahAci
        val yatsi = if (h.yatsiAraligi > 0) {
            // Yatsı aralığı (Ramazan eki dahil) adhan2'de de tam dakikadır.
            adhan2YatsiMs - h.ofset[5] * DK_MS
        } else {
            val guvenliYatsi = (batim + (yatsiKesri * geceSn) * 1000.0).toLong()
            val yatsiAci = anMs(gun, gunes.timeForSolarAngle(-h.yatsiAcisi, true))
            if (yatsiAci == null || guvenliYatsi < yatsiAci) guvenliYatsi else yatsiAci
        }
        return (sabah + h.ofset[0] * DK_MS) to (yatsi + h.ofset[5] * DK_MS)
    }
}
