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
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo
 * (Özbekçe Latin, Kazakça Kiril yazılır: `docs/ajan/coklu-dil.md > Alfabe`); çevrilmemiş dilin nesnesi
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
    "es" -> TvDiliEs
    "nl" -> TvDiliNl
    "sq" -> TvDiliSq
    "hi" -> TvDiliHi
    "bn" -> TvDiliBn
    "fa" -> TvDiliFa
    "ps" -> TvDiliPs
    "ckb" -> TvDiliCkb
    "ug" -> TvDiliUg
    "az" -> TvDiliAz
    "uz" -> TvDiliUz
    "kk" -> TvDiliKk
    "ky" -> TvDiliKy
    "tg" -> TvDiliTg
    "sw" -> TvDiliSw
    "ha" -> TvDiliHa
    "am" -> TvDiliAm
    "om" -> TvDiliOm
    "so" -> TvDiliSo
    "ff" -> TvDiliFf
    "yo" -> TvDiliYo
    else -> TvDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo). */
val TV_DILLERI: List<TvDili> = listOf(
    TvDiliTr, TvDiliEn, TvDiliId, TvDiliDe, TvDiliFr, TvDiliBs, TvDiliRu, TvDiliMs, TvDiliAr, TvDiliUr,
    TvDiliEs, TvDiliNl, TvDiliSq, TvDiliHi, TvDiliBn,
    TvDiliFa, TvDiliPs, TvDiliCkb, TvDiliUg,
    TvDiliAz, TvDiliUz, TvDiliKk, TvDiliKy, TvDiliTg,
    TvDiliSw, TvDiliHa, TvDiliAm, TvDiliOm, TvDiliSo, TvDiliFf, TvDiliYo,
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


// ar — Arapça (beta): JS `sozluk/ar` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
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
        Vakit.IMSAK -> "الفجر"
        Vakit.GUNES -> "الشروق"
        Vakit.OGLE -> "الظهر"
        Vakit.IKINDI -> "العصر"
        Vakit.AKSAM -> "المغرب"
        Vakit.YATSI -> "العشاء"
    }
    override val cuma = "الجمعة"
    override val aylar = listOf(
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
    )
    override val gunler = listOf("الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi، $gun $ay $yil"

    override val birimSa = "س"
    override val birimDk = "د"
    override val birimSn = "ث"
    override fun saatSesli(n: Int) = cogul(n, "$n ساعة", "ساعة واحدة", "ساعتان", "$n ساعات", "$n ساعة", "$n ساعة")
    override fun dakikaSesli(n: Int) = cogul(n, "$n دقيقة", "دقيقة واحدة", "دقيقتان", "$n دقائق", "$n دقيقة", "$n دقيقة")
    override val birDakikadanAz = "أقل من دقيقة"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "الشروق"
        Kerahat.Tur.ISTIVA -> "الاستواء"
        Kerahat.Tur.GURUB -> "الغروب"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "تُكره الصلاة حتى ترتفع الشمس."
        Kerahat.Tur.ISTIVA -> "تُكره الصلاة والشمس في كبد السماء."
        Kerahat.Tur.GURUB -> "تُكره الصلاة والشمس تغرب."
    }

    override fun bant(ad: String, dk: Long) = "وقت $ad يضيق · $dk د"
    override val kabulDuasi = "تقبّل الله"
    override val iftarSelami = "إفطار مبارك"
    override val cumaSelami = "جمعة مباركة"
    override val sahuraKalan = "المتبقي على نهاية السحور"
    override val iftaraKalan = "المتبقي على الإفطار"
}


// ur
// CLDR ur: one/other (JS `sozluk/ur/sure.ts`); Urducada süre birimi kısaltılmaz.
object TvDiliUr : TvDili {
    override val kod = "ur"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "فجر"
        Vakit.GUNES -> "طلوعِ آفتاب"
        Vakit.OGLE -> "ظہر"
        Vakit.IKINDI -> "عصر"
        Vakit.AKSAM -> "مغرب"
        Vakit.YATSI -> "عشاء"
    }
    override val cuma = "جمعہ"
    override val aylar = listOf(
        "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
        "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر",
    )
    override val gunler = listOf("پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi، $gun $ay $yil"

    override val birimSa = "گھنٹے"
    override val birimDk = "منٹ"
    override val birimSn = "سیکنڈ"
    override fun saatSesli(n: Int) = if (n == 1) "1 گھنٹہ" else "$n گھنٹے"
    override fun dakikaSesli(n: Int) = "$n منٹ"
    override val birDakikadanAz = "1 منٹ سے کم"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "طلوعِ آفتاب"
        Kerahat.Tur.ISTIVA -> "زوال"
        Kerahat.Tur.GURUB -> "غروبِ آفتاب"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "سورج اچھی طرح بلند ہونے تک نماز پڑھنا مکروہ ہے۔"
        Kerahat.Tur.ISTIVA -> "سورج عین سر پر ہو تو نماز پڑھنا مکروہ ہے۔"
        Kerahat.Tur.GURUB -> "سورج غروب ہوتے وقت نماز پڑھنا مکروہ ہے۔"
    }

    override fun bant(ad: String, dk: Long) = "$ad کا وقت تنگ ہو رہا ہے · $dk منٹ"
    override val kabulDuasi = "اللہ قبول فرمائے"
    override val iftarSelami = "افطار بابرکت ہو"
    override val cumaSelami = "جمعہ مبارک"
    override val sahuraKalan = "سحری میں باقی وقت"
    override val iftaraKalan = "افطار تک باقی وقت"
}

// es — İspanyolca (beta): JS `sozluk/es` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat); hitap "usted".
// CLDR es: one = 1, many = 1.000.000 katları, other (JS `cogul.ts > ispanyolca`); süre için many = other.
object TvDiliEs : TvDili {
    override val kod = "es"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Salida del sol"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Yumu’a"
    override val aylar = listOf(
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    )
    override val gunler = listOf("lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun de $ay de $yil"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = if (n == 1) "1 hora" else "$n horas"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minuto" else "$n minutos"
    override val birDakikadanAz = "menos de 1 minuto"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Salida del sol"
        Kerahat.Tur.ISTIVA -> "Cénit"
        Kerahat.Tur.GURUB -> "Puesta del sol"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Es makruh rezar hasta que el sol haya subido bien."
        Kerahat.Tur.ISTIVA -> "Es makruh rezar cuando el sol está en el cénit."
        Kerahat.Tur.GURUB -> "Es makruh rezar durante la puesta del sol."
    }

