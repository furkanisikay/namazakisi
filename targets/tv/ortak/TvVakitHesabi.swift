import Foundation

// APPLE TV PANOSU — VAKIT HESABI (Android TV `cekirdek/VakitHesabi.kt` ikizi).
//
// Telefonla BIREBIR AYNI hesap: telefon `adhan` JS 4.4.3 + `turkiyeHesapParametreleri()`
// (= `CalculationMethod.Turkey()`, madhab VERILMEZ = Safii → ikindi ASR-I EVVEL, Diyanet
// takvimiyle ayni). Bu dosya adhan JS'in (MIT, Batoul Apps) Turkey yolunun Swift'e
// satir satir tasinmis hâlidir: ayni Meeus formulleri, ayni islem sirasi, JS `Date`'in
// milisaniye kirpmasi (TimeClip) ve "en yakin dakikaya yuvarlama" dahil. Sonuc epoch ms
// olarak telefonla ESIT olmalidir — tolerans YOK.
//
// Yalniz Turkey yolu tasindi: MoonsightingCommittee ozel durumlari, maghrib acisi ve kutup
// cozumu (Unresolved) telefonun kullandigi parametrelerde hic calismaz.
//
// Kilit: `targets/tv/test/main.swift` ↔ `tv/app/src/test/resources/vakit-fiksturu.json`
// (uretici `scripts/tv/tv-verisi-uret.js`, telefonun adhan JS'i) ↔ Kotlin `VakitHesabiTest`
// ↔ jest `TvVakitParitesi.test.ts`. Telefon hesabi degisirse betik yeniden kosulur.
//
// SAF: yalniz Foundation (Linux swiftc ile test edilir).

/// Alti vakit. `kod` telefonun `VakitAdi` anahtar uzayiyla aynidir.
public enum TvVakit: String, CaseIterable {
    case imsak, gunes, ogle, ikindi, aksam, yatsi

    /// Gorunen adlar SABIT (Turkce buyuk/kucuk harf donusumu yok).
    public var ad: String {
        switch self {
        case .imsak: return "İmsak"
        case .gunes: return "Güneş"
        case .ogle: return "Öğle"
        case .ikindi: return "İkindi"
        case .aksam: return "Akşam"
        case .yatsi: return "Yatsı"
        }
    }
}

/// Bir takvim gununun vakitleri (epoch ms, dakikaya yuvarlanmis).
public struct TvGunlukVakitler: Equatable {
    public let imsak: Int64
    public let gunes: Int64
    public let ogle: Int64
    public let ikindi: Int64
    public let aksam: Int64
    public let yatsi: Int64

    public init(imsak: Int64, gunes: Int64, ogle: Int64, ikindi: Int64, aksam: Int64, yatsi: Int64) {
        self.imsak = imsak
        self.gunes = gunes
        self.ogle = ogle
        self.ikindi = ikindi
        self.aksam = aksam
        self.yatsi = yatsi
    }

    public func saat(_ v: TvVakit) -> Int64 {
        switch v {
        case .imsak: return imsak
        case .gunes: return gunes
        case .ogle: return ogle
        case .ikindi: return ikindi
        case .aksam: return aksam
        case .yatsi: return yatsi
        }
    }
}

/// Takvim gunu (yerel). `ay` 1..12.
public struct TvTarih: Equatable, Hashable {
    public let yil: Int
    public let ay: Int
    public let gun: Int

    public init(yil: Int, ay: Int, gun: Int) {
        self.yil = yil
        self.ay = ay
        self.gun = gun
    }

    /// 1970-01-01'den bu yana gun (proleptik Gregoryen; Howard Hinnant algoritmasi).
    public var gunSayisi: Int64 {
        let y = Int64(ay <= 2 ? yil - 1 : yil)
        let era = (y >= 0 ? y : y - 399) / 400
        let yoe = y - era * 400
        let m = Int64(ay)
        let doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + Int64(gun) - 1
        let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy
        return era * 146_097 + doe - 719_468
    }

