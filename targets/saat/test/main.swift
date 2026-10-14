// Apple Watch Swift cekirdeginin test kosucusu (issue #285).
//
// watchOS SDK ve Xcode projesi GEREKMEZ: asagidaki dosyalarin hepsi yalniz Foundation
// kullanir. macOS CI (ve swift.org Linux arac zinciri) uzerinde:
//
//   swiftc -swift-version 5 -o /tmp/saat-test \
//     modules/expo-siri-kisayollari/ios/VakitKarari.swift \
//     modules/expo-siri-kisayollari/ios/WidgetKarari.swift \
//     modules/expo-siri-kisayollari/ios/SaatIletisi.swift \
//     targets/saat/ortak/SaatYuku.swift \
//     targets/saat/ortak/SaatDeposu.swift \
//     targets/saat/ortak/Tesbihat.swift \
//     targets/saat/test/main.swift
//   /tmp/saat-test wear/app/src/test/resources/ornek-yuk.json
//
// Fikstur Wear OS ile ORTAKTIR (JS `wearYuku.test.ts` + Kotlin `YukCozucu` testleri ayni
// dosyayi kabul eder): saat yuku tek taraflı degistirilemez. Uyusmazlikta cikis kodu 1.

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

let argumanlar = CommandLine.arguments
guard argumanlar.count >= 2, let fikstur = try? String(contentsOfFile: argumanlar[1], encoding: .utf8) else {
    print("Kullanim: saat-test <ornek-yuk.json>")
    exit(2)
}

// MARK: - 1) Yuk cozucu — Wear ortak fiksturu

guard case .basarili(let yuk) = SaatYukCozucu.coz(fikstur) else {
    print("Ortak fikstur cozulemedi (saat Wear yukunu kabul etmeli)")
    exit(1)
}
esitMi(yuk.surum, 2, "surum")
esitMi(yuk.konumAdi, "Fatih, İstanbul", "konumAdi")
esitMi(yuk.gunler.map { $0.tarih }, ["2026-10-11", "2026-10-12", "2026-10-13"], "gunler sirali")
esitMi(yuk.vakitAnlari.count, 18, "vakit anlari (gunes dahil)")
esitMi(yuk.vakitAnlari.first?.vakit, "sabah", "imsak → sabah (widget kodu)")
esitMi(yuk.kilinanlar["2026-10-12"], ["sabah"], "kilinan widget koduna cevrilir")
esitMi(yuk.kilinanlar["2026-10-11"], ["sabah", "ogle", "ikindi", "aksam", "yatsi"], "dunun kilinanlari sirali")
esitMi(yuk.kilinanlar["2026-10-13"], nil, "bos kilinan sozluge girmez")

// Fikstur anlari (2026-10-12)
let imsak12: Int64 = 1_791_772_860_000
let gunes12: Int64 = 1_791_777_900_000
let ogle12: Int64 = 1_791_798_960_000
let ikindi12: Int64 = 1_791_810_120_000
let aksam12: Int64 = 1_791_819_300_000
let yatsi12: Int64 = 1_791_824_040_000
let imsak13: Int64 = 1_791_859_320_000
let yatsi13: Int64 = 1_791_910_380_000
let dk: Int64 = 60_000
let saat: Int64 = 3_600_000

func ani(_ vakit: String, _ ms: Int64, _ tarih: String = "2026-10-12") -> SiriVakitAni {
    SiriVakitAni(vakit: vakit, ms: ms, tarih: tarih)
}

// MARK: - 2) Ekran karari (widget ile AYNI karar)

do {
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: ikindi12 + dk)
    esitMi(d.gorunum.aktif, ani("ikindi", ikindi12), "ikindi aktif")
    esitMi(d.gorunum.bitisMs, aksam12, "ikindinin cikisi aksam girisi")
    esitMi(d.gorunum.kilindi, false, "ikindi kilinmamis")
    esitMi(d.gorunum.sonraki, ani("aksam", aksam12), "siradaki aksam")
    esitMi(d.satirlar.map { $0.kod }, ["sabah", "ogle", "ikindi", "aksam", "yatsi"], "bes satir (gunes yok)")
    esitMi(d.satirlar.map { $0.ad }, ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"], "gorunen adlar")
    esitMi(d.satirlar.map { $0.kilindi }, [true, false, false, false, false], "satir kilinmisligi")
    esitMi(d.satirlar.map { $0.aktif }, [false, false, true, false, false], "aktif satir")
    esitMi(d.kildim, .aday(vakit: ani("ikindi", ikindi12), kayitVakti: "ikindi", ad: "İkindi"), "Kildim adayi")
    esitMi(d.veriEski, false, "veri taze")
}

