// Siri / Kisayollar Swift cekirdeginin test kosucusu (issue #279).
//
// iOS SDK ve Xcode projesi GEREKMEZ: `VakitKarari.swift` ve `SiriDeposu.swift` yalniz
// Foundation kullanir. macOS CI (ve Swift toolchain'li Linux) uzerinde:
//
//   swiftc -o /tmp/siri-test \
//     modules/expo-siri-kisayollari/ios/VakitKarari.swift \
//     modules/expo-siri-kisayollari/ios/SiriDeposu.swift \
//     modules/expo-siri-kisayollari/ios/WidgetKarari.swift \
//     modules/expo-siri-kisayollari/ios/SessizlikKarari.swift \
//     modules/expo-siri-kisayollari/ios/OtomasyonKarari.swift \
//     modules/expo-siri-kisayollari/test/main.swift
//   /tmp/siri-test android/app/src/test/resources/widget-ornek.json \
//     modules/expo-siri-kisayollari/test/siri-ornek.json \
//     modules/expo-siri-kisayollari/test/widget-ios-ornek.json
//
// Fikstürler JS (`src/core/siri/__tests__/siriKarari.test.ts`,
// `src/core/widget/__tests__/widgetYuku.test.ts`) ve Kotlin (`VakitCizelgesiTest`)
// testleriyle ORTAKTIR. iOS widget fikstürü (#295, ucuncu arguman)
// `src/core/widget/__tests__/iosWidgetKarari.test.ts` ile ortaktir. Duvar kagidi tasarim ornegi
// (`duvar-tasarim-ornek.json`, §14) arguman olarak VERILMEZ: 1. argumanin dizininden okunur.
// Herhangi bir uyusmazlikta cikis kodu 1'dir.

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
    print("Kullanim: siri-test <widget-ornek.json> <siri-ornek.json>")
    exit(2)
}

// MARK: - 1) aktifVakitBul — widget/Kotlin ortak fikstürü

struct VakitOzeti: Decodable, Equatable, CustomStringConvertible {
    let vakit: String
    let tarih: String
    var description: String { "\(vakit)@\(tarih)" }
}

struct WidgetDurum: Decodable {
    let ad: String
    let simdiMs: Int64
    let aktif: VakitOzeti?
    let bitisMs: Int64?
    let sonraki: VakitOzeti?
}

struct WidgetOrnek: Decodable {
    let vakitler: [SiriVakitAni]
    let durumlar: [WidgetDurum]
}

let widget = oku(argumanlar[1], WidgetOrnek.self)
let ozet: (SiriVakitAni?) -> VakitOzeti? = { $0.map { VakitOzeti(vakit: $0.vakit, tarih: $0.tarih) } }

for d in widget.durumlar {
    let sonuc = VakitKarari.aktifVakitBul(widget.vakitler, simdiMs: d.simdiMs)
    esitMi(ozet(sonuc.aktif), d.aktif, "aktifVakitBul[\(d.ad)].aktif")
    esitMi(sonuc.bitisMs, d.bitisMs, "aktifVakitBul[\(d.ad)].bitisMs")
    esitMi(ozet(sonuc.sonraki), d.sonraki, "aktifVakitBul[\(d.ad)].sonraki")
}
esitMi(
    VakitKarari.aktifVakitBul(widget.vakitler.reversed(), simdiMs: widget.durumlar[0].simdiMs),
    VakitKarari.aktifVakitBul(widget.vakitler, simdiMs: widget.durumlar[0].simdiMs),
    "aktifVakitBul siralanmamis veride ayni"
)

// MARK: - 2) Siri karari ve metinleri — siri-ornek.json

struct BeklenenKildim: Decodable, Equatable, CustomStringConvertible {
    let tur: String
    let tarih: String?
    let kayitVakti: String?
    let ad: String?
    let siradaki: VakitOzeti??
    var description: String { "\(tur) \(tarih ?? "-") \(kayitVakti ?? "-") \(ad ?? "-") \(String(describing: siradaki))" }

    enum CodingKeys: String, CodingKey { case tur, tarih, kayitVakti, ad, siradaki }

    init(tur: String, tarih: String?, kayitVakti: String?, ad: String?, siradaki: VakitOzeti??) {
        self.tur = tur
        self.tarih = tarih
        self.kayitVakti = kayitVakti
        self.ad = ad
        self.siradaki = siradaki
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        tur = try c.decode(String.self, forKey: .tur)
        tarih = try c.decodeIfPresent(String.self, forKey: .tarih)
        kayitVakti = try c.decodeIfPresent(String.self, forKey: .kayitVakti)
        ad = try c.decodeIfPresent(String.self, forKey: .ad)
        // `siradaki` yalniz vakitYok'ta VAR (null olabilir); digerlerinde alan yok.
        siradaki = c.contains(.siradaki) ? .some(try c.decodeIfPresent(VakitOzeti.self, forKey: .siradaki)) : .none
    }
}

struct SiriBeklenen: Decodable {
    let siradakiMetni: String
    let kildim: BeklenenKildim
    let kildimMetni: String
    let onayMetni: String?
}

struct SiriDurum: Decodable {
    let ad: String
    let simdiMs: Int64
    let bugun: String
    let kilinanlar: [String: [String]]
    let bekleyenler: [SiriBekleyenKildim]
    let beklenen: SiriBeklenen
}

struct SiriOrnek: Decodable {
    let saatDilimi: String
    let vakitler: [SiriVakitAni]
    let durumlar: [SiriDurum]
}

let siri = oku(argumanlar[2], SiriOrnek.self)
esitMi(siri.vakitler, widget.vakitler, "siri-ornek vakitleri widget-ornek ile ayni")
guard let istanbul = TimeZone(identifier: siri.saatDilimi) else {
    print("Saat dilimi bulunamadi: \(siri.saatDilimi)")
    exit(2)
}
let saat = SiriDeposu.saatBicimleyici(istanbul)

for d in siri.durumlar {
    let karar = VakitKarari.kildimKarari(
        vakitler: siri.vakitler, kilinanlar: d.kilinanlar, bekleyenler: d.bekleyenler, simdiMs: d.simdiMs
    )
    let kararOzeti: BeklenenKildim
    var onay: String? = nil
    switch karar {
    case let .aday(vakit, kayitVakti, ad):
        kararOzeti = BeklenenKildim(tur: "aday", tarih: vakit.tarih, kayitVakti: kayitVakti, ad: ad, siradaki: .none)
        onay = VakitKarari.onayMetni(ad)
    case let .zatenKilindi(ad):
        kararOzeti = BeklenenKildim(tur: "zatenKilindi", tarih: nil, kayitVakti: nil, ad: ad, siradaki: .none)
    case let .vakitYok(siradaki):
        kararOzeti = BeklenenKildim(tur: "vakitYok", tarih: nil, kayitVakti: nil, ad: nil, siradaki: .some(ozet(siradaki)))
    }
    esitMi(kararOzeti, d.beklenen.kildim, "kildimKarari[\(d.ad)]")
    esitMi(VakitKarari.kildimMetni(karar, bugun: d.bugun, saat: saat), d.beklenen.kildimMetni, "kildimMetni[\(d.ad)]")
    esitMi(onay, d.beklenen.onayMetni, "onayMetni[\(d.ad)]")

    let durum = VakitKarari.aktifVakitBul(siri.vakitler, simdiMs: d.simdiMs)
    esitMi(
        VakitKarari.siradakiNamazMetni(
            durum: durum, kilinanlar: d.kilinanlar, bekleyenler: d.bekleyenler, bugun: d.bugun, saat: saat
        ),
        d.beklenen.siradakiMetni,
        "siradakiNamazMetni[\(d.ad)]"
    )
}

// MARK: - 3) SiriDeposu — kuyruk, odak, ekran istegi

let suite = "namazakisi.siri.test.\(UUID().uuidString)"
guard let defaults = UserDefaults(suiteName: suite) else {
    print("Gecici UserDefaults kurulamadi")
    exit(2)
}
let depo = SiriDeposu(defaults: defaults)

esitMi(depo.cizelge() == nil, true, "bos depoda cizelge yok")
esitMi(depo.kilinanlar(), [:], "bos depoda kilinan yok")
esitMi(depo.bekleyenleriJson(), "[]", "bos kuyruk")

depo.cizelgeyiYaz(String(data: try! JSONEncoder().encode(SiriCizelge(surum: 2, tarih: "2026-06-21", vakitler: widget.vakitler)), encoding: .utf8)!)
esitMi(depo.cizelge()?.vakitler ?? [], widget.vakitler, "cizelge geri okunur")
depo.kilinanlariYaz("{\"2026-06-21\":[\"sabah\",\"ogle\"]}")
esitMi(depo.kilinanlar(), ["2026-06-21": ["sabah", "ogle"]], "kilinanlar geri okunur")
depo.kilinanlariYaz("bozuk{")
esitMi(depo.kilinanlar(), [:], "bozuk kilinanlar bos sayilir (cokmez)")

esitMi(depo.kildimEkle(tarih: "2026-06-21", vakit: "ogle", kaynak: "siri", simdiMs: 1), true, "kildim eklenir")
// Kaynak ikizi: cihaz agi kaynagi ortak fiksturde (Kotlin KAYNAKLAR) bulunmali.
if argumanlar.count > 4 {
    struct Kaynaklar: Decodable { let kaynaklar: [String] }
    let kaynaklar = oku(argumanlar[4], Kaynaklar.self).kaynaklar
    esitMi(kaynaklar.contains(SiriDeposu.cihazKaynagi), true, "cihaz kaynagi fiksturde")
}
esitMi(depo.kildimEkle(tarih: "2026-06-21", vakit: "ogle", kaynak: "siri", simdiMs: 2), false, "ayni vakit ikinci kez eklenmez")
esitMi(depo.bekleyenler(), [SiriBekleyenKildim(tarih: "2026-06-21", vakit: "ogle")], "bekleyen gorunur")

struct JsOgesi: Decodable { let id: String; let tarih: String; let vakit: String; let kaynak: String }
let jsListe = try! JSONDecoder().decode([JsOgesi].self, from: depo.bekleyenleriJson().data(using: .utf8)!)
esitMi(jsListe.count, 1, "JS kuyruk sekli: tek oge")
esitMi(jsListe.first?.kaynak, "siri", "JS kuyruk sekli: kaynak")
let ilkId = jsListe.first!.id

for _ in 1..<SiriDeposu.azamiDeneme { depo.basarisiz(ilkId) }
esitMi(depo.bekleyenler().count, 1, "esik altinda basarisiz oge kuyrukta kalir")
depo.basarisiz(ilkId)
esitMi(depo.bekleyenler().count, 0, "zehirli oge esikte duser")

depo.kildimEkle(tarih: "2026-06-21", vakit: "ikindi", kaynak: "siri", simdiMs: 3)
let ikinciId = try! JSONDecoder().decode([JsOgesi].self, from: depo.bekleyenleriJson().data(using: .utf8)!).first!.id
depo.tamamlandi(ikinciId)
esitMi(depo.bekleyenler().count, 0, "tamamlanan oge duser")

for i in 0..<(SiriDeposu.azamiKuyruk + 5) {
    depo.kildimEkle(tarih: "2026-01-\(i)", vakit: "ogle", kaynak: "siri", simdiMs: Int64(i))
}
esitMi(depo.bekleyenler().count, SiriDeposu.azamiKuyruk, "kuyruk tavani")
esitMi(depo.bekleyenler().first?.tarih, "2026-01-5", "tavanda EN ESKILER duser")

esitMi(depo.odakJson() == nil, true, "odak yokken nil")
depo.odakYaz(sessiz: true, simdiMs: 1_000)
esitMi(depo.odakJson(), "{\"sessiz\":true,\"ms\":1000}", "odak JSON sekli (TS odakDurumunuCoz okur)")

depo.ekranIstegiYaz("kible", simdiMs: 10_000)
esitMi(depo.ekranIstegiAl(simdiMs: 11_000), "kible", "taze ekran istegi doner")
esitMi(depo.ekranIstegiAl(simdiMs: 11_000), nil, "ekran istegi TUKETILIR (ikinci kez donmez)")
depo.ekranIstegiYaz("kible", simdiMs: 10_000)
esitMi(depo.ekranIstegiAl(simdiMs: 10_000 + SiriDeposu.ekranIstegiTazelikMs + 1), nil, "bayat ekran istegi yok sayilir")

var duyurulan: [String] = []
let gozlemci = NotificationCenter.default.addObserver(
    forName: SiriDeposu.degisiklikBildirimi, object: nil, queue: nil
) { n in duyurulan.append((n.userInfo?["tur"] as? String) ?? "?") }
depo.kildimEkle(tarih: "2026-02-01", vakit: "aksam", kaynak: "siri", simdiMs: 1)
depo.odakYaz(sessiz: false, simdiMs: 2)
depo.ekranIstegiYaz("kible", simdiMs: 3)
NotificationCenter.default.removeObserver(gozlemci)
esitMi(duyurulan, ["kildim", "odak", "ekran"], "her degisiklik duyurulur")

esitMi(SiriDeposu.bugunIso(Date(timeIntervalSince1970: 1782080400), saatDilimi: istanbul), "2026-06-22", "bugunIso takvim gunu (01:00 +03)")

defaults.removePersistentDomain(forName: suite)

// MARK: - 4) App Group gocu (issue #295) — standart → suite, bir kez, kaynagi silmeden

let kaynakAd = "namazakisi.siri.test.kaynak.\(UUID().uuidString)"
let hedefAd = "namazakisi.siri.test.hedef.\(UUID().uuidString)"
let gocKaynak = UserDefaults(suiteName: kaynakAd)!
let gocHedef = UserDefaults(suiteName: hedefAd)!
gocKaynak.set("{\"sessiz\":true,\"ms\":5}", forKey: "namazakisi.siri.odak")
gocKaynak.set("[]", forKey: "namazakisi.siri.kildimKuyrugu")
gocKaynak.set("eski", forKey: "namazakisi.siri.cizelge")
gocHedef.set("yeni", forKey: "namazakisi.siri.cizelge")
SiriDeposu.gocEt(kaynak: gocKaynak, hedef: gocHedef)
esitMi(SiriDeposu(defaults: gocHedef).odakJson(), "{\"sessiz\":true,\"ms\":5}", "goc: odak suite'e tasinir")
esitMi(gocHedef.string(forKey: "namazakisi.siri.kildimKuyrugu"), "[]", "goc: kuyruk suite'e tasinir")
esitMi(gocHedef.string(forKey: "namazakisi.siri.cizelge"), "yeni", "goc: hedefte olan anahtar EZILMEZ")
// Olay anahtarlari kaynaktan SILINIR: depo .standard'a geri duserse bayat kuyruk
// yeniden islenip geri alinan vakti tekrar "kilindi" yapmasin.
esitMi(gocKaynak.object(forKey: "namazakisi.siri.kildimKuyrugu") == nil, true, "goc: kaynaktaki kuyruk SILINIR")
esitMi(gocKaynak.object(forKey: "namazakisi.siri.odak") == nil, true, "goc: kaynaktaki odak SILINIR")
esitMi(gocKaynak.string(forKey: "namazakisi.siri.cizelge"), "eski", "goc: kaynaktaki cizelge KALIR")
esitMi(SiriDeposu(defaults: gocKaynak).bekleyenler(), [], "goc: geri dusulen depoda bekleyen YOK")
gocKaynak.set("{\"sessiz\":false,\"ms\":9}", forKey: "namazakisi.siri.odak")
gocHedef.removeObject(forKey: "namazakisi.siri.odak")
SiriDeposu.gocEt(kaynak: gocKaynak, hedef: gocHedef)
esitMi(gocHedef.string(forKey: "namazakisi.siri.odak"), nil, "goc: ikinci kez CALISMAZ (idempotent)")
gocKaynak.removePersistentDomain(forName: kaynakAd)
gocHedef.removePersistentDomain(forName: hedefAd)