    public static func gunSayisindan(_ z0: Int64) -> TvTarih {
        let z = z0 + 719_468
        let era = (z >= 0 ? z : z - 146_096) / 146_097
        let doe = z - era * 146_097
        let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365
        let doy = doe - (365 * yoe + yoe / 4 - yoe / 100)
        let mp = (5 * doy + 2) / 153
        let d = doy - (153 * mp + 2) / 5 + 1
        let m = mp + (mp < 10 ? 3 : -9)
        let y = yoe + era * 400 + (m <= 2 ? 1 : 0)
        return TvTarih(yil: Int(y), ay: Int(m), gun: Int(d))
    }

    public func gunEkle(_ n: Int) -> TvTarih { TvTarih.gunSayisindan(gunSayisi + Int64(n)) }

    /// 1 = Pazartesi … 7 = Pazar (ISO). 1970-01-01 Persembe'dir.
    public var haftaGunu: Int {
        let r = Int((gunSayisi + 3) % 7)
        return (r < 0 ? r + 7 : r) + 1
    }

    /// "YYYY-MM-DD"
    public var iso: String {
        func iki(_ n: Int) -> String { n < 10 ? "0\(n)" : "\(n)" }
        return "\(yil)-\(iki(ay))-\(iki(gun))"
    }
}

/// adhan JS'in Turkey yolu. Sayilar JS ile ayni islem sirasiyla yazilir (bit esitligi).
public enum TvVakitHesabi {
    // CalculationMethod.Turkey(): fajr 18°, isha 17°; methodAdjustments (dakika).
    static let fajrAcisi = 18.0
    static let ishaAcisi = 17.0
    static let gunesDuzeltme = -7.0
    static let ogleDuzeltme = 5.0
    static let ikindiDuzeltme = 4.0
    static let aksamDuzeltme = 7.0
    /// Madhab.Shafi (asr-i evvel) golge uzunlugu.
    static let golge = 1.0
    /// HighLatitudeRule.MiddleOfTheNight → gecenin yarisi.
    static let geceOrani = 0.5

    public static func hesapla(lat: Double, lng: Double, tarih: TvTarih) -> TvGunlukVakitler {
        let gozlemci = (lat: lat, lng: lng)
        let gunes = GunesZamani(tarih: tarih, lat: gozlemci.lat, lng: gozlemci.lng)
        let ogleT = utc(gunes.transit, tarih)
        let dogusT = utc(gunes.dogus, tarih)
        let batisT = utc(gunes.batis, tarih)
        let yarin = tarih.gunEkle(1)
        let yarinGunes = GunesZamani(tarih: yarin, lat: lat, lng: lng)
        let ikindiT = utc(gunes.ikindi(golge: golge), tarih)
        let yarinDogus = utc(yarinGunes.dogus, yarin)
        let gece = (yarinDogus - batisT) / 1000

        var fajr = utc(gunes.saatAcisi(-1 * fajrAcisi, transitSonrasi: false), tarih)
        let guvenliFajr = saniyeEkle(dogusT, -(geceOrani * gece))
        if fajr.isNaN || guvenliFajr > fajr { fajr = guvenliFajr }

        var isha = utc(gunes.saatAcisi(-1 * ishaAcisi, transitSonrasi: true), tarih)
        let guvenliIsha = saniyeEkle(batisT, geceOrani * gece)
        if isha.isNaN || guvenliIsha < isha { isha = guvenliIsha }

        return TvGunlukVakitler(
            imsak: tamsayi(yuvarla(dakikaEkle(fajr, 0))),
            gunes: tamsayi(yuvarla(dakikaEkle(dogusT, gunesDuzeltme))),
            ogle: tamsayi(yuvarla(dakikaEkle(ogleT, ogleDuzeltme))),
            ikindi: tamsayi(yuvarla(dakikaEkle(ikindiT, ikindiDuzeltme))),
            aksam: tamsayi(yuvarla(dakikaEkle(batisT, aksamDuzeltme))),
            yatsi: tamsayi(yuvarla(dakikaEkle(isha, 0)))
        )
    }

    // MARK: - JS Date taklitleri (ms, Double; NaN = gecersiz tarih)

    /// JS `TimeClip`: kesirli ms sifira dogru kirpilir.
    static func kirp(_ t: Double) -> Double { t.isFinite ? t.rounded(.towardZero) : .nan }

