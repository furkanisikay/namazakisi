import Foundation

/**
 * APPLE WATCH YUKU + EKRAN KARARI (issue #285) — SAF (yalniz Foundation).
 *
 * Saat YALNIZ GOSTERIR: vakitler telefonda hesaplanir ve Wear OS saatine giden yukun
 * AYNISI (`src/core/wear/wearYuku.ts`, Kotlin ikizi `wear/.../cekirdek/Yuk.kt`)
 * WatchConnectivity ile gelir. Saat ikinci bir vakit motoru KURMAZ; hatirlatma da
 * kurmaz (iPhone bildirimleri saate zaten yansir — ikinci bildirim = cift bildirim).
 *
 * Karar, iPhone widget'iyla AYNI saf koddan gecer (`VakitKarari` + `WidgetKarari`, pod'dan
 * kopya): Wear yukunun `VakitAdi` uzayi (`imsak`) widget kod uzayina (`sabah`) cevrilir,
 * boylece "aktif vakit / kilindi mi / siradaki" iki yuzeyde ayni sonucu verir.
 *
 * Bu dosya saat uygulamasina VE saat widget uzantisina (komplikasyonlar) kopyalanir;
 * Linux'ta `targets/saat/test/main.swift` Wear'in ortak fiksturuyle
 * (`wear/app/src/test/resources/ornek-yuk.json`) dogrular.
 */

public enum SaatSabitleri {
    /// Saatin anladigi en yeni yuk surumu (JS `WEAR_YUK_SURUMU`, Kotlin `DESTEKLENEN_YUK_SURUMU`).
    public static let desteklenenYukSurumu = 2
    /// Telefona ulasmamis iyimser "Kildim" bu sureden eskiyse unutulur.
    public static let bekleyenOmruMs: Int64 = 48 * 3_600_000
    /// Sozlesme sirasi; `gunes` gosterilir ama asla "kilinmis" olmaz.
    public static let vakitler = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"]
}

public struct SaatGunu: Equatable {
    public let tarih: String
    /// vakit (`imsak`...) → giris ani (epoch ms)
    public let vakitler: [String: Int64]
    public let kilinan: Set<String>
}

public struct SaatYuku: Equatable {
    public let surum: Int
    public let konumAdi: String
    /// Tarihe gore sirali.
    public let gunler: [SaatGunu]
}

public enum SaatYukSonucu: Equatable {
    case basarili(SaatYuku)
    /// Telefon daha yeni bir sema gonderdi — saat eski veriyi gostermeye devam eder.
    case surumYeni(Int)
    case gecersiz
}

/// Telefona gonderilmis ama yukte henuz gorunmeyen "Kildim" (iyimser gosterim).
public struct SaatBekleyen: Codable, Equatable {
    public let tarih: String
    /// KAYIT kodu (`imsak`...).
    public let vakit: String
    public let ms: Int64

    public init(tarih: String, vakit: String, ms: Int64) {
        self.tarih = tarih
        self.vakit = vakit
        self.ms = ms
    }
}

public enum SaatYukCozucu {
    private struct SurumBasligi: Decodable {
        let surum: Int
    }

    /// Icerigi okunmayan dizi ogesi (muhafiz plani saatte KULLANILMAZ, yalniz varligi aranir).
    private struct Yoksay: Decodable {
        init(from decoder: Decoder) throws {}
    }

    private struct HamGun: Decodable {
        let tarih: String
        let vakitler: [String: Int64]
        let kilinan: [String]
    }

    private struct HamKerahat: Decodable {
        let suruk: Int
        let istiva: Int
        let gurub: Int
    }

    private struct HamYuk: Decodable {
        let surum: Int
        let konumAdi: String
        let kerahatDk: HamKerahat
        let gunler: [HamGun]
        let muhafiz: [Yoksay]?
    }

    /// Kotlin `YukCozucu.coz` ile ayni katilik: eksik/yanlis alan → `gecersiz`.
    public static func coz(_ json: String?) -> SaatYukSonucu {
        guard let json, let veri = json.data(using: .utf8), !veri.isEmpty else { return .gecersiz }
        let cozucu = JSONDecoder()
        guard let baslik = try? cozucu.decode(SurumBasligi.self, from: veri) else { return .gecersiz }
        if baslik.surum > SaatSabitleri.desteklenenYukSurumu { return .surumYeni(baslik.surum) }
        guard baslik.surum >= 1, let ham = try? cozucu.decode(HamYuk.self, from: veri), !ham.gunler.isEmpty else {
            return .gecersiz
        }
        // v2+ yukte plan dizisi zorunludur (JS `muhafizPlaniGecerliMi`); v1'de yoktur.
        if ham.surum >= 2 && ham.muhafiz == nil { return .gecersiz }
        var gunler: [SaatGunu] = []
        for g in ham.gunler {
            guard SaatIletisi.isoTarihMi(g.tarih) else { return .gecersiz }
            var vakitler: [String: Int64] = [:]
            for ad in SaatSabitleri.vakitler {
                guard let ms = g.vakitler[ad] else { return .gecersiz }
                vakitler[ad] = ms
            }
            for k in g.kilinan where k == "gunes" || !SaatSabitleri.vakitler.contains(k) {
                return .gecersiz
            }
            gunler.append(SaatGunu(tarih: g.tarih, vakitler: vakitler, kilinan: Set(g.kilinan)))
        }
        return .basarili(SaatYuku(surum: ham.surum, konumAdi: ham.konumAdi, gunler: gunler.sorted { $0.tarih < $1.tarih }))
    }

