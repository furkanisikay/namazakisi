import AppIntents
import SwiftUI
import UIKit
import WidgetKit

// iOS VAKIT WIDGET'I (issue #295): kilit ekrani aksesuarlari, StandBy ve ana ekran.
//
// KILIT EKRANI VE STANDBY SALT OKUNURDUR (Android #295 karari): "Kildim" dugmesi yalniz
// ana ekranda (`systemSmall`/`systemMedium`) ve yalniz konteyner arka plani gorunurken
// cizilir — StandBy ve iPad kilit ekrani `showsWidgetContainerBackground == false` verir.
// Her yuzeyde `widgetURL` uygulamayi acar.
//
// Kalan sure ve ilerleme SISTEM tarafindan cizilir (`Text(timerInterval:)`,
// `ProgressView(timerInterval:)`); zaman cizelgesi yalniz vakit sinirlarinda girdi tasir.
// Metinler arayuz kaydindadir (kibar/notr; ibadete cagri degil). Dil CIZIM aninda
// App Group'tan okunur (`WidgetMetin.dil`, W5).

enum WidgetSabitleri {
    static let tur = "NamazVakitWidget"
    static let acilis = URL(string: "namazakisi://")
    /// Uygulamanin birincil yesili (tema `birincil` / splash #4CAF50). Yalniz ikon/cubuk
    /// gibi DEKORATIF ogelerde; metin daima sistem `primary`/`secondary` (kontrast).
    static let yesil = Color(red: 0x4C / 255.0, green: 0xAF / 255.0, blue: 0x50 / 255.0)
}

/// Widget, canli etkinlik ve kontrol metinleri (W5). Dil CIZIM aninda App Group'tan okunur
/// (`SiriDeposu.arayuzDili()`, JS `DilServisi` yazar); dil degisince JS'in tetikledigi
/// zaman cizelgesi tazelemesi widget'i yeni dille yeniden cizer. Ingilizce karsiliklar JS
/// sozlugunden (`sozluk/en`). Yer tutucular `{ad}`, `{saat}`, `{sonraki}`.
struct WidgetMetinleri: Equatable {
    let galeriAdi: String
    let galeriAciklama: String
    let veriEski: String
    let konumYok: String
    let kilindiSiradaki: String
    let adCikis: String
    let siradakiAdSaat: String
    let vaktiCikisErisim: String
    let siradakiErisim: String
    let cikisSaat: String
    let bitisSaat: String
    let kilindiBaslik: String
    let siradaki: String
    let siradakiAd: String
    let kildimErisim: String
    let gunSatiriKilindi: String
    let bitti: String
    let vakitCikti: String
    let kabulAlt: String
    let kontrolAdi: String
    let kontrolAciklama: String

    static let tr = WidgetMetinleri(
        galeriAdi: "Namaz vakti",
        galeriAciklama: "İçinde bulunulan vakit, çıkışına kalan süre ve günün vakitleri.",
        veriEski: "Vakitleri güncellemek için uygulamayı açın",
        konumYok: "Konumunuzu ayarlamak için uygulamayı açın",
        kilindiSiradaki: "{ad} kılındı · {sonraki} {saat}",
        adCikis: "{ad} · çıkış {saat}",
        siradakiAdSaat: "Sıradaki {ad} {saat}",
        vaktiCikisErisim: "{ad} vakti, çıkış {saat}",
        siradakiErisim: "Sıradaki {ad}, {saat}",
        cikisSaat: "Çıkış {saat}",
        bitisSaat: "Bitiş {saat}",
        kilindiBaslik: "{ad} kılındı",
        siradaki: "Sıradaki",
        siradakiAd: "Sıradaki {ad}",
        kildimErisim: "{ad} namazını kıldım",
        gunSatiriKilindi: ", kılındı",
        bitti: "Bitti",
        vakitCikti: "Vakit çıktı",
        kabulAlt: "{ad} namazı kılındı",
        kontrolAdi: "Vakti kıldım",
        kontrolAciklama: "İçinde bulunduğunuz vakti kılındı olarak işaretler."
    )

    static let en = WidgetMetinleri(
        galeriAdi: "Prayer time",
        galeriAciklama: "The current prayer time, the time left until it ends and today's prayer times.",
        veriEski: "Open the app to update prayer times",
        konumYok: "Open the app to set your location",
        kilindiSiradaki: "{ad} prayed · {sonraki} {saat}",
        adCikis: "{ad} · ends {saat}",
        siradakiAdSaat: "Next {ad} {saat}",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        cikisSaat: "Ends {saat}",
        bitisSaat: "Ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        siradakiAd: "Next {ad}",
        kildimErisim: "I've prayed {ad}",
        gunSatiriKilindi: ", prayed",
        bitti: "Ended",
        vakitCikti: "Prayer time is over",
        kabulAlt: "{ad} prayed",
        kontrolAdi: "I've prayed",
        kontrolAciklama: "Marks the current prayer as prayed."
    )


    // id — Endonezce (beta); JS `sozluk/id` (vakit.eylem: "Sudah salat" / "Ditunaikan")
    static let id = WidgetMetinleri(
        galeriAdi: "Waktu salat",
        galeriAciklama: "Waktu salat saat ini, sisa waktu hingga berakhir, dan waktu salat hari ini.",
        veriEski: "Buka aplikasi untuk memperbarui waktu salat",
        konumYok: "Buka aplikasi untuk mengatur lokasi Anda",
        kilindiSiradaki: "{ad} ditunaikan · {sonraki} {saat}",
        adCikis: "{ad} · berakhir {saat}",
        siradakiAdSaat: "Berikutnya {ad} {saat}",
        vaktiCikisErisim: "Waktu {ad}, berakhir {saat}",
        siradakiErisim: "Berikutnya {ad}, {saat}",
        cikisSaat: "Berakhir {saat}",
        bitisSaat: "Berakhir {saat}",
        kilindiBaslik: "{ad} ditunaikan",
        siradaki: "Berikutnya",
        siradakiAd: "Berikutnya {ad}",
        kildimErisim: "Sudah salat {ad}",
        gunSatiriKilindi: ", ditunaikan",
        bitti: "Selesai",
        vakitCikti: "Waktu salat telah berakhir",
        kabulAlt: "Salat {ad} ditunaikan",
        kontrolAdi: "Sudah salat",
        kontrolAciklama: "Menandai waktu salat saat ini sudah ditunaikan."
    )


    // de — Almanca (beta): JS `sozluk/de` (hitap "Sie", "bitte" yok)
    static let de = WidgetMetinleri(
        galeriAdi: "Gebetszeit",
        galeriAciklama: "Die aktuelle Gebetszeit, die verbleibende Zeit bis zu ihrem Ende und die heutigen Gebetszeiten.",
        veriEski: "Öffnen Sie die App, um die Gebetszeiten zu aktualisieren",
        konumYok: "Öffnen Sie die App, um Ihren Standort festzulegen",
        kilindiSiradaki: "{ad} gebetet · {sonraki} {saat}",
        adCikis: "{ad} · endet {saat}",
        siradakiAdSaat: "Als Nächstes {ad} {saat}",
        vaktiCikisErisim: "{ad}-Zeit, endet {saat}",
        siradakiErisim: "Als Nächstes {ad}, {saat}",
        cikisSaat: "Endet {saat}",
        bitisSaat: "Ende {saat}",
        kilindiBaslik: "{ad} gebetet",
        siradaki: "Als Nächstes",
        siradakiAd: "Als Nächstes {ad}",
        kildimErisim: "Ich habe {ad} gebetet",
        gunSatiriKilindi: ", gebetet",
        bitti: "Beendet",
        vakitCikti: "Die Gebetszeit ist vorbei",
        kabulAlt: "{ad} gebetet",
        kontrolAdi: "Ich habe gebetet",
        kontrolAciklama: "Markiert das aktuelle Gebet als gebetet."
    )


    // fr
    static let fr = WidgetMetinleri(
        galeriAdi: "Heure de prière",
        galeriAciklama: "La prière en cours, le temps restant avant la fin de son heure et les heures de prière du jour.",
        veriEski: "Ouvrez l’application pour mettre à jour les heures de prière",
        konumYok: "Ouvrez l’application pour définir votre position",
        kilindiSiradaki: "{ad} accompli · {sonraki} {saat}",
        adCikis: "{ad} · fin {saat}",
        siradakiAdSaat: "Prochaine : {ad} {saat}",
        vaktiCikisErisim: "{ad}, fin à {saat}",
        siradakiErisim: "Prochaine : {ad}, {saat}",
        cikisSaat: "Fin {saat}",
        bitisSaat: "Fin {saat}",
        kilindiBaslik: "{ad} accompli",
        siradaki: "Prochaine",
        siradakiAd: "Prochaine : {ad}",
        kildimErisim: "J’ai prié {ad}",
        gunSatiriKilindi: ", accompli",
        bitti: "Terminé",
        vakitCikti: "L’heure de prière est terminée",
        kabulAlt: "{ad} accompli",
        kontrolAdi: "J’ai prié",
        kontrolAciklama: "Marque la prière en cours comme accomplie."
    )


    // bs
    static let bs = WidgetMetinleri(
        galeriAdi: "Namasko vrijeme",
        galeriAciklama: "Trenutni vakat, preostalo vrijeme do njegovog isteka i današnja vremena.",
        veriEski: "Otvorite aplikaciju da ažurirate vremena",
        konumYok: "Otvorite aplikaciju da podesite svoju lokaciju",
        kilindiSiradaki: "{ad}: klanjano · {sonraki} {saat}",
        adCikis: "{ad} · ističe {saat}",
        siradakiAdSaat: "Sljedeći: {ad} {saat}",
        vaktiCikisErisim: "{ad}, ističe u {saat}",
        siradakiErisim: "Sljedeći: {ad}, {saat}",
        cikisSaat: "Ističe {saat}",
        bitisSaat: "Kraj {saat}",
        kilindiBaslik: "{ad}: klanjano",
        siradaki: "Sljedeći",
        siradakiAd: "Sljedeći: {ad}",
        kildimErisim: "Klanjano: {ad}",
        gunSatiriKilindi: ", klanjano",
        bitti: "Završeno",
        vakitCikti: "Vakat je istekao",
        kabulAlt: "{ad}: klanjano",
        kontrolAdi: "Klanjano",
        kontrolAciklama: "Označava trenutni vakat kao klanjan."
    )


    // ru
    static let ru = WidgetMetinleri(
        galeriAdi: "Время намаза",
        galeriAciklama: "Текущий намаз, сколько осталось до конца его времени и время намазов на сегодня.",
        veriEski: "Откройте приложение, чтобы обновить время намазов",
        konumYok: "Откройте приложение, чтобы указать местоположение",
        kilindiSiradaki: "{ad} совершён · {sonraki} {saat}",
        adCikis: "{ad} · до {saat}",
        siradakiAdSaat: "Следующий: {ad} {saat}",
        vaktiCikisErisim: "Время намаза {ad}, конец в {saat}",
        siradakiErisim: "Следующий намаз — {ad}, {saat}",
        cikisSaat: "Конец {saat}",
        bitisSaat: "Конец {saat}",
        kilindiBaslik: "{ad} совершён",
        siradaki: "Следующий",
        siradakiAd: "Следующий: {ad}",
        kildimErisim: "Намаз {ad} совершён",
        gunSatiriKilindi: ", совершён",
        bitti: "Завершено",
        vakitCikti: "Время намаза вышло",
        kabulAlt: "Намаз {ad} совершён",
        kontrolAdi: "Намаз совершён",
        kontrolAciklama: "Отмечает текущий намаз как совершённый."
    )


    // ms
    static let ms = WidgetMetinleri(
        galeriAdi: "Waktu solat",
        galeriAciklama: "Waktu solat semasa, baki masa sehingga ia tamat dan waktu solat hari ini.",
        veriEski: "Buka aplikasi untuk mengemas kini waktu solat",
        konumYok: "Buka aplikasi untuk menetapkan lokasi anda",
        kilindiSiradaki: "{ad} ditunaikan · {sonraki} {saat}",
        adCikis: "{ad} · tamat {saat}",
        siradakiAdSaat: "Seterusnya {ad} {saat}",
        vaktiCikisErisim: "Waktu {ad}, tamat {saat}",
        siradakiErisim: "Seterusnya {ad}, {saat}",
        cikisSaat: "Tamat {saat}",
        bitisSaat: "Tamat {saat}",
        kilindiBaslik: "{ad} ditunaikan",
        siradaki: "Seterusnya",
        siradakiAd: "Seterusnya {ad}",
        kildimErisim: "Sudah solat {ad}",
        gunSatiriKilindi: ", ditunaikan",
        bitti: "Tamat",
        vakitCikti: "Waktu solat telah tamat",
        kabulAlt: "Solat {ad} ditunaikan",
        kontrolAdi: "Sudah solat",
        kontrolAciklama: "Menandakan waktu solat semasa sebagai ditunaikan."
    )


    // ar — Arapça (beta): JS `sozluk/ar` (vakit, genel.kildim); "Kıldım" = صلّيتُ, "Kılındı" = تمّت
    static let ar = WidgetMetinleri(
        galeriAdi: "وقت الصلاة",
        galeriAciklama: "وقت الصلاة الحالي، والمتبقي على خروجه، ومواقيت اليوم.",
        veriEski: "لتحديث المواقيت: فتح التطبيق",
        konumYok: "لضبط موقعك: فتح التطبيق",
        kilindiSiradaki: "{ad} · تمّت · {sonraki} {saat}",
        adCikis: "{ad} · النهاية {saat}",
        siradakiAdSaat: "التالية {ad} {saat}",
        vaktiCikisErisim: "وقت {ad}، النهاية {saat}",
        siradakiErisim: "التالية {ad}، {saat}",
        cikisSaat: "النهاية {saat}",
        bitisSaat: "النهاية {saat}",
        kilindiBaslik: "{ad} · تمّت",
        siradaki: "التالية",
        siradakiAd: "التالية {ad}",
        kildimErisim: "صلّيتُ {ad}",
        gunSatiriKilindi: "، تمّت",
        bitti: "انتهى",
        vakitCikti: "خرج الوقت",
        kabulAlt: "صلاة {ad} تمّت",
        kontrolAdi: "صلّيتُ",
        kontrolAciklama: "يضع علامة «تمّت» على الصلاة الحالية."
    )


    // ur
    static let ur = WidgetMetinleri(
        galeriAdi: "نماز کا وقت",
        galeriAciklama: "موجودہ نماز کا وقت، اس کے ختم ہونے میں باقی وقت اور آج کی نمازوں کے اوقات۔",
        veriEski: "نماز کے اوقات اپ ڈیٹ کرنے کے لیے ایپ کھولیں",
        konumYok: "اپنا مقام منتخب کرنے کے لیے ایپ کھولیں",
        kilindiSiradaki: "{ad} ادا شدہ · {sonraki} {saat}",
        adCikis: "{ad} · اختتام {saat}",
        siradakiAdSaat: "اگلی {ad} {saat}",
        vaktiCikisErisim: "{ad} کا وقت، اختتام {saat}",
        siradakiErisim: "اگلی نماز {ad}، {saat}",
        cikisSaat: "اختتام {saat}",
        bitisSaat: "اختتام {saat}",
        kilindiBaslik: "{ad} ادا شدہ",
        siradaki: "اگلی",
        siradakiAd: "اگلی {ad}",
        kildimErisim: "{ad} کی نماز پڑھ لی",
        gunSatiriKilindi: "، ادا شدہ",
        bitti: "ختم",
        vakitCikti: "نماز کا وقت ختم ہو گیا",
        kabulAlt: "{ad} کی نماز ادا شدہ",
        kontrolAdi: "نماز پڑھ لی",
        kontrolAciklama: "موجودہ نماز پر ادا شدہ کا نشان لگاتا ہے۔"
    )

