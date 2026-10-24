import Foundation

/**
 * APPLE WATCH YEREL DEPOSU (issue #285) — yalniz Foundation.
 *
 * Saat uygulamasi ile komplikasyon uzantisi AYRI sureclerdir → veri saatin App Group
 * suite'inde durur (`group.com.furkanisikay.namazakisi`; telefondakiyle ayni KIMLIK,
 * ama kapsayici cihaza ozgudur — telefonla paylasim WatchConnectivity'dendir). Entitlement
 * yoksa (imzasiz simulator) `UserDefaults.standard`'a duser.
 *
 * TEK YAZICI: yuk ve bekleyenler yalniz saat uygulamasi (`SaatBaglantisi`) tarafindan
 * yazilir; komplikasyon yalniz OKUR.
 */
public final class SaatDeposu: @unchecked Sendable {
    public static let ortakGrup = "group.com.furkanisikay.namazakisi"

    public static let varsayilan = SaatDeposu(defaults: UserDefaults(suiteName: ortakGrup) ?? .standard)

    enum Anahtar {
        static let yuk = "namazakisi.saat.yuk"
        static let surumYeni = "namazakisi.saat.surumYeni"
        static let bekleyenler = "namazakisi.saat.bekleyenler"
        static let tesbihatToplam = "namazakisi.saat.tesbihat.toplam"
        static let tesbihatMs = "namazakisi.saat.tesbihat.ms"
        static let kapatilanUyandirma = "namazakisi.saat.uyandirma.kapatilan"
        static let dil = "namazakisi.saat.dil"
    }

    private let defaults: UserDefaults
    private let kilit = NSLock()

    public init(defaults: UserDefaults) {
        self.defaults = defaults
    }

    // MARK: - Yuk

    /**
     * Telefondan gelen yuku isler. Yalniz GECERLI yuk saklanir; daha yeni bir sema
     * gelirse eski veri korunur ve "guncelleyin" isareti konur (Kotlin `SurumYeni`).
     * - Returns: gosterilecek bir sey degisti mi
     */
    @discardableResult
    public func yeniYukuIsle(_ json: String, simdiMs: Int64) -> Bool {
        switch SaatYukCozucu.coz(json) {
        case .basarili(let yuk):
            return kilitli {
                let degisti = defaults.string(forKey: Anahtar.yuk) != json || defaults.bool(forKey: Anahtar.surumYeni)
                defaults.set(json, forKey: Anahtar.yuk)
                defaults.set(false, forKey: Anahtar.surumYeni)
                let eski = bekleyenleriOku()
                let suzulmus = SaatKarari.bekleyenleriSuz(eski, yuk: yuk, simdiMs: simdiMs)
                if suzulmus != eski { bekleyenleriYaz(suzulmus) }
                return degisti || suzulmus != eski
            }
        case .surumYeni:
            return kilitli {
                let onceki = defaults.bool(forKey: Anahtar.surumYeni)
                defaults.set(true, forKey: Anahtar.surumYeni)
                return !onceki
            }
        case .gecersiz:
            return false
        }
    }

    public func yuk() -> SaatYuku? {
        let ham: String? = kilitli { defaults.string(forKey: Anahtar.yuk) }
        if case .basarili(let y) = SaatYukCozucu.coz(ham) { return y }
        return nil
    }

    /// Telefon saatin anlamadigi yeni bir sema gonderdi mi? (saatteki uygulama guncellenmeli)
    public func surumYeniMi() -> Bool {
        return kilitli { defaults.bool(forKey: Anahtar.surumYeni) }
    }

    // MARK: - Arayuz dili (W5)

    /**
     * Telefonun arayuz dili (`SaatIletisi.dil`, yukun kardesi). Saat uygulamasi yazar,
     * komplikasyon da okur; metinler CIZIM aninda bu koddan secilir.
     * - Returns: kayitli dil degisti mi (degistiyse gorunumler yeniden cizilmeli)
     */
    @discardableResult
    public func diliYaz(_ kod: String) -> Bool {
        let yeni = ArayuzDili.coz(kod)
        return kilitli {
            let degisti = defaults.string(forKey: Anahtar.dil) != yeni
            if degisti { defaults.set(yeni, forKey: Anahtar.dil) }
            return degisti
        }
    }

    /// Kayitli arayuz dili; telefon hic gondermediyse (eski telefon) Turkce.
    public func dil() -> String {
        return ArayuzDili.coz(kilitli { defaults.string(forKey: Anahtar.dil) })
    }

