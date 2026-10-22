import Foundation

/**
 * SIRI / KISAYOLLAR VAKIT KARARI — SAF (yalniz Foundation).
 *
 * `src/core/siri/siriKarari.ts` ve `src/core/widget/widgetYuku.ts > aktifVakitBul`'un
 * Swift IKIZIDIR. Kurallar ortak fikstürlerle kilitlidir:
 *   - `android/app/src/test/resources/widget-ornek.json` (JS + Kotlin + Swift)
 *   - `modules/expo-siri-kisayollari/test/siri-ornek.json` (JS + Swift)
 * Swift tarafini `test/main.swift` dogrular (macOS CI'da `swiftc`, iOS SDK gerekmez;
 * bu dosya bu yuzden UIKit/AppIntents IMPORT ETMEZ).
 *
 * Kural ya da metin degisirse TS + Swift + fikstur BIRLIKTE degisir.
 */

/// Widget yukundeki tek giris: vakit kodu (`sabah`, `gunes`, `ogle`...), giris ani, NAMAZ gunu.
public struct SiriVakitAni: Codable, Equatable {
    public let vakit: String
    public let ms: Int64
    public let tarih: String

    public init(vakit: String, ms: Int64, tarih: String) {
        self.vakit = vakit
        self.ms = ms
        self.tarih = tarih
    }
}

/// JS `widgetVerisiOlustur` ciktisi (dun + 8 gun). `surum` bilgi icindir.
public struct SiriCizelge: Codable {
    public let surum: Int?
    public let tarih: String?
    public let vakitler: [SiriVakitAni]
}

/// Kuyrukta bekleyen (uygulamada henuz islenmemis) "Kildim": KAYIT vakit kodu (`imsak`...).
public struct SiriBekleyenKildim: Codable, Equatable {
    public let tarih: String
    public let vakit: String

    public init(tarih: String, vakit: String) {
        self.tarih = tarih
        self.vakit = vakit
    }
}

public struct SiriAktifVakitDurumu: Equatable {
    public let aktif: SiriVakitAni?
    public let bitisMs: Int64?
    public let sonraki: SiriVakitAni?
}

public enum SiriKildimKarari: Equatable {
    case aday(vakit: SiriVakitAni, kayitVakti: String, ad: String)
    case zatenKilindi(ad: String)
    case vakitYok(siradaki: SiriVakitAni?)
}

public enum VakitKarari {
    /// Isaretlenebilir vakitler (gunes bir namaz degildir).
    public static let kilinabilir: [String] = ["sabah", "ogle", "ikindi", "aksam", "yatsi"]

    public static let konumYokMetni = "Vakitleri hesaplayabilmek için uygulamayı açıp konumunuzu ayarlayın."
    public static let veriEskiMetni = "Vakit bilgisi eskimiş. Güncellemek için uygulamayı bir kez açın."

    /// Widget kodu → kayit/kuyruk kodu. `sabah` kayitta `imsak`'tir; gunes namaz degildir.
    public static func kayitVakti(_ kod: String) -> String? {
        switch kod {
        case "sabah": return "imsak"
        case "ogle", "ikindi", "aksam", "yatsi": return kod
        default: return nil
        }
    }

    /// Gorunen ad (`NamazAdi` degerleri ile ayni).
    public static func gorunenAd(_ kod: String) -> String {
        switch kod {
        case "sabah": return "Sabah"
        case "ogle": return "Öğle"
        case "ikindi": return "İkindi"
        case "aksam": return "Akşam"
        case "yatsi": return "Yatsı"
        default: return ""
        }
    }