    override fun bant(ad: String, dk: Long) = "$ad · el tiempo se acorta · $dk min"
    override val kabulDuasi = "Que Allah lo acepte"
    override val iftarSelami = "Bendito iftar"
    override val cumaSelami = "Yumu’a Mubarak"
    override val sahuraKalan = "Tiempo restante para el suhur"
    override val iftaraKalan = "Tiempo restante hasta el iftar"
}

// nl — Felemenkçe (beta): JS `sozluk/nl` (`vakit.adlar`, `vakit.cuma`, `sure.kisa`, `tarih`, `samimiyet`, `anaEkran.kerahat`).
// CLDR nl: one/other — İngilizceyle aynı çoğul düzeni. Gün/ay adları küçük harf ("zaterdag 24 oktober 2026").
object TvDiliNl : TvDili {
    override val kod = "nl"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Zonsopkomst"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Djoemoe'a"
    override val aylar = listOf(
        "januari", "februari", "maart", "april", "mei", "juni",
        "juli", "augustus", "september", "oktober", "november", "december",
    )
    override val gunler = listOf("maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi $gun $ay $yil"

    override val birimSa = "u"
    override val birimDk = "min"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = "$n uur"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minuut" else "$n minuten"
    override val birDakikadanAz = "minder dan 1 minuut"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Zonsopkomst"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Zonsondergang"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Bidden is makruh tot de zon goed is opgekomen."
        Kerahat.Tur.ISTIVA -> "Bidden is makruh terwijl de zon in het zenit staat."
        Kerahat.Tur.GURUB -> "Bidden is makruh terwijl de zon ondergaat."
    }

    override fun bant(ad: String, dk: Long) = "De tijd voor $ad wordt krap · $dk min"
    override val kabulDuasi = "Moge Allah het accepteren"
    override val iftarSelami = "Een gezegende iftar"
    override val cumaSelami = "Djoemoe'a moebarak"
    override val sahuraKalan = "Resterende tijd voor de suhoor"
    override val iftaraKalan = "Resterende tijd tot iftar"
}

// sq — Arnavutça (beta): JS `sozluk/sq` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat).
// CLDR sq: one/other. Pano sabah satırı JS `vakit.imsakVakti` ("Sabahu").
object TvDiliSq : TvDili {
    override val kod = "sq"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Sabahu"
        Vakit.GUNES -> "Lindja e Diellit"
        Vakit.OGLE -> "Dreka"
        Vakit.IKINDI -> "Ikindia"
        Vakit.AKSAM -> "Akshami"
        Vakit.YATSI -> "Jacia"
    }
    override val cuma = "Xhumaja"
    override val aylar = listOf(
        "janar", "shkurt", "mars", "prill", "maj", "qershor",
        "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor",
    )
    override val gunler = listOf("E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë", "E diel")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "orë"
    override val birimDk = "min"
    override val birimSn = "sek"
    override fun saatSesli(n: Int) = "$n orë"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minutë" else "$n minuta"
    override val birDakikadanAz = "më pak se 1 minutë"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Lindja e diellit"
        Kerahat.Tur.ISTIVA -> "Zeniti"
        Kerahat.Tur.GURUB -> "Perëndimi i diellit"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Është mekruh të falet namaz derisa dielli të ngrihet mirë."
        Kerahat.Tur.ISTIVA -> "Është mekruh të falet namaz kur dielli është në zenit."
        Kerahat.Tur.GURUB -> "Është mekruh të falet namaz kur dielli po perëndon."
    }

    override fun bant(ad: String, dk: Long) = "$ad: koha po ngushtohet · $dk min"
    override val kabulDuasi = "Allahu e pranoftë"
    override val iftarSelami = "Iftar të bekuar"
    override val cumaSelami = "Xhumaja mubarek"
    override val sahuraKalan = "Deri në fund të syfyrit"
    override val iftaraKalan = "Deri në iftar"
}

// hi — Hintçe (beta): JS `sozluk/hi` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR hi: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Hintçede süre birimi kısaltılmaz.
object TvDiliHi : TvDili {
    override val kod = "hi"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "फ़ज्र"
        Vakit.GUNES -> "सूर्योदय"
        Vakit.OGLE -> "ज़ुहर"
        Vakit.IKINDI -> "अस्र"
        Vakit.AKSAM -> "मग़रिब"
        Vakit.YATSI -> "इशा"
    }
    override val cuma = "जुमा"
    override val aylar = listOf(
        "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
        "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर",
    )
    override val gunler = listOf("सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "घंटे"
    override val birimDk = "मिनट"
    override val birimSn = "सेकंड"
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "$n घंटा" else "$n घंटे"
    override fun dakikaSesli(n: Int) = "$n मिनट"
    override val birDakikadanAz = "1 मिनट से कम"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "सूर्योदय"
        Kerahat.Tur.ISTIVA -> "ज़वाल"
        Kerahat.Tur.GURUB -> "सूर्यास्त"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "सूरज अच्छी तरह ऊपर आने तक नमाज़ पढ़ना मकरूह है।"
        Kerahat.Tur.ISTIVA -> "सूरज ठीक सिर पर हो तो नमाज़ पढ़ना मकरूह है।"
        Kerahat.Tur.GURUB -> "सूरज डूबते वक़्त नमाज़ पढ़ना मकरूह है।"
    }

    override fun bant(ad: String, dk: Long) = "$ad का वक़्त तंग हो रहा है · $dk मिनट"
    override val kabulDuasi = "अल्लाह क़बूल करे"
    override val iftarSelami = "इफ़्तार बाबरकत हो"
    override val cumaSelami = "जुमा मुबारक"
    override val sahuraKalan = "सहरी में बाक़ी समय"
    override val iftaraKalan = "इफ़्तार तक बाक़ी समय"
}

