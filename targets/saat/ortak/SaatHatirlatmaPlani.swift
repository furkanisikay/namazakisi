import Foundation

/**
 * APPLE WATCH HATIRLATMA + SESSIZ UYANDIRMA KARARLARI (#285 cilasi) — SAF (yalniz Foundation).
 *
 * Saatte IKINCI MOTOR YOK: kayitlar telefonun hazir planidir (`SaatYuku.plan`,
 * `SaatYuku.uyandirma`). Burada yalniz "hangileri, ne zaman" secilir.
 *
 * CIFT BILDIRIM KURALI = Apple'in yonlendirme kurali, bizim kapimiz DEGIL:
 *  - watchOS uygulamasinin yerel bildirimi YALNIZ saatte gorunur; iOS uygulamasinin yerel
 *    bildirimi iPhone ya da saatte (iPhone acik + ekran aciksa telefonda, degilse bilekteki
 *    acik saatte) gorunur ("Taking advantage of notification forwarding").
 *  - Iki uygulama AYNI kimlikli bildirimi ayni anda kurarsa saat iPhone'unkini bekler ve
 *    tekillestirir; telefondan bir sey gelmezse (telefon uzakta, ya da telefon o tetigi hic
 *    kurmadi) ~10-20 sn sonra kendisi calar (Apple Developer Forums 737026).
 *  Bu yuzden kimlik telefonla BIREBIR aynidir (`muhafizBildirimIdOlustur`) ve saat "telefon
 *  uzakta mi?" diye kendi tahminini YAPMAZ. Bazi raporlar tekillestirmenin her zaman
 *  tutmadigini soyler (forum 801596) → cihazda dogrulanmadi.
 *
 * Sessiz uyandirma (`WKExtendedRuntimeSession`, akilli alarm) watchOS sinirlari:
 *  - `start(at:)` yalniz uygulama ETKINKEN cagrilabilir, en fazla 36 sa ileri, ayni anda
 *    TEK oturum. → Siradaki uyandirma uygulama her acildiginda (ve Kildim/Kapat sonrasi)
 *    kurulur; kullanici saat uygulamasini hic acmazsa telefonun yedegi calar.
 *  - Oturum basladiginda haptik calinmazsa sistem uyari gosterip oturumlari kapatmayi
 *    onerir → saat sarjdayken de calinir (Wear'daki "sarjda calma" kuralinin iOS karsiligi
 *    telefonun +3 dk yedegidir: sarjdaki saati kimse kapatmaz, yedek calar).
 */
public enum SaatHatirlatmaPlani {
    /// watchOS da uygulama basina en yakin 64 bekleyen bildirimi tutar; pay birakilir.
    public static let azamiBildirim = 48
    /// Muhafiz bildirim kimlik oneki (telefonla ayni uzay).
    public static let kimlikOneki = "muhafiz_"

    /// Ayni vaktin tum bildirimlerinin oneki (Kildim o vaktin kalanini susturur).
    public static func vakitOneki(tarih: String, vakit: String) -> String {
        return "muhafiz_\(tarih)_vakit_\(vakit)_"
    }

    /// Yuk ∪ iyimser bekleyen: vakit kilinmis mi? (KAYIT kodu, `imsak`...)
    public static func kilinmisMi(_ yuk: SaatYuku, _ bekleyenler: [SaatBekleyen], tarih: String, vakit: String) -> Bool {
        if yuk.gunler.contains(where: { $0.tarih == tarih && $0.kilinan.contains(vakit) }) { return true }
        return bekleyenler.contains { $0.tarih == tarih && $0.vakit == vakit }
    }

