import AppIntents
import CoreImage
import CoreText
import Foundation
import UIKit
import UniformTypeIdentifiers
internal import ExpoSiriKisayollari

// "GUNUN AYETI GORSELI" — duvar kagidi icin App Intent (#381 iOS ikizi, kisisellestirme taslak 2).
//
// iOS'ta uygulama duvar kagidini DEGISTIREMEZ (genel API yok). Bu eylem bugunun ayetini
// cihaz ekran boyutunda PNG olarak dondurur; kullanici Kisayollar'da "Duvar Kâğıdını
// Ayarla" adimina baglar ve imsaktan sonraki bir saate "Günün Saati" otomasyonu kurar
// (rehber uygulamadaki "Günün ayeti" ayarinda). Veri JS'in App Group'a yazdigi plandir
// (`SiriDeposu.gununAyeti`); kayit secimi widget'la AYNI saf karardan
// (`GununAyetiKarari.gecerliKayit`). Uygulama acilmaz.
//
// GORUNUM uygulamadaki duzenleyicinin onizlemesidir (sahip onayli taslak 2); butun cizim sayilari
// `DuvarCizim`'dedir (WidgetKarari.swift; JS `duvarCizimi.ts` ikizi, test §14 eslik ornegiyle denetler),
// burada sayi YAZILMAZ. Android cizicisiyle (`duvar/DuvarKagidiCizici`) AYNI sozlesme (`src/core/icerik/duvarTasarimi.ts`):
// zemin (gece/kagit/palet, yukle gelen vakit gokleri, kullanicinin fotografi), yazi yerlesimi
// (`DuvarTasarimi.yaziYerlesimi`, iPhone bantlari), gok cismi yeri, okunurluk, sus (yildiz/mihrap/
// girih). Kurallar SAF Swift'tedir (`WidgetKarari.swift` > `DuvarTasarimi`, Linux testi §14);
// burasi yalniz cizer. Yazi TEK motorla olculur VE cizilir (NSAttributedString/TextKit): yerlesim
// karari olcume dayanir, SwiftUI `ImageRenderer` ile olcum ve cizim ayri motorlarda kalirdi.
// Kunye + meal kaynagi (atif) satiri ZORUNLU. Arapca `duvar.arapca` acikken ya da meal yokken
// Amiri Quran ile cizilir (`GununAyetiKarari.duvardaArapca`). Metinler: kunye/atif yukte etkin
// dilde; hata metinleri cihaz dilinde (`.lproj`).
@available(iOS 16.0, *)
struct GununAyetiGorseliIntent: AppIntent {
    static let title: LocalizedStringResource = "Günün ayeti görseli"
    static let description = IntentDescription(
        "Bugünün ayetini ekranınızın boyutunda bir görsel olarak verir. Kısayollar'da Duvar Kâğıdını Ayarla adımıyla kullanabilirsiniz."
    )
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ReturnsValue<IntentFile> {
        let ham = SiriDeposu.varsayilan.gununAyetiJson()
        let simdi = SiriDeposu.simdiMs()
        guard let yuk = GununAyetiKarari.coz(ham),
              let kayit = GununAyetiKarari.gecerliKayit(yuk.plan, simdiMs: simdi) else {
            throw GununAyetiGorseliHatasi.veriYok
        }
        let metin = yuk.metin
        let ek = GununAyetiKarari.duvarEki(ham)
        let png = await MainActor.run { GununAyetiGorseli.png(kayit: kayit, metin: metin, ek: ek, simdiMs: simdi) }
        guard let png else { throw GununAyetiGorseliHatasi.cizilemedi }
        return .result(value: IntentFile(data: png, filename: "gunun-ayeti-\(kayit.gun).png", type: .png))
    }
}

@available(iOS 16.0, *)
enum GununAyetiGorseliHatasi: Error, CustomLocalizedStringResourceConvertible {
    /// JS henuz plan yazmadi (uygulama hic acilmadi ya da eski surum).
    case veriYok
    case cizilemedi

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .veriYok: return "Günün ayetini hazırlamak için uygulamayı bir kez açın."
        case .cizilemedi: return "Görsel hazırlanamadı. Biraz sonra yeniden deneyin."
        }
    }
}

@available(iOS 16.0, *)
enum GununAyetiGorseli {
    /// Ekranin dikey piksel boyutunda PNG (`UIScreen` ana aktorde okunur).
    @MainActor
    static func png(kayit: GununAyetiKaydi, metin: GununAyetiMetinleri, ek: GununAyetiDuvarEki, simdiMs: Int64) -> Data? {
        let ekran = etkinEkran()
        // `nativeBounds` yonelimden bagimsiz DIKEY piksel; nokta = piksel / nativeScale.
        let olcek = max(ekran.nativeScale, 1)
        let boyut = CGSize(width: ekran.nativeBounds.width / olcek, height: ekran.nativeBounds.height / olcek)
        guard boyut.width > 0, boyut.height > 0 else { return nil }
        DuvarYazitipleri.kaydet()
        return DuvarCizici(kayit: kayit, metin: metin, ek: ek, simdiMs: simdiMs, boyut: boyut, olcek: olcek).png()
    }

