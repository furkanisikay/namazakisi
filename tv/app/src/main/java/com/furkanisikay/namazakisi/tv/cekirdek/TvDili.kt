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
 * Düzen: dil başına bir nesne, sıra tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo
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

    /**
     * Sayı ile kısa birim arası ("5 dk"); boşluksuz yazan dil (Çince "5分钟") "" verir.
     * JS `sure.birimli` kalıbının `{n}` ile `{birim}` arası (nöbetçi `nativeSureAyiraclari.test.ts`).
     */
    val birimAyirici: String get() = " "

    /** Ardışık süre parçaları arası ("1 sa 5 dk", "1 saat 5 dakika"); JS `sure.parcali`. */
    val parcaAyirici: String get() = " "

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
    "zh" -> TvDiliZh
    "ta" -> TvDiliTa
    "ml" -> TvDiliMl
    "th" -> TvDiliTh
    "ko" -> TvDiliKo
    "vi" -> TvDiliVi
    "pt" -> TvDiliPt
    "it" -> TvDiliIt
    "sv" -> TvDiliSv
    "uk" -> TvDiliUk
    "ro" -> TvDiliRo
    "hr" -> TvDiliHr
    "sr" -> TvDiliSr
    "el" -> TvDiliEl
    "ku" -> TvDiliKu
    "tk" -> TvDiliTk
    "tt" -> TvDiliTt
    "sd" -> TvDiliSd
    "pl" -> TvDiliPl
    "ja" -> TvDiliJa
    "gu" -> TvDiliGu
    "bg" -> TvDiliBg
    "mk" -> TvDiliMk
    "fil", "tl" -> TvDiliFil
    "te" -> TvDiliTe
    "kn" -> TvDiliKn
    "mr" -> TvDiliMr
    "pa" -> TvDiliPa
    "as" -> TvDiliAs
    "ne" -> TvDiliNe
    "si" -> TvDiliSi
    "km" -> TvDiliKm
    "he", "iw" -> TvDiliHe
    "ka" -> TvDiliKa
    "lt" -> TvDiliLt
    "mg" -> TvDiliMg
    "lg" -> TvDiliLg
    "rw" -> TvDiliRw
    "rn" -> TvDiliRn
    "ln" -> TvDiliLn
    "dag" -> TvDiliDag
    "mos" -> TvDiliMos
    "aa" -> TvDiliAa
    "mdh" -> TvDiliMdh
    "ak" -> TvDiliAk
    "ceb" -> TvDiliCeb
    "nqo" -> TvDiliNqo
    else -> TvDiliTr
}

/** Tablosu olan diller, düzen sırasıyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo). */
val TV_DILLERI: List<TvDili> = listOf(
    TvDiliTr, TvDiliEn, TvDiliId, TvDiliDe, TvDiliFr, TvDiliBs, TvDiliRu, TvDiliMs, TvDiliAr, TvDiliUr,
    TvDiliEs, TvDiliNl, TvDiliSq, TvDiliHi, TvDiliBn,
    TvDiliFa, TvDiliPs, TvDiliCkb, TvDiliUg,
    TvDiliAz, TvDiliUz, TvDiliKk, TvDiliKy, TvDiliTg,
    TvDiliSw, TvDiliHa, TvDiliAm, TvDiliOm, TvDiliSo, TvDiliFf, TvDiliYo,
    TvDiliZh, TvDiliTa, TvDiliMl, TvDiliTh, TvDiliKo, TvDiliVi,
    TvDiliPt, TvDiliIt, TvDiliSv, TvDiliUk, TvDiliRo, TvDiliHr, TvDiliSr, TvDiliEl,
    TvDiliKu, TvDiliTk, TvDiliTt, TvDiliSd, TvDiliPl, TvDiliJa, TvDiliGu, TvDiliBg, TvDiliMk,
    TvDiliFil, TvDiliTe, TvDiliKn, TvDiliMr, TvDiliPa, TvDiliAs, TvDiliNe, TvDiliSi, TvDiliKm,
    TvDiliHe, TvDiliKa, TvDiliLt, TvDiliMg, TvDiliLg, TvDiliRw, TvDiliRn, TvDiliLn, TvDiliDag, TvDiliMos, TvDiliAa, TvDiliMdh, TvDiliAk, TvDiliCeb, TvDiliNqo,
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

// zh
// CLDR zh: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez.
// Şablonlarda `${ad}` yazılır: Han harfi Kotlin'de tanımlayıcıya yapışır.
object TvDiliZh : TvDili {
    override val kod = "zh"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "晨礼"
        Vakit.GUNES -> "日出"
        Vakit.OGLE -> "晌礼"
        Vakit.IKINDI -> "晡礼"
        Vakit.AKSAM -> "昏礼"
        Vakit.YATSI -> "宵礼"
    }
    override val cuma = "主麻"
    override val aylar = listOf(
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月",
    )
    override val gunler = listOf("星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${yil}年${ay}${gun}日 ${gunAdi}"

    override val birimSa = "小时"
    override val birimDk = "分钟"
    override val birimSn = "秒"
    // Boşluksuz yazılır ("5分钟", "1小时5分钟"; JS `sure.birimli` / `sure.parcali`).
    override val birimAyirici = ""
    override val parcaAyirici = ""
    override fun saatSesli(n: Int) = "${n}小时"
    override fun dakikaSesli(n: Int) = "${n}分钟"
    override val birDakikadanAz = "不到1分钟"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "日出"
        Kerahat.Tur.ISTIVA -> "正午"
        Kerahat.Tur.GURUB -> "日落"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "太阳完全升起之前，礼拜属可憎（Makruh）。"
        Kerahat.Tur.ISTIVA -> "太阳正当中天时，礼拜属可憎（Makruh）。"
        Kerahat.Tur.GURUB -> "太阳落下时，礼拜属可憎（Makruh）。"
    }

    override fun bant(ad: String, dk: Long) = "${ad}时间紧迫 · ${dk}分钟"
    override val kabulDuasi = "愿真主准承"
    override val iftarSelami = "开斋吉庆"
    override val cumaSelami = "主麻吉庆"
    override val sahuraKalan = "封斋剩余时间"
    override val iftaraKalan = "距开斋还有"
}

// ta
object TvDiliTa : TvDili {
    override val kod = "ta"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ஃபஜ்ர்"
        Vakit.GUNES -> "சூரிய உதயம்"
        Vakit.OGLE -> "லுஹர்"
        Vakit.IKINDI -> "அஸர்"
        Vakit.AKSAM -> "மஃரிப்"
        Vakit.YATSI -> "இஷா"
    }
    override val cuma = "ஜுமுஆ"
    override val aylar = listOf(
        "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
        "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்",
    )
    override val gunler = listOf("திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி", "ஞாயிறு")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay}, ${yil}"

    override val birimSa = "மணி"
    override val birimDk = "நிமி"
    override val birimSn = "வி"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} மணிநேரம்"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 நிமிடம்" else "${n} நிமிடங்கள்"
    override val birDakikadanAz = "1 நிமிடத்திற்கும் குறைவு"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "சூரிய உதயம்"
        Kerahat.Tur.ISTIVA -> "உச்சி நேரம்"
        Kerahat.Tur.GURUB -> "சூரியன் மறைவு"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "சூரியன் நன்கு உயரும் வரை தொழுவது மக்ரூஹ் ஆகும்."
        Kerahat.Tur.ISTIVA -> "சூரியன் உச்சியில் இருக்கும்போது தொழுவது மக்ரூஹ் ஆகும்."
        Kerahat.Tur.GURUB -> "சூரியன் மறையும்போது தொழுவது மக்ரூஹ் ஆகும்."
    }

    override fun bant(ad: String, dk: Long) = "${ad} நேரம் குறைகிறது · ${dk} நிமி"
    override val kabulDuasi = "அல்லாஹ் ஏற்றுக்கொள்வானாக"
    override val iftarSelami = "பரக்கத்தான இஃப்தார்"
    override val cumaSelami = "ஜுமுஆ முபாரக்"
    override val sahuraKalan = "ஸஹருக்கு மீதமுள்ள நேரம்"
    override val iftaraKalan = "இஃப்தார் வரை மீதமுள்ள நேரம்"
}

// ml — Malayalamca (beta): JS `sozluk/ml` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR ml: one (yalnız 1) / other; sayıdan sonra isim çekimlenmez. Tarih CLDR sırası "2026, ഒക്‌ടോബർ 30, വെള്ളിയാഴ്‌ച".
// Malayalam harfi Kotlin tanımlayıcısına yapışır: şablonda harften önce `${...}`.
object TvDiliMl : TvDili {
    override val kod = "ml"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "സുബ്‌ഹ്"
        Vakit.GUNES -> "സൂര്യോദയം"
        Vakit.OGLE -> "ളുഹർ"
        Vakit.IKINDI -> "അസ്ർ"
        Vakit.AKSAM -> "മഗ്‌രിബ്"
        Vakit.YATSI -> "ഇശാ"
    }
    override val cuma = "ജുമുഅ"
    override val aylar = listOf(
        "ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ",
        "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്‌ടോബർ", "നവംബർ", "ഡിസംബർ",
    )
    override val gunler = listOf("തിങ്കളാഴ്‌ച", "ചൊവ്വാഴ്‌ച", "ബുധനാഴ്‌ച", "വ്യാഴാഴ്‌ച", "വെള്ളിയാഴ്‌ച", "ശനിയാഴ്‌ച", "ഞായറാഴ്‌ച")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${yil}, ${ay} ${gun}, ${gunAdi}"

    override val birimSa = "മ"
    override val birimDk = "മി"
    override val birimSn = "സെ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} മണിക്കൂർ"
    override fun dakikaSesli(n: Int) = "${n} മിനിറ്റ്"
    override val birDakikadanAz = "1 മിനിറ്റിൽ താഴെ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "സൂര്യോദയം"
        Kerahat.Tur.ISTIVA -> "നട്ടുച്ച"
        Kerahat.Tur.GURUB -> "സൂര്യാസ്തമയം"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "സൂര്യൻ നന്നായി ഉദിക്കുന്നതുവരെ നമസ്കരിക്കുന്നത് കറാഹത്താണ്."
        Kerahat.Tur.ISTIVA -> "സൂര്യൻ നട്ടുച്ചയിലായിരിക്കുമ്പോൾ നമസ്കരിക്കുന്നത് കറാഹത്താണ്."
        Kerahat.Tur.GURUB -> "സൂര്യൻ അസ്തമിക്കുമ്പോൾ നമസ്കരിക്കുന്നത് കറാഹത്താണ്."
    }

    override fun bant(ad: String, dk: Long) = "${ad} സമയം കുറയുന്നു · ${dk} മിനിറ്റ്"
    override val kabulDuasi = "അല്ലാഹു സ്വീകരിക്കട്ടെ"
    override val iftarSelami = "ബറകത്തുള്ള നോമ്പുതുറ"
    override val cumaSelami = "ജുമുഅ മുബാറക്"
    override val sahuraKalan = "അത്താഴത്തിന് ബാക്കിയുള്ള സമയം"
    override val iftaraKalan = "നോമ്പുതുറയ്ക്ക് ബാക്കിയുള്ള സമയം"
}

