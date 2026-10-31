// Apple Watch Swift cekirdeginin test kosucusu (issue #285).
//
// watchOS SDK ve Xcode projesi GEREKMEZ: asagidaki dosyalarin hepsi yalniz Foundation
// kullanir. macOS CI (ve swift.org Linux arac zinciri) uzerinde:
//
//   swiftc -swift-version 5 -o /tmp/saat-test \
//     modules/expo-siri-kisayollari/ios/VakitKarari.swift \
//     modules/expo-siri-kisayollari/ios/WidgetKarari.swift \
//     modules/expo-siri-kisayollari/ios/SaatIletisi.swift \
//     targets/saat/ortak/(tum .swift dosyalari) \
//     targets/saat/test/main.swift
//   /tmp/saat-test wear/app/src/test/resources/ornek-yuk.json wear/app/src/test/resources/kible-ornekleri.json
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
    esitMi(Tesbihat.kisaMetin(Tesbihat.Durum(toplam: 45)), "Elhamdülillâh, 12/33", "kisa metin (noktali ayrac yok)")
    // Okunuslar dile gore (sahip karari 2026-10-25): ceviri degil, o dilin yaygin yazimi.
    esitMi(Tesbihat.Faz.subhanallah.ad(), "Sübhânallah", "tr zikir adi varsayilan")
    esitMi(Tesbihat.kaynak(), "Müslim, Mesâcid 146", "tr kunye varsayilan")
    esitMi(Tesbihat.tehlilMetni().hasPrefix("Lâ ilâhe illallâhü vahdehû"), true, "tr tehlil varsayilan")
    esitMi(Tesbihat.kisaMetin(Tesbihat.Durum(toplam: 45), dil: "en"), "Alhamdulillah, 12/33", "en kisa metin")
    esitMi(Tesbihat.Faz.subhanallah.ad(dil: "fr"), "Soubhanallah", "fr zikir adi")
    esitMi(Tesbihat.Faz.allahuEkber.ad(dil: "ms"), "Allahuakbar", "ms zikir adi")
    esitMi(Tesbihat.kaynak(dil: "id"), "HR. Muslim, Masajid 146", "id kunye")
    esitMi(Tesbihat.kaynak(dil: "de"), "Muslim, Masadschid 146", "de kunye")
    esitMi(Tesbihat.tehlilMetni(dil: "de"), Tesbihat.tehlilMetni(dil: "en"), "de tehlil = en")
    esitMi(Tesbihat.tehlilMetni(dil: "ms"), Tesbihat.tehlilMetni(dil: "id"), "ms tehlil = id")
    for kod in ArayuzDili.desteklenenler {
        for f in Tesbihat.Faz.allCases {
            esitMi(f.ad(dil: kod).isEmpty, false, "\(kod) zikir adi bos degil")
        }
        esitMi(Tesbihat.tehlilMetni(dil: kod).isEmpty, false, "\(kod) tehlil bos degil")
        esitMi(Tesbihat.kaynak(dil: kod).isEmpty, false, "\(kod) kunye bos degil")
    }
    func kirilMi(_ s: String) -> Bool {
        let harfler = s.unicodeScalars.filter { CharacterSet.letters.contains($0) }
        return !harfler.isEmpty && harfler.allSatisfy { (0x0400...0x04FF).contains($0.value) }
    }
    for f in Tesbihat.Faz.allCases {
        esitMi(kirilMi(f.ad(dil: "ru")), true, "ru zikir adi Kiril")
    }
    esitMi(kirilMi(Tesbihat.tehlilMetni(dil: "ru")), true, "ru tehlil Kiril")
    esitMi(kirilMi(Tesbihat.kaynak(dil: "ru")), true, "ru kunye Kiril")
    for f in Tesbihat.Faz.allCases {
        esitMi(f.ad(dil: "xx"), f.ad(dil: "tr"), "bilinmeyen dil zikir adi Turkce")
    }
    esitMi(Tesbihat.tehlilMetni(dil: "xx"), Tesbihat.tehlilMetni(), "bilinmeyen dil tehlil Turkce")
    esitMi(Tesbihat.kaynak(dil: "xx"), Tesbihat.kaynak(), "bilinmeyen dil kunye Turkce")
    let t0: Int64 = 1_000_000_000_000
    esitMi(Tesbihat.yukle(toplam: 40, sonDokunusMs: t0, simdiMs: t0 + 10 * dk).toplam, 40, "taze oturum korunur")
    esitMi(Tesbihat.yukle(toplam: 40, sonDokunusMs: t0, simdiMs: t0 + 91 * dk).toplam, 0, "eskimis oturum sifirlanir")
    esitMi(Tesbihat.yukle(toplam: 40, sonDokunusMs: t0, simdiMs: t0 - saat).toplam, 40, "saat geri alindiysa korunur")
    esitMi(Tesbihat.yukle(toplam: 101, sonDokunusMs: t0, simdiMs: t0).toplam, 0, "bozuk sayi sifira")
}

