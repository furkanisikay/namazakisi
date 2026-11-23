import CoreGraphics
import Foundation
import ImageIO

/**
 * Gunun ayeti duvar kagidi FOTOGRAF ZEMINI deposu (iPhone).
 *
 * Kopru (`duvarFotografiniYaz` / `duvarFotografiniSil`) ve Kisayollar gorseli
 * (`targets/siri-kisayollari/GununAyetiGorseliIntent.swift`) AYNI yolu kullanir: App Group kabi
 * (`SiriDeposu.ortakGrup`) erisilebilirse `<kap>/duvar/<dosya>`, degilse uygulamanin Application
 * Support dizini (SiriDeposu'nun UserDefaults yedegiyle ayni mantik; intent ana uygulama
 * surecinde calisir, iki taraf hep ayni sonuca varir).
 *
 * Ad yalniz `duvar-foto-<ozet>.(jpg|png)` (`DuvarAyari.fotoAdiGecerliMi`, JS `fotoAyariNormalize`
 * ile ayni kural): yol tasinmaz, `../` ile kap disina yazilamaz. Gorsel yeniden kodlanir
 * (uzun kenar en cok 2048 px, EXIF yonu uygulanir ve meta veri — konum dahil — atilir).
 */
public enum DuvarFotografi {
    public static let dizinAdi = "duvar"
    public static let enUzunKenar = 2048
    public static let jpegKalitesi = 0.9

    /// Fotograf dizini (olusturulmaz); kap da Application Support da yoksa nil.
    public static func dizin() -> URL? {
        let fm = FileManager.default
        let kok = fm.containerURL(forSecurityApplicationGroupIdentifier: SiriDeposu.ortakGrup)
            ?? fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        return kok?.appendingPathComponent(dizinAdi, isDirectory: true)
    }

    /// Gecerli addaki fotografin yolu (dosya var olmayabilir); gecersiz ad → nil.
    public static func url(_ dosya: String) -> URL? {
        guard DuvarAyari.fotoAdiGecerliMi(dosya) else { return nil }
        return dizin()?.appendingPathComponent(dosya, isDirectory: false)
    }

    /// Secicinin verdigi URI → yerel dosya. Yalniz `file://` ya da mutlak yol (ph://, http YOK).
    static func kaynakUrl(_ uri: String) -> URL? {
        if uri.hasPrefix("/") { return URL(fileURLWithPath: uri) }
        if let u = URL(string: uri), u.isFileURL { return u }
        if uri.hasPrefix("file://") {
            let yol = String(uri.dropFirst("file://".count))
            let cozulmus = yol.removingPercentEncoding ?? yol
            return cozulmus.hasPrefix("/") ? URL(fileURLWithPath: cozulmus) : nil
        }
        return nil
    }

    /// Secilen gorseli `duvar/<dosya>` olarak yeniden kodlar (JPEG 0,9; ad `.png` ise PNG). Ad
    /// gecersiz, kaynak okunamaz ya da yazilamazsa false. Agir is: koprude `AsyncFunction`.
    public static func yaz(kaynakUri: String, dosya: String) -> Bool {
        guard let hedef = url(dosya), let kaynak = kaynakUrl(kaynakUri),
              let kaynakGorsel = CGImageSourceCreateWithURL(kaynak as CFURL, nil) else { return false }
        let secenekler: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: enUzunKenar,
            kCGImageSourceShouldCacheImmediately: true,
        ]
        guard let gorsel = CGImageSourceCreateThumbnailAtIndex(kaynakGorsel, 0, secenekler as CFDictionary) else { return false }
        let png = dosya.hasSuffix(".png")
        let veri = NSMutableData()
        guard let cikti = CGImageDestinationCreateWithData(veri as CFMutableData, (png ? "public.png" : "public.jpeg") as CFString, 1, nil) else {
            return false
        }
        let ozellikler: [CFString: Any] = png ? [:] : [kCGImageDestinationLossyCompressionQuality: jpegKalitesi]
        CGImageDestinationAddImage(cikti, gorsel, ozellikler as CFDictionary)
        guard CGImageDestinationFinalize(cikti) else { return false }
        do {
            try FileManager.default.createDirectory(at: hedef.deletingLastPathComponent(), withIntermediateDirectories: true)
            // Kilitliyken calisan "Gunun Saati" otomasyonu da okuyabilsin (ilk kilit acilisindan sonra).
            try Data(referencing: veri).write(to: hedef, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
            return true
        } catch {
            return false
        }
    }

    /// Fotografi siler; gecersiz ad ya da olmayan dosya sessizce atlanir.
    public static func sil(_ dosya: String) {
        guard let u = url(dosya) else { return }
        try? FileManager.default.removeItem(at: u)
    }

    // MARK: Kilit ekrani saat alani olcumu