    /// Bagli sahnenin ekrani; arka planda (sahne yok) ana ekran.
    @MainActor
    private static func etkinEkran() -> UIScreen {
        let sahne = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        return sahne?.screen ?? UIScreen.main
    }
}

/// Paketlenen yazi tipleri (`plugins/withSiriKisayollari.js` > `FONT_KAYNAKLARI`, `UIAppFonts`).
@available(iOS 16.0, *)
enum DuvarYazitipleri {
    static let arapcaAdi = "AmiriQuran-Regular"
    static let zarifAdi = "Amiri-Regular"

    /// `UIAppFonts` kaydetmediyse (eksik Info.plist) paketteki dosyayi surec icin kaydeder; zaten
    /// kayitliysa dokunmaz.
    static func kaydet() {
        for ad in [arapcaAdi, zarifAdi] where UIFont(name: ad, size: 12) == nil {
            if let url = Bundle.main.url(forResource: ad, withExtension: "ttf") {
                _ = CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
    }

    /// Arapca: Amiri Quran; yoksa sistem (iOS'un Arapca yedegi) — Arapca HIC dusmez.
    static func arapca(_ boyut: CGFloat) -> UIFont {
        UIFont(name: arapcaAdi, size: boyut) ?? UIFont.systemFont(ofSize: boyut)
    }

    static func meal(_ tur: DuvarYazitipi, _ boyut: CGFloat) -> UIFont {
        switch tur {
        case .amiri: return UIFont(name: zarifAdi, size: boyut) ?? serif(boyut)
        case .serif: return serif(boyut)
        case .sistem: return UIFont.systemFont(ofSize: boyut)
        }
    }

    static func serif(_ boyut: CGFloat) -> UIFont {
        let taban = UIFont.systemFont(ofSize: boyut)
        guard let tanim = taban.fontDescriptor.withDesign(.serif) else { return taban }
        return UIFont(descriptor: tanim, size: boyut)
    }
}

/// Fotograf zemini: kirpma + yakinlik + bulaniklik (CoreImage) ve yazi kutusu parlakligi.
@available(iOS 16.0, *)
enum DuvarFotoZemini {
    private static let srgb = CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB()

    /// Ekran piksel boyutunda islenmis gorsel (karartma HARIC); dosya yok/okunamaz → nil (gece).
    static func hazirla(dosya: String, ayar: DuvarFotoAyari, piksel: CGSize) -> CGImage? {
        guard let url = DuvarFotografi.url(dosya), FileManager.default.fileExists(atPath: url.path),
              let kaynak = CIImage(contentsOf: url) else { return nil }
        let e = kaynak.extent
        guard e.width > 0, e.height > 0, piksel.width > 0, piksel.height > 0 else { return nil }
        let k = DuvarTasarimi.fotoKirpmasi(
            gorselG: Double(e.width), gorselY: Double(e.height), hedefG: Double(piksel.width), hedefY: Double(piksel.height),
            x: ayar.x, y: ayar.y, yakinlik: ayar.yakinlik
        )
        guard k.genislik > 0, k.yukseklik > 0 else { return nil }
        // Saf kirpma sol ust kokenli; CoreImage sol alt kokenli.
        let kirpma = CGRect(
            x: e.minX + CGFloat(k.x), y: e.minY + e.height - CGFloat(k.y + k.yukseklik),
            width: CGFloat(k.genislik), height: CGFloat(k.yukseklik)
        )
        let hedef = CGRect(origin: .zero, size: piksel)
        var gorsel = kaynak.cropped(to: kirpma)
            .transformed(by: CGAffineTransform(translationX: -kirpma.minX, y: -kirpma.minY))
            .transformed(by: CGAffineTransform(scaleX: piksel.width / kirpma.width, y: piksel.height / kirpma.height))
        let yaricap = DuvarTasarimi.bulaniklikYaricapi(ayar.bulaniklik, genislik: Double(piksel.width), yukseklik: Double(piksel.height))
        if yaricap >= 0.5 {
            // Kenarlar kirpilmadan once uzatilir: yoksa bulaniklik kenarda saydam/siyah hale cizerdi.
            gorsel = gorsel.clampedToExtent().applyingGaussianBlur(sigma: yaricap).cropped(to: hedef)
        }
        return CIContext().createCGImage(gorsel, from: hedef, format: .RGBA8, colorSpace: srgb)
    }

    /// Yazi kutusunun (piksel, sol ust koken) altindaki ORTALAMA bagil parlaklik, karartma dahil.
    static func ortalamaParlaklik(_ gorsel: CGImage, kutu: CGRect, karartma: Double) -> Double {
        let sinir = CGRect(x: 0, y: 0, width: gorsel.width, height: gorsel.height)
        let alan = kutu.integral.intersection(sinir)
        guard !alan.isNull, alan.width >= 1, alan.height >= 1, let parca = gorsel.cropping(to: alan) else { return 0 }
        let n = 32
        var bayt = [UInt8](repeating: 0, count: n * n * 4)
        let cizildi: Bool = bayt.withUnsafeMutableBytes { tampon in
            guard let baglam = CGContext(
                data: tampon.baseAddress, width: n, height: n, bitsPerComponent: 8, bytesPerRow: n * 4,
                space: srgb, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
            ) else { return false }
            baglam.interpolationQuality = .medium
            baglam.draw(parca, in: CGRect(x: 0, y: 0, width: n, height: n))
            return true
        }
        return cizildi ? DuvarTasarimi.ortalamaParlaklik(rgba: bayt, karartma: karartma) : 0
    }
}

@available(iOS 16.0, *)
private struct DuvarCizici {
    let kayit: GununAyetiKaydi
    let metin: GununAyetiMetinleri
    let ek: GununAyetiDuvarEki
    let simdiMs: Int64
    let boyut: CGSize
    let olcek: CGFloat

    private var ayar: DuvarAyari { ek.duvar }
    private var W: CGFloat { boyut.width }
    private var H: CGFloat { boyut.height }
    /// Yazi olculeri 412 tasarim genisligine gore (`DuvarCizim.tasarimGenisligi`).
    private var s: CGFloat { W / CGFloat(DuvarCizim.tasarimGenisligi) }
    /// Yazi sutununun yan payi: mihrapta kemerin icine daralir (onizlemeyle ayni).
    private var yanBosluk: CGFloat { CGFloat(DuvarCizim.yaziYanPayi(ayar.sus.tur)) * W }
    private var icGenislik: CGFloat { max(1, W - 2 * yanBosluk) }
    private var ekranAdi: String { DuvarTasarimi.ekran(ayar.yer) }

    private enum Zemin {
        case duz(String, DuvarZeminRenkleri)
        case gok(DuvarGokSahnesi)
        case foto(CGImage)
    }

    private struct Renkler {
        let metin: UIColor
        let kunye: UIColor
        let atif: UIColor
        let sus: UIColor
        let susOpakligi: Double

        init(duz r: DuvarZeminRenkleri) {
            metin = renk(r.metin)
            kunye = renk(r.kunye)
            atif = renk(r.atif)
            sus = renk(r.sus)
            susOpakligi = r.susOpakligi
        }

        /// Gok ve fotograf: tek yazi rengi; kunye %72, atif %55; sus yazi renginde.
        init(tek: UIColor) {
            metin = tek
            kunye = tek.withAlphaComponent(CGFloat(DuvarCizim.kunyeOpakligi))
            atif = tek.withAlphaComponent(CGFloat(DuvarCizim.atifOpakligi))
            sus = tek
            susOpakligi = DuvarCizim.yildizOpaklik
        }
    }

    private enum ParcaTuru {
        case metin(NSAttributedString)
        case yildiz
    }

    private struct Parca {
        let ustBosluk: CGFloat
        let yukseklik: CGFloat
        let tur: ParcaTuru
    }

    private struct Blok {
        let parcalar: [Parca]
        let arapca: Bool
        let carpan: CGFloat
        var yukseklik: CGFloat { parcalar.reduce(0) { $0 + $1.ustBosluk + $1.yukseklik } }
    }

    // MARK: Akis

    func png() -> Data? {
        let zemin = zeminCoz()
        // Yerlesim renkten bagimsizdir: once olc, sonra (fotografta parlakliga gore) renkle yeniden kur.
        let (olcu, ust) = yerlestir(renk: Renkler(tek: .white))
        let kutu = CGRect(x: yanBosluk, y: CGFloat(ust) * H, width: icGenislik, height: olcu.yukseklik)
        let kutuKesri = [Double(kutu.minX / W), Double(kutu.minY / H), Double(kutu.maxX / W), Double(kutu.maxY / H)]

        // Yerel ad `renk(hex:)` yardimcisini golgelemesin diye `renkler`.
        let renkler: Renkler
        var perde: UIColor?
        switch zemin {
        case let .duz(_, r):
            renkler = Renkler(duz: r)
        case let .gok(sahne):
            renkler = Renkler(tek: renk(hex: sahne.metin))
        case let .foto(gorsel):
            if ayar.foto.okunurluk {
                let pikselKutu = CGRect(x: kutu.minX * olcek, y: kutu.minY * olcek, width: kutu.width * olcek, height: kutu.height * olcek)
                let karar = DuvarTasarimi.okunurlukKarari(
                    DuvarFotoZemini.ortalamaParlaklik(gorsel, kutu: pikselKutu, karartma: ayar.foto.karartma)
                )
                renkler = Renkler(tek: renk(hex: karar.metin))
                if karar.perdeOpakligi > 0 {
                    perde = renk(hex: karar.perde).withAlphaComponent(CGFloat(karar.perdeOpakligi))
                }
            } else {
                renkler = Renkler(tek: .white)
            }
        }
        let blok = blokKur(arapca: olcu.arapca, carpan: olcu.carpan, renk: renkler)

        let bicim = UIGraphicsImageRendererFormat()
        bicim.scale = olcek
        bicim.opaque = true
        bicim.preferredRange = .standard
        let cizici = UIGraphicsImageRenderer(size: boyut, format: bicim)
        return cizici.pngData { baglam in
            let ctx = baglam.cgContext
            zeminCiz(ctx, zemin, kutuKesri: kutuKesri)
            susCiz(ctx, zemin: zemin, renk: renkler, kutu: kutu)
            if let perde {
                // Fotografta okunurluk perdesi: yazi kutusunun her yanindan `perdePay` tasan, kesin kenarli dolgu.
                let pay = CGFloat(DuvarCizim.perdePay) * W
                perde.setFill()
                UIBezierPath(roundedRect: kutu.insetBy(dx: -pay, dy: -pay), cornerRadius: CGFloat(DuvarCizim.perdeYaricap) * W).fill()
            }
            blokCiz(ctx, blok, ust: kutu.minY, renk: renkler)
        }
    }

    private func zeminCoz() -> Zemin {
        let gece = Zemin.duz("gece", DuvarTasarimi.zeminRenkleri("gece", paletRenk: ayar.paletRenk))
        switch ayar.zemin {
        case "gece", "kagit", "palet":
            return .duz(ayar.zemin, DuvarTasarimi.zeminRenkleri(ayar.zemin, paletRenk: ayar.paletRenk))
        case "foto":
            let piksel = CGSize(width: (W * olcek).rounded(), height: (H * olcek).rounded())
            guard let dosya = ayar.foto.dosya,
                  let gorsel = DuvarFotoZemini.hazirla(dosya: dosya, ayar: ayar.foto, piksel: piksel) else { return gece }
            return .foto(gorsel)
        default:
            guard let gok = DuvarTasarimi.cizilecekGok(
                zemin: ayar.zemin, vakteUysun: ayar.vakteUysun, simdiMs: simdiMs, vakitler: ek.vakitler[kayit.gun]
            ), let sahne = ek.sahneler[gok] else { return gece }
            return .gok(sahne)
        }
    }

    // MARK: Yazi blogu (onizlemenin `DuvarYazisi` olculeri, `DuvarCizim`)

    /// Mealin (yoksa Arapcanin) yonu: kunye, atif ve kucuk yildiz buna gore hizalanir.
    private var sagdanSola: Bool { DuvarTasarimi.sagdanSolaMi(kayit.meal ?? kayit.ar) }

    /// (Arapca | yildiz susunde kucuk yildiz) + meal + kunye + atif; olculer 412 tasarim px × `s` ×
    /// kullanici olcegi × kucultme `carpan`.
    private func blokKur(arapca: Bool, carpan: CGFloat, renk: Renkler) -> Blok {
        let c = DuvarCizim.self
        let o = s * CGFloat(ayar.yazi.olcek) * carpan
        var parcalar: [Parca] = []
        let kucukYildiz = !arapca && ayar.sus.tur == "yildiz"
        if arapca {
            let boy = CGFloat(c.arapca) * o
            let ar = metinParcasi(
                kayit.ar, yazitipi: DuvarYazitipleri.arapca(boy), renk: renk.metin, sagdanSola: true, satir: boy * CGFloat(c.arapcaSatir)
            )
            parcalar.append(Parca(ustBosluk: 0, yukseklik: ar.1, tur: .metin(ar.0)))
        } else if kucukYildiz {
            // Yildiz susunde, Arapca yokken mealin ustunde kucuk sekiz koseli yildiz (daire yok).
            parcalar.append(Parca(ustBosluk: 0, yukseklik: CGFloat(c.kucukYildiz) * o, tur: .yildiz))
        }
        if let meal = kayit.meal {
            let boy = CGFloat(arapca ? c.mealArapcali : c.meal) * o
            let tip = DuvarTasarimi.mealYazitipi(ayar.yazi.tip, meal: meal)
            let m = metinParcasi(
                meal, yazitipi: DuvarYazitipleri.meal(tip, boy), renk: renk.metin, sagdanSola: sagdanSola, satir: boy * CGFloat(c.mealSatir)
            )
            let ust = arapca ? c.mealUstArapcali : (kucukYildiz ? c.mealUstYildizli : 0)
            parcalar.append(Parca(ustBosluk: CGFloat(ust) * o, yukseklik: m.1, tur: .metin(m.0)))
        }
        let kunyeBoyu = CGFloat(c.kunye) * o
        let kunye = metinParcasi(
            kayit.kisaKunye, yazitipi: UIFont.systemFont(ofSize: kunyeBoyu), renk: renk.kunye,
            sagdanSola: sagdanSola, harfAraligi: CGFloat(c.kunyeHarfAraligi) * kunyeBoyu
        )
        parcalar.append(Parca(ustBosluk: CGFloat(arapca ? c.kunyeUstArapcali : c.kunyeUst) * o, yukseklik: kunye.1, tur: .metin(kunye.0)))
        let atifMetni = GununAyetiKarari.atifSatiri(kayit, metin: metin, arapcaGorunuyor: arapca)
        if !atifMetni.isEmpty {
            // Atif zorunlu ve okunur: kullanici olcegi ×0,9'un altina indirmez; kucultme de ×0,9'da durur.
            let enAz = CGFloat(c.atifEnAzOlcek)
            let atifBoyu = CGFloat(c.atif) * s * max(enAz, CGFloat(ayar.yazi.olcek)) * max(enAz, carpan)
            let atif = metinParcasi(atifMetni, yazitipi: UIFont.systemFont(ofSize: atifBoyu), renk: renk.atif, sagdanSola: sagdanSola)
            parcalar.append(Parca(ustBosluk: CGFloat(c.atifUst) * o, yukseklik: atif.1, tur: .metin(atif.0)))
        }
        return Blok(parcalar: parcalar, arapca: arapca, carpan: carpan)
    }

    /// Olculmus metin. `satir` verilirse her satir o MUTLAK yukseklikte (onizlemenin `lineHeight`'i):
    /// satir yuksekligi sabitlenir, glifler satirin ortasina kaydirilir (`baselineOffset`); yukseklik
    /// kaydirmasiz kopyadan olculur. Verilmezse yazi tipinin dogal satiri.
    private func metinParcasi(
        _ yazi: String, yazitipi: UIFont, renk: UIColor, sagdanSola: Bool, satir: CGFloat? = nil, harfAraligi: CGFloat = 0
    ) -> (NSAttributedString, CGFloat) {
        let paragraf = NSMutableParagraphStyle()
        paragraf.alignment = nsHiza(DuvarTasarimi.hiza(ayar.yazi.hiza, sagdanSola: sagdanSola))
        paragraf.baseWritingDirection = sagdanSola ? .rightToLeft : .leftToRight
        paragraf.lineBreakMode = .byWordWrapping
        if let satir {
            paragraf.minimumLineHeight = satir
            paragraf.maximumLineHeight = satir
        }
        var nitelikler: [NSAttributedString.Key: Any] = [.font: yazitipi, .foregroundColor: renk, .paragraphStyle: paragraf]
        if harfAraligi != 0 { nitelikler[.kern] = harfAraligi }
        let olculen = NSAttributedString(string: yazi, attributes: nitelikler)
        let olcu = olculen.boundingRect(
            with: CGSize(width: icGenislik, height: .greatestFiniteMagnitude), options: [.usesLineFragmentOrigin, .usesFontLeading], context: nil
        )
        guard let satir else { return (olculen, ceil(olcu.height)) }
        nitelikler[.baselineOffset] = (satir - (yazitipi.ascender - yazitipi.descender)) / 2
        return (NSAttributedString(string: yazi, attributes: nitelikler), ceil(olcu.height))
    }

    private func nsHiza(_ h: DuvarHizasi) -> NSTextAlignment {
        switch h {
        case .sol: return .left
        case .orta: return .center
        case .sag: return .right
        }
    }

    /// Istenen merkeze en yakin izinli banda yerlestirir; sigmazsa %6 adimla kucultur, en kucukte
    /// Arapcayi dusurup (meal varsa) baştan dener (Android ile ayni). Hic sigmazsa en buyuk bantta,
    /// ekranda kalacak sekilde cizer (gorsel HER ZAMAN uretilir). Doner: blok + ust kenar (kesir).
    private func yerlestir(renk: Renkler) -> (Blok, Double) {
        let bantlar = DuvarTasarimi.izinliBantlar["ios"]?[ekranAdi] ?? []
        let merkez = DuvarTasarimi.yaziMerkezi(ayar.yazi, ekran: ekranAdi)
        let arapca = GununAyetiKarari.duvardaArapca(kayit, ayar: ayar)
        var denemeler = [arapca]
        if arapca && kayit.meal != nil { denemeler.append(false) }
        var son: Blok?
        for arapcaIle in denemeler {
            for carpan in DuvarTasarimi.kucultmeAdimlari() {
                let b = blokKur(arapca: arapcaIle, carpan: CGFloat(carpan), renk: renk)
                son = b
                if let y = DuvarTasarimi.yaziYerlesimi(merkez, Double(b.yukseklik / H), bantlar) { return (b, y.ust) }
            }
        }
        let b = son ?? blokKur(arapca: false, carpan: 0.58, renk: renk)
        let bant = bantlar.max { ($0.alt - $0.ust) < ($1.alt - $1.ust) } ?? DuvarBandi(ust: 0.07, alt: 0.86)
        return (b, max(0.02, min(bant.ust, 0.98 - Double(b.yukseklik / H))))
    }

    private func yatayMerkez(genislik: CGFloat) -> CGFloat {
        switch DuvarTasarimi.hiza(ayar.yazi.hiza, sagdanSola: sagdanSola) {
        case .sol: return yanBosluk + genislik / 2
        case .orta: return W / 2
        case .sag: return W - yanBosluk - genislik / 2
        }
    }

    private func blokCiz(_ ctx: CGContext, _ blok: Blok, ust: CGFloat, renk: Renkler) {
        var y = ust
        for p in blok.parcalar {
            y += p.ustBosluk
            switch p.tur {
            case let .metin(dizgi):
                dizgi.draw(
                    with: CGRect(x: yanBosluk, y: y, width: icGenislik, height: p.yukseklik + 2),
                    options: [.usesLineFragmentOrigin, .usesFontLeading], context: nil
                )
            case .yildiz:
                let birim = p.yukseklik / 24
                yildizCiz(
                    ctx, merkez: CGPoint(x: yatayMerkez(genislik: p.yukseklik), y: y + p.yukseklik / 2), birim: birim,
                    renk: renk.kunye, opaklik: 1, cizgi: CGFloat(DuvarCizim.kucukYildizKalinlik) * birim, daire: false
                )
            }
            y += p.yukseklik
        }
    }

    // MARK: Zemin

    private func zeminCiz(_ ctx: CGContext, _ zemin: Zemin, kutuKesri: [Double]) {
        let tum = CGRect(origin: .zero, size: boyut)
        switch zemin {
        case let .duz(_, r):
            renk(r.zemin).setFill()
            ctx.fill(tum)
        case let .gok(sahne):
            gokCiz(ctx, sahne, kutuKesri: kutuKesri)
        case let .foto(gorsel):
            UIImage(cgImage: gorsel).draw(in: tum)
            UIColor.black.withAlphaComponent(CGFloat(ayar.foto.karartma)).setFill()
            ctx.fill(tum)
        }
    }

    /// Gok ilkelleri (onizlemeyle ayni sira: renk gecisi → yildizlar → isima → huzmeler → cisim → ufuk cokgenleri).
    private func gokCiz(_ ctx: CGContext, _ g: DuvarGokSahnesi, kutuKesri: [Double]) {
        let tum = CGRect(origin: .zero, size: boyut)
        let renkler = g.gradyan.map { cgRenk($0.renk, 1) }
        let konumlar = g.gradyan.map { CGFloat($0.konum) }
        if renkler.count >= 2,
           let gecis = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB), colors: renkler as CFArray, locations: konumlar) {
            ctx.drawLinearGradient(
                gecis, start: .zero, end: CGPoint(x: 0, y: H), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
            )
        } else {
            ctx.setFillColor(renkler.first ?? cgRenk("#000000", 1))
            ctx.fill(tum)
        }

        for yildiz in g.yildizlar {
            let r = max(0.4, CGFloat(yildiz.r) * W)
            ctx.setFillColor(cgRenk("#FFFFFF", yildiz.opaklik))
            ctx.fillEllipse(in: CGRect(x: CGFloat(yildiz.x) * W - r, y: CGFloat(yildiz.y) * H - r, width: 2 * r, height: 2 * r))
        }

        // Cisim yazi kutusuna degmeyen ilk adayda; hicbiri uymazsa cisim, isimasi ve huzmeleri (baslari
        // cismin merkezidir) cizilmez.
        if let cisim = g.cisim, let k = DuvarTasarimi.cisimKonumuSec(cisim, kutu: kutuKesri, oran: Double(H / W)) {
            let merkez = CGPoint(x: CGFloat(k[0]) * W, y: CGFloat(k[1]) * H)
            if let isimaR = cisim.isimaR, isimaR > 0 {
                let isimaRenk = cisim.isimaRenk ?? cisim.renk
                let opaklik = cisim.isimaOpaklik ?? 1
                if let isima = CGGradient(
                    colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                    colors: [cgRenk(isimaRenk, opaklik), cgRenk(isimaRenk, 0)] as CFArray, locations: [0, 1]
                ) {
                    ctx.drawRadialGradient(
                        isima, startCenter: merkez, startRadius: 0, endCenter: merkez, endRadius: CGFloat(isimaR) * W, options: []
                    )
                }
            }
            for huzme in g.huzmeler {
                ctx.saveGState()
                ctx.setStrokeColor(cgRenk(huzme.renk, huzme.opaklik))
                ctx.setLineWidth(CGFloat(huzme.kalinlik) * W)
                ctx.setLineCap(.butt)
                ctx.move(to: merkez)
                ctx.addLine(to: CGPoint(x: CGFloat(huzme.x) * W, y: CGFloat(huzme.y) * H))
                ctx.strokePath()
                ctx.restoreGState()
            }
            let r = CGFloat(cisim.r) * W
            let dis = CGRect(x: merkez.x - r, y: merkez.y - r, width: 2 * r, height: 2 * r)
            ctx.saveGState()
            if cisim.tur == "hilal", let kesR = cisim.kesR {
                // Hilal = dis daire EKSI kesen daire: kesenin TUMLEYENINE kirp, sonra dis daireyi doldur
                // (iki daireyle cift-tek dolgu, kesenin dis dairenin disina tasan kismini da boyardi).
                let kr = CGFloat(kesR) * W
                let kc = CGPoint(x: merkez.x + CGFloat(cisim.kesX ?? 0) * W, y: merkez.y + CGFloat(cisim.kesY ?? 0) * H)
                ctx.addRect(tum)
                ctx.addEllipse(in: CGRect(x: kc.x - kr, y: kc.y - kr, width: 2 * kr, height: 2 * kr))
                ctx.clip(using: .evenOdd)
            }
            ctx.setFillColor(cgRenk(cisim.renk, cisim.opaklik))
            ctx.fillEllipse(in: dis)
            ctx.restoreGState()
        }

        for cokgen in g.ufuk {
            let noktalar = cokgen.noktalar.filter { $0.count >= 2 }.map { CGPoint(x: CGFloat($0[0]) * W, y: CGFloat($0[1]) * H) }
            guard noktalar.count >= 3 else { continue }
            ctx.setFillColor(cgRenk(cokgen.renk, cokgen.opaklik))
            ctx.addLines(between: noktalar)
            ctx.closePath()
            ctx.fillPath()
        }
    }