    // es — İspanyolca (beta); terimler JS sozluk/es (Kıldım "Ya recé", Kılındı "Rezado")
    static let es = WidgetMetinleri(
        galeriAdi: "Hora del rezo",
        galeriAciklama: "La hora del rezo actual, el tiempo que falta para que termine y las horas de rezo de hoy.",
        veriEski: "Abra la aplicación para actualizar las horas de rezo",
        konumYok: "Abra la aplicación para establecer su ubicación",
        kilindiSiradaki: "{ad} rezado · {sonraki} {saat}",
        adCikis: "{ad} · termina {saat}",
        siradakiAdSaat: "Siguiente {ad} {saat}",
        vaktiCikisErisim: "{ad}, termina {saat}",
        siradakiErisim: "Siguiente {ad}, {saat}",
        cikisSaat: "Termina {saat}",
        bitisSaat: "Fin {saat}",
        kilindiBaslik: "{ad} rezado",
        siradaki: "Siguiente",
        siradakiAd: "Siguiente {ad}",
        kildimErisim: "Ya recé {ad}",
        gunSatiriKilindi: ", rezado",
        bitti: "Terminado",
        vakitCikti: "La hora del rezo terminó",
        kabulAlt: "{ad} rezado",
        kontrolAdi: "Ya recé",
        kontrolAciklama: "Marca como rezado el rezo actual."
    )

    // nl — Felemenkçe (beta): JS `sozluk/nl` (hitap "u"; "Kıldım"/"Kılındı" = "Gebeden")
    static let nl = WidgetMetinleri(
        galeriAdi: "Gebedstijd",
        galeriAciklama: "De huidige gebedstijd, de resterende tijd tot het einde en de gebedstijden van vandaag.",
        veriEski: "Open de app om de gebedstijden bij te werken",
        konumYok: "Open de app om uw locatie in te stellen",
        kilindiSiradaki: "{ad} gebeden · {sonraki} {saat}",
        adCikis: "{ad} · eindigt {saat}",
        siradakiAdSaat: "Hierna {ad} {saat}",
        vaktiCikisErisim: "{ad}-tijd, eindigt {saat}",
        siradakiErisim: "Hierna {ad}, {saat}",
        cikisSaat: "Eindigt {saat}",
        bitisSaat: "Einde {saat}",
        kilindiBaslik: "{ad} gebeden",
        siradaki: "Hierna",
        siradakiAd: "Hierna {ad}",
        kildimErisim: "{ad} gebeden",
        gunSatiriKilindi: ", gebeden",
        bitti: "Voorbij",
        vakitCikti: "De gebedstijd is voorbij",
        kabulAlt: "{ad} gebeden",
        kontrolAdi: "Gebeden",
        kontrolAciklama: "Markeert het huidige gebed als gebeden."
    )

    // sq — Arnavutça (beta): JS `sozluk/sq` ("E fala" / "U fal", hitap "ju")
    static let sq = WidgetMetinleri(
        galeriAdi: "Koha e namazit",
        galeriAciklama: "Vakti aktual, koha e mbetur derisa të dalë dhe kohët e ditës.",
        veriEski: "Hapni aplikacionin për të përditësuar kohët",
        konumYok: "Hapni aplikacionin për të caktuar vendndodhjen",
        kilindiSiradaki: "{ad}: u fal · {sonraki} {saat}",
        adCikis: "{ad} · del {saat}",
        siradakiAdSaat: "Në vijim {ad} {saat}",
        vaktiCikisErisim: "{ad}, del {saat}",
        siradakiErisim: "Në vijim: {ad}, {saat}",
        cikisSaat: "Del {saat}",
        bitisSaat: "Mbaron {saat}",
        kilindiBaslik: "{ad}: u fal",
        siradaki: "Në vijim",
        siradakiAd: "Në vijim: {ad}",
        kildimErisim: "{ad}: e fala",
        gunSatiriKilindi: ", u fal",
        bitti: "Mbaroi",
        vakitCikti: "Koha doli",
        kabulAlt: "{ad}: u fal",
        kontrolAdi: "E fala",
        kontrolAciklama: "E shënon vaktin aktual si të falur."
    )

    // hi — Hintçe (beta): JS `sozluk/hi` (Kıldım "नमाज़ पढ़ ली", Kılındı "पढ़ ली गई")
    static let hi = WidgetMetinleri(
        galeriAdi: "नमाज़ का वक़्त",
        galeriAciklama: "मौजूदा नमाज़ का वक़्त, उसके ख़त्म होने में बाक़ी समय और आज की नमाज़ों के वक़्त।",
        veriEski: "नमाज़ के वक़्त अपडेट करने के लिए ऐप खोलें",
        konumYok: "अपनी लोकेशन चुनने के लिए ऐप खोलें",
        kilindiSiradaki: "{ad} पढ़ ली गई · {sonraki} {saat}",
        adCikis: "{ad} · ख़त्म {saat}",
        siradakiAdSaat: "अगली {ad} {saat}",
        vaktiCikisErisim: "{ad} का वक़्त, ख़त्म {saat}",
        siradakiErisim: "अगली नमाज़ {ad}, {saat}",
        cikisSaat: "ख़त्म {saat}",
        bitisSaat: "ख़त्म {saat}",
        kilindiBaslik: "{ad} पढ़ ली गई",
        siradaki: "अगली",
        siradakiAd: "अगली {ad}",
        kildimErisim: "{ad} की नमाज़ पढ़ ली",
        gunSatiriKilindi: ", पढ़ ली गई",
        bitti: "ख़त्म",
        vakitCikti: "नमाज़ का वक़्त ख़त्म हो गया",
        kabulAlt: "{ad} की नमाज़ पढ़ ली गई",
        kontrolAdi: "नमाज़ पढ़ ली",
        kontrolAciklama: "मौजूदा नमाज़ पर \"पढ़ ली गई\" का निशान लगाता है।"
    )

    // bn — Bengalce (beta); JS `sozluk/bn` (vakit.eylem: "নামাজ পড়েছি" / "পড়া হয়েছে")
    static let bn = WidgetMetinleri(
        galeriAdi: "নামাজের সময়",
        galeriAciklama: "বর্তমান নামাজের ওয়াক্ত, তা শেষ হতে বাকি সময় ও আজকের নামাজের সময়।",
        veriEski: "নামাজের সময় হালনাগাদ করতে অ্যাপ খুলুন",
        konumYok: "আপনার অবস্থান সেট করতে অ্যাপ খুলুন",
        kilindiSiradaki: "{ad} পড়া হয়েছে · {sonraki} {saat}",
        adCikis: "{ad} · শেষ {saat}",
        siradakiAdSaat: "পরবর্তী {ad} {saat}",
        vaktiCikisErisim: "{ad}-এর ওয়াক্ত, শেষ {saat}",
        siradakiErisim: "পরবর্তী {ad}, {saat}",
        cikisSaat: "শেষ {saat}",
        bitisSaat: "শেষ {saat}",
        kilindiBaslik: "{ad} পড়া হয়েছে",
        siradaki: "পরবর্তী",
        siradakiAd: "পরবর্তী {ad}",
        kildimErisim: "{ad} নামাজ পড়েছি",
        gunSatiriKilindi: ", পড়া হয়েছে",
        bitti: "শেষ",
        vakitCikti: "নামাজের ওয়াক্ত শেষ",
        kabulAlt: "{ad} পড়া হয়েছে",
        kontrolAdi: "নামাজ পড়েছি",
        kontrolAciklama: "বর্তমান নামাজ পড়া হয়েছে হিসেবে চিহ্নিত করে।"
    )

    // fa — Farsça (beta); JS `sozluk/fa` (Kıldım "خواندم", Kılındı "خوانده شد")
    static let fa = WidgetMetinleri(
        galeriAdi: "وقت نماز",
        galeriAciklama: "وقت نماز کنونی، زمان باقی‌مانده تا پایان آن و اوقات نماز امروز.",
        veriEski: "برای به‌روزرسانی اوقات نماز، برنامه را باز کنید",
        konumYok: "برای تنظیم موقعیت، برنامه را باز کنید",
        kilindiSiradaki: "{ad} خوانده شد · {sonraki} {saat}",
        adCikis: "{ad} · پایان {saat}",
        siradakiAdSaat: "بعدی {ad} {saat}",
        vaktiCikisErisim: "وقت {ad}، پایان {saat}",
        siradakiErisim: "بعدی {ad}، {saat}",
        cikisSaat: "پایان {saat}",
        bitisSaat: "پایان {saat}",
        kilindiBaslik: "{ad} خوانده شد",
        siradaki: "بعدی",
        siradakiAd: "بعدی {ad}",
        kildimErisim: "نماز {ad} را خواندم",
        gunSatiriKilindi: "، خوانده شد",
        bitti: "تمام شد",
        vakitCikti: "وقت نماز گذشت",
        kabulAlt: "نماز {ad} خوانده شد",
        kontrolAdi: "خواندم",
        kontrolAciklama: "نماز کنونی را خوانده‌شده علامت می‌زند."
    )

    // ps — Peştuca (beta); terimler JS sozluk/ps ("لمونځ مې وکړ" / "ادا شو")
    static let ps = WidgetMetinleri(
        galeriAdi: "د لمانځه وخت",
        galeriAciklama: "اوسنی وخت، د هغه تر پایه پاتې وخت او د نن د لمانځه وختونه.",
        veriEski: "د لمانځه د وختونو د تازه کولو لپاره اپ پرانیزئ",
        konumYok: "د موقعیت د برابرولو لپاره اپ پرانیزئ",
        kilindiSiradaki: "{ad} ادا شو · {sonraki} {saat}",
        adCikis: "{ad} · پای {saat}",
        siradakiAdSaat: "بل {ad} {saat}",
        vaktiCikisErisim: "د {ad} وخت، پای {saat}",
        siradakiErisim: "بل {ad}، {saat}",
        cikisSaat: "پای {saat}",
        bitisSaat: "پای {saat}",
        kilindiBaslik: "{ad} ادا شو",
        siradaki: "بل",
        siradakiAd: "بل {ad}",
        kildimErisim: "د {ad} لمونځ مې وکړ",
        gunSatiriKilindi: "، ادا شو",
        bitti: "پای ته ورسېد",
        vakitCikti: "د لمانځه وخت ووت",
        kabulAlt: "{ad} ادا شو",
        kontrolAdi: "لمونځ مې وکړ",
        kontrolAciklama: "اوسنی لمونځ د ادا شوي په توګه نښه کوي."
    )

    // ckb
    static let ckb = WidgetMetinleri(
        galeriAdi: "کاتی نوێژ",
        galeriAciklama: "کاتی نوێژی ئێستا، کاتی ماوە تا دەرچوونی و کاتەکانی نوێژی ئەمڕۆ.",
        veriEski: "بۆ نوێکردنەوەی کاتەکانی نوێژ ئەپەکە بکەنەوە",
        konumYok: "بۆ دیاریکردنی شوێنەکەتان ئەپەکە بکەنەوە",
        kilindiSiradaki: "{ad} کرا · {sonraki} {saat}",
        adCikis: "{ad} · کۆتایی {saat}",
        siradakiAdSaat: "داھاتوو {ad} {saat}",
        vaktiCikisErisim: "کاتی {ad}، کۆتایی {saat}",
        siradakiErisim: "داھاتوو {ad}، {saat}",
        cikisSaat: "کۆتایی {saat}",
        bitisSaat: "کۆتایی {saat}",
        kilindiBaslik: "{ad} کرا",
        siradaki: "داھاتوو",
        siradakiAd: "داھاتوو {ad}",
        kildimErisim: "نوێژی {ad}م کرد",
        gunSatiriKilindi: "، کرا",
        bitti: "تەواو بوو",
        vakitCikti: "کاتی نوێژ دەرچوو",
        kabulAlt: "{ad} کرا",
        kontrolAdi: "نوێژم کرد",
        kontrolAciklama: "نوێژی ئێستا وەک کراو نیشانە دەکات."
    )

    // ug — Uygurca (beta); JS `sozluk/ug` ("ناماز ئوقۇدۇم" / "ئوقۇلدى")
    static let ug = WidgetMetinleri(
        galeriAdi: "ناماز ۋاقتى",
        galeriAciklama: "ھازىرقى ناماز ۋاقتى، ئۇنىڭ چىقىشىغا قالغان ۋاقىت ۋە بۈگۈنكى ناماز ۋاقىتلىرى.",
        veriEski: "ناماز ۋاقىتلىرىنى يېڭىلاش ئۈچۈن ئەپنى ئېچىڭ",
        konumYok: "ئورنىڭىزنى تەڭشەش ئۈچۈن ئەپنى ئېچىڭ",
        kilindiSiradaki: "{ad} ئوقۇلدى · {sonraki} {saat}",
        adCikis: "{ad} · چىقىشى {saat}",
        siradakiAdSaat: "كېيىنكىسى {ad} {saat}",
        vaktiCikisErisim: "{ad} ۋاقتى، چىقىشى {saat}",
        siradakiErisim: "كېيىنكىسى {ad}، {saat}",
        cikisSaat: "چىقىشى {saat}",
        bitisSaat: "ئاخىرلىشىشى {saat}",
        kilindiBaslik: "{ad} ئوقۇلدى",
        siradaki: "كېيىنكى",
        siradakiAd: "كېيىنكىسى {ad}",
        kildimErisim: "{ad} نامىزىنى ئوقۇدۇم",
        gunSatiriKilindi: "، ئوقۇلدى",
        bitti: "ئاخىرلاشتى",
        vakitCikti: "ناماز ۋاقتى چىقتى",
        kabulAlt: "{ad} ئوقۇلدى",
        kontrolAdi: "ناماز ئوقۇدۇم",
        kontrolAciklama: "ھازىرقى ۋاقىتنى ئوقۇلدى دەپ بەلگىلەيدۇ."
    )

    // az — Azerice (beta); JS `sozluk/az` ("Qıldım" / "Qılındı")
    static let az = WidgetMetinleri(
        galeriAdi: "Namaz vaxtı",
        galeriAciklama: "Hazırkı vaxt, onun çıxmasına qalan müddət və günün vaxtları.",
        veriEski: "Vaxtları yeniləmək üçün tətbiqi açın",
        konumYok: "Məkanınızı tənzimləmək üçün tətbiqi açın",
        kilindiSiradaki: "{ad} qılındı · {sonraki} {saat}",
        adCikis: "{ad} · çıxış {saat}",
        siradakiAdSaat: "Növbəti {ad} {saat}",
        vaktiCikisErisim: "{ad} vaxtı, çıxış {saat}",
        siradakiErisim: "Növbəti {ad}, {saat}",
        cikisSaat: "Çıxış {saat}",
        bitisSaat: "Bitmə {saat}",
        kilindiBaslik: "{ad} qılındı",
        siradaki: "Növbəti",
        siradakiAd: "Növbəti {ad}",
        kildimErisim: "{ad} namazını qıldım",
        gunSatiriKilindi: ", qılındı",
        bitti: "Bitdi",
        vakitCikti: "Vaxt çıxdı",
        kabulAlt: "{ad} namazı qılındı",
        kontrolAdi: "Vaxtı qıldım",
        kontrolAciklama: "Hazırkı vaxtı qılındı kimi qeyd edir."
    )

    // uz — Özbekçe (beta, LATİN): JS `sozluk/uz` (Kiril kaynak → kirildenLatine); "Oʻqidim" / "Oʻqildi"
    static let uz = WidgetMetinleri(
        galeriAdi: "Namoz vaqti",
        galeriAciklama: "Joriy namoz vaqti, uning tugashigacha qolgan vaqt va bugungi namoz vaqtlari.",
        veriEski: "Namoz vaqtlarini yangilash uchun ilovani oching",
        konumYok: "Joylashuvingizni belgilash uchun ilovani oching",
        kilindiSiradaki: "{ad} oʻqildi · {sonraki} {saat}",
        adCikis: "{ad} · tugashi {saat}",
        siradakiAdSaat: "Keyingisi {ad} {saat}",
        vaktiCikisErisim: "{ad} vaqti, tugashi {saat}",
        siradakiErisim: "Keyingisi {ad}, {saat}",
        cikisSaat: "Tugashi {saat}",
        bitisSaat: "Tugashi {saat}",
        kilindiBaslik: "{ad} oʻqildi",
        siradaki: "Keyingi",
        siradakiAd: "Keyingisi {ad}",
        kildimErisim: "{ad} namozini oʻqidim",
        gunSatiriKilindi: ", oʻqildi",
        bitti: "Tugadi",
        vakitCikti: "Vaqt chiqdi",
        kabulAlt: "{ad} namozi oʻqildi",
        kontrolAdi: "Oʻqidim",
        kontrolAciklama: "Joriy namoz vaqtini oʻqildi deb belgilaydi."
    )

