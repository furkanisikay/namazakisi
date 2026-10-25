import SwiftUI
import WidgetKit

// iOS GUNUN AYETI WIDGET'I (#380 iOS ikizi). Sozlesme: `docs/ajan/gunun-ayeti.md`.
//
// Native ayet SECMEZ: JS 14 gunluk plani App Group'a yazar (`gununAyetiKaydet`), burada
// `GununAyetiKarari` (saf, `WidgetKarari.swift`) "su anki kaydi" ve zaman cizelgesini verir.
// Her plan kaydi kendi `baslangicMs`'inde (o gunun imsaki) girdi olur; WidgetKit gunu
// uygulama acilmadan cevirir. Plan biterse son kayit kalir.
//
// SIGMA KURALI: meal ASLA "…" ile kesilmez. Her boyut `ViewThatFits` ile adim adim iner
// (Arapca + meal → yalniz meal → kunye + "dokunun" karti). Dynamic Type acik: tum yazilar
// metin stilinden, Arapca `Font.custom(..., relativeTo:)`.
// Arapca (Amiri Quran, OFL) uzantinin Info.plist `UIAppFonts`'u ile yuklenir
// (`plugins/withNamazWidget.js`); kilit ekraninda Arapca CIZILMEZ.
// Metinler (etiket, "dokunun", kunye) yukte etkin dilde gelir; native yalniz galeri adi ve
// "yuk yok" durumu icin kucuk bir tablo tasir (yuk yazilmadan once JS metni yoktur).

enum GununAyetiSabitleri {
    static let acilis = URL(string: "namazakisi://gunun-ayeti")
    /// Amiri Quran'in PostScript adi (dosya `AmiriQuran-Regular.ttf`).
    static let arapcaFont = "AmiriQuran-Regular"
}

/// Yuk yokken (uygulama hic acilmadi) ve galeride gereken metinler. Ingilizce karsiliklar
/// JS sozlugunden (`sozluk/en/gununAyeti.ts > baslik, etiket`).
///
/// Duzen: dil basina bir `static let`, sira tr, en, id, de, fr, bs, ru, ms; cevrilmemis dil
/// Ingilizcenin kopyasidir (`// ÇEVİRİ: <kod>`). `ornek*` alanlari galeri onizlemesindeki
/// 94:6'dir: meal o dilin QuranEnc mealinden BIREBIR (kesilmeden) ve kunyesiyle yazilir
/// (`docs/ajan/coklu-dil.md > Nass kurali`; dilde meal yoksa `ornekMeal` bos → yalniz Arapca).
struct GununAyetiYerelMetinleri {
    let galeriAdi: String
    let galeriAciklama: String
    let etiket: String
    let uygulamayiAcin: String
    let ornekSigmiyor: String
    let ornekAcin: String
    let ornekArapcaKaynagi: String
    let ornekMeal: String
    let ornekKisaKunye: String
    let ornekMealKaynagi: String

    static let tr = GununAyetiYerelMetinleri(
        galeriAdi: "Günün ayeti",
        galeriAciklama: "Her gün imsakta değişen bir ayet ve meali.",
        etiket: "GÜNÜN AYETİ",
        uygulamayiAcin: "Günün ayetini görmek için uygulamayı açın",
        ornekSigmiyor: "Bugünün ayeti bu boyuta sığmıyor. Okumak için dokunun.",
        ornekAcin: "Açın",
        ornekArapcaKaynagi: "Arapça: Tanzil",
        ornekMeal: "Gerçekten güçlükle beraber bir kolaylık vardır.",
        ornekKisaKunye: "İnşirâh 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.4"
    )

    static let en = GununAyetiYerelMetinleri(
        galeriAdi: "Verse of the day",
        galeriAciklama: "A verse and its translation that changes every day at Fajr.",
        etiket: "VERSE OF THE DAY",
        uygulamayiAcin: "Open the app to see the verse of the day",
        ornekSigmiyor: "Today's verse doesn't fit this size. Tap to read it.",
        ornekAcin: "Open",
        ornekArapcaKaynagi: "Arabic: Tanzil",
        ornekMeal: "Indeed, with hardship [will be] ease.",
        ornekKisaKunye: "Quran 94:6",
        ornekMealKaynagi: "Noor International Center, QuranEnc 1.1.2"
    )


