/**
 * README ve belge sayfalarindaki ekran goruntusu GRUPLARI — tek tanim.
 *
 * Iki betik bu listeyi paylasir:
 *   - scripts/belge-gorselleri.js   kareleri indirir/donusturur (ag ister)
 *   - scripts/belgeleri-guncelle.js  README'deki galeriyi yazar (cevrimdisi)
 *
 * Kaynak turleri:
 *   appstore — App Store'daki CANLI kareler (itunes lookup; anahtar gerekmez)
 *   play     — Google Play'deki CANLI kareler (Android Publisher API, alan adi
 *              `alan`; servis hesabi yoksa telefon kareleri herkese acik sayfadan)
 *   artifact — ekran goruntusu hatlarinin artifact'i (yalniz master'a GIRMIS bir
 *              commit'in BASARILI kosusundan; `alt` = artifact icindeki alt klasor)
 *
 * Magaza gruplari "magazada ne varsa o" ilkesini tasir (README magazayla birebir);
 * artifact gruplari "daha fazlasi"dir (koyu tema, tablet, saat, TV, yeni ekranlar).
 */
const path = require('path');

const KOK = path.resolve(__dirname, '..');
/** Karelerin depodaki yeri (docs/** → push release KESMEZ, ci.yml paths-ignore). */
const GORSEL_KLASORU = path.join(KOK, 'docs', 'ekran-goruntuleri');
const MANIFEST = path.join(GORSEL_KLASORU, 'manifest.json');

const ANDROID_HAT = 'android-ekran-goruntuleri.yml';
const IOS_HAT = 'ios-ekran-goruntuleri.yml';

/**
 * `genislik`: README'ye uygun piksel genisligi (webp). `gosterim`: README'de
 * cizilecek genislik (retina icin genislikten kucuk tutulur).
 */
const GRUPLAR = [
    {
        id: 'magaza-android',
        baslik: 'Google Play',
        bolum: 'magaza',
        klasor: 'magaza/android',
        kaynak: { tur: 'play', alan: 'phoneScreenshots' },
        genislik: 360,
        gosterim: 180,
    },
    {
        id: 'magaza-ios',
        baslik: 'App Store',
        bolum: 'magaza',
        klasor: 'magaza/ios',
        kaynak: { tur: 'appstore' },
        genislik: 360,
        gosterim: 180,
    },
    {
        id: 'magaza-wear',
        baslik: 'Google Play — Wear OS',
        bolum: 'magaza',
        klasor: 'magaza/wear',
        kaynak: { tur: 'play', alan: 'wearScreenshots' },
        genislik: 240,
        gosterim: 150,
    },
    {
        id: 'magaza-tv',
        baslik: 'Google Play — Android TV',
        bolum: 'magaza',
        klasor: 'magaza/tv',
        kaynak: { tur: 'play', alan: 'tvScreenshots' },
        genislik: 640,
        gosterim: 320,
    },
    {
        id: 'android-acik',
        baslik: 'Android — tüm ekranlar (açık tema)',
        bolum: 'uygulama',
        klasor: 'uygulama/android-acik',
        kaynak: { tur: 'artifact', hat: ANDROID_HAT, ad: 'android-ozellik-kareleri', alt: 'telefon-acik' },
        genislik: 360,
        gosterim: 160,
    },
    {
        id: 'android-koyu',
        baslik: 'Android — koyu tema',
        bolum: 'uygulama',
        klasor: 'uygulama/android-koyu',
        kaynak: { tur: 'artifact', hat: ANDROID_HAT, ad: 'android-ozellik-kareleri', alt: 'telefon-koyu' },
        genislik: 360,
        gosterim: 160,
    },
    {
        id: 'android-tablet',
        baslik: 'Tablet ve katlanabilir',
        bolum: 'uygulama',
        klasor: 'uygulama/android-tablet',
        kaynak: { tur: 'artifact', hat: ANDROID_HAT, ad: 'android-ozellik-kareleri', alt: 'tablet-acik' },
        genislik: 480,
        gosterim: 240,
    },
    {
        id: 'iphone-acik',
        baslik: 'iPhone — tüm ekranlar (açık tema)',
        bolum: 'uygulama',
        klasor: 'uygulama/iphone-acik',
        kaynak: { tur: 'artifact', hat: IOS_HAT, ad: 'ios-ozellik-kareleri', alt: 'iphone-acik' },
        genislik: 360,
        gosterim: 160,
    },
    {
        id: 'iphone-koyu',
        baslik: 'iPhone — koyu tema',
        bolum: 'uygulama',
        klasor: 'uygulama/iphone-koyu',
        kaynak: { tur: 'artifact', hat: IOS_HAT, ad: 'ios-ozellik-kareleri', alt: 'iphone-koyu' },
        genislik: 360,
        gosterim: 160,
    },
    {
        id: 'wear-yuvarlak',
        baslik: 'Wear OS — yuvarlak saat',
        bolum: 'cihaz',
        klasor: 'cihaz/wear-yuvarlak',
        kaynak: { tur: 'artifact', hat: ANDROID_HAT, ad: 'android-saat-kareleri', alt: 'yuvarlak' },
        genislik: 240,
        gosterim: 150,
    },
    {
        id: 'wear-kare',
        baslik: 'Wear OS — kare saat',
        bolum: 'cihaz',
        klasor: 'cihaz/wear-kare',
        kaynak: { tur: 'artifact', hat: ANDROID_HAT, ad: 'android-saat-kareleri', alt: 'kare' },
        genislik: 240,
        gosterim: 150,
    },
    {
        id: 'apple-watch',
        baslik: 'Apple Watch',
        bolum: 'cihaz',
        klasor: 'cihaz/apple-watch',
        kaynak: { tur: 'artifact', hat: IOS_HAT, ad: 'ios-saat-kareleri', alt: '' },
        genislik: 240,
        gosterim: 150,
    },
    {
        id: 'android-tv',
        baslik: 'Android TV',
        bolum: 'cihaz',
        klasor: 'cihaz/android-tv',
        kaynak: { tur: 'artifact', hat: ANDROID_HAT, ad: 'android-tv-kareleri', alt: '' },
        genislik: 640,
        gosterim: 320,
    },
];

module.exports = { KOK, GORSEL_KLASORU, MANIFEST, GRUPLAR };
