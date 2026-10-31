/**
 * "Son algılamalar" zaman çizelgesi — native olay günlüğünü kullanıcının
 * anlayacağı cümlelere çevirir: neden algılandı, neden algılanmadı.
 *
 * Kayıt: uygulamanın kullanıcıyla konuşması → kibar "siz". Bilinmeyen olay
 * türü atlanır (eski/yeni sürüm farkı ekranı bozmasın).
 */
import { AZAMI_DOGRULUK_M } from './camiTipleri';
import { aktifDil, bicim, metin, sayili } from '../dil/aktifDil';

export type OlayTonu = 'iyi' | 'notr' | 'uyari';

export interface OlaySatiri {
    zamanMs: number;
    ikon: string;
    baslik: string;
    aciklama?: string;
    ton: OlayTonu;
}

export interface HamOlay {
    zamanMs: number;
    tur: string;
    [ek: string]: unknown;
}

/** Güven puanı gerekçeleri — "neden sorduk / neden açmadık" (Faz 2). Metinler sözlükte (`cami.olay`). */
const parca = (tablo: Readonly<Record<string, string>>, k: unknown): string | undefined =>
    typeof k === 'string' && Object.prototype.hasOwnProperty.call(tablo, k) ? tablo[k] : undefined;

/**
 * Cümle başını büyütür — `toUpperCase`/`toLocaleUpperCase` YOK (AGENTS.md: 'i' → 'I'
 * tuzağı; Hermes'te Intl'e güvenilmez). Sabit harita; noktalı `i` yalnız Türkçede `İ` olur.
 * Vietnamca: 12 ünlünün yalın ve beş ses işaretli biçimi + đ, NFC anahtarla.
 */
const BUYUK_HARF: Record<string, string> = {
    a: 'A', b: 'B', c: 'C', ç: 'Ç', d: 'D', e: 'E', f: 'F', g: 'G', ğ: 'Ğ', h: 'H', ı: 'I', i: 'İ', j: 'J', k: 'K', // dil-haric: harf eşlemesi (görünen metin değil)
    l: 'L', m: 'M', n: 'N', o: 'O', ö: 'Ö', p: 'P', q: 'Q', r: 'R', s: 'S', ş: 'Ş', t: 'T', u: 'U', ü: 'Ü', v: 'V', w: 'W', x: 'X', y: 'Y', z: 'Z', // dil-haric: harf eşlemesi (görünen metin değil)
    à: 'À', á: 'Á', ả: 'Ả', ã: 'Ã', ạ: 'Ạ', // dil-haric: harf eşlemesi (görünen metin değil)
    ă: 'Ă', ằ: 'Ằ', ắ: 'Ắ', ẳ: 'Ẳ', ẵ: 'Ẵ', ặ: 'Ặ', // dil-haric: harf eşlemesi (görünen metin değil)
    â: 'Â', ầ: 'Ầ', ấ: 'Ấ', ẩ: 'Ẩ', ẫ: 'Ẫ', ậ: 'Ậ', // dil-haric: harf eşlemesi (görünen metin değil)
    è: 'È', é: 'É', ẻ: 'Ẻ', ẽ: 'Ẽ', ẹ: 'Ẹ', // dil-haric: harf eşlemesi (görünen metin değil)
    ê: 'Ê', ề: 'Ề', ế: 'Ế', ể: 'Ể', ễ: 'Ễ', ệ: 'Ệ', // dil-haric: harf eşlemesi (görünen metin değil)
    ì: 'Ì', í: 'Í', ỉ: 'Ỉ', ĩ: 'Ĩ', ị: 'Ị', // dil-haric: harf eşlemesi (görünen metin değil)
    ò: 'Ò', ó: 'Ó', ỏ: 'Ỏ', õ: 'Õ', ọ: 'Ọ', // dil-haric: harf eşlemesi (görünen metin değil)
    ô: 'Ô', ồ: 'Ồ', ố: 'Ố', ổ: 'Ổ', ỗ: 'Ỗ', ộ: 'Ộ', // dil-haric: harf eşlemesi (görünen metin değil)
    ơ: 'Ơ', ờ: 'Ờ', ớ: 'Ớ', ở: 'Ở', ỡ: 'Ỡ', ợ: 'Ợ', // dil-haric: harf eşlemesi (görünen metin değil)
    ù: 'Ù', ú: 'Ú', ủ: 'Ủ', ũ: 'Ũ', ụ: 'Ụ', // dil-haric: harf eşlemesi (görünen metin değil)
    ư: 'Ư', ừ: 'Ừ', ứ: 'Ứ', ử: 'Ử', ữ: 'Ữ', ự: 'Ự', // dil-haric: harf eşlemesi (görünen metin değil)
    ỳ: 'Ỳ', ý: 'Ý', ỷ: 'Ỷ', ỹ: 'Ỹ', ỵ: 'Ỵ', // dil-haric: harf eşlemesi (görünen metin değil)
    đ: 'Đ', // dil-haric: harf eşlemesi (görünen metin değil)
};
/** Latin birleşik aksan işaretleri (U+0300–036F): NFD gelen ilk harfin işaretleri. */
const BIRLESIK_ISARET = /[\u0300-\u036f]/;