// th
// CLDR th: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez.
// Tay harfleri Kotlin'de tanımlayıcı karakteridir: şablonda "${ad}" (süslü parantezli) yazılır.
object TvDiliTh : TvDili {
    override val kod = "th"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ซุบฮ์"
        Vakit.GUNES -> "ซูรูก"
        Vakit.OGLE -> "ดุฮ์ริ"
        Vakit.IKINDI -> "อัสร์"
        Vakit.AKSAM -> "มักริบ"
        Vakit.YATSI -> "อีซา"
    }
    override val cuma = "ญุมอัต"
    override val aylar = listOf(
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    )
    override val gunler = listOf("วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}ที่ ${gun} ${ay} ${yil}"

    override val birimSa = "ชม."
    override val birimDk = "นาที"
    override val birimSn = "วิ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} ชั่วโมง"
    override fun dakikaSesli(n: Int) = "${n} นาที"
    override val birDakikadanAz = "ไม่ถึง 1 นาที"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ดวงอาทิตย์ขึ้น"
        Kerahat.Tur.ISTIVA -> "ดวงอาทิตย์ตรงศีรษะ"
        Kerahat.Tur.GURUB -> "ดวงอาทิตย์ตก"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "การละหมาดเป็นสิ่งที่มักรูฮ์จนกว่าดวงอาทิตย์จะขึ้นสูงพอ"
        Kerahat.Tur.ISTIVA -> "การละหมาดเป็นสิ่งที่มักรูฮ์ขณะที่ดวงอาทิตย์อยู่ตรงศีรษะ"
        Kerahat.Tur.GURUB -> "การละหมาดเป็นสิ่งที่มักรูฮ์ขณะที่ดวงอาทิตย์กำลังตก"
    }

    override fun bant(ad: String, dk: Long) = "เวลา${ad}ใกล้จะหมด · ${dk} นาที"
    override val kabulDuasi = "ขออัลลอฮ์ทรงตอบรับ"
    override val iftarSelami = "ขอให้เป็นการละศีลอดที่จำเริญ"
    override val cumaSelami = "ขอให้เป็นวันศุกร์ที่จำเริญ"
    override val sahuraKalan = "เวลาที่เหลือสำหรับซะฮูร"
    override val iftaraKalan = "เวลาที่เหลือก่อนละศีลอด"
}

// ko
// CLDR ko: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez. Sayı–birim
// bitişik ("5분"), parçalar boşluklu ("1시간 5분"). Hangıl tanımlayıcıya yapışır: "${n}분" yazılır.
object TvDiliKo : TvDili {
    override val kod = "ko"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "새벽"
        Vakit.GUNES -> "일출"
        Vakit.OGLE -> "정오"
        Vakit.IKINDI -> "오후"
        Vakit.AKSAM -> "저녁"
        Vakit.YATSI -> "밤"
    }
    override val cuma = "금요예배"
    override val aylar = listOf(
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월",
    )
    override val gunler = listOf("월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${yil}년 ${ay} ${gun}일 ${gunAdi}"

    override val birimSa = "시간"
    override val birimDk = "분"
    override val birimSn = "초"
    override val birimAyirici = ""
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n}시간"
    override fun dakikaSesli(n: Int) = "${n}분"
    override val birDakikadanAz = "1분 미만"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "일출"
        Kerahat.Tur.ISTIVA -> "남중"
        Kerahat.Tur.GURUB -> "일몰"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "해가 충분히 떠오를 때까지는 예배를 삼가야 합니다."
        Kerahat.Tur.ISTIVA -> "해가 정점에 있는 동안에는 예배를 삼가야 합니다."
        Kerahat.Tur.GURUB -> "해가 지는 동안에는 예배를 삼가야 합니다."
    }

    override fun bant(ad: String, dk: Long) = "${ad} 예배 시간이 얼마 남지 않았습니다 · ${dk}분"
    override val kabulDuasi = "하나님께서 받아주시길"
    override val iftarSelami = "복된 이프타르 되세요"
    override val cumaSelami = "복된 금요일 되세요"
    override val sahuraKalan = "수후르 종료까지 남은 시간"
    override val iftaraKalan = "이프타르까지 남은 시간"
}

// vi
// CLDR vi: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çekimlenmez.
// Terimler JS sözlüğünden (src/core/dil/sozluk/vi); tarih CLDR vi uzun biçimi ("Thứ Bảy, 31 tháng 10, 2026").
object TvDiliVi : TvDili {
    override val kod = "vi"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Mặt trời mọc"
        Vakit.OGLE -> "Zhuhr"
        Vakit.IKINDI -> "‘Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "‘Isha’"
    }
    override val cuma = "Jumu’ah"
    override val aylar = listOf(
        "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
        "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12",
    )
    override val gunler = listOf("Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay}, ${yil}"

    override val birimSa = "giờ"
    override val birimDk = "phút"
    override val birimSn = "giây"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} giờ"
    override fun dakikaSesli(n: Int) = "${n} phút"
    override val birDakikadanAz = "chưa đến 1 phút"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Mặt trời mọc"
        Kerahat.Tur.ISTIVA -> "Mặt trời đứng bóng"
        Kerahat.Tur.GURUB -> "Mặt trời lặn"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Thời điểm cấm hành lễ cho đến khi mặt trời lên cao hẳn."
        Kerahat.Tur.ISTIVA -> "Thời điểm cấm hành lễ khi mặt trời đang ở đỉnh."
        Kerahat.Tur.GURUB -> "Thời điểm cấm hành lễ khi mặt trời đang lặn."
    }

    override fun bant(ad: String, dk: Long) = "Giờ ${ad} sắp hết · ${dk} phút"
    override val kabulDuasi = "Cầu xin Allah chấp nhận"
    override val iftarSelami = "Bữa Iftar an lành"
    override val cumaSelami = "Jumu’ah Mubarak"
    override val sahuraKalan = "Thời gian còn lại cho Suhur"
    override val iftaraKalan = "Thời gian còn lại đến giờ xả chay"
}

// pt — Portekizce (beta, pt-PT); terimler src/core/dil/sozluk/pt; tarih CLDR pt-PT ("sábado, 31 de outubro de 2026")
// CLDR pt-PT: one = 1, many = 1.000.000 katları, other (JS `cogul.ts > ispanyolca`); Avrupa/Afrika normu, Brezilya değil.
object TvDiliPt : TvDili {
    override val kod = "pt"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Nascer do Sol"
        Vakit.OGLE -> "Zuhr"
        Vakit.IKINDI -> "Assr"
        Vakit.AKSAM -> "Magrib"
        Vakit.YATSI -> "Ishá"
    }
    override val cuma = "Jumu’ah"
    override val aylar = listOf(
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    )
    override val gunler = listOf("segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun de $ay de $yil"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 1) "1 hora" else "$n horas"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minuto" else "$n minutos"
    override val birDakikadanAz = "menos de 1 minuto"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Nascer do Sol"
        Kerahat.Tur.ISTIVA -> "Zénite"
        Kerahat.Tur.GURUB -> "Pôr do sol"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "É desaconselhado rezar até o sol estar bem alto."
        Kerahat.Tur.ISTIVA -> "É desaconselhado rezar enquanto o sol está no zénite."
        Kerahat.Tur.GURUB -> "É desaconselhado rezar durante o pôr do sol."
    }

    override fun bant(ad: String, dk: Long) = "$ad · o tempo está a acabar · $dk min"
    override val kabulDuasi = "Que Allah aceite"
    override val iftarSelami = "Abençoado iftar"
    override val cumaSelami = "Jumu’ah Mubarak"
    override val sahuraKalan = "Tempo restante para o suhur"
    override val iftaraKalan = "Tempo restante até ao iftar"
}

// it
// CLDR it: one = 1, many = 1.000.000 katları, other (JS `cogul.ts > ispanyolca`).
// Gün adı yalnız tarih satırının başında durur → büyük harfle; ay adı küçük ("Sabato 31 ottobre 2026").
object TvDiliIt : TvDili {
    override val kod = "it"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Sorgere del sole"
        Vakit.OGLE -> "Zuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Jumu’ah"
    override val aylar = listOf(
        "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
        "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
    )
    override val gunler = listOf("Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi $gun $ay $yil"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 1) "1 ora" else "$n ore"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minuto" else "$n minuti"
    override val birDakikadanAz = "meno di 1 minuto"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Sorgere del sole"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Tramonto"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Pregare è makruh finché il sole non è ben alto."
        Kerahat.Tur.ISTIVA -> "Pregare è makruh mentre il sole è allo zenit."
        Kerahat.Tur.GURUB -> "Pregare è makruh mentre il sole tramonta."
    }

    override fun bant(ad: String, dk: Long) = "Il tempo di $ad stringe · $dk min"
    override val kabulDuasi = "Che Allah l’accetti"
    override val iftarSelami = "Iftar benedetto"
    override val cumaSelami = "Jumu’ah Mubarak"
    override val sahuraKalan = "Tempo rimasto per il suhur"
    override val iftaraKalan = "Tempo rimasto all’iftar"
}

// sv
// CLDR sv: one/other (JS `cogul.ts > birDiger`); gün ve ay adları küçük harf ("lördag 31 oktober 2026").
object TvDiliSv : TvDili {
    override val kod = "sv"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Soluppgång"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Fredagsbön"
    override val aylar = listOf(
        "januari", "februari", "mars", "april", "maj", "juni",
        "juli", "augusti", "september", "oktober", "november", "december",
    )
    override val gunler = listOf("måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi $gun $ay $yil"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 1) "1 timme" else "$n timmar"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 minut" else "$n minuter"
    override val birDakikadanAz = "mindre än 1 minut"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Soluppgång"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Solnedgång"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Att be är makruh tills solen har stigit ordentligt."
        Kerahat.Tur.ISTIVA -> "Att be är makruh medan solen står i zenit."
        Kerahat.Tur.GURUB -> "Att be är makruh medan solen går ner."
    }

    override fun bant(ad: String, dk: Long) = "Tiden för $ad börjar ta slut · $dk min"
    override val kabulDuasi = "Må Allah acceptera det"
    override val iftarSelami = "En välsignad iftar"
    override val cumaSelami = "Jumu'ah mubarak"
    override val sahuraKalan = "Tid kvar för suhur"
    override val iftaraKalan = "Tid kvar till iftar"
}

