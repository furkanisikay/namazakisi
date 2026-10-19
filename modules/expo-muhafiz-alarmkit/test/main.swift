// iOS gercek alarm (AlarmKit, issue #74) Swift cekirdeginin test kosucusu.
//
// iOS SDK ve Xcode GEREKMEZ: `AlarmKurallari.swift` ve `AlarmDeposu.swift` yalniz
// Foundation kullanir. macOS CI (ve swift.org arac zincirli Linux) uzerinde:
//
//   swiftc -swift-version 5 -o /tmp/alarmkit-test \
//     modules/expo-muhafiz-alarmkit/ios/AlarmKurallari.swift \
//     modules/expo-muhafiz-alarmkit/ios/AlarmDeposu.swift \
//     modules/expo-muhafiz-alarmkit/test/main.swift
//   /tmp/alarmkit-test modules/expo-muhafiz-alarmkit/test/alarmkit-ornek.json \
//     android/app/src/test/resources/muhafiz-plan-kimligi-ornekleri.json
//
// Fikstürler JS (`src/core/muhafiz/ios/__tests__/alarmKit.test.ts`,
// `src/core/muhafiz/__tests__/planKimligi.test.ts`) ve Kotlin (`MuhafizPlanKimligiTest`)
// testleriyle ORTAKTIR. Herhangi bir uyusmazlikta cikis kodu 1'dir.

import Foundation

var hatalar: [String] = []
var gecen = 0

func esitMi<T: Equatable>(_ gercek: T, _ beklenen: T, _ ad: String) {
    if gercek == beklenen {
        gecen += 1
    } else {
        hatalar.append("\(ad)\n    beklenen: \(beklenen)\n    gercek:   \(gercek)")
    }
}

func oku<T: Decodable>(_ yol: String, _ tip: T.Type) -> T {
    do {
        let veri = try Data(contentsOf: URL(fileURLWithPath: yol))
        return try JSONDecoder().decode(tip, from: veri)
    } catch {
        print("Fikstür okunamadi: \(yol) — \(error)")
        exit(2)
    }
}

let argumanlar = CommandLine.arguments
guard argumanlar.count >= 3 else {
    print("Kullanim: alarmkit-test <alarmkit-ornek.json> <muhafiz-plan-kimligi-ornekleri.json>")
    exit(2)
}

// MARK: - 1) Kimlik → UUID, alarm turu, iptal secimi (alarmkit-ornek.json)

struct UuidOrnegi: Decodable { let kimlik: String; let uuid: String }
struct IptalKaydi: Decodable { let kimlik: String; let caliyor: Bool }
struct IptalOrnegi: Decodable { let ad: String; let kayitlar: [IptalKaydi]; let calaniDurdur: Bool; let beklenen: [String] }
struct TurOrnegi: Decodable { let kimlik: String; let beklenen: String }
struct AlarmKitFiksturu: Decodable {
    let uuidler: [UuidOrnegi]
    let turler: [TurOrnegi]
    let iptalSecimi: [IptalOrnegi]
}

let akf = oku(argumanlar[1], AlarmKitFiksturu.self)
for o in akf.uuidler {
    esitMi(AlarmKurallari.uuidMetni(o.kimlik), o.uuid, "uuid '\(o.kimlik)'")
    // UUID(uuidString:) gecerli bicimi kabul etmeli (AlarmKit `UUID` ister).
    esitMi(AlarmKurallari.uuid(o.kimlik).uuidString.lowercased(), o.uuid, "UUID nesnesi '\(o.kimlik)'")
}
for o in akf.turler {
    esitMi(AlarmKurallari.alarmTuru(o.kimlik), o.beklenen, "tur: \(o.kimlik)")
}
for o in akf.iptalSecimi {
    // Native taraf CALAN alarmi UUID'den tanir (AlarmKit `Alarm` kimligimizi tasimaz).
    let calan = Set(o.kayitlar.filter(\.caliyor).map { AlarmKurallari.uuidMetni($0.kimlik).uppercased() })
    esitMi(
        AlarmKurallari.iptalSecimi(kimlikler: o.kayitlar.map(\.kimlik), calanUuidler: calan, calaniDurdur: o.calaniDurdur),
        o.beklenen,
        "iptal secimi: \(o.ad)"
    )
}

