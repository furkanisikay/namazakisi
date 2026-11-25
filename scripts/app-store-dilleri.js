/**
 * App Store mağaza kaydı dilleri: uygulama dil kodu → App Store Connect yerel kodları.
 *
 * Kaynak: App Store Connect API "Managing metadata in your app by using locale shortcodes"
 * (50 yerel). Türkçe (`tr`) kaynak metindir ve `docs/app-store/magaza-metinleri.md`'den okunur;
 * buradaki diller `docs/app-store/app-store-kayitlari/<uygulama dili>.json` dosyalarından gelir.
 * Bir dosya birden çok yerele yazılabilir (ör. İngilizce → ABD, İngiltere, Avustralya, Kanada).
 *
 * Bilinçli dışarıda: App Store'da karşılığı olan ama uygulamada olmayan diller (Katalanca, Çekçe,
 * Danca, Fince, Macarca, Norveççe, Oriya, Slovakça, Slovence) ve Pencapça (`pa-IN` Gurmuki, bizim
 * metnimiz Şahmuki). Kaydı olmayan dilin kullanıcısı birincil dili görür.
 */
const ASC_DILLERI = {
    en: ['en-US', 'en-GB', 'en-AU', 'en-CA'],
    ar: ['ar-SA'],
    bn: ['bn-BD'],
    zh: ['zh-Hans'],
    hr: ['hr'],
    nl: ['nl-NL'],
    fr: ['fr-FR', 'fr-CA'],
    de: ['de-DE'],
    el: ['el'],
    gu: ['gu-IN'],
    he: ['he'],
    hi: ['hi'],
    id: ['id'],
    it: ['it'],
    ja: ['ja'],
    kn: ['kn-IN'],
    ko: ['ko'],
    ms: ['ms'],
    ml: ['ml-IN'],
    mr: ['mr-IN'],
    pl: ['pl'],
    pt: ['pt-PT', 'pt-BR'],
    ro: ['ro'],
    ru: ['ru'],
    es: ['es-ES', 'es-MX'],
    sv: ['sv'],
    ta: ['ta-IN'],
    te: ['te-IN'],
    th: ['th'],
    uk: ['uk'],
    ur: ['ur-PK'],
    vi: ['vi'],
};

/** Türkçe kaynak metnin App Store yereli. */
const KAYNAK_YEREL = 'tr';

/**
 * Birincil dil: kaydı olmayan dilin kullanıcısı bunu görür, kendi ekran görüntüsü olmayan
 * yerel de bu dilin görüntülerini gösterir. Görseli olmayan dil birincil YAPILMAZ.
 */
const BIRINCIL_YEREL = 'en-US';

const SINIRLAR = { name: 30, subtitle: 30, keywords: 100, promotionalText: 170, description: 4000, whatsNew: 4000 };

module.exports = { ASC_DILLERI, KAYNAK_YEREL, BIRINCIL_YEREL, SINIRLAR };