    // MARK: Sus (onizlemenin `SusKatmani`, sayilar `DuvarCizim`)

    private func susCiz(_ ctx: CGContext, zemin: Zemin, renk: Renkler, kutu: CGRect) {
        let carpan = DuvarCizim.susCarpani(ayar.sus.belirginlik)
        guard ayar.sus.tur != "yok", carpan > 0 else { return }
        switch ayar.sus.tur {
        case "mihrap":
            mihrapCiz(ctx, ust: kutu.minY, renk: renk.metin, carpan: carpan)
        case "girih":
            girihCiz(ctx, renk: renk.metin, carpan: carpan)
        default:
            // Silik buyuk yildiz (iki kare + daire); duz zeminde kendi yeri, gok ve fotografta gecenin yeri.
            let zeminAdi: String
            if case let .duz(ad, _) = zemin { zeminAdi = ad } else { zeminAdi = "gece" }
            let konum = DuvarCizim.yildizKonumu(zeminAdi)
            let birim = CGFloat(DuvarCizim.yildizBirim) * W
            yildizCiz(
                ctx, merkez: CGPoint(x: CGFloat(konum[0]) * W, y: CGFloat(konum[1]) * H), birim: birim, renk: renk.sus,
                opaklik: renk.susOpakligi * carpan, cizgi: CGFloat(DuvarCizim.yildizKalinlik) * birim, daire: true
            )
        }
    }