    // kk — Kazakça (beta, Kiril): JS `sozluk/kk` ("Kıldım" = «Оқыдым», "Kılındı" = «Оқылды»)
    static let kk = WidgetMetinleri(
        galeriAdi: "Намаз уақыты",
        galeriAciklama: "Қазіргі намаз уақыты, оның шығуына қалған уақыт және бүгінгі намаз уақыттары.",
        veriEski: "Намаз уақыттарын жаңарту үшін қолданбаны ашыңыз",
        konumYok: "Орналасқан жеріңізді белгілеу үшін қолданбаны ашыңыз",
        kilindiSiradaki: "{ad} оқылды · {sonraki} {saat}",
        adCikis: "{ad} · шығуы {saat}",
        siradakiAdSaat: "Келесі {ad} {saat}",
        vaktiCikisErisim: "{ad} уақыты, шығуы {saat}",
        siradakiErisim: "Келесі {ad}, {saat}",
        cikisSaat: "Шығуы {saat}",
        bitisSaat: "Аяқталуы {saat}",
        kilindiBaslik: "{ad} оқылды",
        siradaki: "Келесі",
        siradakiAd: "Келесі {ad}",
        kildimErisim: "{ad} намазын оқыдым",
        gunSatiriKilindi: ", оқылды",
        bitti: "Аяқталды",
        vakitCikti: "Намаз уақыты шықты",
        kabulAlt: "{ad} оқылды",
        kontrolAdi: "Оқыдым",
        kontrolAciklama: "Қазіргі намазды оқылды деп белгілейді."
    )

    // ky
    static let ky = WidgetMetinleri(
        galeriAdi: "Намаз убактысы",
        galeriAciklama: "Азыркы намаз убактысы, анын бүтүшүнө калган убакыт жана бүгүнкү намаз убактылары.",
        veriEski: "Намаз убактыларын жаңыртуу үчүн колдонмону ачыңыз",
        konumYok: "Жайгашкан жериңизди коюу үчүн колдонмону ачыңыз",
        kilindiSiradaki: "{ad} окулду · {sonraki} {saat}",
        adCikis: "{ad} · {saat} бүтөт",
        siradakiAdSaat: "Кийинки {ad} {saat}",
        vaktiCikisErisim: "{ad} убактысы, {saat} бүтөт",
        siradakiErisim: "Кийинкиси {ad}, {saat}",
        cikisSaat: "Бүтөт {saat}",
        bitisSaat: "Бүтөт {saat}",
        kilindiBaslik: "{ad} окулду",
        siradaki: "Кийинки",
        siradakiAd: "Кийинки {ad}",
        kildimErisim: "{ad} намазын окудум",
        gunSatiriKilindi: ", окулду",
        bitti: "Бүттү",
        vakitCikti: "Намаз убактысы бүттү",
        kabulAlt: "{ad} окулду",
        kontrolAdi: "Окудум",
        kontrolAciklama: "Азыркы намазды окулду деп белгилейт."
    )

    // tg — Tacikçe (beta); JS `sozluk/tg` (Kıldım "Хондам", Kılındı "Хонда шуд")
    static let tg = WidgetMetinleri(
        galeriAdi: "Вақти намоз",
        galeriAciklama: "Вақти ҷорӣ, вақти боқимонда то анҷоми он ва вақтҳои имрӯз.",
        veriEski: "Барои навсозии вақтҳо барномаро кушоед",
        konumYok: "Барои танзими макон барномаро кушоед",
        kilindiSiradaki: "{ad} хонда шуд · {sonraki} {saat}",
        adCikis: "{ad} · анҷом {saat}",
        siradakiAdSaat: "Навбатӣ {ad} {saat}",
        vaktiCikisErisim: "Вақти {ad}, анҷом {saat}",
        siradakiErisim: "Навбатӣ {ad}, {saat}",
        cikisSaat: "Анҷом {saat}",
        bitisSaat: "Анҷом {saat}",
        kilindiBaslik: "{ad} хонда шуд",
        siradaki: "Навбатӣ",
        siradakiAd: "Навбатӣ {ad}",
        kildimErisim: "Намози {ad}-ро хондам",
        gunSatiriKilindi: ", хонда шуд",
        bitti: "Анҷом ёфт",
        vakitCikti: "Вақт гузашт",
        kabulAlt: "Намози {ad} хонда шуд",
        kontrolAdi: "Хондам",
        kontrolAciklama: "Вақти ҷориро ҳамчун хондашуда қайд мекунад."
    )

    // sw
    static let sw = WidgetMetinleri(
        galeriAdi: "Wakati wa Swala",
        galeriAciklama: "Wakati wa Swala wa sasa, muda uliobaki hadi uishe na nyakati za Swala za leo.",
        veriEski: "Fungua programu ili kusasisha nyakati za Swala",
        konumYok: "Fungua programu ili kuweka mahali pako",
        kilindiSiradaki: "{ad} imeswaliwa · {sonraki} {saat}",
        adCikis: "{ad} · unaisha {saat}",
        siradakiAdSaat: "Inayofuata {ad} {saat}",
        vaktiCikisErisim: "Wakati wa {ad}, unaisha {saat}",
        siradakiErisim: "Inayofuata {ad}, {saat}",
        cikisSaat: "Unaisha {saat}",
        bitisSaat: "Unaisha {saat}",
        kilindiBaslik: "{ad} imeswaliwa",
        siradaki: "Inayofuata",
        siradakiAd: "Inayofuata {ad}",
        kildimErisim: "Nimeswali {ad}",
        gunSatiriKilindi: ", imeswaliwa",
        bitti: "Umeisha",
        vakitCikti: "Wakati wa Swala umeisha",
        kabulAlt: "{ad} imeswaliwa",
        kontrolAdi: "Nimeswali",
        kontrolAciklama: "Huweka alama Swala ya sasa imeswaliwa."
    )

    // ha — Hausa (beta): JS `sozluk/ha` (Kıldım "Na yi salla", Kılındı "An yi salla")
    static let ha = WidgetMetinleri(
        galeriAdi: "Lokacin salla",
        galeriAciklama: "Lokacin sallar yanzu, lokacin da ya rage kafin ya fita da lokutan sallar yau.",
        veriEski: "Buɗe manhaja don sabunta lokutan salla",
        konumYok: "Buɗe manhaja don saita wurinku",
        kilindiSiradaki: "An yi {ad} · {sonraki} {saat}",
        adCikis: "{ad} · za ta fita {saat}",
        siradakiAdSaat: "Na gaba {ad} {saat}",
        vaktiCikisErisim: "Lokacin {ad}, zai fita {saat}",
        siradakiErisim: "Na gaba {ad}, {saat}",
        cikisSaat: "Za ta fita {saat}",
        bitisSaat: "Za ta ƙare {saat}",
        kilindiBaslik: "An yi sallar {ad}",
        siradaki: "Na gaba",
        siradakiAd: "Na gaba {ad}",
        kildimErisim: "Na yi sallar {ad}",
        gunSatiriKilindi: ", an yi",
        bitti: "Ya ƙare",
        vakitCikti: "Lokacin salla ya fita",
        kabulAlt: "An yi sallar {ad}",
        kontrolAdi: "Na yi salla",
        kontrolAciklama: "Yana yin alamar an yi sallar yanzu."
    )

    // am — Amharca (beta); terimler src/core/dil/sozluk/am
    static let am = WidgetMetinleri(
        galeriAdi: "የሶላት ሰዓት",
        galeriAciklama: "የአሁኑ የሶላት ሰዓት፣ እስኪያልቅ የቀረው ጊዜ እና የዛሬ የሶላት ሰዓቶች።",
        veriEski: "የሶላት ሰዓቶችን ለማዘመን መተግበሪያውን ይክፈቱ",
        konumYok: "አካባቢዎን ለማዘጋጀት መተግበሪያውን ይክፈቱ",
        kilindiSiradaki: "{ad} ተሰግዷል · {sonraki} {saat}",
        adCikis: "{ad} · ያበቃል {saat}",
        siradakiAdSaat: "ቀጣይ {ad} {saat}",
        vaktiCikisErisim: "የ{ad} ሰዓት፣ በ{saat} ያበቃል",
        siradakiErisim: "ቀጣይ {ad}፣ {saat}",
        cikisSaat: "ያበቃል {saat}",
        bitisSaat: "ያበቃል {saat}",
        kilindiBaslik: "{ad} ተሰግዷል",
        siradaki: "ቀጣይ",
        siradakiAd: "ቀጣይ {ad}",
        kildimErisim: "{ad}ን ሰገድኩ",
        gunSatiriKilindi: "፣ ተሰግዷል",
        bitti: "አብቅቷል",
        vakitCikti: "የሶላቱ ሰዓት አብቅቷል",
        kabulAlt: "{ad} ተሰግዷል",
        kontrolAdi: "ሰገድኩ",
        kontrolAciklama: "የአሁኑን ሶላት እንደተሰገደ ምልክት ያደርጋል።"
    )

    // om
    static let om = WidgetMetinleri(
        galeriAdi: "Yeroo salaataa",
        galeriAciklama: "Yeroo salaataa ammaa, yeroo hanga xumuramutti hafeefi yeroo salaataa har'aa.",
        veriEski: "Yeroo salaataa haaromsuuf appicha banaa",
        konumYok: "Bakka keessan qindeessuuf appicha banaa",
        kilindiSiradaki: "{ad} salaatameera · {sonraki} {saat}",
        adCikis: "{ad} · {saat}tti xumurama",
        siradakiAdSaat: "Itti aanu {ad} {saat}",
        vaktiCikisErisim: "Yeroo {ad}, {saat}tti xumurama",
        siradakiErisim: "Itti aanu {ad}, {saat}",
        cikisSaat: "{saat}tti xumurama",
        bitisSaat: "{saat}tti xumurama",
        kilindiBaslik: "{ad} salaatameera",
        siradaki: "Itti aanu",
        siradakiAd: "Itti aanu {ad}",
        kildimErisim: "{ad}: Ani salaateera",
        gunSatiriKilindi: ", salaatameera",
        bitti: "Xumurame",
        vakitCikti: "Yeroon salaataa xumurameera",
        kabulAlt: "{ad} salaatameera",
        kontrolAdi: "Ani salaateera",
        kontrolAciklama: "Salaata ammaa akka salaatameetti mallattessa."
    )

    // so
    static let so = WidgetMetinleri(
        galeriAdi: "Waqtiga salaadda",
        galeriAciklama: "Waqtiga salaadda hadda, waqtiga u haray dhammaadkiisa iyo waqtiyada salaadda maanta.",
        veriEski: "Fur barnaamijka si loo cusboonaysiiyo waqtiyada salaadda",
        konumYok: "Fur barnaamijka si aad u dejiso goobtaada",
        kilindiSiradaki: "{ad} la tukaday · {sonraki} {saat}",
        adCikis: "{ad} · dhammaad {saat}",
        siradakiAdSaat: "Xiga {ad} {saat}",
        vaktiCikisErisim: "Waqtiga {ad}, wuxuu dhammaanayaa {saat}",
        siradakiErisim: "Xiga {ad}, {saat}",
        cikisSaat: "Dhammaad {saat}",
        bitisSaat: "Dhammaad {saat}",
        kilindiBaslik: "{ad} la tukaday",
        siradaki: "Xiga",
        siradakiAd: "Xiga {ad}",
        kildimErisim: "Waan tukaday {ad}",
        gunSatiriKilindi: ", la tukaday",
        bitti: "Dhammaaday",
        vakitCikti: "Waqtiga salaaddu wuu dhammaaday",
        kabulAlt: "{ad} la tukaday",
        kontrolAdi: "Waan tukaday",
        kontrolAciklama: "Wuxuu u calaamadeeyaa salaadda hadda la tukaday."
    )

    // ff
    static let ff = WidgetMetinleri(
        galeriAdi: "Waqutu juulde",
        galeriAciklama: "Waqutu juulde jooni, saa’i heddiiɗo haa nde gasa e saa’iiji juulɗe hannde.",
        veriEski: "Udditee jaaɓngal ngal ngam hesɗitinde saa’iiji juulɗe",
        konumYok: "Udditee jaaɓngal ngal ngam teeltude nokkuure mon",
        kilindiSiradaki: "{ad} juulaama · {sonraki} {saat}",
        adCikis: "{ad} · gasay {saat}",
        siradakiAdSaat: "Garoore {ad} {saat}",
        vaktiCikisErisim: "Waqutu {ad}, gasay {saat}",
        siradakiErisim: "Garoore {ad}, {saat}",
        cikisSaat: "Gasay {saat}",
        bitisSaat: "Gasay {saat}",
        kilindiBaslik: "{ad} juulaama",
        siradaki: "Garoore",
        siradakiAd: "Garoore {ad}",
        kildimErisim: "Mi juulii {ad}",
        gunSatiriKilindi: ", juulaama",
        bitti: "Gasii",
        vakitCikti: "Waqutu juulde gasii",
        kabulAlt: "{ad} juulaama",
        kontrolAdi: "Mi juulii",
        kontrolAciklama: "Hino maandina juulde jooni ndee ko juulaama."
    )

    // yo
    static let yo = WidgetMetinleri(
        galeriAdi: "Àkókò ìrun",
        galeriAciklama: "Àkókò ìrun lọ́wọ́lọ́wọ́, àkókò tó kù kí ó tó parí àti àwọn àkókò ìrun òní.",
        veriEski: "Ẹ ṣí ìṣàfilọ́lẹ̀ láti ṣe àfikún àwọn àkókò ìrun",
        konumYok: "Ẹ ṣí ìṣàfilọ́lẹ̀ láti ṣètò ibùdó yín",
        kilindiSiradaki: "{ad}: ti kírun · {sonraki} {saat}",
        adCikis: "{ad} · yóò parí {saat}",
        siradakiAdSaat: "Èyí tó kàn {ad} {saat}",
        vaktiCikisErisim: "Àkókò {ad}, yóò parí {saat}",
        siradakiErisim: "Èyí tó kàn {ad}, {saat}",
        cikisSaat: "Yóò parí {saat}",
        bitisSaat: "Yóò parí {saat}",
        kilindiBaslik: "{ad}: ti kírun",
        siradaki: "Tó kàn",
        siradakiAd: "Èyí tó kàn {ad}",
        kildimErisim: "Mo ti kí {ad}",
        gunSatiriKilindi: ", ti kírun",
        bitti: "Ó ti parí",
        vakitCikti: "Àkókò ìrun ti kọjá",
        kabulAlt: "{ad}: ti kírun",
        kontrolAdi: "Mo ti kírun",
        kontrolAciklama: "Ó ń sàmì sí ìrun lọ́wọ́lọ́wọ́ pé a ti kí i."
    )

    // zh
    static let zh = WidgetMetinleri(
        galeriAdi: "礼拜时间",
        galeriAciklama: "当前礼拜时间、距其结束的剩余时间以及今天的礼拜时间。",
        veriEski: "打开应用以更新礼拜时间",
        konumYok: "打开应用以设置您的位置",
        kilindiSiradaki: "{ad}已礼拜 · {sonraki} {saat}",
        adCikis: "{ad} · {saat}结束",
        siradakiAdSaat: "下一个 {ad} {saat}",
        vaktiCikisErisim: "{ad}时间，{saat}结束",
        siradakiErisim: "下一个{ad}，{saat}",
        cikisSaat: "{saat}结束",
        bitisSaat: "{saat}结束",
        kilindiBaslik: "{ad}已礼拜",
        siradaki: "下一个",
        siradakiAd: "下一个 {ad}",
        kildimErisim: "我礼了{ad}",
        gunSatiriKilindi: "，已礼拜",
        bitti: "已结束",
        vakitCikti: "礼拜时间已结束",
        kabulAlt: "{ad}已礼拜",
        kontrolAdi: "我礼了",
        kontrolAciklama: "将当前礼拜标记为已礼拜。"
    )

