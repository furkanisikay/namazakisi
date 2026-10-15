import Foundation

/**
 * iOS GERCEK ALARM (AlarmKit, issue #74) — SAF kurallar, yalniz Foundation.
 *
 * IKIZLER (ortak fikstur, biri degisirse hepsi birlikte):
 *   - `src/core/muhafiz/ios/alarmKit.ts`  ↔ `test/alarmkit-ornek.json` (UUID, ikincil dugme,
 *     calan alarmi koruyan iptal secimi)
 *   - `src/core/muhafiz/erteleme.ts`      ↔ `android/app/src/test/resources/erteleme-ornekleri.json`
 *     (erteleme hedefi, baslik, kimlikler, susturma — Kotlin `ErtelemeKurallari` ile ayni)
 *
 * Linux'taki swift.org arac zinciriyle de derlenir (`test/main.swift`); bu yuzden
 * iOS'a ozgu hicbir cerceve import EDILMEZ.
 */
public enum AlarmKurallari {
    /// Alarm ekranindaki erteleme suresi (dk) — JS `ALARMKIT_ERTELE_DK`.
    public static let erteleDk: Int64 = 10
    /// JS `ERTELEME_EN_AZ_DK`.
    static let enAzErteleDk: Int64 = 5
    /// JS `ERTELEME_EN_AZ_GECIKME_MS`.
    static let enAzGecikmeMs: Int64 = 60_000
    /// JS `ERTELEME_CAKISMA_PAYI_MS`.
    static let cakismaPayiMs: Int64 = 60_000
    static let dakikaMs: Int64 = 60_000
    static let sureYerTutucu = "{sure}"

    static let muhafizOneki = "muhafiz_"
    static let vakitAraci = "_vakit_"
    static let ertelemeEki = "_ertele"

    // MARK: - Kimlik → UUID

    static func fnv1a32(_ girdi: String) -> UInt32 {
        var h: UInt32 = 0x811c_9dc5
        // UTF-16 kod birimleri: JS `charCodeAt` ile BIREBIR (kimlikler zaten ASCII).
        for birim in girdi.utf16 {
            h ^= UInt32(birim)
            h = h &* 0x0100_0193
        }
        return h
    }

    /// Kimlikten deterministik UUID metni (kucuk harf). JS `alarmKitUuid`.
    public static func uuidMetni(_ kimlik: String) -> String {
        var hex = ""
        for i in 0..<4 {
            let parca = String(fnv1a32("\(i)|\(kimlik)"), radix: 16)
            hex += String(repeating: "0", count: max(0, 8 - parca.count)) + parca
        }
        var dizi = Array(hex)
        dizi[12] = "8"
        let varyant = (Int(String(dizi[16]), radix: 16) ?? 0) & 0x3 | 0x8
        dizi[16] = Character(String(varyant, radix: 16))
        let h = String(dizi)
        func dilim(_ a: Int, _ b: Int) -> String {
            let bas = h.index(h.startIndex, offsetBy: a)
            let son = h.index(h.startIndex, offsetBy: b)
            return String(h[bas..<son])
        }
        return "\(dilim(0, 8))-\(dilim(8, 12))-\(dilim(12, 16))-\(dilim(16, 20))-\(dilim(20, 32))"
    }

    /// AlarmKit'in istedigi `UUID`. Metin daima gecerli bicimde uretilir.
    public static func uuid(_ kimlik: String) -> UUID {
        return UUID(uuidString: uuidMetni(kimlik)) ?? UUID()
    }

    // MARK: - Erteleme (JS `erteleme.ts` ikizi)

    /// `ertelemeSecenekleri(tetik, sinir)` bos DEGIL mi?
    public static func ertelemeSecenegiVarMi(tetikMs: Int64, sinirMs: Int64) -> Bool {
        let kalanDk = (Double(sinirMs - tetikMs) / Double(dakikaMs)).rounded(.down)
        return kalanDk.isFinite && kalanDk >= Double(enAzErteleDk)
    }

    /// Alarm ekraninin ikincil dugmesi: "ertele" ya da "kildim". JS `alarmKitIkincilDugme`.
    public static func ikincilDugme(tetikMs: Int64, erteleSinirMs: Int64) -> String {
        return erteleSinirMs > 0 && ertelemeSecenegiVarMi(tetikMs: tetikMs, sinirMs: erteleSinirMs) ? "ertele" : "kildim"
    }

    /// JS `ertelemeHedefiHesapla`: `simdi + sure`, siniri gecmez; sinira 1 dk'dan az kaldiysa `nil`.
    public static func ertelemeHedefi(simdiMs: Int64, sureDk: Int64, sinirMs: Int64) -> Int64? {
        let hedef = min(simdiMs + sureDk * dakikaMs, sinirMs)
        return hedef - simdiMs >= enAzGecikmeMs ? hedef : nil
    }