do {
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: imsak12 + dk)
    esitMi(d.kildim, .zatenKilindi(ad: "Sabah"), "sabah zaten kilinmis")
    esitMi(d.gorunum.kilindi, true, "sabah kilindi gorunur")
}

do {
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: gunes12 + dk)
    esitMi(d.gorunum.aktif, nil, "gunes→ogle arasi aktif vakit yok")
    esitMi(d.gorunum.sonraki, ani("ogle", ogle12), "gunes sonrasi siradaki ogle")
    esitMi(d.kildim, .vakitYok(siradaki: ani("ogle", ogle12)), "gunes sonrasi kildim yok")
    esitMi(d.satirlar.count, 5, "gunes sonrasi da gunun satirlari")
}

do {
    // Iyimser bekleyen (KAYIT kodu) kilinmis sayilir.
    let b = [SaatBekleyen(tarih: "2026-10-12", vakit: "yatsi", ms: yatsi12 + dk)]
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: b, simdiMs: yatsi12 + saat)
    esitMi(d.kildim, .zatenKilindi(ad: "Yatsı"), "bekleyen yatsi kilinmis sayilir")
    esitMi(d.satirlar.last?.kilindi, true, "bekleyen satirda da gorunur")
}

do {
    // Gece yarisindan sonra suren yatsi DUNUN namaz gunune aittir.
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: yatsi12 + 5 * saat)
    esitMi(d.gorunum.aktif, ani("yatsi", yatsi12), "gece yarisi sonrasi yatsi (dunun gunu)")
    esitMi(d.gorunum.bitisMs, imsak13, "yatsinin cikisi ertesi imsak")
    esitMi(d.gorunum.gunTarihi, "2026-10-12", "gosterilen gun namaz gunu")
}

do {
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: yatsi13 + saat)
    esitMi(d.veriEski, true, "son girisin otesi = veri eski")
    esitMi(d.gorunum.aktif, nil, "veri eskiyken aktif yok")
}

// MARK: - 3) Gecersiz / surum

func yukMetni(_ degistir: (inout [String: Any]) -> Void) -> String {
    var o = (try! JSONSerialization.jsonObject(with: fikstur.data(using: .utf8)!)) as! [String: Any]
    degistir(&o)
    let veri = try! JSONSerialization.data(withJSONObject: o)
    return String(data: veri, encoding: .utf8)!
}

esitMi(SaatYukCozucu.coz(yukMetni { $0["surum"] = 3 }), .surumYeni(3), "yeni surum")
esitMi(SaatYukCozucu.coz(yukMetni { $0["gunler"] = [Any]() }), .gecersiz, "bos gunler")
esitMi(SaatYukCozucu.coz(yukMetni { $0.removeValue(forKey: "muhafiz") }), .gecersiz, "v2'de plan dizisi zorunlu")
if case .basarili(let v1) = SaatYukCozucu.coz(yukMetni { $0["surum"] = 1; $0.removeValue(forKey: "muhafiz") }) {
    esitMi(v1.surum, 1, "v1 yuku okunur")
} else {
    hatalar.append("v1 yuku okunmali")
}
esitMi(
    SaatYukCozucu.coz(yukMetni { o in
        var gunler = o["gunler"] as! [[String: Any]]
        gunler[0]["kilinan"] = ["gunes"]
        o["gunler"] = gunler
    }),
    .gecersiz,
    "gunes kilinmis olamaz"
)
esitMi(
    SaatYukCozucu.coz(yukMetni { o in
        var gunler = o["gunler"] as! [[String: Any]]
        var v = gunler[1]["vakitler"] as! [String: Any]
        v.removeValue(forKey: "ikindi")
        gunler[1]["vakitler"] = v
        o["gunler"] = gunler
    }),
    .gecersiz,
    "eksik vakit"
)
esitMi(
    SaatYukCozucu.coz(yukMetni { o in
        var gunler = o["gunler"] as! [[String: Any]]
        gunler[2]["tarih"] = "13.10.2026"
        o["gunler"] = gunler
    }),
    .gecersiz,
    "bozuk tarih"
)
esitMi(SaatYukCozucu.coz(yukMetni { $0.removeValue(forKey: "kerahatDk") }), .gecersiz, "kerahat zorunlu")
esitMi(SaatYukCozucu.coz(""), .gecersiz, "bos metin")
esitMi(SaatYukCozucu.coz(nil), .gecersiz, "nil")
esitMi(SaatYukCozucu.coz("{bozuk"), .gecersiz, "bozuk JSON")

