import Foundation

/**
 * iOS WIDGET GORUNUM KARARI (issue #295) — SAF (yalniz Foundation).
 *
 * `src/core/widget/iosWidgetKarari.ts`'in Swift IKIZIDIR. Ortak fikstur:
 * `modules/expo-siri-kisayollari/test/widget-ios-ornek.json` (JS + `test/main.swift`).
 * Bu dosya pod'da derlenir VE widget uzantisina kopyalanir
 * (`plugins/withNamazWidget.js`); uzanti pod'a baglanmaz, bu yuzden UIKit/SwiftUI/
 * WidgetKit IMPORT ETMEZ.
 *
 * Kural ya da fikstur degisirse TS + Swift + fikstur BIRLIKTE degisir.
 */

public struct WidgetGorunumu: Equatable {
    /// Icinde bulunulan KILINABILIR vakit; gunes→ogle arasi / veri yok / tukenmisse nil.
    public let aktif: SiriVakitAni?
    /// Aktif vaktin cikisi (bir sonraki girisin ani).
    public let bitisMs: Int64?
    /// Kayit ∪ kuyrukta bekleyen "Kildim".
    public let kilindi: Bool
    /// Siradaki kilinabilir vakit (gunes atlanir).
    public let sonraki: SiriVakitAni?
    /// Gosterilen NAMAZ gunu (orta boy widget'in bes vakti).
    public let gunTarihi: String?
}

/// Widget / canli etkinlik "Kildim" dugmesine dokunus aninin karari (issue #295).
public enum WidgetDugmeKarari: Equatable {
    /// Dugmenin tasidigi vakit HALA kilinacak aday → kuyruga yaz, etkinligi kapat.
    case isaretle
    /// O vakit zaten kayitli ya da kuyrukta → yazma, etkinligi kapat (gorev bitmis).
    case zatenKilindi
    /// Vakit cikti / cizim bayat / veri yok → YAZMA ve etkinligi KAPATMA (yalniz tazele).
    case gecersiz
}

/// Kontrol Merkezi "Kildim" kontrolunun gorunumu (iOS 18 ControlWidget; Android hizli ayar
/// kutusu `KildimKutusuServisi` ikizi). `tarih`/`vakit` KAYIT kodudur; aday yoksa bostur
/// (dokunus `dugmeKarari`'nda `gecersiz` olur, hicbir sey yazilmaz).
public struct WidgetKontrolDurumu: Equatable, Sendable {
    public enum Tur: Equatable, Sendable { case kilinabilir, kilindi, vakitYok }
    public let tur: Tur
    public let baslik: String
    public let tarih: String
    public let vakit: String
}

public enum WidgetKarari {
    /// Kontrol Merkezi kontrolunun o anki durumu. Karar Siri "Kildim" ile AYNI
    /// (`VakitKarari.kildimKarari`); dokunusta `dugmeKarari` yeniden degerlendirir.
    /// `dil`: arayuz dili (`ArayuzDili.coz`); baslik CIZIM aninda bu dilde kurulur.
    public static func kontrolDurumu(
        vakitler: [SiriVakitAni]?,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64,
        dil: String = ArayuzDili.varsayilan
    ) -> WidgetKontrolDurumu {
        let m = VakitMetinleri.dil(dil)
        guard let vakitler, !vakitler.isEmpty else {
            return WidgetKontrolDurumu(tur: .vakitYok, baslik: m.uygulamayiAcin, tarih: "", vakit: "")
        }
        switch VakitKarari.kildimKarari(
            vakitler: vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyenler, simdiMs: simdiMs, dil: dil
        ) {
        case let .aday(v, kayit, ad):
            return WidgetKontrolDurumu(
                tur: .kilinabilir, baslik: VakitMetinleri.bicim(m.kontrolKildim, ["ad": ad]), tarih: v.tarih, vakit: kayit
            )
        case let .zatenKilindi(ad):
            return WidgetKontrolDurumu(tur: .kilindi, baslik: VakitMetinleri.bicim(m.kontrolKilindi, ["ad": ad]), tarih: "", vakit: "")
        case .vakitYok:
            return WidgetKontrolDurumu(tur: .vakitYok, baslik: m.kontrolVakitYok, tarih: "", vakit: "")
        }
    }

    /// Bir zaman cizelgesinde en fazla bu kadar sinir girdisi (~2 gun).
    public static let azamiSinir = 12

    /// Kilinmislik: kaydedilmis (widget kodu) ∪ kuyrukta bekleyen (KAYIT kodu).
    public static func kilindiMi(
        _ vakit: SiriVakitAni,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim]
    ) -> Bool {
        return VakitKarari.kilindiMi(vakit, kilinanlar: kilinanlar, bekleyenler: bekleyenler)
    }

    public static func gorunum(
        vakitler: [SiriVakitAni],
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64
    ) -> WidgetGorunumu {
        let durum = VakitKarari.aktifVakitBul(vakitler, simdiMs: simdiMs)
        let sonGecen = vakitler.filter { $0.ms <= simdiMs }.max { $0.ms < $1.ms }
        let gun = durum.aktif?.tarih ?? sonGecen?.tarih ?? durum.sonraki?.tarih
        let kilindi = durum.aktif.map { kilindiMi($0, kilinanlar: kilinanlar, bekleyenler: bekleyenler) } ?? false
        return WidgetGorunumu(
            aktif: durum.aktif,
            bitisMs: durum.bitisMs,
            kilindi: kilindi,
            sonraki: durum.sonraki,
            gunTarihi: gun
        )
    }

    /// Simdiden SONRAKI vakit girisleri (gunes dahil), sirali ve tekil — zaman cizelgesi girdileri.
    /// Dakikalik girdi YOK: geri sayimi sistem cizer (`Text(timerInterval:)`).
    public static func sinirlar(_ vakitler: [SiriVakitAni], simdiMs: Int64, azami: Int = azamiSinir) -> [Int64] {
        let anlar = Set(vakitler.map { $0.ms }.filter { $0 > simdiMs }).sorted()
        return Array(anlar.prefix(max(0, azami)))
    }

    /// Bir namaz gununun bes kilinabilir vakti, sirali.
    public static func gunVakitleri(_ vakitler: [SiriVakitAni], tarih: String) -> [SiriVakitAni] {
        return vakitler
            .filter { $0.tarih == tarih && VakitKarari.kilinabilir.contains($0.vakit) }
            .sorted { $0.ms < $1.ms }
    }

    /// Dokunus aninda karar YENIDEN degerlendirilir (Android `dokunusGecerliMi` ikizi):
    /// zaman cizelgesi bayat bir vakti cizmis olabilir. `vakit` KAYIT kodudur (`imsak`).
    /// "Gecersiz"de etkinlik KAPATILMAZ: kullanici "bastim, kapandi ama isaretlenmedi"
    /// yasamasin; dogru durumu bir sonraki esitleme (one gelis) kurar.
    public static func dugmeKarari(
        tarih: String,
        vakit: String,
        vakitler: [SiriVakitAni]?,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64
    ) -> WidgetDugmeKarari {
        let kayitta = (kilinanlar[tarih] ?? []).contains { VakitKarari.kayitVakti($0) == vakit }
        let kuyrukta = bekleyenler.contains { $0.tarih == tarih && $0.vakit == vakit }
        if kayitta || kuyrukta { return .zatenKilindi }
        guard let vakitler else { return .gecersiz }
        let karar = VakitKarari.kildimKarari(
            vakitler: vakitler, kilinanlar: kilinanlar, bekleyenler: bekleyenler, simdiMs: simdiMs
        )
        if case let .aday(aday, kayitVakti, _) = karar, aday.tarih == tarih, kayitVakti == vakit {
            return .isaretle
        }
        return .gecersiz
    }
}

