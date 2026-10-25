import AppIntents
import Foundation
internal import ExpoSiriKisayollari

// KISAYOLLAR OTOMASYON EYLEMLERI — deger donduren eylemler (Android otomasyon #278 ikizi).
//
// Android'de Tasker/MacroDroid eklentisi `%vakit %vakitkodu %kalandk` degiskenlerini ve
// "vakit kilindi mi" kosulunu verir. Kisayollar'da karsiligi DEGER DONDUREN eylemdir:
// kullanici sonucu "Eger … ise" bloguna baglar. `AppShortcutsProvider`'a EKLENMEZ
// (≤10 sinir; Kisayollar uygulamanin tum intent'lerini eylem listesinde zaten gosterir).
//
// Karar `OtomasyonKarari` (pod, saf Foundation, Linux testi `test/main.swift` §7).
// iOS'ta "vakit girdi" TETIGI YOKTUR (ucuncu taraf uygulama Kisayollar'a kisisel otomasyon
// tetigi tanimlayamaz) → yedek: "Gunun saati" tetigi + bu eylemler.
// Metinler ARAYUZ kaydindadir (kibar "siz").

/// Siradaki vaktin adi ("Öğle"). Deger: metin.
@available(iOS 16.0, *)
struct SiradakiVakitAdiIntent: AppIntent {
    static let title: LocalizedStringResource = "Sıradaki vaktin adı"
    static let description = IntentDescription(
        "Sıradaki namaz vaktinin adını verir. Kısayollarda koşul olarak kullanabilirsiniz."
    )
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ReturnsValue<String> & ProvidesDialog {
        let simdi = SiriDeposu.simdiMs()
        // Deger de cevap dilindedir (W5): Kisayollar kullaniciya cihaz dilinde gorunur,
        // "Eger … ise" karsilastirmasini kullanici o dilde kurar.
        guard let cizelge = SiriDeposu.varsayilan.cizelge(),
              let s = OtomasyonKarari.siradakiVakit(cizelge.vakitler, simdiMs: simdi, dil: SiriDili.kod) else {
            return .result(value: "", dialog: "\(SiriDili.metin.konumYok)")
        }
        return .result(value: s.ad, dialog: "\(s.ad)")
    }
}

/// Siradaki vaktin girisine kalan dakika. Deger: sayi (yukari yuvarlanir; vakit yoksa -1).
@available(iOS 16.0, *)
struct SiradakiVakteKalanDakikaIntent: AppIntent {
    static let title: LocalizedStringResource = "Sıradaki vakte kalan dakika"
    static let description = IntentDescription(
        "Sıradaki namaz vaktinin girmesine kaç dakika kaldığını verir. Bilgi yoksa -1 döner."
    )
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ReturnsValue<Int> & ProvidesDialog {
        let simdi = SiriDeposu.simdiMs()
        let dil = SiriDili.kod
        guard let cizelge = SiriDeposu.varsayilan.cizelge(),
              let s = OtomasyonKarari.siradakiVakit(cizelge.vakitler, simdiMs: simdi, dil: dil) else {
            return .result(value: -1, dialog: "\(SiriDili.metin.konumYok)")
        }
        return .result(value: s.kalanDk, dialog: "\(OtomasyonMetni.kalanDakika(ad: s.ad, dakika: s.kalanDk, dil: dil))")
    }
}

/// Su anki vakit kilindi mi? Deger: evet/hayir (kilinacak vakit yoksa hayir + aciklama).
@available(iOS 16.0, *)
struct SimdikiVakitKilindiMiIntent: AppIntent {
    static let title: LocalizedStringResource = "Şu anki vakit kılındı mı?"
    static let description = IntentDescription(
        "İçinde bulunulan vakit kılındı olarak işaretliyse evet verir. Kılınacak vakit yoksa hayır verir."
    )
    static let openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ReturnsValue<Bool> & ProvidesDialog {
        let depo = SiriDeposu.varsayilan
        let dil = SiriDili.kod
        guard let cizelge = depo.cizelge(), !cizelge.vakitler.isEmpty else {
            return .result(value: false, dialog: "\(SiriDili.metin.konumYok)")
        }
        let sonuc = OtomasyonKarari.simdikiVakitKilindiMi(
            vakitler: cizelge.vakitler,
            kilinanlar: depo.kilinanlar(),
            bekleyenler: depo.bekleyenler(),
            simdiMs: SiriDeposu.simdiMs()
        )
        switch sonuc {
        case .some(true): return .result(value: true, dialog: "\(OtomasyonMetni.evetKilindi(dil))")
        case .some(false): return .result(value: false, dialog: "\(OtomasyonMetni.hayirKilinmadi(dil))")
        case .none: return .result(value: false, dialog: "\(VakitMetinleri.dil(dil).vakitYok)")
        }
    }
}