// MARK: - 4) Iyimser bekleyenleri suzme

do {
    let liste = [
        SaatBekleyen(tarih: "2026-10-12", vakit: "imsak", ms: ikindi12),   // yuk tasiyor → duser
        SaatBekleyen(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12),  // kalir
        SaatBekleyen(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12 + dk), // tekrar → duser
        SaatBekleyen(tarih: "2026-10-09", vakit: "ogle", ms: ikindi12 - 49 * saat), // eskimis → duser
    ]
    esitMi(
        SaatKarari.bekleyenleriSuz(liste, yuk: yuk, simdiMs: ikindi12 + dk),
        [SaatBekleyen(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12)],
        "bekleyen suzme"
    )
    esitMi(SaatKarari.bekleyenleriSuz(liste, yuk: nil, simdiMs: ikindi12 + dk).count, 2, "yuksuz yalniz omur + tekrar")
}

// MARK: - 5) Ileti sozlesmesi (telefon ↔ saat)

do {
    let ileti = SaatIletisi.kildimIletisi(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12)
    esitMi(SaatIletisi.kildimCoz(ileti), SaatIletisi.Kildim(tarih: "2026-10-12", vakit: "ikindi"), "kildim gidis-donus")
    esitMi(SaatIletisi.kildimCoz(SaatIletisi.kildimIletisi(tarih: "2026-10-12", vakit: "sabah", ms: 0)), nil, "sabah reddedilir (kayit kodu imsak)")
    esitMi(SaatIletisi.kildimCoz(SaatIletisi.kildimIletisi(tarih: "2026-10-12", vakit: "gunes", ms: 0)), nil, "gunes reddedilir")
    esitMi(SaatIletisi.kildimCoz(SaatIletisi.kildimIletisi(tarih: "12.10.2026", vakit: "ogle", ms: 0)), nil, "bozuk tarih reddedilir")
    esitMi(SaatIletisi.kildimCoz(["tur": "baska", "tarih": "2026-10-12", "vakit": "ogle"]), nil, "yanlis tur")
    esitMi(SaatIletisi.kildimCoz([:]), nil, "bos ileti")
    esitMi(SaatIletisi.yukJson(SaatIletisi.baglam(yukJson: "{}")), "{}", "baglam gidis-donus")
    esitMi(SaatIletisi.yukJson(SaatIletisi.baglam(yukJson: "")), nil, "bos yuk")
    esitMi(SaatIletisi.yukJson(["yuk": 5]), nil, "yuk dize degilse nil")
}

// MARK: - 6) Tesbihat (Kotlin `Tesbihat` ikizi)

do {
    var d = Tesbihat.Durum()
    var olaylar: [Tesbihat.Olay] = []
    for _ in 0..<100 {
        let s = Tesbihat.say(d)
        d = s.durum
        olaylar.append(s.olay)
    }
    esitMi(olaylar[32], .fazTamam, "33. sayim faz tamam")
    esitMi(olaylar[65], .fazTamam, "66. sayim faz tamam")
    esitMi(olaylar[98], .fazTamam, "99. sayim tehlile gecer")
    esitMi(olaylar[99], .bitti, "100. sayim bitti")
    esitMi(olaylar.filter { $0 == .tik }.count, 96, "geri kalan tik")
    esitMi(Tesbihat.say(d).olay, .yok, "tamamken sayim yok")
    esitMi(d.faz, .tehlil, "tamamken tehlil gosterilir")
    esitMi(Tesbihat.geriAl(Tesbihat.Durum()).olay, .yok, "sifirda geri alma yok")
    let geri = Tesbihat.geriAl(Tesbihat.Durum(toplam: 33))
    esitMi(geri.durum.faz, .subhanallah, "geri alma faz sinirini geri gecer")
    esitMi(geri.durum.fazSayisi, 32, "geri alinmis faz sayisi")
    esitMi(Tesbihat.kisaMetin(Tesbihat.Durum(toplam: 45)), "Elhamdülillâh · 12/33", "kisa metin")
    let t0: Int64 = 1_000_000_000_000
    esitMi(Tesbihat.yukle(toplam: 40, sonDokunusMs: t0, simdiMs: t0 + 10 * dk).toplam, 40, "taze oturum korunur")
    esitMi(Tesbihat.yukle(toplam: 40, sonDokunusMs: t0, simdiMs: t0 + 91 * dk).toplam, 0, "eskimis oturum sifirlanir")
    esitMi(Tesbihat.yukle(toplam: 40, sonDokunusMs: t0, simdiMs: t0 - saat).toplam, 40, "saat geri alindiysa korunur")
    esitMi(Tesbihat.yukle(toplam: 101, sonDokunusMs: t0, simdiMs: t0).toplam, 0, "bozuk sayi sifira")
}

