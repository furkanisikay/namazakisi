import SwiftUI
import UIKit

// APPLE TV PANOSU — tvOS SwiftUI uygulamasi (Android TV `tv/` panosunun ikizi).
//
// Pano YALNIZ GOSTERIR: vakitler cihazda, telefonla ayni hesapla (`TvVakitHesabi`)
// bulunur; ag ve konum izni yok, il elle secilir (`iller.json`, telefonun manuel konum
// listesi). Secim `UserDefaults` > `il_plaka` (ekran goruntusu hatti `-il_plaka 34`
// baslatma argumaniyla tohumlar: arguman alani UserDefaults okumasini ezer).
//
// Hedef `plugins/withNamazTV.js` ile prebuild'de kurulur (bayrak varsayilan KAPALI).

@main
struct NamazTVUygulamasi: App {
    var body: some Scene {
        WindowGroup {
            TvKokGorunumu()
        }
    }
}

/// Telefonun koyu tema tokenlari (`koyuTema` + yesil palet). TV daima koyudur.
/// Kontrast: beyaz metin aktif satirda `birincilKoyu` (#388E3C, ~4.6:1) uzerinde; `birincil`
/// (#4CAF50) beyazla 2.8:1'de kaldigi icin METIN ZEMINI olmaz; amber yalniz noktada.
enum TvRenk {
    static let arkaplan = Color(red: 0x12 / 255, green: 0x12 / 255, blue: 0x12 / 255)
    static let kart = Color(red: 0x1E / 255, green: 0x1E / 255, blue: 0x1E / 255)
    static let metin = Color.white
    static let metinIkincil = Color(red: 0xB0 / 255, green: 0xB0 / 255, blue: 0xB0 / 255)
    static let sinir = Color(red: 0x33 / 255, green: 0x33 / 255, blue: 0x33 / 255)
    static let birincil = Color(red: 0x4C / 255, green: 0xAF / 255, blue: 0x50 / 255)
    static let birincilKoyu = Color(red: 0x38 / 255, green: 0x8E / 255, blue: 0x3C / 255)
    static let uyari = Color(red: 0xFF / 255, green: 0xCA / 255, blue: 0x28 / 255)
}

/// Pano arayuz metinleri (W5) — TV CIHAZIN dilini izler (`TvDili.cihaz`; Android TV kaynak
/// sistemiyle ayni karar). Ingilizce karsiliklar JS sozlugunden (`sozluk/en`) ve Android TV
/// `values-en` ile ayni. Arayuz kaydi: Turkcede kibar "siz", Ingilizcede notr.
struct TvMetin {
    let dil: String
    private var t: TvArayuzMetinleri { TvArayuzMetinleri.dil(dil) }

    var sehrinizSecin: String { t.sehrinizSecin }
    var ilMerkezi: String { t.ilMerkezi }
    func ilSecErisim(_ il: String) -> String { TvDili.bicim(t.ilSecErisim, ["il": il]) }
    func kalan(_ ad: String) -> String { TvDili.bicim(t.kalan, ["ad": ad]) }
    func kalanErisim(_ ad: String, _ sure: String) -> String { TvDili.bicim(t.kalanErisim, ["ad": ad, "sure": sure]) }
    var konumuDegistirin: String { t.konumuDegistirin }
    func kerahatSuruyor(_ tur: String, _ bitis: String, _ aciklama: String) -> String {
        TvDili.bicim(t.kerahatSuruyor, ["tur": tur, "bitis": bitis, "aciklama": aciklama])
    }
    func siradakiKerahat(_ tur: String, _ bas: String, _ bit: String) -> String {
        TvDili.bicim(t.siradakiKerahat, ["tur": tur, "bas": bas, "bit": bit])
    }
    func cumaBilgisi(_ giris: String) -> String { TvDili.bicim(t.cumaBilgisi, ["giris": giris]) }
    var suAnkiEk: String { t.suAnkiEk }
    var siradakiEk: String { t.siradakiEk }
}

/// `TvMetin` dil tablosu. Yer tutucular `{il}`, `{ad}`, `{sure}`, `{tur}`, `{bitis}`,
/// `{aciklama}`, `{bas}`, `{bit}`, `{giris}`. Duzen: sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km;
/// cevrilmemis dil Ingilizce kopya (`// ÇEVİRİ: <kod>`).
struct TvArayuzMetinleri {
    let sehrinizSecin: String
    let ilMerkezi: String
    let ilSecErisim: String
    let kalan: String
    let kalanErisim: String
    let konumuDegistirin: String
    let kerahatSuruyor: String
    let siradakiKerahat: String
    let cumaBilgisi: String
    let suAnkiEk: String
    let siradakiEk: String

    static let tr = TvArayuzMetinleri(
        sehrinizSecin: "Şehrinizi seçin",
        ilMerkezi: "Namaz vakitleri il merkezine göre hesaplanır. Seçiminizi sonra değiştirebilirsiniz.",
        ilSecErisim: "{il}, seçin",
        kalan: "{ad} vaktine kalan",
        kalanErisim: "{ad} vaktine kalan süre {sure}",
        konumuDegistirin: "Konumu değiştirin",
        kerahatSuruyor: "Kerahat vakti: {tur}, bitiş {bitis}. {aciklama}",
        siradakiKerahat: "Sıradaki kerahat: {tur} {bas}–{bit}",
        cumaBilgisi: "Bugün cuma. Cuma namazı öğle vaktinde kılınır (giriş {giris}).",
        suAnkiEk: ", şu anki vakit",
        siradakiEk: ", sıradaki vakit"
    )