    /// Wear `VakitAdi` → widget kodu (`imsak` → `sabah`; gerisi ayni).
    public static func widgetKodu(_ vakitAdi: String) -> String {
        return vakitAdi == "imsak" ? "sabah" : vakitAdi
    }
}

public extension SaatYuku {
    /// Widget kod uzayinda tum girisler (gunes dahil) — `VakitKarari`/`WidgetKarari` girdisi.
    var vakitAnlari: [SiriVakitAni] {
        var liste: [SiriVakitAni] = []
        for gun in gunler {
            for ad in SaatSabitleri.vakitler {
                if let ms = gun.vakitler[ad] {
                    liste.append(SiriVakitAni(vakit: SaatYukCozucu.widgetKodu(ad), ms: ms, tarih: gun.tarih))
                }
            }
        }
        return liste.sorted { $0.ms < $1.ms }
    }

    /// tarih → kilinmis vakitler (widget kodu, `VakitKarari.kilindiMi` sozlesmesi).
    var kilinanlar: [String: [String]] {
        var sozluk: [String: [String]] = [:]
        for gun in gunler where !gun.kilinan.isEmpty {
            sozluk[gun.tarih] = SaatSabitleri.vakitler.filter { gun.kilinan.contains($0) }.map(SaatYukCozucu.widgetKodu)
        }
        return sozluk
    }
}

/// Ana ekranin bir satiri (gunun bes kilinabilir vakti).
public struct SaatVakitSatiri: Equatable {
    /// Widget kodu (`sabah`...).
    public let kod: String
    public let ad: String
    public let ms: Int64
    public let kilindi: Bool
    public let aktif: Bool
}

public struct SaatEkranDurumu: Equatable {
    public let gorunum: WidgetGorunumu
    public let satirlar: [SaatVakitSatiri]
    /// "Kildim" dugmesinin karari (aday / zaten kilindi / vakit yok).
    public let kildim: SiriKildimKarari
    /// Veri var ama tukenmis (iPhone'da uygulama uzun suredir acilmadi).
    public let veriEski: Bool
}

public enum SaatKarari {
    static func bekleyenler(_ liste: [SaatBekleyen]) -> [SiriBekleyenKildim] {
        return liste.map { SiriBekleyenKildim(tarih: $0.tarih, vakit: $0.vakit) }
    }

    /// Ekranin tamami tek cagri: widget ile AYNI karar (`WidgetKarari.gorunum`,
    /// `VakitKarari.kildimKarari`). Kilinmislik = yuk ∪ iyimser bekleyen.
    public static func ekranDurumu(yuk: SaatYuku, bekleyenler liste: [SaatBekleyen], simdiMs: Int64) -> SaatEkranDurumu {
        let vakitler = yuk.vakitAnlari
        let kilinanlar = yuk.kilinanlar
        let bekleyen = bekleyenler(liste)
        let g = WidgetKarari.gorunum(vakitler: vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyen, simdiMs: simdiMs)
        let satirlar = (g.gunTarihi.map { WidgetKarari.gunVakitleri(vakitler, tarih: $0) } ?? []).map { v in
            SaatVakitSatiri(
                kod: v.vakit,
                ad: VakitKarari.gorunenAd(v.vakit),
                ms: v.ms,
                kilindi: WidgetKarari.kilindiMi(v, kilinanlar: kilinanlar, bekleyenler: bekleyen),
                aktif: g.aktif == v
            )
        }
        let kildim = VakitKarari.kildimKarari(
            vakitler: vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyen, simdiMs: simdiMs
        )
        return SaatEkranDurumu(gorunum: g, satirlar: satirlar, kildim: kildim, veriEski: g.aktif == nil && g.sonraki == nil)
    }

    /// Iyimser bekleyenleri ayiklar: yuk onu artik tasiyorsa (telefon isledi) ya da
    /// `bekleyenOmruMs`'ten eskiyse duser. Ayni tarih+vakit iki kez tutulmaz.
    public static func bekleyenleriSuz(_ liste: [SaatBekleyen], yuk: SaatYuku?, simdiMs: Int64) -> [SaatBekleyen] {
        var sonuc: [SaatBekleyen] = []
        for b in liste {
            if simdiMs - b.ms > SaatSabitleri.bekleyenOmruMs { continue }
            if let yuk, yuk.gunler.contains(where: { $0.tarih == b.tarih && $0.kilinan.contains(b.vakit) }) { continue }
            if sonuc.contains(where: { $0.tarih == b.tarih && $0.vakit == b.vakit }) { continue }
            sonuc.append(b)
        }
        return sonuc
    }
}