// MARK: - 5) iOS widget gorunum karari — widget-ios-ornek.json (istege bagli 3. arguman)

struct WidgetIosBeklenen: Decodable {
    let aktif: VakitOzeti?
    let bitisMs: Int64?
    let kilindi: Bool
    let sonraki: VakitOzeti?
    let gunTarihi: String?
    let sinirlar: [Int64]
}
struct WidgetIosDurum: Decodable {
    let ad: String
    let simdiMs: Int64
    let kilinanlar: [String: [String]]
    let bekleyenler: [SiriBekleyenKildim]
    let azamiSinir: Int
    let beklenen: WidgetIosBeklenen
}
struct WidgetIosGun: Decodable {
    let tarih: String
    let beklenen: [String]
}
struct WidgetIosOrnek: Decodable {
    let durumlar: [WidgetIosDurum]
    let gunler: [WidgetIosGun]
}

if argumanlar.count >= 4 {
    let wi = oku(argumanlar[3], WidgetIosOrnek.self)
    for d in wi.durumlar {
        let g = WidgetKarari.gorunum(
            vakitler: widget.vakitler, kilinanlar: d.kilinanlar, bekleyenler: d.bekleyenler, simdiMs: d.simdiMs
        )
        esitMi(ozet(g.aktif), d.beklenen.aktif, "widgetGorunum[\(d.ad)].aktif")
        esitMi(g.bitisMs, d.beklenen.bitisMs, "widgetGorunum[\(d.ad)].bitisMs")
        esitMi(g.kilindi, d.beklenen.kilindi, "widgetGorunum[\(d.ad)].kilindi")
        esitMi(ozet(g.sonraki), d.beklenen.sonraki, "widgetGorunum[\(d.ad)].sonraki")
        esitMi(g.gunTarihi, d.beklenen.gunTarihi, "widgetGorunum[\(d.ad)].gunTarihi")
        esitMi(
            WidgetKarari.sinirlar(widget.vakitler, simdiMs: d.simdiMs, azami: d.azamiSinir),
            d.beklenen.sinirlar,
            "widgetSinirlari[\(d.ad)]"
        )
    }
    for g in wi.gunler {
        esitMi(
            WidgetKarari.gunVakitleri(widget.vakitler, tarih: g.tarih).map { $0.vakit },
            g.beklenen,
            "gunVakitleri[\(g.tarih)]"
        )
    }
    esitMi(
        WidgetKarari.sinirlar(widget.vakitler, simdiMs: widget.vakitler[0].ms - 1).count,
        WidgetKarari.azamiSinir,
        "varsayilan sinir tavani (TS IOS_WIDGET_AZAMI_SINIR ile ayni)"
    )
}

// MARK: - 6) Widget / canli etkinlik "Kildim" dugmesi — dokunus aninda yeniden karar

if let ogle = widget.vakitler.first(where: { $0.vakit == "ogle" }) {
    let dokunus = ogle.ms + 60_000
    func dugme(_ vakit: String, kilinan: [String: [String]] = [:], bekleyen: [SiriBekleyenKildim] = [], vakitler: [SiriVakitAni]? = widget.vakitler) -> WidgetDugmeKarari {
        return WidgetKarari.dugmeKarari(
            tarih: ogle.tarih, vakit: vakit, vakitler: vakitler, kilinanlar: kilinan, bekleyenler: bekleyen, simdiMs: dokunus
        )
    }
    esitMi(dugme("ogle"), .isaretle, "dugme: aktif ve kilinmamis vakit isaretlenir")
    esitMi(dugme("imsak"), .gecersiz, "dugme: bayat cizim (vakit cikti) YAZMAZ ve etkinligi KAPATMAZ")
    esitMi(dugme("imsak", kilinan: [ogle.tarih: ["sabah"]]), .zatenKilindi, "dugme: kayitta (widget kodu sabah) → zaten kilindi")
    esitMi(dugme("ogle", bekleyen: [SiriBekleyenKildim(tarih: ogle.tarih, vakit: "ogle")]), .zatenKilindi, "dugme: kuyrukta → zaten kilindi")
    esitMi(dugme("ogle", vakitler: nil), .gecersiz, "dugme: cizelge yoksa gecersiz")
    // Kontrol Merkezi kontrolu: ayni karar, bos aday dokunusta gecersiz olur.
    let k1 = WidgetKarari.kontrolDurumu(vakitler: widget.vakitler, kilinanlar: [:], bekleyenler: [], simdiMs: dokunus)
    esitMi(k1, WidgetKontrolDurumu(tur: .kilinabilir, baslik: "Öğle · Kıldım", tarih: ogle.tarih, vakit: "ogle"), "kontrol: aktif vakit kilinabilir")
    esitMi(dugme(k1.vakit), .isaretle, "kontrol: tasidigi aday dokunusta isaretlenir")
    let k2 = WidgetKarari.kontrolDurumu(vakitler: widget.vakitler, kilinanlar: [ogle.tarih: ["ogle"]], bekleyenler: [], simdiMs: dokunus)
    esitMi(k2.tur, .kilindi, "kontrol: kilinmis vakit")
    esitMi(k2.vakit, "", "kontrol: kilinmis vakitte aday yok")
    esitMi(WidgetKarari.kontrolDurumu(vakitler: nil, kilinanlar: [:], bekleyenler: [], simdiMs: dokunus).tur, .vakitYok, "kontrol: cizelge yok")
    let gunes = widget.vakitler.first(where: { $0.vakit == "gunes" })!
    esitMi(WidgetKarari.kontrolDurumu(vakitler: widget.vakitler, kilinanlar: [:], bekleyenler: [], simdiMs: gunes.ms + 60_000).tur, .vakitYok, "kontrol: gunes→ogle arasi vakit yok")
} else {
    hatalar.append("widget fiksturunde ogle yok")
}

// MARK: - 7) iPhone "Namazda sessiz" penceresi — siri-ornek.json > sessizlik

struct SessizlikDurumOrnegi: Decodable {
    let ad: String
    let simdiMs: Int64
    let dakika: Int
    let sessiz: Bool
    let vakit: String?
    let bitisMs: Int64?
}

struct SessizlikBolumu: Decodable {
    let durumlar: [SessizlikDurumOrnegi]
}

struct SessizlikOrnek: Decodable {
    let vakitler: [SiriVakitAni]
    let sessizlik: SessizlikBolumu
}

let sessizlik = oku(argumanlar[2], SessizlikOrnek.self)
for d in sessizlik.sessizlik.durumlar {
    esitMi(
        SessizlikKarari.durum(sessizlik.vakitler, simdiMs: d.simdiMs, dakika: d.dakika),
        SessizlikDurumu(sessiz: d.sessiz, vakit: d.vakit, bitisMs: d.bitisMs),
        "sessizlik[\(d.ad)]"
    )
}

// MARK: - 8) Kisayollar otomasyon degerleri (OtomasyonKarari) — Android %vakit/%kalandk ikizi

if let ogle = widget.vakitler.first(where: { $0.vakit == "ogle" }) {
    let sirali = widget.vakitler.sorted { $0.ms < $1.ms }
    // Ogleye 90 sn kala: siradaki ogle, kalan YUKARI yuvarlanir → 2 dk.
    let s1 = OtomasyonKarari.siradakiVakit(widget.vakitler, simdiMs: ogle.ms - 90_000)
    esitMi(s1?.kod ?? "-", "ogle", "otomasyon: siradaki vakit kodu")
    esitMi(s1?.ad ?? "-", "Öğle", "otomasyon: siradaki vakit adi")
    esitMi(s1?.kalanDk ?? -1, 2, "otomasyon: kalan dakika yukari yuvarlanir (90 sn → 2)")
    esitMi(OtomasyonKarari.siradakiVakit(widget.vakitler, simdiMs: ogle.ms - 59_000)?.kalanDk ?? -1, 1, "otomasyon: 59 sn kala 1 dk (0 degil)")
    // Cizelge bittikten sonra siradaki yok → nil (uygulama acilmali).
    esitMi(OtomasyonKarari.siradakiVakit(widget.vakitler, simdiMs: (sirali.last?.ms ?? 0) + 1) == nil, true, "otomasyon: cizelge sonunda nil")
    // Kilindi mi: ogle icinde kilinmamis false, kayitta true, kuyrukta true.
    let icinde = ogle.ms + 60_000
    esitMi(OtomasyonKarari.simdikiVakitKilindiMi(vakitler: widget.vakitler, kilinanlar: [:], bekleyenler: [], simdiMs: icinde), false, "otomasyon: kilinmamis vakit false")
    esitMi(OtomasyonKarari.simdikiVakitKilindiMi(vakitler: widget.vakitler, kilinanlar: [ogle.tarih: ["ogle"]], bekleyenler: [], simdiMs: icinde), true, "otomasyon: kayitta true")
    esitMi(OtomasyonKarari.simdikiVakitKilindiMi(vakitler: widget.vakitler, kilinanlar: [:], bekleyenler: [SiriBekleyenKildim(tarih: ogle.tarih, vakit: "ogle")], simdiMs: icinde), true, "otomasyon: kuyrukta true")
    // Ilk vakitten once kilinacak vakit yok → nil.
    esitMi(OtomasyonKarari.simdikiVakitKilindiMi(vakitler: widget.vakitler, kilinanlar: [:], bekleyenler: [], simdiMs: (sirali.first?.ms ?? 0) - 1) == nil, true, "otomasyon: vakit yokken nil")
} else {
    hatalar.append("widget fiksturunde ogle yok (otomasyon)")
}

// MARK: - 9) Ingilizce arayuz dili (W5) — Turkce beklentiler yukarida fiksturle, burada elle

esitMi(ArayuzDili.coz(nil), "tr", "dil: yoksa Turkce")
esitMi(ArayuzDili.coz(""), "tr", "dil: bos Turkce")
esitMi(ArayuzDili.coz("en"), "en", "dil: en")
esitMi(ArayuzDili.coz("en-US"), "en", "dil: en-US → en")
esitMi(ArayuzDili.coz("en_GB"), "en", "dil: en_GB → en")
// Portekizce Avrupa normu: Brezilya dahil butun pt-* → pt; Latin Sirpca cihaz → Kiril sr.
for yerel in ["pt-BR", "pt_PT", "pt-MZ", "pt-AO"] { esitMi(ArayuzDili.coz(yerel), "pt", "dil: \(yerel) → pt") }
for yerel in ["sr-Latn-RS", "sr_RS", "sr-Cyrl-RS"] { esitMi(ArayuzDili.coz(yerel), "sr", "dil: \(yerel) → sr") }
// Kurmanci: uygulama kodu "ku"; ISO 639-3 "kmr" ve Arap harfli cihaz (ku-Arab, ku-IQ) da "ku". Sorani ayri dil.
for yerel in ["ku", "ku-TR", "kmr", "kmr-Latn", "ku-Arab", "ku-IQ"] { esitMi(ArayuzDili.coz(yerel), "ku", "dil: \(yerel) → ku") }
esitMi(ArayuzDili.coz("ckb-IQ"), "ckb", "dil: ckb-IQ → ckb")
// Filipince: Tagalog "tl" → "fil". Pencapca yalniz Sahmuki: pnb, pa-PK, Gurmuki pa-IN/pa-Guru → "pa".
for yerel in ["fil", "fil-PH", "tl", "tl-PH"] { esitMi(ArayuzDili.coz(yerel), "fil", "dil: \(yerel) → fil") }
for yerel in ["pa", "pa-PK", "pa-Arab", "pa-Arab-PK", "pnb", "pnb-PK"] { esitMi(ArayuzDili.coz(yerel), "pa", "dil: \(yerel) → pa") }
for yerel in ["pa-IN", "pa-Guru", "pa-Guru-IN"] { esitMi(ArayuzDili.coz(yerel), "tr", "dil: Gurmuki \(yerel) → Turkce") }
// Ibranice: eski kod "iw" (Java/Android) → "he"; uc harfli dalga 13 kodlari aynen.
for yerel in ["he", "he-IL", "iw", "iw-IL", "iw_IL"] { esitMi(ArayuzDili.coz(yerel), "he", "dil: \(yerel) → he") }
for yerel in ["dag-GH", "mos", "mdh-PH", "ceb", "nqo-GN"] { esitMi(ArayuzDili.coz(yerel), String(yerel.prefix(3)), "dil: \(yerel)") }
esitMi(ArayuzDili.coz("xx"), "tr", "dil: desteklenmeyen → Turkce")
esitMi(VakitKarari.gorunenAd("ogle"), "Öğle", "varsayilan dil Turkce")
esitMi(VakitKarari.gorunenAd("sabah", dil: "en"), "Fajr", "en: sabah → Fajr")
esitMi(VakitKarari.gorunenAd("gunes", dil: "en"), "", "en: gunes namaz degil")
esitMi(VakitMetinleri.en.vakitAdi("gunes"), "Sunrise", "en: gunes gorunen adi")
esitMi(VakitMetinleri.tr.vakitAdi("gunes"), "Güneş", "tr: gunes gorunen adi")
esitMi(VakitMetinleri.dil("en-GB"), VakitMetinleri.en, "metinler: en-GB → en")
// Iki dilde ayni yer tutucular: eksik/fazla `{…}` cevirinin kaymasi demektir.
do {
    func yerTutucular(_ m: VakitMetinleri) -> [String] {
        let alanlar = [m.girisBugun, m.girisYarin, m.suAnVakti, m.suAnVaktiCikis, m.siradakiNamaz, m.isaretlendi,
                       m.zatenKilindi, m.vakitYokSiradaki, m.onay, m.kontrolKildim, m.kontrolKilindi]
        return alanlar.map { a in
            ["{ad}", "{saat}", "{giris}", "{dua}"].filter { a.contains($0) }.joined()
        }
    }
    esitMi(yerTutucular(VakitMetinleri.en), yerTutucular(VakitMetinleri.tr), "en/tr yer tutuculari ayni")
    esitMi(Set(VakitMetinleri.en.adlar.keys), Set(VakitMetinleri.tr.adlar.keys), "en/tr vakit kodlari ayni")
}

