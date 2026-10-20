import Foundation

/**
 * IPHONE "NAMAZDA SESSIZ" — vakit girisinden sonraki sessizlik penceresi (SAF, yalniz Foundation).
 *
 * `src/core/siri/sessizlikKarari.ts`'in Swift IKIZIDIR; ortak fikstur
 * `modules/expo-siri-kisayollari/test/siri-ornek.json > sessizlik` (JS testi + `test/main.swift`).
 *
 * iOS uygulamanin Odak'i kendisinin acmasina izin vermez. Kullanicinin Kisayollar
 * otomasyonu "Odak'i ayarla" eylemini calistirir ve ne zaman acacagini bu karara
 * sorar (`NamazSessizligiIntent`, `NamazSessizligiBitisiIntent`). Kisayollar'in saat
 * tetikleri sabit saattir; degisen vakitlere bu cizelge uyar.
 *
 * Kural: icinde bulunulan namaz vaktinin GIRISINDEN itibaren `dakika` boyunca sessiz;
 * pencere vaktin cikisini gecmez; bitis ani dahil degildir. Gunes vakti namaz degildir.
 */
public struct SessizlikDurumu: Equatable {
    public let sessiz: Bool
    public let vakit: String?
    public let bitisMs: Int64?
}

public enum SessizlikKarari {
    public static let varsayilanDk = 20
    public static let enAzDk = 5
    public static let enCokDk = 120

    public static func dakikaKenetle(_ dakika: Int) -> Int {
        return min(enCokDk, max(enAzDk, dakika))
    }

    public static func durum(_ vakitler: [SiriVakitAni], simdiMs: Int64, dakika: Int) -> SessizlikDurumu {
        let aktif = VakitKarari.aktifVakitBul(vakitler, simdiMs: simdiMs)
        guard let vakit = aktif.aktif, let cikis = aktif.bitisMs else {
            return SessizlikDurumu(sessiz: false, vakit: nil, bitisMs: nil)
        }
        let son = min(vakit.ms + Int64(dakikaKenetle(dakika)) * 60_000, cikis)
        guard simdiMs < son else {
            return SessizlikDurumu(sessiz: false, vakit: nil, bitisMs: nil)
        }
        return SessizlikDurumu(sessiz: true, vakit: vakit.vakit, bitisMs: son)
    }
}
