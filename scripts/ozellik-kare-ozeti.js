#!/usr/bin/env node
/**
 * Ozellik turu karelerinin ozeti (Markdown) — GitHub adim ozetine yazilir.
 *
 * Kullanim: node scripts/ozellik-kare-ozeti.js <kok-klasor> <android|ios>
 *
 * Her alt klasor (ör. `telefon-acik`, `telefon-koyu`, `tablet-acik`, `iphone-acik`)
 * icin dosya adi + piksel boyutu + KB listelenir. Beklenen kare listesi
 * akislarin KENDISINDEN cikarilir (Android: Maestro `takeScreenshot: ozk/…`
 * satirlari; iOS: `simulator-ozellik-cek.js` icindeki `cek('…')` cagrilari) —
 * elle ikinci bir liste tutulmaz. Eksik kare `UYARI:` satiri olur.
 *
 * Hat "success" der ama kare eksik olabilir (bir akis dusse de digerleri
 * surer); bu ozet o farki gorunur kilar. Cikis kodu daima 0.
 */
const fs = require('fs');
const path = require('path');

const [kok, platform] = process.argv.slice(2);
if (!kok || !['android', 'ios'].includes(platform)) {
    console.error('Kullanim: ozellik-kare-ozeti.js <kok> <android|ios>');
    process.exit(0);
}

function beklenenler() {
    if (platform === 'android') {
        const dizin = path.join(__dirname, 'maestro', 'ozellik');
        const adlar = new Set();
        for (const f of fs.readdirSync(dizin).filter((d) => d.endsWith('.yaml'))) {
            for (const m of fs.readFileSync(path.join(dizin, f), 'utf8').matchAll(/takeScreenshot:\s*ozk\/(\S+)/g)) {
                adlar.add(m[1]);
            }
        }
        return [...adlar].sort();
    }
    const betik = fs.readFileSync(path.join(__dirname, 'simulator-ozellik-cek.js'), 'utf8');
    return [...new Set([...betik.matchAll(/\bcek\('(\d{2}-[^']+)'\)/g)].map((m) => m[1]))].sort();
}

function boyut(dosya) {
    try {
        const b = fs.readFileSync(dosya);
        return { wh: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`, kb: (b.length / 1024).toFixed(0) };
    } catch {
        return { wh: '?', kb: '?' };
    }
}

const satirlar = [`## ${platform === 'ios' ? 'iOS' : 'Android'} özellik turu kareleri`, ''];
const beklenen = beklenenler();
const altlar = fs.existsSync(kok)
    ? fs.readdirSync(kok, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : [];

if (!altlar.length) {
    satirlar.push(`UYARI: \`${kok}\` altinda hic kare klasoru yok.`);
}
for (const alt of altlar) {
    const dizin = path.join(kok, alt);
    const kareler = fs.readdirSync(dizin).filter((f) => f.endsWith('.png')).sort();
    satirlar.push(`### ${alt} — ${kareler.length}/${beklenen.length} kare`, '', '| Kare | Boyut | KB |', '|---|---|---|');
    for (const f of kareler) {
        const { wh, kb } = boyut(path.join(dizin, f));
        satirlar.push(`| ${f} | ${wh} | ${kb} |`);
    }
    satirlar.push('');
    for (const ad of beklenen) {
        if (!kareler.includes(`${ad}.png`)) satirlar.push(`UYARI: eksik kare ${alt}/${ad}.png  `);
    }
    satirlar.push('');
}
console.log(satirlar.join('\n'));