// uk
// CLDR uk: one (1, 21…), few (2–4, 22–24…), many (gerisi) — JS `cogul.ts > rusca`; tarihte ay ilgi hâlinde.
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (uk, hr, el ilgi hâli; ro yalın; sr CLDR yalın).
object TvDiliUk : TvDili {
    override val kod = "uk"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Фаджр"
        Vakit.GUNES -> "Схід сонця"
        Vakit.OGLE -> "Зугр"
        Vakit.IKINDI -> "Аср"
        Vakit.AKSAM -> "Магріб"
        Vakit.YATSI -> "Іша"
    }
    override val cuma = "Джума"

    /** Tarih içinde (ilgi hâli, "31 жовтня"); tek başına ay adı kullanılmaz. */
    override val aylar = listOf(
        "січня", "лютого", "березня", "квітня", "травня", "червня",
        "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
    )
    override val gunler = listOf("Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота", "Неділя")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil р."

    override val birimSa = "год"
    override val birimDk = "хв"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR uk (JS `cogul.ts > rusca`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s10 = n % 10
        val s100 = n % 100
        return when {
            s10 == 1 && s100 != 11 -> "one"
            s10 in 2..4 && s100 !in 12..14 -> "few"
            else -> "many"
        }
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n година"
        "few" -> "$n години"
        "many" -> "$n годин"
        else -> "$n години"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n хвилина"
        "few" -> "$n хвилини"
        "many" -> "$n хвилин"
        else -> "$n хвилини"
    }
    override val birDakikadanAz = "менше хвилини"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Схід сонця"
        Kerahat.Tur.ISTIVA -> "Зеніт"
        Kerahat.Tur.GURUB -> "Захід сонця"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Здійснювати молитву небажано, доки сонце добре не зійде."
        Kerahat.Tur.ISTIVA -> "Здійснювати молитву небажано, поки сонце в зеніті."
        Kerahat.Tur.GURUB -> "Здійснювати молитву небажано, поки сонце заходить."
    }

    override fun bant(ad: String, dk: Long) = "Час молитви $ad спливає · $dk хв"
    override val kabulDuasi = "Нехай Аллаг прийме"
    override val iftarSelami = "Благословенного іфтару"
    override val cumaSelami = "Джума мубарак"
    override val sahuraKalan = "До кінця сухуру"
    override val iftaraKalan = "До іфтару"
}

// ro
// CLDR ro: one = 1; few = 0 ve …01–…19 (1 hariç); other "de" ile (JS `cogul.ts > rumence`); ș ț virgüllü.
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (ro'da yalın, küçük harf: "sâmbătă, 31 octombrie 2026").
// Rumence harfler (ă â î ș ț) tanımlayıcıya yapışır: şablonlarda `${}` zorunlu.
object TvDiliRo : TvDili {
    override val kod = "ro"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Răsărit"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Ișa"
    }
    override val cuma = "Jumu’ah"
    override val aylar = listOf(
        "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
        "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
    )
    override val gunler = listOf("luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay} ${yil}"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR ro (JS `cogul.ts > rumence`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s100 = n % 100
        return when {
            n == 1 -> "one"
            n == 0 || s100 in 1..19 -> "few"
            else -> "other"
        }
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "${n} oră"
        "few" -> "${n} ore"
        else -> "${n} de ore"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "${n} minut"
        "few" -> "${n} minute"
        else -> "${n} de minute"
    }
    override val birDakikadanAz = "mai puțin de un minut"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Răsărit"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Apus"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Rugăciunea este makruh până când soarele s-a ridicat bine."
        Kerahat.Tur.ISTIVA -> "Rugăciunea este makruh cât soarele este la zenit."
        Kerahat.Tur.GURUB -> "Rugăciunea este makruh cât soarele apune."
    }

    override fun bant(ad: String, dk: Long) = "Timpul pentru ${ad} se scurtează · ${dk} min"
    override val kabulDuasi = "Allah să primească"
    override val iftarSelami = "Iftar binecuvântat"
    override val cumaSelami = "Vineri binecuvântată"
    override val sahuraKalan = "Timp rămas pentru suhur"
    override val iftaraKalan = "Timp rămas până la iftar"
}

// hr
// CLDR hr: one (…1, …11 hariç), few (…2–4, …12–14 hariç), other — JS `cogul.ts > bosnakca`; tarihte ay ilgi hâlinde.
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (uk, hr, el ilgi hâli; ro yalın; sr CLDR yalın).
object TvDiliHr : TvDili {
    override val kod = "hr"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Sabah"
        Vakit.GUNES -> "Izlazak Sunca"
        Vakit.OGLE -> "Podne"
        Vakit.IKINDI -> "Ikindija"
        Vakit.AKSAM -> "Akšam"
        Vakit.YATSI -> "Jacija"
    }
    override val cuma = "Džuma"
    override val aylar = listOf(
        "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
        "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca",
    )
    override val gunler = listOf("ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota", "nedjelja")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun. $ay $yil."

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR hr (JS `cogul.ts > bosnakca`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s10 = n % 10
        val s100 = n % 100
        return when {
            s10 == 1 && s100 != 11 -> "one"
            s10 in 2..4 && s100 !in 12..14 -> "few"
            else -> "other"
        }
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n sat"
        "few" -> "$n sata"
        else -> "$n sati"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n minuta"
        "few" -> "$n minute"
        else -> "$n minuta"
    }
    override val birDakikadanAz = "manje od 1 minute"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Izlazak Sunca"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Zalazak Sunca"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Klanjati je mekruh dok Sunce dobro ne izađe."
        Kerahat.Tur.ISTIVA -> "Klanjati je mekruh dok je Sunce u zenitu."
        Kerahat.Tur.GURUB -> "Klanjati je mekruh dok Sunce zalazi."
    }

    override fun bant(ad: String, dk: Long) = "$ad · vrijeme je na izmaku · $dk min"
    override val kabulDuasi = "Allah kabul ejlesun"
    override val iftarSelami = "Hajirli iftar"
    override val cumaSelami = "Hajirli džuma"
    override val sahuraKalan = "Preostalo vrijeme za sehur"
    override val iftaraKalan = "Preostalo vrijeme do iftara"
}

// sr
// CLDR sr: one/few/other (JS `cogul.ts > bosnakca`); KİRİL yazılır (Latin seçenek yok).
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (uk, hr, el ilgi hâli; ro yalın; sr CLDR yalın).
object TvDiliSr : TvDili {
    override val kod = "sr"

    /** Pano çizelgedir: sabah satırı JS `vakit.imsakVakti` ("Зора"). */
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Зора"
        Vakit.GUNES -> "Излазак сунца"
        Vakit.OGLE -> "Подне"
        Vakit.IKINDI -> "Икиндија"
        Vakit.AKSAM -> "Акшам"
        Vakit.YATSI -> "Јација"
    }
    override val cuma = "Џума"
    override val aylar = listOf(
        "јануар", "фебруар", "март", "април", "мај", "јун",
        "јул", "август", "септембар", "октобар", "новембар", "децембар",
    )
    override val gunler = listOf("понедељак", "уторак", "среда", "четвртак", "петак", "субота", "недеља")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun. $ay $yil."

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR sr (JS `cogul.ts > bosnakca`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s10 = n % 10
        val s100 = n % 100
        return when {
            s10 == 1 && s100 != 11 -> "one"
            s10 in 2..4 && s100 !in 12..14 -> "few"
            else -> "other"
        }
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n сат"
        "few" -> "$n сата"
        else -> "$n сати"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n минут"
        "few" -> "$n минута"
        else -> "$n минута"
    }
    override val birDakikadanAz = "мање од 1 минута"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Излазак сунца"
        Kerahat.Tur.ISTIVA -> "Зенит"
        Kerahat.Tur.GURUB -> "Залазак сунца"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Клањати је мекрух док се сунце добро не подигне."
        Kerahat.Tur.ISTIVA -> "Клањати је мекрух док је сунце у зениту."
        Kerahat.Tur.GURUB -> "Клањати је мекрух док сунце залази."
    }

    override fun bant(ad: String, dk: Long) = "$ad: време се ближи крају · $dk мин"
    override val kabulDuasi = "Аллах примио"
    override val iftarSelami = "Хајирли ифтар"
    override val cumaSelami = "Хајирли џума"
    override val sahuraKalan = "До краја сехура"
    override val iftaraKalan = "До ифтара"
}

// el
// CLDR el: one/other (JS `cogul.ts > birDiger`); büyük harfte vurgu (tonos) düşer, soru işareti ";".
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (uk, hr, el ilgi hâli; ro yalın; sr CLDR yalın).
// Yunan harfleri Kotlin'de tanımlayıcı karakteridir: şablonda hep `${ad}` yazılır.
object TvDiliEl : TvDili {
    override val kod = "el"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Φατζρ"
        Vakit.GUNES -> "Ανατολή ηλίου"
        Vakit.OGLE -> "Δουχρ"
        Vakit.IKINDI -> "‘Ασρ"
        Vakit.AKSAM -> "Μάγριμπ"
        Vakit.YATSI -> "‘Ισά’"
    }
    override val cuma = "Τζούμου‘α"
    override val aylar = listOf(
        "Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
        "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου",
    )
    override val gunler = listOf("Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi} ${gun} ${ay} ${yil}"

    override val birimSa = "ώ."
    override val birimDk = "λ."
    override val birimSn = "δευτ."
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 1) "1 ώρα" else "${n} ώρες"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 λεπτό" else "${n} λεπτά"
    override val birDakikadanAz = "λιγότερο από 1 λεπτό"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Ανατολή"
        Kerahat.Tur.ISTIVA -> "Ζενίθ"
        Kerahat.Tur.GURUB -> "Δύση"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Η προσευχή είναι αποδοκιμαστέα μέχρι να ανέβει καλά ο ήλιος."
        Kerahat.Tur.ISTIVA -> "Η προσευχή είναι αποδοκιμαστέα όσο ο ήλιος βρίσκεται στο ζενίθ."
        Kerahat.Tur.GURUB -> "Η προσευχή είναι αποδοκιμαστέα όσο δύει ο ήλιος."
    }

    override fun bant(ad: String, dk: Long) = "Ο χρόνος για την ${ad} στενεύει · ${dk} λ."
    override val kabulDuasi = "Ας τη δεχτεί ο Αλλάχ"
    override val iftarSelami = "Ευλογημένο ιφτάρ"
    override val cumaSelami = "Ευλογημένη Παρασκευή"
    override val sahuraKalan = "Χρόνος που απομένει για το σαχούρ"
    override val iftaraKalan = "Χρόνος έως το ιφτάρ"
}