do {
    func durumBul(_ ad: String) -> SiriDurum? { siri.durumlar.first { $0.ad == ad } }
    func ingilizce(_ ad: String) -> (siradaki: String, kildim: String, onay: String?)? {
        guard let d = durumBul(ad) else {
            hatalar.append("siri-ornek.json'da durum yok: \(ad)")
            return nil
        }
        let karar = VakitKarari.kildimKarari(
            vakitler: siri.vakitler, kilinanlar: d.kilinanlar, bekleyenler: d.bekleyenler, simdiMs: d.simdiMs, dil: "en"
        )
        var onay: String? = nil
        if case let .aday(_, _, vakitAdi) = karar { onay = VakitKarari.onayMetni(vakitAdi, dil: "en") }
        let durum = VakitKarari.aktifVakitBul(siri.vakitler, simdiMs: d.simdiMs)
        return (
            VakitKarari.siradakiNamazMetni(
                durum: durum, kilinanlar: d.kilinanlar, bekleyenler: d.bekleyenler, bugun: d.bugun, saat: saat, dil: "en"
            ),
            VakitKarari.kildimMetni(karar, bugun: d.bugun, saat: saat, dil: "en"),
            onay
        )
    }
    if let e = ingilizce("ogle surerken kilinmamis") {
        esitMi(e.siradaki, "It's Dhuhr time now. The next prayer is Asr at 17:11.", "en siradaki: ogle")
        esitMi(e.kildim, "Dhuhr is marked as prayed. May Allah accept it.", "en kildim: aday")
        esitMi(e.onay, "Mark Dhuhr as prayed?", "en onay")
    }
    if let e = ingilizce("ogle kayitta kilinmis") {
        esitMi(e.siradaki, "The next prayer is Asr at 17:11.", "en siradaki: kilinmis")
        esitMi(e.kildim, "Dhuhr is already marked as prayed.", "en kildim: zaten")
        esitMi(e.onay, nil, "en onay yok")
    }
    if let e = ingilizce("yatsi aksam: sabah yarin") {
        esitMi(e.siradaki, "It's Isha time now. The next prayer is Fajr tomorrow at 03:24.", "en siradaki: yarin")
    }
    if let e = ingilizce("sabah: cikis gunes, siradaki ogle") {
        esitMi(e.siradaki, "It's Fajr time now; it ends at 05:25. The next prayer is Dhuhr at 13:11.", "en siradaki: cikis ayri")
    }
    if let e = ingilizce("gunes-ogle arasi") {
        esitMi(e.kildim, "There is no prayer to mark right now. Next is Dhuhr at 13:11.", "en kildim: vakit yok")
    }
    if let e = ingilizce("veri tukendi") {
        esitMi(e.siradaki, "Prayer times are out of date. Open the app once to update them.", "en veri eski")
        esitMi(e.kildim, "There is no prayer to mark right now.", "en kildim: siradaki yok")
    }
}

if let ogle = widget.vakitler.first(where: { $0.vakit == "ogle" }) {
    let dokunus = ogle.ms + 60_000
    esitMi(
        WidgetKarari.kontrolDurumu(vakitler: widget.vakitler, kilinanlar: [:], bekleyenler: [], simdiMs: dokunus, dil: "en"),
        WidgetKontrolDurumu(tur: .kilinabilir, baslik: "Dhuhr · I've prayed", tarih: ogle.tarih, vakit: "ogle"),
        "en kontrol: kilinabilir (kayit kodu dilden bagimsiz)"
    )
    esitMi(
        WidgetKarari.kontrolDurumu(vakitler: widget.vakitler, kilinanlar: [ogle.tarih: ["ogle"]], bekleyenler: [], simdiMs: dokunus, dil: "en").baslik,
        "Dhuhr prayed",
        "en kontrol: kilindi"
    )
    esitMi(WidgetKarari.kontrolDurumu(vakitler: nil, kilinanlar: [:], bekleyenler: [], simdiMs: dokunus, dil: "en").baslik, "Open the app", "en kontrol: veri yok")
    esitMi(WidgetKarari.kontrolDurumu(vakitler: nil, kilinanlar: [:], bekleyenler: [], simdiMs: dokunus).baslik, "Uygulamayı açın", "tr kontrol: veri yok")
    let s1 = OtomasyonKarari.siradakiVakit(widget.vakitler, simdiMs: ogle.ms - 90_000, dil: "en")
    esitMi(s1?.ad ?? "-", "Dhuhr", "en otomasyon: siradaki vakit adi")
    esitMi(s1?.kod ?? "-", "ogle", "en otomasyon: kod dilden bagimsiz")
}

// MARK: - 10) Gunun ayeti (#380 iOS) — yuk v1 cozumu + "su anki kayit" + zaman cizelgesi

// Sozlesme ornegi (`docs/ajan/gunun-ayeti.md`), uc gunluk plan; `duvar` iOS'ta yok sayilir.
let ayetHam = """
{"v":1,"dil":"tr",
 "metin":{"etiket":"GÜNÜN AYETİ","sigmiyor":"Bugünün ayeti bu boyuta sığmıyor. Okumak için dokunun.","acin":"Açın","arapcaKaynagi":"Arapça: Tanzil"},
 "plan":[
  {"gun":"2026-10-24","baslangicMs":1000,"ref":"94:6","ar":"إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرٗا","meal":"Gerçekten güçlükle beraber bir kolaylık vardır.","kisaKunye":"İnşirâh 94:6","mealKaynagi":"Rowwad Translation Center, QuranEnc 1.0.4"},
  {"gun":"2026-10-26","baslangicMs":3000,"ref":"2:286","ar":"ا","meal":null,"kisaKunye":"Bakara 2:286","mealKaynagi":null},
  {"gun":"2026-10-25","baslangicMs":2000,"ref":"13:28","ar":"ب","meal":"Kalpler ancak Allah'ı anmakla huzur bulur.","kisaKunye":"Ra'd 13:28","mealKaynagi":"Rowwad Translation Center, QuranEnc 1.0.4"}
 ],
 "duvar":{"acik":false,"yer":"kilit","zemin":"gece","arapca":false,"paletRenk":"#2E7D32"}}
"""
// Meal yazi tipi: Ge'ez (Amharca) sistem tasarimi; Latin genisletilmis harf ve ton isareti serif.
esitMi(GununAyetiKarari.mealSerifMi("እናንተ ያመናችሁ ሆይ! በመታገስና በሶላት ተረዱ፡፡"), false, "ayet: Ge'ez meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("Yã ku waɗanda suka yi ĩmãni!"), true, "ayet: Hausa meal serif")
esitMi(GununAyetiKarari.mealSerifMi("Ẹ̀yin tí ẹ gbàgbọ́ ní òdodo"), true, "ayet: Yoruba meal serif")
// Asya dalgasi: Han, Tamil, Malayalam, Tay, Hangil serif tasarimda yok; Vietnamca serif kalir.
esitMi(GununAyetiKarari.mealSerifMi("归信的人们啊！你们当借坚忍和拜功，而求佑助。"), false, "ayet: Cince meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("நம்பிக்கையாளர்களே! பொறுமை இன்னும் தொழுகையின் மூலம் உதவி கோருங்கள்."), false, "ayet: Tamilce meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("സത്യവിശ്വാസികളെ, നിങ്ങള്‍ സഹനവും നമസ്കാരവും മുഖേന സഹായം തേടുക."), false, "ayet: Malayalamca meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("โอ้บรรดาผู้ศรัทธาทั้งหลาย จงขอการช่วยเหลือ"), false, "ayet: Tayca meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("믿는 자들이여! 인내심과 예배로써 도움을 요청하라."), false, "ayet: Korece meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("Hỡi những người có đức tin, các ngươi hãy cầu xin sự giúp đỡ"), true, "ayet: Vietnamca meal serif")
// Dalga 11: Gucarati ve kana (Hiragana, Katakana) serif tasarimda yok (fontTools cmap, 2026-11-02); Bulgarca ve
// Makedonca Kiril (ѓ ќ ѕ dahil) serif kalir.
esitMi(GununAyetiKarari.mealSerifMi("અમે ફકત તારી જ બંદગી કરીએ છીએ"), false, "ayet: Gucaratca meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("あなただけを"), false, "ayet: Hiragana serif degil")
esitMi(GununAyetiKarari.mealSerifMi("アッラー"), false, "ayet: Katakana serif degil")
esitMi(GununAyetiKarari.mealSerifMi("（預言者よ、）"), false, "ayet: Japonca tam genislik parantez serif degil")
esitMi(GununAyetiKarari.mealSerifMi("Наистина, с тегобата идва облекчение."), true, "ayet: Bulgarca meal serif")
esitMi(GununAyetiKarari.mealSerifMi("Навистина, со тешкотијата има олеснување ѓ ќ ѕ."), true, "ayet: Makedonca meal serif")
// Dalga 12 (fontTools cmap 0/128, 2026-11-04): Devanagari (hi, mr, ne), Bengal (bn, as), Telugu, Kannada, Sinhala,
// Khmer serif tasarimda yok → sistem; Filipince (Latin) serif kalir.
esitMi(GununAyetiKarari.mealSerifMi("हे ईमान राखणाऱ्यांनो! धीर-संयम आणि नमाजद्वारे मदत मागा."), false, "ayet: Marathi meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("ऐ ईमान वालो! धैर्य और नमाज़ से सहायता माँगो।"), false, "ayet: Hintce meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("হে ঈমান্দাৰসকল! তোমালোকে ধৈৰ্য্য আৰু ছালাতৰ মাধ্যমত"), false, "ayet: Assamca meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("ఓ విశ్వాసులారా! సహనం మరియు నమాజ్ ద్వారా"), false, "ayet: Telugu meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("ಓ ಸತ್ಯವಿಶ್ವಾಸಿಗಳೇ! ತಾಳ್ಮೆ ಮತ್ತು ನಮಾಝಿನ ಮೂಲಕ"), false, "ayet: Kannada meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("අහෝ විශ්වාස කළවුනි! නුඹලා ඉවසීම"), false, "ayet: Sinhala meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("ឱបណ្តាអ្នកដែលមានជំនឿ! ចូរពួកអ្នកសុំជំនួយ"), false, "ayet: Khmer meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("Tunay na si Allāh ay kasama ng mga nagtitiis."), true, "ayet: Filipince meal serif")
// Dalga 13 (fontTools cmap 2026-11-04): Ibrani 0/112, N'Ko 0/64, Gurcu 1/96 → sistem; Litvanca ve Afrika Latin harfleri serif.
esitMi(GununAyetiKarari.mealSerifMi("הוי אלה אשר האמינו! התאזרו בסבלנות ובתפילה, כי אללה הוא עם הסבלנים."), false, "ayet: Ibranice meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("ჰეი, თქვენ, რომელთაც ირწმუნეთ! დახმარება ითხოვეთ (ალლაჰისგან) მოთმინების და ლოცვის მეშვეობით."), false, "ayet: Gurcuce meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("ߤߍ߲߬ ߊߟߎ߬ ߟߊߒߠߦߊߓߊ߮ ߟߎ߬ ߸ ߊߟߎ߯ ߘߍ߲߬ߡߍ߲߬ߠߌ߲߬ߢߌߣߌ߲ ߞߍ߫ ߡߎ߬ߢߎ߲ ߣߌ߫ ߛߊߟߌ ߞߊ߲߬ ߘߋ߬"), false, "ayet: N'Ko meal serif degil")
esitMi(GununAyetiKarari.mealSerifMi("\u{FB2E}\u{1C90}"), false, "ayet: Ibrani sunum ve Gurcu Mtavruli serif degil")
esitMi(GununAyetiKarari.mealSerifMi("O jūs, kurie tikite! Ieškokite pagalbos kantrybėje ir As-Salat (maldoje). Iš tiesų, Allahas yra su As-Sabirūn (kantriaisiais)."), true, "ayet: Litvanca meal serif")
esitMi(GununAyetiKarari.mealSerifMi("Mo a moagye adie, monfa aboterε ne mpaebͻ nhwehwε mmoa (wͻ Nyankopͻn hͻ); nokorε sε Nyankopͻn ka aboterεfoͻ no ho."), true, "ayet: Akan meal serif")
esitMi(GununAyetiKarari.mealSerifMi("Yɑɑ yãmb neb nins sẽn kõ sɩd ne Wẽnde! kos-y sõngr ne sugr mɑɑneg lɑ pʋʋsgo, ɑd Wẽnd lɑgma sugrã rãmbã."), true, "ayet: Moore meal serif")
// Mealsiz dil (ku, tk, tt, sd, pl; sahip karari 2026-11-02): widget Arapca, Kisayollar gorseli kisa kunye cizer.
let mealsizHam = """
{"v":1,"dil":"sd","metin":{"etiket":"VERSE OF THE DAY","sigmiyor":"x","acin":"Open","arapcaKaynagi":"Arabic: Tanzil"},
 "plan":[{"gun":"2026-11-02","baslangicMs":1000,"ref":"94:6","ar":"إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرٗا","meal":null,"kisaKunye":"Quran 94:6","mealKaynagi":null}]}
"""
if let mealsiz = GununAyetiKarari.coz(mealsizHam), let k = mealsiz.plan.first {
    esitMi(k.meal, nil, "ayet mealsiz: meal yok")
    esitMi(GununAyetiKarari.widgetGovdesi(k), "إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرٗا", "ayet mealsiz: widget Arapca cizer")
    esitMi(GununAyetiKarari.gorselGovdesi(k), "Quran 94:6", "ayet mealsiz: Kisayollar gorseli kisa kunye")
    esitMi(GununAyetiKarari.kunyeSatiri(k, metin: mealsiz.metin, arapcaVar: true), "Quran 94:6 · Arabic: Tanzil", "ayet mealsiz: kunye Arapca kaynagiyla")
    esitMi(GununAyetiKarari.kunyeSatiri(k, metin: mealsiz.metin, arapcaVar: false), "Quran 94:6", "ayet mealsiz: gorsel kunyesi")
} else {
    hatalar.append("ayet: mealsiz yuk cozulemedi")
}
if let ayet = GununAyetiKarari.coz(ayetHam) {
    let refler: ([GununAyetiGirdisi]) -> [String] = { $0.map { "\($0.ms)=\($0.kayit.ref)" } }
    esitMi(ayet.metin.etiket, "GÜNÜN AYETİ", "ayet: metin cozulur")
    esitMi(ayet.plan[1].meal, nil, "ayet: meal null olabilir")
    esitMi(GununAyetiKarari.gecerliKayit(ayet.plan, simdiMs: 1000)?.ref, "94:6", "ayet: baslangic aninda o kayit (<=)")
    esitMi(GununAyetiKarari.gecerliKayit(ayet.plan, simdiMs: 2500)?.ref, "13:28", "ayet: sirasiz planda baslamis SON kayit")
    esitMi(GununAyetiKarari.gecerliKayit(ayet.plan, simdiMs: 99_999)?.ref, "2:286", "ayet: plan bitince son kayit kalir")
    esitMi(GununAyetiKarari.gecerliKayit(ayet.plan, simdiMs: 500)?.ref, "94:6", "ayet: hicbiri baslamadiysa ilk kayit")
    esitMi(GununAyetiKarari.gecerliKayit([], simdiMs: 500)?.ref, nil, "ayet: bos plan → nil")
    esitMi(refler(GununAyetiKarari.girdiler(ayet.plan, simdiMs: 1500)), ["1500=94:6", "2000=13:28", "3000=2:286"], "ayet: simdiki + gelecek girdiler")
    esitMi(refler(GununAyetiKarari.girdiler(ayet.plan, simdiMs: 99_999)), ["99999=2:286"], "ayet: plan bitti → tek girdi")
    esitMi(refler(GununAyetiKarari.girdiler(ayet.plan, simdiMs: 500)), ["500=94:6", "2000=13:28", "3000=2:286"], "ayet: erken → ilk kayit tekrarlanmaz")
    esitMi(
        GununAyetiKarari.kunyeSatiri(ayet.plan[0], metin: ayet.metin, arapcaVar: false),
        "İnşirâh 94:6 · Rowwad Translation Center, QuranEnc 1.0.4", "ayet: kunye (meal kaynagi zorunlu)"
    )
    esitMi(
        GununAyetiKarari.kunyeSatiri(ayet.plan[1], metin: ayet.metin, arapcaVar: true),
        "Bakara 2:286 · Arapça: Tanzil", "ayet: mealsiz kunye + Arapca kaynagi"
    )
} else {
    hatalar.append("ayet: sozlesme ornegi cozulemedi")
}
esitMi(GununAyetiKarari.coz(ayetHam.replacingOccurrences(of: "\"v\":1", with: "\"v\":2")) == nil, true, "ayet: baska surum okunmaz")
esitMi(GununAyetiKarari.coz("{bozuk") == nil, true, "ayet: bozuk JSON → nil")
esitMi(GununAyetiKarari.coz(nil) == nil, true, "ayet: yok → nil")
esitMi(depo.gununAyeti() == nil, true, "ayet depo: yazilmadan nil")
depo.gununAyetiYaz(ayetHam)
esitMi(depo.gununAyetiJson(), ayetHam, "ayet depo: ham yuk birebir saklanir")
esitMi(depo.gununAyeti()?.plan.count, 3, "ayet depo: cozulmus yuk")

// MARK: - 11) Native dil tablolari (W4) — on dokuz dil, Turkceyle ayni alan + yer tutucu

/// Her `String` alanin (ve `[String: String]` alaninin her anahtarinin) `{...}` kumesi.
func yerTutucuImzasi(_ deger: Any) -> [String: String] {
    var sonuc: [String: String] = [:]
    func kume(_ s: String) -> String {
        var bulunan = Set<String>()
        var kalan = Substring(s)
        while let a = kalan.firstIndex(of: "{"), let k = kalan[a...].firstIndex(of: "}") {
            bulunan.insert(String(kalan[a...k]))
            kalan = kalan[kalan.index(after: k)...]
        }
        return bulunan.sorted().joined()
    }
    for c in Mirror(reflecting: deger).children {
        guard let ad = c.label, ad != "dil" else { continue }
        if let s = c.value as? String {
            sonuc[ad] = kume(s) + (s.isEmpty ? "<BOS>" : "")
        } else if let h = c.value as? [String: String] {
            for (k, v) in h { sonuc["\(ad).\(k)"] = kume(v) + (v.isEmpty ? "<BOS>" : "") }
        }
    }
    return sonuc
}

esitMi(ArayuzDili.desteklenenler, ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "pt", "it", "sv", "uk", "ro", "hr", "sr", "el", "ku", "tk", "tt", "sd", "pl", "ja", "gu", "bg", "mk", "fil", "te", "kn", "mr", "pa", "as", "ne", "si", "km", "he", "ka", "lt", "mg", "lg", "rw", "rn", "ln", "dag", "mos", "aa", "mdh", "ak", "ceb", "nqo"], "dil: tablo sirasi")
esitMi(ArayuzDili.coz("in"), "id", "dil: eski Endonezce kodu in → id")
esitMi(ArayuzDili.coz("de-DE"), "de", "dil: de-DE → de")
esitMi(ArayuzDili.coz("ms_MY"), "ms", "dil: ms_MY → ms")
esitMi(ArayuzDili.coz("ar-SA"), "ar", "dil: ar-SA → ar")
esitMi(ArayuzDili.coz("ur_PK"), "ur", "dil: ur_PK → ur")
// Basitlestirilmis Cince: paket dili `zh-Hans` (lproj), cihaz dili zh-Hans-CN / zh-Hant-TW / zh_HK → zh.
for yerel in ["zh-Hans", "zh-Hans-CN", "zh-CN", "zh_CN", "zh-Hant-TW", "zh-TW", "zh-HK", "zh"] {
    esitMi(ArayuzDili.coz(yerel), "zh", "dil: \(yerel) → zh")
}
esitMi(Set(VakitMetinleri.tablo.keys), Set(ArayuzDili.desteklenenler), "metinler: her dilin tablosu var")
for d in ArayuzDili.desteklenenler {
    let m = VakitMetinleri.dil(d)
    esitMi(m.dil, d, "metinler: \(d) kendi kodunu tasir")
    esitMi(yerTutucuImzasi(m), yerTutucuImzasi(VakitMetinleri.tr), "metinler: \(d) Turkceyle ayni yer tutucular")
}

// CLDR cogul kategorileri (JS `cogul.ts` ikizi, tamsayi).
esitMi([0, 1, 2, 5].map { CogulKurali.kategori("tr", $0) }, ["other", "one", "other", "other"], "cogul: tr")
esitMi([0, 1, 2].map { CogulKurali.kategori("en", $0) }, ["other", "one", "other"], "cogul: en")
esitMi([0, 1, 2, 1_000_000].map { CogulKurali.kategori("fr", $0) }, ["one", "one", "other", "many"], "cogul: fr")
esitMi([1, 2, 5, 11, 21, 22, 25, 112].map { CogulKurali.kategori("ru", $0) },
       ["one", "few", "many", "many", "one", "few", "many", "many"], "cogul: ru")
esitMi([1, 3, 5, 21].map { CogulKurali.kategori("bs", $0) }, ["one", "few", "other", "one"], "cogul: bs")
esitMi([1, 2].map { CogulKurali.kategori("id", $0) }, ["other", "other"], "cogul: id")
esitMi([0, 1, 2, 3, 10, 11, 99, 100, 102, 103].map { CogulKurali.kategori("ar", $0) },
       ["zero", "one", "two", "few", "few", "many", "many", "other", "other", "few"], "cogul: ar")
esitMi([0, 1, 2, 5].map { CogulKurali.kategori("ur", $0) }, ["other", "one", "other", "other"], "cogul: ur")
esitMi([0, 1, 2, 1_000_000, 1_000_001].map { CogulKurali.kategori("es", $0) }, ["other", "one", "other", "many", "other"], "cogul: es")
esitMi([0, 1, 2].map { CogulKurali.kategori("hi", $0) }, ["one", "one", "other"], "cogul: hi")
esitMi([0, 1, 2].map { CogulKurali.kategori("bn", $0) }, ["one", "one", "other"], "cogul: bn")
esitMi([0, 1, 2].map { CogulKurali.kategori("nl", $0) }, ["other", "one", "other"], "cogul: nl")
esitMi([0, 1, 2].map { CogulKurali.kategori("sq", $0) }, ["other", "one", "other"], "cogul: sq")
esitMi([0, 1, 2].map { CogulKurali.kategori("fa", $0) }, ["one", "one", "other"], "cogul: fa")
for dil in ["ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "om", "so", "ta", "ml"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "one", "other"], "cogul: \(dil)")
}
for dil in ["am", "ff"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["one", "one", "other"], "cogul: \(dil)")
}
esitMi([0, 1, 2].map { CogulKurali.kategori("yo", $0) }, ["other", "other", "other"], "cogul: yo")
for dil in ["zh", "th", "ko", "vi"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "other", "other"], "cogul: \(dil)")
}
// Avrupa dalgasi: pt (pt-PT kurali) ve it = es; sv/el one/other; uk = ru; hr/sr = bs; ro yeni kural.
for dil in ["pt", "it"] {
    esitMi([0, 1, 2, 1_000_000].map { CogulKurali.kategori(dil, $0) }, ["other", "one", "other", "many"], "cogul: \(dil)")
}
for dil in ["sv", "el"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "one", "other"], "cogul: \(dil)")
}
esitMi([1, 2, 5, 11, 21].map { CogulKurali.kategori("uk", $0) }, ["one", "few", "many", "many", "one"], "cogul: uk")
for dil in ["hr", "sr"] {
    esitMi([1, 2, 5, 11, 21].map { CogulKurali.kategori(dil, $0) }, ["one", "few", "other", "other", "one"], "cogul: \(dil)")
}
// Dalga 11: ku/tk/sd/bg one/other; gu 0 ve 1 tekil; ja/tt yalniz other; pl one/few/many; mk …1 tekil.
for dil in ["ku", "tk", "sd", "bg"] {
    esitMi([0, 1, 2, 21].map { CogulKurali.kategori(dil, $0) }, ["other", "one", "other", "other"], "cogul: \(dil)")
}
esitMi([0, 1, 2].map { CogulKurali.kategori("gu", $0) }, ["one", "one", "other"], "cogul: gu")
for dil in ["ja", "tt"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "other", "other"], "cogul: \(dil)")
}
esitMi([0, 1, 2, 4, 5, 12, 14, 21, 22, 25, 104, 112, 1_000_000].map { CogulKurali.kategori("pl", $0) },
       ["many", "one", "few", "few", "many", "many", "many", "many", "few", "many", "few", "many", "many"], "cogul: pl")