    // ta
    static let ta = WidgetMetinleri(
        galeriAdi: "தொழுகை நேரம்",
        galeriAciklama: "தற்போதைய தொழுகை நேரம், அது முடிய மீதமுள்ள நேரம், இன்றைய தொழுகை நேரங்கள்.",
        veriEski: "தொழுகை நேரங்களைப் புதுப்பிக்க ஆப்ஸைத் திறக்கவும்",
        konumYok: "இருப்பிடத்தை அமைக்க ஆப்ஸைத் திறக்கவும்",
        kilindiSiradaki: "{ad} தொழுதாகிவிட்டது · {sonraki} {saat}",
        adCikis: "{ad} · முடிவு {saat}",
        siradakiAdSaat: "அடுத்தது {ad} {saat}",
        vaktiCikisErisim: "{ad} நேரம், முடிவு {saat}",
        siradakiErisim: "அடுத்தது {ad}, {saat}",
        cikisSaat: "முடிவு {saat}",
        bitisSaat: "முடிவு {saat}",
        kilindiBaslik: "{ad} தொழுதாகிவிட்டது",
        siradaki: "அடுத்தது",
        siradakiAd: "அடுத்தது {ad}",
        kildimErisim: "{ad} தொழுதேன்",
        gunSatiriKilindi: ", தொழுதாகிவிட்டது",
        bitti: "முடிந்தது",
        vakitCikti: "தொழுகை நேரம் முடிந்தது",
        kabulAlt: "{ad} தொழுதாகிவிட்டது",
        kontrolAdi: "தொழுதேன்",
        kontrolAciklama: "தற்போதைய தொழுகையைத் தொழுததாகக் குறிக்கும்."
    )

    // ml — Malayalamca (beta): JS `sozluk/ml`; Kılındı "നമസ്കരിച്ചു", Kıldım "ഞാൻ നമസ്കരിച്ചു"
    static let ml = WidgetMetinleri(
        galeriAdi: "നമസ്കാര സമയം",
        galeriAciklama: "ഇപ്പോഴത്തെ നമസ്കാര സമയം, അത് തീരാൻ ബാക്കിയുള്ള സമയം, ഇന്നത്തെ നമസ്കാര സമയങ്ങൾ.",
        veriEski: "നമസ്കാര സമയങ്ങൾ പുതുക്കാൻ ആപ്പ് തുറക്കുക",
        konumYok: "ലൊക്കേഷൻ സജ്ജമാക്കാൻ ആപ്പ് തുറക്കുക",
        kilindiSiradaki: "{ad} നമസ്കരിച്ചു · {sonraki} {saat}",
        adCikis: "{ad} · {saat}-ന് തീരും",
        siradakiAdSaat: "അടുത്തത് {ad} {saat}",
        vaktiCikisErisim: "{ad} സമയം, {saat}-ന് തീരും",
        siradakiErisim: "അടുത്തത് {ad}, {saat}",
        cikisSaat: "{saat}-ന് തീരും",
        bitisSaat: "{saat}-ന് തീരും",
        kilindiBaslik: "{ad} നമസ്കരിച്ചു",
        siradaki: "അടുത്തത്",
        siradakiAd: "അടുത്തത് {ad}",
        kildimErisim: "{ad}: ഞാൻ നമസ്കരിച്ചു",
        gunSatiriKilindi: ", നമസ്കരിച്ചു",
        bitti: "തീർന്നു",
        vakitCikti: "നമസ്കാര സമയം കഴിഞ്ഞു",
        kabulAlt: "{ad} നമസ്കരിച്ചു",
        kontrolAdi: "ഞാൻ നമസ്കരിച്ചു",
        kontrolAciklama: "ഇപ്പോഴത്തെ നമസ്കാരം നമസ്കരിച്ചതായി അടയാളപ്പെടുത്തുന്നു."
    )

    // th
    static let th = WidgetMetinleri(
        galeriAdi: "เวลาละหมาด",
        galeriAciklama: "เวลาละหมาดปัจจุบัน เวลาที่เหลือก่อนหมดเวลา และเวลาละหมาดของวันนี้",
        veriEski: "เปิดแอปเพื่ออัปเดตเวลาละหมาด",
        konumYok: "เปิดแอปเพื่อตั้งตำแหน่งของคุณ",
        kilindiSiradaki: "ละหมาด{ad}แล้ว · {sonraki} {saat}",
        adCikis: "{ad} · หมด {saat}",
        siradakiAdSaat: "ถัดไป {ad} {saat}",
        vaktiCikisErisim: "เวลา{ad} หมดเวลา {saat}",
        siradakiErisim: "ถัดไป {ad} {saat}",
        cikisSaat: "หมด {saat}",
        bitisSaat: "หมด {saat}",
        kilindiBaslik: "ละหมาด{ad}แล้ว",
        siradaki: "ถัดไป",
        siradakiAd: "ถัดไป {ad}",
        kildimErisim: "ฉันละหมาด{ad}แล้ว",
        gunSatiriKilindi: " ละหมาดแล้ว",
        bitti: "สิ้นสุดแล้ว",
        vakitCikti: "หมดเวลาละหมาดแล้ว",
        kabulAlt: "ละหมาด{ad}แล้ว",
        kontrolAdi: "ละหมาดแล้ว",
        kontrolAciklama: "ทำเครื่องหมายว่าละหมาดเวลาปัจจุบันแล้ว"
    )

    // ko
    static let ko = WidgetMetinleri(
        galeriAdi: "예배 시간",
        galeriAciklama: "현재 예배 시간, 종료까지 남은 시간, 오늘의 예배 시간.",
        veriEski: "예배 시간을 업데이트하려면 앱을 여세요",
        konumYok: "위치를 설정하려면 앱을 여세요",
        kilindiSiradaki: "{ad} 예배 완료 · {sonraki} {saat}",
        adCikis: "{ad} · {saat} 종료",
        siradakiAdSaat: "다음 {ad} {saat}",
        vaktiCikisErisim: "{ad} 예배 시간, {saat} 종료",
        siradakiErisim: "다음 {ad}, {saat}",
        cikisSaat: "{saat} 종료",
        bitisSaat: "{saat} 종료",
        kilindiBaslik: "{ad} 예배 완료",
        siradaki: "다음",
        siradakiAd: "다음 {ad}",
        kildimErisim: "{ad} 예배 드렸어요",
        gunSatiriKilindi: ", 예배 완료",
        bitti: "종료됨",
        vakitCikti: "예배 시간이 끝났습니다",
        kabulAlt: "{ad} 예배 완료",
        kontrolAdi: "예배 드렸어요",
        kontrolAciklama: "현재 예배를 완료로 표시합니다."
    )

    // vi
    static let vi = WidgetMetinleri(
        galeriAdi: "Giờ Salah",
        galeriAciklama: "Giờ Salah hiện tại, thời gian còn lại đến khi kết thúc và giờ Salah hôm nay.",
        veriEski: "Mở ứng dụng để cập nhật giờ Salah",
        konumYok: "Mở ứng dụng để đặt vị trí",
        kilindiSiradaki: "{ad} đã hành lễ · {sonraki} {saat}",
        adCikis: "{ad} · kết thúc {saat}",
        siradakiAdSaat: "Tiếp theo {ad} {saat}",
        vaktiCikisErisim: "Giờ {ad}, kết thúc {saat}",
        siradakiErisim: "Tiếp theo {ad}, {saat}",
        cikisSaat: "Kết thúc {saat}",
        bitisSaat: "Kết thúc {saat}",
        kilindiBaslik: "{ad} đã hành lễ",
        siradaki: "Tiếp theo",
        siradakiAd: "Tiếp theo {ad}",
        kildimErisim: "Tôi đã hành lễ {ad}",
        gunSatiriKilindi: ", đã hành lễ",
        bitti: "Đã hết",
        vakitCikti: "Đã hết giờ Salah",
        kabulAlt: "{ad} đã hành lễ",
        kontrolAdi: "Tôi đã hành lễ",
        kontrolAciklama: "Đánh dấu Salah hiện tại là đã hành lễ."
    )

    // pt
    static let pt = WidgetMetinleri(
        galeriAdi: "Hora da oração",
        galeriAciklama: "A hora da oração atual, o tempo até ao fim e os horários de hoje.",
        veriEski: "Abra a aplicação para atualizar os horários",
        konumYok: "Abra a aplicação para definir a localização",
        kilindiSiradaki: "{ad} rezada · {sonraki} {saat}",
        adCikis: "{ad} · termina {saat}",
        siradakiAdSaat: "A seguir {ad} {saat}",
        vaktiCikisErisim: "Hora de {ad}, termina {saat}",
        siradakiErisim: "A seguir {ad}, {saat}",
        cikisSaat: "Termina {saat}",
        bitisSaat: "Termina {saat}",
        kilindiBaslik: "{ad} rezada",
        siradaki: "A seguir",
        siradakiAd: "A seguir {ad}",
        kildimErisim: "Rezei a oração de {ad}",
        gunSatiriKilindi: ", rezada",
        bitti: "Terminou",
        vakitCikti: "A hora da oração terminou",
        kabulAlt: "{ad} rezada",
        kontrolAdi: "Rezei",
        kontrolAciklama: "Marca a oração atual como rezada."
    )

    // it
    static let it = WidgetMetinleri(
        galeriAdi: "Orario di preghiera",
        galeriAciklama: "L’orario attuale, il tempo rimasto alla fine e gli orari di oggi.",
        veriEski: "Apra l’app per aggiornare gli orari",
        konumYok: "Apra l’app per impostare la posizione",
        kilindiSiradaki: "{ad} compiuto · {sonraki} {saat}",
        adCikis: "{ad} · fine {saat}",
        siradakiAdSaat: "Prossimo {ad} {saat}",
        vaktiCikisErisim: "Tempo di {ad}, fino alle {saat}",
        siradakiErisim: "Prossimo {ad}, {saat}",
        cikisSaat: "Fine {saat}",
        bitisSaat: "Fine {saat}",
        kilindiBaslik: "{ad} compiuto",
        siradaki: "Prossimo",
        siradakiAd: "Prossimo {ad}",
        kildimErisim: "Ho compiuto {ad}",
        gunSatiriKilindi: ", compiuta",
        bitti: "Finito",
        vakitCikti: "L’orario è finito",
        kabulAlt: "{ad} compiuto",
        kontrolAdi: "Ho pregato",
        kontrolAciklama: "Segna come compiuta la preghiera attuale."
    )

    // sv
    static let sv = WidgetMetinleri(
        galeriAdi: "Bönetid",
        galeriAciklama: "Den aktuella bönetiden, tiden kvar tills den slutar och dagens bönetider.",
        veriEski: "Öppna appen för att uppdatera bönetiderna",
        konumYok: "Öppna appen för att ange din plats",
        kilindiSiradaki: "{ad} förrättad · {sonraki} {saat}",
        adCikis: "{ad} · slutar {saat}",
        siradakiAdSaat: "Nästa {ad} {saat}",
        vaktiCikisErisim: "Tid för {ad}, slutar {saat}",
        siradakiErisim: "Nästa {ad}, {saat}",
        cikisSaat: "Slutar {saat}",
        bitisSaat: "Slutar {saat}",
        kilindiBaslik: "{ad} förrättad",
        siradaki: "Nästa",
        siradakiAd: "Nästa {ad}",
        kildimErisim: "Jag har bett {ad}",
        gunSatiriKilindi: ", förrättad",
        bitti: "Slut",
        vakitCikti: "Bönetiden är slut",
        kabulAlt: "{ad} förrättad",
        kontrolAdi: "Jag har bett",
        kontrolAciklama: "Markerar den aktuella bönen som förrättad."
    )

    // uk
    static let uk = WidgetMetinleri(
        galeriAdi: "Час молитви",
        galeriAciklama: "Поточна молитва, скільки лишилося до кінця її часу і сьогоднішній час молитов.",
        veriEski: "Відкрийте застосунок, щоб оновити час молитов",
        konumYok: "Відкрийте застосунок, щоб задати місцезнаходження",
        kilindiSiradaki: "{ad} здійснено · {sonraki} {saat}",
        adCikis: "{ad} · до {saat}",
        siradakiAdSaat: "Далі: {ad} {saat}",
        vaktiCikisErisim: "Час молитви {ad}, кінець о {saat}",
        siradakiErisim: "Наступна молитва — {ad}, {saat}",
        cikisSaat: "Кінець {saat}",
        bitisSaat: "Кінець {saat}",
        kilindiBaslik: "{ad} здійснено",
        siradaki: "Наступна",
        siradakiAd: "Далі: {ad}",
        kildimErisim: "Молитву {ad} здійснено",
        gunSatiriKilindi: ", здійснено",
        bitti: "Завершено",
        vakitCikti: "Час молитви минув",
        kabulAlt: "Молитву {ad} здійснено",
        kontrolAdi: "Молитву здійснено",
        kontrolAciklama: "Позначає поточну молитву як здійснену."
    )

    // ro
    static let ro = WidgetMetinleri(
        galeriAdi: "Timpul rugăciunii",
        galeriAciklama: "Rugăciunea curentă, timpul rămas până se încheie și orele de rugăciune de azi.",
        veriEski: "Deschideți aplicația ca să actualizați orele de rugăciune",
        konumYok: "Deschideți aplicația ca să setați locația",
        kilindiSiradaki: "{ad} efectuată · {sonraki} {saat}",
        adCikis: "{ad} · până la {saat}",
        siradakiAdSaat: "Urmează {ad} {saat}",
        vaktiCikisErisim: "Timpul pentru {ad}, se încheie {saat}",
        siradakiErisim: "Urmează {ad}, {saat}",
        cikisSaat: "Final {saat}",
        bitisSaat: "Final {saat}",
        kilindiBaslik: "{ad} efectuată",
        siradaki: "Urmează",
        siradakiAd: "Urmează {ad}",
        kildimErisim: "Am efectuat {ad}",
        gunSatiriKilindi: ", efectuată",
        bitti: "Încheiat",
        vakitCikti: "Timpul rugăciunii s-a încheiat",
        kabulAlt: "{ad} efectuată",
        kontrolAdi: "M-am rugat",
        kontrolAciklama: "Marchează rugăciunea curentă ca efectuată."
    )

    // hr
    static let hr = WidgetMetinleri(
        galeriAdi: "Vrijeme namaza",
        galeriAciklama: "Trenutačno vrijeme namaza, preostalo vrijeme do njegova isteka i današnja vremena namaza.",
        veriEski: "Otvorite aplikaciju da ažurirate vremena namaza",
        konumYok: "Otvorite aplikaciju da postavite lokaciju",
        kilindiSiradaki: "{ad}: klanjano · {sonraki} {saat}",
        adCikis: "{ad} · istječe {saat}",
        siradakiAdSaat: "Sljedeći {ad} {saat}",
        vaktiCikisErisim: "{ad}, istječe u {saat}",
        siradakiErisim: "Sljedeći: {ad}, {saat}",
        cikisSaat: "Istječe {saat}",
        bitisSaat: "Završava {saat}",
        kilindiBaslik: "{ad}: klanjano",
        siradaki: "Sljedeći",
        siradakiAd: "Sljedeći: {ad}",
        kildimErisim: "Klanjano: {ad}",
        gunSatiriKilindi: ", klanjano",
        bitti: "Završeno",
        vakitCikti: "Vrijeme namaza je isteklo",
        kabulAlt: "{ad}: klanjano",
        kontrolAdi: "Klanjano",
        kontrolAciklama: "Označava trenutačni namaz kao klanjan."
    )

