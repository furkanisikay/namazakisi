/**
 * Pazarlama gorseli HTML sablonu. Saf: dosya sistemine dokunmaz, yalniz HTML uretir.
 *
 * Imza ogesi: "vakit yayi" — gunesin gokyuzundeki yolunu andiran ince bir yay ve
 * uzerinde bes vakit noktasi; karenin konusu olan vakit buyuk ve parlak isaretlenir.
 * Geri kalan her sey sakin: tek aile (Plus Jakarta Sans), sola hizali buyuk baslik,
 * cihazin kenardan tastigi sade gradyan zemin.
 *
 * Renkler marka paletinden (src/core/theme/temalar.ts > yesil): #4CAF50 / #388E3C /
 * #C8E6C9. Buyuk harf donusumu YOK (Turkce I/i tuzagi; metin sentence case).
 */
const { ikon } = require('./ikonlar');

const FONT_BAGLANTISI =
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=block" rel="stylesheet">';
const FONT_AILESI = '"Plus Jakarta Sans","Segoe UI",system-ui,sans-serif';

const MARKA = { yesil: '#4CAF50', koyu: '#388E3C', acik: '#C8E6C9' };

const ZEMIN = {
    acik: {
        arka: 'linear-gradient(180deg, #E6F2E7 0%, #F5FAF5 38%, #FFFFFF 100%)',
        baslik: '#12301B',
        alt: '#4A5F50',
        yay: 'rgba(56,142,60,0.38)',
        nokta: '#9CCB9F',
        vurgu: MARKA.yesil,
        hale: 'rgba(76,175,80,0.20)',
        cihazGolge: 'rgba(18,48,27,0.22)',
        yildiz: false,
    },
    gece: {
        arka: 'linear-gradient(180deg, #08200F 0%, #0E2E1A 55%, #164229 100%)',
        baslik: '#F3FAF3',
        alt: 'rgba(226,242,227,0.76)',
        yay: 'rgba(200,230,201,0.34)',
        nokta: 'rgba(200,230,201,0.55)',
        vurgu: '#A5D6A7',
        hale: 'rgba(165,214,167,0.22)',
        cihazGolge: 'rgba(0,0,0,0.5)',
        yildiz: true,
    },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const satirlar = (s) => esc(s).replace(/\n/g, '<br>');

/** Ikinci derece Bezier uzerinde nokta. */
function bezier(t, p0, p1, p2) {
    const u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

/** Rastgele gorunen ama her calismada AYNI yildizlar (karsilastirilabilir cikti). */
function yildizlar(gen, yuk, adet, renk) {
    let tohum = 7;
    const r = () => ((tohum = (tohum * 9301 + 49297) % 233280) / 233280);
    let s = '';
    for (let i = 0; i < adet; i++) {
        const x = r() * gen;
        const y = r() * yuk;
        const b = 0.6 + r() * 1.8;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${b.toFixed(2)}" fill="${renk}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
    }
    return s;
}

/** Vakit yayi (imza ogesi). `vakit`: 0..4 vurgulanan nokta; null ise vurgusuz. */
function vakitYayi(gen, yayYuk, k, z, vakit) {
    const p0 = [-0.04 * gen, yayYuk];
    const p1 = [gen / 2, -0.32 * yayYuk];
    const p2 = [1.04 * gen, yayYuk];
    const noktalar = [0.14, 0.32, 0.5, 0.68, 0.86].map((t) => bezier(t, p0, p1, p2));
    let svg = `<path d="M${p0[0]},${p0[1]} Q${p1[0]},${p1[1]} ${p2[0]},${p2[1]}" fill="none" stroke="${z.yay}" stroke-width="${Math.max(1.5, 3 * k)}"/>`;
    noktalar.forEach(([x, y], i) => {
        if (i === vakit) {
            svg += `<circle cx="${x}" cy="${y}" r="${46 * k}" fill="${z.hale}"/>`;
            svg += `<circle cx="${x}" cy="${y}" r="${17 * k}" fill="${z.vurgu}"/>`;
        } else {
            svg += `<circle cx="${x}" cy="${y}" r="${8 * k}" fill="${z.nokta}"/>`;
        }
    });
    return svg;
}

/** Cihaz cercevesi: telefon/tablet/tv. `kirpAlt`: ham karenin altindan kesilecek oran. */
function cerceve(tur, gorsel, gen, k, z, secenek = {}) {
    const { kirpAlt = 0, boyut } = secenek;
    // Ham karenin en-boy orani (kirpilmis); boyut verilmezse 9:19.5 varsayilir.
    const oran = boyut ? (boyut.yuk * (1 - kirpAlt)) / boyut.gen : 2.1;
    // `gorsel`: ekran goruntusu adresi ya da { html } (ekranin cizimi; ornegin alarm).
    const ic =
        gorsel && typeof gorsel === 'object'
            ? `<div style="position:absolute;inset:0">${gorsel.html}</div>`
            : `<img src="${gorsel}" style="position:absolute;left:0;top:0;width:100%;display:block">`;
    const ekran = (yaricap) =>
        `<div style="position:relative;width:100%;height:${(oran * 100).toFixed(3)}%;padding-top:${(oran * 100).toFixed(3)}%;border-radius:${yaricap}px;overflow:hidden;background:#000">` +
        ic +
        `</div>`;
    const golge = `0 ${60 * k}px ${120 * k}px ${z.cihazGolge}, 0 ${10 * k}px ${30 * k}px ${z.cihazGolge}`;
    if (tur === 'tv') {
        const cerc = Math.max(4, 14 * k);
        return (
            `<div style="width:${gen}px">` +
            `<div style="padding:${cerc}px;background:#141414;border-radius:${18 * k}px;box-shadow:${golge}">${ekran(6 * k).replace('height:' + (oran * 100).toFixed(3) + '%;', '')}</div>` +
            `<div style="margin:0 auto;width:${gen * 0.22}px;height:${26 * k}px;background:linear-gradient(#2a2a2a,#151515);clip-path:polygon(12% 0,88% 0,100% 100%,0 100%)"></div>` +
            `</div>`
        );
    }
    const tabletMi = tur === 'tablet' || tur === 'ipad' || tur === 'ipadYatay';
    const cerc = tabletMi ? (tur === 'tablet' ? 22 : 30) * k : 16 * k;
    // Android durum cubugu kenara dayali: buyuk yaricap "9:41"in ilk rakamini keser.
    const yaricap = tabletMi ? (tur === 'tablet' ? 46 : 64) * k : secenek.yaricap || 96 * k;
    return (
        `<div style="width:${gen}px;padding:${cerc}px;background:#0E0E11;border-radius:${yaricap + cerc}px;box-shadow:${golge}">` +
        ekran(yaricap).replace('height:' + (oran * 100).toFixed(3) + '%;', '') +
        `</div>`
    );
}

/** Yuvarlak saat (Wear OS): kasa + kordon + kurma kolu. */
/**
 * Saatin sessiz uyandirma ekrani (`wear/.../ui/UyandirmaAktivite.kt`) — ham kare
 * yoksa ayni duzen ve uygulamanin GERCEK metinleriyle cizilir: baslik, govde, Kildim, Kapat.
 */
function uyandirmaEkrani(cap) {
    const p = cap / 454;
    const dugme = (metin, zemin, renk) =>
        `<div style="margin-top:${8 * p}px;width:${190 * p}px;height:${46 * p}px;border-radius:999px;background:${zemin};color:${renk};display:flex;align-items:center;justify-content:center;font-family:Roboto,'Segoe UI',sans-serif;font-weight:600;font-size:${20 * p}px">${metin}</div>`;
    return (
        `<div style="width:100%;height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 ${56 * p}px;text-align:center;font-family:Roboto,'Segoe UI',sans-serif">` +
        `<div style="color:#FFFFFF;font-weight:600;font-size:${27 * p}px;line-height:1.2">Sabah · 25 dk kaldı ⏰</div>` +
        `<div style="margin-top:${8 * p}px;color:#B8C2BA;font-size:${19 * p}px;line-height:1.3">Vakit daralmaya başladı, fırsat varken kıl.</div>` +
        dugme('Kıldım', '#6CC070', '#0B2214') +
        dugme('Kapat', '#26332C', '#E2F2E3') +
        `</div>`
    );
}

function yuvarlakSaat(gorsel, cap, z, kordon = true) {
    const kasa = cap * 0.07;
    // Kayis: kasanin altina ve ustune KISA uzanan, kenarlari yumusak, zarif bir bant.
    const kordonGen = cap * 0.46;
    const kordonHtml = kordon
        ? `<div style="position:absolute;left:${(cap + kasa * 2 - kordonGen) / 2}px;width:${kordonGen}px;top:${-cap * 0.3}px;height:${cap * 1.6 + kasa * 2}px;border-radius:${cap * 0.08}px;` +
          `background:linear-gradient(180deg, rgba(38,51,44,0) 0%, #26332C 22%, #26332C 78%, rgba(38,51,44,0) 100%)"></div>`
        : '';
    const url = typeof gorsel === 'string' ? gorsel : gorsel && gorsel.url;
    const icerik = gorsel && gorsel.cizim === 'uyandirma' ? uyandirmaEkrani(cap) : `<img src="${url}" style="width:100%;height:100%;display:block">`;
    return (
        `<div style="position:relative;width:${cap + kasa * 2}px;height:${cap + kasa * 2}px">` +
        kordonHtml +
        `<div style="position:absolute;right:${-kasa * 0.55}px;top:${(cap + kasa * 2) / 2 - cap * 0.07}px;width:${kasa * 1.1}px;height:${cap * 0.14}px;border-radius:${kasa * 0.4}px;background:#3A3D40"></div>` +
        `<div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 35% 30%, #4a4d52, #1b1c1f 70%);box-shadow:0 ${cap * 0.08}px ${cap * 0.18}px ${z.cihazGolge}"></div>` +
        `<div style="position:absolute;left:${kasa}px;top:${kasa}px;width:${cap}px;height:${cap}px;border-radius:50%;overflow:hidden;background:#000">${icerik}</div>` +
        `</div>`
    );
}

function rozetHtml(rozet, k, z) {
    if (!rozet) return '';
    const chip = 92 * k;
    return (
        `<div class="rozet" style="display:inline-flex;align-items:center;gap:${26 * k}px;padding:${24 * k}px ${44 * k}px ${24 * k}px ${24 * k}px;` +
        `background:#FFFFFF;border-radius:${999}px;box-shadow:0 ${24 * k}px ${60 * k}px rgba(18,48,27,0.22)">` +
        `<span style="display:inline-flex;align-items:center;justify-content:center;width:${chip}px;height:${chip}px;border-radius:50%;background:${MARKA.yesil}">${ikon(rozet.ikon, '#FFFFFF', chip * 0.56)}</span>` +
        `<span style="font-size:${44 * k}px;font-weight:700;color:#12301B;white-space:nowrap">${esc(rozet.metin)}</span></div>`
    );
}

/**
 * Sistem bildirimine benzeyen kart: uygulama ikonu + ad + GERCEK baslik/govde metni.
 * Metin uygulamanin bildirim ureticilerinden kopyalanmistir (setler.js'te kaynak notu).
 */
function bildirimHtml(bildirim, gen, k, ikonUrl) {
    if (!bildirim) return '';
    const ikonKutu = 64 * k;
    return (
        `<div style="width:${gen}px;padding:${34 * k}px ${40 * k}px ${38 * k}px;border-radius:${48 * k}px;background:#FFFFFF;` +
        `box-shadow:0 ${36 * k}px ${90 * k}px rgba(18,48,27,0.20), 0 ${6 * k}px ${18 * k}px rgba(18,48,27,0.10)">` +
        `<div style="display:flex;align-items:center;gap:${18 * k}px">` +
        (ikonUrl
            ? `<span style="width:${ikonKutu}px;height:${ikonKutu}px;border-radius:${16 * k}px;overflow:hidden;position:relative;flex:none">` +
              `<img src="${ikonUrl}" style="position:absolute;width:${(ikonKutu * 1024) / 685}px;left:-${(170 * ikonKutu) / 685}px;top:-${(172 * ikonKutu) / 685}px"></span>`
            : '') +
        `<span style="font-size:${34 * k}px;font-weight:600;color:#4A5F50">Namaz Akışı · şimdi</span></div>` +
        `<div style="margin-top:${18 * k}px;font-size:${42 * k}px;font-weight:800;color:#12301B;line-height:1.25">${esc(bildirim.baslik)}</div>` +
        `<div style="margin-top:${8 * k}px;font-size:${37 * k}px;font-weight:500;color:#33463A;line-height:1.38">${esc(bildirim.govde)}</div>` +
        `</div>`
    );
}

/**
 * Calan gercek alarm ekraninin SADE cizimi (ekran goruntusu alinamaz: kilit ekrani /
 * tam ekran alarm). Metinler uygulamanin gercek alarm yukunden:
 *   iOS  — AlarmKit sistem ekrani: baslik = alarm kaydinin basligi, dugmeler "Kıldım" +
 *          sistemin "Durdur"u (targets/muhafiz-alarmkit/NamazAlarmPlanlayici.swift).
 *   Android — MuhafizAlarmActivity: vakit adi, saat, baslik, metin, "Kıldım" / "Kapat"
 *          (android/.../alarm/MuhafizAlarmActivity.kt; gece renkleri alarm_renkleri.xml).
 * `g`: ekran genisligi (px). Cizim ekranin tamamini kaplar.
 */
function alarmEkrani(a, platform, g) {
    const p = g / 400;
    const yazi = "font-family:-apple-system,'SF Pro Display',Roboto,'Segoe UI',sans-serif";
    if (platform === 'ios') {
        return (
            `<div style="position:absolute;inset:0;${yazi};background:radial-gradient(120% 70% at 50% 0%, #2C4A36 0%, #0D1A12 55%, #050806 100%);color:#fff;text-align:center">` +
            `<div style="margin-top:${78 * p}px;font-size:${17 * p}px;font-weight:600;opacity:0.85">${esc(a.tarih)}</div>` +
            `<div style="font-size:${96 * p}px;font-weight:600;letter-spacing:-0.02em;line-height:1">${esc(a.saat)}</div>` +
            `<div style="position:absolute;left:${16 * p}px;right:${16 * p}px;top:${300 * p}px;padding:${18 * p}px;border-radius:${26 * p}px;background:rgba(255,255,255,0.14);text-align:left">` +
            `<div style="font-size:${13 * p}px;font-weight:600;opacity:0.75">Alarm</div>` +
            `<div style="margin-top:${4 * p}px;font-size:${22 * p}px;font-weight:700">${esc(a.baslik)}</div>` +
            `<div style="display:flex;gap:${10 * p}px;margin-top:${16 * p}px">` +
            `<div style="flex:1;height:${46 * p}px;border-radius:999px;background:#4CAF50;display:flex;align-items:center;justify-content:center;font-size:${17 * p}px;font-weight:700">✓ Kıldım</div>` +
            `<div style="flex:1;height:${46 * p}px;border-radius:999px;background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;font-size:${17 * p}px;font-weight:700">■ Durdur</div>` +
            `</div></div></div>`
        );
    }
    return (
        `<div style="position:absolute;inset:0;${yazi};background:#121613;color:#F1F5F1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:${70 * p}px ${24 * p}px ${36 * p}px">` +
        `<div style="width:${80 * p}px;height:${80 * p}px;border-radius:50%;background:#1E2420;display:flex;align-items:center;justify-content:center">${ikon('alarm', '#81C784', 44 * p)}</div>` +
        `<div style="margin-top:${16 * p}px;font-size:${30 * p}px;font-weight:700">${esc(a.vakitAdi)}</div>` +
        `<div style="font-size:${64 * p}px;font-weight:300;line-height:1.05">${esc(a.saat)}</div>` +
        `<div style="margin-top:${14 * p}px;font-size:${17 * p}px;font-weight:700">${esc(a.baslik)}</div>` +
        `<div style="margin-top:${6 * p}px;font-size:${14 * p}px;color:#B3BDB5">${esc(a.metin)}</div>` +
        `<div style="flex:1"></div>` +
        `<div style="width:100%;height:${52 * p}px;border-radius:${26 * p}px;background:#81C784;color:#0B1F0D;display:flex;align-items:center;justify-content:center;font-size:${19 * p}px;font-weight:700">Kıldım</div>` +
        `<div style="margin-top:${12 * p}px;width:100%;height:${48 * p}px;border-radius:${24 * p}px;border:${1.5 * p}px solid #36403A;background:#1E2420;display:flex;align-items:center;justify-content:center;font-size:${16 * p}px;font-weight:600">Kapat</div>` +
        `</div>`
    );
}

/**
 * Apple Watch sessiz uyandirma ekrani (`targets/saat/UyandirmaEkrani.swift`) — simulator
 * karesi bos geldiginden ayni duzen ve GERCEK metinlerle cizilir: sabah ikonu + "Sabah",
 * saat, kum saati + vaktin sonu, "Kıldım" (sabah tonu) ve kapatma (x) dugmesi.
 * `g`: ekran genisligi (px), 422 olcegi.
 */
function appleUyandirmaEkrani(g) {
    const p = g / 422;
    const a = { saat: '06:51', vaktinSonu: '07:16' };
    const yazi = "font-family:-apple-system,'SF Pro Rounded','SF Pro Display','Segoe UI',sans-serif";
    const ton = '#B39DDB';
    return (
        `<div style="position:absolute;inset:0;${yazi};background:radial-gradient(90% 55% at 50% 0%, rgba(149,117,205,0.55) 0%, rgba(0,0,0,0) 70%), #000;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 ${26 * p}px">` +
        `<div style="display:flex;align-items:center;gap:${12 * p}px">` +
        `<span style="width:${60 * p}px;height:${60 * p}px;border-radius:50%;background:rgba(179,157,219,0.25);box-shadow:0 0 0 ${4 * p}px rgba(179,157,219,0.35);display:flex;align-items:center;justify-content:center">${ikon('gunes', ton, 34 * p)}</span>` +
        `<span style="font-size:${36 * p}px;font-weight:700">Sabah</span></div>` +
        `<div style="margin-top:${10 * p}px;font-size:${64 * p}px;font-weight:600;letter-spacing:-0.01em;line-height:1">${a.saat}</div>` +
        `<div style="margin-top:${10 * p}px;font-size:${26 * p}px;color:#9A9AA0">⌛ ${a.vaktinSonu}</div>` +
        `<div style="margin-top:${22 * p}px;display:flex;gap:${12 * p}px;width:100%">` +
        `<div style="flex:1;height:${76 * p}px;border-radius:999px;background:${ton};color:#1A1033;display:flex;align-items:center;justify-content:center;font-size:${30 * p}px;font-weight:700">✓ Kıldım</div>` +
        `<div style="width:${96 * p}px;height:${76 * p}px;border-radius:999px;background:#2A2A2E;display:flex;align-items:center;justify-content:center;font-size:${30 * p}px;font-weight:700">✕</div>` +
        `</div></div>`
    );
}

/**
 * Kible kamera ekrani: emulatorun sanal odasi (renkli bloklar) kameranin GORDUGU yerdir,
 * uygulamanin arayuzu degil. Gorselde ust (baslik + Pusula/Kamera) ve alt (sekme cubugu)
 * GERCEK kareden kesilir; kamera alani sade, bulanik bir avlu zemini uzerine uygulamanin
 * kendi katmaniyla (yere cizilen yol, oklar, Kabe isareti, mesafe, "Kible yonundesiniz"
 * karti) yeniden cizilir (src/presentation/screens/KibleSayfasi/KibleYolu.tsx ile ayni
 * ogeler). Koordinatlar 1080x2400 kaynaga gore: kamera alani 522..2166.
 */
function kibleKameraEkrani(url, g) {
    const s = g / 1080;
    const U = 522 * s;
    const A = 2166 * s;
    const ufuk = 860 * s;
    const vx = 540 * s;
    let zemin = '';
    // Avlu taslari: kacis noktasina giden cizgiler + yatay derzler.
    for (let i = -7; i <= 7; i++) zemin += `<line x1="${vx}" y1="${ufuk}" x2="${vx + i * 260 * s}" y2="${A}" stroke="rgba(120,104,84,0.35)" stroke-width="${2.2 * s}"/>`;
    for (let j = 1; j <= 9; j++) {
        const t = Math.pow(j / 9, 1.9);
        const y = ufuk + (A - ufuk) * t;
        zemin += `<line x1="0" y1="${y}" x2="${g}" y2="${y}" stroke="rgba(120,104,84,0.30)" stroke-width="${2 * s}"/>`;
    }
    // Yol: Kabe'nin altindan ekranin altina genisleyen huzme + oklar.
    const tepeY = 800 * s;
    const yol =
        `<polygon points="${vx - 18 * s},${tepeY} ${vx + 18 * s},${tepeY} ${1000 * s},${A} ${80 * s},${A}" fill="rgba(76,175,80,0.30)" stroke="rgba(46,125,50,0.95)" stroke-width="${6 * s}" stroke-linejoin="round"/>` +
        [930, 1010, 1110, 1240, 1420, 1700]
            .map((y0, i) => {
                const y = y0 * s;
                const yari = (18 + ((y0 - 800) / (2166 - 800)) * 442) * s;
                const w = yari * 0.62;
                const h = w * 0.34;
                const kal = (5 + i * 3) * s;
                return `<polyline points="${vx - w},${y + h} ${vx},${y} ${vx + w},${y + h}" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="${kal}" stroke-linecap="round" stroke-linejoin="round"/>`;
            })
            .join('') +
        `<circle cx="${vx}" cy="${1340 * s}" r="${120 * s}" fill="none" stroke="rgba(46,125,50,0.9)" stroke-width="${5 * s}"/>` +
        `<circle cx="${vx}" cy="${1340 * s}" r="${54 * s}" fill="#43A047"/>` +
        `<polyline points="${vx - 24 * s},${1340 * s} ${vx - 6 * s},${1358 * s} ${vx + 26 * s},${1322 * s}" fill="none" stroke="#fff" stroke-width="${10 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const kes = (y0, y1) =>
        `<div style="position:absolute;left:0;top:${y0 * s}px;width:${g}px;height:${(y1 - y0) * s}px;overflow:hidden">` +
        `<img src="${url}" style="position:absolute;left:0;top:${-y0 * s}px;width:${g}px"></div>`;
    // Kabe isareti gercek kareden kesilir (468..594 x 690..816).
    const kx = vx;
    const ky = 700 * s;
    const kw = 62 * s;
    const kabe =
        `<svg style="position:absolute;left:0;top:0" width="${g}" height="${A}">` +
        `<polygon points="${kx - kw},${ky + 18 * s} ${kx},${ky - 6 * s} ${kx + kw},${ky + 18 * s} ${kx},${ky + 42 * s}" fill="#3A3A3A"/>` +
        `<polygon points="${kx - kw},${ky + 18 * s} ${kx},${ky + 42 * s} ${kx},${ky + 118 * s} ${kx - kw},${ky + 94 * s}" fill="#151515"/>` +
        `<polygon points="${kx},${ky + 42 * s} ${kx + kw},${ky + 18 * s} ${kx + kw},${ky + 94 * s} ${kx},${ky + 118 * s}" fill="#262626"/>` +
        `<polygon points="${kx - kw},${ky + 34 * s} ${kx},${ky + 58 * s} ${kx},${ky + 70 * s} ${kx - kw},${ky + 46 * s}" fill="#C9A227"/>` +
        `<polygon points="${kx},${ky + 58 * s} ${kx + kw},${ky + 34 * s} ${kx + kw},${ky + 46 * s} ${kx},${ky + 70 * s}" fill="#B08D1E"/>` +
        `<rect x="${kx + 26 * s}" y="${ky + 64 * s}" width="${14 * s}" height="${26 * s}" fill="#C9A227" transform="skewY(-25)" transform-origin="${kx + 33 * s} ${ky + 77 * s}"/>` +
        `</svg>`;
    const yazi = "font-family:Roboto,'Segoe UI',sans-serif;color:#fff;text-align:center";
    return (
        `<div style="position:absolute;inset:0;background:#F7F7F7">` +
        `<div style="position:absolute;left:0;top:${U}px;width:${g}px;height:${A - U}px;overflow:hidden;` +
        `background:linear-gradient(180deg,#B9CFE0 0%,#DCE6EC ${((ufuk - U) / (A - U)) * 100 - 4}%,#D8CDBB ${((ufuk - U) / (A - U)) * 100}%,#C9B79C 100%);filter:blur(${1.2 * s}px)">` +
        `<div style="position:absolute;left:${120 * s}px;top:${ufuk - U - 210 * s}px;width:${840 * s}px;height:${210 * s}px;background:linear-gradient(180deg,#E9E1D3,#D7CBB6);border-radius:${6 * s}px ${6 * s}px 0 0;opacity:0.9"></div>` +
        `<div style="position:absolute;left:${420 * s}px;top:${ufuk - U - 360 * s}px;width:${240 * s}px;height:${160 * s}px;background:#D9CFBE;border-radius:${120 * s}px ${120 * s}px 0 0;opacity:0.9"></div>` +
        `<svg style="position:absolute;left:0;top:${-U}px" width="${g}" height="${A}">${zemin}</svg></div>` +
        `<svg style="position:absolute;left:0;top:0" width="${g}" height="${A}">${yol}</svg>` +
        kabe +
        `<div style="position:absolute;left:${vx - 78 * s}px;top:${855 * s}px;width:${156 * s}px;height:${58 * s}px;border-radius:999px;background:rgba(80,80,80,0.78);${yazi};font-size:${27 * s}px;font-weight:700;line-height:${58 * s}px">2.405 km</div>` +
        `<div style="position:absolute;left:${42 * s}px;top:${1946 * s}px;width:${996 * s}px;height:${178 * s}px;border-radius:${60 * s}px;background:rgba(30,40,32,0.78);${yazi}">` +
        `<div style="margin-top:${30 * s}px;font-size:${44 * s}px;font-weight:700">Kıble yönündesiniz</div>` +
        `<div style="margin-top:${6 * s}px;font-size:${30 * s}px">Kâbe 2.405 km uzakta</div></div>` +
        kes(0, 522) +
        kes(2166, 2400) +
        `</div>`
    );
}

/** Apple Watch: yuvarlatilmis kasa + kurma kolu. `gorsel`: adres ya da { cizim }. */
function appleSaat(gorsel, ekGen, boyut, z) {
    const oran = boyut ? boyut.yuk / boyut.gen : 514 / 422;
    const kasa = ekGen * 0.07;
    const cizimMi = gorsel && typeof gorsel === 'object' && gorsel.cizim === 'appleUyandirma';
    const url = typeof gorsel === 'string' ? gorsel : gorsel && gorsel.url;
    const ic = cizimMi
        ? `<div style="position:relative;width:100%;height:100%">${appleUyandirmaEkrani(ekGen)}</div>`
        : `<img src="${url}" style="width:100%;display:block">`;
    return (
        `<div style="position:relative;padding:${kasa}px;border-radius:${ekGen * 0.3}px;background:radial-gradient(circle at 30% 20%, #4a4d52, #1b1c1f 70%);box-shadow:0 ${ekGen * 0.08}px ${ekGen * 0.2}px ${z.cihazGolge}">` +
        `<div style="position:absolute;right:${-kasa * 0.7}px;top:${ekGen * 0.28}px;width:${kasa}px;height:${ekGen * 0.2}px;border-radius:${kasa * 0.4}px;background:#3A3D40"></div>` +
        `<div style="width:${ekGen}px;height:${ekGen * oran}px;border-radius:${ekGen * 0.24}px;overflow:hidden;background:#000">${ic}</div></div>`
    );
}

/** Takvimin bir gunu (gorsel anlati): kendi namaz etkinligimiz + bir toplanti + vaktin sonu. */
function takvimGunu(t, gen, k, yukseklik) {
    const basSaat = 12;
    const bitSaat = 17;
    // Verilen yuksekligi doldurur (bos alt bant kalmasin).
    const satirYuk = yukseklik ? (yukseklik - 120 * k) / (bitSaat - basSaat) : 190 * k;
    const ust = 40 * k;
    const dk = (s) => {
        const [h, m] = s.split(':').map(Number);
        return (h - basSaat) * 60 + m;
    };
    const y = (s) => ust + (dk(s) / 60) * satirYuk;
    const solSutun = 140 * k;
    let h = '';
    for (let saat = basSaat; saat <= bitSaat; saat++) {
        const yy = ust + (saat - basSaat) * satirYuk;
        h += `<div style="position:absolute;left:0;top:${yy - 20 * k}px;width:${solSutun - 24 * k}px;text-align:right;font-size:${32 * k}px;font-weight:600;color:#7A8C80">${String(saat).padStart(2, '0')}:00</div>`;
        h += `<div style="position:absolute;left:${solSutun}px;right:0;top:${yy}px;height:${Math.max(1, 2 * k)}px;background:#E3ECE4"></div>`;
    }
    // Vakit bandi (giris -> cikis): uygulamanin takvime yazdigi namaz etkinligi.
    const bandY = y(t.vakitGiris);
    const bandH = y(t.vakitCikis) - bandY;
    h += `<div style="position:absolute;left:${solSutun + 10 * k}px;width:${200 * k}px;top:${bandY}px;height:${bandH}px;border-radius:${20 * k}px;background:rgba(76,175,80,0.16);border-left:${8 * k}px solid ${MARKA.yesil};padding:${20 * k}px ${18 * k}px">` +
        `<div style="font-size:${34 * k}px;font-weight:800;color:${MARKA.koyu};line-height:1.15">${esc(t.vakitAdi)}<br>namazı</div>` +
        `<div style="font-size:${28 * k}px;font-weight:600;color:${MARKA.koyu};opacity:0.8;margin-top:${6 * k}px">${t.vakitGiris}</div></div>`;
    // Toplanti blogu: baska bir takvimden (renk dekoratif, takvim uygulamalarinin mavisi).
    const tx = solSutun + 240 * k;
    h += `<div style="position:absolute;left:${tx}px;right:${20 * k}px;top:${y(t.etkinlik.bas)}px;height:${y(t.etkinlik.bit) - y(t.etkinlik.bas)}px;border-radius:${24 * k}px;background:#E4EBFA;border-left:${8 * k}px solid #5B7BD5;padding:${22 * k}px ${28 * k}px">` +
        `<div style="font-size:${40 * k}px;font-weight:800;color:#24366B">Toplantı</div>` +
        `<div style="font-size:${32 * k}px;font-weight:600;color:#4B5D93;margin-top:${6 * k}px">${t.etkinlik.bas} – ${t.etkinlik.bit}</div></div>`;
    // Vaktin sonu cizgisi.
    const cy = y(t.vakitCikis);
    h += `<div style="position:absolute;left:${solSutun - 6 * k}px;right:0;top:${cy - 2 * k}px;height:${5 * k}px;background:#C62828"></div>`;
    h += `<div style="position:absolute;left:${solSutun - 18 * k}px;top:${cy - 12 * k}px;width:${28 * k}px;height:${28 * k}px;border-radius:50%;background:#C62828"></div>`;
    h += `<div style="position:absolute;right:${28 * k}px;top:${cy - 66 * k}px;padding:${8 * k}px ${18 * k}px;border-radius:${14 * k}px;background:#C62828;color:#fff;font-size:${30 * k}px;font-weight:700">${esc(t.vakitAdi)} vakti çıkar ${t.vakitCikis}</div>`;
    const yuk = ust + (bitSaat - basSaat) * satirYuk + 40 * k;
    return `<div style="position:relative;width:${gen}px;height:${yuk}px;border-radius:${56 * k}px;background:#FFFFFF;box-shadow:0 ${40 * k}px ${100 * k}px rgba(18,48,27,0.18)"><div style="position:absolute;left:${30 * k}px;right:${30 * k}px;top:${20 * k}px;bottom:0">${h}</div></div>`;
}

function belge(gen, yuk, z, govde, ekStil = '') {
    return `<!doctype html><html lang="tr"><head><meta charset="utf-8">${FONT_BAGLANTISI}<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${gen}px; height:${yuk}px; overflow:hidden; }
  body { background:#FFFFFF; font-family:${FONT_AILESI}; position:relative; -webkit-font-smoothing:antialiased; }
  .zemin { position:absolute; inset:0; background:${z.arka}; }
  h1 { font-weight:800; letter-spacing:-0.028em; color:${z.baslik}; }
  .alt { font-weight:500; color:${z.alt}; }
  ${ekStil}
</style></head><body><div class="zemin"></div>${govde}</body></html>`;
}

/** Herhangi bir saat (Apple Watch kasasi ya da yuvarlak Wear) — boyut = genislik. */
function saatCiz(s, boyut, z) {
    if (!s) return '';
    if (s.cihaz === 'appleWatch') return appleSaat(s, boyut * 0.86, s.boyut, z);
    return yuvarlakSaat(s, boyut, z, false);
}

/** Dikey karede metin blogunun tahmini alt kenari (tarayicisiz; ayni olcu testte de). */
function metinAlti(kare, k) {
    const satir = kare.baslik.split('\n').length;
    let h = 330 * k + satir * 118 * k * 1.06;
    if (kare.alt) {
        const altGen = 1060 * k;
        const altSatir = Math.ceil((kare.alt.length * ORTALAMA_GENISLIK.alt * 50 * k) / altGen);
        h += 36 * k + altSatir * 50 * k * 1.38;
    }
    if (kare.dipnot) h += 18 * k + 34 * k * 1.3;
    return h;
}

/** Dikey (telefon) kare. */
function dikey(kareHam, b, gorseller, ikonUrl) {
    const kare =
        kareHam.yerlesim === 'kolaj' && kareHam.altTabletsiz && !gorseller.some((g) => g.cihaz === 'tablet')
            ? { ...kareHam, alt: kareHam.altTabletsiz }
            : kareHam;
    const { gen, yuk } = b;
    const k = gen / 1320;
    const z = ZEMIN[kare.zemin || 'acik'];
    const yayYuk = 420 * k;
    const pad = 104 * k;
    const yay =
        `<svg style="position:absolute;left:0;top:0" width="${gen}" height="${yuk}" viewBox="0 0 ${gen} ${yuk}">` +
        (z.yildiz ? yildizlar(gen, yuk * 0.45, 60, '#E8F5E9') : '') +
        vakitYayi(gen, yayYuk, k, z, kare.vakit) +
        `</svg>`;
    const metin =
        `<div style="position:absolute;left:${pad}px;right:${pad}px;top:${330 * k}px">` +
        `<h1 style="font-size:${118 * k}px;line-height:1.06">${satirlar(kare.baslik)}</h1>` +
        (kare.alt ? `<p class="alt" style="margin-top:${36 * k}px;font-size:${50 * k}px;line-height:1.38;max-width:${1060 * k}px">${esc(kare.alt)}</p>` : '') +
        (kare.dipnot ? `<p class="alt" style="margin-top:${18 * k}px;font-size:${34 * k}px;line-height:1.3;opacity:0.85">${esc(kare.dipnot)}</p>` : '') +
        `</div>`;
    // Cihaz bolgesi metnin altindan baslar ve tuvalin altindan TASAR.
    const cihazUst = metinAlti(kare, k) + 90 * k;
    let alan = '';
    const yer = kare.yerlesim || 'cihaz';

    if (yer === 'cihaz' || yer === 'liste') {
        const g = gorseller[0];
        let cihazGen = (kare.cihazGen || 900) * k;
        let ust = cihazUst;
        let liste = '';
        if (yer === 'liste') {
            const satir = (m) =>
                `<div style="display:flex;align-items:center;gap:${30 * k}px;margin-bottom:${30 * k}px">` +
                `<span style="flex:none;display:inline-flex;align-items:center;justify-content:center;width:${96 * k}px;height:${96 * k}px;border-radius:${30 * k}px;background:rgba(76,175,80,0.14)">${ikon(m.ikon, MARKA.koyu, 54 * k)}</span>` +
                `<span style="font-size:${50 * k}px;font-weight:700;color:${z.baslik}">${esc(m.metin)}</span></div>`;
            liste = `<div style="position:absolute;left:${pad}px;top:${cihazUst - 40 * k}px">${kare.maddeler.map(satir).join('')}</div>`;
            ust = cihazUst + kare.maddeler.length * 126 * k + 30 * k;
            cihazGen = 780 * k;
        }
        const gorunur = kare.gorunur || 1;
        const maske =
            gorunur < 1 && g
                ? (() => {
                      // Ekran gorselinin `gorunur` oranindan sonrasi zemine eriyerek kaybolur.
                      const ekranYuk = (cihazGen - 32 * k) * ((g.boyut.yuk * (1 - (kare.kirpAlt || 0))) / g.boyut.gen);
                      const bitis = 16 * k + ekranYuk * gorunur;
                      return `-webkit-mask-image:linear-gradient(180deg,#000 0,#000 ${bitis - 260 * k}px,transparent ${bitis}px);`;
                  })()
                : '';
        alan =
            liste +
            `<div style="position:absolute;left:${(gen - cihazGen) / 2}px;top:${ust}px;${maske}">` +
            (g ? cerceve('telefon', g.url, cihazGen, k, z, { boyut: g.boyut, kirpAlt: kare.kirpAlt, yaricap: g.cihaz === 'androidTelefon' ? 60 * k : undefined }) : '') +
            `</div>`;
        if (kare.rozet) {
            const rx = kare.rozet.yer === 'sol' ? `left:${pad * 0.55}px` : `right:${pad * 0.55}px`;
            alan += `<div style="position:absolute;${rx};top:${ust + (yuk - ust) * kare.rozet.y}px">${rozetHtml(kare.rozet, k, z)}</div>`;
        }
        const bilekEk = gorseller.find((x) => x !== g && (x.cihaz === 'appleWatch' || x.cihaz === 'wearYuvarlak'));
        if (bilekEk) alan += `<div style="position:absolute;right:${50 * k}px;top:${yuk - 640 * k}px">${saatCiz(bilekEk, 470 * k, z)}</div>`;
        if (kare.bildirim) {
            const bg = 1120 * k;
            // Kart cihazin ust kenarindan biraz yukarida baslar: ekranin basligini TUMDEN
            // orter (arkadan yari gorunen baslik dagınık durur).
            alan += `<div style="position:absolute;left:${(gen - bg) / 2}px;top:${ust - 60 * k + (yuk - ust) * kare.bildirim.y}px">${bildirimHtml(kare.bildirim, bg, k, ikonUrl)}</div>`;
        }
    } else if (yer === 'takvim') {
        const kg = gen - 2 * pad + 40 * k;
        const ust = cihazUst + 330 * k;
        const kartYuk = yuk - ust - 110 * k;
        alan =
            `<div style="position:absolute;left:${(gen - kg) / 2}px;top:${ust}px">${takvimGunu(kare.takvim, kg, k, kartYuk)}</div>` +
            `<div style="position:absolute;left:${(gen - 1120 * k) / 2}px;top:${cihazUst - 20 * k}px">${bildirimHtml(kare.bildirim, 1120 * k, k, ikonUrl)}</div>`;
    } else if (yer === 'alarm') {
        // Buyuk telefon: calan alarm (cizim). Kucuk telefon: adim penceresi (gercek alarm acik).
        const platform = b.platform;
        const boyut = platform === 'ios' ? { gen: 1320, yuk: 2868 } : { gen: 1080, yuk: 2400 };
        // Alarm ekraninin dugmeleri altta: telefon tuvale BUTUN sigar (tasmaz).
        const buyukGen = Math.min(820 * k, (yuk - cihazUst - 90 * k) / (boyut.yuk / boyut.gen) + 32 * k);
        const ekranGen = buyukGen - 32 * k;
        alan += `<div style="position:absolute;left:${90 * k}px;top:${cihazUst}px">${cerceve('telefon', { html: alarmEkrani(kare.alarm, platform, ekranGen) }, buyukGen, k, z, { boyut, yaricap: platform === 'ios' ? 96 * k : 60 * k })}</div>`;
        const bilek = gorseller.find((g) => g.cihaz === 'appleWatch' || g.cihaz === 'wearYuvarlak');
        const kucuk = gorseller.find((g) => g.cihaz === 'iphone' || g.cihaz === 'androidTelefon');
        if (bilek) alan += `<div style="position:absolute;right:${60 * k}px;top:${cihazUst + 880 * k}px">${saatCiz(bilek, 470 * k, z)}</div>`;
        else if (kucuk)
            alan += `<div style="position:absolute;right:${70 * k}px;top:${cihazUst + 260 * k}px">${cerceve('telefon', kucuk.url, 440 * k, k, z, { boyut: kucuk.boyut, yaricap: kucuk.cihaz === 'androidTelefon' ? 40 * k : 60 * k })}</div>`;
    } else if (yer === 'telefonSaat') {
        const tel = gorseller.find((g) => g.cihaz === 'iphone' || g.cihaz === 'androidTelefon');
        const saat = gorseller.find((g) => g.cihaz === 'appleWatch');
        const ust = cihazUst;
        // `gorunur`: telefon ekraninin o oranindan sonrasi zemine erir (ornegin iOS kible
        // karesinin altindaki "pusula yok" simulator bandi).
        let maske = '';
        if (tel && kare.gorunur) {
            const bitis = 16 * k + (760 * k - 32 * k) * (tel.boyut.yuk / tel.boyut.gen) * kare.gorunur;
            maske = `-webkit-mask-image:linear-gradient(180deg,#000 0,#000 ${bitis - 260 * k}px,transparent ${bitis}px);`;
        }
        if (tel) alan += `<div style="position:absolute;left:${90 * k}px;top:${ust};${maske}">${cerceve('telefon', tel.url, 760 * k, k, z, { boyut: tel.boyut })}</div>`.replace(`top:${ust};`, `top:${ust}px;`);
        if (saat) alan += `<div style="position:absolute;right:${80 * k}px;top:${ust + 760 * k}px">${appleSaat(saat, 420 * k, saat.boyut, z)}</div>`;
    } else if (yer === 'ikiTelefon') {
        // Iki ekran: one buyuk (hikayenin ani), arkada sagda ikinci ekran.
        const [on, arka] = gorseller;
        const yaricap = (g) => (g && g.cihaz === 'androidTelefon' ? 50 * k : 80 * k);
        if (arka) alan += `<div style="position:absolute;right:${70 * k}px;top:${cihazUst + 150 * k}px">${cerceve('telefon', arka.url, 560 * k, k, z, { boyut: arka.boyut, yaricap: yaricap(arka) })}</div>`;
        const onGorsel = on && kare.kibleKamera ? { html: kibleKameraEkrani(on.url, 680 * k - 32 * k) } : on && on.url;
        if (on) alan += `<div style="position:absolute;left:${80 * k}px;top:${cihazUst + 40 * k}px">${cerceve('telefon', onGorsel, 680 * k, k, z, { boyut: on.boyut, yaricap: yaricap(on) })}</div>`;
    } else if (yer === 'telefonTablet') {
        // Tablet arkada (sag kenardan tasar), telefon onde solda.
        const tab = gorseller.find((g) => g.cihaz === 'ipadYatay' || g.cihaz === 'tablet' || g.cihaz === 'ipad');
        const tel = gorseller.find((g) => g.cihaz === 'iphone' || g.cihaz === 'androidTelefon');
        if (tab) alan += `<div style="position:absolute;left:${300 * k}px;top:${cihazUst + 40 * k}px">${cerceve(tab.cihaz, tab.url, 1250 * k, k, z, { boyut: tab.boyut, kirpAlt: tab.kirpAlt })}</div>`;
        if (tel) alan += `<div style="position:absolute;left:${90 * k}px;top:${cihazUst + 620 * k}px">${cerceve('telefon', tel.url, 560 * k, k, z, { boyut: tel.boyut, yaricap: tel.cihaz === 'androidTelefon' ? 50 * k : 80 * k })}</div>`;
    } else if (yer === 'kolaj') {
        const bul = (c) => gorseller.find((g) => g.cihaz === c);
        const tv = bul('tv');
        const tablet = bul('tablet') || bul('ipadYatay');
        const tel = bul('androidTelefon') || bul('iphone');
        const saat = bul('wearYuvarlak') || bul('appleWatch');
        const telYaricap = tel && tel.cihaz === 'iphone' ? 70 * k : 50 * k;
        const ust = cihazUst;
        // Katman sirasi (arkadan one): TV, tablet, telefon, saat. Saat kayissiz ve
        // tabletin ALTINDA durur: kayis tabletin ustune binmesin.
        if (tv) alan += `<div style="position:absolute;left:${104 * k}px;top:${ust}px">${cerceve('tv', tv.url, 960 * k, k, z, { boyut: tv.boyut })}</div>`;
        if (tablet) {
            alan += `<div style="position:absolute;right:${-80 * k}px;top:${ust + 470 * k}px">${cerceve(tablet.cihaz, tablet.url, 860 * k, k, z, { boyut: tablet.boyut, kirpAlt: tablet.cihaz === 'tablet' ? 0.075 : 0 })}</div>`;
            if (tel) alan += `<div style="position:absolute;left:${80 * k}px;top:${ust + 640 * k}px">${cerceve('telefon', tel.url, 500 * k, k, z, { boyut: tel.boyut, yaricap: telYaricap })}</div>`;
            if (saat) alan += `<div style="position:absolute;right:${150 * k}px;top:${ust + 1060 * k}px">${saatCiz(saat, 380 * k, z)}</div>`;
        } else {
            // Guncel tablet karesi yoksa tablet CIZILMEZ (eski arayuz konmaz).
            if (tel) alan += `<div style="position:absolute;left:${110 * k}px;top:${ust + 520 * k}px">${cerceve('telefon', tel.url, 580 * k, k, z, { boyut: tel.boyut, yaricap: telYaricap })}</div>`;
            if (saat) alan += `<div style="position:absolute;right:${100 * k}px;top:${ust + 900 * k}px">${saatCiz(saat, 470 * k, z)}</div>`;
        }
    } else if (yer === 'saat') {
        const s = gorseller.find((g) => g.cihaz === 'wearYuvarlak' || g.cihaz === 'appleWatch');
        const apple = s && s.cihaz === 'appleWatch';
        const cap = 700 * k;
        const ust = cihazUst + 260 * k;
        const merkezX = gen / 2 + 90 * k;
        const merkezY = ust + cap * 0.535;
        // Titresim cizgileri: saatin iki yaninda ucer yay (gorsel anlati).
        let titresim = '';
        [1, 2, 3].forEach((i) => {
            const r = cap * 0.62 + i * 46 * k;
            const op = 0.5 - i * 0.12;
            const yayYol = (yon) => {
                const a1 = (yon * Math.PI) / 2 - 0.42;
                const a2 = (yon * Math.PI) / 2 + 0.42;
                const x1 = merkezX + r * Math.cos(a1);
                const y1 = merkezY + r * Math.sin(a1);
                const x2 = merkezX + r * Math.cos(a2);
                const y2 = merkezY + r * Math.sin(a2);
                return `<path d="M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}" fill="none" stroke="${z.vurgu}" stroke-width="${8 * k}" stroke-linecap="round" opacity="${op}"/>`;
            };
            titresim += yayYol(0) + yayYol(2);
        });
        // Telefon uzakta (komodinde, ekrani kararmis): uyandirma yalniz bilekte.
        const tel = gorseller.find((g) => g.cihaz === 'androidTelefon' || g.cihaz === 'iphone');
        const telHtml = tel
            ? `<div style="position:absolute;left:${-150 * k}px;top:${ust - 140 * k}px;opacity:0.55;filter:brightness(0.4) saturate(0.6);transform:rotate(-8deg)">${cerceve('telefon', tel.url, 500 * k, k, z, { boyut: tel.boyut })}</div>`
            : '';
        alan =
            telHtml +
            (kare.titresim === false ? '' : `<svg style="position:absolute;left:0;top:0" width="${gen}" height="${yuk}">${titresim}</svg>`) +
            (apple
                ? `<div style="position:absolute;left:${merkezX - cap * 0.4}px;top:${ust - 60 * k}px">${appleSaat(s, cap * 0.72, s.boyut, z)}</div>`
                : `<div style="position:absolute;left:${merkezX - cap * 0.57}px;top:${ust}px">${s ? yuvarlakSaat(s, cap, z, true) : ''}</div>`);
        if (kare.rozet) alan += `<div style="position:absolute;left:0;right:0;top:${yuk - 250 * k}px;text-align:center">${rozetHtml(kare.rozet, k, z)}</div>`;
    }
    return belge(gen, yuk, z, yay + metin + alan);
}

/**
 * Yatay (tablet, iPad, TV) kare: baslik USTTE buyuk (tek satir), kisa alt satir, altinda
 * cihazin TAMAMI ortada ve karenin buyuk kismini kaplar (kesilmez). Magazanin kucuk
 * onizlemesinde ekran icerigi okunmayacagi icin istege bagli `yakin` cagri kutusu,
 * ekranin onemli bolgesini buyutulmus bir kartla cihazin ustune bindirir.
 */
function yatay(kare, b, gorseller, cihazTuru) {
    const { gen, yuk } = b;
    const z = ZEMIN[kare.zemin || 'acik'];
    const g = gorseller[0];
    const k = yuk / 1600;
    const yay =
        `<svg style="position:absolute;left:0;top:0" width="${gen}" height="${yuk}">` +
        (z.yildiz ? yildizlar(gen, yuk * 0.4, 70, '#E8F5E9') : '') +
        vakitYayi(gen, yuk * 0.16, k * 0.8, z, kare.vakit) +
        `</svg>`;
    const o = yatayOlcu(b);
    const baslik = kare.baslik.replace(/\n/g, ' ');
    const metin =
        `<div style="position:absolute;left:${gen * 0.05}px;right:${gen * 0.05}px;top:${yuk * 0.07}px;text-align:center">` +
        `<h1 style="font-size:${o.baslikPx}px;line-height:1.05">${esc(baslik)}</h1>` +
        (kare.alt ? `<p class="alt" style="margin:${yuk * 0.014}px auto 0;max-width:${o.altGen}px;font-size:${o.altPx}px;line-height:1.3">${esc(kare.alt)}</p>` : '') +
        `</div>`;
    const tvMi = cihazTuru === 'tv';
    const ust = yuk * (kare.alt ? 0.235 : 0.19);
    const altPay = yuk * 0.035;
    const oran = g ? (g.boyut.yuk * (1 - (kare.kirpAlt || 0))) / g.boyut.gen : 0.6;
    // Cerceve payi: TV'de ayaklik, tablette kenarlik.
    const ekstraYuk = tvMi ? 0.06 : 0.035;
    const cihazGen = Math.min(gen * 0.9, (yuk - ust - altPay) / (oran + ekstraYuk));
    const sol = (gen - cihazGen) / 2;
    const cihaz = g
        ? `<div style="position:absolute;left:${sol}px;top:${ust}px">${cerceve(cihazTuru, g.url, cihazGen, k * 1.4, z, { boyut: g.boyut, kirpAlt: kare.kirpAlt })}</div>`
        : '';
    let ek = '';
    if (kare.rozet)
        ek += `<div style="position:absolute;right:${sol - 40 * k}px;top:${ust + (yuk - ust) * kare.rozet.y - 20 * k}px">${rozetHtml(kare.rozet, k * 1.35, z)}</div>`;
    if (kare.yakin && g) ek += yakinKutusu(kare.yakin, g, cihazGen, sol, ust, gen, yuk, k);
    return belge(gen, yuk, z, yay + metin + cihaz + ek);
}

/** Yatay karenin metin olculeri (test de bunu kullanir). */
function yatayOlcu({ gen, yuk }) {
    return { baslikPx: yuk * 0.082, baslikGen: gen * 0.9, altPx: yuk * 0.034, altGen: gen * 0.8, altSatir: 1 };
}

/**
 * Cagri kutusu: ham karenin `yakin` bolgesini ({x,y,w,h} oranlari) buyutup beyaz kenarli
 * bir kartla cihazin sag alt kosesine bindirir. `yer: 'sol'` sol alta koyar.
 */
function yakinKutusu(y, g, cihazGen, sol, ust, gen, yuk, k) {
    const kartGen = gen * (y.genislik || 0.3);
    const imgGen = kartGen / y.w;
    const imgYuk = imgGen * (g.boyut.yuk / g.boyut.gen);
    const kartYuk = imgYuk * y.h;
    const kenar = 10 * k;
    const x = y.yer === 'sol' ? sol - kartGen * 0.18 : sol + cihazGen - kartGen * 0.82;
    const top = Math.min(yuk - kartYuk - 40 * k, ust + (yuk - ust) * (y.ust ?? 0.45));
    return (
        `<div style="position:absolute;left:${x}px;top:${top}px;width:${kartGen + kenar * 2}px;padding:${kenar}px;border-radius:${36 * k}px;background:#FFFFFF;` +
        `box-shadow:0 ${30 * k}px ${80 * k}px rgba(18,48,27,0.30), 0 0 0 ${3 * k}px ${MARKA.yesil}">` +
        `<div style="position:relative;width:${kartGen}px;height:${kartYuk}px;border-radius:${26 * k}px;overflow:hidden;background:#fff">` +
        `<img src="${g.url}" style="position:absolute;width:${imgGen}px;left:${-y.x * imgGen}px;top:${-y.y * imgYuk}px"></div></div>`
    );
}

/** Saat karesi (Apple Watch 422x514 ya da Wear 1:1): ustte kisa baslik, altta ekran. */
function saatKaresi(kare, b, gorseller, cihazTuru) {
    const { gen, yuk } = b;
    const z = ZEMIN[kare.zemin || 'gece'];
    const g = gorseller[0];
    const k = gen / 422;
    if (cihazTuru === 'wearYuvarlak') {
        const cap = gen * 0.56;
        return belge(
            gen,
            yuk,
            z,
            `<h1 style="position:absolute;left:${gen * 0.08}px;right:${gen * 0.08}px;top:${gen * 0.08}px;text-align:center;font-size:${gen * 0.068}px;line-height:1.12">${satirlar(kare.baslik)}</h1>` +
                `<div style="position:absolute;left:${(gen - cap * 1.14) / 2}px;top:${yuk * 0.3}px">${g ? yuvarlakSaat(g.url, cap, z, false) : ''}</div>`
        );
    }
    const ekGen = 290 * k;
    const oran = g && g.boyut ? g.boyut.yuk / g.boyut.gen : 514 / 422;
    const cerc = 9 * k;
    return belge(
        gen,
        yuk,
        z,
        `<h1 style="position:absolute;left:${22 * k}px;right:${22 * k}px;top:${26 * k}px;text-align:center;font-size:${30 * k}px;line-height:1.14">${satirlar(kare.baslik)}</h1>` +
            `<div style="position:absolute;left:${(gen - ekGen - cerc * 2) / 2}px;top:${128 * k}px;padding:${cerc}px;border-radius:${78 * k}px;background:#1C1D20;box-shadow:0 ${14 * k}px ${30 * k}px ${z.cihazGolge}">` +
            `<div style="position:relative;width:${ekGen}px;height:${ekGen * oran}px;border-radius:${70 * k}px;overflow:hidden;background:#000">${
                g && g.cizim === 'appleUyandirma' ? appleUyandirmaEkrani(ekGen) : g ? `<img src="${g.url}" style="width:100%;display:block">` : ''
            }</div></div>`
    );
}

function sayfaUret(kare, set, gorseller, ikonUrl) {
    if (set.yon === 'dikey') return dikey(kare, { ...set.boyut, platform: set.platform }, gorseller, ikonUrl);
    if (set.yon === 'yatay') return yatay(kare, set.boyut, gorseller, set.cihaz);
    return saatKaresi(kare, set.boyut, gorseller, set.cihaz);
}

/** Play "one cikan gorsel" (1024x500). */
function oneCikanSayfa(ikonUrl, kareUrl) {
    const z = ZEMIN.acik;
    const yay = `<svg style="position:absolute;left:0;top:0" width="1024" height="500">${vakitYayi(1024, 170, 0.42, z, 2)}</svg>`;
    return belge(
        1024,
        500,
        z,
        yay +
            `<div style="position:absolute;left:72px;top:150px;width:520px">` +
            `<div style="width:104px;height:104px;border-radius:24px;overflow:hidden;position:relative;box-shadow:0 14px 30px rgba(22,48,26,0.18)">` +
            `<img src="${ikonUrl}" style="position:absolute;width:${Math.round((104 * 1024) / 685)}px;left:-${Math.round((170 * 104) / 685)}px;top:-${Math.round((172 * 104) / 685)}px"></div>` +
            `<h1 style="margin-top:24px;font-size:62px;line-height:1.05">Namaz Akışı</h1>` +
            `<p class="alt" style="margin-top:12px;font-size:28px;line-height:1.35">Artık namaz kaçırmayın.</p></div>` +
            `<div style="position:absolute;right:84px;top:46px;width:300px;padding:8px;background:#0E0E11;border-radius:44px;box-shadow:0 30px 60px rgba(11,25,14,0.25)">` +
            `<div style="border-radius:37px;overflow:hidden"><img src="${kareUrl}" style="display:block;width:100%"></div></div>`
    );
}

/**
 * Kaba metin olcusu (tarayicisiz): karakter sinifina gore em genisligi. Plus Jakarta
 * Sans 800 + -0.028em aralikla olculen kareler uzerinden ayarlandi (dar ı/i/l/t,
 * genis m/w). Testler tasma riskini bununla olcer; tarayici cizimiyle birebir degil,
 * bilincli olarak biraz COMERT (tasmaya yakin metin testte kalir).
 */
const ORTALAMA_GENISLIK = { baslik: 0.58, alt: 0.5 };
function metinGenisligi(metin, px, kalin = true) {
    let em = 0;
    for (const c of metin) {
        if (/[ıiİIlj.,;:'’!|]/.test(c)) em += 0.28;
        else if (/[tfr ]/.test(c)) em += 0.38;
        else if (/[mwMWŞĞÖÜ]/.test(c)) em += 0.82;
        else if (/[A-ZÇ]/.test(c)) em += 0.66;
        else em += 0.56;
    }
    return em * px * (kalin ? 0.97 : 0.9);
}
function metinOlcusu(set) {
    const { gen, yuk } = set.boyut;
    if (set.yon === 'dikey') {
        const k = gen / 1320;
        return { baslikPx: 118 * k, baslikGen: gen - 2 * 104 * k, altPx: 50 * k, altGen: Math.min(1060 * k, gen - 2 * 104 * k), altSatir: 2 };
    }
    if (set.yon === 'yatay') return yatayOlcu(set.boyut);
    if (set.cihaz === 'wearYuvarlak') return { baslikPx: gen * 0.068, baslikGen: gen * 0.84, altPx: 0, altGen: 1, altSatir: 0 };
    const k = gen / 422;
    return { baslikPx: 30 * k, baslikGen: gen - 44 * k, altPx: 0, altGen: 1, altSatir: 0 };
}

module.exports = { yatayOlcu, kibleKameraEkrani, sayfaUret, oneCikanSayfa, metinOlcusu, metinGenisligi, metinAlti, ORTALAMA_GENISLIK, ZEMIN, MARKA };