// bn — Bengalce (beta): JS `sozluk/bn` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR bn: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Bengalcede sayıdan sonra isim çekimlenmez.
object TvDiliBn : TvDili {
    override val kod = "bn"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ফজর"
        Vakit.GUNES -> "সূর্যোদয়"
        Vakit.OGLE -> "যোহর"
        Vakit.IKINDI -> "আসর"
        Vakit.AKSAM -> "মাগরিব"
        Vakit.YATSI -> "ইশা"
    }
    override val cuma = "জুমা"
    override val aylar = listOf(
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
    )
    override val gunler = listOf("সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay} ${yil}"

    override val birimSa = "ঘ"
    override val birimDk = "মি"
    override val birimSn = "সে"
    override fun saatSesli(n: Int) = "${n} ঘণ্টা"
    override fun dakikaSesli(n: Int) = "${n} মিনিট"
    override val birDakikadanAz = "1 মিনিটের কম"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "সূর্যোদয়"
        Kerahat.Tur.ISTIVA -> "ঠিক দুপুর"
        Kerahat.Tur.GURUB -> "সূর্যাস্ত"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "সূর্য ভালোভাবে উঠে যাওয়া পর্যন্ত নামাজ পড়া মাকরূহ।"
        Kerahat.Tur.ISTIVA -> "সূর্য ঠিক মাথার ওপরে থাকার সময় নামাজ পড়া মাকরূহ।"
        Kerahat.Tur.GURUB -> "সূর্য অস্ত যাওয়ার সময় নামাজ পড়া মাকরূহ।"
    }

    override fun bant(ad: String, dk: Long) = "${ad}-এর ওয়াক্ত কমে আসছে · ${dk} মি"
    override val kabulDuasi = "আল্লাহ কবুল করুন"
    override val iftarSelami = "বরকতময় ইফতার"
    override val cumaSelami = "জুমা মোবারক"
    override val sahuraKalan = "সাহরির বাকি সময়"
    override val iftaraKalan = "ইফতার পর্যন্ত বাকি সময়"
}

// fa — Farsça (beta): JS `sozluk/fa` (vakit, tarih, sure, samimiyet). Miladi ay adları İran yazımı.
// CLDR fa: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); sayıdan sonra ad tekildir → iki biçim aynı.
object TvDiliFa : TvDili {
    override val kod = "fa"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "صبح"
        Vakit.GUNES -> "طلوع آفتاب"
        Vakit.OGLE -> "ظهر"
        Vakit.IKINDI -> "عصر"
        Vakit.AKSAM -> "مغرب"
        Vakit.YATSI -> "عشا"
    }
    override val cuma = "جمعه"
    override val aylar = listOf(
        "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
        "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
    )
    override val gunler = listOf("دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi، $gun $ay $yil"

    override val birimSa = "ساعت"
    override val birimDk = "دقیقه"
    override val birimSn = "ثانیه"
    override fun saatSesli(n: Int) = "$n ساعت"
    override fun dakikaSesli(n: Int) = "$n دقیقه"
    override val birDakikadanAz = "کمتر از 1 دقیقه"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "طلوع آفتاب"
        Kerahat.Tur.ISTIVA -> "زوال"
        Kerahat.Tur.GURUB -> "غروب آفتاب"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "تا وقتی آفتاب خوب بالا نیامده، نماز خواندن مکروه است."
        Kerahat.Tur.ISTIVA -> "وقتی آفتاب درست در میانهٔ آسمان است، نماز خواندن مکروه است."
        Kerahat.Tur.GURUB -> "هنگام غروب آفتاب، نماز خواندن مکروه است."
    }

    override fun bant(ad: String, dk: Long) = "وقت $ad رو به تنگی است · $dk دقیقه"
    override val kabulDuasi = "قبول باشد"
    override val iftarSelami = "افطارتان گوارا"
    override val cumaSelami = "جمعه مبارک"
    override val sahuraKalan = "زمان باقی‌مانده برای سحر"
    override val iftaraKalan = "زمان باقی‌مانده تا افطار"
}

// ps — Peştuca (beta): JS `sozluk/ps` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR ps: one/other. Peştucada süre birimi kısaltılmaz (ساعته/دقیقې/ثانیې); gün/ay adları CLDR ps.
object TvDiliPs : TvDili {
    override val kod = "ps"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "سهار"
        Vakit.GUNES -> "لمر ختل"
        Vakit.OGLE -> "ماسپښین"
        Vakit.IKINDI -> "مازدیګر"
        Vakit.AKSAM -> "ماښام"
        Vakit.YATSI -> "ماسخوتن"
    }
    override val cuma = "جمعه"
    override val aylar = listOf(
        "جنوري", "فبروري", "مارچ", "اپریل", "مۍ", "جون",
        "جولای", "اګست", "سپتمبر", "اکتوبر", "نومبر", "دسمبر",
    )
    override val gunler = listOf("دونۍ", "درېنۍ", "څلرنۍ", "پينځنۍ", "جمعه", "اونۍ", "يونۍ")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi، $gun $ay $yil"

    override val birimSa = "ساعته"
    override val birimDk = "دقیقې"
    override val birimSn = "ثانیې"
    override fun saatSesli(n: Int) = if (n == 1) "1 ساعت" else "$n ساعته"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 دقیقه" else "$n دقیقې"
    override val birDakikadanAz = "له یوې دقیقې لږ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "شروق"
        Kerahat.Tur.ISTIVA -> "استوا"
        Kerahat.Tur.GURUB -> "غروب"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "تر هغه چې لمر ښه پورته شي، لمونځ کول مکروه دي."
        Kerahat.Tur.ISTIVA -> "کله چې لمر د سر پر سر وي، لمونځ کول مکروه دي."
        Kerahat.Tur.GURUB -> "کله چې لمر لوېږي، لمونځ کول مکروه دي."
    }

    override fun bant(ad: String, dk: Long) = "د $ad وخت تنګېږي · $dk دقیقې"
    override val kabulDuasi = "الله دې قبول کړي"
    override val iftarSelami = "افطار مو مبارک شه"
    override val cumaSelami = "جمعه مو مبارک شه"
    override val sahuraKalan = "د پېشمني تر پایه پاتې وخت"
    override val iftaraKalan = "تر افطاره پاتې وخت"
}

