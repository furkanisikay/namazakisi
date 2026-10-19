import Foundation

/**
 * iOS GERCEK ALARM (AlarmKit, issue #74) — SAF kurallar, yalniz Foundation.
 *
 * IKIZLER (ortak fikstur, biri degisirse hepsi birlikte):
 *   - `src/core/muhafiz/ios/alarmKit.ts`  ↔ `test/alarmkit-ornek.json` (UUID, alarm turu,
 *     calan alarmi koruyan iptal secimi)
 *   - `src/core/muhafiz/planKimligi.ts`   ↔ `android/app/src/test/resources/muhafiz-plan-kimligi-ornekleri.json`
 *     (plan kimligi + eski erteleme artigi — Kotlin `MuhafizPlanKimligi` ile ayni)
 *
 * ERTELE YOK (sahip karari 2026-10-19, eski #289): alarm ekraninin ikincil dugmesi
 * vakit alarminda daima "Kildim"dir.
 *
 * Linux'taki swift.org arac zinciriyle de derlenir (`test/main.swift`); bu yuzden
 * iOS'a ozgu hicbir cerceve import EDILMEZ.
 */
public enum AlarmKurallari {
    static let muhafizOneki = "muhafiz_"
    static let vakitAraci = "_vakit_"

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

    /// `muhafiz_<tarih>_vakit_<vakit>` — "Kildim" onek iptalinin onegi.
    public static func vakitOneki(tarih: String, vakit: String) -> String {
        return "\(muhafizOneki)\(tarih)\(vakitAraci)\(vakit)"
    }

    // MARK: - Kimlik desenleri (JS `planKimligi.ts`)

    private static let planDeseni = try! NSRegularExpression(
        pattern: "^muhafiz_\\d{4}-\\d{2}-\\d{2}_vakit_[a-z]+_seviye_\\d+_dk_(-?\\d+)$"
    )
    private static let eskiErtelemeDeseni = try! NSRegularExpression(
        pattern: "^muhafiz_\\d{4}-\\d{2}-\\d{2}_vakit_[a-z]+_ertele$"
    )
    private static let nafileDeseni = try! NSRegularExpression(
        pattern: "^nafile_(\\d{4}-\\d{2}-\\d{2})_(kusluk|evvabin|teheccud)_[^_]+$"
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

    /// Kaldirilan Ertele'nin (#289) guncelleme oncesi artigi mi? JS `eskiErtelemeKimligiMi`.
    public static func eskiErtelemeKimligiMi(_ kimlik: String) -> Bool {
        return eslesme(eskiErtelemeDeseni, kimlik) != nil
    }

    /// Iptal edilecek kimlikler. PLANLAMA turu (`calaniDurdur == false`: yeniden planlama,
    /// muhafiz kapatma) o an CALAN alarma DOKUNMAZ — Android kurali
    /// ("planlama turu calan alarmi susturmaz"); yalniz "Kildim" (`true`) calani da susturur.
    /// JS `alarmKitIptalSecimi` (ortak fikstur `alarmkit-ornek.json > iptalSecimi`).
    public static func iptalSecimi(kimlikler: [String], calanUuidler: Set<String>, calaniDurdur: Bool) -> [String] {
        if calaniDurdur { return kimlikler }
        let calan = Set(calanUuidler.map { $0.lowercased() })
        return kimlikler.filter { !calan.contains(uuidMetni($0)) }
    }

    /// NAFILE alarm kimligi (`nafile_<gun>_<tur>_<k>`) — gun + tur. JS `nafilePlani` kimligi,
    /// Kotlin `NafileKildimKurallari.nafileCoz` ikizi. "Kildim" bu kimlikte FARZ yazmaz.
    public static func kimliktenNafile(_ kimlik: String) -> (tarih: String, tur: String)? {
        guard let g = eslesme(nafileDeseni, kimlik), g.count == 2 else { return nil }
        return (g[0], g[1])
    }

    /// `nafile_<gun>_<tur>_` — o gunun o nafilesinin TUM uyarilari (sondaki `_` komsu
    /// turu susturmasin). JS `nafileKimlikOneki`.
    public static func nafileOneki(tarih: String, tur: String) -> String {
        return "nafile_\(tarih)_\(tur)_"
    }

    /// Alarmin TURU kimlikten (ortak hatirlatma yuzeyleri, plan 4.2) — JS `alarmKitTuru`.
    /// Muhafiz uzayi (plan, yatis) "vakit", nafile "nafile", geri kalan (cuma,
    /// camiye gitme, takvim, coklu muhasebe) "bilgi": bilgi alarminda IKINCIL DUGME YOK —
    /// vakit girmeden calar, "Kildim" FARZ'i yazardi.
    public static func alarmTuru(_ kimlik: String) -> String {
        if kimliktenVakit(kimlik) != nil { return "vakit" }
        if kimliktenNafile(kimlik) != nil { return "nafile" }
        return "bilgi"
    }

    /// Muhafiz kimliginin (plan, yatis...) namaz gunu + vakti.
    public static func kimliktenVakit(_ kimlik: String) -> (tarih: String, vakit: String)? {
        guard let g = eslesme(vakitDeseni, kimlik), g.count == 2 else { return nil }
        return (g[0], g[1])
    }
}
