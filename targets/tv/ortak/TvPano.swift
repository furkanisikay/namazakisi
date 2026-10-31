import Foundation

// APPLE TV PANOSU — saf durum, kerahat, bicim (Android TV `cekirdek/{PanoDurumu,Kerahat,Bicim,
// Kaydirma,IlListesi}.kt` ikizi). Zaman ve saat dilimi ENJEKTE edilir; SwiftUI import ETMEZ.
// Kural degisirse iki dil BIRLIKTE degisir (testler: Kotlin `PanoDurumuTest`, Swift
// `targets/tv/test/main.swift`).

/// PANO DILI (W5, Android TV `TvDili.kt` ikizi): TV CIHAZIN dilini izler. Cekirdek dili
/// PARAMETRE alir (varsayilan "tr" — mevcut testler degismez); desteklenmeyen dil Turkceye
/// duser. Ingilizce karsiliklar telefonun JS sozlugunden (`sozluk/en`) ve Android TV ile
/// BIREBIR ayni.
public enum TvDili {
    public static let varsayilan = "tr"
    /// Tablo duzeni sirasiyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi).
    public static let desteklenenler = ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi"]

    /// "en", "en-US", "de_DE" → kok kod; desteklenmeyen → "tr". Eski Endonezce kodu "in" → "id".
    public static func coz(_ kod: String?) -> String {
        guard let kod, !kod.isEmpty else { return varsayilan }
        var dil = String(kod.split(whereSeparator: { $0 == "-" || $0 == "_" }).first ?? "")
        if dil == "in" { dil = "id" }
        return desteklenenler.contains(dil) ? dil : varsayilan
    }

    /// Cihazin ilk tercih ettigi dil (tvOS Ayarlar > Genel > Dil).
    public static var cihaz: String { coz(Locale.preferredLanguages.first) }

    /// `{anahtar}` yer tutucularini doldurur.
    public static func bicim(_ sablon: String, _ degerler: [String: String]) -> String {
        var sonuc = sablon
        for (anahtar, deger) in degerler { sonuc = sonuc.replacingOccurrences(of: "{\(anahtar)}", with: deger) }
        return sonuc
    }
}

/// Pano cekirdek metinleri — dil basina bir ornek (Android TV `TvDili.kt` nesneleri ikizi).
/// Anahtarlar `TvVakit` / `TvKerahat.Tur` ham degerleridir. Yer tutucular `{gun}`, `{ay}`,
/// `{yil}`, `{gunAdi}`. Duzen: sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi; cevrilmemis dil Ingilizce
/// kopya (`// ÇEVİRİ: <kod>`). Nobetci: `targets/tv/test/main.swift` §4c.
public struct TvPanoMetinleri: Equatable {
    public let vakitAdlari: [String: String]
    public let cuma: String
    /// Ocak..Aralik ve Pazartesi..Pazar (haftaGunu 1 = Pazartesi).
    public let aylar: [String]
    public let gunler: [String]
    public let tarih: String
    public let kerahatAdlari: [String: String]
    public let kerahatAciklamalari: [String: String]

    public static let tr = TvPanoMetinleri(
        vakitAdlari: ["imsak": "İmsak", "gunes": "Güneş", "ogle": "Öğle", "ikindi": "İkindi", "aksam": "Akşam", "yatsi": "Yatsı"],
        cuma: "Cuma",
        aylar: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
        gunler: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
        tarih: "{gun} {ay} {yil}, {gunAdi}",
        kerahatAdlari: ["suruk": "Güneş doğuşu", "istiva": "İstiva", "gurub": "Güneş batışı"],
        kerahatAciklamalari: [
            "suruk": "Güneş iyice yükselene kadar namaz kılınması mekruhtur.",
            "istiva": "Güneş tam tepedeyken namaz kılınması mekruhtur.",
            "gurub": "Güneş batarken namaz kılınması mekruhtur.",
        ]
    )