    // sr
    static let sr = WidgetMetinleri(
        galeriAdi: "Време намаза",
        galeriAciklama: "Тренутни намаз, преостало време до истека његовог времена и данашња времена.",
        veriEski: "Отворите апликацију да ажурирате времена",
        konumYok: "Отворите апликацију да подесите своју локацију",
        kilindiSiradaki: "{ad}: клањано · {sonraki} {saat}",
        adCikis: "{ad} · истиче {saat}",
        siradakiAdSaat: "Следеће: {ad} {saat}",
        vaktiCikisErisim: "{ad}, истиче у {saat}",
        siradakiErisim: "Следеће: {ad}, {saat}",
        cikisSaat: "Истиче {saat}",
        bitisSaat: "Крај {saat}",
        kilindiBaslik: "{ad}: клањано",
        siradaki: "Следеће",
        siradakiAd: "Следеће: {ad}",
        kildimErisim: "Клањано: {ad}",
        gunSatiriKilindi: ", клањано",
        bitti: "Завршено",
        vakitCikti: "Време намаза је истекло",
        kabulAlt: "{ad}: клањано",
        kontrolAdi: "Клањано",
        kontrolAciklama: "Означава тренутни намаз као клањан."
    )

    // el
    static let el = WidgetMetinleri(
        galeriAdi: "Ώρα προσευχής",
        galeriAciklama: "Η τρέχουσα ώρα προσευχής, ο χρόνος έως τη λήξη της και οι σημερινές ώρες προσευχής.",
        veriEski: "Ανοίξτε την εφαρμογή για ενημέρωση των ωρών προσευχής",
        konumYok: "Ανοίξτε την εφαρμογή για να ορίσετε την τοποθεσία σας",
        kilindiSiradaki: "{ad}: τελέστηκε · {sonraki} {saat}",
        adCikis: "{ad} · λήγει {saat}",
        siradakiAdSaat: "Επόμενη {ad} {saat}",
        vaktiCikisErisim: "Ώρα {ad}, λήγει {saat}",
        siradakiErisim: "Επόμενη {ad}, {saat}",
        cikisSaat: "Λήγει {saat}",
        bitisSaat: "Λήγει {saat}",
        kilindiBaslik: "{ad}: τελέστηκε",
        siradaki: "Επόμενη",
        siradakiAd: "Επόμενη {ad}",
        kildimErisim: "Προσευχήθηκα την {ad}",
        gunSatiriKilindi: ", τελέστηκε",
        bitti: "Έληξε",
        vakitCikti: "Η ώρα προσευχής έληξε",
        kabulAlt: "{ad}: τελέστηκε",
        kontrolAdi: "Προσευχήθηκα",
        kontrolAciklama: "Σημειώνει την τρέχουσα προσευχή ως τελεσμένη."
    )

    // ku
    static let ku = WidgetMetinleri(
        galeriAdi: "Dema nimêjê",
        galeriAciklama: "Dema nimêjê ya niha, dema mayî heta ku biqede û demên nimêjê yên îro.",
        veriEski: "Ji bo nûkirina demên nimêjê sepanê vekin",
        konumYok: "Ji bo sazkirina cihê xwe sepanê vekin",
        kilindiSiradaki: "{ad} hat kirin · {sonraki} {saat}",
        adCikis: "{ad} · diqede {saat}",
        siradakiAdSaat: "Ya din {ad} {saat}",
        vaktiCikisErisim: "Dema {ad}, diqede {saat}",
        siradakiErisim: "Ya din {ad}, {saat}",
        cikisSaat: "Diqede {saat}",
        bitisSaat: "Diqede {saat}",
        kilindiBaslik: "{ad} hat kirin",
        siradaki: "Ya din",
        siradakiAd: "Ya din {ad}",
        kildimErisim: "Min nimêja {ad} kir",
        gunSatiriKilindi: ", hat kirin",
        bitti: "Qediya",
        vakitCikti: "Dema nimêjê qediya",
        kabulAlt: "{ad} hat kirin",
        kontrolAdi: "Min nimêj kir",
        kontrolAciklama: "Nimêja niha wekî kirî nîşan dike."
    )

    // tk — Türkmen dili (beta); terminler src/core/dil/sozluk/tk
    static let tk = WidgetMetinleri(
        galeriAdi: "Namaz wagty",
        galeriAciklama: "Häzirki namaz wagty, onuň gutarmagyna galan wagt we şu günki namaz wagtlary.",
        veriEski: "Namaz wagtlaryny täzelemek üçin programmany açyň",
        konumYok: "Ýerleşişiňizi kesgitlemek üçin programmany açyň",
        kilindiSiradaki: "{ad} okaldy · {sonraki} {saat}",
        adCikis: "{ad} · gutarýar {saat}",
        siradakiAdSaat: "Indiki {ad} {saat}",
        vaktiCikisErisim: "{ad} wagty, gutarýar {saat}",
        siradakiErisim: "Indiki {ad}, {saat}",
        cikisSaat: "Gutarýar {saat}",
        bitisSaat: "Gutarýar {saat}",
        kilindiBaslik: "{ad} okaldy",
        siradaki: "Indiki",
        siradakiAd: "Indiki {ad}",
        kildimErisim: "{ad} namazyny okadym",
        gunSatiriKilindi: ", okaldy",
        bitti: "Gutardy",
        vakitCikti: "Namaz wagty gutardy",
        kabulAlt: "{ad} okaldy",
        kontrolAdi: "Okadym",
        kontrolAciklama: "Häzirki namazy okaldy diýip belleýär."
    )

    // tt
    static let tt = WidgetMetinleri(
        galeriAdi: "Намаз вакыты",
        galeriAciklama: "Хәзерге намаз вакыты, ул чыкканчы калган вакыт һәм бүгенге намаз вакытлары.",
        veriEski: "Намаз вакытларын яңарту өчен кушымтаны ачыгыз",
        konumYok: "Урнашу урыныгызны көйләү өчен кушымтаны ачыгыз",
        kilindiSiradaki: "{ad} укылды · {sonraki} {saat}",
        adCikis: "{ad} · чыгуы {saat}",
        siradakiAdSaat: "Чираттагы {ad} {saat}",
        vaktiCikisErisim: "{ad} вакыты, чыгуы {saat}",
        siradakiErisim: "Чираттагы {ad}, {saat}",
        cikisSaat: "Чыгуы {saat}",
        bitisSaat: "Бетүе {saat}",
        kilindiBaslik: "{ad} укылды",
        siradaki: "Киләсе",
        siradakiAd: "Чираттагы {ad}",
        kildimErisim: "{ad} намазын укыдым",
        gunSatiriKilindi: ", укылды",
        bitti: "Бетте",
        vakitCikti: "Намаз вакыты чыкты",
        kabulAlt: "{ad} укылды",
        kontrolAdi: "Укыдым",
        kontrolAciklama: "Хәзерге намазны укылды дип билгели."
    )

    // sd
    static let sd = WidgetMetinleri(
        galeriAdi: "نماز جو وقت",
        galeriAciklama: "موجوده نماز جو وقت، ان جي پڄاڻيءَ تائين باقي وقت ۽ اڄ جا نماز جا وقت.",
        veriEski: "نماز جا وقت اپڊيٽ ڪرڻ لاءِ ايپ کوليو",
        konumYok: "پنهنجي جڳهه مقرر ڪرڻ لاءِ ايپ کوليو",
        kilindiSiradaki: "{ad} پڙهي وئي · {sonraki} {saat}",
        adCikis: "{ad} · پڄاڻي {saat}",
        siradakiAdSaat: "ايندڙ {ad} {saat}",
        vaktiCikisErisim: "{ad} جو وقت، پڄاڻي {saat}",
        siradakiErisim: "ايندڙ {ad}، {saat}",
        cikisSaat: "پڄاڻي {saat}",
        bitisSaat: "پڄاڻي {saat}",
        kilindiBaslik: "{ad} پڙهي وئي",
        siradaki: "ايندڙ",
        siradakiAd: "ايندڙ {ad}",
        kildimErisim: "{ad} پڙهي ورتي",
        gunSatiriKilindi: "، پڙهي وئي",
        bitti: "پورو ٿيو",
        vakitCikti: "نماز جو وقت ختم ٿي ويو",
        kabulAlt: "{ad} پڙهي وئي",
        kontrolAdi: "نماز پڙهي ورتي",
        kontrolAciklama: "موجوده نماز تي پڙهي وئي جو نشان لڳائي ٿو."
    )

    // pl
    static let pl = WidgetMetinleri(
        galeriAdi: "Czas modlitwy",
        galeriAciklama: "Bieżący czas modlitwy, czas do jego końca i dzisiejsze czasy modlitw.",
        veriEski: "Otwórz aplikację, aby zaktualizować czasy modlitw",
        konumYok: "Otwórz aplikację, aby ustawić lokalizację",
        kilindiSiradaki: "{ad} odprawiona · {sonraki} {saat}",
        adCikis: "{ad} · koniec {saat}",
        siradakiAdSaat: "Następna {ad} {saat}",
        vaktiCikisErisim: "Czas modlitwy {ad}, koniec {saat}",
        siradakiErisim: "Następna {ad}, {saat}",
        cikisSaat: "Koniec {saat}",
        bitisSaat: "Koniec {saat}",
        kilindiBaslik: "{ad} odprawiona",
        siradaki: "Następna",
        siradakiAd: "Następna {ad}",
        kildimErisim: "Modlitwa {ad} odprawiona",
        gunSatiriKilindi: ", odprawiona",
        bitti: "Zakończona",
        vakitCikti: "Czas modlitwy minął",
        kabulAlt: "{ad} odprawiona",
        kontrolAdi: "Odprawiono",
        kontrolAciklama: "Oznacza bieżącą modlitwę jako odprawioną."
    )

    // ja
    static let ja = WidgetMetinleri(
        galeriAdi: "礼拝時間",
        galeriAciklama: "現在の礼拝時間、終わるまでの残り時間、今日の礼拝時間。",
        veriEski: "礼拝時間を更新するにはアプリを開いてください",
        konumYok: "現在地を設定するにはアプリを開いてください",
        kilindiSiradaki: "{ad}礼拝済み・{sonraki} {saat}",
        adCikis: "{ad}・{saat}に終了",
        siradakiAdSaat: "次 {ad} {saat}",
        vaktiCikisErisim: "{ad}の時間、{saat}に終了",
        siradakiErisim: "次は{ad}、{saat}",
        cikisSaat: "{saat}に終了",
        bitisSaat: "{saat}に終了",
        kilindiBaslik: "{ad}は礼拝済み",
        siradaki: "次",
        siradakiAd: "次 {ad}",
        kildimErisim: "{ad}を礼拝しました",
        gunSatiriKilindi: "、礼拝済み",
        bitti: "終了",
        vakitCikti: "礼拝時間が終わりました",
        kabulAlt: "{ad}は礼拝済み",
        kontrolAdi: "礼拝しました",
        kontrolAciklama: "現在の礼拝を礼拝済みにします。"
    )

    // gu — Gucaratça (beta): JS `sozluk/gu`; Kıldım "નમાઝ પઢી લીધી", Kılındı "પઢી લીધી"
    static let gu = WidgetMetinleri(
        galeriAdi: "નમાઝનો સમય",
        galeriAciklama: "હાલની નમાઝનો સમય, તે પૂરો થવામાં બાકી સમય અને આજના નમાઝના સમય.",
        veriEski: "નમાઝના સમય અપડેટ કરવા ઍપ ખોલો",
        konumYok: "તમારું લોકેશન ગોઠવવા ઍપ ખોલો",
        kilindiSiradaki: "{ad} પઢી લીધી · {sonraki} {saat}",
        adCikis: "{ad} · અંત {saat}",
        siradakiAdSaat: "આગામી {ad} {saat}",
        vaktiCikisErisim: "{ad}નો સમય, અંત {saat}",
        siradakiErisim: "આગામી {ad}, {saat}",
        cikisSaat: "અંત {saat}",
        bitisSaat: "અંત {saat}",
        kilindiBaslik: "{ad} પઢી લીધી",
        siradaki: "આગામી",
        siradakiAd: "આગામી {ad}",
        kildimErisim: "{ad} પઢી લીધી તરીકે નોંધો",
        gunSatiriKilindi: ", પઢી લીધી",
        bitti: "પૂરું",
        vakitCikti: "નમાઝનો સમય પૂરો થયો",
        kabulAlt: "{ad} પઢી લીધી",
        kontrolAdi: "નમાઝ પઢી લીધી",
        kontrolAciklama: "હાલની નમાઝ પઢી લીધી તરીકે નોંધે છે."
    )

    // bg
    static let bg = WidgetMetinleri(
        galeriAdi: "Време за намаз",
        galeriAciklama: "Текущото време за намаз, оставащото време до края му и днешните времена за намаз.",
        veriEski: "Отворете приложението, за да обновите времената за намаз",
        konumYok: "Отворете приложението, за да зададете местоположението си",
        kilindiSiradaki: "{ad} е изпълнен · {sonraki} {saat}",
        adCikis: "{ad} · до {saat}",
        siradakiAdSaat: "Следва {ad} {saat}",
        vaktiCikisErisim: "Време за {ad}, до {saat}",
        siradakiErisim: "Следва {ad}, {saat}",
        cikisSaat: "До {saat}",
        bitisSaat: "До {saat}",
        kilindiBaslik: "{ad} е изпълнен",
        siradaki: "Следва",
        siradakiAd: "Следва {ad}",
        kildimErisim: "Изпълних {ad}",
        gunSatiriKilindi: ", изпълнен",
        bitti: "Свърши",
        vakitCikti: "Времето за намаз изтече",
        kabulAlt: "{ad} е изпълнен",
        kontrolAdi: "Изпълних",
        kontrolAciklama: "Отбелязва текущия намаз като изпълнен."
    )

    // mk
    static let mk = WidgetMetinleri(
        galeriAdi: "Време за намаз",
        galeriAciklama: "Тековниот намаз, преостанатото време до истекот на неговото време и денешните времиња.",
        veriEski: "Отворете ја апликацијата за да ги ажурирате времињата",
        konumYok: "Отворете ја апликацијата за да ја поставите вашата локација",
        kilindiSiradaki: "{ad}: клањано · {sonraki} {saat}",
        adCikis: "{ad} · истекува {saat}",
        siradakiAdSaat: "Следен: {ad} {saat}",
        vaktiCikisErisim: "{ad}, истекува во {saat}",
        siradakiErisim: "Следен: {ad}, {saat}",
        cikisSaat: "Истекува {saat}",
        bitisSaat: "Крај {saat}",
        kilindiBaslik: "{ad}: клањано",
        siradaki: "Следен",
        siradakiAd: "Следен: {ad}",
        kildimErisim: "Клањав: {ad}",
        gunSatiriKilindi: ", клањано",
        bitti: "Завршено",
        vakitCikti: "Времето за намаз истече",
        kabulAlt: "{ad}: клањано",
        kontrolAdi: "Клањав",
        kontrolAciklama: "Го означува тековниот намаз како клањан."
    )

    // fil
    static let fil = WidgetMetinleri(
        galeriAdi: "Oras ng dasal",
        galeriAciklama: "Ang kasalukuyang oras ng dasal, ang natitirang oras bago ito matapos at ang mga oras ng dasal ngayon.",
        veriEski: "Buksan ang app para i-update ang mga oras ng dasal",
        konumYok: "Buksan ang app para itakda ang lokasyon",
        kilindiSiradaki: "Naidasal na ang {ad} · {sonraki} {saat}",
        adCikis: "{ad} · matatapos {saat}",
        siradakiAdSaat: "Susunod {ad} {saat}",
        vaktiCikisErisim: "Oras ng {ad}, matatapos {saat}",
        siradakiErisim: "Susunod {ad}, {saat}",
        cikisSaat: "Matatapos {saat}",
        bitisSaat: "Matatapos {saat}",
        kilindiBaslik: "Naidasal na ang {ad}",
        siradaki: "Susunod",
        siradakiAd: "Susunod {ad}",
        kildimErisim: "Nagdasal ako ng {ad}",
        gunSatiriKilindi: ", naidasal na",
        bitti: "Tapos na",
        vakitCikti: "Tapos na ang oras ng dasal",
        kabulAlt: "Naidasal na ang {ad}",
        kontrolAdi: "Nagdasal ako",
        kontrolAciklama: "Minamarkahang naidasal na ang kasalukuyang dasal."
    )