// ckb
object TvDiliCkb : TvDili {
    override val kod = "ckb"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "بەیانی"
        Vakit.GUNES -> "خۆرھەڵاتن"
        Vakit.OGLE -> "نیوەڕۆ"
        Vakit.IKINDI -> "عەسر"
        Vakit.AKSAM -> "ئێوارە"
        Vakit.YATSI -> "خەوتنان"
    }
    override val cuma = "ھەینی"
    override val aylar = listOf(
        "کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران",
        "تەمووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم",
    )
    override val gunler = listOf("دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "ھەینی", "شەممە", "یەکشەممە")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}، ${gun}ی ${ay}ی ${yil}"

    // Soranîde sayıdan sonra isim tekil: one = other.
    override val birimSa = "کاتژمێر"
    override val birimDk = "خولەک"
    override val birimSn = "چرکە"
    override fun saatSesli(n: Int) = "$n کاتژمێر"
    override fun dakikaSesli(n: Int) = "$n خولەک"
    override val birDakikadanAz = "کەمتر لە 1 خولەک"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "خۆرھەڵاتن"
        Kerahat.Tur.ISTIVA -> "ناوەڕاستی ئاسمان"
        Kerahat.Tur.GURUB -> "خۆرئاوابوون"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "نوێژکردن مەکروھە تا خۆر باش بەرز دەبێتەوە."
        Kerahat.Tur.ISTIVA -> "نوێژکردن مەکروھە تا خۆر لە ناوەڕاستی ئاسماندایە."
        Kerahat.Tur.GURUB -> "نوێژکردن مەکروھە تا خۆر ئاوا دەبێت."
    }

    override fun bant(ad: String, dk: Long) = "کاتی ${ad} کەم ماوە · ${dk} خ"
    override val kabulDuasi = "خوا قبوڵی بکات"
    override val iftarSelami = "بەربانگتان پیرۆز بێت"
    override val cumaSelami = "ھەینیتان پیرۆز بێت"
    override val sahuraKalan = "کاتی ماوە بۆ پارشێو"
    override val iftaraKalan = "کاتی ماوە تا بەربانگ"
}

// ug — Uygurca (beta): JS `sozluk/ug` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR ug: one/other; Uygurcada sayıdan sonra isim çoğul eki almaz, süre birimi kısaltılmaz.
object TvDiliUg : TvDili {
    override val kod = "ug"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "بامدات"
        Vakit.GUNES -> "قۇياش چىقىش"
        Vakit.OGLE -> "پېشىن"
        Vakit.IKINDI -> "ئەسىر"
        Vakit.AKSAM -> "شام"
        Vakit.YATSI -> "خۇپتەن"
    }
    override val cuma = "جۈمە"
    override val aylar = listOf(
        "يانۋار", "فېۋرال", "مارت", "ئاپرېل", "ماي", "ئىيۇن",
        "ئىيۇل", "ئاۋغۇست", "سېنتەبىر", "ئۆكتەبىر", "نويابىر", "دېكابىر",
    )
    override val gunler = listOf("دۈشەنبە", "سەيشەنبە", "چارشەنبە", "پەيشەنبە", "جۈمە", "شەنبە", "يەكشەنبە")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$yil-يىلى $gun-$ay، $gunAdi"

    override val birimSa = "سائەت"
    override val birimDk = "مىنۇت"
    override val birimSn = "سېكۇنت"
    override fun saatSesli(n: Int) = "$n سائەت"
    override fun dakikaSesli(n: Int) = "$n مىنۇت"
    override val birDakikadanAz = "1 مىنۇتتىن ئاز"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "قۇياش چىقىش"
        Kerahat.Tur.ISTIVA -> "ئىستىۋا"
        Kerahat.Tur.GURUB -> "قۇياش پېتىش"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "قۇياش ياخشى كۆتۈرۈلگۈچە ناماز ئوقۇش مەكرۇھ."
        Kerahat.Tur.ISTIVA -> "قۇياش دەل چوققىدا تۇرغاندا ناماز ئوقۇش مەكرۇھ."
        Kerahat.Tur.GURUB -> "قۇياش پېتىۋاتقاندا ناماز ئوقۇش مەكرۇھ."
    }

    override fun bant(ad: String, dk: Long) = "$ad ۋاقتى تارىيىۋاتىدۇ · $dk مىنۇت"
    override val kabulDuasi = "ئاللاھ قوبۇل قىلسۇن"
    override val iftarSelami = "ئىپتارىڭىز مۇبارەك بولسۇن"
    override val cumaSelami = "جۈمە مۇبارەك بولسۇن"
    override val sahuraKalan = "سەھەرلىككە قالغان ۋاقىت"
    override val iftaraKalan = "ئىپتارغا قالغان ۋاقىت"
}

