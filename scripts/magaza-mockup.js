#!/usr/bin/env node
/**
 * Magaza mockup'larini uretir: ham ekran goruntusunu baslik ve aciklamayla
 * birlikte tasarlanmis bir tuvale yerlestirir ve Chromium ile PNG'ye render eder.
 *
 * Kullanim:
 *   node scripts/magaza-mockup.js <kareler> <cikis> --platform ios|android
 *
 * Tarayici: TARAYICI ortam degiskeni (varsayilan: Windows'ta Edge, digerlerinde
 * google-chrome). Harici bagimlilik yok; headless ekran goruntusu yeterli.
 *
 * Boyutlar:
 *   ios      1320x2868  (iPhone 6.9", App Store'un zorunlu seti)
 *   android  1080x1920  (Play telefon karesinde en-boy orani en fazla 2:1)
 *
 * Metinler iki magazada AYNI: iki kanalda farkli vaat vermeyelim.
 * Metin kurallari (stop-slop + humanizer): tire yok, "X degil, Y" karsitligi
 * yok, uclu slogan yok, eylemi kullanici yapar. Degistirirken bunlari koruyun.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BOYUT = {
    ios: { gen: 1320, yuk: 2868, olcek: 1 },
    android: { gen: 1080, yuk: 1920, olcek: 1080 / 1320 },
};

// Marka renkleri temadan (src/core/theme/temalar.ts)
const YESIL = '#4CAF50';
const YESIL_KOYU = '#388E3C';

const KARELER = [
    {
        dosya: '01-ana-ekran.png',
        baslik: 'Sıradaki vakit\nana ekranda',
        alt: 'Kalan süreyi saniye saniye görür, kıldığınız namazı tek dokunuşla işaretlersiniz.',
        zemin: 'acik',
    },
    {
        dosya: '02-muhafiz-zaman-seridi.png',
        baslik: 'Vakit çıkmadan\nsizi uyarır',
        alt: 'Vakit daraldıkça uyarı sertleşir. Zamanlamayı siz belirlersiniz.',
        zemin: 'acik',
    },
    {
        dosya: '03-adim-detay.png',
        baslik: 'Hatırlatma\nsesli de gelebilir',
        alt: 'Anonsu telefonunuzun Türkçe sesi okur. Metni kendiniz yazarsınız.',
        zemin: 'acik',
    },
    {
        dosya: '04-seri.png',
        baslik: 'Serinizi büyütün',
        alt: 'Tam kıldığınız her günü haritada bir yıldızla görürsünüz.',
        zemin: 'koyu',
    },
    {
        dosya: '05-kible.png',
        baslik: 'Kıbleyi\npusulada bulun',
        alt: 'Kâbe yönünü internet olmadan, derece olarak görürsünüz.',
        zemin: 'acik',
    },
    // 06-08 yalniz Play'de (8 kare sinirini doldurmak icin); iOS seti 5 karedir.
    {
        dosya: '06-akis-onizleme.png',
        baslik: 'Bugünkü uyarıları\nönceden görün',
        alt: 'Akış önizlemesi, muhafızın sizi bugün hangi saatte nasıl uyaracağını listeler.',
        zemin: 'acik',
    },
    {
        dosya: '07-kaza.png',
        baslik: 'Kaza borcunuzu\ntakip edin',
        alt: 'Kıldığınız her kazayı tek dokunuşla düşer, kalanı her an görürsünüz.',
        zemin: 'acik',
    },
    {
        dosya: '08-istatistik.png',
        baslik: 'Haftanızı\ngrafikte izleyin',
        alt: 'Hangi gün kaç vakit kıldığınızı günlük, haftalık ve aylık dökümde görürsünüz.',
        zemin: 'acik',
    },
];

/**
 * Yazi tipi HER ortamda ayni olmali: mockup'lar Windows'ta (Edge) ve CI'da
 * (Linux Chrome) uretiliyor. Sistem fontuna birakilsaydi Windows'ta Segoe UI,
 * Linux'ta baska bir font cikar ve iki magazanin gorselleri farkli gorunurdu.
 * Inter Turkce karakterleri tam destekler.
 */