// MARK: - Gunun ayeti (#380 iOS ikizi) — yuk v1 ve "su anki kayit" karari

/**
 * GUNUN AYETI YUKU (v1) — sozlesme `docs/ajan/gunun-ayeti.md`. JS (`GununAyetiServisi`)
 * 14 gunluk plani App Group'a yazar (`SiriDeposu.gununAyetiYaz`); native ayet SECMEZ ve
 * namaz vakti HESAPLAMAZ: `baslangicMs <= simdi` olan SON kaydi cizer, plan biterse son
 * kaydi gostermeye devam eder. Metinler JS'te etkin dilde cozulmus gelir (native ek
 * ceviri tasimaz). Bu tip `duvar`, `sahneler` ve plan `vakitler`'ini OKUMAZ (widget ve saat
 * kullanmaz; Codable bilinmeyen anahtari atlar): duvar kagidi bunlari ayri ve hosgorulu
 * cozer (`GununAyetiKarari.duvarEki`, asagida) — bozuk duvar alani widget'i bosaltmaz.
 *
 * Bu bolum bilincli olarak `WidgetKarari.swift` icindedir: dosya zaten pod'da derlenir,
 * widget uzantisina kopyalanir ve CI Swift testinin derleme listesindedir (yeni bir dosya
 * hepsine ayrica eklenmek zorunda kalirdi).
 */
public struct GununAyetiMetinleri: Codable, Equatable, Sendable {
    /// Ust etiket ("GÜNÜN AYETİ").
    public let etiket: String
    /// Sigmayan boyutta gosterilen "dokunun" metni.
    public let sigmiyor: String
    public let acin: String
    /// Arapca cizildiginde kaynak ("Arapça: Tanzil").
    public let arapcaKaynagi: String
}

public struct GununAyetiKaydi: Codable, Equatable, Sendable {
    /// Namaz gunu (`YYYY-MM-DD`).
    public let gun: String
    /// Kaydin gecerli oldugu an (o namaz gununun imsaki), epoch ms.
    public let baslangicMs: Int64
    public let ref: String
    /// Tanzil Uthmani, birebir.
    public let ar: String
    /// Etkin dildeki meal; meali olmayan dilde nil (yalniz Arapca cizilir).
    public let meal: String?
    /// "İnşirâh 94:6" / "Quran 94:6".
    public let kisaKunye: String
    /// "Rowwad Translation Center, QuranEnc 1.0.4"; meal yoksa nil.
    public let mealKaynagi: String?

    public init(gun: String, baslangicMs: Int64, ref: String, ar: String, meal: String?, kisaKunye: String, mealKaynagi: String?) {
        self.gun = gun
        self.baslangicMs = baslangicMs
        self.ref = ref
        self.ar = ar
        self.meal = meal
        self.kisaKunye = kisaKunye
        self.mealKaynagi = mealKaynagi
    }
}

public struct GununAyetiYuku: Codable, Equatable, Sendable {
    public let v: Int
    public let dil: String
    public let metin: GununAyetiMetinleri
    public let plan: [GununAyetiKaydi]
}

/// Zaman cizelgesi girdisi: `ms` aninda `kayit` gosterilir.
public struct GununAyetiGirdisi: Equatable, Sendable {
    public let ms: Int64
    public let kayit: GununAyetiKaydi
}

public enum GununAyetiKarari {
    /// Widget turu (`kind`). Kopru YALNIZ bu turu tazeler (`reloadTimelines(ofKind:)`).
    public static let widgetTuru = "GununAyetiWidget"
    /// Desteklenen yuk surumu; baska surum okunmaz (bos durum cizilir).
    public static let surum = 1

    /// Ham JSON → yuk. Bozuk / baska surum / bos plan → nil.
    public static func coz(_ ham: String?) -> GununAyetiYuku? {
        guard let ham, let veri = ham.data(using: .utf8),
              let yuk = try? JSONDecoder().decode(GununAyetiYuku.self, from: veri),
              yuk.v == surum, !yuk.plan.isEmpty else { return nil }
        return yuk
    }

    /// Baslangica gore sirali (JS sirali yazar; savunma). Esit baslangicta yazim sirasi korunur.
    static func sirali(_ plan: [GununAyetiKaydi]) -> [GununAyetiKaydi] {
        return plan.enumerated()
            .sorted {
                $0.element.baslangicMs != $1.element.baslangicMs
                    ? $0.element.baslangicMs < $1.element.baslangicMs
                    : $0.offset < $1.offset
            }
            .map { $0.element }
    }

    /// Simdi gosterilecek kayit: `baslangicMs <= simdi` olan SON kayit. Plan bittiyse bu
    /// zaten son kayittir (bayat ama bos ekrandan iyi); hicbiri baslamadiysa (cihaz saati
    /// geri, plan erken yazildi) ILK kayit. Bos plan → nil.
    public static func gecerliKayit(_ plan: [GununAyetiKaydi], simdiMs: Int64) -> GununAyetiKaydi? {
        let liste = sirali(plan)
        return liste.last(where: { $0.baslangicMs <= simdiMs }) ?? liste.first
    }

    /// Zaman cizelgesi: simdiki kayit `simdiMs` aninda + baslangici gelecekte olan her kayit
    /// kendi `baslangicMs`'inde. Plan bittiyse tek girdi (son kayit).
    public static func girdiler(_ plan: [GununAyetiKaydi], simdiMs: Int64) -> [GununAyetiGirdisi] {
        guard let simdiki = gecerliKayit(plan, simdiMs: simdiMs) else { return [] }
        let gelecek = sirali(plan).filter { $0.baslangicMs > simdiMs && $0.baslangicMs > simdiki.baslangicMs }
        return [GununAyetiGirdisi(ms: simdiMs, kayit: simdiki)]
            + gelecek.map { GununAyetiGirdisi(ms: $0.baslangicMs, kayit: $0) }
    }

    /// Serif tasarimda (New York; Android'de Noto Serif) OLMAYAN yazilar: Ibrani, N'Ko, Gurcu, Devanagari, Bengal, Gucarati, Tamil,
    /// Telugu, Kannada, Malayalam, Sinhala, Tay, Khmer, Hangil, Ge'ez, Han (CJK), kana (Hiragana, Katakana) ve
    /// CJK/tam genislik noktalama. Kotlin ikizi
    /// `GununAyetiKurallari.SERIFSIZ_ARALIKLAR` (ayni araliklar, ayni sira).
    public static let serifsizAraliklar: [ClosedRange<UInt32>] = [
        0x0590...0x05FF, 0x07C0...0x07FF, 0x0900...0x097F, 0x0980...0x09FF, 0x0A80...0x0AFF, 0x0B80...0x0BFF,
        0x0C00...0x0C7F, 0x0C80...0x0CFF, 0x0D00...0x0D7F, 0x0D80...0x0DFF, 0x0E00...0x0E7F, 0x10A0...0x10FF,
        0x1100...0x11FF, 0x1200...0x139F, 0x1780...0x17FF, 0x1C90...0x1CBF, 0x2D00...0x2D2F, 0x2D80...0x2DDF,
        0x3000...0x303F, 0x3040...0x30FF, 0x3130...0x318F, 0x31F0...0x31FF, 0x3400...0x4DBF, 0x4E00...0x9FFF,
        0xA960...0xA97F, 0xAB00...0xAB2F, 0xAC00...0xD7FF, 0xF900...0xFAFF, 0xFB1D...0xFB4F, 0xFF00...0xFFEF,
    ]