// ku
// CLDR ku: one/other (JS `cogul.ts > birDiger`); Kurmancî (Hawar Latin), kod `ku` (`kmr` değil), Soranî (`ckb`) ayrı dil.
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (izafet, "2ê mijdara"). Kotlin şablonunda ek `${gun}ê` (ê tanımlayıcı harfidir).
object TvDiliKu : TvDili {
    override val kod = "ku"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Sibe"
        Vakit.GUNES -> "Rojhilat"
        Vakit.OGLE -> "Nîvro"
        Vakit.IKINDI -> "Esir"
        Vakit.AKSAM -> "Êvar"
        Vakit.YATSI -> "Eşa"
    }
    override val cuma = "Înî"
    override val aylar = listOf(
        "rêbendana", "sibata", "adara", "nîsana", "gulana", "hezîrana",
        "tîrmeha", "tebaxa", "îlona", "cotmeha", "mijdara", "berfanbara",
    )
    override val gunler = listOf("Duşem", "Sêşem", "Çarşem", "Pêncşem", "Înî", "Şemî", "Yekşem")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, ${gun}ê $ay ${yil}an"

    override val birimSa = "st"
    override val birimDk = "d"
    override val birimSn = "sn"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n saet"
    override fun dakikaSesli(n: Int) = "$n deqîqe"
    override val birDakikadanAz = "kêmtir ji 1 deqîqeyê"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Hilatina rojê"
        Kerahat.Tur.ISTIVA -> "Nîvê rojê"
        Kerahat.Tur.GURUB -> "Rojavabûn"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Heta ku roj baş hiltê nimêj mekrûh e."
        Kerahat.Tur.ISTIVA -> "Dema roj li navenda ezmên be nimêj mekrûh e."
        Kerahat.Tur.GURUB -> "Dema roj ava dibe nimêj mekrûh e."
    }

    override fun bant(ad: String, dk: Long) = "Dema $ad kurt dibe · $dk deq"
    override val kabulDuasi = "Xwedê qebûl bike"
    override val iftarSelami = "Fitara we bi xêr be"
    override val cumaSelami = "Îniya we pîroz be"
    override val sahuraKalan = "Dema mayî ji bo paşîvê"
    override val iftaraKalan = "Dema mayî heta fitarê"
}

// tk — Türkmen dili (beta); terminler src/core/dil/sozluk/tk
// CLDR tk: one/other (JS `cogul.ts > birDiger`); Türkmence Latin, i/I (Türkçe noktalı/noktasız ayrımı yok).
// San bilen at ýeke sanda galýar ("5 minut"); aý ady senäniň içinde kiçi harp bilen (CLDR "2 noýabr 2026").
object TvDiliTk : TvDili {
    override val kod = "tk"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Ertir"
        Vakit.GUNES -> "Gün dogşy"
        Vakit.OGLE -> "Öýle"
        Vakit.IKINDI -> "Ikindi"
        Vakit.AKSAM -> "Agşam"
        Vakit.YATSI -> "Ýassy"
    }
    override val cuma = "Juma"
    override val aylar = listOf(
        "ýanwar", "fewral", "mart", "aprel", "maý", "iýun",
        "iýul", "awgust", "sentýabr", "oktýabr", "noýabr", "dekabr",
    )
    override val gunler = listOf("Duşenbe", "Sişenbe", "Çarşenbe", "Penşenbe", "Anna", "Şenbe", "Ýekşenbe")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "sag"
    override val birimDk = "min"
    override val birimSn = "sek"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n sagat"
    override fun dakikaSesli(n: Int) = "$n minut"
    override val birDakikadanAz = "1 minutdan az"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Gün dogşy"
        Kerahat.Tur.ISTIVA -> "Günortan"
        Kerahat.Tur.GURUB -> "Gün ýaşmasy"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Gün gowy galýança namaz okamak mekruhdyr."
        Kerahat.Tur.ISTIVA -> "Gün iň ýokary nokatda durka namaz okamak mekruhdyr."
        Kerahat.Tur.GURUB -> "Gün ýaşyp barýarka namaz okamak mekruhdyr."
    }

    override fun bant(ad: String, dk: Long) = "$ad wagty daralýar · $dk min"
    override val kabulDuasi = "Alla kabul etsin"
    override val iftarSelami = "Agzyaçaryňyz haýyrly bolsun"
    override val cumaSelami = "Juma güniňiz mübärek bolsun"
    override val sahuraKalan = "Selällige galan wagt"
    override val iftaraKalan = "Agzyaçara galan wagt"
}

// tt — Tatarca (beta, Kiril): JS `sozluk/tt` (vakit adları ДУМ РТ, `sure.kisa` сәг/мин/сек, `tarih`, `samimiyet`).
// Tatarca CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`); sayıdan sonra isim çoğul
// eki almaz. Tarih CLDR uzun biçimi: "2 ноябрь, 2026 ел, дүшәмбе".
object TvDiliTt : TvDili {
    override val kod = "tt"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Иртәнге"
        Vakit.GUNES -> "Кояш"
        Vakit.OGLE -> "Өйлә"
        Vakit.IKINDI -> "Икенде"
        Vakit.AKSAM -> "Ахшам"
        Vakit.YATSI -> "Ястү"
    }
    override val cuma = "Җомга"
    override val aylar = listOf(
        "гыйнвар", "февраль", "март", "апрель", "май", "июнь",
        "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
    )
    override val gunler = listOf("дүшәмбе", "сишәмбе", "чәршәмбе", "пәнҗешәмбе", "җомга", "шимбә", "якшәмбе")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gun $ay, $yil ел, $gunAdi"

    override val birimSa = "сәг"
    override val birimDk = "мин"
    override val birimSn = "сек"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n сәгать"
    override fun dakikaSesli(n: Int) = "$n минут"
    override val birDakikadanAz = "1 минуттан аз"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Кояш чыгу"
        Kerahat.Tur.ISTIVA -> "Истива"
        Kerahat.Tur.GURUB -> "Кояш бату"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Кояш тулысынча күтәрелгәнче намаз уку мәкруһ."
        Kerahat.Tur.ISTIVA -> "Кояш нәкъ түбәдә торганда намаз уку мәкруһ."
        Kerahat.Tur.GURUB -> "Кояш батып барганда намаз уку мәкруһ."
    }

    override fun bant(ad: String, dk: Long) = "$ad вакыты тарая · $dk мин"
    override val kabulDuasi = "Аллаһ кабул кылсын"
    override val iftarSelami = "Авыз ачуыгыз кабул булсын"
    override val cumaSelami = "Җомгагыз мөбарәк булсын"
    override val sahuraKalan = "Сәхәргә калды"
    override val iftaraKalan = "Авыз ачуга калды"
}

// sd — Sindhçe (beta): JS `sozluk/sd` (vakit, tarih, sure.kisa, samimiyet, anaEkran.kerahat).
// CLDR sd: one/other (JS `cogul.ts > birDiger`); Arap harfli, SAĞDAN SOLA, yerel rakam `arab`; süre birimi kısaltılmaz.
object TvDiliSd : TvDili {
    override val kod = "sd"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "فجر"
        Vakit.GUNES -> "سج اڀرڻ"
        Vakit.OGLE -> "ظهر"
        Vakit.IKINDI -> "عصر"
        Vakit.AKSAM -> "مغرب"
        Vakit.YATSI -> "عشاء"
    }
    override val cuma = "جمعو"
    override val aylar = listOf(
        "جنوري", "فيبروري", "مارچ", "اپريل", "مئي", "جون",
        "جولاءِ", "آگسٽ", "سيپٽمبر", "آڪٽوبر", "نومبر", "ڊسمبر",
    )
    override val gunler = listOf("سومر", "اڱارو", "اربع", "خميس", "جمعو", "ڇنڇر", "آچر")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi، $gun $ay $yil"

    override val birimSa = "ڪلاڪ"
    override val birimDk = "منٽ"
    override val birimSn = "سيڪنڊ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n ڪلاڪ"
    override fun dakikaSesli(n: Int) = "$n منٽ"
    override val birDakikadanAz = "1 منٽ کان گهٽ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "سج اڀرڻ"
        Kerahat.Tur.ISTIVA -> "زوال"
        Kerahat.Tur.GURUB -> "سج لهڻ"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "سج چڱيءَ طرح اڀرڻ تائين نماز پڙهڻ مڪروه آهي."
        Kerahat.Tur.ISTIVA -> "سج چوٽيءَ تي هجي ته نماز پڙهڻ مڪروه آهي."
        Kerahat.Tur.GURUB -> "سج لهڻ وقت نماز پڙهڻ مڪروه آهي."
    }

    override fun bant(ad: String, dk: Long) = "$ad جو وقت گهٽجي رهيو آهي · $dk منٽ"
    override val kabulDuasi = "الله قبول ڪري"
    override val iftarSelami = "افطاري بابرڪت هجي"
    override val cumaSelami = "جمعو مبارڪ"
    override val sahuraKalan = "سحريءَ ۾ باقي وقت"
    override val iftaraKalan = "افطاري تائين باقي وقت"
}

// pl
// CLDR pl: one = 1; few = …2–4 (…12–14 hariç); many = gerisi (0, 5–21, 25…) — JS `cogul.ts > lehce`; tarihte ay ilgi hâlinde.
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (ilgi hâli, "2 listopada"). Terimler JS `sozluk/pl`.
object TvDiliPl : TvDili {
    override val kod = "pl"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fadżr"
        Vakit.GUNES -> "Wschód słońca"
        Vakit.OGLE -> "Zuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isza"
    }
    override val cuma = "Dżumu’a"

    /** Tarih içinde (ilgi hâli, "2 listopada"); tek başına ay adı kullanılmaz. */
    override val aylar = listOf(
        "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
        "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
    )
    override val gunler = listOf("Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "godz."
    override val birimDk = "min"
    override val birimSn = "sek."
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR pl (JS `cogul.ts > lehce`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        if (n == 1) return "one"
        val s10 = n % 10
        val s100 = n % 100
        return if (s10 in 2..4 && s100 !in 12..14) "few" else "many"
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n godzina"
        "few" -> "$n godziny"
        "many" -> "$n godzin"
        else -> "$n godziny"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n minuta"
        "few" -> "$n minuty"
        "many" -> "$n minut"
        else -> "$n minuty"
    }
    override val birDakikadanAz = "mniej niż minuta"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Wschód słońca"
        Kerahat.Tur.ISTIVA -> "Zenit"
        Kerahat.Tur.GURUB -> "Zachód słońca"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Modlitwa jest niezalecana, dopóki słońce wyraźnie nie wzejdzie."
        Kerahat.Tur.ISTIVA -> "Modlitwa jest niezalecana, gdy słońce jest w zenicie."
        Kerahat.Tur.GURUB -> "Modlitwa jest niezalecana, gdy słońce zachodzi."
    }

    override fun bant(ad: String, dk: Long) = "Czas modlitwy $ad się kończy · $dk min"
    override val kabulDuasi = "Niech Allah przyjmie"
    override val iftarSelami = "Błogosławionego iftaru"
    override val cumaSelami = "Błogosławionego piątku"
    override val sahuraKalan = "Do końca suhur"
    override val iftaraKalan = "Do iftaru"
}