    // id — Endonezce (beta); JS `sozluk/id/gununAyeti.ts`, meal 94:6 `gununAyetiHavuzu.ts` (indonesian_affairs)
    static let id = GununAyetiYerelMetinleri(
        galeriAdi: "Ayat hari ini",
        galeriAciklama: "Ayat dan terjemahannya yang berganti setiap hari saat Subuh.",
        etiket: "AYAT HARI INI",
        uygulamayiAcin: "Buka aplikasi untuk melihat ayat hari ini",
        ornekSigmiyor: "Ayat hari ini tidak muat di ukuran ini. Ketuk untuk membacanya.",
        ornekAcin: "Buka",
        ornekArapcaKaynagi: "Arab: Tanzil",
        ornekMeal: "sesungguhnya bersama kesulitan ada kemudahan.",
        ornekKisaKunye: "Al-Qur'an 94:6",
        ornekMealKaynagi: "Ministry of Religious Affairs, QuranEnc 1.0.1"
    )


    // de — Almanca (beta): JS `sozluk/de/gununAyeti.ts`; meal `gununAyetiHavuzu.ts` 94:6 (BİREBİR), künye `mealler.de`
    static let de = GununAyetiYerelMetinleri(
        galeriAdi: "Vers des Tages",
        galeriAciklama: "Ein Vers mit Übersetzung, der jeden Tag zu Fajr wechselt.",
        etiket: "VERS DES TAGES",
        uygulamayiAcin: "Öffnen Sie die App, um den Vers des Tages zu sehen",
        ornekSigmiyor: "Der heutige Vers passt nicht in diese Größe. Zum Lesen tippen.",
        ornekAcin: "Öffnen",
        ornekArapcaKaynagi: "Arabisch: Tanzil",
        ornekMeal: "gewiß, mit der Erschwernis ist Erleichterung.",
        ornekKisaKunye: "Koran 94:6",
        ornekMealKaynagi: "Frank Bubenheim, QuranEnc 1.1.4"
    )


    // fr
    static let fr = GununAyetiYerelMetinleri(
        galeriAdi: "Verset du jour",
        galeriAciklama: "Un verset et sa traduction, renouvelés chaque jour à l’Imsak.",
        etiket: "VERSET DU JOUR",
        uygulamayiAcin: "Ouvrez l’application pour voir le verset du jour",
        ornekSigmiyor: "Le verset du jour ne tient pas dans cette taille. Touchez pour le lire.",
        ornekAcin: "Ouvrir",
        ornekArapcaKaynagi: "Arabe : Tanzil",
        ornekMeal: "Oui, il n’est pas d’épreuve qui ne soit suivie d’une délivrance.",
        ornekKisaKunye: "Coran 94:6",
        ornekMealKaynagi: "Rachid Maach, QuranEnc 1.0.3"
    )


    // bs
    static let bs = GununAyetiYerelMetinleri(
        galeriAdi: "Ajet dana",
        galeriAciklama: "Ajet i prijevod njegovog značenja, svaki dan novi u zoru.",
        etiket: "AJET DANA",
        uygulamayiAcin: "Otvorite aplikaciju da vidite ajet dana",
        ornekSigmiyor: "Današnji ajet ne stane u ovu veličinu. Dodirnite da ga pročitate.",
        ornekAcin: "Otvorite",
        ornekArapcaKaynagi: "Arapski: Tanzil",
        ornekMeal: "zaista, s mukom je olakšanje!",
        ornekKisaKunye: "Kur'an 94:6",
        ornekMealKaynagi: "Rowwad Translation Centre, QuranEnc 2.0.4"
    )


    // ru
    static let ru = GununAyetiYerelMetinleri(
        galeriAdi: "Аят дня",
        galeriAciklama: "Аят и перевод его смыслов; меняется каждый день в имсак.",
        etiket: "АЯТ ДНЯ",
        uygulamayiAcin: "Откройте приложение, чтобы увидеть аят дня",
        ornekSigmiyor: "Сегодняшний аят не помещается в этот размер. Нажмите, чтобы прочитать.",
        ornekAcin: "Открыть",
        ornekArapcaKaynagi: "Арабский: Tanzil",
        ornekMeal: "Воистину, с трудностью — облегчение.",
        ornekKisaKunye: "Коран 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.1"
    )