    public static let en = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sunrise", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Jumu'ah",
        aylar: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        gunler: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Sunrise", "istiva": "Zenith", "gurub": "Sunset"],
        kerahatAciklamalari: [
            "suruk": "Praying is makruh until the sun has risen well.",
            "istiva": "Praying is makruh while the sun is at its zenith.",
            "gurub": "Praying is makruh while the sun is setting.",
        ]
    )


    // id — Endonezce (beta); JS `sozluk/id` (vakit, tarih, anaEkran.kerahat)
    public static let id = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subuh", "gunes": "Terbit", "ogle": "Dzuhur", "ikindi": "Ashar", "aksam": "Maghrib", "yatsi": "Isya"],
        cuma: "Jumat",
        aylar: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
        gunler: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Matahari terbit", "istiva": "Istiwa", "gurub": "Matahari terbenam"],
        kerahatAciklamalari: [
            "suruk": "Menunaikan salat makruh hingga matahari naik cukup tinggi.",
            "istiva": "Menunaikan salat makruh saat matahari tepat di atas kepala.",
            "gurub": "Menunaikan salat makruh saat matahari terbenam.",
        ]
    )


    // de — Almanca (beta): Android TV `TvDiliDe` ikizi
    public static let de = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sonnenaufgang", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Freitagsgebet",
        aylar: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        gunler: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
        tarih: "{gunAdi}, {gun}. {ay} {yil}",
        kerahatAdlari: ["suruk": "Sonnenaufgang", "istiva": "Zenit", "gurub": "Sonnenuntergang"],
        kerahatAciklamalari: [
            "suruk": "Das Gebet ist makruh, bis die Sonne deutlich gestiegen ist.",
            "istiva": "Das Gebet ist makruh, solange die Sonne im Zenit steht.",
            "gurub": "Das Gebet ist makruh, während die Sonne untergeht.",
        ]
    )


    // fr
    public static let fr = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Lever du soleil", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Joumoua",
        aylar: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        gunler: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
        tarih: "{gunAdi} {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Lever du soleil", "istiva": "Zénith", "gurub": "Coucher du soleil"],
        kerahatAciklamalari: [
            "suruk": "Il est makrouh de prier tant que le soleil n’est pas bien levé.",
            "istiva": "Il est makrouh de prier quand le soleil est au zénith.",
            "gurub": "Il est makrouh de prier pendant le coucher du soleil.",
        ]
    )


    // bs
    public static let bs = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Zora", "gunes": "Izlazak sunca", "ogle": "Podne", "ikindi": "Ikindija", "aksam": "Akšam", "yatsi": "Jacija"],
        cuma: "Džuma",
        aylar: ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"],
        gunler: ["ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota", "nedjelja"],
        tarih: "{gunAdi}, {gun}. {ay} {yil}.",
        kerahatAdlari: ["suruk": "Izlazak sunca", "istiva": "Zenit", "gurub": "Zalazak sunca"],
        kerahatAciklamalari: [
            "suruk": "Klanjati je mekruh dok se sunce dobro ne podigne.",
            "istiva": "Klanjati je mekruh dok je sunce u zenitu.",
            "gurub": "Klanjati je mekruh dok sunce zalazi.",
        ]
    )


    // ru
    public static let ru = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Фаджр", "gunes": "Восход", "ogle": "Зухр", "ikindi": "Аср", "aksam": "Магриб", "yatsi": "Иша"],
        cuma: "Джума",
        aylar: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        gunler: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
        tarih: "{gunAdi}, {gun} {ay} {yil} г.",
        kerahatAdlari: ["suruk": "Восход солнца", "istiva": "Зенит", "gurub": "Закат"],
        kerahatAciklamalari: [
            "suruk": "Совершать намаз нежелательно (макрух), пока солнце не поднимется достаточно высоко.",
            "istiva": "Совершать намаз нежелательно (макрух), пока солнце в зените.",
            "gurub": "Совершать намаз нежелательно (макрух), пока солнце заходит.",
        ]
    )


    // ms
    public static let ms = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subuh", "gunes": "Syuruk", "ogle": "Zohor", "ikindi": "Asar", "aksam": "Maghrib", "yatsi": "Isyak"],
        cuma: "Jumaat",
        aylar: ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"],
        gunler: ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Syuruk", "istiva": "Istiwa", "gurub": "Ghurub"],
        kerahatAciklamalari: [
            "suruk": "Solat adalah makruh sehingga matahari naik tinggi.",
            "istiva": "Solat adalah makruh ketika matahari tepat di atas kepala.",
            "gurub": "Solat adalah makruh ketika matahari terbenam.",
        ]
    )


    // ar — Arapça (beta): Android TV `TvDiliAr` ile BIREBIR (JS `sozluk/ar`: vakit, tarih, anaEkran.kerahat)
    public static let ar = TvPanoMetinleri(
        vakitAdlari: ["imsak": "الفجر", "gunes": "الشروق", "ogle": "الظهر", "ikindi": "العصر", "aksam": "المغرب", "yatsi": "العشاء"],
        cuma: "الجمعة",
        aylar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
        gunler: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
        tarih: "{gunAdi}، {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "الشروق", "istiva": "الاستواء", "gurub": "الغروب"],
        kerahatAciklamalari: [
            "suruk": "تُكره الصلاة حتى ترتفع الشمس.",
            "istiva": "تُكره الصلاة والشمس في كبد السماء.",
            "gurub": "تُكره الصلاة والشمس تغرب.",
        ]
    )


    // ur
    public static let ur = TvPanoMetinleri(
        vakitAdlari: ["imsak": "فجر", "gunes": "طلوعِ آفتاب", "ogle": "ظہر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشاء"],
        cuma: "جمعہ",
        aylar: ["جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون", "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"],
        gunler: ["پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار"],
        tarih: "{gunAdi}، {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "طلوعِ آفتاب", "istiva": "زوال", "gurub": "غروبِ آفتاب"],
        kerahatAciklamalari: [
            "suruk": "سورج اچھی طرح بلند ہونے تک نماز پڑھنا مکروہ ہے۔",
            "istiva": "سورج عین سر پر ہو تو نماز پڑھنا مکروہ ہے۔",
            "gurub": "سورج غروب ہوتے وقت نماز پڑھنا مکروہ ہے۔",
        ]
    )

    // es — İspanyolca (beta): JS `sozluk/es` (vakit, tarih, anaEkran.kerahat); Android `TvDiliEs` ikizi
    public static let es = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Salida del sol", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Yumu’a",
        aylar: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        gunler: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
        tarih: "{gunAdi}, {gun} de {ay} de {yil}",
        kerahatAdlari: ["suruk": "Salida del sol", "istiva": "Cénit", "gurub": "Puesta del sol"],
        kerahatAciklamalari: [
            "suruk": "Es makruh rezar hasta que el sol haya subido bien.",
            "istiva": "Es makruh rezar cuando el sol está en el cénit.",
            "gurub": "Es makruh rezar durante la puesta del sol.",
        ]
    )

    // nl — Felemenkçe (beta): Android TV `TvDiliNl` ile BIREBIR (JS `sozluk/nl`: vakit, tarih, anaEkran.kerahat)
    public static let nl = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Zonsopkomst", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Djoemoe'a",
        aylar: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
        gunler: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
        tarih: "{gunAdi} {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Zonsopkomst", "istiva": "Zenit", "gurub": "Zonsondergang"],
        kerahatAciklamalari: [
            "suruk": "Bidden is makruh tot de zon goed is opgekomen.",
            "istiva": "Bidden is makruh terwijl de zon in het zenit staat.",
            "gurub": "Bidden is makruh terwijl de zon ondergaat.",
        ]
    )

    // sq — Arnavutça (beta): JS `sozluk/sq` (vakit, tarih, anaEkran.kerahat); Kotlin `TvDiliSq` ikizi
    public static let sq = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Sabahu", "gunes": "Lindja e Diellit", "ogle": "Dreka", "ikindi": "Ikindia", "aksam": "Akshami", "yatsi": "Jacia"],
        cuma: "Xhumaja",
        aylar: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
        gunler: ["E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë", "E diel"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Lindja e diellit", "istiva": "Zeniti", "gurub": "Perëndimi i diellit"],
        kerahatAciklamalari: [
            "suruk": "Është mekruh të falet namaz derisa dielli të ngrihet mirë.",
            "istiva": "Është mekruh të falet namaz kur dielli është në zenit.",
            "gurub": "Është mekruh të falet namaz kur dielli po perëndon.",
        ]
    )

    // hi — Hintçe (beta): JS `sozluk/hi` (vakit, tarih, anaEkran.kerahat)
    public static let hi = TvPanoMetinleri(
        vakitAdlari: ["imsak": "फ़ज्र", "gunes": "सूर्योदय", "ogle": "ज़ुहर", "ikindi": "अस्र", "aksam": "मग़रिब", "yatsi": "इशा"],
        cuma: "जुमा",
        aylar: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"],
        gunler: ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "सूर्योदय", "istiva": "ज़वाल", "gurub": "सूर्यास्त"],
        kerahatAciklamalari: [
            "suruk": "सूरज अच्छी तरह ऊपर आने तक नमाज़ पढ़ना मकरूह है।",
            "istiva": "सूरज ठीक सिर पर हो तो नमाज़ पढ़ना मकरूह है।",
            "gurub": "सूरज डूबते वक़्त नमाज़ पढ़ना मकरूह है।",
        ]
    )

    // bn — Bengalce (beta); JS `sozluk/bn` (vakit, tarih, anaEkran.kerahat), Android TV ile birebir
    public static let bn = TvPanoMetinleri(
        vakitAdlari: ["imsak": "ফজর", "gunes": "সূর্যোদয়", "ogle": "যোহর", "ikindi": "আসর", "aksam": "মাগরিব", "yatsi": "ইশা"],
        cuma: "জুমা",
        aylar: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
        gunler: ["সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "সূর্যোদয়", "istiva": "ঠিক দুপুর", "gurub": "সূর্যাস্ত"],
        kerahatAciklamalari: [
            "suruk": "সূর্য ভালোভাবে উঠে যাওয়া পর্যন্ত নামাজ পড়া মাকরূহ।",
            "istiva": "সূর্য ঠিক মাথার ওপরে থাকার সময় নামাজ পড়া মাকরূহ।",
            "gurub": "সূর্য অস্ত যাওয়ার সময় নামাজ পড়া মাকরূহ।",
        ]
    )

    // fa — Farsça (beta); JS `sozluk/fa` (vakit, tarih, anaEkran.kerahat), Android TV `TvDiliFa` ikizi
    public static let fa = TvPanoMetinleri(
        vakitAdlari: ["imsak": "صبح", "gunes": "طلوع آفتاب", "ogle": "ظهر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشا"],
        cuma: "جمعه",
        aylar: ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"],
        gunler: ["دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه"],
        tarih: "{gunAdi}، {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "طلوع آفتاب", "istiva": "زوال", "gurub": "غروب آفتاب"],
        kerahatAciklamalari: [
            "suruk": "تا وقتی آفتاب خوب بالا نیامده، نماز خواندن مکروه است.",
            "istiva": "وقتی آفتاب درست در میانهٔ آسمان است، نماز خواندن مکروه است.",
            "gurub": "هنگام غروب آفتاب، نماز خواندن مکروه است.",
        ]
    )

    // ps — Peştuca (beta): JS sozluk/ps (vakit, tarih, anaEkran.kerahat); gün/ay adları CLDR ps
    public static let ps = TvPanoMetinleri(
        vakitAdlari: ["imsak": "سهار", "gunes": "لمر ختل", "ogle": "ماسپښین", "ikindi": "مازدیګر", "aksam": "ماښام", "yatsi": "ماسخوتن"],
        cuma: "جمعه",
        aylar: ["جنوري", "فبروري", "مارچ", "اپریل", "مۍ", "جون", "جولای", "اګست", "سپتمبر", "اکتوبر", "نومبر", "دسمبر"],
        gunler: ["دونۍ", "درېنۍ", "څلرنۍ", "پينځنۍ", "جمعه", "اونۍ", "يونۍ"],
        tarih: "{gunAdi}، {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "شروق", "istiva": "استوا", "gurub": "غروب"],
        kerahatAciklamalari: [
            "suruk": "تر هغه چې لمر ښه پورته شي، لمونځ کول مکروه دي.",
            "istiva": "کله چې لمر د سر پر سر وي، لمونځ کول مکروه دي.",
            "gurub": "کله چې لمر لوېږي، لمونځ کول مکروه دي.",
        ]
    )

    // ckb
    public static let ckb = TvPanoMetinleri(
        vakitAdlari: ["imsak": "بەیانی", "gunes": "خۆرھەڵاتن", "ogle": "نیوەڕۆ", "ikindi": "عەسر", "aksam": "ئێوارە", "yatsi": "خەوتنان"],
        cuma: "ھەینی",
        aylar: ["کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران", "تەمووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"],
        gunler: ["دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "ھەینی", "شەممە", "یەکشەممە"],
        tarih: "{gunAdi}، {gun}ی {ay}ی {yil}",
        kerahatAdlari: ["suruk": "خۆرھەڵاتن", "istiva": "ناوەڕاستی ئاسمان", "gurub": "خۆرئاوابوون"],
        kerahatAciklamalari: [
            "suruk": "نوێژکردن مەکروھە تا خۆر باش بەرز دەبێتەوە.",
            "istiva": "نوێژکردن مەکروھە تا خۆر لە ناوەڕاستی ئاسماندایە.",
            "gurub": "نوێژکردن مەکروھە تا خۆر ئاوا دەبێت.",
        ]
    )

    // ug — Uygurca (beta); JS `sozluk/ug` (vakit, tarih, anaEkran.kerahat), Android `TvDiliUg` ikizi
    public static let ug = TvPanoMetinleri(
        vakitAdlari: ["imsak": "بامدات", "gunes": "قۇياش چىقىش", "ogle": "پېشىن", "ikindi": "ئەسىر", "aksam": "شام", "yatsi": "خۇپتەن"],
        cuma: "جۈمە",
        aylar: ["يانۋار", "فېۋرال", "مارت", "ئاپرېل", "ماي", "ئىيۇن", "ئىيۇل", "ئاۋغۇست", "سېنتەبىر", "ئۆكتەبىر", "نويابىر", "دېكابىر"],
        gunler: ["دۈشەنبە", "سەيشەنبە", "چارشەنبە", "پەيشەنبە", "جۈمە", "شەنبە", "يەكشەنبە"],
        tarih: "{yil}-يىلى {gun}-{ay}، {gunAdi}",
        kerahatAdlari: ["suruk": "قۇياش چىقىش", "istiva": "ئىستىۋا", "gurub": "قۇياش پېتىش"],
        kerahatAciklamalari: [
            "suruk": "قۇياش ياخشى كۆتۈرۈلگۈچە ناماز ئوقۇش مەكرۇھ.",
            "istiva": "قۇياش دەل چوققىدا تۇرغاندا ناماز ئوقۇش مەكرۇھ.",
            "gurub": "قۇياش پېتىۋاتقاندا ناماز ئوقۇش مەكرۇھ.",
        ]
    )

    // az — Azerice (beta); JS `sozluk/az` (vakit, tarih, anaEkran.kerahat); ay/gün adları CLDR kimi küçük harf
    public static let az = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Sübh", "gunes": "Günəş", "ogle": "Zöhr", "ikindi": "Əsr", "aksam": "Məğrib", "yatsi": "İşa"],
        cuma: "Cümə",
        aylar: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
        gunler: ["bazar ertəsi", "çərşənbə axşamı", "çərşənbə", "cümə axşamı", "cümə", "şənbə", "bazar"],
        tarih: "{gun} {ay} {yil}, {gunAdi}",
        kerahatAdlari: ["suruk": "Günəşin çıxması", "istiva": "İstiva", "gurub": "Günəşin batması"],
        kerahatAciklamalari: [
            "suruk": "Günəş yaxşıca qalxana qədər namaz qılmaq məkruhdur.",
            "istiva": "Günəş zenitdə olanda namaz qılmaq məkruhdur.",
            "gurub": "Günəş batarkən namaz qılmaq məkruhdur.",
        ]
    )

    // uz — Özbekçe (beta, LATİN): JS `sozluk/uz` (vakit, tarih, anaEkran.kerahat); Android `TvDiliUz` ile aynı
    public static let uz = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Bomdod", "gunes": "Quyosh", "ogle": "Peshin", "ikindi": "Asr", "aksam": "Shom", "yatsi": "Xufton"],
        cuma: "Juma",
        aylar: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
        gunler: ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"],
        tarih: "{gunAdi}, {yil} yil {gun} {ay}",
        kerahatAdlari: ["suruk": "Quyosh chiqishi", "istiva": "Istivo", "gurub": "Quyosh botishi"],
        kerahatAciklamalari: [
            "suruk": "Quyosh yaxshi koʻtarilguncha namoz oʻqish makruh.",
            "istiva": "Quyosh osmon oʻrtasida turganda namoz oʻqish makruh.",
            "gurub": "Quyosh botayotganda namoz oʻqish makruh.",
        ]
    )

    // kk — Kazakca (beta, Kiril): Android TV `TvDiliKk` ikizi; tarih CLDR kk uzun bicimi
    public static let kk = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Таң", "gunes": "Күн", "ogle": "Бесін", "ikindi": "Екінті", "aksam": "Ақшам", "yatsi": "Құптан"],
        cuma: "Жұма",
        aylar: ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"],
        gunler: ["дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі", "жексенбі"],
        tarih: "{yil} ж. {gun} {ay}, {gunAdi}",
        kerahatAdlari: ["suruk": "Күн шығуы", "istiva": "Истиуа", "gurub": "Күн батуы"],
        kerahatAciklamalari: [
            "suruk": "Күн әбден көтерілгенше намаз оқу мәкрүһ.",
            "istiva": "Күн дәл төбеде тұрғанда намаз оқу мәкрүһ.",
            "gurub": "Күн батып бара жатқанда намаз оқу мәкрүһ.",
        ]
    )

    // ky
    public static let ky = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Багымдат", "gunes": "Күн чыгыш", "ogle": "Бешим", "ikindi": "Аср", "aksam": "Шам", "yatsi": "Куптан"],
        cuma: "Жума",
        aylar: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
        gunler: ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби", "Жекшемби"],
        tarih: "{gunAdi}, {yil}-ж., {gun}-{ay}",
        kerahatAdlari: ["suruk": "Күн чыгыш", "istiva": "Зенит", "gurub": "Күн батыш"],
        kerahatAciklamalari: [
            "suruk": "Күн жакшылап көтөрүлгөнчө намаз окуу макрух.",
            "istiva": "Күн зенитте турганда намаз окуу макрух.",
            "gurub": "Күн батып жатканда намаз окуу макрух.",
        ]
    )

    // tg — Tacikçe (beta); JS `sozluk/tg` (vakit, tarih, anaEkran.kerahat), Android TV `TvDiliTg` ikizi
    public static let tg = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Бомдод", "gunes": "Тулӯъ", "ogle": "Пешин", "ikindi": "Аср", "aksam": "Шом", "yatsi": "Хуфтан"],
        cuma: "Ҷумъа",
        aylar: ["январ", "феврал", "март", "апрел", "май", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"],
        gunler: ["Душанбе", "Сешанбе", "Чоршанбе", "Панҷшанбе", "Ҷумъа", "Шанбе", "Якшанбе"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Тулӯи офтоб", "istiva": "Истиво", "gurub": "Ғуруби офтоб"],
        kerahatAciklamalari: [
            "suruk": "То хуб баланд шудани офтоб намоз хондан макрӯҳ аст.",
            "istiva": "Вақте ки офтоб дар авҷи осмон аст, намоз хондан макрӯҳ аст.",
            "gurub": "Ҳангоми ғуруби офтоб намоз хондан макрӯҳ аст.",
        ]
    )

    // sw
    public static let sw = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Alfajiri", "gunes": "Macheo", "ogle": "Adhuhuri", "ikindi": "Alasiri", "aksam": "Magharibi", "yatsi": "Isha"],
        cuma: "Ijumaa",
        aylar: ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"],
        gunler: ["Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Macheo", "istiva": "Jua la utosi", "gurub": "Machweo"],
        kerahatAciklamalari: [
            "suruk": "Kuswali ni makruhu hadi jua lipande vizuri.",
            "istiva": "Kuswali ni makruhu jua likiwa katikati ya mbingu.",
            "gurub": "Kuswali ni makruhu jua likiwa linazama.",
        ]
    )

    // ha — Hausa (beta); JS `sozluk/ha` (vakit, tarih, anaEkran.kerahat), Android TV `TvDiliHa` ikizi
    public static let ha = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Asuba", "gunes": "Fitowar Rana", "ogle": "Azahar", "ikindi": "Laʼasar", "aksam": "Magariba", "yatsi": "Isha"],
        cuma: "Jumuʼa",
        aylar: ["Janairu", "Faburairu", "Maris", "Afirilu", "Mayu", "Yuni", "Yuli", "Agusta", "Satumba", "Oktoba", "Nuwamba", "Disamba"],
        gunler: ["Litinin", "Talata", "Laraba", "Alhamis", "Jummaʼa", "Asabar", "Lahadi"],
        tarih: "{gunAdi}, {gun} {ay}, {yil}",
        kerahatAdlari: ["suruk": "Fitowar rana", "istiva": "Tsakiyar rana", "gurub": "Faɗuwar rana"],
        kerahatAciklamalari: [
            "suruk": "Yin salla makaruhi ne har sai rana ta ɗaga sosai.",
            "istiva": "Yin salla makaruhi ne lokacin da rana take tsakiyar sama.",
            "gurub": "Yin salla makaruhi ne lokacin da rana take faɗuwa.",
        ]
    )

    // am — Amharca (beta); ay/gün adları CLDR `am`
    public static let am = TvPanoMetinleri(
        vakitAdlari: ["imsak": "ፈጅር", "gunes": "ፀሐይ መውጣት", "ogle": "ዙህር", "ikindi": "አስር", "aksam": "መግሪብ", "yatsi": "ኢሻ"],
        cuma: "ጁሙዓ",
        aylar: ["ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን", "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር"],
        gunler: ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሑድ"],
        tarih: "{gunAdi}፣ {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "ፀሐይ መውጣት", "istiva": "እኩለ ቀን", "gurub": "ፀሐይ መጥለቅ"],
        kerahatAciklamalari: [
            "suruk": "ፀሐይ በደንብ እስክትወጣ ድረስ መስገድ ክልክል ነው።",
            "istiva": "ፀሐይ በሰማዩ መሃል ላይ ሳለች መስገድ ክልክል ነው።",
            "gurub": "ፀሐይ እየጠለቀች ሳለ መስገድ ክልክል ነው።",
        ]
    )

    // om
    public static let om = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subhii", "gunes": "Baha aduu", "ogle": "Zuhrii", "ikindi": "Asrii", "aksam": "Maghriba", "yatsi": "Ishaa'ii"],
        cuma: "Jimaata",
        aylar: ["Amajjii", "Guraandhala", "Bitootessa", "Eebila", "Caamsaa", "Waxabajjii", "Adoolessa", "Hagayya", "Fulbaana", "Onkoloolessa", "Sadaasa", "Muddee"],
        gunler: ["Wiixata", "Kibxata", "Roobii", "Kamisa", "Jimaata", "Sanbata", "Dilbata"],
        tarih: "{gunAdi}, {ay} {gun}, {yil}",
        kerahatAdlari: ["suruk": "Baha aduu", "istiva": "Aduu gubbaa gidduu", "gurub": "Lixa aduu"],
        kerahatAciklamalari: [
            "suruk": "Hanga aduun sirriitti baatutti salaatuun jibbamaa dha.",
            "istiva": "Yeroo aduun gubbaa gidduu irra jirtu salaatuun jibbamaa dha.",
            "gurub": "Yeroo aduun lixaa jirtu salaatuun jibbamaa dha.",
        ]
    )

    // so
    public static let so = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subax", "gunes": "Qorrax soo bax", "ogle": "Duhur", "ikindi": "Casar", "aksam": "Maghrib", "yatsi": "Cishe"],
        cuma: "Jimce",
        aylar: ["Jannaayo", "Febraayo", "Maarso", "Abriil", "Maayo", "Juun", "Luulyo", "Ogosto", "Sebteembar", "Oktoobar", "Noofeembar", "Diseembar"],
        gunler: ["Isniin", "Talaado", "Arbaco", "Khamiis", "Jimce", "Sabti", "Axad"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Qorrax soo bax", "istiva": "Bartamaha samada", "gurub": "Qorrax dhac"],
        kerahatAciklamalari: [
            "suruk": "Tukashadu waa makruuh ilaa qorraxdu si fiican u soo baxdo.",
            "istiva": "Tukashadu waa makruuh inta qorraxdu joogto bartamaha samada.",
            "gurub": "Tukashadu waa makruuh inta qorraxdu dhacayso.",
        ]
    )

    // ff
    public static let ff = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subaka", "gunes": "Puɗal naange", "ogle": "Fanaa", "ikindi": "Alansaraa", "aksam": "Futuroo", "yatsi": "Geeƴe"],
        cuma: "Juma",
        aylar: ["sanwiye", "feeburuyee", "maarasi", "awril", "mee", "juwen", "suwiye", "ut", "settaambur", "ottoombur", "nofambar", "deesaambur"],
        gunler: ["Altine", "Talaata", "Alarba", "Alkamisa", "Aljuma", "Asewe", "Alati"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Puɗal naange", "istiva": "Hakkunde ñalawma", "gurub": "Mutal naange"],
        kerahatAciklamalari: [
            "suruk": "Juulude ko makruuhu haa naange toowa no feewi.",
            "istiva": "Juulude ko makruuhu tuma naange hino hakkunde asamaan.",
            "gurub": "Juulude ko makruuhu tuma naange hino mutta.",
        ]
    )

    // yo
    public static let yo = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Subh", "gunes": "Yíyọ òòrùn", "ogle": "Ṭḥuhr", "ikindi": "‘Asr", "aksam": "Mọgrib", "yatsi": "‘Iṣā’"],
        cuma: "Jum‘ah",
        aylar: ["Oṣù Ṣẹ́rẹ́", "Oṣù Èrèlè", "Oṣù Ẹrẹ̀nà", "Oṣù Ìgbé", "Oṣù Ẹ̀bibi", "Oṣù Òkúdu", "Oṣù Agẹmọ", "Oṣù Ògún", "Oṣù Owewe", "Oṣù Ọ̀wàrà", "Oṣù Bélú", "Oṣù Ọ̀pẹ̀"],
        gunler: ["Ọjọ́ Ajé", "Ọjọ́ Ìsẹ́gun", "Ọjọ́rú", "Ọjọ́bọ", "Ọjọ́ Ẹtì", "Ọjọ́ Àbámẹ́ta", "Ọjọ́ Àìkú"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Yíyọ òòrùn", "istiva": "Òòrùn ní àárín", "gurub": "Wíwọ̀ òòrùn"],
        kerahatAciklamalari: [
            "suruk": "Kíkí ìrun jẹ́ makrūh títí òòrùn yóò fi yọ dáadáa.",
            "istiva": "Kíkí ìrun jẹ́ makrūh nígbà tí òòrùn bá wà ní àárín gbùngbùn ojú ọ̀run.",
            "gurub": "Kíkí ìrun jẹ́ makrūh nígbà tí òòrùn bá ń wọ̀.",
        ]
    )

    // zh
    public static let zh = TvPanoMetinleri(
        vakitAdlari: ["imsak": "晨礼", "gunes": "日出", "ogle": "晌礼", "ikindi": "晡礼", "aksam": "昏礼", "yatsi": "宵礼"],
        cuma: "主麻",
        aylar: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        gunler: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
        tarih: "{yil}年{ay}{gun}日 {gunAdi}",
        kerahatAdlari: ["suruk": "日出", "istiva": "正午", "gurub": "日落"],
        kerahatAciklamalari: [
            "suruk": "太阳完全升起之前，礼拜属可憎（Makruh）。",
            "istiva": "太阳正当中天时，礼拜属可憎（Makruh）。",
            "gurub": "太阳落下时，礼拜属可憎（Makruh）。",
        ]
    )

    // ÇEVİRİ: ta
    public static let ta = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sunrise", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Jumu'ah",
        aylar: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        gunler: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Sunrise", "istiva": "Zenith", "gurub": "Sunset"],
        kerahatAciklamalari: [
            "suruk": "Praying is makruh until the sun has risen well.",
            "istiva": "Praying is makruh while the sun is at its zenith.",
            "gurub": "Praying is makruh while the sun is setting.",
        ]
    )

    // ml — Malayalamca (beta): JS `sozluk/ml` (vakit, tarih, anaEkran.kerahat); tarih CLDR sırası
    public static let ml = TvPanoMetinleri(
        vakitAdlari: ["imsak": "സുബ്‌ഹ്", "gunes": "സൂര്യോദയം", "ogle": "ളുഹർ", "ikindi": "അസ്ർ", "aksam": "മഗ്‌രിബ്", "yatsi": "ഇശാ"],
        cuma: "ജുമുഅ",
        aylar: ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്‌ടോബർ", "നവംബർ", "ഡിസംബർ"],
        gunler: ["തിങ്കളാഴ്‌ച", "ചൊവ്വാഴ്‌ച", "ബുധനാഴ്‌ച", "വ്യാഴാഴ്‌ച", "വെള്ളിയാഴ്‌ച", "ശനിയാഴ്‌ച", "ഞായറാഴ്‌ച"],
        tarih: "{yil}, {ay} {gun}, {gunAdi}",
        kerahatAdlari: ["suruk": "സൂര്യോദയം", "istiva": "നട്ടുച്ച", "gurub": "സൂര്യാസ്തമയം"],
        kerahatAciklamalari: [
            "suruk": "സൂര്യൻ നന്നായി ഉദിക്കുന്നതുവരെ നമസ്കരിക്കുന്നത് കറാഹത്താണ്.",
            "istiva": "സൂര്യൻ നട്ടുച്ചയിലായിരിക്കുമ്പോൾ നമസ്കരിക്കുന്നത് കറാഹത്താണ്.",
            "gurub": "സൂര്യൻ അസ്തമിക്കുമ്പോൾ നമസ്കരിക്കുന്നത് കറാഹത്താണ്.",
        ]
    )

    // th
    public static let th = TvPanoMetinleri(
        vakitAdlari: ["imsak": "ซุบฮ์", "gunes": "ซูรูก", "ogle": "ดุฮ์ริ", "ikindi": "อัสร์", "aksam": "มักริบ", "yatsi": "อีซา"],
        cuma: "ญุมอัต",
        aylar: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
        gunler: ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"],
        tarih: "{gunAdi}ที่ {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "ดวงอาทิตย์ขึ้น", "istiva": "ดวงอาทิตย์ตรงศีรษะ", "gurub": "ดวงอาทิตย์ตก"],
        kerahatAciklamalari: [
            "suruk": "การละหมาดเป็นสิ่งที่มักรูฮ์จนกว่าดวงอาทิตย์จะขึ้นสูงพอ",
            "istiva": "การละหมาดเป็นสิ่งที่มักรูฮ์ขณะที่ดวงอาทิตย์อยู่ตรงศีรษะ",
            "gurub": "การละหมาดเป็นสิ่งที่มักรูฮ์ขณะที่ดวงอาทิตย์กำลังตก",
        ]
    )

    // ÇEVİRİ: ko
    public static let ko = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sunrise", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Jumu'ah",
        aylar: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        gunler: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Sunrise", "istiva": "Zenith", "gurub": "Sunset"],
        kerahatAciklamalari: [
            "suruk": "Praying is makruh until the sun has risen well.",
            "istiva": "Praying is makruh while the sun is at its zenith.",
            "gurub": "Praying is makruh while the sun is setting.",
        ]
    )

    // ÇEVİRİ: vi
    public static let vi = TvPanoMetinleri(
        vakitAdlari: ["imsak": "Fajr", "gunes": "Sunrise", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        cuma: "Jumu'ah",
        aylar: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        gunler: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        tarih: "{gunAdi}, {gun} {ay} {yil}",
        kerahatAdlari: ["suruk": "Sunrise", "istiva": "Zenith", "gurub": "Sunset"],
        kerahatAciklamalari: [
            "suruk": "Praying is makruh until the sun has risen well.",
            "istiva": "Praying is makruh while the sun is at its zenith.",
            "gurub": "Praying is makruh while the sun is setting.",
        ]
    )

    public static let tablo: [String: TvPanoMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
        "zh": zh, "ta": ta, "ml": ml, "th": th, "ko": ko, "vi": vi,
    ]

    public static func dil(_ kod: String?) -> TvPanoMetinleri { tablo[TvDili.coz(kod)] ?? tr }
}

