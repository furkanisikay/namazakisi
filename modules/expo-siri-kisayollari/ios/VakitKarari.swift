import Foundation

/**
 * SIRI / KISAYOLLAR VAKIT KARARI — SAF (yalniz Foundation).
 *
 * `src/core/siri/siriKarari.ts` ve `src/core/widget/widgetYuku.ts > aktifVakitBul`'un
 * Swift IKIZIDIR. Kurallar ortak fikstürlerle kilitlidir:
 *   - `android/app/src/test/resources/widget-ornek.json` (JS + Kotlin + Swift)
 *   - `modules/expo-siri-kisayollari/test/siri-ornek.json` (JS + Swift)
 * Swift tarafini `test/main.swift` dogrular (macOS CI'da `swiftc`, iOS SDK gerekmez;
 * bu dosya bu yuzden UIKit/AppIntents IMPORT ETMEZ).
 *
 * Kural ya da metin degisirse TS + Swift + fikstur BIRLIKTE degisir.
 *
 * DIL (W5): metin ureten her fonksiyon `dil` parametresi alir, varsayilani "tr" — Turkce
 * metinler fikstur ile BAYT BAYT ayni kalir; Ingilizce beklentiler `test/main.swift` §9'da
 * elle yazilidir. Bu dosya pod'a, widget uzantisina ve saate kopyalandigi icin dil
 * cozumu (`ArayuzDili`) ve metin tablosu (`VakitMetinleri`) de BURADADIR (yeni dosya CI'nin
 * swiftc listelerine ve kopya listelerine girmek zorunda kalirdi).
 */

/// Widget yukundeki tek giris: vakit kodu (`sabah`, `gunes`, `ogle`...), giris ani, NAMAZ gunu.
public struct SiriVakitAni: Codable, Equatable {
    public let vakit: String
    public let ms: Int64
    public let tarih: String

    public init(vakit: String, ms: Int64, tarih: String) {
        self.vakit = vakit
        self.ms = ms
        self.tarih = tarih
    }
}

/// JS `widgetVerisiOlustur` ciktisi (dun + 8 gun). `surum` bilgi icindir.
public struct SiriCizelge: Codable {
    public let surum: Int?
    public let tarih: String?
    public let vakitler: [SiriVakitAni]
}

/// Kuyrukta bekleyen (uygulamada henuz islenmemis) "Kildim": KAYIT vakit kodu (`imsak`...).
public struct SiriBekleyenKildim: Codable, Equatable {
    public let tarih: String
    public let vakit: String

    public init(tarih: String, vakit: String) {
        self.tarih = tarih
        self.vakit = vakit
    }
}

public struct SiriAktifVakitDurumu: Equatable {
    public let aktif: SiriVakitAni?
    public let bitisMs: Int64?
    public let sonraki: SiriVakitAni?
}

public enum SiriKildimKarari: Equatable {
    case aday(vakit: SiriVakitAni, kayitVakti: String, ad: String)
    case zatenKilindi(ad: String)
    case vakitYok(siradaki: SiriVakitAni?)
}

/// NATIVE ARAYUZ DILI (W5): JS `DilServisi`'nin yazdigi kod (iOS App Group
/// `namazakisi_dil_kod`, `SiriDeposu.arayuzDili()`) ya da cihaz dili buraya girer.
/// Desteklenmeyen / bos kod Turkceye duser (uygulama hic acilmadiysa deger yoktur).
/// Yeni dil = her metin tablosuna (`VakitMetinleri`, `SaatMetinleri`, `WidgetMetinleri`...)
/// yeni ornek + `tablo` eslemesi + `desteklenenler`'e kod (`docs/ajan/coklu-dil.md`).
public enum ArayuzDili {
    public static let varsayilan = "tr"
    /// Tablo duzeni sirasiyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo).
    public static let desteklenenler: [String] = ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "pt", "it", "sv", "uk", "ro", "hr", "sr", "el", "ku", "tk", "tt", "sd", "pl", "ja", "gu", "bg", "mk", "fil", "te", "kn", "mr", "pa", "as", "ne", "si", "km", "he", "ka", "lt", "mg", "lg", "rw", "rn", "ln", "dag", "mos", "aa", "mdh", "ak", "ceb", "nqo"]

    /// "en", "en-US", "de_DE" → kok kod; bilinmeyen ya da bos kod → "tr". Eski Endonezce
    /// kodu "in" (Java/Android mirasi) "id" sayilir; iOS'ta Endonezce zaten "id"dir.
    public static func coz(_ kod: String?) -> String {
        guard let kod, !kod.isEmpty else { return varsayilan }
        let parcalar = kod.split(whereSeparator: { $0 == "-" || $0 == "_" }).map(String.init)
        var dil = parcalar.first ?? ""
        if dil == "in" { dil = "id" }
        if dil == "kmr" { dil = "ku" }  // Kurmanci ISO 639-3 → uygulamanin Kurmanci kodu
        if dil == "tl" { dil = "fil" }  // Tagalog → Filipince (AOSP kaynak kodu tl)
        if dil == "pnb" { dil = "pa" }  // Bati Pencapcasi (Sahmuki) → Pencapca
        if dil == "iw" { dil = "he" }  // Ibranicenin eski ISO kodu (Java/Android mirasi)
        // Pencapca YALNIZ Sahmuki: alt etiketsiz "pa" (uygulama kodu) ya da Arap betigi / Pakistan; Gurmuki → Turkce.
        if dil == "pa" {
            let alt = parcalar.dropFirst().map { $0.hasPrefix("#") ? String($0.dropFirst()) : $0 }
            if alt.contains("Guru") || !(alt.isEmpty || alt.contains("Arab") || alt.contains("PK")) { return varsayilan }
        }
        return desteklenenler.contains(dil) ? dil : varsayilan
    }
}

/// RAKAM SISTEMI — kullanicinin uygulamada SECTIGI rakam (Android `cekirdek/Rakam.kt` ve Wear
/// `saat/cekirdek/Rakam.kt` ikizi; esleme JS `core/dil/rakam.ts > YEREL_RAKAMLAR`). JS COZULMUS
/// degeri App Group'a yazar (`SiriDeposu.rakamSistemiAnahtari`: yerel rakamin CLDR adi "arab" /
/// "arabext" / "beng" / "deva" / "nkoo" ya da yok); kayit YALNIZ arayuz/cevap dilinin KENDI yerel sistemiyse uygulanir
/// (Arapcada, Soranide ve Sindhcede "arab", Farsca, Pestuca ve Pencapcada "arabext", Bengalcede ve Assamcada
/// "beng", Marathi ve Nepalcede "deva", N'Koda "nkoo"), diger her dilde
/// (Turkce dahil) cikti BIREBIR ayni kalir.
///
/// Kural: cekirdek metni Bati rakamiyla URETIR (fikstur, kimlik, veri ayni); donusum yalniz
/// CIZIM KENARINDA (`WidgetMetin.rakam`, Siri `dialog`). Sistemin cizdigi sayilar
/// (`Text(timerInterval:)`, `ProgressView(timerInterval:)`, `DateFormatter`) yerel ayari izler →
/// yerel rakamli dilde `yerelAyarKimligi` ("ar@numbers=arab|latn", "bn@numbers=beng|latn")
/// verilir. Bu dosyada: pod, widget ve saat kopyalari ile CI swiftc listeleri zaten onu derler
/// (yeni dosya acilmadi).
public enum RakamSistemi {
    public static let arab = "arab"
    public static let arabext = "arabext"
    public static let beng = "beng"
    public static let deva = "deva"
    public static let nkoo = "nkoo"
    public static let latn = "latn"

    /// Dil koku → yerel rakam sistemi (TEK esleme; listede olmayan dil Bati rakami yazar).
    static let yerel: [String: String] = [
        "ar": arab, "bn": beng, "fa": arabext, "ps": arabext, "ckb": arab, "sd": arab,
        "mr": deva, "pa": arabext, "as": beng, "ne": deva, "nqo": nkoo,
    ]

    /// Yerel sistemin sifirinin kod noktasi (dizi Unicode'da ardisik).
    static let sifirlar: [String: UInt32] = [arab: 0x0660, arabext: 0x06F0, beng: 0x09E6, deva: 0x0966, nkoo: 0x07C0]

    /// Dilin yerel rakam sistemi ("arab", "arabext", "beng", "deva", "nkoo") ya da nil (yalniz Bati rakami).
    public static func yerelSistem(dil: String?) -> String? {
        yerel[ArayuzDili.coz(dil)]
    }

    /// Etkin sistem: kayit dilin KENDI yerel sistemiyse o ("ar" + "arab", "bn" + "beng");
    /// kayit yok, "latn", bozuk, baska dilin sistemi ya da dil yerel rakamsizsa `latn`.
    public static func etkin(dil: String?, kayitli: String?) -> String {
        guard let sistem = yerelSistem(dil: dil),
              kayitli?.trimmingCharacters(in: .whitespacesAndNewlines) == sistem else { return latn }
        return sistem
    }

    /// Arapca arayuzde Dogu Arap rakami etkin mi (eski cagiranlar icin; yeni kod `etkin` kullanir).
    public static func doguMu(dil: String?, kayitli: String?) -> Bool {
        etkin(dil: dil, kayitli: kayitli) == arab
    }

    /// ASCII 0-9 → sistemin rakamlari (Dogu Arap U+0660–0669, Fars U+06F0–06F9, Bengalce U+09E6–09EF,
    /// Devanagari U+0966–096F, N'Ko U+07C0–07C9); `latn`,
    /// bilinmeyen sistem ya da rakamsiz metin AYNEN. Harf, ":", zaten yerel rakam olan metin
    /// degismez (idempotent).
    public static func cevir(_ metin: String, sistem: String) -> String {
        guard let sifir = sifirlar[sistem],
              metin.unicodeScalars.contains(where: { $0.value >= 0x30 && $0.value <= 0x39 }) else {
            return metin
        }
        var sonuc = String.UnicodeScalarView()
        for u in metin.unicodeScalars {
            if u.value >= 0x30 && u.value <= 0x39, let d = Unicode.Scalar(sifir + u.value - 0x30) {
                sonuc.append(d)
            } else {
                sonuc.append(u)
            }
        }
        return String(sonuc)
    }

    /// Eski imza: `dogu` true → Dogu Arap rakami. Yeni kod `cevir(_:sistem:)` kullanir.
    public static func cevir(_ metin: String, dogu: Bool) -> String {
        cevir(metin, sistem: dogu ? arab : latn)
    }

    /// Sistem cizimli sayilarin yerel ayari: yalniz yerel rakamli dilde "<dil>@numbers=<sistem>"
    /// (Bati secen Magrip ya da Bengalce kullanicisi da Bati gorur); diger dillerde nil →
    /// DOKUNULMAZ (cihazin ayari).
    public static func yerelAyarKimligi(dil: String?, kayitli: String?) -> String? {
        guard yerelSistem(dil: dil) != nil else { return nil }
        // Pencapca platform etiketi pa-Arab (ciplak "pa" CLDR'de Gurmuki: tarih/ay adlari Gurmuki yazilirdi).
        let kok = ArayuzDili.coz(dil) == "pa" ? "pa-Arab" : ArayuzDili.coz(dil)
        return "\(kok)@numbers=\(etkin(dil: dil, kayitli: kayitli))"
    }
}

/// CLDR cogul kategorisi ("zero", "one", "two", "few", "many", "other") — JS
/// `src/core/dil/cogul.ts` ikizi (tamsayi icin); Urduca, Felemenkce, Arnavutca, Pestuca, Sorani,
/// Uygurca ve Orta Asya dilleri (ur, nl, sq, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, om, so, ta, ml, sv, el, ku, tk, sd, bg) `default` dalindadir (one/other).
/// Cogul metin tablolari kategori → kalip tasir; dilde olmayan kategori "other"a duser.
public enum CogulKurali {
    public static func kategori(_ dil: String, _ n: Int) -> String {
        let i = abs(n)
        switch ArayuzDili.coz(dil) {
        case "id", "ms", "yo", "zh", "th", "ko", "vi", "ja", "tt", "km", "nqo", "rw", "rn", "dag", "mos", "aa", "mdh":
            // Tatarca, Kinyarwanda, Kirundi, Dagbani, Moore, Afar ve Maguindanao CLDR cogul tablosunda yok → ICU koku
            // (yalniz other); `cogul.ts > hepDiger`.
            return "other"
        case "es", "pt", "it":
            // `cogul.ts > ispanyolca`: yalniz 1 tekil (0 cogul); 1.000.000 katlari "many" (pt = pt-PT kurali).
            if i == 1 { return "one" }
            return (i != 0 && i % 1_000_000 == 0) ? "many" : "other"
        case "ro":
            // `cogul.ts > rumence`: 1 tekil; 0 ve …01–…19 (1 haric) "few"; gerisi "other" (20, 100, 120…).
            if i == 1 { return "one" }
            return (i == 0 || (1...19).contains(i % 100)) ? "few" : "other"
        case "hi", "bn", "fa", "am", "ff", "gu", "kn", "as", "pa", "si", "mg", "ln", "ak":
            // `cogul.ts > sifirBir`: 0 ve 1 tekil.
            return (i == 0 || i == 1) ? "one" : "other"
        case "fr":
            if i == 0 || i == 1 { return "one" }
            return (i != 0 && i % 1_000_000 == 0) ? "many" : "other"
        case "ru", "uk", "bs", "hr", "sr":
            // `cogul.ts > rusca` (ru, uk: gerisi "many") / `bosnakca` (bs, hr, sr: gerisi "other").
            let s10 = i % 10, s100 = i % 100
            if s10 == 1 && s100 != 11 { return "one" }
            if (2...4).contains(s10) && !(12...14).contains(s100) { return "few" }
            return ["ru", "uk"].contains(ArayuzDili.coz(dil)) ? "many" : "other"
        case "pl":
            // `cogul.ts > lehce`: 1 tekil; …2–4 (…12–14 haric) "few"; gerisi "many" (0, 5–21, 25…).
            if i == 1 { return "one" }
            let s10 = i % 10, s100 = i % 100
            return ((2...4).contains(s10) && !(12...14).contains(s100)) ? "few" : "many"
        case "mk":
            // `cogul.ts > makedonca`: son hanesi 1 (11 haric) tekil; gerisi "other".
            return (i % 10 == 1 && i % 100 != 11) ? "one" : "other"
        case "he":
            // `cogul.ts > ibranice` (CLDR 42+): 1 tekil, 2 ikil, gerisi "other".
            return i == 1 ? "one" : i == 2 ? "two" : "other"
        case "lt":
            // `cogul.ts > litvanca`: …1 tekil, …2–9 "few" (…11–19 haric); gerisi "other" ("many" yalniz kesirli).
            let s10 = i % 10, s100 = i % 100
            if (11...19).contains(s100) { return "other" }
            return s10 == 1 ? "one" : s10 >= 2 ? "few" : "other"
        case "fil", "ceb":
            // `cogul.ts > filipince` (Sebuano ayni CLDR blogunda): son hanesi 4, 6, 9 OLMAYAN tekil (0 ve 1.000.000 dahil); gerisi "other".
            return [4, 6, 9].contains(i % 10) ? "other" : "one"
        case "ar":
            // `cogul.ts > arapca`: 0, 1, 2, …03–…10, …11–…99, kalani other (100, 101, 102…).
            let s100 = i % 100
            if i == 0 { return "zero" }
            if i == 1 { return "one" }
            if i == 2 { return "two" }
            if (3...10).contains(s100) { return "few" }
            if (11...99).contains(s100) { return "many" }
            return "other"
        default: return i == 1 ? "one" : "other"
        }
    }

    /// Kategoriye gore kalip secer ve `{n}`'i doldurur (kategori yoksa "other").
    public static func sec(_ kaliplar: [String: String], _ dil: String, _ n: Int) -> String {
        let kalip = kaliplar[kategori(dil, n)] ?? kaliplar["other"] ?? ""
        return kalip.replacingOccurrences(of: "{n}", with: String(n))
    }
}

/// Kullanicinin sectigi VAKIT ADI TAKIMI (or. Almancada "Fajr" yerine "Morgengebet") — dil
/// tablosunun vakit adlarini ISTEGE BAGLI gecersiz kilar. Android `cekirdek/VakitAdlari.kt`
/// ikizi. JS `vakitAdlariniAyarla(json | null)` App Group'a yazar
/// (`SiriDeposu.vakitAdlariAnahtari` = `namazakisi_vakit_adlari`). Bicim:
/// `{"adlar":{imsak,gunes,ogle,ikindi,aksam,yatsi},"buyuk":{...},"kucuk":{...},"cuma":"..",
/// "imsakVakti":"..","gunesDogusu":".."}`. Yok / bos / bozuk → `nil`, tablo kullanilir;
/// hicbir zaman firlatmaz. Eksik tek alan yalniz o alanda tabloya duser.
public struct VakitAdlari: Equatable {
    public static let vakitler = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"]

    public let adlar: [String: String]
    public let buyuk: [String: String]
    public let kucuk: [String: String]
    public let cuma: String?
    public let imsakVakti: String?
    public let gunesDogusu: String?

    /// Widget kodu (`sabah`, `gunes`, `ogle`...) icin ad; takimda yoksa nil.
    public func widgetAdi(_ kod: String) -> String? {
        return adlar[kod == "sabah" ? "imsak" : kod]
    }

    public static func coz(_ json: String?) -> VakitAdlari? {
        guard let json, !json.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              let veri = json.data(using: .utf8),
              let kok = (try? JSONSerialization.jsonObject(with: veri)) as? [String: Any] else { return nil }
        func metin(_ d: Any?) -> String? {
            guard let s = d as? String else { return nil }
            let t = s.trimmingCharacters(in: .whitespacesAndNewlines)
            return t.isEmpty ? nil : t
        }
        func harita(_ d: Any?) -> [String: String] {
            guard let o = d as? [String: Any] else { return [:] }
            var sonuc: [String: String] = [:]
            for v in vakitler { if let m = metin(o[v]) { sonuc[v] = m } }
            return sonuc
        }
        let a = VakitAdlari(
            adlar: harita(kok["adlar"]), buyuk: harita(kok["buyuk"]), kucuk: harita(kok["kucuk"]),
            cuma: metin(kok["cuma"]), imsakVakti: metin(kok["imsakVakti"]), gunesDogusu: metin(kok["gunesDogusu"])
        )
        let bos = a.adlar.isEmpty && a.buyuk.isEmpty && a.kucuk.isEmpty && a.cuma == nil && a.imsakVakti == nil && a.gunesDogusu == nil
        return bos ? nil : a
    }

    // MARK: - Etkin takim (surec basina; `SiriDeposu.arayuzDili()` her okumada tazeler)

    private static let kilit = NSLock()
    nonisolated(unsafe) private static var _etkin: (dil: String, adlar: VakitAdlari)?
    nonisolated(unsafe) private static var _sonHam: (dil: String, ham: String?)?

    /// Son okunan takim ve okundugu ARAYUZ dili. `VakitMetinleri.dil(_:)` takimi yalniz
    /// istenen dil bu dilse uygular (Siri paket dili uygulama dilinden farkliysa tablo).
    public static var etkin: (dil: String, adlar: VakitAdlari)? {
        kilit.lock(); defer { kilit.unlock() }
        return _etkin
    }

    /// Ham JSON'u (degistiyse) cozup etkin takim yapar; nil/bozuk → takim yok.
    public static func etkinYap(_ ham: String?, dil: String) {
        let d = ArayuzDili.coz(dil)
        kilit.lock(); defer { kilit.unlock() }
        if let son = _sonHam, son.dil == d, son.ham == ham { return }
        _sonHam = (d, ham)
        _etkin = coz(ham).map { (d, $0) }
    }
}

/// Dil basina metinler (W5). Turkce metinler TS ikizi `siriKarari.ts` ve ortak fikstur
/// `siri-ornek.json` ile BAYT BAYT kilitlidir; Ingilizce karsiliklar JS sozlugunden
/// (`sozluk/en/genel.ts > kildim.sonuc`, `vakit.adlar`, `samimiyet.kabulDuasi`).
/// Yer tutucular `{ad}`, `{saat}`, `{giris}`, `{dua}` — `bicim` doldurur.
///
/// Duzen (ceviri ajanlari icin): dil basina bir `static let`, sira tr, en, id, de, fr, bs,
/// ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo; cevrilmemis dilin ornegi Ingilizcenin birebir kopyasidir ve `// ÇEVİRİ: <kod>`
/// satiriyla baslar; Ozbekce ornegi Latin, Kazakca Kiril yazilir (`docs/ajan/coklu-dil.md > Alfabe`).
/// Nobetci: `test/main.swift` (her dil Turkceyle ayni yer tutucular).
public struct VakitMetinleri: Equatable {
    public let dil: String
    /// Kilinabilir vakitlerin widget kodu → gorunen ad (`sabah`...`yatsi`). Kullanicinin
    /// vakit adi takimi (`VakitAdlari`) varsa `dil(_:)` bunu ezer.
    public var adlar: [String: String]
    public var gunes: String
    public let konumYok: String
    public let veriEski: String
    public let girisBugun: String
    public let girisYarin: String
    public let suAnVakti: String
    public let suAnVaktiCikis: String
    public let siradakiNamaz: String
    public let isaretlendi: String
    public let zatenKilindi: String
    public let vakitYok: String
    public let vakitYokSiradaki: String
    public let onay: String
    public let vakitDegisti: String
    /// Samimiyet: telefon `KABUL_DUASI` (tek sabit kalip).
    public let kabulDuasi: String
    /// Eylem ("Kıldım") ve durum ("Kılındı") etiketleri.
    public let kildim: String
    public let kilindi: String
    /// Kontrol Merkezi kontrolu basliklari.
    public let kontrolKildim: String
    public let kontrolKilindi: String
    public let kontrolVakitYok: String
    public let uygulamayiAcin: String

