import ExpoModulesCore
import AVFoundation

/**
 * MUHAFIZ SESLI ANONSU — iOS tarafi.
 *
 * Android'de sesli anons CALISMA ANINDA uretilir: exact alarm tetiklenir,
 * `AnonsKonusucu` o anda TTS ile konusur. iOS'ta BELIRLI BIR SAATTE ARKA PLANDA
 * KOD CALISTIRILAMAZ -> tetik aninda konusacak bir sey yoktur. Ses cikarmanin
 * tek yolu bildirimin SESIDIR ve o da onceden var olan bir dosya olmalidir.
 *
 * Bu modul metni ONCEDEN, cihazda, `AVSpeechSynthesizer.write` ile (CEVRIMDISI,
 * Apple'in kendi sesiyle) sentezleyip `Library/Sounds` altina yazar. Bildirim
 * dosyayi adiyla ister.
 *
 * TASARIM KURALLARI (hepsi yasanmis/ongorulmus tuzaklara karsi):
 *
 * 1. TURKCE SES YOKSA SENTEZLEME. `AVSpeechUtterance.voice` nil birakilirsa iOS
 *    Turkce metni BASKA DILDEKI varsayilan sesle okur. Android'deki
 *    "LANG_MISSING_DATA -> sessizce vazgec" kuralinin aynasi: hic uretme, JS
 *    tarafi varsayilan bildirim sesine dussun. Ingiliz aksaniyla Turkce
 *    okumaktansa cani calmak yegdir.
 *
 * 2. SENTEZLEYICIYI CANLI TUT. `write` callback tabanlidir; `AVSpeechSynthesizer`
 *    ornegi ARC tarafindan erken birakilirsa callback HIC gelmez ve promise
 *    sonsuza kadar asili kalir. Ornek alanda tutulur.
 *
 * 3. TEK SERI KUYRUK — VE KUYRUK SENTEZIN BITISINI BEKLER. Ekran debounce'u,
 *    acilis zinciri ve arka plan gorevi ayni anda sentez isteyebilir; iki yazici
 *    ayni dosyaya yazarsa BOZUK dosya olusur ve iOS onu calmayip SISTEM varsayilan
 *    sesine duser (sessiz sapma). `write` ANINDA doner ve sonucu callback'le
 *    verir; kuyruk beklemeseydi ikinci is birincinin `sentezleyici` alanini
 *    ezer, birinci sentezleyici ARC ile birakilir, callback'i HIC gelmez ve JS
 *    tarafindaki planlama SONSUZA KADAR asili kalirdi (kural 2'nin ikizi). Bu
 *    yuzden kuyruk bir semaforla bitisi bekler; ust sinir asilirsa `false`.
 *
 * 4. ATOMIK YAZIM. Once `.tmp` dosyaya yazilir, bitince `moveItem` ile yerine
 *    alinir. Yarim dosya asla `varMi = true` dondurmemeli.
 *
 * 5. 30 SANIYE SINIRI. iOS uzun bildirim sesini KIRPMAZ, dosyayi hic calmaz.
 *    Sure asilirsa dosya silinir ve `false` donulur.
 *
 * 6. YEDEKLEMEDEN HARIC. Klipler her an yeniden uretilebilir; iCloud'a
 *    yedeklenmeleri gereksiz (Apple veri saklama kilavuzu).
 *
 * 7. COP TOPLAMA AD KUMESINE DAYANIR, ZAMAN DAMGASINA DEGIL. Dosya
 *    `modificationDate` okumak iOS'ta *required-reason API*'dir
 *    (NSPrivacyAccessedAPICategoryFileTimestamp) ve PrivacyInfo beyani ister.
 */
public class ExpoMuhafizAnonsModule: Module {
    /// Kural 2: callback bitene kadar canli kalmali.
    private var sentezleyici: AVSpeechSynthesizer?

    /// On plan onizlemesi ("Dinle") icin ayri ornek — sentezle cakismasin.
    private var konusucu: AVSpeechSynthesizer?

    /// Kural 3: butun sentez isleri tek sirada.
    private let kuyruk = DispatchQueue(label: "muhafiz.anons.sentez")

    /// Tek klibin sentez ust siniri. 300 karakterlik metin ~20-25 sn konusmadir;
    /// dosyaya yazim gercek zamandan cok hizlidir, 20 sn cok comert bir tavandir.
    private static let sentezZamanAsimi: TimeInterval = 20