    // te
    static let te = WidgetMetinleri(
        galeriAdi: "నమాజ్ సమయం",
        galeriAciklama: "ప్రస్తుత నమాజ్ సమయం, అది ముగియడానికి మిగిలిన సమయం, ఈ రోజు నమాజ్ సమయాలు.",
        veriEski: "నమాజ్ సమయాలను అప్‌డేట్ చేయడానికి యాప్‌ను తెరవండి",
        konumYok: "మీ లొకేషన్‌ను సెట్ చేయడానికి యాప్‌ను తెరవండి",
        kilindiSiradaki: "{ad} ఆచరించబడింది · {sonraki} {saat}",
        adCikis: "{ad} · ముగింపు {saat}",
        siradakiAdSaat: "తదుపరి {ad} {saat}",
        vaktiCikisErisim: "{ad} సమయం, {saat}కి ముగుస్తుంది",
        siradakiErisim: "తదుపరి {ad}, {saat}",
        cikisSaat: "ముగింపు {saat}",
        bitisSaat: "ముగింపు {saat}",
        kilindiBaslik: "{ad} ఆచరించబడింది",
        siradaki: "తదుపరి",
        siradakiAd: "తదుపరి {ad}",
        kildimErisim: "{ad} ఆచరించాను",
        gunSatiriKilindi: ", ఆచరించబడింది",
        bitti: "ముగిసింది",
        vakitCikti: "నమాజ్ సమయం ముగిసింది",
        kabulAlt: "{ad} ఆచరించబడింది",
        kontrolAdi: "ఆచరించాను",
        kontrolAciklama: "ప్రస్తుత నమాజ్‌ను ఆచరించినట్లు గుర్తిస్తుంది."
    )

    // kn
    static let kn = WidgetMetinleri(
        galeriAdi: "ನಮಾಝ್ ಸಮಯ",
        galeriAciklama: "ಪ್ರಸ್ತುತ ನಮಾಝ್ ಸಮಯ, ಅದು ಮುಗಿಯಲು ಉಳಿದ ಸಮಯ ಮತ್ತು ಇಂದಿನ ನಮಾಝ್ ಸಮಯಗಳು.",
        veriEski: "ನಮಾಝ್ ಸಮಯಗಳನ್ನು ನವೀಕರಿಸಲು ಆ್ಯಪ್ ತೆರೆಯಿರಿ",
        konumYok: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹೊಂದಿಸಲು ಆ್ಯಪ್ ತೆರೆಯಿರಿ",
        kilindiSiradaki: "{ad} ನಿರ್ವಹಿಸಲಾಗಿದೆ · {sonraki} {saat}",
        adCikis: "{ad} · ಮುಕ್ತಾಯ {saat}",
        siradakiAdSaat: "ಮುಂದಿನದು {ad} {saat}",
        vaktiCikisErisim: "{ad} ಸಮಯ, ಮುಕ್ತಾಯ {saat}",
        siradakiErisim: "ಮುಂದಿನದು {ad}, {saat}",
        cikisSaat: "ಮುಕ್ತಾಯ {saat}",
        bitisSaat: "ಮುಕ್ತಾಯ {saat}",
        kilindiBaslik: "{ad} ನಿರ್ವಹಿಸಲಾಗಿದೆ",
        siradaki: "ಮುಂದಿನದು",
        siradakiAd: "ಮುಂದಿನದು {ad}",
        kildimErisim: "{ad} ನಮಾಝ್ ಮಾಡಿದೆ",
        gunSatiriKilindi: ", ನಿರ್ವಹಿಸಲಾಗಿದೆ",
        bitti: "ಮುಗಿದಿದೆ",
        vakitCikti: "ನಮಾಝ್ ಸಮಯ ಮುಗಿದಿದೆ",
        kabulAlt: "{ad} ನಿರ್ವಹಿಸಲಾಗಿದೆ",
        kontrolAdi: "ನಮಾಝ್ ಮಾಡಿದೆ",
        kontrolAciklama: "ಪ್ರಸ್ತುತ ನಮಾಝನ್ನು ನಿರ್ವಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸುತ್ತದೆ."
    )

    // mr
    static let mr = WidgetMetinleri(
        galeriAdi: "नमाजची वेळ",
        galeriAciklama: "सध्याची नमाजची वेळ, ती संपेपर्यंत उरलेला वेळ आणि आजच्या नमाजच्या वेळा.",
        veriEski: "नमाजच्या वेळा अपडेट करण्यासाठी ॲप उघडा",
        konumYok: "तुमचे स्थान सेट करण्यासाठी ॲप उघडा",
        kilindiSiradaki: "{ad} अदा झाली · {sonraki} {saat}",
        adCikis: "{ad} · {saat} ला संपते",
        siradakiAdSaat: "पुढील {ad} {saat}",
        vaktiCikisErisim: "{ad} ची वेळ, {saat} ला संपते",
        siradakiErisim: "पुढील {ad}, {saat}",
        cikisSaat: "{saat} ला संपते",
        bitisSaat: "{saat} ला संपते",
        kilindiBaslik: "{ad} अदा झाली",
        siradaki: "पुढील",
        siradakiAd: "पुढील {ad}",
        kildimErisim: "{ad} ची नमाज पढली",
        gunSatiriKilindi: ", अदा झाली",
        bitti: "संपली",
        vakitCikti: "नमाजची वेळ संपली",
        kabulAlt: "{ad} अदा झाली",
        kontrolAdi: "नमाज पढली",
        kontrolAciklama: "सध्याची नमाज \"अदा झाली\" म्हणून नोंदवते."
    )

    // pa (yalnız Şahmuki); terimler JS sozluk/pa (Kıldım "نماز پڑھ لئی", Kılındı "ادا ہو گئی")
    static let pa = WidgetMetinleri(
        galeriAdi: "نماز دا وقت",
        galeriAciklama: "موجودہ نماز دا وقت، اوہدے مکن وچ باقی وقت تے اج دیاں نمازاں دے وقت۔",
        veriEski: "نماز دے وقت اپ ڈیٹ کرن لئی ایپ کھولو",
        konumYok: "اپنا مقام چُنن لئی ایپ کھولو",
        kilindiSiradaki: "{ad} ادا ہو گئی · {sonraki} {saat}",
        adCikis: "{ad} · اختتام {saat}",
        siradakiAdSaat: "اگلی {ad} {saat}",
        vaktiCikisErisim: "{ad} دا وقت، اختتام {saat}",
        siradakiErisim: "اگلی نماز {ad}، {saat}",
        cikisSaat: "اختتام {saat}",
        bitisSaat: "اختتام {saat}",
        kilindiBaslik: "{ad} ادا ہو گئی",
        siradaki: "اگلی",
        siradakiAd: "اگلی {ad}",
        kildimErisim: "{ad} دی نماز پڑھ لئی",
        gunSatiriKilindi: "، ادا ہو گئی",
        bitti: "مک گیا",
        vakitCikti: "نماز دا وقت مک گیا",
        kabulAlt: "{ad} دی نماز ادا ہو گئی",
        kontrolAdi: "نماز پڑھ لئی",
        kontrolAciklama: "موجودہ نماز تے ادا ہو گئی دا نشان لاندا اے۔"
    )

    // as
    static let `as` = WidgetMetinleri(
        galeriAdi: "নামাজৰ সময়",
        galeriAciklama: "বৰ্তমানৰ নামাজৰ সময়, শেষ হ’বলৈ বাকী সময় আৰু আজিৰ নামাজৰ সময়।",
        veriEski: "নামাজৰ সময় আপডে’ট কৰিবলৈ এপটো খোলক",
        konumYok: "আপোনাৰ অৱস্থান ছেট কৰিবলৈ এপটো খোলক",
        kilindiSiradaki: "{ad} পঢ়া হ’ল · {sonraki} {saat}",
        adCikis: "{ad} · {saat} বজাত শেষ",
        siradakiAdSaat: "পৰৱৰ্তী {ad} {saat}",
        vaktiCikisErisim: "{ad}ৰ ওৱাক্ত, {saat} বজাত শেষ",
        siradakiErisim: "পৰৱৰ্তী {ad}, {saat}",
        cikisSaat: "{saat} বজাত শেষ",
        bitisSaat: "{saat} বজাত শেষ",
        kilindiBaslik: "{ad} পঢ়া হ’ল",
        siradaki: "পৰৱৰ্তী",
        siradakiAd: "পৰৱৰ্তী {ad}",
        kildimErisim: "{ad}ৰ নামাজ পঢ়িছোঁ",
        gunSatiriKilindi: ", পঢ়া হ’ল",
        bitti: "শেষ হ’ল",
        vakitCikti: "নামাজৰ সময় শেষ হ’ল",
        kabulAlt: "{ad} পঢ়া হ’ল",
        kontrolAdi: "নামাজ পঢ়িছোঁ",
        kontrolAciklama: "বৰ্তমানৰ নামাজ পঢ়া হ’ল বুলি চিহ্নিত কৰে।"
    )

    // ne
    static let ne = WidgetMetinleri(
        galeriAdi: "नमाजको समय",
        galeriAciklama: "हालको नमाजको समय, सकिन बाँकी समय र आजका नमाजका समय।",
        veriEski: "नमाजका समय अपडेट गर्न एप खोल्नुहोस्",
        konumYok: "लोकेसन सेट गर्न एप खोल्नुहोस्",
        kilindiSiradaki: "{ad} पढियो · {sonraki} {saat}",
        adCikis: "{ad} · {saat} मा सकिन्छ",
        siradakiAdSaat: "अर्को {ad} {saat}",
        vaktiCikisErisim: "{ad}को समय, {saat} मा सकिन्छ",
        siradakiErisim: "अर्को {ad}, {saat}",
        cikisSaat: "{saat} मा सकिन्छ",
        bitisSaat: "{saat} मा सकिन्छ",
        kilindiBaslik: "{ad} पढियो",
        siradaki: "अर्को",
        siradakiAd: "अर्को {ad}",
        kildimErisim: "{ad} पढें",
        gunSatiriKilindi: ", पढियो",
        bitti: "सकियो",
        vakitCikti: "नमाजको समय सकियो",
        kabulAlt: "{ad} पढियो",
        kontrolAdi: "नमाज पढें",
        kontrolAciklama: "हालको नमाजमा \"पढियो\" चिन्ह लगाउँछ।"
    )

    // si — Sinhala (beta): JS `sozluk/si`; Kıldım "ඉටු කළෙමි", Kılındı "ඉටු කළා"
    static let si = WidgetMetinleri(
        galeriAdi: "සලාත් වේලාව",
        galeriAciklama: "වත්මන් සලාත් වේලාව, එය අවසන් වන තෙක් ඉතිරි කාලය සහ අද සලාත් වේලාවන්.",
        veriEski: "සලාත් වේලාවන් යාවත්කාලීන කිරීමට යෙදුම විවෘත කරන්න",
        konumYok: "ඔබගේ ස්ථානය සැකසීමට යෙදුම විවෘත කරන්න",
        kilindiSiradaki: "{ad} ඉටු කළා · {sonraki} {saat}",
        adCikis: "{ad} · {saat}ට අවසන්",
        siradakiAdSaat: "ඊළඟ {ad} {saat}",
        vaktiCikisErisim: "{ad} වේලාව, {saat}ට අවසන්",
        siradakiErisim: "ඊළඟ {ad}, {saat}",
        cikisSaat: "{saat}ට අවසන්",
        bitisSaat: "{saat}ට අවසන්",
        kilindiBaslik: "{ad} ඉටු කළා",
        siradaki: "ඊළඟ",
        siradakiAd: "ඊළඟ {ad}",
        kildimErisim: "{ad} ඉටු කළෙමි",
        gunSatiriKilindi: ", ඉටු කළා",
        bitti: "අවසන්",
        vakitCikti: "සලාත් වේලාව අවසන්",
        kabulAlt: "{ad} ඉටු කළා",
        kontrolAdi: "ඉටු කළෙමි",
        kontrolAciklama: "වත්මන් සලාතය ඉටු කළ බව සලකුණු කරයි."
    )

    // km
    static let km = WidgetMetinleri(
        galeriAdi: "ពេលសឡាត",
        galeriAciklama: "ពេលសឡាតបច្ចុប្បន្ន ពេលនៅសល់មុនវាផុត និងពេលសឡាតថ្ងៃនេះ។",
        veriEski: "បើកកម្មវិធីដើម្បីធ្វើបច្ចុប្បន្នភាពពេលសឡាត",
        konumYok: "បើកកម្មវិធីដើម្បីកំណត់ទីតាំងរបស់អ្នក",
        kilindiSiradaki: "បានសឡាត{ad} · {sonraki} {saat}",
        adCikis: "{ad} · ផុត {saat}",
        siradakiAdSaat: "បន្ទាប់{ad} {saat}",
        vaktiCikisErisim: "ពេល{ad} ផុត {saat}",
        siradakiErisim: "បន្ទាប់{ad} {saat}",
        cikisSaat: "ផុត {saat}",
        bitisSaat: "ចប់ {saat}",
        kilindiBaslik: "បានសឡាត{ad}",
        siradaki: "បន្ទាប់",
        siradakiAd: "បន្ទាប់{ad}",
        kildimErisim: "បានសឡាត{ad}ហើយ",
        gunSatiriKilindi: " បានសឡាត",
        bitti: "បានចប់",
        vakitCikti: "ពេលសឡាតបានផុត",
        kabulAlt: "បានសឡាត{ad}",
        kontrolAdi: "បានសឡាតហើយ",
        kontrolAciklama: "សម្គាល់សឡាតបច្ចុប្បន្នថាបានសឡាត។"
    )

    // he
    static let he = WidgetMetinleri(
        galeriAdi: "זמן תפילה",
        galeriAciklama: "זמן התפילה הנוכחי, הזמן שנותר עד שהוא מסתיים וזמני התפילה של היום.",
        veriEski: "פתחו את האפליקציה כדי לעדכן את זמני התפילה",
        konumYok: "פתחו את האפליקציה כדי להגדיר את המיקום",
        kilindiSiradaki: "{ad} בוצעה · {sonraki} {saat}",
        adCikis: "{ad} · סיום {saat}",
        siradakiAdSaat: "הבאה {ad} {saat}",
        vaktiCikisErisim: "זמן {ad}, מסתיים ב-{saat}",
        siradakiErisim: "הבאה {ad}, {saat}",
        cikisSaat: "סיום {saat}",
        bitisSaat: "סיום {saat}",
        kilindiBaslik: "{ad} בוצעה",
        siradaki: "הבאה",
        siradakiAd: "הבאה {ad}",
        kildimErisim: "התפללתי את {ad}",
        gunSatiriKilindi: ", בוצעה",
        bitti: "הסתיים",
        vakitCikti: "זמן התפילה הסתיים",
        kabulAlt: "{ad} בוצעה",
        kontrolAdi: "התפללתי",
        kontrolAciklama: "מסמן את התפילה הנוכחית כבוצעה."
    )

    // ka — Gürcüce (beta); terimler src/core/dil/sozluk/ka
    static let ka = WidgetMetinleri(
        galeriAdi: "ლოცვის დრო",
        galeriAciklama: "მიმდინარე ლოცვის დრო, მის დასრულებამდე დარჩენილი დრო და დღევანდელი ლოცვის დროები.",
        veriEski: "ლოცვის დროების გასაახლებლად გახსენით აპი",
        konumYok: "მდებარეობის მისათითებლად გახსენით აპი",
        kilindiSiradaki: "{ad} შესრულებულია · {sonraki} {saat}",
        adCikis: "{ad} · სრულდება {saat}",
        siradakiAdSaat: "შემდეგი: {ad} {saat}",
        vaktiCikisErisim: "{ad}, სრულდება {saat}-ზე",
        siradakiErisim: "შემდეგი: {ad}, {saat}",
        cikisSaat: "სრულდება {saat}",
        bitisSaat: "სრულდება {saat}",
        kilindiBaslik: "{ad} შესრულებულია",
        siradaki: "შემდეგი",
        siradakiAd: "შემდეგი: {ad}",
        kildimErisim: "{ad}: ვილოცე",
        gunSatiriKilindi: ", შესრულებულია",
        bitti: "დასრულდა",
        vakitCikti: "ლოცვის დრო დასრულდა",
        kabulAlt: "{ad} შესრულებულია",
        kontrolAdi: "ვილოცე",
        kontrolAciklama: "მიმდინარე ლოცვას შესრულებულად მონიშნავს."
    )

