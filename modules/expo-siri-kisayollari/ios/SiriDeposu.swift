import Foundation

/**
 * SIRI / KISAYOLLAR / WIDGET PAYLASILAN DEPOSU (issue #279, #295) — yalniz Foundation.
 *
 * App Intents ANA UYGULAMA HEDEFINDE derlenir (bkz. `plugins/withSiriKisayollari.js`);
 * intent'ler ile JS koprusu (`ExpoSiriKisayollariModule`) AYNI SURECTE calisir.
 * iOS widget uzantisi (#295, `plugins/withNamazWidget.js`) ise AYRI bir surectir ve bu
 * dosyanin KOPYASINI derler → veri App Group suite'inde (`ortakGrup`) durur.
 *
 * DEPO SECIMI CALISMA ANINDA: App Group kapsayicisi erisilebilirse (entitlement var)
 * suite kullanilir ve standart depodaki eski anahtarlar BIR KEZ kopyalanir; yoksa
 * (widget bayragi kapali build) eskisi gibi `UserDefaults.standard`. Boylece bayrak
 * acildiginda Siri kuyrugu/odak kaybolmaz ve bayrak kapaliyken hicbir sey degismez.
 *
 * TEK YAZICI kurali: her anahtari tek taraf yazar.
 *   - cizelge, kilinanlar        → JS (WidgetServisi yuku)
 *   - kildimKuyrugu              → intent/widget dugmesi EKLER, JS (bu sinif uzerinden) DUSER —
 *                                  widget dugmesi `LiveActivityIntent`'tir, UYGULAMA
 *                                  surecinde calisir → ayni kilit, kayip yazim olmaz
 *   - odak, ekranIstegi          → intent yazar, JS okur/tuketir (yine ayni kilit)
 *
 * Her degisiklik `degisiklikBildirimi` ile duyurulur; uygulama aciksa kopru bunu JS
 * olayina cevirir (`onSiriDegisikligi`), kapaliysa JS acilista okur.
 */
public final class SiriDeposu: @unchecked Sendable {
    public static let degisiklikBildirimi = Notification.Name("NamazAkisiSiriDegisikligi")

    /// App Group (widget uzantisi ile paylasim, #295). Entitlement yoksa kullanilmaz.
    public static let ortakGrup = "group.com.furkanisikay.namazakisi"

    /// Varsayilan depo: App Group erisilebilirse suite (bir kerelik goc ile), yoksa
    /// uygulamanin kendi `UserDefaults`'u.
    public static let varsayilan: SiriDeposu = SiriDeposu(defaults: varsayilanDefaults())

    /// Gocun tamamlandigini gosteren isaret (suite icinde).
    static let gocIsareti = "namazakisi.siri.gocYapildi"