// ja
// CLDR ja: yalnız other (JS `cogul.ts > hepDiger`); sayı ile birim BİTİŞİK (Çince gibi).
// Kana/kanji Kotlin tanımlayıcısına yapışır: şablonda `${...}` yazılır.
object TvDiliJa : TvDili {
    override val kod = "ja"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ファジュル"
        Vakit.GUNES -> "日の出"
        Vakit.OGLE -> "ズフル"
        Vakit.IKINDI -> "アスル"
        Vakit.AKSAM -> "マグリブ"
        Vakit.YATSI -> "イシャー"
    }
    override val cuma = "金曜礼拝"
    override val aylar = listOf(
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月",
    )
    override val gunler = listOf("月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${yil}年${ay}${gun}日 ${gunAdi}"

    override val birimSa = "時間"
    override val birimDk = "分"
    override val birimSn = "秒"
    override val birimAyirici = ""
    override val parcaAyirici = ""
    override fun saatSesli(n: Int) = "${n}時間"
    override fun dakikaSesli(n: Int) = "${n}分"
    override val birDakikadanAz = "1分未満"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "日の出"
        Kerahat.Tur.ISTIVA -> "南中"
        Kerahat.Tur.GURUB -> "日没"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "太陽が十分に昇るまで、礼拝は好ましくありません。"
        Kerahat.Tur.ISTIVA -> "太陽が南中している間、礼拝は好ましくありません。"
        Kerahat.Tur.GURUB -> "太陽が沈んでいる間、礼拝は好ましくありません。"
    }

    override fun bant(ad: String, dk: Long) = "${ad}の時間が迫っています・${dk}分"
    override val kabulDuasi = "アッラーが受け入れてくださいますように"
    override val iftarSelami = "恵みあるイフタールを"
    override val cumaSelami = "ジュムア・ムバーラク"
    override val sahuraKalan = "サフールの残り時間"
    override val iftaraKalan = "イフタールまでの残り時間"
}

// gu — Gucaratça (beta): JS `sozluk/gu` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR gu: one = 0 ve 1, other (JS `cogul.ts > sifirBir`, Hintçe kuralı); birimler çoğulda değişmez. Tarih CLDR: "સોમવાર, 2 નવેમ્બર, 2026".
object TvDiliGu : TvDili {
    override val kod = "gu"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ફજર"
        Vakit.GUNES -> "સૂર્યોદય"
        Vakit.OGLE -> "ઝોહર"
        Vakit.IKINDI -> "અસર"
        Vakit.AKSAM -> "મગરિબ"
        Vakit.YATSI -> "ઈશા"
    }
    override val cuma = "જુમ્મા"
    override val aylar = listOf(
        "જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન",
        "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર",
    )
    override val gunler = listOf("સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર", "રવિવાર")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay}, ${yil}"

    override val birimSa = "ક"
    override val birimDk = "મિ"
    override val birimSn = "સે"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n કલાક"
    override fun dakikaSesli(n: Int) = "$n મિનિટ"
    override val birDakikadanAz = "1 મિનિટથી ઓછો"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "સૂર્યોદય"
        Kerahat.Tur.ISTIVA -> "મધ્યાહ્ન"
        Kerahat.Tur.GURUB -> "સૂર્યાસ્ત"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "સૂરજ બરાબર ઊંચો ચડે ત્યાં સુધી નમાઝ પઢવી મકરૂહ છે."
        Kerahat.Tur.ISTIVA -> "સૂરજ બરાબર માથા પર હોય ત્યારે નમાઝ પઢવી મકરૂહ છે."
        Kerahat.Tur.GURUB -> "સૂરજ આથમતો હોય ત્યારે નમાઝ પઢવી મકરૂહ છે."
    }

    override fun bant(ad: String, dk: Long) = "${ad}નો સમય ઓછો છે · ${dk} મિ"
    override val kabulDuasi = "અલ્લાહ કબૂલ કરે"
    override val iftarSelami = "ઇફતારીમાં બરકત થાય"
    override val cumaSelami = "જુમ્મા મુબારક"
    override val sahuraKalan = "સહરી માટે બાકી સમય"
    override val iftaraKalan = "ઇફતારી સુધી બાકી સમય"
}

// bg
// CLDR bg: one/other (JS `cogul.ts > birDiger`); Kiril; ay adı tarihte de yalın ve küçük (CLDR "2 ноември 2026 г.").
object TvDiliBg : TvDili {
    override val kod = "bg"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Зора"
        Vakit.GUNES -> "Изгрев"
        Vakit.OGLE -> "Обяд"
        Vakit.IKINDI -> "Следобяд"
        Vakit.AKSAM -> "Залез"
        Vakit.YATSI -> "Нощ"
    }
    override val cuma = "Джума"
    override val aylar = listOf(
        "януари", "февруари", "март", "април", "май", "юни",
        "юли", "август", "септември", "октомври", "ноември", "декември",
    )
    override val gunler = listOf("понеделник", "вторник", "сряда", "четвъртък", "петък", "събота", "неделя")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay} ${yil} г."

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 1) "1 час" else "${n} часа"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 минута" else "${n} минути"
    override val birDakikadanAz = "по-малко от 1 минута"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Изгрев"
        Kerahat.Tur.ISTIVA -> "Зенит"
        Kerahat.Tur.GURUB -> "Залез"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Изпълнението на намаз е нежелано, докато слънцето не се издигне добре."
        Kerahat.Tur.ISTIVA -> "Изпълнението на намаз е нежелано, докато слънцето е в зенита си."
        Kerahat.Tur.GURUB -> "Изпълнението на намаз е нежелано, докато слънцето залязва."
    }

    override fun bant(ad: String, dk: Long) = "Времето за ${ad} намалява · ${dk} мин"
    override val kabulDuasi = "Аллах да приеме"
    override val iftarSelami = "Благословен ифтар"
    override val cumaSelami = "Благословена Джума"
    override val sahuraKalan = "Оставащо време за сахур"
    override val iftaraKalan = "Оставащо време до ифтар"
}

// mk
// CLDR mk: one = …1 (…11 hariç), other — JS `cogul.ts > makedonca`; Kiril (ѓ ќ ѕ).
// `aylar` yalnız tarihte kullanılır; Makedoncada ay adı çekimsiz (CLDR "2 ноември 2026 г.").
object TvDiliMk : TvDili {
    override val kod = "mk"

    /** Pano çizelgedir: sabah satırı JS `vakit.imsakVakti` ("Сабах"). */
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Сабах"
        Vakit.GUNES -> "Изгрејсонце"
        Vakit.OGLE -> "Пладне"
        Vakit.IKINDI -> "Икиндија"
        Vakit.AKSAM -> "Акшам"
        Vakit.YATSI -> "Јација"
    }
    override val cuma = "Џума"
    override val aylar = listOf(
        "јануари", "февруари", "март", "април", "мај", "јуни",
        "јули", "август", "септември", "октомври", "ноември", "декември",
    )
    override val gunler = listOf("понеделник", "вторник", "среда", "четврток", "петок", "сабота", "недела")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil г."

    override val birimSa = "ч"
    override val birimDk = "мин"
    override val birimSn = "с"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR mk (JS `cogul.ts > makedonca`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        return if (n % 10 == 1 && n % 100 != 11) "one" else "other"
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n час"
        else -> "$n часа"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n минута"
        else -> "$n минути"
    }
    override val birDakikadanAz = "помалку од 1 минута"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Изгрејсонце"
        Kerahat.Tur.ISTIVA -> "Зенит"
        Kerahat.Tur.GURUB -> "Зајдисонце"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Да се клања е мекрух додека сонцето добро не се издигне."
        Kerahat.Tur.ISTIVA -> "Да се клања е мекрух додека сонцето е во зенитот."
        Kerahat.Tur.GURUB -> "Да се клања е мекрух додека сонцето заоѓа."
    }

    override fun bant(ad: String, dk: Long) = "$ad: времето се ближи кон крајот · $dk мин"
    override val kabulDuasi = "Аллах нека прими"
    override val iftarSelami = "Хаирли ифтар"
    override val cumaSelami = "Хаирли џума"
    override val sahuraKalan = "До крајот на сехурот"
    override val iftaraKalan = "До ифтар"
}

// fil
// CLDR fil: son hanesi 4, 6, 9 OLMAYAN tekil (0, 1, 2, 3, 5…), gerisi other — JS `cogul.ts > filipince`; Latin; Android kaynağı `values-tl`.
// Filipincede ad sayıyla çekilmez: iki dal aynı metni verir. Tarih CLDR fil ("Biyernes, Oktubre 30, 2026").
object TvDiliFil : TvDili {
    override val kod = "fil"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Pagsikat ng araw"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Jumu'ah"
    override val aylar = listOf(
        "Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo",
        "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre",
    )
    override val gunler = listOf("Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado", "Linggo")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $ay $gun, $yil"

    override val birimSa = "oras"
    override val birimDk = "min"
    override val birimSn = "seg"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR fil (JS `cogul.ts > filipince`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s10 = n % 10
        return if (s10 == 4 || s10 == 6 || s10 == 9) "other" else "one"
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n oras"
        else -> "$n oras"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n minuto"
        else -> "$n minuto"
    }
    override val birDakikadanAz = "wala pang 1 minuto"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Pagsikat ng araw"
        Kerahat.Tur.ISTIVA -> "Katanghaliang-tapat"
        Kerahat.Tur.GURUB -> "Paglubog ng araw"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Makruh ang pagdarasal hanggang lubusang sumikat ang araw."
        Kerahat.Tur.ISTIVA -> "Makruh ang pagdarasal habang nasa tuktok ng langit ang araw."
        Kerahat.Tur.GURUB -> "Makruh ang pagdarasal habang lumulubog ang araw."
    }

    override fun bant(ad: String, dk: Long) = "Kumikitid ang oras ng $ad · $dk min"
    override val kabulDuasi = "Tanggapin nawa ni Allah"
    override val iftarSelami = "Mapagpalang iftar"
    override val cumaSelami = "Jumu'ah Mubarak"
    override val sahuraKalan = "Natitirang oras para sa sahur"
    override val iftaraKalan = "Natitirang oras bago ang iftar"
}

