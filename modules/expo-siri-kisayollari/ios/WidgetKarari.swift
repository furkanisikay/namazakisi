import Foundation

/**
 * iOS WIDGET GORUNUM KARARI (issue #295) — SAF (yalniz Foundation).
 *
 * `src/core/widget/iosWidgetKarari.ts`'in Swift IKIZIDIR. Ortak fikstur:
 * `modules/expo-siri-kisayollari/test/widget-ios-ornek.json` (JS + `test/main.swift`).
 * Bu dosya pod'da derlenir VE widget uzantisina kopyalanir
 * (`plugins/withNamazWidget.js`); uzanti pod'a baglanmaz, bu yuzden UIKit/SwiftUI/
 * WidgetKit IMPORT ETMEZ.
 *
 * Kural ya da fikstur degisirse TS + Swift + fikstur BIRLIKTE degisir.
 */

public struct WidgetGorunumu: Equatable {
    /// Icinde bulunulan KILINABILIR vakit; gunes→ogle arasi / veri yok / tukenmisse nil.
    public let aktif: SiriVakitAni?
    /// Aktif vaktin cikisi (bir sonraki girisin ani).
    public let bitisMs: Int64?
    /// Kayit ∪ kuyrukta bekleyen "Kildim".
    public let kilindi: Bool
    /// Siradaki kilinabilir vakit (gunes atlanir).
    public let sonraki: SiriVakitAni?
    /// Gosterilen NAMAZ gunu (orta boy widget'in bes vakti).
    public let gunTarihi: String?
}

public enum WidgetKarari {
    /// Bir zaman cizelgesinde en fazla bu kadar sinir girdisi (~2 gun).
    public static let azamiSinir = 12

    /// Kilinmislik: kaydedilmis (widget kodu) ∪ kuyrukta bekleyen (KAYIT kodu).
    public static func kilindiMi(
        _ vakit: SiriVakitAni,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim]
    ) -> Bool {
        return VakitKarari.kilindiMi(vakit, kilinanlar: kilinanlar, bekleyenler: bekleyenler)
    }

    public static func gorunum(
        vakitler: [SiriVakitAni],
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64
    ) -> WidgetGorunumu {
        let durum = VakitKarari.aktifVakitBul(vakitler, simdiMs: simdiMs)
        let sonGecen = vakitler.filter { $0.ms <= simdiMs }.max { $0.ms < $1.ms }
        let gun = durum.aktif?.tarih ?? sonGecen?.tarih ?? durum.sonraki?.tarih
        let kilindi = durum.aktif.map { kilindiMi($0, kilinanlar: kilinanlar, bekleyenler: bekleyenler) } ?? false
        return WidgetGorunumu(
            aktif: durum.aktif,
            bitisMs: durum.bitisMs,
            kilindi: kilindi,
            sonraki: durum.sonraki,
            gunTarihi: gun
        )
    }

    /// Simdiden SONRAKI vakit girisleri (gunes dahil), sirali ve tekil — zaman cizelgesi girdileri.
    /// Dakikalik girdi YOK: geri sayimi sistem cizer (`Text(timerInterval:)`).
    public static func sinirlar(_ vakitler: [SiriVakitAni], simdiMs: Int64, azami: Int = azamiSinir) -> [Int64] {
        let anlar = Set(vakitler.map { $0.ms }.filter { $0 > simdiMs }).sorted()
        return Array(anlar.prefix(max(0, azami)))
    }

    /// Bir namaz gununun bes kilinabilir vakti, sirali.
    public static func gunVakitleri(_ vakitler: [SiriVakitAni], tarih: String) -> [SiriVakitAni] {
        return vakitler
            .filter { $0.tarih == tarih && VakitKarari.kilinabilir.contains($0.vakit) }
            .sorted { $0.ms < $1.ms }
    }
}