    // lt (vakit adı çekimsiz, çekim "malda"da; "Kıldım" = "Atlikau maldą")
    static let lt = WidgetMetinleri(
        galeriAdi: "Maldos laikas",
        galeriAciklama: "Dabartinis maldos laikas, kiek liko iki jo pabaigos, ir šiandienos maldų laikai.",
        veriEski: "Kad atnaujintumėte maldų laikus, atidarykite programą",
        konumYok: "Kad nustatytumėte vietovę, atidarykite programą",
        kilindiSiradaki: "{ad} atlikta · {sonraki} {saat}",
        adCikis: "{ad} · baigiasi {saat}",
        siradakiAdSaat: "Kita: {ad} {saat}",
        vaktiCikisErisim: "{ad} maldos laikas, baigiasi {saat}",
        siradakiErisim: "Kita: {ad}, {saat}",
        cikisSaat: "Baigiasi {saat}",
        bitisSaat: "Baigiasi {saat}",
        kilindiBaslik: "{ad} atlikta",
        siradaki: "Kita",
        siradakiAd: "Kita: {ad}",
        kildimErisim: "Atlikau {ad} maldą",
        gunSatiriKilindi: ", atlikta",
        bitti: "Baigėsi",
        vakitCikti: "Maldos laikas baigėsi",
        kabulAlt: "{ad} malda atlikta",
        kontrolAdi: "Atlikau maldą",
        kontrolAciklama: "Pažymi dabartinę maldą kaip atliktą."
    )

    // mg
    static let mg = WidgetMetinleri(
        galeriAdi: "Fotoanan'ny soalat",
        galeriAciklama: "Ny fotoanan'ny soalat ankehitriny, ny fotoana sisa mandra-pifaranany ary ny fotoanan'ny soalat anio.",
        veriEski: "Sokafy ny fampiharana mba hanavaozana ny fotoanan'ny soalat",
        konumYok: "Sokafy ny fampiharana mba hametrahana ny toeranao",
        kilindiSiradaki: "Vita ny {ad} · {sonraki} {saat}",
        adCikis: "{ad} · tapitra {saat}",
        siradakiAdSaat: "Manaraka {ad} {saat}",
        vaktiCikisErisim: "Fotoanan'ny {ad}, tapitra {saat}",
        siradakiErisim: "Manaraka {ad}, {saat}",
        cikisSaat: "Tapitra {saat}",
        bitisSaat: "Tapitra {saat}",
        kilindiBaslik: "Vita ny {ad}",
        siradaki: "Manaraka",
        siradakiAd: "Manaraka {ad}",
        kildimErisim: "Nivavaka ny {ad} aho",
        gunSatiriKilindi: ", vita",
        bitti: "Tapitra",
        vakitCikti: "Tapitra ny fotoanan'ny soalat",
        kabulAlt: "Vita ny {ad}",
        kontrolAdi: "Nivavaka aho",
        kontrolAciklama: "Manamarika ho vita ny soalat ankehitriny."
    )

    static let lg = WidgetMetinleri(
        galeriAdi: "Ekiseera ky’esswala",
        galeriAciklama: "Ekiseera ky’esswala ekiriwo, ekiseera ekisigadde okuggwaako n’ebiseera by’esswala bya leero.",
        veriEski: "Ggulawo app ozze obuggya ebiseera by’esswala",
        konumYok: "Ggulawo app oteekewo ekifo kyo",
        kilindiSiradaki: "{ad} esaaliddwa · {sonraki} {saat}",
        adCikis: "{ad} · kiggwaako {saat}",
        siradakiAdSaat: "Eddako {ad} {saat}",
        vaktiCikisErisim: "Kiseera kya {ad}, kiggwaako {saat}",
        siradakiErisim: "Eddako {ad}, {saat}",
        cikisSaat: "Kiggwaako {saat}",
        bitisSaat: "Kiggwaako {saat}",
        kilindiBaslik: "{ad} esaaliddwa",
        siradaki: "Eddako",
        siradakiAd: "Eddako {ad}",
        kildimErisim: "{ad}: Nsaaze",
        gunSatiriKilindi: ", esaaliddwa",
        bitti: "Kiweddeko",
        vakitCikti: "Ekiseera ky’esswala kiweddeko",
        kabulAlt: "{ad} esaaliddwa",
        kontrolAdi: "Nsaaze",
        kontrolAciklama: "Kiteeka akabonero ku sswala eriwo nti esaaliddwa."
    )

    // rw
    static let rw = WidgetMetinleri(
        galeriAdi: "Igihe cy’iswala",
        galeriAciklama: "Igihe cy’iswala kiriho, igihe gisigaye ngo kirangire n’ibihe by’iswala by’uyu munsi.",
        veriEski: "Mufungure porogaramu kugira ngo ibihe by’iswala bivugururwe",
        konumYok: "Mufungure porogaramu mushyireho aho muherereye",
        kilindiSiradaki: "{ad} yasaliwe · {sonraki} {saat}",
        adCikis: "{ad} · irangira {saat}",
        siradakiAdSaat: "Ikurikira {ad} {saat}",
        vaktiCikisErisim: "Igihe cya {ad}, kirangira {saat}",
        siradakiErisim: "Ikurikira ni {ad}, {saat}",
        cikisSaat: "Irangira {saat}",
        bitisSaat: "Irangira {saat}",
        kilindiBaslik: "{ad} yasaliwe",
        siradaki: "Ikurikira",
        siradakiAd: "Ikurikira {ad}",
        kildimErisim: "Nasali {ad}",
        gunSatiriKilindi: ", yasaliwe",
        bitti: "Byarangiye",
        vakitCikti: "Igihe cy’iswala cyarangiye",
        kabulAlt: "{ad} yasaliwe",
        kontrolAdi: "Nasali",
        kontrolAciklama: "Byemeza ko iswala y’iki gihe yasaliwe."
    )

    // rn
    static let rn = WidgetMetinleri(
        galeriAdi: "Igihe c’isengesho",
        galeriAciklama: "Igihe c’isengesho c’ubu, igihe gisigaye ngo kirangire n’ibihe vy’isengesho vy’uyu musi.",
        veriEski: "Mwugurure porogarama kugira muvugurure ibihe vy’isengesho",
        konumYok: "Mwugurure porogarama kugira mushireho ikibanza canyu",
        kilindiSiradaki: "{ad} ryasenzwe · {sonraki} {saat}",
        adCikis: "{ad} · kirangira {saat}",
        siradakiAdSaat: "Rikurikira {ad} {saat}",
        vaktiCikisErisim: "Igihe ca {ad}, kirangira {saat}",
        siradakiErisim: "Rikurikira {ad}, {saat}",
        cikisSaat: "Kirangira {saat}",
        bitisSaat: "Kirangira {saat}",
        kilindiBaslik: "{ad} ryasenzwe",
        siradaki: "Rikurikira",
        siradakiAd: "Rikurikira {ad}",
        kildimErisim: "Nasenze {ad}",
        gunSatiriKilindi: ", ryasenzwe",
        bitti: "Carangiye",
        vakitCikti: "Igihe c’isengesho carangiye",
        kabulAlt: "{ad} ryasenzwe",
        kontrolAdi: "Nasenze",
        kontrolAciklama: "Yemeza ko isengesho ry’ubu ryasenzwe."
    )

    // ln
    static let ln = WidgetMetinleri(
        galeriAdi: "Ntango ya losambo",
        galeriAciklama: "Ntango ya losambo ya sikoyo, ntango etikali tii esila mpe bangonga ya losambo ya lɛlɔ.",
        veriEski: "Bofungola aplikasiɔ mpɔ na kozongisa bangonga ya losambo ya sika",
        konumYok: "Bofungola aplikasiɔ mpɔ na kotia esika na bino",
        kilindiSiradaki: "{ad} esambelami · {sonraki} {saat}",
        adCikis: "{ad} · ekosila {saat}",
        siradakiAdSaat: "Oyo elandi {ad} {saat}",
        vaktiCikisErisim: "Ntango ya {ad}, ekosila {saat}",
        siradakiErisim: "Oyo elandi {ad}, {saat}",
        cikisSaat: "Ekosila {saat}",
        bitisSaat: "Ekosila {saat}",
        kilindiBaslik: "{ad} esambelami",
        siradaki: "Elandi",
        siradakiAd: "Oyo elandi {ad}",
        kildimErisim: "Nasambeli {ad}",
        gunSatiriKilindi: ", esambelami",
        bitti: "Esili",
        vakitCikti: "Ntango ya losambo esili",
        kabulAlt: "{ad} esambelami",
        kontrolAdi: "Nasambeli",
        kontrolAciklama: "Etiaka elembo ete losambo ya sikoyo esambelami."
    )

    // ÇEVİRİ: dag
    static let dag = WidgetMetinleri(
        galeriAdi: "Prayer time",
        galeriAciklama: "The current prayer time, the time left until it ends and today's prayer times.",
        veriEski: "Open the app to update prayer times",
        konumYok: "Open the app to set your location",
        kilindiSiradaki: "{ad} prayed · {sonraki} {saat}",
        adCikis: "{ad} · ends {saat}",
        siradakiAdSaat: "Next {ad} {saat}",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        cikisSaat: "Ends {saat}",
        bitisSaat: "Ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        siradakiAd: "Next {ad}",
        kildimErisim: "I've prayed {ad}",
        gunSatiriKilindi: ", prayed",
        bitti: "Ended",
        vakitCikti: "Prayer time is over",
        kabulAlt: "{ad} prayed",
        kontrolAdi: "I've prayed",
        kontrolAciklama: "Marks the current prayer as prayed."
    )

    // mos
    static let mos = WidgetMetinleri(
        galeriAdi: "Pʋʋsg wakato",
        galeriAciklama: "Pʋʋsg wakat sẽn be masã, wakat sẽn kell tɩ a sa la rũndã pʋʋsg wakatã.",
        veriEski: "Pak-y aplikaasõ wã n teeg pʋʋsg wakatã",
        konumYok: "Pak-y aplikaasõ wã n segl y zĩigã",
        kilindiSiradaki: "{ad}: pʋʋsa · {sonraki} {saat}",
        adCikis: "{ad} · saada {saat}",
        siradakiAdSaat: "Sẽn pʋgdẽ {ad} {saat}",
        vaktiCikisErisim: "{ad} wakato, a saada {saat}",
        siradakiErisim: "Sẽn pʋgdẽ {ad}, {saat}",
        cikisSaat: "Saada {saat}",
        bitisSaat: "Saada {saat}",
        kilindiBaslik: "{ad}: pʋʋsa",
        siradaki: "Sẽn pʋgdẽ",
        siradakiAd: "Sẽn pʋgdẽ {ad}",
        kildimErisim: "M pʋʋsa {ad}",
        gunSatiriKilindi: ", pʋʋsa",
        bitti: "A saame",
        vakitCikti: "Pʋʋsg wakatã saame",
        kabulAlt: "{ad}: pʋʋsa",
        kontrolAdi: "M pʋʋsa",
        kontrolAciklama: "A gʋlsda pʋʋsg ning sẽn be masã tɩ pʋʋsa."
    )

    // aa
    static let aa = WidgetMetinleri(
        galeriAdi: "Salat wakti",
        galeriAciklama: "Asaakuh salat wakti, gexam fanah raqte wakti kee asaakuh salat wakti.",
        veriEski: "Salat wakti qusbisaanamkeh app faka",
        konumYok: "Sinni arac haysaanamkeh app faka",
        kilindiSiradaki: "{ad} abime · {sonraki} {saat}",
        adCikis: "{ad} · {saat} gexa",
        siradakiAdSaat: "Lakal {ad} {saat}",
        vaktiCikisErisim: "{ad} wakti, {saat} gexa",
        siradakiErisim: "Lakal tan {ad}, {saat}",
        cikisSaat: "Gexa {saat}",
        bitisSaat: "Gexa {saat}",
        kilindiBaslik: "{ad} abime",
        siradaki: "Lakal tan",
        siradakiAd: "Lakal tan {ad}",
        kildimErisim: "{ad} salat abe",
        gunSatiriKilindi: ", abime",
        bitti: "Gexe",
        vakitCikti: "Salat wakti gexe",
        kabulAlt: "{ad} abime",
        kontrolAdi: "Salat abe",
        kontrolAciklama: "Asaakuh salat abime calaamisa."
    )

    // ÇEVİRİ: mdh
    static let mdh = WidgetMetinleri(
        galeriAdi: "Prayer time",
        galeriAciklama: "The current prayer time, the time left until it ends and today's prayer times.",
        veriEski: "Open the app to update prayer times",
        konumYok: "Open the app to set your location",
        kilindiSiradaki: "{ad} prayed · {sonraki} {saat}",
        adCikis: "{ad} · ends {saat}",
        siradakiAdSaat: "Next {ad} {saat}",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        cikisSaat: "Ends {saat}",
        bitisSaat: "Ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        siradakiAd: "Next {ad}",
        kildimErisim: "I've prayed {ad}",
        gunSatiriKilindi: ", prayed",
        bitti: "Ended",
        vakitCikti: "Prayer time is over",
        kabulAlt: "{ad} prayed",
        kontrolAdi: "I've prayed",
        kontrolAciklama: "Marks the current prayer as prayed."
    )

    // ÇEVİRİ: ak
    static let ak = WidgetMetinleri(
        galeriAdi: "Prayer time",
        galeriAciklama: "The current prayer time, the time left until it ends and today's prayer times.",
        veriEski: "Open the app to update prayer times",
        konumYok: "Open the app to set your location",
        kilindiSiradaki: "{ad} prayed · {sonraki} {saat}",
        adCikis: "{ad} · ends {saat}",
        siradakiAdSaat: "Next {ad} {saat}",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        cikisSaat: "Ends {saat}",
        bitisSaat: "Ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        siradakiAd: "Next {ad}",
        kildimErisim: "I've prayed {ad}",
        gunSatiriKilindi: ", prayed",
        bitti: "Ended",
        vakitCikti: "Prayer time is over",
        kabulAlt: "{ad} prayed",
        kontrolAdi: "I've prayed",
        kontrolAciklama: "Marks the current prayer as prayed."
    )

    // ÇEVİRİ: ceb
    static let ceb = WidgetMetinleri(
        galeriAdi: "Prayer time",
        galeriAciklama: "The current prayer time, the time left until it ends and today's prayer times.",
        veriEski: "Open the app to update prayer times",
        konumYok: "Open the app to set your location",
        kilindiSiradaki: "{ad} prayed · {sonraki} {saat}",
        adCikis: "{ad} · ends {saat}",
        siradakiAdSaat: "Next {ad} {saat}",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        cikisSaat: "Ends {saat}",
        bitisSaat: "Ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        siradakiAd: "Next {ad}",
        kildimErisim: "I've prayed {ad}",
        gunSatiriKilindi: ", prayed",
        bitti: "Ended",
        vakitCikti: "Prayer time is over",
        kabulAlt: "{ad} prayed",
        kontrolAdi: "I've prayed",
        kontrolAciklama: "Marks the current prayer as prayed."
    )

