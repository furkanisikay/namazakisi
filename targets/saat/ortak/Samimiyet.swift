import Foundation

/// Samimiyet anlari (sahip istegi: "Kilindi / Tamamlandi" yerine "Allah kabul etsin").
/// Telefon `src/core/samimiyet/kabulDuasi.ts > KABUL_DUASI` ve Wear
/// `AnaEkranKarari.KABUL_DUASI` ile AYNI sabit kalip; saatte donusum yok (tek kalip).
/// Yalniz Foundation (saat + komplikasyon hedefleri derler, Linux testi de kosar).
/// Dil (W5): JS `sozluk/<dil>/samimiyet.ts > kabulDuasi` ("May Allah accept it").
public enum Samimiyet {
    public static let kabulDuasi = VakitMetinleri.tr.kabulDuasi

    public static func kabulDuasi(_ dil: String) -> String {
        return VakitMetinleri.dil(dil).kabulDuasi
    }
    /// Kildim sonrasi duanin alt satirda kalma suresi (sonra siradaki vakit gorunur).
    public static let kabulGosterimSaniye: Double = 3
}
