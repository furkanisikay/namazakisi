#!/usr/bin/env node
/**
 * Camideyim haritasındaki cami işaretinin BEYAZ siluet ikonu (`assets/harita/cami-ikonu.png`).
 *
 * Harita ikonu renkli dairenin ÜSTÜNE çizilir (dairenin rengi tema token'ından gelir:
 * cami / sizin yeriniz / cami değil); ikonun kendisi her temada beyazdır, bu yüzden SDF
 * gerekmez. Kubbe + kaide + minare, 4× süper örnekleme ile kenar yumuşatma.
 *
 * Yeniden üretmek: `node scripts/harita/cami-ikonu-uret.js` (pngjs, Expo zincirinden
 * transitif gelir; doğrudan bağımlılık EKLENMEDİ — betik yalnız varlık değişirse koşar).
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BOYUT = 64;
const SS = 4;

/** (x, y) [0, 64) koordinatında siluetin içinde mi? */
function icinde(x, y) {
    // Kaide (ana gövde)
    if (x >= 12 && x <= 44 && y >= 34 && y <= 56) return true;
    // Kubbe: merkez (28, 34), yarıçap 15, üst yarı
    if (y <= 34 && (x - 28) ** 2 + (y - 34) ** 2 <= 15 ** 2) return true;
    // Kubbe alemi (ince çubuk + küçük top)
    if (x >= 27 && x <= 29 && y >= 13 && y <= 19) return true;
    if ((x - 28) ** 2 + (y - 12) ** 2 <= 2.2 ** 2) return true;
    // Minare gövdesi + şerefe
    if (x >= 47 && x <= 53 && y >= 18 && y <= 56) return true;
    if (x >= 45.5 && x <= 54.5 && y >= 26 && y <= 28.5) return true;
    // Minare külahı (üçgen, tepe 50,6)
    if (y >= 6 && y <= 18) {
        const yari = ((y - 6) / 12) * 3.5;
        if (Math.abs(x - 50) <= yari) return true;
    }
    return false;
}

const png = new PNG({ width: BOYUT, height: BOYUT });
for (let y = 0; y < BOYUT; y++) {
    for (let x = 0; x < BOYUT; x++) {
        let say = 0;
        for (let sy = 0; sy < SS; sy++) {
            for (let sx = 0; sx < SS; sx++) {
                if (icinde(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS)) say++;
            }
        }
        const i = (y * BOYUT + x) * 4;
        png.data[i] = 255;
        png.data[i + 1] = 255;
        png.data[i + 2] = 255;
        png.data[i + 3] = Math.round((say / (SS * SS)) * 255);
    }
}

const hedef = path.join(__dirname, '..', '..', 'assets', 'harita', 'cami-ikonu.png');
fs.mkdirSync(path.dirname(hedef), { recursive: true });
fs.writeFileSync(hedef, PNG.sync.write(png));
console.log(`yazıldı: ${path.relative(process.cwd(), hedef)}`);
