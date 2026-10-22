import Foundation

/**
 * "BUGUN" GUN KADRANI (Apple Watch, #285 yeniden tasarim) — SAF (yalniz Foundation).
 *
 * Gunun 24 saati bir halkadir (gece yarisi tepede, saat yonunde). Her vakit penceresi
 * halkada bir YAY, girisi bir NOKTA olur; simdiki an ince bir isaret. Burada yalniz
 * SAYI uretilir (yay kesirleri, odak sirasi); cizim `targets/saat/BugunSayfasi.swift`'te.
 *
 * Pencereler (widget kod uzayi): sabah [imsak → gunes], ogle [ogle → ikindi],
 * ikindi [ikindi → aksam], aksam [aksam → yatsi], yatsi [yatsi → ertesi imsak].
 * Gunes → ogle arasi bilincli BOS kalir (kilinacak farz yok, kerahat de iceren bir aralik).
 */
public struct SaatKadranDilimi: Equatable {
    /// Widget kodu (`sabah`, `ogle`, `ikindi`, `aksam`, `yatsi`).
    public let kod: String
    public let basMs: Int64
    public let bitisMs: Int64
}

public enum SaatKadran {
    /// Kadranin bes kilinabilir vakti, sirali.
    public static let kodlar = ["sabah", "ogle", "ikindi", "aksam", "yatsi"]

    /// Gunun bes vakit penceresi. Yatsinin sonu ERTESI gunun imsakidir; yoksa gece yarisi.
    public static func dilimler(yuk: SaatYuku, tarih: String, saatDilimi: TimeZone = .current) -> [SaatKadranDilimi] {
        guard let i = yuk.gunler.firstIndex(where: { $0.tarih == tarih }) else { return [] }
        let v = yuk.gunler[i].vakitler
        let ertesiImsak: Int64? = i + 1 < yuk.gunler.count ? yuk.gunler[i + 1].vakitler["imsak"] : nil
        guard let imsak = v["imsak"], let gunes = v["gunes"], let ogle = v["ogle"],
              let ikindi = v["ikindi"], let aksam = v["aksam"], let yatsi = v["yatsi"] else { return [] }
        let yatsiSonu = ertesiImsak ?? (geceYarisi(sonrasi: yatsi, saatDilimi: saatDilimi))
        return [
            SaatKadranDilimi(kod: "sabah", basMs: imsak, bitisMs: gunes),
            SaatKadranDilimi(kod: "ogle", basMs: ogle, bitisMs: ikindi),
            SaatKadranDilimi(kod: "ikindi", basMs: ikindi, bitisMs: aksam),
            SaatKadranDilimi(kod: "aksam", basMs: aksam, bitisMs: yatsi),
            SaatKadranDilimi(kod: "yatsi", basMs: yatsi, bitisMs: yatsiSonu),
        ]
    }

    /// Anin gun icindeki kesri [0, 1): yerel gece yarisindan itibaren (0 = tepede).
    public static func kesir(_ ms: Int64, saatDilimi: TimeZone = .current) -> Double {
        let saniye = Double(ms) / 1000.0
        let yerel = saniye + Double(saatDilimi.secondsFromGMT(for: Date(timeIntervalSince1970: saniye)))
        let gun = 86_400.0
        let k = yerel.truncatingRemainder(dividingBy: gun) / gun
        return k < 0 ? k + 1 : k
    }

    /**
     * Bir pencerenin halkadaki yay parcalari (kesir). Gece yarisini asan pencere (yatsi)
     * IKI parcaya bolunur — `Circle().trim` 1'i asan araligi cizemez. 24 saatten uzun
     * pencere tum halkadir.
     */
    public static func yaylar(_ d: SaatKadranDilimi, saatDilimi: TimeZone = .current) -> [ClosedRange<Double>] {
        if d.bitisMs - d.basMs >= 86_400_000 { return [0...1] }
        if d.bitisMs <= d.basMs { return [] }
        let b = kesir(d.basMs, saatDilimi: saatDilimi)
        let s = kesir(d.bitisMs, saatDilimi: saatDilimi)
        if s > b { return [b...s] }
        return [b...1, 0...s]
    }

    /// Taç / dokunusla odak: kod sirasindaki indeks [0, 4]. Gecersiz kod 0.
    public static func indeks(_ kod: String?) -> Int {
        guard let kod, let i = kodlar.firstIndex(of: kod) else { return 0 }
        return i
    }

    /// Tac degerini (surekli) odak indeksine cevirir, [0, 4]'e kenetlenir.
    public static func odak(tac: Double) -> Int {
        guard tac.isFinite else { return 0 }
        return min(max(Int(tac.rounded()), 0), kodlar.count - 1)
    }

    private static func geceYarisi(sonrasi ms: Int64, saatDilimi: TimeZone) -> Int64 {
        let k = kesir(ms, saatDilimi: saatDilimi)
        return ms + Int64(((1 - k) * 86_400_000).rounded())
    }
}
