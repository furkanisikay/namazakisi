package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Canlı sayaç (Ongoing Activity / Now Bar) ve muhafız bildirimi İKON kararı — SAF, JVM testli.
 *
 * Sahip geri bildirimi (v0.51): Now Bar saatte önce YALNIZ ikonla görünür ("metin + ikon"
 * telefondaki Now Bar ayarıdır). Bu yüzden ikon TEK BAŞINA bilgi taşımalı:
 *  - "Vakit çıkıyor" (son dakikalar, acil muhafız uyarısı) → o vaktin simgesi + KUM SAATİ
 *    rozeti (`cikiyor_<vakit>`): hangi vakit + "süre bitiyor" ikisi birden okunur.
 *  - Vakit dışı öğeler kendi anlamlı simgesini alır: cuma → cami, seri → alev, teheccüd →
 *    hilal ve yıldızlar; iftar/sahur/kuşluk/evvâbîn bağlı oldukları vaktin simgesini
 *    (akşam güneşi / tan / doğan güneş / batan güneş).
 *
 * Dönen anahtar `R.drawable.ic_<anahtar>` adına eşlenir (`SonDakikalarBildirimi`); bilinmeyen
 * öğe genel hilal simgesine (`vakit_yatsi`) düşer.
 */
object CanliIkon {
    /** Kum saati rozetli simgesi olan farz vakitler. */
    val CIKIYOR_VAKITLERI = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")

    /** Vakit dışı öğenin simgesi için bağlı olduğu vakit. */
    private val OGE_VAKTI = mapOf(
        "iftar" to "aksam",
        "sahur" to "imsak",
        "kusluk" to "gunes",
        "evvabin" to "aksam",
    )

    /** Kendi simgesi olan öğeler. */
    private val OZEL = mapOf(
        "cuma" to "cami",
        "seri" to "seri",
        "teheccud" to "teheccud",
    )

    private val VAKITLER = setOf("imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi")

    fun anahtar(oge: String, vakit: String?, sonDakikalar: Boolean): String {
        if (sonDakikalar && vakit in CIKIYOR_VAKITLERI) return "cikiyor_$vakit"
        OZEL[oge]?.let { return it }
        return vakitAnahtari(vakit ?: OGE_VAKTI[oge] ?: oge)
    }

    /** Muhafız bildirimi: acil (son dakikalar) uyarıda kum saatli simge, değilse vaktin simgesi. */
    fun muhafiz(vakit: String, acil: Boolean): String =
        if (acil && vakit in CIKIYOR_VAKITLERI) "cikiyor_$vakit" else vakitAnahtari(vakit)

    private fun vakitAnahtari(vakit: String): String = if (vakit in VAKITLER) "vakit_$vakit" else "vakit_yatsi"
}
