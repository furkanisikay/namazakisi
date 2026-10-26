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
 * Yeni dil = yeni `values-xx` dizini + burada yeni nesne + [tvDili] / [TV_DILLERI] eşlemesi.
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur; çevrilmemiş dilin nesnesi
 * İngilizcenin birebir kopyasıdır ve `// ÇEVİRİ: <kod>` satırıyla başlar. Endonezce kaynak
 * dizini `values-in`'dir (`dil_kodu` yine "id"). Nöbetçi: `TvDiliTest`.
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
    "id", "in" -> TvDiliId
    "de" -> TvDiliDe
    "fr" -> TvDiliFr
    "bs" -> TvDiliBs
    "ru" -> TvDiliRu
    "ms" -> TvDiliMs
    "ar" -> TvDiliAr
    "ur" -> TvDiliUr
    else -> TvDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur). */
val TV_DILLERI: List<TvDili> = listOf(
    TvDiliTr, TvDiliEn, TvDiliId, TvDiliDe, TvDiliFr, TvDiliBs, TvDiliRu, TvDiliMs, TvDiliAr, TvDiliUr,
)

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

// id — Endonezce (beta): JS `sozluk/id` (`vakit`, `tarih`, `sure.kisa`, `samimiyet`, `anaEkran.kerahat`).
object TvDiliId : TvDili {
    override val kod = "id"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subuh"
        Vakit.GUNES -> "Terbit"
        Vakit.OGLE -> "Dzuhur"
        Vakit.IKINDI -> "Ashar"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isya"
    }
    override val cuma = "Jumat"
    override val aylar = listOf(
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    )
    override val gunler = listOf("Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "j"
    override val birimDk = "mnt"
    override val birimSn = "dtk"
    override fun saatSesli(n: Int) = "$n jam"
    override fun dakikaSesli(n: Int) = "$n menit"
    override val birDakikadanAz = "kurang dari 1 menit"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Matahari terbit"
        Kerahat.Tur.ISTIVA -> "Istiwa"
        Kerahat.Tur.GURUB -> "Matahari terbenam"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Menunaikan salat makruh hingga matahari naik cukup tinggi."
        Kerahat.Tur.ISTIVA -> "Menunaikan salat makruh saat matahari tepat di atas kepala."
        Kerahat.Tur.GURUB -> "Menunaikan salat makruh saat matahari terbenam."
    }

    override fun bant(ad: String, dk: Long) = "Waktu $ad makin sempit · $dk mnt"
    override val kabulDuasi = "Semoga Allah menerimanya"
    override val iftarSelami = "Selamat berbuka puasa"
    override val cumaSelami = "Jumat berkah"
    override val sahuraKalan = "Sisa waktu sahur"
    override val iftaraKalan = "Sisa waktu hingga berbuka"
}

// de — Almanca (beta): JS `sozluk/de` (`vakit.adlar`, `vakit.cuma`, `sure.kisa`, `tarih`, `samimiyet`)
object TvDiliDe : TvDili {
    override val kod = "de"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Sonnenaufgang"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Freitagsgebet"
    override val aylar = listOf(
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember",
    )
    override val gunler = listOf("Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun. $ay $yil"

    override val birimSa = "Std."
    override val birimDk = "Min."
    override val birimSn = "Sek."
    override fun saatSesli(n: Int) = if (n == 1) "1 Stunde" else "$n Stunden"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 Minute" else "$n Minuten"
    override val birDakikadanAz = "weniger als 1 Minute"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Sonnenaufgang"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Sonnenuntergang"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Das Gebet ist makruh, bis die Sonne deutlich gestiegen ist."
        Kerahat.Tur.ISTIVA -> "Das Gebet ist makruh, solange die Sonne im Zenit steht."
        Kerahat.Tur.GURUB -> "Das Gebet ist makruh, während die Sonne untergeht."
    }

    override fun bant(ad: String, dk: Long) = "Die Zeit für $ad wird knapp · $dk Min."
    override val kabulDuasi = "Möge Allah es annehmen"
    override val iftarSelami = "Ein gesegnetes Iftar"
    override val cumaSelami = "Einen gesegneten Freitag"
    override val sahuraKalan = "Verbleibende Zeit für Suhur"
    override val iftaraKalan = "Verbleibende Zeit bis Iftar"
}