// MARK: - 2) Plan kimligi (Android/JS ortak fikstürü muhafiz-plan-kimligi-ornekleri.json)

struct KimlikOrnegi: Decodable { let kimlik: String; let planMi: Bool; let kalanDk: Int64?; let eskiErtelemeMi: Bool }
struct PlanKimligiFiksturu: Decodable { let kimlikler: [KimlikOrnegi] }

let pkf = oku(argumanlar[2], PlanKimligiFiksturu.self)
for o in pkf.kimlikler {
    esitMi(AlarmKurallari.planKimligiMi(o.kimlik), o.planMi, "planMi '\(o.kimlik)'")
    esitMi(AlarmKurallari.kalanDk(o.kimlik), o.kalanDk, "kalanDk '\(o.kimlik)'")
    esitMi(AlarmKurallari.eskiErtelemeKimligiMi(o.kimlik), o.eskiErtelemeMi, "eskiErtelemeMi '\(o.kimlik)'")
}
let vakitCoz = AlarmKurallari.kimliktenVakit("muhafiz_2026-10-13_vakit_ikindi_seviye_2_dk_25")
esitMi(vakitCoz?.tarih, "2026-10-13", "kimliktenVakit tarih")
esitMi(vakitCoz?.vakit, "ikindi", "kimliktenVakit vakit")
esitMi(AlarmKurallari.vakitOneki(tarih: "2026-10-13", vakit: "ikindi"), "muhafiz_2026-10-13_vakit_ikindi", "vakit oneki")
esitMi(AlarmKurallari.kimliktenVakit("muhasebe_2026-10-13")?.vakit, nil, "muhafiz disi kimlik cozulmez")

// Nafile alarmi (issue #74): Kildim FARZ yazmasin diye kimlikten AYRI cozulur.
let nafileCoz = AlarmKurallari.kimliktenNafile("nafile_2026-10-13_teheccud_1")
esitMi(nafileCoz?.tarih, "2026-10-13", "kimliktenNafile tarih")
esitMi(nafileCoz?.tur, "teheccud", "kimliktenNafile tur")
esitMi(AlarmKurallari.kimliktenVakit("nafile_2026-10-13_teheccud_1")?.vakit, nil, "nafile kimligi muhafiz vakti DEGIL")
esitMi(AlarmKurallari.kimliktenNafile("muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45")?.tur, nil, "muhafiz kimligi nafile DEGIL")
esitMi(AlarmKurallari.kimliktenNafile("nafile_2026-10-13_bilinmeyen_1")?.tur, nil, "bilinmeyen tur cozulmez")
esitMi(AlarmKurallari.nafileOneki(tarih: "2026-10-13", tur: "kusluk"), "nafile_2026-10-13_kusluk_", "nafile oneki")

// MARK: - 3) AlarmDeposu (gecici UserDefaults suite)