    // ms
    static let ms = GununAyetiYerelMetinleri(
        galeriAdi: "Ayat hari ini",
        galeriAciklama: "Satu ayat dan terjemahannya yang bertukar setiap hari pada waktu Subuh.",
        etiket: "AYAT HARI INI",
        uygulamayiAcin: "Buka aplikasi untuk melihat ayat hari ini",
        ornekSigmiyor: "Ayat hari ini tidak muat pada saiz ini. Ketik untuk membacanya.",
        ornekAcin: "Buka",
        ornekArapcaKaynagi: "Arab: Tanzil",
        ornekMeal: "(Sekali lagi ditegaskan): bahawa sesungguhnya tiap-tiap kesukaran disertai kemudahan.",
        ornekKisaKunye: "Al-Quran 94:6",
        ornekMealKaynagi: "Abdullah Basumayyah, QuranEnc 1.0.0"
    )

    static let tablo: [String: GununAyetiYerelMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
    ]

    static var simdiki: GununAyetiYerelMetinleri {
        tablo[WidgetMetin.dil] ?? tr
    }
}

struct AyetWidgetGirdisi: TimelineEntry {
    let date: Date
    /// nil → JS henuz yuk yazmadi.
    let metin: GununAyetiMetinleri?
    let kayit: GununAyetiKaydi?
    /// Yukun dili (`tr`, `en`…); tarih satiri bu dilde bicimlenir.
    let dil: String

    static func bos(_ tarih: Date) -> AyetWidgetGirdisi {
        AyetWidgetGirdisi(date: tarih, metin: nil, kayit: nil, dil: WidgetMetin.dil)
    }

    /// Galeri / yer tutucu: havuzdaki 94:6 (Tanzil + QuranEnc, birebir).
    static func ornek(_ tarih: Date) -> AyetWidgetGirdisi {
        let y = GununAyetiYerelMetinleri.simdiki
        let metin = GununAyetiMetinleri(
            etiket: y.etiket,
            sigmiyor: y.ornekSigmiyor,
            acin: y.ornekAcin,
            arapcaKaynagi: y.ornekArapcaKaynagi
        )
        let kayit = GununAyetiKaydi(
            gun: SiriDeposu.bugunIso(tarih),
            baslangicMs: SiriDeposu.simdiMs(tarih),
            ref: "94:6",
            ar: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
            meal: y.ornekMeal.isEmpty ? nil : y.ornekMeal,
            kisaKunye: y.ornekKisaKunye,
            mealKaynagi: y.ornekMealKaynagi
        )
        return AyetWidgetGirdisi(date: tarih, metin: metin, kayit: kayit, dil: WidgetMetin.dil)
    }
}

struct GununAyetiSaglayici: TimelineProvider {
    func placeholder(in context: Context) -> AyetWidgetGirdisi {
        .ornek(Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (AyetWidgetGirdisi) -> Void) {
        let gercek = Self.zamanCizelgesi(simdi: Date()).girdiler.first
        // Galeride veri yoksa ornek; varsa kullanicinin bugunku ayeti.
        if context.isPreview, gercek?.kayit == nil {
            completion(.ornek(Date()))
            return
        }
        completion(gercek ?? .bos(Date()))
    }

    /// `.atEnd`: son girdiden (planin son gunu) sonra sistem yeniden ister. Plan bittiyse
    /// (gelecek girdi yok) `.never` — tek girdili `.atEnd` bos yere yeniden yukleme dongusu
    /// kurardi; JS her yazimda bu turu zaten tazeler.
    func getTimeline(in context: Context, completion: @escaping (Timeline<AyetWidgetGirdisi>) -> Void) {
        let sonuc = Self.zamanCizelgesi(simdi: Date())
        completion(Timeline(entries: sonuc.girdiler, policy: sonuc.gelecekVar ? .atEnd : .never))
    }

    static func zamanCizelgesi(simdi: Date) -> (girdiler: [AyetWidgetGirdisi], gelecekVar: Bool) {
        guard let yuk = SiriDeposu.varsayilan.gununAyeti() else { return ([.bos(simdi)], false) }
        let liste = GununAyetiKarari.girdiler(yuk.plan, simdiMs: SiriDeposu.simdiMs(simdi))
        guard !liste.isEmpty else { return ([.bos(simdi)], false) }
        let girdiler = liste.map {
            AyetWidgetGirdisi(
                date: VakitSaglayici.tarih($0.ms), metin: yuk.metin, kayit: $0.kayit, dil: yuk.dil
            )
        }
        return (girdiler, liste.count > 1)
    }
}

struct GununAyetiWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: GununAyetiKarari.widgetTuru, provider: GununAyetiSaglayici()) { girdi in
            GununAyetiGorunumu(girdi: girdi)
        }
        .configurationDisplayName(GununAyetiYerelMetinleri.simdiki.galeriAdi)
        .description(GununAyetiYerelMetinleri.simdiki.galeriAciklama)
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
    }
}

