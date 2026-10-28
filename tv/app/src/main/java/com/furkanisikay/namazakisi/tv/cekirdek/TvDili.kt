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
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug; çevrilmemiş dilin nesnesi
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
    else -> TvDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug). */
val TV_DILLERI: List<TvDili> = listOf(
    TvDiliTr, TvDiliEn, TvDiliId, TvDiliDe, TvDiliFr, TvDiliBs, TvDiliRu, TvDiliMs, TvDiliAr, TvDiliUr,
    TvDiliEs, TvDiliNl, TvDiliSq, TvDiliHi, TvDiliBn,
    TvDiliFa, TvDiliPs, TvDiliCkb, TvDiliUg,
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

// ÇEVİRİ: fa
// CLDR fa: one = 0 ve 1, other (JS `cogul.ts > sifirBir`).
object TvDiliFa : TvDili {
    override val kod = "fa"
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
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "$n hour" else "$n hours"
    override fun dakikaSesli(n: Int) = if (n == 0 || n == 1) "$n minute" else "$n minutes"
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

// ÇEVİRİ: ps
object TvDiliPs : TvDili {
    override val kod = "ps"
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

// ÇEVİRİ: ckb
object TvDiliCkb : TvDili {
    override val kod = "ckb"
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
