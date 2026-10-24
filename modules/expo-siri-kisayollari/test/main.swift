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
esitMi(ArayuzDili.coz("de"), "tr", "dil: desteklenmeyen → Turkce")
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

// MARK: - Sonuc

if hatalar.isEmpty {
    print("Siri cekirdegi: \(gecen) kontrol gecti.")
    exit(0)
} else {
    print("Siri cekirdegi: \(hatalar.count) hata (\(gecen) gecti):")
    for h in hatalar { print("  ✗ \(h)") }
    exit(1)
}