struct GununAyetiGorunumu: View {
    let girdi: AyetWidgetGirdisi
    @Environment(\.widgetFamily) private var aile

    var body: some View {
        icerik
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .widgetURL(GununAyetiSabitleri.acilis)
            .widgetArkaplani(aile)
    }

    @ViewBuilder private var icerik: some View {
        if let kayit = girdi.kayit, let metin = girdi.metin {
            Group {
                switch aile {
                case .accessoryRectangular: KilitAyetGorunumu(kayit: kayit, metin: metin)
                case .systemLarge: BuyukAyetGorunumu(kayit: kayit, metin: metin, dil: girdi.dil)
                default: AyetGorunumu(kayit: kayit, metin: metin, buyuk: aile == .systemMedium)
                }
            }
            // Ekran okuyucu: tek oge, meal (yoksa Arapca) + tam kunye (Android contentDescription ikizi).
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(AyetErisim.etiket(kayit, metin: metin))
        } else {
            AyetYokGorunumu(aksesuar: aile == .accessoryRectangular)
        }
    }
}

enum AyetErisim {
    static func etiket(_ kayit: GununAyetiKaydi, metin: GununAyetiMetinleri) -> String {
        let govde = kayit.meal ?? kayit.ar
        let kunye = GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: kayit.meal == nil)
        return "\(govde) \(kunye)"
    }
}

// MARK: - Ortak parcalar

private struct AyetEtiketi: View {
    let metin: String
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "book.closed.fill")
            Text(metin)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .font(.caption2.weight(.semibold))
        .foregroundStyle(WidgetSabitleri.yesil)
        .widgetAccentable()
        .accessibilityAddTraits(.isHeader)
    }
}

/// Meal: serif, KESILMEZ (yuksekligi tam; sigmazsa `ViewThatFits` sonraki adayi secer).
private struct MealMetni: View {
    let meal: String
    let stil: Font.TextStyle
    var body: some View {
        Text(meal)
            .font(.system(stil, design: .serif))
            .foregroundStyle(.primary)
            .fixedSize(horizontal: false, vertical: true)
    }
}

/// Arapca: Tanzil Uthmani, Amiri Quran, sag-sol, ortali. KESILMEZ.
private struct ArapcaMetin: View {
    let ar: String
    let boyut: CGFloat
    var body: some View {
        Text(ar)
            .font(.custom(GununAyetiSabitleri.arapcaFont, size: boyut, relativeTo: .title2))
            .multilineTextAlignment(.center)
            .lineSpacing(4)
            .environment(\.layoutDirection, .rightToLeft)
            .frame(maxWidth: .infinity)
            .fixedSize(horizontal: false, vertical: true)
    }
}

private struct KunyeSatiri: View {
    let metin: String
    var body: some View {
        Text(metin)
            .font(.caption2)
            .foregroundStyle(.secondary)
            .fixedSize(horizontal: false, vertical: true)
    }
}

/// Son adim: ayet sigmiyor → kisa kunye + "Okumak için dokunun." (Android "dokunun" karti).
private struct SigmiyorKarti: View {
    let kayit: GununAyetiKaydi
    let metin: GununAyetiMetinleri
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            AyetEtiketi(metin: metin.etiket)
            Text(kayit.kisaKunye)
                .font(.system(.headline, design: .serif))
                .lineLimit(2)
                .minimumScaleFactor(0.7)
            Text(metin.sigmiyor)
                .font(.caption)
                .foregroundStyle(.secondary)
                .minimumScaleFactor(0.6)
        }
    }
}

// MARK: - Ana ekran kucuk / orta: meal + kunye (Arapca yalniz meal yoksa)

private struct AyetGorunumu: View {
    let kayit: GununAyetiKaydi
    let metin: GununAyetiMetinleri
    /// Orta boy: daha buyuk meal stili.
    let buyuk: Bool

    var body: some View {
        ViewThatFits(in: .vertical) {
            if let meal = kayit.meal {
                VStack(alignment: .leading, spacing: 6) {
                    AyetEtiketi(metin: metin.etiket)
                    MealMetni(meal: meal, stil: buyuk ? .body : .subheadline)
                    KunyeSatiri(metin: GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: false))
                }
                if !buyuk {
                    // Kucukte etiket yer yerse: etiketsiz meal + kunye.
                    VStack(alignment: .leading, spacing: 4) {
                        MealMetni(meal: meal, stil: .footnote)
                        KunyeSatiri(metin: GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: false))
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    AyetEtiketi(metin: metin.etiket)
                    ArapcaMetin(ar: kayit.ar, boyut: buyuk ? 22 : 18)
                    KunyeSatiri(metin: GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: true))
                }
            }
            SigmiyorKarti(kayit: kayit, metin: metin)
        }
    }
}

