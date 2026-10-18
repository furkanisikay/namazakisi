#!/usr/bin/env node
/**
 * README ve belge sayfalarindaki ekran goruntulerini GUNCEL tutar.
 *
 * Kullanim:
 *   node scripts/belge-gorselleri.js [--play-json <dosya>] [--yalniz <grup,grup>] [--kuru]
 *
 * Gruplar `scripts/belge-gorsel-gruplari.js`'te. Her grup icin kaynak okunur:
 *   - appstore: App Store'daki CANLI kareler (itunes lookup, anahtarsiz)
 *   - play:     Google Play'deki CANLI kareler. `--play-json` (play-magaza.js
 *               `gorseller` ciktisi, servis hesabi ister) verilirse oradan; yoksa
 *               telefon kareleri herkese acik magaza sayfasindan, digerleri atlanir.
 *   - artifact: ekran goruntusu hattinin artifact'i — yalniz BASARILI kosudan ve
 *               commit'i master'a GIRMIS olandan (dalda kalmis ozellik README'ye girmez).
 *               `gh` CLI ile okunur (CI'da GH_TOKEN, yerelde `gh auth`).
 *
 * Kareler `docs/ekran-goruntuleri/<grup>/NN-ad.webp` olarak yazilir; magaza kareleri
 * magazanin kendi sunucusunda (mzstatic / googleusercontent) boyutlandirilir, artifact
 * kareleri yerelde `cwebp` ya da `ffmpeg` ile.
 *
 * DEGISMEYENE DOKUNULMAZ: `manifest.json` her karenin KAYNAK KIMLIGINI (magaza
 * varlik yolu / sha256, artifact PNG'sinin sha256'si + genislik) tutar; kimlik
 * ayniysa kare yeniden uretilmez, uretilse de baytlar ayniysa dosyaya yazilmaz.
 * Kaynak okunamazsa (ag, suresi dolmus artifact) grup OLDUGU GIBI kalir — hicbir
 * kare silinmez. Yalniz kaynak gercekten okunduysa ve kare artik orada yoksa silinir.
 */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { GORSEL_KLASORU, MANIFEST, GRUPLAR } = require('./belge-gorsel-gruplari');

const REPO = process.env.GITHUB_REPOSITORY || 'furkanisikay/namazakisi';
const ANA_DAL = 'master';
const APP_STORE_ID = '6813061360';
const PLAY_PAKET = 'com.furkanisikay.namazakisi';

const arg = (ad) => {
    const i = process.argv.indexOf('--' + ad);
    return i >= 0 ? process.argv[i + 1] : null;
};
const KURU = process.argv.includes('--kuru');

// ---------------------------------------------------------------- yardimcilar

function getir(url, sinir = 5) {
    return new Promise((coz, reddet) => {
        const r = https.get(
            url,
            { headers: { 'User-Agent': 'Mozilla/5.0 (namazakisi belge-gorselleri)', 'Accept-Language': 'tr-TR' }, timeout: 60000 },
            (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && sinir > 0) {
                    res.resume();
                    coz(getir(new URL(res.headers.location, url).toString(), sinir - 1));
                    return;
                }
                const parcalar = [];
                res.on('data', (c) => parcalar.push(c));
                res.on('end', () => {
                    if (res.statusCode >= 300) reddet(new Error(url + ' -> HTTP ' + res.statusCode));
                    else coz(Buffer.concat(parcalar));
                });
            }
        );
        r.on('timeout', () => r.destroy(new Error('zaman asimi: ' + url)));
        r.on('error', reddet);
    });
}

const ozet = (b) => crypto.createHash('sha256').update(b).digest('hex');

function gh(args) {
    const r = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error('gh ' + args.slice(0, 2).join(' ') + ': ' + (r.stderr || '').trim().slice(0, 300));
    return r.stdout;
}

/** Ilk calisan donusturucu: cwebp (CI, `apt install webp`) ya da ffmpeg (yerel). */
let donusturucu;
function donusturucuBul() {
    if (donusturucu !== undefined) return donusturucu;
    for (const [ad, surumArg] of [
        ['cwebp', '-version'],
        ['ffmpeg', '-version'],
    ]) {
        const r = spawnSync(ad, [surumArg], { encoding: 'utf8' });
        if (r.status === 0) return (donusturucu = ad);
    }
    return (donusturucu = null);
}