    public static let tr = VakitMetinleri(
        dil: "tr",
        adlar: ["sabah": "Sabah", "ogle": "Öğle", "ikindi": "İkindi", "aksam": "Akşam", "yatsi": "Yatsı"],
        gunes: "Güneş",
        konumYok: "Vakitleri hesaplayabilmek için uygulamayı açıp konumunuzu ayarlayın.",
        veriEski: "Vakit bilgisi eskimiş. Güncellemek için uygulamayı bir kez açın.",
        girisBugun: "saat {saat}",
        girisYarin: "yarın saat {saat}",
        suAnVakti: "Şu an {ad} vakti.",
        suAnVaktiCikis: "Şu an {ad} vakti, çıkışı saat {saat}.",
        siradakiNamaz: "Sıradaki namaz {ad}, {giris}.",
        isaretlendi: "{ad} namazınız kılındı olarak işaretlendi. {dua}.",
        zatenKilindi: "{ad} namazı zaten kılındı olarak işaretli.",
        vakitYok: "Şu an kılınacak vakit yok.",
        vakitYokSiradaki: "Şu an kılınacak vakit yok. Sıradaki {ad}, {giris}.",
        onay: "{ad} namazı kılındı olarak işaretlensin mi?",
        vakitDegisti: "Vakit değişti, işaretleme yapılmadı. Lütfen yeniden deneyin.",
        kabulDuasi: "Allah kabul etsin",
        kildim: "Kıldım",
        kilindi: "Kılındı",
        kontrolKildim: "{ad} · Kıldım",
        kontrolKilindi: "{ad} kılındı",
        kontrolVakitYok: "Kılınacak vakit yok",
        uygulamayiAcin: "Uygulamayı açın"
    )

    public static let en = VakitMetinleri(
        dil: "en",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )


    // id — Endonezce (beta); JS `sozluk/id/genel.ts > kildim.sonuc`
    public static let id = VakitMetinleri(
        dil: "id",
        adlar: ["sabah": "Subuh", "ogle": "Dzuhur", "ikindi": "Ashar", "aksam": "Maghrib", "yatsi": "Isya"],
        gunes: "Terbit",
        konumYok: "Buka aplikasi dan atur lokasi Anda agar waktu salat dapat dihitung.",
        veriEski: "Waktu salat sudah usang. Buka aplikasi sekali untuk memperbaruinya.",
        girisBugun: "pukul {saat}",
        girisYarin: "besok pukul {saat}",
        suAnVakti: "Sekarang waktu {ad}.",
        suAnVaktiCikis: "Sekarang waktu {ad}; berakhir pukul {saat}.",
        siradakiNamaz: "Salat berikutnya {ad} {giris}.",
        isaretlendi: "Salat {ad} Anda ditandai sudah ditunaikan. {dua}.",
        zatenKilindi: "Salat {ad} sudah ditandai ditunaikan.",
        vakitYok: "Saat ini tidak ada waktu salat yang berjalan.",
        vakitYokSiradaki: "Saat ini tidak ada waktu salat yang berjalan. Berikutnya {ad}, masuk {giris}.",
        onay: "Tandai salat {ad} sudah ditunaikan?",
        vakitDegisti: "Waktu salat berganti, penandaan tidak dilakukan. Coba lagi.",
        kabulDuasi: "Semoga Allah menerimanya",
        kildim: "Sudah salat",
        kilindi: "Ditunaikan",
        kontrolKildim: "{ad} · Sudah salat",
        kontrolKilindi: "{ad} ditunaikan",
        kontrolVakitYok: "Tidak ada waktu salat",
        uygulamayiAcin: "Buka aplikasi"
    )


    // de — Almanca (beta): JS `sozluk/de` (hitap "Sie", "bitte" yok)
    public static let de = VakitMetinleri(
        dil: "de",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sonnenaufgang",
        konumYok: "Öffnen Sie die App und legen Sie Ihren Standort fest, damit die Gebetszeiten berechnet werden können.",
        veriEski: "Die Gebetszeiten sind veraltet. Öffnen Sie die App einmal, um sie zu aktualisieren.",
        girisBugun: "um {saat}",
        girisYarin: "morgen um {saat}",
        suAnVakti: "Jetzt ist {ad}-Zeit.",
        suAnVaktiCikis: "Jetzt ist {ad}-Zeit; sie endet um {saat}.",
        siradakiNamaz: "Das nächste Gebet ist {ad} {giris}.",
        isaretlendi: "{ad} wurde als gebetet markiert. {dua}.",
        zatenKilindi: "{ad} ist bereits als gebetet markiert.",
        vakitYok: "Gerade gibt es keine Gebetszeit zu markieren.",
        vakitYokSiradaki: "Gerade gibt es keine Gebetszeit zu markieren. Als Nächstes {ad}, Beginn {giris}.",
        onay: "{ad} als gebetet markieren?",
        vakitDegisti: "Die Gebetszeit hat gewechselt, daher wurde nichts markiert. Versuchen Sie es erneut.",
        kabulDuasi: "Möge Allah es annehmen",
        kildim: "Ich habe gebetet",
        kilindi: "Gebetet",
        kontrolKildim: "{ad} · Ich habe gebetet",
        kontrolKilindi: "{ad} gebetet",
        kontrolVakitYok: "Kein Gebet zu markieren",
        uygulamayiAcin: "App öffnen"
    )


    // fr
    public static let fr = VakitMetinleri(
        dil: "fr",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Lever du soleil",
        konumYok: "Ouvrez l’application et définissez votre position pour que les heures de prière puissent être calculées.",
        veriEski: "Les heures de prière ne sont plus à jour. Ouvrez l’application une fois pour les mettre à jour.",
        girisBugun: "à {saat}",
        girisYarin: "demain à {saat}",
        suAnVakti: "{ad} est en cours.",
        suAnVaktiCikis: "{ad} est en cours, jusqu’à {saat}.",
        siradakiNamaz: "La prochaine prière est {ad}, {giris}.",
        isaretlendi: "{ad} est marqué comme accompli. {dua}.",
        zatenKilindi: "{ad} est déjà marqué comme accompli.",
        vakitYok: "Aucune prière à marquer pour l’instant.",
        vakitYokSiradaki: "Aucune prière à marquer pour l’instant. Prochaine prière : {ad}, {giris}.",
        onay: "Marquer {ad} comme accompli ?",
        vakitDegisti: "L’heure de prière a changé, rien n’a été marqué. Réessayez.",
        kabulDuasi: "Qu’Allah l’accepte",
        kildim: "J’ai prié",
        kilindi: "Accomplie",
        kontrolKildim: "{ad} · J’ai prié",
        kontrolKilindi: "{ad} accompli",
        kontrolVakitYok: "Aucune prière à marquer",
        uygulamayiAcin: "Ouvrez l’application"
    )


    // bs
    public static let bs = VakitMetinleri(
        dil: "bs",
        adlar: ["sabah": "Sabah", "ogle": "Podne", "ikindi": "Ikindija", "aksam": "Akšam", "yatsi": "Jacija"],
        gunes: "Izlazak sunca",
        konumYok: "Otvorite aplikaciju i podesite svoju lokaciju da bi se vremena mogla izračunati.",
        veriEski: "Vremena su zastarjela. Otvorite aplikaciju jednom da ih ažurirate.",
        girisBugun: "u {saat}",
        girisYarin: "sutra u {saat}",
        suAnVakti: "Trenutni vakat: {ad}.",
        suAnVaktiCikis: "Trenutni vakat: {ad}; ističe u {saat}.",
        siradakiNamaz: "Sljedeći namaz: {ad}, {giris}.",
        isaretlendi: "{ad}: Vaš namaz je označen kao klanjan. {dua}.",
        zatenKilindi: "{ad}: namaz je već označen kao klanjan.",
        vakitYok: "Trenutno nema vakta za klanjanje.",
        vakitYokSiradaki: "Trenutno nema vakta za klanjanje. Sljedeći je {ad}, {giris}.",
        onay: "Označiti namaz ({ad}) kao klanjan?",
        vakitDegisti: "Vakat se promijenio, označavanje nije izvršeno. Pokušajte ponovo.",
        kabulDuasi: "Allah kabul ejlesun",
        kildim: "Klanjano",
        kilindi: "Klanjano",
        kontrolKildim: "{ad} · Klanjano",
        kontrolKilindi: "{ad}: klanjano",
        kontrolVakitYok: "Nema vakta za klanjanje",
        uygulamayiAcin: "Otvorite aplikaciju"
    )


    // ru
    public static let ru = VakitMetinleri(
        dil: "ru",
        adlar: ["sabah": "Фаджр", "ogle": "Зухр", "ikindi": "Аср", "aksam": "Магриб", "yatsi": "Иша"],
        gunes: "Восход",
        konumYok: "Откройте приложение и укажите местоположение, чтобы рассчитать время намазов.",
        veriEski: "Время намазов устарело. Откройте приложение один раз, чтобы обновить его.",
        girisBugun: "в {saat}",
        girisYarin: "завтра в {saat}",
        suAnVakti: "Сейчас время намаза {ad}.",
        suAnVaktiCikis: "Сейчас время намаза {ad}; оно заканчивается в {saat}.",
        siradakiNamaz: "Следующий намаз — {ad} {giris}.",
        isaretlendi: "Намаз {ad} отмечен как совершённый. {dua}.",
        zatenKilindi: "Намаз {ad} уже отмечен как совершённый.",
        vakitYok: "Сейчас нет намаза для отметки.",
        vakitYokSiradaki: "Сейчас нет намаза для отметки. Следующий — {ad} {giris}.",
        onay: "Отметить намаз {ad} как совершённый?",
        vakitDegisti: "Время намаза сменилось, отметка не сделана. Повторите попытку.",
        kabulDuasi: "Да примет Аллах",
        kildim: "Намаз совершён",
        kilindi: "Совершён",
        kontrolKildim: "{ad} · Намаз совершён",
        kontrolKilindi: "Намаз {ad} совершён",
        kontrolVakitYok: "Нет намаза для отметки",
        uygulamayiAcin: "Откройте приложение"
    )


    // ms
    public static let ms = VakitMetinleri(
        dil: "ms",
        adlar: ["sabah": "Subuh", "ogle": "Zohor", "ikindi": "Asar", "aksam": "Maghrib", "yatsi": "Isyak"],
        gunes: "Syuruk",
        konumYok: "Buka aplikasi dan tetapkan lokasi anda supaya waktu solat dapat dikira.",
        veriEski: "Waktu solat sudah lapuk. Buka aplikasi sekali untuk mengemas kininya.",
        girisBugun: "pada pukul {saat}",
        girisYarin: "esok pada pukul {saat}",
        suAnVakti: "Sekarang waktu {ad}.",
        suAnVaktiCikis: "Sekarang waktu {ad}; ia tamat pada pukul {saat}.",
        siradakiNamaz: "Solat seterusnya ialah {ad}, {giris}.",
        isaretlendi: "Solat {ad} anda telah ditandakan sebagai ditunaikan. {dua}.",
        zatenKilindi: "Solat {ad} sudah ditandakan sebagai ditunaikan.",
        vakitYok: "Tiada solat untuk ditandakan buat masa ini.",
        vakitYokSiradaki: "Tiada solat untuk ditandakan buat masa ini. Seterusnya {ad}, {giris}.",
        onay: "Tandakan solat {ad} sebagai ditunaikan?",
        vakitDegisti: "Waktu solat telah berubah, jadi tiada apa yang ditandakan. Cuba lagi.",
        kabulDuasi: "Semoga Allah menerimanya",
        kildim: "Sudah solat",
        kilindi: "Ditunaikan",
        kontrolKildim: "{ad} · Sudah solat",
        kontrolKilindi: "{ad} ditunaikan",
        kontrolVakitYok: "Tiada solat untuk ditandakan",
        uygulamayiAcin: "Buka aplikasi"
    )


    // ar — Arapça (beta): JS `sozluk/ar` (vakit.adlar, genel.kildim.sonuc, samimiyet.kabulDuasi);
    // yönetim metni mastar/isim kalıbı, "Kıldım" = صلّيتُ, "Kılındı" = تمّت.
    public static let ar = VakitMetinleri(
        dil: "ar",
        adlar: ["sabah": "الفجر", "ogle": "الظهر", "ikindi": "العصر", "aksam": "المغرب", "yatsi": "العشاء"],
        gunes: "الشروق",
        konumYok: "لحساب المواقيت يلزم فتح التطبيق وضبط موقعك.",
        veriEski: "المواقيت قديمة. لتحديثها يكفي فتح التطبيق مرة واحدة.",
        girisBugun: "الساعة {saat}",
        girisYarin: "غدًا الساعة {saat}",
        suAnVakti: "الآن وقت {ad}.",
        suAnVaktiCikis: "الآن وقت {ad}، وينتهي الساعة {saat}.",
        siradakiNamaz: "الصلاة التالية {ad}، {giris}.",
        isaretlendi: "وُضعت علامة «تمّت» على صلاة {ad}. {dua}.",
        zatenKilindi: "صلاة {ad} معلَّمة «تمّت» بالفعل.",
        vakitYok: "لا صلاة لتعليمها الآن.",
        vakitYokSiradaki: "لا صلاة لتعليمها الآن. التالية {ad}، {giris}.",
        onay: "هل تُوضع علامة «تمّت» على صلاة {ad}؟",
        vakitDegisti: "تغيّر الوقت فلم تُوضع العلامة. يُرجى إعادة المحاولة.",
        kabulDuasi: "تقبّل الله",
        kildim: "صلّيتُ",
        kilindi: "تمّت",
        kontrolKildim: "{ad} · صلّيتُ",
        kontrolKilindi: "{ad} · تمّت",
        kontrolVakitYok: "لا صلاة لتعليمها",
        uygulamayiAcin: "فتح التطبيق"
    )


    // ur
    public static let ur = VakitMetinleri(
        dil: "ur",
        adlar: ["sabah": "فجر", "ogle": "ظہر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشاء"],
        gunes: "طلوعِ آفتاب",
        konumYok: "نماز کے اوقات معلوم کرنے کے لیے ایپ کھولیں اور اپنا مقام منتخب کریں۔",
        veriEski: "نماز کے اوقات پرانے ہو گئے ہیں۔ اپ ڈیٹ کرنے کے لیے ایپ ایک بار کھولیں۔",
        girisBugun: "{saat} پر",
        girisYarin: "کل {saat} پر",
        suAnVakti: "ابھی {ad} کا وقت ہے۔",
        suAnVaktiCikis: "ابھی {ad} کا وقت ہے؛ یہ {saat} پر ختم ہوتا ہے۔",
        siradakiNamaz: "اگلی نماز {ad} ہے، {giris}۔",
        isaretlendi: "{ad} کی نماز پر ادا شدہ کا نشان لگ گیا۔ {dua}۔",
        zatenKilindi: "{ad} کی نماز پر پہلے سے ادا شدہ کا نشان لگا ہے۔",
        vakitYok: "اس وقت نشان لگانے کے لیے کوئی نماز نہیں۔",
        vakitYokSiradaki: "اس وقت نشان لگانے کے لیے کوئی نماز نہیں۔ اگلی نماز {ad} ہے، {giris}۔",
        onay: "{ad} کی نماز پر ادا شدہ کا نشان لگائیں؟",
        vakitDegisti: "نماز کا وقت بدل گیا، اس لیے نشان نہیں لگایا گیا۔ دوبارہ کوشش کریں۔",
        kabulDuasi: "اللہ قبول فرمائے",
        kildim: "نماز پڑھ لی",
        kilindi: "ادا شدہ",
        kontrolKildim: "{ad} · نماز پڑھ لی",
        kontrolKilindi: "{ad} ادا شدہ",
        kontrolVakitYok: "نشان لگانے کو کوئی نماز نہیں",
        uygulamayiAcin: "ایپ کھولیں"
    )