let suite = "namazakisi.alarmkit.test.\(UUID().uuidString)"
guard let defaults = UserDefaults(suiteName: suite) else {
    print("UserDefaults suite acilamadi")
    exit(2)
}
let depo = AlarmDeposu(defaults: defaults)
let cikis: Int64 = 1_800_003_600_000
func kayit(_ kimlik: String, _ tetik: Int64) -> AlarmKaydi {
    return AlarmKaydi(
        kimlik: kimlik, tetikMs: tetik, baslik: "Öğle · 45 dk kaldı ⏰", vakit: "ogle", tarih: "2026-10-13",
        cikisMs: cikis
    )
}
let plan45 = kayit("muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45", cikis - 45 * 60_000)
let plan10 = kayit("muhafiz_2026-10-13_vakit_ogle_seviye_3_dk_10", cikis - 10 * 60_000)
let muhasebe = kayit("muhafiz_2026-10-13_vakit_ogle_muhasebe", cikis - 30 * 60_000)
let baska = AlarmKaydi(
    kimlik: "muhafiz_2026-10-13_vakit_ikindi_seviye_1_dk_45", tetikMs: cikis, baslik: "İkindi", vakit: "ikindi",
    tarih: "2026-10-13", cikisMs: cikis
)
for k in [plan10, muhasebe, plan45, baska] { depo.yaz(k) }
esitMi(depo.kayitlar().map(\.kimlik), [plan45.kimlik, muhasebe.kimlik, plan10.kimlik, baska.kimlik], "kayitlar tetik sirali")
depo.yaz(plan45)
esitMi(depo.kayitlar().count, 4, "ayni kimlik yeniden yazilinca COGALMAZ")
esitMi(depo.kayit(plan45.kimlik), plan45, "kayit geri okunur")
esitMi(AlarmKaydi.coz("{bozuk"), nil, "bozuk JSON kayit uretmez")
let jsonVeri = try! JSONEncoder().encode(plan45)
esitMi(AlarmKaydi.coz(String(data: jsonVeri, encoding: .utf8)!), plan45, "JSON gidis-donus")
// Guncelleme ONCESI kayit eski erteleme alanlarini tasir: yok sayilir, kayit cozulur.
let eskiJson = #"{"kimlik":"muhafiz_2026-10-13_vakit_ogle_ertele","tetikMs":1,"baslik":"x","vakit":"ogle","tarih":"2026-10-13","cikisMs":2,"erteleSinirMs":3,"ertelemeBasligi":"y"}"#
esitMi(AlarmKaydi.coz(eskiJson)?.kimlik, "muhafiz_2026-10-13_vakit_ogle_ertele", "eski kayit (erteleme alanli) cozulur")

esitMi(depo.onekliKimlikler("muhafiz_2026-10-13_vakit_ogle").sorted(), [plan45.kimlik, plan10.kimlik, muhasebe.kimlik].sorted(), "Kildim onegi plan + muhasebe")

let kalanlar = depo.buda(canliUuidler: Set([plan10.uuidMetni.uppercased(), muhasebe.uuidMetni]))
esitMi(kalanlar.map(\.kimlik), [muhasebe.kimlik, plan10.kimlik], "buda: yalniz canlilar (buyuk/kucuk harf duyarsiz)")
esitMi(depo.buda(canliUuidler: nil).count, 2, "sistem listesi okunamazsa BUDANMAZ")
depo.sil([plan10.kimlik])
esitMi(depo.kayitlar().map(\.kimlik), [muhasebe.kimlik], "sil")
esitMi(AlarmDeposu.listeJson(depo.kayitlar()).contains("\"tetikMs\""), true, "liste JSON tetikMs tasir")
esitMi(AlarmDeposu.listeJson(depo.kayitlar()).contains("caliyor"), false, "calmayan kayitta caliyor alani YOK")
esitMi(
    AlarmDeposu.listeJson(depo.kayitlar(), calanUuidler: [muhasebe.uuidMetni.uppercased()]).contains("\"caliyor\":true"),
    true,
    "calan kayit isaretlenir (buyuk/kucuk harf duyarsiz)"
)
depo.nafileKildimEkle(tarih: "2026-10-13", tur: "teheccud")
depo.nafileKildimEkle(tarih: "2026-10-13", tur: "teheccud")
depo.nafileKildimEkle(tarih: "2026-10-14", tur: "kusluk")
esitMi(depo.nafileKildimleriniAl(), ["2026-10-13_teheccud", "2026-10-14_kusluk"], "nafile Kildim kuyrugu tekil")
esitMi(depo.nafileKildimleriniAl(), [], "nafile Kildim kuyrugu okununca BOSALIR")
defaults.removePersistentDomain(forName: suite)

// MARK: - Sonuc

if hatalar.isEmpty {
    print("AlarmKit cekirdegi: \(gecen) kontrol gecti")
    exit(0)
}
print("AlarmKit cekirdegi: \(hatalar.count) HATA (\(gecen) gecti)")
for h in hatalar { print("  ✗ \(h)") }
exit(1)