    /// Meal serif yazi tipiyle mi cizilir? Ibrani, N'Ko, Gurcu, Ge'ez (Amharca), Devanagari, Bengal, Gucarati, Tamil, Telugu, Kannada, Malayalam,
    /// Sinhala, Tay, Khmer, Korece, Cince ve Japonca (kanji, kana)
    /// yazilarinda serif tasarim yok → sistem tasarimi; aksi halde Latin noktalama serif, harfler
    /// sistem yedeginden karisik cizilirdi. Vietnamca (Latin + yigilmis ses isareti) serif kalir.
    /// Kotlin ikizi `GununAyetiKurallari.mealSerifMi`.
    public static func mealSerifMi(_ meal: String) -> Bool {
        return !meal.unicodeScalars.contains { s in serifsizAraliklar.contains { $0.contains(s.value) } }
    }

    /// Arapcasiz govde: meal; meali olmayan dilde (ar ve mealsiz diller ku, tk, tt, sd, pl) kisa kunye.
    /// Kisayollar gorseli kisisellestirmeden (taslak 2) beri bunu KULLANMAZ: meali olmayan dilde
    /// Arapca cizer (`duvardaArapca`).
    public static func gorselGovdesi(_ kayit: GununAyetiKaydi) -> String {
        kayit.meal ?? kayit.kisaKunye
    }

    /// Widget ve erisim etiketinin govdesi: meal; meali olmayan dilde Arapca metin.
    public static func widgetGovdesi(_ kayit: GununAyetiKaydi) -> String {
        kayit.meal ?? kayit.ar
    }

    /// Kunye satiri: "kisaKunye · mealKaynagi" (+ Arapca cizildiyse " · Arapça: Tanzil").
    /// Meal kaynagi gosterildigi her yuzeyde ZORUNLU (QuranEnc kosulu).
    public static func kunyeSatiri(_ kayit: GununAyetiKaydi, metin: GununAyetiMetinleri, arapcaVar: Bool) -> String {
        var parcalar = [kayit.kisaKunye]
        if let k = kayit.mealKaynagi, !k.isEmpty { parcalar.append(k) }
        if arapcaVar { parcalar.append(metin.arapcaKaynagi) }
        return parcalar.joined(separator: " · ")
    }

    /// Duvar kagidinda Arapca cizilir mi? Ayar acik ya da meal yok (Kotlin `duvardaArapca` ikizi).
    public static func duvardaArapca(_ kayit: GununAyetiKaydi, ayar: DuvarAyari) -> Bool {
        ayar.arapca || kayit.meal == nil
    }

    /// Duvar kagidinin ATIF satiri (kunyenin altinda, her gorselde): meal kaynagi + Arapca
    /// gorunuyorsa (ya da meal yoksa) Arapca kaynagi. Kotlin `atifSatiri` ikizi.
    public static func atifSatiri(_ kayit: GununAyetiKaydi, metin: GununAyetiMetinleri, arapcaGorunuyor: Bool) -> String {
        var parcalar: [String] = []
        if kayit.meal != nil, let k = kayit.mealKaynagi, !k.isEmpty { parcalar.append(k) }
        if arapcaGorunuyor || kayit.meal == nil, !metin.arapcaKaynagi.trimmingCharacters(in: .whitespaces).isEmpty {
            parcalar.append(metin.arapcaKaynagi)
        }
        return parcalar.joined(separator: " · ")
    }

    /// Yukun duvar kagidi eki: `duvar` ayari (JS `duvarAyariNormalize` ile AYNI varsayilanlar),
    /// vakit gokleri ve plan kayitlarinin vakitleri. Hicbir zaman nil degil: yuk yok ya da bozuksa
    /// varsayilan ayar + bos gokler (cizici gece zeminine duser).
    public static func duvarEki(_ ham: String?) -> GununAyetiDuvarEki {
        guard let ham, let veri = ham.data(using: .utf8),
              let e = try? JSONDecoder().decode(DuvarEkiHam.self, from: veri) else {
            return GununAyetiDuvarEki(duvar: DuvarAyari.normalize(nil), sahneler: [:], vakitler: [:])
        }
        var vakitler: [String: [Int64]] = [:]
        for kayit in e.plan ?? [] {
            guard let gun = kayit["gun"]?.metin, let dizi = kayit["vakitler"]?.dizi, dizi.count == 5 else { continue }
            let ms = dizi.compactMap { $0.sayi }.filter { abs($0) < 9e15 }.map { Int64($0) }
            if ms.count == 5 { vakitler[gun] = ms }
        }
        return GununAyetiDuvarEki(duvar: DuvarAyari.normalize(e.duvar), sahneler: e.sahneler ?? [:], vakitler: vakitler)
    }
}

// MARK: - Gunun ayeti duvar kagidi kisisellestirme (taslak 2) — `src/core/icerik/duvarTasarimi.ts` ikizi

/*
 * DUVAR KAGIDI TASARIM SOZLESMESI (SAF, yalniz Foundation): JS `src/core/icerik/duvarTasarimi.ts`
 * + `gununAyetiYuku.duvarAyariNormalize` ve Kotlin `cekirdek/GununAyeti.kt` ikizi. Eslik ornegi
 * `android/app/src/test/resources/duvar-tasarim-ornek.json` (Swift testi `test/main.swift` §14).
 * Kural ya da ornek degisirse JS + Kotlin + Swift BIRLIKTE degisir. Bu dosya widget ve saat
 * hedeflerine de kopyalanir: CoreGraphics/UIKit YOK, yalniz Double. Cizici
 * `targets/siri-kisayollari/GununAyetiGorseliIntent.swift`.
 */

/// Hosgorulu JSON degeri: JS'in `typeof` denetimlerini birebir taklit etmek icin. JSON `true`
/// SAYI DEGILDIR (`JSONSerialization` Darwin'de onu NSNumber yapar ve `as? Double`'dan gecirirdi;
/// `JSONDecoder` Bool ile sayiyi ayirir).
public enum DuvarJson: Decodable, Equatable, Sendable {
    case mantik(Bool)
    case sayi(Double)
    case metin(String)
    case dizi([DuvarJson])
    case nesne([String: DuvarJson])
    case bos

    public init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() {
            self = .bos
        } else if let b = try? c.decode(Bool.self) {
            self = .mantik(b)
        } else if let d = try? c.decode(Double.self) {
            self = .sayi(d)
        } else if let s = try? c.decode(String.self) {
            self = .metin(s)
        } else if let a = try? c.decode([DuvarJson].self) {
            self = .dizi(a)
        } else if let o = try? c.decode([String: DuvarJson].self) {
            self = .nesne(o)
        } else {
            self = .bos
        }
    }

    public subscript(_ anahtar: String) -> DuvarJson? {
        if case let .nesne(o) = self { return o[anahtar] }
        return nil
    }

    /// Sonlu sayi (JS `typeof v === 'number' && Number.isFinite(v)`).
    public var sayi: Double? {
        if case let .sayi(d) = self, d.isFinite { return d }
        return nil
    }

    public var metin: String? {
        if case let .metin(s) = self { return s }
        return nil
    }

    public var mantik: Bool? {
        if case let .mantik(b) = self { return b }
        return nil
    }

    public var dizi: [DuvarJson]? {
        if case let .dizi(a) = self { return a }
        return nil
    }
}

