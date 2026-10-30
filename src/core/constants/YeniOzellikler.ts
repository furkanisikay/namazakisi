/**
 * Yeni Özellik Kataloğu
 *
 * Uygulamaya eklenen yeni özelliklerin tek kaynağı. Rozet, "Neler Yeni" kartı
 * ve "Neler Yeni" sayfası bu listeden beslenir.
 *
 * Yeni bir özellik duyurmak için: diziye en üste bir nesne ekle. Tüm yüzeyler
 * (rozet + kart + sayfa) otomatik güncellenir; ek kod gerekmez.
 *
 * BİR ÖZELLİK = BİR ÖĞE. Özellik değiştiyse (iç testte ya da sonradan) YENİ öğe
 * ekleme: mevcut öğenin metnini bugünkü hâle getir, `surum`/`tarih`'i son değişikliğin
 * değeriyle güncelle. Görülme `<id>@<surum>` anahtarıyla tutulduğu için yükseltilen
 * `surum` duyuruyu kullanıcıya yeniden "yeni" gösterir (`core/utils/yeniOzellikGorulme.ts`).
 * İki öğeyi birleştirirken en eski `id`'yi koru, diğerlerini `oncekiIdler`'e yaz.
 * `id`'yi asla değiştirme.
 *
 * KOPYA YAZIM KURALLARI (önemli):
 *   - Her zaman kibar "siz" dili kullanın ("ekleyebilirsiniz", "görürsünüz").
 *   - Metin özelliğin BUGÜNKÜ hâlini anlatır; "artık", "eskiden" diye tarihçe yazmayın.
 *   - Teknik terim yok (kanal, TTS, API…): "sesli okuma", "bildirim", "alarm" deyin.
 *   - Cihaz/işletim sistemi sürümü ve izin şartı yazmayın.
 *   - `baslik` dikkat çekici ve net olsun.
 *   - `aciklama` tek bakışta özelliğin ~%70'ini anlatan özet olsun (kapalı görünüm).
 *   - `detayAciklama` + `detaylar` ile tıklayınca açılan detayda tam resmi verin.
 */

/**
 * Duyurunun yalnız özelliği taşıyan cihazda görünmesi için yetenek anahtarı.
 * Çözümü sunum katmanındadır (`presentation/hooks/yeniOzellikYetenegi.ts`).
 */
import type { DilKodu } from '../dil/diller';

export type YeniOzellikYetenegi = 'iosWidget' | 'appleWatch' | 'gercekAlarm' | 'googleDrive' | 'ipad' | 'kontrolMerkezi' | 'sesDosyasi';

/** Duyurunun görüneceği platformlar. */
export type YeniOzellikPlatformu = 'android' | 'ios';

export interface YeniOzellik {
    /** Benzersiz kimlik (kalıcı; değiştirme) */
    id: string;
    /**
     * Bu öğeye birleştirilmiş eski duyuruların kimlikleri. Eski (yalın kimlikli) görülme
     * kaydında kullanıcı ancak `id` ile birlikte bunların HEPSİNİ görmüşse öğe görülmüş sayılır.
     */
    oncekiIdler?: string[];
    /**
     * Özelliğin GERÇEKTEN bulunduğu platformlar — ZORUNLU: yalnız Android'e gelen bir
     * özellik iPhone kullanıcısına (ya da tersi) duyurulmaz. İkisine birden geldiyse
     * `['android', 'ios']`. Platform içinde ayrıca bir build/cihaz koşulu varsa
     * (widget uzantısı, saat hedefi) `yetenek` de verilir.
     */
    platformlar: YeniOzellikPlatformu[];
    /** Duyurulan içeriğin son değiştiği sürüm (örn. '0.22.0'); yükseltmek yeniden gösterir */
    surum: string;
    /** Son değişiklik tarihi — 'YYYY-MM-DD' (Neler Yeni sıralaması için) */
    tarih: string;
    /** Dikkat çekici başlık */
    baslik: string;
    /** Tek bakışta özelliği anlatan özet (kapalı görünümde gösterilir) */
    aciklama: string;
    /** Açılınca gösterilen detaylı paragraf */
    detayAciklama?: string;
    /** FontAwesome5 ikon adı */
    ikon: string;
    /** Ayarlar yığınındaki hedef sayfa (CTA + menü rozeti eşlemesi) */
    hedefSayfa?: string;
    /** CTA buton etiketi (örn. 'Hemen kurun') */
    ctaEtiketi?: string;
    /** Ayarlar üstünde kapatılabilir tanıtım kartı gösterilsin mi */
    kartGoster?: boolean;
    /** Açılınca gösterilen madde madde detaylar */
    detaylar?: string[];
    /** Verilirse duyuru yalnız bu yetenek varken görünür (ör. iPhone widget'ı). */
    yetenek?: YeniOzellikYetenegi;
    /**
     * Diğer dillerdeki metin. Türkçe dışında YALNIZ çevirisi olan öğe gösterilir
     * (`core/constants/yeniOzellikDili.ts`): eski duyurular yeni dilin kullanıcısına
     * anlamsızdır, yarım çeviri gösterilmez. Metin o dilin kullanıcısı için DOĞRU olmalı
     * (ör. yalnız Türkiye'de çalışan bir yol çeviride anlatılmaz).
     */
    ceviri?: Partial<Record<Exclude<DilKodu, 'tr'>, YeniOzellikCevirisi>>;
}

/** Bir duyurunun çevrilen alanları. */
export type YeniOzellikCevirisi = Pick<YeniOzellik, 'baslik' | 'aciklama' | 'detayAciklama' | 'ctaEtiketi' | 'detaylar'>;

export const YENI_OZELLIKLER: YeniOzellik[] = [
    // Günün ayeti (#380 widget, #381 duvar kâğıdı). Duvar kâğıdı platforma göre farklı
    // olduğundan iki öğe: Android'de uygulama değiştirir, iPhone'da Kısayollar rehberi.
    {
        id: 'gunun-ayeti-android',
        platformlar: ['android'],
        surum: '0.71.0',
        tarih: '2026-10-24',
        baslik: 'Günün ayeti ana ekranınızda',
        aciklama:
            'Her gün imsakta değişen bir ayeti ve mealini ana ekranınıza widget olarak ekleyebilir, isterseniz kilit ekranınızın duvar kâğıdı yapabilirsiniz.',
        detayAciklama:
            "Widget, duvar kâğıdı ve uygulamadaki \"Günün ayeti\" sayfası aynı ayeti gösterir. Arapça metin Tanzil Projesi'nden, mealler QuranEnc'ten değiştirilmeden alınır.",
        ikon: 'book-open',
        hedefSayfa: 'GununAyeti',
        ctaEtiketi: 'Günün ayetini açın',
        detaylar: [
            'Meal hiçbir boyutta kesilmez; sığmadığı gün widget okumak için dokunmanızı ister.',
            'Duvar kâğıdında Arapça metin isteğe bağlıdır ve başta kapalıdır.',
            'Ayeti metin ya da görsel olarak paylaşabilirsiniz.',
        ],
        ceviri: {
            en: {
                baslik: 'Verse of the day on your home screen',
                aciklama:
                    'Add a verse and its translation that changes every day at Fajr to your home screen as a widget, and make it your lock screen wallpaper if you like.',
                detayAciklama:
                    'The widget, the wallpaper and the "Verse of the day" page in the app show the same verse. The Arabic text comes from the Tanzil Project and translations from QuranEnc, unchanged.',
                ctaEtiketi: 'Open the verse of the day',
                detaylar: [
                    "The translation is never cut off; on days it doesn't fit, the widget asks you to tap to read it.",
                    'Arabic text on the wallpaper is optional and starts off.',
                    'You can share the verse as text or as an image.',
                ],
            },
            id: {
                baslik: 'Ayat hari ini di layar utama Anda',
                aciklama: 'Tambahkan ayat beserta terjemahannya, yang berganti setiap hari saat Subuh, ke layar utama sebagai widget, dan jika mau, jadikan wallpaper layar kunci Anda.',
                detayAciklama: 'Widget, wallpaper, dan halaman "Ayat hari ini" di aplikasi menampilkan ayat yang sama. Teks Arab berasal dari Proyek Tanzil dan terjemahan dari QuranEnc, tanpa diubah.',
                ctaEtiketi: 'Buka ayat hari ini',
                detaylar: [
                    'Terjemahan tidak pernah dipotong; pada hari terjemahan tidak muat, widget meminta Anda mengetuk untuk membacanya.',
                    'Teks Arab di wallpaper bersifat opsional dan awalnya nonaktif.',
                    'Anda dapat membagikan ayat sebagai teks atau gambar.',
                ],
            },
            de: {
                baslik: 'Vers des Tages auf Ihrem Startbildschirm',
                aciklama: 'Fügen Sie einen Vers mit Übersetzung, der jeden Tag zu Fajr wechselt, als Widget zu Ihrem Startbildschirm hinzu und machen Sie ihn auf Wunsch zum Hintergrundbild Ihres Sperrbildschirms.',
                detayAciklama: 'Widget, Hintergrundbild und die Seite „Vers des Tages“ in der App zeigen denselben Vers. Der arabische Text stammt vom Tanzil-Projekt, die Übersetzungen unverändert von QuranEnc.',
                ctaEtiketi: 'Vers des Tages öffnen',
                detaylar: [
                    'Die Übersetzung wird nie abgeschnitten; passt sie an einem Tag nicht, bittet das Widget Sie, zum Lesen zu tippen.',
                    'Der arabische Text auf dem Hintergrundbild ist optional und anfangs aus.',
                    'Sie können den Vers als Text oder als Bild teilen.',
                ],
            },
            fr: {
                baslik: 'Le verset du jour sur votre écran d’accueil',
                aciklama: 'Ajoutez sur votre écran d’accueil, sous forme de widget, un verset et sa traduction qui changent chaque jour à l’Imsak, et faites-en si vous le souhaitez le fond d’écran de votre écran de verrouillage.',
                detayAciklama: 'Le widget, le fond d’écran et la page « Verset du jour » de l’application affichent le même verset. Le texte arabe vient du Tanzil Project et les traductions de QuranEnc, sans modification.',
                ctaEtiketi: 'Ouvrir le verset du jour',
                detaylar: [
                    'La traduction n’est jamais coupée ; les jours où elle ne tient pas, le widget vous invite à la toucher pour la lire.',
                    'Le texte arabe sur le fond d’écran est facultatif et désactivé au départ.',
                    'Vous pouvez partager le verset en texte ou en image.',
                ],
            },
            bs: {
                baslik: 'Ajet dana na početnom ekranu',
                aciklama: 'Dodajte na početni ekran widget s ajetom i prijevodom njegovog značenja koji se mijenja svaki dan u zoru, a ako želite, postavite ga i kao pozadinu zaključanog ekrana.',
                detayAciklama: 'Widget, pozadina i stranica „Ajet dana” u aplikaciji prikazuju isti ajet. Arapski tekst dolazi iz Projekta Tanzil, a prijevodi značenja s QuranEnca, bez izmjena.',
                ctaEtiketi: 'Otvorite ajet dana',
                detaylar: [
                    'Prijevod značenja se nikada ne skraćuje; u danima kada ne stane, widget Vas poziva da ga dodirnete i pročitate.',
                    'Arapski tekst na pozadini je opcionalan i u početku je isključen.',
                    'Ajet možete podijeliti kao tekst ili kao sliku.',
                ],
            },
            ru: {
                baslik: 'Аят дня на главном экране',
                aciklama: 'Добавьте на главный экран виджет с аятом и переводом смыслов, который меняется каждый день в имсак, а при желании сделайте его обоями экрана блокировки.',
                detayAciklama: 'Виджет, обои и страница «Аят дня» в приложении показывают один и тот же аят. Арабский текст взят из проекта Tanzil, переводы смыслов — с QuranEnc, без изменений.',
                ctaEtiketi: 'Открыть аят дня',
                detaylar: [
                    'Перевод смыслов никогда не обрезается; если в какой-то день он не помещается, виджет предложит нажать, чтобы прочитать.',
                    'Арабский текст на обоях — по желанию, по умолчанию выключен.',
                    'Аятом можно поделиться текстом или картинкой.',
                ],
            },
            ms: {
                baslik: 'Ayat hari ini di skrin utama anda',
                aciklama: 'Tambahkan sepotong ayat beserta terjemahannya yang bertukar setiap hari pada waktu Subuh ke skrin utama anda sebagai widget, dan jadikannya kertas dinding skrin kunci jika anda mahu.',
                detayAciklama: 'Widget, kertas dinding dan halaman "Ayat hari ini" dalam aplikasi memaparkan ayat yang sama. Teks Arab diambil daripada Projek Tanzil dan terjemahan daripada QuranEnc, tanpa diubah.',
                ctaEtiketi: 'Buka ayat hari ini',
                detaylar: [
                    'Terjemahan tidak sekali-kali dipotong; pada hari ia tidak muat, widget meminta anda mengetik untuk membacanya.',
                    'Teks Arab pada kertas dinding adalah pilihan dan dimatikan pada mulanya.',
                    'Anda boleh berkongsi ayat sebagai teks atau imej.',
                ],
            },
            ar: {
                baslik: 'آية اليوم على شاشتك الرئيسية',
                aciklama: 'آية تتجدد كل يوم عند الفجر، تُضاف إلى الشاشة الرئيسية كأداة، ويمكن جعلها خلفية لشاشة القفل.',
                detayAciklama: 'الأداة والخلفية وصفحة «آية اليوم» في التطبيق تعرض الآية نفسها. النص القرآني من مشروع تنزيل، دون تغيير.',
                ctaEtiketi: 'فتح آية اليوم',
                detaylar: [
                    'لا تُقطع الآية أبدًا؛ وفي الأيام التي لا تتسع فيها تدعو الأداة إلى النقر لقراءتها.',
                    'يمكن اختيار الخلفية اللونية للصورة ومكانها: شاشة القفل أو الشاشة الرئيسية أو كلتاهما.',
                    'يمكن مشاركة الآية نصًّا أو صورة.',
                ],
            },
            ur: {
                baslik: 'آج کی آیت آپ کی ہوم اسکرین پر',
                aciklama: 'ہر روز فجر کے وقت بدلنے والی ایک آیت اور اس کا ترجمہ ویجیٹ کے طور پر ہوم اسکرین پر شامل کریں، اور چاہیں تو اسے لاک اسکرین کا وال پیپر بنائیں۔',
                detayAciklama: 'ویجیٹ، وال پیپر اور ایپ کا “آج کی آیت” صفحہ ایک ہی آیت دکھاتے ہیں۔ عربی متن Tanzil پروجیکٹ سے اور تراجم QuranEnc سے بغیر تبدیلی کے لیے جاتے ہیں۔',
                ctaEtiketi: 'آج کی آیت کھولیں',
                detaylar: [
                    'ترجمہ کبھی کاٹا نہیں جاتا؛ جس دن پورا نہ سمائے، ویجیٹ پڑھنے کے لیے تھپتھپانے کو کہتا ہے۔',
                    'وال پیپر پر عربی متن اختیاری ہے اور شروع میں بند ہوتا ہے۔',
                    'آیت متن یا تصویر کے طور پر شیئر کی جا سکتی ہے۔',
                ],
            },
            es: {
                baslik: 'La aleya del día en su pantalla de inicio',
                aciklama: 'Añada a su pantalla de inicio, como widget, una aleya con su traducción que cambia cada día en Fajr, y si quiere, úsela como fondo de la pantalla de bloqueo.',
                detayAciklama: 'El widget, el fondo de pantalla y la página «Aleya del día» de la aplicación muestran la misma aleya. El texto árabe procede del Tanzil Project y las traducciones de QuranEnc, sin cambios.',
                ctaEtiketi: 'Abrir la aleya del día',
                detaylar: [
                    'La traducción nunca se corta; los días en que no cabe, el widget le pide que toque para leerla.',
                    'El texto árabe en el fondo de pantalla es opcional y empieza desactivado.',
                    'Puede compartir la aleya como texto o como imagen.',
                ],
            },
            nl: {
                baslik: 'Vers van de dag op uw startscherm',
                aciklama: 'Zet een vers met vertaling, dat elke dag bij Fajr wisselt, als widget op uw startscherm en maak het desgewenst de achtergrond van uw vergrendelscherm.',
                detayAciklama: 'De widget, de achtergrond en de pagina "Vers van de dag" in de app tonen hetzelfde vers. De Arabische tekst komt van het Tanzil-project en de vertalingen ongewijzigd van QuranEnc.',
                ctaEtiketi: 'Het vers van de dag openen',
                detaylar: [
                    'De vertaling wordt nooit afgekapt; op dagen dat ze niet past, vraagt de widget u te tikken om te lezen.',
                    'De Arabische tekst op de achtergrond is optioneel en staat in het begin uit.',
                    'U kunt het vers als tekst of als afbeelding delen.',
                ],
            },
            sq: {
                baslik: 'Ajeti i ditës në ekranin kryesor',
                aciklama: 'Shtoni në ekranin kryesor si widget një ajet me përkthimin e tij që ndryshon çdo ditë në sabah dhe, nëse doni, bëjeni sfond të ekranit të kyçjes.',
                detayAciklama: 'Widget-i, sfondi dhe faqja "Ajeti i ditës" në aplikacion tregojnë të njëjtin ajet. Teksti arab vjen nga Projekti Tanzil dhe përkthimet nga QuranEnc, pa ndryshime.',
                ctaEtiketi: 'Hapni ajetin e ditës',
                detaylar: [
                    'Përkthimi nuk shkurtohet kurrë; në ditët kur nuk nxë, widget-i ju fton ta prekni për ta lexuar.',
                    'Teksti arab në sfond është opsional dhe fillimisht joaktiv.',
                    'Ajetin mund ta ndani si tekst ose si figurë.',
                ],
            },
            hi: {
                baslik: 'आज की आयत आपकी होम स्क्रीन पर',
                aciklama: 'हर दिन फ़ज्र के वक़्त बदलने वाली एक आयत और उसका तर्जुमा अपनी होम स्क्रीन पर विजेट के रूप में जोड़ें, और चाहें तो उसे लॉक स्क्रीन का वॉलपेपर बनाएं।',
                detayAciklama: 'विजेट, वॉलपेपर और ऐप का "आज की आयत" पेज एक ही आयत दिखाते हैं। अरबी टेक्स्ट Tanzil प्रोजेक्ट से और तर्जुमे QuranEnc से, बिना बदलाव के लिए जाते हैं।',
                ctaEtiketi: 'आज की आयत खोलें',
                detaylar: [
                    'तर्जुमा कभी काटा नहीं जाता; जिस दिन वह नहीं समाता, विजेट पढ़ने के लिए टैप करने को कहता है।',
                    'वॉलपेपर पर अरबी टेक्स्ट अपनी मर्ज़ी से है और शुरू में बंद रहता है।',
                    'आयत को टेक्स्ट या तस्वीर के रूप में शेयर किया जा सकता है।',
                ],
            },
            bn: {
                baslik: 'হোম স্ক্রিনে দিনের আয়াত',
                aciklama: 'প্রতিদিন ফজরে বদলানো একটি আয়াত ও তার অনুবাদ উইজেট হিসেবে হোম স্ক্রিনে যোগ করুন, চাইলে লক স্ক্রিনের ওয়ালপেপারও করুন।',
                detayAciklama: 'উইজেট, ওয়ালপেপার ও অ্যাপের "দিনের আয়াত" পৃষ্ঠা একই আয়াত দেখায়। আরবি লেখা Tanzil Project থেকে এবং অনুবাদ QuranEnc থেকে হুবহু নেওয়া হয়।',
                ctaEtiketi: 'দিনের আয়াত খুলুন',
                detaylar: [
                    'অনুবাদ কখনো কাটা হয় না; যেদিন আঁটে না, সেদিন উইজেট পড়তে ট্যাপ করতে বলে।',
                    'ওয়ালপেপারে আরবি লেখা ঐচ্ছিক এবং শুরুতে বন্ধ থাকে।',
                    'আয়াতটি লেখা বা ছবি হিসেবে শেয়ার করতে পারেন।',
                ],
            },
            fa: {
                baslik: 'آیهٔ روز روی صفحهٔ اصلی شما',
                aciklama: 'آیه‌ای را که هر روز هنگام صبح عوض می‌شود همراه با ترجمه‌اش به‌صورت ابزارک به صفحهٔ اصلی بیفزایید و اگر خواستید آن را تصویر زمینهٔ صفحهٔ قفل کنید.',
                detayAciklama: 'ابزارک، تصویر زمینه و صفحهٔ «آیهٔ روز» در برنامه همان آیه را نشان می‌دهند. متن عربی از پروژهٔ Tanzil و ترجمه‌ها بدون تغییر از QuranEnc گرفته می‌شوند.',
                ctaEtiketi: 'باز کردن آیهٔ روز',
                detaylar: [
                    'ترجمه هرگز بریده نمی‌شود؛ روزهایی که جا نشود، ابزارک از شما می‌خواهد برای خواندن ضربه بزنید.',
                    'متن عربی روی تصویر زمینه اختیاری است و در آغاز خاموش است.',
                    'می‌توانید آیه را به‌صورت متن یا تصویر به اشتراک بگذارید.',
                ],
            },
            ps: {
                baslik: 'د ورځې آیت ستاسو په اصلي سکرین کې',
                aciklama: 'یو آیت او د هغه ژباړه چې هره ورځ د سهار په وخت بدلېږي، د ویجټ په توګه اصلي سکرین ته اضافه کړئ، او که وغواړئ د قلف سکرین شالید یې کړئ.',
                detayAciklama: 'ویجټ، شالید او په اپ کې د «د ورځې آیت» پاڼه همغه آیت ښيي. عربي متن د Tanzil له پروژې او ژباړې له QuranEnc څخه پرته له بدلون اخیستل کېږي.',
                ctaEtiketi: 'د ورځې آیت پرانیزئ',
                detaylar: [
                    'ژباړه هېڅکله نه پرې کېږي؛ په هغو ورځو چې نه ځایېږي، ویجټ غواړي چې د لوستلو لپاره یې کېکاږئ.',
                    'په شالید کې عربي متن اختیاري دی او په پیل کې بند دی.',
                    'آیت د متن یا انځور په توګه شریکولای شئ.',
                ],
            },
            ckb: {
                baslik: 'ئایەتی ڕۆژ لەسەر شاشەی سەرەکی',
                aciklama: 'ئایەتێک و وەرگێڕانەکەی کە ھەموو ڕۆژێک لە کاتی بەیانیدا دەگۆڕێت وەک ویجێت بخەنە سەر شاشەی سەرەکی، و ئەگەر بتانەوێت بیکەنە وێنەی پاشبنەمای شاشەی قوفڵ.',
                detayAciklama: 'ویجێت، وێنەی پاشبنەما و پەڕەی «ئایەتی ڕۆژ» لە ئەپەکەدا ھەمان ئایەت پیشان دەدەن. دەقی عەرەبی لە پرۆژەی Tanzil و وەرگێڕانەکان لە QuranEnc بێ گۆڕانکاری وەردەگیرێن.',
                ctaEtiketi: 'کردنەوەی ئایەتی ڕۆژ',
                detaylar: [
                    'وەرگێڕانەکە ھەرگیز ناپچڕێت؛ لەو ڕۆژانەی جێی نابێتەوە، ویجێتەکە داواتان لێ دەکات بۆ خوێندنەوە دەستی لێ بدەن.',
                    'دەقی عەرەبی لەسەر وێنەی پاشبنەما ئارەزوومەندانەیە و لە سەرەتادا ناچالاکە.',
                    'دەتوانن ئایەتەکە وەک دەق یان وێنە ھاوبەش بکەن.',
                ],
            },
            ug: {
                baslik: 'كۈننىڭ ئايىتى باش ئېكرانىڭىزدا',
                aciklama: 'ھەر كۈنى بامداتتا ئالمىشىدىغان بىر ئايەت ۋە ئۇنىڭ تەرجىمىسىنى باش ئېكرانىڭىزغا كىچىك قورال قىلىپ قوشالايسىز، خالىسىڭىز قۇلۇپ ئېكرانىڭىزنىڭ تام قەغىزى قىلالايسىز.',
                detayAciklama: 'كىچىك قورال، تام قەغىزى ۋە ئەپتىكى «كۈننىڭ ئايىتى» بېتى ئوخشاش ئايەتنى كۆرسىتىدۇ. ئەرەبچە تېكىست Tanzil تۈرىدىن، تەرجىمىلەر QuranEnc دىن ئۆزگەرتىلمەي ئېلىنىدۇ.',
                ctaEtiketi: 'كۈننىڭ ئايىتىنى ئېچىڭ',
                detaylar: [
                    'تەرجىمە ھېچقانداق چوڭلۇقتا كېسىلمەيدۇ؛ سىغمىغان كۈنى كىچىك قورال ئوقۇش ئۈچۈن چېكىشىڭىزنى سورايدۇ.',
                    'تام قەغىزىدىكى ئەرەبچە تېكىست ئىختىيارىي بولۇپ، باشتا تاقاق تۇرىدۇ.',
                    'ئايەتنى تېكىست ياكى رەسىم قىلىپ ھەمبەھىرلىيەلەيسىز.',
                ],
            },
            az: {
                baslik: 'Günün ayəsi ana ekranınızda',
                aciklama: 'Hər gün sübhdə dəyişən ayəni və tərcüməsini vidcet kimi ana ekranınıza əlavə edin, istəsəniz kilid ekranınızın divar kağızı edin.',
                detayAciklama: 'Vidcet, divar kağızı və tətbiqdəki "Günün ayəsi" səhifəsi eyni ayəni göstərir. Ərəbcə mətn Tanzil layihəsindən, tərcümələr isə QuranEnc-dən dəyişdirilmədən götürülür.',
                ctaEtiketi: 'Günün ayəsini açın',
                detaylar: [
                    'Tərcümə heç vaxt kəsilmir; sığmadığı günlərdə vidcet oxumaq üçün toxunmağınızı xahiş edir.',
                    'Divar kağızında ərəbcə mətn istəyə bağlıdır və əvvəlcə bağlı olur.',
                    'Ayəni mətn və ya şəkil kimi paylaşa bilərsiniz.',
                ],
            },
            uz: {
                baslik: 'Кун ояти бош экранингизда',
                aciklama: 'Ҳар куни бомдодда алмашадиган оят ва унинг таржимасини бош экранингизга виджет сифатида қўшишингиз, истасангиз қулф экранингиз фон расми қилишингиз мумкин.',
                detayAciklama: 'Виджет, фон расми ва иловадаги «Кун ояти» саҳифаси бир хил оятни кўрсатади. Арабча матн Tanzil лойиҳасидан, таржималар QuranEnc сайтидан ўзгаришсиз олинади.',
                ctaEtiketi: 'Кун оятини очиш',
                detaylar: [
                    'Таржима ҳеч бир ўлчамда қисқартирилмайди; сиғмаган куни виджет ўқиш учун босишингизни сўрайди.',
                    'Фон расмидаги арабча матн ихтиёрий ва бошида ўчиқ.',
                    'Оятни матн ёки расм сифатида улашишингиз мумкин.',
                ],
            },
            kk: {
                baslik: 'Күннің аяты басты экраныңызда',
                aciklama: 'Күн сайын таң уақытында ауысатын аят пен оның аудармасын басты экранға виджет ретінде қоса аласыз, қаласаңыз, оны құлып экранының тұсқағазы ете аласыз.',
                detayAciklama: 'Виджет, тұсқағаз және қолданбадағы «Күннің аяты» беті бір аятты көрсетеді. Арабша мәтін Tanzil жобасынан, аудармалар QuranEnc сайтынан өзгертілмей алынады.',
                ctaEtiketi: 'Күннің аятын ашу',
                detaylar: [
                    'Аударма ешбір өлшемде қысқартылмайды; сыймаған күні виджет оқу үшін түртуді сұрайды.',
                    'Тұсқағаздағы арабша мәтін міндетті емес және басында өшірулі.',
                    'Аятпен мәтін немесе сурет ретінде бөлісе аласыз.',
                ],
            },
            ky: {
                baslik: 'Башкы экраныңызда күндүн аяты',
                aciklama: 'Күн сайын багымдатта алмашып турган аятты жана анын котормосун башкы экраныңызга виджет катары кошуп, кааласаңыз, кулпу экраныңыздын тушкагазы кылыңыз.',
                detayAciklama: 'Виджет, тушкагаз жана колдонмодогу «Күндүн аяты» барагы бир эле аятты көрсөтөт. Арабча текст Tanzil долбоорунан, котормолор QuranEnc сайтынан өзгөртүүсүз алынат.',
                ctaEtiketi: 'Күндүн аятын ачуу',
                detaylar: [
                    'Котормо эч качан кесилбейт; батпаган күндөрү виджет окуу үчүн басууну сунуштайт.',
                    'Тушкагаздагы арабча текст милдеттүү эмес жана башында өчүк турат.',
                    'Аятты текст же сүрөт катары бөлүшө аласыз.',
                ],
            },
            tg: {
                baslik: 'Ояти рӯз дар экрани асосии Шумо',
                aciklama: 'Оятеро бо тарҷумааш, ки ҳар рӯз ҳангоми бомдод иваз мешавад, ҳамчун виҷет ба экрани асосӣ илова кунед ва агар хоҳед, онро тасвири заминаи экрани қулф гузоред.',
                detayAciklama: 'Виҷет, тасвири замина ва саҳифаи «Ояти рӯз» дар барнома ҳамон оятро нишон медиҳанд. Матни арабӣ аз Лоиҳаи Tanzil ва тарҷумаҳо аз QuranEnc бе тағйир гирифта мешаванд.',
                ctaEtiketi: 'Ояти рӯзро кушоед',
                detaylar: [
                    'Тарҷума ҳеҷ гоҳ бурида намешавад; дар рӯзҳое, ки намеғунҷад, виҷет хоҳиш мекунад, ки барои хондан пахш кунед.',
                    'Матни арабӣ дар тасвири замина ихтиёрӣ аст ва дар аввал хомӯш аст.',
                    'Оятро ҳамчун матн ё тасвир мубодила карда метавонед.',
                ],
            },
            sw: {
                baslik: 'Aya ya siku kwenye skrini yako kuu',
                aciklama: 'Ongeza kwenye skrini yako kuu, kama wijeti, aya na tafsiri yake inayobadilika kila siku wakati wa Alfajiri, na ukipenda iweke kuwa mandhari ya skrini iliyofungwa.',
                detayAciklama: 'Wijeti, mandhari na ukurasa wa "Aya ya siku" katika programu zinaonyesha aya ile ile. Maandishi ya Kiarabu yanatoka Mradi wa Tanzil na tafsiri kutoka QuranEnc, bila kubadilishwa.',
                ctaEtiketi: 'Fungua aya ya siku',
                detaylar: [
                    'Tafsiri haikatwi kamwe; siku isipotoshea, wijeti inakuomba uguse ili uisome.',
                    'Maandishi ya Kiarabu kwenye mandhari ni hiari na yanaanza yakiwa yamezimwa.',
                    'Unaweza kushiriki aya kama maandishi au kama picha.',
                ],
            },
            ha: {
                baslik: 'Ayar yau a allon gidanku',
                aciklama: 'Ku ƙara aya da fassararta da ke canjawa kowace rana a Asuba a allon gidanku a matsayin widget, kuma idan kuna so ku mai da ita fuskar bangon allon kullenku.',
                detayAciklama: 'Widget, fuskar bango da shafin "Ayar yau" a manhajar suna nuna aya ɗaya. Rubutun Larabci daga Tanzil Project yake, fassarori kuma daga QuranEnc, ba tare da canji ba.',
                ctaEtiketi: 'Buɗe ayar yau',
                detaylar: [
                    'Ba a taɓa yanke fassara; a ranakun da ba ta dace ba, widget yana roƙon ku ku taɓa don karanta ta.',
                    'Rubutun Larabci a fuskar bango zaɓi ne kuma a kashe yake da farko.',
                    'Kuna iya raba ayar a matsayin rubutu ko hoto.',
                ],
            },
            am: {
                baslik: 'የዕለቱ አንቀጽ በመነሻ ገጽዎ ላይ',
                aciklama: 'በየቀኑ በፈጅር የሚቀየር አንቀጽ እና ትርጉሙን እንደ ዊጀት ወደ መነሻ ገጽዎ ያክሉ፤ ከፈለጉም የመቆለፊያ ገጽዎ የግድግዳ ምስል ያድርጉት።',
                detayAciklama: 'ዊጀቱ፣ የግድግዳ ምስሉ እና በመተግበሪያው ውስጥ ያለው “የዕለቱ አንቀጽ” ገጽ ተመሳሳይ አንቀጽ ያሳያሉ። የዓረብኛ ጽሑፉ ከTanzil Project፣ ትርጉሞቹም ከQuranEnc ሳይቀየሩ ይመጣሉ።',
                ctaEtiketi: 'የዕለቱን አንቀጽ ክፈት',
                detaylar: [
                    'ትርጉሙ በፍጹም አይቆረጥም፤ በማይበቃባቸው ቀናት ዊጀቱ ለማንበብ እንዲነኩ ይጠይቅዎታል።',
                    'በግድግዳ ምስሉ ላይ የዓረብኛ ጽሑፍ አማራጭ ሲሆን በመጀመሪያ ጠፍቷል።',
                    'አንቀጹን እንደ ጽሑፍ ወይም እንደ ምስል ማጋራት ይችላሉ።',
                ],
            },
            om: {
                baslik: 'Aayata guyyaa fuula jalqabaa keessan irratti',
                aciklama: 'Aayataafi hiikkaa isaa guyyaa guyyaan Subhiitti jijjiiramu akka wiijetiitti fuula jalqabaa keessanitti dabalaa, yoo barbaaddan suuraa duubaa fuula cufaa keessanii godhaa.',
                detayAciklama: 'Wiijetiin, suuraan duubaafi fuulli "Aayata guyyaa" appicha keessa jiru aayata tokkicha agarsiisu. Barreeffamni Arabaa Tanzil Project irraa, hiikkaaleen immoo QuranEnc irraa osoo hin jijjiiramin dhufu.',
                ctaEtiketi: 'Aayata guyyaa banaa',
                detaylar: [
                    'Hiikkaan gonkumaa hin kutamu; guyyaa hin geenye, wiijetiin akka dubbisuuf tuqxan isin gaafata.',
                    'Barreeffamni Arabaa suuraa duubaa irratti filannoo dha, jalqaba irratti cufaa dha.',
                    'Aayata akka barreeffamaa ykn akka suuraatti qooddachuu dandeessu.',
                ],
            },
            so: {
                baslik: 'Aayadda maanta shaashaddaada hore',
                aciklama: 'Ku dar shaashaddaada hore wijit ahaan aayad iyo tarjumaaddeeda oo isbeddesha maalin kasta waqtiga Subax, haddii aad rabtona ka dhig sawirka asalka shaashadda qufulka.',
                detayAciklama: 'Wijitka, sawirka asalka iyo bogga "Aayadda maanta" ee barnaamijku waxay muujiyaan isla aayadda. Qoraalka Carabiga wuxuu ka yimaadaa Mashruuca Tanzil, tarjumaaduhuna QuranEnc, iyadoon la beddelin.',
                ctaEtiketi: 'Fur aayadda maanta',
                detaylar: [
                    'Tarjumaadda marnaba lama gooyo; maalmaha aysan ku filnayn, wijitku wuxuu kaa codsadaa inaad taabato si aad u akhrido.',
                    'Qoraalka Carabiga ee sawirka asalka waa ikhtiyaari, wuxuuna ku bilaabmaa isagoo dansan.',
                    'Aayadda waxaad u wadaagi kartaa qoraal ama sawir ahaan.',
                ],
            },
            ff: {
                baslik: 'Aaya ñalawma e yaynirde arannde mon',
                aciklama: 'Ɓeydee aaya e firo mum waylotooɗo ñalawma kala e subaka e yaynirde arannde mon wa widget, waɗon ɗum natal yaynirde uddaande mon so njiɗon.',
                detayAciklama: 'Widget, natal yaynirde e hello “Aaya ñalawma” e jaaɓngal ngal hino holla aaya gooto. Binndi Aarabeere ndi iwi ko e Eɓɓoore Tanzil, firooji ɗin iwi ko e QuranEnc, tawa waylaaka.',
                ctaEtiketi: 'Udditee aaya ñalawma',
                detaylar: [
                    'Firo ngo taƴetaake abada; ñalɗe ɗe ngo haanaani, widget ngo hino ƴama on dobde ngam janngude ngo.',
                    'Binndi Aarabeere e natal yaynirde ko e suɓaade, hino fuɗɗoo ñifaa.',
                    'Hiɗon mbaawi lollinde aaya oo wa binndi walla wa natal.',
                ],
            },
            yo: {
                baslik: 'Āyah ti òní lórí ojú-ìbòjú ilé yín',
                aciklama: 'Ẹ fi āyah kan àti ìtumọ̀ rẹ̀ tí ń yí padà lójoojúmọ́ ní Subh kún ojú-ìbòjú ilé yín gẹ́gẹ́ bí wíjẹ́ẹ̀tì, kí ẹ sì fi í ṣe àwòrán ojú-ìbòjú títì yín tí ẹ bá fẹ́.',
                detayAciklama: 'Wíjẹ́ẹ̀tì, àwòrán ìbòjú àti ojú-ìwé "Āyah ti òní" nínú ìṣàfilọ́lẹ̀ ń fi āyah kan náà hàn. Ọ̀rọ̀ Lárúbáwá wá láti Tanzil Project, àwọn ìtumọ̀ sì wá láti QuranEnc, láìyí wọn padà.',
                ctaEtiketi: 'Ṣí āyah ti òní',
                detaylar: [
                    'A kì í gé ìtumọ̀ kúrú láéláé; ní ọjọ́ tí kò bá bá a mu, wíjẹ́ẹ̀tì yóò ní kí ẹ tẹ̀ ẹ́ láti kà á.',
                    'Ọ̀rọ̀ Lárúbáwá lórí àwòrán ìbòjú jẹ́ àṣàyàn, ó sì wà ní pípa ní ìbẹ̀rẹ̀.',
                    'Ẹ lè pín āyah náà gẹ́gẹ́ bí ọ̀rọ̀ tàbí àwòrán.',
                ],
            },
        },
    },
    {
        id: 'gunun-ayeti-ios',
        platformlar: ['ios'],
        yetenek: 'iosWidget',
        surum: '0.71.0',
        tarih: '2026-10-24',
        baslik: 'Günün ayeti ana ekranınızda',
        aciklama:
            'Her gün imsakta değişen bir ayeti ve mealini ana ekranınıza ve kilit ekranınıza widget olarak ekleyebilirsiniz.',
        detayAciklama:
            "Widget ve uygulamadaki \"Günün ayeti\" sayfası aynı ayeti gösterir. Arapça metin Tanzil Projesi'nden, mealler QuranEnc'ten değiştirilmeden alınır.",
        ikon: 'book-open',
        hedefSayfa: 'GununAyeti',
        ctaEtiketi: 'Günün ayetini açın',
        detaylar: [
            'Meal hiçbir boyutta kesilmez; sığmadığı gün widget okumak için dokunmanızı ister.',
            'Kısayollar uygulamasıyla günün ayetini her sabah duvar kâğıdınız yapabilirsiniz; adımlar uygulamada anlatılır.',
            'Ayeti metin ya da görsel olarak paylaşabilirsiniz.',
        ],
        ceviri: {
            en: {
                baslik: 'Verse of the day on your home screen',
                aciklama:
                    'Add a verse and its translation that changes every day at Fajr to your Home Screen and Lock Screen as a widget.',
                detayAciklama:
                    'The widget and the "Verse of the day" page in the app show the same verse. The Arabic text comes from the Tanzil Project and translations from QuranEnc, unchanged.',
                ctaEtiketi: 'Open the verse of the day',
                detaylar: [
                    "The translation is never cut off; on days it doesn't fit, the widget asks you to tap to read it.",
                    'With the Shortcuts app you can make the verse of the day your wallpaper every morning; the app walks you through the steps.',
                    'You can share the verse as text or as an image.',
                ],
            },
            id: {
                baslik: 'Ayat hari ini di layar utama Anda',
                aciklama: 'Tambahkan ayat beserta terjemahannya, yang berganti setiap hari saat Subuh, ke Layar Utama dan Layar Kunci sebagai widget.',
                detayAciklama: 'Widget dan halaman "Ayat hari ini" di aplikasi menampilkan ayat yang sama. Teks Arab berasal dari Proyek Tanzil dan terjemahan dari QuranEnc, tanpa diubah.',
                ctaEtiketi: 'Buka ayat hari ini',
                detaylar: [
                    'Terjemahan tidak pernah dipotong; pada hari terjemahan tidak muat, widget meminta Anda mengetuk untuk membacanya.',
                    'Dengan aplikasi Pintasan, Anda dapat menjadikan ayat hari ini sebagai wallpaper setiap pagi; aplikasi memandu langkah-langkahnya.',
                    'Anda dapat membagikan ayat sebagai teks atau gambar.',
                ],
            },
            de: {
                baslik: 'Vers des Tages auf Ihrem Home-Bildschirm',
                aciklama: 'Fügen Sie einen Vers mit Übersetzung, der jeden Tag zu Fajr wechselt, als Widget zu Ihrem Home-Bildschirm und Sperrbildschirm hinzu.',
                detayAciklama: 'Das Widget und die Seite „Vers des Tages“ in der App zeigen denselben Vers. Der arabische Text stammt vom Tanzil-Projekt, die Übersetzungen unverändert von QuranEnc.',
                ctaEtiketi: 'Vers des Tages öffnen',
                detaylar: [
                    'Die Übersetzung wird nie abgeschnitten; passt sie an einem Tag nicht, bittet das Widget Sie, zum Lesen zu tippen.',
                    'Mit der App Kurzbefehle können Sie den Vers des Tages jeden Morgen zum Hintergrundbild machen; die App führt Sie durch die Schritte.',
                    'Sie können den Vers als Text oder als Bild teilen.',
                ],
            },
            fr: {
                baslik: 'Le verset du jour sur votre écran d’accueil',
                aciklama: 'Ajoutez sur votre écran d’accueil et votre écran de verrouillage, sous forme de widget, un verset et sa traduction qui changent chaque jour à l’Imsak.',
                detayAciklama: 'Le widget et la page « Verset du jour » de l’application affichent le même verset. Le texte arabe vient du Tanzil Project et les traductions de QuranEnc, sans modification.',
                ctaEtiketi: 'Ouvrir le verset du jour',
                detaylar: [
                    'La traduction n’est jamais coupée ; les jours où elle ne tient pas, le widget vous invite à la toucher pour la lire.',
                    'Avec l’app Raccourcis, vous pouvez faire du verset du jour votre fond d’écran chaque matin ; l’application vous guide pas à pas.',
                    'Vous pouvez partager le verset en texte ou en image.',
                ],
            },
            bs: {
                baslik: 'Ajet dana na početnom ekranu',
                aciklama: 'Dodajte na početni i zaključani ekran widget s ajetom i prijevodom njegovog značenja koji se mijenja svaki dan u zoru.',
                detayAciklama: 'Widget i stranica „Ajet dana” u aplikaciji prikazuju isti ajet. Arapski tekst dolazi iz Projekta Tanzil, a prijevodi značenja s QuranEnca, bez izmjena.',
                ctaEtiketi: 'Otvorite ajet dana',
                detaylar: [
                    'Prijevod značenja se nikada ne skraćuje; u danima kada ne stane, widget Vas poziva da ga dodirnete i pročitate.',
                    'Pomoću aplikacije Prečice ajet dana svako jutro može postati Vaša pozadina; aplikacija Vas vodi kroz korake.',
                    'Ajet možete podijeliti kao tekst ili kao sliku.',
                ],
            },
            ru: {
                baslik: 'Аят дня на главном экране',
                aciklama: 'Добавьте на экран «Домой» и экран блокировки виджет с аятом и переводом смыслов, который меняется каждый день в имсак.',
                detayAciklama: 'Виджет и страница «Аят дня» в приложении показывают один и тот же аят. Арабский текст взят из проекта Tanzil, переводы смыслов — с QuranEnc, без изменений.',
                ctaEtiketi: 'Открыть аят дня',
                detaylar: [
                    'Перевод смыслов никогда не обрезается; если в какой-то день он не помещается, виджет предложит нажать, чтобы прочитать.',
                    'С приложением «Быстрые команды» аят дня может каждое утро становиться вашими обоями; приложение покажет все шаги.',
                    'Аятом можно поделиться текстом или картинкой.',
                ],
            },
            ms: {
                baslik: 'Ayat hari ini di skrin utama anda',
                aciklama: 'Tambahkan sepotong ayat beserta terjemahannya yang bertukar setiap hari pada waktu Subuh ke Skrin Utama dan Skrin Kunci anda sebagai widget.',
                detayAciklama: 'Widget dan halaman "Ayat hari ini" dalam aplikasi memaparkan ayat yang sama. Teks Arab diambil daripada Projek Tanzil dan terjemahan daripada QuranEnc, tanpa diubah.',
                ctaEtiketi: 'Buka ayat hari ini',
                detaylar: [
                    'Terjemahan tidak sekali-kali dipotong; pada hari ia tidak muat, widget meminta anda mengetik untuk membacanya.',
                    'Dengan aplikasi Pintasan, anda boleh menjadikan ayat hari ini kertas dinding anda setiap pagi; aplikasi membimbing anda langkah demi langkah.',
                    'Anda boleh berkongsi ayat sebagai teks atau imej.',
                ],
            },
            ar: {
                baslik: 'آية اليوم على شاشتك الرئيسية',
                aciklama: 'آية تتجدد كل يوم عند الفجر، تُضاف إلى الشاشة الرئيسية وشاشة القفل كأداة.',
                detayAciklama: 'الأداة وصفحة «آية اليوم» في التطبيق تعرضان الآية نفسها. النص القرآني من مشروع تنزيل، دون تغيير.',
                ctaEtiketi: 'فتح آية اليوم',
                detaylar: [
                    'لا تُقطع الآية أبدًا؛ وفي الأيام التي لا تتسع فيها تدعو الأداة إلى النقر لقراءتها.',
                    'بتطبيق الاختصارات يمكن جعل آية اليوم خلفية كل صباح؛ ويرشدك التطبيق خطوة بخطوة.',
                    'يمكن مشاركة الآية نصًّا أو صورة.',
                ],
            },
            ur: {
                baslik: 'آج کی آیت آپ کی ہوم اسکرین پر',
                aciklama: 'ہر روز فجر کے وقت بدلنے والی ایک آیت اور اس کا ترجمہ ویجیٹ کے طور پر ہوم اسکرین اور لاک اسکرین پر شامل کریں۔',
                detayAciklama: 'ویجیٹ اور ایپ کا “آج کی آیت” صفحہ ایک ہی آیت دکھاتے ہیں۔ عربی متن Tanzil پروجیکٹ سے اور تراجم QuranEnc سے بغیر تبدیلی کے لیے جاتے ہیں۔',
                ctaEtiketi: 'آج کی آیت کھولیں',
                detaylar: [
                    'ترجمہ کبھی کاٹا نہیں جاتا؛ جس دن پورا نہ سمائے، ویجیٹ پڑھنے کے لیے تھپتھپانے کو کہتا ہے۔',
                    'Shortcuts ایپ سے آج کی آیت کو ہر صبح وال پیپر بنایا جا سکتا ہے؛ ایپ مراحل میں رہنمائی کرتی ہے۔',
                    'آیت متن یا تصویر کے طور پر شیئر کی جا سکتی ہے۔',
                ],
            },
            es: {
                baslik: 'La aleya del día en su pantalla de inicio',
                aciklama: 'Añada a su pantalla de inicio y a su pantalla de bloqueo, como widget, una aleya con su traducción que cambia cada día en Fajr.',
                detayAciklama: 'El widget y la página «Aleya del día» de la aplicación muestran la misma aleya. El texto árabe procede del Tanzil Project y las traducciones de QuranEnc, sin cambios.',
                ctaEtiketi: 'Abrir la aleya del día',
                detaylar: [
                    'La traducción nunca se corta; los días en que no cabe, el widget le pide que toque para leerla.',
                    'Con la app Atajos puede poner cada mañana la aleya del día como fondo de pantalla; la aplicación le guía paso a paso.',
                    'Puede compartir la aleya como texto o como imagen.',
                ],
            },
            nl: {
                baslik: 'Vers van de dag op uw beginscherm',
                aciklama: 'Zet een vers met vertaling, dat elke dag bij Fajr wisselt, als widget op uw beginscherm en toegangsscherm.',
                detayAciklama: 'De widget en de pagina "Vers van de dag" in de app tonen hetzelfde vers. De Arabische tekst komt van het Tanzil-project en de vertalingen ongewijzigd van QuranEnc.',
                ctaEtiketi: 'Het vers van de dag openen',
                detaylar: [
                    'De vertaling wordt nooit afgekapt; op dagen dat ze niet past, vraagt de widget u te tikken om te lezen.',
                    'Met de app Opdrachten kunt u het vers van de dag elke ochtend als achtergrond instellen; de app leidt u door de stappen.',
                    'U kunt het vers als tekst of als afbeelding delen.',
                ],
            },
            sq: {
                baslik: 'Ajeti i ditës në ekranin kryesor',
                aciklama: 'Shtoni në ekranin kryesor dhe në ekranin e kyçjes si widget një ajet me përkthimin e tij që ndryshon çdo ditë në sabah.',
                detayAciklama: 'Widget-i dhe faqja "Ajeti i ditës" në aplikacion tregojnë të njëjtin ajet. Teksti arab vjen nga Projekti Tanzil dhe përkthimet nga QuranEnc, pa ndryshime.',
                ctaEtiketi: 'Hapni ajetin e ditës',
                detaylar: [
                    'Përkthimi nuk shkurtohet kurrë; në ditët kur nuk nxë, widget-i ju fton ta prekni për ta lexuar.',
                    'Me aplikacionin Shortcuts mund ta bëni ajetin e ditës sfond çdo mëngjes; aplikacioni ju udhëzon hap pas hapi.',
                    'Ajetin mund ta ndani si tekst ose si figurë.',
                ],
            },
            hi: {
                baslik: 'आज की आयत आपकी होम स्क्रीन पर',
                aciklama: 'हर दिन फ़ज्र के वक़्त बदलने वाली एक आयत और उसका तर्जुमा अपनी होम स्क्रीन और लॉक स्क्रीन पर विजेट के रूप में जोड़ें।',
                detayAciklama: 'विजेट और ऐप का "आज की आयत" पेज एक ही आयत दिखाते हैं। अरबी टेक्स्ट Tanzil प्रोजेक्ट से और तर्जुमे QuranEnc से, बिना बदलाव के लिए जाते हैं।',
                ctaEtiketi: 'आज की आयत खोलें',
                detaylar: [
                    'तर्जुमा कभी काटा नहीं जाता; जिस दिन वह नहीं समाता, विजेट पढ़ने के लिए टैप करने को कहता है।',
                    'Shortcuts ऐप से आज की आयत को हर सुबह वॉलपेपर बनाया जा सकता है; ऐप आपको क़दम-ब-क़दम बताता है।',
                    'आयत को टेक्स्ट या तस्वीर के रूप में शेयर किया जा सकता है।',
                ],
            },
            bn: {
                baslik: 'হোম স্ক্রিনে দিনের আয়াত',
                aciklama: 'প্রতিদিন ফজরে বদলানো একটি আয়াত ও তার অনুবাদ উইজেট হিসেবে হোম স্ক্রিন ও লক স্ক্রিনে যোগ করুন।',
                detayAciklama: 'উইজেট ও অ্যাপের "দিনের আয়াত" পৃষ্ঠা একই আয়াত দেখায়। আরবি লেখা Tanzil Project থেকে এবং অনুবাদ QuranEnc থেকে হুবহু নেওয়া হয়।',
                ctaEtiketi: 'দিনের আয়াত খুলুন',
                detaylar: [
                    'অনুবাদ কখনো কাটা হয় না; যেদিন আঁটে না, সেদিন উইজেট পড়তে ট্যাপ করতে বলে।',
                    'Shortcuts অ্যাপ দিয়ে প্রতিদিন সকালে দিনের আয়াতকে ওয়ালপেপার করতে পারেন; অ্যাপ ধাপগুলো দেখিয়ে দেয়।',
                    'আয়াতটি লেখা বা ছবি হিসেবে শেয়ার করতে পারেন।',
                ],
            },
            fa: {
                baslik: 'آیهٔ روز روی صفحهٔ اصلی شما',
                aciklama: 'آیه‌ای را که هر روز هنگام صبح عوض می‌شود همراه با ترجمه‌اش به‌صورت ابزارک به صفحهٔ اصلی و صفحهٔ قفل بیفزایید.',
                detayAciklama: 'ابزارک و صفحهٔ «آیهٔ روز» در برنامه همان آیه را نشان می‌دهند. متن عربی از پروژهٔ Tanzil و ترجمه‌ها بدون تغییر از QuranEnc گرفته می‌شوند.',
                ctaEtiketi: 'باز کردن آیهٔ روز',
                detaylar: [
                    'ترجمه هرگز بریده نمی‌شود؛ روزهایی که جا نشود، ابزارک از شما می‌خواهد برای خواندن ضربه بزنید.',
                    'با برنامهٔ «میانبرها» می‌توانید آیهٔ روز را هر صبح تصویر زمینه کنید؛ برنامه گام‌به‌گام راهنمایی‌تان می‌کند.',
                    'می‌توانید آیه را به‌صورت متن یا تصویر به اشتراک بگذارید.',
                ],
            },
            ps: {
                baslik: 'د ورځې آیت ستاسو په اصلي سکرین کې',
                aciklama: 'یو آیت او د هغه ژباړه چې هره ورځ د سهار په وخت بدلېږي، د ویجټ په توګه اصلي سکرین او د قلف سکرین ته اضافه کړئ.',
                detayAciklama: 'ویجټ او په اپ کې د «د ورځې آیت» پاڼه همغه آیت ښيي. عربي متن د Tanzil له پروژې او ژباړې له QuranEnc څخه پرته له بدلون اخیستل کېږي.',
                ctaEtiketi: 'د ورځې آیت پرانیزئ',
                detaylar: [
                    'ژباړه هېڅکله نه پرې کېږي؛ په هغو ورځو چې نه ځایېږي، ویجټ غواړي چې د لوستلو لپاره یې کېکاږئ.',
                    'د Shortcuts اپ په مرسته کولای شئ د ورځې آیت هر سهار خپل شالید کړئ؛ اپ ګامونه درښيي.',
                    'آیت د متن یا انځور په توګه شریکولای شئ.',
                ],
            },
            ckb: {
                baslik: 'ئایەتی ڕۆژ لەسەر شاشەی سەرەکی',
                aciklama: 'ئایەتێک و وەرگێڕانەکەی کە ھەموو ڕۆژێک لە کاتی بەیانیدا دەگۆڕێت وەک ویجێت بخەنە سەر شاشەی سەرەکی و شاشەی قوفڵ.',
                detayAciklama: 'ویجێت و پەڕەی «ئایەتی ڕۆژ» لە ئەپەکەدا ھەمان ئایەت پیشان دەدەن. دەقی عەرەبی لە پرۆژەی Tanzil و وەرگێڕانەکان لە QuranEnc بێ گۆڕانکاری وەردەگیرێن.',
                ctaEtiketi: 'کردنەوەی ئایەتی ڕۆژ',
                detaylar: [
                    'وەرگێڕانەکە ھەرگیز ناپچڕێت؛ لەو ڕۆژانەی جێی نابێتەوە، ویجێتەکە داواتان لێ دەکات بۆ خوێندنەوە دەستی لێ بدەن.',
                    'بە ئەپی Shortcuts دەتوانن ھەموو بەیانییەک ئایەتی ڕۆژ بکەنە وێنەی پاشبنەما؛ ئەپەکە ھەنگاوەکانتان پیشان دەدات.',
                    'دەتوانن ئایەتەکە وەک دەق یان وێنە ھاوبەش بکەن.',
                ],
            },
            ug: {
                baslik: 'كۈننىڭ ئايىتى باش ئېكرانىڭىزدا',
                aciklama: 'ھەر كۈنى بامداتتا ئالمىشىدىغان بىر ئايەت ۋە ئۇنىڭ تەرجىمىسىنى باش ئېكرانىڭىز ۋە قۇلۇپ ئېكرانىڭىزغا كىچىك قورال قىلىپ قوشالايسىز.',
                detayAciklama: 'كىچىك قورال ۋە ئەپتىكى «كۈننىڭ ئايىتى» بېتى ئوخشاش ئايەتنى كۆرسىتىدۇ. ئەرەبچە تېكىست Tanzil تۈرىدىن، تەرجىمىلەر QuranEnc دىن ئۆزگەرتىلمەي ئېلىنىدۇ.',
                ctaEtiketi: 'كۈننىڭ ئايىتىنى ئېچىڭ',
                detaylar: [
                    'تەرجىمە ھېچقانداق چوڭلۇقتا كېسىلمەيدۇ؛ سىغمىغان كۈنى كىچىك قورال ئوقۇش ئۈچۈن چېكىشىڭىزنى سورايدۇ.',
                    'تېزلەتمىلەر ئەپى بىلەن كۈننىڭ ئايىتىنى ھەر ئەتىگەن تام قەغىزىڭىز قىلالايسىز؛ قەدەملەر ئەپتە چۈشەندۈرۈلىدۇ.',
                    'ئايەتنى تېكىست ياكى رەسىم قىلىپ ھەمبەھىرلىيەلەيسىز.',
                ],
            },
            az: {
                baslik: 'Günün ayəsi ana ekranınızda',
                aciklama: 'Hər gün sübhdə dəyişən ayəni və tərcüməsini vidcet kimi ana ekranınıza və kilid ekranınıza əlavə edin.',
                detayAciklama: 'Vidcet və tətbiqdəki "Günün ayəsi" səhifəsi eyni ayəni göstərir. Ərəbcə mətn Tanzil layihəsindən, tərcümələr isə QuranEnc-dən dəyişdirilmədən götürülür.',
                ctaEtiketi: 'Günün ayəsini açın',
                detaylar: [
                    'Tərcümə heç vaxt kəsilmir; sığmadığı günlərdə vidcet oxumaq üçün toxunmağınızı xahiş edir.',
                    'Shortcuts tətbiqi ilə günün ayəsini hər səhər divar kağızı edə bilərsiniz; tətbiq addımları sizə göstərir.',
                    'Ayəni mətn və ya şəkil kimi paylaşa bilərsiniz.',
                ],
            },
            uz: {
                baslik: 'Кун ояти бош экранингизда',
                aciklama: 'Ҳар куни бомдодда алмашадиган оят ва унинг таржимасини бош экранингиз ва қулф экранингизга виджет сифатида қўшишингиз мумкин.',
                detayAciklama: 'Виджет ва иловадаги «Кун ояти» саҳифаси бир хил оятни кўрсатади. Арабча матн Tanzil лойиҳасидан, таржималар QuranEnc сайтидан ўзгаришсиз олинади.',
                ctaEtiketi: 'Кун оятини очиш',
                detaylar: [
                    'Таржима ҳеч бир ўлчамда қисқартирилмайди; сиғмаган куни виджет ўқиш учун босишингизни сўрайди.',
                    'Shortcuts иловаси билан кун оятини ҳар тонг фон расмингиз қилишингиз мумкин; қадамлар иловада тушунтирилади.',
                    'Оятни матн ёки расм сифатида улашишингиз мумкин.',
                ],
            },
            kk: {
                baslik: 'Күннің аяты басты экраныңызда',
                aciklama: 'Күн сайын таң уақытында ауысатын аят пен оның аудармасын басты экран мен құлып экранына виджет ретінде қоса аласыз.',
                detayAciklama: 'Виджет пен қолданбадағы «Күннің аяты» беті бір аятты көрсетеді. Арабша мәтін Tanzil жобасынан, аудармалар QuranEnc сайтынан өзгертілмей алынады.',
                ctaEtiketi: 'Күннің аятын ашу',
                detaylar: [
                    'Аударма ешбір өлшемде қысқартылмайды; сыймаған күні виджет оқу үшін түртуді сұрайды.',
                    '«Жылдам пәрмендер» қолданбасы арқылы күннің аятын күн сайын таңертең тұсқағаз ете аласыз; қадамдар қолданбада түсіндірілген.',
                    'Аятпен мәтін немесе сурет ретінде бөлісе аласыз.',
                ],
            },
            ky: {
                baslik: 'Башкы экраныңызда күндүн аяты',
                aciklama: 'Күн сайын багымдатта алмашып турган аятты жана анын котормосун башкы экраныңызга жана кулпу экраныңызга виджет катары кошуңуз.',
                detayAciklama: 'Виджет жана колдонмодогу «Күндүн аяты» барагы бир эле аятты көрсөтөт. Арабча текст Tanzil долбоорунан, котормолор QuranEnc сайтынан өзгөртүүсүз алынат.',
                ctaEtiketi: 'Күндүн аятын ачуу',
                detaylar: [
                    'Котормо эч качан кесилбейт; батпаган күндөрү виджет окуу үчүн басууну сунуштайт.',
                    'Командалар колдонмосу менен күндүн аятын ар таң тушкагаз кыла аласыз; колдонмо кадамдарды көрсөтүп берет.',
                    'Аятты текст же сүрөт катары бөлүшө аласыз.',
                ],
            },
            tg: {
                baslik: 'Ояти рӯз дар экрани асосии Шумо',
                aciklama: 'Оятеро бо тарҷумааш, ки ҳар рӯз ҳангоми бомдод иваз мешавад, ҳамчун виҷет ба экрани асосӣ ва экрани қулф илова кунед.',
                detayAciklama: 'Виҷет ва саҳифаи «Ояти рӯз» дар барнома ҳамон оятро нишон медиҳанд. Матни арабӣ аз Лоиҳаи Tanzil ва тарҷумаҳо аз QuranEnc бе тағйир гирифта мешаванд.',
                ctaEtiketi: 'Ояти рӯзро кушоед',
                detaylar: [
                    'Тарҷума ҳеҷ гоҳ бурида намешавад; дар рӯзҳое, ки намеғунҷад, виҷет хоҳиш мекунад, ки барои хондан пахш кунед.',
                    'Бо барномаи «Фармонҳои зуд» (Shortcuts) метавонед ояти рӯзро ҳар саҳар тасвири заминаи худ кунед; барнома қадамҳоро ба Шумо нишон медиҳад.',
                    'Оятро ҳамчун матн ё тасвир мубодила карда метавонед.',
                ],
            },
            sw: {
                baslik: 'Aya ya siku kwenye skrini yako kuu',
                aciklama: 'Ongeza kwenye Skrini Kuu na Skrini Iliyofungwa, kama wijeti, aya na tafsiri yake inayobadilika kila siku wakati wa Alfajiri.',
                detayAciklama: 'Wijeti na ukurasa wa "Aya ya siku" katika programu zinaonyesha aya ile ile. Maandishi ya Kiarabu yanatoka Mradi wa Tanzil na tafsiri kutoka QuranEnc, bila kubadilishwa.',
                ctaEtiketi: 'Fungua aya ya siku',
                detaylar: [
                    'Tafsiri haikatwi kamwe; siku isipotoshea, wijeti inakuomba uguse ili uisome.',
                    'Kwa programu ya Shortcuts unaweza kuifanya aya ya siku kuwa mandhari yako kila asubuhi; programu inakuongoza hatua kwa hatua.',
                    'Unaweza kushiriki aya kama maandishi au kama picha.',
                ],
            },
            ha: {
                baslik: 'Ayar yau a allon gidanku',
                aciklama: 'Ku ƙara aya da fassararta da ke canjawa kowace rana a Asuba a allon gida da allon kulle na wayarku a matsayin widget.',
                detayAciklama: 'Widget da shafin "Ayar yau" a manhajar suna nuna aya ɗaya. Rubutun Larabci daga Tanzil Project yake, fassarori kuma daga QuranEnc, ba tare da canji ba.',
                ctaEtiketi: 'Buɗe ayar yau',
                detaylar: [
                    'Ba a taɓa yanke fassara; a ranakun da ba ta dace ba, widget yana roƙon ku ku taɓa don karanta ta.',
                    'Da manhajar Shortcuts kuna iya mai da ayar yau fuskar bangonku kowace safiya; manhajar tana jagorantar ku mataki-mataki.',
                    'Kuna iya raba ayar a matsayin rubutu ko hoto.',
                ],
            },
            am: {
                baslik: 'የዕለቱ አንቀጽ በመነሻ ገጽዎ ላይ',
                aciklama: 'በየቀኑ በፈጅር የሚቀየር አንቀጽ እና ትርጉሙን እንደ ዊጀት ወደ መነሻ ገጽዎ እና ወደ መቆለፊያ ገጽዎ ያክሉ።',
                detayAciklama: 'ዊጀቱ እና በመተግበሪያው ውስጥ ያለው “የዕለቱ አንቀጽ” ገጽ ተመሳሳይ አንቀጽ ያሳያሉ። የዓረብኛ ጽሑፉ ከTanzil Project፣ ትርጉሞቹም ከQuranEnc ሳይቀየሩ ይመጣሉ።',
                ctaEtiketi: 'የዕለቱን አንቀጽ ክፈት',
                detaylar: [
                    'ትርጉሙ በፍጹም አይቆረጥም፤ በማይበቃባቸው ቀናት ዊጀቱ ለማንበብ እንዲነኩ ይጠይቅዎታል።',
                    'በአቋራጮች መተግበሪያ የዕለቱን አንቀጽ በየጠዋቱ የግድግዳ ምስልዎ ማድረግ ይችላሉ፤ መተግበሪያው ደረጃዎቹን ያሳይዎታል።',
                    'አንቀጹን እንደ ጽሑፍ ወይም እንደ ምስል ማጋራት ይችላሉ።',
                ],
            },
            om: {
                baslik: 'Aayata guyyaa fuula jalqabaa keessan irratti',
                aciklama: 'Aayataafi hiikkaa isaa guyyaa guyyaan Subhiitti jijjiiramu akka wiijetiitti Fuula Jalqabaafi Fuula Cufaa keessanitti dabalaa.',
                detayAciklama: 'Wiijetiinifi fuulli "Aayata guyyaa" appicha keessa jiru aayata tokkicha agarsiisu. Barreeffamni Arabaa Tanzil Project irraa, hiikkaaleen immoo QuranEnc irraa osoo hin jijjiiramin dhufu.',
                ctaEtiketi: 'Aayata guyyaa banaa',
                detaylar: [
                    'Hiikkaan gonkumaa hin kutamu; guyyaa hin geenye, wiijetiin akka dubbisuuf tuqxan isin gaafata.',
                    'Appii Shortcuts fayyadamuun ganama ganama aayata guyyaa suuraa duubaa gochuu dandeessu; appichi tarkaanfiilee isin qajeelcha.',
                    'Aayata akka barreeffamaa ykn akka suuraatti qooddachuu dandeessu.',
                ],
            },
            so: {
                baslik: 'Aayadda maanta shaashaddaada hore',
                aciklama: 'Ku dar shaashadda hore iyo shaashadda qufulka wijit ahaan aayad iyo tarjumaaddeeda oo isbeddesha maalin kasta waqtiga Subax.',
                detayAciklama: 'Wijitka iyo bogga "Aayadda maanta" ee barnaamijku waxay muujiyaan isla aayadda. Qoraalka Carabiga wuxuu ka yimaadaa Mashruuca Tanzil, tarjumaaduhuna QuranEnc, iyadoon la beddelin.',
                ctaEtiketi: 'Fur aayadda maanta',
                detaylar: [
                    'Tarjumaadda marnaba lama gooyo; maalmaha aysan ku filnayn, wijitku wuxuu kaa codsadaa inaad taabato si aad u akhrido.',
                    'Barnaamijka "Shortcuts" waxaad aayadda maanta uga dhigi kartaa sawirka asalka subax kasta; barnaamijku tallaabooyinka ayuu kugu hagayaa.',
                    'Aayadda waxaad u wadaagi kartaa qoraal ama sawir ahaan.',
                ],
            },
            ff: {
                baslik: 'Aaya ñalawma e yaynirde arannde mon',
                aciklama: 'Ɓeydee aaya e firo mum waylotooɗo ñalawma kala e subaka e Yaynirde arannde e Yaynirde uddaande mon wa widget.',
                detayAciklama: 'Widget e hello “Aaya ñalawma” e jaaɓngal ngal hino holla aaya gooto. Binndi Aarabeere ndi iwi ko e Eɓɓoore Tanzil, firooji ɗin iwi ko e QuranEnc, tawa waylaaka.',
                ctaEtiketi: 'Udditee aaya ñalawma',
                detaylar: [
                    'Firo ngo taƴetaake abada; ñalɗe ɗe ngo haanaani, widget ngo hino ƴama on dobde ngam janngude ngo.',
                    'E jaaɓngal Shortcuts hiɗon mbaawi waɗude aaya ñalawma natal yaynirde mon bimmbi kala; jaaɓngal ngal hino hollira on taaɓe ɗen.',
                    'Hiɗon mbaawi lollinde aaya oo wa binndi walla wa natal.',
                ],
            },
            yo: {
                baslik: 'Āyah ti òní lórí ojú-ìbòjú ilé yín',
                aciklama: 'Ẹ fi āyah kan àti ìtumọ̀ rẹ̀ tí ń yí padà lójoojúmọ́ ní Subh kún ojú-ìbòjú ilé àti ojú-ìbòjú títìpa yín gẹ́gẹ́ bí wíjẹ́ẹ̀tì.',
                detayAciklama: 'Wíjẹ́ẹ̀tì àti ojú-ìwé "Āyah ti òní" nínú ìṣàfilọ́lẹ̀ ń fi āyah kan náà hàn. Ọ̀rọ̀ Lárúbáwá wá láti Tanzil Project, àwọn ìtumọ̀ sì wá láti QuranEnc, láìyí wọn padà.',
                ctaEtiketi: 'Ṣí āyah ti òní',
                detaylar: [
                    'A kì í gé ìtumọ̀ kúrú láéláé; ní ọjọ́ tí kò bá bá a mu, wíjẹ́ẹ̀tì yóò ní kí ẹ tẹ̀ ẹ́ láti kà á.',
                    'Pẹ̀lú ìṣàfilọ́lẹ̀ Shortcuts, ẹ lè fi āyah ti òní ṣe àwòrán ìbòjú yín ní àràárọ̀; ìṣàfilọ́lẹ̀ yóò tọ́ yín sọ́nà ní ìgbésẹ̀ kọ̀ọ̀kan.',
                    'Ẹ lè pín āyah náà gẹ́gẹ́ bí ọ̀rọ̀ tàbí àwòrán.',
                ],
            },
        },
    },
    // Arayüz dili: İngilizce (beta) ve dil seçici (spec 2026-10-24 §9).
    {
        id: 'uygulama-dili',
        platformlar: ['android', 'ios'],
        surum: '0.71.0',
        tarih: '2026-10-24',
        baslik: 'Uygulamayı İngilizce de kullanabilirsiniz',
        aciklama: 'Ayarlar › Dil bölümünden İngilizceyi seçebilirsiniz. Bildirimler, sesli okuma ve widget da seçtiğiniz dilde olur.',
        detayAciklama:
            'Telefonunuzun dili İngilizceyse uygulama kendiliğinden İngilizce açılır. "Cihazın dili" ya da Türkçe seçeneğiyle istediğiniz zaman değiştirebilirsiniz.',
        ikon: 'language',
        hedefSayfa: 'DilAyarlari',
        ctaEtiketi: 'Dil ayarını açın',
        detaylar: [
            'İngilizce çeviri beta aşamasındadır.',
            'Dil, namaz vakitlerinin hesabını değiştirmez.',
            'Türkçe dışındaki dillerde ayetler QuranEnc mealiyle gösterilir; hadisler gösterilmez.',
        ],
        ceviri: {
            en: {
                baslik: 'Use the app in English',
                aciklama: 'Choose English in Settings › Language. Notifications, read-aloud and widgets follow the language you choose.',
                detayAciklama:
                    'If your phone is set to English, the app opens in English. You can switch to "Device language" or Turkish at any time.',
                ctaEtiketi: 'Open language settings',
                detaylar: [
                    'The English translation is in beta.',
                    "The language doesn't change how prayer times are calculated.",
                    'In languages other than Turkish, Quran verses are shown with the QuranEnc translation; hadith are not shown.',
                ],
            },
            id: {
                baslik: 'Gunakan aplikasi dalam bahasa Indonesia',
                aciklama: 'Pilih Bahasa Indonesia di Pengaturan › Bahasa. Notifikasi, pembacaan suara, dan widget mengikuti bahasa yang Anda pilih.',
                detayAciklama: 'Jika ponsel Anda berbahasa Indonesia, aplikasi terbuka dalam bahasa Indonesia. Anda dapat beralih ke "Bahasa perangkat" atau bahasa lain kapan saja.',
                ctaEtiketi: 'Buka pengaturan bahasa',
                detaylar: [
                    'Terjemahan bahasa Indonesia masih dalam tahap beta.',
                    'Bahasa tidak mengubah perhitungan waktu salat.',
                    "Dalam bahasa selain Turki, ayat Al-Qur'an ditampilkan dengan terjemahan QuranEnc; hadis tidak ditampilkan.",
                ],
            },
            de: {
                baslik: 'Die App auf Deutsch nutzen',
                aciklama: 'Wählen Sie Deutsch unter Einstellungen › Sprache. Benachrichtigungen, Vorlesen und Widgets folgen der gewählten Sprache.',
                detayAciklama: 'Ist Ihr Telefon auf Deutsch eingestellt, öffnet sich die App auf Deutsch. Sie können jederzeit zu „Gerätesprache“ oder einer anderen Sprache wechseln.',
                ctaEtiketi: 'Spracheinstellungen öffnen',
                detaylar: [
                    'Die deutsche Übersetzung ist in der Beta-Phase.',
                    'Die Sprache ändert nichts an der Berechnung der Gebetszeiten.',
                    'In anderen Sprachen als Türkisch werden Koranverse mit der Übersetzung von QuranEnc angezeigt; Hadithe werden nicht angezeigt.',
                ],
            },
            fr: {
                baslik: 'Utilisez l’application en français',
                aciklama: 'Choisissez le français dans Réglages › Langue. Les notifications, la lecture à voix haute et les widgets suivent la langue choisie.',
                detayAciklama: 'Si votre téléphone est en français, l’application s’ouvre en français. Vous pouvez à tout moment passer à « Langue de l’appareil » ou à une autre langue.',
                ctaEtiketi: 'Ouvrir les réglages de langue',
                detaylar: [
                    'La traduction française est en version bêta.',
                    'La langue ne modifie pas le calcul des heures de prière.',
                    'Dans les langues autres que le turc, les versets du Coran sont affichés avec la traduction de QuranEnc ; les hadiths ne sont pas affichés.',
                ],
            },
            bs: {
                baslik: 'Koristite aplikaciju na bosanskom',
                aciklama: 'Odaberite bosanski u Postavke › Jezik. Obavještenja, čitanje naglas i widgeti prate jezik koji odaberete.',
                detayAciklama: 'Ako je Vaš telefon podešen na bosanski, aplikacija se otvara na bosanskom. Bilo kada možete preći na „Jezik uređaja” ili na turski.',
                ctaEtiketi: 'Otvorite postavke jezika',
                detaylar: [
                    'Bosanski prijevod je u beta fazi.',
                    'Jezik ne mijenja način izračuna namaskih vremena.',
                    'Na jezicima osim turskog ajeti se prikazuju s prijevodom značenja s QuranEnca; hadisi se ne prikazuju.',
                ],
            },
            ru: {
                baslik: 'Приложение на русском языке',
                aciklama: 'Выберите русский язык в Настройки › Язык. Уведомления, озвучивание и виджеты будут на выбранном языке.',
                detayAciklama: 'Если на телефоне установлен русский язык, приложение откроется на русском. В любой момент можно переключиться на «Язык устройства» или турецкий.',
                ctaEtiketi: 'Открыть настройки языка',
                detaylar: [
                    'Русский перевод находится в бета-версии.',
                    'Язык не влияет на расчёт времени намазов.',
                    'На языках, кроме турецкого, аяты Корана показываются с переводом смыслов QuranEnc; хадисы не показываются.',
                ],
            },
            ms: {
                baslik: 'Gunakan aplikasi dalam bahasa Melayu',
                aciklama: 'Pilih Bahasa Melayu di Tetapan › Bahasa. Pemberitahuan, bacaan suara dan widget mengikut bahasa yang anda pilih.',
                detayAciklama: 'Jika telefon anda ditetapkan kepada bahasa Melayu, aplikasi dibuka dalam bahasa Melayu. Anda boleh bertukar kepada "Bahasa peranti" atau bahasa Turki bila-bila masa.',
                ctaEtiketi: 'Buka tetapan bahasa',
                detaylar: [
                    'Terjemahan bahasa Melayu masih dalam versi beta.',
                    'Bahasa tidak mengubah cara waktu solat dikira.',
                    'Dalam bahasa selain bahasa Turki, ayat al-Quran dipaparkan dengan terjemahan QuranEnc; hadis tidak dipaparkan.',
                ],
            },
            ar: {
                baslik: 'استخدام التطبيق بالعربية',
                aciklama: 'اختيار العربية من الإعدادات › اللغة. الإشعارات والقراءة الصوتية والأدوات تتبع اللغة المختارة.',
                detayAciklama: 'إن كانت لغة هاتفك العربية، يُفتح التطبيق بالعربية. ويمكن التبديل إلى «لغة الجهاز» أو التركية في أي وقت.',
                ctaEtiketi: 'فتح إعدادات اللغة',
                detaylar: [
                    'الترجمة العربية تجريبية.',
                    'اللغة لا تغيّر طريقة حساب مواقيت الصلاة.',
                    'في العربية تُعرض الآيات بنصّها القرآني فقط؛ ولا تُعرض الأحاديث.',
                ],
            },
            ur: {
                baslik: 'ایپ اردو میں استعمال کریں',
                aciklama: 'ترتیبات › زبان میں اردو منتخب کریں۔ اطلاعات، بلند خوانی اور ویجیٹ آپ کی منتخب زبان کے مطابق ہوتے ہیں۔',
                detayAciklama: 'اگر آپ کا فون اردو پر سیٹ ہے تو ایپ اردو میں کھلتی ہے۔ کسی بھی وقت “آلے کی زبان” یا ترکی پر واپس جایا جا سکتا ہے۔',
                ctaEtiketi: 'زبان کی ترتیبات کھولیں',
                detaylar: [
                    'اردو ترجمہ بیٹا مرحلے میں ہے۔',
                    'زبان نماز کے اوقات کے حساب کو نہیں بدلتی۔',
                    'ترکی کے علاوہ دیگر زبانوں میں قرآن کی آیات QuranEnc کے ترجمے کے ساتھ دکھائی جاتی ہیں؛ احادیث نہیں دکھائی جاتیں۔',
                ],
            },
            es: {
                baslik: 'Use la aplicación en español',
                aciklama: 'Elija el español en Ajustes › Idioma. Las notificaciones, la lectura en voz alta y los widgets siguen el idioma que elija.',
                detayAciklama: 'Si su teléfono está en español, la aplicación se abre en español. Puede cambiar en cualquier momento a «Idioma del dispositivo» o a otro idioma.',
                ctaEtiketi: 'Abrir los ajustes de idioma',
                detaylar: [
                    'La traducción al español está en beta.',
                    'El idioma no cambia el cálculo de las horas de rezo.',
                    'En los idiomas distintos del turco, las aleyas del Corán se muestran con la traducción de QuranEnc; los hadices no se muestran.',
                ],
            },
            nl: {
                baslik: 'De app in het Nederlands gebruiken',
                aciklama: 'Kies Nederlands bij Instellingen › Taal. Meldingen, voorlezen en widgets volgen de taal die u kiest.',
                detayAciklama: 'Als uw telefoon in het Nederlands staat, opent de app in het Nederlands. U kunt altijd overschakelen naar "Taal van het apparaat" of een andere taal.',
                ctaEtiketi: 'Taalinstellingen openen',
                detaylar: [
                    'De Nederlandse vertaling is in bèta.',
                    'De taal verandert niets aan de berekening van de gebedstijden.',
                    'In andere talen dan het Turks worden Koranverzen getoond met de vertaling van QuranEnc; hadiths worden niet getoond.',
                ],
            },
            sq: {
                baslik: 'Përdoreni aplikacionin në shqip',
                aciklama: 'Zgjidhni Shqip te Cilësimet › Gjuha. Njoftimet, leximi me zë dhe widget-et ndjekin gjuhën që zgjidhni.',
                detayAciklama: 'Nëse telefoni juaj është në shqip, aplikacioni hapet në shqip. Mund të kaloni kurdo te "Gjuha e pajisjes" ose te turqishtja.',
                ctaEtiketi: 'Hapni cilësimet e gjuhës',
                detaylar: [
                    'Përkthimi në shqip është në version beta.',
                    'Gjuha nuk e ndryshon llogaritjen e kohëve të namazit.',
                    'Në gjuhët përveç turqishtes, ajetet e Kur\'anit shfaqen me përkthimin e QuranEnc; hadithet nuk shfaqen.',
                ],
            },
            hi: {
                baslik: 'ऐप हिन्दी में इस्तेमाल करें',
                aciklama: 'सेटिंग › भाषा में हिन्दी चुनें। सूचनाएं, आवाज़ में सुनाना और विजेट आपकी चुनी हुई भाषा के अनुसार होते हैं।',
                detayAciklama: 'अगर आपका फ़ोन हिन्दी पर सेट है, तो ऐप हिन्दी में खुलता है। कभी भी “डिवाइस की भाषा” या तुर्की पर वापस जाया जा सकता है।',
                ctaEtiketi: 'भाषा की सेटिंग खोलें',
                detaylar: [
                    'हिन्दी अनुवाद बीटा में है।',
                    'भाषा से नमाज़ के वक़्त का हिसाब नहीं बदलता।',
                    'तुर्की के अलावा दूसरी भाषाओं में क़ुरआन की आयतें QuranEnc के तर्जुमे के साथ दिखाई जाती हैं; हदीसें नहीं दिखाई जातीं।',
                ],
            },
            bn: {
                baslik: 'অ্যাপটি বাংলায় ব্যবহার করুন',
                aciklama: 'সেটিংস › ভাষা থেকে বাংলা বেছে নিন। নোটিফিকেশন, জোরে পড়া ও উইজেট আপনার বেছে নেওয়া ভাষা অনুসরণ করে।',
                detayAciklama: 'আপনার ফোন বাংলায় সেট করা থাকলে অ্যাপ বাংলায় খোলে। যেকোনো সময় "ডিভাইসের ভাষা" বা অন্য কোনো ভাষায় বদলাতে পারেন।',
                ctaEtiketi: 'ভাষার সেটিংস খুলুন',
                detaylar: [
                    'বাংলা অনুবাদ বেটা পর্যায়ে আছে।',
                    'ভাষা নামাজের সময়ের হিসাব বদলায় না।',
                    'তুর্কি ছাড়া অন্য ভাষায় কুরআনের আয়াত QuranEnc-এর অনুবাদসহ দেখানো হয়; হাদিস দেখানো হয় না।',
                ],
            },
            fa: {
                baslik: 'استفاده از برنامه به فارسی',
                aciklama: 'در تنظیمات › زبان، فارسی را انتخاب کنید. اعلان‌ها، خواندن با صدا و ابزارک‌ها از زبانی که انتخاب می‌کنید پیروی می‌کنند.',
                detayAciklama: 'اگر زبان تلفن شما فارسی باشد، برنامه به فارسی باز می‌شود. هر وقت بخواهید می‌توانید به «زبان دستگاه» یا ترکی استانبولی برگردید.',
                ctaEtiketi: 'باز کردن تنظیمات زبان',
                detaylar: [
                    'ترجمهٔ فارسی در مرحلهٔ بتاست.',
                    'زبان، محاسبهٔ اوقات نماز را تغییر نمی‌دهد.',
                    'در زبان‌های غیر از ترکی، آیات قرآن با ترجمهٔ QuranEnc نشان داده می‌شوند؛ احادیث نشان داده نمی‌شوند.',
                ],
            },
            ps: {
                baslik: 'اپ په پښتو وکاروئ',
                aciklama: 'په ترتیبات › ژبه کې پښتو وټاکئ. خبرتیاوې، غږیز لوستل او ویجټونه ستاسو د ټاکلې ژبې پیروي کوي.',
                detayAciklama: 'که ستاسو موبایل په پښتو برابر وي، اپ په پښتو پرانیستل کېږي. هر وخت کولای شئ «د وسیلې ژبه» یا ترکي ته واوړئ.',
                ctaEtiketi: 'د ژبې ترتیبات پرانیزئ',
                detaylar: [
                    'پښتو ژباړه په بېټا پړاو کې ده.',
                    'ژبه د لمانځه د وختونو حساب نه بدلوي.',
                    'له ترکي پرته په نورو ژبو کې د قرآن آیتونه د QuranEnc له ژباړې سره ښودل کېږي؛ حدیثونه نه ښودل کېږي.',
                ],
            },
            ckb: {
                baslik: 'ئەپەکە بە کوردی بەکاربھێنن',
                aciklama: 'لە ڕێکخستنەکان › زمان کوردی ھەڵبژێرن. ئاگادارکردنەوەکان، خوێندنەوەی دەنگی و ویجێتەکان شوێن ئەو زمانە دەکەون کە ھەڵیدەبژێرن.',
                detayAciklama: 'ئەگەر مۆبایلەکەتان لەسەر کوردی دانرابێت، ئەپەکە بە کوردی دەکرێتەوە. ھەر کاتێک بتانەوێت دەتوانن بگەڕێنەوە بۆ «زمانی ئامێر» یان تورکی.',
                ctaEtiketi: 'کردنەوەی ڕێکخستنەکانی زمان',
                detaylar: [
                    'وەرگێڕانی کوردی تاقیکارییە.',
                    'زمان شێوازی ھەژمارکردنی کاتەکانی نوێژ ناگۆڕێت.',
                    'لە زمانەکانی جگە لە تورکی، ئایەتەکانی قورئان بە وەرگێڕانی QuranEnc پیشان دەدرێن؛ فەرموودەکان پیشان نادرێن.',
                ],
            },
            ug: {
                baslik: 'ئەپنى ئۇيغۇرچە ئىشلىتىڭ',
                aciklama: 'تەڭشەكلەر › تىل بۆلىكىدە ئۇيغۇرچىنى تاللاڭ. ئۇقتۇرۇشلار، ئاۋازلىق ئوقۇش ۋە كىچىك قوراللار تاللىغان تىلىڭىزغا ئەگىشىدۇ.',
                detayAciklama: 'تېلېفونىڭىزنىڭ تىلى ئۇيغۇرچە بولسا، ئەپ ئۇيغۇرچە ئېچىلىدۇ. خالىغان ۋاقىتتا «ئۈسكۈنە تىلى» ياكى تۈركچىگە ئالماشتۇرالايسىز.',
                ctaEtiketi: 'تىل تەڭشىكىنى ئېچىڭ',
                detaylar: [
                    'ئۇيغۇرچە تەرجىمە سىناق باسقۇچىدا.',
                    'تىل ناماز ۋاقىتلىرىنىڭ ھېسابلىنىشىنى ئۆزگەرتمەيدۇ.',
                    'تۈركچىدىن باشقا تىللاردا قۇرئان ئايەتلىرى QuranEnc تەرجىمىسى بىلەن كۆرسىتىلىدۇ؛ ھەدىسلەر كۆرسىتىلمەيدۇ.',
                ],
            },
            az: {
                baslik: 'Tətbiqdən Azərbaycan dilində istifadə edin',
                aciklama: 'Parametrlər › Dil bölməsində Azərbaycan dilini seçin. Bildirişlər, səsli oxuma və vidcetlər seçdiyiniz dildə olur.',
                detayAciklama: 'Telefonunuz Azərbaycan dilindədirsə, tətbiq Azərbaycan dilində açılır. İstədiyiniz vaxt "Cihazın dili" və ya türk dilinə keçə bilərsiniz.',
                ctaEtiketi: 'Dil parametrlərini açın',
                detaylar: [
                    'Azərbaycan dilinə tərcümə beta versiyasındadır.',
                    'Dil namaz vaxtlarının hesablanmasını dəyişmir.',
                    'Türk dilindən başqa dillərdə Quran ayələri QuranEnc tərcüməsi ilə göstərilir; hədislər göstərilmir.',
                ],
            },
            uz: {
                baslik: 'Иловадан ўзбек тилида фойдаланинг',
                aciklama: 'Созламалар › Тил бўлимида ўзбек тилини танланг. Билдиришномалар, овоз чиқариб ўқиш ва виджетлар ҳам сиз танлаган тилда бўлади.',
                detayAciklama: 'Телефонингиз тили ўзбекча бўлса, илова ўзбек тилида очилади. Лотин ёки кирилл алифбосини ҳам танлашингиз мумкин. Истаган вақт «Қурилма тили» ёки туркчага ўтишингиз мумкин.',
                ctaEtiketi: 'Тил созламаларини очиш',
                detaylar: [
                    'Ўзбекча таржима бета босқичида.',
                    'Тил намоз вақтлари қандай ҳисобланишини ўзгартирмайди.',
                    'Туркчадан бошқа тилларда Қуръон оятлари QuranEnc таржимаси билан кўрсатилади; ҳадислар кўрсатилмайди.',
                ],
            },
            kk: {
                baslik: 'Қолданба қазақ тілінде',
                aciklama: 'Баптаулар › Тіл бөлімінен қазақ тілін таңдай аласыз. Хабарландырулар, дауыстап оқу және виджеттер де таңдаған тіліңізде болады.',
                detayAciklama: 'Телефоныңыздың тілі қазақша болса, қолданба қазақ тілінде ашылады. «Құрылғы тілі» немесе түрік тілі нұсқасына кез келген уақытта ауыса аласыз. Мәтіндер кириллицамен жазылады; қаласаңыз, Тіл бөлімінен латын әліпбиін таңдай аласыз.',
                ctaEtiketi: 'Тіл баптауларын ашу',
                detaylar: [
                    'Қазақша аударма бета кезеңінде.',
                    'Тіл намаз уақыттарының есептелуін өзгертпейді.',
                    'Түрік тілінен басқа тілдерде аяттар QuranEnc аудармасымен көрсетіледі; хадистер көрсетілмейді.',
                ],
            },
            ky: {
                baslik: 'Колдонмо кыргыз тилинде',
                aciklama: 'Жөндөөлөр › Тил бөлүмүнөн кыргыз тилин тандаңыз. Билдирмелер, үн менен окуу жана виджеттер сиз тандаган тилде болот.',
                detayAciklama: 'Телефонуңуз кыргыз тилине коюлган болсо, колдонмо кыргызча ачылат. Каалаган убакта «Түзмөктүн тили» же түркчөгө өтө аласыз.',
                ctaEtiketi: 'Тил жөндөөлөрүн ачуу',
                detaylar: [
                    'Кыргызча котормо бета абалында.',
                    'Тил намаз убактыларынын эсептелишин өзгөртпөйт.',
                    'Түркчөдөн башка тилдерде Куран аяттары QuranEnc котормосу менен көрсөтүлөт; хадистер көрсөтүлбөйт.',
                ],
            },
            tg: {
                baslik: 'Барнома бо забони тоҷикӣ',
                aciklama: 'Дар Танзимот › Забон тоҷикиро интихоб кунед. Огоҳиномаҳо, хониши овозӣ ва виҷетҳо ба забони интихобкардаатон пайравӣ мекунанд.',
                detayAciklama: 'Агар забони телефонатон тоҷикӣ бошад, барнома бо забони тоҷикӣ кушода мешавад. Ҳар вақт метавонед ба «Забони дастгоҳ» ё туркӣ гузаред.',
                ctaEtiketi: 'Танзимоти забонро кушоед',
                detaylar: [
                    'Тарҷумаи тоҷикӣ дар марҳилаи бета аст.',
                    'Забон тарзи ҳисоби вақтҳои намозро тағйир намедиҳад.',
                    'Дар забонҳои ғайр аз туркӣ оятҳои Қуръон бо тарҷумаи QuranEnc нишон дода мешаванд; ҳадисҳо нишон дода намешаванд.',
                ],
            },
            sw: {
                baslik: 'Tumia programu kwa Kiswahili',
                aciklama: 'Chagua Kiswahili katika Mipangilio › Lugha. Arifa, kusoma kwa sauti na wijeti hufuata lugha unayochagua.',
                detayAciklama: 'Ikiwa simu yako iko kwa Kiswahili, programu inafunguka kwa Kiswahili. Unaweza kubadilisha kwenda "Lugha ya kifaa" au Kituruki wakati wowote.',
                ctaEtiketi: 'Fungua mipangilio ya lugha',
                detaylar: [
                    'Tafsiri ya Kiswahili iko katika beta.',
                    'Lugha haibadilishi jinsi nyakati za Swala zinavyokokotolewa.',
                    'Katika lugha zisizo Kituruki, aya za Qur’ani zinaonyeshwa kwa tafsiri ya QuranEnc; hadithi hazionyeshwi.',
                ],
            },
            ha: {
                baslik: 'Yi amfani da manhajar da Hausa',
                aciklama: 'Ku zaɓi Hausa a Saituna › Harshe. Sanarwa, karatu da murya da widgets suna bin harshen da kuka zaɓa.',
                detayAciklama: 'Idan an saita wayarku da Hausa, manhajar tana buɗewa da Hausa. Kuna iya komawa "Harshen naʼura" ko Harshen Turkiyya a kowane lokaci.',
                ctaEtiketi: 'Buɗe saitunan harshe',
                detaylar: [
                    'Fassarar Hausa tana cikin beta.',
                    'Harshe ba ya canja yadda ake lissafa lokutan salla.',
                    'A harsunan da ba Harshen Turkiyya ba, ana nuna ayoyin Alƙurʼani da fassarar QuranEnc; ba a nuna hadisai.',
                ],
            },
            am: {
                baslik: 'መተግበሪያውን በአማርኛ ይጠቀሙ',
                aciklama: 'በቅንብሮች › ቋንቋ ውስጥ አማርኛን ይምረጡ። ማሳወቂያዎች፣ ጮክ ብሎ ማንበብ እና ዊጀቶች የመረጡትን ቋንቋ ይከተላሉ።',
                detayAciklama: 'ስልክዎ በአማርኛ ከተዘጋጀ መተግበሪያው በአማርኛ ይከፈታል። በማንኛውም ጊዜ ወደ “የመሣሪያ ቋንቋ” ወይም ወደ ቱርክኛ መቀየር ይችላሉ።',
                ctaEtiketi: 'የቋንቋ ቅንብሮችን ክፈት',
                detaylar: [
                    'የአማርኛ ትርጉሙ በቤታ ደረጃ ላይ ነው።',
                    'ቋንቋው የሶላት ሰዓቶችን አቆጣጠር አይቀይርም።',
                    'ከቱርክኛ ውጪ ባሉ ቋንቋዎች የቁርኣን አንቀጾች በQuranEnc ትርጉም ይታያሉ፤ ሐዲሶች አይታዩም።',
                ],
            },
            om: {
                baslik: 'Appicha Afaan Oromootiin fayyadamaa',
                aciklama: "Qindaa'ina › Afaan keessatti Afaan Oromoo filadhaa. Beeksisni, sagaleen dubbisuufi wiijetiin afaan isin filattan hordofu.",
                detayAciklama: "Yoo bilbilli keessan Afaan Oromootiin qindaa'e, appichi Afaan Oromootiin banama. Yeroo kamiyyuu gara \"Afaan meeshaa\" ykn Afaan Turkiitti jijjiiruu dandeessu.",
                ctaEtiketi: "Qindaa'ina afaanii banaa",
                detaylar: [
                    'Hiikkaan Afaan Oromoo Beta keessa jira.',
                    'Afaan jijjiiruun akkaataa yeroon salaataa itti herregamu hin jijjiiru.',
                    "Afaanota Afaan Turkii ala jiran keessatti aayanni Qur'aanaa hiikkaa QuranEnc wajjin mul'ata; hadiisni hin mul'atu.",
                ],
            },
            so: {
                baslik: 'Isticmaal barnaamijka af Soomaali',
                aciklama: 'Dooro Soomaali Dejinta › Luqadda. Ogeysiisyada, akhrinta codka iyo wijityadu waxay raacaan luqadda aad doorato.',
                detayAciklama: 'Haddii taleefankaagu ku jiro af Soomaali, barnaamijku wuxuu ku furmaa af Soomaali. Waxaad u beddeli kartaa "Luqadda qalabka" ama Turkiga wakhti kasta.',
                ctaEtiketi: 'Fur dejinta luqadda',
                detaylar: [
                    'Tarjumaadda Soomaaligu waa Beta.',
                    'Luqaddu ma beddesho sida waqtiyada salaadda loo xisaabiyo.',
                    "Luqadaha aan Turkiga ahayn, aayadaha Qur'aanka waxaa lagu muujiyaa tarjumaadda QuranEnc; xadiisyada lama muujiyo.",
                ],
            },
            ff: {
                baslik: 'Huutoree jaaɓngal ngal e Pular',
                aciklama: 'Suɓee Pular e Teelte › Ɗemngal. Tintine, janngugol e hito e widget hino rewa ɗemngal ngal suɓu-ɗon.',
                detayAciklama: 'So talifon mon hino e Pular, jaaɓngal ngal hino udditoo e Pular. Hiɗon mbaawi waylude e “Ɗemngal kaɓirgal” walla Turkeere sahaa kala.',
                ctaEtiketi: 'Udditee teelte ɗemngal',
                detaylar: [
                    'Firo Pular ngoo hino e Beta.',
                    'Ɗemngal ngal waylataa no saa’iiji juulɗe hiisirtee.',
                    'E ɗemɗe ɗe wonaa Turkeere, aayeeje Alqur’aana hino hollee e firo QuranEnc; hadiis hollaaka.',
                ],
            },
            yo: {
                baslik: 'Ẹ lo ìṣàfilọ́lẹ̀ ní Èdè Yorùbá',
                aciklama: 'Ẹ yan Èdè Yorùbá nínú Ètò › Èdè. Àwọn ìfitónilétí, kíkà sókè àti wíjẹ́ẹ̀tì ń tẹ̀lé èdè tí ẹ yàn.',
                detayAciklama: 'Tí fóònù yín bá wà ní Èdè Yorùbá, ìṣàfilọ́lẹ̀ yóò ṣí ní Èdè Yorùbá. Ẹ lè yí padà sí "Èdè ẹ̀rọ" tàbí Èdè Tọọkisi nígbàkúùgbà.',
                ctaEtiketi: 'Ṣí ètò èdè',
                detaylar: [
                    'Ìtumọ̀ Yorùbá wà ní Beta.',
                    'Èdè kò yí bí a ṣe ń ṣírò àwọn àkókò ìrun padà.',
                    'Ní àwọn èdè yàtọ̀ sí Èdè Tọọkisi, a ń fi àwọn āyah Al-Ƙur’ān hàn pẹ̀lú ìtumọ̀ QuranEnc; a kì í fi hadīth hàn.',
                ],
            },
        },
    },
    // Dünya geneli konum + ülkeye göre hesap yöntemi (spec 2026-10-24).
    {
        id: 'dunya-konum-hesap-yontemi',
        platformlar: ['android', 'ios'],
        surum: '0.71.0',
        tarih: '2026-10-24',
        baslik: 'Dünyanın her yerinde doğru vakit',
        aciklama:
            'Türkiye dışındaki bir şehri de seçebilirsiniz. Vakitler o ülkenin camilerinin uyduğu takvime göre hesaplanır.',
        detayAciklama:
            'Başka bir ülkeye gittiğinizde uygulama o ülkenin takvimini bir kez önerir ve bugünkü vakitleri yan yana gösterir. Siz onaylamadan yöntem değişmez.',
        ikon: 'globe-europe',
        hedefSayfa: 'HesapYontemiAyarlari',
        ctaEtiketi: 'Hesap yöntemini görün',
        detaylar: [
            'Konum ayarında "Başka bir ülke"yi seçip 34 binden fazla şehir arasından arayabilirsiniz; internet gerekmez.',
            'Malezya, Endonezya, Suudi Arabistan, Mısır, Pakistan ve daha birçok ülkede oradaki camilerin uyduğu takvim kullanılır.',
            'Ana ekrandaki yöntem çipine dokunarak hangi takvimin kullanıldığını görebilir, isterseniz ikindi vaktini ve her vakti dakika dakika camiye göre ayarlayabilirsiniz.',
            'Türkiye\'deki vakitler Diyanet takvimiyle aynı kalır.',
        ],
        ceviri: {
            en: {
                baslik: 'Accurate prayer times anywhere in the world',
                aciklama: 'Choose any city in the world. Prayer times follow the timetable the mosques in that country use.',
                detayAciklama:
                    "When you travel to another country, the app suggests that country's timetable once and shows today's times side by side. The method never changes without your approval.",
                ctaEtiketi: 'See the calculation method',
                detaylar: [
                    'In Location, choose "Another country" and search more than 34,000 cities; no internet needed.',
                    'In Malaysia, Indonesia, Saudi Arabia, Egypt, Pakistan and many other countries, the timetable of the local mosques is used.',
                    'Tap the method chip on the home screen to see which timetable is used, and adjust Asr and each prayer time minute by minute to match your mosque.',
                ],
            },
            id: {
                baslik: 'Waktu salat akurat di mana pun di dunia',
                aciklama: 'Pilih kota mana pun di dunia. Waktu salat mengikuti jadwal yang digunakan masjid di negara tersebut.',
                detayAciklama: 'Saat Anda bepergian ke negara lain, aplikasi menyarankan jadwal negara itu satu kali dan menampilkan waktu salat hari ini secara berdampingan. Metode tidak pernah berubah tanpa persetujuan Anda.',
                ctaEtiketi: 'Lihat metode perhitungan',
                detaylar: [
                    'Di Lokasi, pilih "Negara lain" dan cari di antara lebih dari 34.000 kota; tidak perlu internet.',
                    'Di Malaysia, Indonesia, Arab Saudi, Mesir, Pakistan, dan banyak negara lain, digunakan jadwal masjid setempat.',
                    'Ketuk label metode di layar utama untuk melihat jadwal yang digunakan, lalu sesuaikan Ashar dan setiap waktu salat per menit agar sesuai dengan masjid Anda.',
                ],
            },
            de: {
                baslik: 'Genaue Gebetszeiten überall auf der Welt',
                aciklama: 'Wählen Sie eine beliebige Stadt der Welt. Die Gebetszeiten folgen dem Kalender, den die Moscheen in diesem Land verwenden.',
                detayAciklama: 'Wenn Sie in ein anderes Land reisen, schlägt die App einmal den Kalender dieses Landes vor und zeigt die heutigen Zeiten nebeneinander. Die Methode ändert sich nie ohne Ihre Zustimmung.',
                ctaEtiketi: 'Berechnungsmethode ansehen',
                detaylar: [
                    'Wählen Sie unter Standort „Ein anderes Land“ und suchen Sie unter mehr als 34.000 Städten; ohne Internet.',
                    'In Malaysia, Indonesien, Saudi-Arabien, Ägypten, Pakistan und vielen weiteren Ländern wird der Kalender der Moscheen vor Ort verwendet.',
                    'Tippen Sie auf der Startseite auf die Methode, um zu sehen, welcher Kalender gilt, und passen Sie Asr und jede Gebetszeit minutengenau an Ihre Moschee an.',
                ],
            },
            fr: {
                baslik: 'Des heures de prière justes partout dans le monde',
                aciklama: 'Choisissez n’importe quelle ville du monde. Les heures de prière suivent le calendrier utilisé par les mosquées de ce pays.',
                detayAciklama: 'Quand vous partez dans un autre pays, l’application vous propose une fois le calendrier de ce pays et affiche côte à côte les heures d’aujourd’hui. La méthode ne change jamais sans votre accord.',
                ctaEtiketi: 'Voir la méthode de calcul',
                detaylar: [
                    'Dans Position, choisissez « Un autre pays » et cherchez parmi plus de 34 000 villes ; aucune connexion Internet n’est nécessaire.',
                    'En Malaisie, en Indonésie, en Arabie saoudite, en Égypte, au Pakistan et dans bien d’autres pays, c’est le calendrier des mosquées locales qui est utilisé.',
                    'Touchez la puce de méthode sur l’écran d’accueil pour voir quel calendrier est utilisé, et ajustez Asr et chaque heure de prière à la minute près selon votre mosquée.',
                ],
            },
            bs: {
                baslik: 'Tačna namaska vremena bilo gdje u svijetu',
                aciklama: 'Odaberite bilo koji grad na svijetu. Vremena prate vaktiju koju koriste džamije u toj državi.',
                detayAciklama: 'Kada otputujete u drugu državu, aplikacija jednom predlaže vaktiju te države i prikazuje današnja vremena jedno pored drugog. Metoda se nikada ne mijenja bez Vaše saglasnosti.',
                ctaEtiketi: 'Pogledajte metodu izračuna',
                detaylar: [
                    'U opciji Lokacija odaberite „Druga država” i pretražite više od 34.000 gradova; internet nije potreban.',
                    'U Maleziji, Indoneziji, Saudijskoj Arabiji, Egiptu, Pakistanu i mnogim drugim državama koristi se vaktija lokalnih džamija.',
                    'Dodirnite oznaku metode na početnom ekranu da vidite koja se vaktija koristi, a ikindiju i svaki vakat podesite minutu po minutu prema svojoj džamiji.',
                ],
            },
            ru: {
                baslik: 'Точное время намазов в любой точке мира',
                aciklama: 'Выберите любой город мира. Время намазов рассчитывается по расписанию, которым пользуются мечети этой страны.',
                detayAciklama: 'Когда вы приезжаете в другую страну, приложение один раз предлагает расписание этой страны и показывает сегодняшнее время для сравнения. Метод никогда не меняется без вашего согласия.',
                ctaEtiketi: 'Посмотреть метод расчёта',
                detaylar: [
                    'В разделе «Местоположение» выберите «Другая страна» и найдите любой из более чем 34 000 городов; интернет не нужен.',
                    'В Малайзии, Индонезии, Саудовской Аравии, Египте, Пакистане и многих других странах используется расписание местных мечетей.',
                    'Нажмите на метку метода на главном экране, чтобы увидеть, какое расписание используется, и подстройте Аср и время каждого намаза по минутам под вашу мечеть.',
                ],
            },
            ms: {
                baslik: 'Waktu solat yang tepat di mana-mana sahaja di dunia',
                aciklama: 'Pilih mana-mana bandar di dunia. Waktu solat mengikut jadual waktu yang digunakan oleh masjid di negara itu.',
                detayAciklama: 'Apabila anda ke negara lain, aplikasi mencadangkan jadual waktu negara itu sekali dan memaparkan waktu hari ini bersebelahan. Kaedah pengiraan tidak sekali-kali berubah tanpa persetujuan anda.',
                ctaEtiketi: 'Lihat kaedah pengiraan',
                detaylar: [
                    'Dalam Lokasi, pilih "Negara lain" dan cari lebih daripada 34,000 bandar; tanpa internet.',
                    'Di Malaysia, Indonesia, Arab Saudi, Mesir, Pakistan dan banyak negara lain, jadual waktu masjid tempatan digunakan.',
                    'Ketik cip kaedah di skrin utama untuk melihat jadual waktu yang digunakan, dan laraskan Asar serta setiap waktu solat minit demi minit mengikut masjid anda.',
                ],
            },
            ar: {
                baslik: 'مواقيت دقيقة في أي مكان من العالم',
                aciklama: 'اختيار أي مدينة في العالم. تتبع المواقيت التقويم الذي تعتمده مساجد ذلك البلد.',
                detayAciklama: 'عند السفر إلى بلد آخر يقترح التطبيق تقويم ذلك البلد مرة واحدة، ويعرض مواقيت اليوم جنبًا إلى جنب. ولا تتغير الطريقة أبدًا دون موافقتك.',
                ctaEtiketi: 'عرض طريقة الحساب',
                detaylar: [
                    'في «الموقع» يُختار «بلد آخر» للبحث في أكثر من 34,000 مدينة؛ دون حاجة إلى الإنترنت.',
                    'في ماليزيا وإندونيسيا والسعودية ومصر وباكستان وبلدان كثيرة أخرى يُستخدم تقويم المساجد المحلية.',
                    'النقر على شارة الطريقة في الشاشة الرئيسية يُظهر التقويم المستخدم، ويمكن ضبط العصر وكل وقت بالدقيقة ليطابق مسجدك.',
                ],
            },
            ur: {
                baslik: 'دنیا میں کہیں بھی درست نماز کے اوقات',
                aciklama: 'دنیا کا کوئی بھی شہر منتخب کریں۔ نماز کے اوقات اس ملک کی مساجد کے نظام الاوقات کے مطابق ہوتے ہیں۔',
                detayAciklama: 'کسی دوسرے ملک کے سفر پر ایپ ایک بار اس ملک کا نظام الاوقات تجویز کرتی ہے اور آج کے اوقات ساتھ ساتھ دکھاتی ہے۔ طریقہ آپ کی منظوری کے بغیر کبھی نہیں بدلتا۔',
                ctaEtiketi: 'حساب کا طریقہ دیکھیں',
                detaylar: [
                    'مقام میں “کوئی اور ملک” منتخب کر کے 34,000 سے زیادہ شہروں میں تلاش کریں؛ انٹرنیٹ کی ضرورت نہیں۔',
                    'ملائیشیا، انڈونیشیا، سعودی عرب، مصر، پاکستان اور کئی دوسرے ممالک میں مقامی مساجد کا نظام الاوقات استعمال ہوتا ہے۔',
                    'ہوم اسکرین پر طریقے والے نشان پر تھپتھپا کر دیکھیں کہ کون سا نظام الاوقات استعمال ہو رہا ہے، اور عصر اور ہر نماز کا وقت اپنی مسجد کے مطابق منٹ منٹ درست کریں۔',
                ],
            },
            es: {
                baslik: 'Horas de rezo exactas en cualquier parte del mundo',
                aciklama: 'Elija cualquier ciudad del mundo. Las horas de rezo siguen el calendario que usan las mezquitas de ese país.',
                detayAciklama: 'Cuando viaja a otro país, la aplicación le sugiere una vez el calendario de ese país y le muestra las horas de hoy una al lado de la otra. El método nunca cambia sin su aprobación.',
                ctaEtiketi: 'Ver el método de cálculo',
                detaylar: [
                    'En Ubicación, elija «Otro país» y busque entre más de 34.000 ciudades; no hace falta internet.',
                    'En Malasia, Indonesia, Arabia Saudí, Egipto, Pakistán y muchos otros países se usa el calendario de las mezquitas locales.',
                    'Toque la etiqueta del método en la pantalla de inicio para ver qué calendario se usa, y ajuste Asr y cada hora de rezo minuto a minuto según su mezquita.',
                ],
            },
            nl: {
                baslik: 'Juiste gebedstijden overal ter wereld',
                aciklama: 'Kies een willekeurige stad ter wereld. De gebedstijden volgen het rooster dat de moskeeën in dat land gebruiken.',
                detayAciklama: 'Als u naar een ander land reist, stelt de app één keer het rooster van dat land voor en toont de tijden van vandaag naast elkaar. De methode verandert nooit zonder uw toestemming.',
                ctaEtiketi: 'De berekeningsmethode bekijken',
                detaylar: [
                    'Kies bij Locatie "Een ander land" en zoek in meer dan 34.000 steden; geen internet nodig.',
                    'In Maleisië, Indonesië, Saoedi-Arabië, Egypte, Pakistan en veel andere landen wordt het rooster van de plaatselijke moskeeën gebruikt.',
                    'Tik op het methodelabel op het startscherm om te zien welk rooster wordt gebruikt, en pas Asr en elke gebedstijd per minuut aan uw moskee aan.',
                ],
            },
            sq: {
                baslik: 'Kohë të sakta namazi kudo në botë',
                aciklama: 'Zgjidhni çdo qytet në botë. Kohët e namazit ndjekin takvimin që përdorin xhamitë në atë vend.',
                detayAciklama: 'Kur udhëtoni në një vend tjetër, aplikacioni ju sugjeron një herë takvimin e atij vendi dhe tregon kohët e sotme krah për krah. Metoda nuk ndryshon kurrë pa miratimin tuaj.',
                ctaEtiketi: 'Shikoni metodën e llogaritjes',
                detaylar: [
                    'Te Vendndodhja zgjidhni "Një vend tjetër" dhe kërkoni në mbi 34 000 qytete; nuk nevojitet internet.',
                    'Në Malajzi, Indonezi, Arabi Saudite, Egjipt, Pakistan dhe në shumë vende të tjera përdoret takvimi i xhamive vendore.',
                    'Prekni etiketën e metodës në ekranin kryesor për të parë cili takvim përdoret dhe rregulloni ikindinë dhe çdo vakt minutë për minutë sipas xhamisë suaj.',
                ],
            },
            hi: {
                baslik: 'दुनिया में कहीं भी सही नमाज़ के वक़्त',
                aciklama: 'दुनिया का कोई भी शहर चुनें। नमाज़ के वक़्त उस देश की मस्जिदों के टाइम टेबल के अनुसार होते हैं।',
                detayAciklama: 'किसी दूसरे देश में जाने पर ऐप उस देश का टाइम टेबल एक बार सुझाता है और आज के वक़्त साथ-साथ दिखाता है। तरीक़ा आपकी मंज़ूरी के बिना कभी नहीं बदलता।',
                ctaEtiketi: 'हिसाब का तरीक़ा देखें',
                detaylar: [
                    'लोकेशन में "कोई और देश" चुनें और 34,000 से ज़्यादा शहरों में खोजें; इंटरनेट की ज़रूरत नहीं।',
                    'मलेशिया, इंडोनेशिया, सऊदी अरब, मिस्र, पाकिस्तान और कई दूसरे देशों में वहाँ की मस्जिदों का टाइम टेबल इस्तेमाल होता है।',
                    'होम स्क्रीन पर तरीक़े वाले बटन पर टैप करके देखें कि कौन सा टाइम टेबल इस्तेमाल हो रहा है, और अपनी मस्जिद से मिलाने के लिए अस्र और हर नमाज़ का वक़्त मिनट-मिनट ठीक करें।',
                ],
            },
            bn: {
                baslik: 'বিশ্বের যেকোনো জায়গায় সঠিক নামাজের সময়',
                aciklama: 'বিশ্বের যেকোনো শহর বেছে নিন। নামাজের সময় সেই দেশের মসজিদগুলোর ব্যবহৃত সময়সূচি অনুসরণ করে।',
                detayAciklama: 'অন্য দেশে গেলে অ্যাপ একবার সেই দেশের সময়সূচির পরামর্শ দেয় এবং আজকের সময় পাশাপাশি দেখায়। আপনার অনুমোদন ছাড়া পদ্ধতি কখনো বদলায় না।',
                ctaEtiketi: 'হিসাব পদ্ধতি দেখুন',
                detaylar: [
                    'অবস্থান থেকে "অন্য দেশ" বেছে নিয়ে 34,000-এর বেশি শহর খুঁজুন; ইন্টারনেট লাগে না।',
                    'মালয়েশিয়া, ইন্দোনেশিয়া, সৌদি আরব, মিশর, পাকিস্তান ও আরও অনেক দেশে স্থানীয় মসজিদের সময়সূচি ব্যবহার করা হয়।',
                    'কোন সময়সূচি ব্যবহার হচ্ছে দেখতে হোম স্ক্রিনের পদ্ধতির চিপে ট্যাপ করুন, আর আপনার মসজিদের সাথে মেলাতে আসর ও প্রতিটি নামাজের সময় মিনিট ধরে ঠিক করুন।',
                ],
            },
            fa: {
                baslik: 'اوقات نماز درست در هر جای جهان',
                aciklama: 'هر شهری در جهان را انتخاب کنید. اوقات نماز از جدولی پیروی می‌کند که مسجدهای آن کشور به کار می‌برند.',
                detayAciklama: 'وقتی به کشور دیگری سفر می‌کنید، برنامه یک بار جدول آن کشور را پیشنهاد می‌دهد و اوقات امروز را کنار هم نشان می‌دهد. روش محاسبه هرگز بدون تأیید شما تغییر نمی‌کند.',
                ctaEtiketi: 'دیدن روش محاسبه',
                detaylar: [
                    'در بخش موقعیت، «کشوری دیگر» را انتخاب کنید و در میان بیش از 34,000 شهر جستجو کنید؛ به اینترنت نیازی نیست.',
                    'در مالزی، اندونزی، عربستان سعودی، مصر، پاکستان و بسیاری کشورهای دیگر، جدول مسجدهای همان‌جا به کار می‌رود.',
                    'روی نشان روش محاسبه در صفحهٔ اصلی ضربه بزنید تا ببینید کدام جدول به کار می‌رود، و عصر و هر وقت نماز را دقیقه به دقیقه با مسجد خود هماهنگ کنید.',
                ],
            },
            ps: {
                baslik: 'د نړۍ په هر ځای کې سم د لمانځه وختونه',
                aciklama: 'د نړۍ هر ښار وټاکئ. د لمانځه وختونه د هغه جدول پیروي کوي چې د هغه هېواد جوماتونه یې کاروي.',
                detayAciklama: 'کله چې بل هېواد ته سفر وکړئ، اپ یو ځل د هغه هېواد جدول وړاندیز کوي او د نن وختونه څنګ په څنګ ښيي. طریقه هېڅکله پرته له ستاسو له تایید نه بدلېږي.',
                ctaEtiketi: 'د حساب طریقه وګورئ',
                detaylar: [
                    'په موقعیت کې «بل هېواد» وټاکئ او له 34,000 څخه زیات ښارونه ولټوئ؛ انټرنېټ ته اړتیا نشته.',
                    'په مالیزیا، اندونیزیا، سعودي عربستان، مصر، پاکستان او ډېرو نورو هېوادونو کې د سیمه ییزو جوماتونو جدول کارول کېږي.',
                    'په اصلي سکرین کې د طریقې نښه کېکاږئ تر څو وګورئ چې کوم جدول کارول کېږي، او مازدیګر او هر وخت دقیقه په دقیقه له خپل جومات سره برابر کړئ.',
                ],
            },
            ckb: {
                baslik: 'کاتی دروستی نوێژ لە ھەر شوێنێکی جیھان',
                aciklama: 'ھەر شارێکی جیھان ھەڵبژێرن. کاتەکانی نوێژ شوێن ئەو خشتەیە دەکەون کە مزگەوتەکانی ئەو وڵاتە بەکاری دەھێنن.',
                detayAciklama: 'کاتێک گەشت دەکەن بۆ وڵاتێکی تر، ئەپەکە یەک جار خشتەی ئەو وڵاتەتان پێشنیار دەکات و کاتەکانی ئەمڕۆ لە تەنیشت یەکەوە پیشان دەدات. شێوازەکە ھەرگیز بەبێ ڕەزامەندیی ئێوە ناگۆڕێت.',
                ctaEtiketi: 'بینینی شێوازی ھەژمارکردن',
                detaylar: [
                    'لە شوێن، «وڵاتێکی تر» ھەڵبژێرن و لە نێو زیاتر لە 34,000 شاردا بگەڕێن؛ ئینتەرنێت پێویست نییە.',
                    'لە مالیزیا، ئیندۆنیزیا، عەرەبستانی سعوودی، میسر، پاکستان و زۆر وڵاتی تر، خشتەی مزگەوتە ناوچەییەکان بەکاردێت.',
                    'بۆ بینینی ئەوەی کام خشتە بەکاردێت دەست لە نیشانەی شێواز لە شاشەی سەرەکیدا بدەن، و عەسر و ھەر کاتێکی نوێژ خولەک بە خولەک لەگەڵ مزگەوتەکەتان ڕێک بخەن.',
                ],
            },
            ug: {
                baslik: 'دۇنيانىڭ ھەممە يېرىدە توغرا ناماز ۋاقتى',
                aciklama: 'دۇنيادىكى خالىغان شەھەرنى تاللاڭ. ناماز ۋاقىتلىرى شۇ دۆلەتتىكى مەسچىتلەر ئەمەل قىلىدىغان ۋاقىت جەدۋىلىگە ئاساسەن ھېسابلىنىدۇ.',
                detayAciklama: 'باشقا بىر دۆلەتكە بارغىنىڭىزدا، ئەپ شۇ دۆلەتنىڭ ۋاقىت جەدۋىلىنى بىر قېتىم تەۋسىيە قىلىدۇ ۋە بۈگۈنكى ۋاقىتلارنى يانمۇيان كۆرسىتىدۇ. سىز ماقۇل دېمىگۈچە ئۇسۇل ئۆزگەرمەيدۇ.',
                ctaEtiketi: 'ھېسابلاش ئۇسۇلىنى كۆرۈڭ',
                detaylar: [
                    'ئورۇن تەڭشىكىدە «باشقا دۆلەت» نى تاللاپ 34 مىڭدىن ئارتۇق شەھەر ئىچىدىن ئىزدىيەلەيسىز؛ تور كېرەك ئەمەس.',
                    'مالايسىيا، ھىندونېزىيە، سەئۇدى ئەرەبىستان، مىسىر، پاكىستان ۋە باشقا نۇرغۇن دۆلەتلەردە يەرلىك مەسچىتلەرنىڭ ۋاقىت جەدۋىلى ئىشلىتىلىدۇ.',
                    'باش ئېكراندىكى ئۇسۇل بەلگىسىنى چېكىپ قايسى ۋاقىت جەدۋىلىنىڭ ئىشلىتىلىۋاتقانلىقىنى كۆرەلەيسىز، خالىسىڭىز ئەسىرنى ۋە ھەر بىر ناماز ۋاقتىنى مەسچىتىڭىزگە ماسلاشتۇرۇپ مىنۇتمۇ مىنۇت تەڭشىيەلەيسىز.',
                ],
            },
            az: {
                baslik: 'Dünyanın hər yerində dəqiq namaz vaxtları',
                aciklama: 'Dünyada istənilən şəhəri seçin. Namaz vaxtları həmin ölkədəki məscidlərin istifadə etdiyi təqvimə görə hesablanır.',
                detayAciklama: 'Başqa ölkəyə səfər etdikdə tətbiq həmin ölkənin təqvimini bir dəfə təklif edir və bu günün vaxtlarını yan-yana göstərir. Üsul sizin razılığınız olmadan heç vaxt dəyişmir.',
                ctaEtiketi: 'Hesablama üsuluna baxın',
                detaylar: [
                    'Məkan bölməsində "Başqa ölkə" seçin və 34 mindən çox şəhər arasında axtarın; internet lazım deyil.',
                    'Malayziya, İndoneziya, Səudiyyə Ərəbistanı, Misir, Pakistan və bir çox başqa ölkədə yerli məscidlərin təqvimi istifadə olunur.',
                    'Hansı təqvimin istifadə olunduğunu görmək üçün ana ekrandakı üsul nişanına toxunun; əsr vaxtını və hər vaxtı dəqiqəbədəqiqə məscidinizə uyğunlaşdırın.',
                ],
            },
            uz: {
                baslik: 'Дунёнинг исталган жойида аниқ намоз вақтлари',
                aciklama: 'Дунёдаги исталган шаҳарни танланг. Намоз вақтлари шу мамлакат масжидлари амал қиладиган тақвим бўйича ҳисобланади.',
                detayAciklama: 'Бошқа мамлакатга борганингизда илова шу мамлакат тақвимини бир марта таклиф қилади ва бугунги вақтларни ёнма-ён кўрсатади. Усул сизнинг розилигингизсиз ҳеч қачон ўзгармайди.',
                ctaEtiketi: 'Ҳисоблаш усулини кўриш',
                detaylar: [
                    'Жойлашув бўлимида «Бошқа мамлакат»ни танлаб, 34 мингдан ортиқ шаҳар орасидан қидиринг; интернет керак эмас.',
                    'Малайзия, Индонезия, Саудия Арабистони, Миср, Покистон ва бошқа кўплаб мамлакатларда маҳаллий масжидлар тақвими ишлатилади.',
                    'Қайси тақвим ишлатилаётганини кўриш учун бош экрандаги усул белгисини босинг; асрни ва ҳар бир намоз вақтини масжидингизга мослаб дақиқама-дақиқа созлашингиз мумкин.',
                ],
            },
            kk: {
                baslik: 'Әлемнің кез келген жерінде дәл намаз уақыты',
                aciklama: 'Әлемнің кез келген қаласын таңдай аласыз. Намаз уақыттары сол елдегі мешіттер ұстанатын күнтізбеге қарай есептеледі.',
                detayAciklama: 'Басқа елге барғаныңызда қолданба сол елдің күнтізбесін бір рет ұсынып, бүгінгі уақыттарды қатар көрсетеді. Сіз растамайынша әдіс өзгермейді.',
                ctaEtiketi: 'Есептеу әдісін көру',
                detaylar: [
                    'Орын баптауларында «Басқа ел» тармағын таңдап, 34 мыңнан астам қаланың ішінен іздей аласыз; интернет керек емес.',
                    'Малайзия, Индонезия, Сауд Арабиясы, Египет, Пәкістан және басқа көптеген елдерде жергілікті мешіттердің күнтізбесі қолданылады.',
                    'Басты экрандағы әдіс белгісін түртіп, қай күнтізбе қолданылатынын көре аласыз, екінті уақытын және әр намаз уақытын мешітіңізге қарай минутына дейін баптай аласыз.',
                ],
            },
            ky: {
                baslik: 'Дүйнөнүн каалаган жеринде так намаз убактылары',
                aciklama: 'Дүйнөдөгү каалаган шаарды тандаңыз. Намаз убактылары ошол өлкөнүн мечиттери колдонгон жадыбалга ылайык болот.',
                detayAciklama: 'Башка өлкөгө барганыңызда колдонмо ошол өлкөнүн жадыбалын бир жолу сунуштап, бүгүнкү убакыттарды катар көрсөтөт. Ыкма сиздин макулдугуңузсуз эч качан өзгөрбөйт.',
                ctaEtiketi: 'Эсептөө ыкмасын көрүү',
                detaylar: [
                    'Жайгашкан жер бөлүмүнөн «Башка өлкө» дегенди тандап, 34 000ден ашык шаардан издеңиз; интернет керек эмес.',
                    'Малайзия, Индонезия, Сауд Арабиясы, Египет, Пакистан жана башка көптөгөн өлкөлөрдө жергиликтүү мечиттердин жадыбалы колдонулат.',
                    'Кайсы жадыбал колдонулганын көрүү үчүн башкы экрандагы ыкма белгисин басыңыз, асрды жана ар бир намаз убактысын мечитиңизге ылайык мүнөт сайын тууралаңыз.',
                ],
            },
            tg: {
                baslik: 'Вақтҳои дақиқи намоз дар ҳар ҷои ҷаҳон',
                aciklama: 'Ҳар шаҳри ҷаҳонро интихоб кунед. Вақтҳои намоз мувофиқи тақвиме ҳисоб мешаванд, ки масҷидҳои он кишвар истифода мебаранд.',
                detayAciklama: 'Вақте ки ба кишвари дигар сафар мекунед, барнома як бор тақвими он кишварро пешниҳод мекунад ва вақтҳои имрӯзро паҳлӯ ба паҳлӯ нишон медиҳад. Усул ҳеҷ гоҳ бе розигии Шумо иваз намешавад.',
                ctaEtiketi: 'Усули ҳисобро бинед',
                detaylar: [
                    'Дар Макон «Кишвари дигар»-ро интихоб кунед ва дар байни беш аз 34 000 шаҳр ҷустуҷӯ кунед; интернет лозим нест.',
                    'Дар Малайзия, Индонезия, Арабистони Саудӣ, Миср, Покистон ва бисёр кишварҳои дигар тақвими масҷидҳои маҳаллӣ истифода мешавад.',
                    'Тугмачаи усулро дар экрани асосӣ пахш кунед, то бинед, ки кадом тақвим истифода мешавад, ва асрро ва ҳар вақтро дақиқа ба дақиқа мувофиқи масҷидатон танзим кунед.',
                ],
            },
            sw: {
                baslik: 'Nyakati sahihi za Swala popote duniani',
                aciklama: 'Chagua mji wowote duniani. Nyakati za Swala zinafuata ratiba inayotumiwa na misikiti ya nchi hiyo.',
                detayAciklama: 'Unaposafiri kwenda nchi nyingine, programu inapendekeza ratiba ya nchi hiyo mara moja na kuonyesha nyakati za leo kando kwa kando. Mbinu haibadiliki kamwe bila idhini yako.',
                ctaEtiketi: 'Ona mbinu ya hesabu',
                detaylar: [
                    'Katika Mahali, chagua "Nchi nyingine" na utafute kati ya miji zaidi ya 34,000; intaneti haihitajiki.',
                    'Nchini Malesia, Indonesia, Saudi Arabia, Misri, Pakistani na nchi nyingine nyingi, ratiba ya misikiti ya eneo hilo inatumika.',
                    'Gusa kipande cha mbinu kwenye skrini kuu ili kuona ratiba inayotumika, na urekebishe Alasiri na kila wakati wa Swala dakika kwa dakika ili ulingane na msikiti wako.',
                ],
            },
            ha: {
                baslik: 'Lokutan salla daidai a koʼina a duniya',
                aciklama: 'Ku zaɓi kowane birni a duniya. Lokutan salla suna bin jadawalin da masallatan wannan ƙasa ke amfani da shi.',
                detayAciklama: 'Idan kuka yi tafiya zuwa wata ƙasa, manhajar tana ba da shawarar jadawalin wannan ƙasa sau ɗaya kuma tana nuna lokutan yau gefe da gefe. Hanyar ba ta taɓa canjawa ba tare da amincewarku ba.',
                ctaEtiketi: 'Duba hanyar lissafi',
                detaylar: [
                    'A Wuri, ku zaɓi "Wata ƙasa" ku nemi birane fiye da 34,000; ba a buƙatar intanet.',
                    'A Malaysia, Indonesiya, Saudiyya, Masar, Pakistan da sauran ƙasashe da yawa, ana amfani da jadawalin masallatan yankin.',
                    'Ku taɓa alamar hanya a allon gida don ganin jadawalin da ake amfani da shi, kuma ku daidaita Laʼasar da kowane lokacin salla minti-minti don dacewa da masallacinku.',
                ],
            },
            am: {
                baslik: 'በዓለም ዙሪያ በየትኛውም ቦታ ትክክለኛ የሶላት ሰዓቶች',
                aciklama: 'በዓለም ላይ የትኛውንም ከተማ ይምረጡ። የሶላት ሰዓቶች በዚያ አገር ያሉ መስጂዶች የሚጠቀሙበትን የጊዜ ሰሌዳ ይከተላሉ።',
                detayAciklama: 'ወደ ሌላ አገር ሲጓዙ መተግበሪያው የዚያን አገር የጊዜ ሰሌዳ አንድ ጊዜ ይጠቁማል፤ የዛሬ ሰዓቶችንም ጎን ለጎን ያሳያል። ዘዴው ያለ እርስዎ ፈቃድ በፍጹም አይቀየርም።',
                ctaEtiketi: 'የስሌት ዘዴውን ተመልከት',
                detaylar: [
                    'በአካባቢ ውስጥ “ሌላ አገር”ን ይምረጡና ከ34,000 በላይ ከተሞችን ይፈልጉ፤ በይነመረብ አያስፈልግም።',
                    'በማሌዥያ፣ በኢንዶኔዥያ፣ በሳዑዲ ዓረቢያ፣ በግብፅ፣ በፓኪስታን እና በሌሎች ብዙ አገሮች የአካባቢው መስጂዶች የጊዜ ሰሌዳ ጥቅም ላይ ይውላል።',
                    'የትኛው የጊዜ ሰሌዳ ጥቅም ላይ እንደዋለ ለማየት በመነሻ ገጹ ላይ ያለውን የዘዴ ምልክት ይንኩ፤ አስርን እና እያንዳንዱን የሶላት ሰዓት ከመስጂድዎ ጋር እንዲዛመድ በደቂቃ ያስተካክሉ።',
                ],
            },
            om: {
                baslik: 'Addunyaa irratti bakka kamittuu yeroo salaataa sirrii',
                aciklama: 'Magaalaa addunyaa kamiyyuu filadhaa. Yeroon salaataa sagantaa yeroo masjiidonni biyya sanaa fayyadaman hordofa.',
                detayAciklama: "Yeroo gara biyya biraa imaltan, appichi sagantaa yeroo biyya sanaa si'a tokko isinitti dhiyeessee yeroo har'aa wal bira qabee agarsiisa. Malli gonkumaa osoo isin hin hayyamin hin jijjiiramu.",
                ctaEtiketi: 'Mala herregaa ilaalaa',
                detaylar: [
                    'Bakka keessatti "Biyya biraa" filadhaatii magaalota 34,000 ol keessaa barbaadaa; interneetiin hin barbaachisu.',
                    "Maleeshiyaa, Indoneeshiyaa, Saa'ud Arabiyaa, Masrii, Paakistaaniifi biyyoota biroo hedduu keessatti sagantaan yeroo masjiidota naannoo fayyadama.",
                    'Sagantaa kam akka fayyadamu arguuf fuula jalqabaa irratti mallattoo malaa tuqaa, Asriifi yeroo salaataa hunda akka masjiida keessaniitti daqiiqaan sirreessaa.',
                ],
            },
            so: {
                baslik: 'Waqtiyo salaadeed oo sax ah meel kasta oo adduunka ah',
                aciklama: 'Dooro magaalo kasta oo adduunka ah. Waqtiyada salaaddu waxay raacaan jadwalka ay masaajidda dalkaasi isticmaalaan.',
                detayAciklama: "Marka aad u safarto dal kale, barnaamijku hal mar ayuu kuu soo jeedinayaa jadwalka dalkaas wuxuuna muujinayaa waqtiyada maanta isbarbar. Habku marnaba isma beddelo oggolaanshahaaga la'aantiis.",
                ctaEtiketi: 'Eeg habka xisaabinta',
                detaylar: [
                    'Goobta, dooro "Dal kale" oo ka raadi in ka badan 34,000 magaalo; internet looma baahna.',
                    'Malaysiya, Indunusiya, Sacuudi Carabiya, Masar, Pakistan iyo dalal kale oo badan, waxaa la isticmaalaa jadwalka masaajidda deegaanka.',
                    'Taabo calaamadda habka ee shaashadda hore si aad u aragto jadwalka la isticmaalayo, oo hagaaji Casar iyo waqti salaadeed kasta daqiiqad daqiiqad si uu ula jaanqaado masjidkaaga.',
                ],
            },
            ff: {
                baslik: 'Saa’iiji juulɗe feewɗi e nokku kala e aduna',
                aciklama: 'Suɓee saare kala e aduna. Saa’iiji juulɗe hino rewa kalandar mo juulirɗe leydi ndii huutortoo.',
                detayAciklama: 'So on njahii e leydi goɗndi, jaaɓngal ngal hino wasiya kalandar leydi ndii laawol go’o, hino holla saa’iiji hannde takko takko. Laawol ngol waylotaako abada tawa on jaɓaani.',
                ctaEtiketi: 'Ndaaree laawol hiisagol',
                detaylar: [
                    'E Nokkuure, suɓee “Leydi goɗndi”, yiylon e nder saareeji ɓurɗi 34 000; enternet haanaani.',
                    'E Malesii, Enndonesii, Arabii Sawdit, Ejipt, Pakistaan e leyɗeele goɗɗe ɗuuɗɗe, kalandar juulirɗe nokku ngoo hino huutoree.',
                    'Dobee maande laawol ngol e yaynirde arannde ngam yiyde kalandar huutoraaɗo, feewnon alansaraa e waqutu juulde kala hojom e hojom ngam fotde e juulirde mon.',
                ],
            },
            yo: {
                baslik: 'Àwọn àkókò ìrun tó péye níbikíbi ní àgbáyé',
                aciklama: 'Ẹ yan ìlú èyíkéyìí ní àgbáyé. Àwọn àkókò ìrun ń tẹ̀lé àkọsílẹ̀ àkókò tí àwọn mọ́sálásí orílẹ̀-èdè náà ń lò.',
                detayAciklama: 'Nígbà tí ẹ bá rìnrìn-àjò lọ sí orílẹ̀-èdè mìíràn, ìṣàfilọ́lẹ̀ yóò dábàá àkọsílẹ̀ àkókò orílẹ̀-èdè náà lẹ́ẹ̀kan, yóò sì fi àwọn àkókò òní hàn lẹ́gbẹ̀ẹ́ ara wọn. Ọ̀nà ìṣirò kì í yí padà láìsí ìfọwọ́sí yín.',
                ctaEtiketi: 'Wo ọ̀nà ìṣirò',
                detaylar: [
                    'Nínú Ibùdó, ẹ yan "Orílẹ̀-èdè mìíràn", kí ẹ sì wá láàrin ìlú tí ó ju 34,000 lọ; a kò nílò íntánẹ́ẹ̀tì.',
                    'Ní Malasia, Indonéṣíà, Saudi Arabia, Íjíbítì, Pakisitan àti ọ̀pọ̀ orílẹ̀-èdè mìíràn, à ń lo àkọsílẹ̀ àkókò àwọn mọ́sálásí àdúgbò.',
                    'Ẹ tẹ àmì ọ̀nà ìṣirò lórí ojú-ìwé àkọ́kọ́ láti rí àkọsílẹ̀ àkókò tí à ń lò, kí ẹ sì ṣàtúnṣe ‘Asr àti àkókò ìrun kọ̀ọ̀kan ní ìṣẹ́jú-ìṣẹ́jú kí ó bá ti mọ́sálásí yín mu.',
                ],
            },
        },
    },
    // Samimiyet: "Kılındı" yerine dua, günün selamı, saat ailesiyle aynı vakit simgeleri.
    {
        id: 'samimiyet-kabul-olsun',
        platformlar: ['android', 'ios'],
        surum: '0.70.0',
        tarih: '2026-10-22',
        baslik: 'Allah kabul etsin',
        aciklama:
            'Namazı işaretlediğinizde artık "Kılındı" değil, "Allah kabul etsin" yazar. Cuma, kandil, bayram ve Ramazan günlerinde başlıkta kısa bir selam görürsünüz.',
        detayAciklama:
            'Kıldım düğmesi, saat ve sesli asistan aynı duayı söyler; beş vakti tamamladığınız gün kısa bir kart çıkar. Kandil ve bayram günleri Diyanet takviminden alınır. Vakit simgeleri de yenilendi: her vakit saatinizdeki simgeyle aynı.',
        detaylar: [
            'Kıldım sonrası "Allah kabul etsin" — sabah ve yatsıda kısa selam',
            'Beş vakit tamam olunca kısa bir dua kartı',
            'Cuma, kandil, bayram ve Ramazan selamı (Diyanet takvimi)',
            'Her vakte ayrı, saatinizle aynı simge',
        ],
        ikon: 'pray',
        ceviri: {
            en: {
                baslik: 'May Allah accept it',
                aciklama:
                    'When you mark a prayer, it says "May Allah accept it". On Fridays, Eid and in Ramadan you see a short greeting at the top.',
                detayAciklama:
                    'The I\'ve prayed button, your watch and the voice assistant say the same prayer; on a day you complete all five prayers, a short card appears. Each prayer now has its own icon, the same as on your watch.',
                detaylar: [
                    '"May Allah accept it" after you pray — a short greeting at Fajr and Isha',
                    'A short card when all five prayers are done',
                    'Friday, Eid and Ramadan greetings',
                    'A separate icon for each prayer, the same as on your watch',
                ],
            },
            id: {
                baslik: 'Semoga Allah menerimanya',
                aciklama: 'Saat Anda menandai salat, tampil "Semoga Allah menerimanya". Pada hari Jumat, Hari Raya, dan bulan Ramadan, Anda melihat salam singkat di bagian atas.',
                detayAciklama: 'Tombol Sudah salat, jam tangan Anda, dan asisten suara mengucapkan doa yang sama; pada hari Anda menunaikan kelima salat, muncul kartu singkat. Setiap waktu salat kini memiliki ikon sendiri, sama seperti di jam tangan Anda.',
                detaylar: [
                    '"Semoga Allah menerimanya" setelah salat — salam singkat saat Subuh dan Isya',
                    'Kartu singkat saat kelima salat telah ditunaikan',
                    'Salam Jumat, Hari Raya, dan Ramadan',
                    'Ikon tersendiri untuk setiap waktu salat, sama seperti di jam tangan Anda',
                ],
            },
            de: {
                baslik: 'Möge Allah es annehmen',
                aciklama: 'Wenn Sie ein Gebet markieren, erscheint „Möge Allah es annehmen“. Freitags, an den Festtagen und im Ramadan sehen Sie oben einen kurzen Gruß.',
                detayAciklama: 'Die Taste „Ich habe gebetet“, Ihre Uhr und der Sprachassistent sprechen dasselbe Bittgebet; an einem Tag, an dem Sie alle fünf Gebete verrichten, erscheint eine kurze Karte. Jedes Gebet hat jetzt ein eigenes Symbol, dasselbe wie auf Ihrer Uhr.',
                detaylar: [
                    '„Möge Allah es annehmen“ nach dem Gebet — ein kurzer Gruß zu Fajr und Isha',
                    'Eine kurze Karte, wenn alle fünf Gebete verrichtet sind',
                    'Grüße zum Freitag, zu den Festtagen und im Ramadan',
                    'Ein eigenes Symbol für jedes Gebet, dasselbe wie auf Ihrer Uhr',
                ],
            },
            fr: {
                baslik: 'Qu’Allah l’accepte',
                aciklama: 'Quand vous marquez une prière, l’application vous dit « Qu’Allah l’accepte ». Le vendredi, pendant l’Aïd et pendant le Ramadan, une courte salutation apparaît en haut de l’écran.',
                detayAciklama: 'Le bouton « J’ai prié », votre montre et l’assistant vocal disent la même invocation ; le jour où vous accomplissez les cinq prières, une courte carte apparaît. Chaque prière a désormais sa propre icône, la même que sur votre montre.',
                detaylar: [
                    '« Qu’Allah l’accepte » après la prière — une courte salutation à Fajr et à Isha',
                    'Une courte carte quand les cinq prières sont accomplies',
                    'Salutations du vendredi, de l’Aïd et du Ramadan',
                    'Une icône propre à chaque prière, la même que sur votre montre',
                ],
            },
            bs: {
                baslik: 'Allah kabul ejlesun',
                aciklama: 'Kada označite namaz, aplikacija kaže „Allah kabul ejlesun”. Petkom, za bajram i u ramazanu na vrhu vidite kratku čestitku.',
                detayAciklama: 'Dugme „Klanjano”, Vaš sat i glasovni asistent izgovaraju istu dovu; na dan kada klanjate svih pet vakata pojavljuje se kratka kartica. Svaki vakat sada ima vlastitu ikonu, istu kao na Vašem satu.',
                detaylar: [
                    '„Allah kabul ejlesun” nakon namaza — kratak selam u zoru i na jaciji',
                    'Kratka kartica kada su klanjani svi vakti',
                    'Čestitke za džumu, bajram i ramazan',
                    'Posebna ikona za svaki vakat, ista kao na Vašem satu',
                ],
            },
            ru: {
                baslik: 'Да примет Аллах',
                aciklama: 'Когда вы отмечаете намаз, приложение говорит «Да примет Аллах». По пятницам, в праздники Ид и в Рамадан вверху появляется короткое приветствие.',
                detayAciklama: 'Кнопка «Намаз совершён», часы и голосовой помощник произносят одно и то же пожелание; в день, когда совершены все пять намазов, появляется короткая карточка. У каждого намаза теперь свой значок — такой же, как на часах.',
                detaylar: [
                    '«Да примет Аллах» после намаза — короткое приветствие на Фаджр и Иша',
                    'Короткая карточка, когда совершены все пять намазов',
                    'Приветствия в пятницу, на Ид и в Рамадан',
                    'Отдельный значок для каждого намаза, такой же, как на часах',
                ],
            },
            ms: {
                baslik: 'Semoga Allah menerimanya',
                aciklama: 'Apabila anda menandakan solat, aplikasi mengucapkan "Semoga Allah menerimanya". Pada hari Jumaat, Hari Raya dan bulan Ramadan, anda melihat ucapan ringkas di bahagian atas.',
                detayAciklama: 'Butang Sudah solat, jam tangan anda dan pembantu suara mengucapkan doa yang sama; pada hari anda melengkapkan kelima-lima waktu, satu kad ringkas dipaparkan. Setiap waktu solat kini mempunyai ikonnya sendiri, sama seperti di jam tangan anda.',
                detaylar: [
                    '"Semoga Allah menerimanya" selepas anda solat — ucapan ringkas pada waktu Subuh dan Isyak',
                    'Kad ringkas apabila kelima-lima waktu selesai',
                    'Ucapan Jumaat, Hari Raya dan Ramadan',
                    'Ikon berasingan bagi setiap waktu, sama seperti di jam tangan anda',
                ],
            },
            ar: {
                baslik: 'تقبّل الله',
                aciklama: 'عند وضع علامة على صلاة يظهر «تقبّل الله». وفي الجمعة والعيد ورمضان تظهر تحية قصيرة في الأعلى.',
                detayAciklama: 'زر «صلّيتُ» وساعتك والمساعد الصوتي تقول الدعاء نفسه؛ وفي اليوم الذي تكتمل فيه الصلوات الخمس تظهر بطاقة قصيرة. ولكل صلاة الآن أيقونتها الخاصة، كما في ساعتك.',
                detaylar: [
                    '«تقبّل الله» بعد الصلاة — وتحية قصيرة عند الفجر والعشاء',
                    'بطاقة قصيرة عند اكتمال الصلوات الخمس',
                    'تحيات الجمعة والعيد ورمضان',
                    'أيقونة مستقلة لكل صلاة، كما في ساعتك',
                ],
            },
            ur: {
                baslik: 'اللہ قبول فرمائے',
                aciklama: 'نماز پر نشان لگانے پر “اللہ قبول فرمائے” کہا جاتا ہے۔ جمعہ، عید اور رمضان میں اوپر ایک مختصر سلام نظر آتا ہے۔',
                detayAciklama: '“نماز پڑھ لی” کا بٹن، آپ کی گھڑی اور صوتی معاون ایک ہی دعا کہتے ہیں؛ جس دن پانچوں نمازیں مکمل ہوں، ایک مختصر کارڈ نظر آتا ہے۔ اب ہر نماز کا اپنا آئیکن ہے، بالکل گھڑی کی طرح۔',
                detaylar: [
                    'نماز کے بعد “اللہ قبول فرمائے” — فجر اور عشاء میں ایک مختصر سلام',
                    'پانچوں نمازیں مکمل ہونے پر ایک مختصر کارڈ',
                    'جمعہ، عید اور رمضان کے سلام',
                    'ہر نماز کا الگ آئیکن، بالکل گھڑی کی طرح',
                ],
            },
            es: {
                baslik: 'Que Allah lo acepte',
                aciklama: 'Cuando marca un rezo, aparece «Que Allah lo acepte». Los viernes, en el Eid y en Ramadán verá un breve saludo arriba.',
                detayAciklama: 'El botón «Ya recé», su reloj y el asistente de voz dicen la misma súplica; el día en que completa los cinco rezos aparece una tarjeta breve. Cada rezo tiene ahora su propio icono, el mismo que en su reloj.',
                detaylar: [
                    '«Que Allah lo acepte» después de rezar — un breve saludo en Fajr e Isha',
                    'Una tarjeta breve cuando completa los cinco rezos',
                    'Saludos del viernes, del Eid y de Ramadán',
                    'Un icono distinto para cada rezo, el mismo que en su reloj',
                ],
            },
            nl: {
                baslik: 'Moge Allah het accepteren',
                aciklama: 'Als u een gebed markeert, staat er "Moge Allah het accepteren". Op vrijdag, met Eid en tijdens ramadan ziet u bovenaan een korte groet.',
                detayAciklama: 'De knop Gebeden, uw horloge en de spraakassistent zeggen dezelfde smeekbede; op een dag waarop u alle vijf gebeden voltooit, verschijnt een korte kaart. Elk gebed heeft nu een eigen pictogram, hetzelfde als op uw horloge.',
                detaylar: [
                    '"Moge Allah het accepteren" na het gebed — een korte groet bij Fajr en Isha',
                    'Een korte kaart als alle vijf gebeden zijn verricht',
                    'Groeten op vrijdag, met Eid en tijdens ramadan',
                    'Een apart pictogram voor elk gebed, hetzelfde als op uw horloge',
                ],
            },
            sq: {
                baslik: 'Allahu e pranoftë',
                aciklama: 'Kur shënoni një namaz, shfaqet "Allahu e pranoftë". Në xhuma, në Bajram dhe në Ramazan shihni një urim të shkurtër në krye.',
                detayAciklama: 'Butoni "E fala", ora dhe asistenti zanor thonë të njëjtën lutje; në ditën kur i plotësoni të pesë vaktet shfaqet një kartë e shkurtër. Çdo vakt tani ka ikonën e vet, të njëjtën si në orë.',
                detaylar: [
                    '"Allahu e pranoftë" pas namazit — një urim i shkurtër në sabah dhe në jaci',
                    'Një kartë e shkurtër kur plotësohen të pesë vaktet',
                    'Urime për xhumanë, Bajramin dhe Ramazanin',
                    'Ikonë e veçantë për çdo vakt, e njëjta si në orë',
                ],
            },
            hi: {
                baslik: 'अल्लाह क़बूल करे',
                aciklama: 'नमाज़ पर निशान लगाने पर “अल्लाह क़बूल करे” कहा जाता है। जुमा, ईद और रमज़ान में ऊपर एक छोटा सा सलाम दिखता है।',
                detayAciklama: '“नमाज़ पढ़ ली” का बटन, आपकी घड़ी और वॉइस असिस्टेंट एक ही दुआ कहते हैं; जिस दिन पाँचों नमाज़ें पूरी हों, एक छोटा कार्ड दिखता है। अब हर नमाज़ का अपना आइकन है, बिल्कुल घड़ी की तरह।',
                detaylar: [
                    'नमाज़ के बाद “अल्लाह क़बूल करे” — फ़ज्र और इशा में एक छोटा सा सलाम',
                    'पाँचों नमाज़ें पूरी होने पर एक छोटा कार्ड',
                    'जुमा, ईद और रमज़ान के सलाम',
                    'हर नमाज़ का अलग आइकन, बिल्कुल घड़ी की तरह',
                ],
            },
            bn: {
                baslik: 'আল্লাহ কবুল করুন',
                aciklama: 'নামাজ চিহ্নিত করলে "আল্লাহ কবুল করুন" বলা হয়। শুক্রবার, ঈদ ও রমজানে ওপরে একটি ছোট শুভেচ্ছা দেখতে পাবেন।',
                detayAciklama: '"নামাজ পড়েছি" বোতাম, আপনার ঘড়ি ও ভয়েস অ্যাসিস্ট্যান্ট একই দোয়া বলে; যেদিন পাঁচ ওয়াক্তই পূর্ণ করেন, সেদিন একটি ছোট কার্ড দেখা যায়। প্রতিটি নামাজের এখন নিজস্ব আইকন আছে, আপনার ঘড়ির মতোই।',
                detaylar: [
                    'নামাজের পর "আল্লাহ কবুল করুন" — ফজর ও ইশায় একটি ছোট শুভেচ্ছা',
                    'পাঁচ ওয়াক্ত পূর্ণ হলে একটি ছোট কার্ড',
                    'শুক্রবার, ঈদ ও রমজানের শুভেচ্ছা',
                    'প্রতিটি নামাজের আলাদা আইকন, আপনার ঘড়ির মতোই',
                ],
            },
            fa: {
                baslik: 'قبول باشد',
                aciklama: 'وقتی نمازی را علامت می‌زنید، «قبول باشد» گفته می‌شود. روزهای جمعه، عید و در رمضان تبریکی کوتاه در بالا می‌بینید.',
                detayAciklama: 'دکمهٔ «خواندم»، ساعت شما و دستیار صوتی همین دعا را می‌گویند؛ در روزی که هر پنج نماز را کامل کنید، کارتی کوتاه نمایش داده می‌شود. هر نماز اکنون نماد خودش را دارد، همان که روی ساعت شماست.',
                detaylar: [
                    '«قبول باشد» پس از نماز — و سلامی کوتاه هنگام صبح و عشا',
                    'کارتی کوتاه وقتی هر پنج نماز خوانده شود',
                    'تبریک جمعه، عید و رمضان',
                    'نمادی جداگانه برای هر نماز، همان که روی ساعت شماست',
                ],
            },
            ps: {
                baslik: 'الله دې قبول کړي',
                aciklama: 'کله چې یو لمونځ نښه کړئ، «الله دې قبول کړي» وايي. د جمعې، اختر او رمضان په ورځو کې په پورته برخه کې یو لنډ سلام ګورئ.',
                detayAciklama: 'د «لمونځ مې وکړ» تڼۍ، ستاسو ساعت او غږیز مرستیال همغه دعا وايي؛ په هغه ورځ چې ټول پنځه لمونځونه بشپړ کړئ، یو لنډ کارت ښکاري. اوس هر لمونځ خپله نښه لري، لکه ستاسو په ساعت کې.',
                detaylar: [
                    'له لمانځه وروسته «الله دې قبول کړي» — د سهار او ماسخوتن په وخت لنډ سلام',
                    'کله چې ټول پنځه لمونځونه بشپړ شي، یو لنډ کارت',
                    'د جمعې، اختر او رمضان سلامونه',
                    'د هر لمانځه لپاره جلا نښه، لکه ستاسو په ساعت کې',
                ],
            },
            ckb: {
                baslik: 'خوا قبوڵی بکات',
                aciklama: 'کاتێک نوێژێک نیشانە دەکەن، دەڵێت «خوا قبوڵی بکات». ڕۆژانی ھەینی، جەژن و لە ڕەمەزاندا سڵاوێکی کورت لە سەرەوە دەبینن.',
                detayAciklama: 'دوگمەی «نوێژم کرد»، کاتژمێرەکەتان و یاریدەدەری دەنگی ھەمان دوعا دەڵێن؛ لەو ڕۆژەی ھەر پێنج نوێژەکە تەواو دەکەن، کارتێکی کورت دەردەکەوێت. ھەر نوێژێک ئێستا ئایکۆنی خۆی ھەیە، ھەمان ئەوەی سەر کاتژمێرەکەتان.',
                detaylar: [
                    '«خوا قبوڵی بکات» دوای نوێژکردن — سڵاوێکی کورت لە بەیانی و خەوتناندا',
                    'کارتێکی کورت کاتێک ھەر پێنج نوێژەکە کراون',
                    'سڵاوی ھەینی، جەژن و ڕەمەزان',
                    'ئایکۆنێکی جیا بۆ ھەر نوێژێک، ھەمان ئەوەی سەر کاتژمێرەکەتان',
                ],
            },
            ug: {
                baslik: 'ئاللاھ قوبۇل قىلسۇن',
                aciklama: 'نامازنى بەلگىلىگىنىڭىزدە «ئاللاھ قوبۇل قىلسۇن» دەپ يېزىلىدۇ. جۈمە، ھېيت ۋە رامىزان كۈنلىرىدە ئۈستىدە قىسقا بىر سالام كۆرىسىز.',
                detayAciklama: '«ناماز ئوقۇدۇم» كۇنۇپكىسى، سائىتىڭىز ۋە ئاۋازلىق ياردەمچى ئوخشاش دۇئانى ئېيتىدۇ؛ بەش ۋاق نامازنى تولۇق ئوقۇغان كۈنىڭىزدە قىسقا بىر كارتا چىقىدۇ. ھەر بىر نامازنىڭ ئەمدى ئۆز بەلگىسى بار، سائىتىڭىزدىكى بىلەن ئوخشاش.',
                detaylar: [
                    'ناماز ئوقۇغاندىن كېيىن «ئاللاھ قوبۇل قىلسۇن» — بامدات ۋە خۇپتەندە قىسقا سالام',
                    'بەش ۋاق ناماز تولۇق بولغاندا قىسقا بىر كارتا',
                    'جۈمە، ھېيت ۋە رامىزان سالاملىرى',
                    'ھەر بىر ناماز ئۈچۈن ئايرىم، سائىتىڭىزدىكى بىلەن ئوخشاش بەلگە',
                ],
            },
            az: {
                baslik: 'Allah qəbul etsin',
                aciklama: 'Namazı qeyd etdikdə "Allah qəbul etsin" deyilir. Cümə, bayram və Ramazan günlərində yuxarıda qısa təbrik görürsünüz.',
                detayAciklama: 'Qıldım düyməsi, saatınız və səsli köməkçi eyni duanı deyir; beş vaxtı tamamladığınız gün qısa kart çıxır. Hər namazın indi öz nişanı var, saatınızdakı ilə eyni.',
                detaylar: [
                    'Namazdan sonra "Allah qəbul etsin" — sübhdə və işada qısa salam',
                    'Beş vaxt tamamlananda qısa kart',
                    'Cümə, bayram və Ramazan təbrikləri',
                    'Hər namaz üçün ayrıca nişan, saatınızdakı ilə eyni',
                ],
            },
            uz: {
                baslik: 'Аллоҳ қабул қилсин',
                aciklama: 'Намозни белгилаганингизда «Аллоҳ қабул қилсин» деб ёзилади. Жума, ҳайит ва Рамазон кунларида тепада қисқа салом кўрасиз.',
                detayAciklama: '«Ўқидим» тугмаси, соатингиз ва овозли ёрдамчи бир хил дуони айтади; беш вақтни тўлиқ ўқиган кунингиз қисқа карточка чиқади. Ҳар бир намознинг энди ўз белгиси бор, соатингиздагидек.',
                detaylar: [
                    'Ўқиганингиздан кейин «Аллоҳ қабул қилсин» — бомдод ва хуфтонда қисқа салом',
                    'Беш вақт тўлиқ бўлганда қисқа карточка',
                    'Жума, ҳайит ва Рамазон саломлари',
                    'Ҳар бир намоз учун соатингиздагидек алоҳида белги',
                ],
            },
            kk: {
                baslik: 'Алла қабыл етсін',
                aciklama: 'Намазды белгілегенде «Алла қабыл етсін» деп жазылады. Жұма, айт және Рамазан күндері жоғарыда қысқа сәлем көресіз.',
                detayAciklama: '«Оқыдым» түймесі, сағатыңыз және дауыстық көмекші бір дұғаны айтады; бес уақытты толық оқыған күні шағын карта шығады. Әр намаз уақытының өз белгішесі бар, сағатыңыздағымен бірдей.',
                detaylar: [
                    'Намаздан кейін «Алла қабыл етсін» — таң мен құптанда қысқа сәлем',
                    'Бес уақыт толық болғанда шағын дұға картасы',
                    'Жұма, айт және Рамазан құттықтауы',
                    'Әр уақытқа бөлек, сағатыңыздағыдай белгіше',
                ],
            },
            ky: {
                baslik: 'Алла кабыл кылсын',
                aciklama: 'Намазды белгилегениңизде «Алла кабыл кылсын» деп айтылат. Жума күнү, айтта жана Рамазанда жогору жакта кыска куттуктоо көрүнөт.',
                detayAciklama: '«Окудум» баскычы, саатыңыз жана үн жардамчысы бир эле дубаны айтат; беш намаздын баарын окуган күнү кыска карточка пайда болот. Ар бир намаздын эми өз белгиси бар, саатыңыздагыдай эле.',
                detaylar: [
                    'Намаздан кийин «Алла кабыл кылсын» — багымдатта жана куптанда кыска тилек',
                    'Беш намаздын баары окулганда кыска карточка',
                    'Жума, айт жана Рамазан куттуктоолору',
                    'Ар бир намаз үчүн өзүнчө белги, саатыңыздагыдай эле',
                ],
            },
            tg: {
                baslik: 'Худо қабул кунад',
                aciklama: 'Вақте ки намозро қайд мекунед, «Худо қабул кунад» гуфта мешавад. Дар рӯзҳои ҷумъа, ид ва дар Рамазон дар боло табрики кӯтоҳ мебинед.',
                detayAciklama: 'Тугмаи «Хондам», соати Шумо ва ёрдамчии овозӣ ҳамон дуоро мегӯянд; дар рӯзе, ки ҳар панҷ вақтро пурра мекунед, корти кӯтоҳ пайдо мешавад. Ҳоло ҳар намоз нишонаи худро дорад, ҳамон тавре ки дар соататон.',
                detaylar: [
                    '«Худо қабул кунад» пас аз намоз — саломи кӯтоҳ дар бомдод ва хуфтан',
                    'Корти кӯтоҳ ҳангоми пурра шудани ҳар панҷ вақт',
                    'Табрикоти ҷумъа, ид ва Рамазон',
                    'Нишонаи ҷудогона барои ҳар намоз, ҳамон тавре ки дар соататон',
                ],
            },
            sw: {
                baslik: 'Mwenyezi Mungu aikubali',
                aciklama: 'Unapoweka alama Swala, inasema "Mwenyezi Mungu aikubali". Siku za Ijumaa, Idi na katika Ramadhani unaona salamu fupi juu.',
                detayAciklama: 'Kitufe cha Nimeswali, saa yako na msaidizi wa sauti husema dua ile ile; siku unayokamilisha Swala zote tano, kadi fupi inaonekana. Kila Swala sasa ina ikoni yake, ile ile kama kwenye saa yako.',
                detaylar: [
                    '"Mwenyezi Mungu aikubali" baada ya kuswali — salamu fupi wakati wa Alfajiri na Isha',
                    'Kadi fupi Swala zote tano zikikamilika',
                    'Salamu za Ijumaa, Idi na Ramadhani',
                    'Ikoni tofauti kwa kila Swala, ile ile kama kwenye saa yako',
                ],
            },
            ha: {
                baslik: 'Allah ya karɓa',
                aciklama: 'Idan kuka yi alamar salla, tana cewa "Allah ya karɓa". A ranar Jummaʼa, Sallah da Ramadan kuna ganin gajeriyar gaisuwa a sama.',
                detayAciklama: 'Maɓallin Na yi salla, agogonku da mataimakin murya suna faɗin adduʼa ɗaya; a ranar da kuka kammala salloli biyar duka, ƙaramin kati yana bayyana. Yanzu kowace salla tana da alamarta, iri ɗaya da ta agogonku.',
                detaylar: [
                    '"Allah ya karɓa" bayan kun yi salla — gajeriyar gaisuwa a Asuba da Isha',
                    'Ƙaramin kati idan an kammala salloli biyar duka',
                    'Gaisuwar Jummaʼa, Sallah da Ramadan',
                    'Alama ta daban ga kowace salla, iri ɗaya da ta agogonku',
                ],
            },
            am: {
                baslik: 'አላህ ይቀበለው',
                aciklama: 'ሶላትን ምልክት ሲያደርጉ “አላህ ይቀበለው” ይላል። በዓርብ፣ በዒድ እና በረመዳን ከላይ አጭር ሰላምታ ያያሉ።',
                detayAciklama: 'የ“ሰገድኩ” አዝራር፣ ሰዓትዎ እና የድምፅ ረዳቱ ተመሳሳይ ዱዓ ይላሉ፤ አምስቱንም ሶላቶች ባጠናቀቁበት ቀን አጭር ካርድ ይታያል። እያንዳንዱ ሶላት አሁን ልክ እንደ ሰዓትዎ የራሱ ምልክት አለው።',
                detaylar: [
                    'ከሰገዱ በኋላ “አላህ ይቀበለው” — በፈጅር እና በኢሻ አጭር ሰላምታ',
                    'አምስቱም ሶላቶች ሲጠናቀቁ አጭር ካርድ',
                    'የዓርብ፣ የዒድ እና የረመዳን ሰላምታዎች',
                    'ለእያንዳንዱ ሶላት የተለየ ምልክት፣ ልክ እንደ ሰዓትዎ',
                ],
            },
            om: {
                baslik: 'Rabbiin haa qeebalu',
                aciklama: 'Yeroo salaata mallatteessitan, "Rabbiin haa qeebalu" jedha. Guyyaa Jimaataa, Iidaafi Ramadaana keessa gubbaatti nagaa gabaabaa ilaaltu.',
                detayAciklama: "Qabduun \"Ani salaateera\", sa'aatiin keessaniifi gargaaraan sagalee kadhannaa tokkicha jedhu; guyyaa salaata shanan hunda guuttan kaardiin gabaabaan mul'ata. Salaanni hundi amma mallattoo ofii qaba, kan sa'aatii keessan irratti mul'atu wajjin tokko.",
                detaylar: [
                    "Erga salaattanii booda \"Rabbiin haa qeebalu\" — Subhiifi Ishaa'iitti nagaa gabaabaa",
                    'Yeroo salaanni shananuu xumuramu kaardii gabaabaa',
                    'Nagaa Jimaataa, Iidaafi Ramadaanaa',
                    "Salaata hundaaf mallattoo addaa, kan sa'aatii keessan irratti mul'atu wajjin tokko",
                ],
            },
            so: {
                baslik: 'Alle ha aqbalo',
                aciklama: 'Marka aad calaamadeyso salaad, wuxuu leeyahay "Alle ha aqbalo". Maalinta Jimcaha, Ciidda iyo Ramadaanka waxaad kor ka arkaysaa salaan gaaban.',
                detayAciklama: 'Badhanka Waan tukaday, saacaddaada iyo kaaliyaha codku waxay sheegaan isla ducada; maalinta aad dhammaystirto shanta salaadood, kaar gaaban ayaa soo baxa. Salaad kasta hadda waxay leedahay calaamad u gaar ah, oo la mid ah tan saacaddaada.',
                detaylar: [
                    '"Alle ha aqbalo" kadib marka aad tukato — salaan gaaban Subax iyo Cishe',
                    'Kaar gaaban marka shanta salaadood la dhammeeyo',
                    'Salaanta Jimcaha, Ciidda iyo Ramadaanka',
                    'Calaamad gooni ah salaad kasta, oo la mid ah tan saacaddaada',
                ],
            },
            ff: {
                baslik: 'Yo Alla jaɓu',
                aciklama: 'So on maandinii juulde, hino wi’a “Yo Alla jaɓu”. E aljuma, e juldeere e e Suumayee hiɗon njiya salminaango famɗungo dow.',
                detayAciklama: 'Butoŋ Mi juulii, montoro mon e ballotooɗo hito hino wi’a du’aaru wootere; ñalawma ɗo on timminii juulɗe njoy ɗen fow, kaartal famɗungal hino ɓanngoo. Juulde kala jooni hino jogii maande mayre, wootere e montoro mon.',
                detaylar: [
                    '“Yo Alla jaɓu” caggal nde juulu-ɗon — salminaango famɗungo e subaka e geeƴe',
                    'Kaartal famɗungal so juulɗe njoy ɗen fow timmii',
                    'Salminaaɗe aljuma, juldeere e Suumayee',
                    'Maande feere ngam juulde kala, wootere e montoro mon',
                ],
            },
            yo: {
                baslik: 'Kí Allāhu gbà á',
                aciklama: 'Nígbà tí ẹ bá sàmì sí ìrun, yóò sọ pé "Kí Allāhu gbà á". Ní Ọjọ́ Ẹtì, ní ọdún àti ní Rọmọdọ̄n, ẹ ó rí ìkíni kúkúrú lókè.',
                detayAciklama: 'Bọ́tìnnì Mo ti kírun, aago ọwọ́ yín àti olùrànlọ́wọ́ ohùn ń sọ àdúà kan náà; ní ọjọ́ tí ẹ bá parí ìrun márààrún, káàdì kúkúrú kan yóò hàn. Ìrun kọ̀ọ̀kan ti ní àmì tirẹ̀ báyìí, bákan náà bí ti aago ọwọ́ yín.',
                detaylar: [
                    '"Kí Allāhu gbà á" lẹ́yìn tí ẹ bá kírun — ìkíni kúkúrú ní Subh àti ‘Iṣā’',
                    'Káàdì kúkúrú nígbà tí ìrun márààrún bá pé',
                    'Ìkíni Ọjọ́ Ẹtì, ọdún àti Rọmọdọ̄n',
                    'Àmì ọ̀tọ̀ fún ìrun kọ̀ọ̀kan, bákan náà bí ti aago ọwọ́ yín',
                ],
            },
        },
    },
    // Cihazlar arası eşitleme (#288). Yalnız Android: Drive yetkisi yerleşik Google
    // hesabı onayıyla alınır. iOS'ta iCloud yolu ayrı bayrağa bağlı ve henüz açık değil.
    {
        id: 'cihazlar-arasi-esitleme-drive',
        platformlar: ['android'],
        surum: '0.69.0',
        tarih: '2026-10-22',
        baslik: 'Verileriniz Tüm Cihazlarınızda',
        aciklama:
            'Kıldığınız namazları, seri ve kaza defterinizi kendi Google Drive alanınızda saklayıp diğer telefonunuz ya da tabletinizle eşitleyebilirsiniz. Veriler sizin belirlediğiniz parolayla şifrelenir.',
        detayAciklama:
            'Google hesabınızı bir dokunuşla bağlarsınız; uygulama yalnız Drive\'daki kendi gizli klasörünü görür, dosyalarınıza erişemez. Verileriniz telefondan çıkmadan önce sizin parolanızla şifrelenir; parolayı biz de bilmeyiz, bu yüzden unutmamanız önemlidir. Bir namazı işaretlediğinizde hemen eşitlenir; isterseniz saatte ya da günde bir, yalnız Wi-Fi’de veya yalnız şarjdayken eşitlenmesini seçebilirsiniz. Güç tasarrufu açıkken eşitleme şarjı bekler. İki cihazda işaretlediğiniz namazlar birleştirilir, hiçbiri silinmez.',
        detaylar: [
            'Google hesabıyla tek dokunuşta bağlanma',
            'Uçtan uca şifreleme: parola yalnız sizde',
            'Drive\'da görünmeyen, yalnız uygulamaya ait klasör',
            'Kılınan namazlar, seri ve kaza defteri birleştirilir',
            'Sıklığı, Wi-Fi ve şarj koşulunu siz seçersiniz',
            'İstediğiniz an bağlantıyı kesebilirsiniz',
        ],
        ikon: 'sync-alt',
        hedefSayfa: 'EsitlemeAyarlari',
        ctaEtiketi: 'Eşitlemeyi açın',
        kartGoster: true,
        // Google Play hizmetleri olmayan cihazda (Huawei vb.) Drive kartı görünmez → duyuru da yok.
        yetenek: 'googleDrive',
        ceviri: {
            en: {
                baslik: 'Your data on all your devices',
                aciklama:
                    'Keep your prayers, streak and Qada log in your own Google Drive and sync them with your other phone or tablet. Your data is encrypted with a password you choose.',
                detayAciklama:
                    "Connect your Google account with one tap; the app sees only its own hidden folder in Drive, never your files. Your data is encrypted with your password before it leaves the phone; we don't know the password either, so don't forget it. A prayer syncs as soon as you mark it; you can also sync hourly or daily, only on Wi-Fi or only while charging. With battery saver on, sync waits for charging. Prayers marked on two devices are merged; none are deleted.",
                ctaEtiketi: 'Turn on sync',
                detaylar: [
                    'Connect with your Google account in one tap',
                    'End-to-end encryption: only you know the password',
                    "A hidden folder that belongs only to the app and doesn't show in Drive",
                    'Prayers, streak and Qada log are merged',
                    'You choose how often, and whether only on Wi-Fi or while charging',
                    'Disconnect whenever you like',
                ],
            },
            id: {
                baslik: 'Data Anda di semua perangkat',
                aciklama: 'Simpan catatan salat, runtunan, dan Catatan Qada di Google Drive Anda sendiri dan sinkronkan dengan ponsel atau tablet Anda yang lain. Data Anda dienkripsi dengan kata sandi pilihan Anda.',
                detayAciklama: 'Hubungkan akun Google Anda dengan satu ketukan; aplikasi hanya melihat folder tersembunyinya sendiri di Drive, tidak pernah file Anda. Data dienkripsi dengan kata sandi Anda sebelum keluar dari ponsel; kami pun tidak mengetahui kata sandinya, jadi jangan sampai lupa. Salat disinkronkan begitu Anda menandainya; Anda juga dapat menyinkronkan setiap jam atau setiap hari, hanya di Wi-Fi atau hanya saat diisi daya. Saat penghemat baterai aktif, sinkronisasi menunggu hingga diisi daya. Salat yang ditandai di dua perangkat digabungkan; tidak ada yang dihapus.',
                ctaEtiketi: 'Aktifkan sinkronisasi',
                detaylar: [
                    'Hubungkan dengan akun Google Anda dalam satu ketukan',
                    'Enkripsi menyeluruh: hanya Anda yang tahu kata sandinya',
                    'Folder tersembunyi khusus aplikasi yang tidak tampil di Drive',
                    'Catatan salat, runtunan, dan Catatan Qada digabungkan',
                    'Anda yang menentukan frekuensinya, serta apakah hanya di Wi-Fi atau saat diisi daya',
                    'Putuskan koneksi kapan saja',
                ],
            },
            de: {
                baslik: 'Ihre Daten auf all Ihren Geräten',
                aciklama: 'Bewahren Sie Ihre Gebete, Ihre Serie und Ihr Nachholbuch in Ihrem eigenen Google Drive auf und synchronisieren Sie sie mit Ihrem anderen Telefon oder Tablet. Ihre Daten werden mit einem Passwort Ihrer Wahl verschlüsselt.',
                detayAciklama: 'Verbinden Sie Ihr Google-Konto mit einem Tippen; die App sieht in Drive nur ihren eigenen versteckten Ordner, nie Ihre Dateien. Ihre Daten werden mit Ihrem Passwort verschlüsselt, bevor sie das Telefon verlassen; auch wir kennen das Passwort nicht, vergessen Sie es also nicht. Ein Gebet wird synchronisiert, sobald Sie es markieren; Sie können auch stündlich oder täglich, nur im WLAN oder nur beim Laden synchronisieren. Bei aktivem Energiesparen wartet die Synchronisierung auf das Laden. Auf zwei Geräten markierte Gebete werden zusammengeführt; keines wird gelöscht.',
                ctaEtiketi: 'Synchronisierung einschalten',
                detaylar: [
                    'Mit einem Tippen mit Ihrem Google-Konto verbinden',
                    'Ende-zu-Ende-Verschlüsselung: Nur Sie kennen das Passwort',
                    'Ein versteckter Ordner, der nur der App gehört und in Drive nicht erscheint',
                    'Gebete, Serie und Nachholbuch werden zusammengeführt',
                    'Sie wählen, wie oft und ob nur im WLAN oder beim Laden',
                    'Verbindung jederzeit trennen',
                ],
            },
            fr: {
                baslik: 'Vos données sur tous vos appareils',
                aciklama: 'Conservez vos prières, votre série et votre carnet de rattrapage dans votre propre Google Drive et synchronisez-les avec votre autre téléphone ou votre tablette. Vos données sont chiffrées avec un mot de passe que vous choisissez.',
                detayAciklama: 'Vous connectez votre compte Google d’un seul geste ; l’application ne voit que son propre dossier caché dans Drive, jamais vos fichiers. Vos données sont chiffrées avec votre mot de passe avant de quitter le téléphone ; nous ne connaissons pas ce mot de passe, il est donc important de ne pas l’oublier. Une prière est synchronisée dès que vous la marquez ; vous pouvez aussi choisir une synchronisation toutes les heures ou une fois par jour, seulement en Wi-Fi ou seulement pendant la charge. Quand l’économie d’énergie est activée, la synchronisation attend la charge. Les prières marquées sur deux appareils sont fusionnées ; aucune n’est supprimée.',
                ctaEtiketi: 'Activer la synchronisation',
                detaylar: [
                    'Connexion avec votre compte Google d’un seul geste',
                    'Chiffrement de bout en bout : vous seul connaissez le mot de passe',
                    'Un dossier caché, propre à l’application, invisible dans Drive',
                    'Prières, série et carnet de rattrapage sont fusionnés',
                    'Vous choisissez la fréquence, et si la synchronisation se fait seulement en Wi-Fi ou pendant la charge',
                    'Déconnexion à tout moment',
                ],
            },
            bs: {
                baslik: 'Vaši podaci na svim Vašim uređajima',
                aciklama: 'Čuvajte namaze, niz i evidenciju kada-namaza na vlastitom Google Driveu i sinhronizujte ih s drugim telefonom ili tabletom. Vaši podaci se šifriraju lozinkom koju sami odaberete.',
                detayAciklama: 'Povežite Google račun jednim dodirom; aplikacija vidi samo svoju skrivenu mapu na Driveu, nikada Vaše datoteke. Prije nego što napuste telefon, podaci se šifriraju Vašom lozinkom; ni mi ne znamo lozinku, zato je nemojte zaboraviti. Namaz se sinhronizuje čim ga označite; možete sinhronizovati i svaki sat ili jednom dnevno, samo na Wi-Fi mreži ili samo tokom punjenja. Dok je uključena ušteda baterije, sinhronizacija čeka punjenje. Namazi označeni na dva uređaja se spajaju; nijedan se ne briše.',
                ctaEtiketi: 'Uključite sinhronizaciju',
                detaylar: [
                    'Povezivanje s Google računom jednim dodirom',
                    'Šifriranje s kraja na kraj: lozinku znate samo Vi',
                    'Skrivena mapa koja pripada samo aplikaciji i ne vidi se na Driveu',
                    'Namazi, niz i evidencija kada-namaza se spajaju',
                    'Vi birate učestalost i da li samo na Wi-Fi mreži ili tokom punjenja',
                    'Prekinite vezu kada god želite',
                ],
            },
            ru: {
                baslik: 'Ваши данные на всех устройствах',
                aciklama: 'Храните намазы, серию и журнал каза на своём Google Диске и синхронизируйте их со вторым телефоном или планшетом. Данные шифруются выбранным вами паролем.',
                detayAciklama: 'Подключите аккаунт Google одним нажатием; приложение видит на Диске только свою скрытую папку и никогда не видит ваши файлы. Данные шифруются вашим паролем ещё до того, как покинут телефон; мы тоже не знаем пароль, поэтому не забывайте его. Намаз синхронизируется сразу после отметки; можно также синхронизировать раз в час или раз в день, только по Wi-Fi или только на зарядке. При включённом энергосбережении синхронизация ждёт зарядки. Намазы, отмеченные на двух устройствах, объединяются; ни один не удаляется.',
                ctaEtiketi: 'Включить синхронизацию',
                detaylar: [
                    'Подключение аккаунта Google одним нажатием',
                    'Сквозное шифрование: пароль знаете только вы',
                    'Скрытая папка, которая принадлежит только приложению и не видна на Диске',
                    'Намазы, серия и журнал каза объединяются',
                    'Вы выбираете частоту, а также только Wi-Fi или только зарядку',
                    'Отключиться можно в любой момент',
                ],
            },
            ms: {
                baslik: 'Data anda pada semua peranti anda',
                aciklama: 'Simpan solat, rentetan dan Catatan Qada anda dalam Google Drive anda sendiri dan segerakkan dengan telefon atau tablet anda yang lain. Data anda disulitkan dengan kata laluan pilihan anda.',
                detayAciklama: 'Sambungkan akaun Google anda dengan satu ketikan; aplikasi hanya melihat folder tersembunyinya sendiri dalam Drive, bukan fail anda. Data anda disulitkan dengan kata laluan anda sebelum keluar dari telefon; kami juga tidak mengetahui kata laluan itu, jadi jangan lupakannya. Solat disegerakkan sebaik sahaja anda menandakannya; anda juga boleh menyegerakkan setiap jam atau setiap hari, hanya pada Wi-Fi atau hanya ketika dicas. Apabila penjimat bateri dihidupkan, penyegerakan menunggu sehingga dicas. Solat yang ditandakan pada dua peranti digabungkan; tiada yang dipadam.',
                ctaEtiketi: 'Hidupkan penyegerakan',
                detaylar: [
                    'Sambung dengan akaun Google anda dalam satu ketikan',
                    'Penyulitan hujung ke hujung: hanya anda yang mengetahui kata laluan',
                    'Folder tersembunyi milik aplikasi sahaja yang tidak kelihatan dalam Drive',
                    'Solat, rentetan dan Catatan Qada digabungkan',
                    'Anda memilih kekerapan, dan sama ada hanya pada Wi-Fi atau ketika dicas',
                    'Putuskan sambungan bila-bila masa',
                ],
            },
            ar: {
                baslik: 'بياناتك على كل أجهزتك',
                aciklama: 'حفظ صلواتك وسلسلتك وسجل القضاء في Google Drive الخاص بك، ومزامنتها مع هاتفك الآخر أو جهازك اللوحي. تُشفَّر بياناتك بكلمة مرور تختارها.',
                detayAciklama: 'ربط حساب Google بلمسة واحدة؛ ولا يرى التطبيق في Drive إلا مجلده المخفي الخاص، لا ملفاتك. تُشفَّر بياناتك بكلمة مرورك قبل أن تغادر الهاتف؛ ولا نعرف كلمة المرور نحن أيضًا، فيُرجى عدم نسيانها. تُزامَن الصلاة فور وضع العلامة عليها؛ ويمكن أيضًا المزامنة كل ساعة أو يوميًا، أو عبر Wi-Fi فقط، أو أثناء الشحن فقط. ومع تفعيل توفير البطارية تنتظر المزامنة الشحن. وتُدمج الصلوات المعلَّمة على جهازين؛ ولا يُحذف شيء منها.',
                ctaEtiketi: 'تفعيل المزامنة',
                detaylar: [
                    'الربط بحساب Google بلمسة واحدة',
                    'تشفير من طرف إلى طرف: كلمة المرور لا يعرفها غيرك',
                    'مجلد مخفي خاص بالتطبيق لا يظهر في Drive',
                    'تُدمج الصلوات والسلسلة وسجل القضاء',
                    'اختيار التكرار، وعبر Wi-Fi فقط أو أثناء الشحن',
                    'إلغاء الربط متى شئت',
                ],
            },
            ur: {
                baslik: 'آپ کا ڈیٹا آپ کے تمام آلات پر',
                aciklama: 'اپنی نمازیں، تسلسل اور قضا ریکارڈ اپنے Google Drive میں رکھیں اور دوسرے فون یا ٹیبلیٹ کے ساتھ ہم آہنگ کریں۔ آپ کا ڈیٹا آپ کے چنے ہوئے پاس ورڈ سے خفیہ کیا جاتا ہے۔',
                detayAciklama: 'اپنا Google اکاؤنٹ ایک ٹچ سے جوڑیں؛ ایپ Drive میں صرف اپنا پوشیدہ فولڈر دیکھتی ہے، آپ کی فائلیں کبھی نہیں۔ فون سے نکلنے سے پہلے آپ کا ڈیٹا آپ کے پاس ورڈ سے خفیہ کیا جاتا ہے؛ پاس ورڈ ہمیں بھی معلوم نہیں، اس لیے اسے یاد رکھیں۔ نماز پر نشان لگتے ہی ہم آہنگی ہو جاتی ہے؛ ہر گھنٹے یا روزانہ، صرف Wi-Fi پر یا صرف چارجنگ کے دوران ہم آہنگی بھی منتخب کی جا سکتی ہے۔ بیٹری سیور آن ہو تو ہم آہنگی چارجنگ کا انتظار کرتی ہے۔ دو آلات پر لگے نماز کے نشان یکجا ہو جاتے ہیں؛ کوئی حذف نہیں ہوتا۔',
                ctaEtiketi: 'ہم آہنگی آن کریں',
                detaylar: [
                    'اپنے Google اکاؤنٹ سے ایک ٹچ میں جڑیں',
                    'مکمل خفیہ کاری: پاس ورڈ صرف آپ کو معلوم ہے',
                    'ایک پوشیدہ فولڈر جو صرف ایپ کا ہے اور Drive میں نظر نہیں آتا',
                    'نمازیں، تسلسل اور قضا ریکارڈ یکجا ہوتے ہیں',
                    'کتنی بار ہو، اور صرف Wi-Fi پر یا چارجنگ کے دوران، یہ آپ طے کریں',
                    'جب چاہیں کنکشن ختم کریں',
                ],
            },
            es: {
                baslik: 'Sus datos en todos sus dispositivos',
                aciklama: 'Guarde sus rezos, su racha y su registro de qada en su propio Google Drive y sincronícelos con su otro teléfono o su tableta. Sus datos se cifran con una contraseña que usted elige.',
                detayAciklama: 'Conecte su cuenta de Google con un toque; la aplicación solo ve su propia carpeta oculta en Drive, nunca sus archivos. Sus datos se cifran con su contraseña antes de salir del teléfono; nosotros tampoco conocemos la contraseña, así que no la olvide. Un rezo se sincroniza en cuanto lo marca; también puede sincronizar cada hora o una vez al día, solo con Wi-Fi o solo durante la carga. Con el ahorro de batería activado, la sincronización espera a la carga. Los rezos marcados en dos dispositivos se combinan; no se borra ninguno.',
                ctaEtiketi: 'Activar la sincronización',
                detaylar: [
                    'Conexión con su cuenta de Google en un toque',
                    'Cifrado de extremo a extremo: solo usted conoce la contraseña',
                    'Una carpeta oculta que solo pertenece a la aplicación y no aparece en Drive',
                    'Se combinan los rezos, la racha y el registro de qada',
                    'Usted elige la frecuencia, y si solo con Wi-Fi o durante la carga',
                    'Desconéctese cuando quiera',
                ],
            },
            nl: {
                baslik: 'Uw gegevens op al uw apparaten',
                aciklama: 'Bewaar uw gebeden, reeks en inhaallogboek in uw eigen Google Drive en synchroniseer ze met uw andere telefoon of tablet. Uw gegevens worden versleuteld met een wachtwoord dat u kiest.',
                detayAciklama: 'Koppel uw Google-account met één tik; de app ziet in Drive alleen zijn eigen verborgen map, nooit uw bestanden. Uw gegevens worden met uw wachtwoord versleuteld voordat ze de telefoon verlaten; wij kennen het wachtwoord ook niet, dus vergeet het niet. Een gebed wordt gesynchroniseerd zodra u het markeert; u kunt ook elk uur of elke dag synchroniseren, alleen via wifi of alleen tijdens het opladen. Als energiebesparing aanstaat, wacht synchroniseren tot het opladen. Gebeden die op twee apparaten zijn gemarkeerd, worden samengevoegd; er wordt niets verwijderd.',
                ctaEtiketi: 'Synchroniseren aanzetten',
                detaylar: [
                    'Met één tik koppelen met uw Google-account',
                    'End-to-end-versleuteling: alleen u kent het wachtwoord',
                    'Een verborgen map die alleen van de app is en niet in Drive verschijnt',
                    'Gebeden, reeks en inhaallogboek worden samengevoegd',
                    'U kiest hoe vaak, en of het alleen via wifi of tijdens het opladen gebeurt',
                    'Ontkoppelen wanneer u maar wilt',
                ],
            },
            sq: {
                baslik: 'Të dhënat tuaja në të gjitha pajisjet',
                aciklama: 'Mbajini namazet, serinë dhe Regjistrin e kazave në Google Drive-in tuaj dhe sinkronizojini me telefonin ose tabletin tjetër. Të dhënat enkriptohen me një fjalëkalim që zgjidhni ju.',
                detayAciklama: 'Lidhni llogarinë Google me një prekje; aplikacioni sheh vetëm dosjen e vet të fshehur në Drive, kurrë skedarët tuaj. Të dhënat enkriptohen me fjalëkalimin tuaj para se të dalin nga telefoni; as ne nuk e dimë fjalëkalimin, prandaj mos e harroni. Një namaz sinkronizohet sapo ta shënoni; mund të sinkronizoni edhe çdo orë ose çdo ditë, vetëm me Wi-Fi ose vetëm gjatë karikimit. Kur kursimi i baterisë është aktiv, sinkronizimi pret karikimin. Namazet e shënuara në dy pajisje bashkohen; asnjë nuk fshihet.',
                ctaEtiketi: 'Aktivizoni sinkronizimin',
                detaylar: [
                    'Lidhje me llogarinë Google me një prekje',
                    'Enkriptim nga skaji në skaj: fjalëkalimin e dini vetëm ju',
                    'Një dosje e fshehur që i përket vetëm aplikacionit dhe nuk duket në Drive',
                    'Namazet, seria dhe Regjistri i kazave bashkohen',
                    'Ju zgjidhni sa shpesh dhe nëse vetëm me Wi-Fi ose gjatë karikimit',
                    'Shkëputeni kurdo të doni',
                ],
            },
            hi: {
                baslik: 'आपका डेटा आपके सभी डिवाइसों पर',
                aciklama: 'अपनी नमाज़ें, सिलसिला और क़ज़ा रिकॉर्ड अपने Google Drive में रखें और अपने दूसरे फ़ोन या टैबलेट से सिंक करें। आपका डेटा आपके चुने हुए पासवर्ड से एन्क्रिप्ट होता है।',
                detayAciklama: 'एक टैप में अपना Google अकाउंट जोड़ें; ऐप Drive में सिर्फ़ अपना छिपा हुआ फ़ोल्डर देखता है, आपकी फ़ाइलें कभी नहीं। आपका डेटा फ़ोन से निकलने से पहले आपके पासवर्ड से एन्क्रिप्ट होता है; पासवर्ड हमें भी मालूम नहीं होता, इसलिए इसे न भूलें। नमाज़ पर निशान लगाते ही सिंक हो जाता है; हर घंटे या रोज़ाना, सिर्फ़ Wi-Fi पर या सिर्फ़ चार्जिंग के दौरान भी सिंक किया जा सकता है। बैटरी सेवर चालू हो तो सिंक चार्जिंग का इंतज़ार करता है। दो डिवाइसों पर लगाए गए निशान मिला दिए जाते हैं; कोई मिटाया नहीं जाता।',
                ctaEtiketi: 'सिंक चालू करें',
                detaylar: [
                    'एक टैप में अपने Google अकाउंट से जुड़ें',
                    'शुरू से आख़िर तक एन्क्रिप्शन: पासवर्ड सिर्फ़ आपको मालूम है',
                    'सिर्फ़ ऐप का अपना छिपा हुआ फ़ोल्डर, जो Drive में नहीं दिखता',
                    'नमाज़ें, सिलसिला और क़ज़ा रिकॉर्ड मिला दिए जाते हैं',
                    'कितनी बार, और सिर्फ़ Wi-Fi पर या चार्जिंग के दौरान, यह आपकी पसंद है',
                    'जब चाहें कनेक्शन हटाएं',
                ],
            },
            bn: {
                baslik: 'আপনার সব ডিভাইসে আপনার তথ্য',
                aciklama: 'আপনার নামাজ, ধারাবাহিকতা ও কাযা খাতা নিজের Google Drive-এ রাখুন এবং অন্য ফোন বা ট্যাবলেটের সাথে সিঙ্ক করুন। আপনার তথ্য আপনার বেছে নেওয়া পাসওয়ার্ড দিয়ে এনক্রিপ্ট করা হয়।',
                detayAciklama: 'এক ট্যাপে আপনার Google অ্যাকাউন্ট যুক্ত করুন; অ্যাপ Drive-এ শুধু নিজের লুকানো ফোল্ডার দেখে, কখনো আপনার ফাইল নয়। ফোন থেকে বের হওয়ার আগে আপনার তথ্য আপনার পাসওয়ার্ড দিয়ে এনক্রিপ্ট হয়; পাসওয়ার্ড আমরাও জানি না, তাই ভুলবেন না। নামাজ চিহ্নিত করলেই সিঙ্ক হয়; চাইলে প্রতি ঘণ্টায় বা প্রতিদিন, শুধু Wi-Fi-তে বা শুধু চার্জে থাকার সময়ও সিঙ্ক করতে পারেন। ব্যাটারি সেভার চালু থাকলে সিঙ্ক চার্জের অপেক্ষা করে। দুই ডিভাইসে চিহ্নিত নামাজ মিলিয়ে নেওয়া হয়; কোনোটিই মোছা হয় না।',
                ctaEtiketi: 'সিঙ্ক চালু করুন',
                detaylar: [
                    'এক ট্যাপে Google অ্যাকাউন্ট দিয়ে যুক্ত করুন',
                    'এন্ড-টু-এন্ড এনক্রিপশন: পাসওয়ার্ড শুধু আপনিই জানেন',
                    'শুধু অ্যাপের নিজস্ব একটি লুকানো ফোল্ডার, যা Drive-এ দেখা যায় না',
                    'নামাজ, ধারাবাহিকতা ও কাযা খাতা মিলিয়ে নেওয়া হয়',
                    'কতবার সিঙ্ক হবে, শুধু Wi-Fi-তে নাকি চার্জে থাকার সময়, তা আপনি বেছে নেন',
                    'যখন খুশি সংযোগ বিচ্ছিন্ন করুন',
                ],
            },
            fa: {
                baslik: 'داده‌های شما روی همهٔ دستگاه‌هایتان',
                aciklama: 'نمازها، زنجیره و دفتر قضای خود را در Google Drive خودتان نگه دارید و با تلفن یا تبلت دیگرتان همگام کنید. داده‌های شما با رمزی که خودتان انتخاب می‌کنید رمزگذاری می‌شوند.',
                detayAciklama: 'حساب Google خود را با یک ضربه وصل کنید؛ برنامه در Drive فقط پوشهٔ پنهان خودش را می‌بیند، هرگز فایل‌های شما را نه. داده‌های شما پیش از بیرون رفتن از تلفن با رمزتان رمزگذاری می‌شوند؛ ما هم رمز را نمی‌دانیم، پس فراموشش نکنید. نماز همین که علامت بزنید همگام می‌شود؛ می‌توانید ساعتی یا روزانه، فقط با Wi-Fi یا فقط هنگام شارژ هم همگام کنید. وقتی صرفه‌جویی باتری روشن است، همگام‌سازی منتظر شارژ می‌ماند. نمازهایی که روی دو دستگاه علامت خورده‌اند ادغام می‌شوند؛ هیچ‌کدام پاک نمی‌شود.',
                ctaEtiketi: 'روشن کردن همگام‌سازی',
                detaylar: [
                    'اتصال با حساب Google در یک ضربه',
                    'رمزگذاری سرتاسری: فقط شما رمز را می‌دانید',
                    'پوشه‌ای پنهان که فقط از آنِ برنامه است و در Drive دیده نمی‌شود',
                    'نمازها، زنجیره و دفتر قضا ادغام می‌شوند',
                    'شما انتخاب می‌کنید چند وقت یک بار، و اینکه فقط با Wi-Fi یا هنگام شارژ',
                    'هر وقت بخواهید اتصال را قطع کنید',
                ],
            },
            ps: {
                baslik: 'ستاسو معلومات ستاسو په ټولو وسیلو کې',
                aciklama: 'خپل لمونځونه، لړۍ او د قضا دفتر په خپل Google Drive کې وساتئ او له خپل بل موبایل یا ټابلېټ سره یې همغږي کړئ. ستاسو معلومات ستاسو د ټاکلي پاسورډ په مرسته کوډ کېږي.',
                detayAciklama: 'خپل Google حساب په یوه کېکاږلو وصل کړئ؛ اپ په Drive کې یوازې خپله پټه پوښۍ ویني، هېڅکله ستاسو فایلونه نه. ستاسو معلومات له موبایل څخه له وتلو مخکې ستاسو په پاسورډ کوډ کېږي؛ موږ هم پاسورډ نه پېژنو، نو هېر یې نه کړئ. یو لمونځ چې نښه یې کړئ سمدستي همغږي کېږي؛ کولای شئ هر ساعت یا هره ورځ، یوازې په Wi-Fi کې یا یوازې د چارج پر مهال همغږي کړئ. کله چې د بیټرۍ سپما فعاله وي، همغږي کول چارج ته انتظار باسي. هغه لمونځونه چې په دوو وسیلو کې نښه شوي یوځای کېږي؛ هېڅ یو نه ړنګېږي.',
                ctaEtiketi: 'همغږي کول فعال کړئ',
                detaylar: [
                    'په یوه کېکاږلو له خپل Google حساب سره وصل شئ',
                    'له پیل تر پایه کوډ کول: یوازې تاسو پاسورډ پېژنئ',
                    'یوه پټه پوښۍ چې یوازې د اپ ده او په Drive کې نه ښکاري',
                    'لمونځونه، لړۍ او د قضا دفتر یوځای کېږي',
                    'تاسو ټاکئ چې څو ځله، او ایا یوازې په Wi-Fi کې یا د چارج پر مهال',
                    'هر وخت چې وغواړئ اړیکه یې پرې کړئ',
                ],
            },
            ckb: {
                baslik: 'زانیارییەکانتان لەسەر ھەموو ئامێرەکانتان',
                aciklama: 'نوێژەکان، زنجیرە و دەفتەری قەزاکەتان لە Google Drive ی خۆتاندا ھەڵبگرن و لەگەڵ مۆبایل یان تابلێتەکەی ترتان ھاوکاتیان بکەن. زانیارییەکانتان بە وشەی نھێنییەک کە خۆتان ھەڵیدەبژێرن کۆد دەکرێن.',
                detayAciklama: 'بە یەک دەستلێدان ھەژماری Google ەکەتان ببەستن؛ ئەپەکە تەنیا بوخچە شاراوەکەی خۆی لە Drive دا دەبینێت، ھەرگیز فایلەکانتان نابینێت. زانیارییەکانتان پێش ئەوەی لە مۆبایلەکە دەربچن بە وشەی نھێنییەکەتان کۆد دەکرێن؛ ئێمەش وشەی نھێنییەکە نازانین، بۆیە لە بیرتان نەچێت. نوێژێک ھەر کە نیشانەی دەکەن ھاوکات دەکرێت؛ دەتوانن کاتژمێرانە یان ڕۆژانەش ھاوکاتی بکەن، تەنیا لەسەر Wi-Fi یان تەنیا لە کاتی بارگەکردندا. تا پاشەکەوتی پاتری چالاکە، ھاوکاتکردن چاوەڕێی بارگەکردن دەکات. ئەو نوێژانەی لەسەر دوو ئامێر نیشانە کراون تێکەڵ دەکرێن؛ ھیچیان ناسڕدرێتەوە.',
                ctaEtiketi: 'چالاککردنی ھاوکاتکردن',
                detaylar: [
                    'بە یەک دەستلێدان بە ھەژماری Google ەکەتان ببەستنەوە',
                    'کۆدکردنی سەرتاسەری: تەنیا خۆتان وشەی نھێنییەکە دەزانن',
                    'بوخچەیەکی شاراوە کە تەنیا ھی ئەپەکەیە و لە Drive دا دەرناکەوێت',
                    'نوێژەکان، زنجیرە و دەفتەری قەزا تێکەڵ دەکرێن',
                    'خۆتان ھەڵدەبژێرن چەند جار، و ئایا تەنیا لەسەر Wi-Fi یان لە کاتی بارگەکردندا',
                    'ھەر کاتێک بتانەوێت پەیوەندییەکە بپچڕێنن',
                ],
            },
            ug: {
                baslik: 'سانلىق مەلۇماتلىرىڭىز ھەممە ئۈسكۈنىڭىزدە',
                aciklama: 'ئوقۇغان نامازلىرىڭىز، ئۇدا كۈنلىرىڭىز ۋە قازا خاتىرىڭىزنى ئۆزىڭىزنىڭ Google Drive دا ساقلاپ، باشقا تېلېفونىڭىز ياكى تاختا كومپيۇتېرىڭىز بىلەن قەدەمداشلىيالايسىز. سانلىق مەلۇماتلىرىڭىز ئۆزىڭىز بەلگىلىگەن پارول بىلەن شىفىرلىنىدۇ.',
                detayAciklama: 'Google ھېساباتىڭىزنى بىر چېكىش بىلەنلا ئۇلايسىز؛ ئەپ Drive دىكى پەقەت ئۆزىنىڭ يوشۇرۇن قىسقۇچىنىلا كۆرىدۇ، ھۆججەتلىرىڭىزنى ھەرگىز كۆرمەيدۇ. سانلىق مەلۇماتلىرىڭىز تېلېفوندىن چىقىشتىن بۇرۇن پارولىڭىز بىلەن شىفىرلىنىدۇ؛ پارولنى بىزمۇ بىلمەيمىز، شۇڭا ئۇنتۇپ قالماڭ. بىر نامازنى بەلگىلىشىڭىز بىلەنلا قەدەمداشلىنىدۇ؛ خالىسىڭىز سائەتتە ياكى كۈندە بىر قېتىم، پەقەت Wi-Fi دا ياكى پەقەت توك قاچىلاۋاتقاندا قەدەمداشلاشنى تاللىيالايسىز. توك تېجەش ئوچۇق بولسا، قەدەمداشلاش توك قاچىلاشنى كۈتىدۇ. ئىككى ئۈسكۈنىدە بەلگىلىگەن نامازلار بىرلەشتۈرۈلىدۇ، ھېچبىرى ئۆچۈرۈلمەيدۇ.',
                ctaEtiketi: 'قەدەمداشلاشنى ئېچىڭ',
                detaylar: [
                    'Google ھېساباتى بىلەن بىر چېكىشتە ئۇلىنىش',
                    'ئۇچتىن ئۇچقىچە شىفىرلاش: پارولنى پەقەت سىز بىلىسىز',
                    'Drive دا كۆرۈنمەيدىغان، پەقەت ئەپكە تەۋە قىسقۇچ',
                    'ئوقۇلغان نامازلار، ئۇدا كۈنلەر ۋە قازا خاتىرىسى بىرلەشتۈرۈلىدۇ',
                    'قانچىلىك دائىم، پەقەت Wi-Fi دا ياكى توك قاچىلاۋاتقاندا بولۇشىنى ئۆزىڭىز تاللايسىز',
                    'خالىغان ۋاقىتتا ئۇلىنىشنى ئۈزەلەيسىز',
                ],
            },
            az: {
                baslik: 'Məlumatlarınız bütün cihazlarınızda',
                aciklama: 'Namazlarınızı, seriyanızı və Qəza dəftərinizi öz Google Drive hesabınızda saxlayın və digər telefonunuz və ya planşetinizlə sinxronlaşdırın. Məlumatlarınız seçdiyiniz parolla şifrələnir.',
                detayAciklama: 'Google hesabınızı bir toxunuşla qoşun; tətbiq Drive-da yalnız öz gizli qovluğunu görür, fayllarınızı heç vaxt görmür. Məlumatlarınız telefondan çıxmazdan əvvəl parolunuzla şifrələnir; parolu biz də bilmirik, ona görə onu unutmayın. Namaz qeyd edən kimi sinxronlaşdırılır; həmçinin saatda və ya gündə bir dəfə, yalnız Wi-Fi şəbəkəsində və ya yalnız şarj olunarkən sinxronlaşdıra bilərsiniz. Enerjiyə qənaət açıq olanda sinxronlaşma şarja qoşulmağı gözləyir. İki cihazda qeyd olunan namazlar birləşdirilir; heç biri silinmir.',
                ctaEtiketi: 'Sinxronlaşmanı açın',
                detaylar: [
                    'Google hesabınızla bir toxunuşla qoşulun',
                    'Uçdan-uca şifrələmə: parolu yalnız siz bilirsiniz',
                    'Yalnız tətbiqə aid olan və Drive-da görünməyən gizli qovluq',
                    'Namazlar, seriya və Qəza dəftəri birləşdirilir',
                    'Nə qədər tez-tez, yalnız Wi-Fi şəbəkəsində və ya şarj olunarkən olacağını siz seçirsiniz',
                    'İstədiyiniz vaxt əlaqəni kəsin',
                ],
            },
            uz: {
                baslik: 'Маълумотларингиз барча қурилмаларингизда',
                aciklama: 'Ўқиган намозларингиз, кетма-кетлик ва Қазо дафтарингизни ўз Google Drive хотирангизда сақлаб, бошқа телефонингиз ёки планшетингиз билан синхронланг. Маълумотларингиз сиз танлаган парол билан шифрланади.',
                detayAciklama: 'Google ҳисобингизни бир босишда уланг; илова Drive’да фақат ўзининг яширин жилдини кўради, файлларингизга кира олмайди. Маълумотларингиз телефондан чиқишидан олдин паролингиз билан шифрланади; паролни биз ҳам билмаймиз, шунинг учун уни унутманг. Намозни белгилашингиз билан у синхронланади; истасангиз, соатига ёки кунига бир марта, фақат Wi-Fi орқали ёки фақат зарядланаётганда синхронлашни танлашингиз мумкин. Қувватни тежаш ёниқ бўлса, синхронлаш зарядланишни кутади. Икки қурилмада белгиланган намозлар бирлаштирилади; ҳеч бири ўчирилмайди.',
                ctaEtiketi: 'Синхронлашни ёқиш',
                detaylar: [
                    'Google ҳисоби билан бир босишда уланиш',
                    'Бошидан охиригача шифрлаш: паролни фақат сиз биласиз',
                    'Drive’да кўринмайдиган, фақат иловага тегишли жилд',
                    'Намозлар, кетма-кетлик ва Қазо дафтари бирлаштирилади',
                    'Қанчалик тез-тез, фақат Wi-Fi орқали ёки зарядланаётганда эканлигини ўзингиз танлайсиз',
                    'Истаган вақт узишингиз мумкин',
                ],
            },
            kk: {
                baslik: 'Деректеріңіз барлық құрылғыларыңызда',
                aciklama: 'Оқыған намаздарыңызды, серия мен қаза дәптеріңізді өз Google Drive кеңістігіңізде сақтап, басқа телефоныңызбен немесе планшетіңізбен синхрондай аласыз. Деректер сіз белгілеген құпиясөзбен шифрланады.',
                detayAciklama: 'Google тіркелгіңізді бір түртумен қосасыз; қолданба Drive-тағы тек өз жасырын қалтасын көреді, файлдарыңызға қол жеткізбейді. Деректеріңіз телефоннан шықпас бұрын сіздің құпиясөзіңізбен шифрланады; құпиясөзді біз де білмейміз, сондықтан оны ұмытпау маңызды. Намазды белгілегенде ол бірден синхрондалады; қаласаңыз, сағат сайын немесе күніне бір рет, тек Wi-Fi арқылы немесе тек зарядталып тұрғанда синхрондауды таңдай аласыз. Қуат үнемдеу қосулы кезде синхрондау зарядты күтеді. Екі құрылғыда белгіленген намаздар біріктіріледі, ешқайсысы жойылмайды.',
                ctaEtiketi: 'Синхрондауды қосу',
                detaylar: [
                    'Google тіркелгісімен бір түртумен қосылу',
                    'Толық шифрлау: құпиясөз тек сізде',
                    'Drive-та көрінбейтін, тек қолданбаға тиесілі қалта',
                    'Оқылған намаздар, серия және қаза дәптері біріктіріледі',
                    'Жиілігін, Wi-Fi мен заряд шартын өзіңіз таңдайсыз',
                    'Байланысты кез келген уақытта ажырата аласыз',
                ],
            },
            ky: {
                baslik: 'Маалыматыңыз бардык түзмөктөрүңүздө',
                aciklama: 'Намаздарыңызды, катарыңызды жана Каза дептериңизди өзүңүздүн Google Drive сактагычыңызда сактап, башка телефонуңуз же планшетиңиз менен шайкештириңиз. Маалыматыңыз сиз тандаган сырсөз менен шифрленет.',
                detayAciklama: "Google аккаунтуңузду бир басуу менен туташтырыңыз; колдонмо Drive'да өзүнүн жашыруун папкасын гана көрөт, сиздин файлдарыңызды эч качан көрбөйт. Маалыматыңыз телефондон чыкканга чейин сырсөзүңүз менен шифрленет; сырсөздү биз да билбейбиз, ошондуктан аны унутпаңыз. Намаз белгилениши менен шайкештирилет; саат сайын же күн сайын, Wi-Fi аркылуу гана же кубатталып жатканда гана шайкештирсеңиз да болот. Батареяны үнөмдөө күйүк болсо, шайкештирүү кубаттоону күтөт. Эки түзмөктө белгиленген намаздар бириктирилет; эч бири өчүрүлбөйт.",
                ctaEtiketi: 'Шайкештирүүнү күйгүзүү',
                detaylar: [
                    'Google аккаунтуңуз менен бир басууда туташуу',
                    'Башынан аягына чейин шифрлөө: сырсөздү сиз гана билесиз',
                    "Колдонмого гана таандык, Drive'да көрүнбөгөн жашыруун папка",
                    'Намаздар, катар жана Каза дептери бириктирилет',
                    'Канчалык тез-тез шайкештирүүнү, Wi-Fi аркылуу гана же кубатталганда гана экенин өзүңүз тандайсыз',
                    'Каалаган убакта ажыратыңыз',
                ],
            },
            tg: {
                baslik: 'Маълумоти Шумо дар ҳамаи дастгоҳҳоятон',
                aciklama: 'Намозҳо, силсила ва Дафтари қазоро дар Google Drive-и худатон нигоҳ доред ва бо телефон ё планшети дигаратон ҳамоҳанг кунед. Маълумоти Шумо бо пароле, ки интихоб мекунед, рамзгузорӣ мешавад.',
                detayAciklama: 'Ҳисоби Google-и худро бо як ламс пайваст кунед; барнома дар Drive танҳо ҷузвдони пинҳонии худро мебинад, на файлҳои Шуморо. Маълумот пеш аз баромадан аз телефон бо пароли Шумо рамзгузорӣ мешавад; паролро мо ҳам намедонем, бинобар ин онро фаромӯш накунед. Намоз ҳамин ки қайд шуд, ҳамоҳанг мешавад; инчунин метавонед ҳар соат ё ҳар рӯз, танҳо дар Wi-Fi ё танҳо ҳангоми пуршавӣ ҳамоҳанг кунед. Ҳангоми фаъол будани сарфаи нерӯ ҳамоҳангсозӣ то пуршавӣ интизор мешавад. Намозҳое, ки дар ду дастгоҳ қайд шудаанд, муттаҳид мешаванд; ҳеҷ кадом нест намешавад.',
                ctaEtiketi: 'Ҳамоҳангсозиро фаъол кунед',
                detaylar: [
                    'Бо ҳисоби Google бо як ламс пайваст шавед',
                    'Рамзгузории пурра: паролро танҳо Шумо медонед',
                    'Ҷузвдони пинҳоние, ки танҳо ба барнома тааллуқ дорад ва дар Drive намоён нест',
                    'Намозҳо, силсила ва Дафтари қазо муттаҳид мешаванд',
                    'Басомадро худатон интихоб мекунед, инчунин танҳо дар Wi-Fi ё ҳангоми пуршавӣ',
                    'Ҳар вақт ки хоҳед, қатъ кунед',
                ],
            },
            sw: {
                baslik: 'Data yako kwenye vifaa vyako vyote',
                aciklama: 'Hifadhi Swala zako, mfululizo na Daftari la Qadha kwenye Google Drive yako mwenyewe na uzisawazishe na simu yako nyingine au kompyuta kibao. Data yako inasimbwa kwa nenosiri unalochagua.',
                detayAciklama: 'Unganisha akaunti yako ya Google kwa kugusa mara moja; programu inaona folda yake iliyofichwa tu katika Drive, kamwe si faili zako. Data yako inasimbwa kwa nenosiri lako kabla ya kutoka kwenye simu; sisi pia hatulijui nenosiri, kwa hivyo usilisahau. Swala inasawazishwa mara unapoiwekea alama; unaweza pia kusawazisha kila saa au kila siku, kwenye Wi-Fi tu au ikichajiwa tu. Kiokoa betri kikiwa kimewashwa, usawazishaji unasubiri kuchaji. Swala zilizowekwa alama kwenye vifaa viwili zinaunganishwa; hakuna inayofutwa.',
                ctaEtiketi: 'Washa usawazishaji',
                detaylar: [
                    'Unganisha na akaunti yako ya Google kwa kugusa mara moja',
                    'Usimbaji kutoka mwanzo hadi mwisho: wewe tu unajua nenosiri',
                    'Folda iliyofichwa ambayo ni ya programu tu na haionekani katika Drive',
                    'Swala, mfululizo na Daftari la Qadha zinaunganishwa',
                    'Unachagua mara ngapi, na kama ni kwenye Wi-Fi tu au ikichajiwa',
                    'Tenganisha wakati wowote unapotaka',
                ],
            },
            ha: {
                baslik: 'Bayananku a duk naʼurorinku',
                aciklama: 'Ku ajiye sallolinku, jeri da Littafin ramuwa a Google Drive ɗinku na kanku ku daidaita su da wata wayarku ko kwamfutar hannu. Ana ɓoye bayananku da kalmar sirrin da kuka zaɓa.',
                detayAciklama: 'Ku haɗa asusun Google ɗinku da taɓawa ɗaya; manhajar tana ganin ɓoyayyen babinta a Drive kaɗai, ba fayilolinku ba. Ana ɓoye bayananku da kalmar sirrinku kafin su bar wayar; mu ma ba mu san kalmar sirrin ba, don haka kada ku manta da ita. Salla tana daidaitawa da zarar kun yi mata alama; kuna kuma iya daidaitawa kowace awa ko kowace rana, a Wi-Fi kaɗai ko lokacin caji kaɗai. Idan ajiye batir yana kunne, daidaitawa tana jiran caji. Ana haɗa sallolin da aka yi wa alama a naʼurori biyu; ba a share ko ɗaya.',
                ctaEtiketi: 'Kunna daidaitawa',
                detaylar: [
                    'Haɗawa da asusun Google ɗinku da taɓawa ɗaya',
                    'Ɓoyewa daga farko har ƙarshe: ku kaɗai kuka san kalmar sirri',
                    'Ɓoyayyen babi na manhajar kaɗai wanda ba ya bayyana a Drive',
                    'Ana haɗa salloli, jeri da Littafin ramuwa',
                    'Ku ne kuke zaɓar sau nawa, da ko a Wi-Fi kaɗai ko lokacin caji',
                    'Ku cire haɗin a duk lokacin da kuke so',
                ],
            },
            am: {
                baslik: 'መረጃዎ በሁሉም መሣሪያዎችዎ ላይ',
                aciklama: 'ሶላቶችዎን፣ ተከታታይነትዎን እና የቀዷእ መዝገብዎን በራስዎ Google Drive ውስጥ ያስቀምጡ፤ ከሌላው ስልክዎ ወይም ታብሌትዎ ጋር ያመሳስሏቸው። መረጃዎ በመረጡት የይለፍ ቃል ይመሰጠራል።',
                detayAciklama: 'የGoogle መለያዎን በአንድ ንክኪ ያገናኙ፤ መተግበሪያው በDrive ውስጥ የሚያየው የራሱን የተደበቀ አቃፊ ብቻ ነው እንጂ ፋይሎችዎን በፍጹም አያይም። መረጃዎ ከስልኩ ከመውጣቱ በፊት በይለፍ ቃልዎ ይመሰጠራል፤ የይለፍ ቃሉን እኛም አናውቀውም፤ ስለዚህ አይርሱት። ሶላት ምልክት እንዳደረጉበት ወዲያውኑ ይመሳሰላል፤ በየሰዓቱ ወይም በየቀኑ፣ በWi-Fi ላይ ብቻ ወይም ኃይል ሲሞላ ብቻ ማመሳሰልም ይችላሉ። ባትሪ ቆጣቢ ሲበራ ማመሳሰሉ ኃይል እስኪሞላ ይጠብቃል። በሁለት መሣሪያዎች ላይ ምልክት የተደረገባቸው ሶላቶች ይዋሃዳሉ፤ አንዳቸውም አይሰረዙም።',
                ctaEtiketi: 'ማመሳሰልን አብራ',
                detaylar: [
                    'በGoogle መለያዎ በአንድ ንክኪ ይገናኙ',
                    'ከጫፍ እስከ ጫፍ ምስጠራ፦ የይለፍ ቃሉን የሚያውቁት እርስዎ ብቻ ነዎት',
                    'የመተግበሪያው ብቻ የሆነ እና በDrive ውስጥ የማይታይ የተደበቀ አቃፊ',
                    'ሶላቶች፣ ተከታታይነት እና የቀዷእ መዝገብ ይዋሃዳሉ',
                    'ምን ያህል ጊዜ እንደሆነ፣ እንዲሁም በWi-Fi ላይ ብቻ ወይም ኃይል ሲሞላ ብቻ መሆኑን እርስዎ ይመርጣሉ',
                    'በፈለጉት ጊዜ ግንኙነቱን ያቋርጡ',
                ],
            },
            om: {
                baslik: 'Odeeffannoo keessan meeshaalee keessan hunda irratti',
                aciklama: "Salaata, walitti fufiinsaafi galmee qadaa keessan Google Drive keessan ofii keessatti kaa'aatii bilbila ykn taabletii keessan biraa wajjin walsimsiisaa. Odeeffannoon keessan jecha darbii isin filattaniin iccitiin eegama.",
                detayAciklama: "Herrega Google keessanii tuqaa tokkoon walqabsiisaa; appichi kuusaa dhokataa ofii isaa Drive keessa jiru qofa arga, faayiloota keessan gonkumaa hin argu. Odeeffannoon keessan osoo bilbila irraa hin ba'in jecha darbii keessaniin iccitiin eegama; nuunis jecha darbii hin beeknu, kanaaf hin dagatinaa. Salaanni akkuma mallatteessitaniin walsimsiifama; sa'aatiitti ykn guyyaatti, Wi-Fi irratti qofa ykn yeroo chaarjii irra jiru qofa walsimsiisuus dandeessu. Yeroo qusannaan baatirii banaa ta'e, walsimsiisni chaarjii eega. Salaanni meeshaalee lama irratti mallattaa'e walitti makama; tokkollee hin haqamu.",
                ctaEtiketi: 'Walsimsiisa banaa',
                detaylar: [
                    'Tuqaa tokkoon herrega Google keessaniin walqabsiisaa',
                    'Iccitii jalqabaa hanga dhumaatti: jecha darbii isin qofatu beeka',
                    "Kuusaa dhokataa kan appichaa qofa ta'eefi Drive keessatti hin mul'anne",
                    'Salaanni, walitti fufiinsiifi galmeen qadaa walitti makamu',
                    "Hammam yeroo akka ta'u, akkasumas Wi-Fi irratti qofa ykn yeroo chaarjii irra jiru qofa ta'uu isin filattu",
                    'Yeroo barbaaddan walqunnamtii addaan kutaa',
                ],
            },
            so: {
                baslik: 'Xogtaada dhammaan qalabkaaga',
                aciklama: 'Salaadahaaga, taxanahaaga iyo Buugga qadaa ku hay Google Drive-kaaga oo la isku waafaji taleefankaaga kale ama taabletkaaga. Xogtaada waxaa lagu xiraa fure sir ah oo aad adigu doorato.',
                detayAciklama: 'Ku xir akoonkaaga Google hal taabasho; barnaamijku wuxuu arkaa oo kaliya galkiisa qarsoon ee Drive, marnaba faylashaada. Xogtaada waxaa lagu xiraa furahaaga sirta ah ka hor inta aysan ka bixin taleefanka; anaguna ma naqaanno furaha, sidaas darteed ha illoobin. Salaaddu waxay isku waafaqdaa isla marka aad calaamadeyso; waxaad sidoo kale isku waafajin kartaa saacad kasta ama maalin kasta, Wi-Fi oo kaliya ama inta la dallacayo oo kaliya. Marka badbaadinta batarigu shidan tahay, isku-waafajintu waxay sugtaa dallacaadda. Salaadaha lagu calaamadeeyay laba qalab waa la isku daraa; midna lama tirtiro.',
                ctaEtiketi: 'Shid isku-waafajinta',
                detaylar: [
                    'Ku xir akoonkaaga Google hal taabasho',
                    'Sir-xir dhammaystiran: adiga kaliya ayaa yaqaan furaha',
                    'Gal qarsoon oo barnaamijka oo kaliya leeyahay oo aan ka muuqan Drive',
                    'Salaadaha, taxanaha iyo Buugga qadaa waa la isku daraa',
                    'Adiga ayaa dooranaya inta jeer, iyo inay tahay Wi-Fi oo kaliya ama inta la dallacayo',
                    'Ka goo xiriirka goor kasta oo aad rabto',
                ],
            },
            ff: {
                baslik: 'Keɓe mon e kaɓirɗe mon fow',
                aciklama: 'Mooftee juulɗe mon, jokkondiral e Deftere qadaa e Google Drive mon e hoore mon, fotondiron ɗe e talifon walla tabletel mon goɗngal. Keɓe mon hino sirlinee e finnde nde on suɓi.',
                detayAciklama: 'Jokkondiree konte Google mon e dobol gootol; jaaɓngal ngal hino yiya tan doosiye mum suuɗiiɗo e Drive, wonaa fiilde mon. Keɓe mon hino sirlinee e finnde mon adii yaltude talifon; min anndaa finnde ndee kadi, ɗum noon wota yejjit ndee. Juulde hino fotondiree tuma maandinu-ɗon nde; hiɗon mbaawi kadi fotondirde saa’i kala walla ñalawma kala, e Wi-Fi tan walla tuma hino sarsee tan. Tuma reenugol battiri huɓɓinaa, fotondirde hino sabba sarsugol. Juulɗe maandinaaɗe e kaɓirɗe ɗiɗi hino hawrinee; hay wootere momtotaake.',
                ctaEtiketi: 'Huɓɓinee fotondirde',
                detaylar: [
                    'Jokkondiree e konte Google mon e dobol gootol',
                    'Sirlingol gila fuɗɗorde haa gasirde: onon tan anndi finnde ndee',
                    'Doosiye suuɗiiɗo jaaɓngal ngal tan, mo ɓanngataa e Drive',
                    'Juulɗe, jokkondiral e Deftere qadaa hino hawrinee',
                    'Ko onon suɓata no heewiri, e so ko e Wi-Fi tan walla tuma hino sarsee',
                    'Taƴee jokkondiral ngal sahaa kala ɗo njiɗ-ɗon',
                ],
            },
            yo: {
                baslik: 'Dátà yín lórí gbogbo ẹ̀rọ yín',
                aciklama: 'Ẹ tọ́jú àwọn ìrun, ìtẹ̀léra àti Àkọsílẹ̀ Ƙaḍā’ yín sínú Google Drive tiyín, kí ẹ sì bá wọn mu pẹ̀lú fóònù tàbí tablẹ́ẹ̀tì yín mìíràn. A ń fi ọ̀rọ̀ aṣínà tí ẹ yàn dì dátà yín ní ìpamọ́.',
                detayAciklama: 'Ẹ so àkáǹtì Google yín pọ̀ pẹ̀lú ìtẹ̀ kan; ìṣàfilọ́lẹ̀ ń rí fóldà ìpamọ́ tirẹ̀ nìkan nínú Drive, kì í rí àwọn fáìlì yín láéláé. A ń fi ọ̀rọ̀ aṣínà yín dì dátà yín ní ìpamọ́ kí ó tó kúrò lórí fóònù; àwa náà kò mọ ọ̀rọ̀ aṣínà náà, nítorí náà ẹ má gbàgbé rẹ̀. Ìrun kan ń bá a mu ní kété tí ẹ bá sàmì sí i; ẹ tún lè bá a mu ní wákàtí kọ̀ọ̀kan tàbí lójoojúmọ́, lórí Wi-Fi nìkan tàbí nígbà tí ẹ̀rọ bá ń gba agbára nìkan. Nígbà tí ìfipamọ́ bátírì bá wà ní títàn, ìbámu yóò dúró de ìgbà tí ẹ̀rọ bá ń gba agbára. A ń pa àwọn ìrun tí a sàmì sí lórí ẹ̀rọ méjì pọ̀; a kì í pa èyíkéyìí rẹ́.',
                ctaEtiketi: 'Tan ìbámu',
                detaylar: [
                    'Ẹ so pọ̀ mọ́ àkáǹtì Google yín pẹ̀lú ìtẹ̀ kan',
                    'Ìpamọ́ láti òpin dé òpin: ẹ̀yin nìkan ni ẹ mọ ọ̀rọ̀ aṣínà',
                    'Fóldà ìpamọ́ tí ó jẹ́ ti ìṣàfilọ́lẹ̀ nìkan, tí kì í hàn nínú Drive',
                    'A ń pa àwọn ìrun, ìtẹ̀léra àti Àkọsílẹ̀ Ƙaḍā’ pọ̀',
                    'Ẹ̀yin ni ẹ ó yan ìgbàkúgbà, àti bóyá lórí Wi-Fi nìkan tàbí nígbà tí ẹ̀rọ bá ń gba agbára',
                    'Ẹ lè já ìsopọ̀ nígbàkúùgbà tí ẹ bá fẹ́',
                ],
            },
        },
    },
    // Cihaz ağı: telefon ↔ tablet "Kıldım" eşitlemesi (olay günlüğü, yerel ağ).
    {
        id: 'cihaz-agi-tablet',
        platformlar: ['android', 'ios'],
        surum: '0.60.0',
        tarih: '2026-10-21',
        baslik: 'Telefon ve tablet birlikte',
        aciklama:
            'Tabletinizi telefonunuza ekleyin: birinde işaretlediğiniz namaz öbürüne de geçer. Hesap yok, sunucu yok; yalnız evinizin Wi-Fi ağı.',
        detayAciklama:
            'Cihazlarım › Tablet ya da telefon ekleyin: bir cihazda kod gösterin, öbüründe okutun; iki ekranda da onay istenir. Aynı Wi-Fi’de ve iki cihazda da uygulama açıkken namaz hemen geçer; değilse ikisi bir sonraki kez birlikte açık olduğunda.',
        detaylar: [
            'İki ekranda onaylı, şifreli eşleştirme',
            'Kıldım her iki cihazda da işaretlenir',
            'İstediğiniz an iki taraftan da kaldırın',
        ],
        ikon: 'tablet-alt',
        hedefSayfa: 'CihazEkle',
        ctaEtiketi: 'Cihaz ekleyin',
        ceviri: {
            en: {
                baslik: 'Phone and tablet together',
                aciklama:
                    'Add your tablet to your phone: a prayer you mark on one is marked on the other. No account, no server; just your home Wi-Fi.',
                detayAciklama:
                    'My devices › Add a tablet or phone: show a code on one device and scan it on the other; both screens ask for approval. On the same Wi-Fi with the app open on both, a prayer passes over right away; otherwise the next time both are open together.',
                ctaEtiketi: 'Add a device',
                detaylar: [
                    'Encrypted pairing approved on both screens',
                    "I've prayed is marked on both devices",
                    'Remove it from either side at any time',
                ],
            },
            id: {
                baslik: 'Ponsel dan tablet bersama',
                aciklama: 'Hubungkan tablet dengan ponsel Anda: salat yang Anda tandai di satu perangkat juga tertandai di perangkat lainnya. Tanpa akun, tanpa server; cukup Wi-Fi rumah Anda.',
                detayAciklama: 'Perangkat saya › Tambahkan tablet atau ponsel: tampilkan kode di satu perangkat dan pindai dengan perangkat lainnya; kedua layar meminta persetujuan. Jika berada di Wi-Fi yang sama dan aplikasi terbuka di keduanya, salat langsung berpindah; jika tidak, saat keduanya terbuka bersamaan berikutnya.',
                ctaEtiketi: 'Tambahkan perangkat',
                detaylar: [
                    'Pemasangan terenkripsi yang disetujui di kedua layar',
                    'Sudah salat tertandai di kedua perangkat',
                    'Hapus dari sisi mana pun kapan saja',
                ],
            },
            de: {
                baslik: 'Telefon und Tablet zusammen',
                aciklama: 'Fügen Sie Ihr Tablet Ihrem Telefon hinzu: Ein Gebet, das Sie auf einem Gerät markieren, wird auch auf dem anderen markiert. Kein Konto, kein Server; nur Ihr WLAN zu Hause.',
                detayAciklama: 'Meine Geräte › Tablet oder Telefon hinzufügen: Zeigen Sie auf einem Gerät einen Code an und scannen Sie ihn mit dem anderen; beide Bildschirme fragen nach Bestätigung. Im selben WLAN und mit geöffneter App auf beiden Geräten wird ein Gebet sofort übertragen; sonst beim nächsten Mal, wenn beide gleichzeitig geöffnet sind.',
                ctaEtiketi: 'Gerät hinzufügen',
                detaylar: [
                    'Verschlüsselte Kopplung, auf beiden Bildschirmen bestätigt',
                    '„Ich habe gebetet“ wird auf beiden Geräten markiert',
                    'Jederzeit auf einer der beiden Seiten entfernen',
                ],
            },
            fr: {
                baslik: 'Téléphone et tablette ensemble',
                aciklama: 'Ajoutez votre tablette à votre téléphone : une prière marquée sur l’un l’est aussi sur l’autre. Pas de compte, pas de serveur ; seulement le Wi-Fi de votre maison.',
                detayAciklama: 'Mes appareils › Ajouter une tablette ou un téléphone : affichez un code sur un appareil et scannez-le avec l’autre ; une confirmation est demandée sur les deux écrans. Sur le même Wi-Fi, avec l’application ouverte sur les deux, la prière passe immédiatement ; sinon, la prochaine fois que les deux sont ouverts en même temps.',
                ctaEtiketi: 'Ajouter un appareil',
                detaylar: [
                    'Association chiffrée, confirmée sur les deux écrans',
                    '« J’ai prié » est marqué sur les deux appareils',
                    'Retirez l’association à tout moment, d’un côté ou de l’autre',
                ],
            },
            bs: {
                baslik: 'Telefon i tablet zajedno',
                aciklama: 'Dodajte tablet svom telefonu: namaz koji označite na jednom označava se i na drugom. Bez računa, bez servera; samo Vaša kućna Wi-Fi mreža.',
                detayAciklama: 'Moji uređaji › Dodajte tablet ili telefon: na jednom uređaju prikažite kod, a drugim ga skenirajte; oba ekrana traže potvrdu. Na istoj Wi-Fi mreži, s otvorenom aplikacijom na oba uređaja, namaz prelazi odmah; inače kada sljedeći put oba budu otvorena zajedno.',
                ctaEtiketi: 'Dodajte uređaj',
                detaylar: [
                    'Šifrirano uparivanje potvrđeno na oba ekrana',
                    '„Klanjano” se označava na oba uređaja',
                    'Uklonite ga s bilo koje strane bilo kada',
                ],
            },
            ru: {
                baslik: 'Телефон и планшет вместе',
                aciklama: 'Свяжите планшет с телефоном: намаз, отмеченный на одном, отмечается и на другом. Без аккаунта и сервера — только ваш домашний Wi-Fi.',
                detayAciklama: 'Мои устройства › Добавить планшет или телефон: покажите код на одном устройстве и отсканируйте его на другом; подтверждение запрашивается на обоих экранах. В одной сети Wi-Fi и при открытом приложении на обоих намаз передаётся сразу; иначе — когда оба в следующий раз будут открыты одновременно.',
                ctaEtiketi: 'Добавить устройство',
                detaylar: [
                    'Зашифрованная связь с подтверждением на обоих экранах',
                    '«Намаз совершён» отмечается на обоих устройствах',
                    'Удалить связь можно с любой стороны в любой момент',
                ],
            },
            ms: {
                baslik: 'Telefon dan tablet bersama',
                aciklama: 'Tambahkan tablet anda pada telefon: solat yang anda tandakan pada satu peranti turut ditandakan pada peranti yang lain. Tiada akaun, tiada pelayan; hanya Wi-Fi rumah anda.',
                detayAciklama: 'Peranti saya › Tambah tablet atau telefon: tunjukkan kod pada satu peranti dan imbasnya pada peranti yang lain; kedua-dua skrin meminta persetujuan. Pada Wi-Fi yang sama dengan aplikasi dibuka pada kedua-duanya, solat berpindah serta-merta; jika tidak, pada kali seterusnya kedua-duanya dibuka bersama.',
                ctaEtiketi: 'Tambah peranti',
                detaylar: [
                    'Gandingan tersulit yang disahkan pada kedua-dua skrin',
                    'Sudah solat ditandakan pada kedua-dua peranti',
                    'Keluarkan dari mana-mana pihak bila-bila masa',
                ],
            },
            ar: {
                baslik: 'الهاتف والجهاز اللوحي معًا',
                aciklama: 'إضافة جهازك اللوحي إلى هاتفك: الصلاة المعلَّمة على أحدهما تُعلَّم على الآخر. لا حساب ولا خادم؛ فقط شبكة Wi-Fi في منزلك.',
                detayAciklama: 'أجهزتي › إضافة جهاز لوحي أو هاتف: عرض رمز على أحد الجهازين ومسحه بالآخر؛ وتطلب الشاشتان الموافقة. على شبكة Wi-Fi نفسها والتطبيق مفتوح على كليهما تنتقل الصلاة فورًا؛ وإلا ففي المرة التالية التي يُفتحان فيها معًا.',
                ctaEtiketi: 'إضافة جهاز',
                detaylar: [
                    'اقتران مشفّر بموافقة الشاشتين',
                    'تُوضع علامة «صلّيتُ» على الجهازين',
                    'الإزالة من أي طرف في أي وقت',
                ],
            },
            ur: {
                baslik: 'فون اور ٹیبلیٹ ایک ساتھ',
                aciklama: 'اپنا ٹیبلیٹ فون سے جوڑیں: ایک پر لگایا گیا نماز کا نشان دوسرے پر بھی لگ جاتا ہے۔ نہ اکاؤنٹ، نہ سرور؛ صرف آپ کے گھر کا Wi-Fi۔',
                detayAciklama: 'میرے آلات › ٹیبلیٹ یا فون شامل کریں: ایک آلے پر کوڈ دکھائیں اور دوسرے پر اسکین کریں؛ دونوں اسکرینیں منظوری مانگتی ہیں۔ ایک ہی Wi-Fi پر اور دونوں پر ایپ کھلی ہو تو نماز کا نشان فوراً منتقل ہوتا ہے؛ ورنہ اگلی بار جب دونوں ساتھ کھلے ہوں۔',
                ctaEtiketi: 'آلہ شامل کریں',
                detaylar: [
                    'دونوں اسکرینوں پر منظوری کے ساتھ خفیہ جوڑ',
                    '“نماز پڑھ لی” دونوں آلات پر لگتا ہے',
                    'کسی بھی طرف سے کسی بھی وقت ہٹایا جا سکتا ہے',
                ],
            },
            es: {
                baslik: 'El teléfono y la tableta, juntos',
                aciklama: 'Añada su tableta a su teléfono: un rezo que marque en uno se marca en el otro. Sin cuenta ni servidor; solo la red Wi-Fi de su casa.',
                detayAciklama: 'Mis dispositivos › Añadir una tableta o un teléfono: muestre un código en un dispositivo y escanéelo con el otro; las dos pantallas piden aprobación. En la misma red Wi-Fi y con la aplicación abierta en ambos, el rezo pasa al instante; si no, la próxima vez que los dos estén abiertos a la vez.',
                ctaEtiketi: 'Añadir un dispositivo',
                detaylar: [
                    'Vinculación cifrada aprobada en las dos pantallas',
                    '«Ya recé» se marca en los dos dispositivos',
                    'Quítelo desde cualquiera de los dos cuando quiera',
                ],
            },
            nl: {
                baslik: 'Telefoon en tablet samen',
                aciklama: 'Voeg uw tablet toe aan uw telefoon: een gebed dat u op het ene markeert, wordt ook op het andere gemarkeerd. Geen account, geen server; alleen uw wifi thuis.',
                detayAciklama: 'Mijn apparaten › Een tablet of telefoon toevoegen: toon een code op het ene apparaat en scan die met het andere; beide schermen vragen om bevestiging. Op dezelfde wifi en met de app op beide open gaat een gebed meteen over; anders de volgende keer dat beide tegelijk open zijn.',
                ctaEtiketi: 'Een apparaat toevoegen',
                detaylar: [
                    'Versleutelde koppeling, bevestigd op beide schermen',
                    'Gebeden wordt op beide apparaten gemarkeerd',
                    'Op elk moment aan beide kanten te verwijderen',
                ],
            },
            sq: {
                baslik: 'Telefoni dhe tableti bashkë',
                aciklama: 'Shtoni tabletin te telefoni: namazi që shënoni në njërin shënohet edhe në tjetrin. Pa llogari, pa server; vetëm Wi-Fi-ja e shtëpisë.',
                detayAciklama: 'Pajisjet e mia › Shtoni një tablet ose telefon: shfaqni një kod në një pajisje dhe skanojeni me tjetrën; të dy ekranet kërkojnë miratim. Në të njëjtin Wi-Fi me aplikacionin të hapur në të dyja, namazi kalon menjëherë; përndryshe herën tjetër kur të dyja janë të hapura njëkohësisht.',
                ctaEtiketi: 'Shtoni një pajisje',
                detaylar: [
                    'Çiftim i enkriptuar, i miratuar në të dy ekranet',
                    '"E fala" shënohet në të dyja pajisjet',
                    'Hiqeni kurdo nga cilado anë',
                ],
            },
            hi: {
                baslik: 'फ़ोन और टैबलेट साथ-साथ',
                aciklama: 'अपने टैबलेट को फ़ोन से जोड़ें: एक पर लगाया गया नमाज़ का निशान दूसरे पर भी लग जाता है। न अकाउंट, न सर्वर; सिर्फ़ आपके घर का Wi-Fi।',
                detayAciklama: 'मेरे डिवाइस › टैबलेट या फ़ोन जोड़ें: एक डिवाइस पर कोड दिखाएं और दूसरे से स्कैन करें; दोनों स्क्रीनें मंज़ूरी मांगती हैं। एक ही Wi-Fi पर और दोनों पर ऐप खुला हो, तो नमाज़ का निशान फ़ौरन पहुंच जाता है; वरना अगली बार जब दोनों साथ खुले हों।',
                ctaEtiketi: 'डिवाइस जोड़ें',
                detaylar: [
                    'दोनों स्क्रीनों पर मंज़ूर की गई एन्क्रिप्टेड जोड़ी',
                    '"नमाज़ पढ़ ली" दोनों डिवाइसों पर लगता है',
                    'किसी भी तरफ़ से कभी भी हटाया जा सकता है',
                ],
            },
            bn: {
                baslik: 'ফোন ও ট্যাবলেট একসাথে',
                aciklama: 'আপনার ট্যাবলেট ফোনের সাথে যোগ করুন: একটিতে চিহ্নিত নামাজ অন্যটিতেও চিহ্নিত হয়। কোনো অ্যাকাউন্ট নেই, কোনো সার্ভার নেই; শুধু আপনার বাড়ির Wi-Fi।',
                detayAciklama: 'আমার ডিভাইস › ট্যাবলেট বা ফোন যোগ করুন: একটি ডিভাইসে কোড দেখান এবং অন্যটিতে স্ক্যান করুন; দুই স্ক্রিনেই অনুমোদন চাওয়া হয়। একই Wi-Fi-তে দুটিতেই অ্যাপ খোলা থাকলে নামাজ সাথে সাথে চলে যায়; না হলে পরের বার দুটি একসাথে খোলা হলে।',
                ctaEtiketi: 'ডিভাইস যোগ করুন',
                detaylar: [
                    'দুই স্ক্রিনে অনুমোদিত এনক্রিপ্টেড জোড়া',
                    '"নামাজ পড়েছি" দুই ডিভাইসেই চিহ্নিত হয়',
                    'যেকোনো সময় যেকোনো দিক থেকে সরিয়ে দিন',
                ],
            },
            fa: {
                baslik: 'تلفن و تبلت با هم',
                aciklama: 'تبلت خود را به تلفنتان بیفزایید: نمازی که روی یکی علامت بزنید روی دیگری هم علامت می‌خورد. بدون حساب، بدون سرور؛ فقط Wi-Fi خانهٔ شما.',
                detayAciklama: 'دستگاه‌های من › افزودن تبلت یا تلفن: روی یک دستگاه کدی نشان دهید و با دیگری اسکنش کنید؛ هر دو صفحه تأیید می‌خواهند. روی یک Wi-Fi و وقتی برنامه در هر دو باز است، نماز بی‌درنگ منتقل می‌شود؛ وگرنه دفعهٔ بعد که هر دو با هم باز باشند.',
                ctaEtiketi: 'افزودن دستگاه',
                detaylar: [
                    'جفت شدن رمزگذاری‌شده با تأیید هر دو صفحه',
                    '«خواندم» روی هر دو دستگاه علامت می‌خورد',
                    'هر وقت بخواهید از هر دو طرف حذفش کنید',
                ],
            },
            ps: {
                baslik: 'موبایل او ټابلېټ یوځای',
                aciklama: 'خپل ټابلېټ خپل موبایل ته اضافه کړئ: هغه لمونځ چې په یوه کې یې نښه کړئ، په بل کې هم نښه کېږي. نه حساب، نه سرور؛ یوازې د کور Wi-Fi.',
                detayAciklama: 'زما وسیلې › ټابلېټ یا موبایل اضافه کړئ: په یوه وسیله کې کوډ وښیئ او په بله کې یې سکن کړئ؛ دواړه سکرینونه تایید غواړي. په یوه Wi-Fi کې او کله چې اپ په دواړو کې پرانیستی وي، لمونځ سمدستي بل ته ځي؛ که نه، بل ځل چې دواړه یوځای پرانیستي وي.',
                ctaEtiketi: 'وسیله اضافه کړئ',
                detaylar: [
                    'کوډ شوې جوړه کول چې په دواړو سکرینونو تایید کېږي',
                    '«لمونځ مې وکړ» په دواړو وسیلو کې نښه کېږي',
                    'هر وخت یې له هرې خوا لرې کولای شئ',
                ],
            },
            ckb: {
                baslik: 'مۆبایل و تابلێت پێکەوە',
                aciklama: 'تابلێتەکەتان بۆ مۆبایلەکەتان زیاد بکەن: نوێژێک کە لەسەر یەکێکیان نیشانەی دەکەن، لەسەر ئەوی تریش نیشانە دەکرێت. بێ ھەژمار، بێ ڕاژەکار؛ تەنیا Wi-Fi ی ماڵەوەتان.',
                detayAciklama: 'ئامێرەکانم › تابلێت یان مۆبایلێک زیاد بکەن: لەسەر ئامێرێک کۆدێک پیشان بدەن و بە ئەوی تر بیخوێننەوە؛ ھەردوو شاشە داوای پەسەندکردن دەکەن. لەسەر ھەمان Wi-Fi و کاتێک ئەپەکە لەسەر ھەردووکیان کراوەیە، نوێژێک یەکسەر دەگوازرێتەوە؛ ئەگەر نا جاری داھاتوو کە ھەردووکیان پێکەوە کراوە بن.',
                ctaEtiketi: 'زیادکردنی ئامێر',
                detaylar: [
                    'جووتکردنی کۆدکراو کە لەسەر ھەردوو شاشە پەسەند دەکرێت',
                    '«نوێژم کرد» لەسەر ھەردوو ئامێر نیشانە دەکرێت',
                    'ھەر کاتێک بتانەوێت لە ھەر لایەکەوە لای ببەن',
                ],
            },
            ug: {
                baslik: 'تېلېفون بىلەن تاختا كومپيۇتېر بىللە',
                aciklama: 'تاختا كومپيۇتېرىڭىزنى تېلېفونىڭىزغا قوشۇڭ: بىرىدە بەلگىلىگەن ناماز يەنە بىرىدىمۇ بەلگىلىنىدۇ. ھېسابات يوق، مۇلازىمېتىر يوق؛ پەقەت ئۆيىڭىزنىڭ Wi-Fi تورى.',
                detayAciklama: 'ئۈسكۈنىلىرىم › تاختا كومپيۇتېر ياكى تېلېفون قوشۇڭ: بىر ئۈسكۈنىدە كود كۆرسىتىپ، يەنە بىرىدە سىكانىرلاڭ؛ ئىككى ئېكراندىمۇ جەزملەش سورىلىدۇ. ئوخشاش Wi-Fi دا ۋە ئىككى ئۈسكۈنىدە ئەپ ئوچۇق بولسا ناماز دەرھال ئۆتىدۇ؛ بولمىسا ئىككىسى كېيىنكى قېتىم بىللە ئوچۇق بولغاندا ئۆتىدۇ.',
                ctaEtiketi: 'ئۈسكۈنە قوشۇڭ',
                detaylar: [
                    'ئىككى ئېكراندا جەزملەنگەن، شىفىرلانغان جۈپلەش',
                    '«ناماز ئوقۇدۇم» ئىككى ئۈسكۈنىدىمۇ بەلگىلىنىدۇ',
                    'خالىغان ۋاقىتتا ھەر ئىككى تەرەپتىن ئۆچۈرەلەيسىز',
                ],
            },
            az: {
                baslik: 'Telefon və planşet birlikdə',
                aciklama: 'Planşetinizi telefonunuza əlavə edin: birində qeyd etdiyiniz namaz digərində də qeyd olunur. Hesab yoxdur, server yoxdur; yalnız evinizin Wi-Fi şəbəkəsi.',
                detayAciklama: 'Cihazlarım › Planşet və ya telefon əlavə edin: bir cihazda kod göstərin, digərində oxudun; hər iki ekran təsdiq istəyir. Eyni Wi-Fi şəbəkəsində və hər iki cihazda tətbiq açıq olanda namaz dərhal keçir; əks halda ikisi növbəti dəfə birlikdə açıq olanda.',
                ctaEtiketi: 'Cihaz əlavə edin',
                detaylar: [
                    'Hər iki ekranda təsdiqlənən şifrəli cütləşdirmə',
                    'Qıldım hər iki cihazda qeyd olunur',
                    'İstədiyiniz vaxt istənilən tərəfdən silin',
                ],
            },
            uz: {
                baslik: 'Телефон ва планшет бирга',
                aciklama: 'Планшетингизни телефонингизга қўшинг: бирида белгилаган намозингиз бошқасида ҳам белгиланади. Ҳисоб йўқ, сервер йўқ; фақат уйингиздаги Wi-Fi.',
                detayAciklama: 'Қурилмаларим › Планшет ёки телефон қўшиш: бир қурилмада код кўрсатинг, бошқасида уни сканерланг; иккала экранда ҳам тасдиқ сўралади. Бир хил Wi-Fi тармоғида иккала қурилмада илова очиқ бўлса, намоз дарҳол ўтади; акс ҳолда иккаласи кейинги сафар бирга очилганда ўтади.',
                ctaEtiketi: 'Қурилма қўшиш',
                detaylar: [
                    'Иккала экранда тасдиқланадиган шифрланган жуфтлаш',
                    '«Ўқидим» иккала қурилмада ҳам белгиланади',
                    'Истаган вақт исталган томондан олиб ташланг',
                ],
            },
            kk: {
                baslik: 'Телефон мен планшет бірге',
                aciklama: 'Планшетіңізді телефоныңызға қосыңыз: бірінде белгілеген намаз екіншісіне де өтеді. Тіркелгі де, сервер де жоқ; тек үйіңіздің Wi-Fi желісі.',
                detayAciklama: 'Менің құрылғыларым › Планшет немесе телефон қосу: бір құрылғыда кодты көрсетіп, екіншісінде сканерлеңіз; екі экранда да растау сұралады. Бір Wi-Fi желісінде және екі құрылғыда да қолданба ашық болса, намаз бірден өтеді; әйтпесе екеуі келесі жолы бірге ашық болғанда.',
                ctaEtiketi: 'Құрылғы қосу',
                detaylar: [
                    'Екі экранда расталатын, шифрланған жұптастыру',
                    '«Оқыдым» екі құрылғыда да белгіленеді',
                    'Кез келген уақытта екі жақтан да жоюға болады',
                ],
            },
            ky: {
                baslik: 'Телефон жана планшет бирге',
                aciklama: 'Планшетиңизди телефонуңузга кошуңуз: биринде белгилеген намаз экинчисинде да белгиленет. Аккаунт да, сервер да жок; үйүңүздөгү Wi-Fi гана.',
                detayAciklama: 'Түзмөктөрүм › Планшет же телефон кошуу: бир түзмөктө код көрсөтүп, экинчисинде аны скандаңыз; эки экран тең ырастоону сурайт. Бир Wi-Fi тармагында жана экөөндө тең колдонмо ачык болсо, намаз дароо өтөт; болбосо экөө тең бирге ачылган кийинки жолу.',
                ctaEtiketi: 'Түзмөк кошуу',
                detaylar: [
                    'Эки экранда тең ырасталган шифрленген жупташтыруу',
                    '«Окудум» эки түзмөктө тең белгиленет',
                    'Каалаган убакта каалаган тараптан алып салыңыз',
                ],
            },
            tg: {
                baslik: 'Телефон ва планшет якҷоя',
                aciklama: 'Планшетатонро ба телефонатон илова кунед: намозе, ки дар яке қайд мекунед, дар дигараш низ қайд мешавад. На ҳисоб, на сервер; танҳо Wi-Fi-и хонаатон.',
                detayAciklama: 'Дастгоҳҳои ман › Планшет ё телефон илова кунед: дар як дастгоҳ рамз нишон диҳед ва бо дигараш скан кунед; ҳарду экран тасдиқ мепурсанд. Дар як Wi-Fi ва ҳангоми кушода будани барнома дар ҳарду, намоз фавран мегузарад; вагарна дафъаи дигар, ки ҳарду якҷоя кушода бошанд.',
                ctaEtiketi: 'Дастгоҳ илова кунед',
                detaylar: [
                    'Ҷуфтсозии рамзгузоришуда бо тасдиқ дар ҳарду экран',
                    '«Хондам» дар ҳарду дастгоҳ қайд мешавад',
                    'Ҳар вақт аз ҳар ду тараф хориҷ кунед',
                ],
            },
            sw: {
                baslik: 'Simu na kompyuta kibao pamoja',
                aciklama: 'Ongeza kompyuta kibao yako kwenye simu yako: Swala unayoiwekea alama kwenye kimoja inawekwa alama kwenye kingine. Hakuna akaunti, hakuna seva; Wi-Fi ya nyumbani kwako tu.',
                detayAciklama: 'Vifaa vyangu › Ongeza kompyuta kibao au simu: onyesha msimbo kwenye kifaa kimoja na uuchanganue kwenye kingine; skrini zote mbili zinaomba idhini. Kwenye Wi-Fi ile ile na programu ikiwa imefunguliwa kwenye vyote viwili, Swala inahamia mara moja; vinginevyo wakati ujao vyote vitakapofunguliwa pamoja.',
                ctaEtiketi: 'Ongeza kifaa',
                detaylar: [
                    'Kuunganisha kwa usimbaji kunakoidhinishwa kwenye skrini zote mbili',
                    'Nimeswali inawekwa alama kwenye vifaa vyote viwili',
                    'Kiondoe kutoka upande wowote wakati wowote',
                ],
            },
            ha: {
                baslik: 'Waya da kwamfutar hannu tare',
                aciklama: 'Ku ƙara kwamfutar hannu a wayarku: sallar da kuka yi wa alama a ɗaya ana yi mata alama a ɗayan. Babu asusu, babu sabar; Wi-Fi na gidanku kawai.',
                detayAciklama: 'Naʼurorina › Ƙara kwamfutar hannu ko waya: ku nuna lamba a naʼura ɗaya ku karanta ta a ɗayan; fuska biyun suna neman amincewa. A Wi-Fi ɗaya kuma manhajar a buɗe a duka biyun, salla tana wucewa nan take; idan ba haka ba, a lokaci na gaba da duka biyun suka buɗe tare.',
                ctaEtiketi: 'Ƙara naʼura',
                detaylar: [
                    'Haɗawa a ɓoye da aka amince da ita a fuska biyu',
                    'Ana yin alamar Na yi salla a naʼurori biyu',
                    'Ku cire ta daga kowane ɓangare a kowane lokaci',
                ],
            },
            am: {
                baslik: 'ስልክ እና ታብሌት አብረው',
                aciklama: 'ታብሌትዎን ከስልክዎ ጋር ያክሉ፦ በአንዱ ላይ ምልክት ያደረጉበት ሶላት በሌላውም ላይ ምልክት ይደረግበታል። መለያ የለም፣ አገልጋይ የለም፤ የቤትዎ Wi-Fi ብቻ።',
                detayAciklama: 'መሣሪያዎቼ › ታብሌት ወይም ስልክ አክል፦ በአንዱ መሣሪያ ላይ ኮድ ያሳዩና በሌላው ላይ ይቃኙት፤ ሁለቱም ገጾች ማረጋገጫ ይጠይቃሉ። መተግበሪያው በሁለቱም ላይ ክፍት ሆኖ በአንድ Wi-Fi ላይ ሲሆኑ ሶላቱ ወዲያውኑ ያልፋል፤ ካልሆነ ሁለቱም አብረው በሚከፈቱበት በሚቀጥለው ጊዜ።',
                ctaEtiketi: 'መሣሪያ አክል',
                detaylar: [
                    'በሁለቱም ገጾች የሚረጋገጥ የተመሰጠረ ማጣመር',
                    '“ሰገድኩ” በሁለቱም መሣሪያዎች ላይ ምልክት ይደረጋል',
                    'በማንኛውም ጊዜ ከየትኛውም በኩል ያስወግዱት',
                ],
            },
            om: {
                baslik: 'Bilbilaafi taabletii wajjin',
                aciklama: "Taabletii keessan bilbila keessanitti dabalaa: salaanni isa tokko irratti mallatteessitan isa kaan irrattis ni mallattaa'a. Herregni hin jiru, sarvariin hin jiru; Wi-Fi mana keessanii qofa.",
                detayAciklama: "Meeshaalee koo › Taabletii ykn bilbila dabalaa: meeshaa tokko irratti koodii agarsiisaatii isa kaan irratti sakatta'aa; fuulonni lamaanuu mirkaneessa gaafatu. Yeroo Wi-Fi tokko irra jiraatanii appichi lachuu irratti banaa ta'e, salaanni hatattamaan darba; yoo kana hin taane yeroo itti aanee lamaanuu wajjin banaman.",
                ctaEtiketi: 'Meeshaa dabalaa',
                detaylar: [
                    "Walqabsiisa iccitiin eegame kan fuula lamaanuu irratti mirkanaa'u",
                    "\"Ani salaateera\" meeshaalee lamaanuu irratti mallattaa'a",
                    'Yeroo kamiyyuu gama kamiinuu haquu dandeessu',
                ],
            },
            so: {
                baslik: 'Taleefanka iyo taabletka oo wada jira',
                aciklama: 'Ku dar taabletkaaga taleefankaaga: salaadda aad mid ku calaamadeyso waxaa lagu calaamadeeyaa kan kale. Akoon iyo adeege ma jiraan; kaliya Wi-Fi-ga gurigaaga.',
                detayAciklama: 'Qalabkayga › Ku dar taablet ama taleefan: ku muuji koodh hal qalab oo ku akhri kan kale; labada shaashadoodba waxay weydiinayaan oggolaansho. Isla Wi-Fi-ga iyadoo barnaamijku labadaba ku furan yahay, salaaddu isla markiiba way gudubtaa; haddii kale marka xigta ee labaduba wada furan yihiin.',
                ctaEtiketi: 'Ku dar qalab',
                detaylar: [
                    'Isku xir sir ah oo lagu oggolaaday labada shaashadood',
                    'Waan tukaday waxaa lagu calaamadeeyaa labada qalab',
                    'Ka saar dhinac kasta goor kasta',
                ],
            },
            ff: {
                baslik: 'Talifon e tabletel kanko e kanko',
                aciklama: 'Ɓeydee tabletel mon e talifon mon: juulde nde maandini-ɗon e gooto hino maandinee e goɗɗo oo. Alaa konte, alaa sarwoor; Wi-Fi galle mon tan.',
                detayAciklama: 'Kaɓirɗe am › Ɓeydee tabletel walla talifon: hollee kod e kaɓirgal gootal, janngon ngo e goɗngal; yaynirɗe ɗiɗi ɗin fow hino ƴama jaɓɓorgol. E Wi-Fi gootol tawa jaaɓngal ngal hino udditii e ɗiɗi ɗin, juulde hino yaha e nder sahaa; so wonaa sahaa garoowo ɗo ɗiɗi ɗin udditi kanko e kanko.',
                ctaEtiketi: 'Ɓeydee kaɓirgal',
                detaylar: [
                    'Jokkondirgol sirlinaangol jaɓaangol e yaynirɗe ɗiɗi ɗin',
                    'Mi juulii hino maandinee e kaɓirɗe ɗiɗi ɗin',
                    'Ittee ɗum e baŋŋe kala sahaa kala',
                ],
            },
            yo: {
                baslik: 'Fóònù àti tablẹ́ẹ̀tì pọ̀',
                aciklama: 'Ẹ fi tablẹ́ẹ̀tì yín kún fóònù yín: ìrun tí ẹ sàmì sí lórí ọ̀kan ni a ó sàmì sí lórí èkejì. Kò sí àkáǹtì, kò sí olupin; Wi-Fi ilé yín nìkan.',
                detayAciklama: 'Àwọn ẹ̀rọ mi › Fi tablẹ́ẹ̀tì tàbí fóònù kún un: ẹ fi kóòdù hàn lórí ẹ̀rọ kan, kí ẹ sì ṣàyẹ̀wò rẹ̀ lórí èkejì; ojú-ìbòjú méjèèjì yóò béèrè ìfọwọ́sí. Lórí Wi-Fi kan náà pẹ̀lú ìṣàfilọ́lẹ̀ ní ṣíṣí lórí méjèèjì, ìrun kan ń kọjá lẹ́sẹ̀kẹsẹ̀; bí bẹ́ẹ̀ kọ́, nígbà tí méjèèjì bá tún ṣí pọ̀.',
                ctaEtiketi: 'Fi ẹ̀rọ kún un',
                detaylar: [
                    'Ìsopọ̀ ní ìpamọ́ tí a fọwọ́ sí lórí ojú-ìbòjú méjèèjì',
                    'A ń sàmì sí Mo ti kírun lórí ẹ̀rọ méjèèjì',
                    'Ẹ lè yọ ọ́ kúrò láti ẹ̀gbẹ́ èyíkéyìí nígbàkúùgbà',
                ],
            },
        },
    },
    // Cihaz ağı v2: şifreli TV eşitlemesi + Cihazlarım (tasarım 2026-10-21).
    {
        id: 'cihaz-agi-tv-esitleme',
        platformlar: ['android', 'ios'],
        surum: '0.65.0',
        tarih: '2026-10-21',
        baslik: 'TV kıldığınız namazları da bilir',
        aciklama:
            'Cihazlarım sayfasından evdeki TV’leri yönetin. İsterseniz TV, kıldığınız namazları bilir; vakit daralırken kılmadıysanız ekranın altında sessiz bir bant gösterir.',
        detayAciklama:
            'Telefon ile TV, ilk eşleştirmede birbirini onaylar: telefonunuzda TV’nin adını görür, TV’de kumandayla “Ekleyin”e basarsınız. Sonrası şifrelidir ve yalnız evinizin Wi-Fi ağında gider. TV’de durumunuzun sayılması varsayılan olarak kapalıdır; açmazsanız TV yalnız vakitleri gösterir. Ramazan’da iftar ve sahur sayacı, cuma günü cuma kartı da büyük ekranda görünür.',
        detaylar: [
            'Telefonda ve TV’de çift onaylı eşleştirme',
            'Bilgiler şifreli, yalnız ev ağınızda',
            'Vakit daralınca TV’de sessiz hatırlatma bandı',
            'Ramazan’da iftar ve sahur sayacı, cuma günü cuma kartı',
            'TV’yi istediğiniz an iki taraftan da kaldırın',
        ],
        ikon: 'tv',
        hedefSayfa: 'Cihazlarim',
        ctaEtiketi: 'Cihazlarımı açın',
        ceviri: {
            en: {
                baslik: 'Your TV knows the prayers you pray',
                aciklama:
                    "Manage the TVs at home from My devices. If you like, the TV knows which prayers you have prayed; when time runs short and you haven't prayed, it shows a quiet band at the bottom of the screen.",
                detayAciklama:
                    'On first pairing, the phone and TV approve each other: you see the TV\'s name on your phone and press "Add" with the remote on the TV. After that everything is encrypted and stays on your home Wi-Fi. Counting your status on the TV is off by default; unless you turn it on, the TV only shows prayer times. In Ramadan the iftar and suhoor countdowns, and on Fridays the Jumu\'ah card, appear on the big screen too.',
                ctaEtiketi: 'Open My devices',
                detaylar: [
                    'Pairing approved on both the phone and the TV',
                    'Encrypted, only on your home network',
                    'A quiet reminder band on the TV when time runs short',
                    "Iftar and suhoor countdowns in Ramadan, the Jumu'ah card on Fridays",
                    'Remove the TV from either side at any time',
                ],
            },
            id: {
                baslik: 'TV Anda tahu salat yang sudah Anda tunaikan',
                aciklama: 'Kelola TV di rumah dari Perangkat saya. Jika Anda mau, TV mengetahui salat yang sudah Anda tunaikan; saat waktu makin sempit dan Anda belum salat, TV menampilkan pita senyap di bagian bawah layar.',
                detayAciklama: 'Pada pemasangan pertama, ponsel dan TV saling menyetujui: Anda melihat nama TV di ponsel dan menekan "Tambahkan" di TV dengan remote. Setelah itu semuanya terenkripsi dan tetap di Wi-Fi rumah Anda. Penghitungan status Anda di TV awalnya nonaktif; jika tidak Anda aktifkan, TV hanya menampilkan waktu salat. Saat Ramadan, hitung mundur berbuka dan sahur, serta kartu Jumat pada hari Jumat, juga tampil di layar besar.',
                ctaEtiketi: 'Buka Perangkat saya',
                detaylar: [
                    'Pemasangan disetujui di ponsel dan di TV',
                    'Terenkripsi, hanya di jaringan rumah Anda',
                    'Pita pengingat senyap di TV saat waktu makin sempit',
                    'Hitung mundur berbuka dan sahur saat Ramadan, kartu Jumat pada hari Jumat',
                    'Hapus TV dari sisi mana pun kapan saja',
                ],
            },
            de: {
                baslik: 'Ihr Fernseher kennt Ihre verrichteten Gebete',
                aciklama: 'Verwalten Sie die Fernseher zu Hause unter Meine Geräte. Auf Wunsch weiß der Fernseher, welche Gebete Sie verrichtet haben; wird die Zeit knapp und Sie haben noch nicht gebetet, zeigt er unten auf dem Bildschirm ein stilles Band.',
                detayAciklama: 'Beim ersten Koppeln bestätigen sich Telefon und Fernseher gegenseitig: Sie sehen den Namen des Fernsehers auf Ihrem Telefon und drücken am Fernseher mit der Fernbedienung auf „Hinzufügen“. Danach ist alles verschlüsselt und bleibt in Ihrem WLAN zu Hause. Ihren Stand auf dem Fernseher zu berücksichtigen, ist anfangs aus; solange Sie es nicht einschalten, zeigt der Fernseher nur die Gebetszeiten. Im Ramadan erscheinen auch die Countdowns für Iftar und Suhur und freitags die Karte zum Freitagsgebet auf dem großen Bildschirm.',
                ctaEtiketi: 'Meine Geräte öffnen',
                detaylar: [
                    'Kopplung, auf Telefon und Fernseher bestätigt',
                    'Verschlüsselt, nur in Ihrem Heimnetz',
                    'Ein stilles Erinnerungsband auf dem Fernseher, wenn die Zeit knapp wird',
                    'Countdowns für Iftar und Suhur im Ramadan, freitags die Karte zum Freitagsgebet',
                    'Den Fernseher jederzeit auf einer der beiden Seiten entfernen',
                ],
            },
            fr: {
                baslik: 'Votre téléviseur connaît les prières que vous accomplissez',
                aciklama: 'Gérez les téléviseurs de la maison depuis Mes appareils. Si vous le souhaitez, le téléviseur sait quelles prières vous avez accomplies ; quand l’heure se termine et que vous n’avez pas prié, il affiche un bandeau discret en bas de l’écran.',
                detayAciklama: 'Lors de la première association, le téléphone et le téléviseur se confirment l’un l’autre : vous voyez le nom du téléviseur sur votre téléphone et appuyez sur « Ajouter » avec la télécommande. Ensuite, tout est chiffré et reste sur le Wi-Fi de votre maison. La prise en compte de vos prières sur le téléviseur est désactivée par défaut ; si vous ne l’activez pas, le téléviseur affiche seulement les heures de prière. Pendant le Ramadan, les comptes à rebours de l’iftar et du souhour, et le vendredi la carte de Joumoua, apparaissent aussi sur le grand écran.',
                ctaEtiketi: 'Ouvrir Mes appareils',
                detaylar: [
                    'Association confirmée sur le téléphone et sur le téléviseur',
                    'Informations chiffrées, uniquement sur le réseau de votre maison',
                    'Un bandeau de rappel discret sur le téléviseur quand l’heure se termine',
                    'Comptes à rebours de l’iftar et du souhour pendant le Ramadan, carte de Joumoua le vendredi',
                    'Retirez le téléviseur à tout moment, d’un côté ou de l’autre',
                ],
            },
            bs: {
                baslik: 'Vaš TV zna koje namaze klanjate',
                aciklama: 'Upravljajte televizorima u kući iz opcije Moji uređaji. Ako želite, TV zna koje ste namaze klanjali; kada vakat ističe, a niste klanjali, na dnu ekrana prikazuje tihu traku.',
                detayAciklama: 'Pri prvom uparivanju telefon i TV potvrđuju jedno drugo: na telefonu vidite naziv TV-a, a na TV-u daljinskim upravljačem pritisnete „Dodajte”. Nakon toga je sve šifrirano i ostaje na Vašoj kućnoj Wi-Fi mreži. Računanje Vašeg stanja na TV-u je po zadanom isključeno; dok ga ne uključite, TV samo prikazuje vremena. U ramazanu se na velikom ekranu prikazuju i odbrojavanja do iftara i sehura, a petkom kartica za džumu.',
                ctaEtiketi: 'Otvorite Moji uređaji',
                detaylar: [
                    'Uparivanje potvrđeno i na telefonu i na TV-u',
                    'Šifrirano, samo na Vašoj kućnoj mreži',
                    'Tiha traka-podsjetnik na TV-u kada vakat ističe',
                    'Odbrojavanja do iftara i sehura u ramazanu, kartica za džumu petkom',
                    'Uklonite TV s bilo koje strane bilo kada',
                ],
            },
            ru: {
                baslik: 'Телевизор знает, какие намазы вы совершили',
                aciklama: 'Управляйте домашними телевизорами в разделе «Мои устройства». При желании телевизор будет знать, какие намазы вы совершили; когда время уходит, а намаз не совершён, внизу экрана появится тихая полоса.',
                detayAciklama: 'При первом подключении телефон и телевизор подтверждают друг друга: на телефоне вы видите название телевизора, а на телевизоре нажимаете пультом «Добавить». После этого всё зашифровано и остаётся в вашей домашней сети Wi-Fi. Учёт вашего состояния на телевизоре по умолчанию выключен; пока вы его не включите, телевизор только показывает время намазов. В Рамадан на большом экране также видны отсчёты до ифтара и до конца сухура, а по пятницам — карточка джума-намаза.',
                ctaEtiketi: 'Открыть «Мои устройства»',
                detaylar: [
                    'Подключение с подтверждением и на телефоне, и на телевизоре',
                    'Шифрование, только в вашей домашней сети',
                    'Тихая полоса-напоминание на телевизоре, когда время уходит',
                    'Отсчёты до ифтара и конца сухура в Рамадан, карточка джума-намаза по пятницам',
                    'Удалить телевизор можно с любой стороны в любой момент',
                ],
            },
            ms: {
                baslik: 'TV anda mengetahui solat yang anda tunaikan',
                aciklama: 'Urus TV di rumah dari Peranti saya. Jika anda mahu, TV mengetahui solat yang telah anda tunaikan; apabila waktu semakin suntuk dan anda belum solat, ia memaparkan jalur senyap di bahagian bawah skrin.',
                detayAciklama: 'Pada gandingan pertama, telefon dan TV saling mengesahkan: anda melihat nama TV pada telefon dan menekan "Tambah" dengan alat kawalan jauh pada TV. Selepas itu semuanya disulitkan dan kekal dalam Wi-Fi rumah anda. Pengiraan status anda di TV dimatikan secara lalai; selagi anda tidak menghidupkannya, TV hanya memaparkan waktu solat. Pada bulan Ramadan, kiraan detik berbuka dan sahur, dan pada hari Jumaat, kad Jumaat, turut dipaparkan pada skrin besar.',
                ctaEtiketi: 'Buka Peranti saya',
                detaylar: [
                    'Gandingan yang disahkan pada telefon dan TV',
                    'Tersulit, hanya dalam rangkaian rumah anda',
                    'Jalur peringatan senyap di TV apabila waktu semakin suntuk',
                    'Kiraan detik berbuka dan sahur pada bulan Ramadan, kad Jumaat pada hari Jumaat',
                    'Keluarkan TV dari mana-mana pihak bila-bila masa',
                ],
            },
            ar: {
                baslik: 'تلفازك يعرف صلواتك المؤدّاة',
                aciklama: 'إدارة أجهزة التلفاز في المنزل من «أجهزتي». وإن شئت يعرف التلفاز الصلوات المؤدّاة؛ وحين يضيق الوقت ولم تُؤدَّ الصلاة يُظهر شريطًا هادئًا أسفل الشاشة.',
                detayAciklama: 'عند الاقتران الأول يوافق الهاتف والتلفاز أحدهما على الآخر: يظهر اسم التلفاز على هاتفك، ويُضغط «إضافة» بجهاز التحكم على التلفاز. وبعدها يكون كل شيء مشفّرًا ويبقى على شبكة Wi-Fi في منزلك. احتساب حالتك على التلفاز معطّل افتراضيًا؛ وما لم يُفعَّل يعرض التلفاز المواقيت فقط. وفي رمضان يظهر عدّادا الإفطار والسحور، وفي الجمعة بطاقة الجمعة، على الشاشة الكبيرة أيضًا.',
                ctaEtiketi: 'فتح أجهزتي',
                detaylar: [
                    'اقتران بموافقة الهاتف والتلفاز معًا',
                    'مشفّر، وعلى شبكة منزلك فقط',
                    'شريط تذكير هادئ على التلفاز حين يضيق الوقت',
                    'عدّادا الإفطار والسحور في رمضان، وبطاقة الجمعة يوم الجمعة',
                    'إزالة التلفاز من أي طرف في أي وقت',
                ],
            },
            ur: {
                baslik: 'آپ کا ٹی وی آپ کی ادا کردہ نمازیں جانتا ہے',
                aciklama: 'گھر کے ٹی وی میرے آلات سے سنبھالیں۔ چاہیں تو ٹی وی جانتا ہے کہ کون سی نمازیں ادا ہو چکی ہیں؛ وقت تنگ ہو اور نماز ادا نہ ہوئی ہو تو اسکرین کے نیچے ایک خاموش پٹی دکھاتا ہے۔',
                detayAciklama: 'پہلی بار جوڑنے پر فون اور ٹی وی ایک دوسرے کی منظوری دیتے ہیں: فون پر ٹی وی کا نام نظر آتا ہے اور ٹی وی پر ریموٹ سے “شامل کریں” دبایا جاتا ہے۔ اس کے بعد سب کچھ خفیہ رہتا ہے اور آپ کے گھر کے Wi-Fi پر ہی رہتا ہے۔ ٹی وی پر آپ کی نمازوں کا شمار طے شدہ طور پر بند ہے؛ آن نہ کرنے تک ٹی وی صرف نماز کے اوقات دکھاتا ہے۔ رمضان میں افطار اور سحری کی الٹی گنتی، اور جمعہ کو جمعہ کا کارڈ بھی بڑی اسکرین پر نظر آتا ہے۔',
                ctaEtiketi: 'میرے آلات کھولیں',
                detaylar: [
                    'فون اور ٹی وی دونوں پر منظوری کے ساتھ جوڑ',
                    'خفیہ، صرف آپ کے گھر کے نیٹ ورک پر',
                    'وقت تنگ ہونے پر ٹی وی پر خاموش یاد دہانی کی پٹی',
                    'رمضان میں افطار اور سحری کی الٹی گنتی، جمعہ کو جمعہ کا کارڈ',
                    'ٹی وی کسی بھی طرف سے کسی بھی وقت ہٹایا جا سکتا ہے',
                ],
            },
            es: {
                baslik: 'Su televisor sabe qué rezos ha hecho',
                aciklama: 'Gestione los televisores de casa desde Mis dispositivos. Si quiere, el televisor sabe qué rezos ha hecho; cuando el tiempo se acaba y no ha rezado, muestra una franja discreta en la parte inferior de la pantalla.',
                detayAciklama: 'En la primera vinculación, el teléfono y el televisor se aprueban mutuamente: ve el nombre del televisor en su teléfono y pulsa «Añadir» con el mando en el televisor. Después, todo va cifrado y se queda en la red Wi-Fi de su casa. Tener en cuenta sus rezos en el televisor está desactivado de forma predeterminada; si no lo activa, el televisor solo muestra las horas de rezo. En Ramadán, las cuentas atrás del iftar y del suhur, y los viernes la tarjeta de Yumu’a, también aparecen en la pantalla grande.',
                ctaEtiketi: 'Abrir Mis dispositivos',
                detaylar: [
                    'Vinculación aprobada en el teléfono y en el televisor',
                    'Cifrado, solo en la red de su casa',
                    'Una franja de recordatorio discreta en el televisor cuando el tiempo se acaba',
                    'Cuentas atrás del iftar y del suhur en Ramadán, tarjeta de Yumu’a los viernes',
                    'Quite el televisor desde cualquiera de los dos lados cuando quiera',
                ],
            },
            nl: {
                baslik: 'Uw tv weet welke gebeden u hebt verricht',
                aciklama: 'Beheer de tv\'s thuis via Mijn apparaten. Desgewenst weet de tv welke gebeden u hebt verricht; als de tijd krap wordt en u nog niet hebt gebeden, toont hij onderaan het scherm een stille balk.',
                detayAciklama: 'Bij de eerste koppeling bevestigen telefoon en tv elkaar: u ziet de naam van de tv op uw telefoon en drukt op de tv met de afstandsbediening op "Toevoegen". Daarna is alles versleuteld en blijft het op uw wifi thuis. Uw gebeden meetellen op de tv staat standaard uit; zolang u het niet aanzet, toont de tv alleen de gebedstijden. Tijdens ramadan verschijnen de aftellingen voor iftar en suhoor, en op vrijdag de kaart voor Djoemoe\'a, ook op het grote scherm.',
                ctaEtiketi: 'Mijn apparaten openen',
                detaylar: [
                    'Koppeling bevestigd op zowel de telefoon als de tv',
                    'Versleuteld, alleen op uw thuisnetwerk',
                    'Een stille herinneringsbalk op de tv als de tijd krap wordt',
                    'Aftellingen voor iftar en suhoor tijdens ramadan, de kaart voor Djoemoe\'a op vrijdag',
                    'Op elk moment de tv aan beide kanten verwijderen',
                ],
            },
            sq: {
                baslik: 'Televizori di namazet që falni',
                aciklama: 'Menaxhoni televizorët në shtëpi nga Pajisjet e mia. Nëse doni, televizori di cilat namaze keni falur; kur koha ngushtohet dhe nuk keni falur, shfaq një shirit të qetë në fund të ekranit.',
                detayAciklama: 'Në çiftimin e parë, telefoni dhe televizori miratojnë njëri-tjetrin: emrin e televizorit e shihni në telefon dhe në televizor shtypni "Shtoni" me telekomandë. Pas kësaj gjithçka është e enkriptuar dhe mbetet në Wi-Fi-në e shtëpisë. Llogaritja e gjendjes suaj në televizor është fillimisht joaktive; derisa ta aktivizoni, televizori tregon vetëm kohët e namazit. Në Ramazan numërimet e iftarit dhe syfyrit, dhe të premteve karta e xhumasë, shfaqen edhe në ekranin e madh.',
                ctaEtiketi: 'Hapni Pajisjet e mia',
                detaylar: [
                    'Çiftim i miratuar edhe në telefon, edhe në televizor',
                    'I enkriptuar, vetëm në rrjetin e shtëpisë',
                    'Një shirit i qetë kujtese në televizor kur koha ngushtohet',
                    'Numërimet e iftarit dhe syfyrit në Ramazan, karta e xhumasë të premteve',
                    'Hiqeni televizorin kurdo nga cilado anë',
                ],
            },
            hi: {
                baslik: 'आपका टीवी आपकी पढ़ी हुई नमाज़ें जानता है',
                aciklama: 'घर के टीवी मेरे डिवाइस से संभालें। चाहें तो टीवी जान सकता है कि कौन सी नमाज़ें पढ़ ली गई हैं; वक़्त तंग होने पर नमाज़ न पढ़ी गई हो, तो स्क्रीन के नीचे एक ख़ामोश पट्टी दिखाता है।',
                detayAciklama: 'पहली बार जोड़ने पर फ़ोन और टीवी एक-दूसरे को मंज़ूरी देते हैं: फ़ोन पर टीवी का नाम दिखता है और टीवी पर रिमोट से "जोड़ें" दबाया जाता है। उसके बाद सब कुछ एन्क्रिप्टेड रहता है और आपके घर के Wi-Fi पर ही रहता है। टीवी पर आपकी हालत गिनना शुरू में बंद रहता है; जब तक आप इसे चालू न करें, टीवी सिर्फ़ नमाज़ के वक़्त दिखाता है। रमज़ान में इफ़्तार और सहरी की उल्टी गिनती, और जुमा को जुमा का कार्ड भी बड़ी स्क्रीन पर दिखता है।',
                ctaEtiketi: 'मेरे डिवाइस खोलें',
                detaylar: [
                    'फ़ोन और टीवी दोनों पर मंज़ूर की गई जोड़ी',
                    'एन्क्रिप्टेड, सिर्फ़ आपके घर के नेटवर्क पर',
                    'वक़्त तंग होने पर टीवी पर एक ख़ामोश रिमाइंडर पट्टी',
                    'रमज़ान में इफ़्तार और सहरी की उल्टी गिनती, जुमा को जुमा का कार्ड',
                    'टीवी को किसी भी तरफ़ से कभी भी हटाया जा सकता है',
                ],
            },
            bn: {
                baslik: 'আপনার টিভি জানে আপনি কোন নামাজ পড়েছেন',
                aciklama: 'আমার ডিভাইস থেকে বাড়ির টিভিগুলো পরিচালনা করুন। চাইলে টিভি জানবে আপনি কোন নামাজ পড়েছেন; সময় কমে এলে এবং নামাজ না পড়ে থাকলে স্ক্রিনের নিচে একটি নীরব ব্যানার দেখায়।',
                detayAciklama: 'প্রথম জোড়া লাগানোর সময় ফোন ও টিভি একে অপরকে অনুমোদন দেয়: ফোনে টিভির নাম দেখতে পান এবং টিভিতে রিমোট দিয়ে "যোগ করুন" চাপেন। এরপর সবকিছু এনক্রিপ্টেড থাকে এবং আপনার বাড়ির Wi-Fi-তেই থাকে। টিভিতে আপনার অবস্থা গণনা ডিফল্টভাবে বন্ধ; চালু না করলে টিভি শুধু নামাজের সময় দেখায়। রমজানে ইফতার ও সাহরির কাউন্টডাউন এবং শুক্রবারে জুমার কার্ডও বড় স্ক্রিনে দেখা যায়।',
                ctaEtiketi: 'আমার ডিভাইস খুলুন',
                detaylar: [
                    'ফোন ও টিভি দুটিতেই অনুমোদিত জোড়া',
                    'এনক্রিপ্টেড, শুধু আপনার বাড়ির নেটওয়ার্কে',
                    'সময় কমে এলে টিভিতে একটি নীরব রিমাইন্ডার ব্যানার',
                    'রমজানে ইফতার ও সাহরির কাউন্টডাউন, শুক্রবারে জুমার কার্ড',
                    'যেকোনো সময় যেকোনো দিক থেকে টিভি সরিয়ে দিন',
                ],
            },
            fa: {
                baslik: 'تلویزیون شما نمازهایی را که می‌خوانید می‌داند',
                aciklama: 'تلویزیون‌های خانه را از «دستگاه‌های من» مدیریت کنید. اگر بخواهید، تلویزیون می‌داند کدام نمازها را خوانده‌اید؛ وقتی وقت تنگ شود و نخوانده باشید، نواری آرام در پایین صفحه نشان می‌دهد.',
                detayAciklama: 'در نخستین جفت شدن، تلفن و تلویزیون یکدیگر را تأیید می‌کنند: نام تلویزیون را روی تلفن می‌بینید و در تلویزیون با کنترل از راه دور «افزودن» را می‌زنید. پس از آن همه چیز رمزگذاری‌شده است و در Wi-Fi خانهٔ شما می‌ماند. حساب شدن وضعیت شما در تلویزیون به‌طور پیش‌فرض خاموش است؛ تا روشنش نکنید، تلویزیون فقط اوقات نماز را نشان می‌دهد. در رمضان شمارش معکوس افطار و سحر و روزهای جمعه کارت جمعه هم روی صفحهٔ بزرگ نمایش داده می‌شود.',
                ctaEtiketi: 'باز کردن دستگاه‌های من',
                detaylar: [
                    'جفت شدن با تأیید هم در تلفن و هم در تلویزیون',
                    'رمزگذاری‌شده، فقط در شبکهٔ خانهٔ شما',
                    'نوار یادآوری آرام در تلویزیون وقتی وقت تنگ می‌شود',
                    'شمارش معکوس افطار و سحر در رمضان، کارت جمعه در روزهای جمعه',
                    'هر وقت بخواهید تلویزیون را از هر دو طرف حذف کنید',
                ],
            },
            ps: {
                baslik: 'ستاسو TV ستاسو ادا شوي لمونځونه پېژني',
                aciklama: 'د کور تلویزیونونه له «زما وسیلې» څخه اداره کړئ. که وغواړئ، TV پوهېږي چې کوم لمونځونه مو ادا کړي؛ کله چې وخت تنګ شي او لمونځ مو نه وي کړی، د سکرین لاندې یوه چوپه پټه ښيي.',
                detayAciklama: 'په لومړي ځل جوړه کولو کې موبایل او TV یو بل تاییدوي: د TV نوم په خپل موبایل کې ګورئ او په TV کې په ریموټ «اضافه کړئ» کېکاږئ. له هغه وروسته هر څه کوډ شوي دي او ستاسو د کور په Wi-Fi کې پاتې کېږي. په TV کې د ستاسو د حالت حسابول په پیل کې بند دي؛ تر هغه چې یې فعال نه کړئ، TV یوازې د لمانځه وختونه ښيي. په رمضان کې د افطار او پېشمني شمېرنې، او د جمعې په ورځ د جمعې کارت هم په لوی سکرین کې ښکاري.',
                ctaEtiketi: 'زما وسیلې پرانیزئ',
                detaylar: [
                    'جوړه کول چې په موبایل او TV دواړو کې تایید کېږي',
                    'کوډ شوي، یوازې ستاسو د کور په شبکه کې',
                    'کله چې وخت تنګ شي، په TV کې د یادونې چوپه پټه',
                    'په رمضان کې د افطار او پېشمني شمېرنې، د جمعې په ورځ د جمعې کارت',
                    'هر وخت TV له هرې خوا لرې کولای شئ',
                ],
            },
            ckb: {
                baslik: 'تەلەڤزیۆنەکەتان ئەو نوێژانە دەزانێت کە دەیکەن',
                aciklama: 'تەلەڤزیۆنەکانی ماڵەوە لە ئامێرەکانمەوە بەڕێوە ببەن. ئەگەر بتانەوێت، تەلەڤزیۆنەکە دەزانێت کام نوێژتان کردووە؛ کاتێک کات کەم دەبێتەوە و نوێژتان نەکردووە، شریتێکی بێدەنگ لە خوارەوەی شاشەکە پیشان دەدات.',
                detayAciklama: 'لە یەکەم جووتکردندا، مۆبایل و تەلەڤزیۆن یەکتر پەسەند دەکەن: ناوی تەلەڤزیۆنەکە لەسەر مۆبایلەکەتان دەبینن و لەسەر تەلەڤزیۆنەکە بە ڕیمۆت دەست لە «زیادکردن» دەدەن. دوای ئەوە ھەموو شتێک کۆدکراوە و لەسەر Wi-Fi ی ماڵەوەتان دەمێنێتەوە. حیسابکردنی دۆخەکەتان لەسەر تەلەڤزیۆن لە بنەڕەتدا ناچالاکە؛ تا چالاکی نەکەن، تەلەڤزیۆنەکە تەنیا کاتەکانی نوێژ پیشان دەدات. لە ڕەمەزاندا ژماردنی بەربانگ و پارشێو، و ڕۆژانی ھەینی کارتی نوێژی ھەینی، لەسەر شاشە گەورەکەش دەردەکەون.',
                ctaEtiketi: 'کردنەوەی ئامێرەکانم',
                detaylar: [
                    'جووتکردن کە لەسەر مۆبایل و تەلەڤزیۆن پەسەند دەکرێت',
                    'کۆدکراو، تەنیا لەسەر تۆڕی ماڵەوەتان',
                    'شریتێکی بێدەنگی بیرخستنەوە لەسەر تەلەڤزیۆن کاتێک کات کەم دەبێتەوە',
                    'ژماردنی بەربانگ و پارشێو لە ڕەمەزاندا، کارتی ھەینی ڕۆژانی ھەینی',
                    'ھەر کاتێک بتانەوێت لە ھەر لایەکەوە تەلەڤزیۆنەکە لاببەن',
                ],
            },
            ug: {
                baslik: 'تېلېۋىزور ئوقۇغان نامازلىرىڭىزنىمۇ بىلىدۇ',
                aciklama: 'ئۆيدىكى تېلېۋىزورلارنى ئۈسكۈنىلىرىم بېتىدىن باشقۇرۇڭ. خالىسىڭىز، تېلېۋىزور ئوقۇغان نامازلىرىڭىزنى بىلىدۇ؛ ۋاقىت تارايغاندا تېخى ئوقۇمىغان بولسىڭىز، ئېكراننىڭ ئاستىدا ئۈنسىز بىر بەلۋاغ كۆرسىتىدۇ.',
                detayAciklama: 'تۇنجى جۈپلەشتە تېلېفون بىلەن تېلېۋىزور بىر-بىرىنى جەزملەيدۇ: تېلېفونىڭىزدا تېلېۋىزورنىڭ نامىنى كۆرىسىز، تېلېۋىزوردا يىراقتىن كونترول قىلغۇچ بىلەن «قوشۇڭ» نى باسىسىز. ئۇنىڭدىن كېيىن ھەممىسى شىفىرلىنىدۇ ۋە پەقەت ئۆيىڭىزنىڭ Wi-Fi تورىدا قالىدۇ. تېلېۋىزوردا ھالىتىڭىزنىڭ ھېسابلىنىشى سۈكۈتتىكى ھالەتتە تاقاق؛ ئاچمىسىڭىز تېلېۋىزور پەقەت ناماز ۋاقىتلىرىنىلا كۆرسىتىدۇ. رامىزاندا ئىپتار ۋە سەھەرلىك ساناقلىرى، جۈمە كۈنى جۈمە كارتىسىمۇ چوڭ ئېكراندا كۆرۈنىدۇ.',
                ctaEtiketi: 'ئۈسكۈنىلىرىمنى ئېچىڭ',
                detaylar: [
                    'تېلېفون ۋە تېلېۋىزوردا ئىككى تەرەپلىمە جەزملەنگەن جۈپلەش',
                    'شىفىرلانغان، پەقەت ئۆي تورىڭىزدا',
                    'ۋاقىت تارايغاندا تېلېۋىزوردا ئۈنسىز ئەسكەرتىش بەلۋېغى',
                    'رامىزاندا ئىپتار ۋە سەھەرلىك ساناقلىرى، جۈمە كۈنى جۈمە كارتىسى',
                    'تېلېۋىزورنى خالىغان ۋاقىتتا ھەر ئىككى تەرەپتىن ئۆچۈرەلەيسىز',
                ],
            },
            az: {
                baslik: 'Televizorunuz qıldığınız namazları bilir',
                aciklama: 'Evdəki televizorları Cihazlarım bölməsindən idarə edin. İstəsəniz, TV hansı namazları qıldığınızı bilir; vaxt daralanda və qılmamısınızsa, ekranın altında səssiz zolaq göstərir.',
                detayAciklama: 'İlk cütləşdirmədə telefon və TV bir-birini təsdiqləyir: TV-nin adını telefonunuzda görürsünüz, TV-də isə pultla "Əlavə edin" düyməsinə basırsınız. Bundan sonra hər şey şifrələnir və evinizin Wi-Fi şəbəkəsində qalır. TV-də vəziyyətinizin nəzərə alınması standart olaraq bağlıdır; açmasanız, TV yalnız vaxtları göstərir. Ramazanda iftar və sahur sayğacları, cümə günləri isə cümə kartı da böyük ekranda görünür.',
                ctaEtiketi: 'Cihazlarım bölməsini açın',
                detaylar: [
                    'Həm telefonda, həm də TV-də təsdiqlənən cütləşdirmə',
                    'Şifrəli, yalnız evinizin şəbəkəsində',
                    'Vaxt daralanda TV-də səssiz xatırlatma zolağı',
                    'Ramazanda iftar və sahur sayğacları, cümə günləri cümə kartı',
                    'İstədiyiniz vaxt TV-ni istənilən tərəfdən silin',
                ],
            },
            uz: {
                baslik: 'Телевизор ўқиган намозларингизни билади',
                aciklama: 'Уйдаги телевизорларни Қурилмаларим саҳифасидан бошқаринг. Истасангиз, телевизор ўқиган намозларингизни билади; вақт оз қолганда ўқимаган бўлсангиз, экран пастида жимгина лавҳа кўрсатади.',
                detayAciklama: 'Биринчи жуфтлашда телефон ва телевизор бир-бирини тасдиқлайди: телефонингизда телевизор номини кўрасиз, телевизорда пульт билан «Қўшиш»ни босасиз. Ундан кейин ҳаммаси шифрланган ва фақат уйингиздаги Wi-Fi тармоғида қолади. Ҳолатингизни телевизорда ҳисобга олиш одатда ўчиқ; уни ёқмасангиз, телевизор фақат намоз вақтларини кўрсатади. Рамазонда ифтор ва саҳарлик тескари саноғи, жума куни эса жума карточкаси ҳам катта экранда кўринади.',
                ctaEtiketi: 'Қурилмаларимни очиш',
                detaylar: [
                    'Телефонда ва телевизорда тасдиқланадиган жуфтлаш',
                    'Шифрланган, фақат уй тармоғингизда',
                    'Вақт оз қолганда телевизорда жимгина эслатма лавҳаси',
                    'Рамазонда ифтор ва саҳарлик тескари саноғи, жума куни жума карточкаси',
                    'Телевизорни истаган вақт исталган томондан олиб ташланг',
                ],
            },
            kk: {
                baslik: 'Теледидар оқыған намаздарыңызды да біледі',
                aciklama: 'Үйдегі теледидарларды «Менің құрылғыларым» бетінен басқарыңыз. Қаласаңыз, теледидар оқыған намаздарыңызды біледі; уақыт тарылғанда намаз оқылмаған болса, экранның төменгі жағында үнсіз жолақ көрсетеді.',
                detayAciklama: 'Алғашқы жұптастыруда телефон мен теледидар бірін-бірі растайды: телефоныңызда теледидардың атауын көресіз, ал теледидарда пультпен «Қосу» түймесін басасыз. Одан кейін бәрі шифрланады және тек үйіңіздің Wi-Fi желісінде жүреді. Теледидарда күйіңіздің ескерілуі әдепкі бойынша өшірулі; қоспасаңыз, теледидар тек намаз уақыттарын көрсетеді. Рамазанда ауызашар мен сәресі санағышы, жұма күні жұма картасы да үлкен экранда көрінеді.',
                ctaEtiketi: 'Менің құрылғыларымды ашу',
                detaylar: [
                    'Телефонда да, теледидарда да расталатын жұптастыру',
                    'Ақпарат шифрланған, тек үйіңіздің желісінде',
                    'Уақыт тарылғанда теледидарда үнсіз еске салу жолағы',
                    'Рамазанда ауызашар мен сәресі санағышы, жұма күні жұма картасы',
                    'Теледидарды кез келген уақытта екі жақтан да жоюға болады',
                ],
            },
            ky: {
                baslik: 'Сыналгыңыз окуган намаздарыңызды билет',
                aciklama: 'Үйдөгү сыналгыларды Түзмөктөрүм бөлүмүнөн башкарыңыз. Кааласаңыз, сыналгы кайсы намаздарды окуганыңызды билет; убакыт тарып, намаз окула элек болсо, экрандын ылдыйында тынч тилке көрсөтөт.',
                detayAciklama: 'Биринчи жупташтырууда телефон менен сыналгы бири-бирин ырасташат: телефонуңузда сыналгынын атын көрүп, сыналгыда пульт менен «Кошуу» дегенди басасыз. Андан кийин баары шифрленип, үйүңүздөгү Wi-Fi ичинде калат. Абалыңыздын сыналгыда эсептелиши демейки боюнча өчүк; аны күйгүзмөйүнчө сыналгы намаз убактыларын гана көрсөтөт. Рамазанда ооз ачар жана саарлык артка санактары, жума күнү жума карточкасы чоң экранда да көрүнөт.',
                ctaEtiketi: 'Түзмөктөрүмдү ачуу',
                detaylar: [
                    'Телефондо да, сыналгыда да ырасталган жупташтыруу',
                    'Шифрленген, үй тармагыңызда гана',
                    'Убакыт тарыганда сыналгыда тынч эскертүү тилкеси',
                    'Рамазанда ооз ачар жана саарлык артка санактары, жума күнү жума карточкасы',
                    'Сыналгыны каалаган убакта каалаган тараптан алып салыңыз',
                ],
            },
            tg: {
                baslik: 'Телевизори Шумо намозҳои хондаатонро медонад',
                aciklama: 'Телевизорҳои хонаро аз Дастгоҳҳои ман идора кунед. Агар хоҳед, телевизор медонад, ки кадом намозҳоро хондаед; вақте ки вақт танг мешавад ва нахондаед, дар поёни экран тасмаи бесадо нишон медиҳад.',
                detayAciklama: 'Ҳангоми ҷуфтсозии аввал телефон ва телевизор якдигарро тасдиқ мекунанд: номи телевизорро дар телефонатон мебинед ва дар телевизор бо пулти идора «Илова кунед»-ро пахш мекунед. Баъд аз он ҳама чиз рамзгузорӣ шуда, дар Wi-Fi-и хонаатон мемонад. Ба ҳисоб гирифтани ҳолати Шумо дар телевизор бо пешфарз хомӯш аст; то онро фаъол накунед, телевизор танҳо вақтҳоро нишон медиҳад. Дар Рамазон ҳисобкунакҳои ифтор ва саҳарӣ ва дар рӯзҳои ҷумъа корти ҷумъа низ дар экрани калон пайдо мешаванд.',
                ctaEtiketi: 'Дастгоҳҳои манро кушоед',
                detaylar: [
                    'Ҷуфтсозӣ бо тасдиқ ҳам дар телефон ва ҳам дар телевизор',
                    'Рамзгузоришуда, танҳо дар шабакаи хонаи Шумо',
                    'Тасмаи бесадои ёдоварӣ дар телевизор ҳангоми танг шудани вақт',
                    'Ҳисобкунакҳои ифтор ва саҳарӣ дар Рамазон, корти ҷумъа дар рӯзҳои ҷумъа',
                    'Телевизорро ҳар вақт аз ҳар ду тараф хориҷ кунед',
                ],
            },
            sw: {
                baslik: 'TV yako inajua Swala unazoswali',
                aciklama: 'Dhibiti TV za nyumbani kutoka Vifaa vyangu. Ukipenda, TV inajua Swala ulizoswali; muda unapopungua na hujaswali, inaonyesha bango tulivu chini ya skrini.',
                detayAciklama: 'Mara ya kwanza mnapounganisha, simu na TV zinaidhinishana: unaona jina la TV kwenye simu yako na kubonyeza "Ongeza" kwa rimoti kwenye TV. Baada ya hapo kila kitu kinasimbwa na kinabaki kwenye Wi-Fi ya nyumbani kwako. Kuhesabu hali yako kwenye TV kumezimwa kwa chaguo-msingi; usipokuwasha, TV inaonyesha nyakati za Swala tu. Katika Ramadhani muda uliobaki wa futari na daku, na siku ya Ijumaa kadi ya Ijumaa, huonekana pia kwenye skrini kubwa.',
                ctaEtiketi: 'Fungua Vifaa vyangu',
                detaylar: [
                    'Kuunganisha kunakoidhinishwa kwenye simu na kwenye TV',
                    'Kumesimbwa, kwenye mtandao wako wa nyumbani tu',
                    'Bango tulivu la kukumbusha kwenye TV muda unapopungua',
                    'Muda uliobaki wa futari na daku katika Ramadhani, kadi ya Ijumaa siku ya Ijumaa',
                    'Iondoe TV kutoka upande wowote wakati wowote',
                ],
            },
            ha: {
                baslik: 'Talabijin ɗinku ta san sallolin da kuke yi',
                aciklama: 'Ku sarrafa talabijin na gida daga Naʼurorina. Idan kuna so, talabijin tana sanin sallolin da kuka yi; idan lokaci ya ƙure kuma ba ku yi salla ba, tana nuna tuta ta shiru a ƙasan allo.',
                detayAciklama: 'A haɗawa ta farko, waya da talabijin suna amincewa da juna: kuna ganin sunan talabijin a wayarku kuma kuna danna "Ƙara" da rimot a talabijin. Bayan haka komai a ɓoye yake kuma yana zama a Wi-Fi na gidanku. Ƙidaya halinku a talabijin a kashe take da farko; sai idan kun kunna ta, talabijin tana nuna lokutan salla kaɗai. A Ramadan ƙidayar buɗa baki da sahur, a ranar Jummaʼa kuma katin Jumuʼa, suna bayyana a babban allo ma.',
                ctaEtiketi: 'Buɗe Naʼurorina',
                detaylar: [
                    'Haɗawa da aka amince da ita a waya da talabijin',
                    'A ɓoye, a hanyar sadarwar gidanku kaɗai',
                    'Tutar tunatarwa ta shiru a talabijin idan lokaci ya ƙure',
                    'Ƙidayar buɗa baki da sahur a Ramadan, katin Jumuʼa a ranar Jummaʼa',
                    'Ku cire talabijin daga kowane ɓangare a kowane lokaci',
                ],
            },
            am: {
                baslik: 'ቴሌቪዥንዎ የሚሰግዷቸውን ሶላቶች ያውቃል',
                aciklama: 'በቤት ያሉ ቴሌቪዥኖችን ከመሣሪያዎቼ ያስተዳድሩ። ከፈለጉ ቴሌቪዥኑ የትኞቹን ሶላቶች እንደሰገዱ ያውቃል፤ ጊዜው ሲያጥር እና ካልሰገዱ በገጹ ግርጌ ጸጥ ያለ ሰንደቅ ያሳያል።',
                detayAciklama: 'በመጀመሪያው ማጣመር ስልኩ እና ቴሌቪዥኑ እርስ በርሳቸው ያረጋግጣሉ፦ የቴሌቪዥኑን ስም በስልክዎ ላይ ያያሉ፤ በቴሌቪዥኑ ላይ በሪሞቱ “አክል”ን ይጫናሉ። ከዚያ በኋላ ሁሉም ነገር የተመሰጠረ ሲሆን በቤትዎ Wi-Fi ላይ ይቆያል። ሁኔታዎን በቴሌቪዥኑ ላይ መቁጠር በነባሪነት ጠፍቷል፤ ካላበሩት ቴሌቪዥኑ የሶላት ሰዓቶችን ብቻ ያሳያል። በረመዳን የኢፍጣር እና የሱሑር ቆጠራዎች፣ በዓርብ ደግሞ የጁሙዓ ካርድ በትልቁ ገጽ ላይም ይታያሉ።',
                ctaEtiketi: 'መሣሪያዎቼን ክፈት',
                detaylar: [
                    'በስልኩም በቴሌቪዥኑም የሚረጋገጥ ማጣመር',
                    'የተመሰጠረ፣ በቤትዎ አውታረ መረብ ላይ ብቻ',
                    'ጊዜው ሲያጥር በቴሌቪዥኑ ላይ ጸጥ ያለ የአስታዋሽ ሰንደቅ',
                    'በረመዳን የኢፍጣር እና የሱሑር ቆጠራዎች፣ በዓርብ የጁሙዓ ካርድ',
                    'በማንኛውም ጊዜ ቴሌቪዥኑን ከየትኛውም በኩል ያስወግዱት',
                ],
            },
            om: {
                baslik: 'TV-n keessan salaata isin salaattan ni beeka',
                aciklama: 'TV mana keessaa Meeshaalee koo irraa bulchaa. Yoo barbaaddan, TV-n salaata isin salaattan ni beeka; yeroo yeroon gabaabbatee hin salaatin, fuula gadii irratti baanarii callisaa agarsiisa.',
                detayAciklama: "Yeroo jalqabaaf walqabsiiftan, bilbilliifi TV-n wal mirkaneessu: maqaa TV bilbila keessan irratti argitanii TV irratti rimootiin \"Dabalaa\" dhiibdu. Sana booda wanti hundi iccitiin eegamee Wi-Fi mana keessanii irra hafa. Haala keessan TV irratti lakkaa'uun akka durtiitti cufaa dha; yoo hin bantan, TV-n yeroo salaataa qofa agarsiisa. Ramadaana keessa lakkoofsi duubaa afursaafi suhuuraa, Jimaata immoo kaardiin Jimaataa fuula guddaa irrattis mul'atu.",
                ctaEtiketi: 'Meeshaalee koo banaa',
                detaylar: [
                    "Walqabsiisa bilbilaafi TV lamaanuu irratti mirkanaa'u",
                    'Iccitiin eegame, neetworkii mana keessanii qofa irratti',
                    'Yeroo yeroon gabaabbatu TV irratti baanarii yaadachiisaa callisaa',
                    'Ramadaana keessa lakkoofsa duubaa afursaafi suhuuraa, Jimaata kaardii Jimaataa',
                    'Yeroo kamiyyuu TV gama kamiinuu haquu dandeessu',
                ],
            },
            so: {
                baslik: 'Telefishankaagu wuu yaqaan salaadaha aad tukato',
                aciklama: 'Ka maamul telefishannada guriga Qalabkayga. Haddii aad rabto, telefishanku wuu ogaanayaa salaadaha aad tukatay; marka waqtigu yaraado oo aadan tukan, wuxuu muujiyaa xarig aamusan hoosta shaashadda.',
                detayAciklama: 'Isku xirka koowaad, taleefanka iyo telefishanku way is oggolaadaan: waxaad taleefankaaga ku aragtaa magaca telefishanka waxaadna telefishanka kontaroolka ku riixdaa "Ku dar". Intaas kadib wax walba waa sir oo waxay ku haraan Wi-Fi-ga gurigaaga. Ku tirinta xaaladdaada telefishanka si caadi ah waa dansan tahay; ilaa aad shiddo, telefishanku wuxuu muujiyaa oo kaliya waqtiyada salaadda. Ramadaanka tirinta afurka iyo suxuurta, maalmaha Jimcahana kaarka Jimce, waxay sidoo kale ka muuqdaan shaashadda weyn.',
                ctaEtiketi: 'Fur Qalabkayga',
                detaylar: [
                    'Isku xir lagu oggolaaday taleefanka iyo telefishanka labadaba',
                    'Sir ah, oo kaliya shabakadda gurigaaga',
                    'Xarig xusuusin aamusan oo telefishanka ah marka waqtigu yaraado',
                    'Tirinta afurka iyo suxuurta Ramadaanka, kaarka Jimce maalmaha Jimcaha',
                    'Ka saar telefishanka dhinac kasta goor kasta',
                ],
            },
            ff: {
                baslik: 'Telewisiyon mon hino anndi juulɗe ɗe on juulii',
                aciklama: 'Toppitee telewisiyonji galle iwrude e Kaɓirɗe am. So njiɗon, telewisiyon ngon hino anndi juulɗe ɗe on juulii; so waqutu hino raɓɓina tawa on juulaali, hino holla banndeer deƴƴunde les yaynirde.',
                detayAciklama: 'E jokkondirgol arangol, talifon e telewisiyon hino jaɓondira: hiɗon njiya innde telewisiyon ngon e talifon mon, dobon “Ɓeydee” e telekomaand e telewisiyon. Caggal ɗuum huunde kala ko sirlinaande, hino heddoo e Wi-Fi galle mon. Limgol ngonka mon e telewisiyon ñifaama ko woowaa; si on huɓɓinaali ɗum, telewisiyon ngon hollata saa’iiji juulɗe tan. E Suumayee saa’i heddiiɗo huntaari e suhuur, e aljuma kaartal Juma, hino ɓanngoo e yaynirde mawnde kadi.',
                ctaEtiketi: 'Udditee Kaɓirɗe am',
                detaylar: [
                    'Jokkondirgol jaɓaangol e talifon e telewisiyon fow',
                    'Sirlinaaɗo, e laylaytol galle mon tan',
                    'Banndeer siftinoore deƴƴunde e telewisiyon so waqutu hino raɓɓina',
                    'Saa’i heddiiɗo huntaari e suhuur e Suumayee, kaartal Juma e aljuma',
                    'Ittee telewisiyon ngon e baŋŋe kala sahaa kala',
                ],
            },
            yo: {
                baslik: 'Tẹlifíṣọ̀n yín mọ àwọn ìrun tí ẹ ń kí',
                aciklama: 'Ẹ ṣàkóso àwọn tẹlifíṣọ̀n nílé láti Àwọn ẹ̀rọ mi. Tí ẹ bá fẹ́, tẹlifíṣọ̀n yóò mọ àwọn ìrun tí ẹ ti kí; nígbà tí àkókò bá ń tán tí ẹ kò sì tíì kírun, yóò fi àsíá aláìláriwo hàn nísàlẹ̀ ojú ìbòjú.',
                detayAciklama: 'Ní ìsopọ̀ àkọ́kọ́, fóònù àti tẹlifíṣọ̀n ń fọwọ́ sí ara wọn: ẹ ó rí orúkọ tẹlifíṣọ̀n lórí fóònù yín, ẹ ó sì tẹ "Fi kún un" pẹ̀lú rìmóòtù lórí tẹlifíṣọ̀n. Lẹ́yìn náà ohun gbogbo wà ní ìpamọ́, ó sì ń wà lórí Wi-Fi ilé yín. Kíka ipò yín lórí tẹlifíṣọ̀n wà ní pípa ní ìbẹ̀rẹ̀; àfi tí ẹ bá tàn án, tẹlifíṣọ̀n ń fi àwọn àkókò ìrun nìkan hàn. Ní Rọmọdọ̄n, ìkàsẹ̀yìn ìsinu àti sààrì, àti ní Ọjọ́ Ẹtì káàdì Jum‘ah, ń hàn lórí ojú-ìbòjú ńlá pẹ̀lú.',
                ctaEtiketi: 'Ṣí Àwọn ẹ̀rọ mi',
                detaylar: [
                    'Ìsopọ̀ tí a fọwọ́ sí lórí fóònù àti tẹlifíṣọ̀n',
                    'Ní ìpamọ́, lórí nẹ́tíwọ́ọ̀kì ilé yín nìkan',
                    'Àsíá ìránnilétí aláìláriwo lórí tẹlifíṣọ̀n nígbà tí àkókò bá ń tán',
                    'Ìkàsẹ̀yìn ìsinu àti sààrì ní Rọmọdọ̄n, káàdì Jum‘ah ní Ọjọ́ Ẹtì',
                    'Ẹ lè yọ tẹlifíṣọ̀n kúrò láti ẹ̀gbẹ́ èyíkéyìí nígbàkúùgbà',
                ],
            },
        },
    },
    // Vakit girdi bildirimine vakit başına ses + kendi ses dosyanız (ezan kaydı dahil).
    {
        id: 'vakit-girdi-sesi-ve-kendi-dosyaniz',
        platformlar: ['android'],
        surum: '0.64.0',
        tarih: '2026-10-21',
        baslik: 'Vakit girince kendi sesiniz çalsın',
        aciklama:
            'Her vakit için bildirim sesini ayrı seçin; telefonunuzdaki bir ses dosyasını, örneğin sevdiğiniz bir ezan kaydını da ekleyebilirsiniz.',
        detayAciklama:
            'Hatırlatmalar > Vakit girince sayfasında açık her vaktin altında ses satırı var. Telefonun seslerinden seçebilir ya da kendi dosyanızı ekleyebilirsiniz. Eklediğiniz dosya telefonunuzun Bildirimler klasörüne kopyalanır; asıl dosyayı silseniz de ses çalmaya devam eder. Aynı yol Namaz Muhafızı adımlarında da var.',
        detaylar: [
            'Sabah, öğle, ikindi, akşam ve yatsı için ayrı ses',
            'Kendi ses dosyanız: MP3, M4A, OGG ya da WAV',
            'Seçtiğiniz ses bildirim gelince çalar, bildirimi kapatınca susar',
            'Namaz Muhafızı adımlarında da kendi dosyanızı seçebilirsiniz',
        ],
        ikon: 'music',
        hedefSayfa: 'VakitGirinceAyarlari',
        ctaEtiketi: 'Ses seçin',
        kartGoster: true,
        yetenek: 'sesDosyasi',
        ceviri: {
            en: {
                baslik: 'Play your own sound when a prayer time begins',
                aciklama:
                    'Choose a separate notification sound for each prayer; you can also add a sound file from your phone, such as a favorite adhan recording.',
                detayAciklama:
                    'Under Reminders › When a prayer time begins, each enabled prayer has a sound row. Pick one of your phone\'s sounds or add your own file. The file is copied to your phone\'s Notifications folder, so the sound keeps playing even if you delete the original. The same option is available in Prayer Guardian steps.',
                ctaEtiketi: 'Choose a sound',
                detaylar: [
                    'A separate sound for Fajr, Dhuhr, Asr, Maghrib and Isha',
                    'Your own sound file: MP3, M4A, OGG or WAV',
                    'The sound plays when the notification arrives and stops when you dismiss it',
                    'You can pick your own file in Prayer Guardian steps too',
                ],
            },
            id: {
                baslik: 'Putar suara pilihan Anda saat masuk waktu salat',
                aciklama: 'Pilih suara notifikasi terpisah untuk setiap waktu salat; Anda juga dapat menambahkan file suara dari ponsel, misalnya rekaman azan favorit Anda.',
                detayAciklama: 'Di Pengingat › Saat masuk waktu, setiap waktu salat yang aktif memiliki baris suara. Pilih salah satu suara ponsel atau tambahkan file Anda sendiri. File disalin ke folder Notifikasi di ponsel Anda, sehingga suara tetap berbunyi meskipun file aslinya dihapus. Pilihan yang sama tersedia di langkah-langkah Penjaga Salat.',
                ctaEtiketi: 'Pilih suara',
                detaylar: [
                    'Suara terpisah untuk Subuh, Dzuhur, Ashar, Maghrib, dan Isya',
                    'File suara Anda sendiri: MP3, M4A, OGG, atau WAV',
                    'Suara berbunyi saat notifikasi datang dan berhenti saat Anda menutupnya',
                    'Anda juga dapat memilih file sendiri di langkah-langkah Penjaga Salat',
                ],
            },
            de: {
                baslik: 'Ihr eigener Ton zum Beginn der Gebetszeit',
                aciklama: 'Wählen Sie für jede Gebetszeit einen eigenen Benachrichtigungston; Sie können auch eine Audiodatei von Ihrem Telefon hinzufügen, etwa Ihre liebste Adhan-Aufnahme.',
                detayAciklama: 'Unter Erinnerungen › Bei Beginn der Gebetszeit hat jede eingeschaltete Gebetszeit eine Zeile für den Ton. Wählen Sie einen Ton Ihres Telefons oder fügen Sie Ihre eigene Datei hinzu. Die Datei wird in den Ordner „Notifications“ Ihres Telefons kopiert, sodass der Ton weiter erklingt, auch wenn Sie das Original löschen. Dieselbe Möglichkeit gibt es in den Schritten des Gebetswächters.',
                ctaEtiketi: 'Ton wählen',
                detaylar: [
                    'Ein eigener Ton für Fajr, Dhuhr, Asr, Maghrib und Isha',
                    'Ihre eigene Audiodatei: MP3, M4A, OGG oder WAV',
                    'Der Ton erklingt, wenn die Benachrichtigung kommt, und verstummt, wenn Sie sie schließen',
                    'Auch in den Schritten des Gebetswächters können Sie eine eigene Datei wählen',
                ],
            },
            fr: {
                baslik: 'Votre propre son au début de l’heure de prière',
                aciklama: 'Choisissez un son de notification distinct pour chaque prière ; vous pouvez aussi ajouter un fichier audio de votre téléphone, par exemple un enregistrement d’adhan que vous aimez.',
                detayAciklama: 'Dans Rappels › Au début de l’heure, chaque prière activée a une ligne de son. Choisissez parmi les sons du téléphone ou ajoutez votre propre fichier. Le fichier est copié dans le dossier Notifications de votre téléphone ; le son continue de jouer même si vous supprimez l’original. La même option existe dans les étapes du Gardien de la prière.',
                ctaEtiketi: 'Choisir un son',
                detaylar: [
                    'Un son distinct pour Fajr, Dhuhr, Asr, Maghrib et Isha',
                    'Votre propre fichier audio : MP3, M4A, OGG ou WAV',
                    'Le son joue à l’arrivée de la notification et s’arrête quand vous la fermez',
                    'Vous pouvez aussi choisir votre propre fichier dans les étapes du Gardien de la prière',
                ],
            },
            bs: {
                baslik: 'Vaš vlastiti zvuk kada vakat nastupi',
                aciklama: 'Odaberite poseban zvuk obavještenja za svaki vakat; možete dodati i zvučnu datoteku s telefona, na primjer omiljeni snimak ezana.',
                detayAciklama: 'U Podsjetnici › Kada vakat nastupi svaki uključeni vakat ima red za zvuk. Odaberite jedan od zvukova telefona ili dodajte vlastitu datoteku. Datoteka se kopira u mapu Obavještenja na telefonu, pa zvuk radi i ako izbrišete original. Ista mogućnost postoji i u koracima Čuvara namaza.',
                ctaEtiketi: 'Odaberite zvuk',
                detaylar: [
                    'Poseban zvuk za zoru, podne, ikindiju, akšam i jaciju',
                    'Vaša vlastita zvučna datoteka: MP3, M4A, OGG ili WAV',
                    'Zvuk svira kada stigne obavještenje i prestaje kada ga zatvorite',
                    'Vlastitu datoteku možete odabrati i u koracima Čuvara namaza',
                ],
            },
            ru: {
                baslik: 'Свой звук при наступлении времени намаза',
                aciklama: 'Выберите отдельный звук уведомления для каждого намаза; можно также добавить звуковой файл с телефона, например любимую запись азана.',
                detayAciklama: 'В разделе Напоминания › С наступлением времени у каждого включённого намаза есть строка звука. Выберите один из звуков телефона или добавьте свой файл. Файл копируется в папку уведомлений телефона, поэтому звук продолжит играть, даже если удалить оригинал. Та же возможность есть в шагах Стража намаза.',
                ctaEtiketi: 'Выбрать звук',
                detaylar: [
                    'Отдельный звук для Фаджра, Зухра, Асра, Магриба и Иша',
                    'Свой звуковой файл: MP3, M4A, OGG или WAV',
                    'Звук играет при поступлении уведомления и умолкает, когда вы его закрываете',
                    'Свой файл можно выбрать и в шагах Стража намаза',
                ],
            },
            ms: {
                baslik: 'Mainkan bunyi anda sendiri apabila masuk waktu solat',
                aciklama: 'Pilih bunyi pemberitahuan berasingan bagi setiap waktu; anda juga boleh menambah fail bunyi dari telefon anda, seperti rakaman azan kegemaran anda.',
                detayAciklama: 'Di Peringatan › Apabila masuk waktu, setiap waktu yang dihidupkan mempunyai baris bunyi. Pilih salah satu bunyi telefon anda atau tambah fail anda sendiri. Fail itu disalin ke folder Pemberitahuan telefon anda, jadi bunyi tetap dimainkan walaupun anda memadam fail asal. Pilihan yang sama tersedia dalam langkah Penjaga Solat.',
                ctaEtiketi: 'Pilih bunyi',
                detaylar: [
                    'Bunyi berasingan untuk Subuh, Zohor, Asar, Maghrib dan Isyak',
                    'Fail bunyi anda sendiri: MP3, M4A, OGG atau WAV',
                    'Bunyi dimainkan apabila pemberitahuan sampai dan berhenti apabila anda menutupnya',
                    'Anda juga boleh memilih fail anda sendiri dalam langkah Penjaga Solat',
                ],
            },
            ar: {
                baslik: 'صوتك الخاص عند دخول الوقت',
                aciklama: 'اختيار صوت إشعار مستقل لكل صلاة؛ ويمكن أيضًا إضافة ملف صوتي من هاتفك، مثل تسجيل أذان مفضّل.',
                detayAciklama: 'في التذكيرات › عند دخول الوقت، لكل صلاة مفعّلة سطر للصوت. يمكن اختيار أحد أصوات هاتفك أو إضافة ملفك الخاص. يُنسخ الملف إلى مجلد الإشعارات في هاتفك، فيبقى الصوت يعمل حتى لو حُذف الأصل. والخيار نفسه متاح في خطوات «قبل خروج الوقت».',
                ctaEtiketi: 'اختيار صوت',
                detaylar: [
                    'صوت مستقل للفجر والظهر والعصر والمغرب والعشاء',
                    'ملفك الصوتي الخاص: MP3 أو M4A أو OGG أو WAV',
                    'يُشغَّل الصوت عند وصول الإشعار ويتوقف عند إغلاقه',
                    'يمكن اختيار ملفك الخاص في خطوات «قبل خروج الوقت» أيضًا',
                ],
            },
            ur: {
                baslik: 'نماز کا وقت شروع ہونے پر اپنی پسند کی آواز',
                aciklama: 'ہر نماز کے لیے الگ اطلاع کی آواز منتخب کریں؛ فون سے کوئی آواز کی فائل بھی شامل کی جا سکتی ہے، جیسے پسندیدہ اذان کی ریکارڈنگ۔',
                detayAciklama: 'یاد دہانیاں › وقت شروع ہونے پر میں ہر آن نماز کی آواز کی ایک قطار ہے۔ فون کی آوازوں میں سے کوئی چنیں یا اپنی فائل شامل کریں۔ فائل فون کے Notifications فولڈر میں نقل ہو جاتی ہے، اس لیے اصل فائل حذف کرنے پر بھی آواز بجتی رہتی ہے۔ یہی سہولت نماز محافظ کے مراحل میں بھی ہے۔',
                ctaEtiketi: 'آواز منتخب کریں',
                detaylar: [
                    'فجر، ظہر، عصر، مغرب اور عشاء کے لیے الگ آواز',
                    'اپنی آواز کی فائل: MP3، M4A، OGG یا WAV',
                    'آواز اطلاع آنے پر بجتی ہے اور اطلاع بند کرنے پر رک جاتی ہے',
                    'نماز محافظ کے مراحل میں بھی اپنی فائل چنی جا سکتی ہے',
                ],
            },
            es: {
                baslik: 'Su propio sonido al comenzar la hora del rezo',
                aciklama: 'Elija un sonido de notificación distinto para cada rezo; también puede añadir un archivo de sonido de su teléfono, como su grabación favorita del adhan.',
                detayAciklama: 'En Recordatorios › Al comenzar la hora, cada rezo activado tiene una fila de sonido. Elija uno de los sonidos de su teléfono o añada su propio archivo. El archivo se copia en la carpeta de notificaciones de su teléfono, así que el sonido sigue funcionando aunque borre el original. La misma opción está disponible en los pasos del Guardián del rezo.',
                ctaEtiketi: 'Elegir un sonido',
                detaylar: [
                    'Un sonido distinto para Fajr, Dhuhr, Asr, Maghrib e Isha',
                    'Su propio archivo de sonido: MP3, M4A, OGG o WAV',
                    'El sonido suena al llegar la notificación y calla al cerrarla',
                    'También puede elegir su propio archivo en los pasos del Guardián del rezo',
                ],
            },
            nl: {
                baslik: 'Uw eigen geluid wanneer een gebedstijd begint',
                aciklama: 'Kies voor elk gebed een eigen meldingsgeluid; u kunt ook een geluidsbestand van uw telefoon toevoegen, zoals een geliefde opname van de adhan.',
                detayAciklama: 'Onder Herinneringen › Bij gebedstijd heeft elk ingeschakeld gebed een geluidsregel. Kies een van de geluiden van uw telefoon of voeg uw eigen bestand toe. Het bestand wordt naar de map Meldingen van uw telefoon gekopieerd, zodat het geluid blijft werken, ook als u het origineel verwijdert. Dezelfde optie is beschikbaar in de stappen van de Gebedswachter.',
                ctaEtiketi: 'Een geluid kiezen',
                detaylar: [
                    'Een apart geluid voor Fajr, Dhuhr, Asr, Maghrib en Isha',
                    'Uw eigen geluidsbestand: MP3, M4A, OGG of WAV',
                    'Het geluid speelt wanneer de melding komt en stopt wanneer u die sluit',
                    'Ook in de stappen van de Gebedswachter kunt u uw eigen bestand kiezen',
                ],
            },
            sq: {
                baslik: 'Luani tingullin tuaj kur hyn koha e namazit',
                aciklama: 'Zgjidhni një tingull të veçantë njoftimi për çdo vakt; mund të shtoni edhe një skedar zëri nga telefoni, si një regjistrim ezani që e pëlqeni.',
                detayAciklama: 'Te Kujtesat › Kur hyn koha, çdo vakt i aktivizuar ka një rresht tingulli. Zgjidhni një nga tingujt e telefonit ose shtoni skedarin tuaj. Skedari kopjohet në dosjen e Njoftimeve të telefonit, prandaj tingulli vazhdon të luhet edhe nëse e fshini origjinalin. I njëjti opsion është edhe në hapat e Rojtarit të namazit.',
                ctaEtiketi: 'Zgjidhni një tingull',
                detaylar: [
                    'Tingull i veçantë për sabahun, drekën, ikindinë, akshamin dhe jacinë',
                    'Skedari juaj i zërit: MP3, M4A, OGG ose WAV',
                    'Tingulli luhet kur vjen njoftimi dhe ndalet kur e mbyllni',
                    'Skedarin tuaj mund ta zgjidhni edhe në hapat e Rojtarit të namazit',
                ],
            },
            hi: {
                baslik: 'नमाज़ का वक़्त शुरू होने पर अपनी आवाज़ बजाएं',
                aciklama: 'हर नमाज़ के लिए सूचना की अलग आवाज़ चुनें; अपने फ़ोन से कोई आवाज़ की फ़ाइल भी जोड़ी जा सकती है, जैसे पसंदीदा अज़ान की रिकॉर्डिंग।',
                detayAciklama: 'रिमाइंडर › वक़्त शुरू होने पर में हर चालू नमाज़ की एक आवाज़ वाली लाइन है। फ़ोन की आवाज़ों में से कोई एक चुनें या अपनी फ़ाइल जोड़ें। फ़ाइल फ़ोन के Notifications फ़ोल्डर में कॉपी हो जाती है, इसलिए असली फ़ाइल मिटाने पर भी आवाज़ बजती रहती है। यही विकल्प नमाज़ मुहाफ़िज़ के क़दमों में भी है।',
                ctaEtiketi: 'आवाज़ चुनें',
                detaylar: [
                    'फ़ज्र, ज़ुहर, अस्र, मग़रिब और इशा के लिए अलग आवाज़',
                    'अपनी आवाज़ की फ़ाइल: MP3, M4A, OGG या WAV',
                    'आवाज़ सूचना आने पर बजती है और सूचना हटाने पर रुक जाती है',
                    'नमाज़ मुहाफ़िज़ के क़दमों में भी अपनी फ़ाइल चुनी जा सकती है',
                ],
            },
            bn: {
                baslik: 'নামাজের ওয়াক্ত শুরু হলে নিজের শব্দ বাজান',
                aciklama: 'প্রতিটি নামাজের জন্য আলাদা নোটিফিকেশনের শব্দ বেছে নিন; ফোন থেকে নিজের শব্দের ফাইলও যোগ করতে পারেন, যেমন প্রিয় কোনো আযানের রেকর্ডিং।',
                detayAciklama: 'রিমাইন্ডার › নামাজের ওয়াক্ত শুরু হলে-তে চালু থাকা প্রতিটি নামাজের একটি শব্দের সারি আছে। ফোনের শব্দগুলোর একটি বেছে নিন বা নিজের ফাইল যোগ করুন। ফাইলটি আপনার ফোনের Notifications ফোল্ডারে কপি হয়, তাই মূল ফাইল মুছে ফেললেও শব্দ বাজতে থাকে। নামাজ প্রহরীর ধাপগুলোতেও একই বিকল্প আছে।',
                ctaEtiketi: 'শব্দ বেছে নিন',
                detaylar: [
                    'ফজর, যোহর, আসর, মাগরিব ও ইশার জন্য আলাদা শব্দ',
                    'নিজের শব্দের ফাইল: MP3, M4A, OGG বা WAV',
                    'নোটিফিকেশন এলে শব্দ বাজে এবং সরিয়ে দিলে থেমে যায়',
                    'নামাজ প্রহরীর ধাপগুলোতেও নিজের ফাইল বেছে নিতে পারেন',
                ],
            },
            fa: {
                baslik: 'صدای خودتان هنگام رسیدن وقت نماز',
                aciklama: 'برای هر نماز صدای اعلان جداگانه‌ای انتخاب کنید؛ می‌توانید فایل صوتی‌ای از تلفن خود، مانند ضبط اذانی که دوست دارید، هم بیفزایید.',
                detayAciklama: 'در یادآوری‌ها › هنگام رسیدن وقت، هر نماز روشن یک ردیف صدا دارد. یکی از صداهای تلفن را برگزینید یا فایل خودتان را بیفزایید. فایل در پوشهٔ اعلان‌های تلفن کپی می‌شود، پس حتی اگر اصلش را پاک کنید صدا پخش می‌شود. همین گزینه در مرحله‌های نگهبان نماز هم هست.',
                ctaEtiketi: 'انتخاب صدا',
                detaylar: [
                    'صدایی جداگانه برای صبح، ظهر، عصر، مغرب و عشا',
                    'فایل صوتی خودتان: MP3، M4A، OGG یا WAV',
                    'صدا با رسیدن اعلان پخش می‌شود و با بستن آن قطع می‌شود',
                    'در مرحله‌های نگهبان نماز هم می‌توانید فایل خودتان را برگزینید',
                ],
            },
            ps: {
                baslik: 'د لمانځه د وخت په پیل کې خپل غږ وغږوئ',
                aciklama: 'د هر لمانځه لپاره د خبرتیا جلا غږ وټاکئ؛ کولای شئ له خپل موبایل څخه د غږ فایل هم اضافه کړئ، لکه د اذان یو خوښ ثبت.',
                detayAciklama: 'په یادونې › د وخت په پیل کې برخه کې، هر فعال لمونځ د غږ کرښه لري. د خپل موبایل له غږونو یو وټاکئ یا خپل فایل اضافه کړئ. فایل ستاسو د موبایل Notifications پوښۍ ته کاپي کېږي، نو که اصلي فایل ړنګ کړئ هم غږ کار کوي. همدا انتخاب د لمانځه ساتونکي په ګامونو کې هم شته.',
                ctaEtiketi: 'غږ وټاکئ',
                detaylar: [
                    'د سهار، ماسپښین، مازدیګر، ماښام او ماسخوتن لپاره جلا غږ',
                    'ستاسو خپل د غږ فایل: MP3، M4A، OGG یا WAV',
                    'غږ د خبرتیا په راتلو غږېږي او کله چې یې وتړئ درېږي',
                    'د لمانځه ساتونکي په ګامونو کې هم خپل فایل ټاکلای شئ',
                ],
            },
            ckb: {
                baslik: 'کاتێک کاتی نوێژ دێت دەنگی خۆتان لێبدەن',
                aciklama: 'بۆ ھەر نوێژێک دەنگێکی جیای ئاگادارکردنەوە ھەڵبژێرن؛ دەتوانن فایلێکی دەنگیش لە مۆبایلەکەتانەوە زیاد بکەن، وەک تۆمارێکی بانگی دڵخوازتان.',
                detayAciklama: 'لە بیرخستنەوەکان › کاتێک کاتی نوێژ دێت، ھەر نوێژێکی چالاک ڕیزێکی دەنگی ھەیە. یەکێک لە دەنگەکانی مۆبایلەکەتان ھەڵبژێرن یان فایلی خۆتان زیاد بکەن. فایلەکە کۆپی دەکرێت بۆ بوخچەی ئاگادارکردنەوەکانی مۆبایلەکەتان، بۆیە تەنانەت ئەگەر ئەسڵەکەی بسڕنەوە دەنگەکە ھەر لێدەدرێت. ھەمان ھەڵبژاردە لە ھەنگاوەکانی پارێزەری نوێژیشدا ھەیە.',
                ctaEtiketi: 'ھەڵبژاردنی دەنگ',
                detaylar: [
                    'دەنگێکی جیا بۆ بەیانی، نیوەڕۆ، عەسر، ئێوارە و خەوتنان',
                    'فایلی دەنگی خۆتان: MP3، M4A، OGG یان WAV',
                    'دەنگەکە کاتێک ئاگادارکردنەوەکە دێت لێدەدرێت و کاتێک لای دەبەن دەوەستێت',
                    'لە ھەنگاوەکانی پارێزەری نوێژیشدا دەتوانن فایلی خۆتان ھەڵبژێرن',
                ],
            },
            ug: {
                baslik: 'ناماز ۋاقتى كىرگەندە ئۆز ئاۋازىڭىز ياڭرىسۇن',
                aciklama: 'ھەر بىر ناماز ئۈچۈن ئايرىم ئۇقتۇرۇش ئاۋازى تاللاڭ؛ تېلېفونىڭىزدىكى بىر ئاۋاز ھۆججىتىنى، مەسىلەن ياقتۇرىدىغان بىر ئەزان ئۈنىنىمۇ قوشالايسىز.',
                detayAciklama: 'ئەسكەرتىشلەر › ۋاقىت كىرگەندە بېتىدە ئوچۇق ھەر بىر نامازنىڭ ئاستىدا ئاۋاز قۇرى بار. تېلېفونىڭىزنىڭ ئاۋازلىرىدىن بىرىنى تاللاڭ ياكى ئۆز ھۆججىتىڭىزنى قوشۇڭ. ھۆججەت تېلېفونىڭىزنىڭ ئۇقتۇرۇشلار قىسقۇچىغا كۆچۈرۈلىدۇ، شۇڭا ئەسلى ھۆججەتنى ئۆچۈرسىڭىزمۇ ئاۋاز ياڭراۋېرىدۇ. ناماز قوغدىغۇچى قەدەملىرىدىمۇ ئوخشاش تاللاش بار.',
                ctaEtiketi: 'ئاۋاز تاللاڭ',
                detaylar: [
                    'بامدات، پېشىن، ئەسىر، شام ۋە خۇپتەن ئۈچۈن ئايرىم ئاۋاز',
                    'ئۆز ئاۋاز ھۆججىتىڭىز: MP3، M4A، OGG ياكى WAV',
                    'ئاۋاز ئۇقتۇرۇش كەلگەندە ياڭرايدۇ، ئۇقتۇرۇشنى تاقىسىڭىز توختايدۇ',
                    'ناماز قوغدىغۇچى قەدەملىرىدىمۇ ئۆز ھۆججىتىڭىزنى تاللىيالايسىز',
                ],
            },
            az: {
                baslik: 'Vaxt daxil olanda öz səsinizi çalın',
                aciklama: 'Hər namaz üçün ayrıca bildiriş səsi seçin; telefonunuzdan, məsələn, sevdiyiniz azan qeydi kimi bir səs faylı da əlavə edə bilərsiniz.',
                detayAciklama: 'Xatırlatmalar › Vaxt daxil olanda bölməsində hər açıq vaxtın səs sətri var. Telefonunuzun səslərindən birini seçin və ya öz faylınızı əlavə edin. Fayl telefonunuzun Notifications qovluğuna köçürülür, ona görə əslini silsəniz də səs çalmağa davam edir. Eyni seçim Namaz Qoruyucusunun addımlarında da var.',
                ctaEtiketi: 'Səs seçin',
                detaylar: [
                    'Sübh, zöhr, əsr, məğrib və işa üçün ayrıca səs',
                    'Öz səs faylınız: MP3, M4A, OGG və ya WAV',
                    'Səs bildiriş gələndə çalır və bildirişi bağladıqda susur',
                    'Namaz Qoruyucusunun addımlarında da öz faylınızı seçə bilərsiniz',
                ],
            },
            uz: {
                baslik: 'Намоз вақти кирганда ўз овозингиз янграсин',
                aciklama: 'Ҳар бир намоз учун алоҳида билдиришнома овозини танланг; телефонингиздаги овоз файлини, масалан, ёқтирган азон ёзувингизни ҳам қўшишингиз мумкин.',
                detayAciklama: 'Эслатмалар › Намоз вақти кирганда бўлимида ёқилган ҳар бир намознинг овоз қатори бор. Телефон овозларидан бирини танланг ёки ўз файлингизни қўшинг. Файл телефонингизнинг Билдиришномалар жилдига нусхаланади, шунинг учун асл файлни ўчирсангиз ҳам овоз янграйверади. Худди шу имконият Намоз муҳофизи қадамларида ҳам бор.',
                ctaEtiketi: 'Овоз танлаш',
                detaylar: [
                    'Бомдод, пешин, аср, шом ва хуфтон учун алоҳида овоз',
                    'Ўз овоз файлингиз: MP3, M4A, OGG ёки WAV',
                    'Овоз билдиришнома келганда янграйди ва уни ёпганингизда тўхтайди',
                    'Намоз муҳофизи қадамларида ҳам ўз файлингизни танлашингиз мумкин',
                ],
            },
            kk: {
                baslik: 'Намаз уақыты кіргенде өз дыбысыңыз ойнасын',
                aciklama: 'Әр намаз уақыты үшін хабарландыру дыбысын бөлек таңдаңыз; телефоныңыздағы дыбыс файлын, мысалы, ұнайтын азан жазбасын да қоса аласыз.',
                detayAciklama: 'Еске салғыштар › Уақыт кіргенде бетінде қосулы әр уақыттың астында дыбыс жолы бар. Телефонның дыбыстарынан таңдай аласыз немесе өз файлыңызды қоса аласыз. Қосқан файлыңыз телефоныңыздың Хабарландырулар қалтасына көшіріледі; түпнұсқа файлды жойсаңыз да, дыбыс ойнай береді. Дәл осындай мүмкіндік Намаз сақшысының қадамдарында да бар.',
                ctaEtiketi: 'Дыбыс таңдау',
                detaylar: [
                    'Таң, бесін, екінті, ақшам және құптан үшін бөлек дыбыс',
                    'Өз дыбыс файлыңыз: MP3, M4A, OGG немесе WAV',
                    'Таңдаған дыбыс хабарландыру келгенде ойнайды, хабарландыруды жапқанда тоқтайды',
                    'Намаз сақшысының қадамдарында да өз файлыңызды таңдай аласыз',
                ],
            },
            ky: {
                baslik: 'Намаз убактысы киргенде өз үнүңүздү коюңуз',
                aciklama: 'Ар бир намаз үчүн өзүнчө билдирме үнүн тандаңыз; телефонуңуздагы үн файлын, мисалы, жакшы көргөн азан жазууңузду да кошо аласыз.',
                detayAciklama: 'Эскертмелер › Намаз убактысы киргенде бөлүмүндө күйгүзүлгөн ар бир намаздын үн сабы бар. Телефонуңуздун үндөрүнүн бирин тандаңыз же өз файлыңызды кошуңуз. Файл телефонуңуздун билдирмелер папкасына көчүрүлөт, ошондуктан түп нускасын өчүрсөңүз да үн ойной берет. Ушундай эле мүмкүнчүлүк Намаз сакчысынын кадамдарында да бар.',
                ctaEtiketi: 'Үн тандоо',
                detaylar: [
                    'Багымдат, бешим, аср, шам жана куптан үчүн өзүнчө үн',
                    'Өз үн файлыңыз: MP3, M4A, OGG же WAV',
                    'Үн билдирме келгенде ойнойт жана аны жапканыңызда токтойт',
                    'Намаз сакчысынын кадамдарында да өз файлыңызды тандай аласыз',
                ],
            },
            tg: {
                baslik: 'Ҳангоми расидани вақт садои худатонро гузоред',
                aciklama: 'Барои ҳар намоз садои ҷудогонаи огоҳинома интихоб кунед; инчунин метавонед файли садоро аз телефонатон, масалан сабти азони дӯстдоштаатонро, илова кунед.',
                detayAciklama: 'Дар Ёдовариҳо › Ҳангоми расидани вақт ҳар намози фаъол сатри садо дорад. Яке аз садоҳои телефонатонро интихоб кунед ё файли худатонро илова кунед. Файл ба ҷузвдони огоҳиномаҳои телефонатон нусхабардорӣ мешавад, бинобар ин ҳатто агар нусхаи аслиро нест кунед, садо садо медиҳад. Ҳамин имкон дар қадамҳои Нигаҳбони намоз низ ҳаст.',
                ctaEtiketi: 'Садо интихоб кунед',
                detaylar: [
                    'Садои ҷудогона барои бомдод, пешин, аср, шом ва хуфтан',
                    'Файли садои худатон: MP3, M4A, OGG ё WAV',
                    'Садо ҳангоми омадани огоҳинома садо медиҳад ва ҳангоми пӯшидани он хомӯш мешавад',
                    'Дар қадамҳои Нигаҳбони намоз низ файли худатонро интихоб карда метавонед',
                ],
            },
            sw: {
                baslik: 'Cheza sauti yako mwenyewe wakati wa Swala unapoingia',
                aciklama: 'Chagua sauti tofauti ya arifa kwa kila Swala; unaweza pia kuongeza faili la sauti kutoka kwenye simu yako, kama rekodi ya Adhana unayoipenda.',
                detayAciklama: 'Chini ya Vikumbusho › Wakati wa Swala unapoingia, kila Swala iliyowashwa ina safu ya sauti. Chagua mojawapo ya sauti za simu yako au uongeze faili lako mwenyewe. Faili linanakiliwa kwenye folda ya Notifications ya simu yako, kwa hivyo sauti inaendelea kucheza hata ukifuta faili la asili. Chaguo hilo hilo linapatikana katika hatua za Mlinzi wa Swala.',
                ctaEtiketi: 'Chagua sauti',
                detaylar: [
                    'Sauti tofauti kwa Alfajiri, Adhuhuri, Alasiri, Magharibi na Isha',
                    'Faili lako mwenyewe la sauti: MP3, M4A, OGG au WAV',
                    'Sauti inacheza arifa inapofika na inasimama ukiiondoa',
                    'Unaweza kuchagua faili lako mwenyewe katika hatua za Mlinzi wa Swala pia',
                ],
            },
            ha: {
                baslik: 'Kunna sautinku idan lokacin salla ya yi',
                aciklama: 'Ku zaɓi sautin sanarwa daban ga kowace salla; kuna kuma iya ƙara fayil na sauti daga wayarku, kamar naɗin kiran salla da kuka fi so.',
                detayAciklama: 'A Tunatarwa › Idan lokacin salla ya yi, kowace sallar da aka kunna tana da layin sauti. Ku zaɓi ɗaya daga cikin sautukan wayarku ko ku ƙara fayil ɗinku. Ana kwafin fayil ɗin zuwa babin Notifications na wayarku, don haka sautin yana ci gaba da kunnawa ko da kun share na asali. Zaɓi iri ɗaya yana samuwa a matakan Mai Tsaron Salla.',
                ctaEtiketi: 'Zaɓi sauti',
                detaylar: [
                    'Sauti daban ga Asuba, Azahar, Laʼasar, Magariba da Isha',
                    'Fayil na sautinku: MP3, M4A, OGG ko WAV',
                    'Sautin yana kunnawa idan sanarwa ta zo kuma yana tsayawa idan kuka kawar da ita',
                    'Kuna iya zaɓar fayil ɗinku a matakan Mai Tsaron Salla ma',
                ],
            },
            am: {
                baslik: 'የሶላት ሰዓት ሲገባ የራስዎን ድምፅ ያጫውቱ',
                aciklama: 'ለእያንዳንዱ ሶላት የተለየ የማሳወቂያ ድምፅ ይምረጡ፤ እንደሚወዱት የአዛን ቅጂ ያለ የድምፅ ፋይል ከስልክዎም ማከል ይችላሉ።',
                detayAciklama: 'በአስታዋሾች › የሶላት ሰዓት ሲገባ ስር፣ እያንዳንዱ የበራ ሶላት የድምፅ ረድፍ አለው። ከስልክዎ ድምፆች አንዱን ይምረጡ ወይም የራስዎን ፋይል ያክሉ። ፋይሉ ወደ ስልክዎ የማሳወቂያዎች አቃፊ ይቀዳል፤ ስለዚህ ዋናውን ቢሰርዙትም ድምፁ መጫወቱን ይቀጥላል። ተመሳሳይ አማራጭ በሶላት ጠባቂ ደረጃዎች ውስጥም ይገኛል።',
                ctaEtiketi: 'ድምፅ ምረጥ',
                detaylar: [
                    'ለፈጅር፣ ለዙህር፣ ለአስር፣ ለመግሪብ እና ለኢሻ የተለየ ድምፅ',
                    'የራስዎ የድምፅ ፋይል፦ MP3፣ M4A፣ OGG ወይም WAV',
                    'ድምፁ ማሳወቂያው ሲደርስ ይጫወታል፤ ሲያሰናብቱት ይቆማል',
                    'በሶላት ጠባቂ ደረጃዎች ውስጥም የራስዎን ፋይል መምረጥ ይችላሉ',
                ],
            },
            om: {
                baslik: 'Yeroo yeroon salaataa gahu sagalee ofii keessanii taphachiisaa',
                aciklama: 'Salaata tokkoon tokkoof sagalee beeksisaa addaa filadhaa; faayilii sagalee bilbila keessan irra jiru, kan akka galmee azaanaa jaallattanii, dabaluus dandeessu.',
                detayAciklama: "Yaadachiisa › Yeroo yeroon salaataa gahu jalatti, salaanni banaa ta'e hundi sarara sagalee qaba. Sagalee bilbila keessanii keessaa tokko filadhaa ykn faayilii ofii keessanii dabalaa. Faayiliin gara kuusaa Notifications bilbila keessaniitti garagalfama, kanaaf isa jalqabaa haqxanis sagaleen taphachuu itti fufa. Filannoon kun tarkaanfiilee Eegduu Salaataa keessattis ni jira.",
                ctaEtiketi: 'Sagalee filadhaa',
                detaylar: [
                    "Subhii, Zuhrii, Asrii, Maghribaafi Ishaa'iif sagalee addaa",
                    'Faayilii sagalee ofii keessanii: MP3, M4A, OGG ykn WAV',
                    'Sagaleen yeroo beeksisni dhufu taphatee yeroo cuftan dhaabata',
                    'Tarkaanfiilee Eegduu Salaataa keessattis faayilii ofii keessanii filachuu dandeessu',
                ],
            },
            so: {
                baslik: 'Ciyaar codkaaga marka waqti salaadeed galo',
                aciklama: 'Dooro cod ogeysiis oo gooni ah salaad kasta; waxaad sidoo kale ku dari kartaa fayl cod ah oo taleefankaaga ku jira, sida duubis aadaan oo aad jeceshahay.',
                detayAciklama: 'Xusuusinta › Marka waqti salaadeed galo hoostiisa, salaad kasta oo shidan waxay leedahay saf cod. Ka dooro codadka taleefankaaga ama ku dar faylkaaga. Faylka waxaa loo koobiyeeyaa galka ogeysiisyada taleefankaaga, sidaas darteed codku wuu sii ciyaarayaa xitaa haddii aad tirtirto kii asalka ahaa. Isla doorashadan waxaa laga heli karaa tallaabooyinka Ilaaliyaha Salaadda.',
                ctaEtiketi: 'Dooro cod',
                detaylar: [
                    'Cod gooni ah Subax, Duhur, Casar, Maghrib iyo Cishe',
                    'Faylkaaga codka: MP3, M4A, OGG ama WAV',
                    'Codku wuxuu ciyaaraa marka ogeysiisku yimaado wuxuuna joogsadaa marka aad iska xirto',
                    'Faylkaaga waxaad sidoo kale ka dooran kartaa tallaabooyinka Ilaaliyaha Salaadda',
                ],
            },
            ff: {
                baslik: 'Fijjee sowto mon e hoore mon so waqutu juulde heewii',
                aciklama: 'Suɓee sowto tintinal feere ngam juulde kala; hiɗon mbaawi kadi ɓeydude fiilde sowto iwrude e talifon mon, wa winndannde ewnaango nde njiɗ-ɗon.',
                detayAciklama: 'E Siftinooje › So waqutu juulde heewii, juulde kala huɓɓinaande hino jogii gorol sowto. Suɓee gooto e sowtooji talifon mon walla ɓeydee fiilde mon e hoore mon. Fiilde ndee hino nattee e doosiye Tintine talifon mon, ɗum noon sowto ngo hino fijjoo hay so on momtii fiilde adiinde ndee. Ngal suɓaade hino heɓoo kadi e taaɓe Ndeenoowo Juulde.',
                ctaEtiketi: 'Suɓee sowto',
                detaylar: [
                    'Sowto feere ngam subaka, fanaa, alansaraa, futuroo e geeƴe',
                    'Fiilde sowto mon e hoore mon: MP3, M4A, OGG walla WAV',
                    'Sowto ngo hino fijjee so tintinal ngal arii, hino darta so on ñifii ngal',
                    'Hiɗon mbaawi suɓude fiilde mon e taaɓe Ndeenoowo Juulde kadi',
                ],
            },
            yo: {
                baslik: 'Ohùn tiyín nígbà tí àkókò ìrun bá wọlé',
                aciklama: 'Ẹ yan ohùn ìfitónilétí ọ̀tọ̀ fún ìrun kọ̀ọ̀kan; ẹ tún lè fi fáìlì ohùn kan láti fóònù yín kún un, bí àkọsílẹ̀ ìpè ìrun tí ẹ fẹ́ràn.',
                detayAciklama: 'Lábẹ́ Ìránnilétí › Nígbà tí àkókò ìrun bá wọlé, ìrun kọ̀ọ̀kan tí ó wà ní títàn ní ìlà ohùn. Ẹ yan ọ̀kan nínú àwọn ohùn fóònù yín tàbí kí ẹ fi fáìlì tiyín kún un. A ń ṣe ẹ̀dà fáìlì náà sínú fóldà Notifications fóònù yín, nítorí náà ohùn náà yóò máa dún kódà tí ẹ bá pa èyí àkọ́kọ́ rẹ́. Àṣàyàn kan náà wà nínú àwọn ìgbésẹ̀ Olùṣọ́ Ìrun.',
                ctaEtiketi: 'Yan ohùn kan',
                detaylar: [
                    'Ohùn ọ̀tọ̀ fún Subh, Ṭḥuhr, ‘Asr, Mọgrib àti ‘Iṣā’',
                    'Fáìlì ohùn tiyín: MP3, M4A, OGG tàbí WAV',
                    'Ohùn náà ń dún nígbà tí ìfitónilétí bá dé, ó sì ń dúró nígbà tí ẹ bá pa á rẹ́',
                    'Ẹ tún lè yan fáìlì tiyín nínú àwọn ìgbésẹ̀ Olùṣọ́ Ìrun',
                ],
            },
        },
    },
    // iPhone "Namazda sessiz" — Odak + Kısayollar rehberi (Android'de Camideyim + Namaz modu var).
    {
        id: 'ios-namazda-sessiz-odak',
        platformlar: ['ios'],
        surum: '0.55.0',
        tarih: '2026-10-20',
        baslik: 'Camide telefonunuz sessize geçsin',
        aciklama:
            'Namaz odağını bir kez kurun: camiye ya da kendi belirlediğiniz bir yere varınca iPhone sessize geçer, ayrılınca eski hâline döner.',
        detayAciklama:
            'iPhone sessize almayı yalnız Odak ile yapar; uygulama bunu kendisi açamaz. Ayarlar > Namazda sessiz sayfası üç kısa adımda yol gösterir: Namaz odağını oluşturun, yakınınızdaki caminin adıyla konum ekleyin, isterseniz Kısayollar ile vakit girdikten sonraki dakikalarda da açılsın. Namaz odağı açıkken hatırlatmalarımız ses çıkarmadan ve ekranı yakmadan gelir.',
        detaylar: [
            'Camiye varınca açılan, çıkınca kapanan Namaz odağı',
            'Yakınınızdaki camiler listede, adına dokunup Haritalar’da görün',
            'Ev, iş ya da başka bir yer için de aynı yol',
            'Kısayollar ile vakit girdikten sonraki dakikalarda sessiz',
            'Odak açıkken hatırlatmalar sessiz gelir, hiçbiri kaybolmaz',
        ],
        ikon: 'volume-mute',
        hedefSayfa: 'CamideyimAyarlari',
        ctaEtiketi: 'Kurulumu açın',
        kartGoster: true,
        ceviri: {
            en: {
                baslik: 'Silence your phone at the mosque',
                aciklama:
                    'Set up a Prayer focus once: when you arrive at the mosque or a place you choose, your iPhone goes silent, and it switches back when you leave.',
                detayAciklama:
                    "iPhone can only silence itself with a Focus; the app can't turn it on by itself. The Silent during prayer page guides you in three short steps: create a Prayer focus, add a location with the name of a mosque near you, and if you like, use Shortcuts to turn it on in the minutes after a prayer time begins. While the Prayer focus is on, our reminders arrive without sound and without lighting up the screen.",
                ctaEtiketi: 'Open the setup',
                detaylar: [
                    'A Prayer focus that turns on at the mosque and off when you leave',
                    'Nearby mosques in a list; tap a name to see it in Maps',
                    'The same works for home, work or any other place',
                    'Silent in the minutes after a prayer time begins, with Shortcuts',
                    'Reminders arrive silently while the Focus is on; none are lost',
                ],
            },
            id: {
                baslik: 'Ponsel Anda senyap di masjid',
                aciklama: 'Atur Fokus Salat sekali: saat Anda tiba di masjid atau tempat pilihan Anda, iPhone menjadi senyap, dan kembali seperti semula saat Anda pergi.',
                detayAciklama: 'iPhone hanya dapat dibisukan dengan Fokus; aplikasi tidak dapat mengaktifkannya sendiri. Halaman Senyap saat salat memandu Anda dalam tiga langkah singkat: buat Fokus Salat, tambahkan lokasi dengan nama masjid di dekat Anda, dan jika mau, gunakan Pintasan untuk mengaktifkannya pada menit-menit setelah masuk waktu salat. Saat Fokus Salat aktif, pengingat kami datang tanpa suara dan tanpa menyalakan layar.',
                ctaEtiketi: 'Buka panduan',
                detaylar: [
                    'Fokus Salat yang aktif di masjid dan nonaktif saat Anda pergi',
                    'Daftar masjid terdekat; ketuk nama untuk melihatnya di Peta',
                    'Cara yang sama berlaku untuk rumah, kantor, atau tempat lain',
                    'Senyap pada menit-menit setelah masuk waktu salat, dengan Pintasan',
                    'Pengingat datang tanpa suara saat Fokus aktif; tidak ada yang hilang',
                ],
            },
            de: {
                baslik: 'Ihr Telefon in der Moschee stummschalten',
                aciklama: 'Richten Sie einmal einen Fokus „Gebet“ ein: Wenn Sie an der Moschee oder einem gewählten Ort ankommen, wird Ihr iPhone stumm, und beim Verlassen schaltet es zurück.',
                detayAciklama: 'Das iPhone schaltet sich nur über einen Fokus stumm; die App kann ihn nicht selbst einschalten. Die Seite „Stumm beim Gebet“ führt Sie in drei kurzen Schritten: Fokus „Gebet“ erstellen, einen Ort mit dem Namen einer Moschee in Ihrer Nähe hinzufügen und auf Wunsch mit Kurzbefehle in den Minuten nach Beginn einer Gebetszeit einschalten. Solange der Fokus „Gebet“ an ist, kommen unsere Erinnerungen ohne Ton und ohne den Bildschirm einzuschalten.',
                ctaEtiketi: 'Einrichtung öffnen',
                detaylar: [
                    'Ein Fokus „Gebet“, der sich in der Moschee ein- und beim Verlassen ausschaltet',
                    'Moscheen in der Nähe als Liste; tippen Sie auf einen Namen, um ihn in Karten zu sehen',
                    'Dasselbe funktioniert für Zuhause, die Arbeit oder jeden anderen Ort',
                    'Stumm in den Minuten nach Beginn einer Gebetszeit, mit Kurzbefehle',
                    'Bei aktivem Fokus kommen Erinnerungen lautlos; keine geht verloren',
                ],
            },
            fr: {
                baslik: 'Votre téléphone en silencieux à la mosquée',
                aciklama: 'Configurez une fois la concentration Prière : quand vous arrivez à la mosquée ou dans un lieu de votre choix, votre iPhone passe en silencieux, et il revient à la normale quand vous partez.',
                detayAciklama: 'Sur iPhone, le silence passe uniquement par Concentration ; l’application ne peut pas l’activer elle-même. La page Silencieux pendant la prière vous guide en trois étapes courtes : créez la concentration Prière, ajoutez un lieu avec le nom d’une mosquée proche, et si vous le souhaitez, utilisez Raccourcis pour l’activer dans les minutes qui suivent le début de l’heure de prière. Quand la concentration Prière est activée, nos rappels arrivent sans son et sans allumer l’écran.',
                ctaEtiketi: 'Ouvrir la configuration',
                detaylar: [
                    'Une concentration Prière qui s’active à la mosquée et se désactive quand vous partez',
                    'Les mosquées proches dans une liste ; touchez un nom pour le voir dans Plans',
                    'La même chose pour la maison, le travail ou tout autre lieu',
                    'Silencieux dans les minutes qui suivent le début de l’heure de prière, avec Raccourcis',
                    'Les rappels arrivent en silence quand la concentration est activée ; aucun n’est perdu',
                ],
            },
            bs: {
                baslik: 'Utišajte telefon u džamiji',
                aciklama: 'Jednom postavite Fokus Namaz: kada stignete u džamiju ili na mjesto koje odaberete, Vaš iPhone se utiša, a kada odete, vraća se.',
                detayAciklama: 'iPhone se može utišati samo pomoću Fokusa; aplikacija ga ne može sama uključiti. Stranica Tiho tokom namaza vodi Vas kroz tri kratka koraka: napravite Fokus Namaz, dodajte lokaciju s nazivom obližnje džamije i, ako želite, pomoću Prečica uključite ga u minutama nakon nastupa vakta. Dok je Fokus Namaz uključen, naši podsjetnici stižu bez zvuka i bez paljenja ekrana.',
                ctaEtiketi: 'Otvorite podešavanje',
                detaylar: [
                    'Fokus Namaz koji se uključuje u džamiji i isključuje kada odete',
                    'Obližnje džamije na listi; dodirnite naziv da je vidite u Mapama',
                    'Isto radi za kuću, posao ili bilo koje drugo mjesto',
                    'Tiho u minutama nakon nastupa vakta, pomoću Prečica',
                    'Dok je Fokus uključen, podsjetnici stižu tiho; nijedan se ne gubi',
                ],
            },
            ru: {
                baslik: 'Тишина в мечети',
                aciklama: 'Один раз настройте фокусирование «Намаз»: когда вы приходите в мечеть или выбранное место, iPhone переходит в беззвучный режим, а когда уходите — возвращается обратно.',
                detayAciklama: 'iPhone отключает звук только через фокусирование; приложение не может включить его само. Страница «Тишина во время намаза» проведёт вас через три коротких шага: создайте фокусирование «Намаз», добавьте геопозицию с названием ближайшей мечети и, если хотите, с помощью «Быстрых команд» включайте его в первые минуты после наступления времени намаза. Пока фокусирование «Намаз» включено, наши напоминания приходят без звука и не включают экран.',
                ctaEtiketi: 'Открыть настройку',
                detaylar: [
                    'Фокусирование «Намаз», которое включается в мечети и выключается, когда вы уходите',
                    'Ближайшие мечети списком; нажмите на название, чтобы увидеть её в Картах',
                    'То же работает для дома, работы или любого другого места',
                    'Тишина в первые минуты после наступления времени — с «Быстрыми командами»',
                    'Пока фокусирование включено, напоминания приходят без звука; ни одно не теряется',
                ],
            },
            ms: {
                baslik: 'Senyapkan telefon anda di masjid',
                aciklama: 'Sediakan Fokus Solat sekali: apabila anda tiba di masjid atau tempat yang anda pilih, iPhone anda menjadi senyap, dan kembali seperti biasa apabila anda pergi.',
                detayAciklama: 'iPhone hanya boleh menyenyapkan dirinya melalui Fokus; aplikasi tidak boleh menghidupkannya sendiri. Halaman Senyap ketika solat membimbing anda dalam tiga langkah ringkas: cipta Fokus Solat, tambah lokasi dengan nama masjid berhampiran anda, dan jika mahu, gunakan Pintasan untuk menghidupkannya pada minit-minit selepas masuk waktu solat. Ketika Fokus Solat dihidupkan, peringatan kami datang tanpa bunyi dan tanpa menyalakan skrin.',
                ctaEtiketi: 'Buka panduan persediaan',
                detaylar: [
                    'Fokus Solat yang dihidupkan di masjid dan dimatikan apabila anda pergi',
                    'Senarai masjid berhampiran; ketik nama untuk melihatnya dalam Peta',
                    'Cara yang sama untuk rumah, tempat kerja atau mana-mana tempat lain',
                    'Senyap pada minit-minit selepas masuk waktu solat, dengan Pintasan',
                    'Peringatan datang secara senyap ketika Fokus dihidupkan; tiada yang hilang',
                ],
            },
            ar: {
                baslik: 'كتم الهاتف في المسجد',
                aciklama: 'إعداد تركيز «الصلاة» مرة واحدة: عند الوصول إلى المسجد أو مكان تختاره يُكتم iPhone، ويعود عند المغادرة.',
                detayAciklama: 'لا يُكتم iPhone إلا عبر التركيز؛ ولا يستطيع التطبيق تفعيله بنفسه. ترشدك صفحة «الصمت أثناء الصلاة» في ثلاث خطوات قصيرة: إنشاء تركيز «الصلاة»، وإضافة موقع باسم مسجد قريب منك، وإن شئت استخدام الاختصارات لتفعيله في الدقائق التي تلي دخول الوقت. وأثناء تفعيل تركيز «الصلاة» تصل تذكيراتنا دون صوت ودون إضاءة الشاشة.',
                ctaEtiketi: 'فتح الإعداد',
                detaylar: [
                    'تركيز «الصلاة» يُفعَّل في المسجد ويُوقف عند المغادرة',
                    'المساجد القريبة في قائمة؛ والنقر على الاسم يعرضه في الخرائط',
                    'يعمل الأمر نفسه للمنزل أو العمل أو أي مكان آخر',
                    'صمت في الدقائق التي تلي دخول الوقت، عبر الاختصارات',
                    'تصل التذكيرات بصمت أثناء التركيز؛ ولا يضيع شيء منها',
                ],
            },
            ur: {
                baslik: 'مسجد میں فون خاموش کریں',
                aciklama: 'ایک بار نماز فوکس سیٹ کریں: مسجد یا آپ کی منتخب جگہ پہنچنے پر iPhone خاموش ہو جاتا ہے، اور وہاں سے نکلنے پر واپس آ جاتا ہے۔',
                detayAciklama: 'iPhone خود کو صرف فوکس کے ذریعے خاموش کرتا ہے؛ ایپ اسے خود آن نہیں کر سکتی۔ نماز میں خاموش والا صفحہ تین مختصر مراحل میں رہنمائی کرتا ہے: نماز فوکس بنائیں، قریبی مسجد کے نام سے مقام شامل کریں، اور چاہیں تو Shortcuts سے اسے نماز کا وقت شروع ہونے کے بعد کے منٹوں میں آن کریں۔ نماز فوکس آن ہونے پر ہماری یاد دہانیاں آواز اور اسکرین روشن کیے بغیر آتی ہیں۔',
                ctaEtiketi: 'سیٹ اپ کھولیں',
                detaylar: [
                    'نماز فوکس جو مسجد میں آن اور نکلنے پر بند ہوتا ہے',
                    'قریبی مساجد فہرست میں؛ کسی نام پر تھپتھپا کر Maps میں دیکھیں',
                    'گھر، دفتر یا کسی اور جگہ کے لیے بھی یہی طریقہ',
                    'Shortcuts سے نماز کا وقت شروع ہونے کے بعد کے منٹوں میں خاموشی',
                    'فوکس آن ہونے پر یاد دہانیاں خاموشی سے آتی ہیں؛ کوئی ضائع نہیں ہوتی',
                ],
            },
            es: {
                baslik: 'Silencie su teléfono en la mezquita',
                aciklama: 'Configure una vez la concentración Rezo: al llegar a la mezquita o a un lugar que elija, su iPhone se silencia, y vuelve a la normalidad cuando sale.',
                detayAciklama: 'El iPhone solo puede silenciarse con Concentración; la aplicación no puede activarla por sí misma. La página Silencio durante el rezo le guía en tres pasos breves: cree la concentración Rezo, añada una ubicación con el nombre de una mezquita cercana y, si quiere, use Atajos para activarla en los minutos posteriores al comienzo de la hora del rezo. Con la concentración Rezo activada, nuestros recordatorios llegan sin sonido y sin encender la pantalla.',
                ctaEtiketi: 'Abrir la configuración',
                detaylar: [
                    'Una concentración Rezo que se activa en la mezquita y se desactiva al salir',
                    'Las mezquitas cercanas en una lista; toque un nombre para verla en Mapas',
                    'Funciona igual para casa, el trabajo o cualquier otro lugar',
                    'Silencio en los minutos posteriores al comienzo de la hora del rezo, con Atajos',
                    'Con la concentración activada, los recordatorios llegan en silencio; no se pierde ninguno',
                ],
            },
            nl: {
                baslik: 'Uw telefoon stil in de moskee',
                aciklama: 'Stel één keer een focus Gebed in: wanneer u bij de moskee of een plek die u kiest aankomt, gaat uw iPhone op stil, en als u weggaat, schakelt hij terug.',
                detayAciklama: 'De iPhone kan zichzelf alleen met een focus op stil zetten; de app kan die niet zelf aanzetten. De pagina Stil tijdens het gebed leidt u in drie korte stappen: maak een focus Gebed, voeg een locatie toe met de naam van een moskee bij u in de buurt en gebruik desgewenst Opdrachten om hem aan te zetten in de minuten nadat een gebedstijd begint. Terwijl de focus Gebed aanstaat, komen onze herinneringen zonder geluid en zonder dat het scherm oplicht.',
                ctaEtiketi: 'De instelling openen',
                detaylar: [
                    'Een focus Gebed die in de moskee aangaat en uitgaat als u weggaat',
                    'Moskeeën in de buurt in een lijst; tik op een naam om die in Kaarten te zien',
                    'Hetzelfde werkt voor thuis, het werk of een andere plek',
                    'Stil in de minuten nadat een gebedstijd begint, met Opdrachten',
                    'Herinneringen komen stil aan terwijl de focus aanstaat; er gaat er geen verloren',
                ],
            },
            sq: {
                baslik: 'Heshtni telefonin në xhami',
                aciklama: 'Konfiguroni një herë Focus-in Namaz: kur arrini në xhami ose në një vend që zgjidhni, iPhone-i hesht dhe kthehet në normalitet kur largoheni.',
                detayAciklama: 'iPhone-i mund të heshtet vetëm me Focus; aplikacioni nuk mund ta aktivizojë vetë. Faqja Heshtja gjatë namazit ju udhëzon në tre hapa të shkurtër: krijoni Focus-in Namaz, shtoni një vendndodhje me emrin e një xhamie afër jush dhe, nëse doni, përdorni Shortcuts për ta aktivizuar në minutat pasi hyn koha e namazit. Kur Focus-i Namaz është aktiv, kujtesat tona vijnë pa tingull dhe pa ndezur ekranin.',
                ctaEtiketi: 'Hapni konfigurimin',
                detaylar: [
                    'Focus-i Namaz aktivizohet në xhami dhe çaktivizohet kur largoheni',
                    'Xhamitë afër në një listë; prekni një emër për ta parë në Maps',
                    'E njëjta gjë punon për shtëpinë, punën ose çdo vend tjetër',
                    'Heshtje në minutat pasi hyn koha e namazit, me Shortcuts',
                    'Kujtesat vijnë në heshtje kur Focus-i është aktiv; asnjëra nuk humbet',
                ],
            },
            hi: {
                baslik: 'मस्जिद में फ़ोन ख़ामोश करें',
                aciklama: 'एक बार नमाज़ फ़ोकस सेट करें: मस्जिद या अपनी चुनी हुई जगह पहुंचने पर आपका iPhone ख़ामोश हो जाता है, और निकलने पर वापस आ जाता है।',
                detayAciklama: 'iPhone ख़ुद को सिर्फ़ फ़ोकस से ख़ामोश कर सकता है; ऐप इसे अपने आप चालू नहीं कर सकता। नमाज़ में ख़ामोश वाला पेज तीन छोटे क़दमों में आपकी मदद करता है: नमाज़ फ़ोकस बनाएं, पास की किसी मस्जिद के नाम से लोकेशन जोड़ें, और चाहें तो Shortcuts से इसे नमाज़ का वक़्त शुरू होने के बाद के मिनटों में चालू करें। नमाज़ फ़ोकस चालू रहने पर हमारे रिमाइंडर बिना आवाज़ और स्क्रीन जलाए बिना आते हैं।',
                ctaEtiketi: 'सेटअप खोलें',
                detaylar: [
                    'मस्जिद में चालू और निकलने पर बंद होने वाला नमाज़ फ़ोकस',
                    'आस-पास की मस्जिदें एक सूची में; Maps में देखने के लिए नाम पर टैप करें',
                    'घर, दफ़्तर या किसी भी जगह के लिए भी यही काम करता है',
                    'Shortcuts से नमाज़ का वक़्त शुरू होने के बाद के मिनटों में ख़ामोश',
                    'फ़ोकस चालू रहने पर रिमाइंडर चुपचाप आते हैं; कोई छूटता नहीं',
                ],
            },
            bn: {
                baslik: 'মসজিদে আপনার ফোন নীরব করুন',
                aciklama: 'একবার একটি নামাজ Focus সেট করুন: মসজিদে বা আপনার বেছে নেওয়া জায়গায় পৌঁছালে আপনার iPhone নীরব হয়ে যায়, বের হলে আবার আগের মতো হয়।',
                detayAciklama: 'iPhone শুধু Focus দিয়েই নিজেকে নীরব করতে পারে; অ্যাপ নিজে তা চালু করতে পারে না। নামাজের সময় নীরব পৃষ্ঠা আপনাকে তিনটি ছোট ধাপে দেখিয়ে দেয়: একটি নামাজ Focus তৈরি করুন, কাছের কোনো মসজিদের নাম দিয়ে একটি অবস্থান যোগ করুন, আর চাইলে Shortcuts দিয়ে নামাজের ওয়াক্ত শুরুর পরের মিনিটগুলোতে এটি চালু করুন। নামাজ Focus চালু থাকলে আমাদের রিমাইন্ডার শব্দ ছাড়া এবং স্ক্রিন না জ্বালিয়ে আসে।',
                ctaEtiketi: 'সেটআপ খুলুন',
                detaylar: [
                    'মসজিদে চালু হয় এবং বের হলে বন্ধ হয় এমন নামাজ Focus',
                    'কাছের মসজিদগুলো তালিকায়; Maps-এ দেখতে নামে ট্যাপ করুন',
                    'বাড়ি, অফিস বা অন্য যেকোনো জায়গার জন্যও একইভাবে কাজ করে',
                    'Shortcuts দিয়ে নামাজের ওয়াক্ত শুরুর পরের মিনিটগুলোতে নীরব',
                    'Focus চালু থাকলে রিমাইন্ডার নীরবে আসে; কোনোটিই হারায় না',
                ],
            },
            fa: {
                baslik: 'بی‌صدا کردن تلفن در مسجد',
                aciklama: 'یک بار تمرکز «نماز» را راه‌اندازی کنید: وقتی به مسجد یا جایی که انتخاب کرده‌اید می‌رسید، آیفون شما بی‌صدا می‌شود و هنگام بیرون رفتن برمی‌گردد.',
                detayAciklama: 'آیفون فقط با «تمرکز» خودش را بی‌صدا می‌کند؛ برنامه نمی‌تواند خودش آن را روشن کند. صفحهٔ «سکوت هنگام نماز» شما را در سه گام کوتاه راهنمایی می‌کند: تمرکز «نماز» را بسازید، مکانی با نام مسجدی نزدیک خود بیفزایید و اگر خواستید با «میانبرها» آن را در دقیقه‌های پس از رسیدن وقت نماز روشن کنید. تا وقتی تمرکز «نماز» روشن است، یادآوری‌های ما بی‌صدا و بدون روشن کردن صفحه می‌رسند.',
                ctaEtiketi: 'باز کردن راه‌اندازی',
                detaylar: [
                    'تمرکز «نماز» که در مسجد روشن و هنگام بیرون رفتن خاموش می‌شود',
                    'مسجدهای نزدیک در یک فهرست؛ با ضربه روی نام، آن را در «نقشه‌ها» ببینید',
                    'همین کار برای خانه، محل کار یا هر جای دیگر هم انجام می‌شود',
                    'بی‌صدا در دقیقه‌های پس از رسیدن وقت نماز، با «میانبرها»',
                    'تا وقتی تمرکز روشن است، یادآوری‌ها بی‌صدا می‌رسند؛ هیچ‌کدام از دست نمی‌رود',
                ],
            },
            ps: {
                baslik: 'په جومات کې خپل موبایل چوپ کړئ',
                aciklama: 'د لمونځ Focus یو ځل جوړ کړئ: کله چې جومات یا خپل ټاکلي ځای ته ورسېږئ، iPhone چوپېږي، او کله چې ووځئ بېرته اوړي.',
                detayAciklama: 'iPhone یوازې په Focus ځان چوپولای شي؛ اپ یې پخپله نه شي فعالولای. د «په لمانځه کې چوپ» پاڼه په درې لنډو ګامونو کې لارښوونه کوي: د لمونځ Focus جوړ کړئ، د خپل نږدې جومات په نوم یو موقعیت اضافه کړئ، او که وغواړئ، په Shortcuts یې د لمانځه د وخت له پیل وروسته په دقیقو کې فعال کړئ. کله چې د لمونځ Focus فعال وي، زموږ یادونې پرته له غږه او پرته له دې چې سکرین روښانه کړي راځي.',
                ctaEtiketi: 'برابرول پرانیزئ',
                detaylar: [
                    'د لمونځ Focus چې په جومات کې فعالېږي او په وتلو بندېږي',
                    'نږدې جوماتونه په لړلیک کې؛ نوم کېکاږئ تر څو یې په Maps کې وګورئ',
                    'همدا د کور، کار یا بل هر ځای لپاره هم کار کوي',
                    'د لمانځه د وخت له پیل وروسته په دقیقو کې چوپ، په Shortcuts',
                    'کله چې Focus فعال وي یادونې چوپې راځي؛ هېڅ یوه نه ورکېږي',
                ],
            },
            ckb: {
                baslik: 'مۆبایلەکەتان لە مزگەوت بێدەنگ بکەن',
                aciklama: 'یەک جار Focus ی «نوێژ» دابنێن: کاتێک دەگەنە مزگەوت یان شوێنێک کە ھەڵیدەبژێرن، iPhone بێدەنگ دەبێت، و کاتێک دەڕۆن دەگەڕێتەوە.',
                detayAciklama: 'iPhone تەنیا بە Focus خۆی بێدەنگ دەکات؛ ئەپەکە ناتوانێت خۆی چالاکی بکات. پەڕەی «بێدەنگ لە کاتی نوێژدا» لە سێ ھەنگاوی کورتدا ڕێنماییتان دەکات: Focus ی «نوێژ» دروست بکەن، شوێنێک بە ناوی مزگەوتێکی نزیکتان زیاد بکەن، و ئەگەر بتانەوێت بە Shortcuts لەو خولەکانەی دوای ھاتنی کاتی نوێژ چالاکی بکەن. تا Focus ی «نوێژ» چالاکە، بیرخستنەوەکانی ئێمە بەبێ دەنگ و بەبێ ڕووناککردنەوەی شاشە دێن.',
                ctaEtiketi: 'کردنەوەی ڕێکخستن',
                detaylar: [
                    'Focus ی «نوێژ» کە لە مزگەوت چالاک دەبێت و کاتێک دەڕۆن دەکوژێتەوە',
                    'مزگەوتە نزیکەکان لە لیستێکدا؛ بۆ بینینی لە Maps دەست لە ناوێک بدەن',
                    'ھەمان شت بۆ ماڵ، کار یان ھەر شوێنێکی تر کار دەکات',
                    'بێدەنگ لەو خولەکانەی دوای ھاتنی کاتی نوێژ، بە Shortcuts',
                    'تا Focus چالاکە بیرخستنەوەکان بە بێدەنگی دێن؛ ھیچیان ون نابێت',
                ],
            },
            ug: {
                baslik: 'مەسچىتتە تېلېفونىڭىز ئۈنسىز ھالەتكە ئۆتسۇن',
                aciklama: 'ناماز دىققەت ھالىتىنى بىر قېتىم تەڭشەڭ: مەسچىتكە ياكى ئۆزىڭىز تاللىغان جايغا يەتكەندە iPhone ئۈنسىز ھالەتكە ئۆتىدۇ، ئايرىلغاندا ئەسلىگە قايتىدۇ.',
                detayAciklama: 'iPhone ئۆزىنى پەقەت دىققەت ھالىتى ئارقىلىقلا ئۈنسىز قىلالايدۇ؛ ئەپ ئۇنى ئۆزى ئاچالمايدۇ. «نامازدا ئۈنسىز» بېتى سىزنى ئۈچ قىسقا قەدەمدە يېتەكلەيدۇ: ناماز دىققەت ھالىتىنى قۇرۇڭ، يېقىنىڭىزدىكى بىر مەسچىتنىڭ نامى بىلەن ئورۇن قوشۇڭ، خالىسىڭىز تېزلەتمىلەر ئارقىلىق ناماز ۋاقتى كىرگەندىن كېيىنكى مىنۇتلاردىمۇ ئېچىلسۇن. ناماز دىققەت ھالىتى ئوچۇق ۋاقىتتا ئەسكەرتىشلىرىمىز ئاۋاز چىقارماي ۋە ئېكراننى ياندۇرماي كېلىدۇ.',
                ctaEtiketi: 'تەڭشەشنى ئېچىڭ',
                detaylar: [
                    'مەسچىتكە يەتكەندە ئېچىلىپ، چىققاندا تاقىلىدىغان ناماز دىققەت ھالىتى',
                    'يېقىن ئەتراپتىكى مەسچىتلەر تىزىملىكتە؛ نامىنى چېكىپ خەرىتىدە كۆرۈڭ',
                    'ئۆي، خىزمەت ئورنى ياكى باشقا جايلار ئۈچۈنمۇ ئوخشاش ئىشلەيدۇ',
                    'تېزلەتمىلەر ئارقىلىق ناماز ۋاقتى كىرگەندىن كېيىنكى مىنۇتلاردا ئۈنسىز',
                    'دىققەت ھالىتى ئوچۇق ۋاقىتتا ئەسكەرتىشلەر ئۈنسىز كېلىدۇ؛ ھېچبىرى يوقالمايدۇ',
                ],
            },
            az: {
                baslik: 'Məsciddə telefonunuzu səssizə alın',
                aciklama: 'Namaz fokusunu bir dəfə qurun: məscidə və ya seçdiyiniz yerə çatanda iPhone-unuz səssizə keçir, çıxanda isə geri qayıdır.',
                detayAciklama: 'iPhone yalnız Fokus ilə səssizə keçə bilir; tətbiq onu özü aça bilmir. Namazda səssiz səhifəsi sizi üç qısa addımla aparır: Namaz fokusu yaradın, yaxınlığınızdakı məscidin adı ilə məkan əlavə edin və istəsəniz, Shortcuts ilə vaxt daxil olandan sonrakı dəqiqələrdə açılmasını qurun. Namaz fokusu açıq olanda xatırlatmalarımız səs çıxarmadan və ekranı yandırmadan gəlir.',
                ctaEtiketi: 'Quraşdırmanı açın',
                detaylar: [
                    'Məsciddə açılan, çıxanda bağlanan Namaz fokusu',
                    'Yaxınlıqdakı məscidlər siyahıda; adına toxunub Xəritələrdə görün',
                    'Eyni üsul ev, iş və ya başqa yer üçün də işləyir',
                    'Shortcuts ilə vaxt daxil olandan sonrakı dəqiqələrdə səssiz',
                    'Fokus açıq olanda xatırlatmalar səssiz gəlir; heç biri itmir',
                ],
            },
            uz: {
                baslik: 'Масжидда телефонингиз жим бўлсин',
                aciklama: '«Намоз» фокусини бир марта созланг: масжидга ёки ўзингиз танлаган жойга келганингизда iPhone жим бўлади, чиқиб кетганингизда аввалги ҳолатига қайтади.',
                detayAciklama: 'iPhone ўзини фақат Фокус орқали жим қилади; илова уни ўзи ёқа олмайди. Намозда овозсиз саҳифаси уч қисқа қадамда йўл кўрсатади: «Намоз» фокусини яратинг, яқиндаги масжид номи билан жойлашув қўшинг ва истасангиз, Shortcuts орқали намоз вақти киргандан кейинги дақиқаларда ҳам ёқилишини созланг. «Намоз» фокуси ёниқ бўлганда эслатмаларимиз овозсиз ва экранни ёритмасдан келади.',
                ctaEtiketi: 'Созлашни очиш',
                detaylar: [
                    'Масжидга келганда ёқиладиган, чиққанда ўчадиган «Намоз» фокуси',
                    'Яқиндаги масжидлар рўйхатда; номини босиб, Хариталарда кўринг',
                    'Уй, иш ёки бошқа исталган жой учун ҳам худди шундай',
                    'Shortcuts орқали намоз вақти киргандан кейинги дақиқаларда жимлик',
                    'Фокус ёниқ бўлганда эслатмалар овозсиз келади; ҳеч бири йўқолмайди',
                ],
            },
            kk: {
                baslik: 'Мешітте телефоныңыз дыбыссыз режимге ауыссын',
                aciklama: 'Намаз фокусын бір рет баптаңыз: мешітке немесе өзіңіз белгілеген орынға келгенде iPhone дыбыссыз режимге ауысады, кеткенде бұрынғы күйіне оралады.',
                detayAciklama: 'iPhone дыбыссыз етуді тек Фокус арқылы жасайды; қолданба оны өздігінен қоса алмайды. «Намазда үнсіз» беті үш қысқа қадаммен жол көрсетеді: Намаз фокусын жасаңыз, жақын маңдағы мешіттің атауымен орын қосыңыз, қаласаңыз, «Жылдам пәрмендер» арқылы намаз уақыты кіргеннен кейінгі минуттарда да қосылсын. Намаз фокусы қосулы кезде еске салғыштарымыз дыбыссыз және экранды жандырмай келеді.',
                ctaEtiketi: 'Баптауды ашу',
                detaylar: [
                    'Мешітке келгенде қосылып, шыққанда өшетін Намаз фокусы',
                    'Жақын маңдағы мешіттер тізімде; атауын түртіп, Карталардан көріңіз',
                    'Үй, жұмыс немесе басқа орын үшін де дәл осылай',
                    '«Жылдам пәрмендер» арқылы намаз уақыты кіргеннен кейінгі минуттарда дыбыссыз',
                    'Фокус қосулы кезде еске салғыштар дыбыссыз келеді, ешқайсысы жоғалмайды',
                ],
            },
            ky: {
                baslik: 'Мечитте телефонуңузду үнсүз кылыңыз',
                aciklama: '«Намаз» фокусун бир жолу орнотуңуз: мечитке же сиз тандаган жерге келгениңизде iPhone үнсүз болот, чыкканыңызда мурунку абалына кайтат.',
                detayAciklama: 'iPhone өзүн Фокус аркылуу гана үнсүз кыла алат; колдонмо аны өзү күйгүзө албайт. «Намазда үнсүз» барагы үч кыска кадамда жол көрсөтөт: «Намаз» фокусун түзүңүз, жакын жердеги мечиттин аты менен жайгашкан жер кошуңуз жана кааласаңыз, аны намаз убактысы киргенден кийинки мүнөттөрдө күйгүзүү үчүн Командаларды колдонуңуз. «Намаз» фокусу күйүк турганда эскертмелерибиз үнсүз жана экранды жандырбай келет.',
                ctaEtiketi: 'Орнотууну ачуу',
                detaylar: [
                    'Мечитте күйүп, чыкканда өчүүчү «Намаз» фокусу',
                    'Жакын жердеги мечиттер тизмеде; Карталардан көрүү үчүн атын басыңыз',
                    'Үй, жумуш же башка каалаган жер үчүн да ушундай иштейт',
                    'Командалар аркылуу намаз убактысы киргенден кийинки мүнөттөрдө үнсүз',
                    'Фокус күйүк турганда эскертмелер үнсүз келет; эч бири жоголбойт',
                ],
            },
            tg: {
                baslik: 'Дар масҷид телефонатонро бесадо кунед',
                aciklama: 'Як бор «Тамаркуз»-и Намозро танзим кунед: вақте ки ба масҷид ё ҷои интихобкардаатон мерасед, iPhone-и Шумо бесадо мешавад ва ҳангоми баромадан бармегардад.',
                detayAciklama: 'iPhone худро танҳо бо «Тамаркуз» (Focus) бесадо карда метавонад; барнома онро худ аз худ фаъол карда наметавонад. Саҳифаи «Бесадо ҳангоми намоз» Шуморо дар се қадами кӯтоҳ роҳнамоӣ мекунад: «Тамаркуз»-и Намозро созед, бо номи масҷиди наздикатон макон илова кунед ва агар хоҳед, бо «Фармонҳои зуд» (Shortcuts) онро дар дақиқаҳои пас аз расидани вақт фаъол кунед. Ҳангоми фаъол будани «Тамаркуз»-и Намоз ёдовариҳои мо бе садо ва бе равшан кардани экран меоянд.',
                ctaEtiketi: 'Танзимро кушоед',
                detaylar: [
                    '«Тамаркуз»-и Намоз, ки дар масҷид фаъол ва ҳангоми баромадан хомӯш мешавад',
                    'Масҷидҳои наздик дар рӯйхат; барои дидан дар Харитаҳо номро пахш кунед',
                    'Ҳамин тавр барои хона, ҷои кор ё ҳар ҷои дигар кор мекунад',
                    'Бо «Фармонҳои зуд» дар дақиқаҳои пас аз расидани вақт бесадо',
                    'Ҳангоми фаъол будани «Тамаркуз» ёдовариҳо бесадо меоянд; ҳеҷ кадом гум намешавад',
                ],
            },
            sw: {
                baslik: 'Nyamazisha simu yako msikitini',
                aciklama: 'Weka Focus ya Swala mara moja: unapofika msikitini au mahali unapopachagua, iPhone yako inanyamaza, na inarudi kawaida unapoondoka.',
                detayAciklama: 'iPhone inaweza kujinyamazisha kwa Focus tu; programu haiwezi kuiwasha yenyewe. Ukurasa wa Kimya wakati wa Swala unakuongoza kwa hatua tatu fupi: unda Focus ya Swala, ongeza mahali kwa jina la msikiti ulio karibu nawe, na ukipenda, tumia Shortcuts kuiwasha katika dakika zinazofuata baada ya wakati wa Swala kuingia. Focus ya Swala ikiwa imewashwa, vikumbusho vyetu vinafika bila sauti na bila kuwasha skrini.',
                ctaEtiketi: 'Fungua usanidi',
                detaylar: [
                    'Focus ya Swala inayowashwa msikitini na kuzimwa unapoondoka',
                    'Misikiti iliyo karibu katika orodha; gusa jina ili kuuona katika Maps',
                    'Vivyo hivyo kwa nyumbani, kazini au mahali pengine popote',
                    'Kimya katika dakika zinazofuata baada ya wakati wa Swala kuingia, kwa Shortcuts',
                    'Vikumbusho vinafika kimya Focus ikiwa imewashwa; hakuna kinachopotea',
                ],
            },
            ha: {
                baslik: 'Sa wayarku shiru a masallaci',
                aciklama: 'Ku saita Focus na Salla sau ɗaya: idan kuka isa masallaci ko wurin da kuka zaɓa, iPhone ɗinku yana yin shiru, kuma yana komawa idan kuka fita.',
                detayAciklama: 'iPhone yana iya yin shiru da kansa ne kawai da Focus; manhajar ba za ta iya kunna shi da kanta ba. Shafin Shiru lokacin salla yana jagorantar ku a gajerun matakai uku: ku ƙirƙiri Focus na Salla, ku ƙara wuri da sunan masallaci kusa da ku, kuma idan kuna so, ku yi amfani da Shortcuts don kunna shi a mintunan bayan lokacin salla ya yi. Lokacin da Focus na Salla ke kunne, tunatarwarmu tana zuwa ba tare da sauti ba kuma ba tare da haskaka allo ba.',
                ctaEtiketi: 'Buɗe saitawa',
                detaylar: [
                    'Focus na Salla da ke kunnawa a masallaci kuma yana kashewa idan kuka fita',
                    'Masallatan kusa a jeri; ku taɓa suna don ganin sa a Maps',
                    'Haka ma yana aiki don gida, wurin aiki ko kowane wuri',
                    'Shiru a mintunan bayan lokacin salla ya yi, da Shortcuts',
                    'Tunatarwa tana zuwa a shiru lokacin da Focus ke kunne; babu wadda za ta ɓace',
                ],
            },
            am: {
                baslik: 'በመስጂድ ውስጥ ስልክዎን ጸጥ ያድርጉ',
                aciklama: 'የሶላት ትኩረትን አንድ ጊዜ ያዘጋጁ፦ መስጂድ ወይም ወደመረጡት ቦታ ሲደርሱ iPhoneዎ ጸጥ ይላል፤ ሲወጡ ይመለሳል።',
                detayAciklama: 'iPhone ራሱን ጸጥ ማድረግ የሚችለው በትኩረት ብቻ ነው፤ መተግበሪያው በራሱ ሊያበራው አይችልም። የ“በሶላት ጊዜ ጸጥታ” ገጽ በሦስት አጭር ደረጃዎች ይመራዎታል፦ የሶላት ትኩረት ይፍጠሩ፣ በአቅራቢያዎ ባለ መስጂድ ስም አካባቢ ያክሉ፤ ከፈለጉም የሶላት ሰዓት ከገባ በኋላ ባሉት ደቂቃዎች ውስጥ ለማብራት አቋራጮችን ይጠቀሙ። የሶላት ትኩረት ሲበራ አስታዋሾቻችን ያለ ድምፅ እና ገጹን ሳያበሩ ይደርሳሉ።',
                ctaEtiketi: 'ማዋቀሪያውን ክፈት',
                detaylar: [
                    'በመስጂድ የሚበራ፣ ሲወጡ የሚጠፋ የሶላት ትኩረት',
                    'በአቅራቢያ ያሉ መስጂዶች በዝርዝር፤ በካርታዎች ለማየት ስሙን ይንኩ',
                    'ለቤት፣ ለሥራ ወይም ለሌላ ማንኛውም ቦታም ተመሳሳይ ይሠራል',
                    'የሶላት ሰዓት ከገባ በኋላ ባሉት ደቂቃዎች ውስጥ ጸጥታ፣ በአቋራጮች',
                    'ትኩረቱ ሲበራ አስታዋሾች በጸጥታ ይደርሳሉ፤ አንዳቸውም አይጠፉም',
                ],
            },
            om: {
                baslik: 'Masjiida keessatti bilbila keessan callisaa',
                aciklama: "Focus Salaataa si'a tokko qopheessaa: yeroo masjiida ykn bakka isin filattan geessan iPhone-n keessan ni callisa, yeroo baatan immoo ni deebi'a.",
                detayAciklama: "iPhone-n Focus qofaan of callisa; appichi ofiin banuu hin danda'u. Fuulli Callisaa yeroo salaataa tarkaanfii gabaabaa sadiin isin qajeelcha: Focus Salaataa uumaa, maqaa masjiida isinitti dhiyoo ta'een bakka dabalaa, yoo barbaaddan immoo Shortcuts fayyadamuun daqiiqaalee erga yeroon salaataa gahee booda banaa. Yeroo Focus-iin Salaataa banaa ta'e, yaadachiisni keenya osoo sagalee hin qabaatinii fi fuula osoo hin ibsin dhufa.",
                ctaEtiketi: 'Qopheessuu banaa',
                detaylar: [
                    'Focus Salaataa masjiida keessatti banamee yeroo baatan cufamu',
                    'Masjiidota dhiyoo tarree keessatti; Maps keessatti arguuf maqaa tuqaa',
                    'Kun manaaf, hojiif ykn bakka biraa kamiifuu ni hojjeta',
                    'Shortcuts fayyadamuun daqiiqaalee erga yeroon salaataa gahee booda callisaa',
                    "Yeroo Focus-iin banaa ta'e yaadachiisni callisaan dhufa; tokkollee hin badu",
                ],
            },
            so: {
                baslik: 'Ku aamusi taleefankaaga masjidka',
                aciklama: 'Hal mar deji Focus-ka Salaadda: marka aad timaado masjidka ama meel aad doorato, iPhone-kaagu wuu aamusaa, wuxuuna dib ugu noqdaa marka aad baxdo.',
                detayAciklama: "iPhone-ku wuxuu isku aamusiyaa oo kaliya Focus; barnaamijku iskiis uma shidi karo. Bogga Aamusnaanta salaadda wuxuu kugu hagayaa saddex tallaabo oo gaaban: samee Focus-ka Salaadda, ku dar goob leh magaca masjid kuu dhow, haddii aad rabtona isticmaal \"Shortcuts\" si uu u shidmo daqiiqadaha ka dambeeya marka waqti salaadeed galo. Inta Focus-ka Salaaddu shidan yahay, xusuusintayadu waxay timaadaa cod la'aan iyo iyadoon shaashaddu iftiimin.",
                ctaEtiketi: 'Fur dejinta',
                detaylar: [
                    'Focus-ka Salaadda oo ka shidma masjidka oo dama marka aad baxdo',
                    'Masaajidda u dhow oo liis ah; taabo magac si aad ugu aragto Maps',
                    'Isla sidaas ayuu u shaqeeyaa guriga, shaqada ama meel kale',
                    'Aamusnaan daqiiqadaha ka dambeeya marka waqti salaadeed galo, adigoo isticmaalaya "Shortcuts"',
                    'Xusuusintu si aamusan ayay u timaadaa inta Focus-ku shidan yahay; midna ma lumo',
                ],
            },
            ff: {
                baslik: 'Deƴƴinee talifon mon e juulirde',
                aciklama: 'Teeltee Focus Juulde laawol go’o: so on hewtii e juulirde walla nokku ngo on suɓi, iPhone mon hino deƴƴa, hino rutta so on njaltii.',
                detayAciklama: 'iPhone hino waawi deƴƴinde hoore mum e Focus tan; jaaɓngal ngal waawaa huɓɓinde ɗum e hoore mum. Hello Deƴƴere e juulde hino hollira on e taaɓe tati famɗuɗe: tafee Focus Juulde, ɓeydee nokkuure e innde juulirde ɓadiinde on, so njiɗon huutoron Shortcuts ngam huɓɓinde ɗum e hojomaaji caggal waqutu juulde heewde. Tuma Focus Juulde huɓɓinaa, siftinooje amen hino ara tawa alaa sowto, tawa yaynirde ndee jalbaaki.',
                ctaEtiketi: 'Udditee teeltugol',
                detaylar: [
                    'Focus Juulde huɓɓinoowo e juulirde, ñifoowo so on njaltii',
                    'Juulirɗe ɓadiiɗe e doggol; dobee innde ngam yiyde ndee e Maps',
                    'Ɗum hino golla kadi ngam galle, golle walla nokku goɗɗo kala',
                    'Deƴƴere e hojomaaji caggal waqutu juulde heewde, e Shortcuts',
                    'Siftinooje hino ara e deƴƴere tuma Focus oo huɓɓinaa; hay gooto majjataa',
                ],
            },
            yo: {
                baslik: 'Pa fóònù yín lẹ́nu mọ́ ní mọ́sálásí',
                aciklama: 'Ẹ ṣètò Focus Ìrun lẹ́ẹ̀kan: nígbà tí ẹ bá dé mọ́sálásí tàbí ibi tí ẹ yàn, iPhone yín yóò dákẹ́, yóò sì padà nígbà tí ẹ bá kúrò.',
                detayAciklama: 'Focus nìkan ni iPhone fi ń pa ara rẹ̀ lẹ́nu mọ́; ìṣàfilọ́lẹ̀ kò lè tàn án fúnra rẹ̀. Ojú-ìwé Ìdákẹ́jẹ́ẹ́ nígbà ìrun ń tọ́ yín sọ́nà ní ìgbésẹ̀ kúkúrú mẹ́ta: ẹ ṣẹ̀dá Focus Ìrun, ẹ fi ibùdó kún un pẹ̀lú orúkọ mọ́sálásí kan nítòsí yín, àti tí ẹ bá fẹ́, ẹ lo Shortcuts láti tàn án ní àwọn ìṣẹ́jú lẹ́yìn tí àkókò ìrun bá wọlé. Nígbà tí Focus Ìrun bá wà ní títàn, àwọn ìránnilétí wa ń dé láìsí ohùn àti láìtan ojú ìbòjú.',
                ctaEtiketi: 'Ṣí ìṣètò',
                detaylar: [
                    'Focus Ìrun tí ń tàn ní mọ́sálásí, tí ó sì ń pa nígbà tí ẹ bá kúrò',
                    'Àwọn mọ́sálásí tó wà nítòsí nínú àkójọ; ẹ tẹ orúkọ kan láti rí i nínú Maps',
                    'Bákan náà ló ń ṣiṣẹ́ fún ilé, ibi iṣẹ́ tàbí ibikíbi mìíràn',
                    'Ìdákẹ́jẹ́ẹ́ ní àwọn ìṣẹ́jú lẹ́yìn tí àkókò ìrun bá wọlé, pẹ̀lú Shortcuts',
                    'Àwọn ìránnilétí ń dé ní ìdákẹ́jẹ́ẹ́ nígbà tí Focus bá wà ní títàn; kò sí èyí tí yóò sọnù',
                ],
            },
        },
    },
    // Android TV panosuna telefondan konum aktarma (QR / 7 haneli kod) + ana ekranda izin onarımı.
    {
        id: 'televizyona-konum-aktarma',
        platformlar: ['android', 'ios'],
        surum: '0.55.0',
        tarih: '2026-10-20',
        baslik: 'Vakitler Televizyonda',
        aciklama:
            'Evdeki Android TV’de Namaz Akışı’nı açın, ekrandaki kare kodu telefonunuzla okutun: konumunuz TV’ye gelir, vakitler büyük ekranda sizin şehrinize göre görünür.',
        detayAciklama:
            'Konum, evinizin Wi-Fi ağında doğrudan TV’ye gider; hesap açılmaz, sunucuya gönderilmez. Wi-Fi ya da kamera yoksa telefonunuzdaki 7 haneli kodu TV’ye kumandayla girebilirsiniz. Bildirim izni ya da tam zamanlı hatırlatma izni sonradan kapanırsa ana ekran bunu söyler ve tek dokunuşla açmanızı sağlar.',
        detaylar: [
            'TV’deki kare kodu okutun, konum TV’ye gelsin',
            'Wi-Fi yoksa 7 haneli kodla aktarın',
            'Hesap yok, sunucu yok; veri evinizden çıkmaz',
            'Kapanan izinler ana ekranda tek dokunuşla onarılır',
        ],
        ikon: 'tv',
        hedefSayfa: 'TelevizyonAyarlari',
        ctaEtiketi: 'TV’ye aktarın',
        kartGoster: true,
    },
    // Kıble ekranı: kendi kamera görünümümüz + 3B pusula (Google kıble bulucu kaldırıldı).
    {
        id: 'kible-kamera-ve-3b-pusula',
        platformlar: ['android', 'ios'],
        surum: '0.52.0',
        tarih: '2026-10-19',
        baslik: 'Kıbleyi Kamerayla Bulun',
        aciklama:
            'Kıble sekmesinde telefonunuzu dik tutup kamerayla çevrenize bakın: Kâbe işareti kıble yönünde belirir, yanında Kâbe’ye uzaklığınız yazar. Pusula açılır açılmaz döner ve titremeden akar.',
        detayAciklama:
            'Kamera görünümünde Kâbe işareti ekranın dışındaysa kenardaki ok hangi yöne döneceğinizi gösterir; işaret ortadaki halkaya oturunca halka yeşile döner ve telefon bir kez titrer. İnternet gerekmez, görüntü kaydedilmez. Kamerasız Pusula görünümünde telefonu düz tuttuğunuzda klasik pusula görürsünüz; dikleştirdikçe pusula ufka yatar ve Kâbe küpü kıble yönünde ayağa kalkar. Yön kayıyorsa telefonunuzu havada 8 çizer gibi birkaç kez hareket ettirin. Ekran okuyucu açıksa yön "Kıble 30° sağınızda" diye okunur.',
        detaylar: [
            'Kamerada Kâbe işareti ve Kâbe’ye uzaklık',
            'Ekran dışındaysa "sağa/sola dönün" okları',
            'Hizalanınca yeşil halka ve tek titreşim',
            'Telefonu dikleştirince ufka yatan 3B pusula',
            'Açılır açılmaz çalışan, titremeyen pusula',
            'İnternetsiz; görüntü kaydedilmez',
        ],
        ikon: 'kaaba',
        ceviri: {
            en: {
                baslik: 'Find the Qibla with your camera',
                aciklama:
                    'On the Qibla tab, hold your phone upright and look around with the camera: the Kaaba marker appears in the Qibla direction, with your distance to the Kaaba next to it. The compass turns as soon as it opens and moves smoothly.',
                detayAciklama:
                    'If the Kaaba marker is off screen, an arrow at the edge shows which way to turn; when the marker settles in the center ring, the ring turns green and the phone vibrates once. No internet needed, and nothing is recorded. In Compass view without the camera, holding the phone flat shows a classic compass; as you raise it, the compass tilts to the horizon and the Kaaba cube stands up in the Qibla direction. If the direction drifts, move your phone in a figure 8 a few times. With a screen reader on, the direction is read as "Qibla 30° to your right".',
                detaylar: [
                    'The Kaaba marker and your distance to the Kaaba on camera',
                    '"Turn right/left" arrows when it is off screen',
                    'A green ring and a single vibration when aligned',
                    'A 3D compass that tilts to the horizon as you raise the phone',
                    'A compass that works right away and stays steady',
                    'Works offline; nothing is recorded',
                ],
            },
            id: {
                baslik: 'Temukan kiblat dengan kamera',
                aciklama: "Di tab Kiblat, pegang ponsel tegak dan lihat sekeliling dengan kamera: tanda Ka'bah muncul di arah kiblat, dengan jarak Anda ke Ka'bah di sebelahnya. Kompas langsung berputar begitu dibuka dan bergerak dengan mulus.",
                detayAciklama: 'Jika tanda Ka\'bah di luar layar, panah di tepi menunjukkan arah putar; saat tanda berada di lingkaran tengah, lingkaran berubah hijau dan ponsel bergetar sekali. Tidak perlu internet, dan tidak ada yang direkam. Di tampilan Kompas tanpa kamera, ponsel yang dipegang mendatar menampilkan kompas klasik; saat diangkat, kompas miring ke arah cakrawala dan kubus Ka\'bah berdiri di arah kiblat. Jika arah bergeser, gerakkan ponsel membentuk angka 8 beberapa kali. Saat pembaca layar aktif, arah dibacakan seperti "Kiblat 30° di sebelah kanan Anda".',
                detaylar: [
                    "Tanda Ka'bah dan jarak Anda ke Ka'bah di kamera",
                    'Panah "putar ke kanan/kiri" saat tanda di luar layar',
                    'Lingkaran hijau dan satu getaran saat arah sudah tepat',
                    'Kompas 3D yang miring ke arah cakrawala saat ponsel diangkat',
                    'Kompas yang langsung berfungsi dan tetap stabil',
                    'Berfungsi tanpa internet; tidak ada yang direkam',
                ],
            },
            de: {
                baslik: 'Die Qibla mit der Kamera finden',
                aciklama: 'Halten Sie im Tab Qibla Ihr Telefon aufrecht und schauen Sie sich mit der Kamera um: Das Kaaba-Zeichen erscheint in Richtung der Qibla, daneben Ihre Entfernung zur Kaaba. Der Kompass dreht sich sofort beim Öffnen und bewegt sich ruhig.',
                detayAciklama: 'Liegt das Kaaba-Zeichen außerhalb des Bildschirms, zeigt ein Pfeil am Rand, in welche Richtung Sie sich drehen müssen; erreicht das Zeichen den Ring in der Mitte, wird der Ring grün und das Telefon vibriert einmal. Kein Internet nötig, nichts wird aufgezeichnet. In der Kompassansicht ohne Kamera zeigt das flach gehaltene Telefon einen klassischen Kompass; heben Sie es an, neigt sich der Kompass zum Horizont und der Kaaba-Würfel richtet sich in Richtung der Qibla auf. Weicht die Richtung ab, bewegen Sie Ihr Telefon einige Male in Form einer Acht. Mit eingeschaltetem Screenreader wird die Richtung zum Beispiel als „Die Qibla ist 30° rechts von Ihnen“ vorgelesen.',
                detaylar: [
                    'Kaaba-Zeichen und Ihre Entfernung zur Kaaba im Kamerabild',
                    'Pfeile „nach rechts/links drehen“, wenn es außerhalb des Bildschirms liegt',
                    'Ein grüner Ring und eine einzige Vibration bei richtiger Ausrichtung',
                    'Ein 3D-Kompass, der sich beim Anheben des Telefons zum Horizont neigt',
                    'Ein Kompass, der sofort funktioniert und ruhig bleibt',
                    'Funktioniert offline; nichts wird aufgezeichnet',
                ],
            },
            fr: {
                baslik: 'Trouvez la Qibla avec votre caméra',
                aciklama: 'Dans l’onglet Qibla, tenez votre téléphone à la verticale et regardez autour de vous avec la caméra : le repère de la Kaaba apparaît dans la direction de la Qibla, avec votre distance jusqu’à la Kaaba. La boussole tourne dès l’ouverture et se déplace sans à-coups.',
                detayAciklama: 'Si le repère de la Kaaba est hors de l’écran, une flèche sur le bord indique de quel côté tourner ; quand le repère se place dans l’anneau central, l’anneau devient vert et le téléphone vibre une fois. Aucune connexion Internet n’est nécessaire et rien n’est enregistré. Dans la vue Boussole sans caméra, en tenant le téléphone à plat, vous voyez une boussole classique ; à mesure que vous le redressez, la boussole bascule vers l’horizon et le cube de la Kaaba se dresse dans la direction de la Qibla. Si la direction dérive, déplacez votre téléphone plusieurs fois en dessinant un 8. Avec un lecteur d’écran, la direction est lue ainsi : « La Qibla est à 30° sur votre droite ».',
                detaylar: [
                    'Le repère de la Kaaba et votre distance jusqu’à la Kaaba à la caméra',
                    'Des flèches « tournez à droite/à gauche » quand il est hors de l’écran',
                    'Un anneau vert et une seule vibration une fois aligné',
                    'Une boussole 3D qui bascule vers l’horizon quand vous redressez le téléphone',
                    'Une boussole qui fonctionne dès l’ouverture et reste stable',
                    'Fonctionne hors ligne ; rien n’est enregistré',
                ],
            },
            bs: {
                baslik: 'Pronađite kiblu kamerom',
                aciklama: 'Na kartici Kibla držite telefon uspravno i pogledajte oko sebe kamerom: oznaka Kabe pojavljuje se u smjeru kible, a pored nje Vaša udaljenost do Kabe. Kompas se okreće čim se otvori i kreće se glatko.',
                detayAciklama: 'Ako je oznaka Kabe izvan ekrana, strelica na rubu pokazuje na koju stranu da se okrenete; kada se oznaka smjesti u središnji krug, krug postaje zelen i telefon jednom zavibrira. Internet nije potreban i ništa se ne snima. U prikazu Kompas bez kamere, kada telefon držite položeno, vidite klasični kompas; kako ga podižete, kompas se naginje prema horizontu, a kocka Kabe se uspravlja u smjeru kible. Ako smjer odstupa, nekoliko puta pomjerite telefon kao da crtate osmicu. Uz čitač ekrana smjer se čita kao „Kibla je 30° desno od Vas”.',
                detaylar: [
                    'Oznaka Kabe i Vaša udaljenost do Kabe na kameri',
                    'Strelice „okrenite se desno/lijevo” kada je izvan ekrana',
                    'Zeleni krug i jedna vibracija kada ste poravnati',
                    '3D kompas koji se naginje prema horizontu dok podižete telefon',
                    'Kompas koji radi odmah i ostaje stabilan',
                    'Radi bez interneta; ništa se ne snima',
                ],
            },
            ru: {
                baslik: 'Найдите киблу через камеру',
                aciklama: 'На вкладке «Кибла» держите телефон вертикально и осмотритесь через камеру: знак Каабы появится в направлении киблы, а рядом — расстояние до Каабы. Компас поворачивается сразу после открытия и движется плавно.',
                detayAciklama: 'Если знак Каабы за краем экрана, стрелка у края показывает, куда повернуться; когда знак встаёт в центральное кольцо, кольцо становится зелёным и телефон один раз вибрирует. Интернет не нужен, ничего не записывается. В режиме компаса без камеры, если держать телефон горизонтально, виден классический компас; когда вы поднимаете телефон, компас наклоняется к горизонту, а куб Каабы встаёт в направлении киблы. Если направление сбивается, несколько раз поводите телефоном, рисуя восьмёрку. При включённой программе чтения с экрана направление озвучивается так: «Кибла на 30° справа от вас».',
                detaylar: [
                    'Знак Каабы и расстояние до неё на изображении камеры',
                    'Стрелки «Повернитесь вправо/влево», когда знак за краем экрана',
                    'Зелёное кольцо и одна вибрация при совпадении',
                    'Объёмный компас, который наклоняется к горизонту, когда вы поднимаете телефон',
                    'Компас, который работает сразу и не дрожит',
                    'Работает без интернета; ничего не записывается',
                ],
            },
            ms: {
                baslik: 'Cari arah kiblat dengan kamera anda',
                aciklama: 'Pada tab Kiblat, pegang telefon secara tegak dan lihat sekeliling dengan kamera: tanda Kaabah muncul ke arah kiblat, dengan jarak anda ke Kaabah di sebelahnya. Kompas berpusing sebaik sahaja dibuka dan bergerak dengan lancar.',
                detayAciklama: 'Jika tanda Kaabah berada di luar skrin, anak panah di tepi menunjukkan arah untuk berpusing; apabila tanda berada di dalam gelang tengah, gelang bertukar hijau dan telefon bergetar sekali. Tanpa internet, dan tiada apa-apa yang dirakam. Dalam paparan Kompas tanpa kamera, memegang telefon secara mendatar memaparkan kompas biasa; apabila anda mengangkatnya, kompas condong ke arah ufuk dan kiub Kaabah berdiri ke arah kiblat. Jika arah tersasar, gerakkan telefon anda seperti melukis angka 8 beberapa kali. Dengan pembaca skrin dihidupkan, arah dibacakan sebagai "Kiblat 30° di sebelah kanan anda".',
                detaylar: [
                    'Tanda Kaabah dan jarak anda ke Kaabah pada kamera',
                    'Anak panah "Pusing ke kanan/kiri" apabila ia di luar skrin',
                    'Gelang hijau dan satu getaran apabila sejajar',
                    'Kompas 3D yang condong ke arah ufuk apabila anda mengangkat telefon',
                    'Kompas yang terus berfungsi dan kekal stabil',
                    'Berfungsi di luar talian; tiada apa-apa yang dirakam',
                ],
            },
            ar: {
                baslik: 'تحديد القبلة بالكاميرا',
                aciklama: 'في تبويب القبلة، إمساك الهاتف عموديًا والنظر حولك بالكاميرا: تظهر علامة الكعبة في اتجاه القبلة، وبجانبها المسافة إلى الكعبة. وتدور البوصلة فور فتحها وتتحرك بسلاسة.',
                detayAciklama: 'إن كانت علامة الكعبة خارج الشاشة، يدل سهم على الحافة على جهة الاستدارة؛ وحين تستقر العلامة في الحلقة الوسطى تخضرّ الحلقة ويهتز الهاتف مرة واحدة. لا حاجة إلى الإنترنت، ولا يُسجَّل شيء. وفي عرض البوصلة دون كاميرا يظهر عند وضع الهاتف أفقيًا بوصلة تقليدية؛ ومع رفعه تميل البوصلة نحو الأفق ويقف مكعب الكعبة في اتجاه القبلة. وإن انحرف الاتجاه، يُحرَّك الهاتف على شكل الرقم 8 بضع مرات. ومع تفعيل قارئ الشاشة يُقرأ الاتجاه هكذا: «القبلة 30° إلى يمينك».',
                detaylar: [
                    'علامة الكعبة والمسافة إليها على الكاميرا',
                    'أسهم «يمينًا/يسارًا» حين تكون خارج الشاشة',
                    'حلقة خضراء واهتزاز واحد عند المحاذاة',
                    'بوصلة ثلاثية الأبعاد تميل نحو الأفق مع رفع الهاتف',
                    'بوصلة تعمل فورًا وتبقى ثابتة',
                    'تعمل دون إنترنت؛ ولا يُسجَّل شيء',
                ],
            },
            ur: {
                baslik: 'کیمرے سے قبلہ معلوم کریں',
                aciklama: 'قبلہ ٹیب پر فون سیدھا پکڑ کر کیمرے سے اردگرد دیکھیں: کعبہ کا نشان قبلہ کی سمت میں ظاہر ہوتا ہے اور ساتھ کعبہ تک آپ کا فاصلہ۔ قطب نما کھلتے ہی گھومتا ہے اور ہموار انداز میں حرکت کرتا ہے۔',
                detayAciklama: 'اگر کعبہ کا نشان اسکرین سے باہر ہو تو کنارے پر ایک تیر بتاتا ہے کہ کس طرف مڑنا ہے؛ نشان درمیانی دائرے میں ٹھہرنے پر دائرہ سبز ہو جاتا ہے اور فون ایک بار وائبریٹ کرتا ہے۔ انٹرنیٹ کی ضرورت نہیں اور کچھ ریکارڈ نہیں ہوتا۔ کیمرے کے بغیر قطب نما منظر میں فون سیدھا لٹانے پر عام قطب نما نظر آتا ہے؛ فون اٹھانے پر قطب نما افق کی طرف جھکتا ہے اور کعبہ کا مکعب قبلہ کی سمت میں کھڑا ہو جاتا ہے۔ اگر سمت ہلے تو فون کو چند بار 8 کی شکل میں گھمائیں۔ اسکرین ریڈر آن ہو تو سمت یوں پڑھی جاتی ہے: “قبلہ آپ کے دائیں جانب 30° پر ہے”۔',
                detaylar: [
                    'کیمرے پر کعبہ کا نشان اور کعبہ تک آپ کا فاصلہ',
                    'اسکرین سے باہر ہونے پر “دائیں/بائیں مڑیں” کے تیر',
                    'سیدھ میں آنے پر سبز دائرہ اور ایک وائبریشن',
                    'فون اٹھانے پر افق کی طرف جھکنے والا 3D قطب نما',
                    'فوراً کام کرنے والا اور مستحکم قطب نما',
                    'آف لائن کام کرتا ہے؛ کچھ ریکارڈ نہیں ہوتا',
                ],
            },
            es: {
                baslik: 'Encuentre la alquibla con la cámara',
                aciklama: 'En la pestaña Alquibla, sostenga el teléfono en vertical y mire a su alrededor con la cámara: la marca de la Kaaba aparece en la dirección de la alquibla, con su distancia a la Kaaba al lado. La brújula gira en cuanto se abre y se mueve con suavidad.',
                detayAciklama: 'Si la marca de la Kaaba está fuera de la pantalla, una flecha en el borde le indica hacia dónde girar; cuando la marca se coloca en el anillo central, el anillo se vuelve verde y el teléfono vibra una vez. No hace falta internet y no se graba nada. En la vista Brújula sin cámara, con el teléfono en horizontal ve una brújula clásica; al levantarlo, la brújula se inclina hacia el horizonte y el cubo de la Kaaba se levanta en la dirección de la alquibla. Si la dirección se desvía, mueva el teléfono dibujando un 8 unas cuantas veces. Con un lector de pantalla activado, la dirección se lee como «La alquibla está 30° a su derecha».',
                detaylar: [
                    'La marca de la Kaaba y su distancia a la Kaaba en la cámara',
                    'Flechas «gire a la derecha/izquierda» cuando está fuera de la pantalla',
                    'Un anillo verde y una sola vibración al alinearse',
                    'Una brújula 3D que se inclina hacia el horizonte al levantar el teléfono',
                    'Una brújula que funciona al instante y se mantiene estable',
                    'Funciona sin conexión; no se graba nada',
                ],
            },
            nl: {
                baslik: 'De qibla vinden met uw camera',
                aciklama: 'Houd op het tabblad Qibla uw telefoon rechtop en kijk met de camera om u heen: het Kaaba-teken verschijnt in de richting van de qibla, met uw afstand tot de Kaaba ernaast. Het kompas draait zodra het opent en beweegt soepel.',
                detayAciklama: 'Als het Kaaba-teken buiten beeld is, wijst een pijl aan de rand aan welke kant u op moet draaien; wanneer het teken in de ring in het midden staat, wordt de ring groen en trilt de telefoon één keer. Geen internet nodig, en er wordt niets opgenomen. In de kompasweergave zonder camera toont de telefoon plat gehouden een klassiek kompas; als u hem optilt, kantelt het kompas naar de horizon en komt de Kaaba-kubus rechtop te staan in de richting van de qibla. Verschuift de richting, beweeg uw telefoon dan een paar keer in de vorm van een 8. Met een schermlezer wordt de richting voorgelezen als "De qibla is 30° rechts van u".',
                detaylar: [
                    'Het Kaaba-teken en uw afstand tot de Kaaba in beeld',
                    'Pijlen "naar rechts/links draaien" als het buiten beeld is',
                    'Een groene ring en één trilling als het goed staat',
                    'Een 3D-kompas dat naar de horizon kantelt als u de telefoon optilt',
                    'Een kompas dat meteen werkt en stabiel blijft',
                    'Werkt offline; er wordt niets opgenomen',
                ],
            },
            sq: {
                baslik: 'Gjeni kiblen me kamerë',
                aciklama: 'Në skedën Kibla, mbajeni telefonin drejt dhe shikoni përreth me kamerë: shenja e Qabes shfaqet në drejtim të kibles, me largësinë tuaj nga Qabeja pranë saj. Busulla rrotullohet sapo hapet dhe lëviz butë.',
                detayAciklama: 'Nëse shenja e Qabes është jashtë ekranit, një shigjetë në skaj tregon nga të ktheheni; kur shenja vendoset në rrethin qendror, rrethi bëhet i gjelbër dhe telefoni dridhet një herë. Nuk nevojitet internet dhe asgjë nuk regjistrohet. Në pamjen Busulla pa kamerë, kur telefoni mbahet horizontalisht shfaqet një busull klasike; kur e ngrini, busulla anon drejt horizontit dhe kubi i Qabes ngrihet në drejtim të kibles. Nëse drejtimi lëviz, lëvizni telefonin disa herë sikur të vizatoni një 8. Me lexuesin e ekranit aktiv, drejtimi lexohet si "Kibla është 30° në të djathtën tuaj".',
                detaylar: [
                    'Shenja e Qabes dhe largësia juaj nga Qabeja në kamerë',
                    'Shigjeta "Kthehuni djathtas/majtas" kur është jashtë ekranit',
                    'Rreth i gjelbër dhe një dridhje e vetme kur jeni drejt',
                    'Busull 3D që anon drejt horizontit kur ngrini telefonin',
                    'Busull që punon menjëherë dhe qëndron e qetë',
                    'Punon pa internet; asgjë nuk regjistrohet',
                ],
            },
            hi: {
                baslik: 'कैमरे से क़िबला ढूंढें',
                aciklama: 'क़िबला टैब पर फ़ोन सीधा खड़ा रखें और कैमरे से आस-पास देखें: काबा का निशान क़िबले की दिशा में दिखता है, और उसके पास काबा तक आपकी दूरी। कम्पास खुलते ही घूमने लगता है और आराम से चलता है।',
                detayAciklama: 'अगर काबा का निशान स्क्रीन से बाहर हो, तो किनारे पर एक तीर बताता है कि किधर मुड़ना है; निशान बीच के घेरे में आने पर घेरा हरा हो जाता है और फ़ोन एक बार वाइब्रेट करता है। इंटरनेट की ज़रूरत नहीं, और कुछ रिकॉर्ड नहीं होता। बिना कैमरे के कम्पास व्यू में फ़ोन सीधा लिटाने पर आम कम्पास दिखता है; उठाने पर कम्पास क्षितिज की तरफ़ झुकता है और काबा का घन क़िबले की दिशा में खड़ा हो जाता है। अगर दिशा खिसके, तो फ़ोन को कुछ बार 8 की शक्ल में घुमाएं। स्क्रीन रीडर चालू हो तो दिशा "क़िबला आपकी दाईं तरफ़ 30° पर है" की तरह पढ़ी जाती है।',
                detaylar: [
                    'कैमरे पर काबा का निशान और काबा तक आपकी दूरी',
                    'स्क्रीन से बाहर होने पर "दाएं/बाएं मुड़ें" वाले तीर',
                    'सीध में आने पर हरा घेरा और एक बार वाइब्रेशन',
                    'फ़ोन उठाने पर क्षितिज की तरफ़ झुकने वाला 3D कम्पास',
                    'फ़ौरन काम करने वाला और स्थिर रहने वाला कम्पास',
                    'बिना इंटरनेट काम करता है; कुछ रिकॉर्ड नहीं होता',
                ],
            },
            bn: {
                baslik: 'ক্যামেরা দিয়ে কিবলা খুঁজুন',
                aciklama: 'কিবলা ট্যাবে ফোন সোজা করে ধরে ক্যামেরা দিয়ে চারপাশে দেখুন: কিবলার দিকে কাবার চিহ্ন দেখা যায়, পাশে কাবা পর্যন্ত আপনার দূরত্ব। কম্পাস খোলার সাথে সাথে ঘোরে এবং মসৃণভাবে চলে।',
                detayAciklama: 'কাবার চিহ্ন স্ক্রিনের বাইরে থাকলে কিনারার একটি তীর দেখায় কোন দিকে ঘুরতে হবে; চিহ্নটি মাঝের বৃত্তে বসলে বৃত্ত সবুজ হয় এবং ফোন একবার কাঁপে। ইন্টারনেট লাগে না, কিছুই রেকর্ড হয় না। ক্যামেরা ছাড়া কম্পাস দৃশ্যে ফোন সমতলে ধরলে সাধারণ কম্পাস দেখা যায়; ফোন তুললে কম্পাস দিগন্তের দিকে হেলে যায় এবং কিবলার দিকে কাবার ঘনক দাঁড়িয়ে যায়। দিক সরে গেলে ফোনটি কয়েকবার বাতাসে 8 আকারে ঘোরান। স্ক্রিন রিডার চালু থাকলে দিকটি "কিবলা আপনার ডানে 30°" হিসেবে পড়া হয়।',
                detaylar: [
                    'ক্যামেরায় কাবার চিহ্ন ও কাবা পর্যন্ত আপনার দূরত্ব',
                    'স্ক্রিনের বাইরে থাকলে "ডানে/বামে ঘুরুন" তীর',
                    'মিলে গেলে সবুজ বৃত্ত ও একবার কম্পন',
                    'ফোন তুললে দিগন্তের দিকে হেলে যাওয়া 3D কম্পাস',
                    'সাথে সাথে কাজ করা ও স্থির থাকা কম্পাস',
                    'অফলাইনে কাজ করে; কিছুই রেকর্ড হয় না',
                ],
            },
            fa: {
                baslik: 'پیدا کردن قبله با دوربین',
                aciklama: 'در زبانهٔ قبله، تلفن را عمودی نگه دارید و با دوربین به اطراف نگاه کنید: نشان کعبه در جهت قبله ظاهر می‌شود و فاصلهٔ شما تا کعبه کنارش دیده می‌شود. قطب‌نما همین که باز شود می‌چرخد و نرم حرکت می‌کند.',
                detayAciklama: 'اگر نشان کعبه بیرون از صفحه باشد، پیکانی در لبه نشان می‌دهد به کدام سو بچرخید؛ وقتی نشان در حلقهٔ میانی جا بگیرد، حلقه سبز می‌شود و تلفن یک بار می‌لرزد. به اینترنت نیازی نیست و چیزی ضبط نمی‌شود. در نمای قطب‌نما بدون دوربین، اگر تلفن را افقی نگه دارید قطب‌نمای کلاسیک دیده می‌شود؛ با بالا آوردنش، قطب‌نما به سوی افق خم می‌شود و مکعب کعبه در جهت قبله می‌ایستد. اگر جهت جابه‌جا شود، تلفن را چند بار به شکل عدد 8 حرکت دهید. با صفحه‌خوان روشن، جهت این‌گونه خوانده می‌شود: «قبله 30° سمت راست شماست».',
                detaylar: [
                    'نشان کعبه و فاصلهٔ شما تا کعبه روی تصویر دوربین',
                    'پیکان‌های «به راست/چپ بچرخید» وقتی نشان بیرون از صفحه است',
                    'حلقهٔ سبز و یک لرزش هنگام هم‌راستا شدن',
                    'قطب‌نمای سه‌بعدی که با بالا آوردن تلفن به سوی افق خم می‌شود',
                    'قطب‌نمایی که بی‌درنگ کار می‌کند و پایدار می‌ماند',
                    'بدون اینترنت کار می‌کند؛ چیزی ضبط نمی‌شود',
                ],
            },
            ps: {
                baslik: 'قبله په خپلې کمرې ومومئ',
                aciklama: 'د قبلې په ټب کې خپل موبایل نېغ ونیسئ او په کمره شاوخوا وګورئ: د کعبې نښه د قبلې په لور ښکاري، او څنګ ته یې تر کعبې ستاسو واټن. قطب نما د پرانیستلو سره سم ګرځي او نرمه خوځېږي.',
                detayAciklama: 'که د کعبې نښه له سکرین بهر وي، د سکرین په څنډه یو غشی ښيي چې کوم لوري ته وګرځئ؛ کله چې نښه په منځني کړۍ کې ودرېږي، کړۍ شنه کېږي او موبایل یو ځل لړزېږي. انټرنېټ ته اړتیا نشته، او هېڅ شی نه ثبتېږي. د قطب نما په لید کې پرته له کمرې، کله چې موبایل افقي ونیسئ کلاسیکه قطب نما ښکاري؛ کله چې یې پورته کړئ، قطب نما افق ته کږېږي او د کعبې مکعب د قبلې په لور ودرېږي. که لوری ښوییږي، خپل موبایل څو ځله داسې وخوځوئ لکه 8 چې رسموئ. کله چې د سکرین لوستونکی فعال وي، لوری داسې لوستل کېږي: «قبله ستاسو ښي لور ته 30° ده».',
                detaylar: [
                    'په کمره کې د کعبې نښه او تر کعبې ستاسو واټن',
                    'کله چې له سکرین بهر وي، «ښي/کیڼ لور ته وګرځئ» غشي',
                    'د برابرېدو پر مهال شنه کړۍ او یوه لړزه',
                    'درې اړخیزه قطب نما چې د موبایل په پورته کولو افق ته کږېږي',
                    'قطب نما چې سمدستي کار کوي او ثابته پاتې کېږي',
                    'پرته له انټرنېټه کار کوي؛ هېڅ شی نه ثبتېږي',
                ],
            },
            ckb: {
                baslik: 'قیبلە بە کامێراکەتان بدۆزنەوە',
                aciklama: 'لە تابی قیبلە، مۆبایلەکەتان ڕاست ڕابگرن و بە کامێرا بە دەوروبەردا بڕوانن: نیشانەی کەعبە لە ئاراستەی قیبلەدا دەردەکەوێت، و دووریتان لە کەعبە لە تەنیشتییەوە. قیبلەنما ھەر کە دەکرێتەوە دەسووڕێتەوە و بە نەرمی دەجووڵێت.',
                detayAciklama: 'ئەگەر نیشانەی کەعبە لە دەرەوەی شاشەیە، تیرێک لە لێوارەکەدا پیشان دەدات بەرەو کام لا بسووڕێنەوە؛ کاتێک نیشانەکە لە ناو بازنەی ناوەڕاستدا جێگیر دەبێت، بازنەکە سەوز دەبێت و مۆبایلەکە یەک جار دەلەرێتەوە. ئینتەرنێت پێویست نییە و ھیچ شتێک تۆمار ناکرێت. لە دیمەنی قیبلەنمادا بەبێ کامێرا، ئەگەر مۆبایلەکە بە ڕاکشاوی ڕابگرن قیبلەنمایەکی کلاسیک دەردەکەوێت؛ کاتێک بەرزی دەکەنەوە، قیبلەنماکە بەرەو ئاسۆ لار دەبێتەوە و چوارگۆشەی کەعبە لە ئاراستەی قیبلەدا ڕاست دەبێتەوە. ئەگەر ئاراستەکە دەخلیسکێت، چەند جارێک مۆبایلەکەتان بە شێوەی ژمارە 8 بجووڵێنن. کاتێک خوێنەری شاشە چالاکە، ئاراستەکە وەک «قیبلە 30° لە لای ڕاستتانە» دەخوێندرێتەوە.',
                detaylar: [
                    'نیشانەی کەعبە و دووریتان لە کەعبە لەسەر کامێرا',
                    'تیرەکانی «بسووڕێنەوە بۆ ڕاست/چەپ» کاتێک لە دەرەوەی شاشەیە',
                    'بازنەیەکی سەوز و یەک لەرینەوە کاتێک ڕێک دەبێت',
                    'قیبلەنمایەکی سێ ڕەھەندی کە کاتێک مۆبایلەکە بەرز دەکەنەوە بەرەو ئاسۆ لار دەبێتەوە',
                    'قیبلەنمایەک کە یەکسەر کار دەکات و جێگیر دەمێنێت',
                    'بەبێ ئینتەرنێت کار دەکات؛ ھیچ شتێک تۆمار ناکرێت',
                ],
            },
            ug: {
                baslik: 'قىبلىنى كامېرا بىلەن تېپىڭ',
                aciklama: 'قىبلە بەتكۈچىدە تېلېفونىڭىزنى تىك تۇتۇپ، كامېرا بىلەن ئەتراپىڭىزغا قاراڭ: كەبە بەلگىسى قىبلە يۆنىلىشىدە كۆرۈنىدۇ، يېنىدا كەبىگىچە بولغان ئارىلىقىڭىز يېزىلىدۇ. كومپاس ئېچىلىشى بىلەنلا ئايلىنىدۇ ۋە تىترىمەي راۋان ھەرىكەتلىنىدۇ.',
                detayAciklama: 'كەبە بەلگىسى ئېكراندىن سىرتتا بولسا، چەتتىكى يا ئوق قايسى تەرەپكە بۇرۇلۇشىڭىزنى كۆرسىتىدۇ؛ بەلگە ئوتتۇرىدىكى ھالقىغا چۈشكەندە ھالقا يېشىل بولىدۇ ۋە تېلېفون بىر قېتىم تىترەيدۇ. تور كېرەك ئەمەس، ھېچنېمە خاتىرىلەنمەيدۇ. كامېراسىز كومپاس كۆرۈنۈشىدە تېلېفوننى تۈز تۇتسىڭىز ئادەتتىكى كومپاسنى كۆرىسىز؛ تىكلىگەنسېرى كومپاس ئۇپۇققا يانتۇ بولىدۇ ۋە كەبە كۇبى قىبلە يۆنىلىشىدە ئۆرە تۇرىدۇ. يۆنىلىش تېيىلىپ كەتسە، تېلېفونىڭىزنى ھاۋادا 8 سىزغاندەك بىر نەچچە قېتىم ھەرىكەتلەندۈرۈڭ. ئېكران ئوقۇغۇچ ئوچۇق بولسا، يۆنىلىش «قىبلە ئوڭ تەرىپىڭىزدە 30°» دەپ ئوقۇلىدۇ.',
                detaylar: [
                    'كامېرادا كەبە بەلگىسى ۋە كەبىگىچە ئارىلىق',
                    'ئېكراندىن سىرتتا بولسا «ئوڭغا/سولغا بۇرۇلۇڭ» يا ئوقلىرى',
                    'توغرىلانغاندا يېشىل ھالقا ۋە بىر قېتىملىق تىترەش',
                    'تېلېفوننى تىكلىگەندە ئۇپۇققا يانتۇ بولىدىغان ئۈچ ئۆلچەملىك كومپاس',
                    'دەرھال ئىشلەيدىغان، تىترىمەيدىغان كومپاس',
                    'تورسىز ئىشلەيدۇ؛ ھېچنېمە خاتىرىلەنمەيدۇ',
                ],
            },
            az: {
                baslik: 'Qibləni kamera ilə tapın',
                aciklama: 'Qiblə bölməsində telefonunuzu şaquli tutub kamera ilə ətrafa baxın: Kəbə işarəsi qiblə istiqamətində, yanında isə Kəbəyə olan məsafəniz görünür. Kompas açılan kimi dönür və hamar hərəkət edir.',
                detayAciklama: 'Kəbə işarəsi ekrandan kənardadırsa, kənardakı ox hansı tərəfə dönməli olduğunuzu göstərir; işarə mərkəzdəki halqaya oturduqda halqa yaşıl olur və telefon bir dəfə titrəyir. İnternet lazım deyil, heç nə yazılmır. Kamerasız Kompas görünüşündə telefonu üfüqi tutduqda klassik kompas görünür; qaldırdıqca kompas üfüqə əyilir və Kəbə kubu qiblə istiqamətində dikəlir. İstiqamət sürüşürsə, telefonunuzu bir neçə dəfə havada 8 rəqəmi çəkirmiş kimi hərəkət etdirin. Ekran oxuyucu açıq olanda istiqamət "Qiblə 30° sağınızdadır" kimi oxunur.',
                detaylar: [
                    'Kamerada Kəbə işarəsi və Kəbəyə olan məsafəniz',
                    'Ekrandan kənarda olanda "sağa/sola dönün" oxları',
                    'İstiqamət düzələndə yaşıl halqa və bir dəfə titrəmə',
                    'Telefonu qaldırdıqca üfüqə əyilən 3D kompas',
                    'Dərhal işləyən və sabit qalan kompas',
                    'İnternetsiz işləyir; heç nə yazılmır',
                ],
            },
            uz: {
                baslik: 'Қиблани камера орқали топинг',
                aciklama: 'Қибла бўлимида телефонингизни тик ушлаб, камера орқали атрофга қаранг: Каъба белгиси қибла томонида пайдо бўлади, ёнида Каъбагача бўлган масофа ёзилади. Компас очилиши билан айланади ва силлиқ ҳаракатланади.',
                detayAciklama: 'Каъба белгиси экрандан ташқарида бўлса, четдаги ўқ қайси томонга бурилишингизни кўрсатади; белги ўртадаги ҳалқага тушганда ҳалқа яшил бўлади ва телефон бир марта тебранади. Интернет керак эмас, тасвир ёзиб олинмайди. Камерасиз Компас кўринишида телефонни тўғри ушласангиз, оддий компасни кўрасиз; уни тиклаганингиз сари компас уфққа ётади ва Каъба куби қибла томонида тик туради. Йўналиш силжиса, телефонингизни ҳавода бир неча марта 8 рақами шаклида айлантиринг. Экран ўқигич ёниқ бўлса, йўналиш «Қибла ўнг томонингизда, 30°» деб ўқилади.',
                detaylar: [
                    'Камерада Каъба белгиси ва Каъбагача масофа',
                    'Экрандан ташқарида бўлса, «ўнгга/чапга бурилинг» ўқлари',
                    'Тўғриланганда яшил ҳалқа ва битта тебраниш',
                    'Телефонни тиклаганингизда уфққа ётадиган 3D компас',
                    'Дарҳол ишлайдиган, титрамайдиган компас',
                    'Интернетсиз; тасвир ёзиб олинмайди',
                ],
            },
            kk: {
                baslik: 'Құбыланы камерамен табыңыз',
                aciklama: 'Құбыла қойындысында телефоныңызды тік ұстап, камерамен айналаңызға қараңыз: Қағба белгісі құбыла бағытында пайда болады, жанында Қағбаға дейінгі қашықтық жазылады. Компас ашылған бойда бұрылады және дірілсіз, біркелкі қозғалады.',
                detayAciklama: 'Қағба белгісі экраннан тыс болса, шеттегі көрсеткіш қай жаққа бұрылу керегін көрсетеді; белгі ортадағы шеңберге түскенде шеңбер жасылға айналып, телефон бір рет дірілдейді. Интернет керек емес, сурет жазылмайды. Камерасыз Компас көрінісінде телефонды жазық ұстағанда классикалық компасты көресіз; тіктеген сайын компас көкжиекке қарай жатады, ал Қағба текшесі құбыла бағытында тік тұрады. Бағыт ауытқып кетсе, телефонды ауада 8 санын салғандай бірнеше рет қозғаңыз. Экранды оқу құралы қосулы болса, бағыт «Құбыла оң жағыңызда, 30°» деп оқылады.',
                detaylar: [
                    'Камерада Қағба белгісі және Қағбаға дейінгі қашықтық',
                    'Экраннан тыс болса, «оңға/солға бұрылыңыз» көрсеткіштері',
                    'Бағытталғанда жасыл шеңбер және бір рет діріл',
                    'Телефонды тіктегенде көкжиекке жататын 3D компас',
                    'Ашылған бойда жұмыс істейтін, дірілдемейтін компас',
                    'Интернетсіз; сурет жазылмайды',
                ],
            },
            ky: {
                baslik: 'Кыбыланы камераңыз менен табыңыз',
                aciklama: 'Кыбыла өтмөгүндө телефонуңузду тик кармап, камера менен айланаңызды караңыз: Каабанын белгиси кыбыла тарапта, жанында Каабага чейинки аралык менен пайда болот. Компас ачылаары менен бурулуп, жылмакай кыймылдайт.',
                detayAciklama: 'Каабанын белгиси экрандан тышкары болсо, четиндеги жебе кайсы тарапка бурулууну көрсөтөт; белги борбордогу шакекке орношкондо шакек жашылга боёлуп, телефон бир жолу дирилдейт. Интернет керек эмес жана эч нерсе жазылбайт. Камерасыз Компас көрүнүшүндө телефонду жалпак кармасаңыз, классикалык компас көрүнөт; аны көтөргөн сайын компас горизонтко карай ыңкайып, Каабанын кубу кыбыла тарапта тик турат. Багыт жылып кетсе, телефонуңузду бир нече жолу 8 санынын формасында кыймылдатыңыз. Экран окугуч күйүк болсо, багыт «Кыбыла сизден 30° оң тарапта» деп окулат.',
                detaylar: [
                    'Камерада Каабанын белгиси жана Каабага чейинки аралык',
                    'Экрандан тышкары болгондо «оңго/солго бурулуңуз» жебелери',
                    'Багыт туура келгенде жашыл шакек жана бир жолу дирилдөө',
                    'Телефонду көтөргөн сайын горизонтко ыңкайган 3D компас',
                    'Дароо иштеп, туруктуу турган компас',
                    'Интернетсиз иштейт; эч нерсе жазылбайт',
                ],
            },
            tg: {
                baslik: 'Қибларо бо камера ёбед',
                aciklama: 'Дар ҷадвалчаи Қибла телефонро рост нигоҳ дошта, бо камера ба атроф нигаред: аломати Каъба дар самти қибла пайдо мешавад ва дар паҳлӯяш масофаи Шумо то Каъба. Қутбнамо ҳамин ки кушода шуд, мечархад ва ҳамвор ҳаракат мекунад.',
                detayAciklama: 'Агар аломати Каъба берун аз экран бошад, тирча дар канор нишон медиҳад, ки ба кадом тараф гардед; вақте ки аломат дар ҳалқаи марказӣ ҷойгир мешавад, ҳалқа сабз мешавад ва телефон як бор меларзад. Интернет лозим нест ва ҳеҷ чиз сабт намешавад. Дар намуди Қутбнамо бе камера, агар телефонро ҳамвор нигоҳ доред, қутбнамои классикӣ нишон дода мешавад; ҳангоми баланд кардан қутбнамо ба уфуқ хам мешавад ва мукааби Каъба дар самти қибла рост меистад. Агар самт лағжад, телефонатонро чанд бор ба шакли рақами 8 ҳаракат диҳед. Ҳангоми фаъол будани хонандаи экран самт чунин хонда мешавад: «Қибла 30° аз тарафи рости Шумост».',
                detaylar: [
                    'Аломати Каъба ва масофаи Шумо то Каъба дар камера',
                    'Тирчаҳои «ба рост/чап гардед», вақте ки берун аз экран аст',
                    'Ҳалқаи сабз ва як ларзиш ҳангоми мувофиқ омадан',
                    'Қутбнамои сеченака, ки ҳангоми баланд кардани телефон ба уфуқ хам мешавад',
                    'Қутбнамое, ки фавран кор мекунад ва устувор мемонад',
                    'Бе интернет кор мекунад; ҳеҷ чиз сабт намешавад',
                ],
            },
            sw: {
                baslik: 'Pata Kibla kwa kamera yako',
                aciklama: 'Kwenye kichupo cha Kibla, shika simu yako wima na utazame pande zote kwa kamera: alama ya Al-Kaaba inaonekana upande wa Kibla, na umbali wako hadi Al-Kaaba kando yake. Dira inageuka mara inapofunguka na inasogea kwa ulaini.',
                detayAciklama: 'Alama ya Al-Kaaba ikiwa nje ya skrini, mshale ulio ukingoni unaonyesha upande wa kugeuka; alama ikitulia ndani ya pete ya katikati, pete inakuwa ya kijani na simu inatetemeka mara moja. Intaneti haihitajiki, na hakuna kinachorekodiwa. Katika mwonekano wa Dira bila kamera, kushika simu ikiwa imelala kunaonyesha dira ya kawaida; unapoiinua, dira inainama kuelekea upeo wa macho na mchemraba wa Al-Kaaba unasimama upande wa Kibla. Mwelekeo ukihama, sogeza simu yako kwa umbo la 8 mara chache. Kisoma skrini kikiwa kimewashwa, mwelekeo unasomwa kama "Kibla iko 30° upande wako wa kulia".',
                detaylar: [
                    'Alama ya Al-Kaaba na umbali wako hadi Al-Kaaba kwenye kamera',
                    'Mishale ya "Geuka kulia/kushoto" ikiwa nje ya skrini',
                    'Pete ya kijani na mtetemo mmoja ikiwa imenyooka',
                    'Dira ya 3D inayoinama kuelekea upeo wa macho unapoinua simu',
                    'Dira inayofanya kazi mara moja na kubaki imara',
                    'Hufanya kazi bila intaneti; hakuna kinachorekodiwa',
                ],
            },
            ha: {
                baslik: 'Gano Alƙibla da kyamararku',
                aciklama: 'A shafin Alƙibla, ku riƙe wayarku a tsaye ku duba kewaye da kyamara: alamar Kaʼaba tana bayyana a hanyar Alƙibla, tare da nisanku zuwa Kaʼaba kusa da ita. Kamfas yana juyawa da zarar ya buɗe kuma yana motsi a hankali.',
                detayAciklama: 'Idan alamar Kaʼaba ba ta cikin allo, kibiya a gefe tana nuna inda za ku juya; idan alamar ta zauna a zoben tsakiya, zoben yana zama kore kuma wayar tana girgiza sau ɗaya. Ba a buƙatar intanet, kuma ba a naɗar komai. A kallon Kamfas ba tare da kyamara ba, riƙe wayar a kwance yana nuna kamfas na gargajiya; yayin da kuke ɗaga ta, kamfas yana karkata zuwa sararin sama kuma akwatin Kaʼaba yana tsayawa a hanyar Alƙibla. Idan hanyar tana kaucewa, ku zagaya wayarku kamar lamba 8 sau kaɗan. Idan mai karanta allo yana kunne, ana karanta hanyar kamar "Alƙibla tana dama da ku da 30°".',
                detaylar: [
                    'Alamar Kaʼaba da nisanku zuwa Kaʼaba a kyamara',
                    'Kibiyoyin "Juya dama/hagu" idan ba ta cikin allo',
                    'Zobe kore da girgiza ɗaya idan an daidaita',
                    'Kamfas mai girma uku da ke karkata zuwa sararin sama yayin da kuke ɗaga waya',
                    'Kamfas da ke aiki nan take kuma yana tsayawa daidai',
                    'Yana aiki ba tare da intanet ba; ba a naɗar komai',
                ],
            },
            am: {
                baslik: 'ቂብላን በካሜራዎ ያግኙ',
                aciklama: 'በቂብላ ትር ላይ ስልክዎን ቀጥ አድርገው ይያዙና በካሜራው ዙሪያውን ይመልከቱ፦ የካዕባ ምልክቱ በቂብላ አቅጣጫ ይታያል፤ ከጎኑም ከካዕባ ያለዎት ርቀት ይታያል። ኮምፓሱ እንደተከፈተ ይዞራል፤ በለስላሳ ሁኔታም ይንቀሳቀሳል።',
                detayAciklama: 'የካዕባ ምልክቱ ከገጹ ውጭ ከሆነ በጠርዙ ላይ ያለ ቀስት የትኛውን አቅጣጫ መዞር እንዳለብዎ ያሳያል፤ ምልክቱ በመሃል ቀለበቱ ውስጥ ሲቀመጥ ቀለበቱ አረንጓዴ ይሆናል፤ ስልኩም አንድ ጊዜ ይንዘረዘራል። በይነመረብ አያስፈልግም፤ ምንም አይቀረጽም። ያለ ካሜራ በኮምፓስ እይታ ስልኩን ተኝቶ መያዝ ክላሲክ ኮምፓስ ያሳያል፤ ከፍ ሲያደርጉት ኮምፓሱ ወደ አድማሱ ያዘነብላል፤ የካዕባ ኪዩብም በቂብላ አቅጣጫ ይቆማል። አቅጣጫው ከተንሸራተተ ስልክዎን ጥቂት ጊዜ በ8 ቅርጽ ያንቀሳቅሱ። የገጽ አንባቢ ሲበራ አቅጣጫው “ቂብላ ከቀኝዎ 30°” ተብሎ ይነበባል።',
                detaylar: [
                    'በካሜራ ላይ የካዕባ ምልክት እና ከካዕባ ያለዎት ርቀት',
                    'ከገጹ ውጭ ሲሆን “ወደ ቀኝ/ግራ ዙሩ” ቀስቶች',
                    'ሲሰለፍ አረንጓዴ ቀለበት እና አንድ ንዝረት',
                    'ስልኩን ከፍ ሲያደርጉ ወደ አድማሱ የሚያዘነብል 3D ኮምፓስ',
                    'ወዲያውኑ የሚሠራ እና ተረጋግቶ የሚቆይ ኮምፓስ',
                    'ያለ በይነመረብ ይሠራል፤ ምንም አይቀረጽም',
                ],
            },
            om: {
                baslik: 'Qiblaa kaameraa keessaniin argadhaa',
                aciklama: "Kutaa Qiblaa irratti bilbila keessan ol qajeelchaa qabadhaatii kaameraan naannoo ilaalaa: mallattoon Ka'abaa kallattii qiblaatti, fageenya hanga Ka'abaatti cinaa isaatiin mul'ata. Kompaasiin akkuma banameen naanna'ee laafinaan socha'a.",
                detayAciklama: "Yoo mallattoon Ka'abaa fuula ala ta'e, xiyyi qarqara irra jiru gara kamitti akka garagaltan agarsiisa; yeroo mallattoon geengoo gidduu keessa taa'u, geengoon magariisa ta'ee bilbilli si'a tokko raafama. Interneetiin hin barbaachisu, wanti tokkollee hin galmeeffamu. Mul'ata Kompaasii kaameraa malee keessatti, bilbila diriirsanii qabachuun kompaasii durii agarsiisa; yeroo ol kaaftan, kompaasiin gara dachaatti jallatee kuubiin Ka'abaa kallattii qiblaatti ol dhaabata. Yoo kallattiin jijjiirame, bilbila keessan si'a muraasa akka lakkoofsa 8tti sochoosaa. Yeroo dubbisaan fuulaa banaa ta'e, kallattiin \"Qiblaan gara mirga keessanii 30° irra jira\" jedhamee dubbifama.",
                detaylar: [
                    "Mallattoo Ka'abaafi fageenya hanga Ka'abaatti kaameraa irratti",
                    "Yeroo fuula ala ta'e xiyya \"Gara mirgaa/bitaatti garagalaa\"",
                    'Yeroo sirriitti qajeelu geengoo magariisaafi raafama tokko',
                    'Kompaasii 3D yeroo bilbila ol kaaftan gara dachaatti jallatu',
                    "Kompaasii hatattamaan hojjetuufi tasgabbaa'ee hafu",
                    'Interneetii malee hojjeta; wanti tokkollee hin galmeeffamu',
                ],
            },
            so: {
                baslik: 'Ku hel Qiblada kamaraddaada',
                aciklama: 'Tabka Qiblada, taleefankaaga si toos ah u qabo oo kamaradda ku eeg hareerahaaga: calaamadda Kacbadu waxay ka muuqanaysaa jihada Qiblada, iyadoo ay garab taal masaafada aad u jirto Kacbada. Jiheeyuhu wuu wareegaa isla marka uu furmo wuxuuna u dhaqaaqaa si siman.',
                detayAciklama: "Haddii calaamadda Kacbadu ka baxsan tahay shaashadda, fallaar cidhifka ku taal ayaa muujinaysa dhanka aad u jeesanayso; marka calaamaddu dhex fadhiisato goobaabinta bartamaha, goobaabintu waxay noqotaa cagaar taleefankuna hal mar ayuu gariiraa. Internet looma baahna, waxna lama duubo. Muuqaalka Jiheeyaha kamarad la'aan, marka taleefanka si siman loo qabto wuxuu muujiyaa jiheeye caadi ah; marka aad kor u qaaddo, jiheeyuhu wuxuu u janjeeraa jiifka, Kacbaduna waxay ka istaagtaa jihada Qiblada. Haddii jihadu leexato, taleefankaaga dhowr jeer ku dhaqaaji qaabka lambarka 8. Marka akhriyaha shaashaddu shidan yahay, jihada waxaa loo akhriyaa sida \"Qibladu waa 30° dhanka midigtaada\".",
                detaylar: [
                    'Calaamadda Kacbada iyo masaafada aad u jirto Kacbada ee kamaradda',
                    'Fallaaraha "u jeeso midig/bidix" marka ay ka baxsan tahay shaashadda',
                    'Goobaabin cagaar ah iyo hal gariir marka la toosiyo',
                    'Jiheeye 3D ah oo u janjeera jiifka marka aad kor u qaaddo taleefanka',
                    'Jiheeye isla markiiba shaqeeya oo deggan',
                    "Wuxuu shaqeeyaa internet la'aan; waxba lama duubo",
                ],
            },
            ff: {
                baslik: 'Heɓee qibla e kamera mon',
                aciklama: 'E tabbere Qibla, ñiiɓnee talifon mon ndaaron sara mon e kamera: maande Kaaba hino ɓanngoo e baŋŋe qibla, woɗɗeendi mon e Kaaba takko mayre. Busol ngol hino yiiloo tuma udditii, hino dilla e newal.',
                detayAciklama: 'So maande Kaaba hino yaasi yaynirde, tongoode e keerol hino holla baŋŋe ngal yeccitoton; so maande ndee jooɗii e kaaraaje hakkundeeje, kaaraaje ɗen hino wayloo haako, talifon ngon hino dilla laawol go’o. Enternet haanaani, hay huunde winndetaake. E jiytol Busol tawa alaa kamera, ñiiɓnude talifon dow hino holla busol klasik; so on ɓantii ngon, busol ngol hino ɗowa e jaajeende, kubu Kaaba ngu hino ñiiɓa e baŋŋe qibla. So baŋŋe ngal hino dilla, dillinee talifon mon wa limoore 8 laabi seeɗa. So janngoowo yaynirde huɓɓinaa, baŋŋe ngal hino janngee wa “Qibla hino 30° e ñaamo mon”.',
                detaylar: [
                    'Maande Kaaba e woɗɗeendi mon e Kaaba e kamera',
                    'Tongooɗe “Yeccitee ñaamo/nano” so hino yaasi yaynirde',
                    'Kaaraaje haako e dillinde wootere so hawrii',
                    'Busol 3D ɗowoowo e jaajeende so on ɓantii talifon',
                    'Busol gollooɗo tun, ñiiɓɗo',
                    'Hino golla tawa alaa enternet; hay huunde winndetaake',
                ],
            },
            yo: {
                baslik: 'Ẹ rí Ƙiblah pẹ̀lú kámẹ́rà yín',
                aciklama: 'Lórí táàbù Ƙiblah, ẹ di fóònù yín mú ní ìdúró, kí ẹ sì wò yíká pẹ̀lú kámẹ́rà: àmì Ka‘bah yóò hàn ní ìhà Ƙiblah, pẹ̀lú jíjìn yín sí Ka‘bah lẹ́gbẹ̀ẹ́ rẹ̀. Kọ́ńpáàsì ń yí ní kété tí ó bá ṣí, ó sì ń rìn dáadáa.',
                detayAciklama: 'Tí àmì Ka‘bah kò bá sí lójú ìbòjú, ọfà kan ní etí ojú ìbòjú yóò fi ọ̀nà tí ẹ ó yí sí hàn; nígbà tí àmì náà bá dúró sí àárín òrùka, òrùka náà yóò di ewé, fóònù yóò sì gbọ̀n lẹ́ẹ̀kan. A kò nílò íntánẹ́ẹ̀tì, a kò sì kọ nǹkankan sílẹ̀. Nínú ìfihàn Kọ́ńpáàsì láìsí kámẹ́rà, dídi fóònù mú ní títẹ́ ń fi kọ́ńpáàsì àtijọ́ hàn; bí ẹ ṣe ń gbé e sókè, kọ́ńpáàsì yóò tẹ̀ sí ojú ọ̀run, àpótí Ka‘bah yóò sì dìde ní ìhà Ƙiblah. Tí ìhà náà bá ń yẹ̀, ẹ fi fóònù yín ṣe àmì 8 ní ìgbà díẹ̀. Nígbà tí olùka ojú ìbòjú bá wà ní títàn, a ó ka ìhà náà gẹ́gẹ́ bí "Ƙiblah wà ní 30° sí ọ̀tún yín".',
                detaylar: [
                    'Àmì Ka‘bah àti jíjìn yín sí Ka‘bah lórí kámẹ́rà',
                    'Ọfà "Yí sí ọ̀tún/òsì" nígbà tí kò bá sí lójú ìbòjú',
                    'Òrùka ewé àti ìgbọ̀nrìrì kan ṣoṣo nígbà tí ó bá dọ́gba',
                    'Kọ́ńpáàsì 3D tí ń tẹ̀ sí ojú ọ̀run bí ẹ ṣe ń gbé fóònù sókè',
                    'Kọ́ńpáàsì tí ń ṣiṣẹ́ lẹ́sẹ̀kẹsẹ̀, tí ó sì dúró ṣinṣin',
                    'Ó ń ṣiṣẹ́ láìsí íntánẹ́ẹ̀tì; a kò kọ nǹkankan sílẹ̀',
                ],
            },
        },
    },
    // Sade tasarım (Dalga 2 + 3 + 4). Bugünkü kullanıcıya anlamlı olanı söyler.
    {
        id: 'sade-kurulum-ve-ana-ekran',
        platformlar: ['android', 'ios'],
        surum: '0.50.0',
        tarih: '2026-10-19',
        baslik: 'Daha sade uygulama',
        aciklama:
            'Daha az bildirim, gece sessiz saatler ve tüm hatırlatmalar tek sayfada. Yeni sekmeler: Bugün, Kıble, Kaza, İlerleme, Ayarlar.',
        detayAciklama:
            'Ayarlar artık ne yapmak istediğinize göre sıralı: Hatırlatmalar, Namaz vakitleri, Görünüm, Saat ve widget, Yedek, Yardım. Hatırlatmalar sayfasında en üstte "Ne kadar hatırlatalım?" sorusu var; altında her hatırlatma tek satır ve bir anahtar: vakit girince, vakit çıkmadan, gece sessiz saatler, cuma, camiye gitme vakti, yatmadan önce, toplantı çakışırsa, nafile, Ramazan, günü tamamlamadıysam ve özel gün. Normal düzey artık vakit başına üç hatırlatma gönderir ve telefonu titretir; sesli okuma yalnız siz açarsanız konuşur. Gece sessiz saatlerde (varsayılan 23:00 ile imsak arası) vakit çıkmadan hatırlatması gelmez; yatsı hatırlatmaları sessizlik başlamadan önce gelir, kurduğunuz sabah alarmı yine çalar. "Vakit çıkmadan" sayfasında her vakit için ayrı düzey seçebilirsiniz, örneğin akşam için Hafif. Mevcut ayarlarınız değişmedi: Hatırlatmalar sayfasındaki "Daha az bildirim" önerisiyle tek dokunuşta geçebilir, isterseniz geri alabilirsiniz. Ayrıntılı ayar "Kendim ayarlayayım" altında durur. Sesli okuma ve alarm izni bir kez sorulur, tüm hatırlatmalarda geçerlidir. Ana ekranda uyarılar üst üste yığılmaz; vakit kartı bildiğiniz görünümünde; "Kılındı olarak işaretle" düğmesi dokununca yumuşakça "Kılındı"ya dönüşür, yanlışlıkla işaretlediyseniz aynı düğmeye bir kez daha dokunarak geri alabilirsiniz. Alttaki sekmeler de sadeleşti: Kıble artık kendi sekmesinde; seri, kılma oranı ve rozetler tek "İlerleme" sekmesinde. Kaza defterinde kalan sayı ve vakit satırları öne çıktı; hedef, tempo, yeniden hesaplama ve geçmiş "Diğer" menüsünde. Vakitleri takvime ekledikten sonra ayar değiştirirseniz "Şimdi aktarın" bandı çıkar (bir sonraki aktarımınızdan itibaren).',
        detaylar: [
            'Normal düzey: vakit başına üç hatırlatma, titreşimli; sesli okuma yalnız siz açarsanız',
            'Gece sessiz saatler: 23:00 ile imsak arası hatırlatma gelmez, yatsı hatırlatması yatmadan önce gelir',
            'Her vakit için ayrı düzey: örneğin akşam Hafif, diğerleri Normal',
            'Kurulumda kısa sorular: Kıldım\'ı işaretleyecek misiniz, sabah alarmı, cuma',
            'Tüm hatırlatmalar tek sayfada, her biri tek satır',
            'Sesli okuma ve alarm izni bir kez, her hatırlatmada geçerli',
            'Mezhep "Namaz vakitleri"nde, özel gün "Hatırlatmalar"da, kurulum "Yardım"da',
            "Android'de camide ve namaz vakitlerinde sessize alma tek sayfada: Namazda sessiz",
            'Ana ekranda tek uyarı alanı; vakit kartı eski görünümünde, işaretleme ve geri alma aynı düğmede',
            'Durum adları her yerde aynı: Kılındı, Kılınmadı, Vakti geldi, Henüz girmedi',
            'Gün batarken bugünün ikindisini henüz kılmadıysanız bunu hatırlatır',
            'Kıble kendi sekmesinde; seri, kılma oranı ve rozetler "İlerleme"de',
            'Kaza Defteri sade: kalan, vakit satırları ve "Kıldım"; gerisi "Diğer"de',
            'Bir sonraki takvime aktarımdan sonra, bekleyen değişiklik varsa ekranda söylenir',
            'Ayarlarınız ve kayıtlarınız aynen korundu',
        ],
        ikon: 'leaf',
        hedefSayfa: 'Hatirlatmalar',
        ctaEtiketi: 'Hatırlatmalara bakın',
        kartGoster: true,
    },
    // Wear OS saati (#281, #293, saat iş bölümü). Yalnız Android: Wear OS saati yalnız
    // Android telefonla eşleşir; Apple Watch ayrı duyurudur (yetenekli).
    {
        id: 'wear-kadran-yuzeyleri',
        oncekiIdler: ['wear-tesbihat', 'saat-is-bolumu'],
        platformlar: ['android'],
        surum: '0.47.0',
        tarih: '2026-10-18',
        baslik: 'Wear OS Saatinizde Namaz Akışı',
        aciklama:
            'Galaxy Watch gibi Wear OS saatinizde vakti ve kalan süreyi kadranda görür, bilekten "Kıldım" der, tesbihat sayarsınız. Uyandırmanın ve sesli okumanın saatte mi telefonda mı olacağını siz seçersiniz.',
        detayAciklama:
            `Kadranı özelleştirirken bir yuvaya Namaz Akışı'nı seçebilirsiniz: vaktin çıkmasına kalan süre, bugün kılınan vakit sayısı, günün beş vaktinin dağılımı ya da kerahat vakti. "Kalan süre" yuvası yalnız süreyi gösterir ("Öğle 1:23"); çıkış saati ve sıradaki namaz için ayrı "Vakit çıkış saati" ve "Sıradaki namaz" yuvaları var; kadranınızda bu yuva boş kaldıysa "Kalan süre"yi yeniden seçin. Güneş bir namaz vakti olmadığı için listede ve sıradaki vakitte artık görünmez; sabah vaktinde sıradaki namaz öğledir. "Bugün" kutucuğunda beş vakti tek bakışta görür, kıldığınız vakte iki kez dokunarak işaretlersiniz; kılmadığınız bir vaktin son dakikalarında kadranda bir sayaç belirir. Tesbihat sayacında ekrana dokunarak ya da tacı çevirerek sayarsınız; her 33'te saat belirgin şekilde titrer, ekran kapansa da kaldığınız yerden sürdürürsünüz. Ayarlar > Saat'ten uyandırmanın ve sesli okumanın nerede duyulacağını seçersiniz: uyandırmayı saate verirseniz yanınızda uyuyan uyanmaz, saatte kapatmazsanız telefonunuz 3 dakika sonra yedek olarak çalar. Saatteki düğmeyle Namaz modunu açabilir, Camideyim sorusunu bilekten cevaplayabilirsiniz.`,
        detaylar: [
            'Kadranda çubuksuz kalan süre, günlük ilerleme, gün dağılımı ve kerahat yuvaları',
            '"Bugün" kutucuğunda iki dokunuşla işaretleme',
            'Tesbihat: 33 · 33 · 33 + 1, dokunarak ya da tacı çevirerek',
            'Sessiz uyandırma bileğinizde; kapatmazsanız telefon yedek olarak çalar',
            'Saat şarjdayken hatırlatmaları telefon üstlenir',
            'Saatten Namaz modu, "Camide misiniz?" yanıtı ve "Telefonda açın"',
            'Kıble pusulasında yaklaştıkça sıklaşan titreşim',
        ],
        ikon: 'clock',
        hedefSayfa: 'SaatAyarlari',
        ctaEtiketi: 'Saat ayarlarını açın',
        kartGoster: true,
    },
    // Ortak hatırlatma modülü (plan 2026-10-17 + 2026-10-18): her hatırlatma yüzeyi aynı
    // ekranı ve aynı seçenekleri kullanır. Ses ve titreşim seçimi yalnız Android'de olduğu
    // için metin onlardan söz etmez (Android'e özgü duyuru: 'muhafiz-bildirim-sesi-secimi').
    {
        id: 'ek-hatirlatmalar-ortak-takvim',
        oncekiIdler: ['birlesik-hatirlatma-modulu'],
        platformlar: ['android', 'ios'],
        surum: '0.40.0',
        tarih: '2026-10-18',
        baslik: 'Tüm Hatırlatmalar Aynı Ekranda',
        aciklama:
            'Namaz muhafızı, nafile, cuma, camiye gitme, yatış ve takvim hatırlatmaları aynı ekranı ve aynı seçenekleri kullanır: birden çok hatırlatma, tekrar ve sesli okuma.',
        detayAciklama:
            'Bir hatırlatmanın ayarı üç bölümden oluşur: ne zaman gelsin, nasıl uyarsın ve isteğe bağlı gelişmiş ayarlar (tekrar, ton). "Bildirim" ve "Sesli okuma" birbirinden bağımsız açılıp kapanır. Sesli okunan cümleyi her hatırlatmada kendiniz yazabilirsiniz: vakit adı ve dakika gibi parçaları dokunarak eklersiniz, "Dinle" ile nasıl okunacağını duyarsınız. Namaz muhafızı dışındaki hatırlatmalarda cümleyi boş bırakırsanız hatırlatmanın kendi cümlesi okunur; muhafızda boş bırakılan adım sesli okumaz. Cuma, camiye gitme, yatış ve takvim uyarısında en fazla üç hatırlatma kurabilirsiniz; "Akışı önizle" hangi saatlerde hatırlatılacağınızı gösterir.',
        ikon: 'sliders-h',
        hedefSayfa: 'Hatirlatmalar',
        ctaEtiketi: 'İnceleyin',
        kartGoster: true,
        detaylar: [
            'Her hatırlatmada aynı düzen: ne zaman, nasıl, gelişmiş',
            'Bildirim ve sesli okuma iki ayrı anahtar',
            'Sesli okuma cümlesini her hatırlatmada kendiniz yazın',
            'Cuma, camiye gitme, yatış ve takvim uyarısında en fazla üç hatırlatma',
            'Akış önizlemesi saatleri gösterir',
            'Mevcut ayarlarınız aynen korundu',
        ],
    },
    // Cuma namazı hatırlatması (#173) + tekrar + ortak model (PR-A).
    {
        id: 'cuma-namazi-hatirlatmasi',
        oncekiIdler: ['cuma-periyodik-hatirlatma'],
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Cuma Namazı Hatırlatması',
        aciklama:
            'Her cuma, öğle vaktinden istediğiniz kadar önce hatırlatalım — camiye rahatça yetişin.',
        detayAciklama:
            `Cuma hatırlatması vakit çıkarken değil, öğle vakti girmeden önce gelir: camiye gitmek için yola çıkacak zamana ihtiyacınız var. En fazla üç hatırlatma kurabilir, her birinin öğleden ne kadar önce geleceğini (15 dakika ile 3 saat arası) ve camiye çıkana kadar tekrarlanıp tekrarlanmayacağını seçersiniz. Hatırlatma açıkken ana ekranda cuma günü öğle namazı "Cuma" olarak görünür. Cuma öğlenin yerine geçtiği için ayrı bir kayıt tutulmaz; kıldığınızda öğle namazını işaretlersiniz. Özellik varsayılan olarak kapalıdır, Ayarlar › Hatırlatmalar'dan açabilirsiniz.`,
        ikon: 'mosque',
        hedefSayfa: 'CumaHatirlatmaAyarlari',
        ctaEtiketi: 'Hatırlatmayı açın',
        kartGoster: true,
        detaylar: [
            'Öğle vaktinden 15 dakika ile 3 saat önce, en fazla üç hatırlatma',
            'İsterseniz camiye çıkana kadar 5–60 dakikada bir tekrar',
            'Açıkken ana ekranda cuma günü öğle namazı "Cuma" olarak görünür',
            'Namaz kaydınız değişmez; işaretlemeyi öğle namazından yaparsınız',
            'Varsayılan olarak kapalıdır',
        ],
    },
    // "Camide kılacağım" — yürüme süresine göre erken hatırlatma (#292) + ortak model (PR-B).
    {
        id: 'camide-kilacagim',
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Camiye Zamanında Yetişin',
        aciklama:
            'Camide kılmak istediğiniz vakitleri seçin; ezandan, camiye yürüme süreniz kadar önce hatırlatalım.',
        detayAciklama:
            `Ayarlar › Hatırlatmalar › "Camiye gitme vakti" bölümünden vakitleri tek tek seçebilir, yürüme süresini ve abdest için hazırlık payını belirleyebilirsiniz. En fazla üç hatırlatma kurabilirsiniz; yürüme ya da hazırlık sürenizi değiştirdiğinizde hepsi aynı farkla kayar. Cuma hatırlatmanız açıksa cuma günü öğle için ayrıca hatırlatılmazsınız.`,
        ikon: 'walking',
        hedefSayfa: 'CamiyeGitAyarlari',
        ctaEtiketi: 'Vakitlerinizi seçin',
        kartGoster: false,
        detaylar: [
            'Beş vakit için ayrı ayrı açılır',
            'İlk hatırlatma ezandan yürüme süresi + hazırlık payı kadar önce gelir',
            'Süreleri değiştirince bütün hatırlatmalar birlikte kayar',
            'Özel gün modunda hatırlatma gönderilmez',
        ],
    },
    // Yatış saatine göre yatsı hatırlatması + gün sonu muhasebesi (#290) + ortak model (PR-B).
    {
        id: 'yatis-hatirlatmasi',
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Yatmadan Önce Hatırlatma',
        aciklama:
            'Her zamanki yatış saatinizi girin; yatsıyı işaretlemediyseniz uyumadan önce hatırlatalım, gün sonunda eksik vakitlerinizi tek bildirimde görün.',
        detayAciklama:
            'Yatsı vakti saatlerce sürer ve muhafızın "vakit çıkıyor" uyarısı sabaha kalır; asıl kayıp çoğu zaman uykuya dalmaktır. Yatış saatinizden belirlediğiniz süre önce hatırlatma gelir: yatsıyı işaretlemediyseniz yatsı hatırlatması, işaretlediyseniz günün muhasebesi ("Bugün 4/5 · öğle işaretlenmemiş"). En fazla üç hatırlatma kurabilirsiniz; tekrarlar aynı içeriği taşır. Tek eksik varsa bildirimden "Kıldım" diyebilir ya da kaza defterinize ekleyebilirsiniz. Özel gün aralığında gönderilmez.',
        ikon: 'bed',
        hedefSayfa: 'YatisHatirlatmaAyarlari',
        ctaEtiketi: 'Yatış saatinizi girin',
        kartGoster: true,
        detaylar: [
            'Gece yarısından sonra yatıyorsanız hatırlatma yine o günün namazlarını sayar',
            'Yatış saatiniz yatsı girmeden önceyse yatsı hatırlatması yatsı girdikten sonraya kayar',
            'Birden fazla eksik varsa bildirim uygulamayı açıp incelemenizi önerir',
        ],
    },
    // Takvim çakışması uyarısı (#291) + ortak model (PR-C) — varsayılan kapalı, açık rıza ile açılır.
    {
        id: 'takvim-cakismasi-uyarisi',
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Toplantı Vakte Denk Gelirse Haber Verelim',
        aciklama:
            'Takviminizdeki bir etkinlik bir namaz vaktinin sonunu kaplıyorsa, etkinlik başlamadan önce "toplantıdan önce kılın" diye uyaralım.',
        detayAciklama:
            'Ayarlar › Hatırlatmalar › "Toplantı çakışırsa"yı açtığınızda, bir etkinlik bittiğinde vaktin çıkmasına 10 dakikadan az kalıyorsa etkinlikten önce uyarılırsınız; vakti baştan sona kaplayan etkinliklerde ara verip kılmayı planlamanız için haber verilir. En fazla üç hatırlatma kurabilir, etkinlik başlayana kadar tekrarlatabilirsiniz; namazı kıldığınızda kalanlar iptal edilir. Özellik varsayılan olarak kapalıdır ve açarken nelerin okunduğunu açıkça gösteririz: takviminiz yalnızca bu cihazda okunur, hiçbir yere gönderilmez ve saklanmaz.',
        ikon: 'calendar-times',
        hedefSayfa: 'TakvimCakismaAyarlari',
        ctaEtiketi: 'İnceleyin',
        kartGoster: false,
        detaylar: [
            'Etkinlik adı varsayılan olarak bildirimde görünmez; isterseniz açabilirsiniz',
            'Etkinlik adı sesli okumada ve alarm ekranında hiçbir zaman yer almaz',
            'Tüm gün etkinlikleri ve "meşgul değil" işaretli etkinlikler sayılmaz',
            'İkindide güneşin sararmasından (kerahat) önceki an esas alınır',
        ],
    },
    // Nafile namaz vakitleri (#77) + çok adımlı hatırlatma (#273) + gerçek alarm ve gösterge (Faz 2).
    {
        id: 'nafile-namaz-vakitleri',
        oncekiIdler: ['nafile-kanal-ve-adimlar', 'ortak-hatirlatma-yetenekleri'],
        platformlar: ['android', 'ios'],
        surum: '0.34.0',
        tarih: '2026-10-17',
        baslik: 'Nafile Namaz Vakitleri',
        aciklama:
            'Kuşluk, evvâbîn ve teheccüd vakitlerini ana ekranda görebilir, namaz hatırlatmasındaki gibi birden çok hatırlatma kurabilirsiniz.',
        detayAciklama:
            `Ana ekrandaki günlük akışta kuşluk sabahın, evvâbîn akşamın, teheccüd yatsının ardında yer alır; vakti girince satır yeşile döner. Satıra dokununca vaktin ne zaman başlayıp bittiğini ve en faziletli zamanını okursunuz. Bir nafilenin ana ekranda görünüp görünmeyeceğini kendi kartındaki "Ana ekranda göster" satırından seçersiniz; hatırlatması kapalıyken de görünür. Her nafileye en fazla üç hatırlatma kurabilir, vakit girince mi yoksa vakit çıkmadan mı geleceğini seçersiniz; zaman şeridi bugünkü planı gösterir. Hatırlatma bildirim ya da sesli okuma olarak gelebilir. Teheccüd için gecenin son üçte birini ya da yatsıdan itibaren bir zamanı seçebilirsiniz. Bildirimdeki "Kıldım" o günün kalan hatırlatmalarını durdurur; puana ve seriye karışmaz. Vakitler Diyanet'in açıklamalarına göre hesaplanır.`,
        ikon: 'star-and-crescent',
        hedefSayfa: 'NafileAyarlari',
        ctaEtiketi: 'Nafile ayarlarını açın',
        kartGoster: true,
        detaylar: [
            'Kuşluk: güneş doğduktan yaklaşık 45 dk sonra başlar, öğleye 10 dk kalana kadar sürer',
            'Evvâbîn: akşam namazından sonra, yatsıya kadar',
            'Teheccüd: gecenin son üçte biri ya da yatsıdan itibaren seçtiğiniz zaman',
            'Nafile başına en fazla üç hatırlatma; bildirim ya da sesli okuma',
            '"Ana ekranda göster" her nafilenin kendi kartında',
            'Hepsi varsayılan olarak kapalıdır; istediğinizi açarsınız',
        ],
    },
    // Gerçek alarm (#74): Android'de telefonun alarmı, iPhone'da sistem alarmı (yalnız alarmı
    // destekleyen iOS'ta görünür → `gercekAlarm` yeteneği). Alarm kapsamı (ilk / her uyarı) Faz 2.
    {
        id: 'gercek-alarm',
        oncekiIdler: ['gercek-alarm-iphone'],
        platformlar: ['android', 'ios'],
        surum: '0.34.0',
        tarih: '2026-10-17',
        baslik: 'Hatırlatmalarda Gerçek Alarm',
        aciklama:
            'İstediğiniz hatırlatma adımında "Gerçek alarm"ı açın: o adımda telefonunuzun alarmı çalar, sessiz moddayken de duyulur.',
        detayAciklama:
            'Bir hatırlatma adımına dokunup "Gerçek alarm" anahtarını açabilirsiniz; örneğin sabah için vakit girer girmez, öğle için vaktin çıkmasına 20 dakika kala. Alarmın yalnız adımın ilk uyarısında mı yoksa her tekrarında mı çalacağını seçersiniz; diğer tekrarlar normal bildirimle gelir. Alarm ekranında "Kıldım" düğmesini görürsünüz. "Akışı önizle" alarmın çalacağı saatleri ayrıca gösterir.',
        ikon: 'clock',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Alarmı kurun',
        kartGoster: true,
        yetenek: 'gercekAlarm',
        detaylar: [
            'Namaz muhafızında ve nafile hatırlatmalarında kullanılabilir',
            'Alarm yalnız ilk uyarıda ya da her uyarıda çalabilir',
            'Alarmı durdurmak namazı kılındı saymaz; "Kıldım" düğmesi ya da uygulama işaretler',
            'Alarmın çalamadığı durumlarda aynı hatırlatma bildirim olarak gelir',
        ],
    },
    // Kaza Defteri 2.0 — hareket defteri, otomatik ekleme, yeniden hesaplama önizlemesi.
    {
        id: 'kaza-defteri-2',
        platformlar: ['android', 'ios'],
        surum: '0.33.0',
        tarih: '2026-10-16',
        baslik: 'Kaza Defteri Her Hareketi Hatırlıyor',
        aciklama:
            'Eklediğiniz, kıldığınız ve bildirimden gelen her kaza ayrı bir satır olarak saklanır; yeniden hesapladığınızda emeğiniz kaybolmaz. İsterseniz kılınmayan farzlar namaz günü bitince kendiliğinden eklenir.',
        detayAciklama:
            'Kaza Defteri\'nin "Hareket geçmişi" ekranında her kaydın ne zaman, hangi kaynaktan ve hangi cihazdan geldiğini görebilirsiniz. Sihirbazla yeniden hesapladığınızda yalnız hesaplanan borç değişir; elle eklediğiniz, bildirimden eklenen ve kıldığınız kazalar yeni hesaba kendiliğinden uygulanır ve uygulamadan önce önizlenir. Otomatik ekleme varsayılan olarak kapalıdır: açarsanız işaretlemediğiniz farzlar ertesi imsakta deftere eklenir, sonradan "kıldım" derseniz geri alınır. Hiç işaret olmayan günler önce size sorulur.',
        ikon: 'book',
        kartGoster: true,
        detaylar: [
            'Hiçbir kayıt silinmez: temizlik kayıtları gizler ve her temizlik geri alınabilir',
            'Vitir namazının otomatik eklenmesi ortak mezhep ayarınıza bağlıdır (Hanefî: vacip)',
            'Hesaplanan borçtan fazla kıldığınız kazalar ayrıca gösterilir',
            'İki cihazınızdaki defterler birbirini ezmeden birleşir',
        ],
    },
    // Apple Watch uygulaması (#285) — yalnız saat hedefini taşıyan iOS build'inde
    // görünür (saat bayrağı kapalıyken duyuru da yok).
    {
        id: 'apple-watch-uygulamasi',
        platformlar: ['ios'],
        surum: '0.31.0',
        tarih: '2026-10-14',
        baslik: 'Namaz Akışı Apple Watch\'ta',
        aciklama:
            'İçinde bulunulan vakti ve çıkışına kalan süreyi bileğinizden görebilir, namazınızı saatten "Kıldım" diyerek işaretleyebilirsiniz.',
        detayAciklama:
            'Saat uygulaması vakitleri iPhone\'unuzdan alır; günün beş vakti, kalan süre ve kılınmışlık bilgisi bileğinizde görünür. "Kıldım" dediğiniz vakit iPhone\'daki kaydınıza işlenir. Saat kadranına komplikasyon ekleyerek vakti ve geri sayımı uygulamayı açmadan görebilirsiniz. Saatte ayrıca bir tesbihat sayacı vardır; Digital Crown\'u çevirerek ya da ekrana dokunarak sayabilirsiniz.',
        ikon: 'clock',
        kartGoster: true,
        yetenek: 'appleWatch',
        detaylar: [
            'Saat uygulamasını iPhone\'unuzdaki Watch uygulamasından yükleyebilirsiniz',
            'Hatırlatmalar iPhone bildirimleriyle bileğinize gelir; saat ikinci bir bildirim kurmaz',
            'Telefonunuz yanınızda değilken dediğiniz "Kıldım", bağlantı kurulunca işlenir',
            'Tesbihat sayacı yalnız saatte tutulur ve 90 dakika sonra sıfırlanır',
        ],
    },
    // iOS widget'ları + canlı etkinlik (#295, #282 iOS ikizi) — yalnız uzantıyı
    // taşıyan iOS build'inde görünür (widget bayrağı kapalıyken duyuru da yok).
    {
        id: 'ios-widget-canli-etkinlik',
        platformlar: ['ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'iPhone\'da Kilit Ekranı ve Dinamik Ada',
        aciklama:
            'Vakti ve çıkışına kalan süreyi kilit ekranına, StandBy\'a ve ana ekrana widget olarak ekleyebilirsiniz; vakit çıkarken geri sayım Dinamik Ada\'da görünür.',
        detayAciklama:
            'Kilit ekranını düzenleyip "Namaz Akışı"nı seçerek içinde bulunulan vakti, kalan süreyi ve çıkış saatini görebilirsiniz. Ana ekrandaki widget günün beş vaktini gösterir ve "Kıldım" düğmesiyle vakti uygulamayı açmadan işaretlemenizi sağlar. Canlı etkinlik için hangi geri sayımın ne zaman başlayacağını Ayarlar\'dan seçebilirsiniz.',
        ikon: 'mobile-alt',
        hedefSayfa: 'NowBarAyarlari',
        ctaEtiketi: 'İnceleyin',
        kartGoster: true,
        yetenek: 'iosWidget',
        detaylar: [
            'Kilit ekranı ve StandBy yalnız gösterir; işaretleme ana ekranda ve canlı etkinlikte yapılır',
            'Canlı etkinlik uygulama açıkken başlar, sonra uygulamayı kapatsanız da sürer',
            'Geri sayımı telefonunuz çizer; widget pil tüketmek için sürekli yenilenmez',
        ],
    },
    // Seferîlik bilgi kartı (#296) — kart kapalı; özellik ana ekranda kendiliğinden çıkar.
    {
        id: 'seferilik-bilgi-karti',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Yolculukta Bilgi Kartı',
        aciklama:
            'İkamet yerinizden yaklaşık 90 km uzaklaştığınızda ana ekranda, Diyanet\'in yolculuk (seferîlik) fetvalarını mezhebinize göre özetleyen kısa bir bilgi kartı görürsünüz.',
        detayAciklama:
            'Kart bir hüküm vermez; ölçüyü (yaklaşık 90 km), kalış süresini, dört rekâtlı farzların kısaltılmasını (kasr) ve namazları birleştirmeyi (cem) Diyanet Din İşleri Yüksek Kurulu fetvalarına dayanarak özetler ve kaynağa yönlendirir. Yolculuk başına bir kez çıkar, bildirim göndermez. Ayarlar\'dan mezhebinizi (Hanefî veya Şâfiî) ve ikamet yerinizi seçebilir, kartı kapatabilirsiniz.',
        ikon: 'route',
        hedefSayfa: 'SeferilikAyarlari',
        ctaEtiketi: 'İnceleyin',
        kartGoster: false,
        detaylar: [
            'Mezhep seçimi yalnız kartın içeriğini değiştirir; namaz vakitleri aynı kalır',
            'Mesafe kuş uçuşu ölçülür; yolcu sayılıp sayılmadığınız yolculuğunuzun amacına, süresine ve niyetinize bağlıdır',
            '"Burası evim" ile ikamet yerinizi tek dokunuşla güncelleyebilirsiniz',
        ],
    },
    // Bileklik dostu başlıklar (#287) — kart kapalı; rehber yalnız Android'de.
    {
        id: 'bileklik-dostu-basliklar',
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Bilekliğinizde Tek Bakışta Okunur',
        aciklama:
            'Hatırlatma başlıkları vakit adı ve kalan süreyle başlar: "Yatsı · 25 dk kaldı". Galaxy Fit, Mi Band gibi küçük ekranlarda bile önemli kısım görünür.',
        detayAciklama:
            'Bileklikler telefon bildiriminin başlığından yalnız ilk birkaç kelimeyi gösterir. Namaz muhafızı, cuma, camiye gidiş ve yatmadan önce hatırlatmalarının başlıkları bu yüzden vakit adı ve süreyle başlar. "Öğle vakti girdi" gibi vakit bildirimleri aynı kalır; otomasyonlarınız çalışmaya devam eder. Saat ve widget sayfasındaki rehber, bilekliğinize yalnız namaz hatırlatmalarının gitmesi için neler yapabileceğinizi anlatır.',
        ikon: 'clock',
        hedefSayfa: 'SaatVeWidgetAyarlari',
        ctaEtiketi: 'Rehberi inceleyin',
        kartGoster: false,
        detaylar: [
            'Acil hatırlatmalarda vakit adı büyük harfle yazılır: "İKİNDİ · 3 dk · VAKİT ÇIKIYOR"',
            'Bileklik uygulamaları bildirimleri uygulama bazında seçer; rehber dürüstçe neyin mümkün olduğunu anlatır',
            '"Kıldım" düğmesinin bileklikte görünmesi modele göre değişir',
        ],
    },
    // Sade görünüm (#295) — yaşlı kullanıcılar için tek ekran.
    {
        id: 'sade-gorunum',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Sade Görünüm',
        aciklama:
            'Ana ekranda yalnız şu anki vakit, kalan süre ve büyük bir "Kıldım" düğmesi: büyüklerimiz için tek bakışta anlaşılan, dokununca sesli okunan bir ekran.',
        detayAciklama:
            'Ayarlar > Görünüm\'den açtığınızda ana ekran sadeleşir: vaktin adı ve kalan süre büyük yazıyla görünür, altında sıradaki vakit yer alır. Vakte dokunduğunuzda "Şimdi ikindi vakti. Çıkmasına 42 dakika var." gibi sesli okunur. Diğer bölümlere ekranın altındaki "Tüm uygulamayı açın" bağlantısıyla geçebilirsiniz; uygulamayı kapatıp açtığınızda sade görünüme dönülür.',
        ikon: 'eye',
        hedefSayfa: 'GorünumAyarlari',
        ctaEtiketi: 'Görünümü açın',
        kartGoster: true,
        detaylar: [
            'Telefonunuzun yazı boyutu ayarına uyar',
            'Kalan süre dakikada bir güncellenir',
            'Kerahat vaktinde işaretlemeden önce yine size sorulur',
        ],
    },
    // Samsung Rutinler + Tasker/MacroDroid/Automate eklentisi (#278) + "Kıldım" güven
    // listesi ve anında susturma (#299) — yalnız Android; kart kapalı.
    {
        id: 'otomasyonlarla-kullanin',
        oncekiIdler: ['kildim-guven-listesi'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Otomasyonlarla Kullanın',
        aciklama:
            'Vakit girince telefonunuz sessize alınsın, camiye girince bir şey kapansın: Samsung Rutinler, Tasker ve MacroDroid ile Namaz Akışı\'nı birlikte kullanabilirsiniz.',
        detayAciklama:
            'Samsung Rutinler\'in "Bildirim alındığında" koşuluna "Öğle vakti girdi" ya da "Camidesiniz" gibi sabit bir anahtar kelime yazarak rutininizi başlatabilir, "Şu anki vakti kıldım" kısayolunu rutinin eylemi yapabilirsiniz. Tasker, MacroDroid ve Automate\'te Namaz Akışı eklentisi vakit girdi, vakit çıkıyor ve camidesiniz olaylarını verir; "Kıldım" eylemiyle namazınızı işaretler. Bir uygulama namazınızı ilk kez işaretlemek istediğinde size bir kez sorulur: her zaman izin verebilir, yalnız o seferlik onaylayabilir ya da engelleyebilirsiniz. Bildirimdeki "Kıldım" uygulamayı açmadan o vaktin kalan uyarılarını ve sesli okumalarını hemen susturur.',
        ikon: 'magic',
        hedefSayfa: 'OtomasyonRehberi',
        ctaEtiketi: 'Rehberi açın',
        kartGoster: false,
        detaylar: [
            'Vakit bildirimleri sabit bir başlıkla gelir: "Öğle vakti girdi"',
            'Tasker değişkenleri: %vakit, %vakitkodu, %tarih, %kalandk, %cami',
            'İzin verdiğiniz otomasyon bir daha onay sormadan çalışır; engellediğinizin istekleri yok sayılır',
            'Kararlarınızı "Kıldım işaretleyebilen uygulamalar" bölümünden değiştirebilirsiniz',
            'Ana ekran kısayolları, widget ve hızlı ayarlar kutusu her zaman çalışır',
        ],
    },
    // "Her farzla bir kaza" önerisi (#294).
    {
        id: 'her-farzla-bir-kaza',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Her Farzla Bir Kaza',
        aciklama:
            'Kaza borcunuz varsa, ana ekranda bir farzı kıldım olarak işaretlediğinizde bir kaza kılmanızı öneririz; tek dokunuşla defterinizden düşebilirsiniz.',
        detayAciklama:
            'Yeni bir hatırlatma yerine zaten kıldığınız farza bağlanan küçük bir öneridir: öğleyi işaretlediğinizde bir öğle kazası, o vaktin borcu yoksa en çok borcunuz olan kaza önerilir. "Şimdi değil" derseniz o gün bir daha sorulmaz. Kaza Defteri\'ndeki "Her farzla bir kaza" anahtarıyla kapatabilirsiniz.',
        ikon: 'book',
        kartGoster: false,
        detaylar: [
            'Yalnız o anki vaktin farzını işaretlediğinizde sorulur',
            'Kerahat vaktinde sorulmaz',
            'Kaza defteriniz boşsa hiç sorulmaz',
            'Aynı vakit için günde en fazla bir kez sorulur',
        ],
    },
    // Siri, Kısayollar ve Odak filtresi (#279) — yalnız iPhone; kart kapalı.
    {
        id: 'ios-siri-kisayollar-odak',
        platformlar: ['ios'],
        surum: '0.57.0',
        tarih: '2026-10-20',
        baslik: "iPhone'da Siri, Kısayollar ve Odak",
        aciklama:
            "Siri'ye sıradaki namazı sorabilir, kıldığınız vakti sesinizle işaretleyebilir ve \"Namaz\" Odağınızda hatırlatmaları sessize alabilirsiniz.",
        detayAciklama:
            "Kurulum gerekmez: \"Namaz Akışı sıradaki namaz ne zaman\", \"Namaz Akışı şu anki vakti kıldım\" ya da \"Namaz Akışı kıbleyi aç\" demeniz yeterli. Aynı eylemler Kısayollar uygulamasında, Spotlight aramasında ve Eylem düğmesinde de görünür. Kıldım işaretlemesi siz onayladıktan sonra yapılır ve uygulamayı açtığınızda takviminize işlenir. Ayarlar > Odak bölümünden kendi Odağınıza Namaz Akışı filtresini ekleyip \"Hatırlatmaları sessiz ver\"i açarsanız, o Odak açıkken namaz hatırlatmaları ekranı yakmadan ve ses çıkarmadan gelir.",
        ikon: 'microphone',
        kartGoster: false,
        detaylar: [
            'Siri sıradaki namazı ve giriş saatini söyler',
            '"Şu anki vakti kıldım" onayınızla işaretler',
            'Odak filtresi açıkken hatırlatmalar en fazla 3 saat sessiz gelir',
            'Kısayollar için yeni eylemler: sıradaki vaktin adı, sıradaki vakte kalan dakika, şu anki vakit kılındı mı',
            'Bu eylemlerle "Eğer" bloğu kurup kendi otomasyonunuzu yazabilirsiniz',
        ],
    },
    // Android canlı sayaç: durum çubuğu + Samsung Now Bar (#282) ve öğe seçimi (ikinci aşama).
    // Yalnız Android; kart kapalı.
    {
        id: 'sayac-canli-guncelleme',
        oncekiIdler: ['now-bar-secimi'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Geri Sayım Durum Çubuğunda ve Now Bar\'da',
        aciklama:
            'Vaktin son dakikaları, iftar ve sahur sayacı durum çubuğunda kalan süreyle görünür; Samsung cihazlarda Now Bar\'a da taşınır. Neyin ne zaman görüneceğini siz seçersiniz.',
        detayAciklama:
            `Kalan süreyi bildirim panelini açmadan görebilirsiniz; bildirimde vaktin ne kadarının geçtiği bir çubukla gösterilir, vakit sayacındaki "Kıldım" düğmesiyle tek dokunuşta işaretlersiniz. Ayarlar'daki "Now Bar ve canlı sayaçlar" sayfasında her vakti, iftarı, sahuru, cumayı, nafileleri ve seriyi tek tek açabilir, geri sayımın "vakit girince" mi yoksa "son dakikalarda" mı başlayacağını seçebilirsiniz. Aynı anda yalnız bir sayaç öne çıkar; Wear OS saatiniz de aynı seçimi kullanır. Bu gösterimi telefonunuzun bildirim ayarlarındaki "Canlı güncellemeler" seçeneğiyle kapatabilirsiniz.`,
        ikon: 'stopwatch',
        hedefSayfa: 'NowBarAyarlari',
        ctaEtiketi: 'Seçimlerinizi yapın',
        kartGoster: false,
        detaylar: [
            'Durum çubuğunda kalan süre: "12 dk", "1 sa 5 dk"',
            'Vakit sayacında tek dokunuşla "Kıldım"',
            'Beş vakit ayrı ayrı; cuma, nafileler ve seri için de sayaç',
            'Sayaç tam zamanında başlar; uygulamanın açık olması gerekmez',
        ],
    },
    // Bildirim sınırı rehberi (#298).
    {
        id: 'bildirim-siniri-rehberi',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Bildirim Sınırı Rehberi',
        aciklama:
            'Telefonunuzun bekletebildiği bildirim sayısı sınırlıdır; uygulama sınıra yaklaştığınızda sizi önceden uyarır ve yer açmanın en kolay yollarını önerir.',
        detayAciklama:
            'iPhone aynı anda en fazla 64 bildirim bekletir, Android de uygulama başına sınırlı sayıda alarm tutar; fazlası hata vermeden sessizce düşer. Namaz Muhafızı ve Nafile Namazlar ekranlarının üstündeki kart, kurulu bütün hatırlatmalarınızı sayar. Sığmayacak bir hatırlatma eklemeye çalıştığınızda ekleme yapılmaz; nedenini ve yer açma yollarını görürsünüz. Her öneri gerçekten hesaplanır, tek dokunuşla uygulanır ve geri alınabilir.',
        ikon: 'layer-group',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Bildirimlerinizi görün',
        kartGoster: false,
        detaylar: [
            'Kart sınıra yaklaşınca turuncu, aşınca kırmızı olur ve kaç bildirimin gelmeyeceğini söyler',
            'Öneriler anlam kaybı en az olandan başlar: tekrarları seyrekleştirmek, nazik hatırlatmayı tek seferlik yapmak, iPhone’da nafileyi günü gününe kurmak',
            'Sert ve acil tonlu hatırlatmalara hiç dokunulmaz',
            'Android’de kart yalnız sınıra çok yaklaştığınızda görünür',
        ],
    },
    // Namaz Muhafızı: vakte özel adımlar + sesli okuma (0.24), adım aç/kapa (0.24), giriş
    // yönü ve vakit uzunluğuna kadar eşik (0.25), 1–6 hatırlatma + ton (#274, 0.31).
    {
        id: 'muhafiz-vakit-seviye-sesli-anons',
        oncekiIdler: [
            'muhafiz-adim-ac-kapa',
            'muhafiz-giris-yonu',
            'muhafiz-dinamik-esik',
            'muhafiz-hatirlatma-sayisi',
        ],
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Her Vakte Kendi Hatırlatma Akışı',
        aciklama:
            'Namaz Muhafızı\'nda her vakit için 1 ile 6 arasında hatırlatma kurar; ne zaman başlayacağını, tonunu ve sesli okunup okunmayacağını vakit vakit seçersiniz.',
        detayAciklama:
            `Her vakit için "1. hatırlatma, 2. hatırlatma…" diye kendi akışınızı kurarsınız; numaralar zamana göre kendiliğinden sıralanır. Hatırlatmaların vaktin çıkışına doğru mu yoksa vakit girer girmez başlayıp çıkana kadar mı süreceğini seçersiniz; zaman şeridi bugünkü planı gösterir. Bir hatırlatmayı vaktin o günkü uzunluğu kadar erkene alabilirsiniz; çok uzun aralıklarda bildirim yağmuru olmasın diye tekrar sıklığı gerektiğinde seyreltilir ve bu adımın altında söylenir. Her hatırlatmada Nazik, Uyarı, Sert ya da Acil tonu ayrı seçersiniz; Acil ton yalnız vaktin son 15 dakikasında Rahatsız Etmeyin'i deler. İstemediğiniz adımı tek dokunuşla kapatırsınız; kapattığınız adım ayarlarını unutmaz. Hazır yoğunluklar (Hafif, Normal, Yoğun) gereksiz tekrarlar yerine son dakikalarda sesli okumayı kullanır; sesli okuma siz onaylamadan açılmaz. "Akışı önizle" ile o vakitte alacağınız tüm hatırlatmaları önceden görür ve dinlersiniz.`,
        ikon: 'shield-alt',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Hatırlatmalarınızı düzenleyin',
        kartGoster: true,
        detaylar: [
            'Vakit başına en fazla 6 hatırlatma; istemediğinizi silin ya da kapatın',
            'Vaktin çıkışına doğru ya da vakit girer girmez başlayan hatırlatma',
            'Ton (Nazik, Uyarı, Sert, Acil) her hatırlatmada ayrı seçilir',
            'Vaktin bitmesine çok varken sert ton bile "vakit çıkıyor" demez',
            'Bir vaktin ayarını tek dokunuşla diğer vakitlere kopyalayın',
            '"Akışı önizle" ile tüm hatırlatmaları önceden görün ve dinleyin',
        ],
    },
    // Camideyim (#297) + harita ve güven puanı (Faz 2) — yalnız Android; kart iOS'ta da
    // görüneceği için kapalı.
    {
        id: 'camideyim',
        oncekiIdler: ['camideyim-harita'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Camideyim: Camiye Girince Telefonunuz Anlar',
        aciklama:
            'Hangi camiye giderseniz gidin, vakit yakınında birkaç dakika kaldığınızda Namaz modu kendiliğinden açılır; emin olunamayan durumlarda önce size sorulur.',
        detayAciklama:
            `Tek bir konum seçmeniz gerekmez: telefonunuz yakınınızdaki camileri izler ve ezan vaktine yakınlığı, cuma namazını, caminin binası içinde olup olmadığınızı ve hızınızı birlikte değerlendirir. Güven yüksekse Namaz modu kendiliğinden açılır; trafikte caminin önünde beklemek gibi sınırda durumlarda sessiz bir bildirimle "Camide misiniz?" diye sorulur, önünden geçerken ya da vakit dışında uğradığınızda hiçbir şey olmaz. Camideyken hatırlatmalarınız iptal edilmez, sessiz gelir; çıkınca "Kıldınız mı?" diye sorulur. Haritada camileri ve algılama alanlarını görür, bir camiye dokunarak alanı daraltabilir, favorilere ekleyebilir ya da "Cami değil" diye işaretleyebilirsiniz; iş yerinizdeki mescidi kendiniz ekleyebilirsiniz. Konumunuz telefonunuzdan çıkmaz.`,
        ikon: 'mosque',
        hedefSayfa: 'CamideyimAyarlari',
        ctaEtiketi: 'Camideyim ayarını açın',
        kartGoster: false,
        detaylar: [
            'Türkiye\'deki camiler uygulamanın içinde (OpenStreetMap verisi)',
            'Akıllı, otomatik ya da sorarak açılış; yakındaki tüm camiler ya da yalnız seçtikleriniz',
            'Haritada alanı 10–150 m arasında ayarlama, iğne koyarak yer ekleme',
            'Camideyken hatırlatmalar sessiz gelir, sesli okuma konuşmaz',
            '"Son algılamalar" ile neden algılandığını görebilirsiniz',
            'Harita: © OpenStreetMap katkıcıları, OpenFreeMap',
        ],
    },
    {
        id: 'namaz-modu',
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Telefonunuza "Namaz" Modu',
        aciklama:
            'Telefonunuzun Rahatsız Etmeyin/mod ayarlarına "Namaz" eklenir; cuma hutbesinde, vakit girince ya da camideyken kendiliğinden açılır.',
        detayAciklama:
            'Aramaların, bildirimlerin ve ekranın namazda ne yapacağını telefonunuzun kendi ayarlarında siz seçersiniz; Namaz Akışı yalnız ne zaman açılacağını söyler. "Kıldım" dediğinizde mod kapanır. Modu elle kapatırsanız o vakit için yeniden açılmaz.',
        ikon: 'moon',
        hedefSayfa: 'NamazModuAyarlari',
        ctaEtiketi: 'Namaz modunu açın',
        kartGoster: false,
        detaylar: [
            'Cuma hutbesinde kendiliğinden açılır',
            'İsterseniz her vakit girince birkaç dakika',
            '"Kıldım" deyince kapanır',
            'Hatırlatmalarınız iptal edilmez',
        ],
    },
    // Bilinçli olarak NÖTR ve kartsız (#272): özel gün etiketi açıklanmaz,
    // yalnız "Neler Yeni" listesinde görünür.
    {
        id: 'ozel-gun-hatirlatma-sessizligi',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Özel Günlerde Hatırlatmalar Durur',
        aciklama:
            'Özel gün modu açıkken seçtiğiniz tarihler boyunca namaz hatırlatmaları da durur; tarihler bitince kendiliğinden geri gelir.',
        detayAciklama:
            'Özel gün modu serinizi dondurmakla kalmaz: seçtiğiniz tarihler boyunca vakit bildirimleri, namaz muhafızı ve sesli okumaları, vakit sayacı ve nafile hatırlatmaları da gönderilmez. Tarihler bittiğinde hatırlatmalar sizin bir şey yapmanıza gerek kalmadan geri gelir.',
        ikon: 'bell-slash',
        hedefSayfa: 'OzelGunAyarlari',
        ctaEtiketi: 'Özel gün ayarını açın',
        kartGoster: false,
        detaylar: [
            'Serinizin dondurulması aynen sürer',
            'Bu tarihlerde vakit, muhafız, sayaç ve nafile hatırlatmaları gelmez',
            'Tarihler bitince hatırlatmalar kendiliğinden geri gelir',
        ],
    },
    // Kontrol Merkezi "Kıldım" kontrolü (Android hızlı ayar kutusu ikizi). Yalnız kontrolü
    // taşıyan build'de ve kontrolleri destekleyen iPhone'larda görünür.
    {
        id: 'ios-kontrol-merkezi-kildim',
        platformlar: ['ios'],
        surum: '0.57.0',
        tarih: '2026-10-20',
        baslik: "Kontrol Merkezi'nden Kıldım",
        aciklama:
            "Kontrol Merkezi'ne, kilit ekranına ya da Eylem düğmesine \"Vakti kıldım\" kontrolünü ekleyerek içinde bulunduğunuz vakti tek dokunuşla işaretleyebilirsiniz.",
        detayAciklama:
            "Kontrol Merkezi'ni açıp düzenleyin, \"Namaz Akışı\" altından \"Vakti kıldım\"ı seçin. Kontrolde o anki vaktin adı yazar; dokununca vakit kılındı olarak işaretlenir. Kilit ekranından dokunduğunuzda önce telefonunuzun kilidini açmanız istenir. Kılınacak vakit yoksa kontrol bunu söyler ve hiçbir şey işaretlemez.",
        ikon: 'check-circle',
        kartGoster: false,
        yetenek: 'kontrolMerkezi',
        detaylar: [
            'Kontrol Merkezi, kilit ekranı ve Eylem düğmesi',
            'O anki vaktin adı kontrolün üstünde yazar',
            'Kilit ekranında işaretlemeden önce kilit açılır',
        ],
    },
    // iPad desteği (Apple eşitliği): Android tablet düzeninin (#283) iPad ikizi. Postür ve
    // kapak ekranı cümleleri yok; iPad'de uygulama yalnız dikey ve tam ekran açılır.
    {
        id: 'ipad-duzeni',
        platformlar: ['ios'],
        surum: '0.57.0',
        tarih: '2026-10-20',
        baslik: "iPad'de Geniş Düzen",
        aciklama:
            "Namaz Akışı artık iPad'de ekranın tamamını kullanır: solda vakit kartı ve geri sayım, sağda günlük akış.",
        detayAciklama:
            "iPad'de ana ekran iki sütunda açılır; şu anki vakti ve günün tüm vakitlerini aynı anda görürsünüz. Ayar ekranları ortada okunaklı bir genişlikte durur. Kayıtlarınız ve ayarlarınız iPhone'dakiyle aynı şekilde çalışır.",
        ikon: 'tablet-alt',
        detaylar: [
            'Solda vakit kartı ve geri sayım, sağda günlük akış',
            'Ayar ekranları ortada okunaklı genişlikte',
            'Uygulama dikey ve tam ekran açılır',
        ],
        yetenek: 'ipad',
    },
    // Katlanabilir ve tablet düzeni (#283) + masaüstü postürü ve Flex Window widget'ı
    // (ikinci aşama). Yalnız Android: postür ve kapak ekranı cümleleri iPad'de geçersiz olurdu.
    {
        id: 'katlanabilir-tablet-duzeni',
        oncekiIdler: ['katlanabilir-masaustu-posturu'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Katlanabilir ve Tablet Ekranlara Uygun Düzen',
        aciklama:
            'Tabletlerde ve katlanabilir telefonların iç ekranında ana ekran iki sütunda açılır; yarı açık katlanabilir telefonda üst yarıda büyük bir geri sayım görürsünüz.',
        detayAciklama:
            'Geniş ekranlarda solda şu anki vakit kartını ve geri sayımı, sağda günlük akışı aynı anda görürsünüz; ayar ekranları ortada okunaklı bir genişlikte durur. Tablette ve katlanabilir telefonun iç ekranında uygulamayı yatay da kullanabilirsiniz; katlayıp açtığınızda geri sayım ve baktığınız gün olduğu gibi kalır. Galaxy Z Fold ya da Z Flip\'i dizüstü bilgisayar gibi yarı açık bıraktığınızda dik duran üst yarıda kalan süreyi uzaktan okunacak büyüklükte görür, işaretlemeyi masadaki alt yarıdan yaparsınız. Galaxy Z Flip kapak ekranına da bir widget ekleyebilirsiniz. Telefon ekranında düzen aynı kalır.',
        ikon: 'tablet-alt',
        detaylar: [
            'Geniş ekranda solda vakit kartı, sağda günlük akış',
            'Tablette ve katlanabilir iç ekranda yatay kullanım',
            'Yarı açık katlanabilirde üstte büyük geri sayım, altta günlük akış',
            'Galaxy Z Flip kapak ekranı için widget',
            'Telefon ekranında düzen aynı kalır',
        ],
    },
    // Ana ekran widget'ları (0.21) + Widget 2.0, hızlı ayarlar kutusu, kısayollar (#275/#276).
    {
        id: 'ana-ekran-widgetlari',
        oncekiIdler: ['widget-2-hizli-ayarlar'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Widget ve Tek Dokunuşla "Kıldım"',
        aciklama:
            'Ana ekran widget\'ından, hızlı ayarlar kutusundan ya da uygulama kısayolundan, uygulamayı açmadan vakti görüp "Kıldım" diyebilirsiniz.',
        detayAciklama:
            'Widget küçük başlar, büyüttükçe daha çok şey gösterir: 1×1 boyutta içinde bulunduğunuz vakti ve çıkış saatini, 2×2 boyutta kalan süreyi ve "Kıldım" düğmesini, 4×2 boyutta günün beş vaktini görürsünüz. Kalan süre hiçbir zaman eskimez; çıkış saati her boyutta yazılıdır. Widget\'a uzun basıp "Düzenle" ile zemini, opaklığı ve büyük yazılacak bilgiyi seçebilirsiniz. Eski yeşil görünümü sevenler için "Namaz Akışı — Klasik" widget\'ları da listede: küçük olan sıradaki vakte kalan süreyi, geniş olan geri sayımla birlikte günün vakitlerini gösterir. Bildirim panelinin hızlı ayarlarına "Kıldım" kutusunu ekleyebilir, uygulama simgesine uzun basarak Kıble, Kaza defteri ve "Şu anki vakti kıldım" kısayollarını kullanabilirsiniz. Eklemek için ana ekranınıza uzun basın, "Widget\'lar" bölümünden Namaz Akışı\'nı seçin.',
        ikon: 'th-large',
        kartGoster: true,
        detaylar: [
            'Widget\'tan, kutudan ya da kısayoldan yaptığınız işaretleme uygulamaya, bildirimlere ve saatinize anında yansır',
            'Güneş doğduktan öğleye kadar işaretleme kapalıdır; sıradaki vakit gösterilir',
            'Bu yollar yalnızca işaretler; geri almak için uygulamayı kullanabilirsiniz',
            'Widget dakikada bir uyanmaz, pilinizi korur',
            'Yeşil klasik widget\'lar da seçilebilir',
        ],
    },
    {
        id: 'konum-degisim-bildirimi',
        platformlar: ['android'],
        surum: '0.30.0',
        tarih: '2026-09-29',
        baslik: 'Konumunuz Değişince Haber Veriyoruz',
        aciklama:
            'Başka bir ilçeye ya da şehre geçtiğinizde uygulama vakitleri kendiliğinden günceller ve bunu sessiz bir bildirimle size söyler.',
        detayAciklama:
            'Seyahatte otomatik güncelleme açıksa uygulama yer değiştirdiğinizi arka planda fark eder ve namaz vakitlerini yeni konumunuza göre ayarlar. İlçeniz ya da şehriniz değiştiğinde "Konumunuz güncellendi" bildirimini görürsünüz. Bildirim ses ve titreşim çıkarmaz, yalnızca bildirim listesinde durur. Aynı ilçe içinde dolaşırken bildirim gelmez. İsterseniz Konum Ayarları\'ndan kapatabilirsiniz.',
        ikon: 'map-marker-alt',
        hedefSayfa: 'KonumAyarlari',
        ctaEtiketi: 'Konum ayarlarını açın',
        kartGoster: true,
        detaylar: [
            'Yalnızca ilçe ya da şehir değişince bildirim gelir',
            'Ses ve titreşim çıkarmaz',
            'Konumu elle yenilediğinizde ekranda kısa bir mesaj görürsünüz',
            'Konum Ayarları\'ndan kapatabilirsiniz',
        ],
    },
    {
        id: 'gunluk-akis-zinciri',
        platformlar: ['android', 'ios'],
        surum: '0.29.0',
        tarih: '2026-09-29',
        baslik: 'Vakit Saatleri Ana Ekranda',
        aciklama:
            'Günlük Akış her vaktin giriş saatini gösterir ve kıldığınız namazları yeşil bir zincirle birbirine bağlar.',
        detayAciklama:
            'Ana ekrandaki Günlük Akış listesinde her vaktin solunda o vaktin giriş saati yazar; günün planını tek bakışta görebilirsiniz. Vakitler bir zincirle birbirine bağlıdır: kıldığınız namazlardan şu anki vakte kadar olan bağlantılar yeşile döner, arada kılınmamış bir vakit varsa zincir orada kopar. Şu anki vakit ayrıca çerçeveyle öne çıkar.',
        ikon: 'link',
        kartGoster: false,
        detaylar: [
            'Her vaktin giriş saati listede',
            'Kılınan vakitler yeşil zincirle bağlanır',
            'Şu anki vakit çerçeveyle öne çıkar',
            'Ekran okuyucu saati de okur',
        ],
    },
    {
        id: 'seri-gun-sonu-sayaci',
        platformlar: ['android'],
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Serinizi Kurtaracak Geri Sayım',
        aciklama:
            'Gün bitmeden namazlarınız eksikse, kalan süreyi bildirim gölgeliğinde büyük bir geri sayımla görürsünüz.',
        detayAciklama:
            'Seri gününüz ertesi imsakta biter. O ana iki saat kala bugünkü namazlarınız hâlâ eksikse, iftar ve sahur sayaçlarındaki gibi büyük bir geri sayım bildirimi çıkar ve serinizi kurtarmak için ne kadar vaktiniz kaldığını gösterir. Gününüzü zaten tamamladıysanız bu bildirim hiç görünmez. Gün sonu hatırlatmasını kapattıysanız geri sayım da çıkmaz.',
        ikon: 'hourglass-half',
        hedefSayfa: 'SeriHedefAyarlari',
        ctaEtiketi: 'Seri ayarlarınıza bakın',
        kartGoster: false,
        detaylar: [
            'Seri gününün bitimine iki saat kala görünür',
            'Gününüz tamsa hiç çıkmaz',
            'Kalan süre bildirimde canlı olarak akar',
            'Gün sonu hatırlatması kapalıysa çıkmaz',
        ],
    },
    // Hatırlatma sesi seçimi (0.24) + titreşim (0.25) — yalnız Android (iOS'ta ses ve titreşim
    // seçimi yok; platform yeteneği kuralı).
    {
        id: 'muhafiz-bildirim-sesi-secimi',
        oncekiIdler: ['muhafiz-titresim-kanali'],
        platformlar: ['android'],
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Hatırlatma Sesini ve Titreşimi Siz Seçin',
        aciklama:
            'Her hatırlatma adımı için telefonunuzdaki seslerden birini ya da kendi müziğinizi seçebilir, titreşimi ayrıca açabilirsiniz.',
        detayAciklama:
            'Bir adımın ayarlarında bildirim sesi satırına dokunduğunuzda telefonunuzun ses seçicisi açılır; sistem seslerinden birini ya da cihazınıza eklediğiniz bir müziği seçersiniz. Sesi kaydetmeden önce dinleyebilir, dilediğinizde tek dokunuşla uygulama sesine dönebilirsiniz. Seçim adım adım yapılır: nazik hatırlatma için sakin bir ses, son dakikalar için dikkat çekici bir ses kullanabilirsiniz. Titreşim bildirimden ve sesli okumadan bağımsızdır; açtığınız adım belirgin bir desenle, uygulama açıkken de titrer. Hazır yoğunluklardan birine geçseniz bile seçtiğiniz sesler korunur.',
        ikon: 'music',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Sesinizi seçin',
        kartGoster: true,
        detaylar: [
            'Telefonunuzun seslerinden seçin ya da kendi müziğinizi kullanın',
            'Her hatırlatma adımı için ayrı ses ve titreşim',
            'Seçmeden önce dinleyin; dilediğinizde uygulama sesine geri dönün',
            'Hazır yoğunluğa geçseniz de seçtiğiniz sesler korunur',
            'Yeni bir izin istenmez',
        ],
    },
    {
        id: 'konumu-tek-dokunusla-yenile',
        platformlar: ['android', 'ios'],
        surum: '0.25.0',
        tarih: '2026-08-27',
        baslik: 'Konumunuzu Tek Dokunuşla Yenileyin',
        aciklama:
            'Otomatik konum kullanıyorsanız ana ekrandaki konum rozetine dokunarak vakitleri anında güncel konumunuza göre hesaplatabilirsiniz.',
        detayAciklama:
            'Otomatik konum modunda uygulama şehir değiştirdiğinizi kendiliğinden fark eder; ancak bazı cihazlarda bu algılama gecikebilir. Beklemek yerine ana ekranda vaktin üstündeki konum rozetine dokunmanız yeterli: güncel konumunuz alınır; namaz vakitleri, hatırlatmalar, iftar/sahur sayaçları ve widget aynı anda yeni konumunuza göre tazelenir. Aynı düğme Ayarlar\'daki "Konum" satırında da bulunur. Manuel konum seçtiyseniz düğme görünmez — o zaman konum sizin seçiminizdir.',
        ikon: 'sync-alt',
        hedefSayfa: 'KonumAyarlari',
        ctaEtiketi: 'Konumunuzu kontrol edin',
        kartGoster: true,
        detaylar: [
            'Ana ekrandaki konum rozetine dokunun, konum anında yenilensin',
            'Aynı düğme Ayarlar > Konum satırında da var',
            'Vakitler, hatırlatmalar, sayaçlar ve widget birlikte güncellenir',
            'Yalnızca otomatik konum modunda görünür',
        ],
    },
    {
        id: 'toparlanma-iki-gun',
        platformlar: ['android', 'ios'],
        surum: '0.25.0',
        tarih: '2026-08-27',
        baslik: 'Serinizi 2 Günde Kurtarın',
        aciklama:
            'Uzun bir seriyi bir gün kaçırdığınızda serinizi geri almak için 2 gün tam kılmanız yeterli.',
        detayAciklama:
            'Uzun bir seriyi bir gün kaçırdığınızda toparlanma modu devreye girer ve tam kıldığınız 2 günle eski serinizi geri kazanırsınız. Toparlanmada kıldığınız günler de serinize eklenir: 22 günlük seriniz varsa toparlanma bittiğinde 24 günle devam edersiniz. Aynı gün içinde bir namazın işaretini geri alıp yeniden koymak toparlanma ilerlemenizi bozmaz.',
        ikon: 'heartbeat',
        kartGoster: false,
        detaylar: [
            'Toparlanma için 2 tam gün yeterli',
            'Toparlanmada kıldığınız günler serinize eklenir',
            'İşareti geri alıp tekrar koyunca ilerleme sıfırlanmaz',
        ],
    },
    {
        id: 'yerel-yedekleme',
        platformlar: ['android', 'ios'],
        surum: '0.24.0',
        tarih: '2026-06-14',
        baslik: 'Yedekleme & Aktarım',
        aciklama:
            'Verilerinizi tek bir dosyaya yedekleyin ve dilediğiniz zaman geri yükleyin.',
        detayAciklama:
            'Tüm namaz kayıtlarınızı ve ayarlarınızı tek dokunuşla bir yedek dosyasına alabilirsiniz. Dosya bozulmaya karşı korunur ama parola içermez; güvendiğiniz bir yerde saklayın. Yeni bir cihaza geçtiğinizde akıllı sihirbaz, dosyanızı güvenle geri yükler ve mevcut kayıtlarınızla çakışan veriler korunur.',
        ikon: 'cloud-download-alt',
        hedefSayfa: 'YedeklemeAktarim',
        ctaEtiketi: 'Hemen yedekleyin',
        kartGoster: true,
        detaylar: [
            'Tek dokunuşla yedek oluşturun',
            'Akıllı sihirbazla güvenle geri yükleyin',
            'Çakışan kayıtlarınız korunur — veri kaybı olmaz',
        ],
    },
    {
        id: 'takvim-entegrasyonu',
        platformlar: ['android', 'ios'],
        surum: '0.22.0',
        tarih: '2026-06-05',
        baslik: 'Namaz Vakitleri Takviminizde',
        aciklama:
            'Seçtiğiniz namaz vakitlerini telefonunuzun takvimine otomatik etkinlik olarak ekleyebilirsiniz. Böylece günlük planınızı vakitlere göre rahatça yaparsınız.',
        detayAciklama:
            'Her vakit için etkinliğin ne zaman başlayacağını ve kaç dakika süreceğini ayrı ayrı belirleyebilirsiniz. Etkinlikler, eklediğiniz her gün için o günün gerçek namaz vakitlerine göre hesaplanır.',
        ikon: 'calendar-alt',
        hedefSayfa: 'TakvimAyarlari',
        ctaEtiketi: 'Hemen kurun',
        kartGoster: true,
        detaylar: [
            'Her vakit için süreyi ve başlangıcı (vakitte / çıkmadan önce / sonra) ayrı ayarlayın',
            'Dilediğiniz kadar gün ileriye, o günün gerçek vakitleriyle etkinlik oluşturun',
            'Takvim, tarih aralığı ve vakit seçerek istediğiniz etkinlikleri kolayca temizleyin',
        ],
    },
];
