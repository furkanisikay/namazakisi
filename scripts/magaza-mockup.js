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
];

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

    return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${b.gen}px; height:${b.yuk}px; overflow:hidden; }
  body { background:${zeminArka}; font-family:"Segoe UI Variable Display","Segoe UI","Inter",system-ui,sans-serif; position:relative; }
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

for (const kare of KARELER) {
    const gorsel = path.resolve(kaynak, kare.dosya);
    if (!fs.existsSync(gorsel)) {
        console.error(`  atlandi (yok): ${kare.dosya}`);
        continue;
    }
    const b = BOYUT[platform];
    const html = path.resolve(cikis, kare.dosya.replace('.png', '.html'));
    fs.writeFileSync(html, sayfa(kare, gorsel, b), 'utf8');
    const hedef = path.resolve(cikis, kare.dosya);
    execFileSync(
        TARAYICI,
        [
            '--headless=new',
            '--disable-gpu',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            `--window-size=${b.gen},${b.yuk}`,
            `--screenshot=${hedef}`,
            `file:///${html.replace(/\\/g, '/')}`,
        ],
        { stdio: 'pipe' }
    );
    fs.unlinkSync(html);
    console.log(`  ${kare.dosya} -> ${(fs.statSync(hedef).size / 1024).toFixed(0)} KB`);
}
