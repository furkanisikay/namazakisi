/**
 * Magaza pazarlama gorsellerinin TEK DOGRU KAYNAGI: hangi cihaz seti, hangi kare,
 * hangi metin, hangi ham ekran goruntusu. Saf veri; cizim `sablon.js`'te.
 *
 * DOGRULUK KURALI (App Review 2.3.1 / Play yaniltici icerik politikasi): her kare
 * `iddialar` listesinde neyi vaat ettigini soyler. `ANDROID_OZEL_IDDIALAR` App Store
 * setine GIREMEZ (nobetci: src/core/utils/__tests__/magazaGorselleri.test.ts).
 * Iddiayi degistirirken kodda gercekten oldugunu dogrulayin:
 *   - Camideyim / namaz modu / Wear OS saat / Android TV / tablet duzeni: yalniz Android.
 *   - Apple Watch yalniz GOSTERIR ve isaretler (iPhone bildirimini aynalar); bagimsiz
 *     hatirlatma/uyandirma YAPMAZ. Ustelik saat hedefi app.json'da `etkin: false`.
 *   - iOS'ta iCloud esitlemesi KAPALI (withIcloudEsitleme yok) -> "esitleme" vaadi yok.
 *   - iOS gercek alarm = AlarmKit (iOS 26+) -> dipnot zorunlu.
 *   - "Hicbir veri internete cikmaz" DENMEZ: "sunucularimiza gonderilmez".
 *
 * Metin: kibar "siz", sentence case, buyuk baslik + en fazla bir kisa alt satir.
 * Basliktaki `\n` satir sonudur (otomatik kirpma yok; tasma testle olculur).
 * Fikih: "secde" yok, terk/kufur suclamasi yok.
 */

/** Ham ekran goruntusu cihaz turleri: hangi boyutlar hangi cihaza aittir. */
const CIHAZ_TURLERI = {
    iphone: (g, y) => g === 1320 && y === 2868,
    androidTelefon: (g, y) => g === 1080 && y >= 1900 && y <= 2400,
    tablet: (g, y) => g > y && g >= 2000 && !(g === 1920 && y === 1080),
    tv: (g, y) => g === 1920 && y === 1080,
    wearYuvarlak: (g, y) => g === y && g === 454,
    wearKare: (g, y) => g === y && g === 384,
    appleWatch: (g, y) =>
        [
            [422, 514],
            [410, 502],
            [416, 496],
            [396, 484],
            [368, 448],
            [312, 390],
        ].some(([a, b]) => a === g && b === y),
};

/** Yalniz Android'de gercek olan vaatler. App Store setinde GECEMEZ. */
const ANDROID_OZEL_IDDIALAR = ['camideyim', 'cihazlar', 'wear-uyandirma', 'wear-bagimsiz', 'wear-kible', 'wear-gosterim', 'tv', 'tablet', 'drive-esitleme', 'widget', 'otomasyon'];