do {
    let t = TacBiriktirici(esik: 1.0)
    esitMi(t.olay(0.4, zamanMs: 0), .yok, "esik altinda adim yok")
    esitMi(t.olay(0.7, zamanMs: 10), .say, "ayni yonde birikim sayar")
    esitMi(t.olay(1.5, zamanMs: 50), .yok, "120 ms icinde ikinci adim yutulur")
    esitMi(t.olay(1.5, zamanMs: 300), .say, "aralik sonrasi sayar")
    esitMi(t.olay(-0.6, zamanMs: 600), .yok, "ters yon birikimi")
    esitMi(t.olay(0.6, zamanMs: 610), .yok, "yon degisince birikim sifirlanir")
    esitMi(t.olay(5.0, zamanMs: 900), .say, "hizli savurus tek adim")
    esitMi(t.olay(0, zamanMs: 1000), .yok, "sifir olay")
    esitMi(t.olay(-1.2, zamanMs: 1200), .geriAl, "ters yon GERI ALIR (eskiden sayardi)")
    esitMi(t.olay(-0.5, zamanMs: 1250), .yok, "geri almadan sonra birikim atildi")
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

// MARK: - 8) Plan, uyandirma ve konum cozumu (#285 cilasi — Kotlin `YukCozucu` katiligi)

let tehecUyandirma = "nafile_2026-10-12_teheccud_45"
let imsakUyandirma = "muhafiz_2026-10-13_vakit_imsak_seviye_2_dk_34"
do {
    esitMi(yuk.plan.map { $0.id }, ["muhafiz_2026-10-12_vakit_ikindi_seviye_1_dk_45", "muhafiz_2026-10-12_vakit_ikindi_seviye_4_dk_3"], "plan kronolojik okunur")
    esitMi(yuk.plan.last?.acil, true, "acil bayragi okunur")
    esitMi(yuk.plan.first?.vakit, "ikindi", "plan vakti KAYIT kodu")
    esitMi(yuk.uyandirma.map { $0.id }, [tehecUyandirma, imsakUyandirma], "uyandirma kronolojik okunur")
    esitMi(yuk.uyandirma.first?.nafile, true, "teheccud nafile")
    esitMi(yuk.konum, SaatKonum(lat: 41, lng: 29), "konum okunur")
    func planDegistir(_ degis: @escaping (inout [String: Any]) -> Void) -> String {
        return yukMetni { o in
            var plan = o["muhafiz"] as! [[String: Any]]
            degis(&plan[0])
            o["muhafiz"] = plan
        }
    }
    esitMi(SaatYukCozucu.coz(planDegistir { $0["seviye"] = 5 }), .gecersiz, "bozuk seviye tum yuku reddeder")
    esitMi(SaatYukCozucu.coz(planDegistir { $0["vakit"] = "gunes" }), .gecersiz, "gunes plan vakti olamaz")
    esitMi(SaatYukCozucu.coz(planDegistir { $0["adim"] = 6 }), .gecersiz, "adim tavani")
    esitMi(SaatYukCozucu.coz(planDegistir { $0["adim"] = 1.5 }), .gecersiz, "adim tam sayi olmali")
    esitMi(SaatYukCozucu.coz(planDegistir { $0.removeValue(forKey: "baslik") }), .gecersiz, "baslik zorunlu")
    if case .basarili(let y) = SaatYukCozucu.coz(planDegistir { $0.removeValue(forKey: "adim") }) {
        esitMi(y.plan.count, 2, "adim opsiyonel (eski telefon)")
    } else {
        hatalar.append("adimsiz plan okunmali")
    }
    esitMi(
        SaatYukCozucu.coz(yukMetni { o in
            var u = o["uyandirma"] as! [[String: Any]]
            u[0]["tur"] = "ogle"
            o["uyandirma"] = u
        }),
        .gecersiz,
        "uyandirma turu imsak/teheccud"
    )
    esitMi(
        SaatYukCozucu.coz(yukMetni { o in
            var u = o["uyandirma"] as! [[String: Any]]
            u[0]["sonMs"] = u[0]["ms"]
            o["uyandirma"] = u
        }),
        .gecersiz,
        "uyandirma sonMs > ms"
    )
    if case .basarili(let y) = SaatYukCozucu.coz(yukMetni { $0["konum"] = ["lat": "41", "lng": 29] }) {
        esitMi(y.konum, nil, "bozuk konum GEVSEK: yalniz kible duser")
    } else {
        hatalar.append("bozuk konum yuku reddetmemeli")
    }
    if case .basarili(let y) = SaatYukCozucu.coz(yukMetni { $0["konum"] = ["lat": 0, "lng": 0] }) {
        esitMi(y.konum, nil, "(0,0) nobetcisi")
    } else {
        hatalar.append("(0,0) konum yuku reddetmemeli")
    }
    if case .basarili(let y) = SaatYukCozucu.coz(yukMetni { $0.removeValue(forKey: "uyandirma"); $0.removeValue(forKey: "konum") }) {
        esitMi(y.uyandirma, [], "uyandirma opsiyonel")
        esitMi(y.konum, nil, "konum opsiyonel")
    } else {
        hatalar.append("uyandirmasiz yuk okunmali")
    }
}

// MARK: - 9) Saatin yerel bildirim secimi (telefonla AYNI kimlik)

do {
    let hepsi = SaatHatirlatmaPlani.bildirimler(yuk: yuk, bekleyenler: [], simdiMs: ikindi12)
    esitMi(hepsi.map { $0.id }, yuk.plan.map { $0.id }, "gelecek kayitlar AYNI kimlikle")
    esitMi(
        SaatHatirlatmaPlani.bildirimler(yuk: yuk, bekleyenler: [], simdiMs: 1_791_816_600_000).map { $0.id },
        ["muhafiz_2026-10-12_vakit_ikindi_seviye_4_dk_3"],
        "tetigi gelmis kayit kurulmaz"
    )
    esitMi(
        SaatHatirlatmaPlani.bildirimler(
            yuk: yuk, bekleyenler: [SaatBekleyen(tarih: "2026-10-12", vakit: "ikindi", ms: ikindi12)], simdiMs: ikindi12
        ),
        [],
        "iyimser Kildim o vaktin bildirimlerini dusurur"
    )
    esitMi(SaatHatirlatmaPlani.bildirimler(yuk: yuk, bekleyenler: [], simdiMs: ikindi12, azami: 1).count, 1, "azami kronolojik keser")
    esitMi(SaatHatirlatmaPlani.vakitOneki(tarih: "2026-10-12", vakit: "ikindi"), "muhafiz_2026-10-12_vakit_ikindi_", "vakit oneki")
    // Uyandirma kimligi plana da yazilmissa bildirim KURULMAZ (bilekte sessiz alarm calar).
    let ciftli = yukMetni { o in
        var plan = o["muhafiz"] as! [[String: Any]]
        var k = plan[0]
        k["id"] = imsakUyandirma
        k["tarih"] = "2026-10-13"
        k["vakit"] = "imsak"
        k["ms"] = 1_791_862_320_000
        plan.append(k)
        o["muhafiz"] = plan
    }
    if case .basarili(let y) = SaatYukCozucu.coz(ciftli) {
        esitMi(
            SaatHatirlatmaPlani.bildirimler(yuk: y, bekleyenler: [], simdiMs: ikindi12).contains { $0.id == imsakUyandirma },
            false,
            "uyandirma kimligi bildirim olarak kurulmaz"
        )
    } else {
        hatalar.append("ciftli yuk okunmali")
    }
}

// MARK: - 10) Sessiz uyandirma karari (Wear `UyandirmaZinciri` ikizi)

do {
    let siradaki = SaatUyandirmaKarari.siradaki(yuk: yuk, bekleyenler: [], kapatilan: [], simdiMs: ikindi12)
    esitMi(siradaki?.id, tehecUyandirma, "siradaki en yakin uyandirma")
    esitMi(
        SaatUyandirmaKarari.siradaki(yuk: yuk, bekleyenler: [], kapatilan: [tehecUyandirma], simdiMs: ikindi12)?.id,
        imsakUyandirma,
        "kapatilan atlanir"
    )
    esitMi(
        SaatUyandirmaKarari.siradaki(
            yuk: yuk, bekleyenler: [SaatBekleyen(tarih: "2026-10-13", vakit: "imsak", ms: 0)], kapatilan: [tehecUyandirma], simdiMs: ikindi12
        ),
        nil,
        "kilinmis sabah uyandirmaz"
    )
    esitMi(
        SaatUyandirmaKarari.siradaki(yuk: yuk, bekleyenler: [], kapatilan: [], simdiMs: 1_791_856_620_000 - 37 * saat),
        nil,
        "36 sa ufkunun otesi kurulamaz"
    )
    let t = Int64(1_791_856_620_000)
    esitMi(SaatUyandirmaKarari.calacak(yuk: yuk, bekleyenler: [], kapatilan: [], simdiMs: t + 30_000)?.id, tehecUyandirma, "zamani gelen calar")
    esitMi(SaatUyandirmaKarari.calacak(yuk: yuk, bekleyenler: [], kapatilan: [], simdiMs: t + 3 * dk), nil, "2 dk sonra calmaz (yedek esas)")
    esitMi(SaatUyandirmaKarari.calacak(yuk: yuk, bekleyenler: [], kapatilan: [tehecUyandirma], simdiMs: t), nil, "kapatilan calmaz")
    let tehec = yuk.uyandirma[0]
    esitMi(SaatUyandirmaKarari.kildimKapsami(yuk: yuk, kayit: tehec), [tehecUyandirma], "teheccud Kildim o gecenin tum kimlikleri")
    esitMi(SaatUyandirmaKarari.kildimKapsami(yuk: yuk, kayit: yuk.uyandirma[1]), [imsakUyandirma], "sabah Kildim yalniz kendi")

    let suite = "test.namazakisi.saat.uy.\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suite)!
    let depo = SaatDeposu(defaults: defaults)
    depo.uyandirmalariKapat([tehecUyandirma: tehec.sonMs], simdiMs: t)
    esitMi(depo.kapatilanUyandirmalar(simdiMs: t), [tehecUyandirma], "kapatilan saklanir")
    esitMi(depo.kapatilanUyandirmalar(simdiMs: tehec.sonMs + 25 * saat), [], "bayat kapatilan budanir")
    defaults.removePersistentDomain(forName: suite)
}

// MARK: - 11) Uyandirma iletisi (saat → telefon)

do {
    let u = SaatIletisi.Uyandirma(id: tehecUyandirma, islem: "kildim", tur: "teheccud", tarih: "2026-10-12", sonMs: 1_791_859_320_000)
    esitMi(SaatIletisi.uyandirmaCoz(SaatIletisi.uyandirmaIletisi(u)), u, "uyandirma gidis-donus")
    let k = SaatIletisi.Uyandirma(id: imsakUyandirma, islem: "kapat", tur: "imsak", tarih: "2026-10-13", sonMs: 1)
    esitMi(SaatIletisi.uyandirmaCoz(SaatIletisi.uyandirmaIletisi(k)), k, "sabah kapat gidis-donus")
    let ertele = SaatIletisi.Uyandirma(id: imsakUyandirma, islem: "ertele", tur: "imsak", tarih: "2026-10-13", sonMs: 1)
    esitMi(SaatIletisi.uyandirmaCoz(SaatIletisi.uyandirmaIletisi(ertele)), nil, "ERTELE YOK (sahip karari)")
    let celiskili = SaatIletisi.Uyandirma(id: imsakUyandirma, islem: "kapat", tur: "teheccud", tarih: "2026-10-13", sonMs: 1)
    esitMi(SaatIletisi.uyandirmaCoz(SaatIletisi.uyandirmaIletisi(celiskili)), nil, "kimlikle celisen tur reddedilir")
    esitMi(SaatIletisi.uyandirmaKimligiMi("muhafiz_2026-10-13_vakit_ogle_seviye_2_dk_34"), false, "ogle uyandirma degil")
    esitMi(SaatIletisi.uyandirmaKimligiMi("nafile_2026-10-12_kusluk_5"), false, "kusluk uyandirma degil")
    esitMi(SaatIletisi.kildimCoz(SaatIletisi.uyandirmaIletisi(u)), nil, "uyandirma iletisi farz Kildim'i DEGIL")
}

// MARK: - 12) Kible (Wear `Kible.kt` ortak fiksturu, 1e-9)

if argumanlar.count >= 3, let kibleMetni = try? String(contentsOfFile: argumanlar[2], encoding: .utf8),
   let ornekler = (try? JSONSerialization.jsonObject(with: kibleMetni.data(using: .utf8)!)) as? [[String: Any]] {
    for o in ornekler {
        // NSNumber: Linux'ta JSONSerialization tam sayiyi `as? Double` ile vermeyebilir.
        guard let lat = (o["lat"] as? NSNumber)?.doubleValue, let lng = (o["lng"] as? NSNumber)?.doubleValue,
              let beklenen = (o["aci"] as? NSNumber)?.doubleValue else {
            hatalar.append("kible fiksturu okunamadi: \(o)")
            continue
        }
        let aci = Kible.aci(enlem: lat, boylam: lng)
        // Kabe'nin kendisi dejeneredir (atan2(0, 0)): yalniz "sonlu ve [0,360)" aranir (Wear `KibleTest` ile ayni).
        if (o["ad"] as? String) == "Kâbe" {
            if !(aci.isFinite && aci >= 0 && aci < 360) { hatalar.append("kible Kâbe dejenere degil: \(aci)") } else { gecen += 1 }
            continue
        }
        if abs(aci - beklenen) <= 1e-9 { gecen += 1 } else { hatalar.append("kible \(o["ad"] ?? "?"): \(aci) != \(beklenen)") }
        if !(aci >= 0 && aci < 360) { hatalar.append("kible [0,360) disinda: \(aci)") }
    }
    esitMi(ornekler.isEmpty, false, "kible fiksturu bos degil")
} else {
    hatalar.append("Kible fiksturu verilmedi (2. arguman: kible-ornekleri.json)")
}
do {
    esitMi(Kible.donusMetni(35), "Sağa 35°", "saga donus")
    esitMi(Kible.donusMetni(360 - 121), "Sola 120°", "sola donus 5° adim")
    esitMi(Kible.donusMetni(178), "Arkanızda", "arkada")
    esitMi(Kible.donusMetni(1), "Sağa 5°", "en az 5°")
    esitMi(Kible.hiza(oncekiHizali: false, hedef: 4).hizali, true, "5° altinda hizaya girer")
    esitMi(Kible.hiza(oncekiHizali: false, hedef: 6).hizali, false, "6° hizada degil")
    esitMi(Kible.hiza(oncekiHizali: false, hedef: 4).titret, true, "giriste titrer")
    esitMi(Kible.hiza(oncekiHizali: true, hedef: 7).hizali, true, "8°'ye kadar hizada kalir (histerezis)")
    esitMi(Kible.hiza(oncekiHizali: true, hedef: 7).titret, false, "hizadayken tekrar titremez")
    esitMi(Kible.hiza(oncekiHizali: true, hedef: 9).hizali, false, "8° ustunde cikar")
    esitMi(Kible.hiza(oncekiHizali: false, hedef: 355.5).hizali, true, "sol yandan hiza")
    esitMi(Kible.enKisaYol(onceki: 359, yeni: 1), 361, "359 → 1 en kisa yol")
    esitMi(Kible.erisimMetni(36, hizali: false), "Kıble 40 derece sağınızda", "erisim metni 10° adim")
}

// MARK: - 13) Bugun kadrani (yeniden tasarim) + Kabe uzakligi

do {
    let ist = TimeZone(secondsFromGMT: 3 * 3600)!
    let d = SaatKadran.dilimler(yuk: yuk, tarih: "2026-10-12", saatDilimi: ist)
    esitMi(d.map { $0.kod }, ["sabah", "ogle", "ikindi", "aksam", "yatsi"], "bes pencere sirali")
    esitMi(d.first?.basMs, imsak12, "sabah imsakta baslar")
    esitMi(d.first?.bitisMs, gunes12, "sabah gunes'te biter")
    esitMi(d.last?.bitisMs, imsak13, "yatsi ERTESI imsakta biter")
    esitMi(abs(SaatKadran.kesir(imsak12, saatDilimi: ist) - 0.236805555) < 1e-6, true, "kesir yerel gece yarisindan")
    let yatsiYaylari = SaatKadran.yaylar(d[4], saatDilimi: ist)
    esitMi(yatsiYaylari.count, 2, "gece yarisini asan yatsi iki yay")
    esitMi(yatsiYaylari.first?.upperBound, 1, "ilk parca gece yarisina kadar")
    esitMi(yatsiYaylari.last?.lowerBound, 0, "ikinci parca gece yarisindan")
    esitMi(SaatKadran.yaylar(d[1], saatDilimi: ist).count, 1, "ogle tek yay")
    esitMi(SaatKadran.dilimler(yuk: yuk, tarih: "2026-10-13", saatDilimi: ist).last.map { $0.bitisMs > $0.basMs }, true, "son gunde yatsi gece yarisina")
    esitMi(SaatKadran.dilimler(yuk: yuk, tarih: "1999-01-01"), [], "olmayan gun bos")
    esitMi(SaatKadran.odak(tac: 2.4), 2, "tac yuvarlanir")
    esitMi(SaatKadran.odak(tac: -3), 0, "tac alt sinir")
    esitMi(SaatKadran.odak(tac: 9), 4, "tac ust sinir")
    esitMi(SaatKadran.odak(tac: .nan), 0, "tac NaN")
    esitMi(SaatKadran.indeks("ikindi"), 2, "kod indeksi")
    esitMi(abs(Kible.mesafeKm(enlem: 41, boylam: 29) - 2403.4) < 1, true, "Istanbul → Kabe ~2403 km")
    esitMi(Kible.mesafeMetni(2403.4), "2.400 km", "binlik ayraci + 10 km yuvarlama")
    esitMi(Kible.mesafeMetni(845), "850 km", "uc haneli")
    esitMi(Kible.mesafeMetni(3), "Kâbe'desiniz", "10 km alti")
}

// MARK: - 14) Birimli geri sayim (#363, JS `kalanSureParcalari` ikizi)

do {
    func p(_ ms: Int64, _ s: Bool = false) -> [String] { SaatSure.parcalar(kalanMs: ms, saniyesiz: s).map { "\($0.sayi) \($0.birim)" } }
    esitMi(p((1 * 3600 + 9 * 60 + 9) * 1000), ["1 sa", "9 dk"], "saat ve ustu: saniye yok")
    esitMi(p((9 * 60 + 5) * 1000), ["9 dk", "05 sn"], "saatin alti: saniye iki haneli")
    esitMi(p(42_000), ["42 sn"], "dakikanin alti")
    esitMi(p(42_999), ["42 sn"], "saniye asagi yuvarlanir")
    esitMi(p(-5_000), ["0 sn"], "negatif sifir")
    esitMi(p((9 * 60 + 5) * 1000, true), ["9 dk"], "sonuk: saniyesiz")
    esitMi(p(42_000, true), ["1 dk"], "sonuk: dakikanin alti 1 dk")
    esitMi(SaatSure.sesli(kalanMs: (9 * 60 + 5) * 1000), "9 dakika 5 saniye", "sesli")
    esitMi(SaatSure.sesli(kalanMs: (3600 + 60) * 1000), "1 saat 1 dakika", "sesli saat")
}

// MARK: - 15) Ingilizce arayuz dili (W5) — Turkce beklentiler yukarida, varsayilan dil "tr"

do {
    let d = SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: ikindi12 + dk, dil: "en")
    esitMi(d.satirlar.map { $0.ad }, ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"], "en gorunen adlar")
    esitMi(d.satirlar.map { $0.kod }, ["sabah", "ogle", "ikindi", "aksam", "yatsi"], "en kodlar dilden bagimsiz")
    esitMi(d.kildim, .aday(vakit: ani("ikindi", ikindi12), kayitVakti: "ikindi", ad: "Asr"), "en Kildim adayi")
    esitMi(SaatKarari.ekranDurumu(yuk: yuk, bekleyenler: [], simdiMs: imsak12 + dk, dil: "en").kildim, .zatenKilindi(ad: "Fajr"), "en sabah zaten kilinmis")
    esitMi(Kible.donusMetni(35, dil: "en"), "Right 35°", "en saga donus")
    esitMi(Kible.donusMetni(360 - 121, dil: "en"), "Left 120°", "en sola donus")
    esitMi(Kible.donusMetni(178, dil: "en"), "Behind you", "en arkada")
    esitMi(Kible.erisimMetni(36, hizali: false, dil: "en"), "The Qibla is 40 degrees to your right", "en erisim metni")
    esitMi(Kible.erisimMetni(300, hizali: false, dil: "en"), "The Qibla is 60 degrees to your left", "en erisim metni sol")
    esitMi(Kible.erisimMetni(0, hizali: true, dil: "en"), "You are facing the Qibla", "en hizali")
    esitMi(Kible.erisimMetni(300, hizali: false), "Kıble 60 derece solunuzda", "tr erisim metni sol")
    esitMi(Kible.mesafeMetni(2403.4, dil: "en"), "2,400 km", "en binlik ayraci virgul")
    esitMi(Kible.mesafeMetni(3, dil: "en"), "You're at the Kaaba", "en 10 km alti")
    func p(_ ms: Int64, _ s: Bool = false) -> [String] { SaatSure.parcalar(kalanMs: ms, saniyesiz: s, dil: "en").map { "\($0.sayi) \($0.birim)" } }
    esitMi(p((1 * 3600 + 9 * 60 + 9) * 1000), ["1 h", "9 min"], "en saat ve ustu")
    esitMi(p((9 * 60 + 5) * 1000), ["9 min", "05 s"], "en saatin alti")
    esitMi(p(42_000, true), ["1 min"], "en sonuk")
    esitMi(SaatSure.sesli(kalanMs: (9 * 60 + 5) * 1000, dil: "en"), "9 minutes 5 seconds", "en sesli")
    esitMi(SaatSure.sesli(kalanMs: (3600 + 60) * 1000, dil: "en"), "1 hour 1 minute", "en sesli tekil")
    esitMi(SaatSure.sesli(kalanMs: 42_000), "42 saniye", "tr sesli dakikanin alti")
    // Bosluksuz dil (zh; JS `sure.parcali` '{once}{sonra}'): sesli parcalar bitisik, diger diller tek bosluk.
    let zhSure = SaatSureMetinleri.zh
    esitMi([zhSure.birimAyirici, zhSure.parcaAyirici], ["", ""], "zh ayiraclar bos")
    esitMi(SaatSure.sesli(kalanMs: (3600 + 60) * 1000, dil: "zh"),
           CogulKurali.sec(zhSure.saat, "zh", 1) + CogulKurali.sec(zhSure.dakika, "zh", 1), "zh sesli bitisik")
    for (d, m) in SaatSureMetinleri.tablo where d != "zh" {
        esitMi([m.birimAyirici, m.parcaAyirici], [" ", " "], "\(d) ayiraclar tek bosluk")
    }
    esitMi(Samimiyet.kabulDuasi("en"), "May Allah accept it", "en kabul duasi")
    esitMi(Samimiyet.kabulDuasi, "Allah kabul etsin", "tr kabul duasi sabit")
    // Iki dilde ayni yer tutucular.
    func yerTutucular(_ m: SaatMetinleri) -> [String] {
        let alanlar = [m.kilindiErisim, m.cikisSaat, m.girisSaat, m.siradakiErisim, m.kildimErisim, m.sessizUyandirma,
                       m.noktaErisim, m.kuzeydenErisim, m.imsakSaat, m.vaktinSonu, m.vaktiCikisErisim, m.kilindiBaslik]
        return alanlar.map { a in ["{ad}", "{saat}", "{dua}", "{durum}", "{derece}"].filter { a.contains($0) }.joined() }
    }
    esitMi(yerTutucular(SaatMetinleri.en), yerTutucular(SaatMetinleri.tr), "saat en/tr yer tutuculari ayni")
    esitMi(SaatMetinleri.dil("en-US"), SaatMetinleri.en, "saat metinleri en-US → en")
    esitMi(SaatMetinleri.dil(nil), SaatMetinleri.tr, "saat metinleri dil yok → tr")
}

// MARK: - 15b) Native dil tablolari (W4) — on dokuz dil, Turkceyle ayni alan + yer tutucu

do {
    /// Her `String` alanin (ve `[String: String]` alaninin her anahtarinin) `{...}` kumesi.
    func imza(_ deger: Any) -> [String: String] {
        var sonuc: [String: String] = [:]
        func kume(_ s: String) -> String {
            var bulunan = Set<String>()
            var kalan = Substring(s)
            while let a = kalan.firstIndex(of: "{"), let k = kalan[a...].firstIndex(of: "}") {
                bulunan.insert(String(kalan[a...k]))
                kalan = kalan[kalan.index(after: k)...]
            }
            return bulunan.sorted().joined() + (s.isEmpty ? "<BOS>" : "")
        }
        for c in Mirror(reflecting: deger).children {
            // Bosluk ayiraclari metin degil: bosluksuz dilde (zh) bilerek bostur.
            guard let ad = c.label, ad != "dil", ad != "birimAyirici", ad != "parcaAyirici" else { continue }
            if let s = c.value as? String { sonuc[ad] = kume(s) }
            if let h = c.value as? [String: String] {
                // Cogul kaliplari dilin kategorileriyle degisebilir: "other" zorunlu, hepsi ayni yer tutucu.
                sonuc["\(ad).other"] = kume(h["other"] ?? "")
                sonuc["\(ad).*"] = Set(h.values.map(kume)).sorted().joined(separator: "|")
            }
        }
        return sonuc
    }
    let kodlar = ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi"]
    esitMi(Set(SaatMetinleri.tablo.keys), Set(kodlar), "saat tablolari: SaatMetinleri her dil")
    esitMi(Set(SaatSureMetinleri.tablo.keys), Set(kodlar), "saat tablolari: SaatSureMetinleri her dil")
    esitMi(Set(KibleMetinleri.tablo.keys), Set(kodlar), "saat tablolari: KibleMetinleri her dil")
    // Arapca cogul alti kategori (iskelet Ingilizce kaliplarla): tekil yalniz "one".
    esitMi([1, 3, 11].map { CogulKurali.sec(SaatSureMetinleri.ar.dakika, "ar", $0) }, ["1 دقيقة", "3 دقائق", "11 دقيقة"], "saat sure: ar cogul")
    esitMi(Set(SaatSureMetinleri.ar.saat.keys), ["zero", "one", "two", "few", "many", "other"], "saat sure: ar alti kategori")
    for d in kodlar {
        esitMi(SaatMetinleri.dil(d).dil, d, "saat metinleri: \(d) kendi kodu")
        esitMi(imza(SaatMetinleri.dil(d)), imza(SaatMetinleri.tr), "saat metinleri: \(d) yer tutuculari")
        esitMi(imza(SaatSureMetinleri.dil(d)), imza(SaatSureMetinleri.tr), "saat sure: \(d) yer tutuculari")
        esitMi(imza(KibleMetinleri.dil(d)), imza(KibleMetinleri.tr), "kible metinleri: \(d) yer tutuculari")
        esitMi(SaatSure.parcalar(kalanMs: 3_725_000, dil: d).count, 2, "saat sure: \(d) parca sayisi")
        esitMi(Samimiyet.kabulDuasi(d).isEmpty, false, "kabul duasi: \(d) bos degil")
    }
}

// MARK: - 16) Dil telefondan: baglamin kardes anahtari + saat deposu (W5)

do {
    esitMi(SaatIletisi.dil(SaatIletisi.baglam(yukJson: "{}", dil: "en")), "en", "baglam dili gidis-donus")
    esitMi(SaatIletisi.dil(SaatIletisi.baglam(yukJson: "{}")), nil, "eski telefon dil gondermez")
    esitMi(SaatIletisi.yukJson(SaatIletisi.baglam(yukJson: "{}", dil: "en")), "{}", "dil yuku degistirmez")
    esitMi(SaatIletisi.dil(["yuk": "{}", "dil": "xx"]), "tr", "desteklenmeyen dil Turkceye")
    esitMi(SaatIletisi.baglam(yukJson: "{}").count, 1, "dil yoksa baglamda tek anahtar (eski sekil)")
    let suite = "test.namazakisi.saat.dil.\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suite)!
    let depo = SaatDeposu(defaults: defaults)
    esitMi(depo.dil(), "tr", "dil yokken Turkce")
    esitMi(depo.diliYaz("en"), true, "ilk dil degisiklik")
    esitMi(depo.diliYaz("en-GB"), false, "ayni dil degisiklik degil")
    esitMi(depo.dil(), "en", "dil okunur")
    esitMi(depo.diliYaz("tr"), true, "geri donus degisiklik")
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