    // MARK: - Iyimser "Kildim"

    public func bekleyenler() -> [SaatBekleyen] {
        return kilitli { bekleyenleriOku() }
    }

    /// Ayni tarih + vakit zaten bekliyorsa ikinci kez eklenmez.
    public func bekleyenEkle(_ b: SaatBekleyen) {
        kilitli {
            var liste = bekleyenleriOku()
            if liste.contains(where: { $0.tarih == b.tarih && $0.vakit == b.vakit }) { return }
            liste.append(b)
            bekleyenleriYaz(liste)
        }
    }

    /// Yalniz simulator kare tohumu: iyimser isaretleri siler (her kare bagimsiz baslasin).
    public func bekleyenleriSifirla() {
        kilitli { defaults.removeObject(forKey: Anahtar.bekleyenler) }
    }

    private func bekleyenleriOku() -> [SaatBekleyen] {
        guard let veri = defaults.data(forKey: Anahtar.bekleyenler),
              let liste = try? JSONDecoder().decode([SaatBekleyen].self, from: veri) else { return [] }
        return liste
    }

    private func bekleyenleriYaz(_ liste: [SaatBekleyen]) {
        guard let veri = try? JSONEncoder().encode(liste) else { return }
        defaults.set(veri, forKey: Anahtar.bekleyenler)
    }

    // MARK: - Sessiz uyandirma (saat-yerel durum)

    /// Kapatilan kayit, uyandirmanin anlamini yitirdigi andan bu kadar sonra budanir.
    public static let kapatilanOmruMs: Int64 = 24 * 3_600_000

    private func kapatilanOku() -> [String: Int64] {
        guard let veri = defaults.data(forKey: Anahtar.kapatilanUyandirma),
              let sozluk = try? JSONDecoder().decode([String: Int64].self, from: veri) else { return [:] }
        return sozluk
    }

    /// Bu saatte kapatilmis (ya da Kildim denmis) uyandirma kimlikleri.
    public func kapatilanUyandirmalar(simdiMs: Int64) -> Set<String> {
        return kilitli { Set(kapatilanOku().filter { simdiMs - $0.value <= Self.kapatilanOmruMs }.keys) }
    }

    /// `kimlikler`: kapatilan kimlik → o uyandirmanin `sonMs`'i (budama icin).
    public func uyandirmalariKapat(_ kimlikler: [String: Int64], simdiMs: Int64) {
        kilitli {
            var sozluk = kapatilanOku().filter { simdiMs - $0.value <= Self.kapatilanOmruMs }
            for (id, son) in kimlikler { sozluk[id] = son }
            if let veri = try? JSONEncoder().encode(sozluk) { defaults.set(veri, forKey: Anahtar.kapatilanUyandirma) }
        }
    }

    // MARK: - Tesbihat (saatte bagimsiz)

    public func tesbihatOku(simdiMs: Int64) -> Tesbihat.Durum {
        let (toplam, ms): (Int, Int64) = kilitli {
            (defaults.integer(forKey: Anahtar.tesbihatToplam), Int64(defaults.double(forKey: Anahtar.tesbihatMs)))
        }
        return Tesbihat.yukle(toplam: toplam, sonDokunusMs: ms, simdiMs: simdiMs)
    }

    public func tesbihatYaz(_ d: Tesbihat.Durum, simdiMs: Int64) {
        kilitli {
            defaults.set(d.toplam, forKey: Anahtar.tesbihatToplam)
            defaults.set(Double(simdiMs), forKey: Anahtar.tesbihatMs)
        }
    }

    // MARK: - Yardimcilar

    public static func simdiMs(_ tarih: Date = Date()) -> Int64 {
        return Int64((tarih.timeIntervalSince1970 * 1000).rounded())
    }

    public static func tarih(_ ms: Int64) -> Date {
        return Date(timeIntervalSince1970: TimeInterval(ms) / 1000)
    }

    /// `HH:mm` (cihaz saat dilimi). Hal eki EKLENMEZ ("çıkış 16:00").
    public static func saatMetni(_ ms: Int64, saatDilimi: TimeZone = .current) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = saatDilimi
        f.dateFormat = "HH:mm"
        return f.string(from: tarih(ms))
    }

    private func kilitli<T>(_ blok: () -> T) -> T {
        kilit.lock()
        defer { kilit.unlock() }
        return blok()
    }
}
