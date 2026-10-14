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
//     android/app/src/test/resources/erteleme-ornekleri.json
//
// Fikstürler JS (`src/core/muhafiz/ios/__tests__/alarmKit.test.ts`,
// `src/core/muhafiz/__tests__/erteleme.test.ts`) ve Kotlin (`ErtelemeKurallariTest`)
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
    print("Kullanim: alarmkit-test <alarmkit-ornek.json> <erteleme-ornekleri.json>")
    exit(2)
}

// MARK: - 1) Kimlik → UUID ve ikincil dugme (alarmkit-ornek.json)

struct UuidOrnegi: Decodable { let kimlik: String; let uuid: String }
struct DugmeOrnegi: Decodable { let ad: String; let tetikMs: Int64; let erteleSinirMs: Int64; let beklenen: String }
struct IptalKaydi: Decodable { let kimlik: String; let caliyor: Bool }
struct IptalOrnegi: Decodable { let ad: String; let kayitlar: [IptalKaydi]; let calaniDurdur: Bool; let beklenen: [String] }
struct AlarmKitFiksturu: Decodable {
    let uuidler: [UuidOrnegi]
    let dugmeler: [DugmeOrnegi]
    let iptalSecimi: [IptalOrnegi]
}

let akf = oku(argumanlar[1], AlarmKitFiksturu.self)
for o in akf.uuidler {
    esitMi(AlarmKurallari.uuidMetni(o.kimlik), o.uuid, "uuid '\(o.kimlik)'")
    // UUID(uuidString:) gecerli bicimi kabul etmeli (AlarmKit `UUID` ister).
    esitMi(AlarmKurallari.uuid(o.kimlik).uuidString.lowercased(), o.uuid, "UUID nesnesi '\(o.kimlik)'")
}
for o in akf.dugmeler {
    esitMi(AlarmKurallari.ikincilDugme(tetikMs: o.tetikMs, erteleSinirMs: o.erteleSinirMs), o.beklenen, "dugme: \(o.ad)")
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

// MARK: - 2) Erteleme kurallari (Android/JS ortak fikstürü)

struct HedefOrnegi: Decodable { let ad: String; let simdiMs: Int64; let sureDk: Int64; let sinirMs: Int64; let beklenen: Int64? }
struct KimlikOrnegi: Decodable { let kimlik: String; let planMi: Bool; let kalanDk: Int64?; let ertelemeMi: Bool }
struct SureOrnegi: Decodable { let dk: Double; let metin: String }
struct BaslikOrnegi: Decodable { let ad: String; let sablon: String?; let cikisMs: Int64; let hedefMs: Int64; let beklenen: String? }
struct SusturmaOrnegi: Decodable { let tetikMs: Int64; let hedefMs: Int64; let beklenen: Bool }
struct ErtelemeKimligiOrnegi: Decodable { let tarih: String; let vakit: String; let kimlik: String }
struct SecenekOrnegi: Decodable { let ad: String; let tetikMs: Int64; let sinirMs: Int64; let beklenen: [Int] }
struct ErtelemeFiksturu: Decodable {
    let secenekler: [SecenekOrnegi]
    let hedef: [HedefOrnegi]
    let kimlikler: [KimlikOrnegi]
    let sureMetni: [SureOrnegi]
    let baslik: [BaslikOrnegi]
    let susturma: [SusturmaOrnegi]
    let ertelemeKimligi: [ErtelemeKimligiOrnegi]
}

let ef = oku(argumanlar[2], ErtelemeFiksturu.self)
for o in ef.secenekler {
    esitMi(AlarmKurallari.ertelemeSecenegiVarMi(tetikMs: o.tetikMs, sinirMs: o.sinirMs), !o.beklenen.isEmpty, "secenek var mi: \(o.ad)")
}
for o in ef.hedef {
    esitMi(AlarmKurallari.ertelemeHedefi(simdiMs: o.simdiMs, sureDk: o.sureDk, sinirMs: o.sinirMs), o.beklenen, "hedef: \(o.ad)")
}
for o in ef.kimlikler {
    esitMi(AlarmKurallari.planKimligiMi(o.kimlik), o.planMi, "planMi '\(o.kimlik)'")
    esitMi(AlarmKurallari.kalanDk(o.kimlik), o.kalanDk, "kalanDk '\(o.kimlik)'")
    esitMi(AlarmKurallari.ertelemeKimligiMi(o.kimlik), o.ertelemeMi, "ertelemeMi '\(o.kimlik)'")
}
for o in ef.sureMetni {
    esitMi(AlarmKurallari.sureMetni(o.dk), o.metin, "sureMetni \(o.dk)")
}
for o in ef.baslik {
    esitMi(AlarmKurallari.ertelemeBasligi(sablon: o.sablon, cikisMs: o.cikisMs, hedefMs: o.hedefMs), o.beklenen, "baslik: \(o.ad)")
}
for o in ef.susturma {
    esitMi(AlarmKurallari.ertelemedeSusturulurMu(tetikMs: o.tetikMs, hedefMs: o.hedefMs), o.beklenen, "susturma \(o.tetikMs)")
}
for o in ef.ertelemeKimligi {
    esitMi(AlarmKurallari.ertelemeKimligi(tarih: o.tarih, vakit: o.vakit), o.kimlik, "ertelemeKimligi")
    let coz = AlarmKurallari.kimliktenVakit(o.kimlik)
    esitMi(coz?.tarih, o.tarih, "kimliktenVakit tarih")
    esitMi(coz?.vakit, o.vakit, "kimliktenVakit vakit")
}
esitMi(AlarmKurallari.kimliktenVakit("muhasebe_2026-10-13")?.vakit, nil, "muhafiz disi kimlik cozulmez")

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
        cikisMs: cikis, erteleSinirMs: cikis - 180_000, ertelemeBasligi: "Öğle · {sure} kaldı · ertelediğin namaz ⏳"
    )
}
let plan45 = kayit("muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_45", cikis - 45 * 60_000)
let plan10 = kayit("muhafiz_2026-10-13_vakit_ogle_seviye_3_dk_10", cikis - 10 * 60_000)
let ertele = kayit("muhafiz_2026-10-13_vakit_ogle_ertele", cikis - 30 * 60_000)
let baska = AlarmKaydi(
    kimlik: "muhafiz_2026-10-13_vakit_ikindi_seviye_1_dk_45", tetikMs: cikis, baslik: "İkindi", vakit: "ikindi",
    tarih: "2026-10-13", cikisMs: cikis, erteleSinirMs: 0, ertelemeBasligi: ""
)
for k in [plan10, ertele, plan45, baska] { depo.yaz(k) }
esitMi(depo.kayitlar().map(\.kimlik), [plan45.kimlik, ertele.kimlik, plan10.kimlik, baska.kimlik], "kayitlar tetik sirali")
depo.yaz(plan45)
esitMi(depo.kayitlar().count, 4, "ayni kimlik yeniden yazilinca COGALMAZ")
esitMi(depo.kayit(plan45.kimlik), plan45, "kayit geri okunur")
esitMi(AlarmKaydi.coz("{bozuk"), nil, "bozuk JSON kayit uretmez")
let jsonVeri = try! JSONEncoder().encode(plan45)
esitMi(AlarmKaydi.coz(String(data: jsonVeri, encoding: .utf8)!), plan45, "JSON gidis-donus")

