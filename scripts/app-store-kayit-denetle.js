/**
 * App Store mağaza kaydı çevirilerini denetler: alanlar dolu mu, karakter sınırı aşılıyor mu,
 * uygulama adı ve depo bağlantısı korunmuş mu, anahtar kelimeler kurala uygun mu.
 *
 * Kullanım: node scripts/app-store-kayit-denetle.js [uygulama dili ...]   (boş = hepsi)
 * Çıkış kodu: 0 temiz, 1 hata var.
 */
const fs = require('fs');
const path = require('path');
const { ASC_DILLERI, SINIRLAR } = require('./app-store-dilleri');

const KLASOR = path.resolve(__dirname, '..', 'docs/app-store/app-store-kayitlari');
const DEPO = 'https://github.com/furkanisikay/namazakisi';
const AD = 'Namaz Akışı';

/** Apple karakter sayar (kod noktası). */
const uzunluk = (s) => [...s].length;

function kayitOku(dil) {
    const dosya = path.join(KLASOR, dil + '.json');
    if (!fs.existsSync(dosya)) return { hata: ['dosya yok: ' + path.relative(process.cwd(), dosya)] };
    try {
        return { kayit: JSON.parse(fs.readFileSync(dosya, 'utf8')) };
    } catch (e) {
        return { hata: ['JSON okunamadı: ' + e.message] };
    }
}

function kayitDenetle(kayit) {
    const hatalar = [];
    for (const [alan, sinir] of Object.entries(SINIRLAR)) {
        const deger = kayit[alan];
        if (typeof deger !== 'string' || !deger.trim()) {
            hatalar.push(alan + ' boş');
            continue;
        }
        if (uzunluk(deger) > sinir) hatalar.push(alan + ' ' + uzunluk(deger) + '/' + sinir);
        if (deger !== deger.trim()) hatalar.push(alan + ' başında ya da sonunda boşluk var');
    }
    const fazla = Object.keys(kayit).filter((k) => !(k in SINIRLAR));
    if (fazla.length) hatalar.push('beklenmeyen alan: ' + fazla.join(', '));
    if (typeof kayit.name === 'string' && !kayit.name.startsWith(AD)) hatalar.push('ad "' + AD + '" ile başlamalı');
    if (typeof kayit.description === 'string' && !kayit.description.includes(DEPO)) hatalar.push('açıklamada depo bağlantısı yok');
    if (typeof kayit.keywords === 'string' && /\s,|,\s|\n/.test(kayit.keywords)) hatalar.push('anahtar kelimelerde virgül çevresinde boşluk var');
    const hepsi = Object.values(kayit).filter((v) => typeof v === 'string').join('\n');
    if (/[—]/.test(hepsi)) hatalar.push('uzun çizgi (—) kullanılmış');
    return hatalar;
}

function hepsiniDenetle(diller) {
    const sonuc = {};
    for (const dil of diller) {
        const { kayit, hata } = kayitOku(dil);
        sonuc[dil] = hata || kayitDenetle(kayit);
    }
    return sonuc;
}

if (require.main === module) {
    const istenen = process.argv.slice(2);
    const diller = istenen.length ? istenen : Object.keys(ASC_DILLERI);
    const sonuc = hepsiniDenetle(diller);
    let hataVar = false;
    for (const [dil, hatalar] of Object.entries(sonuc)) {
        if (hatalar.length) {
            hataVar = true;
            console.log('HATA ' + dil + ': ' + hatalar.join(' | '));
        } else {
            const { kayit } = kayitOku(dil);
            console.log('tamam ' + dil + ': ' + Object.keys(SINIRLAR).map((k) => k + ' ' + uzunluk(kayit[k])).join(', '));
        }
    }
    process.exit(hataVar ? 1 : 0);
}

module.exports = { KLASOR, kayitOku, kayitDenetle, hepsiniDenetle, uzunluk };
