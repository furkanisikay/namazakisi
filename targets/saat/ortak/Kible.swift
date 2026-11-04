import Foundation

/**
 * KIBLE ACISI + PUSULA KARARLARI (Apple Watch, #285 cilasi) — SAF (yalniz Foundation).
 *
 * Wear `cekirdek/Kible.kt` + `KibleKarari.kt` ikizi; o da telefonun `adhan` JS `Qibla`
 * formulunun ikizidir. Radyan donusumu `d * pi / 180` (Kotlin ile ayni), sarma
 * `x - 360 * floor(x / 360)` (adhan `unwindAngle`). Kilit: ortak fikstur
 * `wear/app/src/test/resources/kible-ornekleri.json` (`targets/saat/test/main.swift`, 1e-9).
 *
 * Acilar derece, gercek kuzeye gore saat yonunde. Sensor (CoreLocation pusulasi)
 * `targets/saat/KibleEkrani.swift`'tedir; buraya yalniz SAYI girer.
 */
public enum Kible {
    /// Kabe — adhan JS ile ayni koordinat.
    public static let kabeEnlem = 21.4225241
    public static let kabeBoylam = 39.8261818

    /// Hizaya GIRIS ±5° (sahip karari, Apple Watch kibleyi daha dar gosterir; Wear/telefon 10°).
    /// Cikis 8° (histerezis — yazi ve yesil halka yanip sonmesin).
    public static let hizaGirisDerece = 5.0
    public static let hizaCikisDerece = 8.0

    public static func aci(enlem: Double, boylam: Double) -> Double {
        let terim1 = sin(radyan(kabeBoylam) - radyan(boylam))
        let terim2 = cos(radyan(enlem)) * tan(radyan(kabeEnlem))
        let terim3 = sin(radyan(enlem)) * cos(radyan(kabeBoylam) - radyan(boylam))
        return dereceSar(derece(atan2(terim1, terim2 - terim3)))
    }

    public static func dereceSar(_ aci: Double) -> Double {
        return aci - 360.0 * (aci / 360.0).rounded(.down)
    }

    /// Kiblenin saate gore acisi: 0 = tam onde, 90 = sagda, 270 = solda.
    public static func hedefAcisi(kibleAcisi: Double, yon: Double) -> Double {
        return dereceSar(kibleAcisi - yon)
    }

    /// Kibleden mutlak sapma, [0, 180].
    public static func sapma(_ hedef: Double) -> Double {
        let h = dereceSar(hedef)
        return h > 180.0 ? 360.0 - h : h
    }

    /// Histerezisli hizalama; `titret` yalniz hizaya GIRIS aninda.
    public static func hiza(oncekiHizali: Bool, hedef: Double) -> (hizali: Bool, titret: Bool) {
        let s = sapma(hedef)
        let hizali = oncekiHizali ? s <= hizaCikisDerece : s < hizaGirisDerece
        return (hizali, hizali && !oncekiHizali)
    }

    /// Yon. "Saga" / "Sola" / "Arkanizda" — rakam ayrica `donusDerecesi` ile (5°'lik adim).
    /// Metinler dil parametresiyle (W5; varsayilan Turkce — fikstur testleri degismez).
    public enum Donus: Equatable { case saga, sola, arkada }

    public static func donus(_ hedef: Double) -> Donus {
        if sapma(hedef) >= 175.0 { return .arkada }
        return dereceSar(hedef) <= 180.0 ? .saga : .sola
    }

    /// 5°'lik adim (her sensor olayinda rakam titremesin), en az 5.
    public static func donusDerecesi(_ hedef: Double) -> Int {
        return max(5, Int((sapma(hedef) / 5.0).rounded()) * 5)
    }

    /// Wear `donusMetni` ile ayni: "Sağa 35°", "Sola 120°", "Arkanızda" (en: "Right 35°"...).
    public static func donusMetni(_ hedef: Double, dil: String = ArayuzDili.varsayilan) -> String {
        let m = KibleMetinleri.dil(dil)
        switch donus(hedef) {
        case .arkada: return m.arkada
        case .saga: return VakitMetinleri.bicim(m.saga, ["derece": String(donusDerecesi(hedef))])
        case .sola: return VakitMetinleri.bicim(m.sola, ["derece": String(donusDerecesi(hedef))])
        }
    }

    /// Ekran okuyucu: 10°'lik adim (her olayda okunmasin), kibar "siz". Ingilizce karsilik
    /// JS `sozluk/en/kible.ts > yon` ile ayni kalip.
    public static func erisimMetni(_ hedef: Double, hizali: Bool, dil: String = ArayuzDili.varsayilan) -> String {
        let m = KibleMetinleri.dil(dil)
        if hizali { return m.hizali }
        let s = sapma(hedef)
        if s >= 175.0 { return m.arkadaErisim }
        let adim = max(10, Int((s / 10.0).rounded()) * 10)
        let sagda = dereceSar(hedef) <= 180.0
        return VakitMetinleri.bicim(sagda ? m.sagdaErisim : m.soldaErisim, ["derece": String(adim)])
    }

    /// Ok donusunde EN KISA yol (359 → 1 gecisinde ok geri dolasmaz). Sonuc sarilmaz.
    public static func enKisaYol(onceki: Double, yeni: Double) -> Double {
        var fark = dereceSar(yeni) - dereceSar(onceki)
        if fark > 180.0 { fark -= 360.0 }
        if fark < -180.0 { fark += 360.0 }
        return onceki + fark
    }

