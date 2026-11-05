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
        return .result(value: s.kalanDk, dialog: "\(SiriDili.rakam(OtomasyonMetni.kalanDakika(ad: s.ad, dakika: s.kalanDk, dil: dil)))")
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
/// de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo; cevrilmemis dil Ingilizcenin kopyasidir (`// ÇEVİRİ: <kod>`).
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


    // fr
    static let fr = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} commence dans {n} minute.", "many": "{ad} commence dans {n} de minutes.", "other": "{ad} commence dans {n} minutes."],
        evetKilindi: "Oui, elle est marquée comme accomplie.",
        hayirKilinmadi: "Non, elle n’est pas encore marquée."
    )


    // bs
    static let bs = OtomasyonMetinleri(
        kalanDakika: [
            "one": "{ad}: vakat nastupa za {n} minutu.",
            "few": "{ad}: vakat nastupa za {n} minute.",
            "other": "{ad}: vakat nastupa za {n} minuta.",
        ],
        evetKilindi: "Da, označeno je kao klanjano.",
        hayirKilinmadi: "Ne, još nije označeno."
    )


    // ru
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


    // ms
    static let ms = OtomasyonMetinleri(
        kalanDakika: ["one": "{n} minit lagi masuk waktu {ad}.", "other": "{n} minit lagi masuk waktu {ad}."],
        evetKilindi: "Ya, sudah ditandakan sebagai ditunaikan.",
        hayirKilinmadi: "Tidak, belum ditandakan."
    )


    // ar — Arapça (beta): JS `sozluk/ar` (sure.dakika, vakit.eylem); 3–10 çoğul, diğerleri rakamla tekil
    static let ar = OtomasyonMetinleri(
        kalanDakika: [
            "zero": "يدخل وقت {ad} بعد {n} دقيقة.",
            "one": "يدخل وقت {ad} بعد {n} دقيقة.",
            "two": "يدخل وقت {ad} بعد {n} دقيقة.",
            "few": "يدخل وقت {ad} بعد {n} دقائق.",
            "many": "يدخل وقت {ad} بعد {n} دقيقة.",
            "other": "يدخل وقت {ad} بعد {n} دقيقة.",
        ],
        evetKilindi: "نعم، معلَّمة «تمّت».",
        hayirKilinmadi: "لا، لم تُوضع العلامة بعد."
    )


    // ur
    static let ur = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} کا وقت {n} منٹ میں شروع ہوگا۔", "other": "{ad} کا وقت {n} منٹ میں شروع ہوگا۔"],
        evetKilindi: "ہاں، اس پر ادا شدہ کا نشان لگا ہے۔",
        hayirKilinmadi: "نہیں، ابھی نشان نہیں لگا۔"
    )

    // es — İspanyolca (beta); CLDR es one/other/many (many = milyonlar, "{n} de minutos")
    static let es = OtomasyonMetinleri(
        kalanDakika: ["one": "Falta {n} minuto para {ad}.", "other": "Faltan {n} minutos para {ad}.", "many": "Faltan {n} de minutos para {ad}."],
        evetKilindi: "Sí, está marcado como rezado.",
        hayirKilinmadi: "No, aún no está marcado."
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl` (CLDR one/other)
    static let nl = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} begint over {n} minuut.", "other": "{ad} begint over {n} minuten."],
        evetKilindi: "Ja, het is als gebeden gemarkeerd.",
        hayirKilinmadi: "Nee, het is nog niet gemarkeerd."
    )

    // sq — Arnavutça (beta): JS `sozluk/sq` (vakit adı yalın hâlde, iki nokta ile)
    static let sq = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad}: hyn pas {n} minute.", "other": "{ad}: hyn pas {n} minutash."],
        evetKilindi: "Po, është shënuar si i falur.",
        hayirKilinmadi: "Jo, ende nuk është shënuar."
    )

    // hi
    static let hi = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} का वक़्त {n} मिनट में शुरू होगा।", "other": "{ad} का वक़्त {n} मिनट में शुरू होगा।"],
        evetKilindi: "हाँ, इस पर \"पढ़ ली गई\" का निशान लगा है।",
        hayirKilinmadi: "नहीं, अभी निशान नहीं लगा।"
    )

    // bn — Bengalce (beta); CLDR one = 0 ve 1, other (Bengalcede isim çekimlenmez)
    static let bn = OtomasyonMetinleri(
        kalanDakika: ["one": "{n} মিনিট পর {ad} শুরু হবে।", "other": "{n} মিনিট পর {ad} শুরু হবে।"],
        evetKilindi: "হ্যাঁ, পড়া হয়েছে হিসেবে চিহ্নিত আছে।",
        hayirKilinmadi: "না, এখনো চিহ্নিত হয়নি।"
    )

    // fa — Farsça (beta): JS `sozluk/fa`; CLDR fa one = 0 ve 1, sayıdan sonra ad tekil (one = other)
    static let fa = OtomasyonMetinleri(
        kalanDakika: ["one": "{n} دقیقه تا وقت {ad} مانده است.", "other": "{n} دقیقه تا وقت {ad} مانده است."],
        evetKilindi: "بله، خوانده‌شده علامت خورده است.",
        hayirKilinmadi: "نه، هنوز علامت نخورده است."
    )

    // ps — Peştuca (beta): JS sozluk/ps (sure.dakika one/other)
    static let ps = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} په {n} دقیقه کې پیلېږي.", "other": "{ad} په {n} دقیقو کې پیلېږي."],
        evetKilindi: "هو، د ادا شوي په توګه نښه شوی.",
        hayirKilinmadi: "نه، لا نښه شوی نه دی."
    )

    // ckb
    static let ckb = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} دوای {n} خولەک دەست پێدەکات.", "other": "{ad} دوای {n} خولەک دەست پێدەکات."],
        evetKilindi: "بەڵێ، وەک کراو نیشانە کراوە.",
        hayirKilinmadi: "نەخێر، ھێشتا نیشانە نەکراوە."
    )

    // ug — Uygurca (beta); CLDR ug one/other (sayıdan sonra çoğul eki yok)
    static let ug = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} ۋاقتىنىڭ كىرىشىگە {n} مىنۇت بار.", "other": "{ad} ۋاقتىنىڭ كىرىشىگە {n} مىنۇت بار."],
        evetKilindi: "ھەئە، ئوقۇلدى دەپ بەلگىلەنگەن.",
        hayirKilinmadi: "ياق، تېخى بەلگىلەنمىگەن."
    )

    // az — Azerice (beta); CLDR one/other, sayıdan sonra isim tekil
    static let az = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} vaxtına {n} dəqiqə qalıb.", "other": "{ad} vaxtına {n} dəqiqə qalıb."],
        evetKilindi: "Bəli, qılındı kimi qeyd olunub.",
        hayirKilinmadi: "Xeyr, hələ qeyd olunmayıb."
    )

    // uz — Özbekçe (beta, LATİN); JS `sozluk/uz` (sayıdan sonra çoğul eki yok)
    static let uz = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} kirishiga {n} daqiqa qoldi.", "other": "{ad} kirishiga {n} daqiqa qoldi."],
        evetKilindi: "Ha, oʻqildi deb belgilangan.",
        hayirKilinmadi: "Yoʻq, hali belgilanmagan."
    )

    // kk — Kazakca (beta, Kiril); sayidan sonra isim cogul eki almaz
    static let kk = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} уақытына {n} минут қалды.", "other": "{ad} уақытына {n} минут қалды."],
        evetKilindi: "Иә, оқылды деп белгіленген.",
        hayirKilinmadi: "Жоқ, әлі белгіленбеген."
    )

    // ky
    static let ky = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} убактысына {n} мүнөт калды.", "other": "{ad} убактысына {n} мүнөт калды."],
        evetKilindi: "Ооба, ал окулду деп белгиленген.",
        hayirKilinmadi: "Жок, ал азырынча белгилене элек."
    )

    // tg — Tacikçe (beta): JS `sozluk/tg`; CLDR tg one/other, sayıdan sonra ad tekil (one = other)
    static let tg = OtomasyonMetinleri(
        kalanDakika: ["one": "То вақти {ad} {n} дақиқа монд.", "other": "То вақти {ad} {n} дақиқа монд."],
        evetKilindi: "Ҳа, ҳамчун хондашуда қайд шудааст.",
        hayirKilinmadi: "Не, ҳанӯз қайд нашудааст."
    )

    // sw — Svahili (beta): JS `sozluk/sw`; CLDR sw one/other (ad sayıdan önce, one = other)
    static let sw = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} inaingia baada ya dakika {n}.", "other": "{ad} inaingia baada ya dakika {n}."],
        evetKilindi: "Ndiyo, imewekwa alama imeswaliwa.",
        hayirKilinmadi: "Hapana, bado haijawekwa alama."
    )

    // ha — Hausa (beta): JS `sozluk/ha`; CLDR ha one/other, sayı addan sonra, ad çekilmez (one = other)
    static let ha = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} za ta yi cikin minti {n}.", "other": "{ad} za ta yi cikin minti {n}."],
        evetKilindi: "Ee, an yi mata alama an yi ta.",
        hayirKilinmadi: "Aʼa, ba a yi mata alama ba tukuna."
    )

    // am — Amharca (beta); one = 0 ve 1, sayıdan sonra ad tekil
    static let am = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} ከ{n} ደቂቃ በኋላ ይገባል።", "other": "{ad} ከ{n} ደቂቃ በኋላ ይገባል።"],
        evetKilindi: "አዎ፣ እንደተሰገደ ምልክት ተደርጓል።",
        hayirKilinmadi: "አይ፣ ገና ምልክት አልተደረገበትም።"
    )

    // om — JS `sozluk/om`; CLDR om one/other, rakamla yazılınca ad tekil (one = other)
    static let om = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} daqiiqaa {n} booda jalqaba.", "other": "{ad} daqiiqaa {n} booda jalqaba."],
        evetKilindi: "Eeyyee, akka salaatameetti mallattaa'eera.",
        hayirKilinmadi: "Lakki, ammallee hin mallattoofne."
    )

    // so
    static let so = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} wuxuu bilaabmayaa {n} daqiiqo kadib.", "other": "{ad} wuxuu bilaabmayaa {n} daqiiqo kadib."],
        evetKilindi: "Haa, waxaa lagu calaamadeeyay la tukaday.",
        hayirKilinmadi: "Maya, weli lama calaamadeyn."
    )

    // ff
    static let ff = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} fuɗɗoto caggal {n} hojom.", "other": "{ad} fuɗɗoto caggal {n} hojomaaji."],
        evetKilindi: "Awa, maandinaama ko juulaama.",
        hayirKilinmadi: "Aa’a, maandinaaka tawo."
    )

    // yo
    static let yo = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} yóò bẹ̀rẹ̀ lẹ́yìn ìṣẹ́jú {n}.", "other": "{ad} yóò bẹ̀rẹ̀ lẹ́yìn ìṣẹ́jú {n}."],
        evetKilindi: "Bẹ́ẹ̀ ni, a ti sàmì sí i pé ẹ ti kí i.",
        hayirKilinmadi: "Bẹ́ẹ̀ kọ́, a kò tíì sàmì sí i."
    )

    // zh
    static let zh = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad}将在{n}分钟后开始。"],
        evetKilindi: "是，已标记为已礼拜。",
        hayirKilinmadi: "否，尚未标记。"
    )

    // ta
    static let ta = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} தொடங்க {n} நிமிடம் உள்ளது.", "other": "{ad} தொடங்க {n} நிமிடங்கள் உள்ளன."],
        evetKilindi: "ஆம், தொழுததாகக் குறிக்கப்பட்டுள்ளது.",
        hayirKilinmadi: "இல்லை, இன்னும் குறிக்கப்படவில்லை."
    )

    // ml — Malayalamca (beta): JS `sozluk/ml`
    static let ml = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} {n} മിനിറ്റിനുള്ളിൽ തുടങ്ങും.", "other": "{ad} {n} മിനിറ്റിനുള്ളിൽ തുടങ്ങും."],
        evetKilindi: "അതെ, നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തിയിട്ടുണ്ട്.",
        hayirKilinmadi: "ഇല്ല, ഇതുവരെ അടയാളപ്പെടുത്തിയിട്ടില്ല."
    )

    // th (CLDR yalnız other; "one" anahtarı aynı kalıp)
    static let th = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad}จะเข้าเวลาในอีก {n} นาที", "other": "{ad}จะเข้าเวลาในอีก {n} นาที"],
        evetKilindi: "ใช่ ทำเครื่องหมายว่าละหมาดแล้ว",
        hayirKilinmadi: "ไม่ ยังไม่ได้ทำเครื่องหมาย"
    )

    // ko (CLDR yalnız other)
    static let ko = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} 예배가 {n}분 뒤에 시작합니다."],
        evetKilindi: "예, 완료로 표시되어 있습니다.",
        hayirKilinmadi: "아니요, 아직 표시되지 않았습니다."
    )

    // vi (CLDR yalnız other; "one" anahtarı aynı kalıpla dolu)
    static let vi = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} bắt đầu sau {n} phút.", "other": "{ad} bắt đầu sau {n} phút."],
        evetKilindi: "Có, đã được đánh dấu là đã hành lễ.",
        hayirKilinmadi: "Không, chưa được đánh dấu."
    )

    // pt (one/many/other)
    static let pt = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} começa dentro de {n} minuto.", "many": "{ad} começa dentro de {n} de minutos.", "other": "{ad} começa dentro de {n} minutos."],
        evetKilindi: "Sim, está marcada como rezada.",
        hayirKilinmadi: "Não, ainda não está marcada."
    )

    // it (one/many/other; many = milyonlar, "{n} di minuti")
    static let it = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} inizia tra {n} minuto.", "many": "{ad} inizia tra {n} di minuti.", "other": "{ad} inizia tra {n} minuti."],
        evetKilindi: "Sì, è segnata come compiuta.",
        hayirKilinmadi: "No, non è ancora segnata."
    )

    // sv (one/other)
    static let sv = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} börjar om {n} minut.", "other": "{ad} börjar om {n} minuter."],
        evetKilindi: "Ja, den är markerad som förrättad.",
        hayirKilinmadi: "Nej, den är inte markerad än."
    )

    // uk (one/few/many/other)
    static let uk = OtomasyonMetinleri(
        kalanDakika: [
            "one": "Час молитви {ad} настане через {n} хвилину.",
            "few": "Час молитви {ad} настане через {n} хвилини.",
            "many": "Час молитви {ad} настане через {n} хвилин.",
            "other": "Час молитви {ad} настане через {n} хвилини.",
        ],
        evetKilindi: "Так, її позначено як здійснену.",
        hayirKilinmadi: "Ні, її ще не позначено."
    )

    // ro (one/few/other; other "de" ile)
    static let ro = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} începe peste {n} minut.", "few": "{ad} începe peste {n} minute.", "other": "{ad} începe peste {n} de minute."],
        evetKilindi: "Da, este marcată ca efectuată.",
        hayirKilinmadi: "Nu, încă nu este marcată."
    )

    // hr (one/few/other)
    static let hr = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} počinje za {n} minutu.", "few": "{ad} počinje za {n} minute.", "other": "{ad} počinje za {n} minuta."],
        evetKilindi: "Da, označeno je kao klanjano.",
        hayirKilinmadi: "Ne, još nije označeno."
    )

    // sr (one/few/other)
    static let sr = OtomasyonMetinleri(
        kalanDakika: [
            "one": "{ad}: време наступа за {n} минут.",
            "few": "{ad}: време наступа за {n} минута.",
            "other": "{ad}: време наступа за {n} минута.",
        ],
        evetKilindi: "Да, означено је као клањано.",
        hayirKilinmadi: "Не, још није означено."
    )

    // el (one/other)
    static let el = OtomasyonMetinleri(
        kalanDakika: ["one": "Η {ad} αρχίζει σε {n} λεπτό.", "other": "Η {ad} αρχίζει σε {n} λεπτά."],
        evetKilindi: "Ναι, έχει σημειωθεί ως τελεσμένη.",
        hayirKilinmadi: "Όχι, δεν έχει σημειωθεί ακόμη."
    )

    // ku (one/other)
    static let ku = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} piştî {n} deqîqeyê dest pê dike.", "other": "{ad} piştî {n} deqîqeyan dest pê dike."],
        evetKilindi: "Erê, wekî kirî hatiye nîşankirin.",
        hayirKilinmadi: "Na, hîn nehatiye nîşankirin."
    )

    // tk (one/other; san bilen at ýeke sanda)
    static let tk = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} wagty {n} minutdan girýär.", "other": "{ad} wagty {n} minutdan girýär."],
        evetKilindi: "Hawa, okaldy diýip bellenen.",
        hayirKilinmadi: "Ýok, entek bellenmedi."
    )

    // tt (other)
    static let tt = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} вакыты {n} минуттан керә."],
        evetKilindi: "Әйе, укылды дип билгеләнгән.",
        hayirKilinmadi: "Юк, әле билгеләнмәгән."
    )

    // sd (one/other)
    static let sd = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} جو وقت {n} منٽ ۾ شروع ٿيندو.", "other": "{ad} جو وقت {n} منٽن ۾ شروع ٿيندو."],
        evetKilindi: "ها، ان تي پڙهي وئي جو نشان لڳل آهي.",
        hayirKilinmadi: "نه، اڃا نشان نه لڳو آهي."
    )

    // pl (one/few/many/other)
    static let pl = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} zaczyna się za {n} minutę.", "few": "{ad} zaczyna się za {n} minuty.", "many": "{ad} zaczyna się za {n} minut.", "other": "{ad} zaczyna się za {n} minuty."],
        evetKilindi: "Tak, jest oznaczona jako odprawiona.",
        hayirKilinmadi: "Nie, jeszcze nie jest oznaczona."
    )

    // ja (other)
    static let ja = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad}はあと{n}分で始まります。"],
        evetKilindi: "はい、礼拝済みです。",
        hayirKilinmadi: "いいえ、まだ記録されていません。"
    )

    // gu (one = 0 ve 1, one = other)
    static let gu = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} {n} મિનિટમાં શરૂ થશે.", "other": "{ad} {n} મિનિટમાં શરૂ થશે."],
        evetKilindi: "હા, પઢી લીધી તરીકે નોંધાયેલી છે.",
        hayirKilinmadi: "ના, હજુ નોંધાઈ નથી."
    )

    // bg (one/other)
    static let bg = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} започва след {n} минута.", "other": "{ad} започва след {n} минути."],
        evetKilindi: "Да, отбелязан е като изпълнен.",
        hayirKilinmadi: "Не, още не е отбелязан."
    )

    // mk (one/other)
    static let mk = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad}: времето настапува за {n} минута.", "other": "{ad}: времето настапува за {n} минути."],
        evetKilindi: "Да, означено е како клањано.",
        hayirKilinmadi: "Не, сѐ уште не е означено."
    )

    // fil (one/other)
    static let fil = OtomasyonMetinleri(
        kalanDakika: ["one": "Magsisimula ang {ad} sa loob ng {n} minuto.", "other": "Magsisimula ang {ad} sa loob ng {n} minuto."],
        evetKilindi: "Oo, namarkahang naidasal na ito.",
        hayirKilinmadi: "Hindi, hindi pa ito namamarkahan."
    )

    // te (one/other)
    static let te = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} ప్రారంభానికి {n} నిమిషం ఉంది.", "other": "{ad} ప్రారంభానికి {n} నిమిషాలు ఉన్నాయి."],
        evetKilindi: "అవును, ఆచరించినట్లు గుర్తించబడింది.",
        hayirKilinmadi: "కాదు, ఇంకా గుర్తించబడలేదు."
    )

    // kn (one = 0 ve 1, other; sayıyla ad tekil kalır → one = other)
    static let kn = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} ಸಮಯ {n} ನಿಮಿಷದಲ್ಲಿ ಆರಂಭವಾಗುತ್ತದೆ.", "other": "{ad} ಸಮಯ {n} ನಿಮಿಷದಲ್ಲಿ ಆರಂಭವಾಗುತ್ತದೆ."],
        evetKilindi: "ಹೌದು, ನಿರ್ವಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.",
        hayirKilinmadi: "ಇಲ್ಲ, ಇನ್ನೂ ಗುರುತಿಸಲಾಗಿಲ್ಲ."
    )

    // mr (one/other)
    static let mr = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} {n} मिनिटात सुरू होईल.", "other": "{ad} {n} मिनिटांत सुरू होईल."],
        evetKilindi: "होय, \"अदा झाली\" म्हणून नोंदवलेली आहे.",
        hayirKilinmadi: "नाही, अजून नोंद झालेली नाही."
    )

    // pa (one = 0 ve 1, one = other; Şahmuki)
    static let pa = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} دا وقت {n} منٹ وچ شروع ہووے گا۔", "other": "{ad} دا وقت {n} منٹ وچ شروع ہووے گا۔"],
        evetKilindi: "ہاں، ایہدے تے ادا ہو گئی دا نشان لگیا اے۔",
        hayirKilinmadi: "نہیں، اجے نشان نہیں لگیا۔"
    )

    // as (one = 0 ve 1, other; ikisi aynı biçim)
    static let `as` = OtomasyonMetinleri(
        kalanDakika: ["one": "{n} মিনিটৰ পিছত {ad} আৰম্ভ হ’ব।", "other": "{n} মিনিটৰ পিছত {ad} আৰম্ভ হ’ব।"],
        evetKilindi: "হয়, পঢ়া হ’ল বুলি চিহ্নিত কৰা আছে।",
        hayirKilinmadi: "নহয়, এতিয়াও চিহ্নিত কৰা হোৱা নাই।"
    )

    // ne (one/other; sayıdan sonra isim çekimlenmez)
    static let ne = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} सुरु हुन {n} मिनेट बाँकी छ।", "other": "{ad} सुरु हुन {n} मिनेट बाँकी छ।"],
        evetKilindi: "हो, \"पढियो\" चिन्ह लगाइएको छ।",
        hayirKilinmadi: "होइन, अझै चिन्ह लगाइएको छैन।"
    )

    // si (one = 0, 1 / other; iki kategori aynı kalıp)
    static let si = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} මිනිත්තු {n}කින් ආරම්භ වේ.", "other": "{ad} මිනිත්තු {n}කින් ආරම්භ වේ."],
        evetKilindi: "ඔව්, එය ඉටු කළ බව සලකුණු කර ඇත.",
        hayirKilinmadi: "නැත, එය තවම සලකුණු කර නැත."
    )

    // km (other)
    static let km = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} នឹងចូលក្នុងរយៈ {n} នាទីទៀត។"],
        evetKilindi: "មែន វាត្រូវបានសម្គាល់ថាបានសឡាតហើយ។",
        hayirKilinmadi: "ទេ វាមិនទាន់ត្រូវបានសម្គាល់ទេ។"
    )

    // he (one/two/other)
    static let he = OtomasyonMetinleri(
        kalanDakika: ["one": "זמן {ad} מתחיל בעוד {n} דקה.", "two": "זמן {ad} מתחיל בעוד {n} דקות.", "other": "זמן {ad} מתחיל בעוד {n} דקות."],
        evetKilindi: "כן, היא מסומנת כבוצעה.",
        hayirKilinmadi: "לא, היא עוד לא סומנה."
    )

    // ka (one/other; sayıdan sonra isim tekil, iki kategori aynı kalıp)
    static let ka = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} იწყება {n} წუთში.", "other": "{ad} იწყება {n} წუთში."],
        evetKilindi: "დიახ, მონიშნულია შესრულებულად.",
        hayirKilinmadi: "არა, ჯერ არ არის მონიშნული."
    )

    // ÇEVİRİ: lt (one/few/many/other)
    static let lt = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} begins in {n} minute.", "few": "{ad} begins in {n} minutes.", "many": "{ad} begins in {n} minutes.", "other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // mg (one = 0 ve 1, other; ad çoğul eki almaz → one = other)
    static let mg = OtomasyonMetinleri(
        kalanDakika: ["one": "Manomboka afaka {n} minitra ny {ad}.", "other": "Manomboka afaka {n} minitra ny {ad}."],
        evetKilindi: "Eny, voamarika ho vita izy.",
        hayirKilinmadi: "Tsia, mbola tsy voamarika izy."
    )

    // lg — Luganda: JS `sozluk/lg`; CLDR lg one/other, sayı addan sonra (one = other)
    static let lg = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} etandika mu ddakiika {n}.", "other": "{ad} etandika mu ddakiika {n}."],
        evetKilindi: "Yee, eteereddwako akabonero nti esaaliddwa.",
        hayirKilinmadi: "Nedda, tennateekebwako kabonero."
    )

    // rw (other)
    static let rw = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} itangira mu minota {n}."],
        evetKilindi: "Yego, byemejwe ko yasaliwe.",
        hayirKilinmadi: "Oya, ntiremezwa."
    )

    // ÇEVİRİ: rn (other)
    static let rn = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ln (one/other)
    static let ln = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} ekobanda na miniti {n}.", "other": "{ad} ekobanda na miniti {n}."],
        evetKilindi: "Ɛɛ, etiami elembo ete esambelami.",
        hayirKilinmadi: "Te, etiami elembo naino te."
    )

    // ÇEVİRİ: dag (other)
    static let dag = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ÇEVİRİ: mos (other)
    static let mos = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ÇEVİRİ: aa (other)
    static let aa = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ÇEVİRİ: mdh (other)
    static let mdh = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ÇEVİRİ: ak (one/other)
    static let ak = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} begins in {n} minute.", "other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ÇEVİRİ: ceb (one/other)
    static let ceb = OtomasyonMetinleri(
        kalanDakika: ["one": "{ad} begins in {n} minute.", "other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    // ÇEVİRİ: nqo (other)
    static let nqo = OtomasyonMetinleri(
        kalanDakika: ["other": "{ad} begins in {n} minutes."],
        evetKilindi: "Yes, it's marked as prayed.",
        hayirKilinmadi: "No, it isn't marked yet."
    )

    static let tablo: [String: OtomasyonMetinleri] = [
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

    static func dil(_ kod: String) -> OtomasyonMetinleri { tablo[ArayuzDili.coz(kod)] ?? tr }
}
