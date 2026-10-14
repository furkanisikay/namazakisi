#!/usr/bin/env node
/**
 * Saat (Wear OS) ve TV karelerinin ozeti (Markdown) — GitHub adim ozetine yazilir.
 *
 * Kullanim: node scripts/cihaz-kare-ozeti.js <kok-klasor> <saat|tv>
 *
 * Beklenen kare listesi hat betiginin KENDISINDEN cikarilir (`kare NN-ad` cagrilari;
 * `scripts/saat-kare-hatti.sh`, `scripts/tv-kare-hatti.sh`) — ikinci liste tutulmaz.
 * Her kare icin piksel boyutu + KB yazilir ve Play gereksinimi denetlenir:
 *   saat: 1:1 kare, en az 384x384;  tv: 1920x1080 (16:9).
 * Eksik ya da gereksinimi tutmayan kare `UYARI:` satiri olur. Cikis kodu daima 0
 * (hat "success" der ama kare eksik olabilir; bu ozet o farki gorunur kilar).
 */
const fs = require('fs');
const path = require('path');

const [kok, tur] = process.argv.slice(2);
if (!kok || !['saat', 'tv'].includes(tur)) {
    console.error('Kullanim: cihaz-kare-ozeti.js <kok> <saat|tv>');
    process.exit(0);
}

const betik = fs.readFileSync(path.join(__dirname, `${tur}-kare-hatti.sh`), 'utf8');
// Yorum disindaki satirlarda gecen her "NN-ad" belirteci bir kare adidir
// (`kare 01-ana-ekran`, `tile_goster BugunTileServisi 05-tile-bugun`).
const beklenen = [
    ...new Set(
        betik
            .split('\n')
            .filter((s) => !s.trim().startsWith('#'))
            .flatMap((s) => [...s.matchAll(/(?:^|\s)(\d{2}-[a-z][a-z0-9-]*)(?=\s|$)/g)].map((m) => m[1]))
    ),
].sort();

function boyut(dosya) {
    try {
        const b = fs.readFileSync(dosya);
        return { g: b.readUInt32BE(16), y: b.readUInt32BE(20), kb: (b.length / 1024).toFixed(0) };
    } catch {
        return null;
    }
}

function gereksinim(b) {
    if (!b) return 'okunamadi';
    if (tur === 'saat') return b.g === b.y && b.g >= 384 ? null : 'Play: 1:1 ve en az 384x384 olmali';
    return b.g === 1920 && b.y === 1080 ? null : 'Play: 1920x1080 olmali';
}

const satirlar = [`## ${tur === 'saat' ? 'Wear OS saat' : 'Android TV'} kareleri`, ''];
const klasorler = !fs.existsSync(kok)
    ? []
    : tur === 'tv'
      ? [kok]
      : fs
            .readdirSync(kok, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => path.join(kok, d.name))
            .sort();

if (!klasorler.length) satirlar.push(`UYARI: \`${kok}\` altinda hic kare yok.`);
for (const dizin of klasorler) {
    const kareler = fs.existsSync(dizin) ? fs.readdirSync(dizin).filter((f) => f.endsWith('.png')).sort() : [];
    satirlar.push(`### ${path.relative(path.dirname(kok), dizin)} (${kareler.length}/${beklenen.length})`, '');
    for (const f of kareler) {
        const b = boyut(path.join(dizin, f));
        const sorun = gereksinim(b);
        satirlar.push(`- ${f} — ${b ? `${b.g}x${b.y}, ${b.kb} KB` : '?'}${sorun ? ` — UYARI: ${sorun}` : ''}`);
    }
    for (const ad of beklenen) {
        if (!kareler.includes(`${ad}.png`)) satirlar.push(`- UYARI: ${ad}.png eksik`);
    }
    satirlar.push('');
}
console.log(satirlar.join('\n'));