    /// Kabe'ye buyuk daire uzakligi (km, haversine, R = 6371). Gosterim icin; konum zaten
    /// ~11 km yuvarlak oldugundan ekranda 10 km'ye yuvarlanir (`mesafeMetni`).
    public static func mesafeKm(enlem: Double, boylam: Double) -> Double {
        let f1 = radyan(enlem), f2 = radyan(kabeEnlem)
        let df = radyan(kabeEnlem - enlem), dl = radyan(kabeBoylam - boylam)
        let a = sin(df / 2) * sin(df / 2) + cos(f1) * cos(f2) * sin(dl / 2) * sin(dl / 2)
        return 6371.0 * 2 * atan2(a.squareRoot(), (1 - a).squareRoot())
    }

    /// "2.410 km" (Turkce binlik ayraci nokta, Ingilizcede virgul; 10 km'ye yuvarlanir,
    /// 10 km altinda "Kâbe'desiniz").
    public static func mesafeMetni(_ km: Double, dil: String = ArayuzDili.varsayilan) -> String {
        let m = KibleMetinleri.dil(dil)
        if km < 10 { return m.kabede }
        let yuvarlak = Int((km / 10).rounded()) * 10
        var rakam = String(yuvarlak)
        var parcalar: [String] = []
        while rakam.count > 3 {
            parcalar.insert(String(rakam.suffix(3)), at: 0)
            rakam = String(rakam.dropLast(3))
        }
        parcalar.insert(rakam, at: 0)
        return VakitMetinleri.bicim(m.mesafe, ["km": parcalar.joined(separator: m.binlikAyirici)])
    }

    private static func radyan(_ d: Double) -> Double { d * Double.pi / 180.0 }
    private static func derece(_ r: Double) -> Double { r * 180.0 / Double.pi }
}

/// Kible metinleri — dil basina bir ornek (Wear `SaatDili` kible alanlari ve JS
/// `sozluk/<dil>/kible.ts > yon` ikizi). Yer tutucular `{derece}`, `{km}`. Duzen: sira tr, en,
/// id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km; cevrilmemis dil Ingilizce kopya (`// ÇEVİRİ: <kod>`).
public struct KibleMetinleri: Equatable {
    public let arkada: String
    public let saga: String
    public let sola: String
    public let hizali: String
    public let arkadaErisim: String
    public let sagdaErisim: String
    public let soldaErisim: String
    public let kabede: String
    public let mesafe: String
    public let binlikAyirici: String

    public static let tr = KibleMetinleri(
        arkada: "Arkanızda",
        saga: "Sağa {derece}°",
        sola: "Sola {derece}°",
        hizali: "Kıble yönündesiniz",
        arkadaErisim: "Kıble arkanızda",
        sagdaErisim: "Kıble {derece} derece sağınızda",
        soldaErisim: "Kıble {derece} derece solunuzda",
        kabede: "Kâbe'desiniz",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    public static let en = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )


    // id — Endonezce (beta); JS `sozluk/id/kible.ts > yon`
    public static let id = KibleMetinleri(
        arkada: "Di belakang Anda",
        saga: "Kanan {derece}°",
        sola: "Kiri {derece}°",
        hizali: "Anda menghadap kiblat",
        arkadaErisim: "Kiblat ada di belakang Anda",
        sagdaErisim: "Kiblat {derece} derajat di sebelah kanan Anda",
        soldaErisim: "Kiblat {derece} derajat di sebelah kiri Anda",
        kabede: "Anda berada di Ka’bah",
        mesafe: "{km} km",
        binlikAyirici: "."
    )


    // de — Almanca (beta): JS `sozluk/de/kible.ts > yon`
    public static let de = KibleMetinleri(
        arkada: "Hinter Ihnen",
        saga: "Rechts {derece}°",
        sola: "Links {derece}°",
        hizali: "Sie sind zur Qibla ausgerichtet",
        arkadaErisim: "Die Qibla ist hinter Ihnen",
        sagdaErisim: "Die Qibla ist {derece} Grad rechts von Ihnen",
        soldaErisim: "Die Qibla ist {derece} Grad links von Ihnen",
        kabede: "Sie sind an der Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "."
    )


    // fr
    public static let fr = KibleMetinleri(
        arkada: "Derrière vous",
        saga: "À droite {derece}°",
        sola: "À gauche {derece}°",
        hizali: "Vous êtes face à la Qibla",
        arkadaErisim: "La Qibla est derrière vous",
        sagdaErisim: "La Qibla est à {derece} degrés sur votre droite",
        soldaErisim: "La Qibla est à {derece} degrés sur votre gauche",
        kabede: "Vous êtes à la Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "\u{202F}"
    )


    // bs
    public static let bs = KibleMetinleri(
        arkada: "Iza Vas",
        saga: "Desno {derece}°",
        sola: "Lijevo {derece}°",
        hizali: "Okrenuti ste prema kibli",
        arkadaErisim: "Kibla je iza Vas",
        sagdaErisim: "Kibla je {derece}° desno od Vas",
        soldaErisim: "Kibla je {derece}° lijevo od Vas",
        kabede: "U Kabi ste",
        mesafe: "{km} km",
        binlikAyirici: "."
    )


    // ru
    public static let ru = KibleMetinleri(
        arkada: "Позади вас",
        saga: "Направо {derece}°",
        sola: "Налево {derece}°",
        hizali: "Вы повёрнуты к кибле",
        arkadaErisim: "Кибла позади вас",
        sagdaErisim: "Кибла на {derece}° справа от вас",
        soldaErisim: "Кибла на {derece}° слева от вас",
        kabede: "Вы у Каабы",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )


    // ms
    public static let ms = KibleMetinleri(
        arkada: "Di belakang anda",
        saga: "Kanan {derece}°",
        sola: "Kiri {derece}°",
        hizali: "Anda menghadap kiblat",
        arkadaErisim: "Kiblat di belakang anda",
        sagdaErisim: "Kiblat {derece} darjah di sebelah kanan anda",
        soldaErisim: "Kiblat {derece} darjah di sebelah kiri anda",
        kabede: "Anda berada di Kaabah",
        mesafe: "{km} km",
        binlikAyirici: ","
    )


    // ar — Arapça (beta): JS `sozluk/ar/kible.ts > yon`, mesafe `cami.kmIcinde` ("كم")
    public static let ar = KibleMetinleri(
        arkada: "خلفك",
        saga: "يمينًا {derece}°",
        sola: "يسارًا {derece}°",
        hizali: "أنت باتجاه القبلة",
        arkadaErisim: "القبلة خلفك",
        sagdaErisim: "القبلة {derece} درجة إلى يمينك",
        soldaErisim: "القبلة {derece} درجة إلى يسارك",
        kabede: "أنت عند الكعبة",
        mesafe: "{km} كم",
        binlikAyirici: ","
    )


    // ur
    public static let ur = KibleMetinleri(
        arkada: "پیچھے",
        saga: "دائیں {derece}°",
        sola: "بائیں {derece}°",
        hizali: "آپ قبلہ رخ ہیں",
        arkadaErisim: "قبلہ آپ کے پیچھے ہے",
        sagdaErisim: "قبلہ آپ کے دائیں جانب {derece} درجے پر ہے",
        soldaErisim: "قبلہ آپ کے بائیں جانب {derece} درجے پر ہے",
        kabede: "آپ کعبہ کے پاس ہیں",
        mesafe: "{km} کلومیٹر",
        binlikAyirici: ","
    )