const FONT_BAGLANTISI =
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=block" rel="stylesheet">';
const FONT_AILESI = '"Inter","Segoe UI",system-ui,sans-serif';

const dosyaUrl = (p) => 'file:///' + p.replace(/\\/g, '/');

/**
 * Play "one cikan gorsel" (1024x500). Listenin en ustunde, magaza tanitimlarinda
 * ve paylasimlarda gorunur; eskisi yalnizca kirpilmis bir ekran goruntusuydu,
 * uygulama adi bile yoktu.
 */
function oneCikanSayfa(ikonYolu, kareYolu) {
    return `<!doctype html><html><head><meta charset="utf-8">${FONT_BAGLANTISI}<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:1024px; height:500px; overflow:hidden; }
  body { font-family:${FONT_AILESI}; position:relative;
         background:linear-gradient(120deg, #F2F9F3 0%, #FFFFFF 55%, #E8F5E9 100%); }
  .hale { position:absolute; inset:0;
          background:radial-gradient(45% 70% at 78% 40%, rgba(76,175,80,0.20) 0%, rgba(76,175,80,0) 70%); }
  .sol { position:absolute; left:72px; top:0; bottom:0; width:520px; display:flex; flex-direction:column; justify-content:center; }
  /* Ikon dosyasi beyaz zemin + golge iceriyor; yalniz yesil kare kirpilir. */
  .ikon { width:112px; height:112px; border-radius:26px; overflow:hidden; position:relative;
          box-shadow:0 14px 30px rgba(22,48,26,0.18); }
  .ikon img { position:absolute; width:${Math.round((112 * 1024) / 685)}px; left:-${Math.round((170 * 112) / 685)}px; top:-${Math.round((172 * 112) / 685)}px; }
  h1 { margin-top:28px; font-size:64px; line-height:1.05; font-weight:800; letter-spacing:-1.5px; color:#16301A; }
  p { margin-top:14px; font-size:28px; line-height:1.35; color:#56655A; }
  .serit { margin-top:22px; width:72px; height:7px; border-radius:99px; background:linear-gradient(90deg, ${YESIL}, ${YESIL_KOYU}); }
  .cihaz { position:absolute; right:84px; top:46px; width:300px; padding:8px; background:#0E0E11; border-radius:44px;
           box-shadow:0 30px 60px rgba(11,25,14,0.25); }
  .pencere { border-radius:37px; overflow:hidden; }
  .pencere img { display:block; width:100%; }
</style></head><body>
  <div class="hale"></div>
  <div class="sol">
    <div class="ikon"><img src="${dosyaUrl(ikonYolu)}"></div>
    <h1>Namaz Akışı</h1>
    <p>Vakit çıkmadan sizi uyarır.</p>
    <div class="serit"></div>
  </div>
  <div class="cihaz"><div class="pencere"><img src="${dosyaUrl(kareYolu)}"></div></div>
</body></html>`;
}