// te
// CLDR te: one/other (JS `cogul.ts > birDiger`); Telugu yazısı, Batı rakamı (CLDR `latn`).
// Telugu harfleri Kotlin tanımlayıcı karakteridir: şablonda her zaman `${ad}` biçimi.
object TvDiliTe : TvDili {
    override val kod = "te"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ఫజ్ర్"
        Vakit.GUNES -> "సూర్యోదయం"
        Vakit.OGLE -> "జుహ్ర్"
        Vakit.IKINDI -> "అస్ర్"
        Vakit.AKSAM -> "మగ్రిబ్"
        Vakit.YATSI -> "ఇషా"
    }
    override val cuma = "జుమా"
    override val aylar = listOf(
        "జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్",
        "జులై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్",
    )
    override val gunler = listOf("సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం", "ఆదివారం")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gun} ${ay}, ${yil}, ${gunAdi}"

    override val birimSa = "గం"
    override val birimDk = "నిమి"
    override val birimSn = "సె"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 1) "1 గంట" else "${n} గంటలు"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 నిమిషం" else "${n} నిమిషాలు"
    override val birDakikadanAz = "1 నిమిషం కంటే తక్కువ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "సూర్యోదయం"
        Kerahat.Tur.ISTIVA -> "నడినెత్తి"
        Kerahat.Tur.GURUB -> "సూర్యాస్తమయం"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "సూర్యుడు బాగా పైకి వచ్చే వరకు నమాజ్ ఆచరించడం మక్రూహ్."
        Kerahat.Tur.ISTIVA -> "సూర్యుడు నడినెత్తిన ఉన్నప్పుడు నమాజ్ ఆచరించడం మక్రూహ్."
        Kerahat.Tur.GURUB -> "సూర్యుడు అస్తమిస్తున్నప్పుడు నమాజ్ ఆచరించడం మక్రూహ్."
    }

    override fun bant(ad: String, dk: Long) = "${ad} సమయం తగ్గుతోంది · ${dk} నిమి"
    override val kabulDuasi = "అల్లాహ్ స్వీకరించుగాక"
    override val iftarSelami = "శుభప్రదమైన ఇఫ్తార్"
    override val cumaSelami = "జుమా ముబారక్"
    override val sahuraKalan = "సహరీకి మిగిలిన సమయం"
    override val iftaraKalan = "ఇఫ్తార్‌కు మిగిలిన సమయం"
}

// kn — Kannada (beta): JS `sozluk/kn` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı (CLDR `latn`).
// CLDR kn: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); sayıyla ad tekil kalır ("2 ಗಂಟೆ") → one = other,
// iskeletteki `n == 1` dalı kaldırıldı. Tarih CLDR (EEEE, MMMM d, y): "ಸೋಮವಾರ, ನವೆಂಬರ್ 2, 2026".
// Kannada harfleri Kotlin'de tanımlayıcıya yapışır: "$adಗೆ" değil "${ad}ಗೆ".
object TvDiliKn : TvDili {
    override val kod = "kn"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ಫಜ್ರ್"
        Vakit.GUNES -> "ಸೂರ್ಯೋದಯ"
        Vakit.OGLE -> "ಝುಹರ್"
        Vakit.IKINDI -> "ಅಸರ್"
        Vakit.AKSAM -> "ಮಗ್ರಿಬ್"
        Vakit.YATSI -> "ಇಶಾ"
    }
    override val cuma = "ಜುಮಾ"
    override val aylar = listOf(
        "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
        "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್",
    )
    override val gunler = listOf("ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ", "ಭಾನುವಾರ")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${ay} ${gun}, ${yil}"

    override val birimSa = "ಗಂ"
    override val birimDk = "ನಿಮಿ"
    override val birimSn = "ಸೆ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n ಗಂಟೆ"
    override fun dakikaSesli(n: Int) = "$n ನಿಮಿಷ"
    override val birDakikadanAz = "1 ನಿಮಿಷಕ್ಕಿಂತ ಕಡಿಮೆ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ಸೂರ್ಯೋದಯ"
        Kerahat.Tur.ISTIVA -> "ನಡುಹಗಲು"
        Kerahat.Tur.GURUB -> "ಸೂರ್ಯಾಸ್ತ"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ಸೂರ್ಯ ಚೆನ್ನಾಗಿ ಮೇಲೇರುವವರೆಗೆ ನಮಾಝ್ ನಿರ್ವಹಿಸುವುದು ಮಕ್ರೂಹ್."
        Kerahat.Tur.ISTIVA -> "ಸೂರ್ಯ ನೆತ್ತಿಯ ಮೇಲಿರುವಾಗ ನಮಾಝ್ ನಿರ್ವಹಿಸುವುದು ಮಕ್ರೂಹ್."
        Kerahat.Tur.GURUB -> "ಸೂರ್ಯ ಮುಳುಗುತ್ತಿರುವಾಗ ನಮಾಝ್ ನಿರ್ವಹಿಸುವುದು ಮಕ್ರೂಹ್."
    }

    override fun bant(ad: String, dk: Long) = "${ad} ಸಮಯ ಮುಗಿಯುತ್ತಿದೆ · ${dk} ನಿಮಿ"
    override val kabulDuasi = "ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ"
    override val iftarSelami = "ಇಫ್ತಾರ್‌ನಲ್ಲಿ ಬರಕತ್ ಇರಲಿ"
    override val cumaSelami = "ಜುಮಾ ಮುಬಾರಕ್"
    override val sahuraKalan = "ಸಹರಿಗೆ ಉಳಿದ ಸಮಯ"
    override val iftaraKalan = "ಇಫ್ತಾರ್‌ಗೆ ಉಳಿದ ಸಮಯ"
}

// mr — Marathi (beta): JS `sozluk/mr` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam sözlükte Batı.
// CLDR mr: one/other (JS `cogul.ts > birDiger`); Devanagari, yerel rakam `deva`. Tarih CLDR gibi virgüllü.
object TvDiliMr : TvDili {
    override val kod = "mr"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "फज्र"
        Vakit.GUNES -> "सूर्योदय"
        Vakit.OGLE -> "जोहर"
        Vakit.IKINDI -> "असर"
        Vakit.AKSAM -> "मगरिब"
        Vakit.YATSI -> "इशा"
    }
    override val cuma = "जुमा"
    override val aylar = listOf(
        "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
        "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर",
    )
    override val gunler = listOf("सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay}, ${yil}"

    override val birimSa = "ता"
    override val birimDk = "मिनि"
    override val birimSn = "से"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} तास"
    override fun dakikaSesli(n: Int) = if (n == 1) "1 मिनिट" else "${n} मिनिटे"
    override val birDakikadanAz = "1 मिनिटापेक्षा कमी"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "सूर्योदय"
        Kerahat.Tur.ISTIVA -> "मध्यान्ह"
        Kerahat.Tur.GURUB -> "सूर्यास्त"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "सूर्य चांगला वर येईपर्यंत नमाज अदा करणे मकरूह आहे."
        Kerahat.Tur.ISTIVA -> "सूर्य माथ्यावर असताना नमाज अदा करणे मकरूह आहे."
        Kerahat.Tur.GURUB -> "सूर्य मावळत असताना नमाज अदा करणे मकरूह आहे."
    }

    override fun bant(ad: String, dk: Long) = "${ad} ची वेळ कमी होत आहे · ${dk} मि"
    override val kabulDuasi = "अल्लाह कबूल करो"
    override val iftarSelami = "इफ्तार मुबारक"
    override val cumaSelami = "जुमा मुबारक"
    override val sahuraKalan = "सहरीसाठी उरलेला वेळ"
    override val iftaraKalan = "इफ्तारपर्यंत उरलेला वेळ"
}

// pa
// CLDR pa: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Şahmuki (Arap harfli, Pakistan), SAĞDAN SOLA, yerel rakam `arabext`.
// Süre birimi kısaltılmaz (JS `sozluk/pa/sure.ts`); gün/ay adları CLDR `pa-Arab-PK` (JS `sozluk/pa/tarih.ts`).
object TvDiliPa : TvDili {
    override val kod = "pa"
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
    override val gunler = listOf("پیر", "منگل", "بُدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi، $gun $ay $yil"

    override val birimSa = "گھنٹے"
    override val birimDk = "منٹ"
    override val birimSn = "سیکنڈ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "$n گھنٹہ" else "$n گھنٹے"
    override fun dakikaSesli(n: Int) = "$n منٹ"
    override val birDakikadanAz = "1 منٹ توں گھٹ"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "طلوعِ آفتاب"
        Kerahat.Tur.ISTIVA -> "زوال"
        Kerahat.Tur.GURUB -> "غروبِ آفتاب"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "سورج چنگی طرح اُچا ہون تک نماز پڑھنا مکروہ اے۔"
        Kerahat.Tur.ISTIVA -> "سورج عین سر اُتے ہووے تاں نماز پڑھنا مکروہ اے۔"
        Kerahat.Tur.GURUB -> "سورج ڈُبدے ویلے نماز پڑھنا مکروہ اے۔"
    }

    override fun bant(ad: String, dk: Long) = "$ad دا وقت تنگ ہو رہیا اے · $dk منٹ"
    override val kabulDuasi = "اللہ قبول کرے"
    override val iftarSelami = "افطار بابرکت ہووے"
    override val cumaSelami = "جمعہ مبارک"
    override val sahuraKalan = "سحری وچ باقی وقت"
    override val iftaraKalan = "افطار تک باقی وقت"
}

// as
// CLDR as: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Bengal yazısı, yerel rakam `beng`.
// Assamcada sayıdan sonra isim çekimlenmez: iki kategori aynı biçim. Tarih CLDR: "সোমবাৰ, 2 নৱেম্বৰ, 2026".
object TvDiliAs : TvDili {
    override val kod = "as"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ফজৰ"
        Vakit.GUNES -> "সূৰ্যোদয়"
        Vakit.OGLE -> "জোহৰ"
        Vakit.IKINDI -> "আছৰ"
        Vakit.AKSAM -> "মাগৰিব"
        Vakit.YATSI -> "ঈশ্বা"
    }
    override val cuma = "জুমুআ"
    override val aylar = listOf(
        "জানুৱাৰী", "ফেব্ৰুৱাৰী", "মাৰ্চ", "এপ্ৰিল", "মে’", "জুন",
        "জুলাই", "আগষ্ট", "ছেপ্তেম্বৰ", "অক্টোবৰ", "নৱেম্বৰ", "ডিচেম্বৰ",
    )
    override val gunler = listOf("সোমবাৰ", "মঙ্গলবাৰ", "বুধবাৰ", "বৃহস্পতিবাৰ", "শুক্ৰবাৰ", "শনিবাৰ", "দেওবাৰ")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay}, ${yil}"

    override val birimSa = "ঘ"
    override val birimDk = "মি"
    override val birimSn = "ছে"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "${n} ঘণ্টা" else "${n} ঘণ্টা"
    override fun dakikaSesli(n: Int) = if (n == 0 || n == 1) "${n} মিনিট" else "${n} মিনিট"
    override val birDakikadanAz = "1 মিনিটতকৈ কম"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "সূৰ্যোদয়"
        Kerahat.Tur.ISTIVA -> "মধ্যাহ্ন"
        Kerahat.Tur.GURUB -> "সূৰ্যাস্ত"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "সূৰ্য ভালদৰে ওপৰলৈ উঠালৈ নামাজ পঢ়া মাকৰূহ।"
        Kerahat.Tur.ISTIVA -> "সূৰ্য মূৰৰ ওপৰত থাকোঁতে নামাজ পঢ়া মাকৰূহ।"
        Kerahat.Tur.GURUB -> "সূৰ্য অস্ত যাওঁতে নামাজ পঢ়া মাকৰূহ।"
    }

    override fun bant(ad: String, dk: Long) = "${ad}ৰ সময় কমি আহিছে · ${dk} মি"
    override val kabulDuasi = "আল্লাহে কবুল কৰক"
    override val iftarSelami = "বৰকতময় ইফতাৰ"
    override val cumaSelami = "জুমুআ মোবাৰক"
    override val sahuraKalan = "ছাহৰীৰ বাবে বাকী সময়"
    override val iftaraKalan = "ইফতাৰলৈ বাকী সময়"
}

