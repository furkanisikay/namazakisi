/**
 * Pazarlama gorsellerindeki kucuk ikonlar (24x24, cizgi). Elle cizildi; harici
 * ikon paketi yok (lisans ve CDN bagimliligi olmasin).
 */
const YOL = {
    zil: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    alarm:
        '<circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.5 2"/><path d="M4 5.5 6.5 3M20 5.5 17.5 3"/><path d="M7 19.5 5.5 21M17 19.5 18.5 21"/>',
    ay: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    titresim:
        '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 8v8M2 10v4M20 8v8M22 10v4"/>',
    hediye: '<path d="M4 11h16v9H4z"/><path d="M3 7h18v4H3zM12 7v13"/><path d="M12 7c-2-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3-2-5 1z"/>',
    kilit: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    bulutYok:
        '<path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.2 9.6 4.2 4.2 0 0 0 7 18z"/><path d="M4 4l16 16"/>',
    kod: '<path d="M9 7 4 12l5 5M15 7l5 5-5 5"/>',
    kabe: '<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/><path d="M4 11l8 4 8-4"/>',
    yildiz: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    tik: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};

function ikon(ad, renk, boyut) {
    const yol = YOL[ad];
    if (!yol) throw new Error('bilinmeyen ikon: ' + ad);
    return `<svg width="${boyut}" height="${boyut}" viewBox="0 0 24 24" fill="none" stroke="${renk}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${yol}</svg>`;
}

module.exports = { ikon, IKON_ADLARI: Object.keys(YOL) };
