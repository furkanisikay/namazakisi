package com.furkanisikay.namazakisi.cekirdek

/**
 * Widget vakit sınırı alarmının KURULUŞ biçimi — SAF (JVM testi: SinirAlarmiTest).
 *
 * İki şart birlikte: alarm cihazı UYANDIRMAZ (`RTC`; widget yalnız ekran açıkken
 * görünür) ve ekran açıldığında GECİKMEDEN teslim edilir. `setWindow(RTC, …, 5 sn)`
 * ikinci şartı tutmuyordu: API 31+'da AlarmManager kesin olmayan pencereyi en az
 * 10 dakikaya genişletir → widget vakit girdikten sonra 10 dk'ya kadar eski vakti
 * gösterebiliyordu.
 *
 * - API < 31: `setExact(RTC)` izin istemez → TAM.
 * - API 31+: tam alarm izni varsa (`canScheduleExactAlarms`) TAM; yoksa izinsiz
 *   tam alarm SecurityException atar → PENCERE (sistem ≥10 dk'ya genişletir;
 *   kabul edilen bedel, sayaç yine de negatife düşer ve bitiş saati yazılıdır).
 */
object SinirAlarmi {
    enum class Yontem { TAM, PENCERE }

    /** Android 12 (S) — kesin olmayan pencerenin 10 dk alt sınırı ve tam alarm izni. */
    const val API_S = 31

    fun yontem(sdk: Int, tamAlarmIzniVar: Boolean): Yontem =
        if (sdk < API_S || tamAlarmIzniVar) Yontem.TAM else Yontem.PENCERE
}