function webpYap(pngYolu, genislik) {
    const arac = donusturucuBul();
    if (!arac) throw new Error('webp donusturucu yok: `cwebp` (paket: webp) ya da `ffmpeg` kurun');
    const cikti = path.join(os.tmpdir(), 'belge-' + process.pid + '-' + Math.random().toString(36).slice(2) + '.webp');
    const args =
        arac === 'cwebp'
            ? ['-quiet', '-q', '80', '-m', '6', '-metadata', 'none', '-resize', String(genislik), '0', pngYolu, '-o', cikti]
            : ['-v', 'error', '-y', '-i', pngYolu, '-vf', `scale=${genislik}:-2:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', '-compression_level', '6', '-map_metadata', '-1', cikti];
    const r = spawnSync(arac, args, { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(arac + ' basarisiz: ' + (r.stderr || '').slice(0, 300));
    const b = fs.readFileSync(cikti);
    fs.rmSync(cikti, { force: true });
    return b;
}

/** "01-ana-ekran.png" → "01-ana-ekran"; numarasizsa sira numarasi eklenir. */
function dosyaAdi(sira, ham) {
    const kok = String(ham || '')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/^\d+[-_ ]*/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const no = String(sira + 1).padStart(2, '0');
    return (kok ? no + '-' + kok : no) + '.webp';
}

// ---------------------------------------------------------------- kaynaklar

let appStoreOnbellek;
async function appStoreBilgisi() {
    if (appStoreOnbellek !== undefined) return appStoreOnbellek;
    try {
        const j = JSON.parse((await getir(`https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=tr`)).toString('utf8'));
        appStoreOnbellek = j.resultCount ? j.results[0] : null;
    } catch (e) {
        console.warn('UYARI: App Store okunamadi —', e.message);
        appStoreOnbellek = null;
    }
    return appStoreOnbellek;
}

async function appStoreOgeleri(grup) {
    const bilgi = await appStoreBilgisi();
    if (!bilgi) return null;
    return (bilgi.screenshotUrls || []).map((url, i) => {
        // .../<varlik>/01-ana-ekran.png/320x480bb.jpg → boyutu Apple'in sunucusu ayarlar.
        const parcalar = url.split('/');
        const temel = parcalar.slice(0, -1).join('/');
        const hamAd = parcalar[parcalar.length - 2];
        return {
            dosya: dosyaAdi(i, hamAd),
            kimlik: grup.genislik + ':' + temel.replace(/^https:\/\/[^/]+/, ''),
            al: () => getir(`${temel}/${grup.genislik}x0w.webp`),
        };
    });
}

let playJson;
function playJsonOku() {
    if (playJson !== undefined) return playJson;
    const yol = arg('play-json');
    playJson = null;
    if (yol && fs.existsSync(yol)) {
        try {
            playJson = JSON.parse(fs.readFileSync(yol, 'utf8'));
        } catch (e) {
            console.warn('UYARI: --play-json okunamadi —', e.message);
        }
    }
    return playJson;
}

/** googleusercontent gorseli: mevcut boyut ekini at, sunucuda boyutlandirilmis webp iste. */
const playBoyutlu = (url, w) => url.replace(/=[^/=]*$/, '') + '=w' + w + '-rw';

let playSayfasi;
async function playSayfaKareleri() {
    if (playSayfasi !== undefined) return playSayfasi;
    playSayfasi = null;
    try {
        const html = (await getir(`https://play.google.com/store/apps/details?id=${PLAY_PAKET}&hl=tr&gl=TR`)).toString('utf8');
        // Telefon karesi kaydiricisi `=w526-h296` boyutuyla cizilir (simge vb. degil).
        const gorulen = new Set();
        const liste = [];
        for (const m of html.matchAll(/<img[^>]+src="(https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+)=w526-h296"/g)) {
            if (!gorulen.has(m[1])) {
                gorulen.add(m[1]);
                liste.push(m[1]);
            }
        }
        if (liste.length) playSayfasi = liste;
    } catch (e) {
        console.warn('UYARI: Play sayfasi okunamadi —', e.message);
    }
    return playSayfasi;
}