esitMi([0, 1, 2, 11, 21, 101, 111].map { CogulKurali.kategori("mk", $0) },
       ["other", "one", "other", "other", "one", "one", "other"], "cogul: mk")
// Dalga 12: fil son hanesi 4/6/9 olmayan tekil; te/mr/ne one/other; kn/as/pa/si 0 ve 1 tekil; km yalniz other.
esitMi([0, 1, 2, 3, 4, 5, 6, 9, 10, 14, 21, 104, 1_000_000].map { CogulKurali.kategori("fil", $0) },
       ["one", "one", "one", "one", "other", "one", "other", "other", "one", "other", "one", "other", "one"], "cogul: fil")
for dil in ["te", "mr", "ne"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "one", "other"], "cogul: \(dil)")
}
for dil in ["kn", "as", "pa", "si"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["one", "one", "other"], "cogul: \(dil)")
}
esitMi([0, 1, 2].map { CogulKurali.kategori("km", $0) }, ["other", "other", "other"], "cogul: km")
// Dalga 13: he 1 one / 2 two / gerisi other; lt …1 one, …2–9 few (…11–19 haric), gerisi other; ceb Filipince kurali;
// mg/ln/ak 0 ve 1 tekil; ka/lg one/other; rw/rn/dag/mos/aa/mdh (CLDR'de yok, ICU koku) ve nqo yalniz other.
esitMi([0, 1, 2, 3, 20, 100].map { CogulKurali.kategori("he", $0) }, ["other", "one", "two", "other", "other", "other"], "cogul: he")
esitMi(CogulKurali.kategori("iw", 2), "two", "cogul: iw → he")
esitMi([0, 1, 2, 9, 10, 11, 12, 19, 21, 22, 111].map { CogulKurali.kategori("lt", $0) },
       ["other", "one", "few", "few", "other", "other", "other", "other", "one", "few", "other"], "cogul: lt")
esitMi([0, 1, 4, 14, 21].map { CogulKurali.kategori("ceb", $0) }, ["one", "one", "other", "other", "one"], "cogul: ceb")
for dil in ["mg", "ln", "ak"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["one", "one", "other"], "cogul: \(dil)")
}
for dil in ["ka", "lg"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "one", "other"], "cogul: \(dil)")
}
for dil in ["rw", "rn", "dag", "mos", "aa", "mdh", "nqo"] {
    esitMi([0, 1, 2].map { CogulKurali.kategori(dil, $0) }, ["other", "other", "other"], "cogul: \(dil)")
}
esitMi([0, 1, 2, 19, 20, 100, 101, 119, 120, 1_000_000].map { CogulKurali.kategori("ro", $0) },
       ["few", "one", "few", "few", "other", "other", "few", "few", "other", "other"], "cogul: ro")
esitMi(CogulKurali.sec(["one": "{n} minute", "other": "{n} minutes"], "ru", 5), "5 minutes", "cogul: eksik kategori other'a duser")

// MARK: - 12) Vakit adi takimi (kullanicinin sectigi adlar) — var / yok / bozuk / kismi

let takimJson = """
{"adlar":{"imsak":"Morgengebet","gunes":"Sonnenaufgang","ogle":"Mittagsgebet","ikindi":"Nachmittagsgebet","aksam":"Abendgebet","yatsi":"Nachtgebet"},
 "buyuk":{"ogle":"MITTAGSGEBET"},"kucuk":{"ogle":"mittagsgebet"},"cuma":"Freitagsgebet","imsakVakti":"Imsak","gunesDogusu":"Sonnenaufgang"}
"""
if let t = VakitAdlari.coz(takimJson) {
    let m = VakitMetinleri.dil("de", adlar: t)
    esitMi(m.ad("sabah"), "Morgengebet", "takim: sabah ← imsak")
    esitMi(m.ad("ogle"), "Mittagsgebet", "takim: ogle")
    esitMi(m.vakitAdi("gunes"), "Sonnenaufgang", "takim: gunes")
    esitMi(t.cuma, "Freitagsgebet", "takim: cuma")
    esitMi(t.imsakVakti, "Imsak", "takim: imsakVakti")
    esitMi(t.buyuk["ogle"], "MITTAGSGEBET", "takim: buyuk")
    esitMi(t.kucuk["ogle"], "mittagsgebet", "takim: kucuk")
    esitMi(VakitMetinleri.bicim(m.onay, ["ad": m.ad("ogle")]), "Mittagsgebet als gebetet markieren?", "takim: metne girer")
} else {
    hatalar.append("takim: gecerli JSON cozulemedi")
}
for ham in [nil, "", "   ", "{", "[]", "null", "42", "{}", "{\"adlar\":\"Sabah\"}",
            "{\"adlar\":{\"ogle\":42,\"ikindi\":null,\"aksam\":\"\"}}", "{\"adlar\":{\"bilinmeyen\":\"X\"}}"] as [String?] {
    esitMi(VakitAdlari.coz(ham) == nil, true, "takim: yok/bos/bozuk → nil (\(ham ?? "nil"))")
}
esitMi(VakitMetinleri.dil("tr", adlar: VakitAdlari.coz("{bozuk")), VakitMetinleri.tr, "takim: bozuk → tablo")
if let kismi = VakitAdlari.coz("{\"adlar\":{\"ogle\":\"  Mittag  \",\"ikindi\":\"\"}}") {
    let m = VakitMetinleri.dil("en", adlar: kismi)
    esitMi(m.ad("ogle"), "Mittag", "takim kismi: verilen ad (kirpilmis)")
    esitMi(m.ad("ikindi"), "Asr", "takim kismi: eksik alan tabloya duser")
    esitMi(m.vakitAdi("gunes"), "Sunrise", "takim kismi: gunes tablodan")
} else {
    hatalar.append("takim: kismi JSON cozulemedi")
}
// Depo: yaz / oku / sil; etkin takim yalniz okundugu ARAYUZ dilinde uygulanir.
esitMi(depo.vakitAdlari() == nil, true, "takim depo: yazilmadan nil")
depo.arayuzDiliniYaz("de")
depo.vakitAdlariniYaz(takimJson)
esitMi(depo.vakitAdlari()?.adlar["ogle"], "Mittagsgebet", "takim depo: okunur")
esitMi(depo.arayuzDili(), "de", "takim depo: dil okunur (takim tazelenir)")
esitMi(VakitMetinleri.dil("de").ad("ogle"), "Mittagsgebet", "takim etkin: ayni dilde uygulanir")
esitMi(VakitMetinleri.dil("en").ad("ogle"), "Dhuhr", "takim etkin: baska dilde (Siri paket dili) tablo")
esitMi(VakitKarari.gorunenAd("ogle", dil: "de"), "Mittagsgebet", "takim etkin: gorunenAd")
depo.vakitAdlariniYaz(nil)
esitMi(depo.vakitAdlari() == nil, true, "takim depo: nil anahtari siler")
_ = depo.arayuzDili()
esitMi(VakitMetinleri.dil("de"), VakitMetinleri.de, "takim depo: silinince tablo")
depo.vakitAdlariniYaz("   ")
esitMi(depo.vakitAdlari() == nil, true, "takim depo: bos dize de siler")
depo.arayuzDiliniYaz("tr")
_ = depo.arayuzDili()