    /// Kisayollar gorselinin SON kilit kopyasi (`duvar/son-kilit.png`, genislik 270 px, en-boy korunur):
    /// intent her kilit gorselinde yazar, olcum kullanicinin kilit ekrani goruntusunu bununla karsilastirir.
    public static let kilitReferansAdi = "son-kilit.png"
    public static let kilitReferansGenisligi = 270

    public static func kilitReferansUrl() -> URL? {
        dizin()?.appendingPathComponent(kilitReferansAdi, isDirectory: false)
    }

    /// Referans PNG'yi atomik yazar (fotografla ayni koruma sinifi). Basarisizsa false.
    @discardableResult
    public static func kilitReferansiYaz(_ png: Data) -> Bool {
        guard let hedef = kilitReferansUrl() else { return false }
        do {
            try FileManager.default.createDirectory(at: hedef.deletingLastPathComponent(), withIntermediateDirectories: true)
            try png.write(to: hedef, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
            return true
        } catch {
            return false
        }
    }

    /// Kilit ekrani goruntusunun (secicinin `file://` URI'si) son kilit kopyasina gore satir profili:
    /// `["profil": [Double]]` (yukaridan asagi, satir basina degisen piksel orani; karar JS `saatAlaniBul`)
    /// ya da `["hata": "referans-yok" | "okunamadi" | "oran"]`. Iki gorsel de 108 × round(108·y/g)
    /// RGBA'ya cizilir (y/g referansinki), kural saf `DuvarTasarimi.kilitProfili`. Agir is: koprude `AsyncFunction`.
    public static func kilitEkraniProfili(uri: String) -> [String: Any] {
        guard let refUrl = kilitReferansUrl(), FileManager.default.fileExists(atPath: refUrl.path) else {
            return ["hata": "referans-yok"]
        }
        guard let kaynak = kaynakUrl(uri), let ekran = olcumGorseli(kaynak) else { return ["hata": "okunamadi"] }
        guard let referans = olcumGorseli(refUrl) else { return ["hata": "referans-yok"] }
        let eg = Double(ekran.width)
        let ey = Double(ekran.height)
        guard DuvarTasarimi.olcumOranlariUyumlu(ekranG: eg, ekranY: ey, refG: Double(referans.width), refY: Double(referans.height)) else {
            return ["hata": "oran"]
        }
        let g = DuvarTasarimi.olcumGenisligi
        // Yukseklik REFERANSIN oranindan (Android `KilitReferansi` ile ayni; referans uygulamanin kendi tam ekran gorseli).
        let y = DuvarTasarimi.olcumYuksekligi(genislik: Double(referans.width), yukseklik: Double(referans.height))
        guard let ekranRgba = rgba(ekran, genislik: g, yukseklik: y), let refRgba = rgba(referans, genislik: g, yukseklik: y) else {
            return ["hata": "okunamadi"]
        }
        let profil = DuvarTasarimi.kilitProfili(
            ekran: DuvarTasarimi.parlakliklar(rgba: ekranRgba), referans: DuvarTasarimi.parlakliklar(rgba: refRgba),
            genislik: g, yukseklik: y
        )
        return profil.count == y ? ["profil": profil] : ["hata": "okunamadi"]
    }

    /// Gorseli EXIF yonu uygulanmis olarak okur (uzun kenar en cok 1024 px; olcum zaten 108 genislikte).
    private static func olcumGorseli(_ url: URL) -> CGImage? {
        guard let kaynak = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
        let secenekler: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: 1024,
            kCGImageSourceShouldCacheImmediately: true,
        ]
        guard let gorsel = CGImageSourceCreateThumbnailAtIndex(kaynak, 0, secenekler as CFDictionary),
              gorsel.width > 0, gorsel.height > 0 else { return nil }
        return gorsel
    }

    /// `genislik` × `yukseklik` sRGB RGBA (8 bit) tampon; satir 0 gorselin USTU.
    private static func rgba(_ gorsel: CGImage, genislik: Int, yukseklik: Int) -> [UInt8]? {
        guard genislik > 0, yukseklik > 0, let srgb = CGColorSpace(name: CGColorSpace.sRGB) else { return nil }
        var bayt = [UInt8](repeating: 0, count: genislik * yukseklik * 4)
        let cizildi: Bool = bayt.withUnsafeMutableBytes { tampon in
            guard let baglam = CGContext(
                data: tampon.baseAddress, width: genislik, height: yukseklik, bitsPerComponent: 8, bytesPerRow: genislik * 4,
                space: srgb, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
            ) else { return false }
            baglam.interpolationQuality = .high
            baglam.draw(gorsel, in: CGRect(x: 0, y: 0, width: genislik, height: yukseklik))
            return true
        }
        return cizildi ? bayt : nil
    }
}