export const ilkHarfiBuyut = (m: string): string => {
    if (!m) return m;
    // İlk harf NFD gelmiş olabilir ("a" + U+0302 + U+0300): harf ve işaretleri tek NFC harfe
    // birleştirilip aranır; metnin geri kalanına dokunulmaz.
    let son = 1;
    while (son < m.length && BIRLESIK_ISARET.test(m.charAt(son))) son++;
    if (son > 1) {
        const buyukKume = BUYUK_HARF[m.slice(0, son).normalize('NFC')];
        if (buyukKume !== undefined) return buyukKume + m.slice(son);
    }
    const ilk = m.charAt(0);
    const buyuk = ilk === 'i' && aktifDil() !== 'tr' ? 'I' : BUYUK_HARF[ilk];
    return (buyuk ?? ilk) + m.slice(1);
};

/** "ezan vaktine yakın · caminin binası içinde · duruyordunuz" */
export function guvenGerekcesi(o: Readonly<Record<string, unknown>>): string {
    const m = metin().cami.olay;
    const parcalar = [parca(m.zaman, o.zaman), parca(m.yer, o.yerSinifi), parca(m.hareket, o.hareket)].filter(
        (p): p is string => !!p,
    );
    return parcalar.join(' · ');
}

const dize = (d: unknown): string | null => (typeof d === 'string' && d.trim() ? d.trim() : null);
const sayi = (d: unknown): number | null => (typeof d === 'number' && Number.isFinite(d) ? d : null);

