/**
 * iOS Simulator dolasma yardimcilari (idb + simctl) — OZELLIK turu icin.
 *
 * `simulator-ekranlari-cek.js` (magaza turu) ayni yardimcilari KENDI icinde
 * tasir; magaza turunun ciktisi birebir korunsun diye o dosyaya dokunulmadi.
 * Iki kopya ayrisirsa once buradakini guncel kabul edin.
 *
 * Tuzaklar (AGENTS.md "Magaza ekran goruntuleri"):
 *  - idb'de `--udid` GLOBAL DEGIL, alt komut duzeyindedir.
 *  - ilk `describe-all` companion isinirken BOS doner → agac dolana kadar bekle.
 *  - sekme etiketine ", tab, N of 5" eklenir → tam-dize capasi tutmaz.
 *  - `idb ui tap` UISwitch'i toggle ETMEZ.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function idbOlustur({ cikis, udid, bundle }) {
    const agacDizin = path.join(cikis, 'agac');
    fs.mkdirSync(agacDizin, { recursive: true });

    const idb = (...args) => {
        const tum = udid ? [...args, '--udid', udid] : args;
        return execFileSync('idb', tum, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    };
    const simctl = (...args) =>
        execFileSync('xcrun', ['simctl', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
    let adimNo = 0;

    function agacOku() {
        let ham = '[]';
        try {
            ham = idb('ui', 'describe-all', '--json');
        } catch (e) {
            return { ogeler: [], hata: String(e.message).split(/\r?\n/)[0] };
        }
        const ogeler = [];
        const ekle = (j) => (Array.isArray(j) ? ogeler.push(...j) : ogeler.push(j));
        try {
            ekle(JSON.parse(ham));
        } catch {
            for (const satir of ham.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
                try {
                    ekle(JSON.parse(satir));
                } catch {
                    /* JSON olmayan satirlari yok say */
                }
            }
        }
        return { ogeler, hata: null };
    }

    async function agac(ad, { enAz = 2, denemeSayisi = 10 } = {}) {
        adimNo += 1;
        let sonuc = { ogeler: [], hata: 'deneme yok' };
        for (let i = 0; i < denemeSayisi; i++) {
            sonuc = agacOku();
            if (sonuc.ogeler.length >= enAz) break;
            await bekle(1500);
        }
        if (sonuc.hata) console.error(`  agac alinamadi (${ad}): ${sonuc.hata}`);
        fs.writeFileSync(
            path.join(agacDizin, `${String(adimNo).padStart(3, '0')}-${ad}.json`),
            JSON.stringify(sonuc.ogeler, null, 1),
            'utf8'
        );
        return sonuc.ogeler;
    }

    const metin = (o) =>
        [o.AXLabel, o.AXValue, o.AXUniqueId, o.title, o.label]
            .filter((x) => typeof x === 'string' && x)
            .join(' | ');

    function cerceve(o) {
        const f = o.frame || o.AXFrame || {};
        return {
            x: f.x ?? (f.origin && f.origin.x) ?? 0,
            y: f.y ?? (f.origin && f.origin.y) ?? 0,
            w: f.width ?? (f.size && f.size.width) ?? 0,
            h: f.height ?? (f.size && f.size.height) ?? 0,
        };
    }
    const alan = (o) => {
        const c = cerceve(o);
        return c.w * c.h;
    };
    const ekranYuksekligi = (ogeler) => {
        const kok = ogeler.find((o) => String(o.type || '') === 'Application');
        return kok ? cerceve(kok).h : 956;
    };

    function bul(ogeler, kalip, { tur } = {}) {
        let aday = ogeler.filter((o) => (o.frame || o.AXFrame) && alan(o) > 0 && kalip.test(metin(o)));
        if (tur) {
            const turlu = aday.filter((o) => new RegExp(tur, 'i').test(String(o.type || o.role || '')));
            if (turlu.length) aday = turlu;
        }
        aday.sort((a, b) => alan(a) - alan(b));
        return aday[0] || null;
    }

    async function dokun(ogeler, kalip, aciklama, secenek = {}) {
        const o = bul(ogeler, kalip, secenek);
        if (!o) {
            console.error(`  BULUNAMADI: ${aciklama}  (${kalip})`);
            return false;
        }
        const c = cerceve(o);
        const x = Math.round(c.x + c.w / 2);
        const y = Math.round(c.y + c.h / 2);
        idb('ui', 'tap', String(x), String(y));
        console.log(`  dokunuldu: ${aciklama} -> "${metin(o).slice(0, 70)}" @ ${x},${y}`);
        await bekle(secenek.bekle ?? 1600);
        return true;
    }

    /**
     * Ogeyi ekranin [ust, alt] bandina getirir (yavas surukleme, firlatma yok).
     * Bulunamazsa false — cagiran kareyi yine de cekebilir.
     */
    async function getir(kalip, ad, { ust = 0.25, alt = 0.6, deneme = 8 } = {}) {
        for (let i = 0; i < deneme; i++) {
            const a = await agac(`${ad}-${i}`);
            const yuk = ekranYuksekligi(a);
            const o = bul(a, kalip);
            let fark;
            if (o) {
                const y = cerceve(o).y + cerceve(o).h / 2;
                if (y > yuk * ust && y < yuk * alt) return { ogeler: a, oge: o };
                fark = y - yuk * ((ust + alt) / 2);
            } else {
                fark = yuk * 0.3; // gorunmuyorsa icerik asagida
            }
            const sinir = (v) => Math.max(yuk * 0.15, Math.min(yuk * 0.85, v));
            const bas = sinir(fark > 0 ? yuk * 0.78 : yuk * 0.3);
            const son = sinir(bas - fark);
            idb('ui', 'swipe', '220', String(Math.round(bas)), '220', String(Math.round(son)), '--duration', '1.0');
            await bekle(1500);
        }
        console.error(`  UYARI: getirilemedi: ${ad}  (${kalip})`);
        return null;
    }

    async function kaydirarakDokun(kalip, aciklama, ad, secenek = {}) {
        const s = await getir(kalip, ad, { ust: 0.12, alt: 0.8 });
        if (!s) return false;
        return dokun(s.ogeler, kalip, aciklama, secenek);
    }

    /** Sayfayi bir ekran boyu asagi kaydirir. */
    async function asagiKaydir() {
        const a = await agac('kaydir');
        const yuk = ekranYuksekligi(a);
        idb('ui', 'swipe', '220', String(Math.round(yuk * 0.8)), '220', String(Math.round(yuk * 0.25)), '--duration', '1.0');
        await bekle(1500);
    }

    /** UISwitch'i surukleyerek degistirir (idb tap toggle ETMEZ). */
    async function anahtariSurukle(o) {
        const c = cerceve(o);
        const y = Math.round(c.y + c.h / 2);
        idb('ui', 'swipe', String(Math.round(c.x + 6)), String(y), String(Math.round(c.x + c.w - 6)), String(y), '--duration', '0.4');
        await bekle(1800);
    }

    function cek(ad) {
        const hedef = path.join(cikis, `${ad}.png`);
        simctl('io', udid || 'booted', 'screenshot', hedef);
        console.log(`  KARE: ${ad}.png (${(fs.statSync(hedef).size / 1024).toFixed(0)} KB)`);
    }

    async function yenidenBaslat() {
        try {
            simctl('terminate', udid || 'booted', bundle);
        } catch {
            /* zaten kapali olabilir */
        }
        await bekle(1500);
        simctl('launch', udid || 'booted', bundle);
        await bekle(7000);
    }

    return {
        idb,
        simctl,
        bekle,
        agac,
        bul,
        dokun,
        getir,
        kaydirarakDokun,
        asagiKaydir,
        anahtariSurukle,
        cerceve,
        cek,
        yenidenBaslat,
    };
}

module.exports = { idbOlustur };
