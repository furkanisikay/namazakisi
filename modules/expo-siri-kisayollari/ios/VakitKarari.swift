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
 *
 * DIL (W5): metin ureten her fonksiyon `dil` parametresi alir, varsayilani "tr" — Turkce
 * metinler fikstur ile BAYT BAYT ayni kalir; Ingilizce beklentiler `test/main.swift` §9'da
 * elle yazilidir. Bu dosya pod'a, widget uzantisina ve saate kopyalandigi icin dil
 * cozumu (`ArayuzDili`) ve metin tablosu (`VakitMetinleri`) de BURADADIR (yeni dosya CI'nin
 * swiftc listelerine ve kopya listelerine girmek zorunda kalirdi).
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

/// NATIVE ARAYUZ DILI (W5): JS `DilServisi`'nin yazdigi kod (iOS App Group
/// `namazakisi_dil_kod`, `SiriDeposu.arayuzDili()`) ya da cihaz dili buraya girer.
/// Desteklenmeyen / bos kod Turkceye duser (uygulama hic acilmadiysa deger yoktur).
/// Yeni dil = `VakitMetinleri`'ne yeni ornek + `desteklenenler`'e kod.
public enum ArayuzDili {
    public static let varsayilan = "tr"
    public static let desteklenenler: [String] = ["tr", "en"]

    /// "en", "en-US", "en_GB" → "en"; bilinmeyen ya da bos kod → "tr".
    public static func coz(_ kod: String?) -> String {
        guard let kod, !kod.isEmpty else { return varsayilan }
        let dil = String(kod.split(whereSeparator: { $0 == "-" || $0 == "_" }).first ?? "")
        return desteklenenler.contains(dil) ? dil : varsayilan
    }
}

/// Dil basina metinler (W5). Turkce metinler TS ikizi `siriKarari.ts` ve ortak fikstur
/// `siri-ornek.json` ile BAYT BAYT kilitlidir; Ingilizce karsiliklar JS sozlugunden
/// (`sozluk/en/genel.ts > kildim.sonuc`, `vakit.adlar`, `samimiyet.kabulDuasi`).
/// Yer tutucular `{ad}`, `{saat}`, `{giris}`, `{dua}` — `bicim` doldurur.
public struct VakitMetinleri: Equatable {
    public let dil: String
    /// Kilinabilir vakitlerin widget kodu → gorunen ad (`sabah`...`yatsi`).
    public let adlar: [String: String]
    public let gunes: String
    public let konumYok: String
    public let veriEski: String
    public let girisBugun: String
    public let girisYarin: String
    public let suAnVakti: String
    public let suAnVaktiCikis: String
    public let siradakiNamaz: String
    public let isaretlendi: String
    public let zatenKilindi: String
    public let vakitYok: String
    public let vakitYokSiradaki: String
    public let onay: String
    public let vakitDegisti: String
    /// Samimiyet: telefon `KABUL_DUASI` (tek sabit kalip).
    public let kabulDuasi: String
    /// Eylem ("Kıldım") ve durum ("Kılındı") etiketleri.
    public let kildim: String
    public let kilindi: String
    /// Kontrol Merkezi kontrolu basliklari.
    public let kontrolKildim: String
    public let kontrolKilindi: String
    public let kontrolVakitYok: String
    public let uygulamayiAcin: String

    public static let tr = VakitMetinleri(
        dil: "tr",
        adlar: ["sabah": "Sabah", "ogle": "Öğle", "ikindi": "İkindi", "aksam": "Akşam", "yatsi": "Yatsı"],
        gunes: "Güneş",
        konumYok: "Vakitleri hesaplayabilmek için uygulamayı açıp konumunuzu ayarlayın.",
        veriEski: "Vakit bilgisi eskimiş. Güncellemek için uygulamayı bir kez açın.",
        girisBugun: "saat {saat}",
        girisYarin: "yarın saat {saat}",
        suAnVakti: "Şu an {ad} vakti.",
        suAnVaktiCikis: "Şu an {ad} vakti, çıkışı saat {saat}.",
        siradakiNamaz: "Sıradaki namaz {ad}, {giris}.",
        isaretlendi: "{ad} namazınız kılındı olarak işaretlendi. {dua}.",
        zatenKilindi: "{ad} namazı zaten kılındı olarak işaretli.",
        vakitYok: "Şu an kılınacak vakit yok.",
        vakitYokSiradaki: "Şu an kılınacak vakit yok. Sıradaki {ad}, {giris}.",
        onay: "{ad} namazı kılındı olarak işaretlensin mi?",
        vakitDegisti: "Vakit değişti, işaretleme yapılmadı. Lütfen yeniden deneyin.",
        kabulDuasi: "Allah kabul etsin",
        kildim: "Kıldım",
        kilindi: "Kılındı",
        kontrolKildim: "{ad} · Kıldım",
        kontrolKilindi: "{ad} kılındı",
        kontrolVakitYok: "Kılınacak vakit yok",
        uygulamayiAcin: "Uygulamayı açın"
    )

