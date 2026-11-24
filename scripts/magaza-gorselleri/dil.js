/**
 * Pazarlama gorsellerinin dili. Turkce metin KAYNAKTIR (setler.js ve sablon.js'te yazili);
 * baska dil `metinler/<dil>.json` dosyasindan gelir: anahtar Turkce metnin kendisi, deger
 * o dildeki karsiligi. Boylece yeni bir Turkce metin eklendiginde eksik ceviri testte
 * (src/core/utils/__tests__/magazaGorselleri.test.ts) hemen yakalanir.
 *
 * Bildirim, alarm ve dugme metinleri uygulamanin GERCEK metnidir: cevirisi o dilin
 * sozlugundeki degerle (src/core/dil/sozluk/<dil>) AYNI yazilir, serbest ceviri yapilmaz.
 */
const fs = require('fs');
const path = require('path');

const KLASOR = path.join(__dirname, 'metinler');

/** Kare nesnelerinde ekranda gorunen metin alanlari (geri kalanlar dosya adi, renk, ikon...). */
const METIN_ALANLARI = new Set(['baslik', 'alt', 'altTabletsiz', 'govde', 'metin', 'vakitAdi', 'dipnot', 'not']);

let etkin = 'tr';
let sozluk = null;

function dilleriListele() {
    if (!fs.existsSync(KLASOR)) return [];
    return fs
        .readdirSync(KLASOR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
        .sort();
}

function sozlukOku(dil) {
    return JSON.parse(fs.readFileSync(path.join(KLASOR, dil + '.json'), 'utf8'));
}

/** Etkin dili kurar; `tr` ya da bos = kaynak metin. */
function dilAyarla(dil) {
    etkin = dil || 'tr';
    sozluk = etkin === 'tr' ? null : sozlukOku(etkin);
}

const etkinDil = () => etkin;

/**
 * Turkce metnin etkin dildeki karsiligi. `{ad}` yer tutuculari `degerler`le doldurulur.
 * Ceviri yoksa HATA: Turkce metin baska dilin gorseline sessizce girmesin.
 */
function t(tr, degerler) {
    let s = tr;
    if (sozluk) {
        s = sozluk[tr];
        if (typeof s !== 'string') throw new Error(`magaza gorseli cevirisi yok (${etkin}): ${JSON.stringify(tr)}`);
    }
    if (degerler) for (const [k, v] of Object.entries(degerler)) s = s.split('{' + k + '}').join(String(v));
    return s;
}

/**
 * Kilit ekranindaki tarih (Istanbul takvim gunu). Turkcede sabit tablo (setler.js >
 * kosuGunuMetni); diger dillerde Intl (Node tam ICU tasir; bu betik cihazda kosmaz).
 */
function gunMetni(simdi, dil = etkin) {
    return new Intl.DateTimeFormat(dil, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' }).format(simdi);
}

/** Nesnenin (set/kare) derin kopyasi; metin alanlari etkin dile cevrilir. */
function yerellestir(nesne) {
    if (!sozluk) return nesne;
    const gez = (o, anahtar) => {
        if (Array.isArray(o)) return o.map((x) => gez(x, anahtar));
        if (o && typeof o === 'object') {
            const yeni = {};
            for (const [k, v] of Object.entries(o)) {
                if (k === 'tarih' && typeof v === 'string') yeni[k] = gunMetni(new Date());
                else yeni[k] = gez(v, k);
            }
            return yeni;
        }
        if (typeof o === 'string' && METIN_ALANLARI.has(anahtar)) return t(o);
        return o;
    };
    return gez(nesne, null);
}

/**
 * Cevrilmesi gereken butun Turkce metinler: setlerdeki metin alanlari + sablondaki
 * `cevir('...')` cagrilari. Ceviri dosyasi tam olarak bu anahtarlari tasimali.
 */
function kaynakMetinler(setler) {
    const kume = new Set();
    const gez = (o, anahtar) => {
        if (Array.isArray(o)) return o.forEach((x) => gez(x, anahtar));
        if (o && typeof o === 'object') return Object.entries(o).forEach(([k, v]) => k !== 'tarih' && gez(v, k));
        if (typeof o === 'string' && METIN_ALANLARI.has(anahtar)) kume.add(o);
    };
    gez(setler, null);
    const sablon = fs.readFileSync(path.join(__dirname, 'sablon.js'), 'utf8');
    for (const m of sablon.matchAll(/\bcevir\('((?:[^'\\]|\\.)*)'/g)) kume.add(m[1].replace(/\\'/g, "'").replace(/\\n/g, '\n'));
    return kume;
}

module.exports = { t, dilAyarla, etkinDil, yerellestir, kaynakMetinler, dilleriListele, sozlukOku, gunMetni, METIN_ALANLARI, KLASOR };
