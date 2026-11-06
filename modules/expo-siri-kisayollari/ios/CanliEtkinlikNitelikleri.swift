#if canImport(ActivityKit)
import ActivityKit
import Foundation

/**
 * CANLI ETKINLIK (Live Activity) NITELIKLERI — Dinamik Ada / kilit ekrani geri sayimi
 * (issue #282'nin iOS ikizi, #295).
 *
 * Bu dosya IKI hedefte derlenir: pod (uygulama sureci: `Activity.request`) ve widget
 * uzantisi (`ActivityConfiguration` cizimi; `plugins/withNamazWidget.js` kopyalar).
 * ActivityKit iki tarafi TIP ADI + Codable sekliyle eslestirir → ad, alanlar ve alan
 * sirasi iki kopyada BIREBIR ayni olmali; bu yuzden tek kaynak bu dosyadir, uzantiya
 * kopyalanir, elle cogaltilmaz.
 *
 * Pod'un dagitim hedefi iOS 15.1'dir: ActivityKit `s.weak_frameworks` ile ZAYIF baglanir
 * (podspec), tipler `@available` ile korunur.
 */
@available(iOS 16.1, *)
public struct NamazCanliNitelikleri: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Kart basligi (ör. "⏱️ Öğle Namazı").
        public var baslik: String
        /// Kisa ad (Dinamik Ada: "Öğle").
        public var ad: String
        /// Ilerleme cubugunun basi (vaktin girisi / pencerenin basi), epoch ms.
        public var baslangicMs: Int64
        /// Geri sayimin hedefi (vaktin cikisi), epoch ms.
        public var hedefMs: Int64
        /// `vakit` | `cuma` | `nafile` (ikon/renk secimi).
        public var tema: String
        /// Yalniz vakit ogesinde: "Kildim" dugmesinin isaretleyecegi namaz gunu ve KAYIT kodu.
        public var kildimTarih: String?
        public var kildimVakit: String?

        public init(
            baslik: String,
            ad: String,
            baslangicMs: Int64,
            hedefMs: Int64,
            tema: String,
            kildimTarih: String?,
            kildimVakit: String?
        ) {
            self.baslik = baslik
            self.ad = ad
            self.baslangicMs = baslangicMs
            self.hedefMs = hedefMs
            self.tema = tema
            self.kildimTarih = kildimTarih
            self.kildimVakit = kildimVakit
        }
    }

    /// Plan kimligi (Android `CanliAday.id` ile ayni: `sayac_<tarih>_<vakit>`...).
    public var kimlik: String

    public init(kimlik: String) {
        self.kimlik = kimlik
    }
}

@available(iOS 16.2, *)
public extension NamazCanliNitelikleri {
    /// Kildim sonrasi son karenin metni (telefon `KABUL_DUASI` ile ayni sabit kalip),
    /// arayuz dilinde. Gorunum `kabul` temasinda bu basligi degil cizim anindaki dili cizer.
    static var kabulDuasi: String {
        VakitMetinleri.dil(SiriDeposu.varsayilan.arayuzDili()).kabulDuasi
    }
    /// Son karenin temasi (gorunum bu temada sayac yerine dua cizer).
    static let kabulTemasi = "kabul"
    /// Son karenin kilit ekraninda/Dinamik Ada'da kalma suresi.
    static let kabulGorunmeSaniye: TimeInterval = 4

    /// "Kildim" sonrasi o vaktin canli etkinligini kapatir (Android'deki sayac iptalinin ikizi).
    static func kildimIleBitir(tarih: String, vakit: String) async {
        for etkinlik in Activity<NamazCanliNitelikleri>.activities {
            let durum = etkinlik.content.state
            if durum.kildimTarih == tarih && durum.kildimVakit == vakit {
                // Samimiyet: etkinlik hemen kaybolmaz, son karesi birkac saniye "Allah kabul
                // etsin" der (tema `kabul`; dugme yok), sonra sistem kaldirir. Sema DEGISMEDI:
                // yalniz yeni bir tema dizesi (eski gorunum bilmedigi temada sayaca duser).
                let son = ContentState(
                    baslik: kabulDuasi,
                    ad: durum.ad,
                    baslangicMs: durum.baslangicMs,
                    hedefMs: durum.hedefMs,
                    tema: kabulTemasi,
                    kildimTarih: nil,
                    kildimVakit: nil
                )
                await etkinlik.end(
                    ActivityContent(state: son, staleDate: nil),
                    dismissalPolicy: .after(Date().addingTimeInterval(kabulGorunmeSaniye))
                )
            }
        }
    }
}
#endif