/** Iki platformda ortak kareler (metin ayni; kaynak dosya ada gore cihaz turunden secilir). */
const ORTAK = {
    muhafiz: {
        baslik: 'Artık namaz\nkaçırmayın',
        alt: 'Vakit daraldıkça sizi yoklar, kıldığınızda susar.',
        zemin: 'acik',
        vakit: 2,
        kaynak: ['02-muhafiz-zaman-seridi.png', '07-muhafiz-zaman-seridi.png', '06-muhafiz.png'],
        // Uygulamanin GERCEK bildirim bicimi (basligiOlustur + muhafizMetinYardimcisi).
        bildirim: { baslik: 'İkindi · 10 dk kaldı', govde: 'Namazı sona bırakma; şimdi kılmak için vakit uygun.', y: 0.04 },
        iddialar: ['muhafiz'],
    },
    sabah: {
        baslik: 'Sabah namazına\nuyanın',
        alt: 'Vakit her gün kayar; alarm her sabah kendini ona göre kurar.',
        zemin: 'gece',
        vakit: 0,
        kaynak: ['10-alarm-onay.png', '09-adim-detay-anahtarlar.png', '03-adim-detay.png'],
        rozet: { ikon: 'alarm', metin: 'Alarm gibi çalar', yer: 'sol', y: 0.18 },
        iddialar: ['alarm'],
    },
    kible: {
        baslik: 'Kıbleyi anında\nbulun',
        alt: 'Pusulada ya da kamerada Kâbe yönü. İnternet gerekmez.',
        zemin: 'acik',
        vakit: 1,
        kaynak: ['05-kible.png'],
        rozet: { ikon: 'kabe', metin: 'Kâbe yönü', yer: 'sag', y: 0.5 },
        iddialar: ['kible'],
    },
    kaza: {
        baslik: 'Kaza borcunuz\ndüzenli',
        alt: 'Hesaplayın, kıldıkça düşün. Dilerseniz kaçan vakitler kendiliğinden eklenir.',
        zemin: 'acik',
        vakit: 3,
        kaynak: ['07-kaza.png', '28-kaza.png', '19-kaza.png'],
        iddialar: ['kaza'],
    },
    nafile: {
        baslik: 'Gece namazına\nkalkın',
        alt: 'Teheccüd, kuşluk ve evvâbîn vakitlerini de hatırlatır.',
        zemin: 'gece',
        vakit: 4,
        kaynak: ['19-nafile-teheccud.png', '18-nafile-teheccud.png', '18-nafile.png', '17-nafile.png'],
        rozet: { ikon: 'ay', metin: 'Teheccüd vakti', yer: 'sol', y: 0.3 },
        iddialar: ['nafile'],
    },
    cuma: {
        baslik: 'Cumaya vaktinde\nyetişin',
        alt: 'Öğle girmeden camiye çıkmanızı hatırlatır.',
        zemin: 'acik',
        vakit: 1,
        kaynak: ['14-cuma.png'],
        iddialar: ['cuma'],
    },
    takvim: {
        baslik: 'Toplantı namazınızı\nkaçırtmasın',
        alt: 'Vakitler takviminize yazılır; bir toplantı vakti yutacaksa önceden haber verir.',
        zemin: 'acik',
        vakit: 1,
        // Gorsel anlati: takvimin bir gunu (cizim) + uygulamanin gercek uyari metni
        // (takvimCakismaPlani.takvimCakismaMetniOlustur; etkinlik adi varsayilan GIZLI).
        yerlesim: 'takvim',
        takvim: {
            vakitAdi: 'Öğle',
            vakitGiris: '12:54',
            vakitCikis: '15:53',
            etkinlik: { bas: '14:00', bit: '16:30' },
        },
        bildirim: {
            baslik: 'Öğle · etkinlik 14:00 · önce kıl',
            govde: 'Takvimindeki bir etkinlik 14:00–16:30 arası sürüyor; öğle vaktinin çıkışı 15:53. Etkinlik başlamadan öğle namazını kıl.',
            y: 0,
        },
        iddialar: ['takvim'],
    },
    gizlilik: {
        baslik: 'Verileriniz sizde',
        alt: 'Kayıtlarınız sunucularımıza gönderilmez.',
        zemin: 'acik',
        vakit: 1,
        yerlesim: 'liste',
        maddeler: [
            { ikon: 'hediye', metin: 'Ücretsiz ve reklamsız' },
            { ikon: 'kilit', metin: 'Hesap açmanız gerekmez' },
            { ikon: 'bulutYok', metin: 'Vakitler internetsiz hesaplanır' },
            { ikon: 'kod', metin: 'Açık kaynak, GPLv3' },
        ],
        kaynak: ['01-ana-ekran.png'],
        iddialar: ['gizlilik'],
    },
    seri: {
        baslik: 'Serinizi büyütün',
        alt: 'Tam kıldığınız her gün haritaya bir yıldız ekler.',
        zemin: 'gece',
        vakit: 4,
        kaynak: ['04-seri.png'],
        iddialar: ['seri'],
    },
};

const kare = (ad, temel, ek = {}) => ({ ad, ...temel, ...ek });

/**
 * Setler. `cihaz`: ham karenin cihaz turu (CIHAZ_TURLERI). `boyut`: cikti piksel olcusu.
 * `magaza`: hangi magazaya gider; `yukleme`: yukleyicinin bu seti kullanip kullanmadigi
 * (false ise yalniz artifact/onizleme; neden `yuklenmezNedeni`'nde).
 */
