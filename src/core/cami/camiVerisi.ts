/**
 * `NACM` ikili cami verisi çözücüsü — SAF (Kotlin ikizi: `cekirdek/CamiVerisi.kt`).
 * Biçim: `scripts/camiler/BICIM.md`.
 *
 * BOZUK VERİYE DAYANIKLI: sihir/sürüm/uzunluk/CRC/tablo sınırlarından biri
 * tutmazsa `null` döner — "cami verisi yok" durumu, asla fırlatma. Kayıt
 * okuması da her ofseti sınır içinde doğrular (kesik/bozuk ad ya da poligon
 * kaydı o alanı boş bırakır, tüm veriyi düşürmez).
 */
import { ARAMA_AZAMI_M, type CamiKaydi, type LatLng } from './camiTipleri';
import { mesafeM, poligonuOnar } from './geometri';

export const NACM_SIHIR = 'NACM';
export const NACM_SURUM = 1;
const BASLIK = 64;
const KAYIT = 24;
const YOK = 0xffffffff;
const TUR_HARFI = ['n', 'w', 'r'];

let crcTablosu: Uint32Array | null = null;
function crc32(veri: Uint8Array, bas: number, son: number): number {
    if (!crcTablosu) {
        crcTablosu = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            crcTablosu[n] = c >>> 0;
        }
    }
    let crc = 0xffffffff;
    for (let i = bas; i < son; i++) crc = crcTablosu[(crc ^ veri[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

function utf8Coz(veri: Uint8Array, bas: number, uzunluk: number): string {
    // TextDecoder Hermes'te her sürümde yok → küçük, kendi çözücümüz.
    let s = '';
    let i = bas;
    const son = bas + uzunluk;
    while (i < son) {
        const b = veri[i++];
        let kod: number;
        if (b < 0x80) kod = b;
        else if (b >= 0xc0 && b < 0xe0 && i < son) kod = ((b & 0x1f) << 6) | (veri[i++] & 0x3f);
        else if (b >= 0xe0 && b < 0xf0 && i + 1 < son) {
            kod = ((b & 0x0f) << 12) | ((veri[i] & 0x3f) << 6) | (veri[i + 1] & 0x3f);
            i += 2;
        } else if (b >= 0xf0 && i + 2 < son) {
            kod = ((b & 0x07) << 18) | ((veri[i] & 0x3f) << 12) | ((veri[i + 1] & 0x3f) << 6) | (veri[i + 2] & 0x3f);
            i += 3;
        } else {
            kod = 0xfffd;
        }
        s += String.fromCodePoint(kod);
    }
    return s;
}

export interface EnYakinSonuc {
    kayit: CamiKaydi;
    mesafeM: number;
}

export interface CamiVerisi {
    readonly kayitSayisi: number;
    /** Unix saniye */
    readonly veriZamani: number;
    kayit(indeks: number): CamiKaydi;
    /** En yakın K kayıt, mesafeye göre artan. `azamiM`'den uzaktakiler alınmaz. */
    enYakinlar(lat: number, lng: number, k: number, azamiM?: number): EnYakinSonuc[];
}

/** Ham baytları çözer; geçersizse `null`. */
export function camiVerisiniCoz(veri: Uint8Array): CamiVerisi | null {
    try {
        if (veri.length < BASLIK) return null;
        const dv = new DataView(veri.buffer, veri.byteOffset, veri.byteLength);
        const sihir = String.fromCharCode(veri[0], veri[1], veri[2], veri[3]);
        if (sihir !== NACM_SIHIR) return null;
        if (dv.getUint16(4, true) !== NACM_SURUM || dv.getUint16(6, true) !== KAYIT) return null;
        const n = dv.getUint32(8, true);
        const hucre = dv.getUint32(12, true);
        const minLat = dv.getInt32(16, true);
        const minLng = dv.getInt32(20, true);
        const satir = dv.getUint16(24, true);
        const sutun = dv.getUint16(26, true);
        const veriZamani = dv.getUint32(28, true);
        const kayitOf = dv.getUint32(32, true);
        const poligonOf = dv.getUint32(36, true);
        const adOf = dv.getUint32(40, true);
        const izgaraOf = dv.getUint32(44, true);
        const toplam = dv.getUint32(48, true);
        const crc = dv.getUint32(52, true);

        if (toplam !== veri.length || hucre === 0 || satir === 0 || sutun === 0) return null;
        const hucreSayisi = satir * sutun;
        if (izgaraOf !== BASLIK || izgaraOf + (hucreSayisi + 1) * 4 !== kayitOf) return null;
        if (kayitOf + n * KAYIT !== poligonOf || poligonOf > adOf || adOf > toplam) return null;
        if (crc32(veri, BASLIK, veri.length) !== crc) return null;
        // Izgara monoton ve son eleman N olmalı.
        let onceki = 0;
        for (let i = 0; i <= hucreSayisi; i++) {
            const g = dv.getUint32(izgaraOf + i * 4, true);
            if (g < onceki || g > n) return null;
            onceki = g;
        }
        if (onceki !== n) return null;

        const izgara = (i: number): number => dv.getUint32(izgaraOf + i * 4, true);

        const kayitOku = (i: number): CamiKaydi => {
            const o = kayitOf + i * KAYIT;
            const latE6 = dv.getInt32(o, true);
            const lngE6 = dv.getInt32(o + 4, true);
            const idAlt = dv.getUint32(o + 8, true);
            const idUst = dv.getUint8(o + 12);
            const tur = dv.getUint8(o + 13);
            const kose = dv.getUint8(o + 14);
            const yaricap = dv.getUint8(o + 15);
            const polOf = dv.getUint32(o + 16, true);
            const adOfset = dv.getUint32(o + 20, true);

            let ad = '';
            if (adOfset !== YOK && adOf + adOfset < toplam) {
                const uz = veri[adOf + adOfset];
                if (adOf + adOfset + 1 + uz <= toplam) ad = utf8Coz(veri, adOf + adOfset + 1, uz);
            }
            let poligon: LatLng[] | null = null;
            if (polOf !== YOK && kose >= 3 && poligonOf + polOf + kose * 4 <= adOf) {
                poligon = [];
                for (let j = 0; j < kose; j++) {
                    const p = poligonOf + polOf + j * 4;
                    poligon.push([(latE6 + dv.getInt16(p, true)) / 1e6, (lngE6 + dv.getInt16(p + 2, true)) / 1e6]);
                }
            }
            // 40 bitlik kimlik: üst bayt × 2^32 (bit kaydırma 32 bitte taşar).
            const osmId = idUst * 4294967296 + idAlt;
            return {
                id: `osm:${TUR_HARFI[tur] ?? 'n'}${osmId}`,
                ad,
                lat: latE6 / 1e6,
                lng: lngE6 / 1e6,
                yaricapM: yaricap,
                // Kendini kesen halka (eski üretici çıktısı) dış bürüne onarılır — Kotlin ikiziyle aynı.
                poligon: poligon ? poligonuOnar(poligon) : null,
            };
        };

        const hucreLatM = (hucre / 1e6) * 111_195;

        return {
            kayitSayisi: n,
            veriZamani,
            kayit(indeks: number): CamiKaydi {
                if (!Number.isInteger(indeks) || indeks < 0 || indeks >= n) {
                    throw new RangeError(`Kayıt yok: ${indeks}`);
                }
                return kayitOku(indeks);
            },
            enYakinlar(lat: number, lng: number, k: number, azamiM: number = ARAMA_AZAMI_M): EnYakinSonuc[] {
                if (k <= 0 || n === 0 || !Number.isFinite(lat) || !Number.isFinite(lng)) return [];
                const r0 = Math.floor((Math.round(lat * 1e6) - minLat) / hucre);
                const c0 = Math.floor((Math.round(lng * 1e6) - minLng) / hucre);
                // Alt sınır güvenli olsun: ızgaradaki EN DAR boylam hücresiyle hesapla
                // (kuzeyde hücreler daralır; sorgu enlemiyle hesaplamak erken durdururdu).
                const enKuzey = Math.max(Math.abs(lat), Math.abs(minLat / 1e6), Math.abs((minLat + satir * hucre) / 1e6));
                const hucreLngM = hucreLatM * Math.max(0.01, Math.cos((Math.min(89, enKuzey) * Math.PI) / 180));
                const enKucukHucreM = Math.min(hucreLatM, hucreLngM);
                const azamiHalka = Math.ceil(azamiM / enKucukHucreM) + 1;
                const secilen: EnYakinSonuc[] = [];

                const hucreyiTara = (r: number, c: number) => {
                    if (r < 0 || c < 0 || r >= satir || c >= sutun) return;
                    const h = r * sutun + c;
                    for (let i = izgara(h); i < izgara(h + 1); i++) {
                        const o = kayitOf + i * KAYIT;
                        const m = mesafeM(lat, lng, dv.getInt32(o, true) / 1e6, dv.getInt32(o + 4, true) / 1e6);
                        if (m > azamiM) continue;
                        if (secilen.length < k || m < secilen[secilen.length - 1].mesafeM) {
                            const sonuc = { kayit: kayitOku(i), mesafeM: m };
                            let j = secilen.length;
                            while (j > 0 && secilen[j - 1].mesafeM > m) j--;
                            secilen.splice(j, 0, sonuc);
                            if (secilen.length > k) secilen.pop();
                        }
                    }
                };

                for (let halka = 0; halka <= azamiHalka; halka++) {
                    // Bu halkadaki en yakın nokta bile (halka-1) tam hücre ötede.
                    if (secilen.length >= k && (halka - 1) * enKucukHucreM > secilen[secilen.length - 1].mesafeM) break;
                    if (halka === 0) {
                        hucreyiTara(r0, c0);
                        continue;
                    }
                    for (let c = c0 - halka; c <= c0 + halka; c++) {
                        hucreyiTara(r0 - halka, c);
                        hucreyiTara(r0 + halka, c);
                    }
                    for (let r = r0 - halka + 1; r <= r0 + halka - 1; r++) {
                        hucreyiTara(r, c0 - halka);
                        hucreyiTara(r, c0 + halka);
                    }
                    if (r0 - halka < 0 && r0 + halka >= satir && c0 - halka < 0 && c0 + halka >= sutun) break;
                }
                return secilen;
            },
        };
    } catch {
        return null;
    }
}