    static let en = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )


    // id — Endonezce (beta)
    static let id = TvArayuzMetinleri(
        sehrinizSecin: "Pilih kota Anda",
        ilMerkezi: "Waktu salat dihitung berdasarkan ibu kota provinsi. Anda dapat mengubah pilihan nanti.",
        ilSecErisim: "{il}, pilih",
        kalan: "Sisa waktu hingga {ad}",
        kalanErisim: "Sisa waktu hingga {ad}: {sure}",
        konumuDegistirin: "Ubah lokasi",
        kerahatSuruyor: "Waktu makruh: {tur}, berakhir {bitis}. {aciklama}",
        siradakiKerahat: "Waktu makruh berikutnya: {tur} {bas}–{bit}",
        cumaBilgisi: "Hari ini Jumat. Salat Jumat ditunaikan pada waktu Dzuhur (masuk {giris}).",
        suAnkiEk: ", waktu salat saat ini",
        siradakiEk: ", waktu salat berikutnya"
    )


    // de — Almanca (beta): JS `sozluk/de` (hitap "Sie", "bitte" yok)
    static let de = TvArayuzMetinleri(
        sehrinizSecin: "Wählen Sie Ihre Stadt",
        ilMerkezi: "Die Gebetszeiten werden für das Stadtzentrum berechnet. Sie können Ihre Auswahl später ändern.",
        ilSecErisim: "{il}, auswählen",
        kalan: "Verbleibende Zeit bis {ad}",
        kalanErisim: "Verbleibende Zeit bis {ad}: {sure}",
        konumuDegistirin: "Standort ändern",
        kerahatSuruyor: "Makruh-Zeit: {tur}, endet um {bitis}. {aciklama}",
        siradakiKerahat: "Nächste Makruh-Zeit: {tur} {bas}–{bit}",
        cumaBilgisi: "Heute ist Freitag. Das Freitagsgebet wird zur Dhuhr-Zeit verrichtet (Beginn {giris}).",
        suAnkiEk: ", aktuelle Gebetszeit",
        siradakiEk: ", nächste Gebetszeit"
    )


    // fr
    static let fr = TvArayuzMetinleri(
        sehrinizSecin: "Choisissez votre ville",
        ilMerkezi: "Les heures de prière sont calculées pour le chef-lieu de la province. Vous pourrez modifier votre choix plus tard.",
        ilSecErisim: "{il}, choisir",
        kalan: "Temps restant avant {ad}",
        kalanErisim: "Temps restant avant {ad} : {sure}",
        konumuDegistirin: "Changer de position",
        kerahatSuruyor: "Moment makrouh : {tur}, fin à {bitis}. {aciklama}",
        siradakiKerahat: "Prochain moment makrouh : {tur} {bas}–{bit}",
        cumaBilgisi: "Aujourd’hui, c’est vendredi. Joumoua se prie à l’heure de Dhuhr (début à {giris}).",
        suAnkiEk: ", prière en cours",
        siradakiEk: ", prochaine prière"
    )


    // bs
    static let bs = TvArayuzMetinleri(
        sehrinizSecin: "Odaberite svoj grad",
        ilMerkezi: "Vremena se računaju za centar grada. Izbor kasnije možete promijeniti.",
        ilSecErisim: "{il}, odaberite",
        kalan: "Do vakta: {ad}",
        kalanErisim: "{ad}: još {sure}",
        konumuDegistirin: "Promijenite lokaciju",
        kerahatSuruyor: "Mekruh vrijeme: {tur}, ističe u {bitis}. {aciklama}",
        siradakiKerahat: "Sljedeće mekruh vrijeme: {tur} {bas}–{bit}",
        cumaBilgisi: "Danas je petak. Džuma-namaz se klanja u vrijeme podne-namaza (nastupa u {giris}).",
        suAnkiEk: ", trenutni vakat",
        siradakiEk: ", sljedeći vakat"
    )


    // ru
    static let ru = TvArayuzMetinleri(
        sehrinizSecin: "Выберите свою провинцию",
        ilMerkezi: "Время намазов рассчитывается для центра провинции. Выбор можно изменить позже.",
        ilSecErisim: "{il}, выбрать",
        kalan: "{ad} через",
        kalanErisim: "{ad} через {sure}",
        konumuDegistirin: "Изменить местоположение",
        kerahatSuruyor: "Время макрух: {tur}, до {bitis}. {aciklama}",
        siradakiKerahat: "Следующее время макрух: {tur} {bas}–{bit}",
        cumaBilgisi: "Сегодня пятница. Джума-намаз совершается во время Зухр (начало в {giris}).",
        suAnkiEk: ", текущий намаз",
        siradakiEk: ", следующий намаз"
    )


    // ms
    static let ms = TvArayuzMetinleri(
        sehrinizSecin: "Pilih bandar anda",
        ilMerkezi: "Waktu solat dikira berdasarkan pusat wilayah. Anda boleh menukar pilihan anda kemudian.",
        ilSecErisim: "{il}, pilih",
        kalan: "Baki masa sehingga {ad}",
        kalanErisim: "Baki masa sehingga {ad}: {sure}",
        konumuDegistirin: "Tukar lokasi",
        kerahatSuruyor: "Waktu makruh: {tur}, tamat {bitis}. {aciklama}",
        siradakiKerahat: "Waktu makruh seterusnya: {tur} {bas}–{bit}",
        cumaBilgisi: "Hari ini Jumaat. Solat Jumaat ditunaikan pada waktu Zohor (masuk {giris}).",
        suAnkiEk: ", waktu semasa",
        siradakiEk: ", waktu seterusnya"
    )


    // ar — Arapça (beta): JS `sozluk/ar` (konum, anaEkran.kerahat, vakit); yönetim metni mastar kalıbı
    static let ar = TvArayuzMetinleri(
        sehrinizSecin: "اختيار مدينتك",
        ilMerkezi: "تُحسب المواقيت وفق مركز المدينة. ويمكن تغيير الاختيار لاحقًا.",
        ilSecErisim: "{il}، اختيار",
        kalan: "المتبقي على {ad}",
        kalanErisim: "المتبقي على {ad}: {sure}",
        konumuDegistirin: "تغيير الموقع",
        kerahatSuruyor: "وقت الكراهة: {tur}، ينتهي {bitis}. {aciklama}",
        siradakiKerahat: "وقت الكراهة التالي: {tur} {bas}–{bit}",
        cumaBilgisi: "اليوم الجمعة. تُصلّى الجمعة في وقت الظهر (يدخل {giris}).",
        suAnkiEk: "، الوقت الحالي",
        siradakiEk: "، الوقت التالي"
    )


    // ur
    static let ur = TvArayuzMetinleri(
        sehrinizSecin: "اپنا شہر منتخب کریں",
        ilMerkezi: "نماز کے اوقات صوبے کے مرکزی شہر کے مطابق نکالے جاتے ہیں۔ اپنا انتخاب بعد میں بدلا جا سکتا ہے۔",
        ilSecErisim: "{il}، منتخب کریں",
        kalan: "{ad} تک باقی وقت",
        kalanErisim: "{ad} تک باقی وقت: {sure}",
        konumuDegistirin: "مقام بدلیں",
        kerahatSuruyor: "مکروہ وقت: {tur}، اختتام {bitis}۔ {aciklama}",
        siradakiKerahat: "اگلا مکروہ وقت: {tur} {bas}–{bit}",
        cumaBilgisi: "آج جمعہ ہے۔ جمعہ کی نماز ظہر کے وقت میں ادا کی جاتی ہے (آغاز {giris})۔",
        suAnkiEk: "، موجودہ نماز",
        siradakiEk: "، اگلی نماز"
    )

    // es — İspanyolca (beta); terimler JS sozluk/es (hitap "usted", cuma "Yumu’a")
    static let es = TvArayuzMetinleri(
        sehrinizSecin: "Elija su ciudad",
        ilMerkezi: "Las horas de rezo se calculan para el centro de la provincia. Puede cambiar su elección más tarde.",
        ilSecErisim: "{il}, elegir",
        kalan: "Tiempo restante hasta {ad}",
        kalanErisim: "Tiempo restante hasta {ad}: {sure}",
        konumuDegistirin: "Cambiar la ubicación",
        kerahatSuruyor: "Tiempo makruh: {tur}, termina {bitis}. {aciklama}",
        siradakiKerahat: "Siguiente tiempo makruh: {tur} {bas}–{bit}",
        cumaBilgisi: "Hoy es viernes. El rezo de Yumu’a se hace a la hora de Dhuhr (comienza {giris}).",
        suAnkiEk: ", rezo actual",
        siradakiEk: ", siguiente rezo"
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl` (hitap "u")
    static let nl = TvArayuzMetinleri(
        sehrinizSecin: "Kies uw stad",
        ilMerkezi: "De gebedstijden worden berekend voor het centrum van de stad. U kunt uw keuze later wijzigen.",
        ilSecErisim: "{il}, kiezen",
        kalan: "Resterende tijd tot {ad}",
        kalanErisim: "Resterende tijd tot {ad}: {sure}",
        konumuDegistirin: "Locatie wijzigen",
        kerahatSuruyor: "Makruh-tijd: {tur}, eindigt {bitis}. {aciklama}",
        siradakiKerahat: "Volgende makruh-tijd: {tur} {bas}–{bit}",
        cumaBilgisi: "Vandaag is het vrijdag. Het Djoemoe'a-gebed wordt op de tijd van Dhuhr verricht (begint {giris}).",
        suAnkiEk: ", huidig gebed",
        siradakiEk: ", volgend gebed"
    )

    // sq — Arnavutça (beta): JS `sozluk/sq` (hitap "ju")
    static let sq = TvArayuzMetinleri(
        sehrinizSecin: "Zgjidhni qytetin tuaj",
        ilMerkezi: "Kohët e namazit llogariten për qendrën e provincës. Zgjedhjen mund ta ndryshoni më vonë.",
        ilSecErisim: "{il}, zgjidhni",
        kalan: "Koha e mbetur deri te: {ad}",
        kalanErisim: "Koha e mbetur deri te {ad}: {sure}",
        konumuDegistirin: "Ndryshoni vendndodhjen",
        kerahatSuruyor: "Koha mekruh: {tur}, mbaron {bitis}. {aciklama}",
        siradakiKerahat: "Koha mekruh e radhës: {tur} {bas}–{bit}",
        cumaBilgisi: "Sot është e premte. Namazi i xhumasë falet në kohën e drekës (hyn {giris}).",
        suAnkiEk: ", vakti aktual",
        siradakiEk: ", vakti i radhës"
    )

    // hi — Hintçe (beta): JS `sozluk/hi`
    static let hi = TvArayuzMetinleri(
        sehrinizSecin: "अपना शहर चुनें",
        ilMerkezi: "नमाज़ के वक़्त प्रांत के मुख्य शहर के अनुसार निकाले जाते हैं। अपना चुनाव बाद में बदला जा सकता है।",
        ilSecErisim: "{il}, चुनें",
        kalan: "{ad} तक बाक़ी समय",
        kalanErisim: "{ad} तक बाक़ी समय: {sure}",
        konumuDegistirin: "लोकेशन बदलें",
        kerahatSuruyor: "मकरूह वक़्त: {tur}, ख़त्म {bitis}। {aciklama}",
        siradakiKerahat: "अगला मकरूह वक़्त: {tur} {bas}–{bit}",
        cumaBilgisi: "आज जुमा है। जुमा की नमाज़ ज़ुहर के वक़्त में पढ़ी जाती है (शुरू {giris})।",
        suAnkiEk: ", मौजूदा नमाज़",
        siradakiEk: ", अगली नमाज़"
    )

    // bn — Bengalce (beta); Android TV `values-bn` ile aynı
    static let bn = TvArayuzMetinleri(
        sehrinizSecin: "আপনার শহর বেছে নিন",
        ilMerkezi: "নামাজের সময় প্রদেশের কেন্দ্র অনুযায়ী হিসাব করা হয়। পরে আপনার বাছাই বদলাতে পারেন।",
        ilSecErisim: "{il}, বেছে নিন",
        kalan: "{ad} পর্যন্ত বাকি সময়",
        kalanErisim: "{ad} পর্যন্ত বাকি সময়: {sure}",
        konumuDegistirin: "অবস্থান বদলান",
        kerahatSuruyor: "মাকরূহ সময়: {tur}, শেষ {bitis}। {aciklama}",
        siradakiKerahat: "পরবর্তী মাকরূহ সময়: {tur} {bas}–{bit}",
        cumaBilgisi: "আজ শুক্রবার। জুমার নামাজ যোহরের ওয়াক্তে পড়া হয় (শুরু {giris})।",
        suAnkiEk: ", বর্তমান নামাজ",
        siradakiEk: ", পরবর্তী নামাজ"
    )

    // fa — Farsça (beta); JS `sozluk/fa` (konum.il, genel.evEkrani, anaEkran.kerahat), hitap "شما"
    static let fa = TvArayuzMetinleri(
        sehrinizSecin: "شهر خود را انتخاب کنید",
        ilMerkezi: "اوقات نماز بر اساس مرکز استان محاسبه می‌شود. بعداً می‌توانید انتخاب خود را تغییر دهید.",
        ilSecErisim: "{il}، انتخاب",
        kalan: "تا وقت {ad}",
        kalanErisim: "زمان باقی‌مانده تا وقت {ad}: {sure}",
        konumuDegistirin: "تغییر موقعیت",
        kerahatSuruyor: "وقت مکروه: {tur}، پایان {bitis}. {aciklama}",
        siradakiKerahat: "وقت مکروه بعدی: {tur} {bas}–{bit}",
        cumaBilgisi: "امروز جمعه است. نماز جمعه در وقت ظهر خوانده می‌شود (آغاز {giris}).",
        suAnkiEk: "، نماز کنونی",
        siradakiEk: "، نماز بعدی"
    )

    // ps — Peştuca (beta): JS sozluk/ps
    static let ps = TvArayuzMetinleri(
        sehrinizSecin: "خپل ښار وټاکئ",
        ilMerkezi: "د لمانځه وختونه د ولایت د مرکز لپاره حسابېږي. خپل انتخاب وروسته بدلولای شئ.",
        ilSecErisim: "{il}، وټاکئ",
        kalan: "د {ad} تر وخته پاتې",
        kalanErisim: "د {ad} تر وخته پاتې: {sure}",
        konumuDegistirin: "موقعیت بدل کړئ",
        kerahatSuruyor: "مکروه وخت: {tur}، پای {bitis}. {aciklama}",
        siradakiKerahat: "بل مکروه وخت: {tur} {bas}–{bit}",
        cumaBilgisi: "نن جمعه ده. د جمعې لمونځ د ماسپښین په وخت کېږي (پیل {giris}).",
        suAnkiEk: "، اوسنی وخت",
        siradakiEk: "، بل وخت"
    )

    // ckb
    static let ckb = TvArayuzMetinleri(
        sehrinizSecin: "شارەکەتان ھەڵبژێرن",
        ilMerkezi: "کاتەکانی نوێژ بۆ ناوەندی پارێزگا ھەژمار دەکرێن. دەتوانن دواتر ھەڵبژاردنەکەتان بگۆڕن.",
        ilSecErisim: "{il}، ھەڵبژاردن",
        kalan: "کاتی ماوە تا {ad}",
        kalanErisim: "کاتی ماوە تا {ad}: {sure}",
        konumuDegistirin: "گۆڕینی شوێن",
        kerahatSuruyor: "کاتی مەکروھ: {tur}، کۆتایی {bitis}. {aciklama}",
        siradakiKerahat: "کاتی مەکروھی داھاتوو: {tur} {bas}–{bit}",
        cumaBilgisi: "ئەمڕۆ ھەینییە. نوێژی ھەینی لە کاتی نیوەڕۆدا دەکرێت (دەستپێک {giris}).",
        suAnkiEk: "، نوێژی ئێستا",
        siradakiEk: "، نوێژی داھاتوو"
    )

    // ug — Uygurca (beta); JS `sozluk/ug` (hitap "سىز")
    static let ug = TvArayuzMetinleri(
        sehrinizSecin: "شەھىرىڭىزنى تاللاڭ",
        ilMerkezi: "ناماز ۋاقىتلىرى شەھەر مەركىزى بويىچە ھېسابلىنىدۇ. تاللىشىڭىزنى كېيىن ئۆزگەرتەلەيسىز.",
        ilSecErisim: "{il}، تاللاڭ",
        kalan: "{ad} ۋاقتىغا قالغان ۋاقىت",
        kalanErisim: "{ad} ۋاقتىغا قالغان ۋاقىت: {sure}",
        konumuDegistirin: "ئورۇننى ئۆزگەرتىڭ",
        kerahatSuruyor: "مەكرۇھ ۋاقىت: {tur}، ئاخىرلىشىشى {bitis}. {aciklama}",
        siradakiKerahat: "كېيىنكى مەكرۇھ ۋاقىت: {tur} {bas}–{bit}",
        cumaBilgisi: "بۈگۈن جۈمە. جۈمە نامىزى پېشىن ۋاقتىدا ئوقۇلىدۇ (كىرىشى {giris}).",
        suAnkiEk: "، ھازىرقى ۋاقىت",
        siradakiEk: "، كېيىنكى ۋاقىت"
    )

    // az — Azerice (beta); JS `sozluk/az` (hitap "siz")
    static let az = TvArayuzMetinleri(
        sehrinizSecin: "Şəhərinizi seçin",
        ilMerkezi: "Namaz vaxtları vilayət mərkəzinə görə hesablanır. Seçiminizi sonra dəyişə bilərsiniz.",
        ilSecErisim: "{il}, seçin",
        kalan: "{ad} vaxtına qalan",
        kalanErisim: "{ad} vaxtına qalan müddət {sure}",
        konumuDegistirin: "Məkanı dəyişin",
        kerahatSuruyor: "Məkruh vaxt: {tur}, bitmə {bitis}. {aciklama}",
        siradakiKerahat: "Növbəti məkruh vaxt: {tur} {bas}–{bit}",
        cumaBilgisi: "Bu gün cümədir. Cümə namazı zöhr vaxtında qılınır (giriş {giris}).",
        suAnkiEk: ", hazırkı vaxt",
        siradakiEk: ", növbəti vaxt"
    )

    // uz — Özbekçe (beta, LATİN): JS `sozluk/uz` (hitap "Siz", Kiril kaynak → kirildenLatine)
    static let uz = TvArayuzMetinleri(
        sehrinizSecin: "Shahringizni tanlang",
        ilMerkezi: "Namoz vaqtlari viloyat markazi uchun hisoblanadi. Tanlovingizni keyinroq oʻzgartirishingiz mumkin.",
        ilSecErisim: "{il}, tanlash",
        kalan: "{ad} vaqtigacha qolgan vaqt",
        kalanErisim: "{ad} vaqtigacha qolgan vaqt: {sure}",
        konumuDegistirin: "Joylashuvni oʻzgartirish",
        kerahatSuruyor: "Makruh vaqt: {tur}, tugashi {bitis}. {aciklama}",
        siradakiKerahat: "Keyingi makruh vaqt: {tur} {bas}–{bit}",
        cumaBilgisi: "Bugun juma. Juma namozi peshin vaqtida oʻqiladi (kirishi {giris}).",
        suAnkiEk: ", joriy namoz",
        siradakiEk: ", keyingi namoz"
    )

    // kk — Kazakça (beta, Kiril): JS `sozluk/kk` (konum, anaEkran.kerahat, vakit)
    static let kk = TvArayuzMetinleri(
        sehrinizSecin: "Қалаңызды таңдаңыз",
        ilMerkezi: "Намаз уақыттары қала орталығына қарай есептеледі. Таңдауыңызды кейін өзгерте аласыз.",
        ilSecErisim: "{il}, таңдау",
        kalan: "{ad} уақытына қалды",
        kalanErisim: "{ad} уақытына {sure} қалды",
        konumuDegistirin: "Орынды өзгерту",
        kerahatSuruyor: "Мәкрүһ уақыт: {tur}, аяқталуы {bitis}. {aciklama}",
        siradakiKerahat: "Келесі мәкрүһ уақыт: {tur} {bas}–{bit}",
        cumaBilgisi: "Бүгін жұма. Жұма намазы бесін уақытында оқылады (кіруі {giris}).",
        suAnkiEk: ", қазіргі намаз уақыты",
        siradakiEk: ", келесі намаз уақыты"
    )

    // ky
    static let ky = TvArayuzMetinleri(
        sehrinizSecin: "Шаарыңызды тандаңыз",
        ilMerkezi: "Намаз убактылары облустун борбору үчүн эсептелет. Тандооңузду кийин өзгөртө аласыз.",
        ilSecErisim: "{il}, тандоо",
        kalan: "{ad} убактысына калган убакыт",
        kalanErisim: "{ad} убактысына калган убакыт: {sure}",
        konumuDegistirin: "Жайгашкан жерди өзгөртүү",
        kerahatSuruyor: "Макрух убакыт: {tur}, {bitis} бүтөт. {aciklama}",
        siradakiKerahat: "Кийинки макрух убакыт: {tur} {bas}–{bit}",
        cumaBilgisi: "Бүгүн жума. Жума намазы бешим убактысында окулат (саат {giris} кирет).",
        suAnkiEk: ", азыркы намаз",
        siradakiEk: ", кийинки намаз"
    )

    // tg — Tacikçe (beta); JS `sozluk/tg` (konum.il, genel.evEkrani, anaEkran.kerahat), hitap "Шумо"
    static let tg = TvArayuzMetinleri(
        sehrinizSecin: "Шаҳратонро интихоб кунед",
        ilMerkezi: "Вақтҳо барои маркази вилоят ҳисоб карда мешаванд. Интихоби худро баъдтар иваз карда метавонед.",
        ilSecErisim: "{il}, интихоб кунед",
        kalan: "То вақти {ad}",
        kalanErisim: "То вақти {ad}: {sure}",
        konumuDegistirin: "Маконро иваз кунед",
        kerahatSuruyor: "Вақти макрӯҳ: {tur}, анҷом {bitis}. {aciklama}",
        siradakiKerahat: "Вақти макрӯҳи навбатӣ: {tur} {bas}–{bit}",
        cumaBilgisi: "Имрӯз ҷумъа аст. Намози ҷумъа дар вақти пешин хонда мешавад (оғоз {giris}).",
        suAnkiEk: ", вақти ҷорӣ",
        siradakiEk: ", вақти навбатӣ"
    )

    // sw
    static let sw = TvArayuzMetinleri(
        sehrinizSecin: "Chagua mji wako",
        ilMerkezi: "Nyakati za Swala zinakokotolewa kwa katikati ya mkoa. Unaweza kubadilisha chaguo lako baadaye.",
        ilSecErisim: "{il}, chagua",
        kalan: "Muda uliobaki hadi {ad}",
        kalanErisim: "Muda uliobaki hadi {ad}: {sure}",
        konumuDegistirin: "Badilisha mahali",
        kerahatSuruyor: "Wakati wa makruhu: {tur}, unaisha {bitis}. {aciklama}",
        siradakiKerahat: "Wakati wa makruhu unaofuata: {tur} {bas}–{bit}",
        cumaBilgisi: "Leo ni Ijumaa. Swala ya Ijumaa inaswaliwa wakati wa Adhuhuri (inaingia {giris}).",
        suAnkiEk: ", Swala ya sasa",
        siradakiEk: ", Swala inayofuata"
    )

    // ha — Hausa (beta): JS `sozluk/ha`
    static let ha = TvArayuzMetinleri(
        sehrinizSecin: "Ku zaɓi birninku",
        ilMerkezi: "Ana lissafa lokutan salla na tsakiyar lardi. Kuna iya canja zaɓinku daga baya.",
        ilSecErisim: "{il}, zaɓa",
        kalan: "Lokacin da ya rage zuwa {ad}",
        kalanErisim: "Lokacin da ya rage zuwa {ad}: {sure}",
        konumuDegistirin: "Canja wuri",
        kerahatSuruyor: "Lokacin makaruhi: {tur}, zai ƙare {bitis}. {aciklama}",
        siradakiKerahat: "Lokacin makaruhi na gaba: {tur} {bas}–{bit}",
        cumaBilgisi: "Yau ranar Jummaʼa ce. Ana yin Jumuʼa a lokacin Azahar (za ta yi {giris}).",
        suAnkiEk: ", sallar yanzu",
        siradakiEk: ", salla ta gaba"
    )

    // am — Amharca (beta)
    static let am = TvArayuzMetinleri(
        sehrinizSecin: "ከተማዎን ይምረጡ",
        ilMerkezi: "የሶላት ሰዓቶች ለክፍለ ሀገሩ መሃል ይሰላሉ። ምርጫዎን በኋላ መቀየር ይችላሉ።",
        ilSecErisim: "{il}፣ ምረጥ",
        kalan: "{ad} እስኪገባ የቀረው ጊዜ",
        kalanErisim: "{ad} እስኪገባ የቀረው ጊዜ፦ {sure}",
        konumuDegistirin: "አካባቢን ቀይር",
        kerahatSuruyor: "ሶላት ክልክል የሆነበት ወቅት፦ {tur}፣ በ{bitis} ያበቃል። {aciklama}",
        siradakiKerahat: "ቀጣዩ ሶላት ክልክል የሆነበት ወቅት፦ {tur} {bas}–{bit}",
        cumaBilgisi: "ዛሬ ዓርብ ነው። ጁሙዓ የሚሰገደው በዙህር ሰዓት ነው (የሚገባው {giris})።",
        suAnkiEk: "፣ የአሁኑ ሶላት",
        siradakiEk: "፣ ቀጣዩ ሶላት"
    )

    // om
    static let om = TvArayuzMetinleri(
        sehrinizSecin: "Magaalaa keessan filadhaa",
        ilMerkezi: "Yeroon salaataa giddugala kutaa bulchiinsaatiif herregama. Filannoo keessan booda jijjiiruu dandeessu.",
        ilSecErisim: "{il}, filadhaa",
        kalan: "Hanga {ad}tti yeroo hafe",
        kalanErisim: "Hanga {ad}tti yeroo hafe: {sure}",
        konumuDegistirin: "Bakka jijjiiraa",
        kerahatSuruyor: "Yeroo jibbamaa: {tur}, {bitis}tti xumurama. {aciklama}",
        siradakiKerahat: "Yeroo jibbamaa itti aanu: {tur} {bas}–{bit}",
        cumaBilgisi: "Har'a Jimaata. Salaanni Jimaataa yeroo Zuhriitti salaatama ({giris} jalqaba).",
        suAnkiEk: ", salaata ammaa",
        siradakiEk: ", salaata itti aanu"
    )

    // so
    static let so = TvArayuzMetinleri(
        sehrinizSecin: "Dooro magaaladaada",
        ilMerkezi: "Waqtiyada salaadda waxaa loo xisaabiyaa xarunta gobolka. Doorashadaada waad beddeli kartaa mar dambe.",
        ilSecErisim: "{il}, dooro",
        kalan: "Waqtiga u haray {ad}",
        kalanErisim: "Waqtiga u haray {ad}: {sure}",
        konumuDegistirin: "Beddel goobta",
        kerahatSuruyor: "Waqti makruuh ah: {tur}, wuxuu dhammaanayaa {bitis}. {aciklama}",
        siradakiKerahat: "Waqtiga makruuhka xiga: {tur} {bas}–{bit}",
        cumaBilgisi: "Maanta waa Jimce. Salaadda Jimce waxaa la tukadaa waqtiga Duhur (wuxuu bilaabmayaa {giris}).",
        suAnkiEk: ", salaadda hadda",
        siradakiEk: ", salaadda xigta"
    )

    // ff
    static let ff = TvArayuzMetinleri(
        sehrinizSecin: "Suɓee saare mon",
        ilMerkezi: "Saa’iiji juulɗe hino hiisiree hakkunde diiwaan ngoo. Hiɗon mbaawi waylude suɓaade mon caggal.",
        ilSecErisim: "{il}, suɓee",
        kalan: "Saa’i heddiiɗo haa {ad}",
        kalanErisim: "Saa’i heddiiɗo haa {ad}: {sure}",
        konumuDegistirin: "Waylee nokkuure",
        kerahatSuruyor: "Waqutu makruuhu: {tur}, gasay {bitis}. {aciklama}",
        siradakiKerahat: "Waqutu makruuhu garoowo: {tur} {bas}–{bit}",
        cumaBilgisi: "Hannde ko aljuma. Juma hino juulee e waqutu fanaa (fuɗɗoto {giris}).",
        suAnkiEk: ", juulde jooni",
        siradakiEk: ", juulde garoore"
    )

    // yo
    static let yo = TvArayuzMetinleri(
        sehrinizSecin: "Ẹ yan ìlú yín",
        ilMerkezi: "A ń ṣírò àwọn àkókò ìrun fún àárín ìpínlẹ̀. Ẹ lè yí àṣàyàn yín padà lẹ́yìn náà.",
        ilSecErisim: "{il}, yàn án",
        kalan: "Àkókò tó kù sí {ad}",
        kalanErisim: "Àkókò tó kù sí {ad}: {sure}",
        konumuDegistirin: "Yí ibùdó padà",
        kerahatSuruyor: "Àkókò makrūh: {tur}, yóò parí {bitis}. {aciklama}",
        siradakiKerahat: "Àkókò makrūh tó kàn: {tur} {bas}–{bit}",
        cumaBilgisi: "Òní ni Ọjọ́ Ẹtì. A máa ń kí Jum‘ah ní àkókò Ṭḥuhr (yóò bẹ̀rẹ̀ {giris}).",
        suAnkiEk: ", ìrun lọ́wọ́lọ́wọ́",
        siradakiEk: ", ìrun tó kàn"
    )

    // zh
    static let zh = TvArayuzMetinleri(
        sehrinizSecin: "选择您的城市",
        ilMerkezi: "礼拜时间按省会中心计算。以后可以更改您的选择。",
        ilSecErisim: "{il}，选择",
        kalan: "距{ad}还有",
        kalanErisim: "距{ad}还有: {sure}",
        konumuDegistirin: "更改位置",
        kerahatSuruyor: "禁止礼拜的时间: {tur}，{bitis}结束。{aciklama}",
        siradakiKerahat: "下一个禁止礼拜的时间: {tur} {bas}–{bit}",
        cumaBilgisi: "今天是主麻日。主麻在晌礼时间礼（{giris}开始）。",
        suAnkiEk: "，当前礼拜",
        siradakiEk: "，下一番礼拜"
    )

    // ta
    static let ta = TvArayuzMetinleri(
        sehrinizSecin: "உங்கள் நகரத்தைத் தேர்ந்தெடுக்கவும்",
        ilMerkezi: "தொழுகை நேரங்கள் மாகாண மையத்திற்குக் கணக்கிடப்படுகின்றன. உங்கள் தேர்வைப் பின்னர் மாற்றலாம்.",
        ilSecErisim: "{il}, தேர்ந்தெடுக்க",
        kalan: "{ad} வரை மீதமுள்ள நேரம்",
        kalanErisim: "{ad} வரை மீதமுள்ள நேரம்: {sure}",
        konumuDegistirin: "இருப்பிடத்தை மாற்றுக",
        kerahatSuruyor: "தொழக் கூடாத நேரம்: {tur}, முடிவு {bitis}. {aciklama}",
        siradakiKerahat: "அடுத்த தொழக் கூடாத நேரம்: {tur} {bas}–{bit}",
        cumaBilgisi: "இன்று வெள்ளிக்கிழமை. ஜுமுஆ லுஹர் நேரத்தில் தொழப்படுகிறது (தொடக்கம் {giris}).",
        suAnkiEk: ", தற்போதைய தொழுகை",
        siradakiEk: ", அடுத்த தொழுகை"
    )

    // ml — Malayalamca (beta): JS `sozluk/ml`
    static let ml = TvArayuzMetinleri(
        sehrinizSecin: "നിങ്ങളുടെ നഗരം തിരഞ്ഞെടുക്കുക",
        ilMerkezi: "പ്രവിശ്യാ കേന്ദ്രത്തിനായി നമസ്കാര സമയങ്ങൾ കണക്കാക്കുന്നു. തിരഞ്ഞെടുപ്പ് പിന്നീട് മാറ്റാം.",
        ilSecErisim: "{il}, തിരഞ്ഞെടുക്കുക",
        kalan: "{ad}-ന് ബാക്കിയുള്ള സമയം",
        kalanErisim: "{ad}-ന് ബാക്കിയുള്ള സമയം: {sure}",
        konumuDegistirin: "ലൊക്കേഷൻ മാറ്റുക",
        kerahatSuruyor: "കറാഹത്ത് സമയം: {tur}, {bitis}-ന് തീരും. {aciklama}",
        siradakiKerahat: "അടുത്ത കറാഹത്ത് സമയം: {tur} {bas}–{bit}",
        cumaBilgisi: "ഇന്ന് വെള്ളിയാഴ്ചയാണ്. ജുമുഅ ളുഹർ സമയത്താണ് നിർവഹിക്കുന്നത് ({giris}-ന് തുടങ്ങും).",
        suAnkiEk: ", ഇപ്പോഴത്തെ നമസ്കാരം",
        siradakiEk: ", അടുത്ത നമസ്കാരം"
    )

    // th
    static let th = TvArayuzMetinleri(
        sehrinizSecin: "เลือกเมืองของคุณ",
        ilMerkezi: "เวลาละหมาดคำนวณสำหรับใจกลางจังหวัด คุณเปลี่ยนตัวเลือกได้ภายหลัง",
        ilSecErisim: "{il} เลือก",
        kalan: "เวลาที่เหลือก่อน{ad}",
        kalanErisim: "เวลาที่เหลือก่อน{ad}: {sure}",
        konumuDegistirin: "เปลี่ยนตำแหน่ง",
        kerahatSuruyor: "เวลาที่ห้ามละหมาด: {tur} สิ้นสุด {bitis} {aciklama}",
        siradakiKerahat: "เวลาที่ห้ามละหมาดถัดไป: {tur} {bas}–{bit}",
        cumaBilgisi: "วันนี้เป็นวันศุกร์ ละหมาดญุมอัตในเวลาดุฮ์ริ (เริ่ม {giris})",
        suAnkiEk: " เวลาละหมาดปัจจุบัน",
        siradakiEk: " เวลาละหมาดถัดไป"
    )

    // ko
    static let ko = TvArayuzMetinleri(
        sehrinizSecin: "도시를 선택하세요",
        ilMerkezi: "예배 시간은 주 중심을 기준으로 계산됩니다. 선택은 나중에 바꿀 수 있습니다.",
        ilSecErisim: "{il}, 선택",
        kalan: "{ad} 예배까지 남은 시간",
        kalanErisim: "{ad} 예배까지 남은 시간: {sure}",
        konumuDegistirin: "위치 변경",
        kerahatSuruyor: "예배를 삼가는 시간: {tur}, {bitis} 종료. {aciklama}",
        siradakiKerahat: "다음 예배를 삼가는 시간: {tur} {bas}–{bit}",
        cumaBilgisi: "오늘은 금요일입니다. 금요예배는 정오 예배 시간에 드립니다({giris} 시작).",
        suAnkiEk: ", 현재 예배",
        siradakiEk: ", 다음 예배"
    )

    // vi
    static let vi = TvArayuzMetinleri(
        sehrinizSecin: "Chọn thành phố",
        ilMerkezi: "Giờ Salah được tính cho trung tâm tỉnh. Bạn có thể đổi lựa chọn sau.",
        ilSecErisim: "{il}, chọn",
        kalan: "Thời gian đến {ad}",
        kalanErisim: "Thời gian đến {ad}: {sure}",
        konumuDegistirin: "Đổi vị trí",
        kerahatSuruyor: "Thời điểm cấm: {tur}, kết thúc {bitis}. {aciklama}",
        siradakiKerahat: "Thời điểm cấm tiếp theo: {tur} {bas}–{bit}",
        cumaBilgisi: "Hôm nay là thứ Sáu. Salah Jumu’ah được hành lễ vào giờ Zhuhr (bắt đầu {giris}).",
        suAnkiEk: ", giờ Salah hiện tại",
        siradakiEk: ", giờ Salah tiếp theo"
    )

    // pt
    static let pt = TvArayuzMetinleri(
        sehrinizSecin: "Escolha a sua cidade",
        ilMerkezi: "Os horários são calculados para o centro da província. Pode alterar a escolha mais tarde.",
        ilSecErisim: "{il}, escolher",
        kalan: "Tempo até {ad}",
        kalanErisim: "Tempo até {ad}: {sure}",
        konumuDegistirin: "Alterar a localização",
        kerahatSuruyor: "Horário proibido: {tur}, termina às {bitis}. {aciklama}",
        siradakiKerahat: "Próximo horário proibido: {tur} {bas}–{bit}",
        cumaBilgisi: "Hoje é sexta-feira. O Jumu’ah reza-se à hora do Zuhr (começa às {giris}).",
        suAnkiEk: ", oração atual",
        siradakiEk: ", próxima oração"
    )

    // it
    static let it = TvArayuzMetinleri(
        sehrinizSecin: "Scelga la città",
        ilMerkezi: "Gli orari di preghiera sono calcolati per il centro della provincia. Può cambiare la scelta in seguito.",
        ilSecErisim: "{il}, selezionare",
        kalan: "Tempo rimasto a {ad}",
        kalanErisim: "Tempo rimasto a {ad}: {sure}",
        konumuDegistirin: "Cambiare posizione",
        kerahatSuruyor: "Tempo makruh: {tur}, fino alle {bitis}. {aciklama}",
        siradakiKerahat: "Prossimo tempo makruh: {tur} {bas}–{bit}",
        cumaBilgisi: "Oggi è venerdì. La preghiera del venerdì si compie all’orario dello Zuhr (inizio {giris}).",
        suAnkiEk: ", orario attuale",
        siradakiEk: ", prossimo orario"
    )

    // sv
    static let sv = TvArayuzMetinleri(
        sehrinizSecin: "Välj din stad",
        ilMerkezi: "Bönetiderna beräknas för provinsens centrum. Du kan ändra ditt val senare.",
        ilSecErisim: "{il}, välj",
        kalan: "Tid kvar till {ad}",
        kalanErisim: "Tid kvar till {ad}: {sure}",
        konumuDegistirin: "Byt plats",
        kerahatSuruyor: "Makruh-tid: {tur}, slutar {bitis}. {aciklama}",
        siradakiKerahat: "Nästa makruh-tid: {tur} {bas}–{bit}",
        cumaBilgisi: "I dag är det fredag. Fredagsbönen bes vid tiden för Dhuhr (börjar {giris}).",
        suAnkiEk: ", aktuell bön",
        siradakiEk: ", nästa bön"
    )

    // uk
    static let uk = TvArayuzMetinleri(
        sehrinizSecin: "Виберіть місто",
        ilMerkezi: "Час молитов обчислюється для центру провінції. Вибір можна змінити пізніше.",
        ilSecErisim: "{il}, вибрати",
        kalan: "{ad} через",
        kalanErisim: "{ad} через {sure}",
        konumuDegistirin: "Змінити місцезнаходження",
        kerahatSuruyor: "Небажаний час: {tur}, до {bitis}. {aciklama}",
        siradakiKerahat: "Наступний небажаний час: {tur} {bas}–{bit}",
        cumaBilgisi: "Сьогодні п’ятниця. Молитву Джума здійснюють у час Зугр (початок о {giris}).",
        suAnkiEk: ", поточна молитва",
        siradakiEk: ", наступна молитва"
    )

    // ro
    static let ro = TvArayuzMetinleri(
        sehrinizSecin: "Alegeți orașul",
        ilMerkezi: "Orele de rugăciune se calculează pentru centrul provinciei. Puteți schimba alegerea ulterior.",
        ilSecErisim: "{il}, selectați",
        kalan: "Timp rămas până la {ad}",
        kalanErisim: "Timp rămas până la {ad}: {sure}",
        konumuDegistirin: "Schimbați locația",
        kerahatSuruyor: "Timp makruh: {tur}, se încheie {bitis}. {aciklama}",
        siradakiKerahat: "Următorul timp makruh: {tur} {bas}–{bit}",
        cumaBilgisi: "Azi este vineri. Jumu’ah se efectuează la timpul de Dhuhr (începe {giris}).",
        suAnkiEk: ", rugăciunea curentă",
        siradakiEk: ", rugăciunea următoare"
    )

    // hr
    static let hr = TvArayuzMetinleri(
        sehrinizSecin: "Odaberite svoj grad",
        ilMerkezi: "Vremena namaza izračunavaju se za središte pokrajine. Odabir kasnije možete promijeniti.",
        ilSecErisim: "{il}, odaberite",
        kalan: "Preostalo vrijeme do: {ad}",
        kalanErisim: "Preostalo vrijeme do: {ad}: {sure}",
        konumuDegistirin: "Promijenite lokaciju",
        kerahatSuruyor: "Mekruh vrijeme: {tur}, završava u {bitis}. {aciklama}",
        siradakiKerahat: "Sljedeće mekruh vrijeme: {tur} {bas}–{bit}",
        cumaBilgisi: "Danas je petak. Džuma se klanja u vrijeme podne-namaza (počinje u {giris}).",
        suAnkiEk: ", trenutačni namaz",
        siradakiEk: ", sljedeći namaz"
    )

    // sr
    static let sr = TvArayuzMetinleri(
        sehrinizSecin: "Изаберите свој град",
        ilMerkezi: "Времена се рачунају за центар покрајине. Избор касније можете променити.",
        ilSecErisim: "{il}, изаберите",
        kalan: "До намаза: {ad}",
        kalanErisim: "{ad}: још {sure}",
        konumuDegistirin: "Промените локацију",
        kerahatSuruyor: "Мекрух време: {tur}, истиче у {bitis}. {aciklama}",
        siradakiKerahat: "Следеће мекрух време: {tur} {bas}–{bit}",
        cumaBilgisi: "Данас је петак. Џума-намаз се клања у време подне-намаза (наступа у {giris}).",
        suAnkiEk: ", тренутни намаз",
        siradakiEk: ", следећи намаз"
    )

    // el
    static let el = TvArayuzMetinleri(
        sehrinizSecin: "Επιλέξτε την πόλη σας",
        ilMerkezi: "Οι ώρες προσευχής υπολογίζονται για το κέντρο της επαρχίας. Μπορείτε να αλλάξετε την επιλογή σας αργότερα.",
        ilSecErisim: "{il}, επιλογή",
        kalan: "Χρόνος έως {ad}",
        kalanErisim: "Χρόνος έως {ad}: {sure}",
        konumuDegistirin: "Αλλαγή τοποθεσίας",
        kerahatSuruyor: "Αποδοκιμαστέα ώρα: {tur}, λήγει {bitis}. {aciklama}",
        siradakiKerahat: "Επόμενη αποδοκιμαστέα ώρα: {tur} {bas}–{bit}",
        cumaBilgisi: "Σήμερα είναι Παρασκευή. Η προσευχή της Παρασκευής τελείται την ώρα της Δουχρ (αρχίζει {giris}).",
        suAnkiEk: ", τρέχουσα προσευχή",
        siradakiEk: ", επόμενη προσευχή"
    )

    // ku
    static let ku = TvArayuzMetinleri(
        sehrinizSecin: "Bajarê xwe hilbijêrin",
        ilMerkezi: "Demên nimêjê ji bo navenda parêzgehê têne hesabkirin. Hûn dikarin hilbijartina xwe paşê biguherînin.",
        ilSecErisim: "{il}, hilbijêrin",
        kalan: "Dema mayî heta {ad}",
        kalanErisim: "Dema mayî heta {ad}: {sure}",
        konumuDegistirin: "Cih biguherînin",
        kerahatSuruyor: "Dema mekrûh: {tur}, di {bitis} de diqede. {aciklama}",
        siradakiKerahat: "Dema mekrûh a din: {tur} {bas}–{bit}",
        cumaBilgisi: "Îro roja înê ye. Nimêja înê di dema Nîvro de tê kirin (di {giris} de dest pê dike).",
        suAnkiEk: ", nimêja niha",
        siradakiEk: ", nimêja din"
    )

    // tk
    static let tk = TvArayuzMetinleri(
        sehrinizSecin: "Şäheriňizi saýlaň",
        ilMerkezi: "Namaz wagtlary welaýat merkezi üçin hasaplanýar. Saýlawyňyzy soňra üýtgedip bilersiňiz.",
        ilSecErisim: "{il}, saýlaň",
        kalan: "{ad} wagtyna galan wagt",
        kalanErisim: "{ad} wagtyna galan wagt: {sure}",
        konumuDegistirin: "Ýerleşişi üýtgediň",
        kerahatSuruyor: "Mekruh wagt: {tur}, gutarýar {bitis}. {aciklama}",
        siradakiKerahat: "Indiki mekruh wagt: {tur} {bas}–{bit}",
        cumaBilgisi: "Şu gün anna. Juma namazy öýle wagtynda okalýar (girýär {giris}).",
        suAnkiEk: ", häzirki namaz",
        siradakiEk: ", indiki namaz"
    )

    // tt
    static let tt = TvArayuzMetinleri(
        sehrinizSecin: "Шәһәрегезне сайлагыз",
        ilMerkezi: "Намаз вакытлары өлкә үзәгенә карап исәпләнә. Сайлавыгызны соңрак үзгәртә аласыз.",
        ilSecErisim: "{il}, сайлау",
        kalan: "{ad} вакытына калган вакыт",
        kalanErisim: "{ad} вакытына калган вакыт: {sure}",
        konumuDegistirin: "Урынны үзгәртү",
        kerahatSuruyor: "Мәкруһ вакыт: {tur}, {bitis} бетә. {aciklama}",
        siradakiKerahat: "Чираттагы мәкруһ вакыт: {tur} {bas}–{bit}",
        cumaBilgisi: "Бүген җомга. Җомга намазы өйлә вакытында укыла (керүе {giris}).",
        suAnkiEk: ", хәзерге намаз",
        siradakiEk: ", чираттагы намаз"
    )

    // sd
    static let sd = TvArayuzMetinleri(
        sehrinizSecin: "پنهنجو شهر چونڊيو",
        ilMerkezi: "نماز جا وقت صوبي جي مرڪز لاءِ ڳڻيا وڃن ٿا. پنهنجي چونڊ پوءِ بدلائي سگهو ٿا.",
        ilSecErisim: "{il}، چونڊيو",
        kalan: "{ad} تائين باقي وقت",
        kalanErisim: "{ad} تائين باقي وقت: {sure}",
        konumuDegistirin: "جڳهه بدلايو",
        kerahatSuruyor: "مڪروه وقت: {tur}، پڄاڻي {bitis}. {aciklama}",
        siradakiKerahat: "ايندڙ مڪروه وقت: {tur} {bas}–{bit}",
        cumaBilgisi: "اڄ جمعو آهي. جمعي جي نماز ظهر جي وقت پڙهي ويندي آهي (شروع {giris}).",
        suAnkiEk: "، موجوده نماز",
        siradakiEk: "، ايندڙ نماز"
    )

    // pl
    static let pl = TvArayuzMetinleri(
        sehrinizSecin: "Wybierz miasto",
        ilMerkezi: "Czasy modlitw są obliczane dla centrum prowincji. Wybór możesz później zmienić.",
        ilSecErisim: "{il}, wybierz",
        kalan: "Pozostało do {ad}",
        kalanErisim: "Pozostało do {ad}: {sure}",
        konumuDegistirin: "Zmień lokalizację",
        kerahatSuruyor: "Czas niezalecany: {tur}, koniec {bitis}. {aciklama}",
        siradakiKerahat: "Następny czas niezalecany: {tur} {bas}–{bit}",
        cumaBilgisi: "Dziś jest piątek. Modlitwa piątkowa jest odprawiana w czasie Zuhr (początek {giris}).",
        suAnkiEk: ", bieżąca modlitwa",
        siradakiEk: ", następna modlitwa"
    )

    // ja
    static let ja = TvArayuzMetinleri(
        sehrinizSecin: "都市を選択してください",
        ilMerkezi: "礼拝時間は県の中心地で計算されます。選択は後から変更できます。",
        ilSecErisim: "{il}、選択",
        kalan: "{ad}までの残り時間",
        kalanErisim: "{ad}までの残り時間：{sure}",
        konumuDegistirin: "場所を変更",
        kerahatSuruyor: "礼拝が禁じられた時間：{tur}、{bitis}に終了。{aciklama}",
        siradakiKerahat: "次の礼拝が禁じられた時間：{tur} {bas}～{bit}",
        cumaBilgisi: "今日は金曜日です。金曜礼拝はズフルの時間に行います（{giris}に開始）。",
        suAnkiEk: "、現在の礼拝",
        siradakiEk: "、次の礼拝"
    )

    // gu — Gucaratça (beta): JS `sozluk/gu`
    static let gu = TvArayuzMetinleri(
        sehrinizSecin: "તમારું શહેર પસંદ કરો",
        ilMerkezi: "નમાઝના સમય પ્રાંતના મુખ્ય શહેર માટે ગણાય છે. તમે તમારી પસંદગી પછીથી બદલી શકો છો.",
        ilSecErisim: "{il}, પસંદ કરો",
        kalan: "{ad} સુધી બાકી સમય",
        kalanErisim: "{ad} સુધી બાકી સમય: {sure}",
        konumuDegistirin: "લોકેશન બદલો",
        kerahatSuruyor: "મકરૂહ સમય: {tur}, અંત {bitis}. {aciklama}",
        siradakiKerahat: "આગામી મકરૂહ સમય: {tur} {bas}–{bit}",
        cumaBilgisi: "આજે શુક્રવાર છે. જુમ્મા ઝોહરના સમયે પઢાય છે (શરૂ {giris}).",
        suAnkiEk: ", હાલની નમાઝ",
        siradakiEk: ", આગામી નમાઝ"
    )

    // bg
    static let bg = TvArayuzMetinleri(
        sehrinizSecin: "Изберете града си",
        ilMerkezi: "Времената за намаз се изчисляват за центъра на областта. Можете да промените избора си по-късно.",
        ilSecErisim: "{il}, изберете",
        kalan: "Оставащо време до {ad}",
        kalanErisim: "Оставащо време до {ad}: {sure}",
        konumuDegistirin: "Сменете местоположението",
        kerahatSuruyor: "Нежелано време: {tur}, до {bitis}. {aciklama}",
        siradakiKerahat: "Следващо нежелано време: {tur} {bas}–{bit}",
        cumaBilgisi: "Днес е петък. Джума намазът се изпълнява във времето за Обяд (започва в {giris}).",
        suAnkiEk: ", текущ намаз",
        siradakiEk: ", следващ намаз"
    )

    // mk
    static let mk = TvArayuzMetinleri(
        sehrinizSecin: "Изберете го вашиот град",
        ilMerkezi: "Времињата се пресметуваат за средиштето на покраината. Изборот можете да го промените подоцна.",
        ilSecErisim: "{il}, изберете",
        kalan: "До намазот: {ad}",
        kalanErisim: "{ad}: уште {sure}",
        konumuDegistirin: "Променете ја локацијата",
        kerahatSuruyor: "Мекрух време: {tur}, истекува во {bitis}. {aciklama}",
        siradakiKerahat: "Следно мекрух време: {tur} {bas}–{bit}",
        cumaBilgisi: "Денес е петок. Џума-намазот се клања во времето на пладне-намазот (настапува во {giris}).",
        suAnkiEk: ", тековен намаз",
        siradakiEk: ", следен намаз"
    )

    // fil
    static let fil = TvArayuzMetinleri(
        sehrinizSecin: "Pumili ng lungsod",
        ilMerkezi: "Kinakalkula ang mga oras ng dasal para sa sentro ng lalawigan. Mababago ninyo ang pinili mamaya.",
        ilSecErisim: "{il}, piliin",
        kalan: "Natitirang oras bago ang {ad}",
        kalanErisim: "Natitirang oras bago ang {ad}: {sure}",
        konumuDegistirin: "Palitan ang lokasyon",
        kerahatSuruyor: "Makruh na oras: {tur}, matatapos {bitis}. {aciklama}",
        siradakiKerahat: "Susunod na makruh na oras: {tur} {bas}–{bit}",
        cumaBilgisi: "Biyernes ngayon. Idinadasal ang Jumu'ah sa oras ng Dhuhr (magsisimula {giris}).",
        suAnkiEk: ", kasalukuyang dasal",
        siradakiEk: ", susunod na dasal"
    )

    // te
    static let te = TvArayuzMetinleri(
        sehrinizSecin: "మీ నగరాన్ని ఎంచుకోండి",
        ilMerkezi: "నమాజ్ సమయాలు ప్రావిన్స్ కేంద్రం కోసం లెక్కించబడతాయి. మీ ఎంపికను తర్వాత మార్చవచ్చు.",
        ilSecErisim: "{il}, ఎంచుకోండి",
        kalan: "{ad} వరకు మిగిలిన సమయం",
        kalanErisim: "{ad} వరకు మిగిలిన సమయం: {sure}",
        konumuDegistirin: "లొకేషన్ మార్చండి",
        kerahatSuruyor: "మక్రూహ్ సమయం: {tur}, {bitis}కి ముగుస్తుంది. {aciklama}",
        siradakiKerahat: "తదుపరి మక్రూహ్ సమయం: {tur} {bas}–{bit}",
        cumaBilgisi: "ఈ రోజు శుక్రవారం. జుమా జుహ్ర్ సమయంలో ఆచరించబడుతుంది ({giris}కి ప్రారంభమవుతుంది).",
        suAnkiEk: ", ప్రస్తుత నమాజ్",
        siradakiEk: ", తదుపరి నమాజ్"
    )

    // ÇEVİRİ: kn
    static let kn = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )

    // mr
    static let mr = TvArayuzMetinleri(
        sehrinizSecin: "तुमचे शहर निवडा",
        ilMerkezi: "नमाजच्या वेळा प्रांताच्या मध्यासाठी मोजल्या जातात. तुम्ही तुमची निवड नंतर बदलू शकता.",
        ilSecErisim: "{il}, निवडा",
        kalan: "{ad} पर्यंत उरलेला वेळ",
        kalanErisim: "{ad} पर्यंत उरलेला वेळ: {sure}",
        konumuDegistirin: "स्थान बदला",
        kerahatSuruyor: "मकरूह वेळ: {tur}, {bitis} ला संपेल. {aciklama}",
        siradakiKerahat: "पुढील मकरूह वेळ: {tur} {bas}–{bit}",
        cumaBilgisi: "आज शुक्रवार आहे. जुमाची नमाज जोहरच्या वेळी अदा केली जाते ({giris} ला सुरू).",
        suAnkiEk: ", सध्याची नमाज",
        siradakiEk: ", पुढील नमाज"
    )

    // pa (yalnız Şahmuki; terimler src/core/dil/sozluk/pa)
    static let pa = TvArayuzMetinleri(
        sehrinizSecin: "اپنا شہر چُنو",
        ilMerkezi: "نماز دے وقت صوبے دے مرکزی شہر دے مطابق کڈھے جاندے نیں۔ اپنی چون بعد وچ بدلی جا سکدی اے۔",
        ilSecErisim: "{il}، چُنو",
        kalan: "{ad} تک باقی وقت",
        kalanErisim: "{ad} تک باقی وقت: {sure}",
        konumuDegistirin: "مقام بدلو",
        kerahatSuruyor: "مکروہ وقت: {tur}، اختتام {bitis}۔ {aciklama}",
        siradakiKerahat: "اگلا مکروہ وقت: {tur} {bas}–{bit}",
        cumaBilgisi: "اج جمعہ اے۔ جمعہ دی نماز ظہر دے وقت وچ ادا کیتی جاندی اے (آغاز {giris})۔",
        suAnkiEk: "، موجودہ نماز",
        siradakiEk: "، اگلی نماز"
    )

    // ÇEVİRİ: as
    static let `as` = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )

    // ne
    static let ne = TvArayuzMetinleri(
        sehrinizSecin: "आफ्नो सहर छान्नुहोस्",
        ilMerkezi: "नमाजका समय प्रान्तको केन्द्रका लागि गणना हुन्छन्। आफ्नो छनोट पछि बदल्न सक्नुहुन्छ।",
        ilSecErisim: "{il}, छान्नुहोस्",
        kalan: "{ad}सम्म बाँकी समय",
        kalanErisim: "{ad}सम्म बाँकी समय: {sure}",
        konumuDegistirin: "लोकेसन बदल्नुहोस्",
        kerahatSuruyor: "मकरुह समय: {tur}, {bitis} मा सकिन्छ। {aciklama}",
        siradakiKerahat: "अर्को मकरुह समय: {tur} {bas}–{bit}",
        cumaBilgisi: "आज शुक्रबार हो। जुमा नमाज जुहरको समयमा पढिन्छ ({giris} मा सुरु)।",
        suAnkiEk: ", हालको नमाज",
        siradakiEk: ", अर्को नमाज"
    )

    // ÇEVİRİ: si
    static let si = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )

    // ÇEVİRİ: km
    static let km = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )

    static let tablo: [String: TvArayuzMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
        "sw": sw, "ha": ha, "am": am, "om": om, "so": so, "ff": ff, "yo": yo,
        "zh": zh, "ta": ta, "ml": ml, "th": th, "ko": ko, "vi": vi,
        "pt": pt, "it": it, "sv": sv, "uk": uk, "ro": ro, "hr": hr, "sr": sr, "el": el,
        "ku": ku, "tk": tk, "tt": tt, "sd": sd, "pl": pl, "ja": ja, "gu": gu, "bg": bg, "mk": mk,
        "fil": fil, "te": te, "kn": kn, "mr": mr, "pa": pa, "as": `as`, "ne": ne, "si": si, "km": km,
    ]

    static func dil(_ kod: String) -> TvArayuzMetinleri { tablo[TvDili.coz(kod)] ?? tr }
}

struct TvKokGorunumu: View {
    @AppStorage("il_plaka") private var plaka: String = ""
    private let iller: [TvIl] = {
        guard let yol = Bundle.main.url(forResource: "iller", withExtension: "json"),
              let veri = try? Data(contentsOf: yol) else { return [] }
        return TvIlListesi.coz(veri)
    }()

    var body: some View {
        Group {
            if let il = TvIlListesi.bul(iller, plaka.isEmpty ? nil : plaka) {
                TvPanoGorunumu(il: il) { plaka = "" }
            } else {
                TvIlSecimGorunumu(iller: iller) { plaka = $0.plaka }
            }
        }
        .background(TvRenk.arkaplan.ignoresSafeArea())
        .preferredColorScheme(.dark)
    }
}

/// Il secimi: D-pad ile odaklanan liste. Konum donanimi olmadigi icin il merkezi kullanilir.
struct TvIlSecimGorunumu: View {
    let iller: [TvIl]
    let secildi: (TvIl) -> Void
    private let m = TvMetin(dil: TvDili.cihaz)

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text(m.sehrinizSecin)
                .font(.system(size: 52, weight: .semibold))
                .foregroundColor(TvRenk.metin)
            Text(m.ilMerkezi)
                .font(.system(size: 28))
                .foregroundColor(TvRenk.metinIkincil)
            ScrollView {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 24), count: 4), spacing: 24) {
                    ForEach(iller) { il in
                        Button {
                            secildi(il)
                        } label: {
                            Text(il.ad)
                                .font(.system(size: 30))
                                .frame(maxWidth: .infinity, minHeight: 72)
                        }
                        .accessibilityLabel(m.ilSecErisim(il.ad))
                    }
                }
                .padding(.vertical, 24)
            }
        }
        .padding(.horizontal, 80)
        .padding(.vertical, 54)
    }
}

/// Pano: solda saat, geri sayim ve bilgi serit; sagda alti vakit.
struct TvPanoGorunumu: View {
    let il: TvIl
    let konumuDegistir: () -> Void
    private let bolge = TimeZone.current
    /// Cihaz dili (W5); ay/gun, vakit ve kerahat adlari da bu dilde.
    private let dil = TvDili.cihaz
    private var m: TvMetin { TvMetin(dil: dil) }

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { baglam in
            let simdi = Int64(baglam.date.timeIntervalSince1970 * 1000)
            let durum = TvPanoHesabi.hesapla(simdiMs: simdi, bolge: bolge) { tarih in
                TvVakitOnbellegi.paylasilan.al(il: il, tarih: tarih)
            }
            let ofset = TvKaydirma.ofset(simdi)
            HStack(alignment: .top, spacing: 60) {
                solSutun(durum: durum, simdi: simdi)
                    .frame(maxWidth: .infinity, alignment: .leading)
                vakitListesi(durum: durum)
                    .frame(maxWidth: .infinity)
            }
            .offset(x: CGFloat(ofset.0), y: CGFloat(ofset.1))
            // TV tasma (overscan) guvenli alani.
            .padding(.horizontal, 80)
            .padding(.vertical, 54)
        }
        // Pano saatlerce acik durur; yalniz bu ekranda ekran kapanmaz.
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { UIApplication.shared.isIdleTimerDisabled = false }
    }

    @ViewBuilder
    private func solSutun(durum: TvPanoDurumu, simdi: Int64) -> some View {
        VStack(alignment: .leading, spacing: 28) {
            VStack(alignment: .leading, spacing: 6) {
                Text(il.ad).font(.system(size: 46, weight: .semibold)).foregroundColor(TvRenk.metin)
                Text(TvBicim.tarih(durum.tarih, dil: dil)).font(.system(size: 30)).foregroundColor(TvRenk.metinIkincil)
            }
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Text(TvBicim.saat(simdi, bolge))
                    .font(.system(size: 190, weight: .light).monospacedDigit())
                    .foregroundColor(TvRenk.metin)
                Text(TvBicim.saniye(simdi, bolge))
                    .font(.system(size: 60).monospacedDigit())
                    .foregroundColor(TvRenk.metinIkincil)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(m.kalan(durum.gorunenAd(durum.siradaki, dil: dil)))
                    .font(.system(size: 32)).foregroundColor(TvRenk.metinIkincil)
                Text(TvBicim.geriSayim(durum.kalanMs))
                    .font(.system(size: 96, weight: .semibold).monospacedDigit())
                    .foregroundColor(TvRenk.metin)
                    .accessibilityLabel(m.kalanErisim(durum.gorunenAd(durum.siradaki, dil: dil), TvBicim.geriSayim(durum.kalanMs)))
            }
            bilgiSeridi(durum: durum)
            Spacer(minLength: 0)
            Button(action: konumuDegistir) {
                Label(m.konumuDegistirin, systemImage: "mappin.and.ellipse").font(.system(size: 26))
            }
        }
    }

    @ViewBuilder
    private func bilgiSeridi(durum: TvPanoDurumu) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let k = durum.kerahat {
                // Saate hal eki EKLENMEZ ("07:42'e" okunusa gore degisir).
                bilgiSatiri(TvRenk.uyari, m.kerahatSuruyor(k.tur.ad(dil), TvBicim.saat(k.bitis, bolge), k.tur.aciklama(dil)))
            } else if let s = durum.siradakiKerahat {
                bilgiSatiri(TvRenk.sinir, m.siradakiKerahat(s.tur.ad(dil), TvBicim.saat(s.baslangic, bolge), TvBicim.saat(s.bitis, bolge)))
            }
            if durum.cuma {
                bilgiSatiri(TvRenk.birincil, m.cumaBilgisi(TvBicim.saat(durum.vakitler.ogle, bolge)))
            }
        }
    }

    private func bilgiSatiri(_ renk: Color, _ metin: String) -> some View {
        HStack(spacing: 16) {
            Circle().fill(renk).frame(width: 16, height: 16)
            Text(metin).font(.system(size: 26)).foregroundColor(TvRenk.metin).lineLimit(2)
        }
    }

    @ViewBuilder
    private func vakitListesi(durum: TvPanoDurumu) -> some View {
        VStack(spacing: 14) {
            ForEach(TvVakit.allCases, id: \.self) { vakit in
                let aktif = vakit == durum.aktif
                let siradaki = vakit == durum.siradaki && durum.siradakiMs == durum.vakitler.saat(vakit)
                HStack {
                    Text(durum.gorunenAd(vakit, dil: dil))
                        .font(.system(size: 44, weight: aktif ? .bold : .regular))
                    Spacer()
                    Text(TvBicim.saat(durum.vakitler.saat(vakit), bolge))
                        .font(.system(size: 50, weight: aktif ? .bold : .medium).monospacedDigit())
                }
                .foregroundColor(TvRenk.metin)
                .padding(.horizontal, 36)
                .frame(height: 104)
                .background(RoundedRectangle(cornerRadius: 24).fill(aktif ? TvRenk.birincilKoyu : TvRenk.kart))
                .overlay(RoundedRectangle(cornerRadius: 24).stroke(siradaki ? TvRenk.birincil : .clear, lineWidth: 3))
                .accessibilityElement(children: .combine)
                .accessibilityLabel(
                    "\(durum.gorunenAd(vakit, dil: dil)) \(TvBicim.saat(durum.vakitler.saat(vakit), bolge))"
                        + (aktif ? m.suAnkiEk : "") + (siradaki ? m.siradakiEk : "")
                )
            }
        }
        .frame(maxHeight: .infinity)
    }
}

/// Gun bazinda vakit onbellegi: saniyelik cizim adhan hesabini her seferinde yapmasin.
final class TvVakitOnbellegi {
    static let paylasilan = TvVakitOnbellegi()
    private var harita: [String: TvGunlukVakitler] = [:]

    func al(il: TvIl, tarih: TvTarih) -> TvGunlukVakitler {
        let anahtar = "\(il.plaka)_\(tarih.iso)"
        if let v = harita[anahtar] { return v }
        if harita.count > 6 { harita.removeAll() }
        let v = TvVakitHesabi.hesapla(lat: il.lat, lng: il.lng, tarih: tarih)
        harita[anahtar] = v
        return v
    }
}
