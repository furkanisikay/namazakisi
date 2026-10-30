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
/// id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo; cevrilmemis dil Ingilizce kopya (`// ÇEVİRİ: <kod>`).
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

    // ÇEVİRİ: ff
    public static let ff = KibleMetinleri(
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

    public static let tablo: [String: KibleMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
    ]

    public static func dil(_ kod: String?) -> KibleMetinleri { tablo[ArayuzDili.coz(kod)] ?? tr }
}
