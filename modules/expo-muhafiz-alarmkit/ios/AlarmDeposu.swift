import Foundation

/// Kurulu bir AlarmKit alarminin kaydi. Alanlar JS `AlarmKitYuku` ile AYNI.
public struct AlarmKaydi: Codable, Equatable {
    public let kimlik: String
    public let tetikMs: Int64
    public let baslik: String
    /// Muhafiz vakti (`imsak`, `ogle`...) — "Kildim" kuyrugunun KAYIT vakit kodu.
    public let vakit: String
    /// Vaktin ait oldugu namaz gunu (YYYY-MM-DD).
    public let tarih: String
    public let cikisMs: Int64
    /// `ertelemeSiniriMs`; 0 = erteleme yok.
    public let erteleSinirMs: Int64
    /// `ertelemeBasligiSablonu` (`{sure}` yer tutuculu).
    public let ertelemeBasligi: String

    public init(
        kimlik: String,
        tetikMs: Int64,
        baslik: String,
        vakit: String,
        tarih: String,
        cikisMs: Int64,
        erteleSinirMs: Int64,
        ertelemeBasligi: String
    ) {
        self.kimlik = kimlik
        self.tetikMs = tetikMs
        self.baslik = baslik
        self.vakit = vakit
        self.tarih = tarih
        self.cikisMs = cikisMs
        self.erteleSinirMs = erteleSinirMs
        self.ertelemeBasligi = ertelemeBasligi
    }

    /// AlarmKit kimligi (kimlikten deterministik).
    public var uuidMetni: String { AlarmKurallari.uuidMetni(kimlik) }

    /// JSON'dan cozer; bozuk/eksik alan `nil` (planlama yapilmaz).
    public static func coz(_ json: String) -> AlarmKaydi? {
        guard let veri = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(AlarmKaydi.self, from: veri)
    }
}

/**
 * AlarmKit alarm KAYIT DEFTERI (issue #74) — yalniz Foundation.
 *
 * NEDEN VAR: AlarmKit'in `Alarm` nesnesi yalniz `id` (UUID) ve durum tasir; bizim
 * kimligimizi (`muhafiz_<gun>_vakit_<vakit>_...`), tetik anini ve "Ertele"nin ihtiyac
 * duydugu siniri BILMEZ. "Kildim" onek iptali, erteleme araligi susturmasi ve JS'in
 * etkin ertelemeleri okumasi bu kayittan beslenir. Kayit ile sistem ayrisabilir
 * (alarm caldi ve bitti, kullanici durdurdu) → okuyan `buda` ile sistemdeki canli
 * listeye indirger.
 *
 * Ana uygulama hedefindeki alarm intent'leri ve JS koprusu AYNI SURECTE calisir
 * (Siri deposu deseni) → `UserDefaults.standard` + tek kilit yeterli; App Group yok.
 */
public final class AlarmDeposu: @unchecked Sendable {
    public static let varsayilan = AlarmDeposu(defaults: .standard)

    static let anahtar = "namazakisi.alarmkit.kayitlar"

    private let defaults: UserDefaults
    private let kilit = NSLock()

    public init(defaults: UserDefaults) {
        self.defaults = defaults
    }

    private func oku() -> [String: AlarmKaydi] {
        guard let ham = defaults.string(forKey: Self.anahtar),
              let veri = ham.data(using: .utf8),
              let sozluk = try? JSONDecoder().decode([String: AlarmKaydi].self, from: veri) else { return [:] }
        return sozluk
    }

    private func yazHam(_ sozluk: [String: AlarmKaydi]) {
        guard let veri = try? JSONEncoder().encode(sozluk), let ham = String(data: veri, encoding: .utf8) else { return }
        defaults.set(ham, forKey: Self.anahtar)
    }

    private func kilitli<T>(_ blok: () -> T) -> T {
        kilit.lock()
        defer { kilit.unlock() }
        return blok()
    }

    /// Kayit ekler; ayni kimlik varsa YERINE gecer (ayni UUID).
    public func yaz(_ kayit: AlarmKaydi) {
        kilitli {
            var s = oku()
            s[kayit.kimlik] = kayit
            yazHam(s)
        }
    }

    public func sil(_ kimlikler: [String]) {
        guard !kimlikler.isEmpty else { return }
        kilitli {
            var s = oku()
            for k in kimlikler { s.removeValue(forKey: k) }
            yazHam(s)
        }
    }

    public func kayit(_ kimlik: String) -> AlarmKaydi? {
        return kilitli { oku()[kimlik] }
    }

    /// Tum kayitlar, tetik anina gore sirali.
    public func kayitlar() -> [AlarmKaydi] {
        return kilitli { oku().values.sorted { $0.tetikMs < $1.tetikMs } }
    }

    /// Sistemde artik KURULU OLMAYAN kayitlari atar ve kalanlari dondurur.
    /// `canliUuidler == nil` (sistem listesi okunamadi) → hicbir sey ATILMAZ.
    @discardableResult
    public func buda(canliUuidler: Set<String>?) -> [AlarmKaydi] {
        return kilitli {
            var s = oku()
            if let canli = canliUuidler {
                let kucuk = Set(canli.map { $0.lowercased() })
                s = s.filter { kucuk.contains($0.value.uuidMetni) }
                yazHam(s)
            }
            return s.values.sorted { $0.tetikMs < $1.tetikMs }
        }
    }

    /// Onekle baslayan kayitlarin kimlikleri ("Kildim": `muhafiz_<gun>_vakit_<vakit>`).
    public func onekliKimlikler(_ onek: String) -> [String] {
        return kayitlar().map(\.kimlik).filter { $0.hasPrefix(onek) }
    }

    /// Erteleme suresince susacak PLAN alarmlari: ayni vakit, tetik < hedef + pay.
    public func susturulacaklar(tarih: String, vakit: String, hedefMs: Int64) -> [String] {
        let onek = AlarmKurallari.vakitOneki(tarih: tarih, vakit: vakit) + "_"
        return kayitlar()
            .filter {
                $0.kimlik.hasPrefix(onek)
                    && AlarmKurallari.planKimligiMi($0.kimlik)
                    && AlarmKurallari.ertelemedeSusturulurMu(tetikMs: $0.tetikMs, hedefMs: hedefMs)
            }
            .map(\.kimlik)
    }

    /// JS'e giden canli kayit listesi (`[{kimlik, tetikMs, caliyor?}]`). `caliyor` yalniz o an
    /// CALAN (`Alarm.State.alerting`) alarmda yazilir: planlama turu onu iptal etmez.
    public static func listeJson(_ kayitlar: [AlarmKaydi], calanUuidler: Set<String> = []) -> String {
        let calan = Set(calanUuidler.map { $0.lowercased() })
        let ozet = kayitlar.map { k -> [String: Any] in
            var o: [String: Any] = ["kimlik": k.kimlik, "tetikMs": NSNumber(value: k.tetikMs)]
            if calan.contains(k.uuidMetni) { o["caliyor"] = true }
            return o
        }
        guard let veri = try? JSONSerialization.data(withJSONObject: ozet),
              let ham = String(data: veri, encoding: .utf8) else { return "[]" }
        return ham
    }
}
