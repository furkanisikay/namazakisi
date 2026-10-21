#!/usr/bin/env node
/**
 * Cihaz ağı v2 — telefonu taklit eden ŞİFRELİ istemci (TV kare hattı + emülatörde uçtan uca).
 * curl DEĞİL: eşleştirme ve eşitleme gerçek protokolle (AES-256-GCM, @noble/ciphers 1.x) gider.
 * Protokol telefondaki `src/core/cihazAgi/kanal.ts` + `CihazEslesmeServisi.ts` ile aynıdır; burada
 * BAĞIMSIZ yeniden yazılmıştır (TS kaynağını içe aktarmaz) — iki uygulama aynı TV'yle konuşabiliyorsa
 * sözleşme gerçekten tutuyor demektir.
 *
 * Kullanım (port: `adb forward tcp:<yerel> tcp:<TV portu>` sonrası yerel port):
 *   node scripts/tv/tv-esitleme-istemci.js esle <qr> <yerelPort> <durumDosyasi>
 *       /esle (202) → "ISTEK_GONDERILDI" yazar → /esle-durum yoklar → onayda üyelik dosyaya.
 *   node scripts/tv/tv-esitleme-istemci.js esitle <yerelPort> <durumDosyasi> <senaryo>
 *       senaryo: bant (Kadıköy, kılınmamış; saat `bant-saati` ile önceden kaydırılır) | ramazan | sade
 *   node scripts/tv/tv-esitleme-istemci.js bant-saati   → emülatör saati hedefi (epoch sn)
 *   node scripts/tv/tv-esitleme-istemci.js redler <yerelPort> <durumDosyasi>
 *       yanlış anahtar ve tekrarlanan n → ikisi de 403 olmalı (çıkış kodu 1 değilse).
 * Çıktı satırları `SONUC <ad> <değer>` biçimindedir (hat betiği grep'ler).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { gcm } = require('@noble/ciphers/aes');
const adhan = require('adhan');

const SURUM = 2;
const enc = (s) => new TextEncoder().encode(s);
const dec = (b) => new TextDecoder().decode(b);
const b64 = (b) => Buffer.from(b).toString('base64');
const b64coz = (s) => new Uint8Array(Buffer.from(s, 'base64'));
const b64url = (s) => new Uint8Array(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));

function sifrele(anahtar, aad, duz) {
    const iv = new Uint8Array(crypto.randomBytes(12));
    return { iv: b64(iv), ct: b64(gcm(anahtar, iv, enc(aad)).encrypt(enc(duz))) };
}
function coz(anahtar, iv, aad, ct) {
    try {
        return dec(gcm(anahtar, b64coz(iv), enc(aad)).decrypt(b64coz(ct)));
    } catch {
        return null;
    }
}

function post(port, yol, govde) {
    return new Promise((tamam, hata) => {
        const veri = Buffer.from(govde, 'utf8');
        const istek = http.request(
            { host: '127.0.0.1', port, path: yol, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': veri.length }, timeout: 8000 },
            (y) => {
                const parca = [];
                y.on('data', (p) => parca.push(p));
                y.on('end', () => tamam({ kod: y.statusCode, govde: Buffer.concat(parca).toString('utf8') }));
            },
        );
        istek.on('timeout', () => istek.destroy(new Error('zaman aşımı')));
        istek.on('error', hata);
        istek.end(veri);
    });
}

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

function qrCoz(qr) {
    const u = new URL(qr);
    const p = u.searchParams;
    if (p.get('v') !== '2') throw new Error('QR v2 değil: ' + qr);
    return { port: Number(p.get('p')), tv: p.get('i'), sir: b64url(p.get('s')), ad: p.get('d') || 'TV' };
}

async function esle(qr, yerelPort, dosya) {
    const q = qrCoz(qr);
    const ist = crypto.randomBytes(8).toString('hex');
    const z = sifrele(q.sir, `esle|${SURUM}|${q.tv}|istek`, JSON.stringify({ cihaz: "Ahmet'in telefonu", ist }));
    const y = await post(yerelPort, '/esle', JSON.stringify({ v: SURUM, ...z }));
    console.log(`SONUC esle ${y.kod}`);
    if (y.kod !== 202) process.exit(1);
    console.log('ISTEK_GONDERILDI');
    const bitis = Date.now() + 120_000;
    while (Date.now() < bitis) {
        await bekle(1500);
        const d = await post(yerelPort, '/esle-durum', JSON.stringify({ ist })).catch(() => null);
        if (!d) continue;
        if (d.kod !== 200) {
            console.log(`SONUC esle-durum ${d.kod}`);
            process.exit(1);
        }
        const zarf = JSON.parse(d.govde);
        const duz = coz(q.sir, zarf.iv, `esle|${SURUM}|${q.tv}|yanit|${ist}`, zarf.ct);
        if (!duz) {
            console.log('SONUC esle-durum cozulemedi');
            process.exit(1);
        }
        const o = JSON.parse(duz);
        if (o.durum === 'bekliyor') continue;
        console.log(`SONUC onay ${o.durum}`);
        if (o.durum !== 'onay') process.exit(1);
        fs.writeFileSync(dosya, JSON.stringify({ tv: q.tv, uye: o.u, anahtar: o.k, tvAdi: o.tvAdi, n: 0 }));
        return;
    }
    console.log('SONUC onay zamanAsimi');
    process.exit(1);
}

const tarih = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Şu anki farz penceresinin kalan süresi (dk) — TV'nin hesabıyla aynı yol (Turkey, Şafiî). */
function kalanDk(lat, lng, simdi) {
    const k = new adhan.Coordinates(lat, lng);
    const p = (g) => new adhan.PrayerTimes(k, g, adhan.CalculationMethod.Turkey());
    const bugun = p(simdi);
    const dun = p(new Date(simdi.getTime() - 86400000));
    const yarin = p(new Date(simdi.getTime() + 86400000));
    const pencereler = [
        ['yatsi', dun.isha, bugun.fajr],
        ['imsak', bugun.fajr, bugun.sunrise],
        ['ogle', bugun.dhuhr, bugun.asr],
        ['ikindi', bugun.asr, bugun.maghrib],
        ['aksam', bugun.maghrib, bugun.isha],
        ['yatsi', bugun.isha, yarin.fajr],
    ];
    for (const [vakit, gir, cik] of pencereler) {
        if (simdi >= gir && simdi < cik) return { vakit, dk: (cik - simdi) / 60000 };
    }
    return null; // güneş → öğle arası
}

