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