public extension TvVakit {
    /// `dil`deki gorunen ad; `ad` Turkcedir.
    func ad(_ dil: String) -> String {
        TvPanoMetinleri.dil(dil).vakitAdlari[rawValue] ?? ad
    }
}

/// Saat dilimine gore yerel takvim gunu ve gun ici saat/dakika/saniye.
public enum TvZaman {
    static func ofsetMs(_ ms: Int64, _ bolge: TimeZone) -> Int64 {
        Int64(bolge.secondsFromGMT(for: Date(timeIntervalSince1970: Double(ms) / 1000))) * 1000
    }

    static func yerelMs(_ ms: Int64, _ bolge: TimeZone) -> Int64 { ms + ofsetMs(ms, bolge) }

    static func bolBas(_ a: Int64, _ b: Int64) -> Int64 {
        let q = a / b
        return (a % b != 0 && (a < 0) != (b < 0)) ? q - 1 : q
    }

    public static func tarih(_ ms: Int64, _ bolge: TimeZone) -> TvTarih {
        TvTarih.gunSayisindan(bolBas(yerelMs(ms, bolge), 86_400_000))
    }

    /// Gun icindeki saniye (0..86399).
    static func gunIciSaniye(_ ms: Int64, _ bolge: TimeZone) -> Int {
        let y = yerelMs(ms, bolge)
        return Int((y - bolBas(y, 86_400_000) * 86_400_000) / 1000)
    }
}