/// Otomasyon eylemlerinin dinamik cevaplari (W5; dil `SiriDili.kod`). Ingilizce karsiliklar
/// JS `sozluk/en/genel.ts > kildim.sonuc` ve `sure.dakika` cogulundan.
enum OtomasyonMetni {
    static func kalanDakika(ad: String, dakika: Int, dil: String) -> String {
        let m = OtomasyonMetinleri.dil(dil)
        let kalip = m.kalanDakika[CogulKurali.kategori(dil, dakika)] ?? m.kalanDakika["other"] ?? ""
        return VakitMetinleri.bicim(kalip, ["ad": ad, "n": String(dakika)])
    }

    static func evetKilindi(_ dil: String) -> String { OtomasyonMetinleri.dil(dil).evetKilindi }

    static func hayirKilinmadi(_ dil: String) -> String { OtomasyonMetinleri.dil(dil).hayirKilinmadi }
}

/// Otomasyon cevaplarinin dil tablosu. Duzen: dil basina bir `static let`, sira tr, en, id,
/// de, fr, bs, ru, ms; cevrilmemis dil Ingilizcenin kopyasidir (`// ÇEVİRİ: <kod>`).
/// `kalanDakika` CLDR kategorisi ("one", "few", "many", "other"; `CogulKurali`) → kalip;
/// eksik kategori "other"a duser. Yer tutucular `{ad}`, `{n}`.
struct OtomasyonMetinleri {
    let kalanDakika: [String: String]
    let evetKilindi: String
    let hayirKilinmadi: String

    static let tr = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} vaktine {n} dakika var.", "other": "{ad} vaktine {n} dakika var."],
        evetKilindi: "Evet, kılındı olarak işaretli.",
        hayirKilinmadi: "Hayır, henüz işaretlenmedi."
    )

    static let en = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} begins in {n} minute.", "other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )


    // id — Endonezce (beta); CLDR yalniz "other"
    static let id = OtomasyonMetinleri(
        kalanDakika: ["other": "{n} menit lagi menuju {ad}."],
        evetKilindi: "Ya, sudah ditandai ditunaikan.",
        hayirKilinmadi: "Belum, belum ditandai."
    )


    // de — Almanca (beta): JS `sozluk/de`
    static let de = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} beginnt in {n} Minute.", "other": "{ad} beginnt in {n} Minuten."],
        evetKilindi: "Ja, es ist als gebetet markiert.",
        hayirKilinmadi: "Nein, es ist noch nicht markiert."
    )


    // ÇEVİRİ: fr
    static let fr = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} commence dans {n} minute.", "many": "{ad} commence dans {n} de minutes.", "other": "{ad} commence dans {n} minutes."],
        evetKilindi: "Oui, elle est marquée comme accomplie.",
        hayirKilinmadi: "Non, elle n’est pas encore marquée."
    )


    // ÇEVİRİ: bs
    static let bs = OtomasyonMetinleri(
        kalanDakika: [
            "one": "{ad}: vakat nastupa za {n} minutu.",
            "few": "{ad}: vakat nastupa za {n} minute.",
            "other": "{ad}: vakat nastupa za {n} minuta.",
        ],
        evetKilindi: "Da, označeno je kao klanjano.",
        hayirKilinmadi: "Ne, još nije označeno."
    )


    // ÇEVİRİ: ru
    static let ru = OtomasyonMetinleri(
        kalanDakika: [
            "one": "Время намаза {ad} наступит через {n} минуту.",
            "few": "Время намаза {ad} наступит через {n} минуты.",
            "many": "Время намаза {ad} наступит через {n} минут.",
            "other": "Время намаза {ad} наступит через {n} минуты.",
        ],
        evetKilindi: "Да, отмечен как совершённый.",
        hayirKilinmadi: "Нет, ещё не отмечен."
    )


    // ÇEVİRİ: ms
    static let ms = OtomasyonMetinleri(
        kalanDakika: ["one": "{n} minit lagi masuk waktu {ad}.", "other": "{n} minit lagi masuk waktu {ad}."],
        evetKilindi: "Ya, sudah ditandakan sebagai ditunaikan.",
        hayirKilinmadi: "Tidak, belum ditandakan."
    )

    static let tablo: [String: OtomasyonMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
    ]

    static func dil(_ kod: String) -> OtomasyonMetinleri { tablo[ArayuzDili.coz(kod)] ?? tr }
}