    /// Mihrap: iki kemer (dis + ic) bacaklari ekranin altindan yukselir, yarim daireleri yazi kutusunun
    /// ustunden doner (merkez kutu ustunun `merkezAlti` altinda); tepede DOLU bes koseli yildiz. Kemer
    /// yatayda ekrana goredir (yazi sutunu `mihrapYaziYanPayi` ile icinde kalir).
    private func mihrapCiz(_ ctx: CGContext, ust: CGFloat, renk: UIColor, carpan: Double) {
        for k in [DuvarCizim.mihrapDis, DuvarCizim.mihrapIc] {
            let sol = CGFloat(k.yanPay) * W
            let sag = W - sol
            let r = CGFloat(k.r) * W
            let merkezY = ust + CGFloat(k.merkezAlti) * W
            let yol = CGMutablePath()
            yol.move(to: CGPoint(x: sol, y: H))
            yol.addLine(to: CGPoint(x: sol, y: merkezY))
            // Aci artarak π → 2π: asagi yonlu (UIKit) koordinatta tepeden gecer.
            yol.addArc(center: CGPoint(x: (sol + sag) / 2, y: merkezY), radius: r, startAngle: .pi, endAngle: 0, clockwise: false)
            yol.addLine(to: CGPoint(x: sag, y: H))
            ctx.saveGState()
            ctx.setStrokeColor(renk.withAlphaComponent(CGFloat(min(1, k.opaklik * carpan))).cgColor)
            ctx.setLineWidth(CGFloat(k.kalinlik) * W)
            ctx.addPath(yol)
            ctx.strokePath()
            ctx.restoreGState()
        }
        let w = Double(W)
        let koseler = DuvarCizim.besKoseliYildiz(
            cx: w / 2, cy: Double(ust) - DuvarCizim.mihrapYildizUst * w, dis: DuvarCizim.mihrapYildizDisR * w, ic: DuvarCizim.mihrapYildizIcR * w
        ).map { CGPoint(x: CGFloat($0[0]), y: CGFloat($0[1])) }
        ctx.saveGState()
        ctx.setFillColor(renk.withAlphaComponent(CGFloat(min(1, DuvarCizim.mihrapYildizOpaklik * carpan))).cgColor)
        ctx.addLines(between: koseler)
        ctx.closePath()
        ctx.fillPath()
        ctx.restoreGState()
    }

