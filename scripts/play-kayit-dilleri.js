/**
 * Google Play mağaza kaydı dilleri: uygulama dil kodu → Play dil kodu.
 *
 * Kaynak: Play Console Yardım "Translate and localize your app" (answer/9844778) listesi.
 * Türkçe (tr-TR) kaynak metindir ve `docs/app-store/magaza-metinleri.md`'den okunur; buradaki
 * diller `docs/app-store/play-kayitlari/<play kodu>.json` dosyalarından gelir.
 *
 * Bilinçli dışarıda: Play'de karşılığı olmayan 28 dil (bs, ps, ckb, ku, ug, uz, tg, tk, tt, sd,
 * as, ha, om, so, ff, yo, mg, lg, rw, rn, ln, dag, mos, aa, mdh, ak, ceb, nqo) ve Pencapça
 * (Play `pa`'nın yazısını belirtmez; CLDR'de `pa` Gurmukidir, bizim metnimiz Şahmuki). Bu dillerin
 * kullanıcısı varsayılan dili görür; uygulama yine kendi dilinde açılır.
 */
const PLAY_DILLERI = {
    en: 'en-US',
    id: 'id',
    de: 'de-DE',
    fr: 'fr-FR',
    ru: 'ru-RU',
    ms: 'ms',
    ar: 'ar',
    ur: 'ur',
    es: 'es-ES',
    nl: 'nl-NL',
    sq: 'sq',
    hi: 'hi-IN',
    bn: 'bn-BD',
    fa: 'fa',
    az: 'az-AZ',
    kk: 'kk',
    ky: 'ky-KG',
    sw: 'sw',
    am: 'am',
    zh: 'zh-CN',
    ta: 'ta-IN',
    ml: 'ml-IN',
    th: 'th',
    ko: 'ko-KR',
    vi: 'vi',
    pt: 'pt-PT',
    it: 'it-IT',
    sv: 'sv-SE',
    uk: 'uk',
    ro: 'ro',
    hr: 'hr',
    sr: 'sr',
    el: 'el-GR',
    pl: 'pl-PL',
    ja: 'ja-JP',
    gu: 'gu',
    bg: 'bg',
    mk: 'mk-MK',
    fil: 'fil',
    te: 'te-IN',
    kn: 'kn-IN',
    mr: 'mr-IN',
    ne: 'ne-NP',
    si: 'si-LK',
    km: 'km-KH',
    he: 'iw-IL',
    ka: 'ka-GE',
    lt: 'lt',
};

/**
 * Play'deki varsayılan kayıt dili: kaydı olmayan dilin kullanıcısı bunu görür, kendi görseli
 * olmayan dil de bu dilin görsellerini gösterir. Görseli olmayan dil varsayılan YAPILMAZ
 * (`play-magaza.js diller` denetler).
 */
const VARSAYILAN_DIL = 'en-US';

const SINIRLAR = { title: 30, shortDescription: 80, fullDescription: 4000 };

module.exports = { PLAY_DILLERI, VARSAYILAN_DIL, SINIRLAR };
