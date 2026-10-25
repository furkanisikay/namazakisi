'use strict';
/**
 * Simülatör kare betikleri için dile duyarlı seçici kalıpları.
 *
 * Betik Türkçe metni verir; kalıp o metni ve sözlükte AYNI ANAHTARDAN gelen hedef dil
 * karşılığını (`TOHUM_DIL`) birlikte tutar. Türkçe turda sözlük yüklenmez, kalıp yalnız
 * Türkçe metindir (mağaza turu birebir aynı kalır). Çoğul yaprakta hedef dilin bütün
 * kategorileri alınır (Rusçanın few/many'si Türkçede yoktur).
 */
const path = require('path');

const DIL = process.env.TOHUM_DIL || 'tr';
const COGUL = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

const kacir = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let durum = null;

function yapraklar(o, yol = '', cikti = new Map()) {
    if (typeof o === 'string') cikti.set(yol, o);
    else if (o && typeof o === 'object') {
        for (const [k, v] of Object.entries(o)) if (k !== '__cogul') yapraklar(v, yol ? `${yol}.${k}` : k, cikti);
    }
    return cikti;
}

function yukle() {
    if (durum) return durum;
    require('sucrase/register');
    const { sozluk } = require(path.join(__dirname, '..', 'src', 'core', 'dil', 'aktifDil'));
    const tr = yapraklar(sozluk('tr'));
    const hedef = yapraklar(sozluk(DIL));
    const dizin = new Map();
    for (const [yol, metin] of tr) {
        if (!dizin.has(metin)) dizin.set(metin, new Set());
        dizin.get(metin).add(yol);
    }
    durum = { hedef, dizin };
    return durum;
}

/** Türkçe metnin hedef dildeki karşılıkları (çoğul yaprakta tüm kategoriler). */
function karsiliklar(trMetin) {
    if (DIL === 'tr') return [];
    const { hedef, dizin } = yukle();
    const sonuc = new Set();
    for (const yol of dizin.get(trMetin) ?? []) {
        const parca = yol.split('.');
        if (COGUL.has(parca[parca.length - 1])) {
            const ust = parca.slice(0, -1).join('.') + '.';
            for (const [y, v] of hedef) if (y.startsWith(ust) && COGUL.has(y.slice(ust.length))) sonuc.add(v);
        } else if (hedef.has(yol)) sonuc.add(hedef.get(yol));
    }
    return [...sonuc];
}

/** "(?:Kapat|Schließen)": Türkçe metin ve karşılıkları, düz metin olarak kaçışlı. */
function m(...trMetinler) {
    const hepsi = new Set();
    for (const t of trMetinler) {
        hepsi.add(t);
        for (const k of karsiliklar(t)) if (!/[{}]/.test(k)) hepsi.add(k);
    }
    return `(?:${[...hepsi].map(kacir).join('|')})`;
}

/**
 * Yer tutuculu Türkçe yaprak ("{ad} akışını önizleyin") ve karşılıkları; yer tutucular
 * `degerler`deki kalıpla (regex kaynağı), verilmeyenler `.*?` ile dolar.
 */
function sablon(trSablon, degerler = {}) {
    const doldur = (s) =>
        s
            .split(/(\{[^{}]+\})/)
            .map((p) => (/^\{[^{}]+\}$/.test(p) ? (degerler[p.slice(1, -1)] ?? '.*?') : kacir(p)))
            .join('');
    const hepsi = new Set([doldur(trSablon), ...karsiliklar(trSablon).map(doldur)]);
    return `(?:${[...hepsi].join('|')})`;
}

module.exports = { DIL, m, sablon };
