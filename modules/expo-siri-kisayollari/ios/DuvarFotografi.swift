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
}