/// JS `sinirla`: sonlu sayi → [alt, ust]; degilse varsayilan.
private func duvarSinirla(_ v: DuvarJson?, _ alt: Double, _ ust: Double, _ varsayilan: Double) -> Double {
    guard let d = v?.sayi else { return varsayilan }
    return min(ust, max(alt, d))
}

private func duvarSecim(_ v: DuvarJson?, _ secenekler: [String], _ varsayilan: String) -> String {
    guard let s = v?.metin, secenekler.contains(s) else { return varsayilan }
    return s
}

public struct DuvarYaziAyari: Equatable, Sendable {
    /// Yazi blogunun DIKEY MERKEZI (ekran kesri); nil = ekranin varsayilani. Kilit ve ana ayri.
    public var kilitY: Double?
    public var anaY: Double?
    /// Yazi boyutu carpani (0,7–1,6).
    public var olcek: Double
    /// `bas` | `orta` | `son`.
    public var hiza: String
    /// `klasik` | `zarif` | `sade`.
    public var tip: String

    public init(kilitY: Double?, anaY: Double?, olcek: Double, hiza: String, tip: String) {
        self.kilitY = kilitY
        self.anaY = anaY
        self.olcek = olcek
        self.hiza = hiza
        self.tip = tip
    }

    public static let varsayilan = DuvarYaziAyari(kilitY: nil, anaY: nil, olcek: 1, hiza: "orta", tip: "klasik")

    /// JS `yaziAyariNormalize` ikizi.
    public static func normalize(_ ham: DuvarJson?) -> DuvarYaziAyari {
        let yKes: (DuvarJson?) -> Double? = { v in v?.sayi.map { min(1, max(0, $0)) } }
        return DuvarYaziAyari(
            kilitY: yKes(ham?["kilitY"]),
            anaY: yKes(ham?["anaY"]),
            olcek: duvarSinirla(ham?["olcek"], 0.7, 1.6, varsayilan.olcek),
            hiza: duvarSecim(ham?["hiza"], ["bas", "orta", "son"], varsayilan.hiza),
            tip: duvarSecim(ham?["tip"], ["klasik", "zarif", "sade"], varsayilan.tip)
        )
    }
}

public struct DuvarSusAyari: Equatable, Sendable {
    /// `yildiz` | `mihrap` | `girih` | `yok`.
    public var tur: String
    /// 0–1.
    public var belirginlik: Double

    public init(tur: String, belirginlik: Double) {
        self.tur = tur
        self.belirginlik = belirginlik
    }

    public static let varsayilan = DuvarSusAyari(tur: "yildiz", belirginlik: 0.5)

    /// JS `susAyariNormalize` ikizi.
    public static func normalize(_ ham: DuvarJson?) -> DuvarSusAyari {
        DuvarSusAyari(
            tur: duvarSecim(ham?["tur"], ["yildiz", "mihrap", "girih", "yok"], varsayilan.tur),
            belirginlik: duvarSinirla(ham?["belirginlik"], 0, 1, varsayilan.belirginlik)
        )
    }
}

public struct DuvarFotoAyari: Equatable, Sendable {
    /// Uygulamanin kendi kopyasinin adi (`duvar-foto-<ozet>.jpg`); nil = secilmedi.
    public var dosya: String?
    /// Siyah ortu 0–0,85.
    public var karartma: Double
    /// 0–1 (cizicide yaricap: kisa kenarin %0–%4'u).
    public var bulaniklik: Double
    /// Kirpma merkezi (gorsel kesri) ve yakinlik (1–4).
    public var x: Double
    public var y: Double
    public var yakinlik: Double
    /// Acikken yazi rengi ve yazi arkasi perde fotografa gore secilir (`okunurlukKarari`).
    public var okunurluk: Bool

    public init(dosya: String?, karartma: Double, bulaniklik: Double, x: Double, y: Double, yakinlik: Double, okunurluk: Bool) {
        self.dosya = dosya
        self.karartma = karartma
        self.bulaniklik = bulaniklik
        self.x = x
        self.y = y
        self.yakinlik = yakinlik
        self.okunurluk = okunurluk
    }

    public static let varsayilan = DuvarFotoAyari(dosya: nil, karartma: 0.4, bulaniklik: 0.15, x: 0.5, y: 0.5, yakinlik: 1, okunurluk: true)

    /// JS `fotoAyariNormalize` ikizi.
    public static func normalize(_ ham: DuvarJson?) -> DuvarFotoAyari {
        let ad = ham?["dosya"]?.metin
        return DuvarFotoAyari(
            dosya: ad.flatMap { DuvarAyari.fotoAdiGecerliMi($0) ? $0 : nil },
            karartma: duvarSinirla(ham?["karartma"], 0, 0.85, varsayilan.karartma),
            bulaniklik: duvarSinirla(ham?["bulaniklik"], 0, 1, varsayilan.bulaniklik),
            x: duvarSinirla(ham?["x"], 0, 1, varsayilan.x),
            y: duvarSinirla(ham?["y"], 0, 1, varsayilan.y),
            yakinlik: duvarSinirla(ham?["yakinlik"], 1, 4, varsayilan.yakinlik),
            okunurluk: ham?["okunurluk"]?.mantik != false
        )
    }
}

/// Duvar kagidi ayari (yuk `duvar`). JS `DuvarKagidiAyari` ikizi.
public struct DuvarAyari: Equatable, Sendable {
    public var acik: Bool
    /// `kilit` | `ana` | `ikisi`.
    public var yer: String
    /// `gece` | `kagit` | `palet` | gok (`imsak`…`yatsi`) | `foto`.
    public var zemin: String
    public var arapca: Bool
    public var paletRenk: String
    public var vakteUysun: Bool
    public var yazi: DuvarYaziAyari
    public var sus: DuvarSusAyari
    public var foto: DuvarFotoAyari

    public init(
        acik: Bool, yer: String, zemin: String, arapca: Bool, paletRenk: String, vakteUysun: Bool,
        yazi: DuvarYaziAyari, sus: DuvarSusAyari, foto: DuvarFotoAyari
    ) {
        self.acik = acik
        self.yer = yer
        self.zemin = zemin
        self.arapca = arapca
        self.paletRenk = paletRenk
        self.vakteUysun = vakteUysun
        self.yazi = yazi
        self.sus = sus
        self.foto = foto
    }

    public static let varsayilanZemin = "imsak"
    public static let varsayilanPalet = "#2E7D32"

    /// JS `duvarAyariNormalize` ikizi: bozuk ya da eksik kayit varsayilanla tamamlanir; eski (v1
    /// alanli) kayit zeminini korur.
    public static func normalize(_ ham: DuvarJson?) -> DuvarAyari {
        let palet = ham?["paletRenk"]?.metin
        return DuvarAyari(
            acik: ham?["acik"]?.mantik == true,
            yer: duvarSecim(ham?["yer"], ["kilit", "ana", "ikisi"], "kilit"),
            zemin: duvarSecim(ham?["zemin"], DuvarTasarimi.zeminler, varsayilanZemin),
            arapca: ham?["arapca"]?.mantik == true,
            paletRenk: palet.flatMap { DuvarTasarimi.rgb($0) != nil ? $0 : nil } ?? varsayilanPalet,
            vakteUysun: ham?["vakteUysun"]?.mantik != false,
            yazi: DuvarYaziAyari.normalize(ham?["yazi"]),
            sus: DuvarSusAyari.normalize(ham?["sus"]),
            foto: DuvarFotoAyari.normalize(ham?["foto"])
        )
    }

