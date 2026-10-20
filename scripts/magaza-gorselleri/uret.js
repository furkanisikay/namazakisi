#!/usr/bin/env node
/**
 * Magaza PAZARLAMA gorsellerini ham ekran goruntulerinden uretir (her hat kosusunda
 * yeniden: kareler degisince gorseller kendiliginden guncellenir).
 *
 * Kullanim:
 *   node scripts/magaza-gorselleri/uret.js <ham-kare-klasoru> <cikis>
 *   node scripts/magaza-gorselleri/uret.js --kaynak kareler --kaynak kareler-ozellik --cikis pazarlama \
 *        [--set iphone,play-telefon] [--kosul appleWatchYayinda] [--duz] [--one-cikan]
 *
 * Ham kare, ADI (01-ana-ekran.png ...) ve BOYUTU (setler.js > CIHAZ_TURLERI) ile
 * bulunur: ayni klasorde iPhone ve Android kareleri karisik olsa da dogru cihaz secilir.
 * Birden cok aday varsa acik tema, sonra en yeni dosya kazanir.
 *
 * Cikti: <cikis>/<set>/<NN-ad>.png (yukleyiciler ust duzeydeki NN-*.png'leri okur).
 * `magazaDisi` kareler <cikis>/<set>/magaza-disi/ altina yazilir (yuklenmez).
 * `--duz`: tek set dogrudan <cikis>/ altina (eski mockup klasoru duzeni).
 * Ham karesi bulunmayan kare ATLANIR ve ozette "eksik" olarak listelenir.
 */
const fs = require('fs');
const path = require('path');
const { ciz, dosyaUrl, pngBoyutu, tarayiciBul } = require('./cizici');
const { SETLER, CIHAZ_TURLERI } = require('./setler');
const { sayfaUret, oneCikanSayfa } = require('./sablon');

const ATLANAN_YOLLAR = /takeScreenshot|[\\/](mockup|pazarlama|agac|android-maestro-ciktisi)[\\/]/i;

function pngleriTara(kokler) {
    const liste = [];
    const gez = (d) => {
        let girdiler;
        try {
            girdiler = fs.readdirSync(d, { withFileTypes: true });
        } catch {
            return;
        }
        for (const g of girdiler) {
            const tam = path.join(d, g.name);
            if (g.isDirectory()) gez(tam);
            else if (/\.png$/i.test(g.name) && !ATLANAN_YOLLAR.test(tam)) {
                const boyut = pngBoyutu(tam);
                if (boyut) liste.push({ yol: tam, ad: g.name, boyut, mtime: fs.statSync(tam).mtimeMs });
            }
        }
    };
    kokler.forEach((k) => gez(path.resolve(k)));
    return liste;
}

/** Aday siralamasi: acik tema > koyu; sonra en yeni. */
function adayPuani(a) {
    const yol = a.yol.toLowerCase();
    return (yol.includes('koyu') ? 0 : 2) + (yol.includes('acik') ? 1 : 0);
}

function kareBul(dizin, cihaz, adlar) {
    const uygun = CIHAZ_TURLERI[cihaz];
    if (!uygun) throw new Error('bilinmeyen cihaz turu: ' + cihaz);
    for (const ad of adlar) {
        const adaylar = dizin.filter((p) => p.ad === ad && uygun(p.boyut.gen, p.boyut.yuk));
        if (adaylar.length) {
            adaylar.sort((x, y) => adayPuani(y) - adayPuani(x) || y.mtime - x.mtime);
            const s = adaylar[0];
            return { cihaz, yol: s.yol, url: dosyaUrl(s.yol), boyut: s.boyut };
        }
    }
    return null;
}

/** Bir karenin ihtiyac duydugu ham gorselleri cozer; eksik varsa null. */
function gorselleriCoz(dizin, set, kare) {
    // Ham kare istemeyen kare (takvim cizimi gibi): bos katman listesi.
    const katmanlar = kare.katmanlar || (kare.kaynak ? [{ cihaz: set.cihaz, kaynak: kare.kaynak }] : []);
    const bulunan = [];
    const eksik = [];
    for (const k of katmanlar) {
        const g = kareBul(dizin, k.cihaz, k.kaynak);
        if (g) bulunan.push(g);
        else eksik.push(`${k.cihaz}:${k.kaynak.join('|')}`);
    }
    // Kolajda bir cihaz eksikse o cihaz cizilmez; tek cihazli karede eksik = atla.
    const zorunluEksik = kare.yerlesim === 'kolaj' ? bulunan.length === 0 : eksik.length > 0;
    return { gorseller: bulunan, eksik, atla: zorunluEksik };
}

