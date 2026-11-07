import AVFoundation
import CryptoKit
import Foundation

/**
 * KENDI SES DOSYANIZ (iPhone) — kullanicinin sectigi dosyayi BILDIRIM SESI yapar.
 *
 * iOS'ta sistem ses secicisi yoktur ve bildirim sesi bir DOSYA ADIdir: uygulama paketinde
 * ya da `Library/Sounds` altinda olmalidir (`UNNotificationSound` iki yere de bakar). Bu
 * yuzden belge secicinin uygulama onbellegine kopyaladigi dosya burada:
 *
 *   1. DOGRULANIR — okunabilir mi, <= 20 MB mi (Android ile ayni sinir ve metin), ses olarak acilabiliyor mu (AVAudioFile:
 *      MP3, M4A/AAC, WAV, AIFF, CAF, FLAC...), en az 0,2 sn mi.
 *   2. DONUSTURULUR — dogrusal PCM, 16 bit, 44,1 kHz, MONO CAF (Apple'in bildirim sesi
 *      icin belgeledigi bicim). `AVAssetExportSession` KULLANILMAZ: LPCM CAF uretemez,
 *      urettigi AAC/M4A ise bildirim sesi olarak desteklenmez.
 *   3. KIRPILIR — en fazla 29,5 sn; kirpilan seste son 0,5 sn yumusak sonum. iOS 30 sn'yi
 *      asan sesi KIRPMAZ, onun yerine SISTEMIN varsayilan sesini calar (Apple
 *      `UNNotificationSound` belgesi) → kirpmasaydik kullanici kendi sesini HIC duymazdi.
 *   4. ATOMIK YAZILIR — once gecici dosya, sonra `moveItem` (yarim dosya asla gorunmez).
 *
 * AD = ICERIGIN OZETI (`kullanici_ses_<sha256-8>.caf`): ayni dosya ikinci kez eklenirse
 * ayni ad cikar ve dosya yeniden kullanilir (Android `SesIceAktarici` ikizi). Onek anons
 * klipleriyle (`muhafiz_anons_`) CAKISMAZ: anons copcusu yalniz kendi onekine dokunur.
 *
 * YEDEKLEMEDEN HARIC DEGIL (anons kliplerinin aksine): kullanicinin dosyasi yeniden
 * uretilemez. Gorunen adlar `UserDefaults`'tadir (eklenme sirasiyla).
 *
 * JS kurali ikizi: `core/muhafiz/ios/paketSesleri.ts > kullaniciSesDosyasi`.
 */
enum SesIceAktarici {
    static let onek = "kullanici_ses_"
    static let enUzunSaniye: Double = 29.5
    static let enKisaSaniye: Double = 0.2
    static let enBuyukBayt: Int64 = 20 * 1024 * 1024
    static let ornekHizi: Double = 44_100
    static let sonumSaniye: Double = 0.5

    /// `[["dosya": ..., "ad": ...]]` — eklenme sirasiyla.
    private static let adlarAnahtari = "namazakisi_ice_aktarilan_sesler"

    /// Ad listesinin TEK kilidi: `adiKaydet` ice aktarma sirasinda, `liste`/`sil` modulun
    /// varsayilan kuyrugunda kosar; kilitsiz okuma-degistir-yaz birinin kaydini dusururdu.
    /// Kilitli bolumde yalniz `UserDefaults` + `fileExists` vardir (donusum disarida).
    private static let adlarKilidi = NSLock()

    /// `kullanici_ses_<8 kucuk onaltilik>.caf` — yol enjeksiyonuna karsi TEK kapi.
    static func adGecerli(_ ad: String) -> Bool {
        guard ad.hasPrefix(onek), ad.hasSuffix(".caf") else { return false }
        let govde = ad.dropFirst(onek.count).dropLast(".caf".count)
        return govde.count == 8 && govde.allSatisfy { $0.isASCII && $0.isHexDigit && !$0.isUppercase }
    }