// MARK: - 13) Rakam sistemi — yalniz yerel rakamli dil (ar/ckb "arab", fa/ps "arabext", bn "beng") + kendi kaydi; diger her durumda metin aynen

esitMi(RakamSistemi.etkin(dil: "ar", kayitli: "arab"), "arab", "rakam: ar + arab")
esitMi(RakamSistemi.etkin(dil: "ar", kayitli: nil), "latn", "rakam: ar + kayit yok → Bati")
esitMi(RakamSistemi.etkin(dil: "ar", kayitli: "latn"), "latn", "rakam: ar + latn")
esitMi(RakamSistemi.etkin(dil: "ar", kayitli: "beng"), "latn", "rakam: ar + baska dilin sistemi → Bati")
esitMi(RakamSistemi.etkin(dil: "bn", kayitli: "beng"), "beng", "rakam: bn + beng")
esitMi(RakamSistemi.etkin(dil: "bn-BD", kayitli: " beng "), "beng", "rakam: bn-BD + beng")
esitMi(RakamSistemi.etkin(dil: "bn", kayitli: nil), "latn", "rakam: bn + kayit yok → Bati")
esitMi(RakamSistemi.etkin(dil: "bn", kayitli: "arab"), "latn", "rakam: bn + arab → Bati")
esitMi(RakamSistemi.doguMu(dil: "bn", kayitli: "beng"), false, "rakam: bn Dogu Arap degil")
for dil in ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "pt", "it", "sv", "uk", "ro", "hr", "sr", "el", "ku", "tk", "tt", "pl", "ja", "gu", "bg", "mk", "fil", "te", "kn", "si", "km", "he", "ka", "lt", "mg", "lg", "rw", "rn", "ln", "dag", "mos", "aa", "mdh", "ak", "ceb", "", "xx"] {
    esitMi(RakamSistemi.etkin(dil: dil, kayitli: "arab"), "latn", "rakam: \(dil) arab kaydini yok sayar")
    esitMi(RakamSistemi.etkin(dil: dil, kayitli: "beng"), "latn", "rakam: \(dil) beng kaydini yok sayar")
    esitMi(RakamSistemi.etkin(dil: dil, kayitli: "arabext"), "latn", "rakam: \(dil) arabext kaydini yok sayar")
    esitMi(RakamSistemi.yerelAyarKimligi(dil: dil, kayitli: "arab"), nil, "rakam: \(dil) yerel ayara dokunmaz")
}
esitMi(RakamSistemi.yerelAyarKimligi(dil: "ar", kayitli: "arab"), "ar@numbers=arab", "rakam: ar yerel ayari arab")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "ar", kayitli: nil), "ar@numbers=latn", "rakam: ar yerel ayari latn")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "bn", kayitli: "beng"), "bn@numbers=beng", "rakam: bn yerel ayari beng")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "bn", kayitli: nil), "bn@numbers=latn", "rakam: bn yerel ayari latn")
esitMi(RakamSistemi.cevir("আসর 15:42", sistem: "beng"), "আসর ১৫:৪২", "rakam: Bengalce saat cevrilir")
esitMi(RakamSistemi.etkin(dil: "fa", kayitli: "arabext"), "arabext", "rakam: fa + arabext")
esitMi(RakamSistemi.etkin(dil: "ps-AF", kayitli: "arabext"), "arabext", "rakam: ps-AF + arabext")
esitMi(RakamSistemi.etkin(dil: "fa", kayitli: "arab"), "latn", "rakam: fa + arab → Bati")
esitMi(RakamSistemi.etkin(dil: "ckb", kayitli: "arab"), "arab", "rakam: ckb + arab")
esitMi(RakamSistemi.etkin(dil: "ckb", kayitli: "arabext"), "latn", "rakam: ckb + arabext → Bati")
esitMi(RakamSistemi.etkin(dil: "ar", kayitli: "arabext"), "latn", "rakam: ar + arabext → Bati")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "fa", kayitli: "arabext"), "fa@numbers=arabext", "rakam: fa yerel ayari arabext")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "ckb", kayitli: nil), "ckb@numbers=latn", "rakam: ckb yerel ayari latn")
esitMi(RakamSistemi.cevir("12:05", sistem: "arabext"), "۱۲:۰۵", "rakam: Fars rakamina cevrilir")
esitMi(RakamSistemi.cevir("۱۲:۰۵", sistem: "arabext"), "۱۲:۰۵", "rakam: Fars idempotent")
esitMi(RakamSistemi.cevir("০৫:৩০", sistem: "beng"), "০৫:৩০", "rakam: Bengalce idempotent")
esitMi(RakamSistemi.cevir("15:42", sistem: "latn"), "15:42", "rakam: latn aynen")
// Dalga 12: Marathi ve Nepalce "deva" (० U+0966), Assamca "beng", Pencapca (Sahmuki) "arabext"; Hintce Bati.
esitMi(RakamSistemi.etkin(dil: "mr", kayitli: "deva"), "deva", "rakam: mr + deva")
esitMi(RakamSistemi.etkin(dil: "ne-NP", kayitli: "deva"), "deva", "rakam: ne-NP + deva")
esitMi(RakamSistemi.etkin(dil: "as", kayitli: "beng"), "beng", "rakam: as + beng")
esitMi(RakamSistemi.etkin(dil: "pa", kayitli: "arabext"), "arabext", "rakam: pa + arabext")
esitMi(RakamSistemi.etkin(dil: "mr", kayitli: "beng"), "latn", "rakam: mr + beng → Bati")
esitMi(RakamSistemi.etkin(dil: "hi", kayitli: "deva"), "latn", "rakam: hi Bati (CLDR latn)")
esitMi(RakamSistemi.cevir("मगरिब 18:05", sistem: "deva"), "मगरिब १८:०५", "rakam: Devanagari cevrilir")
esitMi(RakamSistemi.cevir("१८:०५", sistem: "deva"), "१८:०५", "rakam: Devanagari idempotent")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "mr", kayitli: "deva"), "mr@numbers=deva", "rakam: mr yerel ayari deva")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "pa", kayitli: nil), "pa-Arab@numbers=latn", "rakam: pa yerel ayari Sahmuki, latn")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "pa", kayitli: "arabext"), "pa-Arab@numbers=arabext", "rakam: pa yerel ayari arabext")
// Dalga 13: N'Ko "nkoo" (߀ U+07C0); Ibranice Bati.
esitMi(RakamSistemi.etkin(dil: "nqo", kayitli: "nkoo"), "nkoo", "rakam: nqo + nkoo")
esitMi(RakamSistemi.etkin(dil: "nqo", kayitli: "deva"), "latn", "rakam: nqo + deva → Bati")
esitMi(RakamSistemi.etkin(dil: "he", kayitli: "nkoo"), "latn", "rakam: he Bati")
esitMi(RakamSistemi.cevir("18:05", sistem: "nkoo"), "\u{07C1}\u{07C8}:\u{07C0}\u{07C5}", "rakam: N'Ko cevrilir")
esitMi(RakamSistemi.cevir("\u{07C1}\u{07C8}:\u{07C0}\u{07C5}", sistem: "nkoo"), "\u{07C1}\u{07C8}:\u{07C0}\u{07C5}", "rakam: N'Ko idempotent")
esitMi(RakamSistemi.yerelAyarKimligi(dil: "nqo", kayitli: "nkoo"), "nqo@numbers=nkoo", "rakam: nqo yerel ayari nkoo")
esitMi(RakamSistemi.cevir("15:42", sistem: RakamSistemi.etkin(dil: "bn", kayitli: "beng")), "১৫:৪২", "rakam: bn etkin sistemle")
esitMi(RakamSistemi.cevir("النهاية 15:42", dogu: true), "النهاية ١٥:٤٢", "rakam: saat cevrilir")
esitMi(RakamSistemi.cevir("1 س 5 د", dogu: true), "١ س ٥ د", "rakam: sure cevrilir")
esitMi(RakamSistemi.cevir("١٢:٠٩", dogu: true), "١٢:٠٩", "rakam: idempotent")
esitMi(RakamSistemi.cevir("Çıkış 15:42", dogu: false), "Çıkış 15:42", "rakam: Bati'da aynen")
esitMi(RakamSistemi.cevir("--:--", dogu: true), "--:--", "rakam: rakamsiz metin aynen")
esitMi(RakamSistemi.cevir(SiriDeposu.saatBicimleyici(TimeZone(identifier: "UTC")!)(0), dogu: false), "00:00",
       "rakam: cekirdek saat Bati rakamiyla uretilir")
// Yerel rakam yalniz cizimde: Arapca/Urduca/Bengalce/Farsca/Pestuca/Sorani tablolar Bati rakami tasir (Bati secen karisik gormesin).
let doguRakamlari = CharacterSet(charactersIn: "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹০১২৩৪৫৬৭৮৯०१२३४५६७८९\u{07C0}\u{07C1}\u{07C2}\u{07C3}\u{07C4}\u{07C5}\u{07C6}\u{07C7}\u{07C8}\u{07C9}")
for (ad, m) in [("VakitMetinleri.ar", "\(VakitMetinleri.dil("ar"))"), ("VakitMetinleri.ur", "\(VakitMetinleri.dil("ur"))"), ("VakitMetinleri.bn", "\(VakitMetinleri.dil("bn"))"),
                ("VakitMetinleri.fa", "\(VakitMetinleri.dil("fa"))"), ("VakitMetinleri.ps", "\(VakitMetinleri.dil("ps"))"),
                ("VakitMetinleri.ckb", "\(VakitMetinleri.dil("ckb"))"), ("VakitMetinleri.mr", "\(VakitMetinleri.dil("mr"))"),
                ("VakitMetinleri.ne", "\(VakitMetinleri.dil("ne"))"), ("VakitMetinleri.as", "\(VakitMetinleri.dil("as"))"),
                ("VakitMetinleri.pa", "\(VakitMetinleri.dil("pa"))"), ("VakitMetinleri.nqo", "\(VakitMetinleri.dil("nqo"))")] {
    esitMi(m.unicodeScalars.contains(where: { doguRakamlari.contains($0) }), false, "rakam: \(ad) Dogu rakami tasimaz")
}
depo.arayuzDiliniYaz("ar")
esitMi(depo.rakamSisteminiYaz("arab"), true, "rakam depo: yeni deger degisti der")
esitMi(depo.rakamSisteminiYaz("arab"), false, "rakam depo: ayni deger degismedi der")
esitMi(depo.rakamSistemi(), "arab", "rakam depo: okunur")
esitMi(RakamSistemi.doguMu(dil: depo.arayuzDili(), kayitli: depo.rakamSistemi()), true, "rakam depo: ar + arab Dogu")
depo.arayuzDiliniYaz("bn")
esitMi(RakamSistemi.etkin(dil: depo.arayuzDili(), kayitli: depo.rakamSistemi()), "latn", "rakam depo: bn + arab kaydi Bati")
esitMi(depo.rakamSisteminiYaz("beng"), true, "rakam depo: beng yazilir")
esitMi(RakamSistemi.etkin(dil: depo.arayuzDili(), kayitli: depo.rakamSistemi()), "beng", "rakam depo: bn + beng Bengalce")
esitMi(depo.rakamSisteminiYaz(nil), true, "rakam depo: silme degisti der")
esitMi(depo.rakamSistemi(), nil, "rakam depo: nil anahtari siler")
esitMi(depo.rakamSisteminiYaz(nil), false, "rakam depo: yoku silmek degismedi der")
depo.arayuzDiliniYaz("tr")
_ = depo.arayuzDili()

// MARK: - 14) Duvar kagidi kisisellestirme — duvar-tasarim-ornek.json (JS/Kotlin ortak)

// Ornek, 1. argumanin (`android/app/src/test/resources/widget-ornek.json`) YANINDADIR: CI komutu
// degismeden okunur. Yoksa test BASARISIZ olur (sessiz atlama yok).
struct DuvarOrnekAn: Decodable {
    let an: Int64
    let gok: String
    let sonrakiSinir: Int64?
}

struct DuvarOrnekGok: Decodable {
    let vakitler: [Int64]
    let ornekler: [DuvarOrnekAn]
}

struct DuvarOrnekYer: Decodable {
    let ust: Double
    let bant: [Double]
}

struct DuvarOrnekYerlesim: Decodable {
    let platform: String
    let ekran: String
    let istenen: Double
    let blok: Double
    let beklenen: DuvarOrnekYer?
}

struct DuvarOrnekCisim: Decodable {
    let gok: String
    let kutu: [Double]?
    let oran: Double
    let beklenen: [Double]?
}

struct DuvarOrnekOkunurlukSonucu: Decodable {
    let metin: String
    let perde: String
    let perdeOpakligi: Double
}

struct DuvarOrnekOkunurluk: Decodable {
    let parlaklik: Double
    let beklenen: DuvarOrnekOkunurlukSonucu
}

/// Ornekteki [ust, alt] → `DuvarBandi` (null/bozuk → nil).
func duvarBandi(_ d: [Double]?) -> DuvarBandi? {
    guard let d, d.count == 2 else { return nil }
    return DuvarBandi(ust: d[0], alt: d[1])
}

/// Beklenen ayar KATI cozulur (hosgorulu normalize ile karsilastirilirsa ikisi ayni hatayi saklardi).
struct DuvarOrnekAyar: Decodable {
    struct Yazi: Decodable {
        let kilitY: Double?
        let anaY: Double?
        let olcek: Double
        let hiza: String
        let tip: String
    }
    struct Sus: Decodable {
        let tur: String
        let belirginlik: Double
    }
    struct Foto: Decodable {
        let dosya: String?
        let karartma: Double
        let bulaniklik: Double
        let x: Double
        let y: Double
        let yakinlik: Double
        let okunurluk: Bool
    }
    let acik: Bool
    let yer: String
    let zemin: String
    let arapca: Bool
    let paletRenk: String
    let vakteUysun: Bool
    let yazi: Yazi
    let sus: Sus
    let foto: Foto
    let saatAlani: [Double]?

    var ayar: DuvarAyari {
        DuvarAyari(
            acik: acik, yer: yer, zemin: zemin, arapca: arapca, paletRenk: paletRenk, vakteUysun: vakteUysun,
            yazi: DuvarYaziAyari(kilitY: yazi.kilitY, anaY: yazi.anaY, olcek: yazi.olcek, hiza: yazi.hiza, tip: yazi.tip),
            sus: DuvarSusAyari(tur: sus.tur, belirginlik: sus.belirginlik),
            foto: DuvarFotoAyari(
                dosya: foto.dosya, karartma: foto.karartma, bulaniklik: foto.bulaniklik, x: foto.x, y: foto.y,
                yakinlik: foto.yakinlik, okunurluk: foto.okunurluk
            ),
            saatAlani: duvarBandi(saatAlani)
        )
    }
}