function sayfa(kare, gorselYolu, b) {
    const k = b.olcek;
    const px = (v) => Math.round(v * k) + 'px';
    const koyu = kare.zemin === 'koyu';
    const zeminArka = koyu
        ? 'linear-gradient(180deg, #0B1220 0%, #101A2E 55%, #16233D 100%)'
        : 'linear-gradient(180deg, #F2F9F3 0%, #FFFFFF 60%)';
    const baslikRenk = koyu ? '#FFFFFF' : '#16301A';
    const altRenk = koyu ? 'rgba(255,255,255,0.74)' : '#56655A';
    const hale = koyu
        ? 'radial-gradient(60% 45% at 78% 12%, rgba(76,175,80,0.28) 0%, rgba(76,175,80,0) 70%)'
        : 'radial-gradient(58% 42% at 80% 10%, rgba(76,175,80,0.22) 0%, rgba(76,175,80,0) 70%)';

    const cihazGen = 1012;

    return `<!doctype html><html><head><meta charset="utf-8">${FONT_BAGLANTISI}<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${b.gen}px; height:${b.yuk}px; overflow:hidden; }
  body { background:${zeminArka}; font-family:${FONT_AILESI}; position:relative; }
  .hale { position:absolute; inset:0; background:${hale}; }
  .icerik { position:relative; height:100%; display:flex; flex-direction:column; align-items:center; }
  h1 { margin-top:${px(150)}; font-size:${px(104)}; line-height:1.14; font-weight:700; letter-spacing:${px(-2.5)};
       color:${baslikRenk}; text-align:center; white-space:pre-line; }
  p { margin-top:${px(38)}; max-width:${px(1040)}; font-size:${px(46)}; line-height:1.45; color:${altRenk}; text-align:center; }
  .serit { margin-top:${px(48)}; width:${px(132)}; height:${px(10)}; border-radius:99px; background:linear-gradient(90deg, ${YESIL}, ${YESIL_KOYU}); }
  .cihaz { margin-top:${px(80)}; width:${px(cihazGen)}; padding:${px(14)}; background:#0E0E11; border-radius:${px(104)};
           box-shadow:0 ${px(60)} ${px(120)} rgba(11,25,14,${koyu ? '0.55' : '0.22'}), 0 ${px(8)} ${px(24)} rgba(11,25,14,${koyu ? '0.4' : '0.12'}); }
  .pencere { border-radius:${px(92)}; overflow:hidden; }
  .pencere img { display:block; width:100%; }
</style></head><body>
  <div class="hale"></div>
  <div class="icerik">
    <h1>${kare.baslik}</h1>
    <p>${kare.alt}</p>
    <div class="serit"></div>
    <div class="cihaz"><div class="pencere"><img src="file:///${gorselYolu.replace(/\\/g, '/')}"></div></div>
  </div>
</body></html>`;
}

function tarayiciBul() {
    if (process.env.TARAYICI) return process.env.TARAYICI;
    if (process.platform === 'win32') return 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return 'google-chrome';
}

const argv = process.argv.slice(2);
const kaynak = argv[0];
const cikis = argv[1];
const pi = argv.indexOf('--platform');
const platform = pi >= 0 ? argv[pi + 1] : 'ios';
if (!kaynak || !cikis || !BOYUT[platform]) {
    console.error('Kullanim: node scripts/magaza-mockup.js <kareler> <cikis> --platform ios|android');
    process.exit(1);
}
fs.mkdirSync(cikis, { recursive: true });
const TARAYICI = tarayiciBul();

/**
 * HTML'i PNG'ye cizer. `--virtual-time-budget`: ekran goruntusu `load`
 * olayinda alinir ama web fontu o anda henuz inmemis olabilir; butce, fontun
 * yuklenmesini bekletir. Yoksa kare yedek fontla cikar (sessiz hata).
 */
function ciz(html, hedef, gen, yuk) {
    const dosya = path.resolve(cikis, path.basename(hedef, '.png') + '.html');
    fs.writeFileSync(dosya, html, 'utf8');
    execFileSync(
        TARAYICI,
        [
            '--headless=new',
            '--disable-gpu',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            '--virtual-time-budget=8000',
            `--window-size=${gen},${yuk}`,
            `--screenshot=${hedef}`,
            dosyaUrl(dosya),
        ],
        { stdio: 'pipe' }
    );
    fs.unlinkSync(dosya);
    console.log(`  ${path.basename(hedef)} -> ${(fs.statSync(hedef).size / 1024).toFixed(0)} KB`);
}

for (const kare of KARELER) {
    const gorsel = path.resolve(kaynak, kare.dosya);
    if (!fs.existsSync(gorsel)) {
        console.error(`  atlandi (yok): ${kare.dosya}`);
        continue;
    }
    const b = BOYUT[platform];
    ciz(sayfa(kare, gorsel, b), path.resolve(cikis, kare.dosya), b.gen, b.yuk);
}

// --one-cikan: Play icin 1024x500 one cikan gorseli de uret (muhafiz karesinden).
if (argv.includes('--one-cikan')) {
    const kare = path.resolve(kaynak, '02-muhafiz-zaman-seridi.png');
    const ikon = path.resolve(__dirname, '..', 'assets', 'icon.png');
    if (!fs.existsSync(kare)) {
        console.error('  one cikan atlandi: 02-muhafiz-zaman-seridi.png yok');
    } else {
        ciz(oneCikanSayfa(ikon, kare), path.resolve(cikis, 'one-cikan.png'), 1024, 500);
    }
}
