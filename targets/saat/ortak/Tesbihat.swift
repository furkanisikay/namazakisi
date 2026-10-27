import Foundation

/**
 * NAMAZ SONRASI TESBIHAT SAYACI (issue #285, Wear #293 ikizi) — SAF (yalniz Foundation).
 *
 * Kotlin `wear/.../cekirdek/Tesbihat.kt` ile AYNI durum makinesi: Subhanallah x33 →
 * Elhamdulillah x33 → Allahu ekber x33 → tehlil x1 (toplam 100; Muslim, Mesacid 146).
 * Durumun tamami TEK sayidir (`toplam`, 0..100) → kalicilik tek tamsayi, geri alma tek
 * eksiltme. Saatte BAGIMSIZDIR: telefona, yuke ve yedege girmez.
 */
public enum Tesbihat {
    public static let fazHedefi = 33
    public static let toplamHedef = 100
    /// Son dokunustan bu kadar sonra acilan oturum eskimistir → sifirdan baslar (Wear ile ayni).
    public static let eskimeMs: Int64 = 90 * 60 * 1000
    /// Zikir adlari, tehlil metni ve kunye CEVIRI DEGIL, o dilin Musluman toplulugunun yaygin
    /// yazimidir (sahip karari 2026-10-25): en "Subhanallah", ru "Субханаллах". Tablo
    /// `SaatMetinleri` bloklarinda; bilinmeyen dil Turkceye duser (`ArayuzDili.coz`).
    /// Varsayilan dil Turkce (eski `tehlilMetni` / `kaynak` sabitlerinin degeri).
    public static func tehlilMetni(dil: String = ArayuzDili.varsayilan) -> String {
        return SaatMetinleri.dil(dil).tehlilMetni
    }

    public static func kaynak(dil: String = ArayuzDili.varsayilan) -> String {
        return SaatMetinleri.dil(dil).tesbihatKaynagi
    }

    public enum Faz: Int, CaseIterable, Equatable {
        case subhanallah, elhamdulillah, allahuEkber, tehlil

        /// Zikrin o dildeki yaygin okunusu ("Sübhânallah" / "Subhanallah"); bilinmeyen dil Turkce.
        public func ad(dil: String = ArayuzDili.varsayilan) -> String {
            let m = SaatMetinleri.dil(dil)
            switch self {
            case .subhanallah: return m.zikirSubhanallah
            case .elhamdulillah: return m.zikirElhamdulillah
            case .allahuEkber: return m.zikirAllahuEkber
            case .tehlil: return m.zikirTehlil
            }
        }

        public var hedef: Int { self == .tehlil ? 1 : Tesbihat.fazHedefi }
        public var baslangic: Int { rawValue * Tesbihat.fazHedefi }
    }

    public enum Olay: Equatable {
        case yok, tik, fazTamam, bitti, geriAlindi
    }

    public struct Durum: Equatable {
        public let toplam: Int

        public init(toplam: Int = 0) {
            self.toplam = min(max(toplam, 0), Tesbihat.toplamHedef)
        }

        public var tamamMi: Bool { toplam >= Tesbihat.toplamHedef }
        /// Tamamlaninca son faz (tehlil) gosterilir.
        public var faz: Faz { Faz.allCases.last { toplam >= $0.baslangic } ?? .subhanallah }
        public var fazSayisi: Int { toplam - faz.baslangic }
        public var fazIlerlemesi: Double { Double(fazSayisi) / Double(faz.hedef) }
    }

    public static func say(_ d: Durum) -> (durum: Durum, olay: Olay) {
        if d.tamamMi { return (d, .yok) }
        let yeni = Durum(toplam: d.toplam + 1)
        if yeni.tamamMi { return (yeni, .bitti) }
        return (yeni, yeni.faz != d.faz ? .fazTamam : .tik)
    }

    public static func geriAl(_ d: Durum) -> (durum: Durum, olay: Olay) {
        if d.toplam == 0 { return (d, .yok) }
        return (Durum(toplam: d.toplam - 1), .geriAlindi)
    }

    /// Diskten okunan oturum surmekte mi? Bozuk sayi sifira duser; saat geri alindiysa
    /// sure olculemez → oturum KORUNUR (Kotlin `yukle` ile ayni).
    public static func yukle(toplam: Int, sonDokunusMs: Int64, simdiMs: Int64) -> Durum {
        guard (1...toplamHedef).contains(toplam) else { return Durum() }
        if simdiMs >= sonDokunusMs && simdiMs - sonDokunusMs > eskimeMs { return Durum() }
        return Durum(toplam: toplam)
    }

    /// Ekran okuyucu / kisa durum: "Elhamdülillâh, 12/33" (en "Alhamdulillah, 12/33"; noktali ayrac yok).
    public static func kisaMetin(_ d: Durum, dil: String = ArayuzDili.varsayilan) -> String {
        return "\(d.faz.ad(dil: dil)), \(d.fazSayisi)/\(d.faz.hedef)"
    }
}

/**
 * Digital Crown donusunu sayima cevirir (Kotlin `TacBiriktirici` ikizi):
 *  - YON ANLAMLIDIR: pozitif donus (saat yonu / yukari) SAYAR, ters donus son sayimi
 *    GERI ALIR (eskiden iki yon de sayiyordu),
 *  - ayni YONDE `esik` kadar birikim bir adim uretir; yon degisince birikim sifirlanir,
 *  - bir olay en fazla BIR adim uretir (hizli savurus tek adim),
 *  - iki adim arasi en az `enAzAralikMs`, yonden bagimsiz (ayni centigin iki olayi cift saymasin).
 */
public enum TacAdimi: Equatable { case yok, say, geriAl }

public final class TacBiriktirici {
    public static let enAzAralikMs: Int64 = 120

    private let esik: Double
    private let enAzAralik: Int64
    private var birikim: Double = 0
    private var sonAdimMs: Int64?

    public init(esik: Double, enAzAralikMs: Int64 = TacBiriktirici.enAzAralikMs) {
        self.esik = esik
        self.enAzAralik = enAzAralikMs
    }

    public func olay(_ delta: Double, zamanMs: Int64) -> TacAdimi {
        if delta == 0 || delta.isNaN { return .yok }
        if birikim != 0 && (delta > 0) != (birikim > 0) { birikim = 0 }
        birikim += delta
        if abs(birikim) < esik { return .yok }
        let yon: TacAdimi = birikim > 0 ? .say : .geriAl
        birikim = 0
        if let son = sonAdimMs, zamanMs >= son, zamanMs - son < enAzAralik { return .yok }
        sonAdimMs = zamanMs
        return yon
    }
}