const KADIKOY = { ad: 'Kadıköy, İstanbul', lat: 40.99, lng: 29.03 };

/**
 * Bant karesi için emülatör saati: BUGÜN Kadıköy'de ikindi girişinden 20 dk önce (öğle vaktinin
 * son dakikaları, kerahat yok). Konum gerçek kalır; saat kaydırılır (absürt vakit saatleri yok).
 * Çıktı: epoch saniye.
 */
function bantSaati(simdi) {
    const k = new adhan.Coordinates(KADIKOY.lat, KADIKOY.lng);
    const v = new adhan.PrayerTimes(k, simdi, adhan.CalculationMethod.Turkey());
    return Math.floor((v.asr.getTime() - 20 * 60_000) / 1000);
}

async function esitle(yerelPort, dosya, senaryo) {
    const uyelik = JSON.parse(fs.readFileSync(dosya, 'utf8'));
    const simdi = new Date();
    const konum = KADIKOY;
    if (senaryo === 'bant') {
        const r = kalanDk(konum.lat, konum.lng, simdi);
        console.log(`SONUC bant-penceresi ${r ? `${r.vakit} ${Math.round(r.dk)}dk` : 'yok'}`);
    }
    const durum = {
        ad: konum.ad,
        konum: { lat: Math.round(konum.lat * 100) / 100, lng: Math.round(konum.lng * 100) / 100 },
        kilinan: { [tarih(new Date(simdi.getTime() - 86400000))]: [], [tarih(simdi)]: [] },
        ozelGun: false,
        tvHatirlat: true,
        durumumSayilsin: senaryo !== 'sade',
        cuma: { aktif: true, cikisDk: 45 },
        ramazan: senaryo === 'ramazan',
    };
    const duz = JSON.stringify({ v: SURUM, durum });
    uyelik.n += 1;
    fs.writeFileSync(dosya, JSON.stringify(uyelik));
    const z = sifrele(b64coz(uyelik.anahtar), `${SURUM}|${uyelik.tv}|${uyelik.uye}|${uyelik.n}`, duz);
    const y = await post(yerelPort, '/esitle', JSON.stringify({ v: SURUM, u: uyelik.uye, n: uyelik.n, ...z }));
    console.log(`SONUC esitle ${y.kod} ${Buffer.byteLength(duz)}B`);
    if (y.kod !== 200) process.exit(1);
}

async function redler(yerelPort, dosya) {
    const uyelik = JSON.parse(fs.readFileSync(dosya, 'utf8'));
    const duz = JSON.stringify({ v: SURUM, durum: { kilinan: {}, ozelGun: false, tvHatirlat: true, durumumSayilsin: true, cuma: { aktif: false, cikisDk: null }, ramazan: false } });
    const yanlis = new Uint8Array(crypto.randomBytes(32));
    const n1 = uyelik.n + 1;
    const a = sifrele(yanlis, `${SURUM}|${uyelik.tv}|${uyelik.uye}|${n1}`, duz);
    const y1 = await post(yerelPort, '/esitle', JSON.stringify({ v: SURUM, u: uyelik.uye, n: n1, ...a }));
    console.log(`SONUC yanlis-anahtar ${y1.kod}`);
    // İlk ret 1 sn bekleme cezası yazar; ceza bitmeden gönderilen istek "tekrar" yüzünden değil
    // ceza yüzünden 403 alırdı → tekrar kontrolünü ölçmek için ceza süresini bekle.
    await bekle(1300);
    // Tekrar: SON KABUL EDİLEN n ile doğru anahtar → alıcı "kesin artan" ister, 403.
    const b = sifrele(b64coz(uyelik.anahtar), `${SURUM}|${uyelik.tv}|${uyelik.uye}|${uyelik.n}`, duz);
    const y2 = await post(yerelPort, '/esitle', JSON.stringify({ v: SURUM, u: uyelik.uye, n: uyelik.n, ...b }));
    console.log(`SONUC tekrar ${y2.kod}`);
    // Bekleme cezası 500 ms'den başlar; sonraki geçerli istekler yavaşlamasın diye kısa ara.
    await bekle(2500);
    if (y1.kod !== 403 || y2.kod !== 403) process.exit(1);
}

async function ana() {
    const [komut, ...a] = process.argv.slice(2);
    if (komut === 'esle') return esle(a[0], Number(a[1]), a[2]);
    if (komut === 'esitle') return esitle(Number(a[0]), a[1], a[2] || 'sade');
    if (komut === 'bant-saati') return console.log(String(bantSaati(new Date())));
    if (komut === 'redler') return redler(Number(a[0]), a[1]);
    console.error('komut: esle | esitle | redler');
    process.exit(2);
}

ana().catch((e) => {
    console.log(`SONUC hata ${e.message}`);
    process.exit(1);
});