/// Kilit ekrani saat alani (`saat`): bantlar, cisim kacisi, sus solmasi, yildiz degmesi, normalize.
struct DuvarOrnekSaat: Decodable {
    struct Bant: Decodable {
        let platform: String
        let alan: [Double]?
        let beklenen: [[Double]]
    }
    struct Cisim: Decodable {
        let gok: String
        let kutu: [Double]?
        let alan: [Double]?
        let oran: Double
        let beklenen: [Double]?
    }
    struct Solma: Decodable {
        let y: Double
        let alan: [Double]?
        let beklenen: Double
    }
    struct Degme: Decodable {
        let y1: Double
        let y2: Double
        let alan: [Double]?
        let beklenen: Bool
    }
    struct Normalize: Decodable {
        let ham: DuvarJson?
        let beklenen: [Double]?
    }
    let varsayilan: [String: [Double]]
    let disSinir: [String: [Double]]
    let bantlar: [Bant]
    let cisim: [Cisim]
    let solma: [Solma]
    let degme: [Degme]
    let normalize: [Normalize]
}

struct DuvarOrnekNormalize: Decodable {
    let ham: DuvarJson
    let beklenen: DuvarOrnekAyar
}

/// Cizim sayilari (`cizim`): JS `duvarCizimi.ts` (duzenleyici onizlemesi) = `DuvarCizim` sabitleri.
struct DuvarOrnekKemer: Decodable {
    let yanPay: Double
    let r: Double
    let merkezAlti: Double
    let kalinlik: Double
    let opaklik: Double
}

struct DuvarOrnekCizim: Decodable {
    struct MihrapYildizi: Decodable {
        let merkezUstu: Double
        let disR: Double
        let icR: Double
        let opaklik: Double
    }
    struct Mihrap: Decodable {
        let yaziYanPayi: Double
        let dis: DuvarOrnekKemer
        let ic: DuvarOrnekKemer
        let yildiz: MihrapYildizi
    }
    struct Girih: Decodable {
        let karo: Double
        let yol: String
        let daireR: Double
        let yildizKalinlik: Double
        let daireKalinlik: Double
        let opaklik: Double
    }
    struct Yildiz: Decodable {
        let birim: Double
        let yariKenar: Double
        let kosegen: Double
        let daireR: Double
        let kalinlik: Double
        let konum: [String: [Double]]
        let opaklik: Double
        let kucukKalinlik: Double
    }
    struct Sus: Decodable {
        let mihrap: Mihrap
        let girih: Girih
        let yildiz: Yildiz
    }
    struct Perde: Decodable {
        let pay: Double
        let yaricap: Double
    }
    struct YanPay: Decodable {
        let mihrap: Double
        let diger: Double
    }
    struct Carpan: Decodable {
        let belirginlik: Double
        let beklenen: Double
    }
    struct BesKose: Decodable {
        let cx: Double
        let cy: Double
        let dis: Double
        let ic: Double
        let beklenen: [[Double]]
    }
    struct RenkSonucu: Decodable {
        let zemin: String?
        let metin: String
        let kunye: String
        let kunyeOpaklik: Double
        let atif: String
        let atifOpaklik: Double
        let sus: String
        let susOpaklik: Double
    }
    struct Renk: Decodable {
        let zemin: String
        let paletRenk: String
        let beklenen: RenkSonucu
    }
    struct FotoGirdisi: Decodable {
        let x: Double
        let y: Double
        let yakinlik: Double
    }
    struct FotoSonucu: Decodable {
        let sol: Double
        let ust: Double
        let genislik: Double
        let yukseklik: Double
    }
    struct Foto: Decodable {
        let ekran: [Double]
        let gorsel: [Double]
        let foto: FotoGirdisi
        let beklenen: FotoSonucu
    }
    let tasarimGenisligi: Double
    let yazi: [String: Double]
    let sus: Sus
    let perde: Perde
    let yanPay: YanPay
    let susCarpani: [Carpan]
    let besKoseliYildiz: BesKose
    let renkler: [Renk]
    let foto: [Foto]
}

struct DuvarOrnek: Decodable {
    let surum: Int
    let cizim: DuvarOrnekCizim
    let sahneler: [String: DuvarGokSahnesi]
    let izinliBantlar: [String: [String: [[Double]]]]
    let varsayilanMerkez: [String: [String: Double]]
    let gok: DuvarOrnekGok
    let yerlesim: [DuvarOrnekYerlesim]
    let cisim: [DuvarOrnekCisim]
    let okunurluk: [DuvarOrnekOkunurluk]
    let normalize: [DuvarOrnekNormalize]
    let saat: DuvarOrnekSaat
}

func yakinMi(_ a: Double, _ b: Double, _ ad: String, tolerans: Double = 1e-6) {
    if abs(a - b) <= tolerans {
        gecen += 1
    } else {
        hatalar.append("\(ad)\n    beklenen: \(b)\n    gercek:   \(a)")
    }
}

let duvarOrnekYolu = URL(fileURLWithPath: argumanlar[1]).deletingLastPathComponent()
    .appendingPathComponent("duvar-tasarim-ornek.json").path
let duvarOrnek = oku(duvarOrnekYolu, DuvarOrnek.self)
esitMi(duvarOrnek.surum, 1, "duvar: ornek surumu")
esitMi(Set(duvarOrnek.sahneler.keys), Set(DuvarTasarimi.goklar), "duvar: bes gok sahnesi cozulur")
esitMi(duvarOrnek.sahneler["imsak"]?.cisim?.tur, "hilal", "duvar: imsak cismi hilal")
esitMi(duvarOrnek.sahneler["ikindi"]?.huzmeler.count, 3, "duvar: ikindi huzmeleri")
esitMi(duvarOrnek.sahneler["kusluk"]?.metin, "#1F2A22", "duvar: kusluk yazi rengi koyu")

// Bant ve merkez tablolari (iki platform) JS ile birebir.
for (platform, ekranlar) in duvarOrnek.izinliBantlar {
    for (ekran, bantlar) in ekranlar {
        esitMi(
            DuvarTasarimi.izinliBantlar[platform]?[ekran] ?? [],
            bantlar.map { DuvarBandi(ust: $0[0], alt: $0[1]) },
            "duvar: izinli bantlar \(platform)/\(ekran)"
        )
    }
}
for (platform, ekranlar) in duvarOrnek.varsayilanMerkez {
    for (ekran, merkez) in ekranlar {
        esitMi(DuvarTasarimi.varsayilanMerkez[platform]?[ekran], merkez, "duvar: varsayilan merkez \(platform)/\(ekran)")
    }
}

for o in duvarOrnek.gok.ornekler {
    esitMi(DuvarTasarimi.vaktinGogu(o.an, duvarOrnek.gok.vakitler), o.gok, "duvar: vaktinGogu(\(o.an))")
    esitMi(DuvarTasarimi.sonrakiGokSiniri(o.an, duvarOrnek.gok.vakitler), o.sonrakiSinir, "duvar: sonrakiGokSiniri(\(o.an))")
}

for o in duvarOrnek.yerlesim {
    let ad = "duvar: yaziYerlesimi \(o.platform)/\(o.ekran) istenen=\(o.istenen) blok=\(o.blok)"
    let sonuc = DuvarTasarimi.yaziYerlesimi(o.istenen, o.blok, DuvarTasarimi.izinliBantlar[o.platform]?[o.ekran] ?? [])
    switch (sonuc, o.beklenen) {
    case (nil, nil):
        gecen += 1
    case let (s?, b?):
        yakinMi(s.ust, b.ust, "\(ad) ust")
        esitMi(s.bant, DuvarBandi(ust: b.bant[0], alt: b.bant[1]), "\(ad) bant")
    default:
        hatalar.append("\(ad)\n    beklenen: \(String(describing: o.beklenen))\n    gercek:   \(String(describing: sonuc))")
    }
}

for o in duvarOrnek.cisim {
    guard let cisim = duvarOrnek.sahneler[o.gok]?.cisim else {
        hatalar.append("duvar: \(o.gok) cismi ornekte yok")
        continue
    }
    esitMi(
        DuvarTasarimi.cisimKonumuSec(cisim, kutu: o.kutu, oran: o.oran), o.beklenen,
        "duvar: cisimKonumuSec \(o.gok) kutu=\(String(describing: o.kutu))"
    )
}

for o in duvarOrnek.okunurluk {
    let k = DuvarTasarimi.okunurlukKarari(o.parlaklik)
    esitMi(k.metin, o.beklenen.metin, "duvar: okunurluk(\(o.parlaklik)).metin")
    esitMi(k.perde, o.beklenen.perde, "duvar: okunurluk(\(o.parlaklik)).perde")
    yakinMi(k.perdeOpakligi, o.beklenen.perdeOpakligi, "duvar: okunurluk(\(o.parlaklik)).perdeOpakligi", tolerans: 1e-9)
}

for (i, o) in duvarOrnek.normalize.enumerated() {
    esitMi(DuvarAyari.normalize(o.ham), o.beklenen.ayar, "duvar: normalize[\(i)] (eski kayit / bozuk alanlar)")
}

// Kilit ekrani saat alani (`saat`): JS `duvarTasarimi.ts` > "Kilit ekrani saat alani" ile BIREBIR.
let so = duvarOrnek.saat
for (platform, alan) in so.varsayilan {
    esitMi(DuvarTasarimi.varsayilanSaatAlani[platform], duvarBandi(alan), "saat: varsayilan alan \(platform)")
}
for (platform, alan) in so.disSinir {
    esitMi(DuvarTasarimi.kilitDisSinir[platform], duvarBandi(alan), "saat: dis sinir \(platform)")
}
esitMi(so.bantlar.contains { $0.platform == "ios" }, true, "saat: ornekte iPhone bantlari var")
for o in so.bantlar {
    esitMi(
        DuvarTasarimi.bantlar(o.platform, "kilit", saatAlani: duvarBandi(o.alan)),
        o.beklenen.map { DuvarBandi(ust: $0[0], alt: $0[1]) },
        "saat: bantlar \(o.platform) alan=\(String(describing: o.alan))"
    )
}
// Olculmemis kilit = sabit tablo; ana ekran saat alanindan etkilenmez.
for platform in ["android", "ios"] {
    esitMi(
        DuvarTasarimi.bantlar(platform, "kilit", saatAlani: nil), DuvarTasarimi.izinliBantlar[platform]?["kilit"] ?? [],
        "saat: olculmemis kilit bantlari tabloyla ayni \(platform)"
    )
    esitMi(
        DuvarTasarimi.bantlar(platform, "ana", saatAlani: DuvarBandi(ust: 0.3, alt: 0.5)), DuvarTasarimi.izinliBantlar[platform]?["ana"] ?? [],
        "saat: ana ekran bantlari sabit \(platform)"
    )
}
for o in so.cisim {
    guard let cisim = duvarOrnek.sahneler[o.gok]?.cisim else {
        hatalar.append("saat: \(o.gok) cismi ornekte yok")
        continue
    }
    esitMi(
        DuvarTasarimi.cisimKonumuSec(cisim, kutu: o.kutu, oran: o.oran, saatAlani: duvarBandi(o.alan)), o.beklenen,
        "saat: cisimKonumuSec \(o.gok) kutu=\(String(describing: o.kutu)) alan=\(String(describing: o.alan))"
    )
}
for o in so.solma {
    yakinMi(DuvarTasarimi.saatSolmasi(o.y, duvarBandi(o.alan)), o.beklenen, "saat: saatSolmasi(\(o.y))")
}
yakinMi(DuvarTasarimi.saatSolmasi(0.5, nil), 1, "saat: alan yoksa solma yok", tolerans: 0)
for o in so.degme {
    esitMi(DuvarTasarimi.saateDegiyor(o.y1, o.y2, duvarBandi(o.alan)), o.beklenen, "saat: saateDegiyor(\(o.y1), \(o.y2))")
}
esitMi(DuvarTasarimi.saateDegiyor(0, 1, nil), false, "saat: alan yoksa degme yok")
for (i, o) in so.normalize.enumerated() {
    esitMi(DuvarTasarimi.saatAlaniNormalize(o.ham), duvarBandi(o.beklenen), "saat: saatAlaniNormalize[\(i)]")
}
esitMi(DuvarTasarimi.saatAlaniNormalize(nil), nil, "saat: normalize yok → nil")
// Elle: JSON true sayi degil; 3 elemanli dizi bozuk.
let saatBozuk = try? JSONDecoder().decode(DuvarJson.self, from: Data(#"[[true,0.5],[0.1,0.2,0.3]]"#.utf8))
esitMi(DuvarTasarimi.saatAlaniNormalize(saatBozuk?.dizi?[0]), nil, "saat: true sayi degil")
esitMi(DuvarTasarimi.saatAlaniNormalize(saatBozuk?.dizi?[1]), nil, "saat: uc elemanli dizi bozuk")
// Etkin alan: kilit (ve ikisi) ayardaki ya da varsayilan; ana nil.
var saatAyari = DuvarAyari.normalize(nil)
esitMi(DuvarTasarimi.etkinSaatAlani(saatAyari, ekran: "kilit"), DuvarBandi(ust: 0.08, alt: 0.34), "saat: etkin alan varsayilan iPhone")
esitMi(DuvarTasarimi.etkinSaatAlani(saatAyari, ekran: DuvarTasarimi.ekran("ana")), nil, "saat: ana ekranda alan yok")
saatAyari.saatAlani = DuvarBandi(ust: 0.2, alt: 0.4)
esitMi(DuvarTasarimi.etkinSaatAlani(saatAyari, ekran: DuvarTasarimi.ekran("ikisi")), DuvarBandi(ust: 0.2, alt: 0.4), "saat: ikisi ayardaki alan")

// Solma duraklari: dogrusal ara degerleme `saatSolmasi`'ni birebir verir (cizicinin maskesi).
func duraktanSolma(_ duraklar: [[Double]], _ y: Double) -> Double {
    guard let ilk = duraklar.first, let son = duraklar.last else { return 1 }
    if y <= ilk[0] { return ilk[1] }
    if y >= son[0] { return son[1] }
    for i in 1 ..< duraklar.count where y <= duraklar[i][0] {
        let a = duraklar[i - 1]
        let b = duraklar[i]
        return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0])
    }
    return son[1]
}
for alan in [DuvarBandi(ust: 0.26, alt: 0.64), DuvarBandi(ust: 0.08, alt: 0.34), DuvarBandi(ust: 0.3, alt: 0.36), DuvarBandi(ust: 0, alt: 0.6)] {
    let duraklar = DuvarTasarimi.solmaDuraklari(alan)
    esitMi(duraklar.first?[0], 0, "saat: solma duraklari 0'dan baslar \(alan)")
    esitMi(duraklar.last?[0], 1, "saat: solma duraklari 1'de biter \(alan)")
    esitMi(zip(duraklar, duraklar.dropFirst()).allSatisfy { $0.0[0] < $0.1[0] }, true, "saat: solma duraklari artan \(alan)")
    for i in 0 ... 400 {
        let y = Double(i) / 400
        yakinMi(duraktanSolma(duraklar, y), DuvarTasarimi.saatSolmasi(y, alan), "saat: solma duragi y=\(y) \(alan)", tolerans: 1e-9)
    }
}
for o in so.solma {
    yakinMi(duraktanSolma(DuvarTasarimi.solmaDuraklari(duvarBandi(o.alan)), o.y), o.beklenen, "saat: solma duragi ornek y=\(o.y)")
}
esitMi(DuvarTasarimi.solmaDuraklari(nil).isEmpty, true, "saat: alan yoksa durak yok")