/// Kerahat (mekruh) vakitleri — telefonun kaza ekraniyla AYNI pratik tanim
/// (`KAZA_SABITLERI.MEKRUH_TOLERANS_DK` 20, `ISTIVA_TOLERANS_DK` 5). Sinirlar IKI UCTA da dahil.
public enum TvKerahat {
    public static let surukDk: Int64 = 20
    public static let istivaDk: Int64 = 5
    public static let gurubDk: Int64 = 20
    static let dk: Int64 = 60_000

    public enum Tur: String {
        case suruk, istiva, gurub

        public var ad: String {
            switch self {
            case .suruk: return "Güneş doğuşu"
            case .istiva: return "İstiva"
            case .gurub: return "Güneş batışı"
            }
        }

        public var aciklama: String {
            switch self {
            case .suruk: return "Güneş iyice yükselene kadar namaz kılınması mekruhtur."
            case .istiva: return "Güneş tam tepedeyken namaz kılınması mekruhtur."
            case .gurub: return "Güneş batarken namaz kılınması mekruhtur."
            }
        }

        /// `dil`deki ad / aciklama (`ad`/`aciklama` Turkcedir).
        public func ad(_ dil: String) -> String {
            TvPanoMetinleri.dil(dil).kerahatAdlari[rawValue] ?? ad
        }