    public func definition() -> ModuleDefinition {
        Name("ExpoMuhafizAnons")

        /**
         * Cihazda kullanilabilir Turkce sesin tanimlayicisi; yoksa nil.
         *
         * JS tarafi bunu iki yerde kullanir: (a) hash girdisi — ses degisince
         * klip adlari da degismeli, yoksa kullanici gelismis sesi indirdigi
         * halde eski robotik klipleri duyar; (b) ekrandaki bilgilendirme bandi.
         */
        AsyncFunction("trSesTanimlayici") { () -> String? in
            return Self.turkceSesBul()?.identifier
        }

        /** Klip zaten uretilmis mi? */
        AsyncFunction("varMi") { (dosyaAdi: String) -> Bool in
            guard let url = Self.klipUrl(dosyaAdi) else { return false }
            return FileManager.default.fileExists(atPath: url.path)
        }

        /**
         * Metni sentezleyip `Library/Sounds/<dosyaAdi>` olarak yaz.
         *
         * Basarisizlikta FIRLATMAZ, `false` doner — sentez bir planlamayi asla
         * durdurmamali; cagiran varsayilan bildirim sesine duser.
         */
        AsyncFunction("sentezle") { (metin: String, dosyaAdi: String, promise: Promise) in
            self.kuyruk.async {
                let bitti = DispatchSemaphore(value: 0)
                let kilit = NSLock()
                var cozuldu = false
                // Promise TAM BIR KEZ cozulur: callback ya da zaman asimi.
                let coz: (Bool) -> Void = { basarili in
                    kilit.lock()
                    defer { kilit.unlock() }
                    if cozuldu { return }
                    cozuldu = true
                    promise.resolve(basarili)
                    bitti.signal()
                }

                self.sentezleVeYaz(metin: metin, dosyaAdi: dosyaAdi, bitince: coz)

                // Callback'ler `AVSpeechSynthesizer`in kendi thread'inden gelir, bu
                // kuyruktan DEGIL → burada beklemek kilitlenme yaratmaz.
                if bitti.wait(timeout: .now() + Self.sentezZamanAsimi) == .timedOut {
                    self.sentezleyici?.stopSpeaking(at: .immediate)
                    self.sentezleyici = nil
                    coz(false)
                }
            }
        }

        /**
         * Korunacaklar disindaki TUM anons kliplerini sil.
         *
         * Yalniz kendi onekimizi tasiyan dosyalara dokunur; kullanicinin ya da
         * baska bir bilesenin `Library/Sounds` altindaki dosyalari korunur.
         */
        AsyncFunction("kullanilmayanlariSil") { (korunacak: [String], onek: String) -> Int in
            return Self.temizle(korunacak: Set(korunacak), onek: onek)
        }

        /**
         * ON PLAN onizlemesi: dosyaya yazmadan dogrudan konus.
         *
         * "Dinle" butonu icin. Uygulama on plandayken iOS konusabilir; dosya
         * uretmeye gerek yok.
         */
        AsyncFunction("konus") { (metin: String) -> Bool in
            guard let ses = Self.turkceSesBul() else { return false }
            let utterance = AVSpeechUtterance(string: metin)
            utterance.voice = ses

            let sentez = AVSpeechSynthesizer()
            self.konusucu = sentez
            sentez.speak(utterance)
            return true
        }

        /** Calan onizlemeyi durdur (idempotent). */
        AsyncFunction("sustur") { () -> Void in
            self.konusucu?.stopSpeaking(at: .immediate)
        }
    }

    // MARK: - Sentez

    private func sentezleVeYaz(
        metin: String,
        dosyaAdi: String,
        bitince: @escaping (Bool) -> Void
    ) {
        // Kural 1: Turkce ses yoksa HIC uretme.
        guard let ses = Self.turkceSesBul() else {
            bitince(false)
            return
        }
        guard let hedef = Self.klipUrl(dosyaAdi) else {
            bitince(false)
            return
        }

        // Kural 4: once gecici dosya.
        let gecici = hedef.appendingPathExtension("tmp")
        try? FileManager.default.removeItem(at: gecici)

        let utterance = AVSpeechUtterance(string: metin)
        utterance.voice = ses

        var dosya: AVAudioFile?
        var toplamFrame: AVAudioFramePosition = 0
        var hata = false
        var bitti = false

        let sentez = AVSpeechSynthesizer()
        self.sentezleyici = sentez // Kural 2

        sentez.write(utterance) { [weak self] buffer in
            guard !bitti else { return }
            guard let pcm = buffer as? AVAudioPCMBuffer else { return }

            // Son cagri frameLength == 0 ile gelir.
            if pcm.frameLength == 0 {
                bitti = true
                dosya = nil // dosyayi kapat (ARC)
                self?.sentezleyici = nil
                Self.tamamla(
                    gecici: gecici,
                    hedef: hedef,
                    toplamFrame: toplamFrame,
                    ornekHizi: pcm.format.sampleRate,
                    hata: hata,
                    bitince: bitince
                )
                return
            }

            do {
                if dosya == nil {
                    // Bildirim sesi LINEAR PCM ister. Sentezci Float32 uretir;
                    // AVAudioFile'i Int16 ayarlariyla acinca donusumu kendisi
                    // yapar. Float32'yi dogrudan yazmak calismayabilir.
                    let ayarlar: [String: Any] = [
                        AVFormatIDKey: kAudioFormatLinearPCM,
                        AVSampleRateKey: pcm.format.sampleRate,
                        AVNumberOfChannelsKey: 1,
                        AVLinearPCMBitDepthKey: 16,
                        AVLinearPCMIsFloatKey: false,
                        AVLinearPCMIsBigEndianKey: false
                    ]
                    // ISLEME bicimi buffer'inkiyle AYNI olmali: `write(from:)`
                    // bicim uyusmazliginda hata verir. Varsayilan kurucu Float32
                    // isleme bicimi kurar; bazi Turkce sesler Int16 buffer uretir.
                    // Dosyanin DISK bicimi yine `ayarlar` (Int16 LinearPCM) olur,
                    // donusumu AVAudioFile yapar.
                    dosya = try AVAudioFile(
                        forWriting: gecici,
                        settings: ayarlar,
                        commonFormat: pcm.format.commonFormat,
                        interleaved: pcm.format.isInterleaved
                    )
                }
                try dosya?.write(from: pcm)
                toplamFrame += AVAudioFramePosition(pcm.frameLength)
            } catch {
                hata = true
            }
        }
    }