    static func saniyeEkle(_ t: Double, _ sn: Double) -> Double { kirp(t + sn * 1000) }
    static func dakikaEkle(_ t: Double, _ dk: Double) -> Double { saniyeEkle(t, dk * 60) }

    /// `roundedMinute(date, Rounding.Nearest)`.
    static func yuvarla(_ t: Double) -> Double {
        guard t.isFinite else { return .nan }
        let ms = t - 86_400_000 * (t / 86_400_000).rounded(.down)
        let sn = (ms / 1000).rounded(.down).truncatingRemainder(dividingBy: 60)
        let ofset = sn >= 30 ? 60 - sn : -1 * sn
        return saniyeEkle(t, ofset)
    }

    static func tamsayi(_ t: Double) -> Int64 { t.isFinite ? Int64(t) : 0 }

    /// `new TimeComponents(num).utcDate(y, m, d)`.
    static func utc(_ num: Double, _ tarih: TvTarih) -> Double {
        guard num.isFinite else { return .nan }
        let saat = num.rounded(.down)
        let dakika = ((num - saat) * 60).rounded(.down)
        let saniye = ((num - (saat + dakika / 60)) * 60 * 60).rounded(.down)
        let gun = Double(tarih.gunSayisi)
        return ((gun * 24 + saat) * 60 + dakika) * 60_000 + saniye * 1000
    }
}

// MARK: - Astronomi (adhan `Astronomical`, `SolarCoordinates`, `SolarTime`)

enum Astro {
    static func rad(_ d: Double) -> Double { d * Double.pi / 180.0 }
    static func der(_ r: Double) -> Double { r * 180.0 / Double.pi }
    static func olcekle(_ n: Double, _ azami: Double) -> Double { n - azami * (n / azami).rounded(.down) }
    static func sar(_ a: Double) -> Double { olcekle(a, 360.0) }
    /// JS `Math.round` (yarim → +∞).
    static func jsYuvarla(_ x: Double) -> Double { (x + 0.5).rounded(.down) }
    static func ceyrekKaydir(_ a: Double) -> Double {
        if a >= -180 && a <= 180 { return a }
        return a - 360 * jsYuvarla(a / 360)
    }