export function olaySatiriOlustur(o: HamOlay): OlaySatiri | null {
    const s = metin().cami;
    const m = s.olay;
    const yer = dize(o.yer) ?? s.camiVarsayilan;
    const t = o.zamanMs;
    switch (o.tur) {
        case 'izlemeKuruldu':
            return {
                zamanMs: t,
                ikon: 'satellite-dish',
                baslik: sayili(m.izlemeKuruldu, sayi(o.sayi) ?? 0),
                aciklama: m.izlemeKurulduAciklama,
                ton: 'notr',
            };
        case 'izinYok':
            return {
                zamanMs: t,
                ikon: 'lock',
                baslik: m.izinYok,
                aciklama:
                    o.izin === 'arkaPlanYok'
                        ? m.izinYokArkaPlan
                        : m.izinYokGenel,
                ton: 'uyari',
            };
        case 'izlemeHatasi':
            return {
                zamanMs: t,
                ikon: 'exclamation-triangle',
                baslik: m.izlemeHatasi,
                aciklama: m.izlemeHatasiAciklama,
                ton: 'uyari',
            };
        case 'dwell':
            return {
                zamanMs: t,
                ikon: 'hourglass-half',
                baslik: sayili(m.dwell, sayi(o.dk) ?? 3, { yer }),
                aciklama: m.dwellAciklama,
                ton: 'notr',
            };
        case 'vakitDisi':
            return {
                zamanMs: t,
                ikon: 'clock',
                baslik: m.vakitDisi,
                aciklama: m.vakitDisiAciklama,
                ton: 'iyi',
            };
        case 'olcum': {
            const dogruluk = sayi(o.dogrulukM);
            const mesafe = sayi(o.mesafeM);
            switch (o.sonuc) {
                case 'camide':
                    return {
                        zamanMs: t,
                        ikon: 'crosshairs',
                        baslik: bicim(m.olcumCamide, { yer }),
                        aciklama: dogruluk != null ? bicim(m.olcumDogruluk, { m: dogruluk }) : undefined,
                        ton: 'iyi',
                    };
                case 'supheli':
                    return {
                        zamanMs: t,
                        ikon: 'question-circle',
                        baslik: m.olcumSupheli,
                        aciklama:
                            dogruluk != null
                                ? bicim(m.olcumSupheliDogruluk, { m: dogruluk, azami: AZAMI_DOGRULUK_M })
                                : bicim(m.olcumSupheliGenel, { azami: AZAMI_DOGRULUK_M }),
                        ton: 'iyi',
                    };
                case 'disarida':
                    return {
                        zamanMs: t,
                        ikon: 'crosshairs',
                        baslik:
                            mesafe != null
                                ? bicim(m.olcumDisarida, { yer, m: mesafe })
                                : m.olcumDisaridaGenel,
                        aciklama: m.olcumDisaridaAciklama,
                        ton: 'iyi',
                    };
                case 'konumYok':
                    return { zamanMs: t, ikon: 'map-marker-alt', baslik: m.konumYok, aciklama: m.modAcilmadi, ton: 'uyari' };
                default:
                    return null;
            }
        }
        case 'guven': {
            const gerekce = guvenGerekcesi(o);
            const tavan = parca(m.tavan, o.tavan);
            const bicimNotu =
                o.bicim === 'sorarak' && o.eylem === 'sor' && o.guvenKarari === 'otomatik'
                    ? m.sorarakNotu
                    : o.bicim === 'otomatik' && o.eylem === 'otomatik' && o.guvenKarari === 'sor'
                      ? m.otomatikNotu
                      : undefined;
            const aciklama = [gerekce ? `${ilkHarfiBuyut(gerekce)}.` : null, tavan, bicimNotu]
                .filter(Boolean)
                .join(' ');
            const baslik =
                o.eylem === 'otomatik'
                    ? bicim(m.guvenYuksek, { yer })
                    : o.eylem === 'sor'
                      ? bicim(m.emin, { yer })
                      : bicim(m.sayilmadi, { yer });
            return {
                zamanMs: t,
                ikon: o.eylem === 'otomatik' ? 'check-double' : o.eylem === 'sor' ? 'question-circle' : 'walking',
                baslik,
                aciklama: aciklama || undefined,
                ton: o.eylem === 'otomatik' ? 'iyi' : 'notr',
            };
        }
        case 'soruldu':
            return {
                zamanMs: t,
                ikon: 'bell',
                baslik: m.soruldu,
                aciklama: m.sorulduAciklama,
                ton: 'notr',
            };
        case 'soruKabul':
            return { zamanMs: t, ikon: 'check', baslik: bicim(m.soruKabul, { yer }), ton: 'iyi' };
        case 'soruRet':
            return {
                zamanMs: t,
                ikon: 'times',
                baslik: bicim(m.soruRet, { yer }),
                aciklama: m.soruRetAciklama,
                ton: 'notr',
            };
        case 'soruCikis':
            return { zamanMs: t, ikon: 'sign-out-alt', baslik: m.soruCikis, ton: 'notr' };
        case 'reddedilmis':
            return {
                zamanMs: t,
                ikon: 'times-circle',
                baslik: m.reddedilmis,
                aciklama: m.olculmedi,
                ton: 'iyi',
            };
        case 'camide': {
            const mod =
                o.mod === 'acildi'
                    ? m.modAcildi
                    : o.mod === 'kullaniciKapatti'
                      ? m.modKullaniciKapatti
                      : o.mod === 'erisimYok'
                        ? m.modErisimYok
                        : m.modSessiz;
            return { zamanMs: t, ikon: 'mosque', baslik: bicim(m.camidesiniz, { yer }), aciklama: mod, ton: 'iyi' };
        }
        case 'cikis':
            return {
                zamanMs: t,
                ikon: 'sign-out-alt',
                baslik: bicim(m.cikis, { yer }),
                aciklama: sayi(o.dk) != null ? sayili(m.cikisSure, sayi(o.dk) as number) : undefined,
                ton: 'iyi',
            };
        case 'sure':
            return {
                zamanMs: t,
                ikon: 'stopwatch',
                baslik: m.sure,
                aciklama: m.sureAciklama,
                ton: 'notr',
            };
        case 'kapatildi':
            return { zamanMs: t, ikon: 'power-off', baslik: m.kapatildi, ton: 'notr' };
        case 'haricTutuldu':
            return {
                zamanMs: t,
                ikon: 'ban',
                baslik: bicim(m.haricTutuldu, { yer }),
                aciklama: m.haricTutulduAciklama,
                ton: 'notr',
            };
        case 'modElleKapatildi':
            return {
                zamanMs: t,
                ikon: 'toggle-off',
                baslik: m.modElleKapatildi,
                aciklama: m.modElleKapatildiAciklama,
                ton: 'notr',
            };
        case 'kildim': {
            const vakit = parca(metin().vakit.adlar, o.vakit);
            return { zamanMs: t, ikon: 'check-circle', baslik: bicim(m.kildim, { vakit: vakit ?? m.namaz }), ton: 'iyi' };
        }
        case 'yenileme':
            if (o.sonuc === 'yenile') {
                return { zamanMs: t, ikon: 'sync-alt', baslik: m.yenile, ton: 'notr' };
            }
            if (o.sonuc === 'bayatKonum') {
                return {
                    zamanMs: t,
                    ikon: 'sync-alt',
                    baslik: m.bayatKonum,
                    ton: 'notr',
                };
            }
            // Native yeniden merkezleme ölçümü (BALANCED, denetim D-09) kaba döndü.
            if (o.sonuc === 'kabaKonum') {
                return {
                    zamanMs: t,
                    ikon: 'sync-alt',
                    baslik: m.kabaKonum,
                    ton: 'notr',
                };
            }
            return null;
        default:
            return null;
    }
}

/** En yeni üstte; tanınmayan olaylar atılır. */
export function zamanCizelgesiOlustur(olaylar: readonly HamOlay[], azami = 30): OlaySatiri[] {
    return olaylar
        .filter((o) => o && typeof o.zamanMs === 'number' && typeof o.tur === 'string')
        .map(olaySatiriOlustur)
        .filter((s): s is OlaySatiri => s != null)
        .sort((a, b) => b.zamanMs - a.zamanMs)
        .slice(0, azami);
}