    /// `^duvar-foto-[0-9a-z]{4,40}\.(jpg|png)$` (JS `fotoAyariNormalize`): yol tasinmaz, yalniz ad.
    public static func fotoAdiGecerliMi(_ ad: String) -> Bool {
        let u = Array(ad.unicodeScalars)
        let onEk = Array("duvar-foto-".unicodeScalars)
        guard u.count >= onEk.count + 4 + 4, Array(u.prefix(onEk.count)) == onEk else { return false }
        let son = Array(u.suffix(4))
        guard son == Array(".jpg".unicodeScalars) || son == Array(".png".unicodeScalars) else { return false }
        let govde = u[onEk.count ..< (u.count - 4)]
        guard (4 ... 40).contains(govde.count) else { return false }
        return govde.allSatisfy { (0x30 ... 0x39).contains($0.value) || (0x61 ... 0x7A).contains($0.value) }
    }
}

// MARK: Gok sahneleri (VERI; JS `GOK_SAHNELERI` yukte `sahneler` olarak gelir)

public struct DuvarRenkDuragi: Decodable, Equatable, Sendable {
    public let konum: Double
    public let renk: String
}

/// Gok cismi. `hilal`: (x,y,r) dairesinden (x+kesX, y+kesY, kesR) dairesi CIKARILIR (kesX/kesR
/// genislik, kesY yukseklik kesri). `konumlar` sirali adaylar (`cisimKonumuSec`).
public struct DuvarGokCismi: Decodable, Equatable, Sendable {
    public let tur: String
    public let konumlar: [[Double]]
    public let r: Double
    public let renk: String
    public let opaklik: Double
    public let kesX: Double?
    public let kesY: Double?
    public let kesR: Double?
    public let isimaR: Double?
    public let isimaRenk: String?
    public let isimaOpaklik: Double?
}

public struct DuvarYildizi: Decodable, Equatable, Sendable {
    public let x: Double
    public let y: Double
    public let r: Double
    public let opaklik: Double
}

/// Cismin merkezinden (x, y) ucuna uzanan isik huzmesi.
public struct DuvarHuzmesi: Decodable, Equatable, Sendable {
    public let x: Double
    public let y: Double
    public let kalinlik: Double
    public let renk: String
    public let opaklik: Double
}

public struct DuvarCokgeni: Decodable, Equatable, Sendable {
    public let noktalar: [[Double]]
    public let renk: String
    public let opaklik: Double
}

public struct DuvarGokSahnesi: Decodable, Equatable, Sendable {
    public let gradyan: [DuvarRenkDuragi]
    public let yildizlar: [DuvarYildizi]
    public let cisim: DuvarGokCismi?
    public let huzmeler: [DuvarHuzmesi]
    /// Ufuk/zemin cokgenleri (en son, cisimden SONRA cizilir).
    public let ufuk: [DuvarCokgeni]
    /// Yazi rengi. Kunye ve atif ayni rengin %72 ve %55 opakligi.
    public let metin: String
}

/// Yukun duvar kagidi eki (`GununAyetiKarari.duvarEki`).
public struct GununAyetiDuvarEki: Equatable, Sendable {
    public let duvar: DuvarAyari
    /// Gok adi (`imsak`…`yatsi`) → sahne; yok/bozuksa bos (cizici gece zeminine duser).
    public let sahneler: [String: DuvarGokSahnesi]
    /// Namaz gunu (`YYYY-MM-DD`) → [imsak, gunes, ikindi, aksam, yatsi] ms (konum yoksa yok).
    public let vakitler: [String: [Int64]]

    public init(duvar: DuvarAyari, sahneler: [String: DuvarGokSahnesi], vakitler: [String: [Int64]]) {
        self.duvar = duvar
        self.sahneler = sahneler
        self.vakitler = vakitler
    }
}

/// Her alan ayri ve hosgorulu cozulur: bozuk `sahneler` ayari, bozuk `duvar` gokleri dusurmez.
struct DuvarEkiHam: Decodable {
    let duvar: DuvarJson?
    let sahneler: [String: DuvarGokSahnesi]?
    let plan: [DuvarJson]?

    enum Anahtar: String, CodingKey { case duvar, sahneler, plan }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Anahtar.self)
        duvar = try? c.decodeIfPresent(DuvarJson.self, forKey: .duvar)
        sahneler = try? c.decodeIfPresent([String: DuvarGokSahnesi].self, forKey: .sahneler)
        plan = try? c.decodeIfPresent([DuvarJson].self, forKey: .plan)
    }
}

// MARK: Kurallar

public struct DuvarBandi: Equatable, Sendable, CustomStringConvertible {
    public let ust: Double
    public let alt: Double
    public init(ust: Double, alt: Double) {
        self.ust = ust
        self.alt = alt
    }
    public var description: String { "[\(ust), \(alt)]" }
}

public struct DuvarYerlesimi: Equatable, Sendable {
    /// Blogun ust kenari (ekran kesri).
    public let ust: Double
    public let bant: DuvarBandi
}

public struct DuvarOkunurluk: Equatable, Sendable {
    public let metin: String
    public let perde: String
    public let perdeOpakligi: Double
}

/// gece/kagit/palet zemininin renkleri (RGB, 0xRRGGBB). Kotlin `DuvarRenkleri` ikizi.
public struct DuvarZeminRenkleri: Equatable, Sendable {
    public let zemin: UInt32
    public let metin: UInt32
    public let kunye: UInt32
    public let atif: UInt32
    public let sus: UInt32
    public let susOpakligi: Double
}

public struct DuvarDikdortgen: Equatable, Sendable {
    public let x: Double
    public let y: Double
    public let genislik: Double
    public let yukseklik: Double
}

public enum DuvarHizasi: Equatable, Sendable { case sol, orta, sag }

public enum DuvarYazitipi: Equatable, Sendable {
    /// Sistem serif tasarimi (New York).
    case serif
    case sistem
    /// Amiri (OFL; "Zarif").
    case amiri
}

public enum DuvarTasarimi {
    public static let goklar = ["imsak", "kusluk", "ikindi", "aksam", "yatsi"]
    public static let zeminler = ["gece", "kagit", "palet"] + goklar + ["foto"]

    // --- Gok secimi ---------------------------------------------------------------------

    /// O anin gogu: imsak ≤ t < gunes → imsak; gunes ≤ t < ikindi → kusluk; ikindi ≤ t < aksam →
    /// ikindi; aksam ≤ t < yatsi → aksam; yatsidan sonra ve imsaktan once → yatsi. `v` = 5 an.
    public static func vaktinGogu(_ simdiMs: Int64, _ v: [Int64]) -> String {
        guard v.count >= 5 else { return "yatsi" }
        if simdiMs >= v[0] && simdiMs < v[1] { return "imsak" }
        if simdiMs >= v[1] && simdiMs < v[2] { return "kusluk" }
        if simdiMs >= v[2] && simdiMs < v[3] { return "ikindi" }
        if simdiMs >= v[3] && simdiMs < v[4] { return "aksam" }
        return "yatsi"
    }

    /// `simdiMs`'den sonraki ilk gok siniri (yoksa nil).
    public static func sonrakiGokSiniri(_ simdiMs: Int64, _ v: [Int64]) -> Int64? {
        v.first { $0 > simdiMs }
    }