    static func ortalamaGunesBoylami(_ T: Double) -> Double {
        let L0 = 280.4664567 + 36000.76983 * T + 0.0003032 * pow(T, 2)
        return sar(L0)
    }
    static func ortalamaAyBoylami(_ T: Double) -> Double { sar(218.3165 + 481267.8813 * T) }
    static func ayDugumBoylami(_ T: Double) -> Double {
        let O = 125.04452 - 1934.136261 * T + 0.0020708 * pow(T, 2) + pow(T, 3) / 450000
        return sar(O)
    }
    static func ortalamaGunesAnomalisi(_ T: Double) -> Double {
        sar(357.52911 + 35999.05029 * T - 0.0001537 * pow(T, 2))
    }
    static func merkezDenklemi(_ T: Double, _ M: Double) -> Double {
        let Mrad = rad(M)
        let t1 = (1.914602 - 0.004817 * T - 0.000014 * pow(T, 2)) * sin(Mrad)
        let t2 = (0.019993 - 0.000101 * T) * sin(2 * Mrad)
        let t3 = 0.000289 * sin(3 * Mrad)
        return t1 + t2 + t3
    }
    static func gorunurGunesBoylami(_ T: Double, _ L0: Double) -> Double {
        let boylam = L0 + merkezDenklemi(T, ortalamaGunesAnomalisi(T))
        let Omega = 125.04 - 1934.136 * T
        let Lambda = boylam - 0.00569 - 0.00478 * sin(rad(Omega))
        return sar(Lambda)
    }
    static func ortalamaEgiklik(_ T: Double) -> Double {
        23.439291 - 0.013004167 * T - 0.0000001639 * pow(T, 2) + 0.0000005036 * pow(T, 3)
    }
    static func gorunurEgiklik(_ T: Double, _ E0: Double) -> Double {
        let O = 125.04 - 1934.136 * T
        return E0 + 0.00256 * cos(rad(O))
    }
    static func ortalamaYildizZamani(_ T: Double) -> Double {
        let JD = T * 36525 + 2451545.0
        let Theta = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * pow(T, 2) - pow(T, 3) / 38710000
        return sar(Theta)
    }
    static func boylamNutasyonu(_ L0: Double, _ Lp: Double, _ O: Double) -> Double {
        let t1 = -17.2 / 3600 * sin(rad(O))
        let t2 = 1.32 / 3600 * sin(2 * rad(L0))
        let t3 = 0.23 / 3600 * sin(2 * rad(Lp))
        let t4 = 0.21 / 3600 * sin(2 * rad(O))
        return t1 - t2 - t3 + t4
    }
    static func egiklikNutasyonu(_ L0: Double, _ Lp: Double, _ O: Double) -> Double {
        let t1 = 9.2 / 3600 * cos(rad(O))
        let t2 = 0.57 / 3600 * cos(2 * rad(L0))
        let t3 = 0.1 / 3600 * cos(2 * rad(Lp))
        let t4 = 0.09 / 3600 * cos(2 * rad(O))
        return t1 + t2 + t3 - t4
    }
    static func yukseklik(_ Phi: Double, _ delta: Double, _ H: Double) -> Double {
        let t1 = sin(rad(Phi)) * sin(rad(delta))
        let t2 = cos(rad(Phi)) * cos(rad(delta)) * cos(rad(H))
        return der(asin(t1 + t2))
    }
    static func yaklasikTransit(_ L: Double, _ Theta0: Double, _ a2: Double) -> Double {
        let Lw = L * -1
        return olcekle((a2 + Lw - Theta0) / 360, 1)
    }
    static func ara(_ y2: Double, _ y1: Double, _ y3: Double, _ n: Double) -> Double {
        let a = y2 - y1
        let b = y3 - y2
        let c = b - a
        return y2 + n / 2 * (a + b + n * c)
    }
    static func araAci(_ y2: Double, _ y1: Double, _ y3: Double, _ n: Double) -> Double {
        let a = sar(y2 - y1)
        let b = sar(y3 - y2)
        let c = b - a
        return y2 + n / 2 * (a + b + n * c)
    }
    static func duzeltilmisTransit(_ m0: Double, _ L: Double, _ Theta0: Double, _ a2: Double, _ a1: Double, _ a3: Double) -> Double {
        let Lw = L * -1
        let Theta = sar(Theta0 + 360.985647 * m0)
        let a = sar(araAci(a2, a1, a3, m0))
        let H = ceyrekKaydir(Theta - Lw - a)
        let dm = H / -360
        return (m0 + dm) * 24
    }
    // swiftlint:disable:next function_parameter_count
    static func duzeltilmisSaatAcisi(
        _ m0: Double, _ h0: Double, _ lat: Double, _ lng: Double, _ sonra: Bool,
        _ Theta0: Double, _ a2: Double, _ a1: Double, _ a3: Double,
        _ d2: Double, _ d1: Double, _ d3: Double
    ) -> Double {
        let Lw = lng * -1
        let t1 = sin(rad(h0)) - sin(rad(lat)) * sin(rad(d2))
        let t2 = cos(rad(lat)) * cos(rad(d2))
        let H0 = der(acos(t1 / t2))
        let m = sonra ? m0 + H0 / 360 : m0 - H0 / 360
        let Theta = sar(Theta0 + 360.985647 * m)
        let a = sar(araAci(a2, a1, a3, m))
        let delta = ara(d2, d1, d3, m)
        let H = Theta - Lw - a
        let h = yukseklik(lat, delta, H)
        let t3 = h - h0
        let t4 = 360 * cos(rad(delta)) * cos(rad(lat)) * sin(rad(H))
        let dm = t3 / t4
        return (m + dm) * 24
    }
    static func julyenGun(_ yil: Int, _ ay: Int, _ gun: Int) -> Double {
        let Y = Double(ay > 2 ? yil : yil - 1)
        let M = Double(ay > 2 ? ay : ay + 12)
        let D = Double(gun) + 0 / 24
        let A = (Y / 100).rounded(.towardZero)
        let B = (2 - A + (A / 4).rounded(.towardZero)).rounded(.towardZero)
        let i0 = (365.25 * (Y + 4716)).rounded(.towardZero)
        let i1 = (30.6001 * (M + 1)).rounded(.towardZero)
        return i0 + i1 + D + B - 1524.5
    }
    static func julyenYuzyil(_ jd: Double) -> Double { (jd - 2451545.0) / 36525 }
}

