// Apple TV panosu Swift cekirdeginin test kosucusu.
//
// Xcode GEREKMEZ (yalniz Foundation). macOS CI (ve Swift'li Linux) uzerinde:
//
//   swiftc -swift-version 5 -o /tmp/tv-test targets/tv/ortak/TvVakitHesabi.swift \
//     targets/tv/ortak/TvPano.swift targets/tv/test/main.swift
//   /tmp/tv-test tv/app/src/test/resources/vakit-fiksturu.json tv/app/src/main/assets/iller.json
//
// Fikstur telefonun adhan JS hesabidir (`scripts/tv/tv-verisi-uret.js`); Kotlin
// `VakitHesabiTest` ve jest `TvVakitParitesi.test.ts` ayni dosyayi kullanir. Vakitler
// epoch ms olarak BIREBIR esit olmalidir (tolerans yok).

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

struct FVakitler: Decodable {
    let imsak: Int64, gunes: Int64, ogle: Int64, ikindi: Int64, aksam: Int64, yatsi: Int64
}
struct FKerahat: Decodable { let tur: String; let baslangic: Int64; let bitis: Int64 }
struct FOrnek: Decodable {
    let plaka: String
    let il: String
    let lat: Double
    let lng: Double
    let tarih: String
    let vakitler: FVakitler
    let kerahat: [FKerahat]
}
struct FSabitler: Decodable { let surukDk: Int64; let istivaDk: Int64; let gurubDk: Int64 }
struct Fikstur: Decodable { let kerahat: FSabitler; let ornekler: [FOrnek] }

let arg = CommandLine.arguments
guard arg.count >= 2 else {
    print("Kullanim: tv-test <vakit-fiksturu.json> [iller.json]")
    exit(2)
}

func veri(_ yol: String) -> Data {
    guard let d = FileManager.default.contents(atPath: yol) else {
        print("Okunamadi: \(yol)")
        exit(2)
    }
    return d
}

let fikstur: Fikstur
do {
    fikstur = try JSONDecoder().decode(Fikstur.self, from: veri(arg[1]))
} catch {
    print("Fikstur cozulemedi: \(error)")
    exit(2)
}

func tarihCoz(_ s: String) -> TvTarih {
    let p = s.split(separator: "-").compactMap { Int($0) }
    return TvTarih(yil: p[0], ay: p[1], gun: p[2])
}

// MARK: - 1) Vakit paritesi (telefonun adhan JS'i ile epoch ms birebir)

esitMi(TvKerahat.surukDk, fikstur.kerahat.surukDk, "kerahat sabiti: suruk")
esitMi(TvKerahat.istivaDk, fikstur.kerahat.istivaDk, "kerahat sabiti: istiva")
esitMi(TvKerahat.gurubDk, fikstur.kerahat.gurubDk, "kerahat sabiti: gurub")

for o in fikstur.ornekler {
    let v = TvVakitHesabi.hesapla(lat: o.lat, lng: o.lng, tarih: tarihCoz(o.tarih))
    let b = o.vakitler
    let ad = "\(o.il) \(o.tarih)"
    esitMi(v.imsak, b.imsak, "\(ad) imsak")
    esitMi(v.gunes, b.gunes, "\(ad) gunes")
    esitMi(v.ogle, b.ogle, "\(ad) ogle")
    esitMi(v.ikindi, b.ikindi, "\(ad) ikindi")
    esitMi(v.aksam, b.aksam, "\(ad) aksam")
    esitMi(v.yatsi, b.yatsi, "\(ad) yatsi")
    let p = TvKerahat.pencereler(v)
    esitMi(p.map { $0.tur.rawValue }, o.kerahat.map { $0.tur }, "\(ad) kerahat turleri")
    esitMi(p.map { $0.baslangic }, o.kerahat.map { $0.baslangic }, "\(ad) kerahat baslangic")
    esitMi(p.map { $0.bitis }, o.kerahat.map { $0.bitis }, "\(ad) kerahat bitis")
}
esitMi(fikstur.ornekler.count >= 40, true, "fikstur yeterli ornek tasiyor")

// MARK: - 2) Takvim yardimcilari

esitMi(TvTarih(yil: 1970, ay: 1, gun: 1).gunSayisi, 0, "gunSayisi epoch")
esitMi(TvTarih.gunSayisindan(TvTarih(yil: 2028, ay: 2, gun: 29).gunSayisi), TvTarih(yil: 2028, ay: 2, gun: 29), "artik gun gidis-donus")
esitMi(TvTarih(yil: 2026, ay: 12, gun: 31).gunEkle(1), TvTarih(yil: 2027, ay: 1, gun: 1), "yil devri")
esitMi(TvTarih(yil: 2026, ay: 10, gun: 13).haftaGunu, 2, "13 Ekim 2026 Sali")
esitMi(TvTarih(yil: 2026, ay: 10, gun: 16).haftaGunu, 5, "16 Ekim 2026 Cuma")