// Kilit ekrani olcumu: satir profili (saf). Referans 12×40 desen; ekran = referans, karartilmis, ustune saat.
let olcG = 12
let olcY = 40
let olcRef: [Double] = (0 ..< olcG * olcY).map { i in 0.1 + 0.5 * (0.5 + 0.5 * sin(Double(i) * 0.37) * cos(Double(i / olcG) * 0.21)) }
let ayniProfil = DuvarTasarimi.kilitProfili(ekran: olcRef, referans: olcRef, genislik: olcG, yukseklik: olcY)
esitMi(ayniProfil.count, olcY, "olcum: satir sayisi")
esitMi(ayniProfil.allSatisfy { $0 < 0.001 }, true, "olcum: ayni gorsel → degisen yok")
let karartilmis = olcRef.map { $0 * 0.8 + 0.02 }
esitMi(
    DuvarTasarimi.kilitProfili(ekran: karartilmis, referans: olcRef, genislik: olcG, yukseklik: olcY).allSatisfy { $0 < 0.001 }, true,
    "olcum: kilit ekrani karartmasi (×0,8 + 0,02) degisiklik sayilmaz"
)
// Satir 6–10 (5/40 = %12,5) beyaz saat.
let saatliEkran = karartilmis.enumerated().map { i, v in (6 ... 10).contains(i / olcG) ? 1.0 : v }
let saatliProfil = DuvarTasarimi.kilitProfili(ekran: saatliEkran, referans: olcRef, genislik: olcG, yukseklik: olcY)
for satir in 0 ..< olcY {
    if (6 ... 10).contains(satir) {
        esitMi(saatliProfil[satir] > 0.9, true, "olcum: saat satiri \(satir) dolu")
    } else {
        esitMi(saatliProfil[satir] < 0.001, true, "olcum: saat disi satir \(satir) bos")
    }
}
esitMi(DuvarTasarimi.kilitProfili(ekran: [0.5], referans: olcRef, genislik: olcG, yukseklik: olcY), [], "olcum: eksik dizi → bos")
// Android `DuvarTasarimiTest` capraz denetim ornekleri (ikili kesirler: kayan nokta esitlikleri kesin).
var duzEkran = [Double](repeating: 0.5, count: 25)
for (i, v) in [(1, 0.59375), (6, 0.40625), (12, 0.75), (13, 0.25), (7, 0.8125), (18, 0.1875), (20, 0.875), (24, 0.125), (21, 0.9375), (3, 0.0625)] { duzEkran[i] = v }
esitMi(DuvarTasarimi.kilitProfili(ekran: duzEkran, referans: [Double](repeating: 0.5, count: 25), genislik: 5, yukseklik: 5),
       [0.2, 0.4, 0.4, 0.2, 0.6], "olcum capraz: duz referans, esitlikte kucuk indis")
let egimRef = (0 ..< 20).map { Double($0) / 32 }
var egimEkran = egimRef.map { 0.5 * $0 + 0.125 }
egimEkran[9] = 1.0
egimEkran[10] = 0.9375
esitMi(DuvarTasarimi.kilitProfili(ekran: egimEkran, referans: egimRef, genislik: 4, yukseklik: 5), [0, 0, 0.5, 0, 0], "olcum capraz: egimli referans")
yakinMi(DuvarTasarimi.parlakliklar(rgba: [255, 255, 255, 255, 0, 0, 0, 255])[0], 1, "olcum: beyaz parlaklik 1", tolerans: 1e-9)
yakinMi(DuvarTasarimi.parlakliklar(rgba: [0, 255, 0, 255])[0], 0.7152, "olcum: yesil agirligi", tolerans: 1e-9)
esitMi(DuvarTasarimi.parlakliklar(rgba: [1, 2, 3]).count, 0, "olcum: eksik piksel atlanir")
esitMi(DuvarTasarimi.olcumYuksekligi(genislik: 1179, yukseklik: 2556), 234, "olcum: 108 genislikte yukseklik (iPhone 15)")
esitMi(DuvarTasarimi.olcumYuksekligi(genislik: 270, yukseklik: 585), 234, "olcum: referans kopyasinda ayni yukseklik")
esitMi(DuvarTasarimi.olcumOranlariUyumlu(ekranG: 1179, ekranY: 2556, refG: 270, refY: 585), true, "olcum: ayni oran")
esitMi(DuvarTasarimi.olcumOranlariUyumlu(ekranG: 1179, ekranY: 2556, refG: 270, refY: 540), false, "olcum: %8 farkli oran")
esitMi(DuvarTasarimi.olcumOranlariUyumlu(ekranG: 0, ekranY: 2556, refG: 270, refY: 585), false, "olcum: sifir boyut")