    /// Cizilecek gok ya da nil (zemin gok degil). Vakte uyan gok, kaydin vakitleri yoksa (konum
    /// yok) secilen gokte kalir.
    public static func cizilecekGok(zemin: String, vakteUysun: Bool, simdiMs: Int64, vakitler: [Int64]?) -> String? {
        guard goklar.contains(zemin) else { return nil }
        if vakteUysun, let v = vakitler, v.count == 5 { return vaktinGogu(simdiMs, v) }
        return zemin
    }

    // --- Guvenli alan ve yerlesim -------------------------------------------------------

    /// Yazinin girebilecegi dikey bantlar (ekran kesri), yukaridan asagi. JS `IZINLI_BANTLAR`.
    public static let izinliBantlar: [String: [String: [DuvarBandi]]] = [
        "android": [
            "kilit": [DuvarBandi(ust: 0.08, alt: 0.26), DuvarBandi(ust: 0.64, alt: 0.84)],
            "ana": [DuvarBandi(ust: 0.07, alt: 0.88)],
        ],
        "ios": [
            "kilit": [DuvarBandi(ust: 0.34, alt: 0.85)],
            "ana": [DuvarBandi(ust: 0.07, alt: 0.86)],
        ],
    ]

    /// Ekranin varsayilan yazi merkezi. JS `VARSAYILAN_MERKEZ`.
    public static let varsayilanMerkez: [String: [String: Double]] = [
        "android": ["kilit": 0.73, "ana": 0.215],
        "ios": ["kilit": 0.58, "ana": 0.25],
    ]

    /// Ayarin `yer`'inden cizilecek ekran: `ana` → ana, digerleri (`kilit`, `ikisi`) → kilit.
    public static func ekran(_ yer: String) -> String { yer == "ana" ? "ana" : "kilit" }

    /// Kullanicinin tasidigi merkez ya da ekranin varsayilani.
    public static func yaziMerkezi(_ yazi: DuvarYaziAyari, ekran: String, platform: String = "ios") -> Double {
        let secilen = ekran == "ana" ? yazi.anaY : yazi.kilitY
        return secilen ?? varsayilanMerkez[platform]?[ekran] ?? 0.5
    }

    /// Istenen merkeze EN YAKIN, blogun SIGDIGI bant ici yerlesim; esitlikte USTTEKI bant (kesin
    /// `<`). Hicbir banda sigmiyorsa nil (cizici yaziyi kucultup yeniden dener). JS `yaziYerlesimi`.
    public static func yaziYerlesimi(_ istenenMerkez: Double, _ blok: Double, _ bantlar: [DuvarBandi]) -> DuvarYerlesimi? {
        var enIyi: DuvarYerlesimi?
        var enIyiFark = 0.0
        for b in bantlar {
            if b.alt - b.ust < blok { continue }
            let ust = min(b.alt - blok, max(b.ust, istenenMerkez - blok / 2))
            let fark = abs(ust + blok / 2 - istenenMerkez)
            if enIyi == nil || fark < enIyiFark {
                enIyi = DuvarYerlesimi(ust: ust, bant: b)
                enIyiFark = fark
            }
        }
        return enIyi
    }

    /// Sigmayan yazinin kucultme adimlari (Kotlin `DuvarKagidiCizici.sigdir`: ×1'den %6 adimla,
    /// carpan 0,6'nin ustundeyken bir adim daha → son adim ~0,58).
    public static func kucultmeAdimlari() -> [Double] {
        var adimlar = [1.0]
        var carpan = 1.0
        while carpan > 0.6 {
            carpan -= 0.06
            adimlar.append(carpan)
        }
        return adimlar
    }

    /// Yazi kutusunun cisimle kesisme denetiminde kenar payi (genislik kesri).
    public static let cisimPayi = 0.04

    /// Gok cisminin adaylarindan yazi kutusuna (x1,y1,x2,y2 kesir; nil = yazi yok) degmeyen ilki;
    /// hepsi degiyorsa nil (cisim ve isimasi cizilmez). `oran` = yukseklik/genislik. JS ikizi.
    public static func cisimKonumuSec(_ cisim: DuvarGokCismi, kutu: [Double]?, oran: Double) -> [Double]? {
        for k in cisim.konumlar where k.count >= 2 {
            guard let kutu, kutu.count >= 4 else { return k }
            let cx = k[0]
            let cy = k[1] * oran
            let r = cisim.r + cisimPayi
            let yakX = min(kutu[2], max(kutu[0], cx))
            let yakY = min(kutu[3] * oran, max(kutu[1] * oran, cy))
            if (cx - yakX) * (cx - yakX) + (cy - yakY) * (cy - yakY) > r * r { return k }
        }
        return nil
    }

    // --- Renk ve okunurluk --------------------------------------------------------------

    /// `#RRGGBB` → 0xRRGGBB; baska bicim nil (JS `/^#[0-9A-Fa-f]{6}$/`).
    public static func rgb(_ renk: String) -> UInt32? {
        let u = Array(renk.unicodeScalars)
        guard u.count == 7, u[0] == "#" else { return nil }
        let onaltilik = u.dropFirst().allSatisfy {
            (0x30 ... 0x39).contains($0.value) || (0x41 ... 0x46).contains($0.value) || (0x61 ... 0x66).contains($0.value)
        }
        return onaltilik ? UInt32(String(renk.dropFirst()), radix: 16) : nil
    }

    /// sRGB kanal (0–1) → dogrusal (WCAG).
    private static func dogrusal(_ s: Double) -> Double {
        s <= 0.03928 ? s / 12.92 : pow((s + 0.055) / 1.055, 2.4)
    }

    /// sRGB bagil parlaklik (WCAG), kanallar 0–1.
    public static func bagilParlaklik(r: Double, g: Double, b: Double) -> Double {
        0.2126 * dogrusal(r) + 0.7152 * dogrusal(g) + 0.0722 * dogrusal(b)
    }

    public static func bagilParlaklik(rgb n: UInt32) -> Double {
        bagilParlaklik(r: Double((n >> 16) & 255) / 255, g: Double((n >> 8) & 255) / 255, b: Double(n & 255) / 255)
    }

    /// JS `bagilParlaklik(renk)`.
    public static func bagilParlaklik(_ renk: String) -> Double {
        bagilParlaklik(rgb: rgb(renk) ?? 0)
    }

    private static func kontrast(_ a: Double, _ b: Double) -> Double {
        (max(a, b) + 0.05) / (min(a, b) + 0.05)
    }

    public static let acikMetin = "#FFFFFF"
    public static let koyuMetin = "#1F2A22"

    /// Fotograf zemininde yazi kutusunun ORTALAMA bagil parlakligina gore yazi rengi ve perde
    /// (hedef 4,5:1; 0,05 adim, en cok 0,6). JS `okunurlukKarari` ikizi.
    public static func okunurlukKarari(_ ortalamaParlaklik: Double) -> DuvarOkunurluk {
        let L = min(1, max(0, ortalamaParlaklik))
        let acikla = kontrast(1, L)
        let koyuL = bagilParlaklik(koyuMetin)
        let koyuyla = kontrast(koyuL, L)
        let acik = acikla >= koyuyla
        let metinL = acik ? 1.0 : koyuL
        let perdeL = acik ? 0.0 : 1.0
        var opaklik = 0.0
        while opaklik < 0.6 - 1e-9 {
            let zemin = L * (1 - opaklik) + perdeL * opaklik
            if kontrast(metinL, zemin) >= 4.5 { break }
            // JS `Math.round(x)` = floor(x + 0,5).
            opaklik = ((opaklik + 0.05) * 100 + 0.5).rounded(.down) / 100
        }
        return DuvarOkunurluk(metin: acik ? acikMetin : koyuMetin, perde: acik ? "#000000" : "#FFFFFF", perdeOpakligi: opaklik)
    }

