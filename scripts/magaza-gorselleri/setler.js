/**
 * Magaza pazarlama gorsellerinin TEK DOGRU KAYNAGI: hangi cihaz seti, hangi kare,
 * hangi metin, hangi ham ekran goruntusu. Saf veri; cizim `sablon.js`'te.
 *
 * DOGRULUK KURALI (App Review 2.3 / Play yaniltici icerik politikasi): her kare
 * `iddialar` listesinde neyi vaat ettigini soyler. `ANDROID_OZEL_IDDIALAR` App Store
 * setine GIREMEZ (nobetci: src/core/utils/__tests__/magazaGorselleri.test.ts).
 * Iddiayi degistirirken kodda gercekten oldugunu dogrulayin (2026-10-22 durumu):
 *   - Yalniz Android: Camideyim (geofence + Rahatsiz Etmeyin), Wear OS saat, Android TV
 *     uygulamasi, Android tablet duzeni, kendi ses dosyasi / vakit girdi sesi, Drive.
 *   - iPhone camide sessiz = Odak + Kisayollar (bir kez kurulur; "Namazda sessiz").
 *   - Apple Watch (withNamazSaat etkin): vakit/kalan sure, Kildim, kible, tesbihat,
 *     telefon uzaktayken bilekte hatirlatma, sessiz uyandirma (SaatUyandirici).
 *   - Telefon <-> tablet "Kildim" esitlemesi yerel agda, iki platformda (Neler Yeni).
 *   - iCloud esitlemesi KULLANICIYA KAPALI (app.json extra `icloudEsitlemeEtkin` yok)
 *     -> kosullu. Android Auto kodu var ama Play form faktoru ACILMADI -> kosullu.
 *     Apple TV hedefi (withNamazTV) etkin:false -> set kosullu.
 *   - iOS gercek alarm = AlarmKit (iOS 26+) -> dipnot zorunlu.
 *   - "Hicbir veri internete cikmaz" DENMEZ: "sunucularimiza gonderilmez".
 *
 * Metin: kibar "siz", sentence case, buyuk baslik + en fazla bir kisa alt satir.
 * Basliktaki `\n` satir sonudur (otomatik kirpma yok; tasma testle olculur).
 * Fikih: "secde" yok, terk/kufur suclamasi yok.
 *
 * Kare alanlari: kaynak (ham kare adlari, oncelik sirasiyla) | katmanlar (birden cok
 * ekran: { cihaz, kaynak, yedekCizim? }) | yerlesim (cihaz, liste, kolaj, saat, alarm,
 * takvim, telefonSaat, ikiTelefon) | rozet / bildirim (uygulamanin GERCEK metni) |
 * kosul (gelecek ozellik: `--kosul` verilmeden uretilmez) | magazaDisi (galeri siniri).
 */

