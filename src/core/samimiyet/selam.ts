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
import { ozelGunBul, ramazanGunuMu } from './ozelGunler';
import { bilinenVakitSirasi } from './kabulDuasi';

export interface SelamGirdisi {
    /** Gösterilen NAMAZ GÜNÜ (gece yarısından sonra yatsı sürerken dündür). */
    tarihIso: string;
    /** Cihazın şu anki TAKVİM günü (sahur için). Verilmezse `tarihIso`. */
    takvimGunuIso?: string;
    /** İçinde bulunulan vakit ('imsak' | 'Sabah' | 'aksam' | ...). Bilinmiyorsa verilmez. */
    vakit?: string;
}

/** ISO gün → haftanın günü (0 = pazar), UTC ile (saat dilimi kaydırmaz). */
function haftaGunu(tarihIso: string): number {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarihIso);
    if (!m) return -1;
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

export const SELAMLAR: Readonly<Sozluk['samimiyet']['selamlar']> = canli((s) => s.samimiyet.selamlar);

/**
 * Kandil ve hicrî yılbaşı selamı Türkiye geleneğidir: başka dilde (Körfez, Güney Asya,
 * Batı) bu geceleri kutlamak tartışmalıdır ve kullanıcıyı kırabilir (aşure kararıyla aynı
 * gerekçe) → o dillerde o gün yalnız genel selamlar (cuma, Ramazan) kalır.
 */
const GELENEK_SELAMI_DILLERI: readonly DilKodu[] = ['tr'];

export function gunSelami({ tarihIso, takvimGunuIso, vakit }: SelamGirdisi): string | null {
    const takvim = takvimGunuIso ?? tarihIso;
    const sira = bilinenVakitSirasi(vakit);

    if (sira === 4 && takvim > tarihIso && ramazanGunuMu(takvim)) return SELAMLAR.sahur;

    const ozel = ozelGunBul(tarihIso);
    if (ozel && (ozel.tur === 'ramazanBayrami' || ozel.tur === 'kurbanBayrami')) return SELAMLAR.bayram;

    const ramazan = ramazanGunuMu(tarihIso);
    if (ramazan && sira === 3) return SELAMLAR.iftar;

    if (ozel?.tur === 'kadir') return SELAMLAR.kadir;
    const gelenek = GELENEK_SELAMI_DILLERI.includes(aktifDil());
    if (ozel?.tur === 'kandil' && gelenek) return SELAMLAR.kandil;
    if (ozel?.tur === 'arefe') return SELAMLAR.arefe;
    if (ozel?.tur === 'hicriYilbasi' && gelenek) return SELAMLAR.hicriYilbasi;

    if (haftaGunu(tarihIso) === 5) return SELAMLAR.cuma;
    if (ramazan) return SELAMLAR.ramazan;
    if (sira === 0) return SELAMLAR.sabah;
    return null;
}