    /// Yazi kutusunun altindaki fotograf piksellerinin (RGBA, 8 bit, opak, sRGB) ortalama bagil
    /// parlakligi; siyah ortu (`karartma`) her kanala uygulanarak. Bos → 0.
    public static func ortalamaParlaklik(rgba: [UInt8], karartma: Double) -> Double {
        let kalan = 1 - min(1, max(0, karartma))
        var toplam = 0.0
        var sayi = 0
        var i = 0
        while i + 3 < rgba.count {
            toplam += bagilParlaklik(
                r: Double(rgba[i]) / 255 * kalan, g: Double(rgba[i + 1]) / 255 * kalan, b: Double(rgba[i + 2]) / 255 * kalan
            )
            sayi += 1
            i += 4
        }
        return sayi == 0 ? 0 : toplam / Double(sayi)
    }

    // --- gece / kagit / palet (Kotlin `DuvarKagidiKurallari` ikizi) ------------------------

    private static let acikZeminMetni: UInt32 = 0xF1F8E9
    private static let koyuZeminMetni: UInt32 = 0x1F2A22

    /// a → b dogrusal karisim, JS `duvarCizimi.karistir` ile BIREBIR: round(a·(1−t) + b·t)
    /// (`Math.round` = floor(x + 0,5); eslik ornegi `cizim.renkler`).
    public static func karistir(_ a: UInt32, _ b: UInt32, _ oran: Double) -> UInt32 {
        func kanal(_ kaydir: UInt32) -> UInt32 {
            let x = Double((a >> kaydir) & 0xFF)
            let y = Double((b >> kaydir) & 0xFF)
            return UInt32(min(255, max(0, (x * (1 - oran) + y * oran + 0.5).rounded(.down))))
        }
        return (kanal(16) << 16) | (kanal(8) << 8) | kanal(0)
    }

    public static func kontrastOrani(_ a: UInt32, _ b: UInt32) -> Double {
        kontrast(bagilParlaklik(rgb: a), bagilParlaklik(rgb: b))
    }

    /// Orta tonlu palet: zemin acik ya da koyu metinle 4,5:1'i tutana kadar %10 adimla koyulasir.
    public static func okunurPaletZemini(_ palet: UInt32) -> UInt32 {
        var zemin = palet & 0xFFFFFF
        for _ in 0 ..< 10 {
            let enIyi = max(kontrastOrani(acikZeminMetni, zemin), kontrastOrani(koyuZeminMetni, zemin))
            if enIyi >= 4.5 { return zemin }
            zemin = karistir(zemin, 0x000000, 0.1)
        }
        return zemin
    }

    public static func acikMetinSecilsinMi(_ zemin: UInt32) -> Bool {
        kontrastOrani(acikZeminMetni, zemin) >= kontrastOrani(koyuZeminMetni, zemin)
    }

    /// Metni zemine dogru en cok %35 karistirir; 4,5:1 altina dusmeden durur (adim JS gibi yuvarlanir).
    public static func ikincilTon(_ metin: UInt32, _ zemin: UInt32) -> UInt32 {
        var oran = 0.35
        while oran > 0 {
            let aday = karistir(metin, zemin, oran)
            if kontrastOrani(aday, zemin) >= 4.5 { return aday }
            oran = (((oran - 0.05) * 100) + 0.5).rounded(.down) / 100
        }
        return metin
    }

    /// Duz zeminlerin renkleri; gok/foto icin cagrilmaz (gece doner).
    public static func zeminRenkleri(_ zemin: String, paletRenk: String) -> DuvarZeminRenkleri {
        switch zemin {
        case "kagit":
            return DuvarZeminRenkleri(zemin: 0xF3F1EA, metin: 0x1F2A22, kunye: 0x2E7D32, atif: 0x4E5B52, sus: 0x1B5E20, susOpakligi: 0.07)
        case "palet":
            let zeminRengi = okunurPaletZemini(rgb(paletRenk) ?? 0x2E7D32)
            let acik = acikMetinSecilsinMi(zeminRengi)
            let metin = acik ? acikZeminMetni : koyuZeminMetni
            let ikincil = ikincilTon(metin, zeminRengi)
            return DuvarZeminRenkleri(
                zemin: zeminRengi, metin: metin, kunye: ikincil, atif: ikincil, sus: acik ? 0xFFFFFF : 0x000000, susOpakligi: 0.09
            )
        default:
            return DuvarZeminRenkleri(zemin: 0x14211A, metin: 0xF1F8E9, kunye: 0xA5D6A7, atif: 0x81C784, sus: 0xFFFFFF, susOpakligi: 0.08)
        }
    }

    // --- Yazi ---------------------------------------------------------------------------

    /// Ilk guclu yon karakteri sagdan sola mi? (Ibrani, Arap, Suryani, Tana, N'Ko ve sunum bicimleri.)
    public static func sagdanSolaMi(_ metin: String) -> Bool {
        for s in metin.unicodeScalars {
            let v = s.value
            if (0x0590 ... 0x08FF).contains(v) || (0xFB1D ... 0xFDFF).contains(v) || (0xFE70 ... 0xFEFF).contains(v)
                || (0x10800 ... 0x10FFF).contains(v) {
                return true
            }
            if s.properties.isAlphabetic { return false }
        }
        return false
    }

    /// `bas`/`son` yazinin YONUNE gore: sagdan sola metinde bas = sag.
    public static func hiza(_ ayar: String, sagdanSola: Bool) -> DuvarHizasi {
        switch ayar {
        case "bas": return sagdanSola ? .sag : .sol
        case "son": return sagdanSola ? .sol : .sag
        default: return .orta
        }
    }

    /// Amiri'nin (Zarif) kapsadigi yazi: Temel Latin, Latin-1, Latin Genisletilmis-A, genel
    /// noktalama ve Arap bloklari (fontTools cmap, Amiri 1.002). Disi → klasik kural.
    static let amiriAraliklari: [ClosedRange<UInt32>] = [
        0x0000 ... 0x017F, 0x0600 ... 0x06FF, 0x0750 ... 0x077F, 0x2000 ... 0x206F, 0xFB50 ... 0xFDFF, 0xFE70 ... 0xFEFF,
    ]

    public static func amiriKapsarMi(_ metin: String) -> Bool {
        metin.unicodeScalars.allSatisfy { s in amiriAraliklari.contains { $0.contains(s.value) } }
    }

    /// Mealin yazi tipi: sade → sistem; zarif → Amiri (kapsamadigi yazida klasik kurala duser);
    /// klasik → serif (yazi serif tasarimda yoksa sistem, `mealSerifMi`).
    public static func mealYazitipi(_ tip: String, meal: String) -> DuvarYazitipi {
        if tip == "sade" { return .sistem }
        if tip == "zarif" && amiriKapsarMi(meal) { return .amiri }
        return GununAyetiKarari.mealSerifMi(meal) ? .serif : .sistem
    }

    // --- Fotograf -------------------------------------------------------------------------