do {
    let t = TacBiriktirici(esik: 1.0)
    esitMi(t.olay(0.4, zamanMs: 0), false, "esik altinda sayim yok")
    esitMi(t.olay(0.7, zamanMs: 10), true, "ayni yonde birikim sayar")
    esitMi(t.olay(1.5, zamanMs: 50), false, "120 ms icinde ikinci sayim yutulur")
    esitMi(t.olay(1.5, zamanMs: 300), true, "aralik sonrasi sayar")
    esitMi(t.olay(-0.6, zamanMs: 600), false, "ters yon birikimi")
    esitMi(t.olay(0.6, zamanMs: 610), false, "yon degisince birikim sifirlanir")
    esitMi(t.olay(5.0, zamanMs: 900), true, "hizli savurus tek sayim")
    esitMi(t.olay(0, zamanMs: 1000), false, "sifir olay")
}

// MARK: - 7) Saat deposu (yeni yuk, surum, bekleyen)

do {
    let suite = "test.namazakisi.saat.\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suite)!
    let depo = SaatDeposu(defaults: defaults)
    esitMi(depo.yuk(), nil, "bos depo")
    esitMi(depo.yeniYukuIsle(fikstur, simdiMs: ikindi12), true, "ilk yuk degisiklik")
    esitMi(depo.yeniYukuIsle(fikstur, simdiMs: ikindi12), false, "ayni yuk degisiklik degil")
    esitMi(depo.yeniYukuIsle(yukMetni { $0["surum"] = 9 }, simdiMs: ikindi12), true, "yeni surum isareti")
    esitMi(depo.surumYeniMi(), true, "surum isareti okunur")
    esitMi(depo.yuk()?.surum, 2, "yeni surumde eski veri korunur")
    esitMi(depo.yeniYukuIsle("{bozuk", simdiMs: ikindi12), false, "gecersiz yuk yok sayilir")
    depo.bekleyenEkle(SaatBekleyen(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12))
    depo.bekleyenEkle(SaatBekleyen(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12 + dk))
    esitMi(depo.bekleyenler().count, 1, "ayni bekleyen iki kez eklenmez")
    let onayli = yukMetni { o in
        var gunler = o["gunler"] as! [[String: Any]]
        gunler[1]["kilinan"] = ["imsak", "ikindi"]
        o["gunler"] = gunler
    }
    esitMi(depo.yeniYukuIsle(onayli, simdiMs: ikindi12 + dk), true, "telefon onayi degisiklik")
    esitMi(depo.surumYeniMi(), false, "gecerli yuk surum isaretini kaldirir")
    esitMi(depo.bekleyenler(), [], "onaylanan bekleyen duser")
    esitMi(depo.tesbihatOku(simdiMs: ikindi12).toplam, 0, "tesbihat bos")
    depo.tesbihatYaz(Tesbihat.Durum(toplam: 12), simdiMs: ikindi12)
    esitMi(depo.tesbihatOku(simdiMs: ikindi12 + dk).toplam, 12, "tesbihat okunur")
    defaults.removePersistentDomain(forName: suite)
}

// MARK: - Sonuc

if hatalar.isEmpty {
    print("✅ Saat cekirdegi: \(gecen) kontrol gecti")
    exit(0)
}
print("❌ \(hatalar.count) uyusmazlik (\(gecen) gecti):")
for h in hatalar { print("  - \(h)") }
exit(1)