        public func aciklama(_ dil: String) -> String {
            TvPanoMetinleri.dil(dil).kerahatAciklamalari[rawValue] ?? aciklama
        }
    }

    public struct Pencere: Equatable {
        public let tur: Tur
        public let baslangic: Int64
        public let bitis: Int64
        public func icindeMi(_ simdi: Int64) -> Bool { simdi >= baslangic && simdi <= bitis }
    }

    public static func pencereler(_ v: TvGunlukVakitler) -> [Pencere] {
        [
            Pencere(tur: .suruk, baslangic: v.gunes, bitis: v.gunes + surukDk * dk),
            Pencere(tur: .istiva, baslangic: v.ogle - istivaDk * dk, bitis: v.ogle),
            Pencere(tur: .gurub, baslangic: v.aksam - gurubDk * dk, bitis: v.aksam),
        ]
    }

    public static func aktif(_ v: TvGunlukVakitler, _ simdi: Int64) -> Pencere? {
        pencereler(v).first { $0.icindeMi(simdi) }
    }

    public static func siradaki(_ v: TvGunlukVakitler, _ simdi: Int64) -> Pencere? {
        pencereler(v).first { $0.baslangic > simdi }
    }
}

/// Panonun bir andaki hâli. Gece yarisindan sonra imsak girene dek gosterilen gun DUNDUR
/// (telefonun "aktif gun = dun" kurali); siradaki o an BUGUNUN imsakidir.
public struct TvPanoDurumu: Equatable {
    public let tarih: TvTarih
    public let vakitler: TvGunlukVakitler
    public let aktif: TvVakit
    public let siradaki: TvVakit
    public let siradakiMs: Int64
    public let kalanMs: Int64
    public let cuma: Bool
    public let kerahat: TvKerahat.Pencere?
    public let siradakiKerahat: TvKerahat.Pencere?