    /// En-boy dolduran kirpma (gorsel pikseli, sol ust koken): olcek = max(G/g, Y/y) × yakinlik,
    /// merkez (x·g, y·y), gorselin icinde kalacak sekilde kaydirilir.
    public static func fotoKirpmasi(
        gorselG: Double, gorselY: Double, hedefG: Double, hedefY: Double, x: Double, y: Double, yakinlik: Double
    ) -> DuvarDikdortgen {
        guard gorselG > 0, gorselY > 0, hedefG > 0, hedefY > 0 else {
            return DuvarDikdortgen(x: 0, y: 0, genislik: max(0, gorselG), yukseklik: max(0, gorselY))
        }
        let olcek = max(hedefG / gorselG, hedefY / gorselY) * max(1, yakinlik)
        let g = min(gorselG, hedefG / olcek)
        let h = min(gorselY, hedefY / olcek)
        let sol = min(gorselG - g, max(0, x * gorselG - g / 2))
        let ust = min(gorselY - h, max(0, y * gorselY - h / 2))
        return DuvarDikdortgen(x: sol, y: ust, genislik: g, yukseklik: h)
    }

    /// Bulaniklik yaricapi (piksel): kisa kenarin bulaniklik × %4'u.
    public static func bulaniklikYaricapi(_ bulaniklik: Double, genislik: Double, yukseklik: Double) -> Double {
        min(1, max(0, bulaniklik)) * 0.04 * min(genislik, yukseklik)
    }
}

/// Mihrap kemeri (genislik kesri): bacaklar `yanPay`'dan ekranin altina iner, yarim daire merkezi
/// yazi kutusu ustunun `merkezAlti` altinda.
public struct DuvarKemeri: Equatable, Sendable {
    public let yanPay: Double
    public let r: Double
    public let merkezAlti: Double
    public let kalinlik: Double
    public let opaklik: Double
}

/// Duvar kagidi CIZIM SAYILARI — tek kaynak JS `src/core/icerik/duvarCizimi.ts` (uygulamadaki
/// duzenleyicinin onizlemesi = sahip onayli taslak 2; Kotlin ikizi `DuvarCizim`). Burada YENIDEN
/// TASARLANMAZ: her sayi ornek dosyanin `cizim` bolumuyle birebir denetlenir (test §14). Birimler:
/// sus/perde genislik kesri (tuval 330), yazi 412 tasarim pikseli (× ekran genisligi / 412).
public enum DuvarCizim {
    public static let tasarimGenisligi = 412.0
    static let tuval = 330.0

    // --- Yazi (412 tasarim px; satir yuksekligi ve harf araligi yazi boyunun kati) ---------
    public static let meal = 24.0
    public static let mealArapcali = 17.0
    public static let arapca = 28.0
    public static let kunye = 12.0
    public static let atif = 10.0
    public static let yanBosluk = 30.0
    public static let kucukYildiz = 22.0
    public static let arapcaSatir = 1.75
    public static let mealSatir = 1.4
    public static let kunyeHarfAraligi = 0.04
    public static let mealUstArapcali = 6.0
    public static let mealUstYildizli = 10.0
    public static let kunyeUstArapcali = 14.0
    public static let kunyeUst = 18.0
    public static let atifUst = 6.0
    public static let atifEnAzOlcek = 0.9

    // --- Sus --------------------------------------------------------------------------------
    public static let mihrapYaziYanPayi = 84.0 / tuval
    public static let mihrapDis = DuvarKemeri(yanPay: 58.0 / tuval, r: 107.0 / tuval, merkezAlti: 54.0 / tuval, kalinlik: 2.2 / tuval, opaklik: 0.28)
    public static let mihrapIc = DuvarKemeri(yanPay: 74.0 / tuval, r: 91.0 / tuval, merkezAlti: 58.0 / tuval, kalinlik: 1.3 / tuval, opaklik: 0.14)
    /// Kemer tepesindeki DOLU bes koseli yildiz: merkez kutu ustunun `mihrapYildizUst` yukarisinda.
    public static let mihrapYildizUst = 36.0 / tuval
    public static let mihrapYildizDisR = 14.0 / tuval
    public static let mihrapYildizIcR = 6.5 / tuval
    public static let mihrapYildizOpaklik = 0.3

    /// Girih: ekranin sol ustunden dosenen karo; karo icinde 48 birimlik dort koseli yildiz + daire.
    public static let girihKaro = 48.0 / tuval
    public static let girihYol = "M24 0l6 18 18 6-18 6-6 18-6-18-18-6 18-6z"
    public static let girihDaireR = 5.0
    public static let girihYildizKalinlik = 0.9
    public static let girihDaireKalinlik = 0.7
    public static let girihOpaklik = 0.06

    /// Buyuk silik yildiz: 24 birimlik cerceve (iki kare + daire), birim = genislik × `yildizBirim`.
    public static let yildizBirim = 420.0 / tasarimGenisligi / 24
    public static let yildizYariKenar = 7.0
    public static let yildizKosegen = 9.9
    public static let yildizDaireR = 4.2
    public static let yildizKalinlik = 0.12
    public static let yildizOpaklik = 0.08
    public static let kucukYildizKalinlik = 1.6

    /// Gok ve fotograf zemininde kunye ve atif: yazi renginin %72 ve %55'i.
    public static let kunyeOpakligi = 0.72
    public static let atifOpakligi = 0.55

    /// Fotograf okunurluk perdesi: yazi kutusunun her yanindan tasma ve kose yaricapi; kesin kenarli.
    public static let perdePay = 12.0 / tuval
    public static let perdeYaricap = 18.0 / tuval

    /// Sus opaklik carpani: belirginlik 0,5'te 1, 0'da gorunmez, 1'de iki kat.
    public static func susCarpani(_ belirginlik: Double) -> Double { max(0, belirginlik) / 0.5 }

    /// Yazi blogunun yan payi (genislik kesri): mihrapta kemerin icine daralir.
    public static func yaziYanPayi(_ susTuru: String) -> Double {
        susTuru == "mihrap" ? mihrapYaziYanPayi : yanBosluk / tasarimGenisligi
    }

    /// Buyuk yildizin merkezi (ekran kesri): kagit sol, palet sag; gece, gok ve fotograf sag alt.
    public static func yildizKonumu(_ zemin: String) -> [Double] {
        switch zemin {
        case "kagit": return [0.097, 0.64]
        case "palet": return [0.903, 0.693]
        default: return [0.855, 0.878]
        }
    }

    /// Bes koseli yildizin 10 kosesi ([x, y]; dis/ic sirayla, ilk kose tepede). JS `besKoseliYildiz`.
    public static func besKoseliYildiz(cx: Double, cy: Double, dis: Double, ic: Double) -> [[Double]] {
        (0 ..< 10).map { i -> [Double] in
            let r = i % 2 == 0 ? dis : ic
            let a = -Double.pi / 2 + Double(i) * Double.pi / 5
            return [cx + r * cos(a), cy + r * sin(a)]
        }
    }

    /// `girihYol`'un koseleri (karo birimi, [x, y]): ilk cift mutlak (`M`), sonrakiler goreli (`l`).
    public static func girihNoktalari() -> [[Double]] {
        var sayilar: [Double] = []
        var parca = ""
        for c in girihYol {
            if c == "-" || !(c.isNumber || c == ".") {
                if let d = Double(parca) { sayilar.append(d) }
                parca = c == "-" ? "-" : ""
            } else {
                parca.append(c)
            }
        }
        if let d = Double(parca) { sayilar.append(d) }
        var noktalar: [[Double]] = []
        var x = 0.0
        var y = 0.0
        for i in 0 ..< sayilar.count / 2 {
            x = i == 0 ? sayilar[0] : x + sayilar[2 * i]
            y = i == 0 ? sayilar[1] : y + sayilar[2 * i + 1]
            noktalar.append([x, y])
        }
        return noktalar
    }
}