// az — Azərbaycan dili (beta): JS `sozluk/az` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR az: one/other; saydan sonra isim tək qalır. Ay və gün adları CLDR kimi kiçik hərflə ("29 oktyabr 2026, cümə axşamı").
object TvDiliAz : TvDili {
    override val kod = "az"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Sübh"
        Vakit.GUNES -> "Günəş"
        Vakit.OGLE -> "Zöhr"
        Vakit.IKINDI -> "Əsr"
        Vakit.AKSAM -> "Məğrib"
        Vakit.YATSI -> "İşa"
    }
    override val cuma = "Cümə"
    override val aylar = listOf(
        "yanvar", "fevral", "mart", "aprel", "may", "iyun",
        "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
    )
    override val gunler = listOf("bazar ertəsi", "çərşənbə axşamı", "çərşənbə", "cümə axşamı", "cümə", "şənbə", "bazar")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gun $ay $yil, $gunAdi"

    override val birimSa = "saat"
    override val birimDk = "dəq"
    override val birimSn = "san"
    override fun saatSesli(n: Int) = "$n saat"
    override fun dakikaSesli(n: Int) = "$n dəqiqə"
    override val birDakikadanAz = "1 dəqiqədən az"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Günəşin çıxması"
        Kerahat.Tur.ISTIVA -> "İstiva"
        Kerahat.Tur.GURUB -> "Günəşin batması"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Günəş yaxşıca qalxana qədər namaz qılmaq məkruhdur."
        Kerahat.Tur.ISTIVA -> "Günəş zenitdə olanda namaz qılmaq məkruhdur."
        Kerahat.Tur.GURUB -> "Günəş batarkən namaz qılmaq məkruhdur."
    }

    override fun bant(ad: String, dk: Long) = "$ad vaxtı daralır · $dk dəq"
    override val kabulDuasi = "Allah qəbul etsin"
    override val iftarSelami = "İftarınız xeyirli olsun"
    override val cumaSelami = "Cüməniz mübarək olsun"
    override val sahuraKalan = "Sahura qalan"
    override val iftaraKalan = "İftara qalan"
}

// uz — Özbekçe (beta, LATİN): JS `sozluk/uz` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat); Kiril kaynak → kirildenLatine.
// CLDR uz: one/other; sayıdan sonra isim çoğul eki almaz. Ay adları tarih içinde küçük harf.
object TvDiliUz : TvDili {
    override val kod = "uz"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Bomdod"
        Vakit.GUNES -> "Quyosh"
        Vakit.OGLE -> "Peshin"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Shom"
        Vakit.YATSI -> "Xufton"
    }
    override val cuma = "Juma"
    override val aylar = listOf(
        "yanvar", "fevral", "mart", "aprel", "may", "iyun",
        "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
    )
    override val gunler = listOf("Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $yil yil $gun $ay"

    override val birimSa = "soat"
    override val birimDk = "daq"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = "$n soat"
    override fun dakikaSesli(n: Int) = "$n daqiqa"
    override val birDakikadanAz = "1 daqiqadan kam"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Quyosh chiqishi"
        Kerahat.Tur.ISTIVA -> "Istivo"
        Kerahat.Tur.GURUB -> "Quyosh botishi"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Quyosh yaxshi koʻtarilguncha namoz oʻqish makruh."
        Kerahat.Tur.ISTIVA -> "Quyosh osmon oʻrtasida turganda namoz oʻqish makruh."
        Kerahat.Tur.GURUB -> "Quyosh botayotganda namoz oʻqish makruh."
    }

    override fun bant(ad: String, dk: Long) = "$ad vaqti torayyapti · $dk daq"
    override val kabulDuasi = "Alloh qabul qilsin"
    override val iftarSelami = "Iftoringiz muborak boʻlsin"
    override val cumaSelami = "Juma muborak"
    override val sahuraKalan = "Saharlik tugashigacha"
    override val iftaraKalan = "Iftorgacha qolgan vaqt"
}

// kk — Kazakça (beta, Kiril): JS `sozluk/kk` (vakit adları QMDB, `sure.kisa` сағ/мин/с, `tarih`, `samimiyet`).
// CLDR kk: one/other; sayıdan sonra isim çoğul eki almaz. Tarih CLDR uzun biçimi: "2026 ж. 18 қазан, сенбі".
object TvDiliKk : TvDili {
    override val kod = "kk"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Таң"
        Vakit.GUNES -> "Күн"
        Vakit.OGLE -> "Бесін"
        Vakit.IKINDI -> "Екінті"
        Vakit.AKSAM -> "Ақшам"
        Vakit.YATSI -> "Құптан"
    }
    override val cuma = "Жұма"
    override val aylar = listOf(
        "қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым",
        "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан",
    )
    override val gunler = listOf("дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі", "жексенбі")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$yil ж. $gun $ay, $gunAdi"

    override val birimSa = "сағ"
    override val birimDk = "мин"
    override val birimSn = "с"
    override fun saatSesli(n: Int) = "$n сағат"
    override fun dakikaSesli(n: Int) = "$n минут"
    override val birDakikadanAz = "1 минуттан аз"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Күн шығуы"
        Kerahat.Tur.ISTIVA -> "Истиуа"
        Kerahat.Tur.GURUB -> "Күн батуы"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Күн әбден көтерілгенше намаз оқу мәкрүһ."
        Kerahat.Tur.ISTIVA -> "Күн дәл төбеде тұрғанда намаз оқу мәкрүһ."
        Kerahat.Tur.GURUB -> "Күн батып бара жатқанда намаз оқу мәкрүһ."
    }

    override fun bant(ad: String, dk: Long) = "$ad уақыты тарылуда · $dk мин"
    override val kabulDuasi = "Алла қабыл етсін"
    override val iftarSelami = "Ауызашарыңыз қабыл болсын"
    override val cumaSelami = "Жұмаңыз мүбәрак болсын"
    override val sahuraKalan = "Сәресіге қалды"
    override val iftaraKalan = "Ауызашарға қалды"
}