    /// Girih: sol ustten dosenen karo; her karoda dort koseli yildiz (`girihYol`) + ortada daire.
    private func girihCiz(_ ctx: CGContext, renk: UIColor, carpan: Double) {
        let karo = CGFloat(DuvarCizim.girihKaro) * W
        guard karo >= 4 else { return }
        let birim = karo / 48
        let noktalar = DuvarCizim.girihNoktalari()
        let daireR = CGFloat(DuvarCizim.girihDaireR) * birim
        let yildiz = CGMutablePath()
        let daire = CGMutablePath()
        var ty: CGFloat = 0
        while ty < H {
            var tx: CGFloat = 0
            while tx < W {
                yildiz.addLines(between: noktalar.map { CGPoint(x: tx + CGFloat($0[0]) * birim, y: ty + CGFloat($0[1]) * birim) })
                yildiz.closeSubpath()
                daire.addEllipse(in: CGRect(x: tx + 24 * birim - daireR, y: ty + 24 * birim - daireR, width: 2 * daireR, height: 2 * daireR))
                tx += karo
            }
            ty += karo
        }
        let renkli = renk.withAlphaComponent(CGFloat(min(1, DuvarCizim.girihOpaklik * carpan))).cgColor
        for (yol, kalinlik) in [(yildiz, DuvarCizim.girihYildizKalinlik), (daire, DuvarCizim.girihDaireKalinlik)] {
            ctx.saveGState()
            ctx.setStrokeColor(renkli)
            ctx.setLineWidth(CGFloat(kalinlik) * birim)
            ctx.addPath(yol)
            ctx.strokePath()
            ctx.restoreGState()
        }
    }

