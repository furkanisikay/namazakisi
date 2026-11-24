/**
 * Play mağaza kaydı çevirilerini denetler: dosya var mı, alanlar dolu mu, karakter sınırı aşılıyor mu,
 * değişmemesi gereken parçalar (uygulama adı, depo bağlantısı) korunmuş mu.
 *
 * Kullanım: node scripts/play-kayit-denetle.js [playKodu ...]   (boş = hepsi)
 * Çıkış kodu: 0 temiz, 1 hata var.
 */
const fs = require('fs');
const path = require('path');
const { PLAY_DILLERI, SINIRLAR } = require('./play-kayit-dilleri');

const KLASOR = path.resolve(__dirname, '..', 'docs/app-store/play-kayitlari');
const DEPO = 'https://github.com/furkanisikay/namazakisi';
const AD = 'Namaz Akışı';

/** Play karakter sayar (kod noktası), UTF-16 birimi değil. */
const uzunluk = (s) => [...s].length;

function kayitOku(playKodu) {
    const dosya = path.join(KLASOR, playKodu + '.json');
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
    if (typeof kayit.title === 'string' && !kayit.title.startsWith(AD)) hatalar.push('başlık "' + AD + '" ile başlamalı');
    if (typeof kayit.fullDescription === 'string') {
        if (!kayit.fullDescription.includes(DEPO)) hatalar.push('tam açıklamada depo bağlantısı yok');
        if (/[—]/.test(kayit.fullDescription + kayit.shortDescription)) hatalar.push('uzun çizgi (—) kullanılmış');
    }
    return hatalar;
}

function hepsiniDenetle(kodlar) {
    const sonuc = {};
    for (const kod of kodlar) {
        const { kayit, hata } = kayitOku(kod);
        sonuc[kod] = hata || kayitDenetle(kayit);
    }
    return sonuc;
}

if (require.main === module) {
    const istenen = process.argv.slice(2);
    const kodlar = istenen.length ? istenen : Object.values(PLAY_DILLERI);
    const sonuc = hepsiniDenetle(kodlar);
    let hataVar = false;
    for (const [kod, hatalar] of Object.entries(sonuc)) {
        if (hatalar.length) {
            hataVar = true;
            console.log('HATA ' + kod + ': ' + hatalar.join(' | '));
        } else {
            const { kayit } = kayitOku(kod);
            console.log(
                'tamam ' + kod + ': başlık ' + uzunluk(kayit.title) + ', kısa ' + uzunluk(kayit.shortDescription) + ', tam ' + uzunluk(kayit.fullDescription),
            );
        }
    }
    process.exit(hataVar ? 1 : 0);
}

module.exports = { KLASOR, kayitOku, kayitDenetle, hepsiniDenetle, uzunluk };