async function playOgeleri(grup) {
    const j = playJsonOku();
    if (j && j.gorseller && Array.isArray(j.gorseller[grup.kaynak.alan])) {
        return j.gorseller[grup.kaynak.alan].map((g, i) => ({
            dosya: dosyaAdi(i, ''),
            kimlik: grup.genislik + ':' + (g.sha256 || g.id),
            al: () => getir(playBoyutlu(g.url, grup.genislik)),
        }));
    }
    // Servis hesabi yok: yalniz telefon kareleri herkese acik sayfadan okunabilir.
    if (grup.kaynak.alan !== 'phoneScreenshots') return null;
    const liste = await playSayfaKareleri();
    if (!liste) return null;
    return liste.map((url, i) => ({
        dosya: dosyaAdi(i, ''),
        kimlik: grup.genislik + ':' + url.split('/').pop(),
        al: () => getir(playBoyutlu(url, grup.genislik)),
    }));
}

const artifactOnbellek = new Map();
/** Artifact'in master'a girmis, basarili en yeni kosusunu indirir; klasor yolu ya da null. */
function artifactIndir(hat, ad) {
    const anahtar = hat + '|' + ad;
    if (artifactOnbellek.has(anahtar)) return artifactOnbellek.get(anahtar);
    let sonuc = null;
    try {
        const liste = JSON.parse(gh(['api', `repos/${REPO}/actions/artifacts?name=${encodeURIComponent(ad)}&per_page=30`]));
        const adaylar = (liste.artifacts || [])
            .filter((a) => !a.expired && a.workflow_run)
            .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
        for (const a of adaylar) {
            const kosu = JSON.parse(gh(['api', `repos/${REPO}/actions/runs/${a.workflow_run.id}`]));
            if (!String(kosu.path || '').endsWith(hat) || kosu.conclusion !== 'success') continue;
            const durum = gh(['api', `repos/${REPO}/compare/${kosu.head_sha}...${ANA_DAL}`, '--jq', '.status']).trim();
            if (durum !== 'ahead' && durum !== 'identical') continue;
            const klasor = fs.mkdtempSync(path.join(os.tmpdir(), 'belge-artifact-'));
            gh(['run', 'download', String(kosu.id), '-R', REPO, '-n', ad, '-D', klasor]);
            console.log(`  ${ad}: kosu ${kosu.id} (${kosu.head_branch}, ${String(kosu.head_sha).slice(0, 7)})`);
            sonuc = klasor;
            break;
        }
        if (!sonuc) console.log(`  ${ad}: master'a girmis basarili kosu yok (ya da artifact suresi dolmus) — dokunulmadi`);
    } catch (e) {
        console.warn('UYARI: artifact okunamadi (' + ad + ') —', e.message);
    }
    artifactOnbellek.set(anahtar, sonuc);
    return sonuc;
}

function artifactOgeleri(grup) {
    const kok = artifactIndir(grup.kaynak.hat, grup.kaynak.ad);
    if (!kok) return null;
    const klasor = path.join(kok, grup.kaynak.alt || '');
    if (!fs.existsSync(klasor)) return null;
    const pngler = fs
        .readdirSync(klasor)
        .filter((f) => /^\d\d-.*\.png$/i.test(f))
        .sort();
    // Bos alt klasor "bu kosu o turu cekmedi" demektir (or. koyu tema istenmedi) → dokunma.
    if (!pngler.length) return null;
    return pngler.map((f) => {
        const yol = path.join(klasor, f);
        return {
            // Artifact adlari zaten sirali ve anlamli (NN-ad.png); numara korunur.
            dosya: f.replace(/\.png$/i, '.webp').toLowerCase(),
            kimlik: grup.genislik + ':' + ozet(fs.readFileSync(yol)),
            al: async () => webpYap(yol, grup.genislik),
        };
    });
}

// ---------------------------------------------------------------- esitleme

function manifestOku() {
    try {
        return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    } catch {
        return { gruplar: {}, magaza: {} };
    }
}