// ne — Nepalce (beta): JS `sozluk/ne` (vakit, tarih, sure, samimiyet, anaEkran.kerahat); rakam Batı.
// CLDR ne: one/other (JS `cogul.ts > birDiger`); Devanagari, yerel rakam `deva`. Sayıdan sonra isim çekimlenmez.
// Devanagari harfi Kotlin tanımlayıcısına yapışır: şablonda `${ad}` yazılır.
object TvDiliNe : TvDili {
    override val kod = "ne"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "फज्र"
        Vakit.GUNES -> "सूर्योदय"
        Vakit.OGLE -> "जुहर"
        Vakit.IKINDI -> "अस्र"
        Vakit.AKSAM -> "मगरिब"
        Vakit.YATSI -> "इशा"
    }
    override val cuma = "जुमा"
    override val aylar = listOf(
        "जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन",
        "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर",
    )
    override val gunler = listOf("सोमबार", "मङ्गलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार", "आइतबार")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${yil} ${ay} ${gun}"

    override val birimSa = "घण्टा"
    override val birimDk = "मिनेट"
    override val birimSn = "सेकेन्ड"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} घण्टा"
    override fun dakikaSesli(n: Int) = "${n} मिनेट"
    override val birDakikadanAz = "1 मिनेटभन्दा कम"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "सूर्योदय"
        Kerahat.Tur.ISTIVA -> "मध्याह्न"
        Kerahat.Tur.GURUB -> "सूर्यास्त"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "घाम राम्ररी नउक्लेसम्म नमाज पढ्नु मकरुह हो।"
        Kerahat.Tur.ISTIVA -> "घाम ठीक माथि हुँदा नमाज पढ्नु मकरुह हो।"
        Kerahat.Tur.GURUB -> "घाम अस्ताउँदै गर्दा नमाज पढ्नु मकरुह हो।"
    }

    override fun bant(ad: String, dk: Long) = "${ad}को समय कम हुँदै छ · ${dk} मिनेट"
    override val kabulDuasi = "अल्लाहले स्वीकार गरून्"
    override val iftarSelami = "इफ्तार मुबारक"
    override val cumaSelami = "जुमा मुबारक"
    override val sahuraKalan = "सेहरीका लागि बाँकी समय"
    override val iftaraKalan = "इफ्तारसम्म बाँकी समय"
}

// si — Sinhala (beta); terimler src/core/dil/sozluk/si.
// CLDR si: tam sayıda one = 0 ve 1, other (JS `cogul.ts > sifirBir`). Sinhala ad sayıyla çekilmez: iki
// kategori aynı kalıbı taşır; sayı önce (kalıp sözleşmesi). Tarih CLDR gibi yıl önce: "2026 ඔක්තෝබර් 30, සිකුරාදා".
object TvDiliSi : TvDili {
    override val kod = "si"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ෆජ්ර්"
        Vakit.GUNES -> "හිරු උදාව"
        Vakit.OGLE -> "ලුහර්"
        Vakit.IKINDI -> "අසර්"
        Vakit.AKSAM -> "මග්රිබ්"
        Vakit.YATSI -> "ඉෂා"
    }
    override val cuma = "ජුමුආ"
    override val aylar = listOf(
        "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
        "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්",
    )
    override val gunler = listOf("සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා", "ඉරිදා")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$yil $ay $gun, $gunAdi"

    override val birimSa = "පැය"
    override val birimDk = "මිනි"
    override val birimSn = "තත්"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = when (n) {
        0, 1 -> "$n පැය"
        else -> "$n පැය"
    }
    override fun dakikaSesli(n: Int) = when (n) {
        0, 1 -> "$n මිනිත්තු"
        else -> "$n මිනිත්තු"
    }
    override val birDakikadanAz = "මිනිත්තුවකට අඩු"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "හිරු උදාව"
        Kerahat.Tur.ISTIVA -> "හිරු මුදුන"
        Kerahat.Tur.GURUB -> "හිරු බැසීම"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "හිරු හොඳින් උදා වන තෙක් සලාතය ඉටු කිරීම තහනම්."
        Kerahat.Tur.ISTIVA -> "හිරු මුදුන් වී ඇති අතරතුර සලාතය ඉටු කිරීම තහනම්."
        Kerahat.Tur.GURUB -> "හිරු බසින අතරතුර සලාතය ඉටු කිරීම තහනම්."
    }

    override fun bant(ad: String, dk: Long) = "$ad සඳහා වේලාව අඩු වෙමින් · $dk මි"
    override val kabulDuasi = "අල්ලාහ් පිළිගනු මැනව"
    override val iftarSelami = "ආශිර්වාදිත ඉෆ්තාර් වේලාවක් වේවා"
    override val cumaSelami = "ජුමුආ මුබාරක්"
    override val sahuraKalan = "සහර් සඳහා ඉතිරි කාලය"
    override val iftaraKalan = "ඉෆ්තාර් දක්වා ඉතිරි කාලය"
}

// km
// CLDR km: yalnız other (JS `cogul.ts > hepDiger`); Khmer, sözcük arası boşluksuz, Batı rakamı.
// Khmer harfleri Kotlin'de tanımlayıcı karakteridir: şablonda "${ad}" (süslü parantezli) yazılır.
object TvDiliKm : TvDili {
    override val kod = "km"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ស៊ូពុស"
        Vakit.GUNES -> "ថ្ងៃរះ"
        Vakit.OGLE -> "ហ្ស៊ូហូរ"
        Vakit.IKINDI -> "អាសើរ"
        Vakit.AKSAM -> "ម៉ាហ្គ្រិប"
        Vakit.YATSI -> "អ៊ីស្ហា"
    }
    override val cuma = "ជុមអាត់"
    override val aylar = listOf(
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
    )
    override val gunler = listOf("ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍", "អាទិត្យ")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi} ${gun} ${ay} ${yil}"

    override val birimSa = "ម៉ោង"
    override val birimDk = "នាទី"
    override val birimSn = "វិនាទី"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} ម៉ោង"
    override fun dakikaSesli(n: Int) = "${n} នាទី"
    override val birDakikadanAz = "តិចជាង 1 នាទី"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ថ្ងៃរះ"
        Kerahat.Tur.ISTIVA -> "ថ្ងៃត្រង់"
        Kerahat.Tur.GURUB -> "ថ្ងៃលិច"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ហាមសឡាត រហូតដល់ព្រះអាទិត្យរះខ្ពស់។"
        Kerahat.Tur.ISTIVA -> "ហាមសឡាត ពេលព្រះអាទិត្យនៅចំកំពូល។"
        Kerahat.Tur.GURUB -> "ហាមសឡាត ពេលព្រះអាទិត្យកំពុងលិច។"
    }

    override fun bant(ad: String, dk: Long) = "ពេល${ad}ជិតផុត · ${dk} នាទី"
    override val kabulDuasi = "សូមអល់ឡោះទទួលយក"
    override val iftarSelami = "សូមឲ្យការស្រាយបួសមានពរជ័យ"
    override val cumaSelami = "សូមឲ្យថ្ងៃសុក្រមានពរជ័យ"
    override val sahuraKalan = "ពេលនៅសល់សម្រាប់សាហួរ"
    override val iftaraKalan = "ពេលនៅសល់ដល់ស្រាយបួស"
}

// ÇEVİRİ: he
// CLDR he: one = 1, two = 2, other (JS `cogul.ts > ibranice`; tam sayı); İbrani harfli, SAĞDAN SOLA; Android kaynağı `values-iw`.
object TvDiliHe : TvDili {
    override val kod = "he"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR he (JS `cogul.ts > ibranice`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        return when (n) {
            1 -> "one"
            2 -> "two"
            else -> "other"
        }
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n hour"
        "two" -> "$n hours"
        else -> "$n hours"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n minute"
        "two" -> "$n minutes"
        else -> "$n minutes"
    }
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

// ka — Gürcüce (beta); terimler src/core/dil/sozluk/ka
// CLDR ka: one/other (JS `cogul.ts > birDiger`); sayıdan sonra isim tekil. Tarih CLDR "ოთხშაბათი, 4 ნოემბერი, 2026"; şablonda `${ad}`.
object TvDiliKa : TvDili {
    override val kod = "ka"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "ფაჯრი"
        Vakit.GUNES -> "მზის ამოსვლა"
        Vakit.OGLE -> "ზუჰრი"
        Vakit.IKINDI -> "ასრი"
        Vakit.AKSAM -> "მაღრიბი"
        Vakit.YATSI -> "იშა"
    }
    override val cuma = "პარასკევის ლოცვა"
    override val aylar = listOf(
        "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
        "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
    )
    override val gunler = listOf("ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay}, ${yil}"

    override val birimSa = "სთ"
    override val birimDk = "წთ"
    override val birimSn = "წმ"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "${n} საათი"
    override fun dakikaSesli(n: Int) = "${n} წუთი"
    override val birDakikadanAz = "1 წუთზე ნაკლები"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "მზის ამოსვლა"
        Kerahat.Tur.ISTIVA -> "ზენიტი"
        Kerahat.Tur.GURUB -> "მზის ჩასვლა"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "ლოცვა მაკრუჰია, სანამ მზე კარგად ამოვა."
        Kerahat.Tur.ISTIVA -> "ლოცვა მაკრუჰია, სანამ მზე ზენიტშია."
        Kerahat.Tur.GURUB -> "ლოცვა მაკრუჰია, სანამ მზე ჩადის."
    }

    override fun bant(ad: String, dk: Long) = "${ad}: დრო იწურება · ${dk} წთ"
    override val kabulDuasi = "ალლაჰმა მიიღოს"
    override val iftarSelami = "კურთხეული იფთარი"
    override val cumaSelami = "კურთხეული პარასკევი"
    override val sahuraKalan = "სუჰურისთვის დარჩენილი დრო"
    override val iftaraKalan = "იფთარამდე დარჩენილი დრო"
}

