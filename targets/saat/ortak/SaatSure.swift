import Foundation

/**
 * Geri sayimin GORUNEN bicimi — birimli parcalar (Apple Watch, #363 ile ayni dil).
 * JS `src/core/utils/kalanSureParcalari.ts`, Wear `AnaEkranKarari.sayac`, TV
 * `Bicim.kalanParcalari` ikizi — SAF (yalniz Foundation):
 *  - bir saat ve ustu: "1 sa 9 dk" (saniye yok)
 *  - bir saatin alti:  "9 dk 05 sn" (saniye iki haneli → satir oynamaz)
 *  - bir dakikanin alti: "42 sn"
 * Sonuk (her zaman acik) ekranda saniye yazilmaz: "9 dk" (ekran dakikada bir tazelenir).
 */
public struct SaatSureParcasi: Equatable {
    public let sayi: String
    public let birim: String

    public init(_ sayi: String, _ birim: String) {
        self.sayi = sayi
        self.birim = birim
    }
}

/// Sure metinleri — dil basina bir ornek (JS `sozluk/<dil>/sure.ts` ikizi: `kisa` birimleri ve
/// `saat/dakika/saniye` cogullari). Cogul kaliplari CLDR kategorisi ("one", "few", "many",
/// "other"; `CogulKurali`) → kalip, yer tutucu `{n}`; eksik kategori "other"a duser.
/// Duzen: sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo; cevrilmemis dil Ingilizce kopya
/// (`// ÇEVİRİ: <kod>`).
public struct SaatSureMetinleri: Equatable {
    public let birimSa: String
    public let birimDk: String
    public let birimSn: String
    public let saat: [String: String]
    public let dakika: [String: String]
    public let saniye: [String: String]
    /// Sayi ile kisa birim arasi ("5 dk"); bosluksuz yazan dil (Cince "5分钟") "" verir.
    /// JS `sure.birimli` kalibinin `{n}` ile `{birim}` arasi (nobetci `nativeSureAyiraclari.test.ts`).
    public var birimAyirici: String = " "
    /// Ardisik sure parcalari arasi ("1 sa 5 dk", "1 saat 5 dakika"); JS `sure.parcali`.
    public var parcaAyirici: String = " "

    public static let tr = SaatSureMetinleri(
        birimSa: "sa", birimDk: "dk", birimSn: "sn",
        saat: ["one": "{n} saat", "other": "{n} saat"],
        dakika: ["one": "{n} dakika", "other": "{n} dakika"],
        saniye: ["one": "{n} saniye", "other": "{n} saniye"]
    )