    /// Cuma gunu ogle satiri "Cuma" diye okunur (salt gorunum).
    public func gorunenAd(_ v: TvVakit, dil: String = TvDili.varsayilan) -> String {
        if cuma && v == .ogle { return TvPanoMetinleri.dil(dil).cuma }
        return v.ad(dil)
    }
}

public enum TvPanoHesabi {
    public static func hesapla(
        simdiMs: Int64,
        bolge: TimeZone,
        vakitler: (TvTarih) -> TvGunlukVakitler
    ) -> TvPanoDurumu {
        let bugun = TvZaman.tarih(simdiMs, bolge)
        let v = vakitler(bugun)

        if simdiMs < v.imsak {
            let dun = bugun.gunEkle(-1)
            return TvPanoDurumu(
                tarih: dun,
                vakitler: vakitler(dun),
                aktif: .yatsi,
                siradaki: .imsak,
                siradakiMs: v.imsak,
                kalanMs: max(0, v.imsak - simdiMs),
                cuma: dun.haftaGunu == 5,
                kerahat: TvKerahat.aktif(v, simdiMs),
                siradakiKerahat: TvKerahat.siradaki(v, simdiMs)
            )
        }

        let sirali = TvVakit.allCases.map { ($0, v.saat($0)) }
        let aktif = sirali.last { $0.1 <= simdiMs }?.0 ?? .yatsi
        let sonraki = sirali.first { $0.1 > simdiMs }
        let siradaki = sonraki?.0 ?? .imsak
        let siradakiMs = sonraki?.1 ?? vakitler(bugun.gunEkle(1)).imsak
        return TvPanoDurumu(
            tarih: bugun,
            vakitler: v,
            aktif: aktif,
            siradaki: siradaki,
            siradakiMs: siradakiMs,
            kalanMs: max(0, siradakiMs - simdiMs),
            cuma: bugun.haftaGunu == 5,
            kerahat: TvKerahat.aktif(v, simdiMs),
            siradakiKerahat: TvKerahat.siradaki(v, simdiMs)
        )
    }
}