// ky
object TvDiliKy : TvDili {
    override val kod = "ky"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Багымдат"
        Vakit.GUNES -> "Күн чыгыш"
        Vakit.OGLE -> "Бешим"
        Vakit.IKINDI -> "Аср"
        Vakit.AKSAM -> "Шам"
        Vakit.YATSI -> "Куптан"
    }
    override val cuma = "Жума"
    override val aylar = listOf(
        "январь", "февраль", "март", "апрель", "май", "июнь",
        "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
    )
    override val gunler = listOf("Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби", "Жекшемби")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $yil-ж., $gun-$ay"

    override val birimSa = "ст"
    override val birimDk = "мүн"
    override val birimSn = "сек"
    override fun saatSesli(n: Int) = "$n саат"
    override fun dakikaSesli(n: Int) = "$n мүнөт"
    override val birDakikadanAz = "1 мүнөттөн аз"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Күн чыгыш"
        Kerahat.Tur.ISTIVA -> "Зенит"
        Kerahat.Tur.GURUB -> "Күн батыш"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Күн жакшылап көтөрүлгөнчө намаз окуу макрух."
        Kerahat.Tur.ISTIVA -> "Күн зенитте турганда намаз окуу макрух."
        Kerahat.Tur.GURUB -> "Күн батып жатканда намаз окуу макрух."
    }

    override fun bant(ad: String, dk: Long) = "$ad убактысы тарып баратат · $dk мүн"
    override val kabulDuasi = "Алла кабыл кылсын"
    override val iftarSelami = "Ооз ачарыңыз кабыл болсун"
    override val cumaSelami = "Жумаңыз кабыл болсун"
    override val sahuraKalan = "Саарлыкка калган убакыт"
    override val iftaraKalan = "Ооз ачарга калган убакыт"
}

// tg — Tacikçe (beta): JS `sozluk/tg` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR tg: one/other; sayıdan sonra ad tekildir → iki biçim aynı. Ay adı tarih içinde küçük harf (CLDR tg, ь'siz).
object TvDiliTg : TvDili {
    override val kod = "tg"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Бомдод"
        Vakit.GUNES -> "Тулӯъ"
        Vakit.OGLE -> "Пешин"
        Vakit.IKINDI -> "Аср"
        Vakit.AKSAM -> "Шом"
        Vakit.YATSI -> "Хуфтан"
    }
    override val cuma = "Ҷумъа"
    override val aylar = listOf(
        "январ", "феврал", "март", "апрел", "май", "июн",
        "июл", "август", "сентябр", "октябр", "ноябр", "декабр",
    )
    override val gunler = listOf("Душанбе", "Сешанбе", "Чоршанбе", "Панҷшанбе", "Ҷумъа", "Шанбе", "Якшанбе")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "соат"
    override val birimDk = "дақ"
    override val birimSn = "сон"
    override fun saatSesli(n: Int) = "$n соат"
    override fun dakikaSesli(n: Int) = "$n дақиқа"
    override val birDakikadanAz = "камтар аз 1 дақиқа"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Тулӯи офтоб"
        Kerahat.Tur.ISTIVA -> "Истиво"
        Kerahat.Tur.GURUB -> "Ғуруби офтоб"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "То хуб баланд шудани офтоб намоз хондан макрӯҳ аст."
        Kerahat.Tur.ISTIVA -> "Вақте ки офтоб дар авҷи осмон аст, намоз хондан макрӯҳ аст."
        Kerahat.Tur.GURUB -> "Ҳангоми ғуруби офтоб намоз хондан макрӯҳ аст."
    }

    override fun bant(ad: String, dk: Long) = "Вақти $ad танг мешавад · $dk дақ"
    override val kabulDuasi = "Худо қабул кунад"
    override val iftarSelami = "Ифтори пурбаракат"
    override val cumaSelami = "Ҷумъа муборак"
    override val sahuraKalan = "Вақти боқимонда барои саҳарӣ"
    override val iftaraKalan = "Вақти боқимонда то ифтор"
}

// sw
object TvDiliSw : TvDili {
    override val kod = "sw"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Alfajiri"
        Vakit.GUNES -> "Macheo"
        Vakit.OGLE -> "Adhuhuri"
        Vakit.IKINDI -> "Alasiri"
        Vakit.AKSAM -> "Magharibi"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Ijumaa"
    override val aylar = listOf(
        "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni",
        "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba",
    )
    override val gunler = listOf("Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "saa"
    override val birimDk = "dk"
    override val birimSn = "s"
    override fun saatSesli(n: Int) = "saa $n"
    override fun dakikaSesli(n: Int) = "dakika $n"
    override val birDakikadanAz = "chini ya dakika moja"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Macheo"
        Kerahat.Tur.ISTIVA -> "Jua la utosi"
        Kerahat.Tur.GURUB -> "Machweo"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Kuswali ni makruhu hadi jua lipande vizuri."
        Kerahat.Tur.ISTIVA -> "Kuswali ni makruhu jua likiwa katikati ya mbingu."
        Kerahat.Tur.GURUB -> "Kuswali ni makruhu jua likiwa linazama."
    }

    override fun bant(ad: String, dk: Long) = "Muda wa $ad unapungua · dakika $dk"
    override val kabulDuasi = "Mwenyezi Mungu aikubali"
    override val iftarSelami = "Futari yenye baraka"
    override val cumaSelami = "Ijumaa Mubarak"
    override val sahuraKalan = "Muda uliobaki wa daku"
    override val iftaraKalan = "Muda uliobaki hadi futari"
}

// ha
// CLDR ha: one/other (0 çoğul). Hausa'da sayı addan sonra gelir, ad çekilmez ("minti 5").
object TvDiliHa : TvDili {
    override val kod = "ha"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Asuba"
        Vakit.GUNES -> "Fitowar Rana"
        Vakit.OGLE -> "Azahar"
        Vakit.IKINDI -> "Laʼasar"
        Vakit.AKSAM -> "Magariba"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Jumuʼa"
    override val aylar = listOf(
        "Janairu", "Faburairu", "Maris", "Afirilu", "Mayu", "Yuni",
        "Yuli", "Agusta", "Satumba", "Oktoba", "Nuwamba", "Disamba",
    )
    override val gunler = listOf("Litinin", "Talata", "Laraba", "Alhamis", "Jummaʼa", "Asabar", "Lahadi")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay, $yil"