    private static func varsayilanDefaults() -> UserDefaults {
        #if canImport(Darwin)
        if FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: ortakGrup) != nil,
           let ortak = UserDefaults(suiteName: ortakGrup) {
            // Goc YALNIZ uygulama surecinde: uzanti (.appex) kendi bos standart deposundan
            // "goc" yapip isareti koysaydi uygulamanin gercek verisi hic tasinmazdi.
            if Bundle.main.bundleURL.pathExtension != "appex" {
                gocEt(kaynak: .standard, hedef: ortak)
            }
            return ortak
        }
        #endif
        return .standard
    }

    /// Standart depodaki anahtarlari suite'e BIR KEZ kopyalar. Hedefte zaten olan anahtara
    /// dokunmaz (uzanti ya da onceki surum yazmis olabilir). Idempotenttir.
    ///
    /// Tasinan OLAY anahtarlari (`Anahtar.olaylar`: Kildim kuyrugu, ekran istegi, odak)
    /// kaynaktan SILINIR: depo bir gun yeniden `.standard`'a duserse (bayrak kapandi,
    /// profil App Group'suz) bayat kuyruk yeniden islenir ve kullanicinin geri aldigi vakit
    /// tekrar "kilindi" olurdu. Cizelge/kilinanlar KALIR (JS her acilista yeniden yazar,
    /// bayat kopya zararsizdir).
    public static func gocEt(kaynak: UserDefaults, hedef: UserDefaults) {
        if hedef.bool(forKey: gocIsareti) { return }
        for anahtar in Anahtar.hepsi where hedef.object(forKey: anahtar) == nil {
            if let deger = kaynak.object(forKey: anahtar) {
                hedef.set(deger, forKey: anahtar)
            }
        }
        hedef.set(true, forKey: gocIsareti)
        for anahtar in Anahtar.olaylar {
            kaynak.removeObject(forKey: anahtar)
        }
    }

    enum Anahtar {
        static let cizelge = "namazakisi.siri.cizelge"
        static let kilinanlar = "namazakisi.siri.kilinanlar"
        static let kuyruk = "namazakisi.siri.kildimKuyrugu"
        static let odak = "namazakisi.siri.odak"
        static let ekranIstegi = "namazakisi.siri.ekranIstegi"
        /// Apple Watch sessiz uyandirma cevaplari (#285 cilasi): kimlik → {islem, sonMs}.
        static let saatUyandirma = "namazakisi.siri.saatUyandirma"
        /// Saatte basilan teheccud "Kildim"lari (farz kuyruguna ASLA girmez), JS TUKETIR.
        static let saatNafileKildim = "namazakisi.siri.saatNafileKildim"
        static let hepsi = [cizelge, kilinanlar, kuyruk, odak, ekranIstegi, saatUyandirma, saatNafileKildim]
        /// Intent'in yazip JS'in TUKETTIGI anahtarlar: goc sonrasi kaynakta birakilmaz.
        static let olaylar = [kuyruk, odak, ekranIstegi, saatNafileKildim]
    }

    /// Zehirli oge esigi — Android `KildimKuyrugu` ile ayni (5 deneme).
    public static let azamiDeneme = 5
    /// Kuyruk ust siniri: en eskiler duser (kullanici uygulamayi aylarca acmasa da sismez).
    public static let azamiKuyruk = 50
    /// Ekran istegi (ör. Kible) bu sureden eskiyse yok sayilir.
    public static let ekranIstegiTazelikMs: Int64 = 120_000

    public struct KuyrukOgesi: Codable, Equatable {
        public let id: String
        public let tarih: String
        /// KAYIT vakit kodu (`imsak`, `ogle`...). Kuyruk `sabah`'i reddeder (AGENTS.md).
        public let vakit: String
        public let kaynak: String
        public let ms: Int64
        public var deneme: Int
    }

    private let defaults: UserDefaults
    private let kilit = NSLock()

    public init(defaults: UserDefaults) {
        self.defaults = defaults
    }

    // MARK: - JS yazar (WidgetServisi yuku)

    public func cizelgeyiYaz(_ json: String) {
        kilitli { defaults.set(json, forKey: Anahtar.cizelge) }
    }

    public func kilinanlariYaz(_ json: String) {
        kilitli { defaults.set(json, forKey: Anahtar.kilinanlar) }
    }

    // MARK: - Arayuz dili (JS yazar; uygulama, widget ve saat koprusu okur)

    /// Arayuz dili anahtari (dil kodu: "tr", "en"). Sesli okuma dilinden AYRIDIR
    /// (`namazakisi_anons_dil`, standart depo): ses motoru baska dile dusebilir.
    public static let arayuzDiliAnahtari = "namazakisi_dil_kod"

    public func arayuzDiliniYaz(_ kod: String) {
        kilitli { defaults.set(kod, forKey: Self.arayuzDiliAnahtari) }
    }

    /// Kayitli arayuz dili; uygulama hic acilmadiysa (JS yazmadi) Turkce.
    public func arayuzDili() -> String {
        kilitli { defaults.string(forKey: Self.arayuzDiliAnahtari) ?? "tr" }
    }

    public func cizelge() -> SiriCizelge? {
        guard let ham = kilitli({ defaults.string(forKey: Anahtar.cizelge) }),
              let veri = ham.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(SiriCizelge.self, from: veri)
    }

    public func kilinanlar() -> [String: [String]] {
        guard let ham = kilitli({ defaults.string(forKey: Anahtar.kilinanlar) }),
              let veri = ham.data(using: .utf8),
              let sozluk = try? JSONDecoder().decode([String: [String]].self, from: veri) else { return [:] }
        return sozluk
    }

    // MARK: - Kildim kuyrugu

    private func kuyrukOku() -> [KuyrukOgesi] {
        guard let ham = defaults.string(forKey: Anahtar.kuyruk),
              let veri = ham.data(using: .utf8),
              let liste = try? JSONDecoder().decode([KuyrukOgesi].self, from: veri) else { return [] }
        return liste
    }

    private func kuyrukYaz(_ liste: [KuyrukOgesi]) {
        guard let veri = try? JSONEncoder().encode(liste), let ham = String(data: veri, encoding: .utf8) else { return }
        defaults.set(ham, forKey: Anahtar.kuyruk)
    }

    public func bekleyenler() -> [SiriBekleyenKildim] {
        return kilitli { kuyrukOku().map { SiriBekleyenKildim(tarih: $0.tarih, vakit: $0.vakit) } }
    }

    /// Cihaz agindan (tablet <-> telefon) gelen "Kildim"in kaynagi. Android
    /// `KildimKuyruguKurallari.KAYNAK_CIHAZ` ile ayni; ortak fikstur
    /// `android/app/src/test/resources/kildim-kaynaklari.json` (Swift testi bunu okur).
    public static let cihazKaynagi = "cihaz"

    /// Intent: "Kildim" ekler. Ayni tarih + vakit zaten bekliyorsa ikinci kez eklemez.
    @discardableResult
    public func kildimEkle(tarih: String, vakit: String, kaynak: String, simdiMs: Int64) -> Bool {
        let eklendi: Bool = kilitli {
            var liste = kuyrukOku()
            if liste.contains(where: { $0.tarih == tarih && $0.vakit == vakit }) { return false }
            liste.append(KuyrukOgesi(id: UUID().uuidString, tarih: tarih, vakit: vakit, kaynak: kaynak, ms: simdiMs, deneme: 0))
            if liste.count > Self.azamiKuyruk { liste.removeFirst(liste.count - Self.azamiKuyruk) }
            kuyrukYaz(liste)
            return true
        }
        if eklendi { duyur("kildim") }
        return eklendi
    }

    /// JS: bekleyenlerin JSON'u (Android `KildimKuyrugu.bekleyenleriAl` ile ayni sekil).
    public func bekleyenleriJson() -> String {
        let liste = kilitli { kuyrukOku() }
        guard let veri = try? JSONEncoder().encode(liste), let ham = String(data: veri, encoding: .utf8) else { return "[]" }
        return ham
    }

    public func tamamlandi(_ id: String) {
        kilitli { kuyrukYaz(kuyrukOku().filter { $0.id != id }) }
    }

    /// Basarisiz deneme: sayaci artirir, esige ulasan (zehirli) ogeyi duser.
    public func basarisiz(_ id: String) {
        kilitli {
            var liste = kuyrukOku()
            guard let i = liste.firstIndex(where: { $0.id == id }) else { return }
            liste[i].deneme += 1
            if liste[i].deneme >= Self.azamiDeneme { liste.remove(at: i) }
            kuyrukYaz(liste)
        }
    }

    // MARK: - Odak filtresi

    /// Intent: Odak filtresinin son durumu (`src/core/muhafiz/ios/odakFiltresi.ts` okur).
    public func odakYaz(sessiz: Bool, simdiMs: Int64) {
        let ham = "{\"sessiz\":\(sessiz ? "true" : "false"),\"ms\":\(simdiMs)}"
        kilitli { defaults.set(ham, forKey: Anahtar.odak) }
        duyur("odak")
    }

    public func odakJson() -> String? {
        return kilitli { defaults.string(forKey: Anahtar.odak) }
    }

    // MARK: - Ekran istegi (ör. "Kibleyi ac")

    private struct EkranIstegi: Codable {
        let ekran: String
        let ms: Int64
    }

    /// Intent: uygulama acilinca gosterilecek ekran. JS hazir degilse (soguk acilis)
    /// acilista, hazirsa olayla tuketir.
    public func ekranIstegiYaz(_ ekran: String, simdiMs: Int64) {
        guard let veri = try? JSONEncoder().encode(EkranIstegi(ekran: ekran, ms: simdiMs)),
              let ham = String(data: veri, encoding: .utf8) else { return }
        kilitli { defaults.set(ham, forKey: Anahtar.ekranIstegi) }
        duyur("ekran")
    }

    /// JS: istegi TUKETIR (bir kez doner). Bayat istek yok sayilir.
    public func ekranIstegiAl(simdiMs: Int64) -> String? {
        let ham: String? = kilitli {
            let deger = defaults.string(forKey: Anahtar.ekranIstegi)
            if deger != nil { defaults.removeObject(forKey: Anahtar.ekranIstegi) }
            return deger
        }
        guard let ham, let veri = ham.data(using: .utf8),
              let istek = try? JSONDecoder().decode(EkranIstegi.self, from: veri) else { return nil }
        let yas = simdiMs - istek.ms
        return (yas >= -5_000 && yas <= Self.ekranIstegiTazelikMs) ? istek.ekran : nil
    }

    // MARK: - Apple Watch sessiz uyandirma (#285 cilasi, Android `SaatUyandirmaDeposu` ikizi)

    private struct SaatUyandirmaKaydi: Codable, Equatable {
        let islem: String
        let sonMs: Int64
    }

    /// Kayit, uyandirmanin anlamini yitirdigi andan bu kadar sonra budanir.
    public static let saatUyandirmaOmruMs: Int64 = 24 * 3_600_000

    private func saatUyandirmaOku() -> [String: SaatUyandirmaKaydi] {
        guard let ham = defaults.string(forKey: Anahtar.saatUyandirma),
              let veri = ham.data(using: .utf8),
              let sozluk = try? JSONDecoder().decode([String: SaatUyandirmaKaydi].self, from: veri) else { return [:] }
        return sozluk
    }

    private func saatUyandirmaYazHam(_ sozluk: [String: SaatUyandirmaKaydi]) {
        guard let veri = try? JSONEncoder().encode(sozluk), let ham = String(data: veri, encoding: .utf8) else { return }
        defaults.set(ham, forKey: Anahtar.saatUyandirma)
    }

    /**
     * Saat bir uyandirmayi kapatti (ya da Kildim dedi): telefonun YEDEGI artik kurulmaz.
     * Planlama turu (`LocalSaatAyarlariServisi.teslimBaglaminiOku`) bu kaydi okur ve
     * `uyandirmaTelefonMs` null doner. Bayat kayitlar (`sonMs` + 1 gun) budanir.
     */
    public func saatUyandirmaYaz(id: String, sonMs: Int64, simdiMs: Int64) {
        kilitli {
            var sozluk = saatUyandirmaOku().filter { simdiMs - $0.value.sonMs <= Self.saatUyandirmaOmruMs }
            sozluk[id] = SaatUyandirmaKaydi(islem: "kapat", sonMs: sonMs)
            saatUyandirmaYazHam(sozluk)
        }
    }

    /// JS: `{kimlik: {"islem":"kapat"}}` (Android `saatUyandirmaDurumlari` ile ayni bicim).
    public func saatUyandirmaJson(simdiMs: Int64) -> String {
        let sozluk = kilitli { saatUyandirmaOku().filter { simdiMs - $0.value.sonMs <= Self.saatUyandirmaOmruMs } }
        var sade: [String: [String: String]] = [:]
        for (id, k) in sozluk { sade[id] = ["islem": k.islem] }
        guard let veri = try? JSONEncoder().encode(sade), let ham = String(data: veri, encoding: .utf8) else { return "{}" }
        return ham
    }

    private struct SaatNafileKildim: Codable, Equatable {
        let tarih: String
        let tur: String
    }

    public func saatNafileKildimEkle(tarih: String, tur: String) {
        kilitli {
            var liste: [SaatNafileKildim] = []
            if let ham = defaults.string(forKey: Anahtar.saatNafileKildim), let veri = ham.data(using: .utf8),
               let eski = try? JSONDecoder().decode([SaatNafileKildim].self, from: veri) {
                liste = eski
            }
            let yeni = SaatNafileKildim(tarih: tarih, tur: tur)
            if !liste.contains(yeni) { liste.append(yeni) }
            if liste.count > Self.azamiKuyruk { liste.removeFirst(liste.count - Self.azamiKuyruk) }
            if let veri = try? JSONEncoder().encode(liste), let ham = String(data: veri, encoding: .utf8) {
                defaults.set(ham, forKey: Anahtar.saatNafileKildim)
            }
        }
    }

    /// JS: teheccud Kildim'larini TUKETIR (`[{tarih,tur}]`).
    public func saatNafileKildimleriniAl() -> String {
        return kilitli {
            let ham = defaults.string(forKey: Anahtar.saatNafileKildim) ?? "[]"
            defaults.removeObject(forKey: Anahtar.saatNafileKildim)
            return ham
        }
    }

    /// Saatten gelen uyandirma cevabi uygulama acikken JS'e duyurulur (yeniden planlama).
    public func saatUyandirmaDuyur() {
        duyur("saatUyandirma")
    }

    // MARK: - Intent yardimcilari (cihaz saati ve takvimiyle)

    /// Cihazin TAKVIM gunu (ISO). "yarin" karari vaktin namaz gunuyle karsilastirilir.
    public static func bugunIso(_ tarih: Date = Date(), saatDilimi: TimeZone = .current) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = saatDilimi
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: tarih)
    }

    /// `HH:mm` (24 saat). Hal eki EKLENMEZ — cumle "saat 15:42" der.
    public static func saatBicimleyici(_ saatDilimi: TimeZone = .current) -> (Int64) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = saatDilimi
        f.dateFormat = "HH:mm"
        return { ms in f.string(from: Date(timeIntervalSince1970: TimeInterval(ms) / 1000)) }
    }

    public static func simdiMs(_ tarih: Date = Date()) -> Int64 {
        return Int64((tarih.timeIntervalSince1970 * 1000).rounded())
    }

    // MARK: - Ic

    private func duyur(_ tur: String) {
        NotificationCenter.default.post(name: Self.degisiklikBildirimi, object: nil, userInfo: ["tur": tur])
    }

    private func kilitli<T>(_ blok: () -> T) -> T {
        kilit.lock()
        defer { kilit.unlock() }
        return blok()
    }
}
