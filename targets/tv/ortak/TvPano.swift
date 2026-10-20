import Foundation

// APPLE TV PANOSU — saf durum, kerahat, bicim (Android TV `cekirdek/{PanoDurumu,Kerahat,Bicim,
// Kaydirma,IlListesi}.kt` ikizi). Zaman ve saat dilimi ENJEKTE edilir; SwiftUI import ETMEZ.
// Kural degisirse iki dil BIRLIKTE degisir (testler: Kotlin `PanoDurumuTest`, Swift
// `targets/tv/test/main.swift`).

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
    public func gorunenAd(_ v: TvVakit) -> String { cuma && v == .ogle ? "Cuma" : v.ad }
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

/// Metin bicimleri. Ay/gun adlari SABIT (TV'nin sistem dili Ingilizce olabilir).
public enum TvBicim {
    static let aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    static let gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

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

    /// "13 Ekim 2026, Salı"
    public static func tarih(_ g: TvTarih) -> String {
        "\(g.gun) \(aylar[g.ay - 1]) \(g.yil), \(gunler[g.haftaGunu - 1])"
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