// MARK: - 3) Pano durumu (Android PanoDurumuTest ikizi)

let ist = TimeZone(identifier: "Europe/Istanbul")!
let istanbul = (lat: 41.0082, lng: 28.9784)
func vakitler(_ t: TvTarih) -> TvGunlukVakitler { TvVakitHesabi.hesapla(lat: istanbul.lat, lng: istanbul.lng, tarih: t) }

let gun = TvTarih(yil: 2026, ay: 10, gun: 13)
let v13 = vakitler(gun)
// Ogleden 10 dk sonra: aktif ogle, siradaki ikindi.
let d1 = TvPanoHesabi.hesapla(simdiMs: v13.ogle + 600_000, bolge: ist, vakitler: vakitler)
esitMi(d1.aktif, .ogle, "pano: aktif ogle")
esitMi(d1.siradaki, .ikindi, "pano: siradaki ikindi")
esitMi(d1.tarih, gun, "pano: gun bugun")
esitMi(d1.kalanMs, v13.ikindi - v13.ogle - 600_000, "pano: kalan sure")
// Gece 01:00 (imsaktan once): gosterilen gun DUN, aktif yatsi, siradaki BUGUNUN imsaki.
let v14 = vakitler(gun.gunEkle(1))
let gece = v14.imsak - 3 * 3_600_000
let d2 = TvPanoHesabi.hesapla(simdiMs: gece, bolge: ist, vakitler: vakitler)
esitMi(d2.tarih, gun, "pano: gece yarisi sonrasi gun = dun")
esitMi(d2.aktif, .yatsi, "pano: gece aktif yatsi")
esitMi(d2.siradakiMs, v14.imsak, "pano: siradaki bugunun imsaki")
// Yatsidan sonra: siradaki YARININ imsaki.
let d3 = TvPanoHesabi.hesapla(simdiMs: v13.yatsi + 60_000, bolge: ist, vakitler: vakitler)
esitMi(d3.siradaki, .imsak, "pano: yatsi sonrasi siradaki imsak")
esitMi(d3.siradakiMs, v14.imsak, "pano: yatsi sonrasi yarinin imsaki")
// Cuma etiketi gosterilen gune gore.
let cuma = TvTarih(yil: 2026, ay: 10, gun: 16)
let d4 = TvPanoHesabi.hesapla(simdiMs: vakitler(cuma).ogle + 60_000, bolge: ist, vakitler: vakitler)
esitMi(d4.gorunenAd(.ogle), "Cuma", "pano: cuma ogle etiketi")
esitMi(d1.gorunenAd(.ogle), "Öğle", "pano: cuma olmayan gunde Öğle")
// Kerahat: gunes dogusunda aktif suruk, sinir dahil.
esitMi(TvPanoHesabi.hesapla(simdiMs: v13.gunes, bolge: ist, vakitler: vakitler).kerahat?.tur, .suruk, "kerahat: suruk baslangic dahil")
esitMi(TvPanoHesabi.hesapla(simdiMs: v13.gunes + 20 * 60_000, bolge: ist, vakitler: vakitler).kerahat?.tur, .suruk, "kerahat: suruk bitis dahil")
esitMi(TvPanoHesabi.hesapla(simdiMs: v13.gunes + 20 * 60_000 + 1, bolge: ist, vakitler: vakitler).kerahat == nil, true, "kerahat: bitisten sonra yok")

// MARK: - 4) Bicim

esitMi(TvBicim.saat(v13.ogle, ist), "12:55", "bicim: ogle saati (Istanbul 13 Ekim 2026)")
esitMi(TvBicim.tarih(gun), "13 Ekim 2026, Salı", "bicim: tarih")
esitMi(TvBicim.geriSayim(59_999), "00:59", "bicim: geri sayim asagi yuvarlanir")
esitMi(TvBicim.geriSayim(2 * 3_600_000 + 5 * 60_000 + 9_000), "2:05:09", "bicim: saatli geri sayim")
esitMi(TvBicim.geriSayim(-5), "00:00", "bicim: eksi sifira")
esitMi(TvKaydirma.ofset(0).0, 0, "kaydirma: ilk adim")
esitMi(TvKaydirma.ofset(60_000).0, 6, "kaydirma: ikinci dakika")

// MARK: - 4b) Ingilizce (W5, Android TV `TvDili` ile ayni) — varsayilan dil "tr" degismez