    // es — İspanyolca (beta): JS `sozluk/es/kible.ts > yon` (alquibla); binlik ayırıcı "." (JS `aktifDil.ts > BINLIK`)
    public static let es = KibleMetinleri(
        arkada: "Detrás de usted",
        saga: "Derecha {derece}°",
        sola: "Izquierda {derece}°",
        hizali: "Está frente a la alquibla",
        arkadaErisim: "La alquibla está detrás de usted",
        sagdaErisim: "La alquibla está {derece} grados a su derecha",
        soldaErisim: "La alquibla está {derece} grados a su izquierda",
        kabede: "Está en la Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl/kible.ts > yon`; binlik ayırıcı nokta (JS `BINLIK.nl`)
    public static let nl = KibleMetinleri(
        arkada: "Achter u",
        saga: "Rechts {derece}°",
        sola: "Links {derece}°",
        hizali: "U staat in de richting van de qibla",
        arkadaErisim: "De qibla is achter u",
        sagdaErisim: "De qibla is {derece} graden rechts van u",
        soldaErisim: "De qibla is {derece} graden links van u",
        kabede: "U bent bij de Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // sq — JS `sozluk/sq/kible.ts`; binlik ayırıcı bölünmez boşluk (JS `aktifDil.ts > BINLIK`)
    public static let sq = KibleMetinleri(
        arkada: "Pas jush",
        saga: "Djathtas {derece}°",
        sola: "Majtas {derece}°",
        hizali: "Jeni drejt kibles",
        arkadaErisim: "Kibla është pas jush",
        sagdaErisim: "Kibla është {derece} gradë në të djathtën tuaj",
        soldaErisim: "Kibla është {derece} gradë në të majtën tuaj",
        kabede: "Jeni te Qabeja",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // hi — Hintçe (beta): JS `sozluk/hi/kible.ts > yon`, mesafe `cami.kmIcinde` ("किलोमीटर")
    public static let hi = KibleMetinleri(
        arkada: "पीछे",
        saga: "दाएं {derece}°",
        sola: "बाएं {derece}°",
        hizali: "आप क़िबला रुख़ हैं",
        arkadaErisim: "क़िबला आपके पीछे है",
        sagdaErisim: "क़िबला आपकी दाईं तरफ़ {derece} डिग्री पर है",
        soldaErisim: "क़िबला आपकी बाईं तरफ़ {derece} डिग्री पर है",
        kabede: "आप काबा के पास हैं",
        mesafe: "{km} किलोमीटर",
        binlikAyirici: ","
    )

    // bn — JS `sozluk/bn/kible.ts > yon`
    public static let bn = KibleMetinleri(
        arkada: "পেছনে",
        saga: "ডানে {derece}°",
        sola: "বামে {derece}°",
        hizali: "আপনি কিবলামুখী আছেন",
        arkadaErisim: "কিবলা আপনার পেছনে",
        sagdaErisim: "কিবলা আপনার ডানে {derece} ডিগ্রি",
        soldaErisim: "কিবলা আপনার বামে {derece} ডিগ্রি",
        kabede: "আপনি কাবার কাছে আছেন",
        mesafe: "{km} কিমি",
        binlikAyirici: ","
    )

    // fa — JS `sozluk/fa/kible.ts` (binlik ayırıcı JS `aktifDil > BINLIK.fa` ile aynı)
    public static let fa = KibleMetinleri(
        arkada: "پشت سر",
        saga: "راست {derece}°",
        sola: "چپ {derece}°",
        hizali: "رو به قبله هستید",
        arkadaErisim: "قبله پشت سر شماست",
        sagdaErisim: "قبله {derece} درجه سمت راست شماست",
        soldaErisim: "قبله {derece} درجه سمت چپ شماست",
        kabede: "کنار کعبه هستید",
        mesafe: "{km} کیلومتر",
        binlikAyirici: ","
    )

    // ps — Peştuca (beta): JS `sozluk/ps/kible.ts`
    public static let ps = KibleMetinleri(
        arkada: "شاته",
        saga: "ښي لور ته {derece}°",
        sola: "کیڼ لور ته {derece}°",
        hizali: "تاسو د قبلې په لور یاست",
        arkadaErisim: "قبله ستاسو شاته ده",
        sagdaErisim: "قبله ستاسو ښي لور ته {derece} درجې ده",
        soldaErisim: "قبله ستاسو کیڼ لور ته {derece} درجې ده",
        kabede: "تاسو د کعبې سره یاست",
        mesafe: "{km} کیلومتره",
        binlikAyirici: ","
    )

    // ckb
    public static let ckb = KibleMetinleri(
        arkada: "لە پشتەوە",
        saga: "ڕاست {derece}°",
        sola: "چەپ {derece}°",
        hizali: "ڕووتان لە قیبلەیە",
        arkadaErisim: "قیبلە لە پشتتانەوەیە",
        sagdaErisim: "قیبلە {derece} پلە لە لای ڕاستتانە",
        soldaErisim: "قیبلە {derece} پلە لە لای چەپتانە",
        kabede: "لە کەعبەدان",
        mesafe: "{km} کم",
        binlikAyirici: ","
    )

    // ug — Uygurca (beta); JS `sozluk/ug/kible.ts`
    public static let ug = KibleMetinleri(
        arkada: "ئارقىڭىزدا",
        saga: "ئوڭغا {derece}°",
        sola: "سولغا {derece}°",
        hizali: "قىبلە تەرەپكە قاراپ تۇرۇۋاتىسىز",
        arkadaErisim: "قىبلە ئارقىڭىزدا",
        sagdaErisim: "قىبلە ئوڭ تەرىپىڭىزدە {derece} گرادۇس",
        soldaErisim: "قىبلە سول تەرىپىڭىزدە {derece} گرادۇس",
        kabede: "كەئبىدىسىز",
        mesafe: "{km} كىلومېتىر",
        binlikAyirici: ","
    )

    // az — Azerice (beta); JS `sozluk/az/kible.ts`; CLDR az binlik ayırıcı "."
    public static let az = KibleMetinleri(
        arkada: "Arxanızda",
        saga: "Sağa {derece}°",
        sola: "Sola {derece}°",
        hizali: "Qiblə istiqamətindəsiniz",
        arkadaErisim: "Qiblə arxanızdadır",
        sagdaErisim: "Qiblə {derece} dərəcə sağınızdadır",
        soldaErisim: "Qiblə {derece} dərəcə solunuzdadır",
        kabede: "Kəbədəsiniz",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // uz — Özbekçe (beta, LATİN); JS `sozluk/uz/kible.ts` (binlik ayırıcı CLDR uz: bölünmez boşluk)
    public static let uz = KibleMetinleri(
        arkada: "Orqangizda",
        saga: "Oʻngga {derece}°",
        sola: "Chapga {derece}°",
        hizali: "Siz qiblaga qarab turibsiz",
        arkadaErisim: "Qibla orqangizda",
        sagdaErisim: "Qibla oʻng tomoningizda, {derece} daraja",
        soldaErisim: "Qibla chap tomoningizda, {derece} daraja",
        kabede: "Kaʼbadasiz",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // kk — Kazakça (beta, Kiril); JS `sozluk/kk/kible.ts`. Binlik ayırıcı CLDR kk: bölünmez boşluk.
    public static let kk = KibleMetinleri(
        arkada: "Артыңызда",
        saga: "Оңға {derece}°",
        sola: "Солға {derece}°",
        hizali: "Сіз құбыла бағытындасыз",
        arkadaErisim: "Құбыла артыңызда",
        sagdaErisim: "Құбыла оң жағыңызда, {derece} градус",
        soldaErisim: "Құбыла сол жағыңызда, {derece} градус",
        kabede: "Сіз Қағбадасыз",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )

    // ky
    public static let ky = KibleMetinleri(
        arkada: "Артыңызда",
        saga: "Оңго {derece}°",
        sola: "Солго {derece}°",
        hizali: "Сиз кыбылага карап турасыз",
        arkadaErisim: "Кыбыла артыңызда",
        sagdaErisim: "Кыбыла сизден {derece} градус оң тарапта",
        soldaErisim: "Кыбыла сизден {derece} градус сол тарапта",
        kabede: "Сиз Каабанын жанындасыз",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )

    // tg — Tacikçe (beta): JS `sozluk/tg/kible.ts` (binlik ayırıcı JS `aktifDil > BINLIK.tg` ile aynı, bölünmez boşluk)
    public static let tg = KibleMetinleri(
        arkada: "Дар пас",
        saga: "Рост {derece}°",
        sola: "Чап {derece}°",
        hizali: "Шумо рӯ ба қибла ҳастед",
        arkadaErisim: "Қибла дар паси Шумост",
        sagdaErisim: "Қибла {derece} дараҷа аз тарафи рости Шумост",
        soldaErisim: "Қибла {derece} дараҷа аз тарафи чапи Шумост",
        kabede: "Шумо дар назди Каъба ҳастед",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )

    // sw
    public static let sw = KibleMetinleri(
        arkada: "Nyuma yako",
        saga: "Kulia {derece}°",
        sola: "Kushoto {derece}°",
        hizali: "Umeelekea Kibla",
        arkadaErisim: "Kibla iko nyuma yako",
        sagdaErisim: "Kibla iko nyuzi {derece} upande wako wa kulia",
        soldaErisim: "Kibla iko nyuzi {derece} upande wako wa kushoto",
        kabede: "Uko kwenye Al-Kaaba",
        mesafe: "km {km}",
        binlikAyirici: ","
    )

    // ha — Hausa (beta): JS `sozluk/ha/kible.ts`
    public static let ha = KibleMetinleri(
        arkada: "A bayanku",
        saga: "Dama {derece}°",
        sola: "Hagu {derece}°",
        hizali: "Kuna fuskantar Alƙibla",
        arkadaErisim: "Alƙibla tana bayanku",
        sagdaErisim: "Alƙibla tana dama da ku da digiri {derece}",
        soldaErisim: "Alƙibla tana hagu da ku da digiri {derece}",
        kabede: "Kuna a Kaʼaba",
        mesafe: "km {km}",
        binlikAyirici: ","
    )

    // am — Amharca (beta); CLDR am binlik ayırıcı ","
    public static let am = KibleMetinleri(
        arkada: "ከኋላዎ",
        saga: "ቀኝ {derece}°",
        sola: "ግራ {derece}°",
        hizali: "ወደ ቂብላ ዞረዋል",
        arkadaErisim: "ቂብላ ከኋላዎ ነው",
        sagdaErisim: "ቂብላ ከቀኝዎ {derece} ዲግሪ ነው",
        soldaErisim: "ቂብላ ከግራዎ {derece} ዲግሪ ነው",
        kabede: "ካዕባ ላይ ነዎት",
        mesafe: "{km} ኪ.ሜ",
        binlikAyirici: ","
    )

    // om
    public static let om = KibleMetinleri(
        arkada: "Duuba keessan",
        saga: "Mirga {derece}°",
        sola: "Bitaa {derece}°",
        hizali: "Gara qiblaatti garagaltaniittu",
        arkadaErisim: "Qiblaan duuba keessan jira",
        sagdaErisim: "Qiblaan gara mirga keessanii digirii {derece} irra jira",
        soldaErisim: "Qiblaan gara bitaa keessanii digirii {derece} irra jira",
        kabede: "Ka'abaa bira jirtu",
        mesafe: "km {km}",
        binlikAyirici: ","
    )

    // so
    public static let so = KibleMetinleri(
        arkada: "Gadaashaada",
        saga: "Midig {derece}°",
        sola: "Bidix {derece}°",
        hizali: "Waxaad u jeeddaa Qiblada",
        arkadaErisim: "Qibladu waa gadaashaada",
        sagdaErisim: "Qibladu waa {derece} darajo dhanka midigtaada",
        soldaErisim: "Qibladu waa {derece} darajo dhanka bidixdaada",
        kabede: "Waxaad joogtaa Kacbada",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // ff
    public static let ff = KibleMetinleri(
        arkada: "Caggal mon",
        saga: "Ñaamo {derece}°",
        sola: "Nano {derece}°",
        hizali: "Hiɗon ndaari qibla",
        arkadaErisim: "Qibla hino caggal mon",
        sagdaErisim: "Qibla hino {derece} darajaaji e ñaamo mon",
        soldaErisim: "Qibla hino {derece} darajaaji e nano mon",
        kabede: "Hiɗon e Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // yo
    public static let yo = KibleMetinleri(
        arkada: "Lẹ́yìn yín",
        saga: "Ọ̀tún {derece}°",
        sola: "Òsì {derece}°",
        hizali: "Ẹ dojú kọ Ƙiblah",
        arkadaErisim: "Ƙiblah wà lẹ́yìn yín",
        sagdaErisim: "Ƙiblah wà ní ìwọ̀n {derece} sí ọ̀tún yín",
        soldaErisim: "Ƙiblah wà ní ìwọ̀n {derece} sí òsì yín",
        kabede: "Ẹ wà ní Ka‘bah",
        mesafe: "km {km}",
        binlikAyirici: ","
    )

    // zh
    public static let zh = KibleMetinleri(
        arkada: "在身后",
        saga: "向右 {derece}°",
        sola: "向左 {derece}°",
        hizali: "您已面向朝向",
        arkadaErisim: "朝向在您身后",
        sagdaErisim: "朝向在您右侧{derece}度",
        soldaErisim: "朝向在您左侧{derece}度",
        kabede: "您在天房",
        mesafe: "{km}公里",
        binlikAyirici: ","
    )

    // ta
    public static let ta = KibleMetinleri(
        arkada: "பின்னால்",
        saga: "வலம் {derece}°",
        sola: "இடம் {derece}°",
        hizali: "நீங்கள் கிப்லா திசையை நோக்கியுள்ளீர்கள்",
        arkadaErisim: "கிப்லா உங்களுக்குப் பின்னால் உள்ளது",
        sagdaErisim: "கிப்லா உங்கள் வலப்புறம் {derece} பாகையில் உள்ளது",
        soldaErisim: "கிப்லா உங்கள் இடப்புறம் {derece} பாகையில் உள்ளது",
        kabede: "நீங்கள் கஅபாவில் இருக்கிறீர்கள்",
        mesafe: "{km} கி.மீ.",
        binlikAyirici: ","
    )

    // ml — JS `sozluk/ml/kible`
    public static let ml = KibleMetinleri(
        arkada: "പിന്നിൽ",
        saga: "വലത്ത് {derece}°",
        sola: "ഇടത്ത് {derece}°",
        hizali: "നിങ്ങൾ ഖിബ്‌ലയ്ക്ക് നേരെയാണ്",
        arkadaErisim: "ഖിബ്‌ല നിങ്ങളുടെ പിന്നിലാണ്",
        sagdaErisim: "ഖിബ്‌ല നിങ്ങളുടെ വലത്തോട്ട് {derece} ഡിഗ്രി",
        soldaErisim: "ഖിബ്‌ല നിങ്ങളുടെ ഇടത്തോട്ട് {derece} ഡിഗ്രി",
        kabede: "നിങ്ങൾ കഅ്ബയിലാണ്",
        mesafe: "{km} കി.മീ.",
        binlikAyirici: ","
    )

    // th
    public static let th = KibleMetinleri(
        arkada: "ด้านหลัง",
        saga: "ขวา {derece}°",
        sola: "ซ้าย {derece}°",
        hizali: "คุณหันไปทางกิบลัตแล้ว",
        arkadaErisim: "กิบลัตอยู่ด้านหลัง",
        sagdaErisim: "กิบลัตอยู่ทางขวา {derece} องศา",
        soldaErisim: "กิบลัตอยู่ทางซ้าย {derece} องศา",
        kabede: "คุณอยู่ที่กะอ์บะฮ์",
        mesafe: "{km} กม.",
        binlikAyirici: ","
    )

    // ko
    public static let ko = KibleMetinleri(
        arkada: "뒤쪽",
        saga: "오른쪽 {derece}°",
        sola: "왼쪽 {derece}°",
        hizali: "예배 방향을 바라보고 있습니다",
        arkadaErisim: "예배 방향이 뒤쪽에 있습니다",
        sagdaErisim: "예배 방향이 오른쪽으로 {derece}도 있습니다",
        soldaErisim: "예배 방향이 왼쪽으로 {derece}도 있습니다",
        kabede: "카으바에 있습니다",
        mesafe: "{km}km",
        binlikAyirici: ","
    )

    // vi (CLDR vi binlik ayırıcı ".")
    public static let vi = KibleMetinleri(
        arkada: "Phía sau",
        saga: "Phải {derece}°",
        sola: "Trái {derece}°",
        hizali: "Bạn đang hướng về Qiblah",
        arkadaErisim: "Qiblah ở phía sau bạn",
        sagdaErisim: "Qiblah lệch {derece} độ về bên phải",
        soldaErisim: "Qiblah lệch {derece} độ về bên trái",
        kabede: "Bạn đang ở Ka‘bah",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // pt (CLDR pt-PT binlik ayırıcı bölünmez boşluk)
    public static let pt = KibleMetinleri(
        arkada: "Atrás de si",
        saga: "Direita {derece}°",
        sola: "Esquerda {derece}°",
        hizali: "A Quibla está à sua frente",
        arkadaErisim: "A Quibla está atrás de si",
        sagdaErisim: "A Quibla está {derece} graus à sua direita",
        soldaErisim: "A Quibla está {derece} graus à sua esquerda",
        kabede: "Está na Caaba",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // it (CLDR it binlik ayırıcı "."): JS `sozluk/it/kible.ts > yon`
    public static let it = KibleMetinleri(
        arkada: "Alle sue spalle",
        saga: "Destra {derece}°",
        sola: "Sinistra {derece}°",
        hizali: "È in direzione della qibla",
        arkadaErisim: "La qibla è alle sue spalle",
        sagdaErisim: "La qibla è a {derece} gradi alla sua destra",
        soldaErisim: "La qibla è a {derece} gradi alla sua sinistra",
        kabede: "È alla Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // sv (CLDR sv binlik ayırıcı bölünmez boşluk)
    public static let sv = KibleMetinleri(
        arkada: "Bakom dig",
        saga: "Höger {derece}°",
        sola: "Vänster {derece}°",
        hizali: "Du är vänd mot Qibla",
        arkadaErisim: "Qibla är bakom dig",
        sagdaErisim: "Qibla är {derece} grader till höger om dig",
        soldaErisim: "Qibla är {derece} grader till vänster om dig",
        kabede: "Du är vid Kaba",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // uk (CLDR uk binlik ayırıcı bölünmez boşluk)
    public static let uk = KibleMetinleri(
        arkada: "Позаду вас",
        saga: "Праворуч {derece}°",
        sola: "Ліворуч {derece}°",
        hizali: "Ви стоїте обличчям до Кибли",
        arkadaErisim: "Кибла позаду вас",
        sagdaErisim: "Кибла на {derece}° праворуч від вас",
        soldaErisim: "Кибла на {derece}° ліворуч від вас",
        kabede: "Ви біля Кааби",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )

    // ro (CLDR ro binlik ayırıcı ".")
    public static let ro = KibleMetinleri(
        arkada: "În spate",
        saga: "Dreapta {derece}°",
        sola: "Stânga {derece}°",
        hizali: "Sunteți cu fața spre Qibla",
        arkadaErisim: "Qibla este în spate",
        sagdaErisim: "Qibla este la {derece} grade spre dreapta",
        soldaErisim: "Qibla este la {derece} grade spre stânga",
        kabede: "Sunteți la Kaaba",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // hr (CLDR hr binlik ayırıcı ".")
    public static let hr = KibleMetinleri(
        arkada: "Iza vas",
        saga: "Desno {derece}°",
        sola: "Lijevo {derece}°",
        hizali: "Okrenuti ste prema kibli",
        arkadaErisim: "Kibla je iza vas",
        sagdaErisim: "Kibla je {derece} stupnjeva udesno od vas",
        soldaErisim: "Kibla je {derece} stupnjeva ulijevo od vas",
        kabede: "Nalazite se kod Kabe",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // sr (CLDR sr binlik ayırıcı ".")
    public static let sr = KibleMetinleri(
        arkada: "Иза вас",
        saga: "Десно {derece}°",
        sola: "Лево {derece}°",
        hizali: "Окренути сте према кибли",
        arkadaErisim: "Кибла је иза вас",
        sagdaErisim: "Кибла је {derece}° десно од вас",
        soldaErisim: "Кибла је {derece}° лево од вас",
        kabede: "Код Кабе сте",
        mesafe: "{km} км",
        binlikAyirici: "."
    )

    // el (CLDR el binlik ayırıcı ".")
    public static let el = KibleMetinleri(
        arkada: "Πίσω σας",
        saga: "Δεξιά {derece}°",
        sola: "Αριστερά {derece}°",
        hizali: "Είστε στραμμένοι προς την Κίμπλα",
        arkadaErisim: "Η Κίμπλα είναι πίσω σας",
        sagdaErisim: "Η Κίμπλα είναι {derece} μοίρες στα δεξιά σας",
        soldaErisim: "Η Κίμπλα είναι {derece} μοίρες στα αριστερά σας",
        kabede: "Βρίσκεστε στην Κάαμπα",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // ku (CLDR ku binlik ayırıcı ".")
    public static let ku = KibleMetinleri(
        arkada: "Li pişt we",
        saga: "Rast {derece}°",
        sola: "Çep {derece}°",
        hizali: "Hûn ber bi Qibleyê ne",
        arkadaErisim: "Qible li pişt we ye",
        sagdaErisim: "Qible {derece} pile li milê we yê rastê ye",
        soldaErisim: "Qible {derece} pile li milê we yê çepê ye",
        kabede: "Hûn li Kabeyê ne",
        mesafe: "{km} km",
        binlikAyirici: "."
    )

    // tk (CLDR tk binlik ayırıcı bölünmez boşluk)
    public static let tk = KibleMetinleri(
        arkada: "Arkaňyzda",
        saga: "Saga {derece}°",
        sola: "Çepe {derece}°",
        hizali: "Kybla tarap durupsyňyz",
        arkadaErisim: "Kybla arkaňyzda",
        sagdaErisim: "Kybla sagyňyzda {derece} gradus",
        soldaErisim: "Kybla çepiňizde {derece} gradus",
        kabede: "Kagbadasyňyz",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // tt (CLDR tt binlik ayırıcı bölünmez boşluk)
    public static let tt = KibleMetinleri(
        arkada: "Артыгызда",
        saga: "Уңга {derece}°",
        sola: "Сулга {derece}°",
        hizali: "Сез кыйбла юнәлешендә",
        arkadaErisim: "Кыйбла артыгызда",
        sagdaErisim: "Кыйбла уң ягыгызда, {derece} градус",
        soldaErisim: "Кыйбла сул ягыгызда, {derece} градус",
        kabede: "Сез Кәгъбә янында",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )

    // sd (CLDR sd binlik ayırıcı ","; Arapça gibi, rakam çizimde yerelleşir)
    public static let sd = KibleMetinleri(
        arkada: "پٺيان",
        saga: "ساڄي {derece}°",
        sola: "کاٻي {derece}°",
        hizali: "اوهان جو منهن قبلي ڏانهن آهي",
        arkadaErisim: "قبلو اوهان جي پٺيان آهي",
        sagdaErisim: "قبلو اوهان جي ساڄي پاسي {derece} درجن تي آهي",
        soldaErisim: "قبلو اوهان جي کاٻي پاسي {derece} درجن تي آهي",
        kabede: "اوهان ڪعبي وٽ آهيو",
        mesafe: "{km} ڪلوميٽر",
        binlikAyirici: ","
    )

    // pl (CLDR pl binlik ayırıcı bölünmez boşluk)
    public static let pl = KibleMetinleri(
        arkada: "Za Tobą",
        saga: "W prawo {derece}°",
        sola: "W lewo {derece}°",
        hizali: "Kibla jest przed Tobą",
        arkadaErisim: "Kibla jest za Tobą",
        sagdaErisim: "Kibla jest {derece}° w prawo",
        soldaErisim: "Kibla jest {derece}° w lewo",
        kabede: "Jesteś przy Kaabie",
        mesafe: "{km} km",
        binlikAyirici: "\u{00A0}"
    )

    // ja (CLDR ja binlik ayırıcı ",")
    public static let ja = KibleMetinleri(
        arkada: "後ろ",
        saga: "右 {derece}°",
        sola: "左 {derece}°",
        hizali: "キブラの方向を向いています",
        arkadaErisim: "キブラは後ろです",
        sagdaErisim: "キブラは右に{derece}度です",
        soldaErisim: "キブラは左に{derece}度です",
        kabede: "カアバにいます",
        mesafe: "{km}km",
        binlikAyirici: ","
    )

    // gu — Gucaratça (beta): JS `sozluk/gu/kible.ts > yon`, mesafe `cami.kmIcinde` ("કિમી"); CLDR gu binlik ayırıcı ","
    public static let gu = KibleMetinleri(
        arkada: "પાછળ",
        saga: "જમણે {derece}°",
        sola: "ડાબે {derece}°",
        hizali: "તમે કિબ્લા તરફ છો",
        arkadaErisim: "કિબ્લા તમારી પાછળ છે",
        sagdaErisim: "કિબ્લા તમારી જમણી બાજુ {derece} અંશ પર છે",
        soldaErisim: "કિબ્લા તમારી ડાબી બાજુ {derece} અંશ પર છે",
        kabede: "તમે કાબા પાસે છો",
        mesafe: "{km} કિમી",
        binlikAyirici: ","
    )

    // bg (CLDR bg binlik ayırıcı bölünmez boşluk)
    public static let bg = KibleMetinleri(
        arkada: "Зад вас",
        saga: "Вдясно {derece}°",
        sola: "Вляво {derece}°",
        hizali: "Обърнати сте към киблята",
        arkadaErisim: "Киблята е зад вас",
        sagdaErisim: "Киблята е на {derece} градуса вдясно от вас",
        soldaErisim: "Киблята е на {derece} градуса вляво от вас",
        kabede: "Вие сте при Кабата",
        mesafe: "{km} км",
        binlikAyirici: "\u{00A0}"
    )

    // mk (CLDR mk binlik ayırıcı ".")
    public static let mk = KibleMetinleri(
        arkada: "Зад вас",
        saga: "Десно {derece}°",
        sola: "Лево {derece}°",
        hizali: "Свртени сте кон киблата",
        arkadaErisim: "Киблата е зад вас",
        sagdaErisim: "Киблата е {derece}° десно од вас",
        soldaErisim: "Киблата е {derece}° лево од вас",
        kabede: "Кај Кабата сте",
        mesafe: "{km} км",
        binlikAyirici: "."
    )

    // fil (CLDR fil binlik ayırıcı ",")
    public static let fil = KibleMetinleri(
        arkada: "Sa likod ninyo",
        saga: "Kanan {derece}°",
        sola: "Kaliwa {derece}°",
        hizali: "Nakaharap kayo sa Qiblah",
        arkadaErisim: "Nasa likod ninyo ang Qiblah",
        sagdaErisim: "Nasa {derece} digri sa inyong kanan ang Qiblah",
        soldaErisim: "Nasa {derece} digri sa inyong kaliwa ang Qiblah",
        kabede: "Nasa Kaaba kayo",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // ÇEVİRİ: te (CLDR te binlik ayırıcı ",")
    public static let te = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // ÇEVİRİ: kn (CLDR kn binlik ayırıcı ",")
    public static let kn = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // mr (CLDR mr binlik ayırıcı ","; rakam çizimde yerelleşir)
    public static let mr = KibleMetinleri(
        arkada: "मागे",
        saga: "उजवीकडे {derece}°",
        sola: "डावीकडे {derece}°",
        hizali: "तुमचे तोंड किब्लाकडे आहे",
        arkadaErisim: "किब्ला तुमच्या मागे आहे",
        sagdaErisim: "किब्ला तुमच्या उजवीकडे {derece} अंशांवर आहे",
        soldaErisim: "किब्ला तुमच्या डावीकडे {derece} अंशांवर आहे",
        kabede: "तुम्ही काबाजवळ आहात",
        mesafe: "{km} किमी",
        binlikAyirici: ","
    )

    // pa — JS `sozluk/pa/kible.ts > yon` (Şahmuki); binlik ayırıcı "," (JS `aktifDil.ts > BINLIK`, Urduca gibi; rakam çizimde yerelleşir)
    public static let pa = KibleMetinleri(
        arkada: "پچھے",
        saga: "سجے {derece}°",
        sola: "کھبے {derece}°",
        hizali: "تسیں قبلہ رُخ او",
        arkadaErisim: "قبلہ تہاڈے پچھے اے",
        sagdaErisim: "قبلہ تہاڈے سجے پاسے {derece} درجے تے اے",
        soldaErisim: "قبلہ تہاڈے کھبے پاسے {derece} درجے تے اے",
        kabede: "تسیں کعبہ دے کول او",
        mesafe: "{km} کلومیٹر",
        binlikAyirici: ","
    )

    // ÇEVİRİ: as (CLDR as binlik ayırıcı ","; rakam çizimde yerelleşir)
    public static let `as` = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // ÇEVİRİ: ne (CLDR ne binlik ayırıcı ","; rakam çizimde yerelleşir)
    public static let ne = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // ÇEVİRİ: si (CLDR si binlik ayırıcı ",")
    public static let si = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    // ÇEVİRİ: km (CLDR km binlik ayırıcı ",")
    public static let km = KibleMetinleri(
        arkada: "Behind you",
        saga: "Right {derece}°",
        sola: "Left {derece}°",
        hizali: "You are facing the Qibla",
        arkadaErisim: "The Qibla is behind you",
        sagdaErisim: "The Qibla is {derece} degrees to your right",
        soldaErisim: "The Qibla is {derece} degrees to your left",
        kabede: "You're at the Kaaba",
        mesafe: "{km} km",
        binlikAyirici: ","
    )

    public static let tablo: [String: KibleMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
        "zh": zh, "ta": ta, "ml": ml, "th": th, "ko": ko, "vi": vi,
        "pt": pt, "it": it, "sv": sv, "uk": uk, "ro": ro, "hr": hr, "sr": sr, "el": el,
        "ku": ku, "tk": tk, "tt": tt, "sd": sd, "pl": pl, "ja": ja, "gu": gu, "bg": bg, "mk": mk,
        "fil": fil, "te": te, "kn": kn, "mr": mr, "pa": pa, "as": `as`, "ne": ne, "si": si, "km": km,
    ]

    public static func dil(_ kod: String?) -> KibleMetinleri { tablo[ArayuzDili.coz(kod)] ?? tr }
}
