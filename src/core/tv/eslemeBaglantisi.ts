/**
 * TV eşleştirme bağlantısı (QR yolu): TV ekranda bir QR gösterir, telefon okur ve
 * konumu AYNI YEREL AĞDAKİ TV'ye doğrudan gönderir. Sunucu, hesap, bulut YOK.
 *
 * QR metni: `namazakisi://tv?v=1&a=<TV IPv4>&p=<port>&k=<16 onaltılık anahtar>`
 * - `a` YALNIZ özel IPv4 aralığında kabul edilir (10/8, 172.16/12, 192.168/16): bir afişe
 *   basılmış kötü niyetli QR telefonun konumunu internetteki bir sunucuya yollatamasın.
 * - `k` tek seferlik; TV yalnız eşleştirme ekranı açıkken dinler ve anahtar tutmayan
 *   isteği reddeder.
 *
 * Telefon `POST /esle` ile JSON gövde yollar: `{v, k, ad, lat, lng}`. TV `{ok:true}` ya da
 * `{ok:false, hata:'anahtar'|'veri'}` döner.
 *
 * İkizi: `tv/.../cekirdek/EslemeProtokolu.kt`; ortak fikstür `esleme-ornekleri.json`.
 * Saf modül: React Native/expo import ETMEZ.
 */

export const ESLEME_SURUMU = 1;
export const ESLEME_YOLU = '/esle';
export const ESLEME_AD_AZAMI = 60;

export interface TvBaglantisi {
    adres: string;
    port: number;
    anahtar: string;
}

export interface EslemeYuku {
    ad: string;
    lat: number;
    lng: number;
}

const QR_DESENI = /^namazakisi:\/\/tv\/?\?(.*)$/i;

function sorguyuAyristir(sorgu: string): Record<string, string> {
    const sonuc: Record<string, string> = {};
    for (const parca of sorgu.split('&')) {
        const esit = parca.indexOf('=');
        if (esit <= 0) continue;
        const anahtar = parca.slice(0, esit);
        let deger = parca.slice(esit + 1);
        try {
            deger = decodeURIComponent(deger);
        } catch {
            return {};
        }
        sonuc[anahtar] = deger;
    }
    return sonuc;
}

/** Yalnız özel (RFC 1918) IPv4 adreslerini kabul eder. */
export function ozelIpv4Mu(adres: string): boolean {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(adres);
    if (!m) return false;
    const o = m.slice(1).map(Number);
    if (o.some((x) => x > 255)) return false;
    if (o[0] === 10) return true;
    if (o[0] === 192 && o[1] === 168) return true;
    if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;
    return false;
}

/** TV'nin QR metnini çözer; bizim TV QR'ı değilse ya da güvenli değilse `null`. */
export function tvQrCoz(metin: string | null | undefined): TvBaglantisi | null {
    if (!metin) return null;
    const m = QR_DESENI.exec(metin.trim());
    if (!m) return null;
    const s = sorguyuAyristir(m[1]);
    if (s.v !== String(ESLEME_SURUMU)) return null;
    if (!s.a || !ozelIpv4Mu(s.a)) return null;
    if (!/^\d{4,5}$/.test(s.p ?? '')) return null;
    const port = Number(s.p);
    if (port < 1024 || port > 65535) return null;
    if (!/^[0-9a-f]{16}$/.test(s.k ?? '')) return null;
    return { adres: s.a, port, anahtar: s.k };
}

/** `namazakisi://tv?...` bağlantısı mı (derin bağlantı süzgeci için; doğrulama yapmaz). */
export function tvBaglantisiMi(url: string | null | undefined): boolean {
    return !!url && QR_DESENI.test(url.trim());
}

/** Gönderilecek adı TV'nin kabul edeceği biçime indirir (denetim karakteri yok, ≤ 60). */
export function eslemeAdiniTemizle(ad: string): string {
    let temiz = '';
    for (const c of ad) {
        const kod = c.codePointAt(0) ?? 0;
        if (kod >= 0x20 && kod !== 0x7f) temiz += c;
    }
    temiz = temiz.trim();
    return Array.from(temiz).slice(0, ESLEME_AD_AZAMI).join('').trim();
}

export function eslemeGovdesiOlustur(baglanti: TvBaglantisi, yuk: EslemeYuku): string {
    return JSON.stringify({
        v: ESLEME_SURUMU,
        k: baglanti.anahtar,
        ad: eslemeAdiniTemizle(yuk.ad),
        lat: Math.round(yuk.lat * 1e5) / 1e5,
        lng: Math.round(yuk.lng * 1e5) / 1e5,
    });
}

export type EslemeYaniti = { ok: true } | { ok: false; hata: 'anahtar' | 'veri' | 'bilinmiyor' };

/** TV'nin yanıt gövdesini çözer; anlaşılmayan yanıt `bilinmiyor` sayılır. */
export function eslemeYanitiniCoz(govde: string): EslemeYaniti {
    try {
        const o = JSON.parse(govde) as { ok?: unknown; hata?: unknown };
        if (o && o.ok === true) return { ok: true };
        if (o && (o.hata === 'anahtar' || o.hata === 'veri')) return { ok: false, hata: o.hata };
    } catch {
        // aşağıya düş
    }
    return { ok: false, hata: 'bilinmiyor' };
}