esitMi(TvBicim.tarih(gun, dil: "en"), "Tuesday, 13 October 2026", "en bicim: tarih")
esitMi(d4.gorunenAd(.ogle, dil: "en"), "Jumu'ah", "en pano: cuma ogle etiketi")
esitMi(d1.gorunenAd(.ogle, dil: "en"), "Dhuhr", "en pano: ogle")
esitMi(d1.gorunenAd(.imsak, dil: "en-US"), "Fajr", "en-US pano: imsak")
esitMi(d1.gorunenAd(.imsak), "İmsak", "tr pano: imsak (varsayilan)")
esitMi(TvKerahat.Tur.istiva.ad("en"), "Zenith", "en kerahat adi")
esitMi(TvKerahat.Tur.gurub.aciklama("en"), "Praying is makruh while the sun is setting.", "en kerahat aciklamasi")
esitMi(TvKerahat.Tur.suruk.ad("tr"), TvKerahat.Tur.suruk.ad, "tr kerahat adi")
esitMi(TvDili.coz("xx-XX"), "tr", "desteklenmeyen dil Turkce")
esitMi(TvDili.coz(nil), "tr", "dil yok Turkce")

// MARK: - 4c) Native dil tablolari (W4) — on dokuz dil, Turkce tablo eski sabitlerle ayni

esitMi(TvDili.desteklenenler, ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo"], "dil: tablo sirasi")
esitMi(TvDili.coz("ar-SA"), "ar", "dil: ar-SA → ar")
esitMi(TvDili.coz("de-DE"), "de", "dil: de-DE → de")
esitMi(TvDili.coz("in"), "id", "dil: eski Endonezce kodu in → id")
esitMi(Set(TvPanoMetinleri.tablo.keys), Set(TvDili.desteklenenler), "pano metinleri: her dilin tablosu var")
esitMi(TvVakit.allCases.map { TvPanoMetinleri.tr.vakitAdlari[$0.rawValue] ?? "" }, TvVakit.allCases.map { $0.ad }, "tr tablo: vakit adlari eski sabitler")
esitMi([TvKerahat.Tur.suruk, .istiva, .gurub].map { $0.ad("tr") }, [TvKerahat.Tur.suruk.ad, TvKerahat.Tur.istiva.ad, TvKerahat.Tur.gurub.ad], "tr tablo: kerahat adlari")
esitMi([TvKerahat.Tur.suruk, .istiva, .gurub].map { $0.aciklama("tr") }, [TvKerahat.Tur.suruk.aciklama, TvKerahat.Tur.istiva.aciklama, TvKerahat.Tur.gurub.aciklama], "tr tablo: kerahat aciklamalari")
for d in TvDili.desteklenenler {
    let m = TvPanoMetinleri.dil(d)
    esitMi(m.aylar.count, 12, "pano metinleri: \(d) on iki ay")
    esitMi(m.gunler.count, 7, "pano metinleri: \(d) yedi gun")
    esitMi(Set(m.vakitAdlari.keys), Set(TvVakit.allCases.map { $0.rawValue }), "pano metinleri: \(d) alti vakit")
    esitMi(Set(m.kerahatAdlari.keys), ["suruk", "istiva", "gurub"], "pano metinleri: \(d) kerahat adlari")
    esitMi(Set(m.kerahatAciklamalari.keys), ["suruk", "istiva", "gurub"], "pano metinleri: \(d) kerahat aciklamalari")
    let yerler = ["{gun}", "{ay}", "{yil}", "{gunAdi}"]
    esitMi(yerler.filter { m.tarih.contains($0) }, yerler, "pano metinleri: \(d) tarih yer tutuculari")
    let bos = ([m.cuma, m.tarih] + m.aylar + m.gunler + Array(m.vakitAdlari.values) + Array(m.kerahatAdlari.values)
        + Array(m.kerahatAciklamalari.values)).filter { $0.isEmpty }
    esitMi(bos, [], "pano metinleri: \(d) bos metin yok")
}

// MARK: - 5) Il listesi (istege bagli ikinci arguman)

if arg.count >= 3 {
    let iller = TvIlListesi.coz(veri(arg[2]))
    esitMi(iller.count, 81, "iller.json 81 il")
    esitMi(TvIlListesi.bul(iller, "34")?.ad, "İstanbul", "il bul: 34")
    esitMi(TvIlListesi.bul(iller, nil) == nil, true, "il bul: nil")
}

if hatalar.isEmpty {
    print("TV cekirdegi: \(gecen) kontrol gecti.")
    exit(0)
} else {
    print("TV cekirdegi: \(hatalar.count) hata (\(gecen) gecti):")
    for h in hatalar.prefix(40) { print("  ✗ \(h)") }
    exit(1)
}
