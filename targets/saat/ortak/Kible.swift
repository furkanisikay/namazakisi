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
        let en = ArayuzDili.coz(dil) == "en"
        switch donus(hedef) {
        case .arkada: return en ? "Behind you" : "Arkanızda"
        case .saga: return en ? "Right \(donusDerecesi(hedef))°" : "Sağa \(donusDerecesi(hedef))°"
        case .sola: return en ? "Left \(donusDerecesi(hedef))°" : "Sola \(donusDerecesi(hedef))°"
        }
    }

    /// Ekran okuyucu: 10°'lik adim (her olayda okunmasin), kibar "siz". Ingilizce karsilik
    /// JS `sozluk/en/kible.ts > yon` ile ayni kalip.
    public static func erisimMetni(_ hedef: Double, hizali: Bool, dil: String = ArayuzDili.varsayilan) -> String {
        let en = ArayuzDili.coz(dil) == "en"
        if hizali { return en ? "You are facing the Qibla" : "Kıble yönündesiniz" }
        let s = sapma(hedef)
        if s >= 175.0 { return en ? "The Qibla is behind you" : "Kıble arkanızda" }
        let adim = max(10, Int((s / 10.0).rounded()) * 10)
        let sagda = dereceSar(hedef) <= 180.0
        if en { return "The Qibla is \(adim) degrees to your \(sagda ? "right" : "left")" }
        return "Kıble \(adim) derece \(sagda ? "sağınızda" : "solunuzda")"
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
        let en = ArayuzDili.coz(dil) == "en"
        if km < 10 { return en ? "You're at the Kaaba" : "Kâbe'desiniz" }
        let yuvarlak = Int((km / 10).rounded()) * 10
        var rakam = String(yuvarlak)
        var parcalar: [String] = []
        while rakam.count > 3 {
            parcalar.insert(String(rakam.suffix(3)), at: 0)
            rakam = String(rakam.dropLast(3))
        }
        parcalar.insert(rakam, at: 0)
        return parcalar.joined(separator: en ? "," : ".") + " km"
    }

    private static func radyan(_ d: Double) -> Double { d * Double.pi / 180.0 }
    private static func derece(_ r: Double) -> Double { r * 180.0 / Double.pi }
}
