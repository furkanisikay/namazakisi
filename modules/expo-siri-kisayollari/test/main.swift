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
// `src/core/widget/__tests__/iosWidgetKarari.test.ts` ile ortaktir. Herhangi bir uyusmazlikta cikis kodu 1'dir.

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

esitMi(ArayuzDili.desteklenenler, ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi"], "dil: tablo sirasi")
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
for dil in ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ur", "es", "nl", "sq", "hi", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "", "xx"] {
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
esitMi(RakamSistemi.cevir("15:42", sistem: RakamSistemi.etkin(dil: "bn", kayitli: "beng")), "১৫:৪২", "rakam: bn etkin sistemle")
esitMi(RakamSistemi.cevir("النهاية 15:42", dogu: true), "النهاية ١٥:٤٢", "rakam: saat cevrilir")
esitMi(RakamSistemi.cevir("1 س 5 د", dogu: true), "١ س ٥ د", "rakam: sure cevrilir")
esitMi(RakamSistemi.cevir("١٢:٠٩", dogu: true), "١٢:٠٩", "rakam: idempotent")
esitMi(RakamSistemi.cevir("Çıkış 15:42", dogu: false), "Çıkış 15:42", "rakam: Bati'da aynen")
esitMi(RakamSistemi.cevir("--:--", dogu: true), "--:--", "rakam: rakamsiz metin aynen")
esitMi(RakamSistemi.cevir(SiriDeposu.saatBicimleyici(TimeZone(identifier: "UTC")!)(0), dogu: false), "00:00",
       "rakam: cekirdek saat Bati rakamiyla uretilir")
// Yerel rakam yalniz cizimde: Arapca/Urduca/Bengalce/Farsca/Pestuca/Sorani tablolar Bati rakami tasir (Bati secen karisik gormesin).
let doguRakamlari = CharacterSet(charactersIn: "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹০১২৩৪৫৬৭৮৯")
for (ad, m) in [("VakitMetinleri.ar", "\(VakitMetinleri.dil("ar"))"), ("VakitMetinleri.ur", "\(VakitMetinleri.dil("ur"))"), ("VakitMetinleri.bn", "\(VakitMetinleri.dil("bn"))"),
                ("VakitMetinleri.fa", "\(VakitMetinleri.dil("fa"))"), ("VakitMetinleri.ps", "\(VakitMetinleri.dil("ps"))"),
                ("VakitMetinleri.ckb", "\(VakitMetinleri.dil("ckb"))")] {
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

// MARK: - Sonuc

if hatalar.isEmpty {
    print("Siri cekirdegi: \(gecen) kontrol gecti.")
    exit(0)
} else {
    print("Siri cekirdegi: \(hatalar.count) hata (\(gecen) gecti):")
    for h in hatalar { print("  ✗ \(h)") }
    exit(1)
}
