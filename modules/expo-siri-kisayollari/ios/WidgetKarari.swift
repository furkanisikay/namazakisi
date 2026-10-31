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
 * ceviri tasimaz). `duvar` alani iOS'ta YOK SAYILIR (Codable bilinmeyen anahtari atlar).
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

    /// Serif tasarimda (New York; Android'de Noto Serif) OLMAYAN yazilar: Tamil, Malayalam, Tay,
    /// Hangil, Ge'ez, Han (CJK) ve CJK/tam genislik noktalama. Kotlin ikizi
    /// `GununAyetiKurallari.SERIFSIZ_ARALIKLAR` (ayni araliklar, ayni sira).
    public static let serifsizAraliklar: [ClosedRange<UInt32>] = [
        0x0B80...0x0BFF, 0x0D00...0x0D7F, 0x0E00...0x0E7F, 0x1100...0x11FF, 0x1200...0x139F,
        0x2D80...0x2DDF, 0x3000...0x303F, 0x3130...0x318F, 0x3400...0x4DBF, 0x4E00...0x9FFF,
        0xA960...0xA97F, 0xAB00...0xAB2F, 0xAC00...0xD7FF, 0xF900...0xFAFF, 0xFF00...0xFFEF,
    ]

    /// Meal serif yazi tipiyle mi cizilir? Ge'ez (Amharca), Tamil, Malayalam, Tay, Korece ve Cince
    /// yazilarinda serif tasarim yok → sistem tasarimi; aksi halde Latin noktalama serif, harfler
    /// sistem yedeginden karisik cizilirdi. Vietnamca (Latin + yigilmis ses isareti) serif kalir.
    /// Kotlin ikizi `GununAyetiKurallari.mealSerifMi`.
    public static func mealSerifMi(_ meal: String) -> Bool {
        return !meal.unicodeScalars.contains { s in serifsizAraliklar.contains { $0.contains(s.value) } }
    }

    /// Kunye satiri: "kisaKunye · mealKaynagi" (+ Arapca cizildiyse " · Arapça: Tanzil").
    /// Meal kaynagi gosterildigi her yuzeyde ZORUNLU (QuranEnc kosulu).
    public static func kunyeSatiri(_ kayit: GununAyetiKaydi, metin: GununAyetiMetinleri, arapcaVar: Bool) -> String {
        var parcalar = [kayit.kisaKunye]
        if let k = kayit.mealKaynagi, !k.isEmpty { parcalar.append(k) }
        if arapcaVar { parcalar.append(metin.arapcaKaynagi) }
        return parcalar.joined(separator: " · ")
    }
}