esitMi(depo.onekliKimlikler("muhafiz_2026-10-13_vakit_ogle").sorted(), [plan45.kimlik, plan10.kimlik, ertele.kimlik].sorted(), "Kildim onegi plan + erteleme")
// 45 dk kala ertelenip 20 dk sonraya → hedef = cikis − 25 dk: yalniz 45'lik PLAN susar (erteleme ve baska vakit kalir).
esitMi(depo.susturulacaklar(tarih: "2026-10-13", vakit: "ogle", hedefMs: cikis - 25 * 60_000), [plan45.kimlik], "erteleme araligi")

let kalanlar = depo.buda(canliUuidler: Set([plan10.uuidMetni.uppercased(), ertele.uuidMetni]))
esitMi(kalanlar.map(\.kimlik), [ertele.kimlik, plan10.kimlik], "buda: yalniz canlilar (buyuk/kucuk harf duyarsiz)")
esitMi(depo.buda(canliUuidler: nil).count, 2, "sistem listesi okunamazsa BUDANMAZ")
depo.sil([plan10.kimlik])
esitMi(depo.kayitlar().map(\.kimlik), [ertele.kimlik], "sil")
esitMi(AlarmDeposu.listeJson(depo.kayitlar()).contains("\"tetikMs\""), true, "liste JSON tetikMs tasir")
esitMi(AlarmDeposu.listeJson(depo.kayitlar()).contains("caliyor"), false, "calmayan kayitta caliyor alani YOK")
esitMi(
    AlarmDeposu.listeJson(depo.kayitlar(), calanUuidler: [ertele.uuidMetni.uppercased()]).contains("\"caliyor\":true"),
    true,
    "calan kayit isaretlenir (buyuk/kucuk harf duyarsiz)"
)
defaults.removePersistentDomain(forName: suite)

// MARK: - Sonuc

if hatalar.isEmpty {
    print("AlarmKit cekirdegi: \(gecen) kontrol gecti")
    exit(0)
}
print("AlarmKit cekirdegi: \(hatalar.count) HATA (\(gecen) gecti)")
for h in hatalar { print("  ✗ \(h)") }
exit(1)