    /// JS `aktifVakitBul` / Kotlin `VakitCizelgesi.durumHesapla` ikizi.
    public static func aktifVakitBul(_ vakitler: [SiriVakitAni], simdiMs: Int64) -> SiriAktifVakitDurumu {
        let sirali = vakitler.sorted { $0.ms < $1.ms }
        var sonIndeks = -1
        for (i, v) in sirali.enumerated() where v.ms <= simdiMs {
            sonIndeks = i
        }
        let sonraki = sirali[(sonIndeks + 1)...].first { kilinabilir.contains($0.vakit) }
        if sonIndeks < 0 {
            return SiriAktifVakitDurumu(aktif: nil, bitisMs: nil, sonraki: sonraki)
        }
        let son = sirali[sonIndeks]
        guard kilinabilir.contains(son.vakit), sonIndeks + 1 < sirali.count else {
            return SiriAktifVakitDurumu(aktif: nil, bitisMs: nil, sonraki: sonraki)
        }
        return SiriAktifVakitDurumu(aktif: son, bitisMs: sirali[sonIndeks + 1].ms, sonraki: sonraki)
    }

    static func kilindiMi(
        _ vakit: SiriVakitAni,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim]
    ) -> Bool {
        if (kilinanlar[vakit.tarih] ?? []).contains(vakit.vakit) { return true }
        guard let kayit = kayitVakti(vakit.vakit) else { return false }
        return bekleyenler.contains { $0.tarih == vakit.tarih && $0.vakit == kayit }
    }

    /// "Su anki vakti kildim" karari (TS `siriKildimKarari` ikizi).
    public static func kildimKarari(
        vakitler: [SiriVakitAni],
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64
    ) -> SiriKildimKarari {
        let durum = aktifVakitBul(vakitler, simdiMs: simdiMs)
        guard let aktif = durum.aktif, let kayit = kayitVakti(aktif.vakit) else {
            return .vakitYok(siradaki: durum.sonraki)
        }
        let ad = gorunenAd(aktif.vakit)
        if kilindiMi(aktif, kilinanlar: kilinanlar, bekleyenler: bekleyenler) {
            return .zatenKilindi(ad: ad)
        }
        return .aday(vakit: aktif, kayitVakti: kayit, ad: ad)
    }

    static func girisMetni(_ v: SiriVakitAni, bugun: String, saat: (Int64) -> String) -> String {
        // ISO tarihler sozluk sirasiyla karsilastirilabilir.
        return "\(v.tarih > bugun ? "yarın " : "")saat \(saat(v.ms))"
    }

    /// "Siradaki namaz ne zaman?" cevabi (TS `siradakiNamazMetni` ikizi).
    public static func siradakiNamazMetni(
        durum: SiriAktifVakitDurumu,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        bugun: String,
        saat: (Int64) -> String
    ) -> String {
        var parcalar: [String] = []
        if let aktif = durum.aktif, let bitis = durum.bitisMs,
           !kilindiMi(aktif, kilinanlar: kilinanlar, bekleyenler: bekleyenler) {
            let ad = gorunenAd(aktif.vakit)
            if durum.sonraki?.ms == bitis {
                parcalar.append("Şu an \(ad) vakti.")
            } else {
                parcalar.append("Şu an \(ad) vakti, çıkışı saat \(saat(bitis)).")
            }
        }
        if let sonraki = durum.sonraki {
            parcalar.append(
                "Sıradaki namaz \(gorunenAd(sonraki.vakit)), \(girisMetni(sonraki, bugun: bugun, saat: saat))."
            )
        }
        return parcalar.isEmpty ? veriEskiMetni : parcalar.joined(separator: " ")
    }

    /// "Kildim" sonucu metni (TS `siriKildimMetni` ikizi).
    public static func kildimMetni(_ karar: SiriKildimKarari, bugun: String, saat: (Int64) -> String) -> String {
        switch karar {
        case .aday(_, _, let ad):
            return "\(ad) namazınız kılındı olarak işaretlendi. Allah kabul etsin."
        case .zatenKilindi(let ad):
            return "\(ad) namazı zaten kılındı olarak işaretli."
        case .vakitYok(let siradaki):
            guard let s = siradaki else { return "Şu an kılınacak vakit yok." }
            return "Şu an kılınacak vakit yok. Sıradaki \(gorunenAd(s.vakit)), \(girisMetni(s, bugun: bugun, saat: saat))."
        }
    }

    /// Siri onay sorusu (TS `siriKildimOnayMetni` ikizi).
    public static func onayMetni(_ ad: String) -> String {
        return "\(ad) namazı kılındı olarak işaretlensin mi?"
    }
}