    /// JS `sureMetni` — "25 dk" / "1 sa" / "1 sa 5 dk".
    public static func sureMetni(_ dk: Double) -> String {
        let d = max(0, Int64(dk.rounded(.down)))
        let sa = d / 60
        let kalan = d % 60
        if sa == 0 { return "\(kalan) dk" }
        return kalan == 0 ? "\(sa) sa" : "\(sa) sa \(kalan) dk"
    }

    /// JS `ertelemeBasligiOlustur`: sablon yoksa `nil` (cagiran asil basligi korur).
    public static func ertelemeBasligi(sablon: String?, cikisMs: Int64, hedefMs: Int64) -> String? {
        guard let sablon, sablon.contains(sureYerTutucu) else { return nil }
        return sablon.replacingOccurrences(
            of: sureYerTutucu,
            with: sureMetni(Double(cikisMs - hedefMs) / Double(dakikaMs))
        )
    }

    /// `muhafiz_<tarih>_vakit_<vakit>_ertele` — JS `ertelemeKimligi`.
    public static func ertelemeKimligi(tarih: String, vakit: String) -> String {
        return "\(muhafizOneki)\(tarih)\(vakitAraci)\(vakit)\(ertelemeEki)"
    }

    /// `muhafiz_<tarih>_vakit_<vakit>` — "Kildim" onek iptalinin onegi.
    public static func vakitOneki(tarih: String, vakit: String) -> String {
        return "\(muhafizOneki)\(tarih)\(vakitAraci)\(vakit)"
    }

    /// JS `ertelemedeSusturulurMu`.
    public static func ertelemedeSusturulurMu(tetikMs: Int64, hedefMs: Int64) -> Bool {
        return tetikMs < hedefMs + cakismaPayiMs
    }

    // MARK: - Kimlik desenleri (JS `erteleme.ts`)

    private static let planDeseni = try! NSRegularExpression(
        pattern: "^muhafiz_\\d{4}-\\d{2}-\\d{2}_vakit_[a-z]+_seviye_\\d+_dk_(-?\\d+)$"
    )
    private static let ertelemeDeseni = try! NSRegularExpression(
        pattern: "^muhafiz_(\\d{4}-\\d{2}-\\d{2})_vakit_([a-z]+)_ertele$"
    )
    private static let vakitDeseni = try! NSRegularExpression(
        pattern: "^muhafiz_(\\d{4}-\\d{2}-\\d{2})_vakit_([a-z]+)(?:_|$)"
    )

    private static func eslesme(_ desen: NSRegularExpression, _ metin: String) -> [String]? {
        let aralik = NSRange(metin.startIndex..<metin.endIndex, in: metin)
        guard let m = desen.firstMatch(in: metin, range: aralik) else { return nil }
        var gruplar: [String] = []
        for i in 1..<max(1, m.numberOfRanges) {
            guard let r = Range(m.range(at: i), in: metin) else { return nil }
            gruplar.append(String(metin[r]))
        }
        return gruplar
    }

    /// Muhafiz PLANININ (seviye/dakika) kimligi mi? JS `muhafizPlanKimligiMi`.
    public static func planKimligiMi(_ kimlik: String) -> Bool {
        return eslesme(planDeseni, kimlik) != nil
    }

    /// Plan kimligindeki `kalanDk`. JS `kimliktenKalanDk`.
    public static func kalanDk(_ kimlik: String) -> Int64? {
        guard let g = eslesme(planDeseni, kimlik), let ilk = g.first else { return nil }
        return Int64(ilk)
    }

    public static func ertelemeKimligiMi(_ kimlik: String) -> Bool {
        return eslesme(ertelemeDeseni, kimlik) != nil
    }

    /// Iptal edilecek kimlikler. PLANLAMA turu (`calaniDurdur == false`: yeniden planlama,
    /// muhafiz kapatma, erteleme araligi) o an CALAN alarma DOKUNMAZ — Android kurali
    /// ("planlama turu calan alarmi susturmaz"); yalniz "Kildim" (`true`) calani da susturur.
    /// JS `alarmKitIptalSecimi` (ortak fikstur `alarmkit-ornek.json > iptalSecimi`).
    public static func iptalSecimi(kimlikler: [String], calanUuidler: Set<String>, calaniDurdur: Bool) -> [String] {
        if calaniDurdur { return kimlikler }
        let calan = Set(calanUuidler.map { $0.lowercased() })
        return kimlikler.filter { !calan.contains(uuidMetni($0)) }
    }

    /// Muhafiz kimliginin (plan, erteleme, yatis...) namaz gunu + vakti.
    public static func kimliktenVakit(_ kimlik: String) -> (tarih: String, vakit: String)? {
        guard let g = eslesme(vakitDeseni, kimlik), g.count == 2 else { return nil }
        return (g[0], g[1])
    }
}