// Elle: JS `typeof` ayrimi — JSON true sayi DEGIL, 1 mantik DEGIL; vakteUysun/okunurluk yalniz false ile kapanir.
func duvarAyariCoz(_ json: String) -> DuvarAyari {
    let ham = try? JSONDecoder().decode(DuvarJson.self, from: Data(json.utf8))
    return DuvarAyari.normalize(ham)
}
let tipAyrimi = duvarAyariCoz(#"{"acik":1,"arapca":"true","vakteUysun":0,"yazi":{"olcek":true,"kilitY":2,"anaY":"0.3"},"foto":{"okunurluk":null,"yakinlik":0.2}}"#)
esitMi(tipAyrimi.acik, false, "duvar elle: acik yalniz true ile")
esitMi(tipAyrimi.arapca, false, "duvar elle: arapca yalniz true ile")
esitMi(tipAyrimi.vakteUysun, true, "duvar elle: vakteUysun yalniz false ile kapanir")
esitMi(tipAyrimi.yazi.olcek, 1, "duvar elle: olcek=true sayi degil → varsayilan")
esitMi(tipAyrimi.yazi.kilitY, 1, "duvar elle: kilitY 0–1'e kirpilir")
esitMi(tipAyrimi.yazi.anaY, nil, "duvar elle: anaY metin → nil")
esitMi(tipAyrimi.foto.okunurluk, true, "duvar elle: okunurluk null → acik")
esitMi(tipAyrimi.foto.yakinlik, 1, "duvar elle: yakinlik en az 1")
esitMi(tipAyrimi.zemin, "imsak", "duvar elle: zemin yoksa imsak")
esitMi(duvarAyariCoz("[1,2]"), DuvarAyari.normalize(nil), "duvar elle: dizi → varsayilan")
esitMi(duvarAyariCoz(##"{"paletRenk":"#12345G"}"##).paletRenk, "#2E7D32", "duvar elle: bozuk palet → varsayilan")
esitMi(duvarAyariCoz(##"{"paletRenk":"#a1B2c3"}"##).paletRenk, "#a1B2c3", "duvar elle: palet buyuk/kucuk harf")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-ab12.jpg"), true, "duvar elle: foto adi gecerli")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-0123456789abcdefghij0123456789abcdefghij.png"), true, "duvar elle: foto adi 40 karakter")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-0123456789abcdefghij0123456789abcdefghijk.png"), false, "duvar elle: foto adi 40'tan uzun")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-abc.jpg"), false, "duvar elle: foto adi 4'ten kisa")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-AB12.jpg"), false, "duvar elle: foto adi buyuk harf")
esitMi(DuvarAyari.fotoAdiGecerliMi("../duvar-foto-ab12.jpg"), false, "duvar elle: foto adi yol tasimaz")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-ab12.jpeg"), false, "duvar elle: foto uzantisi")
esitMi(DuvarAyari.fotoAdiGecerliMi("duvar-foto-ab12.jpg\n"), false, "duvar elle: foto adi sonda satir sonu")

// Yuk eki: §10'daki ESKI yuk (yalniz v1 duvar alanlari) yeni alanlari varsayilanla doldurur.
let eskiEk = GununAyetiKarari.duvarEki(ayetHam)
esitMi(eskiEk.duvar.zemin, "gece", "duvar eki: eski kayit zeminini korur")
esitMi(eskiEk.duvar.vakteUysun, true, "duvar eki: eski kayit vakteUysun acik")
esitMi(eskiEk.duvar.yazi, DuvarYaziAyari.varsayilan, "duvar eki: eski kayit yazi varsayilan")
esitMi(eskiEk.duvar.sus, DuvarSusAyari.varsayilan, "duvar eki: eski kayit sus varsayilan")
esitMi(eskiEk.duvar.foto, DuvarFotoAyari.varsayilan, "duvar eki: eski kayit foto varsayilan")
esitMi(eskiEk.sahneler.isEmpty, true, "duvar eki: eski yukte gok yok")
esitMi(eskiEk.vakitler.isEmpty, true, "duvar eki: eski yukte vakit yok")
esitMi(GununAyetiKarari.duvarEki(nil), GununAyetiDuvarEki(duvar: DuvarAyari.normalize(nil), sahneler: [:], vakitler: [:]), "duvar eki: yuk yok")
// Bozuk gok sahnesi ayari ve vakitleri dusurmez; 5 olmayan vakit dizisi alinmaz.
let yeniEkHam = """
{"v":1,"dil":"tr","metin":{"etiket":"x","sigmiyor":"x","acin":"x","arapcaKaynagi":"x"},
 "plan":[{"gun":"2026-11-07","baslangicMs":1,"ref":"94:6","ar":"ا","meal":"m","kisaKunye":"k","mealKaynagi":"q","vakitler":[10,20,30,40,50]},
         {"gun":"2026-11-08","baslangicMs":2,"ref":"94:6","ar":"ا","meal":"m","kisaKunye":"k","mealKaynagi":"q","vakitler":[10,20]}],
 "duvar":{"acik":true,"zemin":"aksam","sus":{"tur":"mihrap","belirginlik":0.9}},
 "sahneler":{"imsak":{"bozuk":true}}}
"""
let yeniEk = GununAyetiKarari.duvarEki(yeniEkHam)
esitMi(yeniEk.duvar.zemin, "aksam", "duvar eki: zemin")
esitMi(yeniEk.duvar.sus, DuvarSusAyari(tur: "mihrap", belirginlik: 0.9), "duvar eki: sus")
esitMi(yeniEk.sahneler.isEmpty, true, "duvar eki: bozuk sahneler bos (gece zeminine duser)")
esitMi(yeniEk.vakitler, ["2026-11-07": [10, 20, 30, 40, 50]], "duvar eki: yalniz 5 vakitli kayit")
esitMi(GununAyetiKarari.coz(yeniEkHam)?.plan.count, 2, "duvar eki: widget yukun geri kalanini yine cozer")

// Cizilecek gok: vakte uyan gok an'a gore, vakitsiz (konum yok) secilen gok, duz zemin nil.
let gv: [Int64] = [10, 20, 30, 40, 50]
esitMi(DuvarTasarimi.cizilecekGok(zemin: "imsak", vakteUysun: true, simdiMs: 35, vakitler: gv), "ikindi", "duvar: vakte uyan gok")
esitMi(DuvarTasarimi.cizilecekGok(zemin: "imsak", vakteUysun: false, simdiMs: 35, vakitler: gv), "imsak", "duvar: sabit gok")
esitMi(DuvarTasarimi.cizilecekGok(zemin: "aksam", vakteUysun: true, simdiMs: 35, vakitler: nil), "aksam", "duvar: vakitsiz secilen gok")
esitMi(DuvarTasarimi.cizilecekGok(zemin: "gece", vakteUysun: true, simdiMs: 35, vakitler: gv), nil, "duvar: duz zemin gok degil")
esitMi(DuvarTasarimi.ekran("ikisi"), "kilit", "duvar: ikisi kilit gorselini cizer")
esitMi(DuvarTasarimi.ekran("ana"), "ana", "duvar: ana")
esitMi(DuvarTasarimi.yaziMerkezi(DuvarYaziAyari.varsayilan, ekran: "kilit"), 0.58, "duvar: iPhone kilit varsayilan merkezi")
esitMi(
    DuvarTasarimi.yaziMerkezi(DuvarYaziAyari(kilitY: 0.7, anaY: 0.2, olcek: 1, hiza: "orta", tip: "klasik"), ekran: "ana"), 0.2,
    "duvar: ana merkezi ayri"
)
let adimlar = DuvarTasarimi.kucultmeAdimlari()
esitMi(adimlar.count, 8, "duvar: kucultme adimlari (Kotlin ile ayni sayi)")
yakinMi(adimlar.last ?? 0, 0.58, "duvar: son kucultme ~0,58", tolerans: 1e-9)

// Yon ve hiza: sagdan sola mealde bas = sag.
esitMi(DuvarTasarimi.sagdanSolaMi("یقیناً مشکل کے ساتھ آسانی ہے"), true, "duvar: Urduca sagdan sola")
esitMi(DuvarTasarimi.sagdanSolaMi("(1) הוי"), true, "duvar: ayrac + Ibrani sagdan sola")
esitMi(DuvarTasarimi.sagdanSolaMi("Gerçekten güçlükle beraber"), false, "duvar: Turkce soldan saga")
esitMi(DuvarTasarimi.hiza("bas", sagdanSola: true), .sag, "duvar: RTL bas = sag")
esitMi(DuvarTasarimi.hiza("son", sagdanSola: false), .sag, "duvar: LTR son = sag")
esitMi(DuvarTasarimi.hiza("x", sagdanSola: false), .orta, "duvar: bilinmeyen hiza orta")

// Yazi tipi: Zarif (Amiri) Turkce/Latin-1/Genisletilmis-A'yi kapsar; Kiril ve Hausa ɗ klasik kurala duser.
esitMi(DuvarTasarimi.mealYazitipi("zarif", meal: "Gerçekten güçlükle beraber bir kolaylık vardır. İ ş ğ ı â"), .amiri, "duvar: zarif Turkce Amiri")
esitMi(DuvarTasarimi.mealYazitipi("zarif", meal: "Наистина, с тегобата идва облекчение."), .serif, "duvar: zarif Kiril → serif")
esitMi(DuvarTasarimi.mealYazitipi("zarif", meal: "Yã ku waɗanda"), .serif, "duvar: zarif Hausa ɗ → serif")
esitMi(DuvarTasarimi.mealYazitipi("zarif", meal: "归信的人们啊"), .sistem, "duvar: zarif Cince → sistem")
esitMi(DuvarTasarimi.mealYazitipi("sade", meal: "Gerçekten"), .sistem, "duvar: sade sistem")
esitMi(DuvarTasarimi.mealYazitipi("klasik", meal: "Gerçekten"), .serif, "duvar: klasik serif")

// Duz zemin renkleri (Kotlin `DuvarKagidiKurallari` ikizi): yesil palet degismez, gri koyulasir.
esitMi(DuvarTasarimi.okunurPaletZemini(0x2E7D32), 0x2E7D32, "duvar: uygulama yesili olduğu gibi")
let griZemin = DuvarTasarimi.okunurPaletZemini(0x808080)
esitMi(griZemin != 0x808080, true, "duvar: orta gri koyulasir")
esitMi(
    max(DuvarTasarimi.kontrastOrani(0xF1F8E9, griZemin), DuvarTasarimi.kontrastOrani(0x1F2A22, griZemin)) >= 4.5, true,
    "duvar: koyulasan palet 4,5:1"
)
esitMi(DuvarTasarimi.zeminRenkleri("gece", paletRenk: "#2E7D32").zemin, 0x14211A, "duvar: gece zemini")
esitMi(DuvarTasarimi.zeminRenkleri("kagit", paletRenk: "#2E7D32").metin, 0x1F2A22, "duvar: kagit metni koyu")
let paletRenkleri = DuvarTasarimi.zeminRenkleri("palet", paletRenk: "#2E7D32")
esitMi(paletRenkleri.metin, 0xF1F8E9, "duvar: yesil palette acik metin")
esitMi(DuvarTasarimi.kontrastOrani(paletRenkleri.kunye, paletRenkleri.zemin) >= 4.5, true, "duvar: palet kunyesi 4,5:1")
esitMi(DuvarTasarimi.karistir(0x000000, 0xFFFFFF, 0.5), 0x808080, "duvar: karisim (yarim yukari yuvarlanir)")
esitMi(DuvarCizim.yildizKonumu("aksam"), [0.855, 0.878], "duvar: gokte yildiz sag altta")

// Cizim sayilari (`cizim`): native sabitler JS `duvarCizimi.ts` (duzenleyici onizlemesi) ile BIREBIR.
let cz = duvarOrnek.cizim
yakinMi(DuvarCizim.tasarimGenisligi, cz.tasarimGenisligi, "cizim: tasarim genisligi", tolerans: 1e-12)
let yaziSabitleri: [String: Double] = [
    "meal": DuvarCizim.meal, "mealArapcali": DuvarCizim.mealArapcali, "arapca": DuvarCizim.arapca, "kunye": DuvarCizim.kunye,
    "atif": DuvarCizim.atif, "yanBosluk": DuvarCizim.yanBosluk, "kucukYildiz": DuvarCizim.kucukYildiz,
    "arapcaSatir": DuvarCizim.arapcaSatir, "mealSatir": DuvarCizim.mealSatir, "kunyeHarfAraligi": DuvarCizim.kunyeHarfAraligi,
    "mealUstArapcali": DuvarCizim.mealUstArapcali, "mealUstYildizli": DuvarCizim.mealUstYildizli,
    "kunyeUstArapcali": DuvarCizim.kunyeUstArapcali, "kunyeUst": DuvarCizim.kunyeUst, "atifUst": DuvarCizim.atifUst,
    "atifEnAzOlcek": DuvarCizim.atifEnAzOlcek,
]
// Ornekteki her yazi olcusu native'de de var (yeni olcu eklenirse bu kontrol duser).
esitMi(Set(yaziSabitleri.keys), Set(cz.yazi.keys), "cizim: yazi olcusu adlari")
for (ad, deger) in cz.yazi.sorted(by: { $0.key < $1.key }) {
    yakinMi(yaziSabitleri[ad] ?? .nan, deger, "cizim: yazi.\(ad)", tolerans: 1e-12)
}
func kemerAyniMi(_ k: DuvarKemeri, _ e: DuvarOrnekKemer, _ ad: String) {
    yakinMi(k.yanPay, e.yanPay, "\(ad).yanPay", tolerans: 1e-12)
    yakinMi(k.r, e.r, "\(ad).r", tolerans: 1e-12)
    yakinMi(k.merkezAlti, e.merkezAlti, "\(ad).merkezAlti", tolerans: 1e-12)
    yakinMi(k.kalinlik, e.kalinlik, "\(ad).kalinlik", tolerans: 1e-12)
    yakinMi(k.opaklik, e.opaklik, "\(ad).opaklik", tolerans: 1e-12)
}
yakinMi(DuvarCizim.mihrapYaziYanPayi, cz.sus.mihrap.yaziYanPayi, "cizim: mihrap yazi yan payi", tolerans: 1e-12)
kemerAyniMi(DuvarCizim.mihrapDis, cz.sus.mihrap.dis, "cizim: mihrap dis")
kemerAyniMi(DuvarCizim.mihrapIc, cz.sus.mihrap.ic, "cizim: mihrap ic")
yakinMi(DuvarCizim.mihrapYildizUst, cz.sus.mihrap.yildiz.merkezUstu, "cizim: mihrap yildiz ust", tolerans: 1e-12)
yakinMi(DuvarCizim.mihrapYildizDisR, cz.sus.mihrap.yildiz.disR, "cizim: mihrap yildiz disR", tolerans: 1e-12)
yakinMi(DuvarCizim.mihrapYildizIcR, cz.sus.mihrap.yildiz.icR, "cizim: mihrap yildiz icR", tolerans: 1e-12)
yakinMi(DuvarCizim.mihrapYildizOpaklik, cz.sus.mihrap.yildiz.opaklik, "cizim: mihrap yildiz opaklik", tolerans: 1e-12)
yakinMi(DuvarCizim.girihKaro, cz.sus.girih.karo, "cizim: girih karo", tolerans: 1e-12)
esitMi(DuvarCizim.girihYol, cz.sus.girih.yol, "cizim: girih yolu")
esitMi(
    DuvarCizim.girihNoktalari(), [[24, 0], [30, 18], [48, 24], [30, 30], [24, 48], [18, 30], [0, 24], [18, 18]],
    "cizim: girih yolu dort koseli yildiz"
)
yakinMi(DuvarCizim.girihDaireR, cz.sus.girih.daireR, "cizim: girih daire", tolerans: 1e-12)
yakinMi(DuvarCizim.girihYildizKalinlik, cz.sus.girih.yildizKalinlik, "cizim: girih yildiz cizgisi", tolerans: 1e-12)
yakinMi(DuvarCizim.girihDaireKalinlik, cz.sus.girih.daireKalinlik, "cizim: girih daire cizgisi", tolerans: 1e-12)
yakinMi(DuvarCizim.girihOpaklik, cz.sus.girih.opaklik, "cizim: girih opaklik", tolerans: 1e-12)
yakinMi(DuvarCizim.yildizBirim, cz.sus.yildiz.birim, "cizim: yildiz birim", tolerans: 1e-12)
yakinMi(DuvarCizim.yildizYariKenar, cz.sus.yildiz.yariKenar, "cizim: yildiz yari kenar", tolerans: 1e-12)
yakinMi(DuvarCizim.yildizKosegen, cz.sus.yildiz.kosegen, "cizim: yildiz kosegen", tolerans: 1e-12)
yakinMi(DuvarCizim.yildizDaireR, cz.sus.yildiz.daireR, "cizim: yildiz daire", tolerans: 1e-12)
yakinMi(DuvarCizim.yildizKalinlik, cz.sus.yildiz.kalinlik, "cizim: yildiz cizgi", tolerans: 1e-12)
yakinMi(DuvarCizim.yildizOpaklik, cz.sus.yildiz.opaklik, "cizim: yildiz opaklik", tolerans: 1e-12)
yakinMi(DuvarCizim.kucukYildizKalinlik, cz.sus.yildiz.kucukKalinlik, "cizim: kucuk yildiz cizgi", tolerans: 1e-12)
for (zemin, anahtar) in [("gece", "gece"), ("kagit", "kagit"), ("palet", "palet"), ("aksam", "diger"), ("foto", "diger")] {
    esitMi(DuvarCizim.yildizKonumu(zemin), cz.sus.yildiz.konum[anahtar] ?? [], "cizim: yildiz konumu \(zemin)")
}
yakinMi(DuvarCizim.perdePay, cz.perde.pay, "cizim: perde payi", tolerans: 1e-12)
yakinMi(DuvarCizim.perdeYaricap, cz.perde.yaricap, "cizim: perde yaricapi", tolerans: 1e-12)
yakinMi(DuvarCizim.yaziYanPayi("mihrap"), cz.yanPay.mihrap, "cizim: mihrap yan payi", tolerans: 1e-12)
for tur in ["yildiz", "girih", "yok"] {
    yakinMi(DuvarCizim.yaziYanPayi(tur), cz.yanPay.diger, "cizim: \(tur) yan payi", tolerans: 1e-12)
}
for o in cz.susCarpani {
    yakinMi(DuvarCizim.susCarpani(o.belirginlik), o.beklenen, "cizim: susCarpani(\(o.belirginlik))", tolerans: 1e-12)
}
let besKose = DuvarCizim.besKoseliYildiz(cx: cz.besKoseliYildiz.cx, cy: cz.besKoseliYildiz.cy, dis: cz.besKoseliYildiz.dis, ic: cz.besKoseliYildiz.ic)
esitMi(besKose.count, cz.besKoseliYildiz.beklenen.count, "cizim: bes koseli yildiz kose sayisi")
// JS iki ondaliga yuvarlar (SVG noktasi).
for (i, n) in zip(besKose, cz.besKoseliYildiz.beklenen).enumerated() {
    yakinMi(n.0[0], n.1[0], "cizim: bes koseli yildiz x\(i)", tolerans: 0.006)
    yakinMi(n.0[1], n.1[1], "cizim: bes koseli yildiz y\(i)", tolerans: 0.006)
}
for o in cz.renkler {
    let ad = "cizim: renkler \(o.zemin) \(o.paletRenk)"
    let e = o.beklenen
    if ["gece", "kagit", "palet"].contains(o.zemin) {
        let r = DuvarTasarimi.zeminRenkleri(o.zemin, paletRenk: o.paletRenk)
        esitMi(r.zemin, DuvarTasarimi.rgb(e.zemin ?? "") ?? 1 << 24, "\(ad) zemin")
        esitMi(r.metin, DuvarTasarimi.rgb(e.metin) ?? 1 << 24, "\(ad) metin")
        esitMi(r.kunye, DuvarTasarimi.rgb(e.kunye) ?? 1 << 24, "\(ad) kunye")
        esitMi(r.atif, DuvarTasarimi.rgb(e.atif) ?? 1 << 24, "\(ad) atif")
        esitMi(r.sus, DuvarTasarimi.rgb(e.sus) ?? 1 << 24, "\(ad) sus")
        esitMi(e.kunyeOpaklik, 1, "\(ad) kunye opak")
        esitMi(e.atifOpaklik, 1, "\(ad) atif opak")
        yakinMi(r.susOpakligi, e.susOpaklik, "\(ad) sus opakligi", tolerans: 1e-12)
    } else {
        // Gok: yazi sahnenin rengi, kunye/atif/sus ayni rengin sabit opakliklari.
        esitMi(e.zemin, nil, "\(ad) zemin yok")
        esitMi(duvarOrnek.sahneler[o.zemin]?.metin, e.metin, "\(ad) metin")
        yakinMi(DuvarCizim.kunyeOpakligi, e.kunyeOpaklik, "\(ad) kunye opakligi", tolerans: 1e-12)
        yakinMi(DuvarCizim.atifOpakligi, e.atifOpaklik, "\(ad) atif opakligi", tolerans: 1e-12)
        yakinMi(DuvarCizim.yildizOpaklik, e.susOpaklik, "\(ad) sus opakligi", tolerans: 1e-12)
    }
}
// Fotograf: JS ekrandaki gorsel yerini verir; native gorsel pikselinde kirpar (olcek = ekrandaki genislik / gorsel genisligi).
for (i, o) in cz.foto.enumerated() {
    let k = DuvarTasarimi.fotoKirpmasi(
        gorselG: o.gorsel[0], gorselY: o.gorsel[1], hedefG: o.ekran[0], hedefY: o.ekran[1], x: o.foto.x, y: o.foto.y, yakinlik: o.foto.yakinlik
    )
    let olcek = o.beklenen.genislik / o.gorsel[0]
    yakinMi(-k.x * olcek, o.beklenen.sol, "cizim: foto[\(i)] sol")
    yakinMi(-k.y * olcek, o.beklenen.ust, "cizim: foto[\(i)] ust")
    yakinMi(k.genislik * olcek, o.ekran[0], "cizim: foto[\(i)] genislik")
    yakinMi(k.yukseklik * olcek, o.ekran[1], "cizim: foto[\(i)] yukseklik")
    yakinMi(o.gorsel[1] * olcek, o.beklenen.yukseklik, "cizim: foto[\(i)] gorsel yuksekligi")
}

// Fotograf: en-boy dolduran kirpma + parlaklik.
esitMi(
    DuvarTasarimi.fotoKirpmasi(gorselG: 2000, gorselY: 1000, hedefG: 100, hedefY: 200, x: 0.5, y: 0.5, yakinlik: 1),
    DuvarDikdortgen(x: 750, y: 0, genislik: 500, yukseklik: 1000), "duvar: yatay fotograf dikey ekrana ortadan kirpilir"
)
esitMi(
    DuvarTasarimi.fotoKirpmasi(gorselG: 2000, gorselY: 1000, hedefG: 100, hedefY: 200, x: 0, y: 0.5, yakinlik: 2),
    DuvarDikdortgen(x: 0, y: 250, genislik: 250, yukseklik: 500), "duvar: yakinlik + kenara dayali merkez gorselde kalir"
)
yakinMi(DuvarTasarimi.ortalamaParlaklik(rgba: [255, 255, 255, 255, 255, 255, 255, 255], karartma: 0), 1, "duvar: beyaz parlaklik 1")
yakinMi(DuvarTasarimi.ortalamaParlaklik(rgba: [255, 255, 255, 255], karartma: 1), 0, "duvar: tam karartma 0")
yakinMi(DuvarTasarimi.ortalamaParlaklik(rgba: [], karartma: 0), 0, "duvar: bos 0")
yakinMi(DuvarTasarimi.bulaniklikYaricapi(1, genislik: 1000, yukseklik: 2000), 40, "duvar: bulaniklik kisa kenarin %4'u")

// Atif ve Arapca (Kotlin `atifSatiri` / `duvardaArapca` ikizi).
let duvarKaydi = GununAyetiKaydi(gun: "g", baslangicMs: 0, ref: "94:6", ar: "ا", meal: "m", kisaKunye: "İnşirâh 94:6", mealKaynagi: "Q 1.0")
let duvarMetni = GununAyetiMetinleri(etiket: "E", sigmiyor: "s", acin: "a", arapcaKaynagi: "Arapça: Tanzil")
esitMi(GununAyetiKarari.atifSatiri(duvarKaydi, metin: duvarMetni, arapcaGorunuyor: false), "Q 1.0", "duvar: atif meal kaynagi")
esitMi(GununAyetiKarari.atifSatiri(duvarKaydi, metin: duvarMetni, arapcaGorunuyor: true), "Q 1.0 · Arapça: Tanzil", "duvar: atif + Arapca kaynagi")
var arapcaAyar = DuvarAyari.normalize(nil)
esitMi(GununAyetiKarari.duvardaArapca(duvarKaydi, ayar: arapcaAyar), false, "duvar: Arapca varsayilan kapali")
arapcaAyar.arapca = true
esitMi(GununAyetiKarari.duvardaArapca(duvarKaydi, ayar: arapcaAyar), true, "duvar: Arapca acik")

// MARK: - Sonuc

if hatalar.isEmpty {
    print("Siri cekirdegi: \(gecen) kontrol gecti.")
    exit(0)
} else {
    print("Siri cekirdegi: \(hatalar.count) hata (\(gecen) gecti):")
    for h in hatalar { print("  ✗ \(h)") }
    exit(1)
}