// fr
object TvDiliFr : TvDili {
    override val kod = "fr"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Lever du soleil"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Joumoua"
    override val aylar = listOf(
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    )
    override val gunler = listOf("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi $gun $ay $yil"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "$n heure" else "$n heures"
    override fun dakikaSesli(n: Int) = if (n == 0 || n == 1) "$n minute" else "$n minutes"
    override val birDakikadanAz = "moins d’une minute"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Lever du soleil"
        Kerahat.Tur.ISTIVA -> "Zénith"
        Kerahat.Tur.GURUB -> "Coucher du soleil"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Il est makrouh de prier tant que le soleil n’est pas bien levé."
        Kerahat.Tur.ISTIVA -> "Il est makrouh de prier quand le soleil est au zénith."
        Kerahat.Tur.GURUB -> "Il est makrouh de prier pendant le coucher du soleil."
    }

    override fun bant(ad: String, dk: Long) = "$ad · le temps se resserre · $dk min"
    override val kabulDuasi = "Qu’Allah l’accepte"
    override val iftarSelami = "Bon iftar"
    override val cumaSelami = "Joumoua moubaraka"
    override val sahuraKalan = "Temps restant pour le souhour"
    override val iftaraKalan = "Temps restant avant l’iftar"
}

// bs
object TvDiliBs : TvDili {
    override val kod = "bs"

    /** Pano çizelgedir: sabah satırı JS `vakit.imsakVakti` ("Zora"). */
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Zora"
        Vakit.GUNES -> "Izlazak sunca"
        Vakit.OGLE -> "Podne"
        Vakit.IKINDI -> "Ikindija"
        Vakit.AKSAM -> "Akšam"
        Vakit.YATSI -> "Jacija"
    }
    override val cuma = "Džuma"
    override val aylar = listOf(
        "januar", "februar", "mart", "april", "maj", "juni",
        "juli", "august", "septembar", "oktobar", "novembar", "decembar",
    )
    override val gunler = listOf("ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota", "nedjelja")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun. $ay $yil."

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"

    /** CLDR (bs): one = …1 (…11 hariç); few = …2–4 (…12–14 hariç); kalanı other (JS `cogul.ts`). */
    private fun cogul(n: Int, one: String, few: String, other: String): String {
        val s10 = n % 10
        val s100 = n % 100
        val kalip = when {
            s10 == 1 && s100 != 11 -> one
            s10 in 2..4 && s100 !in 12..14 -> few
            else -> other
        }
        return "$n $kalip"
    }

    override fun saatSesli(n: Int) = cogul(n, "sat", "sata", "sati")
    override fun dakikaSesli(n: Int) = cogul(n, "minuta", "minute", "minuta")
    override val birDakikadanAz = "manje od 1 minute"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Izlazak sunca"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Zalazak sunca"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Klanjati je mekruh dok se sunce dobro ne podigne."
        Kerahat.Tur.ISTIVA -> "Klanjati je mekruh dok je sunce u zenitu."
        Kerahat.Tur.GURUB -> "Klanjati je mekruh dok sunce zalazi."
    }

    override fun bant(ad: String, dk: Long) = "$ad: vakat se bliži kraju · $dk min"
    override val kabulDuasi = "Allah kabul ejlesun"
    override val iftarSelami = "Hajirli iftar"
    override val cumaSelami = "Hajirli džuma"
    override val sahuraKalan = "Do kraja sehura"
    override val iftaraKalan = "Do iftara"
}

