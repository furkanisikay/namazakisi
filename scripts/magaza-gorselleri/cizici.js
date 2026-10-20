/**
 * HTML -> PNG cizici (headless Chromium). Magaza mockup'lari ve pazarlama
 * gorselleri AYNI cizicidan gecer; ikinci bir render sistemi yoktur.
 *
 * Tarayici: TARAYICI ortam degiskeni (varsayilan: Windows'ta Edge, macOS'ta Chrome,
 * digerlerinde google-chrome). Harici npm bagimliligi yok.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const dosyaUrl = (p) => 'file:///' + path.resolve(p).replace(/\\/g, '/');

function tarayiciBul() {
    if (process.env.TARAYICI) return process.env.TARAYICI;
    if (process.platform === 'win32') return 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return 'google-chrome';
}

/**
 * HTML'i PNG'ye cizer. `--virtual-time-budget`: ekran goruntusu `load`
 * olayinda alinir ama web fontu o anda henuz inmemis olabilir; butce, fontun
 * yuklenmesini bekletir. Yoksa kare yedek fontla cikar (sessiz hata).
 * Sayfanin `body`'si daima OPAK zemin tasir: magazalar alfa kanalli PNG'yi reddeder.
 */
function ciz(html, hedef, gen, yuk, tarayici = tarayiciBul()) {
    fs.mkdirSync(path.dirname(hedef), { recursive: true });
    // Eski dosya kalirsa "belirdi ve durulmus" beklemesi onu yeni cikti sanar.
    fs.rmSync(hedef, { force: true });
    const gecici = path.join(path.dirname(hedef), '.' + path.basename(hedef, '.png') + '.html');
    fs.writeFileSync(gecici, html, 'utf8');
    // Ayri profil: acik bir tarayici penceresi varsa headless cagri ona baglanip
    // ekran goruntusu YAZMADAN donebiliyor (Windows Edge'de yasandi).
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'magaza-cizici-'));
    try {
        execFileSync(
            tarayici,
            [
                '--headless=new',
                '--disable-gpu',
                '--hide-scrollbars',
                '--force-device-scale-factor=1',
                '--allow-file-access-from-files',
                '--no-first-run',
                '--no-default-browser-check',
                `--user-data-dir=${profil}`,
                '--virtual-time-budget=9000',
                `--window-size=${gen},${yuk}`,
                `--screenshot=${path.resolve(hedef)}`,
                dosyaUrl(gecici),
            ],
            { stdio: 'pipe' }
        );
        // Windows'ta msedge.exe baslaticisi asil sureci ayirip HEMEN doner; ekran
        // goruntusu birkac saniye sonra yazilir. Dosya belirip boyutu durulana dek bekle.
        const uyu = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
        let onceki = -1;
        for (let i = 0; i < 120; i++) {
            const boy = fs.existsSync(hedef) ? fs.statSync(hedef).size : -1;
            if (boy > 0 && boy === onceki) break;
            onceki = boy;
            uyu(250);
        }
    } finally {
        fs.unlinkSync(gecici);
        try {
            fs.rmSync(profil, { recursive: true, force: true });
        } catch {
            // Tarayici profili hala kilitliyse gecici klasor kalir; zararsiz.
        }
    }
    if (!fs.existsSync(hedef)) throw new Error('tarayici ekran goruntusu yazmadi: ' + hedef);
    console.log(`  ${path.relative(process.cwd(), hedef)} -> ${(fs.statSync(hedef).size / 1024).toFixed(0)} KB`);
}

/** PNG basligindan genislik/yukseklik (IHDR) okur; PNG degilse null. */
function pngBoyutu(dosya) {
    try {
        const fd = fs.openSync(dosya, 'r');
        const b = Buffer.alloc(24);
        fs.readSync(fd, b, 0, 24, 0);
        fs.closeSync(fd);
        if (b.readUInt32BE(0) !== 0x89504e47) return null;
        return { gen: b.readUInt32BE(16), yuk: b.readUInt32BE(20) };
    } catch {
        return null;
    }
}

module.exports = { ciz, tarayiciBul, dosyaUrl, pngBoyutu };
