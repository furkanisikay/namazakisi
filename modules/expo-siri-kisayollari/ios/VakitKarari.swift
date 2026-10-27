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
    /// Tablo duzeni sirasiyla (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn).
    public static let desteklenenler: [String] = ["tr", "en", "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn"]

    /// "en", "en-US", "de_DE" → kok kod; bilinmeyen ya da bos kod → "tr". Eski Endonezce
    /// kodu "in" (Java/Android mirasi) "id" sayilir; iOS'ta Endonezce zaten "id"dir.
    public static func coz(_ kod: String?) -> String {
        guard let kod, !kod.isEmpty else { return varsayilan }
        var dil = String(kod.split(whereSeparator: { $0 == "-" || $0 == "_" }).first ?? "")
        if dil == "in" { dil = "id" }
        return desteklenenler.contains(dil) ? dil : varsayilan
    }
}

/// RAKAM SISTEMI — kullanicinin uygulamada SECTIGI rakam (Android `cekirdek/Rakam.kt` ve Wear
/// `saat/cekirdek/Rakam.kt` ikizi). JS COZULMUS degeri App Group'a yazar
/// (`SiriDeposu.rakamSistemiAnahtari`: "arab" ya da yok); YALNIZ arayuz/cevap dili Arapcayken
/// uygulanir, diger her dilde (Turkce dahil) cikti BIREBIR ayni kalir.
///
/// Kural: cekirdek metni Bati rakamiyla URETIR (fikstur, kimlik, veri ayni); donusum yalniz
/// CIZIM KENARINDA (`WidgetMetin.rakam`, Siri `dialog`). Sistemin cizdigi sayilar
/// (`Text(timerInterval:)`, `ProgressView(timerInterval:)`, `DateFormatter`) yerel ayari izler →
/// Arapcada `yerelAyarKimligi` ("ar@numbers=arab|latn") verilir. Bu dosyada: pod, widget ve
/// saat kopyalari ile CI swiftc listeleri zaten onu derler (yeni dosya acilmadi).
public enum RakamSistemi {
    public static let arab = "arab"
    public static let latn = "latn"

    /// Etkin sistem: YALNIZ dil Arapca VE kayit "arab" iken `arab`; aksi halde `latn`.
    public static func etkin(dil: String?, kayitli: String?) -> String {
        guard ArayuzDili.coz(dil) == "ar",
              kayitli?.trimmingCharacters(in: .whitespacesAndNewlines) == arab else { return latn }
        return arab
    }

    public static func doguMu(dil: String?, kayitli: String?) -> Bool {
        etkin(dil: dil, kayitli: kayitli) == arab
    }

    /// ASCII 0-9 → Dogu Arap rakami (U+0660–0669); `dogu` false ya da rakam yoksa metin AYNEN.
    /// Harf, ":", zaten Dogu rakami olan metin degismez (idempotent).
    public static func cevir(_ metin: String, dogu: Bool) -> String {
        guard dogu, metin.unicodeScalars.contains(where: { $0.value >= 0x30 && $0.value <= 0x39 }) else {
            return metin
        }
        var sonuc = String.UnicodeScalarView()
        for u in metin.unicodeScalars {
            if u.value >= 0x30 && u.value <= 0x39, let d = Unicode.Scalar(0x0660 + u.value - 0x30) {
                sonuc.append(d)
            } else {
                sonuc.append(u)
            }
        }
        return String(sonuc)
    }

    /// Sistem cizimli sayilarin yerel ayari: yalniz Arapcada "ar@numbers=<sistem>" (Bati secen
    /// Magrip kullanicisi da Bati gorur); diger dillerde nil → DOKUNULMAZ (cihazin ayari).
    public static func yerelAyarKimligi(dil: String?, kayitli: String?) -> String? {
        guard ArayuzDili.coz(dil) == "ar" else { return nil }
        return "ar@numbers=\(etkin(dil: dil, kayitli: kayitli))"
    }
}

/// CLDR cogul kategorisi ("zero", "one", "two", "few", "many", "other") — JS
/// `src/core/dil/cogul.ts` ikizi (tamsayi icin); Urduca, Felemenkce ve Arnavutca (ur, nl, sq)
/// `default` dalindadir (one/other).
/// Cogul metin tablolari kategori → kalip tasir; dilde olmayan kategori "other"a duser.
public enum CogulKurali {
    public static func kategori(_ dil: String, _ n: Int) -> String {
        let i = abs(n)
        switch ArayuzDili.coz(dil) {
        case "id", "ms": return "other"
        case "es":
            // `cogul.ts > ispanyolca`: yalniz 1 tekil (0 cogul); 1.000.000 katlari "many".
            if i == 1 { return "one" }
            return (i != 0 && i % 1_000_000 == 0) ? "many" : "other"
        case "hi", "bn":
            // `cogul.ts > sifirBir`: 0 ve 1 tekil.
            return (i == 0 || i == 1) ? "one" : "other"
        case "fr":
            if i == 0 || i == 1 { return "one" }
            return (i != 0 && i % 1_000_000 == 0) ? "many" : "other"
        case "ru", "bs":
            let s10 = i % 10, s100 = i % 100
            if s10 == 1 && s100 != 11 { return "one" }
            if (2...4).contains(s10) && !(12...14).contains(s100) { return "few" }
            return ArayuzDili.coz(dil) == "ru" ? "many" : "other"
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
/// ru, ms, ar, ur, es, nl, sq, hi, bn; cevrilmemis dilin ornegi Ingilizcenin birebir kopyasidir ve `// ÇEVİRİ: <kod>`
/// satiriyla baslar. Nobetci: `test/main.swift` (her dil Turkceyle ayni yer tutucular).
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

    // ÇEVİRİ: es
    public static let es = VakitMetinleri(
        dil: "es",
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

    // ÇEVİRİ: nl
    public static let nl = VakitMetinleri(
        dil: "nl",
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

    // ÇEVİRİ: sq
    public static let sq = VakitMetinleri(
        dil: "sq",
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

    // ÇEVİRİ: hi
    public static let hi = VakitMetinleri(
        dil: "hi",
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

    // ÇEVİRİ: bn
    public static let bn = VakitMetinleri(
        dil: "bn",
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