    /// 24 birimlik cercevede iki kareden sekiz koseli yildiz (+ istege bagli daire). Tek yol olarak
    /// cizilir: kesisimlerde opaklik katlanmaz (onizlemedeki grup opakligi gibi).
    private func yildizCiz(
        _ ctx: CGContext, merkez: CGPoint, birim: CGFloat, renk: UIColor, opaklik: Double, cizgi: CGFloat, daire: Bool
    ) {
        let yari = CGFloat(DuvarCizim.yildizYariKenar) * birim
        let kosegen = CGFloat(DuvarCizim.yildizKosegen) * birim
        let yol = CGMutablePath()
        yol.addRect(CGRect(x: merkez.x - yari, y: merkez.y - yari, width: 2 * yari, height: 2 * yari))
        yol.addLines(between: [
            CGPoint(x: merkez.x, y: merkez.y - kosegen), CGPoint(x: merkez.x + kosegen, y: merkez.y),
            CGPoint(x: merkez.x, y: merkez.y + kosegen), CGPoint(x: merkez.x - kosegen, y: merkez.y),
        ])
        yol.closeSubpath()
        if daire {
            let r = CGFloat(DuvarCizim.yildizDaireR) * birim
            yol.addEllipse(in: CGRect(x: merkez.x - r, y: merkez.y - r, width: 2 * r, height: 2 * r))
        }
        ctx.saveGState()
        ctx.setStrokeColor(renk.withAlphaComponent(CGFloat(min(1, max(0, opaklik)))).cgColor)
        ctx.setLineWidth(cizgi)
        ctx.setLineJoin(.round)
        ctx.addPath(yol)
        ctx.strokePath()
        ctx.restoreGState()
    }
}

// MARK: - Renk yardimcilari

/// 0xRRGGBB → sRGB `UIColor`.
@available(iOS 16.0, *)
private func renk(_ rgb: UInt32) -> UIColor {
    UIColor(
        red: CGFloat((rgb >> 16) & 0xFF) / 255, green: CGFloat((rgb >> 8) & 0xFF) / 255, blue: CGFloat(rgb & 0xFF) / 255, alpha: 1
    )
}

/// `#RRGGBB` → `UIColor` (bozuk deger siyah).
@available(iOS 16.0, *)
private func renk(hex: String) -> UIColor {
    renk(DuvarTasarimi.rgb(hex) ?? 0)
}

@available(iOS 16.0, *)
private func cgRenk(_ hex: String, _ opaklik: Double) -> CGColor {
    renk(hex: hex).withAlphaComponent(CGFloat(min(1, max(0, opaklik)))).cgColor
}