    public static let en = VakitMetinleri(
        dil: "en",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    /// Dil koduna gore metinler ("en-US" → Ingilizce; bilinmeyen → Turkce).
    public static func dil(_ kod: String?) -> VakitMetinleri {
        return ArayuzDili.coz(kod) == "en" ? en : tr
    }

    /// Kilinabilir vaktin adi; gunes ve bilinmeyen kod icin bos dize (namaz degildir).
    public func ad(_ kod: String) -> String {
        return adlar[kod] ?? ""
    }

    /// Gorunen vakit adi, gunes DAHIL (widget, komplikasyon).
    public func vakitAdi(_ kod: String) -> String {
        return kod == "gunes" ? gunes : ad(kod)
    }

    /// `{anahtar}` yer tutucularini doldurur (sira onemsiz; deger yer tutucu tasimaz).
    public static func bicim(_ sablon: String, _ degerler: [String: String]) -> String {
        var sonuc = sablon
        for (anahtar, deger) in degerler {
            sonuc = sonuc.replacingOccurrences(of: "{\(anahtar)}", with: deger)
        }
        return sonuc
    }
}

public enum VakitKarari {
    /// Isaretlenebilir vakitler (gunes bir namaz degildir).
    public static let kilinabilir: [String] = ["sabah", "ogle", "ikindi", "aksam", "yatsi"]

    public static let konumYokMetni = VakitMetinleri.tr.konumYok
    public static let veriEskiMetni = VakitMetinleri.tr.veriEski

    /// Widget kodu → kayit/kuyruk kodu. `sabah` kayitta `imsak`'tir; gunes namaz degildir.
    public static func kayitVakti(_ kod: String) -> String? {
        switch kod {
        case "sabah": return "imsak"
        case "ogle", "ikindi", "aksam", "yatsi": return kod
        default: return nil
        }
    }

    /// Gorunen ad (Turkcede `NamazAdi` degerleri ile ayni). Gunes icin bos dize.
    public static func gorunenAd(_ kod: String, dil: String = ArayuzDili.varsayilan) -> String {
        return VakitMetinleri.dil(dil).ad(kod)
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

    /// "Su anki vakti kildim" karari (TS `siriKildimKarari` ikizi). `ad` verilen dildedir.
    public static func kildimKarari(
        vakitler: [SiriVakitAni],
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64,
        dil: String = ArayuzDili.varsayilan
    ) -> SiriKildimKarari {
        let durum = aktifVakitBul(vakitler, simdiMs: simdiMs)
        guard let aktif = durum.aktif, let kayit = kayitVakti(aktif.vakit) else {
            return .vakitYok(siradaki: durum.sonraki)
        }
        let ad = gorunenAd(aktif.vakit, dil: dil)
        if kilindiMi(aktif, kilinanlar: kilinanlar, bekleyenler: bekleyenler) {
            return .zatenKilindi(ad: ad)
        }
        return .aday(vakit: aktif, kayitVakti: kayit, ad: ad)
    }

    static func girisMetni(_ v: SiriVakitAni, bugun: String, saat: (Int64) -> String, metin: VakitMetinleri) -> String {
        // ISO tarihler sozluk sirasiyla karsilastirilabilir.
        return VakitMetinleri.bicim(v.tarih > bugun ? metin.girisYarin : metin.girisBugun, ["saat": saat(v.ms)])
    }

    /// "Siradaki namaz ne zaman?" cevabi (TS `siradakiNamazMetni` ikizi).
    public static func siradakiNamazMetni(
        durum: SiriAktifVakitDurumu,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        bugun: String,
        saat: (Int64) -> String,
        dil: String = ArayuzDili.varsayilan
    ) -> String {
        let m = VakitMetinleri.dil(dil)
        var parcalar: [String] = []
        if let aktif = durum.aktif, let bitis = durum.bitisMs,
           !kilindiMi(aktif, kilinanlar: kilinanlar, bekleyenler: bekleyenler) {
            let ad = m.ad(aktif.vakit)
            if durum.sonraki?.ms == bitis {
                parcalar.append(VakitMetinleri.bicim(m.suAnVakti, ["ad": ad]))
            } else {
                parcalar.append(VakitMetinleri.bicim(m.suAnVaktiCikis, ["ad": ad, "saat": saat(bitis)]))
            }
        }
        if let sonraki = durum.sonraki {
            parcalar.append(VakitMetinleri.bicim(m.siradakiNamaz, [
                "ad": m.ad(sonraki.vakit),
                "giris": girisMetni(sonraki, bugun: bugun, saat: saat, metin: m),
            ]))
        }
        return parcalar.isEmpty ? m.veriEski : parcalar.joined(separator: " ")
    }

    /// "Kildim" sonucu metni (TS `siriKildimMetni` ikizi). `karar` ayni dille uretilmis olmali.
    public static func kildimMetni(
        _ karar: SiriKildimKarari,
        bugun: String,
        saat: (Int64) -> String,
        dil: String = ArayuzDili.varsayilan
    ) -> String {
        let m = VakitMetinleri.dil(dil)
        switch karar {
        case .aday(_, _, let ad):
            return VakitMetinleri.bicim(m.isaretlendi, ["ad": ad, "dua": m.kabulDuasi])
        case .zatenKilindi(let ad):
            return VakitMetinleri.bicim(m.zatenKilindi, ["ad": ad])
        case .vakitYok(let siradaki):
            guard let s = siradaki else { return m.vakitYok }
            return VakitMetinleri.bicim(m.vakitYokSiradaki, [
                "ad": m.ad(s.vakit),
                "giris": girisMetni(s, bugun: bugun, saat: saat, metin: m),
            ])
        }
    }

    /// Siri onay sorusu (TS `siriKildimOnayMetni` ikizi).
    public static func onayMetni(_ ad: String, dil: String = ArayuzDili.varsayilan) -> String {
        return VakitMetinleri.bicim(VakitMetinleri.dil(dil).onay, ["ad": ad])
    }
}