struct GunesKoordinati {
    let egim: Double
    let sagAcilim: Double
    let gorunurYildizZamani: Double

    init(julyenGun: Double) {
        let T = Astro.julyenYuzyil(julyenGun)
        let L0 = Astro.ortalamaGunesBoylami(T)
        let Lp = Astro.ortalamaAyBoylami(T)
        let Omega = Astro.ayDugumBoylami(T)
        let Lambda = Astro.rad(Astro.gorunurGunesBoylami(T, L0))
        let Theta0 = Astro.ortalamaYildizZamani(T)
        let dPsi = Astro.boylamNutasyonu(L0, Lp, Omega)
        let dEpsilon = Astro.egiklikNutasyonu(L0, Lp, Omega)
        let Epsilon0 = Astro.ortalamaEgiklik(T)
        let EpsilonG = Astro.rad(Astro.gorunurEgiklik(T, Epsilon0))
        egim = Astro.der(asin(sin(EpsilonG) * sin(Lambda)))
        sagAcilim = Astro.sar(Astro.der(atan2(cos(EpsilonG) * sin(Lambda), cos(Lambda))))
        gorunurYildizZamani = Theta0 + dPsi * 3600 * cos(Astro.rad(Epsilon0 + dEpsilon)) / 3600
    }
}

struct GunesZamani {
    let lat: Double
    let lng: Double
    let gunes: GunesKoordinati
    let onceki: GunesKoordinati
    let sonraki: GunesKoordinati
    let yaklasikTransit: Double
    let transit: Double
    let dogus: Double
    let batis: Double

    init(tarih: TvTarih, lat: Double, lng: Double) {
        self.lat = lat
        self.lng = lng
        let jd = Astro.julyenGun(tarih.yil, tarih.ay, tarih.gun)
        gunes = GunesKoordinati(julyenGun: jd)
        onceki = GunesKoordinati(julyenGun: jd - 1)
        sonraki = GunesKoordinati(julyenGun: jd + 1)
        let m0 = Astro.yaklasikTransit(lng, gunes.gorunurYildizZamani, gunes.sagAcilim)
        let ufuk = -50.0 / 60.0
        yaklasikTransit = m0
        transit = Astro.duzeltilmisTransit(m0, lng, gunes.gorunurYildizZamani, gunes.sagAcilim, onceki.sagAcilim, sonraki.sagAcilim)
        dogus = Astro.duzeltilmisSaatAcisi(
            m0, ufuk, lat, lng, false, gunes.gorunurYildizZamani, gunes.sagAcilim, onceki.sagAcilim,
            sonraki.sagAcilim, gunes.egim, onceki.egim, sonraki.egim
        )
        batis = Astro.duzeltilmisSaatAcisi(
            m0, ufuk, lat, lng, true, gunes.gorunurYildizZamani, gunes.sagAcilim, onceki.sagAcilim,
            sonraki.sagAcilim, gunes.egim, onceki.egim, sonraki.egim
        )
    }

    func saatAcisi(_ aci: Double, transitSonrasi: Bool) -> Double {
        Astro.duzeltilmisSaatAcisi(
            yaklasikTransit, aci, lat, lng, transitSonrasi, gunes.gorunurYildizZamani, gunes.sagAcilim,
            onceki.sagAcilim, sonraki.sagAcilim, gunes.egim, onceki.egim, sonraki.egim
        )
    }

    func ikindi(golge: Double) -> Double {
        let tanjant = abs(lat - gunes.egim)
        let ters = golge + tan(Astro.rad(tanjant))
        let aci = Astro.der(atan(1.0 / ters))
        return saatAcisi(aci, transitSonrasi: true)
    }
}