/// Metin bicimleri. Ay/gun adlari sabit tablodan (cihazin `Locale`'ine/ICU'ya bagli degil);
/// dil PARAMETREDIR (varsayilan Turkce), pano cihaz dilini verir (`TvDili.cihaz`).
public enum TvBicim {
    static func iki(_ n: Int) -> String { n < 10 ? "0\(n)" : "\(n)" }

    /// "05:42"
    public static func saat(_ ms: Int64, _ bolge: TimeZone) -> String {
        let s = TvZaman.gunIciSaniye(ms, bolge)
        return "\(iki(s / 3600)):\(iki((s % 3600) / 60))"
    }

    /// "07"
    public static func saniye(_ ms: Int64, _ bolge: TimeZone) -> String {
        iki(TvZaman.gunIciSaniye(ms, bolge) % 60)
    }

    /// "13 Ekim 2026, Salı" / "Tuesday, 13 October 2026"
    public static func tarih(_ g: TvTarih, dil: String = TvDili.varsayilan) -> String {
        let m = TvPanoMetinleri.dil(dil)
        return TvDili.bicim(m.tarih, [
            "gun": String(g.gun), "ay": m.aylar[g.ay - 1], "yil": String(g.yil), "gunAdi": m.gunler[g.haftaGunu - 1],
        ])
    }