// ÇEVİRİ: lt
// CLDR lt: one = …1 (…11–19 hariç), few = …2–9 (…11–19 hariç), other (many yalnız kesirli) — JS `cogul.ts > litvanca`.
// `aylar` yalnız tarihte kullanılır → tarih içi biçim (ilgi hâli).
object TvDiliLt : TvDili {
    override val kod = "lt"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR lt (JS `cogul.ts > litvanca`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s10 = n % 10
        val s100 = n % 100
        if (s100 in 11..19) return "other"
        return if (s10 == 1) "one" else if (s10 in 2..9) "few" else "other"
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n hour"
        "few" -> "$n hours"
        "many" -> "$n hours"
        else -> "$n hours"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n minute"
        "few" -> "$n minutes"
        "many" -> "$n minutes"
        else -> "$n minutes"
    }
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

// CLDR mg: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Latin. Malgaşçada isim çoğul eki almaz.
object TvDiliMg : TvDili {
    override val kod = "mg"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Masoandro"
        Vakit.OGLE -> "Zohr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Zoma"
    override val aylar = listOf(
        "Janoary", "Febroary", "Martsa", "Aprily", "Mey", "Jona",
        "Jolay", "Aogositra", "Septambra", "Oktobra", "Novambra", "Desambra",
    )
    override val gunler = listOf("Alatsinainy", "Talata", "Alarobia", "Alakamisy", "Zoma", "Asabotsy", "Alahady")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "ora"
    override val birimDk = "min"
    override val birimSn = "seg"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n ora"
    override fun dakikaSesli(n: Int) = "$n minitra"
    override val birDakikadanAz = "latsaky ny 1 minitra"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Fiposahan'ny masoandro"
        Kerahat.Tur.ISTIVA -> "Tampon'ny masoandro"
        Kerahat.Tur.GURUB -> "Filentehan'ny masoandro"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Tsy tokony hivavaka mandra-piposahan'ny masoandro tsara."
        Kerahat.Tur.ISTIVA -> "Tsy tokony hivavaka raha eo amin'ny tampony ny masoandro."
        Kerahat.Tur.GURUB -> "Tsy tokony hivavaka raha milentika ny masoandro."
    }

    override fun bant(ad: String, dk: Long) = "Efa ho lany ny fotoanan'ny $ad · $dk min"
    override val kabulDuasi = "Raisin'Allah anie"
    override val iftarSelami = "Iftar feno fitahiana"
    override val cumaSelami = "Zoma Mubarak"
    override val sahuraKalan = "Fotoana sisa ho an'ny Sohor"
    override val iftaraKalan = "Fotoana sisa mankany amin'ny iftar"
}

// lg
// CLDR lg: one/other (JS `cogul.ts > birDiger`); Latin. Sayı addan sonra gelir ("eddakiika 5").
object TvDiliLg : TvDili {
    override val kod = "lg"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Subuhi"
        Vakit.GUNES -> "Enjuba okuvaayo"
        Vakit.OGLE -> "Dhuhur"
        Vakit.IKINDI -> "Aswiri"
        Vakit.AKSAM -> "Magaribi"
        Vakit.YATSI -> "Ishai"
    }
    override val cuma = "Ejjuma"
    override val aylar = listOf(
        "Janwaliyo", "Febwaliyo", "Marisi", "Apuli", "Maayi", "Juuni",
        "Julaayi", "Agusito", "Sebuttemba", "Okitobba", "Novemba", "Desemba",
    )
    override val gunler = listOf("Balaza", "Lwakubiri", "Lwakusatu", "Lwakuna", "Lwakutaano", "Lwamukaaga", "Sabbiiti")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "$gunAdi, $gun $ay $yil"

    override val birimSa = "ssa"
    override val birimDk = "dk"
    override val birimSn = "tk"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "essaawa $n"
    override fun dakikaSesli(n: Int) = "eddakiika $n"
    override val birDakikadanAz = "wansi w’eddakiika emu"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Enjuba okuvaayo"
        Kerahat.Tur.ISTIVA -> "Wakati w’eggulu"
        Kerahat.Tur.GURUB -> "Enjuba okugwa"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Okusaala kikyayibwa okutuusa enjuba ng’evuddeyo bulungi."
        Kerahat.Tur.ISTIVA -> "Okusaala kikyayibwa ng’enjuba eri wakati w’eggulu."
        Kerahat.Tur.GURUB -> "Okusaala kikyayibwa ng’enjuba egwa."
    }

    override fun bant(ad: String, dk: Long) = "Ekiseera kya $ad kinaatera okuggwaako · dk $dk"
    override val kabulDuasi = "Allah akkirize"
    override val iftarSelami = "Iftar ey’emikisa"
    override val cumaSelami = "Ejjuma ey’emikisa"
    override val sahuraKalan = "Ekiseera ekisigadde ekya sahur"
    override val iftaraKalan = "Ekiseera ekisigadde okutuuka ku iftar"
}

// ÇEVİRİ: rw
// Kinyarwanda CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`, Tatarca emsali); Latin.
object TvDiliRw : TvDili {
    override val kod = "rw"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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

// ÇEVİRİ: rn
// Kirundi CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`, Tatarca emsali); Latin.
object TvDiliRn : TvDili {
    override val kod = "rn"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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

// ln
// CLDR ln: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Latin (ɛ ɔ). Ay ve gün adları CLDR'den (tonlu),
// JS `tarih.ts` ile aynı; sesli süre isim önce ("miniti 5").
object TvDiliLn : TvDili {
    override val kod = "ln"
    override fun vakitAdi(vakit: Vakit) = when (vakit) {
        Vakit.IMSAK -> "Fajr"
        Vakit.GUNES -> "Kobima ya moi"
        Vakit.OGLE -> "Dhuhr"
        Vakit.IKINDI -> "Asr"
        Vakit.AKSAM -> "Maghrib"
        Vakit.YATSI -> "Isha"
    }
    override val cuma = "Jumu'a"
    override val aylar = listOf(
        "sánzá ya yambo", "sánzá ya míbalé", "sánzá ya mísáto", "sánzá ya mínei", "sánzá ya mítáno", "sánzá ya motóbá",
        "sánzá ya nsambo", "sánzá ya mwambe", "sánzá ya libwa", "sánzá ya zómi", "sánzá ya zómi na mɔ̌kɔ́", "sánzá ya zómi na míbalé",
    )
    override val gunler = listOf("Mokɔlɔ mwa yambo", "Mokɔlɔ mwa míbalé", "Mokɔlɔ mwa mísáto", "Mokɔlɔ ya mínéi", "Mokɔlɔ ya mítáno", "Mpɔ́sɔ", "Eyenga")
    override fun tarih(gun: Int, ay: String, yil: Int, gunAdi: String) = "${gunAdi}, ${gun} ${ay} ${yil}"

    override val birimSa = "h"
    override val birimDk = "min"
    override val birimSn = "s"
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = if (n == 0 || n == 1) "ngonga ${n}" else "ngonga ${n}"
    override fun dakikaSesli(n: Int) = if (n == 0 || n == 1) "miniti ${n}" else "miniti ${n}"
    override val birDakikadanAz = "moke koleka miniti 1"

    override fun kerahatAdi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Kobima ya moi"
        Kerahat.Tur.ISTIVA -> "Moi na katikati"
        Kerahat.Tur.GURUB -> "Kolala ya moi"
    }

    override fun kerahatAciklamasi(tur: Kerahat.Tur) = when (tur) {
        Kerahat.Tur.SURUK -> "Kosambela ezali makruh tii moi ebimi malamu."
        Kerahat.Tur.ISTIVA -> "Kosambela ezali makruh ntango moi ezali na katikati ya likolo."
        Kerahat.Tur.GURUB -> "Kosambela ezali makruh ntango moi ezali kolala."
    }

    override fun bant(ad: String, dk: Long) = "Ntango ya ${ad} ezali kosila · min ${dk}"
    override val kabulDuasi = "Allah andimela bino"
    override val iftarSelami = "Iftar ya lipamboli"
    override val cumaSelami = "Jumu'a Mubarak"
    override val sahuraKalan = "Ntango etikali mpɔ na suhur"
    override val iftaraKalan = "Ntango etikali tii iftar"
}

// ÇEVİRİ: dag
// Dagbani CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`); Latin (ɛ ɔ ŋ ɣ ʒ); Android `values-b+dag`.
object TvDiliDag : TvDili {
    override val kod = "dag"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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

// ÇEVİRİ: mos
// Mooré CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`); Latin (ɛ ɩ ʋ, burun ünlüsü ~); Android `values-b+mos`.
object TvDiliMos : TvDili {
    override val kod = "mos"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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

// ÇEVİRİ: aa
// Afar CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`); Latin.
object TvDiliAa : TvDili {
    override val kod = "aa"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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

// ÇEVİRİ: mdh
// Maguindanao CLDR çoğul tablosunda yok → ICU kökü: yalnız other (JS `cogul.ts > hepDiger`); Latin; Android `values-b+mdh`.
object TvDiliMdh : TvDili {
    override val kod = "mdh"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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

// ÇEVİRİ: ak
// CLDR ak: one = 0 ve 1, other (JS `cogul.ts > sifirBir`); Latin (ɛ ɔ).
object TvDiliAk : TvDili {
    override val kod = "ak"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
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

// ÇEVİRİ: ceb
// CLDR ceb: Filipince kuralı (son hanesi 4, 6, 9 OLMAYAN tekil; JS `cogul.ts > filipince`); Latin; Android `values-b+ceb`.
object TvDiliCeb : TvDili {
    override val kod = "ceb"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    /** CLDR ceb (JS `cogul.ts > filipince`; tam sayı). */
    fun cogulKategorisi(n: Int): String {
        val s10 = n % 10
        return if (s10 == 4 || s10 == 6 || s10 == 9) "other" else "one"
    }

    override fun saatSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n hour"
        else -> "$n hours"
    }
    override fun dakikaSesli(n: Int) = when (cogulKategorisi(n)) {
        "one" -> "$n minute"
        else -> "$n minutes"
    }
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

// ÇEVİRİ: nqo
// CLDR nqo: yalnız other (JS `cogul.ts > hepDiger`); N'Ko harfli, SAĞDAN SOLA, yerel rakam `nkoo` (U+07C0–07C9); Android `values-b+nqo`.
object TvDiliNqo : TvDili {
    override val kod = "nqo"
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
    override val birimAyirici = " "
    override val parcaAyirici = " "
    override fun saatSesli(n: Int) = "$n hours"
    override fun dakikaSesli(n: Int) = "$n minutes"
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