    override val birimSa = "awa"
    override val birimDk = "min"
    override val birimSn = "daƙ"
    override fun saatSesli(n: Int) = "awa $n"
    override fun dakikaSesli(n: Int) = "minti $n"
    override val birDakikadanAz = "ƙasa da minti 1"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Fitowar rana"
        Kerahat.Tur.ISTIVA -> "Tsakiyar rana"
        Kerahat.Tur.GURUB -> "Faɗuwar rana"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Yin salla makaruhi ne har sai rana ta ɗaga sosai."
        Kerahat.Tur.ISTIVA -> "Yin salla makaruhi ne lokacin da rana take tsakiyar sama."
        Kerahat.Tur.GURUB -> "Yin salla makaruhi ne lokacin da rana take faɗuwa."
    }

    override fun bant(ad: String, dk: Long) = "Lokacin $ad yana ƙurewa · minti $dk"
    override val kabulDuasi = "Allah ya karɓa"
    override val iftarSelami = "Barka da buɗa baki"
    override val cumaSelami = "Barka da Jumuʼa"
    override val sahuraKalan = "Lokacin da ya rage na sahur"
    override val iftaraKalan = "Lokacin da ya rage zuwa buɗa baki"
}

// am — Amharca (beta); terimler src/core/dil/sozluk/am. Ay/gün adları CLDR `am` (Gregoryen).
// CLDR am: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); sayıdan sonra ad tekil kalır (JS sure.ts).
object TvDiliAm : TvDili {
    override val kod = "am"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ፈጅር"
        Vakit.GUNES -> "ፀሐይ መውጣት"
        Vakit.OGLE -> "ዙህር"
        Vakit.IKINDI -> "አስር"
        Vakit.AKSAM -> "መግሪብ"
        Vakit.YATSI -> "ኢሻ"
    }
    override val cuma = "ጁሙዓ"
    override val aylar = listOf(
        "ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
        "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር",
    )
    override val gunler = listOf("ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሑድ")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}፣ $gun $ay $yil"

    override val birimSa = "ሰዓ"
    override val birimDk = "ደቂ"
    override val birimSn = "ሰከ"
    override fun saatSesli(n: Int) = "$n ሰዓት"
    override fun dakikaSesli(n: Int) = "$n ደቂቃ"
    override val birDakikadanAz = "ከ1 ደቂቃ ያነሰ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ፀሐይ መውጣት"
        Kerahat.Tur.ISTIVA -> "እኩለ ቀን"
        Kerahat.Tur.GURUB -> "ፀሐይ መጥለቅ"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ፀሐይ በደንብ እስክትወጣ ድረስ መስገድ ክልክል ነው።"
        Kerahat.Tur.ISTIVA -> "ፀሐይ በሰማዩ መሃል ላይ ሳለች መስገድ ክልክል ነው።"
        Kerahat.Tur.GURUB -> "ፀሐይ እየጠለቀች ሳለ መስገድ ክልክል ነው።"
    }

    override fun bant(ad: String, dk: Long) = "የ$ad ሰዓት እያጠረ ነው · $dk ደቂ"
    override val kabulDuasi = "አላህ ይቀበለው"
    override val iftarSelami = "የተባረከ ኢፍጣር"
    override val cumaSelami = "ጁሙዓ ሙባረክ"
    override val sahuraKalan = "ለሱሑር የቀረው ጊዜ"
    override val iftaraKalan = "ኢፍጣር እስኪደርስ የቀረው ጊዜ"
}

// om
object TvDiliOm : TvDili {
    override val kod = "om"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subhii"
        Vakit.GUNES -> "Baha aduu"
        Vakit.OGLE -> "Zuhrii"
        Vakit.IKINDI -> "Asrii"
        Vakit.AKSAM -> "Maghriba"
        Vakit.YATSI -> "Ishaa'ii"
    }
    override val cuma = "Jimaata"
    override val aylar = listOf(
        "Amajjii", "Guraandhala", "Bitootessa", "Eebila", "Caamsaa", "Waxabajjii",
        "Adoolessa", "Hagayya", "Fulbaana", "Onkoloolessa", "Sadaasa", "Muddee",
    )
    override val gunler = listOf("Wiixata", "Kibxata", "Roobii", "Kamisa", "Jimaata", "Sanbata", "Dilbata")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $ay $gun, $yil"

    override val birimSa = "sa'a"
    override val birimDk = "daq"
    override val birimSn = "sek"
    override fun saatSesli(n: Int) = "$n sa'aatii"
    override fun dakikaSesli(n: Int) = "$n daqiiqaa"
    override val birDakikadanAz = "daqiiqaa 1 gadi"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Baha aduu"
        Kerahat.Tur.ISTIVA -> "Aduu gubbaa gidduu"
        Kerahat.Tur.GURUB -> "Lixa aduu"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Hanga aduun sirriitti baatutti salaatuun jibbamaa dha."
        Kerahat.Tur.ISTIVA -> "Yeroo aduun gubbaa gidduu irra jirtu salaatuun jibbamaa dha."
        Kerahat.Tur.GURUB -> "Yeroo aduun lixaa jirtu salaatuun jibbamaa dha."
    }

    override fun bant(ad: String, dk: Long) = "Yeroon $ad gabaabbachaa jira · daq $dk"
    override val kabulDuasi = "Rabbiin haa qeebalu"
    override val iftarSelami = "Afursaa eebbifamaa"
    override val cumaSelami = "Jimaata eebbifamaa"
    override val sahuraKalan = "Yeroo suhuuraaf hafe"
    override val iftaraKalan = "Hanga afursaatti yeroo hafe"
}

// so
object TvDiliSo : TvDili {
    override val kod = "so"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subax"
        Vakit.GUNES -> "Qorrax soo bax"
        Vakit.OGLE -> "Duhur"
        Vakit.IKINDI -> "Casar"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Cishe"
    }
    override val cuma = "Jimce"
    override val aylar = listOf(
        "Jannaayo", "Febraayo", "Maarso", "Abriil", "Maayo", "Juun",
        "Luulyo", "Ogosto", "Sebteembar", "Oktoobar", "Noofeembar", "Diseembar",
    )
    override val gunler = listOf("Isniin", "Talaado", "Arbaco", "Khamiis", "Jimce", "Sabti", "Axad")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "s"
    override val birimDk = "daq"
    override val birimSn = "ilb"
    override fun saatSesli(n: Int) = if (n == 1) "1 saac" else "$n saacadood"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 daqiiqo" else "$n daqiiqo"
    override val birDakikadanAz = "wax ka yar 1 daqiiqo"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Qorrax soo bax"
        Kerahat.Tur.ISTIVA -> "Bartamaha samada"
        Kerahat.Tur.GURUB -> "Qorrax dhac"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Tukashadu waa makruuh ilaa qorraxdu si fiican u soo baxdo."
        Kerahat.Tur.ISTIVA -> "Tukashadu waa makruuh inta qorraxdu joogto bartamaha samada."
        Kerahat.Tur.GURUB -> "Tukashadu waa makruuh inta qorraxdu dhacayso."
    }

    override fun bant(ad: String, dk: Long) = "Waqtiga $ad wuu yaraanayaa · $dk daq"
    override val kabulDuasi = "Alle ha aqbalo"
    override val iftarSelami = "Afur barakaysan"
    override val cumaSelami = "Jimce Mubaarak"
    override val sahuraKalan = "Waqtiga u haray suxuurta"
    override val iftaraKalan = "Waqtiga u haray afurka"
}

