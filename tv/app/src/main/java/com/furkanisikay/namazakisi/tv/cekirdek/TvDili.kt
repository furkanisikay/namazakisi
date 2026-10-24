package com.furkanisikay.namazakisi.tv.cekirdek

/**
 * Saf çekirdeklerin ürettiği pano metinleri — dil başına BİR nesne (W5, çok dil). SAF.
 *
 * TV CİHAZIN dilini izler: arayüz `res/values-xx/strings.xml`'den çözülür, çekirdek ise dili
 * PARAMETRE alır (`dil`, varsayılan "tr" — mevcut testler ve fikstürler değişmez). Çağıran dili
 * `R.string.dil_kodu`'ndan okur: kaynak sisteminin seçtiği dil (desteklenmeyen cihaz dili →
 * Türkçe) ile çekirdek metni AYNI olur.
 *
 * İngilizce karşılıklar telefonun JS sözlüğünden (`src/core/dil/sozluk/en`: `vakit.adlar`,
 * `vakit.cuma`, `sure.kisa`, `tarih`, `samimiyet`) ve `docs/ajan/coklu-dil.md` terim
 * sözlüğünden; serbest çeviri yok. `uppercase()`/`lowercase()` ya da ek üretimi YOK.
 * Yeni dil = yeni `values-xx` dizini + burada yeni nesne + [tvDili] eşlemesi.
 */
interface TvDili {
    val kod: String

    fun vakitAdi(vakit: Vakit): String
    val cuma: String

    /** Ay adları (Ocak..Aralık) ve gün adları (Pazartesi..Pazar, `DayOfWeek` sırası). */
    val aylar: List<String>
    val gunler: List<String>
    fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String): String

    val birimSa: String
    val birimDk: String
    val birimSn: String
    fun saatSesli(n: Int): String
    fun dakikaSesli(n: Int): String
    val birDakikadanAz: String

    fun kerahatAdi(tur: Kerahat.Tur): String
    fun kerahatAciklamasi(tur: Kerahat.Tur): String

    fun bant(ad: String, dk: Long): String
    val kabulDuasi: String
    val iftarSelami: String
    val cumaSelami: String
    val sahuraKalan: String
    val iftaraKalan: String
}

/** Dil kodundan tablo; desteklenmeyen kod Türkçeye düşer (kaynak sisteminin varsayılanı gibi). */
fun tvDili(dil: String): TvDili = when (dil) {
    "en" -> TvDiliEn
    else -> TvDiliTr
}

object TvDiliTr : TvDili {
    override val kod = "tr"
    override fun vakitAdi(vakit: Vakit) = vakit.ad
    override val cuma = "Cuma"
    override val aylar = listOf(
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
    )
    override val gunler = listOf("Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gun $ay $yil, $gunAdi"

    override val birimSa = "sa"
    override val birimDk = "dk"
    override val birimSn = "sn"
    override fun saatSesli(n: Int) = "$n saat"
    override fun dakikaSesli(n: Int) = "$n dakika"
    override val birDakikadanAz = "1 dakikadan az"

    override fun kerahatAdi(tur: Kerahat.Tur) = tur.ad
    override fun kerahatAciklamasi(tur: Kerahat.Tur) = tur.aciklama

    override fun bant(ad: String, dk: Long) = "$ad vakti daralıyor · $dk dk"
    override val kabulDuasi = "Allah kabul etsin"
    override val iftarSelami = "Hayırlı iftarlar"
    override val cumaSelami = "Hayırlı cumalar"
    override val sahuraKalan = "Sahura kalan"
    override val iftaraKalan = "İftara kalan"
}

object TvDiliEn : TvDili {
    override val kod = "en"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Sunrise"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Jumu'ah"
    override val aylar = listOf(
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    )
    override val gunler = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = if (n == 1) "1 hour" else "$n hours"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minute" else "$n minutes"
    override val birDakikadanAz = "less than 1 minute"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Sunrise"
        Kerahat.Tur.ISTIVA -> "Zenith"
        Kerahat.Tur.GURUB -> "Sunset"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Praying is makruh until the sun has risen well."
        Kerahat.Tur.ISTIVA -> "Praying is makruh while the sun is at its zenith."
        Kerahat.Tur.GURUB -> "Praying is makruh while the sun is setting."
    }

    override fun bant(ad: String, dk: Long) = "Time for $ad is running short · $dk min"
    override val kabulDuasi = "May Allah accept it"
    override val iftarSelami = "Blessed iftar"
    override val cumaSelami = "Jumu'ah Mubarak"
    override val sahuraKalan = "Time left for suhoor"
    override val iftaraKalan = "Time left until iftar"
}