    /**
     * Saatin kuracagi yerel bildirimler: simdiden sonraki, kilinmamis vakitlerin plan
     * kayitlari; kronolojik en yakin `azami` tanesi (sistemin kendi kesme olcutuyle ayni).
     * Uyandirma listesindeki kimlikler ATLANIR — onlari bilekte sessiz alarm verir, ayni
     * an icin ikinci bir bildirim cift uyari olurdu.
     */
    public static func bildirimler(
        yuk: SaatYuku,
        bekleyenler: [SaatBekleyen],
        simdiMs: Int64,
        azami: Int = azamiBildirim
    ) -> [SaatPlanKaydi] {
        let uyandirmaKimlikleri = Set(yuk.uyandirma.map { $0.id })
        let secilen = yuk.plan
            .filter { $0.ms > simdiMs }
            .filter { !uyandirmaKimlikleri.contains($0.id) }
            .filter { !kilinmisMi(yuk, bekleyenler, tarih: $0.tarih, vakit: $0.vakit) }
            .sorted { $0.ms < $1.ms }
        return Array(secilen.prefix(max(0, azami)))
    }
}

public enum SaatUyandirmaKarari {
    /// Titresim en fazla bu kadar surer (Wear `CALMA_SURESI_MS`; telefonun yedegi 3 dk sonra).
    public static let calmaSuresiMs: Int64 = 2 * 60_000
    /// `WKExtendedRuntimeSession.start(at:)` en fazla bu kadar ileri kurulabilir.
    public static let zamanlamaUfkuMs: Int64 = 36 * 3_600_000

    /// Kapatilmamis, (sabahta) kilinmamis ve anlamini yitirmemis uyandirmalar.
    public static func adaylar(
        yuk: SaatYuku,
        bekleyenler: [SaatBekleyen],
        kapatilan: Set<String>
    ) -> [SaatUyandirmaKaydi] {
        return yuk.uyandirma
            .filter { !kapatilan.contains($0.id) }
            .filter { $0.nafile || !SaatHatirlatmaPlani.kilinmisMi(yuk, bekleyenler, tarih: $0.tarih, vakit: "imsak") }
            .filter { $0.ms < $0.sonMs }
            .sorted { $0.ms < $1.ms }
    }

    /// Kurulacak siradaki oturum: simdiden sonra ve 36 sa icinde en yakin aday.
    public static func siradaki(
        yuk: SaatYuku,
        bekleyenler: [SaatBekleyen],
        kapatilan: Set<String>,
        simdiMs: Int64
    ) -> SaatUyandirmaKaydi? {
        return adaylar(yuk: yuk, bekleyenler: bekleyenler, kapatilan: kapatilan)
            .first { $0.ms > simdiMs && $0.ms - simdiMs <= zamanlamaUfkuMs }
    }

    /// Oturum baslayinca hangi kayit calinir? Zamani gelmis (en cok `calmaSuresiMs` gecikmis)
    /// ve hala anlamli olan en gec aday. Gec kalinmissa (pencere bitti) nil.
    public static func calacak(
        yuk: SaatYuku,
        bekleyenler: [SaatBekleyen],
        kapatilan: Set<String>,
        simdiMs: Int64
    ) -> SaatUyandirmaKaydi? {
        return adaylar(yuk: yuk, bekleyenler: bekleyenler, kapatilan: kapatilan)
            .filter { $0.ms <= simdiMs + 60_000 && simdiMs - $0.ms <= calmaSuresiMs && simdiMs < $0.sonMs }
            .last
    }

    /**
     * Teheccud "Kildim": o gecenin TUM teheccud uyandirmalari susar (Wear `kildimKapsami`).
     * Sabah (farz) yalniz kendi kimligi; digerlerini kilinmislik zaten dusurur.
     */
    public static func kildimKapsami(yuk: SaatYuku, kayit: SaatUyandirmaKaydi) -> Set<String> {
        guard kayit.nafile else { return [kayit.id] }
        var kume = Set(yuk.uyandirma.filter { $0.nafile && $0.tarih == kayit.tarih }.map { $0.id })
        kume.insert(kayit.id)
        return kume
    }
}