// ff
// CLDR ff: one = 0 ve 1, other (JS `cogul.ts > sifirBir`; 1,5 de tekil, burada yalnız tam sayı).
// Pular gün/ay adları JS sozluk/ff/tarih.ts ile aynı (tarih içinde ay küçük harf).
object TvDiliFf : TvDili {
    override val kod = "ff"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subaka"
        Vakit.GUNES -> "Puɗal naange"
        Vakit.OGLE -> "Fanaa"
        Vakit.IKINDI -> "Alansaraa"
        Vakit.AKSAM -> "Futuroo"
        Vakit.YATSI -> "Geeƴe"
    }
    override val cuma = "Juma"
    override val aylar = listOf(
        "sanwiye", "feeburuyee", "maarasi", "awril", "mee", "juwen",
        "suwiye", "ut", "settaambur", "ottoombur", "nofambar", "deesaambur",
    )
    override val gunler = listOf("Altine", "Talaata", "Alarba", "Alkamisa", "Aljuma", "Asewe", "Alati")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "sa"
    override val birimDk = "hj"
    override val birimSn = "mj"
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "$n saa’i" else "$n saa’iiji"
    override fun dakikaSesli(n: Int) = if (n == 0 || n == 1) "$n hojom" else "$n hojomaaji"
    override val birDakikadanAz = "ko ɓuri famɗude hojom gooto"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Puɗal naange"
        Kerahat.Tur.ISTIVA -> "Hakkunde ñalawma"
        Kerahat.Tur.GURUB -> "Mutal naange"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Juulude ko makruuhu haa naange toowa no feewi."
        Kerahat.Tur.ISTIVA -> "Juulude ko makruuhu tuma naange hino hakkunde asamaan."
        Kerahat.Tur.GURUB -> "Juulude ko makruuhu tuma naange hino mutta."
    }

    override fun bant(ad: String, dk: Long) = "Waqutu $ad hino raɓɓina · $dk hj"
    override val kabulDuasi = "Yo Alla jaɓu"
    override val iftarSelami = "Yo Alla barkin huntaari mon"
    override val cumaSelami = "Yo Alla barkin Juma"
    override val sahuraKalan = "Saa’i heddiiɗo suhuur"
    override val iftaraKalan = "Saa’i heddiiɗo haa huntaari"
}

// yo
// CLDR yo: yalnız other (JS `cogul.ts > hepDiger`); Yorubada sayı ismin ARDINDAN gelir ("wákàtí 2").
object TvDiliYo : TvDili {
    override val kod = "yo"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subh"
        Vakit.GUNES -> "Yíyọ òòrùn"
        Vakit.OGLE -> "Ṭḥuhr"
        Vakit.IKINDI -> "‘Asr"
        Vakit.AKSAM -> "Mọgrib"
        Vakit.YATSI -> "‘Iṣā’"
    }
    override val cuma = "Jum‘ah"
    override val aylar = listOf(
        "Oṣù Ṣẹ́rẹ́", "Oṣù Èrèlè", "Oṣù Ẹrẹ̀nà", "Oṣù Ìgbé", "Oṣù Ẹ̀bibi", "Oṣù Òkúdu",
        "Oṣù Agẹmọ", "Oṣù Ògún", "Oṣù Owewe", "Oṣù Ọ̀wàrà", "Oṣù Bélú", "Oṣù Ọ̀pẹ̀",
    )
    override val gunler = listOf("Ọjọ́ Ajé", "Ọjọ́ Ìsẹ́gun", "Ọjọ́rú", "Ọjọ́bọ", "Ọjọ́ Ẹtì", "Ọjọ́ Àbámẹ́ta", "Ọjọ́ Àìkú")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "wkt"
    override val birimDk = "ìṣj"
    override val birimSn = "ìṣ-àá"
    override fun saatSesli(n: Int) = "wákàtí $n"
    override fun dakikaSesli(n: Int) = "ìṣẹ́jú $n"
    override val birDakikadanAz = "kò tó ìṣẹ́jú kan"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Yíyọ òòrùn"
        Kerahat.Tur.ISTIVA -> "Òòrùn ní àárín"
        Kerahat.Tur.GURUB -> "Wíwọ̀ òòrùn"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Kíkí ìrun jẹ́ makrūh títí òòrùn yóò fi yọ dáadáa."
        Kerahat.Tur.ISTIVA -> "Kíkí ìrun jẹ́ makrūh nígbà tí òòrùn bá wà ní àárín gbùngbùn ojú ọ̀run."
        Kerahat.Tur.GURUB -> "Kíkí ìrun jẹ́ makrūh nígbà tí òòrùn bá ń wọ̀."
    }

    override fun bant(ad: String, dk: Long) = "Àkókò $ad ń kúrú · ìṣj $dk"
    override val kabulDuasi = "Kí Allāhu gbà á"
    override val iftarSelami = "Ẹ kú ìsinu"
    override val cumaSelami = "Ẹ kú ọjọ́ Jum‘ah"
    override val sahuraKalan = "Àkókò tó kù fún sààrì"
    override val iftaraKalan = "Àkókò tó kù sí ìsinu"
}