// MARK: - Ana ekran buyuk: tarih + Arapca + meal + kunye

private struct BuyukAyetGorunumu: View {
    let kayit: GununAyetiKaydi
    let metin: GununAyetiMetinleri
    let dil: String

    var body: some View {
        ViewThatFits(in: .vertical) {
            // 1) Tam: Arapca + meal.
            VStack(alignment: .leading, spacing: 10) {
                baslik
                ArapcaMetin(ar: kayit.ar, boyut: 24)
                if let meal = kayit.meal {
                    MealMetni(meal: meal, stil: .body)
                }
                KunyeSatiri(metin: GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: true))
            }
            // 2) Arapca sigmiyor: yalniz meal (Android 4x2 kurali).
            if let meal = kayit.meal {
                VStack(alignment: .leading, spacing: 10) {
                    baslik
                    MealMetni(meal: meal, stil: .body)
                    KunyeSatiri(metin: GununAyetiKarari.kunyeSatiri(kayit, metin: metin, arapcaVar: false))
                }
            }
            // 3) Hicbiri sigmiyor: "dokunun" karti.
            SigmiyorKarti(kayit: kayit, metin: metin)
        }
    }

    private var baslik: some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            AyetEtiketi(metin: metin.etiket)
            Spacer(minLength: 4)
            if let tarih = AyetTarihi.metin(kayit.gun, dil: dil) {
                Text(tarih)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
    }
}

/// Namaz gununun tarihi ("24 Ekim Cumartesi" / "Saturday, October 24"), yukun dilinde.
enum AyetTarihi {
    static func metin(_ gun: String, dil: String) -> String? {
        let parcalar = gun.split(separator: "-").compactMap { Int($0) }
        guard parcalar.count == 3 else { return nil }
        var takvim = Calendar(identifier: .gregorian)
        takvim.timeZone = .current
        guard let tarih = takvim.date(from: DateComponents(year: parcalar[0], month: parcalar[1], day: parcalar[2], hour: 12)) else {
            return nil
        }
        let f = DateFormatter()
        f.calendar = takvim
        f.timeZone = .current
        // Yukun dili (yalniz native tabloda olan diller degil): ay/gun adlari sistemden.
        f.locale = Locale(identifier: dil.isEmpty ? ArayuzDili.varsayilan : dil)
        f.setLocalizedDateFormatFromTemplate("EEEEdMMMM")
        return f.string(from: tarih)
    }
}

// MARK: - Kilit ekrani dikdortgen: tek renk, Arapca YOK

private struct KilitAyetGorunumu: View {
    let kayit: GununAyetiKaydi
    let metin: GununAyetiMetinleri

    var body: some View {
        ViewThatFits(in: .vertical) {
            if let meal = kayit.meal {
                VStack(alignment: .leading, spacing: 1) {
                    Text(metin.etiket)
                        .font(.caption2.weight(.semibold))
                        .widgetAccentable()
                    Text(meal)
                        .font(.footnote)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Text(meal)
                    .font(.footnote)
                    .fixedSize(horizontal: false, vertical: true)
            }
            // Meal sigmiyor (ya da meal yok): kisa kunye; dokununca sayfa acilir.
            VStack(alignment: .leading, spacing: 1) {
                Text(metin.etiket)
                    .font(.caption2.weight(.semibold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .widgetAccentable()
                Text(kayit.kisaKunye)
                    .font(.headline)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
        }
    }
}

// MARK: - Yuk yok

private struct AyetYokGorunumu: View {
    let aksesuar: Bool
    var body: some View {
        let m = GununAyetiYerelMetinleri.simdiki
        VStack(alignment: .leading, spacing: aksesuar ? 1 : 6) {
            if aksesuar {
                Text(m.etiket)
                    .font(.caption2.weight(.semibold))
                    .widgetAccentable()
            } else {
                AyetEtiketi(metin: m.etiket)
            }
            Text(m.uygulamayiAcin)
                .font(aksesuar ? .footnote : .caption)
                .foregroundStyle(.secondary)
                .minimumScaleFactor(0.7)
        }
    }
}