    /// Bildirim sesinin arandigi dizin (`Library/Sounds`); yoksa olusturulur.
    static func seslerDizini() -> URL? {
        guard let library = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask).first else {
            return nil
        }
        let sounds = library.appendingPathComponent("Sounds", isDirectory: true)
        if !FileManager.default.fileExists(atPath: sounds.path) {
            try? FileManager.default.createDirectory(at: sounds, withIntermediateDirectories: true)
        }
        return sounds
    }

    /// Basari: `["dosya", "ad", "kirpildi"]`; hata: `["hata": bicim|boyut|erisim|yazilamadi]`.
    static func iceAktar(kaynakUri: String, gorunenAd: String) -> [String: Any] {
        guard let kaynak = URL(string: kaynakUri), kaynak.isFileURL else { return ["hata": "erisim"] }
        // Belge secicinin kopyasi kapsam istemez; dogrudan URL gelirse de calissin.
        let kapsam = kaynak.startAccessingSecurityScopedResource()
        defer { if kapsam { kaynak.stopAccessingSecurityScopedResource() } }

        let fm = FileManager.default
        guard let nitelik = try? fm.attributesOfItem(atPath: kaynak.path),
              let boyut = (nitelik[.size] as? NSNumber)?.int64Value, boyut > 0
        else { return ["hata": "erisim"] }
        if boyut > enBuyukBayt { return ["hata": "boyut"] }

        let girdi: AVAudioFile
        do {
            girdi = try AVAudioFile(forReading: kaynak)
        } catch {
            return ["hata": "bicim"]
        }
        let dosyaHizi = girdi.fileFormat.sampleRate
        guard dosyaHizi > 0, girdi.length > 0 else { return ["hata": "bicim"] }
        let saniye = Double(girdi.length) / dosyaHizi
        if saniye < enKisaSaniye { return ["hata": "bicim"] }
        let kirpildi = saniye > enUzunSaniye

        guard let ozet = icerikOzeti(kaynak) else { return ["hata": "erisim"] }
        guard let dizin = seslerDizini() else { return ["hata": "yazilamadi"] }
        let dosyaAdi = "\(onek)\(ozet).caf"
        let hedef = dizin.appendingPathComponent(dosyaAdi)
        let ad = adiTemizle(gorunenAd)

        // Ayni icerik zaten eklenmis: yeniden kullan (yalniz gorunen ad tazelenir).
        if fm.fileExists(atPath: hedef.path) {
            adiKaydet(dosya: dosyaAdi, ad: ad)
            return ["dosya": dosyaAdi, "ad": ad, "kirpildi": kirpildi]
        }

        // Gecici ad da `.caf` ile biter: AVAudioFile dosya turunu UZANTIDAN cikarir.
        let gecici = dizin.appendingPathComponent("\(onek)\(ozet).gecici.caf")
        try? fm.removeItem(at: gecici)
        guard donustur(girdi: girdi, gecici: gecici, kirp: kirpildi) else {
            try? fm.removeItem(at: gecici)
            return ["hata": "bicim"]
        }
        do {
            try fm.moveItem(at: gecici, to: hedef)
        } catch {
            try? fm.removeItem(at: gecici)
            return ["hata": "yazilamadi"]
        }
        adiKaydet(dosya: dosyaAdi, ad: ad)
        return ["dosya": dosyaAdi, "ad": ad, "kirpildi": kirpildi]
    }

    /// Diskte duran kayitli sesler (eklenme sirasiyla); dosyasi silinmis kayit temizlenir.
    static func liste() -> [[String: String]] {
        guard let dizin = seslerDizini() else { return [] }
        let fm = FileManager.default
        adlarKilidi.lock()
        defer { adlarKilidi.unlock() }
        let mevcut = kayitlar()
        let canli = mevcut.filter { kayit in
            guard let dosya = kayit["dosya"], adGecerli(dosya) else { return false }
            return fm.fileExists(atPath: dizin.appendingPathComponent(dosya).path)
        }
        if canli.count != mevcut.count {
            UserDefaults.standard.set(canli, forKey: adlarAnahtari)
        }
        return canli
    }

    /// Yalniz kendi adlarimizi siler; dosya artik yoksa `true`.
    static func sil(_ dosya: String) -> Bool {
        guard adGecerli(dosya), let dizin = seslerDizini() else { return false }
        let url = dizin.appendingPathComponent(dosya)
        adlarKilidi.lock()
        defer { adlarKilidi.unlock() }
        try? FileManager.default.removeItem(at: url)
        UserDefaults.standard.set(kayitlar().filter { $0["dosya"] != dosya }, forKey: adlarAnahtari)
        return !FileManager.default.fileExists(atPath: url.path)
    }

    /// Onizleme icin `file://` adresi; dosya yoksa nil.
    static func uri(_ dosya: String) -> String? {
        guard adGecerli(dosya), let dizin = seslerDizini() else { return nil }
        let url = dizin.appendingPathComponent(dosya)
        return FileManager.default.fileExists(atPath: url.path) ? url.absoluteString : nil
    }

    // MARK: - Donusum

    private static func donustur(girdi: AVAudioFile, gecici: URL, kirp: Bool) -> Bool {
        let kaynakBicim = girdi.processingFormat
        guard let hedefBicim = AVAudioFormat(
            commonFormat: .pcmFormatFloat32, sampleRate: ornekHizi, channels: 1, interleaved: false
        ), let donusturucu = AVAudioConverter(from: kaynakBicim, to: hedefBicim) else { return false }
        // Stereo → mono: kanallar KARISTIRILIR (yalniz sol kanal alinmaz).
        donusturucu.downmix = true

        // DISK bicimi Int16 LPCM; ISLEME bicimi Float32 (sonum carpimi icin). Donusumu
        // AVAudioFile yapar (`sentezleVeYaz`'daki `commonFormat:interleaved:` dersi).
        let ayarlar: [String: Any] = [
            AVFormatIDKey: kAudioFormatLinearPCM,
            AVSampleRateKey: ornekHizi,
            AVNumberOfChannelsKey: 1,
            AVLinearPCMBitDepthKey: 16,
            AVLinearPCMIsFloatKey: false,
            AVLinearPCMIsBigEndianKey: false,
        ]
        let cikti: AVAudioFile
        do {
            cikti = try AVAudioFile(
                forWriting: gecici, settings: ayarlar, commonFormat: .pcmFormatFloat32, interleaved: false
            )
        } catch {
            return false
        }

        let azami = AVAudioFramePosition(enUzunSaniye * ornekHizi)
        let sonumKare = AVAudioFramePosition(sonumSaniye * ornekHizi)
        let parca: AVAudioFrameCount = 8192
        guard let giris = AVAudioPCMBuffer(pcmFormat: kaynakBicim, frameCapacity: parca),
              let cikis = AVAudioPCMBuffer(pcmFormat: hedefBicim, frameCapacity: parca)
        else { return false }

        var girisBitti = false
        var yazilan: AVAudioFramePosition = 0
        while yazilan < azami {
            var hata: NSError?
            let durum = donusturucu.convert(to: cikis, error: &hata) { _, girisDurumu in
                if girisBitti {
                    girisDurumu.pointee = .endOfStream
                    return nil
                }
                do {
                    try girdi.read(into: giris, frameCount: parca)
                } catch {
                    girisBitti = true
                    girisDurumu.pointee = .endOfStream
                    return nil
                }
                if giris.frameLength == 0 {
                    girisBitti = true
                    girisDurumu.pointee = .endOfStream
                    return nil
                }
                girisDurumu.pointee = .haveData
                return giris
            }
            if durum == .error { return false }

            var kare = AVAudioFramePosition(cikis.frameLength)
            if kare == 0 { break }
            if yazilan + kare > azami {
                kare = azami - yazilan
                cikis.frameLength = AVAudioFrameCount(kare)
            }
            if kirp, let veri = cikis.floatChannelData?[0] {
                // Ortasindan kesilen ses "tik" diye bitmesin: son 0,5 sn dogrusal sonum.
                let sonumBasi = azami - sonumKare
                for i in 0..<Int(kare) {
                    let konum = yazilan + AVAudioFramePosition(i)
                    if konum >= sonumBasi {
                        veri[i] *= Float(azami - konum) / Float(sonumKare)
                    }
                }
            }
            do {
                try cikti.write(from: cikis)
            } catch {
                return false
            }
            yazilan += kare
            if durum == .endOfStream { break }
        }
        return yazilan > 0
    }

    // MARK: - Yardimcilar

    /// Icerigin SHA-256 ozetinin ilk 4 baytı (8 onaltilik) — parca parca okunur.
    private static func icerikOzeti(_ url: URL) -> String? {
        guard let tutamac = try? FileHandle(forReadingFrom: url) else { return nil }
        defer { try? tutamac.close() }
        var ozetleyici = SHA256()
        while true {
            let parca: Data
            do {
                parca = try tutamac.read(upToCount: 1 << 20) ?? Data()
            } catch {
                return nil
            }
            if parca.isEmpty { break }
            ozetleyici.update(data: parca)
        }
        return ozetleyici.finalize().prefix(4).map { String(format: "%02x", $0) }.joined()
    }

    /// YALNIZ `adlarKilidi` altinda cagrilir.
    private static func kayitlar() -> [[String: String]] {
        (UserDefaults.standard.array(forKey: adlarAnahtari) as? [[String: String]]) ?? []
    }

    private static func adiKaydet(dosya: String, ad: String) {
        adlarKilidi.lock()
        defer { adlarKilidi.unlock() }
        var liste = kayitlar().filter { $0["dosya"] != dosya }
        liste.append(["dosya": dosya, "ad": ad])
        UserDefaults.standard.set(liste, forKey: adlarAnahtari)
    }

    private static func adiTemizle(_ ham: String) -> String {
        String(ham.trimmingCharacters(in: .whitespacesAndNewlines).prefix(80))
    }
}
