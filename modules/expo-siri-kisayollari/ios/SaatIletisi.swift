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
 *   1. Telefon → saat: `updateApplicationContext([yukAnahtari: <Wear yuku JSON>, dilAnahtari: <dil kodu>])`.
 *      "Son durum" kanalidir (kuyruk DEGIL): saat her zaman yalniz en yeni yuku gorur.
 *      Yuk Wear OS saatine giden yukun AYNISIDIR (`src/core/wear/wearYuku.ts`); saat
 *      ikinci bir vakit motoru KURMAZ.
 *   2. Saat → telefon: "Kildim" iletisi (`kildimIletisi`). Telefon onu Siri/widget ile
 *      ORTAK "Kildim" kuyruguna (`SiriDeposu.kildimEkle`, kaynak `saat`) yazar; kuyrugu
 *      JS bosaltir (`KildimKuyruguServisi`).
 *
 *   3. Saat → telefon: sessiz uyandirma cevabi (`uyandirmaIletisi`, #285 cilasi — Android
 *      `/namazakisi/uyandirma/kapandi` RPC'sinin ikizi). Telefon kimligi kaydeder, YEDEGINI
 *      (+3 dk bildirim / AlarmKit alarmi) iptal eder; teheccud "Kildim"i farz kuyruguna
 *      DEGIL nafile susturma hafizasina gider.
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

    public static let uyandirmaTuru = "uyandirma"

    /// Saatin uyandirmaya verdigi cevap. ERTELE YOK (sahip karari 2026-10-19).
    public struct Uyandirma: Equatable {
        public let id: String
        /// `kapat` | `kildim`
        public let islem: String
        /// `imsak` | `teheccud`
        public let tur: String
        public let tarih: String
        /// Uyandirmanin anlamini yitirdigi an (telefon kaydi buna gore budar).
        public let sonMs: Int64

        public init(id: String, islem: String, tur: String, tarih: String, sonMs: Int64) {
            self.id = id
            self.islem = islem
            self.tur = tur
            self.tarih = tarih
            self.sonMs = sonMs
        }
    }

    public static func uyandirmaIletisi(_ u: Uyandirma) -> [String: Any] {
        return [
            turAnahtari: uyandirmaTuru,
            "id": u.id,
            "islem": u.islem,
            "uyandirmaTuru": u.tur,
            "tarih": u.tarih,
            "sonMs": NSNumber(value: u.sonMs),
        ]
    }

    /// Telefon: gelen uyandirma iletisini dogrular. Gecersizse nil (HICBIR SEY yazilmaz).
    public static func uyandirmaCoz(_ ileti: [String: Any]) -> Uyandirma? {
        guard (ileti[turAnahtari] as? String) == uyandirmaTuru,
              let id = ileti["id"] as? String, uyandirmaKimligiMi(id),
              let islem = ileti["islem"] as? String, islem == "kapat" || islem == "kildim",
              let tur = ileti["uyandirmaTuru"] as? String, tur == "imsak" || tur == "teheccud",
              let tarih = ileti["tarih"] as? String, isoTarihMi(tarih),
              let son = ileti["sonMs"] as? NSNumber else { return nil }
        // Kimlik turle celisiyorsa (imsak kimligi teheccud diye gelirse) reddet.
        if (tur == "imsak") != id.hasPrefix("muhafiz_") { return nil }
        return Uyandirma(id: id, islem: islem, tur: tur, tarih: tarih, sonMs: son.int64Value)
    }

    /// Uyandirma olabilecek kimlik mi? (Kotlin `UyandirmaZinciri.uyandirmaKimligiMi` ikizi)
    public static func uyandirmaKimligiMi(_ id: String) -> Bool {
        return eslesir(id, "^muhafiz_[0-9]{4}-[0-9]{2}-[0-9]{2}_vakit_imsak_seviye_[1-4]_dk_[0-9]+$") ||
            eslesir(id, "^nafile_[0-9]{4}-[0-9]{2}-[0-9]{2}_teheccud_[0-9]+$")
    }

    private static func eslesir(_ metin: String, _ desen: String) -> Bool {
        guard let r = try? NSRegularExpression(pattern: desen) else { return false }
        let aralik = NSRange(metin.startIndex..<metin.endIndex, in: metin)
        return r.firstMatch(in: metin, options: [], range: aralik) != nil
    }

    /// Uygulama baglamindaki arayuz dili anahtari (W5; deger: dil KODU, "tr", "en", "id"...).
    /// Wear yuku JSON'unun ICINE girmez (ortak fikstur ve Wear sozlesmesi degismez);
    /// yukun KARDESIDIR. Telefon `SiriDeposu.arayuzDili()`'ni gonderme aninda okur.
    public static let dilAnahtari = "dil"

    /// Telefon → saat baglami. `dil` verilmezse anahtar yazilmaz (eski davranis).
    public static func baglam(yukJson: String, dil: String? = nil) -> [String: Any] {
        var b: [String: Any] = [yukAnahtari: yukJson]
        if let dil, !dil.isEmpty { b[dilAnahtari] = dil }
        return b
    }

    /// Saat: baglamdan yuk JSON'u (yoksa nil).
    public static func yukJson(_ baglam: [String: Any]) -> String? {
        guard let ham = baglam[yukAnahtari] as? String, !ham.isEmpty else { return nil }
        return ham
    }

    /// Saat: baglamdaki arayuz dili, desteklenen koda cozulmus. Eski telefon gondermezse nil
    /// (saat o zaman kayitli dili korur; hic yoksa Turkce — eski telefonun metinleri Turkcedir).
    public static func dil(_ baglam: [String: Any]) -> String? {
        guard let ham = baglam[dilAnahtari] as? String, !ham.isEmpty else { return nil }
        return ArayuzDili.coz(ham)
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