function argumanlar(argv) {
    const a = { kaynak: [], kosul: [], set: null, cikis: null, duz: false, oneCikan: false };
    const konumsal = [];
    for (let i = 0; i < argv.length; i++) {
        const x = argv[i];
        if (x === '--kaynak') a.kaynak.push(argv[++i]);
        else if (x === '--cikis') a.cikis = argv[++i];
        else if (x === '--set') a.set = argv[++i].split(',').filter(Boolean);
        else if (x === '--kosul') a.kosul.push(argv[++i]);
        else if (x === '--duz') a.duz = true;
        else if (x === '--one-cikan') a.oneCikan = true;
        else konumsal.push(x);
    }
    if (!a.kaynak.length && konumsal[0]) a.kaynak.push(konumsal[0]);
    if (!a.cikis && konumsal[1]) a.cikis = konumsal[1];
    return a;
}

function uret(secenek) {
    const { kaynak, cikis, kosul = [], duz = false, oneCikan = false } = secenek;
    const setAdlari = secenek.set || Object.keys(SETLER);
    if (duz && setAdlari.length !== 1) throw new Error('--duz yalniz tek setle kullanilir');
    const dizin = pngleriTara(kaynak);
    const tarayici = tarayiciBul();
    const ikonUrl = dosyaUrl(path.resolve(__dirname, '..', '..', 'assets', 'icon.png'));
    const ozet = {};
    for (const setAdi of setAdlari) {
        const set = SETLER[setAdi];
        if (!set) throw new Error('bilinmeyen set: ' + setAdi);
        const hedefKlasor = duz ? cikis : path.join(cikis, setAdi);
        const o = { uretilen: [], eksik: [], kosulsuz: [] };
        for (const kare of set.kareler) {
            if (kare.kosul && !kosul.includes(kare.kosul)) {
                o.kosulsuz.push(kare.ad + ' (' + kare.kosul + ')');
                continue;
            }
            const { gorseller, eksik, atla } = gorselleriCoz(dizin, set, kare);
            if (atla) {
                o.eksik.push(kare.ad + ' <- ' + eksik.join(', '));
                console.error(`  UYARI ${setAdi}/${kare.ad}: ham kare yok (${eksik.join(', ')})`);
                continue;
            }
            const hedef = path.join(hedefKlasor, kare.magazaDisi ? 'magaza-disi' : '', kare.ad + '.png');
            ciz(sayfaUret(kare, set, gorseller, ikonUrl), hedef, set.boyut.gen, set.boyut.yuk, tarayici);
            o.uretilen.push(kare.ad);
        }
        if (oneCikan && setAdi === 'play-telefon') {
            const g = kareBul(dizin, 'androidTelefon', ['02-muhafiz-zaman-seridi.png', '07-muhafiz-zaman-seridi.png', '01-ana-ekran.png']);
            if (g) {
                ciz(oneCikanSayfa(ikonUrl, g.url), path.join(hedefKlasor, 'one-cikan.png'), 1024, 500, tarayici);
                o.uretilen.push('one-cikan');
            } else o.eksik.push('one-cikan');
        }
        ozet[setAdi] = o;
    }
    return ozet;
}

if (require.main === module) {
    const a = argumanlar(process.argv.slice(2));
    if (!a.kaynak.length || !a.cikis) {
        console.error('Kullanim: node scripts/magaza-gorselleri/uret.js <ham-kare-klasoru> <cikis> [--set a,b] [--kosul x] [--duz] [--one-cikan]');
        process.exit(1);
    }
    const ozet = uret(a);
    for (const [ad, o] of Object.entries(ozet)) {
        const set = SETLER[ad];
        console.log(`${ad}: ${o.uretilen.length} gorsel${set.yukleme ? '' : ' (MAGAZAYA YUKLENMEZ: ' + set.yuklenmezNedeni + ')'}`);
        o.eksik.forEach((e) => console.log('  eksik: ' + e));
        o.kosulsuz.forEach((e) => console.log('  kosul kapali: ' + e));
    }
}

module.exports = { uret, kareBul, pngleriTara, gorselleriCoz, argumanlar };