    public static let en = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hour", "other": "{n} hours"],
        dakika: ["one": "{n} minute", "other": "{n} minutes"],
        saniye: ["one": "{n} second", "other": "{n} seconds"]
    )


    // id — Endonezce (beta); CLDR yalniz "other" (JS `sozluk/id/sure.ts`)
    public static let id = SaatSureMetinleri(
        birimSa: "j", birimDk: "mnt", birimSn: "dtk",
        saat: ["other": "{n} jam"],
        dakika: ["other": "{n} menit"],
        saniye: ["other": "{n} detik"]
    )


    // de — Almanca (beta): JS `sozluk/de/sure.ts`
    public static let de = SaatSureMetinleri(
        birimSa: "Std.", birimDk: "Min.", birimSn: "Sek.",
        saat: ["one": "{n} Stunde", "other": "{n} Stunden"],
        dakika: ["one": "{n} Minute", "other": "{n} Minuten"],
        saniye: ["one": "{n} Sekunde", "other": "{n} Sekunden"]
    )


    // fr
    public static let fr = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} heure", "many": "{n} d’heures", "other": "{n} heures"],
        dakika: ["one": "{n} minute", "many": "{n} de minutes", "other": "{n} minutes"],
        saniye: ["one": "{n} seconde", "many": "{n} de secondes", "other": "{n} secondes"]
    )


    // bs
    public static let bs = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} sat", "few": "{n} sata", "other": "{n} sati"],
        dakika: ["one": "{n} minuta", "few": "{n} minute", "other": "{n} minuta"],
        saniye: ["one": "{n} sekunda", "few": "{n} sekunde", "other": "{n} sekundi"]
    )


    // ru
    public static let ru = SaatSureMetinleri(
        birimSa: "ч", birimDk: "мин", birimSn: "с",
        saat: ["one": "{n} час", "few": "{n} часа", "many": "{n} часов", "other": "{n} часа"],
        dakika: ["one": "{n} минута", "few": "{n} минуты", "many": "{n} минут", "other": "{n} минуты"],
        saniye: ["one": "{n} секунда", "few": "{n} секунды", "many": "{n} секунд", "other": "{n} секунды"]
    )


    // ms
    public static let ms = SaatSureMetinleri(
        birimSa: "j", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} jam", "other": "{n} jam"],
        dakika: ["one": "{n} minit", "other": "{n} minit"],
        saniye: ["one": "{n} saat", "other": "{n} saat"]
    )


    // ar — Arapça (beta): JS `sozluk/ar/sure.ts` birebir (3–10 çoğul, diğerleri rakamla tekil)
    public static let ar = SaatSureMetinleri(
        birimSa: "س", birimDk: "د", birimSn: "ث",
        saat: ["zero": "{n} ساعة", "one": "{n} ساعة", "two": "{n} ساعة", "few": "{n} ساعات", "many": "{n} ساعة", "other": "{n} ساعة"],
        dakika: ["zero": "{n} دقيقة", "one": "{n} دقيقة", "two": "{n} دقيقة", "few": "{n} دقائق", "many": "{n} دقيقة", "other": "{n} دقيقة"],
        saniye: ["zero": "{n} ثانية", "one": "{n} ثانية", "two": "{n} ثانية", "few": "{n} ثوانٍ", "many": "{n} ثانية", "other": "{n} ثانية"]
    )


    // ur
    public static let ur = SaatSureMetinleri(
        birimSa: "گھنٹے", birimDk: "منٹ", birimSn: "سیکنڈ",
        saat: ["one": "{n} گھنٹہ", "other": "{n} گھنٹے"],
        dakika: ["one": "{n} منٹ", "other": "{n} منٹ"],
        saniye: ["one": "{n} سیکنڈ", "other": "{n} سیکنڈ"]
    )

    // es — İspanyolca (beta): JS `sozluk/es/sure.ts` birebir (one = 1, many = milyonlar "{n} de …")
    public static let es = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hora", "other": "{n} horas", "many": "{n} de horas"],
        dakika: ["one": "{n} minuto", "other": "{n} minutos", "many": "{n} de minutos"],
        saniye: ["one": "{n} segundo", "other": "{n} segundos", "many": "{n} de segundos"]
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl/sure.ts`
    public static let nl = SaatSureMetinleri(
        birimSa: "u", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} uur", "other": "{n} uur"],
        dakika: ["one": "{n} minuut", "other": "{n} minuten"],
        saniye: ["one": "{n} seconde", "other": "{n} seconden"]
    )

    // sq — JS `sozluk/sq/sure.ts` (orë/min/sek; "orë" njëjës = shumës)
    public static let sq = SaatSureMetinleri(
        birimSa: "orë", birimDk: "min", birimSn: "sek",
        saat: ["one": "{n} orë", "other": "{n} orë"],
        dakika: ["one": "{n} minutë", "other": "{n} minuta"],
        saniye: ["one": "{n} sekondë", "other": "{n} sekonda"]
    )

    // hi — Hintçe (beta): JS `sozluk/hi/sure.ts` birebir (birim kısaltılmaz; one = 0 ve 1)
    public static let hi = SaatSureMetinleri(
        birimSa: "घंटे", birimDk: "मिनट", birimSn: "सेकंड",
        saat: ["one": "{n} घंटा", "other": "{n} घंटे"],
        dakika: ["one": "{n} मिनट", "other": "{n} मिनट"],
        saniye: ["one": "{n} सेकंड", "other": "{n} सेकंड"]
    )

    // bn — JS `sozluk/bn/sure.ts`; Bengalcede sayıdan sonra isim çekimlenmez (one = other).
    public static let bn = SaatSureMetinleri(
        birimSa: "ঘ", birimDk: "মি", birimSn: "সে",
        saat: ["one": "{n} ঘণ্টা", "other": "{n} ঘণ্টা"],
        dakika: ["one": "{n} মিনিট", "other": "{n} মিনিট"],
        saniye: ["one": "{n} সেকেন্ড", "other": "{n} সেকেন্ড"]
    )

    // fa — JS `sozluk/fa/sure.ts` birebir (birim kısaltılmaz; sayıdan sonra ad tekil, one = other)
    public static let fa = SaatSureMetinleri(
        birimSa: "ساعت", birimDk: "دقیقه", birimSn: "ثانیه",
        saat: ["one": "{n} ساعت", "other": "{n} ساعت"],
        dakika: ["one": "{n} دقیقه", "other": "{n} دقیقه"],
        saniye: ["one": "{n} ثانیه", "other": "{n} ثانیه"]
    )

    // ps — Peştuca (beta): JS `sozluk/ps/sure.ts` birebir (birim kısaltılmaz)
    public static let ps = SaatSureMetinleri(
        birimSa: "ساعته", birimDk: "دقیقې", birimSn: "ثانیې",
        saat: ["one": "{n} ساعت", "other": "{n} ساعته"],
        dakika: ["one": "{n} دقیقه", "other": "{n} دقیقې"],
        saniye: ["one": "{n} ثانیه", "other": "{n} ثانیې"]
    )

    // ckb — JS `sozluk/ckb/sure.ts`; Soranîde sayıdan sonra isim tekil (one = other).
    public static let ckb = SaatSureMetinleri(
        birimSa: "کاتژمێر", birimDk: "خولەک", birimSn: "چرکە",
        saat: ["one": "{n} کاتژمێر", "other": "{n} کاتژمێر"],
        dakika: ["one": "{n} خولەک", "other": "{n} خولەک"],
        saniye: ["one": "{n} چرکە", "other": "{n} چرکە"]
    )

    // ug — Uygurca (beta); JS `sozluk/ug/sure.ts` (sayıdan sonra çoğul eki yok)
    public static let ug = SaatSureMetinleri(
        birimSa: "سائەت", birimDk: "مىنۇت", birimSn: "سېكۇنت",
        saat: ["one": "{n} سائەت", "other": "{n} سائەت"],
        dakika: ["one": "{n} مىنۇت", "other": "{n} مىنۇت"],
        saniye: ["one": "{n} سېكۇنت", "other": "{n} سېكۇنت"]
    )

    // az — Azerice (beta); JS `sozluk/az/sure.ts` (sayıdan sonra isim tekil)
    public static let az = SaatSureMetinleri(
        birimSa: "saat", birimDk: "dəq", birimSn: "san",
        saat: ["one": "{n} saat", "other": "{n} saat"],
        dakika: ["one": "{n} dəqiqə", "other": "{n} dəqiqə"],
        saniye: ["one": "{n} saniyə", "other": "{n} saniyə"]
    )

    // uz — Özbekçe (beta, LATİN); JS `sozluk/uz/sure.ts` (sayıdan sonra çoğul eki yok)
    public static let uz = SaatSureMetinleri(
        birimSa: "soat", birimDk: "daq", birimSn: "s",
        saat: ["one": "{n} soat", "other": "{n} soat"],
        dakika: ["one": "{n} daqiqa", "other": "{n} daqiqa"],
        saniye: ["one": "{n} soniya", "other": "{n} soniya"]
    )

    // kk — Kazakca (beta, Kiril); JS `sozluk/kk/sure.ts`. Sayidan sonra isim cogul eki almaz.
    public static let kk = SaatSureMetinleri(
        birimSa: "сағ", birimDk: "мин", birimSn: "с",
        saat: ["one": "{n} сағат", "other": "{n} сағат"],
        dakika: ["one": "{n} минут", "other": "{n} минут"],
        saniye: ["one": "{n} секунд", "other": "{n} секунд"]
    )

    // ky
    public static let ky = SaatSureMetinleri(
        birimSa: "ст", birimDk: "мүн", birimSn: "сек",
        saat: ["one": "{n} саат", "other": "{n} саат"],
        dakika: ["one": "{n} мүнөт", "other": "{n} мүнөт"],
        saniye: ["one": "{n} секунд", "other": "{n} секунд"]
    )

    // tg — Tacikçe (beta): JS `sozluk/tg/sure.ts` birebir (kısa birim соат/дақ/сон; sayıdan sonra ad tekil, one = other)
    public static let tg = SaatSureMetinleri(
        birimSa: "соат", birimDk: "дақ", birimSn: "сон",
        saat: ["one": "{n} соат", "other": "{n} соат"],
        dakika: ["one": "{n} дақиқа", "other": "{n} дақиқа"],
        saniye: ["one": "{n} сония", "other": "{n} сония"]
    )

    // sw — Svahili (beta): JS `sozluk/sw/sure.ts` birebir (kısa birim saa/dk/s; ad sayıdan önce, one = other)
    public static let sw = SaatSureMetinleri(
        birimSa: "saa", birimDk: "dk", birimSn: "s",
        saat: ["one": "saa {n}", "other": "saa {n}"],
        dakika: ["one": "dakika {n}", "other": "dakika {n}"],
        saniye: ["one": "sekunde {n}", "other": "sekunde {n}"]
    )

    // ha — Hausa (beta): JS `sozluk/ha/sure.ts` birebir (kısa birim awa/min/daƙ; sayı addan sonra, ad çekilmez, one = other)
    public static let ha = SaatSureMetinleri(
        birimSa: "awa", birimDk: "min", birimSn: "daƙ",
        saat: ["one": "awa {n}", "other": "awa {n}"],
        dakika: ["one": "minti {n}", "other": "minti {n}"],
        saniye: ["one": "daƙiƙa {n}", "other": "daƙiƙa {n}"]
    )

    // am — Amharca (beta); sayıdan sonra ad tekil kalır (JS sure.ts), one = 0 ve 1
    public static let am = SaatSureMetinleri(
        birimSa: "ሰዓ", birimDk: "ደቂ", birimSn: "ሰከ",
        saat: ["one": "{n} ሰዓት", "other": "{n} ሰዓት"],
        dakika: ["one": "{n} ደቂቃ", "other": "{n} ደቂቃ"],
        saniye: ["one": "{n} ሰከንድ", "other": "{n} ሰከንድ"]
    )

    // om — JS `sozluk/om/sure.ts` birebir (rakamla yazılınca ad tekil, one = other)
    public static let om = SaatSureMetinleri(
        birimSa: "sa'a", birimDk: "daq", birimSn: "sek",
        saat: ["one": "{n} sa'aatii", "other": "{n} sa'aatii"],
        dakika: ["one": "{n} daqiiqaa", "other": "{n} daqiiqaa"],
        saniye: ["one": "{n} sekondii", "other": "{n} sekondii"]
    )

    // so
    public static let so = SaatSureMetinleri(
        birimSa: "s", birimDk: "daq", birimSn: "ilb",
        saat: ["one": "{n} saac", "other": "{n} saacadood"],
        dakika: ["one": "{n} daqiiqo", "other": "{n} daqiiqo"],
        saniye: ["one": "{n} ilbiriqsi", "other": "{n} ilbiriqsi"]
    )

    // ff
    public static let ff = SaatSureMetinleri(
        birimSa: "sa", birimDk: "hj", birimSn: "mj",
        saat: ["one": "{n} saa’i", "other": "{n} saa’iiji"],
        dakika: ["one": "{n} hojom", "other": "{n} hojomaaji"],
        saniye: ["one": "{n} majaango", "other": "{n} majaaɗe"]
    )

    // yo
    public static let yo = SaatSureMetinleri(
        birimSa: "wkt", birimDk: "ìṣj", birimSn: "ìṣ-àá",
        saat: ["one": "wákàtí {n}", "other": "wákàtí {n}"],
        dakika: ["one": "ìṣẹ́jú {n}", "other": "ìṣẹ́jú {n}"],
        saniye: ["one": "ìṣẹ́jú-àáyá {n}", "other": "ìṣẹ́jú-àáyá {n}"]
    )

    // zh
    // Bosluksuz yazilir ("5分钟", "1小时5分钟"; JS `sure.birimli` / `sure.parcali`).
    public static let zh = SaatSureMetinleri(
        birimSa: "小时", birimDk: "分钟", birimSn: "秒",
        saat: ["other": "{n}小时"],
        dakika: ["other": "{n}分钟"],
        saniye: ["other": "{n}秒"],
        birimAyirici: "", parcaAyirici: ""
    )

    // ta
    public static let ta = SaatSureMetinleri(
        birimSa: "மணி", birimDk: "நிமி", birimSn: "வி",
        saat: ["one": "{n} மணிநேரம்", "other": "{n} மணிநேரம்"],
        dakika: ["one": "{n} நிமிடம்", "other": "{n} நிமிடங்கள்"],
        saniye: ["one": "{n} வினாடி", "other": "{n} வினாடிகள்"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ml — JS `sozluk/ml/sure` (sayıdan sonra isim çekimlenmez, boşluklu)
    public static let ml = SaatSureMetinleri(
        birimSa: "മ", birimDk: "മി", birimSn: "സെ",
        saat: ["one": "{n} മണിക്കൂർ", "other": "{n} മണിക്കൂർ"],
        dakika: ["one": "{n} മിനിറ്റ്", "other": "{n} മിനിറ്റ്"],
        saniye: ["one": "{n} സെക്കൻഡ്", "other": "{n} സെക്കൻഡ്"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // th (CLDR yalnız other; "one" anahtarı aynı kalıp)
    public static let th = SaatSureMetinleri(
        birimSa: "ชม.", birimDk: "นาที", birimSn: "วิ",
        saat: ["one": "{n} ชั่วโมง", "other": "{n} ชั่วโมง"],
        dakika: ["one": "{n} นาที", "other": "{n} นาที"],
        saniye: ["one": "{n} วินาที", "other": "{n} วินาที"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ko (sayı–birim bitişik: "5분"; parçalar boşluklu: "1시간 5분"; CLDR yalnız other)
    public static let ko = SaatSureMetinleri(
        birimSa: "시간", birimDk: "분", birimSn: "초",
        saat: ["other": "{n}시간"],
        dakika: ["other": "{n}분"],
        saniye: ["other": "{n}초"],
        birimAyirici: "", parcaAyirici: " "
    )

    // vi (CLDR yalnız other; "one" anahtarı ms gibi aynı kalıpla dolu)
    public static let vi = SaatSureMetinleri(
        birimSa: "giờ", birimDk: "phút", birimSn: "giây",
        saat: ["one": "{n} giờ", "other": "{n} giờ"],
        dakika: ["one": "{n} phút", "other": "{n} phút"],
        saniye: ["one": "{n} giây", "other": "{n} giây"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // pt (one/many/other)
    public static let pt = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} hora", "many": "{n} de horas", "other": "{n} horas"],
        dakika: ["one": "{n} minuto", "many": "{n} de minutos", "other": "{n} minutos"],
        saniye: ["one": "{n} segundo", "many": "{n} de segundos", "other": "{n} segundos"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // it (one/many/other): JS `sozluk/it/sure.ts` birebir (many = milyonlar "{n} di …")
    public static let it = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} ora", "many": "{n} di ore", "other": "{n} ore"],
        dakika: ["one": "{n} minuto", "many": "{n} di minuti", "other": "{n} minuti"],
        saniye: ["one": "{n} secondo", "many": "{n} di secondi", "other": "{n} secondi"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // sv (one/other)
    public static let sv = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} timme", "other": "{n} timmar"],
        dakika: ["one": "{n} minut", "other": "{n} minuter"],
        saniye: ["one": "{n} sekund", "other": "{n} sekunder"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // uk (one/few/many/other)
    public static let uk = SaatSureMetinleri(
        birimSa: "год", birimDk: "хв", birimSn: "с",
        saat: ["one": "{n} година", "few": "{n} години", "many": "{n} годин", "other": "{n} години"],
        dakika: ["one": "{n} хвилина", "few": "{n} хвилини", "many": "{n} хвилин", "other": "{n} хвилини"],
        saniye: ["one": "{n} секунда", "few": "{n} секунди", "many": "{n} секунд", "other": "{n} секунди"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ro (one/few/other; other "de" ile: "25 de minute")
    public static let ro = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} oră", "few": "{n} ore", "other": "{n} de ore"],
        dakika: ["one": "{n} minut", "few": "{n} minute", "other": "{n} de minute"],
        saniye: ["one": "{n} secundă", "few": "{n} secunde", "other": "{n} de secunde"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // hr (one/few/other)
    public static let hr = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "{n} sat", "few": "{n} sata", "other": "{n} sati"],
        dakika: ["one": "{n} minuta", "few": "{n} minute", "other": "{n} minuta"],
        saniye: ["one": "{n} sekunda", "few": "{n} sekunde", "other": "{n} sekundi"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // sr (one/few/other)
    public static let sr = SaatSureMetinleri(
        birimSa: "ч", birimDk: "мин", birimSn: "с",
        saat: ["one": "{n} сат", "few": "{n} сата", "other": "{n} сати"],
        dakika: ["one": "{n} минут", "few": "{n} минута", "other": "{n} минута"],
        saniye: ["one": "{n} секунда", "few": "{n} секунде", "other": "{n} секунди"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // el (one/other)
    public static let el = SaatSureMetinleri(
        birimSa: "ώ.", birimDk: "λ.", birimSn: "δευτ.",
        saat: ["one": "{n} ώρα", "other": "{n} ώρες"],
        dakika: ["one": "{n} λεπτό", "other": "{n} λεπτά"],
        saniye: ["one": "{n} δευτερόλεπτο", "other": "{n} δευτερόλεπτα"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ku (one/other; sayıdan sonra ad tekil: "2 saet")
    public static let ku = SaatSureMetinleri(
        birimSa: "st", birimDk: "d", birimSn: "sn",
        saat: ["one": "{n} saet", "other": "{n} saet"],
        dakika: ["one": "{n} deqîqe", "other": "{n} deqîqe"],
        saniye: ["one": "{n} çirke", "other": "{n} çirke"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // tk (one/other; san bilen at ýeke sanda)
    public static let tk = SaatSureMetinleri(
        birimSa: "sag", birimDk: "min", birimSn: "sek",
        saat: ["one": "{n} sagat", "other": "{n} sagat"],
        dakika: ["one": "{n} minut", "other": "{n} minut"],
        saniye: ["one": "{n} sekunt", "other": "{n} sekunt"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // tt (other) — sayıdan sonra isim çoğul eki almaz.
    public static let tt = SaatSureMetinleri(
        birimSa: "сәг", birimDk: "мин", birimSn: "сек",
        saat: ["other": "{n} сәгать"],
        dakika: ["other": "{n} минут"],
        saniye: ["other": "{n} секунд"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // sd (one/other; Sindhçede süre birimi kısaltılmaz, iki kategori aynı biçim)
    public static let sd = SaatSureMetinleri(
        birimSa: "ڪلاڪ", birimDk: "منٽ", birimSn: "سيڪنڊ",
        saat: ["one": "{n} ڪلاڪ", "other": "{n} ڪلاڪ"],
        dakika: ["one": "{n} منٽ", "other": "{n} منٽ"],
        saniye: ["one": "{n} سيڪنڊ", "other": "{n} سيڪنڊ"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // pl (one/few/many/other)
    public static let pl = SaatSureMetinleri(
        birimSa: "godz.", birimDk: "min", birimSn: "sek.",
        saat: ["one": "{n} godzina", "few": "{n} godziny", "many": "{n} godzin", "other": "{n} godziny"],
        dakika: ["one": "{n} minuta", "few": "{n} minuty", "many": "{n} minut", "other": "{n} minuty"],
        saniye: ["one": "{n} sekunda", "few": "{n} sekundy", "many": "{n} sekund", "other": "{n} sekundy"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ja (other)
    public static let ja = SaatSureMetinleri(
        birimSa: "時間", birimDk: "分", birimSn: "秒",
        saat: ["other": "{n}時間"],
        dakika: ["other": "{n}分"],
        saniye: ["other": "{n}秒"],
        birimAyirici: "", parcaAyirici: ""
    )

    // gu — JS `sozluk/gu/sure.ts` birebir (kısa birim CLDR narrow; one = 0 ve 1, one = other)
    public static let gu = SaatSureMetinleri(
        birimSa: "ક", birimDk: "મિ", birimSn: "સે",
        saat: ["one": "{n} કલાક", "other": "{n} કલાક"],
        dakika: ["one": "{n} મિનિટ", "other": "{n} મિનિટ"],
        saniye: ["one": "{n} સેકંડ", "other": "{n} સેકંડ"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // bg (one/other)
    public static let bg = SaatSureMetinleri(
        birimSa: "ч", birimDk: "мин", birimSn: "с",
        saat: ["one": "{n} час", "other": "{n} часа"],
        dakika: ["one": "{n} минута", "other": "{n} минути"],
        saniye: ["one": "{n} секунда", "other": "{n} секунди"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // mk (one/other)
    public static let mk = SaatSureMetinleri(
        birimSa: "ч", birimDk: "мин", birimSn: "с",
        saat: ["one": "{n} час", "other": "{n} часа"],
        dakika: ["one": "{n} минута", "other": "{n} минути"],
        saniye: ["one": "{n} секунда", "other": "{n} секунди"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // fil (one/other; ad sayıyla çekilmez)
    public static let fil = SaatSureMetinleri(
        birimSa: "oras", birimDk: "min", birimSn: "seg",
        saat: ["one": "{n} oras", "other": "{n} oras"],
        dakika: ["one": "{n} minuto", "other": "{n} minuto"],
        saniye: ["one": "{n} segundo", "other": "{n} segundo"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // te (one/other)
    public static let te = SaatSureMetinleri(
        birimSa: "గం", birimDk: "నిమి", birimSn: "సె",
        saat: ["one": "{n} గంట", "other": "{n} గంటలు"],
        dakika: ["one": "{n} నిమిషం", "other": "{n} నిమిషాలు"],
        saniye: ["one": "{n} సెకను", "other": "{n} సెకన్లు"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // kn (one = 0 ve 1, other; sayıyla ad tekil kalır → JS sure ile aynı, one = other)
    public static let kn = SaatSureMetinleri(
        birimSa: "ಗಂ", birimDk: "ನಿಮಿ", birimSn: "ಸೆ",
        saat: ["one": "{n} ಗಂಟೆ", "other": "{n} ಗಂಟೆ"],
        dakika: ["one": "{n} ನಿಮಿಷ", "other": "{n} ನಿಮಿಷ"],
        saniye: ["one": "{n} ಸೆಕೆಂಡ್", "other": "{n} ಸೆಕೆಂಡ್"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // mr (one/other; CLDR kısa birimler ता, मिनि, से)
    public static let mr = SaatSureMetinleri(
        birimSa: "ता", birimDk: "मिनि", birimSn: "से",
        saat: ["one": "{n} तास", "other": "{n} तास"],
        dakika: ["one": "{n} मिनिट", "other": "{n} मिनिटे"],
        saniye: ["one": "{n} सेकंद", "other": "{n} सेकंद"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // pa — JS `sozluk/pa/sure.ts` birebir (Şahmuki; birim kısaltılmaz; one = 0 ve 1, `CogulKurali` hi dalı)
    public static let pa = SaatSureMetinleri(
        birimSa: "گھنٹے", birimDk: "منٹ", birimSn: "سیکنڈ",
        saat: ["one": "{n} گھنٹہ", "other": "{n} گھنٹے"],
        dakika: ["one": "{n} منٹ", "other": "{n} منٹ"],
        saniye: ["one": "{n} سیکنڈ", "other": "{n} سیکنڈ"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // as (one = 0 ve 1, other; ikisi aynı biçim)
    public static let `as` = SaatSureMetinleri(
        birimSa: "ঘ", birimDk: "মি", birimSn: "ছে",
        saat: ["one": "{n} ঘণ্টা", "other": "{n} ঘণ্টা"],
        dakika: ["one": "{n} মিনিট", "other": "{n} মিনিট"],
        saniye: ["one": "{n} ছেকেণ্ড", "other": "{n} ছেকেণ্ড"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ne (one/other; sayıdan sonra isim çekimlenmez)
    public static let ne = SaatSureMetinleri(
        birimSa: "घण्टा", birimDk: "मिनेट", birimSn: "सेकेन्ड",
        saat: ["one": "{n} घण्टा", "other": "{n} घण्टा"],
        dakika: ["one": "{n} मिनेट", "other": "{n} मिनेट"],
        saniye: ["one": "{n} सेकेन्ड", "other": "{n} सेकेन्ड"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // si (CLDR one = 0, 1 / other; Sinhala ad sayıyla çekilmez, iki kategori aynı kalıp; sayı önce)
    public static let si = SaatSureMetinleri(
        birimSa: "පැය", birimDk: "මිනි", birimSn: "තත්",
        saat: ["one": "{n} පැය", "other": "{n} පැය"],
        dakika: ["one": "{n} මිනිත්තු", "other": "{n} මිනිත්තු"],
        saniye: ["one": "{n} තත්පර", "other": "{n} තත්පර"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // km (other)
    public static let km = SaatSureMetinleri(
        birimSa: "ម៉ោង", birimDk: "នាទី", birimSn: "វិនាទី",
        saat: ["other": "{n} ម៉ោង"],
        dakika: ["other": "{n} នាទី"],
        saniye: ["other": "{n} វិនាទី"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // he (one/two/other; CLDR he kısa birimler). Her kalıp "{n}" taşır (test §15b): JS'in sayısız
    // ikilik biçimi ("שעתיים") yerine `two` sayılı çoğul.
    public static let he = SaatSureMetinleri(
        birimSa: "שע׳", birimDk: "דק׳", birimSn: "שנ׳",
        saat: ["one": "{n} שעה", "two": "{n} שעות", "other": "{n} שעות"],
        dakika: ["one": "{n} דקה", "two": "{n} דקות", "other": "{n} דקות"],
        saniye: ["one": "{n} שנייה", "two": "{n} שניות", "other": "{n} שניות"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ka (one/other; CLDR kısa birimler სთ/წთ/წმ, sayıdan sonra isim tekil)
    public static let ka = SaatSureMetinleri(
        birimSa: "სთ", birimDk: "წთ", birimSn: "წმ",
        saat: ["one": "{n} საათი", "other": "{n} საათი"],
        dakika: ["one": "{n} წუთი", "other": "{n} წუთი"],
        saniye: ["one": "{n} წამი", "other": "{n} წამი"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // lt (one/few/many/other; CLDR lt short noktalı, JS sure ile aynı)
    public static let lt = SaatSureMetinleri(
        birimSa: "val.", birimDk: "min.", birimSn: "sek.",
        saat: ["one": "{n} valanda", "few": "{n} valandos", "many": "{n} valandos", "other": "{n} valandų"],
        dakika: ["one": "{n} minutė", "few": "{n} minutės", "many": "{n} minutės", "other": "{n} minučių"],
        saniye: ["one": "{n} sekundė", "few": "{n} sekundės", "many": "{n} sekundės", "other": "{n} sekundžių"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // mg (CLDR one = 0, 1 / other; Malgaşçada isim çoğul eki almaz, iki kategori aynı kalıp)
    public static let mg = SaatSureMetinleri(
        birimSa: "ora", birimDk: "min", birimSn: "seg",
        saat: ["one": "{n} ora", "other": "{n} ora"],
        dakika: ["one": "{n} minitra", "other": "{n} minitra"],
        saniye: ["one": "{n} segondra", "other": "{n} segondra"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // lg — Luganda: JS `sozluk/lg/sure.ts` birebir (kısa birim ssa/dk/tk; sayı addan sonra; one/other)
    public static let lg = SaatSureMetinleri(
        birimSa: "ssa", birimDk: "dk", birimSn: "tk",
        saat: ["one": "essaawa {n}", "other": "essaawa {n}"],
        dakika: ["one": "eddakiika {n}", "other": "eddakiika {n}"],
        saniye: ["one": "akatikitiki {n}", "other": "obutikitiki {n}"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // rw (other)
    public static let rw = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["other": "amasaha {n}"],
        dakika: ["other": "iminota {n}"],
        saniye: ["other": "amasegonda {n}"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // rn (other)
    public static let rn = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["other": "amasaha {n}"],
        dakika: ["other": "iminota {n}"],
        saniye: ["other": "amasegonda {n}"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ln (one/other; isim sayıdan önce, sayıyla çekilmez: JS `sure.ts`)
    public static let ln = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "ngonga {n}", "other": "ngonga {n}"],
        dakika: ["one": "miniti {n}", "other": "miniti {n}"],
        saniye: ["one": "sekondi {n}", "other": "sekondi {n}"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // dag (other; sayı ismin ardından: "minti 5")
    public static let dag = SaatSureMetinleri(
        birimSa: "hw", birimDk: "min", birimSn: "sk",
        saat: ["other": "hawa {n}"],
        dakika: ["other": "minti {n}"],
        saniye: ["other": "sɛkɛnti {n}"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // mos (other)
    public static let mos = SaatSureMetinleri(
        birimSa: "lɛɛr", birimDk: "min", birimSn: "s",
        saat: ["other": "{n} lɛɛr"],
        dakika: ["other": "{n} minit"],
        saniye: ["other": "{n} sekõnd"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // aa (other)
    public static let aa = SaatSureMetinleri(
        birimSa: "saq", birimDk: "daq", birimSn: "sek",
        saat: ["other": "{n} saaqat"],
        dakika: ["other": "{n} daqiiqa"],
        saniye: ["other": "{n} sekond"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // mdh (other)
    public static let mdh = SaatSureMetinleri(
        birimSa: "or", birimDk: "min", birimSn: "seg",
        saat: ["other": "{n} oras"],
        dakika: ["other": "{n} minutu"],
        saniye: ["other": "{n} segundu"],
        birimAyirici: " ", parcaAyirici: " "
    )

    public static let ak = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["one": "dɔnhwere {n}", "other": "dɔnhwere {n}"],
        dakika: ["one": "sima {n}", "other": "sima {n}"],
        saniye: ["one": "sima sini {n}", "other": "sima sini {n}"],
        birimAyirici: " ", parcaAyirici: " "
    )

    public static let ceb = SaatSureMetinleri(
        birimSa: "oras", birimDk: "min", birimSn: "seg",
        saat: ["one": "{n} ka oras", "other": "{n} ka oras"],
        dakika: ["one": "{n} ka minuto", "other": "{n} ka minuto"],
        saniye: ["one": "{n} ka segundo", "other": "{n} ka segundo"],
        birimAyirici: " ", parcaAyirici: " "
    )

    // ÇEVİRİ: nqo (other)
    public static let nqo = SaatSureMetinleri(
        birimSa: "h", birimDk: "min", birimSn: "s",
        saat: ["other": "{n} hours"],
        dakika: ["other": "{n} minutes"],
        saniye: ["other": "{n} seconds"],
        birimAyirici: " ", parcaAyirici: " "
    )

    public static let tablo: [String: SaatSureMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
        "zh": zh, "ta": ta, "ml": ml, "th": th, "ko": ko, "vi": vi,
        "pt": pt, "it": it, "sv": sv, "uk": uk, "ro": ro, "hr": hr, "sr": sr, "el": el,
        "ku": ku, "tk": tk, "tt": tt, "sd": sd, "pl": pl, "ja": ja, "gu": gu, "bg": bg, "mk": mk,
        "fil": fil, "te": te, "kn": kn, "mr": mr, "pa": pa, "as": `as`, "ne": ne, "si": si, "km": km,
        "he": he, "ka": ka, "lt": lt, "mg": mg, "lg": lg, "rw": rw, "rn": rn, "ln": ln, "dag": dag, "mos": mos, "aa": aa, "mdh": mdh, "ak": ak, "ceb": ceb, "nqo": nqo,
    ]

    public static func dil(_ kod: String?) -> SaatSureMetinleri { tablo[ArayuzDili.coz(kod)] ?? tr }
}

public enum SaatSure {
    private enum Tur { case saat, dakika, saniye }

    private static func ham(_ kalanMs: Int64, _ saniyesiz: Bool) -> [(Int64, Tur)] {
        let toplam = max(kalanMs, 0) / 1000
        let sa = toplam / 3600
        let dk = (toplam % 3600) / 60
        let sn = toplam % 60
        if sa > 0 { return [(sa, .saat), (dk, .dakika)] }
        if saniyesiz { return [(max(dk, sn > 0 ? 1 : 0), .dakika)] }
        if dk > 0 { return [(dk, .dakika), (sn, .saniye)] }
        return [(sn, .saniye)]
    }

    /// Kalan sure (ms, negatif → 0) parcalari. Saniye ASAGI yuvarlanir (JS sayaciyla ayni).
    /// Birimler dilde (JS `sozluk/<dil>/sure.ts > kisa`: "sa/dk/sn", "h/min/s").
    public static func parcalar(kalanMs: Int64, saniyesiz: Bool = false, dil: String = ArayuzDili.varsayilan) -> [SaatSureParcasi] {
        let m = SaatSureMetinleri.dil(dil)
        let parcalar = ham(kalanMs, saniyesiz)
        return parcalar.map { (n, tur) in
            switch tur {
            case .saat: return SaatSureParcasi(String(n), m.birimSa)
            case .dakika: return SaatSureParcasi(String(n), m.birimDk)
            // Dakikanin yanindaki saniye iki haneli (satir oynamaz).
            case .saniye: return SaatSureParcasi(parcalar.count > 1 && n < 10 ? "0\(n)" : String(n), m.birimSn)
            }
        }
    }

    /// Ekran okuyucu: "1 saat 9 dakika", "9 dakika 5 saniye", "42 saniye"
    /// (en: "1 hour 9 minutes", "1 minute 1 second" — JS `sure.saat/dakika/saniye` cogullari).
    public static func sesli(kalanMs: Int64, saniyesiz: Bool = false, dil: String = ArayuzDili.varsayilan) -> String {
        let m = SaatSureMetinleri.dil(dil)
        return ham(kalanMs, saniyesiz)
            .map { (n, tur) -> String in
                let kaliplar: [String: String]
                switch tur {
                case .saat: kaliplar = m.saat
                case .dakika: kaliplar = m.dakika
                case .saniye: kaliplar = m.saniye
                }
                return CogulKurali.sec(kaliplar, dil, Int(n))
            }
            .joined(separator: m.parcaAyirici)
    }
}