    private static func tamamla(
        gecici: URL,
        hedef: URL,
        toplamFrame: AVAudioFramePosition,
        ornekHizi: Double,
        hata: Bool,
        bitince: @escaping (Bool) -> Void
    ) {
        let fm = FileManager.default

        func vazgec() {
            try? fm.removeItem(at: gecici)
            bitince(false)
        }

        if hata || toplamFrame == 0 {
            vazgec()
            return
        }

        // Kural 5: 30 sn'yi asan dosyayi iOS HIC calmaz -> uretme.
        let saniye = ornekHizi > 0 ? Double(toplamFrame) / ornekHizi : 0
        if saniye > 29.5 {
            vazgec()
            return
        }

        do {
            try? fm.removeItem(at: hedef)
            try fm.moveItem(at: gecici, to: hedef) // Kural 4: atomik yerine koyma

            // Kural 6: yeniden uretilebilir veri, yedeklemeye girmesin.
            var kaynak = hedef
            var degerler = URLResourceValues()
            degerler.isExcludedFromBackup = true
            try? kaynak.setResourceValues(degerler)

            bitince(true)
        } catch {
            vazgec()
        }
    }

    // MARK: - Yardimcilar

    /**
     * Cihazdaki Turkce sesi bul.
     *
     * Birden cok varsa GELISMIS (enhanced/premium) olani yegle: kullanici onu
     * indirdiyse duymak istedigi odur.
     */
    private static func turkceSesBul() -> AVSpeechSynthesisVoice? {
        let turkceler = AVSpeechSynthesisVoice.speechVoices().filter {
            $0.language.hasPrefix("tr")
        }
        if turkceler.isEmpty { return nil }

        if #available(iOS 16.0, *) {
            if let gelismis = turkceler.first(where: { $0.quality == .premium })
                ?? turkceler.first(where: { $0.quality == .enhanced }) {
                return gelismis
            }
        }
        return turkceler.first
    }

    /** `Library/Sounds/<dosyaAdi>` — bildirim sesinin okundugu dizin. */
    private static func klipUrl(_ dosyaAdi: String) -> URL? {
        // Yol enjeksiyonuna karsi: ad yalniz dosya adi olmali.
        guard !dosyaAdi.isEmpty, !dosyaAdi.contains("/"), !dosyaAdi.contains("..") else {
            return nil
        }
        guard let library = FileManager.default.urls(
            for: .libraryDirectory, in: .userDomainMask
        ).first else { return nil }

        let sounds = library.appendingPathComponent("Sounds", isDirectory: true)
        if !FileManager.default.fileExists(atPath: sounds.path) {
            try? FileManager.default.createDirectory(
                at: sounds, withIntermediateDirectories: true
            )
        }
        return sounds.appendingPathComponent(dosyaAdi)
    }

    /**
     * Kural 7: ad kumesine gore temizlik — zaman damgasi OKUNMAZ.
     *
     * Yarim kalmis `.tmp` dosyalari da suprulur.
     */
    private static func temizle(korunacak: Set<String>, onek: String) -> Int {
        guard let library = FileManager.default.urls(
            for: .libraryDirectory, in: .userDomainMask
        ).first else { return 0 }

        let sounds = library.appendingPathComponent("Sounds", isDirectory: true)
        guard let icerik = try? FileManager.default.contentsOfDirectory(
            atPath: sounds.path
        ) else { return 0 }

        var silinen = 0
        for ad in icerik {
            // YALNIZ kendi dosyalarimiz.
            guard ad.hasPrefix(onek) else { continue }
            if korunacak.contains(ad) { continue }
            try? FileManager.default.removeItem(
                at: sounds.appendingPathComponent(ad)
            )
            silinen += 1
        }
        return silinen
    }
}