/** Ham ekran goruntusu cihaz turleri: hangi boyutlar hangi cihaza aittir. */
const CIHAZ_TURLERI = {
    iphone: (g, y) => g === 1320 && y === 2868,
    androidTelefon: (g, y) => g === 1080 && y >= 1900 && y <= 2400,
    // Android tablet (pixel_tablet 2560x1600). iPad yatayi (2752x2064) AYRI tur.
    tablet: (g, y) => g === 2560 && y === 1600,
    ipad: (g, y) => g === 2064 && y === 2752,
    ipadYatay: (g, y) => g === 2752 && y === 2064,
    tv: (g, y) => g === 1920 && y === 1080,
    wearYuvarlak: (g, y) => g === y && g === 454,
    wearKare: (g, y) => g === y && g === 384,
    // Katlanabilir emulator kareleri (scripts/android-flip-avd.sh): Fold ic ekran, Flip.
    fold: (g, y) => (g === 2208 && y === 1840) || (g === 1840 && y === 2208),
    flip: (g, y) => g === 1080 && y === 2640,
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
const ANDROID_OZEL_IDDIALAR = [
    'camideyim',
    'cihazlar',
    'wear-uyandirma',
    'wear-bagimsiz',
    'wear-kible',
    'wear-gosterim',
    'tv',
    'tablet',
    'vakit-sesi',
    'drive-esitleme',
    'widget',
    'otomasyon',
    'android-auto',
];

/** Apple Watch karelerinde izinli iddialar (kodda dogrulandi, 2026-10-22). */
const APPLE_WATCH_IDDIALARI = ['apple-watch-gosterim', 'apple-watch-hatirlatma', 'apple-watch-uyandirma'];

/** Sabah alarmi ornegi: zaman seridi karesi (ilk hatirlatma 06:51, gunes 07:16). */
const SABAH_ALARMI = {
    saat: '06:51',
    tarih: 'Perşembe, 22 Ekim',
    vakitAdi: 'Sabah',
    vaktinSonu: '07:16',
    baslik: 'Sabah · 25 dk kaldı ⏰',
    metin: 'Vakit daralmaya başladı, fırsat varken kıl.',
};

/** Iki platformda ortak kareler (metin ayni; kaynak dosya ada gore cihaz turunden secilir). */
const ORTAK = {
    muhafiz: {
        baslik: 'Artık namaz\nkaçırmayın',
        alt: 'Vakit daraldıkça sizi yoklar, kıldığınızda susar.',
        zemin: 'acik',
        vakit: 2,
        kaynak: ['07-muhafiz-zaman-seridi.png', '02-muhafiz-zaman-seridi.png', '06-muhafiz.png'],
        // Uygulamanin GERCEK bildirim bicimi (basligiOlustur + muhafizMetinYardimcisi).
        bildirim: { baslik: 'İkindi · 10 dk kaldı', govde: 'Namazı sona bırakma; şimdi kılmak için vakit uygun.', y: 0.04 },
        iddialar: ['muhafiz'],
    },
    sabah: {
        baslik: 'Sabah namazına\nuyanın',
        alt: 'Vakit her gün kayar; alarm her sabah kendini ona göre kurar.',
        zemin: 'gece',
        vakit: 0,
        // Uyanma ani: calan alarm (cizim, gercek metinler; sablon.js > alarmEkrani) +
        // kucuk uygulama ekrani: o sabahin hatirlatma seridi.
        yerlesim: 'alarm',
        kaynak: ['10b-alarm-acik.png', '07-muhafiz-zaman-seridi.png', '02-muhafiz-zaman-seridi.png'],
        alarm: SABAH_ALARMI,
        iddialar: ['alarm'],
    },
    takvim: {
        baslik: 'Toplantı namazınızı\nkaçırtmasın',
        alt: 'Vakitler takviminize yazılır; bir toplantı vakti yutacaksa önceden haber verir.',
        zemin: 'acik',
        vakit: 1,
        // Gorsel anlati: takvimin bir gunu (cizim) + uygulamanin gercek uyari metni
        // (takvimCakismaPlani.takvimCakismaMetniOlustur; etkinlik adi varsayilan GIZLI).
        yerlesim: 'takvim',
        takvim: { vakitAdi: 'Öğle', vakitGiris: '12:54', vakitCikis: '15:50', etkinlik: { bas: '14:00', bit: '16:30' } },
        bildirim: {
            baslik: 'Öğle · etkinlik 14:00 · önce kıl',
            govde: 'Takvimindeki bir etkinlik 14:00–16:30 arası sürüyor; öğle vaktinin çıkışı 15:50. Etkinlik başlamadan öğle namazını kıl.',
            y: 0,
        },
        iddialar: ['takvim'],
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
        kaynak: ['04-seri.png', '33-ilerleme.png'],
        iddialar: ['seri'],
    },
};

const kare = (ad, temel, ek = {}) => ({ ad, ...temel, ...ek });

/**
 * Setler. `cihaz`: ham karenin cihaz turu (CIHAZ_TURLERI). `boyut`: cikti piksel olcusu.
 * `magaza`: hangi magazaya gider; `yukleme`: yukleyicinin bu seti kullanip kullanmadigi
 * (false ise yalniz artifact/onizleme; neden `yuklenmezNedeni`'nde). `kosul`: set
 * duzeyinde gelecek ozellik (verilmeden HIC uretilmez).
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
            // Alarm aninda saatte de "Kildim" (Apple Watch sessiz uyandirma ekrani).
            kare('02-sabah', ORTAK.sabah, {
                dipnot: 'Gerçek alarm iOS 26 ve sonrasında çalar.',
                katmanlar: [{ cihaz: 'appleWatch', kaynak: ['06-uyandirma-dolu.png'], yedekCizim: 'appleUyandirma' }],
                iddialar: ['alarm', 'apple-watch-uyandirma'],
            }),
            kare('03-takvim', ORTAK.takvim),
            // iPhone'da sessize alma yalniz Odak ile: uygulama rehberle bir kez kurdurur.
            kare('04-camide', {
                baslik: 'Camide telefonunuz\nçalmaz',
                alt: 'Kısayollar ile bir kez kurun; camiye varınca Namaz odağı açılır.',
                zemin: 'acik',
                vakit: 1,
                kaynak: ['23-namazda-sessiz.png'],
                rozet: { ikon: 'ay', metin: 'Namaz odağı açık', yer: 'sag', y: 0.12 },
                iddialar: ['ios-camide-odak'],
            }),
            kare('05-saat', {
                baslik: 'Telefon uzaktayken\nsaatiniz hatırlatır',
                alt: 'Kalan süreyi bilekte görün, kıldığınızı oradan işaretleyin.',
                zemin: 'gece',
                vakit: 2,
                yerlesim: 'telefonSaat',
                katmanlar: [
                    { cihaz: 'iphone', kaynak: ['01-ana-ekran.png'] },
                    { cihaz: 'appleWatch', kaynak: ['01-simdi.png', '01-ana.png'] },
                ],
                iddialar: ['apple-watch-gosterim', 'apple-watch-hatirlatma'],
            }),
            // Apple Watch uyandirma karesi simulatorde bos (yukleme simgesi) geliyor:
            // ekran gercek metinlerle cizilir (sablon.js > appleUyandirmaEkrani).
            kare('06-bilek', {
                baslik: 'Bilekte sessiz\nuyandırma',
                alt: 'Sabah alarmı yalnız bileğinizi titretir, yanınızdakini uyandırmaz.',
                dipnot: 'Apple Watch gerekir.',
                zemin: 'gece',
                vakit: 0,
                yerlesim: 'saat',
                katmanlar: [
                    { cihaz: 'appleWatch', kaynak: ['06-uyandirma-dolu.png'], yedekCizim: 'appleUyandirma' },
                    { cihaz: 'iphone', kaynak: ['01-ana-ekran.png'] },
                ],
                rozet: { ikon: 'titresim', metin: 'Yalnız titreşim', yer: 'sol', y: 0.8 },
                iddialar: ['apple-watch-uyandirma'],
            }),
            kare('07-kible', {
                baslik: 'Kıbleyi anında\nbulun',
                alt: 'Pusulada, kamerada ya da bilekte Kâbe yönü. İnternet gerekmez.',
                zemin: 'acik',
                vakit: 1,
                yerlesim: 'telefonSaat',
                katmanlar: [
                    { cihaz: 'iphone', kaynak: ['05-kible.png'] },
                    { cihaz: 'appleWatch', kaynak: ['04-kible.png'] },
                ],
                // Simulatorde pusula yok: karenin altindaki "pusula yok" bandi eritilir.
                gorunur: 0.72,
                iddialar: ['kible', 'apple-watch-gosterim'],
            }),
            kare('08-kaza', ORTAK.kaza),
            kare('09-cihazlar', {
                baslik: 'Her cihazınızda',
                alt: 'iPhone, iPad, saat ve televizyon kıldığınızı birbirine söyler.',
                zemin: 'acik',
                vakit: 1,
                yerlesim: 'kolaj',
                katmanlar: [
                    { cihaz: 'tv', kaynak: ['04-pano-telefondan.png', '01-pano.png'] },
                    { cihaz: 'ipadYatay', kaynak: ['yatay-01-bugun.png'] },
                    { cihaz: 'iphone', kaynak: ['01-ana-ekran.png'] },
                    { cihaz: 'appleWatch', kaynak: ['01-simdi.png', '01-ana.png'] },
                ],
                iddialar: ['cihaz-agi', 'ipad', 'apple-watch-gosterim', 'tv-eslesme'],
            }),
            kare('10-gizlilik', ORTAK.gizlilik),
            // App Store galerisi en fazla 10: ureticiye girer, yukleyiciye gitmez.
            kare('11-gece', ORTAK.nafile, { magazaDisi: true }),
            kare('12-cuma', ORTAK.cuma, { magazaDisi: true }),
            kare('13-seri', ORTAK.seri, { magazaDisi: true }),
            // GELECEK: iCloud esitlemesi kullaniciya acilinca (app.json extra).
            kare('14-esitleme', {
                baslik: 'Cihazlarınız\nbirbirini görür',
                alt: 'Kayıtlarınız iCloud üzerinden uçtan uca şifreli eşitlenir.',
                zemin: 'acik',
                vakit: 2,
                kosul: 'icloudEsitleme',
                kaynak: ['esitleme.png', '04-ayarlar.png'],
                iddialar: ['icloud-esitleme'],
            }),
        ],
    },
    // iPad 13" (uygulama iPad'de calistigi icin App Store'da ZORUNLU). Yatay: yan menu +
    // uc sutun gorunur. App Store yatay 2752x2064'u kabul eder.
    ipad: {
        magaza: 'appstore',
        platform: 'ios',
        boyut: { gen: 2752, yuk: 2064 },
        yon: 'yatay',
        cihaz: 'ipadYatay',
        yukleme: true,
        kareler: [
            kare('01-tek-ekran', {
                baslik: 'Günün tamamı\ntek ekranda',
                alt: 'Kalan süre, günlük akış ve haftanız yan yana.',
                zemin: 'acik',
                vakit: 2,
                kaynak: ['yatay-01-bugun.png'],
                yakin: { x: 0.205, y: 0.42, w: 0.27, h: 0.37, genislik: 0.23, ust: 0.3, yer: 'sol' },
                iddialar: ['ipad'],
            }),
            kare('02-muhafiz', {
                ...ORTAK.muhafiz,
                bildirim: undefined,
                kaynak: ['yatay-02-ayarlar.png'],
                yakin: { x: 0.41, y: 0.25, w: 0.585, h: 0.45, genislik: 0.36, ust: 0.33 },
            }),
            kare('03-camide', {
                baslik: 'Camide iPad\nçalmaz',
                alt: 'Kısayollar ile bir kez kurun; camiye varınca Namaz odağı açılır.',
                zemin: 'acik',
                vakit: 1,
                kaynak: ['yatay-03-ayarlar-camideyim.png'],
                yakin: { x: 0.41, y: 0.08, w: 0.585, h: 0.42, genislik: 0.36, ust: 0.33 },
                iddialar: ['ios-camide-odak'],
            }),
            kare('04-kaza', {
                ...ORTAK.kaza,
                alt: 'Kalan borç ve her hareketin geçmişi yan yana.',
                kaynak: ['yatay-04-kaza.png'],
                yakin: { x: 0.185, y: 0.075, w: 0.255, h: 0.22, genislik: 0.26, ust: 0.3, yer: 'sol' },
            }),
            kare('05-seri', { ...ORTAK.seri, kaynak: ['yatay-05-ilerleme.png'] }),
            kare('06-ev-ekrani', {
                baslik: 'Evde vakit\npanosu',
                alt: 'Ev ekranını açın; iPad yatay dururken vakitler büyük görünür.',
                zemin: 'gece',
                vakit: 2,
                kaynak: ['yatay-06-ev-ekrani.png'],
                iddialar: ['ipad'],
            }),
        ],
    },
    'apple-watch': {
        magaza: 'appstore',
        platform: 'ios',
        boyut: { gen: 422, yuk: 514 },
        yon: 'saat',
        cihaz: 'appleWatch',
        yukleme: true,
        kareler: [
            kare('01-simdi', { baslik: 'Kalan süre\nbileğinizde', kaynak: ['01-simdi.png', '01-ana.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('02-bugun', { baslik: 'Günün vakitleri\ntek bakışta', kaynak: ['02-bugun.png', '02-vakitler.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('03-kilindi', { baslik: 'Kıldığınızı\nbilekten işaretleyin', kaynak: ['03-kilindi.png', '03-kildim-onayi.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('04-uyandirma', {
                baslik: 'Yanınızdakini\nuyandırmadan',
                katmanlar: [{ cihaz: 'appleWatch', kaynak: ['06-uyandirma-dolu.png'], yedekCizim: 'appleUyandirma' }],
                iddialar: ['apple-watch-uyandirma'],
            }),
            kare('05-kible', { baslik: 'Kıble bileğinizde', kaynak: ['04-kible.png'], iddialar: ['apple-watch-gosterim'] }),
            kare('06-tesbihat', { baslik: 'Tesbihatı\nbilekte sayın', kaynak: ['05-tesbihat.png', '04-tesbihat.png'], iddialar: ['apple-watch-gosterim'] }),
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
            kare('01-muhafiz', ORTAK.muhafiz, {
                katmanlar: [
                    { cihaz: 'androidTelefon', kaynak: ORTAK.muhafiz.kaynak },
                    { cihaz: 'wearYuvarlak', kaynak: ['01-ana-ekran.png'] },
                ],
                iddialar: ['muhafiz', 'wear-gosterim'],
            }),
            kare('02-sabah', ORTAK.sabah),
            kare('03-camide', {
                baslik: 'Camide telefonunuz\nçalmaz',
                alt: 'Camiye girince sessize geçer, çıkınca eski hâline döner.',
                zemin: 'acik',
                vakit: 1,
                // Alttaki "namaz modu açılmalı" bandi ilk kurulum adimidir: telefon buyuk,
                // bant tuvalin altinda kalir.
                kaynak: ['25-camideyim-ayarlar.png'],
                cihazGen: 1150,
                rozet: { ikon: 'ay', metin: 'Rahatsız Etmeyin açıldı', yer: 'sag', y: 0.5 },
                iddialar: ['camideyim'],
            }),
            kare('04-takvim', ORTAK.takvim),
            // Kamerada zemine cizilen yol + titremeyen pusula, iki ekran yan yana.
            kare('05-kible', {
                baslik: 'Kıbleyi anında\nbulun',
                alt: 'Kamerada yere çizilen yol sizi Kâbe yönüne götürür. İnternet gerekmez.',
                zemin: 'acik',
                vakit: 1,
                yerlesim: 'ikiTelefon',
                // Emulatorun sanal odasi yerine sade avlu zemini + uygulamanin kendi yol katmani.
                kibleKamera: true,
                katmanlar: [
                    { cihaz: 'androidTelefon', kaynak: ['38-kible-kamera-egik-25.png', '35-kible-kamera.png'] },
                    { cihaz: 'androidTelefon', kaynak: ['32-kible.png'] },
                ],
                iddialar: ['kible'],
            }),
            // Katlanabilir: Fold tipi ic ekran (2208x1840) emulatorde GERCEK iki bolmeli duzen.
            // Flip masaustu postur emulatorde gosterilemedi (device_state HALF_OPENED olsa da
            // pencereye mentese ozelligi gelmiyor) → yalniz gercekten gorulen duzen.
            kare('06-katlanabilir', {
                baslik: 'Katlanabilir\ntelefonda da rahat',
                alt: 'Açınca kalan süre ve günlük akış yan yana.',
                zemin: 'acik',
                vakit: 2,
                yerlesim: 'katlanabilir',
                katmanlar: [{ cihaz: 'fold', kaynak: ['01-ana-ekran.png'] }],
                iddialar: ['katlanabilir'],
            }),
            // Telefon + saat birlikte: telefon uzakta ya da sessizde, saat bilekte titrer.
            kare('07-bilek', {
                baslik: 'Bilekte sessiz\nuyandırma',
                alt: 'Sabah alarmı yalnız bileğinizi titretir, yanınızdakini uyandırmaz.',
                dipnot: 'Wear OS saat gerekir.',
                zemin: 'gece',
                vakit: 0,
                yerlesim: 'saat',
                katmanlar: [
                    { cihaz: 'wearYuvarlak', kaynak: ['10-uyandirma.png'], yedekCizim: 'uyandirma' },
                    { cihaz: 'androidTelefon', kaynak: ['01-ana-ekran.png'] },
                ],
                rozet: { ikon: 'titresim', metin: 'Yalnız titreşim', yer: 'sol', y: 0.8 },
                iddialar: ['wear-uyandirma'],
            }),
            kare('08-cihazlar', {
                baslik: 'Her cihazınızda',
                alt: 'Telefon, tablet, saat ve televizyon kıldığınızı birbirine söyler.',
                altTabletsiz: 'Telefon, saat ve televizyon kıldığınızı birbirine söyler.',
                zemin: 'acik',
                vakit: 1,
                yerlesim: 'kolaj',
                katmanlar: [
                    { cihaz: 'tv', kaynak: ['04-pano-telefondan.png', '01-pano.png'] },
                    { cihaz: 'tablet', kaynak: ['01-ana-ekran.png'], kirpAlt: 0.075 },
                    { cihaz: 'androidTelefon', kaynak: ['01-ana-ekran.png'] },
                    { cihaz: 'wearYuvarlak', kaynak: ['01-ana-ekran.png'] },
                ],
                iddialar: ['cihazlar', 'tv', 'tablet', 'cihaz-agi'],
            }),
            // Play telefon galerisi en fazla 8 kare: gerisi uretilir, yuklenmez.
            kare('09-gizlilik', ORTAK.gizlilik, { magazaDisi: true }),
            // Kaza tablet setinde (04-kaza) duruyor; telefon galerisinde yerini katlanabilir aldi.
            kare('09-kaza', ORTAK.kaza, { magazaDisi: true }),
            kare('10-vakit-sesi', {
                baslik: 'Vakit girince\nkendi sesiniz',
                alt: 'Her vakte ayrı ses seçin; dilerseniz kendi kaydınızı.',
                zemin: 'acik',
                vakit: 2,
                kaynak: ['41-vakit-sesi-secenekler.png', '40-vakit-sesi.png'],
                magazaDisi: true,
                iddialar: ['vakit-sesi'],
            }),
            kare('11-gece', ORTAK.nafile, { magazaDisi: true }),
            // GELECEK: Play Console'da Android Auto form faktoru acilinca (kod hazir).
            kare('12-arac', {
                baslik: 'Yolda da\nvakit sizde',
                alt: 'Android Auto’da yakındaki camiler ve sıradaki vakit.',
                zemin: 'acik',
                vakit: 2,
                yerlesim: 'liste',
                kosul: 'androidAutoYayinda',
                maddeler: [
                    { ikon: 'kabe', metin: 'En yakın camiler, yol tarifiyle' },
                    { ikon: 'zil', metin: 'Sıradaki vakit ve kalan süre' },
                ],
                kaynak: ['01-ana-ekran.png'],
                iddialar: ['android-auto'],
            }),
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
                alt: 'Kalan süre, günlük akış ve haftanız yan yana.',
                zemin: 'acik',
                vakit: 2,
                kaynak: ['01-ana-ekran.png'],
                kirpAlt: 0.075,
                yakin: { x: 0.185, y: 0.42, w: 0.27, h: 0.44, genislik: 0.24, ust: 0.38, yer: 'sol' },
                iddialar: ['tablet'],
            }),
            kare('02-muhafiz', {
                ...ORTAK.muhafiz,
                bildirim: undefined,
                kirpAlt: 0.075,
                yakin: { x: 0.455, y: 0.19, w: 0.53, h: 0.52, genislik: 0.3, ust: 0.3 },
            }),
            kare('03-camide', {
                baslik: 'Camide tabletiniz\nçalmaz',
                alt: 'Yakındaki camiler haritada; girince sessize geçer.',
                zemin: 'acik',
                vakit: 1,
                kaynak: ['26-camideyim-harita.png', '25-camideyim-ayarlar.png'],
                kirpAlt: 0.075,
                iddialar: ['camideyim', 'tablet'],
            }),
            kare('04-kaza', {
                ...ORTAK.kaza,
                alt: 'Kalan borç ve her hareketin geçmişi yan yana.',
                kirpAlt: 0.075,
                yakin: { x: 0.165, y: 0.12, w: 0.28, h: 0.24, genislik: 0.27, ust: 0.3, yer: 'sol' },
            }),
            kare('05-vakit-sesi', {
                baslik: 'Vakit girince\nkendi sesiniz',
                alt: 'Her vakte ayrı ses seçin; dilerseniz kendi kaydınızı.',
                zemin: 'acik',
                vakit: 2,
                kaynak: ['41-vakit-sesi-secenekler.png', '40-vakit-sesi.png'],
                kirpAlt: 0.075,
                yakin: { x: 0.455, y: 0.08, w: 0.53, h: 0.5, genislik: 0.3, ust: 0.3 },
                iddialar: ['vakit-sesi', 'tablet'],
            }),
            // Ana ekrandaki gece zinciri: teheccud satiri cagri kutusunda buyutulur.
            kare('06-gece', {
                ...ORTAK.nafile,
                rozet: undefined,
                kaynak: ['02-ana-nafile-zinciri.png'],
                kirpAlt: 0.075,
                yakin: { x: 0.455, y: 0.595, w: 0.275, h: 0.23, genislik: 0.36, ust: 0.38 },
            }),
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
            kare('02-esleme', {
                baslik: 'Telefonla tek\nokutuşta eşleşin',
                alt: 'Konum telefondan gelir; bağlantı şifreli, yalnız ev ağınızda.',
                zemin: 'gece',
                vakit: 2,
                kaynak: ['02-esleme-qr.png'],
                iddialar: ['tv', 'tv-eslestirme'],
            }),
            // TV "vakit daraliyor" bandi: kilmamis bir uye varken son dakikalarda
            // (EvDurumu.bant). Karesi yok; metin uygulamanin gercek bicimi.
            kare('03-kildiniz', {
                baslik: 'Kıldığınızı\nTV de bilir',
                alt: 'Vakit daralırken kılmayan varsa panoda sessiz bir uyarı çıkar.',
                zemin: 'gece',
                vakit: 3,
                kaynak: ['04-pano-telefondan.png', '01-pano.png'],
                rozet: { ikon: 'zil', metin: 'İkindi vakti daralıyor · 12 dk', yer: 'sag', y: 0.08 },
                iddialar: ['tv', 'tv-kilindi'],
            }),
            kare('04-ramazan', {
                baslik: 'Ramazanda iftara\nkalan süre',
                alt: 'Sahur ve iftar sayacı panoda kendiliğinden belirir.',
                zemin: 'gece',
                vakit: 3,
                kaynak: ['04-pano-ramazan.png'],
                iddialar: ['tv'],
            }),
            kare('05-sehir', {
                baslik: 'Telefon yoksa\nşehri seçin',
                alt: 'Vakitler televizyonda hesaplanır; hesap ve internet gerekmez.',
                zemin: 'gece',
                vakit: 4,
                kaynak: ['08-il-secimi.png', '02-il-secimi.png'],
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
            kare('02-uyandirma', {
                baslik: 'Yanınızdakini uyandırmadan',
                zemin: 'gece',
                katmanlar: [{ cihaz: 'wearYuvarlak', kaynak: ['10-uyandirma.png'], yedekCizim: 'uyandirma' }],
                iddialar: ['wear-uyandirma'],
            }),
            kare('03-telefonsuz', { baslik: 'Telefon uzaktayken de hatırlatır', zemin: 'gece', kaynak: ['05-tile-bugun.png', '01-ana-ekran.png'], iddialar: ['wear-bagimsiz'] }),
            kare('04-kible', { baslik: 'Kıble bileğinizde', zemin: 'gece', kaynak: ['08-kible.png'], iddialar: ['wear-kible'] }),
            kare('05-tesbihat', { baslik: 'Tesbihatı bilekte sayın', zemin: 'gece', kaynak: ['04-tesbihat.png'], iddialar: ['wear-gosterim'] }),
        ],
    },
    // GELECEK: Apple TV hedefi (withNamazTV) etkin olunca. Ham kare Android TV ile ayni
    // olcude (1920x1080) -> kaynak klasorunu AYRI verin (ios-tv-kareleri).
    'apple-tv': {
        magaza: 'appstore',
        platform: 'ios',
        kosul: 'appleTv',
        boyut: { gen: 1920, yuk: 1080 },
        yon: 'yatay',
        cihaz: 'tv',
        yukleme: false,
        yuklenmezNedeni: 'Apple TV hedefi app.json\'da etkin:false.',
        kareler: [
            kare('01-pano', {
                baslik: 'Evde herkes\nvakti görsün',
                alt: 'Apple TV’niz vakit panosuna dönüşür.',
                zemin: 'gece',
                vakit: 1,
                kaynak: ['02-pano.png'],
                iddialar: ['apple-tv'],
            }),
        ],
    },
};

// iPhone "Dynamic Island (medium)" sinifi 1206x2622 App Store'da ZORUNLU (large 1320x2868
// tek basina karsilamaz). Ayni sahneler bu olcude YENIDEN cizilir (olcekleme degil):
// sablon her olcuyu genislige gore kurar, ham ekran goruntusu kaynak cozunurlukten okunur.
SETLER['iphone-orta'] = { ...SETLER.iphone, boyut: { gen: 1206, yuk: 2622 } };

/** Magaza mockup'larinin eski `--platform` adlari -> set. */
const PLATFORM_SETI = { ios: 'iphone', ipad: 'ipad', android: 'play-telefon' };

module.exports = { SETLER, CIHAZ_TURLERI, ANDROID_OZEL_IDDIALAR, APPLE_WATCH_IDDIALARI, PLATFORM_SETI, SABAH_ALARMI };