    /// "2:05:09" ya da "05:09"; saniye ASAGI yuvarlanir.
    public static func geriSayim(_ kalanMs: Int64) -> String {
        let toplam = Int(max(0, kalanMs) / 1000)
        let sa = toplam / 3600
        let dk = (toplam % 3600) / 60
        let sn = toplam % 60
        return sa > 0 ? "\(sa):\(iki(dk)):\(iki(sn))" : "\(iki(dk)):\(iki(sn))"
    }
}

/// Ekran yanigi korumasi: icerik dakikada bir birkac noktaya kaydirilir (Android `Kaydirma` ikizi).
public enum TvKaydirma {
    static let adimlar: [(Int, Int)] = [(0, 0), (6, 0), (6, 6), (0, 6), (-6, 6), (-6, 0), (-6, -6), (0, -6)]

    public static func ofset(_ simdiMs: Int64) -> (Int, Int) {
        let dakika = TvZaman.bolBas(simdiMs, 60_000)
        var i = Int(dakika % Int64(adimlar.count))
        if i < 0 { i += adimlar.count }
        return adimlar[i]
    }
}

/// Telefonun manuel konum listesindeki bir il (`iller.json`, `TURKIYE_ILLERI_OFFLINE`'dan uretilir).
public struct TvIl: Codable, Equatable, Identifiable {
    public let plaka: String
    public let ad: String
    public let lat: Double
    public let lng: Double
    public var id: String { plaka }
}

public enum TvIlListesi {
    public static func coz(_ veri: Data) -> [TvIl] {
        (try? JSONDecoder().decode([TvIl].self, from: veri)) ?? []
    }

    public static func bul(_ iller: [TvIl], _ plaka: String?) -> TvIl? {
        guard let plaka else { return nil }
        return iller.first { $0.plaka == plaka }
    }
}
