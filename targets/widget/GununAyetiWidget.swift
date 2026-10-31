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
/// Duzen: dil basina bir `static let`, sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi; cevrilmemis dil
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


    // ar — Arapça (beta): JS `sozluk/ar/gununAyeti.ts`; Arapçada ayet YALNIZ Kur'an metnidir
    // (meal yok, sahip kararı) → `ornekMeal` ve `ornekMealKaynagi` boş, künye `kuran` + ref.
    static let ar = GununAyetiYerelMetinleri(
        galeriAdi: "آية اليوم",
        galeriAciklama: "آية من القرآن الكريم تتجدّد كل يوم عند الفجر.",
        etiket: "آية اليوم",
        uygulamayiAcin: "لعرض آية اليوم: فتح التطبيق",
        ornekSigmiyor: "آية اليوم لا تتسع في هذا الحجم. انقر لقراءتها.",
        ornekAcin: "فتح",
        ornekArapcaKaynagi: "النص القرآني: تنزيل",
        ornekMeal: "",
        ornekKisaKunye: "القرآن الكريم 94:6",
        ornekMealKaynagi: ""
    )


    // ur — meal 94:6 `gununAyetiHavuzu.ts` (urdu_junagarhi)
    static let ur = GununAyetiYerelMetinleri(
        galeriAdi: "آج کی آیت",
        galeriAciklama: "ایک آیت اور اس کا ترجمہ جو ہر روز فجر کے وقت بدلتا ہے۔",
        etiket: "آج کی آیت",
        uygulamayiAcin: "آج کی آیت دیکھنے کے لیے ایپ کھولیں",
        ornekSigmiyor: "آج کی آیت اس سائز میں نہیں سماتی۔ پڑھنے کے لیے تھپتھپائیں۔",
        ornekAcin: "کھولیں",
        ornekArapcaKaynagi: "عربی: Tanzil",
        ornekMeal: "بیشک مشکل کے ساتھ آسانی ہے.",
        ornekKisaKunye: "قرآن 94:6",
        ornekMealKaynagi: "Muhammad Junagarhi، QuranEnc 1.1.3"
    )

    // es — İspanyolca (beta); JS sozluk/es/gununAyeti; meal 94:6 gununAyetiHavuzu.ts'ten birebir (Isa Garcia, QuranEnc 1.0.2)
    static let es = GununAyetiYerelMetinleri(
        galeriAdi: "Aleya del día",
        galeriAciklama: "Una aleya y su traducción, que cambian cada día en Fajr.",
        etiket: "ALEYA DEL DÍA",
        uygulamayiAcin: "Abra la aplicación para ver la aleya del día",
        ornekSigmiyor: "La aleya de hoy no cabe en este tamaño. Toque para leerla.",
        ornekAcin: "Abrir",
        ornekArapcaKaynagi: "Árabe: Tanzil",
        ornekMeal: "Realmente, con toda dificultad viene una facilidad.",
        ornekKisaKunye: "Corán 94:6",
        ornekMealKaynagi: "Isa Garcia, QuranEnc 1.0.2"
    )

    // nl — meal 94:6 `gununAyetiHavuzu.ts` (dutch_center, Rowwad Translation Center)
    static let nl = GununAyetiYerelMetinleri(
        galeriAdi: "Vers van de dag",
        galeriAciklama: "Een vers met vertaling dat elke dag bij Fajr wisselt.",
        etiket: "VERS VAN DE DAG",
        uygulamayiAcin: "Open de app om het vers van de dag te zien",
        ornekSigmiyor: "Het vers van vandaag past niet in dit formaat. Tik om het te lezen.",
        ornekAcin: "Openen",
        ornekArapcaKaynagi: "Arabisch: Tanzil",
        ornekMeal: "Waarlijk, na ongemak komen er weer betere tijden.",
        ornekKisaKunye: "Koran 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 2.0.10"
    )

    // sq — JS `sozluk/sq/gununAyeti.ts`; örnek meal `gununAyetiHavuzu.ts` 94:6 (albanian_nahi 1.1.0) birebir
    static let sq = GununAyetiYerelMetinleri(
        galeriAdi: "Ajeti i ditës",
        galeriAciklama: "Një ajet me përkthimin e tij, që ndryshon çdo ditë në sabah.",
        etiket: "AJETI I DITËS",
        uygulamayiAcin: "Hapni aplikacionin për të parë ajetin e ditës",
        ornekSigmiyor: "Ajeti i sotëm nuk nxë në këtë madhësi. Prekni për ta lexuar.",
        ornekAcin: "Hapni",
        ornekArapcaKaynagi: "Arabisht: Tanzil",
        ornekMeal: "Me të vërtetë, pas vështirësisë - vjen lehtësimi!",
        ornekKisaKunye: "Kur'ani 94:6",
        ornekMealKaynagi: "Hassan Nahi, QuranEnc 1.1.0"
    )

    // hi — Hintçe (beta): JS `sozluk/hi/gununAyeti.ts`. `gununAyetiHavuzu.ts`'te 94:6 için Hintçe
    // (hindi_omari) meal YOK → `ornekMeal` ve `ornekMealKaynagi` boş (uydurma çeviri yok), yalnız Arapça.
    static let hi = GununAyetiYerelMetinleri(
        galeriAdi: "आज की आयत",
        galeriAciklama: "एक आयत और उसका तर्जुमा, जो हर दिन फ़ज्र के वक़्त बदलता है।",
        etiket: "आज की आयत",
        uygulamayiAcin: "आज की आयत देखने के लिए ऐप खोलें",
        ornekSigmiyor: "आज की आयत इस साइज़ में नहीं समाती। पढ़ने के लिए टैप करें।",
        ornekAcin: "खोलें",
        ornekArapcaKaynagi: "अरबी: Tanzil",
        ornekMeal: "",
        ornekKisaKunye: "क़ुरआन 94:6",
        ornekMealKaynagi: ""
    )

    // bn — Bengalce (beta); JS `sozluk/bn/gununAyeti.ts`, meal 94:6 `gununAyetiHavuzu.ts` (bengali_zakaria, BİREBİR), künye `mealler.bn`
    static let bn = GununAyetiYerelMetinleri(
        galeriAdi: "দিনের আয়াত",
        galeriAciklama: "প্রতিদিন ফজরে বদলানো একটি আয়াত ও তার অনুবাদ।",
        etiket: "দিনের আয়াত",
        uygulamayiAcin: "দিনের আয়াত দেখতে অ্যাপ খুলুন",
        ornekSigmiyor: "আজকের আয়াত এই আকারে আঁটে না। পড়তে ট্যাপ করুন।",
        ornekAcin: "খুলুন",
        ornekArapcaKaynagi: "আরবি: Tanzil",
        ornekMeal: "নিশ্চয় কষ্টের সাথেই স্বস্তি আছে।",
        ornekKisaKunye: "কুরআন 94:6",
        ornekMealKaynagi: "Abu Bakr Zakaria, QuranEnc 1.1.1"
    )

    // fa — meal 94:6 `gununAyetiHavuzu.ts` (persian_ih), künye `GUNUN_AYETI_KAYNAKLARI.mealler.fa`
    static let fa = GununAyetiYerelMetinleri(
        galeriAdi: "آیهٔ روز",
        galeriAciklama: "آیه‌ای همراه با ترجمه‌اش که هر روز هنگام صبح عوض می‌شود.",
        etiket: "آیهٔ روز",
        uygulamayiAcin: "برای دیدن آیهٔ روز، برنامه را باز کنید",
        ornekSigmiyor: "آیهٔ امروز در این اندازه جا نمی‌شود. برای خواندن ضربه بزنید.",
        ornekAcin: "باز کردن",
        ornekArapcaKaynagi: "عربی: Tanzil",
        ornekMeal: "[آری؛] مسلماً با [هر] دشواری، آسانی است.",
        ornekKisaKunye: "قرآن 94:6",
        ornekMealKaynagi: "Rowwad Translation Center، QuranEnc 1.1.3"
    )

    // ps — Peştuca (beta): meal QuranEnc `pashto_rwwad` (havuzdaki 94:6 birebir), künye mealler.ps
    static let ps = GununAyetiYerelMetinleri(
        galeriAdi: "د ورځې آیت",
        galeriAciklama: "یو آیت او د هغه ژباړه چې هره ورځ د سهار په وخت بدلېږي.",
        etiket: "د ورځې آیت",
        uygulamayiAcin: "د ورځې د آیت د لیدلو لپاره اپ پرانیزئ",
        ornekSigmiyor: "د نن آیت په دې اندازه کې نه ځایېږي. د لوستلو لپاره یې کېکاږئ.",
        ornekAcin: "پرانیزئ",
        ornekArapcaKaynagi: "عربي: Tanzil",
        ornekMeal: "بېشکه چې له سختۍ سره آساني هم شته.",
        ornekKisaKunye: "قرآن 94:6",
        ornekMealKaynagi: "Rowwad Translation Center، QuranEnc 1.0.1"
    )

    // ckb — meal Muhammad Salih Bamoki (QuranEnc `kurdish_bamoki`), `gununAyetiHavuzu.ts` 94:6 birebir.
    static let ckb = GununAyetiYerelMetinleri(
        galeriAdi: "ئایەتی ڕۆژ",
        galeriAciklama: "ئایەتێک و وەرگێڕانەکەی کە ھەموو ڕۆژێک لە کاتی بەیانیدا دەگۆڕێت.",
        etiket: "ئایەتی ڕۆژ",
        uygulamayiAcin: "بۆ بینینی ئایەتی ڕۆژ ئەپەکە بکەنەوە",
        ornekSigmiyor: "ئایەتی ئەمڕۆ لەم قەبارەیەدا جێی نابێتەوە. بۆ خوێندنەوە دەستی لێ بدەن.",
        ornekAcin: "کردنەوە",
        ornekArapcaKaynagi: "عەرەبی: Tanzil",
        ornekMeal: "بێگومان لەگەڵ ھەموو تەنگانەیەکدا خۆشی وئاسانی دێت",
        ornekKisaKunye: "قورئان 94:6",
        ornekMealKaynagi: "Muhammad Salih Bamoki، QuranEnc 1.1.1"
    )

    // ug — Uygurca (beta); meal `gununAyetiHavuzu.ts` 94:6 birebir, künye `mealler.ug` (uyghur_saleh 1.0.2)
    static let ug = GununAyetiYerelMetinleri(
        galeriAdi: "كۈننىڭ ئايىتى",
        galeriAciklama: "ھەر كۈنى بامداتتا ئالمىشىدىغان بىر ئايەت ۋە تەرجىمىسى.",
        etiket: "كۈننىڭ ئايىتى",
        uygulamayiAcin: "كۈننىڭ ئايىتىنى كۆرۈش ئۈچۈن ئەپنى ئېچىڭ",
        ornekSigmiyor: "بۈگۈنكى ئايەت بۇ چوڭلۇققا پاتمايدۇ. ئوقۇش ئۈچۈن چېكىڭ.",
        ornekAcin: "ئېچىڭ",
        ornekArapcaKaynagi: "ئەرەبچە: Tanzil",
        ornekMeal: "ئەلۋەتتە شۇ مۈشكۈللۈك بىلەن يەنە بىر ئاسانلىق بار.",
        ornekKisaKunye: "قۇرئان 94:6",
        ornekMealKaynagi: "Muhammad Saleh، QuranEnc 1.0.2"
    )

    // az — Azerice (beta); JS `sozluk/az/gununAyeti.ts`, meal 94:6 `gununAyetiHavuzu.ts` (azeri_musayev)
    static let az = GununAyetiYerelMetinleri(
        galeriAdi: "Günün ayəsi",
        galeriAciklama: "Hər gün sübhdə dəyişən bir ayə və onun tərcüməsi.",
        etiket: "GÜNÜN AYƏSİ",
        uygulamayiAcin: "Günün ayəsini görmək üçün tətbiqi açın",
        ornekSigmiyor: "Bu günün ayəsi bu ölçüyə sığmır. Oxumaq üçün toxunun.",
        ornekAcin: "Açın",
        ornekArapcaKaynagi: "Ərəbcə: Tanzil",
        ornekMeal: "Əlbəttə ki, çətinliklə bərabər bir asanlıq vardır.",
        ornekKisaKunye: "Quran 94:6",
        ornekMealKaynagi: "Ali Khan Musayev, QuranEnc 1.0.4"
    )

    // uz — Özbekçe (beta, LATİN); meal `gununAyetiHavuzu.ts` 94:6 (uzbek_rwwad, Kiril) kirildenLatine ile — JS `yaziyaCevir` ikizi
    static let uz = GununAyetiYerelMetinleri(
        galeriAdi: "Kun oyati",
        galeriAciklama: "Har kuni bomdodda almashadigan oyat va uning tarjimasi.",
        etiket: "KUN OYATI",
        uygulamayiAcin: "Kun oyatini koʻrish uchun ilovani oching",
        ornekSigmiyor: "Bugungi oyat bu oʻlchamga sigʻmaydi. Oʻqish uchun bosing.",
        ornekAcin: "Ochish",
        ornekArapcaKaynagi: "Arabcha: Tanzil",
        ornekMeal: "Albatta, bir qiyinchilik bilan bir osonlik bordir.",
        ornekKisaKunye: "Qurʼon 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.4"
    )

    // kk — Kazakça (beta, Kiril): meal `gununAyetiHavuzu.ts` 94:6 birebir (kazakh_altai), künye `mealler.kk`
    static let kk = GununAyetiYerelMetinleri(
        galeriAdi: "Күннің аяты",
        galeriAciklama: "Күн сайын таң уақытында ауысатын аят және оның аудармасы.",
        etiket: "КҮННІҢ АЯТЫ",
        uygulamayiAcin: "Күннің аятын көру үшін қолданбаны ашыңыз",
        ornekSigmiyor: "Бүгінгі аят бұл өлшемге сыймайды. Оқу үшін түртіңіз.",
        ornekAcin: "Ашу",
        ornekArapcaKaynagi: "Арабша: Tanzil",
        ornekMeal: "Шын мәнінде қиыншылықпен бірге бір оңайлық бар.",
        ornekKisaKunye: "Құран 94:6",
        ornekMealKaynagi: "Khalifa Altai, QuranEnc 1.0.0"
    )

    // ky
    static let ky = GununAyetiYerelMetinleri(
        galeriAdi: "Күндүн аяты",
        galeriAciklama: "Күн сайын багымдатта алмашып турган аят жана анын котормосу.",
        etiket: "КҮНДҮН АЯТЫ",
        uygulamayiAcin: "Күндүн аятын көрүү үчүн колдонмону ачыңыз",
        ornekSigmiyor: "Бүгүнкү аят бул өлчөмгө батпайт. Окуу үчүн басыңыз.",
        ornekAcin: "Ачуу",
        ornekArapcaKaynagi: "Арабча: Tanzil",
        ornekMeal: "Албетте, кыйынчылык менен бирге жеңилдик бар.",
        ornekKisaKunye: "Куран 94:6",
        ornekMealKaynagi: "Shamsuddin Hakimov, QuranEnc 1.0.2"
    )

    // tg — meal 94:6 `gununAyetiHavuzu.ts` (tajik_arifi), künye `GUNUN_AYETI_KAYNAKLARI.mealler.tg`
    static let tg = GununAyetiYerelMetinleri(
        galeriAdi: "Ояти рӯз",
        galeriAciklama: "Оят бо тарҷумааш, ки ҳар рӯз ҳангоми бомдод иваз мешавад.",
        etiket: "ОЯТИ РӮЗ",
        uygulamayiAcin: "Барои дидани ояти рӯз барномаро кушоед",
        ornekSigmiyor: "Ояти имрӯз ба ин андоза намеғунҷад. Барои хондан пахш кунед.",
        ornekAcin: "Кушодан",
        ornekArapcaKaynagi: "Арабӣ: Tanzil",
        ornekMeal: "[Оре] Мусалламан, бо [ҳар] душворӣ осонӣ аст",
        ornekKisaKunye: "Қуръон 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.2"
    )

    // sw
    static let sw = GununAyetiYerelMetinleri(
        galeriAdi: "Aya ya siku",
        galeriAciklama: "Aya na tafsiri yake inayobadilika kila siku wakati wa Alfajiri.",
        etiket: "AYA YA SIKU",
        uygulamayiAcin: "Fungua programu ili kuona aya ya siku",
        ornekSigmiyor: "Aya ya leo haitoshei ukubwa huu. Gusa uisome.",
        ornekAcin: "Fungua",
        ornekArapcaKaynagi: "Kiarabu: Tanzil",
        ornekMeal: "Hakika pamoja na uzito upo wepesi.",
        ornekKisaKunye: "Qur’ani 94:6",
        ornekMealKaynagi: "Rowad Translation Center, QuranEnc 1.0.5"
    )

    // ha — meal 94:6 `gununAyetiHavuzu.ts` (hausa_gummi, birebir), künye `GUNUN_AYETI_KAYNAKLARI.mealler.ha`
    static let ha = GununAyetiYerelMetinleri(
        galeriAdi: "Ayar yau",
        galeriAciklama: "Aya da fassararta da ke canjawa kowace rana a Asuba.",
        etiket: "AYAR YAU",
        uygulamayiAcin: "Buɗe manhaja don ganin ayar yau",
        ornekSigmiyor: "Ayar yau ba ta dace da wannan girma ba. Ku taɓa don karanta ta.",
        ornekAcin: "Buɗe",
        ornekArapcaKaynagi: "Larabci: Tanzil",
        ornekMeal: "Lalle ne tãre da tsananin nan akwai wani sauƙi.",
        ornekKisaKunye: "Alƙurʼani 94:6",
        ornekMealKaynagi: "Abu Bakr Jumi, QuranEnc 1.2.2"
    )

    // am — Amharca (beta); örnek meal gununAyetiHavuzu.ts 94:6 `am` (amharic_sadiq) BİREBİR
    static let am = GununAyetiYerelMetinleri(
        galeriAdi: "የዕለቱ አንቀጽ",
        galeriAciklama: "በየቀኑ በፈጅር የሚቀየር አንቀጽ እና ትርጉሙ።",
        etiket: "የዕለቱ አንቀጽ",
        uygulamayiAcin: "የዕለቱን አንቀጽ ለማየት መተግበሪያውን ይክፈቱ",
        ornekSigmiyor: "የዛሬው አንቀጽ በዚህ መጠን አይበቃም። ለማንበብ ይንኩ።",
        ornekAcin: "ክፈት",
        ornekArapcaKaynagi: "ዓረብኛ፦ Tanzil",
        ornekMeal: "ከችግር ጋር በእርግጥ ምቾት አልለ፡፡",
        ornekKisaKunye: "ቁርኣን 94:6",
        ornekMealKaynagi: "Muhammad Sadiq፣ QuranEnc 1.1.2"
    )

    // om — örnek meal `gununAyetiHavuzu.ts` 94:6 `om` birebir; künye `mealler.om`
    static let om = GununAyetiYerelMetinleri(
        galeriAdi: "Aayata guyyaa",
        galeriAciklama: "Aayataafi hiikkaa isaa guyyaa guyyaan Subhiitti jijjiiramu.",
        etiket: "AAYATA GUYYAA",
        uygulamayiAcin: "Aayata guyyaa arguuf appicha banaa",
        ornekSigmiyor: "Aayanni har'aa hanga kanaaf hin gahu. Dubbisuuf tuqaa.",
        ornekAcin: "Banaa",
        ornekArapcaKaynagi: "Arabaa: Tanzil",
        ornekMeal: "Dhugumatti, rakkina wajjin laafinatu jira.",
        ornekKisaKunye: "Qur'aana 94:6",
        ornekMealKaynagi: "Gali Ababor, QuranEnc 1.0.3"
    )

    // so
    static let so = GununAyetiYerelMetinleri(
        galeriAdi: "Aayadda maanta",
        galeriAciklama: "Aayad iyo tarjumaaddeeda oo isbeddesha maalin kasta waqtiga Subax.",
        etiket: "AAYADDA MAANTA",
        uygulamayiAcin: "Fur barnaamijka si aad u aragto aayadda maanta",
        ornekSigmiyor: "Aayadda maanta kuma filna cabbirkan. Taabo si aad u akhrido.",
        ornekAcin: "Fur",
        ornekArapcaKaynagi: "Carabiga: Tanzil",
        ornekMeal: "Xaqiiq, waxaa dhibka la socda faraj.",
        ornekKisaKunye: "Qur'aan 94:6",
        ornekMealKaynagi: "Abdullah Hasan Yaqoub, QuranEnc 1.0.26"
    )

    // ff
    static let ff = GununAyetiYerelMetinleri(
        galeriAdi: "Aaya ñalawma",
        galeriAciklama: "Aaya e firo mum, waylotooɗo ñalawma kala e subaka.",
        etiket: "AAYA ÑALAWMA",
        uygulamayiAcin: "Udditee jaaɓngal ngal ngam yiyde aaya ñalawma",
        ornekSigmiyor: "Aaya hannde haanaani e ɓetol ngol. Dobee ngam janngude ɗum.",
        ornekAcin: "Udditee",
        ornekArapcaKaynagi: "Aarabeere: Tanzil",
        ornekMeal: "Pellet saɗteende kala na won'di e yaajeende.",
        ornekKisaKunye: "Alqur’aana 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.2"
    )

    // yo
    static let yo = GununAyetiYerelMetinleri(
        galeriAdi: "Āyah ti òní",
        galeriAciklama: "Āyah kan àti ìtumọ̀ rẹ̀ tí ń yí padà lójoojúmọ́ ní Subh.",
        etiket: "ĀYAH TI ÒNÍ",
        uygulamayiAcin: "Ẹ ṣí ìṣàfilọ́lẹ̀ láti rí āyah ti òní",
        ornekSigmiyor: "Āyah ti òní kò bá ìwọ̀n yìí mu. Ẹ tẹ̀ ẹ́ láti kà á.",
        ornekAcin: "Ṣí i",
        ornekArapcaKaynagi: "Lárúbáwá: Tanzil",
        ornekMeal: "Dájúdájú ìdẹ̀kùn wà lẹ́yìn ìnira sẹ́.",
        ornekKisaKunye: "Al-Ƙur’ān 94:6",
        ornekMealKaynagi: "Abu Rahimah Mikael, QuranEnc 1.0.9"
    )

    // zh
    static let zh = GununAyetiYerelMetinleri(
        galeriAdi: "每日经文",
        galeriAciklama: "一节经文及其译文，每天晨礼时更换。",
        etiket: "每日经文",
        uygulamayiAcin: "打开应用以查看每日经文",
        ornekSigmiyor: "今天的经文放不下此尺寸。点按即可阅读。",
        ornekAcin: "打开",
        ornekArapcaKaynagi: "阿拉伯语: Tanzil",
        ornekMeal: "与艰难相伴的，确是容易，",
        ornekKisaKunye: "古兰经 94:6",
        ornekMealKaynagi: "Muhammad Suleiman，QuranEnc 1.0.8"
    )

    // ta (örnek meal gununAyetiHavuzu.ts 94:6 tamil_omar birebir; künye mealler.ta)
    static let ta = GununAyetiYerelMetinleri(
        galeriAdi: "இன்றைய வசனம்",
        galeriAciklama: "தினமும் ஃபஜ்ர் நேரத்தில் மாறும் ஒரு வசனமும் அதன் மொழிபெயர்ப்பும்.",
        etiket: "இன்றைய வசனம்",
        uygulamayiAcin: "இன்றைய வசனத்தைப் பார்க்க ஆப்ஸைத் திறக்கவும்",
        ornekSigmiyor: "இன்றைய வசனம் இந்த அளவில் பொருந்தவில்லை. படிக்கத் தட்டவும்.",
        ornekAcin: "திறக்க",
        ornekArapcaKaynagi: "அரபு: Tanzil",
        ornekMeal: "நிச்சயமாக சிரமத்துடன் இலகு இருக்கிறது.",
        ornekKisaKunye: "குர்ஆன் 94:6",
        ornekMealKaynagi: "Omar Sharif, QuranEnc 1.0.4"
    )

    // ml — Malayalamca (beta): JS `sozluk/ml/gununAyeti.ts`. `gununAyetiHavuzu.ts`'te 94:6 için Malayalamca
    // (malayalam_kunhi) meal YOK → `ornekMeal` ve `ornekMealKaynagi` boş (uydurma çeviri yok), yalnız Arapça.
    static let ml = GununAyetiYerelMetinleri(
        galeriAdi: "ഇന്നത്തെ ആയത്ത്",
        galeriAciklama: "എല്ലാ ദിവസവും സുബ്‌ഹിന് മാറുന്ന ഒരു ആയത്തും അതിന്റെ പരിഭാഷയും.",
        etiket: "ഇന്നത്തെ ആയത്ത്",
        uygulamayiAcin: "ഇന്നത്തെ ആയത്ത് കാണാൻ ആപ്പ് തുറക്കുക",
        ornekSigmiyor: "ഇന്നത്തെ ആയത്ത് ഈ വലുപ്പത്തിൽ ഒതുങ്ങുന്നില്ല. വായിക്കാൻ ടാപ്പ് ചെയ്യുക.",
        ornekAcin: "തുറക്കുക",
        ornekArapcaKaynagi: "അറബി: Tanzil",
        ornekMeal: "",
        ornekKisaKunye: "ഖുർആൻ 94:6",
        ornekMealKaynagi: ""
    )

    // th
    static let th = GununAyetiYerelMetinleri(
        galeriAdi: "อายะฮ์ประจำวัน",
        galeriAciklama: "อายะฮ์และคำแปลที่เปลี่ยนทุกวันตอนซุบฮ์",
        etiket: "อายะฮ์ประจำวัน",
        uygulamayiAcin: "เปิดแอปเพื่อดูอายะฮ์ประจำวัน",
        ornekSigmiyor: "อายะฮ์ของวันนี้ไม่พอดีกับขนาดนี้ แตะเพื่ออ่าน",
        ornekAcin: "เปิด",
        ornekArapcaKaynagi: "ภาษาอาหรับ: Tanzil",
        ornekMeal: "แท้จริงหลังจากหนึ่งความยากลำบากก็จะมีความง่ายหลายอย่าง",
        ornekKisaKunye: "อัลกุรอาน 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.1"
    )

    // ko
    static let ko = GununAyetiYerelMetinleri(
        galeriAdi: "오늘의 구절",
        galeriAciklama: "매일 새벽 예배 시간에 바뀌는 구절과 번역.",
        etiket: "오늘의 구절",
        uygulamayiAcin: "오늘의 구절을 보려면 앱을 여세요",
        ornekSigmiyor: "오늘의 구절이 이 크기에 맞지 않습니다. 탭하여 읽으세요.",
        ornekAcin: "열기",
        ornekArapcaKaynagi: "아랍어: Tanzil",
        ornekMeal: "실로 어려움과 함께 쉬움이 있노라.",
        ornekKisaKunye: "꾸란 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.11"
    )

    // vi — meal `gununAyetiHavuzu.ts` 94:6 (vietnamese_rwwad) birebir, künye GUNUN_AYETI_KAYNAKLARI.mealler.vi
    static let vi = GununAyetiYerelMetinleri(
        galeriAdi: "Câu Kinh hôm nay",
        galeriAciklama: "Một câu Kinh kèm bản dịch, thay đổi mỗi ngày vào giờ Fajr.",
        etiket: "CÂU KINH HÔM NAY",
        uygulamayiAcin: "Mở ứng dụng để xem câu Kinh hôm nay",
        ornekSigmiyor: "Câu Kinh hôm nay không vừa kích thước này. Chạm để đọc.",
        ornekAcin: "Mở",
        ornekArapcaKaynagi: "Tiếng Ả Rập: Tanzil",
        ornekMeal: "Quả thật, đi cùng với khó khăn là sự dễ dàng.",
        ornekKisaKunye: "Qur’an 94:6",
        ornekMealKaynagi: "Rowwad Translation Center, QuranEnc 1.0.9"
    )

    static let tablo: [String: GununAyetiYerelMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
        "zh": zh, "ta": ta, "ml": ml, "th": th, "ko": ko, "vi": vi,
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
        // Meal ve kunye secilen rakamla (Arapcada "arab" → Dogu Arap); Arapca ayet (Tanzil)
        // birebir kalir.
        Text(WidgetMetin.rakam(meal))
            // Ge'ez, Tamil, Malayalam, Tay, Korece ve Cince meal sistem tasariminda (serif tasarimda bu yazilar yok).
            .font(.system(stil, design: GununAyetiKarari.mealSerifMi(meal) ? .serif : .default))
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
        Text(WidgetMetin.rakam(metin))
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
            Text(WidgetMetin.rakam(kayit.kisaKunye))
                .font(.system(.headline, design: GununAyetiKarari.mealSerifMi(kayit.kisaKunye) ? .serif : .default))
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
        // Yerel rakamli dilde (ar, bn) rakam sistemi acikca verilir (ciplak "ar"/"bn" yerel rakam
        // yazar, Bati secen de).
        f.locale = Locale(identifier: RakamSistemi.yerelAyarKimligi(dil: dil, kayitli: WidgetMetin.rakamKaydi)
            ?? (dil.isEmpty ? ArayuzDili.varsayilan : dil))
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
                    Text(WidgetMetin.rakam(meal))
                        .font(.footnote)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Text(WidgetMetin.rakam(meal))
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
                Text(WidgetMetin.rakam(kayit.kisaKunye))
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
