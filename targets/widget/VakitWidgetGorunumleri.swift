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

    // ÇEVİRİ: uz
    static let uz = WidgetMetinleri(
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

    // ÇEVİRİ: tg
    static let tg = WidgetMetinleri(
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

    /// Dil kodu → tablo (sira tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg; cevrilmemis dil `// ÇEVİRİ: <kod>`
    /// ile baslayan Ingilizce kopya).
    static let tablo: [String: WidgetMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur, "es": es, "nl": nl, "sq": sq, "hi": hi, "bn": bn,
        "fa": fa, "ps": ps, "ckb": ckb, "ug": ug,
        "az": az, "uz": uz, "kk": kk, "ky": ky, "tg": tg,
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
