/**
 * Günün selamı — ana ekran başlığındaki küçük etiket ("Bugün" yerine) ve sade görünüm. SAF.
 *
 * Tek metin döner ya da `null` (etiket "Bugün"e döner). Öncelik SABİT (en özelden genele):
 *   1. sahur (Ramazan gecesi, gece yarısından sonra yatsı sürerken)  "Hayırlı sahurlar"
 *   2. bayram                                                         "Bayramınız mübarek olsun"
 *   3. iftar (Ramazan günü, akşam vakti)                              "Hayırlı iftarlar"
 *   4. Kadir Gecesi / kandil                                          "… mübarek olsun"
 *   5. arefe                                                          "Hayırlı arefeler"
 *   6. hicrî yılbaşı                                                  "Hicri yılbaşınız mübarek olsun"
 *   7. cuma                                                           "Hayırlı cumalar"
 *   8. Ramazan                                                        "Hayırlı Ramazanlar"
 *   9. sabah vakti                                                    "Hayırlı sabahlar"
 *
 * Özel günler yalnız Diyanet tablosundan (`ozelGunler.ts`); tablo dışında yalnız cuma ve sabah.
 * Aşure günü bilinçli olarak YOK: Muharrem matemi tutan kullanıcı için "mübarek olsun" kırıcıdır.
 * Kaygı/suçlama yok, emir yok: selam karşılıklı bir nezakettir, arayüz kaydında ("siz").
 */
import { aktifDil, canli } from '../dil/aktifDil';
import type { DilKodu } from '../dil/diller';
import type { Sozluk } from '../dil/sozluk/tr';
import { ozelGunBul, ramazanGunuMu, type KandilGecesi } from './ozelGunler';
import { bilinenVakitSirasi } from './kabulDuasi';

export interface SelamGirdisi {
    /** Gösterilen NAMAZ GÜNÜ (gece yarısından sonra yatsı sürerken dündür). */
    tarihIso: string;
    /** Cihazın şu anki TAKVİM günü (sahur için). Verilmezse `tarihIso`. */
    takvimGunuIso?: string;
    /** İçinde bulunulan vakit ('imsak' | 'Sabah' | 'aksam' | ...). Bilinmiyorsa verilmez. */
    vakit?: string;
    /** Kullanıcının bulunduğu ülke (ISO-3166 alfa-2, konum kaydından). Bilinmiyorsa dil kuralı. */
    ulkeKodu?: string | null;
}

/** ISO gün → haftanın günü (0 = pazar), UTC ile (saat dilimi kaydırmaz). */
function haftaGunu(tarihIso: string): number {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarihIso);
    if (!m) return -1;
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

export const SELAMLAR: Readonly<Sozluk['samimiyet']['selamlar']> = canli((s) => s.samimiyet.selamlar);

/** Gece başına kandil selamı (Türkçede dördü de "Kandiliniz mübarek olsun"). */
export const KANDIL_SELAMLARI: Readonly<Sozluk['samimiyet']['kandilGeceleri']> = canli((s) => s.samimiyet.kandilGeceleri);

/**
 * Kandil ve hicrî yılbaşı selamı ÜLKEYE göredir (sahip kararı 2026-10-24); kandilde GECE başına
 * (sahip kararı 2026-10-24, ikinci karar). Ölçüt: gece o ülkede resmî tatil ya da resmî din
 * kurumunun takviminde. Osmanlı mirası ülkeler (Türkiye, Kıbrıs, Balkanlar, Kafkasya ve Orta
 * Asya) dört geceyi de anar; Mevlid Endonezya, Malezya, Pakistan, Bangladeş ve Mısır'da devlet
 * tatili, Miraç Endonezya'da (Malezya'da eyalet tatili), Berat Bangladeş'te. Körfez'de kapalı
 * (kutlama bid'at sayılır). Kaynaklar: `docs/ajan/ana-ekran-ve-ayarlar.md > Samimiyet`.
 * Ülke bilinmiyorsa dil kuralı: yalnız Türkçede.
 */
const OSMANLI_MIRASI: readonly string[] = [
    'TR', 'CY', // Türkiye, Kıbrıs
    'BA', 'AL', 'XK', 'MK', 'BG', 'RS', 'ME', 'GR', 'RO', // Balkanlar
    'AZ', 'KZ', 'KG', 'UZ', 'TM', 'TJ', // Kafkasya ve Orta Asya
];
const KANDIL_ULKELERI: Readonly<Record<KandilGecesi, ReadonlySet<string>>> = {
    regaib: new Set(OSMANLI_MIRASI),
    mirac: new Set([...OSMANLI_MIRASI, 'ID', 'MY']),
    berat: new Set([...OSMANLI_MIRASI, 'BD']),
    mevlid: new Set([...OSMANLI_MIRASI, 'ID', 'MY', 'PK', 'BD', 'EG']),
};
const GELENEK_SELAMI_ULKELERI: ReadonlySet<string> = new Set(OSMANLI_MIRASI);
const GELENEK_SELAMI_DILLERI: readonly DilKodu[] = ['tr'];

/** Bu kullanıcıya hicrî yılbaşı selamı söylenir mi? (Kandil için `kandilSelamiSoylenir`.) */
export function gelenekSelamiSoylenir(ulkeKodu?: string | null): boolean {
    return ulkeKodu ? GELENEK_SELAMI_ULKELERI.has(ulkeKodu) : GELENEK_SELAMI_DILLERI.includes(aktifDil());
}

/** Bu kullanıcıya bu kandil gecesinin selamı söylenir mi? */
export function kandilSelamiSoylenir(gece: KandilGecesi, ulkeKodu?: string | null): boolean {
    return ulkeKodu ? KANDIL_ULKELERI[gece].has(ulkeKodu) : GELENEK_SELAMI_DILLERI.includes(aktifDil());
}

export function gunSelami({ tarihIso, takvimGunuIso, vakit, ulkeKodu }: SelamGirdisi): string | null {
    const takvim = takvimGunuIso ?? tarihIso;
    const sira = bilinenVakitSirasi(vakit);

    if (sira === 4 && takvim > tarihIso && ramazanGunuMu(takvim)) return SELAMLAR.sahur;

    const ozel = ozelGunBul(tarihIso);
    if (ozel && (ozel.tur === 'ramazanBayrami' || ozel.tur === 'kurbanBayrami')) return SELAMLAR.bayram;

    const ramazan = ramazanGunuMu(tarihIso);
    if (ramazan && sira === 3) return SELAMLAR.iftar;

    if (ozel?.tur === 'kadir') return SELAMLAR.kadir;
    if (ozel?.tur === 'kandil' && ozel.gece && kandilSelamiSoylenir(ozel.gece, ulkeKodu)) {
        return KANDIL_SELAMLARI[ozel.gece];
    }
    if (ozel?.tur === 'arefe') return SELAMLAR.arefe;
    if (ozel?.tur === 'hicriYilbasi' && gelenekSelamiSoylenir(ulkeKodu)) return SELAMLAR.hicriYilbasi;

    if (haftaGunu(tarihIso) === 5) return SELAMLAR.cuma;
    if (ramazan) return SELAMLAR.ramazan;
    if (sira === 0) return SELAMLAR.sabah;
    return null;
}
