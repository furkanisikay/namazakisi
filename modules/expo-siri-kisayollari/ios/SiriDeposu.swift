import Foundation

/**
 * SIRI / KISAYOLLAR PAYLASILAN DEPOSU (issue #279) — yalniz Foundation.
 *
 * App Intents ANA UYGULAMA HEDEFINDE derlenir (uzanti degil; bkz.
 * `plugins/withSiriKisayollari.js`) → intent'ler ile JS koprusu (`ExpoSiriKisayollariModule`)
 * AYNI SURECTE calisir ve ayni `UserDefaults.standard`'i paylasir. Bu yuzden App
 * Group GEREKMEZ (eklemek EAS'in etkilesimsiz build'inde imza profilini
 * yeniden uretmeyi gerektirirdi). Ileride bir iOS widget'i / uzanti gelirse
 * `varsayilan` App Group suite'ine tasinir ve anahtarlar bir kez kopyalanir.
 *
 * TEK YAZICI kurali: her anahtari tek taraf yazar.
 *   - cizelge, kilinanlar        → JS (WidgetServisi yuku)
 *   - kildimKuyrugu              → intent EKLER, JS (bu sinif uzerinden) DUSER — ikisi de
 *                                  AYNI kilitten gecer (ayni surec), kayip yazim olmaz
 *   - odak, ekranIstegi          → intent yazar, JS okur/tuketir (yine ayni kilit)
 *
 * Her degisiklik `degisiklikBildirimi` ile duyurulur; uygulama aciksa kopru bunu JS
 * olayina cevirir (`onSiriDegisikligi`), kapaliysa JS acilista okur.
 */
public final class SiriDeposu: @unchecked Sendable {
    public static let degisiklikBildirimi = Notification.Name("NamazAkisiSiriDegisikligi")

    /// Varsayilan depo: uygulamanin kendi `UserDefaults`'u.
    public static let varsayilan = SiriDeposu(defaults: .standard)

    enum Anahtar {
        static let cizelge = "namazakisi.siri.cizelge"
        static let kilinanlar = "namazakisi.siri.kilinanlar"
        static let kuyruk = "namazakisi.siri.kildimKuyrugu"
        static let odak = "namazakisi.siri.odak"
        static let ekranIstegi = "namazakisi.siri.ekranIstegi"
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