const SETLER = {
    iphone: {
        magaza: 'appstore',
        platform: 'ios',
        boyut: { gen: 1320, yuk: 2868 },
        yon: 'dikey',
        cihaz: 'iphone',
        yukleme: true,
        kareler: [
            kare('01-muhafiz', ORTAK.muhafiz),
            kare('02-sabah', ORTAK.sabah, { dipnot: 'Gerçek alarm iOS 26 ve sonrasında çalar.' }),
            kare('03-takvim', ORTAK.takvim),
            // iOS kible karesinin altindaki "Bu cihazda pusula yok" bandi simulatorden
            // geliyor; gorunur oranla kesilir.
            kare('04-kible', ORTAK.kible, { gorunur: 0.74 }),
            kare('05-kaza', ORTAK.kaza),
            kare('06-gece', ORTAK.nafile),
            kare('07-cuma', ORTAK.cuma),
            kare('08-gizlilik', ORTAK.gizlilik),
            kare('09-seri', ORTAK.seri),
            // Apple Watch hedefi yayinda DEGIL (app.json withNamazSaat etkin:false): kare
            // yalniz `--kosul appleWatchYayinda` ile uretilir. Iddia yalniz GOSTERIM.
            kare('10-saat', {
                baslik: 'Vakit bileğinizde',
                alt: 'Kalan süreyi saatinizde görün, kıldığınızı bilekten işaretleyin.',
                zemin: 'gece',
                vakit: 2,
                yerlesim: 'telefonSaat',
                kosul: 'appleWatchYayinda',
                katmanlar: [
                    { cihaz: 'iphone', kaynak: ['01-ana-ekran.png'] },
                    { cihaz: 'appleWatch', kaynak: ['01-ana.png', '01-ana-ekran.png'] },
                ],
                iddialar: ['apple-watch-gosterim'],
            }),
        ],
    },
    'apple-watch': {
        magaza: 'appstore',
        platform: 'ios',
        boyut: { gen: 422, yuk: 514 },
        yon: 'saat',
        cihaz: 'appleWatch',
        yukleme: false,
        yuklenmezNedeni:
            'Apple Watch hedefi app.json\'da etkin:false (mağazadaki ikilide saat uygulaması yok); hedef yayına alınana dek ASC\'ye ham saat kareleri gider.',
        kareler: [
            kare('01-siradaki', { baslik: 'Sıradaki vakit\nbileğinizde', kaynak: ['01-ana.png', '01-ana-ekran.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('02-vakitler', { baslik: 'Günün vakitleri\ntek bakışta', kaynak: ['02-vakitler.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('03-kildim', { baslik: 'Kıldığınızı\nbilekten işaretleyin', kaynak: ['03-kildim-onayi.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('04-tesbihat', { baslik: 'Tesbihatı\nbilekte sayın', kaynak: ['04-tesbihat.png'], iddialar: ['apple-watch-gosterim'] }),
        ],
    },
    'play-telefon': {
        magaza: 'play',
        platform: 'android',
        // Play telefon karesi en-boy orani en fazla 2:1 -> 9:16.
        boyut: { gen: 1080, yuk: 1920 },
        yon: 'dikey',
        cihaz: 'androidTelefon',
        yukleme: true,
        kareler: [
            kare('01-muhafiz', ORTAK.muhafiz),
            kare('02-sabah', ORTAK.sabah),
            kare('03-camide', {
                baslik: 'Camide telefonunuz\nçalmaz',
                alt: 'Camiye girince sessize geçer, çıkınca eski hâline döner.',
                zemin: 'acik',
                vakit: 1,
                // Alttaki "namaz modu açılmalı" bandı ilk kurulum adımıdır; kesilir.
                kaynak: ['25-camideyim-ayarlar.png'],
                gorunur: 0.58,
                rozet: { ikon: 'ay', metin: 'Rahatsız Etmeyin açıldı', yer: 'sag', y: 0.5 },
                iddialar: ['camideyim'],
            }),
            kare('04-takvim', ORTAK.takvim),
            // Android emulatorunde konum/pusula sensoru yok: telefonun kible karesi bos
            // ("Konumunuz aliniyor..."). Hat duzelene dek Wear OS kible karesi kullanilir.
            kare('05-kible', {
                ...ORTAK.kible,
                alt: 'Telefonda pusula ya da kamerayla, saatinizde bilekte. İnternet gerekmez.',
                rozet: undefined,
                yerlesim: 'saat',
                titresim: false,
                katmanlar: [{ cihaz: 'wearYuvarlak', kaynak: ['08-kible.png'] }],
                iddialar: ['kible', 'wear-kible'],
            }),
            kare('06-kaza', ORTAK.kaza),
            kare('07-cihazlar', {
                baslik: 'Her cihazınızda',
                alt: 'Telefon, tablet, saat ve televizyonda aynı vakitler.',
                zemin: 'acik',
                vakit: 1,
                yerlesim: 'kolaj',
                katmanlar: [
                    { cihaz: 'tv', kaynak: ['01-pano.png'] },
                    { cihaz: 'tablet', kaynak: ['01-ana-ekran.png'], kirpAlt: 0.075 },
                    { cihaz: 'androidTelefon', kaynak: ['01-ana-ekran.png'] },
                    { cihaz: 'wearYuvarlak', kaynak: ['01-ana-ekran.png'] },
                ],
                iddialar: ['cihazlar', 'tv', 'tablet'],
            }),
            kare('08-bilek', {
                baslik: 'Bilekte sessiz\nuyandırma',
                alt: 'Sabah alarmı yalnız bileğinizi titretir, yanınızdakini uyandırmaz.',
                dipnot: 'Wear OS saat gerekir.',
                zemin: 'gece',
                vakit: 0,
                yerlesim: 'saat',
                katmanlar: [
                    { cihaz: 'wearYuvarlak', kaynak: ['01-ana-ekran.png'] },
                    { cihaz: 'androidTelefon', kaynak: ['01-ana-ekran.png'] },
                ],
                rozet: { ikon: 'titresim', metin: 'Yalnız titreşim', yer: 'sol', y: 0.8 },
                iddialar: ['wear-uyandirma'],
            }),
            // Play telefon galerisi en fazla 8 kare alir: gizlilik karesi uretilir ama
            // yukleyiciye gitmez (README / sosyal medya; istenirse kible ile yer degistirin).
            kare('09-gizlilik', ORTAK.gizlilik, { magazaDisi: true }),
        ],
    },
    'play-tablet': {
        magaza: 'play',
        platform: 'android',
        // 16:10; Play 7" (kenar 320-3840) ve 10" (kenar >= 1080) sartlarinin ikisine de uyar.
        boyut: { gen: 2560, yuk: 1600 },
        yon: 'yatay',
        cihaz: 'tablet',
        yukleme: true,
        kareler: [
            kare('01-tek-ekran', {
                baslik: 'Günün tamamı\ntek ekranda',
                alt: 'Kalan süre ve günlük akış yan yana.',
                zemin: 'acik',
                vakit: 2,
                kaynak: ['01-ana-ekran.png'],
                kirpAlt: 0.075,
                iddialar: ['tablet'],
            }),
            kare('02-muhafiz', { ...ORTAK.muhafiz, rozet: undefined, kirpAlt: 0.075 }),
            kare('03-kaza', { ...ORTAK.kaza, kirpAlt: 0.075 }),
            kare('04-gece', { ...ORTAK.nafile, rozet: undefined, kirpAlt: 0.075 }),
        ],
    },
    tv: {
        magaza: 'play',
        platform: 'android',
        boyut: { gen: 1920, yuk: 1080 },
        yon: 'yatay',
        cihaz: 'tv',
        // TV karelerine metin eklemeyi yasaklayan acik bir Play kurali bulunamadi ama
        // emsal de yok: yukleyici varsayilan ham kare, pazarlama yalniz play-magaza.yml tv_pazarlama ile.
        yukleme: false,
        yuklenmezNedeni: 'Android TV karelerinde eklenmiş metin için açık bir Play kuralı yok; yükleme yalnız play-magaza.yml > cihaz-kareleri + tv_pazarlama ile.',
        kareler: [
            kare('01-pano', {
                baslik: 'Evde herkes\nvakti görsün',
                alt: 'Televizyonunuz vakit panosuna dönüşür.',
                zemin: 'gece',
                vakit: 1,
                kaynak: ['01-pano.png'],
                iddialar: ['tv'],
            }),
            kare('02-sehir', {
                baslik: 'Şehrinizi bir kez\nseçin',
                alt: 'Vakitler televizyonda hesaplanır; hesap ve internet gerekmez.',
                zemin: 'gece',
                vakit: 3,
                kaynak: ['02-il-secimi.png'],
                iddialar: ['tv'],
            }),
        ],
    },
    wear: {
        magaza: 'play',
        platform: 'android',
        boyut: { gen: 1024, yuk: 1024 },
        yon: 'kare',
        cihaz: 'wearYuvarlak',
        // Play Wear OS kurali: 1:1, yalniz uygulama arayuzu; cihaz cercevesi, eklenmis
        // metin ve arka plan YASAK. Bu set magazaya GITMEZ (README/sosyal medya icin).
        yukleme: false,
        yuklenmezNedeni: 'Play Wear OS kuralı: ekran görüntüsünde çerçeve, eklenmiş metin ve arka plan yasak. Play\'e ham kareler gider.',
        kareler: [
            kare('01-siradaki', { baslik: 'Sıradaki vakit bileğinizde', zemin: 'gece', kaynak: ['01-ana-ekran.png'], iddialar: ['wear-gosterim'] }),
            kare('02-telefonsuz', { baslik: 'Telefon uzaktayken de hatırlatır', zemin: 'gece', kaynak: ['05-tile-bugun.png', '01-ana-ekran.png'], iddialar: ['wear-bagimsiz'] }),
            kare('03-kible', { baslik: 'Kıble bileğinizde', zemin: 'gece', kaynak: ['08-kible.png'], iddialar: ['wear-kible'] }),
            kare('04-tesbihat', { baslik: 'Tesbihatı bilekte sayın', zemin: 'gece', kaynak: ['04-tesbihat.png'], iddialar: ['wear-gosterim'] }),
        ],
    },
};

/** Magaza mockup'larinin eski `--platform` adlari -> set. */
const PLATFORM_SETI = { ios: 'iphone', android: 'play-telefon' };

module.exports = { SETLER, CIHAZ_TURLERI, ANDROID_OZEL_IDDIALAR, PLATFORM_SETI };
