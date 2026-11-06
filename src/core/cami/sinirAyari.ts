/**
 * Camideyim algılama SINIRI ayarı — SAF (harita paneli ve yer listesi AYNI kuralı kullanır).
 *
 * İki kip, birbirini dışlar (biri yazılınca öteki silinir):
 *  - BİNA SINIRI (ölçekli): OSM poligonu, kaydın merkezinden k katı (%100–%300).
 *    `YerKaydi.olcek` yazılır; k = 1 iken alan hiç yazılmaz (özgün sınır).
 *  - DAİRE (yarıçap): `YerKaydi.alanM` yazılır; bina sınırının yerine geçer.
 *
 * YAŞANMIŞ HATA (#297 sahip geri bildirimi): eski panelde tek kontrol bir metre
 * stepper'ıydı. Poligonlu camide ilk "+" basışı `alanM` yazıyor, kural gereği
 * (kullanıcı alanı > bina poligonu) bina sınırı SESSİZCE daireye dönüyordu ve
 * `alanM`'yi silen hiçbir yol yoktu (stepper alt sınırı 10 m) → kullanıcı "kendi
 * sınırına" bir daha dönemiyordu. Artık kip açıkça seçilir ve "Özgün sınıra dön"
 * iki alanı birden siler.
 */
import { ALAN_ADIM_M, ALAN_MAX_M, ALAN_MIN_M, OLCEK_MAX, OLCEK_MIN, type YerKaydi } from './camiTipleri';
import { bicim, metin } from '../dil/aktifDil';
import { alanYaricapiM, etkinOlcek } from './geometri';

export type SinirModu = 'bina' | 'daire';

export interface SinirGirdisi {
    /** Kaydın OSM bina poligonu var mı? */
    poligonVar: boolean;
    /** Kaydın (çevrel) yarıçapı (m); 0 = nokta kayıt */
    yaricapM: number;
    alanM: number | null;
    olcek: number | null;
    /** Kullanıcının eklediği yer — özgün sınırı yoktur. */
    kendi: boolean;
}

/** Ekrandaki ölçek adımı (%). */
export const OLCEK_ADIM_YUZDE = 10;

export function sinirModu(g: SinirGirdisi): SinirModu {
    return g.alanM != null || !g.poligonVar ? 'daire' : 'bina';
}

/** Bu bina en fazla kaç kat büyütülebilir (%; adım ızgarasına hizalı, en az 100). */
export function olcekUstYuzde(yaricapM: number): number {
    const ust = etkinOlcek(OLCEK_MAX, yaricapM) * 100;
    return Math.max(100, Math.floor(ust / OLCEK_ADIM_YUZDE + 1e-9) * OLCEK_ADIM_YUZDE);
}

/** Şu an uygulanan ölçek (%; tam sayı). */
export function gorunenOlcekYuzde(g: SinirGirdisi): number {
    return Math.round(etkinOlcek(g.olcek, g.yaricapM) * 100);
}

/** Şu anki alanın "yarıçapı" (m) — daire kipine geçerken başlangıç değeri. */
export function etkinYaricapM(g: SinirGirdisi): number {
    return alanYaricapiM({ ozelAlanM: g.alanM, yaricapM: g.yaricapM, ozelOlcek: g.poligonVar ? g.olcek : null });
}

/** Kayıt kendi verisindeki sınırı mı kullanıyor? (Kullanıcının eklediği yerde anlamsız → true.) */
export function ozgunSinirdaMi(g: SinirGirdisi): boolean {
    if (g.kendi) return true;
    return g.alanM == null && etkinOlcek(g.olcek, g.yaricapM) <= OLCEK_MIN;
}

const dairesel = (m: number): number =>
    Math.min(ALAN_MAX_M, Math.max(ALAN_MIN_M, Math.round(m / ALAN_ADIM_M) * ALAN_ADIM_M));

/** Kip seçimi → yazılacak değişiklik (`undefined` = alan silinir). */
export function kipDegisikligi(g: SinirGirdisi, kip: SinirModu): Partial<YerKaydi> {
    if (kip === 'bina') return { alanM: undefined };
    return { alanM: dairesel(etkinYaricapM(g)), olcek: undefined };
}

/** Ölçek stepper'ı (%) → yazılacak değişiklik. %100 = özgün sınır (alan silinir). */
export function olcekDegisikligi(yuzde: number): Partial<YerKaydi> {
    const k = Math.round(yuzde) / 100;
    return { alanM: undefined, olcek: k > OLCEK_MIN ? Math.min(OLCEK_MAX, k) : undefined };
}

/** Daire stepper'ı (m) → yazılacak değişiklik. */
export function daireDegisikligi(m: number): Partial<YerKaydi> {
    return { alanM: dairesel(m), olcek: undefined };
}

/** "Özgün sınıra dön": iki ayarı da siler — kayıt kendi verisindeki sınıra döner. */
export const OZGUN_SINIR_DEGISIKLIGI: Partial<YerKaydi> = { alanM: undefined, olcek: undefined };

/** Ekran ve ekran okuyucu için tek satırlık durum açıklaması (kibar "siz"). */
export function sinirAciklamasi(g: SinirGirdisi): string {
    const m = metin().cami.sinir;
    if (sinirModu(g) === 'daire') {
        if (g.kendi) return m.kendiDaire;
        return g.poligonVar ? m.binaYerineDaire : m.noktaDaire;
    }
    const yuzde = gorunenOlcekYuzde(g);
    return yuzde > 100 ? bicim(m.buyutulmus, { yuzde }) : m.kendiSinir;
}