    // ÇEVİRİ: nqo
    static let nqo = WidgetMetinleri(
        galeriAdi: "Prayer time",
        galeriAciklama: "The current prayer time, the time left until it ends and today's prayer times.",
        veriEski: "Open the app to update prayer times",
        konumYok: "Open the app to set your location",
        kilindiSiradaki: "{ad} prayed · {sonraki} {saat}",
        adCikis: "{ad} · ends {saat}",
        siradakiAdSaat: "Next {ad} {saat}",
        vaktiCikisErisim: "{ad} time, ends {saat}",
        siradakiErisim: "Next {ad}, {saat}",
        cikisSaat: "Ends {saat}",
        bitisSaat: "Ends {saat}",
        kilindiBaslik: "{ad} prayed",
        siradaki: "Next",
        siradakiAd: "Next {ad}",
        kildimErisim: "I've prayed {ad}",
        gunSatiriKilindi: ", prayed",
        bitti: "Ended",
        vakitCikti: "Prayer time is over",
        kabulAlt: "{ad} prayed",
        kontrolAdi: "I've prayed",
        kontrolAciklama: "Marks the current prayer as prayed."
    )

    /// Dil kodu → tablo (sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk, fil, te, kn, mr, pa, as, ne, si, km, he, ka, lt, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo; cevrilmemis dil `// ÇEVİRİ: <kod>`
    /// ile baslayan Ingilizce kopya).
    static let tablo: [String: WidgetMetinleri] = [
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

    static func dil(_ kod: String?) -> WidgetMetinleri {
        tablo[ArayuzDili.coz(kod)] ?? tr
    }

    func bicim(_ sablon: String, _ degerler: [String: String]) -> String {
        VakitMetinleri.bicim(sablon, degerler)
    }
}

enum WidgetMetin {
    /// Cizim anindaki arayuz dili (App Group; uygulama hic acilmadiysa Turkce).
    static var dil: String { ArayuzDili.coz(SiriDeposu.varsayilan.arayuzDili()) }
    static var m: WidgetMetinleri { WidgetMetinleri.dil(dil) }
    static var vm: VakitMetinleri { VakitMetinleri.dil(dil) }

    /// Gorunen vakit adi, gunes DAHIL, arayuz dilinde.
    static func ad(_ kod: String) -> String {
        vm.vakitAdi(kod)
    }

    static func ikon(_ kod: String) -> String {
        switch kod {
        case "sabah": return "sunrise.fill"
        case "ogle": return "sun.max.fill"
        case "ikindi": return "sun.haze.fill"
        case "aksam": return "sunset.fill"
        case "yatsi": return "moon.stars.fill"
        default: return "clock"
        }
    }

    /// `HH:mm` (cihaz saat dilimi), secilen rakamla. Hal eki EKLENMEZ ("Çıkış 16:00").
    static func saat(_ ms: Int64) -> String {
        rakam(SiriDeposu.saatBicimleyici()(ms))
    }

    /// Cizim anindaki rakam kaydi (App Group; JS cozulmus degeri yazar).
    static var rakamKaydi: String? { SiriDeposu.varsayilan.rakamSistemi() }

    /// Gorunen metnin rakamlari: Arapca arayuzde "arab" secildiyse Dogu Arap, Bengalcede "beng"
    /// secildiyse Bengalce rakam, aksi halde metin AYNEN (Turkce dahil). JS'in yazdigi metin (canli etkinlik basligi, kunye) de
    /// buradan gecer; cekirdek ve yuk Bati rakamiyla kalir.
    static func rakam(_ metin: String) -> String {
        RakamSistemi.cevir(metin, sistem: RakamSistemi.etkin(dil: dil, kayitli: rakamKaydi))
    }

    /// Sistem cizimli sayilarin (`Text(timerInterval:)`, `ProgressView`) yerel ayari: yalniz
    /// yerel rakamli dilde "ar@numbers=…" / "bn@numbers=…"; diger dillerde nil (cihazin ayari,
    /// birebir bugunku gibi).
    static var rakamYerelAyari: Locale? {
        RakamSistemi.yerelAyarKimligi(dil: dil, kayitli: rakamKaydi).map { Locale(identifier: $0) }
    }
}

extension View {
    /// Sistemin cizdigi geri sayim ve ilerleme Arapcada secilen rakamla; diger dillerde
    /// hicbir sey uygulanmaz. CIHAZDA DOGRULANMADI (WidgetKit zamanlayicisinin `\.locale`
    /// rakamini izledigi).
    @ViewBuilder
    func rakamYerelAyari() -> some View {
        if let yerel = WidgetMetin.rakamYerelAyari {
            environment(\.locale, yerel)
        } else {
            self
        }
    }
}

struct NamazVakitWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: WidgetSabitleri.tur, provider: VakitSaglayici()) { girdi in
            VakitWidgetGorunumu(girdi: girdi)
        }
        .configurationDisplayName(WidgetMetin.m.galeriAdi)
        .description(WidgetMetin.m.galeriAciklama)
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .systemSmall, .systemMedium])
    }
}

struct VakitWidgetGorunumu: View {
    let girdi: VakitGirdisi
    @Environment(\.widgetFamily) private var aile

    var body: some View {
        icerik
            .rakamYerelAyari()
            .widgetURL(WidgetSabitleri.acilis)
            .widgetArkaplani(aile)
    }

    @ViewBuilder private var icerik: some View {
        switch aile {
        case .accessoryInline: SatirIciGorunum(girdi: girdi)
        case .accessoryCircular: DaireselGorunum(girdi: girdi)
        case .accessoryRectangular: DikdortgenGorunum(girdi: girdi)
        case .systemMedium: OrtaGorunum(girdi: girdi)
        default: KucukGorunum(girdi: girdi)
        }
    }
}

// MARK: - Bos / eski veri

private struct VeriYokGorunumu: View {
    let eski: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: "location.slash")
                .foregroundStyle(WidgetSabitleri.yesil)
            Text(eski ? WidgetMetin.m.veriEski : WidgetMetin.m.konumYok)
                .font(.caption)
                .foregroundStyle(.secondary)
                .minimumScaleFactor(0.7)
        }
    }
}

// MARK: - Kilit ekrani: satir ici

private struct SatirIciGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        let m = WidgetMetin.m
        if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs {
            if g.kilindi, let s = g.sonraki {
                Text(m.bicim(m.kilindiSiradaki, [
                    "ad": WidgetMetin.ad(aktif.vakit), "sonraki": WidgetMetin.ad(s.vakit), "saat": WidgetMetin.saat(s.ms),
                ]))
            } else {
                Label(
                    m.bicim(m.adCikis, ["ad": WidgetMetin.ad(aktif.vakit), "saat": WidgetMetin.saat(bitis)]),
                    systemImage: WidgetMetin.ikon(aktif.vakit)
                )
            }
        } else if let s = girdi.gorunum?.sonraki {
            Label(
                m.bicim(m.siradakiAdSaat, ["ad": WidgetMetin.ad(s.vakit), "saat": WidgetMetin.saat(s.ms)]),
                systemImage: WidgetMetin.ikon(s.vakit)
            )
        } else {
            Text("Namaz Akışı")
        }
    }
}

// MARK: - Kilit ekrani: dairesel (vaktin gecen kismi + kalan sure)

private struct DaireselGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs, !g.kilindi {
            ProgressView(
                timerInterval: VakitSaglayici.tarih(aktif.ms)...VakitSaglayici.tarih(bitis),
                countsDown: false,
                label: { Text(WidgetMetin.ad(aktif.vakit)) },
                currentValueLabel: {
                    VStack(spacing: 0) {
                        Image(systemName: WidgetMetin.ikon(aktif.vakit)).font(.system(size: 10))
                        Text(timerInterval: girdi.date...VakitSaglayici.tarih(bitis), countsDown: true, showsHours: false)
                            .font(.system(size: 11, weight: .semibold))
                            .monospacedDigit()
                            .multilineTextAlignment(.center)
                            .minimumScaleFactor(0.5)
                    }
                }
            )
            .progressViewStyle(.circular)
            .accessibilityLabel(WidgetMetin.m.bicim(WidgetMetin.m.vaktiCikisErisim, ["ad": WidgetMetin.ad(aktif.vakit), "saat": WidgetMetin.saat(bitis)]))
        } else if let s = girdi.gorunum?.sonraki {
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Image(systemName: WidgetMetin.ikon(s.vakit)).font(.system(size: 12))
                    Text(WidgetMetin.saat(s.ms))
                        .font(.system(size: 12, weight: .semibold))
                        .monospacedDigit()
                        .minimumScaleFactor(0.6)
                }
            }
            .accessibilityLabel(WidgetMetin.m.bicim(WidgetMetin.m.siradakiErisim, ["ad": WidgetMetin.ad(s.vakit), "saat": WidgetMetin.saat(s.ms)]))
        } else {
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: "moon.stars")
            }
        }
    }
}

// MARK: - Kilit ekrani: dikdortgen (vakit adi + geri sayim + cikis saati)

private struct DikdortgenGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs, !g.kilindi {
                Label(WidgetMetin.ad(aktif.vakit), systemImage: WidgetMetin.ikon(aktif.vakit))
                    .font(.headline)
                    .widgetAccentable()
                Text(timerInterval: girdi.date...VakitSaglayici.tarih(bitis), countsDown: true)
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                Text(WidgetMetin.m.bicim(WidgetMetin.m.cikisSaat, ["saat": WidgetMetin.saat(bitis)]))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else if let g = girdi.gorunum, let s = g.sonraki {
                if let aktif = g.aktif, g.kilindi {
                    Label(WidgetMetin.m.bicim(WidgetMetin.m.kilindiBaslik, ["ad": WidgetMetin.ad(aktif.vakit)]), systemImage: "checkmark.circle.fill")
                        .font(.headline)
                        .widgetAccentable()
                } else {
                    Label(WidgetMetin.m.siradaki, systemImage: "clock")
                        .font(.headline)
                        .widgetAccentable()
                }
                Text("\(WidgetMetin.ad(s.vakit)) \(WidgetMetin.saat(s.ms))")
                    .font(.system(.title3, design: .rounded).weight(.semibold))
                Text(timerInterval: girdi.date...VakitSaglayici.tarih(s.ms), countsDown: true)
                    .font(.caption)
                    .monospacedDigit()
                    .foregroundStyle(.secondary)
            } else {
                VeriYokGorunumu(eski: girdi.veriEski)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Ana ekran / StandBy: kucuk

private struct KucukGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let g = girdi.gorunum, let aktif = g.aktif, let bitis = g.bitisMs {
                AktifVakitPaneli(girdi: girdi, aktif: aktif, bitisMs: bitis, kilindi: g.kilindi, sonraki: g.sonraki)
            } else if let s = girdi.gorunum?.sonraki {
                SiradakiPaneli(girdi: girdi, sonraki: s)
            } else {
                VeriYokGorunumu(eski: girdi.veriEski)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

private struct AktifVakitPaneli: View {
    let girdi: VakitGirdisi
    let aktif: SiriVakitAni
    let bitisMs: Int64
    let kilindi: Bool
    let sonraki: SiriVakitAni?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: WidgetMetin.ikon(aktif.vakit))
                    .foregroundStyle(WidgetSabitleri.yesil)
                Text(WidgetMetin.ad(aktif.vakit))
                    .font(.headline)
                    .foregroundStyle(.primary)
                Spacer(minLength: 0)
                if kilindi {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(WidgetSabitleri.yesil)
                        .accessibilityLabel(WidgetMetin.vm.kilindi)
                }
            }
            if kilindi, let s = sonraki {
                Text(WidgetMetin.m.bicim(WidgetMetin.m.siradakiAd, ["ad": WidgetMetin.ad(s.vakit)]))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(WidgetMetin.saat(s.ms))
                    .font(.system(.title2, design: .rounded).weight(.semibold))
                    .monospacedDigit()
            } else {
                Text(timerInterval: girdi.date...VakitSaglayici.tarih(bitisMs), countsDown: true)
                    .font(.system(.title2, design: .rounded).weight(.semibold))
                    .monospacedDigit()
                    .minimumScaleFactor(0.6)
                ProgressView(
                    timerInterval: VakitSaglayici.tarih(aktif.ms)...VakitSaglayici.tarih(bitisMs),
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .tint(WidgetSabitleri.yesil)
                Text(WidgetMetin.m.bicim(WidgetMetin.m.cikisSaat, ["saat": WidgetMetin.saat(bitisMs)]))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
            if !kilindi, let kayit = VakitKarari.kayitVakti(aktif.vakit) {
                KildimDugmesi(tarih: aktif.tarih, kayitVakti: kayit, ad: WidgetMetin.ad(aktif.vakit))
            }
        }
    }
}

private struct SiradakiPaneli: View {
    let girdi: VakitGirdisi
    let sonraki: SiriVakitAni
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: WidgetMetin.ikon(sonraki.vakit))
                    .foregroundStyle(WidgetSabitleri.yesil)
                Text(WidgetMetin.m.siradaki)
                    .font(.headline)
            }
            Text("\(WidgetMetin.ad(sonraki.vakit)) \(WidgetMetin.saat(sonraki.ms))")
                .font(.system(.title3, design: .rounded).weight(.semibold))
            Text(timerInterval: girdi.date...VakitSaglayici.tarih(sonraki.ms), countsDown: true)
                .font(.caption)
                .monospacedDigit()
                .foregroundStyle(.secondary)
        }
    }
}

/// "Kildim" — yalniz iOS 17+ ana ekran (etkilesimli widget). Uzanti dagitim hedefi 16.2
/// oldugu icin kapi burada.
private struct KildimDugmesi: View {
    let tarih: String
    let kayitVakti: String
    let ad: String
    var body: some View {
        if #available(iOS 17.0, *) {
            KildimDugmesi17(tarih: tarih, kayitVakti: kayitVakti, ad: ad)
        }
    }
}

/// StandBy ve iPad kilit ekrani konteyner arka planini gizler
/// (`showsWidgetContainerBackground == false`) → orada dugme CIZILMEZ (salt okunur).
@available(iOS 17.0, *)
private struct KildimDugmesi17: View {
    let tarih: String
    let kayitVakti: String
    let ad: String
    @Environment(\.showsWidgetContainerBackground) private var konteynerGorunur

    var body: some View {
        if konteynerGorunur {
            Button(intent: KildimDugmesiIntent(tarih: tarih, vakit: kayitVakti)) {
                Label(WidgetMetin.vm.kildim, systemImage: "checkmark")
                    .font(.caption.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .tint(WidgetSabitleri.yesil)
            .accessibilityLabel(WidgetMetin.m.bicim(WidgetMetin.m.kildimErisim, ["ad": ad]))
        }
    }
}

// MARK: - Ana ekran: orta (aktif vakit + gunun bes vakti)

private struct OrtaGorunum: View {
    let girdi: VakitGirdisi
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            KucukGorunum(girdi: girdi)
            VStack(alignment: .leading, spacing: 3) {
                ForEach(girdi.gunVakitleri) { satir in
                    let aktifMi = girdi.gorunum?.aktif?.ms == satir.vakit.ms
                    HStack(spacing: 6) {
                        Image(systemName: satir.kilindi ? "checkmark.circle.fill" : "circle")
                            .font(.caption)
                            .foregroundStyle(satir.kilindi ? WidgetSabitleri.yesil : Color.secondary)
                        Text(WidgetMetin.ad(satir.vakit.vakit))
                            .font(.subheadline.weight(aktifMi ? .bold : .regular))
                        Spacer(minLength: 4)
                        Text(WidgetMetin.saat(satir.vakit.ms))
                            .font(.subheadline.weight(aktifMi ? .bold : .regular))
                            .monospacedDigit()
                    }
                    .foregroundStyle(.primary)
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel(
                        "\(WidgetMetin.ad(satir.vakit.vakit)) \(WidgetMetin.saat(satir.vakit.ms))\(satir.kilindi ? WidgetMetin.m.gunSatiriKilindi : "")"
                    )
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Arka plan (iOS 17 `containerBackground` zorunlu)

extension View {
    @ViewBuilder
    func widgetArkaplani(_ aile: WidgetFamily) -> some View {
        let aksesuar = aile == .accessoryInline || aile == .accessoryCircular || aile == .accessoryRectangular
        if #available(iOS 17.0, *) {
            if aksesuar {
                containerBackground(for: .widget) { Color.clear }
            } else {
                containerBackground(for: .widget) { Color(.systemBackground) }
            }
        } else if aksesuar {
            self
        } else {
            padding().background(Color(.systemBackground))
        }
    }
}
