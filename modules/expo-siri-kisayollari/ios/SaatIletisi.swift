import Foundation

/**
 * APPLE WATCH <-> IPHONE ILETI SOZLESMESI (issue #285) — SAF (yalniz Foundation).
 *
 * Bu dosya pod'da (telefon tarafi, `SaatKoprusu`) derlenir VE saat uygulamasina
 * kopyalanir (`plugins/withNamazSaat.js`): iki taraf ayni anahtarlari ve ayni dogrulamayi
 * kullanir, sozlesme tek dosyada durur. Linux'ta `swiftc` ile test edilir
 * (`targets/saat/test/main.swift`) → UIKit/WatchConnectivity IMPORT ETMEZ.
 *
 * Iki yon:
 *   1. Telefon → saat: `updateApplicationContext([yukAnahtari: <Wear yuku JSON>])`.
 *      "Son durum" kanalidir (kuyruk DEGIL): saat her zaman yalniz en yeni yuku gorur.
 *      Yuk Wear OS saatine giden yukun AYNISIDIR (`src/core/wear/wearYuku.ts`); saat
 *      ikinci bir vakit motoru KURMAZ.
 *   2. Saat → telefon: "Kildim" iletisi (`kildimIletisi`). Telefon onu Siri/widget ile
 *      ORTAK "Kildim" kuyruguna (`SiriDeposu.kildimEkle`, kaynak `saat`) yazar; kuyrugu
 *      JS bosaltir (`KildimKuyruguServisi`).
 *
 * Vakit KAYIT kodudur (`imsak`, `ogle`...): kuyruk `sabah`'i reddeder (AGENTS.md).
 */
public enum SaatIletisi {
    /// Uygulama baglamindaki yuk anahtari (deger: Wear yuku JSON dizesi).
    public static let yukAnahtari = "yuk"
    public static let turAnahtari = "tur"
    public static let kildimTuru = "kildim"
    /// Ortak "Kildim" kuyrugundaki kaynak adi (Android Wear ile ayni: saat).
    public static let kaynak = "saat"
    /// Kuyruga girebilen KAYIT vakit kodlari (gunes bir namaz degildir).
    public static let kayitVakitleri = ["imsak", "ogle", "ikindi", "aksam", "yatsi"]

    public struct Kildim: Equatable {
        public let tarih: String
        public let vakit: String

        public init(tarih: String, vakit: String) {
            self.tarih = tarih
            self.vakit = vakit
        }
    }

    /// Saat → telefon "Kildim" iletisi (property list tipleri: WCSession sozlugu).
    public static func kildimIletisi(tarih: String, vakit: String, ms: Int64) -> [String: Any] {
        return [turAnahtari: kildimTuru, "tarih": tarih, "vakit": vakit, "ms": NSNumber(value: ms)]
    }

    /// Telefon: gelen iletiyi dogrular. Gecersizse nil (kuyruga HICBIR SEY yazilmaz).
    public static func kildimCoz(_ ileti: [String: Any]) -> Kildim? {
        guard (ileti[turAnahtari] as? String) == kildimTuru,
              let tarih = ileti["tarih"] as? String, isoTarihMi(tarih),
              let vakit = ileti["vakit"] as? String, kayitVakitleri.contains(vakit) else { return nil }
        return Kildim(tarih: tarih, vakit: vakit)
    }

    /// Telefon → saat baglami.
    public static func baglam(yukJson: String) -> [String: Any] {
        return [yukAnahtari: yukJson]
    }

    /// Saat: baglamdan yuk JSON'u (yoksa nil).
    public static func yukJson(_ baglam: [String: Any]) -> String? {
        guard let ham = baglam[yukAnahtari] as? String, !ham.isEmpty else { return nil }
        return ham
    }

    /// `YYYY-MM-DD` (yalniz rakam ve tire; takvim gecerliligi aranmaz — JS ile ayni katilik).
    public static func isoTarihMi(_ s: String) -> Bool {
        let k = Array(s.utf8)
        guard k.count == 10 else { return false }
        for (i, c) in k.enumerated() {
            if i == 4 || i == 7 {
                if c != UInt8(ascii: "-") { return false }
            } else if c < UInt8(ascii: "0") || c > UInt8(ascii: "9") {
                return false
            }
        }
        return true
    }
}