// ru
object TvDiliRu : TvDili {
    override val kod = "ru"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Фаджр"
        Vakit.GUNES -> "Восход"
        Vakit.OGLE -> "Зухр"
        Vakit.IKINDI -> "Аср"
        Vakit.AKSAM -> "Магриб"
        Vakit.YATSI -> "Иша"
    }
    override val cuma = "Джума"

    /** Tarih içinde (ilgi hâli, "25 октября"); tek başına ay adı kullanılmaz. */
    override val aylar = listOf(
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря",
    )
    override val gunler = listOf("Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil г."

    /** CLDR ru: one (1, 21…), few (2–4, 22–24…), many (geri kalan tamsayılar). */
    private fun cogul(n: Int, one: String, few: String, many: String): String {
        val s10 = n % 10
        val s100 = n % 100
        return when {
            s10 == 1 && s100 != 11 -> one
            s10 in 2..4 && s100 !in 12..14 -> few
            else -> many
        }
    }

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override fun saatSesli(n: Int) = cogul(n, "$n час", "$n часа", "$n часов")
    override fun dakikaSesli(n: Int) = cogul(n, "$n минута", "$n минуты", "$n минут")
    override val birDakikadanAz = "меньше минуты"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Восход солнца"
        Kerahat.Tur.ISTIVA -> "Зенит"
        Kerahat.Tur.GURUB -> "Закат"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Совершать намаз нежелательно (макрух), пока солнце не поднимется достаточно высоко."
        Kerahat.Tur.ISTIVA -> "Совершать намаз нежелательно (макрух), пока солнце в зените."
        Kerahat.Tur.GURUB -> "Совершать намаз нежелательно (макрух), пока солнце заходит."
    }

    override fun bant(ad: String, dk: Long) = "Время намаза $ad на исходе · $dk мин"
    override val kabulDuasi = "Да примет Аллах"
    override val iftarSelami = "Благословенного ифтара"
    override val cumaSelami = "Джума мубарак"
    override val sahuraKalan = "До конца сухура"
    override val iftaraKalan = "До ифтара"
}

// ms
object TvDiliMs : TvDili {
    override val kod = "ms"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subuh"
        Vakit.GUNES -> "Syuruk"
        Vakit.OGLE -> "Zohor"
        Vakit.IKINDI -> "Asar"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isyak"
    }
    override val cuma = "Jumaat"
    override val aylar = listOf(
        "Januari", "Februari", "Mac", "April", "Mei", "Jun",
        "Julai", "Ogos", "September", "Oktober", "November", "Disember",
    )
    override val gunler = listOf("Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "j"
    override val birimDk = "min"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = "$n jam"
    override fun dakikaSesli(n: Int) = "$n minit"
    override val birDakikadanAz = "kurang daripada 1 minit"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Syuruk"
        Kerahat.Tur.ISTIVA -> "Istiwa"
        Kerahat.Tur.GURUB -> "Ghurub"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Solat adalah makruh sehingga matahari naik tinggi."
        Kerahat.Tur.ISTIVA -> "Solat adalah makruh ketika matahari tepat di atas kepala."
        Kerahat.Tur.GURUB -> "Solat adalah makruh ketika matahari terbenam."
    }

    override fun bant(ad: String, dk: Long) = "Waktu $ad semakin suntuk · $dk min"
    override val kabulDuasi = "Semoga Allah menerimanya"
    override val iftarSelami = "Selamat berbuka puasa"
    override val cumaSelami = "Salam Jumaat"
    override val sahuraKalan = "Baki masa untuk bersahur"
    override val iftaraKalan = "Baki masa sehingga berbuka"
}


// ÇEVİRİ: ar
object TvDiliAr : TvDili {
    override val kod = "ar"

    /**
     * CLDR ar (JS `cogul.ts > arapca`): zero = 0, one = 1, two = 2, few = …03–…10,
     * many = …11–…99, kalanı other (100, 101, 102…). Çeviride her kategori kendi kalıbını alır.
     */
    fun cogulKategorisi(n: Int): String {
        val s100 = n % 100
        return when {
            n == 0 -> "zero"
            n == 1 -> "one"
            n == 2 -> "two"
            s100 in 3..10 -> "few"
            s100 in 11..99 -> "many"
            else -> "other"
        }
    }

    private fun cogul(n: Int, zero: String, one: String, two: String, few: String, many: String, other: String) =
        when (cogulKategorisi(n)) {
            "zero" -> zero
            "one" -> one
            "two" -> two
            "few" -> few
            "many" -> many
            else -> other
        }

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
    override fun saatSesli(n: Int) = cogul(n, "$n hours", "1 hour", "$n hours", "$n hours", "$n hours", "$n hours")
    override fun dakikaSesli(n: Int) = cogul(n, "$n minutes", "1 minute", "$n minutes", "$n minutes", "$n minutes", "$n minutes")
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


// ÇEVİRİ: ur
// CLDR ur: one/other — İngilizceyle aynı çoğul düzeni.
object TvDiliUr : TvDili {
    override val kod = "ur"
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
