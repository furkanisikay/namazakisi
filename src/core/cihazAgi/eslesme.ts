/**
 * Cihaz ağı eşleştirmesi (v2) — QR ve eşleştirme mesajları. Tasarım §4.1.
 *
 * QR yalnız GEÇİCİ bir eşleştirme sırrı taşır; kalıcı anahtar QR'da YOKTUR:
 *   `namazakisi://tv?v=2&a=<özel IPv4>&p=<port>&i=<alıcı kimliği 16 hex>&s=<sır base64url 43>&d=<alıcı adı>`
 * Akış (sunucusuz, yerel ağ):
 * 1. Telefon önce KENDİ ekranında onay ister: "Şu cihaza bağlanıyorsunuz: <d>".
 * 2. `POST /esle` — sırla şifreli `{cihaz, ist}` (AAD `esle|2|i|istek`). Alıcı 202 döner ve
 *    kumandayla "Bu telefonu ekleyelim mi?" sorar.
 * 3. Telefon `POST /esle-durum {ist}` ile yoklar; yanıt sırla şifreli (AAD `esle|2|i|yanit|ist`):
 *    `{durum:'bekliyor'|'onay'|'red', u?, k?, tvAdi?}`. Onayda üyeye ÖZEL 32 bayt anahtar gelir.
 * 4. Alıcı her başarılı eşleşmede sırrı (ve QR'ı) yeniler.
 * Kalan risk: sahte afiş QR'ı + aynı ağdaki saldırgan cihaz → telefon onayı alıcı adını gösterir;
 * kullanıcı yanlış cihazı onaylarsa durumu o cihaza gider.
 *
 * `a` YALNIZ özel IPv4 (v1 dersi). v1 QR'ı (yalnız konum, #359) artık üretilmez; okunursa
 * `eslesmeQrCoz` `null` döner ve ekran "TV uygulamasını güncelleyin" der.
 */
import { ozelIpv4Mu } from '../tv/eslemeBaglantisi';
import { base64UrlCoz, base64Yaz } from './kanal';

export const ESLESME_SURUMU = 2;

export interface EslesmeQr {
    /** `tv`: Android TV panosu (yalnız alıcı). `cihaz`: tablet/telefon (çift yönlü). */
    tur: 'tv' | 'cihaz';
    /** Yalnız `cihaz` QR'ında: gösteren cihazın türü (`t`), Cihazlarım'da doğru simge/ad için. */
    aliciTuru?: 'tablet' | 'telefon';
    adres: string;
    port: number;
    aliciKimlik: string;
    sir: Uint8Array;
    aliciAdi: string;
}

const DESEN = /^namazakisi:\/\/(tv|cihaz)\/?\?(.*)$/i;

function sorgu(metin: string): Record<string, string> {
    const sonuc: Record<string, string> = {};
    for (const parca of metin.split('&')) {
        const e = parca.indexOf('=');
        if (e <= 0) continue;
        try {
            sonuc[parca.slice(0, e)] = decodeURIComponent(parca.slice(e + 1).replace(/\+/g, ' '));
        } catch {
            return {};
        }
    }
    return sonuc;
}

/** QR'ın sürümü (v1/v2 ayrımı ekranda yön göstermek için); bizim QR değilse `null`. */
export function tvQrSurumu(metin: string | null | undefined): number | null {
    const m = metin ? DESEN.exec(metin.trim()) : null;
    if (!m) return null;
    const v = Number(sorgu(m[2]).v);
    return Number.isInteger(v) ? v : null;
}

export function eslesmeQrCoz(metin: string | null | undefined): EslesmeQr | null {
    const m = metin ? DESEN.exec(metin.trim()) : null;
    if (!m) return null;
    const s = sorgu(m[2]);
    const tur = m[1].toLowerCase() === 'cihaz' ? 'cihaz' : 'tv';
    if (s.v !== String(ESLESME_SURUMU)) return null;
    if (!s.a || !ozelIpv4Mu(s.a)) return null;
    if (!/^\d{4,5}$/.test(s.p ?? '')) return null;
    const port = Number(s.p);
    if (port < 1024 || port > 65535) return null;
    if (!/^[0-9a-f]{16}$/.test(s.i ?? '')) return null;
    if (!/^[A-Za-z0-9_-]{43}$/.test(s.s ?? '')) return null;
    let sir: Uint8Array;
    try {
        sir = base64UrlCoz(s.s);
    } catch {
        return null;
    }
    if (sir.length !== 32) return null;
    const ad = (s.d ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || (tur === 'tv' ? 'Televizyon' : 'Tablet');
    return {
        tur,
        ...(tur === 'cihaz' ? { aliciTuru: s.t === 'telefon' ? ('telefon' as const) : ('tablet' as const) } : {}),
        adres: s.a,
        port,
        aliciKimlik: s.i,
        sir,
        aliciAdi: ad,
    };
}

/** Çift yönlü cihaz (tablet/telefon) QR'ı: `namazakisi://cihaz?v=2&a&p&i&s&d` (sır base64url, dolgusuz). */
export function cihazQrYaz(q: Omit<EslesmeQr, 'tur'>): string {
    const sir = base64Yaz(q.sir).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return (
        `namazakisi://cihaz?v=${ESLESME_SURUMU}&a=${q.adres}&p=${q.port}&i=${q.aliciKimlik}` +
        `&s=${sir}&d=${encodeURIComponent(q.aliciAdi.slice(0, 40))}&t=${q.aliciTuru ?? 'tablet'}`
    );
}

export type EslesmeDurumu =
    | { durum: 'bekliyor' }
    | { durum: 'red' }
    | { durum: 'onay'; uye: string; anahtar: string; aliciAdi: string };

/** Alıcının çözülmüş eşleştirme yanıtını doğrular (şekil bozuksa `null`). */
export function eslesmeYanitiniCoz(duz: string | null): EslesmeDurumu | null {
    if (!duz) return null;
    try {
        const o = JSON.parse(duz) as { durum?: unknown; u?: unknown; k?: unknown; tvAdi?: unknown };
        if (o.durum === 'bekliyor' || o.durum === 'red') return { durum: o.durum };
        if (o.durum === 'onay' && typeof o.u === 'string' && /^[0-9a-f]{16}$/.test(o.u) && typeof o.k === 'string') {
            return { durum: 'onay', uye: o.u, anahtar: o.k, aliciAdi: typeof o.tvAdi === 'string' ? o.tvAdi.slice(0, 40) : 'Televizyon' };
        }
    } catch {
        // aşağıya
    }
    return null;
}