async function grubuEsitle(grup, ogeler, eski) {
    const klasor = path.join(GORSEL_KLASORU, grup.klasor);
    const eskiKimlik = new Map(((eski && eski.ogeler) || []).map((o) => [o.dosya, o.kimlik]));
    const sayac = { yeni: 0, ayni: 0, silinen: 0 };
    const yeniOgeler = [];
    for (const o of ogeler) {
        const hedef = path.join(klasor, o.dosya);
        if (eskiKimlik.get(o.dosya) === o.kimlik && fs.existsSync(hedef)) {
            sayac.ayni++;
            yeniOgeler.push({ dosya: o.dosya, kimlik: o.kimlik });
            continue;
        }
        const veri = await o.al();
        if (fs.existsSync(hedef) && fs.readFileSync(hedef).equals(veri)) sayac.ayni++;
        else {
            sayac.yeni++;
            if (!KURU) {
                fs.mkdirSync(klasor, { recursive: true });
                fs.writeFileSync(hedef, veri);
            }
        }
        yeniOgeler.push({ dosya: o.dosya, kimlik: o.kimlik });
    }
    // Kaynak OKUNDU ve kare artik orada yok → sil (yalniz bu grubun .webp'leri).
    const kalacak = new Set(yeniOgeler.map((o) => o.dosya));
    if (fs.existsSync(klasor)) {
        for (const f of fs.readdirSync(klasor)) {
            if (f.endsWith('.webp') && !kalacak.has(f)) {
                sayac.silinen++;
                if (!KURU) fs.rmSync(path.join(klasor, f));
            }
        }
    }
    console.log(`  ${grup.id}: ${ogeler.length} kare — ${sayac.yeni} yeni/degisen, ${sayac.ayni} ayni, ${sayac.silinen} silinen`);
    return { ogeler: yeniOgeler };
}

function playMagazaBilgisi(eski) {
    const j = playJsonOku();
    if (!j || !Array.isArray(j.kanallar)) return eski || null;
    const yayinda = (r) => r.durum === 'completed' || r.durum === 'inProgress' || r.durum === 'halted';
    const uretim = j.kanallar.find((r) => r.kanal === 'production' && yayinda(r));
    const formFaktoru = (onek) => {
        const kanallar = j.kanallar.filter((r) => r.kanal.startsWith(onek + ':') && yayinda(r));
        if (kanallar.some((r) => r.kanal === onek + ':production')) return 'uretim';
        return kanallar.length ? 'test' : null;
    };
    return { uretim: uretim ? uretim.ad : null, wear: formFaktoru('wear'), tv: formFaktoru('tv') };
}

(async () => {
    const yalniz = arg('yalniz') ? new Set(arg('yalniz').split(',')) : null;
    const manifest = manifestOku();
    const yeni = { aciklama: 'Otomatik uretilir (scripts/belge-gorselleri.js). Elle duzenlemeyin.', magaza: {}, gruplar: {} };

    for (const grup of GRUPLAR) {
        const eski = (manifest.gruplar || {})[grup.id];
        if (yalniz && !yalniz.has(grup.id)) {
            if (eski) yeni.gruplar[grup.id] = eski;
            continue;
        }
        let ogeler = null;
        try {
            if (grup.kaynak.tur === 'appstore') ogeler = await appStoreOgeleri(grup);
            else if (grup.kaynak.tur === 'play') ogeler = await playOgeleri(grup);
            else if (grup.kaynak.tur === 'artifact') ogeler = artifactOgeleri(grup);
        } catch (e) {
            console.warn(`UYARI: ${grup.id} kaynagi okunamadi —`, e.message);
            ogeler = null;
        }
        if (ogeler === null) {
            console.log(`  ${grup.id}: kaynak yok — oldugu gibi birakildi`);
            if (eski) yeni.gruplar[grup.id] = eski;
            continue;
        }
        try {
            yeni.gruplar[grup.id] = await grubuEsitle(grup, ogeler, eski);
        } catch (e) {
            console.warn(`UYARI: ${grup.id} esitlenemedi —`, e.message);
            if (eski) yeni.gruplar[grup.id] = eski;
        }
    }

    const eskiMagaza = manifest.magaza || {};
    const as = await appStoreBilgisi();
    yeni.magaza.appStore = as ? { surum: as.version } : eskiMagaza.appStore || null;
    yeni.magaza.googlePlay = playMagazaBilgisi(eskiMagaza.googlePlay);

    const metin = JSON.stringify(yeni, null, 2) + '\n';
    const onceki = fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, 'utf8') : '';
    if (metin !== onceki && !KURU) {
        fs.mkdirSync(GORSEL_KLASORU, { recursive: true });
        fs.writeFileSync(MANIFEST, metin);
    }
    console.log(metin === onceki ? 'manifest degismedi' : 'manifest guncellendi' + (KURU ? ' (kuru)' : ''));
})().catch((e) => {
    console.error('HATA', e.stack || e.message);
    process.exit(1);
});