    // es — İspanyolca (beta); terimler JS sozluk/es (Kıldım "Ya recé", Kılındı "Rezado", hitap "usted")
    public static let es = VakitMetinleri(
        dil: "es",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Salida del sol",
        konumYok: "Abra la aplicación y establezca su ubicación para poder calcular las horas de rezo.",
        veriEski: "Las horas de rezo no están actualizadas. Abra la aplicación una vez para actualizarlas.",
        girisBugun: "a las {saat}",
        girisYarin: "mañana a las {saat}",
        suAnVakti: "Ahora es la hora de {ad}.",
        suAnVaktiCikis: "Ahora es la hora de {ad}; termina a las {saat}.",
        siradakiNamaz: "El siguiente rezo es {ad}, {giris}.",
        isaretlendi: "{ad} se marcó como rezado. {dua}.",
        zatenKilindi: "{ad} ya está marcado como rezado.",
        vakitYok: "Ahora no hay ningún rezo para marcar.",
        vakitYokSiradaki: "Ahora no hay ningún rezo para marcar. Siguiente: {ad}, {giris}.",
        onay: "¿Marcar {ad} como rezado?",
        vakitDegisti: "La hora del rezo cambió y no se marcó nada. Vuelva a intentarlo.",
        kabulDuasi: "Que Allah lo acepte",
        kildim: "Ya recé",
        kilindi: "Rezado",
        kontrolKildim: "{ad} · Ya recé",
        kontrolKilindi: "{ad} rezado",
        kontrolVakitYok: "No hay rezo para marcar",
        uygulamayiAcin: "Abra la aplicación"
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl` (hitap "u"; "Kıldım"/"Kılındı" = "Gebeden")
    public static let nl = VakitMetinleri(
        dil: "nl",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Zonsopkomst",
        konumYok: "Open de app en stel uw locatie in, zodat de gebedstijden kunnen worden berekend.",
        veriEski: "De gebedstijden zijn verouderd. Open de app één keer om ze bij te werken.",
        girisBugun: "om {saat}",
        girisYarin: "morgen om {saat}",
        suAnVakti: "Het is nu tijd voor {ad}.",
        suAnVaktiCikis: "Het is nu tijd voor {ad}; die eindigt om {saat}.",
        siradakiNamaz: "Het volgende gebed is {ad} {giris}.",
        isaretlendi: "{ad} is als gebeden gemarkeerd. {dua}.",
        zatenKilindi: "{ad} is al als gebeden gemarkeerd.",
        vakitYok: "Er is nu geen gebed om te markeren.",
        vakitYokSiradaki: "Er is nu geen gebed om te markeren. Hierna komt {ad} {giris}.",
        onay: "{ad} als gebeden markeren?",
        vakitDegisti: "De gebedstijd is veranderd, daarom is er niets gemarkeerd. Probeer het opnieuw.",
        kabulDuasi: "Moge Allah het accepteren",
        kildim: "Gebeden",
        kilindi: "Gebeden",
        kontrolKildim: "{ad} · Gebeden",
        kontrolKilindi: "{ad} gebeden",
        kontrolVakitYok: "Geen gebed om te markeren",
        uygulamayiAcin: "Open de app"
    )

    // sq — Arnavutça (beta): JS `sozluk/sq/genel.ts > kildim.sonuc` (hitap "ju", "E fala" / "U fal")
    public static let sq = VakitMetinleri(
        dil: "sq",
        adlar: ["sabah": "Sabahu", "ogle": "Dreka", "ikindi": "Ikindia", "aksam": "Akshami", "yatsi": "Jacia"],
        gunes: "Lindja e Diellit",
        konumYok: "Hapni aplikacionin dhe caktoni vendndodhjen që të llogariten kohët e namazit.",
        veriEski: "Kohët e namazit janë të vjetruara. Hapni aplikacionin një herë për t’i përditësuar.",
        girisBugun: "në orën {saat}",
        girisYarin: "nesër në orën {saat}",
        suAnVakti: "Tani është koha: {ad}.",
        suAnVaktiCikis: "Tani është koha: {ad}; del në orën {saat}.",
        siradakiNamaz: "Namazi i radhës: {ad}, {giris}.",
        isaretlendi: "{ad}: u shënua si i falur. {dua}.",
        zatenKilindi: "{ad}: është shënuar tashmë si i falur.",
        vakitYok: "Tani nuk ka vakt për t’u shënuar.",
        vakitYokSiradaki: "Tani nuk ka vakt për t’u shënuar. Në vijim: {ad}, {giris}.",
        onay: "{ad}: ta shënoni si të falur?",
        vakitDegisti: "Vakti ndryshoi, prandaj nuk u shënua asgjë. Provoni sërish.",
        kabulDuasi: "Allahu e pranoftë",
        kildim: "E fala",
        kilindi: "U fal",
        kontrolKildim: "{ad} · E fala",
        kontrolKilindi: "{ad}: u fal",
        kontrolVakitYok: "Nuk ka vakt për t’u shënuar",
        uygulamayiAcin: "Hapni aplikacionin"
    )

    // hi — Hintçe (beta): JS `sozluk/hi`; Kıldım "नमाज़ पढ़ ली", Kılındı "पढ़ ली गई"
    public static let hi = VakitMetinleri(
        dil: "hi",
        adlar: ["sabah": "फ़ज्र", "ogle": "ज़ुहर", "ikindi": "अस्र", "aksam": "मग़रिब", "yatsi": "इशा"],
        gunes: "सूर्योदय",
        konumYok: "नमाज़ के वक़्त जानने के लिए ऐप खोलें और अपनी लोकेशन चुनें।",
        veriEski: "नमाज़ के वक़्त पुराने हो गए हैं। अपडेट करने के लिए ऐप एक बार खोलें।",
        girisBugun: "{saat} पर",
        girisYarin: "कल {saat} पर",
        suAnVakti: "अभी {ad} का वक़्त है।",
        suAnVaktiCikis: "अभी {ad} का वक़्त है; यह {saat} पर ख़त्म होता है।",
        siradakiNamaz: "अगली नमाज़ {ad} है, {giris}।",
        isaretlendi: "{ad} की नमाज़ पर \"पढ़ ली गई\" का निशान लग गया। {dua}।",
        zatenKilindi: "{ad} की नमाज़ पर पहले से \"पढ़ ली गई\" का निशान लगा है।",
        vakitYok: "अभी निशान लगाने के लिए कोई नमाज़ नहीं है।",
        vakitYokSiradaki: "अभी निशान लगाने के लिए कोई नमाज़ नहीं है। अगली नमाज़ {ad} है, {giris}।",
        onay: "{ad} की नमाज़ पर \"पढ़ ली गई\" का निशान लगाएं?",
        vakitDegisti: "नमाज़ का वक़्त बदल गया, इसलिए निशान नहीं लगाया गया। फिर से कोशिश करें।",
        kabulDuasi: "अल्लाह क़बूल करे",
        kildim: "नमाज़ पढ़ ली",
        kilindi: "पढ़ ली गई",
        kontrolKildim: "{ad} · नमाज़ पढ़ ली",
        kontrolKilindi: "{ad} पढ़ ली गई",
        kontrolVakitYok: "निशान के लिए कोई नमाज़ नहीं",
        uygulamayiAcin: "ऐप खोलें"
    )

    // bn — Bengalce (beta): JS `sozluk/bn` (vakit.adlar, genel.kildim.sonuc, samimiyet.kabulDuasi);
    // "Kıldım" = "নামাজ পড়েছি", "Kılındı" = "পড়া হয়েছে"; rakam Batı (0-9).
    public static let bn = VakitMetinleri(
        dil: "bn",
        adlar: ["sabah": "ফজর", "ogle": "যোহর", "ikindi": "আসর", "aksam": "মাগরিব", "yatsi": "ইশা"],
        gunes: "সূর্যোদয়",
        konumYok: "নামাজের সময় হিসাব করতে অ্যাপ খুলে আপনার অবস্থান সেট করুন।",
        veriEski: "নামাজের সময়ের তথ্য পুরোনো হয়ে গেছে। হালনাগাদ করতে একবার অ্যাপ খুলুন।",
        girisBugun: "{saat}-এ",
        girisYarin: "আগামীকাল {saat}-এ",
        suAnVakti: "এখন {ad}-এর ওয়াক্ত।",
        suAnVaktiCikis: "এখন {ad}-এর ওয়াক্ত; শেষ হবে {saat}-এ।",
        siradakiNamaz: "পরবর্তী নামাজ {ad}, {giris}।",
        isaretlendi: "{ad} পড়া হয়েছে হিসেবে চিহ্নিত হয়েছে। {dua}।",
        zatenKilindi: "{ad} আগেই পড়া হয়েছে হিসেবে চিহ্নিত আছে।",
        vakitYok: "এখন চিহ্নিত করার মতো কোনো নামাজ নেই।",
        vakitYokSiradaki: "এখন চিহ্নিত করার মতো কোনো নামাজ নেই। পরবর্তী {ad}, {giris}।",
        onay: "{ad} পড়া হয়েছে হিসেবে চিহ্নিত করবেন?",
        vakitDegisti: "নামাজের ওয়াক্ত বদলে গেছে, তাই কিছু চিহ্নিত হয়নি। আবার চেষ্টা করুন।",
        kabulDuasi: "আল্লাহ কবুল করুন",
        kildim: "নামাজ পড়েছি",
        kilindi: "পড়া হয়েছে",
        kontrolKildim: "{ad} · নামাজ পড়েছি",
        kontrolKilindi: "{ad} পড়া হয়েছে",
        kontrolVakitYok: "চিহ্নিত করার মতো নামাজ নেই",
        uygulamayiAcin: "অ্যাপ খুলুন"
    )

    // fa — Farsça (beta): JS `sozluk/fa` (Kıldım "خواندم", Kılındı "خوانده شد", hitap "شما")
    public static let fa = VakitMetinleri(
        dil: "fa",
        adlar: ["sabah": "صبح", "ogle": "ظهر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشا"],
        gunes: "طلوع آفتاب",
        konumYok: "برای محاسبهٔ اوقات نماز، برنامه را باز کنید و موقعیت خود را تنظیم کنید.",
        veriEski: "اوقات نماز قدیمی شده است. برای به‌روزرسانی، یک بار برنامه را باز کنید.",
        girisBugun: "ساعت {saat}",
        girisYarin: "فردا ساعت {saat}",
        suAnVakti: "اکنون وقت {ad} است.",
        suAnVaktiCikis: "اکنون وقت {ad} است؛ ساعت {saat} تمام می‌شود.",
        siradakiNamaz: "نماز بعدی {ad} است، {giris}.",
        isaretlendi: "نماز {ad} خوانده‌شده علامت خورد. {dua}.",
        zatenKilindi: "نماز {ad} از پیش خوانده‌شده علامت خورده است.",
        vakitYok: "اکنون نمازی برای علامت زدن نیست.",
        vakitYokSiradaki: "اکنون نمازی برای علامت زدن نیست. نماز بعدی {ad} است، {giris}.",
        onay: "نماز {ad} خوانده‌شده علامت بخورد؟",
        vakitDegisti: "وقت نماز عوض شد و علامتی زده نشد. دوباره امتحان کنید.",
        kabulDuasi: "قبول باشد",
        kildim: "خواندم",
        kilindi: "خوانده شد",
        kontrolKildim: "{ad} · خواندم",
        kontrolKilindi: "{ad} خوانده شد",
        kontrolVakitYok: "نمازی برای علامت زدن نیست",
        uygulamayiAcin: "باز کردن برنامه"
    )

    // ps — Peştuca (beta); terimler JS sozluk/ps (Kıldım "لمونځ مې وکړ", Kılındı "ادا شو", hitap "تاسو")
    public static let ps = VakitMetinleri(
        dil: "ps",
        adlar: ["sabah": "سهار", "ogle": "ماسپښین", "ikindi": "مازدیګر", "aksam": "ماښام", "yatsi": "ماسخوتن"],
        gunes: "لمر ختل",
        konumYok: "د دې لپاره چې د لمانځه وختونه حساب شي، اپ پرانیزئ او خپل موقعیت برابر کړئ.",
        veriEski: "د لمانځه وختونه زاړه دي. د تازه کولو لپاره اپ یو ځل پرانیزئ.",
        girisBugun: "په {saat} بجو",
        girisYarin: "سبا په {saat} بجو",
        suAnVakti: "اوس د {ad} وخت دی.",
        suAnVaktiCikis: "اوس د {ad} وخت دی؛ په {saat} بجو پای ته رسېږي.",
        siradakiNamaz: "بل لمونځ {ad} دی، {giris}.",
        isaretlendi: "د {ad} لمونځ د ادا شوي په توګه نښه شو. {dua}.",
        zatenKilindi: "د {ad} لمونځ دمخه د ادا شوي په توګه نښه شوی.",
        vakitYok: "اوس د نښه کولو لمونځ نشته.",
        vakitYokSiradaki: "اوس د نښه کولو لمونځ نشته. بل {ad} دی، {giris}.",
        onay: "ایا د {ad} لمونځ د ادا شوي په توګه نښه شي؟",
        vakitDegisti: "د لمانځه وخت بدل شو، نو هېڅ نښه نه شو. بیا هڅه وکړئ.",
        kabulDuasi: "الله دې قبول کړي",
        kildim: "لمونځ مې وکړ",
        kilindi: "ادا شو",
        kontrolKildim: "{ad} · لمونځ مې وکړ",
        kontrolKilindi: "{ad} ادا شو",
        kontrolVakitYok: "د نښه کولو لمونځ نشته",
        uygulamayiAcin: "اپ پرانیزئ"
    )

    // ckb
    public static let ckb = VakitMetinleri(
        dil: "ckb",
        adlar: ["sabah": "بەیانی", "ogle": "نیوەڕۆ", "ikindi": "عەسر", "aksam": "ئێوارە", "yatsi": "خەوتنان"],
        gunes: "خۆرھەڵاتن",
        konumYok: "ئەپەکە بکەنەوە و شوێنەکەتان دیاری بکەن بۆ ئەوەی کاتەکانی نوێژ ھەژمار بکرێن.",
        veriEski: "کاتەکانی نوێژ کۆن بوون. بۆ نوێکردنەوە یەک جار ئەپەکە بکەنەوە.",
        girisBugun: "کاتژمێر {saat}",
        girisYarin: "سبەینێ کاتژمێر {saat}",
        suAnVakti: "ئێستا کاتی {ad} ھاتووە.",
        suAnVaktiCikis: "ئێستا کاتی {ad} ھاتووە؛ لە {saat} کۆتایی دێت.",
        siradakiNamaz: "نوێژی داھاتوو {ad}، {giris}.",
        isaretlendi: "{ad} وەک کراو نیشانە کرا. {dua}.",
        zatenKilindi: "{ad} پێشتر وەک کراو نیشانە کراوە.",
        vakitYok: "ئێستا ھیچ نوێژێک بۆ نیشانەکردن نییە.",
        vakitYokSiradaki: "ئێستا ھیچ نوێژێک بۆ نیشانەکردن نییە. داھاتوو: {ad}، {giris}.",
        onay: "{ad} وەک کراو نیشانە بکرێت؟",
        vakitDegisti: "کاتی نوێژ گۆڕا، بۆیە ھیچ شتێک نیشانە نەکرا. دووبارە ھەوڵ بدەنەوە.",
        kabulDuasi: "خوا قبوڵی بکات",
        kildim: "نوێژم کرد",
        kilindi: "کرا",
        kontrolKildim: "{ad} · نوێژم کرد",
        kontrolKilindi: "{ad} کرا",
        kontrolVakitYok: "ھیچ نوێژێک بۆ نیشانەکردن نییە",
        uygulamayiAcin: "ئەپەکە بکەنەوە"
    )

    // ug — Uygurca (beta); terimler src/core/dil/sozluk/ug ("ناماز ئوقۇدۇم" / "ئوقۇلدى", hitap "سىز")
    public static let ug = VakitMetinleri(
        dil: "ug",
        adlar: ["sabah": "بامدات", "ogle": "پېشىن", "ikindi": "ئەسىر", "aksam": "شام", "yatsi": "خۇپتەن"],
        gunes: "قۇياش چىقىش",
        konumYok: "ۋاقىتلارنى ھېسابلاش ئۈچۈن ئەپنى ئېچىپ ئورنىڭىزنى تەڭشەڭ.",
        veriEski: "ۋاقىت ئۇچۇرى كونىراپ كەتتى. يېڭىلاش ئۈچۈن ئەپنى بىر قېتىم ئېچىڭ.",
        girisBugun: "سائەت {saat} دا",
        girisYarin: "ئەتە سائەت {saat} دا",
        suAnVakti: "ھازىر {ad} ۋاقتى.",
        suAnVaktiCikis: "ھازىر {ad} ۋاقتى، چىقىشى سائەت {saat}.",
        siradakiNamaz: "كېيىنكى ناماز {ad}، {giris}.",
        isaretlendi: "{ad} نامىزىڭىز ئوقۇلدى دەپ بەلگىلەندى. {dua}.",
        zatenKilindi: "{ad} نامىزى ئاللىبۇرۇن ئوقۇلدى دەپ بەلگىلەنگەن.",
        vakitYok: "ھازىر ئوقۇلىدىغان ۋاقىت يوق.",
        vakitYokSiradaki: "ھازىر ئوقۇلىدىغان ۋاقىت يوق. كېيىنكىسى {ad}، {giris}.",
        onay: "{ad} نامىزى ئوقۇلدى دەپ بەلگىلەنسۇنمۇ؟",
        vakitDegisti: "ۋاقىت ئۆزگەردى، بەلگىلەنمىدى. قايتا سىناڭ.",
        kabulDuasi: "ئاللاھ قوبۇل قىلسۇن",
        kildim: "ناماز ئوقۇدۇم",
        kilindi: "ئوقۇلدى",
        kontrolKildim: "{ad} · ناماز ئوقۇدۇم",
        kontrolKilindi: "{ad} ئوقۇلدى",
        kontrolVakitYok: "ئوقۇلىدىغان ۋاقىت يوق",
        uygulamayiAcin: "ئەپنى ئېچىڭ"
    )

    // az — Azerice (beta); terimler src/core/dil/sozluk/az ("Qıldım" / "Qılındı", hitap "siz")
    public static let az = VakitMetinleri(
        dil: "az",
        adlar: ["sabah": "Sübh", "ogle": "Zöhr", "ikindi": "Əsr", "aksam": "Məğrib", "yatsi": "İşa"],
        gunes: "Günəş",
        konumYok: "Vaxtları hesablaya bilmək üçün tətbiqi açıb məkanınızı tənzimləyin.",
        veriEski: "Vaxt məlumatı köhnəlib. Yeniləmək üçün tətbiqi bir dəfə açın.",
        girisBugun: "saat {saat}",
        girisYarin: "sabah saat {saat}",
        suAnVakti: "İndi {ad} vaxtıdır.",
        suAnVaktiCikis: "İndi {ad} vaxtıdır, çıxışı saat {saat}.",
        siradakiNamaz: "Növbəti namaz {ad}, {giris}.",
        isaretlendi: "{ad} namazınız qılındı kimi qeyd olundu. {dua}.",
        zatenKilindi: "{ad} namazı artıq qılındı kimi qeyd olunub.",
        vakitYok: "Hazırda qılınacaq vaxt yoxdur.",
        vakitYokSiradaki: "Hazırda qılınacaq vaxt yoxdur. Növbəti {ad}, {giris}.",
        onay: "{ad} namazı qılındı kimi qeyd olunsun?",
        vakitDegisti: "Vaxt dəyişdi, qeyd edilmədi. Yenidən cəhd edin.",
        kabulDuasi: "Allah qəbul etsin",
        kildim: "Qıldım",
        kilindi: "Qılındı",
        kontrolKildim: "{ad} · Qıldım",
        kontrolKilindi: "{ad} qılındı",
        kontrolVakitYok: "Qılınacaq vaxt yoxdur",
        uygulamayiAcin: "Tətbiqi açın"
    )

    // uz — Ozbekce (beta, LATIN); terimler src/core/dil/sozluk/uz (Kiril kaynak → kirildenLatine; "Oʻqidim" / "Oʻqildi", hitap "Siz")
    public static let uz = VakitMetinleri(
        dil: "uz",
        adlar: ["sabah": "Bomdod", "ogle": "Peshin", "ikindi": "Asr", "aksam": "Shom", "yatsi": "Xufton"],
        gunes: "Quyosh",
        konumYok: "Namoz vaqtlarini hisoblash uchun ilovani ochib, joylashuvingizni belgilang.",
        veriEski: "Namoz vaqtlari eskirgan. Yangilash uchun ilovani bir marta oching.",
        girisBugun: "soat {saat} da",
        girisYarin: "ertaga soat {saat} da",
        suAnVakti: "Hozir {ad} vaqti.",
        suAnVaktiCikis: "Hozir {ad} vaqti; soat {saat} da tugaydi.",
        siradakiNamaz: "Keyingi namoz {ad}, {giris}.",
        isaretlendi: "{ad} namozi oʻqildi deb belgilandi. {dua}.",
        zatenKilindi: "{ad} namozi allaqachon oʻqildi deb belgilangan.",
        vakitYok: "Hozir belgilanadigan namoz yoʻq.",
        vakitYokSiradaki: "Hozir belgilanadigan namoz yoʻq. Keyingisi {ad}, {giris}.",
        onay: "{ad} namozi oʻqildi deb belgilansinmi?",
        vakitDegisti: "Namoz vaqti oʻzgardi, shuning uchun hech narsa belgilanmadi. Qayta urinib koʻring.",
        kabulDuasi: "Alloh qabul qilsin",
        kildim: "Oʻqidim",
        kilindi: "Oʻqildi",
        kontrolKildim: "{ad} · Oʻqidim",
        kontrolKilindi: "{ad} oʻqildi",
        kontrolVakitYok: "Belgilanadigan namoz yoʻq",
        uygulamayiAcin: "Ilovani oching"
    )

    // kk — Kazakça (beta, Kiril): JS `sozluk/kk` (vakit adları QMDB; "Kıldım" = «Оқыдым», "Kılındı" = «Оқылды»).
    public static let kk = VakitMetinleri(
        dil: "kk",
        adlar: ["sabah": "Таң", "ogle": "Бесін", "ikindi": "Екінті", "aksam": "Ақшам", "yatsi": "Құптан"],
        gunes: "Күн",
        konumYok: "Намаз уақыттарын есептеу үшін қолданбаны ашып, орналасқан жеріңізді баптаңыз.",
        veriEski: "Намаз уақыттары ескірген. Жаңарту үшін қолданбаны бір рет ашыңыз.",
        girisBugun: "сағат {saat}",
        girisYarin: "ертең сағат {saat}",
        suAnVakti: "Қазір {ad} уақыты.",
        suAnVaktiCikis: "Қазір {ad} уақыты, шығуы сағат {saat}.",
        siradakiNamaz: "Келесі намаз — {ad}, {giris}.",
        isaretlendi: "{ad} намазыңыз оқылды деп белгіленді. {dua}.",
        zatenKilindi: "{ad} намазы оқылды деп бұрын белгіленген.",
        vakitYok: "Қазір оқылатын намаз уақыты жоқ.",
        vakitYokSiradaki: "Қазір оқылатын намаз уақыты жоқ. Келесісі — {ad}, {giris}.",
        onay: "{ad} намазы оқылды деп белгіленсін бе?",
        vakitDegisti: "Намаз уақыты өзгерді, белгі қойылмады. Қайталап көріңіз.",
        kabulDuasi: "Алла қабыл етсін",
        kildim: "Оқыдым",
        kilindi: "Оқылды",
        kontrolKildim: "{ad} · Оқыдым",
        kontrolKilindi: "{ad} оқылды",
        kontrolVakitYok: "Белгіленетін намаз жоқ",
        uygulamayiAcin: "Қолданбаны ашыңыз"
    )

    // ky
    public static let ky = VakitMetinleri(
        dil: "ky",
        adlar: ["sabah": "Багымдат", "ogle": "Бешим", "ikindi": "Аср", "aksam": "Шам", "yatsi": "Куптан"],
        gunes: "Күн чыгыш",
        konumYok: "Намаз убактылары эсептелиши үчүн колдонмону ачып, жайгашкан жериңизди коюңуз.",
        veriEski: "Намаз убактылары эскирген. Аларды жаңыртуу үчүн колдонмону бир жолу ачыңыз.",
        girisBugun: "саат {saat}",
        girisYarin: "эртең саат {saat}",
        suAnVakti: "Азыр {ad} убактысы.",
        suAnVaktiCikis: "Азыр {ad} убактысы; ал саат {saat} бүтөт.",
        siradakiNamaz: "Кийинки намаз — {ad}, {giris}.",
        isaretlendi: "{ad} окулду деп белгиленди. {dua}.",
        zatenKilindi: "{ad} мурунтан эле окулду деп белгиленген.",
        vakitYok: "Азыр белгилей турган намаз жок.",
        vakitYokSiradaki: "Азыр белгилей турган намаз жок. Кийинкиси {ad}, {giris}.",
        onay: "{ad} окулду деп белгиленсинби?",
        vakitDegisti: "Намаз убактысы өзгөргөндүктөн эч нерсе белгиленген жок. Кайра аракет кылыңыз.",
        kabulDuasi: "Алла кабыл кылсын",
        kildim: "Окудум",
        kilindi: "Окулду",
        kontrolKildim: "{ad} · Окудум",
        kontrolKilindi: "{ad} окулду",
        kontrolVakitYok: "Белгилей турган намаз жок",
        uygulamayiAcin: "Колдонмону ачыңыз"
    )

    // tg — Tacikçe (beta): JS `sozluk/tg` (Kıldım "Хондам", Kılındı "Хонда шуд", hitap "Шумо")
    public static let tg = VakitMetinleri(
        dil: "tg",
        adlar: ["sabah": "Бомдод", "ogle": "Пешин", "ikindi": "Аср", "aksam": "Шом", "yatsi": "Хуфтан"],
        gunes: "Тулӯъ",
        konumYok: "Барои ҳисоб кардани вақтҳо барномаро кушода, макони худро танзим кунед.",
        veriEski: "Вақтҳои намоз кӯҳна шудаанд. Барои навсозӣ барномаро як бор кушоед.",
        girisBugun: "соати {saat}",
        girisYarin: "фардо соати {saat}",
        suAnVakti: "Ҳозир вақти {ad} аст.",
        suAnVaktiCikis: "Ҳозир вақти {ad} аст; соати {saat} ба охир мерасад.",
        siradakiNamaz: "Намози навбатӣ {ad}, {giris}.",
        isaretlendi: "Намози {ad} ҳамчун хондашуда қайд шуд. {dua}.",
        zatenKilindi: "Намози {ad} аллакай ҳамчун хондашуда қайд шудааст.",
        vakitYok: "Ҳоло вақте барои қайд нест.",
        vakitYokSiradaki: "Ҳоло вақте барои қайд нест. Навбатӣ {ad}, {giris}.",
        onay: "Намози {ad} ҳамчун хондашуда қайд шавад?",
        vakitDegisti: "Вақт иваз шуд, қайд анҷом нашуд. Боз кӯшиш кунед.",
        kabulDuasi: "Худо қабул кунад",
        kildim: "Хондам",
        kilindi: "Хонда шуд",
        kontrolKildim: "{ad} · Хондам",
        kontrolKilindi: "{ad} хонда шуд",
        kontrolVakitYok: "Вақте барои қайд нест",
        uygulamayiAcin: "Барномаро кушоед"
    )

    // sw
    public static let sw = VakitMetinleri(
        dil: "sw",
        adlar: ["sabah": "Alfajiri", "ogle": "Adhuhuri", "ikindi": "Alasiri", "aksam": "Magharibi", "yatsi": "Isha"],
        gunes: "Macheo",
        konumYok: "Fungua programu na uweke mahali pako ili nyakati za Swala zikokotolewe.",
        veriEski: "Nyakati za Swala zimepitwa na wakati. Fungua programu mara moja ili kuzisasisha.",
        girisBugun: "saa {saat}",
        girisYarin: "kesho saa {saat}",
        suAnVakti: "Sasa ni wakati wa {ad}.",
        suAnVaktiCikis: "Sasa ni wakati wa {ad}; unaisha saa {saat}.",
        siradakiNamaz: "Swala inayofuata ni {ad} {giris}.",
        isaretlendi: "{ad} imewekwa alama imeswaliwa. {dua}.",
        zatenKilindi: "{ad} tayari imewekwa alama imeswaliwa.",
        vakitYok: "Hakuna Swala ya kuweka alama sasa hivi.",
        vakitYokSiradaki: "Hakuna Swala ya kuweka alama sasa hivi. Inayofuata ni {ad} {giris}.",
        onay: "Kuweka alama {ad} imeswaliwa?",
        vakitDegisti: "Wakati wa Swala umebadilika, kwa hivyo hakuna kilichowekwa alama. Jaribu tena.",
        kabulDuasi: "Mwenyezi Mungu aikubali",
        kildim: "Nimeswali",
        kilindi: "Imeswaliwa",
        kontrolKildim: "{ad} · Nimeswali",
        kontrolKilindi: "{ad} imeswaliwa",
        kontrolVakitYok: "Hakuna Swala ya kuweka alama",
        uygulamayiAcin: "Fungua programu"
    )

    // ha — Hausa (beta): JS `sozluk/ha` (Kıldım "Na yi salla", Kılındı "An yi salla", hitap 2. çoğul "ku")
    public static let ha = VakitMetinleri(
        dil: "ha",
        adlar: ["sabah": "Asuba", "ogle": "Azahar", "ikindi": "Laʼasar", "aksam": "Magariba", "yatsi": "Isha"],
        gunes: "Fitowar Rana",
        konumYok: "Ku buɗe manhajar ku saita wurinku don a iya lissafa lokutan salla.",
        veriEski: "Lokutan salla sun tsufa. Ku buɗe manhajar sau ɗaya don sabunta su.",
        girisBugun: "da ƙarfe {saat}",
        girisYarin: "gobe da ƙarfe {saat}",
        suAnVakti: "Yanzu lokacin {ad} ne.",
        suAnVaktiCikis: "Yanzu lokacin {ad} ne; zai fita da ƙarfe {saat}.",
        siradakiNamaz: "Salla ta gaba ita ce {ad}, {giris}.",
        isaretlendi: "An yi alamar an yi sallar {ad}. {dua}.",
        zatenKilindi: "An riga an yi alamar an yi sallar {ad}.",
        vakitYok: "Babu sallar da za a yi wa alama yanzu.",
        vakitYokSiradaki: "Babu sallar da za a yi wa alama yanzu. Na gaba shi ne {ad}, {giris}.",
        onay: "A yi alamar an yi sallar {ad}?",
        vakitDegisti: "Lokacin salla ya canja, don haka ba a yi alamar komai ba. Sake gwadawa.",
        kabulDuasi: "Allah ya karɓa",
        kildim: "Na yi salla",
        kilindi: "An yi salla",
        kontrolKildim: "{ad} · Na yi salla",
        kontrolKilindi: "An yi sallar {ad}",
        kontrolVakitYok: "Babu sallar da za a yi wa alama",
        uygulamayiAcin: "Buɗe manhaja"
    )

    // am — Amharca (beta); terimler src/core/dil/sozluk/am
    public static let am = VakitMetinleri(
        dil: "am",
        adlar: ["sabah": "ፈጅር", "ogle": "ዙህር", "ikindi": "አስር", "aksam": "መግሪብ", "yatsi": "ኢሻ"],
        gunes: "ፀሐይ መውጣት",
        konumYok: "የሶላት ሰዓቶች እንዲሰሉ መተግበሪያውን ይክፈቱና አካባቢዎን ያዘጋጁ።",
        veriEski: "የሶላት ሰዓቶቹ ጊዜያቸው ያለፈባቸው ናቸው። ለማዘመን መተግበሪያውን አንድ ጊዜ ይክፈቱ።",
        girisBugun: "በ{saat}",
        girisYarin: "ነገ በ{saat}",
        suAnVakti: "አሁን የ{ad} ሰዓት ነው።",
        suAnVaktiCikis: "አሁን የ{ad} ሰዓት ነው፤ በ{saat} ያበቃል።",
        siradakiNamaz: "ቀጣዩ ሶላት {ad} ነው፣ {giris}።",
        isaretlendi: "{ad} እንደተሰገደ ምልክት ተደርጓል። {dua}።",
        zatenKilindi: "{ad} አስቀድሞ እንደተሰገደ ምልክት ተደርጓል።",
        vakitYok: "አሁን ምልክት የሚደረግበት ሶላት የለም።",
        vakitYokSiradaki: "አሁን ምልክት የሚደረግበት ሶላት የለም። ቀጣዩ {ad} ነው፣ {giris}።",
        onay: "{ad} እንደተሰገደ ምልክት ይደረግ?",
        vakitDegisti: "የሶላቱ ሰዓት ስለተቀየረ ምንም ምልክት አልተደረገም። እንደገና ይሞክሩ።",
        kabulDuasi: "አላህ ይቀበለው",
        kildim: "ሰገድኩ",
        kilindi: "ተሰግዷል",
        kontrolKildim: "{ad} · ሰገድኩ",
        kontrolKilindi: "{ad} ተሰግዷል",
        kontrolVakitYok: "ምልክት የሚደረግበት ሶላት የለም",
        uygulamayiAcin: "መተግበሪያውን ክፈት"
    )

    // om
    public static let om = VakitMetinleri(
        dil: "om",
        adlar: ["sabah": "Subhii", "ogle": "Zuhrii", "ikindi": "Asrii", "aksam": "Maghriba", "yatsi": "Ishaa'ii"],
        gunes: "Baha aduu",
        konumYok: "Yeroon salaataa akka herregamuuf appicha banaatii bakka keessan qindeessaa.",
        veriEski: "Yeroon salaataa moofaa dha. Haaromsuuf appicha si'a tokko banaa.",
        girisBugun: "sa'aatii {saat}tti",
        girisYarin: "boru sa'aatii {saat}tti",
        suAnVakti: "Amma yeroo {ad} ti.",
        suAnVaktiCikis: "Amma yeroo {ad} ti; {saat}tti xumurama.",
        siradakiNamaz: "Salaanni itti aanu {ad}, {giris}.",
        isaretlendi: "{ad} akka salaatameetti mallattaa'eera. {dua}.",
        zatenKilindi: "{ad} duraan akka salaatameetti mallattaa'eera.",
        vakitYok: "Amma salaanni mallattaa'u hin jiru.",
        vakitYokSiradaki: "Amma salaanni mallattaa'u hin jiru. Kan itti aanu {ad}, {giris}.",
        onay: "{ad} akka salaatameetti mallatteessituu?",
        vakitDegisti: "Yeroon salaataa waan jijjiirameef wanti tokkollee hin mallattoofne. Irra deebi'aa yaalaa.",
        kabulDuasi: "Rabbiin haa qeebalu",
        kildim: "Ani salaateera",
        kilindi: "Salaatameera",
        kontrolKildim: "{ad} · Ani salaateera",
        kontrolKilindi: "{ad} salaatameera",
        kontrolVakitYok: "Salaanni mallattaa'u hin jiru",
        uygulamayiAcin: "Appicha banaa"
    )

    // so
    public static let so = VakitMetinleri(
        dil: "so",
        adlar: ["sabah": "Subax", "ogle": "Duhur", "ikindi": "Casar", "aksam": "Maghrib", "yatsi": "Cishe"],
        gunes: "Qorrax soo bax",
        konumYok: "Fur barnaamijka oo deji goobtaada si waqtiyada salaadda loo xisaabiyo.",
        veriEski: "Waqtiyada salaaddu waa duug. Hal mar fur barnaamijka si loo cusboonaysiiyo.",
        girisBugun: "saacadda {saat}",
        girisYarin: "berri saacadda {saat}",
        suAnVakti: "Hadda waa waqtiga {ad}.",
        suAnVaktiCikis: "Hadda waa waqtiga {ad}; wuxuu dhammaanayaa {saat}.",
        siradakiNamaz: "Salaadda xigta waa {ad} {giris}.",
        isaretlendi: "{ad} waxaa lagu calaamadeeyay la tukaday. {dua}.",
        zatenKilindi: "{ad} horay ayaa loogu calaamadeeyay la tukaday.",
        vakitYok: "Hadda ma jirto salaad la calaamadeeyo.",
        vakitYokSiradaki: "Hadda ma jirto salaad la calaamadeeyo. Tan xigta waa {ad} {giris}.",
        onay: "Ma u calaamadaynaysaa {ad} la tukaday?",
        vakitDegisti: "Waqtiga salaaddu wuu isbeddelay, sidaas darteed waxba lama calaamadeyn. Isku day mar kale.",
        kabulDuasi: "Alle ha aqbalo",
        kildim: "Waan tukaday",
        kilindi: "La tukaday",
        kontrolKildim: "{ad} · Waan tukaday",
        kontrolKilindi: "{ad} la tukaday",
        kontrolVakitYok: "Salaad la calaamadeeyo ma jirto",
        uygulamayiAcin: "Fur barnaamijka"
    )

    // ff
    public static let ff = VakitMetinleri(
        dil: "ff",
        adlar: ["sabah": "Subaka", "ogle": "Fanaa", "ikindi": "Alansaraa", "aksam": "Futuroo", "yatsi": "Geeƴe"],
        gunes: "Puɗal naange",
        konumYok: "Udditee jaaɓngal ngal, teeltee nokkuure mon ngam saa’iiji juulɗe hiiseede.",
        veriEski: "Saa’iiji juulɗe ɓooyii. Udditee jaaɓngal ngal laawol go’o ngam hesɗitinde ɗi.",
        girisBugun: "e {saat}",
        girisYarin: "janngo e {saat}",
        suAnVakti: "Jooni ko waqutu {ad}.",
        suAnVaktiCikis: "Jooni ko waqutu {ad}; gasay e {saat}.",
        siradakiNamaz: "Juulde garoore ndee ko {ad} {giris}.",
        isaretlendi: "{ad} maandinaama ko juulaama. {dua}.",
        zatenKilindi: "{ad} maandinaama ko juulaama tawo.",
        vakitYok: "Alaa juulde maandinteende jooni.",
        vakitYokSiradaki: "Alaa juulde maandinteende jooni. Garoore ndee ko {ad} {giris}.",
        onay: "Maandinee {ad} ko juulaama?",
        vakitDegisti: "Waqutu juulde waylii, ɗum noon hay huunde maandinaaka. Etee kadi.",
        kabulDuasi: "Yo Alla jaɓu",
        kildim: "Mi juulii",
        kilindi: "Juulaama",
        kontrolKildim: "{ad} · Mi juulii",
        kontrolKilindi: "{ad} juulaama",
        kontrolVakitYok: "Alaa juulde maandinteende",
        uygulamayiAcin: "Udditee jaaɓngal ngal"
    )

    // yo
    public static let yo = VakitMetinleri(
        dil: "yo",
        adlar: ["sabah": "Subh", "ogle": "Ṭḥuhr", "ikindi": "‘Asr", "aksam": "Mọgrib", "yatsi": "‘Iṣā’"],
        gunes: "Yíyọ òòrùn",
        konumYok: "Ẹ ṣí ìṣàfilọ́lẹ̀, kí ẹ sì ṣètò ibùdó yín kí a lè ṣírò àwọn àkókò ìrun.",
        veriEski: "Àwọn àkókò ìrun ti pẹ́. Ẹ ṣí ìṣàfilọ́lẹ̀ lẹ́ẹ̀kan láti ṣe àfikún wọn.",
        girisBugun: "ní {saat}",
        girisYarin: "ní ọ̀la ní {saat}",
        suAnVakti: "Àkókò {ad} ni báyìí.",
        suAnVaktiCikis: "Àkókò {ad} ni báyìí; yóò parí ní {saat}.",
        siradakiNamaz: "Ìrun tó kàn ni {ad} {giris}.",
        isaretlendi: "A ti sàmì sí {ad} pé ẹ ti kí i. {dua}.",
        zatenKilindi: "A ti sàmì sí {ad} tẹ́lẹ̀ pé ẹ ti kí i.",
        vakitYok: "Kò sí ìrun tí a lè sàmì sí báyìí.",
        vakitYokSiradaki: "Kò sí ìrun tí a lè sàmì sí báyìí. Èyí tó kàn ni {ad} {giris}.",
        onay: "Ṣé kí a sàmì sí {ad} pé ẹ ti kí i?",
        vakitDegisti: "Àkókò ìrun ti yí padà, nítorí náà a kò sàmì sí nǹkankan. Ẹ gbìyànjú lẹ́ẹ̀kan sí i.",
        kabulDuasi: "Kí Allāhu gbà á",
        kildim: "Mo ti kírun",
        kilindi: "Ti kírun",
        kontrolKildim: "{ad} · Mo ti kírun",
        kontrolKilindi: "{ad}: ti kírun",
        kontrolVakitYok: "Kò sí ìrun láti sàmì sí",
        uygulamayiAcin: "Ṣí ìṣàfilọ́lẹ̀"
    )

    // zh
    public static let zh = VakitMetinleri(
        dil: "zh",
        adlar: ["sabah": "晨礼", "ogle": "晌礼", "ikindi": "晡礼", "aksam": "昏礼", "yatsi": "宵礼"],
        gunes: "日出",
        konumYok: "打开应用并设置您的位置，以便计算礼拜时间。",
        veriEski: "礼拜时间已过期。打开一次应用进行更新。",
        girisBugun: "于{saat}开始",
        girisYarin: "于明天{saat}开始",
        suAnVakti: "现在是{ad}时间。",
        suAnVaktiCikis: "现在是{ad}时间；于{saat}结束。",
        siradakiNamaz: "下一番礼拜是{ad}，{giris}。",
        isaretlendi: "{ad}已标记为已礼拜。{dua}。",
        zatenKilindi: "{ad}已经标记为已礼拜。",
        vakitYok: "现在没有可标记的礼拜。",
        vakitYokSiradaki: "现在没有可标记的礼拜。下一个是{ad}，{giris}。",
        onay: "将{ad}标记为已礼拜吗？",
        vakitDegisti: "礼拜时间已变化，因此没有标记任何内容。再试一次。",
        kabulDuasi: "愿真主准承",
        kildim: "我礼了",
        kilindi: "已礼拜",
        kontrolKildim: "{ad} · 我礼了",
        kontrolKilindi: "{ad}已礼拜",
        kontrolVakitYok: "没有可标记的礼拜",
        uygulamayiAcin: "打开应用"
    )

    // ta
    public static let ta = VakitMetinleri(
        dil: "ta",
        adlar: ["sabah": "ஃபஜ்ர்", "ogle": "லுஹர்", "ikindi": "அஸர்", "aksam": "மஃரிப்", "yatsi": "இஷா"],
        gunes: "சூரிய உதயம்",
        konumYok: "தொழுகை நேரங்களைக் கணக்கிட, ஆப்ஸைத் திறந்து உங்கள் இருப்பிடத்தை அமைக்கவும்.",
        veriEski: "தொழுகை நேரங்கள் பழையவை. புதுப்பிக்க ஆப்ஸை ஒருமுறை திறக்கவும்.",
        girisBugun: "{saat} மணிக்கு",
        girisYarin: "நாளை {saat} மணிக்கு",
        suAnVakti: "இப்போது {ad} நேரம்.",
        suAnVaktiCikis: "இப்போது {ad} நேரம்; {saat} மணிக்கு முடியும்.",
        siradakiNamaz: "அடுத்த தொழுகை {ad}, {giris}.",
        isaretlendi: "{ad} தொழுததாகக் குறிக்கப்பட்டது. {dua}.",
        zatenKilindi: "{ad} ஏற்கனவே தொழுததாகக் குறிக்கப்பட்டுள்ளது.",
        vakitYok: "இப்போது குறிக்கத் தொழுகை இல்லை.",
        vakitYokSiradaki: "இப்போது குறிக்கத் தொழுகை இல்லை. அடுத்தது {ad}, {giris}.",
        onay: "{ad} தொழுததாகக் குறிக்கவா?",
        vakitDegisti: "தொழுகை நேரம் மாறியதால் எதுவும் குறிக்கப்படவில்லை. மீண்டும் முயலவும்.",
        kabulDuasi: "அல்லாஹ் ஏற்றுக்கொள்வானாக",
        kildim: "தொழுதேன்",
        kilindi: "தொழுதாகிவிட்டது",
        kontrolKildim: "{ad} · தொழுதேன்",
        kontrolKilindi: "{ad} தொழுதாகிவிட்டது",
        kontrolVakitYok: "குறிக்கத் தொழுகை இல்லை",
        uygulamayiAcin: "ஆப்ஸைத் திறக்க"
    )

    // ml — Malayalamca (beta): JS `sozluk/ml`; Kıldım "ഞാൻ നമസ്കരിച്ചു", Kılındı "നമസ്കരിച്ചു"
    public static let ml = VakitMetinleri(
        dil: "ml",
        adlar: ["sabah": "സുബ്‌ഹ്", "ogle": "ളുഹർ", "ikindi": "അസ്ർ", "aksam": "മഗ്‌രിബ്", "yatsi": "ഇശാ"],
        gunes: "സൂര്യോദയം",
        konumYok: "നമസ്കാര സമയങ്ങൾ കണക്കാക്കാൻ ആപ്പ് തുറന്ന് ലൊക്കേഷൻ സജ്ജമാക്കുക.",
        veriEski: "നമസ്കാര സമയങ്ങൾ പഴയതാണ്. പുതുക്കാൻ ഒരിക്കൽ ആപ്പ് തുറക്കുക.",
        girisBugun: "{saat}-ന്",
        girisYarin: "നാളെ {saat}-ന്",
        suAnVakti: "ഇപ്പോൾ {ad} സമയമാണ്.",
        suAnVaktiCikis: "ഇപ്പോൾ {ad} സമയമാണ്; {saat}-ന് തീരും.",
        siradakiNamaz: "അടുത്ത നമസ്കാരം {ad}, {giris}.",
        isaretlendi: "{ad} നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തി. {dua}.",
        zatenKilindi: "{ad} ഇതിനകം നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തിയിട്ടുണ്ട്.",
        vakitYok: "ഇപ്പോൾ അടയാളപ്പെടുത്താൻ നമസ്കാരമില്ല.",
        vakitYokSiradaki: "ഇപ്പോൾ അടയാളപ്പെടുത്താൻ നമസ്കാരമില്ല. അടുത്തത് {ad}, {giris}.",
        onay: "{ad} നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തണോ?",
        vakitDegisti: "നമസ്കാര സമയം മാറിയതിനാൽ ഒന്നും അടയാളപ്പെടുത്തിയില്ല. വീണ്ടും ശ്രമിക്കുക.",
        kabulDuasi: "അല്ലാഹു സ്വീകരിക്കട്ടെ",
        kildim: "ഞാൻ നമസ്കരിച്ചു",
        kilindi: "നമസ്കരിച്ചു",
        kontrolKildim: "{ad} · ഞാൻ നമസ്കരിച്ചു",
        kontrolKilindi: "{ad} നമസ്കരിച്ചു",
        kontrolVakitYok: "അടയാളപ്പെടുത്താൻ നമസ്കാരമില്ല",
        uygulamayiAcin: "ആപ്പ് തുറക്കുക"
    )

    // th
    public static let th = VakitMetinleri(
        dil: "th",
        adlar: ["sabah": "ซุบฮ์", "ogle": "ดุฮ์ริ", "ikindi": "อัสร์", "aksam": "มักริบ", "yatsi": "อีซา"],
        gunes: "ซูรูก",
        konumYok: "โปรดเปิดแอปและตั้งตำแหน่งของคุณเพื่อให้คำนวณเวลาละหมาดได้",
        veriEski: "เวลาละหมาดเก่าแล้ว โปรดเปิดแอปหนึ่งครั้งเพื่ออัปเดต",
        girisBugun: "เวลา {saat}",
        girisYarin: "พรุ่งนี้เวลา {saat}",
        suAnVakti: "ขณะนี้เป็นเวลา{ad}",
        suAnVaktiCikis: "ขณะนี้เป็นเวลา{ad} จะหมดเวลา {saat}",
        siradakiNamaz: "เวลาละหมาดถัดไปคือ{ad} {giris}",
        isaretlendi: "ทำเครื่องหมายว่าละหมาด{ad}แล้ว {dua}",
        zatenKilindi: "{ad}ถูกทำเครื่องหมายว่าละหมาดแล้ว",
        vakitYok: "ขณะนี้ไม่มีเวลาละหมาดที่จะทำเครื่องหมาย",
        vakitYokSiradaki: "ขณะนี้ไม่มีเวลาละหมาดที่จะทำเครื่องหมาย ถัดไปคือ{ad} {giris}",
        onay: "ทำเครื่องหมายว่าละหมาด{ad}แล้วหรือไม่",
        vakitDegisti: "เวลาละหมาดเปลี่ยนไปแล้ว จึงไม่ได้ทำเครื่องหมาย โปรดลองอีกครั้ง",
        kabulDuasi: "ขออัลลอฮ์ทรงตอบรับ",
        kildim: "ละหมาดแล้ว",
        kilindi: "ละหมาดแล้ว",
        kontrolKildim: "{ad} · ละหมาดแล้ว",
        kontrolKilindi: "ละหมาด{ad}แล้ว",
        kontrolVakitYok: "ไม่มีเวลาละหมาดที่จะทำเครื่องหมาย",
        uygulamayiAcin: "เปิดแอป"
    )

    // ko
    public static let ko = VakitMetinleri(
        dil: "ko",
        adlar: ["sabah": "새벽", "ogle": "정오", "ikindi": "오후", "aksam": "저녁", "yatsi": "밤"],
        gunes: "일출",
        konumYok: "예배 시간을 계산할 수 있도록 앱을 열고 위치를 설정하세요.",
        veriEski: "예배 시간이 오래되었습니다. 업데이트하려면 앱을 한 번 여세요.",
        girisBugun: "{saat}에",
        girisYarin: "내일 {saat}에",
        suAnVakti: "지금은 {ad} 예배 시간입니다.",
        suAnVaktiCikis: "지금은 {ad} 예배 시간이며, {saat}에 끝납니다.",
        siradakiNamaz: "다음 예배는 {ad} 예배이며, {giris} 시작합니다.",
        isaretlendi: "{ad} 예배를 완료로 표시했습니다. {dua}.",
        zatenKilindi: "{ad} 예배는 이미 완료로 표시되어 있습니다.",
        vakitYok: "지금 표시할 예배가 없습니다.",
        vakitYokSiradaki: "지금 표시할 예배가 없습니다. 다음은 {ad} 예배이며, {giris} 시작합니다.",
        onay: "{ad} 예배를 완료로 표시할까요?",
        vakitDegisti: "예배 시간이 바뀌어 아무것도 표시하지 않았습니다. 다시 시도하세요.",
        kabulDuasi: "하나님께서 받아주시길",
        kildim: "예배 드렸어요",
        kilindi: "예배 완료",
        kontrolKildim: "{ad} · 예배 드렸어요",
        kontrolKilindi: "{ad} 예배 완료",
        kontrolVakitYok: "표시할 예배 없음",
        uygulamayiAcin: "앱 열기"
    )

    // vi
    public static let vi = VakitMetinleri(
        dil: "vi",
        adlar: ["sabah": "Fajr", "ogle": "Zhuhr", "ikindi": "‘Asr", "aksam": "Maghrib", "yatsi": "‘Isha’"],
        gunes: "Mặt trời mọc",
        konumYok: "Hãy mở ứng dụng và đặt vị trí để tính giờ Salah.",
        veriEski: "Giờ Salah đã cũ. Hãy mở ứng dụng một lần để cập nhật.",
        girisBugun: "lúc {saat}",
        girisYarin: "ngày mai lúc {saat}",
        suAnVakti: "Bây giờ là giờ {ad}.",
        suAnVaktiCikis: "Bây giờ là giờ {ad}; kết thúc lúc {saat}.",
        siradakiNamaz: "Giờ Salah tiếp theo là {ad} {giris}.",
        isaretlendi: "Đã đánh dấu {ad} là đã hành lễ. {dua}.",
        zatenKilindi: "{ad} đã được đánh dấu là đã hành lễ.",
        vakitYok: "Hiện không có Salah nào để đánh dấu.",
        vakitYokSiradaki: "Hiện không có Salah nào để đánh dấu. Tiếp theo là {ad} {giris}.",
        onay: "Đánh dấu {ad} là đã hành lễ?",
        vakitDegisti: "Giờ Salah đã thay đổi nên chưa có gì được đánh dấu. Hãy thử lại.",
        kabulDuasi: "Cầu xin Allah chấp nhận",
        kildim: "Tôi đã hành lễ",
        kilindi: "Đã hành lễ",
        kontrolKildim: "{ad} · Tôi đã hành lễ",
        kontrolKilindi: "{ad} đã hành lễ",
        kontrolVakitYok: "Không có Salah để đánh dấu",
        uygulamayiAcin: "Mở ứng dụng"
    )

    // pt — Portekizce (beta, pt-PT); terimler src/core/dil/sozluk/pt
    public static let pt = VakitMetinleri(
        dil: "pt",
        adlar: ["sabah": "Fajr", "ogle": "Zuhr", "ikindi": "Assr", "aksam": "Magrib", "yatsi": "Ishá"],
        gunes: "Nascer do Sol",
        konumYok: "Abra a aplicação e defina a sua localização para que os horários possam ser calculados.",
        veriEski: "Os horários estão desatualizados. Abra a aplicação uma vez para os atualizar.",
        girisBugun: "às {saat}",
        girisYarin: "amanhã às {saat}",
        suAnVakti: "Agora é a hora de {ad}.",
        suAnVaktiCikis: "Agora é a hora de {ad}; termina às {saat}.",
        siradakiNamaz: "A próxima oração é {ad}, {giris}.",
        isaretlendi: "A oração de {ad} foi marcada como rezada. {dua}.",
        zatenKilindi: "A oração de {ad} já está marcada como rezada.",
        vakitYok: "Neste momento não há nenhuma oração para marcar.",
        vakitYokSiradaki: "Neste momento não há nenhuma oração para marcar. A seguir: {ad}, {giris}.",
        onay: "Marcar a oração de {ad} como rezada?",
        vakitDegisti: "A hora da oração mudou e nada foi marcado. Tente novamente.",
        kabulDuasi: "Que Allah aceite",
        kildim: "Rezei",
        kilindi: "Rezada",
        kontrolKildim: "{ad} · Rezei",
        kontrolKilindi: "{ad} rezada",
        kontrolVakitYok: "Nenhuma oração para marcar",
        uygulamayiAcin: "Abrir a aplicação"
    )

    // it
    public static let it = VakitMetinleri(
        dil: "it",
        adlar: ["sabah": "Fajr", "ogle": "Zuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sorgere del sole",
        konumYok: "Apra l’app e imposti la posizione per poter calcolare gli orari di preghiera.",
        veriEski: "Gli orari di preghiera non sono aggiornati. Apra l’app una volta per aggiornarli.",
        girisBugun: "alle {saat}",
        girisYarin: "domani alle {saat}",
        suAnVakti: "Ora è il tempo di {ad}.",
        suAnVaktiCikis: "Ora è il tempo di {ad}; finisce alle {saat}.",
        siradakiNamaz: "La prossima preghiera è {ad} {giris}.",
        isaretlendi: "{ad} è segnato come compiuto. {dua}.",
        zatenKilindi: "{ad} è già segnato come compiuto.",
        vakitYok: "Al momento non c’è una preghiera da segnare.",
        vakitYokSiradaki: "Al momento non c’è una preghiera da segnare. La prossima è {ad} {giris}.",
        onay: "Segnare {ad} come compiuto?",
        vakitDegisti: "L’orario di preghiera è cambiato, quindi non è stato segnato nulla. Riprovi.",
        kabulDuasi: "Che Allah l’accetti",
        kildim: "Ho pregato",
        kilindi: "Compiuta",
        kontrolKildim: "{ad} · Ho pregato",
        kontrolKilindi: "{ad} compiuto",
        kontrolVakitYok: "Nessuna preghiera da segnare",
        uygulamayiAcin: "Aprire l’app"
    )

    // sv
    public static let sv = VakitMetinleri(
        dil: "sv",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Soluppgång",
        konumYok: "Öppna appen och ange din plats så att bönetiderna kan beräknas.",
        veriEski: "Bönetiderna är inaktuella. Öppna appen en gång för att uppdatera dem.",
        girisBugun: "klockan {saat}",
        girisYarin: "i morgon klockan {saat}",
        suAnVakti: "Det är tid för {ad} nu.",
        suAnVaktiCikis: "Det är tid för {ad} nu; den slutar {saat}.",
        siradakiNamaz: "Nästa bön är {ad} {giris}.",
        isaretlendi: "{ad} är markerad som förrättad. {dua}.",
        zatenKilindi: "{ad} är redan markerad som förrättad.",
        vakitYok: "Det finns ingen bön att markera just nu.",
        vakitYokSiradaki: "Det finns ingen bön att markera just nu. Nästa är {ad} {giris}.",
        onay: "Markera {ad} som förrättad?",
        vakitDegisti: "Bönetiden ändrades, så inget markerades. Försök igen.",
        kabulDuasi: "Må Allah acceptera det",
        kildim: "Jag har bett",
        kilindi: "Förrättad",
        kontrolKildim: "{ad} · Jag har bett",
        kontrolKilindi: "{ad} förrättad",
        kontrolVakitYok: "Ingen bön att markera",
        uygulamayiAcin: "Öppna appen"
    )

    // uk
    public static let uk = VakitMetinleri(
        dil: "uk",
        adlar: ["sabah": "Фаджр", "ogle": "Зугр", "ikindi": "Аср", "aksam": "Магріб", "yatsi": "Іша"],
        gunes: "Схід сонця",
        konumYok: "Відкрийте застосунок і задайте місцезнаходження, щоб обчислити час молитов.",
        veriEski: "Час молитов застарів. Відкрийте застосунок один раз, щоб оновити його.",
        girisBugun: "о {saat}",
        girisYarin: "завтра о {saat}",
        suAnVakti: "Зараз час молитви {ad}.",
        suAnVaktiCikis: "Зараз час молитви {ad}; він закінчується о {saat}.",
        siradakiNamaz: "Наступна молитва — {ad} {giris}.",
        isaretlendi: "Молитву {ad} позначено як здійснену. {dua}.",
        zatenKilindi: "Молитву {ad} уже позначено як здійснену.",
        vakitYok: "Зараз немає молитви для позначення.",
        vakitYokSiradaki: "Зараз немає молитви для позначення. Наступна — {ad} {giris}.",
        onay: "Позначити молитву {ad} як здійснену?",
        vakitDegisti: "Час молитви змінився, тому нічого не позначено. Спробуйте ще раз.",
        kabulDuasi: "Нехай Аллаг прийме",
        kildim: "Молитву здійснено",
        kilindi: "Здійснено",
        kontrolKildim: "{ad} · Молитву здійснено",
        kontrolKilindi: "Молитву {ad} здійснено",
        kontrolVakitYok: "Немає молитви для позначення",
        uygulamayiAcin: "Відкрийте застосунок"
    )

    // ro
    public static let ro = VakitMetinleri(
        dil: "ro",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Ișa"],
        gunes: "Răsărit",
        konumYok: "Deschideți aplicația și setați locația, ca să se poată calcula orele de rugăciune.",
        veriEski: "Orele de rugăciune nu sunt actuale. Deschideți aplicația o dată ca să le actualizați.",
        girisBugun: "la {saat}",
        girisYarin: "mâine la {saat}",
        suAnVakti: "Acum este timpul pentru {ad}.",
        suAnVaktiCikis: "Acum este timpul pentru {ad}; se încheie la {saat}.",
        siradakiNamaz: "Rugăciunea următoare este {ad}, {giris}.",
        isaretlendi: "{ad} a fost marcată ca efectuată. {dua}.",
        zatenKilindi: "{ad} este deja marcată ca efectuată.",
        vakitYok: "Nu există acum nicio rugăciune de marcat.",
        vakitYokSiradaki: "Nu există acum nicio rugăciune de marcat. Urmează {ad}, {giris}.",
        onay: "Marcați {ad} ca efectuată?",
        vakitDegisti: "Timpul rugăciunii s-a schimbat, așa că nu s-a marcat nimic. Încercați din nou.",
        kabulDuasi: "Allah să primească",
        kildim: "M-am rugat",
        kilindi: "Efectuată",
        kontrolKildim: "{ad} · M-am rugat",
        kontrolKilindi: "{ad} efectuată",
        kontrolVakitYok: "Nicio rugăciune de marcat",
        uygulamayiAcin: "Deschideți aplicația"
    )

    // hr
    public static let hr = VakitMetinleri(
        dil: "hr",
        adlar: ["sabah": "Sabah", "ogle": "Podne", "ikindi": "Ikindija", "aksam": "Akšam", "yatsi": "Jacija"],
        gunes: "Izlazak Sunca",
        konumYok: "Otvorite aplikaciju i postavite lokaciju kako bi se mogla izračunati vremena namaza.",
        veriEski: "Vremena namaza su zastarjela. Jednom otvorite aplikaciju da ih ažurirate.",
        girisBugun: "u {saat}",
        girisYarin: "sutra u {saat}",
        suAnVakti: "Sada je vrijeme namaza: {ad}.",
        suAnVaktiCikis: "Sada je vrijeme namaza: {ad}; istječe u {saat}.",
        siradakiNamaz: "Sljedeći namaz je {ad}, {giris}.",
        isaretlendi: "Označeno kao klanjano: {ad}. {dua}.",
        zatenKilindi: "Već je označeno kao klanjano: {ad}.",
        vakitYok: "Trenutačno nema namaza za označavanje.",
        vakitYokSiradaki: "Trenutačno nema namaza za označavanje. Sljedeći je {ad}, {giris}.",
        onay: "Označiti kao klanjano: {ad}?",
        vakitDegisti: "Vrijeme namaza promijenilo se, pa ništa nije označeno. Pokušajte ponovno.",
        kabulDuasi: "Allah kabul ejlesun",
        kildim: "Klanjano",
        kilindi: "Klanjano",
        kontrolKildim: "{ad} · Klanjano",
        kontrolKilindi: "{ad} klanjano",
        kontrolVakitYok: "Nema namaza za označavanje",
        uygulamayiAcin: "Otvorite aplikaciju"
    )

    // sr
    public static let sr = VakitMetinleri(
        dil: "sr",
        adlar: ["sabah": "Сабах", "ogle": "Подне", "ikindi": "Икиндија", "aksam": "Акшам", "yatsi": "Јација"],
        gunes: "Излазак сунца",
        konumYok: "Отворите апликацију и подесите своју локацију да би времена могла да се израчунају.",
        veriEski: "Времена су застарела. Отворите апликацију једном да их ажурирате.",
        girisBugun: "у {saat}",
        girisYarin: "сутра у {saat}",
        suAnVakti: "Тренутни намаз: {ad}.",
        suAnVaktiCikis: "Тренутни намаз: {ad}; истиче у {saat}.",
        siradakiNamaz: "Следећи намаз: {ad}, {giris}.",
        isaretlendi: "{ad}: ваш намаз је означен као клањан. {dua}.",
        zatenKilindi: "{ad}: намаз је већ означен као клањан.",
        vakitYok: "Тренутно нема намаза за клањање.",
        vakitYokSiradaki: "Тренутно нема намаза за клањање. Следеће: {ad}, {giris}.",
        onay: "Означити намаз ({ad}) као клањан?",
        vakitDegisti: "Време намаза се променило, означавање није извршено. Покушајте поново.",
        kabulDuasi: "Аллах примио",
        kildim: "Клањано",
        kilindi: "Клањано",
        kontrolKildim: "{ad} · Клањано",
        kontrolKilindi: "{ad}: клањано",
        kontrolVakitYok: "Нема намаза за клањање",
        uygulamayiAcin: "Отворите апликацију"
    )

    // el
    public static let el = VakitMetinleri(
        dil: "el",
        adlar: ["sabah": "Φατζρ", "ogle": "Δουχρ", "ikindi": "‘Ασρ", "aksam": "Μάγριμπ", "yatsi": "‘Ισά’"],
        gunes: "Ανατολή ηλίου",
        konumYok: "Ανοίξτε την εφαρμογή και ορίστε την τοποθεσία σας, για να υπολογιστούν οι ώρες προσευχής.",
        veriEski: "Οι ώρες προσευχής δεν είναι ενημερωμένες. Ανοίξτε την εφαρμογή μία φορά για ενημέρωση.",
        girisBugun: "στις {saat}",
        girisYarin: "αύριο στις {saat}",
        suAnVakti: "Είναι ώρα για {ad}.",
        suAnVaktiCikis: "Είναι ώρα για {ad}· λήγει στις {saat}.",
        siradakiNamaz: "Η επόμενη προσευχή είναι η {ad} {giris}.",
        isaretlendi: "Η προσευχή {ad} σημειώθηκε ως τελεσμένη. {dua}.",
        zatenKilindi: "Η προσευχή {ad} έχει ήδη σημειωθεί ως τελεσμένη.",
        vakitYok: "Δεν υπάρχει προσευχή για σήμανση αυτή τη στιγμή.",
        vakitYokSiradaki: "Δεν υπάρχει προσευχή για σήμανση αυτή τη στιγμή. Ακολουθεί: {ad} {giris}.",
        onay: "Σήμανση της προσευχής {ad} ως τελεσμένης;",
        vakitDegisti: "Η ώρα προσευχής άλλαξε, οπότε δεν σημειώθηκε τίποτα. Δοκιμάστε ξανά.",
        kabulDuasi: "Ας τη δεχτεί ο Αλλάχ",
        kildim: "Προσευχήθηκα",
        kilindi: "Τελέστηκε",
        kontrolKildim: "{ad} · Προσευχήθηκα",
        kontrolKilindi: "{ad}: τελέστηκε",
        kontrolVakitYok: "Καμία προσευχή για σήμανση",
        uygulamayiAcin: "Άνοιγμα εφαρμογής"
    )

    // ku
    public static let ku = VakitMetinleri(
        dil: "ku",
        adlar: ["sabah": "Sibe", "ogle": "Nîvro", "ikindi": "Esir", "aksam": "Êvar", "yatsi": "Eşa"],
        gunes: "Rojhilat",
        konumYok: "Sepanê vekin û cihê xwe saz bikin da ku demên nimêjê bên hesabkirin.",
        veriEski: "Demên nimêjê kevn in. Ji bo nûkirinê sepanê carekê vekin.",
        girisBugun: "di {saat} de",
        girisYarin: "sibê di {saat} de",
        suAnVakti: "Niha dema {ad} ye.",
        suAnVaktiCikis: "Niha dema {ad} ye; di {saat} de diqede.",
        siradakiNamaz: "Nimêja din {ad} e, {giris}.",
        isaretlendi: "{ad} wekî kirî hate nîşankirin. {dua}.",
        zatenKilindi: "{ad} berê wekî kirî hatiye nîşankirin.",
        vakitYok: "Niha nimêjeke ku bê nîşankirin tune.",
        vakitYokSiradaki: "Niha nimêjeke ku bê nîşankirin tune. Ya din {ad} e, {giris}.",
        onay: "{ad} wekî kirî were nîşankirin?",
        vakitDegisti: "Dema nimêjê guherî, ji ber vê tiştek nehate nîşankirin. Dîsa biceribînin.",
        kabulDuasi: "Xwedê qebûl bike",
        kildim: "Min nimêj kir",
        kilindi: "Hat kirin",
        kontrolKildim: "{ad} · Min nimêj kir",
        kontrolKilindi: "{ad} hat kirin",
        kontrolVakitYok: "Nimêjeke ji bo nîşankirinê tune",
        uygulamayiAcin: "Sepanê vekin"
    )

    // tk — Türkmen dili (beta); terminler src/core/dil/sozluk/tk (Okadym / Okaldy, hitap "siz")
    public static let tk = VakitMetinleri(
        dil: "tk",
        adlar: ["sabah": "Ertir", "ogle": "Öýle", "ikindi": "Ikindi", "aksam": "Agşam", "yatsi": "Ýassy"],
        gunes: "Gün dogşy",
        konumYok: "Namaz wagtlarynyň hasaplanmagy üçin programmany açyp, ýerleşişiňizi kesgitläň.",
        veriEski: "Namaz wagtlary könelipdir. Täzelemek üçin programmany bir gezek açyň.",
        girisBugun: "sagat {saat} bolanda",
        girisYarin: "ertir sagat {saat} bolanda",
        suAnVakti: "Häzir {ad} wagty.",
        suAnVaktiCikis: "Häzir {ad} wagty; sagat {saat} bolanda gutarýar.",
        siradakiNamaz: "Indiki namaz {ad}, {giris}.",
        isaretlendi: "{ad} okaldy diýip bellendi. {dua}.",
        zatenKilindi: "{ad} eýýäm okaldy diýip bellenen.",
        vakitYok: "Häzir belläp boljak namaz ýok.",
        vakitYokSiradaki: "Häzir belläp boljak namaz ýok. Indiki namaz {ad}, {giris}.",
        onay: "{ad} okaldy diýip bellensinmi?",
        vakitDegisti: "Namaz wagty üýtgedi, şonuň üçin hiç zat bellenmedi. Gaýtadan synanyşyň.",
        kabulDuasi: "Alla kabul etsin",
        kildim: "Okadym",
        kilindi: "Okaldy",
        kontrolKildim: "{ad} · Okadym",
        kontrolKilindi: "{ad} okaldy",
        kontrolVakitYok: "Belläp boljak namaz ýok",
        uygulamayiAcin: "Programmany açyň"
    )

    // tt — Tatarca (beta, Kiril): JS `sozluk/tt` (vakit adları ДУМ РТ; "Kıldım" = «Укыдым», "Kılındı" = «Укылды»).
    public static let tt = VakitMetinleri(
        dil: "tt",
        adlar: ["sabah": "Иртәнге", "ogle": "Өйлә", "ikindi": "Икенде", "aksam": "Ахшам", "yatsi": "Ястү"],
        gunes: "Кояш",
        konumYok: "Намаз вакытларын исәпләү өчен кушымтаны ачып, урнашу урыныгызны көйләгез.",
        veriEski: "Намаз вакытлары искергән. Яңарту өчен кушымтаны бер тапкыр ачыгыз.",
        girisBugun: "сәгать {saat}",
        girisYarin: "иртәгә сәгать {saat}",
        suAnVakti: "Хәзер {ad} вакыты.",
        suAnVaktiCikis: "Хәзер {ad} вакыты, чыгуы сәгать {saat}.",
        siradakiNamaz: "Чираттагы намаз — {ad}, {giris}.",
        isaretlendi: "{ad} намазыгыз укылды дип билгеләнде. {dua}.",
        zatenKilindi: "{ad} намазы укылды дип элек билгеләнгән.",
        vakitYok: "Хәзер билгеләнә торган намаз юк.",
        vakitYokSiradaki: "Хәзер билгеләнә торган намаз юк. Чираттагысы — {ad}, {giris}.",
        onay: "{ad} намазы укылды дип билгеләнсенме?",
        vakitDegisti: "Намаз вакыты үзгәрде, билге куелмады. Кабатлап карагыз.",
        kabulDuasi: "Аллаһ кабул кылсын",
        kildim: "Укыдым",
        kilindi: "Укылды",
        kontrolKildim: "{ad} · Укыдым",
        kontrolKilindi: "{ad} укылды",
        kontrolVakitYok: "Билгеләнә торган намаз юк",
        uygulamayiAcin: "Кушымтаны ачыгыз"
    )

    // sd — Sindhçe (beta); terimler src/core/dil/sozluk/sd (Kıldım "نماز پڙهي ورتي", Kılındı "پڙهي وئي")
    public static let sd = VakitMetinleri(
        dil: "sd",
        adlar: ["sabah": "فجر", "ogle": "ظهر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشاء"],
        gunes: "سج اڀرڻ",
        konumYok: "نماز جا وقت ڳڻڻ لاءِ ايپ کوليو ۽ پنهنجي جڳهه مقرر ڪريو.",
        veriEski: "نماز جا وقت پراڻا ٿي ويا آهن. اپڊيٽ ڪرڻ لاءِ ايپ هڪ ڀيرو کوليو.",
        girisBugun: "{saat} تي",
        girisYarin: "سڀاڻي {saat} تي",
        suAnVakti: "هاڻي {ad} جو وقت آهي.",
        suAnVaktiCikis: "هاڻي {ad} جو وقت آهي؛ اهو {saat} تي ختم ٿيندو.",
        siradakiNamaz: "ايندڙ نماز {ad} آهي، {giris}.",
        isaretlendi: "{ad} تي پڙهي وئي جو نشان لڳي ويو. {dua}.",
        zatenKilindi: "{ad} تي اڳ ئي پڙهي وئي جو نشان لڳل آهي.",
        vakitYok: "هن وقت نشان لڳائڻ لاءِ ڪا نماز ناهي.",
        vakitYokSiradaki: "هن وقت نشان لڳائڻ لاءِ ڪا نماز ناهي. ايندڙ {ad} آهي، {giris}.",
        onay: "{ad} تي پڙهي وئي جو نشان لڳايو؟",
        vakitDegisti: "نماز جو وقت بدلجي ويو، ان ڪري ڪو نشان نه لڳو. ٻيهر ڪوشش ڪريو.",
        kabulDuasi: "الله قبول ڪري",
        kildim: "نماز پڙهي ورتي",
        kilindi: "پڙهي وئي",
        kontrolKildim: "{ad} · پڙهي ورتي",
        kontrolKilindi: "{ad} پڙهي وئي",
        kontrolVakitYok: "نشان لاءِ ڪا نماز ناهي",
        uygulamayiAcin: "ايپ کوليو"
    )

    // pl
    public static let pl = VakitMetinleri(
        dil: "pl",
        adlar: ["sabah": "Fadżr", "ogle": "Zuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isza"],
        gunes: "Wschód słońca",
        konumYok: "Otwórz aplikację i ustaw lokalizację, aby można było obliczyć czasy modlitw.",
        veriEski: "Czasy modlitw są nieaktualne. Otwórz aplikację raz, aby je zaktualizować.",
        girisBugun: "o {saat}",
        girisYarin: "jutro o {saat}",
        suAnVakti: "Teraz jest czas modlitwy {ad}.",
        suAnVaktiCikis: "Teraz jest czas modlitwy {ad}; kończy się o {saat}.",
        siradakiNamaz: "Następna jest modlitwa {ad}, {giris}.",
        isaretlendi: "Modlitwa {ad} oznaczona jako odprawiona. {dua}.",
        zatenKilindi: "Modlitwa {ad} jest już oznaczona jako odprawiona.",
        vakitYok: "Teraz nie ma modlitwy do oznaczenia.",
        vakitYokSiradaki: "Teraz nie ma modlitwy do oznaczenia. Następna jest modlitwa {ad}, {giris}.",
        onay: "Oznaczyć modlitwę {ad} jako odprawioną?",
        vakitDegisti: "Czas modlitwy się zmienił, więc nic nie oznaczono. Spróbuj ponownie.",
        kabulDuasi: "Niech Allah przyjmie",
        kildim: "Odprawiono",
        kilindi: "Odprawiona",
        kontrolKildim: "{ad} · Odprawiono",
        kontrolKilindi: "{ad} odprawiona",
        kontrolVakitYok: "Brak modlitwy do oznaczenia",
        uygulamayiAcin: "Otwórz aplikację"
    )

    // ja
    public static let ja = VakitMetinleri(
        dil: "ja",
        adlar: ["sabah": "ファジュル", "ogle": "ズフル", "ikindi": "アスル", "aksam": "マグリブ", "yatsi": "イシャー"],
        gunes: "日の出",
        konumYok: "礼拝時間を計算できるよう、アプリを開いて現在地を設定してください。",
        veriEski: "礼拝時間が古くなっています。更新するにはアプリを一度開いてください。",
        girisBugun: "{saat}に",
        girisYarin: "明日の{saat}に",
        suAnVakti: "今は{ad}の時間です。",
        suAnVaktiCikis: "今は{ad}の時間です。{saat}に終わります。",
        siradakiNamaz: "次の礼拝は{ad}で、{giris}始まります。",
        isaretlendi: "{ad}を礼拝済みにしました。{dua}。",
        zatenKilindi: "{ad}はすでに礼拝済みです。",
        vakitYok: "今は記録する礼拝がありません。",
        vakitYokSiradaki: "今は記録する礼拝がありません。次は{ad}で、{giris}始まります。",
        onay: "{ad}を礼拝済みにしますか？",
        vakitDegisti: "礼拝時間が変わったため、何も記録されませんでした。もう一度お試しください。",
        kabulDuasi: "アッラーが受け入れてくださいますように",
        kildim: "礼拝しました",
        kilindi: "礼拝済み",
        kontrolKildim: "{ad}・礼拝しました",
        kontrolKilindi: "{ad}は礼拝済み",
        kontrolVakitYok: "記録する礼拝なし",
        uygulamayiAcin: "アプリを開く"
    )

    // gu — Gucaratça (beta): JS `sozluk/gu`; Kıldım "નમાઝ પઢી લીધી", Kılındı "પઢી લીધી"
    public static let gu = VakitMetinleri(
        dil: "gu",
        adlar: ["sabah": "ફજર", "ogle": "ઝોહર", "ikindi": "અસર", "aksam": "મગરિબ", "yatsi": "ઈશા"],
        gunes: "સૂર્યોદય",
        konumYok: "નમાઝના સમય ગણી શકાય તે માટે ઍપ ખોલીને તમારું લોકેશન ગોઠવો.",
        veriEski: "નમાઝના સમય જૂના છે. અપડેટ કરવા ઍપ એક વાર ખોલો.",
        girisBugun: "{saat} વાગ્યે",
        girisYarin: "આવતીકાલે {saat} વાગ્યે",
        suAnVakti: "અત્યારે {ad}નો સમય છે.",
        suAnVaktiCikis: "અત્યારે {ad}નો સમય છે; તે {saat} વાગ્યે પૂરો થાય છે.",
        siradakiNamaz: "હવે પછીની નમાઝ {ad} છે, {giris}.",
        isaretlendi: "{ad} પઢી લીધી તરીકે નોંધાઈ. {dua}.",
        zatenKilindi: "{ad} પહેલેથી પઢી લીધી તરીકે નોંધાયેલી છે.",
        vakitYok: "અત્યારે નોંધવા જેવી કોઈ નમાઝ નથી.",
        vakitYokSiradaki: "અત્યારે નોંધવા જેવી કોઈ નમાઝ નથી. હવે પછી {ad} છે, {giris}.",
        onay: "{ad} પઢી લીધી તરીકે નોંધવી છે?",
        vakitDegisti: "નમાઝનો સમય બદલાયો, તેથી કંઈ નોંધાયું નથી. ફરી પ્રયાસ કરો.",
        kabulDuasi: "અલ્લાહ કબૂલ કરે",
        kildim: "નમાઝ પઢી લીધી",
        kilindi: "પઢી લીધી",
        kontrolKildim: "{ad} · નમાઝ પઢી લીધી",
        kontrolKilindi: "{ad} પઢી લીધી",
        kontrolVakitYok: "નોંધવા કોઈ નમાઝ નથી",
        uygulamayiAcin: "ઍપ ખોલો"
    )

    // bg
    public static let bg = VakitMetinleri(
        dil: "bg",
        adlar: ["sabah": "Зора", "ogle": "Обяд", "ikindi": "Следобяд", "aksam": "Залез", "yatsi": "Нощ"],
        gunes: "Изгрев",
        konumYok: "Отворете приложението и задайте местоположението си, за да се изчислят времената за намаз.",
        veriEski: "Времената за намаз са остарели. Отворете приложението веднъж, за да ги обновите.",
        girisBugun: "в {saat}",
        girisYarin: "утре в {saat}",
        suAnVakti: "Сега е времето за {ad}.",
        suAnVaktiCikis: "Сега е времето за {ad}; изтича в {saat}.",
        siradakiNamaz: "Следващият намаз е {ad}, {giris}.",
        isaretlendi: "{ad} е отбелязан като изпълнен. {dua}.",
        zatenKilindi: "{ad} вече е отбелязан като изпълнен.",
        vakitYok: "В момента няма намаз за отбелязване.",
        vakitYokSiradaki: "В момента няма намаз за отбелязване. Следва {ad}, {giris}.",
        onay: "Да отбележите ли {ad} като изпълнен?",
        vakitDegisti: "Времето за намаз се смени, затова нищо не е отбелязано. Опитайте отново.",
        kabulDuasi: "Аллах да приеме",
        kildim: "Изпълних",
        kilindi: "Изпълнен",
        kontrolKildim: "{ad} · Изпълних",
        kontrolKilindi: "{ad} е изпълнен",
        kontrolVakitYok: "Няма намаз за отбелязване",
        uygulamayiAcin: "Отворете приложението"
    )

    // mk
    public static let mk = VakitMetinleri(
        dil: "mk",
        adlar: ["sabah": "Сабах", "ogle": "Пладне", "ikindi": "Икиндија", "aksam": "Акшам", "yatsi": "Јација"],
        gunes: "Изгрејсонце",
        konumYok: "Отворете ја апликацијата и поставете ја вашата локација за да може да се пресметаат времињата.",
        veriEski: "Времињата се застарени. Отворете ја апликацијата еднаш за да ги ажурирате.",
        girisBugun: "во {saat}",
        girisYarin: "утре во {saat}",
        suAnVakti: "Тековен намаз: {ad}.",
        suAnVaktiCikis: "Тековен намаз: {ad}; истекува во {saat}.",
        siradakiNamaz: "Следен намаз: {ad}, {giris}.",
        isaretlendi: "{ad}: вашиот намаз е означен како клањан. {dua}.",
        zatenKilindi: "{ad}: намазот веќе е означен како клањан.",
        vakitYok: "Моментално нема намаз за клањање.",
        vakitYokSiradaki: "Моментално нема намаз за клањање. Следен: {ad}, {giris}.",
        onay: "Да се означи намазот ({ad}) како клањан?",
        vakitDegisti: "Времето за намаз се промени, означувањето не е извршено. Обидете се повторно.",
        kabulDuasi: "Аллах нека прими",
        kildim: "Клањав",
        kilindi: "Клањано",
        kontrolKildim: "{ad} · Клањав",
        kontrolKilindi: "{ad}: клањано",
        kontrolVakitYok: "Нема намаз за клањање",
        uygulamayiAcin: "Отворете ја апликацијата"
    )

    // fil
    public static let fil = VakitMetinleri(
        dil: "fil",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Pagsikat ng araw",
        konumYok: "Buksan ang app at itakda ang lokasyon para makalkula ang mga oras ng dasal.",
        veriEski: "Luma na ang mga oras ng dasal. Buksan ang app nang isang beses para i-update ang mga ito.",
        girisBugun: "sa {saat}",
        girisYarin: "bukas sa {saat}",
        suAnVakti: "Oras na ngayon ng {ad}.",
        suAnVaktiCikis: "Oras na ngayon ng {ad}; matatapos ito sa {saat}.",
        siradakiNamaz: "Ang susunod na dasal ay {ad} {giris}.",
        isaretlendi: "Namarkahang naidasal na ang {ad}. {dua}.",
        zatenKilindi: "Namarkahan nang naidasal ang {ad}.",
        vakitYok: "Walang dasal na mamarkahan ngayon.",
        vakitYokSiradaki: "Walang dasal na mamarkahan ngayon. Susunod ang {ad} {giris}.",
        onay: "Markahang naidasal na ang {ad}?",
        vakitDegisti: "Nagbago ang oras ng dasal, kaya walang namarkahan. Subukang muli.",
        kabulDuasi: "Tanggapin nawa ni Allah",
        kildim: "Nagdasal ako",
        kilindi: "Naidasal na",
        kontrolKildim: "{ad} · Nagdasal ako",
        kontrolKilindi: "Naidasal na ang {ad}",
        kontrolVakitYok: "Walang dasal na mamarkahan",
        uygulamayiAcin: "Buksan ang app"
    )

    // te — Telugu (beta): JS `sozluk/te`; Kıldım "ఆచరించాను", Kılındı "ఆచరించబడింది"
    public static let te = VakitMetinleri(
        dil: "te",
        adlar: ["sabah": "ఫజ్ర్", "ogle": "జుహ్ర్", "ikindi": "అస్ర్", "aksam": "మగ్రిబ్", "yatsi": "ఇషా"],
        gunes: "సూర్యోదయం",
        konumYok: "నమాజ్ సమయాలు లెక్కించబడటానికి యాప్‌ను తెరిచి మీ లొకేషన్‌ను సెట్ చేయండి.",
        veriEski: "నమాజ్ సమయాలు పాతవి. అప్‌డేట్ చేయడానికి యాప్‌ను ఒకసారి తెరవండి.",
        girisBugun: "{saat}కి",
        girisYarin: "రేపు {saat}కి",
        suAnVakti: "ఇప్పుడు {ad} సమయం.",
        suAnVaktiCikis: "ఇప్పుడు {ad} సమయం; అది {saat}కి ముగుస్తుంది.",
        siradakiNamaz: "తదుపరి నమాజ్ {ad}, {giris}.",
        isaretlendi: "{ad} ఆచరించినట్లు గుర్తించబడింది. {dua}.",
        zatenKilindi: "{ad} ఇప్పటికే ఆచరించినట్లు గుర్తించబడింది.",
        vakitYok: "ప్రస్తుతం గుర్తించడానికి నమాజ్ లేదు.",
        vakitYokSiradaki: "ప్రస్తుతం గుర్తించడానికి నమాజ్ లేదు. తదుపరి {ad}, {giris}.",
        onay: "{ad} ఆచరించినట్లు గుర్తించాలా?",
        vakitDegisti: "నమాజ్ సమయం మారింది, కాబట్టి ఏదీ గుర్తించబడలేదు. మళ్లీ ప్రయత్నించండి.",
        kabulDuasi: "అల్లాహ్ స్వీకరించుగాక",
        kildim: "ఆచరించాను",
        kilindi: "ఆచరించబడింది",
        kontrolKildim: "{ad} · ఆచరించాను",
        kontrolKilindi: "{ad} ఆచరించబడింది",
        kontrolVakitYok: "గుర్తించడానికి నమాజ్ లేదు",
        uygulamayiAcin: "యాప్‌ను తెరవండి"
    )

    // kn
    public static let kn = VakitMetinleri(
        dil: "kn",
        adlar: ["sabah": "ಫಜ್ರ್", "ogle": "ಝುಹರ್", "ikindi": "ಅಸರ್", "aksam": "ಮಗ್ರಿಬ್", "yatsi": "ಇಶಾ"],
        gunes: "ಸೂರ್ಯೋದಯ",
        konumYok: "ನಮಾಝ್ ಸಮಯಗಳನ್ನು ಲೆಕ್ಕ ಹಾಕಲು ಆ್ಯಪ್ ತೆರೆದು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹೊಂದಿಸಿ.",
        veriEski: "ನಮಾಝ್ ಸಮಯಗಳು ಹಳೆಯದಾಗಿವೆ. ನವೀಕರಿಸಲು ಆ್ಯಪ್ ಅನ್ನು ಒಮ್ಮೆ ತೆರೆಯಿರಿ.",
        girisBugun: "{saat} ಕ್ಕೆ",
        girisYarin: "ನಾಳೆ {saat} ಕ್ಕೆ",
        suAnVakti: "ಈಗ {ad} ಸಮಯ.",
        suAnVaktiCikis: "ಈಗ {ad} ಸಮಯ; ಇದು {saat} ಕ್ಕೆ ಮುಗಿಯುತ್ತದೆ.",
        siradakiNamaz: "ಮುಂದಿನ ನಮಾಝ್ {ad}, {giris}.",
        isaretlendi: "{ad} ನಮಾಝನ್ನು ನಿರ್ವಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. {dua}.",
        zatenKilindi: "{ad} ನಮಾಝ್ ಈಗಾಗಲೇ ನಿರ್ವಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.",
        vakitYok: "ಸದ್ಯ ನಿರ್ವಹಿಸಬೇಕಾದ ನಮಾಝ್ ಇಲ್ಲ.",
        vakitYokSiradaki: "ಸದ್ಯ ನಿರ್ವಹಿಸಬೇಕಾದ ನಮಾಝ್ ಇಲ್ಲ. ಮುಂದಿನದು {ad}, {giris}.",
        onay: "{ad} ನಮಾಝನ್ನು ನಿರ್ವಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಬೇಕೆ?",
        vakitDegisti: "ನಮಾಝ್ ಸಮಯ ಬದಲಾಗಿದೆ, ಏನೂ ಗುರುತಿಸಲಾಗಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        kabulDuasi: "ಅಲ್ಲಾಹು ಸ್ವೀಕರಿಸಲಿ",
        kildim: "ನಮಾಝ್ ಮಾಡಿದೆ",
        kilindi: "ನಿರ್ವಹಿಸಲಾಗಿದೆ",
        kontrolKildim: "{ad} · ನಮಾಝ್ ಮಾಡಿದೆ",
        kontrolKilindi: "{ad} ನಿರ್ವಹಿಸಲಾಗಿದೆ",
        kontrolVakitYok: "ಗುರುತಿಸಬೇಕಾದ ನಮಾಝ್ ಇಲ್ಲ",
        uygulamayiAcin: "ಆ್ಯಪ್ ತೆರೆಯಿರಿ"
    )

    // mr — Marathi (beta): JS `sozluk/mr`; Kıldım "नमाज पढली", Kılındı "अदा झाली"
    public static let mr = VakitMetinleri(
        dil: "mr",
        adlar: ["sabah": "फज्र", "ogle": "जोहर", "ikindi": "असर", "aksam": "मगरिब", "yatsi": "इशा"],
        gunes: "सूर्योदय",
        konumYok: "नमाजच्या वेळा मोजता याव्यात म्हणून ॲप उघडा आणि तुमचे स्थान सेट करा.",
        veriEski: "नमाजच्या वेळा जुन्या झाल्या आहेत. अपडेट करण्यासाठी एकदा ॲप उघडा.",
        girisBugun: "{saat} वाजता",
        girisYarin: "उद्या {saat} वाजता",
        suAnVakti: "आता {ad} ची वेळ आहे.",
        suAnVaktiCikis: "आता {ad} ची वेळ आहे; ती {saat} वाजता संपते.",
        siradakiNamaz: "पुढील नमाज {ad} आहे, {giris}.",
        isaretlendi: "{ad} \"अदा झाली\" म्हणून नोंदवली. {dua}.",
        zatenKilindi: "{ad} आधीच \"अदा झाली\" म्हणून नोंदवलेली आहे.",
        vakitYok: "आत्ता नोंदवण्यासाठी कोणतीही नमाज नाही.",
        vakitYokSiradaki: "आत्ता नोंदवण्यासाठी कोणतीही नमाज नाही. पुढील नमाज {ad} आहे, {giris}.",
        onay: "{ad} \"अदा झाली\" म्हणून नोंदवायची का?",
        vakitDegisti: "नमाजची वेळ बदलली, त्यामुळे काहीही नोंदवले गेले नाही. पुन्हा प्रयत्न करा.",
        kabulDuasi: "अल्लाह कबूल करो",
        kildim: "नमाज पढली",
        kilindi: "अदा झाली",
        kontrolKildim: "{ad} · नमाज पढली",
        kontrolKilindi: "{ad} अदा झाली",
        kontrolVakitYok: "नोंदीसाठी नमाज नाही",
        uygulamayiAcin: "ॲप उघडा"
    )

    // pa (yalnız Şahmuki; terimler src/core/dil/sozluk/pa)
    public static let pa = VakitMetinleri(
        dil: "pa",
        adlar: ["sabah": "فجر", "ogle": "ظہر", "ikindi": "عصر", "aksam": "مغرب", "yatsi": "عشاء"],
        gunes: "طلوعِ آفتاب",
        konumYok: "نماز دے وقت کڈھن لئی ایپ کھولو تے اپنا مقام چُنو۔",
        veriEski: "نماز دے وقت پرانے ہو گئے نیں۔ اپ ڈیٹ کرن لئی ایپ اک وار کھولو۔",
        girisBugun: "{saat} تے",
        girisYarin: "بھلکے {saat} تے",
        suAnVakti: "ہن {ad} دا وقت اے۔",
        suAnVaktiCikis: "ہن {ad} دا وقت اے؛ ایہہ {saat} تے مکدا اے۔",
        siradakiNamaz: "اگلی نماز {ad} اے، {giris}۔",
        isaretlendi: "{ad} دی نماز تے ادا ہو گئی دا نشان لگ گیا۔ {dua}۔",
        zatenKilindi: "{ad} دی نماز تے پہلاں ای ادا ہو گئی دا نشان لگیا اے۔",
        vakitYok: "ایس ویلے نشان لاؤن لئی کوئی نماز نہیں۔",
        vakitYokSiradaki: "ایس ویلے نشان لاؤن لئی کوئی نماز نہیں۔ اگلی نماز {ad} اے، {giris}۔",
        onay: "{ad} دی نماز تے ادا ہو گئی دا نشان لاؤ گے؟",
        vakitDegisti: "نماز دا وقت بدل گیا، ایس لئی نشان نہیں لایا گیا۔ فیر کوشش کرو۔",
        kabulDuasi: "اللہ قبول کرے",
        kildim: "نماز پڑھ لئی",
        kilindi: "ادا ہو گئی",
        kontrolKildim: "{ad} · نماز پڑھ لئی",
        kontrolKilindi: "{ad} ادا ہو گئی",
        kontrolVakitYok: "نشان لاؤن لئی کوئی نماز نہیں",
        uygulamayiAcin: "ایپ کھولو"
    )

    // as
    public static let `as` = VakitMetinleri(
        dil: "as",
        adlar: ["sabah": "ফজৰ", "ogle": "জোহৰ", "ikindi": "আছৰ", "aksam": "মাগৰিব", "yatsi": "ঈশ্বা"],
        gunes: "সূৰ্যোদয়",
        konumYok: "নামাজৰ সময় গণনা কৰিবলৈ এপটো খুলি আপোনাৰ অৱস্থান ছেট কৰক।",
        veriEski: "নামাজৰ সময় পুৰণি হৈছে। আপডে’ট কৰিবলৈ এবাৰ এপটো খোলক।",
        girisBugun: "{saat} বজাত",
        girisYarin: "কাইলৈ {saat} বজাত",
        suAnVakti: "এতিয়া {ad}ৰ ওৱাক্ত।",
        suAnVaktiCikis: "এতিয়া {ad}ৰ ওৱাক্ত; {saat} বজাত শেষ হ’ব।",
        siradakiNamaz: "পৰৱৰ্তী নামাজ {ad}, {giris}।",
        isaretlendi: "{ad}ৰ নামাজ পঢ়া হ’ল বুলি চিহ্নিত কৰা হ’ল। {dua}।",
        zatenKilindi: "{ad}ৰ নামাজ আগতেই পঢ়া হ’ল বুলি চিহ্নিত কৰা আছে।",
        vakitYok: "এই মুহূৰ্তত চিহ্নিত কৰিবলগীয়া কোনো নামাজ নাই।",
        vakitYokSiradaki: "এই মুহূৰ্তত চিহ্নিত কৰিবলগীয়া কোনো নামাজ নাই। পৰৱৰ্তী {ad}, {giris}।",
        onay: "{ad}ৰ নামাজ পঢ়া হ’ল বুলি চিহ্নিত কৰিবনে?",
        vakitDegisti: "নামাজৰ সময় সলনি হ’ল, সেয়ে একো চিহ্নিত কৰা নহ’ল। পুনৰ চেষ্টা কৰক।",
        kabulDuasi: "আল্লাহে কবুল কৰক",
        kildim: "নামাজ পঢ়িছোঁ",
        kilindi: "পঢ়া হ’ল",
        kontrolKildim: "{ad} · নামাজ পঢ়িছোঁ",
        kontrolKilindi: "{ad} পঢ়া হ’ল",
        kontrolVakitYok: "চিহ্নিত কৰিবলগীয়া নামাজ নাই",
        uygulamayiAcin: "এপটো খোলক"
    )

    // ne
    public static let ne = VakitMetinleri(
        dil: "ne",
        adlar: ["sabah": "फज्र", "ogle": "जुहर", "ikindi": "अस्र", "aksam": "मगरिब", "yatsi": "इशा"],
        gunes: "सूर्योदय",
        konumYok: "नमाजका समय गणना गर्न एप खोलेर आफ्नो लोकेसन सेट गर्नुहोस्।",
        veriEski: "नमाजका समय पुराना भए। अपडेट गर्न एप एक पटक खोल्नुहोस्।",
        girisBugun: "{saat} बजे",
        girisYarin: "भोलि {saat} बजे",
        suAnVakti: "अहिले {ad}को समय हो।",
        suAnVaktiCikis: "अहिले {ad}को समय हो; {saat} मा सकिन्छ।",
        siradakiNamaz: "अर्को नमाज {ad} हो, {giris}।",
        isaretlendi: "{ad}मा \"पढियो\" चिन्ह लगाइयो। {dua}।",
        zatenKilindi: "{ad}मा पहिले नै \"पढियो\" चिन्ह लगाइएको छ।",
        vakitYok: "अहिले चिन्ह लगाउने कुनै नमाज छैन।",
        vakitYokSiradaki: "अहिले चिन्ह लगाउने कुनै नमाज छैन। अर्को {ad} हो, {giris}।",
        onay: "{ad}मा \"पढियो\" चिन्ह लगाउने हो?",
        vakitDegisti: "नमाजको समय बदलिएकाले केही पनि चिन्ह लगाइएन। फेरि प्रयास गर्नुहोस्।",
        kabulDuasi: "अल्लाहले स्वीकार गरून्",
        kildim: "नमाज पढें",
        kilindi: "पढियो",
        kontrolKildim: "{ad} · नमाज पढें",
        kontrolKilindi: "{ad} पढियो",
        kontrolVakitYok: "चिन्ह लगाउने नमाज छैन",
        uygulamayiAcin: "एप खोल्नुहोस्"
    )

    // si — Sinhala (beta): JS `sozluk/si`; Kıldım "ඉටු කළෙමි", Kılındı "ඉටු කළා"
    public static let si = VakitMetinleri(
        dil: "si",
        adlar: ["sabah": "ෆජ්ර්", "ogle": "ලුහර්", "ikindi": "අසර්", "aksam": "මග්රිබ්", "yatsi": "ඉෂා"],
        gunes: "හිරු උදාව",
        konumYok: "සලාත් වේලාවන් ගණනය කිරීමට යෙදුම විවෘත කර ඔබගේ ස්ථානය සකසන්න.",
        veriEski: "සලාත් වේලාවන් යල් පැන ගොස් ඇත. ඒවා යාවත්කාලීන කිරීමට යෙදුම එක් වරක් විවෘත කරන්න.",
        girisBugun: "{saat}ට",
        girisYarin: "හෙට {saat}ට",
        suAnVakti: "දැන් {ad} වේලාවයි.",
        suAnVaktiCikis: "දැන් {ad} වේලාවයි; එය {saat}ට අවසන් වේ.",
        siradakiNamaz: "ඊළඟ සලාතය {ad}, {giris}.",
        isaretlendi: "{ad} ඉටු කළ බව සලකුණු කළා. {dua}.",
        zatenKilindi: "{ad} දැනටමත් ඉටු කළ බව සලකුණු කර ඇත.",
        vakitYok: "දැනට සලකුණු කිරීමට සලාතයක් නැත.",
        vakitYokSiradaki: "දැනට සලකුණු කිරීමට සලාතයක් නැත. ඊළඟට {ad}, {giris}.",
        onay: "{ad} ඉටු කළ බව සලකුණු කරන්නද?",
        vakitDegisti: "සලාත් වේලාව වෙනස් වූ බැවින් කිසිවක් සලකුණු කළේ නැත. නැවත උත්සාහ කරන්න.",
        kabulDuasi: "අල්ලාහ් පිළිගනු මැනව",
        kildim: "ඉටු කළෙමි",
        kilindi: "ඉටු කළා",
        kontrolKildim: "{ad} · ඉටු කළෙමි",
        kontrolKilindi: "{ad} ඉටු කළා",
        kontrolVakitYok: "සලකුණු කිරීමට සලාතයක් නැත",
        uygulamayiAcin: "යෙදුම විවෘත කරන්න"
    )

    // km
    public static let km = VakitMetinleri(
        dil: "km",
        adlar: ["sabah": "ស៊ូពុស", "ogle": "ហ្ស៊ូហូរ", "ikindi": "អាសើរ", "aksam": "ម៉ាហ្គ្រិប", "yatsi": "អ៊ីស្ហា"],
        gunes: "ថ្ងៃរះ",
        konumYok: "បើកកម្មវិធី ហើយកំណត់ទីតាំងរបស់អ្នក ដើម្បីឲ្យពេលសឡាតអាចគណនាបាន។",
        veriEski: "ពេលសឡាតហួសសម័យហើយ។ សូមបើកកម្មវិធីម្ដង ដើម្បីធ្វើបច្ចុប្បន្នភាព។",
        girisBugun: "នៅម៉ោង {saat}",
        girisYarin: "ថ្ងៃស្អែកនៅម៉ោង {saat}",
        suAnVakti: "ឥឡូវជាពេល{ad}។",
        suAnVaktiCikis: "ឥឡូវជាពេល{ad} វានឹងផុតនៅម៉ោង {saat}។",
        siradakiNamaz: "សឡាតបន្ទាប់គឺ{ad} {giris}។",
        isaretlendi: "{ad} ត្រូវបានសម្គាល់ថាបានសឡាត។ {dua}។",
        zatenKilindi: "{ad} ត្រូវបានសម្គាល់ថាបានសឡាតរួចហើយ។",
        vakitYok: "ឥឡូវគ្មានសឡាតដែលត្រូវសម្គាល់ទេ។",
        vakitYokSiradaki: "ឥឡូវគ្មានសឡាតដែលត្រូវសម្គាល់ទេ។ បន្ទាប់គឺ{ad} {giris}។",
        onay: "សម្គាល់{ad}ថាបានសឡាតឬ?",
        vakitDegisti: "ពេលសឡាតបានផ្លាស់ប្ដូរ ដូច្នេះគ្មានអ្វីត្រូវបានសម្គាល់ទេ។ ព្យាយាមម្ដងទៀត។",
        kabulDuasi: "សូមអល់ឡោះទទួលយក",
        kildim: "បានសឡាតហើយ",
        kilindi: "បានសឡាត",
        kontrolKildim: "{ad} · បានសឡាតហើយ",
        kontrolKilindi: "បានសឡាត{ad}",
        kontrolVakitYok: "គ្មានសឡាតដែលត្រូវសម្គាល់",
        uygulamayiAcin: "បើកកម្មវិធី"
    )

    // he
    public static let he = VakitMetinleri(
        dil: "he",
        adlar: ["sabah": "פג'ר", "ogle": "זוהר", "ikindi": "עצר", "aksam": "מגרב", "yatsi": "עשאא"],
        gunes: "זריחה",
        konumYok: "כדי לחשב את זמני התפילה, פתחו את האפליקציה והגדירו את המיקום.",
        veriEski: "זמני התפילה לא מעודכנים. פתחו את האפליקציה פעם אחת כדי לעדכן.",
        girisBugun: "בשעה {saat}",
        girisYarin: "מחר בשעה {saat}",
        suAnVakti: "עכשיו זמן {ad}.",
        suAnVaktiCikis: "עכשיו זמן {ad}; הוא מסתיים בשעה {saat}.",
        siradakiNamaz: "התפילה הבאה: {ad}, {giris}.",
        isaretlendi: "תפילת {ad} סומנה כבוצעה. {dua}.",
        zatenKilindi: "תפילת {ad} כבר מסומנת כבוצעה.",
        vakitYok: "אין עכשיו תפילה לסימון.",
        vakitYokSiradaki: "אין עכשיו תפילה לסימון. התפילה הבאה: {ad}, {giris}.",
        onay: "לסמן את תפילת {ad} כבוצעה?",
        vakitDegisti: "זמן התפילה השתנה, ולכן לא סומן דבר. נסו שוב.",
        kabulDuasi: "אללה יקבל",
        kildim: "התפללתי",
        kilindi: "בוצעה",
        kontrolKildim: "{ad} · התפללתי",
        kontrolKilindi: "{ad} בוצעה",
        kontrolVakitYok: "אין תפילה לסימון",
        uygulamayiAcin: "פתיחת האפליקציה"
    )

    // ka — Gürcüce (beta); terimler src/core/dil/sozluk/ka (CekirdekMetinleri ka ile aynı)
    public static let ka = VakitMetinleri(
        dil: "ka",
        adlar: ["sabah": "ფაჯრი", "ogle": "ზუჰრი", "ikindi": "ასრი", "aksam": "მაღრიბი", "yatsi": "იშა"],
        gunes: "მზის ამოსვლა",
        konumYok: "გახსენით აპი და მიუთითეთ მდებარეობა, რომ ლოცვის დროები გამოითვალოს.",
        veriEski: "ლოცვის დროის მონაცემები მოძველებულია. განსაახლებლად ერთხელ გახსენით აპი.",
        girisBugun: "{saat}-ზე",
        girisYarin: "ხვალ {saat}-ზე",
        suAnVakti: "ახლა არის {ad}.",
        suAnVaktiCikis: "ახლა არის {ad}; სრულდება {saat}-ზე.",
        siradakiNamaz: "შემდეგი ლოცვაა {ad}, {giris}.",
        isaretlendi: "{ad} მოინიშნა შესრულებულად. {dua}.",
        zatenKilindi: "{ad} უკვე მონიშნულია შესრულებულად.",
        vakitYok: "ახლა მოსანიშნი ლოცვა არ არის.",
        vakitYokSiradaki: "ახლა მოსანიშნი ლოცვა არ არის. შემდეგია {ad}, იწყება {giris}.",
        onay: "მოვნიშნოთ {ad} შესრულებულად?",
        vakitDegisti: "ლოცვის დრო შეიცვალა, ამიტომ არაფერი მოინიშნა. სცადეთ ხელახლა.",
        kabulDuasi: "ალლაჰმა მიიღოს",
        kildim: "ვილოცე",
        kilindi: "შესრულებულია",
        kontrolKildim: "{ad} · ვილოცე",
        kontrolKilindi: "{ad} შესრულებულია",
        kontrolVakitYok: "მოსანიშნი ლოცვა არ არის",
        uygulamayiAcin: "აპის გახსნა"
    )

    // ÇEVİRİ: lt
    public static let lt = VakitMetinleri(
        dil: "lt",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    // mg
    public static let mg = VakitMetinleri(
        dil: "mg",
        adlar: ["sabah": "Fajr", "ogle": "Zohr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Masoandro",
        konumYok: "Sokafy ny fampiharana ary apetraho ny toerana misy anao mba hikajiana ny fotoanan'ny soalat.",
        veriEski: "Efa lany andro ny fotoanan'ny soalat. Sokafy indray mandeha ny fampiharana mba hanavaozana azy.",
        girisBugun: "amin'ny {saat}",
        girisYarin: "rahampitso amin'ny {saat}",
        suAnVakti: "Fotoanan'ny {ad} izao.",
        suAnVaktiCikis: "Fotoanan'ny {ad} izao; tapitra amin'ny {saat} izy.",
        siradakiNamaz: "Ny soalat manaraka dia {ad} {giris}.",
        isaretlendi: "Voamarika ho vita ny {ad}. {dua}.",
        zatenKilindi: "Efa voamarika ho vita ny {ad}.",
        vakitYok: "Tsy misy soalat hamarihina amin'izao.",
        vakitYokSiradaki: "Tsy misy soalat hamarihina amin'izao. Ny manaraka dia {ad} {giris}.",
        onay: "Hamarihina ho vita ve ny {ad}?",
        vakitDegisti: "Niova ny fotoanan'ny soalat, ka tsy nisy voamarika. Andramo indray.",
        kabulDuasi: "Raisin'Allah anie",
        kildim: "Nivavaka aho",
        kilindi: "Vita",
        kontrolKildim: "{ad} · Nivavaka aho",
        kontrolKilindi: "Vita ny {ad}",
        kontrolVakitYok: "Tsy misy soalat hamarihina",
        uygulamayiAcin: "Sokafy ny fampiharana"
    )

    public static let lg = VakitMetinleri(
        dil: "lg",
        adlar: ["sabah": "Subuhi", "ogle": "Dhuhur", "ikindi": "Aswiri", "aksam": "Magaribi", "yatsi": "Ishai"],
        gunes: "Enjuba okuvaayo",
        konumYok: "Ggulawo app oteekewo ekifo kyo ebiseera by’esswala bisobole okubalibwa.",
        veriEski: "Ebiseera by’esswala bikaddiye. Ggulawo app omulundi gumu obizze obuggya.",
        girisBugun: "ku ssaawa {saat}",
        girisYarin: "enkya ku ssaawa {saat}",
        suAnVakti: "Kati kiseera kya {ad}.",
        suAnVaktiCikis: "Kati kiseera kya {ad}; kiggwaako ku ssaawa {saat}.",
        siradakiNamaz: "Esswala eddako ye {ad}, etandika {giris}.",
        isaretlendi: "{ad} eteereddwako akabonero nti esaaliddwa. {dua}.",
        zatenKilindi: "{ad} yamaze dda okuteekebwako akabonero nti esaaliddwa.",
        vakitYok: "Tewali sswala ya kuteekako kabonero kati.",
        vakitYokSiradaki: "Tewali sswala ya kuteekako kabonero kati. Eddako ye {ad}, etandika {giris}.",
        onay: "Teeka akabonero ku {ad} nti esaaliddwa?",
        vakitDegisti: "Ekiseera ky’esswala kikyuse, n’olwekyo tewali kiteereddwako kabonero. Ddamu ogezeeko.",
        kabulDuasi: "Allah akkirize",
        kildim: "Nsaaze",
        kilindi: "Esaaliddwa",
        kontrolKildim: "{ad} · Nsaaze",
        kontrolKilindi: "{ad} esaaliddwa",
        kontrolVakitYok: "Tewali sswala ya kuteekako kabonero",
        uygulamayiAcin: "Ggulawo app"
    )

    // rw
    public static let rw = VakitMetinleri(
        dil: "rw",
        adlar: ["sabah": "Fajri", "ogle": "Adhuhuri", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Izuba rirashe",
        konumYok: "Mufungure porogaramu mushyireho aho muherereye kugira ngo ibihe by’iswala bibarwe.",
        veriEski: "Ibihe by’iswala ntibikijyanye n’igihe. Mufungure porogaramu rimwe kugira ngo bivugururwe.",
        girisBugun: "saa {saat}",
        girisYarin: "ejo saa {saat}",
        suAnVakti: "Ubu ni igihe cya {ad}.",
        suAnVaktiCikis: "Ubu ni igihe cya {ad}; kirangira saa {saat}.",
        siradakiNamaz: "Iswala ikurikira ni {ad}, {giris}.",
        isaretlendi: "Byemejwe ko {ad} yasaliwe. {dua}.",
        zatenKilindi: "Byari byaremejwe ko {ad} yasaliwe.",
        vakitYok: "Nta swala yo kwemeza ubu.",
        vakitYokSiradaki: "Nta swala yo kwemeza ubu. Ikurikira ni {ad}, {giris}.",
        onay: "Kwemeza ko {ad} yasaliwe?",
        vakitDegisti: "Igihe cy’iswala cyahindutse, nta cyemejwe. Mwongere mugerageze.",
        kabulDuasi: "Allah abyakire",
        kildim: "Nasali",
        kilindi: "Yasaliwe",
        kontrolKildim: "{ad} · Nasali",
        kontrolKilindi: "{ad} yasaliwe",
        kontrolVakitYok: "Nta swala yo kwemeza",
        uygulamayiAcin: "Mufungure porogaramu"
    )

    // rn
    public static let rn = VakitMetinleri(
        dil: "rn",
        adlar: ["sabah": "Fajri", "ogle": "Adhuhuri", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Izuba rirashe",
        konumYok: "Mwugurure porogarama mushireho ikibanza canyu kugira ngo ibihe vy’isengesho biharurwe.",
        veriEski: "Ibihe vy’isengesho birashaje. Mwugurure porogarama rimwe kugira bivugururwe.",
        girisBugun: "ku isaha {saat}",
        girisYarin: "ejo ku isaha {saat}",
        suAnVakti: "Ubu ni igihe ca {ad}.",
        suAnVaktiCikis: "Ubu ni igihe ca {ad}; kirangira ku isaha {saat}.",
        siradakiNamaz: "Isengesho rikurikira ni {ad}, {giris}.",
        isaretlendi: "Isengesho rya {ad} ryemejwe. {dua}.",
        zatenKilindi: "Isengesho rya {ad} ryari ryaremejwe.",
        vakitYok: "Nta sengesho ryo kwemeza ubu.",
        vakitYokSiradaki: "Nta sengesho ryo kwemeza ubu. Rikurikira ni {ad}, {giris}.",
        onay: "Mwemeze ko {ad} yasenzwe?",
        vakitDegisti: "Igihe c’isengesho cahindutse, ni co gituma nta kintu cemejwe. Mwongere mugerageze.",
        kabulDuasi: "Allah abyakire",
        kildim: "Nasenze",
        kilindi: "Ryasenzwe",
        kontrolKildim: "{ad} · Nasenze",
        kontrolKilindi: "{ad} ryasenzwe",
        kontrolVakitYok: "Nta sengesho ryo kwemeza",
        uygulamayiAcin: "Mwugurure porogarama"
    )

    // ln
    public static let ln = VakitMetinleri(
        dil: "ln",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Kobima ya moi",
        konumYok: "Bofungola aplikasiɔ mpe botia esika na bino mpɔ ete bangonga ya losambo etangama.",
        veriEski: "Bangonga ya losambo esili ntango. Bofungola aplikasiɔ mbala mɔkɔ mpɔ na kozongisa yango ya sika.",
        girisBugun: "na {saat}",
        girisYarin: "lobi na {saat}",
        suAnVakti: "Sikoyo ezali ntango ya {ad}.",
        suAnVaktiCikis: "Sikoyo ezali ntango ya {ad}; ekosila na {saat}.",
        siradakiNamaz: "Losambo oyo elandi ezali {ad} {giris}.",
        isaretlendi: "{ad} etiami elembo ete esambelami. {dua}.",
        zatenKilindi: "{ad} etiami kala elembo ete esambelami.",
        vakitYok: "Losambo ya kotia elembo ezali te sikoyo.",
        vakitYokSiradaki: "Losambo ya kotia elembo ezali te sikoyo. Oyo elandi ezali {ad} {giris}.",
        onay: "Botia elembo ete {ad} esambelami?",
        vakitDegisti: "Ntango ya losambo ebongwani, yango wana elembo etiami te. Bomeka lisusu.",
        kabulDuasi: "Allah andimela bino",
        kildim: "Nasambeli",
        kilindi: "Esambelami",
        kontrolKildim: "{ad} · Nasambeli",
        kontrolKilindi: "{ad} esambelami",
        kontrolVakitYok: "Losambo ya kotia elembo ezali te",
        uygulamayiAcin: "Bofungola aplikasiɔ"
    )

    // ÇEVİRİ: dag
    public static let dag = VakitMetinleri(
        dil: "dag",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    // ÇEVİRİ: mos
    public static let mos = VakitMetinleri(
        dil: "mos",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    // aa
    public static let aa = VakitMetinleri(
        dil: "aa",
        adlar: ["sabah": "Subci", "ogle": "Dohori", "ikindi": "Qasri", "aksam": "Magrib", "yatsi": "Qisha"],
        gunes: "Ayro mawqa",
        konumYok: "Salat wakti cisaabimamkeh app fakaay sinni arac haysa.",
        veriEski: "Salat wakti qusba hinna. Qusbisaanamkeh app inki adda faka.",
        girisBugun: "saaqat {saat}",
        girisYarin: "beera saaqat {saat}",
        suAnVakti: "Asaaku {ad} wakti.",
        suAnVaktiCikis: "Asaaku {ad} wakti; {saat} gexa.",
        siradakiNamaz: "Lakal tan salat {ad}, {giris}.",
        isaretlendi: "{ad} abime calaamisime. {dua}.",
        zatenKilindi: "{ad} duma abime calaamisime.",
        vakitYok: "Asaaku calaamisimta salat mali.",
        vakitYokSiradaki: "Asaaku calaamisimta salat mali. Lakal tan {ad}, {giris}.",
        onay: "{ad} abime calaamisnaa?",
        vakitDegisti: "Salat wakti korsite, toh sabbatah tu calaamisime wee. Kaadu mokkora.",
        kabulDuasi: "Allah oggolay",
        kildim: "Salat abe",
        kilindi: "Abime",
        kontrolKildim: "{ad} · Salat abe",
        kontrolKilindi: "{ad} abime",
        kontrolVakitYok: "Calaamisimta salat mali",
        uygulamayiAcin: "App faka"
    )

    // ÇEVİRİ: mdh
    public static let mdh = VakitMetinleri(
        dil: "mdh",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    // ÇEVİRİ: ak
    public static let ak = VakitMetinleri(
        dil: "ak",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    // ÇEVİRİ: ceb
    public static let ceb = VakitMetinleri(
        dil: "ceb",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    // ÇEVİRİ: nqo
    public static let nqo = VakitMetinleri(
        dil: "nqo",
        adlar: ["sabah": "Fajr", "ogle": "Dhuhr", "ikindi": "Asr", "aksam": "Maghrib", "yatsi": "Isha"],
        gunes: "Sunrise",
        konumYok: "Open the app and set your location so prayer times can be calculated.",
        veriEski: "Prayer times are out of date. Open the app once to update them.",
        girisBugun: "at {saat}",
        girisYarin: "tomorrow at {saat}",
        suAnVakti: "It's {ad} time now.",
        suAnVaktiCikis: "It's {ad} time now; it ends at {saat}.",
        siradakiNamaz: "The next prayer is {ad} {giris}.",
        isaretlendi: "{ad} is marked as prayed. {dua}.",
        zatenKilindi: "{ad} is already marked as prayed.",
        vakitYok: "There is no prayer to mark right now.",
        vakitYokSiradaki: "There is no prayer to mark right now. Next is {ad} {giris}.",
        onay: "Mark {ad} as prayed?",
        vakitDegisti: "The prayer time changed, so nothing was marked. Try again.",
        kabulDuasi: "May Allah accept it",
        kildim: "I've prayed",
        kilindi: "Prayed",
        kontrolKildim: "{ad} · I've prayed",
        kontrolKilindi: "{ad} prayed",
        kontrolVakitYok: "No prayer to mark",
        uygulamayiAcin: "Open the app"
    )

    /// Dil kodu → tablo (sira `ArayuzDili.desteklenenler`).
    public static let tablo: [String: VakitMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
        "zh": zh, "ta": ta, "ml": ml, "th": th, "ko": ko, "vi": vi,
        "pt": pt, "it": it, "sv": sv, "uk": uk, "ro": ro, "hr": hr, "sr": sr, "el": el,
        "ku": ku, "tk": tk, "tt": tt, "sd": sd, "pl": pl, "ja": ja, "gu": gu, "bg": bg, "mk": mk,
        "fil": fil, "te": te, "kn": kn, "mr": mr, "pa": pa, "as": `as`, "ne": ne, "si": si, "km": km,
        "he": he, "ka": ka, "lt": lt, "mg": mg, "lg": lg, "rw": rw, "rn": rn, "ln": ln, "dag": dag, "mos": mos, "aa": aa, "mdh": mdh, "ak": ak, "ceb": ceb, "nqo": nqo,
    ]

    /// Dil koduna gore metinler ("en-US" → Ingilizce; bilinmeyen → Turkce). Kullanicinin
    /// vakit adi takimi (`VakitAdlari.etkin`) AYNI dil icin okunduysa vakit adlarini ezer.
    public static func dil(_ kod: String?) -> VakitMetinleri {
        let d = ArayuzDili.coz(kod)
        let etkin = VakitAdlari.etkin
        return dil(d, adlar: etkin?.dil == d ? etkin?.adlar : nil)
    }

    /// Takim acikca verilerek (saf; testler ve cagiran bilerek sectiginde).
    public static func dil(_ kod: String?, adlar takim: VakitAdlari?) -> VakitMetinleri {
        var m = tablo[ArayuzDili.coz(kod)] ?? tr
        guard let takim else { return m }
        for kod in VakitKarari.kilinabilir {
            if let ad = takim.widgetAdi(kod) { m.adlar[kod] = ad }
        }
        if let g = takim.widgetAdi("gunes") { m.gunes = g }
        return m
    }

    /// Kilinabilir vaktin adi; gunes ve bilinmeyen kod icin bos dize (namaz degildir).
    public func ad(_ kod: String) -> String {
        return adlar[kod] ?? ""
    }

    /// Gorunen vakit adi, gunes DAHIL (widget, komplikasyon).
    public func vakitAdi(_ kod: String) -> String {
        return kod == "gunes" ? gunes : ad(kod)
    }

    /// `{anahtar}` yer tutucularini doldurur (sira onemsiz; deger yer tutucu tasimaz).
    public static func bicim(_ sablon: String, _ degerler: [String: String]) -> String {
        var sonuc = sablon
        for (anahtar, deger) in degerler {
            sonuc = sonuc.replacingOccurrences(of: "{\(anahtar)}", with: deger)
        }
        return sonuc
    }
}

public enum VakitKarari {
    /// Isaretlenebilir vakitler (gunes bir namaz degildir).
    public static let kilinabilir: [String] = ["sabah", "ogle", "ikindi", "aksam", "yatsi"]

    public static let konumYokMetni = VakitMetinleri.tr.konumYok
    public static let veriEskiMetni = VakitMetinleri.tr.veriEski

    /// Widget kodu → kayit/kuyruk kodu. `sabah` kayitta `imsak`'tir; gunes namaz degildir.
    public static func kayitVakti(_ kod: String) -> String? {
        switch kod {
        case "sabah": return "imsak"
        case "ogle", "ikindi", "aksam", "yatsi": return kod
        default: return nil
        }
    }

    /// Gorunen ad (Turkcede `NamazAdi` degerleri ile ayni). Gunes icin bos dize.
    public static func gorunenAd(_ kod: String, dil: String = ArayuzDili.varsayilan) -> String {
        return VakitMetinleri.dil(dil).ad(kod)
    }

    /// JS `aktifVakitBul` / Kotlin `VakitCizelgesi.durumHesapla` ikizi.
    public static func aktifVakitBul(_ vakitler: [SiriVakitAni], simdiMs: Int64) -> SiriAktifVakitDurumu {
        let sirali = vakitler.sorted { $0.ms < $1.ms }
        var sonIndeks = -1
        for (i, v) in sirali.enumerated() where v.ms <= simdiMs {
            sonIndeks = i
        }
        let sonraki = sirali[(sonIndeks + 1)...].first { kilinabilir.contains($0.vakit) }
        if sonIndeks < 0 {
            return SiriAktifVakitDurumu(aktif: nil, bitisMs: nil, sonraki: sonraki)
        }
        let son = sirali[sonIndeks]
        guard kilinabilir.contains(son.vakit), sonIndeks + 1 < sirali.count else {
            return SiriAktifVakitDurumu(aktif: nil, bitisMs: nil, sonraki: sonraki)
        }
        return SiriAktifVakitDurumu(aktif: son, bitisMs: sirali[sonIndeks + 1].ms, sonraki: sonraki)
    }

    static func kilindiMi(
        _ vakit: SiriVakitAni,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim]
    ) -> Bool {
        if (kilinanlar[vakit.tarih] ?? []).contains(vakit.vakit) { return true }
        guard let kayit = kayitVakti(vakit.vakit) else { return false }
        return bekleyenler.contains { $0.tarih == vakit.tarih && $0.vakit == kayit }
    }

    /// "Su anki vakti kildim" karari (TS `siriKildimKarari` ikizi). `ad` verilen dildedir.
    public static func kildimKarari(
        vakitler: [SiriVakitAni],
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        simdiMs: Int64,
        dil: String = ArayuzDili.varsayilan
    ) -> SiriKildimKarari {
        let durum = aktifVakitBul(vakitler, simdiMs: simdiMs)
        guard let aktif = durum.aktif, let kayit = kayitVakti(aktif.vakit) else {
            return .vakitYok(siradaki: durum.sonraki)
        }
        let ad = gorunenAd(aktif.vakit, dil: dil)
        if kilindiMi(aktif, kilinanlar: kilinanlar, bekleyenler: bekleyenler) {
            return .zatenKilindi(ad: ad)
        }
        return .aday(vakit: aktif, kayitVakti: kayit, ad: ad)
    }

    static func girisMetni(_ v: SiriVakitAni, bugun: String, saat: (Int64) -> String, metin: VakitMetinleri) -> String {
        // ISO tarihler sozluk sirasiyla karsilastirilabilir.
        return VakitMetinleri.bicim(v.tarih > bugun ? metin.girisYarin : metin.girisBugun, ["saat": saat(v.ms)])
    }

    /// "Siradaki namaz ne zaman?" cevabi (TS `siradakiNamazMetni` ikizi).
    public static func siradakiNamazMetni(
        durum: SiriAktifVakitDurumu,
        kilinanlar: [String: [String]],
        bekleyenler: [SiriBekleyenKildim],
        bugun: String,
        saat: (Int64) -> String,
        dil: String = ArayuzDili.varsayilan
    ) -> String {
        let m = VakitMetinleri.dil(dil)
        var parcalar: [String] = []
        if let aktif = durum.aktif, let bitis = durum.bitisMs,
           !kilindiMi(aktif, kilinanlar: kilinanlar, bekleyenler: bekleyenler) {
            let ad = m.ad(aktif.vakit)
            if durum.sonraki?.ms == bitis {
                parcalar.append(VakitMetinleri.bicim(m.suAnVakti, ["ad": ad]))
            } else {
                parcalar.append(VakitMetinleri.bicim(m.suAnVaktiCikis, ["ad": ad, "saat": saat(bitis)]))
            }
        }
        if let sonraki = durum.sonraki {
            parcalar.append(VakitMetinleri.bicim(m.siradakiNamaz, [
                "ad": m.ad(sonraki.vakit),
                "giris": girisMetni(sonraki, bugun: bugun, saat: saat, metin: m),
            ]))
        }
        return parcalar.isEmpty ? m.veriEski : parcalar.joined(separator: " ")
    }

    /// "Kildim" sonucu metni (TS `siriKildimMetni` ikizi). `karar` ayni dille uretilmis olmali.
    public static func kildimMetni(
        _ karar: SiriKildimKarari,
        bugun: String,
        saat: (Int64) -> String,
        dil: String = ArayuzDili.varsayilan
    ) -> String {
        let m = VakitMetinleri.dil(dil)
        switch karar {
        case .aday(_, _, let ad):
            return VakitMetinleri.bicim(m.isaretlendi, ["ad": ad, "dua": m.kabulDuasi])
        case .zatenKilindi(let ad):
            return VakitMetinleri.bicim(m.zatenKilindi, ["ad": ad])
        case .vakitYok(let siradaki):
            guard let s = siradaki else { return m.vakitYok }
            return VakitMetinleri.bicim(m.vakitYokSiradaki, [
                "ad": m.ad(s.vakit),
                "giris": girisMetni(s, bugun: bugun, saat: saat, metin: m),
            ])
        }
    }

    /// Siri onay sorusu (TS `siriKildimOnayMetni` ikizi).
    public static func onayMetni(_ ad: String, dil: String = ArayuzDili.varsayilan) -> String {
        return VakitMetinleri.bicim(VakitMetinleri.dil(dil).onay, ["ad": ad])
    }
}
